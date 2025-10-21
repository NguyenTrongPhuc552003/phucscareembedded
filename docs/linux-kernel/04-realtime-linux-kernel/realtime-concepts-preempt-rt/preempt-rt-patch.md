---
sidebar_position: 2
---

# PREEMPT_RT Patch

Master the PREEMPT_RT patch that transforms standard Linux into a real-time operating system, understanding its components, benefits, and implementation on the Rock 5B+ ARM64 platform.

## What is the PREEMPT_RT Patch?

**What**: The PREEMPT_RT patch is a comprehensive set of modifications to the Linux kernel that enables real-time behavior by making the kernel fully preemptible, implementing priority inheritance, and providing deterministic scheduling guarantees.

**Why**: Understanding PREEMPT_RT is crucial because:

- **Real-time Linux** - Enables Linux to be used for real-time applications
- **Industry standard** - Widely used in industrial and embedded systems
- **Performance benefits** - Provides deterministic timing behavior
- **Open source** - Free and open alternative to proprietary RTOS
- **Rock 5B+ development** - Essential for ARM64 real-time applications
- **Professional development** - High-demand skill in embedded systems

**When**: PREEMPT_RT is used when:

- **Real-time requirements** - Applications need deterministic timing
- **Industrial automation** - Factory control and process automation
- **Embedded systems** - IoT devices and industrial controllers
- **Audio/video processing** - Low-latency multimedia applications
- **Robotics** - Real-time control loops and sensor processing
- **Safety-critical systems** - Medical devices and automotive systems

**How**: PREEMPT_RT works by:

- **Kernel preemption** - Making the kernel fully preemptible
- **Priority inheritance** - Preventing priority inversion problems
- **Threaded interrupts** - Converting interrupt handlers to kernel threads
- **Real-time scheduling** - Implementing deterministic task scheduling
- **Locking mechanisms** - Providing real-time safe locking primitives
- **Timing guarantees** - Ensuring predictable system behavior

**Where**: PREEMPT_RT is found in:

- **Industrial systems** - Factory automation and control
- **Embedded Linux** - IoT devices and single-board computers
- **Medical devices** - Real-time monitoring and control systems
- **Automotive systems** - Engine control and safety systems
- **Aerospace** - Flight control and navigation systems
- **Rock 5B+** - ARM64 real-time applications

## PREEMPT_RT Overview

**What**: PREEMPT_RT is a comprehensive patch that modifies the Linux kernel to provide real-time capabilities while maintaining compatibility with standard Linux applications.

**Why**: Understanding the overview is important because:

- **System architecture** - How real-time capabilities are integrated
- **Compatibility** - Maintaining Linux application compatibility
- **Performance** - Balancing real-time requirements with general performance
- **Development** - Understanding the development and maintenance process
- **Deployment** - Planning real-time system deployment
- **Rock 5B+ integration** - Applying PREEMPT_RT to ARM64 systems

**When**: The overview is relevant when:

- **System planning** - Designing real-time Linux systems
- **Performance analysis** - Evaluating real-time capabilities
- **Development** - Understanding the development process
- **Deployment** - Planning system deployment
- **Troubleshooting** - Diagnosing real-time issues
- **Optimization** - Improving real-time performance

**How**: PREEMPT_RT overview works through:

```c
// Example: PREEMPT_RT overview components
// 1. Kernel preemption configuration
#ifdef CONFIG_PREEMPT_RT
// Real-time kernel configuration
#define PREEMPT_RT_FEATURES
#define THREADED_IRQS
#define PRIORITY_INHERITANCE
#define RT_MUTEXES
#endif

// 2. Real-time scheduling classes
struct sched_class {
    const struct sched_class *next;

    // Real-time scheduling methods
    void (*enqueue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*dequeue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*yield_task)   (struct rq *rq);
    bool (*yield_to_task)(struct rq *rq, struct task_struct *p, bool preempt);

    void (*check_preempt_curr)(struct rq *rq, struct task_struct *p, int flags);
    struct task_struct *(*pick_next_task)(struct rq *rq, struct task_struct *prev);
    void (*put_prev_task)(struct rq *rq, struct task_struct *p);

    void (*set_curr_task)(struct rq *rq);
    void (*task_tick)(struct rq *rq, struct task_struct *p, int queued);
    void (*task_fork)(struct task_struct *p);
    void (*task_dead)(struct task_struct *p);

    // Real-time specific methods
    void (*switched_from)(struct rq *rq, struct task_struct *p);
    void (*switched_to)(struct rq *rq, struct task_struct *p);
    void (*prio_changed)(struct rq *rq, struct task_struct *p, int oldprio);
};

// 3. Threaded interrupt handling
struct irqaction {
    irq_handler_t handler;
    void *dev_id;
    struct irqaction *next;
    irq_handler_t thread_fn;
    struct task_struct *thread;
    unsigned int irq;
    unsigned int flags;
    const char *name;
    struct proc_dir_entry *dir;
};

// 4. Priority inheritance implementation
struct rt_mutex {
    struct plist_node wait_list;
    struct task_struct *owner;
    int save_state;
    struct debug_obj;
};

// 5. Real-time mutex operations
void rt_mutex_init_proxy_locked(struct rt_mutex *lock,
                                struct task_struct *proxy_owner);
void rt_mutex_proxy_unlock(struct rt_mutex *lock);
int rt_mutex_start_proxy_lock(struct rt_mutex *lock,
                              struct rt_mutex_waiter *waiter,
                              struct task_struct *task);
int rt_mutex_finish_proxy_lock(struct rt_mutex *lock,
                               struct hrtimer_sleeper *to,
                               struct rt_mutex_waiter *waiter);
```

**Explanation**:

- **Kernel preemption** - Enables preemption of kernel code
- **Real-time scheduling** - Implements deterministic task scheduling
- **Threaded interrupts** - Converts interrupt handlers to kernel threads
- **Priority inheritance** - Prevents priority inversion problems
- **Real-time mutexes** - Provides real-time safe locking mechanisms

**Where**: PREEMPT_RT overview is important in:

- **Real-time systems** - Understanding the foundation of real-time Linux
- **Embedded development** - Learning real-time embedded systems
- **Industrial automation** - Applying real-time concepts to industrial systems
- **Professional development** - Working in real-time systems development
- **Rock 5B+** - ARM64 real-time development

## Kernel Preemption Models

**What**: Kernel preemption models determine when the kernel can be interrupted by higher-priority tasks, affecting the real-time behavior of the system.

**Why**: Understanding preemption models is important because:

- **Real-time behavior** - Determines system responsiveness
- **Performance impact** - Affects overall system performance
- **Latency characteristics** - Influences interrupt and scheduling latency
- **System design** - Guides architecture decisions
- **Optimization** - Enables performance tuning
- **Rock 5B+ development** - Understanding ARM64 preemption

**When**: Preemption models are relevant when:

- **System configuration** - Choosing appropriate preemption model
- **Performance analysis** - Evaluating system behavior
- **Real-time requirements** - Meeting timing constraints
- **Optimization** - Improving system performance
- **Debugging** - Troubleshooting timing issues
- **Development** - Understanding system behavior

**How**: Preemption models work through:

```c
// Example: Kernel preemption models
// 1. No preemption (CONFIG_PREEMPT_NONE)
// Kernel code runs without preemption
void no_preempt_function(void) {
    // Long-running kernel operation
    for (int i = 0; i < 1000000; i++) {
        process_data(i);
        // Cannot be preempted by user tasks
    }
}

// 2. Voluntary preemption (CONFIG_PREEMPT_VOLUNTARY)
// Kernel can yield voluntarily
void voluntary_preempt_function(void) {
    for (int i = 0; i < 1000000; i++) {
        process_data(i);

        // Voluntary preemption points
        if (need_resched()) {
            schedule();
        }
    }
}

// 3. Full preemption (CONFIG_PREEMPT)
// Kernel can be preempted at any time
void full_preempt_function(void) {
    for (int i = 0; i < 1000000; i++) {
        process_data(i);
        // Can be preempted at any instruction
    }
}

// 4. Real-time preemption (CONFIG_PREEMPT_RT)
// Real-time preemption with priority inheritance
void rt_preempt_function(void) {
    // Real-time safe operations
    rt_mutex_lock(&rt_lock);

    for (int i = 0; i < 1000000; i++) {
        process_data(i);
        // Can be preempted by higher priority tasks
    }

    rt_mutex_unlock(&rt_lock);
}

// Preemption model selection
void configure_preemption_model(void) {
#ifdef CONFIG_PREEMPT_NONE
    printk("No preemption model\n");
#elif defined(CONFIG_PREEMPT_VOLUNTARY)
    printk("Voluntary preemption model\n");
#elif defined(CONFIG_PREEMPT)
    printk("Full preemption model\n");
#elif defined(CONFIG_PREEMPT_RT)
    printk("Real-time preemption model\n");
#endif
}
```

**Explanation**:

- **No preemption** - Kernel runs without interruption
- **Voluntary preemption** - Kernel can yield voluntarily
- **Full preemption** - Kernel can be preempted anywhere
- **Real-time preemption** - Real-time safe preemption with priority inheritance
- **Performance trade-offs** - Different models have different performance characteristics

**Where**: Preemption models are important in:

- **Real-time systems** - Choosing appropriate preemption for real-time requirements
- **Embedded systems** - Balancing real-time needs with resource constraints
- **Performance-critical systems** - Optimizing system performance
- **Industrial systems** - Meeting industrial real-time requirements
- **Rock 5B+** - ARM64 preemption configuration

## Threaded Interrupt Handlers

**What**: Threaded interrupt handlers convert interrupt service routines (ISRs) into kernel threads, enabling them to be scheduled like regular tasks and providing better real-time behavior.

**Why**: Understanding threaded interrupts is crucial because:

- **Real-time scheduling** - Interrupts can be scheduled with priorities
- **Priority inheritance** - Prevents priority inversion in interrupt handling
- **Deterministic behavior** - More predictable interrupt processing
- **System responsiveness** - Better overall system responsiveness
- **Debugging** - Easier debugging of interrupt-related issues
- **Rock 5B+ development** - ARM64 specific interrupt handling

**When**: Threaded interrupts are used when:

- **Real-time requirements** - Applications need deterministic interrupt handling
- **Priority management** - Different interrupts have different priorities
- **System optimization** - Improving overall system performance
- **Debugging** - Troubleshooting interrupt-related issues
- **Development** - Understanding interrupt handling mechanisms
- **Rock 5B+** - ARM64 real-time interrupt processing

**How**: Threaded interrupts work through:

```c
// Example: Threaded interrupt handlers
// 1. Traditional interrupt handler
irqreturn_t traditional_handler(int irq, void *dev_id) {
    // Interrupt processing
    process_interrupt_data();

    // Cannot be preempted by user tasks
    return IRQ_HANDLED;
}

// 2. Threaded interrupt handler
irqreturn_t threaded_handler(int irq, void *dev_id) {
    // Quick interrupt acknowledgment
    acknowledge_interrupt();

    // Return IRQ_WAKE_THREAD to wake up thread
    return IRQ_WAKE_THREAD;
}

// 3. Thread function for threaded interrupt
irqreturn_t threaded_handler_fn(int irq, void *dev_id) {
    // Interrupt processing in thread context
    process_interrupt_data();

    // Can be preempted by higher priority tasks
    return IRQ_HANDLED;
}

// 4. Registering threaded interrupt
int register_threaded_interrupt(void) {
    int ret;

    // Register threaded interrupt
    ret = request_threaded_irq(IRQ_NUMBER,
                              threaded_handler,
                              threaded_handler_fn,
                              IRQF_ONESHOT,
                              "my_threaded_irq",
                              &my_device);

    if (ret) {
        printk("Failed to register threaded interrupt: %d\n", ret);
        return ret;
    }

    return 0;
}

// 5. Threaded interrupt with priority
int register_priority_threaded_interrupt(void) {
    int ret;

    // Register threaded interrupt with priority
    ret = request_threaded_irq(IRQ_NUMBER,
                              threaded_handler,
                              threaded_handler_fn,
                              IRQF_ONESHOT | IRQF_NOBALANCING,
                              "my_priority_threaded_irq",
                              &my_device);

    if (ret) {
        printk("Failed to register priority threaded interrupt: %d\n", ret);
        return ret;
    }

    // Set thread priority
    struct task_struct *thread = get_irq_thread(IRQ_NUMBER);
    if (thread) {
        struct sched_param param;
        param.sched_priority = 50;  // High priority
        sched_setscheduler(thread, SCHED_FIFO, &param);
    }

    return 0;
}
```

**Explanation**:

- **Threaded interrupts** - Convert ISRs to kernel threads
- **Priority scheduling** - Interrupts can be scheduled with priorities
- **Preemption** - Threaded interrupts can be preempted
- **Priority inheritance** - Prevents priority inversion
- **Real-time behavior** - More deterministic interrupt handling

**Where**: Threaded interrupts are important in:

- **Real-time systems** - All real-time Linux systems
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Audio/video processing** - Low-latency multimedia applications
- **Rock 5B+** - ARM64 real-time interrupt handling

## Priority Inheritance

**What**: Priority inheritance is a mechanism that prevents priority inversion by temporarily raising the priority of a lower-priority task that holds a resource needed by a higher-priority task.

**Why**: Understanding priority inheritance is crucial because:

- **Priority inversion prevention** - Prevents system deadlocks
- **Real-time guarantees** - Ensures higher priority tasks can proceed
- **System reliability** - Prevents system failures due to priority inversion
- **Performance optimization** - Improves overall system performance
- **Debugging** - Helps diagnose priority-related issues
- **Rock 5B+ development** - ARM64 specific priority management

**When**: Priority inheritance is used when:

- **Real-time systems** - All real-time systems with priority scheduling
- **Resource sharing** - When tasks share resources with different priorities
- **System optimization** - Improving system responsiveness
- **Debugging** - Troubleshooting priority-related issues
- **Development** - Understanding priority management
- **Rock 5B+** - ARM64 real-time priority management

**How**: Priority inheritance works through:

```c
// Example: Priority inheritance implementation
// 1. Priority inversion problem
void priority_inversion_example(void) {
    // High priority task
    struct task_struct *high_prio_task = create_task(99);

    // Medium priority task
    struct task_struct *medium_prio_task = create_task(50);

    // Low priority task
    struct task_struct *low_prio_task = create_task(1);

    // Low priority task acquires lock
    mutex_lock(&shared_lock);

    // High priority task tries to acquire same lock
    // Gets blocked by low priority task
    // Medium priority task can preempt low priority task
    // High priority task is blocked indefinitely
}

// 2. Priority inheritance solution
void priority_inheritance_example(void) {
    // High priority task
    struct task_struct *high_prio_task = create_task(99);

    // Medium priority task
    struct task_struct *medium_prio_task = create_task(50);

    // Low priority task
    struct task_struct *low_prio_task = create_task(1);

    // Low priority task acquires RT mutex
    rt_mutex_lock(&rt_shared_lock);

    // High priority task tries to acquire same lock
    // Low priority task inherits high priority
    // Medium priority task cannot preempt low priority task
    // High priority task can proceed when lock is released
}

// 3. RT mutex with priority inheritance
struct rt_mutex {
    struct plist_node wait_list;
    struct task_struct *owner;
    int save_state;
    struct debug_obj;
};

// 4. Priority inheritance implementation
void rt_mutex_set_owner(struct rt_mutex *lock, struct task_struct *owner) {
    if (owner) {
        // Set owner and inherit priority
        lock->owner = owner;
        rt_mutex_adjust_prio(owner);
    } else {
        // Clear owner and restore priority
        rt_mutex_adjust_prio(lock->owner);
        lock->owner = NULL;
    }
}

// 5. Priority adjustment
void rt_mutex_adjust_prio(struct task_struct *task) {
    int prio = rt_mutex_get_effective_prio(task);

    if (prio != task->prio) {
        // Adjust task priority
        task->prio = prio;
        rt_mutex_set_prio(task, prio);
    }
}

// 6. Priority inheritance in action
void demonstrate_priority_inheritance(void) {
    struct rt_mutex lock;
    struct task_struct *low_prio_task;
    struct task_struct *high_prio_task;

    // Initialize RT mutex
    rt_mutex_init(&lock);

    // Low priority task acquires lock
    low_prio_task = create_task(1);
    rt_mutex_lock(&lock);

    // High priority task tries to acquire lock
    high_prio_task = create_task(99);
    rt_mutex_lock(&lock);  // This will cause priority inheritance

    // Low priority task now has priority 99
    // Medium priority tasks cannot preempt it
    // High priority task can proceed when lock is released
}
```

**Explanation**:

- **Priority inversion** - Higher priority task blocked by lower priority task
- **Priority inheritance** - Lower priority task inherits higher priority
- **RT mutexes** - Real-time mutexes with priority inheritance
- **Priority adjustment** - Dynamic priority adjustment based on inheritance
- **System reliability** - Prevents system failures due to priority inversion

**Where**: Priority inheritance is important in:

- **Real-time systems** - All real-time systems with priority scheduling
- **Embedded systems** - Resource-constrained real-time systems
- **Industrial automation** - Factory control and process automation
- **Safety-critical systems** - Medical devices and automotive systems
- **Rock 5B+** - ARM64 real-time priority management

## Rock 5B+ PREEMPT_RT Configuration

**What**: The Rock 5B+ platform requires specific configuration for PREEMPT_RT to work optimally with its ARM64 architecture and RK3588 SoC.

**Why**: Understanding Rock 5B+ configuration is important because:

- **ARM64 architecture** - Different from x86_64 PREEMPT_RT configuration
- **RK3588 SoC** - Specific hardware considerations
- **Embedded platform** - Resource constraints and optimization opportunities
- **Real-world application** - Practical embedded real-time development
- **Performance optimization** - Maximizing ARM64 real-time capabilities
- **Development efficiency** - Understanding platform-specific requirements

**When**: Rock 5B+ configuration is relevant when:

- **System setup** - Configuring PREEMPT_RT for Rock 5B+
- **Performance optimization** - Maximizing real-time performance
- **Hardware integration** - Using Rock 5B+ peripherals
- **Debugging** - Troubleshooting ARM64 real-time issues
- **Development** - Writing real-time applications
- **Deployment** - Running real-time systems on Rock 5B+

**How**: Rock 5B+ PREEMPT_RT configuration involves:

```c
// Example: Rock 5B+ PREEMPT_RT configuration
// 1. ARM64 specific PREEMPT_RT configuration
void configure_rock5b_preempt_rt(void) {
    // Enable ARM64 specific features
    enable_arm64_preempt_rt();

    // Configure RK3588 specific settings
    configure_rk3588_preempt_rt();

    // Set up ARM64 cache coherency
    setup_arm64_cache_coherency();

    // Configure GIC for real-time interrupts
    configure_gic_preempt_rt();
}

// 2. RK3588 specific PREEMPT_RT configuration
void configure_rk3588_preempt_rt(void) {
    // Configure CPU frequency for real-time
    struct cpufreq_policy *policy;
    policy = cpufreq_cpu_get(0);
    if (policy) {
        cpufreq_driver_target(policy, RT_FREQUENCY, CPUFREQ_RELATION_H);
        cpufreq_cpu_put(policy);
    }

    // Configure memory controller for low latency
    configure_memory_controller_preempt_rt();

    // Set up DMA for real-time transfers
    setup_dma_preempt_rt();

    // Configure interrupt controller
    configure_interrupt_controller_preempt_rt();
}

// 3. ARM64 specific real-time configuration
void enable_arm64_preempt_rt(void) {
    // Enable ARM64 specific preemption features
    enable_arm64_preemption();

    // Configure ARM64 specific scheduling
    configure_arm64_scheduling();

    // Set up ARM64 specific priority inheritance
    setup_arm64_priority_inheritance();
}

// 4. Real-time task configuration for Rock 5B+
void configure_rock5b_realtime_task(void) {
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
}

// 5. Rock 5B+ specific real-time interrupt handling
irqreturn_t rock5b_realtime_handler(int irq, void *dev_id) {
    // ARM64 specific interrupt processing
    unsigned long flags;
    local_irq_save(flags);

    // Critical section with interrupts disabled
    process_realtime_interrupt();

    local_irq_restore(flags);

    return IRQ_HANDLED;
}

// 6. Rock 5B+ specific real-time mutex
void rock5b_realtime_mutex_example(void) {
    struct rt_mutex rt_lock;

    // Initialize RT mutex
    rt_mutex_init(&rt_lock);

    // Real-time safe locking
    rt_mutex_lock(&rt_lock);

    // Critical section
    process_critical_data();

    // Release lock
    rt_mutex_unlock(&rt_lock);
}
```

**Explanation**:

- **ARM64 configuration** - ARM64 specific PREEMPT_RT settings
- **RK3588 optimization** - Rockchip specific hardware optimization
- **Cache coherency** - ARM64 cache management for real-time
- **Interrupt handling** - GIC interrupt controller configuration
- **CPU affinity** - Multi-core real-time task placement
- **Memory management** - ARM64 specific memory optimization

**Where**: Rock 5B+ configuration is important in:

- **Embedded real-time** - IoT devices and industrial controllers
- **ARM64 development** - Learning ARM64 real-time programming
- **Single-board computers** - SBC real-time applications
- **Educational projects** - Learning real-time concepts
- **Prototype development** - Rapid real-time system prototyping
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **PREEMPT_RT Understanding** - You understand what PREEMPT_RT is and its benefits
2. **Preemption Models** - You know the different kernel preemption models
3. **Threaded Interrupts** - You understand how threaded interrupts work
4. **Priority Inheritance** - You know how priority inheritance prevents priority inversion
5. **Rock 5B+ Configuration** - You understand ARM64 specific PREEMPT_RT configuration

**Why** these concepts matter:

- **Real-time foundation** provides the basis for real-time Linux development
- **System understanding** helps in designing real-time applications
- **Performance awareness** enables optimization of real-time systems
- **Platform knowledge** enables effective Rock 5B+ development
- **Professional skills** prepare you for embedded real-time development

**When** to use these concepts:

- **System design** - Apply PREEMPT_RT principles when designing real-time systems
- **Performance analysis** - Use preemption models to evaluate systems
- **Optimization** - Apply threaded interrupts to improve performance
- **Development** - Use priority inheritance when writing real-time applications
- **Embedded development** - Apply Rock 5B+ knowledge for ARM64 development

**Where** these skills apply:

- **Real-time systems** - Understanding the target platform for real-time applications
- **Embedded development** - Applying PREEMPT_RT concepts to embedded systems
- **Industrial automation** - Using real-time systems in industrial applications
- **Professional development** - Working in real-time and embedded systems
- **Rock 5B+** - Specific platform real-time development

## Next Steps

**What** you're ready for next:

After mastering PREEMPT_RT, you should be ready to:

1. **Learn latency optimization** - Understand how to optimize real-time performance
2. **Study scheduling** - Learn real-time scheduling policies
3. **Explore performance** - Understand real-time performance analysis
4. **Begin applications** - Start developing real-time applications
5. **Understand optimization** - Learn real-time optimization techniques

**Where** to go next:

Continue with the next lesson on **"Latency Optimization"** to learn:

- How to identify and reduce kernel latency sources
- Optimization techniques for real-time systems
- Real-time kernel tuning and configuration
- Performance measurement and analysis

**Why** the next lesson is important:

The next lesson builds directly on your PREEMPT_RT knowledge by focusing on optimizing real-time performance. You'll learn how to identify and reduce latency sources to achieve the best possible real-time performance on your system.

**How** to continue learning:

1. **Study latency optimization** - Read about real-time performance optimization
2. **Experiment with PREEMPT_RT** - Try PREEMPT_RT on Rock 5B+
3. **Read kernel source** - Explore PREEMPT_RT kernel code
4. **Join communities** - Engage with real-time Linux developers
5. **Build projects** - Start with simple real-time applications

## Resources

**Official Documentation**:

- [PREEMPT_RT Documentation](https://wiki.linuxfoundation.org/realtime/) - Comprehensive PREEMPT_RT documentation
- [Real-Time Linux Documentation](https://www.kernel.org/doc/html/latest/scheduler/) - Real-time scheduler documentation
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
