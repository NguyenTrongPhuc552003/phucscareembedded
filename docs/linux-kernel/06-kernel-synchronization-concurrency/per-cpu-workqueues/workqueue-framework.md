---
sidebar_position: 2
---

# Workqueue Framework

Master the workqueue framework in the Linux kernel, understanding how to defer work to process context for safe execution on the Rock 5B+ platform.

## What is the Workqueue Framework?

**What**: The workqueue framework provides a mechanism to defer work execution to kernel worker threads, allowing work to be performed in process context where sleeping is permitted.

**Why**: Understanding workqueues is crucial because:

- **Process context** - Work runs where sleeping is allowed
- **Deferred execution** - Schedule work for later processing
- **Concurrency management** - Kernel manages worker threads
- **Resource efficiency** - Shared worker thread pools
- **Rock 5B+ development** - ARM64 multi-core work distribution
- **Professional development** - Essential for driver development

**When**: Workqueues are used when:

- **Bottom half processing** - Deferring interrupt work
- **Sleeping required** - Work needs to sleep or block
- **Long-running tasks** - Tasks too long for softirqs
- **I/O operations** - Performing I/O in process context
- **Multi-core systems** - Distributing work across CPUs
- **ARM64 platforms** - Rock 5B+ 8-core work scheduling

**How**: Workqueues work by:

- **Worker threads** - Kernel threads process work items
- **Work items** - Functions scheduled for execution
- **Work queues** - Queues holding pending work
- **Concurrency management** - cmwq (concurrency-managed workqueues)
- **CPU affinity** - Work bound to specific CPUs
- **Priority levels** - Different priority workqueues

**Where**: Workqueues are found in:

- **Device drivers** - Deferred I/O processing
- **File systems** - Background operations
- **Network stack** - Packet processing
- **Block layer** - I/O completion
- **Power management** - Suspend/resume operations
- **Rock 5B+** - ARM64 kernel subsystems

## Workqueue Basics

**What**: The kernel provides APIs for creating work items, queuing work, and managing workqueues.

**Why**: Understanding workqueue basics is important because:

- **Correct usage** - Proper API usage prevents bugs
- **Resource management** - Managing workqueue lifecycle
- **Performance** - Choosing appropriate workqueue type
- **Concurrency** - Understanding worker thread behavior

**How**: Workqueue basics work through:

```c
// Example: Workqueue basic usage
#include <linux/workqueue.h>

// 1. Define work structure
static struct work_struct my_work;

// 2. Work handler function
static void my_work_handler(struct work_struct *work) {
    pr_info("Work handler executing\n");

    // Can sleep here
    msleep(100);

    // Perform work
    process_data();

    pr_info("Work handler completed\n");
}

// 3. Initialize work
void init_my_work(void) {
    INIT_WORK(&my_work, my_work_handler);
}

// 4. Schedule work (use system workqueue)
void schedule_my_work(void) {
    // Queue work to system workqueue
    schedule_work(&my_work);
}

// 5. Delayed work
static struct delayed_work my_delayed_work;

static void delayed_work_handler(struct work_struct *work) {
    pr_info("Delayed work executing\n");
}

void init_delayed_work_example(void) {
    INIT_DELAYED_WORK(&my_delayed_work, delayed_work_handler);

    // Schedule work to run after 5 seconds
    schedule_delayed_work(&my_delayed_work, msecs_to_jiffies(5000));
}

// 6. Cancel work
void cancel_my_work(void) {
    // Cancel pending work
    cancel_work_sync(&my_work);

    // Cancel delayed work
    cancel_delayed_work_sync(&my_delayed_work);
}

// 7. Flush work
void flush_my_work(void) {
    // Wait for work to complete
    flush_work(&my_work);

    // Flush all system workqueue
    flush_scheduled_work();
}

// 8. Work with data
struct my_work_data {
    struct work_struct work;
    int data;
    char name[32];
};

static void data_work_handler(struct work_struct *work) {
    struct my_work_data *my_data;

    my_data = container_of(work, struct my_work_data, work);

    pr_info("Processing data: %d, name: %s\n",
            my_data->data, my_data->name);

    kfree(my_data);
}

void queue_data_work(int value, const char *name) {
    struct my_work_data *data;

    data = kmalloc(sizeof(*data), GFP_KERNEL);
    if (!data)
        return;

    INIT_WORK(&data->work, data_work_handler);
    data->data = value;
    strncpy(data->name, name, sizeof(data->name) - 1);

    schedule_work(&data->work);
}
```

**Explanation**:

- **INIT_WORK** - Initialize work item
- **schedule_work** - Queue work to system workqueue
- **INIT_DELAYED_WORK** - Initialize delayed work
- **cancel_work_sync** - Cancel and wait for completion
- **container_of** - Get containing structure
- **flush_work** - Wait for work to finish

## Custom Workqueues

**What**: Drivers can create custom workqueues for better control over work execution and resource usage.

**Why**: Understanding custom workqueues is important because:

- **Isolation** - Separate workqueue for critical work
- **Priority control** - High-priority workqueues
- **CPU affinity** - Bind work to specific CPUs
- **Concurrency** - Control number of workers

**How**: Custom workqueues work through:

```c
// Example: Custom workqueue usage

// 1. Create workqueue
static struct workqueue_struct *my_wq;

int init_custom_workqueue(void) {
    // Create single-threaded workqueue
    my_wq = create_singlethread_workqueue("my_wq");
    if (!my_wq)
        return -ENOMEM;

    return 0;
}

void cleanup_custom_workqueue(void) {
    if (my_wq) {
        destroy_workqueue(my_wq);
        my_wq = NULL;
    }
}

// 2. Queue work to custom workqueue
void queue_to_custom_wq(void) {
    queue_work(my_wq, &my_work);
}

// 3. Create high-priority workqueue
static struct workqueue_struct *high_pri_wq;

int init_high_priority_wq(void) {
    // WQ_HIGHPRI - high priority workqueue
    high_pri_wq = alloc_workqueue("high_pri_wq",
                                  WQ_HIGHPRI | WQ_MEM_RECLAIM,
                                  0);
    if (!high_pri_wq)
        return -ENOMEM;

    return 0;
}

// 4. Create CPU-bound workqueue
static struct workqueue_struct *cpu_intensive_wq;

int init_cpu_intensive_wq(void) {
    // WQ_CPU_INTENSIVE - for CPU-intensive work
    cpu_intensive_wq = alloc_workqueue("cpu_intensive",
                                       WQ_CPU_INTENSIVE,
                                       0);
    if (!cpu_intensive_wq)
        return -ENOMEM;

    return 0;
}

// 5. Create unbound workqueue
static struct workqueue_struct *unbound_wq;

int init_unbound_wq(void) {
    // WQ_UNBOUND - not bound to specific CPU
    unbound_wq = alloc_workqueue("unbound_wq",
                                 WQ_UNBOUND | WQ_MEM_RECLAIM,
                                 0);
    if (!unbound_wq)
        return -ENOMEM;

    return 0;
}

// 6. Per-CPU workqueue
static struct workqueue_struct *percpu_wq;

int init_percpu_wq(void) {
    // Create workqueue with one worker per CPU
    percpu_wq = alloc_workqueue("percpu_wq",
                                WQ_MEM_RECLAIM,
                                1);  // max_active per CPU
    if (!percpu_wq)
        return -ENOMEM;

    return 0;
}

// 7. Queue work to specific CPU
void queue_work_on_cpu(int cpu) {
    queue_work_on(cpu, percpu_wq, &my_work);
}

// 8. Ordered workqueue (serial execution)
static struct workqueue_struct *ordered_wq;

int init_ordered_wq(void) {
    // Create ordered workqueue (max_active = 1)
    ordered_wq = alloc_ordered_workqueue("ordered_wq",
                                         WQ_MEM_RECLAIM);
    if (!ordered_wq)
        return -ENOMEM;

    return 0;
}
```

**Explanation**:

- **create_singlethread_workqueue** - Single worker thread
- **alloc_workqueue** - Create workqueue with flags
- **WQ_HIGHPRI** - High priority workers
- **WQ_CPU_INTENSIVE** - CPU-intensive work
- **WQ_UNBOUND** - Not CPU-bound
- **WQ_MEM_RECLAIM** - For memory reclaim path
- **alloc_ordered_workqueue** - Serial execution

## Workqueue Patterns

**What**: Common design patterns for using workqueues effectively in kernel code.

**Why**: Understanding patterns is important because:

- **Best practices** - Proven usage patterns
- **Correctness** - Avoid common pitfalls
- **Performance** - Efficient work scheduling
- **Resource management** - Proper cleanup

**How**: Workqueue patterns work through:

```c
// Example: Workqueue design patterns

// 1. Self-rescheduling work (periodic task)
static struct delayed_work periodic_work;

static void periodic_work_handler(struct work_struct *work) {
    // Perform periodic task
    collect_statistics();

    // Reschedule for next period (1 second)
    schedule_delayed_work(&periodic_work, HZ);
}

void start_periodic_work(void) {
    INIT_DELAYED_WORK(&periodic_work, periodic_work_handler);
    schedule_delayed_work(&periodic_work, HZ);
}

void stop_periodic_work(void) {
    cancel_delayed_work_sync(&periodic_work);
}

// 2. Work batching
#define BATCH_SIZE 10

struct batch_work {
    struct work_struct work;
    int items[BATCH_SIZE];
    int count;
    spinlock_t lock;
};

static struct batch_work batch;

static void batch_work_handler(struct work_struct *work) {
    struct batch_work *b = container_of(work, struct batch_work, work);
    int items[BATCH_SIZE];
    int count;

    // Get batch under lock
    spin_lock(&b->lock);
    count = b->count;
    memcpy(items, b->items, sizeof(int) * count);
    b->count = 0;
    spin_unlock(&b->lock);

    // Process batch without lock
    process_batch(items, count);
}

void add_to_batch(int item) {
    bool schedule = false;

    spin_lock(&batch.lock);
    batch.items[batch.count++] = item;

    if (batch.count >= BATCH_SIZE)
        schedule = true;
    spin_unlock(&batch.lock);

    if (schedule)
        schedule_work(&batch.work);
}

// 3. Work completion notification
struct completion_work {
    struct work_struct work;
    struct completion done;
    int result;
};

static void completion_work_handler(struct work_struct *work) {
    struct completion_work *cw;

    cw = container_of(work, struct completion_work, work);

    // Perform work
    cw->result = perform_operation();

    // Signal completion
    complete(&cw->done);
}

int wait_for_work_completion(void) {
    struct completion_work cw;

    INIT_WORK(&cw.work, completion_work_handler);
    init_completion(&cw.done);

    schedule_work(&cw.work);

    // Wait for completion
    wait_for_completion(&cw.done);

    return cw.result;
}

// 4. Work cancellation with cleanup
struct cancelable_work {
    struct delayed_work dwork;
    atomic_t canceled;
    void *resources;
};

static void cancelable_work_handler(struct work_struct *work) {
    struct cancelable_work *cw;

    cw = container_of(work, struct cancelable_work, dwork.work);

    // Check if canceled
    if (atomic_read(&cw->canceled))
        return;

    // Perform work
    use_resources(cw->resources);
}

void cancel_work_with_cleanup(struct cancelable_work *cw) {
    atomic_set(&cw->canceled, 1);
    cancel_delayed_work_sync(&cw->dwork);

    // Clean up resources
    free_resources(cw->resources);
}

// 5. Work queue for driver cleanup
struct driver_cleanup {
    struct workqueue_struct *wq;
    struct list_head cleanup_list;
    spinlock_t lock;
};

static void cleanup_work_handler(struct work_struct *work) {
    // Perform cleanup in process context
    cleanup_driver_resources();
}

void driver_remove(struct driver_cleanup *dc) {
    // Queue cleanup work
    struct work_struct cleanup_work;
    INIT_WORK(&cleanup_work, cleanup_work_handler);
    queue_work(dc->wq, &cleanup_work);

    // Wait for all work to complete
    flush_workqueue(dc->wq);

    // Destroy workqueue
    destroy_workqueue(dc->wq);
}
```

**Explanation**:

- **Periodic work** - Self-rescheduling pattern
- **Batching** - Process multiple items together
- **Completion** - Wait for work to finish
- **Cancellation** - Safe work cancellation
- **Cleanup** - Driver cleanup in process context

## Rock 5B+ Workqueue Optimization

**What**: The Rock 5B+ platform's 8-core ARM64 CPU benefits from proper workqueue configuration for optimal work distribution.

**Why**: Understanding Rock 5B+ workqueues is important because:

- **8-core CPU** - Work distribution across cores
- **ARM64 architecture** - ARM64 scheduling characteristics
- **Performance** - Optimal worker thread count
- **Power efficiency** - Balancing work and power

**How**: Rock 5B+ workqueues involve:

```bash
# Rock 5B+ workqueue monitoring and tuning

# 1. View active workqueues
cat /proc/workqueues

# 2. Monitor workqueue pool threads
ps aux | grep kworker

# 3. Check per-CPU workers
cat /proc/workqueues | grep -A 5 "cpu.*bound"

# 4. Monitor workqueue statistics
cat /sys/devices/virtual/workqueue/*/pool_id

# 5. Check work execution
cat /proc/$(pidof kworker)/stack

# 6. Monitor CPU usage by workers
top -H -p $(pgrep -d',' kworker)

# 7. Tune workqueue parameters (if needed)
# Maximum worker threads
echo 512 > /sys/module/workqueue/parameters/max_active

# 8. Check for stalled work
dmesg | grep -i "workqueue.*stall"

# 9. ARM64 specific monitoring
perf stat -e sched:sched_switch -a sleep 5

# 10. View workqueue concurrency
cat /proc/workqueues | awk '{print $1,$3,$4,$5}'
```

**Explanation**:

- **/proc/workqueues** - Workqueue statistics
- **kworker threads** - Kernel worker threads
- **Pool management** - Worker pool configuration
- **Stall detection** - Detecting stuck work

## Key Takeaways

**What** you've accomplished:

1. **Workqueue Understanding** - You understand the workqueue framework
2. **Work Items** - You know how to create and schedule work
3. **Custom Workqueues** - You can create custom workqueues
4. **Design Patterns** - You understand common usage patterns
5. **Rock 5B+ Workqueues** - You know ARM64 8-core optimization

**Why** these concepts matter:

- **Process context** - Work runs where sleeping is allowed
- **Deferred execution** - Safely defer work from interrupts
- **Concurrency** - Kernel manages worker threads efficiently
- **Platform knowledge** - Rock 5B+ work distribution

**When** to use these concepts:

- **Bottom halves** - Deferring interrupt work
- **I/O operations** - Blocking I/O in process context
- **Long tasks** - Tasks too long for softirqs
- **Driver cleanup** - Deferred cleanup operations

**Where** these skills apply:

- **Driver development** - All I/O-heavy drivers
- **Kernel development** - Deferred work processing
- **File systems** - Background operations
- **Rock 5B+** - ARM64 multi-core programming

## Next Steps

Continue with:

1. **Timer Management** - Kernel timer mechanisms

## Resources

**Official Documentation**:

- [Workqueues](https://www.kernel.org/doc/html/latest/core-api/workqueue.html) - Comprehensive workqueue guide
- [Concurrency-managed Workqueues](https://www.kernel.org/doc/html/latest/core-api/workqueue.html#concurrency-managed-workqueues-cmwq) - cmwq design

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Workqueue chapter

**Rock 5B+ Specific**:

- [ARM64 Scheduling](https://developer.arm.com/documentation/den0024/latest) - ARM64 task scheduling

Happy learning! 🐧
