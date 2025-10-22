---
sidebar_position: 1
---

# Per-CPU Variables

Master per-CPU variables in the Linux kernel, understanding how to achieve lock-free performance through CPU-local data on the Rock 5B+ 8-core platform.

## What are Per-CPU Variables?

**What**: Per-CPU variables are data structures with separate instances for each CPU, allowing lock-free access since each CPU accesses only its own copy.

**Why**: Understanding per-CPU variables is crucial because:

- **Lock-free access** - No synchronization overhead
- **Cache efficiency** - Each CPU accesses its own cache line
- **Scalability** - Perfect scaling with CPU count
- **Performance** - Eliminates lock contention
- **Rock 5B+ development** - Optimal for 8-core ARM64 CPU
- **Professional development** - Essential for high-performance code

**When**: Per-CPU variables are used when:

- **Statistics collection** - Per-CPU counters
- **Resource caching** - Per-CPU memory pools
- **Lock-free algorithms** - Avoiding synchronization
- **Interrupt context** - Safe in any context
- **Multi-core systems** - Rock 5B+ 8-core optimization
- **Performance critical** - Eliminating contention

**How**: Per-CPU variables work by:

- **Separate instances** - One copy per CPU
- **CPU binding** - Access through current CPU
- **Preemption control** - Disabling migration
- **Memory layout** - Separate cache lines
- **Dynamic allocation** - Runtime per-CPU allocation
- **Aggregation** - Combining per-CPU values

**Where**: Per-CPU variables are found in:

- **Statistics** - Network stats, memory stats
- **Caching** - Slab allocator, page allocator
- **Scheduling** - Per-CPU run queues
- **Networking** - Per-CPU packet queues
- **Memory management** - Per-CPU page lists
- **Rock 5B+** - ARM64 kernel subsystems

## Per-CPU Variable Declaration

**What**: The kernel provides macros for declaring and defining per-CPU variables, both static and dynamic.

**Why**: Understanding declaration is important because:

- **Proper usage** - Correct declaration syntax
- **Type safety** - Compiler checks
- **Memory efficiency** - Optimal layout
- **Initialization** - Proper setup

**How**: Per-CPU declaration works through:

```c
// Example: Per-CPU variable declaration
#include <linux/percpu.h>

// 1. Static per-CPU variable declaration
DEFINE_PER_CPU(int, cpu_counter);

// Multiple variables
DEFINE_PER_CPU(long, cpu_stat1);
DEFINE_PER_CPU(long, cpu_stat2);

// 2. Per-CPU structure
struct cpu_data {
    int counter;
    long timestamp;
    void *buffer;
};

DEFINE_PER_CPU(struct cpu_data, cpu_info);

// 3. Per-CPU array
DEFINE_PER_CPU(int[10], cpu_array);

// 4. Per-CPU pointer
DEFINE_PER_CPU(struct data *, cpu_ptr);

// 5. Initialization with value
DEFINE_PER_CPU(int, initialized_counter) = 100;

// 6. External declaration (in header file)
// header.h
DECLARE_PER_CPU(int, shared_counter);

// source.c
DEFINE_PER_CPU(int, shared_counter);

// 7. Per-CPU with specific section
DEFINE_PER_CPU_SECTION(int, special_var, ".data..percpu");
```

**Explanation**:

- **DEFINE_PER_CPU** - Define per-CPU variable
- **DECLARE_PER_CPU** - Declare (in headers)
- **Initialization** - Can initialize with value
- **Structures** - Can be complex types
- **Arrays** - Per-CPU arrays supported

## Per-CPU Variable Access

**What**: Accessing per-CPU variables requires special macros to ensure accessing the current CPU's copy safely.

**Why**: Understanding access is important because:

- **Correctness** - Prevent accessing wrong CPU's copy
- **Race conditions** - Avoid migration issues
- **Performance** - Efficient access patterns
- **Safety** - Proper preemption handling

**How**: Per-CPU access works through:

```c
// Example: Per-CPU variable access

// 1. Basic access (must disable preemption)
void basic_percpu_access(void) {
    int *ptr;
    int value;

    // Get pointer to this CPU's variable
    ptr = this_cpu_ptr(&cpu_counter);
    value = *ptr;

    // Or use this_cpu_read
    value = this_cpu_read(cpu_counter);
}

// 2. Read operations
void percpu_read_ops(void) {
    int value;
    long stat;

    // Read this CPU's value
    value = this_cpu_read(cpu_counter);

    // Read with pointer
    stat = this_cpu_read(cpu_stat1);
}

// 3. Write operations
void percpu_write_ops(void) {
    // Write to this CPU's variable
    this_cpu_write(cpu_counter, 42);

    // Add to this CPU's variable
    this_cpu_add(cpu_counter, 10);

    // Subtract
    this_cpu_sub(cpu_counter, 5);

    // Increment
    this_cpu_inc(cpu_counter);

    // Decrement
    this_cpu_dec(cpu_counter);
}

// 4. Atomic operations (on this CPU)
void percpu_atomic_ops(void) {
    int old_value;

    // Add and return old value
    old_value = this_cpu_add_return(cpu_counter, 5);

    // Increment and test
    if (this_cpu_inc_and_test(cpu_counter))
        pr_info("Counter is zero\n");

    // Compare and exchange
    this_cpu_cmpxchg(cpu_counter, 10, 20);
}

// 5. Accessing with preemption disabled
void safe_percpu_access(void) {
    int *ptr;

    // Disable preemption
    preempt_disable();

    // Safe to access - won't migrate
    ptr = this_cpu_ptr(&cpu_counter);
    *ptr += 10;

    // Re-enable preemption
    preempt_enable();
}

// 6. get_cpu_var pattern (disables preemption)
void get_cpu_var_example(void) {
    int *ptr;

    // Get variable and disable preemption
    ptr = get_cpu_ptr(&cpu_counter);

    // Access safely
    *ptr += 5;

    // Put variable and enable preemption
    put_cpu_ptr(&cpu_counter);
}

// 7. Accessing other CPU's variable
void access_other_cpu(int cpu_id) {
    int value;

    // Access specific CPU's variable
    value = per_cpu(cpu_counter, cpu_id);

    // Read all CPUs
    int cpu;
    for_each_possible_cpu(cpu) {
        value = per_cpu(cpu_counter, cpu);
        pr_info("CPU %d counter: %d\n", cpu, value);
    }
}

// 8. Structure access
void percpu_struct_access(void) {
    struct cpu_data *data;

    preempt_disable();

    data = this_cpu_ptr(&cpu_info);
    data->counter++;
    data->timestamp = jiffies;

    preempt_enable();
}
```

**Explanation**:

- **this_cpu_read/write** - Access current CPU's copy
- **this_cpu_add/inc** - Modify current CPU's copy
- **preempt_disable** - Prevent migration during access
- **get_cpu_ptr** - Get and disable preemption
- **per_cpu** - Access specific CPU's copy

## Dynamic Per-CPU Allocation

**What**: Per-CPU memory can be dynamically allocated at runtime using alloc_percpu().

**Why**: Understanding dynamic allocation is important because:

- **Flexibility** - Allocate as needed
- **Large structures** - For big per-CPU data
- **Module usage** - Modules can't use static per-CPU
- **Resource management** - Allocate/free dynamically

**How**: Dynamic allocation works through:

```c
// Example: Dynamic per-CPU allocation

// 1. Basic allocation
struct my_stats *stats;

int init_percpu_stats(void) {
    // Allocate per-CPU structure
    stats = alloc_percpu(struct my_stats);
    if (!stats)
        return -ENOMEM;

    // Initialize each CPU's copy
    int cpu;
    for_each_possible_cpu(cpu) {
        struct my_stats *s = per_cpu_ptr(stats, cpu);
        memset(s, 0, sizeof(*s));
    }

    return 0;
}

void cleanup_percpu_stats(void) {
    free_percpu(stats);
}

// 2. Using dynamically allocated per-CPU data
void update_stats(void) {
    struct my_stats *s;

    // Get this CPU's stats
    s = this_cpu_ptr(stats);

    preempt_disable();
    s->packets++;
    s->bytes += packet_size;
    preempt_enable();
}

// 3. Per-CPU counter (simple wrapper)
struct percpu_counter {
    s64 count;
    struct percpu_counter __percpu *counters;
};

int init_percpu_counter(struct percpu_counter *fbc, s64 amount) {
    fbc->count = amount;

    fbc->counters = alloc_percpu(s64);
    if (!fbc->counters)
        return -ENOMEM;

    return 0;
}

void percpu_counter_add(struct percpu_counter *fbc, s64 amount) {
    s64 *pcount;

    preempt_disable();
    pcount = this_cpu_ptr(fbc->counters);
    *pcount += amount;
    preempt_enable();
}

s64 percpu_counter_sum(struct percpu_counter *fbc) {
    s64 ret = fbc->count;
    int cpu;

    for_each_possible_cpu(cpu) {
        s64 *pcount = per_cpu_ptr(fbc->counters, cpu);
        ret += *pcount;
    }

    return ret;
}

// 4. Per-CPU reference counting
struct percpu_ref {
    atomic_long_t count;
    unsigned long __percpu *percpu_count;
};

void percpu_ref_get(struct percpu_ref *ref) {
    unsigned long *count;

    rcu_read_lock();
    count = this_cpu_ptr(ref->percpu_count);
    (*count)++;
    rcu_read_unlock();
}

void percpu_ref_put(struct percpu_ref *ref) {
    unsigned long *count;

    rcu_read_lock();
    count = this_cpu_ptr(ref->percpu_count);
    if (--(*count) == 0)
        wake_up_release();
    rcu_read_unlock();
}
```

**Explanation**:

- **alloc_percpu** - Allocate per-CPU memory
- **free_percpu** - Free per-CPU memory
- **per_cpu_ptr** - Get pointer to CPU's copy
- **Aggregation** - Sum across all CPUs

## Rock 5B+ Per-CPU Optimization

**What**: The Rock 5B+ platform's 8-core ARM64 CPU benefits significantly from per-CPU variables for scalability.

**Why**: Understanding Rock 5B+ per-CPU is important because:

- **8-core CPU** - Excellent scalability potential
- **ARM64 architecture** - Efficient per-CPU access
- **Cache line size** - 64-byte cache lines
- **NUMA** - Single node, uniform access

**How**: Rock 5B+ per-CPU involves:

```bash
# Rock 5B+ per-CPU monitoring and optimization

# 1. View per-CPU layout
cat /proc/cpuinfo | grep processor

# 2. Check per-CPU memory usage
cat /proc/meminfo | grep Percpu

# 3. Monitor per-CPU statistics
mpstat -P ALL 1

# 4. View per-CPU softirq distribution
cat /proc/softirqs

# 5. Check cache line size (important for alignment)
getconf LEVEL1_DCACHE_LINESIZE
# Should be 64 bytes on ARM64

# 6. Monitor per-CPU load
cat /proc/stat | grep ^cpu

# 7. Check CPU affinity
taskset -p $$

# 8. Profile per-CPU access patterns
perf stat -e cache-misses,cache-references -a sleep 5

# 9. View per-CPU IRQ distribution
cat /proc/interrupts

# 10. Check per-CPU kernel memory
cat /proc/slabinfo | grep -i cpu
```

**Explanation**:

- **8 CPUs** - Rock 5B+ has 8 cores
- **Cache lines** - 64-byte alignment for per-CPU data
- **softirqs** - Per-CPU softirq handling
- **Load distribution** - Check balanced load

## Key Takeaways

**What** you've accomplished:

1. **Per-CPU Understanding** - You understand per-CPU variables
2. **Declaration** - You know how to declare per-CPU data
3. **Access Patterns** - You can safely access per-CPU variables
4. **Dynamic Allocation** - You know dynamic per-CPU allocation
5. **Rock 5B+ Optimization** - You understand 8-core ARM64 usage

**Why** these concepts matter:

- **Performance** - Lock-free access, no contention
- **Scalability** - Perfect scaling with CPU count
- **Cache efficiency** - Each CPU uses its own cache line
- **Platform knowledge** - Rock 5B+ 8-core optimization

**When** to use these concepts:

- **Statistics** - Per-CPU counters and stats
- **Caching** - Per-CPU resource pools
- **Lock-free** - Avoiding synchronization
- **Performance** - Eliminating lock contention

**Where** these skills apply:

- **Kernel development** - All performance-critical code
- **Driver development** - Per-CPU statistics
- **Network stack** - Per-CPU packet processing
- **Rock 5B+** - ARM64 multi-core programming

## Next Steps

Continue with:

1. **Workqueue Framework** - Deferred work execution

## Resources

**Official Documentation**:

- [Per-CPU Variables](https://www.kernel.org/doc/html/latest/core-api/this_cpu_ops.html) - Per-CPU operations
- [Percpu](https://www.kernel.org/doc/html/latest/core-api/percpu-rw-semaphore.html) - Per-CPU API

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Per-CPU chapter

**Rock 5B+ Specific**:

- [ARM64 SMP](https://developer.arm.com/documentation/den0024/latest) - ARM64 multi-core architecture

Happy learning! 🐧
