---
sidebar_position: 4
---

# Early Memory Setup

Master RISC-V Linux kernel early memory setup during boot, understanding how memory is discovered, reserved regions are marked, bootmem allocator is initialized, and the foundation for kernel memory management is established.

## What Is Early Memory Setup?

**What**: Early memory setup is the process during kernel boot where physical memory is discovered, mapped, reserved regions are marked, and initial memory allocators are initialized. This happens before the full page allocator is ready and uses simpler bootmem or memblock allocators.

**Why**: Understanding early memory setup is crucial because:

- **Memory Discovery** - Kernel must discover available physical memory
- **Reservation** - Critical regions must be reserved and protected
- **Early Allocation** - Early boot code needs memory before page allocator
- **Foundation** - Establishes foundation for full memory management
- **Boot Requirements** - Essential for kernel initialization to proceed
- **Platform Support** - Memory discovery depends on hardware platform

**When**: Early memory setup occurs when:

- **Kernel Boot** - During early kernel initialization
- **Memory Discovery** - When kernel discovers available memory
- **Device Tree Parsing** - During device tree parsing for memory nodes
- **Reservation Setup** - When marking reserved memory regions
- **Allocator Init** - When initializing early memory allocators
- **Before MMU** - Often happens before virtual memory is fully enabled

**How**: Early memory setup works through:

- **Memory Discovery** - Parse device tree or BIOS/e firmware tables
- **Memory Regions** - Identify memory banks and regions
- **Reservation** - Mark reserved regions (kernel, DTB, initrd)
- **Allocator Init** - Initialize bootmem or memblock allocator
- **Zone Setup** - Setup initial memory zones
- **Page Frame Tracking** - Initialize page frame structures

**Where**: Early memory setup is found in:

- **Kernel Boot Code** - arch/riscv/mm/init.c
- **Memblock Allocator** - mm/memblock.c
- **Device Tree Parsing** - arch/riscv/kernel/setup.c
- **Platform Code** - Platform-specific memory setup
- **Architecture Init** - Architecture initialization code

## Memory Discovery

**What**: Memory discovery identifies available physical memory regions from device tree or firmware.

**How**: Memory discovery works:

```c
// Example: Memory discovery from device tree
// Device tree memory nodes describe available memory

void early_init_dt_scan_memory(void) {
    void *dtb = initial_boot_params;
    int node, len;
    const __be32 *reg;
    unsigned long base, size;

    // Find memory node(s)
    // Device tree may have multiple memory nodes or single node with multiple ranges
    node = fdt_path_offset(dtb, "/memory");

    if (node < 0) {
        // Try alternative path
        node = fdt_subnode_offset(dtb, 0, "memory");
    }

    if (node < 0) {
        pr_warn("No memory node in device tree\n");
        // Fallback to hardcoded memory (for simple systems)
        memblock_add(0x80000000, 0x10000000);  // Default 256MB at 0x80000000
        return;
    }

    // Get address and size cell counts
    int addr_cells = fdt_address_cells(dtb, node);
    int size_cells = fdt_size_cells(dtb, node);

    if (addr_cells < 0 || size_cells < 0) {
        pr_warn("Invalid memory node format\n");
        return;
    }

    // Read memory ranges
    reg = fdt_getprop(dtb, node, "reg", &len);
    if (!reg || len == 0) {
        pr_warn("No memory ranges in device tree\n");
        return;
    }

    // Parse each memory range
    int num_ranges = len / ((addr_cells + size_cells) * sizeof(__be32));

    for (int i = 0; i < num_ranges; i++) {
        // Extract base address
        base = fdt_read_number(reg + (i * (addr_cells + size_cells)), addr_cells);

        // Extract size
        size = fdt_read_number(reg + (i * (addr_cells + size_cells)) + addr_cells, size_cells);

        // Add memory region to memblock
        memblock_add(base, size);

        pr_info("Memory range %d: %016lx - %016lx (%lu MB)\n",
                i, base, base + size, size / (1024 * 1024));
    }
}

// Example: Memory range structure
struct memblock_region {
    unsigned long base;
    unsigned long size;
    unsigned long flags;
    int nid;  // NUMA node ID
};

// Example: Adding memory region
void memblock_add(unsigned long base, unsigned long size) {
    // Add memory region to memblock allocator
    // This memory becomes available for allocation

    // Validate region
    if (size == 0) {
        return;  // Zero size region, ignore
    }

    // Align base and size
    base = ALIGN(base, PAGE_SIZE);
    size = ALIGN(size, PAGE_SIZE);

    // Check for overlaps with existing regions
    // Merge adjacent regions if possible

    // Add to memory regions list
    memblock_add_range(&memblock.memory, base, size,
                       MAX_NUMNODES, 0);
}

// Example: Memory discovery from hardware (alternative)
void discover_memory_from_hw(void) {
    // Some systems may provide memory information via other means:
    // - SBI calls
    // - Platform-specific registers
    // - Firmware tables

    // Example: Query memory via SBI (if available)
    struct sbiret ret;
    ret = sbi_query_memory();

    if (ret.error == SBI_SUCCESS) {
        memblock_add(ret.value, ret.value1);
    }
}
```

**Explanation**:

- **Device tree source** memory nodes describe physical memory
- **Multiple ranges** system can have multiple memory regions
- **Cell sizes** address and size cells determine format
- **Memblock** memblock allocator tracks memory regions
- **Hardware discovery** alternative methods for memory discovery

## Memory Reservation

**What**: Memory reservation marks regions that cannot be used for general allocation (kernel, device tree, initrd, etc.).

**How**: Memory reservation works:

```c
// Example: Reserving critical memory regions
void setup_memory_reservations(void) {
    // Reserve kernel code and data
    reserve_kernel_memory();

    // Reserve device tree blob
    reserve_device_tree();

    // Reserve initial RAM disk (if present)
    reserve_initrd();

    // Reserve bootloader and firmware
    reserve_firmware_regions();

    // Reserve platform-specific regions
    reserve_platform_memory();
}

// Example: Reserving kernel memory
void reserve_kernel_memory(void) {
    unsigned long kernel_start = __pa(_start);
    unsigned long kernel_end = __pa(_end);
    unsigned long kernel_size = kernel_end - kernel_start;

    // Reserve kernel text and data
    memblock_reserve(kernel_start, kernel_size);

    pr_info("Kernel memory: %016lx - %016lx (%lu KB)\n",
            kernel_start, kernel_end, kernel_size / 1024);

    // Also reserve BSS section (if separate)
    if (__bss_start != _end) {
        unsigned long bss_start = __pa(__bss_start);
        unsigned long bss_end = __pa(__bss_stop);
        memblock_reserve(bss_start, bss_end - bss_start);
    }
}

// Example: Reserving device tree
void reserve_device_tree(void) {
    unsigned long dtb_start = boot_dtb_addr;
    unsigned long dtb_size;

    if (dtb_start == 0) {
        return;  // No device tree
    }

    // Get DTB size from FDT header
    void *dtb = __va(dtb_start);
    dtb_size = fdt_totalsize(dtb);

    // Align size
    dtb_size = ALIGN(dtb_size, PAGE_SIZE);

    // Reserve device tree
    memblock_reserve(dtb_start, dtb_size);

    pr_info("Device tree: %016lx - %016lx (%lu KB)\n",
            dtb_start, dtb_start + dtb_size, dtb_size / 1024);
}

// Example: Reserving initramfs
void reserve_initrd(void) {
    unsigned long initrd_start, initrd_end;

    // Get initrd information from device tree
    void *dtb = initial_boot_params;
    int node = fdt_path_offset(dtb, "/chosen");

    if (node < 0) {
        return;  // No chosen node
    }

    const __be32 *prop;
    int len;

    // Get initrd start
    prop = fdt_getprop(dtb, node, "linux,initrd-start", &len);
    if (prop && len >= sizeof(__be32)) {
        initrd_start = fdt32_to_cpu(prop[0]);
    } else {
        return;  // No initrd
    }

    // Get initrd end
    prop = fdt_getprop(dtb, node, "linux,initrd-end", &len);
    if (prop && len >= sizeof(__be32)) {
        initrd_end = fdt32_to_cpu(prop[0]);
    } else {
        return;
    }

    // Reserve initrd
    memblock_reserve(initrd_start, initrd_end - initrd_start);

    pr_info("Initrd: %016lx - %016lx (%lu MB)\n",
            initrd_start, initrd_end,
            (initrd_end - initrd_start) / (1024 * 1024));
}

// Example: Reserving firmware regions
void reserve_firmware_regions(void) {
    // Reserve OpenSBI region
    memblock_reserve(OPENSBI_BASE, OPENSBI_SIZE);

    // Reserve U-Boot region (if still in memory)
    memblock_reserve(UBOOT_BASE, UBOOT_SIZE);

    // Platform-specific firmware regions
    // (Device tree may describe these)
    reserve_platform_firmware();
}

// Example: Platform-specific reservations
void reserve_platform_memory(void) {
    void *dtb = initial_boot_params;
    int node;
    const __be32 *prop;
    int len;

    // Look for reserved-memory node
    node = fdt_path_offset(dtb, "/reserved-memory");
    if (node < 0) {
        return;  // No reserved memory node
    }

    // Parse reserved memory regions
    fdt_for_each_subnode(node, dtb, node) {
        const char *name = fdt_get_name(dtb, node, NULL);
        prop = fdt_getprop(dtb, node, "reg", &len);

        if (prop && len > 0) {
            unsigned long base, size;
            int addr_cells = fdt_address_cells(dtb, node);
            int size_cells = fdt_size_cells(dtb, node);

            base = fdt_read_number(prop, addr_cells);
            size = fdt_read_number(prop + addr_cells, size_cells);

            memblock_reserve(base, size);

            pr_info("Reserved memory: %s at %016lx (%lu KB)\n",
                    name, base, size / 1024);
        }
    }
}
```

**Explanation**:

- **Kernel reservation** kernel code and data must be reserved
- **DTB reservation** device tree blob must not be overwritten
- **Initrd reservation** initial RAM disk reserved if present
- **Firmware reservation** bootloader and firmware regions reserved
- **Platform reservations** platform-specific reserved regions

## Bootmem Allocator

**What**: Bootmem allocator is a simple early memory allocator used before the page allocator is ready.

**How**: Bootmem allocator works:

```c
// Example: Bootmem allocator structure
struct bootmem_data {
    unsigned long node_min_pfn;      // First PFN in node
    unsigned long node_low_pfn;      // Last PFN in node
    void *node_bootmem_map;          // Bitmap for allocation tracking
    unsigned long last_end_off;       // Last allocated offset
    unsigned long hint_idx;          // Hint for next allocation
};

// Example: Initializing bootmem
void init_bootmem(unsigned long start_pfn, unsigned long end_pfn) {
    unsigned long mapsize;

    // Calculate bitmap size (one bit per page)
    mapsize = bootmem_bootmap_pages(end_pfn - start_pfn) * PAGE_SIZE;

    // Allocate bitmap (using memblock)
    void *bootmem_map = memblock_alloc(mapsize, PAGE_SIZE);
    if (!bootmem_map) {
        panic("Failed to allocate bootmem bitmap");
    }

    // Initialize bootmem structure
    bootmem_data.node_min_pfn = start_pfn;
    bootmem_data.node_low_pfn = end_pfn;
    bootmem_data.node_bootmem_map = bootmem_map;

    // Mark all pages as reserved initially
    memset(bootmem_map, 0xFF, mapsize);

    // Then mark available pages as free
    mark_bootmem_free(start_pfn, end_pfn);
}

// Example: Bootmem allocation
unsigned long alloc_bootmem(unsigned long size, unsigned long align) {
    unsigned long addr;

    // Align size
    size = ALIGN(size, align);

    // Find free region
    addr = __alloc_bootmem_nopanic(size, align, 0, 0);

    if (!addr) {
        return 0;  // Allocation failed
    }

    // Mark as allocated
    mark_bootmem_used(addr, size);

    return addr;
}

// Example: Bootmem free
void free_bootmem(unsigned long addr, unsigned long size) {
    // Mark pages as free
    mark_bootmem_free(PFN_DOWN(addr), PFN_UP(addr + size));
}

// Example: Transition from bootmem to page allocator
void bootmem_free_all(void) {
    // Free bootmem bitmap
    free_bootmem((unsigned long)bootmem_data.node_bootmem_map,
                 bootmem_bootmap_pages(bootmem_data.node_low_pfn -
                                      bootmem_data.node_min_pfn) * PAGE_SIZE);

    // Free all bootmem-allocated pages to page allocator
    free_all_bootmem();

    // Bootmem is now gone, page allocator takes over
}
```

**Explanation**:

- **Bitmap tracking** bootmem uses bitmap to track allocated pages
- **Simple allocator** very simple first-fit allocator
- **Early allocation** provides memory before page allocator ready
- **Transition** bootmem freed when page allocator ready
- **Temporary** bootmem is temporary, replaced by page allocator

## Memblock Allocator

**What**: Memblock allocator is a more advanced early allocator that tracks memory and reserved regions.

**How**: Memblock allocator works:

```c
// Example: Memblock allocator structure
struct memblock {
    bool bottom_up;                    // Allocation direction
    unsigned long current_limit;      // Current allocation limit

    struct memblock_type memory;       // Available memory regions
    struct memblock_type reserved;     // Reserved memory regions
};

struct memblock_type {
    unsigned long cnt;                 // Number of regions
    unsigned long max;                 // Maximum regions
    unsigned long total_size;          // Total size of regions
    struct memblock_region *regions;    // Array of regions
};

// Example: Memblock allocation
unsigned long memblock_alloc(unsigned long size, unsigned long align) {
    // Allocate from memblock
    return memblock_alloc_range(size, align, 0, MEMBLOCK_ALLOC_ACCESSIBLE);
}

unsigned long memblock_alloc_range(unsigned long size, unsigned long align,
                                   unsigned long start, unsigned long end) {
    unsigned long addr;

    // Align size and start
    size = ALIGN(size, align);
    start = ALIGN(start, align);

    // Find free region in memory that's not in reserved
    addr = memblock_find_in_range(size, align, start, end);

    if (addr == MEMBLOCK_ERROR) {
        return 0;  // Allocation failed
    }

    // Reserve the allocated region
    memblock_reserve(addr, size);

    return addr;
}

// Example: Memblock reservation
int memblock_reserve(unsigned long base, unsigned long size) {
    // Add region to reserved list
    return memblock_add_range(&memblock.reserved, base, size,
                             MAX_NUMNODES, 0);
}

// Example: Querying memblock
bool memblock_is_reserved(unsigned long addr, unsigned long size) {
    // Check if region overlaps with reserved regions
    return memblock_overlaps_region(&memblock.reserved, addr, size);
}

// Example: Converting memblock to page allocator
void memblock_free_all(void) {
    // Free memblock-allocated pages to buddy allocator
    unsigned long start, end;

    // For each memory region
    for (int i = 0; i < memblock.memory.cnt; i++) {
        start = memblock.memory.regions[i].base;
        end = start + memblock.memory.regions[i].size;

        // Mark as available for page allocator
        free_area_init_pages(NODE_DATA(0)->node_start_pfn +
                            memblock.memory.regions[i].base >> PAGE_SHIFT,
                            end >> PAGE_SHIFT);
    }
}
```

**Explanation**:

- **Region tracking** memblock tracks memory and reserved regions
- **Allocation** allocates from available memory regions
- **Reservation** marks regions as reserved
- **Query functions** check if regions are reserved or available
- **Migration** memblock data migrates to page allocator

## Memory Zone Setup

**What**: Memory zones organize physical memory into different types (DMA, Normal, HighMem) for different uses.

**How**: Memory zone setup works:

```c
// Example: Memory zones on RISC-V (64-bit)
// RISC-V 64-bit typically uses:
// - ZONE_DMA: DMA-capable memory (if needed)
// - ZONE_NORMAL: Normal memory
// - ZONE_HIGHMEM: Not used on 64-bit (all memory accessible)

// Example: Zone initialization
void setup_memory_zones(void) {
    unsigned long zone_size[MAX_NR_ZONES];
    unsigned long zhole_size[MAX_NR_ZONES];
    unsigned long start_pfn, end_pfn;

    // Get total memory range
    start_pfn = memblock_start_of_DRAM() >> PAGE_SHIFT;
    end_pfn = memblock_end_of_DRAM() >> PAGE_SHIFT;

    // Calculate zone sizes
    memset(zone_size, 0, sizeof(zone_size));
    memset(zhole_size, 0, sizeof(zhole_size));

    // On 64-bit RISC-V, most memory is in ZONE_NORMAL
    // ZONE_DMA only if platform requires it
    unsigned long dma_size = get_dma_zone_size();

    if (dma_size > 0) {
        zone_size[ZONE_DMA] = dma_size >> PAGE_SHIFT;
    }

    zone_size[ZONE_NORMAL] = (end_pfn - start_pfn) - zone_size[ZONE_DMA];

    // Initialize zones
    free_area_init_node(0, zone_size, start_pfn, NULL);
}

// Example: Zone structure
struct zone {
    // Watermarks for memory pressure
    unsigned long watermark[NR_WMARK];

    // Free page lists
    struct free_area free_area[MAX_ORDER];

    // Statistics
    unsigned long pages_scanned;
    unsigned long compact_priority;

    // Lock
    spinlock_t lock;
};

// Example: Getting zone for page
struct zone *page_zone(struct page *page) {
    unsigned long pfn = page_to_pfn(page);

    if (pfn < zone_dma_limit) {
        return &contig_page_data.node_zones[ZONE_DMA];
    } else {
        return &contig_page_data.node_zones[ZONE_NORMAL];
    }
}
```

**Explanation**:

- **Zone types** different zones for different memory types
- **64-bit zones** RISC-V 64-bit primarily uses ZONE_NORMAL
- **DMA zone** ZONE_DMA only if platform requires DMA zone
- **Zone initialization** zones initialized from memblock data
- **Page allocation** pages allocated from appropriate zone

## Next Steps

**What** you're ready for next:

After understanding early memory setup, you should be ready to:

1. **Learn Kernel Memory Management** - Full kernel memory management system
2. **Study Page Tables** - RISC-V page table structure
3. **Understand Page Allocator** - Buddy system page allocator
4. **Explore Virtual Memory** - Virtual memory management
5. **Begin Memory Debugging** - Debug memory-related issues

**Where** to go next:

Continue with the next section on **"Kernel Memory Management"** to learn:

- Virtual memory layout
- Page table structure
- Memory allocation mechanisms
- Memory zones detailed
- KASLR (Kernel Address Space Layout Randomization)

**Why** the next section is important:

Kernel memory management is fundamental to kernel operation. Understanding how the kernel manages memory is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel memory management code
2. **Use Debugger** - Debug memory allocation and management
3. **Trace Memory** - Trace memory operations
4. **Read Documentation** - Study kernel memory management documentation
5. **Experiment** - Modify memory setup and observe

## Resources

**Official Documentation**:

- [Linux Kernel Memory Management](https://www.kernel.org/doc/html/latest/mm/) - Memory management docs
- [RISC-V Linux Kernel](https://github.com/torvalds/linux/tree/master/arch/riscv) - Kernel source

**Kernel Sources**:

- [Linux RISC-V Memory Init](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Memory initialization code
- [Memblock Allocator](https://github.com/torvalds/linux/tree/master/mm/memblock.c) - Memblock source
