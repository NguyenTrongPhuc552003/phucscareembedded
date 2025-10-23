---
sidebar_position: 1
---

# Sequential Logic and Memory Elements

Master sequential logic circuits that add memory and state storage to digital systems, understanding latches, flip-flops, registers, and counters that form the foundation of stateful computation in ARM64 processors like those in Rock 5B+.

## What is Sequential Logic?

**What**: Sequential logic circuits are digital circuits where outputs depend not only on current inputs but also on the history of past inputs - they have memory. Unlike combinational circuits, sequential circuits maintain state.

**Why**: Sequential logic is critical because:

- **Memory**: Enables storage of data and state
- **State Machines**: Allows creation of control logic
- **Registers**: Stores values in processors (ARM64 has 31 general-purpose registers)
- **Counters**: Implements program counters, timers, and sequencing
- **Synchronization**: Enables coordinated operation across system
- **Computation**: Most useful computations require state

**When**: Sequential circuits are used when:

- **State Storage**: Need to remember previous values
- **Timing Control**: Operations must happen in sequence
- **Data Buffering**: Hold data temporarily
- **Counting**: Track iterations, addresses, events
- **Control Logic**: Implement state machines
- **Synchronization**: Coordinate multiple components

**How**: Sequential circuits work through feedback:

```c
// Conceptual difference between combinational and sequential

// Combinational: Output depends ONLY on current inputs
int combinational_add(int a, int b) {
    return a + b;  // No memory of previous operations
}

// Sequential: Output depends on current input AND previous state
typedef struct {
    int accumulator;  // State (memory)
} sequential_adder;

void sequential_add(sequential_adder *s, int input) {
    s->accumulator += input;  // Depends on previous state!
}

// Example usage
void demo_sequential() {
    sequential_adder adder = {0};  // Initialize state

    sequential_add(&adder, 5);  // acc = 0 + 5 = 5
    sequential_add(&adder, 3);  // acc = 5 + 3 = 8
    sequential_add(&adder, 2);  // acc = 8 + 2 = 10

    printf("Accumulator: %d\n", adder.accumulator);  // Output: 10
    // The circuit "remembers" all previous additions!
}
```

**Where**: Sequential logic is fundamental in:

- **All processors**: ARM64 registers, program counter, status flags
- **Memory systems**: RAM cells, cache storage
- **Timers**: System timers, watchdog timers
- **State machines**: Control units, peripheral controllers
- **Rock 5B+**: Billions of flip-flops in RK3588 SoC

## Latches: Level-Triggered Memory Elements

**What**: Latches are the simplest memory elements that store one bit of information. They are level-triggered, meaning their operation is controlled by the level (HIGH or LOW) of an enable signal.

**Why**: Latches are important because:

- **Basic Memory**: Simplest circuit that can store a bit
- **Foundation**: Building block for more complex memory
- **Fast**: No clock required, responds immediately
- **Historical**: Understanding evolution to modern flip-flops
- **Special Uses**: Still used in certain applications

**Caution**: Latches are level-sensitive and can cause timing problems, which is why modern designs prefer edge-triggered flip-flops.

### SR Latch (Set-Reset Latch)

**What**: An SR latch has two inputs (Set and Reset) and two outputs (Q and Q̄). It's the most basic memory element.

**Truth Table**:

```
S  R  |  Q  Q̄  | Operation
------|---------|----------
0  0  |  Q  Q̄  | Hold (maintain previous state)
0  1  |  0  1   | Reset (clear to 0)
1  0  |  1  0   | Set (set to 1)
1  1  |  X  X   | Invalid (forbidden state)
```

**Implementation using NOR gates**:

```c
// SR Latch simulation using NOR gates
typedef struct {
    int Q;      // Output
    int Q_bar;  // Inverted output
} sr_latch;

void sr_latch_update(sr_latch *latch, int S, int R) {
    // NOR-based SR latch
    // Q = NOR(R, Q_bar)
    // Q_bar = NOR(S, Q)

    if (S == 1 && R == 1) {
        printf("ERROR: Invalid state S=1, R=1!\n");
        return;
    }

    if (S == 1 && R == 0) {
        // Set
        latch->Q = 1;
        latch->Q_bar = 0;
    } else if (S == 0 && R == 1) {
        // Reset
        latch->Q = 0;
        latch->Q_bar = 1;
    }
    // S=0, R=0: Hold current state (no change)
}

// Example: Using SR latch to debounce a button
void demo_sr_latch() {
    sr_latch latch = {0, 1};  // Initialize to Reset state

    printf("Initial: Q=%d\n", latch.Q);

    // Set the latch
    sr_latch_update(&latch, 1, 0);
    printf("After SET: Q=%d\n", latch.Q);  // Q=1

    // Hold state
    sr_latch_update(&latch, 0, 0);
    printf("After HOLD: Q=%d\n", latch.Q);  // Q=1 (unchanged)

    // Reset the latch
    sr_latch_update(&latch, 0, 1);
    printf("After RESET: Q=%d\n", latch.Q);  // Q=0
}
```

**Key Characteristics**:

- **Asynchronous**: Responds immediately to input changes
- **Level-sensitive**: Active as long as input is at certain level
- **Forbidden state**: S=1, R=1 is undefined/invalid
- **Cross-coupled**: Feedback creates memory

### D Latch (Data Latch)

**What**: A D latch has one data input (D) and one enable input (E). When enabled, the output Q follows the input D. When disabled, Q holds its value.

**Truth Table**:

```
E  D  |  Q    | Operation
------|-------|----------
0  X  |  Q    | Hold (ignore D, maintain Q)
1  0  |  0    | Pass D to Q (transparent)
1  1  |  1    | Pass D to Q (transparent)
```

**Implementation**:

```c
// D Latch (Data/Delay Latch)
typedef struct {
    int Q;
} d_latch;

void d_latch_update(d_latch *latch, int D, int E) {
    if (E == 1) {
        // Enable = 1: Transparent mode, Q follows D
        latch->Q = D;
    }
    // Enable = 0: Hold mode, Q maintains previous value
}

// Practical example: Data sampling
typedef struct {
    d_latch latch;
    int sample_count;
} data_sampler;

void sample_data(data_sampler *sampler, int data, int enable) {
    d_latch_update(&sampler->latch, data, enable);
    if (enable) {
        sampler->sample_count++;
        printf("Sample #%d: captured value %d\n",
               sampler->sample_count, sampler->latch.Q);
    }
}

// Example: Sampling changing data
void demo_d_latch() {
    data_sampler sampler = {{0}, 0};

    // Data changes but enable is LOW (hold)
    sample_data(&sampler, 1, 0);  // Not sampled
    sample_data(&sampler, 0, 0);  // Not sampled

    // Enable goes HIGH: sample the data
    sample_data(&sampler, 1, 1);  // Sample #1: captured value 1

    // Data changes while enabled (transparent)
    sample_data(&sampler, 0, 1);  // Sample #2: captured value 0
    sample_data(&sampler, 1, 1);  // Sample #3: captured value 1

    // Disable: holds last value
    sample_data(&sampler, 0, 0);  // Held at 1, not sampled
    printf("Final held value: %d\n", sampler.latch.Q);  // 1
}
```

**Problem with Latches**:

```c
// Timing hazard example: Why latches can be problematic
void latch_timing_problem() {
    d_latch latch = {0};

    // Problem: While enable is HIGH, output can change multiple times
    d_latch_update(&latch, 0, 1);  // Q = 0
    d_latch_update(&latch, 1, 1);  // Q = 1 (glitch!)
    d_latch_update(&latch, 0, 1);  // Q = 0 (another change!)

    // This is why we use edge-triggered flip-flops instead!
    // Flip-flops only change on clock edge, avoiding glitches
}
```

**Where**: Latches are used in:

- **Legacy circuits**: Older digital designs
- **Asynchronous interfaces**: Some communication protocols
- **Special applications**: Certain timing-critical circuits
- **Education**: Understanding memory fundamentals
- **Modern use is limited**: Mostly replaced by flip-flops

## Flip-Flops: Edge-Triggered Memory Elements

**What**: Flip-flops are edge-triggered memory elements that only change state on a clock transition (rising or falling edge), unlike level-sensitive latches. This makes them predictable and synchronous.

**Why**: Flip-flops are critical because:

- **Synchronous Design**: Enable reliable clocked systems
- **Timing Control**: Change only at specific instants
- **Glitch Immunity**: Ignore input changes except at clock edge
- **Registers**: Building block for all processor registers
- **Modern Standard**: Used in virtually all modern digital systems
- **ARM64 Foundation**: Cortex-A76/A55 use billions of flip-flops

**Key Advantage**: Edge-triggered operation eliminates timing hazards that plague latches.

### D Flip-Flop

**What**: The most common flip-flop type. Captures input D on clock edge and holds it until next clock edge.

**Operation**:

```
Rising edge of CLK: Q ← D (capture D)
Between edges: Q holds value (ignore D changes)
```

**Implementation**:

```c
// D Flip-Flop (Edge-Triggered)
typedef struct {
    int Q;
    int prev_clk;  // Track clock edges
} d_flipflop;

void d_flipflop_init(d_flipflop *ff) {
    ff->Q = 0;
    ff->prev_clk = 0;
}

void d_flipflop_update(d_flipflop *ff, int D, int CLK) {
    // Detect rising edge: CLK goes from 0 to 1
    int rising_edge = (CLK == 1) && (ff->prev_clk == 0);

    if (rising_edge) {
        // On rising edge: capture D
        ff->Q = D;
    }
    // Otherwise: Q maintains its value (D is ignored)

    ff->prev_clk = CLK;  // Remember clock state for next call
}

// Example: Sampling data on clock edges only
void demo_d_flipflop() {
    d_flipflop ff;
    d_flipflop_init(&ff);

    printf("D Flip-Flop Demo (rising edge triggered):\n");

    // Clock LOW, D=1 (no effect)
    d_flipflop_update(&ff, 1, 0);
    printf("CLK=0, D=1: Q=%d (no change)\n", ff.Q);  // Q=0

    // Rising edge: CLK 0→1, D=1 (capture!)
    d_flipflop_update(&ff, 1, 1);
    printf("CLK 0→1, D=1: Q=%d (captured!)\n", ff.Q);  // Q=1

    // Clock HIGH, D changes (ignored!)
    d_flipflop_update(&ff, 0, 1);
    printf("CLK=1, D=0: Q=%d (D ignored)\n", ff.Q);  // Q=1 (unchanged)

    // Clock falls 1→0 (no effect on rising-edge FF)
    d_flipflop_update(&ff, 0, 0);
    printf("CLK 1→0, D=0: Q=%d (falling edge, no change)\n", ff.Q);  // Q=1

    // Rising edge again: CLK 0→1, D=0 (capture new value)
    d_flipflop_update(&ff, 0, 1);
    printf("CLK 0→1, D=0: Q=%d (new value captured)\n", ff.Q);  // Q=0
}
```

**Timing Parameters**:

```c
// Critical timing parameters for flip-flops

// Setup Time (tsu): Minimum time D must be stable BEFORE clock edge
// Hold Time (th): Minimum time D must be stable AFTER clock edge
// Clock-to-Q Delay (tpd): Time from clock edge to Q change

typedef struct {
    double setup_time_ns;      // e.g., 0.5 ns for modern process
    double hold_time_ns;       // e.g., 0.2 ns
    double clk_to_q_delay_ns;  // e.g., 0.8 ns
    double max_freq_ghz;       // Maximum clock frequency
} flipflop_timing;

// Example: ARM Cortex-A76 flip-flop characteristics (approximate)
flipflop_timing cortex_a76_ff = {
    .setup_time_ns = 0.03,      // Very fast in modern process
    .hold_time_ns = 0.02,
    .clk_to_q_delay_ns = 0.05,
    .max_freq_ghz = 3.0         // Can operate at 3 GHz
};

// Setup and hold time violation check
int check_timing_violation(double data_arrival_ns, double clock_edge_ns,
                          flipflop_timing *timing) {
    double setup_margin = clock_edge_ns - data_arrival_ns;

    if (setup_margin < timing->setup_time_ns) {
        printf("SETUP TIME VIOLATION! Margin: %.3f ns, Required: %.3f ns\n",
               setup_margin, timing->setup_time_ns);
        return 1;
    }

    printf("Timing OK: Setup margin = %.3f ns\n", setup_margin);
    return 0;
}
```

### JK Flip-Flop

**What**: A more versatile flip-flop with two inputs (J and K) that can set, reset, hold, or toggle.

**Truth Table** (on clock edge):

```
J  K  |  Q(next)  | Operation
------|-----------|----------
0  0  |  Q        | Hold
0  1  |  0        | Reset
1  0  |  1        | Set
1  1  |  Q̄        | Toggle
```

**Implementation**:

```c
// JK Flip-Flop
typedef struct {
    int Q;
    int prev_clk;
} jk_flipflop;

void jk_flipflop_update(jk_flipflop *ff, int J, int K, int CLK) {
    int rising_edge = (CLK == 1) && (ff->prev_clk == 0);

    if (rising_edge) {
        if (J == 0 && K == 0) {
            // Hold: Q unchanged
        } else if (J == 0 && K == 1) {
            // Reset
            ff->Q = 0;
        } else if (J == 1 && K == 0) {
            // Set
            ff->Q = 1;
        } else if (J == 1 && K == 1) {
            // Toggle
            ff->Q = !ff->Q;
        }
    }

    ff->prev_clk = CLK;
}

// Example: Using JK flip-flop as a toggle
void demo_jk_toggle() {
    jk_flipflop ff = {0, 0};

    printf("JK Flip-Flop Toggle Demo:\n");

    for (int i = 0; i < 5; i++) {
        // Rising edge with J=1, K=1 (toggle mode)
        jk_flipflop_update(&ff, 1, 1, 0);  // CLK low
        jk_flipflop_update(&ff, 1, 1, 1);  // CLK rising edge

        printf("Toggle %d: Q=%d\n", i+1, ff.Q);
    }
    // Output: 1, 0, 1, 0, 1 (toggles each clock)
}
```

### T Flip-Flop (Toggle Flip-Flop)

**What**: A flip-flop with single input T. When T=1, it toggles on each clock edge. When T=0, it holds.

**Truth Table** (on clock edge):

```
T  |  Q(next)  | Operation
---|-----------|----------
0  |  Q        | Hold
1  |  Q̄        | Toggle
```

**Implementation**:

```c
// T Flip-Flop (derived from JK with J=K=T)
typedef struct {
    int Q;
    int prev_clk;
} t_flipflop;

void t_flipflop_update(t_flipflop *ff, int T, int CLK) {
    int rising_edge = (CLK == 1) && (ff->prev_clk == 0);

    if (rising_edge && T == 1) {
        ff->Q = !ff->Q;  // Toggle
    }

    ff->prev_clk = CLK;
}

// Example: Frequency divider using T flip-flop
void demo_frequency_divider() {
    t_flipflop ff = {0, 0};

    printf("Frequency Divider (T=1, divide by 2):\n");
    printf("CLK  | Q\n");
    printf("-----|---\n");

    for (int clk_cycle = 0; clk_cycle < 8; clk_cycle++) {
        // Simulate clock: low then high
        t_flipflop_update(&ff, 1, 0);
        t_flipflop_update(&ff, 1, 1);

        printf("%4d | %d\n", clk_cycle, ff.Q);
    }
    // Q toggles at half the clock frequency!
}
```

**Where**: Flip-flops are everywhere in:

- **Processor registers**: ARM64 X0-X30 general-purpose registers
- **Program counter**: Tracks instruction address
- **Pipeline registers**: Between pipeline stages in CPU
- **Cache tags**: Store address tags in cache
- **Control state**: FSM states in controllers

## Registers: Multi-Bit Storage

**What**: A register is a group of flip-flops that store multiple bits (typically 8, 16, 32, or 64 bits) and operate together.

**Why**: Registers are essential because:

- **Data Storage**: Hold operands, results, addresses
- **CPU Core**: ARM64 has 31 × 64-bit general-purpose registers
- **Fast Access**: Fastest storage in processor hierarchy
- **Parallel Load**: Can update all bits simultaneously
- **Shift Operations**: Enable serial data processing

### Parallel Load Register

**What**: A register that loads all bits simultaneously on a clock edge.

**Implementation**:

```c
// 8-bit Parallel Load Register
typedef struct {
    d_flipflop bits[8];  // 8 D flip-flops
} register_8bit;

void register_init(register_8bit *reg) {
    for (int i = 0; i < 8; i++) {
        d_flipflop_init(&reg->bits[i]);
    }
}

uint8_t register_read(register_8bit *reg) {
    uint8_t value = 0;
    for (int i = 0; i < 8; i++) {
        value |= (reg->bits[i].Q << i);
    }
    return value;
}

void register_load(register_8bit *reg, uint8_t data, int CLK) {
    for (int i = 0; i < 8; i++) {
        int bit = (data >> i) & 1;
        d_flipflop_update(&reg->bits[i], bit, CLK);
    }
}

// Example: Simple register operations
void demo_register() {
    register_8bit reg;
    register_init(&reg);

    printf("Register Demo:\n");

    // Load value 0xA5 (10100101) on rising edge
    printf("Loading 0xA5...\n");
    register_load(&reg, 0xA5, 0);  // CLK low
    register_load(&reg, 0xA5, 1);  // CLK rising edge (load!)
    printf("Register value: 0x%02X\n", register_read(&reg));

    // Try to load new value but keep clock high (no edge, no load)
    register_load(&reg, 0xFF, 1);  // No rising edge, won't load
    printf("After attempted load (no edge): 0x%02X\n", register_read(&reg));

    // Load new value with proper clock edge
    register_load(&reg, 0xFF, 0);
    register_load(&reg, 0xFF, 1);  // Rising edge, load!
    printf("After proper load: 0x%02X\n", register_read(&reg));
}
```

### Shift Registers

**What**: Registers that can shift data left or right, enabling serial-to-parallel and parallel-to-serial conversion.

**Types**:

- **SISO**: Serial In, Serial Out
- **SIPO**: Serial In, Parallel Out
- **PISO**: Parallel In, Serial Out
- **PIPO**: Parallel In, Parallel Out (universal)

**Implementation**:

```c
// 8-bit Shift Register (SIPO: Serial In, Parallel Out)
typedef struct {
    uint8_t data;
} shift_register_8bit;

void shift_register_shift_left(shift_register_8bit *sr, int serial_in, int CLK) {
    // On rising edge: shift left, insert serial_in at LSB
    if (CLK == 1) {
        sr->data = (sr->data << 1) | (serial_in & 1);
    }
}

void shift_register_shift_right(shift_register_8bit *sr, int serial_in, int CLK) {
    // On rising edge: shift right, insert serial_in at MSB
    if (CLK == 1) {
        sr->data = (sr->data >> 1) | ((serial_in & 1) << 7);
    }
}

// Example: Serial data input (like UART)
void demo_shift_register() {
    shift_register_8bit sr = {0};

    // Receive byte 0b10110011 serially (LSB first)
    uint8_t byte_to_receive = 0b10110011;

    printf("Shift Register Demo: Receiving 0x%02X serially\n", byte_to_receive);

    for (int i = 0; i < 8; i++) {
        int bit = (byte_to_receive >> i) & 1;

        // Clock cycle: low then high (rising edge)
        shift_register_shift_right(&sr, bit, 0);
        shift_register_shift_right(&sr, bit, 1);

        printf("Bit %d (value=%d): Register = 0x%02X\n", i, bit, sr.data);
    }

    printf("Final value: 0x%02X\n", sr.data);
}

// Universal Shift Register (can shift left or right)
typedef struct {
    uint8_t data;
} universal_shift_register;

void usr_operation(universal_shift_register *usr, uint8_t parallel_in,
                   int serial_in_left, int serial_in_right,
                   int mode, int CLK) {
    // mode: 0=hold, 1=shift_right, 2=shift_left, 3=parallel_load

    if (CLK == 1) {  // Rising edge
        switch(mode) {
            case 0:  // Hold
                break;
            case 1:  // Shift right
                usr->data = (usr->data >> 1) | ((serial_in_left & 1) << 7);
                break;
            case 2:  // Shift left
                usr->data = (usr->data << 1) | (serial_in_right & 1);
                break;
            case 3:  // Parallel load
                usr->data = parallel_in;
                break;
        }
    }
}
```

**Where**: Shift registers are used in:

- **Serial communication**: UART, SPI data transmission
- **Data conversion**: Serial-to-parallel, parallel-to-serial
- **Delay lines**: Creating precise delays
- **Pattern generation**: Shift pattern for testing
- **CRC calculation**: Cyclic redundancy check circuits

## Counters: Sequential Counting Circuits

**What**: Counters are sequential circuits that go through a predetermined sequence of states, typically counting up or down in binary.

**Why**: Counters are crucial because:

- **Program Counter**: Tracks instruction address in ARM64 CPU
- **Timers**: System tick timers, watchdog timers
- **Addressing**: Generate sequential memory addresses
- **Frequency Division**: Divide clock frequencies
- **Event Counting**: Count occurrences of events

### Binary Ripple Counter

**What**: Simplest counter where each flip-flop is triggered by the previous one (asynchronous).

**Implementation**:

```c
// 4-bit Ripple Counter (asynchronous)
typedef struct {
    t_flipflop bits[4];  // 4 T flip-flops
} ripple_counter_4bit;

void ripple_counter_init(ripple_counter_4bit *counter) {
    for (int i = 0; i < 4; i++) {
        counter->bits[i].Q = 0;
        counter->bits[i].prev_clk = 0;
    }
}

uint8_t ripple_counter_read(ripple_counter_4bit *counter) {
    uint8_t value = 0;
    for (int i = 0; i < 4; i++) {
        value |= (counter->bits[i].Q << i);
    }
    return value;
}

void ripple_counter_clock(ripple_counter_4bit *counter) {
    // First flip-flop gets external clock
    // Each subsequent FF is clocked by previous FF output

    // Clock bit 0
    t_flipflop_update(&counter->bits[0], 1, 0);
    t_flipflop_update(&counter->bits[0], 1, 1);  // Toggle bit 0

    // Bit 0's output clocks bit 1
    int clk1 = counter->bits[0].Q;
    t_flipflop_update(&counter->bits[1], 1, !clk1);
    t_flipflop_update(&counter->bits[1], 1, clk1);

    // Bit 1's output clocks bit 2
    int clk2 = counter->bits[1].Q;
    t_flipflop_update(&counter->bits[2], 1, !clk2);
    t_flipflop_update(&counter->bits[2], 1, clk2);

    // Bit 2's output clocks bit 3
    int clk3 = counter->bits[2].Q;
    t_flipflop_update(&counter->bits[3], 1, !clk3);
    t_flipflop_update(&counter->bits[3], 1, clk3);
}

// Demo: Ripple counter counting 0-15
void demo_ripple_counter() {
    ripple_counter_4bit counter;
    ripple_counter_init(&counter);

    printf("4-bit Ripple Counter:\n");
    printf("Clock | Count\n");
    printf("------|------\n");

    for (int clk = 0; clk < 18; clk++) {
        uint8_t count = ripple_counter_read(&counter);
        printf("%5d | %d (0x%X)\n", clk, count, count);

        ripple_counter_clock(&counter);
    }
    // Output: 0, 1, 2, 3, ... 15, 0, 1, ... (wraps around)
}
```

**Problem**: Ripple delay - takes time for carry to propagate through all bits.

### Synchronous Counter

**What**: A counter where all flip-flops are clocked simultaneously, eliminating ripple delay.

**Implementation**:

```c
// 4-bit Synchronous Binary Counter
typedef struct {
    uint8_t count;
} sync_counter_4bit;

void sync_counter_clock(sync_counter_4bit *counter, int CLK) {
    static int prev_clk = 0;

    if (CLK == 1 && prev_clk == 0) {  // Rising edge
        counter->count = (counter->count + 1) & 0x0F;  // Increment, wrap at 15
    }

    prev_clk = CLK;
}

// Up/Down Counter
typedef struct {
    uint8_t count;
    int prev_clk;
} updown_counter;

void updown_counter_clock(updown_counter *counter, int up, int CLK) {
    if (CLK == 1 && counter->prev_clk == 0) {  // Rising edge
        if (up) {
            counter->count = (counter->count + 1) & 0x0F;
        } else {
            counter->count = (counter->count - 1) & 0x0F;
        }
    }

    counter->prev_clk = CLK;
}

// Example: Program counter simulation
typedef struct {
    uint64_t PC;  // Program Counter (64-bit for ARM64)
} program_counter;

void pc_increment(program_counter *pc) {
    pc->PC += 4;  // ARM64 instructions are 4 bytes
}

void pc_branch(program_counter *pc, int64_t offset) {
    pc->PC += offset;  // Relative branch
}

void pc_jump(program_counter *pc, uint64_t target) {
    pc->PC = target;  // Absolute jump
}

// Demo: Simulating ARM64 program counter
void demo_program_counter() {
    program_counter pc = {0x1000};  // Start at address 0x1000

    printf("ARM64 Program Counter Simulation:\n");
    printf("Instruction | PC Value\n");
    printf("------------|----------\n");

    // Sequential instructions
    for (int i = 0; i < 3; i++) {
        printf("Instr %d     | 0x%lX\n", i, pc.PC);
        pc_increment(&pc);
    }

    // Branch forward by 8 bytes (2 instructions)
    printf("Branch +8   | 0x%lX\n", pc.PC);
    pc_branch(&pc, 8);

    printf("After branch| 0x%lX\n", pc.PC);

    // Jump to absolute address
    pc_jump(&pc, 0x2000);
    printf("After jump  | 0x%lX\n", pc.PC);
}
```

**Where**: Counters are used in:

- **Program Counter (PC)**: Instruction address in ARM64
- **Timers**: System tick, performance counters
- **Loop Control**: Iteration counting
- **Address Generation**: Sequential memory access
- **Frequency Division**: Generate lower frequency clocks

## Rock 5B+ ARM64 Context

**What**: The RK3588 SoC in Rock 5B+ contains billions of flip-flops implementing sequential logic at all levels.

**Why**: Understanding sequential logic in ARM64 context is critical because:

- **Register File**: 31 × 64-bit registers = 1,984 flip-flops just for general-purpose registers
- **Pipeline Registers**: Thousands between pipeline stages
- **State Machines**: Control units use sequential logic
- **Timers**: Multiple hardware timers for scheduling
- **Performance Counters**: Count events using hardware counters

### ARM64 Registers

```c
// ARM64 General-Purpose Registers (simplified model)
typedef struct {
    uint64_t X[31];  // X0-X30 (31 registers × 64 bits = 1,984 flip-flops)
    uint64_t SP;     // Stack Pointer
    uint64_t PC;     // Program Counter
    uint32_t PSTATE; // Processor State (NZCV flags, etc.)
} arm64_registers;

// Example: Register write operation
void write_register(arm64_registers *regs, int reg_num, uint64_t value) {
    if (reg_num >= 0 && reg_num < 31) {
        regs->X[reg_num] = value;  // Write to register (updates 64 flip-flops)
    }
}

// Example: Simulating ARM64 instruction execution
void execute_add(arm64_registers *regs, int rd, int rn, int rm) {
    // ADD X(rd), X(rn), X(rm)
    if (rd < 31 && rn < 31 && rm < 31) {
        regs->X[rd] = regs->X[rn] + regs->X[rm];
        regs->PC += 4;  // Increment PC
    }
}

// Example: Condition flags (sequential state)
typedef struct {
    int N;  // Negative
    int Z;  // Zero
    int C;  // Carry
    int V;  // Overflow
} condition_flags;

void update_flags(condition_flags *flags, uint64_t result) {
    flags->N = (result >> 63) & 1;  // Sign bit
    flags->Z = (result == 0) ? 1 : 0;
    // C and V would be updated based on operation
}
```

### System Timers

```c
// Rock 5B+ System Timer (simplified)
typedef struct {
    uint64_t counter;      // Free-running counter
    uint64_t compare;      // Compare value for interrupts
    int interrupt_pending;  // Interrupt flag
} system_timer;

void timer_tick(system_timer *timer, int CLK) {
    static int prev_clk = 0;

    if (CLK == 1 && prev_clk == 0) {  // Rising edge
        timer->counter++;

        // Check if counter matches compare value
        if (timer->counter == timer->compare) {
            timer->interrupt_pending = 1;  // Generate interrupt
        }
    }

    prev_clk = CLK;
}

// Example: Setting up timer for 1ms interrupt at 1 GHz clock
void demo_timer_setup() {
    system_timer timer = {0, 1000000, 0};  // 1,000,000 cycles = 1ms at 1GHz

    printf("System Timer Demo (1ms interrupt):\n");

    // Simulate 1.1ms of execution
    for (uint64_t clk = 0; clk < 1100000; clk++) {
        timer_tick(&timer, clk % 2);  // Simulate clock edges

        if (timer.interrupt_pending) {
            printf("Interrupt! Counter = %lu\n", timer.counter);
            timer.interrupt_pending = 0;  // Clear interrupt
        }
    }
}
```

### Performance Counters

```c
// ARM64 Performance Monitoring Unit (PMU) - simplified
typedef struct {
    uint64_t cycle_count;           // CPU cycles
    uint64_t instruction_count;     // Instructions retired
    uint64_t cache_miss_count;      // Cache misses
    uint64_t branch_miss_count;     // Branch mispredictions
} performance_counters;

void pmu_update(performance_counters *pmu, int instruction_retired,
                int cache_miss, int branch_miss) {
    pmu->cycle_count++;  // Increment every cycle

    if (instruction_retired) {
        pmu->instruction_count++;
    }

    if (cache_miss) {
        pmu->cache_miss_count++;
    }

    if (branch_miss) {
        pmu->branch_miss_count++;
    }
}

// Example: Calculate Instructions Per Cycle (IPC)
void demo_performance_analysis() {
    performance_counters pmu = {0, 0, 0, 0};

    // Simulate program execution
    for (int i = 0; i < 1000; i++) {
        int inst_retired = (i % 2 == 0) ? 1 : 0;  // 50% IPC (simplified)
        int cache_miss = (i % 100 == 0) ? 1 : 0;  // 1% cache miss rate
        int branch_miss = (i % 50 == 0) ? 1 : 0;  // 2% branch miss rate

        pmu_update(&pmu, inst_retired, cache_miss, branch_miss);
    }

    double ipc = (double)pmu.instruction_count / pmu.cycle_count;
    double cache_miss_rate = (double)pmu.cache_miss_count / pmu.instruction_count * 100;
    double branch_miss_rate = (double)pmu.branch_miss_count / pmu.instruction_count * 100;

    printf("Performance Analysis:\n");
    printf("Cycles: %lu\n", pmu.cycle_count);
    printf("Instructions: %lu\n", pmu.instruction_count);
    printf("IPC: %.2f\n", ipc);
    printf("Cache Miss Rate: %.2f%%\n", cache_miss_rate);
    printf("Branch Miss Rate: %.2f%%\n", branch_miss_rate);
}
```

**Where**: Sequential logic in Rock 5B+:

- **CPU Cores**: Register files, pipeline registers, state machines
- **Cache**: Tag storage, LRU state, dirty bits
- **MMU**: TLB entries, page table walkers
- **Peripherals**: UART shift registers, timer counters
- **System Control**: Power management FSMs, clock dividers

## Key Takeaways

**What** you've accomplished:

1. **Sequential Logic**: Understand circuits with memory and state
2. **Latches**: Know level-triggered memory elements (SR, D)
3. **Flip-Flops**: Master edge-triggered elements (D, JK, T)
4. **Registers**: Understand multi-bit storage and shift registers
5. **Counters**: Know binary counting circuits and applications
6. **ARM64 Context**: See how sequential logic appears in Rock 5B+

**Why** these concepts matter:

- **Fundamental to Computing**: All stateful computation requires sequential logic
- **Processor Design**: Billions of flip-flops in ARM64 cores
- **Timing Understanding**: Critical for performance optimization
- **System Design**: Essential for control logic and state machines
- **Debugging**: Understand timing-related issues

**When** to apply:

- **Digital Design**: Creating circuits with memory
- **State Machines**: Implementing control logic
- **Timing Analysis**: Ensuring setup/hold times met
- **Performance**: Understanding clock speed limitations
- **Embedded Programming**: Interacting with hardware registers

**Where** skills apply:

- **All processors**: Every CPU uses flip-flops extensively
- **FPGA Design**: Hardware description languages
- **Embedded Systems**: Direct hardware register manipulation
- **Performance Engineering**: Understanding microarchitecture
- **Computer Architecture**: Foundation for advanced topics

## Next Steps

**What** you're ready for next:

After mastering sequential logic, you're prepared for:

1. **Computer Organization**: How components connect into systems
2. **von Neumann Architecture**: Stored-program computer model
3. **ARM64 Architecture**: Complete processor organization
4. **Pipeline Design**: Multi-stage instruction execution
5. **Memory Hierarchy**: Cache and memory systems

**Where** to go next:

Continue with **"Computer Organization Fundamentals"** to learn:

- von Neumann vs. Harvard architecture
- CPU, memory, and I/O organization
- Data path and control path
- Instruction cycle (fetch-decode-execute)
- Rock 5B+ RK3588 SoC organization

**Why** next lesson is important:

You now understand the building blocks (combinational and sequential circuits). The next lesson shows how these blocks connect to form complete computer systems, setting foundation for understanding ARM64 architecture.

**How** to continue learning:

1. **Practice**: Design counters, shift registers, state machines
2. **Simulate**: Use digital logic simulators
3. **Study ARM64**: Read about Cortex-A76/A55 pipeline
4. **Experiment**: Access hardware registers on Rock 5B+
5. **Timing Analysis**: Understand clock speed and propagation delays

## Resources

**Official Documentation**:

- [Sequential Logic Tutorial](https://www.electronics-tutorials.ws/sequential/seq_1.html) - Comprehensive sequential circuits guide
- [ARM Cortex-A76 Core](https://developer.arm.com/documentation/100798/latest) - Processor pipeline and registers
- [Digital Logic Design](https://www.nandland.com/articles/sequential-logic.html) - Sequential circuit fundamentals

**Learning Resources**:

- _Digital Design and Computer Architecture_ - Harris & Harris (Chapter 3: Sequential Logic)
- _Computer Organization and Design_ - Patterson & Hennessy (ARM Edition)
- _Fundamentals of Digital Logic_ - Brown & Vranesic

**Online Tools**:

- [Logisim Evolution](https://github.com/logisim-evolution/logisim-evolution) - Sequential circuit simulator
- [CircuitVerse](https://circuitverse.org/) - Online digital logic simulator
- [HDLBits](https://hdlbits.01xz.net/wiki/Sequential_logic) - Sequential logic practice

**Rock 5B+ Specific**:

- [RK3588 Technical Reference Manual](https://rockchip.fr/RK3588%20datasheet) - SoC architecture
- [ARM Performance Monitoring Unit](https://developer.arm.com/documentation/ddi0500/latest) - PMU documentation

**Video Tutorials**:

- Ben Eater - Sequential Logic (YouTube)
- MIT 6.004 - Sequential Circuits (OCW)
- Neso Academy - Flip-Flops and Registers

Happy learning! 🚀
