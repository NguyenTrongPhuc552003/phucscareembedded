---
sidebar_position: 1
---

# Deadlock Detection

Master deadlock detection techniques in the Linux kernel, understanding how to identify and prevent deadlock conditions on the Rock 5B+ platform.

## What is Deadlock Detection?

**What**: Deadlock detection involves identifying situations where two or more threads are blocked waiting for each other to release resources, creating a circular dependency that prevents progress.

**Why**: Understanding deadlock detection is crucial because:

- **System stability** - Deadlocks can hang the entire system
- **Resource management** - Preventing resource deadlocks
- **Lock ordering** - Enforcing correct lock acquisition order
- **Early detection** - Finding deadlocks before production
- **Rock 5B+ development** - Multi-core deadlock scenarios
- **Professional development** - Critical for kernel reliability

**When**: Deadlock detection is used when:

- **Multi-threaded code** - Code with multiple locks
- **Complex locking** - Nested or hierarchical locks
- **Development** - Testing and debugging
- **Lock validation** - Verifying lock usage
- **Production systems** - Monitoring for deadlocks
- **ARM64 platforms** - Rock 5B+ multi-core systems

**How**: Deadlock detection works by:

- **Lock dependency tracking** - Recording lock relationships
- **Cycle detection** - Finding circular dependencies
- **Static analysis** - Code analysis for potential deadlocks
- **Runtime validation** - Lockdep framework
- **Wait-for graphs** - Visualizing thread dependencies
- **Timeout detection** - Detecting hung tasks

**Where**: Deadlock detection is found in:

- **Lockdep** - Kernel lock validator
- **Development tools** - Static analysis tools
- **Debugging** - Hung task detection
- **Testing** - Stress testing frameworks
- **Production monitoring** - System health monitoring
- **Rock 5B+** - ARM64 kernel debugging

## Deadlock Conditions

**What**: Deadlocks occur when four necessary conditions are simultaneously present: mutual exclusion, hold and wait, no preemption, and circular wait.

**Why**: Understanding deadlock conditions is important because:

- **Prevention** - Break one condition to prevent deadlock
- **Recognition** - Identify potential deadlock scenarios
- **Design** - Avoid deadlock-prone designs
- **Analysis** - Diagnose existing deadlocks

**How**: Deadlock conditions work through:

```c
// Example: Deadlock conditions and scenarios

// 1. Deadlock scenario: Lock ordering violation
static spinlock_t lock_a;
static spinlock_t lock_b;

// Thread 1
void thread1_function(void) {
    spin_lock(&lock_a);
    // ... some work ...
    spin_lock(&lock_b);  // Acquiring in order: A -> B

    // Critical section

    spin_unlock(&lock_b);
    spin_unlock(&lock_a);
}

// Thread 2 - DEADLOCK POTENTIAL!
void thread2_function_bad(void) {
    spin_lock(&lock_b);  // Different order!
    // ... some work ...
    spin_lock(&lock_a);  // Acquiring in order: B -> A

    // If Thread 1 holds A and waits for B
    // While Thread 2 holds B and waits for A
    // = DEADLOCK!

    spin_unlock(&lock_a);
    spin_unlock(&lock_b);
}

// 2. Correct version: Consistent lock ordering
void thread2_function_good(void) {
    // Always acquire in same order: A -> B
    spin_lock(&lock_a);
    spin_lock(&lock_b);

    // Critical section

    spin_unlock(&lock_b);
    spin_unlock(&lock_a);
}

// 3. Deadlock with three locks
static spinlock_t lock_c;

void three_lock_deadlock(void) {
    // Thread 1: A -> B -> C
    // Thread 2: B -> C -> A
    // Thread 3: C -> A -> B
    // = Circular dependency deadlock
}

// 4. Self-deadlock (recursive locking)
void self_deadlock_bad(void) {
    spin_lock(&lock_a);

    // ... some code that calls ...
    helper_function();  // Which tries to lock_a again

    spin_unlock(&lock_a);
}

void helper_function(void) {
    spin_lock(&lock_a);  // DEADLOCK: Already held!
    // ...
    spin_unlock(&lock_a);
}

// 5. Interrupt deadlock
void interrupt_deadlock_bad(void) {
    spin_lock(&lock_a);

    // If interrupt occurs here and ISR tries to acquire lock_a
    // = DEADLOCK!

    spin_unlock(&lock_a);
}

// Correct: Disable interrupts
void interrupt_safe(void) {
    unsigned long flags;

    spin_lock_irqsave(&lock_a, flags);

    // Safe from interrupt deadlock

    spin_unlock_irqrestore(&lock_a, flags);
}

// 6. Reader-writer deadlock
static rwlock_t rw_lock;

void rw_deadlock_bad(void) {
    // Thread holds read lock
    read_lock(&rw_lock);

    // ... decides it needs to write ...
    write_lock(&rw_lock);  // DEADLOCK: Can't upgrade!

    write_unlock(&rw_lock);
    read_unlock(&rw_lock);
}

// Correct: Release and reacquire
void rw_correct(void) {
    read_lock(&rw_lock);

    if (needs_write) {
        read_unlock(&rw_lock);
        write_lock(&rw_lock);

        // Re-check condition
        if (still_needs_write()) {
            do_write();
        }

        write_unlock(&rw_lock);
    } else {
        read_unlock(&rw_lock);
    }
}
```

**Explanation**:

- **Lock ordering** - Acquire locks in consistent order
- **Circular wait** - Avoid circular dependencies
- **Self-deadlock** - Don't recursively lock
- **Interrupt deadlock** - Use \_irqsave variants
- **Lock upgrade** - Don't upgrade read to write lock

## Detection Techniques

**What**: Various techniques can detect deadlocks, including static analysis, runtime validation, and timeout-based detection.

**Why**: Understanding detection techniques is important because:

- **Early detection** - Find deadlocks during development
- **Production safety** - Detect live deadlocks
- **Root cause** - Identify deadlock sources
- **Prevention** - Fix before deployment

**How**: Detection techniques work through:

```c
// Example: Deadlock detection techniques

// 1. Lock ordering enforcement
enum lock_class {
    LOCK_CLASS_A = 0,
    LOCK_CLASS_B = 1,
    LOCK_CLASS_C = 2,
};

struct ordered_lock {
    spinlock_t lock;
    enum lock_class class;
};

static struct ordered_lock locks[3];

void enforce_lock_ordering(enum lock_class current_class) {
    static DEFINE_PER_CPU(enum lock_class, last_lock_class);
    enum lock_class last = this_cpu_read(last_lock_class);

    // Enforce ascending order
    if (current_class <= last) {
        pr_warn("Lock ordering violation: %d after %d\n",
                current_class, last);
        WARN_ON(1);
    }

    this_cpu_write(last_lock_class, current_class);
}

// 2. Timeout-based detection
bool try_lock_with_timeout(spinlock_t *lock, unsigned long timeout_jiffies) {
    unsigned long timeout = jiffies + timeout_jiffies;

    while (!spin_trylock(lock)) {
        if (time_after(jiffies, timeout)) {
            pr_err("Lock acquisition timeout - possible deadlock\n");
            dump_stack();
            return false;
        }
        cpu_relax();
    }

    return true;
}

// 3. Deadlock detection with dependency graph
struct lock_node {
    spinlock_t *lock;
    struct list_head holders;
    struct list_head waiters;
};

struct thread_node {
    struct task_struct *task;
    struct lock_node *waiting_for;
    struct list_head held_locks;
};

bool detect_cycle(struct thread_node *start) {
    struct thread_node *current = start;
    struct thread_node *visited[MAX_THREADS];
    int visited_count = 0;

    while (current) {
        // Check if we've seen this thread before (cycle)
        for (int i = 0; i < visited_count; i++) {
            if (visited[i] == current) {
                pr_err("Deadlock detected!\n");
                print_deadlock_chain(visited, visited_count);
                return true;
            }
        }

        visited[visited_count++] = current;

        // Follow wait-for chain
        if (current->waiting_for)
            current = get_lock_holder(current->waiting_for);
        else
            break;
    }

    return false;
}

// 4. Lock nesting level tracking
#define MAX_LOCK_DEPTH 8

struct lock_tracker {
    spinlock_t *locks[MAX_LOCK_DEPTH];
    int depth;
};

static DEFINE_PER_CPU(struct lock_tracker, cpu_locks);

void track_lock_acquire(spinlock_t *lock) {
    struct lock_tracker *tracker = this_cpu_ptr(&cpu_locks);

    if (tracker->depth >= MAX_LOCK_DEPTH) {
        pr_err("Lock depth exceeded - possible deadlock\n");
        dump_stack();
        return;
    }

    tracker->locks[tracker->depth++] = lock;
}

void track_lock_release(spinlock_t *lock) {
    struct lock_tracker *tracker = this_cpu_ptr(&cpu_locks);

    if (tracker->depth == 0) {
        pr_err("Lock release without acquire\n");
        return;
    }

    // Check for out-of-order release
    if (tracker->locks[tracker->depth - 1] != lock) {
        pr_err("Lock release out of order\n");
        dump_stack();
    }

    tracker->depth--;
}

// 5. Hung task detection
void detect_hung_tasks(void) {
    struct task_struct *task;
    unsigned long timeout = 120 * HZ;  // 2 minutes

    rcu_read_lock();
    for_each_process(task) {
        if (task->state == TASK_UNINTERRUPTIBLE) {
            unsigned long switch_count = task->nvcsw + task->nivcsw;

            if (switch_count == task->last_switch_count) {
                unsigned long hung_time = jiffies - task->last_switch_time;

                if (hung_time > timeout) {
                    pr_err("Task %s:%d hung for %lu seconds\n",
                           task->comm, task->pid,
                           hung_time / HZ);

                    sched_show_task(task);
                }
            }

            task->last_switch_count = switch_count;
            task->last_switch_time = jiffies;
        }
    }
    rcu_read_unlock();
}
```

**Explanation**:

- **Lock ordering** - Enforce consistent ordering
- **Timeouts** - Detect long wait times
- **Cycle detection** - Find circular dependencies
- **Nesting tracking** - Monitor lock depth
- **Hung task** - Detect stuck threads

## Rock 5B+ Deadlock Detection

**What**: The Rock 5B+ platform's 8-core ARM64 CPU requires careful deadlock detection for multi-core synchronization.

**Why**: Understanding Rock 5B+ deadlock detection is important because:

- **Multi-core** - 8 cores increase deadlock potential
- **ARM64 architecture** - ARM-specific lock behavior
- **Performance** - Deadlock impact on performance
- **Debugging** - ARM64 debugging tools

**How**: Rock 5B+ deadlock detection involves:

```bash
# Rock 5B+ deadlock detection and debugging

# 1. Enable lockdep (kernel config)
# CONFIG_PROVE_LOCKING=y
# CONFIG_DEBUG_LOCK_ALLOC=y
# CONFIG_DEBUG_ATOMIC_SLEEP=y

# 2. Check for lockdep warnings
dmesg | grep -i "lockdep\|deadlock"

# 3. View lock statistics
cat /proc/lock_stat | head -50

# 4. Check for hung tasks
dmesg | grep -i "hung task"

# 5. Monitor task states
ps aux | awk '$8 == "D" {print $0}'

# 6. Check kernel stack traces
cat /proc/$(pidof hung_process)/stack

# 7. Use SysRq to show blocked tasks
echo w > /proc/sysrq-trigger
dmesg | tail -100

# 8. Monitor lock contention
perf lock record -a sleep 10
perf lock report

# 9. Check lockdep statistics
cat /proc/lockdep_stats

# 10. ARM64 specific - check for livelock
perf stat -e cycles,instructions -a sleep 5
```

**Explanation**:

- **Lockdep** - Kernel lock validator
- **Hung task detector** - Finds stuck tasks
- **SysRq** - Emergency debugging interface
- **perf lock** - Lock profiling
- **Stack traces** - Show where threads are blocked

## Key Takeaways

**What** you've accomplished:

1. **Deadlock Understanding** - You understand deadlock conditions
2. **Detection Techniques** - You know how to detect deadlocks
3. **Lock Ordering** - You understand proper lock ordering
4. **Common Scenarios** - You recognize deadlock patterns
5. **Rock 5B+ Detection** - You know ARM64 debugging tools

**Why** these concepts matter:

- **System stability** - Preventing system hangs
- **Reliability** - Ensuring kernel reliability
- **Performance** - Avoiding deadlock overhead
- **Platform knowledge** - Rock 5B+ debugging

**When** to use these concepts:

- **Development** - Testing multi-threaded code
- **Code review** - Checking lock usage
- **Debugging** - Investigating system hangs
- **Production** - Monitoring for deadlocks

**Where** these skills apply:

- **Kernel development** - All locking code
- **Driver development** - Multi-threaded drivers
- **System debugging** - Hung system diagnosis
- **Rock 5B+** - ARM64 multi-core programming

## Next Steps

Continue with:

1. **Lockdep Framework** - Using kernel lock validator

## Resources

**Official Documentation**:

- [Lockdep](https://www.kernel.org/doc/html/latest/locking/lockdep-design.html) - Lock dependency validator
- [Locking](https://www.kernel.org/doc/html/latest/locking/index.html) - Kernel locking guide

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Synchronization chapter

**Rock 5B+ Specific**:

- [ARM64 Debugging](https://developer.arm.com/documentation/den0024/latest) - ARM64 debugging techniques

Happy learning! 🐧
