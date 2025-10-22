---
sidebar_position: 2
---

# Coherent Memory Allocation

Master coherent memory allocation techniques for DMA operations, understanding cache-coherent memory management for device drivers on the Rock 5B+ platform.

## What is Coherent Memory?

**What**: Coherent memory is DMA-capable memory that is always synchronized between CPU and device views, eliminating the need for explicit cache management operations.

**Why**: Understanding coherent memory is crucial because:

- **Simplicity** - No explicit cache synchronization needed
- **Reliability** - Prevents cache coherency bugs
- **Shared access** - CPU and device can access simultaneously
- **Device requirements** - Some devices require coherent memory
- **Rock 5B+ development** - ARM64 coherent memory management
- **Professional development** - Critical for robust driver development

**When**: Coherent memory is used when:

- **Concurrent access** - CPU and device access same data
- **Control structures** - DMA descriptor rings, command queues
- **Simplicity needed** - Avoiding complex cache management
- **Device requirements** - Hardware requires coherent memory
- **Small buffers** - Control and status buffers
- **ARM64 systems** - Cache coherency considerations

**How**: Coherent memory allocation works by:

- **Non-cached mapping** - Memory mapped as non-cacheable
- **Hardware coherency** - Using cache-coherent interconnect
- **Allocation API** - dma_alloc_coherent and variants
- **DMA pools** - Efficient small object allocation
- **Address mapping** - Virtual to DMA address translation
- **Memory attributes** - ARM64 specific memory types

**Where**: Coherent memory is found in:

- **Device drivers** - DMA descriptor rings
- **Network drivers** - TX/RX descriptor rings
- **Storage drivers** - Command/completion queues
- **GPU drivers** - Command buffers
- **Rock 5B+** - ARM64 device drivers
- **RK3588 peripherals** - On-chip device drivers

## Coherent Memory APIs

**What**: The Linux kernel provides several APIs for allocating coherent DMA memory, each suited for different use cases.

**Why**: Understanding allocation APIs is important because:

- **Flexibility** - Different APIs for different needs
- **Performance** - Choosing appropriate API improves efficiency
- **Memory efficiency** - Minimizing coherent memory usage
- **Resource management** - Proper allocation and deallocation

**How**: Coherent memory APIs work through:

```c
// Example: Coherent memory allocation APIs
#include <linux/dma-mapping.h>

// 1. Basic coherent allocation
void *alloc_coherent_buffer(struct device *dev) {
    void *vaddr;
    dma_addr_t dma_handle;
    size_t size = PAGE_SIZE;

    // Allocate coherent memory
    vaddr = dma_alloc_coherent(dev, size, &dma_handle, GFP_KERNEL);
    if (!vaddr) {
        dev_err(dev, "Failed to allocate coherent memory\n");
        return NULL;
    }

    dev_info(dev, "Allocated coherent buffer: vaddr=%p, dma=%pad\n",
             vaddr, &dma_handle);

    // Initialize buffer
    memset(vaddr, 0, size);

    // Use buffer for DMA...

    // Free when done
    dma_free_coherent(dev, size, vaddr, dma_handle);

    return NULL;
}

// 2. Allocate with specific GFP flags
void *alloc_coherent_atomic(struct device *dev) {
    void *vaddr;
    dma_addr_t dma_handle;

    // Allocate in atomic context (cannot sleep)
    vaddr = dma_alloc_coherent(dev, PAGE_SIZE, &dma_handle, GFP_ATOMIC);
    if (!vaddr)
        return NULL;

    // Use and free
    dma_free_coherent(dev, PAGE_SIZE, vaddr, dma_handle);
    return NULL;
}

// 3. Allocate with write-combine attribute
void *alloc_wc_buffer(struct device *dev) {
    void *vaddr;
    dma_addr_t dma_handle;

    // Allocate write-combine memory (better for write-only buffers)
    vaddr = dma_alloc_wc(dev, PAGE_SIZE, &dma_handle, GFP_KERNEL);
    if (!vaddr)
        return NULL;

    // Use and free
    dma_free_wc(dev, PAGE_SIZE, vaddr, dma_handle);
    return NULL;
}

// 4. Allocate non-coherent memory
void *alloc_noncoherent_buffer(struct device *dev) {
    void *vaddr;
    dma_addr_t dma_handle;

    // Allocate non-coherent (requires manual sync)
    vaddr = dma_alloc_noncoherent(dev, PAGE_SIZE, &dma_handle,
                                  DMA_TO_DEVICE, GFP_KERNEL);
    if (!vaddr)
        return NULL;

    // Sync before device access
    dma_sync_single_for_device(dev, dma_handle, PAGE_SIZE, DMA_TO_DEVICE);

    // Free
    dma_free_noncoherent(dev, PAGE_SIZE, vaddr, dma_handle, DMA_TO_DEVICE);
    return NULL;
}
```

**Explanation**:

- **dma_alloc_coherent** - Standard coherent allocation
- **dma_alloc_wc** - Write-combine memory attribute
- **dma_alloc_noncoherent** - Non-coherent with manual sync
- **GFP flags** - Control allocation behavior
- **Memory attributes** - Different cache/buffer policies

## DMA Pools

**What**: DMA pools provide efficient allocation of small coherent DMA buffers, reducing overhead and fragmentation.

**Why**: Understanding DMA pools is important because:

- **Efficiency** - Fast allocation of small buffers
- **Memory savings** - Reduces internal fragmentation
- **Performance** - Pool allocation faster than page allocation
- **Resource management** - Better memory utilization

**How**: DMA pools work through:

```c
// Example: DMA pool usage
#include <linux/dmapool.h>

struct my_driver {
    struct device *dev;
    struct dma_pool *desc_pool;
    // ...
};

// 1. Create DMA pool
int create_dma_pool(struct my_driver *drv) {
    // Create pool for 64-byte descriptors
    drv->desc_pool = dma_pool_create("my_desc_pool",
                                     drv->dev,
                                     64,      // Size
                                     64,      // Alignment
                                     0);      // Boundary

    if (!drv->desc_pool) {
        dev_err(drv->dev, "Failed to create DMA pool\n");
        return -ENOMEM;
    }

    dev_info(drv->dev, "Created DMA pool\n");
    return 0;
}

// 2. Allocate from pool
void *alloc_from_pool(struct my_driver *drv, dma_addr_t *dma_handle) {
    void *vaddr;

    // Allocate descriptor from pool
    vaddr = dma_pool_alloc(drv->desc_pool, GFP_KERNEL, dma_handle);
    if (!vaddr) {
        dev_err(drv->dev, "Pool allocation failed\n");
        return NULL;
    }

    // Initialize descriptor
    memset(vaddr, 0, 64);

    return vaddr;
}

// 3. Free to pool
void free_to_pool(struct my_driver *drv, void *vaddr, dma_addr_t dma_handle) {
    dma_pool_free(drv->desc_pool, vaddr, dma_handle);
}

// 4. Destroy pool
void destroy_dma_pool(struct my_driver *drv) {
    if (drv->desc_pool) {
        dma_pool_destroy(drv->desc_pool);
        drv->desc_pool = NULL;
    }
}

// 5. Complete example
int driver_probe(struct my_driver *drv) {
    void *desc;
    dma_addr_t dma_addr;
    int ret;

    // Create pool
    ret = create_dma_pool(drv);
    if (ret)
        return ret;

    // Allocate descriptor
    desc = alloc_from_pool(drv, &dma_addr);
    if (!desc) {
        destroy_dma_pool(drv);
        return -ENOMEM;
    }

    // Use descriptor for DMA...
    program_device(drv->dev, dma_addr);

    // Free descriptor
    free_to_pool(drv, desc, dma_addr);

    return 0;
}

void driver_remove(struct my_driver *drv) {
    destroy_dma_pool(drv);
}
```

**Explanation**:

- **dma_pool_create** - Create pool for fixed-size buffers
- **dma_pool_alloc** - Allocate from pool
- **dma_pool_free** - Return to pool
- **dma_pool_destroy** - Destroy pool
- **Alignment** - Specify buffer alignment requirements

## Rock 5B+ Coherent Memory

**What**: The Rock 5B+ platform's ARM64 architecture has specific coherent memory considerations for cache management and performance.

**Why**: Understanding Rock 5B+ coherent memory is important because:

- **ARM64 caches** - Different cache architecture
- **Memory attributes** - ARM64 specific memory types
- **Performance** - Coherent memory slower than cached
- **Power efficiency** - Cache impact on power consumption
- **RK3588 optimization** - SoC-specific considerations

**How**: Rock 5B+ coherent memory involves:

```bash
# Rock 5B+ coherent memory configuration and monitoring

# 1. Check DMA coherent pool
cat /proc/meminfo | grep -i dma
dmesg | grep "DMA: preallocated"

# 2. View cache information
ls /sys/devices/system/cpu/cpu0/cache/
cat /sys/devices/system/cpu/cpu0/cache/index*/type
cat /sys/devices/system/cpu/cpu0/cache/index*/size

# 3. Monitor coherent memory usage
cat /proc/meminfo | grep -E 'CmaTotal|CmaFree'

# 4. Check DMA mask for devices
for dev in /sys/bus/platform/devices/*; do
    [ -f "$dev/dma_mask_bits" ] && echo "$dev: $(cat $dev/dma_mask_bits)"
done

# 5. ARM64 cache line size
getconf LEVEL1_DCACHE_LINESIZE
# Important for buffer alignment

# 6. Check IOMMU coherency
dmesg | grep -i "coherent"
```

**Explanation**:

- **DMA coherent pool** - Pre-allocated coherent memory
- **Cache information** - ARM64 cache hierarchy
- **CMA** - Contiguous Memory Allocator for large buffers
- **DMA mask** - Device addressing capabilities
- **Cache line size** - Buffer alignment requirements

## Key Takeaways

**What** you've accomplished:

1. **Coherent Memory Understanding** - You understand cache-coherent DMA memory
2. **Allocation APIs** - You know various coherent allocation methods
3. **DMA Pools** - You can use pools for efficient small allocations
4. **Rock 5B+ Coherent** - You know ARM64 specific considerations

**Why** these concepts matter:

- **Driver reliability** - Proper coherent memory prevents bugs
- **Performance** - Understanding trade-offs between coherent and streaming
- **Resource efficiency** - Minimizing coherent memory usage
- **Platform knowledge** - Rock 5B+ optimization

**When** to use these concepts:

- **Control structures** - DMA descriptor rings
- **Shared buffers** - CPU and device concurrent access
- **Small allocations** - Using DMA pools
- **Simple drivers** - When streaming DMA complexity not needed

**Where** these skills apply:

- **Driver development** - All DMA-capable drivers
- **Network drivers** - Descriptor ring management
- **Storage drivers** - Command queue management
- **Rock 5B+** - ARM64 device drivers

## Next Steps

Continue with:

1. **DMA Mapping** - Advanced streaming DMA techniques

## Resources

**Official Documentation**:

- [DMA API](https://www.kernel.org/doc/html/latest/core-api/dma-api.html) - DMA programming guide
- [DMA Pool](https://www.kernel.org/doc/html/latest/core-api/dma-api.html#dma-pool) - DMA pool API

**Learning Resources**:

- [Linux Device Drivers](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - DMA chapter

**Rock 5B+ Specific**:

- [ARM64 Memory](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory types

Happy learning! 🐧
