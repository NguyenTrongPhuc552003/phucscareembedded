---
sidebar_position: 2
---

# Base ISA

Master the RISC-V Base Instruction Set Architecture (ISA) with detailed explanations and code examples, essential for understanding RISC-V kernel development.

## What is the Base ISA?

**What**: The Base ISA is the mandatory instruction set that all RISC-V implementations must support. It provides the fundamental operations needed for basic computing: arithmetic, logic, memory access, control flow, and system operations.

**Why**: Understanding the Base ISA is crucial because:

- **Foundation** - All RISC-V software relies on base ISA instructions
- **Compatibility** - Ensures software runs on any RISC-V processor
- **Kernel Development** - Kernel uses base ISA for core operations
- **Portability** - Base ISA provides portable software interface
- **Simplicity** - Minimal instruction set reduces complexity
- **Performance** - Understanding instructions enables optimization

**When**: The Base ISA is used when:

- **Every Instruction Execution** - Base ISA instructions are always available
- **Boot Code** - Early boot relies entirely on base ISA
- **Kernel Operations** - Core kernel functions use base ISA
- **Compilation** - Compilers generate base ISA instructions
- **Assembly Programming** - Assembly uses base ISA mnemonics
- **Code Analysis** - Understanding base ISA aids debugging

**How**: The Base ISA operates through:

- **Fixed-Length Instructions** - All instructions are 32 bits (in RV32I/RV64I)
- **Register-Based Operations** - Operations use general-purpose registers
- **Load/Store Architecture** - Memory accessed only through load/store
- **Simple Encoding** - Regular instruction formats simplify decoding
- **Minimal Instructions** - Small instruction set for common operations

**Where**: Base ISA is found in:

- **All RISC-V Processors** - Required minimum instruction set
- **Linux Kernel** - Core kernel operations
- **Bootloaders** - System initialization code
- **Compilers** - Generated machine code
- **Emulators** - QEMU and other RISC-V simulators
- **VisionFive 2** - Base ISA in all execution modes

## Integer Arithmetic Instructions

**What**: Integer arithmetic instructions perform mathematical operations on integer values stored in registers.

**Why**: Arithmetic instructions are fundamental because:

- **Computation** - Core operations for all programs
- **Performance** - Direct hardware implementation is fast
- **Flexibility** - Supports both signed and unsigned arithmetic
- **Efficiency** - Single-cycle execution on most processors
- **Common Usage** - Most frequently executed instructions

**How**: Arithmetic operations work through:

```c
// Example: Integer arithmetic instruction implementation
// RISC-V assembly syntax
// ADD: rd = rs1 + rs2 (R-type instruction)

// Addition examples
// add x5, x3, x4    // x5 = x3 + x4
// Assembly encoding:
// funct7=0000000, rs2=x4, rs1=x3, funct3=000, rd=x5, opcode=0110011

// ADDI: rd = rs1 + sign_extended(imm12) (I-type instruction)
// addi x5, x3, 42   // x5 = x3 + 42
// Immediate value 42 encoded in 12 bits

// Subtraction
// sub x5, x3, x4    // x5 = x3 - x4
// Similar to ADD but funct7=0100000

// Example kernel code using arithmetic
// Kernel memory allocation calculation
unsigned long calculate_alignment(unsigned long size, unsigned long align) {
    unsigned long aligned_size;

    // RISC-V assembly equivalent:
    // add aligned_size, size, align-1    // aligned_size = size + (align - 1)
    // and aligned_size, aligned_size, ~(align-1)  // Mask lower bits
    aligned_size = (size + align - 1) & ~(align - 1);
    return aligned_size;
}
```

**Explanation**:

- **ADD instruction** performs 32-bit or 64-bit addition depending on ISA variant
- **ADDI instruction** adds an immediate value, which is sign-extended from 12 bits
- **SUB instruction** performs subtraction using the same format as ADD
- **Sign extension** ensures immediate values work correctly with signed arithmetic
- **Overflow behavior** in RISC-V: arithmetic operations wrap around (no overflow exception)

### Logical Instructions

**What**: Logical instructions perform bitwise operations on register values.

**Why**: Logical operations are important because:

- **Bit Manipulation** - Essential for flags, masks, and bit fields
- **Control Logic** - Used in conditionals and boolean operations
- **Data Processing** - Common in kernel data structures
- **Performance** - Fast single-cycle operations

**How**: Logical operations are implemented:

```c
// Example: Logical instruction operations
// AND: rd = rs1 & rs2 (bitwise AND)
// OR:  rd = rs1 | rs2 (bitwise OR)
// XOR: rd = rs1 ^ rs2 (bitwise exclusive OR)

// Immediate variants
// ANDI: rd = rs1 & sign_extended(imm12)
// ORI:  rd = rs1 | sign_extended(imm12)
// XORI: rd = rs1 ^ sign_extended(imm12)

// Example: Kernel flag manipulation
struct page_flags {
    unsigned long flags;
};

void set_page_flag(struct page_flags *page, unsigned long flag) {
    // ORI equivalent: page->flags = page->flags | flag
    page->flags |= flag;
}

void clear_page_flag(struct page_flags *page, unsigned long flag) {
    // ANDI equivalent: page->flags = page->flags & ~flag
    page->flags &= ~flag;
}

bool test_page_flag(struct page_flags *page, unsigned long flag) {
    // AND equivalent: (page->flags & flag) != 0
    return (page->flags & flag) != 0;
}
```

**Explanation**:

- **AND operation** sets bits only where both operands have 1s
- **OR operation** sets bits where either operand has 1
- **XOR operation** sets bits where operands differ
- **Immediate variants** use I-type format for constant values
- **Flag manipulation** is common in kernel code for page and process flags

### Shift Instructions

**What**: Shift instructions move bits left or right within a register value.

**Why**: Shift operations are essential because:

- **Multiplication/Division** - Fast power-of-2 operations
- **Bit Extraction** - Accessing specific bit fields
- **Masking** - Extracting or positioning bit patterns
- **Performance** - Much faster than multiply/divide for powers of 2

**How**: Shift instructions work:

```c
// Example: Shift instruction operations
// SLL: Shift Left Logical
//      rd = rs1 << shamt (shift amount in rs2 or imm)
// SRL: Shift Right Logical (zero-fill)
//      rd = rs1 >> shamt
// SRA: Shift Right Arithmetic (sign-extend)
//      rd = rs1 >> shamt (preserves sign bit)

// Immediate shift variants
// SLLI: rd = rs1 << shamt
// SRLI: rd = rs1 >> shamt
// SRAI: rd = rs1 >> shamt

// Example: Kernel address manipulation
unsigned long get_page_number(unsigned long address) {
    // SRLI equivalent: address >> PAGE_SHIFT
    // Extract page number by shifting address right
    return address >> PAGE_SHIFT;
}

unsigned long align_to_page(unsigned long address) {
    // SLLI + SRLI equivalent: (address >> PAGE_SHIFT) << PAGE_SHIFT
    // Align address to page boundary
    unsigned long page_num = address >> PAGE_SHIFT;
    return page_num << PAGE_SHIFT;
}

// Example: Extracting bit fields
unsigned int extract_bits(unsigned int value, int start, int length) {
    // Create mask: (1 << length) - 1, then shift to position
    // SLLI, ANDI, SRLI sequence
    unsigned int mask = (1 << length) - 1;
    return (value >> start) & mask;
}
```

**Explanation**:

- **SLL** shifts bits left, filling right with zeros (multiply by 2^shamt)
- **SRL** shifts right, filling left with zeros (unsigned divide by 2^shamt)
- **SRA** shifts right, preserving sign bit (signed divide by 2^shamt)
- **Shift amount** can be from register (R-type) or immediate (I-type, 5-bit)
- **Page alignment** in kernel frequently uses shifts for fast alignment

## Load and Store Instructions

**What**: Load and store instructions transfer data between registers and memory.

**Why**: Memory access instructions are critical because:

- **Data Access** - Only way to access memory in load/store architecture
- **Variable Access** - Kernel variables stored in memory
- **Data Structures** - Accessing kernel data structures
- **I/O Mapping** - Accessing memory-mapped I/O devices
- **Performance** - Memory access is often the bottleneck

**How**: Load/store instructions operate:

```c
// Example: Load instruction operations
// Load Byte (signed):    LB  rd, offset(rs1)
// Load Halfword (signed): LH  rd, offset(rs1)
// Load Word (signed):     LW  rd, offset(rs1)
// Load Byte Unsigned:     LBU rd, offset(rs1)
// Load Halfword Unsigned: LHU rd, offset(rs1)

// Example: Kernel memory access
struct task_struct {
    pid_t pid;
    unsigned long state;
    struct mm_struct *mm;
};

// Loading task structure fields
pid_t get_task_pid(struct task_struct *task) {
    // LW equivalent: Load word from task->pid
    // lw x10, offset(x11) where x11=task, offset=0
    return task->pid;
}

unsigned long get_task_state(struct task_struct *task) {
    // LW equivalent: Load word from task->state
    // Offset depends on struct layout
    return task->state;
}

// Example: Store instruction operations
// Store Byte:  SB rs2, offset(rs1)
// Store Halfword: SH rs2, offset(rs1)
// Store Word:  SW rs2, offset(rs1)

void set_task_pid(struct task_struct *task, pid_t pid) {
    // SW equivalent: Store word to task->pid
    // sw x12, offset(x11) where x12=pid, x11=task
    task->pid = pid;
}
```

**Explanation**:

- **Load instructions** read data from memory at address (rs1 + sign_extended(offset))
- **Store instructions** write data from rs2 to memory at address (rs1 + sign_extended(offset))
- **Offset encoding** in S-type format splits 12-bit immediate across two fields
- **Sign extension** for signed loads extends the value to fill the register
- **Zero extension** for unsigned loads fills upper bits with zeros
- **Address calculation** happens in address generation unit before memory access

### Memory Access Patterns

**What**: Common memory access patterns in kernel code and their optimization.

**Why**: Understanding access patterns helps because:

- **Performance** - Optimize memory access for cache efficiency
- **Kernel Design** - Structure data for fast access
- **Debugging** - Understand memory access behavior
- **Hardware** - Utilize processor memory features

**How**: Access patterns work:

```c
// Example: Sequential memory access (cache-friendly)
void copy_kernel_data(void *dest, const void *src, size_t len) {
    char *d = (char *)dest;
    const char *s = (const char *)src;

    // Sequential load/store pattern
    // LW x5, 0(x10)    // Load from src
    // SW x5, 0(x11)    // Store to dest
    // ADDI x10, x10, 4 // Increment src pointer
    // ADDI x11, x11, 4 // Increment dest pointer
    for (size_t i = 0; i < len; i++) {
        d[i] = s[i];
    }
}

// Example: Stride access pattern
struct page *get_page_from_pfn(unsigned long pfn) {
    // Accessing array with stride
    // LW x5, offset(x10) where offset = pfn * sizeof(struct page)
    // SLLI + ADD: Calculate offset
    return &mem_map[pfn];
}

// Example: Pointer chasing (potential cache miss)
struct list_head *traverse_list(struct list_head *head) {
    // Each load depends on previous load result
    // LW x5, offset(x10) // Load ->next pointer
    // ADD x10, x0, x5    // Move to next entry
    struct list_head *curr = head;
    while (curr != NULL) {
        curr = curr->next;
    }
    return curr;
}
```

**Explanation**:

- **Sequential access** benefits from hardware prefetching and cache line usage
- **Stride access** can be optimized if stride is predictable
- **Pointer chasing** may cause cache misses and pipeline stalls
- **Load/store ordering** respects memory ordering model
- **Address alignment** affects performance (aligned accesses are faster)

## Control Flow Instructions

**What**: Control flow instructions change the program execution sequence based on conditions or unconditional jumps.

**Why**: Control flow is essential because:

- **Program Logic** - Enables conditionals, loops, and function calls
- **Kernel Flow** - Controls kernel execution paths
- **Performance** - Branch prediction critical for performance
- **Debugging** - Understanding control flow aids debugging

**How**: Control flow instructions operate:

```c
// Example: Branch instructions (B-type format)
// BEQ:  Branch if Equal:    if (rs1 == rs2) PC = PC + offset
// BNE:  Branch if Not Equal: if (rs1 != rs2) PC = PC + offset
// BLT:  Branch if Less Than (signed): if (rs1 < rs2) PC = PC + offset
// BGE:  Branch if Greater or Equal (signed): if (rs1 >= rs2) PC = PC + offset
// BLTU: Branch if Less Than Unsigned
// BGEU: Branch if Greater or Equal Unsigned

// Example: Kernel conditional logic
int compare_pids(pid_t pid1, pid_t pid2) {
    // BEQ/BNE equivalent
    if (pid1 == pid2) {
        return 0;
    }
    // BLT equivalent for signed comparison
    if (pid1 < pid2) {
        return -1;
    }
    return 1;
}

// Example: Loop in kernel code
void zero_memory(void *ptr, size_t size) {
    char *p = (char *)ptr;
    size_t i;

    // BNE equivalent for loop condition
    // Loop: ADDI, SB, ADDI, BNE
    for (i = 0; i < size; i++) {
        p[i] = 0;
    }
}
```

**Explanation**:

- **Branch instructions** compare two registers and conditionally update PC
- **Offset encoding** in B-type uses 13-bit signed offset (12 bits + sign)
- **PC-relative addressing** calculates target as PC + offset (useful for position-independent code)
- **Branch prediction** hardware predicts likely branch outcomes
- **Pipeline effects** branches can cause pipeline stalls if mispredicted

### Jump Instructions

**What**: Jump instructions provide unconditional control flow changes.

**Why**: Jump instructions are needed because:

- **Function Calls** - Call and return from functions
- **Long Distance** - Jump to distant code locations
- **Indirect Calls** - Call through function pointers
- **Exception Handling** - Jump to exception handlers

**How**: Jump instructions work:

```c
// Example: Jump instructions
// JAL: Jump And Link - rd = PC + 4; PC = PC + offset
//      Used for function calls, saves return address
// JALR: Jump And Link Register - rd = PC + 4; PC = rs1 + offset
//       Used for indirect calls and returns

// Example: Function call mechanism
int callee_function(int arg) {
    return arg * 2;
}

int caller_function(void) {
    // JAL instruction sequence:
    // 1. Save return address: ra = PC + 4
    // 2. Jump to callee: PC = callee_address
    int result = callee_function(42);
    // Return uses JALR x0, 0(ra) to jump back
    return result;
}

// Example: Indirect function call (function pointer)
typedef int (*func_ptr_t)(int);

int call_via_pointer(func_ptr_t func, int arg) {
    // JALR equivalent: Load function pointer, then jump
    // LW x5, 0(x10)      // Load function pointer
    // JALR x1, 0(x5)     // Call function, save return address
    return func(arg);
}
```

**Explanation**:

- **JAL instruction** saves PC+4 in rd (typically ra register) and jumps to target
- **JALR instruction** jumps to address calculated from register + offset
- **Return address** convention uses x1 (ra) register for function returns
- **Function prologue** saves ra if function will call other functions
- **Position independence** JAL uses PC-relative addressing for jumps

## System Instructions

**What**: System instructions interact with privileged features and control system behavior.

**Why**: System instructions are crucial because:

- **Privilege Control** - Change privilege levels and access control
- **System Calls** - Invoke kernel services from user space
- **Debugging** - Breakpoints and debugging support
- **Exception Handling** - System exception mechanism

**How**: System instructions operate:

```c
// Example: System instructions
// ECALL: Environment Call - Invoke system call or exception
// EBREAK: Environment Break - Breakpoint for debugger
// CSRRW: CSR Read-Write - Atomic read-modify-write of CSR
// CSRRS: CSR Read-Set - Set bits in CSR
// CSRRC: CSR Read-Clear - Clear bits in CSR

// Example: System call mechanism
long sys_write(unsigned int fd, const char __user *buf, size_t count) {
    // User space calls:
    // ECALL instruction triggers system call
    // Kernel handles in exception handler

    // Kernel implementation (simplified)
    struct file *file = fget(fd);
    if (!file) return -EBADF;

    return vfs_write(file, buf, count, &file->f_pos);
}

// Example: CSR access (Control and Status Register)
// Reading machine status register
unsigned long read_mstatus(void) {
    unsigned long value;
    // CSRRW x10, mstatus, x0  // Read mstatus, write zero (read-only)
    // In kernel, typically done in assembly
    __asm__ volatile("csrr %0, mstatus" : "=r"(value));
    return value;
}

// Writing to CSR
void write_mstatus(unsigned long value) {
    // CSRRW x0, mstatus, x10  // Write value to mstatus, discard old value
    __asm__ volatile("csrw mstatus, %0" : : "r"(value));
}

// Example: Exception handling
void handle_exception(struct pt_regs *regs) {
    // Exception occurred, regs contains saved register state
    unsigned long cause = regs->cause;

    // Cause register indicates exception type
    // Kernel dispatches based on cause value
    switch (cause) {
        case CAUSE_ILLEGAL_INSTRUCTION:
            handle_illegal_instruction(regs);
            break;
        case CAUSE_BREAKPOINT:
            handle_breakpoint(regs);
            break;
        // ... more cases
    }
}
```

**Explanation**:

- **ECALL instruction** causes exception that kernel handles as system call or environment call
- **EBREAK instruction** causes breakpoint exception for debugging
- **CSR instructions** access privileged Control and Status Registers atomically
- **System call convention** uses specific registers for arguments (a0-a7) and return value (a0)
- **Exception handling** saves register state and dispatches based on cause register

## Next Steps

**What** you're ready for next:

After mastering Base ISA, you should be ready to:

1. **Learn Standard Extensions** - M, A, F, D, C extensions
2. **Study Instruction Encoding** - Detailed encoding formats
3. **Understand Privilege Levels** - User, Supervisor, Machine modes
4. **Explore Memory Model** - Addressing modes and ordering
5. **Begin Kernel Code Analysis** - Understand kernel assembly

**Where** to go next:

Continue with the next lesson on **"Standard Extensions"** to learn:

- Multiplication and division extension (M)
- Atomic operations extension (A)
- Floating-point extensions (F, D)
- Compressed instruction extension (C)
- Practical usage in kernel development

**Why** the next lesson is important:

Standard extensions add essential functionality beyond the base ISA. Understanding these extensions is crucial for full RISC-V development and kernel optimization.

**How** to continue learning:

1. **Practice Assembly** - Write RISC-V assembly code
2. **Analyze Kernel Code** - Study kernel assembly output
3. **Use Disassembler** - Disassemble kernel code to see instructions
4. **Read ISA Spec** - Study official RISC-V specification
5. **Experiment** - Try instructions in QEMU or on hardware

## Resources

**Official Documentation**:

- [RISC-V Base ISA Specification](https://github.com/riscv/riscv-isa-manual) - Official base ISA documentation
- [RISC-V Instruction Set Manual](https://riscv.org/technical/specifications/) - Complete instruction reference

**Tools**:

- [RISC-V GNU Toolchain](https://github.com/riscv/riscv-gnu-toolchain) - Compiler and tools
- [RISC-V Spike Simulator](https://github.com/riscv/riscv-isa-sim) - Instruction set simulator
- [QEMU RISC-V](https://www.qemu.org/docs/master/system/riscv/index.html) - RISC-V emulation
