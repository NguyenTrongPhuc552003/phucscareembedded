---
sidebar_position: 3
---

# Device Power Management

Master device-level power management including runtime PM, power domains, and device-specific optimizations to minimize power consumption of individual hardware components on Rock 5B+.

## What is Device Power Management?

**What**: Device power management controls the power state of individual hardware devices, enabling them to enter low-power modes when idle and resume quickly when needed.

**Why**: Understanding device power management is crucial because:

- **Granular Control**: Manage power at device level
- **Dynamic Optimization**: Adjust power based on device usage
- **Battery Life**: Significant power savings in mobile systems
- **Thermal Management**: Reduce heat from unused devices
- **System Responsiveness**: Balance power and performance
- **Professional Skills**: Essential for embedded development

**When**: Device power management is used when:

- **Device Idle**: Hardware not actively in use
- **Battery Operation**: Conserving battery power
- **Thermal Constraints**: Managing system temperature
- **Runtime Optimization**: Dynamic power adjustment
- **System Sleep**: Coordinating device sleep with system
- **Embedded Systems**: Rock 5B+ and resource-constrained platforms

**How**: Device power management works through:

```c
// Example: Device power management framework
// Device power states
enum device_power_state {
    DEV_PM_ON,          // Device fully operational
    DEV_PM_SUSPEND,     // Device suspended
    DEV_PM_STANDBY,     // Device in standby
    DEV_PM_OFF,         // Device powered off
};

// Power management operations
struct dev_pm_ops {
    int (*prepare)(struct device *dev);
    void (*complete)(struct device *dev);
    int (*suspend)(struct device *dev);
    int (*resume)(struct device *dev);
    int (*freeze)(struct device *dev);
    int (*thaw)(struct device *dev);
    int (*poweroff)(struct device *dev);
    int (*restore)(struct device *dev);
    int (*suspend_late)(struct device *dev);
    int (*resume_early)(struct device *dev);
    int (*freeze_late)(struct device *dev);
    int (*thaw_early)(struct device *dev);
    int (*poweroff_late)(struct device *dev);
    int (*restore_early)(struct device *dev);
    int (*suspend_noirq)(struct device *dev);
    int (*resume_noirq)(struct device *dev);
    int (*freeze_noirq)(struct device *dev);
    int (*thaw_noirq)(struct device *dev);
    int (*poweroff_noirq)(struct device *dev);
    int (*restore_noirq)(struct device *dev);
    int (*runtime_suspend)(struct device *dev);
    int (*runtime_resume)(struct device *dev);
    int (*runtime_idle)(struct device *dev);
};

// Device power information
struct dev_pm_info {
    pm_message_t power_state;
    unsigned int can_wakeup:1;
    unsigned int async_suspend:1;
    bool is_prepared:1;
    bool is_suspended:1;
    bool is_noirq_suspended:1;
    bool is_late_suspended:1;
    bool early_init:1;
    bool direct_complete:1;
    spinlock_t lock;
    struct list_head entry;
    struct completion completion;
    struct wakeup_source *wakeup;
    bool wakeup_path:1;
    bool syscore:1;
    bool no_pm:1;
    unsigned int should_wakeup:1;
    // ... more fields
};

// Device suspend
static int device_suspend(struct device *dev, pm_message_t state)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error = 0;
    
    // Check if device can be suspended
    if (device_may_wakeup(dev)) {
        enable_irq_wake(dev->irq);
    }
    
    // Call driver suspend callback
    if (ops && ops->suspend)
        error = ops->suspend(dev);
    
    if (!error)
        dev->power.is_suspended = true;
    
    return error;
}

// Device resume
static int device_resume(struct device *dev, pm_message_t state)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error = 0;
    
    // Call driver resume callback
    if (ops && ops->resume)
        error = ops->resume(dev);
    
    if (!error) {
        dev->power.is_suspended = false;
        
        if (device_may_wakeup(dev))
            disable_irq_wake(dev->irq);
    }
    
    return error;
}
```

**Where**: Device power management is essential in:

- **Mobile devices**: Smartphones and tablets
- **Embedded systems**: Rock 5B+ and IoT devices
- **Laptops**: Battery-powered computers
- **Peripheral devices**: USB, display, storage
- **Industrial systems**: Power-efficient automation

## Runtime Power Management

**What**: Runtime PM enables devices to enter low-power states dynamically during normal system operation without requiring system-wide sleep.

**Why**: Understanding runtime PM is important because:

- **Dynamic Optimization**: Adjust power in real-time
- **Fine-Grained Control**: Per-device power management
- **Transparent**: Automatic power state transitions
- **Performance Balance**: Power savings without user impact
- **Scalability**: Efficient on many-device systems

**How**: Runtime PM operates through:

```c
// Example: Runtime PM implementation
// Runtime PM states
enum rpm_status {
    RPM_ACTIVE = 0,
    RPM_RESUMING,
    RPM_SUSPENDED,
    RPM_SUSPENDING,
};

// Runtime PM operations
static int device_runtime_suspend(struct device *dev)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error;
    
    // Check if device can be suspended
    if (dev->power.runtime_error)
        return -EINVAL;
    
    // Call driver runtime_suspend
    if (ops && ops->runtime_suspend) {
        error = ops->runtime_suspend(dev);
        if (error)
            return error;
    }
    
    // Update runtime PM state
    dev->power.runtime_status = RPM_SUSPENDED;
    dev->power.suspended_jiffies = jiffies;
    
    return 0;
}

static int device_runtime_resume(struct device *dev)
{
    const struct dev_pm_ops *ops = dev->driver->pm;
    int error;
    
    // Check current state
    if (dev->power.runtime_status == RPM_ACTIVE)
        return 0;
    
    // Update state
    dev->power.runtime_status = RPM_RESUMING;
    
    // Call driver runtime_resume
    if (ops && ops->runtime_resume) {
        error = ops->runtime_resume(dev);
        if (error) {
            dev->power.runtime_status = RPM_SUSPENDED;
            return error;
        }
    }
    
    // Update state
    dev->power.runtime_status = RPM_ACTIVE;
    dev->power.last_busy = jiffies;
    
    return 0;
}

// Auto-suspend support
static void pm_runtime_autosuspend_work(struct work_struct *work)
{
    struct device *dev = container_of(work, struct device,
                                     power.suspend_work.work);
    
    // Suspend device if still idle
    if (pm_runtime_autosuspend_enabled(dev))
        pm_runtime_suspend(dev);
}

// Enable runtime PM for device
int pm_runtime_enable(struct device *dev)
{
    unsigned long flags;
    
    spin_lock_irqsave(&dev->power.lock, flags);
    
    if (dev->power.disable_depth > 0)
        dev->power.disable_depth--;
    else
        pr_warn("Unbalanced enable for %s\n", dev_name(dev));
    
    spin_unlock_irqrestore(&dev->power.lock, flags);
    
    return 0;
}

// Get device (increment usage count)
int pm_runtime_get_sync(struct device *dev)
{
    int ret;
    
    atomic_inc(&dev->power.usage_count);
    
    ret = pm_runtime_resume(dev);
    if (ret < 0) {
        atomic_dec(&dev->power.usage_count);
        return ret;
    }
    
    return 0;
}

// Put device (decrement usage count)
int pm_runtime_put_autosuspend(struct device *dev)
{
    atomic_dec(&dev->power.usage_count);
    
    // Schedule auto-suspend
    if (atomic_read(&dev->power.usage_count) == 0 &&
        pm_runtime_autosuspend_enabled(dev)) {
        queue_delayed_work(pm_wq, &dev->power.suspend_work,
                          msecs_to_jiffies(dev->power.autosuspend_delay));
    }
    
    return 0;
}

// Mark device as busy
void pm_runtime_mark_last_busy(struct device *dev)
{
    dev->power.last_busy = jiffies;
}

// Example: Device driver with runtime PM
static int my_driver_probe(struct platform_device *pdev)
{
    struct device *dev = &pdev->dev;
    struct my_device *mydev;
    int ret;
    
    mydev = devm_kzalloc(dev, sizeof(*mydev), GFP_KERNEL);
    if (!mydev)
        return -ENOMEM;
    
    // Initialize device
    // ...
    
    // Enable runtime PM
    pm_runtime_enable(dev);
    pm_runtime_set_autosuspend_delay(dev, 1000); // 1 second
    pm_runtime_use_autosuspend(dev);
    
    return 0;
}

static int my_driver_remove(struct platform_device *pdev)
{
    struct device *dev = &pdev->dev;
    
    // Disable runtime PM
    pm_runtime_disable(dev);
    
    return 0;
}

static const struct dev_pm_ops my_pm_ops = {
    .runtime_suspend = my_device_runtime_suspend,
    .runtime_resume  = my_device_runtime_resume,
};
```

**Explanation**:

- **Reference counting**: Track device usage
- **Auto-suspend**: Automatically suspend idle devices
- **Lazy resumption**: Resume only when needed
- **Work queues**: Schedule delayed suspend
- **Driver integration**: Simple API for drivers

**Where**: Runtime PM is used in:

- **Graphics**: GPU power management
- **Storage**: Disk and flash power saving
- **Network**: Network interface power control
- **USB**: USB device auto-suspend
- **Peripheral**: General peripheral power management

## Power Domains

**What**: Power domains are groups of devices sharing common power rails, allowing coordinated power management and power gating of unused hardware blocks.

**Why**: Understanding power domains is important because:

- **Hardware Coordination**: Manage shared power rails
- **Power Gating**: Completely power off hardware blocks
- **Dependencies**: Handle power domain dependencies
- **Efficiency**: Maximize power savings
- **SoC Optimization**: Leverage SoC power architecture

**How**: Power domains work through:

```c
// Example: Power domain management
// Generic power domain structure
struct generic_pm_domain {
    struct dev_pm_domain domain;
    struct list_head gpd_list_node;
    struct list_head master_links;
    struct list_head slave_links;
    struct list_head dev_list;
    struct dev_power_governor *gov;
    struct work_struct power_off_work;
    struct fwnode_handle *provider;
    const char *name;
    atomic_t sd_count;
    enum gpd_status status;
    unsigned int device_count;
    unsigned int suspended_count;
    unsigned int prepared_count;
    bool suspend_power_off;
    int (*power_off)(struct generic_pm_domain *domain);
    int (*power_on)(struct generic_pm_domain *domain);
    unsigned int flags;
    // ... more fields
};

// Power domain device
struct pm_domain_data {
    struct list_head list_node;
    struct device *dev;
    bool need_restore;
};

// Register power domain
int pm_genpd_init(struct generic_pm_domain *genpd,
                 struct dev_power_governor *gov,
                 bool is_off)
{
    // Initialize domain
    INIT_LIST_HEAD(&genpd->master_links);
    INIT_LIST_HEAD(&genpd->slave_links);
    INIT_LIST_HEAD(&genpd->dev_list);
    INIT_WORK(&genpd->power_off_work, genpd_power_off_work_fn);
    atomic_set(&genpd->sd_count, 0);
    
    genpd->status = is_off ? GPD_STATE_POWER_OFF : GPD_STATE_ACTIVE;
    genpd->device_count = 0;
    genpd->gov = gov;
    
    return 0;
}

// Add device to power domain
int pm_genpd_add_device(struct generic_pm_domain *genpd, struct device *dev)
{
    struct pm_domain_data *pdd;
    int ret = 0;
    
    // Allocate domain data
    pdd = kzalloc(sizeof(*pdd), GFP_KERNEL);
    if (!pdd)
        return -ENOMEM;
    
    pdd->dev = dev;
    
    // Add to domain
    list_add_tail(&pdd->list_node, &genpd->dev_list);
    genpd->device_count++;
    
    // Set device PM domain
    dev->pm_domain = &genpd->domain;
    
    return ret;
}

// Power domain power off
static int genpd_power_off(struct generic_pm_domain *genpd, bool one_dev_on)
{
    int ret;
    
    // Check if all devices are suspended
    if (genpd->suspended_count != genpd->device_count)
        return -EBUSY;
    
    // Call domain power_off callback
    if (genpd->power_off) {
        ret = genpd->power_off(genpd);
        if (ret)
            return ret;
    }
    
    genpd->status = GPD_STATE_POWER_OFF;
    
    return 0;
}

// Power domain power on
static int genpd_power_on(struct generic_pm_domain *genpd, unsigned int depth)
{
    int ret;
    
    // Already on
    if (genpd->status == GPD_STATE_ACTIVE)
        return 0;
    
    // Power on parent domains first
    list_for_each_entry(link, &genpd->slave_links, slave_node) {
        ret = genpd_power_on(link->master, depth + 1);
        if (ret)
            return ret;
    }
    
    // Call domain power_on callback
    if (genpd->power_on) {
        ret = genpd->power_on(genpd);
        if (ret)
            return ret;
    }
    
    genpd->status = GPD_STATE_ACTIVE;
    
    return 0;
}

// RK3588 power domains example
static int rk3588_pd_power_on(struct generic_pm_domain *genpd)
{
    struct rk3588_pm_domain *pd = container_of(genpd,
                                               struct rk3588_pm_domain,
                                               genpd);
    
    // Enable power supply
    regmap_update_bits(pd->regmap, pd->pwr_offset,
                      pd->pwr_mask, 0);
    
    // Wait for power stable
    udelay(10);
    
    // De-assert reset
    regmap_update_bits(pd->regmap, pd->rst_offset,
                      pd->rst_mask, pd->rst_mask);
    
    // Enable clocks
    if (pd->num_clks) {
        clk_bulk_prepare_enable(pd->num_clks, pd->clks);
    }
    
    return 0;
}

static int rk3588_pd_power_off(struct generic_pm_domain *genpd)
{
    struct rk3588_pm_domain *pd = container_of(genpd,
                                               struct rk3588_pm_domain,
                                               genpd);
    
    // Disable clocks
    if (pd->num_clks) {
        clk_bulk_disable_unprepare(pd->num_clks, pd->clks);
    }
    
    // Assert reset
    regmap_update_bits(pd->regmap, pd->rst_offset,
                      pd->rst_mask, 0);
    
    // Disable power supply
    regmap_update_bits(pd->regmap, pd->pwr_offset,
                      pd->pwr_mask, pd->pwr_mask);
    
    return 0;
}
```

**Explanation**:

- **Domain hierarchy**: Parent-child domain relationships
- **Device grouping**: Devices sharing power rails
- **Coordinated power**: Power on/off entire domains
- **Clock gating**: Disable clocks for idle domains
- **Reset control**: Assert reset when powered off

**Where**: Power domains are used in:

- **SoC subsystems**: GPU, video, display blocks
- **Peripheral groups**: USB, network, storage
- **ARM systems**: Rock 5B+ RK3588 power domains
- **Mobile SoCs**: Smartphone power management
- **Embedded systems**: Power-efficient subsystems

## Device-Specific Power Optimization

**What**: Device-specific optimizations leverage unique device characteristics and capabilities to minimize power consumption beyond generic power management.

**Why**: Understanding device optimizations is important because:

- **Maximum Savings**: Utilize all device power features
- **Hardware Features**: Leverage device-specific capabilities
- **Performance Balance**: Optimize for specific use cases
- **Efficiency**: Better than generic approaches
- **Platform Expertise**: Deep device knowledge

**How**: Device optimizations are implemented through:

```c
// Example: Device-specific power optimization
// Display power management
struct display_pm {
    struct device *dev;
    struct backlight_device *backlight;
    unsigned int brightness;
    bool panel_on;
    bool backlight_on;
    struct delayed_work blank_work;
};

static int display_set_power_state(struct display_pm *dpm, bool on)
{
    if (on) {
        // Power on panel
        regulator_enable(dpm->panel_supply);
        msleep(10);
        
        // Enable display controller
        display_controller_enable(dpm->dev);
        
        // Turn on backlight
        backlight_enable(dpm->backlight);
        
        dpm->panel_on = true;
    } else {
        // Turn off backlight
        backlight_disable(dpm->backlight);
        
        // Disable display controller
        display_controller_disable(dpm->dev);
        
        // Power off panel
        regulator_disable(dpm->panel_supply);
        
        dpm->panel_on = false;
    }
    
    return 0;
}

// Network interface power management
struct network_pm {
    struct net_device *netdev;
    bool link_up;
    unsigned int speed;
    struct timer_list watchdog_timer;
};

static int network_set_low_power(struct network_pm *npm)
{
    struct net_device *netdev = npm->netdev;
    
    // Disable unused features
    if (!netdev_mc_count(netdev)) {
        // Disable multicast receive
        netdev->flags &= ~IFF_MULTICAST;
    }
    
    // Reduce link speed if possible
    if (npm->link_up && npm->speed > 100) {
        ethtool_set_link_ksettings(netdev, 100);
    }
    
    // Enable Wake-on-LAN
    enable_wol(netdev);
    
    // Reduce interrupt coalescing
    set_coalesce_params(netdev, true);
    
    return 0;
}

// Storage device power management
struct storage_pm {
    struct device *dev;
    unsigned int idle_time;
    unsigned int standby_time;
    struct delayed_work spindown_work;
};

static void storage_spindown(struct work_struct *work)
{
    struct storage_pm *spm = container_of(work, struct storage_pm,
                                          spindown_work.work);
    
    // Spin down disk
    scsi_device_quiesce(spm->dev);
    
    // Enter standby mode
    storage_enter_standby(spm->dev);
}

static int storage_configure_pm(struct storage_pm *spm)
{
    // Set Advanced Power Management (APM) level
    // Level 1-127: Aggressive power saving
    // Level 128-254: Performance oriented
    storage_set_apm_level(spm->dev, 128);
    
    // Configure idle timer
    INIT_DELAYED_WORK(&spm->spindown_work, storage_spindown);
    
    // Schedule spindown after idle time
    schedule_delayed_work(&spm->spindown_work,
                         msecs_to_jiffies(spm->idle_time));
    
    return 0;
}

// USB device selective suspend
static int usb_device_autosuspend(struct usb_device *udev)
{
    int ret;
    
    // Enable autosuspend
    usb_enable_autosuspend(udev);
    
    // Set autosuspend delay (2 seconds)
    pm_runtime_set_autosuspend_delay(&udev->dev, 2000);
    
    // Use autosuspend
    usb_mark_last_busy(udev);
    
    return 0;
}

// CPU regulator voltage optimization
static int cpu_optimize_voltage(struct cpufreq_policy *policy,
                               unsigned int freq)
{
    struct dev_pm_opp *opp;
    unsigned long voltage, min_voltage, max_voltage;
    struct regulator *reg;
    int ret;
    
    // Find OPP for frequency
    opp = dev_pm_opp_find_freq_ceil(policy->cpu_dev, &freq);
    if (IS_ERR(opp))
        return PTR_ERR(opp);
    
    voltage = dev_pm_opp_get_voltage(opp);
    
    // Try to reduce voltage slightly (undervolting)
    min_voltage = voltage * 95 / 100; // -5%
    max_voltage = voltage;
    
    reg = policy->cpu_dev->regulator;
    ret = regulator_set_voltage_tol(reg, min_voltage, 5);
    
    dev_pm_opp_put(opp);
    return ret;
}
```

**Explanation**:

- **Display**: Panel power, backlight control
- **Network**: Link speed, Wake-on-LAN, feature disable
- **Storage**: Spin-down, APM levels, standby modes
- **USB**: Selective suspend, autosuspend
- **CPU**: Voltage optimization, undervolting

**Where**: Device optimizations apply to:

- **Displays**: LCD, OLED panel management
- **Network**: Ethernet, WiFi interfaces
- **Storage**: HDD, SSD power management
- **USB**: USB peripherals and hubs
- **CPU**: Processor voltage optimization

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Device PM Understanding**: You understand device power management
2. **Runtime PM Mastery**: You know how runtime PM works
3. **Power Domains**: You understand power domain management
4. **Device Optimization**: You can optimize specific devices
5. **Integration Skills**: You can integrate PM in drivers

**Why** these concepts matter:

- **Fine-Grained Control**: Device-level power management
- **Maximum Savings**: Optimize every component
- **Professional Skills**: Essential for driver development
- **System Efficiency**: Minimize overall power consumption
- **Platform Expertise**: Rock 5B+ optimization

**When** to use these concepts:

- **Driver Development**: Implementing device drivers
- **Power Optimization**: Minimizing system power
- **Mobile Systems**: Battery-powered devices
- **Embedded Systems**: Rock 5B+ and IoT
- **Thermal Management**: Managing device heat

**Where** these skills apply:

- **Driver Development**: Device driver power management
- **Embedded Linux**: Rock 5B+ system optimization
- **Mobile Development**: Smartphone power efficiency
- **IoT Devices**: Low-power IoT applications
- **Professional Development**: Power management engineering

## Next Steps

**What** you're ready for next:

After mastering device power management, you should be ready to:

1. **Learn Kernel Contribution**: Contribute to kernel development
2. **Study Code Review**: Understand kernel code review process
3. **Explore Capstone Projects**: Apply knowledge to real projects
4. **Advanced Topics**: Specialize in specific areas

**Where** to go next:

Continue with the next lesson on **"Contribution Process"** to learn:

- Linux kernel contribution workflow
- Patch creation and submission
- Community interaction
- Maintainer guidelines

**Why** the next lesson is important:

The next lesson teaches you how to contribute your power management improvements back to the Linux kernel community, making you a part of the open-source development process.

**How** to continue learning:

1. **Implement Runtime PM**: Add runtime PM to drivers
2. **Experiment with Domains**: Create power domain hierarchies
3. **Measure Power**: Quantify power savings
4. **Optimize Devices**: Implement device-specific optimizations
5. **Contribute**: Submit power management patches

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Runtime PM](https://www.kernel.org/doc/html/latest/power/runtime_pm.html) - Runtime PM documentation
- [Power Domains](https://www.kernel.org/doc/html/latest/driver-api/pm/genpd.html) - Generic PM domains

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for kernel developers
- [Linux PM List](https://lists.linux-foundation.org/mailman/listinfo/linux-pm) - Power management mailing list
- [LWN.net](https://lwn.net/) - Linux news and PM articles

**Learning Resources**:

- [Linux Device Drivers](https://lwn.net/Kernel/LDD3/) - Device driver development
- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development reference
- [Embedded Linux Primer](https://www.pearson.com/store/p/embedded-linux-primer-a-practical-real-world-approach/P100000409086) - Embedded systems guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [RK3588 Power Management](https://www.rock-chips.com/a/en/products/RK3588/) - SoC power domains
- [ARM SCMI](https://developer.arm.com/documentation/den0056/latest/) - ARM System Control and Management Interface

Happy device optimization! 🔌⚡

