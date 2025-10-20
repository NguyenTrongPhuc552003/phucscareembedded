---
sidebar_position: 1
---

# Kconfig System

Master the Linux kernel configuration system (Kconfig) and understand how to configure kernels for specific hardware and use cases.

## What is the Kconfig System?

**What**: The Kconfig system is the configuration framework used by the Linux kernel to manage build-time configuration options, dependencies, and feature selection through a hierarchical configuration system.

**Why**: Understanding Kconfig is crucial because:

- **Feature selection** - Choose which kernel features to include
- **Dependency management** - Handle complex dependencies between options
- **Size optimization** - Minimize kernel size for embedded systems
- **Performance tuning** - Enable/disable features for specific use cases
- **Hardware support** - Configure kernel for specific hardware platforms

**When**: Kconfig is used when:

- **Kernel configuration** - Setting up kernel for specific hardware
- **Feature customization** - Enabling/disabling kernel features
- **Size optimization** - Minimizing kernel size for embedded systems
- **Performance tuning** - Optimizing kernel for specific workloads
- **Hardware support** - Adding support for new hardware

**How**: Kconfig works through:

```bash
# Example: Kconfig usage
# Set up environment
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-

# Navigate to kernel source
cd /path/to/linux-kernel

# Start configuration
make menuconfig

# Configuration options:
# - make config: Text-based configuration
# - make menuconfig: Menu-driven configuration
# - make xconfig: X11-based configuration
# - make gconfig: GTK-based configuration
# - make defconfig: Default configuration
# - make savedefconfig: Save current configuration
```

**Explanation**:

- **Configuration interfaces** - Different ways to configure the kernel
- **Option management** - Enable/disable kernel features
- **Dependency resolution** - Automatic handling of option dependencies
- **Configuration files** - Storage of kernel configuration settings

**Where**: Kconfig is used in:

- **Kernel customization** - Tailoring kernels for specific requirements
- **Embedded development** - Optimizing kernels for embedded systems
- **Hardware support** - Enabling support for specific hardware
- **Rock 5B+** - ARM64 kernel configuration

## Kconfig Syntax

**What**: Kconfig uses a specific syntax to define configuration options, their types, dependencies, and help text.

**Why**: Understanding Kconfig syntax is important because:

- **Option definition** - Create new configuration options
- **Dependency management** - Define relationships between options
- **Help documentation** - Provide user-friendly help text
- **Type specification** - Define different types of configuration options
- **Customization** - Modify existing configuration options

**How**: Kconfig syntax works through:

```kconfig
# Example: Kconfig syntax
# Boolean option
config ARM64
    bool "ARM64 (AArch64) Support"
    select ARCH_HAS_ATOMIC64_DEC_IF_POSITIVE
    select ARCH_HAS_ELF_RANDOMIZE
    select ARCH_HAS_GCOV_PROFILE_ALL
    select ARCH_HAS_SG_CHAIN
    select ARCH_HAS_TICK_BROADCAST
    select ARCH_USE_CMPXCHG_LOCKREF
    select ARCH_WANT_OPTIONAL_GPIOLIB
    select ARCH_WANT_COMPAT_IPC_PARSE_VERSION
    select ARCH_WANT_FRAME_POINTERS
    select ARCH_HAS_UBSAN_SANITIZE_ALL
    select ARM_AMBA
    select ARM_ARCH_TIMER
    select ARM_GIC
    select AUDIT_ARCH_COMPAT_GENERIC
    select CLONE_BACKWARDS
    select COMMON_CLK
    select CPU_PM if (SUSPEND || CPU_IDLE)
    select DCACHE_WORD_ACCESS
    select EDAC_SUPPORT
    select FRAME_POINTER
    select GENERIC_ATOMIC64
    select GENERIC_CLOCKEVENTS
    select GENERIC_CLOCKEVENTS_BROADCAST
    select GENERIC_CPU_DEVICES
    select GENERIC_EARLY_IOREMAP
    select GENERIC_IDLE_POLL_SETUP
    select GENERIC_IRQ_PROBE
    select GENERIC_IRQ_SHOW
    select GENERIC_IRQ_SHOW_LEVEL
    select GENERIC_PCI_IOMAP
    select GENERIC_SCHED_CLOCK
    select GENERIC_SMP_IDLE_THREAD
    select GENERIC_STRNCPY_FROM_USER
    select GENERIC_STRNLEN_USER
    select GENERIC_TIME_VSYSCALL
    select GENERIC_VDSO
    select HANDLE_DOMAIN_IRQ
    select HARDIRQS_SW_RESEND
    select HAVE_ARCH_AUDITSYSCALL
    select HAVE_ARCH_BITREVERSE
    select HAVE_ARCH_JUMP_LABEL
    select HAVE_ARCH_KASAN
    select HAVE_ARCH_KGDB
    select HAVE_ARCH_MMAP_RND_BITS
    select HAVE_ARCH_MMAP_RND_COMPAT_BITS
    select HAVE_ARCH_SECCOMP_FILTER
    select HAVE_ARCH_TRACEHOOK
    select HAVE_ARCH_TRANSPARENT_HUGEPAGE
    select HAVE_ARCH_VMAP_STACK
    select HAVE_ARM_SMCCC
    select HAVE_CC_STACKPROTECTOR
    select HAVE_DEBUG_BUGVERBOSE
    select HAVE_DEBUG_KMEMLEAK
    select HAVE_DMA_API_DEBUG
    select HAVE_DMA_CONTIGUOUS
    select HAVE_DYNAMIC_FTRACE
    select HAVE_DYNAMIC_FTRACE_WITH_REGS
    select HAVE_EFFICIENT_UNALIGNED_ACCESS
    select HAVE_FTRACE_MCOUNT_RECORD
    select HAVE_FUNCTION_GRAPH_TRACER
    select HAVE_FUNCTION_TRACER
    select HAVE_GCC_PLUGINS
    select HAVE_GENERIC_DMA_COHERENT
    select HAVE_HW_BREAKPOINT
    select HAVE_IRQ_TIME_ACCOUNTING
    select HAVE_KPROBES
    select HAVE_KRETPROBES
    select HAVE_MEMBLOCK
    select HAVE_MEMBLOCK_NODE_MAP
    select HAVE_MOD_ARCH_SPECIFIC
    select HAVE_NMI
    select HAVE_OPROFILE
    select HAVE_PERF_EVENTS
    select HAVE_PERF_REGS
    select HAVE_PERF_USER_STACK_DUMP
    select HAVE_RCU_TABLE_FREE
    select HAVE_REGS_AND_STACK_ACCESS_API
    select HAVE_RSEQ
    select HAVE_SYSCALL_TRACEPOINTS
    select HAVE_UID16
    select HAVE_VIRT_CPU_ACCOUNTING_GEN
    select IOMMU_DMA
    select IRQ_DOMAIN
    select IRQ_FORCED_THREADING
    select MODULES_USE_ELF_RELA
    select NO_BOOTMEM
    select OF
    select OF_EARLY_FLATTREE
    select OF_RESERVED_MEM
    select PCI_DOMAINS_GENERIC if PCI
    select PERF_USE_VMALLOC
    select POWER_RESET
    select POWER_SUPPLY
    select RTC_LIB
    select SPARSE_IRQ
    select SYSCTL_EXCEPTION_TRACE
    select THREAD_INFO_IN_TASK
    select USE_OF
    help
      ARM 64-bit (AArch64) Linux support.

# String option
config LOCALVERSION
    string "Local version - append to kernel release"
    default ""
    help
      Append an extra string to the end of your kernel version.
      This will show up when you type uname, for example.
      The string you set here will be appended after the contents of
      any files with a filename like localversion* in your
      object and source tree, after any kernel version string.
      The maximum length is 64 characters.

# Integer option
config NR_CPUS
    int "Maximum number of CPUs (2-512)"
    range 2 512
    default "64"
    help
      This allows you to specify the maximum number of CPUs which this
      kernel will support.  The maximum supported value is 512 and the
      minimum value which makes sense is 2.

# Choice option
choice
    prompt "Kernel compression mode"
    default KERNEL_GZIP
    help
      The linux kernel is a large file, so a lot of time is spent
      compressing and decompressing it.  There are many compression
      algorithms available, some with better compression ratios, some
      with faster compression.  This choice allows you to decide the
      speed/compression tradeoff for your kernel.

config KERNEL_GZIP
    bool "Gzip"
    help
      The old and tried gzip compression.  Its compression ratio is
      the poorest among the choices.  However, its speed (both
      compression and decompression) is the fastest.

config KERNEL_BZIP2
    bool "Bzip2"
    help
      Its compression ratio and speed is intermediate.
      Decompression speed is slower than gzip.  However, slower
      compression speeds yield better compression ratios.

config KERNEL_LZMA
    bool "LZMA"
    help
      This compression algorithm's ratio is best.  However, its
      compression speed is the slowest.  The kernel size is not
      much affected, but if you have a slow CPU, consider the
      choice.

config KERNEL_XZ
    bool "XZ"
    help
      XZ uses the LZMA2 algorithm.  The ratio of compression is
      better than that of LZMA.  The speed of compression is
      better than that of LZMA.  The decompression speed is
      better than that of bzip2.  It is possible to have random
      access to the data with some sacrifice in compression ratio.

config KERNEL_LZO
    bool "LZO"
    help
      Its compression ratio is the second poorest among the choices.
      The kernel size is not much affected, but if you have a slow
      CPU, consider the choice.

config KERNEL_LZ4
    bool "LZ4"
    help
      LZ4 is an LZ77-type algorithm with a fixed, byte-oriented
      encoding.  A reasonable compression ratio is achieved, and
      it offers a very fast decoding speed.  On the other hand,
      the compression speed is not so fast.  The kernel size is
      not much affected, but if you have a slow CPU, consider the
      choice.

endchoice

# Menu option
menu "Kernel Features"
    config ARM64_4K_PAGES
        bool "Support 4KB pages"
        default y
        help
          This feature enables 4KB page support in the kernel, as opposed
          to the standard 64KB pages used on ARM64 systems.

    config ARM64_16K_PAGES
        bool "Support 16KB pages"
        default n
        help
          The system will use 16KB pages support.  This feature is not
          compatible with aarch32 emulation.

    config ARM64_64K_PAGES
        bool "Support 64KB pages"
        default n
        help
          This feature enables 64KB page support in the kernel, as opposed
          to the standard 4KB pages used on ARM64 systems.

    config ARM64_VA_BITS_39
        bool "39-bit"
        help
          Enable 39-bit virtual addressing.  This feature is not
          compatible with aarch32 emulation.

    config ARM64_VA_BITS_48
        bool "48-bit"
        help
          Enable 48-bit virtual addressing.  This feature is not
          compatible with aarch32 emulation.

    config ARM64_VA_BITS_52
        bool "52-bit"
        help
          Enable 52-bit virtual addressing.  This feature is not
          compatible with aarch32 emulation.

    config ARM64_VA_BITS
        int
        default 39 if ARM64_VA_BITS_39
        default 48 if ARM64_VA_BITS_48
        default 52 if ARM64_VA_BITS_52
        default 48

endmenu
```

**Explanation**:

- **Boolean options** - Yes/No configuration options
- **String options** - Text input configuration options
- **Integer options** - Numeric input configuration options
- **Choice options** - Multiple choice configuration options
- **Menu options** - Grouped configuration options

**Where**: Kconfig syntax is used in:

- **Kernel configuration** - Defining kernel configuration options
- **Driver configuration** - Configuring device drivers
- **Feature selection** - Enabling/disabling kernel features
- **Rock 5B+** - ARM64 kernel configuration

## Configuration Dependencies

**What**: Configuration dependencies define relationships between configuration options, ensuring that required options are enabled when needed.

**Why**: Understanding dependencies is important because:

- **Automatic resolution** - Automatically enable required options
- **Error prevention** - Prevent invalid configuration combinations
- **User guidance** - Guide users to correct configuration choices
- **Maintenance** - Simplify configuration management
- **Validation** - Ensure configuration consistency

**How**: Dependencies work through:

```kconfig
# Example: Configuration dependencies
# Simple dependency
config ARM64_4K_PAGES
    bool "Support 4KB pages"
    default y
    depends on ARM64

# Reverse dependency
config ARM64_4K_PAGES
    bool "Support 4KB pages"
    default y
    select ARCH_HAS_4K_PAGES

# Conditional dependency
config ARM64_4K_PAGES
    bool "Support 4KB pages"
    default y
    depends on ARM64
    depends on !ARM64_16K_PAGES
    depends on !ARM64_64K_PAGES

# Complex dependency
config ARM64_4K_PAGES
    bool "Support 4KB pages"
    default y
    depends on ARM64
    depends on !ARM64_16K_PAGES
    depends on !ARM64_64K_PAGES
    select ARCH_HAS_4K_PAGES
    select ARCH_HAS_PAGE_SIZE_4KB
    help
      This feature enables 4KB page support in the kernel, as opposed
      to the standard 64KB pages used on ARM64 systems.

# Menu dependency
menu "Kernel Features"
    depends on ARM64
    config ARM64_4K_PAGES
        bool "Support 4KB pages"
        default y
        help
          This feature enables 4KB page support in the kernel.

    config ARM64_16K_PAGES
        bool "Support 16KB pages"
        default n
        depends on !ARM64_4K_PAGES
        depends on !ARM64_64K_PAGES
        help
          The system will use 16KB pages support.

    config ARM64_64K_PAGES
        bool "Support 64KB pages"
        default n
        depends on !ARM64_4K_PAGES
        depends on !ARM64_16K_PAGES
        help
          This feature enables 64KB page support in the kernel.
endmenu
```

**Explanation**:

- **depends on** - Option depends on another option being enabled
- **select** - Option automatically enables another option
- **depends on !** - Option depends on another option being disabled
- **Menu dependencies** - Dependencies apply to entire menus
- **Complex dependencies** - Multiple dependency conditions

**Where**: Dependencies are used in:

- **Kernel configuration** - Managing kernel option relationships
- **Driver configuration** - Ensuring driver dependencies
- **Feature selection** - Managing feature relationships
- **Rock 5B+** - ARM64 kernel configuration

## Configuration Files

**What**: Configuration files store kernel configuration settings and can be used to reproduce specific kernel configurations.

**Why**: Understanding configuration files is important because:

- **Reproducibility** - Reproduce specific kernel configurations
- **Version control** - Track configuration changes over time
- **Distribution** - Share configurations across different systems
- **Backup** - Backup and restore kernel configurations
- **Automation** - Automate kernel configuration processes

**How**: Configuration files work through:

```bash
# Example: Configuration file management
# Save current configuration
make savedefconfig

# Load configuration
make defconfig

# Load specific configuration
make rockchip_linux_defconfig

# Compare configurations
diff .config .config.old

# Edit configuration file
vim .config

# Apply configuration
make oldconfig

# Update configuration
make olddefconfig
```

**Explanation**:

- **.config** - Current kernel configuration
- **defconfig** - Default configuration for architecture
- **savedefconfig** - Minimal configuration file
- **oldconfig** - Update configuration with new options
- **olddefconfig** - Update configuration with default values

**Where**: Configuration files are used in:

- **Kernel development** - Managing kernel configurations
- **Embedded development** - Custom kernel configurations
- **Distribution** - Sharing kernel configurations
- **Rock 5B+** - ARM64 kernel configuration

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Kconfig Understanding** - You understand the kernel configuration system
2. **Syntax Knowledge** - You know Kconfig syntax and option types
3. **Dependency Management** - You understand configuration dependencies
4. **File Management** - You know how to manage configuration files
5. **Configuration Skills** - You can configure kernels for specific hardware

**Why** these concepts matter:

- **Kernel customization** enables tailored kernels for specific requirements
- **Configuration knowledge** provides the foundation for kernel development
- **Dependency understanding** ensures correct configuration choices
- **File management** supports configuration version control and sharing
- **Configuration skills** enable effective kernel customization

**When** to use these concepts:

- **Kernel configuration** - When setting up kernels for specific hardware
- **Feature selection** - When enabling/disabling kernel features
- **Size optimization** - When minimizing kernel size for embedded systems
- **Performance tuning** - When optimizing kernels for specific workloads
- **Hardware support** - When adding support for new hardware

**Where** these skills apply:

- **Kernel development** - Custom kernel builds and modifications
- **Embedded development** - Optimizing kernels for embedded systems
- **Driver development** - Configuring device drivers
- **System administration** - Kernel configuration and management
- **Rock 5B+** - ARM64 kernel configuration

## Next Steps

**What** you're ready for next:

After mastering the Kconfig system, you should be ready to:

1. **Learn kernel compilation** - Understand the kernel compilation process
2. **Study module compilation** - Learn how to compile kernel modules
3. **Explore debugging tools** - Learn kernel debugging techniques
4. **Begin practical development** - Start building kernel modules
5. **Understand testing** - Learn kernel testing and validation

**Where** to go next:

Continue with the next lesson on **"Kernel Compilation"** to learn:

- Kernel compilation process and optimization
- Module compilation and installation
- Build system troubleshooting
- Cross-compilation techniques

**Why** the next lesson is important:

The next lesson builds directly on your Kconfig knowledge by focusing on the compilation process. You'll learn how to build kernels and modules using the configuration you've created.

**How** to continue learning:

1. **Practice configuration** - Configure kernels for different hardware
2. **Experiment with options** - Try different configuration combinations
3. **Read documentation** - Study kernel configuration documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple kernel customization projects

## Resources

**Official Documentation**:

- [Kconfig Language](https://www.kernel.org/doc/html/latest/kbuild/kconfig-language.html) - Kconfig syntax and features
- [Kernel Configuration](https://www.kernel.org/doc/html/latest/kbuild/) - Kernel configuration guide
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64 specific documentation

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook
- [Understanding the Linux Kernel by Bovet and Cesati](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Detailed kernel internals
- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [Device Tree Specification](https://www.devicetree.org/specifications/) - Device tree documentation

Happy learning! 🐧
