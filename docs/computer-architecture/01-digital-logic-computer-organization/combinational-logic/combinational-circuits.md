---
sidebar_position: 1
---

# Combinational Logic Circuits

Master the design and analysis of combinational logic circuits, the fundamental building blocks that transform Boolean algebra into functional digital components, with practical applications on ARM64 platforms like Rock 5B+.

## What are Combinational Logic Circuits?

**What**: Combinational logic circuits are digital circuits where the output depends only on the current input values, with no memory or feedback. The same inputs always produce the same outputs immediately (after propagation delay).

**Why**: Understanding combinational circuits is crucial because:

- **Building Blocks**: Form the foundation of all digital processing
- **Deterministic Behavior**: Predictable outputs make them easier to verify
- **Arithmetic Core**: Essential for ALUs in processors like ARM64 Cortex-A76/A55
- **Data Processing**: Handle all immediate computations without state
- **Performance Critical**: Speed of combinational logic affects overall processor speed
- **Design Foundation**: Must master before understanding sequential circuits

**When**: Combinational circuits are used when:

- **Immediate Response**: Output needed instantly based on current inputs
- **No Memory Required**: Previous states are irrelevant
- **Arithmetic Operations**: Addition, subtraction, multiplication in ALUs
- **Data Routing**: Multiplexing, demultiplexing, selection
- **Encoding/Decoding**: Address decoding, display drivers
- **Comparison**: Magnitude comparators, equality checkers

**How**: Combinational circuits are designed through systematic process:

```c
// Example: Half Adder - Simplest arithmetic combinational circuit
typedef struct {
    int sum;
    int carry;
} half_adder_output;

half_adder_output half_adder(int a, int b) {
    half_adder_output result;
    result.sum = a ^ b;      // Sum = A XOR B
    result.carry = a & b;    // Carry = A AND B
    return result;
}

// Truth table for Half Adder:
// A  B | Sum Carry
// -----|----------
// 0  0 |  0   0
// 0  1 |  1   0
// 1  0 |  1   0
// 1  1 |  0   1

// Verification function
void test_half_adder() {
    printf("Half Adder Truth Table:\n");
    printf("A  B | Sum Carry\n");
    printf("-----|----------\n");
    
    for (int a = 0; a <= 1; a++) {
        for (int b = 0; b <= 1; b++) {
            half_adder_output result = half_adder(a, b);
            printf("%d  %d |  %d   %d\n", a, b, result.sum, result.carry);
        }
    }
}

// Key characteristic: Output changes when input changes (no memory)
```

**Where**: Combinational circuits are fundamental in:

- **All processors**: ARM64 Cortex-A76/A55 arithmetic and logic units
- **Memory systems**: Address decoders, data path multiplexers
- **I/O interfaces**: Encoders, decoders, parity checkers
- **Data buses**: Bus multiplexing and routing
- **Rock 5B+ RK3588**: Billions of combinational gates in the SoC

## Adders: The Foundation of Arithmetic

**What**: Adders are combinational circuits that perform binary addition, forming the core of all arithmetic operations in processors.

**Why**: Adders are critical because:

- **Arithmetic Foundation**: All mathematical operations build on addition
- **ALU Core**: Central component of every processor's ALU
- **Performance Impact**: Addition speed directly affects CPU performance
- **Universal Operation**: Used in addresses, counters, data manipulation
- **Cascadable**: Combine multiple adders for wider operands

### Half Adder

**What**: A half adder adds two single-bit inputs and produces sum and carry outputs.

**Logic Equations**:
```
Sum = A ⊕ B (A XOR B)
Carry = A · B (A AND B)
```

**Implementation**:
```c
// Half Adder - adds two bits
half_adder_output half_adder(int a, int b) {
    half_adder_output result;
    result.sum = a ^ b;      // XOR for sum
    result.carry = a & b;    // AND for carry
    return result;
}

// Example usage
void demo_half_adder() {
    printf("Half Adder Examples:\n");
    printf("0 + 0 = ");
    half_adder_output r1 = half_adder(0, 0);
    printf("%d (carry: %d)\n", r1.sum, r1.carry);
    
    printf("0 + 1 = ");
    half_adder_output r2 = half_adder(0, 1);
    printf("%d (carry: %d)\n", r2.sum, r2.carry);
    
    printf("1 + 1 = ");
    half_adder_output r3 = half_adder(1, 1);
    printf("%d (carry: %d)\n", r3.sum, r3.carry);
    // 1 + 1 = 0 with carry 1 (binary 10)
}
```

**Limitation**: Cannot handle carry input from previous stage, limiting use to LSB only.

### Full Adder

**What**: A full adder adds three bits (two inputs plus carry-in) and produces sum and carry-out, enabling multi-bit addition.

**Logic Equations**:
```
Sum = A ⊕ B ⊕ Cin
Carry_out = (A · B) + (Cin · (A ⊕ B))
            = (A · B) + (Cin · A) + (Cin · B)
```

**Implementation**:
```c
// Full Adder - adds three bits
typedef struct {
    int sum;
    int carry_out;
} full_adder_output;

full_adder_output full_adder(int a, int b, int carry_in) {
    full_adder_output result;
    
    // Method 1: Using Boolean expressions directly
    result.sum = a ^ b ^ carry_in;
    result.carry_out = (a & b) | (carry_in & (a ^ b));
    
    return result;
}

// Alternative: Full adder using two half adders
full_adder_output full_adder_ha(int a, int b, int carry_in) {
    full_adder_output result;
    
    // First half adder: add A and B
    half_adder_output ha1 = half_adder(a, b);
    
    // Second half adder: add result with carry_in
    half_adder_output ha2 = half_adder(ha1.sum, carry_in);
    
    // Final sum from second half adder
    result.sum = ha2.sum;
    
    // Carry out if either half adder generated carry
    result.carry_out = ha1.carry | ha2.carry;
    
    return result;
}

// Full truth table
void show_full_adder_truth_table() {
    printf("Full Adder Truth Table:\n");
    printf("A  B  Cin | Sum Cout\n");
    printf("----------|----------\n");
    
    for (int a = 0; a <= 1; a++) {
        for (int b = 0; b <= 1; b++) {
            for (int cin = 0; cin <= 1; cin++) {
                full_adder_output result = full_adder(a, b, cin);
                printf("%d  %d   %d  |  %d   %d\n", 
                       a, b, cin, result.sum, result.carry_out);
            }
        }
    }
}
```

**Explanation**:
- First half adder sums A and B
- Second half adder adds result with carry-in
- OR gate combines carries from both half adders
- Can be chained for multi-bit addition

### Ripple Carry Adder

**What**: A ripple carry adder chains multiple full adders to add multi-bit numbers, with carry "rippling" from LSB to MSB.

**Why**: Important for understanding:
- **Multi-bit Addition**: How processors add 32-bit or 64-bit numbers
- **Performance Limitation**: Demonstrates critical path and delay issues
- **Design Trade-offs**: Simple hardware but slower for wide operands

**Implementation**:
```c
// 8-bit Ripple Carry Adder
typedef struct {
    uint8_t sum;
    int carry_out;
} adder_8bit_output;

adder_8bit_output ripple_carry_adder_8bit(uint8_t a, uint8_t b, int carry_in) {
    adder_8bit_output result;
    full_adder_output fa[8];
    
    // Bit 0 (LSB)
    fa[0] = full_adder((a >> 0) & 1, (b >> 0) & 1, carry_in);
    
    // Bits 1-7: Each uses carry from previous stage
    for (int i = 1; i < 8; i++) {
        fa[i] = full_adder((a >> i) & 1, (b >> i) & 1, fa[i-1].carry_out);
    }
    
    // Assemble result
    result.sum = 0;
    for (int i = 0; i < 8; i++) {
        result.sum |= (fa[i].sum << i);
    }
    result.carry_out = fa[7].carry_out;
    
    return result;
}

// Test with examples
void test_ripple_adder() {
    printf("8-bit Ripple Carry Adder Tests:\n");
    
    // Test 1: 15 + 17 = 32
    adder_8bit_output r1 = ripple_carry_adder_8bit(15, 17, 0);
    printf("15 + 17 = %d (carry: %d)\n", r1.sum, r1.carry_out);
    
    // Test 2: 200 + 100 = 300 (overflow in 8-bit)
    adder_8bit_output r2 = ripple_carry_adder_8bit(200, 100, 0);
    printf("200 + 100 = %d (carry: %d) [Note: overflow!]\n", 
           r2.sum, r2.carry_out);
    
    // Test 3: 255 + 1 = 256 (overflow)
    adder_8bit_output r3 = ripple_carry_adder_8bit(255, 1, 0);
    printf("255 + 1 = %d (carry: %d)\n", r3.sum, r3.carry_out);
}
```

**Performance Analysis**:
```c
// Critical Path Delay Analysis
// If each full adder has delay D:
// - 8-bit ripple carry: 8D
// - 32-bit ripple carry: 32D
// - 64-bit ripple carry: 64D (too slow for modern CPUs!)

// This is why ARM64 uses faster adder designs
```

**Limitation**: Delay grows linearly with number of bits - impractical for 64-bit ARM64 operations.

### Carry Lookahead Adder (CLA)

**What**: A carry lookahead adder calculates carries in parallel using generate and propagate signals, dramatically improving speed for wide additions.

**Why**: CLA is essential because:
- **Speed**: O(log n) delay instead of O(n)
- **ARM64 ALUs**: Used in high-performance processors
- **64-bit Operations**: Makes wide additions practical
- **Performance**: Critical for CPU clock speed

**Theory**: For each bit position i:
```
Generate: Gi = Ai · Bi (bit position generates carry)
Propagate: Pi = Ai ⊕ Bi (bit position propagates carry)

Carry equations:
C1 = G0 + P0·C0
C2 = G1 + P1·G0 + P1·P0·C0
C3 = G2 + P2·G1 + P2·P1·G0 + P2·P1·P0·C0
...

Key insight: All carries can be calculated simultaneously!
```

**Implementation**:
```c
// 4-bit Carry Lookahead Adder
typedef struct {
    int generate;   // G = A · B
    int propagate;  // P = A ⊕ B
} gp_signals;

gp_signals get_gp(int a, int b) {
    gp_signals sig;
    sig.generate = a & b;
    sig.propagate = a ^ b;
    return sig;
}

typedef struct {
    uint8_t sum;
    int carry_out;
    int pg;  // Group propagate
    int gg;  // Group generate
} cla_4bit_output;

cla_4bit_output cla_4bit(uint8_t a, uint8_t b, int c0) {
    cla_4bit_output result;
    gp_signals gp[4];
    int c[5];  // Carries: c[0] = input, c[4] = output
    
    // Step 1: Calculate generate and propagate for each bit
    for (int i = 0; i < 4; i++) {
        gp[i] = get_gp((a >> i) & 1, (b >> i) & 1);
    }
    
    // Step 2: Calculate all carries in parallel
    c[0] = c0;
    
    // C1 = G0 + P0·C0
    c[1] = gp[0].generate | (gp[0].propagate & c[0]);
    
    // C2 = G1 + P1·G0 + P1·P0·C0
    c[2] = gp[1].generate | 
           (gp[1].propagate & gp[0].generate) |
           (gp[1].propagate & gp[0].propagate & c[0]);
    
    // C3 = G2 + P2·G1 + P2·P1·G0 + P2·P1·P0·C0
    c[3] = gp[2].generate |
           (gp[2].propagate & gp[1].generate) |
           (gp[2].propagate & gp[1].propagate & gp[0].generate) |
           (gp[2].propagate & gp[1].propagate & gp[0].propagate & c[0]);
    
    // C4 = G3 + P3·G2 + P3·P2·G1 + P3·P2·P1·G0 + P3·P2·P1·P0·C0
    c[4] = gp[3].generate |
           (gp[3].propagate & gp[2].generate) |
           (gp[3].propagate & gp[2].propagate & gp[1].generate) |
           (gp[3].propagate & gp[2].propagate & gp[1].propagate & gp[0].generate) |
           (gp[3].propagate & gp[2].propagate & gp[1].propagate & gp[0].propagate & c[0]);
    
    // Step 3: Calculate sum bits using Pi ⊕ Ci
    result.sum = 0;
    for (int i = 0; i < 4; i++) {
        int sum_bit = gp[i].propagate ^ c[i];
        result.sum |= (sum_bit << i);
    }
    
    result.carry_out = c[4];
    
    // Group signals for cascading multiple 4-bit CLAs
    result.pg = gp[3].propagate & gp[2].propagate & gp[1].propagate & gp[0].propagate;
    result.gg = gp[3].generate |
                (gp[3].propagate & gp[2].generate) |
                (gp[3].propagate & gp[2].propagate & gp[1].generate) |
                (gp[3].propagate & gp[2].propagate & gp[1].propagate & gp[0].generate);
    
    return result;
}

// Verify CLA matches ripple carry adder
void verify_cla() {
    printf("Verifying CLA vs Ripple Carry:\n");
    int mismatches = 0;
    
    for (int a = 0; a < 16; a++) {
        for (int b = 0; b < 16; b++) {
            for (int cin = 0; cin <= 1; cin++) {
                adder_8bit_output ripple = ripple_carry_adder_8bit(a, b, cin);
                cla_4bit_output cla = cla_4bit(a, b, cin);
                
                if ((ripple.sum & 0x0F) != cla.sum || ripple.carry_out != cla.carry_out) {
                    printf("MISMATCH: %d + %d + %d\n", a, b, cin);
                    mismatches++;
                }
            }
        }
    }
    
    printf("Total mismatches: %d\n", mismatches);
    printf("CLA is %s\n", mismatches == 0 ? "CORRECT" : "INCORRECT");
}
```

**Performance Advantage**:
```
Ripple Carry 64-bit: ~64 gate delays
CLA 64-bit: ~log2(64) = 6 levels ≈ 12 gate delays
Speedup: ~5x faster!

This is why ARM64 uses lookahead techniques in ALUs.
```

**Where**: CLA concepts used in:
- **ARM64 integer ALU**: Fast 64-bit additions
- **Address generation**: Quick pointer arithmetic
- **SIMD units**: Parallel arithmetic operations
- **FPU**: Floating-point mantissa addition

## Multiplexers and Demultiplexers

**What**: Multiplexers (MUX) select one of many inputs to route to output. Demultiplexers (DEMUX) route one input to one of many outputs.

**Why**: MUX/DEMUX are critical because:
- **Data Routing**: Essential for data path design
- **Resource Sharing**: Multiple sources sharing one destination
- **Register Files**: Selecting which register to read/write
- **Memory Systems**: Address-based data selection
- **Control Logic**: Implementing conditional operations

### Multiplexer (MUX)

**What**: A multiplexer selects one of 2^n inputs based on n select lines.

**2-to-1 MUX**:
```c
// 2-to-1 Multiplexer
// When S=0, output = I0
// When S=1, output = I1
int mux_2to1(int i0, int i1, int select) {
    return (select == 0) ? i0 : i1;
    
    // Equivalent Boolean expression:
    // Y = S'·I0 + S·I1
    // return (!select & i0) | (select & i1);
}

// Truth table:
// S | I0 I1 | Y
// --|-------|---
// 0 | 0  X  | 0
// 0 | 1  X  | 1
// 1 | X  0  | 0
// 1 | X  1  | 1
```

**4-to-1 MUX**:
```c
// 4-to-1 Multiplexer using 2-bit select
int mux_4to1(int i0, int i1, int i2, int i3, uint8_t select) {
    switch(select & 0x03) {
        case 0: return i0;
        case 1: return i1;
        case 2: return i2;
        case 3: return i3;
        default: return 0;
    }
    
    // Boolean expression:
    // Y = S1'·S0'·I0 + S1'·S0·I1 + S1·S0'·I2 + S1·S0·I3
}

// Can also build from three 2-to-1 MUXes
int mux_4to1_hierarchical(int i0, int i1, int i2, int i3, uint8_t select) {
    int s0 = select & 1;
    int s1 = (select >> 1) & 1;
    
    // Level 1: Two 2-to-1 MUXes
    int mux0 = mux_2to1(i0, i1, s0);
    int mux1 = mux_2to1(i2, i3, s0);
    
    // Level 2: Final 2-to-1 MUX
    return mux_2to1(mux0, mux1, s1);
}
```

**8-bit Wide 4-to-1 MUX** (common in data paths):
```c
// 8-bit wide 4-to-1 multiplexer
uint8_t mux_4to1_8bit(uint8_t i0, uint8_t i1, uint8_t i2, uint8_t i3, 
                      uint8_t select) {
    switch(select & 0x03) {
        case 0: return i0;
        case 1: return i1;
        case 2: return i2;
        case 3: return i3;
        default: return 0;
    }
}

// Example: Register file read in ARM64
// Select which of 4 registers to read
uint64_t register_read(uint64_t r0, uint64_t r1, uint64_t r2, uint64_t r3,
                       uint8_t reg_select) {
    // In real ARM64, there are 31 general-purpose registers
    // This simplified example shows the principle
    return (reg_select == 0) ? r0 :
           (reg_select == 1) ? r1 :
           (reg_select == 2) ? r2 : r3;
}
```

### Demultiplexer (DEMUX)

**What**: A demultiplexer routes one input to one of 2^n outputs based on n select lines.

**1-to-4 DEMUX**:
```c
// 1-to-4 Demultiplexer
typedef struct {
    int y0, y1, y2, y3;
} demux_1to4_output;

demux_1to4_output demux_1to4(int input, uint8_t select) {
    demux_1to4_output result = {0, 0, 0, 0};
    
    switch(select & 0x03) {
        case 0: result.y0 = input; break;
        case 1: result.y1 = input; break;
        case 2: result.y2 = input; break;
        case 3: result.y3 = input; break;
    }
    
    return result;
}

// Boolean expressions:
// Y0 = S1'·S0'·I
// Y1 = S1'·S0·I
// Y2 = S1·S0'·I
// Y3 = S1·S0·I
```

**Application - Memory Write Enable**:
```c
// Example: Use DEMUX to select which memory location to write
void memory_write_demux(uint8_t *memory, uint8_t address, 
                       uint8_t data, int write_enable) {
    if (!write_enable) return;
    
    // DEMUX routes write enable to selected address
    demux_1to4_output enables = demux_1to4(write_enable, address);
    
    if (enables.y0) memory[0] = data;
    if (enables.y1) memory[1] = data;
    if (enables.y2) memory[2] = data;
    if (enables.y3) memory[3] = data;
}
```

**Where**: MUX/DEMUX are used in:
- **ARM64 Register File**: Selecting source/destination registers  
- **Data Paths**: Routing data between ALU, memory, registers
- **Memory Systems**: Address decoding and chip selection
- **I/O Multiplexing**: Sharing pins between multiple functions
- **Bus Systems**: Arbitrating access to shared buses

## Encoders and Decoders

**What**: Encoders convert 2^n inputs to n-bit binary code. Decoders convert n-bit binary to 2^n outputs.

**Why**: Important for:
- **Code Conversion**: Translating between representations
- **Address Decoding**: Selecting memory/peripheral addresses
- **Priority Encoding**: Finding highest priority active input
- **Data Compression**: Reducing signal count

### Binary Encoder

**What**: Converts one-hot input (only one bit high) to binary representation.

**4-to-2 Encoder**:
```c
// 4-to-2 Binary Encoder
typedef struct {
    uint8_t output;  // 2-bit output
    int valid;       // Valid output indicator
} encoder_output;

encoder_output encoder_4to2(uint8_t inputs) {
    encoder_output result;
    result.valid = 0;
    result.output = 0;
    
    // Check each input (only one should be high)
    int count = 0;
    for (int i = 0; i < 4; i++) {
        if ((inputs >> i) & 1) {
            count++;
            result.output = i;
        }
    }
    
    // Valid only if exactly one input is high
    result.valid = (count == 1);
    
    return result;
}

// Truth table (assuming one-hot input):
// I3 I2 I1 I0 | Y1 Y0
// -----------|-------
//  0  0  0  1 |  0  0
//  0  0  1  0 |  0  1
//  0  1  0  0 |  1  0
//  1  0  0  0 |  1  1
```

### Priority Encoder

**What**: When multiple inputs are active, outputs binary code of highest-priority input.

**4-to-2 Priority Encoder**:
```c
// 4-to-2 Priority Encoder (higher index = higher priority)
encoder_output priority_encoder_4to2(uint8_t inputs) {
    encoder_output result;
    result.valid = (inputs != 0);  // Valid if any input is high
    
    // Check from highest to lowest priority
    if (inputs & 0x08) {        // I3 (highest priority)
        result.output = 3;
    } else if (inputs & 0x04) {  // I2
        result.output = 2;
    } else if (inputs & 0x02) {  // I1
        result.output = 1;
    } else {                     // I0 (lowest priority)
        result.output = 0;
    }
    
    return result;
}

// Example: Interrupt priority encoding in ARM64
int get_highest_priority_interrupt(uint8_t pending_interrupts) {
    encoder_output result = priority_encoder_4to2(pending_interrupts);
    return result.valid ? result.output : -1;  // -1 if no interrupts
}
```

### Binary Decoder

**What**: Converts n-bit binary input to 2^n outputs (one-hot).

**2-to-4 Decoder**:
```c
// 2-to-4 Binary Decoder  
typedef struct {
    int y0, y1, y2, y3;
} decoder_output;

decoder_output decoder_2to4(uint8_t input, int enable) {
    decoder_output result = {0, 0, 0, 0};
    
    if (!enable) return result;  // All outputs 0 when disabled
    
    uint8_t sel = input & 0x03;
    
    result.y0 = (sel == 0) ? 1 : 0;
    result.y1 = (sel == 1) ? 1 : 0;
    result.y2 = (sel == 2) ? 1 : 0;
    result.y3 = (sel == 3) ? 1 : 0;
    
    return result;
}

// Boolean expressions:
// Y0 = I1'·I0'·E
// Y1 = I1'·I0·E  
// Y2 = I1·I0'·E
// Y3 = I1·I0·E
```

**3-to-8 Decoder** (common for address decoding):
```c
// 3-to-8 Decoder using two 2-to-4 decoders
typedef struct {
    int outputs[8];
} decoder_3to8_output;

decoder_3to8_output decoder_3to8(uint8_t input, int enable) {
    decoder_3to8_output result;
    for (int i = 0; i < 8; i++) result.outputs[i] = 0;
    
    if (!enable) return result;
    
    uint8_t sel = input & 0x07;
    result.outputs[sel] = 1;
    
    return result;
}

// Example: Memory address decoding
// Decode 3-bit address to select one of 8 memory chips
int get_chip_select(uint8_t address, int mem_enable) {
    decoder_3to8_output decoded = decoder_3to8(address, mem_enable);
    
    // Find which chip is selected
    for (int i = 0; i < 8; i++) {
        if (decoded.outputs[i]) return i;
    }
    return -1;  // No chip selected
}
```

**Where**: Encoders/decoders used in:
- **Memory Systems**: Address decoding for chip select
- **ARM64 Instruction Decode**: Opcode to control signals
- **Interrupt Controllers**: Priority encoding for interrupts
- **I/O Addressing**: Peripheral selection in embedded systems
- **Display Drivers**: 7-segment display decoders

## Comparators

**What**: Comparators are circuits that compare two binary numbers and indicate their relationship (equal, greater than, less than).

**Why**: Essential for:
- **Conditional Operations**: Branch decisions in processors
- **Sorting**: Ordering data
- **Min/Max Operations**: Finding extremes
- **Range Checking**: Validating values
- **Control Logic**: State machine decisions

### Equality Comparator

**What**: Checks if two numbers are equal.

**Implementation**:
```c
// 1-bit equality check
int bit_equal(int a, int b) {
    return !(a ^ b);  // XNOR gate
}

// 4-bit equality comparator
int equals_4bit(uint8_t a, uint8_t b) {
    // Compare each bit pair, AND all results
    int eq0 = bit_equal((a >> 0) & 1, (b >> 0) & 1);
    int eq1 = bit_equal((a >> 1) & 1, (b >> 1) & 1);
    int eq2 = bit_equal((a >> 2) & 1, (b >> 2) & 1);
    int eq3 = bit_equal((a >> 3) & 1, (b >> 3) & 1);
    
    return eq0 & eq1 & eq2 & eq3;
}

// Simplified version
int equals_simple(uint8_t a, uint8_t b) {
    return (a == b) ? 1 : 0;
}
```

### Magnitude Comparator

**What**: Compares magnitudes of two numbers (A > B, A = B, A < B).

**4-bit Magnitude Comparator**:
```c
// 4-bit magnitude comparator
typedef struct {
    int greater;  // A > B
    int equal;    // A == B
    int less;     // A < B
} comparator_output;

comparator_output compare_4bit(uint8_t a, uint8_t b) {
    comparator_output result;
    
    a &= 0x0F;  // Mask to 4 bits
    b &= 0x0F;
    
    result.greater = (a > b) ? 1 : 0;
    result.equal = (a == b) ? 1 : 0;
    result.less = (a < b) ? 1 : 0;
    
    return result;
}

// Bit-by-bit comparison (how hardware does it)
comparator_output compare_4bit_hw(uint8_t a, uint8_t b) {
    comparator_output result = {0, 1, 0};  // Assume equal initially
    
    // Compare from MSB to LSB
    for (int i = 3; i >= 0; i--) {
        int ai = (a >> i) & 1;
        int bi = (b >> i) & 1;
        
        if (ai > bi) {
            result.greater = 1;
            result.equal = 0;
            result.less = 0;
            break;
        } else if (ai < bi) {
            result.greater = 0;
            result.equal = 0;
            result.less = 1;
            break;
        }
        // If equal, continue to next bit
    }
    
    return result;
}

// Example: Branch condition in ARM64
void conditional_branch_example(uint64_t a, uint64_t b) {
    comparator_output cmp = compare_4bit(a & 0x0F, b & 0x0F);
    
    if (cmp.greater) {
        printf("Branch if Greater Than (BGT)\n");
    } else if (cmp.equal) {
        printf("Branch if Equal (BEQ)\n");
    } else {
        printf("Branch if Less Than (BLT)\n");
    }
}
```

**Where**: Comparators used in:
- **ARM64 CMP instruction**: Setting condition flags
- **Branch Logic**: Conditional jumps based on comparisons
- **ALU**: Implementing conditional operations
- **Cache**: Tag comparison for hit/miss detection
- **Sort Operations**: Ordering algorithms

## Rock 5B+ ARM64 Context

**What**: The RK3588 SoC in Rock 5B+ contains billions of combinational logic gates implementing these circuits at hardware level.

**Why**: Understanding combinational logic in ARM64 context helps:
- **Performance**: Write code that maps efficiently to hardware
- **Optimization**: Understand what operations are fast/slow
- **Debugging**: Comprehend bit-level operations
- **Low-level Programming**: Effective embedded development

**How**: Combinational logic manifests in ARM64:

### ALU Operations
```c
// ARM64 ALU contains combinational circuits for:
// - Addition (64-bit CLA-based adders)
// - Bitwise operations (AND, OR, XOR, NOT)
// - Comparisons (magnitude comparators)
// - Shifts/rotates (barrel shifters - also combinational)

// Example: Efficient ARM64 bit manipulation
static inline uint64_t count_leading_zeros(uint64_t value) {
    // Maps to single CLZ instruction (combinational circuit)
    uint64_t result;
    __asm__("clz %0, %1" : "=r"(result) : "r"(value));
    return result;
}

static inline int parity(uint64_t value) {
    // XOR tree (combinational) for parity
    value ^= value >> 32;
    value ^= value >> 16;
    value ^= value >> 8;
    value ^= value >> 4;
    value ^= value >> 2;
    value ^= value >> 1;
    return value & 1;
}
```

### Register File Multiplexing
```c
// ARM64 has 31 general-purpose registers (X0-X30)
// Reading requires a 31-to-1 multiplexer for each read port

// Simplified model:
uint64_t read_register(uint64_t reg_file[31], uint8_t reg_num) {
    // In hardware: large multiplexer selects one of 31 registers
    return (reg_num < 31) ? reg_file[reg_num] : 0;
}

// ARM64 typically has 2-3 read ports (2-3 parallel MUXes)
typedef struct {
    uint64_t data1;
    uint64_t data2;
} dual_read_result;

dual_read_result read_two_registers(uint64_t reg_file[31], 
                                    uint8_t reg1, uint8_t reg2) {
    dual_read_result result;
    result.data1 = read_register(reg_file, reg1);
    result.data2 = read_register(reg_file, reg2);
    return result;
}
```

### Address Decoding
```c
// Memory address decoding uses decoders
// Example: Decode address to select peripheral in RK3588

#define GPIO_BASE      0xFDD60000
#define UART_BASE      0xFEB00000
#define I2C_BASE       0xFEA00000

int decode_peripheral_address(uint64_t address) {
    // Simplified: decode upper address bits to select peripheral
    uint32_t upper = (address >> 20) & 0xFFF;
    
    if (upper == ((GPIO_BASE >> 20) & 0xFFF)) return 0;  // GPIO
    if (upper == ((UART_BASE >> 20) & 0xFFF)) return 1;  // UART
    if (upper == ((I2C_BASE >> 20) & 0xFFF)) return 2;   // I2C
    
    return -1;  // Invalid
}
```

**Where**: Combinational logic in Rock 5B+:
- **Cortex-A76/A55 ALUs**: All arithmetic and logic operations
- **Instruction Decode**: Opcode to control signal conversion
- **Cache Tag Comparison**: Hit/miss detection
- **Address Calculation**: Memory address generation
- **GPIO Control**: Pin multiplexing and control logic

## Key Takeaways

**What** you've accomplished:

1. **Combinational Fundamentals**: Understand circuits without memory
2. **Adder Design**: Know ripple carry and carry lookahead techniques
3. **Data Routing**: Master multiplexers and demultiplexers
4. **Code Conversion**: Understand encoders and decoders
5. **Comparison**: Know how magnitude comparators work
6. **ARM64 Implementation**: See how concepts map to real hardware

**Why** these concepts matter:

- **Performance**: Understanding hardware helps write faster code
- **Design**: Foundation for building complex digital systems
- **Optimization**: Know which operations are hardware-efficient
- **Debugging**: Understand bit-level behavior
- **Career**: Essential for computer architecture and embedded systems

**When** to apply:

- **Low-level Programming**: Bit manipulation, hardware control
- **Performance Optimization**: Choosing efficient operations
- **Hardware Design**: FPGA, ASIC development
- **System Architecture**: Understanding processor internals
- **Embedded Development**: Direct hardware interaction

**Where** skills apply:

- **Processor Design**: ALU and datapath implementation
- **FPGA Development**: Combinational logic in HDL
- **Embedded Systems**: GPIO, peripheral control on Rock 5B+
- **Computer Architecture**: Understanding modern CPUs
- **Performance Engineering**: Writing hardware-friendly code

## Next Steps

**What** you're ready for next:

After mastering combinational circuits, you should:

1. **Learn Sequential Logic**: Add memory and state to circuits
2. **Study Latches and Flip-Flops**: Basic memory elements
3. **Understand Registers**: Storage elements in processors
4. **Explore State Machines**: Sequential control logic
5. **Build Complete Systems**: Combine combinational and sequential

**Where** to go next:

Continue with **"Sequential Logic and Memory Elements"** to learn:

- Latches and flip-flops (SR, D, JK, T)
- Clock signals and synchronous design
- Registers and counters
- State machines
- Memory hierarchy basics

**Why** next lesson is important:

Sequential circuits add memory to combinational logic, enabling:
- State storage (registers in ARM64)
- Program counters and instruction sequencing  
- Memory systems
- Complex control logic

**How** to continue learning:

1. **Practice**: Design adders, MUXes for different bit widths
2. **Simulate**: Use tools like Logisim or CircuitVerse
3. **Code**: Implement circuits in C for Rock 5B+
4. **Study ARM64**: Examine ALU instructions and timing
5. **Build**: Create simple combinational projects

## Resources

**Official Documentation**:
- [Digital Logic Design](https://www.nandland.com/) - Tutorials and examples
- [ARM64 ISA](https://developer.arm.com/documentation/den0024/latest) - ARM architecture reference
- [RK3588 TRM](https://rockchip.fr/RK3588%20datasheet) - SoC technical manual

**Learning Resources**:
- *Digital Design and Computer Architecture* - Harris & Harris
- *Computer Organization and Design* - Patterson & Hennessy (RISC-V/ARM editions)
- *Fundamentals of Digital Logic* - Brown & Vranesic

**Online Tools**:
- [CircuitVerse](https://circuitverse.org/) - Online circuit simulator
- [Logisim-evolution](https://github.com/logisim-evolution/logisim-evolution) - Desktop simulator
- [HDLBits](https://hdlbits.01xz.net/) - Verilog practice problems

**Video Tutorials**:
- Ben Eater - Digital Electronics (YouTube)
- MIT 6.004 - Computation Structures (OCW)
- Neso Academy - Digital Electronics

Happy learning! 🚀

