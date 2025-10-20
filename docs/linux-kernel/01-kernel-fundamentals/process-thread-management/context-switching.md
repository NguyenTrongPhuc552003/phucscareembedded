---
sidebar_position: 3
---

# Context Switching

Master the Linux kernel context switching mechanism, understanding how the kernel saves and restores process state when switching between processes, with specific focus on ARM64 architecture and Rock 5B+ optimization.

## What is Context Switching?

**What**: Context switching is the process by which the Linux kernel saves the current state of a running process and restores the previously saved state of another process, allowing multiple processes to share the CPU.

**Why**: Understanding context switching is crucial because:

- **Multitasking Foundation**: Enables multiple processes to run simultaneously
- **Performance Impact**: Context switch overhead affects system performance
- **Real-time Systems**: Context switch latency affects real-time performance
- **Debugging**: Essential for understanding process behavior and timing
- **Optimization**: Minimizing context switch overhead improves performance
- **Embedded Systems**: Critical for Rock 5B+ real-time applications

**When**: Context switching occurs when:

- **Time Slice Expiry**: When a process's allocated CPU time expires
- **Higher Priority Process**: When a higher priority process becomes ready
- **System Call**: When a process makes a blocking system call
- **Interrupt**: When a hardware interrupt requires immediate attention
- **Process Yielding**: When a process voluntarily yields the CPU
- **Preemption**: When the kernel preempts a running process

**How**: Context switching works through:

```c
// Example: Context switching mechanism
// Process state definitions
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

// Main context switch function
static __always_inline struct task_struct *
context_switch(struct rq *rq, struct task_struct *prev,
               struct task_struct *next, struct rq_flags *rf)
{
    struct mm_struct *mm, *oldmm;

    // Prepare for context switch
    prepare_task_switch(rq, prev, next);

    // Get memory context
    mm = next->mm;
    oldmm = prev->active_mm;

    // Handle memory context switch
    if (!mm) {
        next->active_mm = oldmm;
        atomic_inc(&oldmm->mm_count);
        enter_lazy_tlb(oldmm, next);
    } else
        switch_mm_irqs_off(oldmm, mm, next);

    // Clean up previous process memory context
    if (!prev->mm) {
        prev->active_mm = NULL;
        rq->prev_mm = oldmm;
    }

    // Update run queue
    rq->clock_update_flags &= ~(RQCF_ACT_SKIP|RQCF_REQ_SKIP);

    // Prepare lock switch
    prepare_lock_switch(rq, next, rf);

    // Perform the actual context switch
    switch_to(prev, next, prev);
    barrier();

    // Finish context switch
    return finish_task_switch(prev);
}

// Architecture-specific switch
#define switch_to(prev, next, last)                    \
do {                                                    \
    ((last) = __switch_to((prev), (next)));            \
} while (0)
```

**Where**: Context switching is fundamental in:

- **All multitasking systems**: Desktop, server, and embedded
- **Real-time systems**: Where timing is critical
- **Multi-core systems**: Inter-core process migration
- **Embedded systems**: Resource-constrained devices
- **Rock 5B+**: ARM64 multi-core context switching

## Process State Management

**What**: Process state management involves tracking and transitioning between different process states during context switching.

**Why**: Understanding process state management is important because:

- **State Transitions**: Processes move between different states
- **Resource Management**: Different states have different resource requirements
- **Scheduling**: State determines if a process can be scheduled
- **Debugging**: State information helps debug process issues
- **Performance**: State transitions affect system performance

**How**: Process state management works through:

```c
// Example: Process state management
// Process state transitions
static void __set_task_state(struct task_struct *tsk, int state)
{
    WRITE_ONCE(tsk->state, state);
}

// Set task state with memory barrier
static void set_task_state(struct task_struct *tsk, int state)
{
    smp_store_mb(tsk->state, state);
}

// Set current task state
void set_current_state(int state)
{
    smp_store_mb(current->state, state);
}

// Process state checking
static inline int task_is_running(struct task_struct *p)
{
    return p->state == TASK_RUNNING;
}

static inline int task_is_stopped(struct task_struct *p)
{
    return p->state == TASK_STOPPED;
}

static inline int task_is_traced(struct task_struct *p)
{
    return p->state == TASK_TRACED;
}

// Process state transitions
void __wake_up_process(struct task_struct *p)
{
    WARN_ON(task_is_stopped_or_traced(p));
    wake_up_state(p, TASK_WAKING);
}

void wake_up_process(struct task_struct *p)
{
    WARN_ON(task_is_stopped_or_traced(p));
    wake_up_state(p, TASK_WAKING);
}

// Process blocking
void __sched schedule(void)
{
    struct task_struct *tsk = current;

    sched_submit_work(tsk);
    do {
        preempt_disable();
        __schedule(false);
        sched_preempt_enable_no_resched();
    } while (need_resched());
    sched_update_worker(tsk);
}
```

**Explanation**:

- **State definitions**: Different process states and their meanings
- **State transitions**: How processes move between states
- **Memory barriers**: Ensuring proper memory ordering
- **Scheduling**: How state affects process scheduling
- **Blocking**: How processes block and unblock

**Where**: Process state management is used in:

- **Process scheduling**: Determining which processes can run
- **System calls**: Blocking and unblocking processes
- **Interrupt handling**: Managing process state during interrupts
- **Debugging**: Understanding process behavior
- **Performance monitoring**: Tracking process state changes

## Thread vs Process Switching

**What**: Thread switching involves switching between threads within the same process, while process switching involves switching between different processes with different memory spaces.

**Why**: Understanding the difference is important because:

- **Performance**: Thread switching is faster than process switching
- **Memory Management**: Different memory context handling
- **Resource Sharing**: Threads share resources, processes don't
- **Scheduling**: Different scheduling considerations
- **Debugging**: Different debugging approaches

**How**: Thread vs process switching works through:

```c
// Example: Thread vs process switching
// Thread switching (same process)
static inline void switch_to_thread(struct task_struct *prev,
                                   struct task_struct *next)
{
    // Save thread-specific state
    save_thread_state(prev);

    // Restore thread-specific state
    restore_thread_state(next);

    // Switch stack pointer
    switch_stack(prev, next);
}

// Process switching (different processes)
static inline void switch_to_process(struct task_struct *prev,
                                    struct task_struct *next)
{
    // Save process state
    save_process_state(prev);

    // Switch memory context
    switch_mm(prev->mm, next->mm, next);

    // Restore process state
    restore_process_state(next);

    // Switch stack pointer
    switch_stack(prev, next);
}

// Thread creation
static int copy_thread(unsigned long clone_flags, unsigned long stack_start,
                      unsigned long stack_size, struct task_struct *p,
                      unsigned long tls)
{
    struct pt_regs *childregs = task_pt_regs(p);

    if (unlikely(p->flags & PF_KTHREAD)) {
        // Kernel thread
        memset(childregs, 0, sizeof(struct pt_regs));
        childregs->pstate = PSR_MODE_EL1h;
        childregs->pc = (unsigned long)ret_from_fork;
        childregs->regs[0] = stack_start;
        childregs->regs[1] = stack_size;
        return 0;
    }

    // User thread
    *childregs = *current_pt_regs();
    childregs->regs[0] = 0;
    childregs->regs[1] = 0;
    childregs->regs[2] = 0;
    childregs->regs[3] = 0;
    childregs->regs[4] = 0;
    childregs->regs[5] = 0;
    childregs->regs[6] = 0;
    childregs->regs[7] = 0;
    childregs->regs[8] = 0;
    childregs->regs[9] = 0;
    childregs->regs[10] = 0;
    childregs->regs[11] = 0;
    childregs->regs[12] = 0;
    childregs->regs[13] = 0;
    childregs->regs[14] = 0;
    childregs->regs[15] = 0;
    childregs->regs[16] = 0;
    childregs->regs[17] = 0;
    childregs->regs[18] = 0;
    childregs->regs[19] = 0;
    childregs->regs[20] = 0;
    childregs->regs[21] = 0;
    childregs->regs[22] = 0;
    childregs->regs[23] = 0;
    childregs->regs[24] = 0;
    childregs->regs[25] = 0;
    childregs->regs[26] = 0;
    childregs->regs[27] = 0;
    childregs->regs[28] = 0;
    childregs->regs[29] = 0;
    childregs->regs[30] = 0;
    childregs->regs[31] = 0;
    childregs->sp = stack_start;
    childregs->pc = (unsigned long)ret_from_fork;

    return 0;
}
```

**Explanation**:

- **Thread switching**: Faster, same memory space
- **Process switching**: Slower, different memory spaces
- **Memory context**: Different memory management
- **Resource sharing**: Threads share, processes don't
- **Stack management**: Different stack handling

**Where**: Thread vs process switching is important in:

- **Multi-threaded applications**: Thread switching optimization
- **Process management**: Understanding process behavior
- **Performance tuning**: Optimizing context switch performance
- **Real-time systems**: Minimizing context switch latency
- **Embedded systems**: Resource-constrained optimization

## Performance Implications

**What**: Context switching has significant performance implications that affect overall system performance and responsiveness.

**Why**: Understanding performance implications is crucial because:

- **System Performance**: Context switch overhead affects overall performance
- **Real-time Systems**: Latency affects real-time performance
- **Optimization**: Understanding bottlenecks for optimization
- **Resource Planning**: Planning system resources
- **Debugging**: Identifying performance issues

**How**: Performance implications are measured through:

```c
// Example: Context switch performance measurement
// Context switch timing
static inline void context_switch_timing_start(void)
{
    // Record start time
    current->context_switch_start = ktime_get_ns();
}

static inline void context_switch_timing_end(void)
{
    // Record end time
    current->context_switch_end = ktime_get_ns();

    // Calculate duration
    current->context_switch_duration =
        current->context_switch_end - current->context_switch_start;
}

// Context switch statistics
struct context_switch_stats {
    unsigned long total_switches;
    unsigned long total_time;
    unsigned long min_time;
    unsigned long max_time;
    unsigned long avg_time;
};

// Performance optimization
static inline void optimize_context_switch(struct task_struct *prev,
                                          struct task_struct *next)
{
    // Minimize memory context switches
    if (prev->mm == next->mm) {
        // Same memory context, faster switch
        return;
    }

    // Optimize for different memory contexts
    if (prev->mm && next->mm) {
        // Both have memory contexts
        switch_mm_irqs_off(prev->mm, next->mm, next);
    } else if (prev->mm && !next->mm) {
        // Previous has memory context, next doesn't
        next->active_mm = prev->mm;
        atomic_inc(&prev->mm->mm_count);
        enter_lazy_tlb(prev->mm, next);
    } else if (!prev->mm && next->mm) {
        // Previous doesn't have memory context, next does
        switch_mm_irqs_off(NULL, next->mm, next);
    }
}

// Cache optimization
static inline void optimize_cache_context_switch(struct task_struct *prev,
                                                struct task_struct *next)
{
    // Flush TLB if necessary
    if (prev->mm != next->mm) {
        flush_tlb_mm(prev->mm);
    }

    // Optimize cache usage
    if (prev->mm == next->mm) {
        // Same memory context, preserve cache
        return;
    }

    // Different memory contexts, flush cache
    flush_cache_all();
}
```

**Explanation**:

- **Timing measurement**: Measuring context switch duration
- **Statistics collection**: Tracking context switch performance
- **Optimization techniques**: Minimizing context switch overhead
- **Cache management**: Optimizing cache usage
- **Memory management**: Optimizing memory context switches

**Where**: Performance implications are important in:

- **Real-time systems**: Where latency is critical
- **High-performance systems**: Where throughput is important
- **Embedded systems**: Where resources are limited
- **Multi-core systems**: Where context switching is frequent
- **Rock 5B+**: ARM64 performance optimization

## ARM64 Specific Context Switching

**What**: ARM64 architecture presents specific considerations for context switching on the Rock 5B+ platform.

**Why**: Understanding ARM64 specifics is important because:

- **Architecture Differences**: Different from x86_64 context switching
- **Register Management**: ARM64 specific register handling
- **Memory Management**: ARM64 specific memory context switching
- **Performance**: ARM64 specific optimizations
- **Embedded Systems**: Critical for Rock 5B+ development

**How**: ARM64 context switching works through:

```c
// Example: ARM64 specific context switching
// ARM64 process state
struct pt_regs {
    union {
        struct user_pt_regs user_regs;
        struct {
            u64 regs[31];
            u64 sp;
            u64 pc;
            u64 pstate;
        };
    };
    u64 orig_x0;
    u64 syscallno;
    u64 orig_addr_limit;
    u64 unused;
    u64 stackframe[2];
};

// ARM64 context switch
static inline struct task_struct *__switch_to(struct task_struct *prev,
                                             struct task_struct *next)
{
    struct task_struct *last;

    // Save/restore floating point state
    fpsimd_thread_switch(next);

    // Save/restore TLS
    tls_thread_switch(next);

    // Save/restore hardware breakpoints
    hw_breakpoint_thread_switch(next);

    // Save/restore context ID
    contextidr_thread_switch(next);

    // Save/restore entry task
    entry_task_switch(next);

    // Save/restore UAO
    uao_thread_switch(next);

    // Save/restore pointer authentication
    ptrauth_thread_switch(next);

    // Perform architecture-specific switch
    last = cpu_switch_to(prev, next);

    return last;
}

// ARM64 CPU switch
ENTRY(cpu_switch_to)
    mov x10, #THREAD_CPU_CONTEXT
    add x8, x0, x10
    mov x9, sp
    stp x19, x20, [x8], #16
    stp x21, x22, [x8], #16
    stp x23, x24, [x8], #16
    stp x25, x26, [x8], #16
    stp x27, x28, [x8], #16
    stp x29, x9, [x8], #16
    str lr, [x8]

    add x8, x1, x10
    ldp x19, x20, [x8], #16
    ldp x21, x22, [x8], #16
    ldp x23, x24, [x8], #16
    ldp x25, x26, [x8], #16
    ldp x27, x28, [x8], #16
    ldp x29, x9, [x8], #16
    ldr lr, [x8]
    mov sp, x9
    msr sp_el0, x1
    ret
ENDPROC(cpu_switch_to)

// ARM64 memory context switch
static inline void switch_mm_irqs_off(struct mm_struct *prev,
                                     struct mm_struct *next,
                                     struct task_struct *tsk)
{
    if (prev != next) {
        __switch_mm(next);
        if (system_supports_cnp())
            cnp_set_ttbr1(next->pgd);
    }

    if (system_supports_cnp())
        cnp_set_ttbr0(tsk->mm->pgd);
}
```

**Explanation**:

- **Register management**: ARM64 specific register handling
- **Floating point**: FPSIMD state management
- **TLS**: Thread-local storage management
- **Hardware breakpoints**: Debug register management
- **Memory management**: ARM64 specific memory context switching

**Where**: ARM64 context switching is important in:

- **ARM64 systems**: All ARM64-based Linux systems
- **Embedded development**: ARM64 embedded systems
- **Mobile devices**: Smartphones and tablets
- **Server systems**: ARM64 servers and workstations
- **Rock 5B+**: ARM64 single-board computer

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Context Switch Understanding**: You understand the context switching mechanism
2. **State Management**: You know how process states are managed
3. **Thread vs Process**: You understand the difference between thread and process switching
4. **Performance Awareness**: You know the performance implications
5. **ARM64 Specifics**: You understand ARM64 specific considerations
6. **Platform Knowledge**: You know Rock 5B+ specific context switching

**Why** these concepts matter:

- **Multitasking Foundation**: Essential for understanding multitasking
- **Performance**: Critical for system performance optimization
- **Real-time Systems**: Important for real-time applications
- **Embedded Systems**: Essential for embedded Linux development
- **Professional Skills**: Industry-standard systems programming

**When** to use these concepts:

- **System Design**: When designing multitasking systems
- **Performance Tuning**: When optimizing system performance
- **Debugging**: When troubleshooting process issues
- **Development**: When writing kernel code
- **Embedded Development**: When developing for Rock 5B+

**Where** these skills apply:

- **Kernel Development**: Understanding context switching internals
- **Real-time Systems**: Developing time-critical applications
- **Embedded Linux**: Applying context switching concepts to embedded systems
- **System Administration**: Optimizing system performance
- **Professional Development**: Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering context switching, you should be ready to:

1. **Learn Memory Management**: Understand virtual memory and allocation
2. **Study System Calls**: Learn the user-kernel interface
3. **Begin Practical Development**: Start working with kernel modules
4. **Understand Interrupts**: Learn interrupt handling and exceptions
5. **Explore Process Management**: Learn advanced process management

**Where** to go next:

Continue with the next lesson on **"Virtual Memory Concepts"** to learn:

- Virtual memory management
- Page allocation and management
- Memory mapping and protection
- ARM64 specific memory management

**Why** the next lesson is important:

The next lesson builds on your context switching knowledge by diving into memory management, which is fundamental to understanding how the kernel manages process memory on the Rock 5B+.

**How** to continue learning:

1. **Study Memory Management**: Read kernel memory management code
2. **Experiment with Memory**: Create and monitor memory usage on Rock 5B+
3. **Read Documentation**: Study memory management documentation
4. **Join Communities**: Engage with kernel developers
5. **Build Projects**: Start with simple memory management experiments

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
- [ARM64 Assembly](https://developer.arm.com/documentation/den0024/latest) - ARM64 assembly reference

Happy learning! 🐧
