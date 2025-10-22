---
sidebar_position: 3
---

# SMEP and SMAP

Master Supervisor Mode Execution Prevention (SMEP) and Supervisor Mode Access Prevention (SMAP), understanding CPU-level security features that prevent kernel from executing or accessing user-space memory on ARM64 platforms including Rock 5B+.

## What is SMEP and SMAP?

**What**: SMEP (Supervisor Mode Execution Prevention) and SMAP (Supervisor Mode Access Prevention) are CPU security features that prevent the kernel (supervisor mode) from executing code in user-space memory (SMEP) or accessing user-space data (SMAP), providing hardware-enforced protection against certain classes of kernel exploits.

**Why**: Understanding SMEP and SMAP is crucial because:

- **Hardware Protection**: CPU-level security enforcement
- **Exploit Prevention**: Blocks common kernel exploits
- **Privilege Separation**: Enforces kernel/user separation
- **Attack Mitigation**: Prevents privilege escalation
- **Defense in Depth**: Additional security layer
- **Production Security**: Critical for secure systems

**When**: SMEP and SMAP are relevant when:

- **Kernel Execution**: Any kernel code execution
- **System Calls**: System call handling
- **Exception Handling**: Interrupt and exception processing
- **Driver Operations**: Device driver execution
- **Security Enforcement**: Enforcing security policies
- **Production Deployment**: Secure system deployment

**How**: SMEP and SMAP work through:

```c
// Example: SMEP/SMAP implementation
// SMEP/SMAP feature detection
static void detect_smep_smap(void)
{
    #ifdef CONFIG_X86
    unsigned int eax, ebx, ecx, edx;

    // Check CPUID for SMEP (bit 7 of EBX from CPUID.07H.0H)
    cpuid_count(7, 0, &eax, &ebx, &ecx, &edx);

    if (ebx & (1 << 7)) {
        pr_info("SMEP supported\n");
        setup_force_cpu_cap(X86_FEATURE_SMEP);
    }

    // Check CPUID for SMAP (bit 20 of EBX from CPUID.07H.0H)
    if (ebx & (1 << 20)) {
        pr_info("SMAP supported\n");
        setup_force_cpu_cap(X86_FEATURE_SMAP);
    }
    #endif

    #ifdef CONFIG_ARM64
    unsigned long id_aa64mmfr1;

    // Read ARM64 memory model feature register
    asm volatile("mrs %0, ID_AA64MMFR1_EL1" : "=r" (id_aa64mmfr1));

    // Check for PAN (Privileged Access Never) - ARM64 equivalent of SMAP
    if ((id_aa64mmfr1 >> 20) & 0xf) {
        pr_info("PAN (SMAP equivalent) supported\n");
        cpus_set_cap(ARM64_HAS_PAN);
    }

    // Check for UAO (User Access Override)
    if ((id_aa64mmfr1 >> 4) & 0xf) {
        pr_info("UAO supported\n");
        cpus_set_cap(ARM64_HAS_UAO);
    }
    #endif
}

// Enable SMEP/SMAP
static void enable_smep_smap(void)
{
    #ifdef CONFIG_X86
    unsigned long cr4;

    cr4 = __read_cr4();

    // Enable SMEP (bit 20 of CR4)
    if (cpu_has(X86_FEATURE_SMEP))
        cr4 |= X86_CR4_SMEP;

    // Enable SMAP (bit 21 of CR4)
    if (cpu_has(X86_FEATURE_SMAP))
        cr4 |= X86_CR4_SMAP;

    __write_cr4(cr4);
    #endif

    #ifdef CONFIG_ARM64
    // Enable PAN (Privileged Access Never)
    if (system_supports_pan()) {
        asm volatile("msr PAN, #1");
    }
    #endif
}

// Temporarily disable SMAP for legitimate user-space access
static inline void smap_disable(void)
{
    #ifdef CONFIG_X86
    if (static_cpu_has(X86_FEATURE_SMAP))
        clac();  // Clear AC flag in EFLAGS
    #endif

    #ifdef CONFIG_ARM64
    if (system_supports_pan())
        asm volatile("msr PAN, #0");
    #endif
}

// Re-enable SMAP after user-space access
static inline void smap_enable(void)
{
    #ifdef CONFIG_X86
    if (static_cpu_has(X86_FEATURE_SMAP))
        stac();  // Set AC flag in EFLAGS
    #endif

    #ifdef CONFIG_ARM64
    if (system_supports_pan())
        asm volatile("msr PAN, #1");
    #endif
}
```

**Where**: SMEP and SMAP are used in:

- **x86_64 Systems**: Intel and AMD processors
- **ARM64 Systems**: ARM64 processors with PAN
- **All Kernel Code**: Throughout kernel execution
- **System Calls**: System call handlers
- **Rock 5B+**: ARM64 PAN implementation

## ARM64 PAN (Privileged Access Never)

**What**: ARM64 PAN (Privileged Access Never) is the ARM64 equivalent of SMAP, preventing privileged code from accessing user-space memory.

**Why**: Understanding ARM64 PAN is important because:

- **Platform Specifics**: ARM64 specific implementation
- **Hardware Protection**: CPU-level protection on ARM64
- **Embedded Security**: Critical for embedded ARM64
- **Rock 5B+ Protection**: Essential for Rock 5B+ security
- **Industry Standard**: Standard ARM64 security feature

**How**: ARM64 PAN works through:

```c
// Example: ARM64 PAN implementation
// PAN configuration
#define SCTLR_ELx_SPAN  (BIT(23))  // Set Privileged Access Never
#define PSTATE_PAN      (BIT(22))  // PAN bit in PSTATE

// Check if PAN is supported
static inline bool system_supports_pan(void)
{
    u64 mmfr1;

    mmfr1 = read_sysreg_s(SYS_ID_AA64MMFR1_EL1);
    return cpuid_feature_extract_unsigned_field(mmfr1,
                                                ID_AA64MMFR1_PAN_SHIFT);
}

// Enable PAN at boot
static void cpu_enable_pan(const struct arm64_cpu_capabilities *__unused)
{
    config_sctlr_el1(SCTLR_ELx_SPAN, 0);
}

// PAN assembly macros
.macro  __uaccess_disable_pan, tmp
    mrs     \tmp, SCTLR_EL1
    orr     \tmp, \tmp, #SCTLR_ELx_SPAN
    msr     SCTLR_EL1, \tmp
.endm

.macro  __uaccess_enable_pan, tmp
    mrs     \tmp, SCTLR_EL1
    bic     \tmp, \tmp, #SCTLR_ELx_SPAN
    msr     SCTLR_EL1, \tmp
.endm

// User access functions with PAN
static inline unsigned long __must_check
__arch_copy_from_user(void *to, const void __user *from, unsigned long n)
{
    unsigned long res = n;

    // Disable PAN to access user memory
    uaccess_enable_not_uao();

    // Perform the copy
    res = raw_copy_from_user(to, from, n);

    // Re-enable PAN
    uaccess_disable_not_uao();

    return res;
}

static inline unsigned long __must_check
__arch_copy_to_user(void __user *to, const void *from, unsigned long n)
{
    unsigned long res = n;

    uaccess_enable_not_uao();
    res = raw_copy_to_user(to, from, n);
    uaccess_disable_not_uao();

    return res;
}

// Exception handling with PAN
static void do_page_fault_pan(unsigned long addr, unsigned int esr,
                              struct pt_regs *regs)
{
    unsigned long flags;

    // Check if fault was caused by PAN violation
    if (esr & ESR_ELx_PAN) {
        pr_emerg("PAN violation detected!\n");
        pr_emerg("Address: 0x%lx, PC: 0x%lx\n", addr, regs->pc);

        // This is a security violation
        die("Privileged Access Never violation", regs, esr);
    }

    // Handle normal page fault
    do_translation_fault(addr, esr, regs);
}

// Rock 5B+ device tree
/ {
    compatible = "radxa,rock-5b-plus";

    cpus {
        cpu0: cpu@0 {
            compatible = "arm,cortex-a76";
            device_type = "cpu";
            reg = <0x0 0x0>;

            // Security features
            pan-supported;
            uao-supported;
        };
    };
};

// ARM64 kernel configuration
CONFIG_ARM64=y
CONFIG_ARM64_PAN=y
CONFIG_ARM64_UAO=y
CONFIG_ARM64_SW_TTBR0_PAN=y
```

**Explanation**:

- **PSTATE.PAN**: PAN bit in processor state
- **SCTLR_EL1**: System control register configuration
- **User Access**: Controlled user-space access
- **Exception Handling**: PAN violation handling
- **Platform Support**: Rock 5B+ PAN support

**Where**: ARM64 PAN is used in:

- **All ARM64 Systems**: ARM64 Linux kernels
- **System Calls**: System call implementation
- **Exception Handlers**: Interrupt and exception handling
- **Device Drivers**: Driver implementations
- **Rock 5B+**: ARM64 embedded security

## UAO (User Access Override)

**What**: UAO (User Access Override) is an ARM64 feature that allows efficient user-space access while maintaining PAN protection.

**Why**: Understanding UAO is important because:

- **Performance**: Reduces PAN toggle overhead
- **Efficiency**: More efficient user access
- **Security**: Maintains security while improving performance
- **ARM64 Specific**: Important ARM64 feature
- **Production Systems**: Performance optimization

**How**: UAO works through:

```c
// Example: ARM64 UAO implementation
// UAO configuration
#define SCTLR_ELx_UAO   (BIT(29))  // User Access Override

// Check if UAO is supported
static inline bool system_supports_uao(void)
{
    u64 mmfr1;

    mmfr1 = read_sysreg_s(SYS_ID_AA64MMFR1_EL1);
    return cpuid_feature_extract_unsigned_field(mmfr1,
                                                ID_AA64MMFR1_UAO_SHIFT);
}

// Enable UAO
static void cpu_enable_uao(const struct arm64_cpu_capabilities *__unused)
{
    sysreg_clear_set(SCTLR_EL1, 0, SCTLR_ELx_UAO);
}

// User access with UAO
#ifdef CONFIG_ARM64_UAO
static inline void uaccess_enable_not_uao(void)
{
    // With UAO, we don't need to toggle PAN for every access
    if (!system_uses_ttbr0_pan())
        return;

    asm volatile(ALTERNATIVE("nop", SET_PSTATE_PAN(0),
                            ARM64_HAS_PAN, CONFIG_ARM64_PAN));
}

static inline void uaccess_disable_not_uao(void)
{
    if (!system_uses_ttbr0_pan())
        return;

    asm volatile(ALTERNATIVE("nop", SET_PSTATE_PAN(1),
                            ARM64_HAS_PAN, CONFIG_ARM64_PAN));
}
#endif

// Efficient user-space copy with UAO
static inline unsigned long __must_check
__arch_copy_from_user_uao(void *to, const void __user *from, unsigned long n)
{
    // With UAO, single PAN toggle for multiple accesses
    uaccess_enable_uao();

    // Multiple accesses without toggling PAN
    raw_copy_from_user(to, from, n);
    raw_copy_from_user(to + n, from + n, n);
    raw_copy_from_user(to + 2*n, from + 2*n, n);

    uaccess_disable_uao();

    return 0;
}

// Performance measurement
static void measure_uao_performance(void)
{
    unsigned long start, end;
    int i;
    char __user *user_buf = (char __user *)0x1000;
    char kernel_buf[256];

    // Measure without UAO
    start = get_cycles();
    for (i = 0; i < 10000; i++) {
        __arch_copy_from_user(kernel_buf, user_buf, 256);
    }
    end = get_cycles();
    pr_info("Without UAO: %lu cycles\n", end - start);

    // Measure with UAO
    start = get_cycles();
    for (i = 0; i < 10000; i++) {
        __arch_copy_from_user_uao(kernel_buf, user_buf, 256);
    }
    end = get_cycles();
    pr_info("With UAO: %lu cycles\n", end - start);
}
```

**Explanation**:

- **SCTLR_EL1.UAO**: UAO configuration bit
- **Performance**: Reduces PAN toggle overhead
- **Batch Operations**: Multiple accesses per toggle
- **Compatibility**: Works with PAN
- **Optimization**: Performance optimization

**Where**: UAO is used in:

- **ARM64 Systems**: Modern ARM64 processors
- **High-Performance**: Performance-critical code
- **System Calls**: Frequent user-space access
- **Network Stack**: Packet processing
- **File Systems**: Data transfer operations

## SMEP/SMAP Bypass Prevention

**What**: SMEP/SMAP bypass prevention involves additional techniques to prevent attackers from circumventing these protections.

**Why**: Understanding bypass prevention is important because:

- **Attack Sophistication**: Attackers try to bypass protections
- **Defense in Depth**: Multiple protection layers
- **Security Hardening**: Comprehensive security
- **Production Critical**: Essential for secure systems
- **Exploit Mitigation**: Preventing advanced exploits

**How**: Bypass prevention works through:

```c
// Example: SMEP/SMAP bypass prevention
// Prevent user-space mapping of kernel addresses
static int check_kernel_address_mapping(struct vm_area_struct *vma)
{
    unsigned long vm_start = vma->vm_start;
    unsigned long vm_end = vma->vm_end;

    // Prevent mapping kernel address space to user
    if (vm_start < PAGE_OFFSET && vm_end > PAGE_OFFSET) {
        pr_alert("Attempted to map kernel addresses to user space!\n");
        pr_alert("Range: 0x%lx-0x%lx\n", vm_start, vm_end);
        return -EINVAL;
    }

    return 0;
}

// Prevent executable user-space pages in kernel
static int check_executable_user_pages(void)
{
    struct task_struct *task = current;
    struct vm_area_struct *vma;

    for (vma = task->mm->mmap; vma; vma = vma->vm_next) {
        // Check if user-space page is executable
        if ((vma->vm_flags & VM_EXEC) &&
            (vma->vm_start < PAGE_OFFSET)) {

            // Mark for monitoring
            vma->vm_flags |= VM_DONTCOPY;

            pr_info("Found executable user page: 0x%lx-0x%lx\n",
                   vma->vm_start, vma->vm_end);
        }
    }

    return 0;
}

// JIT code hardening
static void harden_jit_code(void *code, size_t size)
{
    struct page *pages[MAX_JIT_PAGES];
    int nr_pages, i;

    nr_pages = (size + PAGE_SIZE - 1) / PAGE_SIZE;
    if (nr_pages > MAX_JIT_PAGES)
        return;

    // Get pages for JIT code
    nr_pages = get_user_pages_fast((unsigned long)code, nr_pages,
                                   FOLL_WRITE, pages);

    // Make JIT pages non-executable from kernel
    for (i = 0; i < nr_pages; i++) {
        set_memory_nx((unsigned long)page_address(pages[i]), 1);
    }

    // Release pages
    for (i = 0; i < nr_pages; i++) {
        put_page(pages[i]);
    }
}

// ROP/JOP mitigation
static void mitigate_rop_jop(void)
{
    struct module *mod;

    // Remove unnecessary ROP gadgets from kernel
    mutex_lock(&module_mutex);
    list_for_each_entry(mod, &modules, list) {
        // Mark module code as non-writable
        set_memory_ro((unsigned long)mod->core_layout.base,
                     mod->core_layout.text_size >> PAGE_SHIFT);
    }
    mutex_unlock(&module_mutex);
}

// Control Flow Integrity (CFI)
#ifdef CONFIG_CFI_CLANG
static void __cfi_check(uint64_t id, void *ptr, void *diag)
{
    // Verify indirect call target is valid
    if (!__builtin_cfi_check(id, ptr)) {
        pr_emerg("CFI violation detected!\n");
        pr_emerg("ID: 0x%llx, Pointer: %p\n", id, ptr);
        BUG();
    }
}
#endif

// Shadow stack (future ARM64 feature)
#ifdef CONFIG_ARM64_SHADOW_CALL_STACK
static void setup_shadow_stack(void)
{
    unsigned long shadow_stack;

    // Allocate shadow stack
    shadow_stack = __get_free_pages(GFP_KERNEL, SHADOW_STACK_ORDER);
    if (!shadow_stack)
        return;

    // Configure shadow stack register
    write_sysreg(shadow_stack, shadow_stack_pointer);

    // Enable shadow stack
    config_sctlr_el1(SCTLR_ELx_SSE, SCTLR_ELx_SSE);
}
#endif
```

**Explanation**:

- **Address Validation**: Preventing kernel address mapping
- **Page Protection**: Preventing executable user pages
- **JIT Hardening**: Protecting JIT compiled code
- **ROP Mitigation**: Preventing return-oriented programming
- **CFI**: Control flow integrity checking

**Where**: Bypass prevention is used in:

- **Kernel Hardening**: Throughout kernel security
- **JIT Compilers**: eBPF, JavaScript engines
- **Security Modules**: Security framework integration
- **Production Systems**: Comprehensive protection
- **High-Security**: Government and financial systems

## Performance Impact and Optimization

**What**: SMEP/SMAP have performance impact that must be balanced against security benefits.

**Why**: Understanding performance impact is important because:

- **Overhead**: Some overhead is inherent
- **Optimization**: Minimizing performance impact
- **Real-Time**: Timing guarantees needed
- **Embedded Systems**: Resource constraints
- **Production**: Performance requirements

**How**: Performance optimization involves:

```c
// Example: SMEP/SMAP performance optimization
// Minimize PAN toggles
static inline int optimized_user_access(void __user *ptr, size_t len)
{
    int ret;

    // Single PAN toggle for multiple operations
    uaccess_enable();

    ret = do_operation_1(ptr, len);
    if (ret == 0)
        ret = do_operation_2(ptr, len);
    if (ret == 0)
        ret = do_operation_3(ptr, len);

    uaccess_disable();

    return ret;
}

// Use UAO for better performance
#ifdef CONFIG_ARM64_UAO
static inline void bulk_user_copy(void __user *to, const void *from,
                                 size_t count)
{
    // UAO allows efficient bulk operations
    uaccess_enable_uao();

    while (count > 0) {
        size_t chunk = min(count, (size_t)PAGE_SIZE);
        raw_copy_to_user(to, from, chunk);
        to += chunk;
        from += chunk;
        count -= chunk;
    }

    uaccess_disable_uao();
}
#endif

// Measure performance impact
static void measure_smep_smap_overhead(void)
{
    unsigned long start, end;
    int i;

    // Measure system call overhead
    start = get_cycles();
    for (i = 0; i < 100000; i++) {
        syscall(SYS_getpid);
    }
    end = get_cycles();

    pr_info("System call overhead with SMAP: %lu cycles\n",
            (end - start) / 100000);
}

// Kernel configuration for performance
CONFIG_ARM64_PAN=y
CONFIG_ARM64_UAO=y           // Enable for better performance
CONFIG_ARM64_SW_TTBR0_PAN=n  // Use hardware PAN for performance
```

**Explanation**:

- **Batch Operations**: Reducing toggle frequency
- **UAO Usage**: Using hardware optimizations
- **Performance Monitoring**: Measuring overhead
- **Configuration**: Optimal kernel configuration
- **Hardware Features**: Leveraging CPU features

**Where**: Performance optimization applies to:

- **System Calls**: Frequent kernel-user transitions
- **Network Stack**: High-throughput operations
- **File Systems**: Bulk data transfers
- **Real-Time Systems**: Timing-critical operations
- **Embedded Systems**: Resource-constrained devices

## Key Takeaways

**What** you've accomplished in this lesson:

1. **SMEP/SMAP Understanding**: You understand hardware security features
2. **ARM64 PAN**: You know ARM64 privileged access protection
3. **UAO Knowledge**: You understand performance optimization
4. **Bypass Prevention**: You know how to prevent bypasses
5. **Performance Optimization**: You understand performance impact
6. **Production Readiness**: You can implement SMEP/SMAP/PAN

**Why** these concepts matter:

- **Hardware Protection**: CPU-level security
- **Exploit Prevention**: Blocks kernel exploits
- **Privilege Separation**: Enforces separation
- **Industry Standard**: Standard security feature
- **Professional Skills**: Essential security knowledge

**When** to use these concepts:

- **System Configuration**: Enabling hardware features
- **Security Hardening**: Implementing protections
- **Development**: Writing secure kernel code
- **Deployment**: Deploying secure systems
- **Debugging**: Understanding security violations

**Where** these skills apply:

- **Kernel Development**: Implementing security
- **System Administration**: Configuring security
- **Embedded Development**: Securing embedded systems
- **Security Engineering**: Designing secure systems
- **Professional Development**: Working in security

## Next Steps

**What** you're ready for next:

After mastering SMEP and SMAP, you should be ready to:

1. **Learn Security Monitoring**: Understand event monitoring
2. **Study Audit Framework**: Learn security auditing
3. **Explore Intrusion Detection**: Understand threat detection
4. **Master Security**: Comprehensive security knowledge
5. **Implement Systems**: Build secure systems

**Where** to go next:

Continue with the next lesson on **"Audit Framework"** to learn:

- Linux audit system
- Security event logging
- Audit rule configuration
- Compliance and monitoring

**Why** the next lesson is important:

The next lesson builds on your hardening knowledge by adding security monitoring capabilities, enabling you to detect and respond to security events.

**How** to continue learning:

1. **Study SMEP/SMAP**: Analyze implementation
2. **Experiment with Rock 5B+**: Configure PAN/UAO
3. **Read Documentation**: Study ARM64 security features
4. **Join Communities**: Engage with security developers
5. **Build Projects**: Implement hardware security

## Resources

**Official Documentation**:

- [Intel SDM](https://www.intel.com/content/www/us/en/developer/articles/technical/intel-sdm.html) - Intel security features
- [ARM ARM](https://developer.arm.com/documentation/) - ARM architecture reference
- [ARM64 PAN](https://developer.arm.com/documentation/ddi0595/latest/) - PAN documentation

**Community Resources**:

- [Kernel Self-Protection](https://kernsec.org/wiki/index.php/Kernel_Self_Protection_Project) - Security project
- [Linux Security List](https://lore.kernel.org/linux-security-module/) - Security discussions
- [ARM Security](https://community.arm.com/support-forums/f/architectures-and-processors-forum) - ARM security forum

**Learning Resources**:

- [Computer Architecture](https://www.elsevier.com/books/computer-architecture/hennessy/978-0-12-811905-1) - Architecture fundamentals
- [System Security](https://www.schneier.com/books/secrets_and_lies/) - Security principles
- [Hardware Security](https://www.springer.com/gp/book/9783030388898) - Hardware security

**Rock 5B+ Specific**:

- [Rock 5B+ Security](https://wiki.radxa.com/Rock5/security) - Board security features
- [ARM Cortex-A76](https://developer.arm.com/Processors/Cortex-A76) - CPU security features
- [RK3588 Documentation](https://www.rock-chips.com/a/en/products/RK3588/) - SoC security

Happy learning! 🐧
