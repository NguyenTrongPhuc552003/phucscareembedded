---
sidebar_position: 2
---

# Addressing Modes

Master RISC-V addressing modes that determine how instructions calculate memory addresses, essential for understanding memory access patterns and optimizing kernel memory operations.

## What Are Addressing Modes?

**What**: Addressing modes define how instructions specify the memory address of operands. RISC-V uses a load/store architecture where memory is accessed only through load and store instructions using specific addressing modes.

**Why**: Understanding addressing modes is crucial because:

- **Memory Access** - Determines how data in memory is accessed
- **Instruction Encoding** - Addressing modes affect instruction encoding
- **Performance** - Some addressing modes are more efficient
- **Code Generation** - Compilers use addressing modes for optimization
- **Kernel Optimization** - Understanding modes helps optimize kernel code
- **Debugging** - Helps understand memory access patterns

**When**: Addressing modes are used when:

- **Load Operations** - Loading data from memory
- **Store Operations** - Storing data to memory
- **Array Access** - Accessing array elements
- **Structure Access** - Accessing structure fields
- **Pointer Dereferencing** - Following pointers
- **Base+Offset** - Common pattern in all memory access

**How**: Addressing modes work through:

- **Base Register** - Register containing base address
- **Offset/Immediate** - Constant offset value
- **Address Calculation** - Base + offset = effective address
- **Sign Extension** - Offset is sign-extended
- **Alignment** - Addresses must be aligned for word operations

**Where**: Addressing modes are found in:

- **All Load/Store Instructions** - LB, LH, LW, LD, SB, SH, SW, SD
- **Array Indexing** - Array element access uses addressing modes
- **Pointer Arithmetic** - Pointer operations use addressing
- **Structure Access** - Structure field access
- **Kernel Code** - Kernel extensively uses addressing modes

## Base Plus Immediate Offset Addressing

**What**: Base plus immediate offset is the primary addressing mode in RISC-V, used by all load and store instructions.

**Why**: This addressing mode is essential because:

- **Universal** - Used by all memory access instructions
- **Efficient** - Single instruction for base+offset calculation
- **Common Pattern** - Matches common memory access patterns
- **Simple Encoding** - Straightforward instruction encoding
- **Cache-Friendly** - Effective for sequential access patterns

**How**: Base+offset addressing works:

```c
// Example: Base plus immediate offset addressing
// Format: offset(base_register)
// Effective address = base_register + sign_extended(offset)
// Offset is 12-bit signed immediate (-2048 to +2047)

// Load instruction examples:
// lw rd, offset(rs1)
// Effective address = rs1 + sign_extended(offset)

// Example: Loading variable from memory
int load_variable(int *base_ptr, int offset_words) {
    int value;
    int offset_bytes = offset_words * sizeof(int);

    // Assembly: lw rd, offset(rs1)
    // offset_bytes must fit in 12-bit signed immediate
    if (offset_bytes >= -2048 && offset_bytes <= 2047) {
        // Can use single instruction
        value = base_ptr[offset_words];
    } else {
        // Offset too large, need multiple instructions
        // First: load base address
        // Second: add large offset
        // Third: load from calculated address
        int *addr = base_ptr + offset_words;
        value = *addr;
    }
    return value;
}

// Example: Structure field access
struct task_struct {
    pid_t pid;           // offset 0
    unsigned long state; // offset 8 (on 64-bit)
    struct mm_struct *mm; // offset 16
};

void access_task_fields(struct task_struct *task) {
    pid_t pid;
    unsigned long state;
    struct mm_struct *mm;

    // Assembly for pid access:
    // lw a0, 0(a0)  // Load from task + 0
    // Offset is 0, fits in immediate
    pid = task->pid;

    // Assembly for state access:
    // ld a0, 8(a0)  // Load from task + 8
    // Offset is 8, fits in immediate
    state = task->state;

    // Assembly for mm access:
    // ld a0, 16(a0)  // Load from task + 16
    // Offset is 16, fits in immediate
    mm = task->mm;
}

// Example: Array element access
void access_array_elements(int *array, int index) {
    int value;

    // Calculate offset: index * sizeof(int) = index * 4
    // For small indices, offset fits in 12-bit immediate

    if (index >= 0 && index < 512) {
        // Offset fits: index * 4 <= 2044
        // Assembly: lw a0, offset(a1)
        // where offset = index * 4
        value = array[index];
    } else {
        // Large index, need to calculate address first
        // add a2, a1, a0, slli  // a2 = array + index*4
        // lw a0, 0(a2)          // Load from calculated address
        value = array[index];
    }
}

// Example: Stack frame access
void function_with_local_variables(void) {
    int local1 = 10;
    int local2 = 20;
    int local3 = 30;

    // Local variables allocated on stack
    // Stack pointer (sp) is base register

    // Accessing local1 (offset from sp, compiler calculates):
    // lw a0, offset(sp)  // offset calculated by compiler
    // Compiler ensures offset fits in 12-bit immediate

    // Accessing local2:
    // lw a1, offset(sp)

    // Compiler optimizes stack frame layout
    // to minimize instruction count
}

// Example: Large offset handling
void handle_large_offset(unsigned long base, int large_offset) {
    unsigned long value;

    // If offset > 2047 or < -2048, cannot use immediate
    // Need multi-instruction sequence:

    // Method 1: Load base, add large offset, then load
    // ld a1, 0(a0)      // Load base address
    // addi a2, a1, large_offset  // Add offset (if fits)
    // or: li a2, large_offset_high
    //     slli a2, a2, 12
    //     addi a2, a2, large_offset_low
    //     add a2, a1, a2  // Full 32-bit add
    // ld a0, 0(a2)      // Load from calculated address

    // Method 2: Use AUIPC + ADDI + load
    // auipc a1, offset_high    // Add upper immediate to PC
    // addi a1, a1, offset_low  // Add lower immediate
    // add a1, a1, base_reg     // Add base register
    // ld a0, 0(a1)             // Load
}
```

**Explanation**:

- **Base register** contains the base address (rs1 in instruction)
- **12-bit offset** signed immediate value from -2048 to +2047
- **Sign extension** offset is sign-extended before addition
- **Effective address** calculated as base + sign_extended(offset)
- **Large offsets** require multiple instructions if offset doesn't fit

## Register Indirect Addressing

**What**: Register indirect addressing uses a register value directly as a memory address (offset = 0).

**Why**: Register indirect is important because:

- **Pointer Dereferencing** - Common for pointer operations
- **Efficiency** - Fast when base address is in register
- **Flexibility** - Base address can be calculated dynamically
- **Common Pattern** - Frequently used in C code
- **Performance** - Minimal address calculation overhead

**How**: Register indirect works:

```c
// Example: Register indirect addressing (offset = 0)
// lw rd, 0(rs1)  // Load word from address in rs1
// Effective address = rs1 (offset is 0)

// Example: Pointer dereferencing
void pointer_dereference(int *ptr) {
    int value;

    // Assembly: lw a0, 0(a0)
    // Load from address in pointer register
    // Offset is 0 (implicit in C)
    value = *ptr;
}

// Example: Function pointer call
typedef void (*func_ptr_t)(void);

void call_function_pointer(func_ptr_t func) {
    // Load function pointer (register indirect)
    // jalr ra, 0(a0)  // Jump to address in a0
    func();
}

// Example: Array access via pointer
void iterate_array(int *array, int size) {
    int *ptr = array;

    for (int i = 0; i < size; i++) {
        // ptr contains current address
        // Assembly: lw a0, 0(a1)  // Load from ptr
        int value = *ptr;

        // Increment pointer
        // Assembly: addi a1, a1, 4  // ptr += 4
        ptr++;
    }
}

// Example: Linked list traversal
struct list_node {
    int data;
    struct list_node *next;
};

void traverse_list(struct list_node *head) {
    struct list_node *current = head;

    while (current != NULL) {
        // Access current node data
        // lw a0, 0(a1)  // Load data from current
        int data = current->data;

        // Load next pointer (register indirect)
        // ld a1, 8(a1)  // Load next from current + 8
        current = current->next;
    }
}
```

**Explanation**:

- **Zero offset** register indirect uses offset = 0 explicitly or implicitly
- **Pointer dereference** standard way to access pointer targets
- **Dynamic addressing** address calculated at runtime
- **Performance** very efficient, single instruction
- **Common usage** most pointer operations use this mode

## Scaled Index Addressing

**What**: Scaled index addressing calculates address using base + (index \* scale). RISC-V doesn't have scaled index instructions, so it's implemented with multiple instructions.

**Why**: Scaled addressing is useful because:

- **Array Access** - Natural for array indexing
- **Structure Arrays** - Accessing array of structures
- **Code Generation** - Compilers generate this pattern
- **Optimization** - Can be optimized for power-of-2 scales

**How**: Scaled addressing works:

```c
// Example: Scaled index addressing (multi-instruction)
// RISC-V doesn't have single-instruction scaled addressing
// Must calculate: base + (index * scale) manually

// Example: Array element access
int get_array_element(int *array, int index) {
    int value;

    // Calculate address: array + (index * sizeof(int))
    // sizeof(int) = 4, so multiply index by 4

    // Assembly sequence:
    // slli a2, a1, 2      // index * 4 (shift left by 2)
    // add a2, a0, a2      // array + (index * 4)
    // lw a0, 0(a2)        // Load from calculated address

    value = array[index];
    return value;
}

// Example: Two-dimensional array access
int get_2d_element(int *array, int row, int col, int cols_per_row) {
    int value;

    // Address calculation: array + (row * cols_per_row + col) * sizeof(int)
    // Assembly:
    // mul a3, a1, a2      // row * cols_per_row
    // add a3, a3, a3      // Multiply by sizeof(int) = 4
    // slli a3, a3, 2      // Or use shift
    // add a4, a0, a3      // array + row_offset
    // slli a5, a3, 2      // col * 4
    // add a4, a4, a5      // Add col offset
    // lw a0, 0(a4)        // Load element

    value = array[row * cols_per_row + col];
    return value;
}

// Example: Structure array access
struct page {
    unsigned long flags;
    unsigned long count;
};

struct page *get_page_from_array(struct page *pages, int index) {
    struct page *page;

    // Address: pages + (index * sizeof(struct page))
    // sizeof(struct page) = 16 (on 64-bit)

    // Assembly:
    // slli a2, a1, 4      // index * 16 (shift left by 4)
    // add a2, a0, a2      // pages + offset
    // Result in a2 (pointer to page)

    page = &pages[index];
    return page;
}

// Example: Optimized power-of-2 scaling
int get_power_of_2_element(int *array, int index, int scale_power) {
    int value;

    // If scale is power of 2, use shift instead of multiply
    // scale = 2^scale_power

    // Assembly:
    // slli a2, a1, scale_power  // index << scale_power (faster than multiply)
    // add a2, a0, a2            // array + offset
    // lw a0, 0(a2)              // Load

    // Compiler optimizes: array[index * 8] when 8 is compile-time constant
    // Uses: slli a2, a1, 3  // *8 = <<3

    value = array[index << scale_power];
    return value;
}

// Example: Non-power-of-2 scaling (needs multiply)
int get_non_power_element(int *array, int index) {
    int value;

    // If scale is not power of 2, need multiply
    // scale = 7 for example

    // Assembly:
    // li a2, 7              // Load scale constant
    // mul a2, a1, a2        // index * 7
    // slli a2, a2, 2        // Multiply by sizeof(int)
    // add a2, a0, a2        // array + offset
    // lw a0, 0(a2)          // Load

    // Or more efficient for small constants:
    // slli a2, a1, 3        // index * 8
    // sub a2, a2, a1        // index * 8 - index = index * 7
    // slli a2, a2, 2        // * sizeof(int)
    // add a2, a0, a2
    // lw a0, 0(a2)

    value = array[index * 7];
    return value;
}
```

**Explanation**:

- **Multi-instruction** scaled addressing requires multiple RISC-V instructions
- **Shift for power-of-2** use shift instruction for powers of 2 (faster)
- **Multiply for others** use MUL instruction for non-power-of-2 scales
- **Compiler optimization** compiler chooses best instruction sequence
- **Array indexing** natural pattern for array access

## Immediate Addressing

**What**: Immediate addressing uses a constant value directly encoded in the instruction, not as a memory address but as an operand.

**Why**: Immediate addressing is important because:

- **Constants** - Efficient way to use constant values
- **Performance** - No memory access needed
- **Common Values** - Small constants are frequently used
- **Instruction Efficiency** - Avoids loading constants from memory
- **Code Size** - Reduces code size by avoiding constant loads

**How**: Immediate addressing works:

```c
// Example: Immediate addressing in arithmetic
// ADDI rd, rs1, imm  // rd = rs1 + sign_extended(imm)
// Immediate value encoded directly in instruction

// Example: Using immediate values
void use_immediate_values(int base) {
    int result;

    // Small constants use immediate addressing
    // Assembly: addi a0, a1, 42
    // Constant 42 encoded in instruction
    result = base + 42;

    // More examples:
    // addi a0, a1, -10  // Negative immediate
    // andi a0, a1, 0xFF  // Immediate AND
    // ori a0, a1, 0x100  // Immediate OR
    // xori a0, a1, 0xFF  // Immediate XOR

    result = base & 0xFF;  // Immediate AND
    result = base | 0x100; // Immediate OR
}

// Example: Large immediate values (requires multiple instructions)
void use_large_immediate(int base) {
    int result;
    unsigned long large_value = 0x12345678;

    // 32-bit immediate doesn't fit in 12-bit immediate field
    // Need multiple instructions:

    // Method 1: LUI + ADDI
    // lui a2, 0x12345     // Load upper 20 bits
    // addi a2, a2, 0x678  // Add lower 12 bits

    // Method 2: LUI + ADDI + SLLI + ADDI (for full 32-bit)

    result = base + large_value;
}

// Example: LUI (Load Upper Immediate) instruction
void load_upper_immediate(void) {
    unsigned long value;

    // LUI loads upper 20 bits of immediate into register
    // LUI rd, imm20  // rd[31:12] = imm20, rd[11:0] = 0

    // Example: Load 0x12345000
    // lui a0, 0x12345  // a0 = 0x12345000

    // Often combined with ADDI for full 32-bit value
    // lui a0, 0x12345
    // addi a0, a0, 0x678  // a0 = 0x12345678

    value = 0x12345000;
}

// Example: PC-relative addressing with immediate
void use_pc_relative(void) {
    unsigned long address;

    // AUIPC (Add Upper Immediate to PC)
    // auipc rd, imm20  // rd = PC + (imm20 << 12)

    // Used for position-independent code
    // Example: Load address relative to PC
    // auipc a0, 0      // a0 = PC + 0x00000
    // addi a0, a0, offset  // a0 = PC + offset

    // Common pattern for loading global variables in PIC code
    extern int global_var;
    address = (unsigned long)&global_var;
}
```

**Explanation**:

- **12-bit immediate** most instructions use 12-bit signed immediate
- **Sign extension** immediate is sign-extended before use
- **Large values** LUI + ADDI combination for larger immediates
- **PC-relative** AUIPC enables position-independent code
- **Performance** immediates avoid memory load for constants

## Effective Address Calculation

**What**: Effective address calculation determines the final memory address used by load/store instructions.

**How**: Address calculation works:

```c
// Example: Effective address calculation pipeline
// 1. Instruction fetch and decode
// 2. Read base register (rs1)
// 3. Sign-extend immediate offset
// 4. Calculate: effective_addr = rs1 + sign_extended(offset)
// 5. Address translation (if virtual memory enabled)
// 6. Memory access

// Example: Address calculation function
unsigned long calculate_effective_address(unsigned long base_reg,
                                         int16_t offset) {
    unsigned long effective_addr;

    // Sign extend 12-bit offset to 64 bits
    int64_t offset_sext;
    if (offset & 0x800) {
        // Negative: sign extend with 1s
        offset_sext = (int64_t)(offset | 0xFFFFFFFFFFFFF000);
    } else {
        // Positive: zero extend
        offset_sext = (int64_t)offset;
    }

    // Calculate effective address
    effective_addr = base_reg + offset_sext;

    return effective_addr;
}

// Example: Address calculation in memory access
void simulate_memory_access(unsigned long base, int offset, bool is_load) {
    unsigned long effective_addr;
    unsigned long value;

    // Step 1: Calculate effective address
    effective_addr = calculate_effective_address(base, offset);

    // Step 2: Check alignment (for word/doubleword access)
    if (is_load && (effective_addr & 0x3) != 0) {
        // Misaligned access - may cause exception
        handle_misaligned_access(effective_addr);
        return;
    }

    // Step 3: Address translation (virtual to physical)
    // If virtual memory enabled:
    // effective_addr -> physical_addr via page table walk

    // Step 4: Perform memory access
    if (is_load) {
        value = load_from_memory(effective_addr);
    } else {
        store_to_memory(effective_addr, value);
    }
}

// Example: Address calculation for array indexing
unsigned long calculate_array_address(int *base, int index) {
    unsigned long base_addr = (unsigned long)base;
    int offset_bytes = index * sizeof(int);

    // Check if offset fits in 12-bit immediate
    if (offset_bytes >= -2048 && offset_bytes <= 2047) {
        // Can use single instruction: lw rd, offset(rs1)
        return base_addr + offset_bytes;
    } else {
        // Need multi-instruction calculation
        // Won't fit in immediate, must calculate separately
        return base_addr + offset_bytes;
    }
}

// Example: Address alignment checking
bool is_address_aligned(unsigned long addr, int alignment) {
    // Check if address is aligned to alignment boundary
    return (addr % alignment) == 0;
}

// Example: Aligned address calculation
unsigned long align_address(unsigned long addr, int alignment) {
    // Align address up to alignment boundary
    return (addr + alignment - 1) & ~(alignment - 1);
}

// Example: Kernel address calculation helpers
unsigned long kernel_virt_to_phys(unsigned long virt) {
    // Kernel uses direct mapping
    // Physical = Virtual - KERNEL_VIRT_START
    if (is_kernel_address(virt)) {
        return virt - KERNEL_VIRT_START;
    }
    return 0;  // Invalid
}

unsigned long phys_to_kernel_virt(unsigned long phys) {
    // Kernel direct mapping
    return KERNEL_VIRT_START + phys;
}
```

**Explanation**:

- **Calculation steps** effective address = base + sign_extended(offset)
- **Sign extension** 12-bit offset sign-extended to full register width
- **Alignment checks** addresses must be aligned for certain operations
- **Address translation** effective address may be virtual, needs translation
- **Overflow handling** address calculation may overflow (handled by hardware)

## Addressing Mode Optimization

**What**: Optimizing addressing mode usage improves code performance and size.

**How**: Optimizations work:

```c
// Example: Optimizing for 12-bit immediate range
void optimize_offset_usage(struct large_struct *base, int field_index) {
    // Large structure, fields may be beyond 12-bit offset range

    // Instead of:
    // ld a0, large_offset(base)  // If offset > 2047, requires multiple instructions

    // Optimize: Keep pointer to commonly accessed field
    struct large_struct *current = base;
    void *field_ptr = &current->frequently_accessed_field;

    // Now access via zero offset:
    // ld a0, 0(a1)  // Single instruction
    int value = *(int *)field_ptr;
}

// Example: Register allocation for addressing
void optimize_register_usage(int *array, int size) {
    // Keep array base in register throughout loop
    // Good register allocation reduces address calculations

    // Optimized loop:
    int *ptr = array;  // Base in register
    int *end = array + size;

    while (ptr < end) {
        // Access via zero offset (register indirect)
        // lw a0, 0(a1)     // Load from ptr
        // addi a1, a1, 4   // Increment ptr
        int value = *ptr++;
    }
}

// Example: Using immediate for small constants
void optimize_constant_access(void) {
    int value = 0;

    // Instead of loading constant from memory:
    // lui a0, constant_high
    // addi a0, a0, constant_low

    // Use immediate directly if constant is small:
    // addi a0, x0, 42  // Immediate, no memory access

    value = 42;  // Compiler uses immediate if possible

    // For constants in range [-2048, 2047], use immediate
    value = 100;   // Uses immediate
    value = -100;  // Uses immediate
    value = 2047;  // Uses immediate
    value = 3000;  // Too large, needs LUI+ADDI
}
```

**Explanation**:

- **Offset range** keep offsets within 12-bit range when possible
- **Register allocation** keep base addresses in registers
- **Immediate usage** use immediate addressing for small constants
- **Pointer maintenance** maintain pointers for sequential access
- **Compiler optimization** compiler applies these optimizations automatically

## Next Steps

**What** you're ready for next:

After mastering addressing modes, you should be ready to:

1. **Learn Memory Ordering** - Memory consistency and ordering rules
2. **Study Virtual Memory** - Page-based virtual memory system
3. **Understand Cache Behavior** - How addressing affects cache
4. **Explore Optimization** - Further memory access optimizations
5. **Begin Memory Management** - Apply addressing knowledge

**Where** to go next:

Continue with the next lesson on **"Memory Ordering"** to learn:

- Memory consistency models
- Memory barriers
- Load/store ordering
- Atomic operations ordering
- Cache coherency

**Why** the next lesson is important:

Memory ordering is critical for multi-core systems and concurrent programming. Understanding memory ordering is essential for correct kernel code.

**How** to continue learning:

1. **Study Spec** - Read RISC-V memory ordering specification
2. **Analyze Kernel Code** - See memory ordering in kernel
3. **Use Tools** - Analyze memory ordering with tools
4. **Write Tests** - Test memory ordering behavior
5. **Read Documentation** - Study memory ordering documentation

## Resources

**Official Documentation**:

- [RISC-V ISA Manual - Memory Model](https://github.com/riscv/riscv-isa-manual) - Memory ordering specification
- [RISC-V Memory Consistency Model](https://github.com/riscv/riscv-isa-manual/blob/master/src/memory.tex) - Detailed ordering rules

**Kernel Sources**:

- [Linux RISC-V Memory Code](https://github.com/torvalds/linux/tree/master/arch/riscv/mm) - Kernel memory implementation
