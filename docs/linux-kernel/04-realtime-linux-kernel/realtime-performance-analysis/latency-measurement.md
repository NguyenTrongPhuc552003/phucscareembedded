---
sidebar_position: 1
---

# Latency Measurement

Master latency measurement techniques for real-time Linux systems, understanding how to quantify and analyze system response times to ensure real-time requirements are met on the Rock 5B+ platform.

## What is Latency Measurement?

**What**: Latency measurement is the process of quantifying the time delay between an event occurrence and the system's response, critical for ensuring real-time systems meet their timing requirements.

**Why**: Understanding latency measurement is crucial because:

- **Deadline compliance** - Ensures real-time tasks meet their timing requirements
- **Performance validation** - Validates system meets real-time specifications
- **System optimization** - Identifies latency sources for targeted optimization
- **Quality assurance** - Ensures consistent real-time behavior
- **Rock 5B+ development** - ARM64 specific latency characteristics
- **Professional development** - Essential for real-time systems engineering

**When**: Latency measurement is used when:

- **System validation** - Validating real-time system performance
- **Performance tuning** - Optimizing system latency characteristics
- **Debugging** - Troubleshooting timing-related issues
- **Development** - Understanding system timing behavior
- **Benchmarking** - Comparing different implementations
- **Rock 5B+** - ARM64 real-time latency analysis

**How**: Latency measurement works by:

- **Event timestamping** - Recording precise event timestamps
- **Latency calculation** - Computing time differences between events
- **Statistical analysis** - Analyzing latency distributions
- **Visualization** - Presenting latency data for analysis
- **Optimization** - Using measurements to guide improvements

**Where**: Latency measurement is found in:

- **Real-time systems** - All real-time applications
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Audio processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops and sensor processing
- **Rock 5B+** - ARM64 real-time applications

## Interrupt Latency Measurement

**What**: Interrupt latency is the time between a hardware interrupt occurrence and the start of interrupt handler execution, representing the system's fastest response capability.

**Why**: Understanding interrupt latency is important because:

- **Real-time responsiveness** - Determines system's fastest possible response
- **Hardware interaction** - Affects timing of hardware operations
- **System design** - Influences architecture decisions
- **Performance baseline** - Establishes minimum achievable latency
- **Rock 5B+ characteristics** - ARM64 interrupt handling performance
- **Optimization target** - Key metric for real-time optimization

**When**: Interrupt latency is measured when:

- **System characterization** - Understanding platform capabilities
- **Performance analysis** - Evaluating interrupt handling efficiency
- **Debugging** - Troubleshooting interrupt-related timing issues
- **Optimization** - Improving interrupt response times
- **Validation** - Verifying real-time requirements are met
- **Rock 5B+** - ARM64 interrupt latency analysis

**How**: Interrupt latency measurement works through:

```c
// Example: Interrupt latency measurement
// 1. High-resolution timestamp capture
static ktime_t interrupt_timestamp;
static ktime_t handler_timestamp;
static ktime_t max_latency;
static ktime_t min_latency = KTIME_MAX;
static unsigned long sample_count;

// Interrupt handler
irqreturn_t latency_measurement_handler(int irq, void *dev_id) {
    ktime_t latency;

    // Capture handler entry time
    handler_timestamp = ktime_get();

    // Calculate latency
    latency = ktime_sub(handler_timestamp, interrupt_timestamp);

    // Update statistics
    if (ktime_compare(latency, max_latency) > 0)
        max_latency = latency;
    if (ktime_compare(latency, min_latency) < 0)
        min_latency = latency;

    sample_count++;

    pr_debug("Interrupt latency: %lld ns\n", ktime_to_ns(latency));

    return IRQ_HANDLED;
}

// Trigger interrupt and record timestamp
void trigger_latency_test(void) {
    // Capture interrupt trigger time
    interrupt_timestamp = ktime_get();

    // Trigger hardware interrupt
    trigger_test_interrupt();
}

// Report latency statistics
void report_interrupt_latency(void) {
    pr_info("Interrupt Latency Statistics:\n");
    pr_info("  Min: %lld ns\n", ktime_to_ns(min_latency));
    pr_info("  Max: %lld ns\n", ktime_to_ns(max_latency));
    pr_info("  Samples: %lu\n", sample_count);
}
```

**Explanation**:

- **Timestamp capture** - High-resolution timestamps at interrupt and handler
- **Latency calculation** - Time difference between trigger and response
- **Statistics tracking** - Min, max, and count for characterization
- **Debugging output** - Latency values for analysis

**Where**: Interrupt latency measurement applies in:

- **Device drivers** - Interrupt-driven I/O operations
- **Real-time applications** - Time-critical event handling
- **System profiling** - Platform capability assessment
- **Performance optimization** - Interrupt handling tuning
- **Rock 5B+** - ARM64 interrupt performance analysis

## Scheduling Latency Measurement

**What**: Scheduling latency is the time between when a task becomes ready to run and when it actually starts executing, representing the scheduler's response time.

**Why**: Understanding scheduling latency is important because:

- **Task responsiveness** - Determines how quickly tasks can respond
- **Real-time guarantees** - Affects deadline compliance
- **System performance** - Impacts overall application performance
- **Scheduler efficiency** - Indicates scheduler overhead
- **Rock 5B+ performance** - ARM64 scheduling characteristics
- **Optimization guidance** - Identifies scheduling bottlenecks

**When**: Scheduling latency is measured when:

- **Performance analysis** - Evaluating scheduler efficiency
- **Real-time validation** - Verifying timing requirements
- **System tuning** - Optimizing scheduler configuration
- **Debugging** - Troubleshooting task timing issues
- **Benchmarking** - Comparing scheduler policies
- **Rock 5B+** - ARM64 scheduling performance analysis

**How**: Scheduling latency measurement works through:

```c
// Example: Scheduling latency measurement
// 1. Wakeup and execution timestamp capture
struct latency_stats {
    ktime_t wakeup_time;
    ktime_t execution_time;
    ktime_t total_latency;
    unsigned long sample_count;
};

static struct latency_stats sched_stats;

// Called when task is woken
void record_task_wakeup(struct task_struct *task) {
    sched_stats.wakeup_time = ktime_get();
}

// Called when task starts executing
void record_task_execution(struct task_struct *task) {
    ktime_t latency;

    sched_stats.execution_time = ktime_get();

    // Calculate scheduling latency
    latency = ktime_sub(sched_stats.execution_time, sched_stats.wakeup_time);

    sched_stats.total_latency = ktime_add(sched_stats.total_latency, latency);
    sched_stats.sample_count++;

    pr_debug("Scheduling latency: %lld ns\n", ktime_to_ns(latency));
}

// Report average scheduling latency
void report_scheduling_latency(void) {
    ktime_t avg_latency;

    if (sched_stats.sample_count > 0) {
        avg_latency = ktime_divns(sched_stats.total_latency,
                                  sched_stats.sample_count);

        pr_info("Scheduling Latency:\n");
        pr_info("  Average: %lld ns\n", ktime_to_ns(avg_latency));
        pr_info("  Samples: %lu\n", sched_stats.sample_count);
    }
}
```

**Explanation**:

- **Wakeup timestamp** - Time when task becomes ready
- **Execution timestamp** - Time when task starts running
- **Latency calculation** - Time spent waiting for CPU
- **Statistics aggregation** - Average latency computation

**Where**: Scheduling latency measurement applies in:

- **Real-time applications** - Priority-based task execution
- **System profiling** - Scheduler performance assessment
- **Performance tuning** - Scheduler optimization
- **Debugging** - Task timing issue diagnosis
- **Rock 5B+** - ARM64 scheduling performance

## Cyclictest Tool

**What**: Cyclictest is a high-resolution test program that measures the latency of a real-time system by timing the response to periodic timer events.

**Why**: Understanding Cyclictest is important because:

- **Industry standard** - Widely used real-time latency measurement tool
- **Comprehensive testing** - Tests various latency sources
- **Statistical analysis** - Provides detailed latency statistics and histograms
- **PREEMPT_RT validation** - Standard tool for validating RT patches
- **Rock 5B+ benchmarking** - ARM64 real-time performance validation
- **Professional development** - Essential tool for real-time engineers

**When**: Cyclictest is used when:

- **System validation** - Validating real-time system performance
- **Benchmarking** - Comparing system configurations
- **Optimization** - Measuring improvement from optimizations
- **Debugging** - Identifying latency sources
- **Regression testing** - Detecting performance degradation
- **Rock 5B+** - ARM64 real-time system validation

**How**: Cyclictest works through:

```bash
# Basic cyclictest usage
cyclictest -p 80 -t5 -n

# Detailed latency measurement with histogram
cyclictest -l100000 -m -Sp90 -i200 -h400 -q

# Rock 5B+ specific testing (8 cores)
cyclictest -p 99 -t8 -n -m -l1000000 -h 200 -q

# CPU isolation and affinity testing
cyclictest -p 99 -t4 -a 4,5,6,7 -n -m -l1000000

# Parameters explanation:
# -p: Priority (1-99 for real-time)
# -t: Number of threads
# -n: Use clock_nanosleep
# -m: Lock memory to prevent swapping
# -l: Number of loops
# -h: Histogram buckets
# -q: Quiet mode (only summary)
# -a: CPU affinity
# -S: Use SMP testing
```

**Explanation**:

- **Timer-based testing** - Periodic timer events for latency measurement
- **Multi-threaded** - Tests multiple CPUs simultaneously
- **Statistics collection** - Min, max, average latency values
- **Histogram generation** - Latency distribution visualization
- **Rock 5B+ optimization** - ARM64-specific testing configurations

**Where**: Cyclictest applies in:

- **Real-time system validation** - Standard latency testing
- **Kernel configuration** - Comparing different kernel configs
- **Hardware evaluation** - Platform capability assessment
- **Optimization validation** - Measuring improvement effectiveness
- **Rock 5B+** - ARM64 real-time platform validation

## Rock 5B+ Latency Measurement

**What**: The Rock 5B+ platform requires specific considerations for latency measurement due to its ARM64 architecture, RK3588 SoC, and multi-core configuration.

**Why**: Understanding Rock 5B+ latency measurement is important because:

- **ARM64 architecture** - Different from x86_64 latency characteristics
- **RK3588 SoC** - Specific hardware timing characteristics
- **Multi-core configuration** - 8-core CPU requires careful testing
- **Embedded platform** - Resource constraints affect measurements
- **Real-world deployment** - Practical platform for embedded real-time
- **Performance optimization** - Platform-specific tuning opportunities

**When**: Rock 5B+ latency measurement is relevant when:

- **System validation** - Validating Rock 5B+ real-time performance
- **Performance optimization** - Tuning ARM64 real-time systems
- **Hardware evaluation** - Assessing Rock 5B+ capabilities
- **Debugging** - Troubleshooting ARM64 timing issues
- **Development** - Building real-time applications
- **Deployment** - Production system validation

**How**: Rock 5B+ latency measurement involves:

```bash
# Rock 5B+ specific cyclictest configuration
# Test all 8 cores with high priority
cyclictest -p 99 -t8 -n -m -l1000000 -h 200 -q \
  --smp --affinity=0,1,2,3,4,5,6,7

# CPU isolation for dedicated real-time cores
# Add to kernel command line:
isolcpus=4,5,6,7 nohz_full=4,5,6,7 rcu_nocbs=4,5,6,7

# Disable RT throttling for testing
echo -1 > /proc/sys/kernel/sched_rt_runtime_us

# Set CPU governor to performance
for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    echo performance > $cpu
done

# Lock IRQ affinity to non-RT cores
for irq in /proc/irq/*/smp_affinity; do
    echo 0f > $irq  # Cores 0-3 only
done
```

**Explanation**:

- **Multi-core testing** - All 8 cores of RK3588 SoC
- **CPU isolation** - Dedicated cores for real-time tasks
- **IRQ affinity** - Interrupt handling on non-RT cores
- **Governor settings** - Performance mode for consistent timing
- **RT throttling** - Disabled for maximum RT priority

**Where**: Rock 5B+ latency measurement applies in:

- **Embedded real-time** - IoT and industrial applications
- **ARM64 development** - Platform-specific optimization
- **Single-board computers** - SBC real-time applications
- **Educational projects** - Learning real-time concepts
- **Prototype development** - Rapid real-time system development
- **Rock 5B+** - Specific platform deployment

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Latency Measurement Understanding** - You understand what latency measurement is and why it matters
2. **Interrupt Latency** - You know how to measure interrupt response times
3. **Scheduling Latency** - You understand task scheduling delays
4. **Cyclictest Tool** - You can use industry-standard latency measurement tools
5. **Rock 5B+ Latency** - You understand ARM64-specific measurement techniques

**Why** these concepts matter:

- **Real-time validation** provides confidence in system timing
- **Performance optimization** enables targeted improvements
- **Professional development** prepares you for real-time engineering
- **Platform expertise** enables effective Rock 5B+ development

**When** to use these concepts:

- **System validation** - Apply latency measurement to verify real-time requirements
- **Performance tuning** - Use measurements to guide optimization efforts
- **Debugging** - Apply measurement techniques to identify timing issues
- **Development** - Integrate latency testing into development workflow

**Where** these skills apply:

- **Real-time systems** - All systems with timing requirements
- **Embedded development** - ARM64 and resource-constrained platforms
- **Industrial automation** - Factory control and process automation
- **Professional development** - Real-time engineering careers
- **Rock 5B+** - ARM64 embedded real-time development

## Next Steps

**What** you're ready for next:

After mastering latency measurement, continue with:

1. **Jitter Analysis** - Learn to measure and analyze timing variability
2. **Performance Tuning** - Apply measurements to optimize system performance
3. **Real-Time Applications** - Build real-time applications on Rock 5B+

**Where** to go next:

Continue with the next lesson on **"Jitter Analysis"** to learn:

- Jitter measurement techniques
- Statistical analysis methods
- Timing variability reduction strategies

**Why** the next lesson is important:

Jitter analysis builds on latency measurement by focusing on timing consistency, essential for deterministic real-time behavior.

## Resources

**Official Documentation**:

- [Cyclictest Documentation](https://wiki.linuxfoundation.org/realtime/documentation/howto/tools/cyclictest) - Cyclictest usage guide
- [Real-Time Linux](https://www.kernel.org/doc/html/latest/scheduler/) - Real-time scheduling documentation
- [PREEMPT_RT](https://wiki.linuxfoundation.org/realtime/) - Real-time patch documentation

**Community Resources**:

- [Real-Time Linux Foundation](https://wiki.linuxfoundation.org/realtime/) - Real-time Linux community
- [Linux Real-Time Mailing List](https://lore.kernel.org/linux-rt-users/) - Real-time discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-rt) - Technical Q&A

**Learning Resources**:

- [Real-Time Systems by Jane W. S. Liu](https://www.cis.upenn.edu/~lee/07cis550/real-time/real-time_systems.pdf) - Real-time fundamentals
- [Embedded Real-Time Systems](https://www.oreilly.com/library/view/real-time-systems/9780131834591/) - Practical guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

Happy learning! 🐧
