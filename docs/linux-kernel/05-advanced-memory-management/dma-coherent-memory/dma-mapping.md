---
sidebar_position: 3
---

# DMA Mapping

Master DMA mapping techniques for efficient device I/O, understanding how to map memory for DMA operations while maintaining cache coherency on the Rock 5B+ platform.

## What is DMA Mapping?

**What**: DMA mapping is the process of preparing memory buffers for DMA transfers by establishing the mapping between virtual/physical addresses and device-accessible DMA addresses, including proper cache management.

**Why**: Understanding DMA mapping is crucial because:

- **Performance** - Efficient data transfer between device and memory
- **Cache coherency** - Proper cache synchronization
- **Address translation** - IOMMU address mapping
- **Device compatibility** - Meeting device addressing constraints
- **Zero-copy I/O** - Avoiding unnecessary memory copies
- **Rock 5B+ optimization** - ARM64 specific cache operations

**When**: DMA mapping is used when:

- **Streaming I/O** - Network packets, disk I/O
- **Scatter-gather** - Non-contiguous memory transfers
- **Large transfers** - Mapping existing buffers
- **Performance critical** - Avoiding memory copies
- **Driver development** - High-performance device drivers
- **ARM64 systems** - Cache management required

**How**: DMA mapping works by:

- **Address translation** - Virtual to DMA address mapping
- **Cache operations** - Flush/invalidate as needed
- **IOMMU mapping** - Hardware address translation
- **Direction specification** - Optimize cache operations
- **Synchronization** - Ensuring data consistency
- **Unmapping** - Cleanup and cache invalidation

**Where**: DMA mapping is found in:

- **Network drivers** - Packet transmission/reception
- **Storage drivers** - Block I/O operations
- **Multimedia drivers** - Audio/video streaming
- **GPU drivers** - Graphics data transfer
- **Rock 5B+** - All high-performance ARM64 drivers
- **RK3588 peripherals** - On-chip DMA devices

## Single Buffer Mapping

**What**: Single buffer mapping maps a contiguous virtual memory buffer for DMA access, handling cache coherency automatically.

**Why**: Understanding single buffer mapping is important because:

- **Simplicity** - Easiest DMA mapping method
- **Common use case** - Many drivers use single buffers
- **Cache management** - Automatic cache operations
- **Error handling** - Proper error checking required

**How**: Single buffer mapping works through:

```c
// Example: Single buffer DMA mapping
#include <linux/dma-mapping.h>

// 1. Basic single buffer mapping
int map_single_buffer(struct device *dev, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    // Map buffer for DMA (CPU to device)
    dma_handle = dma_map_single(dev, buffer, size, DMA_TO_DEVICE);
    if (dma_mapping_error(dev, dma_handle)) {
        dev_err(dev, "DMA mapping failed\n");
        return -EIO;
    }

    // Program device with DMA address
    program_device_dma(dev, dma_handle, size);

    // Wait for DMA completion
    wait_for_dma_complete(dev);

    // Unmap buffer
    dma_unmap_single(dev, dma_handle, size, DMA_TO_DEVICE);

    return 0;
}

// 2. Bidirectional mapping
int map_bidirectional(struct device *dev, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    // Map for both read and write
    dma_handle = dma_map_single(dev, buffer, size, DMA_BIDIRECTIONAL);
    if (dma_mapping_error(dev, dma_handle))
        return -EIO;

    // Device can both read and write
    device_process_buffer(dev, dma_handle, size);

    dma_unmap_single(dev, dma_handle, size, DMA_BIDIRECTIONAL);

    return 0;
}

// 3. Mapping with sync
int map_with_sync(struct device *dev, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    // Map buffer
    dma_handle = dma_map_single(dev, buffer, size, DMA_FROM_DEVICE);
    if (dma_mapping_error(dev, dma_handle))
        return -EIO;

    // Start DMA
    start_device_dma(dev, dma_handle, size);

    // Sync before CPU access (if needed during transfer)
    dma_sync_single_for_cpu(dev, dma_handle, size, DMA_FROM_DEVICE);

    // CPU can now safely read data
    process_partial_data(buffer, size);

    // Sync before device continues
    dma_sync_single_for_device(dev, dma_handle, size, DMA_FROM_DEVICE);

    // Wait for completion
    wait_for_dma_complete(dev);

    // Unmap
    dma_unmap_single(dev, dma_handle, size, DMA_FROM_DEVICE);

    return 0;
}

// 4. Page mapping
int map_page_buffer(struct device *dev, struct page *page) {
    dma_addr_t dma_handle;

    // Map a page
    dma_handle = dma_map_page(dev, page, 0, PAGE_SIZE, DMA_TO_DEVICE);
    if (dma_mapping_error(dev, dma_handle))
        return -EIO;

    // Use page for DMA
    program_device_dma(dev, dma_handle, PAGE_SIZE);

    // Unmap
    dma_unmap_page(dev, dma_handle, PAGE_SIZE, DMA_TO_DEVICE);

    return 0;
}
```

**Explanation**:

- **dma_map_single** - Map virtual buffer to DMA address
- **dma_mapping_error** - Check for mapping errors
- **dma_sync_single_for_cpu/device** - Sync during transfer
- **dma_unmap_single** - Unmap and cleanup
- **Direction** - Optimize cache operations

## Scatter-Gather Mapping

**What**: Scatter-gather mapping allows DMA operations on non-contiguous memory buffers, improving memory utilization and performance.

**Why**: Understanding scatter-gather is important because:

- **Memory efficiency** - Use non-contiguous memory
- **Large transfers** - Handle buffers larger than available contiguous memory
- **Performance** - Avoid memory copying
- **Flexibility** - Work with fragmented buffers

**How**: Scatter-gather mapping works through:

```c
// Example: Scatter-gather DMA mapping
#include <linux/scatterlist.h>

// 1. Basic scatter-gather mapping
int map_sg_buffer(struct device *dev, struct scatterlist *sg, int nents) {
    int mapped_nents;

    // Map scatter-gather list
    mapped_nents = dma_map_sg(dev, sg, nents, DMA_TO_DEVICE);
    if (!mapped_nents) {
        dev_err(dev, "SG mapping failed\n");
        return -EIO;
    }

    // Program device with SG list
    program_device_sg(dev, sg, mapped_nents);

    // Wait for completion
    wait_for_dma_complete(dev);

    // Unmap
    dma_unmap_sg(dev, sg, nents, DMA_TO_DEVICE);

    return 0;
}

// 2. Create and map scatter-gather list
int create_and_map_sg(struct device *dev, void *buffer, size_t size) {
    struct scatterlist *sg;
    int nents, mapped_nents;
    int i;

    // Determine number of entries needed
    nents = (size + PAGE_SIZE - 1) / PAGE_SIZE;

    // Allocate SG table
    sg = kmalloc_array(nents, sizeof(*sg), GFP_KERNEL);
    if (!sg)
        return -ENOMEM;

    // Initialize SG list
    sg_init_table(sg, nents);

    // Fill SG entries
    for (i = 0; i < nents; i++) {
        size_t len = min_t(size_t, size, PAGE_SIZE);
        sg_set_buf(&sg[i], buffer + i * PAGE_SIZE, len);
        size -= len;
    }

    // Map SG list
    mapped_nents = dma_map_sg(dev, sg, nents, DMA_TO_DEVICE);
    if (!mapped_nents) {
        kfree(sg);
        return -EIO;
    }

    // Use SG list for DMA
    program_device_sg(dev, sg, mapped_nents);

    // Cleanup
    dma_unmap_sg(dev, sg, nents, DMA_TO_DEVICE);
    kfree(sg);

    return 0;
}

// 3. Iterate over mapped SG list
void program_device_sg(struct device *dev, struct scatterlist *sg, int nents) {
    struct scatterlist *s;
    int i;

    // Iterate over mapped entries
    for_each_sg(sg, s, nents, i) {
        dma_addr_t dma_addr = sg_dma_address(s);
        unsigned int dma_len = sg_dma_len(s);

        dev_dbg(dev, "SG entry %d: dma=%pad, len=%u\n",
                i, &dma_addr, dma_len);

        // Program device with this segment
        add_dma_segment(dev, dma_addr, dma_len);
    }

    // Start DMA
    start_sg_dma(dev);
}

// 4. SG mapping with pages
int map_sg_pages(struct device *dev, struct page **pages, int npages) {
    struct scatterlist *sg;
    int i, mapped_nents;

    // Allocate SG table
    sg = kmalloc_array(npages, sizeof(*sg), GFP_KERNEL);
    if (!sg)
        return -ENOMEM;

    sg_init_table(sg, npages);

    // Set up SG entries from pages
    for (i = 0; i < npages; i++)
        sg_set_page(&sg[i], pages[i], PAGE_SIZE, 0);

    // Map SG list
    mapped_nents = dma_map_sg(dev, sg, npages, DMA_BIDIRECTIONAL);
    if (!mapped_nents) {
        kfree(sg);
        return -EIO;
    }

    // Use and unmap
    program_device_sg(dev, sg, mapped_nents);
    dma_unmap_sg(dev, sg, npages, DMA_BIDIRECTIONAL);
    kfree(sg);

    return 0;
}
```

**Explanation**:

- **dma_map_sg** - Map scatter-gather list
- **sg_init_table** - Initialize SG table
- **sg_set_buf/sg_set_page** - Set up SG entries
- **for_each_sg** - Iterate over mapped entries
- **sg_dma_address/sg_dma_len** - Get mapped DMA info

## Rock 5B+ DMA Mapping

**What**: The Rock 5B+ platform requires specific considerations for DMA mapping on ARM64 architecture, particularly regarding cache management.

**Why**: Understanding Rock 5B+ DMA mapping is important because:

- **ARM64 caches** - Explicit cache management needed
- **IOMMU support** - RK3588 IOMMU integration
- **Performance** - Optimizing cache operations
- **Cache coherency** - Ensuring data consistency
- **Power efficiency** - Minimizing cache operations

**How**: Rock 5B+ DMA mapping involves:

```bash
# Rock 5B+ DMA mapping configuration and monitoring

# 1. Check DMA mapping capabilities
cat /sys/devices/platform/*/dma/dma_mask
cat /sys/devices/platform/*/dma/coherent_dma_mask

# 2. Monitor DMA operations
cat /sys/kernel/debug/dma-buf/bufinfo

# 3. View IOMMU mappings
cat /sys/kernel/debug/iommu/*/mappings

# 4. Check cache line size (important for buffer alignment)
getconf LEVEL1_DCACHE_LINESIZE
# Typically 64 bytes - buffers should be aligned

# 5. Monitor DMA errors
dmesg | grep -i "dma.*error"

# 6. View DMA statistics (if enabled)
cat /proc/vmstat | grep dma

# 7. Check device DMA configuration
for dev in /sys/bus/platform/devices/*; do
    if [ -d "$dev/dma" ]; then
        echo "$dev:"
        cat "$dev/dma/dma_mask" 2>/dev/null
    fi
done
```

**Explanation**:

- **DMA masks** - Device addressing capabilities
- **IOMMU mappings** - Hardware address translation
- **Cache alignment** - 64-byte alignment for ARM64
- **Error monitoring** - Detecting DMA issues
- **Performance tuning** - Optimizing DMA operations

## Key Takeaways

**What** you've accomplished:

1. **DMA Mapping Understanding** - You understand streaming DMA mapping
2. **Single Buffer Mapping** - You can map contiguous buffers
3. **Scatter-Gather Mapping** - You can map non-contiguous buffers
4. **Synchronization** - You know when and how to sync
5. **Rock 5B+ DMA** - You understand ARM64 specific requirements

**Why** these concepts matter:

- **Performance** - Zero-copy I/O critical for throughput
- **Efficiency** - Proper mapping avoids memory waste
- **Correctness** - Cache coherency prevents data corruption
- **Platform knowledge** - Rock 5B+ optimization

**When** to use these concepts:

- **Network drivers** - Packet transmission/reception
- **Storage drivers** - Block I/O operations
- **Streaming I/O** - Audio/video data transfer
- **High-performance drivers** - Any DMA-capable device

**Where** these skills apply:

- **Driver development** - All high-performance drivers
- **Kernel development** - DMA subsystem
- **Embedded systems** - Resource optimization
- **Rock 5B+** - ARM64 device drivers

## Next Steps

Continue with Chapter 5 Memory Debugging and Profiling section:

1. **Memory Leak Detection** - Detect and fix memory leaks
2. **Memory Profiling** - Analyze memory usage patterns
3. **OOM Handling** - Handle out-of-memory conditions

## Resources

**Official Documentation**:

- [DMA API How-To](https://www.kernel.org/doc/html/latest/core-api/dma-api-howto.html) - DMA mapping guide
- [DMA API](https://www.kernel.org/doc/html/latest/core-api/dma-api.html) - Complete DMA API reference

**Learning Resources**:

- [Linux Device Drivers](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - DMA chapter

**Rock 5B+ Specific**:

- [ARM64 DMA](https://developer.arm.com/documentation/den0024/latest) - ARM64 DMA and caches

Happy learning! 🐧
