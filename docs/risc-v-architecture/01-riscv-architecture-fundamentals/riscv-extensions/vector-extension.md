---
sidebar_position: 1
---

# Vector Extension

Master RISC-V Vector Extension (RVV) that enables Single Instruction Multiple Data (SIMD) processing, essential for high-performance computing, signal processing, and kernel optimizations on RISC-V systems.

## What Is the Vector Extension?

**What**: The RISC-V Vector Extension (RVV) is an ISA extension that provides vector processing capabilities, allowing a single instruction to operate on multiple data elements simultaneously. It supports variable-length vectors and various data types.

**Why**: Understanding the Vector Extension is crucial because:

- **Performance** - Significantly accelerates data-parallel workloads
- **Efficiency** - Single instruction processes multiple data elements
- **Flexibility** - Variable vector length adapts to available hardware
- **Scientific Computing** - Essential for HPC and scientific applications
- **Machine Learning** - Accelerates ML inference and training
- **Kernel Optimization** - Can optimize kernel operations like memory operations

**When**: Vector Extension is used when:

- **Data-Parallel Operations** - Same operation on multiple data elements
- **Scientific Computing** - Matrix operations, FFT, signal processing
- **Media Processing** - Image/video processing, codecs
- **Machine Learning** - Neural network inference and training
- **Cryptography** - Vector-accelerated cryptographic operations
- **Optimization** - Performance-critical kernel code

**How**: Vector Extension works through:

- **Vector Registers** - 32 vector registers (v0-v31)
- **Vector Length** - Variable length set by vtype CSR
- **Element Types** - Supports various integer and floating-point types
- **Masking** - Predicated execution with mask registers
- **Reduction** - Horizontal reduction operations
- **Gather/Scatter** - Scattered memory access patterns

**Where**: Vector Extension is found in:

- **High-Performance RISC-V CPUs** - Many modern RISC-V processors
- **Scientific Computing** - HPC systems and accelerators
- **ML Accelerators** - Machine learning inference units
- **Media Processors** - Audio/video processing systems
- **Kernel Code** - Optimized kernel operations
- **User Libraries** - Optimized math and scientific libraries

## Vector Extension Overview

**What**: Vector Extension provides vector registers and instructions for SIMD processing.

**How**: Vector Extension architecture:

```c
// Example: Vector Extension features
// RVV v1.0 specification provides:
// - 32 vector registers (v0-v31)
// - Variable vector length (VLEN)
// - Configurable element width (SEW)
// - Multiple data types (integer, float)
// - Masking and predication
// - Vector reduction operations

// Vector registers are accessed as:
// v0, v1, v2, ..., v31
// Each register can hold multiple elements

// Example: Vector configuration CSRs
// vtype: Vector type register
//   - vlmul[2:0]: Vector length multiplier (1/8, 1/4, 1/2, 1, 2, 4, 8)
//   - vsew[2:0]: Standard element width (8, 16, 32, 64, 128, 256, 512, 1024 bits)
//   - vta: Vector tail agnostic
//   - vma: Vector mask agnostic
//   - vill: Illegal instruction (if vtype is invalid)

// vlenb: Vector length in bytes (read-only)
// vl: Vector length register (number of elements in current vector)
// vstart: Vector start index (for partial vector operations)

// Example: Checking Vector Extension support
bool has_vector_extension(void) {
    unsigned long misa;

    // Read misa CSR to check extensions
    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    // Check 'V' bit (vector extension)
    return (misa & (1UL << ('V' - 'A'))) != 0;
}

// Example: Configuring vector registers
void configure_vector_registers(void) {
    unsigned long vtype;

    if (!has_vector_extension()) {
        return;  // Vector extension not available
    }

    // Configure vtype:
    // SEW = 32 bits (single precision float)
    // LMUL = 1 (one register per group)
    // vta = 0 (tail elements unchanged)
    // vma = 0 (mask elements unchanged)

    vtype = (0 << 0) |   // LMUL = 1 (encoded as 0)
            (2 << 3) |   // SEW = 32 bits (encoded as 2)
            (0 << 6) |   // vta = 0
            (0 << 7);    // vma = 0

    // Write vtype CSR
    __asm__ volatile("csrw vtype, %0" : : "r"(vtype));

    // Set vector length (vl CSR)
    // Set to maximum available
    unsigned long vlmax;
    __asm__ volatile("csrr %0, vlenb" : "=r"(vlmax));
    __asm__ volatile("csrw vl, %0" : : "r"(vlmax / 4));  // 4 bytes per element
}
```

**Explanation**:

- **Vector registers** 32 vector registers, each holds multiple elements
- **Variable length** vector length configurable via vtype and vl CSRs
- **Element width** configurable via SEW field in vtype
- **CSR configuration** vtype, vl, vstart control vector operations
- **Extension check** check misa CSR for Vector Extension support

## Vector Instructions

**What**: Vector Extension provides instructions for loading, storing, arithmetic, and manipulation operations on vector registers.

**How**: Vector instructions work:

```c
// Example: Vector load instructions
// vle32.v vd, (rs1), vm  // Load vector elements (SEW=32)
// Loads elements from memory starting at address in rs1
// vd: destination vector register
// rs1: base address register
// vm: mask register (v0 by default)

// Example: Loading vector from memory
void vector_load_example(int *array, int size) {
    // Configure vector for 32-bit integers
    set_vector_config(32, 1);  // SEW=32, LMUL=1

    // Load vector from array
    // Inline assembly for vle32.v
    __asm__ volatile(
        "vle32.v v1, (%0)"
        :
        : "r"(array)
        : "v1", "memory"
    );

    // v1 now contains first VL elements from array
}

// Example: Vector store instructions
// vse32.v vs3, (rs1), vm  // Store vector elements
// Stores elements from vector register to memory

void vector_store_example(int *array, int size) {
    // Store vector to array
    __asm__ volatile(
        "vse32.v v1, (%0)"
        :
        : "r"(array)
        : "v1", "memory"
    );
}

// Example: Vector arithmetic operations
// vadd.vv vd, vs1, vs2, vm  // Vector add (vector-vector)
// vadd.vx vd, vs1, rs2, vm  // Vector add (vector-scalar)
// vsub.vv vd, vs1, vs2, vm  // Vector subtract
// vmul.vv vd, vs1, vs2, vm  // Vector multiply

// Example: Vector addition
void vector_add_example(int *a, int *b, int *c, int size) {
    // Load vectors
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(a) : "v1", "memory");
    __asm__ volatile("vle32.v v2, (%0)" :: "r"(b) : "v2", "memory");

    // Add vectors: c = a + b
    __asm__ volatile("vadd.vv v3, v1, v2" :: : "v1", "v2", "v3");

    // Store result
    __asm__ volatile("vse32.v v3, (%0)" :: "r"(c) : "v3", "memory");
}

// Example: Vector multiply-accumulate
// vfmadd.vv vd, vs1, vs2, vm  // Floating-point fused multiply-add

void vector_fma_example(float *a, float *b, float *c, float *result, int size) {
    // Load vectors
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(a) : "v1", "memory");
    __asm__ volatile("vle32.v v2, (%0)" :: "r"(b) : "v2", "memory");
    __asm__ volatile("vle32.v v3, (%0)" :: "r"(c) : "v3", "memory");

    // Fused multiply-add: result = a * b + c
    __asm__ volatile("vfmadd.vv v4, v1, v2" :: : "v1", "v2", "v4");
    __asm__ volatile("vfadd.vv v4, v4, v3" :: : "v3", "v4");

    // Store result
    __asm__ volatile("vse32.v v4, (%0)" :: "r"(result) : "v4", "memory");
}

// Example: Vector reduction
// vredsum.vs vd, vs2, vs1, vm  // Vector sum reduction
// Reduces vector to scalar value

int vector_sum_reduction(int *array, int size) {
    int sum = 0;

    // Configure vector
    set_vector_config(32, 1);

    // Load vector
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(array) : "v1", "memory");

    // Sum reduction: sum = sum of all elements in v1
    __asm__ volatile(
        "vmv.s.x v2, %1\n"      // Initialize accumulator
        "vredsum.vs v2, v1, v2" // Sum reduction
        : "=r"(sum)
        : "r"(0)
        : "v1", "v2"
    );

    return sum;
}
```

**Explanation**:

- **Vector load/store** vle32.v and vse32.v for loading/storing vectors
- **Vector arithmetic** vadd, vsub, vmul for vector operations
- **Element operations** operations apply to all elements in vector
- **Reduction operations** vredsum reduces vector to scalar
- **Masking** operations can be masked using v0 register

## Vector Masking

**What**: Vector masking allows conditional execution of vector operations based on mask registers.

**Why**: Masking is important because:

- **Conditional Operations** - Execute operations only on selected elements
- **Efficiency** - Skip processing of unnecessary elements
- **Control Flow** - Handle if-else conditions in vector code
- **Performance** - Avoid branching in inner loops

**How**: Masking works:

```c
// Example: Vector mask operations
// Mask register (typically v0) controls which elements are processed
// Bit 0 of mask corresponds to element 0, bit 1 to element 1, etc.
// 1 = element processed, 0 = element unchanged/not processed

// Example: Conditional vector addition
void conditional_vector_add(int *a, int *b, int *c, int *mask, int size) {
    // Load mask vector to v0
    __asm__ volatile("vle32.v v0, (%0)" :: "r"(mask) : "v0", "memory");

    // Load data vectors
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(a) : "v1", "memory");
    __asm__ volatile("vle32.v v2, (%0)" :: "r"(b) : "v2", "memory");

    // Masked addition: only elements where mask[i] != 0 are added
    // vadd.vv v3, v1, v2, v0.t  // .t means use mask
    __asm__ volatile("vadd.vv v3, v1, v2, v0.t" :: : "v1", "v2", "v3", "v0");

    // Store result
    __asm__ volatile("vse32.v v3, (%0)" :: "r"(c) : "v3", "memory");
}

// Example: Vector comparison and masking
// vmslt.vv vd, vs1, vs2, vm  // Set mask if vs1 < vs2
// vmsgt.vv vd, vs1, vs2, vm  // Set mask if vs1 > vs2

void vector_compare_mask(int *a, int *b, int threshold) {
    // Load vectors
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(a) : "v1", "memory");

    // Compare: set mask where a[i] > threshold
    // Load threshold to scalar register
    register int thresh asm("x5") = threshold;
    __asm__ volatile("vmsgt.vx v0, v1, %0" :: "r"(thresh) : "v0", "v1");

    // Now v0 contains mask with 1s where a[i] > threshold
}

// Example: Conditional store with mask
void conditional_store(int *array, int *condition, int *result, int size) {
    // Generate mask from condition
    __asm__ volatile("vle32.v v0, (%0)" :: "r"(condition) : "v0", "memory");

    // Load data
    __asm__ volatile("vle32.v v1, (%0)" :: "r"(array) : "v1", "memory");

    // Masked store: only store where mask is 1
    __asm__ volatile("vse32.v v1, (%0), v0.t" :: "r"(result) : "v1", "v0", "memory");
}
```

**Explanation**:

- **Mask register** v0 typically used as mask register
- **Mask bits** each bit controls one vector element
- **Conditional execution** masked operations only affect unmasked elements
- **Comparison masks** comparison instructions can generate masks
- **Masked memory** can use masks for conditional loads/stores

## Practical Vector Examples

**What**: Real-world examples showing how to use Vector Extension for common operations.

**How**: Practical examples:

```c
// Example: Matrix-vector multiplication using vectors
// Result[i] = sum(A[i][j] * x[j]) for all j
void vector_matrix_multiply(float **matrix, float *vector, float *result,
                           int rows, int cols) {
    // Configure vector for single precision
    set_vector_config(32, 1);  // SEW=32 (float), LMUL=1

    for (int i = 0; i < rows; i++) {
        float sum = 0.0f;

        // Process in chunks of vector length
        for (int j = 0; j < cols; j += VL) {
            // Load matrix row chunk
            __asm__ volatile("vle32.v v1, (%0)" ::"r"(matrix[i] + j)
                            : "v1", "memory");

            // Load vector chunk
            __asm__ volatile("vle32.v v2, (%0)" ::"r"(vector + j)
                            : "v2", "memory");

            // Multiply: v3 = v1 * v2
            __asm__ volatile("vfmul.vv v3, v1, v2" :: : "v1", "v2", "v3");

            // Sum reduction: add all elements in v3
            __asm__ volatile(
                "vmv.s.x v4, %1\n"
                "vfredsum.vs v4, v3, v4"
                : "+r"(sum)
                : "r"(sum)
                : "v3", "v4"
            );
        }

        result[i] = sum;
    }
}

// Example: Vectorized memcpy
void vector_memcpy(void *dest, const void *src, size_t n) {
    unsigned char *d = (unsigned char *)dest;
    const unsigned char *s = (const unsigned char *)src;

    // Configure for 64-bit elements (if supported) or 32-bit
    set_vector_config(64, 1);

    size_t i;
    for (i = 0; i + 64 <= n; i += 64) {
        // Load 64 bytes at a time
        __asm__ volatile("vle64.v v1, (%0)" :: "r"(s + i) : "v1", "memory");
        // Store 64 bytes at a time
        __asm__ volatile("vse64.v v1, (%0)" :: "r"(d + i) : "v1", "memory");
    }

    // Handle remainder
    memcpy(d + i, s + i, n - i);
}

// Example: Vector sum of arrays
int vector_array_sum(int *array, int size) {
    int sum = 0;

    set_vector_config(32, 1);

    // Process in vector-sized chunks
    for (int i = 0; i < size; i += VL) {
        // Load chunk
        __asm__ volatile("vle32.v v1, (%0)" :: "r"(array + i)
                       : "v1", "memory");

        // Sum reduction
        __asm__ volatile(
            "vmv.s.x v2, %1\n"
            "vredsum.vs v2, v1, v2"
            : "+r"(sum)
            : "r"(sum)
            : "v1", "v2"
        );
    }

    return sum;
}
```

**Explanation**:

- **Matrix operations** vectors accelerate matrix computations
- **Memory operations** vectors speed up memory copies
- **Reductions** vector reductions compute sums/products efficiently
- **Chunked processing** process data in vector-sized chunks
- **Performance** significant speedup for data-parallel operations

## Kernel Vector Support

**What**: Kernel support for Vector Extension includes saving/restoring vector state during context switches.

**How**: Kernel vector support:

```c
// Example: Saving vector registers in context switch
struct riscv_vstate {
    unsigned long vstart;
    unsigned long vxsat;
    unsigned long vxrm;
    unsigned long vcsr;
    unsigned long vl;
    unsigned long vtype;
    unsigned long vlenb;
    // Vector register file (v0-v31)
    unsigned char vreg[32 * VLENB];
};

// Save vector state on context switch
void save_vector_state(struct riscv_vstate *state) {
    // Save CSRs
    __asm__ volatile("csrr %0, vstart" : "=r"(state->vstart));
    __asm__ volatile("csrr %0, vxsat" : "=r"(state->vxsat));
    __asm__ volatile("csrr %0, vxrm" : "=r"(state->vxrm));
    __asm__ volatile("csrr %0, vcsr" : "=r"(state->vcsr));
    __asm__ volatile("csrr %0, vl" : "=r"(state->vl));
    __asm__ volatile("csrr %0, vtype" : "=r"(state->vtype));

    // Save vector registers
    // vlenb indicates size of each register
    unsigned long vlenb;
    __asm__ volatile("csrr %0, vlenb" : "=r"(vlenb));

    for (int i = 0; i < 32; i++) {
        // Save each vector register
        // Implementation depends on vector length
        // Simplified: save using vse instructions
    }
}

// Restore vector state
void restore_vector_state(struct riscv_vstate *state) {
    // Restore CSRs
    __asm__ volatile("csrw vstart, %0" : : "r"(state->vstart));
    __asm__ volatile("csrw vxsat, %0" : : "r"(state->vxsat));
    __asm__ volatile("csrw vxrm, %0" : : "r"(state->vxrm));
    __asm__ volatile("csrw vcsr, %0" : : "r"(state->vcsr));
    __asm__ volatile("csrw vl, %0" : : "r"(state->vl));
    __asm__ volatile("csrw vtype, %0" : : "r"(state->vtype));

    // Restore vector registers
    // Implementation depends on vector length
}
```

**Explanation**:

- **Context switching** kernel must save/restore vector state
- **Vector CSRs** vstart, vxsat, vxrm, vcsr, vl, vtype must be saved
- **Vector registers** large vector register file must be saved
- **Performance** efficient save/restore critical for performance
- **Lazy save** can use lazy save for rarely-used vector state

## Next Steps

**What** you're ready for next:

After mastering Vector Extension, you should be ready to:

1. **Learn Hypervisor Extension** - Virtualization support in RISC-V
2. **Study Cryptographic Extensions** - Hardware crypto acceleration
3. **Understand Custom Extensions** - Platform-specific extensions
4. **Explore Kernel Architecture** - How kernel uses extensions
5. **Begin Performance Optimization** - Apply vectors for optimization

**Where** to go next:

Continue with the next lesson on **"Hypervisor Extension"** to learn:

- Hypervisor architecture
- Guest mode operation
- Virtualization support
- I/O virtualization
- KVM on RISC-V

**Why** the next lesson is important:

Hypervisor Extension enables virtualization on RISC-V, essential for containerization, virtualization, and cloud computing.

**How** to continue learning:

1. **Study Spec** - Read RISC-V Vector Extension specification
2. **Use Hardware** - Test vectors on RISC-V hardware
3. **Write Code** - Implement vector-accelerated algorithms
4. **Benchmark** - Measure vector performance improvements
5. **Read Kernel Code** - Study kernel vector support code

## Resources

**Official Documentation**:

- [RISC-V Vector Extension Specification](https://github.com/riscv/riscv-v-spec) - Complete vector spec
- [RISC-V Foundation](https://riscv.org/technical/specifications/) - All RISC-V specifications

**Kernel Sources**:

- [Linux RISC-V Vector Support](https://github.com/torvalds/linux/tree/master/arch/riscv) - Kernel vector code
