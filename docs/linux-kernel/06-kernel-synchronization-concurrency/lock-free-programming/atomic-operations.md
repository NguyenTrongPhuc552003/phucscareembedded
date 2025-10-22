---
sidebar_position: 1
---

# Atomic Operations

Master atomic operations in the Linux kernel, understanding lock-free programming techniques and memory ordering on the Rock 5B+ ARM64 platform.

## What are Atomic Operations?

**What**: Atomic operations are indivisible operations that complete without interruption, providing lock-free synchronization using CPU hardware support.

**Why**: Understanding atomic operations is crucial because:

- **Lock-free programming** - Avoid lock overhead and contention
- **Performance** - Faster than lock-based synchronization
- **Scalability** - Better multi-core scalability
- **Simple counters** - Efficient for simple operations
- **Rock 5B+ development** - ARM64 atomic instructions (LDXR/STXR)
- **Professional development** - Essential for high-performance code

**When**: Atomic operations are used when:

- **Simple updates** - Counters, flags, simple variables
- **Lock-free algorithms** - Lock-free data structures
- **Reference counting** - Object lifetime management
- **Interrupt context** - Safe in any context
- **Performance critical** - Avoiding lock overhead
- **ARM64 platforms** - Rock 5B+ 8-core optimization

**How**: Atomic operations work by:

- **Hardware support** - CPU atomic instructions
- **Read-modify-write** - Indivisible update cycles
- **Memory ordering** - Configurable ordering guarantees
- **Compare-and-swap** - CAS operations for complex updates
- **ARM64 exclusives** - LDXR/STXR instruction pairs
- **Memory barriers** - Ensuring visibility

**Where**: Atomic operations are found in:

- **Reference counting** - kobject, file, page refcounts
- **Statistics** - Lock-free counters
- **Flags** - Atomic bit operations
- **Lock implementation** - Spinlock internals
- **Memory management** - Page flags, refcounts
- **Rock 5B+** - ARM64 kernel primitives

## Atomic Integer Operations

**What**: atomic_t and atomic64_t provide atomic operations on integers, supporting common operations without locks.

**Why**: Understanding atomic integers is important because:

- **Common use case** - Most frequent atomic operation
- **Simple API** - Easy to use correctly
- **Type safety** - Distinct type prevents mistakes
- **Cross-architecture** - Works on all platforms

**How**: Atomic integers work through:

```c
// Example: Atomic integer operations
#include <linux/atomic.h>

// 1. Define and initialize atomic variables
static atomic_t counter = ATOMIC_INIT(0);
static atomic64_t counter64 = ATOMIC64_INIT(0);

// 2. Basic atomic operations
void atomic_basic_ops(void) {
    // Read atomic value
    int val = atomic_read(&counter);

    // Set atomic value
    atomic_set(&counter, 10);

    // Add to atomic variable
    atomic_add(5, &counter);

    // Subtract from atomic variable
    atomic_sub(3, &counter);

    // Increment
    atomic_inc(&counter);

    // Decrement
    atomic_dec(&counter);
}

// 3. Atomic operations with return values
void atomic_return_ops(void) {
    int old_val;

    // Add and return new value
    old_val = atomic_add_return(5, &counter);

    // Subtract and return new value
    old_val = atomic_sub_return(3, &counter);

    // Increment and return new value
    old_val = atomic_inc_return(&counter);

    // Decrement and return new value
    old_val = atomic_dec_return(&counter);

    // Fetch and add (return old value)
    old_val = atomic_fetch_add(5, &counter);
}

// 4. Test and modify operations
void atomic_test_ops(void) {
    // Increment and test if zero
    if (atomic_inc_and_test(&counter)) {
        pr_info("Counter is now zero\n");
    }

    // Decrement and test if zero
    if (atomic_dec_and_test(&counter)) {
        pr_info("Counter reached zero\n");
    }

    // Add and test if negative
    if (atomic_add_negative(5, &counter)) {
        pr_info("Counter is negative\n");
    }

    // Subtract and test if zero
    if (atomic_sub_and_test(10, &counter)) {
        pr_info("Counter is zero\n");
    }
}

// 5. Compare-and-swap (CAS)
bool atomic_cas_example(int old_val, int new_val) {
    // Try to update from old_val to new_val
    // Returns old value, check if it matches expected
    return atomic_cmpxchg(&counter, old_val, new_val) == old_val;
}

// Alternative: try_cmpxchg
bool atomic_try_cas(int *expected, int new_val) {
    // Updates *expected with current value if CAS fails
    return atomic_try_cmpxchg(&counter, expected, new_val);
}

// 6. Reference counting pattern
struct my_object {
    atomic_t refcount;
    // ... other fields
};

struct my_object *get_object(struct my_object *obj) {
    if (obj)
        atomic_inc(&obj->refcount);
    return obj;
}

void put_object(struct my_object *obj) {
    if (obj && atomic_dec_and_test(&obj->refcount)) {
        // Last reference, free object
        kfree(obj);
    }
}

// 7. 64-bit atomic operations (on 64-bit architectures)
void atomic64_example(void) {
    atomic64_t large_counter = ATOMIC64_INIT(1000000000000LL);

    atomic64_inc(&large_counter);
    atomic64_add(500, &large_counter);

    long long val = atomic64_read(&large_counter);
    pr_info("Counter: %lld\n", val);
}

// 8. Atomic exchange
int atomic_xchg_example(int new_val) {
    // Exchange value atomically, return old value
    return atomic_xchg(&counter, new_val);
}
```

**Explanation**:

- **atomic_read/set** - Read/write atomic value
- **atomic_add/sub** - Arithmetic operations
- **atomic_inc/dec** - Increment/decrement
- **atomic_cmpxchg** - Compare-and-swap
- **atomic_dec_and_test** - Test after operation
- **atomic64_t** - 64-bit atomics

## Atomic Bitwise Operations

**What**: Atomic bit operations allow lock-free manipulation of individual bits in memory, used for flags and bitmaps.

**Why**: Understanding atomic bits is important because:

- **Flag management** - Atomic status flags
- **Bitmaps** - Lock-free bitmap operations
- **Low overhead** - Single instruction operations
- **Common pattern** - Widely used in kernel

**How**: Atomic bit operations work through:

```c
// Example: Atomic bit operations
#include <linux/bitops.h>

// 1. Define bitmap
static unsigned long flags_bitmap;

#define FLAG_READY     0
#define FLAG_BUSY      1
#define FLAG_ERROR     2
#define FLAG_COMPLETE  3

// 2. Set and clear bits
void atomic_bit_ops(void) {
    // Set bit atomically
    set_bit(FLAG_READY, &flags_bitmap);

    // Clear bit atomically
    clear_bit(FLAG_BUSY, &flags_bitmap);

    // Change (flip) bit atomically
    change_bit(FLAG_ERROR, &flags_bitmap);
}

// 3. Test and modify bits
void atomic_test_and_modify(void) {
    // Test and set bit (returns old value)
    if (test_and_set_bit(FLAG_BUSY, &flags_bitmap)) {
        pr_info("Was already busy\n");
    } else {
        pr_info("Now marked as busy\n");
    }

    // Test and clear bit
    if (test_and_clear_bit(FLAG_COMPLETE, &flags_bitmap)) {
        pr_info("Cleared completion flag\n");
    }

    // Test and change bit
    if (test_and_change_bit(FLAG_ERROR, &flags_bitmap)) {
        pr_info("Error flag was set\n");
    }
}

// 4. Non-atomic test (read-only)
bool check_flags(void) {
    // Just test, don't modify
    if (test_bit(FLAG_READY, &flags_bitmap)) {
        return true;
    }
    return false;
}

// 5. Spinlock using atomic bit
static unsigned long spinlock_bit = 0;

void bit_spinlock_example(void) {
    // Acquire spinlock using bit operation
    while (test_and_set_bit(0, &spinlock_bit)) {
        cpu_relax();  // Hint to CPU we're spinning
    }

    // Critical section
    do_work();

    // Release spinlock
    clear_bit(0, &spinlock_bit);
}

// 6. Wait for bit pattern
void wait_for_bits(void) {
    // Wait for specific bit to be cleared
    wait_on_bit(&flags_bitmap, FLAG_BUSY, TASK_UNINTERRUPTIBLE);

    // Wake up tasks waiting on bit
    clear_bit(FLAG_BUSY, &flags_bitmap);
    wake_up_bit(&flags_bitmap, FLAG_BUSY);
}

// 7. Bit locking (bit spinlock variant)
void bit_lock_example(void) {
    // Lock bit (spin until acquired)
    bit_spin_lock(FLAG_BUSY, &flags_bitmap);

    // Critical section
    process_data();

    // Unlock bit
    bit_spin_unlock(FLAG_BUSY, &flags_bitmap);
}
```

**Explanation**:

- **set_bit/clear_bit** - Set/clear bit atomically
- **test_and_set_bit** - Test old value and set
- **test_bit** - Read-only test
- **wait_on_bit** - Sleep until bit cleared
- **bit_spin_lock** - Use bit as spinlock

## Memory Ordering

**What**: Memory ordering specifies how atomic operations interact with other memory accesses, controlling visibility and ordering across CPUs.

**Why**: Understanding memory ordering is important because:

- **Correctness** - Prevent subtle race conditions
- **Performance** - Relaxed ordering faster
- **ARM64 weak ordering** - ARM has relaxed memory model
- **Visibility** - Ensuring changes are visible

**How**: Memory ordering works through:

```c
// Example: Memory ordering with atomics
#include <linux/atomic.h>

// 1. Full ordering (acquire + release)
void full_ordering_example(void) {
    int old;

    // Full memory barrier semantics
    old = atomic_xchg(&counter, 10);
    // All prior writes visible to all CPUs
    // All subsequent reads see latest values
}

// 2. Acquire semantics (for lock acquisition)
void acquire_semantics(void) {
    // Try to acquire lock
    while (atomic_cmpxchg_acquire(&counter, 0, 1) != 0) {
        cpu_relax();
    }

    // Subsequent loads/stores cannot move before acquire
    critical_section();
}

// 3. Release semantics (for lock release)
void release_semantics(void) {
    // Critical section
    critical_section();

    // Store with release semantics
    atomic_set_release(&counter, 0);
    // Prior loads/stores cannot move after release
}

// 4. Relaxed ordering (no ordering guarantees)
void relaxed_ordering(void) {
    // Fastest, but no ordering guarantees
    int val = atomic_read_acquire(&counter);

    // Use only for pure counters/stats
    atomic_inc_return_relaxed(&stats_counter);
}

// 5. ARM64 specific ordering example
void arm64_ordering_example(void) {
    atomic_t flag = ATOMIC_INIT(0);
    int data = 0;

    // Writer (CPU 0)
    data = 42;                              // Store data
    smp_wmb();                              // Write barrier
    atomic_set_release(&flag, 1);           // Signal data ready

    // Reader (CPU 1)
    while (!atomic_read_acquire(&flag))     // Wait for signal
        cpu_relax();
    smp_rmb();                              // Read barrier
    int value = data;                       // Read data
}

// 6. Practical example: Lock-free queue
struct lockfree_queue {
    atomic_t head;
    atomic_t tail;
    void *items[256];
};

bool enqueue(struct lockfree_queue *q, void *item) {
    int tail, next;

    do {
        tail = atomic_read_acquire(&q->tail);
        next = (tail + 1) % 256;

        if (next == atomic_read_acquire(&q->head))
            return false;  // Queue full

    } while (atomic_cmpxchg_release(&q->tail, tail, next) != tail);

    q->items[tail] = item;
    return true;
}
```

**Explanation**:

- **\_acquire** - Acquire semantics (for readers)
- **\_release** - Release semantics (for writers)
- **\_relaxed** - No ordering (fastest)
- **smp_wmb/rmb** - Explicit memory barriers
- **ARM64 weak model** - Requires explicit barriers

## Rock 5B+ Atomic Operations

**What**: The Rock 5B+ platform's ARM64 architecture uses Load-Exclusive/Store-Exclusive (LDXR/STXR) instructions for atomic operations.

**Why**: Understanding Rock 5B+ atomics is important because:

- **ARM64 instructions** - LDXR/STXR exclusive access
- **Weak memory model** - ARM64 relaxed ordering
- **8-core CPU** - Multi-core atomic performance
- **Cache coherency** - ARM cache protocol interaction

**How**: Rock 5B+ atomics involve:

```bash
# Rock 5B+ atomic operations monitoring

# 1. Monitor exclusive access failures
perf stat -e armv8_pmuv3/exc_undef/ -a sleep 5

# 2. Check atomic operation performance
perf stat -e cycles,instructions -a -- ./atomic_test

# 3. View cache coherency traffic
perf stat -e l2d_cache,l2d_cache_refill -a sleep 5

# 4. Monitor memory ordering violations
# Enable ARM PMU events
perf list | grep armv8

# 5. Check CPU utilization (atomics don't sleep)
mpstat -P ALL 1

# 6. Profile atomic hotspots
perf record -e cpu-clock -g -- ./program
perf report

# 7. ARM64 cache line size (64 bytes)
getconf LEVEL1_DCACHE_LINESIZE

# 8. Monitor false sharing
perf c2c record -- ./program
perf c2c report
```

**Explanation**:

- **LDXR/STXR** - ARM64 exclusive access instructions
- **exc_undef** - Exclusive access failures
- **Cache coherency** - L2 cache metrics
- **False sharing** - Cache line bouncing
- **perf c2c** - Cache-to-cache transfer analysis

## Key Takeaways

**What** you've accomplished:

1. **Atomic Operations** - You understand atomic primitives
2. **Atomic Integers** - You can use atomic_t effectively
3. **Atomic Bits** - You know bit operations
4. **Memory Ordering** - You understand ordering semantics
5. **Rock 5B+ Atomics** - You know ARM64 specifics

**Why** these concepts matter:

- **Lock-free programming** - Higher performance
- **Scalability** - Better multi-core scaling
- **Correctness** - Proper memory ordering
- **Platform knowledge** - ARM64 optimization

**When** to use these concepts:

- **Counters and stats** - Simple atomic variables
- **Reference counting** - Object lifetime management
- **Flags and bitmaps** - Atomic bit operations
- **Lock-free algorithms** - Advanced data structures

**Where** these skills apply:

- **Kernel development** - All subsystems use atomics
- **Driver development** - Reference counting, flags
- **Performance optimization** - Lock-free algorithms
- **Rock 5B+** - ARM64 multi-core programming

## Next Steps

Continue with:

1. **Memory Barriers** - Explicit memory ordering control

## Resources

**Official Documentation**:

- [Atomic Operations](https://www.kernel.org/doc/html/latest/core-api/atomic_ops.html) - Atomic ops guide
- [Memory Barriers](https://www.kernel.org/doc/html/latest/memory-barriers.txt) - Memory ordering

**Learning Resources**:

- [Is Parallel Programming Hard](https://www.kernel.org/pub/linux/kernel/people/paulmck/perfbook/perfbook.html) - Lock-free programming

**Rock 5B+ Specific**:

- [ARM64 Atomics](https://developer.arm.com/documentation/den0024/latest) - ARM64 exclusive access

Happy learning! 🐧
