---
sidebar_position: 1
---

# Exception Vector

Master RISC-V exception vector setup that defines where the CPU jumps when exceptions or interrupts occur, understanding exception vector configuration, modes, and handler setup essential for kernel exception handling.

## What Is an Exception Vector?

**What**: Exception vector is the address where the CPU automatically jumps when an exception or interrupt occurs. On RISC-V, this is configured via the stvec (Supervisor Trap Vector) or mtvec (Machine Trap Vector) CSR, which stores the base address and mode of the exception handler.

**Why**: Understanding exception vectors is crucial because:

- **Exception Entry** - Determines where exception handling begins
- **Handler Setup** - Must configure vectors correctly for handlers
- **Performance** - Vector mode can improve exception dispatch performance
- **Debugging** - Vector configuration affects exception debugging
- **Kernel Initialization** - Early kernel setup requires vector configuration
- **Security** - Vector setup affects security boundaries

**When**: Exception vectors are used when:

- **Exception Occurrence** - CPU jumps to vector on exception
- **Interrupt Arrival** - CPU jumps to vector on interrupt
- **Kernel Initialization** - Kernel sets up vectors during boot
- **Handler Installation** - Installing exception handlers
- **Mode Switching** - Changing exception handling modes
- **Debugging** - Debugging exception handling flow

**How**: Exception vectors work through:

- **stvec/mtvec CSR** - Control and Status Registers store vector address
- **Vector Modes** - Direct mode or vectored mode
- **Address Calculation** - Vector address calculated based on mode
- **Handler Jump** - CPU automatically jumps to vector address
- **Handler Execution** - Exception handler executes at vector address

**Where**: Exception vectors are found in:

- **Kernel Initialization** - arch/riscv/kernel/head.S, entry.S
- **Exception Handlers** - arch/riscv/kernel/entry.S
- **Interrupt Code** - Interrupt handler setup code
- **Boot Code** - Early boot exception setup
- **Debugging** - Exception entry points

## Exception Vector Registers

**What**: RISC-V provides exception vector CSRs (stvec for supervisor mode, mtvec for machine mode) that control exception handling.

**How**: Vector registers work:

```c
// Example: Exception vector CSRs
// stvec: Supervisor Trap Vector Base Address Register
// mtvec: Machine Trap Vector Base Address Register

// Vector register format:
// [1:0] - Mode bits
//   00: Direct mode - All exceptions jump to base address
//   01: Vectored mode - Exceptions jump to base + (4 * cause)
// [XLEN-1:2] - Base address (must be 4-byte aligned)

#define VECTOR_MODE_DIRECT   0
#define VECTOR_MODE_VECTORED  1

// Example: Reading exception vector
unsigned long get_exception_vector(bool supervisor_mode) {
    unsigned long vector;

    if (supervisor_mode) {
        __asm__ volatile("csrr %0, stvec" : "=r"(vector));
    } else {
        __asm__ volatile("csrr %0, mtvec" : "=r"(vector));
    }

    return vector;
}

// Example: Setting exception vector (direct mode)
void set_exception_vector_direct(void (*handler)(void), bool supervisor_mode) {
    unsigned long vector;

    // Base address (must be 4-byte aligned)
    vector = (unsigned long)handler;
    vector &= ~0x3;  // Clear mode bits, ensure alignment

    // Mode = 00 (direct mode)
    // Mode bits already cleared by alignment

    if (supervisor_mode) {
        __asm__ volatile("csrw stvec, %0" : : "r"(vector));
    } else {
        __asm__ volatile("csrw mtvec, %0" : : "r"(vector));
    }
}

// Example: Setting exception vector (vectored mode)
void set_exception_vector_vectored(void (*base_handler)(void),
                                   bool supervisor_mode) {
    unsigned long vector;

    // Base address
    vector = (unsigned long)base_handler;
    vector &= ~0x3;  // Clear lower 2 bits

    // Set mode = 01 (vectored mode)
    vector |= 0x1;

    if (supervisor_mode) {
        __asm__ volatile("csrw stvec, %0" : : "r"(vector));
    } else {
        __asm__ volatile("csrw mtvec, %0" : : "r"(vector));
    }
}

// Example: Extracting vector information
void parse_exception_vector(unsigned long vector, unsigned long *base,
                           int *mode) {
    // Extract mode bits [1:0]
    *mode = vector & 0x3;

    // Extract base address [XLEN-1:2]
    *base = vector & ~0x3;
}

// Example: Kernel exception vector setup
void setup_kernel_exception_vectors(void) {
    extern void handle_supervisor_trap(void);

    // Set supervisor mode exception vector
    set_exception_vector_direct(handle_supervisor_trap, true);

    pr_info("Exception vector set to %p\n", handle_supervisor_trap);
}
```

**Explanation**:

- **Vector CSRs** stvec for supervisor, mtvec for machine mode
- **Direct mode** all exceptions jump to same address
- **Vectored mode** exceptions jump to different addresses based on cause
- **Alignment** vector addresses must be 4-byte aligned
- **Mode encoding** mode encoded in lowest 2 bits of vector address

## Direct Mode

**What**: Direct mode uses a single exception handler address for all exceptions and interrupts.

**Why**: Direct mode is important because:

- **Simplicity** - Single handler address, simpler setup
- **Code Size** - Smaller code footprint
- **Kernel Usage** - Linux kernel typically uses direct mode
- **Flexibility** - Handler can dispatch based on cause code
- **Debugging** - Easier to debug single entry point

**How**: Direct mode works:

```c
// Example: Direct mode exception handler
// All exceptions and interrupts jump to same address
// Handler dispatches based on cause code

// Exception handler entry point
void handle_supervisor_trap(struct pt_regs *regs) {
    unsigned long scause, sepc, stval, sstatus;

    // Read exception CSRs
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Store in pt_regs structure
    regs->epc = sepc;
    regs->cause = scause;
    regs->tval = stval;
    regs->status = sstatus;

    // Dispatch based on cause
    if (scause & CAUSE_INTERRUPT) {
        // Interrupt (bit 31 set)
        handle_interrupt(scause & ~CAUSE_INTERRUPT, regs);
    } else {
        // Exception (bit 31 clear)
        handle_exception(scause, sepc, stval, regs);
    }

    // Return from exception (SRET instruction)
    return_from_exception(regs);
}

// Example: Exception dispatch in direct mode
void handle_exception(unsigned long cause, unsigned long epc,
                     unsigned long tval, struct pt_regs *regs) {
    // Check exception type from cause code
    switch (cause) {
        case CAUSE_ILLEGAL_INSTRUCTION:
            do_illegal_instruction(epc, tval, regs);
            break;

        case CAUSE_INSTRUCTION_ACCESS_FAULT:
            do_instruction_access_fault(epc, tval, regs);
            break;

        case CAUSE_LOAD_ACCESS_FAULT:
            do_load_access_fault(epc, tval, regs);
            break;

        case CAUSE_STORE_ACCESS_FAULT:
            do_store_access_fault(epc, tval, regs);
            break;

        case CAUSE_USER_ECALL:
            do_syscall(regs);  // System call
            break;

        case CAUSE_INSTRUCTION_PAGE_FAULT:
            do_page_fault(epc, tval, regs, false, false);
            break;

        case CAUSE_LOAD_PAGE_FAULT:
            do_page_fault(epc, tval, regs, false, true);
            break;

        case CAUSE_STORE_PAGE_FAULT:
            do_page_fault(epc, tval, regs, true, true);
            break;

        default:
            do_unknown_exception(cause, epc, tval, regs);
            break;
    }
}

// Example: Setting up direct mode
void setup_direct_mode(void) {
    extern void handle_supervisor_trap(void);

    // Set vector in direct mode
    unsigned long stvec = (unsigned long)handle_supervisor_trap;
    stvec &= ~0x3;  // Clear mode bits (direct mode = 0)

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));
}
```

**Explanation**:

- **Single handler** all exceptions go to same handler address
- **Cause-based dispatch** handler checks cause code to route
- **Flexibility** handler can implement any dispatch logic
- **Common usage** kernel typically uses direct mode
- **Simple setup** easier to configure than vectored mode

## Vectored Mode

**What**: Vectored mode uses different handler addresses for different exception causes, calculated as base + (4 \* cause).

**Why**: Vectored mode is important because:

- **Performance** - Direct jump to specific handler, no dispatch needed
- **Real-Time** - Lower latency for exception handling
- **Efficiency** - Avoids cause code checking
- **Hardware Support** - Hardware calculates handler address
- **Specialized Systems** - Useful for real-time systems

**How**: Vectored mode works:

```c
// Example: Vectored mode exception handler table
// Exception cause is used as index into handler table
// Handler address = base + (4 * cause)

// Exception handler table (assembly)
void exception_vector_table(void) {
    // Each handler is 4 bytes (1 instruction: J to actual handler)
    // Actual handlers follow table

    __asm__ volatile(
        "j handle_misaligned_fetch\n"
        ".align 4\n"                    // Align to 4 bytes
        "j handle_fetch_access_fault\n"
        ".align 4\n"
        "j handle_illegal_instruction\n"
        ".align 4\n"
        "j handle_breakpoint\n"
        ".align 4\n"
        "j handle_misaligned_load\n"
        ".align 4\n"
        "j handle_load_access_fault\n"
        ".align 4\n"
        "j handle_misaligned_store\n"
        ".align 4\n"
        "j handle_store_access_fault\n"
        ".align 4\n"
        "j handle_user_ecall\n"        // System call
        ".align 4\n"
        "j handle_supervisor_ecall\n"
        ".align 4\n"
        "j handle_machine_ecall\n"
        ".align 4\n"
        "j handle_instruction_page_fault\n"
        ".align 4\n"
        "j handle_load_page_fault\n"
        ".align 4\n"
        "j handle_store_page_fault\n"
        ".align 4\n"
        // ... more handlers for interrupts
    );
}

// Example: Vectored mode handler
// Each handler is at base + (4 * cause)
void handle_illegal_instruction_vector(void) {
    // This handler is called directly for illegal instruction exception
    // No need to check cause code

    struct pt_regs *regs = get_pt_regs();
    unsigned long sepc, stval;

    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));

    // Handle illegal instruction directly
    do_illegal_instruction(sepc, stval, regs);

    return_from_exception(regs);
}

// Example: Setting up vectored mode
void setup_vectored_mode(void) {
    extern void exception_vector_table(void);

    // Set vector in vectored mode
    unsigned long stvec = (unsigned long)exception_vector_table;
    stvec &= ~0x3;  // Clear mode bits
    stvec |= 0x1;   // Set vectored mode (01)

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));
}

// Example: Vector table alignment requirements
// Vector table must be aligned to handle table size
// Typical: align to 256 bytes for up to 64 exceptions/interrupts
void setup_aligned_vector_table(void) {
    extern char exception_vector_table_start[];

    // Ensure table is properly aligned
    unsigned long base = (unsigned long)exception_vector_table_start;
    base = ALIGN(base, 256);  // Align to 256 bytes

    unsigned long stvec = base;
    stvec |= 0x1;  // Vectored mode

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));
}
```

**Explanation**:

- **Handler table** table of jump instructions to handlers
- **Direct jumps** CPU jumps directly to cause-specific handler
- **No dispatch** no need to check cause code in handler
- **Performance** faster exception handling
- **Alignment** table must be properly aligned

## Exception Vector Initialization

**What**: Exception vectors must be initialized early in kernel boot.

**How**: Vector initialization works:

```c
// Example: Early exception vector setup
void setup_early_exception_vectors(void) {
    extern void handle_early_trap(void);

    // Set up very early exception handler
    // This runs before full exception handling is ready
    unsigned long stvec = (unsigned long)handle_early_trap;
    stvec &= ~0x3;

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));
}

// Example: Early exception handler (minimal)
void handle_early_trap(struct pt_regs *regs) {
    unsigned long scause, sepc;

    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));

    // Very early handling - minimal functionality
    // Before console, memory allocator, etc. are ready

    // Just halt or loop for now
    // Full handler installed later
    early_panic("Early exception: cause=%lu, epc=%p\n",
                scause, (void *)sepc);
}

// Example: Full exception vector setup
void setup_exception_vectors(void) {
    extern void handle_supervisor_trap(void);

    // Setup full exception handler
    unsigned long stvec = (unsigned long)handle_supervisor_trap;
    stvec &= ~0x3;  // Direct mode

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));

    // Flush instruction cache (if needed)
    // Ensure handler code is visible
    __asm__ volatile("fence.i");

    pr_info("Exception vector configured: %p\n", handle_supervisor_trap);
}

// Example: Per-CPU exception vector setup (SMP)
void setup_per_cpu_exception_vectors(void) {
    unsigned long cpu;

    for_each_possible_cpu(cpu) {
        // Each CPU can have its own exception handler
        // Or share same handler (typical)

        // For now, all CPUs use same handler
        setup_exception_vectors();
    }
}

// Example: Changing exception vector dynamically
void update_exception_vector(void (*new_handler)(void)) {
    unsigned long stvec;

    // Disable interrupts during vector update
    local_irq_disable();

    // Update vector
    stvec = (unsigned long)new_handler;
    stvec &= ~0x3;
    __asm__ volatile("csrw stvec, %0" : : "r"(stvec));

    // Memory barrier
    smp_mb();

    // Re-enable interrupts
    local_irq_enable();
}
```

**Explanation**:

- **Early setup** vectors set up very early in boot
- **Minimal handler** early handler has minimal functionality
- **Full handler** full exception handler installed later
- **SMP setup** each CPU can have own vector or share
- **Dynamic update** vectors can be changed dynamically

## Exception Vector Debugging

**What**: Debugging exception vector setup and execution helps identify exception handling issues.

**How**: Vector debugging works:

```c
// Example: Verifying exception vector setup
void verify_exception_vector(void) {
    unsigned long stvec, expected;
    int mode;

    // Read current vector
    __asm__ volatile("csrr %0, stvec" : "=r"(stvec));

    // Expected vector
    expected = (unsigned long)handle_supervisor_trap;
    expected &= ~0x3;

    // Extract mode
    mode = stvec & 0x3;

    // Verify
    if ((stvec & ~0x3) != expected) {
        pr_err("Exception vector mismatch: got %p, expected %p\n",
               (void *)(stvec & ~0x3), (void *)expected);
    }

    if (mode != VECTOR_MODE_DIRECT) {
        pr_warn("Exception vector not in direct mode: mode=%d\n", mode);
    }

    pr_info("Exception vector: %p, mode=%d\n",
            (void *)(stvec & ~0x3), mode);
}

// Example: Exception vector tracing
void trace_exception_vector(unsigned long scause, unsigned long sepc) {
    unsigned long stvec;
    unsigned long handler_addr;

    __asm__ volatile("csrr %0, stvec" : "=r"(stvec));

    // Calculate handler address (for vectored mode)
    int mode = stvec & 0x3;
    handler_addr = stvec & ~0x3;

    if (mode == VECTOR_MODE_VECTORED) {
        handler_addr += 4 * (scause & 0x7F);  // Only for exceptions, not interrupts
    }

    pr_debug("Exception vector trace:\n");
    pr_debug("  stvec=%016lx\n", stvec);
    pr_debug("  mode=%d\n", mode);
    pr_debug("  cause=%lu\n", scause);
    pr_debug("  handler=%p\n", (void *)handler_addr);
    pr_debug("  epc=%p\n", (void *)sepc);
}

// Example: Exception vector breakpoint
void debug_exception_vector(void) {
    extern void handle_supervisor_trap(void);

    // Set breakpoint at exception handler
    // (Using GDB or hardware breakpoint)
    pr_info("Exception handler at %p\n", handle_supervisor_trap);
    pr_info("Set breakpoint here for debugging\n");
}
```

**Explanation**:

- **Verification** verify vector is set correctly
- **Tracing** trace exception vector access
- **Debugging** use debugger to inspect vectors
- **Breakpoints** set breakpoints at handlers
- **Logging** log vector configuration and access

## Next Steps

**What** you're ready for next:

After understanding exception vectors, you should be ready to:

1. **Learn Interrupt Controller** - PLIC and CLINT interaction
2. **Study Exception Context** - Register saving and restoration
3. **Understand Kernel Entry/Exit** - Kernel entry and exit mechanisms
4. **Explore Nested Exceptions** - Handling nested exceptions
5. **Begin Exception Handling** - Write exception handlers

**Where** to go next:

Continue with the next lesson on **"Interrupt Controller"** to learn:

- PLIC (Platform-Level Interrupt Controller) architecture
- CLINT (Core-Local Interruptor) architecture
- Interrupt routing and distribution
- Interrupt controller drivers
- Interrupt controller configuration

**Why** the next lesson is important:

Interrupt controllers are essential for handling external interrupts. Understanding PLIC and CLINT is crucial for RISC-V kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine interrupt controller code
2. **Read Specs** - Study RISC-V interrupt controller specifications
3. **Use Hardware** - Test on RISC-V hardware
4. **Debug Interrupts** - Debug interrupt handling flow
5. **Write Drivers** - Write interrupt controller drivers

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Interrupts](https://github.com/riscv/riscv-isa-manual) - Interrupt specification
- [RISC-V Platform Specification](https://github.com/riscv/riscv-platform-specs) - Platform specs

**Kernel Sources**:

- [Linux RISC-V Exception Handlers](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Exception code
