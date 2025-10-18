---
sidebar_position: 1
---

# Memory Management Basics

Master the fundamental concepts of memory management in the Linux kernel, understanding how the kernel manages virtual and physical memory, with specific focus on Rock 5B+ ARM64 architecture.

## Virtual Memory Concepts

**What**: Virtual memory is a memory management technique that provides each process with a large, uniform, and private address space. It allows processes to use more memory than physically available by using disk storage as an extension of RAM.

**Why**: Understanding virtual memory is crucial because:

- **Memory abstraction** - Provides consistent memory interface across different hardware
- **Process isolation** - Prevents processes from accessing each other's memory
- **Memory protection** - Implements access control and security
- **Performance optimization** - Enables efficient memory usage through paging
- **System stability** - Prevents system crashes from memory errors
- **Embedded systems** - Critical for Rock 5B+ development

**When**: Virtual memory is relevant when:

- **Process creation** - When new processes are created
- **Memory allocation** - When processes request memory
- **Page faults** - When accessing memory not in physical RAM
- **Context switching** - When switching between processes
- **System boot** - During kernel initialization
- **Memory mapping** - When mapping files or devices to memory

**How**: Virtual memory operates through:

```c
// Example: Virtual memory management
// Page table entry structure
typedef struct {
    unsigned long pte;
} pte_t;

// Page table operations
static inline pte_t pte_mkwrite(pte_t pte)
{
    pte.pte |= PTE_WRITE;
    return pte;
}

static inline pte_t pte_mkread(pte_t pte)
{
    pte.pte |= PTE_READ;
    return pte;
}

static inline pte_t pte_mkexec(pte_t pte)
{
    pte.pte |= PTE_EXEC;
    return pte;
}

// Virtual memory area structure
struct vm_area_struct {
    unsigned long vm_start;             // Start address
    unsigned long vm_end;               // End address
    struct vm_area_struct *vm_next;     // Next VMA
    struct vm_area_struct *vm_prev;     // Previous VMA
    struct rb_node vm_rb;               // VMA tree node
    struct mm_struct *vm_mm;            // Parent mm_struct
    pgprot_t vm_page_prot;              // Access permissions
    unsigned long vm_flags;             // VMA flags
    const struct vm_operations_struct *vm_ops; // VMA operations
    struct file *vm_file;               // Mapped file
    void *vm_private_data;              // Private data
    // ... more fields
};

// Memory descriptor structure
struct mm_struct {
    struct vm_area_struct *mmap;        // List of VMAs
    struct rb_root mm_rb;               // VMA tree
    u64 vmacache_seqnum;                // Per-thread vmacache
    unsigned long (*get_unmapped_area) (struct file *filp,
                unsigned long addr, unsigned long len,
                unsigned long pgoff, unsigned long flags);
    unsigned long mmap_base;            // Base of mmap area
    unsigned long mmap_legacy_base;     // Base of legacy mmap area
    unsigned long task_size;            // Size of task virtual space
    unsigned long highest_vm_end;       // Highest vma end address
    pgd_t * pgd;                        // Page global directory
    atomic_t mm_users;                  // How many users with user space?
    atomic_t mm_count;                  // How many references to "struct mm_struct"?
    // ... many more fields
};
```

**Explanation**:

- **Page tables** - Translate virtual addresses to physical addresses
- **Virtual memory areas** - Represent contiguous virtual memory regions
- **Memory descriptors** - Manage process memory space
- **Page protection** - Control memory access permissions
- **Memory mapping** - Map files and devices to memory

**Where**: Virtual memory is fundamental in:

- **All Linux systems** - Desktop, server, and embedded
- **Multi-tasking systems** - Systems running multiple processes
- **Server systems** - Handling multiple client connections
- **Embedded systems** - IoT devices and controllers
- **Rock 5B+** - ARM64 virtual memory management

## Page Allocation

**What**: Page allocation is the mechanism by which the kernel allocates and manages physical memory pages for processes and kernel use.

**Why**: Understanding page allocation is important because:

- **Memory efficiency** - Optimizes physical memory usage
- **Performance** - Affects system performance and responsiveness
- **Fragmentation** - Manages memory fragmentation
- **Scarcity** - Handles memory pressure and low memory conditions
- **Debugging** - Helps identify memory-related issues

**How**: Page allocation works through:

```c
// Example: Page allocation
// Page structure
struct page {
    unsigned long flags;                // Page flags
    atomic_t count;                     // Reference count
    struct address_space *mapping;      // File mapping
    void *virtual;                      // Virtual address
    struct page *next;                  // Next page in list
    struct page *prev;                  // Previous page in list
    // ... more fields
};

// Page allocation flags
#define GFP_ATOMIC      (__GFP_HIGH|__GFP_ATOMIC|__GFP_KSWAPD_RECLAIM)
#define GFP_KERNEL      (__GFP_RECLAIM | __GFP_IO | __GFP_FS)
#define GFP_NOWAIT      (__GFP_KSWAPD_RECLAIM)
#define GFP_NOIO        (__GFP_RECLAIM)
#define GFP_NOFS        (__GFP_RECLAIM | __GFP_IO)
#define GFP_USER        (__GFP_RECLAIM | __GFP_IO | __GFP_FS | __GFP_HARDWALL)
#define GFP_DMA         __GFP_DMA
#define GFP_DMA32       __GFP_DMA32
#define GFP_HIGHUSER    (GFP_USER | __GFP_HIGHMEM)

// Page allocation function
struct page *alloc_pages(gfp_t gfp_mask, unsigned int order)
{
    struct page *page;
    unsigned int alloc_flags = ALLOC_WMARK_LOW;
    gfp_t alloc_gfp;

    // Convert GFP flags to allocation flags
    alloc_gfp = gfp_mask;
    if (alloc_flags & ALLOC_WMARK_LOW)
        alloc_gfp |= __GFP_HIGHMEM;

    // Try to allocate from free lists
    page = __alloc_pages(alloc_gfp, order, NULL);

    if (unlikely(!page)) {
        // Try memory compaction
        page = __alloc_pages_compaction(alloc_gfp, order);
    }

    return page;
}

// Buddy system page allocation
static struct page *__alloc_pages(gfp_t gfp_mask, unsigned int order,
                                  struct zonelist *zonelist)
{
    struct page *page;
    unsigned int alloc_flags = ALLOC_WMARK_LOW;
    gfp_t alloc_gfp;

    // Convert GFP flags to allocation flags
    alloc_gfp = gfp_mask;
    if (alloc_flags & ALLOC_WMARK_LOW)
        alloc_gfp |= __GFP_HIGHMEM;

    // Try to allocate from free lists
    page = get_page_from_freelist(alloc_gfp, order, alloc_flags, zonelist);

    if (unlikely(!page)) {
        // Try memory compaction
        page = __alloc_pages_compaction(alloc_gfp, order);
    }

    return page;
}

// Free pages
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

- **Page structure** - Represents a physical memory page
- **Allocation flags** - Control allocation behavior and constraints
- **Buddy system** - Manages free pages in power-of-2 sizes
- **Memory zones** - Different memory regions with different properties
- **Fragmentation** - Manages memory fragmentation

**Where**: Page allocation is essential in:

- **Memory management** - All memory allocation in the kernel
- **Process creation** - When creating new processes
- **Driver development** - When allocating memory for drivers
- **System initialization** - During kernel boot
- **Rock 5B+** - ARM64 memory management

## Memory Mapping

**What**: Memory mapping is the process of mapping files, devices, or anonymous memory regions into a process's virtual address space.

**Why**: Understanding memory mapping is important because:

- **File access** - Enables efficient file I/O through memory access
- **Device access** - Provides memory-mapped I/O for devices
- **Shared memory** - Enables memory sharing between processes
- **Performance** - Improves I/O performance through caching
- **Security** - Implements memory access controls

**How**: Memory mapping works through:

```c
// Example: Memory mapping
// Memory mapping system call
asmlinkage long sys_mmap(unsigned long addr, unsigned long len,
                         unsigned long prot, unsigned long flags,
                         unsigned long fd, unsigned long off)
{
    return sys_mmap_pgoff(addr, len, prot, flags, fd, off >> PAGE_SHIFT);
}

// Memory mapping implementation
asmlinkage long sys_mmap_pgoff(unsigned long addr, unsigned long len,
                               unsigned long prot, unsigned long flags,
                               unsigned long fd, unsigned long pgoff)
{
    struct file *file = NULL;
    unsigned long retval = -EBADF;

    // Get file descriptor
    if (fd != -1) {
        file = fget(fd);
        if (!file)
            goto out;
    }

    // Create memory mapping
    retval = do_mmap_pgoff(file, addr, len, prot, flags, pgoff);

    if (file)
        fput(file);

out:
    return retval;
}

// Create memory mapping
unsigned long do_mmap_pgoff(struct file *file, unsigned long addr,
                            unsigned long len, unsigned long prot,
                            unsigned long flags, unsigned long pgoff)
{
    struct mm_struct *mm = current->mm;
    struct vm_area_struct *vma;
    unsigned long retval;

    // Check parameters
    if (len > TASK_SIZE)
        return -ENOMEM;

    // Find suitable address
    if (addr) {
        addr = get_unmapped_area(file, addr, len, pgoff, flags);
        if (IS_ERR_VALUE(addr))
            return addr;
    }

    // Create virtual memory area
    vma = kmem_cache_zalloc(vm_area_cachep, GFP_KERNEL);
    if (!vma)
        return -ENOMEM;

    vma->vm_start = addr;
    vma->vm_end = addr + len;
    vma->vm_flags = flags;
    vma->vm_page_prot = vm_get_page_prot(flags);
    vma->vm_pgoff = pgoff;

    if (file) {
        vma->vm_file = get_file(file);
        vma->vm_ops = &generic_file_vm_ops;
    } else {
        vma->vm_ops = &anonymous_vm_ops;
    }

    // Insert VMA into process memory space
    vma_link(mm, vma, prev, rb_link, rb_parent);

    return addr;
}

// Anonymous memory mapping
static int anonymous_mmap(struct file *file, struct vm_area_struct *vma)
{
    vma->vm_ops = &anonymous_vm_ops;
    return 0;
}

// File memory mapping
static int file_mmap(struct file *file, struct vm_area_struct *vma)
{
    vma->vm_ops = &generic_file_vm_ops;
    return 0;
}
```

**Explanation**:

- **Memory mapping** - Maps files or devices to memory
- **Virtual memory areas** - Represent mapped memory regions
- **File mapping** - Maps files to memory for efficient access
- **Anonymous mapping** - Maps anonymous memory for process use
- **Access permissions** - Control read, write, and execute access

**Where**: Memory mapping is essential in:

- **File I/O** - Efficient file access through memory
- **Device drivers** - Memory-mapped I/O for hardware
- **Shared memory** - Inter-process communication
- **Dynamic loading** - Loading shared libraries
- **Rock 5B+** - ARM64 memory mapping

## Memory Protection

**What**: Memory protection is the mechanism that prevents processes from accessing memory they don't have permission to access.

**Why**: Understanding memory protection is crucial because:

- **Security** - Prevents unauthorized memory access
- **Stability** - Prevents system crashes from memory errors
- **Process isolation** - Ensures processes can't interfere with each other
- **Debugging** - Helps identify memory access violations
- **System integrity** - Maintains system security and stability

**How**: Memory protection works through:

```c
// Example: Memory protection
// Page protection flags
#define _PAGE_PRESENT   (1UL << 0)
#define _PAGE_RW        (1UL << 1)
#define _PAGE_USER      (1UL << 2)
#define _PAGE_PWT       (1UL << 3)
#define _PAGE_PCD       (1UL << 4)
#define _PAGE_ACCESSED  (1UL << 5)
#define _PAGE_DIRTY     (1UL << 6)
#define _PAGE_PSE       (1UL << 7)
#define _PAGE_GLOBAL    (1UL << 8)
#define _PAGE_NX        (1UL << 63)

// Page protection operations
static inline pgprot_t pgprot_none(pgprot_t prot)
{
    return __pgprot(pgprot_val(prot) & ~(_PAGE_PRESENT | _PAGE_RW | _PAGE_USER));
}

static inline pgprot_t pgprot_user(pgprot_t prot)
{
    return __pgprot(pgprot_val(prot) | _PAGE_USER);
}

static inline pgprot_t pgprot_kernel(pgprot_t prot)
{
    return __pgprot(pgprot_val(prot) & ~_PAGE_USER);
}

// Memory access check
static inline int access_ok(const void __user *addr, unsigned long size)
{
    return likely(__access_ok(addr, size));
}

// Copy from user space
unsigned long copy_from_user(void *to, const void __user *from, unsigned long n)
{
    if (likely(access_ok(from, n))) {
        n = __copy_from_user(to, from, n);
    } else {
        memset(to, 0, n);
    }
    return n;
}

// Copy to user space
unsigned long copy_to_user(void __user *to, const void *from, unsigned long n)
{
    if (likely(access_ok(to, n))) {
        n = __copy_to_user(to, from, n);
    }
    return n;
}

// Page fault handling
static int handle_page_fault(struct pt_regs *regs, unsigned long error_code,
                            unsigned long address)
{
    struct vm_area_struct *vma;
    struct mm_struct *mm = current->mm;
    int fault;

    // Check if address is valid
    if (unlikely(address >= TASK_SIZE)) {
        return -EFAULT;
    }

    // Find VMA containing the address
    vma = find_vma(mm, address);
    if (unlikely(!vma)) {
        return -EFAULT;
    }

    // Check permissions
    if (unlikely(!(vma->vm_flags & VM_READ))) {
        return -EFAULT;
    }

    // Handle the page fault
    fault = handle_mm_fault(vma, address, error_code);

    return fault;
}
```

**Explanation**:

- **Page protection** - Controls memory access permissions
- **User/kernel space** - Separates user and kernel memory access
- **Access checks** - Validates memory access permissions
- **Page faults** - Handles memory access violations
- **Copy functions** - Safe copying between user and kernel space

**Where**: Memory protection is fundamental in:

- **All Linux systems** - Desktop, server, and embedded
- **Multi-user systems** - Systems with multiple users
- **Security-critical applications** - Banking, medical, military systems
- **Embedded systems** - IoT devices and controllers
- **Rock 5B+** - ARM64 memory protection

## Rock 5B+ Specific Considerations

**What**: The Rock 5B+ presents specific considerations for memory management due to its ARM64 architecture and 8GB RAM configuration.

**Why**: Understanding Rock 5B+ specifics is important because:

- **ARM64 architecture** - Different from x86_64 systems
- **Memory layout** - ARM64 specific memory organization
- **Cache management** - ARM64 cache coherency protocols
- **Performance characteristics** - Different optimization strategies
- **Development tools** - ARM64-specific debugging and profiling

**How**: Rock 5B+ memory management involves:

```c
// Example: ARM64 specific memory management
// ARM64 page table entry
typedef struct {
    unsigned long pte;
} pte_t;

// ARM64 memory management
static inline void set_pte(pte_t *ptep, pte_t pte)
{
    WRITE_ONCE(*ptep, pte);
    dsb(ishst);
    isb();
}

// ARM64 page allocation
static struct page *alloc_pages_arm64(gfp_t gfp_mask, unsigned int order)
{
    struct page *page;

    // Allocate pages
    page = __alloc_pages(gfp_mask, order, NULL);

    if (page) {
        // Initialize ARM64 specific fields
        init_arm64_page(page);
    }

    return page;
}

// ARM64 memory mapping
static int arm64_mmap(struct file *file, struct vm_area_struct *vma)
{
    // Set ARM64 specific flags
    vma->vm_flags |= VM_ARM64_SPECIFIC;

    // Set up ARM64 specific operations
    vma->vm_ops = &arm64_vm_ops;

    return 0;
}

// ARM64 cache management
static inline void flush_cache_all(void)
{
    flush_cache_mm(NULL);
    flush_icache_range(0, ~0UL);
}

// ARM64 memory barriers
static inline void mb(void)
{
    asm volatile("dmb sy" : : : "memory");
}

static inline void rmb(void)
{
    asm volatile("dmb ld" : : : "memory");
}

static inline void wmb(void)
{
    asm volatile("dmb st" : : : "memory");
}
```

**Explanation**:

- **ARM64 page tables** - ARM64 specific page table format
- **Memory barriers** - ARM64 specific memory ordering
- **Cache management** - ARM64 cache coherency protocols
- **Memory mapping** - ARM64 specific memory mapping
- **Performance optimization** - ARM64 specific optimizations

**Where**: Rock 5B+ specifics are important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **High-memory systems** - Systems with large memory requirements
- **Performance-critical applications** - Real-time and high-performance systems
- **Rock 5B+** - ARM64 single-board computer

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Virtual Memory Understanding** - You understand how virtual memory works
2. **Page Allocation Knowledge** - You know how the kernel allocates memory
3. **Memory Mapping Awareness** - You understand how memory mapping works
4. **Memory Protection** - You know how memory protection is implemented
5. **Platform Specifics** - You understand Rock 5B+ specific considerations

**Why** these concepts matter:

- **Foundation knowledge** provides the basis for memory management
- **Allocation understanding** helps in debugging and optimization
- **Mapping knowledge** enables efficient memory usage
- **Protection awareness** ensures system security and stability
- **Platform knowledge** enables effective embedded development

**When** to use these concepts:

- **Memory design** - Apply memory concepts when designing systems
- **Debugging** - Use allocation knowledge to debug memory issues
- **Performance tuning** - Apply mapping knowledge to optimize systems
- **Security implementation** - Use protection concepts for secure design
- **Embedded development** - Apply platform knowledge for Rock 5B+

**Where** these skills apply:

- **System programming** - Understanding memory management interfaces
- **Driver development** - Managing memory for device drivers
- **Kernel development** - Modifying memory management code
- **Embedded Linux** - Applying memory concepts to embedded systems
- **Professional development** - Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering memory management basics, you should be ready to:

1. **Learn system calls** - Understand the interface between user and kernel space
2. **Study interrupts** - Learn interrupt handling and exceptions
3. **Begin practical development** - Start working with kernel modules
4. **Understand device drivers** - Learn how drivers interface with the kernel
5. **Explore real-time systems** - Learn real-time Linux concepts

**Where** to go next:

Continue with the next lesson on **"System Calls and Interrupts"** to learn:

- How user programs communicate with the kernel
- System call interface and implementation
- Interrupt handling and exception processing
- Hardware interaction and device communication

**Why** the next lesson is important:

The next lesson builds directly on your memory management knowledge by showing you how user programs interact with the kernel. You'll learn about system calls, interrupts, and exceptions, which are essential for understanding how the system operates.

**How** to continue learning:

1. **Study system calls** - Explore system call implementation
2. **Experiment with interrupts** - Create programs that handle interrupts
3. **Read documentation** - Study system call and interrupt documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple system call experiments

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
- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [Device Tree Specification](https://www.devicetree.org/specifications/) - Device tree documentation

Happy learning! 🐧
