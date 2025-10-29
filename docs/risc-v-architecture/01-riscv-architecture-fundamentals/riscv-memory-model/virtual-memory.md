---
sidebar_position: 4
---

# Virtual Memory

Master RISC-V virtual memory system that provides address translation, memory protection, and efficient memory management, essential for understanding how the Linux kernel manages process address spaces.

## What Is Virtual Memory?

**What**: Virtual memory is a memory management technique where processes use virtual addresses that are translated to physical addresses by the Memory Management Unit (MMU). Each process has its own virtual address space, isolated from other processes.

**Why**: Virtual memory is crucial because:

- **Process Isolation** - Each process has separate address space
- **Security** - Prevents processes from accessing each other's memory
- **Address Space** - Processes can use full virtual address range
- **Memory Protection** - Different regions can have different permissions
- **Swapping** - Enables swapping pages to disk
- **Page Sharing** - Allows sharing pages between processes

**When**: Virtual memory is used when:

- **Process Execution** - All user processes use virtual addresses
- **Memory Allocation** - Kernel allocates virtual memory for processes
- **Page Faults** - Hardware generates page faults for unmapped pages
- **Context Switching** - Page tables switched on context switch
- **Memory Protection** - Access violations detected via page faults
- **Shared Libraries** - Multiple processes share library code pages

**How**: Virtual memory works through:

- **Address Translation** - MMU translates virtual to physical addresses
- **Page Tables** - Hierarchical tables store translation mappings
- **TLB** - Translation Lookaside Buffer caches recent translations
- **Page Faults** - Hardware exceptions for unmapped or protected pages
- **Page Table Walk** - Hardware or software walks page tables

**Where**: Virtual memory is found in:

- **All Modern Processors** - Required feature in RISC-V
- **Linux Kernel** - Kernel extensively uses virtual memory
- **User Processes** - All user programs use virtual addresses
- **Kernel Space** - Kernel also uses virtual addresses
- **Device Drivers** - Drivers may map device memory into virtual space

## RISC-V Virtual Memory Architecture

**What**: RISC-V virtual memory uses page-based translation with hierarchical page tables. RISC-V supports multiple address translation modes: Sv32, Sv39, Sv48.

**Why**: Page-based virtual memory is important because:

- **Flexibility** - Pages can be mapped independently
- **Efficiency** - Page table structure is efficient
- **Protection** - Page-level protection granularity
- **Performance** - TLB caches page translations
- **Hardware Support** - MMU hardware handles translation

**How**: Virtual memory architecture works:

```c
// Example: RISC-V virtual address translation modes
// Sv32: 32-bit virtual addresses, 4KB pages (RV32)
// Sv39: 39-bit virtual addresses, 4KB pages (RV64, most common)
// Sv48: 48-bit virtual addresses, 4KB pages (RV64, larger systems)

// Sv39 address translation:
// 39-bit virtual address:
// [38:30] - Level 2 index (9 bits)
// [29:21] - Level 1 index (9 bits)
// [20:12] - Level 0 index (9 bits)
// [11:0]  - Page offset (12 bits, 4KB page)

// Example: Virtual address format (Sv39)
struct sv39_vaddr {
    unsigned long vpn2: 9;  // Virtual page number level 2
    unsigned long vpn1: 9;  // Virtual page number level 1
    unsigned long vpn0: 9;  // Virtual page number level 0
    unsigned long offset: 12; // Page offset
};

// Example: Page table entry format
typedef struct {
    unsigned long val;
} pte_t;

// PTE fields (for Sv39, 64-bit entries):
// [63:54] - Reserved
// [53:10] - Physical page number (PPN)
// [9:8]   - Reserved for software
// [7]     - Dirty (D)
// [6]     - Accessed (A)
// [5]     - Global (G)
// [4]     - User (U)
// [3]     - Execute (X)
// [2]     - Write (W)
// [1]     - Read (R)
// [0]     - Valid (V)

#define _PAGE_VALID   (1UL << 0)
#define _PAGE_READ    (1UL << 1)
#define _PAGE_WRITE   (1UL << 2)
#define _PAGE_EXEC    (1UL << 3)
#define _PAGE_USER    (1UL << 4)
#define _PAGE_GLOBAL  (1UL << 5)
#define _PAGE_ACCESSED (1UL << 6)
#define _PAGE_DIRTY   (1UL << 7)

// Example: satp register (Supervisor Address Translation and Protection)
// Controls virtual memory:
// [63:60] - Mode (0=bare, 8=Sv39, 9=Sv48)
// [59:44] - ASID (Address Space ID)
// [43:0]  - PPN (Physical page number of page table root)

#define SATP_MODE_SHIFT     60
#define SATP_ASID_SHIFT     44
#define SATP_PPN_MASK       0x00000FFFFFFFFFFFUL

#define SATP_MODE_BARE      0
#define SATP_MODE_SV39      8
#define SATP_MODE_SV48      9

// Example: Setting up virtual memory
void setup_virtual_memory(unsigned long pgtable_root, unsigned long asid) {
    unsigned long satp_value;

    // Build satp register value
    satp_value = ((unsigned long)SATP_MODE_SV39 << SATP_MODE_SHIFT) |
                 (asid << SATP_ASID_SHIFT) |
                 (pgtable_root >> PAGE_SHIFT);

    // Write satp register (supervisor mode only)
    __asm__ volatile("csrw satp, %0" : : "r"(satp_value));

    // Flush TLB after changing page table
    __asm__ volatile("sfence.vma");
}
```

**Explanation**:

- **Page-based translation** virtual addresses divided into page numbers and offset
- **Hierarchical tables** multi-level page tables for efficient storage
- **PTE format** page table entries contain physical address and permissions
- **satp register** controls virtual memory mode and page table root
- **TLB flushing** required after page table changes

## Page Table Structure

**What**: Page tables are hierarchical data structures that store virtual-to-physical address mappings.

**Why**: Page tables are essential because:

- **Translation** - Store virtual-to-physical mappings
- **Protection** - Encode page permissions
- **Efficiency** - Hierarchical structure reduces memory usage
- **Flexibility** - Pages can be mapped independently
- **Sharing** - Pages can be shared between processes

**How**: Page tables are structured:

```c
// Example: Page table structure (Sv39, 3 levels)
// Level 2: Page directory pointer table (PDPT)
// Level 1: Page directory (PD)
// Level 0: Page table (PT)

#define PTRS_PER_PTE     512  // 2^9 entries per table
#define PTRS_PER_PMD     512
#define PTRS_PER_PUD     512
#define PTRS_PER_P4D     1    // Not used in Sv39

// Example: Page table entry access
static inline pte_t *pte_offset(pmd_t *pmd, unsigned long address) {
    // Extract level 0 index from address
    unsigned long index = (address >> PAGE_SHIFT) & (PTRS_PER_PTE - 1);

    // Calculate PTE address
    unsigned long pte_pa = pmd_val(*pmd) >> PAGE_SHIFT;
    pte_pa = pte_pa << PAGE_SHIFT;
    pte_pa += index * sizeof(pte_t);

    return (pte_t *)__va(pte_pa);
}

// Example: Page table walk (simplified)
unsigned long page_table_walk(unsigned long vaddr, struct mm_struct *mm) {
    pgd_t *pgd;
    p4d_t *p4d;
    pud_t *pud;
    pmd_t *pmd;
    pte_t *pte;
    unsigned long paddr = 0;

    // Extract virtual page numbers
    unsigned long vpn0 = (vaddr >> 12) & 0x1FF;  // Level 0 index
    unsigned long vpn1 = (vaddr >> 21) & 0x1FF;  // Level 1 index
    unsigned long vpn2 = (vaddr >> 30) & 0x1FF;  // Level 2 index

    // Get page global directory
    pgd = pgd_offset(mm, vaddr);
    if (pgd_none(*pgd) || pgd_bad(*pgd)) {
        return 0;  // Not mapped
    }

    p4d = p4d_offset(pgd, vaddr);
    if (p4d_none(*p4d)) {
        return 0;
    }

    // Get page upper directory (Level 2)
    pud = pud_offset(p4d, vaddr);
    if (pud_none(*pud) || pud_bad(*pud)) {
        return 0;
    }

    // Get page middle directory (Level 1)
    pmd = pmd_offset(pud, vaddr);
    if (pmd_none(*pmd) || pmd_bad(*pmd)) {
        return 0;
    }

    // Get page table entry (Level 0)
    pte = pte_offset(pmd, vaddr);
    if (!pte_present(*pte)) {
        return 0;  // Page not present
    }

    // Extract physical address
    paddr = pte_pfn(*pte) << PAGE_SHIFT;
    paddr |= vaddr & ~PAGE_MASK;  // Add page offset

    return paddr;
}

// Example: Creating page table entry
pte_t create_pte(unsigned long paddr, unsigned long flags) {
    pte_t pte;

    // Build PTE value
    pte.val = (paddr >> PAGE_SHIFT) << 10;  // Physical page number
    pte.val |= _PAGE_VALID;

    if (flags & VM_READ) {
        pte.val |= _PAGE_READ;
    }
    if (flags & VM_WRITE) {
        pte.val |= _PAGE_WRITE;
    }
    if (flags & VM_EXEC) {
        pte.val |= _PAGE_EXEC;
    }
    if (flags & VM_USER) {
        pte.val |= _PAGE_USER;
    }

    return pte;
}

// Example: Installing page table entry
void install_pte(struct mm_struct *mm, unsigned long vaddr,
                 unsigned long paddr, unsigned long flags) {
    pgd_t *pgd;
    p4d_t *p4d;
    pud_t *pud;
    pmd_t *pmd;
    pte_t *pte;
    pte_t new_pte;

    // Get page table pointers
    pgd = pgd_offset(mm, vaddr);
    p4d = p4d_offset(pgd, vaddr);
    pud = pud_offset(p4d, vaddr);
    pmd = pmd_offset(pud, vaddr);

    // Allocate page table if needed
    if (pmd_none(*pmd)) {
        pud_t *new_pmd = alloc_page_table();
        pud_populate(mm, pud, new_pmd);
        pmd = pmd_offset(pud, vaddr);
    }

    // Allocate PTE table if needed
    pte = pte_alloc(mm, pmd, vaddr);
    if (!pte) {
        return;  // Allocation failed
    }

    // Create and install PTE
    new_pte = create_pte(paddr, flags);
    set_pte(pte, new_pte);

    // Flush TLB for this page
    flush_tlb_page(vaddr);
}
```

**Explanation**:

- **Three levels** Sv39 uses 3-level page tables (PUD, PMD, PTE)
- **Page table walk** software or hardware walks page tables to translate
- **PTE creation** PTE contains physical address and permission flags
- **Installation** installing PTE maps virtual page to physical page
- **TLB flushing** must flush TLB after modifying page tables

## Page Fault Handling

**What**: Page faults are exceptions that occur when a process accesses virtual memory that is not mapped, protected, or requires special handling.

**Why**: Page fault handling is essential because:

- **Lazy Allocation** - Allows on-demand page allocation
- **Swapping** - Handles pages swapped to disk
- **Copy-on-Write** - Implements copy-on-write for fork
- **Access Control** - Enforces memory protection
- **Shared Memory** - Handles shared memory mapping

**How**: Page fault handling works:

```c
// Example: Page fault handler entry point
void do_page_fault(struct pt_regs *regs, unsigned long scause,
                  unsigned long stval) {
    unsigned long address = stval;  // Fault address from stval CSR
    unsigned long epc = regs->epc;  // Faulting instruction address
    int fault;
    unsigned long flags = FAULT_FLAG_DEFAULT;

    // Determine fault type from cause
    bool is_write = (scause == CAUSE_STORE_PAGE_FAULT);
    bool is_exec = (scause == CAUSE_INSTRUCTION_PAGE_FAULT);
    bool from_user = user_mode(regs);

    if (from_user) {
        flags |= FAULT_FLAG_USER;
    }
    if (is_write) {
        flags |= FAULT_FLAG_WRITE;
    }
    if (is_exec) {
        flags |= FAULT_FLAG_INSTRUCTION;
    }

    // Get memory management structure
    struct mm_struct *mm = from_user ? current->mm : &init_mm;

    // Check if fault is in kernel space
    if (address >= TASK_SIZE) {
        // Kernel page fault
        handle_kernel_page_fault(address, regs, flags);
        return;
    }

    // Handle user page fault
    fault = handle_mm_fault(mm, vma, address, flags, regs);

    // Check fault result
    if (fault & VM_FAULT_OOM) {
        // Out of memory
        pagefault_out_of_memory();
        return;
    }

    if (fault & VM_FAULT_SIGBUS) {
        // Bus error
        force_sig_fault(SIGBUS, BUS_ADRERR, (void __user *)address, current);
        return;
    }

    if (fault & VM_FAULT_SIGSEGV) {
        // Segmentation violation
        force_sig_fault(SIGSEGV, SEGV_MAPERR, (void __user *)address, current);
        return;
    }

    // Fault resolved, return to faulting instruction
    // Instruction will retry and succeed
}

// Example: Handling different page fault types
int handle_mm_fault(struct vm_area_struct *vma, unsigned long address,
                    unsigned long flags, struct pt_regs *regs) {
    int ret;

    // Check if address is in valid VMA
    if (!vma) {
        return VM_FAULT_SIGSEGV;  // Invalid address
    }

    // Check permissions
    if ((flags & FAULT_FLAG_WRITE) && !(vma->vm_flags & VM_WRITE)) {
        // Write to read-only page
        if (vma->vm_flags & VM_SHARED) {
            // Shared mapping: try to make writable
            return do_wp_page(vma, address, flags);
        } else {
            // Private mapping: segmentation fault
            return VM_FAULT_SIGSEGV;
        }
    }

    if ((flags & FAULT_FLAG_INSTRUCTION) && !(vma->vm_flags & VM_EXEC)) {
        // Execute from non-executable page
        return VM_FAULT_SIGSEGV;
    }

    // Handle page fault based on VMA type
    if (vma->vm_ops && vma->vm_ops->fault) {
        // VMA-specific fault handler
        ret = vma->vm_ops->fault(vma, address, flags);
    } else {
        // Default fault handler: allocate page
        ret = do_anonymous_page(vma, address, flags);
    }

    return ret;
}

// Example: Anonymous page allocation (heap, stack)
int do_anonymous_page(struct vm_area_struct *vma, unsigned long address,
                     unsigned long flags) {
    struct page *page;
    pte_t entry;

    // Check if write fault (read fault on zero page is OK)
    if (!(flags & FAULT_FLAG_WRITE)) {
        // Read fault: map zero page
        entry = pte_mkspecial(pfn_pte(ZERO_PAGE_PFN, vma->vm_page_prot));
        install_pte(vma->vm_mm, address, entry);
        return VM_FAULT_LOCKED;
    }

    // Write fault: allocate new page
    page = alloc_page(GFP_HIGHUSER_MOVABLE | __GFP_ZERO);
    if (!page) {
        return VM_FAULT_OOM;
    }

    // Create PTE and install
    entry = mk_pte(page, vma->vm_page_prot);
    if (vma->vm_flags & VM_WRITE) {
        entry = pte_mkwrite(entry);
    }

    install_pte(vma->vm_mm, address, entry);

    // Update statistics
    inc_mm_counter(vma->vm_mm, MM_ANONPAGES);

    return VM_FAULT_LOCKED;
}

// Example: Copy-on-Write (COW) page fault
int do_wp_page(struct vm_area_struct *vma, unsigned long address,
              unsigned long flags) {
    struct page *old_page, *new_page;
    pte_t entry, old_entry;

    // Get existing page
    old_entry = *pte_offset(vma->vm_mm, address);
    old_page = pte_page(old_entry);

    // Check if page is shared
    if (page_mapcount(old_page) > 1) {
        // Page is shared: copy it
        new_page = alloc_page(GFP_HIGHUSER_MOVABLE);
        if (!new_page) {
            return VM_FAULT_OOM;
        }

        // Copy page content
        copy_user_highpage(new_page, old_page, address, vma);

        // Create new PTE with copied page
        entry = mk_pte(new_page, vma->vm_page_prot);
        entry = pte_mkwrite(entry);

        install_pte(vma->vm_mm, address, entry);

        // Decrement old page reference
        put_page(old_page);
    } else {
        // Page not shared: just make writable
        entry = pte_mkwrite(old_entry);
        entry = pte_mkdirty(entry);
        set_pte_at(vma->vm_mm, address, pte_offset(vma->vm_mm, address), entry);

        flush_tlb_page(address);
    }

    return VM_FAULT_LOCKED;
}
```

**Explanation**:

- **Fault types** different faults for load, store, and instruction fetch
- **Fault address** stval CSR contains faulting virtual address
- **Fault handling** kernel handles fault based on VMA and fault type
- **Page allocation** anonymous pages allocated on-demand
- **Copy-on-write** COW implemented via page fault handling

## TLB Management

**What**: Translation Lookaside Buffer (TLB) is a hardware cache that stores recent virtual-to-physical address translations.

**Why**: TLB management is important because:

- **Performance** - TLB hits avoid expensive page table walks
- **Invalidation** - Must invalidate TLB entries after page table changes
- **ASID Support** - ASIDs enable per-process TLB entries
- **Multi-Core** - TLB shootdown required for multi-core systems
- **Kernel Operation** - Kernel must manage TLB correctly

**How**: TLB management works:

```c
// Example: TLB invalidation
// sfence.vma instruction invalidates TLB entries
// sfence.vma rs1, rs2
// rs1 = address (0=all addresses)
// rs2 = ASID (0=all ASIDs)

// Invalidate all TLB entries
void flush_tlb_all(void) {
    // sfence.vma zero, zero
    // Invalidate all entries for all ASIDs
    __asm__ volatile("sfence.vma zero, zero");
}

// Invalidate TLB entry for specific address
void flush_tlb_page(unsigned long vaddr) {
    // sfence.vma with address and ASID
    unsigned long asid = get_current_asid();

    __asm__ volatile("sfence.vma %0, %1"
                     :: "r"(vaddr), "r"(asid));
}

// Invalidate TLB entries for specific ASID
void flush_tlb_asid(unsigned long asid) {
    // sfence.vma zero, asid
    __asm__ volatile("sfence.vma zero, %0" :: "r"(asid));
}

// Example: TLB shootdown (multi-core)
void flush_tlb_mm(struct mm_struct *mm) {
    cpumask_t *mask = mm_cpumask(mm);

    if (cpumask_weight(mask) == 1 && cpumask_test_cpu(smp_processor_id(), mask)) {
        // Only this CPU has references, flush locally
        flush_tlb_asid(mm->context.asid);
        return;
    }

    // Multiple CPUs have references, shootdown required
    smp_call_function_many(mask, do_flush_tlb_mm, mm, 1);
}

// Example: Context switch TLB flush
void switch_mm(struct mm_struct *prev, struct mm_struct *next,
              struct task_struct *task) {
    unsigned long new_asid;

    // Get new ASID for process
    new_asid = alloc_asid(next);

    // Set new page table and ASID
    set_process_asid(next, next->pgd, new_asid);

    // Flush TLB entries from previous process
    // (if ASID reuse or local flush needed)
    if (new_asid == prev->context.asid) {
        // ASID reused, flush TLB
        flush_tlb_asid(new_asid);
    }

    // TLB will be populated by page table walks on demand
}

// Example: TLB flush for page table changes
void flush_tlb_range(struct vm_area_struct *vma, unsigned long start,
                    unsigned long end) {
    // Flush TLB for range of addresses
    unsigned long addr;
    unsigned long asid = vma->vm_mm->context.asid;

    for (addr = start; addr < end; addr += PAGE_SIZE) {
        __asm__ volatile("sfence.vma %0, %1"
                         :: "r"(addr), "r"(asid));
    }
}
```

**Explanation**:

- **sfence.vma instruction** RISC-V TLB invalidation instruction
- **Selective invalidation** can invalidate by address or ASID
- **TLB shootdown** required when multiple cores share TLB
- **ASID reuse** when ASID space exhausted, must flush TLB
- **Context switch** TLB managed during process context switches

## Kernel Virtual Memory

**What**: Kernel uses virtual memory for its own code and data, typically with direct mapping to physical memory.

**Why**: Kernel virtual memory is important because:

- **Consistency** - Kernel code uses virtual addresses like user space
- **Isolation** - Kernel space separated from user space
- **Protection** - Kernel memory protected from user access
- **Performance** - Direct mapping provides good performance
- **Flexibility** - vmalloc allows non-contiguous allocations

**How**: Kernel virtual memory works:

```c
// Example: Kernel virtual address layout
// Kernel space: 0xFFFFFFFF80000000 - 0xFFFFFFFFFFFFFFFF (upper half)

#define KERNEL_VIRT_START    0xFFFFFFFF80000000UL
#define VMALLOC_START        0xFFFFFFFFC0000000UL
#define VMALLOC_END          0xFFFFFFFFE0000000UL
#define FIXMAP_START         0xFFFFFFFFFE000000UL
#define FIXMAP_END           0xFFFFFFFFFF000000UL

// Example: Direct mapping (kernel linear mapping)
// Virtual address = Physical address + offset
unsigned long __phys_to_virt(unsigned long phys) {
    return phys + KERNEL_VIRT_START;
}

unsigned long __virt_to_phys(unsigned long virt) {
    if (virt >= KERNEL_VIRT_START && virt < VMALLOC_START) {
        return virt - KERNEL_VIRT_START;
    }
    return 0;  // Not direct mapped
}

// Example: vmalloc (non-contiguous virtual memory)
void *vmalloc(unsigned long size) {
    struct vm_struct *area;
    void *addr;
    unsigned long vaddr;

    // Allocate vm_struct
    area = get_vm_area(size, VM_ALLOC);
    if (!area) {
        return NULL;
    }

    vaddr = (unsigned long)area->addr;

    // Map physical pages to virtual addresses
    for (unsigned long offset = 0; offset < size; offset += PAGE_SIZE) {
        struct page *page = alloc_page(GFP_KERNEL);
        if (!page) {
            vfree(area->addr);  // Free on error
            return NULL;
        }

        // Map page to virtual address
        set_pte_at(&init_mm, vaddr + offset,
                   pte_offset_kernel(vaddr + offset),
                   mk_pte(page, PAGE_KERNEL));
        flush_tlb_kernel_range(vaddr + offset, vaddr + offset + PAGE_SIZE);
    }

    return area->addr;
}

// Example: ioremap (memory-mapped I/O)
void __iomem *ioremap(phys_addr_t phys_addr, size_t size) {
    unsigned long vaddr;
    struct vm_struct *area;

    // Allocate virtual address range
    area = get_vm_area(size, VM_IOREMAP);
    if (!area) {
        return NULL;
    }

    vaddr = (unsigned long)area->addr;

    // Map physical addresses to virtual (uncached for I/O)
    for (unsigned long offset = 0; offset < size; offset += PAGE_SIZE) {
        set_pte_at(&init_mm, vaddr + offset,
                   pte_offset_kernel(vaddr + offset),
                   mk_pte_uncached(phys_addr + offset));
        flush_tlb_kernel_range(vaddr + offset, vaddr + offset + PAGE_SIZE);
    }

    return (void __iomem *)vaddr;
}
```

**Explanation**:

- **Direct mapping** kernel uses direct mapping for most memory
- **vmalloc** non-contiguous virtual memory for large allocations
- **ioremap** maps physical I/O addresses to virtual addresses
- **Kernel space** upper half of address space reserved for kernel
- **TLB flushing** required after kernel page table changes

## Next Steps

**What** you're ready for next:

After mastering virtual memory, you should be ready to:

1. **Learn RISC-V Extensions** - Advanced RISC-V ISA extensions
2. **Study Kernel Architecture** - RISC-V Linux kernel architecture
3. **Understand Interrupts** - RISC-V interrupt handling
4. **Explore Memory Management** - Advanced memory management topics
5. **Begin Kernel Development** - Apply virtual memory knowledge

**Where** to go next:

Continue with the next section on **"RISC-V Extensions"** to learn:

- Vector Extension (RVV)
- Hypervisor Extension
- Cryptographic Extensions
- Custom Extensions
- Extension usage in kernel

**Why** the next section is important:

RISC-V extensions add powerful features for performance, virtualization, and security. Understanding extensions is essential for advanced kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine extension usage in kernel
2. **Read Specs** - Study RISC-V extension specifications
3. **Use Hardware** - Experiment with extensions on hardware
4. **Write Code** - Implement code using extensions
5. **Benchmark** - Measure extension performance benefits

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Virtual Memory](https://github.com/riscv/riscv-isa-manual) - Virtual memory specification
- [RISC-V Sv39 Specification](https://github.com/riscv/riscv-isa-manual/blob/master/src/supervisor.tex) - Sv39 details

**Kernel Sources**:

- [Linux RISC-V Memory Code](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Kernel virtual memory implementation
