---
sidebar_position: 3
---

# Multiplexers and Demultiplexers

Master the design and application of multiplexers and demultiplexers, fundamental data routing circuits that enable efficient data selection, bus systems, and signal distribution in digital systems including ARM64 processors.

## What are Multiplexers and Demultiplexers?

**What**:

- **Multiplexer (MUX)**: A combinational circuit that selects one of many input signals and forwards the selected input to a single output line. Acts as a data selector.
- **Demultiplexer (DEMUX)**: A combinational circuit that takes a single input and routes it to one of multiple outputs based on select signals. Acts as a data distributor.

**Why**: These circuits are crucial because:

- **Data Routing**: Enable efficient selection and distribution of data
- **Bus Systems**: Fundamental to processor buses and interconnects
- **Resource Sharing**: Allow multiple sources to share single paths
- **Cost Efficiency**: Reduce wiring and component count
- **Flexibility**: Enable dynamic data routing in systems
- **ALU Function**: Used in ALU for operation selection

**When**: MUX/DEMUX are used when:

- **Data Selection**: Choose among multiple data sources
- **Bus Arbitration**: Route data on shared buses
- **Register Selection**: Select register operands in processors
- **Memory Addressing**: Select memory banks or modules
- **I/O Routing**: Connect peripherals to processors
- **Signal Routing**: Distribute clock or control signals

**How**: Basic operation:

```c
// MUX: Select one of N inputs based on select signals
// DEMUX: Route one input to one of N outputs based on select signals

// Example: 2-to-1 MUX
int mux_2to1(int input0, int input1, int select) {
    if (select == 0)
        return input0;  // Route input0 to output
    else
        return input1;  // Route input1 to output
}

// Example: 1-to-2 DEMUX
void demux_1to2(int input, int select, int *output0, int *output1) {
    if (select == 0) {
        *output0 = input;  // Route to output0
        *output1 = 0;
    } else {
        *output0 = 0;
        *output1 = input;  // Route to output1
    }
}
```

**Where**: Used in:

- **All processors**: ARM64 Cortex-A76/A55 register file, ALU
- **Memory systems**: Bank selection, data routing
- **I/O controllers**: Peripheral data routing
- **Bus interfaces**: AXI, AHB, APB protocol implementations
- **GPUs**: Mali-G610 data path routing
- **All digital systems**: From simple to complex

## Multiplexers (Data Selectors)

**What**: A multiplexer has N inputs, log₂(N) select lines, and 1 output. The select lines determine which input is connected to the output.

### 2-to-1 Multiplexer

**Structure**:

```
Inputs: I0, I1
Select: S
Output: Y

Logic: Y = (S' · I0) + (S · I1)
```

**Truth Table**:

```
S | Y
--|---
0 | I0
1 | I1
```

**Implementation**:

```c
// C implementation
int mux_2to1(int i0, int i1, int sel) {
    return (sel == 0) ? i0 : i1;
}

// Gate-level: 2 AND + 1 OR + 1 NOT gate
int mux_2to1_gates(int i0, int i1, int sel) {
    int not_s = ~sel;
    int sel0 = not_s & i0;  // AND gate
    int sel1 = sel & i1;    // AND gate
    return sel0 | sel1;     // OR gate
}
```

### 4-to-1 Multiplexer

**Structure**:

```
Inputs: I0, I1, I2, I3
Selects: S1, S0 (S1MSB, S0LSB)
Output: Y

Logic: Y = (S1'·S0'·I0) + (S1'·S0·I1) + (S1·S0'·I2) + (S1·S0·I3)
```

**Truth Table**:

```
S1 S0 | Y
------|---
 0  0  | I0
 0  1  | I1
 1  0  | I2
 1  1  | I3
```

**Implementation**:

```c
int mux_4to1(int i0, int i1, int i2, int i3, int s1, int s0) {
    int sel = (s1 << 1) | s0;

    switch(sel) {
        case 0: return i0;
        case 1: return i1;
        case 2: return i2;
        case 3: return i3;
        default: return 0;
    }
}

// N-to-1 generic MUX using array
int mux_nto1(int *inputs, int num_inputs, int select) {
    if (select < num_inputs) {
        return inputs[select];
    }
    return 0;  // Invalid select
}
```

### 8-to-1 and Larger Multiplexers

**Tree Structure**: Large MUXes built from smaller MUXes:

```
8-to-1 MUX using two 4-to-1 MUXes:

I0-I3 -----─┐
            ├─> 4-to-1 MUX ─┐
I4-I7 -----─┘               │
                            ├─> 2-to-1 MUX ─> Output
            Select S[2:1] ─┘               │
                                           │
            Select S[0] ───────────────────┘
```

**Implementation**:

```c
// 8-to-1 multiplexer
int mux_8to1(int i0, int i1, int i2, int i3,
             int i4, int i5, int i6, int i7,
             int s2, int s1, int s0) {

    // Top 4-to-1 MUX
    int top = mux_4to1(i0, i1, i2, i3, s1, s0);

    // Bottom 4-to-1 MUX
    int bottom = mux_4to1(i4, i5, i6, i7, s1, s0);

    // Final 2-to-1 MUX
    return mux_2to1(top, bottom, s2);
}
```

**Generic N-to-1 Implementation**:

```c
// Implement any N-to-1 MUX using tree structure
int mux_tree(int *inputs, int num_inputs, int *select_bits) {
    if (num_inputs == 1) {
        return inputs[0];
    }

    if (num_inputs == 2) {
        return inputs[select_bits[0]];
    }

    // Split into two halves
    int half = num_inputs / 2;
    int *top_half = inputs;
    int *bottom_half = inputs + half;

    int top_result = mux_tree(top_half, half, select_bits);
    int bottom_result = mux_tree(bottom_half, num_inputs - half, select_bits);

    // Select between halves
    int num_select = (int)log2(num_inputs);
    int msb = select_bits[num_select - 1];

    return (msb == 0) ? top_result : bottom_result;
}
```

## Demultiplexers (Data Distributors)

**What**: A demultiplexer has 1 input, log₂(N) select lines, and N outputs. The select lines determine which output receives the input signal.

### 1-to-2 Demultiplexer

**Structure**:

```
Input: I
Select: S
Outputs: Y0, Y1

Logic: Y0 = S' · I
       Y1 = S · I
```

**Truth Table**:

```
S | Y0 | Y1
--|----|----
0 | I  | 0
1 | 0  | I
```

**Implementation**:

```c
void demux_1to2(int input, int select, int *y0, int *y1) {
    if (select == 0) {
        *y0 = input;
        *y1 = 0;
    } else {
        *y0 = 0;
        *y1 = input;
    }
}

// Using gates
void demux_1to2_gates(int input, int select, int *y0, int *y1) {
    int not_s = ~select;
    *y0 = not_s & input;
    *y1 = select & input;
}
```

### 1-to-4 Demultiplexer

**Structure**:

```
Input: I
Selects: S1, S0
Outputs: Y0, Y1, Y2, Y3

Logic:
Y0 = S1'·S0'·I
Y1 = S1'·S0·I
Y2 = S1·S0'·I
Y3 = S1·S0·I
```

**Implementation**:

```c
void demux_1to4(int input, int s1, int s0,
                int *y0, int *y1, int *y2, int *y3) {
    *y0 = *y1 = *y2 = *y3 = 0;

    int sel = (s1 << 1) | s0;

    switch(sel) {
        case 0: *y0 = input; break;
        case 1: *y1 = input; break;
        case 2: *y2 = input; break;
        case 3: *y3 = input; break;
    }
}
```

## Applications in Processor Design

### Register File Multiplexing

**Purpose**: Select register operands for ALU operations.

**ARM64 Example**: Reading from 31 general-purpose registers:

```c
// Simplified 32-to-1 MUX for register selection
typedef struct {
    uint64_t registers[32];  // X0-X31
} register_file;

uint64_t read_register(register_file *rf, int reg_num) {
    // reg_num 31 is zero register (always returns 0)
    if (reg_num == 31) {
        return 0;
    }

    // Use 5-bit select to choose from 32 registers
    return rf->registers[reg_num];
}

// Multiple read ports for superscalar execution
void read_two_registers(register_file *rf,
                        int reg1, int reg2,
                        uint64_t *out1, uint64_t *out2) {
    *out1 = read_register(rf, reg1);
    *out2 = read_register(rf, reg2);

    // Note: Real register file has multiple physical read ports
    // using multiple MUXes in parallel
}
```

### ALU Operation Multiplexing

**Purpose**: Select ALU operation type (ADD, SUB, AND, OR, etc.)

```c
typedef enum {
    OP_ADD, OP_SUB, OP_AND, OP_OR,
    OP_XOR, OP_SHIFT_L, OP_SHIFT_R
} alu_op;

uint64_t alu_with_mux(uint64_t a, uint64_t b, alu_op operation) {
    switch(operation) {
        case OP_ADD: return a + b;
        case OP_SUB: return a - b;
        case OP_AND: return a & b;
        case OP_OR:  return a | b;
        case OP_XOR: return a ^ b;
        // ... other operations
        default: return 0;
    }
}
```

### Memory Address Decoding

**Purpose**: Select memory banks or devices.

```c
// Memory bank selection using DEMUX
void route_to_memory_bank(int address, uint64_t data, int write_enable) {
    // 4 memory banks, use 2 MSB bits for selection
    int bank = (address >> 30) & 0x3;  // Bits 31:30

    switch(bank) {
        case 0: write_to_bank0(address, data, write_enable); break;
        case 1: write_to_bank1(address, data, write_enable); break;
        case 2: write_to_bank2(address, data, write_enable); break;
        case 3: write_to_bank3(address, data, write_enable); break;
    }
}
```

### Bus Multiplexing

**Purpose**: Multiple devices sharing single bus.

```c
// Shared bus with multiple masters
typedef struct {
    uint64_t data;
    uint64_t address;
    int valid;
    int master_id;  // Which master is using bus
} bus_transaction;

bus_transaction arbitrate_bus(bus_transaction *master0,
                              bus_transaction *master1,
                              bus_transaction *master2,
                              bus_transaction *master3) {
    // Priority-based arbitration
    if (master0->valid) return *master0;
    if (master1->valid) return *master1;
    if (master2->valid) return *master2;
    if (master3->valid) return *master3;

    // No request
    bus_transaction empty = {0, 0, 0, -1};
    return empty;
}
```

## Implementing Boolean Functions with MUX

**Key Insight**: MUX can implement any Boolean function!

**Example**: Implement F(A,B,C) = A'B + AC

**Method 1**: Use as select variables

```
8-to-1 MUX:
Select = ABC (8 combinations)
Inputs based on truth table:
  I0 (000): 0
  I1 (001): 0
  I2 (010): A' = 1
  I3 (011): 1
  I4 (100): 0
  I5 (101): 0
  I6 (110): A = 0
  I7 (111): A = 1
```

**Implementation**:

```c
int implement_function_with_mux(int a, int b, int c) {
    int select = (a << 2) | (b << 1) | c;
    int inputs[] = {0, 0, 1, 1, 0, 0, 0, 1};
    return inputs[select];
}
```

## Key Takeaways

**What** you've accomplished:

1. **MUX Fundamentals**: Understand data selection
2. **DEMUX Fundamentals**: Understand data distribution
3. **Tree Structures**: Build large MUXes from smaller ones
4. **Processor Applications**: Register files, ALUs, memory
5. **Bus Systems**: Shared resource arbitration
6. **Function Implementation**: MUX as universal element

**Why** these concepts matter:

- **Efficient Routing**: Minimize wiring and components
- **Processor Design**: Essential for register files and ALUs
- **Bus Systems**: Enable shared resource access
- **Flexibility**: Dynamic routing in systems
- **Cost Reduction**: Reduce hardware complexity

**When** to apply:

- **Data Selection**: Multiple sources to single destination
- **Signal Distribution**: Single source to multiple destinations
- **Resource Sharing**: Multiple masters, single resource
- **Function Implementation**: Compact Boolean function realization

**Where** skills apply:

- **All processors**: Register files, ALUs, data paths
- **Memory systems**: Bank selection, routing
- **I/O controllers**: Peripheral selection
- **Bus interfaces**: Shared bus management
- **FPGAs**: Efficient resource utilization

## Next Steps

**What** you're ready for next:

1. **Encoders and Decoders**: Code conversion circuits
2. **Complete ALU**: Combine adders with MUXes
3. **Bus Design**: Multi-master bus systems
4. **Hands-on Projects**: Build working MUX/DEMUX circuits

**Continue Learning**:

- Design register files using MUXes
- Implement bus arbitration logic
- Study ARM64 processor data paths
- Optimize for area and speed

Happy learning! 🚀
