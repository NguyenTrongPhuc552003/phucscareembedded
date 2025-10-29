---
sidebar_position: 3
---

# Memory Allocation

Master RISC-V Linux kernel memory allocation mechanisms including the buddy system page allocator, slab allocator for small objects, and various allocation APIs essential for kernel development and memory management.

## What Is Memory Allocation?

**What**: Memory allocation in the Linux kernel involves obtaining physical memory pages and managing them through allocators. The kernel uses multiple allocation mechanisms: the buddy system for page allocation, the slab allocator for small objects, and specialized allocators for different use cases.

**Why**: Understanding memory allocation is crucial because:

- **Kernel Development** - All kernel code allocates memory
- **Performance** - Allocation mechanisms affect performance
- **Resource Management** - Proper allocation prevents memory exhaustion
- **Debugging** - Memory issues often relate to allocation
- **Optimization** - Choose appropriate allocator for use case
- **Memory Leaks** - Understanding allocation helps prevent leaks

**When**: Memory allocation occurs when:

- **Kernel Boot** - Allocating memory during initialization
- **Driver Loading** - Drivers allocate memory for operations
- **Process Creation** - Allocating memory for processes
- **Device Operations** - Allocating buffers for I/O
- **Data Structures** - Creating kernel data structures
- **Cache Allocation** - Allocating cache for performance

**How**: Memory allocation works through:

- **Buddy System** - Page allocator for page-sized allocations
- **Slab Allocator** - Object cache for small allocations
- **Allocation APIs** - Different APIs for different needs
- **Memory Zones** - Allocations from appropriate zones
- **GFP Flags** - Allocation flags control behavior
- **Failure Handling** - Handling allocation failures

**Where**: Memory allocation is found in:

- **All Kernel Code** - Every kernel subsystem allocates memory
- **Page Allocator** - mm/page_alloc.c
- **Slab Allocator** - mm/slab.c
- **Driver Code** - Device drivers allocate buffers
- **Memory Management** - Core memory management code

## Buddy System Allocator

**What**: The buddy system allocator manages physical pages by grouping them into power-of-2 sized blocks and splitting/merging blocks as needed.

**Why**: Buddy allocator is important because:

- **Efficiency** - Fast allocation and deallocation
- **Fragmentation** - Reduces external fragmentation
- **Page Management** - Manages physical pages
- **Large Allocations** - Handles large contiguous allocations
- **Foundation** - Foundation for other allocators

**How**: Buddy allocator works:

```c
// Example: Buddy allocator structure
// Pages organized into free lists by order (power of 2)
// order 0: 1 page (4KB)
// order 1: 2 pages (8KB)
// order 2: 4 pages (16KB)
// ...
// order 10: 1024 pages (4MB)

#define MAX_ORDER 11  // Maximum allocation order

struct free_area {
    struct list_head free_list;  // List of free blocks
    unsigned long nr_free;       // Number of free blocks
};

struct zone {
    struct free_area free_area[MAX_ORDER];  // Free lists for each order
    spinlock_t lock;                        // Zone lock
    // ... other fields
};

// Example: Page allocation with buddy system
struct page *alloc_pages(gfp_t gfp_mask, unsigned int order) {
    struct page *page;
    struct zone *zone;

    // Get appropriate zone
    zone = get_zone_from_gfp_flags(gfp_mask);

    // Allocate from zone
    page = __alloc_pages(gfp_mask, order, NULL, zone, NULL);

    return page;
}

// Example: Buddy allocation algorithm
struct page *__alloc_pages(gfp_t gfp_mask, unsigned int order,
                          struct zonelist *zonelist,
                          struct zone *preferred_zone,
                          nodemask_t *nodemask) {
    struct page *page;
    int migratetype;

    // Get migration type from GFP flags
    migratetype = gfpflags_to_migratetype(gfp_mask);

    // Try fast path first
    page = get_page_from_freelist(gfp_mask, order, zonelist,
                                  migratetype);

    if (page) {
        return page;
    }

    // Fast path failed, try slow path
    // This may involve:
    // - Reclaiming memory
    // - Compacting memory
    // - OOM handling
    page = __alloc_pages_slowpath(gfp_mask, order, zonelist);

    return page;
}

// Example: Finding and splitting blocks
struct page *find_and_split_block(struct zone *zone, unsigned int order) {
    unsigned int current_order;

    // Find smallest free block that can satisfy request
    for (current_order = order; current_order < MAX_ORDER; current_order++) {
        if (!list_empty(&zone->free_area[current_order].free_list)) {
            // Found block, split if necessary
            struct page *page = list_entry(zone->free_area[current_order].free_list.next,
                                          struct page, lru);

            // Remove from free list
            list_del(&page->lru);
            zone->free_area[current_order].nr_free--;

            // Split block down to requested order
            while (current_order > order) {
                current_order--;
                // Split into two buddies
                struct page *buddy = page + (1 << current_order);

                // Add buddy to free list
                list_add(&buddy->lru, &zone->free_area[current_order].free_list);
                zone->free_area[current_order].nr_free++;

                // Set buddy page flags
                set_page_order(buddy, current_order);
            }

            // Mark page as allocated
            set_page_order(page, order);

            return page;
        }
    }

    return NULL;  // No free block found
}

// Example: Page deallocation
void __free_pages(struct page *page, unsigned int order) {
    if (!page) {
        return;
    }

    // Get zone from page
    struct zone *zone = page_zone(page);

    // Free pages
    __free_pages_ok(page, order);
}

void __free_pages_ok(struct page *page, unsigned int order) {
    struct zone *zone = page_zone(page);
    unsigned long page_idx;
    unsigned long buddy_idx;
    unsigned long combined_idx;
    struct page *buddy;

    // Calculate page index
    page_idx = page_to_pfn(page) & ((1 << MAX_ORDER) - 1);

    // Try to merge with buddy
    while (order < MAX_ORDER - 1) {
        buddy_idx = page_idx ^ (1 << order);
        buddy = page + (buddy_idx - page_idx);

        // Check if buddy is free and same order
        if (!page_is_buddy(page, buddy, order)) {
            break;  // Cannot merge
        }

        // Remove buddy from free list
        list_del(&buddy->lru);
        zone->free_area[order].nr_free--;
        clear_page_order(buddy);

        // Merge: use lower page index
        combined_idx = buddy_idx & page_idx;
        page = page + (combined_idx - page_idx);
        page_idx = combined_idx;
        order++;
    }

    // Add merged block to free list
    set_page_order(page, order);
    list_add(&page->lru, &zone->free_area[order].free_list);
    zone->free_area[order].nr_free++;
}
```

**Explanation**:

- **Power-of-2 blocks** pages organized in power-of-2 sized blocks
- **Free lists** separate free list for each order
- **Splitting** large blocks split when smaller needed
- **Merging** buddies merged when both freed
- **Efficiency** O(1) allocation when free block available

## Allocation APIs

**What**: Kernel provides various allocation APIs for different use cases and allocation sizes.

**How**: Allocation APIs work:

```c
// Example: Page allocation APIs
// Allocates pages (power of 2)

// Allocate 2^order pages
struct page *alloc_pages(gfp_t gfp_mask, unsigned int order);
struct page *alloc_pages_node(int nid, gfp_t gfp_mask, unsigned int order);

// Free pages
void __free_pages(struct page *page, unsigned int order);
void free_pages(unsigned long addr, unsigned int order);

// Example: Single page allocation
struct page *alloc_page(gfp_t gfp_mask) {
    return alloc_pages(gfp_mask, 0);  // order 0 = 1 page
}

void free_page(struct page *page) {
    __free_pages(page, 0);
}

// Example: kmalloc - Small object allocation
// Uses slab allocator for small sizes, page allocator for large
void *kmalloc(size_t size, gfp_t flags) {
    if (size <= KMALLOC_MAX_SIZE) {
        // Use slab allocator
        return kmem_cache_alloc(find_slab_cache(size), flags);
    } else {
        // Use page allocator
        unsigned int order = get_order(size);
        struct page *page = alloc_pages(flags, order);
        if (!page) {
            return NULL;
        }
        return page_address(page);
    }
}

void kfree(const void *objp) {
    if (!objp) {
        return;
    }

    struct page *page = virt_to_head_page(objp);

    if (PageSlab(page)) {
        // Slab allocation, use slab allocator
        kmem_cache_free(page->slab_cache, (void *)objp);
    } else {
        // Page allocation, free pages
        unsigned int order = compound_order(page);
        __free_pages(page, order);
    }
}

// Example: GFP (Get Free Pages) flags
// GFP flags control allocation behavior:
// - GFP_KERNEL: Normal kernel allocation (can sleep)
// - GFP_ATOMIC: Atomic allocation (cannot sleep)
// - GFP_DMA: DMA-capable memory
// - GFP_HIGHUSER: High memory allocation
// - __GFP_ZERO: Zero-initialize memory
// - __GFP_NOWARN: Don't warn on allocation failure

// Example: GFP flag usage
void *kernel_allocation_example(size_t size) {
    void *ptr;

    // Normal kernel allocation (can sleep)
    ptr = kmalloc(size, GFP_KERNEL);

    // Atomic allocation (interrupt context)
    ptr = kmalloc(size, GFP_ATOMIC);

    // Zero-initialized allocation
    ptr = kzalloc(size, GFP_KERNEL);  // Equivalent to kmalloc + memset

    return ptr;
}

// Example: vmalloc - Non-contiguous virtual memory
void *vmalloc(unsigned long size) {
    // Allocates virtual memory, maps physical pages
    // Pages don't need to be physically contiguous
    // Returns kernel virtual address
    // ... (implementation shown in virtual memory lesson)
}

void vfree(const void *addr) {
    // Frees vmalloc allocation
    // Unmaps pages and frees physical pages
    // ... (implementation)
}

// Example: Allocating aligned memory
void *kmalloc_aligned(size_t size, size_t alignment, gfp_t flags) {
    void *ptr;

    // For small alignments, use slab allocator
    if (alignment <= KMALLOC_MAX_SIZE) {
        ptr = kmalloc(size + alignment, flags);
        if (ptr) {
            // Align pointer
            unsigned long aligned = ALIGN((unsigned long)ptr, alignment);
            return (void *)aligned;
        }
    }

    // For large alignments, use page allocator
    unsigned int order = get_order(ALIGN(size, alignment));
    struct page *page = alloc_pages(flags | __GFP_COMP, order);
    if (!page) {
        return NULL;
    }

    return page_address(page);
}
```

**Explanation**:

- **Page APIs** alloc_pages for page-sized allocations
- **kmalloc** general-purpose allocation for small objects
- **GFP flags** control allocation behavior and constraints
- **vmalloc** non-contiguous virtual memory allocation
- **Alignment** support for aligned allocations

## Slab Allocator

**What**: The slab allocator provides efficient allocation of small objects by maintaining caches of pre-allocated objects.

**Why**: Slab allocator is important because:

- **Efficiency** - Fast allocation for small objects
- **Object Reuse** - Reuses objects, reducing allocation overhead
- **Cache Performance** - Objects stay in cache
- **Fragmentation** - Reduces internal fragmentation
- **Constructor/Destructor** - Can initialize/deinitialize objects

**How**: Slab allocator works:

```c
// Example: Slab cache structure
struct kmem_cache {
    unsigned int size;           // Object size
    unsigned int objsize;         // Actual object size (with padding)
    unsigned int align;           // Alignment
    struct kmem_cache_node *node[MAX_NUMNODES];  // Per-node caches
    // ... other fields
};

// Example: Creating slab cache
struct kmem_cache *kmem_cache_create(const char *name, size_t size,
                                     size_t align, unsigned long flags,
                                     void (*ctor)(void *)) {
    struct kmem_cache *cache;

    // Allocate cache structure
    cache = kmalloc(sizeof(*cache), GFP_KERNEL);
    if (!cache) {
        return NULL;
    }

    // Initialize cache
    cache->size = size;
    cache->objsize = ALIGN(size, align);
    cache->align = align;
    cache->name = kstrdup(name, GFP_KERNEL);

    // Create cache structure
    setup_kmem_cache(cache);

    return cache;
}

// Example: Allocating from slab cache
void *kmem_cache_alloc(struct kmem_cache *cachep, gfp_t flags) {
    void *obj;
    struct kmem_cache_node *n;

    // Get per-CPU cache (fast path)
    struct kmem_cache_cpu *c = get_cpu_ptr(cachep->cpu_slab);

    // Try fast path (per-CPU slab)
    if (c->page && c->freelist) {
        // Get object from freelist
        obj = c->freelist;
        c->freelist = *(void **)obj;
        c->tid = next_tid(c->tid);
        put_cpu_ptr(c);
        return obj;
    }

    // Fast path failed, use slow path
    put_cpu_ptr(c);
    obj = slab_alloc(cachep, flags, _RET_IP_);

    return obj;
}

// Example: Freeing to slab cache
void kmem_cache_free(struct kmem_cache *cachep, void *objp) {
    struct page *page;

    // Get page containing object
    page = virt_to_head_page(objp);

    // Get per-CPU cache
    struct kmem_cache_cpu *c = get_cpu_ptr(cachep->cpu_slab);

    // Fast path: same CPU slab
    if (c->page == page && c->tid == c->page->objects) {
        // Add to freelist
        *(void **)objp = c->freelist;
        c->freelist = objp;
        c->tid = next_tid(c->tid);
        put_cpu_ptr(c);
        return;
    }

    // Slow path
    put_cpu_ptr(c);
    slab_free(cachep, page, objp, _RET_IP_);
}

// Example: Common slab caches
// Kernel maintains common caches for frequently used sizes
void *kmalloc(size_t size, gfp_t flags) {
    // Find appropriate cache for size
    struct kmem_cache *cache = kmalloc_slab(size, flags);

    if (cache) {
        return kmem_cache_alloc(cache, flags);
    }

    // Too large for slab, use page allocator
    return kmalloc_large(size, flags);
}
```

**Explanation**:

- **Cache structure** slab cache maintains object pools
- **Per-CPU cache** fast path using per-CPU slabs
- **Object reuse** freed objects reused, reducing overhead
- **Common caches** kernel provides common size caches
- **Constructor support** can initialize objects on allocation

## Specialized Allocators

**What**: Kernel provides specialized allocators for specific use cases.

**How**: Specialized allocators work:

```c
// Example: DMA-coherent allocation
// Allocates memory that is coherent with DMA operations
void *dma_alloc_coherent(struct device *dev, size_t size,
                        dma_addr_t *dma_handle, gfp_t flags) {
    void *cpu_addr;
    dma_addr_t dma_addr;
    struct page *page;

    // Allocate pages from DMA zone
    page = alloc_pages(flags | GFP_DMA, get_order(size));
    if (!page) {
        return NULL;
    }

    // Get CPU virtual address
    cpu_addr = page_address(page);

    // Get DMA address
    dma_addr = page_to_phys(page);

    // Ensure cache coherency
    dma_map_page(dev, page, 0, size, DMA_BIDIRECTIONAL);

    *dma_handle = dma_addr;
    return cpu_addr;
}

void dma_free_coherent(struct device *dev, size_t size,
                       void *cpu_addr, dma_addr_t dma_handle) {
    struct page *page = virt_to_page(cpu_addr);

    // Unmap DMA
    dma_unmap_page(dev, dma_handle, size, DMA_BIDIRECTIONAL);

    // Free pages
    __free_pages(page, get_order(size));
}

// Example: Per-CPU allocation
// Allocates per-CPU variable (each CPU gets its own copy)
void *alloc_percpu(size_t size, size_t align) {
    // Allocate array of objects, one per CPU
    void __percpu *ptr;
    size_t alloc_size = size * num_possible_cpus();

    ptr = __alloc_percpu(alloc_size, align);

    return ptr;
}

void free_percpu(void __percpu *ptr) {
    if (ptr) {
        __free_percpu(ptr);
    }
}

// Example: Using per-CPU variables
DEFINE_PER_CPU(int, cpu_counter);

void increment_per_cpu_counter(void) {
    // Access per-CPU variable (gets this CPU's copy)
    this_cpu_inc(cpu_counter);

    // Or explicitly get per-CPU pointer
    int *counter = this_cpu_ptr(&cpu_counter);
    (*counter)++;
}

// Example: Memory pool allocation
// Pre-allocated memory pool for fast allocation
struct mempool {
    void **elements;         // Array of pre-allocated objects
    int min_nr;             // Minimum number of elements
    int curr_nr;            // Current number of elements
    void *pool_data;        // Pool data
    mempool_alloc_t *alloc; // Allocation function
    mempool_free_t *free;   // Free function
    wait_queue_head_t wait; // Wait queue
};

void *mempool_alloc(mempool_t *pool, gfp_t gfp_mask) {
    void *element;

    // Try to get from pool first
    if (pool->curr_nr > 0) {
        element = pool->elements[--pool->curr_nr];
        return element;
    }

    // Pool empty, allocate new element
    return pool->alloc(gfp_mask, pool->pool_data);
}

void mempool_free(void *element, mempool_t *pool) {
    // Try to return to pool
    if (pool->curr_nr < pool->min_nr) {
        pool->elements[pool->curr_nr++] = element;
        return;
    }

    // Pool full, free element
    pool->free(element, pool->pool_data);
}
```

**Explanation**:

- **DMA allocation** allocates DMA-coherent memory
- **Per-CPU allocation** each CPU gets own copy
- **Memory pools** pre-allocated pools for fast allocation
- **Specialized needs** each allocator for specific use case
- **Performance** specialized allocators optimize for their use case

## Allocation Failure Handling

**What**: Kernel must handle allocation failures gracefully.

**How**: Failure handling works:

```c
// Example: Allocation failure handling
void *safe_kmalloc(size_t size, gfp_t flags) {
    void *ptr;

    ptr = kmalloc(size, flags);

    if (!ptr) {
        // Allocation failed
        pr_warn("kmalloc failed: size=%zu\n", size);

        // Try alternative allocation
        // Could try:
        // - Smaller allocation
        // - Different GFP flags
        // - Memory reclaim
        // - Fallback mechanism

        return NULL;  // Or handle failure
    }

    return ptr;
}

// Example: Try multiple allocation strategies
void *try_alloc_multiple_strategies(size_t size) {
    void *ptr;

    // Strategy 1: Normal allocation
    ptr = kmalloc(size, GFP_KERNEL);
    if (ptr) {
        return ptr;
    }

    // Strategy 2: Try atomic allocation
    ptr = kmalloc(size, GFP_ATOMIC);
    if (ptr) {
        return ptr;
    }

    // Strategy 3: Try with reclaim
    ptr = kmalloc(size, GFP_KERNEL | __GFP_RECLAIM);
    if (ptr) {
        return ptr;
    }

    // Strategy 4: Try smaller size
    if (size > PAGE_SIZE) {
        ptr = kmalloc(size / 2, GFP_KERNEL);
        if (ptr) {
            pr_warn("Allocated half size: %zu\n", size / 2);
            return ptr;
        }
    }

    // All strategies failed
    return NULL;
}

// Example: Out of memory (OOM) handling
void handle_out_of_memory(gfp_t gfp_mask, int order) {
    // Kernel out of memory situation

    // Try to reclaim memory
    if (gfp_mask & __GFP_FS) {
        // Can use filesystem, try to reclaim
        memory_reclaim(gfp_mask);
    }

    // If still OOM, kill process
    if (check_panic_on_oom()) {
        panic("Out of memory: order=%d\n", order);
    }

    oom_kill_process(gfp_mask, order);
}
```

**Explanation**:

- **Failure detection** check return value for allocation failure
- **Error handling** handle failures appropriately
- **Alternative strategies** try different allocation methods
- **OOM handling** handle out-of-memory situations
- **Graceful degradation** fail gracefully when allocation impossible

## Next Steps

**What** you're ready for next:

After understanding memory allocation, you should be ready to:

1. **Learn Memory Zones** - Physical memory zone organization
2. **Study Memory Compaction** - Memory compaction mechanisms
3. **Understand Memory Reclaim** - Page reclaim and swapping
4. **Explore Memory Debugging** - Memory allocation debugging tools
5. **Begin Optimization** - Optimize memory allocation patterns

**Where** to go next:

Continue with the next lesson on **"Memory Zones"** to learn:

- Memory zone types (DMA, Normal, HighMem)
- Zone watermarks and management
- Zone allocation strategies
- Zone initialization
- Zone-specific operations

**Why** the next lesson is important:

Memory zones organize physical memory into different types for different uses. Understanding zones is essential for understanding how allocation works.

**How** to continue learning:

1. **Study Kernel Code** - Examine memory allocation code
2. **Use Debugging Tools** - Use /proc/slabinfo, /proc/pagetypeinfo
3. **Trace Allocations** - Trace memory allocation patterns
4. **Profile Memory** - Profile memory usage and allocation
5. **Read Documentation** - Study kernel memory documentation

## Resources

**Official Documentation**:

- [Linux Kernel Memory Management](https://www.kernel.org/doc/html/latest/mm/) - Memory management docs
- [Slab Allocator](https://www.kernel.org/doc/html/latest/mm/slab.html) - Slab allocator docs

**Kernel Sources**:

- [Linux Page Allocator](https://github.com/torvalds/linux/tree/master/mm/page_alloc.c) - Buddy system
- [Linux Slab Allocator](https://github.com/torvalds/linux/tree/master/mm/slab.c) - Slab allocator
