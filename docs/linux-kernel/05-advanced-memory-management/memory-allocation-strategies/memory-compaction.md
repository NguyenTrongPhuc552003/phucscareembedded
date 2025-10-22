---
sidebar_position: 3
---

# Memory Compaction

Master memory compaction techniques in the Linux kernel, understanding how to reduce memory fragmentation and improve high-order page allocation success on the Rock 5B+ platform.

## What is Memory Compaction?

**What**: Memory compaction is the process of moving allocated pages to create larger contiguous free memory regions, reducing external fragmentation and improving high-order page allocation success.

**Why**: Understanding memory compaction is crucial because:

- **Fragmentation reduction** - Creates contiguous free memory
- **Allocation success** - Improves high-order allocation reliability
- **System performance** - Reduces allocation failures
- **Memory efficiency** - Better utilization of physical memory
- **Rock 5B+ optimization** - ARM64 specific compaction considerations

**When**: Memory compaction is used when:

- **High-order allocations** - Need for contiguous multi-page allocations
- **Memory fragmentation** - External fragmentation reduces available memory
- **DMA buffers** - Devices requiring contiguous physical memory
- **Huge pages** - Transparent huge page (THP) allocation
- **System optimization** - Proactive fragmentation prevention

**How**: Memory compaction works by:

- **Page migration** - Moving movable pages to create free space
- **Compaction zones** - Processing memory zones systematically
- **Free space creation** - Consolidating free pages
- **Buddy coalescing** - Merging adjacent free blocks
- **Async/sync modes** - Background and on-demand compaction

**Where**: Memory compaction is found in:

- **Page allocator** - Automatic during allocation failures
- **Kernel threads** - Background compaction daemon
- **Memory management** - Part of memory reclamation
- **Huge pages** - Transparent huge page allocation
- **Rock 5B+** - ARM64 memory management

## Compaction Algorithm

**What**: The compaction algorithm systematically scans memory zones, migrating movable pages to create larger contiguous free regions.

**Why**: Understanding the algorithm is important because:

- **Implementation knowledge** - Understanding how compaction works
- **Performance implications** - Compaction can be expensive
- **Tuning opportunities** - Configuring compaction behavior
- **Debugging** - Troubleshooting compaction issues

**How**: The compaction algorithm works through:

```c
// Example: Memory compaction concepts
// 1. Compaction scanner directions
struct compact_control {
    unsigned long free_pfn;       // Free page scanner
    unsigned long migrate_pfn;    // Migration scanner
    struct zone *zone;
    int order;                    // Target allocation order
    enum migrate_mode mode;       // Migration mode
    bool direct_compaction;       // Direct vs async
};

// 2. Page migration during compaction
int migrate_pages_for_compaction(struct page *page) {
    struct page *newpage;
    int ret;

    // Check if page is movable
    if (PageLRU(page) || __PageMovable(page)) {
        // Allocate new page
        newpage = alloc_page(GFP_HIGHUSER_MOVABLE);
        if (!newpage)
            return -ENOMEM;

        // Migrate page contents
        ret = migrate_page(page, newpage, MIGRATE_SYNC);
        if (ret) {
            __free_page(newpage);
            return ret;
        }

        pr_debug("Migrated page from pfn %lu to %lu\n",
                page_to_pfn(page), page_to_pfn(newpage));

        return 0;
    }

    return -EAGAIN;
}

// 3. Compaction watermarks
static inline bool compaction_suitable(struct zone *zone, int order) {
    unsigned long watermark;

    // Check if zone has enough free pages
    watermark = low_wmark_pages(zone) + (1UL << order);

    if (zone_watermark_ok(zone, order, watermark, 0, 0))
        return true;

    return false;
}

// 4. Trigger compaction
void trigger_memory_compaction(void) {
    struct zone *zone;
    int order = 3;  // Looking for 8-page contiguous block

    for_each_populated_zone(zone) {
        if (!compaction_suitable(zone, order))
            continue;

        compact_zone(zone, order);
        pr_info("Compacted zone %s for order %d\n",
                zone->name, order);
    }
}
```

**Explanation**:

- **Scanners** - Free page scanner and migration scanner
- **Page migration** - Moving pages to consolidate space
- **Watermarks** - Determining when compaction is worthwhile
- **Zone compaction** - Per-zone compaction processing

## Direct and Kswapd Compaction

**What**: Direct compaction occurs during page allocation when high-order pages aren't available, while kcompactd runs asynchronously in the background.

**Why**: Understanding compaction modes is important because:

- **Performance impact** - Direct compaction blocks allocation
- **System responsiveness** - Background compaction prevents stalls
- **Tuning options** - Configuring compaction behavior
- **Resource management** - Balancing compaction overhead

**How**: Compaction modes work through:

```c
// Example: Compaction modes
// 1. Direct compaction (synchronous)
struct page *alloc_pages_with_compaction(gfp_t gfp_mask, unsigned int order) {
    struct page *page;

    // Try normal allocation first
    page = alloc_pages(gfp_mask, order);
    if (page)
        return page;

    // Allocation failed, try compaction
    if (order > 0 && !(gfp_mask & __GFP_NORETRY)) {
        pr_info("Triggering direct compaction for order %u\n", order);

        // Compact and retry
        try_to_compact_pages(gfp_mask, order);

        // Retry allocation
        page = alloc_pages(gfp_mask, order);
    }

    return page;
}

// 2. Background compaction (kcompactd)
// Kernel thread that runs periodically
static int kcompactd_thread(void *data) {
    struct zone *zone = data;

    while (!kthread_should_stop()) {
        // Wait for wakeup or timeout
        wait_event_interruptible_timeout(zone->compact_wait,
                                        kcompactd_should_run(zone),
                                        HZ);

        // Run compaction if needed
        if (kcompactd_should_run(zone)) {
            compact_zone(zone, -1);  // Compact all orders
            pr_debug("kcompactd compacted zone %s\n", zone->name);
        }
    }

    return 0;
}

// 3. Compaction control via sysfs
// /proc/sys/vm/compact_memory
// /sys/kernel/mm/compaction/kcompactd_sleep_millisecs
// /sys/kernel/mm/compaction/extfrag_threshold
```

**Explanation**:

- **Direct compaction** - Synchronous, during allocation
- **kcompactd** - Asynchronous background thread
- **Wakeup conditions** - When to trigger background compaction
- **Sysfs tunables** - Runtime compaction configuration

## Compaction Tuning

**What**: Compaction tuning involves configuring kernel parameters to optimize compaction behavior for specific workloads and system characteristics.

**Why**: Understanding tuning is important because:

- **Performance optimization** - Balancing compaction overhead
- **Workload adaptation** - Different workloads need different settings
- **Resource efficiency** - Minimizing unnecessary compaction
- **System stability** - Preventing excessive compaction

**How**: Compaction tuning works through:

```bash
# Rock 5B+ memory compaction tuning

# 1. Manually trigger compaction
echo 1 > /proc/sys/vm/compact_memory

# 2. Set compaction proactiveness (0-100)
# Higher values = more aggressive background compaction
echo 20 > /proc/sys/vm/compaction_proactiveness

# 3. External fragmentation threshold
# Compact when fragmentation index exceeds threshold
echo 500 > /proc/sys/vm/extfrag_threshold

# 4. View compaction statistics
cat /proc/vmstat | grep compact

# 5. View fragmentation index per zone
cat /sys/kernel/debug/extfrag/extfrag_index

# 6. Monitor compaction events
cat /proc/vmstat | grep -E 'compact_.*_scanned|compact_.*_failed'

# 7. Per-zone compaction control
cat /sys/devices/system/node/node0/compact
```

**Explanation**:

- **compact_memory** - Manual compaction trigger
- **compaction_proactiveness** - Background compaction aggressiveness
- **extfrag_threshold** - Fragmentation index trigger threshold
- **Statistics** - Monitoring compaction effectiveness

## Rock 5B+ Compaction Optimization

**What**: The Rock 5B+ platform benefits from optimized compaction settings due to its ARM64 architecture and typical embedded workloads.

**Why**: Understanding Rock 5B+ compaction is important because:

- **Embedded constraints** - Limited memory compared to servers
- **Workload patterns** - Different from server workloads
- **Performance impact** - Compaction overhead more noticeable
- **Power efficiency** - Minimizing unnecessary work

**How**: Rock 5B+ compaction optimization involves:

```bash
# Recommended Rock 5B+ compaction configuration

# 1. Moderate compaction proactiveness
echo 20 > /proc/sys/vm/compaction_proactiveness

# 2. Reasonable fragmentation threshold
echo 500 > /proc/sys/vm/extfrag_threshold

# 3. Conservative THP defrag
echo defer+madvise > /sys/kernel/mm/transparent_hugepage/defrag

# 4. Monitor compaction overhead
#!/bin/bash
while true; do
    echo "=== Compaction Stats ==="
    grep compact /proc/vmstat | head -10
    sleep 5
done

# 5. Check memory fragmentation
cat /proc/buddyinfo
# Look for gaps in higher orders

# 6. Compaction efficiency analysis
cat /proc/vmstat | awk '/compact/ {print $1, $2}'
```

**Explanation**:

- **Moderate settings** - Balance between compaction and overhead
- **Monitoring** - Tracking compaction effectiveness
- **Workload-specific** - Adjust based on application needs
- **Power efficiency** - Avoiding excessive background work

## Key Takeaways

**What** you've accomplished:

1. **Compaction Understanding** - You understand memory compaction mechanism
2. **Algorithm Knowledge** - You know how compaction works
3. **Compaction Modes** - You understand direct and background compaction
4. **Tuning Skills** - You can optimize compaction parameters
5. **Rock 5B+ Optimization** - You know ARM64 specific considerations

**Why** these concepts matter:

- **Memory efficiency** - Reducing fragmentation improves allocation
- **System reliability** - Better high-order allocation success
- **Performance** - Balancing compaction overhead
- **Platform knowledge** - Rock 5B+ specific optimization

**When** to use these concepts:

- **System tuning** - Optimizing memory management
- **Performance analysis** - Understanding allocation failures
- **Workload optimization** - Adapting to application needs
- **Debugging** - Troubleshooting memory issues

**Where** these skills apply:

- **Kernel development** - Memory management optimization
- **System administration** - Performance tuning
- **Embedded systems** - Resource-constrained platforms
- **Rock 5B+** - ARM64 embedded development

## Next Steps

Continue with Chapter 5 DMA and Coherent Memory section:

1. **DMA Fundamentals** - Learn DMA concepts and operations
2. **Coherent Memory Allocation** - Understand cache-coherent memory
3. **DMA Mapping** - Master DMA mapping techniques

## Resources

**Official Documentation**:

- [Memory Compaction](https://www.kernel.org/doc/html/latest/admin-guide/mm/transhuge.html) - Compaction documentation
- [THP](https://www.kernel.org/doc/html/latest/admin-guide/mm/transhuge.html) - Transparent huge pages

**Learning Resources**:

- [Understanding the Linux Kernel](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Memory management

**Rock 5B+ Specific**:

- [ARM64 Memory](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory architecture

Happy learning! 🐧
