---
sidebar_position: 1
---

# Privilege Levels Overview

Master RISC-V privilege levels that provide security isolation and system management capabilities, essential for understanding Linux kernel operation on RISC-V architecture.

## What Are Privilege Levels?

**What**: Privilege levels are hardware-enforced execution modes that control which instructions and resources a program can access. RISC-V defines three privilege levels: User (U), Supervisor (S), and Machine (M).

**Why**: Privilege levels are crucial because:

- **Security Isolation** - Prevents user programs from accessing system resources
- **System Protection** - Protects kernel and system state from unauthorized access
- **Resource Control** - Manages access to privileged registers and instructions
- **Virtual Memory** - Enables virtual memory management in supervisor mode
- **Kernel Operation** - Kernel runs in supervisor mode with full privileges
- **System Calls** - Enables controlled access to kernel services

**When**: Privilege levels are active when:

- **System Boot** - Machine mode active during boot process
- **Kernel Execution** - Supervisor mode active when kernel is running
- **User Programs** - User mode active for application execution
- **Privilege Escalation** - Transitions occur for system calls and exceptions
- **Exception Handling** - Privilege may elevate during exception handling
- **Resource Access** - Every privileged operation checks current level

**How**: Privilege levels work through:

- **Hardware Enforcement** - CPU enforces privilege checks automatically
- **CSR Access Control** - Control and Status Registers have privilege requirements
- **Instruction Restrictions** - Some instructions only available in certain modes
- **Memory Protection** - Page tables enforce protection based on privilege
- **Exception Mechanism** - Privilege transitions occur via exceptions

**Where**: Privilege levels operate in:

- **All RISC-V Processors** - Required hardware feature
- **Linux Kernel** - Kernel uses supervisor mode
- **User Space** - Applications run in user mode
- **Boot Process** - Bootloader and early kernel use machine mode
- **Hypervisors** - May use hypervisor extension for additional level
- **Embedded Systems** - Simplified systems may use only machine mode

## Machine Mode (M Mode)

**What**: Machine mode is the highest privilege level with unrestricted access to all hardware features.

**Why**: Machine mode is essential because:

- **Boot Process** - Required for system initialization
- **Hardware Control** - Direct access to all hardware resources
- **Exception Handling** - Handles all exceptions and interrupts
- **Security Critical** - Only trusted code should run in machine mode
- **Kernel Support** - Provides services to kernel running in supervisor mode
- **System Configuration** - Configures processor and system features

**How**: Machine mode operates:

```c
// Example: Machine mode characteristics
// Machine mode (M mode) features:
// - Highest privilege level
// - Access to all CSRs
// - Can execute all instructions
// - Handles all exceptions and interrupts
// - Controls memory protection settings
// - Manages supervisor mode

// Machine mode CSR access
unsigned long read_mstatus(void) {
    unsigned long value;
    // CSRR instruction: Read CSR in machine mode
    // Only accessible from M mode
    __asm__ volatile("csrr %0, mstatus" : "=r"(value));
    return value;
}

// Example: Machine mode exception handling
void machine_mode_exception_handler(void) {
    unsigned long mcause;
    unsigned long mepc;
    unsigned long mtval;

    // Read exception cause
    __asm__ volatile("csrr %0, mcause" : "=r"(mcause));

    // Read exception program counter
    __asm__ volatile("csrr %0, mepc" : "=r"(mepc));

    // Read exception value
    __asm__ volatile("csrr %0, mtval" : "=r"(mtval));

    // Handle exception based on cause
    switch (mcause & 0x7FFFFFFF) {
        case CAUSE_ILLEGAL_INSTRUCTION:
            handle_illegal_instruction(mepc, mtval);
            break;
        case CAUSE_LOAD_ACCESS_FAULT:
            handle_load_fault(mepc, mtval);
            break;
        // ... other exception types
    }

    // Return from exception (MRET instruction)
}

// Example: Machine mode boot sequence
void machine_mode_boot(void) {
    // Initialize machine mode CSRs
    unsigned long mstatus_value = 0;

    // Set MPP (Machine Previous Privilege) to supervisor mode
    // After MRET, will enter supervisor mode
    mstatus_value |= MSTATUS_MPP_S << MSTATUS_MPP_SHIFT;

    // Set MIE (Machine Interrupt Enable)
    mstatus_value |= MSTATUS_MIE;

    // Write mstatus
    __asm__ volatile("csrw mstatus, %0" : : "r"(mstatus_value));

    // Set exception handler address
    __asm__ volatile("csrw mtvec, %0" : : "r"(exception_handler));

    // Set machine trap handler
    setup_machine_trap_handler();

    // Initialize machine mode features
    init_machine_mode();

    // Transition to supervisor mode for kernel
    enter_supervisor_mode();
}
```

**Explanation**:

- **Highest privilege** machine mode has complete system control
- **CSR access** all machine CSRs (mstatus, mcause, mepc, etc.) accessible
- **Exception handling** machine mode handles all exceptions initially
- **Boot sequence** system starts in machine mode during boot
- **Transition control** machine mode controls entry into supervisor mode
- **Security critical** only most trusted code should use machine mode

## Supervisor Mode (S Mode)

**What**: Supervisor mode is the privilege level where operating system kernels, including Linux, execute.

**Why**: Supervisor mode is important because:

- **Kernel Execution** - Linux kernel runs in supervisor mode
- **Virtual Memory** - Manages virtual memory and page tables
- **System Calls** - Handles system calls from user mode
- **Resource Management** - Manages system resources and scheduling
- **Device Access** - Controls access to I/O devices
- **User Protection** - Protects system from user program errors

**How**: Supervisor mode operates:

```c
// Example: Supervisor mode kernel execution
// Linux kernel runs in supervisor mode (S mode)
// Kernel has access to:
// - Supervisor CSRs (sstatus, sepc, scause, etc.)
// - Memory management (satp register for page tables)
// - Supervisor instructions (SFENCE.VMA, etc.)
// - Interrupt handling (for kernel interrupts)

// Example: Kernel entry point in supervisor mode
asmlinkage void kernel_entry(void) {
    // Kernel starts here in supervisor mode
    // Called from machine mode via MRET instruction

    // Initialize supervisor mode
    unsigned long sstatus;

    // Read supervisor status register
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Enable supervisor interrupt enable (SIE)
    sstatus |= SSTATUS_SIE;

    // Write back sstatus
    __asm__ volatile("csrw sstatus, %0" : : "r"(sstatus));

    // Set supervisor trap vector
    __asm__ volatile("csrw stvec, %0" : : "r"(supervisor_trap_handler));

    // Initialize kernel subsystems
    setup_paging();
    setup_interrupts();
    init_scheduler();

    // Start kernel execution
    start_kernel();
}

// Example: System call handling in supervisor mode
asmlinkage long sys_read(unsigned int fd, char __user *buf, size_t count) {
    // System call invoked from user mode via ECALL
    // Kernel runs in supervisor mode

    struct file *file;
    ssize_t ret;

    // Access user memory (requires proper checks)
    if (!access_ok(buf, count)) {
        return -EFAULT;
    }

    // Get file descriptor
    file = fget(fd);
    if (!file) {
        return -EBADF;
    }

    // Perform read operation
    ret = vfs_read(file, buf, count, &file->f_pos);

    fput(file);
    return ret;
}

// Example: Supervisor mode page table management
void setup_kernel_paging(void) {
    unsigned long satp_value;

    // Build page table for kernel
    build_kernel_page_table();

    // Set supervisor address translation and protection (satp)
    // Contains: mode bits, ASID, and page table root
    satp_value = (SATP_MODE_SV39 << SATP_MODE_SHIFT) |
                 (kernel_pgtable_root >> PAGE_SHIFT);

    // Write satp register (only in supervisor mode)
    __asm__ volatile("csrw satp, %0" : : "r"(satp_value));

    // Flush TLB after changing page table
    __asm__ volatile("sfence.vma");
}
```

**Explanation**:

- **Kernel execution** Linux kernel operates entirely in supervisor mode
- **Virtual memory** supervisor mode manages page tables via satp register
- **System calls** ECALL from user mode enters supervisor mode for system call
- **CSR access** supervisor CSRs accessible, machine CSRs require delegation
- **Memory protection** supervisor mode can access all memory, user mode restricted
- **Interrupts** supervisor mode handles kernel interrupts and exceptions

## User Mode (U Mode)

**What**: User mode is the lowest privilege level where application programs execute with restricted access.

**Why**: User mode is essential because:

- **Application Execution** - User programs run in user mode
- **Security** - Prevents programs from accessing system resources
- **Isolation** - Isolates programs from each other
- **Stability** - Errors in user programs don't crash system
- **Resource Protection** - Protects kernel and system hardware
- **Virtual Memory** - User programs use virtual addresses

**How**: User mode operates:

```c
// Example: User mode program execution
// Applications run in user mode (U mode)
// Restrictions:
// - Cannot access privileged CSRs
// - Cannot execute privileged instructions
// - Cannot access kernel memory
// - Cannot directly access I/O devices
// - Must use system calls for kernel services

// Example: User mode program entry
// When program starts, it runs in user mode
// Process created by kernel (in supervisor mode)
// Kernel sets up user mode context:
// - User page tables
// - User stack
// - Program entry point
// - Initial register values

// Kernel code that sets up user mode process
void setup_user_process(struct task_struct *task, unsigned long entry) {
    // Set up user mode context
    struct pt_regs *regs = task_pt_regs(task);

    // Set program counter to entry point
    regs->epc = entry;

    // Set stack pointer to user stack
    regs->sp = task->mm->start_stack;

    // Set privilege mode to user (SPP = 0 in sstatus)
    // This will be restored when process starts

    // Set up user page tables
    setup_user_paging(task->mm);

    // Mark process as ready to run in user mode
    task->flags |= PF_USER_THREAD;
}

// Example: System call from user mode
// User program calls read() function
// Library function executes:
ssize_t user_read(int fd, void *buf, size_t count) {
    // System call instruction
    // ECALL instruction triggers exception
    // Exception handler in supervisor mode services request

    register long a0 asm("a0") = fd;
    register void *a1 asm("a1") = buf;
    register size_t a2 asm("a2") = count;
    register long syscall_no asm("a7") = __NR_read;
    register long ret asm("a0");

    __asm__ volatile(
        "ecall\n"          // System call instruction
        : "=r"(ret)
        : "r"(a0), "r"(a1), "r"(a2), "r"(syscall_no)
        : "memory"
    );

    return ret;
}

// Example: User mode memory access
// User program allocates memory (uses system calls)
void *user_malloc(size_t size) {
    // mmap system call to allocate memory
    // Kernel (supervisor mode) allocates pages
    // Returns virtual address usable in user mode

    void *addr = mmap(NULL, size, PROT_READ | PROT_WRITE,
                      MAP_PRIVATE | MAP_ANONYMOUS, -1, 0);
    return addr;
}

// Example: User mode page fault handling
// If user program accesses invalid memory:
// 1. CPU generates page fault exception
// 2. Exception enters supervisor mode
// 3. Kernel checks if access is valid
// 4. If valid, kernel fixes page table and returns
// 5. If invalid, kernel sends SIGSEGV to process
```

**Explanation**:

- **Restricted access** user mode cannot access privileged resources
- **System calls** ECALL instruction transitions to supervisor mode
- **Memory protection** user programs can only access their own memory
- **Exception handling** user exceptions handled by kernel in supervisor mode
- **Virtual addresses** user programs use virtual addresses translated by page tables
- **Error isolation** errors in user mode don't affect kernel or other processes

## Privilege Level Encoding

**What**: Privilege levels are encoded in Control and Status Registers to track current and previous privilege levels.

**How**: Privilege encoding works:

```c
// Example: Privilege level encoding in CSRs
// Privilege levels encoded as 2-bit values:
#define PRV_U  0  // User mode
#define PRV_S  1  // Supervisor mode
#define PRV_M  3  // Machine mode (uses value 3, not 2)

// mstatus register fields:
// MPP[1:0] - Machine Previous Privilege (privilege before M mode trap)
// SPP[0]   - Supervisor Previous Privilege (privilege before S mode trap)
// MPRV    - Modify Privilege (use MPP for memory access)
// MIE     - Machine Interrupt Enable
// SIE     - Supervisor Interrupt Enable
// UIE     - User Interrupt Enable

// Example: Reading current privilege level
unsigned int get_current_privilege(void) {
    unsigned long mstatus;
    unsigned int privilege;

    // Read mstatus register (only accessible in M/S mode)
    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Extract current privilege from implementation-specific CSR
    // Or use mstatus.MPP if in exception handler
    // In practice, privilege level is implicit based on which CSRs are accessible

    return privilege;
}

// Example: Setting privilege in mstatus
void set_previous_privilege(unsigned int prv) {
    unsigned long mstatus;

    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Set MPP (Machine Previous Privilege) field
    // Clears old MPP bits, sets new MPP
    mstatus &= ~MSTATUS_MPP_MASK;
    mstatus |= (prv << MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    __asm__ volatile("csrw mstatus, %0" : : "r"(mstatus));
}

// Example: Privilege level checking in kernel
bool is_user_mode(void) {
    unsigned long sstatus;

    // In supervisor mode, check SPP (Supervisor Previous Privilege)
    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // SPP bit indicates if we came from user mode (0) or supervisor mode (1)
    return (sstatus & SSTATUS_SPP) == 0;
}

// Example: Kernel check before accessing user memory
bool may_access_user_memory(void __user *addr, size_t len) {
    // Check if in user mode context
    if (is_user_mode()) {
        // In user mode, can access user memory
        return true;
    }

    // In supervisor mode (kernel), need to use special access functions
    // access_ok() checks if user address is valid
    return access_ok(addr, len);
}
```

**Explanation**:

- **2-bit encoding** privilege levels use 2-bit values (0=U, 1=S, 3=M)
- **Previous privilege** CSRs track privilege level before exception/trap
- **MPP field** in mstatus stores previous privilege for machine mode traps
- **SPP field** in sstatus stores previous privilege for supervisor mode traps
- **Implicit privilege** privilege level determines which CSRs are accessible
- **Mode checking** kernel code checks privilege to determine behavior

## Privilege Level Hierarchy

**What**: RISC-V privilege levels form a hierarchy where higher levels can access all features of lower levels plus additional privileged features.

**Why**: Hierarchy is important because:

- **Access Control** - Higher levels can access lower level resources
- **Delegation** - Higher levels can delegate to lower levels
- **Exception Handling** - Exceptions elevate privilege
- **System Design** - Enables layered security model
- **Flexibility** - Systems can use subset of privilege levels

**How**: Hierarchy operates:

```
Machine Mode (M)
    ├── Highest privilege
    ├── Access to all CSRs
    ├── Handles all exceptions
    ├── Can delegate to Supervisor mode
    └── Controls system configuration

Supervisor Mode (S)
    ├── Medium privilege
    ├── Access to Supervisor CSRs
    ├── Manages virtual memory
    ├── Handles system calls from User mode
    └── Delegated exceptions from Machine mode

User Mode (U)
    ├── Lowest privilege
    ├── No privileged instruction access
    ├── Limited CSR access
    ├── Virtual memory access only
    └── System calls required for kernel services
```

**Explanation**:

- **Nested access** each level includes capabilities of lower levels
- **Delegation** machine mode can delegate exceptions to supervisor mode
- **Exception flow** exceptions can elevate privilege level
- **Return mechanism** MRET/SRET instructions restore previous privilege
- **System call flow** user mode → supervisor mode → back to user mode

## Next Steps

**What** you're ready for next:

After understanding privilege levels overview, you should be ready to:

1. **Learn Privilege Transitions** - How to change between privilege levels
2. **Study CSR Access** - Detailed CSR access rules for each level
3. **Understand Exception Handling** - How exceptions affect privilege
4. **Explore Delegation** - Machine mode delegating to supervisor mode
5. **Begin Kernel Development** - Apply privilege level knowledge

**Where** to go next:

Continue with the next lesson on **"Privilege Transitions"** to learn:

- Transition mechanisms (MRET, SRET, ECALL)
- Exception entry and return
- System call mechanism
- Delegation setup
- Practical transition examples

**Why** the next lesson is important:

Privilege transitions are how the system moves between modes during normal operation. Understanding transitions is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine kernel privilege transition code
2. **Use Debugger** - Observe privilege transitions in GDB
3. **Read Spec** - Study RISC-V privilege specification
4. **Experiment** - Write code to test privilege transitions
5. **Analyze Traces** - Study instruction traces showing transitions

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA Specification](https://github.com/riscv/riscv-isa-manual) - Complete privilege specification
- [RISC-V Foundation](https://riscv.org/technical/specifications/) - All RISC-V specifications

**Kernel Sources**:

- [Linux RISC-V Kernel](https://github.com/torvalds/linux/tree/master/arch/riscv) - Kernel privilege level code
- [RISC-V Kernel Entry](https://github.com/torvalds/linux/tree/master/arch/riscv/kernel) - Kernel entry points
