---
sidebar_position: 1
---

# Stack Protection

Master stack protection mechanisms in the Linux kernel, understanding stack canaries, buffer overflow prevention, and memory corruption detection on ARM64 platforms including Rock 5B+.

## What is Stack Protection?

**What**: Stack protection is a set of security mechanisms that detect and prevent stack-based buffer overflows and memory corruption attacks by monitoring stack integrity.

**Why**: Understanding stack protection is crucial because:

- **Buffer Overflow Prevention**: Stops stack-based attacks
- **Memory Safety**: Detects memory corruption
- **Exploit Mitigation**: Makes exploitation harder
- **Security Defense**: Defense-in-depth strategy
- **Production Security**: Critical for secure systems
- **Embedded Protection**: Essential for embedded security

**When**: Stack protection is relevant when:

- **Function Execution**: During function call/return
- **Buffer Operations**: When manipulating buffers
- **String Operations**: When copying strings
- **Memory Operations**: When writing to memory
- **Attack Detection**: When detecting exploits
- **Security Hardening**: Implementing security measures

**How**: Stack protection works through:

```c
// Example: Stack canary implementation
// Stack canary structure
struct stack_canary {
    unsigned long value;
    unsigned long guard_page;
};

// Get stack canary value
static inline unsigned long get_random_canary(void)
{
    unsigned long canary;

    get_random_bytes(&canary, sizeof(canary));
    canary &= CANARY_MASK;
    canary |= CANARY_SENTINEL;

    return canary;
}

// Initialize stack canary
static void __init setup_stack_canary(void)
{
    unsigned long canary;

    canary = get_random_canary();
    current->stack_canary = canary;

    #ifdef CONFIG_X86_64
    this_cpu_write(irq_stack_union.stack_canary, canary);
    #endif

    #ifdef CONFIG_ARM64
    __this_cpu_write(stack_canary, canary);
    #endif
}

// Check stack canary
static inline void check_stack_canary(void)
{
    unsigned long canary = current->stack_canary;
    unsigned long *canary_ptr;

    #ifdef CONFIG_ARM64
    canary_ptr = __this_cpu_ptr(&stack_canary);
    #endif

    if (unlikely(*canary_ptr != canary)) {
        pr_emerg("Stack corruption detected!\n");
        pr_emerg("Expected: 0x%lx, Found: 0x%lx\n",
                 canary, *canary_ptr);
        BUG();
    }
}

// Function with stack protection
void __attribute__((stack_protect)) protected_function(void)
{
    char buffer[256];
    unsigned long canary = current->stack_canary;

    // Function code here
    do_something(buffer);

    // Check canary before return
    check_stack_canary();
}
```

**Where**: Stack protection is used in:

- **All Kernel Functions**: Throughout the kernel
- **Critical Functions**: Security-critical code paths
- **Device Drivers**: Kernel module protection
- **System Calls**: System call handlers
- **Rock 5B+**: ARM64 kernel protection

## Stack Canaries

**What**: Stack canaries are random values placed on the stack between local variables and return addresses to detect stack buffer overflows.

**Why**: Understanding stack canaries is important because:

- **Overflow Detection**: Detects buffer overflows
- **Return Protection**: Protects return addresses
- **Attack Prevention**: Prevents code injection
- **Memory Corruption**: Detects stack corruption
- **Performance**: Low overhead protection

**How**: Stack canaries work through:

```c
// Example: Stack canary implementation details
// Canary value generation
#define CANARY_MASK     0xffffffffffffff00UL
#define CANARY_SENTINEL 0x0000000000000000UL

// Per-CPU canary storage
DEFINE_PER_CPU(unsigned long, stack_canary);

// Initialize canaries for all CPUs
static void init_stack_canaries(void)
{
    int cpu;

    for_each_possible_cpu(cpu) {
        per_cpu(stack_canary, cpu) = get_random_canary();
    }
}

// Compiler-generated canary check
// Before:
void vulnerable_function(const char *input)
{
    char buffer[256];
    strcpy(buffer, input);
}

// After (-fstack-protector-strong):
void vulnerable_function(const char *input)
{
    char buffer[256];
    unsigned long canary = __stack_chk_guard;

    strcpy(buffer, input);

    if (canary != __stack_chk_guard)
        __stack_chk_fail();
}

// Stack canary failure handler
void __stack_chk_fail(void)
{
    panic("Stack protector: kernel stack is corrupted in %pB\n",
          __builtin_return_address(0));
}

// ARM64 specific canary access
static inline unsigned long get_stack_canary(void)
{
    unsigned long canary;

    #ifdef CONFIG_ARM64
    asm("mrs %0, sp_el0" : "=r" (canary));
    canary ^= CANARY_MASK;
    #endif

    return canary;
}
```

**Explanation**:

- **Random Generation**: Canaries are randomly generated
- **Per-CPU Storage**: Each CPU has unique canary
- **Compiler Support**: Compiler inserts checks automatically
- **Failure Handling**: Kernel panic on corruption
- **ARM64 Integration**: ARM64 specific canary access

**Where**: Stack canaries are used in:

- **Kernel Functions**: All protected functions
- **Interrupt Handlers**: Interrupt service routines
- **Exception Handlers**: Exception handling code
- **System Calls**: System call implementations
- **Device Drivers**: Driver code protection

## Buffer Overflow Prevention

**What**: Buffer overflow prevention encompasses techniques beyond canaries to prevent stack-based buffer overflows and memory corruption.

**Why**: Understanding overflow prevention is important because:

- **Security Hardening**: Multiple layers of protection
- **Defense in Depth**: Complementary protections
- **Attack Mitigation**: Makes exploits harder
- **Memory Safety**: Ensures safe memory access
- **Reliability**: Prevents crashes and corruption

**How**: Buffer overflow prevention works through:

```c
// Example: Buffer overflow prevention techniques
// Bounds checking
static inline void *checked_memcpy(void *dest, const void *src, size_t n,
                                   size_t dest_size)
{
    if (unlikely(n > dest_size)) {
        WARN(1, "Buffer overflow detected: copying %zu bytes to %zu byte buffer\n",
             n, dest_size);
        n = dest_size;
    }

    return memcpy(dest, src, n);
}

// Fortified string functions
#ifdef CONFIG_FORTIFY_SOURCE
static inline char *strcpy_fortified(char *dest, const char *src)
{
    size_t dest_size = __builtin_object_size(dest, 0);
    size_t src_len = strlen(src);

    if (dest_size != (size_t)-1 && src_len >= dest_size) {
        WARN(1, "String overflow: %zu bytes to %zu byte buffer\n",
             src_len, dest_size);
        return NULL;
    }

    return strcpy(dest, src);
}

#define strcpy(dest, src) strcpy_fortified(dest, src)
#endif

// Stack clash protection
static void check_stack_clash(unsigned long sp, size_t size)
{
    unsigned long stack_start = current->stack_start;
    unsigned long stack_end = current->stack_end;

    if (sp < stack_start + STACK_GUARD_SIZE) {
        pr_emerg("Stack clash detected!\n");
        pr_emerg("SP: 0x%lx, Stack start: 0x%lx\n", sp, stack_start);
        BUG();
    }

    if (sp + size > stack_end - STACK_GUARD_SIZE) {
        pr_emerg("Stack overflow detected!\n");
        pr_emerg("SP: 0x%lx, Stack end: 0x%lx, Size: %zu\n",
                 sp, stack_end, size);
        BUG();
    }
}

// VLA (Variable Length Array) protection
#ifdef CONFIG_CC_IS_CLANG
#pragma clang diagnostic error "-Wvla"
#elif defined(CONFIG_CC_IS_GCC)
#pragma GCC diagnostic error "-Wvla"
#endif

// Example of unsafe VLA (now forbidden)
void unsafe_function(int n)
{
    // This will cause a compile error with VLA protection
    // char buffer[n];  // ERROR: VLA not allowed

    // Use fixed size or dynamic allocation instead
    char buffer[256];
    if (n > 256)
        return;
}

// Guard pages
static int setup_stack_guard_page(struct vm_area_struct *vma)
{
    unsigned long addr;
    struct page *page;

    // Allocate guard page
    page = alloc_page(GFP_KERNEL);
    if (!page)
        return -ENOMEM;

    // Make guard page inaccessible
    addr = (unsigned long)page_address(page);
    set_memory_np(addr, 1);

    vma->vm_guard_page = page;
    return 0;
}
```

**Explanation**:

- **Bounds Checking**: Runtime size verification
- **Fortified Functions**: Enhanced standard functions
- **Stack Clash Protection**: Prevents stack collision
- **VLA Prevention**: Disallows variable length arrays
- **Guard Pages**: Unmapped pages around stacks

**Where**: Buffer overflow prevention is used in:

- **Memory Operations**: All memory manipulation
- **String Operations**: String handling functions
- **Buffer Copying**: Data copying operations
- **Stack Allocation**: Stack memory allocation
- **Kernel Code**: Throughout kernel codebase

## ARM64 Stack Protection

**What**: ARM64 architecture provides specific stack protection mechanisms and hardware features for enhanced security.

**Why**: Understanding ARM64 specifics is important because:

- **Hardware Support**: ARM64 hardware features
- **Performance**: ARM64 optimizations
- **Embedded Systems**: Critical for embedded ARM64
- **Platform Specifics**: Rock 5B+ specific protection
- **Security Features**: ARM64 security extensions

**How**: ARM64 stack protection involves:

```c
// Example: ARM64 specific stack protection
// ARM64 stack canary in system register
static inline void arm64_init_stack_canary(void)
{
    unsigned long canary;

    canary = get_random_canary();

    // Store canary in sp_el0 (EL0 stack pointer register)
    write_sysreg(canary, sp_el0);

    // Also store in per-CPU variable
    __this_cpu_write(stack_canary, canary);
}

// ARM64 canary check using system register
static inline void arm64_check_stack_canary(void)
{
    unsigned long canary, expected;

    // Read canary from system register
    canary = read_sysreg(sp_el0);
    expected = __this_cpu_read(stack_canary);

    if (unlikely(canary != expected)) {
        pr_emerg("Stack canary corrupted!\n");
        pr_emerg("Expected: 0x%lx, Found: 0x%lx\n", expected, canary);
        BUG();
    }
}

// ARM64 Pointer Authentication
#ifdef CONFIG_ARM64_PTR_AUTH
static inline unsigned long sign_return_address(unsigned long addr)
{
    unsigned long signed_addr;

    asm volatile(
        "paciasp\n"
        "mov %0, x30\n"
        : "=r" (signed_addr)
        :
        : "x30"
    );

    return signed_addr;
}

static inline unsigned long auth_return_address(unsigned long signed_addr)
{
    unsigned long addr;

    asm volatile(
        "mov x30, %1\n"
        "autiasp\n"
        "mov %0, x30\n"
        : "=r" (addr)
        : "r" (signed_addr)
        : "x30"
    );

    return addr;
}
#endif

// ARM64 Memory Tagging Extension (MTE)
#ifdef CONFIG_ARM64_MTE
static inline void *mte_tag_pointer(void *ptr, unsigned char tag)
{
    unsigned long tagged_ptr;

    tagged_ptr = (unsigned long)ptr;
    tagged_ptr |= ((unsigned long)tag << 56);

    return (void *)tagged_ptr;
}

static inline void mte_check_tag(void *ptr)
{
    unsigned char ptr_tag, mem_tag;

    ptr_tag = (unsigned long)ptr >> 56;

    asm volatile(
        "ldg %0, [%1]\n"
        : "=r" (mem_tag)
        : "r" (ptr)
    );

    if (unlikely(ptr_tag != mem_tag)) {
        pr_emerg("Memory tag mismatch!\n");
        pr_emerg("Pointer tag: 0x%x, Memory tag: 0x%x\n",
                 ptr_tag, mem_tag);
        BUG();
    }
}
#endif

// Rock 5B+ device tree configuration
/ {
    compatible = "radxa,rock-5b-plus";

    security {
        stack-protection {
            compatible = "arm64,stack-protection";
            status = "okay";

            canary = <1>;
            ptr-auth = <1>;
            mte = <0>;  // Not available on RK3588

            guard-pages = <1>;
            stack-size = <0x4000>;
        };
    };
};

// ARM64 kernel configuration
CONFIG_ARM64=y
CONFIG_STACKPROTECTOR=y
CONFIG_STACKPROTECTOR_STRONG=y
CONFIG_ARM64_PTR_AUTH=y
CONFIG_ARM64_PTR_AUTH_KERNEL=y
# CONFIG_ARM64_MTE is not set (not available on RK3588)
CONFIG_VMAP_STACK=y
CONFIG_THREAD_INFO_IN_TASK=y
```

**Explanation**:

- **System Registers**: Using ARM64 system registers
- **Pointer Authentication**: Hardware return address protection
- **Memory Tagging**: MTE for memory safety (future)
- **Guard Pages**: Virtual memory protection
- **Platform Config**: Rock 5B+ specific configuration

**Where**: ARM64 stack protection is used in:

- **ARM64 Systems**: All ARM64 Linux systems
- **Embedded Devices**: ARM64 embedded systems
- **Mobile Devices**: ARM64 smartphones
- **Single-Board Computers**: Rock 5B+ platform
- **Server Systems**: ARM64 servers

## Performance Considerations

**What**: Stack protection mechanisms have performance implications that must be balanced against security benefits.

**Why**: Understanding performance impact is important because:

- **Performance Overhead**: Some overhead is inherent
- **Embedded Systems**: Resource constraints matter
- **Real-Time**: Timing guarantees needed
- **Optimization**: Balancing security and performance
- **Production Deployment**: Performance requirements

**How**: Performance optimization involves:

```c
// Example: Stack protection performance optimization
// Selective protection levels
CONFIG_STACKPROTECTOR=y          // Basic protection
CONFIG_STACKPROTECTOR_STRONG=y   // Enhanced protection
CONFIG_STACKPROTECTOR_ALL=y      // Maximum protection (slow)

// Per-function protection attributes
// No protection for performance-critical code
void __attribute__((no_stack_protector)) fast_path(void)
{
    // Performance-critical code
}

// Force protection for security-critical code
void __attribute__((stack_protect)) secure_function(void)
{
    // Security-critical code
}

// Inline functions optimization
static __always_inline void small_function(void)
{
    // Inlined functions don't need canaries
    // Compiler optimizes away protection
}

// Canary check optimization
static inline void optimized_canary_check(void)
{
    // Use likely/unlikely for branch prediction
    if (unlikely(__stack_chk_guard != __get_current_canary()))
        __stack_chk_fail();
}

// Performance monitoring
static void measure_stack_protection_overhead(void)
{
    unsigned long start, end;
    int i;

    start = get_cycles();
    for (i = 0; i < 1000000; i++) {
        protected_function();
    }
    end = get_cycles();

    pr_info("Stack protection overhead: %lu cycles per call\n",
            (end - start) / 1000000);
}

// ARM64 performance optimization
#ifdef CONFIG_ARM64
// Use system register access for better performance
static inline unsigned long fast_get_canary(void)
{
    unsigned long canary;

    // Direct register access is faster than memory
    asm volatile("mrs %0, sp_el0" : "=r" (canary));
    return canary;
}
#endif
```

**Explanation**:

- **Protection Levels**: Different levels for different needs
- **Selective Protection**: Protect what matters most
- **Compiler Optimization**: Let compiler optimize
- **Branch Prediction**: Optimize for common case
- **Hardware Features**: Use ARM64 features

**Where**: Performance optimization applies to:

- **Real-Time Systems**: Timing-critical systems
- **Embedded Devices**: Resource-constrained devices
- **High-Performance**: Performance-critical code
- **Production Systems**: Balanced security/performance
- **Rock 5B+**: Embedded performance optimization

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Stack Protection Understanding**: You understand stack protection mechanisms
2. **Canary Knowledge**: You know how stack canaries work
3. **Overflow Prevention**: You understand buffer overflow prevention
4. **ARM64 Features**: You know ARM64 specific protections
5. **Performance Awareness**: You understand performance implications
6. **Production Readiness**: You can implement stack protection

**Why** these concepts matter:

- **Security Defense**: Critical security mechanism
- **Exploit Prevention**: Stops common attacks
- **Memory Safety**: Ensures memory integrity
- **Production Security**: Essential for deployment
- **Professional Skills**: Industry-standard knowledge

**When** to use these concepts:

- **Security Hardening**: Implementing protections
- **Code Development**: Writing secure code
- **Configuration**: Configuring kernel security
- **Deployment**: Deploying secure systems
- **Debugging**: Investigating corruption

**Where** these skills apply:

- **Kernel Development**: Implementing security
- **System Administration**: Configuring security
- **Embedded Development**: Securing embedded systems
- **Security Engineering**: Designing secure systems
- **Professional Development**: Working in security

## Next Steps

**What** you're ready for next:

After mastering stack protection, you should be ready to:

1. **Learn ASLR/KASLR**: Understand address randomization
2. **Study SMEP/SMAP**: Learn CPU security features
3. **Explore Security Monitoring**: Understand event monitoring
4. **Master Hardening**: Learn more hardening techniques
5. **Implement Security**: Apply in real projects

**Where** to go next:

Continue with the next lesson on **"ASLR and KASLR"** to learn:

- Address space layout randomization
- Kernel address randomization
- Exploit mitigation techniques
- ARM64 specific randomization

**Why** the next lesson is important:

The next lesson builds on your stack protection knowledge by adding another layer of security through address randomization, making exploits significantly harder.

**How** to continue learning:

1. **Study Stack Protection**: Analyze implementation
2. **Experiment with Rock 5B+**: Configure protections
3. **Read Documentation**: Study security documentation
4. **Join Communities**: Engage with security developers
5. **Build Projects**: Implement protection in projects

## Resources

**Official Documentation**:

- [GCC Stack Protection](https://gcc.gnu.org/onlinedocs/gcc/Instrumentation-Options.html) - Compiler documentation
- [Kernel Hardening](https://www.kernel.org/doc/html/latest/security/self-protection.html) - Kernel self-protection
- [ARM64 Security](https://developer.arm.com/documentation/) - ARM64 security features

**Community Resources**:

- [Kernel Self-Protection Project](https://kernsec.org/wiki/index.php/Kernel_Self_Protection_Project) - Security project
- [Linux Security List](https://lore.kernel.org/linux-security-module/) - Security discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/stack-protection) - Technical Q&A

**Learning Resources**:

- [Hacking: The Art of Exploitation](https://nostarch.com/hacking2.htm) - Exploitation and protection
- [The Shellcoder's Handbook](https://www.wiley.com/en-us/The+Shellcoder%27s+Handbook%3A+Discovering+and+Exploiting+Security+Holes%2C+2nd+Edition-p-9780470080238) - Security techniques
- [Practical Binary Analysis](https://nostarch.com/binaryanalysis) - Binary security

**Rock 5B+ Specific**:

- [Rock 5B+ Security](https://wiki.radxa.com/Rock5/security) - Board security
- [ARM64 Pointer Authentication](https://developer.arm.com/documentation/101028/latest/) - PTR_AUTH guide
- [Embedded Security](https://embeddedsecurity.io/) - Embedded security resources

Happy learning! 🐧
