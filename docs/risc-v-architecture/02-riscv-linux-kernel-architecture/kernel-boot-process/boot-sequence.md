---
sidebar_position: 1
---

# Boot Sequence

Master the RISC-V Linux kernel boot sequence from power-on to kernel initialization, understanding each stage of the boot process essential for kernel development and debugging on RISC-V systems.

## What Is the Boot Sequence?

**What**: The boot sequence is the process by which a RISC-V system transitions from power-on reset through firmware, bootloader, and finally to the Linux kernel initialization. On RISC-V, this typically involves OpenSBI (Open Supervisor Binary Interface), U-Boot bootloader, and the Linux kernel.

**Why**: Understanding the boot sequence is crucial because:

- **Kernel Development** - Need to understand kernel entry points
- **Debugging** - Boot failures require understanding each stage
- **Initialization** - Kernel initialization depends on boot stages
- **Hardware Setup** - Boot stages configure hardware for kernel
- **Memory Setup** - Early memory setup happens during boot
- **Device Tree** - Device tree passed from bootloader to kernel

**When**: The boot sequence occurs when:

- **System Power-On** - System is powered on or reset
- **Reset Vector** - CPU jumps to reset vector address
- **Firmware Execution** - OpenSBI or similar firmware runs
- **Bootloader Execution** - U-Boot or similar bootloader runs
- **Kernel Loading** - Kernel image loaded into memory
- **Kernel Entry** - Kernel starts execution

**How**: The boot sequence works through:

- **Reset Vector** - CPU starts at fixed reset address
- **Firmware** - OpenSBI initializes hardware and provides SBI interface
- **Bootloader** - U-Boot loads kernel and device tree
- **Kernel Entry** - Kernel receives control and begins initialization
- **Device Tree** - Hardware description passed to kernel
- **Memory Discovery** - Memory layout discovered and configured

**Where**: The boot sequence happens in:

- **All RISC-V Systems** - Every RISC-V Linux system
- **VisionFive 2** - Development board boot sequence
- **QEMU** - Emulated RISC-V boot sequence
- **Embedded Systems** - Custom RISC-V embedded systems
- **Server Systems** - RISC-V server boot process

## Boot Stages Overview

**What**: RISC-V Linux boot consists of multiple stages: firmware, bootloader, and kernel.

**How**: Boot stages work:

```c
// Example: RISC-V boot sequence stages
// Stage 1: CPU Reset
//   - CPU starts at reset vector (typically 0x1000 or 0x80000000)
//   - Minimal hardware initialization
//   - Jump to firmware

// Stage 2: OpenSBI/Firmware
//   - Hardware initialization
//   - Provides SBI (Supervisor Binary Interface)
//   - Sets up environment for bootloader
//   - Transitions to supervisor mode for bootloader

// Stage 3: Bootloader (U-Boot)
//   - Loads kernel image from storage
//   - Loads device tree blob (DTB)
//   - Initializes some hardware
//   - Passes control to kernel with parameters

// Stage 4: Linux Kernel
//   - Early initialization in assembly
//   - C initialization code
//   - Full kernel initialization

// Example: Boot sequence flow diagram
/*
Power-On Reset
    |
    v
[CPU Reset Vector]
    | (Jump to)
    v
[OpenSBI/Firmware]
    | (SBI calls)
    v
[U-Boot Bootloader]
    | (Load kernel + DTB)
    v
[Linux Kernel Entry]
    | (Early init)
    v
[Kernel Main Initialization]
*/

// Example: Boot sequence addresses (typical RISC-V)
#define RESET_VECTOR       0x1000        // CPU reset vector
#define OPENSBI_BASE       0x80000000    // OpenSBI base address
#define UBOOT_BASE         0x80200000    // U-Boot base address
#define KERNEL_LOAD_ADDR   0x80200000    // Kernel load address
#define DTB_LOAD_ADDR      0x8F000000    // Device tree blob address
#define INITRD_LOAD_ADDR   0x8F400000    // Initramfs address (if used)

// Example: Boot parameter structure
struct boot_params {
    unsigned long kernel_entry;   // Kernel entry point
    unsigned long dtb_addr;        // Device tree blob address
    unsigned long dtb_size;        // Device tree blob size
    unsigned long initrd_addr;     // Initramfs address
    unsigned long initrd_size;     // Initramfs size
    unsigned long hart_id;         // Hardware thread ID
    unsigned long boot_hart;        // Boot hardware thread
};

// Example: Bootloader passing parameters to kernel
void bootloader_jump_to_kernel(unsigned long kernel_entry,
                               unsigned long dtb_addr,
                               unsigned long dtb_size) {
    // Disable interrupts
    __asm__ volatile("csrci sstatus, 1 << 1");  // Clear SIE bit

    // Prepare registers for kernel entry:
    // a0: hart_id
    // a1: dtb_addr
    unsigned long hart_id;
    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Jump to kernel entry point
    __asm__ volatile(
        "mv a0, %0\n"      // hart_id in a0
        "mv a1, %1\n"      // dtb_addr in a1
        "jr %2"            // Jump to kernel
        :
        : "r"(hart_id), "r"(dtb_addr), "r"(kernel_entry)
        : "a0", "a1", "memory"
    );

    // Should not reach here
    while (1);
}
```

**Explanation**:

- **Multiple stages** boot consists of firmware, bootloader, and kernel stages
- **Address mapping** each stage has typical memory addresses
- **Parameter passing** bootloader passes parameters via registers (a0, a1)
- **Register convention** a0=hart_id, a1=dtb_addr for kernel entry
- **Mode transition** bootloader typically runs in supervisor mode

## OpenSBI (Firmware Stage)

**What**: OpenSBI is the RISC-V firmware that provides the SBI interface and initializes hardware.

**Why**: OpenSBI is important because:

- **Hardware Initialization** - Initializes CPU and platform hardware
- **SBI Interface** - Provides standard interface for supervisor-mode software
- **Platform Support** - Supports various RISC-V platforms
- **Standardization** - Standard firmware interface for RISC-V
- **Kernel Support** - Kernel uses SBI calls for certain operations

**How**: OpenSBI works:

```c
// Example: SBI (Supervisor Binary Interface) calls
// SBI calls use ECALL instruction with specific conventions:
// a7: SBI extension ID
// a6: SBI function ID
// a0-a5: Function arguments
// a0: Return value

// SBI Extension IDs:
#define SBI_EXT_0_1_SET_TIMER        0x0
#define SBI_EXT_0_1_CONSOLE_PUTCHAR  0x1
#define SBI_EXT_0_1_CONSOLE_GETCHAR  0x2
#define SBI_EXT_0_1_CLEAR_IPI        0x3
#define SBI_EXT_0_1_SEND_IPI         0x4
#define SBI_EXT_0_1_REMOTE_FENCE_I   0x5
#define SBI_EXT_0_1_REMOTE_SFENCE_VMA 0x6
#define SBI_EXT_0_1_REMOTE_SFENCE_VMA_ASID 0x7
#define SBI_EXT_0_1_SHUTDOWN         0x8

// Example: SBI call wrapper
static inline long sbi_ecall(int ext_id, int fid,
                             unsigned long arg0, unsigned long arg1,
                             unsigned long arg2, unsigned long arg3,
                             unsigned long arg4, unsigned long arg5,
                             unsigned long *out0, unsigned long *out1,
                             unsigned long *out2) {
    register unsigned long a0 asm("a0") = arg0;
    register unsigned long a1 asm("a1") = arg1;
    register unsigned long a2 asm("a2") = arg2;
    register unsigned long a3 asm("a3") = arg3;
    register unsigned long a4 asm("a4") = arg4;
    register unsigned long a5 asm("a5") = arg5;
    register unsigned long a6 asm("a6") = (unsigned long)fid;
    register unsigned long a7 asm("a7") = (unsigned long)ext_id;

    __asm__ volatile("ecall"
                     : "+r"(a0), "+r"(a1), "+r"(a2)
                     : "r"(a3), "r"(a4), "r"(a5), "r"(a6), "r"(a7)
                     : "memory");

    if (out0) *out0 = a0;
    if (out1) *out1 = a1;
    if (out2) *out2 = a2;

    return a0;
}

// Example: SBI console output
void sbi_console_putchar(char ch) {
    sbi_ecall(SBI_EXT_0_1_CONSOLE_PUTCHAR, 0, ch, 0, 0, 0, 0, 0,
              NULL, NULL, NULL);
}

// Example: SBI timer setup
void sbi_set_timer(uint64_t stime_value) {
    // Set timer for next timer interrupt
    unsigned long upper = stime_value >> 32;
    unsigned long lower = stime_value & 0xFFFFFFFF;

    sbi_ecall(SBI_EXT_0_1_SET_TIMER, 0, lower, upper, 0, 0, 0, 0,
              NULL, NULL, NULL);
}

// Example: SBI shutdown
void sbi_shutdown(void) {
    sbi_ecall(SBI_EXT_0_1_SHUTDOWN, 0, 0, 0, 0, 0, 0, 0,
              NULL, NULL, NULL);
}

// Example: OpenSBI initialization (what OpenSBI does)
// 1. Initialize CPU (cache, TLB, etc.)
// 2. Initialize platform hardware
// 3. Setup SBI interface
// 4. Prepare environment for bootloader
// 5. Jump to bootloader (typically U-Boot)
```

**Explanation**:

- **SBI calls** kernel uses ECALL for SBI operations
- **Extension system** SBI organized into extensions
- **Standard interface** provides standard interface to supervisor mode
- **Hardware abstraction** abstracts platform-specific hardware details
- **Console/Timer** SBI provides console and timer services

## Kernel Entry Point

**What**: The kernel entry point is where the Linux kernel begins execution after being loaded by the bootloader.

**How**: Kernel entry works:

```c
// Example: RISC-V kernel entry point (arch/riscv/kernel/head.S)
// Kernel entry conventions:
// a0: hart_id (hardware thread ID)
// a1: dtb_addr (device tree blob physical address)

// Kernel entry in assembly:
.section .text.head, "ax"
.global _start
_start:
    // Save boot parameters
    // hart_id in a0, dtb_addr in a1

    // Set up stack pointer (early stack)
    la sp, init_stack
    addi sp, sp, STACK_SIZE

    // Clear BSS section
    la t0, __bss_start
    la t1, __bss_stop

bss_clear_loop:
    beq t0, t1, bss_clear_done
    sd zero, 0(t0)
    addi t0, t0, 8
    j bss_clear_loop

bss_clear_done:
    // Save hart_id and dtb_addr
    // These are in a0 and a1 registers
    // Store in global variables for C code

    // Jump to C initialization
    call setup_vm          // Setup early virtual memory
    call relocate          // Relocate kernel if needed
    call early_init_c      // Early C initialization

    // Should not return, but if it does, loop
    j .

// Example: Early kernel initialization structure
void early_init_c(unsigned long hart_id, unsigned long dtb_addr) {
    // Initialize early console (SBI)
    early_console_init();

    // Parse device tree
    early_init_dt_scan(dtb_addr);

    // Initialize memory
    setup_bootmem(hart_id);

    // Setup page tables
    setup_initial_pgtable();

    // Enable MMU (virtual memory)
    enable_mmu();

    // Continue with main kernel initialization
    start_kernel();
}

// Example: Early memory setup
void setup_bootmem(unsigned long hart_id) {
    // Discover memory from device tree
    // or use hardcoded addresses for early boot

    // Initialize bootmem allocator
    // This is used before page allocator is ready

    // Reserve kernel memory
    // Reserve device tree
    // Reserve initrd (if present)

    // Setup memory zones
    memblock_init();
}
```

**Explanation**:

- **Entry convention** a0=hart_id, a1=dtb_addr for kernel entry
- **Assembly entry** kernel starts in assembly code
- **BSS clearing** clear uninitialized data section
- **Early init** early initialization before full kernel is ready
- **Memory setup** early memory setup before page allocator

## Device Tree Parsing

**What**: The device tree is a data structure that describes hardware to the kernel.

**How**: Device tree parsing works:

```c
// Example: Early device tree parsing
// Device tree is passed from bootloader in a1 register
// Physical address of device tree blob (DTB)

// Example: Device tree structure (Flattened Device Tree - FDT)
// FDT format:
// - Header
// - Memory reserve map
// - Device tree structure
// - Strings

// Example: Parsing device tree in early init
void early_init_dt_scan(unsigned long dtb_addr) {
    void *dtb = __va(dtb_addr);  // Convert to virtual address

    // Validate FDT header
    if (fdt_check_header(dtb) != 0) {
        panic("Invalid device tree");
        return;
    }

    // Scan device tree for:
    // - Memory nodes
    // - Chosen node (boot parameters)
    // - CPU nodes
    // - Platform nodes

    // Extract memory information
    early_init_dt_scan_memory(dtb);

    // Extract chosen node (bootargs, stdout-path, etc.)
    early_init_dt_scan_chosen(dtb);

    // Extract CPU information
    early_init_dt_scan_cpus(dtb);

    // Store device tree for later use
    initial_boot_params = dtb;
}

// Example: Extracting memory from device tree
void early_init_dt_scan_memory(void *dtb) {
    int node;
    int len;
    const __be32 *reg;
    unsigned long base, size;

    // Find memory node
    node = fdt_path_offset(dtb, "/memory");
    if (node < 0) {
        // Try alternative names
        node = fdt_subnode_offset(dtb, 0, "memory");
    }

    if (node >= 0) {
        // Read memory ranges
        reg = fdt_getprop(dtb, node, "reg", &len);
        if (reg && len > 0) {
            int addr_cells = fdt_address_cells(dtb, node);
            int size_cells = fdt_size_cells(dtb, node);

            // Parse each memory range
            for (int i = 0; i < len; i += (addr_cells + size_cells) * 4) {
                base = fdt_read_number(reg + i, addr_cells);
                size = fdt_read_number(reg + i + addr_cells, size_cells);

                // Add to memory map
                memblock_add(base, size);
            }
        }
    }
}

// Example: Extracting boot arguments
void early_init_dt_scan_chosen(void *dtb) {
    int node;
    const char *bootargs;

    // Find chosen node
    node = fdt_path_offset(dtb, "/chosen");
    if (node < 0) {
        return;
    }

    // Extract bootargs
    bootargs = fdt_getprop(dtb, node, "bootargs", NULL);
    if (bootargs) {
        // Copy to kernel command line
        strlcpy(boot_command_line, bootargs, COMMAND_LINE_SIZE);
    }

    // Extract stdout-path for early console
    const char *stdout_path = fdt_getprop(dtb, node, "stdout-path", NULL);
    if (stdout_path) {
        // Setup early console based on stdout-path
        setup_early_console(stdout_path);
    }
}
```

**Explanation**:

- **Device tree address** passed from bootloader in a1 register
- **FDT format** Flattened Device Tree format
- **Memory discovery** memory nodes describe available memory
- **Boot parameters** chosen node contains boot parameters
- **Early parsing** parse device tree early in boot process

## Kernel Main Initialization

**What**: After early initialization, kernel proceeds to main initialization.

**How**: Main initialization works:

```c
// Example: Kernel main initialization (start_kernel)
void start_kernel(void) {
    // Lock kernel (prevent multiple CPUs from entering)
    lockdep_init();

    // Initialize CPU and memory management
    setup_arch(&command_line);

    // Build memory zones
    build_all_zonelists(NULL);

    // Initialize page allocator
    page_alloc_init();

    // Initialize interrupt subsystem
    init_IRQ();

    // Initialize timer subsystem
    time_init();

    // Initialize process management
    fork_init();

    // Initialize kernel subsystems
    // ... many more initializations ...

    // Start init process
    rest_init();
}

// Example: RISC-V specific setup_arch
void setup_arch(char **cmdline_p) {
    // Parse command line
    *cmdline_p = boot_command_line;
    parse_early_param();

    // Setup RISC-V specific features
    riscv_init();

    // Discover CPUs
    riscv_of_processor_ids();

    // Setup SMP (if multi-core)
    smp_setup_processor_id();

    // Initialize memory management
    setup_machine_fdt(__fdt_pointer);

    // Initialize page tables
    paging_init();

    // Initialize exception handling
    trap_init();

    // Initialize interrupts
    init_IRQ();
}
```

**Explanation**:

- **Main initialization** start_kernel begins main kernel initialization
- **Architecture setup** setup_arch does RISC-V-specific setup
- **Subsystem init** initialize all kernel subsystems
- **Process creation** create first kernel thread
- **User space** eventually start user space (init process)

## Next Steps

**What** you're ready for next:

After understanding boot sequence, you should be ready to:

1. **Learn Bootloader Interface** - Detailed bootloader interface and parameters
2. **Study Kernel Entry Points** - Different kernel entry scenarios
3. **Understand Early Memory Setup** - Memory initialization during boot
4. **Explore Device Tree** - Detailed device tree usage
5. **Begin Debugging** - Debug boot issues

**Where** to go next:

Continue with the next lesson on **"Bootloader Interface"** to learn:

- OpenSBI interface details
- U-Boot bootloader interface
- Kernel parameter passing
- Device tree loading
- Boot configuration

**Why** the next lesson is important:

Understanding the bootloader interface is essential for configuring boot parameters and debugging boot issues.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel boot code
2. **Use Bootloader** - Configure U-Boot bootloader
3. **Debug Boot** - Use debugger to trace boot sequence
4. **Read Device Tree** - Study device tree format
5. **Experiment** - Modify boot parameters and observe

## Resources

**Official Documentation**:

- [RISC-V SBI Specification](https://github.com/riscv/riscv-sbi-doc) - SBI interface specification
- [OpenSBI Documentation](https://github.com/riscv/opensbi) - OpenSBI firmware
- [Device Tree Specification](https://devicetree.org/) - Device tree format

**Kernel Sources**:

- [Linux RISC-V Kernel Boot](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel boot code
