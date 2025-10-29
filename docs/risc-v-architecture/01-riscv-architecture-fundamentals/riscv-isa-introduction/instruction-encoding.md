---
sidebar_position: 4
---

# Instruction Encoding

Master the detailed encoding of RISC-V instructions, understanding how instructions are represented in memory and decoded by the processor, essential for kernel development and debugging.

## What is Instruction Encoding?

**What**: Instruction encoding is the binary representation of instructions in memory. Each instruction is encoded as a specific bit pattern that the processor decodes to determine the operation and operands.

**Why**: Understanding instruction encoding is crucial because:

- **Disassembly** - Reading disassembled kernel code requires understanding encodings
- **Debugging** - Debuggers show instruction encodings in memory dumps
- **Assembly Programming** - Writing assembly requires knowledge of encoding
- **Kernel Analysis** - Analyzing kernel assembly output needs encoding knowledge
- **Performance** - Understanding encoding helps optimize code generation
- **Tool Development** - Building tools that manipulate instructions

**When**: Instruction encoding is used when:

- **Code Execution** - Processor decodes instructions before execution
- **Disassembly** - Tools convert binary to assembly using encoding rules
- **Assembly Writing** - Assemblers convert assembly to binary using encoding
- **Debugging** - Debuggers display instruction bytes and decode them
- **Kernel Inspection** - Examining kernel binary or memory dumps
- **JIT Compilation** - Generating instructions dynamically

**How**: Instruction encoding works by:

- **Fixed Formats** - RISC-V uses fixed instruction formats
- **Bit Fields** - Specific bit positions encode operation and operands
- **Immediate Encoding** - Immediate values use clever encoding to maximize range
- **Register Encoding** - Registers encoded as 5-bit values (x0-x31)
- **Opcode Encoding** - Opcode determines instruction type and format

**Where**: Instruction encoding is found in:

- **Binary Files** - Compiled programs and kernel images
- **Memory** - Instructions loaded in instruction cache or memory
- **Disassemblers** - Tools like objdump show instruction encodings
- **Debuggers** - GDB displays instruction bytes during debugging
- **Kernel Dumps** - Crash dumps show instruction encodings

## R-Type Instruction Encoding

**What**: R-type instructions use register-to-register operations with three register operands.

**Why**: R-type format is important because:

- **Arithmetic Operations** - Most arithmetic uses R-type
- **Regular Encoding** - Simple, regular format simplifies decoding
- **Three Operands** - Supports complex operations with two sources and one destination
- **Fast Decoding** - Processor can quickly decode R-type instructions

**How**: R-type encoding works:

```c
// Example: R-type instruction format
// [31:25] funct7 | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// Total: 32 bits

// Example: ADD instruction encoding
// add x5, x3, x4
// Register encoding: x3 = 3, x4 = 4, x5 = 5
//
// Encoding breakdown:
// funct7 = 0000000 (7 bits)
// rs2    = 00100   (5 bits, register x4)
// rs1    = 00011   (5 bits, register x3)
// funct3 = 000     (3 bits)
// rd     = 00101   (5 bits, register x5)
// opcode = 0110011 (7 bits, OP opcode)
//
// Complete encoding: 0000000_00100_00011_000_00101_0110011
// Hex representation: 0x004181B3

// Example: Encoding function in C
uint32_t encode_add(uint8_t rd, uint8_t rs1, uint8_t rs2) {
    uint32_t instruction = 0;

    // Set opcode: OP (0110011)
    instruction |= 0x33;

    // Set rd field (bits 11:7)
    instruction |= (rd & 0x1F) << 7;

    // Set funct3: ADD = 000 (bits 14:12)
    instruction |= 0x0 << 12;

    // Set rs1 field (bits 19:15)
    instruction |= (rs1 & 0x1F) << 15;

    // Set rs2 field (bits 24:20)
    instruction |= (rs2 & 0x1F) << 20;

    // Set funct7: ADD = 0000000 (bits 31:25)
    instruction |= 0x0 << 25;

    return instruction;
}

// Example: Decoding R-type instruction
struct rtype_decoded {
    uint8_t funct7;
    uint8_t rs2;
    uint8_t rs1;
    uint8_t funct3;
    uint8_t rd;
    uint8_t opcode;
};

struct rtype_decoded decode_rtype(uint32_t instruction) {
    struct rtype_decoded decoded;

    decoded.opcode = instruction & 0x7F;           // bits 6:0
    decoded.rd     = (instruction >> 7)  & 0x1F;   // bits 11:7
    decoded.funct3 = (instruction >> 12) & 0x7;    // bits 14:12
    decoded.rs1    = (instruction >> 15) & 0x1F;   // bits 19:15
    decoded.rs2    = (instruction >> 20) & 0x1F;   // bits 24:20
    decoded.funct7 = (instruction >> 25) & 0x7F;   // bits 31:25

    return decoded;
}

// Example: Determine operation from R-type encoding
const char* get_rtype_operation(uint8_t opcode, uint8_t funct3, uint8_t funct7) {
    if (opcode == 0x33) {  // OP opcode
        if (funct3 == 0x0) {
            if (funct7 == 0x00) return "ADD";
            if (funct7 == 0x20) return "SUB";
        }
        if (funct3 == 0x1 && funct7 == 0x00) return "SLL";   // Shift Left Logical
        if (funct3 == 0x2 && funct7 == 0x00) return "SLT";   // Set Less Than
        if (funct3 == 0x3 && funct7 == 0x00) return "SLTU";  // Set Less Than Unsigned
        if (funct3 == 0x4 && funct7 == 0x00) return "XOR";
        if (funct3 == 0x5) {
            if (funct7 == 0x00) return "SRL";   // Shift Right Logical
            if (funct7 == 0x20) return "SRA";   // Shift Right Arithmetic
        }
        if (funct3 == 0x6 && funct7 == 0x00) return "OR";
        if (funct3 == 0x7 && funct7 == 0x00) return "AND";
    }
    return "UNKNOWN";
}
```

**Explanation**:

- **funct7 and funct3** fields distinguish different operations with same opcode
- **rs1, rs2, rd** encode source and destination registers as 5-bit values
- **Bit extraction** uses shift and mask operations to extract fields
- **Operation decoding** requires checking opcode, funct3, and funct7 together
- **Hex representation** shows instruction encoding in human-readable format

## I-Type Instruction Encoding

**What**: I-type instructions use immediate values with register operations, including arithmetic with immediate and load instructions.

**Why**: I-type format is important because:

- **Common Operations** - Immediate operations are very common
- **Load Instructions** - All load instructions use I-type format
- **Constant Usage** - Programs frequently use small constants
- **Efficient Encoding** - Immediate value encoded in available bits

**How**: I-type encoding works:

```c
// Example: I-type instruction format
// [31:20] imm[11:0] | [19:15] rs1 | [14:12] funct3 | [11:7] rd | [6:0] opcode
// Total: 32 bits

// Example: ADDI instruction encoding
// addi x5, x3, 42
// Immediate 42 decimal = 0x2A = 00101010 binary = 000000101010 (12 bits)
// Register: x3 = 3, x5 = 5
//
// Encoding breakdown:
// imm[11:0] = 000000101010 (12 bits, value 42)
// rs1       = 00011        (5 bits, register x3)
// funct3    = 000          (3 bits)
// rd        = 00101        (5 bits, register x5)
// opcode    = 0010011      (7 bits, OP-IMM opcode)
//
// Complete encoding: 000000101010_00011_000_00101_0010011
// Hex representation: 0x02A18193

// Example: Encoding ADDI instruction
uint32_t encode_addi(uint8_t rd, uint8_t rs1, int16_t imm12) {
    uint32_t instruction = 0;

    // Set opcode: OP-IMM (0010011)
    instruction |= 0x13;

    // Set rd field
    instruction |= (rd & 0x1F) << 7;

    // Set funct3: ADDI = 000
    instruction |= 0x0 << 12;

    // Set rs1 field
    instruction |= (rs1 & 0x1F) << 15;

    // Set immediate value (bits 31:20)
    // Sign-extend 12-bit immediate
    instruction |= ((uint32_t)imm12 & 0xFFF) << 20;

    return instruction;
}

// Example: Immediate sign extension
int32_t sign_extend_12bit(uint32_t imm12) {
    // Extract 12-bit immediate
    imm12 &= 0xFFF;

    // Sign extend: if bit 11 is 1, extend with 1s
    if (imm12 & 0x800) {
        // Negative: set upper 20 bits to 1
        return (int32_t)(imm12 | 0xFFFFF000);
    } else {
        // Positive: upper bits are 0
        return (int32_t)imm12;
    }
}

// Example: Load instruction encoding (I-type)
// lw x5, 100(x3)
// Immediate 100 = 0x64 = 000001100100 (12 bits)
// Register: x3 = 3, x5 = 5
//
// Encoding:
// imm[11:0] = 000001100100 (12 bits, offset 100)
// rs1       = 00011        (base register x3)
// funct3    = 010          (LW = word load)
// rd        = 00101        (destination x5)
// opcode    = 0000011      (LOAD opcode)
//
// Complete: 000001100100_00011_010_00101_0000011
// Hex: 0x0641A283

uint32_t encode_lw(uint8_t rd, uint8_t rs1, int16_t offset) {
    uint32_t instruction = 0;

    // Set opcode: LOAD (0000011)
    instruction |= 0x03;

    // Set rd field
    instruction |= (rd & 0x1F) << 7;

    // Set funct3: LW = 010
    instruction |= 0x2 << 12;

    // Set rs1 field
    instruction |= (rs1 & 0x1F) << 15;

    // Set 12-bit offset
    instruction |= ((uint32_t)offset & 0xFFF) << 20;

    return instruction;
}
```

**Explanation**:

- **12-bit immediate** allows values from -2048 to +2047
- **Sign extension** extends 12-bit immediate to 32/64 bits for arithmetic
- **Load offset** uses same immediate encoding for memory address offset
- **funct3 field** distinguishes different load sizes (LB, LH, LW, LBU, LHU)
- **Immediate range** limits offset range for loads and immediate operations

## S-Type Instruction Encoding

**What**: S-type instructions encode store operations with two register operands and immediate offset.

**Why**: S-type format is important because:

- **Store Operations** - All store instructions use S-type
- **Offset Encoding** - Immediate offset split across two fields
- **Common Pattern** - Store instructions frequently used
- **Memory Access** - Essential for data movement to memory

**How**: S-type encoding works:

```c
// Example: S-type instruction format
// [31:25] imm[11:5] | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] imm[4:0] | [6:0] opcode
// Note: Immediate value is split between bits 31:25 and 11:7

// Example: SW instruction encoding
// sw x5, 100(x3)
// Immediate 100 = 0x64 = 000001100100 binary
// Split: imm[11:5] = 0000011 (upper 7 bits)
//        imm[4:0]  = 00100   (lower 5 bits)
// Register: x3 = 3 (rs1), x5 = 5 (rs2)
//
// Encoding breakdown:
// imm[11:5] = 0000011   (7 bits, upper part of 100)
// rs2       = 00101     (5 bits, source register x5)
// rs1       = 00011     (5 bits, base register x3)
// funct3    = 010       (3 bits, SW = word store)
// imm[4:0]  = 00100     (5 bits, lower part of 100)
// opcode    = 0100011   (7 bits, STORE opcode)
//
// Complete: 0000011_00101_00011_010_00100_0100011
// Hex: 0x0651A223

// Example: Encoding SW instruction
uint32_t encode_sw(uint8_t rs2, uint8_t rs1, int16_t offset) {
    uint32_t instruction = 0;

    // Set opcode: STORE (0100011)
    instruction |= 0x23;

    // Set immediate lower 5 bits (bits 11:7)
    instruction |= ((uint32_t)offset & 0x1F) << 7;

    // Set funct3: SW = 010
    instruction |= 0x2 << 12;

    // Set rs1 field
    instruction |= (rs1 & 0x1F) << 15;

    // Set rs2 field
    instruction |= (rs2 & 0x1F) << 20;

    // Set immediate upper 7 bits (bits 31:25)
    instruction |= (((uint32_t)offset >> 5) & 0x7F) << 25;

    return instruction;
}

// Example: Reconstructing immediate from S-type
int16_t extract_s_immediate(uint32_t instruction) {
    // Extract upper 7 bits (bits 31:25)
    uint32_t imm_high = (instruction >> 25) & 0x7F;

    // Extract lower 5 bits (bits 11:7)
    uint32_t imm_low = (instruction >> 7) & 0x1F;

    // Combine: imm[11:0] = imm_high[6:0] || imm_low[4:0]
    uint32_t imm12 = (imm_high << 5) | imm_low;

    // Sign extend 12-bit immediate
    if (imm12 & 0x800) {
        return (int16_t)(imm12 | 0xF000);  // Sign extend
    } else {
        return (int16_t)imm12;
    }
}
```

**Explanation**:

- **Split immediate** allows rd field space to be reused for immediate lower bits
- **Reconstruction** combines upper and lower immediate fields
- **12-bit range** same range as I-type (-2048 to +2047)
- **rs2 encoding** store value register encoded in rs2 field
- **funct3** distinguishes store sizes (SB, SH, SW)

## B-Type Instruction Encoding

**What**: B-type instructions encode branch operations with two register operands and PC-relative offset.

**Why**: B-type format is important because:

- **Branch Instructions** - All conditional branches use B-type
- **PC-Relative** - Branches use PC-relative addressing for position independence
- **Offset Encoding** - Immediate offset split and scaled for byte addresses
- **Common Control Flow** - Branches are frequently executed

**How**: B-type encoding works:

```c
// Example: B-type instruction format
// Similar to S-type but immediate encoding differs
// [31:25] imm[12|10:5] | [24:20] rs2 | [19:15] rs1 | [14:12] funct3 | [11:7] imm[4:1|11] | [6:0] opcode
// Note: Immediate is signed 13-bit value, bits are scrambled
// bit 12: imm[12] at bit 31
// bit 11: imm[11] at bit 7
// bits 10:5: imm[10:5] at bits 30:25
// bits 4:1: imm[4:1] at bits 11:8

// Example: BEQ instruction encoding
// beq x3, x4, label
// Assuming label is 8 bytes ahead (PC + 8)
// Branch offset = 8 bytes
// Register: x3 = 3 (rs1), x4 = 4 (rs2)
//
// Immediate encoding (offset = 8):
// imm[12] = 0 (bit 31)
// imm[11] = 0 (bit 7)
// imm[10:5] = 000000 (bits 30:25)
// imm[4:1] = 0010 (bits 11:8, 8 >> 1 = 4)
//
// Encoding:
// imm[12|10:5] = 0_000000  (bit 31 + bits 30:25)
// rs2          = 00100     (register x4)
// rs1          = 00011     (register x3)
// funct3       = 000       (BEQ)
// imm[4:1|11]  = 0010_0    (bits 11:8 + bit 7)
// opcode       = 1100011   (BRANCH opcode)

// Example: Encoding BEQ instruction
uint32_t encode_beq(uint8_t rs1, uint8_t rs2, int16_t offset) {
    uint32_t instruction = 0;

    // Set opcode: BRANCH (1100011)
    instruction |= 0x63;

    // Set funct3: BEQ = 000
    instruction |= 0x0 << 12;

    // Set rs1 field
    instruction |= (rs1 & 0x1F) << 15;

    // Set rs2 field
    instruction |= (rs2 & 0x1F) << 20;

    // Encode 13-bit signed immediate (offset must be multiple of 2)
    // Bit 12 at bit 31
    instruction |= ((offset >> 12) & 0x1) << 31;
    // Bits 10:5 at bits 30:25
    instruction |= ((offset >> 5) & 0x3F) << 25;
    // Bits 4:1 at bits 11:8
    instruction |= ((offset >> 1) & 0xF) << 8;
    // Bit 11 at bit 7
    instruction |= ((offset >> 11) & 0x1) << 7;

    return instruction;
}

// Example: Extracting branch offset
int16_t extract_b_immediate(uint32_t instruction) {
    // Extract immediate bits from scrambled positions
    uint32_t imm12 = (instruction >> 31) & 0x1;           // bit 12
    uint32_t imm11 = (instruction >> 7) & 0x1;            // bit 11
    uint32_t imm10_5 = (instruction >> 25) & 0x3F;       // bits 10:5
    uint32_t imm4_1 = (instruction >> 8) & 0xF;          // bits 4:1

    // Reconstruct 13-bit immediate
    uint32_t imm13 = (imm12 << 12) | (imm11 << 11) |
                     (imm10_5 << 5) | (imm4_1 << 1);

    // Sign extend 13-bit value
    if (imm13 & 0x1000) {
        return (int16_t)(imm13 | 0xE000);  // Sign extend
    } else {
        return (int16_t)imm13;
    }
}
```

**Explanation**:

- **Scrambled bits** immediate bits are in non-sequential positions
- **13-bit range** allows branches from -4096 to +4094 bytes (must be even)
- **PC-relative** target is PC + offset, enabling position-independent code
- **Even offset** branch offset must be multiple of 2 (aligned to instruction boundary)
- **Bit reconstruction** requires carefully extracting and combining bits

## J-Type Instruction Encoding

**What**: J-type instructions encode unconditional jumps with 20-bit PC-relative offset.

**Why**: J-type format is important because:

- **Jump Instructions** - JAL uses J-type for long-range jumps
- **Function Calls** - JAL commonly used for function calls
- **Large Range** - 20-bit offset enables jumps up to ±1MB
- **Position Independence** - PC-relative enables position-independent code

**How**: J-type encoding works:

```c
// Example: J-type instruction format
// [31:12] imm[20|10:1|11|19:12] | [11:7] rd | [6:0] opcode
// Note: 20-bit immediate is scrambled across bit positions
// bit 20: imm[20] at bit 31 (sign bit)
// bits 10:1: imm[10:1] at bits 30:21
// bit 11: imm[11] at bit 20
// bits 19:12: imm[19:12] at bits 19:12

// Example: JAL instruction encoding
// jal x1, label
// Assuming label is 0x1000 bytes ahead
// Jump offset = 0x1000 = 0001000000000000 binary (20 bits)
// Register: x1 = 1 (rd, return address)
//
// Immediate breakdown (offset = 0x1000):
// imm[20] = 0 (bit 31, sign)
// imm[10:1] = 0001000000 (bits 30:21, 0x1000 >> 1 = 0x800)
// imm[11] = 0 (bit 20)
// imm[19:12] = 00010000 (bits 19:12, 0x1000 >> 12 = 0x1)
//
// Encoding:
// imm[20|10:1|11|19:12] = 0_0001000000_0_00010000
// rd = 00001 (register x1)
// opcode = 1101111 (JAL)

// Example: Encoding JAL instruction
uint32_t encode_jal(uint8_t rd, int32_t offset) {
    uint32_t instruction = 0;

    // Set opcode: JAL (1101111)
    instruction |= 0x6F;

    // Set rd field
    instruction |= (rd & 0x1F) << 7;

    // Encode 20-bit signed immediate (must be multiple of 2)
    // Bit 20 (sign) at bit 31
    instruction |= ((offset >> 20) & 0x1) << 31;
    // Bits 10:1 at bits 30:21
    instruction |= ((offset >> 1) & 0x3FF) << 21;
    // Bit 11 at bit 20
    instruction |= ((offset >> 11) & 0x1) << 20;
    // Bits 19:12 at bits 19:12
    instruction |= ((offset >> 12) & 0xFF) << 12;

    return instruction;
}

// Example: Extracting J-type immediate
int32_t extract_j_immediate(uint32_t instruction) {
    // Extract scrambled immediate bits
    uint32_t imm20 = (instruction >> 31) & 0x1;           // bit 20
    uint32_t imm10_1 = (instruction >> 21) & 0x3FF;       // bits 10:1
    uint32_t imm11 = (instruction >> 20) & 0x1;           // bit 11
    uint32_t imm19_12 = (instruction >> 12) & 0xFF;       // bits 19:12

    // Reconstruct 21-bit immediate (20 bits + 1 for sign)
    uint32_t imm21 = (imm20 << 20) | (imm19_12 << 12) |
                     (imm11 << 11) | (imm10_1 << 1);

    // Sign extend 21-bit value to 32 bits
    if (imm21 & 0x100000) {
        return (int32_t)(imm21 | 0xFFE00000);  // Sign extend
    } else {
        return (int32_t)imm21;
    }
}
```

**Explanation**:

- **20-bit offset** enables jumps up to ±1MB from current PC
- **Scrambled encoding** bits are non-sequential but reconstruction is straightforward
- **Even offset** jump offset must be multiple of 2
- **Function calls** JAL saves PC+4 in rd (typically ra register)
- **Large range** useful for function calls across large code bases

## Instruction Decoding in Kernel

**What**: Kernel and tools need to decode instructions for debugging, analysis, and verification.

**How**: Decoding implementation:

```c
// Example: Complete instruction decoder
typedef enum {
    INST_TYPE_R,
    INST_TYPE_I,
    INST_TYPE_S,
    INST_TYPE_B,
    INST_TYPE_U,
    INST_TYPE_J,
    INST_TYPE_UNKNOWN
} instruction_type_t;

struct instruction_decoded {
    instruction_type_t type;
    uint32_t raw;
    uint8_t opcode;
    union {
        struct {
            uint8_t rd;
            uint8_t rs1;
            uint8_t rs2;
            uint8_t funct3;
            uint8_t funct7;
        } rtype;
        struct {
            uint8_t rd;
            uint8_t rs1;
            int16_t imm12;
            uint8_t funct3;
        } itype;
        struct {
            uint8_t rs1;
            uint8_t rs2;
            int16_t imm12;
            uint8_t funct3;
        } stype;
        struct {
            uint8_t rs1;
            uint8_t rs2;
            int16_t imm13;
            uint8_t funct3;
        } btype;
        struct {
            uint8_t rd;
            int32_t imm20;
        } utype;
        struct {
            uint8_t rd;
            int32_t imm21;
        } jtype;
    } u;
};

// Example: Kernel instruction decoder
instruction_type_t get_instruction_type(uint32_t instruction) {
    uint8_t opcode = instruction & 0x7F;

    // Determine type based on opcode
    switch (opcode) {
        case 0x33:  // OP
        case 0x3B:  // OP-32 (RV64)
            return INST_TYPE_R;
        case 0x13:  // OP-IMM
        case 0x1B:  // OP-IMM-32 (RV64)
        case 0x03:  // LOAD
        case 0x67:  // JALR
        case 0x73:  // SYSTEM
            return INST_TYPE_I;
        case 0x23:  // STORE
            return INST_TYPE_S;
        case 0x63:  // BRANCH
            return INST_TYPE_B;
        case 0x37:  // LUI
        case 0x17:  // AUIPC
            return INST_TYPE_U;
        case 0x6F:  // JAL
            return INST_TYPE_J;
        default:
            return INST_TYPE_UNKNOWN;
    }
}

// Example: Decode instruction for kernel debugging
void decode_instruction(uint32_t instruction) {
    instruction_type_t type = get_instruction_type(instruction);
    struct instruction_decoded decoded;

    decoded.raw = instruction;
    decoded.opcode = instruction & 0x7F;
    decoded.type = type;

    switch (type) {
        case INST_TYPE_R: {
            decoded.u.rtype.rd = (instruction >> 7) & 0x1F;
            decoded.u.rtype.rs1 = (instruction >> 15) & 0x1F;
            decoded.u.rtype.rs2 = (instruction >> 20) & 0x1F;
            decoded.u.rtype.funct3 = (instruction >> 12) & 0x7;
            decoded.u.rtype.funct7 = (instruction >> 25) & 0x7F;
            printk("R-type: opcode=0x%02x rd=x%d rs1=x%d rs2=x%d f3=0x%x f7=0x%02x\n",
                   decoded.opcode, decoded.u.rtype.rd, decoded.u.rtype.rs1,
                   decoded.u.rtype.rs2, decoded.u.rtype.funct3, decoded.u.rtype.funct7);
            break;
        }
        case INST_TYPE_I: {
            decoded.u.itype.rd = (instruction >> 7) & 0x1F;
            decoded.u.itype.rs1 = (instruction >> 15) & 0x1F;
            decoded.u.itype.funct3 = (instruction >> 12) & 0x7;
            decoded.u.itype.imm12 = (int16_t)((instruction >> 20) & 0xFFF);
            // Sign extend
            if (decoded.u.itype.imm12 & 0x800) {
                decoded.u.itype.imm12 |= 0xF000;
            }
            printk("I-type: opcode=0x%02x rd=x%d rs1=x%d imm=%d f3=0x%x\n",
                   decoded.opcode, decoded.u.itype.rd, decoded.u.itype.rs1,
                   decoded.u.itype.imm12, decoded.u.itype.funct3);
            break;
        }
        // ... other types
    }
}

// Example: Kernel instruction patching (advanced)
// Used for kernel live patching or debugging
void patch_instruction(void *addr, uint32_t new_instruction) {
    // Ensure instruction cache coherence
    flush_icache_range((unsigned long)addr, 4);

    // Write new instruction
    *(uint32_t *)addr = new_instruction;

    // Synchronize instruction and data caches
    flush_icache_range((unsigned long)addr, 4);

    // Memory barrier to ensure visibility
    mb();
}
```

**Explanation**:

- **Opcode classification** first step identifies instruction type
- **Field extraction** uses bit shifting and masking to extract fields
- **Sign extension** immediate values need proper sign extension
- **Decoding tables** can map opcode/funct to operation names
- **Instruction patching** requires cache coherence maintenance

## Next Steps

**What** you're ready for next:

After mastering instruction encoding, you should be ready to:

1. **Learn Privilege Levels** - User, Supervisor, Machine modes
2. **Study Memory Model** - Addressing modes and memory ordering
3. **Explore Extensions** - Advanced extensions and custom extensions
4. **Understand Kernel Architecture** - How kernel uses RISC-V features
5. **Begin Practical Development** - Start RISC-V kernel development

**Where** to go next:

Continue with the next section on **"RISC-V Privilege Levels"** to learn:

- Privilege level architecture
- Privilege level transitions
- CSR access rules
- Exception handling mechanisms
- Security implications

**Why** the next section is important:

Privilege levels are fundamental to understanding how RISC-V provides security and system management. This knowledge is essential for kernel development.

**How** to continue learning:

1. **Read ISA Spec** - Study privilege level specification
2. **Examine Kernel Code** - Study kernel privilege level usage
3. **Use Debuggers** - Observe privilege transitions in debugger
4. **Experiment** - Write code to test privilege levels
5. **Study CSRs** - Learn Control and Status Registers

## Resources

**Official Documentation**:

- [RISC-V ISA Manual - Instruction Formats](https://github.com/riscv/riscv-isa-manual) - Complete encoding specification
- [RISC-V Opcodes](https://github.com/riscv/riscv-opcodes) - Instruction encoding database

**Tools**:

- [RISC-V objdump](https://github.com/riscv/riscv-binutils-gdb) - Disassemble instructions
- [RISC-V Spike](https://github.com/riscv/riscv-isa-sim) - Instruction trace and decode
