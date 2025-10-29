---
sidebar_position: 3
---

# Exception Context

Master RISC-V exception context saving and restoration that preserves CPU state during exceptions, understanding how registers are saved, exception frames are structured, and context is restored essential for correct exception handling.

## What Is Exception Context?

**What**: Exception context is the saved state of a CPU when an exception or interrupt occurs, including all general-purpose registers, program counter, status registers, and other CPU state. This context must be saved before exception handling and restored when returning from the exception.

**Why**: Understanding exception context is crucial because:

- **State Preservation** - Preserves CPU state during exception handling
- **Correct Return** - Ensures correct resumption after exception
- **Debugging** - Context contains debugging information
- **Security** - Context switching requires proper context management
- **SMP Support** - Each CPU has its own exception context
- **Kernel Operation** - Fundamental to all exception handling

**When**: Exception context is used when:

- **Exception Entry** - Context saved when exception occurs
- **Exception Handling** - Handler uses saved context
- **Exception Return** - Context restored when returning
- **Context Switching** - Process context switching
- **Debugging** - Inspecting exception state
- **Signal Delivery** - Signal handlers use exception context

**How**: Exception context works through:

- **Automatic Save** - CPU automatically saves some state to CSRs
- **Manual Save** - Handler must save remaining registers
- **Context Structure** - Standardized structure (pt_regs) stores context
- **Context Restoration** - Restore context before returning
- **Register Conventions** - RISC-V calling conventions for context
- **Assembly Interface** - Assembly code saves/restores registers

**Where**: Exception context is found in:

- **Exception Handlers** - arch/riscv/kernel/entry.S
- **Signal Handling** - Signal delivery code
- **Debugging** - Exception state inspection
- **Process Switch** - Context switching code
- **Kernel Entry** - Kernel entry points

## pt_regs Structure

**What**: pt_regs is the standardized structure used by the Linux kernel to save exception context on RISC-V.

**How**: pt_regs structure works:

```c
// Example: RISC-V pt_regs structure
// Stores all registers that may be modified or needed
struct pt_regs {
    // Argument registers (used for system calls)
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

    // Exception registers (saved by CPU)
    unsigned long epc;   // Exception program counter (from sepc)
    unsigned long cause; // Exception cause (from scause)
    unsigned long tval;  // Trap value (from stval)
    unsigned long status;// Status register (from sstatus)

    // Floating point registers (if F/D extension present)
    // Note: Kernel may not save FP registers unless using FP
};

// Example: Getting pt_regs from stack pointer
struct pt_regs *current_pt_regs(void) {
    // pt_regs is at top of kernel stack
    // Stack pointer points to pt_regs after exception entry

    unsigned long sp;
    __asm__ volatile("mv %0, sp" : "=r"(sp));

    // pt_regs is at top of stack
    return (struct pt_regs *)sp;
}

// Example: Accessing pt_regs in exception handler
void handle_exception_handler(struct pt_regs *regs) {
    // regs pointer passed to handler
    // Contains all saved register state

    // Access saved registers
    unsigned long pc = regs->epc;        // Program counter
    unsigned long sp = regs->sp;         // Stack pointer
    unsigned long cause = regs->cause;   // Exception cause
}
```

**Explanation**:

- **Complete state** pt_regs stores all registers needed for exception handling
- **Standard structure** kernel uses pt_regs consistently
- **Stack location** pt_regs typically at top of kernel stack
- **Exception CSRs** epc, cause, tval, status saved automatically
- **Register conventions** structure follows RISC-V register conventions

## Exception Entry Context Save

**What**: When an exception occurs, the CPU and exception handler must save all register state.

**How**: Context saving works:

```c
// Example: Exception entry (assembly)
// Exception entry code saves all registers to pt_regs

.section .text
.global handle_supervisor_trap
handle_supervisor_trap:
    // At this point:
    // - CPU has saved: sepc, scause, stval, sstatus to CSRs
    // - Handler must save all other registers

    // Allocate space for pt_regs on stack
    addi sp, sp, -PT_REGS_SIZE

    // Save general-purpose registers
    sd ra, PT_RA(sp)      // Return address
    sd sp, PT_SP(sp)      // Stack pointer (original)
    sd gp, PT_GP(sp)      // Global pointer
    sd tp, PT_TP(sp)      // Thread pointer

    sd t0, PT_T0(sp)
    sd t1, PT_T1(sp)
    sd t2, PT_T2(sp)
    sd s0, PT_S0(sp)
    sd s1, PT_S1(sp)

    sd a0, PT_A0(sp)
    sd a1, PT_A1(sp)
    sd a2, PT_A2(sp)
    sd a3, PT_A3(sp)
    sd a4, PT_A4(sp)
    sd a5, PT_A5(sp)

    // ... save remaining registers

    // Save exception CSRs (CPU saved these, we read them)
    csrr t0, sepc
    sd t0, PT_EPC(sp)

    csrr t0, scause
    sd t0, PT_CAUSE(sp)

    csrr t0, stval
    sd t0, PT_TVAL(sp)

    csrr t0, sstatus
    sd t0, PT_STATUS(sp)

    // Call C handler with pt_regs pointer
    mv a0, sp             // Pass pt_regs pointer
    call handle_exception_entry

    // Handler returns, restore context and return
    // (restore code follows)

// Example: C exception handler
void handle_exception_entry(struct pt_regs *regs) {
    unsigned long cause = regs->cause;

    // Route to appropriate handler
    if (cause & CAUSE_INTERRUPT) {
        handle_interrupt(cause & ~CAUSE_INTERRUPT, regs);
    } else {
        handle_exception(cause, regs);
    }

    // Return to assembly code to restore context
}

// Example: Per-CPU exception context
// Each CPU has its own exception context area

DEFINE_PER_CPU(struct pt_regs *, exception_regs);

void setup_per_cpu_exception_context(void) {
    unsigned long cpu;

    for_each_possible_cpu(cpu) {
        // Allocate exception context per CPU
        struct pt_regs *regs = kmalloc(sizeof(*regs), GFP_KERNEL);

        per_cpu(exception_regs, cpu) = regs;
    }
}
```

**Explanation**:

- **Assembly save** exception entry in assembly saves all registers
- **Stack allocation** allocate space on stack for pt_regs
- **CSR reading** read exception CSRs and store in pt_regs
- **C handler** C handler receives pt_regs pointer
- **Per-CPU context** each CPU has its own exception context

## Exception Return Context Restore

**What**: When returning from an exception, the saved context must be restored.

**How**: Context restoration works:

```c
// Example: Exception return (assembly continuation)
// After C handler returns, restore context

handle_supervisor_trap_restore:
    // Restore exception CSRs
    ld t0, PT_EPC(sp)
    csrw sepc, t0

    ld t0, PT_STATUS(sp)
    csrw sstatus, t0

    // Restore general-purpose registers
    ld ra, PT_RA(sp)
    // Note: sp restored last (or not restored if using original)

    ld t0, PT_T0(sp)
    ld t1, PT_T1(sp)
    ld t2, PT_T2(sp)
    ld s0, PT_S0(sp)
    ld s1, PT_S1(sp)

    ld a0, PT_A0(sp)
    ld a1, PT_A1(sp)
    ld a2, PT_A2(sp)
    ld a3, PT_A3(sp)
    ld a4, PT_A4(sp)
    ld a5, PT_A5(sp)

    // ... restore remaining registers

    // Restore stack pointer (if changed)
    addi sp, sp, PT_REGS_SIZE

    // Return from exception (SRET instruction)
    sret

// Example: Returning from exception in C code
void return_from_exception(struct pt_regs *regs) {
    // Prepare for return:
    // - Update epc if needed (e.g., skip instruction, retry)
    // - Handle signals if needed
    // - Check for pending work

    // Check for pending signals
    if (signal_pending(current)) {
        handle_signal_delivery(current, regs);
        // May modify regs->epc to jump to signal handler
    }

    // Check if need to advance PC
    // (e.g., for system calls, skip instruction for errors)
    // regs->epc already contains return address

    // Assembly code will restore registers and execute SRET
    // Execution continues at regs->epc
}

// Example: Modifying return address
void skip_faulting_instruction(struct pt_regs *regs) {
    // Advance PC past faulting instruction
    // So we don't re-execute it
    regs->epc += 4;  // Skip 4-byte instruction
}

void retry_instruction(struct pt_regs *regs) {
    // Keep PC unchanged (default)
    // Instruction will retry (e.g., after page fault fix)
    // regs->epc unchanged
}

// Example: Returning to different address
void return_to_signal_handler(struct pt_regs *regs, unsigned long handler_addr) {
    // Change return address to signal handler
    regs->epc = handler_addr;

    // Setup stack for signal handler
    regs->sp = get_signal_stack();

    // Setup arguments for signal handler
    regs->a0 = get_signal_number();
    regs->a1 = get_siginfo();
    regs->a2 = get_sigcontext();

    // Return will jump to signal handler
}
```

**Explanation**:

- **Register restoration** restore all saved registers
- **CSR restoration** restore sepc and sstatus CSRs
- **Return address** epc determines where execution resumes
- **PC modification** can modify epc for special cases
- **SRET instruction** sret returns from exception

## Nested Exception Handling

**What**: Nested exceptions occur when an exception handler itself causes another exception.

**Why**: Nested exceptions are important because:

- **Page Faults in Handler** - Handler may cause page faults
- **Interrupts in Exception** - Interrupts can occur during exception
- **Stack Overflow** - Exception handling can cause stack issues
- **Recursive Faults** - Faults in fault handlers
- **Context Stacking** - Must stack contexts correctly

**How**: Nested exceptions work:

```c
// Example: Nested exception handling
// When exception occurs during exception handling:
// 1. Save current exception context
// 2. Enter new exception handler
// 3. New handler must not corrupt previous context

// Example: Nested exception entry
void handle_nested_exception(struct pt_regs *outer_regs) {
    // Outer exception context already on stack
    // New exception occurs, need new context

    struct pt_regs *inner_regs;
    unsigned long scause, sepc;

    // Allocate new pt_regs on stack (nested)
    // Stack pointer moved, outer_regs still valid below
    inner_regs = (struct pt_regs *)((unsigned long)outer_regs - PT_REGS_SIZE);

    // Save new exception context
    save_pt_regs(inner_regs);

    // Handle nested exception
    __asm__ volatile("csrr %0, scause" : "=r"(scause));

    if (scause == CAUSE_STORE_PAGE_FAULT) {
        // Page fault in exception handler
        // This is critical - handle carefully
        handle_critical_page_fault(inner_regs);
    }

    // After nested exception handled, restore inner context
    // Then outer exception handler continues
}

// Example: Stack overflow detection
bool check_exception_stack_overflow(struct pt_regs *regs) {
    unsigned long stack_base = this_cpu_read(exception_stack_base);
    unsigned long stack_top = this_cpu_read(exception_stack_top);
    unsigned long current_sp = (unsigned long)regs;

    if (current_sp < stack_base || current_sp > stack_top) {
        // Stack overflow in exception handler
        return true;
    }

    return false;
}

// Example: Preventing infinite recursion
static int exception_depth = 0;
#define MAX_EXCEPTION_DEPTH 10

void handle_exception_with_depth_check(struct pt_regs *regs) {
    exception_depth++;

    if (exception_depth > MAX_EXCEPTION_DEPTH) {
        // Too many nested exceptions
        panic("Exception handler recursion detected\n");
    }

    // Handle exception normally
    handle_exception_entry(regs);

    exception_depth--;
}
```

**Explanation**:

- **Stack nesting** nested exceptions stack contexts on stack
- **Context preservation** must preserve outer context
- **Stack overflow** detect and handle stack overflow
- **Recursion prevention** prevent infinite exception recursion
- **Critical faults** handle critical page faults carefully

## Exception Context for Signals

**What**: Signals use exception context to deliver signals to user processes.

**How**: Signal context works:

```c
// Example: Setting up exception context for signal delivery
void setup_signal_context(struct task_struct *tsk, struct pt_regs *regs,
                          int sig, struct k_sigaction *ka) {
    struct sigframe *frame;
    unsigned long sp;

    // Allocate signal frame on user stack
    sp = sigsp(regs->sp, ka);
    sp = align_sigframe(sp);

    frame = (struct sigframe *)(sp - sizeof(*frame));

    // Setup signal frame
    frame->info = get_siginfo(sig);
    frame->uc.uc_mcontext.regs = *regs;  // Save exception context

    // Setup signal handler return address
    frame->pretcode = ka->sa.sa_handler;

    // Modify exception context to call signal handler
    regs->epc = (unsigned long)frame->pretcode;
    regs->sp = (unsigned long)frame;

    // Setup signal handler arguments
    regs->a0 = sig;                          // Signal number
    regs->a1 = (unsigned long)&frame->info;   // siginfo pointer
    regs->a2 = (unsigned long)&frame->uc;     // ucontext pointer

    // Return to user mode will jump to signal handler
}

// Example: Returning from signal handler
void handle_signal_return(struct pt_regs *regs) {
    // Signal handler returns via rt_sigreturn system call
    // Restore exception context from signal frame

    struct rt_sigframe __user *frame;
    struct ucontext __user *uc;

    // Get signal frame address
    frame = (struct rt_sigframe __user *)regs->sp;
    uc = &frame->uc;

    // Restore original exception context
    if (copy_from_user(regs, &uc->uc_mcontext.regs, sizeof(*regs))) {
        force_sig(SIGSEGV);
        return;
    }

    // Return to original instruction (or after signal handler)
}
```

**Explanation**:

- **Signal frame** signal frame saves exception context
- **Handler setup** modify context to call signal handler
- **Context restoration** restore original context after signal
- **User stack** signal frame on user stack
- **Return mechanism** rt_sigreturn restores context

## Debugging Exception Context

**What**: Debugging exception context helps diagnose exception handling issues.

**How**: Context debugging works:

```c
// Example: Printing exception context
void dump_pt_regs(struct pt_regs *regs) {
    pr_info("Exception context dump:\n");
    pr_info("  epc:  %016lx\n", regs->epc);
    pr_info("  ra:   %016lx\n", regs->ra);
    pr_info("  sp:   %016lx\n", regs->sp);
    pr_info("  gp:   %016lx\n", regs->gp);
    pr_info("  tp:   %016lx\n", regs->tp);
    pr_info("  t0:   %016lx\n", regs->t0);
    pr_info("  t1:   %016lx\n", regs->t1);
    pr_info("  t2:   %016lx\n", regs->t2);
    pr_info("  s0:   %016lx\n", regs->s0);
    pr_info("  s1:   %016lx\n", regs->s1);
    pr_info("  a0:   %016lx\n", regs->a0);
    pr_info("  a1:   %016lx\n", regs->a1);
    pr_info("  a2:   %016lx\n", regs->a2);
    pr_info("  a3:   %016lx\n", regs->a3);
    pr_info("  a4:   %016lx\n", regs->a4);
    pr_info("  a5:   %016lx\n", regs->a5);
    pr_info("  a6:   %016lx\n", regs->a6);
    pr_info("  a7:   %016lx\n", regs->a7);
    pr_info("  s2:   %016lx\n", regs->s2);
    pr_info("  s3:   %016lx\n", regs->s3);
    pr_info("  s4:   %016lx\n", regs->s4);
    pr_info("  s5:   %016lx\n", regs->s5);
    pr_info("  s6:   %016lx\n", regs->s6);
    pr_info("  s7:   %016lx\n", regs->s7);
    pr_info("  s8:   %016lx\n", regs->s8);
    pr_info("  s9:   %016lx\n", regs->s9);
    pr_info("  s10:  %016lx\n", regs->s10);
    pr_info("  s11:  %016lx\n", regs->s11);
    pr_info("  t3:   %016lx\n", regs->t3);
    pr_info("  t4:   %016lx\n", regs->t4);
    pr_info("  t5:   %016lx\n", regs->t5);
    pr_info("  t6:   %016lx\n", regs->t6);
    pr_info("  cause: %016lx\n", regs->cause);
    pr_info("  tval:  %016lx\n", regs->tval);
    pr_info("  status: %016lx\n", regs->status);
}

// Example: Validating exception context
bool validate_exception_context(struct pt_regs *regs) {
    // Check if epc is valid
    if (!is_kernel_text(regs->epc) && !is_user_address(regs->epc)) {
        pr_err("Invalid epc: %016lx\n", regs->epc);
        return false;
    }

    // Check if stack pointer is valid
    if (!is_valid_stack_address(regs->sp)) {
        pr_err("Invalid sp: %016lx\n", regs->sp);
        return false;
    }

    // Check cause code
    if ((regs->cause & 0x7FFFFFFF) > MAX_VALID_CAUSE) {
        pr_err("Invalid cause: %016lx\n", regs->cause);
        return false;
    }

    return true;
}

// Example: Exception context inspection (GDB)
// In GDB, can inspect exception context:
// (gdb) print *regs
// Shows all register values
// (gdb) x/10i $pc  // Disassemble at epc
// (gdb) print regs->sp
```

**Explanation**:

- **Context dump** print all registers for debugging
- **Validation** validate exception context values
- **GDB inspection** use GDB to inspect exception context
- **Register access** access all saved registers
- **Fault diagnosis** context helps diagnose exception causes

## Next Steps

**What** you're ready for next:

After understanding exception context, you should be ready to:

1. **Learn Kernel Entry/Exit** - Kernel entry and exit mechanisms
2. **Study System Calls** - System call interface implementation
3. **Understand Signal Handling** - Signal delivery mechanisms
4. **Explore Debugging** - Advanced exception debugging
5. **Begin Exception Handling** - Write exception handlers

**Where** to go next:

Continue with the next lesson on **"Kernel Entry/Exit"** to learn:

- Kernel entry mechanisms
- Kernel exit mechanisms
- Entry/exit optimizations
- Entry/exit debugging
- Kernel/user space transitions

**Why** the next lesson is important:

Kernel entry and exit mechanisms control transitions between user and kernel space. Understanding these is essential for system call handling and exception processing.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel entry/exit code
2. **Use Debugger** - Debug kernel entry/exit
3. **Trace Execution** - Trace entry/exit flow
4. **Read Documentation** - Study RISC-V kernel documentation
5. **Experiment** - Modify entry/exit code and observe

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA](https://github.com/riscv/riscv-isa-manual) - Exception specification
- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Kernel documentation

**Kernel Sources**:

- [Linux RISC-V Exception Entry](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Entry code
