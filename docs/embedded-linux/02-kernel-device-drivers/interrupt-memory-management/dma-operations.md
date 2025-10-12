---
sidebar_position: 3
---

# DMA Operations

Learn how to implement Direct Memory Access (DMA) operations for high-performance data transfer between hardware devices and memory.

## What is DMA?

**What**: DMA (Direct Memory Access) is a feature that allows hardware devices to transfer data directly to and from memory without involving the CPU, enabling high-speed data transfer and improved system performance.

**Why**: DMA is important because:

- **Performance** enables high-speed data transfer without CPU overhead
- **CPU efficiency** frees CPU for other tasks during data transfer
- **System responsiveness** improves overall system responsiveness
- **Hardware integration** enables efficient hardware-software interaction
- **Scalability** supports high-bandwidth data transfer requirements

**When**: DMA is used when:

- **High-speed data transfer** is required between hardware and memory
- **CPU resources** need to be conserved for other tasks
- **Real-time systems** require deterministic data transfer
- **Network interfaces** need to transfer large amounts of data
- **Storage devices** need to transfer data to/from disk or flash memory

**How**: DMA works by:

- **Hardware control** devices control data transfer directly
- **Memory access** devices access memory without CPU intervention
- **Interrupt signaling** devices signal completion via interrupts
- **Cache management** proper cache flushing ensures data consistency
- **Address translation** physical addresses are used for DMA operations

**Where**: DMA is used in:

- **Network interfaces** - Ethernet and wireless network adapters
- **Storage controllers** - SATA, SAS, NVMe, and flash memory controllers
- **Graphics cards** - Video and graphics data transfer
- **Audio devices** - Audio data streaming and processing
- **Custom hardware** - Application-specific high-speed data transfer

## Basic DMA Operations

**What**: Basic DMA operations involve setting up DMA transfers, managing DMA buffers, and handling DMA completion.

**Why**: Understanding basic DMA operations is important because:

- **Foundation knowledge** provides the basis for all DMA operations
- **Performance optimization** enables efficient data transfer
- **Resource management** manages DMA resources efficiently
- **Error handling** provides mechanisms for handling DMA failures
- **System integration** integrates DMA into device drivers

**How**: Basic DMA operations are implemented through:

```c
// Example: Basic DMA operations
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/dma-mapping.h>
#include <linux/dma-direction.h>
#include <linux/mm.h>
#include <linux/slab.h>
#include <linux/platform_device.h>
#include <linux/interrupt.h>

// Device structure
struct my_dma_device {
    struct device *dev;
    dma_addr_t dma_addr;
    void *virt_addr;
    size_t buffer_size;
    struct mutex mutex;
    bool dma_enabled;
    int irq;
    struct completion dma_complete;
    bool dma_in_progress;
};

// Global device instance
static struct my_dma_device *my_dev;

// DMA interrupt handler
static irqreturn_t dma_interrupt_handler(int irq, void *dev_id) {
    struct my_dma_device *dev = dev_id;

    printk(KERN_INFO "DMA interrupt received\n");

    // Check if DMA is in progress
    if (dev->dma_in_progress) {
        dev->dma_in_progress = false;
        complete(&dev->dma_complete);
    }

    return IRQ_HANDLED;
}

// DMA buffer allocation
static int allocate_dma_buffer(struct my_dma_device *dev) {
    printk(KERN_INFO "Allocating DMA buffer\n");

    // Allocate DMA buffer
    dev->virt_addr = dma_alloc_coherent(dev->dev, dev->buffer_size,
                                       &dev->dma_addr, GFP_KERNEL);
    if (!dev->virt_addr) {
        printk(KERN_ERR "Failed to allocate DMA buffer\n");
        return -ENOMEM;
    }

    printk(KERN_INFO "DMA buffer allocated: virt=%p, dma=0x%llx, size=%zu\n",
           dev->virt_addr, (unsigned long long)dev->dma_addr, dev->buffer_size);

    return 0;
}

// DMA buffer cleanup
static void cleanup_dma_buffer(struct my_dma_device *dev) {
    printk(KERN_INFO "Cleaning up DMA buffer\n");

    if (dev->virt_addr) {
        dma_free_coherent(dev->dev, dev->buffer_size, dev->virt_addr, dev->dma_addr);
        dev->virt_addr = NULL;
        dev->dma_addr = 0;
    }

    printk(KERN_INFO "DMA buffer cleaned up\n");
}

// DMA transfer setup
static int setup_dma_transfer(struct my_dma_device *dev, dma_addr_t src,
                             dma_addr_t dst, size_t size, int direction) {
    printk(KERN_INFO "Setting up DMA transfer\n");

    if (!dev->dma_enabled) {
        printk(KERN_ERR "DMA not enabled\n");
        return -EINVAL;
    }

    // Flush cache before DMA
    dma_sync_single_for_device(dev->dev, src, size, direction);

    // Configure DMA controller
    // This is hardware-specific and would be implemented based on the actual hardware
    // For this example, we'll simulate the configuration

    printk(KERN_INFO "DMA transfer configured: src=0x%llx, dst=0x%llx, size=%zu, dir=%d\n",
           (unsigned long long)src, (unsigned long long)dst, size, direction);

    return 0;
}

// DMA transfer execution
static int execute_dma_transfer(struct my_dma_device *dev) {
    int ret;
    unsigned long timeout;

    printk(KERN_INFO "Executing DMA transfer\n");

    if (!dev->dma_enabled) {
        printk(KERN_ERR "DMA not enabled\n");
        return -EINVAL;
    }

    // Set DMA in progress
    dev->dma_in_progress = true;

    // Start DMA transfer
    // This is hardware-specific and would be implemented based on the actual hardware
    // For this example, we'll simulate starting the transfer

    printk(KERN_INFO "DMA transfer started\n");

    // Wait for completion
    timeout = wait_for_completion_timeout(&dev->dma_complete, HZ);
    if (timeout == 0) {
        printk(KERN_ERR "DMA transfer timeout\n");
        dev->dma_in_progress = false;
        return -ETIMEDOUT;
    }

    printk(KERN_INFO "DMA transfer completed\n");

    return 0;
}

// DMA data preparation
static int prepare_dma_data(struct my_dma_device *dev) {
    printk(KERN_INFO "Preparing DMA data\n");

    if (!dev->virt_addr) {
        printk(KERN_ERR "DMA buffer not allocated\n");
        return -ENOMEM;
    }

    // Prepare data for DMA
    memset(dev->virt_addr, 0xAA, dev->buffer_size);

    // Flush cache for DMA
    dma_sync_single_for_device(dev->dev, dev->dma_addr, dev->buffer_size,
                              DMA_TO_DEVICE);

    printk(KERN_INFO "DMA data prepared\n");

    return 0;
}

// DMA data processing
static int process_dma_data(struct my_dma_device *dev) {
    printk(KERN_INFO "Processing DMA data\n");

    if (!dev->virt_addr) {
        printk(KERN_ERR "DMA buffer not allocated\n");
        return -ENOMEM;
    }

    // Sync cache after DMA
    dma_sync_single_for_cpu(dev->dev, dev->dma_addr, dev->buffer_size,
                           DMA_FROM_DEVICE);

    // Process the data
    // This is where you would process the received data

    printk(KERN_INFO "DMA data processed\n");

    return 0;
}

// DMA configuration
static int configure_dma(struct my_dma_device *dev) {
    printk(KERN_INFO "Configuring DMA\n");

    // Check if device supports DMA
    if (!dev->dev->dma_mask) {
        printk(KERN_ERR "Device does not support DMA\n");
        return -ENODEV;
    }

    // Set DMA mask
    if (dma_set_mask_and_coherent(dev->dev, DMA_BIT_MASK(32))) {
        printk(KERN_ERR "Failed to set DMA mask\n");
        return -EINVAL;
    }

    dev->dma_enabled = true;

    printk(KERN_INFO "DMA configured successfully\n");
    return 0;
}

// Device initialization
static int my_dma_init(struct my_dma_device *dev) {
    int ret;

    printk(KERN_INFO "Initializing DMA device\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Initialize completion
    init_completion(&dev->dma_complete);

    // Set buffer size
    dev->buffer_size = 4096; // 4KB

    // Initialize DMA state
    dev->dma_enabled = false;
    dev->virt_addr = NULL;
    dev->dma_addr = 0;
    dev->dma_in_progress = false;

    // Configure DMA
    ret = configure_dma(dev);
    if (ret) {
        printk(KERN_ERR "Failed to configure DMA: %d\n", ret);
        return ret;
    }

    // Allocate DMA buffer
    ret = allocate_dma_buffer(dev);
    if (ret) {
        printk(KERN_ERR "Failed to allocate DMA buffer: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "DMA device initialized successfully\n");
    return 0;
}

// Device cleanup
static void my_dma_cleanup(struct my_dma_device *dev) {
    printk(KERN_INFO "Cleaning up DMA device\n");

    // Cleanup DMA buffer
    cleanup_dma_buffer(dev);

    printk(KERN_INFO "DMA device cleaned up\n");
}

// Platform driver probe
static int my_dma_probe(struct platform_device *pdev) {
    struct my_dma_device *dev;
    int ret;

    printk(KERN_INFO "Probing DMA device\n");

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

    // Request interrupt
    ret = devm_request_irq(&pdev->dev, dev->irq, dma_interrupt_handler,
                          IRQF_SHARED, "my_dma", dev);
    if (ret) {
        printk(KERN_ERR "Failed to request interrupt: %d\n", ret);
        return ret;
    }

    // Initialize device
    ret = my_dma_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "DMA device probed successfully\n");
    return 0;
}

// Platform driver remove
static int my_dma_remove(struct platform_device *pdev) {
    struct my_dma_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing DMA device\n");

    // Cleanup device
    my_dma_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "DMA device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_dma_driver = {
    .probe = my_dma_probe,
    .remove = my_dma_remove,
    .driver = {
        .name = "my_dma",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_dma_init(void) {
    int ret;

    printk(KERN_INFO "Registering DMA driver\n");

    ret = platform_driver_register(&my_dma_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "DMA driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit my_dma_exit(void) {
    printk(KERN_INFO "Unregistering DMA driver\n");

    platform_driver_unregister(&my_dma_driver);

    printk(KERN_INFO "DMA driver unregistered\n");
}

module_init(my_dma_init);
module_exit(my_dma_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A basic DMA operations example");
```

**Explanation**:

- **DMA buffer allocation** - `dma_alloc_coherent` allocates DMA-capable memory
- **DMA transfer setup** - `dma_sync_single_for_device` prepares data for DMA
- **DMA execution** - Hardware-specific DMA controller configuration
- **Interrupt handling** - `dma_interrupt_handler` processes DMA completion
- **Cache management** - Proper cache flushing for DMA operations

**Where**: Basic DMA operations are used in:

- **Simple devices** - Basic hardware with DMA capabilities
- **Learning projects** - Examples for understanding concepts
- **Prototype development** - Quick prototypes for new functionality
- **Testing frameworks** - Basic DMA operations for testing
- **Educational purposes** - Teaching DMA concepts

## Scatter-Gather DMA

**What**: Scatter-gather DMA allows transferring data between non-contiguous memory regions and hardware devices in a single operation.

**Why**: Scatter-gather DMA is important because:

- **Non-contiguous memory** handles data scattered across multiple memory regions
- **Efficiency** reduces the number of DMA operations required
- **Performance** improves data transfer performance
- **Memory management** works with virtual memory systems
- **Hardware support** utilizes hardware scatter-gather capabilities

**How**: Scatter-gather DMA is implemented through:

```c
// Example: Scatter-gather DMA operations
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/dma-mapping.h>
#include <linux/dma-direction.h>
#include <linux/mm.h>
#include <linux/slab.h>
#include <linux/platform_device.h>
#include <linux/scatterlist.h>

// Device structure
struct my_sg_dma_device {
    struct device *dev;
    struct scatterlist *sg_list;
    int sg_count;
    size_t total_size;
    struct mutex mutex;
    bool dma_enabled;
    int irq;
    struct completion dma_complete;
    bool dma_in_progress;
};

// Global device instance
static struct my_sg_dma_device *my_dev;

// Scatter-gather list setup
static int setup_sg_list(struct my_sg_dma_device *dev, void **buffers,
                        size_t *sizes, int count) {
    int i;
    struct scatterlist *sg;

    printk(KERN_INFO "Setting up scatter-gather list\n");

    // Allocate scatter-gather list
    dev->sg_list = kcalloc(count, sizeof(struct scatterlist), GFP_KERNEL);
    if (!dev->sg_list) {
        printk(KERN_ERR "Failed to allocate scatter-gather list\n");
        return -ENOMEM;
    }

    // Initialize scatter-gather list
    sg_init_table(dev->sg_list, count);

    // Setup scatter-gather entries
    for (i = 0; i < count; i++) {
        sg = &dev->sg_list[i];
        sg_set_buf(sg, buffers[i], sizes[i]);
        dev->total_size += sizes[i];
    }

    dev->sg_count = count;

    printk(KERN_INFO "Scatter-gather list setup: %d entries, total size: %zu\n",
           dev->sg_count, dev->total_size);

    return 0;
}

// Scatter-gather list cleanup
static void cleanup_sg_list(struct my_sg_dma_device *dev) {
    printk(KERN_INFO "Cleaning up scatter-gather list\n");

    if (dev->sg_list) {
        kfree(dev->sg_list);
        dev->sg_list = NULL;
    }

    dev->sg_count = 0;
    dev->total_size = 0;

    printk(KERN_INFO "Scatter-gather list cleaned up\n");
}

// Scatter-gather DMA mapping
static int map_sg_dma(struct my_sg_dma_device *dev, int direction) {
    int ret;

    printk(KERN_INFO "Mapping scatter-gather DMA\n");

    if (!dev->sg_list) {
        printk(KERN_ERR "Scatter-gather list not setup\n");
        return -EINVAL;
    }

    // Map scatter-gather list for DMA
    ret = dma_map_sg(dev->dev, dev->sg_list, dev->sg_count, direction);
    if (ret == 0) {
        printk(KERN_ERR "Failed to map scatter-gather list for DMA\n");
        return -ENOMEM;
    }

    printk(KERN_INFO "Scatter-gather DMA mapped: %d entries\n", ret);

    return 0;
}

// Scatter-gather DMA unmapping
static void unmap_sg_dma(struct my_sg_dma_device *dev, int direction) {
    printk(KERN_INFO "Unmapping scatter-gather DMA\n");

    if (dev->sg_list) {
        dma_unmap_sg(dev->dev, dev->sg_list, dev->sg_count, direction);
    }

    printk(KERN_INFO "Scatter-gather DMA unmapped\n");
}

// Scatter-gather DMA transfer
static int execute_sg_dma_transfer(struct my_sg_dma_device *dev, int direction) {
    int ret;
    unsigned long timeout;

    printk(KERN_INFO "Executing scatter-gather DMA transfer\n");

    if (!dev->dma_enabled) {
        printk(KERN_ERR "DMA not enabled\n");
        return -EINVAL;
    }

    // Map scatter-gather list for DMA
    ret = map_sg_dma(dev, direction);
    if (ret < 0) {
        printk(KERN_ERR "Failed to map scatter-gather DMA: %d\n", ret);
        return ret;
    }

    // Set DMA in progress
    dev->dma_in_progress = true;

    // Start scatter-gather DMA transfer
    // This is hardware-specific and would be implemented based on the actual hardware
    // For this example, we'll simulate starting the transfer

    printk(KERN_INFO "Scatter-gather DMA transfer started\n");

    // Wait for completion
    timeout = wait_for_completion_timeout(&dev->dma_complete, HZ);
    if (timeout == 0) {
        printk(KERN_ERR "Scatter-gather DMA transfer timeout\n");
        dev->dma_in_progress = false;
        unmap_sg_dma(dev, direction);
        return -ETIMEDOUT;
    }

    printk(KERN_INFO "Scatter-gather DMA transfer completed\n");

    // Unmap scatter-gather list
    unmap_sg_dma(dev, direction);

    return 0;
}

// Scatter-gather data preparation
static int prepare_sg_data(struct my_sg_dma_device *dev) {
    int i;
    struct scatterlist *sg;
    void *virt_addr;
    size_t size;

    printk(KERN_INFO "Preparing scatter-gather data\n");

    if (!dev->sg_list) {
        printk(KERN_ERR "Scatter-gather list not setup\n");
        return -EINVAL;
    }

    // Prepare data in each scatter-gather entry
    for_each_sg(dev->sg_list, sg, dev->sg_count, i) {
        virt_addr = sg_virt(sg);
        size = sg->length;

        // Prepare data
        memset(virt_addr, 0xAA + i, size);
    }

    printk(KERN_INFO "Scatter-gather data prepared\n");

    return 0;
}

// Scatter-gather data processing
static int process_sg_data(struct my_sg_dma_device *dev) {
    int i;
    struct scatterlist *sg;
    void *virt_addr;
    size_t size;

    printk(KERN_INFO "Processing scatter-gather data\n");

    if (!dev->sg_list) {
        printk(KERN_ERR "Scatter-gather list not setup\n");
        return -EINVAL;
    }

    // Process data in each scatter-gather entry
    for_each_sg(dev->sg_list, sg, dev->sg_count, i) {
        virt_addr = sg_virt(sg);
        size = sg->length;

        // Process data
        // This is where you would process the received data
    }

    printk(KERN_INFO "Scatter-gather data processed\n");

    return 0;
}

// Device initialization
static int my_sg_dma_init(struct my_sg_dma_device *dev) {
    printk(KERN_INFO "Initializing scatter-gather DMA device\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Initialize completion
    init_completion(&dev->dma_complete);

    // Initialize DMA state
    dev->dma_enabled = true;
    dev->sg_list = NULL;
    dev->sg_count = 0;
    dev->total_size = 0;
    dev->dma_in_progress = false;

    printk(KERN_INFO "Scatter-gather DMA device initialized\n");
    return 0;
}

// Device cleanup
static void my_sg_dma_cleanup(struct my_sg_dma_device *dev) {
    printk(KERN_INFO "Cleaning up scatter-gather DMA device\n");

    // Cleanup scatter-gather list
    cleanup_sg_list(dev);

    printk(KERN_INFO "Scatter-gather DMA device cleaned up\n");
}

// Platform driver probe
static int my_sg_dma_probe(struct platform_device *pdev) {
    struct my_sg_dma_device *dev;
    int ret;

    printk(KERN_INFO "Probing scatter-gather DMA device\n");

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    dev->dev = &pdev->dev;

    // Initialize device
    ret = my_sg_dma_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "Scatter-gather DMA device probed successfully\n");
    return 0;
}

// Platform driver remove
static int my_sg_dma_remove(struct platform_device *pdev) {
    struct my_sg_dma_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing scatter-gather DMA device\n");

    // Cleanup device
    my_sg_dma_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "Scatter-gather DMA device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_sg_dma_driver = {
    .probe = my_sg_dma_probe,
    .remove = my_sg_dma_remove,
    .driver = {
        .name = "my_sg_dma",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_sg_dma_init(void) {
    int ret;

    printk(KERN_INFO "Registering scatter-gather DMA driver\n");

    ret = platform_driver_register(&my_sg_dma_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "Scatter-gather DMA driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit my_sg_dma_exit(void) {
    printk(KERN_INFO "Unregistering scatter-gather DMA driver\n");

    platform_driver_unregister(&my_sg_dma_driver);

    printk(KERN_INFO "Scatter-gather DMA driver unregistered\n");
}

module_init(my_sg_dma_init);
module_exit(my_sg_dma_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A scatter-gather DMA operations example");
```

**Explanation**:

- **Scatter-gather list** - `struct scatterlist` represents non-contiguous memory regions
- **SG mapping** - `dma_map_sg` maps scatter-gather list for DMA
- **SG operations** - `for_each_sg` iterates through scatter-gather entries
- **Memory management** - `sg_virt` gets virtual address from scatter-gather entry
- **DMA direction** - Different directions for different transfer types

**Where**: Scatter-gather DMA is used in:

- **Network interfaces** - Transferring network packets from multiple buffers
- **Storage devices** - Transferring data to/from non-contiguous disk blocks
- **Graphics devices** - Transferring textures and frame data
- **Audio devices** - Transferring audio samples from multiple buffers
- **Custom hardware** - Application-specific scatter-gather operations

## DMA Pool Management

**What**: DMA pool management provides efficient allocation and management of small DMA buffers for frequent use.

**Why**: DMA pool management is important because:

- **Efficiency** provides efficient allocation of small DMA buffers
- **Performance** reduces allocation overhead for frequent operations
- **Memory management** prevents fragmentation of DMA memory
- **Resource optimization** optimizes DMA resource usage
- **System stability** ensures robust DMA memory management

**How**: DMA pool management is implemented through:

```c
// Example: DMA pool management
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/dma-mapping.h>
#include <linux/dma-direction.h>
#include <linux/mm.h>
#include <linux/slab.h>
#include <linux/platform_device.h>
#include <linux/dmapool.h>

// Device structure
struct my_dma_pool_device {
    struct device *dev;
    struct dma_pool *dma_pool;
    size_t pool_size;
    size_t buffer_size;
    struct mutex mutex;
    bool dma_enabled;
};

// Global device instance
static struct my_dma_pool_device *my_dev;

// DMA pool creation
static int create_dma_pool(struct my_dma_pool_device *dev) {
    printk(KERN_INFO "Creating DMA pool\n");

    // Create DMA pool
    dev->dma_pool = dma_pool_create("my_dma_pool", dev->dev, dev->buffer_size,
                                   dev->buffer_size, 0);
    if (!dev->dma_pool) {
        printk(KERN_ERR "Failed to create DMA pool\n");
        return -ENOMEM;
    }

    printk(KERN_INFO "DMA pool created: size=%zu, buffer_size=%zu\n",
           dev->pool_size, dev->buffer_size);

    return 0;
}

// DMA pool cleanup
static void cleanup_dma_pool(struct my_dma_pool_device *dev) {
    printk(KERN_INFO "Cleaning up DMA pool\n");

    if (dev->dma_pool) {
        dma_pool_destroy(dev->dma_pool);
        dev->dma_pool = NULL;
    }

    printk(KERN_INFO "DMA pool cleaned up\n");
}

// DMA buffer allocation from pool
static void *allocate_from_pool(struct my_dma_pool_device *dev, dma_addr_t *dma_addr) {
    void *virt_addr;

    printk(KERN_INFO "Allocating from DMA pool\n");

    if (!dev->dma_pool) {
        printk(KERN_ERR "DMA pool not created\n");
        return NULL;
    }

    // Allocate from pool
    virt_addr = dma_pool_alloc(dev->dma_pool, GFP_KERNEL, dma_addr);
    if (!virt_addr) {
        printk(KERN_ERR "Failed to allocate from DMA pool\n");
        return NULL;
    }

    printk(KERN_INFO "Allocated from DMA pool: virt=%p, dma=0x%llx\n",
           virt_addr, (unsigned long long)*dma_addr);

    return virt_addr;
}

// DMA buffer deallocation to pool
static void deallocate_to_pool(struct my_dma_pool_device *dev, void *virt_addr,
                              dma_addr_t dma_addr) {
    printk(KERN_INFO "Deallocating to DMA pool\n");

    if (!dev->dma_pool) {
        printk(KERN_ERR "DMA pool not created\n");
        return;
    }

    // Deallocate to pool
    dma_pool_free(dev->dma_pool, virt_addr, dma_addr);

    printk(KERN_INFO "Deallocated to DMA pool\n");
}

// DMA pool operations
static int perform_pool_operations(struct my_dma_pool_device *dev) {
    void *buffers[10];
    dma_addr_t dma_addrs[10];
    int i;

    printk(KERN_INFO "Performing DMA pool operations\n");

    // Allocate multiple buffers from pool
    for (i = 0; i < 10; i++) {
        buffers[i] = allocate_from_pool(dev, &dma_addrs[i]);
        if (!buffers[i]) {
            printk(KERN_ERR "Failed to allocate buffer %d from pool\n", i);
            goto cleanup;
        }

        // Use the buffer
        memset(buffers[i], 0xAA + i, dev->buffer_size);
    }

    printk(KERN_INFO "DMA pool operations successful\n");

cleanup:
    // Deallocate all buffers to pool
    for (i = 0; i < 10; i++) {
        if (buffers[i]) {
            deallocate_to_pool(dev, buffers[i], dma_addrs[i]);
        }
    }

    return 0;
}

// Device initialization
static int my_dma_pool_init(struct my_dma_pool_device *dev) {
    int ret;

    printk(KERN_INFO "Initializing DMA pool device\n");

    // Initialize mutex
    mutex_init(&dev->mutex);

    // Set pool parameters
    dev->pool_size = 1024 * 1024; // 1MB
    dev->buffer_size = 64; // 64 bytes per buffer

    // Initialize DMA state
    dev->dma_enabled = true;
    dev->dma_pool = NULL;

    // Create DMA pool
    ret = create_dma_pool(dev);
    if (ret) {
        printk(KERN_ERR "Failed to create DMA pool: %d\n", ret);
        return ret;
    }

    // Perform pool operations
    ret = perform_pool_operations(dev);
    if (ret) {
        printk(KERN_ERR "Failed to perform pool operations: %d\n", ret);
        cleanup_dma_pool(dev);
        return ret;
    }

    printk(KERN_INFO "DMA pool device initialized successfully\n");
    return 0;
}

// Device cleanup
static void my_dma_pool_cleanup(struct my_dma_pool_device *dev) {
    printk(KERN_INFO "Cleaning up DMA pool device\n");

    // Cleanup DMA pool
    cleanup_dma_pool(dev);

    printk(KERN_INFO "DMA pool device cleaned up\n");
}

// Platform driver probe
static int my_dma_pool_probe(struct platform_device *pdev) {
    struct my_dma_pool_device *dev;
    int ret;

    printk(KERN_INFO "Probing DMA pool device\n");

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev) {
        printk(KERN_ERR "Failed to allocate device structure\n");
        return -ENOMEM;
    }

    dev->dev = &pdev->dev;

    // Initialize device
    ret = my_dma_pool_init(dev);
    if (ret) {
        printk(KERN_ERR "Failed to initialize device: %d\n", ret);
        return ret;
    }

    // Set device data
    platform_set_drvdata(pdev, dev);
    my_dev = dev;

    printk(KERN_INFO "DMA pool device probed successfully\n");
    return 0;
}

// Platform driver remove
static int my_dma_pool_remove(struct platform_device *pdev) {
    struct my_dma_pool_device *dev = platform_get_drvdata(pdev);

    printk(KERN_INFO "Removing DMA pool device\n");

    // Cleanup device
    my_dma_pool_cleanup(dev);

    // Clear device data
    platform_set_drvdata(pdev, NULL);
    my_dev = NULL;

    printk(KERN_INFO "DMA pool device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver my_dma_pool_driver = {
    .probe = my_dma_pool_probe,
    .remove = my_dma_pool_remove,
    .driver = {
        .name = "my_dma_pool",
        .owner = THIS_MODULE,
    },
};

// Module initialization
static int __init my_dma_pool_init(void) {
    int ret;

    printk(KERN_INFO "Registering DMA pool driver\n");

    ret = platform_driver_register(&my_dma_pool_driver);
    if (ret) {
        printk(KERN_ERR "Failed to register platform driver: %d\n", ret);
        return ret;
    }

    printk(KERN_INFO "DMA pool driver registered successfully\n");
    return 0;
}

// Module cleanup
static void __exit my_dma_pool_exit(void) {
    printk(KERN_INFO "Unregistering DMA pool driver\n");

    platform_driver_unregister(&my_dma_pool_driver);

    printk(KERN_INFO "DMA pool driver unregistered\n");
}

module_init(my_dma_pool_init);
module_exit(my_dma_pool_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Your Name");
MODULE_DESCRIPTION("A DMA pool management example");
```

**Explanation**:

- **DMA pool** - `dma_pool_create` creates a pool for small DMA buffers
- **Pool allocation** - `dma_pool_alloc` allocates buffers from the pool
- **Pool deallocation** - `dma_pool_free` returns buffers to the pool
- **Pool destruction** - `dma_pool_destroy` destroys the pool
- **Efficient management** - Reduces allocation overhead for small buffers

**Where**: DMA pool management is used in:

- **Network interfaces** - Managing small network packet buffers
- **Storage devices** - Managing small disk block buffers
- **Audio devices** - Managing small audio sample buffers
- **Custom hardware** - Managing small hardware data buffers
- **High-frequency operations** - Operations requiring frequent small allocations

## Key Takeaways

**What** you've accomplished in this lesson:

1. **DMA Understanding** - You understand what DMA is and how it works
2. **Basic Operations** - You know how to implement basic DMA operations
3. **Scatter-Gather** - You understand scatter-gather DMA operations
4. **Pool Management** - You know how to manage DMA pools
5. **Performance Optimization** - You understand DMA performance optimization
6. **Resource Management** - You know how to manage DMA resources efficiently

**Why** these concepts matter:

- **Performance** provides the foundation for high-performance data transfer
- **Hardware integration** enables efficient hardware-software interaction
- **System optimization** optimizes system performance and responsiveness
- **Resource management** ensures efficient resource usage
- **Professional development** prepares you for embedded systems development

**When** to use these concepts:

- **High-performance devices** - Devices requiring high-speed data transfer
- **Network interfaces** - Network devices with high bandwidth requirements
- **Storage devices** - Storage controllers with high throughput requirements
- **Graphics devices** - Graphics cards with high data transfer requirements
- **Custom hardware** - Application-specific high-performance hardware

**Where** these skills apply:

- **Embedded Linux development** - Creating drivers for embedded systems
- **Device driver development** - Developing hardware drivers
- **System programming** - Low-level system development
- **Professional development** - Working in embedded systems
- **Open source contribution** - Contributing to kernel projects

## Next Steps

**What** you're ready for next:

After mastering DMA operations, you should be ready to:

1. **Create advanced drivers** - Implement complex device drivers
2. **Optimize performance** - Optimize system performance
3. **Debug kernel code** - Troubleshoot kernel-level issues
4. **Develop embedded systems** - Create complete embedded systems
5. **Work with real hardware** - Interface with actual hardware devices

**Where** to go next:

Continue with the next lesson on **"Advanced Driver Development"** to learn:

- How to create advanced device drivers
- Platform drivers and device tree integration
- Advanced driver patterns and techniques
- Professional driver development practices

**Why** the next lesson is important:

The next lesson builds directly on your DMA knowledge by showing you how to create advanced device drivers. You'll learn professional techniques for driver development and system integration.

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
