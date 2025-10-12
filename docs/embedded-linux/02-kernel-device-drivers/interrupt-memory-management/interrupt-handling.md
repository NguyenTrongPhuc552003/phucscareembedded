---
sidebar_position: 1
---

# Interrupt Handling

Learn how to handle hardware interrupts in Linux kernel drivers for efficient event processing and system responsiveness.

## What are Interrupts?

**What**: Interrupts are signals sent by hardware devices to the CPU to indicate that an event has occurred that requires attention, such as data being received, a timer expiring, or a button being pressed.

**Why**: Interrupts are important because:

- **Event processing** enables timely response to hardware events
- **System responsiveness** ensures the system responds quickly to events
- **Resource efficiency** allows the CPU to do other work while waiting for events
- **Real-time operation** provides deterministic response times
- **Hardware integration** enables efficient hardware-software interaction

**When**: Interrupts are used when:

- **Processing hardware events** like data reception or transmission completion
- **Handling timer events** for periodic operations
- **Responding to user input** like button presses or touch events
- **Managing device state changes** like device insertion or removal
- **Implementing real-time systems** requiring deterministic response

**How**: Interrupts work by:

- **Hardware signaling** devices send interrupt signals to the CPU
- **Interrupt controller** routes interrupts to appropriate handlers
- **Context switching** CPU switches to interrupt handler
- **Event processing** interrupt handler processes the event
- **Return to normal** CPU returns to interrupted task

**Where**: Interrupts are used in:

- **Serial communication** - UART, SPI, I2C data reception
- **Network interfaces** - Ethernet packet reception
- **Input devices** - Keyboard, mouse, touchscreen events
- **Timers** - System timers and real-time clocks
- **Storage devices** - Disk and flash memory operations

## Basic Interrupt Handling

**What**: Basic interrupt handling involves registering interrupt handlers and processing interrupt events.

**Why**: Understanding basic interrupt handling is important because:

- **Foundation knowledge** provides the basis for all interrupt handling
- **System integration** enables hardware integration into the system
- **Event processing** allows processing of hardware events
- **Resource management** manages interrupt resources efficiently
- **Error handling** provides mechanisms for handling interrupt failures

**How**: Basic interrupt handling is implemented through:

```c
// Example: Basic interrupt handling
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/interrupt.h>
#include <linux/irq.h>
#include <linux/gpio.h>
#include <linux/platform_device.h>

// Device structure
struct my_interrupt_device {
    struct device *dev;
    int irq;
    int gpio_pin;
    int irq_count;
    struct mutex mutex;
    struct work_struct work;
    struct workqueue_struct *wq;
};

// Global device instance
static struct my_interrupt_device *my_dev;

// Interrupt handler function
static irqreturn_t my_interrupt_handler(int irq, void *dev_id) {
    struct my_interrupt_device *dev = dev_id;

    // Increment interrupt count
    if (mutex_lock_interruptible(&dev->mutex))
        return IRQ_HANDLED;

    dev->irq_count++;
    printk(KERN_INFO "Interrupt received on IRQ %d (count: %d)\n",
           irq, dev->irq_count);

    mutex_unlock(&dev->mutex);

    // Schedule work for processing
    queue_work(dev->wq, &dev->work);

    return IRQ_HANDLED;
}

// Work handler for interrupt processing
static void my_work_handler(struct work_struct *work) {
    struct my_interrupt_device *dev = container_of(work, struct my_interrupt_device, work);

    printk(KERN_INFO "Processing interrupt work for device\n");

    // Process interrupt
    // ... interrupt processing code ...

    // Clear interrupt source if needed
    // ... clear interrupt code ...
}

// Interrupt registration
static int register_interrupt(struct my_interrupt_device *dev) {
    int ret;

    printk(KERN_INFO "Registering interrupt handler for IRQ %d\n", dev->irq);

    // Request interrupt
    ret = request_irq(dev->irq, my_interrupt_handler, IRQF_SHARED,
                     "my_interrupt", dev);
    if (ret) {
        printk(KERN_ERR "Failed to request IRQ %d: %d\n", dev->irq, ret);
        return ret;
    }

    printk(KERN_INFO "Interrupt handler registered successfully\n");
    return 0;
}

// Interrupt unregistration
static void unregister_interrupt(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Unregistering interrupt handler for IRQ %d\n", dev->irq);

    free_irq(dev->irq, dev);

    printk(KERN_INFO "Interrupt handler unregistered\n");
}

// Device initialization
static int my_interrupt_init(struct my_interrupt_device *dev) {
    int ret;

    printk(KERN_INFO "Initializing interrupt device\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Create work queue
    dev->wq = create_singlethread_workqueue("my_interrupt_wq");
    if (!dev->wq) {
        printk(KERN_ERR "Failed to create work queue\n");
        return -ENOMEM;
    }

    // Initialize work
    INIT_WORK(&dev->work, my_work_handler);

    // Initialize interrupt count
    dev->irq_count = 0;

    // Register interrupt
    ret = register_interrupt(dev);
    if (ret) {
        destroy_workqueue(dev->wq);
        return ret;
    }

    printk(KERN_INFO "Interrupt device initialized successfully\n");
    return 0;
}

// Device cleanup
static void my_interrupt_cleanup(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Cleaning up interrupt device\n");

    // Unregister interrupt
    unregister_interrupt(dev);

    // Cancel work
    cancel_work_sync(&dev->work);

    // Destroy work queue
    destroy_workqueue(dev->wq);

    printk(KERN_INFO "Interrupt device cleaned up\n");
}

// Platform driver probe
static int my_interrupt_probe(struct platform_device *pdev) {
    struct my_interrupt_device *dev;
    int ret;

    printk(KERN_INFO "Probing interrupt device\n");

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    dev->dev = &pdev->dev;

    // Get interrupt number
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0) {
        printk(KERN_ERR "No interrupt resource found\n");
        return dev->irq;
    }

    // Initialize device
    ret = my_interrupt_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "Interrupt device probed successfully\n");
    return 0;
}

// Platform driver remove
static int my_interrupt_remove(struct platform_device *pdev) {
    struct my_interrupt_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing interrupt device\n");

    // Cleanup device
    my_interrupt_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "Interrupt device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_interrupt_driver = {
    .probe = my_interrupt_probe,
    .remove = my_interrupt_remove,
    .driver = {
        .name = "my_interrupt",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_interrupt_init(void) {
    int ret;

    printk(KERN_INFO "Registering interrupt driver\n");

    ret = platform_driver_register(&my_interrupt_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Interrupt driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit my_interrupt_exit(void) {
    printk(KERN_INFO "Unregistering interrupt driver\n");

    platform_driver_unregister(&my_interrupt_driver);

    printk(KERN_INFO "Interrupt driver unregistered\n");
}

module_init(my_interrupt_init);
module_exit(my_interrupt_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A basic interrupt handling example");
```

**Explanation**:

- **Interrupt handler** - `my_interrupt_handler` processes interrupt events
- **IRQ registration** - `request_irq` registers interrupt handler
- **Work queues** - `work_struct` and `workqueue_struct` for deferred processing
- **Mutex protection** - `mutex` protects shared data from concurrent access
- **Resource management** - Proper allocation and cleanup of resources

**Where**: Basic interrupt handling is used in:

- **Simple devices** - Basic hardware with single interrupt
- **Learning projects** - Examples for understanding concepts
- **Prototype development** - Quick prototypes for new functionality
- **Testing frameworks** - Basic interrupt handling for testing
- **Educational purposes** - Teaching interrupt handling concepts

## Interrupt Types and Flags

**What**: Different interrupt types and flags control how interrupts are handled and processed.

**Why**: Understanding interrupt types and flags is important because:

- **Interrupt behavior** controls how interrupts are processed
- **System performance** affects system performance and responsiveness
- **Error handling** provides mechanisms for handling interrupt failures
- **Resource management** manages interrupt resources efficiently
- **System stability** ensures robust interrupt handling

**How**: Interrupt types and flags are implemented through:

```c
// Example: Interrupt types and flags
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/interrupt.h>
#include <linux/irq.h>
#include <linux/platform_device.h>

// Device structure
struct my_interrupt_device {
    struct device *dev;
    int irq;
    int irq_type;
    int irq_count;
    struct mutex mutex;
    struct work_struct work;
    struct workqueue_struct *wq;
    struct timer_list timer;
    bool is_high_freq;
};

// Global device instance
static struct my_interrupt_device *my_dev;

// High-frequency interrupt handler
static irqreturn_t my_high_freq_handler(int irq, void *dev_id) {
    struct my_interrupt_device *dev = dev_id;

    // Increment interrupt count
    if (mutex_lock_interruptible(&dev->mutex))
        return IRQ_HANDLED;

    dev->irq_count++;

    // For high-frequency interrupts, use timer for processing
    if (dev->is_high_freq) {
        mod_timer(&dev->timer, jiffies + 1);
    } else {
        queue_work(dev->wq, &dev->work);
    }

    mutex_unlock(&dev->mutex);

    return IRQ_HANDLED;
}

// Low-frequency interrupt handler
static irqreturn_t my_low_freq_handler(int irq, void *dev_id) {
    struct my_interrupt_device *dev = dev_id;

    printk(KERN_INFO "Low-frequency interrupt received on IRQ %d\n", irq);

    // Process interrupt immediately
    queue_work(dev->wq, &dev->work);

    return IRQ_HANDLED;
}

// Timer handler for high-frequency interrupts
static void my_timer_handler(struct timer_list *t) {
    struct my_interrupt_device *dev = from_timer(dev, t, timer);

    printk(KERN_INFO "Processing high-frequency interrupt (count: %d)\n",
           dev->irq_count);

    // Process accumulated interrupts
    // ... interrupt processing code ...

    // Reset count
    dev->irq_count = 0;
}

// Work handler
static void my_work_handler(struct work_struct *work) {
    struct my_interrupt_device *dev = container_of(work, struct my_interrupt_device, work);

    printk(KERN_INFO "Processing interrupt work\n");

    // Process interrupt
    // ... interrupt processing code ...
}

// Interrupt registration with flags
static int register_interrupt_with_flags(struct my_interrupt_device *dev) {
    int ret;
    unsigned long flags = 0;

    printk(KERN_INFO "Registering interrupt handler with flags\n");

    // Set interrupt flags based on type
    switch (dev->irq_type) {
    case 0: // High-frequency interrupt
        flags = IRQF_SHARED | IRQF_NO_THREAD;
        dev->is_high_freq = true;
        break;
    case 1: // Low-frequency interrupt
        flags = IRQF_SHARED | IRQF_ONESHOT;
        dev->is_high_freq = false;
        break;
    case 2: // Critical interrupt
        flags = IRQF_SHARED | IRQF_NO_THREAD | IRQF_EARLY;
        dev->is_high_freq = false;
        break;
    default:
        flags = IRQF_SHARED;
        dev->is_high_freq = false;
        break;
    }

    // Request interrupt with flags
    ret = request_irq(dev->irq,
                     dev->is_high_freq ? my_high_freq_handler : my_low_freq_handler,
                     flags, "my_interrupt", dev);
    if (ret) {
        printk(KERN_ERR "Failed to request IRQ %d: %d\n", dev->irq, ret);
        return ret;
    }

    printk(KERN_INFO "Interrupt handler registered with flags: 0x%lx\n", flags);
    return 0;
}

// Interrupt unregistration
static void unregister_interrupt_with_flags(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Unregistering interrupt handler\n");

    free_irq(dev->irq, dev);

    printk(KERN_INFO "Interrupt handler unregistered\n");
}

// Device initialization
static int my_interrupt_init_with_flags(struct my_interrupt_device *dev) {
    int ret;

    printk(KERN_INFO "Initializing interrupt device with flags\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Create work queue
    dev->wq = create_singlethread_workqueue("my_interrupt_wq");
    if (!dev->wq) {
        printk(KERN_ERR "Failed to create work queue\n");
        return -ENOMEM;
    }

    // Initialize work
    INIT_WORK(&dev->work, my_work_handler);

    // Initialize timer
    timer_setup(&dev->timer, my_timer_handler, 0);

    // Initialize interrupt count
    dev->irq_count = 0;

    // Register interrupt with flags
    ret = register_interrupt_with_flags(dev);
    if (ret) {
        destroy_workqueue(dev->wq);
        return ret;
    }

    printk(KERN_INFO "Interrupt device initialized with flags\n");
    return 0;
}

// Device cleanup
static void my_interrupt_cleanup_with_flags(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Cleaning up interrupt device with flags\n");

    // Unregister interrupt
    unregister_interrupt_with_flags(dev);

    // Cancel work
    cancel_work_sync(&dev->work);

    // Delete timer
    del_timer_sync(&dev->timer);

    // Destroy work queue
    destroy_workqueue(dev->wq);

    printk(KERN_INFO "Interrupt device cleaned up with flags\n");
}

// Platform driver probe
static int my_interrupt_probe_with_flags(struct platform_device *pdev) {
    struct my_interrupt_device *dev;
    int ret;

    printk(KERN_INFO "Probing interrupt device with flags\n");

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    dev->dev = &pdev->dev;

    // Get interrupt number
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0) {
        printk(KERN_ERR "No interrupt resource found\n");
        return dev->irq;
    }

    // Get interrupt type from device tree or platform data
    dev->irq_type = 0; // Default to high-frequency

    // Initialize device
    ret = my_interrupt_init_with_flags(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "Interrupt device probed with flags\n");
    return 0;
}

// Platform driver remove
static int my_interrupt_remove_with_flags(struct platform_device *pdev) {
    struct my_interrupt_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing interrupt device with flags\n");

    // Cleanup device
    my_interrupt_cleanup_with_flags(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "Interrupt device removed with flags\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_interrupt_driver_with_flags = {
    .probe = my_interrupt_probe_with_flags,
    .remove = my_interrupt_remove_with_flags,
    .driver = {
        .name = "my_interrupt_flags",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_interrupt_init_with_flags(void) {
    int ret;

    printk(KERN_INFO "Registering interrupt driver with flags\n");

    ret = platform_driver_register(&my_interrupt_driver_with_flags);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Interrupt driver registered with flags\n");
    return 0;
}

// Module cleanup
static void __exit my_interrupt_exit_with_flags(void) {
    printk(KERN_INFO "Unregistering interrupt driver with flags\n");

    platform_driver_unregister(&my_interrupt_driver_with_flags);

    printk(KERN_INFO "Interrupt driver unregistered with flags\n");
}

module_init(my_interrupt_init_with_flags);
module_exit(my_interrupt_exit_with_flags);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("An interrupt handling example with flags");
```

**Explanation**:

- **Interrupt flags** - `IRQF_SHARED`, `IRQF_NO_THREAD`, `IRQF_ONESHOT` control interrupt behavior
- **High-frequency interrupts** - Use timers for processing to avoid overhead
- **Low-frequency interrupts** - Process immediately for better responsiveness
- **Critical interrupts** - Use `IRQF_EARLY` for early processing
- **Timer processing** - `mod_timer` for deferred processing of high-frequency interrupts

**Where**: Interrupt types and flags are used in:

- **High-frequency devices** - Network interfaces, audio devices
- **Low-frequency devices** - Input devices, sensors
- **Critical devices** - Real-time systems, safety-critical applications
- **Shared interrupts** - Devices sharing interrupt lines
- **Threaded interrupts** - Interrupts that need to be processed in thread context

## Interrupt Threading

**What**: Interrupt threading allows interrupt handlers to run in thread context, enabling more complex processing and better system responsiveness.

**Why**: Interrupt threading is important because:

- **Complex processing** enables complex interrupt processing
- **System responsiveness** improves system responsiveness
- **Resource management** better manages system resources
- **Error handling** provides better error handling mechanisms
- **Debugging** simplifies debugging of interrupt handlers

**How**: Interrupt threading is implemented through:

```c
// Example: Interrupt threading
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/interrupt.h>
#include <linux/irq.h>
#include <linux/platform_device.h>
#include <linux/irqdesc.h>

// Device structure
struct my_interrupt_device {
    struct device *dev;
    int irq;
    int irq_count;
    struct mutex mutex;
    struct work_struct work;
    struct workqueue_struct *wq;
    bool use_threading;
};

// Global device instance
static struct my_interrupt_device *my_dev;

// Threaded interrupt handler
static irqreturn_t my_threaded_handler(int irq, void *dev_id) {
    struct my_interrupt_device *dev = dev_id;

    printk(KERN_INFO "Threaded interrupt handler for IRQ %d\n", irq);

    // Process interrupt in thread context
    if (mutex_lock_interruptible(&dev->mutex))
        return IRQ_HANDLED;

    dev->irq_count++;
    printk(KERN_INFO "Threaded interrupt processed (count: %d)\n", dev->irq_count);

    mutex_unlock(&dev->mutex);

    return IRQ_HANDLED;
}

// Hard interrupt handler
static irqreturn_t my_hard_handler(int irq, void *dev_id) {
    struct my_interrupt_device *dev = dev_id;

    printk(KERN_INFO "Hard interrupt handler for IRQ %d\n", irq);

    // Quick processing in hard interrupt context
    // ... quick processing code ...

    // Return IRQ_WAKE_THREAD to wake up threaded handler
    return IRQ_WAKE_THREAD;
}

// Work handler
static void my_work_handler(struct work_struct *work) {
    struct my_interrupt_device *dev = container_of(work, struct my_interrupt_device, work);

    printk(KERN_INFO "Processing interrupt work in thread context\n");

    // Process interrupt
    // ... interrupt processing code ...
}

// Interrupt registration with threading
static int register_threaded_interrupt(struct my_interrupt_device *dev) {
    int ret;
    unsigned long flags = IRQF_SHARED | IRQF_ONESHOT;

    printk(KERN_INFO "Registering threaded interrupt handler\n");

    // Request threaded interrupt
    ret = request_threaded_irq(dev->irq, my_hard_handler, my_threaded_handler,
                              flags, "my_threaded_interrupt", dev);
    if (ret) {
        printk(KERN_ERR "Failed to request threaded IRQ %d: %d\n", dev->irq, ret);
        return ret;
    }

    printk(KERN_INFO "Threaded interrupt handler registered\n");
    return 0;
}

// Interrupt unregistration
static void unregister_threaded_interrupt(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Unregistering threaded interrupt handler\n");

    free_irq(dev->irq, dev);

    printk(KERN_INFO "Threaded interrupt handler unregistered\n");
}

// Device initialization
static int my_threaded_interrupt_init(struct my_interrupt_device *dev) {
    int ret;

    printk(KERN_INFO "Initializing threaded interrupt device\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Create work queue
    dev->wq = create_singlethread_workqueue("my_threaded_wq");
    if (!dev->wq) {
        printk(KERN_ERR "Failed to create work queue\n");
        return -ENOMEM;
    }

    // Initialize work
    INIT_WORK(&dev->work, my_work_handler);

    // Initialize interrupt count
    dev->irq_count = 0;

    // Register threaded interrupt
    ret = register_threaded_interrupt(dev);
    if (ret) {
        destroy_workqueue(dev->wq);
        return ret;
    }

    printk(KERN_INFO "Threaded interrupt device initialized\n");
    return 0;
}

// Device cleanup
static void my_threaded_interrupt_cleanup(struct my_interrupt_device *dev) {
    printk(KERN_INFO "Cleaning up threaded interrupt device\n");

    // Unregister threaded interrupt
    unregister_threaded_interrupt(dev);

    // Cancel work
    cancel_work_sync(&dev->work);

    // Destroy work queue
    destroy_workqueue(dev->wq);

    printk(KERN_INFO "Threaded interrupt device cleaned up\n");
}

// Platform driver probe
static int my_threaded_interrupt_probe(struct platform_device *pdev) {
    struct my_interrupt_device *dev;
    int ret;

    printk(KERN_INFO "Probing threaded interrupt device\n");

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    dev->dev = &pdev->dev;

    // Get interrupt number
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0) {
        printk(KERN_ERR "No interrupt resource found\n");
        return dev->irq;
    }

    // Initialize device
    ret = my_threaded_interrupt_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "Threaded interrupt device probed\n");
    return 0;
}

// Platform driver remove
static int my_threaded_interrupt_remove(struct platform_device *pdev) {
    struct my_interrupt_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing threaded interrupt device\n");

    // Cleanup device
    my_threaded_interrupt_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "Threaded interrupt device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_threaded_interrupt_driver = {
    .probe = my_threaded_interrupt_probe,
    .remove = my_threaded_interrupt_remove,
    .driver = {
        .name = "my_threaded_interrupt",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_threaded_interrupt_init(void) {
    int ret;

    printk(KERN_INFO "Registering threaded interrupt driver\n");

    ret = platform_driver_register(&my_threaded_interrupt_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Threaded interrupt driver registered\n");
    return 0;
}

// Module cleanup
static void __exit my_threaded_interrupt_exit(void) {
    printk(KERN_INFO "Unregistering threaded interrupt driver\n");

    platform_driver_unregister(&my_threaded_interrupt_driver);

    printk(KERN_INFO "Threaded interrupt driver unregistered\n");
}

module_init(my_threaded_interrupt_init);
module_exit(my_threaded_interrupt_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A threaded interrupt handling example");
```

**Explanation**:

- **Threaded interrupts** - `request_threaded_irq` enables interrupt threading
- **Hard handler** - `my_hard_handler` runs in hard interrupt context
- **Threaded handler** - `my_threaded_handler` runs in thread context
- **IRQ_WAKE_THREAD** - Return value to wake up threaded handler
- **IRQF_ONESHOT** - Flag for threaded interrupts

**Where**: Interrupt threading is used in:

- **Complex devices** - Devices requiring complex interrupt processing
- **Real-time systems** - Systems requiring deterministic response
- **High-performance systems** - Systems requiring optimal performance
- **Debugging** - Interrupt handlers that need debugging
- **Professional development** - Production device drivers

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Interrupt Understanding** - You understand what interrupts are and how they work
2. **Basic Handling** - You know how to implement basic interrupt handling
3. **Interrupt Types** - You understand different interrupt types and flags
4. **Threading** - You know how to implement threaded interrupt handling
5. **Resource Management** - You understand how to manage interrupt resources
6. **Error Handling** - You know how to handle interrupt errors

**Why** these concepts matter:

- **Hardware integration** provides the foundation for hardware interaction
- **System responsiveness** enables efficient event processing
- **Real-time operation** supports real-time system requirements
- **Professional development** prepares you for embedded systems development
- **System stability** ensures robust interrupt handling

**When** to use these concepts:

- **Device driver development** - Creating drivers for hardware peripherals
- **Real-time systems** - Implementing real-time applications
- **Hardware interface** - Interfacing with hardware devices
- **System programming** - Low-level system development
- **Embedded development** - Creating embedded systems

**Where** these skills apply:

- **Embedded Linux development** - Creating drivers for embedded systems
- **Device driver development** - Developing hardware drivers
- **System programming** - Low-level system development
- **Professional development** - Working in embedded systems
- **Open source contribution** - Contributing to kernel projects

## Next Steps

**What** you're ready for next:

After mastering interrupt handling, you should be ready to:

1. **Manage memory** - Allocate and manage kernel memory efficiently
2. **Work with DMA** - Implement DMA operations
3. **Debug kernel code** - Troubleshoot kernel-level issues
4. **Create advanced drivers** - Implement complex device drivers
5. **Optimize performance** - Optimize system performance

**Where** to go next:

Continue with the next lesson on **"Kernel Memory Management"** to learn:

- How to allocate and manage kernel memory
- Different memory allocation strategies
- DMA operations and memory mapping
- Advanced memory management techniques

**Why** the next lesson is important:

The next lesson builds directly on your interrupt knowledge by showing you how to manage memory efficiently. You'll learn essential skills for resource management and system optimization.

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
