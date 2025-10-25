---
sidebar_position: 4
---

# Memory Basics

Master the fundamental memory cell structures that store data in digital systems. Understand RAM and ROM implementations, timing characteristics, and how memory systems work in ARM64 processors like RK3588.

## What is Computer Memory?

**What**: Computer memory consists of storage elements (memory cells) that hold binary data. Memory systems enable data and instruction storage in digital computers.

**Why**: Memory is fundamental because:

- **Program Storage**: Holds instructions to execute
- **Data Storage**: Stores variables and results
- **Temporary Data**: Buffers and caches for performance
- **System State**: Stores configuration and status
- **Execution Support**: Enables stored-program computers

**Classification**:

- **RAM (Random Access Memory)**: Volatile, read/write
- **ROM (Read-Only Memory)**: Non-volatile, typically read-only
- **Speed**: Cache (fast) → Main Memory → Storage (slow)
- **Volatility**: Volatile (lost on power-off) vs. non-volatile (persists)

**Where**: Found in:

- **All processors**: Cache and memory in ARM64 systems
- **Rock 5B+**: RK3588 has L1/L2/L3 cache + main memory
- **Storage**: Flash, eMMC, SD cards
- **Embedded**: On-chip SRAM, ROM

## RAM vs ROM

### RAM (Random Access Memory)

**What**: Random access, read/write, volatile memory.

**Types**:

- **SRAM**: Static RAM, fast but expensive
- **DRAM**: Dynamic RAM, slower but cheaper
- **Volatile**: Data lost when power removed

**Characteristics**:

- **Fast**: Modern DRAM can access in tens of nanoseconds
- **Temporary**: Holds working data and code
- **Read/Write**: Can modify contents
- **Large Capacity**: Main memory (GBs)

**Applications**:

- Main system memory (LPDDR4/LPDDR5 in RK3588)
- CPU cache (SRAM)
- Register files
- Working buffers

### ROM (Read-Only Memory)

**What**: Non-volatile, traditionally read-only memory.

**Types**:

- **Mask ROM**: Factory programmed
- **PROM**: Programmable once
- **EPROM**: Erasable with UV light
- **EEPROM**: Electrically erasable
- **Flash**: Modern non-volatile memory

**Characteristics**:

- **Non-Volatile**: Retains data without power
- **Durable**: Can last decades
- **Slower**: Typically slower than RAM
- **Limited Writes**: Flash has write cycle limits

**Applications**:

- Boot firmware (U-Boot, BIOS)
- Stored programs (embedded systems)
- Configuration data
- Firmware storage

## SRAM (Static RAM) Cell

**What**: SRAM uses flip-flops for storage. No refresh needed, fast but uses 6 transistors per bit.

### 6T SRAM Cell

**Structure**: Uses 6 transistors in a cross-coupled inverter configuration.

**How it Works**:

```c
// Conceptual 6T SRAM cell structure
typedef struct {
    int Q;      // Stored bit
    int Q_bar;  // Inverted stored bit
} sram_cell;

// Write operation
void sram_cell_write(sram_cell *cell, int bit, int write_enable) {
    if (write_enable) {
        cell->Q = bit;           // Force Q to desired value
        cell->Q_bar = !bit;      // Force Q_bar to opposite
    }
    // Once written, cell holds value (static, no refresh needed)
}

// Read operation
int sram_cell_read(sram_cell *cell, int read_enable) {
    if (read_enable) {
        return cell->Q;  // Output stored value
    }
    return -1;  // Disabled
}

// Example: 8-bit SRAM array
typedef struct {
    sram_cell cells[8];
} sram_8bit;

void sram_8bit_write(sram_8bit *sram, int address, uint8_t data) {
    for (int i = 0; i < 8; i++) {
        int bit = (data >> i) & 1;
        sram_cell_write(&sram->cells[i], bit, 1);
    }
}

uint8_t sram_8bit_read(sram_8bit *sram, int address) {
    uint8_t data = 0;
    for (int i = 0; i < 8; i++) {
        int bit = sram_cell_read(&sram->cells[i], 1);
        data |= (bit << i);
    }
    return data;
}
```

**Characteristics**:

- **Fast**: Access time ~1-2 ns
- **No Refresh**: Holds data as long as powered
- **Expensive**: 6 transistors per bit
- **Low Density**: Larger cell size than DRAM
- **Power**: Leakage current when idle

**Where Used**:

- CPU cache (L1, L2, sometimes L3)
- Register files
- Small on-chip RAM
- FPGA block RAM

**RK3588 Example**: L1 I/D caches (~48KB each) use SRAM technology.

## DRAM (Dynamic RAM) Cell

**What**: DRAM uses a capacitor to store charge (1 bit = 1 capacitor). Simpler structure than SRAM but requires refresh.

### 1T1C DRAM Cell

**Structure**: 1 transistor + 1 capacitor per bit.

**How it Works**:

```c
// Conceptual DRAM cell structure
typedef struct {
    int charge;          // Capacitor charge (0 or 1)
    int refresh_counter; // When to refresh
} dram_cell;

// Read operation
int dram_cell_read(dram_cell *cell, int read_enable) {
    if (read_enable) {
        int value = cell->charge;
        // Reading destroys the charge, so we need to restore it
        cell->charge = value;  // Restore (refresh on read)
        return value;
    }
    return -1;
}

// Write operation
void dram_cell_write(dram_cell *cell, int bit, int write_enable) {
    if (write_enable) {
        cell->charge = bit;
    }
}

// DRAM needs periodic refresh due to charge leakage
void dram_cell_refresh(dram_cell *cell) {
    // Simulate charge decay
    if (cell->charge == 1) {
        cell->refresh_counter++;
        // If too long without refresh, bit becomes uncertain
        if (cell->refresh_counter > 64) {  // Typical: refresh every 64ms
            printf("WARNING: DRAM cell may have lost charge\n");
        }
    }
}

// Example: DRAM with refresh management
typedef struct {
    dram_cell cells[8];
    int refresh_timer;
} dram_8bit;

void dram_8bit_write(dram_8bit *dram, int address, uint8_t data) {
    for (int i = 0; i < 8; i++) {
        int bit = (data >> i) & 1;
        dram_cell_write(&dram->cells[i], bit, 1);
        dram->cells[i].refresh_counter = 0;
    }
}

uint8_t dram_8bit_read(dram_8bit *dram, int address) {
    uint8_t data = 0;
    for (int i = 0; i < 8; i++) {
        int bit = dram_cell_read(&dram->cells[i], 1);
        data |= (bit << i);
    }
    return data;
}

// Periodic refresh operation
void dram_8bit_refresh(dram_8bit *dram) {
    for (int i = 0; i < 8; i++) {
        dram_cell_refresh(&dram->cells[i]);
    }
    dram->refresh_timer = 0;  // Reset refresh timer
}
```

**Characteristics**:

- **Cheap**: 1 transistor + 1 capacitor per bit
- **High Density**: Small cell size
- **Refresh Required**: Charge leaks away, must refresh every ~64ms
- **Slower**: ~15-20 ns access time (main memory)
- **Sense Amplifiers**: Needed to detect weak charge

**Refresh Operation**:

```c
// DRAM refresh controller (simplified)
typedef struct {
    int refresh_counter;
    int refresh_interval;  // Refresh every N cycles
} dram_refresh_controller;

void dram_refresh_cycle(dram_refresh_controller *controller,
                       dram_8bit *dram) {
    controller->refresh_counter++;

    if (controller->refresh_counter >= controller->refresh_interval) {
        dram_8bit_refresh(dram);  // Refresh all cells
        controller->refresh_counter = 0;
        printf("DRAM refresh cycle executed\n");
    }
}
```

**Refresh Overhead**: DDR4 typically requires ~8% of bandwidth for refresh.

**Where Used**:

- Main system memory (DDR4, LPDDR5 in RK3588)
- Graphics memory (GDDR6)
- Any large memory capacity

## Memory Timing Parameters

**What**: Timing parameters specify memory access characteristics and speed.

### Key Timing Parameters

```c
// Memory timing parameters
typedef struct {
    double tRCD_ns;      // Row Column Delay (RAS to CAS delay)
    double tCAS_ns;      // Column Address Strobe latency
    double tRP_ns;       // Row Precharge time
    double tRAS_ns;      // Row Active time
    double cycle_time_ns; // Clock cycle time
} memory_timing;

// Example: LPDDR5-6400 timing (approximate)
memory_timing lpddr5_6400 = {
    .tRCD_ns = 18.0,        // 18 ns
    .tCAS_ns = 22.0,        // CAS latency: 22 ns
    .tRP_ns = 21.0,         // 21 ns
    .tRAS_ns = 43.0,        // 43 ns
    .cycle_time_ns = 0.625  // 1.6 GHz (DDR)
};

// Calculate total read latency
double calculate_read_latency(memory_timing *timing) {
    // Typical READ: Activate row + CAS latency
    return timing->tRCD_ns + timing->tCAS_ns;
}

// Example: Memory access sequence
void demonstrate_memory_access() {
    memory_timing *timing = &lpddr5_6400;

    printf("Memory Access Timing:\n");
    printf("tRCD (RAS to CAS): %.1f ns\n", timing->tRCD_ns);
    printf("tCAS (Column Access): %.1f ns\n", timing->tCAS_ns);
    printf("Total Read Latency: %.1f ns\n",
           calculate_read_latency(timing));

    // For 1.6 GHz (6400 MT/s):
    printf("\nIn clock cycles (1.6 GHz):\n");
    printf("tRCD: %.1f cycles\n", timing->tRCD_ns / timing->cycle_time_ns);
    printf("tCAS: %.1f cycles\n", timing->tCAS_ns / timing->cycle_time_ns);
}
```

**Explanation**:

- **tRCD**: Time from row activation to column access
- **tCAS**: Time from column select to data available
- **tRP**: Time to close/precharge a row
- **tRAS**: Minimum time row must be active

**Access Sequence**:

1. Row activation: tRCD
2. Column access: tCAS
3. Data transfer: Burst length × cycle_time
4. Precharge: tRP

## RK3588 Memory System

**What**: Rock 5B+ uses RK3588 SoC with sophisticated memory hierarchy.

### RK3588 Memory Configuration

```c
// RK3588 Memory Hierarchy
typedef struct {
    // Level 1 Cache (per core)
    struct {
        int icache_size_kb;    // Instruction cache
        int dcache_size_kb;    // Data cache
        int latency_cycles;    // Access latency
    } l1_cache;

    // Level 2 Cache (per cluster)
    struct {
        int size_kb;           // L2 size
        int latency_cycles;
    } l2_cache;

    // Level 3 Cache (shared)
    struct {
        int size_mb;           // L3 size
        int latency_cycles;
    } l3_cache;

    // Main Memory
    struct {
        char type[20];         // LPDDR4/LPDDR5
        int frequency_mhz;     // Clock frequency
        int capacity_gb;       // Total capacity
    } main_memory;
} rk3588_memory;

// Example: RK3588 memory configuration
void show_rk3588_memory() {
    rk3588_memory rk3588 = {
        .l1_cache = {48, 48, 3},      // 48KB I/D, 3 cycle latency
        .l2_cache = {512, 12},        // 512KB, 12 cycle latency
        .l3_cache = {2, 30},          // 2MB shared, 30 cycle latency
        .main_memory = {"LPDDR4", 3200, 8}  // 8GB LPDDR4
    };

    printf("RK3588 Memory Hierarchy:\n");
    printf("L1 I-cache: %d KB (%d cycles)\n",
           rk3588.l1_cache.icache_size_kb,
           rk3588.l1_cache.latency_cycles);
    printf("L1 D-cache: %d KB (%d cycles)\n",
           rk3588.l1_cache.dcache_size_kb,
           rk3588.l1_cache.latency_cycles);
    printf("L2 Cache: %d KB (%d cycles)\n",
           rk3588.l2_cache.size_kb,
           rk3588.l2_cache.latency_cycles);
    printf("L3 Cache: %d MB (%d cycles)\n",
           rk3588.l3_cache.size_mb,
           rk3588.l3_cache.latency_cycles);
    printf("Main Memory: %s %d MHz, %d GB\n",
           rk3588.main_memory.type,
           rk3588.main_memory.frequency_mhz,
           rk3588.main_memory.capacity_gb);
}
```

### Memory Access Paths

```c
// Example: Memory access in ARM64
typedef enum {
    HIT_L1,     // Data found in L1 cache
    HIT_L2,     // Data found in L2 cache
    HIT_L3,     // Data found in L3 cache
    MISS_RAM    // Must access main memory
} cache_result;

cache_result access_memory(rk3588_memory *mem, uint64_t address) {
    // Simulate cache hierarchy lookup
    // In real system, hardware checks caches automatically

    // Try L1 cache first (fastest)
    // ... L1 check logic ...
    // if (found in L1) return HIT_L1;

    // Try L2 cache
    // ... L2 check logic ...
    // if (found in L2) return HIT_L2;

    // Try L3 cache
    // ... L3 check logic ...
    // if (found in L3) return HIT_L3;

    // Must access main memory (slowest)
    return MISS_RAM;
}
```

**Performance Impact**:

- **L1 Hit**: ~3 CPU cycles (at 2.4 GHz = ~1.25 ns)
- **L2 Hit**: ~12 cycles (~5 ns)
- **L3 Hit**: ~30 cycles (~12.5 ns)
- **RAM Miss**: ~100+ cycles (~40+ ns)

## Memory Operations

### Read Operation

**Steps**:

1. Address decoding: Select row and column
2. Row activation: Open row (tRCD)
3. Column selection: Read column (tCAS)
4. Data output: Transfer data

```c
// Simplified memory read
uint64_t memory_read(void *memory, uint64_t address) {
    // 1. Decode address to row/column
    int row = (address >> 10) & 0x3FF;   // Extract row bits
    int col = address & 0x3FF;            // Extract column bits

    // 2. Activate row (charge bitlines)
    activate_row(row);
    delay(tRCD_ns);

    // 3. Read column (sense amplifiers detect charge)
    uint64_t data = read_column(col);
    delay(tCAS_ns);

    // 4. Data ready
    return data;
}
```

### Write Operation

**Steps**:

1. Address decoding
2. Row activation
3. Column selection
4. Write drivers force new values
5. Store in cells

```c
// Simplified memory write
void memory_write(void *memory, uint64_t address, uint64_t data) {
    // 1. Decode address
    int row = (address >> 10) & 0x3FF;
    int col = address & 0x3FF;

    // 2. Activate row
    activate_row(row);
    delay(tRCD_ns);

    // 3. Write column (drive bitlines)
    write_column(col, data);
    delay(tCAS_ns);

    // 4. Precharge (close row)
    precharge_row();
    delay(tRP_ns);
}
```

## Key Takeaways

**What** you've learned:

1. **RAM vs ROM**: Volatile vs. non-volatile memory
2. **SRAM**: Fast, 6T cell, no refresh (cache)
3. **DRAM**: Cheap, high density, needs refresh (main memory)
4. **Timing Parameters**: tRCD, tCAS, tRP, tRAS
5. **Memory Hierarchy**: L1 → L2 → L3 → RAM in RK3588

**Why** they matter:

- **Performance**: Cache hierarchy dramatically speeds up access
- **Cost**: DRAM is cheap but slow, SRAM is fast but expensive
- **Design Trade-offs**: Speed vs. density vs. cost
- **System Design**: Understanding memory limits performance
- **Optimization**: Cache-aware programming improves performance

**When** to apply:

- **Performance Tuning**: Understanding cache behavior
- **System Design**: Choosing memory types and sizes
- **Hardware Design**: FPGA memory block configuration
- **Debugging**: Memory access timing issues
- **Optimization**: Cache-friendly data structures

**Where** they're used:

- **Every computer**: Desktop, mobile, server, embedded
- **Rock 5B+**: RK3588 memory hierarchy
- **ARM64 processors**: Cache and memory systems
- **FPGAs**: Block RAM and external memory
- **Performance**: Cache optimization for speed

## Next Steps

After mastering memory basics, continue to:

1. **Computer Organization**: See how memory integrates with CPU
2. **Cache Systems**: Deep dive into cache design
3. **Virtual Memory**: Understanding paging and TLBs
4. **Assembly**: Direct memory access patterns
5. **Performance**: Optimizing memory access

This completes Week 3! Continue with **Week 4: Computer Organization Fundamentals** to learn how all components work together.

Happy learning! 🚀
