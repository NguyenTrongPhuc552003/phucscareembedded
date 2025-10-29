---
sidebar_position: 1
---

# RISC-V Overview

Master the fundamental concepts of RISC-V architecture with comprehensive explanations using the 4W+H framework, specifically tailored for Linux kernel development.

## What is RISC-V?

**What**: RISC-V is an open-source, royalty-free instruction set architecture (ISA) based on reduced instruction set computer (RISC) principles. It provides a foundation for processor design that is free from licensing restrictions and vendor lock-in.

**Why**: Understanding RISC-V is crucial because:

- **Open Standard** - No licensing fees or proprietary restrictions
- **Industry Adoption** - Growing adoption in embedded, IoT, and server markets
- **Educational Value** - Clean, simple design perfect for learning CPU architecture
- **Innovation Platform** - Enables custom processor designs and extensions
- **Kernel Development** - Essential knowledge for Linux kernel development on RISC-V
- **Future Growth** - Positioned as a significant player in future computing systems

**When**: RISC-V is used when:

- **New Hardware Design** - Designing new processors and SoCs
- **Embedded Systems** - IoT devices, microcontrollers, and embedded controllers
- **Server Infrastructure** - Data center servers and cloud computing platforms
- **Academic Research** - Processor architecture research and education
- **Kernel Development** - Porting and developing Linux kernel for RISC-V
- **Custom Extensions** - Implementing domain-specific accelerators

**How**: RISC-V works by:

- **Modular Design** - Base ISA with optional extensions
- **Fixed-Length Instructions** - Simplified instruction encoding
- **Load/Store Architecture** - Clear separation between memory and arithmetic operations
- **Register-Based Operations** - Most operations use general-purpose registers
- **Privilege Levels** - Multiple privilege levels for system protection

**Where**: RISC-V is found in:

- **Embedded Systems** - IoT devices, edge computing, industrial controllers
- **Servers** - Data center processors and cloud infrastructure
- **Research Platforms** - Academic and commercial research projects
- **Custom Processors** - Domain-specific processors and accelerators
- **VisionFive 2** - RISC-V-based single-board computers
- **Future Systems** - Next-generation computing platforms

## RISC-V Design Philosophy

**What**: RISC-V follows a minimalist design philosophy with a small base instruction set and optional extensions.

**Why**: This design philosophy is important because:

- **Simplicity** - Easy to understand and implement
- **Flexibility** - Can be extended for specific needs
- **Efficiency** - Minimal instruction overhead
- **Portability** - Clear interface between software and hardware
- **Verifiability** - Simpler design is easier to verify and debug

**How**: The minimalist design is achieved through:

```c
// Example: RISC-V instruction encoding principles
// All instructions are 32 bits (in RV32I base ISA)
// Fixed instruction formats for simplicity

// R-type instruction format (Register operations)
// [31:25] funct7 | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// ADD rd, rs1, rs2 - adds two registers and stores result in rd
//
// Assembly: add x5, x3, x4
// Binary:   0000000 | 00100 | 00011 | 000 | 00101 | 0110011
//           funct7  | rs2   | rs1   | f3  | rd    | opcode

// I-type instruction format (Immediate operations)
// [31:20] imm[11:0] | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// ADDI rd, rs1, imm - adds immediate value to register
//
// Assembly: addi x5, x3, 42
// Binary:   000000001010 | 00011 | 000 | 00101 | 0010011
//           imm          | rs1   | f3  | rd    | opcode

// Load/store use I-type and S-type formats
// LW rd, offset(rs1) - load word from memory
// SW rs2, offset(rs1) - store word to memory
```

**Explanation**:

- **Fixed-length instructions** simplify instruction fetch and decode
- **Regular instruction formats** make instruction decoding straightforward
- **Register-based operations** reduce memory traffic
- **Immediate values** are sign-extended for arithmetic operations
- **Load/store architecture** separates data transfer from computation

**Where**: This design philosophy is applied in:

- **Base ISA** - RV32I and RV64I instruction sets
- **Standard Extensions** - M, A, F, D, C extensions
- **Custom Extensions** - Vendor-specific extensions
- **Compiler Design** - Code generation for RISC-V
- **Kernel Development** - Linux kernel for RISC-V architecture

## RISC-V Base ISA

**What**: The base ISA defines the minimum required instruction set that all RISC-V processors must implement.

**Why**: The base ISA is important because:

- **Compatibility** - Ensures software compatibility across implementations
- **Portability** - Provides portable software interface
- **Simplicity** - Minimal instruction set for basic operations
- **Foundation** - Base for all extensions
- **Verification** - Easier to verify correct implementation

**How**: The base ISA includes:

```c
// Example: RISC-V base instruction categories

// 1. Arithmetic and Logic Instructions (R-type, I-type)
// Integer arithmetic: ADD, SUB, AND, OR, XOR, SLT
// Shift operations: SLL, SRL, SRA
// Example assembly and encoding:
// add x1, x2, x3  // R-type: x1 = x2 + x3
// andi x1, x2, 15 // I-type: x1 = x2 & 15

// 2. Load/Store Instructions (I-type, S-type)
// Load: LB, LH, LW (load byte, halfword, word)
// Store: SB, SH, SW (store byte, halfword, word)
// Example:
// lw x1, 4(x2)    // Load word from address (x2 + 4) into x1
// sw x1, 8(x2)    // Store word from x1 to address (x2 + 8)

// 3. Control Flow Instructions (B-type, J-type, I-type)
// Branches: BEQ, BNE, BLT, BGE, BLTU, BGEU
// Jump: JAL (jump and link), JALR (jump and link register)
// Example:
// beq x1, x2, label  // Branch to label if x1 == x2
// jal x1, label      // Jump to label, save return address in x1

// 4. System Instructions (I-type)
// Environment calls: ECALL, EBREAK
// CSR access: CSRRW, CSRRS, CSRRC
// Example:
// ecall              // System call
// csrrw x1, mstatus, x2 // Read-modify-write CSR
```

**Explanation**:

- **Arithmetic operations** perform computations on register values
- **Load/store operations** transfer data between registers and memory
- **Control flow** changes program execution sequence based on conditions
- **System instructions** interact with privileged features and CSRs
- **Register conventions** define specific uses (x0 is always zero, x1-x31 general purpose)

**Where**: Base ISA is used in:

- **All RISC-V implementations** - Required minimum instruction set
- **Boot code** - Early boot and initialization
- **Core kernel operations** - Fundamental kernel operations
- **Compiler backend** - Base instruction generation
- **Emulation** - QEMU and other RISC-V emulators

## RISC-V Register Set

**What**: RISC-V defines 32 general-purpose registers (x0-x31) plus additional control and status registers (CSRs) for system operations.

**Why**: The register set design is important because:

- **Performance** - Fast access to frequently used data
- **Efficiency** - Reduces memory traffic
- **Convention** - Standard calling conventions for software compatibility
- **Flexibility** - Sufficient registers for most operations
- **Simplicity** - Straightforward register naming

**How**: Registers are organized as:

```c
// Example: RISC-V register conventions and usage
// Register naming and conventions:

// x0 (zero register) - Always holds value 0, read-only
// Useful for: Immediate 0, discarding results, comparisons

// x1 (ra - return address) - Stores return address in function calls
int function_call_example() {
    // Function prologue saves ra register
    // Function epilogue uses ra to return
}

// x2 (sp - stack pointer) - Points to top of stack
// Critical for: Function call stack, local variables
void stack_usage_example() {
    // Stack grows downward (towards lower addresses)
    // sp points to last used stack location
    // Local variables allocated on stack relative to sp
}

// x3 (gp - global pointer) - Points to global data area
// x4 (tp - thread pointer) - Points to thread-local storage

// x5-x7 (t0-t2 - temporary registers) - Caller-saved temporaries
// x8 (s0/fp - saved register/frame pointer) - Callee-saved, optional frame pointer
// x9 (s1 - saved register) - Callee-saved

// x10-x11 (a0-a1 - argument registers) - Function arguments and return values
int add_numbers(int a, int b) {
    // Arguments arrive in a0, a1
    // Return value goes in a0
    return a + b;  // Result in a0
}

// x12-x17 (a2-a7 - argument registers) - Additional function arguments
void function_with_many_args(int a, int b, int c, int d, int e, int f, int g) {
    // First 6 arguments in a0-a5, additional on stack
}

// x18-x27 (s2-s11 - saved registers) - Callee-saved
// x28-x31 (t3-t6 - temporary registers) - Caller-saved
```

**Explanation**:

- **Zero register (x0)** simplifies many operations and eliminates unnecessary register allocation
- **Stack pointer (sp)** manages function call stack for local variables and return addresses
- **Argument registers** pass function parameters efficiently without memory access
- **Saved registers** preserve values across function calls (callee-saved)
- **Temporary registers** are caller-saved, can be modified by functions

**Where**: Register conventions are critical in:

- **Function calling** - Standard ABI for function calls
- **Compiler code generation** - Register allocation strategies
- **Assembly programming** - Manual register management
- **Kernel development** - Register usage in kernel code
- **Debugging** - Understanding register state during debugging

## RISC-V Instruction Formats

**What**: RISC-V instructions follow one of several fixed formats, making instruction decoding simple and regular.

**Why**: Fixed instruction formats are important because:

- **Simplicity** - Easy to decode instructions in hardware
- **Regularity** - Consistent format simplifies decoder design
- **Efficiency** - Fast instruction decoding improves performance
- **Extensibility** - Easy to add new instructions following existing formats
- **Verification** - Easier to verify correct instruction encoding

**How**: Instructions are formatted as:

```c
// Example: RISC-V instruction format decoding
// All base ISA instructions are 32 bits

// R-type: Register-to-register operations
// Format: [31:25] funct7 | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// Example: ADD x5, x3, x4
void decode_r_type(uint32_t instruction) {
    uint32_t funct7 = (instruction >> 25) & 0x7F;
    uint32_t rs2    = (instruction >> 20) & 0x1F;
    uint32_t rs1    = (instruction >> 15) & 0x1F;
    uint32_t funct3 = (instruction >> 12) & 0x7;
    uint32_t rd     = (instruction >> 7)  & 0x1F;
    uint32_t opcode = instruction & 0x7F;

    // Decode operation based on opcode, funct3, funct7
    if (opcode == 0x33) {  // OP opcode
        if (funct3 == 0x0 && funct7 == 0x00) {
            // ADD operation: rd = rs1 + rs2
        } else if (funct3 == 0x0 && funct7 == 0x20) {
            // SUB operation: rd = rs1 - rs2
        }
    }
}

// I-type: Immediate operations and loads
// Format: [31:20] imm[11:0] | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// Example: ADDI x5, x3, 42
void decode_i_type(uint32_t instruction) {
    uint32_t imm = (instruction >> 20) & 0xFFF;
    // Sign extend 12-bit immediate
    int32_t imm_sext = (imm & 0x800) ? (imm | 0xFFFFF000) : imm;
    uint32_t rs1    = (instruction >> 15) & 0x1F;
    uint32_t funct3 = (instruction >> 12) & 0x7;
    uint32_t rd     = (instruction >> 7)  & 0x1F;
    uint32_t opcode = instruction & 0x7F;

    // Example: ADDI operation
    if (opcode == 0x13 && funct3 == 0x0) {
        // rd = rs1 + sign_extended_imm
    }
}

// S-type: Store operations
// Format: [31:25] imm[11:5] | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] imm[4:0] | [6:0] opcode
// Example: SW x5, 100(x3)
void decode_s_type(uint32_t instruction) {
    uint32_t imm_high = (instruction >> 25) & 0x7F;
    uint32_t rs2      = (instruction >> 20) & 0x1F;
    uint32_t rs1      = (instruction >> 15) & 0x1F;
    uint32_t funct3   = (instruction >> 12) & 0x7;
    uint32_t imm_low  = (instruction >> 7)  & 0x1F;
    uint32_t opcode   = instruction & 0x7F;

    // Reconstruct immediate value
    uint32_t imm = (imm_high << 5) | imm_low;
    int32_t imm_sext = (imm & 0x800) ? (imm | 0xFFFFF000) : imm;

    // Example: SW operation
    if (opcode == 0x23 && funct3 == 0x2) {
        // Store word from rs2 to address (rs1 + sign_extended_imm)
    }
}

// B-type: Branch instructions
// Format: Similar to S-type but with different immediate encoding
// J-type: Jump instructions
// Format: 20-bit immediate for jump target
```

**Explanation**:

- **R-type format** uses three register operands for arithmetic and logic operations
- **I-type format** uses one register source, one immediate value, and one destination register
- **S-type format** stores register value to memory with base+offset addressing
- **Immediate encoding** is optimized to fit common immediate values in limited bits
- **Sign extension** ensures immediate values work correctly with signed arithmetic

**Where**: Instruction formats are used in:

- **Instruction decoder** - Hardware instruction decoding
- **Assembler** - Converting assembly to machine code
- **Disassembler** - Converting machine code back to assembly
- **Instruction cache** - Storing and fetching instructions
- **Pipeline design** - Instruction fetch and decode stages

## RISC-V Architecture Variants

**What**: RISC-V defines multiple architecture variants (RV32, RV64, RV128) for different address space sizes.

**Why**: Multiple variants are important because:

- **Address Space** - Support for different memory sizes
- **Application Needs** - Match ISA to application requirements
- **Backward Compatibility** - Software compatibility within variant
- **Efficiency** - Optimize for target address space size
- **Future-Proofing** - Support for future address space requirements

**How**: Variants are organized:

```c
// Example: Differences between RV32 and RV64

// RV32I: 32-bit base integer ISA
// - 32-bit general-purpose registers
// - 32-bit address space (4GB)
// - 32-bit instruction encoding
typedef uint32_t riscv_reg_t;
typedef uint32_t riscv_addr_t;

// RV64I: 64-bit base integer ISA
// - 64-bit general-purpose registers
// - 64-bit address space (extended addressing)
// - 32-bit instruction encoding (same as RV32)
typedef uint64_t riscv_reg_t;
typedef uint64_t riscv_addr_t;

// Register operations in RV64
// ADDW: Add and sign-extend word result (for 32-bit operations)
// SLLW, SRLW, SRAW: Word-sized shift operations
//
// Example: 32-bit arithmetic in 64-bit mode
// addw x1, x2, x3  // Performs 32-bit add, sign-extends to 64 bits

// Memory addressing
// In RV32: 32-bit addresses limit to 4GB address space
// In RV64: 64-bit addresses support larger address spaces
// Both use 32-bit immediate offsets in load/store instructions

// Kernel considerations
#ifdef CONFIG_64BIT
    // RV64 kernel code
    typedef unsigned long riscv_ptr_t;  // 64 bits
    typedef unsigned long riscv_size_t; // 64 bits
#else
    // RV32 kernel code
    typedef unsigned int riscv_ptr_t;   // 32 bits
    typedef unsigned int riscv_size_t;  // 32 bits
#endif
```

**Explanation**:

- **RV32I** provides 32-bit address space suitable for embedded systems
- **RV64I** extends to 64-bit address space for servers and large systems
- **Register size** determines width of operations but instruction format remains 32-bit
- **Word operations** (ADDW, etc.) allow efficient 32-bit operations in 64-bit mode
- **Kernel code** must handle both variants appropriately

**Where**: Architecture variants are used in:

- **Embedded systems** - RV32 for memory-constrained devices
- **Servers** - RV64 for large memory systems
- **Kernel configuration** - Kernel builds for specific variant
- **Toolchain** - Compiler targets specific variant
- **VisionFive 2** - Typically uses RV64 for full 64-bit support

## Next Steps

**What** you're ready for next:

After understanding RISC-V overview, you should be ready to:

1. **Learn Base ISA** - Detailed instruction set and encoding
2. **Study Extensions** - Standard extensions (M, A, F, D, C)
3. **Understand Privilege Levels** - User, Supervisor, Machine modes
4. **Explore Memory Model** - Addressing modes and memory organization
5. **Begin Kernel Development** - Start working with RISC-V Linux kernel

**Where** to go next:

Continue with the next lesson on **"Base ISA"** to learn:

- Detailed instruction categories and encodings
- Register operations and conventions
- Load/store operations
- Control flow instructions
- System instructions and CSRs

**Why** the next lesson is important:

The Base ISA lesson builds directly on this overview by diving deep into the instruction set that forms the foundation of all RISC-V implementations. Understanding the base ISA is essential for kernel development and debugging.

**How** to continue learning:

1. **Study RISC-V Spec** - Read the official RISC-V ISA specification
2. **Experiment with QEMU** - Run RISC-V code in QEMU emulator
3. **Read Kernel Code** - Explore Linux kernel source for RISC-V
4. **Write Assembly** - Practice writing RISC-V assembly code
5. **Use Tools** - Familiarize yourself with RISC-V toolchain

## Resources

**Official Documentation**:

- [RISC-V ISA Specification](https://riscv.org/technical/specifications/) - Official ISA specification
- [RISC-V Foundation](https://riscv.org/) - RISC-V community and resources
- [RISC-V Linux Kernel](https://github.com/torvalds/linux/tree/master/arch/riscv) - Linux kernel RISC-V port

**Hardware Documentation**:

- [VisionFive 2 Documentation](https://www.starfivetech.com/en/site/boards) - VisionFive 2 board documentation
- [SiFive Documentation](https://www.sifive.com/documentation) - SiFive RISC-V processor documentation

**Community Resources**:

- [RISC-V Software](https://github.com/riscv/riscv-software-list) - RISC-V software ecosystem
- [RISC-V Forum](https://forums.riscv.org/) - Community discussions
- [RISC-V Wikipedia](https://en.wikipedia.org/wiki/RISC-V) - General overview
