---
sidebar_position: 4
---

# Custom Extensions

Master RISC-V custom extensions that allow platforms to add specialized instructions for domain-specific acceleration, essential for embedded systems, specialized applications, and platform-specific optimizations.

## What Are Custom Extensions?

**What**: Custom extensions are platform-specific RISC-V ISA extensions that add custom instructions beyond the standard RISC-V instruction set. They enable hardware designers to add specialized instructions for specific use cases, applications, or domains.

**Why**: Understanding custom extensions is crucial because:

- **Domain-Specific Acceleration** - Accelerate specific algorithms or operations
- **Performance Optimization** - Custom instructions can significantly improve performance
- **Power Efficiency** - Specialized instructions can reduce power consumption
- **Embedded Applications** - Critical for embedded and real-time systems
- **Competitive Advantage** - Platform-specific optimizations
- **Kernel Support** - Kernel may need to support custom extensions

**When**: Custom extensions are used when:

- **Embedded Systems** - Specialized embedded applications
- **Real-Time Systems** - Real-time processing requirements
- **DSP Applications** - Digital signal processing operations
- **Image Processing** - Image and video processing acceleration
- **ML Inference** - Machine learning inference acceleration
- **Application-Specific** - Domain-specific computing requirements

**How**: Custom extensions work through:

- **Instruction Encoding** - Custom opcodes in reserved encoding space
- **Hardware Implementation** - Custom logic in processor pipeline
- **Compiler Support** - Compiler intrinsics or inline assembly
- **Runtime Detection** - Detection of extension availability
- **Kernel Awareness** - Kernel handling of custom instructions

**Where**: Custom extensions are found in:

- **Embedded RISC-V CPUs** - Many embedded processors have custom extensions
- **Specialized Processors** - Domain-specific accelerators
- **SoCs** - System-on-Chip implementations
- **Real-Time Systems** - Real-time control systems
- **Application Processors** - Application-specific processors
- **Research Platforms** - Research and development platforms

## Custom Instruction Encoding

**What**: Custom instructions are encoded using reserved opcode space in the RISC-V ISA.

**How**: Custom instruction encoding works:

```c
// Example: RISC-V instruction encoding space for custom extensions
// RISC-V reserves several opcode ranges for custom extensions:
// - Custom-0: 0x0B (opcode bits [6:0] = 0001011)
// - Custom-1: 0x2B (opcode bits [6:0] = 0101011)
// - Custom-2: 0x5B (opcode bits [6:0] = 1011011)
// - Custom-3: 0x7B (opcode bits [6:0] = 1111011)

// Instruction format for custom instructions:
// [31:25] - funct7 (custom function code)
// [24:20] - rs2 (source register 2)
// [19:15] - rs1 (source register 1)
// [14:12] - funct3 (additional function code)
// [11:7]  - rd (destination register)
// [6:0]   - opcode (0x0B, 0x2B, 0x5B, or 0x7B)

// Example: Custom instruction encoding structure
struct custom_instruction {
    unsigned int opcode: 7;      // Custom opcode (0x0B, 0x2B, etc.)
    unsigned int rd: 5;          // Destination register
    unsigned int funct3: 3;      // Function code (3 bits)
    unsigned int rs1: 5;         // Source register 1
    unsigned int rs2: 5;         // Source register 2
    unsigned int funct7: 7;      // Extended function code
};

// Example: Encoding a custom instruction
unsigned int encode_custom_instruction(unsigned int opcode,
                                       unsigned int rd,
                                       unsigned int funct3,
                                       unsigned int rs1,
                                       unsigned int rs2,
                                       unsigned int funct7) {
    return (funct7 << 25) | (rs2 << 20) | (rs1 << 15) |
           (funct3 << 12) | (rd << 7) | opcode;
}

// Example: Decoding custom instruction
void decode_custom_instruction(unsigned int instruction,
                              struct custom_instruction *decoded) {
    decoded->opcode = instruction & 0x7F;
    decoded->rd = (instruction >> 7) & 0x1F;
    decoded->funct3 = (instruction >> 12) & 0x7;
    decoded->rs1 = (instruction >> 15) & 0x1F;
    decoded->rs2 = (instruction >> 20) & 0x1F;
    decoded->funct7 = (instruction >> 25) & 0x7F;
}

// Example: Using custom instruction in inline assembly
void custom_operation(unsigned int input, unsigned int *result) {
    // Custom instruction: custom_0 rd, rs1, rs2, funct3, funct7
    // Assume: opcode = 0x0B (Custom-0)
    //         funct3 = 0x1 (specific operation)
    //         funct7 = 0x00 (operation variant)

    __asm__ volatile(
        ".insn r 0x0B, 0x1, %0, %1, %2\n"  // Custom-0 instruction
        : "=r"(*result)
        : "r"(input), "r"(0)
        : "memory"
    );
}
```

**Explanation**:

- **Reserved opcodes** RISC-V reserves 4 custom opcode spaces
- **Instruction encoding** custom instructions follow RISC-V encoding format
- **Function fields** funct3 and funct7 provide operation encoding
- **Register fields** standard rs1, rs2, rd fields used
- **Assembly syntax** .insn directive for custom instructions

## Example Custom Extension: DSP Operations

**What**: Digital Signal Processing (DSP) custom extensions add instructions for signal processing operations.

**How**: DSP custom extension example:

```c
// Example: DSP custom extension operations
// Custom instructions for common DSP operations:
// - Multiply-accumulate (MAC)
// - Saturating arithmetic
// - Bit manipulation for signals
// - Fast Fourier Transform (FFT) operations

// Example: Custom MAC (Multiply-Accumulate) instruction
// custom.mac rd, rs1, rs2
// rd = rd + (rs1 * rs2)  // Accumulate into destination

void custom_mac_accumulate(int *acc, int a, int b) {
    // Custom MAC instruction
    // Opcode: 0x0B (Custom-0)
    // funct3: 0x2 (MAC operation)
    // funct7: 0x00

    __asm__ volatile(
        ".insn r 0x0B, 0x2, %0, %1, %2\n"
        : "+r"(*acc)
        : "r"(a), "r"(b)
        : "memory"
    );
}

// Example: Vectorized MAC for filter
void custom_fir_filter(int *input, int *coefficients, int *output,
                      int length, int filter_length) {
    for (int i = 0; i < length; i++) {
        int acc = 0;

        // Custom MAC for each filter tap
        for (int j = 0; j < filter_length; j++) {
            if (i - j >= 0) {
                custom_mac_accumulate(&acc, input[i - j], coefficients[j]);
            }
        }

        output[i] = acc;
    }
}

// Example: Saturating add custom instruction
// custom.sadd rd, rs1, rs2
// rd = saturate(rs1 + rs2)  // Saturate on overflow

int custom_saturating_add(int a, int b) {
    int result;

    // Custom saturating add
    // Opcode: 0x0B (Custom-0)
    // funct3: 0x3 (Saturating add)
    // funct7: 0x00

    __asm__ volatile(
        ".insn r 0x0B, 0x3, %0, %1, %2\n"
        : "=r"(result)
        : "r"(a), "r"(b)
    );

    return result;
}

// Example: Bit reversal for FFT
// custom.brev rd, rs1
// rd = bit_reverse(rs1)  // Reverse bits (useful for FFT)

unsigned int custom_bit_reverse(unsigned int input) {
    unsigned int result;

    // Custom bit reversal
    // Opcode: 0x0B (Custom-0)
    // funct3: 0x4 (Bit reverse)
    // funct7: 0x00

    __asm__ volatile(
        ".insn r 0x0B, 0x4, %0, %1, x0\n"
        : "=r"(result)
        : "r"(input)
    );

    return result;
}
```

**Explanation**:

- **MAC operations** multiply-accumulate common in DSP
- **Saturating arithmetic** prevents overflow in signal processing
- **Bit operations** bit reversal useful for FFT
- **Performance** custom instructions significantly faster than software
- **Application-specific** tailored for domain-specific needs

## Example Custom Extension: Image Processing

**What**: Image processing custom extensions add instructions for image manipulation operations.

**How**: Image processing extension example:

```c
// Example: Image processing custom extension
// Custom instructions for image operations:
// - Pixel manipulation
// - Color space conversion
// - Image filtering

// Example: Custom pixel pack instruction
// custom.pack rd, rs1, rs2
// Pack two 16-bit values into 32-bit word

uint32_t custom_pack_pixels(uint16_t pixel1, uint16_t pixel2) {
    uint32_t result;

    // Custom pack instruction
    __asm__ volatile(
        ".insn r 0x0B, 0x5, %0, %1, %2\n"
        : "=r"(result)
        : "r"(pixel1), "r"(pixel2)
    );

    return result;
}

// Example: Custom pixel unpack instruction
// custom.unpack rd, rs1
// Unpack 32-bit word into two 16-bit values

void custom_unpack_pixels(uint32_t packed, uint16_t *pixel1, uint16_t *pixel2) {
    uint64_t result;

    // Custom unpack instruction
    __asm__ volatile(
        ".insn r 0x0B, 0x6, %0, %1, x0\n"
        : "=r"(result)
        : "r"(packed)
    );

    *pixel1 = (uint16_t)(result & 0xFFFF);
    *pixel2 = (uint16_t)((result >> 16) & 0xFFFF);
}

// Example: Custom RGB to grayscale conversion
// custom.rgb2gray rd, rs1
// Convert RGB pixel to grayscale

uint8_t custom_rgb_to_grayscale(uint32_t rgb_pixel) {
    uint8_t gray;

    // Custom RGB to grayscale
    // Uses standard formula: gray = 0.299*R + 0.587*G + 0.114*B
    __asm__ volatile(
        ".insn r 0x0B, 0x7, %0, %1, x0\n"
        : "=r"(gray)
        : "r"(rgb_pixel)
    );

    return gray;
}

// Example: Custom image convolution
void custom_image_convolution(uint8_t *input, uint8_t *output,
                              int width, int height,
                              int *kernel, int kernel_size) {
    // Use custom instructions for fast convolution
    for (int y = 1; y < height - 1; y++) {
        for (int x = 1; x < width - 1; x++) {
            int sum = 0;

            // Convolve with kernel
            for (int ky = 0; ky < kernel_size; ky++) {
                for (int kx = 0; kx < kernel_size; kx++) {
                    int pixel = input[(y + ky - 1) * width + (x + kx - 1)];
                    int coeff = kernel[ky * kernel_size + kx];

                    // Use custom MAC
                    custom_mac_accumulate(&sum, pixel, coeff);
                }
            }

            output[y * width + x] = (uint8_t)(sum / (kernel_size * kernel_size));
        }
    }
}
```

**Explanation**:

- **Pixel operations** custom instructions for pixel manipulation
- **Pack/unpack** efficient data packing for image data
- **Color conversion** hardware-accelerated color space conversions
- **Convolution** fast image filtering operations
- **Performance** significant speedup for image processing

## Extension Detection and Compatibility

**What**: Systems need to detect custom extensions and provide fallback implementations.

**How**: Extension detection works:

```c
// Example: Custom extension detection
// Extension availability can be detected via:
// 1. Vendor-specific CSRs
// 2. Device tree properties
// 3. CPU feature bits
// 4. Runtime testing

// Example: Vendor-specific CSR for extension detection
#define VENDOR_EXT_CSR  0x800  // Vendor-specific CSR base

bool detect_dsp_extension(void) {
    unsigned long ext_status;

    // Read vendor CSR
    __asm__ volatile("csrr %0, %1" : "=r"(ext_status) : "i"(VENDOR_EXT_CSR));

    // Check DSP extension bit
    return (ext_status & (1UL << 0)) != 0;
}

bool detect_image_extension(void) {
    unsigned long ext_status;

    __asm__ volatile("csrr %0, %1" : "=r"(ext_status) : "i"(VENDOR_EXT_CSR));

    // Check image processing extension bit
    return (ext_status & (1UL << 1)) != 0;
}

// Example: Runtime testing for extension
bool test_custom_instruction(unsigned int opcode, unsigned int funct3) {
    // Try to execute custom instruction
    // If instruction exists, it executes; otherwise traps

    unsigned long mepc, mcause;
    bool instruction_exists = true;

    // Save exception handler
    __asm__ volatile("csrr %0, mepc" : "=r"(mepc));
    __asm__ volatile("csrr %0, mcause" : "=r"(mcause));

    // Try to execute custom instruction
    __asm__ volatile(
        ".option push\n"
        ".option norvc\n"  // Disable compressed instructions
        ".word %0\n"       // Emit instruction as word
        ".option pop\n"
        : "+m"(opcode)
        :
        : "memory"
    );

    // If we get here without exception, instruction exists
    // Check if exception occurred
    unsigned long new_mcause;
    __asm__ volatile("csrr %0, mcause" : "=r"(new_mcause));

    if (new_mcause == CAUSE_ILLEGAL_INSTRUCTION) {
        instruction_exists = false;
    }

    return instruction_exists;
}

// Example: Fallback implementation
void dsp_mac_with_fallback(int *acc, int a, int b) {
    if (detect_dsp_extension()) {
        // Use custom instruction
        custom_mac_accumulate(acc, a, b);
    } else {
        // Software fallback
        *acc += a * b;
    }
}

// Example: Device tree based detection (kernel)
bool dt_has_custom_extension(struct device_node *cpu_node,
                             const char *extension_name) {
    // Check device tree for extension property
    return of_property_read_bool(cpu_node, extension_name);
}

// Example: CPU feature detection (kernel)
void setup_custom_extensions(void) {
    struct device_node *cpu_node;
    bool has_dsp = false;
    bool has_image = false;

    // Find CPU node
    cpu_node = of_find_node_by_path("/cpus/cpu@0");
    if (!cpu_node) {
        return;
    }

    // Check for extensions
    has_dsp = dt_has_custom_extension(cpu_node, "riscv,custom-dsp");
    has_image = dt_has_custom_extension(cpu_node, "riscv,custom-image");

    // Register extensions
    if (has_dsp) {
        register_dsp_extension();
    }

    if (has_image) {
        register_image_extension();
    }
}
```

**Explanation**:

- **CSR detection** vendor CSRs can indicate extension availability
- **Runtime testing** try instruction and check for illegal instruction exception
- **Device tree** device tree properties indicate extensions
- **Fallback** provide software fallback if extension not available
- **Compatibility** ensure code works with and without extensions

## Kernel Support for Custom Extensions

**What**: Kernel may need to handle custom extensions, especially during context switching and exception handling.

**How**: Kernel support works:

```c
// Example: Kernel custom extension support
// Kernel needs to:
// 1. Save/restore custom extension state during context switch
// 2. Handle exceptions from custom instructions
// 3. Provide API for user space to use extensions

// Example: Custom extension state structure
struct custom_ext_state {
    // DSP extension state
    unsigned long dsp_acc[4];  // DSP accumulators

    // Image processing extension state
    unsigned long image_config;  // Image processing configuration

    // Extension availability flags
    unsigned long available_extensions;
};

// Example: Saving custom extension state
void save_custom_extension_state(struct custom_ext_state *state,
                                struct task_struct *task) {
    if (state->available_extensions & CUSTOM_EXT_DSP) {
        // Save DSP accumulators
        // Custom CSR read for DSP state
        for (int i = 0; i < 4; i++) {
            __asm__ volatile("csrr %0, %1"
                           : "=r"(state->dsp_acc[i])
                           : "i"(0x800 + i));  // Vendor CSR base + offset
        }
    }

    if (state->available_extensions & CUSTOM_EXT_IMAGE) {
        // Save image processing state
        __asm__ volatile("csrr %0, %1"
                       : "=r"(state->image_config)
                       : "i"(0x810));  // Image extension CSR
    }
}

// Example: Restoring custom extension state
void restore_custom_extension_state(struct custom_ext_state *state,
                                   struct task_struct *task) {
    if (state->available_extensions & CUSTOM_EXT_DSP) {
        // Restore DSP accumulators
        for (int i = 0; i < 4; i++) {
            __asm__ volatile("csrw %0, %1"
                           :
                           : "i"(0x800 + i), "r"(state->dsp_acc[i]));
        }
    }

    if (state->available_extensions & CUSTOM_EXT_IMAGE) {
        // Restore image processing state
        __asm__ volatile("csrw %0, %1"
                       :
                       : "i"(0x810), "r"(state->image_config));
    }
}

// Example: Handling illegal custom instruction exception
void handle_custom_instruction_exception(struct pt_regs *regs,
                                        unsigned long instruction) {
    // Check if this is a custom instruction
    unsigned int opcode = instruction & 0x7F;

    if (opcode == 0x0B || opcode == 0x2B ||
        opcode == 0x5B || opcode == 0x7B) {
        // Custom opcode, but instruction not implemented
        // Could be:
        // 1. Extension not available on this CPU
        // 2. Invalid custom instruction encoding

        // Send SIGILL to process
        force_sig(SIGILL, current);
        return;
    }

    // Not a custom instruction, handle normally
    handle_illegal_instruction(regs, instruction);
}

// Example: User space API for custom extensions
// /sys interface or ioctl for extension availability

static ssize_t custom_ext_show(struct device *dev,
                               struct device_attribute *attr,
                               char *buf) {
    struct custom_ext_state *state = dev_get_drvdata(dev);

    return sprintf(buf, "0x%lx\n", state->available_extensions);
}

// Example: Initialize custom extension support
void init_custom_extensions(void) {
    struct custom_ext_state *state;

    // Allocate state
    state = kmalloc(sizeof(*state), GFP_KERNEL);
    if (!state) {
        return;
    }

    // Detect available extensions
    state->available_extensions = 0;

    if (detect_dsp_extension()) {
        state->available_extensions |= CUSTOM_EXT_DSP;
    }

    if (detect_image_extension()) {
        state->available_extensions |= CUSTOM_EXT_IMAGE;
    }

    // Store in per-CPU data
    this_cpu_write(custom_ext_state, state);

    printk("Custom extensions: 0x%lx\n", state->available_extensions);
}
```

**Explanation**:

- **State management** kernel must save/restore custom extension state
- **Exception handling** handle illegal custom instruction exceptions
- **Extension detection** kernel detects available extensions at boot
- **User API** provide interface for user space to query extensions
- **Per-CPU state** custom state may be per-CPU

## Next Steps

**What** you're ready for next:

After mastering custom extensions, you have completed **Phase 1: RISC-V Architecture Fundamentals**. You should be ready to:

1. **Begin Phase 2** - RISC-V Linux Kernel Architecture
2. **Study Kernel Boot** - RISC-V kernel boot process
3. **Understand Kernel Memory** - RISC-V kernel memory management
4. **Learn Exception Handling** - RISC-V kernel exception handling
5. **Explore Development Environment** - Set up RISC-V development tools

**Where** to go next:

Continue with **Phase 2: RISC-V Linux Kernel Architecture** to learn:

- RISC-V kernel boot process
- RISC-V kernel memory management
- RISC-V page table structure
- RISC-V exception and interrupt handling
- RISC-V kernel entry points

**Why** Phase 2 is important:

Understanding how the Linux kernel is architected for RISC-V is essential before developing kernel code. This phase bridges architecture fundamentals with kernel implementation.

**How** to continue learning:

1. **Study Kernel Code** - Examine RISC-V kernel architecture code
2. **Read Documentation** - Study RISC-V kernel documentation
3. **Set Up Environment** - Prepare RISC-V development environment
4. **Use Debugger** - Debug kernel boot and initialization
5. **Analyze Boot Process** - Trace kernel boot sequence

## Phase 1 Completion Summary

**Congratulations!** You have completed Phase 1: RISC-V Architecture Fundamentals.

**What** you've learned:

✅ RISC-V ISA Introduction (4 lessons)

- RISC-V overview and design philosophy
- Base ISA instruction set
- Standard extensions (M, A, F, D, C)
- Instruction encoding

✅ RISC-V Privilege Levels (4 lessons)

- Privilege levels overview (M, S, U)
- Privilege transitions
- CSR access
- Exception handling

✅ RISC-V Memory Model (4 lessons)

- Memory organization
- Addressing modes
- Memory ordering
- Virtual memory

✅ RISC-V Extensions (4 lessons)

- Vector Extension (RVV)
- Hypervisor Extension
- Cryptographic Extensions
- Custom Extensions

**Total**: 16 lessons covering RISC-V architecture fundamentals.

## Resources

**Official Documentation**:

- [RISC-V ISA Manual](https://github.com/riscv/riscv-isa-manual) - Complete ISA specification
- [RISC-V Custom Extensions](https://riscv.org/technical/specifications/) - Extension guidelines
- [RISC-V Foundation](https://riscv.org/) - Official RISC-V resources

**Kernel Sources**:

- [Linux RISC-V Kernel](https://github.com/torvalds/linux/tree/master/arch/riscv) - Kernel implementation
