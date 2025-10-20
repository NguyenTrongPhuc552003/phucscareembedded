---
sidebar_position: 2
---

# Page Allocation

Master the Linux kernel page allocation mechanisms, understanding how the kernel manages physical memory allocation and deallocation, with specific focus on ARM64 architecture and Rock 5B+ optimization.

## What is Page Allocation?

**What**: Page allocation is the process by which the Linux kernel manages physical memory pages, allocating them to processes and kernel subsystems as needed.

**Why**: Understanding page allocation is crucial because:

- **Memory Management**: Foundation of kernel memory management
- **Performance**: Affects system performance and responsiveness
- **Resource Management**: Efficient use of limited physical memory
- **Debugging**: Essential for memory-related debugging
- **Embedded Systems**: Critical for Rock 5B+ memory optimization

**When**: Page allocation occurs when:

- **Process Creation**: New processes need memory
- **Memory Expansion**: Processes request more memory
- **Kernel Operations**: Kernel subsystems need memory
- **Device Drivers**: Drivers allocate memory for hardware
- **File Systems**: File system operations need memory

**How**: Page allocation works through:

```c
// Example: Page allocation functions
// Page structure
struct page {
    unsigned long flags;
    atomic_t count;
    struct address_space *mapping;
    void *virtual;
    // ... more fields
};

// Page allocation
struct page *alloc_pages(gfp_t gfp_mask, unsigned int order)
{
    struct page *page;
    unsigned int alloc_flags = ALLOC_WMARK_LOW;
    gfp_t alloc_gfp;

    alloc_gfp = gfp_mask;
    if (alloc_flags & ALLOC_WMARK_LOW)
        alloc_gfp |= __GFP_HIGHMEM;

    page = __alloc_pages(alloc_gfp, order, NULL);

    if (unlikely(!page)) {
        page = __alloc_pages_compaction(alloc_gfp, order);
    }

    return page;
}

// Buddy system
struct free_area {
    struct list_head free_list[MIGRATE_TYPES];
    unsigned long nr_free;
};

// Zone structure
struct zone {
    unsigned long watermark[NR_WMARK];
    unsigned long lowmem_reserve[MAX_NR_ZONES];
    struct free_area free_area[MAX_ORDER];
    // ... more fields
};
```

**Where**: Page allocation is fundamental in:

- **All Linux systems**: Desktop, server, and embedded
- **Memory management**: Core kernel functionality
- **Process management**: Process memory allocation
- **Device drivers**: Driver memory requirements
- **Rock 5B+**: ARM64 memory management

## Buddy System

**What**: The buddy system is the primary algorithm used by the Linux kernel for page allocation, organizing free pages into power-of-2 sized blocks.

**Why**: The buddy system is important because:

- **Efficiency**: Minimizes memory fragmentation
- **Speed**: Fast allocation and deallocation
- **Simplicity**: Simple and reliable algorithm
- **Performance**: Good performance characteristics
- **Scalability**: Works well with large memory systems

**How**: The buddy system works through:

```c
// Example: Buddy system implementation
// Free area structure
struct free_area {
    struct list_head free_list[MIGRATE_TYPES];
    unsigned long nr_free;
};

// Zone structure
struct zone {
    unsigned long watermark[NR_WMARK];
    unsigned long lowmem_reserve[MAX_NR_ZONES];
    struct free_area free_area[MAX_ORDER];
    spinlock_t lock;
    // ... more fields
};

// Buddy allocation
static struct page *__alloc_pages(gfp_t gfp_mask, unsigned int order,
                                 struct zonelist *zonelist)
{
    struct page *page;
    unsigned int alloc_flags = ALLOC_WMARK_LOW;
    gfp_t alloc_gfp;

    alloc_gfp = gfp_mask;
    if (alloc_flags & ALLOC_WMARK_LOW)
        alloc_gfp |= __GFP_HIGHMEM;

    page = get_page_from_freelist(alloc_gfp, order, alloc_flags, zonelist);

    if (unlikely(!page)) {
        page = __alloc_pages_slowpath(alloc_gfp, order, zonelist);
    }

    return page;
}

// Buddy deallocation
void __free_pages(struct page *page, unsigned int order)
{
    if (put_page_testzero(page)) {
        if (order == 0)
            free_hot_cold_page(page, false);
        else
            __free_pages_ok(page, order);
    }
}
```

**Explanation**:

- **Power-of-2 blocks**: Pages organized in 2^n sized blocks
- **Coalescing**: Adjacent free blocks are merged
- **Splitting**: Large blocks are split when needed
- **Order**: Order represents log2 of block size
- **Fragmentation**: Minimizes external fragmentation

**Where**: The buddy system is used in:

- **Page allocation**: Primary page allocation mechanism
- **Memory management**: Core memory management
- **Process memory**: Process memory allocation
- **Kernel memory**: Kernel subsystem memory
- **Device drivers**: Driver memory allocation

## Slab Allocator

**What**: The slab allocator provides efficient allocation of small objects by caching frequently used object types.

**Why**: The slab allocator is important because:

- **Efficiency**: Reduces allocation overhead for small objects
- **Cache Performance**: Improves cache hit rates
- **Fragmentation**: Reduces internal fragmentation
- **Performance**: Faster than buddy system for small objects
- **Memory Usage**: More efficient memory usage

**How**: The slab allocator works through:

```c
// Example: Slab allocator
// Slab cache structure
struct kmem_cache {
    struct array_cache *cpu_cache;
    struct array_cache *cpu_cache_flush;
    unsigned int batchcount;
    unsigned int limit;
    unsigned int shared;
    unsigned int size;
    unsigned int align;
    unsigned int red_left_pad;
    const char *name;
    struct list_head list;
    // ... more fields
};

// Slab allocation
void *kmalloc(size_t size, gfp_t flags)
{
    struct kmem_cache *cachep;
    void *ret;

    if (unlikely(size > KMALLOC_MAX_CACHE_SIZE))
        return kmalloc_large(size, flags);

    cachep = kmem_cache_find(size);
    if (cachep)
        ret = kmem_cache_alloc(cachep, flags);
    else
        ret = __kmalloc(size, flags);

    return ret;
}

// Slab deallocation
void kfree(const void *objp)
{
    struct kmem_cache *c;
    unsigned long flags;

    if (unlikely(ZERO_OR_NULL_PTR(objp)))
        return;

    c = virt_to_cache(objp);
    kmem_cache_free(c, (void *)objp);
}
```

**Explanation**:

- **Object caching**: Caches frequently used objects
- **Size classes**: Different caches for different sizes
- **CPU caches**: Per-CPU caches for performance
- **Slab pages**: Pages divided into object-sized chunks
- **Reuse**: Objects are reused to reduce allocation overhead

**Where**: The slab allocator is used in:

- **Small objects**: Objects smaller than a page
- **Frequent allocations**: Frequently allocated objects
- **Kernel data structures**: Kernel data structure allocation
- **Device drivers**: Driver object allocation
- **File systems**: File system object allocation

## ARM64 Specific Considerations

**What**: ARM64 architecture presents specific considerations for page allocation on the Rock 5B+ platform.

**Why**: Understanding ARM64 specifics is important because:

- **Architecture Differences**: Different from x86_64 page allocation
- **Memory Layout**: ARM64 specific memory layout
- **Cache Management**: ARM64 specific cache handling
- **Performance**: ARM64 specific optimizations
- **Embedded Systems**: Critical for Rock 5B+ development

**How**: ARM64 page allocation involves:

```c
// Example: ARM64 specific page allocation
// ARM64 page table entry
typedef struct {
    unsigned long pte;
} pte_t;

// ARM64 page allocation
static inline struct page *alloc_pages_arm64(gfp_t gfp_mask, unsigned int order)
{
    struct page *page;

    page = alloc_pages(gfp_mask, order);

    if (page) {
        // ARM64 specific initialization
        arm64_page_init(page, order);
    }

    return page;
}

// ARM64 memory management
static inline void set_pte(pte_t *ptep, pte_t pte)
{
    WRITE_ONCE(*ptep, pte);
    dsb(ishst);
    isb();
}

// ARM64 cache management
static inline void flush_cache_all(void)
{
    flush_cache_mm(NULL);
    flush_icache_range(0, ~0UL);
}
```

**Explanation**:

- **Page table format**: ARM64 specific page table structure
- **Memory barriers**: ARM64 specific memory ordering
- **Cache management**: ARM64 cache coherency protocols
- **Memory layout**: ARM64 specific memory organization
- **Performance**: ARM64 specific optimizations

**Where**: ARM64 specifics are important in:

- **ARM64 systems**: All ARM64-based Linux systems
- **Embedded development**: ARM64 embedded systems
- **Mobile devices**: Smartphones and tablets
- **Server systems**: ARM64 servers and workstations
- **Rock 5B+**: ARM64 single-board computer

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Page Allocation Understanding**: You understand page allocation mechanisms
2. **Buddy System Knowledge**: You know how the buddy system works
3. **Slab Allocator Awareness**: You understand the slab allocator
4. **ARM64 Specifics**: You know ARM64 specific considerations
5. **Performance Understanding**: You understand performance implications

**Why** these concepts matter:

- **Memory Management**: Essential for understanding kernel memory management
- **Performance**: Critical for system performance optimization
- **Embedded Systems**: Important for embedded Linux development
- **Professional Skills**: Industry-standard systems programming

**When** to use these concepts:

- **Memory Management**: When working with kernel memory
- **Performance Tuning**: When optimizing memory usage
- **Debugging**: When troubleshooting memory issues
- **Development**: When writing kernel code
- **Embedded Development**: When developing for Rock 5B+

**Where** these skills apply:

- **Kernel Development**: Understanding memory allocation internals
- **Embedded Linux**: Applying memory concepts to embedded systems
- **System Administration**: Optimizing system memory usage
- **Professional Development**: Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering page allocation, you should be ready to:

1. **Learn Memory Mapping**: Understand memory mapping mechanisms
2. **Study System Calls**: Learn the user-kernel interface
3. **Begin Practical Development**: Start working with kernel modules
4. **Understand Interrupts**: Learn interrupt handling and exceptions

**Where** to go next:

Continue with the next lesson on **"Memory Mapping"** to learn:

- Memory mapping mechanisms
- Virtual memory management
- Page table management
- ARM64 specific memory mapping

**Why** the next lesson is important:

The next lesson builds on your page allocation knowledge by diving into memory mapping, which is fundamental to understanding how the kernel manages virtual memory on the Rock 5B+.

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Memory Management](https://www.kernel.org/doc/html/latest/vm/) - Memory management documentation
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64-specific documentation

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook
- [Understanding the Linux Kernel by Bovet and Cesati](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Detailed kernel internals

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide

Happy learning! 🐧
