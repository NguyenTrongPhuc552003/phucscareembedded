---
sidebar_position: 4
---

# Exception Handling

Master RISC-V exception handling mechanisms that process errors, system calls, and external events, essential for understanding how the Linux kernel responds to exceptions and manages system operation.

## What Is Exception Handling?

**What**: Exception handling is the mechanism by which the processor responds to exceptional conditions such as illegal instructions, memory access faults, system calls, and external interrupts. The processor automatically saves context and transfers control to an exception handler.

**Why**: Exception handling is crucial because:

- **Error Recovery** - Handles processor and software errors gracefully
- **System Calls** - Enables user programs to invoke kernel services
- **Memory Protection** - Handles page faults for virtual memory
- **Interrupt Processing** - Processes hardware interrupts from devices
- **Security** - Enables controlled privilege transitions
- **Kernel Operation** - Fundamental to all kernel operations

**When**: Exception handling occurs when:

- **Illegal Instructions** - Unsupported or privileged instruction execution
- **Memory Faults** - Invalid memory access or page faults
- **System Calls** - ECALL instruction from user or supervisor mode
- **Interrupts** - Hardware interrupts from devices or timer
- **Breakpoints** - EBREAK instruction for debugging
- **Alignment Errors** - Misaligned memory access

**How**: Exception handling works through:

- **Automatic Save** - CPU saves PC, cause, and value to CSRs
- **Privilege Elevation** - CPU elevates privilege to handler privilege
- **Handler Invocation** - CPU jumps to exception handler
- **Context Save** - Handler saves remaining register state
- **Exception Processing** - Handler processes the exception
- **Context Restore** - Handler restores state and returns

**Where**: Exception handling is found in:

- **Kernel Code** - Exception handlers throughout kernel
- **System Calls** - Every system call uses exception handling
- **Page Fault Handling** - Virtual memory management
- **Interrupt Handlers** - Device and timer interrupt processing
- **Error Handling** - Kernel error recovery mechanisms
- **Debugging** - Breakpoint and debug exception handling

## Exception Types

**What**: RISC-V defines multiple exception types, each with a unique cause code identifying the reason for the exception.

**Why**: Exception types are important because:

- **Handler Dispatch** - Different handlers for different exceptions
- **Error Diagnosis** - Cause code identifies the specific problem
- **Recovery Strategy** - Different exceptions need different recovery
- **Security** - Some exceptions indicate security violations
- **Debugging** - Exception type helps diagnose problems

**How**: Exception types are encoded:

```c
// Example: Exception cause codes
// Exception causes (mcause/scause, bit 31 = 0):
#define CAUSE_MISALIGNED_FETCH        0
#define CAUSE_FETCH_ACCESS            1
#define CAUSE_ILLEGAL_INSTRUCTION     2
#define CAUSE_BREAKPOINT              3
#define CAUSE_MISALIGNED_LOAD         4
#define CAUSE_LOAD_ACCESS             5
#define CAUSE_MISALIGNED_STORE        6
#define CAUSE_STORE_ACCESS            7
#define CAUSE_USER_ECALL              8
#define CAUSE_SUPERVISOR_ECALL        9
#define CAUSE_MACHINE_ECALL          11
#define CAUSE_FETCH_PAGE_FAULT       12
#define CAUSE_LOAD_PAGE_FAULT        13
#define CAUSE_STORE_PAGE_FAULT       15

// Interrupt causes (mcause/scause, bit 31 = 1):
#define IRQ_S_SOFT    1   // Supervisor software interrupt
#define IRQ_H_SOFT    2   // Hypervisor software interrupt
#define IRQ_M_SOFT    3   // Machine software interrupt
#define IRQ_S_TIMER   5   // Supervisor timer interrupt
#define IRQ_H_TIMER   6   // Hypervisor timer interrupt
#define IRQ_M_TIMER   7   // Machine timer interrupt
#define IRQ_S_EXT     9   // Supervisor external interrupt
#define IRQ_H_EXT    10   // Hypervisor external interrupt
#define IRQ_M_EXT    11   // Machine external interrupt

// Example: Reading exception cause
unsigned long get_exception_cause(void) {
    unsigned long scause;
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    return scause;
}

// Example: Checking exception type
bool is_interrupt(unsigned long cause) {
    // Bit 31 indicates interrupt (1) vs exception (0)
    return (cause >> 31) != 0;
}

unsigned int get_exception_code(unsigned long cause) {
    // Extract exception code (bits 30:0)
    return cause & 0x7FFFFFFF;
}

// Example: Exception handler dispatch
void handle_exception(unsigned long cause, unsigned long epc,
                      unsigned long tval, struct pt_regs *regs) {
    if (is_interrupt(cause)) {
        // Handle interrupt
        unsigned int irq = get_exception_code(cause);
        handle_interrupt(irq, regs);
    } else {
        // Handle exception
        unsigned int exc_code = get_exception_code(cause);
        handle_exception_type(exc_code, epc, tval, regs);
    }
}
```

**Explanation**:

- **Cause register** mcause/scause stores exception cause with interrupt bit
- **Interrupt bit** bit 31 distinguishes interrupts from exceptions
- **Exception codes** lower 31 bits encode specific exception type
- **Handler dispatch** exception code determines which handler to call
- **Recovery** different exceptions may need different recovery strategies

## Exception Vector Setup

**What**: Exception vectors are addresses where exception handlers are located. The processor jumps to these addresses when exceptions occur.

**Why**: Exception vectors are essential because:

- **Handler Location** - Tells CPU where exception handlers are located
- **Performance** - Direct jump to handler is fast
- **Flexibility** - Can use direct or vectored mode
- **Initialization** - Must be set up before exceptions can occur
- **Kernel Setup** - Kernel configures vectors during initialization

**How**: Exception vectors work:

```c
// Example: Exception vector modes
// mtvec/stvec register supports two modes:
// Direct mode (mode = 0): All exceptions jump to base address
// Vector mode (mode = 1): Exceptions jump to base + (4 * cause)

// Example: Setting up direct mode exception handler
void setup_direct_exception_handler(void (*handler)(void)) {
    unsigned long stvec_value;

    // Direct mode: handler address (must be 4-byte aligned)
    // Mode bits [1:0] = 00 (direct mode)
    stvec_value = (unsigned long)handler;
    stvec_value &= ~0x3;  // Ensure alignment

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec_value));
}

// Example: Setting up vectored mode exception handler
void setup_vectored_exception_handler(void (*base_handler)(void)) {
    unsigned long stvec_value;

    // Vector mode: base address + mode bits
    // Mode bits [1:0] = 01 (vectored mode)
    stvec_value = ((unsigned long)base_handler) & ~0x3;
    stvec_value |= 0x1;  // Set vector mode

    __asm__ volatile("csrw stvec, %0" : : "r"(stvec_value));
}

// Example: Vectored exception handler table
// In vector mode, exception cause is used as index
void exception_vector_table(void) {
    __asm__ volatile(
        "j handle_misaligned_fetch\n"
        ".align 4\n"
        "j handle_fetch_access\n"
        ".align 4\n"
        "j handle_illegal_instruction\n"
        ".align 4\n"
        "j handle_breakpoint\n"
        ".align 4\n"
        "j handle_misaligned_load\n"
        ".align 4\n"
        "j handle_load_access\n"
        ".align 4\n"
        "j handle_misaligned_store\n"
        ".align 4\n"
        "j handle_store_access\n"
        ".align 4\n"
        "j handle_user_ecall\n"
        // ... more exception handlers
    );
}

// Example: Kernel exception handler setup
void setup_kernel_exception_handlers(void) {
    // Set up supervisor exception handler
    extern void handle_supervisor_exception(void);
    setup_direct_exception_handler(handle_supervisor_exception);

    // Or use vectored mode for faster dispatch
    extern void exception_vector_table(void);
    setup_vectored_exception_handler(exception_vector_table);
}
```

**Explanation**:

- **Direct mode** all exceptions jump to same handler, handler dispatches
- **Vector mode** exceptions jump directly to specific handler based on cause
- **Alignment** exception handler addresses must be aligned
- **Mode bits** least significant bits of vector address encode mode
- **Performance** vectored mode can be faster for common exceptions

## Exception Context Saving

**What**: When an exception occurs, the processor automatically saves some state, and the exception handler must save the remaining context.

**Why**: Context saving is critical because:

- **State Preservation** - Allows resumption after exception handling
- **Register Safety** - Prevents handler from corrupting interrupted code
- **Multi-tasking** - Enables context switching during exception handling
- **Debugging** - Saved context aids debugging
- **Recovery** - Complete context enables proper exception recovery

**How**: Context saving works:

```c
// Example: Automatic context save by CPU
// When exception occurs, CPU automatically saves:
// - sepc/mepc = PC of faulting instruction (or next instruction)
// - scause/mcause = Exception cause code
// - stval/mtval = Exception value (address, instruction, etc.)
// - sstatus/mstatus = Privilege and interrupt state (MPP/SPP, MPIE/SPIE)

// Example: Manual context save in exception handler
// Handler must save general-purpose registers

struct pt_regs {
    // Argument registers (caller-saved)
    unsigned long a0;
    unsigned long a1;
    unsigned long a2;
    unsigned long a3;
    unsigned long a4;
    unsigned long a5;

    // Temporary registers
    unsigned long t0;
    unsigned long t1;
    unsigned long t2;
    unsigned long t3;
    unsigned long t4;
    unsigned long t5;
    unsigned long t6;

    // Saved registers (callee-saved)
    unsigned long s0;
    unsigned long s1;
    unsigned long s2;
    unsigned long s3;
    unsigned long s4;
    unsigned long s5;
    unsigned long s6;
    unsigned long s7;
    unsigned long s8;
    unsigned long s9;
    unsigned long s10;
    unsigned long s11;

    // Special registers
    unsigned long sp;   // Stack pointer
    unsigned long gp;   // Global pointer
    unsigned long tp;   // Thread pointer
    unsigned long ra;   // Return address

    // Exception context (set by CPU)
    unsigned long epc;  // From sepc
    unsigned long status; // From sstatus
};

// Example: Exception entry handler (assembly + C)
// Assembly saves all registers to pt_regs structure
void handle_exception_entry(struct pt_regs *regs) {
    unsigned long scause, sepc, stval, sstatus;

    // Read exception CSRs (already saved by CPU)
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Store exception information in regs
    regs->epc = sepc;
    regs->status = sstatus;

    // Save remaining CSR values if needed
    // regs structure passed from assembly handler

    // Dispatch to appropriate handler
    handle_exception(scause, sepc, stval, regs);
}

// Example: Assembly exception entry (saves registers)
// This would be in assembly file:
/*
handle_supervisor_trap:
    # Save all registers to pt_regs structure on stack

    # Allocate space for pt_regs
    addi sp, sp, -PT_REGS_SIZE

    # Save general registers
    sd ra, PT_RA(sp)
    sd sp, PT_SP(sp)
    sd gp, PT_GP(sp)
    sd tp, PT_TP(sp)
    # ... save all registers

    # Save exception CSRs
    csrr t0, sepc
    sd t0, PT_EPC(sp)
    csrr t0, sstatus
    sd t0, PT_STATUS(sp)

    # Call C handler
    mv a0, sp  # Pass pt_regs pointer
    call handle_exception_entry

    # Handler returns, restore registers and return
    # (restore code would be here)
*/

// Example: Restoring context for return
void restore_exception_context(struct pt_regs *regs) {
    unsigned long sepc, sstatus;

    // Restore exception CSRs
    sepc = regs->epc;
    sstatus = regs->status;

    // Write CSRs
    __asm__ volatile("csrw sepc, %0" : : "r"(sepc));
    __asm__ volatile("csrw sstatus, %0" : : "r"(sstatus));

    // Restore registers happens in assembly
    // This function just prepares CSRs
}
```

**Explanation**:

- **Automatic save** CPU saves PC, cause, value, and status to CSRs automatically
- **Manual save** handler must save all general-purpose registers
- **pt_regs structure** kernel uses standardized structure for saved context
- **Assembly entry** exception entry typically in assembly for register save
- **C handler** C function processes exception using saved context

## Specific Exception Handlers

**What**: Different exception types require specific handling logic and recovery strategies.

**How**: Handlers are implemented:

```c
// Example: Illegal instruction handler
void handle_illegal_instruction(unsigned long epc, unsigned long tval,
                                 struct pt_regs *regs, bool from_user) {
    unsigned long instruction;

    // tval contains the illegal instruction bits
    instruction = tval;

    if (from_user) {
        // Illegal instruction in user mode: send SIGILL signal
        force_sig_fault(SIGILL, ILL_ILLOPC, (void __user *)epc, current);

        // Skip illegal instruction
        regs->epc += 4;
    } else {
        // Illegal instruction in kernel: panic
        panic("Illegal instruction in kernel at %p: %08lx\n",
              (void *)epc, instruction);
    }
}

// Example: Page fault handler
void handle_page_fault(unsigned long epc, unsigned long fault_addr,
                       struct pt_regs *regs, bool is_write, bool from_user) {
    struct mm_struct *mm;
    struct vm_area_struct *vma;
    unsigned long address = fault_addr;
    int fault;

    if (from_user) {
        mm = current->mm;
    } else {
        // Kernel page fault
        mm = &init_mm;
    }

    // Find VMA containing fault address
    vma = find_vma(mm, address);

    if (!vma) {
        // No VMA: invalid address
        if (from_user) {
            force_sig_fault(SIGSEGV, SEGV_MAPERR,
                           (void __user *)address, current);
            return;
        } else {
            panic("Kernel page fault at %p\n", (void *)address);
        }
    }

    // Check permissions
    if (is_write && !(vma->vm_flags & VM_WRITE)) {
        // Write to read-only page
        if (from_user) {
            force_sig_fault(SIGSEGV, SEGV_ACCERR,
                           (void __user *)address, current);
            return;
        } else {
            panic("Kernel write fault to read-only page\n");
        }
    }

    // Attempt to fix page fault
    fault = handle_mm_fault(vma, address, is_write ? FAULT_FLAG_WRITE : 0, regs);

    if (fault & VM_FAULT_ERROR) {
        // Could not fix fault
        if (from_user) {
            force_sig_fault(SIGSEGV, SEGV_MAPERR,
                           (void __user *)address, current);
        } else {
            panic("Kernel page fault resolution failed\n");
        }
    }

    // Fault resolved, return to faulting instruction
    // Instruction will retry memory access
}

// Example: Breakpoint handler
void handle_breakpoint(unsigned long epc, unsigned long tval,
                       struct pt_regs *regs, bool from_user) {
    if (from_user) {
        // User mode breakpoint: debugger breakpoint
        // Send SIGTRAP signal for debugger
        force_sig_fault(SIGTRAP, TRAP_BRKPT, (void __user *)epc, current);

        // Don't skip instruction, debugger may want to re-execute
    } else {
        // Kernel breakpoint: debug breakpoint in kernel
        // Invoke kernel debugger
        kernel_debugger();
    }
}

// Example: Misaligned access handler
void handle_misaligned_access(unsigned long epc, unsigned long fault_addr,
                               struct pt_regs *regs, bool is_store,
                               bool from_user) {
    // RISC-V allows misaligned access in some implementations
    // Others generate exceptions

    if (from_user) {
        // Fix misaligned access in software
        if (is_store) {
            handle_misaligned_store(fault_addr, regs);
        } else {
            handle_misaligned_load(fault_addr, regs);
        }
    } else {
        // Kernel misaligned access: fix or error
        if (cpu_supports_misaligned()) {
            // CPU handles misaligned, shouldn't reach here
            panic("Misaligned access exception with hardware support\n");
        } else {
            // Software fix for kernel
            if (is_store) {
                handle_misaligned_store_kernel(fault_addr, regs);
            } else {
                handle_misaligned_load_kernel(fault_addr, regs);
            }
        }
    }
}

// Example: Access fault handler (protection violation)
void handle_access_fault(unsigned long epc, unsigned long fault_addr,
                         struct pt_regs *regs, bool is_store, bool from_user) {
    // Access fault: attempted access to invalid or protected memory

    if (from_user) {
        // User mode access fault: send SIGSEGV
        force_sig_fault(SIGSEGV, SEGV_ACCERR,
                       (void __user *)fault_addr, current);
    } else {
        // Kernel access fault: serious error
        panic("Kernel access fault at %p (PC: %p)\n",
              (void *)fault_addr, (void *)epc);
    }
}
```

**Explanation**:

- **Illegal instruction** user mode sends signal, kernel mode panics
- **Page fault** attempt to resolve by allocating/mapping page
- **Breakpoint** trigger debugger or send signal for debugging
- **Misaligned access** fix in software or trigger error
- **Access fault** protection violation, typically unrecoverable error

## Exception Recovery

**What**: Exception recovery determines how to resume execution after exception handling.

**Why**: Recovery is important because:

- **Resume Execution** - Continue execution after exception
- **Error Handling** - Recover from errors when possible
- **Signal Delivery** - Deliver signals to processes
- **Debugging** - Support debugger operations
- **System Stability** - Prevent exceptions from crashing system

**How**: Recovery strategies:

```c
// Example: Exception recovery strategies
// 1. Retry instruction (page fault fixed)
// 2. Skip instruction (illegal instruction, signal delivered)
// 3. Restart instruction (after signal handling)
// 4. Terminate process (fatal error)

// Example: Returning from exception (successful recovery)
void return_from_exception_success(struct pt_regs *regs) {
    // Exception handled successfully
    // Return to original instruction (may retry)
    // PC unchanged, execution resumes at epc

    // Restore context and return
    restore_exception_context(regs);
    __asm__ volatile("sret");
}

// Example: Skipping instruction after exception
void skip_faulting_instruction(struct pt_regs *regs) {
    // Advance PC past faulting instruction
    regs->epc += 4;

    // Return to next instruction
    restore_exception_context(regs);
    __asm__ volatile("sret");
}

// Example: Exception recovery with signal
void handle_exception_with_signal(struct pt_regs *regs, int sig, int code) {
    // Deliver signal to process
    force_sig_fault(sig, code, (void __user *)regs->epc, current);

    // Check if signal handler will be called
    if (signal_pending(current)) {
        // Setup return to signal handler
        setup_signal_return(current, regs);
    } else {
        // Skip instruction if no signal handler
        skip_faulting_instruction(regs);
    }
}

// Example: Fatal exception in kernel
void handle_fatal_kernel_exception(unsigned long epc, unsigned long cause,
                                    const char *msg) {
    // Log exception information
    printk("Fatal kernel exception at %p: cause=%lu\n",
           (void *)epc, cause);
    printk("Message: %s\n", msg);

    // Dump registers
    dump_registers();

    // Panic and halt
    panic("Fatal kernel exception: %s\n", msg);
}
```

**Explanation**:

- **Retry** faulting instruction when exception condition resolved
- **Skip** advance PC when instruction cannot be executed
- **Signal** deliver signal to process for recoverable errors
- **Terminate** end process for fatal errors
- **Kernel panic** halt system for fatal kernel exceptions

## Next Steps

**What** you're ready for next:

After mastering exception handling, you should be ready to:

1. **Learn Memory Model** - RISC-V memory organization and addressing
2. **Study Extensions** - Advanced RISC-V extensions
3. **Understand Kernel Architecture** - How kernel uses exceptions
4. **Explore Interrupts** - Interrupt handling mechanisms
5. **Begin Kernel Development** - Apply exception handling in kernel code

**Where** to go next:

Continue with the next section on **"RISC-V Memory Model"** to learn:

- Memory organization and address spaces
- Addressing modes
- Memory ordering
- Virtual memory concepts
- Practical memory operations

**Why** the next section is important:

Memory model understanding is essential for kernel development, virtual memory management, and system design.

**How** to continue learning:

1. **Study Kernel Code** - Examine exception handlers in kernel
2. **Use Debugger** - Debug exceptions and examine context
3. **Read Spec** - Study RISC-V exception specification
4. **Write Handlers** - Implement exception handlers
5. **Test Scenarios** - Test exception handling with various scenarios

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Exceptions](https://github.com/riscv/riscv-isa-manual) - Exception specification
- [RISC-V Exception Handling](https://github.com/riscv/riscv-isa-manual/blob/master/src/machine.tex) - Complete exception reference

**Kernel Sources**:

- [Linux RISC-V Exception Handlers](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel exception code
