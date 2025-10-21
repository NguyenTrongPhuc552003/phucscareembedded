---
sidebar_position: 2
---

# Device Tree Integration

Master device tree integration and understand how to use device trees for hardware discovery and configuration in platform drivers for Rock 5B+ ARM64 systems.

## What is Device Tree Integration?

**What**: Device tree integration is the process of using device trees to describe hardware and configure platform drivers.

**Why**: Understanding device tree integration is crucial because:

- **Hardware discovery** - Discover hardware automatically
- **Configuration** - Configure hardware parameters
- **Platform abstraction** - Abstract platform-specific details
- **Driver binding** - Bind drivers to hardware
- **Embedded development** - Essential for embedded Linux development

**When**: Device tree integration is used when:

- **Hardware description** - When describing hardware
- **Driver development** - When developing platform drivers
- **System configuration** - When configuring systems
- **Embedded systems** - When developing embedded systems
- **Rock 5B+** - When developing for Rock 5B+ platform

**How**: Device tree integration works through:

```c
// Example: Device tree integration
#include <linux/of.h>
#include <linux/of_device.h>
#include <linux/of_gpio.h>
#include <linux/of_irq.h>

// Device tree match table
static const struct of_device_id my_device_of_match[] = {
    { .compatible = "mycompany,my-device" },
    { .compatible = "mycompany,my-device-v2" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, my_device_of_match);

// Platform driver with device tree support
static struct platform_driver my_platform_driver = {
    .probe = my_platform_probe,
    .remove = my_platform_remove,
    .driver = {
        .name = "my-platform-device",
        .of_match_table = my_device_of_match,
        .owner = THIS_MODULE,
    },
};

// Device tree parsing
static int my_platform_probe(struct platform_device *pdev)
{
    struct device_node *np = pdev->dev.of_node;
    struct my_platform_device *dev;
    int ret;

    // Parse device tree properties
    ret = my_parse_device_tree(np);
    if (ret < 0) {
        printk(KERN_ERR "Device tree parsing failed\n");
        return ret;
    }

    // Initialize device
    ret = my_platform_device_init(dev);
    if (ret < 0) {
        printk(KERN_ERR "Device initialization failed\n");
        return ret;
    }

    return 0;
}
```

**Where**: Device tree integration is essential in:

- **All embedded systems** - IoT and industrial devices
- **Driver development** - Platform driver development
- **System programming** - System-level programming
- **ARM64 systems** - ARM64 embedded development
- **Rock 5B+** - ARM64 embedded development

## Device Tree Parsing

**What**: Device tree parsing involves reading and interpreting device tree properties to configure hardware.

**Why**: Understanding device tree parsing is important because:

- **Hardware configuration** - Configure hardware parameters
- **Resource discovery** - Discover hardware resources
- **Driver binding** - Bind drivers to hardware
- **Error handling** - Handle parsing errors
- **System integration** - Integrate with system

**How**: Device tree parsing works through:

```c
// Example: Device tree parsing
static int my_parse_device_tree(struct device_node *np)
{
    const char *compatible;
    int ret;
    int val;
    const char *str;
    struct property *prop;

    // Get compatible string
    compatible = of_get_property(np, "compatible", NULL);
    if (!compatible) {
        printk(KERN_ERR "No compatible string found\n");
        return -EINVAL;
    }
    printk(KERN_INFO "Device compatible: %s\n", compatible);

    // Parse integer properties
    ret = of_property_read_u32(np, "clock-frequency", &val);
    if (ret == 0) {
        printk(KERN_INFO "Clock frequency: %d Hz\n", val);
    }

    ret = of_property_read_u32(np, "voltage-level", &val);
    if (ret == 0) {
        printk(KERN_INFO "Voltage level: %d mV\n", val);
    }

    // Parse string properties
    ret = of_property_read_string(np, "device-name", &str);
    if (ret == 0) {
        printk(KERN_INFO "Device name: %s\n", str);
    }

    // Parse boolean properties
    if (of_property_read_bool(np, "enable-interrupts")) {
        printk(KERN_INFO "Interrupts enabled\n");
    }

    if (of_property_read_bool(np, "enable-dma")) {
        printk(KERN_INFO "DMA enabled\n");
    }

    // Parse array properties
    ret = of_property_read_u32_array(np, "gpio-pins", my_gpio_pins, MAX_GPIO_PINS);
    if (ret > 0) {
        printk(KERN_INFO "GPIO pins: %d pins\n", ret);
    }

    // Parse child nodes
    for_each_child_of_node(np, child) {
        printk(KERN_INFO "Child node: %s\n", child->name);
        ret = my_parse_child_node(child);
        if (ret < 0) {
            of_node_put(child);
            return ret;
        }
    }

    return 0;
}

// Parse child nodes
static int my_parse_child_node(struct device_node *np)
{
    const char *name;
    int ret;
    int val;

    name = of_node_get_name(np);
    printk(KERN_INFO "Parsing child node: %s\n", name);

    // Parse child node properties
    ret = of_property_read_u32(np, "child-value", &val);
    if (ret == 0) {
        printk(KERN_INFO "Child value: %d\n", val);
    }

    of_node_put(np);
    return 0;
}
```

**Explanation**:

- **Compatible string** - Get device compatible string
- **Integer properties** - Parse integer properties
- **String properties** - Parse string properties
- **Boolean properties** - Parse boolean properties
- **Array properties** - Parse array properties

**Where**: Device tree parsing is used in:

- **All platform drivers** - Every platform driver can use device tree
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Hardware Resource Mapping

**What**: Hardware resource mapping involves mapping device tree resources to kernel resources.

**Why**: Understanding resource mapping is important because:

- **Resource allocation** - Allocate hardware resources
- **Memory mapping** - Map memory regions
- **IRQ handling** - Handle IRQ resources
- **GPIO management** - Manage GPIO resources
- **Error handling** - Handle resource errors

**How**: Resource mapping works through:

```c
// Example: Hardware resource mapping
static int my_map_hardware_resources(struct platform_device *pdev, struct my_platform_device *dev)
{
    struct device_node *np = pdev->dev.of_node;
    struct resource *res;
    int ret;
    int irq;
    int gpio;

    // Map memory resources
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (res) {
        dev->regs = devm_ioremap_resource(&pdev->dev, res);
        if (IS_ERR(dev->regs)) {
            printk(KERN_ERR "Failed to map memory resource\n");
            return PTR_ERR(dev->regs);
        }
        printk(KERN_INFO "Memory resource mapped at %p\n", dev->regs);
    }

    // Map IRQ resources
    irq = platform_get_irq(pdev, 0);
    if (irq > 0) {
        dev->irq = irq;
        ret = devm_request_irq(&pdev->dev, irq, my_irq_handler, IRQF_SHARED, pdev->name, dev);
        if (ret < 0) {
            printk(KERN_ERR "Failed to request IRQ %d\n", irq);
            return ret;
        }
        printk(KERN_INFO "IRQ %d mapped successfully\n", irq);
    }

    // Map GPIO resources
    gpio = of_get_named_gpio(np, "gpio-pin", 0);
    if (gpio >= 0) {
        dev->gpio_pin = gpio;
        ret = devm_gpio_request(&pdev->dev, gpio, "my-device-gpio");
        if (ret < 0) {
            printk(KERN_ERR "Failed to request GPIO %d\n", gpio);
            return ret;
        }
        printk(KERN_INFO "GPIO %d mapped successfully\n", gpio);
    }

    // Map clock resources
    dev->clk = devm_clk_get(&pdev->dev, NULL);
    if (IS_ERR(dev->clk)) {
        printk(KERN_WARNING "No clock resource found\n");
        dev->clk = NULL;
    } else {
        ret = clk_prepare_enable(dev->clk);
        if (ret < 0) {
            printk(KERN_ERR "Failed to enable clock\n");
            return ret;
        }
        printk(KERN_INFO "Clock enabled successfully\n");
    }

    // Map regulator resources
    dev->regulator = devm_regulator_get(&pdev->dev, "vdd");
    if (IS_ERR(dev->regulator)) {
        printk(KERN_WARNING "No regulator resource found\n");
        dev->regulator = NULL;
    } else {
        ret = regulator_enable(dev->regulator);
        if (ret < 0) {
            printk(KERN_ERR "Failed to enable regulator\n");
            return ret;
        }
        printk(KERN_INFO "Regulator enabled successfully\n");
    }

    return 0;
}
```

**Explanation**:

- **Memory mapping** - Map memory regions
- **IRQ mapping** - Map IRQ resources
- **GPIO mapping** - Map GPIO resources
- **Clock mapping** - Map clock resources
- **Regulator mapping** - Map regulator resources

**Where**: Resource mapping is used in:

- **All platform drivers** - Every platform driver needs resource mapping
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Device Tree Properties

**What**: Device tree properties define hardware configuration parameters.

**Why**: Understanding device tree properties is important because:

- **Hardware configuration** - Configure hardware parameters
- **Driver binding** - Bind drivers to hardware
- **System integration** - Integrate with system
- **Error handling** - Handle property errors
- **Documentation** - Document hardware configuration

**How**: Device tree properties work through:

```c
// Example: Device tree properties
// Device tree node example
/*
my-device@10000000 {
    compatible = "mycompany,my-device";
    reg = <0x10000000 0x1000>;
    interrupts = <0 10 4>;
    gpio-pin = <&gpio0 18 0>;
    clock-frequency = <100000000>;
    voltage-level = <3300>;
    device-name = "my-device";
    enable-interrupts;
    enable-dma;
    gpio-pins = <18 19 20 21>;

    child-device {
        compatible = "mycompany,child-device";
        child-value = <42>;
    };
};
*/

// Parse device tree properties
static int my_parse_device_tree_properties(struct device_node *np)
{
    const char *compatible;
    const char *device_name;
    int clock_frequency;
    int voltage_level;
    int gpio_pin;
    int gpio_pins[4];
    int num_gpio_pins;
    bool enable_interrupts;
    bool enable_dma;
    int ret;

    // Parse compatible string
    compatible = of_get_property(np, "compatible", NULL);
    if (!compatible) {
        printk(KERN_ERR "No compatible string found\n");
        return -EINVAL;
    }
    printk(KERN_INFO "Device compatible: %s\n", compatible);

    // Parse device name
    ret = of_property_read_string(np, "device-name", &device_name);
    if (ret == 0) {
        printk(KERN_INFO "Device name: %s\n", device_name);
    }

    // Parse clock frequency
    ret = of_property_read_u32(np, "clock-frequency", &clock_frequency);
    if (ret == 0) {
        printk(KERN_INFO "Clock frequency: %d Hz\n", clock_frequency);
    }

    // Parse voltage level
    ret = of_property_read_u32(np, "voltage-level", &voltage_level);
    if (ret == 0) {
        printk(KERN_INFO "Voltage level: %d mV\n", voltage_level);
    }

    // Parse GPIO pin
    ret = of_property_read_u32(np, "gpio-pin", &gpio_pin);
    if (ret == 0) {
        printk(KERN_INFO "GPIO pin: %d\n", gpio_pin);
    }

    // Parse GPIO pins array
    num_gpio_pins = of_property_read_u32_array(np, "gpio-pins", gpio_pins, 4);
    if (num_gpio_pins > 0) {
        printk(KERN_INFO "GPIO pins: %d pins\n", num_gpio_pins);
        for (int i = 0; i < num_gpio_pins; i++) {
            printk(KERN_INFO "  GPIO pin %d: %d\n", i, gpio_pins[i]);
        }
    }

    // Parse boolean properties
    enable_interrupts = of_property_read_bool(np, "enable-interrupts");
    if (enable_interrupts) {
        printk(KERN_INFO "Interrupts enabled\n");
    }

    enable_dma = of_property_read_bool(np, "enable-dma");
    if (enable_dma) {
        printk(KERN_INFO "DMA enabled\n");
    }

    return 0;
}
```

**Explanation**:

- **Compatible string** - Device compatible string
- **Device name** - Device name property
- **Clock frequency** - Clock frequency property
- **Voltage level** - Voltage level property
- **GPIO pins** - GPIO pin properties

**Where**: Device tree properties are used in:

- **All platform drivers** - Every platform driver can use properties
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## Device Tree Overlays

**What**: Device tree overlays allow dynamic modification of device tree at runtime.

**Why**: Understanding device tree overlays is important because:

- **Dynamic configuration** - Configure hardware dynamically
- **Runtime modification** - Modify device tree at runtime
- **Hardware flexibility** - Provide hardware flexibility
- **System adaptation** - Adapt system to hardware changes
- **Development efficiency** - Improve development efficiency

**How**: Device tree overlays work through:

```c
// Example: Device tree overlay support
// Device tree overlay structure
struct my_device_overlay {
    struct device_node *overlay_node;
    struct device_node *target_node;
    struct property *overlay_properties;
    int overlay_count;
};

// Apply device tree overlay
static int my_apply_device_tree_overlay(struct device_node *overlay_node)
{
    struct device_node *target_node;
    struct property *prop;
    int ret;

    // Find target node
    target_node = of_find_node_by_path("/my-device");
    if (!target_node) {
        printk(KERN_ERR "Target node not found\n");
        return -ENODEV;
    }

    // Apply overlay properties
    for_each_property_of_node(overlay_node, prop) {
        ret = of_property_notify(OF_RECONFIG_ADD_PROPERTY, target_node, prop);
        if (ret < 0) {
            printk(KERN_ERR "Failed to apply overlay property: %s\n", prop->name);
            of_node_put(target_node);
            return ret;
        }
    }

    of_node_put(target_node);
    printk(KERN_INFO "Device tree overlay applied successfully\n");
    return 0;
}

// Remove device tree overlay
static int my_remove_device_tree_overlay(struct device_node *overlay_node)
{
    struct device_node *target_node;
    struct property *prop;
    int ret;

    // Find target node
    target_node = of_find_node_by_path("/my-device");
    if (!target_node) {
        printk(KERN_ERR "Target node not found\n");
        return -ENODEV;
    }

    // Remove overlay properties
    for_each_property_of_node(overlay_node, prop) {
        ret = of_property_notify(OF_RECONFIG_REMOVE_PROPERTY, target_node, prop);
        if (ret < 0) {
            printk(KERN_ERR "Failed to remove overlay property: %s\n", prop->name);
            of_node_put(target_node);
            return ret;
        }
    }

    of_node_put(target_node);
    printk(KERN_INFO "Device tree overlay removed successfully\n");
    return 0;
}
```

**Explanation**:

- **Overlay application** - Apply device tree overlays
- **Property modification** - Modify device tree properties
- **Node management** - Manage device tree nodes
- **Overlay removal** - Remove device tree overlays
- **Error handling** - Handle overlay errors

**Where**: Device tree overlays are used in:

- **Dynamic systems** - Systems requiring dynamic configuration
- **Driver development** - Platform driver development
- **System modules** - System-level platform devices
- **Embedded modules** - Embedded platform devices
- **Rock 5B+** - ARM64 embedded devices

## ARM64 Specific Considerations

**What**: ARM64 specific considerations address unique aspects of ARM64 architecture device tree integration.

**Why**: Understanding ARM64 considerations is important because:

- **Architecture differences** - ARM64 has different requirements
- **Memory model** - ARM64 specific memory considerations
- **Performance characteristics** - ARM64 specific performance
- **Hardware features** - ARM64 specific hardware capabilities
- **Real-world application** - Practical ARM64 development

**How**: ARM64 considerations involve:

```c
// Example: ARM64 specific device tree integration
// ARM64 device tree parsing
static int arm64_parse_device_tree(struct device_node *np)
{
    const char *compatible;
    int ret;
    int val;

    // Get compatible string
    compatible = of_get_property(np, "compatible", NULL);
    if (!compatible) {
        printk(KERN_ERR "No compatible string found\n");
        return -EINVAL;
    }

    // Check for ARM64 specific properties
    if (strstr(compatible, "arm64")) {
        printk(KERN_INFO "ARM64 device detected\n");

        // Parse ARM64 specific properties
        ret = of_property_read_u32(np, "arm64-cache-line-size", &val);
        if (ret == 0) {
            printk(KERN_INFO "ARM64 cache line size: %d\n", val);
        }

        ret = of_property_read_u32(np, "arm64-memory-barriers", &val);
        if (ret == 0) {
            printk(KERN_INFO "ARM64 memory barriers: %d\n", val);
        }
    }

    return 0;
}

// ARM64 specific resource mapping
static int arm64_map_hardware_resources(struct platform_device *pdev, struct my_platform_device *dev)
{
    struct device_node *np = pdev->dev.of_node;
    struct resource *res;
    int ret;

    // Map memory resources with ARM64 considerations
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (res) {
        dev->regs = devm_ioremap_resource(&pdev->dev, res);
        if (IS_ERR(dev->regs)) {
            printk(KERN_ERR "Failed to map memory resource\n");
            return PTR_ERR(dev->regs);
        }

        // ARM64 specific cache operations
        flush_cache_range(dev->regs, dev->regs + resource_size(res));
        invalidate_icache_range(dev->regs, dev->regs + resource_size(res));
    }

    return 0;
}
```

**Explanation**:

- **ARM64 detection** - Detect ARM64 specific devices
- **Cache operations** - ARM64 cache coherency protocols
- **Memory barriers** - ARM64 memory ordering considerations
- **Performance** - ARM64 specific performance considerations
- **Hardware features** - Utilizing ARM64 capabilities

**Where**: ARM64 considerations are important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **Mobile devices** - Smartphones and tablets
- **Server systems** - ARM64 servers and workstations
- **Rock 5B+** - ARM64 single-board computer

## Rock 5B+ Device Tree Development

**What**: Rock 5B+ specific device tree development addresses unique aspects of the Rock 5B+ platform.

**Why**: Understanding Rock 5B+ development is important because:

- **Platform specifics** - Rock 5B+ has unique requirements
- **RK3588 SoC** - Specific SoC features and limitations
- **Embedded nature** - Resource-constrained environment
- **Real-world application** - Practical embedded development
- **Hardware integration** - Platform-specific hardware

**How**: Rock 5B+ development involves:

```c
// Example: Rock 5B+ specific device tree development
// Rock 5B+ device tree match table
static const struct of_device_id rock5b_device_of_match[] = {
    { .compatible = "radxa,rock-5b-plus" },
    { .compatible = "radxa,rock-5b-plus-gpio" },
    { .compatible = "radxa,rock-5b-plus-uart" },
    { .compatible = "radxa,rock-5b-plus-i2c" },
    { .compatible = "radxa,rock-5b-plus-spi" },
    { /* sentinel */ }
};
MODULE_DEVICE_TABLE(of, rock5b_device_of_match);

// Rock 5B+ specific device tree parsing
static int rock5b_parse_device_tree(struct device_node *np)
{
    const char *compatible;
    int ret;
    int val;

    // Get compatible string
    compatible = of_get_property(np, "compatible", NULL);
    if (!compatible) {
        printk(KERN_ERR "No compatible string found\n");
        return -EINVAL;
    }

    // Check for Rock 5B+ specific properties
    if (strstr(compatible, "rock-5b-plus")) {
        printk(KERN_INFO "Rock 5B+ device detected\n");

        // Parse Rock 5B+ specific properties
        ret = of_property_read_u32(np, "rock5b-gpio-pin", &val);
        if (ret == 0) {
            printk(KERN_INFO "Rock 5B+ GPIO pin: %d\n", val);
        }

        ret = of_property_read_u32(np, "rock5b-clock-frequency", &val);
        if (ret == 0) {
            printk(KERN_INFO "Rock 5B+ clock frequency: %d Hz\n", val);
        }

        ret = of_property_read_u32(np, "rock5b-voltage-level", &val);
        if (ret == 0) {
            printk(KERN_INFO "Rock 5B+ voltage level: %d mV\n", val);
        }
    }

    return 0;
}

// Rock 5B+ specific resource mapping
static int rock5b_map_hardware_resources(struct platform_device *pdev, struct my_platform_device *dev)
{
    struct device_node *np = pdev->dev.of_node;
    struct resource *res;
    int ret;

    // Map Rock 5B+ specific resources
    res = platform_get_resource(pdev, IORESOURCE_MEM, 0);
    if (res) {
        dev->regs = devm_ioremap_resource(&pdev->dev, res);
        if (IS_ERR(dev->regs)) {
            printk(KERN_ERR "Failed to map Rock 5B+ memory resource\n");
            return PTR_ERR(dev->regs);
        }
        printk(KERN_INFO "Rock 5B+ memory resource mapped at %p\n", dev->regs);
    }

    // Map Rock 5B+ GPIO resources
    dev->gpio_pin = of_get_named_gpio(np, "rock5b-gpio-pin", 0);
    if (dev->gpio_pin >= 0) {
        ret = devm_gpio_request(&pdev->dev, dev->gpio_pin, "rock5b-gpio");
        if (ret < 0) {
            printk(KERN_ERR "Failed to request Rock 5B+ GPIO %d\n", dev->gpio_pin);
            return ret;
        }
        printk(KERN_INFO "Rock 5B+ GPIO %d mapped successfully\n", dev->gpio_pin);
    }

    return 0;
}
```

**Explanation**:

- **Rock 5B+ detection** - Detect Rock 5B+ specific devices
- **GPIO mapping** - Rock 5B+ GPIO resource mapping
- **Clock management** - Rock 5B+ clock resource management
- **Voltage control** - Rock 5B+ voltage level control
- **Hardware integration** - Rock 5B+ hardware integration

**Where**: Rock 5B+ development is important in:

- **Embedded development** - Learning practical embedded development
- **ARM64 systems** - Understanding ARM64 development
- **Single-board computers** - SBC development
- **Real-time systems** - Real-time Linux development
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Device Tree Understanding** - You understand device tree integration
2. **Tree Parsing** - You know how to parse device trees
3. **Resource Mapping** - You understand hardware resource mapping
4. **Property Handling** - You know how to handle device tree properties
5. **Overlay Support** - You understand device tree overlays
6. **Platform Specifics** - You know ARM64 and Rock 5B+ considerations

**Why** these concepts matter:

- **Hardware discovery** - Essential for hardware discovery
- **Driver binding** - Important for driver binding
- **System configuration** - Critical for system configuration
- **Embedded development** - Valuable for embedded Linux development
- **Professional development** - Valuable skill for kernel developers

**When** to use these concepts:

- **Platform driver development** - When creating platform drivers
- **System programming** - When writing system-level software
- **Embedded development** - When developing embedded systems
- **Hardware configuration** - When configuring hardware
- **Learning** - When learning kernel development

**Where** these skills apply:

- **Kernel development** - Creating device tree integration
- **Driver development** - Platform driver development
- **System programming** - System-level programming
- **Embedded development** - Embedded Linux development
- **Professional development** - Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering device tree integration, you should be ready to:

1. **Learn PCI/USB drivers** - Learn PCI and USB driver development
2. **Begin advanced topics** - Learn advanced driver concepts
3. **Explore DMA operations** - Learn DMA operations
4. **Study interrupt handling** - Learn interrupt handling
5. **Begin real-time drivers** - Learn real-time driver development

**Where** to go next:

Continue with the next lesson on **"PCI/USB Drivers"** to learn:

- How to create PCI and USB drivers
- Bus driver development
- Device enumeration and management
- Advanced driver concepts

**Why** the next lesson is important:

The next lesson builds on your platform device knowledge by teaching you how to create PCI and USB drivers. You'll learn how to work with different bus types and device enumeration.

**How** to continue learning:

1. **Practice device tree development** - Create device tree integration
2. **Study driver examples** - Examine existing platform drivers
3. **Read documentation** - Study device tree documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple device tree projects

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Device Trees](https://www.kernel.org/doc/html/latest/devicetree/) - Device tree documentation
- [Platform Devices](https://www.kernel.org/doc/html/latest/driver-api/) - Platform device documentation

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
