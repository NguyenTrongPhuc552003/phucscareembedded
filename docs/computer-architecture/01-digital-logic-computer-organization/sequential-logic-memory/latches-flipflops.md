---
sidebar_position: 1
---

# Latches and Flip-Flops

Master the fundamental memory elements that enable state storage in digital systems. Understand how latches and flip-flops form the building blocks of all sequential circuits in ARM64 processors.

## What are Latches and Flip-Flops?

**What**: Latches and flip-flops are the most basic memory elements that store one bit of information, forming the foundation of all sequential circuits.

**Why**: These elements are fundamental because:

- **State Storage**: Enable digital systems to remember values
- **Processor Registers**: All CPU registers are built from flip-flops
- **Synchronization**: Enable clock-based digital systems
- **Memory Cells**: Form the storage elements in RAM and cache
- **Control Logic**: Implement state machines and control units
- **ARM64 Foundation**: Billions of flip-flops in Cortex-A76/A55

**Difference**:

- **Latches**: Level-sensitive, respond to input levels (older, problematic)
- **Flip-flops**: Edge-triggered, respond only to clock transitions (modern standard)

**When**: Use latches/flip-flops when:

- **State Storage**: Need to remember binary state
- **Data Sampling**: Capture data at specific times
- **Timing Control**: Synchronize operations with clock
- **Building Registers**: Create multi-bit storage
- **State Machines**: Implement sequential control logic

**Where**: Found in:

- **All processors**: ARM64 has billions of flip-flops for registers, pipeline stages
- **Memory**: RAM and cache cells
- **Rock 5B+**: RK3588 SoC contains ~8 billion flip-flops
- **Every digital system**: From calculators to supercomputers

## Latches: Level-Triggered Memory

**What**: Latches are level-sensitive memory elements. They respond to the logic level (HIGH/LOW) of control signals, not transitions.

**Problem**: Latches are transparent when enabled, causing timing issues. Modern designs prefer flip-flops.

### SR Latch (Set-Reset)

**What**: The simplest memory element with two inputs (Set, Reset) and two outputs (Q, Q̄).

**Truth Table**:

```
S  R  |  Q  Q̄  |  State
------|---------|--------
0  0  |  Q  Q̄  |  Hold (memory)
0  1  |  0  1   |  Reset (clear)
1  0  |  1  0   |  Set (store 1)
1  1  |  ?  ?   |  Forbidden!
```

**Implementation**:

```c
// SR Latch using NOR gates
typedef struct {
    int Q;
    int Q_bar;
} sr_latch;

void sr_latch_update(sr_latch *latch, int S, int R) {
    if (S == 1 && R == 1) {
        // Forbidden state - avoid!
        printf("ERROR: Invalid S=1, R=1\n");
        return;
    }

    if (S == 1 && R == 0) {
        latch->Q = 1;      // Set
        latch->Q_bar = 0;
    } else if (S == 0 && R == 1) {
        latch->Q = 0;      // Reset
        latch->Q_bar = 1;
    }
    // S=0, R=0: Hold (no change)
}

// Example: Simple set-reset control
void demo_sr_latch() {
    sr_latch latch = {0, 1};

    sr_latch_update(&latch, 1, 0);  // Set: Q=1
    printf("After SET: Q=%d\n", latch.Q);

    sr_latch_update(&latch, 0, 0);  // Hold: Q=1 (unchanged)
    printf("After HOLD: Q=%d\n", latch.Q);

    sr_latch_update(&latch, 0, 1);  // Reset: Q=0
    printf("After RESET: Q=%d\n", latch.Q);
}
```

**Characteristics**:

- **Asynchronous**: Changes immediately when inputs change
- **Level-sensitive**: Active as long as input is at that level
- **Forbidden state**: S=1, R=1 is invalid
- **Cross-coupled feedback**: Creates the memory effect

### D Latch (Data Latch)

**What**: Single data input (D) and enable input (E). When enabled, Q follows D. When disabled, Q holds.

**Truth Table**:

```
E  D  |  Q   |  Mode
------|------|----------
0  X  |  Q   |  Hold (ignores D)
1  D  |  D   |  Transparent (Q follows D)
```

**Implementation**:

```c
// D Latch
typedef struct {
    int Q;
} d_latch;

void d_latch_update(d_latch *latch, int D, int E) {
    if (E == 1) {
        latch->Q = D;  // Transparent: Q = D
    }
    // E=0: Hold (Q maintains value)
}

// Example: Data sampling (with limitation)
void demo_d_latch() {
    d_latch latch = {0};

    // Enable: Q follows D
    d_latch_update(&latch, 1, 1);
    printf("E=1, D=1: Q=%d\n", latch.Q);  // Q=1

    d_latch_update(&latch, 0, 1);
    printf("E=1, D=0: Q=%d\n", latch.Q);  // Q=0 (changed!)

    // Disable: Holds
    d_latch_update(&latch, 1, 0);
    printf("E=0, D=1: Q=%d\n", latch.Q);  // Q=0 (unchanged!)
}
```

**Latch Problem**:

```c
// Why latches are problematic: Timing hazards
void latch_timing_issue() {
    d_latch latch = {0};

    // While enabled, output can change multiple times
    d_latch_update(&latch, 0, 1);  // Q=0
    d_latch_update(&latch, 1, 1);  // Q=1 (glitch!)
    d_latch_update(&latch, 0, 1);  // Q=0 (another change!)

    // This unpredictability causes timing problems!
    // Solution: Use edge-triggered flip-flops instead
}
```

**Modern Use**: Rarely used in new designs. Understanding helps grasp flip-flop design.

## Flip-Flops: Edge-Triggered Memory

**What**: Flip-flops only change state on clock edge (rising or falling), not continuously. This eliminates latch timing issues.

**Why Flip-Flops**:

- **Predictable**: Change only at well-defined moments
- **Glitch-free**: Ignore input changes between edges
- **Synchronous**: Enable reliable clocked systems
- **Standard**: Used in all modern processors

### D Flip-Flop (Most Common)

**What**: Captures input D on clock edge and holds it until next edge.

**Operation**:

```
Rising edge: Q ← D (capture D)
Between edges: Q held (D ignored)
```

**Implementation**:

```c
// D Flip-Flop
typedef struct {
    int Q;
    int prev_clk;
} d_flipflop;

void d_flipflop_init(d_flipflop *ff) {
    ff->Q = 0;
    ff->prev_clk = 0;
}

void d_flipflop_update(d_flipflop *ff, int D, int CLK) {
    // Detect rising edge: CLK 0→1
    int rising_edge = (CLK == 1) && (ff->prev_clk == 0);

    if (rising_edge) {
        ff->Q = D;  // Capture D on rising edge
    }
    // Between edges: Q holds value

    ff->prev_clk = CLK;
}

// Example: Synchronized data capture
void demo_d_flipflop() {
    d_flipflop ff;
    d_flipflop_init(&ff);

    printf("D Flip-Flop (rising edge):\n");

    // CLK low: input changes ignored
    d_flipflop_update(&ff, 1, 0);
    printf("CLK=0, D=1: Q=%d\n", ff.Q);  // Q=0

    // Rising edge: capture!
    d_flipflop_update(&ff, 1, 1);
    printf("CLK 0→1, D=1: Q=%d\n", ff.Q);  // Q=1 ✓

    // CLK high: D changes ignored
    d_flipflop_update(&ff, 0, 1);
    printf("CLK=1, D=0: Q=%d\n", ff.Q);  // Q=1 (unchanged)

    // Next rising edge: capture new D
    d_flipflop_update(&ff, 0, 0);
    d_flipflop_update(&ff, 0, 1);
    printf("CLK 0→1, D=0: Q=%d\n", ff.Q);  // Q=0 ✓
}
```

**Timing Parameters**:

```c
// Critical timing for flip-flops
typedef struct {
    double setup_time_ns;      // Data stable BEFORE edge
    double hold_time_ns;       // Data stable AFTER edge
    double clk_to_q_ns;        // Delay from edge to Q change
    double max_freq_ghz;
} ff_timing;

// Example: Cortex-A76 flip-flop timing
ff_timing cortex_a76 = {
    .setup_time_ns = 0.03,
    .hold_time_ns = 0.02,
    .clk_to_q_ns = 0.05,
    .max_freq_ghz = 3.0
};

// Timing violation detection
int check_setup_violation(double data_arrival, double clk_edge,
                          ff_timing *timing) {
    double margin = clk_edge - data_arrival;

    if (margin < timing->setup_time_ns) {
        printf("SETUP VIOLATION! Margin: %.3f ns\n", margin);
        return 1;
    }
    return 0;
}
```

**Key Point**: Flip-flops eliminate the timing unpredictability of latches by only responding to clock edges.

### JK Flip-Flop

**What**: More versatile than D flip-flop. Two inputs (J, K) enable four operations.

**Truth Table** (on clock edge):

```
J  K  |  Q(next)
------|----------
0  0  |  Q      (hold)
0  1  |  0      (reset)
1  0  |  1      (set)
1  1  |  Q̄      (toggle)
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
            // Hold: no change
        } else if (J == 0 && K == 1) {
            ff->Q = 0;  // Reset
        } else if (J == 1 && K == 0) {
            ff->Q = 1;  // Set
        } else if (J == 1 && K == 1) {
            ff->Q = !ff->Q;  // Toggle
        }
    }

    ff->prev_clk = CLK;
}

// Example: Toggle operation
void demo_jk_toggle() {
    jk_flipflop ff = {0, 0};

    for (int i = 0; i < 5; i++) {
        jk_flipflop_update(&ff, 1, 1, 0);  // Clock low
        jk_flipflop_update(&ff, 1, 1, 1);  // Clock rising edge
        printf("Toggle %d: Q=%d\n", i+1, ff.Q);
    }
    // Output: 1, 0, 1, 0, 1 (toggles each clock)
}
```

**Use Cases**:

- **Toggle Mode**: J=K=1 for divide-by-2 frequency divider
- **Flexible Control**: Can set, reset, hold, or toggle
- **Historical**: More common in older designs

### T Flip-Flop (Toggle)

**What**: Simplified flip-flop. When T=1, toggles on clock edge. When T=0, holds value.

**Truth Table**:

```
T  |  Q(next)
---|----------
0  |  Q       (hold)
1  |  Q̄       (toggle)
```

**Implementation**:

```c
// T Flip-Flop (simplified JK with J=K=T)
typedef struct {
    int Q;
    int prev_clk;
} t_flipflop;

void t_flipflop_update(t_flipflop *ff, int T, int CLK) {
    int rising_edge = (CLK == 1) && (ff->prev_clk == 0);

    if (rising_edge && T == 1) {
        ff->Q = !ff->Q;
    }

    ff->prev_clk = CLK;
}

// Example: Frequency divider
void demo_frequency_divider() {
    t_flipflop ff = {0, 0};

    printf("Frequency Divider:\n");
    for (int i = 0; i < 8; i++) {
        t_flipflop_update(&ff, 1, 0);
        t_flipflop_update(&ff, 1, 1);
        printf("Clock %d: Q=%d\n", i, ff.Q);
    }
    // Q changes at half clock frequency (divide by 2)
}
```

**Applications**:

- **Frequency Division**: T=1 creates divide-by-2 counter
- **Counters**: Building block for binary counters
- **Timers**: Generate slower clock frequencies

## Clock and Synchronization

**What**: The clock signal synchronizes all flip-flops in a digital system.

**Why Critical**:

- **Synchronization**: All flip-flops respond together
- **Deterministic**: Predictable system behavior
- **Timing**: Enables timing analysis and optimization
- **Performance**: Clock frequency determines system speed

**Clock Domains**:

```c
// Different clock domains in a system
typedef struct {
    double cpu_clk_mhz;      // CPU clock (e.g., 2400 MHz)
    double bus_clk_mhz;      // Bus clock (e.g., 800 MHz)
    double peripheral_clk_mhz; // Peripheral clock (e.g., 100 MHz)
} system_clocks;

// Example: RK3588 clock domains
system_clocks rk3588 = {
    .cpu_clk_mhz = 2400,      // Cortex-A76 @ 2.4 GHz
    .bus_clk_mhz = 800,       // System bus
    .peripheral_clk_mhz = 100  // I/O peripherals
};

void setup_clock_domains() {
    printf("RK3588 Clock Configuration:\n");
    printf("CPU: %.1f MHz\n", rk3588.cpu_clk_mhz);
    printf("Bus: %.1f MHz\n", rk3588.bus_clk_mhz);
    printf("Periph: %.1f MHz\n", rk3588.peripheral_clk_mhz);
}
```

**Clock Distribution**:

- Clock tree distributes clock to all flip-flops
- Clock skew causes timing issues
- Modern chips use sophisticated clock networks

## ARM64 Context

**What**: ARM64 processors use D flip-flops extensively for registers and pipeline stages.

**Flip-Flops in Cortex-A76**:

```c
// Estimated flip-flop usage in Cortex-A76 core
typedef struct {
    long register_file_ffs;      // Register file: ~2,000
    long pipeline_registers;     // Pipeline stages: ~50,000
    long cache_ffs;              // Cache tags/data: ~5,000,000
    long control_logic_ffs;      // Control unit: ~100,000
    long total_per_core;
} core_flipflops;

void estimate_cortex_a76_ffs() {
    core_flipflops a76 = {
        .register_file_ffs = 2000,        // 31 × 64-bit regs
        .pipeline_registers = 50000,      // Pipeline latches
        .cache_ffs = 5000000,             // L1 I/D caches
        .control_logic_ffs = 100000,      // Branch predictor, etc.
    };

    a76.total_per_core = a76.register_file_ffs +
                        a76.pipeline_registers +
                        a76.cache_ffs +
                        a76.control_logic_ffs;

    printf("Cortex-A76 Flip-Flop Estimate:\n");
    printf("Per core: ~%ld million\n", a76.total_per_core / 1000000);

    // RK3588: 4 × A76 + 4 × A55
    long total_soc = (a76.total_per_core * 4) + (a76.total_per_core * 4 / 2);
    printf("RK3588 SoC total: ~%ld billion\n", total_soc / 1000000000);
}
```

**Practical ARM64 Example**:

```c
// ARM64 register update (simplified)
void arm64_register_update_example() {
    uint64_t x0 = 0x123456789ABCDEF0;
    uint64_t x1 = 0x0FEDCBA987654321;

    // Operation: X2 = X0 + X1
    // In real ARM64:
    // 1. D flip-flops hold X0 and X1 values
    // 2. Clock edge triggers ALU to add them
    // 3. Result goes to X2 flip-flops on next clock edge

    uint64_t x2 = x0 + x1;  // Result stored in flip-flops

    printf("X0 = 0x%016lX\n", x0);
    printf("X1 = 0x%016lX\n", x1);
    printf("X2 = 0x%016lX\n", x2);

    // All register operations use D flip-flops!
}
```

## Key Takeaways

**What** you've learned:

1. **Latches**: Level-sensitive memory (old designs)
2. **Flip-Flops**: Edge-triggered memory (modern standard)
3. **D Flip-Flop**: Most common, captures data on clock edge
4. **JK Flip-Flop**: More versatile, can set/reset/hold/toggle
5. **T Flip-Flop**: Toggle-only flip-flop for counters
6. **Timing**: Setup/hold times critical for correct operation

**Why** they matter:

- **Foundation**: All sequential circuits built from these
- **Synchronization**: Enable clocked digital systems
- **Registers**: Processor registers use flip-flops
- **Performance**: Flip-flop timing limits processor speed
- **Memory**: RAM cells based on flip-flop concepts

**When** to use:

- **State Storage**: Need to remember binary state
- **Data Sampling**: Capture data at specific times
- **Counters/Timers**: Implement counting logic
- **State Machines**: Control unit design
- **Registers**: Building multi-bit storage

**Where** they're used:

- **Every processor**: ARM64, x86, all CPUs
- **Memory systems**: RAM, cache, registers
- **Digital systems**: All clocked digital logic
- **Rock 5B+**: Billions in RK3588 SoC

## Next Steps

After mastering latches and flip-flops, continue to:

1. **Registers**: Combine flip-flops to create multi-bit registers
2. **Counters**: Use flip-flops to build counting circuits
3. **Memory Basics**: Understand RAM/ROM cell structures
4. **Assembly**: See how ARM64 uses these concepts
5. **Hardware**: Explore FPGA flip-flop implementation

Continue with **"Registers"** to learn how multiple flip-flops work together to store data in processors.

Happy learning! 🚀
