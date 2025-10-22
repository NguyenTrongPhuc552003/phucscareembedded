---
sidebar_position: 1
---

# DMA Fundamentals

Master Direct Memory Access (DMA) fundamentals in the Linux kernel, understanding how devices transfer data directly to/from memory without CPU intervention on the Rock 5B+ platform.

## What is DMA?

**What**: DMA (Direct Memory Access) is a hardware feature that allows devices to transfer data directly to/from system memory without CPU involvement, improving system performance and reducing CPU overhead.

**Why**: Understanding DMA is crucial because:

- **Performance** - Offloads data transfers from CPU
- **Efficiency** - CPU can perform other tasks during transfers
- **Device drivers** - Essential for high-performance drivers
- **System throughput** - Enables concurrent operations
- **Rock 5B+ development** - ARM64 specific DMA considerations
- **Professional development** - Critical for embedded systems

**When**: DMA is used when:

- **High-speed I/O** - Network, storage, multimedia devices
- **Bulk transfers** - Large data transfers
- **Real-time systems** - Low-latency data transfer
- **Device drivers** - Most modern device drivers
- **Rock 5B+** - ARM64 device drivers
- **Embedded applications** - Resource-constrained systems

**How**: DMA works by:

- **DMA controllers** - Hardware manages transfers
- **Memory buffers** - Allocating DMA-capable memory
- **Transfer setup** - Programming DMA controller
- **Interrupts** - Signaling transfer completion
- **Cache coherency** - Maintaining data consistency
- **Address translation** - IOMMU mapping

**Where**: DMA is found in:

- **Network devices** - Ethernet, WiFi controllers
- **Storage devices** - SD/MMC, NVMe controllers
- **Multimedia** - Audio, video capture/playback
- **GPUs** - Graphics processing
- **Rock 5B+** - ARM64 peripheral devices
- **RK3588 SoC** - On-chip DMA controllers

## DMA Transfer Types

**What**: DMA supports different transfer types including streaming and coherent DMA, each suited for different use cases.

**Why**: Understanding transfer types is important because:

- **Cache coherency** - Different coherency requirements
- **Performance** - Trade-offs between coherency and speed
- **Device constraints** - Some devices require specific types
- **Memory efficiency** - Optimal memory usage
- **ARM64 considerations** - Cache architecture specifics

**How**: DMA transfer types work through:

```c
// Example: DMA transfer types
#include <linux/dma-mapping.h>

// 1. Streaming DMA (cache-incoherent)
void streaming_dma_example(struct device *dev) {
    void *buffer;
    dma_addr_t dma_handle;
    size_t size = PAGE_SIZE;

    // Allocate buffer
    buffer = kmalloc(size, GFP_KERNEL);
    if (!buffer)
        return;

    // Map for DMA (device to memory)
    dma_handle = dma_map_single(dev, buffer, size, DMA_FROM_DEVICE);
    if (dma_mapping_error(dev, dma_handle)) {
        kfree(buffer);
        return;
    }

    // Program device with dma_handle
    device_start_dma(dev, dma_handle, size);

    // Wait for completion...

    // Unmap and sync cache
    dma_unmap_single(dev, dma_handle, size, DMA_FROM_DEVICE);

    // Now buffer contains device data
    process_data(buffer);
    kfree(buffer);
}

// 2. Coherent DMA (cache-coherent)
void coherent_dma_example(struct device *dev) {
    void *buffer;
    dma_addr_t dma_handle;
    size_t size = PAGE_SIZE;

    // Allocate coherent memory
    buffer = dma_alloc_coherent(dev, size, &dma_handle, GFP_KERNEL);
    if (!buffer)
        return;

    // No mapping needed - always coherent
    // Program device
    device_start_dma(dev, dma_handle, size);

    // Can access buffer anytime without sync
    memset(buffer, 0, size);

    // Free when done
    dma_free_coherent(dev, size, buffer, dma_handle);
}
```

**Explanation**:

- **Streaming DMA** - Requires explicit sync, better performance
- **Coherent DMA** - Always synchronized, easier to use
- **dma_map_single** - Map existing buffer for DMA
- **dma_alloc_coherent** - Allocate DMA-coherent memory
- **Performance trade-off** - Coherent slower but simpler

## DMA Direction

**What**: DMA direction specifies data flow: to device (DMA_TO_DEVICE), from device (DMA_FROM_DEVICE), or bidirectional (DMA_BIDIRECTIONAL).

**Why**: Understanding DMA direction is important because:

- **Cache management** - Different directions need different cache operations
- **Performance** - Correct direction improves efficiency
- **Data integrity** - Wrong direction causes data corruption
- **Optimization** - Minimal cache operations
- **ARM64 caches** - Direction affects cache flush/invalidate

**How**: DMA direction works through:

```c
// Example: DMA directions
// 1. DMA_TO_DEVICE - CPU writes, device reads
void dma_to_device_example(struct device *dev, void *data, size_t size) {
    dma_addr_t dma_handle;

    // Write data to buffer
    prepare_outgoing_data(data, size);

    // Map for device read
    dma_handle = dma_map_single(dev, data, size, DMA_TO_DEVICE);
    if (dma_mapping_error(dev, dma_handle))
        return;

    // Device reads from dma_handle
    device_transmit(dev, dma_handle, size);

    // Unmap after device completes
    dma_unmap_single(dev, dma_handle, size, DMA_TO_DEVICE);
}

// 2. DMA_FROM_DEVICE - Device writes, CPU reads
void dma_from_device_example(struct device *dev, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    // Map for device write
    dma_handle = dma_map_single(dev, buffer, size, DMA_FROM_DEVICE);
    if (dma_mapping_error(dev, dma_handle))
        return;

    // Device writes to dma_handle
    device_receive(dev, dma_handle, size);

    // Unmap and read data
    dma_unmap_single(dev, dma_handle, size, DMA_FROM_DEVICE);
    process_incoming_data(buffer, size);
}

// 3. DMA_BIDIRECTIONAL - Both directions
void dma_bidirectional_example(struct device *dev, void *buffer, size_t size) {
    dma_addr_t dma_handle;

    // Map for both read and write
    dma_handle = dma_map_single(dev, buffer, size, DMA_BIDIRECTIONAL);
    if (dma_mapping_error(dev, dma_handle))
        return;

    // Device can both read and write
    device_process(dev, dma_handle, size);

    dma_unmap_single(dev, dma_handle, size, DMA_BIDIRECTIONAL);
}
```

**Explanation**:

- **DMA_TO_DEVICE** - CPU to device transfer
- **DMA_FROM_DEVICE** - Device to CPU transfer
- **DMA_BIDIRECTIONAL** - Both directions, more overhead
- **Cache operations** - Direction determines cache flush/invalidate
- **Performance** - Use specific direction when possible

## IOMMU Support

**What**: IOMMU (Input-Output Memory Management Unit) provides address translation and protection for DMA operations, similar to MMU for CPU.

**Why**: Understanding IOMMU is important because:

- **Address translation** - Virtual addresses for devices
- **Memory protection** - Prevents unauthorized DMA access
- **Large address spaces** - Devices can access all memory
- **Scatter-gather** - Mapping non-contiguous physical memory
- **Rock 5B+ support** - RK3588 has IOMMU

**How**: IOMMU support works through:

```c
// Example: IOMMU-aware DMA
// 1. DMA mask setup (required for IOMMU)
int setup_device_dma(struct device *dev) {
    int ret;

    // Set DMA addressing capability
    ret = dma_set_mask_and_coherent(dev, DMA_BIT_MASK(64));
    if (ret) {
        // Fall back to 32-bit
        ret = dma_set_mask_and_coherent(dev, DMA_BIT_MASK(32));
        if (ret) {
            dev_err(dev, "No suitable DMA available\n");
            return ret;
        }
    }

    dev_info(dev, "DMA mask set successfully\n");
    return 0;
}

// 2. IOMMU mapping (transparent to driver)
// The DMA API handles IOMMU mapping automatically
void iommu_transparent_dma(struct device *dev) {
    void *buffer;
    dma_addr_t dma_addr;

    buffer = kmalloc(PAGE_SIZE, GFP_KERNEL);
    if (!buffer)
        return;

    // IOMMU mapping happens automatically
    dma_addr = dma_map_single(dev, buffer, PAGE_SIZE, DMA_TO_DEVICE);
    if (dma_mapping_error(dev, dma_addr)) {
        kfree(buffer);
        return;
    }

    // dma_addr is IOMMU-translated address
    program_device(dev, dma_addr);

    dma_unmap_single(dev, dma_addr, PAGE_SIZE, DMA_TO_DEVICE);
    kfree(buffer);
}

// 3. Check IOMMU availability
bool is_iommu_present(struct device *dev) {
    // Check if device is behind IOMMU
    return iommu_get_domain_for_dev(dev) != NULL;
}
```

**Explanation**:

- **DMA mask** - Specifies device addressing capability
- **Transparent mapping** - DMA API handles IOMMU automatically
- **Address translation** - IOMMU translates DMA addresses
- **Protection** - IOMMU prevents invalid DMA accesses

## Rock 5B+ DMA

**What**: The Rock 5B+ platform's ARM64 architecture and RK3588 SoC have specific DMA considerations including IOMMU support and cache coherency.

**Why**: Understanding Rock 5B+ DMA is important because:

- **ARM64 architecture** - Different cache architecture
- **IOMMU support** - Hardware IOMMU for address translation
- **RK3588 devices** - SoC-specific DMA controllers
- **Performance** - Platform-specific optimization
- **Cache coherency** - ARM64 cache management

**How**: Rock 5B+ DMA involves:

```bash
# Rock 5B+ DMA configuration and monitoring

# 1. Check IOMMU status
dmesg | grep -i iommu
# Look for "ARM SMMU" or "rockchip-iommu"

# 2. View DMA-capable memory zones
cat /proc/zoneinfo | grep -A 5 DMA

# 3. Check device DMA capabilities
ls -l /sys/devices/platform/*/dma/

# 4. Monitor DMA transfers (if driver supports)
cat /sys/kernel/debug/dmaengine/summary

# 5. View IOMMU domains
ls -l /sys/class/iommu/

# 6. Check DMA coherency
cat /sys/devices/system/cpu/cpu0/cache/index0/coherency_line_size
# Typically 64 bytes on ARM64
```

**Explanation**:

- **IOMMU detection** - Check for ARM SMMU support
- **DMA zones** - View DMA-capable memory regions
- **Device capabilities** - Per-device DMA configuration
- **Cache line size** - Important for DMA buffer alignment

## Key Takeaways

**What** you've accomplished:

1. **DMA Understanding** - You understand DMA fundamentals
2. **Transfer Types** - You know streaming vs coherent DMA
3. **DMA Direction** - You understand data flow directions
4. **IOMMU Support** - You know about address translation
5. **Rock 5B+ DMA** - You know ARM64 DMA considerations

**Why** these concepts matter:

- **Performance** - DMA critical for high-speed I/O
- **Device drivers** - Essential for driver development
- **System efficiency** - Offloading CPU from data transfers
- **Platform knowledge** - Rock 5B+ optimization opportunities

**When** to use these concepts:

- **Driver development** - All high-performance drivers
- **DMA buffer management** - Allocating and mapping buffers
- **Performance optimization** - Improving I/O throughput
- **Debugging** - Troubleshooting DMA issues

**Where** these skills apply:

- **Driver development** - All high-performance drivers
- **Kernel development** - Memory management
- **Embedded systems** - Resource optimization
- **Rock 5B+** - ARM64 device drivers

## Next Steps

Continue with:

1. **Coherent Memory Allocation** - DMA-coherent memory management
2. **DMA Mapping** - Advanced DMA mapping techniques

## Resources

**Official Documentation**:

- [DMA API](https://www.kernel.org/doc/html/latest/core-api/dma-api.html) - DMA programming guide
- [DMA Attributes](https://www.kernel.org/doc/html/latest/core-api/dma-attributes.html) - DMA attributes

**Learning Resources**:

- [Linux Device Drivers](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - DMA chapter

**Rock 5B+ Specific**:

- [ARM64 DMA](https://developer.arm.com/documentation/den0024/latest) - ARM64 DMA architecture
- [ARM SMMU](https://developer.arm.com/documentation/) - ARM System MMU

Happy learning! 🐧
