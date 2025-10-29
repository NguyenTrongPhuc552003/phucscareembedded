---
sidebar_position: 2
---

# Privilege Transitions

Master the mechanisms that RISC-V uses to transition between privilege levels, including exception entry, return instructions, and system call handling essential for kernel operation.

## What Are Privilege Transitions?

**What**: Privilege transitions are the mechanisms by which the processor changes from one privilege level to another. These transitions occur during exceptions, system calls, returns from exceptions, and explicit privilege changes.

**Why**: Understanding privilege transitions is crucial because:

- **System Calls** - User programs need to invoke kernel services
- **Exception Handling** - Exceptions elevate privilege for handling
- **Security** - Controlled transitions ensure security boundaries
- **Kernel Operation** - Kernel constantly transitions between modes
- **Context Switching** - Process switches involve privilege transitions
- **Interrupt Handling** - Interrupts cause privilege transitions

**When**: Privilege transitions occur when:

- **System Calls** - ECALL instruction from user mode
- **Exceptions** - Illegal instruction, page fault, etc.
- **Interrupts** - Hardware interrupts from devices or timer
- **Returns** - MRET/SRET return from exception handlers
- **Initialization** - System boot transitions from M to S mode
- **Context Switch** - Kernel switches between user processes

**How**: Privilege transitions work through:

- **Exception Mechanism** - Exceptions automatically elevate privilege
- **Return Instructions** - MRET/SRET restore previous privilege
- **CSR Updates** - CSRs track privilege changes
- **Register Save** - Context saved before transition
- **Handler Invocation** - Exception handler runs at new privilege

**Where**: Privilege transitions are found in:

- **System Call Interface** - Every system call involves transition
- **Exception Handlers** - All exception handling uses transitions
- **Kernel Entry/Exit** - Kernel entry and exit points
- **Interrupt Handlers** - Interrupt handling involves transitions
- **Boot Sequence** - System initialization uses transitions

## Exception Entry (Transition to Higher Privilege)

**What**: Exception entry is the automatic transition to a higher privilege level when an exception or interrupt occurs.

**Why**: Exception entry is important because:

- **Automatic Elevation** - CPU automatically raises privilege
- **Secure Handling** - Exceptions handled at appropriate privilege
- **Context Saving** - CPU saves state before handler execution
- **Atomic Operation** - Transition is atomic and secure
- **Handler Execution** - Privileged handler can access needed resources

**How**: Exception entry operates:

```c
// Example: Exception entry mechanism
// When exception occurs:
// 1. CPU saves current state to CSRs
// 2. Sets privilege to exception handler privilege
// 3. Jumps to exception handler address
// 4. Handler executes at elevated privilege

// Exception entry CSR updates (simplified):
// mepc/spec = PC of faulting instruction
// mcause/scause = exception cause code
// mtval/stval = exception value (address, instruction, etc.)
// mstatus/sstatus = updated with privilege info
// mpp/spp = previous privilege level saved

// Example: Machine mode exception entry
void machine_mode_exception_entry(void) {
    unsigned long mstatus, mepc, mcause, mtval;
    unsigned long previous_privilege;

    // CPU automatically saves state (this code shows what happens):
    // Read saved state
    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));
    __asm__ volatile("csrr %0, mepc" : "=r"(mepc));
    __asm__ volatile("csrr %0, mcause" : "=r"(mcause));
    __asm__ volatile("csrr %0, mtval" : "=r"(mtval));

    // Extract previous privilege from MPP field
    previous_privilege = (mstatus >> MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    // CPU sets privilege to Machine mode (highest)
    // Exception handler now running in Machine mode

    // Disable interrupts during exception handling
    // MIE bit cleared automatically
    // Can be re-enabled by handler if needed

    // Handle exception based on cause
    handle_machine_exception(mcause, mepc, mtval, previous_privilege);
}

// Example: Supervisor mode exception entry (from user mode)
void supervisor_mode_exception_entry(struct pt_regs *regs) {
    unsigned long sstatus, sepc, scause, stval;

    // CPU automatically saved state on exception
    // Read supervisor CSRs
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));

    // SPP bit indicates previous privilege (0=user, 1=supervisor)
    bool from_user = (sstatus & SSTATUS_SPP) == 0;

    // Save register state to pt_regs structure
    // CPU saved PC, but we need to save all registers
    save_registers_to_ptregs(regs, sepc);

    // SIE bit disabled automatically, interrupts masked
    // Handler can enable if needed

    // Route exception to appropriate handler
    if (scause & CAUSE_INTERRUPT) {
        // Interrupt: handle interrupt
        handle_supervisor_interrupt(scause & ~CAUSE_INTERRUPT, regs);
    } else {
        // Exception: handle exception
        handle_supervisor_exception(scause, sepc, stval, regs, from_user);
    }
}

// Example: Exception handler dispatch
void handle_supervisor_exception(unsigned long cause, unsigned long epc,
                                  unsigned long tval, struct pt_regs *regs,
                                  bool from_user) {
    // Dispatch based on exception cause
    switch (cause) {
        case CAUSE_ILLEGAL_INSTRUCTION:
            handle_illegal_instruction(epc, tval, regs, from_user);
            break;

        case CAUSE_INSTRUCTION_ACCESS_FAULT:
            handle_instruction_fault(epc, tval, regs, from_user);
            break;

        case CAUSE_LOAD_ACCESS_FAULT:
            handle_load_fault(epc, tval, regs, from_user);
            break;

        case CAUSE_STORE_ACCESS_FAULT:
            handle_store_fault(epc, tval, regs, from_user);
            break;

        case CAUSE_USER_ECALL:
            // System call from user mode
            handle_system_call(regs);
            break;

        case CAUSE_SUPERVISOR_ECALL:
            // ECALL from supervisor mode (kernel)
            handle_kernel_ecall(regs);
            break;

        case CAUSE_INSTRUCTION_PAGE_FAULT:
            handle_instruction_page_fault(epc, tval, regs, from_user);
            break;

        case CAUSE_LOAD_PAGE_FAULT:
            handle_load_page_fault(epc, tval, regs, from_user);
            break;

        case CAUSE_STORE_PAGE_FAULT:
            handle_store_page_fault(epc, tval, regs, from_user);
            break;

        default:
            handle_unknown_exception(cause, epc, tval, regs);
            break;
    }
}
```

**Explanation**:

- **Automatic save** CPU saves PC, cause, and value to CSRs automatically
- **Privilege elevation** CPU sets privilege to handler's privilege level
- **State preservation** MPP/SPP fields save previous privilege level
- **Interrupt disable** interrupts typically disabled during exception entry
- **Handler dispatch** exception cause determines which handler to call

## Return Instructions (Transition to Lower Privilege)

**What**: Return instructions (MRET, SRET, URET) restore the previous privilege level and return execution to the interrupted context.

**Why**: Return instructions are essential because:

- **Context Restoration** - Restores previous execution context
- **Privilege Restoration** - Returns to previous privilege level
- **Resume Execution** - Continues execution after exception handling
- **Security** - Controlled return ensures security boundaries
- **System Call Return** - Returns from system call to user mode

**How**: Return instructions work:

```c
// Example: MRET (Machine Mode Return) instruction
// MRET: Return from machine mode exception
// Effects:
// 1. Privilege = mstatus.MPP (restore previous privilege)
// 2. PC = mepc (resume at exception point)
// 3. Interrupts: MIE = mstatus.MPIE (restore interrupt enable)
// 4. MPIE = 1 (enable interrupts after return)

void machine_mode_return(unsigned long mepc, unsigned long previous_priv) {
    unsigned long mstatus;

    // Set return address
    __asm__ volatile("csrw mepc, %0" : : "r"(mepc));

    // Configure mstatus for return
    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Set MPP to previous privilege
    mstatus &= ~MSTATUS_MPP_MASK;
    mstatus |= (previous_priv << MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    // Restore interrupt enable: MIE = MPIE
    if (mstatus & MSTATUS_MPIE) {
        mstatus |= MSTATUS_MIE;
    }
    mstatus |= MSTATUS_MPIE;  // Enable interrupts in previous mode

    __asm__ volatile("csrw mstatus, %0" : : "r"(mstatus));

    // Execute MRET
    __asm__ volatile("mret");

    // Execution continues at mepc with restored privilege
}

// Example: SRET (Supervisor Mode Return) instruction
// SRET: Return from supervisor mode exception
// Effects:
// 1. Privilege = sstatus.SPP (0=user, 1=supervisor)
// 2. PC = sepc (resume execution)
// 3. Interrupts: SIE = sstatus.SPIE
// 4. SPIE = 1

void supervisor_mode_return(struct pt_regs *regs) {
    unsigned long sstatus, sepc;

    // Restore register state
    restore_registers_from_ptregs(regs);

    // Get saved PC from regs
    sepc = regs->epc;
    __asm__ volatile("csrw sepc, %0" : : "r"(sepc));

    // Configure sstatus for return
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Restore interrupt enable: SIE = SPIE
    if (sstatus & SSTATUS_SPIE) {
        sstatus |= SSTATUS_SIE;
    }
    sstatus |= SSTATUS_SPIE;  // Enable interrupts after return

    // Clear SPP (will be restored from saved value)
    // Actually, SPP is used by SRET to determine return privilege
    // SPP was set by exception entry

    __asm__ volatile("csrw sstatus, %0" : : "r"(sstatus));

    // Execute SRET
    __asm__ volatile("sret");

    // Execution continues at sepc with privilege from SPP
}

// Example: System call return (user mode return)
void return_from_system_call(struct pt_regs *regs, long return_value) {
    // Set return value in a0 register
    regs->a0 = return_value;

    // Check for pending signals
    if (signal_pending(current)) {
        // Handle signals before returning
        handle_signal_delivery(current, regs);
    }

    // Return to user mode via SRET
    supervisor_mode_return(regs);

    // Execution resumes in user mode
}

// Example: Return from page fault handler
void return_from_page_fault(struct pt_regs *regs, unsigned long fault_addr,
                            bool fixed) {
    if (fixed) {
        // Page fault resolved, return to faulting instruction
        // sepc points to instruction that caused fault
        // Simply return, instruction will retry
        supervisor_mode_return(regs);
    } else {
        // Page fault not resolved, send signal to process
        force_sig_fault(SIGSEGV, SEGV_MAPERR, (void __user *)fault_addr, current);

        // Return but skip faulting instruction
        regs->epc += 4;  // Skip to next instruction
        supervisor_mode_return(regs);
    }
}
```

**Explanation**:

- **MRET instruction** returns from machine mode, restores privilege from MPP
- **SRET instruction** returns from supervisor mode, restores privilege from SPP
- **PC restoration** execution resumes at saved PC (mepc/sepc)
- **Interrupt enable** interrupt state restored from MPIE/SPIE fields
- **Register restoration** general registers restored from saved context

## System Call Mechanism

**What**: System calls use the ECALL instruction to transition from user mode to supervisor mode to invoke kernel services.

**Why**: System calls are essential because:

- **Kernel Access** - Only way for user programs to access kernel
- **Controlled Interface** - Secure, controlled access to system resources
- **Separation** - Maintains separation between user and kernel
- **Abstraction** - Provides high-level interface to hardware
- **Compatibility** - Standard interface for all applications

**How**: System calls work:

```c
// Example: System call from user space
// User program calls library function
ssize_t read(int fd, void *buf, size_t count) {
    register long a0 asm("a0") = fd;
    register void *a1 asm("a1") = buf;
    register size_t a2 asm("a2") = count;
    register long a7 asm("a7") = __NR_read;
    register long ret asm("a0");

    __asm__ volatile(
        "ecall\n"    // System call instruction
        : "=r"(ret)
        : "r"(a0), "r"(a1), "r"(a2), "r"(a7)
        : "memory"
    );

    return ret;
}

// Example: System call exception handler
// ECALL from user mode triggers CAUSE_USER_ECALL exception
void handle_system_call(struct pt_regs *regs) {
    unsigned long syscall_num;
    unsigned long args[6];
    long ret;

    // System call number in a7 register
    syscall_num = regs->a7;

    // Arguments in a0-a5 registers
    args[0] = regs->a0;
    args[1] = regs->a1;
    args[2] = regs->a2;
    args[3] = regs->a3;
    args[4] = regs->a4;
    args[5] = regs->a5;

    // Validate system call number
    if (syscall_num >= NR_syscalls) {
        ret = -ENOSYS;
        goto out;
    }

    // Dispatch to system call handler
    // sys_call_table is array of function pointers
    ret = sys_call_table[syscall_num](args[0], args[1], args[2],
                                      args[3], args[4], args[5]);

out:
    // Return value in a0 register
    regs->a0 = ret;

    // Advance PC past ECALL instruction (unless error occurred)
    if (!IS_ERR_VALUE(ret)) {
        regs->epc += 4;
    }

    // Return to user mode
    return_from_system_call(regs, ret);
}

// Example: System call table
// Array of function pointers for each system call
const sys_call_ptr_t sys_call_table[] = {
    [0] = sys_read,      // __NR_read
    [1] = sys_write,     // __NR_write
    [2] = sys_open,      // __NR_open
    [3] = sys_close,     // __NR_close
    // ... more system calls
};

// Example: System call wrapper
// Generic system call handler
asmlinkage long riscv_syscall(struct pt_regs *regs) {
    // Called from exception handler
    return handle_system_call(regs);
}

// Example: Fast system call path (optimization)
// Some system calls can be optimized for common cases
asmlinkage long sys_getpid_fast(void) {
    // Current process ID
    return current->pid;
}

// Optimized: can inline common system calls
// Compiler generates direct function call instead of ECALL
```

**Explanation**:

- **ECALL instruction** triggers exception that elevates privilege to supervisor
- **Register convention** arguments passed in a0-a5, syscall number in a7
- **Return value** result returned in a0 register
- **Exception cause** ECALL from user mode sets cause to CAUSE_USER_ECALL
- **PC advancement** normally advance past ECALL, unless error
- **System call table** dispatch array maps syscall number to handler

## Privilege Delegation

**What**: Privilege delegation allows machine mode to delegate exceptions to supervisor mode, enabling the kernel to handle certain exceptions.

**Why**: Delegation is important because:

- **Kernel Control** - Kernel can handle user exceptions directly
- **Performance** - Avoids machine mode overhead
- **Flexibility** - Kernel has more control over exception handling
- **Security** - Delegation is controlled and secure
- **Standard Usage** - Most systems delegate to supervisor mode

**How**: Delegation operates:

```c
// Example: Setting up delegation from machine to supervisor
void setup_exception_delegation(void) {
    unsigned long medeleg, mideleg;

    // medeleg (Machine Exception Delegation) register
    // Bit set = delegate exception to supervisor mode
    // Bit clear = handle in machine mode

    medeleg = 0;

    // Delegate user mode exceptions to supervisor
    medeleg |= (1 << CAUSE_ILLEGAL_INSTRUCTION);
    medeleg |= (1 << CAUSE_INSTRUCTION_ACCESS_FAULT);
    medeleg |= (1 << CAUSE_LOAD_ACCESS_FAULT);
    medeleg |= (1 << CAUSE_STORE_ACCESS_FAULT);
    medeleg |= (1 << CAUSE_USER_ECALL);  // System calls
    medeleg |= (1 << CAUSE_INSTRUCTION_PAGE_FAULT);
    medeleg |= (1 << CAUSE_LOAD_PAGE_FAULT);
    medeleg |= (1 << CAUSE_STORE_PAGE_FAULT);

    // Write delegation register
    __asm__ volatile("csrw medeleg, %0" : : "r"(medeleg));

    // mideleg (Machine Interrupt Delegation) register
    // Bit set = delegate interrupt to supervisor mode

    mideleg = 0;

    // Delegate supervisor software interrupt
    mideleg |= (1 << IRQ_S_SOFT);

    // Delegate supervisor timer interrupt
    mideleg |= (1 << IRQ_S_TIMER);

    // Delegate supervisor external interrupt
    mideleg |= (1 << IRQ_S_EXT);

    // Write interrupt delegation register
    __asm__ volatile("csrw mideleg, %0" : : "r"(mideleg));
}

// Example: Delegated exception handling
// When exception is delegated:
// 1. Exception handled in supervisor mode (not machine mode)
// 2. Supervisor CSRs updated (sepc, scause, stval, sstatus)
// 3. Supervisor handler invoked
// 4. Machine mode not involved (faster)

void handle_delegated_exception(struct pt_regs *regs) {
    unsigned long scause, sepc, stval;

    // Read supervisor exception CSRs
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    __asm__ volatile("csrr %0, sepc" : "=r"(sepc));
    __asm__ volatile("csrr %0, stval" : "=r"(stval));

    // Exception handled in supervisor mode
    // Kernel has full control

    if (scause & CAUSE_INTERRUPT) {
        // Delegate interrupt
        handle_supervisor_interrupt(scause & ~CAUSE_INTERRUPT, regs);
    } else {
        // Delegate exception
        handle_supervisor_exception(scause, sepc, stval, regs, true);
    }
}
```

**Explanation**:

- **medeleg register** controls which exceptions are delegated to supervisor
- **mideleg register** controls which interrupts are delegated to supervisor
- **Bit encoding** each bit corresponds to exception/interrupt cause
- **Selective delegation** only certain exceptions need delegation
- **Performance benefit** delegated exceptions avoid machine mode overhead
- **Kernel control** delegated exceptions handled entirely by kernel

## Context Switching and Privilege

**What**: Context switching between processes involves privilege transitions when switching from one user process to another.

**How**: Context switching works:

```c
// Example: Context switch with privilege transitions
// When switching processes:
// 1. Save current process state
// 2. Switch page tables
// 3. Restore new process state
// 4. Return to user mode (new process)

void __switch_to(struct task_struct *prev, struct task_struct *next) {
    struct pt_regs *prev_regs, *next_regs;

    // Save previous process register state
    prev_regs = task_pt_regs(prev);
    save_callee_saved_regs(prev_regs);

    // Switch page tables (satp register)
    switch_mm(prev->mm, next->mm, next);

    // Restore next process register state
    next_regs = task_pt_regs(next);
    restore_callee_saved_regs(next_regs);

    // Switch stack pointer
    __asm__ volatile("mv sp, %0" : : "r"(next->thread.sp));

    // Set return address for when we return to user mode
    set_user_return_address(next_regs->epc);
}

// Example: Returning to user mode after context switch
void return_to_user_mode(struct pt_regs *regs) {
    // Ensure we're returning to user mode
    unsigned long sstatus;

    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Clear SPP (will be 0 for user mode return)
    sstatus &= ~SSTATUS_SPP;

    // Restore interrupt enable
    if (sstatus & SSTATUS_SPIE) {
        sstatus |= SSTATUS_SIE;
    }
    sstatus |= SSTATUS_SPIE;

    __asm__ volatile("csrw sstatus, %0" : : "r"(sstatus));
    __asm__ volatile("csrw sepc, %0" : : "r"(regs->epc));

    // Return to user mode
    __asm__ volatile("sret");
}
```

**Explanation**:

- **State saving** save all registers and state of previous process
- **Page table switch** switch satp register to new process page tables
- **State restoration** restore registers and state of new process
- **Return to user** SRET returns to new process in user mode
- **Privilege maintained** both processes run in user mode

## Next Steps

**What** you're ready for next:

After mastering privilege transitions, you should be ready to:

1. **Learn CSR Access** - Detailed CSR access rules for each privilege level
2. **Study Exception Handling** - Complete exception handling mechanisms
3. **Understand Interrupts** - How interrupts cause privilege transitions
4. **Explore Security** - Security implications of privilege transitions
5. **Begin Kernel Development** - Apply transition knowledge in kernel code

**Where** to go next:

Continue with the next lesson on **"CSR Access"** to learn:

- CSR access rules for each privilege level
- Read/write permissions
- CSR encoding and fields
- Commonly used CSRs
- CSR manipulation in kernel

**Why** the next lesson is important:

CSRs are the interface to privileged hardware features. Understanding CSR access is essential for kernel development and system configuration.

**How** to continue learning:

1. **Study Kernel Code** - Examine CSR usage in kernel
2. **Read Spec** - Study RISC-V CSR specification
3. **Use Debugger** - Inspect CSRs during debugging
4. **Experiment** - Write code to test CSR access
5. **Analyze Traces** - Study CSR values in execution traces

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - Privilege Levels](https://github.com/riscv/riscv-isa-manual) - Privilege specification
- [RISC-V CSR List](https://github.com/riscv/riscv-isa-manual/blob/master/src/supervisor.tex) - CSR definitions

**Kernel Sources**:

- [Linux RISC-V Entry/Exit](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel transition code
