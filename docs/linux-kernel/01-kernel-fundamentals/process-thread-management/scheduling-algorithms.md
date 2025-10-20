---
sidebar_position: 2
---

# Scheduling Algorithms

Master the Linux kernel scheduling algorithms and policies, understanding how the kernel decides which process runs on the CPU and for how long, with specific focus on real-time scheduling and Rock 5B+ optimization.

## What are Scheduling Algorithms?

**What**: Scheduling algorithms are the mechanisms by which the Linux kernel decides which process or thread should run on the CPU at any given time, determining the order and duration of CPU execution.

**Why**: Understanding scheduling algorithms is crucial because:

- **System Performance**: Determines overall system responsiveness and efficiency
- **Fairness**: Ensures all processes get fair access to CPU resources
- **Real-time Support**: Enables time-critical applications to meet deadlines
- **Multitasking**: Allows multiple processes to run simultaneously
- **Resource Management**: Optimizes CPU utilization across all processes
- **Embedded Systems**: Critical for Rock 5B+ real-time applications

**When**: Scheduling algorithms are active when:

- **Process Creation**: When new processes are created and need CPU time
- **Time Slices**: When a process's time slice expires
- **Priority Changes**: When process priorities are modified
- **System Calls**: When processes make blocking system calls
- **Interrupts**: When hardware interrupts occur
- **Context Switches**: When switching between processes

**How**: Scheduling algorithms work through:

```c
// Example: Linux scheduler structure
// Task structure (simplified)
struct task_struct {
    volatile long state;        // Process state
    int prio;                   // Static priority
    int static_prio;            // Static priority
    int normal_prio;            // Normal priority
    unsigned int rt_priority;   // Real-time priority
    struct sched_class *sched_class; // Scheduler class
    struct sched_entity se;     // CFS scheduling entity
    struct sched_rt_entity rt;  // Real-time scheduling entity
    // ... many more fields
};

// Scheduler class interface
struct sched_class {
    const struct sched_class *next;
    
    void (*enqueue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*dequeue_task) (struct rq *rq, struct task_struct *p, int flags);
    void (*yield_task)   (struct rq *rq);
    bool (*yield_to_task)(struct rq *rq, struct task_struct *p, bool preempt);
    
    void (*check_preempt_curr)(struct rq *rq, struct task_struct *p, int flags);
    
    struct task_struct *(*pick_next_task)(struct rq *rq, struct task_struct *prev);
    void (*put_prev_task)(struct rq *rq, struct task_struct *p);
    
    void (*set_curr_task)(struct rq *rq);
    void (*task_tick)(struct rq *rq, struct task_struct *p, int queued);
    // ... more methods
};

// Run queue structure
struct rq {
    raw_spinlock_t lock;
    unsigned int nr_running;
    unsigned long calc_load_active;
    unsigned long calc_load_update;
    struct cfs_rq cfs;
    struct rt_rq rt;
    struct dl_rq dl;
    // ... more fields
};
```

**Where**: Scheduling algorithms are fundamental in:

- **All Linux systems**: Desktop, server, and embedded
- **Multi-core systems**: SMP and NUMA architectures
- **Real-time systems**: Industrial control and automation
- **Embedded systems**: IoT devices and controllers
- **Rock 5B+**: ARM64 multi-core scheduling

## CFS (Completely Fair Scheduler)

**What**: CFS is the default scheduler for normal (non-real-time) processes in Linux, designed to provide fair CPU time allocation based on process priorities and load.

**Why**: CFS is important because:

- **Fairness**: Ensures all processes get fair CPU time
- **Efficiency**: Optimizes CPU utilization
- **Scalability**: Works well with many processes
- **Interactive Performance**: Provides good responsiveness
- **Load Balancing**: Distributes load across multiple CPUs

**How**: CFS works through:

```c
// Example: CFS implementation
// CFS run queue
struct cfs_rq {
    struct load_weight load;
    unsigned int nr_running;
    u64 min_vruntime;
    struct rb_root tasks_timeline;
    struct rb_node *rb_leftmost;
    struct sched_entity *curr;
    struct sched_entity *next;
    struct sched_entity *last;
    // ... more fields
};

// CFS scheduling entity
struct sched_entity {
    struct load_weight load;
    struct rb_node run_node;
    struct list_head group_node;
    unsigned int on_rq;
    u64 exec_start;
    u64 sum_exec_runtime;
    u64 vruntime;
    u64 prev_sum_exec_runtime;
    u64 nr_migrations;
    // ... more fields
};

// CFS enqueue task
static void enqueue_task_fair(struct rq *rq, struct task_struct *p, int flags)
{
    struct cfs_rq *cfs_rq;
    struct sched_entity *se = &p->se;
    
    cfs_rq = cfs_rq_of(se);
    enqueue_entity(cfs_rq, se, flags);
    
    if (!curr)
        resched_curr(rq);
}

// CFS pick next task
static struct task_struct *pick_next_task_fair(struct rq *rq, struct task_struct *prev)
{
    struct cfs_rq *cfs_rq = &rq->cfs;
    struct sched_entity *se;
    struct task_struct *p;
    
    if (!cfs_rq->nr_running)
        return NULL;
    
    se = pick_next_entity(cfs_rq);
    p = task_of(se);
    
    return p;
}

// CFS task tick
static void task_tick_fair(struct rq *rq, struct task_struct *curr, int queued)
{
    struct cfs_rq *cfs_rq;
    struct sched_entity *se = &curr->se;
    
    cfs_rq = cfs_rq_of(se);
    entity_tick(cfs_rq, se, queued);
}
```

**Explanation**:

- **Virtual runtime**: Tracks how much CPU time each process has used
- **Red-black tree**: Maintains processes in order of virtual runtime
- **Load weight**: Determines how much CPU time a process should get
- **Time slice**: Calculated based on process priority and load
- **Preemption**: Higher priority processes can preempt lower priority ones

**Where**: CFS is used in:

- **Desktop systems**: Interactive applications and user programs
- **Server systems**: Background processes and services
- **Embedded systems**: General-purpose applications
- **Multi-core systems**: Load balancing across CPUs
- **Rock 5B+**: Default scheduler for normal processes

## Real-Time Scheduling Policies

**What**: Real-time scheduling policies provide deterministic and predictable CPU allocation for time-critical applications that must meet strict timing requirements.

**Why**: Real-time scheduling is crucial because:

- **Deadline Guarantees**: Ensures processes meet their deadlines
- **Deterministic Behavior**: Provides predictable system behavior
- **Priority Inversion**: Prevents low-priority processes from blocking high-priority ones
- **Real-time Applications**: Essential for industrial control and automation
- **Embedded Systems**: Critical for Rock 5B+ real-time applications

**How**: Real-time scheduling works through:

```c
// Example: Real-time scheduling implementation
// Real-time run queue
struct rt_rq {
    struct rt_prio_array active;
    unsigned int rt_nr_running;
    unsigned int rt_nr_migratory;
    int rt_overloaded;
    struct plist_head pushable_tasks;
    // ... more fields
};

// Real-time priority array
struct rt_prio_array {
    DECLARE_BITMAP(bitmap, MAX_RT_PRIO+1);
    struct list_head queue[MAX_RT_PRIO];
};

// Real-time scheduling entity
struct sched_rt_entity {
    struct list_head run_list;
    unsigned long timeout;
    unsigned long watchdog_stamp;
    unsigned int time_slice;
    unsigned short on_rq;
    unsigned short on_list;
    struct sched_rt_entity *back;
    // ... more fields
};

// Real-time enqueue task
static void enqueue_task_rt(struct rq *rq, struct task_struct *p, int flags)
{
    struct sched_rt_entity *rt_se = &p->rt;
    
    if (flags & ENQUEUE_HEAD)
        list_add(&rt_se->run_list, &rq->rt.queue);
    else
        list_add_tail(&rt_se->run_list, &rq->rt.queue);
    
    __enqueue_rt_entity(rt_se);
    inc_nr_running(rq);
}

// Real-time pick next task
static struct task_struct *pick_next_task_rt(struct rq *rq, struct task_struct *prev)
{
    struct sched_rt_entity *rt_se;
    struct task_struct *p;
    struct rt_rq *rt_rq = &rq->rt;
    
    if (!rt_rq->rt_nr_running)
        return NULL;
    
    rt_se = pick_next_rt_entity(rt_rq);
    p = rt_task_of(rt_se);
    
    return p;
}

// Real-time task tick
static void task_tick_rt(struct rq *rq, struct task_struct *p, int queued)
{
    struct sched_rt_entity *rt_se = &p->rt;
    
    if (p->policy != SCHED_RR)
        return;
    
    if (--p->rt.time_slice)
        return;
    
    p->rt.time_slice = sched_rr_timeslice;
    
    if (p->rt.run_list.prev != p->rt.run_list.next) {
        requeue_task_rt(rq, p, 0);
        resched_curr(rq);
    }
}
```

**Explanation**:

- **SCHED_FIFO**: First-in-first-out real-time scheduling
- **SCHED_RR**: Round-robin real-time scheduling
- **SCHED_DEADLINE**: Deadline-based scheduling
- **Priority queues**: Processes are queued by priority
- **Preemption**: Higher priority processes always preempt lower priority ones

**Where**: Real-time scheduling is used in:

- **Industrial control**: Factory automation and robotics
- **Audio/video processing**: Real-time media applications
- **Automotive systems**: Engine control and safety systems
- **Medical devices**: Patient monitoring and life support
- **Rock 5B+**: Real-time embedded applications

## Load Balancing and CPU Affinity

**What**: Load balancing distributes processes across multiple CPUs to optimize performance, while CPU affinity allows processes to be bound to specific CPUs.

**Why**: Understanding load balancing is important because:

- **Performance**: Maximizes CPU utilization across all cores
- **Scalability**: Enables efficient use of multi-core systems
- **Cache Efficiency**: Improves cache hit rates
- **NUMA Optimization**: Optimizes memory access in NUMA systems
- **Real-time Performance**: Ensures real-time processes get dedicated CPUs

**How**: Load balancing works through:

```c
// Example: Load balancing implementation
// CPU topology
struct sched_domain {
    struct sched_domain *parent;
    struct sched_domain *child;
    struct sched_group *groups;
    unsigned long min_interval;
    unsigned long max_interval;
    unsigned int busy_factor;
    unsigned int imbalance_pct;
    unsigned int cache_nice_tries;
    unsigned int busy_idx;
    unsigned int idle_idx;
    unsigned int newidle_idx;
    unsigned int wake_idx;
    unsigned int forkexec_idx;
    unsigned int smt_gain;
    int flags;
    int level;
    unsigned int last_balance;
    unsigned int balance_interval;
    unsigned int nr_balance_failed;
    // ... more fields
};

// Load balancing functions
static int load_balance(int this_cpu, struct rq *this_rq,
                       struct sched_domain *sd, enum cpu_idle_type idle,
                       int *balance)
{
    int ld_moved, cur_ld_moved, active_balance = 0;
    struct sched_group *group;
    struct rq *busiest;
    unsigned long flags;
    
    *balance = 0;
    
    if (sd->flags & SD_LOAD_BALANCE) {
        group = find_busiest_group(sd, this_cpu, &imbalance, idle,
                                  &cpus, &balance);
        if (group) {
            busiest = find_busiest_queue(group, this_cpu, imbalance,
                                       &cpus);
            if (busiest) {
                ld_moved = move_tasks(this_rq, this_cpu, busiest,
                                    imbalance, sd, idle, &all_pinned);
                if (ld_moved > 0) {
                    *balance = 1;
                    return ld_moved;
                }
            }
        }
    }
    
    return 0;
}

// CPU affinity functions
static int set_cpus_allowed_ptr(struct task_struct *p,
                               const struct cpumask *new_mask)
{
    struct rq *rq = task_rq(p);
    int ret = 0;
    
    if (cpumask_equal(&p->cpus_allowed, new_mask))
        return 0;
    
    if (!cpumask_intersects(new_mask, cpu_active_mask))
        return -EINVAL;
    
    do_set_cpus_allowed(p, new_mask);
    
    if (cpumask_intersects(&p->cpus_allowed, cpu_active_mask)) {
        if (p->sched_class->set_cpus_allowed)
            p->sched_class->set_cpus_allowed(p, new_mask);
        p->nr_cpus_allowed = cpumask_weight(&p->cpus_allowed);
    } else {
        p->nr_cpus_allowed = 0;
    }
    
    return ret;
}
```

**Explanation**:

- **Load balancing**: Distributes processes across CPUs
- **CPU affinity**: Binds processes to specific CPUs
- **Scheduling domains**: Hierarchical CPU organization
- **Migration**: Moving processes between CPUs
- **NUMA awareness**: Optimizing for NUMA architectures

**Where**: Load balancing is important in:

- **Multi-core systems**: SMP and NUMA architectures
- **Server systems**: High-performance computing
- **Embedded systems**: Multi-core ARM64 systems
- **Real-time systems**: Dedicated CPU allocation
- **Rock 5B+**: ARM64 multi-core optimization

## Context Switching

**What**: Context switching is the process of saving the state of one process and restoring the state of another process when switching between them.

**Why**: Understanding context switching is crucial because:

- **Multitasking**: Enables multiple processes to run simultaneously
- **Performance**: Context switch overhead affects system performance
- **Real-time Systems**: Context switch latency affects real-time performance
- **Debugging**: Essential for understanding process behavior
- **Optimization**: Minimizing context switch overhead improves performance

**How**: Context switching works through:

```c
// Example: Context switching implementation
// Process state
#define TASK_RUNNING        0
#define TASK_INTERRUPTIBLE  1
#define TASK_UNINTERRUPTIBLE 2
#define TASK_STOPPED        4
#define TASK_TRACED         8
#define TASK_DEAD           16
#define TASK_WAKEKILL       32
#define TASK_WAKING         64
#define TASK_PARKED         128
#define TASK_NOLOAD         256
#define TASK_NEW            512
#define TASK_STATE_MAX      1024

// Context switch function
static __always_inline struct task_struct *
context_switch(struct rq *rq, struct task_struct *prev,
               struct task_struct *next, struct rq_flags *rf)
{
    struct mm_struct *mm, *oldmm;
    
    prepare_task_switch(rq, prev, next);
    
    mm = next->mm;
    oldmm = prev->active_mm;
    
    if (!mm) {
        next->active_mm = oldmm;
        atomic_inc(&oldmm->mm_count);
        enter_lazy_tlb(oldmm, next);
    } else
        switch_mm_irqs_off(oldmm, mm, next);
    
    if (!prev->mm) {
        prev->active_mm = NULL;
        rq->prev_mm = oldmm;
    }
    
    rq->clock_update_flags &= ~(RQCF_ACT_SKIP|RQCF_REQ_SKIP);
    
    prepare_lock_switch(rq, next, rf);
    
    switch_to(prev, next, prev);
    barrier();
    
    return finish_task_switch(prev);
}

// Switch to function
#define switch_to(prev, next, last)                    \
do {                                                    \
    ((last) = __switch_to((prev), (next)));            \
} while (0)

// Architecture-specific switch
static inline struct task_struct *__switch_to(struct task_struct *prev,
                                             struct task_struct *next)
{
    struct task_struct *last;
    
    fpsimd_thread_switch(next);
    tls_thread_switch(next);
    hw_breakpoint_thread_switch(next);
    contextidr_thread_switch(next);
    entry_task_switch(next);
    uao_thread_switch(next);
    ptrauth_thread_switch(next);
    
    last = cpu_switch_to(prev, next);
    
    return last;
}
```

**Explanation**:

- **State saving**: Save current process state to memory
- **State restoration**: Restore next process state from memory
- **Memory management**: Switch memory context
- **Register saving**: Save/restore CPU registers
- **Performance**: Minimize context switch overhead

**Where**: Context switching is fundamental in:

- **All multitasking systems**: Desktop, server, and embedded
- **Real-time systems**: Where latency is critical
- **Multi-core systems**: Inter-core process migration
- **Embedded systems**: Resource-constrained devices
- **Rock 5B+**: ARM64 multi-core context switching

## Rock 5B+ Specific Considerations

**What**: The Rock 5B+ presents specific considerations for scheduling due to its ARM64 architecture, multi-core design, and embedded nature.

**Why**: Understanding Rock 5B+ specifics is important because:

- **ARM64 Architecture**: Different from x86_64 scheduling
- **Multi-core Design**: 8-core ARM64 processor
- **Embedded Platform**: Optimized for embedded applications
- **Real-time Support**: PREEMPT_RT patch support
- **Performance Optimization**: ARM64 specific optimizations

**How**: Rock 5B+ scheduling involves:

```c
// Example: Rock 5B+ specific scheduling
// ARM64 CPU topology
static const struct cpu_topology arm64_topology[] = {
    { cpu_part(0x0), cpu_part(0x0), cpu_part(0x0), cpu_part(0x0) },
    { cpu_part(0x1), cpu_part(0x1), cpu_part(0x1), cpu_part(0x1) },
    { cpu_part(0x2), cpu_part(0x2), cpu_part(0x2), cpu_part(0x2) },
    { cpu_part(0x3), cpu_part(0x3), cpu_part(0x3), cpu_part(0x3) },
    { cpu_part(0x4), cpu_part(0x4), cpu_part(0x4), cpu_part(0x4) },
    { cpu_part(0x5), cpu_part(0x5), cpu_part(0x5), cpu_part(0x5) },
    { cpu_part(0x6), cpu_part(0x6), cpu_part(0x6), cpu_part(0x6) },
    { cpu_part(0x7), cpu_part(0x7), cpu_part(0x7), cpu_part(0x7) },
};

// ARM64 specific scheduling
static inline void arch_switch_to(struct task_struct *prev,
                                 struct task_struct *next)
{
    fpsimd_thread_switch(next);
    tls_thread_switch(next);
    hw_breakpoint_thread_switch(next);
    contextidr_thread_switch(next);
    entry_task_switch(next);
    uao_thread_switch(next);
    ptrauth_thread_switch(next);
}

// Rock 5B+ CPU frequency scaling
static struct cpufreq_driver rockchip_cpufreq_driver = {
    .name = "rockchip-cpufreq",
    .flags = CPUFREQ_STICKY | CPUFREQ_NEED_INITIAL_FREQ_CHECK,
    .init = rockchip_cpufreq_init,
    .exit = rockchip_cpufreq_exit,
    .verify = cpufreq_generic_frequency_table_verify,
    .target_index = rockchip_cpufreq_target,
    .get = rockchip_cpufreq_get_speed,
    .attr = cpufreq_generic_attr,
    .suspend = rockchip_cpufreq_suspend,
    .resume = rockchip_cpufreq_resume,
};

// Real-time configuration for Rock 5B+
CONFIG_PREEMPT_RT=y
CONFIG_HIGH_RES_TIMERS=y
CONFIG_NO_HZ_FULL=y
CONFIG_RCU_NOCB_CPU=y
CONFIG_IRQ_FORCED_THREADING=y
CONFIG_PREEMPT_RT_BASE=y
CONFIG_PREEMPT_RT_FULL=y
```

**Explanation**:

- **CPU topology**: 8-core ARM64 processor configuration
- **Architecture-specific**: ARM64 specific scheduling optimizations
- **Frequency scaling**: Dynamic CPU frequency adjustment
- **Real-time support**: PREEMPT_RT patch configuration
- **Embedded optimization**: Optimized for embedded applications

**Where**: Rock 5B+ specifics are important in:

- **Embedded Linux development**: Learning practical embedded development
- **ARM64 systems**: Understanding ARM64 scheduling
- **Real-time applications**: Real-time Linux on ARM64
- **Multi-core systems**: Multi-core ARM64 optimization
- **Rock 5B+**: Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Scheduling Understanding**: You understand Linux scheduling algorithms
2. **CFS Knowledge**: You know how the Completely Fair Scheduler works
3. **Real-time Awareness**: You understand real-time scheduling policies
4. **Load Balancing**: You know how load balancing works
5. **Context Switching**: You understand context switch mechanisms
6. **Platform Specifics**: You know Rock 5B+ specific considerations

**Why** these concepts matter:

- **System Performance**: Essential for understanding system behavior
- **Real-time Development**: Critical for real-time applications
- **Multi-core Systems**: Important for multi-core optimization
- **Embedded Systems**: Essential for embedded Linux development
- **Professional Skills**: Industry-standard systems programming

**When** to use these concepts:

- **System Design**: When designing real-time systems
- **Performance Tuning**: When optimizing system performance
- **Debugging**: When troubleshooting scheduling issues
- **Development**: When writing kernel code
- **Embedded Development**: When developing for Rock 5B+

**Where** these skills apply:

- **Kernel Development**: Understanding scheduling internals
- **Real-time Systems**: Developing time-critical applications
- **Embedded Linux**: Applying scheduling concepts to embedded systems
- **System Administration**: Optimizing system performance
- **Professional Development**: Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering scheduling algorithms, you should be ready to:

1. **Learn Context Switching**: Understand the detailed context switch process
2. **Study Memory Management**: Learn virtual memory and allocation
3. **Explore System Calls**: Understand the user-kernel interface
4. **Begin Practical Development**: Start working with kernel modules
5. **Understand Interrupts**: Learn interrupt handling and exceptions

**Where** to go next:

Continue with the next lesson on **"Context Switching"** to learn:

- Detailed context switch mechanism
- Thread switching vs process switching
- Performance implications
- ARM64 specific context switching

**Why** the next lesson is important:

The next lesson builds directly on your scheduling knowledge by diving deep into the context switching mechanism. You'll learn how the kernel actually switches between processes and the performance implications.

**How** to continue learning:

1. **Study Context Switching**: Read kernel context switching code
2. **Experiment with Processes**: Create and monitor processes on Rock 5B+
3. **Read Documentation**: Study context switching documentation
4. **Join Communities**: Engage with kernel developers
5. **Build Projects**: Start with simple process management experiments

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Scheduler Documentation](https://www.kernel.org/doc/html/latest/scheduler/) - Scheduler documentation
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64-specific documentation

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook
- [Understanding the Linux Kernel by Bovet and Cesati](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Detailed kernel internals
- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [PREEMPT_RT Documentation](https://www.kernel.org/doc/html/latest/scheduler/) - Real-time Linux documentation

Happy learning! 🐧
