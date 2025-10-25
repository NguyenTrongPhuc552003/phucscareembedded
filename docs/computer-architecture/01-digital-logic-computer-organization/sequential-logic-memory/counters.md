---
sidebar_position: 3
---

# Counters

Master counter circuits that generate sequential state sequences for counting, timing, and addressing in digital systems. Understand how counters enable program execution, timing, and sequential control in ARM64 processors.

## What are Counters?

**What**: Counters are sequential circuits that cycle through a predictable sequence of states, typically counting in binary. They're implemented using flip-flops connected in specific ways.

**Why**: Counters are critical because:

- **Program Counters**: Track instruction addresses in ARM64 CPU
- **Timers**: Generate periodic interrupts and delays
- **Addressing**: Create sequential memory addresses
- **Frequency Division**: Generate slower clock frequencies
- **Event Counting**: Count occurrences of events
- **State Machines**: Build complex control sequences

**When**: Use counters when:

- **Counting Events**: Track number of occurrences
- **Timing Control**: Generate delays or periodic interrupts
- **Address Generation**: Create sequential addresses for memory
- **Frequency Scaling**: Divide high-speed clocks
- **Loop Control**: Track loop iterations

**Where**: Found in:

- **All processors**: Program counters in every CPU
- **Timers**: Hardware timers in Rock 5B+ RK3588
- **Memory systems**: Address generators
- **Peripherals**: UART, PWM, event counters
- **Control logic**: State machine implementations

## Asynchronous (Ripple) Counters

**What**: Asynchronous counters use the output of one flip-flop to clock the next, creating a "ripple" effect. Simple but have propagation delay issues.

**How**: Each flip-flop is clocked by the output of the previous flip-flop, so transitions don't happen simultaneously.

**Implementation**:

```c
// 4-bit Asynchronous Binary Counter
typedef struct {
    int bit[4];  // 4 T flip-flops (Q0-Q3)
} ripple_counter;

void ripple_counter_init(ripple_counter *cnt) {
    for (int i = 0; i < 4; i++) {
        cnt->bit[i] = 0;
    }
}

int ripple_counter_read(ripple_counter *cnt) {
    return cnt->bit[0] + (cnt->bit[1] << 1) +
           (cnt->bit[2] << 2) + (cnt->bit[3] << 3);
}

void ripple_counter_clock(ripple_counter *cnt) {
    // Toggle bit 0 on every clock
    cnt->bit[0] = !cnt->bit[0];

    // Bit 1 toggles when bit 0 goes from 1 to 0
    static int prev_bit0 = 0;
    if (prev_bit0 == 1 && cnt->bit[0] == 0) {
        cnt->bit[1] = !cnt->bit[1];
    }
    prev_bit0 = cnt->bit[0];

    // Bit 2 toggles when bit 1 goes from 1 to 0
    static int prev_bit1 = 0;
    if (prev_bit1 == 1 && cnt->bit[1] == 0) {
        cnt->bit[2] = !cnt->bit[2];
    }
    prev_bit1 = cnt->bit[1];

    // Bit 3 toggles when bit 2 goes from 1 to 0
    static int prev_bit2 = 0;
    if (prev_bit2 == 1 && cnt->bit[2] == 0) {
        cnt->bit[3] = !cnt->bit[3];
    }
    prev_bit2 = cnt->bit[2];
}

// Example: Count 0-15 repeatedly
void demo_ripple_counter() {
    ripple_counter cnt;
    ripple_counter_init(&cnt);

    printf("4-bit Ripple Counter:\n");
    for (int i = 0; i < 20; i++) {
        printf("Clock %d: Count = %d\n", i, ripple_counter_read(&cnt));
        ripple_counter_clock(&cnt);
    }
    // Output: 0, 1, 2, ... 15, 0, 1, ...
}
```

**Characteristics**:

- **Simple Design**: Easy to implement with T flip-flops
- **Propagation Delay**: Each bit changes after previous bit (ripple effect)
- **Glitchy**: Temporary invalid states during counting
- **Slower**: Cannot run as fast as synchronous counters
- **Application**: Used in non-critical paths, frequency dividers

**Problem**: The ripple delay limits maximum clock frequency. For n bits, total delay = n × t_pd (propagation delay per bit).

## Synchronous Counters

**What**: Synchronous counters clock all flip-flops simultaneously with a common clock signal, eliminating ripple delays.

**Why**: Synchronous design is faster and glitch-free compared to ripple counters.

**Implementation**:

```c
// 4-bit Synchronous Binary Counter
typedef struct {
    int count;
    int prev_clk;
} sync_counter_4bit;

void sync_counter_init(sync_counter_4bit *cnt) {
    cnt->count = 0;
    cnt->prev_clk = 0;
}

void sync_counter_clock(sync_counter_4bit *cnt, int CLK) {
    int rising_edge = (CLK == 1 && cnt->prev_clk == 0);

    if (rising_edge) {
        cnt->count = (cnt->count + 1) & 0x0F;  // Increment, wrap at 15
    }

    cnt->prev_clk = CLK;
}

// Example: Synchronous counting
void demo_sync_counter() {
    sync_counter_4bit cnt;
    sync_counter_init(&cnt);

    printf("4-bit Sync Counter:\n");
    for (int i = 0; i < 20; i++) {
        printf("Clock %d: Count = %d\n", i, cnt.count);
        sync_counter_clock(&cnt, (i % 2));  // Simulate clock
    }
}
```

**Advantages**:

- **No Ripple Delay**: All bits change simultaneously
- **Faster**: Can operate at higher frequencies
- **Glitch-Free**: No intermediate invalid states
- **Predictable**: Reliable timing behavior
- **Standard**: Used in modern processor design

**Where**: All ARM64 internal counters use synchronous design.

## Up/Down Counters

**What**: Counters that can count up or down based on a control signal.

**Implementation**:

```c
// 4-bit Up/Down Counter
typedef struct {
    int count;
    int prev_clk;
} updown_counter;

void updown_counter_init(updown_counter *cnt) {
    cnt->count = 0;
    cnt->prev_clk = 0;
}

void updown_counter_clock(updown_counter *cnt, int CLK, int up) {
    int rising_edge = (CLK == 1 && cnt->prev_clk == 0);

    if (rising_edge) {
        if (up) {
            cnt->count = (cnt->count + 1) & 0x0F;  // Count up
        } else {
            cnt->count = (cnt->count - 1) & 0x0F;  // Count down (wraps)
        }
    }

    cnt->prev_clk = CLK;
}

// Example: Reversible counter
void demo_updown_counter() {
    updown_counter cnt;
    updown_counter_init(&cnt);

    printf("Up/Down Counter:\n");

    // Count up
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\n", cnt.count);
        updown_counter_clock(&cnt, 1, 1);  // Up
    }

    // Count down
    for (int i = 0; i < 5; i++) {
        printf("Count: %d\n", cnt.count);
        updown_counter_clock(&cnt, 1, 0);  // Down
    }
}
```

**Applications**:

- **Stack Pointer**: Increment/decrement for stack operations
- **Loop Control**: Count iterations up or down
- **Address Generation**: Sequential or reverse access
- **Timer Modes**: Up-counting or down-counting timers

## Modulo-N Counters

**What**: Counters that count from 0 to (N-1) and then wrap around to 0.

**Implementation**:

```c
// Modulo-N Counter
typedef struct {
    int count;
    int mod;  // Modulo value
    int prev_clk;
} modulo_counter;

void modulo_counter_init(modulo_counter *cnt, int mod) {
    cnt->count = 0;
    cnt->mod = mod;
    cnt->prev_clk = 0;
}

void modulo_counter_clock(modulo_counter *cnt, int CLK) {
    int rising_edge = (CLK == 1 && cnt->prev_clk == 0);

    if (rising_edge) {
        cnt->count = (cnt->count + 1) % cnt->mod;
    }

    cnt->prev_clk = CLK;
}

// Example: Different modulo values
void demo_modulo_counters() {
    printf("Modulo-N Counters:\n\n");

    // Modulo-10 (BCD decade counter)
    modulo_counter mod10;
    modulo_counter_init(&mod10, 10);
    printf("Modulo-10 (0-9):\n");
    for (int i = 0; i < 12; i++) {
        printf("%d ", mod10.count);
        modulo_counter_clock(&mod10, 1);
    }
    printf("\n\n");

    // Modulo-60 (seconds/minutes)
    modulo_counter mod60;
    modulo_counter_init(&mod60, 60);
    printf("Modulo-60 (0-59):\n");
    for (int i = 0; i < 12; i++) {
        printf("%d ", mod60.count);
        modulo_counter_clock(&mod60, 1);
    }
    printf("\n");
}
```

**Applications**:

- **Time of Day**: Hours (0-23), minutes (0-59), seconds (0-59)
- **BCD Counters**: Decimal digit counting (0-9)
- **Arbitrary Sequences**: Any repeating sequence
- **Hardware Timers**: Generate periodic events

## Ring Counters and Johnson Counters

**What**: Shift-register based counters that cycle through specific states.

### Ring Counter

**What**: A shift register where the output of the last stage feeds back to the first stage, creating a single "1" that circulates.

**Implementation**:

```c
// 4-bit Ring Counter
typedef struct {
    int bits[4];
    int prev_clk;
} ring_counter;

void ring_counter_init(ring_counter *cnt) {
    cnt->bits[0] = 1;  // Start with bit 0 = 1
    cnt->bits[1] = 0;
    cnt->bits[2] = 0;
    cnt->bits[3] = 0;
    cnt->prev_clk = 0;
}

void ring_counter_clock(ring_counter *cnt, int CLK) {
    int rising_edge = (CLK == 1 && cnt->prev_clk == 0);

    if (rising_edge) {
        // Shift right, with wrap-around
        int last_bit = cnt->bits[3];
        cnt->bits[3] = cnt->bits[2];
        cnt->bits[2] = cnt->bits[1];
        cnt->bits[1] = cnt->bits[0];
        cnt->bits[0] = last_bit;  // Wrap around
    }

    cnt->prev_clk = CLK;
}

void ring_counter_print(ring_counter *cnt) {
    printf("%d%d%d%d\n", cnt->bits[3], cnt->bits[2], cnt->bits[1], cnt->bits[0]);
}

// Example: Ring counter state sequence
void demo_ring_counter() {
    ring_counter cnt;
    ring_counter_init(&cnt);

    printf("Ring Counter (4 states):\n");
    for (int i = 0; i < 6; i++) {
        printf("State %d: ", i);
        ring_counter_print(&cnt);
        ring_counter_clock(&cnt, (i % 2));
    }
    // Output: 0001, 0010, 0100, 1000, 0001, ...
}
```

**Applications**: Use one-hot encoding for state machines.

### Johnson Counter (Twisted Ring Counter)

**What**: A shift register with inverted feedback, generating more states than ring counter.

**Implementation**:

```c
// 4-bit Johnson Counter
typedef struct {
    int bits[4];
    int prev_clk;
} johnson_counter;

void johnson_counter_init(johnson_counter *cnt) {
    for (int i = 0; i < 4; i++) {
        cnt->bits[i] = 0;
    }
    cnt->prev_clk = 0;
}

void johnson_counter_clock(johnson_counter *cnt, int CLK) {
    int rising_edge = (CLK == 1 && cnt->prev_clk == 0);

    if (rising_edge) {
        // Shift right, with inverted wrap-around
        int last_bit = !cnt->bits[3];  // Inverted feedback
        cnt->bits[3] = cnt->bits[2];
        cnt->bits[2] = cnt->bits[1];
        cnt->bits[1] = cnt->bits[0];
        cnt->bits[0] = last_bit;
    }

    cnt->prev_clk = CLK;
}

void johnson_counter_print(johnson_counter *cnt) {
    printf("%d%d%d%d\n", cnt->bits[3], cnt->bits[2], cnt->bits[1], cnt->bits[0]);
}

// Example: Johnson counter sequence
void demo_johnson_counter() {
    johnson_counter cnt;
    johnson_counter_init(&cnt);

    printf("Johnson Counter (8 states):\n");
    for (int i = 0; i < 10; i++) {
        printf("State %d: ", i);
        johnson_counter_print(&cnt);
        johnson_counter_clock(&cnt, (i % 2));
    }
    // Output: 0000, 0001, 0011, 0111, 1111, 1110, 1100, 1000, 0000, ...
}
```

**Applications**: Sequence generation and timing control.

## ARM64 Program Counter

**What**: The Program Counter (PC) is a 64-bit counter in ARM64 that holds the address of the current instruction.

**Implementation**:

```c
// ARM64 Program Counter (simplified model)
typedef struct {
    uint64_t PC;  // Program Counter (64-bit)
} arm64_program_counter;

void pc_init(arm64_program_counter *pc, uint64_t start_addr) {
    pc->PC = start_addr;
}

void pc_increment(arm64_program_counter *pc) {
    pc->PC += 4;  // ARM64 instructions are 4 bytes
}

void pc_branch(arm64_program_counter *pc, int64_t offset) {
    pc->PC += offset;  // Relative branch
}

void pc_jump(arm64_program_counter *pc, uint64_t target) {
    pc->PC = target;  // Absolute jump
}

// Example: Program counter simulation
void demo_program_counter() {
    arm64_program_counter pc;
    pc_init(&pc, 0x1000);

    printf("ARM64 Program Counter Demo:\n");
    printf("Initial PC: 0x%016lX\n", pc.PC);

    // Sequential instructions (each adds 4)
    for (int i = 0; i < 3; i++) {
        pc_increment(&pc);
        printf("After instr %d: PC = 0x%016lX\n", i+1, pc.PC);
    }

    // Branch forward by 8 bytes
    pc_branch(&pc, 8);
    printf("After branch +8: PC = 0x%016lX\n", pc.PC);

    // Jump to absolute address
    pc_jump(&pc, 0x2000);
    printf("After jump: PC = 0x%016lX\n", pc.PC);
}
```

**Real Implementation**: In ARM64 Cortex-A76, the PC is implemented as a synchronous counter that:

- Increments by 4 (instruction size) each cycle
- Handles branch prediction
- Manages instruction prefetching
- Operates at 2.4 GHz clock

## Performance Counters

**What**: Hardware counters in ARM64 that track various performance events.

**Implementation**:

```c
// ARM64 Performance Monitoring Unit (simplified)
typedef struct {
    uint64_t cycle_count;          // CPU cycles
    uint64_t instruction_count;    // Instructions retired
    uint64_t cache_miss_count;     // L1 cache misses
    uint64_t branch_miss_count;    // Branch mispredictions
} arm64_perf_counters;

void perf_counter_init(arm64_perf_counters *pmu) {
    pmu->cycle_count = 0;
    pmu->instruction_count = 0;
    pmu->cache_miss_count = 0;
    pmu->branch_miss_count = 0;
}

void perf_counter_update(arm64_perf_counters *pmu,
                         int inst_retired, int cache_miss, int branch_miss) {
    pmu->cycle_count++;  // Increment every cycle

    if (inst_retired) {
        pmu->instruction_count++;
    }

    if (cache_miss) {
        pmu->cache_miss_count++;
    }

    if (branch_miss) {
        pmu->branch_miss_count++;
    }
}

// Example: Performance analysis
void demo_performance_counters() {
    arm64_perf_counters pmu;
    perf_counter_init(&pmu);

    // Simulate 1000 cycles of execution
    for (int i = 0; i < 1000; i++) {
        int inst_ret = (i % 2 == 0) ? 1 : 0;  // 50% IPC
        int cache_miss = (i % 100 == 0) ? 1 : 0;
        int branch_miss = (i % 50 == 0) ? 1 : 0;

        perf_counter_update(&pmu, inst_ret, cache_miss, branch_miss);
    }

    double ipc = (double)pmu.instruction_count / pmu.cycle_count;

    printf("Performance Metrics:\n");
    printf("Cycles: %lu\n", pmu.cycle_count);
    printf("Instructions: %lu\n", pmu.instruction_count);
    printf("IPC: %.2f\n", ipc);
    printf("Cache misses: %lu\n", pmu.cache_miss_count);
    printf("Branch misses: %lu\n", pmu.branch_miss_count);
}
```

**Real Hardware**: ARM64 PMU has multiple counters (typically 6-8) that can be programmed to count specific events.

## Rock 5B+ Timer Examples

**What**: RK3588 SoC has multiple hardware timers implemented as counters.

**Implementation**:

```c
// System Timer (free-running counter)
typedef struct {
    uint64_t counter;       // Current count
    uint64_t compare;       // Compare value for interrupt
    int interrupt_pending;  // Interrupt flag
} system_timer;

void timer_init(system_timer *timer, uint64_t compare_val) {
    timer->counter = 0;
    timer->compare = compare_val;
    timer->interrupt_pending = 0;
}

void timer_tick(system_timer *timer, int CLK) {
    static int prev_clk = 0;
    int rising_edge = (CLK == 1 && prev_clk == 0);

    if (rising_edge) {
        timer->counter++;

        // Check for match
        if (timer->counter == timer->compare) {
            timer->interrupt_pending = 1;
        }
    }

    prev_clk = CLK;
}

// Example: 1ms timer interrupt at 1 GHz
void demo_system_timer() {
    system_timer timer;
    timer_init(&timer, 1000000);  // 1,000,000 cycles = 1ms at 1GHz

    printf("System Timer Demo (1ms interrupt):\n");

    for (uint64_t clk = 0; clk < 3000000; clk++) {
        timer_tick(&timer, clk % 2);

        if (timer.interrupt_pending) {
            printf("Interrupt at %lu cycles (%.3f ms)\n",
                   timer.counter, timer.counter / 1000000.0);
            timer.interrupt_pending = 0;
        }
    }
}
```

**Real Timers**: RK3588 has multiple timer blocks (Timer0-Timer7) for different purposes.

## Key Takeaways

**What** you've learned:

1. **Asynchronous Counters**: Ripple counters (simple but slow)
2. **Synchronous Counters**: All flip-flops clocked together (fast)
3. **Up/Down Counters**: Bidirectional counting
4. **Modulo-N Counters**: Count from 0 to N-1
5. **Ring/Johnson Counters**: Shift-register based
6. **PC and Timers**: ARM64 applications

**Why** they matter:

- **Execution Control**: PC tracks program flow
- **Timing**: Hardware timers for scheduling
- **Performance**: PMU counters for profiling
- **Addressing**: Generate sequential addresses
- **State Machines**: Build complex control logic

**When** to use:

- **Timing**: Generate delays and periodic events
- **Addressing**: Sequential memory access
- **Counting**: Track iterations or events
- **Frequency Division**: Generate lower clock frequencies
- **Control**: Implement state machines

**Where** they're used:

- **All processors**: PC in every CPU
- **System timers**: Hardware timing in RK3588
- **Performance analysis**: PMU counters
- **Peripherals**: Event counters in UART, SPI
- **Control logic**: State machine implementations

## Next Steps

After mastering counters, continue to:

1. **Memory Basics**: Understand RAM/ROM cell structures
2. **Computer Organization**: See how counters fit into systems
3. **Assembly Programming**: Use program counter in code
4. **Performance Tuning**: Profile with PMU counters
5. **Hardware Design**: Implement custom counters in FPGAs

Continue with **"Memory Basics"** to learn how data is stored in RAM and cache.

Happy learning! 🚀
