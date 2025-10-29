---
sidebar_position: 3
---

# Kernel Entry Points

Master RISC-V Linux kernel entry points including primary and secondary CPU boot, exception handlers, and kernel relocation mechanisms essential for understanding how the kernel initializes and how different execution paths enter the kernel.

## What Are Kernel Entry Points?

**What**: Kernel entry points are specific memory addresses where the kernel code begins execution. On RISC-V, there are multiple entry points: the primary boot entry point (from bootloader), secondary CPU entry points (for SMP systems), exception entry points, and interrupt entry points.

**Why**: Understanding kernel entry points is crucial because:

- **Kernel Initialization** - Entry points determine how kernel starts
- **SMP Boot** - Multiple CPUs need different entry paths
- **Exception Handling** - Exception handlers are entry points
- **Relocation** - Kernel may relocate to different addresses
- **Debugging** - Entry points are where debugging often starts
- **Architecture Understanding** - Fundamental to kernel architecture

**When**: Kernel entry points are used when:

- **System Boot** - Primary CPU enters kernel from bootloader
- **Secondary CPU Boot** - Additional CPUs start in SMP systems
- **Exceptions** - CPU enters kernel via exception handlers
- **Interrupts** - Hardware interrupts enter kernel
- **System Calls** - User programs invoke kernel via system calls
- **Relocation** - Kernel relocates itself to different address

**How**: Kernel entry points work through:

- **Entry Address** - Fixed or calculated entry point address
- **Register Setup** - Registers prepared before entry
- **Stack Setup** - Stack pointer initialized at entry
- **State Initialization** - Initial CPU state configured
- **Bootstrap Code** - Assembly code at entry point
- **C Code Transition** - Transition from assembly to C

**Where**: Kernel entry points are found in:

- **Primary Entry** - Kernel startup code (arch/riscv/kernel/head.S)
- **Secondary Entry** - SMP startup code
- **Exception Vectors** - Exception handler entry points
- **Interrupt Vectors** - Interrupt handler entry points
- **System Call Entry** - System call handler entry
- **Relocation Code** - Kernel relocation entry points

## Primary Kernel Entry Point

**What**: The primary kernel entry point is where the first CPU (boot CPU) enters the kernel from the bootloader.

**How**: Primary entry works:

```c
// Example: RISC-V primary kernel entry point
// Located at: arch/riscv/kernel/head.S
// Symbol: _start (kernel entry symbol)

// Entry point assembly structure:
.section .text.head, "ax"
.global _start
_start:
    // Parameters from bootloader:
    // a0: hart_id (hardware thread ID)
    // a1: dtb_addr (device tree blob physical address)

    // Save boot parameters immediately
    // (Registers may be modified by following code)
    la t0, boot_hart_id
    sd a0, 0(t0)          // Save hart_id

    la t0, boot_dtb_addr
    sd a1, 0(t0)          // Save dtb_addr

    // Disable interrupts
    csrci sstatus, 2      // Clear SIE (Supervisor Interrupt Enable)

    // Set up early stack
    la sp, init_stack
    addi sp, sp, STACK_SIZE

    // Clear BSS section (uninitialized data)
    la t0, __bss_start
    la t1, __bss_stop

clear_bss:
    beq t0, t1, bss_cleared
    sd zero, 0(t0)
    addi t0, t0, 8
    j clear_bss

bss_cleared:
    // Early CPU initialization
    call riscv_cpu_init

    // Setup virtual memory (early page tables)
    call setup_early_vm

    // Relocate kernel if needed (position-independent)
    call relocate

    // Jump to C code initialization
    call early_init_c

    // Should not return, but loop if it does
loop_here:
    wfi                    // Wait for interrupt
    j loop_here

// Example: C entry point called from assembly
void early_init_c(void) {
    unsigned long hart_id = boot_hart_id;
    unsigned long dtb_addr = boot_dtb_addr;

    // Initialize early console (SBI)
    early_console_init();

    // Print boot message
    printk("Linux version %s\n", UTS_RELEASE);
    printk("Boot CPU: hart_id=%lu\n", hart_id);

    // Parse device tree
    if (dtb_addr) {
        early_init_dt_scan(__va(dtb_addr));
    }

    // Initialize memory
    setup_bootmem();

    // Setup initial page tables
    setup_initial_pgtable();

    // Enable MMU (virtual memory)
    enable_mmu();

    // Continue with main kernel initialization
    start_kernel();
}

// Example: Entry point address determination
unsigned long get_kernel_entry_point(void) {
    // For relocatable kernel:
    // Entry point = load address + _start offset

    unsigned long load_addr = KERNEL_LOAD_ADDR;
    unsigned long entry_symbol = (unsigned long)_start;

    return load_addr + (entry_symbol - KERNEL_TEXT_START);
}

// Example: Entry point verification
bool verify_entry_point(unsigned long entry_addr) {
    // Check if entry address is valid
    // Verify it's in kernel text region

    if (entry_addr < KERNEL_TEXT_START || entry_addr > KERNEL_TEXT_END) {
        return false;
    }

    // Verify entry point instruction
    // Should be valid RISC-V instruction
    unsigned int first_insn = *(unsigned int *)entry_addr;

    // Check instruction encoding (simplified)
    if ((first_insn & 0x7F) == 0x67) {  // JAL instruction
        return true;
    }

    // Or other valid entry patterns
    return true;
}
```

**Explanation**:

- **Entry symbol** \_start is the primary entry point symbol
- **Register parameters** a0 and a1 contain boot parameters
- **Early initialization** entry code does minimal setup
- **Stack setup** stack must be set up before C code
- **BSS clearing** uninitialized data section cleared
- **C transition** assembly code calls C initialization

## Secondary CPU Entry Points

**What**: Secondary CPU entry points are where additional CPUs enter the kernel in SMP (Symmetric Multiprocessing) systems.

**How**: Secondary CPU entry works:

```c
// Example: Secondary CPU entry point
// Secondary CPUs don't boot from bootloader
// They're woken up by primary CPU and jump to kernel entry

// Secondary CPU entry point (arch/riscv/kernel/smpboot.c)
void secondary_cpu_entry(unsigned long hart_id) {
    // Secondary CPU starts here
    // hart_id identifies this CPU

    // Disable interrupts
    __asm__ volatile("csrci sstatus, 2");

    // Set up per-CPU stack
    unsigned long stack_base = per_cpu_stack_base(hart_id);
    __asm__ volatile("mv sp, %0" : : "r"(stack_base));

    // Initialize CPU-specific data
    setup_per_cpu_areas(hart_id);

    // Initialize CPU features
    riscv_cpu_init_secondary(hart_id);

    // Setup page tables (secondary CPUs use same kernel mappings)
    setup_secondary_pgtable();

    // Enable MMU
    enable_mmu();

    // Notify primary CPU that this CPU is ready
    set_cpu_online(hart_id, true);

    // Initialize CPU-specific subsystems
    smp_callin();

    // Enter idle loop
    cpu_startup_entry();
}

// Example: Waking up secondary CPUs
void wakeup_secondary_cpus(void) {
    unsigned long num_harts = get_num_harts();
    unsigned long boot_hart = get_boot_hart();

    for (unsigned long hart = 0; hart < num_harts; hart++) {
        if (hart == boot_hart) {
            continue;  // Skip boot CPU
        }

        // Set secondary CPU entry point
        unsigned long entry_addr = (unsigned long)secondary_cpu_entry;

        // Wake up CPU using SBI or platform-specific method
        wakeup_hart(hart, entry_addr);
    }
}

// Example: Platform-specific CPU wakeup
void wakeup_hart(unsigned long hart_id, unsigned long entry_addr) {
    // Use SBI to start secondary CPU
    struct sbiret ret;

    ret = sbi_hsm_hart_start(hart_id, entry_addr, 0);

    if (ret.error != 0) {
        pr_err("Failed to start hart %lu: %d\n", hart_id, ret.error);
        return;
    }

    // Wait for CPU to come online
    wait_for_cpu_online(hart_id);
}

// Example: CPU startup synchronization
void wait_for_cpu_online(unsigned long hart_id) {
    unsigned long timeout = jiffies + HZ;  // 1 second timeout

    while (!cpu_online(hart_id)) {
        if (time_after(jiffies, timeout)) {
            pr_warn("CPU %lu failed to come online\n", hart_id);
            return;
        }
        cpu_relax();
    }

    pr_info("CPU %lu is now online\n", hart_id);
}

// Example: Per-CPU initialization
void setup_per_cpu_areas(unsigned long hart_id) {
    // Each CPU needs its own per-CPU data area
    void *per_cpu_base = __per_cpu_start + (hart_id * PER_CPU_SIZE);

    // Initialize per-CPU variables
    init_per_cpu_data(hart_id, per_cpu_base);

    // Set thread pointer (tp register) for per-CPU access
    __asm__ volatile("mv tp, %0" : : "r"(per_cpu_base));
}
```

**Explanation**:

- **Separate entry** secondary CPUs have different entry point
- **Hart ID** each CPU identified by hardware thread ID
- **Wakeup mechanism** primary CPU wakes secondary CPUs
- **Synchronization** secondary CPUs wait for configuration
- **Per-CPU setup** each CPU gets own per-CPU data area

## Exception Entry Points

**What**: Exception entry points are where the CPU jumps when exceptions or interrupts occur.

**How**: Exception entry points work:

```c
// Example: Exception entry point setup
// Exception vector configured via stvec CSR (Supervisor Trap Vector)

// Exception vector modes:
// Direct mode (stvec[1:0] = 0): All exceptions jump to base address
// Vector mode (stvec[1:0] = 1): Exceptions jump to base + (4 * cause)

// Example: Setting up exception vector
void setup_exception_vector(void) {
    unsigned long stvec_value;

    // Use direct mode (simpler, kernel uses this)
    stvec_value = (unsigned long)handle_exception;
    stvec_value &= ~0x3;  // Clear mode bits (ensure direct mode)

    // Write stvec register
    __asm__ volatile("csrw stvec, %0" : : "r"(stvec_value));
}

// Example: Exception entry handler
// This is called when exception occurs
void handle_exception(struct pt_regs *regs) {
    unsigned long scause, sepc, stval, sstatus;

    // Read exception CSRs (automatically saved by CPU)
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Store in pt_regs structure
    regs->epc = sepc;
    regs->cause = scause;
    regs->tval = stval;
    regs->status = sstatus;

    // Save remaining registers (assembly does this)
    // Then call C handler

    if (scause & CAUSE_INTERRUPT) {
        // Interrupt (bit 31 set)
        handle_interrupt(scause & ~CAUSE_INTERRUPT, regs);
    } else {
        // Exception (bit 31 clear)
        handle_exception_type(scause, sepc, stval, regs);
    }
}

// Example: Interrupt entry point
void handle_interrupt(unsigned int irq, struct pt_regs *regs) {
    // Interrupt handler entry

    // Check interrupt type
    switch (irq) {
        case IRQ_S_TIMER:
            handle_timer_interrupt(regs);
            break;
        case IRQ_S_EXT:
            handle_external_interrupt(regs);
            break;
        case IRQ_S_SOFT:
            handle_software_interrupt(regs);
            break;
        default:
            pr_warn("Unknown interrupt: %u\n", irq);
            break;
    }
}

// Example: System call entry point
void handle_system_call(struct pt_regs *regs) {
    // System call entry (from user mode via ECALL)

    unsigned long syscall_num = regs->a7;  // System call number
    unsigned long args[6] = {
        regs->a0, regs->a1, regs->a2,
        regs->a3, regs->a4, regs->a5
    };

    // Validate system call number
    if (syscall_num >= NR_syscalls) {
        regs->a0 = -ENOSYS;
        return;
    }

    // Dispatch to system call handler
    long ret = sys_call_table[syscall_num](args[0], args[1], args[2],
                                           args[3], args[4], args[5]);

    // Return value in a0
    regs->a0 = ret;

    // Advance PC past ECALL instruction
    regs->epc += 4;
}
```

**Explanation**:

- **stvec register** controls exception entry point
- **Direct mode** all exceptions go to same handler
- **Vector mode** different exceptions go to different handlers
- **CSR access** exception CSRs contain exception information
- **Register saving** exception handler must save registers

## Kernel Relocation

**What**: Kernel relocation moves the kernel from its load address to its link address, enabling position-independent kernels.

**How**: Kernel relocation works:

```c
// Example: Kernel relocation entry point
// If kernel is compiled as PIC (Position Independent Code),
// it can run from any address and relocate itself

// Example: Relocation check and execution
void relocate(void) {
    unsigned long load_addr = get_kernel_load_addr();
    unsigned long link_addr = (unsigned long)_start;
    unsigned long delta = load_addr - link_addr;

    // If kernel is already at link address, no relocation needed
    if (delta == 0) {
        return;
    }

    // Check if relocation is supported
    if (!is_kernel_relocatable()) {
        // Kernel not relocatable, must be at link address
        if (delta != 0) {
            panic("Kernel must be loaded at link address");
        }
        return;
    }

    // Relocate kernel
    relocate_kernel(delta);

    // Jump to relocated kernel
    jump_to_relocated_kernel();
}

// Example: Kernel relocation implementation
void relocate_kernel(unsigned long delta) {
    // Relocate kernel sections:
    // 1. Text section (code)
    // 2. Data section (initialized data)
    // 3. Relocation entries

    // Get relocation entries
    extern unsigned long __rela_start[];
    extern unsigned long __rela_end[];

    // Apply relocations
    for (unsigned long *rela = __rela_start; rela < __rela_end; rela += 3) {
        unsigned long offset = rela[0];
        unsigned long type = (rela[1] >> 32) & 0xFFFFFFFF;
        unsigned long addend = rela[2];

        // Calculate new address
        unsigned long addr = (unsigned long)_start + offset + delta;

        // Apply relocation based on type
        switch (type) {
            case R_RISCV_RELATIVE:
                // Relative relocation: add delta to value
                *(unsigned long *)addr += delta;
                break;
            case R_RISCV_32:
                // 32-bit absolute: add delta
                *(unsigned int *)addr += delta;
                break;
            case R_RISCV_64:
                // 64-bit absolute: add delta
                *(unsigned long *)addr += delta;
                break;
            // ... other relocation types
        }
    }
}

// Example: Jump to relocated kernel
void jump_to_relocated_kernel(void) {
    unsigned long new_entry = (unsigned long)_start;

    // Flush caches
    flush_cache_all();

    // Jump to new entry point
    __asm__ volatile(
        "la ra, 1f\n"      // Return address
        "jr %0"            // Jump to new entry
        :
        : "r"(new_entry)
        : "ra", "memory"
    );

1:
    // Execution continues at relocated address
    // All references now use new address
}
```

**Explanation**:

- **Position independence** PIC kernel can run from any address
- **Relocation entries** ELF relocation entries need processing
- **Delta calculation** difference between load and link address
- **Section relocation** relocate code, data, and relocation entries
- **Cache flushing** must flush caches after relocation

## Entry Point Debugging

**What**: Debugging kernel entry points helps understand boot failures and initialization issues.

**How**: Entry point debugging works:

```c
// Example: Entry point debugging techniques

// 1. Early printk at entry point
void _start(void) {
    // Very early console output (before main console init)
    early_printk("Kernel entry: _start\n");
    early_printk("hart_id: %lu\n", boot_hart_id);
    early_printk("dtb_addr: %p\n", (void *)boot_dtb_addr);

    // Continue with normal initialization
    // ...
}

// Example: Entry point breakpoint (using GDB)
// In GDB, set breakpoint at entry:
// (gdb) break _start
// (gdb) target remote :1234  # Remote debugging via QEMU
// (gdb) continue

// Example: Entry point tracing
void trace_entry_point(const char *name, unsigned long addr,
                      unsigned long arg0, unsigned long arg1) {
    // Debug trace of entry point
    pr_debug("Entry: %s at %p (a0=%lx, a1=%lx)\n",
             name, (void *)addr, arg0, arg1);
}

// Example: Entry point validation
bool validate_entry_point(unsigned long addr, const char *name) {
    // Check entry point is valid
    if (addr == 0) {
        pr_err("%s: Invalid entry address 0\n", name);
        return false;
    }

    if (!is_kernel_text_address(addr)) {
        pr_err("%s: Entry address %p not in kernel text\n",
               name, (void *)addr);
        return false;
    }

    return true;
}

// Example: Entry point monitoring
void monitor_entry_points(void) {
    // Monitor all entry points during boot
    trace_entry_point("primary", (unsigned long)_start,
                     boot_hart_id, boot_dtb_addr);

    // Monitor secondary CPU entries
    for (int i = 0; i < num_harts; i++) {
        if (i != boot_hart) {
            trace_entry_point("secondary",
                            (unsigned long)secondary_cpu_entry,
                            i, 0);
        }
    }

    // Monitor exception entry
    unsigned long stvec;
    __asm__ volatile("csrr %0, stvec" : "=r"(stvec));
    trace_entry_point("exception", stvec, 0, 0);
}
```

**Explanation**:

- **Early printk** use early console for entry debugging
- **GDB debugging** set breakpoints at entry points
- **Entry tracing** trace all entry points during boot
- **Validation** validate entry addresses
- **Monitoring** monitor entry point usage

## Next Steps

**What** you're ready for next:

After understanding kernel entry points, you should be ready to:

1. **Learn Early Memory Setup** - Memory initialization during boot
2. **Study Page Tables** - Initial page table setup
3. **Understand MMU Enable** - Virtual memory activation
4. **Explore Debugging** - Advanced boot debugging techniques
5. **Begin Kernel Init** - Main kernel initialization flow

**Where** to go next:

Continue with the next lesson on **"Early Memory Setup"** to learn:

- Memory discovery during boot
- Early memory allocator
- Bootmem setup
- Memory zone initialization
- Page allocator initialization

**Why** the next lesson is important:

Early memory setup is critical for kernel initialization. Understanding memory initialization is essential before kernel can fully operate.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel entry and memory setup code
2. **Use Debugger** - Debug kernel entry points
3. **Trace Boot** - Trace complete boot sequence
4. **Modify Entry** - Experiment with entry point code
5. **Read Documentation** - Study RISC-V kernel boot documentation

## Resources

**Official Documentation**:

- [RISC-V Linux Kernel Boot](https://github.com/riscv/riscv-linux) - Kernel boot protocol
- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Kernel documentation

**Kernel Sources**:

- [Linux RISC-V Kernel Entry](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel entry code
