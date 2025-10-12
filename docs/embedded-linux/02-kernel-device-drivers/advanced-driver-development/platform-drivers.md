---
sidebar_position: 1
---

# Platform Drivers

Learn how to create platform drivers for SoC peripherals and integrate them with the Linux device model and Device Tree.

## What are Platform Drivers?

**What**: Platform drivers are device drivers that handle platform devices, which are devices that are part of the system-on-chip (SoC) and are not discoverable through standard bus mechanisms like PCI or USB.

**Why**: Platform drivers are important because:

- **SoC integration** provides drivers for SoC peripherals and on-chip devices
- **Device Tree support** enables Device Tree-based device discovery and configuration
- **Resource management** manages platform device resources like memory and interrupts
- **System initialization** integrates devices into system startup and initialization
- **Hardware abstraction** provides uniform interface to platform devices

**When**: Platform drivers are used when:

- **Developing drivers** for SoC peripherals like UART, SPI, I2C, GPIO
- **Creating drivers** for on-chip devices and controllers
- **Implementing drivers** for devices described in Device Tree
- **Building embedded systems** with custom hardware
- **Integrating hardware** into Linux systems

**How**: Platform drivers work by:

- **Device Tree integration** using Device Tree for device discovery and configuration
- **Resource management** managing device resources like memory regions and interrupts
- **Driver registration** registering with the platform driver framework
- **Probe/Remove** handling device lifecycle and resource allocation
- **Hardware abstraction** providing uniform interface to different hardware

**Where**: Platform drivers are used in:

- **SoC peripherals** - UART, SPI, I2C, GPIO controllers
- **Memory controllers** - DDR, flash memory controllers
- **Clock controllers** - System clock management
- **Power management** - Power domain controllers
- **Custom hardware** - Application-specific hardware

## Basic Platform Driver

**What**: A basic platform driver implements the essential platform driver interface and handles device discovery and resource management.

**Why**: Understanding basic platform drivers is important because:

- **Foundation knowledge** provides the basis for all platform drivers
- **Device Tree integration** enables Device Tree-based device discovery
- **Resource management** manages device resources efficiently
- **System integration** integrates devices into the Linux system
- **Hardware abstraction** provides uniform interface to hardware

**How**: Basic platform drivers are implemented through:

```c
// Example: Basic platform driver
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_device.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>
#include <linux/mutex.h>

// Device structure
struct my_platform_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    int id;
    char name[32];
    struct resource *res;
    struct mutex mutex;
    bool is_active;
};

// Device Tree compatible strings
static const struct of_device_id mydevice_of_match[] = {
    { .compatible = "mycompany,mydevice" },
    { .compatible = "mycompany,mydevice-v2" },
    { .compatible = "mycompany,mydevice-v3" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, mydevice_of_match);

// Platform driver probe function
static int mydevice_probe(struct platform_device *pdev) {
    struct my_platform_device *dev;
    struct resource *res;
    int ret;

    printk(KERN_INFO "Probing platform device: %s\n", dev_name(&pdev->dev));

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Initialize device
    dev->dev = &pdev->dev;
    dev->id = pdev->id;
    snprintf(dev->name, sizeof(dev->name), "mydevice%d", dev->id);

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Get memory resource
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!res) {
        printk(KERN_ERR "No memory resource found\n");
        return -ENODEV;
    }

    // Request and map memory
    dev->base = devm_ioremap_resource(&pdev->dev, res);
    if (IS_ERR(dev->base)) {
        printk(KERN_ERR "Failed to map memory resource\n");
        return PTR_ERR(dev->base);
    }

    // Get interrupt resource
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0) {
        printk(KERN_ERR "No interrupt resource found\n");
        return dev->irq;
    }

    // Request interrupt
    ret = devm_request_irq(&pdev->dev, dev->irq, mydevice_irq_handler,
                          IRQF_SHARED, dev->name, dev);
    if (ret) {
        printk(KERN_ERR "Failed to request interrupt: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);

    // Initialize hardware
    ret = mydevice_hw_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize hardware: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Platform device probed successfully: %s\n", dev->name);
    return 0;
}

// Platform driver remove function
static int mydevice_remove(struct platform_device *pdev) {
    struct my_platform_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing platform device: %s\n", dev->name);

    // Cleanup hardware
    mydevice_hw_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);

    printk(KERN_INFO "Platform device removed: %s\n", dev->name);
    return 0;
}

// Interrupt handler
static irqreturn_t mydevice_irq_handler(int irq, void *dev_id) {
    struct my_platform_device *dev = dev_id;

    printk(KERN_INFO "Interrupt received on device: %s\n", dev->name);

    // Handle interrupt
    // ... interrupt handling code ...

    return IRQ_HANDLED;
}

// Hardware initialization
static int mydevice_hw_init(struct my_platform_device *dev) {
    printk(KERN_INFO "Initializing hardware for device: %s\n", dev->name);

    // Initialize hardware registers
    // ... hardware initialization code ...

    dev->is_active = true;

    return 0;
}

// Hardware cleanup
static void mydevice_hw_cleanup(struct my_platform_device *dev) {
    printk(KERN_INFO "Cleaning up hardware for device: %s\n", dev->name);

    // Cleanup hardware
    // ... hardware cleanup code ...

    dev->is_active = false;
}

// Platform driver structure
static struct platform_driver mydevice_driver = {
    .probe = mydevice_probe,
    .remove = mydevice_remove,
    .driver = {
        .name = "mydevice",
        .of_match_table = of_match_ptr(mydevice_of_match),
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init mydevice_init(void) {
    int ret;

    printk(KERN_INFO "Registering platform driver\n");

    ret = platform_driver_register(&mydevice_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Platform driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit mydevice_exit(void) {
    printk(KERN_INFO "Unregistering platform driver\n");

    platform_driver_unregister(&mydevice_driver);

    printk(KERN_INFO "Platform driver unregistered\n");
}

module_init(mydevice_init);
module_exit(mydevice_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A basic platform driver example");
```

**Explanation**:

- **Platform driver** - `platform_driver` structure defines platform driver
- **Device Tree** - `of_device_id` structure matches Device Tree compatible strings
- **Probe/Remove** - `probe` and `remove` functions handle device lifecycle
- **Resource management** - `platform_get_resource` gets device resources
- **Interrupt handling** - `devm_request_irq` requests interrupt resources

**Where**: Basic platform drivers are used in:

- **SoC peripherals** - UART, SPI, I2C, GPIO controllers
- **Memory controllers** - DDR, flash memory controllers
- **Clock controllers** - System clock management
- **Power management** - Power domain controllers
- **Custom hardware** - Application-specific hardware

## Device Tree Integration

**What**: Device Tree integration enables platform drivers to work with Device Tree for device discovery, configuration, and resource management.

**Why**: Device Tree integration is important because:

- **Device discovery** enables automatic device discovery and configuration
- **Hardware description** provides structured description of hardware
- **Configuration** enables hardware-specific configuration parameters
- **Platform independence** allows same kernel to run on different hardware
- **Maintainability** simplifies hardware configuration management

**How**: Device Tree integration is implemented through:

```c
// Example: Device Tree integration
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_device.h>
#include <linux/of_gpio.h>
#include <linux/of_irq.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>

// Device structure
struct my_dt_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    int gpio_pin;
    int id;
    char name[32];
    struct mutex mutex;
    bool is_active;
    u32 clock_frequency;
    u32 data_width;
    bool enable_interrupts;
};

// Device Tree compatible strings
static const struct of_device_id mydtdevice_of_match[] = {
    { .compatible = "mycompany,mydtdevice" },
    { .compatible = "mycompany,mydtdevice-v2" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, mydtdevice_of_match);

// Device Tree property parsing
static int parse_device_tree_properties(struct my_dt_device *dev) {
    struct device_node *node = dev->dev->of_node;
    const char *name;
    u32 value;
    int ret;

    printk(KERN_INFO "Parsing Device Tree properties\n");

    // Get device name
    ret = of_property_read_string(node, "device-name", &name);
    if (ret == 0) {
        strncpy(dev->name, name, sizeof(dev->name) - 1);
        dev->name[sizeof(dev->name) - 1] = '\0';
        printk(KERN_INFO "Device name: %s\n", dev->name);
    }

    // Get device ID
    ret = of_property_read_u32(node, "device-id", &value);
    if (ret == 0) {
        dev->id = value;
        printk(KERN_INFO "Device ID: %d\n", dev->id);
    }

    // Get clock frequency
    ret = of_property_read_u32(node, "clock-frequency", &value);
    if (ret == 0) {
        dev->clock_frequency = value;
        printk(KERN_INFO "Clock frequency: %u Hz\n", dev->clock_frequency);
    }

    // Get data width
    ret = of_property_read_u32(node, "data-width", &value);
    if (ret == 0) {
        dev->data_width = value;
        printk(KERN_INFO "Data width: %u bits\n", dev->data_width);
    }

    // Get interrupt enable flag
    dev->enable_interrupts = of_property_read_bool(node, "enable-interrupts");
    printk(KERN_INFO "Interrupts enabled: %s\n", dev->enable_interrupts ? "Yes" : "No");

    // Get GPIO pin
    dev->gpio_pin = of_get_named_gpio(node, "gpio-pin", 0);
    if (dev->gpio_pin >= 0) {
        printk(KERN_INFO "GPIO pin: %d\n", dev->gpio_pin);
    }

    // Get memory region
    struct resource res;
    ret = of_address_to_resource(node, 0, &res);
    if (ret == 0) {
        printk(KERN_INFO "Memory region: 0x%llx - 0x%llx\n",
               res.start, res.end);
    }

    return 0;
}

// Platform driver probe function
static int mydtdevice_probe(struct platform_device *pdev) {
    struct my_dt_device *dev;
    struct resource *res;
    int ret;

    printk(KERN_INFO "Probing Device Tree device: %s\n", dev_name(&pdev->dev));

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Initialize device
    dev->dev = &pdev->dev;
    dev->id = pdev->id;
    snprintf(dev->name, sizeof(dev->name), "mydtdevice%d", dev->id);

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Parse Device Tree properties
    ret = parse_device_tree_properties(dev);
    if (ret) {
        printk(KERN_ERR "Failed to parse Device Tree properties: %d\n", ret);
        return ret;
    }

    // Get memory resource
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (!res) {
        printk(KERN_ERR "No memory resource found\n");
        return -ENODEV;
    }

    // Request and map memory
    dev->base = devm_ioremap_resource(&pdev->dev, res);
    if (IS_ERR(dev->base)) {
        printk(KERN_ERR "Failed to map memory resource\n");
        return PTR_ERR(dev->base);
    }

    // Get interrupt resource
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0) {
        printk(KERN_ERR "No interrupt resource found\n");
        return dev->irq;
    }

    // Request interrupt if enabled
    if (dev->enable_interrupts) {
        ret = devm_request_irq(&pdev->dev, dev->irq, mydtdevice_irq_handler,
                              IRQF_SHARED, dev->name, dev);
        if (ret) {
            printk(KERN_ERR "Failed to request interrupt: %d\n", ret);
            return ret;
        }
    }

    // Set device data
    platform_set_drvdata(pdev, dev);

    // Initialize hardware
    ret = mydtdevice_hw_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize hardware: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Device Tree device probed successfully: %s\n", dev->name);
    return 0;
}

// Platform driver remove function
static int mydtdevice_remove(struct platform_device *pdev) {
    struct my_dt_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing Device Tree device: %s\n", dev->name);

    // Cleanup hardware
    mydtdevice_hw_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);

    printk(KERN_INFO "Device Tree device removed: %s\n", dev->name);
    return 0;
}

// Interrupt handler
static irqreturn_t mydtdevice_irq_handler(int irq, void *dev_id) {
    struct my_dt_device *dev = dev_id;

    printk(KERN_INFO "Interrupt received on Device Tree device: %s\n", dev->name);

    // Handle interrupt
    // ... interrupt handling code ...

    return IRQ_HANDLED;
}

// Hardware initialization
static int mydtdevice_hw_init(struct my_dt_device *dev) {
    printk(KERN_INFO "Initializing hardware for Device Tree device: %s\n", dev->name);

    // Initialize hardware registers based on Device Tree properties
    // ... hardware initialization code ...

    dev->is_active = true;

    return 0;
}

// Hardware cleanup
static void mydtdevice_hw_cleanup(struct my_dt_device *dev) {
    printk(KERN_INFO "Cleaning up hardware for Device Tree device: %s\n", dev->name);

    // Cleanup hardware
    // ... hardware cleanup code ...

    dev->is_active = false;
}

// Platform driver structure
static struct platform_driver mydtdevice_driver = {
    .probe = mydtdevice_probe,
    .remove = mydtdevice_remove,
    .driver = {
        .name = "mydtdevice",
        .of_match_table = of_match_ptr(mydtdevice_of_match),
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init mydtdevice_init(void) {
    int ret;

    printk(KERN_INFO "Registering Device Tree driver\n");

    ret = platform_driver_register(&mydtdevice_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Device Tree driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit mydtdevice_exit(void) {
    printk(KERN_INFO "Unregistering Device Tree driver\n");

    platform_driver_unregister(&mydtdevice_driver);

    printk(KERN_INFO "Device Tree driver unregistered\n");
}

module_init(mydtdevice_init);
module_exit(mydtdevice_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A Device Tree integration example");
```

**Explanation**:

- **Device Tree parsing** - `of_property_read_*` functions parse Device Tree properties
- **Compatible strings** - `of_device_id` structure matches Device Tree compatible strings
- **Resource management** - `of_address_to_resource` gets memory regions
- **GPIO handling** - `of_get_named_gpio` gets GPIO pin numbers
- **Property types** - Different property types for different data types

**Where**: Device Tree integration is used in:

- **ARM systems** - Most ARM-based embedded systems
- **RISC-V systems** - RISC-V embedded systems
- **MIPS systems** - MIPS-based embedded systems
- **PowerPC systems** - PowerPC embedded systems
- **Custom hardware** - Systems with custom hardware configurations

## Advanced Platform Driver Features

**What**: Advanced platform driver features include power management, runtime PM, device attributes, and sysfs integration.

**Why**: Advanced features are important because:

- **Power management** enables efficient power usage and battery life
- **Runtime PM** provides dynamic power management
- **Device attributes** expose device information and control to user space
- **Sysfs integration** provides user-space interface for device management
- **Professional development** enables professional-grade driver development

**How**: Advanced features are implemented through:

```c
// Example: Advanced platform driver features
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_device.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>
#include <linux/pm.h>
#include <linux/pm_runtime.h>
#include <linux/sysfs.h>
#include <linux/kobject.h>

// Device structure
struct my_advanced_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    int id;
    char name[32];
    struct mutex mutex;
    bool is_active;
    bool is_suspended;
    int power_state;
    int performance_level;
    struct kobject kobj;
};

// Global device instance
static struct my_advanced_device *my_dev;

// Power management operations
static int mydevice_suspend(struct device *dev) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Suspending device: %s\n", mydev->name);

    // Suspend device
    mydev->is_suspended = true;
    mydev->power_state = 0;

    // Save device state
    // ... save state code ...

    return 0;
}

static int mydevice_resume(struct device *dev) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Resuming device: %s\n", mydev->name);

    // Restore device state
    // ... restore state code ...

    mydev->is_suspended = false;
    mydev->power_state = 1;

    return 0;
}

// Runtime PM operations
static int mydevice_runtime_suspend(struct device *dev) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Runtime suspending device: %s\n", mydev->name);

    // Runtime suspend device
    mydev->is_suspended = true;

    return 0;
}

static int mydevice_runtime_resume(struct device *dev) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Runtime resuming device: %s\n", mydev->name);

    // Runtime resume device
    mydev->is_suspended = false;

    return 0;
}

// Device attributes
static ssize_t power_state_show(struct device *dev, struct device_attribute *attr, char *buf) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    return sprintf(buf, "%d\n", mydev->power_state);
}

static ssize_t power_state_store(struct device *dev, struct device_attribute *attr,
                                const char *buf, size_t count) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);
    int state;

    if (kstrtoint(buf, 10, &state) < 0) {
        return -EINVAL;
    }

    if (state < 0 || state > 3) {
        return -EINVAL;
    }

    mydev->power_state = state;

    return count;
}

static ssize_t performance_level_show(struct device *dev, struct device_attribute *attr, char *buf) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);

    return sprintf(buf, "%d\n", mydev->performance_level);
}

static ssize_t performance_level_store(struct device *dev, struct device_attribute *attr,
                                     const char *buf, size_t count) {
    struct my_advanced_device *mydev = dev_get_drvdata(dev);
    int level;

    if (kstrtoint(buf, 10, &level) < 0) {
        return -EINVAL;
    }

    if (level < 0 || level > 10) {
        return -EINVAL;
    }

    mydev->performance_level = level;

    return count;
}

// Device attributes
static DEVICE_ATTR_RW(power_state);
static DEVICE_ATTR_RW(performance_level);

// Attribute group
static struct attribute *mydevice_attrs[] = {
    &dev_attr_power_state.attr,
    &dev_attr_performance_level.attr,
    NULL,
};

static struct attribute_group mydevice_attr_group = {
    .attrs = mydevice_attrs,
};

// Platform driver probe function
static int myadvanceddevice_probe(struct platform_device *pdev) {
    struct my_advanced_device *dev;
    int ret;

    printk(KERN_INFO "Probing advanced platform device: %s\n", dev_name(&pdev->dev));

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Initialize device
    dev->dev = &pdev->dev;
    dev->id = pdev->id;
    snprintf(dev->name, sizeof(dev->name), "myadvanceddevice%d", dev->id);

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Initialize device state
    dev->is_active = true;
    dev->is_suspended = false;
    dev->power_state = 1;
    dev->performance_level = 5;

    // Set device data
    platform_set_drvdata(pdev, dev);

    // Create device attributes
    ret = sysfs_create_group(&pdev->dev.kobj, &mydevice_attr_group);
    if (ret) {
        printk(KERN_ERR "Failed to create device attributes: %d\n", ret);
        return ret;
    }

    // Enable runtime PM
    pm_runtime_enable(&pdev->dev);

    // Initialize hardware
    ret = myadvanceddevice_hw_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize hardware: %d\n", ret);
        sysfs_remove_group(&pdev->dev.kobj, &mydevice_attr_group);
        pm_runtime_disable(&pdev->dev);
        return ret;
    }

    printk(KERN_INFO "Advanced platform device probed successfully: %s\n", dev->name);
    return 0;
}

// Platform driver remove function
static int myadvanceddevice_remove(struct platform_device *pdev) {
    struct my_advanced_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing advanced platform device: %s\n", dev->name);

    // Cleanup hardware
    myadvanceddevice_hw_cleanup(dev);

    // Remove device attributes
    sysfs_remove_group(&pdev->dev.kobj, &mydevice_attr_group);

    // Disable runtime PM
    pm_runtime_disable(&pdev->dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);

    printk(KERN_INFO "Advanced platform device removed: %s\n", dev->name);
    return 0;
}

// Hardware initialization
static int myadvanceddevice_hw_init(struct my_advanced_device *dev) {
    printk(KERN_INFO "Initializing hardware for advanced device: %s\n", dev->name);

    // Initialize hardware registers
    // ... hardware initialization code ...

    return 0;
}

// Hardware cleanup
static void myadvanceddevice_hw_cleanup(struct my_advanced_device *dev) {
    printk(KERN_INFO "Cleaning up hardware for advanced device: %s\n", dev->name);

    // Cleanup hardware
    // ... hardware cleanup code ...
}

// Power management operations
static const struct dev_pm_ops mydevice_pm_ops = {
    .suspend = mydevice_suspend,
    .resume = mydevice_resume,
    .runtime_suspend = mydevice_runtime_suspend,
    .runtime_resume = mydevice_runtime_resume,
};

// Platform driver structure
static struct platform_driver myadvanceddevice_driver = {
    .probe = myadvanceddevice_probe,
    .remove = myadvanceddevice_remove,
    .driver = {
        .name = "myadvanceddevice",
        .pm = &mydevice_pm_ops,
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init myadvanceddevice_init(void) {
    int ret;

    printk(KERN_INFO "Registering advanced platform driver\n");

    ret = platform_driver_register(&myadvanceddevice_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Advanced platform driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit myadvanceddevice_exit(void) {
    printk(KERN_INFO "Unregistering advanced platform driver\n");

    platform_driver_unregister(&myadvanceddevice_driver);

    printk(KERN_INFO "Advanced platform driver unregistered\n");
}

module_init(myadvanceddevice_init);
module_exit(myadvanceddevice_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("An advanced platform driver example");
```

**Explanation**:

- **Power management** - `dev_pm_ops` structure defines power management operations
- **Runtime PM** - `pm_runtime_*` functions provide runtime power management
- **Device attributes** - `DEVICE_ATTR_*` macros create device attributes
- **Sysfs integration** - `sysfs_create_group` creates device attributes
- **Attribute groups** - `attribute_group` organizes device attributes

**Where**: Advanced platform driver features are used in:

- **Professional drivers** - Commercial and production device drivers
- **Power-sensitive devices** - Devices requiring power management
- **User-configurable devices** - Devices with user-configurable parameters
- **System integration** - Drivers integrated into complete systems
- **Advanced embedded systems** - Complex embedded systems with multiple devices

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Platform Driver Understanding** - You understand what platform drivers are and how they work
2. **Basic Implementation** - You know how to create basic platform drivers
3. **Device Tree Integration** - You understand how to integrate with Device Tree
4. **Advanced Features** - You know how to implement advanced platform driver features
5. **Resource Management** - You understand how to manage platform device resources
6. **Power Management** - You know how to implement power management

**Why** these concepts matter:

- **SoC integration** provides the foundation for SoC peripheral drivers
- **Device Tree support** enables modern embedded system development
- **Professional development** prepares you for professional driver development
- **System integration** enables integration into complete systems
- **Hardware abstraction** provides uniform interface to different hardware

**When** to use these concepts:

- **SoC peripheral drivers** - Creating drivers for SoC peripherals
- **Device Tree systems** - Developing for Device Tree-based systems
- **Professional development** - Working in embedded systems industry
- **System integration** - Integrating hardware into complete systems
- **Advanced embedded systems** - Creating complex embedded systems

**Where** these skills apply:

- **Embedded Linux development** - Creating drivers for embedded systems
- **Device driver development** - Developing hardware drivers
- **System programming** - Low-level system development
- **Professional development** - Working in embedded systems
- **Open source contribution** - Contributing to kernel projects

## Next Steps

**What** you're ready for next:

After mastering platform drivers, you should be ready to:

1. **Create complete drivers** - Implement complete device drivers
2. **Integrate with systems** - Integrate drivers into complete systems
3. **Debug complex issues** - Troubleshoot complex driver issues
4. **Optimize performance** - Optimize driver performance
5. **Develop professionally** - Work as a professional driver developer

**Where** to go next:

Continue with the next lesson on **"Device Tree Integration"** to learn:

- How to work with Device Tree
- Device Tree binding and validation
- Advanced Device Tree techniques
- Professional Device Tree development

**Why** the next lesson is important:

The next lesson builds directly on your platform driver knowledge by showing you how to work with Device Tree. You'll learn essential skills for modern embedded system development.

**How** to continue learning:

1. **Study kernel source** - Examine Linux kernel source code
2. **Practice with examples** - Work through kernel programming examples
3. **Read documentation** - Explore kernel documentation and guides
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start creating your own device drivers

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/) - Comprehensive kernel documentation
- [Linux Device Drivers](https://lwn.net/Kernel/LDD3/) - Driver development guide
- [Kernel Newbies](https://kernelnewbies.org/) - Learning resources for kernel development

**Community Resources**:

- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A
- [Reddit r/kernel](https://reddit.com/r/kernel) - Community discussions

**Learning Resources**:

- [Understanding the Linux Kernel](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Comprehensive kernel guide
- [Professional Linux Kernel Architecture](https://www.oreilly.com/library/view/professional-linux-kernel/9780470343432/) - Advanced kernel concepts
- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel programming guide

Happy learning! 🐧
