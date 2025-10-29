---
sidebar_position: 1
---

# Virtual Memory Layout

Master RISC-V Linux kernel virtual memory layout, understanding how virtual address space is organized into kernel and user regions, essential for kernel development and understanding memory management.

## What Is Virtual Memory Layout?

**What**: Virtual memory layout defines how the 64-bit virtual address space is divided between kernel and user space, and how different kernel subsystems are mapped in virtual memory. On RISC-V, this uses the Sv39 or Sv48 page table format with specific address ranges.

**Why**: Understanding virtual memory layout is crucial because:

- **Address Space Organization** - Know where different regions are located
- **Kernel Development** - Kernel code uses virtual addresses
- **Memory Mapping** - Understand how physical memory is mapped
- **Security Boundaries** - Understand kernel/user space separation
- **Debugging** - Helps debug memory-related issues
- **Performance** - Layout affects memory access performance

**When**: Virtual memory layout is relevant when:

- **Kernel Development** - Writing kernel code that uses addresses
- **Memory Allocation** - Allocating kernel memory
- **Device Drivers** - Mapping device memory
- **Debugging** - Understanding memory addresses in debugging
- **Security** - Implementing memory protection
- **Performance Tuning** - Optimizing memory access

**How**: Virtual memory layout works through:

- **Address Space Split** - Split between kernel and user space
- **Direct Mapping** - Direct kernel mapping of physical memory
- **vmalloc Region** - Non-contiguous virtual memory
- **Fixmap Region** - Fixed virtual mappings
- **Page Tables** - Page tables implement the layout
- **MMU** - Memory Management Unit enforces layout

**Where**: Virtual memory layout is found in:

- **Kernel Source** - arch/riscv/include/asm/pgtable.h
- **Kernel Initialization** - arch/riscv/mm/init.c
- **Memory Management** - mm/ directory
- **Device Drivers** - Drivers using ioremap/vmalloc
- **Debugging** - Addresses shown in debugging

## RISC-V Virtual Address Space

**What**: RISC-V 64-bit virtual address space is divided into kernel and user regions.

**How**: Address space layout works:

```c
// Example: RISC-V 64-bit virtual address space (Sv39)
// Total address space: 39-bit virtual addresses (512 GB)
// Address range: 0x0000000000 - 0x7FFFFFFFFFFF (512 GB)

// Split between user and kernel:
// User space:   0x0000000000 - 0x7FFFFFFFFFFF (lower half, 256 GB)
// Kernel space: 0xFFFFFFFF80000000 - 0xFFFFFFFFFFFFFFFF (upper half, 256 GB)

#define USER_VIRT_START       0x0000000000000000UL
#define USER_VIRT_END         0x0000007FFFFFFFFFFFUL
#define KERNEL_VIRT_START     0xFFFFFFFF80000000UL
#define KERNEL_VIRT_END       0xFFFFFFFFFFFFFFFFUL

// Example: Address space layout diagram
/*
User Space (256 GB):
  0x0000000000 - 0x00007FFFFFFFFFFF
  ├── Code segment (text)
  ├── Data segment
  ├── BSS segment
  ├── Heap (grows up)
  ├── Libraries (shared objects)
  └── Stack (grows down)

Kernel Space (256 GB):
  0xFFFFFFFF80000000 - 0xFFFFFFFFFFFFFFFF
  ├── Kernel text (0xFFFFFFFF80000000)
  ├── Kernel data
  ├── Direct mapping region (linear mapping)
  ├── vmalloc region (0xFFFFFFFFC0000000)
  ├── Fixmap region (0xFFFFFFFFFE000000)
  └── Device tree (0xFFFFFFFFFE000000)
*/

// Example: Checking if address is kernel space
bool is_kernel_address(unsigned long addr) {
    return addr >= KERNEL_VIRT_START && addr < KERNEL_VIRT_END;
}

// Example: Checking if address is user space
bool is_user_address(unsigned long addr) {
    return addr >= USER_VIRT_START && addr <= USER_VIRT_END;
}

// Example: Kernel base address
#define PAGE_OFFSET           KERNEL_VIRT_START
#define KERNEL_LINK_ADDR       KERNEL_VIRT_START

// Example: Virtual to physical conversion (direct mapping)
unsigned long __virt_to_phys(unsigned long virt) {
    if (virt >= KERNEL_VIRT_START && virt < VMALLOC_START) {
        // Direct mapping region
        return virt - PAGE_OFFSET;
    }
    return 0;  // Not directly mapped
}

unsigned long __phys_to_virt(unsigned long phys) {
    // Direct mapping
    return phys + PAGE_OFFSET;
}
```

**Explanation**:

- **Address split** upper half for kernel, lower half for user
- **Direct mapping** kernel uses direct 1:1 mapping for most memory
- **Address checking** functions to check if address is kernel/user
- **Base addresses** PAGE_OFFSET defines kernel base
- **Conversion** simple arithmetic for direct-mapped regions

## Kernel Virtual Memory Regions

**What**: Kernel virtual address space is divided into multiple regions for different purposes.

**How**: Kernel regions work:

```c
// Example: Kernel virtual memory regions (RISC-V)
#define KERNEL_VIRT_START         0xFFFFFFFF80000000UL
#define KERNEL_TEXT_START         KERNEL_VIRT_START
#define KERNEL_TEXT_END           (KERNEL_TEXT_START + 32*1024*1024)  // 32MB

#define KERNEL_DATA_START         KERNEL_TEXT_END
#define KERNEL_DATA_END           (KERNEL_DATA_START + 128*1024*1024)  // 128MB

#define VMALLOC_START             0xFFFFFFFFC0000000UL
#define VMALLOC_END               0xFFFFFFFFE0000000UL  // 512MB total

#define FIXMAP_START              0xFFFFFFFFFE000000UL
#define FIXMAP_END                0xFFFFFFFFFF000000UL  // 16MB

#define FDT_VIRT_BASE             0xFFFFFFFFFE000000UL

// Example: Kernel text region (code)
bool is_kernel_text(unsigned long addr) {
    return addr >= KERNEL_TEXT_START && addr < KERNEL_TEXT_END;
}

// Example: Kernel data region
bool is_kernel_data(unsigned long addr) {
    return addr >= KERNEL_DATA_START && addr < KERNEL_DATA_END;
}

// Example: Direct mapping region
// Maps physical memory 1:1 to virtual memory
// Simplifies kernel access to physical memory
bool is_direct_mapped(unsigned long addr) {
    return addr >= KERNEL_VIRT_START && addr < VMALLOC_START;
}

// Example: vmalloc region
// Non-contiguous virtual memory allocations
bool is_vmalloc_address(unsigned long addr) {
    return addr >= VMALLOC_START && addr < VMALLOC_END;
}

// Example: Fixmap region
// Fixed virtual address mappings
bool is_fixmap_address(unsigned long addr) {
    return addr >= FIXMAP_START && addr < FIXMAP_END;
}

// Example: Kernel memory layout initialization
void setup_kernel_virtual_memory_layout(void) {
    pr_info("Kernel virtual memory layout:\n");
    pr_info("  Text:       %016lx - %016lx\n",
            KERNEL_TEXT_START, KERNEL_TEXT_END);
    pr_info("  Data:       %016lx - %016lx\n",
            KERNEL_DATA_START, KERNEL_DATA_END);
    pr_info("  Direct Map: %016lx - %016lx\n",
            KERNEL_VIRT_START, VMALLOC_START);
    pr_info("  vmalloc:    %016lx - %016lx\n",
            VMALLOC_START, VMALLOC_END);
    pr_info("  Fixmap:     %016lx - %016lx\n",
            FIXMAP_START, FIXMAP_END);
}
```

**Explanation**:

- **Text region** kernel code (read-only, executable)
- **Data region** kernel data (read-write, not executable)
- **Direct mapping** 1:1 physical to virtual mapping
- **vmalloc region** non-contiguous virtual memory
- **Fixmap region** fixed virtual address mappings

## Direct Memory Mapping

**What**: Direct memory mapping provides a 1:1 correspondence between physical and kernel virtual addresses.

**Why**: Direct mapping is important because:

- **Simplicity** - Simple address conversion
- **Performance** - Fast address translation
- **Compatibility** - Works with code expecting physical addresses
- **Efficiency** - No page table lookup for conversion
- **Kernel Code** - Most kernel code uses direct mapping

**How**: Direct mapping works:

```c
// Example: Direct mapping implementation
// Physical address + PAGE_OFFSET = Virtual address
// Virtual address - PAGE_OFFSET = Physical address

// Example: Converting physical to virtual (direct mapping)
unsigned long __phys_to_virt_kernel(unsigned long phys) {
    if (phys >= PHYS_OFFSET && phys < PHYS_OFFSET + VMALLOC_START - KERNEL_VIRT_START) {
        return phys + PAGE_OFFSET;
    }
    return 0;  // Out of range
}

// Example: Converting virtual to physical (direct mapping)
unsigned long __virt_to_phys_kernel(unsigned long virt) {
    if (virt >= KERNEL_VIRT_START && virt < VMALLOC_START) {
        return virt - PAGE_OFFSET;
    }
    return 0;  // Not directly mapped
}

// Example: Direct mapping setup
void setup_direct_mapping(void) {
    unsigned long start_phys = PHYS_OFFSET;
    unsigned long end_phys = memblock_end_of_DRAM();
    unsigned long size = end_phys - start_phys;

    // Map all physical memory to kernel virtual space
    // Using 1:1 mapping (direct mapping)

    for (unsigned long phys = start_phys; phys < end_phys; phys += PAGE_SIZE) {
        unsigned long virt = __phys_to_virt_kernel(phys);

        // Create page table entry
        set_pte_kernel(virt, phys, PAGE_KERNEL);
    }

    // Flush TLB
    local_flush_tlb_all();
}

// Example: Using direct mapping
void *kmalloc_direct(size_t size, gfp_t flags) {
    // Allocate physical page
    struct page *page = alloc_pages(flags, get_order(size));
    if (!page) {
        return NULL;
    }

    // Convert to virtual address using direct mapping
    unsigned long phys = page_to_phys(page);
    unsigned long virt = __phys_to_virt_kernel(phys);

    return (void *)virt;
}

// Example: Direct mapping limitations
// Direct mapping region is limited by VMALLOC_START
// If physical memory exceeds this, use vmalloc or other mechanisms
unsigned long max_direct_mapped_phys(void) {
    return VMALLOC_START - KERNEL_VIRT_START;
}
```

**Explanation**:

- **1:1 mapping** direct correspondence between physical and virtual
- **PAGE_OFFSET** offset for kernel virtual addresses
- **Simple conversion** arithmetic conversion, no page table walk
- **Performance** very fast address conversion
- **Limitations** size limited by kernel virtual address range

## vmalloc Region

**What**: vmalloc region provides virtual memory for non-contiguous allocations.

**Why**: vmalloc is important because:

- **Large Allocations** - Allocate large non-contiguous virtual regions
- **Flexibility** - Allocate virtual memory when physical contiguous not needed
- **Kernel Modules** - Kernel modules use vmalloc
- **I/O Mappings** - Large I/O buffer mappings
- **Special Cases** - Cases where vmalloc is more appropriate

**How**: vmalloc works:

```c
// Example: vmalloc address range
#define VMALLOC_START             0xFFFFFFFFC0000000UL
#define VMALLOC_END               0xFFFFFFFFE0000000UL
#define VMALLOC_SIZE              (VMALLOC_END - VMALLOC_START)  // 512MB

// Example: vmalloc allocation
void *vmalloc(unsigned long size) {
    struct vm_struct *area;
    void *addr;
    unsigned long real_size;

    // Align size to page boundary
    real_size = ALIGN(size, PAGE_SIZE);

    // Check size
    if (real_size == 0 || real_size > VMALLOC_SIZE) {
        return NULL;
    }

    // Allocate vm_struct
    area = get_vm_area(real_size, VM_ALLOC);
    if (!area) {
        return NULL;
    }

    addr = area->addr;

    // Map physical pages to virtual addresses
    for (unsigned long offset = 0; offset < real_size; offset += PAGE_SIZE) {
        struct page *page;

        // Allocate physical page
        page = alloc_page(GFP_KERNEL);
        if (!page) {
            vfree(addr);  // Free on error
            return NULL;
        }

        // Map page to virtual address
        set_pte_at(&init_mm, (unsigned long)addr + offset,
                   pte_offset_kernel((unsigned long)addr + offset),
                   mk_pte(page, PAGE_KERNEL));

        // Flush TLB for this page
        flush_tlb_kernel_range((unsigned long)addr + offset,
                              (unsigned long)addr + offset + PAGE_SIZE);
    }

    return addr;
}

// Example: vfree
void vfree(const void *addr) {
    struct vm_struct *area;

    if (!addr) {
        return;
    }

    // Find vm_struct for address
    area = find_vm_area((unsigned long)addr);
    if (!area) {
        return;
    }

    // Unmap pages
    for (unsigned long offset = 0; offset < area->size; offset += PAGE_SIZE) {
        pte_t *pte = pte_offset_kernel((unsigned long)addr + offset);

        if (pte_present(*pte)) {
            struct page *page = pte_page(*pte);

            // Free physical page
            __free_page(page);

            // Clear page table entry
            pte_clear(&init_mm, (unsigned long)addr + offset, pte);
        }
    }

    // Flush TLB
    flush_tlb_kernel_range((unsigned long)area->addr,
                          (unsigned long)area->addr + area->size);

    // Free vm_struct
    kfree(area);
}

// Example: Checking if address is vmalloc
bool is_vmalloc_address(const void *addr) {
    unsigned long vaddr = (unsigned long)addr;

    return vaddr >= VMALLOC_START && vaddr < VMALLOC_END;
}
```

**Explanation**:

- **Virtual allocation** vmalloc allocates virtual memory
- **Non-contiguous** physical pages don't need to be contiguous
- **Page mapping** maps physical pages to virtual addresses
- **TLB flushing** flush TLB after vmalloc operations
- **VM struct** tracks vmalloc allocations

## Fixmap Region

**What**: Fixmap region provides fixed virtual addresses for special mappings that need predictable addresses.

**Why**: Fixmap is important because:

- **Early Boot** - Fixed addresses needed before vmalloc ready
- **Device Mappings** - Fixed addresses for device registers
- **Special Mappings** - Special kernel mappings need fixed addresses
- **Performance** - Avoids dynamic allocation overhead
- **Accessibility** - Some code expects fixed virtual addresses

**How**: Fixmap works:

```c
// Example: Fixmap address range
#define FIXMAP_START              0xFFFFFFFFFE000000UL
#define FIXMAP_END                0xFFFFFFFFFF000000UL
#define FIXMAP_SIZE               (FIXMAP_END - FIXMAP_START)  // 16MB

// Example: Fixmap indices
enum fixed_addresses {
    FIX_HOLE,
    FIX_EARLYCON_MEM_BASE,
    FIX_PTE,
    FIX_PMD,
    FIX_PUD,
    FIX_P4D,
    FIX_FDT_BEGIN,
    FIX_FDT_END = FIX_FDT_BEGIN + (FDT_MAX_SIZE >> PAGE_SHIFT) - 1,
    __end_of_fixed_addresses
};

// Example: Fixmap address calculation
#define __fix_to_virt(x)           (FIXMAP_START + ((x) << PAGE_SHIFT))
#define __virt_to_fix(x)           (((x) - FIXMAP_START) >> PAGE_SHIFT)

// Example: Setting fixmap
void set_fixmap(enum fixed_addresses idx, phys_addr_t phys, pgprot_t prot) {
    unsigned long vaddr = __fix_to_virt(idx);
    pte_t *pte = pte_offset_kernel(vaddr);

    // Set page table entry
    set_pte_at(&init_mm, vaddr, pte, pfn_pte(phys >> PAGE_SHIFT, prot));

    // Flush TLB
    local_flush_tlb_page(vaddr);
}

// Example: Clearing fixmap
void clear_fixmap(enum fixed_addresses idx) {
    unsigned long vaddr = __fix_to_virt(idx);
    pte_t *pte = pte_offset_kernel(vaddr);

    // Clear page table entry
    pte_clear(&init_mm, vaddr, pte);

    // Flush TLB
    local_flush_tlb_page(vaddr);
}

// Example: Using fixmap for device tree
void *early_fixmap_virt_to_phys(void *vaddr) {
    unsigned long addr = (unsigned long)vaddr;

    if (addr >= FIXMAP_START && addr < FIXMAP_END) {
        int idx = __virt_to_fix(addr);
        pte_t *pte = pte_offset_kernel(addr);

        if (pte_present(*pte)) {
            return (void *)(pte_pfn(*pte) << PAGE_SHIFT);
        }
    }

    return NULL;
}

// Example: Mapping device tree using fixmap
void map_device_tree_fixmap(unsigned long dtb_phys_addr) {
    // Map device tree to fixmap
    set_fixmap(FIX_FDT_BEGIN, dtb_phys_addr, PAGE_KERNEL_RO);

    // Now device tree accessible at fixed virtual address
    void *dtb_virt = __fix_to_virt(FIX_FDT_BEGIN);

    // Update initial_boot_params to use virtual address
    initial_boot_params = dtb_virt;
}
```

**Explanation**:

- **Fixed addresses** fixmap provides predictable virtual addresses
- **Early boot** used before vmalloc is available
- **Index-based** uses indices to track fixmap entries
- **Special mappings** device tree, early console use fixmap
- **TLB flushing** flush TLB when modifying fixmap

## User Space Layout

**What**: User space virtual memory layout for RISC-V processes.

**How**: User space layout works:

```c
// Example: User space memory layout
// User space: 0x0000000000 - 0x00007FFFFFFFFFFF (256 GB)

// Typical user process layout:
/*
  0x0000000000 - 0x0000000000FFFFFF: Reserved
  0x0000000100 - 0x00007FFFFFFFFFFF: User accessible

  Low addresses:
    - Code (text segment)
    - Data (initialized data)
    - BSS (uninitialized data)
    - Heap (grows upward)

  High addresses (near 0x00007FFFFFFFFFFF):
    - Stack (grows downward)
    - Libraries (shared objects)
    - Memory mappings (mmap)
*/

// Example: User space layout for process
struct mm_struct {
    unsigned long start_code, end_code;      // Code segment
    unsigned long start_data, end_data;      // Data segment
    unsigned long start_brk, brk;           // Heap boundaries
    unsigned long start_stack;               // Stack start
    unsigned long arg_start, arg_end;        // Arguments
    unsigned long env_start, env_end;        // Environment
};

// Example: Setting up user space layout
void setup_user_memory_layout(struct mm_struct *mm) {
    // Code segment (from executable)
    mm->start_code = 0x10000;  // Typical start
    mm->end_code = mm->start_code + code_size;

    // Data segment
    mm->start_data = mm->end_code;
    mm->end_data = mm->start_data + data_size;

    // Heap (starts after data)
    mm->start_brk = ALIGN(mm->end_data, PAGE_SIZE);
    mm->brk = mm->start_brk;

    // Stack (at high address)
    mm->start_stack = STACK_TOP;  // Near 0x00007FFFFFFFFFFF
}

// Example: User space address limits
#define TASK_SIZE               0x0000007FFFFFFFFFFFUL  // User space limit
#define STACK_TOP               0x0000007FFFFF0000UL    // Stack top
#define STACK_TOP_MAX           TASK_SIZE               // Maximum stack top
```

**Explanation**:

- **Large address space** 256 GB for user processes
- **Standard layout** typical Unix process layout
- **Heap growth** heap grows upward from low addresses
- **Stack growth** stack grows downward from high addresses
- **Memory mappings** mmap can create mappings anywhere

## Next Steps

**What** you're ready for next:

After understanding virtual memory layout, you should be ready to:

1. **Learn Page Table Structure** - How page tables implement the layout
2. **Study Memory Allocation** - How memory is allocated in different regions
3. **Understand Memory Zones** - Physical memory zone organization
4. **Explore Page Tables** - Detailed page table implementation
5. **Begin Memory Debugging** - Debug memory layout issues

**Where** to go next:

Continue with the next lesson on **"Page Table Structure"** to learn:

- RISC-V page table format (Sv39)
- Page table entry structure
- Page table levels
- Page table walk
- Kernel page table management

**Why** the next lesson is important:

Page tables are the mechanism that implements virtual memory layout. Understanding page table structure is essential for understanding how virtual memory works.

**How** to continue learning:

1. **Study Kernel Code** - Examine page table code
2. **Use Debugger** - Inspect page table entries
3. **Trace Mappings** - Trace virtual to physical mapping
4. **Read Documentation** - Study RISC-V page table specification
5. **Experiment** - Modify page table and observe

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Virtual Memory](https://github.com/riscv/riscv-isa-manual) - Virtual memory specification
- [Linux Kernel Memory Management](https://www.kernel.org/doc/html/latest/mm/) - Memory management docs

**Kernel Sources**:

- [Linux RISC-V Memory Layout](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Kernel memory code
