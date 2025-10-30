---
sidebar_position: 1
---

# Kernel Source

Master the complete process of obtaining, managing, and preparing Linux kernel source code specifically for RISC-V architecture development, including version selection, patch management, and source code organization.

## What is Kernel Source?

**What**: Kernel source code is the complete collection of C, assembly, and configuration files that make up the Linux kernel, including architecture-specific code, device drivers, filesystems, networking, and core kernel functionality.

**Why**: Understanding kernel source is crucial because:

- **Development Foundation** - Source code is the foundation for all kernel development
- **Architecture Understanding** - Learn how Linux kernel is implemented for RISC-V
- **Customization** - Modify kernel behavior for specific requirements
- **Debugging** - Understand kernel internals for effective debugging
- **Contribution** - Contribute to the Linux kernel community
- **Learning** - Deep understanding of operating system internals

**When**: Work with kernel source when:

- **Kernel Development** - Developing new features or fixing bugs
- **Driver Development** - Creating or modifying device drivers
- **System Customization** - Customizing kernel for specific platforms
- **Security Hardening** - Implementing security features
- **Performance Optimization** - Optimizing kernel performance
- **Educational Purposes** - Learning operating system internals

**How**: Kernel source management involves:

- **Version Selection** - Choosing appropriate kernel version
- **Source Acquisition** - Downloading from official repositories
- **Patch Management** - Applying patches and maintaining custom changes
- **Configuration** - Setting up build environment
- **Organization** - Understanding source code structure

**Where**: Kernel source is used in:

- **Development Workstations** - Local development environments
- **Build Servers** - Automated build systems
- **CI/CD Pipelines** - Continuous integration systems
- **Embedded Development** - Custom embedded systems
- **Research Projects** - Academic and commercial research

## Kernel Source Structure

### RISC-V Specific Architecture

**What**: The RISC-V architecture-specific code in the Linux kernel provides the foundation for running Linux on RISC-V processors.

**Directory Structure**:

```
arch/riscv/
├── boot/                    # Boot-related code
│   ├── dts/                # Device tree source files
│   └── loader/             # Boot loader support
├── include/                # RISC-V specific headers
│   ├── asm/                # Assembly headers
│   └── uapi/               # User API headers
├── kernel/                 # Core kernel code
│   ├── entry.S             # Kernel entry point
│   ├── head.S              # Kernel head assembly
│   ├── process.c           # Process management
│   ├── ptrace.c            # Process tracing
│   ├── signal.c            # Signal handling
│   ├── syscall_table.c     # System call table
│   └── vdso/               # Virtual Dynamic Shared Object
├── lib/                    # RISC-V specific libraries
│   ├── memcpy.S            # Memory copy functions
│   ├── memmove.S           # Memory move functions
│   └── string.S            # String functions
├── mm/                     # Memory management
│   ├── init.c              # Memory initialization
│   ├── fault.c             # Page fault handling
│   ├── pageattr.c          # Page attributes
│   └── pgtable.c           # Page table management
└── Kconfig                 # RISC-V configuration options
```

**Key RISC-V Files**:

```c
// arch/riscv/kernel/entry.S - Kernel entry point
// This file contains the assembly code that handles the transition
// from user space to kernel space and back

.section .text.entry
.global _start
_start:
    # Save user registers
    csrrw sp, sscratch, sp
    addi sp, sp, -PT_SIZE_ON_STACK
    STORE x1,  PT_RA(sp)
    STORE x3,  PT_GP(sp)
    # ... save other registers

    # Set up kernel stack
    la t0, init_task
    addi t0, t0, THREAD_SIZE
    addi sp, t0, -PT_SIZE_ON_STACK

    # Call kernel entry function
    call handle_exception

# Explanation:
# - _start is the kernel entry point for RISC-V
# - csrrw sp, sscratch, sp swaps stack pointer with scratch register
# - PT_SIZE_ON_STACK is the size of the pt_regs structure
# - STORE macro saves registers to the stack
# - init_task is the initial kernel task structure
# - THREAD_SIZE is the size of kernel thread stack
```

```c
// arch/riscv/kernel/head.S - Kernel head assembly
// This file contains the early kernel initialization code

.section .text.head
.global _start_kernel
_start_kernel:
    # Set up supervisor mode
    li t0, SR_SMODE | SR_SIE
    csrw sstatus, t0

    # Set up exception vector
    la t0, handle_exception
    csrw stvec, t0

    # Initialize memory management
    call setup_vm
    call relocate
    call setup_trap_vector

    # Jump to C code
    la t0, start_kernel
    jr t0

# Explanation:
# - SR_SMODE sets supervisor mode
# - SR_SIE enables supervisor interrupts
# - sstatus is the supervisor status register
# - stvec is the supervisor trap vector register
# - setup_vm initializes virtual memory
# - relocate relocates kernel to final position
# - start_kernel is the main C kernel entry point
```

### Core Kernel Components

**What**: The core kernel components provide essential operating system functionality.

**Key Components**:

```c
// kernel/sched/core.c - Scheduler core
// This file contains the main scheduling logic

struct task_struct *pick_next_task(struct rq *rq, struct task_struct *prev)
{
    struct sched_class *class;
    struct task_struct *p;

    // Get the highest priority scheduling class
    class = sched_class_highest;

    // Pick the next task from this class
    p = class->pick_next_task(rq, prev, NULL);

    return p;
}

// Explanation:
// - pick_next_task selects the next task to run
// - rq is the runqueue containing tasks
// - prev is the previously running task
// - sched_class_highest is the highest priority scheduler
// - Each scheduling class implements pick_next_task
```

```c
// kernel/fork.c - Process creation
// This file handles process and thread creation

long do_fork(unsigned long clone_flags,
             unsigned long stack_start,
             unsigned long stack_size,
             int __user *parent_tidptr,
             int __user *child_tidptr)
{
    struct task_struct *p;
    int trace = 0;
    long nr;

    // Create new task structure
    p = copy_process(clone_flags, stack_start, stack_size,
                     parent_tidptr, child_tidptr, trace);

    if (!IS_ERR(p)) {
        // Wake up the new task
        wake_up_new_task(p);
        nr = p->pid;
    } else {
        nr = PTR_ERR(p);
    }

    return nr;
}

// Explanation:
// - do_fork creates a new process or thread
// - clone_flags determines what to share with parent
// - stack_start and stack_size define the new stack
// - parent_tidptr and child_tidptr are thread ID pointers
// - copy_process creates the task structure
// - wake_up_new_task schedules the new task
```

## Obtaining Kernel Source

### Official Sources

**What**: Official kernel sources are maintained by the Linux kernel community and provide stable, well-tested code.

**Mainline Kernel**:

```bash
# Clone the mainline kernel repository
git clone https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git
cd linux

# Check out a specific version
git checkout v6.1

# Check RISC-V support
ls arch/riscv/
```

**Explanation**:

- `git clone` downloads the entire kernel repository
- `git checkout v6.1` switches to kernel version 6.1
- `arch/riscv/` contains all RISC-V specific code
- Mainline kernel has the latest features but may be less stable

**Stable Kernel**:

```bash
# Clone stable kernel repository
git clone https://git.kernel.org/pub/scm/linux/kernel/git/stable/linux.git
cd linux

# Check out stable version
git checkout linux-6.1.y

# Check available branches
git branch -r | grep linux-6.1
```

**Explanation**:

- Stable kernel repository contains backported fixes
- `linux-6.1.y` is the stable branch for version 6.1
- Stable kernels are more reliable for production use
- Backports include security fixes and bug fixes

### RISC-V Specific Sources

**What**: RISC-V specific kernel sources may include additional patches and features.

**RISC-V Foundation**:

```bash
# Clone RISC-V kernel repository
git clone https://github.com/riscv/riscv-linux.git
cd riscv-linux

# Check available branches
git branch -a

# Check out RISC-V specific branch
git checkout riscv-linux-6.1
```

**Explanation**:

- RISC-V Foundation maintains RISC-V specific patches
- May include experimental features not in mainline
- Useful for development and testing
- May have different configuration options

**Vendor Specific**:

```bash
# Example: SiFive kernel
git clone https://github.com/sifive/linux.git
cd linux

# Check SiFive specific branches
git branch -a | grep sifive

# Check out SiFive branch
git checkout sifive/riscv-linux-6.1
```

**Explanation**:

- Vendor kernels may include hardware-specific patches
- SiFive kernel includes patches for SiFive processors
- May have optimizations for specific hardware
- Useful for development on specific hardware

### Version Selection

**What**: Choosing the appropriate kernel version for your RISC-V development needs.

**Version Considerations**:

| Version Type | Stability | Features          | RISC-V Support | Use Case          |
| ------------ | --------- | ----------------- | -------------- | ----------------- |
| Mainline     | Latest    | Cutting-edge      | Latest         | Development       |
| Stable       | High      | Mature            | Good           | Production        |
| LTS          | Highest   | Stable            | Good           | Long-term         |
| Vendor       | Variable  | Hardware-specific | Excellent      | Hardware-specific |

**LTS Version Selection**:

```bash
# Check LTS versions
git tag | grep -E "v[0-9]+\.[0-9]+$" | sort -V

# Example LTS versions:
# v4.19  (LTS until 2024)
# v5.4   (LTS until 2026)
# v5.10  (LTS until 2026)
# v5.15  (LTS until 2027)
# v6.1   (LTS until 2028)

# Check out LTS version
git checkout v6.1
```

**Explanation**:

- LTS (Long Term Support) versions are supported for 6+ years
- LTS versions receive security updates and bug fixes
- Good choice for production systems
- RISC-V support is generally good in LTS versions

**Feature-Specific Selection**:

```bash
# Check for specific features
git log --oneline --grep="riscv" | head -10

# Check for specific commits
git log --oneline --grep="vector" | head -5

# Check for specific files
git log --oneline -- arch/riscv/ | head -10
```

**Explanation**:

- `git log --grep="riscv"` searches commit messages for "riscv"
- `git log --grep="vector"` searches for vector extension commits
- `git log -- arch/riscv/` shows commits affecting RISC-V code
- Helps identify which version has required features

## Source Code Management

### Git Workflow

**What**: Using Git for kernel source code management and development.

**Basic Git Operations**:

```bash
# Initialize repository
git init
git remote add origin https://git.kernel.org/pub/scm/linux/kernel/git/torvalds/linux.git

# Fetch latest changes
git fetch origin

# Check out specific version
git checkout v6.1

# Create development branch
git checkout -b riscv-development

# Make changes and commit
git add arch/riscv/kernel/my_feature.c
git commit -m "Add RISC-V specific feature"

# Push to remote
git push origin riscv-development
```

**Explanation**:

- `git init` initializes a new Git repository
- `git remote add` adds the mainline kernel as remote
- `git fetch` downloads latest changes without merging
- `git checkout -b` creates and switches to new branch
- `git add` stages changes for commit
- `git commit` creates a commit with changes
- `git push` uploads changes to remote repository

**Branch Management**:

```bash
# List branches
git branch -a

# Create feature branch
git checkout -b feature/riscv-optimization

# Switch between branches
git checkout main
git checkout feature/riscv-optimization

# Merge branches
git checkout main
git merge feature/riscv-optimization

# Delete branch
git branch -d feature/riscv-optimization
```

**Explanation**:

- `git branch -a` shows all branches (local and remote)
- Feature branches isolate development work
- `git checkout` switches between branches
- `git merge` combines changes from different branches
- `git branch -d` deletes a branch after merging

### Patch Management

**What**: Managing patches and custom modifications to the kernel source.

**Creating Patches**:

```bash
# Create patch from changes
git diff > my_patch.patch

# Create patch from commit
git format-patch -1 HEAD

# Create patch series
git format-patch -3 HEAD

# Apply patch
git apply my_patch.patch

# Apply patch with commit
git am my_patch.patch
```

**Explanation**:

- `git diff` shows changes in working directory
- `git format-patch` creates patch files from commits
- `-1 HEAD` creates patch for last commit
- `-3 HEAD` creates patches for last 3 commits
- `git apply` applies patch without creating commit
- `git am` applies patch and creates commit

**Patch Series Management**:

```bash
# Create patch series
git format-patch -3 HEAD --cover-letter

# Apply patch series
git am 000*.patch

# Check patch status
git am --show-current-patch

# Abort patch application
git am --abort

# Continue patch application
git am --continue
```

**Explanation**:

- `--cover-letter` creates a cover letter for patch series
- `000*.patch` matches patch files with 000 prefix
- `git am` applies patches in sequence
- `--show-current-patch` shows current patch being applied
- `--abort` cancels patch application
- `--continue` resumes after resolving conflicts

### Custom Modifications

**What**: Making custom modifications to the kernel source for specific requirements.

**RISC-V Specific Modifications**:

```c
// Example: Custom RISC-V system call
// arch/riscv/kernel/syscall_table.c

#include <linux/syscalls.h>
#include <linux/kernel.h>
#include <linux/sched.h>

// Custom system call for RISC-V
SYSCALL_DEFINE1(riscv_custom_syscall, unsigned long, arg)
{
    pr_info("RISC-V custom system call called with arg: %lu\n", arg);

    // Add custom logic here
    return 0;
}

// Explanation:
// - SYSCALL_DEFINE1 defines a system call with 1 argument
// - riscv_custom_syscall is the system call name
// - unsigned long arg is the argument type and name
// - pr_info prints kernel log message
// - Return 0 indicates success
```

**Adding Custom Drivers**:

```c
// Example: Custom RISC-V device driver
// drivers/riscv/custom_device.c

#include <linux/module.h>
#include <linux/init.h>
#include <linux/device.h>
#include <linux/platform_device.h>

static int custom_device_probe(struct platform_device *pdev)
{
    pr_info("Custom RISC-V device probed\n");
    return 0;
}

static int custom_device_remove(struct platform_device *pdev)
{
    pr_info("Custom RISC-V device removed\n");
    return 0;
}

static struct platform_driver custom_driver = {
    .probe = custom_device_probe,
    .remove = custom_device_remove,
    .driver = {
        .name = "custom-riscv-device",
    },
};

module_platform_driver(custom_driver);

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Custom RISC-V Device Driver");

// Explanation:
// - custom_device_probe is called when device is found
// - custom_device_remove is called when device is removed
// - platform_driver structure defines the driver
// - module_platform_driver registers the driver
// - MODULE_LICENSE specifies GPL license
// - MODULE_DESCRIPTION provides driver description
```

## Source Code Organization

### Directory Structure

**What**: Understanding the organization of kernel source code for efficient navigation and development.

**Top-Level Directories**:

```
linux/
├── arch/                   # Architecture-specific code
│   └── riscv/             # RISC-V architecture code
├── block/                 # Block device layer
├── crypto/                # Cryptographic API
├── drivers/               # Device drivers
├── fs/                    # Filesystem implementations
├── include/               # Header files
│   ├── asm-generic/       # Generic assembly headers
│   └── uapi/              # User API headers
├── init/                  # Kernel initialization
├── ipc/                   # Inter-process communication
├── kernel/                # Core kernel code
├── lib/                   # Kernel libraries
├── mm/                    # Memory management
├── net/                   # Networking code
├── samples/               # Sample code
├── scripts/               # Build scripts
├── security/              # Security framework
├── sound/                 # Audio subsystem
├── tools/                 # Development tools
└── virt/                  # Virtualization
```

**RISC-V Specific Structure**:

```
arch/riscv/
├── boot/                  # Boot-related code
│   ├── dts/              # Device tree source files
│   │   ├── starfive/     # StarFive (VisionFive) DTS files
│   │   ├── sifive/       # SiFive DTS files
│   │   └── microchip/    # Microchip DTS files
│   └── loader/           # Boot loader support
├── include/               # RISC-V headers
│   ├── asm/              # Assembly headers
│   │   ├── asm.h         # Main assembly header
│   │   ├── csr.h         # Control and Status Registers
│   │   ├── ptrace.h      # Process tracing
│   │   └── unistd.h      # System call numbers
│   └── uapi/             # User API headers
├── kernel/                # Core RISC-V kernel code
│   ├── entry.S           # Kernel entry point
│   ├── head.S            # Kernel head assembly
│   ├── process.c         # Process management
│   ├── ptrace.c          # Process tracing
│   ├── signal.c          # Signal handling
│   ├── syscall_table.c   # System call table
│   └── vdso/             # Virtual Dynamic Shared Object
├── lib/                   # RISC-V specific libraries
│   ├── memcpy.S          # Memory copy functions
│   ├── memmove.S         # Memory move functions
│   ├── memset.S          # Memory set functions
│   └── string.S          # String functions
├── mm/                    # Memory management
│   ├── init.c            # Memory initialization
│   ├── fault.c           # Page fault handling
│   ├── pageattr.c        # Page attributes
│   └── pgtable.c         # Page table management
└── Kconfig                # RISC-V configuration options
```

### Key Source Files

**What**: Understanding the most important source files for RISC-V kernel development.

**Kernel Entry Point**:

```assembly
# arch/riscv/kernel/entry.S
# This file contains the assembly code that handles the transition
# from user space to kernel space and back

.section .text.entry
.global _start
_start:
    # Save user registers to stack
    csrrw sp, sscratch, sp
    addi sp, sp, -PT_SIZE_ON_STACK
    STORE x1,  PT_RA(sp)      # Save return address
    STORE x3,  PT_GP(sp)      # Save global pointer
    STORE x4,  PT_TP(sp)      # Save thread pointer
    STORE x5,  PT_T0(sp)      # Save temporary register 0
    STORE x6,  PT_T1(sp)      # Save temporary register 1
    # ... save other registers

    # Set up kernel stack
    la t0, init_task
    addi t0, t0, THREAD_SIZE
    addi sp, t0, -PT_SIZE_ON_STACK

    # Call kernel entry function
    call handle_exception

# Explanation:
# - _start is the kernel entry point for RISC-V
# - csrrw sp, sscratch, sp swaps stack pointer with scratch register
# - PT_SIZE_ON_STACK is the size of the pt_regs structure
# - STORE macro saves registers to the stack
# - init_task is the initial kernel task structure
# - THREAD_SIZE is the size of kernel thread stack
# - handle_exception is the C function that handles exceptions
```

**Process Management**:

```c
// arch/riscv/kernel/process.c
// This file contains RISC-V specific process management code

#include <linux/sched.h>
#include <linux/ptrace.h>
#include <asm/processor.h>

// RISC-V specific process creation
int arch_dup_task_struct(struct task_struct *dst, struct task_struct *src)
{
    // Copy RISC-V specific task structure fields
    dst->thread.ra = src->thread.ra;
    dst->thread.sp = src->thread.sp;
    dst->thread.gp = src->thread.gp;
    dst->thread.tp = src->thread.tp;
    dst->thread.s[0] = src->thread.s[0];
    // ... copy other RISC-V specific fields

    return 0;
}

// RISC-V specific process switching
void arch_task_struct_init(struct task_struct *p)
{
    // Initialize RISC-V specific task structure fields
    p->thread.ra = 0;
    p->thread.sp = 0;
    p->thread.gp = 0;
    p->thread.tp = 0;
    // ... initialize other RISC-V specific fields
}

// Explanation:
// - arch_dup_task_struct copies RISC-V specific task fields
// - thread.ra is the return address register
// - thread.sp is the stack pointer register
// - thread.gp is the global pointer register
// - thread.tp is the thread pointer register
// - thread.s[0] is the first saved register
// - arch_task_struct_init initializes new task structures
```

**Memory Management**:

```c
// arch/riscv/mm/init.c
// This file contains RISC-V specific memory initialization

#include <linux/mm.h>
#include <linux/memblock.h>
#include <asm/page.h>

// RISC-V memory initialization
void __init setup_bootmem(void)
{
    // Initialize memory regions
    memblock_add(0x80000000, 0x80000000);  // 2GB RAM

    // Reserve kernel memory
    memblock_reserve(0x80000000, 0x1000000);  // 16MB for kernel

    // Reserve device tree
    memblock_reserve(0x82000000, 0x100000);   // 1MB for device tree

    // Initialize page allocator
    memblock_init();
}

// RISC-V page table initialization
void __init paging_init(void)
{
    // Initialize page table
    setup_vm();

    // Map kernel memory
    create_pgd_mapping(swapper_pg_dir, 0x80000000, 0x80000000,
                      0x80000000, PAGE_KERNEL_EXEC);

    // Map device memory
    create_pgd_mapping(swapper_pg_dir, 0x10000000, 0x10000000,
                      0x10000000, PAGE_KERNEL_DEVICE);
}

// Explanation:
// - setup_bootmem initializes memory regions
// - memblock_add adds memory regions to the allocator
// - memblock_reserve reserves memory for specific purposes
// - setup_vm sets up virtual memory
// - create_pgd_mapping creates page table entries
// - PAGE_KERNEL_EXEC creates executable kernel pages
// - PAGE_KERNEL_DEVICE creates device memory pages
```

## Build System Integration

### Makefile Structure

**What**: Understanding the kernel build system and Makefile structure.

**Top-Level Makefile**:

```makefile
# Top-level Makefile
# This file contains the main build configuration

# RISC-V specific configuration
ARCH ?= riscv
CROSS_COMPILE ?= riscv64-linux-gnu-

# Kernel version
VERSION = 6
PATCHLEVEL = 1
SUBLEVEL = 0
EXTRAVERSION = -rc1
NAME = Hurr durr I'ma nerd

# Build configuration
KBUILD_CFLAGS += -march=rv64gc -mabi=lp64d
KBUILD_AFLAGS += -march=rv64gc -mabi=lp64d

# Include architecture-specific Makefile
include arch/riscv/Makefile

# Explanation:
# - ARCH specifies the target architecture
# - CROSS_COMPILE specifies the cross-compiler prefix
# - VERSION, PATCHLEVEL, SUBLEVEL define kernel version
# - KBUILD_CFLAGS sets compiler flags
# - KBUILD_AFLAGS sets assembler flags
# - arch/riscv/Makefile contains RISC-V specific rules
```

**RISC-V Makefile**:

```makefile
# arch/riscv/Makefile
# This file contains RISC-V specific build rules

# RISC-V specific flags
KBUILD_CFLAGS += -march=rv64gc -mabi=lp64d
KBUILD_AFLAGS += -march=rv64gc -mabi=lp64d

# RISC-V specific targets
KBUILD_IMAGE := vmlinux

# RISC-V specific objects
head-y := arch/riscv/kernel/head.o
core-y += arch/riscv/kernel/
core-y += arch/riscv/mm/
core-y += arch/riscv/lib/

# RISC-V specific drivers
drivers-y += drivers/riscv/

# Explanation:
# - KBUILD_CFLAGS sets C compiler flags
# - KBUILD_AFLAGS sets assembler flags
# - KBUILD_IMAGE defines the output image name
# - head-y specifies the head object file
# - core-y includes core kernel directories
# - drivers-y includes driver directories
```

### Kbuild System

**What**: Understanding the Kbuild system for building kernel modules and drivers.

**Kbuild Makefile**:

```makefile
# drivers/riscv/Makefile
# This file contains RISC-V driver build rules

# RISC-V specific drivers
obj-$(CONFIG_RISCV_CUSTOM_DEVICE) += custom_device.o
obj-$(CONFIG_RISCV_PLATFORM) += platform.o
obj-$(CONFIG_RISCV_DEBUG) += debug.o

# Explanation:
# - obj-$(CONFIG_RISCV_CUSTOM_DEVICE) builds custom_device.o if enabled
# - CONFIG_RISCV_CUSTOM_DEVICE is a configuration option
# - custom_device.o is the object file to build
# - platform.o and debug.o are other driver objects
```

**Kconfig Integration**:

```kconfig
# arch/riscv/Kconfig
# This file contains RISC-V configuration options

menu "RISC-V Architecture"

config RISCV_CUSTOM_DEVICE
    bool "Custom RISC-V Device Support"
    default y
    help
      Enable support for custom RISC-V devices.

      This option enables the custom RISC-V device driver
      that provides additional functionality for RISC-V
      based systems.

config RISCV_PLATFORM
    bool "RISC-V Platform Support"
    default y
    help
      Enable RISC-V platform support.

      This option enables platform-specific code for
      RISC-V based systems.

endmenu

# Explanation:
# - menu creates a configuration menu
# - config defines a configuration option
# - bool creates a boolean (yes/no) option
# - default y sets the default value to yes
# - help provides help text for the option
```

## Development Workflow

### Source Code Navigation

**What**: Efficiently navigating and understanding kernel source code.

**Using ctags/cscope**:

```bash
# Generate tags for source code navigation
make tags

# Generate cscope database
make cscope

# Search for functions
cscope -d -L1 function_name

# Search for symbols
cscope -d -L1 symbol_name

# Search for files
cscope -d -L1 file_name
```

**Explanation**:

- `make tags` generates tags for source code navigation
- `make cscope` generates cscope database for symbol search
- `cscope -d` uses existing database
- `-L1` limits output to one line per match
- Useful for finding function definitions and usage

**Using grep**:

```bash
# Search for RISC-V specific code
grep -r "riscv" arch/riscv/

# Search for specific functions
grep -r "function_name" arch/riscv/

# Search for specific patterns
grep -r "asm.*riscv" arch/riscv/

# Search with context
grep -r -A5 -B5 "riscv" arch/riscv/
```

**Explanation**:

- `grep -r` searches recursively
- `-A5` shows 5 lines after match
- `-B5` shows 5 lines before match
- Useful for finding code patterns and context

### Debugging Source Code

**What**: Debugging kernel source code for development and troubleshooting.

**Using GDB**:

```bash
# Start GDB with kernel image
riscv64-linux-gnu-gdb vmlinux

# Set breakpoints
(gdb) break start_kernel
(gdb) break arch_riscv_init

# Run with QEMU
(gdb) target remote :1234

# Step through code
(gdb) step
(gdb) next

# Examine variables
(gdb) print variable_name
(gdb) print *pointer_name
```

**Explanation**:

- `vmlinux` is the uncompressed kernel image
- `start_kernel` is the main kernel entry point
- `arch_riscv_init` is RISC-V specific initialization
- `target remote` connects to QEMU GDB server
- `step` steps into function calls
- `next` steps over function calls

**Using printk**:

```c
// Example: Adding debug prints
#include <linux/kernel.h>

static int __init riscv_debug_init(void)
{
    pr_info("RISC-V debug module loaded\n");
    pr_debug("Debug information: %s\n", "detailed info");
    pr_warn("Warning message: %d\n", 42);
    pr_err("Error message: %s\n", "error details");

    return 0;
}

module_init(riscv_debug_init);

// Explanation:
// - pr_info prints informational messages
// - pr_debug prints debug messages (requires DEBUG)
// - pr_warn prints warning messages
// - pr_err prints error messages
// - module_init registers the initialization function
```

## Best Practices

### Source Code Management

**What**: Best practices for managing kernel source code.

**Version Control**:

```bash
# Use meaningful commit messages
git commit -m "riscv: Add custom device driver support

This commit adds support for custom RISC-V devices including:
- Device driver framework
- Platform-specific initialization
- Interrupt handling
- Memory management

Signed-off-by: Your Name <your.email@example.com>"

# Use proper branch naming
git checkout -b feature/riscv-custom-device
git checkout -b fix/riscv-memory-bug
git checkout -b cleanup/riscv-code-formatting
```

**Explanation**:

- Commit messages should be descriptive and follow kernel conventions
- Include detailed description of changes
- Add Signed-off-by line for contributions
- Use consistent branch naming conventions

**Code Organization**:

```c
// Example: Well-organized RISC-V driver
// drivers/riscv/custom_device.c

#include <linux/module.h>
#include <linux/init.h>
#include <linux/device.h>
#include <linux/platform_device.h>
#include <linux/interrupt.h>
#include <linux/io.h>

// Device structure
struct custom_device {
    struct device *dev;
    void __iomem *base;
    int irq;
    struct work_struct work;
};

// Interrupt handler
static irqreturn_t custom_interrupt_handler(int irq, void *dev_id)
{
    struct custom_device *dev = dev_id;

    // Handle interrupt
    schedule_work(&dev->work);

    return IRQ_HANDLED;
}

// Work function
static void custom_work_function(struct work_struct *work)
{
    struct custom_device *dev = container_of(work, struct custom_device, work);

    // Process interrupt
    pr_info("Custom device interrupt processed\n");
}

// Probe function
static int custom_device_probe(struct platform_device *pdev)
{
    struct custom_device *dev;
    int ret;

    // Allocate device structure
    dev = devm_kzalloc(&pdev->dev, sizeof(*dev), GFP_KERNEL);
    if (!dev)
        return -ENOMEM;

    // Initialize device
    dev->dev = &pdev->dev;
    platform_set_drvdata(pdev, dev);

    // Map memory
    dev->base = devm_platform_ioremap_resource(pdev, 0);
    if (IS_ERR(dev->base))
        return PTR_ERR(dev->base);

    // Get interrupt
    dev->irq = platform_get_irq(pdev, 0);
    if (dev->irq < 0)
        return dev->irq;

    // Initialize work
    INIT_WORK(&dev->work, custom_work_function);

    // Request interrupt
    ret = devm_request_irq(&pdev->dev, dev->irq, custom_interrupt_handler,
                          IRQF_SHARED, "custom-device", dev);
    if (ret)
        return ret;

    pr_info("Custom device probed successfully\n");
    return 0;
}

// Remove function
static int custom_device_remove(struct platform_device *pdev)
{
    pr_info("Custom device removed\n");
    return 0;
}

// Platform driver structure
static struct platform_driver custom_driver = {
    .probe = custom_device_probe,
    .remove = custom_device_remove,
    .driver = {
        .name = "custom-riscv-device",
    },
};

module_platform_driver(custom_driver);

MODULE_LICENSE("GPL");
MODULE_DESCRIPTION("Custom RISC-V Device Driver");
MODULE_AUTHOR("Your Name <your.email@example.com>");

// Explanation:
// - Well-organized structure with clear separation of concerns
// - Proper error handling and resource management
// - Use of devm_* functions for automatic resource cleanup
// - Proper interrupt handling with work queues
// - Clear function naming and documentation
```

## Summary

Understanding kernel source code is essential for RISC-V development:

- **Source Structure** - RISC-V specific architecture and organization
- **Obtaining Source** - Official sources, version selection, and management
- **Source Management** - Git workflow, patch management, and custom modifications
- **Code Organization** - Directory structure and key source files
- **Build Integration** - Makefile structure and Kbuild system
- **Development Workflow** - Navigation, debugging, and best practices
- **Code Examples** - Practical examples with detailed explanations

Mastering kernel source code enables effective development, debugging, and contribution to the RISC-V Linux kernel ecosystem.

> **Next**: Learn how to configure the Linux kernel for RISC-V architecture, including configuration options, build settings, and optimization techniques.
