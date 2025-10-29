---
sidebar_position: 3
---

# CSR Access

Master Control and Status Register (CSR) access in RISC-V, understanding how to read and write CSRs at different privilege levels, essential for kernel development and system configuration.

## What Are CSRs?

**What**: Control and Status Registers (CSRs) are special registers that control processor behavior and provide status information. They are accessed using special CSR instructions rather than regular load/store.

**Why**: Understanding CSR access is crucial because:

- **System Control** - CSRs control processor and system behavior
- **Status Information** - CSRs report processor and system status
- **Privilege Control** - CSRs manage privilege levels and transitions
- **Exception Handling** - CSRs store exception context and control
- **Memory Management** - CSRs control virtual memory and page tables
- **Kernel Operation** - Kernel extensively uses CSRs for system management

**When**: CSR access occurs when:

- **System Initialization** - Configuring processor at boot
- **Exception Handling** - Reading/writing exception CSRs
- **Context Switching** - Saving/restoring CSR state
- **Memory Management** - Configuring page tables via satp
- **Interrupt Control** - Enabling/disabling interrupts
- **Debugging** - Inspecting CSR values for debugging

**How**: CSR access works through:

- **CSR Instructions** - Special instructions for CSR access
- **Privilege Checking** - Hardware checks privilege before access
- **Read/Write/Atomic** - Different access types for different operations
- **Field Encoding** - CSRs use bit fields for multiple values
- **Side Effects** - Some CSR writes have additional effects

**Where**: CSR access is found in:

- **Kernel Code** - Extensive CSR usage in kernel
- **Boot Code** - Early boot configuration uses CSRs
- **Exception Handlers** - Read/write exception CSRs
- **System Libraries** - Some library functions use CSRs
- **Debuggers** - Debuggers read CSRs for inspection

## CSR Instruction Types

**What**: RISC-V provides several CSR instructions for reading, writing, and atomic read-modify-write operations.

**Why**: Different instruction types are needed because:

- **Atomic Operations** - Need atomic read-modify-write
- **Efficiency** - Single instruction for common operations
- **Side Effects** - Some operations have implicit side effects
- **Bit Manipulation** - Set/clear bits without reading first

**How**: CSR instructions operate:

```c
// Example: CSR instruction types
// CSRRW: CSR Read-Write (atomic swap)
//        rd = CSR; CSR = rs1
// CSRR:  CSR Read (alias for CSRRW with rs1=x0)
//        rd = CSR
// CSRW:  CSR Write (alias for CSRRW with rd=x0)
//        CSR = rs1

// CSRRS: CSR Read-Set (atomic set bits)
//        rd = CSR; CSR = CSR | rs1
// CSRS:  CSR Read-Set (rs1=x0 is no-op)
//        CSR = CSR | rs1

// CSRRC: CSR Read-Clear (atomic clear bits)
//        rd = CSR; CSR = CSR & ~rs1
// CSRC:  CSR Read-Clear (rs1=x0 is no-op)
//        CSR = CSR & ~rs1

// Immediate variants (5-bit immediate instead of register):
// CSRRWI, CSRRSI, CSRRCI

// Example: Reading CSRs in kernel
unsigned long read_mstatus(void) {
    unsigned long value;
    // CSRR instruction: read mstatus into value
    __asm__ volatile("csrr %0, mstatus" : "=r"(value));
    return value;
}

// Example: Writing CSRs in kernel
void write_mstatus(unsigned long value) {
    // CSRW instruction: write value to mstatus
    __asm__ volatile("csrw mstatus, %0" : : "r"(value));
}

// Example: Atomic read-modify-write
unsigned long modify_mstatus_bit(unsigned long mask, bool set) {
    unsigned long old_value, new_value;

    if (set) {
        // CSRR: Read current value
        // CSRRS: Set bits (atomic)
        __asm__ volatile(
            "csrr %0, mstatus\n"
            "csrs mstatus, %1\n"
            : "=r"(old_value)
            : "r"(mask)
            : "memory"
        );
        new_value = old_value | mask;
    } else {
        // CSRR: Read current value
        // CSRRC: Clear bits (atomic)
        __asm__ volatile(
            "csrr %0, mstatus\n"
            "csrc mstatus, %1\n"
            : "=r"(old_value)
            : "r"(mask)
            : "memory"
        );
        new_value = old_value & ~mask;
    }

    return old_value;
}

// Example: Using immediate CSR instructions
void enable_interrupts(void) {
    // CSRRSI: Set bit using immediate value
    // Set bit 3 (SIE) in sstatus
    __asm__ volatile("csrsi sstatus, 1 << 3");
}

void disable_interrupts(void) {
    // CSRRCI: Clear bit using immediate value
    // Clear bit 3 (SIE) in sstatus
    __asm__ volatile("csrci sstatus, 1 << 3");
}
```

**Explanation**:

- **CSRRW** performs atomic read and write in single instruction
- **CSRRS/CSRRC** atomically set or clear bits without read-modify-write loop
- **Immediate variants** use 5-bit immediate for small constants
- **Atomicity** ensures CSR updates are atomic even in multi-core systems
- **Side effects** some CSR writes trigger hardware actions automatically

## Machine Mode CSRs

**What**: Machine mode CSRs provide complete system control and are only accessible from machine mode (or delegated to supervisor mode).

**Why**: Machine mode CSRs are essential because:

- **System Control** - Configure entire processor and system
- **Boot Process** - Required for system initialization
- **Exception Handling** - Machine mode exception control
- **Security** - Restricted access provides security boundary
- **Delegation** - Control delegation to supervisor mode
- **Debugging** - Machine mode debugging features

**How**: Machine mode CSRs operate:

```c
// Example: Machine mode status and control CSRs
// mstatus: Machine Status Register
// - Controls processor state and privilege
// - MPP: Previous privilege level
// - MIE: Machine interrupt enable
// - MPIE: Previous MIE value

struct mstatus_fields {
    unsigned long mpp: 2;      // Machine Previous Privilege
    unsigned long mpie: 1;      // Machine Previous Interrupt Enable
    unsigned long mie: 1;       // Machine Interrupt Enable
    unsigned long mprv: 1;      // Modify Privilege (for loads/stores)
    // ... more fields
};

// Example: Reading and manipulating mstatus
unsigned long get_previous_privilege(void) {
    unsigned long mstatus;

    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Extract MPP field (bits 12:11)
    return (mstatus >> MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;
}

void set_previous_privilege(unsigned int priv) {
    unsigned long mstatus;

    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Clear MPP field
    mstatus &= ~MSTATUS_MPP_MASK;

    // Set new MPP value
    mstatus |= (priv << MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    __asm__ volatile("csrw mstatus, %0" : : "r"(mstatus));
}

// Example: Exception cause and value CSRs
// mcause: Machine Exception Cause Register
// - Bits [30:0]: Exception cause code
// - Bit 31: Interrupt bit (1=interrupt, 0=exception)

unsigned long get_exception_cause(void) {
    unsigned long mcause;

    __asm__ volatile("csrr %0, mcause" : "=r"(mcause));
    return mcause;
}

bool is_interrupt(unsigned long cause) {
    // Check interrupt bit (bit 31)
    return (cause >> 31) != 0;
}

unsigned int get_exception_code(unsigned long cause) {
    // Extract exception code (bits 30:0)
    return cause & 0x7FFFFFFF;
}

// mepc: Machine Exception Program Counter
// - Contains PC of instruction that caused exception
// - Or PC to return to after exception handling

void set_exception_return_address(unsigned long pc) {
    __asm__ volatile("csrw mepc, %0" : : "r"(pc));
}

unsigned long get_exception_return_address(void) {
    unsigned long mepc;
    __asm__ volatile("csrr %0, mepc" : "=r"(mepc));
    return mepc;
}

// mtval: Machine Trap Value Register
// - Contains exception-specific value
// - For page faults: fault address
// - For illegal instruction: instruction bits
// - For misaligned access: address

unsigned long get_trap_value(void) {
    unsigned long mtval;
    __asm__ volatile("csrr %0, mtval" : "=r"(mtval));
    return mtval;
}

// Example: Machine trap vector CSR
// mtvec: Machine Trap Vector Base Address Register
// - Base address of exception handler
// - Mode bits control exception handling mode

void set_machine_trap_handler(void (*handler)(void)) {
    unsigned long mtvec_value;

    // Set handler address with direct mode (mode = 0)
    mtvec_value = (unsigned long)handler;

    // Direct mode: all exceptions jump to base address
    // Vector mode: exceptions jump to base + (4 * cause)

    __asm__ volatile("csrw mtvec, %0" : : "r"(mtvec_value));
}

// Example: Machine delegation CSRs
// medeleg: Machine Exception Delegation Register
// - Each bit controls delegation of specific exception
// - Bit set = delegate to supervisor mode
// - Bit clear = handle in machine mode

void delegate_user_exceptions(void) {
    unsigned long medeleg = 0;

    // Delegate user mode exceptions to supervisor
    medeleg |= (1UL << CAUSE_ILLEGAL_INSTRUCTION);
    medeleg |= (1UL << CAUSE_INSTRUCTION_ACCESS_FAULT);
    medeleg |= (1UL << CAUSE_LOAD_ACCESS_FAULT);
    medeleg |= (1UL << CAUSE_STORE_ACCESS_FAULT);
    medeleg |= (1UL << CAUSE_USER_ECALL);
    medeleg |= (1UL << CAUSE_INSTRUCTION_PAGE_FAULT);
    medeleg |= (1UL << CAUSE_LOAD_PAGE_FAULT);
    medeleg |= (1UL << CAUSE_STORE_PAGE_FAULT);

    __asm__ volatile("csrw medeleg, %0" : : "r"(medeleg));
}

// mideleg: Machine Interrupt Delegation Register
void delegate_supervisor_interrupts(void) {
    unsigned long mideleg = 0;

    // Delegate supervisor interrupts to supervisor mode
    mideleg |= (1UL << IRQ_S_SOFT);   // Supervisor software interrupt
    mideleg |= (1UL << IRQ_S_TIMER);  // Supervisor timer interrupt
    mideleg |= (1UL << IRQ_S_EXT);    // Supervisor external interrupt

    __asm__ volatile("csrw mideleg, %0" : : "r"(mideleg));
}
```

**Explanation**:

- **mstatus** central control register for machine mode state
- **mcause** identifies exception or interrupt type
- **mepc** saved PC for exception return
- **mtval** exception-specific data (fault address, instruction, etc.)
- **mtvec** exception handler entry point
- **medeleg/mideleg** control delegation to supervisor mode

## Supervisor Mode CSRs

**What**: Supervisor mode CSRs provide kernel control of virtual memory, exceptions, and supervisor-level operations.

**Why**: Supervisor CSRs are critical because:

- **Kernel Operation** - Kernel uses these CSRs extensively
- **Virtual Memory** - satp register controls page tables
- **Exception Handling** - Supervisor exception control
- **System Calls** - System call mechanism uses supervisor CSRs
- **Process Management** - Context switching uses supervisor CSRs

**How**: Supervisor CSRs operate:

```c
// Example: Supervisor status register (sstatus)
// sstatus: Supervisor Status Register
// - Similar to mstatus but for supervisor mode
// - SPP: Supervisor Previous Privilege
// - SIE: Supervisor Interrupt Enable
// - SPIE: Previous SIE value

void enable_supervisor_interrupts(void) {
    unsigned long sstatus;

    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // Set SIE bit (Supervisor Interrupt Enable)
    sstatus |= SSTATUS_SIE;

    __asm__ volatile("csrw sstatus, %0" : : "r"(sstatus));
}

bool was_user_mode(void) {
    unsigned long sstatus;

    __asm__ volatile("csrr %0, sstatus" : "=r"(sstatus));

    // SPP bit: 0 = came from user mode, 1 = came from supervisor mode
    return (sstatus & SSTATUS_SPP) == 0;
}

// Example: Supervisor exception CSRs
// scause: Supervisor Exception Cause Register
// - Exception/interrupt cause for supervisor traps

unsigned long get_supervisor_cause(void) {
    unsigned long scause;
    __asm__ volatile("csrr %0, scause" : "=r"(scause));
    return scause;
}

// sepc: Supervisor Exception Program Counter
// - PC of exception or return address

void set_supervisor_return_address(unsigned long pc) {
    __asm__ volatile("csrw sepc, %0" : : "r"(pc));
}

// stval: Supervisor Trap Value Register
// - Exception-specific value

unsigned long get_supervisor_trap_value(void) {
    unsigned long stval;
    __asm__ volatile("csrr %0, stval" : "=r"(stval));
    return stval;
}

// stvec: Supervisor Trap Vector Base Address Register
// - Supervisor exception handler address

void set_supervisor_trap_handler(void (*handler)(void)) {
    unsigned long stvec_value = (unsigned long)handler;

    // Set direct mode (mode = 0)
    __asm__ volatile("csrw stvec, %0" : : "r"(stvec_value));
}

// Example: Supervisor address translation and protection (satp)
// satp: Controls virtual memory and page tables
// - MODE: Page table mode (SV39, SV48, etc.)
// - ASID: Address Space ID (for TLB management)
// - PPN: Page table root physical page number

void setup_kernel_paging(unsigned long pgtable_root) {
    unsigned long satp_value;

    // Configure satp register
    // Mode: SV39 (39-bit virtual addressing)
    // ASID: 0 (kernel space)
    // PPN: Physical page number of page table root
    satp_value = (SATP_MODE_SV39 << SATP_MODE_SHIFT) |
                 (0 << SATP_ASID_SHIFT) |
                 (pgtable_root >> PAGE_SHIFT);

    __asm__ volatile("csrw satp, %0" : : "r"(satp_value));

    // Flush TLB after changing page table
    __asm__ volatile("sfence.vma");
}

unsigned long get_current_page_table(void) {
    unsigned long satp;

    __asm__ volatile("csrr %0, satp" : "=r"(satp));

    // Extract PPN (Page table root)
    return (satp & SATP_PPN_MASK) << PAGE_SHIFT;
}

void switch_page_table(unsigned long new_pgtable) {
    unsigned long satp_value;

    // Build new satp value
    satp_value = (SATP_MODE_SV39 << SATP_MODE_SHIFT) |
                 (new_pgtable >> PAGE_SHIFT);

    // Write satp register
    __asm__ volatile("csrw satp, %0" : : "r"(satp_value));

    // Flush TLB to invalidate old translations
    __asm__ volatile("sfence.vma");
}

// Example: Supervisor interrupt pending/enable CSRs
// sip: Supervisor Interrupt Pending Register
// - Shows which interrupts are pending

unsigned long get_pending_interrupts(void) {
    unsigned long sip;
    __asm__ volatile("csrr %0, sip" : "=r"(sip));
    return sip;
}

// sie: Supervisor Interrupt Enable Register
// - Controls which interrupts are enabled

void enable_timer_interrupt(void) {
    unsigned long sie;

    __asm__ volatile("csrr %0, sie" : "=r"(sie));
    sie |= (1UL << IRQ_S_TIMER);
    __asm__ volatile("csrw sie, %0" : : "r"(sie));
}
```

**Explanation**:

- **sstatus** supervisor status and control
- **scause/sepc/stval** supervisor exception information
- **stvec** supervisor exception handler entry point
- **satp** critical for virtual memory management
- **sie/sip** supervisor interrupt control
- **TLB management** satp changes require TLB flushing

## CSR Access Control

**What**: CSR access is controlled by privilege level - each CSR can only be accessed from appropriate privilege levels.

**Why**: Access control is essential because:

- **Security** - Prevents unauthorized CSR access
- **System Protection** - Protects system configuration
- **Privilege Isolation** - Enforces privilege level boundaries
- **Error Prevention** - Prevents incorrect CSR modifications
- **Hardware Enforcement** - Hardware automatically enforces rules

**How**: Access control works:

```c
// Example: CSR access rules
// Machine CSRs (mxxx): Only accessible from Machine mode
// Supervisor CSRs (sxxx): Accessible from Supervisor and Machine mode
// User CSRs (uxxx): Accessible from all modes

// Attempting to access CSR from wrong privilege causes exception:
// - Illegal instruction exception if CSR doesn't exist
// - Illegal instruction exception if privilege insufficient

// Example: Checking CSR access
bool can_access_csr(unsigned long csr_addr) {
    // CSR addresses encode privilege level
    // Bits [9:8] indicate access permission:
    // 00 = User/supervisor/machine
    // 01 = Supervisor/machine
    // 11 = Machine only

    unsigned int access_level = (csr_addr >> 8) & 0x3;
    unsigned int current_priv = get_current_privilege();

    switch (access_level) {
        case 0:  // All modes
            return true;
        case 1:  // Supervisor and machine
            return current_priv >= PRV_S;
        case 3:  // Machine only
            return current_priv == PRV_M;
        default:
            return false;
    }
}

// Example: Safe CSR access with error handling
int safe_csr_read(unsigned long csr_addr, unsigned long *value) {
    // Try to read CSR
    // If privilege insufficient, exception will occur
    // Exception handler should return error

    unsigned long temp;

    __asm__ volatile(
        "csrr %0, %1"
        : "=r"(temp)
        : "i"(csr_addr)
        : "memory"
    );

    *value = temp;
    return 0;
}

// Example: Conditional CSR access
void setup_supervisor_features(void) {
    unsigned long misa;

    // Check if supervisor mode is available
    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    // Check 'S' bit (supervisor mode support)
    if (misa & (1UL << 'S' - 'A')) {
        // Supervisor mode available, set up supervisor CSRs

        // Set supervisor trap handler
        set_supervisor_trap_handler(supervisor_trap_handler);

        // Delegate exceptions to supervisor
        delegate_user_exceptions();
    } else {
        // Supervisor mode not available
        // Must handle everything in machine mode
        set_machine_trap_handler(machine_trap_handler);
    }
}
```

**Explanation**:

- **CSR encoding** CSR addresses encode access permissions in bits [9:8]
- **Hardware enforcement** CPU automatically checks privilege before CSR access
- **Exception on violation** illegal instruction exception if access denied
- **Access levels** 00=all, 01=s/m, 11=machine only
- **Conditional access** check misa to determine available features

## Common CSR Usage Patterns

**What**: Common patterns for CSR manipulation in kernel code.

**How**: Practical patterns:

```c
// Example: Save/restore CSR state
struct csr_save_area {
    unsigned long sstatus;
    unsigned long sepc;
    unsigned long satp;
    unsigned long sie;
};

void save_csr_state(struct csr_save_area *save) {
    __asm__ volatile("csrr %0, sstatus" : "=r"(save->sstatus));
    __asm__ volatile("csrr %0, sepc" : "=r"(save->sepc));
    __asm__ volatile("csrr %0, satp" : "=r"(save->satp));
    __asm__ volatile("csrr %0, sie" : "=r"(save->sie));
}

void restore_csr_state(struct csr_save_area *save) {
    __asm__ volatile("csrw sstatus, %0" : : "r"(save->sstatus));
    __asm__ volatile("csrw sepc, %0" : : "r"(save->sepc));
    __asm__ volatile("csrw satp, %0" : : "r"(save->satp));
    __asm__ volatile("csrw sie, %0" : : "r"(save->sie));

    // Flush TLB after satp change
    __asm__ volatile("sfence.vma");
}

// Example: Atomic interrupt enable/disable
unsigned long disable_interrupts_save(void) {
    unsigned long sstatus;

    // Read and clear SIE atomically
    __asm__ volatile(
        "csrrci %0, sstatus, 1 << 3"
        : "=r"(sstatus)
        :: "memory"
    );

    // Return old SIE value
    return sstatus & SSTATUS_SIE;
}

void restore_interrupts(unsigned long old_sie) {
    if (old_sie) {
        // Restore SIE if it was enabled
        __asm__ volatile("csrsi sstatus, 1 << 3");
    } else {
        // Keep SIE disabled
        __asm__ volatile("csrci sstatus, 1 << 3");
    }
}

// Example: Critical section with interrupt disable
void critical_section(void (*func)(void)) {
    unsigned long old_sie = disable_interrupts_save();

    // Execute critical code
    func();

    // Restore interrupt state
    restore_interrupts(old_sie);
}

// Example: CSR manipulation macros
#define csr_read(csr) ({ \
    unsigned long __val; \
    __asm__ volatile("csrr %0, " #csr : "=r"(__val)); \
    __val; \
})

#define csr_write(csr, val) ({ \
    __asm__ volatile("csrw " #csr ", %0" :: "r"(val)); \
})

#define csr_set(csr, mask) ({ \
    __asm__ volatile("csrs " #csr ", %0" :: "r"(mask)); \
})

#define csr_clear(csr, mask) ({ \
    __asm__ volatile("csrc " #csr ", %0" :: "r"(mask)); \
})

// Usage examples:
// unsigned long status = csr_read(sstatus);
// csr_write(sepc, new_pc);
// csr_set(sstatus, SSTATUS_SIE);
// csr_clear(sstatus, SSTATUS_SIE);
```

**Explanation**:

- **Save/restore** save CSR state before modification, restore after
- **Atomic operations** use atomic CSR instructions for interrupt control
- **Critical sections** disable interrupts around critical code
- **Macros** helper macros simplify CSR access code
- **TLB flushing** remember to flush TLB after satp changes

## Next Steps

**What** you're ready for next:

After mastering CSR access, you should be ready to:

1. **Learn Exception Handling** - Complete exception handling mechanisms
2. **Study Interrupt Control** - Detailed interrupt CSR usage
3. **Understand Memory Management** - satp and page table CSRs
4. **Explore Debug CSRs** - Debug and performance monitoring CSRs
5. **Begin Kernel Development** - Apply CSR knowledge in kernel code

**Where** to go next:

Continue with the next lesson on **"Exception Handling"** to learn:

- Complete exception handling mechanism
- Exception types and causes
- Exception vector setup
- Exception context saving
- Practical exception handlers

**Why** the next lesson is important:

Exception handling is fundamental to kernel operation. Understanding exception handling with CSRs is essential for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine exception handler code
2. **Read Spec** - Study RISC-V exception specification
3. **Use Debugger** - Inspect CSRs during exceptions
4. **Write Handlers** - Implement exception handlers
5. **Analyze Traces** - Study exception handling traces

## Resources

**Official Documentation**:

- [RISC-V Privileged ISA - CSRs](https://github.com/riscv/riscv-isa-manual) - CSR specification
- [RISC-V CSR List](https://github.com/riscv/riscv-isa-manual/blob/master/src/supervisor.tex) - Complete CSR reference

**Kernel Sources**:

- [Linux RISC-V CSR Usage](https://github.com/torvalds/linux/tree/master/arch/riscv) - Kernel CSR code
