---
sidebar_position: 3
---

# Timer Management

Master kernel timer management in the Linux kernel, understanding how to schedule time-based events and handle high-resolution timers on the Rock 5B+ platform.

## What is Timer Management?

**What**: Timer management in the Linux kernel provides mechanisms to schedule functions to execute after a specified time delay, supporting both standard timers and high-resolution timers.

**Why**: Understanding timer management is crucial because:

- **Time-based events** - Schedule functions for future execution
- **Periodic tasks** - Implement periodic operations
- **Timeouts** - Implement operation timeouts
- **Precision timing** - High-resolution timer support
- **Rock 5B+ development** - ARM64 timer hardware utilization
- **Professional development** - Essential for driver development

**When**: Timers are used when:

- **Delayed execution** - Run function after delay
- **Periodic operations** - Regular polling or monitoring
- **Timeout detection** - Detecting operation timeouts
- **Rate limiting** - Controlling operation frequency
- **Hardware polling** - Periodic hardware status checks
- **ARM64 platforms** - Rock 5B+ timer hardware

**How**: Timer management works by:

- **Timer structures** - kernel timer_list structures
- **Jiffies** - Low-resolution time tracking
- **Timer wheels** - Efficient timer organization
- **High-resolution timers** - Nanosecond precision
- **Timer callbacks** - Functions executed on expiration
- **Per-CPU timers** - CPU-local timer processing

**Where**: Timers are found in:

- **Device drivers** - Hardware polling, timeouts
- **Network stack** - TCP timers, connection timeouts
- **Block layer** - I/O timeout detection
- **Scheduler** - Load balancing timers
- **Power management** - Periodic wake-ups
- **Rock 5B+** - ARM64 kernel subsystems

## Standard Kernel Timers

**What**: Standard kernel timers provide jiffies-based timing with HZ resolution (typically 100-1000Hz).

**Why**: Understanding standard timers is important because:

- **Simplicity** - Easy to use API
- **Efficiency** - Low overhead for coarse timing
- **Wide usage** - Most common timer type
- **Compatibility** - Works on all architectures

**How**: Standard timers work through:

```c
// Example: Standard kernel timer usage
#include <linux/timer.h>

// 1. Define timer
static struct timer_list my_timer;

// 2. Timer callback function
static void timer_callback(struct timer_list *timer) {
    pr_info("Timer expired!\n");

    // Perform periodic task
    check_device_status();
}

// 3. Initialize and start timer
void init_my_timer(void) {
    // Initialize timer
    timer_setup(&my_timer, timer_callback, 0);

    // Set expiration time (5 seconds from now)
    mod_timer(&my_timer, jiffies + msecs_to_jiffies(5000));
}

// 4. Modify timer expiration
void extend_timer(void) {
    // Extend timer by 10 seconds
    mod_timer(&my_timer, jiffies + msecs_to_jiffies(10000));
}

// 5. Cancel timer
void cancel_my_timer(void) {
    // Cancel timer if pending
    del_timer(&my_timer);

    // Or wait for timer to complete
    del_timer_sync(&my_timer);
}

// 6. Check if timer is pending
bool is_timer_active(void) {
    return timer_pending(&my_timer);
}

// 7. Periodic timer pattern
static void periodic_timer_callback(struct timer_list *timer) {
    // Perform periodic work
    update_statistics();

    // Reschedule timer (every 1 second)
    mod_timer(timer, jiffies + HZ);
}

void start_periodic_timer(void) {
    timer_setup(&my_timer, periodic_timer_callback, 0);
    mod_timer(&my_timer, jiffies + HZ);
}

void stop_periodic_timer(void) {
    del_timer_sync(&my_timer);
}

// 8. Timer with data
struct device_timer {
    struct timer_list timer;
    struct device *dev;
    int timeout_count;
};

static void device_timer_callback(struct timer_list *timer) {
    struct device_timer *dt;

    dt = container_of(timer, struct device_timer, timer);

    pr_info("Device %p timeout count: %d\n",
            dt->dev, dt->timeout_count);

    dt->timeout_count++;

    // Reschedule if needed
    if (dt->timeout_count < 10)
        mod_timer(&dt->timer, jiffies + HZ);
}

void init_device_timer(struct device_timer *dt, struct device *dev) {
    dt->dev = dev;
    dt->timeout_count = 0;

    timer_setup(&dt->timer, device_timer_callback, 0);
    mod_timer(&dt->timer, jiffies + HZ);
}
```

**Explanation**:

- **timer_setup** - Initialize timer with callback
- **mod_timer** - Set/modify timer expiration
- **del_timer** - Cancel timer
- **del_timer_sync** - Cancel and wait
- **jiffies** - Current time in ticks
- **HZ** - Ticks per second
- **container_of** - Get containing structure

## High-Resolution Timers

**What**: High-resolution timers (hrtimers) provide nanosecond-precision timing using hardware timers.

**Why**: Understanding hrtimers is important because:

- **Precision** - Nanosecond-level accuracy
- **Real-time** - Critical for real-time systems
- **Hardware timers** - Uses dedicated hardware
- **Sleep intervals** - Accurate sleep/delay

**How**: High-resolution timers work through:

```c
// Example: High-resolution timer usage
#include <linux/hrtimer.h>
#include <linux/ktime.h>

// 1. Define hrtimer
static struct hrtimer my_hrtimer;

// 2. Hrtimer callback
static enum hrtimer_restart hrtimer_callback(struct hrtimer *timer) {
    pr_info("Hrtimer expired!\n");

    // Perform work
    process_event();

    // Return HRTIMER_NORESTART to stop
    // Return HRTIMER_RESTART to continue
    return HRTIMER_NORESTART;
}

// 3. Initialize and start hrtimer
void init_my_hrtimer(void) {
    ktime_t ktime;

    // Initialize hrtimer
    hrtimer_init(&my_hrtimer, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
    my_hrtimer.function = hrtimer_callback;

    // Set expiration (1 second = 1,000,000,000 ns)
    ktime = ktime_set(1, 0);  // 1 second, 0 nanoseconds

    // Start timer
    hrtimer_start(&my_hrtimer, ktime, HRTIMER_MODE_REL);
}

// 4. Hrtimer with nanosecond precision
void start_precise_timer(void) {
    ktime_t ktime;

    // 500 microseconds = 500,000 nanoseconds
    ktime = ktime_set(0, 500000);

    hrtimer_start(&my_hrtimer, ktime, HRTIMER_MODE_REL);
}

// 5. Cancel hrtimer
void cancel_my_hrtimer(void) {
    // Cancel timer
    hrtimer_cancel(&my_hrtimer);
}

// 6. Periodic hrtimer
static enum hrtimer_restart periodic_hrtimer_callback(struct hrtimer *timer) {
    ktime_t now = ktime_get();

    // Perform periodic work
    collect_samples();

    // Forward timer by period (1ms)
    hrtimer_forward(timer, now, ktime_set(0, 1000000));

    return HRTIMER_RESTART;
}

void start_periodic_hrtimer(void) {
    ktime_t ktime = ktime_set(0, 1000000);  // 1ms

    hrtimer_init(&my_hrtimer, CLOCK_MONOTONIC, HRTIMER_MODE_REL);
    my_hrtimer.function = periodic_hrtimer_callback;
    hrtimer_start(&my_hrtimer, ktime, HRTIMER_MODE_REL);
}

// 7. Absolute time hrtimer
void start_absolute_hrtimer(void) {
    ktime_t ktime;

    // Get current time
    ktime = ktime_get();

    // Add 2 seconds
    ktime = ktime_add_ns(ktime, 2000000000);

    // Start with absolute time
    hrtimer_start(&my_hrtimer, ktime, HRTIMER_MODE_ABS);
}

// 8. Hrtimer sleep
void accurate_sleep(unsigned long nanoseconds) {
    ktime_t ktime = ktime_set(0, nanoseconds);

    // High-resolution sleep
    set_current_state(TASK_UNINTERRUPTIBLE);
    schedule_hrtimeout(&ktime, HRTIMER_MODE_REL);
}
```

**Explanation**:

- **hrtimer_init** - Initialize hrtimer
- **hrtimer_start** - Start hrtimer
- **ktime_set** - Create time value (seconds, nanoseconds)
- **HRTIMER_RESTART** - Continue periodic timer
- **HRTIMER_NORESTART** - One-shot timer
- **hrtimer_forward** - Advance periodic timer
- **CLOCK_MONOTONIC** - Monotonic clock source

## Timer Best Practices

**What**: Best practices for using timers correctly and efficiently in kernel code.

**Why**: Understanding best practices is important because:

- **Correctness** - Avoid timer-related bugs
- **Performance** - Efficient timer usage
- **Resource management** - Proper cleanup
- **Race conditions** - Avoiding timer races

**How**: Timer best practices work through:

```c
// Example: Timer best practices

// 1. Always cancel timers on cleanup
struct my_driver {
    struct timer_list poll_timer;
    struct hrtimer precision_timer;
};

void driver_remove(struct my_driver *drv) {
    // Cancel standard timer
    del_timer_sync(&drv->poll_timer);

    // Cancel hrtimer
    hrtimer_cancel(&drv->precision_timer);
}

// 2. Check timer pending before modification
void safe_timer_modification(void) {
    // Safe way to modify timer
    if (timer_pending(&my_timer))
        mod_timer(&my_timer, jiffies + HZ);
    else
        add_timer(&my_timer);
}

// 3. Use timer_setup for initialization
void correct_timer_init(void) {
    // Correct: use timer_setup
    timer_setup(&my_timer, timer_callback, 0);

    // Wrong: don't manually initialize
    // my_timer.function = timer_callback; // WRONG!
}

// 4. Synchronous cancellation in cleanup
void cleanup_with_sync(void) {
    // Use _sync version to ensure timer is stopped
    del_timer_sync(&my_timer);

    // Now safe to free resources used by timer
    kfree(timer_data);
}

// 5. Avoid long-running timer callbacks
static void bad_timer_callback(struct timer_list *timer) {
    // BAD: Don't do long operations in timer callback
    msleep(1000);  // WRONG!

    // BAD: Don't acquire sleeping locks
    mutex_lock(&my_mutex);  // WRONG!
}

static void good_timer_callback(struct timer_list *timer) {
    // GOOD: Do quick work
    update_counter();

    // GOOD: Schedule work for longer tasks
    schedule_work(&my_work);

    // GOOD: Use spinlocks if needed
    spin_lock(&my_lock);
    update_data();
    spin_unlock(&my_lock);
}

// 6. Handle timer races properly
static atomic_t timer_running;

static void race_free_timer_callback(struct timer_list *timer) {
    // Check if we should still run
    if (!atomic_read(&timer_running))
        return;

    // Do work
    process_data();
}

void stop_timer_safely(void) {
    atomic_set(&timer_running, 0);
    del_timer_sync(&my_timer);
}

// 7. Use appropriate timer type
void choose_timer_type(void) {
    // Use standard timer for coarse timing (>= 10ms)
    if (delay_ms >= 10) {
        mod_timer(&my_timer, jiffies + msecs_to_jiffies(delay_ms));
    }
    // Use hrtimer for precise timing (< 10ms)
    else {
        ktime_t ktime = ktime_set(0, delay_ms * 1000000);
        hrtimer_start(&my_hrtimer, ktime, HRTIMER_MODE_REL);
    }
}
```

**Explanation**:

- **del_timer_sync** - Always use in cleanup
- **timer_setup** - Proper initialization
- **Quick callbacks** - Keep timer callbacks short
- **No sleeping** - Don't sleep in timer callbacks
- **Race handling** - Properly handle timer races
- **Timer type** - Choose appropriate timer

## Rock 5B+ Timer Management

**What**: The Rock 5B+ platform's ARM64 architecture provides hardware timers with specific characteristics.

**Why**: Understanding Rock 5B+ timers is important because:

- **ARM64 timers** - ARM Generic Timer architecture
- **High resolution** - Hardware high-resolution support
- **Per-CPU timers** - Each CPU has local timer
- **Precision** - ARM arch timer precision

**How**: Rock 5B+ timer management involves:

```bash
# Rock 5B+ timer monitoring and configuration

# 1. View timer statistics
cat /proc/timer_list | head -50

# 2. Check timer resolution
cat /proc/timer_list | grep resolution

# 3. View active timers
cat /proc/timer_list | grep -A 5 "active timers"

# 4. Check clocksource
cat /sys/devices/system/clocksource/clocksource0/current_clocksource
# Should show "arch_sys_counter" on ARM64

# 5. View available clocksources
cat /sys/devices/system/clocksource/clocksource0/available_clocksource

# 6. Check timer frequency
cat /proc/timer_list | grep "tick_nsec"

# 7. Monitor timer interrupts
cat /proc/interrupts | grep -i timer

# 8. Check HZ value
zgrep "CONFIG_HZ=" /proc/config.gz

# 9. View hrtimer statistics
cat /proc/timer_stats  # If CONFIG_TIMER_STATS=y

# 10. ARM64 timer frequency
cat /proc/timer_list | grep "Clock Event Device.*arch_sys_timer"
```

**Explanation**:

- **arch_sys_counter** - ARM Generic Timer
- **timer_list** - Comprehensive timer information
- **Clock sources** - Available timing hardware
- **Per-CPU timers** - Local timer on each core

## Key Takeaways

**What** you've accomplished:

1. **Timer Understanding** - You understand kernel timer management
2. **Standard Timers** - You know jiffies-based timers
3. **High-Resolution Timers** - You can use hrtimers
4. **Best Practices** - You know correct timer usage
5. **Rock 5B+ Timers** - You understand ARM64 timer hardware

**Why** these concepts matter:

- **Time-based events** - Essential for scheduling functions
- **Precision** - Hrtimers for accurate timing
- **Efficiency** - Proper timer choice improves performance
- **Platform knowledge** - ARM64 timer capabilities

**When** to use these concepts:

- **Delayed execution** - Run functions after delay
- **Periodic tasks** - Regular polling/monitoring
- **Timeouts** - Detecting operation timeouts
- **Rate limiting** - Controlling operation frequency

**Where** these skills apply:

- **Driver development** - Hardware polling, timeouts
- **Kernel development** - Time-based operations
- **Real-time systems** - Precise timing requirements
- **Rock 5B+** - ARM64 timer programming

## Next Steps

Continue with Chapter 6 Deadlock Prevention and Debugging section:

1. **Deadlock Detection** - Identifying deadlock conditions

## Resources

**Official Documentation**:

- [Timers](https://www.kernel.org/doc/html/latest/timers/index.html) - Kernel timer documentation
- [Hrtimers](https://www.kernel.org/doc/html/latest/timers/hrtimers.html) - High-resolution timers

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Timer chapter

**Rock 5B+ Specific**:

- [ARM Generic Timer](https://developer.arm.com/documentation/den0024/latest) - ARM64 timer architecture

Happy learning! 🐧
