---
sidebar_position: 1
---

# GDB and KGDB Debugging

Master kernel debugging using GDB and KGDB for effective development and troubleshooting on Rock 5B+ ARM64 systems.

## What is GDB and KGDB Debugging?

**What**: GDB (GNU Debugger) and KGDB (Kernel GDB) are debugging tools that enable source-level debugging of kernel code, allowing developers to step through code, inspect variables, and analyze program execution.

**Why**: Understanding GDB and KGDB debugging is crucial because:

- **Source-level debugging** - Debug kernel code at the source level
- **Variable inspection** - Examine variable values and memory contents
- **Execution control** - Step through code execution
- **Error analysis** - Analyze kernel crashes and errors
- **Development efficiency** - Faster problem resolution and development

**When**: GDB and KGDB debugging is used when:

- **Kernel development** - Debugging kernel code and drivers
- **Driver development** - Debugging device drivers
- **Crash analysis** - Analyzing kernel crashes and panics
- **Performance analysis** - Analyzing kernel performance issues
- **Embedded development** - Debugging embedded Linux systems

**How**: GDB and KGDB debugging works through:

```bash
# Example: GDB debugging setup
# Install GDB for ARM64
sudo apt install -y gdb-multiarch

# Debug kernel with KGDB
# 1. Enable KGDB in kernel configuration
CONFIG_KGDB=y
CONFIG_KGDB_SERIAL_CONSOLE=y
CONFIG_KGDB_KDB=y

# 2. Boot kernel with KGDB enabled
# Add to kernel command line: kgdboc=ttyS0,1500000

# 3. Connect GDB to kernel
gdb-multiarch vmlinux
(gdb) target remote /dev/ttyUSB0
(gdb) continue
```

**Explanation**:

- **KGDB setup** - Configure kernel for GDB debugging
- **Serial connection** - Use serial port for debugging communication
- **GDB connection** - Connect GDB to running kernel
- **Source debugging** - Debug kernel source code
- **Execution control** - Control kernel execution

**Where**: GDB and KGDB debugging is used in:

- **Kernel development** - Debugging kernel code
- **Driver development** - Debugging device drivers
- **Embedded systems** - Debugging embedded Linux
- **Rock 5B+** - ARM64 kernel debugging

## GDB Setup and Configuration

**What**: GDB setup involves configuring the debugger for ARM64 cross-compilation and kernel debugging.

**Why**: Proper GDB setup is important because:

- **Cross-compilation** - Debug ARM64 code from x86_64 hosts
- **Kernel debugging** - Enable kernel-level debugging
- **Source debugging** - Debug with source code information
- **Symbol resolution** - Resolve function and variable names
- **Development efficiency** - Streamline debugging workflow

**How**: GDB setup works through:

```bash
# Example: GDB setup for ARM64
# Install GDB for ARM64
sudo apt install -y gdb-multiarch

# Set up GDB configuration
cat > ~/.gdbinit << 'EOF'
# GDB configuration for ARM64
set architecture aarch64
set endian little
set disassembly-flavor intel

# Set target
set target-charset ASCII
set host-charset UTF-8

# Set source directories
directory /path/to/kernel/source
directory /path/to/kernel/source/arch/arm64
directory /path/to/kernel/source/drivers

# Set breakpoints
break start_kernel
break do_fork
break sys_open

# Set watchpoints
watch variable_name
watch *address

# Set display
set print pretty on
set print array on
set print array-indexes on
EOF

# Start GDB
gdb-multiarch vmlinux
```

**Explanation**:

- **Architecture setup** - Configure GDB for ARM64
- **Source directories** - Set kernel source directories
- **Breakpoints** - Set initial breakpoints
- **Watchpoints** - Monitor variable changes
- **Display options** - Configure output formatting

**Where**: GDB setup is used in:

- **Kernel development** - Debugging kernel code
- **Driver development** - Debugging device drivers
- **Embedded development** - Debugging embedded systems
- **Rock 5B+** - ARM64 kernel debugging

## KGDB Configuration

**What**: KGDB configuration involves setting up the kernel for GDB debugging through serial communication.

**Why**: Understanding KGDB configuration is important because:

- **Kernel debugging** - Enable kernel-level debugging
- **Serial communication** - Use serial port for debugging
- **Remote debugging** - Debug kernel from remote host
- **Crash analysis** - Analyze kernel crashes and panics
- **Development efficiency** - Streamline debugging workflow

**How**: KGDB configuration works through:

```bash
# Example: KGDB configuration
# 1. Enable KGDB in kernel configuration
CONFIG_KGDB=y
CONFIG_KGDB_SERIAL_CONSOLE=y
CONFIG_KGDB_KDB=y
CONFIG_KGDB_HONOUR_BLOCKLIST=y
CONFIG_KGDB_SERIAL_CONSOLE=y
CONFIG_KGDB_TESTS=y

# 2. Configure serial port
CONFIG_SERIAL_8250=y
CONFIG_SERIAL_8250_CONSOLE=y
CONFIG_SERIAL_8250_NR_UARTS=4
CONFIG_SERIAL_8250_RUNTIME_UARTS=4

# 3. Boot kernel with KGDB enabled
# Add to kernel command line:
# kgdboc=ttyS0,1500000 kgdbwait

# 4. Connect GDB to kernel
gdb-multiarch vmlinux
(gdb) target remote /dev/ttyUSB0
(gdb) continue
```

**Explanation**:

- **KGDB options** - Enable KGDB debugging features
- **Serial configuration** - Configure serial port for debugging
- **Boot parameters** - Enable KGDB at boot time
- **GDB connection** - Connect GDB to kernel
- **Debugging workflow** - Debug kernel execution

**Where**: KGDB configuration is used in:

- **Kernel development** - Debugging kernel code
- **Driver development** - Debugging device drivers
- **Embedded systems** - Debugging embedded Linux
- **Rock 5B+** - ARM64 kernel debugging

## Debugging Techniques

**What**: Debugging techniques involve various methods for analyzing and debugging kernel code using GDB and KGDB.

**Why**: Understanding debugging techniques is important because:

- **Problem resolution** - Resolve kernel issues and bugs
- **Code analysis** - Analyze kernel code execution
- **Performance analysis** - Analyze kernel performance
- **Crash analysis** - Analyze kernel crashes and panics
- **Development efficiency** - Improve development workflow

**How**: Debugging techniques work through:

```bash
# Example: Debugging techniques
# 1. Breakpoint debugging
(gdb) break function_name
(gdb) break file.c:line_number
(gdb) break *address

# 2. Watchpoint debugging
(gdb) watch variable_name
(gdb) watch *address
(gdb) rwatch variable_name
(gdb) awatch variable_name

# 3. Step debugging
(gdb) step
(gdb) next
(gdb) finish
(gdb) continue

# 4. Variable inspection
(gdb) print variable_name
(gdb) print *pointer
(gdb) print array[0]@10
(gdb) print/x variable_name

# 5. Memory inspection
(gdb) x/10x address
(gdb) x/10i address
(gdb) x/10s address
(gdb) x/10c address

# 6. Stack inspection
(gdb) backtrace
(gdb) frame 0
(gdb) info locals
(gdb) info args

# 7. Register inspection
(gdb) info registers
(gdb) print $pc
(gdb) print $sp
(gdb) print $x0
```

**Explanation**:

- **Breakpoint debugging** - Set breakpoints in code
- **Watchpoint debugging** - Monitor variable changes
- **Step debugging** - Step through code execution
- **Variable inspection** - Examine variable values
- **Memory inspection** - Examine memory contents
- **Stack inspection** - Examine call stack
- **Register inspection** - Examine CPU registers

**Where**: Debugging techniques are used in:

- **Kernel development** - Debugging kernel code
- **Driver development** - Debugging device drivers
- **Embedded systems** - Debugging embedded Linux
- **Rock 5B+** - ARM64 kernel debugging

## Cross-Compilation Debugging

**What**: Cross-compilation debugging involves debugging ARM64 code from x86_64 hosts using GDB and KGDB.

**Why**: Cross-compilation debugging is important because:

- **Development efficiency** - Use powerful development machines
- **Tool availability** - Access to comprehensive debugging tools
- **Resource optimization** - Avoid resource constraints on target
- **CI/CD integration** - Automated debugging in continuous integration
- **Professional development** - Industry-standard debugging practices

**How**: Cross-compilation debugging works through:

```bash
# Example: Cross-compilation debugging
# 1. Set up cross-compilation environment
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
export CC=aarch64-linux-gnu-gcc

# 2. Compile with debug symbols
make -j$(nproc) Image dtbs modules CONFIG_DEBUG_INFO=y

# 3. Set up GDB for cross-compilation
gdb-multiarch vmlinux
(gdb) set architecture aarch64
(gdb) set endian little

# 4. Connect to target
(gdb) target remote /dev/ttyUSB0
(gdb) continue

# 5. Debug cross-compiled code
(gdb) break start_kernel
(gdb) continue
(gdb) step
(gdb) print variable_name
```

**Explanation**:

- **Cross-compilation setup** - Configure environment for cross-compilation
- **Debug symbols** - Include debug information in compiled code
- **GDB configuration** - Configure GDB for target architecture
- **Target connection** - Connect to target hardware
- **Debugging workflow** - Debug cross-compiled code

**Where**: Cross-compilation debugging is used in:

- **Embedded development** - Debugging ARM64 from x86_64
- **Kernel development** - Debugging cross-compiled kernels
- **Driver development** - Debugging cross-compiled drivers
- **Rock 5B+** - ARM64 development from x86_64 hosts

## Key Takeaways

**What** you've accomplished in this lesson:

1. **GDB Understanding** - You understand GDB and KGDB debugging
2. **Setup Skills** - You know how to set up GDB for ARM64
3. **KGDB Configuration** - You can configure KGDB for kernel debugging
4. **Debugging Techniques** - You know various debugging methods
5. **Cross-Compilation** - You understand cross-compilation debugging

**Why** these concepts matter:

- **Kernel debugging** enables effective problem resolution
- **GDB setup** provides the foundation for debugging
- **KGDB configuration** enables kernel-level debugging
- **Debugging techniques** support comprehensive code analysis
- **Cross-compilation** enables embedded development workflows

**When** to use these concepts:

- **Kernel development** - When debugging kernel code
- **Driver development** - When debugging device drivers
- **Crash analysis** - When analyzing kernel crashes
- **Performance analysis** - When analyzing kernel performance
- **Embedded development** - When debugging embedded systems

**Where** these skills apply:

- **Kernel development** - Debugging kernel code and drivers
- **Driver development** - Device driver debugging
- **Embedded systems** - Debugging embedded Linux
- **System administration** - Kernel debugging and analysis
- **Rock 5B+** - ARM64 kernel debugging

## Next Steps

**What** you're ready for next:

After mastering GDB and KGDB debugging, you should be ready to:

1. **Learn kernel logging** - Understand kernel logging and debugging
2. **Study crash analysis** - Learn kernel crash analysis techniques
3. **Explore testing methods** - Understand kernel testing and validation
4. **Begin practical development** - Start debugging real kernel code
5. **Understand deployment** - Learn debugging in production systems

**Where** to go next:

Continue with the next lesson on **"Kernel Logging"** to learn:

- Kernel logging systems and methods
- Log analysis and debugging
- Debugging with kernel logs
- Logging best practices

**Why** the next lesson is important:

The next lesson builds directly on your debugging knowledge by focusing on kernel logging. You'll learn how to use kernel logs for debugging and analysis.

**How** to continue learning:

1. **Practice debugging** - Debug kernel code with GDB and KGDB
2. **Experiment with techniques** - Try different debugging methods
3. **Read documentation** - Study GDB and KGDB documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple debugging projects

## Resources

**Official Documentation**:

- [GDB Documentation](https://www.gnu.org/software/gdb/documentation/) - GDB user manual
- [KGDB Documentation](https://www.kernel.org/doc/html/latest/dev-tools/kgdb.html) - KGDB documentation
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64 specific documentation

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/gdb) - Technical Q&A

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook
- [Understanding the Linux Kernel by Bovet and Cesati](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Detailed kernel internals
- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [Device Tree Specification](https://www.devicetree.org/specifications/) - Device tree documentation

Happy learning! 🐧
