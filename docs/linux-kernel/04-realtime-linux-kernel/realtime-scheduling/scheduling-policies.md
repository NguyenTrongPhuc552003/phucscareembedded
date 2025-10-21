---
sidebar_position: 1
---

# Real-Time Scheduling Policies

Master the real-time scheduling policies and algorithms that ensure deterministic task execution and deadline compliance in real-time Linux systems, with specific focus on the Rock 5B+ ARM64 platform.

## What are Real-Time Scheduling Policies?

**What**: Real-time scheduling policies are algorithms that determine the order and timing of task execution to ensure that real-time tasks meet their deadlines. These policies prioritize deterministic behavior over general fairness.

**Why**: Understanding real-time scheduling policies is crucial because:

- **Deadline compliance** - Ensures real-time tasks meet their timing requirements
- **System predictability** - Provides deterministic system behavior
- **Performance optimization** - Optimizes system performance for real-time workloads
- **Resource management** - Efficiently manages system resources
- **Rock 5B+ development** - Essential for ARM64 real-time applications
- **Professional development** - High-demand skill in embedded systems

**When**: Real-time scheduling policies are used when:

- **Real-time requirements** - Applications need deterministic timing
- **Deadline-critical tasks** - Tasks with strict timing constraints
- **Priority management** - Different tasks have different importance levels
- **System optimization** - Optimizing system for real-time performance
- **Resource allocation** - Managing limited system resources
- **Rock 5B+** - ARM64 real-time task scheduling

**How**: Real-time scheduling policies work by:

- **Priority-based scheduling** - Higher priority tasks run first
- **Deadline-based scheduling** - Tasks with earlier deadlines run first
- **Preemptive scheduling** - Higher priority tasks can preempt lower priority ones
- **Resource reservation** - Guaranteeing resources for critical tasks
- **Timing guarantees** - Ensuring tasks meet their deadlines
- **Deterministic behavior** - Predictable task execution order

**Where**: Real-time scheduling policies are found in:

- **Real-time systems** - All real-time applications
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Audio/video processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops and sensor processing
- **Rock 5B+** - ARM64 real-time applications

## SCHED_FIFO and SCHED_RR

**What**: SCHED_FIFO and SCHED_RR are the two main real-time scheduling policies in Linux that provide priority-based scheduling with different time-slicing behaviors.

**Why**: Understanding these policies is important because:

- **Real-time scheduling** - Foundation of real-time task scheduling
- **Priority management** - Managing task priorities effectively
- **System design** - Designing real-time systems
- **Performance optimization** - Optimizing real-time performance
- **Rock 5B+ development** - ARM64 specific scheduling considerations
- **Professional development** - Essential for real-time systems development

**When**: These policies are used when:

- **Real-time requirements** - Applications need deterministic timing
- **Priority-based systems** - Different tasks have different priorities
- **System optimization** - Optimizing system for real-time performance
- **Resource management** - Managing system resources
- **Development** - Understanding scheduling mechanisms
- **Rock 5B+** - ARM64 real-time task scheduling

**How**: These policies work through:

```c
// Example: SCHED_FIFO and SCHED_RR scheduling
// 1. SCHED_FIFO - First In, First Out
void configure_sched_fifo(void) {
    struct sched_param param;
    param.sched_priority = 50;  // Real-time priority (1-99)

    // Set SCHED_FIFO policy
    int ret = sched_setscheduler(0, SCHED_FIFO, &param);
    if (ret) {
        perror("sched_setscheduler");
        return;
    }

    // SCHED_FIFO characteristics:
    // - No time slicing
    // - Runs until it blocks or yields
    // - Higher priority tasks can preempt
    // - Same priority tasks run in FIFO order
}

// 2. SCHED_RR - Round Robin
void configure_sched_rr(void) {
    struct sched_param param;
    param.sched_priority = 50;  // Real-time priority (1-99)

    // Set SCHED_RR policy
    int ret = sched_setscheduler(0, SCHED_RR, &param);
    if (ret) {
        perror("sched_setscheduler");
        return;
    }

    // SCHED_RR characteristics:
    // - Time slicing with quantum
    // - Yields CPU after quantum expires
    // - Higher priority tasks can preempt
    // - Same priority tasks run in round-robin
}

// 3. Priority comparison
void demonstrate_priority_scheduling(void) {
    // High priority task
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Medium priority task
    struct sched_param medium_prio;
    medium_prio.sched_priority = 50;
    sched_setscheduler(0, SCHED_FIFO, &medium_prio);

    // Low priority task
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    // High priority task will always run first
    // Medium priority task runs when high priority task blocks
    // Low priority task runs when both higher priority tasks block
}

// 4. Real-time task implementation
void real_time_task(void) {
    // Set real-time priority
    struct sched_param param;
    param.sched_priority = 80;
    sched_setscheduler(0, SCHED_FIFO, &param);

    // Real-time processing loop
    while (1) {
        // Wait for real-time event
        wait_for_realtime_event();

        // Process real-time data
        process_realtime_data();

        // Yield CPU if needed (for SCHED_RR)
        if (need_to_yield()) {
            sched_yield();
        }
    }
}

// 5. Priority inheritance with real-time scheduling
void priority_inheritance_scheduling(void) {
    // Create RT mutex for priority inheritance
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // High priority task
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Acquire RT mutex
    rt_mutex_lock(&rt_lock);

    // Critical section
    process_critical_data();

    // Release RT mutex
    rt_mutex_unlock(&rt_lock);
}
```

**Explanation**:

- **SCHED_FIFO** - First In, First Out, no time slicing
- **SCHED_RR** - Round Robin with time slicing
- **Priority levels** - Real-time priorities from 1-99
- **Preemption** - Higher priority tasks can preempt lower priority ones
- **Priority inheritance** - RT mutexes provide priority inheritance

**Where**: These policies are important in:

- **Real-time systems** - All real-time applications
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Audio/video processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops and sensor processing
- **Rock 5B+** - ARM64 real-time applications

## SCHED_DEADLINE

**What**: SCHED_DEADLINE is a deadline-based scheduling policy that uses the Earliest Deadline First (EDF) algorithm to ensure tasks meet their deadlines.

**Why**: Understanding SCHED_DEADLINE is crucial because:

- **Deadline guarantees** - Ensures tasks meet their deadlines
- **Resource utilization** - Maximizes system resource utilization
- **Real-time guarantees** - Provides mathematical guarantees for deadline compliance
- **System optimization** - Optimizes system for deadline-based workloads
- **Rock 5B+ development** - ARM64 specific deadline scheduling
- **Professional development** - Advanced real-time scheduling skill

**When**: SCHED_DEADLINE is used when:

- **Deadline-critical tasks** - Tasks with strict deadline requirements
- **Resource optimization** - Maximizing system resource utilization
- **Real-time guarantees** - Need mathematical guarantees for deadline compliance
- **System optimization** - Optimizing system for deadline-based workloads
- **Development** - Understanding advanced scheduling algorithms
- **Rock 5B+** - ARM64 deadline-based scheduling

**How**: SCHED_DEADLINE works through:

```c
// Example: SCHED_DEADLINE scheduling
// 1. Deadline scheduling configuration
void configure_sched_deadline(void) {
    struct sched_attr attr;

    // Set deadline scheduling policy
    attr.sched_policy = SCHED_DEADLINE;

    // Runtime: 1ms (time task can run)
    attr.sched_runtime = 1000000;    // 1ms in nanoseconds

    // Deadline: 2ms (absolute deadline)
    attr.sched_deadline = 2000000;    // 2ms in nanoseconds

    // Period: 2ms (task period)
    attr.sched_period = 2000000;      // 2ms in nanoseconds

    // Set deadline scheduling
    int ret = sched_setattr(0, &attr, 0);
    if (ret) {
        perror("sched_setattr");
        return;
    }
}

// 2. Deadline task implementation
void deadline_task(void) {
    // Configure deadline scheduling
    struct sched_attr attr;
    attr.sched_policy = SCHED_DEADLINE;
    attr.sched_runtime = 1000000;    // 1ms runtime
    attr.sched_deadline = 2000000;    // 2ms deadline
    attr.sched_period = 2000000;      // 2ms period

    sched_setattr(0, &attr, 0);

    // Deadline processing loop
    while (1) {
        // Wait for deadline
        wait_for_deadline();

        // Process data within deadline
        process_deadline_data();

        // Check if we're approaching deadline
        if (approaching_deadline()) {
            // Reduce processing or skip non-critical operations
            skip_non_critical_operations();
        }
    }
}

// 3. Multiple deadline tasks
void multiple_deadline_tasks(void) {
    // Task 1: High frequency, short deadline
    struct sched_attr task1_attr;
    task1_attr.sched_policy = SCHED_DEADLINE;
    task1_attr.sched_runtime = 500000;     // 0.5ms runtime
    task1_attr.sched_deadline = 1000000;   // 1ms deadline
    task1_attr.sched_period = 1000000;     // 1ms period

    // Task 2: Low frequency, long deadline
    struct sched_attr task2_attr;
    task2_attr.sched_policy = SCHED_DEADLINE;
    task2_attr.sched_runtime = 2000000;    // 2ms runtime
    task2_attr.sched_deadline = 10000000;  // 10ms deadline
    task2_attr.sched_period = 10000000;    // 10ms period

    // EDF will schedule task1 first (earlier deadline)
    // Then schedule task2 when task1 completes
}

// 4. Deadline monitoring
void monitor_deadlines(void) {
    struct sched_attr attr;

    // Get current deadline information
    sched_getattr(0, &attr, sizeof(attr), 0);

    // Check if we're approaching deadline
    unsigned long current_time = get_time_ns();
    unsigned long deadline_time = attr.sched_deadline;

    if (current_time > deadline_time) {
        // Deadline missed!
        handle_deadline_miss();
    }
}

// 5. Deadline scheduling with CBS (Constant Bandwidth Server)
void configure_cbs_scheduling(void) {
    struct sched_attr attr;

    // Set CBS scheduling
    attr.sched_policy = SCHED_DEADLINE;
    attr.sched_runtime = 1000000;    // 1ms runtime
    attr.sched_deadline = 2000000;    // 2ms deadline
    attr.sched_period = 2000000;      // 2ms period

    // CBS provides bandwidth isolation
    // Each task gets guaranteed CPU time
    sched_setattr(0, &attr, 0);
}
```

**Explanation**:

- **EDF algorithm** - Earliest Deadline First scheduling
- **Runtime** - Time task can run per period
- **Deadline** - Absolute deadline for task completion
- **Period** - Task period for periodic tasks
- **CBS** - Constant Bandwidth Server for bandwidth isolation
- **Deadline monitoring** - Monitoring deadline compliance

**Where**: SCHED_DEADLINE is important in:

- **Real-time systems** - All real-time applications with deadlines
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control with strict timing
- **Audio/video processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops with deadlines
- **Rock 5B+** - ARM64 deadline-based applications

## Real-Time Priority Levels

**What**: Real-time priority levels determine the relative importance of tasks in the system, with higher priority tasks running before lower priority tasks.

**Why**: Understanding priority levels is important because:

- **Task ordering** - Determines which tasks run first
- **System design** - Designing systems with appropriate priorities
- **Performance optimization** - Optimizing system performance
- **Resource management** - Managing system resources
- **Rock 5B+ development** - ARM64 specific priority management
- **Professional development** - Essential for real-time systems development

**When**: Priority levels are used when:

- **Real-time requirements** - Applications need deterministic timing
- **Task prioritization** - Different tasks have different importance
- **System optimization** - Optimizing system for real-time performance
- **Resource management** - Managing system resources
- **Development** - Understanding scheduling mechanisms
- **Rock 5B+** - ARM64 real-time task prioritization

**How**: Priority levels work through:

```c
// Example: Real-time priority levels
// 1. Priority level configuration
void configure_priority_levels(void) {
    // Highest priority (99)
    struct sched_param highest_prio;
    highest_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &highest_prio);

    // High priority (80)
    struct sched_param high_prio;
    high_prio.sched_priority = 80;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Medium priority (50)
    struct sched_param medium_prio;
    medium_prio.sched_priority = 50;
    sched_setscheduler(0, SCHED_FIFO, &medium_prio);

    // Low priority (1)
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);
}

// 2. Priority inheritance with RT mutexes
void priority_inheritance_example(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Low priority task acquires lock
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    rt_mutex_lock(&rt_lock);

    // High priority task tries to acquire same lock
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Low priority task inherits high priority
    // Medium priority tasks cannot preempt low priority task
    // High priority task can proceed when lock is released

    rt_mutex_unlock(&rt_lock);
}

// 3. Priority ceiling protocol
void priority_ceiling_example(void) {
    // Set priority ceiling for mutex
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ceiling priority
    rt_mutex_set_ceiling(&rt_lock, 80);

    // Task with priority 50 acquires lock
    struct sched_param task_prio;
    task_prio.sched_priority = 50;
    sched_setscheduler(0, SCHED_FIFO, &task_prio);

    rt_mutex_lock(&rt_lock);

    // Task priority is raised to ceiling priority (80)
    // Tasks with priority < 80 cannot preempt
    // Tasks with priority >= 80 can preempt
}

// 4. Dynamic priority adjustment
void dynamic_priority_adjustment(void) {
    // Get current priority
    struct sched_param param;
    sched_getparam(0, &param);

    // Adjust priority based on system load
    if (system_load_high()) {
        // Increase priority for critical tasks
        param.sched_priority = min(param.sched_priority + 10, 99);
    } else {
        // Decrease priority for non-critical tasks
        param.sched_priority = max(param.sched_priority - 5, 1);
    }

    sched_setscheduler(0, SCHED_FIFO, &param);
}

// 5. Priority-based resource allocation
void priority_based_allocation(void) {
    // Allocate resources based on priority
    int priority = get_current_priority();

    if (priority >= 80) {
        // High priority: allocate more resources
        allocate_more_resources();
    } else if (priority >= 50) {
        // Medium priority: allocate standard resources
        allocate_standard_resources();
    } else {
        // Low priority: allocate minimal resources
        allocate_minimal_resources();
    }
}
```

**Explanation**:

- **Priority levels** - Real-time priorities from 1-99
- **Priority inheritance** - RT mutexes provide priority inheritance
- **Priority ceiling** - Priority ceiling protocol for mutexes
- **Dynamic adjustment** - Adjusting priorities based on system conditions
- **Resource allocation** - Allocating resources based on priority

**Where**: Priority levels are important in:

- **Real-time systems** - All real-time applications
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Audio/video processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops and sensor processing
- **Rock 5B+** - ARM64 real-time applications

## Rock 5B+ Real-Time Scheduling

**What**: The Rock 5B+ platform requires specific considerations for real-time scheduling due to its ARM64 architecture, RK3588 SoC, and embedded nature.

**Why**: Understanding Rock 5B+ scheduling is important because:

- **ARM64 architecture** - Different from x86_64 scheduling considerations
- **RK3588 SoC** - Specific hardware capabilities and limitations
- **Embedded platform** - Resource constraints and optimization opportunities
- **Real-world application** - Practical embedded real-time development
- **Performance optimization** - Maximizing ARM64 real-time capabilities
- **Development efficiency** - Understanding platform-specific requirements

**When**: Rock 5B+ scheduling is relevant when:

- **System optimization** - Optimizing Rock 5B+ for real-time
- **Performance analysis** - Evaluating ARM64 real-time performance
- **Hardware integration** - Using Rock 5B+ peripherals
- **Debugging** - Troubleshooting ARM64 real-time issues
- **Development** - Writing real-time applications
- **Deployment** - Running real-time systems on Rock 5B+

**How**: Rock 5B+ scheduling involves:

```c
// Example: Rock 5B+ specific real-time scheduling
// 1. ARM64 specific scheduling configuration
void configure_rock5b_scheduling(void) {
    // Enable ARM64 specific features
    enable_arm64_scheduling_features();

    // Configure RK3588 specific settings
    configure_rk3588_scheduling();

    // Set up ARM64 specific priority inheritance
    setup_arm64_priority_inheritance();

    // Configure GIC for real-time interrupts
    configure_gic_scheduling();
}

// 2. RK3588 specific scheduling configuration
void configure_rk3588_scheduling(void) {
    // Configure CPU frequency for real-time
    struct cpufreq_policy *policy;
    policy = cpufreq_cpu_get(0);
    if (policy) {
        cpufreq_driver_target(policy, RT_FREQUENCY, CPUFREQ_RELATION_H);
        cpufreq_cpu_put(policy);
    }

    // Configure memory controller for low latency
    configure_memory_controller_scheduling();

    // Set up DMA for real-time transfers
    setup_dma_scheduling();

    // Configure interrupt controller
    configure_interrupt_controller_scheduling();
}

// 3. Rock 5B+ specific real-time task
void rock5b_realtime_task(void) {
    // Set ARM64 specific CPU affinity
    cpu_set_t cpuset;
    CPU_ZERO(&cpuset);
    CPU_SET(0, &cpuset);  // Use CPU 0 for real-time
    sched_setaffinity(0, sizeof(cpuset), &cpuset);

    // Set real-time priority
    struct sched_param param;
    param.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &param);

    // Configure ARM64 specific real-time features
    configure_arm64_realtime_features();

    // Real-time processing loop
    while (1) {
        wait_for_realtime_event();
        process_realtime_data();
    }
}

// 4. Rock 5B+ specific deadline scheduling
void rock5b_deadline_scheduling(void) {
    // Configure deadline scheduling for Rock 5B+
    struct sched_attr attr;
    attr.sched_policy = SCHED_DEADLINE;
    attr.sched_runtime = 1000000;    // 1ms runtime
    attr.sched_deadline = 2000000;    // 2ms deadline
    attr.sched_period = 2000000;      // 2ms period

    sched_setattr(0, &attr, 0);

    // ARM64 specific deadline processing
    while (1) {
        wait_for_deadline();
        process_deadline_data();
    }
}

// 5. Rock 5B+ specific priority inheritance
void rock5b_priority_inheritance(void) {
    // Create RT mutex for priority inheritance
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ARM64 specific priority inheritance
    rt_mutex_set_arm64_priority_inheritance(&rt_lock);

    // Real-time safe locking
    rt_mutex_lock(&rt_lock);

    // Critical section
    process_critical_data();

    // Release lock
    rt_mutex_unlock(&rt_lock);
}
```

**Explanation**:

- **ARM64 scheduling** - ARM64 specific scheduling features
- **RK3588 optimization** - Rockchip specific hardware optimization
- **Cache coherency** - ARM64 cache management for real-time
- **Interrupt scheduling** - GIC interrupt controller scheduling
- **CPU affinity** - Multi-core real-time task placement
- **Memory management** - ARM64 specific memory optimization

**Where**: Rock 5B+ scheduling is important in:

- **Embedded real-time** - IoT devices and industrial controllers
- **ARM64 development** - Learning ARM64 real-time programming
- **Single-board computers** - SBC real-time applications
- **Educational projects** - Learning real-time concepts
- **Prototype development** - Rapid real-time system prototyping
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Scheduling Understanding** - You understand real-time scheduling policies and their importance
2. **SCHED_FIFO/SCHED_RR** - You know the difference between FIFO and Round Robin scheduling
3. **SCHED_DEADLINE** - You understand deadline-based scheduling with EDF
4. **Priority Levels** - You know how to manage real-time priority levels
5. **Rock 5B+ Scheduling** - You understand ARM64 specific scheduling considerations

**Why** these concepts matter:

- **Real-time foundation** provides the basis for real-time task scheduling
- **System understanding** helps in designing real-time applications
- **Performance awareness** enables optimization of real-time systems
- **Platform knowledge** enables effective Rock 5B+ development
- **Professional skills** prepare you for embedded real-time development

**When** to use these concepts:

- **System design** - Apply scheduling policies when designing real-time systems
- **Performance analysis** - Use scheduling policies to evaluate systems
- **Optimization** - Apply scheduling policies to improve performance
- **Development** - Use scheduling policies when writing real-time applications
- **Embedded development** - Apply Rock 5B+ knowledge for ARM64 development

**Where** these skills apply:

- **Real-time systems** - Understanding the target platform for real-time applications
- **Embedded development** - Applying scheduling policies to embedded systems
- **Industrial automation** - Using scheduling policies in industrial applications
- **Professional development** - Working in real-time and embedded systems
- **Rock 5B+** - Specific platform real-time development

## Next Steps

**What** you're ready for next:

After mastering real-time scheduling policies, you should be ready to:

1. **Learn priority inheritance** - Understand priority inheritance protocols
2. **Study deadline scheduling** - Learn deadline-based scheduling algorithms
3. **Explore performance analysis** - Understand real-time performance measurement
4. **Begin applications** - Start developing real-time applications
5. **Understand optimization** - Learn real-time optimization techniques

**Where** to go next:

Continue with the next lesson on **"Priority Inheritance"** to learn:

- How priority inheritance prevents priority inversion
- Priority inheritance protocols and implementation
- Priority ceiling protocols
- Real-time mutexes and synchronization

**Why** the next lesson is important:

The next lesson builds directly on your scheduling knowledge by focusing on priority inheritance. You'll learn how to prevent priority inversion problems that can cause real-time systems to fail.

**How** to continue learning:

1. **Study priority inheritance** - Read about priority inheritance protocols
2. **Experiment with scheduling** - Try real-time scheduling on Rock 5B+
3. **Read kernel source** - Explore real-time scheduling code
4. **Join communities** - Engage with real-time Linux developers
5. **Build projects** - Start with simple real-time applications

## Resources

**Official Documentation**:

- [Real-Time Linux Documentation](https://www.kernel.org/doc/html/latest/scheduler/) - Comprehensive real-time documentation
- [PREEMPT_RT Documentation](https://wiki.linuxfoundation.org/realtime/) - PREEMPT_RT specific documentation
- [ARM64 Real-Time](https://www.kernel.org/doc/html/latest/arm64/) - ARM64 real-time considerations

**Community Resources**:

- [Real-Time Linux Foundation](https://wiki.linuxfoundation.org/realtime/) - Real-time Linux community
- [Linux Real-Time Mailing List](https://lore.kernel.org/linux-rt-users/) - Real-time Linux discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-rt) - Technical Q&A

**Learning Resources**:

- [Real-Time Systems by Jane W. S. Liu](https://www.cis.upenn.edu/~lee/07cis550/real-time/real-time_systems.pdf) - Comprehensive textbook
- [Real-Time Linux by Thomas Gleixner](https://www.kernel.org/doc/html/latest/scheduler/) - Linux real-time guide
- [Embedded Real-Time Systems by Qing Li](https://www.oreilly.com/library/view/real-time-systems/9780131834591/) - Embedded real-time guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

Happy learning! 🐧
