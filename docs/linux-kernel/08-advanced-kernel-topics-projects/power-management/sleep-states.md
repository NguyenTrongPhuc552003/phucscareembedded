---
sidebar_position: 2
---

# System Sleep States

Master Linux system sleep states including suspend, hibernation, and wake-up mechanisms to achieve maximum power savings during extended idle periods on Rock 5B+ and embedded systems.

## What are System Sleep States?

**What**: System sleep states are low-power modes where the system suspends most or all operations, reducing power consumption to minimal levels while preserving the ability to quickly resume operation.

**Why**: Understanding sleep states is crucial because:

- **Power Savings**: Dramatic reduction in power consumption
- **Battery Life**: Extends battery runtime significantly
- **Fast Resume**: Quick return to operational state
- **State Preservation**: Maintains system state across sleep
- **Thermal Benefits**: Reduces heat generation
- **Cost Efficiency**: Minimizes power costs

**When**: Sleep states are used when:

- **System Idle**: No user activity or workload
- **Battery Conservation**: Extending battery life
- **Thermal Management**: Cooling down the system
- **Scheduled Downtime**: Planned inactive periods
- **Power Constraints**: Limited power availability
- **Mobile/Embedded**: Rock 5B+ and battery-powered systems

**How**: Sleep states work through:

```c
// Example: System sleep states
// Power management states
enum suspend_states {
    PM_SUSPEND_ON,          // System running
    PM_SUSPEND_FREEZE,      // Freeze processes, idle CPUs
    PM_SUSPEND_STANDBY,     // Standby (S1)
    PM_SUSPEND_MEM,         // Suspend to RAM (S3)
    PM_SUSPEND_DISK,        // Hibernate (S4)
    PM_SUSPEND_MAX,
};

// Suspend operations
struct platform_suspend_ops {
    int (*valid)(suspend_state_t state);
    int (*begin)(suspend_state_t state);
    int (*prepare)(void);
    int (*prepare_late)(void);
    int (*enter)(suspend_state_t state);
    void (*wake)(void);
    void (*finish)(void);
    void (*end)(void);
    void (*recover)(void);
};

// System suspend state
struct suspend_state {
    suspend_state_t state;
    bool wakeup;
    struct list_head wakeup_sources;
    ktime_t suspend_time;
    ktime_t resume_time;
};

// Enter suspend state
static int enter_suspend_state(suspend_state_t state)
{
    int error;
    
    // Prepare for suspend
    error = suspend_prepare(state);
    if (error)
        return error;
    
    // Suspend devices
    error = suspend_devices_and_enter(state);
    if (error)
        goto out;
    
    // System suspended - execution resumes here after wakeup
    
out:
    suspend_finish();
    return error;
}
```

**Where**: Sleep states are essential in:

- **Mobile devices**: Smartphones and tablets
- **Laptops**: Battery-powered computers
- **Embedded systems**: Rock 5B+ and IoT devices
- **Servers**: Reduce idle power consumption
- **Edge devices**: Power-constrained environments

## Suspend to RAM (S3)

**What**: Suspend to RAM (also called S3 or sleep) places the system in a low-power state where only RAM remains powered to preserve system state.

**Why**: Understanding suspend-to-RAM is important because:

- **Fast Resume**: Quick wake-up time (seconds)
- **State Preservation**: All running programs remain in memory
- **Low Power**: Significantly reduced power consumption
- **Transparent**: Applications don't need special handling
- **Common Use**: Most frequently used sleep state

**How**: Suspend to RAM works through:

```c
// Example: Suspend to RAM implementation
// Suspend devices
static int suspend_devices_and_enter(suspend_state_t state)
{
    int error;
    
    // Freeze processes
    error = suspend_freeze_processes();
    if (error)
        return error;
    
    // Suspend devices in reverse probe order
    error = dpm_suspend_start(PMSG_SUSPEND);
    if (error) {
        pr_err("Some devices failed to suspend\n");
        goto thaw;
    }
    
    // Disable non-boot CPUs
    error = disable_nonboot_cpus();
    if (error)
        goto resume_devices;
    
    // Save processor state
    error = syscore_suspend();
    if (error)
        goto enable_cpus;
    
    // Enter low-power state
    if (!error) {
        error = suspend_ops->enter(state);
        // System is now suspended
        // Execution resumes here after wakeup
    }
    
    // Restore processor state
    syscore_resume();
    
enable_cpus:
    enable_nonboot_cpus();
    
resume_devices:
    dpm_resume_end(PMSG_RESUME);
    
thaw:
    suspend_thaw_processes();
    
    return error;
}

// ARM64 suspend implementation
static int arm64_suspend_enter(suspend_state_t state)
{
    // Save CPU context
    cpu_suspend(0, cpu_suspend_ops.save_state);
    
    // Enter WFI (Wait For Interrupt)
    // CPU will wake on interrupt
    cpu_do_idle();
    
    // Restore CPU context
    cpu_suspend_ops.restore_state();
    
    return 0;
}

// Device suspend/resume
static int device_suspend(struct device *dev, pm_message_t state)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error = 0;
    
    // Call device-specific suspend
    if (ops->suspend)
        error = ops->suspend(dev);
    
    return error;
}

static int device_resume(struct device *dev)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error = 0;
    
    // Call device-specific resume
    if (ops->resume)
        error = ops->resume(dev);
    
    return error;
}

// Wakeup source management
struct wakeup_source {
    const char *name;
    struct list_head entry;
    spinlock_t lock;
    struct timer_list timer;
    unsigned long event_count;
    unsigned long active_count;
    unsigned long wakeup_count;
    bool active:1;
    bool autosleep_enabled:1;
};

// Register wakeup source
static int device_wakeup_enable(struct device *dev)
{
    struct wakeup_source *ws;
    
    ws = wakeup_source_register(dev, dev_name(dev));
    if (!ws)
        return -ENOMEM;
    
    dev->power.wakeup = ws;
    return 0;
}

// Trigger wakeup
static void pm_wakeup_event(struct device *dev, unsigned int msec)
{
    struct wakeup_source *ws = dev->power.wakeup;
    
    if (!ws)
        return;
    
    // Activate wakeup source
    __pm_stay_awake(ws);
    
    // Schedule deactivation
    if (msec)
        mod_timer(&ws->timer, jiffies + msecs_to_jiffies(msec));
}
```

**Explanation**:

- **Process freezing**: Stop all user processes
- **Device suspension**: Put all devices in low-power state
- **CPU state saving**: Save CPU registers and context
- **Low-power entry**: Enter hardware sleep state
- **Wakeup handling**: Resume on interrupt or event

**Where**: Suspend to RAM is used in:

- **Laptops**: Lid close, idle timeout
- **Desktops**: Energy-saving modes
- **Mobile devices**: Screen off, background
- **Embedded systems**: Idle periods on Rock 5B+
- **Servers**: Idle power saving

## Hibernation (S4)

**What**: Hibernation (also called S4 or suspend-to-disk) saves system state to disk and powers off completely, allowing zero-power state while preserving all running programs.

**Why**: Understanding hibernation is important because:

- **Zero Power**: Complete power-off, no battery drain
- **State Preservation**: All applications and documents saved
- **Long-term Suspend**: Suitable for extended periods
- **Battery Safety**: Safe for complete battery drain
- **Disk Space**: Requires disk space for RAM contents

**How**: Hibernation works through:

```c
// Example: Hibernation implementation
// Hibernate system
static int hibernate_system(void)
{
    int error;
    
    // Create hibernation image
    error = create_hibernation_image();
    if (error)
        return error;
    
    // Write image to disk
    error = swsusp_write(PMSG_FREEZE);
    if (error)
        goto out;
    
    // Power off system
    error = suspend_devices_and_enter(PM_SUSPEND_DISK);
    
out:
    return error;
}

// Create hibernation snapshot
static int create_hibernation_image(void)
{
    int error;
    
    // Freeze processes
    error = freeze_processes();
    if (error)
        return error;
    
    // Freeze kernel threads
    error = freeze_kernel_threads();
    if (error)
        goto thaw;
    
    // Free memory for image
    error = hibernate_preallocate_memory();
    if (error)
        goto thaw;
    
    // Create snapshot of memory
    error = swsusp_arch_suspend();
    if (error)
        goto thaw;
    
    // Image created successfully
    return 0;
    
thaw:
    thaw_processes();
    return error;
}

// Save memory to disk
static int swsusp_write(unsigned int flags)
{
    struct swsusp_info *header;
    struct swap_map_handle handle;
    struct snapshot_handle snapshot;
    int error;
    
    // Initialize swap writer
    error = swap_write_page_init(&handle);
    if (error)
        return error;
    
    // Write header
    header = (struct swsusp_info *)get_zeroed_page(GFP_KERNEL);
    if (!header) {
        error = -ENOMEM;
        goto out;
    }
    
    // Fill header information
    header->version_code = LINUX_VERSION_CODE;
    header->num_physpages = num_physpages;
    header->image_pages = snapshot.pages;
    
    // Write header to swap
    error = swap_write_page(&handle, header, NULL);
    free_page((unsigned long)header);
    if (error)
        goto out;
    
    // Write memory pages
    while (!snapshot_image_done(&snapshot)) {
        unsigned long *page = snapshot_read_next(&snapshot);
        if (!page)
            break;
        error = swap_write_page(&handle, page, NULL);
        if (error)
            break;
    }
    
out:
    swap_write_page_finish(&handle);
    return error;
}

// Restore from hibernation
static int restore_hibernation_image(void)
{
    struct swsusp_info *header;
    struct swap_map_handle handle;
    int error;
    
    // Initialize swap reader
    error = swap_read_page_init(&handle);
    if (error)
        return error;
    
    // Read header
    header = (struct swsusp_info *)get_zeroed_page(GFP_KERNEL);
    if (!header)
        return -ENOMEM;
    
    error = swap_read_page(&handle, header, NULL);
    if (error)
        goto out;
    
    // Verify header
    if (header->version_code != LINUX_VERSION_CODE) {
        pr_err("Invalid hibernation image\n");
        error = -EINVAL;
        goto out;
    }
    
    // Restore memory pages
    error = load_image_pages(&handle, header);
    
out:
    free_page((unsigned long)header);
    swap_read_page_finish(&handle);
    return error;
}

// Swap allocation for hibernation
struct swap_map_handle {
    struct swap_map_page *cur;
    sector_t cur_swap;
    sector_t first_sector;
    unsigned int k;
    unsigned long reqd_free_pages;
    u32 crc32;
};

static int get_swap_for_hibernation(unsigned long nr_pages)
{
    unsigned long free_swap;
    
    free_swap = count_swap_pages(0, 1);
    
    if (free_swap < nr_pages) {
        pr_err("Not enough swap space for hibernation\n");
        return -ENOSPC;
    }
    
    return 0;
}
```

**Explanation**:

- **Memory snapshot**: Save entire RAM contents
- **Disk writing**: Write memory to swap partition
- **Power off**: Complete system shutdown
- **Boot restore**: Load image on next boot
- **Resume**: Restore system state

**Where**: Hibernation is used in:

- **Laptops**: Long-term storage
- **Desktops**: Overnight shutdown
- **Workstations**: Preserve complex workflows
- **Development**: Save development environment
- **Embedded**: Long-term power-off with state

## Wake-up Sources and Events

**What**: Wake-up sources are hardware or software events that can bring the system out of sleep state back to full operation.

**Why**: Understanding wake-up sources is important because:

- **Responsive Systems**: Wake on demand
- **Event-Driven**: React to external events
- **User Experience**: Quick response to user input
- **Scheduled Tasks**: Wake for scheduled operations
- **Power Management**: Balance sleep and responsiveness

**How**: Wake-up sources work through:

```c
// Example: Wake-up source management
// Wakeup source structure
struct wakeup_source {
    const char *name;
    struct list_head entry;
    spinlock_t lock;
    struct timer_list timer;
    unsigned long event_count;
    unsigned long active_count;
    unsigned long wakeup_count;
    unsigned long expire_count;
    unsigned long relax_count;
    ktime_t total_time;
    ktime_t max_time;
    ktime_t last_time;
    ktime_t start_prevent_time;
    ktime_t prevent_sleep_time;
    bool active:1;
    bool autosleep_enabled:1;
};

// Register wakeup source
struct wakeup_source *wakeup_source_register(struct device *dev,
                                             const char *name)
{
    struct wakeup_source *ws;
    
    ws = kzalloc(sizeof(*ws), GFP_KERNEL);
    if (!ws)
        return NULL;
    
    ws->name = name;
    ws->active = false;
    spin_lock_init(&ws->lock);
    
    // Add to global list
    wakeup_sources_add(ws);
    
    return ws;
}

// Activate wakeup source (prevent sleep)
void __pm_stay_awake(struct wakeup_source *ws)
{
    unsigned long flags;
    
    if (!ws)
        return;
    
    spin_lock_irqsave(&ws->lock, flags);
    
    if (!ws->active) {
        ws->active = true;
        ws->active_count++;
        ws->last_time = ktime_get();
        ws->start_prevent_time = ws->last_time;
    }
    
    spin_unlock_irqrestore(&ws->lock, flags);
}

// Deactivate wakeup source (allow sleep)
void __pm_relax(struct wakeup_source *ws)
{
    unsigned long flags;
    
    if (!ws)
        return;
    
    spin_lock_irqsave(&ws->lock, flags);
    
    if (ws->active) {
        ktime_t now = ktime_get();
        ktime_t duration = ktime_sub(now, ws->last_time);
        
        ws->active = false;
        ws->total_time = ktime_add(ws->total_time, duration);
        if (ktime_compare(duration, ws->max_time) > 0)
            ws->max_time = duration;
        
        ws->relax_count++;
    }
    
    spin_unlock_irqrestore(&ws->lock, flags);
}

// Wake event handling
static irqreturn_t wakeup_interrupt_handler(int irq, void *dev_id)
{
    struct device *dev = dev_id;
    struct wakeup_source *ws = dev->power.wakeup;
    
    // Trigger wakeup
    if (ws) {
        pm_wakeup_event(dev, 0);
        __pm_stay_awake(ws);
    }
    
    return IRQ_HANDLED;
}

// Configure wake IRQ
static int device_set_wakeup_enable(struct device *dev, bool enable)
{
    struct wakeup_source *ws = dev->power.wakeup;
    int irq;
    
    if (!ws)
        return -EINVAL;
    
    irq = dev->irq;
    
    if (enable) {
        // Enable wake IRQ
        enable_irq_wake(irq);
        dev->power.wakeup_path = true;
    } else {
        // Disable wake IRQ
        disable_irq_wake(irq);
        dev->power.wakeup_path = false;
    }
    
    return 0;
}

// RTC wake alarm
static int rtc_set_wake_alarm(struct rtc_device *rtc, unsigned long seconds)
{
    struct rtc_wkalrm alarm;
    struct rtc_time now;
    unsigned long target;
    
    // Get current time
    rtc_read_time(rtc, &now);
    rtc_tm_to_time(&now, &target);
    
    // Set wake time
    target += seconds;
    rtc_time_to_tm(target, &alarm.time);
    alarm.enabled = 1;
    
    // Configure RTC alarm
    return rtc_set_alarm(rtc, &alarm);
}

// GPIO wake source
static int gpio_set_wake_source(unsigned int gpio)
{
    int irq, ret;
    
    // Get IRQ for GPIO
    irq = gpio_to_irq(gpio);
    if (irq < 0)
        return irq;
    
    // Configure as wake source
    ret = irq_set_irq_wake(irq, 1);
    if (ret)
        return ret;
    
    // Set trigger type
    irq_set_irq_type(irq, IRQ_TYPE_EDGE_BOTH);
    
    return 0;
}
```

**Explanation**:

- **Wakeup source registration**: Register devices as wake sources
- **Activity tracking**: Track when devices prevent sleep
- **IRQ wake**: Configure interrupts to wake system
- **RTC wake**: Schedule wake at specific time
- **GPIO wake**: Wake on GPIO pin changes

**Where**: Wake-up sources are used in:

- **User input**: Keyboard, mouse, touchscreen
- **Network**: Wake-on-LAN, network packets
- **RTC**: Scheduled wake at specific time
- **GPIO**: External hardware events
- **Power button**: Physical wake button

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Sleep States Understanding**: You understand system sleep states
2. **Suspend to RAM**: You know how S3 suspend works
3. **Hibernation Knowledge**: You understand hibernation mechanism
4. **Wake-up Sources**: You can configure wake sources
5. **Power Savings**: You can achieve maximum power savings

**Why** these concepts matter:

- **Power Efficiency**: Dramatic power reduction during idle
- **Battery Life**: Essential for mobile and embedded systems
- **State Preservation**: Maintain work across sleep
- **User Experience**: Quick resume improves usability
- **Professional Skills**: Critical for embedded development

**When** to use these concepts:

- **Mobile Systems**: Smartphones, tablets, laptops
- **Embedded Devices**: Rock 5B+ and IoT systems
- **Battery Operation**: All battery-powered systems
- **Power Constraints**: Limited power budget
- **Thermal Management**: Cooling requirements

**Where** these skills apply:

- **Embedded Linux**: Rock 5B+ power management
- **Mobile Development**: Android and embedded systems
- **Laptop Design**: Power-efficient laptop systems
- **IoT Devices**: Low-power IoT applications
- **Professional Development**: Power management engineering

## Next Steps

**What** you're ready for next:

After mastering system sleep states, you should be ready to:

1. **Learn Device Power Management**: Understand device-specific power management
2. **Study Runtime PM**: Dynamic device power management
3. **Explore Wake Locks**: Prevent unwanted sleep
4. **Apply to Projects**: Implement power management

**Where** to go next:

Continue with the next lesson on **"Device Power Management"** to learn:

- Device power states and transitions
- Runtime power management
- Power domains and dependencies
- Device-specific optimizations

**Why** the next lesson is important:

The next lesson complements your system-level knowledge by teaching you how individual devices manage power, which is crucial for minimizing overall system power consumption.

**How** to continue learning:

1. **Test Suspend**: Experiment with suspend on Rock 5B+
2. **Configure Wakeup**: Set up wake sources
3. **Monitor Power**: Measure power consumption
4. **Debug Issues**: Troubleshoot suspend/resume problems
5. **Optimize**: Minimize suspend/resume time

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [System Sleep States](https://www.kernel.org/doc/html/latest/admin-guide/pm/sleep-states.html) - Sleep states documentation
- [Suspend and Hibernation](https://www.kernel.org/doc/html/latest/power/swsusp.html) - Suspend/hibernate guide

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for kernel developers
- [LWN.net](https://lwn.net/) - Linux news and power management articles
- [Linux PM List](https://lists.linux-foundation.org/mailman/listinfo/linux-pm) - Power management mailing list

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development reference
- [Embedded Linux Primer](https://www.pearson.com/store/p/embedded-linux-primer-a-practical-real-world-approach/P100000409086) - Embedded systems guide
- [Linux Power Management](https://www.kernel.org/doc/html/latest/power/) - Power management documentation

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM Power State Coordination](https://developer.arm.com/documentation/den0022/latest/) - ARM PSCI specification
- [RK3588 Power Management](https://www.rock-chips.com/a/en/products/RK3588/) - SoC power features

Happy power saving! 💤🔋

