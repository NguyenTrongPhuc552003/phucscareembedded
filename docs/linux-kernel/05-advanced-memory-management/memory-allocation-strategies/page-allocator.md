---
sidebar_position: 2
---

# Page Allocator

Master the Linux kernel's page allocator system, understanding how it manages physical memory pages using the buddy system algorithm for efficient memory allocation on the Rock 5B+ platform.

## What is the Page Allocator?

**What**: The page allocator is the kernel's physical memory management system that allocates and frees memory in page-sized chunks (typically 4KB) using the buddy system algorithm to minimize external fragmentation.

**Why**: Understanding the page allocator is crucial because:

- **Physical memory management** - Foundation of kernel memory management
- **Memory efficiency** - Buddy system reduces external fragmentation
- **Performance** - Fast allocation of physically contiguous memory
- **System stability** - Proper page management essential for stability
- **Rock 5B+ development** - ARM64 specific page management
- **Professional development** - Essential for kernel memory management

**When**: The page allocator is used when:

- **Large allocations** - Allocating multiple pages of memory
- **DMA buffers** - Physically contiguous memory for DMA
- **Kernel buffers** - Page cache, network buffers
- **Memory mapping** - Mapping physical pages
- **Development** - Understanding kernel memory management
- **Rock 5B+** - ARM64 memory allocation

**How**: The page allocator works by:

- **Buddy system** - Managing free pages in power-of-2 sized blocks
- **Memory zones** - Organizing memory into zones (DMA, Normal, HighMem)
- **Page allocation** - Allocating pages from appropriate zones
- **Page freeing** - Returning pages and coalescing with buddies
- **Watermarks** - Maintaining memory reserves
- **Reclamation** - Freeing memory when needed

**Where**: The page allocator is found in:

- **Kernel memory** - All physical memory allocations
- **Device drivers** - DMA buffer allocation
- **File systems** - Page cache management
- **Network stack** - Network buffer allocation
- **Virtual memory** - Page fault handling
- **Rock 5B+** - ARM64 physical memory management

## Buddy System Algorithm

**What**: The buddy system is an algorithm that manages free memory by organizing pages into groups of contiguous pages in power-of-2 sizes, enabling efficient allocation and coalescing.

**Why**: Understanding the buddy system is important because:

- **Fragmentation reduction** - Minimizes external fragmentation
- **Fast allocation** - O(log n) allocation and freeing
- **Coalescing** - Automatically merges adjacent free blocks
- **Memory efficiency** - Balances fragmentation and allocation speed

**How**: The buddy system works through:

```c
// Example: Buddy system concepts
// 1. Free lists for each order (power of 2)
// Order 0: 1 page (4KB)
// Order 1: 2 pages (8KB)
// Order 2: 4 pages (16KB)
// ...
// Order 10: 1024 pages (4MB)

struct free_area {
    struct list_head free_list[MIGRATE_TYPES];
    unsigned long nr_free;
};

struct zone {
    struct free_area free_area[MAX_ORDER];
    // ...
};

// 2. Page allocation from buddy system
struct page *alloc_pages_example(unsigned int order, gfp_t gfp_mask) {
    struct page *page;

    // Allocate 2^order pages
    page = alloc_pages(gfp_mask, order);
    if (!page) {
        pr_err("Failed to allocate %lu pages\n", 1UL << order);
        return NULL;
    }

    pr_info("Allocated %lu pages at order %u\n", 1UL << order, order);
    return page;
}

// 3. Page freeing and buddy coalescing
void free_pages_example(struct page *page, unsigned int order) {
    // Free pages - buddy system automatically coalesces
    __free_pages(page, order);
    pr_info("Freed %lu pages at order %u\n", 1UL << order, order);
}

// 4. Common allocation orders
void allocation_examples(void) {
    struct page *page;

    // Single page (4KB)
    page = alloc_page(GFP_KERNEL);
    if (page)
        __free_page(page);

    // Two pages (8KB)
    page = alloc_pages(GFP_KERNEL, 1);
    if (page)
        __free_pages(page, 1);

    // 16KB contiguous memory
    page = alloc_pages(GFP_KERNEL, 2);
    if (page)
        __free_pages(page, 2);
}
```

**Explanation**:

- **Orders** - Power-of-2 page counts (0=1 page, 1=2 pages, etc.)
- **Free lists** - Separate lists for each order
- **Coalescing** - Adjacent free blocks automatically merged
- **Splitting** - Larger blocks split when smaller size needed

## Memory Zones

**What**: Memory zones are regions of physical memory with different characteristics and usage restrictions, such as DMA zones for devices with addressing limitations.

**Why**: Understanding memory zones is important because:

- **Device constraints** - Some devices can only access certain memory
- **Memory organization** - Different zones for different purposes
- **Allocation policy** - Choosing appropriate zone for allocation
- **System stability** - Preventing zone exhaustion

**How**: Memory zones work through:

```c
// Example: Memory zones
// 1. Zone types on ARM64
enum zone_type {
    ZONE_DMA,        // DMA-capable memory (typically first 4GB)
    ZONE_DMA32,      // DMA32-capable memory (first 4GB on 64-bit)
    ZONE_NORMAL,     // Normal memory
    ZONE_MOVABLE,    // Movable memory for memory hotplug
    __MAX_NR_ZONES
};

// 2. Zone-aware allocation
void zone_allocation_examples(void) {
    struct page *page;

    // Allocate from DMA zone
    page = alloc_pages(GFP_DMA, 0);
    if (page) {
        pr_info("DMA page at pfn %lu\n", page_to_pfn(page));
        __free_page(page);
    }

    // Allocate from DMA32 zone
    page = alloc_pages(GFP_DMA32, 0);
    if (page) {
        pr_info("DMA32 page at pfn %lu\n", page_to_pfn(page));
        __free_page(page);
    }

    // Normal allocation (any zone)
    page = alloc_page(GFP_KERNEL);
    if (page) {
        pr_info("Normal page at pfn %lu\n", page_to_pfn(page));
        __free_page(page);
    }
}

// 3. Zone statistics
void print_zone_stats(void) {
    struct zone *zone;

    for_each_populated_zone(zone) {
        pr_info("Zone %s: free=%lu, managed=%lu\n",
                zone->name,
                zone_page_state(zone, NR_FREE_PAGES),
                zone_managed_pages(zone));
    }
}
```

**Explanation**:

- **ZONE_DMA** - Memory for DMA devices
- **ZONE_DMA32** - 32-bit DMA-capable memory
- **ZONE_NORMAL** - Regular memory
- **ZONE_MOVABLE** - Memory that can be migrated
- **GFP flags** - Specify which zones can be used

## GFP Flags and Allocation

**What**: GFP (Get Free Pages) flags control page allocator behavior, specifying zones, allocation constraints, and reclamation policies.

**Why**: Understanding GFP flags is important because:

- **Allocation control** - Fine-grained control over allocation
- **Context safety** - Choosing safe flags for different contexts
- **Performance** - Appropriate flags improve performance
- **Memory availability** - Managing memory pressure

**How**: GFP flags work through:

```c
// Example: GFP flags usage
// 1. Common GFP flags
void gfp_flag_examples(void) {
    struct page *page;

    // GFP_KERNEL - Normal kernel allocation (can sleep)
    page = alloc_page(GFP_KERNEL);
    if (page)
        __free_page(page);

    // GFP_ATOMIC - Cannot sleep (interrupt context)
    page = alloc_page(GFP_ATOMIC);
    if (page)
        __free_page(page);

    // GFP_NOWAIT - Don't sleep, don't reclaim
    page = alloc_page(GFP_NOWAIT);
    if (page)
        __free_page(page);

    // GFP_NOIO - No I/O operations (filesystem context)
    page = alloc_page(GFP_NOIO);
    if (page)
        __free_page(page);

    // GFP_NOFS - No filesystem operations
    page = alloc_page(GFP_NOFS);
    if (page)
        __free_page(page);
}

// 2. Combined flags
void combined_gfp_flags(void) {
    struct page *page;

    // DMA + atomic allocation
    page = alloc_page(GFP_DMA | GFP_ATOMIC);
    if (page)
        __free_page(page);

    // Zero-initialized page
    page = alloc_page(GFP_KERNEL | __GFP_ZERO);
    if (page)
        __free_page(page);

    // High-order allocation with retry
    page = alloc_pages(GFP_KERNEL | __GFP_RETRY_MAYFAIL, 5);
    if (page)
        __free_pages(page, 5);
}

// 3. Common allocation patterns
struct page *safe_alloc_pages(unsigned int order, int atomic) {
    gfp_t flags;

    if (atomic)
        flags = GFP_ATOMIC;
    else
        flags = GFP_KERNEL;

    return alloc_pages(flags, order);
}
```

**Explanation**:

- **GFP_KERNEL** - Can sleep, normal allocation
- **GFP_ATOMIC** - Cannot sleep, for interrupt context
- **GFP_DMA** - DMA-capable memory
- **\_\_GFP_ZERO** - Zero-initialize pages
- **Modifier flags** - Combine with | operator

## Rock 5B+ Page Allocator

**What**: The Rock 5B+ platform's page allocator is optimized for ARM64 architecture with 4KB pages and multi-zone memory configuration.

**Why**: Understanding Rock 5B+ page allocator is important because:

- **ARM64 architecture** - 4KB page size (can be 16KB or 64KB)
- **RK3588 memory** - Typically 4GB-16GB RAM configuration
- **Memory zones** - DMA, DMA32, and Normal zones
- **Performance** - Multi-core page allocator scalability

**How**: Rock 5B+ page allocator involves:

```bash
# Rock 5B+ page allocator monitoring and tuning

# 1. View buddy system state
cat /proc/buddyinfo
# Shows free pages at each order for each zone

# 2. View memory zones
cat /proc/zoneinfo | head -50

# 3. View page allocation statistics
cat /proc/vmstat | grep pgalloc
cat /proc/vmstat | grep pgfree

# 4. Monitor memory fragmentation
cat /sys/kernel/debug/extfrag/extfrag_index

# 5. View page size
getconf PAGE_SIZE
# Typically 4096 bytes on Rock 5B+

# 6. Memory information
cat /proc/meminfo | grep -E 'MemTotal|MemFree|MemAvailable'

# 7. Per-zone watermarks
cat /proc/zoneinfo | grep -A 5 "pages free"
```

**Explanation**:

- **/proc/buddyinfo** - Buddy system free page counts
- **/proc/zoneinfo** - Detailed zone information
- **PAGE_SIZE** - 4KB on Rock 5B+ ARM64
- **Memory zones** - DMA32 and Normal zones on Rock 5B+
- **Statistics** - Runtime allocation/free counters

## Key Takeaways

**What** you've accomplished:

1. **Page Allocator Understanding** - You understand physical memory allocation
2. **Buddy System** - You know how the buddy algorithm works
3. **Memory Zones** - You understand zone-based memory organization
4. **GFP Flags** - You can use appropriate allocation flags
5. **Rock 5B+ Pages** - You understand ARM64 specific considerations

**Why** these concepts matter:

- **Foundation** - Page allocator is basis of kernel memory management
- **Performance** - Efficient page allocation critical for system performance
- **Correctness** - Proper usage prevents memory issues
- **Platform knowledge** - Rock 5B+ specific optimization

**When** to use these concepts:

- **Driver development** - Allocating DMA buffers
- **Kernel modules** - Large memory allocations
- **Performance tuning** - Understanding memory behavior
- **Debugging** - Analyzing memory fragmentation

**Where** these skills apply:

- **Kernel development** - All kernel physical memory allocation
- **Driver development** - Device driver memory management
- **System optimization** - Performance tuning
- **Rock 5B+** - ARM64 kernel development

## Next Steps

Continue with:

1. **Memory Compaction** - Learn defragmentation techniques

## Resources

**Official Documentation**:

- [Page Allocator](https://www.kernel.org/doc/html/latest/core-api/memory-allocation.html) - Memory allocation guide
- [Memory Management](https://www.kernel.org/doc/html/latest/vm/) - VM subsystem documentation

**Learning Resources**:

- [Understanding the Linux Kernel](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Memory chapter

**Rock 5B+ Specific**:

- [ARM64 Memory](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory management

Happy learning! 🐧
