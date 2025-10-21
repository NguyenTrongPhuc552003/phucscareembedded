---
sidebar_position: 1
---

# Platform Device Model

Master the platform device model and understand how to create platform drivers for Rock 5B+ ARM64 systems.

## What is the Platform Device Model?

**What**: The platform device model is a Linux kernel framework that provides a standardized way to handle platform-specific devices and their drivers.

**Why**: Understanding the platform device model is crucial because:

- **Device abstraction** - Abstract platform-specific devices
- **Driver management** - Manage platform device drivers
- **Resource management** - Handle platform resources
- **Device tree integration** - Integrate with device trees
- **Embedded development** - Essential for embedded Linux development

**When**: The platform device model is used when:

- **Platform devices** - When working with platform-specific devices
- **Driver development** - When developing platform drivers
- **Device tree** - When using device trees
- **Embedded systems** - When developing embedded systems
- **Rock 5B+** - When developing for Rock 5B+ platform

**How**: The platform device model works through:

```c
// Example: Platform device model structure
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_device.h>

// Platform device structure
struct my_platform_device {
    struct platform_device *pdev;
    struct resource *res;
    void __iomem *regs;
    int irq;
    int major;
    int minor;
    dev_t dev;
    struct cdev cdev;
    struct device *device;
    struct class *class;
    spinlock_t lock;
    atomic_t open_count;
};

// Platform driver structure
static struct platform_driver my_platform_driver = {
    .probe = my_platform_probe,
    .remove = my_platform_remove,
    .driver = {
        .name = "my-platform-device",
        .of_match_table = my_platform_of_match,
        .owner = THIS_MODULE,
    },
};

// Device tree match table
static const struct of_device_id my_platform_of_match[] = {
    { .compatible = "mycompany,my-platform-device" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, my_platform_of_match);
```

**Where**: The platform device model is essential in:

- **All embedded systems** - IoT and industrial devices
- **Driver development** - Platform driver development
- **System programming** - System-level programming
- **ARM64 systems** - ARM64 embedded development
- **Rock 5B+** - ARM64 embedded development

## Platform Device Structure

**What**: Platform device structure defines the data structures used in the platform device model.

**Why**: Understanding platform device structure is important because:

- **Data organization** - Organize platform device data
- **Resource management** - Manage platform resources
- **State management** - Manage device state
- **Synchronization** - Provide synchronization mechanisms
- **Code organization** - Organize platform device code

**How**: Platform device structure works through:

```c
// Example: Platform device structure
// Platform device data structure
struct my_platform_device {
    // Platform device
    struct platform_device *pdev;
    
    // Resources
    struct resource *res;
    void __iomem *regs;
    int irq;
    
    // Character device
    int major;
    int minor;
    dev_t dev;
    struct cdev cdev;
    struct device *device;
    struct class *class;
    
    // Synchronization
    spinlock_t lock;
    struct mutex mutex;
    wait_queue_head_t wait_queue;
    
    // State information
    atomic_t open_count;
    int state;
    bool busy;
    
    // Statistics
    unsigned long read_count;
    unsigned long write_count;
    unsigned long error_count;
    
    // Hardware information
    int gpio_pin;
    int gpio_direction;
    int gpio_value;
    int clock_frequency;
    int voltage_level;
};

// Platform driver structure
static struct platform_driver my_platform_driver = {
    .probe = my_platform_probe,
    .remove = my_platform_remove,
    .shutdown = my_platform_shutdown,
    .suspend = my_platform_suspend,
    .resume = my_platform_resume,
    .driver = {
        .name = "my-platform-device",
        .of_match_table = my_platform_of_match,
        .owner = THIS_MODULE,
    },
};

// Device tree match table
static const struct of_device_id my_platform_of_match[] = {
    { .compatible = "mycompany,my-platform-device" },
    { .compatible = "mycompany,my-platform-device-v2" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, my_platform_of_match);
```

**Explanation**:

- **Platform device** - Platform device structure
- **Resources** - Platform resources (memory, IRQ, etc.)
- **Character device** - Character device for user space access
- **Synchronization** - Synchronization primitives
- **State information** - Device state tracking

**Where**: Platform device structure is used in:

- **All platform devices** - Every platform device needs structure
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Platform Driver Registration

**What**: Platform driver registration is the process of registering a platform driver with the kernel.

**Why**: Understanding driver registration is important because:

- **Kernel integration** - Integrate with the kernel platform model
- **Device discovery** - Enable device discovery
- **Driver management** - Manage driver lifecycle
- **Error handling** - Handle registration errors
- **System stability** - Ensure system stability

**How**: Driver registration works through:

```c
// Example: Platform driver registration
static int __init my_platform_driver_init(void)
{
    int ret;

    // Register platform driver
    ret = platform_driver_register(&my_platform_driver);
    if (ret < 0) {
        printk(KERN_ERR "Failed to register platform driver\n");
        return ret;
    }

    printk(KERN_INFO "Platform driver registered successfully\n");
    return 0;
}

static void __exit my_platform_driver_exit(void)
{
    // Unregister platform driver
    platform_driver_unregister(&my_platform_driver);
    printk(KERN_INFO "Platform driver unregistered\n");
}

// Module initialization
module_init(my_platform_driver_init);
module_exit(my_platform_driver_exit);

// Platform driver structure
static struct platform_driver my_platform_driver = {
    .probe = my_platform_probe,
    .remove = my_platform_remove,
    .shutdown = my_platform_shutdown,
    .suspend = my_platform_suspend,
    .resume = my_platform_resume,
    .driver = {
        .name = "my-platform-device",
        .of_match_table = my_platform_of_match,
        .owner = THIS_MODULE,
    },
};
```

**Explanation**:

- **Driver registration** - Register platform driver with kernel
- **Driver unregistration** - Unregister platform driver
- **Module initialization** - Initialize platform driver module
- **Module cleanup** - Clean up platform driver module
- **Error handling** - Handle registration errors

**Where**: Driver registration is used in:

- **All platform drivers** - Every platform driver needs registration
- **Driver development** - Platform driver development
- **System modules** - System-level platform drivers
- **Embedded modules** - Embedded platform drivers
- **Rock 5B+** - ARM64 embedded drivers

## Platform Device Probe

**What**: Platform device probe is the function that is called when a platform device is discovered and needs to be initialized.

**Why**: Understanding device probe is important because:

- **Device initialization** - Initialize platform devices
- **Resource allocation** - Allocate platform resources
- **Hardware setup** - Set up platform hardware
- **Driver binding** - Bind drivers to devices
- **Error handling** - Handle probe errors

**How**: Device probe works through:

```c
// Example: Platform device probe
static int my_platform_probe(struct platform_device *pdev)
{
    struct my_platform_device *dev;
    struct resource *res;
    int ret;
    int irq;

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(struct my_platform_device), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Store platform device
    dev->pdev = pdev;
    platform_set_drvdata(pdev, dev);

    // Get memory resource
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!res) {
        printk(KERN_ERR "No memory resource found\n");
        return -ENODEV;
    }

    // Request memory region
    dev->res = devm_request_mem_region(&pdev->dev, res->start, resource_size(res), pdev->name);
    if (!dev->res) {
        printk(KERN_ERR "Failed to request memory region\n");
        return -EBUSY;
    }

    // Map memory region
    dev->regs = devm_ioremap(&pdev->dev, res->start, resource_size(res));
    if (!dev->regs) {
        printk(KERN_ERR "Failed to map memory region\n");
        return -ENOMEM;
    }

    // Get IRQ resource
    irq = platform_get_irq(pdev, 0);
    if (irq < 0) {
        printk(KERN_ERR "No IRQ resource found\n");
        return irq;
    }
    dev->irq = irq;

    // Request IRQ
    ret = devm_request_irq(&pdev->dev, irq, my_platform_irq_handler, IRQF_SHARED, pdev->name, dev);
    if (ret < 0) {
        printk(KERN_ERR "Failed to request IRQ %d\n", irq);
        return ret;
    }

    // Initialize device
    ret = my_platform_device_init(dev);
    if (ret < 0) {
        printk(KERN_ERR "Device initialization failed\n");
        return ret;
    }

    printk(KERN_INFO "Platform device probed successfully\n");
    return 0;
}
```

**Explanation**:

- **Device allocation** - Allocate device structure
- **Resource acquisition** - Acquire platform resources
- **Memory mapping** - Map memory regions
- **IRQ handling** - Handle IRQ resources
- **Device initialization** - Initialize platform device

**Where**: Device probe is used in:

- **All platform devices** - Every platform device needs probe
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Platform Device Remove

**What**: Platform device remove is the function that is called when a platform device is removed or the driver is unloaded.

**Why**: Understanding device remove is important because:

- **Resource cleanup** - Clean up platform resources
- **Hardware cleanup** - Clean up platform hardware
- **Driver unbinding** - Unbind drivers from devices
- **Memory cleanup** - Free allocated memory
- **System stability** - Ensure system stability

**How**: Device remove works through:

```c
// Example: Platform device remove
static int my_platform_remove(struct platform_device *pdev)
{
    struct my_platform_device *dev = platform_get_drvdata(pdev);

    if (!dev) {
        printk(KERN_WARNING "No device data found\n");
        return 0;
    }

    // Clean up device
    my_platform_device_cleanup(dev);

    // Free IRQ
    if (dev->irq > 0) {
        devm_free_irq(&pdev->dev, dev->irq, dev);
    }

    // Unmap memory region
    if (dev->regs) {
        devm_iounmap(&pdev->dev, dev->regs);
    }

    // Release memory region
    if (dev->res) {
        devm_release_mem_region(&pdev->dev, dev->res->start, resource_size(dev->res));
    }

    // Clear platform device data
    platform_set_drvdata(pdev, NULL);

    printk(KERN_INFO "Platform device removed successfully\n");
    return 0;
}
```

**Explanation**:

- **Device cleanup** - Clean up platform device
- **Resource cleanup** - Clean up platform resources
- **IRQ cleanup** - Free IRQ resources
- **Memory cleanup** - Unmap memory regions
- **Data cleanup** - Clear platform device data

**Where**: Device remove is used in:

- **All platform devices** - Every platform device needs remove
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Platform Resource Management

**What**: Platform resource management handles platform resources such as memory, IRQ, and GPIO.

**Why**: Understanding resource management is important because:

- **Resource allocation** - Allocate platform resources
- **Resource tracking** - Track allocated resources
- **Resource cleanup** - Clean up platform resources
- **Error handling** - Handle resource errors
- **System stability** - Ensure system stability

**How**: Resource management works through:

```c
// Example: Platform resource management
static int my_platform_get_resources(struct platform_device *pdev, struct my_platform_device *dev)
{
    struct resource *res;
    int ret;
    int irq;

    // Get memory resource
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!res) {
        printk(KERN_ERR "No memory resource found\n");
        return -ENODEV;
    }

    // Request memory region
    dev->res = devm_request_mem_region(&pdev->dev, res->start, resource_size(res), pdev->name);
    if (!dev->res) {
        printk(KERN_ERR "Failed to request memory region\n");
        return -EBUSY;
    }

    // Map memory region
    dev->regs = devm_ioremap(&pdev->dev, res->start, resource_size(res));
    if (!dev->regs) {
        printk(KERN_ERR "Failed to map memory region\n");
        return -ENOMEM;
    }

    // Get IRQ resource
    irq = platform_get_irq(pdev, 0);
    if (irq < 0) {
        printk(KERN_ERR "No IRQ resource found\n");
        return irq;
    }
    dev->irq = irq;

    // Request IRQ
    ret = devm_request_irq(&pdev->dev, irq, my_platform_irq_handler, IRQF_SHARED, pdev->name, dev);
    if (ret < 0) {
        printk(KERN_ERR "Failed to request IRQ %d\n", irq);
        return ret;
    }

    // Get GPIO resource
    dev->gpio_pin = of_get_named_gpio(pdev->dev.of_node, "gpio-pin", 0);
    if (dev->gpio_pin < 0) {
        printk(KERN_ERR "No GPIO resource found\n");
        return dev->gpio_pin;
    }

    // Request GPIO
    ret = devm_gpio_request(&pdev->dev, dev->gpio_pin, "my-platform-gpio");
    if (ret < 0) {
        printk(KERN_ERR "Failed to request GPIO %d\n", dev->gpio_pin);
        return ret;
    }

    return 0;
}

static void my_platform_put_resources(struct platform_device *pdev, struct my_platform_device *dev)
{
    // Free IRQ
    if (dev->irq > 0) {
        devm_free_irq(&pdev->dev, dev->irq, dev);
    }

    // Unmap memory region
    if (dev->regs) {
        devm_iounmap(&pdev->dev, dev->regs);
    }

    // Release memory region
    if (dev->res) {
        devm_release_mem_region(&pdev->dev, dev->res->start, resource_size(dev->res));
    }

    // Free GPIO
    if (dev->gpio_pin >= 0) {
        devm_gpio_free(&pdev->dev, dev->gpio_pin);
    }
}
```

**Explanation**:

- **Memory resources** - Handle memory resources
- **IRQ resources** - Handle IRQ resources
- **GPIO resources** - Handle GPIO resources
- **Resource allocation** - Allocate platform resources
- **Resource cleanup** - Clean up platform resources

**Where**: Resource management is used in:

- **All platform devices** - Every platform device needs resource management
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## ARM64 Specific Considerations

**What**: ARM64 specific considerations address unique aspects of ARM64 architecture platform device development.

**Why**: Understanding ARM64 considerations is important because:

- **Architecture differences** - ARM64 has different requirements
- **Memory model** - ARM64 specific memory considerations
- **Performance characteristics** - ARM64 specific performance
- **Hardware features** - ARM64 specific hardware capabilities
- **Real-world application** - Practical ARM64 development

**How**: ARM64 considerations involve:

```c
// Example: ARM64 specific platform device development
// ARM64 memory barriers for platform operations
static void arm64_platform_memory_barrier(void)
{
    // ARM64 specific memory barriers
    smp_wmb();  // Write memory barrier
    smp_rmb();  // Read memory barrier
    smp_mb();   // Full memory barrier
}

// ARM64 cache operations for platform data
static void arm64_platform_cache_ops(struct my_platform_device *dev)
{
    // Flush cache for platform data
    flush_cache_range(dev->regs, dev->regs + resource_size(dev->res));
    
    // Invalidate cache for platform data
    invalidate_icache_range(dev->regs, dev->regs + resource_size(dev->res));
}

// ARM64 atomic operations for platform state
static void arm64_platform_atomic_ops(struct my_platform_device *dev)
{
    // Atomic operations for platform state
    atomic_inc(&dev->open_count);
    atomic_dec(&dev->open_count);
    
    // Atomic operations for platform statistics
    atomic_inc(&dev->read_count);
    atomic_inc(&dev->write_count);
}

// ARM64 specific platform initialization
static int arm64_platform_init(struct my_platform_device *dev)
{
    // ARM64 specific initialization
    if (arm64_platform_memory_barrier() < 0) {
        printk(KERN_ERR "ARM64 memory barrier initialization failed\n");
        return -EINVAL;
    }
    
    return 0;
}
```

**Explanation**:

- **Memory barriers** - ARM64 memory ordering considerations
- **Cache operations** - ARM64 cache coherency protocols
- **Atomic operations** - ARM64 atomic operation usage
- **Performance** - ARM64 specific performance considerations
- **Hardware features** - Utilizing ARM64 capabilities

**Where**: ARM64 considerations are important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **Mobile devices** - Smartphones and tablets
- **Server systems** - ARM64 servers and workstations
- **Rock 5B+** - ARM64 single-board computer

## Rock 5B+ Platform Development

**What**: Rock 5B+ specific platform development addresses unique aspects of the Rock 5B+ platform.

**Why**: Understanding Rock 5B+ development is important because:

- **Platform specifics** - Rock 5B+ has unique requirements
- **RK3588 SoC** - Specific SoC features and limitations
- **Embedded nature** - Resource-constrained environment
- **Real-world application** - Practical embedded development
- **Hardware integration** - Platform-specific hardware

**How**: Rock 5B+ development involves:

```c
// Example: Rock 5B+ specific platform development
// Rock 5B+ device tree match table
static const struct of_device_id rock5b_platform_of_match[] = {
    { .compatible = "radxa,rock-5b-plus-platform" },
    { .compatible = "radxa,rock-5b-plus-gpio" },
    { .compatible = "radxa,rock-5b-plus-uart" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, rock5b_platform_of_match);

// Rock 5B+ specific platform probe
static int rock5b_platform_probe(struct platform_device *pdev)
{
    struct my_platform_device *dev;
    struct device_node *np;
    int ret;

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(struct my_platform_device), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Store platform device
    dev->pdev = pdev;
    platform_set_drvdata(pdev, dev);

    // Get device tree node
    np = pdev->dev.of_node;
    if (!np) {
        printk(KERN_ERR "No device tree node found\n");
        return -ENODEV;
    }

    // Initialize Rock 5B+ specific hardware
    ret = rock5b_hardware_init(np);
    if (ret < 0) {
        printk(KERN_ERR "Rock 5B+ hardware initialization failed\n");
        return ret;
    }

    printk(KERN_INFO "Rock 5B+ platform device probed successfully\n");
    return 0;
}

// Rock 5B+ specific platform driver
static struct platform_driver rock5b_platform_driver = {
    .probe = rock5b_platform_probe,
    .remove = rock5b_platform_remove,
    .driver = {
        .name = "rock5b-platform-device",
        .of_match_table = rock5b_platform_of_match,
        .owner = THIS_MODULE,
    },
};
```

**Explanation**:

- **Device tree integration** - Rock 5B+ device tree support
- **Hardware initialization** - Rock 5B+ specific hardware setup
- **Platform detection** - Detecting Rock 5B+ platform
- **Resource management** - Rock 5B+ specific resource handling
- **Debugging** - Rock 5B+ specific debugging

**Where**: Rock 5B+ development is important in:

- **Embedded development** - Learning practical embedded development
- **ARM64 systems** - Understanding ARM64 development
- **Single-board computers** - SBC development
- **Real-time systems** - Real-time Linux development
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Platform Model Understanding** - You understand the platform device model
2. **Device Structure** - You know platform device data structures
3. **Driver Registration** - You understand platform driver registration
4. **Device Probe** - You know how to implement device probe
5. **Resource Management** - You understand platform resource management
6. **Platform Specifics** - You know ARM64 and Rock 5B+ considerations

**Why** these concepts matter:

- **Driver development** - Essential for platform driver development
- **Device abstraction** - Important for device abstraction
- **Resource management** - Critical for resource management
- **Embedded development** - Valuable for embedded Linux development
- **Professional development** - Valuable skill for kernel developers

**When** to use these concepts:

- **Platform driver development** - When creating platform drivers
- **System programming** - When writing system-level software
- **Embedded development** - When developing embedded systems
- **Device tree integration** - When integrating with device trees
- **Learning** - When learning kernel development

**Where** these skills apply:

- **Kernel development** - Creating platform drivers
- **Driver development** - Platform driver development
- **System programming** - System-level programming
- **Embedded development** - Embedded Linux development
- **Professional development** - Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering the platform device model, you should be ready to:

1. **Learn device tree integration** - Understand device tree integration
2. **Study PCI/USB drivers** - Learn PCI and USB driver development
3. **Begin advanced topics** - Learn advanced driver concepts
4. **Explore DMA operations** - Learn DMA operations
5. **Study interrupt handling** - Learn interrupt handling

**Where** to go next:

Continue with the next lesson on **"Device Tree Integration"** to learn:

- How to integrate with device trees
- Device tree parsing and usage
- Hardware resource mapping
- Platform-specific configuration

**Why** the next lesson is important:

The next lesson builds on your platform device knowledge by teaching you how to integrate with device trees. You'll learn how to use device trees for hardware discovery and configuration.

**How** to continue learning:

1. **Practice platform development** - Create platform drivers
2. **Study driver examples** - Examine existing platform drivers
3. **Read documentation** - Study platform device documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple platform projects

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Platform Devices](https://www.kernel.org/doc/html/latest/driver-api/) - Platform device documentation
- [Device Trees](https://www.kernel.org/doc/html/latest/devicetree/) - Device tree documentation

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
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

Happy learning! 🐧
