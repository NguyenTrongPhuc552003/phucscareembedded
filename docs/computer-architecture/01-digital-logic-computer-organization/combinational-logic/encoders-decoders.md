---
sidebar_position: 4
---

# Encoders and Decoders

Master the design and application of encoders and decoders, essential code conversion circuits used in address decoding, display drivers, interrupt priority handling, and memory systems in ARM64 processors.

## What are Encoders and Decoders?

**What**:

- **Encoder**: A combinational circuit that converts information from one form to another, typically from 2^n inputs to n-bit binary code. Reduces the number of data lines needed.
- **Decoder**: A combinational circuit that converts n-bit binary information into up to 2^n unique outputs. Expands the number of data lines.

**Why**: These circuits are crucial because:

- **Code Conversion**: Essential for converting between different data representations
- **Address Decoding**: Critical for memory and peripheral selection in processors
- **Interrupt Handling**: Priority encoders handle multiple interrupt sources
- **Display Drivers**: Decoders drive 7-segment displays and indicators
- **Resource Selection**: Select among multiple devices or memory banks
- **Data Compression**: Reduce number of signal lines needed

**When**: Encoders/decoders are used when:

- **Address Decoding**: Selecting memory banks or peripheral devices
- **Interrupt Priority**: Handling multiple interrupt sources
- **Display Driving**: Driving LED displays, seven-segment displays
- **Keypad Reading**: Encoding keypad inputs
- **Data Compression**: Reducing I/O lines
- **Device Selection**: Chip select signals in memory systems

**How**: Basic operation:

```c
// Encoder: Multiple inputs to binary code
// Decoder: Binary code to multiple outputs

// Example: 4-to-2 encoder (4 inputs, 2-bit code)
int encode_4to2(int i0, int i1, int i2, int i3) {
    if (i0) return 0b00;  // Input 0 → code 00
    if (i1) return 0b01;  // Input 1 → code 01
    if (i2) return 0b10;  // Input 2 → code 10
    if (i3) return 0b11;  // Input 3 → code 11
    return 0;             // No input active
}

// Example: 2-to-4 decoder (2-bit code to 4 outputs)
void decode_2to4(int code, int *o0, int *o1, int *o2, int *o3) {
    *o0 = *o1 = *o2 = *o3 = 0;

    switch(code) {
        case 0: *o0 = 1; break;
        case 1: *o1 = 1; break;
        case 2: *o2 = 1; break;
        case 3: *o3 = 1; break;
    }
}
```

**Where**: Used in:

- **All processors**: ARM64 address decoding, interrupt controllers
- **Memory systems**: Bank selection, device selection
- **Display systems**: Seven-segment displays, LED arrays
- **Keyboards**: Key encoding
- **Interrupt controllers**: Priority encoding
- **I/O systems**: Device selection and addressing

## Binary Encoders

**What**: A binary encoder has 2^n input lines and n output lines. Only one input should be active at a time.

### 4-to-2 Encoder

**Structure**:

```
Inputs: I0, I1, I2, I3
Outputs: Y1, Y0 (Y1 is MSB)
```

**Truth Table**:

```
I3 I2 I1 I0 | Y1 Y0
-------------|------
 0  0  0  1 |  0  0   (Input 0 active)
 0  0  1  0 |  0  1   (Input 1 active)
 0  1  0  0 |  1  0   (Input 2 active)
 1  0  0  0 |  1  1   (Input 3 active)
 0  0  0  0 |  0  0   (No input active)
```

**Boolean Equations**:

```
Y1 = I2 + I3
Y0 = I1 + I3
```

**Implementation**:

```c
typedef struct {
    uint8_t code;       // Binary code (2 bits)
    uint8_t valid;      // At least one input active
} encoder_result;

encoder_result encode_4to2(uint8_t i0, uint8_t i1,
                           uint8_t i2, uint8_t i3) {
    encoder_result result;

    // Only one should be active (mutually exclusive)
    result.valid = i0 || i1 || i2 || i3;

    if (result.valid) {
        if (i3) result.code = 3;
        else if (i2) result.code = 2;
        else if (i1) result.code = 1;
        else result.code = 0;
    } else {
        result.code = 0;
    }

    return result;
}

// Test
void test_encoder_4to2() {
    printf("4-to-2 Encoder Truth Table:\n");
    printf("I3 I2 I1 I0 | Y1 Y0 | Valid\n");
    printf("-------------|-------|------\n");

    int test_cases[][4] = {
        {0, 0, 0, 1}, {0, 0, 1, 0},
        {0, 1, 0, 0}, {1, 0, 0, 0}, {0, 0, 0, 0}
    };

    for (int i = 0; i < 5; i++) {
        encoder_result result = encode_4to2(
            test_cases[i][0], test_cases[i][1],
            test_cases[i][2], test_cases[i][3]);
        printf("%d  %d  %d  %d |  %d  %d  |  %d\n",
               test_cases[i][3], test_cases[i][2],
               test_cases[i][1], test_cases[i][0],
               (result.code >> 1) & 1, result.code & 1,
               result.valid);
    }
}
```

**Limitation**: Assumes only one input is active. If multiple inputs are active, output is undefined.

## Priority Encoders

**What**: A priority encoder handles multiple active inputs by giving priority to the highest-priority input. Outputs the code of the highest-priority active input.

**Key Feature**: Resolves ambiguity when multiple inputs are active.

### 4-to-2 Priority Encoder

**Priority**: Input 3 (highest) > Input 2 > Input 1 > Input 0 (lowest)

**Truth Table**:

```
I3 I2 I1 I0 | Y1 Y0 | Valid
-------------|-------|------
 0  0  0  0 |  0  0  |  0    (No input)
 0  0  0  1 |  0  0  |  1    (Input 0)
 0  0  1  X |  0  1  |  1    (Input 1, X=don't care)
 0  1  X  X |  1  0  |  1    (Input 2)
 1  X  X  X |  1  1  |  1    (Input 3)
```

**Implementation**:

```c
encoder_result priority_encode_4to2(uint8_t i0, uint8_t i1,
                                    uint8_t i2, uint8_t i3) {
    encoder_result result;

    result.valid = i0 || i1 || i2 || i3;

    if (i3) result.code = 3;      // Highest priority
    else if (i2) result.code = 2;
    else if (i1) result.code = 1;
    else if (i0) result.code = 0;
    else result.code = 0;

    return result;
}
```

**Applications**:

- **Interrupt Controllers**: Handle multiple interrupt sources
- **Bus Arbitration**: Priority among multiple bus masters
- **Keyboard Scanning**: Key priority encoding
- **Resource Allocation**: Priority-based resource management

**ARM64 Example - Interrupt Controller**:

```c
// Simplified interrupt priority encoder
typedef struct {
    uint8_t interrupt_level;
    uint8_t valid;
} interrupt_priority;

interrupt_priority interrupt_encoder(uint8_t *irq_lines, int num_irqs) {
    interrupt_priority result = {0, 0};

    // Find highest priority active interrupt (IRQ num_irqs-1 is highest)
    for (int i = num_irqs - 1; i >= 0; i--) {
        if (irq_lines[i]) {
            result.interrupt_level = i;
            result.valid = 1;
            return result;
        }
    }

    result.valid = 0;
    return result;
}
```

## Binary Decoders

**What**: A binary decoder has n input lines (address) and up to 2^n output lines. Exactly one output is active (high) based on the input code.

### 2-to-4 Decoder

**Structure**:

```
Inputs: A1, A0 (2-bit code)
Outputs: Y0, Y1, Y2, Y3
Enable: E (optional, enables the decoder)
```

**Truth Table**:

```
E  A1 A0 | Y3 Y2 Y1 Y0
----------|------------
0  X  X  |  0  0  0  0  (Disabled)
1  0  0  |  0  0  0  1  (Address 0)
1  0  1  |  0  0  1  0  (Address 1)
1  1  0  |  0  1  0  0  (Address 2)
1  1  1  |  1  0  0  0  (Address 3)
```

**Boolean Equations**:

```
Y0 = E · A1' · A0'
Y1 = E · A1' · A0
Y2 = E · A1 · A0'
Y3 = E · A1 · A0
```

**Implementation**:

```c
typedef struct {
    uint8_t outputs[4];
} decoder_output;

decoder_output decode_2to4(uint8_t a1, uint8_t a0, uint8_t enable) {
    decoder_output result;

    // All outputs low initially
    for (int i = 0; i < 4; i++) {
        result.outputs[i] = 0;
    }

    if (!enable) {
        return result;  // Decoder disabled
    }

    // Decode based on address
    int address = (a1 << 1) | a0;
    result.outputs[address] = 1;

    return result;
}
```

### 3-to-8 Decoder (3-line to 8-line decoder)

**Implementation**:

```c
decoder_output decode_3to8(uint8_t a2, uint8_t a1, uint8_t a0, uint8_t enable) {
    decoder_output result;

    // 8 outputs
    for (int i = 0; i < 8; i++) {
        result.outputs[i] = 0;
    }

    if (!enable) {
        return result;
    }

    int address = (a2 << 2) | (a1 << 1) | a0;
    result.outputs[address] = 1;

    return result;
}

// Generic n-to-2^n decoder
void decode_generic(int *address, int n, int *outputs, int enable) {
    for (int i = 0; i < (1 << n); i++) {
        outputs[i] = 0;
    }

    if (!enable) return;

    // Compute address from input bits
    int addr = 0;
    for (int i = 0; i < n; i++) {
        addr |= (address[i] << i);
    }

    outputs[addr] = 1;
}
```

## Applications in Processor Design

### Memory Address Decoding

**Purpose**: Select memory modules or devices based on address.

**ARM64 Example**: Memory bank selection in RK3588 SoC:

```c
// Memory controller address decoding
void memory_address_decode(uint64_t address,
                           uint8_t *chip_selects) {
    // Clear all chip selects
    for (int i = 0; i < 8; i++) {
        chip_selects[i] = 0;
    }

    // Extract 3 MSB bits for bank selection
    int bank = (address >> 40) & 0x7;
    chip_selects[bank] = 1;
}

// Example memory map:
// Bank 0: 0x00000000 - 0x000FFFFFF (DRAM, 1GB)
// Bank 1: 0x00100000 - 0x001FFFFFF (SRAM, 1GB)
// Bank 2: 0x10000000 - 0x100FFFFFF (Peripherals)
// ...
```

### Peripheral Device Selection

**Purpose**: Select I/O devices based on address.

```c
// Peripheral selection using decoder
void peripheral_select(uint64_t address) {
    // Address range: 0x10000000 - 0x100FFFFF
    // Use bits 12:10 for peripheral select
    int peripheral_id = (address >> 10) & 0x7;

    switch(peripheral_id) {
        case 0: select_uart(); break;
        case 1: select_spi(); break;
        case 2: select_i2c(); break;
        case 3: select_timer(); break;
        case 4: select_gpio(); break;
        // ... more peripherals
    }
}
```

### Instruction Decoding

**Purpose**: Decode instruction opcode to select execution unit.

```c
// Simplified ARM64 instruction decoder
typedef enum {
    EXEC_ALU, EXEC_MUL, EXEC_DIV, EXEC_SHIFT,
    EXEC_LOGICAL, EXEC_COMPARE, EXEC_BRANCH
} execution_unit;

execution_unit decode_instruction_opcode(uint32_t instruction) {
    uint8_t opcode = (instruction >> 21) & 0x3F;

    // Decode based on opcode
    if ((opcode & 0x30) == 0x00) return EXEC_ALU;
    if ((opcode & 0x30) == 0x10) return EXEC_MUL;
    if ((opcode & 0x30) == 0x20) return EXEC_LOGICAL;
    // ... more decoding logic

    return EXEC_ALU;  // Default
}
```

## Seven-Segment Display Decoder

**What**: A special decoder that converts 4-bit BCD (Binary-Coded Decimal) code to seven-segment display outputs.

**Structure**:

```
Inputs: A, B, C, D (4-bit BCD: 0000-1001)
Outputs: a, b, c, d, e, f, g (7 segments)
```

**Segment Layout**:

```
     a
    ---
 f |   | b
    -g-
 e |   | c
    ---
     d
```

**Truth Table** (for digits 0-9):

```
Digit | D C B A | a b c d e f g
------|---------|--------------
  0   | 0 0 0 0 | 1 1 1 1 1 1 0
  1   | 0 0 0 1 | 0 1 1 0 0 0 0
  2   | 0 0 1 0 | 1 1 0 1 1 0 1
  3   | 0 0 1 1 | 1 1 1 1 0 0 1
  4   | 0 1 0 0 | 0 1 1 0 0 1 1
  5   | 0 1 0 1 | 1 0 1 1 0 1 1
  6   | 0 1 1 0 | 1 0 1 1 1 1 1
  7   | 0 1 1 1 | 1 1 1 0 0 0 0
  8   | 1 0 0 0 | 1 1 1 1 1 1 1
  9   | 1 0 0 1 | 1 1 1 1 0 1 1
```

**Implementation**:

```c
typedef struct {
    uint8_t segments[7];  // a, b, c, d, e, f, g
} seven_segment_output;

seven_segment_output seven_segment_decode(uint8_t bcd) {
    seven_segment_output output;

    // Common cathode (1 lights segment)
    uint8_t patterns[10][7] = {
        {1,1,1,1,1,1,0},  // 0
        {0,1,1,0,0,0,0},  // 1
        {1,1,0,1,1,0,1},  // 2
        {1,1,1,1,0,0,1},  // 3
        {0,1,1,0,0,1,1},  // 4
        {1,0,1,1,0,1,1},  // 5
        {1,0,1,1,1,1,1},  // 6
        {1,1,1,0,0,0,0},  // 7
        {1,1,1,1,1,1,1},  // 8
        {1,1,1,1,0,1,1}   // 9
    };

    if (bcd < 10) {
        for (int i = 0; i < 7; i++) {
            output.segments[i] = patterns[bcd][i];
        }
    } else {
        // Blank for invalid input
        for (int i = 0; i < 7; i++) {
            output.segments[i] = 0;
        }
    }

    return output;
}
```

## Key Takeaways

**What** you've accomplished:

1. **Binary Encoders**: Convert multiple inputs to binary code
2. **Priority Encoders**: Handle multiple active inputs with priority
3. **Binary Decoders**: Expand binary code to multiple outputs
4. **Address Decoding**: Memory and peripheral selection
5. **Display Decoders**: Seven-segment display drivers
6. **Interrupt Handling**: Priority encoding for interrupts

**Why** these concepts matter:

- **Code Conversion**: Essential data format conversion
- **Memory Systems**: Critical for address decoding
- **Peripheral Access**: Device selection in I/O systems
- **Display Systems**: Driving LED and 7-segment displays
- **Resource Management**: Interrupt and device selection

**When** to apply:

- **Memory Addressing**: Select memory banks or devices
- **Peripheral Access**: Choose I/O devices
- **Interrupt Handling**: Priority encoding of interrupts
- **Display Driving**: LED and 7-segment displays
- **Keypad Reading**: Encode key presses

**Where** skills apply:

- **All processors**: ARM64 address decoding, interrupt controllers
- **Memory systems**: Bank and device selection
- **Display systems**: LED and 7-segment drivers
- **I/O systems**: Peripheral selection
- **Interrupt controllers**: Priority handling

## Next Steps

**What** you're ready for next:

1. **Complete Week 2**: Hands-on exercises
2. **Sequential Logic**: Latches, flip-flops, registers
3. **Practical Projects**: Build working address decoder
4. **Memory Systems**: Apply decoding to memory design

**Continue Learning**:

- Design memory address decoders
- Implement interrupt priority encoders
- Build 7-segment display drivers
- Study ARM64 memory map and decoding

Happy learning! 🚀
