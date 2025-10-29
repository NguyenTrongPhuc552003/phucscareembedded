---
sidebar_position: 2
---

# Bootloader Interface

Master the interface between bootloader and Linux kernel on RISC-V, understanding how parameters are passed, memory layout is configured, and the kernel receives control from the bootloader.

## What Is the Bootloader Interface?

**What**: The bootloader interface defines the conventions and mechanisms by which the bootloader (typically U-Boot) passes information to the Linux kernel and transfers control to it. On RISC-V, this includes register-based parameter passing, device tree loading, and memory layout conventions.

**Why**: Understanding the bootloader interface is crucial because:

- **Parameter Passing** - Bootloader must pass parameters correctly
- **Kernel Compatibility** - Kernel expects specific interface
- **Debugging** - Boot failures often relate to interface issues
- **Configuration** - Understanding interface enables boot configuration
- **Device Tree** - Device tree loading and passing conventions
- **Memory Layout** - Memory layout agreements between bootloader and kernel

**When**: The bootloader interface is used when:

- **Kernel Loading** - Bootloader loads kernel into memory
- **Parameter Preparation** - Bootloader prepares kernel parameters
- **Control Transfer** - Bootloader transfers control to kernel
- **Device Tree Passing** - Device tree blob passed to kernel
- **Initial RAM Disk** - Initramfs loading and passing
- **Boot Configuration** - Configuring boot parameters

**How**: The bootloader interface works through:

- **Register Convention** - Standard register usage for parameters
- **Memory Layout** - Agreed memory layout for kernel and data
- **Device Tree** - Device tree blob location and format
- **Entry Point** - Kernel entry point address
- **Boot Protocol** - Standard boot protocol conventions

**Where**: The bootloader interface is found in:

- **All RISC-V Systems** - Every RISC-V Linux boot sequence
- **U-Boot Bootloader** - Primary bootloader for RISC-V
- **Kernel Entry Code** - Kernel code that receives bootloader parameters
- **Boot Configuration** - Bootloader configuration files
- **Embedded Systems** - Custom bootloader implementations

## Register-Based Parameter Passing

**What**: RISC-V uses registers to pass boot parameters from bootloader to kernel.

**Why**: Register-based passing is important because:

- **Efficiency** - Fast parameter passing without memory access
- **Simplicity** - Simple and direct parameter transmission
- **Standard Convention** - Standard RISC-V calling convention
- **Early Boot** - Works before memory is fully configured
- **Architecture Standard** - Follows RISC-V ABI conventions

**How**: Register passing works:

```c
// Example: RISC-V kernel boot register convention
// Based on RISC-V Linux boot protocol:
// a0 (x10): hart_id - Hardware thread ID (CPU core ID)
// a1 (x11): dtb_addr - Physical address of device tree blob (DTB)
// a2 (x12): Reserved (for future use)
// a3 (x13): Reserved (for future use)
// a4 (x14): Reserved (for future use)
// a5 (x15): Reserved (for future use)
// a6 (x16): Reserved (for future use)
// a7 (x17): Reserved (for future use)

// Example: Bootloader preparing registers for kernel entry
void bootloader_prepare_kernel(unsigned long kernel_entry,
                               unsigned long dtb_phys_addr) {
    unsigned long hart_id;

    // Get current hardware thread ID
    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Prepare kernel entry:
    // a0 will contain hart_id
    // a1 will contain dtb_phys_addr

    // Disable interrupts before jumping to kernel
    __asm__ volatile("csrci mstatus, 8");  // Clear MIE bit

    // Jump to kernel entry point
    // Assembly will load registers and jump
    __asm__ volatile(
        "li a0, %0\n"      // Load hart_id into a0
        "li a1, %1\n"      // Load dtb_addr into a1
        "jr %2\n"          // Jump to kernel entry point
        :
        : "r"(hart_id), "r"(dtb_phys_addr), "r"(kernel_entry)
        : "a0", "a1", "memory"
    );

    // Should not reach here
    while (1);
}

// Example: Kernel entry point receiving parameters
// Kernel entry code (arch/riscv/kernel/head.S equivalent)
unsigned long kernel_entry_hart_id;
unsigned long kernel_entry_dtb_addr;

void kernel_entry_assembly(void) {
    // Entry point receives parameters in registers
    // a0: hart_id
    // a1: dtb_addr

    // Save boot parameters
    __asm__ volatile(
        "mv %0, a0\n"      // Save hart_id
        "mv %1, a1\n"      // Save dtb_addr
        : "=r"(kernel_entry_hart_id), "=r"(kernel_entry_dtb_addr)
        :
        : "a0", "a1"
    );

    // Now kernel can use these parameters
    early_init_c(kernel_entry_hart_id, kernel_entry_dtb_addr);
}

// Example: Multiple hart boot (SMP systems)
void bootloader_boot_all_harts(unsigned long kernel_entry,
                               unsigned long dtb_phys_addr) {
    unsigned long num_harts;
    unsigned long boot_hart;

    // Get number of hardware threads
    num_harts = get_num_harts();

    // Primary boot hart jumps to kernel immediately
    boot_hart = get_boot_hart_id();

    if (get_current_hart_id() == boot_hart) {
        // Primary hart: jump to kernel
        bootloader_prepare_kernel(kernel_entry, dtb_phys_addr);
    } else {
        // Secondary harts: wait for wake-up
        wait_for_kernel_wakeup();

        // When woken up, secondary harts also jump to kernel
        bootloader_prepare_kernel(kernel_entry, dtb_phys_addr);
    }
}
```

**Explanation**:

- **Register convention** a0=hart_id, a1=dtb_addr are standard
- **Parameter saving** kernel saves registers early for later use
- **Primary hart** first CPU core boots kernel, others wait
- **SMP boot** multiple cores handled via hart_id
- **Simple interface** minimal register usage keeps interface simple

## Memory Layout Convention

**What**: Bootloader and kernel agree on a memory layout for kernel image, device tree, and other boot data.

**How**: Memory layout works:

```c
// Example: RISC-V kernel memory layout (typical)
// Memory addresses are physical addresses (before MMU enabled)

#define KERNEL_LOAD_ADDR       0x80200000UL    // Kernel load address
#define KERNEL_ENTRY_POINT     0x80200000UL    // Kernel entry point
#define DTB_LOAD_ADDR          0x8F000000UL    // Device tree blob address
#define INITRD_LOAD_ADDR       0x8F400000UL    // Initial RAM disk address
#define FDT_MAX_SIZE           0x00200000UL    // Max DTB size (2MB)

// Memory layout diagram:
/*
Low Memory:
  0x00000000 - 0x00100000: Reserved (OpenSBI, early boot)
  0x00100000 - 0x00200000: OpenSBI

Kernel Region:
  0x80200000 - 0x8F000000: Kernel image
  - Text section (code)
  - Data section
  - BSS section

Device Tree:
  0x8F000000 - 0x8F200000: Device Tree Blob (DTB)

Initramfs (if used):
  0x8F400000 - 0x9F000000: Initial RAM disk

High Memory:
  Above: Available for system use
*/

// Example: Bootloader loading kernel
int bootloader_load_kernel(void *kernel_image, size_t kernel_size) {
    void *load_addr = (void *)KERNEL_LOAD_ADDR;

    // Copy kernel image to load address
    memcpy(load_addr, kernel_image, kernel_size);

    // Ensure cache coherency
    flush_cache_range(load_addr, kernel_size);

    // Verify kernel header (ELF or Image format)
    if (verify_kernel_header(load_addr) != 0) {
        return -1;  // Invalid kernel
    }

    // Get kernel entry point
    unsigned long entry_point = get_kernel_entry_point(load_addr);

    return 0;
}

// Example: Bootloader loading device tree
int bootloader_load_dtb(void *dtb_blob, size_t dtb_size) {
    void *dtb_addr = (void *)DTB_LOAD_ADDR;

    // Check DTB size
    if (dtb_size > FDT_MAX_SIZE) {
        return -1;  // DTB too large
    }

    // Copy device tree to load address
    memcpy(dtb_addr, dtb_blob, dtb_size);

    // Verify FDT header
    if (fdt_check_header(dtb_addr) != 0) {
        return -1;  // Invalid device tree
    }

    return 0;
}

// Example: Bootloader loading initramfs
int bootloader_load_initrd(void *initrd_image, size_t initrd_size) {
    if (initrd_size == 0) {
        return 0;  // No initramfs
    }

    void *initrd_addr = (void *)INITRD_LOAD_ADDR;

    // Copy initramfs to load address
    memcpy(initrd_addr, initrd_image, initrd_size);

    // Store initrd info in device tree chosen node
    // (Kernel will read from device tree)

    return 0;
}

// Example: Memory region reservation
void bootloader_reserve_memory_regions(void) {
    // Reserve kernel region
    memblock_reserve(KERNEL_LOAD_ADDR, KERNEL_SIZE);

    // Reserve device tree region
    memblock_reserve(DTB_LOAD_ADDR, FDT_MAX_SIZE);

    // Reserve initramfs region (if present)
    if (initrd_size > 0) {
        memblock_reserve(INITRD_LOAD_ADDR, initrd_size);
    }

    // Reserve bootloader itself
    memblock_reserve(OPENSBI_BASE, OPENSBI_SIZE);
    memblock_reserve(UBOOT_BASE, UBOOT_SIZE);
}
```

**Explanation**:

- **Standard addresses** typical addresses for kernel, DTB, initramfs
- **Load addresses** bootloader loads data at specific addresses
- **Memory reservation** kernel must not use reserved memory regions
- **Size limits** maximum sizes for DTB and other regions
- **Cache coherency** flush caches after loading

## Device Tree Passing

**What**: The device tree blob (DTB) is passed from bootloader to kernel via register a1.

**How**: Device tree passing works:

```c
// Example: Bootloader preparing device tree
int bootloader_prepare_dtb(unsigned long dtb_phys_addr) {
    void *dtb = (void *)dtb_phys_addr;
    int node;

    // Verify DTB
    if (fdt_check_header(dtb) != 0) {
        return -1;
    }

    // Update chosen node with boot parameters
    node = fdt_path_offset(dtb, "/chosen");
    if (node < 0) {
        node = fdt_add_subnode(dtb, 0, "chosen");
        if (node < 0) {
            return -1;
        }
    }

    // Add bootargs if provided
    const char *bootargs = get_bootargs();
    if (bootargs && strlen(bootargs) > 0) {
        fdt_setprop_string(dtb, node, "bootargs", bootargs);
    }

    // Add initrd start and end (if initramfs present)
    if (initrd_size > 0) {
        fdt_setprop_u64(dtb, node, "linux,initrd-start", INITRD_LOAD_ADDR);
        fdt_setprop_u64(dtb, node, "linux,initrd-end",
                        INITRD_LOAD_ADDR + initrd_size);
    }

    // Update stdout-path for early console
    const char *stdout_path = get_stdout_path();
    if (stdout_path) {
        fdt_setprop_string(dtb, node, "stdout-path", stdout_path);
    }

    // Recalculate FDT checksums
    fdt_pack(dtb);

    return 0;
}

// Example: Kernel receiving device tree
void kernel_receive_dtb(unsigned long dtb_phys_addr) {
    void *dtb;

    // Validate DTB address
    if (dtb_phys_addr == 0) {
        panic("No device tree provided");
        return;
    }

    // Check DTB is in valid memory region
    if (!is_valid_memory_address(dtb_phys_addr)) {
        panic("Invalid device tree address");
        return;
    }

    // Convert to virtual address for access
    dtb = __va(dtb_phys_addr);

    // Validate FDT header
    if (fdt_check_header(dtb) != 0) {
        panic("Invalid device tree blob");
        return;
    }

    // Store DTB address for kernel use
    initial_boot_params = dtb;

    // Parse device tree early
    early_init_dt_scan(dtb);
}

// Example: Extracting boot parameters from device tree
void kernel_extract_boot_params(void) {
    void *dtb = initial_boot_params;
    int node;

    // Find chosen node
    node = fdt_path_offset(dtb, "/chosen");
    if (node < 0) {
        return;  // No chosen node
    }

    // Extract bootargs
    const char *bootargs = fdt_getprop(dtb, node, "bootargs", NULL);
    if (bootargs) {
        strlcpy(boot_command_line, bootargs, COMMAND_LINE_SIZE);
        parse_early_param();
    }

    // Extract initrd information
    unsigned long initrd_start, initrd_end;
    const __be32 *prop;
    int len;

    prop = fdt_getprop(dtb, node, "linux,initrd-start", &len);
    if (prop && len == sizeof(__be32)) {
        initrd_start = fdt32_to_cpu(prop[0]);
    }

    prop = fdt_getprop(dtb, node, "linux,initrd-end", &len);
    if (prop && len == sizeof(__be32)) {
        initrd_end = fdt32_to_cpu(prop[0]);
        initrd_size = initrd_end - initrd_start;
    }
}
```

**Explanation**:

- **DTB address** passed in a1 register as physical address
- **Chosen node** bootloader updates chosen node with boot parameters
- **Boot arguments** kernel command line passed via device tree
- **Initramfs info** initramfs location in chosen node
- **Early parsing** kernel parses device tree early in boot

## U-Boot Specific Interface

**What**: U-Boot bootloader has specific conventions and commands for RISC-V.

**How**: U-Boot interface works:

```c
// Example: U-Boot environment variables for RISC-V
// U-Boot uses environment variables to configure boot:
// - kernel_addr_r: Kernel load address
// - fdt_addr_r: Device tree load address
// - initrd_addr_r: Initramfs load address
// - bootargs: Kernel command line arguments

// Example: U-Boot boot script
// bootcmd: Command executed on boot
/*
bootcmd=load mmc 0:1 ${kernel_addr_r} Image; \
        load mmc 0:1 ${fdt_addr_r} visionfive2.dtb; \
        load mmc 0:1 ${initrd_addr_r} initrd.img; \
        booti ${kernel_addr_r} ${initrd_addr_r}:${filesize} ${fdt_addr_r}
*/

// Example: U-Boot booti command implementation (simplified)
int u_boot_booti(unsigned long kernel_addr, unsigned long initrd_addr,
                 unsigned long initrd_size, unsigned long fdt_addr) {
    unsigned long kernel_entry;
    unsigned long hart_id;

    // Verify kernel image
    kernel_entry = get_kernel_entry(kernel_addr);
    if (!kernel_entry) {
        printf("Invalid kernel image\n");
        return -1;
    }

    // Get hardware thread ID
    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Prepare kernel parameters in registers
    // a0 = hart_id
    // a1 = fdt_addr

    // Disable interrupts
    __asm__ volatile("csrci mstatus, 8");

    // Flush caches
    flush_cache_all();

    // Jump to kernel
    __asm__ volatile(
        "mv a0, %0\n"      // hart_id
        "mv a1, %1\n"      // fdt_addr
        "jr %2"            // kernel_entry
        :
        : "r"(hart_id), "r"(fdt_addr), "r"(kernel_entry)
        : "a0", "a1", "memory"
    );

    return 0;
}

// Example: U-Boot command line configuration
// U-Boot prompt commands:
// => setenv kernel_addr_r 0x80200000
// => setenv fdt_addr_r 0x8F000000
// => setenv initrd_addr_r 0x8F400000
// => setenv bootargs "console=ttyS0,115200 root=/dev/mmcblk0p2"
// => saveenv
```

**Explanation**:

- **Environment variables** U-Boot uses env vars for boot configuration
- **bootcmd** automatic boot command executed on power-on
- **booti command** U-Boot command to boot Linux kernel
- **Address configuration** configure load addresses via env vars
- **Boot arguments** kernel command line via bootargs

## Kernel Command Line

**What**: Kernel command line arguments are passed via device tree chosen node.

**How**: Command line passing works:

```c
// Example: Kernel command line setup
// Command line passed via device tree: /chosen/bootargs property

// Example: Bootloader setting command line
void bootloader_set_bootargs(const char *cmdline) {
    void *dtb = (void *)DTB_LOAD_ADDR;
    int node;

    node = fdt_path_offset(dtb, "/chosen");
    if (node < 0) {
        node = fdt_add_subnode(dtb, 0, "chosen");
    }

    // Set bootargs property
    fdt_setprop_string(dtb, node, "bootargs", cmdline);

    // Repack device tree
    fdt_pack(dtb);
}

// Example: Kernel parsing command line
void kernel_parse_cmdline(void) {
    void *dtb = initial_boot_params;
    int node;
    const char *bootargs;

    // Get bootargs from device tree
    node = fdt_path_offset(dtb, "/chosen");
    if (node >= 0) {
        bootargs = fdt_getprop(dtb, node, "bootargs", NULL);
        if (bootargs) {
            strlcpy(boot_command_line, bootargs, COMMAND_LINE_SIZE);
        }
    }

    // If no bootargs in device tree, use default
    if (!bootargs || strlen(bootargs) == 0) {
        strlcpy(boot_command_line, DEFAULT_COMMAND_LINE, COMMAND_LINE_SIZE);
    }

    // Parse early parameters
    parse_early_param();
}

// Example: Common RISC-V kernel command line options
// console=ttyS0,115200    - Serial console configuration
// root=/dev/mmcblk0p2     - Root filesystem device
// rootfstype=ext4         - Root filesystem type
// rootwait                 - Wait for root device
// init=/bin/sh            - Init program
// quiet                    - Reduce kernel messages
// loglevel=7              - Kernel log level
// earlyprintk              - Early printk support

// Example: Command line from U-Boot
const char *example_bootargs =
    "console=ttyS0,115200 "
    "root=/dev/mmcblk0p2 "
    "rootfstype=ext4 "
    "rootwait "
    "quiet";
```

**Explanation**:

- **Device tree property** bootargs in /chosen node
- **Early parsing** kernel parses command line early
- **Default values** fallback to defaults if not provided
- **Common options** standard Linux kernel command line options
- **U-Boot integration** U-Boot passes via bootargs environment variable

## Next Steps

**What** you're ready for next:

After understanding bootloader interface, you should be ready to:

1. **Learn Kernel Entry Points** - Different kernel entry scenarios
2. **Study Early Memory Setup** - Memory initialization during boot
3. **Understand Device Tree** - Detailed device tree parsing
4. **Explore U-Boot Configuration** - Advanced bootloader configuration
5. **Begin Debugging** - Debug bootloader-kernel interface issues

**Where** to go next:

Continue with the next lesson on **"Kernel Entry Points"** to learn:

- Primary and secondary CPU entry points
- Exception entry points
- Kernel relocation
- Position-independent kernel
- Entry point debugging

**Why** the next lesson is important:

Understanding kernel entry points is essential for understanding how the kernel initializes and how different CPUs enter the kernel.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel entry code
2. **Use U-Boot** - Configure U-Boot bootloader
3. **Debug Boot** - Use debugger to trace entry points
4. **Modify Parameters** - Experiment with boot parameters
5. **Read Documentation** - Study RISC-V boot protocol

## Resources

**Official Documentation**:

- [RISC-V Linux Boot Protocol](https://github.com/riscv/riscv-linux) - Boot protocol specification
- [U-Boot Documentation](https://u-boot.readthedocs.io/) - U-Boot bootloader
- [Device Tree Specification](https://devicetree.org/) - Device tree format

**Kernel Sources**:

- [Linux RISC-V Kernel Entry](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel entry code
