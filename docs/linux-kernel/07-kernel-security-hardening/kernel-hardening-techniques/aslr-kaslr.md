---
sidebar_position: 2
---

# ASLR and KASLR

Master Address Space Layout Randomization (ASLR) and Kernel Address Space Layout Randomization (KASLR), understanding memory layout randomization, exploit mitigation, and implementation on ARM64 platforms including Rock 5B+.

## What is ASLR and KASLR?

**What**: ASLR (Address Space Layout Randomization) randomizes the memory addresses used by user-space processes, while KASLR (Kernel Address Space Layout Randomization) randomizes kernel memory addresses, making it difficult for attackers to predict memory locations.

**Why**: Understanding ASLR and KASLR is crucial because:

- **Exploit Mitigation**: Makes memory corruption exploits harder
- **Address Unpredictability**: Attackers can't predict addresses
- **Defense in Depth**: Additional security layer
- **Attack Prevention**: Prevents return-oriented programming
- **Production Security**: Essential for secure deployments
- **Industry Standard**: Standard security practice

**When**: ASLR/KASLR is relevant when:

- **Process Creation**: User-space process initialization
- **Kernel Boot**: Kernel initialization and loading
- **Library Loading**: Dynamic library loading
- **Memory Allocation**: Memory mapping operations
- **Security Hardening**: Implementing security measures
- **Production Deployment**: Deploying secure systems

**How**: ASLR/KASLR works through:

```c
// Example: KASLR implementation
// KASLR boot setup
static unsigned long __init kaslr_choose_location(unsigned long input,
                                                  unsigned long input_size,
                                                  unsigned long output,
                                                  unsigned long output_size,
                                                  unsigned long *virt_addr)
{
    unsigned long random_addr, min_addr;
    unsigned long slots, slot;

    // Get entropy for randomization
    random_addr = get_random_long();

    // Calculate available slots for kernel
    min_addr = min(*virt_addr, output);
    slots = (output_size - input_size) / CONFIG_PHYSICAL_ALIGN;

    if (!slots)
        return output;

    // Choose random slot
    slot = random_addr % slots;
    random_addr = min_addr + slot * CONFIG_PHYSICAL_ALIGN;

    *virt_addr = random_addr;
    return random_addr;
}

// ASLR for user-space
static unsigned long arch_randomize_brk(struct mm_struct *mm)
{
    unsigned long range_end = mm->brk + 0x02000000;
    unsigned long random_offset;

    random_offset = get_random_long() & (0x02000000 - 1);
    return PAGE_ALIGN(mm->brk + random_offset);
}

// Stack randomization
static unsigned long randomize_stack_top(unsigned long stack_top)
{
    unsigned long random_variable = 0;

    if (current->flags & PF_RANDOMIZE) {
        random_variable = get_random_long();
        random_variable &= STACK_RND_MASK;
        random_variable <<= PAGE_SHIFT;
    }

    return PAGE_ALIGN(stack_top - random_variable);
}

// MMAP randomization
static unsigned long arch_mmap_rnd(void)
{
    unsigned long rnd;

    rnd = get_random_long();
    rnd &= ((1UL << mmap_rnd_bits) - 1) << PAGE_SHIFT;

    return rnd;
}
```

**Where**: ASLR/KASLR is used in:

- **All Modern Systems**: Desktop, server, and embedded
- **User-Space**: All user processes
- **Kernel Space**: Kernel code and data
- **Shared Libraries**: Dynamic library loading
- **Rock 5B+**: ARM64 ASLR/KASLR implementation

## KASLR Implementation

**What**: KASLR implementation randomizes the kernel's base address during boot, making kernel addresses unpredictable to attackers.

**Why**: Understanding KASLR implementation is important because:

- **Kernel Protection**: Protects kernel from attacks
- **Address Unpredictability**: Randomizes kernel layout
- **Exploit Mitigation**: Makes kernel exploits harder
- **Security Enhancement**: Additional security layer
- **Production Required**: Essential for production systems

**How**: KASLR implementation works through:

```c
// Example: KASLR detailed implementation
// KASLR entropy sources
struct kaslr_entropy {
    unsigned long rdrand;
    unsigned long rdtsc;
    unsigned long boot_params;
    unsigned long system_info;
};

// Gather entropy for KASLR
static void gather_kaslr_entropy(struct kaslr_entropy *entropy)
{
    // Try RDRAND if available
    #ifdef CONFIG_X86
    if (has_cpuflag(X86_FEATURE_RDRAND)) {
        asm volatile("rdrand %0" : "=r" (entropy->rdrand));
    }
    #endif

    // Use ARM64 RNDR if available
    #ifdef CONFIG_ARM64
    if (cpus_have_const_cap(ARM64_HAS_RNG)) {
        asm volatile("mrs %0, RNDR" : "=r" (entropy->rdrand));
    }
    #endif

    // Use timestamp counter
    entropy->rdtsc = get_cycles();

    // Use boot parameters
    entropy->boot_params = (unsigned long)boot_params;

    // Mix in system information
    entropy->system_info = (unsigned long)&entropy;
}

// Mix entropy sources
static unsigned long mix_kaslr_entropy(struct kaslr_entropy *entropy)
{
    unsigned long mixed;

    mixed = entropy->rdrand;
    mixed ^= entropy->rdtsc;
    mixed ^= entropy->boot_params;
    mixed ^= entropy->system_info;

    // Use SHA256 to mix entropy
    return sha256_hash(&mixed, sizeof(mixed));
}

// Apply KASLR offset
static void __init apply_kaslr_offset(unsigned long offset)
{
    extern char _text[], _end[];
    unsigned long size = _end - _text;

    // Relocate kernel image
    memmove(_text + offset, _text, size);

    // Update symbol addresses
    update_symbol_table(offset);

    // Update page tables
    update_kernel_page_tables(offset);
}

// ARM64 KASLR
#ifdef CONFIG_ARM64
static void __init arm64_kaslr_init(void)
{
    u64 kernel_start, kernel_end;
    u64 range, offset;

    kernel_start = (u64)_text;
    kernel_end = (u64)_end;

    // Calculate randomization range
    range = VMEMMAP_START - kernel_start;

    // Get random offset
    offset = get_random_u64() % (range / SZ_2M) * SZ_2M;

    // Apply offset with 2MB alignment
    kernel_start += offset;
    kernel_end += offset;

    // Update kernel mappings
    __create_pgd_mapping(swapper_pg_dir, kernel_start,
                        __pa_symbol(_text), kernel_end - kernel_start,
                        PAGE_KERNEL_EXEC, early_pgtable_alloc,
                        NO_CONT_MAPPINGS);
}
#endif

// Kernel configuration
CONFIG_RANDOMIZE_BASE=y
CONFIG_RANDOMIZE_MEMORY=y
CONFIG_RANDOMIZE_MEMORY_PHYSICAL_PADDING=0xa
CONFIG_ARM64_MODULE_PLTS=y  // For ARM64 module loading
```

**Explanation**:

- **Entropy Sources**: Multiple randomness sources
- **Mixing**: Cryptographic mixing of entropy
- **Relocation**: Kernel image relocation
- **Page Tables**: Page table updates
- **ARM64 Specifics**: Platform-specific implementation

**Where**: KASLR implementation is used in:

- **Boot Process**: During kernel initialization
- **All Architectures**: x86_64, ARM64, etc.
- **Production Systems**: All production deployments
- **Embedded Systems**: Secure embedded Linux
- **Rock 5B+**: ARM64 KASLR

## ASLR for User-Space

**What**: User-space ASLR randomizes the memory layout of user processes, including stack, heap, libraries, and executable.

**Why**: Understanding user-space ASLR is important because:

- **Process Protection**: Protects user processes
- **Library Randomization**: Randomizes shared libraries
- **Stack Protection**: Random stack locations
- **Heap Randomization**: Random heap locations
- **Comprehensive Protection**: Full address space randomization

**How**: User-space ASLR works through:

```c
// Example: User-space ASLR implementation
// Randomize ELF load address
static unsigned long elf_map_randomize(struct file *filep, unsigned long addr,
                                      struct elf_phdr *eppnt,
                                      int prot, int type, unsigned long total_size)
{
    unsigned long map_addr;
    unsigned long size = eppnt->p_filesz + ELF_PAGEOFFSET(eppnt->p_vaddr);
    unsigned long off = eppnt->p_offset - ELF_PAGEOFFSET(eppnt->p_vaddr);

    // Add randomization for PIE executables
    if (current->flags & PF_RANDOMIZE) {
        unsigned long random = arch_mmap_rnd();
        addr += random;
    }

    map_addr = vm_mmap(filep, addr, size, prot, type, off);
    return map_addr;
}

// Stack randomization
static int load_elf_binary_randomize_stack(struct linux_binprm *bprm)
{
    unsigned long elf_stack;

    elf_stack = STACK_TOP - STACK_RND_MASK;

    if (current->flags & PF_RANDOMIZE) {
        unsigned long random_offset;

        random_offset = get_random_long();
        random_offset &= STACK_RND_MASK;
        random_offset <<= PAGE_SHIFT;

        elf_stack += random_offset;
    }

    elf_stack = PAGE_ALIGN(elf_stack);
    return setup_arg_pages(bprm, elf_stack, EXSTACK_DEFAULT);
}

// Heap randomization
static unsigned long arch_get_unmapped_area_randomize(struct file *filp,
                                                      unsigned long addr,
                                                      unsigned long len,
                                                      unsigned long pgoff,
                                                      unsigned long flags)
{
    struct mm_struct *mm = current->mm;
    struct vm_area_struct *vma;
    struct vm_unmapped_area_info info;
    unsigned long random_offset = 0;

    // Get random offset for heap
    if (current->flags & PF_RANDOMIZE) {
        random_offset = arch_mmap_rnd();
    }

    // Find unmapped area
    info.flags = 0;
    info.length = len;
    info.low_limit = mm->mmap_base + random_offset;
    info.high_limit = TASK_SIZE;
    info.align_mask = 0;
    info.align_offset = pgoff << PAGE_SHIFT;

    return vm_unmapped_area(&info);
}

// VDSO randomization
static void vdso_randomize(void)
{
    unsigned long vdso_base;

    if (current->flags & PF_RANDOMIZE) {
        unsigned long random_offset;

        random_offset = get_random_long();
        random_offset &= (VDSO_RANDOMIZE_SIZE - 1);
        random_offset <<= PAGE_SHIFT;

        vdso_base = VDSO_BASE + random_offset;
    } else {
        vdso_base = VDSO_BASE;
    }

    current->mm->context.vdso = (void *)vdso_base;
}
```

**Explanation**:

- **Executable Randomization**: PIE binary randomization
- **Stack Randomization**: Random stack placement
- **Heap Randomization**: Random heap base
- **Library Randomization**: Shared library placement
- **VDSO Randomization**: Virtual DSO randomization

**Where**: User-space ASLR is used in:

- **All Processes**: Every user-space process
- **Shared Libraries**: All dynamic libraries
- **Desktop Systems**: Desktop applications
- **Server Systems**: Server processes
- **Embedded Systems**: Embedded applications

## ARM64 ASLR/KASLR Specifics

**What**: ARM64 architecture provides specific features and considerations for ASLR and KASLR implementation.

**Why**: Understanding ARM64 specifics is important because:

- **Platform Differences**: ARM64 specific implementation
- **Address Space**: Different address space layout
- **Hardware Support**: ARM64 specific features
- **Performance**: ARM64 optimizations
- **Embedded Systems**: Critical for Rock 5B+

**How**: ARM64 ASLR/KASLR involves:

```c
// Example: ARM64 specific ASLR/KASLR
// ARM64 virtual address space layout
#define VA_BITS_MIN         (39)
#define VA_BITS_MAX         (52)

#define VMEMMAP_START       (-UL(1) << (VA_BITS - VMEMMAP_SHIFT))
#define PCI_IO_START        (-UL(1) << (VA_BITS - 3))
#define FIXADDR_TOP         (-UL(1) << (VA_BITS - 1))

// ARM64 KASLR offset calculation
static u64 __init arm64_kaslr_offset(void)
{
    u64 entropy, range, offset;

    // Get entropy from ARM64 RNG
    if (cpus_have_const_cap(ARM64_HAS_RNG)) {
        asm volatile("mrs %0, RNDR" : "=r" (entropy));
    } else {
        entropy = get_cycles() ^ (u64)&entropy;
    }

    // Calculate randomization range
    range = (VMEMMAP_START - PAGE_OFFSET) / SZ_2M;

    // Calculate offset with 2MB alignment
    offset = (entropy % range) * SZ_2M;

    return offset;
}

// ARM64 module PLT for KASLR
#ifdef CONFIG_ARM64_MODULE_PLTS
struct plt_entry {
    u32 mov16;  // movz x16, #:abs_g3:addr
    u32 mov32;  // movk x16, #:abs_g2_nc:addr
    u32 mov48;  // movk x16, #:abs_g1_nc:addr
    u32 mov64;  // movk x16, #:abs_g0_nc:addr
    u32 br;     // br x16
};

static struct plt_entry *get_plt_entry(unsigned long val)
{
    struct plt_entry *plt;

    plt = (struct plt_entry *)get_plt_base();

    plt->mov16 = 0xd2800010 | (((val >> 48) & 0xffff) << 5);
    plt->mov32 = 0xf2a00010 | (((val >> 32) & 0xffff) << 5);
    plt->mov48 = 0xf2c00010 | (((val >> 16) & 0xffff) << 5);
    plt->mov64 = 0xf2e00010 | ((val & 0xffff) << 5);
    plt->br = 0xd61f0200;

    return plt;
}
#endif

// Rock 5B+ device tree KASLR configuration
/ {
    compatible = "radxa,rock-5b-plus";

    memory@0 {
        device_type = "memory";
        reg = <0x0 0x00000000 0x0 0x80000000>;  // 2GB RAM
    };

    chosen {
        kaslr-seed = <0x12345678 0x9abcdef0>;
        bootargs = "kaslr";
    };

    reserved-memory {
        #address-cells = <2>;
        #size-cells = <2>;
        ranges;

        kaslr_reserved: kaslr@40000000 {
            reg = <0x0 0x40000000 0x0 0x10000000>;
            no-map;
        };
    };
};

// ARM64 ASLR configuration
CONFIG_ARM64=y
CONFIG_RANDOMIZE_BASE=y
CONFIG_RANDOMIZE_MODULE_REGION_FULL=y
CONFIG_ARM64_MODULE_PLTS=y
CONFIG_ARM64_VA_BITS_48=y
CONFIG_ARM64_PAGE_SHIFT=12

// ARM64 address space randomization bits
#ifdef CONFIG_ARM64
#define STACK_RND_MASK  (0x3ffff >> (PAGE_SHIFT - 12))
#define MMAP_RND_BITS   (18)
#define MMAP_RND_COMPAT_BITS (11)
#endif
```

**Explanation**:

- **Address Space**: 48/52-bit virtual addressing
- **RNG Support**: ARM64 hardware RNG
- **Module PLTs**: Position-independent code
- **Device Tree**: Platform configuration
- **Memory Layout**: ARM64 specific layout

**Where**: ARM64 ASLR/KASLR is used in:

- **ARM64 Systems**: All ARM64 Linux systems
- **Embedded Devices**: ARM64 embedded systems
- **Mobile Devices**: ARM64 smartphones
- **Single-Board Computers**: Rock 5B+ platform
- **Server Systems**: ARM64 servers

## Entropy and Randomization Quality

**What**: High-quality entropy is critical for effective ASLR/KASLR, requiring sufficient randomness to prevent prediction.

**Why**: Understanding entropy quality is important because:

- **Security Strength**: Better entropy means stronger security
- **Attack Resistance**: Prevents brute-force attacks
- **Prediction Prevention**: Makes addresses unpredictable
- **Implementation Quality**: Proper implementation critical
- **Production Requirements**: High entropy essential

**How**: Entropy quality is ensured through:

```c
// Example: Entropy quality for ASLR/KASLR
// Entropy pool for ASLR
struct entropy_pool {
    unsigned long samples[ENTROPY_POOL_SIZE];
    int count;
    spinlock_t lock;
};

static struct entropy_pool kaslr_entropy_pool;

// Add entropy to pool
static void add_kaslr_entropy(unsigned long entropy)
{
    unsigned long flags;

    spin_lock_irqsave(&kaslr_entropy_pool.lock, flags);

    kaslr_entropy_pool.samples[kaslr_entropy_pool.count % ENTROPY_POOL_SIZE] = entropy;
    kaslr_entropy_pool.count++;

    spin_unlock_irqrestore(&kaslr_entropy_pool.lock, flags);
}

// Get high-quality random value
static unsigned long get_kaslr_random(void)
{
    unsigned long random = 0;
    int i;

    // Mix entropy from multiple sources
    for (i = 0; i < ENTROPY_POOL_SIZE; i++) {
        random ^= kaslr_entropy_pool.samples[i];
    }

    // Add hardware RNG if available
    #ifdef CONFIG_ARM64
    if (cpus_have_const_cap(ARM64_HAS_RNG)) {
        unsigned long hw_random;
        asm volatile("mrs %0, RNDR" : "=r" (hw_random));
        random ^= hw_random;
    }
    #endif

    // Add timing entropy
    random ^= get_cycles();

    // Hash the mixed entropy
    return sha256_hash(&random, sizeof(random));
}

// Verify entropy quality
static int verify_entropy_quality(void)
{
    unsigned long samples[1000];
    int i, collisions = 0;

    // Collect samples
    for (i = 0; i < 1000; i++) {
        samples[i] = get_kaslr_random();
    }

    // Check for collisions
    for (i = 0; i < 1000; i++) {
        int j;
        for (j = i + 1; j < 1000; j++) {
            if (samples[i] == samples[j]) {
                collisions++;
            }
        }
    }

    if (collisions > 0) {
        pr_warn("Entropy quality issue: %d collisions in 1000 samples\n",
                collisions);
        return -EINVAL;
    }

    pr_info("Entropy quality verified: 0 collisions in 1000 samples\n");
    return 0;
}

// Entropy estimation
static int estimate_entropy_bits(void)
{
    unsigned long samples[256];
    int i, unique = 0;
    int entropy_bits;

    // Collect samples
    for (i = 0; i < 256; i++) {
        samples[i] = get_kaslr_random() & 0xff;
    }

    // Count unique values
    for (i = 0; i < 256; i++) {
        int j, is_unique = 1;
        for (j = 0; j < i; j++) {
            if (samples[i] == samples[j]) {
                is_unique = 0;
                break;
            }
        }
        if (is_unique)
            unique++;
    }

    // Estimate entropy bits
    entropy_bits = ilog2(unique);

    pr_info("Estimated entropy: %d bits\n", entropy_bits);
    return entropy_bits;
}
```

**Explanation**:

- **Multiple Sources**: Combining entropy sources
- **Hardware RNG**: Using hardware randomness
- **Entropy Pool**: Maintaining entropy pool
- **Quality Verification**: Testing randomness quality
- **Entropy Estimation**: Measuring available entropy

**Where**: Entropy quality is critical in:

- **Boot Process**: Kernel initialization
- **Process Creation**: User-space randomization
- **Security Systems**: High-security deployments
- **Embedded Systems**: Limited entropy sources
- **Production Systems**: Ensuring security strength

## Key Takeaways

**What** you've accomplished in this lesson:

1. **ASLR/KASLR Understanding**: You understand address randomization
2. **KASLR Implementation**: You know kernel randomization
3. **User-Space ASLR**: You understand process randomization
4. **ARM64 Specifics**: You know ARM64 implementation
5. **Entropy Quality**: You understand randomness requirements
6. **Production Readiness**: You can implement ASLR/KASLR

**Why** these concepts matter:

- **Exploit Mitigation**: Critical security mechanism
- **Address Unpredictability**: Makes attacks harder
- **Defense in Depth**: Additional security layer
- **Industry Standard**: Standard security practice
- **Professional Skills**: Essential security knowledge

**When** to use these concepts:

- **System Configuration**: Enabling ASLR/KASLR
- **Security Hardening**: Implementing security
- **Development**: Building secure systems
- **Deployment**: Deploying secure systems
- **Debugging**: Understanding memory layout

**Where** these skills apply:

- **Kernel Development**: Implementing security features
- **System Administration**: Configuring security
- **Embedded Development**: Securing embedded systems
- **Security Engineering**: Designing secure systems
- **Professional Development**: Working in security

## Next Steps

**What** you're ready for next:

After mastering ASLR and KASLR, you should be ready to:

1. **Learn SMEP/SMAP**: Understand CPU security features
2. **Study Security Monitoring**: Learn event monitoring
3. **Explore Hardening**: More hardening techniques
4. **Master Security**: Comprehensive security knowledge
5. **Implement Systems**: Build secure systems

**Where** to go next:

Continue with the next lesson on **"SMEP and SMAP"** to learn:

- Supervisor Mode Execution Prevention
- Supervisor Mode Access Prevention
- Hardware security features
- ARM64 privilege protection

**Why** the next lesson is important:

The next lesson completes your kernel hardening knowledge by covering CPU-level security features that prevent privileged code from executing or accessing user-space memory.

**How** to continue learning:

1. **Study ASLR/KASLR**: Analyze implementation
2. **Experiment with Rock 5B+**: Configure randomization
3. **Read Documentation**: Study security documentation
4. **Join Communities**: Engage with security developers
5. **Build Projects**: Implement ASLR in projects

## Resources

**Official Documentation**:

- [Kernel ASLR](https://www.kernel.org/doc/html/latest/admin-guide/kernel-parameters.html) - KASLR documentation
- [ELF Specification](https://refspecs.linuxbase.org/elf/elf.pdf) - ELF format and PIE
- [ARM64 Memory Model](https://developer.arm.com/documentation/) - ARM64 addressing

**Community Resources**:

- [Kernel Self-Protection](https://kernsec.org/wiki/index.php/Kernel_Self_Protection_Project) - Security project
- [Linux Security List](https://lore.kernel.org/linux-security-module/) - Security discussions
- [ASLR Analysis](https://pax.grsecurity.net/docs/aslr.txt) - ASLR details

**Learning Resources**:

- [Computer Security](https://www.schneier.com/books/computer-security/) - Security fundamentals
- [Exploit Mitigation](https://www.exploit-db.com/) - Exploitation and mitigation
- [System Security](https://www.usenix.org/conference/usenixsecurity) - Security research

**Rock 5B+ Specific**:

- [Rock 5B+ Security](https://wiki.radxa.com/Rock5/security) - Board security
- [ARM64 RNG](https://developer.arm.com/documentation/) - ARM64 random number generation
- [Embedded Security](https://embeddedsecurity.io/) - Embedded security resources

Happy learning! 🐧
