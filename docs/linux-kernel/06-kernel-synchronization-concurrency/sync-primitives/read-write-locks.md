---
sidebar_position: 3
---

# Read-Write Locks

Master read-write locks in the Linux kernel, understanding how to optimize synchronization for read-heavy workloads on the Rock 5B+ platform.

## What are Read-Write Locks?

**What**: Read-write locks (rwlocks) are synchronization primitives that allow multiple concurrent readers or a single exclusive writer, optimizing for read-heavy workloads.

**Why**: Understanding read-write locks is crucial because:

- **Read scalability** - Multiple readers can access simultaneously
- **Performance** - Better than exclusive locks for read-heavy loads
- **Data protection** - Still provides exclusive write access
- **Flexibility** - Adapts to access patterns
- **Rock 5B+ development** - ARM64 multi-core read optimization
- **Professional development** - Essential for scalable systems

**When**: Read-write locks are used when:

- **Read-heavy workloads** - Many readers, few writers
- **Shared data** - Data accessed more than modified
- **Scalability needed** - Multi-core read performance
- **Cache-friendly** - Readers don't invalidate caches
- **Multi-core systems** - Rock 5B+ 8-core optimization
- **ARM64 platforms** - ARM64 cache coherency benefits

**How**: Read-write locks work by:

- **Reader tracking** - Counting active readers
- **Writer exclusion** - Only one writer allowed
- **Reader precedence** - Usually favor readers
- **Atomic operations** - Thread-safe count updates
- **Memory barriers** - Proper ordering guarantees
- **Wait queues** - Managing blocked writers

**Where**: Read-write locks are found in:

- **File systems** - Directory and inode operations
- **Network stack** - Routing table lookups
- **Memory management** - Page table access
- **Device drivers** - Configuration data
- **Kernel subsystems** - Read-mostly data structures
- **Rock 5B+** - ARM64 kernel synchronization

## Spinlock-based Read-Write Locks

**What**: rwlock_t provides read-write locking with spinlock semantics for short critical sections.

**Why**: Understanding rwlock_t is important because:

- **Low overhead** - Spinlock-based implementation
- **Interrupt context** - Can be used in interrupts
- **No sleeping** - Busy-wait like spinlocks
- **Multi-core performance** - Scales with readers

**How**: rwlock_t works through:

```c
// Example: Read-write spinlock usage
#include <linux/rwlock.h>

// 1. Define and initialize rwlock
static DEFINE_RWLOCK(my_rwlock);

// Alternative initialization
static rwlock_t my_rwlock2 = __RW_LOCK_UNLOCKED(my_rwlock2);

// 2. Reader access
void read_data(void) {
    // Acquire read lock
    read_lock(&my_rwlock);

    // Multiple readers can execute concurrently
    value = shared_data;
    process_value(value);

    // Release read lock
    read_unlock(&my_rwlock);
}

// 3. Writer access
void write_data(int new_value) {
    // Acquire write lock (exclusive)
    write_lock(&my_rwlock);

    // Only one writer, no readers
    shared_data = new_value;

    // Release write lock
    write_unlock(&my_rwlock);
}

// 4. Read lock with interrupt disabling
void read_lock_irq_example(void) {
    unsigned long flags;

    // Disable interrupts and acquire read lock
    read_lock_irqsave(&my_rwlock, flags);

    // Read data safely
    process_shared_data();

    // Release and restore interrupts
    read_unlock_irqrestore(&my_rwlock, flags);
}

// 5. Write lock with interrupt disabling
void write_lock_irq_example(void) {
    unsigned long flags;

    // Disable interrupts and acquire write lock
    write_lock_irqsave(&my_rwlock, flags);

    // Modify data exclusively
    update_shared_data();

    // Release and restore interrupts
    write_unlock_irqrestore(&my_rwlock, flags);
}

// 6. Bottom-half variants
void rwlock_bh_example(void) {
    // Read lock with BH disabled
    read_lock_bh(&my_rwlock);
    process_data();
    read_unlock_bh(&my_rwlock);

    // Write lock with BH disabled
    write_lock_bh(&my_rwlock);
    update_data();
    write_unlock_bh(&my_rwlock);
}

// 7. Try-lock variants
int rwlock_try_example(void) {
    // Try to acquire read lock
    if (read_trylock(&my_rwlock)) {
        process_data();
        read_unlock(&my_rwlock);
        return 0;
    }

    // Try to acquire write lock
    if (write_trylock(&my_rwlock)) {
        update_data();
        write_unlock(&my_rwlock);
        return 0;
    }

    return -EBUSY;
}
```

**Explanation**:

- **read_lock/unlock** - Reader lock operations
- **write_lock/unlock** - Writer lock operations
- **\_irqsave variants** - Disable interrupts
- **\_bh variants** - Disable bottom halves
- **\_trylock** - Non-blocking attempts

## Sleeping Read-Write Semaphores

**What**: rw_semaphore (rwsem) provides read-write locking with sleeping semantics for longer critical sections.

**Why**: Understanding rwsem is important because:

- **Efficiency** - Sleeps instead of spinning
- **Longer sections** - Better for longer critical sections
- **Fair queuing** - Prevents writer starvation
- **Priority boost** - Supports priority inheritance

**How**: rw_semaphore works through:

```c
// Example: Read-write semaphore usage
#include <linux/rwsem.h>

// 1. Define and initialize rwsem
static DECLARE_RWSEM(my_rwsem);

// Alternative initialization
static struct rw_semaphore my_rwsem2;
init_rwsem(&my_rwsem2);

// 2. Reader access
void rwsem_read_example(void) {
    // Acquire read lock (may sleep)
    down_read(&my_rwsem);

    // Read data - multiple readers allowed
    process_shared_data();

    // Release read lock
    up_read(&my_rwsem);
}

// 3. Writer access
void rwsem_write_example(void) {
    // Acquire write lock (may sleep, exclusive)
    down_write(&my_rwsem);

    // Modify data exclusively
    update_shared_data();

    // Release write lock
    up_write(&my_rwsem);
}

// 4. Try-lock variants
int rwsem_trylock_example(void) {
    // Try to acquire read lock (non-blocking)
    if (down_read_trylock(&my_rwsem)) {
        process_data();
        up_read(&my_rwsem);
        return 0;
    }

    // Try to acquire write lock (non-blocking)
    if (down_write_trylock(&my_rwsem)) {
        update_data();
        up_write(&my_rwsem);
        return 0;
    }

    return -EBUSY;
}

// 5. Interruptible variants
int rwsem_interruptible_example(void) {
    int ret;

    // Acquire write lock, can be interrupted
    ret = down_write_killable(&my_rwsem);
    if (ret)
        return ret;

    update_data();
    up_write(&my_rwsem);

    return 0;
}

// 6. Practical example: directory operations
struct directory {
    struct rw_semaphore lock;
    struct list_head entries;
    int entry_count;
};

// Read operation: lookup entry
struct entry *lookup_entry(struct directory *dir, const char *name) {
    struct entry *e;

    down_read(&dir->lock);

    list_for_each_entry(e, &dir->entries, list) {
        if (strcmp(e->name, name) == 0) {
            up_read(&dir->lock);
            return e;
        }
    }

    up_read(&dir->lock);
    return NULL;
}

// Write operation: add entry
int add_entry(struct directory *dir, struct entry *new_entry) {
    down_write(&dir->lock);

    list_add_tail(&new_entry->list, &dir->entries);
    dir->entry_count++;

    up_write(&dir->lock);
    return 0;
}

// Read operation: count entries
int count_entries(struct directory *dir) {
    int count;

    down_read(&dir->lock);
    count = dir->entry_count;
    up_read(&dir->lock);

    return count;
}
```

**Explanation**:

- **down_read/up_read** - Reader lock operations
- **down_write/up_write** - Writer lock operations
- **\_trylock** - Non-blocking variants
- **\_killable** - Interruptible by fatal signals
- **Sleeping** - Threads sleep when waiting

## Lock Upgrade and Performance

**What**: Lock upgrade refers to attempting to convert a read lock to a write lock, which is not directly supported but can be emulated.

**Why**: Understanding lock upgrade is important because:

- **Deadlock potential** - Upgrade can cause deadlocks
- **Performance** - Proper patterns avoid overhead
- **Alternatives** - Better approaches available
- **Common pitfall** - Avoiding upgrade mistakes

**How**: Lock upgrade patterns work through:

```c
// Example: Lock upgrade patterns

// 1. WRONG: Attempting direct upgrade (can deadlock)
void bad_upgrade_pattern(void) {
    down_read(&my_rwsem);

    // Check condition
    if (needs_modification()) {
        // DEADLOCK: Already hold read lock!
        down_write(&my_rwsem);  // Will deadlock
        modify_data();
        up_write(&my_rwsem);
    }

    up_read(&my_rwsem);
}

// 2. CORRECT: Release and reacquire pattern
int correct_upgrade_pattern(void) {
    int ret = 0;

    down_read(&my_rwsem);

    if (needs_modification()) {
        // Release read lock
        up_read(&my_rwsem);

        // Acquire write lock
        down_write(&my_rwsem);

        // Re-check condition (may have changed)
        if (still_needs_modification()) {
            modify_data();
        }

        up_write(&my_rwsem);
        return 0;
    }

    up_read(&my_rwsem);
    return ret;
}

// 3. Optimistic locking pattern
int optimistic_pattern(void) {
    // Try write lock first if likely to modify
    if (likely_to_modify()) {
        down_write(&my_rwsem);

        if (needs_modification()) {
            modify_data();
        } else {
            // Downgrade to read (release and reacquire)
            up_write(&my_rwsem);
            down_read(&my_rwsem);
            read_data();
            up_read(&my_rwsem);
        }

        return 0;
    }

    // Otherwise start with read lock
    down_read(&my_rwsem);
    read_data();
    up_read(&my_rwsem);

    return 0;
}

// 4. RCU alternative for read-heavy workloads
void rcu_alternative(void) {
    struct data *ptr;

    // Read path (lockless with RCU)
    rcu_read_lock();
    ptr = rcu_dereference(shared_ptr);
    if (ptr)
        process_data(ptr);
    rcu_read_unlock();
}

void rcu_update(struct data *new_data) {
    struct data *old;

    // Write path (use spinlock for writers)
    spin_lock(&update_lock);
    old = shared_ptr;
    rcu_assign_pointer(shared_ptr, new_data);
    spin_unlock(&update_lock);

    synchronize_rcu();
    kfree(old);
}
```

**Explanation**:

- **No direct upgrade** - Not supported, causes deadlocks
- **Release and reacquire** - Safe upgrade pattern
- **Re-check conditions** - State may change
- **RCU alternative** - Often better for read-heavy loads

## Rock 5B+ Read-Write Locks

**What**: The Rock 5B+ platform's ARM64 architecture provides specific considerations for read-write lock implementation and performance.

**Why**: Understanding Rock 5B+ rwlocks is important because:

- **ARM64 architecture** - ARM64 load/store exclusive instructions
- **8-core CPU** - Multi-core reader scalability
- **Cache coherency** - ARM cache protocol optimization
- **Performance** - ARM64 specific tuning

**How**: Rock 5B+ rwlocks involve:

```bash
# Rock 5B+ read-write lock monitoring

# 1. Monitor rwsem contention
cat /proc/lock_stat | grep rwsem | head -20

# 2. Check reader/writer balance
cat /proc/lock_stat | awk '/rwsem/{print $1,$2,$3,$4}'

# 3. View per-CPU load (reader distribution)
mpstat -P ALL 1

# 4. Monitor cache coherency traffic
perf stat -e l2d_cache -a sleep 5

# 5. Analyze lock wait times
perf lock record -a sleep 10
perf lock report

# 6. Check for writer starvation
# Look for high waittime-max for write locks
cat /proc/lock_stat | grep -A 2 "write.*rwsem"

# 7. ARM64 exclusive monitor usage
perf stat -e armv8_pmuv3/exc_undef/ -a sleep 5

# 8. Profile reader scalability
#!/bin/bash
# Compare performance with different reader counts
for readers in 1 2 4 8; do
    echo "Testing with $readers readers"
    run_read_test --readers=$readers
done
```

**Explanation**:

- **lock_stat** - Contention and wait time statistics
- **Cache coherency** - L2 cache metrics
- **perf lock** - Lock profiling
- **Reader distribution** - Per-CPU load balancing

## Key Takeaways

**What** you've accomplished:

1. **Rwlock Understanding** - You understand spinlock-based rwlocks
2. **Rwsem Understanding** - You know sleeping rwsemaphores
3. **Pattern Knowledge** - You understand upgrade patterns
4. **Performance** - You can optimize for read-heavy loads
5. **Rock 5B+ Rwlocks** - You understand ARM64 considerations

**Why** these concepts matter:

- **Scalability** - Critical for multi-core performance
- **Efficiency** - Better than exclusive locks for reads
- **Correctness** - Avoiding deadlocks and races
- **Platform knowledge** - Rock 5B+ optimization

**When** to use these concepts:

- **Read-heavy loads** - Many reads, few writes
- **Lookup operations** - Hash tables, trees
- **Configuration data** - Read-mostly settings
- **Consider RCU** - Often better alternative

**Where** these skills apply:

- **File systems** - Directory and inode operations
- **Network stack** - Routing table lookups
- **Driver development** - Configuration management
- **Rock 5B+** - ARM64 multi-core programming

## Next Steps

Continue with:

1. **Atomic Operations** - Lock-free programming primitives

## Resources

**Official Documentation**:

- [RW Semaphore](https://www.kernel.org/doc/html/latest/locking/locktypes.html) - rwsem documentation
- [Locking](https://www.kernel.org/doc/html/latest/locking/index.html) - Kernel locking guide

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Locking chapter

**Rock 5B+ Specific**:

- [ARM64 Exclusives](https://developer.arm.com/documentation/den0024/latest) - ARM64 exclusive access

Happy learning! 🐧
