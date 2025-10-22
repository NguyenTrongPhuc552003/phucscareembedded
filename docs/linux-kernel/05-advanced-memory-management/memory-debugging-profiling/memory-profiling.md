---
sidebar_position: 2
---

# Memory Profiling

Master memory profiling techniques in the Linux kernel, understanding how to analyze memory usage patterns and optimize memory consumption on the Rock 5B+ platform.

## What is Memory Profiling?

**What**: Memory profiling is the process of analyzing memory allocation patterns, usage, and performance to identify optimization opportunities and diagnose memory-related issues in kernel code.

**Why**: Understanding memory profiling is crucial because:

- **Performance optimization** - Identify memory bottlenecks
- **Resource efficiency** - Optimize memory usage
- **Memory patterns** - Understand allocation behavior
- **Problem diagnosis** - Root cause analysis of memory issues
- **Rock 5B+ optimization** - Limited memory resources
- **Professional development** - Essential performance tuning skill

**When**: Memory profiling is used when:

- **Performance tuning** - Optimizing system performance
- **Memory pressure** - System running low on memory
- **Allocation analysis** - Understanding memory patterns
- **Optimization** - Reducing memory footprint
- **Development** - Verifying efficient memory usage
- **ARM64 systems** - Embedded platform optimization

**How**: Memory profiling works by:

- **Allocation tracking** - Recording memory allocations
- **Usage analysis** - Analyzing memory consumption patterns
- **Stack traces** - Identifying allocation call sites
- **Statistics collection** - Gathering memory metrics
- **Visualization** - Presenting profiling data
- **Optimization** - Applying improvements

**Where**: Memory profiling is found in:

- **Kernel development** - Performance optimization
- **Driver development** - Memory usage analysis
- **System tuning** - Production optimization
- **Debugging** - Memory issue diagnosis
- **Rock 5B+** - ARM64 kernel development
- **Embedded systems** - Resource-constrained platforms

## Profiling Tools

**What**: The Linux kernel provides various tools for memory profiling including perf, ftrace, and /proc interfaces.

**Why**: Understanding profiling tools is important because:

- **Tool selection** - Choose appropriate tool for task
- **Data collection** - Gather relevant metrics
- **Analysis** - Interpret profiling results
- **Optimization** - Apply improvements based on data

**How**: Profiling tools work through:

```bash
# Memory profiling tools on Rock 5B+

# 1. perf memory profiling
# Record memory allocations
perf record -e kmem:kmalloc,kmem:kfree -a sleep 10

# Analyze allocation patterns
perf report

# Show top memory allocators
perf top -e kmem:kmalloc

# 2. ftrace memory tracking
# Enable memory tracing
echo 1 > /sys/kernel/debug/tracing/events/kmem/enable

# Read trace
cat /sys/kernel/debug/tracing/trace | head -50

# Filter specific function
echo 'call_site=="my_driver_probe"' > /sys/kernel/debug/tracing/events/kmem/filter

# Disable tracing
echo 0 > /sys/kernel/debug/tracing/events/kmem/enable

# 3. /proc/meminfo analysis
cat /proc/meminfo

# Monitor memory changes
watch -n 1 cat /proc/meminfo

# 4. /proc/slabinfo monitoring
cat /proc/slabinfo | head -20

# Watch specific cache
watch -n 1 'cat /proc/slabinfo | grep my_cache'

# 5. /proc/vmstat statistics
cat /proc/vmstat | grep -E 'pgalloc|pgfree|pgmigrate'

# Monitor allocation/free rates
watch -n 1 'cat /proc/vmstat | grep -E "pgalloc|pgfree"'

# 6. Page owner tracking (if enabled)
# CONFIG_PAGE_OWNER=y
cat /sys/kernel/debug/page_owner > page_owner.txt

# Analyze top page allocators
cat page_owner.txt | grep "PFN" -A 10 | head -100
```

**Explanation**:

- **perf** - Performance profiling framework
- **ftrace** - Kernel function tracer
- **/proc/meminfo** - System memory information
- **/proc/slabinfo** - Slab allocator statistics
- **/proc/vmstat** - Virtual memory statistics
- **page_owner** - Page allocation tracking

## Allocation Pattern Analysis

**What**: Analyzing memory allocation patterns helps identify inefficient memory usage, excessive allocations, and optimization opportunities.

**Why**: Understanding allocation patterns is important because:

- **Hotspots** - Identify frequent allocators
- **Size distribution** - Understand allocation sizes
- **Temporal patterns** - When allocations occur
- **Optimization targets** - Focus optimization efforts

**How**: Allocation pattern analysis works through:

```c
// Example: Memory allocation instrumentation
#include <linux/slab.h>
#include <linux/kernel.h>

// 1. Custom allocation tracking
struct alloc_stats {
    atomic_t total_allocs;
    atomic_t total_frees;
    atomic64_t bytes_allocated;
    atomic64_t bytes_freed;
};

static struct alloc_stats my_stats;

void *tracked_kmalloc(size_t size, gfp_t flags) {
    void *ptr;

    ptr = kmalloc(size, flags);
    if (ptr) {
        atomic_inc(&my_stats.total_allocs);
        atomic64_add(size, &my_stats.bytes_allocated);
    }

    return ptr;
}

void tracked_kfree(const void *ptr, size_t size) {
    if (ptr) {
        kfree(ptr);
        atomic_inc(&my_stats.total_frees);
        atomic64_add(size, &my_stats.bytes_freed);
    }
}

void print_alloc_stats(void) {
    pr_info("Allocations: %d, Frees: %d\n",
            atomic_read(&my_stats.total_allocs),
            atomic_read(&my_stats.total_frees));
    pr_info("Bytes allocated: %lld, freed: %lld\n",
            atomic64_read(&my_stats.bytes_allocated),
            atomic64_read(&my_stats.bytes_freed));
}

// 2. Per-CPU allocation tracking
DEFINE_PER_CPU(unsigned long, alloc_count);

void count_allocation(void) {
    this_cpu_inc(alloc_count);
}

unsigned long get_total_allocs(void) {
    unsigned long total = 0;
    int cpu;

    for_each_possible_cpu(cpu)
        total += per_cpu(alloc_count, cpu);

    return total;
}

// 3. Size histogram
#define SIZE_BUCKETS 10
static atomic_t size_histogram[SIZE_BUCKETS];

void record_alloc_size(size_t size) {
    int bucket;

    // Categorize by size
    if (size <= 64)
        bucket = 0;
    else if (size <= 256)
        bucket = 1;
    else if (size <= 1024)
        bucket = 2;
    else if (size <= 4096)
        bucket = 3;
    else
        bucket = 4;

    atomic_inc(&size_histogram[bucket]);
}

void print_size_histogram(void) {
    pr_info("Size histogram:\n");
    pr_info("  0-64:     %d\n", atomic_read(&size_histogram[0]));
    pr_info("  65-256:   %d\n", atomic_read(&size_histogram[1]));
    pr_info("  257-1024: %d\n", atomic_read(&size_histogram[2]));
    pr_info("  1025-4096:%d\n", atomic_read(&size_histogram[3]));
    pr_info("  >4096:    %d\n", atomic_read(&size_histogram[4]));
}
```

**Explanation**:

- **Allocation tracking** - Count allocations and bytes
- **Per-CPU stats** - Lock-free statistics collection
- **Size histogram** - Distribution of allocation sizes
- **Custom instrumentation** - Track specific allocations

## Rock 5B+ Memory Profiling

**What**: Memory profiling on Rock 5B+ requires understanding ARM64-specific tools and optimizations for embedded systems.

**Why**: Understanding Rock 5B+ profiling is important because:

- **ARM64 architecture** - Platform-specific profiling
- **Limited resources** - Efficient profiling critical
- **RK3588 specifics** - SoC-specific considerations
- **Production systems** - Low-overhead profiling

**How**: Rock 5B+ memory profiling involves:

```bash
# Rock 5B+ specific memory profiling

# 1. ARM64 perf events
# List available memory events
perf list | grep mem

# Profile memory accesses
perf record -e armv8_pmuv3/mem_access/ -a sleep 5
perf report

# 2. Monitor memory bandwidth
# Using ARM PMU
perf stat -e armv8_pmuv3/l1d_cache_refill/,armv8_pmuv3/l1d_cache/ sleep 1

# 3. CMA allocation monitoring
cat /proc/meminfo | grep Cma
watch -n 1 'cat /proc/meminfo | grep Cma'

# 4. Per-NUMA node statistics (if applicable)
cat /sys/devices/system/node/node0/meminfo

# 5. Memory pressure monitoring
cat /proc/pressure/memory

# 6. ION memory tracking (if using ION allocator)
cat /sys/kernel/debug/ion/heaps/*

# 7. Custom profiling script
#!/bin/bash
LOG_FILE="/var/log/memory_profile.log"

while true; do
    TIMESTAMP=$(date +%s)
    MEM_FREE=$(cat /proc/meminfo | grep MemFree | awk '{print $2}')
    MEM_AVAIL=$(cat /proc/meminfo | grep MemAvailable | awk '{print $2}')
    SLAB=$(cat /proc/meminfo | grep "^Slab:" | awk '{print $2}')

    echo "$TIMESTAMP,$MEM_FREE,$MEM_AVAIL,$SLAB" >> $LOG_FILE
    sleep 1
done

# 8. Analyze profiling data
#!/bin/bash
# Find memory trend
awk -F',' '{print $1, $2}' /var/log/memory_profile.log | \
    gnuplot -e "set term png; set output 'memory_trend.png'; \
                plot '-' using 1:2 with lines title 'Free Memory'"
```

**Explanation**:

- **ARM PMU** - ARM Performance Monitoring Unit
- **CMA monitoring** - Contiguous Memory Allocator tracking
- **Memory pressure** - PSI (Pressure Stall Information)
- **Custom logging** - Continuous monitoring
- **Data visualization** - Trend analysis

## Key Takeaways

**What** you've accomplished:

1. **Profiling Understanding** - You understand memory profiling techniques
2. **Tool Usage** - You can use perf, ftrace, and /proc interfaces
3. **Pattern Analysis** - You can analyze allocation patterns
4. **Optimization** - You know how to optimize based on profiling data
5. **Rock 5B+ Profiling** - You understand ARM64 specific profiling

**Why** these concepts matter:

- **Performance** - Profiling identifies optimization opportunities
- **Resource efficiency** - Understanding memory usage
- **Problem diagnosis** - Root cause analysis
- **Platform knowledge** - Rock 5B+ specific optimization

**When** to use these concepts:

- **Performance tuning** - Optimizing system performance
- **Memory investigation** - Diagnosing memory issues
- **Development** - Verifying efficient implementation
- **Production monitoring** - Continuous performance tracking

**Where** these skills apply:

- **Kernel development** - Performance optimization
- **Driver development** - Memory usage analysis
- **System administration** - Production tuning
- **Rock 5B+** - ARM64 embedded development

## Next Steps

Continue with:

1. **OOM Handling** - Handle out-of-memory conditions

## Resources

**Official Documentation**:

- [perf](https://www.kernel.org/doc/html/latest/admin-guide/perf-security.html) - perf profiling tool
- [ftrace](https://www.kernel.org/doc/html/latest/trace/ftrace.html) - Function tracer

**Learning Resources**:

- [Systems Performance](https://www.brendangregg.com/systems-performance-2nd-edition-book.html) - Performance analysis

**Rock 5B+ Specific**:

- [ARM PMU](https://developer.arm.com/documentation/) - ARM Performance Monitoring

Happy learning! 🐧
