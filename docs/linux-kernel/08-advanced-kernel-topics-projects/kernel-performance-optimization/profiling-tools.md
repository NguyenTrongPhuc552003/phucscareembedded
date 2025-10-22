---
sidebar_position: 1
---

# Kernel Profiling Tools

Master the essential profiling tools for Linux kernel performance analysis, understanding how to identify bottlenecks and optimize system performance on ARM64 Rock 5B+ platform.

## What are Kernel Profiling Tools?

**What**: Kernel profiling tools are specialized utilities that measure and analyze kernel performance, helping developers identify performance bottlenecks, optimize code paths, and understand system behavior under various workloads.

**Why**: Understanding kernel profiling tools is crucial because:

- **Performance Analysis**: Identifies performance bottlenecks and hot spots
- **System Optimization**: Enables data-driven optimization decisions
- **Resource Utilization**: Reveals how system resources are consumed
- **Debugging**: Helps debug performance-related issues
- **Production Monitoring**: Allows performance monitoring in production systems
- **Professional Development**: Essential skill for kernel developers

**When**: Profiling tools are used when:

- **Performance Issues**: System experiencing slowdowns or high latency
- **Optimization Projects**: Optimizing kernel subsystems or drivers
- **Development**: Developing new kernel features or drivers
- **Benchmarking**: Comparing performance across different configurations
- **Production Monitoring**: Monitoring system performance in real-time
- **Capacity Planning**: Understanding system resource requirements

**How**: Kernel profiling tools work through:

```c
// Example: Using perf for kernel profiling
// Enable performance counters in kernel
CONFIG_PERF_EVENTS=y
CONFIG_HW_PERF_EVENTS=y
CONFIG_HAVE_PERF_EVENTS=y

// Performance counter structure
struct perf_event {
    struct list_head event_entry;
    struct list_head sibling_list;
    struct perf_event *group_leader;
    const struct pmu *pmu;
    void *overflow_handler;
    struct perf_event_context *ctx;
    atomic_long_t refcount;
    // ... more fields
};

// Sample perf event
static void perf_event_sample(struct perf_event *event,
                              struct pt_regs *regs)
{
    struct perf_sample_data data;
    
    // Collect sample data
    perf_sample_data_init(&data, 0, event->hw.last_period);
    
    // Record sample
    if (perf_event_overflow(event, &data, regs))
        event->pmu->stop(event, 0);
}
```

**Where**: Profiling tools are essential in:

- **Performance Optimization**: Identifying bottlenecks in kernel code
- **Driver Development**: Optimizing device driver performance
- **Real-time Systems**: Analyzing latency and timing issues
- **Server Tuning**: Optimizing server workloads
- **Embedded Systems**: Optimizing Rock 5B+ performance

## Perf: Linux Performance Analysis

**What**: Perf is the primary Linux profiling tool that provides powerful performance analysis capabilities through hardware and software performance counters.

**Why**: Understanding perf is important because:

- **Comprehensive Analysis**: Supports CPU, cache, memory, and I/O profiling
- **Low Overhead**: Minimal impact on system performance
- **Hardware Support**: Leverages CPU performance monitoring units (PMUs)
- **Flexible**: Supports various profiling modes and workloads
- **Integration**: Integrates with kernel tracing infrastructure

**How**: Perf operates through:

```c
// Example: Perf event configuration
// CPU performance monitoring
struct perf_event_attr {
    __u32 type;                 // Type of event
    __u32 size;                 // Size of structure
    __u64 config;               // Event-specific configuration
    __u64 sample_period;        // Sample period
    __u64 sample_type;          // Sample type flags
    __u64 read_format;          // Read format flags
    __u64 disabled       : 1;   // Event disabled
    __u64 inherit        : 1;   // Inherit to children
    __u64 pinned         : 1;   // Pinned to CPU
    __u64 exclusive      : 1;   // Exclusive use of counter
    __u64 exclude_user   : 1;   // Exclude user-space
    __u64 exclude_kernel : 1;   // Exclude kernel-space
    // ... more flags
};

// Perf counter reading
static u64 perf_event_read_value(struct perf_event *event)
{
    struct perf_event *child;
    u64 total = 0;
    
    total += perf_event_count(event);
    list_for_each_entry(child, &event->child_list, child_list)
        total += perf_event_count(child);
    
    return total;
}

// Common perf commands
// Record CPU cycles
// perf record -e cycles -a -g -- sleep 10

// Record cache misses
// perf record -e cache-misses -a -g -- sleep 10

// Record page faults
// perf record -e page-faults -a -g -- sleep 10

// Analyze recorded data
// perf report

// Real-time monitoring
// perf top
```

**Explanation**:

- **Event types**: Hardware events (CPU cycles, cache misses), software events (page faults, context switches)
- **Sampling**: Records stack traces at regular intervals
- **Call graphs**: Shows function call relationships and time spent
- **Annotations**: Shows assembly code with performance data
- **Differential analysis**: Compares performance across different runs

**Where**: Perf is used in:

- **Kernel optimization**: Identifying hot functions and bottlenecks
- **Driver development**: Profiling driver performance
- **Application profiling**: Analyzing application-kernel interactions
- **Real-time analysis**: Measuring latency and timing
- **Rock 5B+**: ARM64-specific performance profiling

## Ftrace: Function Tracer

**What**: Ftrace is a kernel tracing framework that provides detailed insights into kernel function calls, execution time, and system events.

**Why**: Understanding ftrace is important because:

- **Dynamic Tracing**: Trace kernel functions without recompilation
- **Latency Analysis**: Measure function execution time
- **Event Tracing**: Track kernel events and state changes
- **Minimal Overhead**: Low-overhead tracing mechanism
- **Flexible Filtering**: Filter traces by function, PID, or other criteria

**How**: Ftrace operates through:

```c
// Example: Ftrace configuration
// Enable ftrace in kernel
CONFIG_FTRACE=y
CONFIG_FUNCTION_TRACER=y
CONFIG_FUNCTION_GRAPH_TRACER=y
CONFIG_DYNAMIC_FTRACE=y
CONFIG_STACK_TRACER=y

// Ftrace function entry
void __attribute__((no_instrument_function))
ftrace_graph_entry(struct ftrace_graph_ent *trace)
{
    unsigned long flags;
    
    local_irq_save(flags);
    
    // Record function entry
    trace->func = __builtin_return_address(0);
    trace->depth = current->curr_ret_stack;
    
    // Call registered callbacks
    ftrace_graph_entry_callback(trace);
    
    local_irq_restore(flags);
}

// Ftrace function return
void __attribute__((no_instrument_function))
ftrace_graph_return(struct ftrace_graph_ret *trace)
{
    unsigned long flags;
    
    local_irq_save(flags);
    
    // Record function return
    trace->func = __builtin_return_address(0);
    trace->depth = current->curr_ret_stack;
    trace->calltime = current->ret_stack[current->curr_ret_stack].calltime;
    trace->rettime = trace_clock_local();
    
    // Call registered callbacks
    ftrace_graph_return_callback(trace);
    
    local_irq_restore(flags);
}

// Common ftrace usage
// Enable function tracer
// echo function > /sys/kernel/debug/tracing/current_tracer

// Enable function graph tracer
// echo function_graph > /sys/kernel/debug/tracing/current_tracer

// Filter specific function
// echo do_sys_open > /sys/kernel/debug/tracing/set_ftrace_filter

// View trace
// cat /sys/kernel/debug/tracing/trace
```

**Explanation**:

- **Function tracing**: Records all function calls in the kernel
- **Graph tracing**: Shows call graphs with timing information
- **Event tracing**: Tracks specific kernel events
- **Stack tracing**: Records kernel stack traces
- **Filtering**: Limits tracing to specific functions or modules

**Where**: Ftrace is used in:

- **Latency analysis**: Measuring function execution time
- **Call flow analysis**: Understanding kernel execution paths
- **Real-time debugging**: Debugging real-time issues
- **Driver development**: Tracing driver execution
- **Rock 5B+**: ARM64-specific kernel tracing

## eBPF: Extended Berkeley Packet Filter

**What**: eBPF is a powerful in-kernel virtual machine that enables safe, efficient tracing and monitoring without kernel modifications.

**Why**: Understanding eBPF is important because:

- **Safety**: Verifier ensures programs won't crash the kernel
- **Performance**: JIT compilation provides near-native performance
- **Flexibility**: Attach to various kernel hooks and events
- **Production Use**: Safe for production system monitoring
- **Modern Tooling**: Foundation for modern observability tools

**How**: eBPF operates through:

```c
// Example: eBPF program
// BPF program structure
struct bpf_prog {
    u16 pages;              // Number of allocated pages
    u16 jited:1;            // JIT compiled
    u16 gpl_compatible:1;   // GPL compatible
    u16 cb_access:1;        // Accessed cb
    u32 len;                // Number of instructions
    enum bpf_prog_type type;
    struct bpf_prog_aux *aux;
    struct sock_fprog_kern *orig_prog;
    unsigned int (*bpf_func)(const void *ctx,
                            const struct bpf_insn *insn);
    // ... more fields
};

// BPF helper function example
BPF_CALL_2(bpf_probe_read, void *, dst, u32, size)
{
    int ret;
    
    ret = probe_kernel_read(dst, dst, size);
    if (unlikely(ret < 0))
        memset(dst, 0, size);
    
    return ret;
}

// Sample BPF program (C-like syntax)
// Trace system calls
SEC("tracepoint/syscalls/sys_enter_openat")
int trace_openat(struct trace_event_raw_sys_enter *ctx)
{
    char filename[256];
    
    // Read filename from user space
    bpf_probe_read_user_str(filename, sizeof(filename),
                           (void *)ctx->args[1]);
    
    // Log event
    bpf_printk("openat: %s\n", filename);
    
    return 0;
}

// BPF map for data storage
struct bpf_map_def SEC("maps") counts = {
    .type = BPF_MAP_TYPE_HASH,
    .key_size = sizeof(u32),
    .value_size = sizeof(u64),
    .max_entries = 1024,
};
```

**Explanation**:

- **Verifier**: Ensures program safety before execution
- **JIT compiler**: Compiles BPF bytecode to native code
- **Maps**: Store data between kernel and user space
- **Helper functions**: Provide safe kernel functionality access
- **Attachments**: Attach to kprobes, uprobes, tracepoints

**Where**: eBPF is used in:

- **Observability**: Modern system and application monitoring
- **Network monitoring**: Packet filtering and analysis
- **Security**: Runtime security monitoring
- **Performance analysis**: Low-overhead performance tracing
- **Rock 5B+**: ARM64-specific eBPF tracing

## Hardware Performance Counters

**What**: Hardware performance counters are CPU-integrated counters that measure low-level performance events like cache misses, branch mispredictions, and instruction counts.

**Why**: Understanding hardware counters is important because:

- **Hardware Insights**: Direct access to CPU performance data
- **Cache Analysis**: Measure cache hit/miss rates
- **Branch Prediction**: Track branch prediction accuracy
- **Instruction Throughput**: Measure instruction execution rates
- **Architectural Optimization**: Optimize for specific CPU architectures

**How**: Hardware counters work through:

```c
// Example: ARM64 performance monitoring
// ARM64 PMU structure
struct arm_pmu {
    struct pmu pmu;
    cpumask_t supported_cpus;
    char *name;
    int (*map_event)(struct perf_event *event);
    int (*init)(struct arm_pmu *);
    void (*reset)(void *);
    void (*enable)(struct perf_event *event);
    void (*disable)(struct perf_event *event);
    int (*get_event_idx)(struct pmu_hw_events *hw_events,
                         struct perf_event *event);
    u64 (*read_counter)(struct perf_event *event);
    void (*write_counter)(struct perf_event *event, u64 val);
    void (*start)(struct arm_pmu *);
    void (*stop)(struct arm_pmu *);
    // ... more fields
};

// PMU event configuration
static int armv8pmu_enable_event(struct perf_event *event)
{
    unsigned long flags;
    struct hw_perf_event *hwc = &event->hw;
    struct arm_pmu *cpu_pmu = to_arm_pmu(event->pmu);
    struct pmu_hw_events *events = this_cpu_ptr(cpu_pmu->hw_events);
    int idx = hwc->idx;
    
    raw_spin_lock_irqsave(&events->pmu_lock, flags);
    
    // Configure counter
    armv8pmu_write_counter(event, 0);
    armv8pmu_write_evtype(idx, hwc->config_base);
    
    // Enable counter
    armv8pmu_enable_counter(idx);
    
    raw_spin_unlock_irqrestore(&events->pmu_lock, flags);
    
    return 0;
}

// Common hardware events
// CPU cycles
// perf stat -e cycles ./program

// Cache misses
// perf stat -e cache-misses ./program

// Branch mispredictions
// perf stat -e branch-misses ./program

// Instructions per cycle (IPC)
// perf stat -e instructions,cycles ./program
```

**Explanation**:

- **PMU (Performance Monitoring Unit)**: Hardware component providing counters
- **Event types**: CPU cycles, cache events, branch events, bus events
- **ARM64 PMU**: ARM-specific performance monitoring features
- **Counter overflow**: Generates interrupts for sampling
- **Multiplexing**: Time-shares counters when there are more events than counters

**Where**: Hardware counters are used in:

- **Microarchitectural analysis**: Understanding CPU behavior
- **Cache optimization**: Optimizing cache usage patterns
- **Branch optimization**: Improving branch prediction
- **Instruction optimization**: Maximizing instruction throughput
- **Rock 5B+**: ARM Cortex-A76 performance analysis

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Profiling Tools Understanding**: You understand various kernel profiling tools
2. **Perf Mastery**: You know how to use perf for performance analysis
3. **Ftrace Knowledge**: You understand kernel function tracing
4. **eBPF Awareness**: You know modern tracing with eBPF
5. **Hardware Counters**: You understand CPU performance monitoring

**Why** these concepts matter:

- **Performance Optimization**: Essential for identifying and fixing bottlenecks
- **System Understanding**: Provides deep insights into system behavior
- **Production Monitoring**: Enables safe production system monitoring
- **Professional Skills**: Critical skill for kernel developers
- **Embedded Systems**: Important for Rock 5B+ optimization

**When** to use these concepts:

- **Performance Issues**: When investigating slowdowns or bottlenecks
- **Development**: When developing new kernel features
- **Optimization**: When optimizing existing code
- **Debugging**: When troubleshooting performance problems
- **Monitoring**: When tracking system performance

**Where** these skills apply:

- **Kernel Development**: Optimizing kernel subsystems
- **Driver Development**: Profiling driver performance
- **System Administration**: Monitoring production systems
- **Embedded Systems**: Optimizing Rock 5B+ performance
- **Professional Development**: Working in performance engineering

## Next Steps

**What** you're ready for next:

After mastering profiling tools, you should be ready to:

1. **Learn Performance Tuning**: Apply profiling insights to optimize systems
2. **Study Scalability**: Understand multi-core performance optimization
3. **Explore Power Management**: Balance performance and power consumption
4. **Apply to Projects**: Use profiling in real-world projects

**Where** to go next:

Continue with the next lesson on **"Performance Tuning"** to learn:

- Kernel parameter tuning strategies
- Hardware-specific optimizations
- Workload-specific optimizations
- ARM64 performance tuning for Rock 5B+

**Why** the next lesson is important:

The next lesson builds on your profiling knowledge by teaching you how to use profiling data to make informed optimization decisions and tune the kernel for maximum performance.

**How** to continue learning:

1. **Practice with Perf**: Profile real workloads on Rock 5B+
2. **Experiment with Ftrace**: Trace kernel functions and analyze timing
3. **Learn eBPF**: Write custom eBPF programs for monitoring
4. **Study Hardware**: Understand ARM64 performance characteristics
5. **Apply Knowledge**: Use profiling in real optimization projects

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Perf Wiki](https://perf.wiki.kernel.org/) - Official perf documentation
- [Ftrace Documentation](https://www.kernel.org/doc/html/latest/trace/) - Kernel tracing documentation
- [eBPF Documentation](https://ebpf.io/) - eBPF learning resources

**Community Resources**:

- [Brendan Gregg's Blog](https://www.brendangregg.com/) - Performance analysis expert
- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Performance](http://www.brendangregg.com/linuxperf.html) - Linux performance tools

**Learning Resources**:

- [Systems Performance by Brendan Gregg](https://www.brendangregg.com/systems-performance-2nd-edition-book.html) - Comprehensive performance guide
- [BPF Performance Tools by Brendan Gregg](https://www.brendangregg.com/bpf-performance-tools-book.html) - eBPF profiling guide
- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development reference

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM Performance Monitoring](https://developer.arm.com/documentation/ddi0500/latest/) - ARM PMU documentation
- [ARM Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide

Happy profiling! 🚀

