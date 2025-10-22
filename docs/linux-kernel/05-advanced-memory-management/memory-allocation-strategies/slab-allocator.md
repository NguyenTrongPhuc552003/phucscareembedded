---
sidebar_position: 1
---

# Slab Allocator

Master the Linux kernel's slab allocator system, understanding how it efficiently manages memory allocation for kernel objects, reducing fragmentation and improving performance on the Rock 5B+ platform.

## What is the Slab Allocator?

**What**: The slab allocator is a memory management mechanism that provides efficient allocation and deallocation of kernel objects by pre-allocating memory in fixed-size chunks called slabs, organized into caches for different object types.

**Why**: Understanding the slab allocator is crucial because:

- **Memory efficiency** - Reduces internal fragmentation for kernel objects
- **Performance optimization** - Fast allocation/deallocation through object caching
- **Cache locality** - Improves CPU cache performance
- **Object reuse** - Minimizes allocation overhead
- **Rock 5B+ development** - ARM64 specific slab allocator considerations
- **Professional development** - Essential for kernel memory management

**When**: The slab allocator is used when:

- **Kernel object allocation** - Allocating kernel data structures
- **Frequent allocations** - Objects allocated and freed frequently
- **Fixed-size objects** - Objects of the same type and size
- **Performance critical** - Low-latency allocation required
- **Development** - Understanding kernel memory management
- **Rock 5B+** - ARM64 kernel memory allocation

**How**: The slab allocator works by:

- **Cache creation** - Creating caches for specific object types
- **Slab allocation** - Allocating slabs of memory for caches
- **Object allocation** - Allocating objects from slabs
- **Object deallocation** - Returning objects to slabs
- **Cache management** - Growing and shrinking caches
- **Memory reclamation** - Freeing unused slabs

**Where**: The slab allocator is found in:

- **Kernel subsystems** - All kernel memory allocations
- **Device drivers** - Driver data structure allocation
- **File systems** - Inode and dentry caches
- **Network stack** - Socket and sk_buff allocation
- **Process management** - Task struct allocation
- **Rock 5B+** - ARM64 kernel memory management

## Slab Cache Management

**What**: Slab cache management involves creating, configuring, and managing slab caches for different kernel object types.

**Why**: Understanding cache management is important because:

- **Memory organization** - Organizing memory for different object types
- **Performance optimization** - Tuning cache parameters for performance
- **Memory efficiency** - Balancing memory usage and allocation speed
- **System monitoring** - Understanding memory usage patterns
- **Rock 5B+ optimization** - ARM64 specific cache tuning

**When**: Cache management is relevant when:

- **Driver development** - Creating caches for driver objects
- **Performance tuning** - Optimizing memory allocation performance
- **Memory debugging** - Analyzing memory usage
- **System optimization** - Improving overall system performance
- **Rock 5B+** - ARM64 memory management

**How**: Cache management works through:

```c
// Example: Slab cache management
#include <linux/slab.h>

// 1. Define object structure
struct my_object {
    int id;
    char name[64];
    void *data;
    struct list_head list;
};

// Cache pointer
static struct kmem_cache *my_object_cache;

// 2. Create slab cache
int init_my_object_cache(void) {
    // Create cache with specific name, size, and alignment
    my_object_cache = kmem_cache_create("my_object_cache",
                                       sizeof(struct my_object),
                                       __alignof__(struct my_object),
                                       SLAB_HWCACHE_ALIGN | SLAB_PANIC,
                                       NULL);  // No constructor

    if (!my_object_cache) {
        pr_err("Failed to create my_object cache\n");
        return -ENOMEM;
    }

    pr_info("Created slab cache: %s\n", "my_object_cache");
    return 0;
}

// 3. Allocate object from cache
struct my_object *alloc_my_object(gfp_t flags) {
    struct my_object *obj;

    // Allocate from cache
    obj = kmem_cache_alloc(my_object_cache, flags);
    if (!obj) {
        pr_err("Failed to allocate object\n");
        return NULL;
    }

    // Initialize object
    memset(obj, 0, sizeof(*obj));
    INIT_LIST_HEAD(&obj->list);

    return obj;
}

// 4. Free object to cache
void free_my_object(struct my_object *obj) {
    if (obj)
        kmem_cache_free(my_object_cache, obj);
}

// 5. Destroy cache
void cleanup_my_object_cache(void) {
    if (my_object_cache) {
        kmem_cache_destroy(my_object_cache);
        my_object_cache = NULL;
    }
}

// 6. Cache with constructor
static void my_object_ctor(void *obj) {
    struct my_object *my_obj = obj;

    // Initialize common fields
    my_obj->id = 0;
    my_obj->data = NULL;
    INIT_LIST_HEAD(&my_obj->list);
}

int init_cache_with_constructor(void) {
    my_object_cache = kmem_cache_create("my_object_cache",
                                       sizeof(struct my_object),
                                       0,  // Default alignment
                                       SLAB_HWCACHE_ALIGN,
                                       my_object_ctor);  // Constructor

    return my_object_cache ? 0 : -ENOMEM;
}
```

**Explanation**:

- **kmem_cache_create** - Creates a new slab cache
- **kmem_cache_alloc** - Allocates object from cache
- **kmem_cache_free** - Returns object to cache
- **kmem_cache_destroy** - Destroys cache and frees memory
- **Constructor** - Optional initialization function
- **Flags** - SLAB_HWCACHE_ALIGN, SLAB_PANIC, etc.

**Where**: Cache management applies in:

- **Kernel modules** - Driver and subsystem caches
- **File systems** - Inode, dentry, buffer caches
- **Network stack** - SKB, socket caches
- **Memory management** - Page cache, VMA cache
- **Rock 5B+** - ARM64 kernel caches

## SLUB Allocator

**What**: SLUB (the Unqueued Slab allocator) is the default slab allocator implementation in modern Linux kernels, replacing the original SLAB allocator with a simpler, more scalable design.

**Why**: Understanding SLUB is important because:

- **Current implementation** - Default allocator in modern kernels
- **Performance** - Better scalability on multi-core systems
- **Simplicity** - Simpler design, easier to debug
- **Memory efficiency** - Lower memory overhead
- **Rock 5B+ performance** - Optimized for ARM64 multi-core

**How**: SLUB works through:

```c
// Example: SLUB-specific features
// 1. Per-CPU partial lists for lockless allocation
struct kmem_cache_cpu {
    void **freelist;           // Pointer to next available object
    unsigned long tid;         // Transaction ID
    struct page *page;         // Current slab page
    struct page *partial;      // Partial slab pages
};

// 2. SLUB debugging features
// Enable debugging in kernel config:
// CONFIG_SLUB_DEBUG=y

// Runtime debugging via sysfs:
// echo 1 > /sys/kernel/slab/<cache>/validate
// cat /sys/kernel/slab/<cache>/alloc_calls
// cat /sys/kernel/slab/<cache>/free_calls

// 3. SLUB statistics
// cat /proc/slabinfo
// cat /sys/kernel/slab/<cache>/aliases
// cat /sys/kernel/slab/<cache>/align
// cat /sys/kernel/slab/<cache>/object_size
// cat /sys/kernel/slab/<cache>/objs_per_slab
```

**Explanation**:

- **Per-CPU lists** - Lockless fast path for allocation
- **Debugging support** - Extensive debugging features
- **Statistics** - Detailed usage statistics via sysfs
- **Performance** - Optimized for modern multi-core CPUs

## Object Allocation and Deallocation

**What**: Object allocation and deallocation involves efficiently managing kernel object lifecycles using the slab allocator.

**Why**: Understanding allocation/deallocation is important because:

- **Performance** - Fast allocation/deallocation critical for kernel
- **Memory leaks** - Proper deallocation prevents leaks
- **Resource management** - Managing limited kernel memory
- **System stability** - Incorrect usage causes crashes

**How**: Allocation and deallocation works through:

```c
// Example: Proper object allocation and deallocation
// 1. Basic allocation patterns
void example_allocation(void) {
    struct my_object *obj;

    // Allocate with GFP_KERNEL (can sleep)
    obj = kmem_cache_alloc(my_object_cache, GFP_KERNEL);
    if (!obj)
        return;

    // Use object
    obj->id = 42;
    strncpy(obj->name, "example", sizeof(obj->name));

    // Free when done
    kmem_cache_free(my_object_cache, obj);
}

// 2. Atomic allocation (cannot sleep)
void example_atomic_allocation(void) {
    struct my_object *obj;

    // Allocate with GFP_ATOMIC (interrupt context safe)
    obj = kmem_cache_alloc(my_object_cache, GFP_ATOMIC);
    if (!obj) {
        pr_warn("Atomic allocation failed\n");
        return;
    }

    // Use and free
    process_object(obj);
    kmem_cache_free(my_object_cache, obj);
}

// 3. Zero-initialized allocation
void example_zalloc(void) {
    struct my_object *obj;

    // Allocate and zero-initialize
    obj = kmem_cache_zalloc(my_object_cache, GFP_KERNEL);
    if (!obj)
        return;

    // Object is already zeroed
    kmem_cache_free(my_object_cache, obj);
}

// 4. Bulk allocation
void example_bulk_allocation(void) {
    void *objects[10];
    int i, ret;

    // Allocate multiple objects at once
    ret = kmem_cache_alloc_bulk(my_object_cache, GFP_KERNEL,
                                10, objects);
    if (ret < 10) {
        pr_warn("Bulk allocation failed: got %d objects\n", ret);
        // Free allocated objects
        for (i = 0; i < ret; i++)
            kmem_cache_free(my_object_cache, objects[i]);
        return;
    }

    // Use objects
    for (i = 0; i < 10; i++) {
        process_object(objects[i]);
    }

    // Bulk free
    kmem_cache_free_bulk(my_object_cache, 10, objects);
}
```

**Explanation**:

- **GFP flags** - Control allocation behavior (GFP_KERNEL, GFP_ATOMIC)
- **Error handling** - Always check allocation success
- **Zero initialization** - kmem_cache_zalloc for zero-filled objects
- **Bulk operations** - Efficient multi-object allocation

## Rock 5B+ Slab Allocator

**What**: The Rock 5B+ platform uses the SLUB allocator optimized for ARM64 architecture with 8-core CPU configuration.

**Why**: Understanding Rock 5B+ slab allocator is important because:

- **ARM64 architecture** - Different cache line sizes and alignment
- **RK3588 SoC** - 8-core CPU requires scalable allocator
- **Cache optimization** - ARM64 specific cache considerations
- **Performance** - Multi-core slab allocator performance
- **Memory constraints** - Embedded platform optimization

**How**: Rock 5B+ slab allocator involves:

```bash
# Rock 5B+ slab allocator configuration and monitoring

# 1. View slab statistics
cat /proc/slabinfo | head -20

# 2. View SLUB allocator info
ls /sys/kernel/slab/
cat /sys/kernel/slab/kmalloc-*/object_size

# 3. Monitor cache usage
cat /proc/slabinfo | awk '{print $1, $2, $3, $5}' | column -t

# 4. Debug specific cache
echo 1 > /sys/kernel/slab/dentry/validate
cat /sys/kernel/slab/dentry/alloc_calls | head -10

# 5. ARM64 cache line size
getconf LEVEL1_DCACHE_LINESIZE
# Typically 64 bytes on ARM64

# 6. Tune slab allocator (if needed)
# In kernel config:
# CONFIG_SLUB_CPU_PARTIAL=y (for better per-CPU performance)
```

**Explanation**:

- **Cache monitoring** - /proc/slabinfo for runtime statistics
- **Debugging** - SLUB debugging via sysfs
- **ARM64 optimization** - 64-byte cache line alignment
- **Multi-core** - Per-CPU partial lists for scalability
- **Performance tuning** - CONFIG options for optimization

## Key Takeaways

**What** you've accomplished:

1. **Slab Allocator Understanding** - You understand the slab allocator mechanism
2. **Cache Management** - You know how to create and manage slab caches
3. **SLUB Allocator** - You understand the modern SLUB implementation
4. **Object Allocation** - You can properly allocate and free objects
5. **Rock 5B+ Slab** - You understand ARM64 specific considerations

**Why** these concepts matter:

- **Memory efficiency** - Efficient kernel memory management
- **Performance** - Fast allocation critical for kernel performance
- **System stability** - Proper usage prevents memory issues
- **Platform knowledge** - Rock 5B+ optimization opportunities

**When** to use these concepts:

- **Driver development** - Allocating driver data structures
- **Kernel modules** - Managing module memory
- **Performance tuning** - Optimizing memory allocation
- **Debugging** - Analyzing memory usage patterns

**Where** these skills apply:

- **Kernel development** - All kernel subsystems use slab allocator
- **Driver development** - Device driver memory management
- **System optimization** - Performance tuning
- **Rock 5B+** - ARM64 kernel development

## Next Steps

Continue with:

1. **Page Allocator** - Understand page-level memory allocation
2. **Memory Compaction** - Learn memory defragmentation techniques

## Resources

**Official Documentation**:

- [Slab Allocator](https://www.kernel.org/doc/html/latest/core-api/memory-allocation.html) - Kernel memory allocation
- [SLUB Documentation](https://www.kernel.org/doc/html/latest/vm/slub.html) - SLUB allocator details

**Learning Resources**:

- [Understanding the Linux Kernel](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Memory management chapter

**Rock 5B+ Specific**:

- [ARM64 Architecture](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory architecture

Happy learning! 🐧
