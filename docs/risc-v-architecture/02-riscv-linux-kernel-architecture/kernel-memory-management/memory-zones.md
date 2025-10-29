---
sidebar_position: 4
---

# Memory Zones

Master RISC-V Linux kernel memory zones that organize physical memory into different types for different allocation needs, understanding zone types, watermarks, and management essential for kernel memory allocation.

## What Are Memory Zones?

**What**: Memory zones organize physical memory into different types based on hardware constraints and usage requirements. On RISC-V 64-bit systems, memory is typically organized into ZONE_DMA (if needed) and ZONE_NORMAL zones.

**Why**: Understanding memory zones is crucial because:

- **Hardware Constraints** - Some memory has hardware restrictions
- **Allocation Control** - Zones control where memory is allocated from
- **DMA Requirements** - DMA needs specific memory regions
- **Performance** - Zone organization affects allocation performance
- **Resource Management** - Zones help manage memory resources
- **Kernel Allocation** - Kernel allocators use zones for allocation

**When**: Memory zones are relevant when:

- **Memory Initialization** - Zones initialized during boot
- **Page Allocation** - Allocations come from appropriate zones
- **DMA Operations** - DMA requires ZONE_DMA memory
- **Memory Pressure** - Zones have watermarks for pressure detection
- **Allocation Policies** - Allocation policies use zones
- **Memory Reclaim** - Reclaim operations work per zone

**How**: Memory zones work through:

- **Zone Types** - Different zones for different memory types
- **Zone Structure** - Each zone tracks its free pages
- **Watermarks** - Watermarks indicate memory pressure levels
- **Zone Lists** - Zones organized into zonelists for allocation
- **Zone Management** - Kernel manages zones for allocation
- **Zone Statistics** - Tracking per-zone statistics

**Where**: Memory zones are found in:

- **Memory Initialization** - arch/riscv/mm/init.c
- **Page Allocator** - mm/page_alloc.c
- **Zone Management** - mm/mmzone.c
- **Allocation Code** - All code that allocates pages
- **Memory Statistics** - /proc/zoneinfo

## Zone Types on RISC-V

**What**: RISC-V 64-bit systems typically use ZONE_DMA (if platform requires) and ZONE_NORMAL zones.

**How**: Zone types work:

```c
// Example: Memory zone types
enum zone_type {
#ifdef CONFIG_ZONE_DMA
    ZONE_DMA,      // DMA-capable memory (if platform requires)
#endif
    ZONE_NORMAL,   // Normal memory (most memory on 64-bit)
#ifdef CONFIG_HIGHMEM
    ZONE_HIGHMEM,  // High memory (not used on 64-bit RISC-V)
#endif
    MAX_NR_ZONES   // Number of zones
};

// Example: Zone structure
struct zone {
    // Watermarks for memory pressure
    unsigned long watermark[NR_WMARK];

    // Free page lists (buddy system)
    struct free_area free_area[MAX_ORDER];

    // Zone statistics
    unsigned long pages_scanned;
    unsigned long compact_priority;

    // Zone information
    unsigned long zone_start_pfn;  // First page frame number
    unsigned long span;             // Zone size in pages

    // Lock for zone operations
    spinlock_t lock;

    // Zone name
    const char *name;
};

// Watermark indices
enum zone_watermarks {
    WMARK_MIN,    // Minimum watermark (emergency reserve)
    WMARK_LOW,    // Low watermark (start reclaiming)
    WMARK_HIGH,   // High watermark (stop reclaiming)
    NR_WMARK
};

// Example: Zone initialization on RISC-V
void setup_zone_ranges(void) {
    unsigned long start_pfn = memblock_start_of_DRAM() >> PAGE_SHIFT;
    unsigned long end_pfn = memblock_end_of_DRAM() >> PAGE_SHIFT;
    unsigned long total_pages = end_pfn - start_pfn;

    // On 64-bit RISC-V, most memory is ZONE_NORMAL
    // ZONE_DMA only if platform specifically requires it
    unsigned long dma_pages = 0;

#ifdef CONFIG_ZONE_DMA
    // Some RISC-V platforms may require DMA zone
    // e.g., if devices can only access low memory
    dma_pages = get_dma_zone_pages();
    if (dma_pages > 0) {
        // ZONE_DMA: 0 to dma_pages
        init_zone(0, start_pfn, start_pfn + dma_pages, ZONE_DMA);
        start_pfn += dma_pages;
    }
#endif

    // ZONE_NORMAL: remaining memory
    if (start_pfn < end_pfn) {
        init_zone(1, start_pfn, end_pfn, ZONE_NORMAL);
    }
}

// Example: Zone information
void print_zone_info(void) {
    struct zone *zone;

    for (int i = 0; i < MAX_NR_ZONES; i++) {
        zone = &pgdat->node_zones[i];
        if (!zone->span) {
            continue;  // Zone not present
        }

        pr_info("Zone %s:\n", zone->name);
        pr_info("  Start PFN: %lu\n", zone->zone_start_pfn);
        pr_info("  Span: %lu pages (%lu MB)\n",
                zone->span, zone->span * PAGE_SIZE / (1024 * 1024));
        pr_info("  Free: %lu pages\n", zone->free_area[0].nr_free);
    }
}
```

**Explanation**:

- **Zone types** ZONE_DMA (if needed) and ZONE_NORMAL on RISC-V 64-bit
- **Zone structure** each zone tracks its free pages and statistics
- **Watermarks** zones have watermarks for memory pressure
- **Initialization** zones initialized from memblock data
- **Zone info** zones have names and metadata

## Zone Watermarks

**What**: Zone watermarks indicate different levels of memory pressure and trigger different behaviors.

**Why**: Watermarks are important because:

- **Pressure Detection** - Detect when memory is low
- **Reclaim Triggering** - Trigger memory reclaim at appropriate time
- **Allocation Control** - Control when allocation should fail
- **System Stability** - Prevent system from running out of memory
- **Predictive Behavior** - Predict memory pressure before critical

**How**: Watermarks work:

```c
// Example: Zone watermark calculation
void setup_zone_watermarks(struct zone *zone) {
    unsigned long min_pages, low_pages, high_pages;
    unsigned long managed_pages = zone->managed_pages;

    // Calculate watermarks based on managed pages
    // MIN: Small reserve for critical allocations
    min_pages = managed_pages / 1024;  // 0.1% of zone
    if (min_pages < 128) {
        min_pages = 128;  // Minimum 128 pages
    }

    // LOW: Start reclaiming when below this
    low_pages = min_pages * 2;  // 2x minimum

    // HIGH: Stop reclaiming when above this
    high_pages = min_pages * 3;  // 3x minimum

    zone->watermark[WMARK_MIN] = min_pages;
    zone->watermark[WMARK_LOW] = low_pages;
    zone->watermark[WMARK_HIGH] = high_pages;

    pr_info("Zone %s watermarks: min=%lu low=%lu high=%lu\n",
            zone->name, min_pages, low_pages, high_pages);
}

// Example: Checking zone watermarks
enum zone_watermark_level check_zone_watermark(struct zone *zone) {
    unsigned long free_pages = zone->free_area[0].nr_free;

    if (free_pages < zone->watermark[WMARK_MIN]) {
        return WMARK_MIN;  // Critical: below minimum
    } else if (free_pages < zone->watermark[WMARK_LOW]) {
        return WMARK_LOW;  // Low: start reclaiming
    } else if (free_pages < zone->watermark[WMARK_HIGH]) {
        return WMARK_HIGH;  // High: continue reclaiming if started
    } else {
        return WMARK_HIGH + 1;  // Above high watermark
    }
}

// Example: Watermark-based allocation
bool zone_watermark_ok(struct zone *zone, unsigned int order,
                      unsigned long mark, int classzone_idx) {
    unsigned long free_pages = zone_page_state(zone, NR_FREE_PAGES);

    // Check if enough free pages above watermark
    if (free_pages - (1UL << order) < mark) {
        return false;  // Not enough free pages
    }

    // Check if high-order blocks available
    for (int o = order; o < MAX_ORDER; o++) {
        if (zone->free_area[o].nr_free > 0) {
            return true;  // Have high-order block
        }
    }

    return false;  // No suitable block
}

// Example: Memory pressure handling
void handle_zone_pressure(struct zone *zone) {
    enum zone_watermark_level level = check_zone_watermark(zone);

    switch (level) {
        case WMARK_MIN:
            // Critical: below minimum
            pr_alert("Zone %s: Critical memory pressure\n", zone->name);
            // Trigger aggressive reclaim
            reclaim_memory(zone, GFP_HIGHUSER_MOVABLE, 1024);
            break;

        case WMARK_LOW:
            // Low: start background reclaim
            pr_warn("Zone %s: Low memory, starting reclaim\n", zone->name);
            wakeup_kswapd(zone);
            break;

        case WMARK_HIGH:
            // High: continue reclaim if in progress
            if (zone->kswapd_wait) {
                continue_reclaim(zone);
            }
            break;

        default:
            // Above high watermark: normal operation
            break;
    }
}
```

**Explanation**:

- **Three watermarks** MIN, LOW, HIGH for different pressure levels
- **Calculation** watermarks calculated as percentage of zone size
- **Pressure detection** check free pages against watermarks
- **Reclaim triggering** watermarks trigger memory reclaim
- **Allocation control** allocation may fail if below watermark

## Zone Lists and Allocation

**What**: Zonelists organize zones for allocation, specifying preferred zones for different allocation types.

**How**: Zonelists work:

```c
// Example: Zonelist structure
struct zonelist {
    struct zoneref _zonerefs[MAX_ZONES_PER_ZONELIST + 1];
    // List of zones in preference order
};

struct zoneref {
    struct zone *zone;  // Pointer to zone
    int zone_idx;       // Zone index
};

// Example: Creating zonelist
void build_zonelists(pg_data_t *pgdat) {
    struct zonelist *zonelist;

    // Default zonelist (normal allocations)
    zonelist = &pgdat->node_zonelists[ZONELIST_FALLBACK];

    // Build zonelist in preference order:
    // 1. Local ZONE_NORMAL
    // 2. Local ZONE_DMA (if exists)
    // 3. Remote zones (NUMA, if applicable)

    build_zonelists_node(pgdat, zonelist);
}

// Example: Zone preference for allocation
struct zone *preferred_zone_for_allocation(gfp_t gfp_mask) {
    struct zonelist *zonelist;
    struct zoneref *z;
    struct zone *zone;

    // Get appropriate zonelist
    zonelist = node_zonelist(0, gfp_mask);

    // Iterate through zones in preference order
    for_each_zone_zonelist(zone, z, zonelist, gfp_zone(gfp_mask)) {
        // Check if zone can satisfy allocation
        if (zone_watermark_ok(zone, 0, zone->watermark[WMARK_LOW], 0)) {
            return zone;  // Found suitable zone
        }
    }

    return NULL;  // No suitable zone
}

// Example: Zone-specific allocation
struct page *alloc_pages_from_zone(gfp_t gfp_mask, unsigned int order,
                                   struct zone *zone) {
    struct page *page;

    // Check zone watermark
    if (!zone_watermark_ok(zone, order, zone->watermark[WMARK_LOW], 0)) {
        return NULL;  // Zone doesn't have enough free pages
    }

    // Allocate from zone
    page = __rmqueue(zone, order, gfp_mask);

    return page;
}

// Example: DMA zone allocation
void *dma_alloc_from_zone(size_t size, gfp_t flags) {
    struct page *page;
    void *addr;

#ifdef CONFIG_ZONE_DMA
    // Allocate from DMA zone
    struct zone *dma_zone = &pgdat->node_zones[ZONE_DMA];

    page = alloc_pages_from_zone(flags | GFP_DMA, get_order(size), dma_zone);
    if (!page) {
        return NULL;
    }

    addr = page_address(page);
    return addr;
#else
    // No DMA zone, use normal zone
    page = alloc_pages(flags, get_order(size));
    if (!page) {
        return NULL;
    }
    return page_address(page);
#endif
}
```

**Explanation**:

- **Zonelists** organize zones in preference order
- **Zone preference** allocation tries zones in order
- **Watermark checks** check watermarks before allocating
- **Zone selection** select appropriate zone for allocation
- **DMA zones** special handling for DMA allocations

## Zone Statistics

**What**: Zones track statistics about memory usage and allocation.

**How**: Zone statistics work:

```c
// Example: Zone statistics
// Tracked per zone:
// - Free pages
// - Active/inactive pages
// - Pages scanned
// - Pages reclaimed
// - Allocation failures

// Example: Zone statistics structure
struct zone_stat_item {
    atomic_long_t nr_free_pages;
    atomic_long_t nr_active_anon;
    atomic_long_t nr_inactive_anon;
    atomic_long_t nr_active_file;
    atomic_long_t nr_inactive_file;
    atomic_long_t nr_unevictable;
    atomic_long_t nr_writeback;
    // ... more statistics
};

// Example: Reading zone statistics
unsigned long zone_page_state(struct zone *zone, enum zone_stat_item item) {
    return atomic_long_read(&zone->vm_stat[item]);
}

// Example: Updating zone statistics
void mod_zone_page_state(struct zone *zone, enum zone_stat_item item,
                        long delta) {
    atomic_long_add(delta, &zone->vm_stat[item]);
}

// Example: Zone statistics display
void print_zone_statistics(struct zone *zone) {
    pr_info("Zone %s statistics:\n", zone->name);
    pr_info("  Free pages: %lu\n",
            zone_page_state(zone, NR_FREE_PAGES));
    pr_info("  Active anon: %lu\n",
            zone_page_state(zone, NR_ACTIVE_ANON));
    pr_info("  Inactive anon: %lu\n",
            zone_page_state(zone, NR_INACTIVE_ANON));
    pr_info("  Active file: %lu\n",
            zone_page_state(zone, NR_ACTIVE_FILE));
    pr_info("  Inactive file: %lu\n",
            zone_page_state(zone, NR_INACTIVE_FILE));
}

// Example: /proc/zoneinfo equivalent
// Zone statistics available via /proc/zoneinfo
// Shows per-zone memory statistics
```

**Explanation**:

- **Statistics tracking** zones track various memory statistics
- **Atomic updates** statistics updated atomically
- **Monitoring** statistics used for monitoring and debugging
- **Performance** track allocation performance per zone
- **Debugging** statistics help debug memory issues

## Zone Management Operations

**What**: Kernel performs various operations to manage zones.

**How**: Zone management works:

```c
// Example: Zone compaction
// Compaction moves pages to create larger contiguous blocks
int compact_zone(struct zone *zone, struct compact_control *cc) {
    unsigned long start_pfn = zone->zone_start_pfn;
    unsigned long end_pfn = zone_end_pfn(zone);

    // Scan zone for movable pages
    // Move pages to create free blocks
    // Merge free blocks

    return compaction_result;
}

// Example: Zone shrinking
void shrink_zone(struct zone *zone, struct scan_control *sc) {
    // Shrink zone by reclaiming pages
    // Reclaim inactive pages
    // Free pages for allocation

    unsigned long nr_reclaimed = 0;

    // Reclaim pages
    nr_reclaimed = shrink_page_list(&page_list, zone, sc);

    // Update statistics
    mod_zone_page_state(zone, NR_FREE_PAGES, nr_reclaimed);
}

// Example: Zone balancing
void balance_zone(struct zone *zone) {
    // Balance zone between active and inactive lists
    // Move pages between active/inactive based on usage

    // Age pages (move from active to inactive)
    age_active_anon(zone);
    age_active_file(zone);

    // Promote pages (move from inactive to active if accessed)
    promote_inactive_pages(zone);
}
```

**Explanation**:

- **Compaction** move pages to reduce fragmentation
- **Shrinking** reclaim pages from zone
- **Balancing** balance active/inactive page lists
- **Management** various operations maintain zone health
- **Automation** kernel automatically manages zones

## Next Steps

**What** you're ready for next:

After understanding memory zones, you have completed the **"Kernel Memory Management"** section. You should be ready to:

1. **Begin Exception Handling** - RISC-V exception and interrupt handling
2. **Study System Calls** - System call interface on RISC-V
3. **Understand Interrupts** - Detailed interrupt handling
4. **Explore Development Environment** - Set up RISC-V development tools
5. **Begin Kernel Module Development** - Start writing kernel modules

**Where** to go next:

Continue with the next section on **"Exception and Interrupt Handling"** to learn:

- Exception vector setup
- Interrupt controller interaction
- Exception context saving
- Nested exceptions
- Kernel entry/exit mechanisms

**Why** the next section is important:

Exception and interrupt handling is fundamental to kernel operation. Understanding how RISC-V handles exceptions and interrupts is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine exception and interrupt code
2. **Use Debugger** - Debug exception handlers
3. **Trace Interrupts** - Trace interrupt handling flow
4. **Read Documentation** - Study RISC-V exception specification
5. **Experiment** - Modify exception handlers and observe

## Section Completion Summary

**Congratulations!** You have completed the "Kernel Memory Management" section.

**What** you've learned:

✅ Virtual Memory Layout

- RISC-V virtual address space organization
- Kernel and user space regions
- Direct mapping, vmalloc, fixmap regions

✅ Page Table Structure

- Sv39 page table format
- Three-level page table hierarchy
- Page table walk and management

✅ Memory Allocation

- Buddy system page allocator
- Slab allocator for small objects
- Allocation APIs and strategies

✅ Memory Zones

- Zone types and organization
- Zone watermarks and management
- Zone statistics and operations

**Total**: 4 lessons covering kernel memory management.

## Resources

**Official Documentation**:

- [Linux Kernel Memory Management](https://www.kernel.org/doc/html/latest/mm/) - Memory management docs
- [RISC-V Privileged ISA](https://github.com/riscv/riscv-isa-manual) - Virtual memory specification

**Kernel Sources**:

- [Linux RISC-V Memory Code](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Memory management code
