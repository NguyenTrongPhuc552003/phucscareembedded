---
sidebar_position: 2
---

# Priority Inheritance

Master priority inheritance protocols that prevent priority inversion problems in real-time systems, ensuring higher priority tasks can proceed when lower priority tasks hold shared resources.

## What is Priority Inheritance?

**What**: Priority inheritance is a mechanism that prevents priority inversion by temporarily raising the priority of a lower-priority task that holds a resource needed by a higher-priority task. This ensures that higher priority tasks can proceed without being blocked indefinitely.

**Why**: Understanding priority inheritance is crucial because:

- **Priority inversion prevention** - Prevents system deadlocks and failures
- **Real-time guarantees** - Ensures higher priority tasks can proceed
- **System reliability** - Prevents system failures due to priority inversion
- **Performance optimization** - Improves overall system performance
- **Rock 5B+ development** - ARM64 specific priority management
- **Professional development** - Essential for real-time systems development

**When**: Priority inheritance is used when:

- **Real-time systems** - All real-time systems with priority scheduling
- **Resource sharing** - When tasks share resources with different priorities
- **System optimization** - Improving system responsiveness
- **Debugging** - Troubleshooting priority-related issues
- **Development** - Understanding priority management
- **Rock 5B+** - ARM64 real-time priority management

**How**: Priority inheritance works by:

- **Priority elevation** - Temporarily raising the priority of lower priority tasks
- **Resource holding** - Tasks holding resources inherit higher priorities
- **Priority restoration** - Restoring original priorities when resources are released
- **Deadlock prevention** - Preventing priority inversion deadlocks
- **Real-time guarantees** - Ensuring higher priority tasks can proceed
- **System reliability** - Maintaining system stability

**Where**: Priority inheritance is found in:

- **Real-time systems** - All real-time applications
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Safety-critical systems** - Medical devices and automotive systems
- **Robotics** - Real-time control loops and sensor processing
- **Rock 5B+** - ARM64 real-time applications

## Priority Inversion Problem

**What**: Priority inversion occurs when a higher priority task is blocked by a lower priority task that holds a resource needed by the higher priority task, while medium priority tasks can preempt the lower priority task, causing the higher priority task to be blocked indefinitely.

**Why**: Understanding priority inversion is important because:

- **System failure** - Can cause real-time systems to fail
- **Deadlock prevention** - Essential for preventing system deadlocks
- **Real-time guarantees** - Understanding why priority inheritance is needed
- **System design** - Designing systems to avoid priority inversion
- **Rock 5B+ development** - ARM64 specific priority inversion considerations
- **Professional development** - Essential for real-time systems development

**When**: Priority inversion occurs when:

- **Resource sharing** - Tasks with different priorities share resources
- **Priority scheduling** - Systems use priority-based scheduling
- **Real-time systems** - All real-time systems with shared resources
- **System design** - Designing systems with shared resources
- **Development** - Understanding priority management
- **Rock 5B+** - ARM64 real-time systems with shared resources

**How**: Priority inversion works through:

```c
// Example: Priority inversion problem
// 1. Priority inversion scenario
void priority_inversion_example(void) {
    // High priority task (priority 99)
    struct task_struct *high_prio_task = create_task(99);

    // Medium priority task (priority 50)
    struct task_struct *medium_prio_task = create_task(50);

    // Low priority task (priority 1)
    struct task_struct *low_prio_task = create_task(1);

    // Low priority task acquires shared resource
    mutex_lock(&shared_resource);

    // High priority task tries to acquire same resource
    // Gets blocked by low priority task
    mutex_lock(&shared_resource);  // BLOCKED!

    // Medium priority task can preempt low priority task
    // High priority task remains blocked indefinitely
    // This is priority inversion!
}

// 2. Priority inversion with RT mutexes
void priority_inversion_rt_mutex(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Low priority task acquires RT mutex
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    rt_mutex_lock(&rt_lock);

    // High priority task tries to acquire same RT mutex
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // RT mutex provides priority inheritance
    // Low priority task inherits high priority
    // Medium priority tasks cannot preempt low priority task
    // High priority task can proceed when lock is released

    rt_mutex_unlock(&rt_lock);
}

// 3. Priority inversion without inheritance
void priority_inversion_no_inheritance(void) {
    // Regular mutex without priority inheritance
    struct mutex regular_lock;
    mutex_init(&regular_lock);

    // Low priority task acquires lock
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    mutex_lock(&regular_lock);

    // High priority task tries to acquire lock
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // No priority inheritance!
    // High priority task is blocked indefinitely
    // Medium priority tasks can preempt low priority task
    // This causes priority inversion
}

// 4. Priority inversion detection
void detect_priority_inversion(void) {
    // Monitor task priorities
    struct sched_param param;
    sched_getparam(0, &param);

    // Check if task is blocked by lower priority task
    if (is_blocked_by_lower_priority()) {
        // Priority inversion detected!
        handle_priority_inversion();
    }
}

// 5. Priority inversion prevention
void prevent_priority_inversion(void) {
    // Use RT mutexes for priority inheritance
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set priority inheritance
    rt_mutex_set_priority_inheritance(&rt_lock);

    // Real-time safe locking
    rt_mutex_lock(&rt_lock);

    // Critical section
    process_critical_data();

    // Release lock
    rt_mutex_unlock(&rt_lock);
}
```

**Explanation**:

- **Priority inversion** - Higher priority task blocked by lower priority task
- **Resource sharing** - Tasks with different priorities share resources
- **Preemption** - Medium priority tasks can preempt lower priority tasks
- **Blocking** - Higher priority tasks can be blocked indefinitely
- **RT mutexes** - Real-time mutexes provide priority inheritance

**Where**: Priority inversion is important in:

- **Real-time systems** - All real-time applications with shared resources
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Safety-critical systems** - Medical devices and automotive systems
- **Robotics** - Real-time control loops with shared resources
- **Rock 5B+** - ARM64 real-time applications

## Priority Inheritance Protocols

**What**: Priority inheritance protocols are mechanisms that implement priority inheritance to prevent priority inversion problems in real-time systems.

**Why**: Understanding priority inheritance protocols is crucial because:

- **Deadlock prevention** - Prevents priority inversion deadlocks
- **Real-time guarantees** - Ensures higher priority tasks can proceed
- **System reliability** - Prevents system failures due to priority inversion
- **Performance optimization** - Improves overall system performance
- **Rock 5B+ development** - ARM64 specific priority inheritance
- **Professional development** - Essential for real-time systems development

**When**: Priority inheritance protocols are used when:

- **Real-time systems** - All real-time systems with priority scheduling
- **Resource sharing** - When tasks share resources with different priorities
- **System optimization** - Improving system responsiveness
- **Debugging** - Troubleshooting priority-related issues
- **Development** - Understanding priority management
- **Rock 5B+** - ARM64 real-time priority management

**How**: Priority inheritance protocols work through:

```c
// Example: Priority inheritance protocols
// 1. Basic priority inheritance
void basic_priority_inheritance(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Low priority task acquires lock
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    rt_mutex_lock(&rt_lock);

    // High priority task tries to acquire lock
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Low priority task inherits high priority
    // Medium priority tasks cannot preempt low priority task
    // High priority task can proceed when lock is released

    rt_mutex_unlock(&rt_lock);
}

// 2. Priority inheritance with multiple tasks
void multiple_task_priority_inheritance(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Task 1: Low priority (1)
    struct sched_param task1_prio;
    task1_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &task1_prio);

    rt_mutex_lock(&rt_lock);

    // Task 2: Medium priority (50)
    struct sched_param task2_prio;
    task2_prio.sched_priority = 50;
    sched_setscheduler(0, SCHED_FIFO, &task2_prio);

    // Task 3: High priority (99)
    struct sched_param task3_prio;
    task3_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &task3_prio);

    // Task 1 inherits priority 99 (highest waiting task)
    // Task 2 cannot preempt Task 1
    // Task 3 can proceed when Task 1 releases lock
}

// 3. Priority inheritance with nested locks
void nested_lock_priority_inheritance(void) {
    struct rt_mutex lock1, lock2;
    rt_mutex_init(&lock1);
    rt_mutex_init(&lock2);

    // Low priority task acquires lock1
    struct sched_param low_prio;
    low_prio.sched_priority = 1;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    rt_mutex_lock(&lock1);
    rt_mutex_lock(&lock2);

    // High priority task tries to acquire lock2
    struct sched_param high_prio;
    high_prio.sched_priority = 99;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Low priority task inherits priority 99
    // Must release both locks for high priority task to proceed
    rt_mutex_unlock(&lock2);
    rt_mutex_unlock(&lock1);
}

// 4. Priority inheritance with timeout
void priority_inheritance_timeout(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set timeout for priority inheritance
    struct hrtimer_sleeper timeout;
    hrtimer_init_sleeper(&timeout, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
    timeout.timer.function = priority_inheritance_timeout_handler;

    // Try to acquire lock with timeout
    int ret = rt_mutex_timedlock(&rt_lock, &timeout);
    if (ret == -ETIMEDOUT) {
        // Timeout occurred
        handle_priority_inheritance_timeout();
    }
}

// 5. Priority inheritance monitoring
void monitor_priority_inheritance(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Monitor priority inheritance
    rt_mutex_set_priority_inheritance_monitor(&rt_lock);

    // Check if priority inheritance is active
    if (rt_mutex_is_priority_inheritance_active(&rt_lock)) {
        // Priority inheritance is active
        log_priority_inheritance_activity();
    }
}
```

**Explanation**:

- **Basic inheritance** - Simple priority inheritance mechanism
- **Multiple tasks** - Priority inheritance with multiple waiting tasks
- **Nested locks** - Priority inheritance with nested locks
- **Timeout handling** - Priority inheritance with timeout
- **Monitoring** - Monitoring priority inheritance activity

**Where**: Priority inheritance protocols are important in:

- **Real-time systems** - All real-time applications with shared resources
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Safety-critical systems** - Medical devices and automotive systems
- **Robotics** - Real-time control loops with shared resources
- **Rock 5B+** - ARM64 real-time applications

## Priority Ceiling Protocols

**What**: Priority ceiling protocols are mechanisms that prevent priority inversion by setting a ceiling priority for resources, ensuring that tasks holding resources have at least the ceiling priority.

**Why**: Understanding priority ceiling protocols is important because:

- **Priority inversion prevention** - Prevents priority inversion problems
- **Real-time guarantees** - Ensures higher priority tasks can proceed
- **System reliability** - Prevents system failures due to priority inversion
- **Performance optimization** - Improves overall system performance
- **Rock 5B+ development** - ARM64 specific priority management
- **Professional development** - Essential for real-time systems development

**When**: Priority ceiling protocols are used when:

- **Real-time systems** - All real-time systems with priority scheduling
- **Resource sharing** - When tasks share resources with different priorities
- **System optimization** - Improving system responsiveness
- **Debugging** - Troubleshooting priority-related issues
- **Development** - Understanding priority management
- **Rock 5B+** - ARM64 real-time priority management

**How**: Priority ceiling protocols work through:

```c
// Example: Priority ceiling protocols
// 1. Basic priority ceiling
void basic_priority_ceiling(void) {
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

// 2. Priority ceiling with multiple resources
void multiple_resource_priority_ceiling(void) {
    struct rt_mutex lock1, lock2;
    rt_mutex_init(&lock1);
    rt_mutex_init(&lock2);

    // Set different ceiling priorities
    rt_mutex_set_ceiling(&lock1, 60);
    rt_mutex_set_ceiling(&lock2, 80);

    // Task acquires lock1
    struct sched_param task_prio;
    task_prio.sched_priority = 50;
    sched_setscheduler(0, SCHED_FIFO, &task_prio);

    rt_mutex_lock(&lock1);
    // Task priority raised to 60

    rt_mutex_lock(&lock2);
    // Task priority raised to 80 (highest ceiling)

    // Release locks in reverse order
    rt_mutex_unlock(&lock2);
    rt_mutex_unlock(&lock1);
}

// 3. Priority ceiling with inheritance
void priority_ceiling_with_inheritance(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ceiling priority
    rt_mutex_set_ceiling(&rt_lock, 70);

    // Enable priority inheritance
    rt_mutex_set_priority_inheritance(&rt_lock);

    // Low priority task acquires lock
    struct sched_param low_prio;
    low_prio.sched_priority = 30;
    sched_setscheduler(0, SCHED_FIFO, &low_prio);

    rt_mutex_lock(&rt_lock);
    // Task priority raised to ceiling (70)

    // High priority task tries to acquire lock
    struct sched_param high_prio;
    high_prio.sched_priority = 90;
    sched_setscheduler(0, SCHED_FIFO, &high_prio);

    // Low priority task inherits high priority (90)
    // But cannot exceed ceiling (70)
    // So task priority remains at ceiling (70)
}

// 4. Priority ceiling monitoring
void monitor_priority_ceiling(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ceiling priority
    rt_mutex_set_ceiling(&rt_lock, 80);

    // Monitor ceiling activity
    rt_mutex_set_ceiling_monitor(&rt_lock);

    // Check if ceiling is active
    if (rt_mutex_is_ceiling_active(&rt_lock)) {
        // Ceiling is active
        log_ceiling_activity();
    }
}

// 5. Priority ceiling with timeout
void priority_ceiling_timeout(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ceiling priority
    rt_mutex_set_ceiling(&rt_lock, 80);

    // Set timeout for ceiling
    struct hrtimer_sleeper timeout;
    hrtimer_init_sleeper(&timeout, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
    timeout.timer.function = priority_ceiling_timeout_handler;

    // Try to acquire lock with timeout
    int ret = rt_mutex_timedlock(&rt_lock, &timeout);
    if (ret == -ETIMEDOUT) {
        // Timeout occurred
        handle_priority_ceiling_timeout();
    }
}
```

**Explanation**:

- **Ceiling priority** - Maximum priority for tasks holding resources
- **Multiple resources** - Different ceiling priorities for different resources
- **Inheritance combination** - Combining ceiling with inheritance
- **Monitoring** - Monitoring ceiling activity
- **Timeout handling** - Ceiling with timeout

**Where**: Priority ceiling protocols are important in:

- **Real-time systems** - All real-time applications with shared resources
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Safety-critical systems** - Medical devices and automotive systems
- **Robotics** - Real-time control loops with shared resources
- **Rock 5B+** - ARM64 real-time applications

## Rock 5B+ Priority Inheritance

**What**: The Rock 5B+ platform requires specific considerations for priority inheritance due to its ARM64 architecture, RK3588 SoC, and embedded nature.

**Why**: Understanding Rock 5B+ priority inheritance is important because:

- **ARM64 architecture** - Different from x86_64 priority inheritance
- **RK3588 SoC** - Specific hardware capabilities and limitations
- **Embedded platform** - Resource constraints and optimization opportunities
- **Real-world application** - Practical embedded real-time development
- **Performance optimization** - Maximizing ARM64 real-time capabilities
- **Development efficiency** - Understanding platform-specific requirements

**When**: Rock 5B+ priority inheritance is relevant when:

- **System optimization** - Optimizing Rock 5B+ for real-time
- **Performance analysis** - Evaluating ARM64 real-time performance
- **Hardware integration** - Using Rock 5B+ peripherals
- **Debugging** - Troubleshooting ARM64 real-time issues
- **Development** - Writing real-time applications
- **Deployment** - Running real-time systems on Rock 5B+

**How**: Rock 5B+ priority inheritance involves:

```c
// Example: Rock 5B+ specific priority inheritance
// 1. ARM64 specific priority inheritance
void configure_rock5b_priority_inheritance(void) {
    // Enable ARM64 specific features
    enable_arm64_priority_inheritance();

    // Configure RK3588 specific settings
    configure_rk3588_priority_inheritance();

    // Set up ARM64 specific priority inheritance
    setup_arm64_priority_inheritance();

    // Configure GIC for real-time interrupts
    configure_gic_priority_inheritance();
}

// 2. RK3588 specific priority inheritance
void configure_rk3588_priority_inheritance(void) {
    // Configure CPU frequency for real-time
    struct cpufreq_policy *policy;
    policy = cpufreq_cpu_get(0);
    if (policy) {
        cpufreq_driver_target(policy, RT_FREQUENCY, CPUFREQ_RELATION_H);
        cpufreq_cpu_put(policy);
    }

    // Configure memory controller for low latency
    configure_memory_controller_priority_inheritance();

    // Set up DMA for real-time transfers
    setup_dma_priority_inheritance();

    // Configure interrupt controller
    configure_interrupt_controller_priority_inheritance();
}

// 3. Rock 5B+ specific RT mutex
void rock5b_rt_mutex_example(void) {
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

// 4. Rock 5B+ specific priority ceiling
void rock5b_priority_ceiling(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ceiling priority for Rock 5B+
    rt_mutex_set_ceiling(&rt_lock, 80);

    // Set ARM64 specific ceiling
    rt_mutex_set_arm64_ceiling(&rt_lock);

    // Real-time safe locking
    rt_mutex_lock(&rt_lock);

    // Critical section
    process_critical_data();

    // Release lock
    rt_mutex_unlock(&rt_lock);
}

// 5. Rock 5B+ specific priority inheritance monitoring
void rock5b_priority_inheritance_monitoring(void) {
    struct rt_mutex rt_lock;
    rt_mutex_init(&rt_lock);

    // Set ARM64 specific priority inheritance
    rt_mutex_set_arm64_priority_inheritance(&rt_lock);

    // Monitor priority inheritance
    rt_mutex_set_priority_inheritance_monitor(&rt_lock);

    // Check if priority inheritance is active
    if (rt_mutex_is_priority_inheritance_active(&rt_lock)) {
        // Priority inheritance is active
        log_rock5b_priority_inheritance_activity();
    }
}
```

**Explanation**:

- **ARM64 priority inheritance** - ARM64 specific priority inheritance features
- **RK3588 optimization** - Rockchip specific hardware optimization
- **Cache coherency** - ARM64 cache management for real-time
- **Interrupt handling** - GIC interrupt controller priority inheritance
- **CPU affinity** - Multi-core real-time task placement
- **Memory management** - ARM64 specific memory optimization

**Where**: Rock 5B+ priority inheritance is important in:

- **Embedded real-time** - IoT devices and industrial controllers
- **ARM64 development** - Learning ARM64 real-time programming
- **Single-board computers** - SBC real-time applications
- **Educational projects** - Learning real-time concepts
- **Prototype development** - Rapid real-time system prototyping
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Priority Inheritance Understanding** - You understand what priority inheritance is and its importance
2. **Priority Inversion Problem** - You know how priority inversion occurs and why it's problematic
3. **Priority Inheritance Protocols** - You understand how priority inheritance protocols work
4. **Priority Ceiling Protocols** - You know how priority ceiling protocols prevent priority inversion
5. **Rock 5B+ Priority Inheritance** - You understand ARM64 specific priority inheritance considerations

**Why** these concepts matter:

- **Real-time foundation** provides the basis for real-time task scheduling
- **System understanding** helps in designing real-time applications
- **Performance awareness** enables optimization of real-time systems
- **Platform knowledge** enables effective Rock 5B+ development
- **Professional skills** prepare you for embedded real-time development

**When** to use these concepts:

- **System design** - Apply priority inheritance when designing real-time systems
- **Performance analysis** - Use priority inheritance to evaluate systems
- **Optimization** - Apply priority inheritance to improve performance
- **Development** - Use priority inheritance when writing real-time applications
- **Embedded development** - Apply Rock 5B+ knowledge for ARM64 development

**Where** these skills apply:

- **Real-time systems** - Understanding the target platform for real-time applications
- **Embedded development** - Applying priority inheritance to embedded systems
- **Industrial automation** - Using priority inheritance in industrial applications
- **Professional development** - Working in real-time and embedded systems
- **Rock 5B+** - Specific platform real-time development

## Next Steps

**What** you're ready for next:

After mastering priority inheritance, you should be ready to:

1. **Learn deadline scheduling** - Understand deadline-based scheduling algorithms
2. **Study performance analysis** - Learn real-time performance measurement
3. **Explore applications** - Start developing real-time applications
4. **Understand optimization** - Learn real-time optimization techniques
5. **Begin advanced topics** - Learn advanced real-time concepts

**Where** to go next:

Continue with the next lesson on **"Deadline Scheduling"** to learn:

- EDF (Earliest Deadline First) scheduling algorithm
- CBS (Constant Bandwidth Server) implementation
- Deadline scheduling implementation
- Real-time deadline guarantees

**Why** the next lesson is important:

The next lesson builds directly on your priority inheritance knowledge by focusing on deadline-based scheduling. You'll learn how to implement scheduling algorithms that ensure tasks meet their deadlines.

**How** to continue learning:

1. **Study deadline scheduling** - Read about deadline-based scheduling algorithms
2. **Experiment with priority inheritance** - Try priority inheritance on Rock 5B+
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
