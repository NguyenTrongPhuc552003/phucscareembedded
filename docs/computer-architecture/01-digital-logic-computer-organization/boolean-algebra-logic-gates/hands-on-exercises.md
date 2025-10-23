---
sidebar_position: 4
---

# Hands-on Exercises: Boolean Algebra and Logic on Rock 5B+

Apply Boolean algebra, logic gates, and number systems knowledge through practical exercises on the Rock 5B+ platform, implementing real circuits and programs that demonstrate digital logic fundamentals using ARM64 assembly and C.

## What are These Exercises?

**What**: Hands-on practical exercises that transform theoretical knowledge of Boolean algebra and logic gates into working code and hardware experiments on Rock 5B+.

**Why**: Hands-on practice is essential because:

- **Concrete Understanding**: Theory becomes real through practice
- **Muscle Memory**: Repetition builds proficiency
- **Debugging Skills**: Learn by troubleshooting
- **Confidence**: Prove you can actually do it
- **Portfolio**: Build demonstrable projects
- **Problem Solving**: Develop practical skills

**When**: Work through these exercises:

- **After Theory**: Complete Boolean algebra and logic gates lessons first
- **Progressive Order**: Start simple, build complexity
- **Multiple Sessions**: Don't rush, take time to understand
- **Return Later**: Revisit to reinforce learning
- **Before Moving On**: Master basics before advanced topics

**How**: Each exercise includes:

- **Objective**: Clear goal statement
- **Prerequisites**: What you need to know
- **Code Examples**: Complete, working implementations
- **Expected Output**: What success looks like
- **Challenges**: Extensions to deepen learning

**Where**: These exercises run on:

- **Rock 5B+**: Physical hardware (preferred)
- **QEMU**: ARM64 emulation (alternative)
- **Linux**: Ubuntu 22.04+ on Rock 5B+
- **Development Tools**: GCC ARM64, GDB, basic Linux tools

## Exercise 1: Boolean Algebra Calculator

**Objective**: Implement a Boolean algebra calculator that evaluates logical expressions.

**Prerequisites**:
- Basic C programming
- Understanding of Boolean operations (AND, OR, NOT)
- SSH access to Rock 5B+

**Implementation**:

```c
// boolean_calculator.c
// Boolean algebra calculator for Rock 5B+

#include <stdio.h>
#include <stdint.h>
#include <stdlib.h>

// Boolean operations
uint8_t bool_and(uint8_t a, uint8_t b) {
    return a & b;
}

uint8_t bool_or(uint8_t a, uint8_t b) {
    return a | b;
}

uint8_t bool_not(uint8_t a) {
    return ~a;
}

uint8_t bool_xor(uint8_t a, uint8_t b) {
    return a ^ b;
}

uint8_t bool_nand(uint8_t a, uint8_t b) {
    return ~(a & b);
}

uint8_t bool_nor(uint8_t a, uint8_t b) {
    return ~(a | b);
}

uint8_t bool_xnor(uint8_t a, uint8_t b) {
    return ~(a ^ b);
}

// Print binary representation
void print_bits(uint8_t value, int bits) {
    for (int i = bits - 1; i >= 0; i--) {
        printf("%d", (value >> i) & 1);
        if (i % 4 == 0 && i > 0) printf(" ");
    }
}

// Generate truth table for 2-input operation
void truth_table_2input(const char *op_name, 
                       uint8_t (*operation)(uint8_t, uint8_t)) {
    printf("\nTruth Table: %s\n", op_name);
    printf("A | B | %s(A,B)\n", op_name);
    printf("--|---|-------\n");
    
    for (uint8_t a = 0; a <= 1; a++) {
        for (uint8_t b = 0; b <= 1; b++) {
            uint8_t result = operation(a, b);
            printf("%d | %d |   %d\n", a, b, result & 1);
        }
    }
}

// Demonstrate De Morgan's theorems
void verify_demorgans() {
    printf("\n=== Verifying De Morgan's Theorems ===\n");
    
    printf("\nTheorem 1: NOT(A AND B) = NOT(A) OR NOT(B)\n");
    printf("A | B | NOT(A AND B) | NOT(A) OR NOT(B) | Match?\n");
    printf("--|---|--------------|------------------|--------\n");
    
    for (uint8_t a = 0; a <= 1; a++) {
        for (uint8_t b = 0; b <= 1; b++) {
            uint8_t lhs = bool_not(bool_and(a, b)) & 1;
            uint8_t rhs = bool_or(bool_not(a), bool_not(b)) & 1;
            printf("%d | %d |      %d       |        %d         |   %s\n",
                   a, b, lhs, rhs, (lhs == rhs) ? "YES" : "NO");
        }
    }
    
    printf("\nTheorem 2: NOT(A OR B) = NOT(A) AND NOT(B)\n");
    printf("A | B | NOT(A OR B) | NOT(A) AND NOT(B) | Match?\n");
    printf("--|---|-------------|-------------------|--------\n");
    
    for (uint8_t a = 0; a <= 1; a++) {
        for (uint8_t b = 0; b <= 1; b++) {
            uint8_t lhs = bool_not(bool_or(a, b)) & 1;
            uint8_t rhs = bool_and(bool_not(a), bool_not(b)) & 1;
            printf("%d | %d |     %d       |        %d          |   %s\n",
                   a, b, lhs, rhs, (lhs == rhs) ? "YES" : "NO");
        }
    }
}

// Test universal gates
void test_universal_gates() {
    printf("\n=== Universal Gates: Building Gates from NAND ===\n");
    
    // NOT from NAND
    printf("\nNOT from NAND: NOT(A) = NAND(A, A)\n");
    printf("A | NOT(A) | NAND(A,A) | Match?\n");
    printf("--|--------|-----------|--------\n");
    for (uint8_t a = 0; a <= 1; a++) {
        uint8_t not_a = bool_not(a) & 1;
        uint8_t nand_aa = bool_nand(a, a) & 1;
        printf("%d |   %d    |     %d     |   %s\n",
               a, not_a, nand_aa, (not_a == nand_aa) ? "YES" : "NO");
    }
    
    // AND from NAND
    printf("\nAND from NAND: AND(A,B) = NAND(NAND(A,B), NAND(A,B))\n");
    printf("A | B | AND(A,B) | Result | Match?\n");
    printf("--|---|----------|--------|--------\n");
    for (uint8_t a = 0; a <= 1; a++) {
        for (uint8_t b = 0; b <= 1; b++) {
            uint8_t and_ab = bool_and(a, b) & 1;
            uint8_t nand1 = bool_nand(a, b);
            uint8_t nand2 = bool_nand(nand1, nand1) & 1;
            printf("%d | %d |    %d     |   %d    |   %s\n",
                   a, b, and_ab, nand2, (and_ab == nand2) ? "YES" : "NO");
        }
    }
}

int main() {
    printf("====================================\n");
    printf("Boolean Algebra Calculator - Rock 5B+\n");
    printf("====================================\n");
    
    // Generate truth tables
    truth_table_2input("AND", bool_and);
    truth_table_2input("OR", bool_or);
    truth_table_2input("XOR", bool_xor);
    truth_table_2input("NAND", bool_nand);
    truth_table_2input("NOR", bool_nor);
    truth_table_2input("XNOR", bool_xnor);
    
    // Verify De Morgan's theorems
    verify_demorgans();
    
    // Test universal gates
    test_universal_gates();
    
    // Bitwise operations on 8-bit values
    printf("\n=== 8-bit Bitwise Operations ===\n");
    uint8_t a = 0b10101100;  // 172
    uint8_t b = 0b11001010;  // 202
    
    printf("A       = ");
    print_bits(a, 8);
    printf(" (0x%02X, %d)\n", a, a);
    
    printf("B       = ");
    print_bits(b, 8);
    printf(" (0x%02X, %d)\n", b, b);
    
    printf("A AND B = ");
    print_bits(bool_and(a, b), 8);
    printf(" (0x%02X, %d)\n", bool_and(a, b), bool_and(a, b));
    
    printf("A OR B  = ");
    print_bits(bool_or(a, b), 8);
    printf(" (0x%02X, %d)\n", bool_or(a, b), bool_or(a, b));
    
    printf("A XOR B = ");
    print_bits(bool_xor(a, b), 8);
    printf(" (0x%02X, %d)\n", bool_xor(a, b), bool_xor(a, b));
    
    printf("NOT A   = ");
    print_bits(bool_not(a), 8);
    printf(" (0x%02X, %d)\n", bool_not(a), (uint8_t)bool_not(a));
    
    return 0;
}
```

**Build and Run**:
```bash
# On Rock 5B+
gcc -O2 -march=armv8-a -o boolean_calc boolean_calculator.c
./boolean_calc
```

**Expected Output**:
```
====================================
Boolean Algebra Calculator - Rock 5B+
====================================

Truth Table: AND
A | B | AND(A,B)
--|---|-------
0 | 0 |   0
0 | 1 |   0
1 | 0 |   0
1 | 1 |   1
...
```

**Challenges**:
1. Add support for 3-input functions (majority, parity)
2. Implement Karnaugh map simplification
3. Create interactive mode with user input
4. Add timing measurements using ARM64 performance counters

## Exercise 2: GPIO Logic Gate Implementation

**Objective**: Implement physical logic gates using Rock 5B+ GPIO pins.

**Prerequisites**:
- Understanding of logic gates
- GPIO programming basics
- Root access on Rock 5B+
- Optional: LEDs and resistors for visual output

**Hardware Setup**:
```
GPIO 3 (Input A) ────┐
GPIO 5 (Input B) ────┤  Logic Gate   ├──── GPIO 7 (Output)
                     └───────────────┘

For visual feedback:
GPIO 7 ────[220Ω]────LED────GND
```

**Implementation**:

```c
// gpio_logic_gates.c
// Physical logic gate implementation using GPIO

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <fcntl.h>
#include <unistd.h>
#include <sys/mman.h>

// RK3588 GPIO base addresses
#define GPIO0_BASE 0xFD8A0000
#define GPIO1_BASE 0xFEC20000
#define GPIO_SIZE 0x100

// GPIO register offsets
#define GPIO_SWPORT_DR   0x00  // Data register
#define GPIO_SWPORT_DDR  0x04  // Direction register
#define GPIO_EXT_PORT    0x50  // External port (input)

typedef struct {
    volatile uint32_t *base;
    int pin;
} gpio_pin;

// Initialize GPIO pin
int gpio_init(gpio_pin *gpio, uintptr_t base_addr, int pin) {
    int fd = open("/dev/mem", O_RDWR | O_SYNC);
    if (fd < 0) {
        perror("Cannot open /dev/mem");
        return -1;
    }
    
    void *map = mmap(NULL, GPIO_SIZE, PROT_READ | PROT_WRITE,
                    MAP_SHARED, fd, base_addr);
    close(fd);
    
    if (map == MAP_FAILED) {
        perror("mmap failed");
        return -1;
    }
    
    gpio->base = (volatile uint32_t *)map;
    gpio->pin = pin;
    return 0;
}

// Set GPIO direction (0=input, 1=output)
void gpio_set_direction(gpio_pin *gpio, int output) {
    volatile uint32_t *ddr = gpio->base + (GPIO_SWPORT_DDR / 4);
    if (output) {
        *ddr |= (1 << gpio->pin);   // Set as output
    } else {
        *ddr &= ~(1 << gpio->pin);  // Set as input
    }
}

// Write GPIO value
void gpio_write(gpio_pin *gpio, int value) {
    volatile uint32_t *dr = gpio->base + (GPIO_SWPORT_DR / 4);
    if (value) {
        *dr |= (1 << gpio->pin);
    } else {
        *dr &= ~(1 << gpio->pin);
    }
}

// Read GPIO value
int gpio_read(gpio_pin *gpio) {
    volatile uint32_t *ext = gpio->base + (GPIO_EXT_PORT / 4);
    return (*ext >> gpio->pin) & 1;
}

// Implement logic gates using GPIO
int gpio_and_gate(gpio_pin *in_a, gpio_pin *in_b, gpio_pin *out) {
    int a = gpio_read(in_a);
    int b = gpio_read(in_b);
    int result = a & b;
    gpio_write(out, result);
    return result;
}

int gpio_or_gate(gpio_pin *in_a, gpio_pin *in_b, gpio_pin *out) {
    int a = gpio_read(in_a);
    int b = gpio_read(in_b);
    int result = a | b;
    gpio_write(out, result);
    return result;
}

int gpio_xor_gate(gpio_pin *in_a, gpio_pin *in_b, gpio_pin *out) {
    int a = gpio_read(in_a);
    int b = gpio_read(in_b);
    int result = a ^ b;
    gpio_write(out, result);
    return result;
}

int gpio_not_gate(gpio_pin *in_a, gpio_pin *out) {
    int a = gpio_read(in_a);
    int result = !a;
    gpio_write(out, result);
    return result;
}

// Test all gate types
void test_gpio_gates(gpio_pin *in_a, gpio_pin *in_b, gpio_pin *out) {
    printf("\n=== GPIO Logic Gates Test ===\n");
    
    // Test all input combinations
    int test_cases[][2] = {{0, 0}, {0, 1}, {1, 0}, {1, 1}};
    
    printf("\nAND Gate:\n");
    printf("A | B | Output\n");
    printf("--|---|-------\n");
    for (int i = 0; i < 4; i++) {
        gpio_write(in_a, test_cases[i][0]);
        gpio_write(in_b, test_cases[i][1]);
        usleep(1000);  // Small delay for settling
        int result = gpio_and_gate(in_a, in_b, out);
        printf("%d | %d |   %d\n", test_cases[i][0], test_cases[i][1], result);
        usleep(100000);  // 100ms for visual observation
    }
    
    printf("\nOR Gate:\n");
    printf("A | B | Output\n");
    printf("--|---|-------\n");
    for (int i = 0; i < 4; i++) {
        gpio_write(in_a, test_cases[i][0]);
        gpio_write(in_b, test_cases[i][1]);
        usleep(1000);
        int result = gpio_or_gate(in_a, in_b, out);
        printf("%d | %d |   %d\n", test_cases[i][0], test_cases[i][1], result);
        usleep(100000);
    }
    
    printf("\nXOR Gate:\n");
    printf("A | B | Output\n");
    printf("--|---|-------\n");
    for (int i = 0; i < 4; i++) {
        gpio_write(in_a, test_cases[i][0]);
        gpio_write(in_b, test_cases[i][1]);
        usleep(1000);
        int result = gpio_xor_gate(in_a, in_b, out);
        printf("%d | %d |   %d\n", test_cases[i][0], test_cases[i][1], result);
        usleep(100000);
    }
}

int main() {
    gpio_pin input_a, input_b, output;
    
    printf("GPIO Logic Gates - Rock 5B+\n");
    printf("===========================\n");
    printf("Requires root privileges (sudo)\n\n");
    
    // Initialize GPIO pins (example: GPIO1 pins)
    if (gpio_init(&input_a, GPIO1_BASE, 3) < 0) {
        fprintf(stderr, "Failed to init GPIO\n");
        return 1;
    }
    gpio_init(&input_b, GPIO1_BASE, 5);
    gpio_init(&output, GPIO1_BASE, 7);
    
    // Configure directions
    gpio_set_direction(&input_a, 1);  // Output (simulated input)
    gpio_set_direction(&input_b, 1);  // Output (simulated input)
    gpio_set_direction(&output, 1);    // Output
    
    // Run tests
    test_gpio_gates(&input_a, &input_b, &output);
    
    printf("\nTest complete!\n");
    return 0;
}
```

**Build and Run**:
```bash
# Compile
gcc -O2 -march=armv8-a -o gpio_gates gpio_logic_gates.c

# Run (requires root)
sudo ./gpio_gates
```

**Challenges**:
1. Add physical button inputs instead of simulated inputs
2. Implement a half-adder using two gates
3. Create a blinking LED pattern demonstrating gate outputs
4. Measure propagation delay using performance counters
5. Build a full truth table tester with 8 LEDs

## Exercise 3: Number System Converter

**Objective**: Create a comprehensive number system converter supporting binary, octal, decimal, and hexadecimal.

**Implementation**:

```c
// number_converter.c
// Multi-base number system converter

#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <string.h>
#include <ctype.h>

// Convert string in given base to uint64_t
uint64_t str_to_uint64(const char *str, int base) {
    return strtoull(str, NULL, base);
}

// Print number in binary with grouping
void print_binary(uint64_t num, int bits) {
    printf("0b");
    for (int i = bits - 1; i >= 0; i--) {
        printf("%d", (int)((num >> i) & 1));
        if (i % 4 == 0 && i > 0) printf("_");
    }
}

// Print all representations of a number
void print_all_bases(uint64_t num) {
    printf("\n--- Number Representations ---\n");
    printf("Decimal:     %lu\n", num);
    printf("Hexadecimal: 0x%lX\n", num);
    printf("Octal:       0%lo\n", num);
    printf("Binary (64): ");
    print_binary(num, 64);
    printf("\n");
    printf("Binary (32): ");
    print_binary(num, 32);
    printf("\n");
    printf("Binary (16): ");
    print_binary(num, 16);
    printf("\n");
    printf("Binary (8):  ");
    print_binary(num, 8);
    printf("\n");
}

// Two's complement conversion
void show_twos_complement(int64_t num) {
    printf("\n--- Two's Complement Analysis ---\n");
    printf("Value: %ld\n", num);
    printf("Hex: 0x%016lX\n", (uint64_t)num);
    printf("Binary: ");
    print_binary((uint64_t)num, 64);
    printf("\n");
    
    if (num < 0) {
        printf("Negative number representation:\n");
        printf("  Magnitude: %lu\n", (uint64_t)(-num));
        printf("  Sign bit: 1 (MSB)\n");
    } else {
        printf("Positive number\n");
        printf("  Sign bit: 0 (MSB)\n");
    }
}

// IEEE 754 float analysis
void show_float_bits(float f) {
    union {
        float f;
        uint32_t u;
    } fu;
    fu.f = f;
    
    uint32_t sign = (fu.u >> 31) & 1;
    uint32_t exponent = (fu.u >> 23) & 0xFF;
    uint32_t mantissa = fu.u & 0x7FFFFF;
    
    printf("\n--- IEEE 754 Float Analysis ---\n");
    printf("Value: %f\n", f);
    printf("Hex: 0x%08X\n", fu.u);
    printf("Binary: ");
    print_binary(fu.u, 32);
    printf("\n");
    printf("Components:\n");
    printf("  Sign:     %u (%s)\n", sign, sign ? "negative" : "positive");
    printf("  Exponent: 0x%02X (%d, bias %d)\n", 
           exponent, exponent, (int)exponent - 127);
    printf("  Mantissa: 0x%06X\n", mantissa);
}

// Interactive converter
void interactive_mode() {
    char input[100];
    int base;
    
    printf("\n=== Interactive Number Converter ===\n");
    printf("Enter base (2=bin, 8=oct, 10=dec, 16=hex, 0=quit): ");
    
    while (scanf("%d", &base) == 1 && base != 0) {
        if (base != 2 && base != 8 && base != 10 && base != 16) {
            printf("Invalid base! Use 2, 8, 10, or 16\n");
            continue;
        }
        
        printf("Enter number (base %d): ", base);
        scanf("%s", input);
        
        uint64_t num = str_to_uint64(input, base);
        print_all_bases(num);
        
        printf("\nEnter base (2=bin, 8=oct, 10=dec, 16=hex, 0=quit): ");
    }
}

int main(int argc, char *argv[]) {
    printf("========================================\n");
    printf("Number System Converter - Rock 5B+\n");
    printf("========================================\n");
    
    if (argc > 1) {
        // Command-line mode
        uint64_t num = strtoull(argv[1], NULL, 0);  // Auto-detect base
        print_all_bases(num);
        
        // If looks like signed, show two's complement
        int64_t signed_num = (int64_t)num;
        show_twos_complement(signed_num);
        
    } else {
        // Demo mode
        printf("\n=== Demonstration Mode ===\n");
        
        // Positive numbers
        print_all_bases(42);
        print_all_bases(255);
        print_all_bases(65535);
        
        // Two's complement
        show_twos_complement(127);
        show_twos_complement(-128);
        show_twos_complement(-1);
        
        // Floating point
        show_float_bits(3.14159f);
        show_float_bits(-1.0f);
        show_float_bits(0.0f);
        
        // Interactive mode
        interactive_mode();
    }
    
    return 0;
}
```

**Build and Run**:
```bash
gcc -O2 -march=armv8-a -o converter number_converter.c

# Demo mode
./converter

# Convert specific number
./converter 0xFF
./converter 0b11001100
./converter 42
```

**Challenges**:
1. Add BCD (Binary-Coded Decimal) conversion
2. Implement fixed-point number support (Q16.16)
3. Add double-precision IEEE 754 analysis
4. Create endianness converter
5. Add Roman numeral conversion (for fun!)

## Exercise 4: ARM64 Assembly Logic Operations

**Objective**: Implement logic operations in ARM64 assembly to understand gate-level execution.

**Implementation**:

```asm
// logic_ops.S
// ARM64 assembly logic operations

.global asm_and
.global asm_or
.global asm_xor
.global asm_not
.global asm_count_bits
.global asm_parity

.text

// AND operation: result = a & b
// X0: a, X1: b, return in X0
asm_and:
    AND     X0, X0, X1      // X0 = X0 & X1
    RET

// OR operation: result = a | b
asm_or:
    ORR     X0, X0, X1      // X0 = X0 | X1
    RET

// XOR operation: result = a ^ b
asm_xor:
    EOR     X0, X0, X1      // X0 = X0 ^ X1
    RET

// NOT operation: result = ~a
asm_not:
    MVN     X0, X0          // X0 = ~X0
    RET

// Count set bits (population count)
// Uses ARM64 NEON instruction
asm_count_bits:
    FMOV    D0, X0          // Move to NEON register
    CNT     V0.8B, V0.8B    // Count bits in each byte
    ADDV    B0, V0.8B       // Sum all bytes
    FMOV    X0, D0          // Move back to general register
    AND     X0, X0, #0xFF   // Mask to get result
    RET

// Calculate parity (1 if odd number of 1s, 0 if even)
asm_parity:
    // XOR all bits together
    EOR     X1, X0, X0, LSR #32  // XOR upper and lower 32 bits
    EOR     X1, X1, X1, LSR #16  // XOR  upper and lower 16 bits
    EOR     X1, X1, X1, LSR #8   // XOR upper and lower 8 bits
    EOR     X1, X1, X1, LSR #4   // XOR upper and lower 4 bits
    EOR     X1, X1, X1, LSR #2   // XOR upper and lower 2 bits
    EOR     X1, X1, X1, LSR #1   // XOR final 2 bits
    AND     X0, X1, #1           // Mask to get parity bit
    RET
```

**C Wrapper**:

```c
// asm_wrapper.c
// Wrapper for ARM64 assembly functions

#include <stdio.h>
#include <stdint.h>

// Assembly function declarations
extern uint64_t asm_and(uint64_t a, uint64_t b);
extern uint64_t asm_or(uint64_t a, uint64_t b);
extern uint64_t asm_xor(uint64_t a, uint64_t b);
extern uint64_t asm_not(uint64_t a);
extern uint64_t asm_count_bits(uint64_t a);
extern uint64_t asm_parity(uint64_t a);

void print_bits64(uint64_t value) {
    for (int i = 63; i >= 0; i--) {
        printf("%d", (int)((value >> i) & 1));
        if (i % 8 == 0 && i > 0) printf(" ");
    }
}

int main() {
    printf("========================================\n");
    printf("ARM64 Assembly Logic Operations\n");
    printf("========================================\n");
    
    uint64_t a = 0xAAAAAAAAAAAAAAAAUL;  // 10101010...
    uint64_t b = 0xCCCCCCCCCCCCCCCCUL;  // 11001100...
    
    printf("\nInput values:\n");
    printf("A = 0x%016lX\n    ", a);
    print_bits64(a);
    printf("\n\nB = 0x%016lX\n    ", b);
    print_bits64(b);
    printf("\n");
    
    // Test AND
    printf("\n--- AND Operation ---\n");
    uint64_t result = asm_and(a, b);
    printf("A AND B = 0x%016lX\n          ", result);
    print_bits64(result);
    printf("\n");
    
    // Test OR
    printf("\n--- OR Operation ---\n");
    result = asm_or(a, b);
    printf("A OR B  = 0x%016lX\n          ", result);
    print_bits64(result);
    printf("\n");
    
    // Test XOR
    printf("\n--- XOR Operation ---\n");
    result = asm_xor(a, b);
    printf("A XOR B = 0x%016lX\n          ", result);
    print_bits64(result);
    printf("\n");
    
    // Test NOT
    printf("\n--- NOT Operation ---\n");
    result = asm_not(a);
    printf("NOT A   = 0x%016lX\n          ", result);
    print_bits64(result);
    printf("\n");
    
    // Test bit counting
    printf("\n--- Bit Counting ---\n");
    uint64_t test_vals[] = {0x0, 0x1, 0xFF, 0xFFFF, 0xFFFFFFFFFFFFFFFFUL};
    for (int i = 0; i < 5; i++) {
        uint64_t count = asm_count_bits(test_vals[i]);
        printf("Value 0x%016lX has %lu set bits\n", test_vals[i], count);
    }
    
    // Test parity
    printf("\n--- Parity Calculation ---\n");
    for (int i = 0; i < 5; i++) {
        uint64_t parity = asm_parity(test_vals[i]);
        printf("Value 0x%016lX has %s parity\n",
               test_vals[i], parity ? "odd" : "even");
    }
    
    return 0;
}
```

**Build and Run**:
```bash
# Compile assembly and C together
gcc -O2 -march=armv8-a -o logic_asm logic_ops.S asm_wrapper.c

# Run
./logic_asm
```

**Expected Output**:
```
========================================
ARM64 Assembly Logic Operations
========================================

Input values:
A = 0xAAAAAAAAAAAAAAAA
    10101010 10101010 10101010 10101010 10101010 10101010 10101010 10101010

B = 0xCCCCCCCCCCCCCCCC
    11001100 11001100 11001100 11001100 11001100 11001100 11001100 11001100
...
```

**Challenges**:
1. Add timing measurements using PMU counters
2. Implement NAND/NOR operations
3. Create barrel shifter in assembly
4. Optimize for maximum throughput
5. Compare assembly vs C compiler output

## Exercise 5: Performance Measurement

**Objective**: Measure the performance of logic operations using ARM64 performance counters.

**Implementation**:

```c
// performance.c
// Measure logic operation performance on ARM64

#include <stdio.h>
#include <stdint.h>
#include <time.h>

// Read ARM64 cycle counter
static inline uint64_t read_cycle_counter() {
    uint64_t val;
    asm volatile("mrs %0, cntvct_el0" : "=r" (val));
    return val;
}

// Read ARM64 frequency
static inline uint64_t read_frequency() {
    uint64_t freq;
    asm volatile("mrs %0, cntfrq_el0" : "=r" (freq));
    return freq;
}

// Benchmark function
typedef uint64_t (*operation_func)(uint64_t, uint64_t);

void benchmark_operation(const char *name, operation_func op) {
    const int iterations = 10000000;
    uint64_t a = 0xAAAAAAAAAAAAAAAAUL;
    uint64_t b = 0x5555555555555555UL;
    
    // Warm-up
    for (int i = 0; i < 1000; i++) {
        op(a, b);
    }
    
    // Measure
    uint64_t start = read_cycle_counter();
    
    for (int i = 0; i < iterations; i++) {
        op(a, b);
        a = op(a, b);  // Prevent optimization
    }
    
    uint64_t end = read_cycle_counter();
    uint64_t cycles = end - start;
    uint64_t freq = read_frequency();
    
    double cycles_per_op = (double)cycles / iterations;
    double time_ns = (double)cycles * 1000000000.0 / (freq * iterations);
    
    printf("%-15s: %.2f cycles/op, %.2f ns/op\n", 
           name, cycles_per_op, time_ns);
}

// Test operations
uint64_t op_and(uint64_t a, uint64_t b) { return a & b; }
uint64_t op_or(uint64_t a, uint64_t b) { return a | b; }
uint64_t op_xor(uint64_t a, uint64_t b) { return a ^ b; }
uint64_t op_not(uint64_t a, uint64_t b) { return ~a; }
uint64_t op_add(uint64_t a, uint64_t b) { return a + b; }
uint64_t op_mul(uint64_t a, uint64_t b) { return a * b; }

int main() {
    printf("========================================\n");
    printf("ARM64 Logic Operation Performance\n");
    printf("Rock 5B+ Cortex-A76/A55\n");
    printf("========================================\n");
    
    uint64_t freq = read_frequency();
    printf("\nSystem frequency: %lu Hz (%.2f MHz)\n\n", freq, freq / 1000000.0);
    
    printf("Benchmarking (10M operations each):\n");
    printf("----------------------------------------\n");
    
    benchmark_operation("AND", op_and);
    benchmark_operation("OR", op_or);
    benchmark_operation("XOR", op_xor);
    benchmark_operation("NOT", op_not);
    printf("----------------------------------------\n");
    benchmark_operation("ADD (compare)", op_add);
    benchmark_operation("MUL (compare)", op_mul);
    
    printf("\nNote: Logic operations should be ~1 cycle/op on Cortex-A76\n");
    
    return 0;
}
```

**Build and Run**:
```bash
gcc -O2 -march=armv8-a -o perf performance.c
./perf
```

**Challenges**:
1. Add cache miss measurements
2. Compare big (A76) vs LITTLE (A55) cores
3. Measure instruction throughput (ops/second)
4. Add SIMD NEON performance tests
5. Create performance comparison graphs

## Summary and Next Steps

**What** you've completed:

1. **Boolean Calculator**: Verified all logic operations
2. **GPIO Logic**: Implemented physical logic gates
3. **Number Converter**: Mastered base conversions
4. **ARM64 Assembly**: Used native instructions
5. **Performance**: Measured operation speed

**Why** these exercises matter:

- **Practical Skills**: Real implementations on real hardware
- **Understanding**: Theory becomes concrete
- **Confidence**: Proven ability to apply knowledge
- **Portfolio**: Demonstrable projects
- **Foundation**: Ready for advanced topics

**Next Steps**:

1. **Combinational Circuits**: Build adders, MUXes from gates
2. **Sequential Logic**: Add memory with flip-flops
3. **Complete Systems**: Integrate everything
4. **Optimization**: Make code faster, more efficient
5. **Projects**: Create something unique

**Continue Learning**:
- Experiment with the provided code
- Modify and extend the exercises
- Create your own projects
- Share your work with others
- Keep building on Rock 5B+!

Happy hacking! 🚀

