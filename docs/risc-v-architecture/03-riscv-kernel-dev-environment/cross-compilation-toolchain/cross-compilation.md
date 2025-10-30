---
sidebar_position: 3
---

# Cross-Compilation

Master the art of cross-compilation for RISC-V, learning how to build programs on your host system that will run on RISC-V targets with practical examples and advanced techniques.

## What is Cross-Compilation?

**What**: Cross-compilation is the process of building executable programs on one architecture (host) that will run on a different architecture (target). In the context of RISC-V, this means compiling programs on x86_64 Linux hosts that will execute on RISC-V systems.

**Why**: Cross-compilation is essential because:

- **Architecture Mismatch** - Most development workstations use x86_64, while RISC-V targets are different
- **Performance** - Compiling on powerful x86_64 hosts is much faster than on RISC-V targets
- **Development Efficiency** - Enables rapid iteration without requiring RISC-V hardware
- **CI/CD Integration** - Allows automated builds in cloud environments
- **Cost Effectiveness** - Reduces need for expensive RISC-V development hardware
- **Scalability** - Enables building for multiple RISC-V variants from single host

**When**: Use cross-compilation when:

- **Kernel Development** - Building Linux kernel for RISC-V platforms
- **Embedded Development** - Creating firmware and bootloaders
- **User Space Applications** - Developing applications for RISC-V systems
- **Testing and Validation** - Running automated tests before deployment
- **Educational Purposes** - Learning RISC-V architecture and programming
- **Production Deployment** - Building release binaries for RISC-V systems

**How**: Cross-compilation works by:

- **Target Specification** - Using specific target triplets (e.g., riscv64-linux-gnu)
- **Cross-Compiler** - Compiler that generates code for target architecture
- **Cross-Linker** - Linker that creates target-specific executables
- **Target Libraries** - Libraries compiled for target architecture
- **Sysroot** - Target system root directory with headers and libraries

**Where**: Cross-compilation is used in:

- **Development Workstations** - Local development environments
- **Build Servers** - Continuous integration and deployment systems
- **Cloud Environments** - Scalable build infrastructure
- **Embedded Development** - IoT and embedded system development
- **Academic Research** - University and research institution projects

## Cross-Compilation Fundamentals

### Target Triplets

**What**: Target triplets specify the target architecture, vendor, and operating system.

**Format**: `architecture-vendor-operatingsystem`

**Common RISC-V Triplets**:

| Triplet           | Architecture | Vendor | OS        | Description       |
| ----------------- | ------------ | ------ | --------- | ----------------- |
| riscv64-linux-gnu | riscv64      | (none) | linux-gnu | 64-bit Linux      |
| riscv32-linux-gnu | riscv32      | (none) | linux-gnu | 32-bit Linux      |
| riscv64-elf       | riscv64      | (none) | elf       | 64-bit bare metal |
| riscv32-elf       | riscv32      | (none) | elf       | 32-bit bare metal |

**Usage Examples**:

```bash
# Check target triplet
riscv64-linux-gnu-gcc -dumpmachine

# Expected output: riscv64-linux-gnu

# Compile for specific target
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program program.c

# Compile for bare metal
riscv64-elf-gcc -march=rv64gc -mabi=lp64d -nostdlib -o program program.c
```

### Cross-Compiler Configuration

**What**: Cross-compiler configuration involves setting up the compiler to generate code for the target architecture.

**Key Configuration Options**:

```bash
# Basic cross-compilation
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program program.c

# With optimization
riscv64-linux-gnu-gcc -O2 -march=rv64gc -mabi=lp64d -o program program.c

# With debugging information
riscv64-linux-gnu-gcc -g -march=rv64gc -mabi=lp64d -o program program.c

# Static linking
riscv64-linux-gnu-gcc -static -march=rv64gc -mabi=lp64d -o program program.c

# Dynamic linking
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program program.c
```

**Architecture-Specific Options**:

```bash
# RISC-V architecture options
-march=rv64gc    # Target architecture (64-bit with G and C extensions)
-mabi=lp64d      # Application Binary Interface
-mcmodel=medany  # Code model for addressing
-mrelax          # Enable linker relaxation
-mno-relax       # Disable linker relaxation

# Available march options:
# rv32i, rv32e, rv32im, rv32imc, rv32ima, rv32imaf, rv32imafc
# rv64i, rv64im, rv64imc, rv64ima, rv64imaf, rv64imafc, rv64imafdc
# rv64g (equivalent to rv64imafdc)
# rv64gc (equivalent to rv64imafdc + compressed instructions)

# Available mabi options:
# ilp32, ilp32f, ilp32d (32-bit)
# lp64, lp64f, lp64d (64-bit)
```

### Sysroot Configuration

**What**: Sysroot is the target system root directory containing headers, libraries, and other target-specific files.

**Setting Sysroot**:

```bash
# Set sysroot explicitly
riscv64-linux-gnu-gcc --sysroot=/opt/riscv/sysroot -o program program.c

# Check sysroot
riscv64-linux-gnu-gcc -print-sysroot

# Expected output: /opt/riscv/sysroot
```

**Sysroot Structure**:

```
sysroot/
├── lib/                    # Target libraries
│   ├── riscv64-linux-gnu/
│   │   ├── libc.so.6
│   │   ├── libm.so.6
│   │   └── libpthread.so.0
│   └── gcc/riscv64-linux-gnu/
│       └── 12.2.0/
├── usr/
│   ├── include/            # Header files
│   │   ├── stdio.h
│   │   ├── stdlib.h
│   │   └── sys/
│   └── lib/                # Additional libraries
└── etc/                    # Configuration files
```

## Practical Cross-Compilation Examples

### Example 1: Simple C Program

**Source Code**:

```c
// hello_riscv.c
#include <stdio.h>
#include <stdlib.h>

int main() {
    printf("Hello, RISC-V World!\n");
    printf("Architecture: %s\n", "riscv64");
    printf("ABI: %s\n", "lp64d");

    return 0;
}
```

**Compilation**:

```bash
# Basic compilation
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o hello_riscv hello_riscv.c

# With optimization
riscv64-linux-gnu-gcc -O2 -march=rv64gc -mabi=lp64d -o hello_riscv hello_riscv.c

# With debugging information
riscv64-linux-gnu-gcc -g -march=rv64gc -mabi=lp64d -o hello_riscv hello_riscv.c

# Static linking
riscv64-linux-gnu-gcc -static -march=rv64gc -mabi=lp64d -o hello_riscv hello_riscv.c
```

**Verification**:

```bash
# Check binary architecture
file hello_riscv

# Expected output:
# hello_riscv: ELF 64-bit LSB executable, UCB RISC-V, version 1 (SYSV), dynamically linked, interpreter /lib/ld-linux-riscv64-lp64d.so.1, for GNU/Linux 4.15.0, not stripped

# Check RISC-V specific details
riscv64-linux-gnu-readelf -h hello_riscv

# Expected output:
# ELF Header:
#   Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
#   Class:                             ELF64
#   Data:                              2's complement, little endian
#   Version:                           1 (current)
#   OS/ABI:                            UNIX - System V
#   ABI Version:                       0
#   Type:                              EXEC (Executable file)
#   Machine:                           RISC-V
#   Version:                           0x1
#   Entry point address:               0x100b0
#   Start of program headers:          64 (bytes into file)
#   Number of section headers:         0 (There is no section header table)
#   Size of section headers:           0 (bytes)
#   Number of program headers:         8
#   Size of program headers:           56 (bytes)
#   Flags:                             0x5, RVC, double-float ABI
#   Size of this header:               64 (bytes)
#   Size of program headers:           56 (bytes)
#   Number of section headers:         0 (There is no section header table)
#   Size of program headers:           56 (bytes)
```

### Example 2: Multi-File Project

**Source Files**:

```c
// main.c
#include <stdio.h>
#include "math_utils.h"

int main() {
    int a = 10, b = 20;
    int sum = add(a, b);
    int product = multiply(a, b);

    printf("Sum: %d\n", sum);
    printf("Product: %d\n", product);

    return 0;
}
```

```c
// math_utils.c
#include "math_utils.h"

int add(int a, int b) {
    return a + b;
}

int multiply(int a, int b) {
    return a * b;
}
```

```c
// math_utils.h
#ifndef MATH_UTILS_H
#define MATH_UTILS_H

int add(int a, int b);
int multiply(int a, int b);

#endif
```

**Compilation**:

```bash
# Compile object files
riscv64-linux-gnu-gcc -c -march=rv64gc -mabi=lp64d -o main.o main.c
riscv64-linux-gnu-gcc -c -march=rv64gc -mabi=lp64d -o math_utils.o math_utils.c

# Link object files
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program main.o math_utils.o

# Or compile and link in one step
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program main.c math_utils.c
```

### Example 3: Library Usage

**Source Code**:

```c
// math_program.c
#include <stdio.h>
#include <math.h>
#include <pthread.h>

void *calculate_sqrt(void *arg) {
    double *value = (double *)arg;
    double result = sqrt(*value);
    printf("Square root of %.2f is %.2f\n", *value, result);
    return NULL;
}

int main() {
    double values[] = {4.0, 9.0, 16.0, 25.0};
    pthread_t threads[4];

    for (int i = 0; i < 4; i++) {
        pthread_create(&threads[i], NULL, calculate_sqrt, &values[i]);
    }

    for (int i = 0; i < 4; i++) {
        pthread_join(threads[i], NULL);
    }

    return 0;
}
```

**Compilation**:

```bash
# Compile with math and pthread libraries
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o math_program math_program.c -lm -lpthread

# Static linking
riscv64-linux-gnu-gcc -static -march=rv64gc -mabi=lp64d -o math_program math_program.c -lm -lpthread
```

### Example 4: Assembly Integration

**C Source**:

```c
// assembly_test.c
#include <stdio.h>

// Assembly function declaration
extern int assembly_add(int a, int b);
extern int assembly_multiply(int a, int b);

int main() {
    int a = 10, b = 20;

    int sum = assembly_add(a, b);
    int product = assembly_multiply(a, b);

    printf("Assembly add: %d\n", sum);
    printf("Assembly multiply: %d\n", product);

    return 0;
}
```

**Assembly Source**:

```assembly
# assembly_functions.s
.section .text
.global assembly_add
.global assembly_multiply

assembly_add:
    add a0, a0, a1    # a0 = a0 + a1
    ret               # return a0

assembly_multiply:
    mul a0, a0, a1    # a0 = a0 * a1
    ret               # return a0
```

**Compilation**:

```bash
# Compile assembly
riscv64-linux-gnu-as -march=rv64gc -mabi=lp64d -o assembly_functions.o assembly_functions.s

# Compile C
riscv64-linux-gnu-gcc -c -march=rv64gc -mabi=lp64d -o assembly_test.o assembly_test.c

# Link together
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o assembly_test assembly_test.o assembly_functions.o
```

## Advanced Cross-Compilation Techniques

### Conditional Compilation

**What**: Using preprocessor directives to compile different code for different architectures.

**Example**:

```c
// cross_platform.c
#include <stdio.h>

#ifdef __riscv
    #define ARCH_NAME "RISC-V"
    #define ARCH_BITS 64
#elif defined(__x86_64__)
    #define ARCH_NAME "x86_64"
    #define ARCH_BITS 64
#elif defined(__aarch64__)
    #define ARCH_NAME "ARM64"
    #define ARCH_BITS 64
#else
    #define ARCH_NAME "Unknown"
    #define ARCH_BITS 0
#endif

int main() {
    printf("Architecture: %s\n", ARCH_NAME);
    printf("Bits: %d\n", ARCH_BITS);

    #ifdef __riscv
        printf("RISC-V specific code\n");
    #endif

    return 0;
}
```

**Compilation**:

```bash
# Compile for RISC-V
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o cross_platform_riscv cross_platform.c

# Compile for x86_64
gcc -o cross_platform_x86_64 cross_platform.c
```

### Cross-Compilation with CMake

**What**: Using CMake for cross-compilation with proper toolchain files.

**Toolchain File**:

```cmake
# riscv64-linux-gnu.cmake
set(CMAKE_SYSTEM_NAME Linux)
set(CMAKE_SYSTEM_PROCESSOR riscv64)

# Set compiler
set(CMAKE_C_COMPILER riscv64-linux-gnu-gcc)
set(CMAKE_CXX_COMPILER riscv64-linux-gnu-g++)

# Set flags
set(CMAKE_C_FLAGS "-march=rv64gc -mabi=lp64d")
set(CMAKE_CXX_FLAGS "-march=rv64gc -mabi=lp64d")

# Set sysroot
set(CMAKE_SYSROOT /opt/riscv/sysroot)

# Set find paths
set(CMAKE_FIND_ROOT_PATH /opt/riscv/sysroot)
set(CMAKE_FIND_ROOT_PATH_MODE_PROGRAM NEVER)
set(CMAKE_FIND_ROOT_PATH_MODE_LIBRARY ONLY)
set(CMAKE_FIND_ROOT_PATH_MODE_INCLUDE ONLY)
```

**CMakeLists.txt**:

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.16)
project(cross_compile_project)

# Add executable
add_executable(hello hello.c)

# Add library
add_library(math_utils STATIC math_utils.c)

# Link libraries
target_link_libraries(hello math_utils)

# Set properties
set_target_properties(hello PROPERTIES
    OUTPUT_NAME "hello_riscv"
    COMPILE_FLAGS "-O2 -g"
)
```

**Build Process**:

```bash
# Configure with toolchain file
cmake -DCMAKE_TOOLCHAIN_FILE=riscv64-linux-gnu.cmake -B build

# Build
cmake --build build

# Or use make
cd build && make
```

### Cross-Compilation with Autotools

**What**: Using Autotools for cross-compilation with proper configuration.

**configure.ac**:

```autoconf
# configure.ac
AC_INIT([cross_compile_project], [1.0])
AM_INIT_AUTOMAKE([-Wall -Werror foreign])

# Check for RISC-V toolchain
AC_PROG_CC
AC_CHECK_TOOL([RISC_V_CC], [riscv64-linux-gnu-gcc])
AC_CHECK_TOOL([RISC_V_CXX], [riscv64-linux-gnu-g++])
AC_CHECK_TOOL([RISC_V_LD], [riscv64-linux-gnu-ld])

# Set RISC-V flags
if test "$RISC_V_CC" != ""; then
    CC="$RISC_V_CC"
    CXX="$RISC_V_CXX"
    LD="$RISC_V_LD"
    CFLAGS="$CFLAGS -march=rv64gc -mabi=lp64d"
    CXXFLAGS="$CXXFLAGS -march=rv64gc -mabi=lp64d"
fi

# Check for libraries
AC_CHECK_LIB([m], [sqrt])
AC_CHECK_LIB([pthread], [pthread_create])

AC_OUTPUT([Makefile])
```

**Makefile.am**:

```makefile
# Makefile.am
bin_PROGRAMS = hello

hello_SOURCES = hello.c math_utils.c
hello_LDADD = -lm -lpthread
hello_CFLAGS = -O2 -g
```

**Build Process**:

```bash
# Generate configure script
autoreconf -fiv

# Configure for RISC-V
./configure --host=riscv64-linux-gnu

# Build
make

# Install
make install
```

## Debugging Cross-Compiled Programs

### Remote Debugging

**What**: Debugging cross-compiled programs on the target system from the host.

**Setup**:

```bash
# On target system (RISC-V)
gdbserver :1234 ./program

# On host system (x86_64)
riscv64-linux-gnu-gdb ./program
(gdb) target remote 192.168.1.100:1234
(gdb) break main
(gdb) continue
```

**GDB Configuration**:

```gdb
# .gdbinit for RISC-V
set architecture riscv:rv64
set endian little
set osabi gnu-linux

# Set sysroot
set sysroot /opt/riscv/sysroot

# Set solib-search-path
set solib-search-path /opt/riscv/sysroot/lib
```

### Core Dump Analysis

**What**: Analyzing core dumps from RISC-V programs.

**Setup**:

```bash
# Enable core dumps
ulimit -c unlimited

# Run program (it will crash and generate core dump)
./program

# Analyze core dump
riscv64-linux-gnu-gdb ./program core
```

**Analysis Commands**:

```gdb
# Basic analysis
(gdb) bt                    # Backtrace
(gdb) info registers        # Show registers
(gdb) x/10x $sp            # Examine stack
(gdb) disassemble main      # Disassemble main function

# RISC-V specific
(gdb) info all-registers    # Show all RISC-V registers
(gdb) maintenance print reggroups  # Show register groups
```

### Static Analysis

**What**: Analyzing cross-compiled programs without execution.

**Tools**:

```bash
# Check binary architecture
file program

# Check symbols
riscv64-linux-gnu-nm program

# Check dependencies
riscv64-linux-gnu-readelf -d program

# Check sections
riscv64-linux-gnu-objdump -h program

# Disassemble
riscv64-linux-gnu-objdump -d program
```

## Performance Optimization

### Compiler Optimizations

**What**: Using compiler optimizations to improve performance of cross-compiled programs.

**Optimization Levels**:

```bash
# No optimization (fastest compilation)
riscv64-linux-gnu-gcc -O0 -march=rv64gc -mabi=lp64d -o program program.c

# Basic optimization
riscv64-linux-gnu-gcc -O1 -march=rv64gc -mabi=lp64d -o program program.c

# Standard optimization (recommended)
riscv64-linux-gnu-gcc -O2 -march=rv64gc -mabi=lp64d -o program program.c

# Aggressive optimization
riscv64-linux-gnu-gcc -O3 -march=rv64gc -mabi=lp64d -o program program.c

# Optimize for size
riscv64-linux-gnu-gcc -Os -march=rv64gc -mabi=lp64d -o program program.c

# Optimize for speed with fast math
riscv64-linux-gnu-gcc -Ofast -march=rv64gc -mabi=lp64d -o program program.c
```

**RISC-V Specific Optimizations**:

```bash
# Enable compressed instructions
riscv64-linux-gnu-gcc -march=rv64gc -mabi=lp64d -o program program.c

# Enable linker relaxation
riscv64-linux-gnu-gcc -mrelax -march=rv64gc -mabi=lp64d -o program program.c

# Use specific code model
riscv64-linux-gnu-gcc -mcmodel=medany -march=rv64gc -mabi=lp64d -o program program.c
```

### Linker Optimizations

**What**: Using linker optimizations to improve program size and performance.

**Optimization Options**:

```bash
# Remove unused sections
riscv64-linux-gnu-ld --gc-sections -o program program.o

# Strip debug symbols
riscv64-linux-gnu-strip program

# Optimize for specific RISC-V features
riscv64-linux-gnu-gcc -ffast-math -march=rv64gc -mabi=lp64d -o program program.c
```

## Troubleshooting Cross-Compilation Issues

### Common Issues

**Problem**: Wrong target architecture

**Solution**:

```bash
# Check target
riscv64-linux-gnu-gcc -dumpmachine

# Should output: riscv64-linux-gnu
```

**Problem**: Missing libraries

**Solution**:

```bash
# Check library path
riscv64-linux-gnu-gcc -print-search-dirs

# Set library path
export LD_LIBRARY_PATH="/opt/riscv/lib:$LD_LIBRARY_PATH"
```

**Problem**: Wrong ABI

**Solution**:

```bash
# Check ABI
riscv64-linux-gnu-readelf -h program

# Recompile with correct ABI
riscv64-linux-gnu-gcc -mabi=lp64d
```

**Problem**: Missing headers

**Solution**:

```bash
# Check include path
riscv64-linux-gnu-gcc -print-sysroot

# Set sysroot
riscv64-linux-gnu-gcc --sysroot=/opt/riscv/sysroot
```

### Debugging Techniques

**What**: Techniques for debugging cross-compilation issues.

**Verbose Compilation**:

```bash
# Verbose compilation
riscv64-linux-gnu-gcc -v -march=rv64gc -mabi=lp64d -o program program.c

# Show preprocessor output
riscv64-linux-gnu-gcc -E -march=rv64gc -mabi=lp64d program.c

# Show assembly output
riscv64-linux-gnu-gcc -S -march=rv64gc -mabi=lp64d program.c
```

**Dependency Analysis**:

```bash
# Show dependencies
riscv64-linux-gnu-readelf -d program

# Show symbols
riscv64-linux-gnu-nm program

# Show sections
riscv64-linux-gnu-objdump -h program
```

## Best Practices

### 1. Environment Setup

```bash
# Create RISC-V development environment
mkdir -p ~/riscv-dev
cd ~/riscv-dev

# Set environment variables
export RISCV_PREFIX="riscv64-linux-gnu-"
export RISCV_CC="${RISCV_PREFIX}gcc"
export RISCV_CXX="${RISCV_PREFIX}g++"
export RISCV_LD="${RISCV_PREFIX}ld"
export RISCV_OBJDUMP="${RISCV_PREFIX}objdump"
export RISCV_READELF="${RISCV_PREFIX}readelf"
```

### 2. Build Scripts

```bash
#!/bin/bash
# build-riscv.sh

set -e

# Configuration
RISCV_CC="riscv64-linux-gnu-gcc"
RISCV_FLAGS="-march=rv64gc -mabi=lp64d -O2 -g"
TARGET="program"
SOURCES="main.c utils.c"

# Build
echo "Building RISC-V program..."
$RISCV_CC $RISCV_FLAGS -o $TARGET $SOURCES

# Verify
echo "Verifying binary..."
file $TARGET
riscv64-linux-gnu-readelf -h $TARGET

echo "Build complete!"
```

### 3. Testing Framework

```bash
#!/bin/bash
# test-riscv.sh

set -e

# Test program
PROGRAM="./program"

# Test cases
test_basic() {
    echo "Testing basic functionality..."
    $PROGRAM > output.txt
    if grep -q "Hello, RISC-V" output.txt; then
        echo "✓ Basic test passed"
    else
        echo "✗ Basic test failed"
        exit 1
    fi
}

test_math() {
    echo "Testing math functions..."
    $PROGRAM > output.txt
    if grep -q "Sum:" output.txt; then
        echo "✓ Math test passed"
    else
        echo "✗ Math test failed"
        exit 1
    fi
}

# Run tests
test_basic
test_math

echo "All tests passed!"
```

## Summary

Cross-compilation for RISC-V is a powerful technique that enables efficient development:

- **Fundamentals** - Target triplets, cross-compiler configuration, sysroot setup
- **Practical Examples** - Simple programs, multi-file projects, library usage, assembly integration
- **Advanced Techniques** - Conditional compilation, CMake integration, Autotools support
- **Debugging** - Remote debugging, core dump analysis, static analysis
- **Performance** - Compiler optimizations, linker optimizations, RISC-V specific features
- **Troubleshooting** - Common issues and solutions, debugging techniques
- **Best Practices** - Environment setup, build scripts, testing frameworks

Mastering cross-compilation enables you to develop, test, and deploy RISC-V applications efficiently from your development workstation, making RISC-V development accessible and practical.

> **Next**: Learn how to configure and optimize the RISC-V toolchain for specific development needs and target platforms.
