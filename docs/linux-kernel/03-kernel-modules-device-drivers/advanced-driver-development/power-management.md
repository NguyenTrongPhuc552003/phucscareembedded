---
sidebar_position: 3
---

# Power Management

Master power management in the Linux kernel with comprehensive explanations using the 4W+H framework, specifically tailored for Rock 5B+ ARM64 development.

## What is Power Management?

**What**: Power management is the mechanism by which the Linux kernel controls and optimizes the power consumption of system components, including CPUs, devices, and peripherals. It enables systems to operate efficiently while minimizing energy consumption.

**Why**: Understanding power management is crucial because:

- **Energy efficiency** - Reduces power consumption and extends battery life
- **System performance** - Balances performance with power consumption
- **Thermal management** - Prevents overheating and thermal throttling
- **Embedded development** - Critical for battery-powered devices
- **Real-world application** - Essential for practical embedded Linux development
- **Industry standard** - Widely used in modern computer systems

**When**: Power management is used when:

- **Battery operation** - When systems run on battery power
- **Thermal control** - When preventing system overheating
- **Performance optimization** - When balancing performance and power
- **System idle** - When systems are not actively processing
- **Device control** - When managing device power states
- **Embedded systems** - When optimizing for resource-constrained devices

**How**: Power management works by:

- **Power states** - Different power consumption levels for components
- **Frequency scaling** - Adjusting CPU and device frequencies
- **Voltage scaling** - Adjusting supply voltages
- **Clock gating** - Disabling unused clocks
- **Power gating** - Disabling unused power domains
- **Sleep modes** - Putting systems into low-power states

**Where**: Power management is found in:

- **Mobile devices** - Smartphones, tablets, and laptops
- **Embedded systems** - IoT devices and industrial controllers
- **Server systems** - Data centers and cloud computing
- **Automotive systems** - Electric and hybrid vehicles
- **Industrial systems** - Factory automation and control
- **Rock 5B+** - ARM64 single-board computer with power management

## Power States and Management

**What**: Power states define different power consumption levels for system components, from fully active to completely powered off.

**Why**: Understanding power states is important because:

- **Energy optimization** - Different states provide different energy savings
- **Performance trade-offs** - Balancing performance with power consumption
- **System design** - Designing systems for optimal power efficiency
- **Thermal management** - Managing heat generation and dissipation
- **Battery life** - Extending battery life in portable devices

**When**: Power states are used when:

- **System idle** - When systems are not actively processing
- **Performance scaling** - When adjusting system performance
- **Thermal control** - When managing system temperature
- **Battery operation** - When running on battery power
- **Device control** - When managing device power consumption

**How**: Power states work through:

```c
// Example: Power state management
#include <linux/pm.h>
#include <linux/module.h>
#include <linux/init.h>

// Power state definitions
enum power_state {
    POWER_STATE_ACTIVE,      // Fully active
    POWER_STATE_IDLE,        // Idle state
    POWER_STATE_SUSPEND,     // Suspend state
    POWER_STATE_HIBERNATE,   // Hibernate state
    POWER_STATE_OFF         // Powered off
};

// Device power state structure
struct device_power_state {
    enum power_state current_state;
    enum power_state target_state;
    unsigned long transition_time;
    unsigned long power_consumption;
};

// Power state transitions
static int my_device_power_transition(struct my_device *dev, enum power_state new_state)
{
    int ret;

    // Check if transition is valid
    if (!my_device_power_transition_valid(dev, new_state)) {
        dev_err(dev->dev, "Invalid power state transition\n");
        return -EINVAL;
    }

    // Perform power state transition
    switch (new_state) {
    case POWER_STATE_ACTIVE:
        ret = my_device_power_on(dev);
        break;
    case POWER_STATE_IDLE:
        ret = my_device_power_idle(dev);
        break;
    case POWER_STATE_SUSPEND:
        ret = my_device_power_suspend(dev);
        break;
    case POWER_STATE_HIBERNATE:
        ret = my_device_power_hibernate(dev);
        break;
    case POWER_STATE_OFF:
        ret = my_device_power_off(dev);
        break;
    default:
        return -EINVAL;
    }

    if (ret) {
        dev_err(dev->dev, "Power state transition failed\n");
        return ret;
    }

    // Update power state
    dev->power_state.current_state = new_state;
    dev->power_state.transition_time = jiffies;

    return 0;
}
```

**Explanation**:

- **Power state definitions** - Different power consumption levels
- **State transitions** - Moving between power states
- **Validation** - Ensuring valid state transitions
- **State tracking** - Monitoring current and target states
- **Error handling** - Proper error checking and recovery

**Where**: Power states are essential in:

- **All power-managed systems** - Desktop, server, and embedded
- **Mobile devices** - Smartphones and tablets
- **Embedded systems** - IoT devices and controllers
- **Server systems** - Data centers and cloud computing
- **Rock 5B+** - ARM64 embedded Linux development

## CPU Power Management

**What**: CPU power management involves controlling CPU frequency, voltage, and power states to optimize performance and energy consumption.

**Why**: Understanding CPU power management is important because:

- **Performance optimization** - Balancing CPU performance with power consumption
- **Energy efficiency** - Reducing CPU power consumption
- **Thermal management** - Preventing CPU overheating
- **Battery life** - Extending battery life in portable devices
- **System stability** - Ensuring stable system operation

**When**: CPU power management is used when:

- **Performance scaling** - When adjusting CPU performance
- **Thermal control** - When managing CPU temperature
- **Battery operation** - When running on battery power
- **System idle** - When systems are not actively processing
- **Workload changes** - When system workload changes

**How**: CPU power management works through:

```c
// Example: CPU power management
#include <linux/cpufreq.h>
#include <linux/cpuidle.h>
#include <linux/module.h>
#include <linux/init.h>

// CPU frequency scaling
static int my_cpu_frequency_scaling(struct my_device *dev, unsigned int frequency)
{
    int ret;

    // Set CPU frequency
    ret = cpufreq_driver_target(dev->cpu_policy, frequency, CPUFREQ_RELATION_H);
    if (ret) {
        dev_err(dev->dev, "Failed to set CPU frequency\n");
        return ret;
    }

    // Update device frequency
    dev->cpu_frequency = frequency;

    return 0;
}

// CPU idle management
static int my_cpu_idle_management(struct my_device *dev)
{
    int ret;

    // Enable CPU idle
    ret = cpuidle_enable_device(dev->cpuidle_dev);
    if (ret) {
        dev_err(dev->dev, "Failed to enable CPU idle\n");
        return ret;
    }

    // Configure idle states
    ret = my_configure_cpu_idle_states(dev);
    if (ret) {
        dev_err(dev->dev, "Failed to configure CPU idle states\n");
        return ret;
    }

    return 0;
}

// CPU power state management
static int my_cpu_power_state_management(struct my_device *dev, enum power_state state)
{
    int ret;

    switch (state) {
    case POWER_STATE_ACTIVE:
        // Enable CPU
        ret = my_cpu_enable(dev);
        break;
    case POWER_STATE_IDLE:
        // Put CPU in idle state
        ret = my_cpu_idle(dev);
        break;
    case POWER_STATE_SUSPEND:
        // Suspend CPU
        ret = my_cpu_suspend(dev);
        break;
    default:
        return -EINVAL;
    }

    return ret;
}
```

**Explanation**:

- **Frequency scaling** - Adjusting CPU frequency for performance/power balance
- **Idle management** - Managing CPU idle states
- **Power states** - Controlling CPU power consumption
- **Thermal control** - Managing CPU temperature
- **Performance optimization** - Optimizing CPU performance

**Where**: CPU power management is essential in:

- **All computer systems** - Desktop, server, and embedded
- **Mobile devices** - Smartphones and tablets
- **Embedded systems** - IoT devices and controllers
- **Server systems** - Data centers and cloud computing
- **Rock 5B+** - ARM64 embedded Linux development

## Device Power Management

**What**: Device power management involves controlling the power states of individual devices and peripherals to optimize system power consumption.

**Why**: Understanding device power management is important because:

- **Energy efficiency** - Reducing device power consumption
- **System optimization** - Optimizing overall system power consumption
- **Battery life** - Extending battery life in portable devices
- **Thermal management** - Managing device heat generation
- **System stability** - Ensuring stable device operation

**When**: Device power management is used when:

- **Device idle** - When devices are not actively used
- **System suspend** - When systems are suspended
- **Battery operation** - When running on battery power
- **Thermal control** - When managing device temperature
- **Performance scaling** - When adjusting device performance

**How**: Device power management works through:

```c
// Example: Device power management
#include <linux/pm.h>
#include <linux/module.h>
#include <linux/init.h>

// Device power management callbacks
static int my_device_suspend(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Save device state
    my_device_save_state(my_dev);

    // Disable device functionality
    my_device_disable(my_dev);

    // Put device in low power state
    my_device_power_down(my_dev);

    return 0;
}

static int my_device_resume(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Restore device state
    my_device_restore_state(my_dev);

    // Enable device functionality
    my_device_enable(my_dev);

    // Wake up device
    my_device_power_up(my_dev);

    return 0;
}

static int my_device_poweroff(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Save device state
    my_device_save_state(my_dev);

    // Disable device
    my_device_disable(my_dev);

    // Power off device
    my_device_power_off(my_dev);

    return 0;
}

static int my_device_restore(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Restore device state
    my_device_restore_state(my_dev);

    // Enable device
    my_device_enable(my_dev);

    // Power on device
    my_device_power_on(my_dev);

    return 0;
}

// Power management operations
static const struct dev_pm_ops my_device_pm_ops = {
    .suspend = my_device_suspend,
    .resume = my_device_resume,
    .poweroff = my_device_poweroff,
    .restore = my_device_restore,
};
```

**Explanation**:

- **Suspend/resume** - Device suspend and resume operations
- **Power off/on** - Device power control
- **State management** - Saving and restoring device state
- **Power management ops** - Power management callback functions
- **Error handling** - Proper error checking and recovery

**Where**: Device power management is essential in:

- **All device drivers** - Network, storage, and peripheral drivers
- **Embedded systems** - IoT devices and controllers
- **Mobile devices** - Smartphones and tablets
- **Server systems** - Data centers and cloud computing
- **Rock 5B+** - ARM64 embedded Linux development

## Runtime Power Management

**What**: Runtime power management involves dynamically managing device power states during normal system operation.

**Why**: Understanding runtime power management is important because:

- **Dynamic optimization** - Optimizing power consumption during operation
- **Performance scaling** - Adjusting device performance based on workload
- **Energy efficiency** - Reducing energy consumption during operation
- **Thermal management** - Managing device temperature during operation
- **Battery life** - Extending battery life in portable devices

**When**: Runtime power management is used when:

- **Workload changes** - When system workload changes
- **Performance scaling** - When adjusting device performance
- **Thermal control** - When managing device temperature
- **Battery operation** - When running on battery power
- **System optimization** - When optimizing system performance

**How**: Runtime power management works through:

```c
// Example: Runtime power management
#include <linux/pm_runtime.h>
#include <linux/module.h>
#include <linux/init.h>

// Runtime power management setup
static int my_runtime_pm_setup(struct my_device *dev)
{
    int ret;

    // Enable runtime power management
    pm_runtime_enable(dev->dev);

    // Set runtime power management callbacks
    dev->dev->pm_domain = &my_pm_domain;

    // Configure runtime power management
    ret = my_configure_runtime_pm(dev);
    if (ret) {
        dev_err(dev->dev, "Failed to configure runtime PM\n");
        return ret;
    }

    return 0;
}

// Runtime power management operations
static int my_runtime_suspend(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Save device state
    my_device_save_state(my_dev);

    // Disable device
    my_device_disable(my_dev);

    // Put device in low power state
    my_device_power_down(my_dev);

    return 0;
}

static int my_runtime_resume(struct device *dev)
{
    struct my_device *my_dev = dev_get_drvdata(dev);

    // Restore device state
    my_device_restore_state(my_dev);

    // Enable device
    my_device_enable(my_dev);

    // Wake up device
    my_device_power_up(my_dev);

    return 0;
}

// Runtime power management control
static void my_runtime_pm_control(struct my_device *dev)
{
    // Get device reference
    pm_runtime_get(dev->dev);

    // Use device
    my_device_use(dev);

    // Put device reference
    pm_runtime_put(dev->dev);

    // Suspend device
    pm_runtime_suspend(dev->dev);

    // Resume device
    pm_runtime_resume(dev->dev);
}
```

**Explanation**:

- **Runtime PM setup** - Enabling runtime power management
- **Suspend/resume** - Runtime suspend and resume operations
- **Power control** - Managing device power states
- **State management** - Saving and restoring device state
- **Performance optimization** - Optimizing device performance

**Where**: Runtime power management is essential in:

- **All power-managed devices** - Network, storage, and peripheral devices
- **Embedded systems** - IoT devices and controllers
- **Mobile devices** - Smartphones and tablets
- **Server systems** - Data centers and cloud computing
- **Rock 5B+** - ARM64 embedded Linux development

## ARM64/Rock 5B+ Specific Considerations

**What**: ARM64 systems like the Rock 5B+ have specific considerations for power management.

**Why**: Understanding ARM64 specifics is important because:

- **Architecture differences** - Different from x86_64 systems
- **Hardware capabilities** - ARM64 specific hardware features
- **Performance characteristics** - Different optimization strategies
- **Development tools** - ARM64 specific toolchain and debugging
- **Real-world application** - Practical embedded Linux development

**When**: ARM64 considerations apply when:

- **Power management development** - When writing power management code for ARM64
- **Hardware integration** - When integrating with ARM64 hardware
- **Performance optimization** - When optimizing for ARM64 architecture
- **Debugging** - When debugging ARM64 specific issues
- **Deployment** - When deploying on ARM64 systems

**How**: ARM64 considerations include:

```c
// Example: ARM64 specific power management
// ARM64 CPU power management
static int arm64_cpu_power_management(struct my_device *dev)
{
    int ret;

    // Configure ARM64 CPU power states
    ret = arm64_cpu_power_states_setup(dev);
    if (ret)
        return ret;

    // Configure ARM64 frequency scaling
    ret = arm64_cpu_frequency_scaling_setup(dev);
    if (ret)
        return ret;

    // Configure ARM64 idle states
    ret = arm64_cpu_idle_states_setup(dev);
    if (ret)
        return ret;

    return 0;
}

// Rock 5B+ specific power management
static int rock5b_power_management_setup(struct my_device *dev)
{
    int ret;

    // Configure RK3588 power domains
    ret = rk3588_power_domains_setup(dev);
    if (ret)
        return ret;

    // Configure RK3588 frequency scaling
    ret = rk3588_frequency_scaling_setup(dev);
    if (ret)
        return ret;

    // Configure RK3588 thermal management
    ret = rk3588_thermal_management_setup(dev);
    if (ret)
        return ret;

    return 0;
}

// ARM64 power state transitions
static int arm64_power_state_transition(struct my_device *dev, enum power_state state)
{
    int ret;

    // ARM64 specific power state transition
    switch (state) {
    case POWER_STATE_ACTIVE:
        ret = arm64_cpu_power_on(dev);
        break;
    case POWER_STATE_IDLE:
        ret = arm64_cpu_idle(dev);
        break;
    case POWER_STATE_SUSPEND:
        ret = arm64_cpu_suspend(dev);
        break;
    default:
        return -EINVAL;
    }

    return ret;
}
```

**Explanation**:

- **CPU power management** - ARM64 specific CPU power control
- **Power domains** - ARM64 power domain management
- **Frequency scaling** - ARM64 frequency scaling control
- **Thermal management** - ARM64 thermal control
- **Hardware configuration** - Rock 5B+ specific power setup

**Where**: ARM64 considerations are important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **Mobile devices** - Smartphones and tablets
- **Server systems** - ARM64 servers and workstations
- **Rock 5B+** - ARM64 single-board computer

## Best Practices

**What**: Best practices for power management include proper resource management, error handling, and performance optimization.

**Why**: Following best practices is important because:

- **Reliability** - Ensures stable and robust power management
- **Performance** - Optimizes power management efficiency
- **Maintainability** - Makes power management code easier to maintain
- **Compatibility** - Ensures compatibility across different systems
- **Security** - Implements proper security measures

**When**: Best practices should be applied when:

- **Power management development** - Throughout the development process
- **Code review** - During code review and testing
- **Maintenance** - When maintaining and updating power management code
- **Debugging** - When troubleshooting power management issues
- **Optimization** - When optimizing power management performance

**How**: Best practices include:

```c
// Example: Best practices for power management
// 1. Proper power management setup
static int my_power_management_setup(struct my_device *dev)
{
    int ret;

    // Initialize power management
    ret = my_power_management_init(dev);
    if (ret)
        return ret;

    // Configure power states
    ret = my_configure_power_states(dev);
    if (ret) {
        my_power_management_cleanup(dev);
        return ret;
    }

    // Enable power management
    ret = my_enable_power_management(dev);
    if (ret) {
        my_power_management_cleanup(dev);
        return ret;
    }

    return 0;
}

// 2. Proper error handling
static int my_power_management_error_handling(struct my_device *dev)
{
    int ret;

    // Check power management status
    if (!my_power_management_enabled(dev)) {
        dev_err(dev->dev, "Power management not enabled\n");
        return -EINVAL;
    }

    // Perform power management operation
    ret = my_power_management_operation(dev);
    if (ret) {
        dev_err(dev->dev, "Power management operation failed\n");
        return ret;
    }

    return 0;
}

// 3. Performance optimization
static void my_power_management_optimize(struct my_device *dev)
{
    // Optimize power state transitions
    my_optimize_power_state_transitions(dev);

    // Optimize frequency scaling
    my_optimize_frequency_scaling(dev);

    // Optimize idle management
    my_optimize_idle_management(dev);
}
```

**Explanation**:

- **Power management setup** - Proper initialization and configuration
- **Error handling** - Comprehensive error checking and recovery
- **Performance optimization** - Optimizing power management operations
- **Resource management** - Proper resource allocation and cleanup
- **State management** - Proper power state management

**Where**: Best practices apply in:

- **All power management** - Regardless of device type
- **Production systems** - Where reliability is critical
- **Embedded systems** - Where resources are limited
- **Real-time systems** - Where determinism is important
- **Rock 5B+** - ARM64 embedded Linux development

## Common Issues and Solutions

**What**: Common issues in power management include power state transitions, thermal management, and performance optimization problems.

**Why**: Understanding common issues is important because:

- **Debugging** - Helps identify and resolve power management problems
- **Prevention** - Avoids common pitfalls during development
- **Troubleshooting** - Provides solutions to common problems
- **Learning** - Improves understanding of power management
- **Efficiency** - Reduces development time and effort

**When**: Common issues occur when:

- **Power state transitions** - When transitioning between power states
- **Thermal management** - When managing system temperature
- **Performance optimization** - When optimizing power consumption
- **Battery operation** - When running on battery power
- **System stability** - When power management causes system instability

**How**: Common issues can be resolved by:

```c
// Example: Common issue solutions
// 1. Power state transition issues
static int my_power_state_transition_fix(struct my_device *dev, enum power_state state)
{
    int ret;

    // Check if transition is valid
    if (!my_power_state_transition_valid(dev, state)) {
        dev_err(dev->dev, "Invalid power state transition\n");
        return -EINVAL;
    }

    // Perform power state transition
    ret = my_power_state_transition(dev, state);
    if (ret) {
        dev_err(dev->dev, "Power state transition failed\n");

        // Try to recover
        ret = my_power_state_recovery(dev);
        if (ret) {
            dev_err(dev->dev, "Power state recovery failed\n");
            return ret;
        }
    }

    return 0;
}

// 2. Thermal management issues
static int my_thermal_management_fix(struct my_device *dev)
{
    int ret;

    // Check thermal status
    if (my_thermal_status_critical(dev)) {
        // Reduce performance
        ret = my_reduce_performance(dev);
        if (ret)
            return ret;

        // Enable thermal throttling
        ret = my_enable_thermal_throttling(dev);
        if (ret)
            return ret;
    }

    return 0;
}

// 3. Performance optimization issues
static int my_performance_optimization_fix(struct my_device *dev)
{
    int ret;

    // Optimize power state transitions
    ret = my_optimize_power_state_transitions(dev);
    if (ret)
        return ret;

    // Optimize frequency scaling
    ret = my_optimize_frequency_scaling(dev);
    if (ret)
        return ret;

    // Optimize idle management
    ret = my_optimize_idle_management(dev);
    if (ret)
        return ret;

    return 0;
}
```

**Explanation**:

- **Power state transitions** - Handling power state transition issues
- **Thermal management** - Managing thermal issues
- **Performance optimization** - Optimizing power management performance
- **Error handling** - Comprehensive error handling and recovery
- **System stability** - Ensuring stable power management

**Where**: Common issues occur in:

- **All power management** - Regardless of device type
- **Complex systems** - Where multiple components interact
- **Embedded systems** - Where resources are limited
- **Real-time systems** - Where timing is critical
- **Rock 5B+** - ARM64 embedded Linux development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Power Management Understanding** - You understand power management concepts and implementation
2. **Power States Knowledge** - You know different power states and their management
3. **CPU Power Management** - You understand CPU power management
4. **Device Power Management** - You know device power management
5. **ARM64 Considerations** - You understand ARM64 specific requirements

**Why** these concepts matter:

- **Energy efficiency** enables optimal power consumption
- **System optimization** improves overall system performance
- **Battery life** extends operation time in portable devices
- **Thermal management** prevents system overheating
- **Embedded development** prepares you for practical applications

**When** to use these concepts:

- **Driver development** - When writing power-managed drivers
- **System optimization** - When optimizing system power consumption
- **Embedded development** - When working with battery-powered devices
- **Thermal management** - When managing system temperature
- **Performance scaling** - When balancing performance and power

**Where** these skills apply:

- **Kernel development** - Understanding power management interfaces
- **Embedded systems** - IoT devices and industrial controllers
- **System programming** - Hardware abstraction and management
- **Professional development** - Working in systems programming
- **Rock 5B+** - ARM64 embedded Linux development

## Next Steps

**What** you're ready for next:

After mastering power management, you should be ready to:

1. **Complete Chapter 3** - You've finished all Chapter 3 lessons
2. **Begin Chapter 4** - Start learning real-time Linux kernel
3. **Explore advanced topics** - Start working with complex kernel features
4. **Understand system integration** - Learn how all components work together
5. **Begin practical development** - Start working on real projects

**Where** to go next:

Continue with **Chapter 4: Real-Time Linux Kernel** to learn:

- Real-time concepts and PREEMPT_RT
- Real-time scheduling algorithms
- Performance analysis and optimization
- Real-time applications on Rock 5B+

**Why** the next chapter is important:

Chapter 4 builds on your driver knowledge by introducing real-time Linux concepts, which are essential for deterministic systems and real-time applications.

**How** to continue learning:

1. **Study real-time concepts** - Understand real-time systems
2. **Experiment with PREEMPT_RT** - Practice real-time Linux on Rock 5B+
3. **Read documentation** - Study real-time Linux documentation
4. **Join communities** - Engage with real-time Linux developers
5. **Build projects** - Start with simple real-time experiments

## Resources

**Official Documentation**:

- [Linux Power Management Documentation](https://www.kernel.org/doc/html/latest/power/) - Power management guide
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64 specific documentation
- [Runtime Power Management](https://www.kernel.org/doc/html/latest/power/runtime_pm.html) - Runtime PM guide

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A

**Learning Resources**:

- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide
- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide

Happy learning! 🐧
