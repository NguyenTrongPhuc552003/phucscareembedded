---
sidebar_position: 3
---

# Driver Registration and Lifecycle

Learn how to register device drivers with the Linux kernel and manage their lifecycle from initialization to cleanup.

## What is Driver Registration?

**What**: Driver registration is the process of registering device drivers with the Linux kernel so they can be discovered, loaded, and used by the system.

**Why**: Driver registration is important because:

- **Device discovery** enables automatic detection of hardware devices
- **Driver management** provides mechanisms for loading and unloading drivers
- **System integration** integrates drivers into the Linux device model
- **Resource management** manages driver resources and dependencies
- **User-space interface** provides user-space access to devices

**When**: Driver registration is used when:

- **Developing device drivers** for new hardware peripherals
- **Creating platform drivers** for SoC peripherals
- **Implementing bus drivers** for different bus types
- **Building driver frameworks** for similar devices
- **Integrating hardware** into the Linux system

**How**: Driver registration works by:

- **Registering with kernel** using driver registration functions
- **Matching devices** using device matching mechanisms
- **Handling probe/remove** managing driver lifecycle
- **Managing resources** allocating and freeing driver resources
- **Providing interfaces** exposing driver functionality to user space

**Where**: Driver registration is used in:

- **Platform drivers** - SoC peripherals and on-chip devices
- **PCI drivers** - PCI and PCIe devices
- **USB drivers** - USB peripherals and interfaces
- **I2C/SPI drivers** - Serial communication devices
- **GPIO drivers** - General purpose input/output devices

## Platform Driver Registration

**What**: Platform drivers are used for devices that are part of the system-on-chip (SoC) and are not discoverable through standard bus mechanisms.

**Why**: Platform drivers are important because:

- **SoC integration** provides drivers for SoC peripherals
- **Device tree support** enables Device Tree-based device discovery
- **Resource management** manages platform device resources
- **System initialization** integrates devices into system startup
- **Hardware abstraction** provides uniform interface to platform devices

**How**: Platform driver registration is implemented through:

```c
// Example: Platform driver registration
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/of.h>
#include <linux/of_device.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>

// Device structure
struct my_platform_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    int id;
    char name[32];
    struct resource *res;
    struct mutex mutex;
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

    return 0;
}

// Hardware cleanup
static void mydevice_hw_cleanup(struct my_platform_device *dev) {
    printk(KERN_INFO "Cleaning up hardware for device: %s\n", dev->name);

    // Cleanup hardware
    // ... hardware cleanup code ...
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
MODULE_DESCRIPTION("A platform driver example");
```

**Explanation**:

- **Platform driver** - `platform_driver` structure defines platform driver
- **Device Tree** - `of_device_id` structure matches Device Tree compatible strings
- **Probe/Remove** - `probe` and `remove` functions handle driver lifecycle
- **Resource management** - `platform_get_resource` gets device resources
- **Interrupt handling** - `devm_request_irq` requests interrupt resources

**Where**: Platform drivers are used in:

- **SoC peripherals** - UART, SPI, I2C, GPIO controllers
- **Memory controllers** - DDR, flash memory controllers
- **Clock controllers** - System clock management
- **Power management** - Power domain controllers
- **Custom hardware** - Application-specific hardware

## PCI Driver Registration

**What**: PCI drivers are used for devices that are connected through the PCI or PCIe bus.

**Why**: PCI drivers are important because:

- **Bus discovery** enables automatic device discovery
- **Resource management** manages PCI device resources
- **Hot-plug support** supports hot-pluggable devices
- **Standard interface** provides standard PCI driver interface
- **Hardware abstraction** provides uniform interface to PCI devices

**How**: PCI driver registration is implemented through:

```c
// Example: PCI driver registration
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/pci.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>

// Device structure
struct my_pci_device {
    struct pci_dev *pdev;
    void __iomem *bar0;
    void __iomem *bar1;
    int irq;
    int id;
    char name[32];
    struct mutex mutex;
};

// PCI device ID table
static const struct pci_device_id mypci_ids[] = {
    { PCI_DEVICE(0x1234, 0x5678) },
    { PCI_DEVICE(0x1234, 0x5679) },
    { PCI_DEVICE(0x1234, 0x567a) },
    { 0, }
};
MODULE_DEVICE_TABLE(pci, mypci_ids);

// PCI driver probe function
static int mypci_probe(struct pci_dev *pdev, const struct pci_device_id *id) {
    struct my_pci_device *dev;
    int ret;

    printk(KERN_INFO "Probing PCI device: %s\n", pci_name(pdev));

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    // Initialize device
    dev->pdev = pdev;
    dev->id = pdev->device;
    snprintf(dev->name, sizeof(dev->name), "mypci%d", dev->id);

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Enable PCI device
    ret = pci_enable_device(pdev);
    if (ret) {
        printk(KERN_ERR "Failed to enable PCI device: %d\n", ret);
        return ret;
    }

    // Request PCI resources
    ret = pci_request_regions(pdev, "mypci");
    if (ret) {
        printk(KERN_ERR "Failed to request PCI regions: %d\n", ret);
        pci_disable_device(pdev);
        return ret;
    }

    // Map BAR0
    dev->bar0 = pci_iomap(pdev, 0, 0);
    if (!dev->bar0) {
        printk(KERN_ERR "Failed to map BAR0\n");
        pci_release_regions(pdev);
        pci_disable_device(pdev);
        return -ENOMEM;
    }

    // Map BAR1
    dev->bar1 = pci_iomap(pdev, 1, 0);
    if (!dev->bar1) {
        printk(KERN_ERR "Failed to map BAR1\n");
        pci_iounmap(pdev, dev->bar0);
        pci_release_regions(pdev);
        pci_disable_device(pdev);
        return -ENOMEM;
    }

    // Get interrupt
    dev->irq = pdev->irq;

    // Request interrupt
    ret = devm_request_irq(&pdev->dev, dev->irq, mypci_irq_handler,
                          IRQF_SHARED, dev->name, dev);
    if (ret) {
        printk(KERN_ERR "Failed to request interrupt: %d\n", ret);
        pci_iounmap(pdev, dev->bar1);
        pci_iounmap(pdev, dev->bar0);
        pci_release_regions(pdev);
        pci_disable_device(pdev);
        return ret;
    }

    // Set device data
    pci_set_drvdata(pdev, dev);

    // Initialize hardware
    ret = mypci_hw_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize hardware: %d\n", ret);
        pci_iounmap(pdev, dev->bar1);
        pci_iounmap(pdev, dev->bar0);
        pci_release_regions(pdev);
        pci_disable_device(pdev);
        return ret;
    }

    printk(KERN_INFO "PCI device probed successfully: %s\n", dev->name);
    return 0;
}

// PCI driver remove function
static void mypci_remove(struct pci_dev *pdev) {
    struct my_pci_device *dev = pci_get_drvdata(pdev);

    printk(KERN_INFO "Removing PCI device: %s\n", dev->name);

    // Cleanup hardware
    mypci_hw_cleanup(dev);

    // Unmap BARs
    pci_iounmap(pdev, dev->bar1);
    pci_iounmap(pdev, dev->bar0);

    // Release PCI regions
    pci_release_regions(pdev);

    // Disable PCI device
    pci_disable_device(pdev);

    // Clear device data
    pci_set_drvdata(pdev, NULL);

    printk(KERN_INFO "PCI device removed: %s\n", dev->name);
}

// Interrupt handler
static irqreturn_t mypci_irq_handler(int irq, void *dev_id) {
    struct my_pci_device *dev = dev_id;

    printk(KERN_INFO "Interrupt received on PCI device: %s\n", dev->name);

    // Handle interrupt
    // ... interrupt handling code ...

    return IRQ_HANDLED;
}

// Hardware initialization
static int mypci_hw_init(struct my_pci_device *dev) {
    printk(KERN_INFO "Initializing hardware for PCI device: %s\n", dev->name);

    // Initialize hardware registers
    // ... hardware initialization code ...

    return 0;
}

// Hardware cleanup
static void mypci_hw_cleanup(struct my_pci_device *dev) {
    printk(KERN_INFO "Cleaning up hardware for PCI device: %s\n", dev->name);

    // Cleanup hardware
    // ... hardware cleanup code ...
}

// PCI driver structure
static struct pci_driver mypci_driver = {
    .name = "mypci",
    .id_table = mypci_ids,
    .probe = mypci_probe,
    .remove = mypci_remove,
};

// Module initialization
static int __init mypci_init(void) {
    int ret;

    printk(KERN_INFO "Registering PCI driver\n");

    ret = pci_register_driver(&mypci_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register PCI driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "PCI driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit mypci_exit(void) {
    printk(KERN_INFO "Unregistering PCI driver\n");

    pci_unregister_driver(&mypci_driver);

    printk(KERN_INFO "PCI driver unregistered\n");
}

module_init(mypci_init);
module_exit(mypci_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A PCI driver example");
```

**Explanation**:

- **PCI driver** - `pci_driver` structure defines PCI driver
- **Device ID table** - `pci_device_id` structure matches PCI devices
- **Resource management** - `pci_request_regions` requests PCI resources
- **Memory mapping** - `pci_iomap` maps PCI memory regions
- **Interrupt handling** - `devm_request_irq` requests interrupt resources

**Where**: PCI drivers are used in:

- **Network cards** - Ethernet and wireless network adapters
- **Graphics cards** - Video and graphics adapters
- **Storage controllers** - SATA, SAS, NVMe controllers
- **Audio cards** - Sound and audio adapters
- **Custom PCI devices** - Application-specific PCI hardware

## Driver Lifecycle Management

**What**: Driver lifecycle management involves handling the complete lifecycle of device drivers from initialization to cleanup.

**Why**: Lifecycle management is important because:

- **Resource management** ensures proper allocation and cleanup of resources
- **Error handling** provides mechanisms for handling failures
- **System stability** prevents resource leaks and system instability
- **Hot-plug support** enables dynamic device addition and removal
- **Power management** handles device power states

**How**: Lifecycle management is implemented through:

```c
// Example: Driver lifecycle management
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/platform_device.h>
#include <linux/device.h>
#include <linux/io.h>
#include <linux/interrupt.h>
#include <linux/pm.h>

// Device structure
struct my_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    int id;
    char name[32];
    struct mutex mutex;
    struct work_struct work;
    struct delayed_work delayed_work;
    struct timer_list timer;
    struct completion completion;
    atomic_t ref_count;
    bool is_active;
};

// Global device list
static LIST_HEAD(device_list);
static DEFINE_MUTEX(device_list_mutex);

// Device initialization
static int mydevice_init_device(struct my_device *dev) {
    printk(KERN_INFO "Initializing device: %s\n", dev->name);

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Initialize work queue
    INIT_WORK(&dev->work, mydevice_work_handler);
    INIT_DELAYED_WORK(&dev->delayed_work, mydevice_delayed_work_handler);

    // Initialize timer
    timer_setup(&dev->timer, mydevice_timer_handler, 0);

    // Initialize completion
    init_completion(&dev->completion);

    // Initialize atomic counter
    atomic_set(&dev->ref_count, 0);

    // Set device as active
    dev->is_active = true;

    return 0;
}

// Device cleanup
static void mydevice_cleanup_device(struct my_device *dev) {
    printk(KERN_INFO "Cleaning up device: %s\n", dev->name);

    // Set device as inactive
    dev->is_active = false;

    // Wait for all references to be released
    wait_for_completion(&dev->completion);

    // Cancel work
    cancel_work_sync(&dev->work);
    cancel_delayed_work_sync(&dev->delayed_work);

    // Delete timer
    del_timer_sync(&dev->timer);

    // Cleanup hardware
    mydevice_hw_cleanup(dev);
}

// Work handler
static void mydevice_work_handler(struct work_struct *work) {
    struct my_device *dev = container_of(work, struct my_device, work);

    printk(KERN_INFO "Work handler for device: %s\n", dev->name);

    // Work processing
    // ... work processing code ...
}

// Delayed work handler
static void mydevice_delayed_work_handler(struct work_struct *work) {
    struct my_device *dev = container_of(work, struct my_device, delayed_work.work);

    printk(KERN_INFO "Delayed work handler for device: %s\n", dev->name);

    // Delayed work processing
    // ... delayed work processing code ...
}

// Timer handler
static void mydevice_timer_handler(struct timer_list *t) {
    struct my_device *dev = from_timer(dev, t, timer);

    printk(KERN_INFO "Timer handler for device: %s\n", dev->name);

    // Timer processing
    // ... timer processing code ...

    // Reschedule timer
    mod_timer(&dev->timer, jiffies + HZ);
}

// Device reference management
static struct my_device *mydevice_get_device(int id) {
    struct my_device *dev;

    mutex_lock(&device_list_mutex);

    list_for_each_entry(dev, &device_list, list) {
        if (dev->id == id) {
            atomic_inc(&dev->ref_count);
            mutex_unlock(&device_list_mutex);
            return dev;
        }
    }

    mutex_unlock(&device_list_mutex);
    return NULL;
}

static void mydevice_put_device(struct my_device *dev) {
    if (atomic_dec_and_test(&dev->ref_count)) {
        complete(&dev->completion);
    }
}

// Power management
static int mydevice_suspend(struct device *dev) {
    struct my_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Suspending device: %s\n", mydev->name);

    // Suspend device
    mydev->is_active = false;

    return 0;
}

static int mydevice_resume(struct device *dev) {
    struct my_device *mydev = dev_get_drvdata(dev);

    printk(KERN_INFO "Resuming device: %s\n", mydev->name);

    // Resume device
    mydev->is_active = true;

    return 0;
}

// Power management operations
static const struct dev_pm_ops mydevice_pm_ops = {
    .suspend = mydevice_suspend,
    .resume = mydevice_resume,
};

// Platform driver structure
static struct platform_driver mydevice_driver = {
    .probe = mydevice_probe,
    .remove = mydevice_remove,
    .driver = {
        .name = "mydevice",
        .pm = &mydevice_pm_ops,
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init mydevice_init(void) {
    int ret;

    printk(KERN_INFO "Initializing driver lifecycle management\n");

    // Initialize device list
    INIT_LIST_HEAD(&device_list);

    // Register platform driver
    ret = platform_driver_register(&mydevice_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Driver lifecycle management initialized\n");
    return 0;
}

// Module cleanup
static void __exit mydevice_exit(void) {
    struct my_device *dev, *tmp;

    printk(KERN_INFO "Cleaning up driver lifecycle management\n");

    // Cleanup all devices
    mutex_lock(&device_list_mutex);
    list_for_each_entry_safe(dev, tmp, &device_list, list) {
        mydevice_cleanup_device(dev);
        list_del(&dev->list);
        kfree(dev);
    }
    mutex_unlock(&device_list_mutex);

    // Unregister platform driver
    platform_driver_unregister(&mydevice_driver);

    printk(KERN_INFO "Driver lifecycle management cleaned up\n");
}

module_init(mydevice_init);
module_exit(mydevice_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A driver with lifecycle management");
```

**Explanation**:

- **Lifecycle management** - Complete device lifecycle from init to cleanup
- **Resource management** - Proper allocation and cleanup of resources
- **Work queues** - `INIT_WORK` and `INIT_DELAYED_WORK` for asynchronous work
- **Timers** - `timer_setup` for periodic operations
- **Power management** - `dev_pm_ops` for suspend/resume operations

**Where**: Lifecycle management is used in:

- **Complex drivers** - Drivers with multiple resources and operations
- **Hot-plug devices** - Devices that can be added/removed dynamically
- **Power management** - Devices with power state management
- **Resource-intensive drivers** - Drivers with significant resource usage
- **Production drivers** - Commercial and production device drivers

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Driver Registration** - You understand how to register device drivers with the kernel
2. **Platform Drivers** - You know how to create platform drivers for SoC peripherals
3. **PCI Drivers** - You understand how to create PCI drivers for PCI devices
4. **Lifecycle Management** - You know how to manage driver lifecycle
5. **Resource Management** - You understand how to manage driver resources
6. **Power Management** - You know how to implement power management

**Why** these concepts matter:

- **System integration** provides the foundation for integrating hardware into Linux
- **Driver development** enables creation of professional device drivers
- **Resource management** ensures efficient and reliable system operation
- **Professional development** prepares you for embedded systems development
- **System stability** ensures robust and reliable system operation

**When** to use these concepts:

- **Device driver development** - Creating drivers for hardware peripherals
- **System integration** - Integrating hardware into Linux systems
- **Professional development** - Working in embedded systems industry
- **System programming** - Low-level system development
- **Hardware interface** - Interfacing with hardware devices

**Where** these skills apply:

- **Embedded Linux development** - Creating drivers for embedded systems
- **Device driver development** - Developing hardware drivers
- **System programming** - Low-level system development
- **Professional development** - Working in embedded systems
- **Open source contribution** - Contributing to kernel projects

## Next Steps

**What** you're ready for next:

After mastering driver registration and lifecycle, you should be ready to:

1. **Handle interrupts** - Process hardware events and notifications
2. **Manage memory** - Allocate and manage kernel memory efficiently
3. **Work with DMA** - Implement DMA operations
4. **Debug kernel code** - Troubleshoot kernel-level issues
5. **Create advanced drivers** - Implement complex device drivers

**Where** to go next:

Continue with the next lesson on **"Interrupt Handling and Memory Management"** to learn:

- How to handle hardware interrupts
- Kernel memory management techniques
- DMA operations and memory mapping
- Advanced memory allocation strategies

**Why** the next lesson is important:

The next lesson builds directly on your driver knowledge by showing you how to handle interrupts and manage memory. You'll learn essential skills for efficient hardware interaction and resource management.

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
