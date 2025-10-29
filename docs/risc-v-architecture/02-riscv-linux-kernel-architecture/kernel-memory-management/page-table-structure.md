---
sidebar_position: 2
---

# Page Table Structure

Master RISC-V page table structure that implements virtual memory translation using Sv39 or Sv48 format, understanding how page tables are organized, page table entries are formatted, and page table walks are performed.

## What Is the Page Table Structure?

**What**: Page tables are hierarchical data structures that store mappings between virtual addresses and physical addresses. On RISC-V, page tables use a multi-level tree structure (typically 3-level for Sv39) with specific entry formats defined by the RISC-V privilege specification.

**Why**: Understanding page table structure is crucial because:

- **Memory Translation** - Page tables implement virtual to physical translation
- **Memory Management** - Kernel manages memory through page tables
- **Performance** - Page table structure affects translation performance
- **Debugging** - Understanding structure helps debug memory issues
- **Kernel Development** - Kernel code frequently manipulates page tables
- **TLB Management** - TLB entries mirror page table entries

**When**: Page table structure is relevant when:

- **Virtual Memory Setup** - Setting up virtual memory for kernel/processes
- **Memory Allocation** - Allocating and mapping memory
- **Page Fault Handling** - Handling page faults requires page table access
- **Context Switching** - Switching page tables when switching processes
- **Memory Protection** - Setting memory permissions via page tables
- **TLB Operations** - TLB operations reference page table structure

**How**: Page table structure works through:

- **Hierarchical Tables** - Multi-level page table tree
- **Page Table Entries** - Each entry contains mapping information
- **Address Splitting** - Virtual address split into page table indices
- **Hardware Walk** - MMU walks page tables automatically
- **Software Walk** - Kernel can walk page tables in software
- **Entry Management** - Kernel creates, modifies, and removes entries

**Where**: Page table structure is found in:

- **Kernel Source** - arch/riscv/include/asm/pgtable.h
- **Memory Management** - arch/riscv/mm/ directory
- **Page Fault Handlers** - mm/memory.c
- **Context Switch** - arch/riscv/kernel/process.c
- **MMU Code** - Architecture-specific MMU implementation

## RISC-V Page Table Format

**What**: RISC-V supports multiple page table formats: Sv32 (32-bit), Sv39 (39-bit), and Sv48 (48-bit). Linux on 64-bit RISC-V typically uses Sv39.

**How**: Page table format works:

```c
// Example: RISC-V Sv39 page table format
// Sv39: 39-bit virtual addresses, 4KB pages, 3-level page tables

// Virtual address format (Sv39):
// [38:30] - Level 2 index (PUD - Page Upper Directory) - 9 bits
// [29:21] - Level 1 index (PMD - Page Middle Directory) - 9 bits
// [20:12] - Level 0 index (PTE - Page Table Entry) - 9 bits
// [11:0]  - Page offset - 12 bits (4KB page)

// Example: Virtual address structure
struct sv39_vaddr {
    unsigned long vpn2: 9;   // Level 2 (PUD) index
    unsigned long vpn1: 9;   // Level 1 (PMD) index
    unsigned long vpn0: 9;   // Level 0 (PTE) index
    unsigned long offset: 12; // Page offset
};

// Example: Extracting page table indices
void extract_page_indices(unsigned long vaddr, unsigned int *pud_idx,
                          unsigned int *pmd_idx, unsigned int *pte_idx) {
    // Level 2 index (bits 38:30)
    *pud_idx = (vaddr >> 30) & 0x1FF;

    // Level 1 index (bits 29:21)
    *pmd_idx = (vaddr >> 21) & 0x1FF;

    // Level 0 index (bits 20:12)
    *pte_idx = (vaddr >> 12) & 0x1FF;
}

// Example: Page table entry format (64-bit for RV64)
typedef struct {
    unsigned long val;
} pte_t;

// PTE bit fields (Sv39):
// [63:54] - Reserved (must be 0)
// [53:10] - PPN (Physical Page Number) - 44 bits
// [9:8]   - Reserved for software use
// [7]     - D (Dirty) - Page has been written
// [6]     - A (Accessed) - Page has been accessed
// [5]     - G (Global) - Global page (not flushed on ASID change)
// [4]     - U (User) - User accessible
// [3]     - X (eXecute) - Executable
// [2]     - W (Write) - Writable
// [1]     - R (Read) - Readable
// [0]     - V (Valid) - Page table entry is valid

// Example: PTE field definitions
#define _PAGE_VALID    (1UL << 0)
#define _PAGE_READ     (1UL << 1)
#define _PAGE_WRITE    (1UL << 2)
#define _PAGE_EXEC     (1UL << 3)
#define _PAGE_USER     (1UL << 4)
#define _PAGE_GLOBAL   (1UL << 5)
#define _PAGE_ACCESSED (1UL << 6)
#define _PAGE_DIRTY    (1UL << 7)

// Physical page number extraction
#define _PTE_PPN_SHIFT 10
#define _PTE_PPN_MASK  (0x3FFFFFFFFFFUL << _PTE_PPN_SHIFT)

// Example: Creating PTE
pte_t mk_pte(struct page *page, pgprot_t prot) {
    pte_t pte;

    // Physical page number
    unsigned long pfn = page_to_pfn(page);

    // Build PTE value
    pte.val = (pfn << _PTE_PPN_SHIFT) & _PTE_PPN_MASK;

    // Add protection flags
    if (pgprot_val(prot) & _PAGE_VALID) {
        pte.val |= _PAGE_VALID;
    }
    if (pgprot_val(prot) & _PAGE_READ) {
        pte.val |= _PAGE_READ;
    }
    if (pgprot_val(prot) & _PAGE_WRITE) {
        pte.val |= _PAGE_WRITE;
    }
    if (pgprot_val(prot) & _PAGE_EXEC) {
        pte.val |= _PAGE_EXEC;
    }
    if (pgprot_val(prot) & _PAGE_USER) {
        pte.val |= _PAGE_USER;
    }

    return pte;
}

// Example: Reading PTE fields
unsigned long pte_pfn(pte_t pte) {
    // Extract physical page number
    return (pte.val & _PTE_PPN_MASK) >> _PTE_PPN_SHIFT;
}

bool pte_present(pte_t pte) {
    // Check if PTE is valid
    return pte.val & _PAGE_VALID;
}

bool pte_readable(pte_t pte) {
    return pte.val & _PAGE_READ;
}

bool pte_writable(pte_t pte) {
    return pte.val & _PAGE_WRITE;
}

bool pte_executable(pte_t pte) {
    return pte.val & _PAGE_EXEC;
}

bool pte_user(pte_t pte) {
    return pte.val & _PAGE_USER;
}
```

**Explanation**:

- **Sv39 format** 39-bit virtual addresses with 3-level page tables
- **Address splitting** virtual address split into indices for each level
- **PTE format** 64-bit entries with physical address and permission bits
- **Permission bits** R, W, X, U control access permissions
- **Status bits** A and D bits track page access and modification

## Page Table Levels

**What**: RISC-V uses hierarchical page tables with multiple levels (3 for Sv39).

**How**: Page table levels work:

```c
// Example: Page table hierarchy (Sv39, 3 levels)
// Level 2 (PUD - Page Upper Directory)
//   ├── Points to Level 1 tables (512 entries each)
//   └── 512 PUD entries, each points to PMD
//
// Level 1 (PMD - Page Middle Directory)
//   ├── Points to Level 0 tables (512 entries each)
//   └── 512 PMD entries, each points to PTE
//
// Level 0 (PTE - Page Table Entry)
//   ├── Points to physical pages
//   └── 512 PTE entries, each maps 4KB page

// Example: Page table size constants
#define PTRS_PER_PTE    512  // Entries per page table (2^9)
#define PTRS_PER_PMD    512  // Entries per PMD
#define PTRS_PER_PUD    512  // Entries per PUD
#define PTRS_PER_P4D    1    // Not used in Sv39

// Size of each level table
#define PTE_SHIFT       12   // Page size = 4KB = 2^12
#define PMD_SHIFT       21   // 2MB = 2^21
#define PUD_SHIFT       30   // 1GB = 2^30
#define P4D_SHIFT       39   // Not used in Sv39

// Example: Page table entry types
// Page table entries can be:
// 1. Page table entries pointing to next level
// 2. Leaf entries pointing to physical pages

// Level 2 (PUD) entry
typedef struct {
    unsigned long val;
} pud_t;

// Level 1 (PMD) entry
typedef struct {
    unsigned long val;
} pmd_t;

// Level 0 (PTE) entry
typedef struct {
    unsigned long val;
} pte_t;

// Example: Checking entry types
bool pud_present(pud_t pud) {
    // Check if PUD entry is valid
    return pud.val & _PAGE_VALID;
}

bool pud_huge(pud_t pud) {
    // Check if PUD entry is huge page (1GB page)
    return pud_present(pud) && !(pud.val & _PAGE_READ);  // Simplified check
}

bool pmd_present(pmd_t pmd) {
    return pmd.val & _PAGE_VALID;
}

bool pmd_huge(pmd_t pmd) {
    // Check if PMD entry is huge page (2MB page)
    return pmd_present(pmd) && !(pmd.val & _PAGE_READ);  // Simplified check
}

// Example: Getting next level table address
pud_t *pud_offset(p4d_t *p4d, unsigned long address) {
    // Extract PUD index from address
    unsigned int pud_idx = (address >> PUD_SHIFT) & (PTRS_PER_PUD - 1);

    // Calculate PUD entry address
    // PUD table is at address from P4D entry
    unsigned long pud_table_pa = p4d_val(*p4d) >> _PTE_PPN_SHIFT;
    pud_table_pa <<= PAGE_SHIFT;

    // Convert to virtual address (direct mapping)
    pud_t *pud_table = __va(pud_table_pa);

    return &pud_table[pud_idx];
}

pmd_t *pmd_offset(pud_t *pud, unsigned long address) {
    unsigned int pmd_idx = (address >> PMD_SHIFT) & (PTRS_PER_PMD - 1);
    unsigned long pmd_table_pa = pud_val(*pud) >> _PTE_PPN_SHIFT;
    pmd_table_pa <<= PAGE_SHIFT;
    pmd_t *pmd_table = __va(pmd_table_pa);
    return &pmd_table[pmd_idx];
}

pte_t *pte_offset(pmd_t *pmd, unsigned long address) {
    unsigned int pte_idx = (address >> PTE_SHIFT) & (PTRS_PER_PTE - 1);
    unsigned long pte_table_pa = pmd_val(*pmd) >> _PTE_PPN_SHIFT;
    pte_table_pa <<= PAGE_SHIFT;
    pte_t *pte_table = __va(pte_table_pa);
    return &pte_table[pte_idx];
}
```

**Explanation**:

- **Three levels** Sv39 uses 3-level hierarchy (PUD, PMD, PTE)
- **512 entries** each level has 512 entries (9 bits for index)
- **Table pointers** entries at levels 2 and 1 point to next level table
- **Leaf entries** PTE entries point to physical pages
- **Huge pages** PUD and PMD can map huge pages directly

## Page Table Walk

**What**: Page table walk is the process of traversing the page table hierarchy to translate a virtual address to a physical address.

**How**: Page table walk works:

```c
// Example: Software page table walk
unsigned long page_table_walk(struct mm_struct *mm, unsigned long vaddr) {
    pgd_t *pgd;
    p4d_t *p4d;
    pud_t *pud;
    pmd_t *pmd;
    pte_t *pte;
    unsigned long paddr = 0;

    // Start from page global directory
    pgd = pgd_offset(mm, vaddr);
    if (pgd_none(*pgd) || pgd_bad(*pgd)) {
        return 0;  // Not mapped
    }

    // Level 4 (P4D) - typically not used, but required for structure
    p4d = p4d_offset(pgd, vaddr);
    if (p4d_none(*p4d)) {
        return 0;
    }

    // Level 3 (PUD) - Level 2 in Sv39
    pud = pud_offset(p4d, vaddr);
    if (pud_none(*pud) || pud_bad(*pud)) {
        return 0;
    }

    // Check for huge page at PUD level (1GB page)
    if (pud_huge(*pud)) {
        // PUD entry directly maps 1GB page
        paddr = (pud_val(*pud) & _PTE_PPN_MASK) >> _PTE_PPN_SHIFT;
        paddr <<= PAGE_SHIFT;
        paddr |= vaddr & (PUD_SIZE - 1);  // Add offset within 1GB
        return paddr;
    }

    // Level 2 (PMD) - Level 1 in Sv39
    pmd = pmd_offset(pud, vaddr);
    if (pmd_none(*pmd) || pmd_bad(*pmd)) {
        return 0;
    }

    // Check for huge page at PMD level (2MB page)
    if (pmd_huge(*pmd)) {
        // PMD entry directly maps 2MB page
        paddr = (pmd_val(*pmd) & _PTE_PPN_MASK) >> _PTE_PPN_SHIFT;
        paddr <<= PAGE_SHIFT;
        paddr |= vaddr & (PMD_SIZE - 1);  // Add offset within 2MB
        return paddr;
    }

    // Level 1 (PTE) - Level 0 in Sv39
    pte = pte_offset(pmd, vaddr);
    if (!pte_present(*pte)) {
        return 0;  // Page not present
    }

    // Extract physical address from PTE
    paddr = pte_pfn(*pte) << PAGE_SHIFT;
    paddr |= vaddr & ~PAGE_MASK;  // Add page offset

    return paddr;
}

// Example: Hardware page table walk (what MMU does)
// MMU performs similar walk automatically:
// 1. Read satp register for page table root
// 2. Extract VPN2 from virtual address
// 3. Read Level 2 entry using VPN2 as index
// 4. Extract VPN1, read Level 1 entry
// 5. Extract VPN0, read Level 0 entry
// 6. Combine physical page number with offset
// 7. Return physical address

// Example: Checking if address is mapped
bool is_mapped(struct mm_struct *mm, unsigned long vaddr) {
    pte_t *pte;

    pte = pte_offset_kernel(mm, vaddr);
    if (!pte) {
        return false;
    }

    return pte_present(*pte);
}
```

**Explanation**:

- **Hierarchical walk** walk through PUD -> PMD -> PTE levels
- **Huge page detection** check for huge pages at PUD or PMD level
- **Invalid entries** return 0 for invalid or missing entries
- **Physical extraction** extract physical address from leaf entry
- **Offset addition** add page offset to physical page address

## Page Table Management

**What**: Kernel manages page tables by creating, modifying, and destroying page table entries and tables.

**How**: Page table management works:

```c
// Example: Installing page table entry
void set_pte_at(struct mm_struct *mm, unsigned long address,
                pte_t *ptep, pte_t entry) {
    // Set page table entry
    // Memory barrier ensures write ordering
    smp_wmb();

    // Write PTE
    set_pte(ptep, entry);

    // Flush TLB if needed
    flush_tlb_page(address);
}

// Example: Creating page table for mapping
void install_pte(struct mm_struct *mm, unsigned long vaddr,
                unsigned long paddr, pgprot_t prot) {
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

    // Allocate PMD if needed
    if (pud_none(*pud)) {
        pmd_t *new_pmd = alloc_page_table();
        if (!new_pmd) {
            return;  // Allocation failed
        }
        pud_populate(mm, pud, new_pmd);
    }

    pmd = pmd_offset(pud, vaddr);

    // Allocate PTE table if needed
    if (pmd_none(*pmd)) {
        pte_t *new_pte_table = alloc_page_table();
        if (!new_pte_table) {
            return;
        }
        pmd_populate(mm, pmd, new_pte_table);
    }

    // Get PTE entry
    pte = pte_offset(pmd, vaddr);

    // Create PTE
    new_pte = pfn_pte(paddr >> PAGE_SHIFT, prot);

    // Install PTE
    set_pte_at(mm, vaddr, pte, new_pte);
}

// Example: Removing page table entry
void remove_pte(struct mm_struct *mm, unsigned long vaddr) {
    pte_t *pte;

    // Get PTE
    pte = pte_offset_kernel(mm, vaddr);
    if (!pte || !pte_present(*pte)) {
        return;  // Not mapped
    }

    // Clear PTE
    pte_clear(mm, vaddr, pte);

    // Flush TLB
    flush_tlb_page(vaddr);
}

// Example: Page table population
void pud_populate(struct mm_struct *mm, pud_t *pud, pmd_t *pmd_table) {
    // Set PUD entry to point to PMD table
    unsigned long pmd_pa = __pa(pmd_table);
    pud_t new_pud = __pud((pmd_pa >> PAGE_SHIFT) << _PTE_PPN_SHIFT);
    new_pud.val |= _PAGE_VALID;

    set_pud(pud, new_pud);
}

void pmd_populate(struct mm_struct *mm, pmd_t *pmd, pte_t *pte_table) {
    // Set PMD entry to point to PTE table
    unsigned long pte_pa = __pa(pte_table);
    pmd_t new_pmd = __pmd((pte_pa >> PAGE_SHIFT) << _PTE_PPN_SHIFT);
    new_pmd.val |= _PAGE_VALID;

    set_pmd(pmd, new_pmd);
}

// Example: Page table allocation
void *alloc_page_table(void) {
    struct page *page;

    // Allocate page for page table
    page = alloc_page(GFP_KERNEL | __GFP_ZERO);
    if (!page) {
        return NULL;
    }

    // Clear page (all entries invalid)
    // __GFP_ZERO already zeros the page

    return page_address(page);
}

// Example: Page table cleanup
void free_page_table(void *table) {
    struct page *page = virt_to_page(table);

    // Free page
    __free_page(page);
}
```

**Explanation**:

- **Entry installation** set_pte_at installs PTE with proper barriers
- **Table allocation** allocate pages for page tables as needed
- **Table population** populate PUD/PMD entries to point to next level
- **Entry removal** clear PTE when unmapping pages
- **TLB flushing** flush TLB after modifying page tables

## Huge Page Support

**What**: RISC-V and Linux support huge pages (2MB and 1GB) for improved TLB efficiency.

**How**: Huge pages work:

```c
// Example: Huge page sizes
#define HPAGE_SHIFT_PMD  21  // 2MB huge page
#define HPAGE_SIZE_PMD   (1UL << HPAGE_SHIFT_PMD)
#define HPAGE_MASK_PMD   (~(HPAGE_SIZE_PMD - 1))

#define HPAGE_SHIFT_PUD  30  // 1GB huge page
#define HPAGE_SIZE_PUD   (1UL << HPAGE_SHIFT_PUD)
#define HPAGE_MASK_PUD   (~(HPAGE_SIZE_PUD - 1))

// Example: Creating huge page mapping (2MB)
void map_huge_page_pmd(struct mm_struct *mm, unsigned long vaddr,
                      unsigned long paddr, pgprot_t prot) {
    pmd_t *pmd;
    pmd_t entry;

    // Get PMD entry
    pmd = pmd_offset(mm, vaddr);

    // Create huge page entry
    // For huge page, PMD entry points directly to physical page
    entry = pfn_pmd(paddr >> PAGE_SHIFT, prot);

    // Mark as huge page (set appropriate bits)
    entry = pmd_mkhuge(entry);

    // Install entry
    set_pmd(pmd, entry);

    // Flush TLB
    flush_tlb_page(vaddr);
}

// Example: Checking if huge page
bool is_huge_page(unsigned long vaddr) {
    pmd_t *pmd;

    pmd = pmd_offset_kernel(vaddr);
    if (!pmd || !pmd_present(*pmd)) {
        return false;
    }

    return pmd_huge(*pmd);
}

// Example: Huge page alignment requirements
bool is_huge_page_aligned(unsigned long addr) {
    // 2MB huge page requires 2MB alignment
    return (addr & (HPAGE_SIZE_PMD - 1)) == 0;
}
```

**Explanation**:

- **Huge page sizes** 2MB (PMD level) and 1GB (PUD level)
- **Direct mapping** huge pages map directly at PMD or PUD level
- **TLB efficiency** fewer TLB entries needed for large regions
- **Alignment** huge pages require proper alignment
- **Performance** huge pages improve TLB hit rate

## Next Steps

**What** you're ready for next:

After understanding page table structure, you should be ready to:

1. **Learn Memory Allocation** - How kernel allocates memory
2. **Study Memory Zones** - Physical memory zone organization
3. **Understand TLB Management** - Translation Lookaside Buffer operations
4. **Explore Page Faults** - Page fault handling and page table updates
5. **Begin Memory Optimization** - Optimize memory usage

**Where** to go next:

Continue with the next lesson on **"Memory Allocation"** to learn:

- Buddy system allocator
- Slab allocator
- Page allocation APIs
- Memory allocation strategies
- Allocation debugging

**Why** the next lesson is important:

Memory allocation is fundamental to kernel operation. Understanding allocation mechanisms is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine memory allocation code
2. **Use Tools** - Use memory debugging tools
3. **Trace Allocations** - Trace memory allocation patterns
4. **Read Documentation** - Study kernel memory documentation
5. **Experiment** - Modify allocation code and observe

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Virtual Memory](https://github.com/riscv/riscv-isa-manual) - Page table specification
- [Linux Kernel Memory Management](https://www.kernel.org/doc/html/latest/mm/) - Memory management docs

**Kernel Sources**:

- [Linux RISC-V Page Tables](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Page table code
