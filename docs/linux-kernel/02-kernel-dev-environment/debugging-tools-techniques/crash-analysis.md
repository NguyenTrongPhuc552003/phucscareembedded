---
sidebar_position: 3
---

# Crash Analysis

Master kernel crash analysis techniques to diagnose and resolve system failures on Rock 5B+ ARM64 systems.

## What is Crash Analysis?

**What**: Crash analysis is the systematic process of examining kernel crashes, panics, and system failures to identify root causes and develop solutions.

**Why**: Understanding crash analysis is crucial because:

- **System reliability** - Identify and fix system stability issues
- **Root cause analysis** - Understand why crashes occur
- **Prevention** - Develop strategies to prevent similar crashes
- **Debugging efficiency** - Faster problem resolution
- **Production support** - Essential for maintaining production systems

**When**: Crash analysis is performed when:

- **Kernel panics** - System crashes with kernel panic messages
- **OOM conditions** - Out-of-memory situations
- **Hardware failures** - Hardware-related system crashes
- **Driver issues** - Device driver crashes and failures
- **Memory corruption** - Memory-related system failures

**How**: Crash analysis works through:

```bash
# Example: Basic crash analysis workflow
# 1. Collect crash information
dmesg | tail -50 > crash_log.txt
cat /proc/vmcore > vmcore.dump

# 2. Analyze crash dump
crash vmcore.dump vmlinux
crash> bt
crash> ps
crash> files
crash> mount

# 3. Examine specific subsystems
crash> kmem -s
crash> kmem -i
crash> task -R
```

**Where**: Crash analysis is essential in:

- **Production systems** - Maintaining system reliability
- **Development environments** - Debugging kernel issues
- **Embedded systems** - IoT and industrial devices
- **Real-time systems** - Critical system stability
- **Rock 5B+** - ARM64 embedded development

## Kernel Panic Analysis

**What**: Kernel panic analysis examines system crashes where the kernel stops execution due to critical errors.

**Why**: Understanding kernel panic analysis is important because:

- **Critical failures** - Panics indicate serious system problems
- **System stability** - Panics can cause data loss and downtime
- **Root cause identification** - Understanding why panics occur
- **Prevention strategies** - Developing crash prevention methods
- **Debugging skills** - Essential kernel debugging capability

**How**: Kernel panic analysis involves:

```c
// Example: Kernel panic handling
// Panic function in kernel
void panic(const char *fmt, ...)
{
    static char buf[1024];
    va_list args;
    long i, i_next = 0;
    int state = 0;
    int old_cpu, this_cpu;
    bool _crash_kexec_post_notifiers = crash_kexec_post_notifiers;

    // Disable interrupts
    local_irq_disable();
    preempt_disable_notrace();

    // Set panic flag
    atomic_notifier_call_chain(&panic_notifier_list, 0, buf);

    // Print panic message
    va_start(args, fmt);
    vsnprintf(buf, sizeof(buf), fmt, args);
    va_end(args);

    pr_emerg("Kernel panic - not syncing: %s\n", buf);

    // Dump stack trace
    dump_stack();

    // Attempt crash dump
    if (!_crash_kexec_post_notifiers)
        __crash_kexec(NULL);

    // Notify other CPUs
    smp_send_stop();

    // Final crash dump
    if (_crash_kexec_post_notifiers)
        __crash_kexec(NULL);

    // Halt system
    emergency_restart();
}

// Stack trace dumping
void dump_stack(void)
{
    unsigned long *sp;
    unsigned long addr;
    int i;

    pr_emerg("Call Trace:\n");
    sp = (unsigned long *)current_stack_pointer;

    for (i = 0; i < 20; i++) {
        if (kstack_end(sp))
            break;
        if (__get_user(addr, sp)) {
            pr_emerg(" ...\n");
            break;
        }
        sp++;
        if (addr && kernel_text_address(addr))
            pr_emerg(" [<%016lx>] %pS\n", addr, (void *)addr);
    }
}
```

**Explanation**:

- **Panic sequence** - Steps taken when kernel panics
- **Stack trace** - Shows function call sequence leading to panic
- **Memory dumps** - Captures system state at crash time
- **CPU state** - Registers and processor state information
- **Error messages** - Descriptive error information

**Where**: Kernel panic analysis is critical in:

- **System debugging** - Understanding system failures
- **Driver development** - Debugging driver crashes
- **Memory management** - Analyzing memory-related panics
- **Hardware issues** - Diagnosing hardware failures
- **Rock 5B+** - ARM64 specific panic analysis

## Memory Corruption Analysis

**What**: Memory corruption analysis examines memory-related crashes and data corruption issues.

**Why**: Understanding memory corruption analysis is crucial because:

- **Data integrity** - Memory corruption can cause data loss
- **System stability** - Memory issues can crash the system
- **Security implications** - Memory corruption can be security vulnerabilities
- **Debugging complexity** - Memory issues are often difficult to debug
- **Performance impact** - Memory corruption affects system performance

**How**: Memory corruption analysis involves:

```c
// Example: Memory corruption detection
// Memory debugging tools
#ifdef CONFIG_DEBUG_PAGEALLOC
void __init init_debug_pagealloc(void)
{
    if (!debug_pagealloc_enabled())
        return;

    static_branch_enable(&_debug_pagealloc_enabled);
    pr_info("debug pagealloc enabled\n");
}
#endif

// Slab corruption detection
void check_slab_errors(void)
{
    struct kmem_cache *s;
    struct slab *slab;
    int i;

    list_for_each_entry(s, &slab_caches, list) {
        if (!(s->flags & SLAB_DEBUG))
            continue;

        for_each_slab(s, slab, i) {
            if (slab->inuse == 0)
                continue;

            if (check_slab(s, slab)) {
                pr_err("slab corruption detected in %s\n", s->name);
                dump_slab(s, slab);
            }
        }
    }
}

// Use-after-free detection
void kfree_sensitive(const void *p)
{
    size_t ks;
    void *mem = (void *)p;

    if (unlikely(ZERO_OR_NULL_PTR(mem)))
        return;

    ks = ksize(mem);
    memset(mem, 0, ks);
    kfree(mem);
}

// Double-free detection
void kfree(const void *p)
{
    struct page *page;
    void *object = (void *)p;

    if (unlikely(ZERO_OR_NULL_PTR(object)))
        return;

    page = virt_to_head_page(object);
    if (unlikely(!PageSlab(page))) {
        pr_err("kfree: bad object %p\n", object);
        dump_stack();
        return;
    }

    slab_free(page->slab_cache, page, object, NULL);
}
```

**Explanation**:

- **Memory debugging** - Tools to detect memory corruption
- **Slab validation** - Checking slab allocator integrity
- **Use-after-free** - Detecting freed memory access
- **Double-free** - Detecting multiple frees of same memory
- **Buffer overflow** - Detecting buffer overrun conditions

**Where**: Memory corruption analysis is important in:

- **Memory management** - Debugging memory allocator issues
- **Driver development** - Finding memory bugs in drivers
- **Security analysis** - Identifying security vulnerabilities
- **System stability** - Preventing memory-related crashes
- **Rock 5B+** - ARM64 memory management debugging

## Hardware-Related Crashes

**What**: Hardware-related crash analysis examines system failures caused by hardware issues.

**Why**: Understanding hardware crash analysis is important because:

- **Hardware failures** - Hardware can cause system crashes
- **Diagnostic capabilities** - Identify failing hardware components
- **Preventive maintenance** - Schedule hardware replacement
- **System reliability** - Maintain system uptime
- **Cost management** - Avoid unnecessary hardware replacement

**How**: Hardware crash analysis involves:

```c
// Example: Hardware error handling
// Machine check exception handling
void do_machine_check(struct pt_regs *regs, long error_code)
{
    struct mce m;
    int i;
    int worst = 0;
    int severity;

    // Read machine check registers
    for (i = 0; i < mca_cfg.banks; i++) {
        if (!(mce_banks[i].init))
            continue;

        mce_read(&m, i);
        if (!(m.status & MCI_STATUS_VAL))
            continue;

        severity = mce_severity(&m, mca_cfg.tolerant, NULL, false);
        if (severity > worst) {
            worst = severity;
            memcpy(&mce_polled, &m, sizeof(m));
        }

        if (severity == MCE_UC_SEVERITY) {
            // Uncorrected error - panic
            pr_emerg("Machine check: %s\n", mce_get_msg(&m));
            panic("Hardware error");
        }
    }

    // Log corrected errors
    if (worst >= MCE_KEEP_SEVERITY)
        mce_log(&mce_polled);
}

// PCI error handling
void pci_ue_error(struct pci_dev *dev, struct aer_error_info *info)
{
    int type = info->severity == AER_CORRECTABLE ? "corrected" : "uncorrected";
    int id = pci_dev_id(dev);

    pr_err("PCIe Bus Error: severity=%s, type=%s, id=%04x:%02x:%02x.%x\n",
           type, aer_error_severity_string[info->severity],
           id >> 16, (id >> 8) & 0xff, (id >> 3) & 0x1f, id & 0x7);

    if (info->severity == AER_FATAL)
        panic("PCIe Fatal Error");
}

// Memory error handling
void memory_failure(unsigned long pfn, int flags)
{
    struct page *p;
    int res;

    p = pfn_to_page(pfn);
    if (!p) {
        pr_err("Memory failure: %#lx: unknown page\n", pfn);
        return;
    }

    if (PageHuge(p)) {
        res = memory_failure_hugetlb(pfn, flags);
    } else {
        res = memory_failure_dev_pagemap(pfn, flags, NULL);
    }

    if (res == 0) {
        pr_err("Memory failure: %#lx: recovery action: %s\n",
               pfn, action_name[res]);
    } else {
        pr_err("Memory failure: %#lx: recovery action: %s\n",
               pfn, action_name[res]);
    }
}
```

**Explanation**:

- **Machine check** - CPU hardware error detection
- **PCI errors** - PCIe bus error handling
- **Memory errors** - ECC and memory failure handling
- **Error severity** - Classifying error severity levels
- **Recovery actions** - Attempting error recovery

**Where**: Hardware crash analysis is essential in:

- **Server systems** - High-availability server environments
- **Embedded systems** - Industrial and IoT devices
- **Real-time systems** - Critical system reliability
- **Data centers** - Maintaining service availability
- **Rock 5B+** - ARM64 hardware error handling

## Crash Dump Analysis Tools

**What**: Crash dump analysis tools help examine system state at the time of crash.

**Why**: Understanding crash dump tools is important because:

- **Post-mortem analysis** - Analyze crashes after they occur
- **System state capture** - Preserve system state at crash time
- **Root cause identification** - Find the cause of crashes
- **Debugging efficiency** - Faster problem resolution
- **Production support** - Analyze production system crashes

**How**: Crash dump analysis tools work through:

```bash
# Example: Crash dump analysis with crash utility
# Install crash utility
sudo apt install -y crash

# Analyze crash dump
crash vmcore.dump vmlinux

# Basic commands
crash> help                    # Show available commands
crash> bt                      # Show backtrace
crash> ps                      # Show process list
crash> files                   # Show open files
crash> mount                   # Show mounted filesystems

# Memory analysis
crash> kmem -s                 # Show slab usage
crash> kmem -i                 # Show memory info
crash> vtop 0xffff880000000000 # Virtual to physical translation

# Process analysis
crash> task -R                 # Show all tasks
crash> task 1234               # Show specific task
crash> bt 1234                 # Show backtrace for task

# Network analysis
crash> net                     # Show network devices
crash> files -n                # Show network files

# Filesystem analysis
crash> mount                   # Show mounted filesystems
crash> files -p 1234           # Show files for process

# Hardware analysis
crash> irq                     # Show interrupt information
crash> dev                     # Show device information
```

**Explanation**:

- **Crash utility** - Primary tool for dump analysis
- **Memory commands** - Analyze memory usage and corruption
- **Process commands** - Examine process state and threads
- **Network commands** - Analyze network subsystem state
- **Hardware commands** - Examine hardware configuration

**Where**: Crash dump analysis tools are used in:

- **System administration** - Maintaining system reliability
- **Kernel development** - Debugging kernel issues
- **Driver development** - Analyzing driver crashes
- **Production support** - Supporting production systems
- **Rock 5B+** - ARM64 crash analysis

## ARM64 Specific Crash Analysis

**What**: ARM64 specific crash analysis addresses unique aspects of ARM64 architecture crashes.

**Why**: Understanding ARM64 crash analysis is important because:

- **Architecture differences** - ARM64 has different crash characteristics
- **Register layout** - Different register structure and usage
- **Memory model** - ARM64 specific memory ordering and caching
- **Exception handling** - ARM64 specific exception vectors
- **Debugging tools** - ARM64 specific debugging capabilities

**How**: ARM64 crash analysis involves:

```c
// Example: ARM64 crash analysis
// ARM64 exception handling
asmlinkage void __exception_irq_entry arm64_handle_irq(struct pt_regs *regs)
{
    gic_handle_irq(regs);
}

// ARM64 panic handling
void arm64_panic_die(const char *str, struct pt_regs *regs, int err)
{
    pr_emerg("Kernel panic - not syncing: %s\n", str);
    dump_regs(regs);
    dump_stack();
    smp_send_stop();
    emergency_restart();
}

// ARM64 register dumping
void dump_regs(struct pt_regs *regs)
{
    int i;

    pr_emerg("pc : %016llx lr : %016llx pstate: %08llx\n",
             regs->pc, regs->regs[30], regs->pstate);
    pr_emerg("sp : %016llx x29: %016llx x28: %016llx\n",
             regs->sp, regs->regs[29], regs->regs[28]);

    for (i = 0; i < 28; i += 2) {
        pr_emerg("x%-2d: %016llx x%-2d: %016llx\n",
                 i, regs->regs[i], i+1, regs->regs[i+1]);
    }
}

// ARM64 memory error handling
void arm64_memory_failure(unsigned long pfn, int flags)
{
    struct page *p;
    int res;

    p = pfn_to_page(pfn);
    if (!p) {
        pr_err("Memory failure: %#lx: unknown page\n", pfn);
        return;
    }

    // ARM64 specific memory error handling
    if (is_huge_page(p)) {
        res = memory_failure_hugetlb(pfn, flags);
    } else {
        res = memory_failure_dev_pagemap(pfn, flags, NULL);
    }

    pr_err("Memory failure: %#lx: recovery action: %s\n",
           pfn, action_name[res]);
}
```

**Explanation**:

- **ARM64 registers** - 64-bit register layout and usage
- **Exception vectors** - ARM64 specific exception handling
- **Memory model** - ARM64 memory ordering and barriers
- **Cache management** - ARM64 cache coherency protocols
- **Debug registers** - ARM64 specific debugging features

**Where**: ARM64 crash analysis is important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **Mobile devices** - Smartphones and tablets
- **Server systems** - ARM64 servers and workstations
- **Rock 5B+** - ARM64 single-board computer

## Rock 5B+ Crash Analysis

**What**: Rock 5B+ specific crash analysis addresses unique aspects of the Rock 5B+ platform.

**Why**: Understanding Rock 5B+ crash analysis is important because:

- **Platform specifics** - Rock 5B+ has unique hardware characteristics
- **RK3588 SoC** - Specific SoC features and limitations
- **Embedded nature** - Resource-constrained environment
- **Real-world application** - Practical embedded development
- **Debugging tools** - Platform-specific debugging capabilities

**How**: Rock 5B+ crash analysis involves:

```c
// Example: Rock 5B+ crash analysis
// Rock 5B+ device tree for crash analysis
/ {
    compatible = "radxa,rock-5b-plus";
    model = "Radxa ROCK 5B+";

    memory@0 {
        device_type = "memory";
        reg = <0x0 0x0 0x0 0x80000000>; // 8GB RAM
    };

    cpus {
        cpu0: cpu@0 {
            compatible = "arm,cortex-a76";
            device_type = "cpu";
            reg = <0x0 0x0>;
            enable-method = "psci";
        };
        // ... more CPUs
    };

    // UART for crash output
    uart0: serial@fdd50000 {
        compatible = "rockchip,rk3588-uart", "snps,dw-apb-uart";
        reg = <0x0 0xfdd50000 0x0 0x100>;
        interrupts = <GIC_SPI 333 IRQ_TYPE_LEVEL_HIGH>;
        clocks = <&cru SCLK_UART0>, <&cru PCLK_UART0>;
        clock-names = "baudclk", "apb_pclk";
        status = "okay";
    };

    // GPIO for crash indicators
    gpio0: gpio@fdd60000 {
        compatible = "rockchip,gpio-bank";
        reg = <0x0 0xfdd60000 0x0 0x100>;
        interrupts = <GIC_SPI 277 IRQ_TYPE_LEVEL_HIGH>;
        clocks = <&cru PCLK_GPIO0>;
        gpio-controller;
        #gpio-cells = <2>;
        interrupt-controller;
        #interrupt-cells = <2>;
    };
};

// Rock 5B+ specific crash handling
void rock5b_crash_handler(struct pt_regs *regs)
{
    // Dump Rock 5B+ specific information
    pr_emerg("Rock 5B+ Crash Analysis:\n");
    pr_emerg("SoC: RK3588\n");
    pr_emerg("Memory: 8GB\n");
    pr_emerg("CPU: ARM Cortex-A76\n");

    // Dump register state
    dump_regs(regs);

    // Dump memory information
    pr_emerg("Memory usage:\n");
    show_mem(0, NULL);

    // Dump process information
    pr_emerg("Process information:\n");
    show_state();

    // Dump interrupt information
    pr_emerg("Interrupt information:\n");
    show_interrupts();
}
```

**Explanation**:

- **Platform identification** - Rock 5B+ specific hardware info
- **Memory layout** - 8GB RAM configuration and layout
- **CPU information** - ARM Cortex-A76 specific details
- **Peripheral status** - UART, GPIO, and other peripherals
- **Debug capabilities** - Platform-specific debugging features

**Where**: Rock 5B+ crash analysis is important in:

- **Embedded development** - Learning practical embedded debugging
- **ARM64 systems** - Understanding ARM64 crash analysis
- **Single-board computers** - SBC development and debugging
- **Real-time systems** - Real-time Linux on ARM64
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Crash Analysis Understanding** - You understand kernel crash analysis concepts
2. **Panic Analysis** - You know how to analyze kernel panics
3. **Memory Corruption** - You understand memory corruption analysis
4. **Hardware Crashes** - You know how to analyze hardware-related crashes
5. **Tool Proficiency** - You can use crash analysis tools effectively
6. **Platform Specifics** - You know Rock 5B+ specific crash analysis

**Why** these concepts matter:

- **System reliability** - Essential for maintaining stable systems
- **Debugging skills** - Critical kernel debugging capability
- **Problem resolution** - Faster identification and resolution of issues
- **Production support** - Essential for production system maintenance
- **Professional development** - Valuable skill for kernel developers

**When** to use these concepts:

- **System crashes** - When systems crash or panic
- **Memory issues** - When memory corruption is suspected
- **Hardware failures** - When hardware causes system issues
- **Driver problems** - When device drivers cause crashes
- **Performance issues** - When analyzing system performance problems

**Where** these skills apply:

- **Kernel development** - Debugging kernel code and drivers
- **System administration** - Maintaining system reliability
- **Embedded development** - Debugging embedded Linux systems
- **Production support** - Supporting production systems
- **Professional development** - Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering crash analysis, you should be ready to:

1. **Learn kernel testing** - Understand kernel testing methodologies
2. **Study static analysis** - Learn static code analysis techniques
3. **Explore code review** - Understand code review processes
4. **Begin practical development** - Start working with kernel modules
5. **Understand performance analysis** - Learn kernel performance analysis

**Where** to go next:

Continue with the next lesson on **"Kernel Testing"** to learn:

- Kernel testing frameworks and methodologies
- Unit testing and integration testing
- Performance testing and benchmarking
- Test-driven development practices

**Why** the next lesson is important:

The next lesson builds on your debugging knowledge by teaching you how to prevent crashes through proper testing. You'll learn how to write tests that can catch issues before they cause system crashes.

**How** to continue learning:

1. **Practice crash analysis** - Analyze real crash dumps and logs
2. **Study kernel source** - Explore crash handling code in the kernel
3. **Read documentation** - Study crash analysis documentation
4. **Join communities** - Engage with kernel developers and system administrators
5. **Build projects** - Start with simple crash analysis projects

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Crash Utility](https://crash-utility.github.io/) - Crash dump analysis tool
- [ARM64 Exception Handling](https://www.kernel.org/doc/html/latest/arm64/exception.html) - ARM64 exception documentation

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
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

Happy learning! 🐧
