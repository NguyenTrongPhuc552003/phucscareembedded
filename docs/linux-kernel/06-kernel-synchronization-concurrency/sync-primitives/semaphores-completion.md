---
sidebar_position: 2
---

# Semaphores and Completion

Master semaphores and completion variables in the Linux kernel, understanding their usage patterns and applications for synchronization on the Rock 5B+ platform.

## What are Semaphores and Completion?

**What**: Semaphores are counting synchronization primitives that control access to a resource pool, while completion variables are used to signal event completion between threads.

**Why**: Understanding semaphores and completion is crucial because:

- **Resource management** - Control access to limited resources
- **Event synchronization** - Signal completion of operations
- **Producer-consumer** - Coordinate producer and consumer threads
- **Flexibility** - More flexible than binary locks
- **Rock 5B+ development** - ARM64 multi-threaded synchronization
- **Professional development** - Essential synchronization patterns

**When**: Semaphores and completion are used when:

- **Resource pools** - Managing multiple identical resources
- **Event waiting** - Waiting for event completion
- **Thread coordination** - Synchronizing between threads
- **Asynchronous operations** - Signaling operation completion
- **Multi-core systems** - Cross-CPU synchronization
- **ARM64 platforms** - Rock 5B+ 8-core coordination

**How**: Semaphores and completion work by:

- **Counting** - Semaphores track available resources
- **Blocking** - Threads sleep when resource unavailable
- **Signaling** - Completion signals event occurrence
- **Wake-up** - Waking waiting threads
- **Atomic operations** - Thread-safe count updates
- **Scheduling** - Integrating with kernel scheduler

**Where**: Semaphores and completion are found in:

- **Device drivers** - I/O completion signaling
- **Kernel subsystems** - Resource management
- **File systems** - Operation synchronization
- **Network stack** - Packet processing coordination
- **Memory management** - Resource allocation
- **Rock 5B+** - ARM64 kernel synchronization

## Semaphore Operations

**What**: Semaphores maintain a count representing available resources, with down (P) and up (V) operations to acquire and release resources.

**Why**: Understanding semaphore operations is important because:

- **Resource control** - Limiting concurrent access
- **Deadlock avoidance** - Better than multiple mutexes
- **Flexibility** - Support multiple simultaneous accessors
- **Coordination** - Synchronize producer and consumer

**How**: Semaphore operations work through:

```c
// Example: Semaphore usage
#include <linux/semaphore.h>

// 1. Define and initialize semaphore
static DEFINE_SEMAPHORE(my_sem);  // Binary semaphore (count=1)

// Initialize with specific count
static struct semaphore my_sem2;
sema_init(&my_sem2, 5);  // Allow 5 concurrent accesses

// 2. Basic semaphore usage
void semaphore_example(void) {
    // Acquire semaphore (decrement count)
    down(&my_sem);

    // Critical section
    access_shared_resource();

    // Release semaphore (increment count)
    up(&my_sem);
}

// 3. Interruptible down
int semaphore_interruptible(void) {
    int ret;

    // Can be interrupted by signals
    ret = down_interruptible(&my_sem);
    if (ret) {
        // Interrupted by signal
        return ret;
    }

    // Critical section
    process_data();

    up(&my_sem);
    return 0;
}

// 4. Try down (non-blocking)
int semaphore_trydown(void) {
    if (down_trylock(&my_sem) == 0) {
        // Successfully acquired semaphore
        do_work();
        up(&my_sem);
        return 0;
    }

    // Semaphore not available
    return -EBUSY;
}

// 5. Down with timeout
int semaphore_timeout(void) {
    unsigned long timeout = msecs_to_jiffies(1000);

    if (down_timeout(&my_sem, timeout) == 0) {
        // Acquired before timeout
        process_data();
        up(&my_sem);
        return 0;
    }

    // Timeout occurred
    return -ETIMEDOUT;
}

// 6. Resource pool management
#define MAX_RESOURCES 10
static struct semaphore resource_sem;

int init_resource_pool(void) {
    sema_init(&resource_sem, MAX_RESOURCES);
    return 0;
}

int acquire_resource(void) {
    return down_interruptible(&resource_sem);
}

void release_resource(void) {
    up(&resource_sem);
}

// 7. Producer-consumer pattern
static struct semaphore empty_slots;
static struct semaphore full_slots;
static spinlock_t buffer_lock;

void producer(void *item) {
    down(&empty_slots);           // Wait for empty slot

    spin_lock(&buffer_lock);
    add_to_buffer(item);
    spin_unlock(&buffer_lock);

    up(&full_slots);              // Signal filled slot
}

void *consumer(void) {
    void *item;

    down(&full_slots);            // Wait for filled slot

    spin_lock(&buffer_lock);
    item = remove_from_buffer();
    spin_unlock(&buffer_lock);

    up(&empty_slots);             // Signal empty slot

    return item;
}
```

**Explanation**:

- **down/up** - Acquire/release semaphore
- **down_interruptible** - Can be interrupted
- **down_trylock** - Non-blocking attempt
- **down_timeout** - Timeout support
- **Resource pools** - Managing multiple resources
- **Producer-consumer** - Classic synchronization pattern

## Completion Variables

**What**: Completion variables are one-shot synchronization primitives used to signal that an event or operation has completed.

**Why**: Understanding completion variables is important because:

- **Event signaling** - Simple event notification
- **One-way communication** - Signal completion to waiters
- **Efficient** - Optimized for single-use scenarios
- **Clear semantics** - Obvious intent in code

**How**: Completion variables work through:

```c
// Example: Completion variable usage
#include <linux/completion.h>

// 1. Define and initialize completion
static DECLARE_COMPLETION(my_completion);

// Alternative initialization
static struct completion my_completion2;
init_completion(&my_completion2);

// 2. Basic completion usage
void completion_waiter(void) {
    // Wait for completion
    wait_for_completion(&my_completion);

    // Event has occurred
    process_completed_event();
}

void completion_signaler(void) {
    // Do work
    perform_operation();

    // Signal completion
    complete(&my_completion);
}

// 3. Completion with timeout
int completion_timeout_example(void) {
    unsigned long timeout = msecs_to_jiffies(5000);  // 5 seconds
    unsigned long ret;

    // Wait for completion with timeout
    ret = wait_for_completion_timeout(&my_completion, timeout);
    if (ret == 0) {
        // Timeout occurred
        pr_warn("Operation timed out\n");
        return -ETIMEDOUT;
    }

    // Completed successfully
    return 0;
}

// 4. Interruptible completion
int completion_interruptible_example(void) {
    int ret;

    // Can be interrupted by signals
    ret = wait_for_completion_interruptible(&my_completion);
    if (ret) {
        // Interrupted by signal
        return ret;
    }

    // Completed successfully
    return 0;
}

// 5. Killable completion
int completion_killable_example(void) {
    int ret;

    // Can be interrupted by fatal signals only
    ret = wait_for_completion_killable(&my_completion);
    if (ret) {
        // Killed by signal
        return ret;
    }

    return 0;
}

// 6. Reinitializing completion
void completion_reinit_example(void) {
    // Reinitialize for reuse
    reinit_completion(&my_completion);

    // Can now wait again
    wait_for_completion(&my_completion);
}

// 7. Complete all waiters
void completion_all_example(void) {
    // Wake up all waiting threads
    complete_all(&my_completion);
}

// 8. Practical example: DMA completion
struct dma_request {
    struct completion done;
    void *buffer;
    size_t size;
};

int dma_transfer(struct dma_request *req) {
    init_completion(&req->done);

    // Start DMA transfer
    start_dma_transfer(req);

    // Wait for DMA completion
    if (wait_for_completion_timeout(&req->done,
                                   msecs_to_jiffies(1000)) == 0) {
        // DMA timeout
        cancel_dma_transfer(req);
        return -ETIMEDOUT;
    }

    return 0;
}

// DMA interrupt handler
void dma_interrupt_handler(struct dma_request *req) {
    // Signal DMA completion
    complete(&req->done);
}
```

**Explanation**:

- **wait_for_completion** - Wait for event
- **complete** - Signal one waiter
- **complete_all** - Signal all waiters
- **Timeout variants** - With timeout support
- **Interruptible** - Can be interrupted
- **Reinitialize** - Reuse completion variable

## Synchronization Patterns

**What**: Common synchronization patterns using semaphores and completion for typical kernel scenarios.

**Why**: Understanding patterns is important because:

- **Best practices** - Proven synchronization techniques
- **Code clarity** - Clear intent and design
- **Efficiency** - Optimized for common cases
- **Correctness** - Avoid common pitfalls

**How**: Synchronization patterns work through:

```c
// Example: Common synchronization patterns

// 1. Barrier synchronization
struct barrier {
    struct completion completion;
    atomic_t count;
    int total;
};

void barrier_init(struct barrier *b, int num_threads) {
    init_completion(&b->completion);
    atomic_set(&b->count, num_threads);
    b->total = num_threads;
}

void barrier_wait(struct barrier *b) {
    if (atomic_dec_and_test(&b->count)) {
        // Last thread
        complete_all(&b->completion);
    } else {
        // Wait for all threads
        wait_for_completion(&b->completion);
    }

    // Reinit for next use
    if (atomic_inc_return(&b->count) == b->total)
        reinit_completion(&b->completion);
}

// 2. Reader-writer with semaphores
static struct semaphore reader_sem;
static struct semaphore writer_sem;
static atomic_t readers;

void reader_lock(void) {
    down(&reader_sem);
    if (atomic_inc_return(&readers) == 1)
        down(&writer_sem);  // First reader blocks writers
    up(&reader_sem);
}

void reader_unlock(void) {
    down(&reader_sem);
    if (atomic_dec_return(&readers) == 0)
        up(&writer_sem);    // Last reader unblocks writers
    up(&reader_sem);
}

void writer_lock(void) {
    down(&writer_sem);
}

void writer_unlock(void) {
    up(&writer_sem);
}

// 3. Work completion tracking
struct work_tracker {
    struct completion all_done;
    atomic_t pending;
};

void submit_work(struct work_tracker *tracker) {
    atomic_inc(&tracker->pending);
    queue_work(workqueue, &work);
}

void work_completed(struct work_tracker *tracker) {
    if (atomic_dec_and_test(&tracker->pending))
        complete(&tracker->all_done);
}

void wait_all_work(struct work_tracker *tracker) {
    wait_for_completion(&tracker->all_done);
}
```

**Explanation**:

- **Barrier** - Synchronize multiple threads at point
- **Reader-writer** - Multiple readers, exclusive writer
- **Work tracking** - Wait for multiple operations

## Rock 5B+ Semaphores and Completion

**What**: The Rock 5B+ platform's ARM64 architecture provides specific considerations for semaphore and completion implementation.

**Why**: Understanding Rock 5B+ synchronization is important because:

- **ARM64 architecture** - ARM64 wait/wake mechanisms
- **8-core CPU** - Multi-core synchronization patterns
- **Performance** - ARM64 specific optimizations
- **Scheduler integration** - ARM64 scheduler interaction

**How**: Rock 5B+ synchronization involves:

```bash
# Rock 5B+ semaphore and completion monitoring

# 1. Monitor sleeping tasks
cat /proc/$(pidof myapp)/status | grep State

# 2. View wait channels
cat /proc/$(pidof myapp)/wchan

# 3. Check scheduler statistics
cat /proc/schedstat

# 4. Monitor context switches
pidstat -w 1

# 5. View completion waiting tasks
cat /proc/$(pidof myapp)/stack

# 6. System-wide sleep statistics
cat /proc/stat | grep procs_

# 7. Per-CPU idle time
mpstat -P ALL 1

# 8. ARM64 wait instruction usage
perf stat -e armv8_pmuv3/wait/ -p $(pidof myapp) sleep 10
```

**Explanation**:

- **wchan** - Wait channel (what process is waiting on)
- **schedstat** - Scheduler statistics
- **Context switches** - Voluntary vs involuntary
- **Stack traces** - Show completion wait points

## Key Takeaways

**What** you've accomplished:

1. **Semaphore Understanding** - You understand semaphore operations
2. **Completion Understanding** - You know how to use completion variables
3. **Pattern Knowledge** - You understand common synchronization patterns
4. **Resource Management** - You can manage resource pools
5. **Rock 5B+ Synchronization** - You understand ARM64 considerations

**Why** these concepts matter:

- **Flexibility** - More options than simple locks
- **Efficiency** - Optimized for specific use cases
- **Clarity** - Clear synchronization intent
- **Platform knowledge** - Rock 5B+ optimization

**When** to use these concepts:

- **Semaphores** - Resource pools, counting requirements
- **Completion** - Event signaling, I/O completion
- **Barriers** - Multi-thread synchronization points
- **Pattern selection** - Matching pattern to problem

**Where** these skills apply:

- **Driver development** - I/O completion handling
- **Kernel development** - Thread coordination
- **Resource management** - Pool management
- **Rock 5B+** - ARM64 multi-threaded programming

## Next Steps

Continue with:

1. **Read-Write Locks** - Optimized reader-writer synchronization

## Resources

**Official Documentation**:

- [Completion](https://www.kernel.org/doc/html/latest/scheduler/completion.html) - Completion variables
- [Semaphores](https://www.kernel.org/doc/html/latest/locking/index.html) - Semaphore documentation

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Synchronization patterns

**Rock 5B+ Specific**:

- [ARM64 Wait](https://developer.arm.com/documentation/den0024/latest) - ARM64 wait mechanisms

Happy learning! 🐧
