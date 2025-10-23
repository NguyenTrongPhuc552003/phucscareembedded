---
sidebar_position: 3
---

# Number Systems in Digital Computers

Master the representation of numbers in digital systems, from binary fundamentals to floating-point arithmetic, understanding how ARM64 processors like those in Rock 5B+ store and manipulate numerical data at the hardware level.

## What are Number Systems?

**What**: Number systems are methods of representing numerical values using different bases (radix). Digital computers primarily use binary (base-2), but hexadecimal (base-16) and decimal (base-10) are also important for human interaction.

**Why**: Understanding number systems is crucial because:

- **Hardware Reality**: Computers only understand binary (0 and 1)
- **Memory Representation**: All data stored as binary patterns
- **Arithmetic Operations**: Processors perform binary arithmetic
- **Debugging**: Hexadecimal makes binary readable
- **Data Types**: Different number representations for different needs
- **Precision**: Understanding limitations of finite representations

**When**: Number systems knowledge is needed when:

- **Programming**: Understanding data types and their limits
- **Debugging**: Interpreting memory dumps and registers
- **Performance**: Choosing appropriate data types
- **Hardware Programming**: Direct register manipulation
- **Embedded Systems**: Low-level programming on Rock 5B+
- **Bit Manipulation**: Masks, flags, and bitfields

**How**: Number systems work through positional notation:

```c
// Positional notation: value = Σ(digit × base^position)

// Example: Decimal 1234
// = 1×10³ + 2×10² + 3×10¹ + 4×10⁰
// = 1000 + 200 + 30 + 4
// = 1234

// Example: Binary 1011
// = 1×2³ + 0×2² + 1×2¹ + 1×2⁰
// = 8 + 0 + 2 + 1
// = 11 (decimal)

// General conversion from any base
unsigned long convert_to_decimal(const char *number, int base) {
    unsigned long result = 0;
    int length = strlen(number);
    
    for (int i = 0; i < length; i++) {
        int digit;
        
        // Convert character to digit value
        if (number[i] >= '0' && number[i] <= '9') {
            digit = number[i] - '0';
        } else if (number[i] >= 'A' && number[i] <= 'F') {
            digit = number[i] - 'A' + 10;
        } else if (number[i] >= 'a' && number[i] <= 'f') {
            digit = number[i] - 'a' + 10;
        } else {
            continue;  // Skip invalid characters
        }
        
        // Multiply by base and add digit
        result = result * base + digit;
    }
    
    return result;
}

// Example usage
void demo_number_conversion() {
    printf("Number System Conversions:\n");
    printf("Binary '1011' = %lu\n", convert_to_decimal("1011", 2));
    printf("Octal '17' = %lu\n", convert_to_decimal("17", 8));
    printf("Decimal '15' = %lu\n", convert_to_decimal("15", 10));
    printf("Hexadecimal 'F' = %lu\n", convert_to_decimal("F", 16));
}
```

**Where**: Number systems are fundamental in:

- **All digital systems**: Computers, calculators, embedded devices
- **ARM64 processors**: Rock 5B+ RK3588 SoC
- **Programming languages**: C, C++, Python, Assembly
- **File formats**: Binary files, protocols, encodings
- **Communications**: Data transmission and storage

## Binary Number System (Base-2)

**What**: Binary uses only two digits (0 and 1), called bits. It's the native language of digital computers because electronic circuits naturally represent two states (ON/OFF, HIGH/LOW).

**Why**: Binary is fundamental because:

- **Hardware Implementation**: Transistors have two states
- **Reliability**: Easy to distinguish 0 from 1 electrically
- **Noise Immunity**: Better than trying to detect multiple voltage levels
- **Boolean Algebra**: Maps directly to logic operations
- **Storage**: Magnetic/optical media store binary states

**Binary Representation**:

```c
// Binary number representation
typedef struct {
    uint64_t value;     // Actual numerical value
    int num_bits;       // Number of bits used
} binary_number;

// Display binary representation
void print_binary(uint64_t value, int bits) {
    printf("Binary: ");
    for (int i = bits - 1; i >= 0; i--) {
        printf("%d", (int)((value >> i) & 1));
        if (i % 4 == 0 && i > 0) printf(" ");  // Group by nibbles
    }
    printf("\n");
}

// Examples
void demo_binary_numbers() {
    printf("Binary Number Examples:\n\n");
    
    // 8-bit numbers
    printf("Decimal 0:\n");
    print_binary(0, 8);
    
    printf("\nDecimal 1:\n");
    print_binary(1, 8);
    
    printf("\nDecimal 15:\n");
    print_binary(15, 8);
    
    printf("\nDecimal 255:\n");
    print_binary(255, 8);
    
    // 16-bit number
    printf("\nDecimal 1234 (16-bit):\n");
    print_binary(1234, 16);
    
    // 64-bit ARM64 register
    printf("\nDecimal 2^63-1 (64-bit):\n");
    print_binary(0x7FFFFFFFFFFFFFFF, 64);
}

// Binary arithmetic
void demo_binary_arithmetic() {
    uint8_t a = 0b00001111;  // 15 in binary notation (C extension)
    uint8_t b = 0b00000011;  // 3 in binary
    
    printf("\nBinary Arithmetic:\n");
    printf("a = ");
    print_binary(a, 8);
    printf("b = ");
    print_binary(b, 8);
    
    printf("\na + b:\n");
    print_binary(a + b, 8);
    
    printf("\na - b:\n");
    print_binary(a - b, 8);
    
    printf("\na * b:\n");
    print_binary(a * b, 8);
    
    printf("\na & b (AND):\n");
    print_binary(a & b, 8);
    
    printf("\na | b (OR):\n");
    print_binary(a | b, 8);
    
    printf("\na ^ b (XOR):\n");
    print_binary(a ^ b, 8);
}
```

**Bit, Byte, and Word Sizes**:

```c
// Standard data sizes in computing
typedef struct {
    char name[20];
    int bits;
    uint64_t max_value;
    char example[50];
} data_size;

data_size sizes[] = {
    {"Bit",        1,   1,                    "0 or 1"},
    {"Nibble",     4,   15,                   "0xF"},
    {"Byte",       8,   255,                  "uint8_t"},
    {"Word (ARM)", 32,  4294967295UL,         "uint32_t"},
    {"Dword",      64,  18446744073709551615UL, "uint64_t"}
};

void show_data_sizes() {
    printf("\nStandard Data Sizes:\n");
    printf("Name          | Bits | Max Value                | Type\n");
    printf("--------------|------|--------------------------|----------------\n");
    
    for (int i = 0; i < 5; i++) {
        printf("%-13s | %4d | %24lu | %s\n",
               sizes[i].name, sizes[i].bits, sizes[i].max_value,
               sizes[i].example);
    }
}
```

**Where**: Binary is used in:
- **All processor operations**: ARM64 instructions and data
- **Memory storage**: RAM, ROM, Flash
- **Communication**: Network packets, serial data
- **File formats**: Executable files, images, videos

## Hexadecimal Number System (Base-16)

**What**: Hexadecimal (hex) uses 16 digits: 0-9 and A-F. It's a compact representation of binary, where each hex digit represents exactly 4 bits (a nibble).

**Why**: Hexadecimal is important because:

- **Compact Binary**: 1 hex digit = 4 bits, easier to read than binary
- **Memory Addresses**: ARM64 addresses shown in hex
- **Debugging**: Memory dumps, register values
- **Color Codes**: RGB colors (#RRGGBB)
- **Human-Friendly**: More readable than binary

**Hex-Binary Relationship**:

```c
// Hexadecimal to binary conversion table
typedef struct {
    char hex;
    char binary[5];
    int decimal;
} hex_binary_map;

hex_binary_map hex_table[] = {
    {'0', "0000", 0},  {'1', "0001", 1},  {'2', "0010", 2},  {'3', "0011", 3},
    {'4', "0100", 4},  {'5', "0101", 5},  {'6', "0110", 6},  {'7', "0111", 7},
    {'8', "1000", 8},  {'9', "1001", 9},  {'A', "1010", 10}, {'B', "1011", 11},
    {'C', "1100", 12}, {'D', "1101", 13}, {'E', "1110", 14}, {'F', "1111", 15}
};

void show_hex_binary_table() {
    printf("Hexadecimal to Binary Conversion:\n");
    printf("Hex | Binary | Decimal\n");
    printf("----|--------|--------\n");
    
    for (int i = 0; i < 16; i++) {
        printf(" %c  | %s   |   %2d\n",
               hex_table[i].hex, hex_table[i].binary, hex_table[i].decimal);
    }
}

// Convert between hex and binary
void print_hex(uint64_t value, int bytes) {
    printf("0x");
    for (int i = bytes - 1; i >= 0; i--) {
        printf("%02X", (unsigned int)((value >> (i * 8)) & 0xFF));
    }
    printf("\n");
}

// Examples
void demo_hexadecimal() {
    printf("\nHexadecimal Examples:\n");
    
    // ARM64 register values (common usage)
    uint64_t pc = 0x0000000000400000;  // Program counter
    uint64_t x0 = 0xDEADBEEFCAFEBABE;  // Register X0
    
    printf("Program Counter (PC): ");
    print_hex(pc, 8);
    
    printf("Register X0: ");
    print_hex(x0, 8);
    
    // Memory address
    uint32_t *gpio_base = (uint32_t *)0xFDD60000;
    printf("GPIO Base Address: ");
    print_hex((uint64_t)gpio_base, 4);
    
    // Quick conversion examples
    printf("\nQuick Conversions:\n");
    printf("Hex 0xFF = Decimal %d = Binary ", 0xFF);
    print_binary(0xFF, 8);
    
    printf("Hex 0x100 = Decimal %d = Binary ", 0x100);
    print_binary(0x100, 16);
}

// Practical: Bit manipulation with hex
void demo_hex_bit_manipulation() {
    printf("\nHex Bit Manipulation (GPIO example):\n");
    
    uint32_t gpio_register = 0x00000000;
    
    printf("Initial: 0x%08X\n", gpio_register);
    
    // Set bit 5 (hex 0x20 = binary 0010 0000)
    gpio_register |= 0x20;
    printf("After set bit 5: 0x%08X\n", gpio_register);
    
    // Set bits 8-11 (hex 0xF00 = binary 1111 0000 0000)
    gpio_register |= 0xF00;
    printf("After set bits 8-11: 0x%08X\n", gpio_register);
    
    // Clear bit 5
    gpio_register &= ~0x20;
    printf("After clear bit 5: 0x%08X\n", gpio_register);
    
    // Toggle bits 8-11
    gpio_register ^= 0xF00;
    printf("After toggle bits 8-11: 0x%08X\n", gpio_register);
}
```

**Where**: Hexadecimal is used for:
- **Memory addresses**: Pointer values in ARM64
- **Debugging**: GDB, memory dumps
- **Configuration**: Register values, hardware settings
- **Color codes**: Web and graphics (#FF0000 = red)

## Octal Number System (Base-8)

**What**: Octal uses digits 0-7. Each octal digit represents exactly 3 bits. Less common now but historically important.

**Why**: Octal is occasionally useful because:

- **3-bit Groups**: Natural for some permissions (Unix file permissions)
- **Historical**: Early computers used 12, 24, 36-bit words (multiples of 3)
- **Special Cases**: File permissions (rwxrwxrwx = 777)

**Octal Examples**:

```c
// Octal representation
void demo_octal() {
    printf("\nOctal Number System:\n");
    
    // Unix file permissions (most common use)
    int rwx_owner = 0700;    // rwx------ (owner: read, write, execute)
    int rwxrxrx = 0755;      // rwxr-xr-x (owner: rwx, group/other: rx)
    int rw_rw_r = 0664;      // rw-rw-r-- (owner/group: rw, other: r)
    
    printf("File Permission Examples:\n");
    printf("Octal 0%o = Owner:rwx, Group:---, Other:--- \n", rwx_owner);
    printf("Octal 0%o = Owner:rwx, Group:r-x, Other:r-x \n", rwxrxrx);
    printf("Octal 0%o = Owner:rw-, Group:rw-, Other:r-- \n", rw_rw_r);
    
    // Conversion
    printf("\nOctal to Binary:\n");
    printf("Octal 0%o (decimal %d):\n", 0377, 0377);
    print_binary(0377, 9);
}
```

**Where**: Octal is occasionally used in:
- **Unix permissions**: chmod 755 file.txt
- **Legacy systems**: Some old computer architectures
- **Special encodings**: Escape sequences (\377)

## Signed Number Representation

**What**: Signed numbers represent both positive and negative integers. The most common method is two's complement, used by ARM64 and virtually all modern processors.

**Why**: Signed representation is critical because:

- **Real Applications**: Most programs need negative numbers
- **Efficient Hardware**: Two's complement uses same adder for add/subtract
- **Overflow Detection**: Predictable overflow behavior
- **Range**: Efficiently uses all bit patterns

### Two's Complement

**What**: Two's complement represents negative numbers by inverting all bits and adding 1. The MSB (Most Significant Bit) indicates sign: 0=positive, 1=negative.

**How**: Two's complement works:

```c
// Two's complement conversion
int8_t twos_complement(int8_t value) {
    // To negate: invert all bits and add 1
    return (~value) + 1;
}

// Display signed and unsigned interpretation
void show_interpretations(uint8_t bits) {
    int8_t signed_val = (int8_t)bits;
    uint8_t unsigned_val = bits;
    
    printf("Bit pattern: ");
    print_binary(bits, 8);
    printf("Unsigned: %3u\n", unsigned_val);
    printf("Signed (two's complement): %4d\n", signed_val);
    printf("\n");
}

// Examples
void demo_twos_complement() {
    printf("Two's Complement Representation (8-bit):\n\n");
    
    // Positive numbers
    show_interpretations(0b00000000);  // 0
    show_interpretations(0b00000001);  // 1
    show_interpretations(0b01111111);  // 127 (max positive)
    
    // Negative numbers
    show_interpretations(0b10000000);  // -128 (min negative)
    show_interpretations(0b11111111);  // -1
    show_interpretations(0b11111110);  // -2
    
    // Demonstrate negation
    printf("Negation Example:\n");
    int8_t positive = 5;
    int8_t negative = twos_complement(positive);
    
    printf("Original: %d = ", positive);
    print_binary((uint8_t)positive, 8);
    printf("Negated: %d = ", negative);
    print_binary((uint8_t)negative, 8);
    
    // Verify: adding a number and its two's complement gives 0
    int8_t sum = positive + negative;
    printf("Sum: %d + %d = %d\n", positive, negative, sum);
}

// Range calculations
void show_signed_ranges() {
    printf("\nSigned Integer Ranges (Two's Complement):\n");
    printf("Type      | Bits | Min Value               | Max Value\n");
    printf("----------|------|-------------------------|------------------------\n");
    printf("int8_t    |  8   | %24d | %d\n", INT8_MIN, INT8_MAX);
    printf("int16_t   | 16   | %24d | %d\n", INT16_MIN, INT16_MAX);
    printf("int32_t   | 32   | %24d | %d\n", INT32_MIN, INT32_MAX);
    printf("int64_t   | 64   | %24ld | %ld\n", (long)INT64_MIN, (long)INT64_MAX);
}
```

**Advantages of Two's Complement**:

```c
// Why two's complement is brilliant

void demo_twos_complement_advantages() {
    printf("\nTwo's Complement Advantages:\n\n");
    
    // 1. Same hardware for addition and subtraction
    printf("1. Addition/Subtraction use same hardware:\n");
    int8_t a = 10, b = -3;
    int8_t sum = a + b;  // 10 + (-3) = 7
    printf("%d + %d = %d (same adder circuit!)\n\n", a, b, sum);
    
    // 2. Single representation for zero
    printf("2. Only one representation for zero:\n");
    int8_t zero1 = 0;
    int8_t zero2 = twos_complement(0);
    printf("0 = ");
    print_binary((uint8_t)zero1, 8);
    printf("-0 = ");
    print_binary((uint8_t)zero2, 8);
    printf("Same! (unlike sign-magnitude)\n\n");
    
    // 3. Easy overflow detection
    printf("3. Easy overflow detection:\n");
    int8_t max = INT8_MAX;  // 127
    int8_t overflow = max + 1;  // Wraps to -128
    printf("Max + 1: %d + 1 = %d (overflow!)\n", max, overflow);
    printf("MSB changed: overflow detected\n");
}
```

**Where**: Two's complement is used in:
- **All modern CPUs**: ARM64, x86, RISC-V
- **Integer types**: int8_t, int16_t, int32_t, int64_t
- **ARM64 ALU**: Arithmetic operations
- **Comparisons**: Signed comparison instructions

## Fixed-Point Representation

**What**: Fixed-point numbers represent fractional values using integers with an implied decimal point at a fixed position.

**Why**: Fixed-point is useful because:

- **No FPU Needed**: Works on integer-only processors
- **Deterministic**: Exact representation (unlike floating-point)
- **Performance**: Faster than floating-point on some systems
- **Embedded Systems**: Common in DSP, audio, graphics

**How**: Fixed-point works:

```c
// Fixed-point number representation
// Q format: Qm.n where m=integer bits, n=fractional bits
// Example: Q16.16 = 16 integer bits, 16 fractional bits

typedef int32_t fixed_point_16_16;  // Q16.16 format

// Conversion functions
fixed_point_16_16 float_to_fixed(float value) {
    return (fixed_point_16_16)(value * 65536.0f);  // 2^16 = 65536
}

float fixed_to_float(fixed_point_16_16 value) {
    return (float)value / 65536.0f;
}

// Fixed-point arithmetic
fixed_point_16_16 fixed_add(fixed_point_16_16 a, fixed_point_16_16 b) {
    return a + b;  // Simple integer addition!
}

fixed_point_16_16 fixed_sub(fixed_point_16_16 a, fixed_point_16_16 b) {
    return a - b;
}

fixed_point_16_16 fixed_mul(fixed_point_16_16 a, fixed_point_16_16 b) {
    // Multiply and shift right to maintain scale
    int64_t temp = (int64_t)a * (int64_t)b;
    return (fixed_point_16_16)(temp >> 16);
}

fixed_point_16_16 fixed_div(fixed_point_16_16 a, fixed_point_16_16 b) {
    // Shift left before division to maintain scale
    int64_t temp = ((int64_t)a << 16) / b;
    return (fixed_point_16_16)temp;
}

// Example usage
void demo_fixed_point() {
    printf("\nFixed-Point Arithmetic (Q16.16):\n");
    
    float f1 = 3.14159f;
    float f2 = 2.71828f;
    
    fixed_point_16_16 fp1 = float_to_fixed(f1);
    fixed_point_16_16 fp2 = float_to_fixed(f2);
    
    printf("a = %.5f (fixed: 0x%08X)\n", f1, fp1);
    printf("b = %.5f (fixed: 0x%08X)\n\n", f2, fp2);
    
    // Addition
    fixed_point_16_16 sum = fixed_add(fp1, fp2);
    printf("a + b = %.5f (fixed: 0x%08X)\n", fixed_to_float(sum), sum);
    
    // Multiplication
    fixed_point_16_16 product = fixed_mul(fp1, fp2);
    printf("a * b = %.5f (fixed: 0x%08X)\n", fixed_to_float(product), product);
    
    // Division
    fixed_point_16_16 quotient = fixed_div(fp1, fp2);
    printf("a / b = %.5f (fixed: 0x%08X)\n", fixed_to_float(quotient), quotient);
}
```

**Where**: Fixed-point is used in:
- **Audio processing**: Sample values, DSP algorithms
- **Graphics**: Texture coordinates, color values
- **Embedded systems**: Systems without FPU
- **Financial calculations**: Exact decimal arithmetic

## Floating-Point Representation (IEEE 754)

**What**: Floating-point numbers represent a wide range of values using scientific notation: sign × mantissa × 2^exponent. The IEEE 754 standard defines binary32 (float) and binary64 (double).

**Why**: Floating-point is essential because:

- **Wide Range**: From very small to very large numbers
- **Scientific Computing**: Physics, engineering simulations
- **Graphics**: 3D coordinates, transformations
- **Machine Learning**: Neural network weights
- **Standard**: IEEE 754 ensures compatibility

**IEEE 754 Format**:

```c
// IEEE 754 binary32 (float) format:
// [Sign: 1 bit][Exponent: 8 bits][Mantissa: 23 bits]
//
// Value = (-1)^sign × 1.mantissa × 2^(exponent-127)

typedef union {
    float f;
    struct {
        uint32_t mantissa : 23;
        uint32_t exponent : 8;
        uint32_t sign : 1;
    } parts;
    uint32_t bits;
} float_bits;

void print_float_bits(float value) {
    float_bits fb;
    fb.f = value;
    
    printf("Float value: %g\n", value);
    printf("Bit pattern: 0x%08X\n", fb.bits);
    printf("Sign: %u\n", fb.parts.sign);
    printf("Exponent: %u (biased), %d (actual)\n",
           fb.parts.exponent, (int)fb.parts.exponent - 127);
    printf("Mantissa: 0x%06X\n", fb.parts.mantissa);
    printf("Binary: ");
    print_binary(fb.bits, 32);
    printf("\n");
}

void demo_float_representation() {
    printf("\nIEEE 754 Floating-Point Representation:\n\n");
    
    // Positive numbers
    print_float_bits(1.0f);
    print_float_bits(2.0f);
    print_float_bits(3.14159f);
    
    // Negative number
    print_float_bits(-1.0f);
    
    // Special values
    print_float_bits(0.0f);           // Zero
    print_float_bits(INFINITY);       // Infinity
    print_float_bits(-INFINITY);      // Negative infinity
    print_float_bits(NAN);            // Not a Number
    
    // Very small and very large
    print_float_bits(1.0e-38f);      // Near minimum
    print_float_bits(1.0e38f);       // Near maximum
}

// Range and precision
void show_float_characteristics() {
    printf("\nFloating-Point Characteristics:\n");
    printf("Type    | Bits | Sign | Exp | Mantissa | Range (approx)\n");
    printf("--------|------|------|-----|----------|------------------\n");
    printf("float   |  32  |  1   |  8  |    23    | ±3.4e±38\n");
    printf("double  |  64  |  1   | 11  |    52    | ±1.7e±308\n");
    
    printf("\nPrecision:\n");
    printf("float:  ~7 decimal digits\n");
    printf("double: ~15 decimal digits\n");
    
    // Demonstrate precision limits
    printf("\nPrecision Limits:\n");
    float f = 1.0f;
    double d = 1.0;
    
    printf("float: 1.0 + 1e-7 = %f (exact)\n", f + 1e-7f);
    printf("float: 1.0 + 1e-8 = %f (lost precision!)\n", f + 1e-8f);
    
    printf("double: 1.0 + 1e-15 = %.16f (exact)\n", d + 1e-15);
    printf("double: 1.0 + 1e-16 = %.16f (lost precision!)\n", d + 1e-16);
}
```

**Floating-Point Pitfalls**:

```c
// Common floating-point issues

void demo_float_pitfalls() {
    printf("\nFloating-Point Pitfalls:\n\n");
    
    // 1. Not all decimals representable exactly
    printf("1. Decimal representation:\n");
    float f = 0.1f;
    printf("0.1 stored as: %.20f\n", f);
    printf("Not exactly 0.1!\n\n");
    
    // 2. Comparison problems
    printf("2. Comparison issues:\n");
    float a = 0.1f + 0.1f + 0.1f;
    float b = 0.3f;
    if (a == b) {
        printf("0.1+0.1+0.1 == 0.3: TRUE\n");
    } else {
        printf("0.1+0.1+0.1 == 0.3: FALSE!\n");
        printf("a = %.20f\n", a);
        printf("b = %.20f\n", b);
    }
    printf("Use epsilon for comparisons!\n\n");
    
    // 3. Catastrophic cancellation
    printf("3. Cancellation error:\n");
    float big = 1.0e20f;
    float tiny = 1.0f;
    float result = (big + tiny) - big;
    printf("(1e20 + 1) - 1e20 = %f\n", result);
    printf("Expected 1.0, got %f due to limited precision\n\n", result);
    
    // 4. Accumulation of errors
    printf("4. Accumulation:\n");
    float sum = 0.0f;
    for (int i = 0; i < 10000000; i++) {
        sum += 0.1f;
    }
    printf("Sum of 0.1, 10 million times: %f\n", sum);
    printf("Expected: 1000000.0, Error: %f\n", sum - 1000000.0f);
}

// Safe floating-point comparison
int float_equals(float a, float b, float epsilon) {
    return fabsf(a - b) < epsilon;
}
```

**Where**: Floating-point is used in:
- **ARM64 FPU**: Dedicated floating-point unit
- **Graphics**: GPU computations, 3D rendering
- **Scientific computing**: Simulations, modeling
- **Machine learning**: Neural networks on NPU
- **Audio/Video**: Signal processing

## Binary-Coded Decimal (BCD)

**What**: BCD represents each decimal digit as a 4-bit binary number. Used where decimal accuracy is critical.

**Why**: BCD is useful for:

- **Exact Decimal**: No binary→decimal conversion errors
- **Financial**: Money calculations (though fixed-point often better)
- **Display**: Seven-segment displays, calculators
- **Human Interface**: Direct decimal representation

**BCD Examples**:

```c
// BCD representation
uint8_t decimal_to_bcd(uint8_t decimal) {
    // Each nibble represents one decimal digit
    uint8_t tens = (decimal / 10) << 4;
    uint8_t ones = decimal % 10;
    return tens | ones;
}

uint8_t bcd_to_decimal(uint8_t bcd) {
    uint8_t tens = (bcd >> 4) * 10;
    uint8_t ones = bcd & 0x0F;
    return tens + ones;
}

void demo_bcd() {
    printf("\nBinary-Coded Decimal (BCD):\n\n");
    
    printf("Decimal | BCD (hex) | Binary\n");
    printf("--------|-----------|----------------\n");
    
    for (int i = 0; i <= 99; i += 11) {
        uint8_t bcd = decimal_to_bcd(i);
        printf("%7d | 0x%02X      | ", i, bcd);
        print_binary(bcd, 8);
    }
    
    // BCD arithmetic example
    printf("\nBCD Addition (with adjustment):\n");
    uint8_t a_bcd = decimal_to_bcd(25);  // 25 in BCD
    uint8_t b_bcd = decimal_to_bcd(17);  // 17 in BCD
    
    printf("25 in BCD: 0x%02X\n", a_bcd);
    printf("17 in BCD: 0x%02X\n", b_bcd);
    
    // BCD addition requires adjustment
    uint8_t sum = a_bcd + b_bcd;  // Raw binary addition
    printf("Binary sum: 0x%02X (incorrect for BCD!)\n", sum);
    
    // Proper BCD sum would need adjustment logic
    uint8_t correct_sum = decimal_to_bcd(bcd_to_decimal(a_bcd) + 
                                         bcd_to_decimal(b_bcd));
    printf("Correct BCD: 0x%02X (42 decimal)\n", correct_sum);
}
```

**Where**: BCD is occasionally used in:
- **Real-time clocks**: RTC chips
- **Old calculators**: Direct decimal arithmetic
- **Display drivers**: Seven-segment displays
- **Legacy systems**: Some financial applications

## Rock 5B+ ARM64 Context

**What**: The ARM64 architecture in Rock 5B+ RK3588 natively supports various number representations through dedicated hardware.

**ARM64 Data Types**:

```c
// ARM64 native data types and operations

void demo_arm64_data_types() {
    printf("\nARM64 Data Types on Rock 5B+:\n\n");
    
    // Integer types (two's complement)
    int8_t   i8  = -128;       // 8-bit signed
    uint8_t  u8  = 255;        // 8-bit unsigned
    int16_t  i16 = -32768;     // 16-bit signed (halfword)
    uint16_t u16 = 65535;      // 16-bit unsigned
    int32_t  i32 = -2147483648; // 32-bit signed (word)
    uint32_t u32 = 4294967295U;  // 32-bit unsigned
    int64_t  i64 = -9223372036854775807L; // 64-bit signed (doubleword)
    uint64_t u64 = 18446744073709551615UL; // 64-bit unsigned
    
    // Floating-point types (IEEE 754)
    float    f32 = 3.14159f;   // 32-bit float (binary32)
    double   f64 = 2.718281828; // 64-bit double (binary64)
    
    printf("Integer types (two's complement):\n");
    printf("int8_t:   %d\n", i8);
    printf("uint8_t:  %u\n", u8);
    printf("int32_t:  %d\n", i32);
    printf("uint64_t: %lu\n", u64);
    
    printf("\nFloating-point (IEEE 754):\n");
    printf("float:    %f\n", f32);
    printf("double:   %f\n", f64);
    
    // ARM64 SIMD types (NEON)
    printf("\nNEON SIMD vectors:\n");
    printf("128-bit vectors can hold:\n");
    printf("  16 × 8-bit integers\n");
    printf("  8 × 16-bit integers\n");
    printf("  4 × 32-bit integers\n");
    printf("  2 × 64-bit integers\n");
    printf("  4 × 32-bit floats\n");
    printf("  2 × 64-bit doubles\n");
}

// ARM64-specific operations
void demo_arm64_operations() {
    printf("\nARM64-Efficient Operations:\n\n");
    
    uint64_t value = 0xDEADBEEFCAFEBABE;
    
    // Byte reversal (REV instruction)
    uint64_t reversed = __builtin_bswap64(value);
    printf("Original:  0x%016lX\n", value);
    printf("Reversed:  0x%016lX (REV instruction)\n", reversed);
    
    // Count leading zeros (CLZ instruction)
    int leading_zeros = __builtin_clzll(value);
    printf("Leading zeros: %d (CLZ instruction)\n", leading_zeros);
    
    // Population count (POPCNT via NEON)
    int set_bits = __builtin_popcountll(value);
    printf("Set bits: %d (POPCNT)\n", set_bits);
    
    // Bit field extraction (UBFX instruction)
    uint64_t extracted = (value >> 8) & 0xFFFF;
    printf("Bits [23:8]: 0x%04lX (UBFX instruction)\n", extracted);
}
```

**Where**: Number systems on Rock 5B+ appear in:
- **Registers**: 64-bit general-purpose registers (X0-X30)
- **Memory addresses**: 48-bit virtual addresses (hex format)
- **FPU**: IEEE 754 floating-point operations
- **NEON**: SIMD packed integer and float operations
- **Peripherals**: GPIO registers, timers (binary/hex)

## Key Takeaways

**What** you've accomplished:

1. **Number Systems**: Understand binary, hex, octal, decimal
2. **Conversions**: Convert between different bases
3. **Signed Numbers**: Master two's complement representation
4. **Fixed-Point**: Understand fractional numbers without FPU
5. **Floating-Point**: Know IEEE 754 and its limitations
6. **BCD**: Recognize decimal-in-binary encoding
7. **ARM64 Types**: See how numbers map to hardware

**Why** these concepts matter:

- **Hardware Understanding**: Know how computers represent data
- **Type Selection**: Choose appropriate data types
- **Debugging**: Interpret memory and register values
- **Precision Aware**: Understand numerical limitations
- **Performance**: Use hardware-efficient representations

**When** to apply:

- **Programming**: Selecting int8/int32/float/double
- **Debugging**: Reading hex dumps, register values
- **Bit Manipulation**: Masks, shifts, flags
- **Embedded Systems**: Direct hardware programming
- **Performance**: Choosing fixed vs. floating point

**Where** skills apply:

- **All programming**: C, C++, Assembly, Python
- **Embedded systems**: Rock 5B+ programming
- **Computer architecture**: Understanding processors
- **Digital design**: FPGA/ASIC development
- **Systems programming**: Operating systems, drivers

## Next Steps

**What** you're ready for next:

After mastering number systems, you're prepared to:

1. **Combinational Circuits**: Use numbers in arithmetic circuits
2. **ALU Design**: Build arithmetic and logic units
3. **ARM64 Assembly**: Program with actual number representations
4. **Memory Systems**: Understand data storage and addressing

**Where** to go next:

Continue with **"Hands-on Exercises"** to:

- Implement number conversions on Rock 5B+
- Practice GPIO bit manipulation
- Create simple calculator programs
- Explore ARM64 register operations

**Why** next lesson is important:

You now understand how numbers are represented. The hands-on exercises let you apply this knowledge directly on Rock 5B+ hardware, making the concepts concrete and practical.

**How** to continue learning:

1. **Practice**: Convert numbers between bases
2. **Experiment**: Try different data types in C
3. **Debug**: Use GDB to examine memory in hex
4. **Program**: Write bit manipulation code
5. **Measure**: Compare fixed-point vs. float performance

## Resources

**Official Documentation**:
- [IEEE 754 Standard](https://ieeexplore.ieee.org/document/8766229) - Floating-point specification
- [ARM64 Data Types](https://developer.arm.com/documentation/ddi0487/latest) - ARM architecture reference
- [Two's Complement](https://en.wikipedia.org/wiki/Two%27s_complement) - Comprehensive explanation

**Learning Resources**:
- _Computer Organization and Design: ARM Edition_ - Patterson & Hennessy
- _The C Programming Language_ - Kernighan & Ritchie (Chapter 2: Types)
- _Numerical Computing with IEEE Floating Point Arithmetic_ - Overton

**Online Tools**:
- [IEEE 754 Converter](https://www.h-schmidt.net/FloatConverter/) - Float to binary converter
- [Number Base Converter](https://www.rapidtables.com/convert/number/base-converter.html) - Multi-base conversions
- [Two's Complement Calculator](https://www.exploringbinary.com/twos-complement-converter/) - Signed number tool

**Video Tutorials**:
- Computerphile - Floating Point Numbers (YouTube)
- Ben Eater - Two's Complement (YouTube)
- MIT 6.004 - Number Representation (OCW)

Happy learning! 🚀

