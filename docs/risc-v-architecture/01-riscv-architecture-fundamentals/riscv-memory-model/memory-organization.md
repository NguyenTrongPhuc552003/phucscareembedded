---
sidebar_position: 1
---

# Memory Organization

Master RISC-V memory organization and address space layout, understanding how memory is structured and accessed in RISC-V systems, essential for kernel memory management and system design.

## What Is Memory Organization?

**What**: Memory organization defines how physical and virtual memory is structured, addressed, and accessed in a RISC-V system. It includes address space layout, memory regions, and access permissions.

**Why**: Understanding memory organization is crucial because:

- **Kernel Design** - Kernel must understand memory layout
- **Virtual Memory** - Essential for virtual memory management
- **Security** - Memory organization provides security boundaries
- **Performance** - Memory layout affects cache performance
- **Hardware Integration** - Memory-mapped I/O uses memory organization
- **System Design** - Foundation for all memory-related operations

**When**: Memory organization is relevant when:

- **Boot Process** - Early boot uses physical memory layout
- **Virtual Memory Setup** - Page tables define virtual memory organization
- **Memory Allocation** - Kernel allocates memory based on organization
- **Device Access** - Memory-mapped I/O uses specific memory regions
- **Security Enforcement** - Memory protection uses organization rules
- **System Configuration** - System setup defines memory regions

**How**: Memory organization works through:

- **Address Spaces** - Separate address spaces for different purposes
- **Memory Regions** - Different regions for code, data, stack, heap
- **Virtual Memory** - Virtual addresses mapped to physical addresses
- **Physical Memory** - Actual RAM and memory-mapped devices
- **Address Translation** - Hardware translates virtual to physical addresses

**Where**: Memory organization is found in:

- **All RISC-V Systems** - Every system has memory organization
- **Kernel Memory Layout** - Kernel defines memory organization
- **Process Memory** - Each process has its own memory organization
- **Device Trees** - Device tree describes memory regions
- **Boot Configuration** - Bootloader sets up initial memory organization

## Physical Memory Organization

**What**: Physical memory organization defines how actual RAM and memory-mapped devices are arranged in the physical address space.

**Why**: Physical memory organization is important because:

- **Hardware Layout** - Reflects actual hardware memory layout
- **Device Access** - Memory-mapped devices at specific addresses
- **Boot Process** - Early boot uses physical addresses
- **DMA Operations** - DMA uses physical addresses
- **Memory Controller** - Physical organization affects memory controller

**How**: Physical memory is organized:

```c
// Example: Physical memory organization on RISC-V system
// Physical address space layout (example for VisionFive 2):

// Memory map:
// 0x0000_0000 - 0x07FF_FFFF: RAM (128MB)
// 0x0800_0000 - 0x0FFF_FFFF: Reserved
// 0x1000_0000 - 0x1FFF_FFFF: Memory-mapped I/O
//   - 0x1000_0000 - 0x1000_0FFF: UART0
//   - 0x1000_1000 - 0x1000_1FFF: UART1
//   - 0x1000_2000 - 0x1000_2FFF: GPIO
//   - 0x1001_0000 - 0x1001_FFFF: PLIC (Interrupt Controller)
//   - 0x0200_0000 - 0x0200_3FFF: CLINT (Timer/Software Interrupt)
// 0x2000_0000 - 0x2FFF_FFFF: Reserved
// 0x3000_0000 - 0x3FFF_FFFF: Additional RAM (if present)
// 0x4000_0000 - ... : Extended memory regions

// Example: Physical memory region definitions
struct mem_region {
    unsigned long base;
    unsigned long size;
    unsigned long flags;
    const char *name;
};

// Kernel physical memory regions
static struct mem_region physical_regions[] = {
    {
        .base = 0x00000000,
        .size = 0x08000000,  // 128MB RAM
        .flags = MEM_TYPE_RAM,
        .name = "Main RAM"
    },
    {
        .base = 0x10000000,
        .size = 0x01000000,  // 16MB MMIO
        .flags = MEM_TYPE_MMIO,
        .name = "Memory-Mapped I/O"
    },
    // ... more regions
};

// Example: Physical memory initialization
void setup_physical_memory(void) {
    unsigned long mem_start, mem_end;
    unsigned long mem_size;

    // Get memory size from device tree or hardware
    mem_size = get_memory_size();
    mem_start = 0x00000000;
    mem_end = mem_start + mem_size;

    // Initialize physical memory manager
    memblock_add(mem_start, mem_size);

    // Reserve kernel code and data
    memblock_reserve(KERNEL_START, KERNEL_SIZE);

    // Reserve device tree blob
    memblock_reserve(device_tree_blob, device_tree_size);

    // Mark memory-mapped I/O as reserved
    memblock_reserve(0x10000000, 0x01000000);

    printk("Physical memory: %lu MB\n", mem_size / (1024 * 1024));
}

// Example: Checking if address is RAM
bool is_ram_address(unsigned long phys_addr) {
    // Check if address falls in RAM region
    return (phys_addr >= RAM_START && phys_addr < RAM_END);
}

// Example: Checking if address is MMIO
bool is_mmio_address(unsigned long phys_addr) {
    // Check if address falls in MMIO region
    return (phys_addr >= MMIO_START && phys_addr < MMIO_END);
}

// Example: Physical memory allocation (buddy system)
struct page *alloc_pages_physical(unsigned int order) {
    struct page *page;
    unsigned long pfn;

    // Allocate physical pages from buddy allocator
    page = __alloc_pages(GFP_KERNEL, order, NULL);
    if (!page) {
        return NULL;
    }

    // Get physical frame number
    pfn = page_to_pfn(page);

    // Convert to physical address
    unsigned long phys_addr = PFN_PHYS(pfn);

    // Verify physical address is valid RAM
    if (!is_ram_address(phys_addr)) {
        __free_pages(page, order);
        return NULL;
    }

    return page;
}
```

**Explanation**:

- **Physical address space** maps directly to hardware memory and devices
- **Memory regions** different regions for RAM, MMIO, reserved areas
- **Device access** memory-mapped devices accessible via load/store
- **Memory initialization** kernel discovers and initializes physical memory
- **Allocation** physical pages allocated from available RAM regions

## Virtual Memory Organization

**What**: Virtual memory organization defines how processes see memory through virtual addresses that are translated to physical addresses by the MMU.

**Why**: Virtual memory is essential because:

- **Process Isolation** - Each process has separate address space
- **Security** - Prevents processes from accessing each other's memory
- **Simplified Programming** - Programs use virtual addresses
- **Memory Management** - Enables swapping and page sharing
- **Hardware Abstraction** - Hides physical memory layout

**How**: Virtual memory is organized:

```c
// Example: RISC-V virtual memory layout (RV64, SV39)
// Virtual address space (39-bit): 0x0000000000 - 0x7FFFFFFFFFFF (512GB)

// Kernel virtual memory layout (typical):
// 0xFFFFFFFF_80000000 - 0xFFFFFFFF_FFFFFFFF: Kernel space
//   - 0xFFFFFFFF_80000000: Kernel start
//   - 0xFFFFFFFF_80000000 + kernel_size: Kernel text/data
//   - 0xFFFFFFFF_C0000000: Kernel modules
//   - 0xFFFFFFFF_E0000000: vmalloc area
//   - 0xFFFFFFFF_FE000000: Fixmap area
//   - 0xFFFFFFFF_FF000000: FDT (Device Tree)

// User virtual memory layout (each process):
// 0x0000000000 - 0x00007FFFFFFFFFFF: User space (128TB)
//   - 0x0000000000 - 0x00007FFFFFFFFFFF: Code
//   - 0x0000800000000000 - 0x00007FFFFFFFFFFF: Data
//   - 0x00007FFFFEFFF000 - 0x00007FFFFFFFFFFF: Stack (grows down)

// Example: Kernel virtual memory layout definition
#define KERNEL_VIRT_START    0xFFFFFFFF80000000UL
#define KERNEL_VIRT_END      0xFFFFFFFFFFFFFFFFUL
#define USER_VIRT_START      0x0000000000000000UL
#define USER_VIRT_END        0x00007FFFFFFFFFFFUL

// Kernel space sizes
#define KERNEL_TEXT_SIZE     (32 * 1024 * 1024)  // 32MB
#define KERNEL_DATA_SIZE     (128 * 1024 * 1024) // 128MB
#define VMALLOC_SIZE         (128 * 1024 * 1024) // 128MB
#define FIXMAP_SIZE          (2 * 1024 * 1024)   // 2MB

// Example: Virtual address space initialization
void setup_virtual_memory_layout(void) {
    unsigned long kernel_virt_start, kernel_virt_end;
    unsigned long user_virt_start, user_virt_end;

    // Kernel virtual address range
    kernel_virt_start = KERNEL_VIRT_START;
    kernel_virt_end = KERNEL_VIRT_END;

    // User virtual address range
    user_virt_start = USER_VIRT_START;
    user_virt_end = USER_VIRT_END;

    // Initialize kernel page tables for kernel space
    setup_kernel_page_tables();

    // Initialize per-process page tables will be created later
    printk("Kernel virtual: %016lx - %016lx\n",
           kernel_virt_start, kernel_virt_end);
    printk("User virtual:   %016lx - %016lx\n",
           user_virt_start, user_virt_end);
}

// Example: Checking if address is kernel space
bool is_kernel_address(unsigned long virt_addr) {
    // Check if virtual address is in kernel space
    return virt_addr >= KERNEL_VIRT_START && virt_addr < KERNEL_VIRT_END;
}

// Example: Checking if address is user space
bool is_user_address(unsigned long virt_addr) {
    // Check if virtual address is in user space
    return virt_addr >= USER_VIRT_START && virt_addr <= USER_VIRT_END;
}

// Example: Converting kernel virtual to physical
unsigned long virt_to_phys_kernel(unsigned long virt) {
    // Kernel virtual addresses have direct mapping
    // Subtract kernel virtual start, add physical start
    if (!is_kernel_address(virt)) {
        return 0;  // Invalid
    }

    // Direct mapping: virt = KERNEL_VIRT_START + phys
    return virt - KERNEL_VIRT_START;
}

// Example: Converting physical to kernel virtual
unsigned long phys_to_virt_kernel(unsigned long phys) {
    // Direct mapping for kernel
    return KERNEL_VIRT_START + phys;
}

// Example: User virtual to physical (via page table)
unsigned long user_virt_to_phys(unsigned long virt, struct mm_struct *mm) {
    pgd_t *pgd;
    p4d_t *p4d;
    pud_t *pud;
    pmd_t *pmd;
    pte_t *pte;
    unsigned long phys;

    if (!is_user_address(virt)) {
        return 0;  // Invalid
    }

    // Walk page table to translate virtual to physical
    pgd = pgd_offset(mm, virt);
    if (pgd_none(*pgd)) {
        return 0;  // Not mapped
    }

    p4d = p4d_offset(pgd, virt);
    if (p4d_none(*p4d)) {
        return 0;
    }

    pud = pud_offset(p4d, virt);
    if (pud_none(*pud)) {
        return 0;
    }

    pmd = pmd_offset(pud, virt);
    if (pmd_none(*pmd)) {
        return 0;
    }

    pte = pte_offset_map(pmd, virt);
    if (!pte_present(*pte)) {
        pte_unmap(pte);
        return 0;  // Page not present
    }

    phys = pte_pfn(*pte) << PAGE_SHIFT;
    pte_unmap(pte);

    return phys | (virt & ~PAGE_MASK);  // Add page offset
}
```

**Explanation**:

- **Virtual address space** processes see virtual addresses, not physical
- **Kernel space** upper half of address space for kernel (in RV64)
- **User space** lower half of address space for user processes
- **Address translation** MMU translates virtual to physical addresses
- **Direct mapping** kernel often has direct 1:1 mapping for performance

## Memory Region Types

**What**: Different memory regions serve different purposes: code, data, stack, heap, and kernel memory.

**Why**: Memory regions are important because:

- **Access Control** - Different permissions for different regions
- **Organization** - Logical separation of code, data, stack
- **Security** - Code region typically read-only
- **Performance** - Different regions have different access patterns
- **Management** - Kernel manages regions differently

**How**: Memory regions work:

```c
// Example: Memory region types and permissions
// Code region: Read-only, executable
// Data region: Read-write, not executable
// Stack region: Read-write, not executable, grows down
// Heap region: Read-write, not executable, grows up
// Kernel region: Depends on kernel memory type

// Example: Process memory region structure
struct vm_area_struct {
    unsigned long vm_start;      // Start virtual address
    unsigned long vm_end;        // End virtual address
    pgprot_t vm_page_prot;       // Page protection
    unsigned long vm_flags;      // Region flags

    // Permissions
    // VM_READ: Readable
    // VM_WRITE: Writable
    // VM_EXEC: Executable
    // VM_SHARED: Shared between processes
    // VM_GROWSDOWN: Stack (grows down)
};

// Example: Code region setup (text segment)
void setup_code_region(struct mm_struct *mm, unsigned long start,
                       unsigned long size, unsigned long file_offset) {
    struct vm_area_struct *vma;

    vma = kmalloc(sizeof(*vma), GFP_KERNEL);
    vma->vm_start = start;
    vma->vm_end = start + size;
    vma->vm_page_prot = PAGE_READONLY | PAGE_EXEC;  // Read-only, executable
    vma->vm_flags = VM_READ | VM_EXEC | VM_MAYREAD | VM_MAYEXEC;

    // Map code region from file
    remap_pfn_range(vma, start, file_offset >> PAGE_SHIFT, size,
                    vma->vm_page_prot);

    // Insert into process memory map
    insert_vm_struct(mm, vma);
}

// Example: Data region setup (data/bss segment)
void setup_data_region(struct mm_struct *mm, unsigned long start,
                      unsigned long size) {
    struct vm_area_struct *vma;
    unsigned long pfn;
    struct page *page;

    vma = kmalloc(sizeof(*vma), GFP_KERNEL);
    vma->vm_start = start;
    vma->vm_end = start + size;
    vma->vm_page_prot = PAGE_READWRITE;  // Read-write, not executable
    vma->vm_flags = VM_READ | VM_WRITE | VM_MAYREAD | VM_MAYWRITE;

    // Allocate and map pages for data region
    for (unsigned long addr = start; addr < start + size; addr += PAGE_SIZE) {
        page = alloc_page(GFP_KERNEL | __GFP_ZERO);
        pfn = page_to_pfn(page);

        remap_pfn_range(vma, addr, pfn, PAGE_SIZE, vma->vm_page_prot);
    }

    insert_vm_struct(mm, vma);
}

// Example: Stack region setup
void setup_stack_region(struct mm_struct *mm, unsigned long start,
                        unsigned long size) {
    struct vm_area_struct *vma;

    vma = kmalloc(sizeof(*vma), GFP_KERNEL);
    vma->vm_start = start;
    vma->vm_end = start + size;
    vma->vm_page_prot = PAGE_READWRITE;  // Read-write, not executable
    vma->vm_flags = VM_READ | VM_WRITE | VM_GROWSDOWN | VM_MAYREAD | VM_MAYWRITE;

    // Stack grows down, so set up mapping at top
    // Allocate pages on demand (lazy allocation)
    // Kernel will handle page faults for stack growth

    insert_vm_struct(mm, vma);
}

// Example: Heap region setup
void setup_heap_region(struct mm_struct *mm, unsigned long start,
                      unsigned long size) {
    struct vm_area_struct *vma;

    vma = kmalloc(sizeof(*vma), GFP_KERNEL);
    vma->vm_start = start;
    vma->vm_end = start + size;
    vma->vm_page_prot = PAGE_READWRITE;
    vma->vm_flags = VM_READ | VM_WRITE | VM_MAYREAD | VM_MAYWRITE | VM_MAYGROW;

    // Heap grows up, allocate pages on demand
    insert_vm_struct(mm, vma);
}

// Example: Kernel memory regions
#define KERNEL_TEXT_START    KERNEL_VIRT_START
#define KERNEL_TEXT_END      (KERNEL_TEXT_START + KERNEL_TEXT_SIZE)
#define KERNEL_DATA_START    KERNEL_TEXT_END
#define KERNEL_DATA_END      (KERNEL_DATA_START + KERNEL_DATA_SIZE)
#define VMALLOC_START        0xFFFFFFFFC0000000UL
#define VMALLOC_END          (VMALLOC_START + VMALLOC_SIZE)

bool is_kernel_text(unsigned long addr) {
    return addr >= KERNEL_TEXT_START && addr < KERNEL_TEXT_END;
}

bool is_kernel_data(unsigned long addr) {
    return addr >= KERNEL_DATA_START && addr < KERNEL_DATA_END;
}

bool is_vmalloc_area(unsigned long addr) {
    return addr >= VMALLOC_START && addr < VMALLOC_END;
}
```

**Explanation**:

- **Code region** executable, typically read-only for security
- **Data region** read-write for program variables
- **Stack region** read-write, grows downward, accessed via SP register
- **Heap region** read-write, grows upward, for dynamic allocation
- **Kernel regions** kernel has separate regions for text, data, vmalloc

## Memory Layout in Linux Kernel

**What**: Linux kernel on RISC-V uses specific memory layout optimized for RISC-V architecture.

**How**: Kernel memory layout:

```c
// Example: RISC-V Linux kernel memory layout
// Based on arch/riscv/include/asm/pgtable.h and related files

// Kernel virtual memory layout (RV64, SV39):
#define PAGE_OFFSET           KERNEL_VIRT_START
#define KERNEL_LINK_ADDR      KERNEL_VIRT_START

// Memory zones (for physical memory management)
#define ZONE_DMA               0
#define ZONE_NORMAL            1
#define ZONE_HIGHMEM           2  // Not used in 64-bit

// Example: Kernel address space layout
void print_kernel_memory_layout(void) {
    printk("Kernel memory layout:\n");
    printk("  Text:       %016lx - %016lx\n",
           KERNEL_TEXT_START, KERNEL_TEXT_END);
    printk("  Data:       %016lx - %016lx\n",
           KERNEL_DATA_START, KERNEL_DATA_END);
    printk("  vmalloc:    %016lx - %016lx\n",
           VMALLOC_START, VMALLOC_END);
    printk("  Fixmap:     %016lx - %016lx\n",
           FIXMAP_START, FIXMAP_END);
    printk("  Device Tree: %016lx\n", FDT_VIRT_BASE);
}

// Example: Kernel memory allocation zones
enum zone_type {
    ZONE_DMA,       // DMA-capable memory
    ZONE_NORMAL,    // Normal memory
    ZONE_HIGHMEM,   // High memory (not in 64-bit)
};

struct zone *alloc_pages_zone(enum zone_type zone_type,
                              unsigned int order, gfp_t gfp_mask) {
    struct zone *zone;

    // Get appropriate zone
    zone = &pgdat->node_zones[zone_type];

    // Allocate from zone
    return __alloc_pages_node(zone->zone_pgdat, gfp_mask, order, NULL);
}

// Example: Kernel text mapping (read-only, executable)
void setup_kernel_text_mapping(void) {
    unsigned long text_start, text_end;
    unsigned long text_size;

    text_start = KERNEL_TEXT_START;
    text_size = _etext - _stext;
    text_end = text_start + text_size;

    // Map kernel text as read-only, executable
    map_pages(text_start, __pa(_stext), text_size,
              PAGE_KERNEL_EXEC | PAGE_READONLY);
}

// Example: Kernel data mapping (read-write, not executable)
void setup_kernel_data_mapping(void) {
    unsigned long data_start, data_end;

    data_start = KERNEL_DATA_START;
    data_end = data_start + (_edata - _sdata);

    // Map kernel data as read-write, not executable
    map_pages(data_start, __pa(_sdata), data_end - data_start,
              PAGE_KERNEL);
}
```

**Explanation**:

- **Kernel layout** kernel has fixed virtual address layout
- **Direct mapping** kernel often uses direct physical-to-virtual mapping
- **Memory zones** different zones for different memory types
- **Text mapping** kernel code mapped read-only and executable
- **Data mapping** kernel data mapped read-write, not executable

## Address Space Identifiers (ASID)

**What**: ASIDs are identifiers used to tag TLB entries and enable fast TLB invalidation per address space.

**Why**: ASIDs are important because:

- **TLB Efficiency** - TLB entries tagged with ASID
- **Fast Invalidation** - Can invalidate TLB for specific process
- **Multi-tasking** - Multiple processes share TLB
- **Performance** - Avoids full TLB flush on context switch
- **Security** - Ensures TLB entries not shared between processes

**How**: ASIDs work:

```c
// Example: ASID management
// satp register contains ASID field
// ASID bits: [59:44] in satp register (for SV39)

#define ASID_BITS              16
#define ASID_MASK              0xFFFF
#define ASID_FIRST_VERSION     ((unsigned long)-1)

// Example: ASID allocation
struct asid_info {
    atomic64_t generation;
    unsigned long *map;
    unsigned long max_asids;
};

static struct asid_info asid_info = {
    .generation = ATOMIC64_INIT(ASID_FIRST_VERSION),
    .map = NULL,
    .max_asids = 0,
};

void init_asid_info(void) {
    // Initialize ASID allocator
    // Maximum ASIDs depends on implementation
    asid_info.max_asids = 1 << ASID_BITS;  // 65536 ASIDs

    // Allocate bitmap for ASID tracking
    asid_info.map = bitmap_zalloc(asid_info.max_asids, GFP_KERNEL);

    printk("ASID support: %lu ASIDs available\n", asid_info.max_asids);
}

// Example: Allocating ASID for process
unsigned long alloc_asid(struct mm_struct *mm) {
    unsigned long asid = atomic64_read(&mm->context.asid);
    unsigned long generation = atomic64_read(&asid_info.generation);

    // Check if current ASID is valid
    if (asid != 0 && (atomic64_read(&mm->context.generation) == generation)) {
        // ASID still valid
        return asid;
    }

    // Allocate new ASID
    asid = find_next_zero_bit(asid_info.map, asid_info.max_asids, 1);
    if (asid >= asid_info.max_asids) {
        // ASID space exhausted, flush all
        new_generation = atomic64_inc_return(&asid_info.generation);
        flush_all_asids();
        asid = 1;  // Start from 1 (0 reserved)
    }

    set_bit(asid, asid_info.map);

    atomic64_set(&mm->context.asid, asid);
    atomic64_set(&mm->context.generation, generation);

    return asid;
}

// Example: Using ASID in satp register
void set_process_asid(struct mm_struct *mm, unsigned long pgtable_root) {
    unsigned long asid = mm->context.asid;
    unsigned long satp_value;

    // Build satp: mode | ASID | PPN
    satp_value = (SATP_MODE_SV39 << SATP_MODE_SHIFT) |
                 (asid << SATP_ASID_SHIFT) |
                 (pgtable_root >> PAGE_SHIFT);

    __asm__ volatile("csrw satp, %0" : : "r"(satp_value));

    // Flush TLB (entries with different ASID automatically ignored)
    __asm__ volatile("sfence.vma zero, zero");  // Flush all ASIDs
}
```

**Explanation**:

- **ASID allocation** kernel allocates unique ASID per address space
- **TLB tagging** TLB entries tagged with ASID from satp register
- **Generation numbers** used to invalidate old ASIDs on wrap-around
- **Fast invalidation** can flush TLB for specific ASID
- **Context switching** ASID changes with address space on context switch

## Next Steps

**What** you're ready for next:

After mastering memory organization, you should be ready to:

1. **Learn Addressing Modes** - Different ways to access memory
2. **Study Memory Ordering** - Memory consistency and ordering rules
3. **Understand Virtual Memory** - Page-based virtual memory system
4. **Explore Page Tables** - How page tables organize memory
5. **Begin Memory Management** - Apply memory organization knowledge

**Where** to go next:

Continue with the next lesson on **"Addressing Modes"** to learn:

- Direct addressing
- Immediate addressing
- Register addressing
- Base+offset addressing
- Effective address calculation

**Why** the next lesson is important:

Addressing modes determine how instructions access memory. Understanding addressing modes is essential for understanding memory operations.

**How** to continue learning:

1. **Study Instructions** - Examine how instructions use addressing
2. **Read Spec** - Study RISC-V memory model specification
3. **Analyze Code** - See addressing modes in kernel code
4. **Use Debugger** - Observe address calculation in debugger
5. **Write Code** - Practice using different addressing modes

## Resources

**Official Documentation**:

- [RISC-V ISA Manual - Memory Model](https://github.com/riscv/riscv-isa-manual) - Memory organization specification
- [RISC-V Privileged ISA](https://github.com/riscv/riscv-isa-manual) - Virtual memory specification

**Kernel Sources**:

- [Linux RISC-V Memory Layout](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Kernel memory code
