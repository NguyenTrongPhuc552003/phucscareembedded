---
sidebar_position: 3
---

# Memory Ordering

Master RISC-V memory ordering model that defines how memory operations are ordered and made visible to other processors, essential for correct concurrent programming and kernel synchronization.

## What Is Memory Ordering?

**What**: Memory ordering defines the rules for when memory writes become visible to other processors and the relative order of memory operations observed by different processors.

**Why**: Understanding memory ordering is crucial because:

- **Concurrency** - Critical for multi-core and multi-threaded systems
- **Synchronization** - Ensures correct operation of locks and synchronization primitives
- **Correctness** - Incorrect ordering assumptions cause subtle bugs
- **Performance** - Understanding ordering enables optimizations
- **Kernel Development** - Kernel relies heavily on memory ordering
- **Debugging** - Helps diagnose race conditions and ordering bugs

**When**: Memory ordering matters when:

- **Multi-Core Systems** - Multiple cores accessing shared memory
- **Concurrent Programming** - Multiple threads sharing data
- **Lock Implementation** - Locks use memory ordering guarantees
- **Atomic Operations** - Atomic operations provide ordering guarantees
- **Device Drivers** - Memory-mapped I/O uses ordering
- **Cache Coherency** - Caches must maintain ordering

**How**: Memory ordering works through:

- **Load/Store Ordering** - Rules for load and store operations
- **Memory Barriers** - Instructions that enforce ordering
- **Acquire/Release Semantics** - Ordering guarantees for synchronization
- **Cache Coherency** - Hardware ensures cache consistency
- **Write Visibility** - When writes become globally visible

**Where**: Memory ordering is found in:

- **All Multi-Core RISC-V Systems** - Every SMP system
- **Kernel Synchronization** - Spinlocks, mutexes, semaphores
- **Atomic Operations** - Atomic read-modify-write operations
- **Device Drivers** - Ordering for memory-mapped I/O
- **Lock-Free Code** - Lock-free data structures rely on ordering

## RISC-V Memory Ordering Model

**What**: RISC-V uses a relaxed memory ordering model (release consistency) where memory operations can be reordered unless explicitly constrained.

**Why**: Relaxed ordering is important because:

- **Performance** - Allows hardware and compiler optimizations
- **Efficiency** - Reordering can improve performance
- **Flexibility** - Software controls ordering when needed
- **Hardware Optimization** - Enables out-of-order execution
- **Compiler Optimization** - Enables code reordering

**How**: Memory ordering model works:

```c
// Example: RISC-V memory ordering rules
// Default ordering: Relaxed (no guarantees about order)
// Operations can be reordered by hardware or compiler
// unless prevented by memory barriers or acquire/release semantics

// Example: Reordering demonstration
int x = 0, y = 0;
int r1, r2;

// Thread 1
void thread1(void) {
    x = 1;      // Store to x
    r1 = y;     // Load from y
    // In relaxed model, these can be reordered
    // Hardware might execute: r1 = y; then x = 1;
}

// Thread 2
void thread2(void) {
    y = 1;      // Store to y
    r2 = x;     // Load from x
    // These can also be reordered
}

// After execution, with reordering allowed:
// Possible outcomes:
// r1 = 0, r2 = 0 (both loads happen before stores)
// r1 = 1, r2 = 0 (thread2's store seen, thread1's not)
// r1 = 0, r2 = 1 (thread1's store seen, thread2's not)
// r1 = 1, r2 = 1 (both stores seen)
// This is allowed in relaxed ordering

// Example: Memory barriers prevent reordering
void thread1_with_barrier(void) {
    x = 1;           // Store to x
    mb();            // Memory barrier
    r1 = y;          // Load from y
    // Barrier ensures: x = 1 is visible before r1 = y executes
}

// Example: Acquire semantics
void thread1_acquire(void) {
    x = 1;                      // Store
    smp_store_release(&flag, 1); // Release store
    // Release ensures: x = 1 visible before flag = 1
}

void thread2_acquire(void) {
    if (smp_load_acquire(&flag)) { // Acquire load
        r2 = x;                    // Load x
        // Acquire ensures: flag = 1 seen before r2 = x
        // Combined with release: r2 will see x = 1
    }
}
```

**Explanation**:

- **Relaxed ordering** default model allows operation reordering
- **Reordering** hardware and compiler can reorder operations for performance
- **Memory barriers** instructions that prevent reordering
- **Acquire/release** synchronization primitives provide ordering guarantees
- **Visibility** writes may not be immediately visible to other cores

## Memory Barriers

**What**: Memory barriers are instructions that enforce ordering constraints on memory operations.

**Why**: Memory barriers are essential because:

- **Synchronization** - Required for correct synchronization
- **Ordering Control** - Software controls operation ordering
- **Correctness** - Ensures operations complete in expected order
- **Hardware Ordering** - Forces hardware to maintain ordering
- **Cache Flushing** - Some barriers ensure cache visibility

**How**: Memory barriers work:

```c
// Example: RISC-V memory barrier instructions
// FENCE instruction provides different barrier types
// FENCE pred, succ
// pred: predecessor set (what operations must complete before)
// succ: successor set (what operations must wait for before)

// Barrier types:
// FENCE rw, rw  // Full memory barrier (read-write, read-write)
// FENCE r, rw   // Acquire barrier (reads acquire)
// FENCE rw, w   // Release barrier (writes release)

// Example: Full memory barrier
void full_memory_barrier(void) {
    // FENCE rw, rw
    // Ensures all loads and stores before barrier
    // complete before any loads/stores after barrier
    __asm__ volatile("fence rw, rw" ::: "memory");
}

// Example: Kernel memory barrier macros
#define mb()        __asm__ volatile("fence rw, rw" ::: "memory")
#define rmb()       __asm__ volatile("fence r, r" ::: "memory")    // Read barrier
#define wmb()       __asm__ volatile("fence w, w" ::: "memory")    // Write barrier

// Example: Acquire barrier (for loads)
void acquire_barrier(void) {
    // FENCE r, rw
    // Ensures all loads before barrier complete
    // before any loads/stores after barrier
    __asm__ volatile("fence r, rw" ::: "memory");
}

// Example: Release barrier (for stores)
void release_barrier(void) {
    // FENCE rw, w
    // Ensures all loads/stores before barrier complete
    // before any stores after barrier
    __asm__ volatile("fence rw, w" ::: "memory");
}

// Example: Using barriers for synchronization
int data = 0;
int flag = 0;

// Producer thread
void producer(void) {
    data = 42;       // Write data
    wmb();           // Write barrier: ensure data written before flag
    flag = 1;        // Set flag
    // Write barrier ensures: data = 42 visible before flag = 1
}

// Consumer thread
void consumer(void) {
    while (!flag) {  // Wait for flag
        cpu_relax();
    }
    rmb();           // Read barrier: ensure flag read before data read
    int value = data; // Read data
    // Read barrier ensures: flag = 1 seen before reading data
    // Combined with producer's write barrier: value will be 42
}

// Example: Spinlock using barriers
typedef struct {
    volatile int locked;
} spinlock_t;

void spin_lock(spinlock_t *lock) {
    int expected = 0;

    while (!__atomic_compare_exchange_n(&lock->locked, &expected, 1,
                                       false, __ATOMIC_ACQUIRE, __ATOMIC_ACQUIRE)) {
        expected = 0;
        cpu_relax();
    }

    // Acquire semantics: all loads/stores after lock
    // see effects of operations before unlock
    smp_mb__after_spinlock();  // Full barrier after acquiring lock
}

void spin_unlock(spinlock_t *lock) {
    // Release semantics: all loads/stores before unlock
    // visible to operations after next lock
    smp_mb__before_atomic();
    __atomic_store_n(&lock->locked, 0, __ATOMIC_RELEASE);
}
```

**Explanation**:

- **FENCE instruction** RISC-V provides fence instruction for barriers
- **Barrier types** different barriers for different ordering needs
- **Full barrier** ensures all operations before complete before any after
- **Acquire barrier** for loads, ensures operations after see effects before
- **Release barrier** for stores, ensures operations before visible to operations after

## Acquire and Release Semantics

**What**: Acquire and release semantics provide ordering guarantees for synchronization operations.

**Why**: Acquire/release semantics are important because:

- **Lock Implementation** - Essential for correct lock implementation
- **Synchronization** - Provides necessary ordering for synchronization
- **Performance** - Weaker than full barriers, better performance
- **Correctness** - Ensures correct operation of concurrent code
- **Standard Pattern** - Common pattern in concurrent programming

**How**: Acquire/release semantics work:

```c
// Example: Acquire semantics
// Acquire load: All loads/stores after acquire
// see effects of operations before release

// Example: Load with acquire semantics
int load_acquire(int *ptr) {
    int value;

    // Load with acquire
    // FENCE r, rw before load (or built into load instruction)
    __asm__ volatile(
        "fence r, rw\n"
        "lw %0, 0(%1)"
        : "=r"(value)
        : "r"(ptr)
        : "memory"
    );

    return value;
}

// Example: Release semantics
// Release store: All loads/stores before release
// visible to operations after acquire

// Example: Store with release semantics
void store_release(int *ptr, int value) {
    // Store with release
    // FENCE rw, w before store (or built into store instruction)
    __asm__ volatile(
        "sw %1, 0(%2)\n"
        "fence rw, w"
        :: "r"(value), "r"(ptr)
        : "memory"
    );
}

// Example: Using acquire/release for message passing
struct message {
    int data[10];
    volatile int ready;
};

// Producer: Write message with release
void send_message(struct message *msg, int *data) {
    // Write message data
    for (int i = 0; i < 10; i++) {
        msg->data[i] = data[i];
    }

    // Release barrier: ensure data written before ready flag
    smp_wmb();  // Write barrier

    // Store with release semantics
    smp_store_release(&msg->ready, 1);
    // All data writes visible before ready = 1
}

// Consumer: Read message with acquire
int receive_message(struct message *msg, int *data) {
    // Load with acquire semantics
    if (smp_load_acquire(&msg->ready)) {
        // Acquire ensures: ready = 1 seen before reading data
        smp_rmb();  // Read barrier

        // Read message data
        for (int i = 0; i < 10; i++) {
            data[i] = msg->data[i];
        }

        return 1;  // Message received
    }

    return 0;  // No message
}

// Example: Atomic operations with acquire/release
void atomic_operation_acquire_release(atomic_t *counter) {
    // Increment with acquire-release semantics
    // Acquire: see all previous operations
    // Release: make increment visible to next acquire

    __atomic_add_fetch(counter, 1, __ATOMIC_ACQ_REL);
}

// Example: Reference counting with acquire/release
struct object {
    atomic_t refcount;
    void (*destroy)(struct object *);
};

void object_get(struct object *obj) {
    // Increment reference count
    // Acquire ensures we see all initialization
    atomic_inc(&obj->refcount);
}

void object_put(struct object *obj) {
    // Decrement reference count
    if (atomic_dec_and_test(&obj->refcount)) {
        // Release ensures all accesses complete before destroy
        smp_mb__before_atomic();
        obj->destroy(obj);
    }
}
```

**Explanation**:

- **Acquire load** ensures subsequent operations see effects of prior operations
- **Release store** ensures prior operations visible to subsequent acquire operations
- **Pairing** acquire pairs with release for synchronization
- **Message passing** acquire/release enables lock-free message passing
- **Atomic operations** atomic operations can have acquire/release semantics

## Load-Load and Store-Store Ordering

**What**: Load-load and store-store ordering refers to the ordering of multiple loads or multiple stores.

**How**: Load/store ordering works:

```c
// Example: Load-load ordering
// In relaxed model, loads can be reordered
int x = 0, y = 0;
int r1, r2;

// Thread can execute:
void relaxed_loads(void) {
    r1 = x;  // Load x
    r2 = y;  // Load y
    // These can be reordered: r2 = y; r1 = x;
    // No ordering guarantee between loads
}

// If ordering needed, use read barrier
void ordered_loads(void) {
    r1 = x;
    rmb();   // Read barrier: ensure x loaded before y
    r2 = y;
    // rmb() ensures: r1 = x completes before r2 = y
}

// Example: Store-store ordering
// Stores can also be reordered
void relaxed_stores(void) {
    x = 1;   // Store x
    y = 2;   // Store y
    // These can be reordered: y = 2; x = 1;
    // No ordering guarantee between stores
}

// If ordering needed, use write barrier
void ordered_stores(void) {
    x = 1;
    wmb();   // Write barrier: ensure x written before y
    y = 2;
    // wmb() ensures: x = 1 completes before y = 2
}

// Example: Mixed ordering
void mixed_operations(void) {
    x = 1;      // Store x
    rmb();      // Read barrier
    r1 = y;     // Load y
    wmb();      // Write barrier
    z = 3;      // Store z

    // Ordering:
    // x = 1 before r1 = y (read barrier)
    // r1 = y before z = 3 (write barrier)
}

// Example: Sequential consistency (stronger ordering)
void sequential_consistent(void) {
    // Full memory barrier between all operations
    x = 1;
    mb();       // Full barrier
    r1 = y;
    mb();       // Full barrier
    z = 3;

    // Full barriers ensure strict ordering
    // x = 1 -> r1 = y -> z = 3
}
```

**Explanation**:

- **Load reordering** loads can be reordered in relaxed model
- **Store reordering** stores can be reordered in relaxed model
- **Read barrier** rmb() enforces load-load ordering
- **Write barrier** wmb() enforces store-store ordering
- **Full barrier** mb() enforces all ordering

## Atomic Operations and Ordering

**What**: Atomic operations provide ordering guarantees in addition to atomicity.

**Why**: Atomic operation ordering is important because:

- **Synchronization** - Atomic operations are used for synchronization
- **Ordering Guarantees** - Provide acquire/release semantics
- **Lock-Free Code** - Essential for lock-free data structures
- **Performance** - Better than locks for fine-grained synchronization
- **Correctness** - Ensures correct concurrent access

**How**: Atomic operation ordering works:

```c
// Example: Atomic operations with ordering
// Atomic operations can have memory ordering:
// __ATOMIC_RELAXED: No ordering guarantees
// __ATOMIC_ACQUIRE: Acquire semantics
// __ATOMIC_RELEASE: Release semantics
// __ATOMIC_ACQ_REL: Both acquire and release
// __ATOMIC_SEQ_CST: Sequential consistency

// Example: Atomic load with acquire
int atomic_load_acquire(atomic_t *ptr) {
    int value;

    // Load with acquire semantics
    value = __atomic_load_n(ptr, __ATOMIC_ACQUIRE);

    // All operations after this load see effects
    // of operations before corresponding release
    return value;
}

// Example: Atomic store with release
void atomic_store_release(atomic_t *ptr, int value) {
    // Store with release semantics
    __atomic_store_n(ptr, value, __ATOMIC_RELEASE);

    // All operations before this store visible
    // to operations after corresponding acquire
}

// Example: Atomic compare-and-swap with acquire-release
bool atomic_cas_acquire_release(atomic_t *ptr, int *expected, int desired) {
    // Compare-and-swap with acquire-release
    return __atomic_compare_exchange_n(ptr, expected, desired,
                                       false, __ATOMIC_ACQ_REL, __ATOMIC_ACQUIRE);
}

// Example: Lock-free queue using atomic operations
struct lockfree_queue {
    atomic_t head;
    atomic_t tail;
    void *buffer[QUEUE_SIZE];
};

bool enqueue_lockfree(struct lockfree_queue *q, void *item) {
    int tail, next_tail;

    do {
        // Load current tail with acquire
        tail = atomic_load_acquire(&q->tail);
        next_tail = (tail + 1) % QUEUE_SIZE;

        if (next_tail == atomic_load(&q->head)) {
            return false;  // Queue full
        }

        // CAS with acquire-release semantics
        // Ensures atomic update with ordering
    } while (!atomic_cas_acquire_release(&q->tail, &tail, next_tail));

    // Store item with release
    q->buffer[tail] = item;
    atomic_store_release(&q->buffer[tail], item);

    return true;
}

// Example: Atomic increment with ordering
void atomic_increment_ordered(atomic_t *counter) {
    // Fetch-and-add with acquire-release
    __atomic_add_fetch(counter, 1, __ATOMIC_ACQ_REL);

    // Ensure increment visible to other threads
    // and see all previous operations
}
```

**Explanation**:

- **Ordering semantics** atomic operations can specify ordering
- **Acquire load** atomic load with acquire sees prior release operations
- **Release store** atomic store with release makes operations visible to acquire
- **CAS ordering** compare-and-swap can have acquire-release semantics
- **Lock-free** atomic operations enable lock-free data structures

## Cache Coherency and Memory Ordering

**What**: Cache coherency ensures all processors see consistent memory values, working together with memory ordering.

**Why**: Cache coherency is essential because:

- **Consistency** - All cores see same memory values
- **Atomic Operations** - Required for atomic operations to work
- **Ordering** - Works with memory ordering for correctness
- **Performance** - Caches improve performance while maintaining correctness
- **Multi-Core** - Critical for multi-core systems

**How**: Cache coherency works:

```c
// Example: Cache coherency protocol (simplified)
// MESI protocol: Modified, Exclusive, Shared, Invalid
// Ensures all caches have consistent view of memory

// Example: Cache line states
enum cache_state {
    MODIFIED,   // Cache has exclusive modified copy
    EXCLUSIVE,  // Cache has exclusive unmodified copy
    SHARED,     // Cache has shared copy (read-only)
    INVALID     // Cache line invalid
};

// Example: Cache coherency for atomic operations
void atomic_operation_coherent(atomic_t *ptr, int value) {
    // Atomic operation requires cache coherency
    // 1. Acquire exclusive access to cache line
    // 2. Perform atomic operation
    // 3. Invalidate other caches' copies
    // 4. Update memory

    __atomic_store_n(ptr, value, __ATOMIC_RELEASE);

    // Cache coherency ensures:
    // - All cores see the update
    // - No stale data in other caches
    // - Atomic operation visible to all cores
}

// Example: Memory barrier and cache coherency
void barrier_with_coherency(void) {
    int x = 1;

    x = 2;
    mb();        // Memory barrier
    // Barrier ensures:
    // 1. All stores before complete
    // 2. Cache lines written back
    // 3. Other caches invalidated
    // 4. Operations after barrier see consistent state

    int y = x;   // Will see x = 2
}

// Example: False sharing and cache coherency
// False sharing: Multiple variables in same cache line
// Causes unnecessary cache invalidations

struct shared_data {
    int data1;   // These are in same cache line (64 bytes typical)
    int data2;
    int data3;
    int data4;
};

// Thread 1 modifies data1
void thread1_modify(struct shared_data *shared) {
    shared->data1 = 100;
    // This invalidates cache line in other cores
    // Even though they access different data fields
}

// Thread 2 modifies data2
void thread2_modify(struct shared_data *shared) {
    shared->data2 = 200;
    // Must reload cache line due to false sharing
}

// Solution: Padding to avoid false sharing
struct shared_data_padded {
    int data1;
    char padding[60];  // Pad to cache line size
    int data2;         // Now in different cache line
};
```

**Explanation**:

- **Cache coherency** hardware protocol ensures cache consistency
- **MESI protocol** common protocol for cache line states
- **Atomic operations** require exclusive cache line access
- **Memory barriers** interact with cache coherency
- **False sharing** performance problem when unrelated data shares cache line

## Kernel Memory Ordering Usage

**What**: Kernel uses memory ordering extensively for synchronization and concurrent operations.

**How**: Kernel ordering patterns:

```c
// Example: Kernel spinlock with memory ordering
DEFINE_SPINLOCK(my_lock);

void kernel_critical_section(void) {
    // Acquire lock (has acquire semantics)
    spin_lock(&my_lock);

    // Critical section code
    // All operations in critical section
    // see effects of previous unlock

    // Release lock (has release semantics)
    spin_unlock(&my_lock);
    // All operations in critical section
    // visible to next lock acquisition
}

// Example: RCU (Read-Copy-Update) memory ordering
struct rcu_head {
    struct rcu_head *next;
    void (*func)(struct rcu_head *head);
};

// RCU uses memory ordering for read-side critical sections
void rcu_read_lock(void) {
    // Acquire semantics: ensure we see all updates
    // before entering read-side critical section
    preempt_disable();
    rcu_read_acquire();
}

void rcu_read_unlock(void) {
    // Release semantics: ensure reads complete
    // before exiting critical section
    rcu_read_release();
    preempt_enable();
}

// Example: Per-CPU variables with memory ordering
DEFINE_PER_CPU(int, cpu_counter);

void increment_per_cpu_counter(void) {
    // Per-CPU variables reduce need for barriers
    // Each CPU has own copy, no sharing

    // Still need barriers if accessing from different context
    this_cpu_inc(cpu_counter);

    // If accessed from interrupt context:
    // Need barriers to ensure visibility
}

// Example: Memory-mapped I/O ordering
void write_mmio_register(void __iomem *reg, u32 value) {
    // Memory-mapped I/O requires strict ordering
    // Cannot reorder I/O operations

    writel(value, reg);
    // wmb() implicit in writel for I/O
    // Ensures write completes before next operation
}
```

**Explanation**:

- **Spinlocks** use acquire/release semantics for correct locking
- **RCU** uses memory ordering for lock-free read paths
- **Per-CPU variables** reduce ordering requirements
- **MMIO** requires strict ordering for device registers
- **Kernel patterns** kernel has standard patterns for ordering

## Next Steps

**What** you're ready for next:

After mastering memory ordering, you should be ready to:

1. **Learn Virtual Memory** - Page-based virtual memory system
2. **Study Page Tables** - How page tables organize memory
3. **Understand TLB** - Translation Lookaside Buffer management
4. **Explore Memory Protection** - Memory protection mechanisms
5. **Begin Memory Management** - Apply ordering and memory knowledge

**Where** to go next:

Continue with the next lesson on **"Virtual Memory"** to learn:

- Virtual address translation
- Page table structure
- Page-based memory management
- Virtual memory benefits
- Kernel virtual memory management

**Why** the next lesson is important:

Virtual memory is fundamental to modern operating systems. Understanding virtual memory is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine virtual memory code
2. **Read Spec** - Study RISC-V virtual memory specification
3. **Use Debugger** - Debug virtual memory issues
4. **Write Code** - Implement virtual memory operations
5. **Analyze Traces** - Study virtual memory access patterns

## Resources

**Official Documentation**:

- [RISC-V ISA Manual - Memory Model](https://github.com/riscv/riscv-isa-manual) - Memory ordering specification
- [RISC-V Memory Consistency Model](https://github.com/riscv/riscv-isa-manual/blob/master/src/memory.tex) - Detailed ordering rules

**Kernel Sources**:

- [Linux RISC-V Memory Code](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Kernel memory implementation
