---
sidebar_position: 2
---

# Arithmetic Circuits and ALU Design

Master the design and implementation of arithmetic circuits that form the computational core of all processors, from basic adders to complete Arithmetic Logic Units (ALUs) in ARM64 processors like Cortex-A76/A55.

## What are Arithmetic Circuits?

**What**: Arithmetic circuits are combinational logic circuits that perform mathematical operations such as addition, subtraction, multiplication, and division on binary numbers. These circuits form the heart of the Arithmetic Logic Unit (ALU) in every processor.

**Why**: Arithmetic circuits are crucial because:

- **Computational Core**: Enable all mathematical operations in computers
- **ALU Foundation**: Central to processor performance and capabilities
- **Speed Critical**: Addition speed directly affects CPU clock frequency
- **Design Challenge**: Balance speed, power, and area constraints
- **Modern Importance**: Core of ARM64 processors in Rock 5B+ RK3588 SoC
- **Optimization Target**: Continuous improvement in adder designs

**When**: Arithmetic circuits are used when:

- **All ALU Operations**: Every arithmetic instruction
- **Address Calculation**: Memory addressing in processors
- **Counter Operations**: Incrementing, decrementing values
- **Index Calculation**: Array access, pointer arithmetic
- **Comparison**: Magnitude comparison for branching
- **Data Processing**: Scientific and engineering applications

**How**: Arithmetic circuits work through:

```c
// Example: Basic arithmetic operations in processors
// ARM64 ADD instruction: X0 = X1 + X2

// This internally uses an adder circuit
int add_operation(int operand_a, int operand_b) {
    // Combines bits with carry propagation
    return operand_a + operand_b;
}

// Implementation uses adder circuits at gate level
// Sum bit: S = A ⊕ B ⊕ Cin
// Carry bit: Cout = (A·B) + (Cin·(A⊕B))
```

**Where**: Arithmetic circuits are found in:

- **Every processor**: ARM64 Cortex-A76/A55 in Rock 5B+
- **GPU processors**: Mali-G610 arithmetic units
- **NPU accelerators**: Matrix multiplication units
- **FPUs**: Floating-point arithmetic units
- **All computing devices**: From microcontrollers to supercomputers

## Half Adder

**What**: A half adder is the simplest adder, adding two single bits and producing a sum and carry output. It's called "half" because it doesn't handle incoming carry.

**Truth Table**:

```
Inputs | Outputs
A  B   | Sum Carry
-------|----------
0  0   |  0    0
0  1   |  1    0
1  0   |  1    0
1  1   |  0    1
```

**Boolean Equations**:

```
Sum = A ⊕ B
Carry = A · B
```

**Implementation**:

```c
// C implementation of half adder
typedef struct {
    uint8_t sum;
    uint8_t carry;
} half_adder_result;

half_adder_result half_adder(uint8_t a, uint8_t b) {
    half_adder_result result;
    result.sum = a ^ b;        // XOR for sum
    result.carry = a & b;      // AND for carry
    return result;
}

// Test half adder
void test_half_adder() {
    printf("Half Adder Truth Table:\n");
    printf("A B | Sum Carry\n");
    printf("----|----------\n");

    for (int a = 0; a <= 1; a++) {
        for (int b = 0; b <= 1; b++) {
            half_adder_result result = half_adder(a, b);
            printf("%d %d |  %d    %d\n",
                   a, b, result.sum, result.carry);
        }
    }
}
```

**Logic Gates**: Uses 1 XOR gate and 1 AND gate (total: 6 transistors in CMOS).

**Limitation**: Cannot handle carry-in from previous addition, limiting cascading.

## Full Adder

**What**: A full adder adds three bits (two input bits plus a carry-in bit) and produces a sum and carry-out. This is the fundamental building block for multi-bit adders.

**Truth Table**:

```
Inputs       | Outputs
A  B  Cin    | Sum Cout
-------------|----------
0  0   0     |  0   0
0  0   1     |  1   0
0  1   0     |  1   0
0  1   1     |  0   1
1  0   0     |  1   0
1  0   1     |  0   1
1  1   0     |  0   1
1  1   1     |  1   1
```

**Boolean Equations**:

```
Sum = A ⊕ B ⊕ Cin
Cout = (A · B) + (Cin · (A ⊕ B))
```

**Implementation**:

```c
// C implementation of full adder
typedef struct {
    uint8_t sum;
    uint8_t carry_out;
} full_adder_result;

full_adder_result full_adder(uint8_t a, uint8_t b, uint8_t carry_in) {
    full_adder_result result;
    result.sum = a ^ b ^ carry_in;
    result.carry_out = (a & b) | (carry_in & (a ^ b));
    return result;
}

// Test full adder
void test_full_adder() {
    printf("Full Adder Truth Table:\n");
    printf("A B Cin | Sum Cout\n");
    printf("--------|---------\n");

    for (int a = 0; a <= 1; a++) {
        for (int b = 0; b <= 1; b++) {
            for (int cin = 0; cin <= 1; cin++) {
                full_adder_result result = full_adder(a, b, cin);
                printf("%d %d  %d  |  %d   %d\n",
                       a, b, cin, result.sum, result.carry_out);
            }
        }
    }
}
```

**Logic Gates**: Can be implemented using 2 XOR, 2 AND, and 1 OR gate (~16 transistors).

**Key Advantage**: Handles carry-in, enabling cascading for multi-bit addition.

## Ripple-Carry Adder (RCA)

**What**: A ripple-carry adder cascades multiple full adders to add two n-bit numbers. The carry "ripples" from the least significant bit to the most significant bit sequentially.

**How It Works**:

```
For 4-bit addition of A[3:0] + B[3:0]:

    C3 ---┐ C2 ---┐ C1 ---┐ C0 ---┐ Cin=0
          |       |       |       |
    FA3   |  FA2  |  FA1  |  FA0  |
    |     |  |    |  |    |  |    |
A3 B3     A2 B2   A1 B1   A0 B0
    |     |  |    |  |    |  |
    └─S3  └─S2   └─S1    └─S0
            |
          Cout
```

**Implementation**:

```c
// 4-bit ripple-carry adder
typedef struct {
    uint8_t sum[4];    // 4-bit result
    uint8_t carry_out; // Final carry
} rca_4bit_result;

rca_4bit_result ripple_carry_adder_4bit(
    uint8_t a[4], uint8_t b[4], uint8_t carry_in) {

    rca_4bit_result result;
    uint8_t carry = carry_in;

    // Add bits from right (LSB) to left (MSB)
    for (int i = 0; i < 4; i++) {
        full_adder_result fa = full_adder(a[i], b[i], carry);
        result.sum[i] = fa.sum;
        carry = fa.carry_out;
    }

    result.carry_out = carry;
    return result;
}

// Test RCA with 4-bit numbers
void test_rca_4bit() {
    printf("4-bit Ripple-Carry Adder Test:\n");

    // Example: 5 + 3 = 8
    uint8_t a[] = {1, 0, 1, 0}; // 5 in binary: 0101 (LSB first)
    uint8_t b[] = {1, 1, 0, 0}; // 3 in binary: 0011 (LSB first)

    rca_4bit_result result = ripple_carry_adder_4bit(a, b, 0);

    printf("   ");
    for (int i = 3; i >= 0; i--) printf("%d", a[i]);
    printf("\n+  ");
    for (int i = 3; i >= 0; i--) printf("%d", b[i]);
    printf("\n---------\n ");
    for (int i = 3; i >= 0; i--) printf("%d", result.sum[i]);
    printf(" (Carry: %d)\n", result.carry_out);
}
```

**Timing Analysis**:

```
Critical Path Delay = n × t_propagation
Where:
  n = number of bits
  t_propagation = delay through one full adder (~2 gate delays)

For 32-bit addition: ~64 gate delays
For 64-bit addition (ARM64): ~128 gate delays
```

**Advantages**:

- Simple design
- Regular structure (easy to layout)
- Low area overhead
- Handles any bit width

**Disadvantages**:

- Slow for large bit widths
- Carry propagation is sequential
- Not suitable for high-speed applications

**Where Used**: Simple microcontrollers, low-power devices, educational purposes.

## Carry-Lookahead Adder (CLA)

**What**: A carry-lookahead adder computes all carry signals in parallel using dedicated logic, eliminating the ripple effect and significantly reducing delay.

**Key Insight**: Instead of waiting for carry to ripple, we predict it:

```
Carry Generate: G[i] = A[i] · B[i]
Carry Propagate: P[i] = A[i] ⊕ B[i]
Carry: C[i+1] = G[i] + P[i] · C[i]
```

**Block Carry Computation**:

```
C1 = G0 + P0 · C0
C2 = G1 + P1 · G0 + P1 · P0 · C0
C3 = G2 + P2 · G1 + P2 · P1 · G0 + P2 · P1 · P0 · C0
C4 = G3 + P3 · G2 + P3 · P2 · G1 + P3 · P2 · P1 · G0 + P3 · P2 · P1 · P0 · C0
```

**Implementation**:

```c
// 4-bit carry-lookahead adder
typedef struct {
    uint8_t sum[4];
    uint8_t carry_out;
} cla_4bit_result;

cla_4bit_result carry_lookahead_adder_4bit(
    uint8_t a[4], uint8_t b[4], uint8_t carry_in) {

    cla_4bit_result result;

    // Generate (G) and Propagate (P) signals
    uint8_t g[4], p[4];
    for (int i = 0; i < 4; i++) {
        g[i] = a[i] & b[i];    // Generate
        p[i] = a[i] ^ b[i];    // Propagate
    }

    // Compute carry signals in parallel
    uint8_t c[5];
    c[0] = carry_in;
    c[1] = g[0] | (p[0] & c[0]);
    c[2] = g[1] | (p[1] & g[0]) | (p[1] & p[0] & c[0]);
    c[3] = g[2] | (p[2] & g[1]) | (p[2] & p[1] & g[0]) |
           (p[2] & p[1] & p[0] & c[0]);
    c[4] = g[3] | (p[3] & g[2]) | (p[3] & p[2] & g[1]) |
           (p[3] & p[2] & p[1] & g[0]) | (p[3] & p[2] & p[1] & p[0] & c[0]);

    // Compute sum
    for (int i = 0; i < 4; i++) {
        result.sum[i] = p[i] ^ c[i];
    }

    result.carry_out = c[4];
    return result;
}
```

**Timing Analysis**:

```
CLA Delay = t_generate + t_lookahead + t_sum
          = 1 gate + 3-4 gates + 1 gate
          = ~5-6 gate delays

For 64-bit: ~6-8 gate delays (vs 128 for RCA!)
```

**Advantages**:

- Very fast (near-constant delay)
- Parallel carry computation
- Good for wide adders (32, 64, 128-bit)

**Disadvantages**:

- More complex logic
- Higher area/power
- Fan-out issues for very wide adders

**Where Used**: Modern processors (ARM64, x86), high-performance CPUs, GPUs.

## Subtraction Circuits

**What**: Subtraction is performed using addition by representing negative numbers in two's complement form.

**Two's Complement Method**:

```
A - B = A + (~B + 1)
```

**Subtractor Implementation**:

```c
// 4-bit subtractor using adder
typedef struct {
    uint8_t difference[4];
    uint8_t borrow;
} subtractor_4bit_result;

subtractor_4bit_result subtractor_4bit(
    uint8_t a[4], uint8_t b[4]) {

    subtractor_4bit_result result;

    // Compute two's complement of B
    uint8_t b_comp[4];
    for (int i = 0; i < 4; i++) {
        b_comp[i] = ~b[i];  // One's complement
    }

    // Add one to get two's complement (carry-in = 1)
    rca_4bit_result add_result = ripple_carry_adder_4bit(
        a, b_comp, 1);

    result.difference[0] = add_result.sum[0];
    result.difference[1] = add_result.sum[1];
    result.difference[2] = add_result.sum[2];
    result.difference[3] = add_result.sum[3];

    // Invert carry to get borrow
    result.borrow = ~add_result.carry_out;

    return result;
}
```

**The Advantage**: Same adder hardware can perform both addition and subtraction!

## Arithmetic Logic Unit (ALU)

**What**: An ALU is a combinational circuit that performs arithmetic and logic operations on binary operands. It's the computational core of every processor.

**Common ALU Operations**:

```
Arithmetic:
  - ADD, SUB, INC, DEC
  - NEG, ABS

Logic:
  - AND, OR, XOR, NOT
  - Shift left, shift right
  - Rotate left, rotate right

Comparison:
  - Compare (A < B, A = B, A > B)
  - Sign, zero, overflow checks
```

**Basic 4-bit ALU Design**:

```c
// ALU operation codes
typedef enum {
    ALU_ADD = 0,   // Add
    ALU_SUB = 1,   // Subtract
    ALU_AND = 2,   // AND
    ALU_OR  = 3,   // OR
    ALU_XOR = 4,   // XOR
    ALU_NOT = 5,   // NOT (uses A operand)
    ALU_SHL = 6,   // Shift left
    ALU_SHR = 7    // Shift right
} alu_opcode;

// 4-bit ALU result structure
typedef struct {
    uint8_t result[4];
    uint8_t zero;      // Result is zero
    uint8_t carry;     // Carry/borrow
    uint8_t overflow;  // Overflow occurred
    uint8_t negative;  // Result is negative
} alu_result_4bit;

// Basic 4-bit ALU
alu_result_4bit alu_4bit(
    uint8_t a[4], uint8_t b[4], alu_opcode op) {

    alu_result_4bit result;

    switch(op) {
        case ALU_ADD: {
            rca_4bit_result add_r = ripple_carry_adder_4bit(a, b, 0);
            for (int i = 0; i < 4; i++) result.result[i] = add_r.sum[i];
            result.carry = add_r.carry_out;
            break;
        }

        case ALU_SUB: {
            uint8_t b_comp[4];
            for (int i = 0; i < 4; i++) b_comp[i] = ~b[i];
            rca_4bit_result sub_r = ripple_carry_adder_4bit(a, b_comp, 1);
            for (int i = 0; i < 4; i++) result.result[i] = sub_r.sum[i];
            result.carry = ~sub_r.carry_out;  // Borrow
            break;
        }

        case ALU_AND:
            for (int i = 0; i < 4; i++)
                result.result[i] = a[i] & b[i];
            break;

        case ALU_OR:
            for (int i = 0; i < 4; i++)
                result.result[i] = a[i] | b[i];
            break;

        case ALU_XOR:
            for (int i = 0; i < 4; i++)
                result.result[i] = a[i] ^ b[i];
            break;

        case ALU_NOT:
            for (int i = 0; i < 4; i++)
                result.result[i] = ~a[i];
            break;

        case ALU_SHL:
            result.result[0] = 0;
            result.result[1] = a[0];
            result.result[2] = a[1];
            result.result[3] = a[2];
            result.carry = a[3];
            break;

        case ALU_SHR:
            result.result[0] = a[1];
            result.result[1] = a[2];
            result.result[2] = a[3];
            result.result[3] = 0;
            result.carry = a[0];
            break;
    }

    // Compute status flags
    result.zero = 1;
    result.negative = result.result[3];  // MSB is sign

    for (int i = 0; i < 4; i++) {
        if (result.result[i]) result.zero = 0;
    }

    // Simple overflow detection (for ADD/SUB)
    if (op == ALU_ADD || op == ALU_SUB) {
        // Overflow when signs don't match result
        result.overflow = (a[3] == b[3]) && (a[3] != result.result[3]);
    }

    return result;
}
```

**ARM64 ALU Features**:

The ARM64 ALU in Cortex-A76/A55 is highly sophisticated:

- **64-bit operations** (and 32-bit)
- **Multiple execution units** for parallel operations
- **Carry-lookahead adders** for speed
- **Status flags**: N (negative), Z (zero), C (carry), V (overflow)
- **Integrated with register file** for fast access
- **Pipeline support** for high throughput

**ALU Instruction Example**:

```asm
// ARM64 ADD instruction
ADD X0, X1, X2    // X0 = X1 + X2

// Internal ALU operations:
// 1. Read X1 and X2 from register file
// 2. ALU performs 64-bit addition using carry-lookahead
// 3. Set flags: N, Z, C, V
// 4. Write result back to X0
// Total: ~1-2 cycles (depending on pipeline)
```

## Key Takeaways

**What** you've accomplished:

1. **Half & Full Adders**: Build basic addition circuits
2. **Ripple-Carry**: Sequential multi-bit addition
3. **Carry-Lookahead**: Parallel carry for high speed
4. **Subtraction**: Two's complement method
5. **ALU**: Complete arithmetic-logic unit design
6. **ARM64 Context**: Real-world processor applications

**Why** these concepts matter:

- **Performance Foundation**: Adder speed determines CPU frequency
- **ALU Core**: Central to all arithmetic operations
- **Design Skills**: Essential for digital circuit design
- **Architecture Understanding**: Processors like Cortex-A76/A55 use these
- **Optimization**: Trade-offs between speed, area, power

**When** to apply:

- **Processor Design**: ALU implementation
- **Performance Critical**: High-speed applications
- **Embedded Systems**: Optimization for target platform
- **Educational**: Understanding computer fundamentals
- **Research**: Exploring new adder architectures

**Where** skills apply:

- **All processors**: ARM64, x86, RISC-V
- **GPUs**: Graphics processing units
- **NPUs**: Neural processing units
- **FPGAs**: Custom hardware implementation
- **ASICs**: Application-specific chips

## Next Steps

**What** you're ready for next:

1. **Multiplexers and Demultiplexers**: Data routing circuits
2. **Encoders and Decoders**: Code conversion circuits
3. **Practical ALU**: Build complete working ALU
4. **Performance Analysis**: Measure and optimize

**Continue Learning**:

- Practice with combinational circuit designs
- Simulate adders in logic simulators
- Study ARM64 ALU implementation details
- Optimize for speed vs. area trade-offs

Happy learning! 🚀
