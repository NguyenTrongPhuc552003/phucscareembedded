---
sidebar_position: 2
---

# Performance Tuning

Master kernel performance tuning techniques to optimize system performance based on profiling data, understanding how to configure kernel parameters and apply hardware-specific optimizations on Rock 5B+.

## What is Performance Tuning?

**What**: Performance tuning is the process of adjusting kernel parameters, configurations, and code to optimize system performance for specific workloads and hardware platforms.

**Why**: Understanding performance tuning is crucial because:

- **Workload Optimization**: Maximize performance for specific use cases
- **Resource Efficiency**: Better utilize available hardware resources
- **Latency Reduction**: Minimize response times and delays
- **Throughput Improvement**: Increase system processing capacity
- **Power Efficiency**: Balance performance with power consumption
- **Professional Development**: Essential skill for systems engineers

**When**: Performance tuning is applied when:

- **Performance Requirements**: System must meet specific performance targets
- **Workload Changes**: New workloads require different optimizations
- **Hardware Upgrades**: New hardware enables new optimizations
- **Production Deployment**: Preparing systems for production use
- **Benchmark Testing**: Optimizing for benchmark performance
- **Real-time Requirements**: Meeting strict timing deadlines

**How**: Performance tuning involves:

```c
// Example: Kernel performance tuning
// Scheduler tuning
CONFIG_PREEMPT=y              // Preemptible kernel
CONFIG_PREEMPT_COUNT=y        // Track preemption depth
CONFIG_HZ_1000=y              // 1000 Hz timer frequency
CONFIG_NO_HZ_FULL=y           // Tickless operation

// Memory management tuning
vm.swappiness = 10            // Reduce swapping
vm.dirty_ratio = 15           // Dirty page threshold
vm.dirty_background_ratio = 5 // Background writeback threshold
vm.vfs_cache_pressure = 50    // VFS cache reclaim pressure

// Network tuning
net.core.netdev_max_backlog = 5000
net.core.rmem_max = 16777216
net.core.wmem_max = 16777216
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216

// Kernel parameter structure
struct kernel_param {
    const char *name;
    const struct kernel_param_ops *ops;
    u16 perm;
    s8 level;
    u8 flags;
    union {
        void *arg;
        const struct kparam_string *str;
        const struct kparam_array *arr;
    };
};
```

**Where**: Performance tuning is essential in:

- **High-performance servers**: Database and web servers
- **Real-time systems**: Industrial control and automation
- **Embedded systems**: Rock 5B+ optimization
- **Cloud computing**: Virtual machine optimization
- **HPC systems**: High-performance computing clusters

## Kernel Parameter Tuning

**What**: Kernel parameter tuning involves adjusting runtime and compile-time kernel parameters to optimize system behavior for specific workloads.

**Why**: Understanding parameter tuning is important because:

- **Workload Adaptation**: Tailor kernel behavior to specific workloads
- **Performance Impact**: Parameters significantly affect performance
- **Resource Management**: Control how kernel manages resources
- **Dynamic Adjustment**: Change behavior without kernel recompilation
- **Production Flexibility**: Tune production systems without downtime

**How**: Kernel parameters are tuned through:

```c
// Example: Key kernel parameters
// Scheduler parameters
// /proc/sys/kernel/sched_*
kernel.sched_min_granularity_ns = 1000000      // Minimum task runtime
kernel.sched_wakeup_granularity_ns = 2000000   // Wakeup preemption threshold
kernel.sched_latency_ns = 6000000              // Target scheduler latency
kernel.sched_migration_cost_ns = 500000        // Migration cost threshold
kernel.sched_nr_migrate = 32                   // Max tasks to migrate
kernel.sched_rt_runtime_us = 950000            // RT runtime limit
kernel.sched_rt_period_us = 1000000            // RT period

// Memory management parameters
// /proc/sys/vm/*
vm.swappiness = 10                  // Swapping tendency (0-100)
vm.dirty_ratio = 15                 // Dirty pages threshold
vm.dirty_background_ratio = 5       // Background writeback threshold
vm.dirty_expire_centisecs = 3000    // Dirty page expiration
vm.dirty_writeback_centisecs = 500  // Writeback frequency
vm.min_free_kbytes = 67584          // Minimum free memory
vm.vfs_cache_pressure = 50          // VFS cache reclaim pressure
vm.overcommit_memory = 0            // Overcommit policy
vm.overcommit_ratio = 50            // Overcommit ratio

// File system parameters
fs.file-max = 2097152               // Maximum file handles
fs.aio-max-nr = 1048576             // Maximum AIO requests
fs.inotify.max_user_watches = 524288 // Inotify watches

// Network parameters
net.core.netdev_max_backlog = 5000
net.core.rmem_default = 262144
net.core.rmem_max = 16777216
net.core.wmem_default = 262144
net.core.wmem_max = 16777216
net.core.optmem_max = 40960
net.ipv4.tcp_rmem = 4096 87380 16777216
net.ipv4.tcp_wmem = 4096 65536 16777216
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_tw_reuse = 1

// Parameter modification at runtime
// sysctl -w kernel.sched_min_granularity_ns=1000000

// Persistent parameter changes
// /etc/sysctl.conf or /etc/sysctl.d/*.conf
```

**Explanation**:

- **Scheduler parameters**: Control CPU scheduling behavior
- **Memory parameters**: Manage memory allocation and swapping
- **File system parameters**: Configure file system limits
- **Network parameters**: Optimize network stack performance
- **Runtime adjustment**: Change parameters without reboot

**Where**: Parameter tuning is applied in:

- **Server optimization**: Web, database, and application servers
- **Real-time systems**: Meeting real-time deadlines
- **Embedded systems**: Rock 5B+ optimization
- **Container systems**: Docker and Kubernetes optimization
- **Virtual machines**: VM performance tuning

## Hardware-Specific Optimizations

**What**: Hardware-specific optimizations leverage unique hardware features and characteristics to maximize performance on specific platforms like Rock 5B+.

**Why**: Understanding hardware optimizations is important because:

- **Performance Gains**: Significant performance improvements
- **Architecture Utilization**: Fully utilize hardware capabilities
- **Efficiency**: Better resource utilization
- **Platform Mastery**: Deep understanding of target hardware
- **Competitive Advantage**: Optimize beyond generic configurations

**How**: Hardware optimizations are implemented through:

```c
// Example: ARM64/Rock 5B+ specific optimizations
// CPU affinity and NUMA optimization
#include <linux/cpumask.h>
#include <linux/sched.h>

// Pin task to specific CPU
static int pin_to_cpu(struct task_struct *task, int cpu)
{
    struct cpumask mask;
    
    cpumask_clear(&mask);
    cpumask_set_cpu(cpu, &mask);
    
    return sched_setaffinity(task->pid, &mask);
}

// ARM64 cache optimization
static inline void arm64_flush_dcache_range(void *addr, size_t size)
{
    void *end = addr + size;
    
    // Data cache clean and invalidate
    asm volatile(
        "1: dc civac, %0\n"
        "   add %0, %0, #64\n"
        "   cmp %0, %1\n"
        "   b.lo 1b\n"
        "   dsb sy\n"
        : "+r"(addr)
        : "r"(end)
        : "memory"
    );
}

// SIMD optimization using ARM NEON
static void neon_memcpy(void *dst, const void *src, size_t n)
{
    // Use NEON instructions for faster memory copy
    asm volatile(
        "1: ldp q0, q1, [%1], #32\n"
        "   stp q0, q1, [%0], #32\n"
        "   subs %2, %2, #32\n"
        "   b.ne 1b\n"
        : "+r"(dst), "+r"(src), "+r"(n)
        :
        : "q0", "q1", "memory"
    );
}

// CPU frequency scaling
// /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
// performance - Maximum frequency
// powersave - Minimum frequency
// ondemand - Dynamic frequency scaling
// conservative - Gradual frequency scaling
// schedutil - Scheduler-driven frequency scaling

// ARM64 specific kernel config
CONFIG_ARM64=y
CONFIG_ARM64_PAGE_SHIFT=12        // 4K pages
CONFIG_ARM64_VA_BITS_48=y         // 48-bit virtual addresses
CONFIG_ARM64_LSE_ATOMICS=y        // Large System Extensions
CONFIG_ARM64_PAN=y                // Privileged Access Never
CONFIG_ARM64_CNP=y                // Common Not Private
CONFIG_ARM64_DMA_USE_IOMMU=y      // IOMMU for DMA
```

**Explanation**:

- **CPU affinity**: Bind tasks to specific CPUs for cache locality
- **Cache optimization**: Minimize cache misses through proper alignment
- **SIMD instructions**: Use ARM NEON for vectorized operations
- **Frequency scaling**: Balance performance and power consumption
- **IOMMU**: Use hardware IOMMU for efficient DMA

**Where**: Hardware optimizations are critical in:

- **ARM64 systems**: Rock 5B+ and similar platforms
- **Real-time systems**: Deterministic performance
- **High-performance computing**: Maximum throughput
- **Embedded systems**: Resource-constrained environments
- **Mobile devices**: Power-efficient performance

## Workload-Specific Optimization

**What**: Workload-specific optimization tailors kernel configuration and parameters to the characteristics of specific application workloads.

**Why**: Understanding workload optimization is important because:

- **Targeted Performance**: Optimize for specific use cases
- **Efficiency**: Eliminate unnecessary overhead
- **Resource Allocation**: Allocate resources based on workload needs
- **Scalability**: Scale efficiently with workload growth
- **Cost Effectiveness**: Maximize hardware utilization

**How**: Workload optimization is achieved through:

```c
// Example: Workload-specific tuning
// Database workload optimization
// Large memory, high I/O
vm.swappiness = 1                    // Minimal swapping
vm.dirty_ratio = 40                  // High dirty threshold
vm.dirty_background_ratio = 10       // Delayed writeback
vm.min_free_kbytes = 262144          // Large free memory reserve
vm.zone_reclaim_mode = 0             // NUMA reclaim disabled

// File system tuning for databases
// mount -o noatime,nodiratime,data=writeback /dev/sda1 /data

// Web server optimization
// Many connections, network I/O
net.core.somaxconn = 4096
net.ipv4.tcp_max_syn_backlog = 8192
net.ipv4.tcp_fin_timeout = 30
net.ipv4.tcp_keepalive_time = 300
net.ipv4.tcp_keepalive_probes = 5
net.ipv4.tcp_keepalive_intvl = 15

// Real-time workload optimization
// Deterministic timing, low latency
CONFIG_PREEMPT_RT=y                  // Full preemption
CONFIG_HIGH_RES_TIMERS=y             // High-resolution timers
CONFIG_NO_HZ_FULL=y                  // Tickless operation
CONFIG_RCU_NOCB_CPU=y                // Offload RCU callbacks
CONFIG_IRQ_FORCED_THREADING=y        // Thread all IRQs

// CPU isolation for real-time
// isolcpus=1-7 nohz_full=1-7 rcu_nocbs=1-7

// High-throughput computation
// CPU-intensive, minimal I/O
kernel.sched_min_granularity_ns = 3000000  // Longer task runtime
kernel.sched_wakeup_granularity_ns = 4000000
kernel.sched_latency_ns = 24000000   // Higher latency tolerance
```

**Explanation**:

- **Database workloads**: Optimize for large memory and I/O
- **Web servers**: Optimize for many concurrent connections
- **Real-time workloads**: Minimize latency and jitter
- **Compute workloads**: Maximize CPU utilization
- **I/O workloads**: Optimize storage and network throughput

**Where**: Workload optimization applies in:

- **Database servers**: MySQL, PostgreSQL, MongoDB
- **Web servers**: Nginx, Apache, Node.js
- **Real-time systems**: Industrial control, robotics
- **HPC applications**: Scientific computing
- **Streaming applications**: Video processing, analytics

## Performance Monitoring and Validation

**What**: Performance monitoring validates that tuning changes achieve desired results and don't introduce regressions.

**Why**: Understanding monitoring is important because:

- **Validation**: Verify optimizations work as expected
- **Regression Detection**: Identify performance degradations
- **Continuous Improvement**: Track performance over time
- **Baseline Establishment**: Create performance baselines
- **Problem Detection**: Early detection of issues

**How**: Performance is monitored through:

```c
// Example: Performance monitoring
// System-wide metrics
// vmstat - Virtual memory statistics
// vmstat 1

// iostat - I/O statistics
// iostat -x 1

// mpstat - CPU statistics
// mpstat -P ALL 1

// sar - System activity report
// sar -u 1 10    # CPU usage
// sar -r 1 10    # Memory usage
// sar -n DEV 1 10 # Network statistics

// Kernel performance metrics
struct task_struct {
    // CPU time accounting
    u64 utime;              // User time
    u64 stime;              // System time
    u64 gtime;              // Guest time
    
    // Scheduling statistics
    u64 se.sum_exec_runtime;        // Total runtime
    u64 se.prev_sum_exec_runtime;   // Previous runtime
    u64 se.vruntime;                // Virtual runtime
    
    // Context switch counters
    unsigned long nvcsw;    // Voluntary context switches
    unsigned long nivcsw;   // Involuntary context switches
    
    // Memory statistics
    unsigned long min_flt;  // Minor page faults
    unsigned long maj_flt;  // Major page faults
};

// Performance counters
static void collect_performance_metrics(void)
{
    struct task_struct *task = current;
    
    // CPU usage
    u64 total_time = task->utime + task->stime;
    
    // Context switches
    unsigned long ctx_switches = task->nvcsw + task->nivcsw;
    
    // Page faults
    unsigned long page_faults = task->min_flt + task->maj_flt;
    
    // Log metrics
    pr_info("PID %d: CPU=%llu CS=%lu PF=%lu\n",
            task->pid, total_time, ctx_switches, page_faults);
}

// Benchmark framework
struct benchmark {
    const char *name;
    int (*setup)(void);
    int (*run)(void);
    void (*teardown)(void);
    u64 iterations;
    u64 total_time;
};

static int run_benchmark(struct benchmark *bench)
{
    u64 start, end;
    int ret;
    
    // Setup
    if (bench->setup) {
        ret = bench->setup();
        if (ret)
            return ret;
    }
    
    // Run benchmark
    start = ktime_get_ns();
    ret = bench->run();
    end = ktime_get_ns();
    
    // Teardown
    if (bench->teardown)
        bench->teardown();
    
    // Calculate results
    bench->total_time = end - start;
    
    return ret;
}
```

**Explanation**:

- **System metrics**: CPU, memory, I/O, network usage
- **Process metrics**: Per-process resource consumption
- **Kernel counters**: Internal kernel statistics
- **Benchmarks**: Standardized performance tests
- **Continuous monitoring**: Track performance trends

**Where**: Monitoring is essential in:

- **Performance tuning**: Validating optimization results
- **Production systems**: Tracking system health
- **Capacity planning**: Understanding resource needs
- **Troubleshooting**: Diagnosing performance issues
- **SLA compliance**: Ensuring service level agreements

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Performance Tuning Understanding**: You understand performance tuning principles
2. **Parameter Tuning**: You know how to tune kernel parameters
3. **Hardware Optimization**: You understand ARM64-specific optimizations
4. **Workload Optimization**: You can optimize for specific workloads
5. **Monitoring Skills**: You know how to validate performance improvements

**Why** these concepts matter:

- **Performance Excellence**: Achieve optimal system performance
- **Resource Efficiency**: Maximize hardware utilization
- **Professional Skills**: Essential for systems engineering
- **Cost Savings**: Better performance with existing hardware
- **Competitive Advantage**: Outperform generic configurations

**When** to use these concepts:

- **System Deployment**: When deploying new systems
- **Performance Issues**: When addressing performance problems
- **Workload Changes**: When requirements change
- **Hardware Updates**: When upgrading hardware
- **Continuous Improvement**: Ongoing optimization efforts

**Where** these skills apply:

- **Production Systems**: Optimizing production servers
- **Embedded Systems**: Rock 5B+ optimization
- **Cloud Infrastructure**: Cloud service optimization
- **HPC Systems**: High-performance computing
- **Professional Development**: Systems performance engineering

## Next Steps

**What** you're ready for next:

After mastering performance tuning, you should be ready to:

1. **Learn Scalability Optimization**: Understand multi-core and NUMA optimization
2. **Study Power Management**: Balance performance with power efficiency
3. **Explore Kernel Contribution**: Contribute performance improvements
4. **Apply to Projects**: Use tuning in real-world systems

**Where** to go next:

Continue with the next lesson on **"Scalability Optimization"** to learn:

- Multi-core performance optimization
- NUMA architecture optimization
- Lock contention reduction
- Scalability analysis techniques

**Why** the next lesson is important:

The next lesson builds on your tuning knowledge by teaching you how to optimize performance on multi-core systems, which is critical for modern hardware like the Rock 5B+ with its 8-core ARM processor.

**How** to continue learning:

1. **Practice Tuning**: Tune Rock 5B+ for different workloads
2. **Benchmark Results**: Measure before and after performance
3. **Monitor Systems**: Track performance metrics continuously
4. **Study Hardware**: Understand ARM64 performance characteristics
5. **Document Changes**: Keep records of tuning decisions

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Kernel Parameters](https://www.kernel.org/doc/html/latest/admin-guide/kernel-parameters.html) - Kernel parameter reference
- [Sysctl Documentation](https://www.kernel.org/doc/html/latest/admin-guide/sysctl/) - Runtime parameter tuning

**Community Resources**:

- [Brendan Gregg's Blog](https://www.brendangregg.com/) - Performance analysis expert
- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Performance](http://www.brendangregg.com/linuxperf.html) - Performance tools and techniques

**Learning Resources**:

- [Systems Performance by Brendan Gregg](https://www.brendangregg.com/systems-performance-2nd-edition-book.html) - Comprehensive performance guide
- [Linux Performance Analysis](https://www.brendangregg.com/blog/2016-12-27/linux-performance-analysis.html) - Performance analysis methodology
- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development reference

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM Performance Libraries](https://developer.arm.com/tools-and-software/server-and-hpc/arm-performance-libraries) - ARM optimization libraries
- [ARM Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide

Happy tuning! ⚡

