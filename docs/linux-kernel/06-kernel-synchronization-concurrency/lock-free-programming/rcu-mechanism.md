---
sidebar_position: 3
---

# RCU Mechanism

Master Read-Copy-Update (RCU) in the Linux kernel, understanding this powerful lock-free synchronization mechanism for read-heavy workloads on the Rock 5B+ platform.

## What is RCU?

**What**: Read-Copy-Update (RCU) is a synchronization mechanism that allows lock-free reads while supporting concurrent updates, optimized for read-mostly data structures.

**Why**: Understanding RCU is crucial because:

- **Lock-free reads** - Readers never block or spin
- **Scalability** - Excellent multi-core read scalability
- **Performance** - Minimal overhead for read paths
- **Concurrent updates** - Writers can update while readers access
- **Rock 5B+ development** - ARM64 optimized RCU implementation
- **Professional development** - Essential for high-performance kernel code

**When**: RCU is used when:

- **Read-heavy workloads** - Many readers, few writers
- **Low read latency** - Readers cannot tolerate blocking
- **Scalability required** - Multi-core read performance critical
- **Pointer-based structures** - Linked lists, trees, hash tables
- **Network stack** - Routing tables, connection tracking
- **ARM64 platforms** - Rock 5B+ 8-core optimization

**How**: RCU works by:

- **Lock-free reads** - Readers access without locks or atomics
- **Copy-on-write** - Writers create new versions
- **Grace periods** - Waiting for readers to finish
- **Memory barriers** - Ensuring proper ordering
- **Deferred reclamation** - Freeing old data after grace period
- **Callback mechanism** - Asynchronous memory reclamation

**Where**: RCU is found in:

- **Network subsystem** - Routing tables, sockets
- **File systems** - Dcache, inode management
- **Process management** - Task lists, credentials
- **Device drivers** - Driver state management
- **Security** - SELinux, capabilities
- **Rock 5B+** - ARM64 kernel subsystems

## RCU Basics

**What**: RCU provides APIs for readers (rcu_read_lock/unlock) and writers (synchronize_rcu, call_rcu) to safely access and update shared data.

**Why**: Understanding RCU basics is important because:

- **Correct usage** - Proper API usage prevents bugs
- **Read-side overhead** - Extremely low (just barriers)
- **Write-side cost** - Must wait for grace period
- **Memory ordering** - Proper barriers critical

**How**: RCU basics work through:

```c
// Example: RCU basic usage
#include <linux/rcupdate.h>

// Shared data protected by RCU
static struct data __rcu *global_ptr;

// 1. RCU read-side critical section
void rcu_reader_example(void) {
    struct data *p;

    // Enter RCU read-side critical section
    rcu_read_lock();

    // Dereference RCU-protected pointer
    p = rcu_dereference(global_ptr);

    if (p) {
        // Use data - safe from concurrent updates
        use_data(p->value);
    }

    // Exit RCU read-side critical section
    rcu_read_unlock();
    // Note: Cannot sleep between lock/unlock
}

// 2. RCU update (synchronous)
void rcu_update_sync(struct data *new_data) {
    struct data *old;

    // Replace pointer atomically
    old = rcu_dereference_protected(global_ptr,
                                    lockdep_is_held(&update_lock));
    rcu_assign_pointer(global_ptr, new_data);

    // Wait for all readers to finish
    synchronize_rcu();

    // Now safe to free old data
    kfree(old);
}

// 3. RCU update (asynchronous)
static void rcu_free_callback(struct rcu_head *head) {
    struct data *p = container_of(head, struct data, rcu);
    kfree(p);
}

void rcu_update_async(struct data *new_data) {
    struct data *old;

    old = rcu_dereference_protected(global_ptr,
                                    lockdep_is_held(&update_lock));
    rcu_assign_pointer(global_ptr, new_data);

    // Schedule deferred free
    call_rcu(&old->rcu, rcu_free_callback);
    // Returns immediately, callback called after grace period
}

// 4. RCU with multiple readers
void multiple_readers(void) {
    struct data *p;

    // Reader 1
    rcu_read_lock();
    p = rcu_dereference(global_ptr);
    if (p)
        process_data1(p);
    rcu_read_unlock();

    // Reader 2 (concurrent with Reader 1)
    rcu_read_lock();
    p = rcu_dereference(global_ptr);
    if (p)
        process_data2(p);
    rcu_read_unlock();
}

// 5. RCU-protected list traversal
struct my_node {
    int data;
    struct list_head list;
    struct rcu_head rcu;
};

static LIST_HEAD(my_list);
static DEFINE_SPINLOCK(list_lock);

void rcu_list_reader(void) {
    struct my_node *node;

    rcu_read_lock();

    // RCU-safe list traversal
    list_for_each_entry_rcu(node, &my_list, list) {
        use_node_data(node->data);
    }

    rcu_read_unlock();
}

// 6. RCU list update
void rcu_list_add(struct my_node *new_node) {
    spin_lock(&list_lock);
    list_add_rcu(&new_node->list, &my_list);
    spin_unlock(&list_lock);
}

void rcu_list_del(struct my_node *old_node) {
    spin_lock(&list_lock);
    list_del_rcu(&old_node->list);
    spin_unlock(&list_lock);

    call_rcu(&old_node->rcu, rcu_free_callback);
}
```

**Explanation**:

- **rcu_read_lock/unlock** - Mark read-side critical section
- **rcu_dereference** - Load RCU-protected pointer
- **rcu_assign_pointer** - Update RCU-protected pointer
- **synchronize_rcu** - Wait for grace period (blocking)
- **call_rcu** - Defer callback until grace period (non-blocking)
- **list\_\*\_rcu** - RCU-safe list operations

## RCU Variants

**What**: Linux provides several RCU variants optimized for different use cases: Classic RCU, RCU-bh, RCU-sched, and SRCU.

**Why**: Understanding RCU variants is important because:

- **Different guarantees** - Each variant has different properties
- **Performance trade-offs** - Choose appropriate variant
- **Context requirements** - Some variants have restrictions
- **Compatibility** - Understanding variant interactions

**How**: RCU variants work through:

```c
// Example: RCU variants

// 1. Classic RCU (default)
void classic_rcu_example(void) {
    struct data *p;

    rcu_read_lock();
    p = rcu_dereference(global_ptr);
    if (p)
        use_data(p);
    rcu_read_unlock();
}

// 2. RCU-bh (bottom half)
void rcu_bh_example(void) {
    struct data *p;

    // Protects against softirqs
    rcu_read_lock_bh();
    p = rcu_dereference_bh(global_ptr);
    if (p)
        use_data(p);
    rcu_read_unlock_bh();
}

// 3. RCU-sched (scheduler)
void rcu_sched_example(void) {
    struct data *p;

    // Implicitly in read-side critical section if:
    // - Preemption disabled
    // - In interrupt context
    // - Holding spinlock

    preempt_disable();
    p = rcu_dereference_sched(global_ptr);
    if (p)
        use_data(p);
    preempt_enable();
}

// 4. SRCU (Sleepable RCU)
DEFINE_STATIC_SRCU(my_srcu);

void srcu_example(void) {
    struct data *p;
    int idx;

    // Can sleep in read-side critical section
    idx = srcu_read_lock(&my_srcu);

    p = srcu_dereference(global_ptr, &my_srcu);
    if (p) {
        // Can sleep here!
        use_data_with_sleep(p);
    }

    srcu_read_unlock(&my_srcu, idx);
}

void srcu_update(struct data *new_data) {
    struct data *old;

    old = srcu_dereference_check(global_ptr, &my_srcu,
                                 lockdep_is_held(&update_lock));
    rcu_assign_pointer(global_ptr, new_data);

    // Wait for SRCU grace period
    synchronize_srcu(&my_srcu);

    kfree(old);
}

// 5. Expedited RCU (faster grace period)
void expedited_update(struct data *new_data) {
    struct data *old;

    old = rcu_dereference_protected(global_ptr,
                                    lockdep_is_held(&update_lock));
    rcu_assign_pointer(global_ptr, new_data);

    // Faster but more expensive grace period
    synchronize_rcu_expedited();

    kfree(old);
}

// 6. RCU Tasks (for trampolines)
void rcu_tasks_example(void) {
    // Wait for all tasks to pass through voluntary context switch
    synchronize_rcu_tasks();

    // Safe to free code that might be executing
}
```

**Explanation**:

- **Classic RCU** - Standard RCU for most uses
- **RCU-bh** - Protection against softirqs
- **RCU-sched** - Tied to scheduler, implicit read-side
- **SRCU** - Sleepable RCU for longer read-sides
- **Expedited** - Faster grace period, higher cost
- **RCU Tasks** - For code patching, tracing

## RCU Design Patterns

**What**: Common design patterns for using RCU effectively in kernel code.

**Why**: Understanding patterns is important because:

- **Correctness** - Proven correct usage
- **Performance** - Optimized patterns
- **Common cases** - Handling typical scenarios
- **Avoid pitfalls** - Prevent common mistakes

**How**: RCU patterns work through:

```c
// Example: RCU design patterns

// 1. RCU hash table
#define HASH_SIZE 256

struct hash_entry {
    int key;
    void *value;
    struct hlist_node node;
    struct rcu_head rcu;
};

static struct hlist_head hash_table[HASH_SIZE];
static DEFINE_SPINLOCK(hash_lock);

void *hash_lookup(int key) {
    struct hash_entry *entry;
    int hash = key % HASH_SIZE;

    rcu_read_lock();

    hlist_for_each_entry_rcu(entry, &hash_table[hash], node) {
        if (entry->key == key) {
            void *value = entry->value;
            rcu_read_unlock();
            return value;
        }
    }

    rcu_read_unlock();
    return NULL;
}

void hash_insert(int key, void *value) {
    struct hash_entry *new_entry;
    int hash = key % HASH_SIZE;

    new_entry = kmalloc(sizeof(*new_entry), GFP_KERNEL);
    new_entry->key = key;
    new_entry->value = value;

    spin_lock(&hash_lock);
    hlist_add_head_rcu(&new_entry->node, &hash_table[hash]);
    spin_unlock(&hash_lock);
}

// 2. RCU reference counting
struct rcu_refcounted {
    atomic_t refcount;
    struct rcu_head rcu;
    void *data;
};

struct rcu_refcounted *get_ref(struct rcu_refcounted *p) {
    if (p && atomic_inc_not_zero(&p->refcount))
        return p;
    return NULL;
}

void put_ref(struct rcu_refcounted *p) {
    if (p && atomic_dec_and_test(&p->refcount))
        call_rcu(&p->rcu, rcu_free_callback);
}

// 3. RCU pointer update with multiple fields
struct complex_data {
    int field1;
    int field2;
    struct rcu_head rcu;
};

void update_complex_data(int new_field1, int new_field2) {
    struct complex_data *old, *new;

    // Allocate new structure
    new = kmalloc(sizeof(*new), GFP_KERNEL);
    new->field1 = new_field1;
    new->field2 = new_field2;

    spin_lock(&update_lock);

    old = rcu_dereference_protected(global_complex_ptr,
                                    lockdep_is_held(&update_lock));

    // Atomic pointer update
    rcu_assign_pointer(global_complex_ptr, new);

    spin_unlock(&update_lock);

    // Defer free
    if (old)
        call_rcu(&old->rcu, rcu_free_callback);
}

// 4. RCU with existence guarantees
void rcu_with_existence(struct device *dev) {
    struct data *p;

    // Device existence guaranteed by caller
    rcu_read_lock();

    p = rcu_dereference(dev->private_data);
    if (p)
        use_data(p);

    rcu_read_unlock();
}

// 5. Poll-based RCU (for real-time)
void poll_state_rcu(void) {
    // Check if in RCU read-side critical section
    if (rcu_is_watching()) {
        // In RCU read-side
    }

    // Poll for grace period completion
    while (!poll_state_synchronize_rcu(oldstate))
        cpu_relax();
}
```

**Explanation**:

- **Hash tables** - Common RCU use case
- **Reference counting** - Combining RCU with refcounts
- **Complex updates** - Updating multiple fields atomically
- **Existence guarantees** - When object lifetime is guaranteed
- **Poll-based** - For real-time or special contexts

## Rock 5B+ RCU

**What**: The Rock 5B+ platform's ARM64 architecture has specific RCU implementation characteristics and optimizations.

**Why**: Understanding Rock 5B+ RCU is important because:

- **ARM64 architecture** - Weak memory model considerations
- **8-core CPU** - Grace period scalability
- **Cache coherency** - ARM cache protocol interaction
- **Performance** - ARM64 specific optimizations

**How**: Rock 5B+ RCU involves:

```bash
# Rock 5B+ RCU monitoring and tuning

# 1. View RCU statistics
cat /sys/kernel/debug/rcu/rcu_data

# 2. View RCU grace period info
cat /sys/kernel/debug/rcu/rcu_gp_status

# 3. Monitor RCU callbacks
cat /sys/kernel/debug/rcu/rcudata

# 4. Check RCU stalls
dmesg | grep -i "rcu.*stall"

# 5. RCU CPU usage
cat /proc/softirqs | grep RCU

# 6. Tune RCU parameters
# Expedite grace periods (use sparingly)
echo 1 > /sys/kernel/debug/rcu/rcu_expedited

# 7. Monitor grace period latency
cat /sys/kernel/debug/rcu/rcu_preempt/gr

# 8. ARM64 specific RCU performance
perf stat -e cycles,instructions,cache-misses -- ./rcu_test

# 9. Check RCU configuration
cat /boot/config-$(uname -r) | grep RCU

# 10. RCU debugging (if enabled)
# CONFIG_RCU_TRACE=y
cat /sys/kernel/debug/rcu/rcu_preempt/rcudata
```

**Explanation**:

- **rcu_data** - Per-CPU RCU statistics
- **Grace periods** - Monitoring grace period completion
- **RCU stalls** - Detecting long grace periods
- **Softirq** - RCU callbacks run in softirq context
- **ARM64 barriers** - DMB instructions for RCU ordering

## Key Takeaways

**What** you've accomplished:

1. **RCU Understanding** - You understand RCU mechanism
2. **RCU APIs** - You know how to use RCU correctly
3. **RCU Variants** - You understand different RCU types
4. **Design Patterns** - You know common RCU patterns
5. **Rock 5B+ RCU** - You understand ARM64 considerations

**Why** these concepts matter:

- **Scalability** - Best read scalability of any mechanism
- **Performance** - Minimal read-side overhead
- **Lock-free** - No reader blocking or spinning
- **Platform knowledge** - ARM64 optimization

**When** to use these concepts:

- **Read-heavy** - Many readers, few writers
- **Low latency** - Readers need minimal overhead
- **Pointer structures** - Lists, trees, hash tables
- **Network/filesystem** - Common kernel subsystems

**Where** these skills apply:

- **Kernel development** - All read-heavy data structures
- **Network drivers** - Connection tracking, routing
- **File systems** - Dcache, inode management
- **Rock 5B+** - ARM64 high-performance code

## Next Steps

Continue with:

1. **Per-CPU Variables** - Lock-free per-CPU data

## Resources

**Official Documentation**:

- [RCU](https://www.kernel.org/doc/html/latest/RCU/index.html) - Comprehensive RCU documentation
- [What is RCU](https://www.kernel.org/doc/html/latest/RCU/whatisRCU.html) - RCU introduction

**Learning Resources**:

- [Is Parallel Programming Hard](https://www.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html) - RCU chapters
- [Paul McKenney's RCU papers](https://www.rdrop.com/users/paulmck/RCU/) - RCU research

**Rock 5B+ Specific**:

- [ARM64 RCU](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory ordering for RCU

Happy learning! 🐧
