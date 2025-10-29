---
sidebar_position: 2
---

# Interrupt Controller

Master RISC-V interrupt controllers including PLIC (Platform-Level Interrupt Controller) and CLINT (Core-Local Interruptor), understanding how interrupts are routed, prioritized, and managed essential for RISC-V kernel interrupt handling.

## What Are RISC-V Interrupt Controllers?

**What**: RISC-V interrupt controllers are hardware components that manage interrupts from devices and distribute them to CPU cores. RISC-V uses two main controllers: PLIC (Platform-Level Interrupt Controller) for external device interrupts, and CLINT (Core-Local Interruptor) for software and timer interrupts.

**Why**: Understanding interrupt controllers is crucial because:

- **Interrupt Routing** - Controllers route interrupts to correct CPU cores
- **Priority Management** - Controllers handle interrupt priorities
- **Kernel Drivers** - Kernel needs drivers for interrupt controllers
- **Interrupt Configuration** - Must configure controllers correctly
- **Multi-Core Systems** - Critical for SMP interrupt distribution
- **Device Support** - Devices use controllers to signal interrupts

**When**: Interrupt controllers are used when:

- **Interrupt Arrival** - Device interrupts arrive at controller
- **Interrupt Routing** - Controller routes interrupt to CPU
- **Interrupt Handling** - CPU handles interrupt from controller
- **Interrupt Configuration** - Configuring interrupt priorities
- **Driver Initialization** - Initializing interrupt controller drivers
- **Interrupt Debugging** - Debugging interrupt-related issues

**How**: Interrupt controllers work through:

- **PLIC** - Manages external device interrupts
- **CLINT** - Manages software and timer interrupts
- **Priority Arbitration** - Controllers arbitrate interrupt priorities
- **CPU Interrupt Lines** - Controllers signal CPUs via interrupt lines
- **Register Interfaces** - Memory-mapped registers control controllers
- **Device Drivers** - Kernel drivers manage controllers

**Where**: Interrupt controllers are found in:

- **All RISC-V Systems** - Required for interrupt handling
- **Device Tree** - Controllers described in device tree
- **Kernel Drivers** - drivers/irqchip/ directory
- **Kernel Initialization** - Controller initialization during boot
- **Interrupt Handling** - Interrupt handler code

## PLIC (Platform-Level Interrupt Controller)

**What**: PLIC is the RISC-V standard interrupt controller for external device interrupts from I/O devices.

**Why**: PLIC is important because:

- **Standard Interface** - RISC-V standard interrupt controller
- **Device Interrupts** - Handles interrupts from all external devices
- **Priority Support** - Supports interrupt priorities
- **Multi-Core** - Routes interrupts to appropriate CPU cores
- **Scalability** - Supports many interrupt sources
- **Kernel Required** - Kernel must support PLIC

**How**: PLIC works:

```c
// Example: PLIC register layout
// PLIC memory map (typical):
// Base address: 0x0C000000
//  0x000000 - 0x000FFF: Reserved
//  0x001000 - 0x001FFF: Interrupt source priorities (4 bytes per source)
//  0x002000 - 0x1FFFFF: Interrupt pending bits
//  0x200000 - 0x200FFF: Interrupt enables (per context)
//  0x201000 - 0x3FFFFF: Priority thresholds (per context)
//  0x200000 + (context_id * 0x1000): Context registers

// PLIC supports multiple contexts (one per CPU + M-mode)

// Example: PLIC register structure
#define PLIC_BASE               0x0C000000UL
#define PLIC_PRIORITY_BASE      (PLIC_BASE + 0x000004)
#define PLIC_PENDING_BASE       (PLIC_BASE + 0x001000)
#define PLIC_ENABLE_BASE        (PLIC_BASE + 0x002000)
#define PLIC_THRESHOLD_BASE     (PLIC_BASE + 0x200000)
#define PLIC_CLAIM_BASE         (PLIC_BASE + 0x200004)

// Example: PLIC priority register (for each interrupt source)
static inline void plic_set_priority(unsigned int irq, unsigned int priority) {
    void __iomem *reg = ioremap(PLIC_PRIORITY_BASE + irq * 4, 4);

    // Priority: 0 (never interrupt) to 7 (highest priority)
    // Kernel typically uses priorities 1-7
    if (priority > 7) {
        priority = 7;
    }

    writel(priority, reg);
    iounmap(reg);
}

// Example: Reading interrupt priority
static inline unsigned int plic_get_priority(unsigned int irq) {
    void __iomem *reg = ioremap(PLIC_PRIORITY_BASE + irq * 4, 4);
    unsigned int priority = readl(reg);
    iounmap(reg);

    return priority;
}

// Example: PLIC enable register (per context)
// Context = CPU core + privilege mode
static inline void plic_enable_irq(unsigned int context_id,
                                   unsigned int irq) {
    void __iomem *enable_reg;

    // Enable register for this context
    enable_reg = ioremap(PLIC_ENABLE_BASE + (context_id * 0x1000) +
                        (irq / 32) * 4, 4);

    // Set bit for this interrupt
    writel(readl(enable_reg) | (1U << (irq % 32)), enable_reg);

    iounmap(enable_reg);
}

static inline void plic_disable_irq(unsigned int context_id,
                                    unsigned int irq) {
    void __iomem *enable_reg;

    enable_reg = ioremap(PLIC_ENABLE_BASE + (context_id * 0x1000) +
                        (irq / 32) * 4, 4);

    // Clear bit for this interrupt
    writel(readl(enable_reg) & ~(1U << (irq % 32)), enable_reg);

    iounmap(enable_reg);
}

// Example: PLIC pending register
static inline bool plic_pending(unsigned int irq) {
    void __iomem *pending_reg = ioremap(PLIC_PENDING_BASE + (irq / 32) * 4, 4);
    bool pending = (readl(pending_reg) >> (irq % 32)) & 1;
    iounmap(pending_reg);

    return pending;
}

// Example: PLIC threshold register
static inline void plic_set_threshold(unsigned int context_id,
                                     unsigned int threshold) {
    void __iomem *threshold_reg;

    threshold_reg = ioremap(PLIC_THRESHOLD_BASE + (context_id * 0x1000), 4);
    writel(threshold, threshold_reg);
    iounmap(threshold_reg);
}

// Example: PLIC claim/complete
// To handle interrupt:
// 1. Read claim register to get interrupt ID
// 2. Handle interrupt
// 3. Write claim register (now called complete) to acknowledge

static inline unsigned int plic_claim(unsigned int context_id) {
    void __iomem *claim_reg;
    unsigned int irq;

    claim_reg = ioremap(PLIC_CLAIM_BASE + (context_id * 0x1000), 4);
    irq = readl(claim_reg);
    iounmap(claim_reg);

    return irq;  // Returns interrupt ID, or 0 if none
}

static inline void plic_complete(unsigned int context_id, unsigned int irq) {
    void __iomem *claim_reg;

    claim_reg = ioremap(PLIC_CLAIM_BASE + (context_id * 0x1000), 4);
    writel(irq, claim_reg);  // Write back ID to complete
    iounmap(claim_reg);
}

// Example: PLIC interrupt handler
void plic_handle_irq(struct pt_regs *regs) {
    unsigned long hart_id;
    unsigned int context_id;
    unsigned int irq;

    // Get hardware thread ID
    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Context ID = hart_id * 2 + 1 (supervisor mode)
    // Context 0 = machine mode, Context 1 = supervisor mode (per hart)
    context_id = hart_id * 2 + 1;

    // Claim interrupt
    irq = plic_claim(context_id);

    if (irq == 0) {
        // Spurious interrupt
        return;
    }

    // Handle interrupt
    generic_handle_irq(irq);

    // Complete interrupt
    plic_complete(context_id, irq);
}
```

**Explanation**:

- **Register layout** PLIC has specific memory-mapped register layout
- **Priority** each interrupt source has configurable priority
- **Enable** interrupts must be enabled per context (CPU + mode)
- **Pending** PLIC tracks which interrupts are pending
- **Claim/Complete** interrupt handling via claim/complete mechanism

## CLINT (Core-Local Interruptor)

**What**: CLINT handles local interrupts for each CPU core: software interrupts and timer interrupts.

**Why**: CLINT is important because:

- **Timer Interrupts** - Provides timer interrupts to each core
- **Software Interrupts** - Supports inter-processor interrupts (IPI)
- **Core-Local** - Each core has its own CLINT instance
- **SMP Support** - Critical for multi-core systems
- **Standard Interface** - RISC-V standard for timer/software interrupts

**How**: CLINT works:

```c
// Example: CLINT register layout
// CLINT memory map (typical):
// Base address: 0x02000000
//  0x0000 - 0x3FFF: MSIP (Machine Software Interrupt Pending) - per hart
//  0x4000 - 0xBFFF: MTIMECMP (Machine Timer Compare) - per hart
//  0x4000 + (hart_id * 8): Timer compare register for this hart

#define CLINT_BASE              0x02000000UL
#define CLINT_MSIP_OFFSET(hart) ((hart) * 4)
#define CLINT_MTIMECMP_OFFSET(hart) (0x4000 + (hart) * 8)

// Example: CLINT software interrupt
// MSIP register: writing 1 triggers software interrupt

static inline void clint_send_ipi(unsigned int target_hart) {
    void __iomem *msip_reg;

    // MSIP register for target hart
    msip_reg = ioremap(CLINT_BASE + CLINT_MSIP_OFFSET(target_hart), 4);

    // Set bit 0 to trigger software interrupt
    writel(1, msip_reg);

    iounmap(msip_reg);
}

static inline void clint_clear_ipi(unsigned int hart_id) {
    void __iomem *msip_reg;

    msip_reg = ioremap(CLINT_BASE + CLINT_MSIP_OFFSET(hart_id), 4);

    // Clear software interrupt
    writel(0, msip_reg);

    iounmap(msip_reg);
}

// Example: CLINT timer interrupt
// MTIMECMP: Compare register for timer interrupt
// Timer interrupt fires when mtime >= MTIMECMP

static inline void clint_set_timer(unsigned int hart_id, unsigned long timer_value) {
    void __iomem *mtimecmp_reg;

    mtimecmp_reg = ioremap(CLINT_BASE + CLINT_MTIMECMP_OFFSET(hart_id), 8);

    // Set timer compare value (64-bit)
    writel(timer_value & 0xFFFFFFFF, mtimecmp_reg);
    writel(timer_value >> 32, mtimecmp_reg + 4);

    iounmap(mtimecmp_reg);

    // Clear any pending timer interrupt
    clint_clear_timer_pending();
}

static inline unsigned long clint_get_time(void) {
    // mtime register (read-only, increments continuously)
    // Location is implementation-specific
    // Typically accessible via CSR or memory-mapped register

    unsigned long time_low, time_high, time;

    // Read mtime (64-bit counter)
    __asm__ volatile(
        "rdtime %0\n"
        "rdtimeh %1"
        : "=r"(time_low), "=r"(time_high)
    );

    time = time_low | ((unsigned long)time_high << 32);

    return time;
}

// Example: CLINT interrupt handlers
void clint_timer_interrupt_handler(struct pt_regs *regs) {
    unsigned long hart_id;

    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Handle timer interrupt
    // Typically updates jiffies, triggers scheduler, etc.
    handle_timer_interrupt(regs);

    // Schedule next timer interrupt
    schedule_next_timer_interrupt(hart_id);
}

void clint_software_interrupt_handler(struct pt_regs *regs) {
    unsigned long hart_id;

    __asm__ volatile("csrr %0, mhartid" : "=r"(hart_id));

    // Clear software interrupt
    clint_clear_ipi(hart_id);

    // Handle IPI
    // Could be:
    // - TLB shootdown
    // - CPU wakeup
    // - Cache operations
    handle_smp_call(regs);
}
```

**Explanation**:

- **Software interrupts** MSIP triggers software interrupts between cores
- **Timer interrupts** MTIMECMP provides per-core timer interrupts
- **Core-local** each CPU has its own CLINT registers
- **IPI support** enables inter-processor communication
- **Timer management** critical for kernel timer subsystem

## Interrupt Controller Drivers

**What**: Kernel drivers initialize and manage interrupt controllers.

**How**: Interrupt controller drivers work:

```c
// Example: PLIC driver initialization
static int plic_probe(struct platform_device *pdev) {
    struct device_node *node = pdev->dev.of_node;
    void __iomem *base;
    int ret;
    unsigned int nr_irqs, nr_contexts;

    // Get base address from device tree
    base = of_iomap(node, 0);
    if (!base) {
        dev_err(&pdev->dev, "Failed to map PLIC registers\n");
        return -ENOMEM;
    }

    // Get number of interrupt sources
    ret = of_property_read_u32(node, "riscv,ndev", &nr_irqs);
    if (ret) {
        nr_irqs = 1024;  // Default
    }

    // Get number of contexts
    ret = of_property_read_u32(node, "riscv,max-contexts", &nr_contexts);
    if (ret) {
        nr_contexts = num_possible_cpus() * 2;  // Per CPU, M and S mode
    }

    // Initialize PLIC
    plic_init(base, nr_irqs, nr_contexts);

    platform_set_drvdata(pdev, base);

    dev_info(&pdev->dev, "PLIC: %u interrupts, %u contexts\n",
             nr_irqs, nr_contexts);

    return 0;
}

// Example: PLIC driver initialization function
void plic_init(void __iomem *base, unsigned int nr_irqs,
              unsigned int nr_contexts) {
    unsigned int context_id;
    unsigned int hart_id;

    // Store base address
    plic_base = base;
    plic_nr_irqs = nr_irqs;
    plic_nr_contexts = nr_contexts;

    // Initialize all interrupt priorities to 0 (disabled)
    for (unsigned int irq = 1; irq < nr_irqs; irq++) {
        plic_set_priority(irq, 0);
    }

    // Setup contexts (one per CPU for supervisor mode)
    for (unsigned int cpu = 0; cpu < num_possible_cpus(); cpu++) {
        hart_id = cpu;
        context_id = hart_id * 2 + 1;  // Supervisor mode context

        // Set threshold to 0 (accept all priorities >= 0)
        plic_set_threshold(context_id, 0);

        // Disable all interrupts initially
        plic_disable_all(context_id);
    }

    // Register PLIC as interrupt controller
    irq_domain_add_linear(NULL, nr_irqs, &plic_irq_domain_ops, NULL);
}

// Example: CLINT driver initialization
static int clint_probe(struct platform_device *pdev) {
    struct device_node *node = pdev->dev.of_node;
    void __iomem *base;
    int ret;

    // Get base address from device tree
    base = of_iomap(node, 0);
    if (!base) {
        dev_err(&pdev->dev, "Failed to map CLINT registers\n");
        return -ENOMEM;
    }

    clint_base = base;

    // Setup timer interrupt handler
    setup_timer_interrupt();

    // Setup software interrupt handler
    setup_software_interrupt();

    dev_info(&pdev->dev, "CLINT initialized\n");

    return 0;
}

// Example: Device tree bindings
// PLIC device tree node:
/*
plic: interrupt-controller@c000000 {
    compatible = "riscv,plic0";
    reg = <0x0 0xc000000 0x0 0x4000000>;
    interrupts-extended = <
        &cpu0_intc 11 &cpu0_intc 9
        &cpu1_intc 11 &cpu1_intc 9
    >;
    interrupt-controller;
    #interrupt-cells = <1>;
    riscv,ndev = <64>;
    riscv,max-contexts = <8>;
};
*/

// CLINT device tree node:
/*
clint: timer@2000000 {
    compatible = "riscv,clint0";
    reg = <0x0 0x2000000 0x0 0x10000>;
    interrupts-extended = <
        &cpu0_intc 3 &cpu0_intc 7
        &cpu1_intc 3 &cpu1_intc 7
    >;
    clocks = <&clk>;
};
*/
```

**Explanation**:

- **Driver initialization** drivers initialize controllers during boot
- **Device tree** controllers described in device tree
- **Register mapping** map controller registers into kernel space
- **Configuration** configure priorities, enables, thresholds
- **IRQ domain** register controllers as interrupt domains

## Interrupt Routing

**What**: Interrupt routing determines which CPU core handles which interrupts.

**How**: Interrupt routing works:

```c
// Example: Interrupt routing configuration
void configure_interrupt_routing(unsigned int irq, unsigned int cpu) {
    // Route interrupt to specific CPU

    // Set interrupt priority (higher priority = handled first)
    plic_set_priority(irq, 7);  // High priority

    // Enable interrupt for target CPU's context
    unsigned int context_id = cpu * 2 + 1;  // Supervisor mode
    plic_enable_irq(context_id, irq);

    // Set affinity (which CPU handles interrupt)
    irq_set_affinity(irq, cpumask_of(cpu));
}

// Example: Load balancing interrupts across CPUs
void balance_interrupts(void) {
    unsigned int num_cpus = num_online_cpus();
    unsigned int cpu = 0;

    // Distribute interrupts across CPUs
    for (unsigned int irq = 1; irq < plic_nr_irqs; irq++) {
        if (interrupt_controller->irq_is_enabled(irq)) {
            // Route to next CPU in round-robin
            configure_interrupt_routing(irq, cpu);
            cpu = (cpu + 1) % num_cpus;
        }
    }
}

// Example: CPU affinity for interrupts
void set_interrupt_affinity(unsigned int irq, cpumask_t mask) {
    // Set which CPUs can handle this interrupt
    // Affinity determines load balancing

    struct irq_data *irq_data = irq_get_irq_data(irq);

    // Set affinity mask
    irq_set_affinity(irq, &mask);

    // Enable on all CPUs in mask
    for_each_cpu(cpu, &mask) {
        unsigned int context_id = cpu * 2 + 1;
        plic_enable_irq(context_id, irq);
    }
}
```

**Explanation**:

- **CPU routing** route interrupts to specific CPUs
- **Affinity** set CPU affinity for load balancing
- **Priority** priorities affect which interrupts handled first
- **Load balancing** distribute interrupts across CPUs
- **SMP support** routing critical for multi-core systems

## Next Steps

**What** you're ready for next:

After understanding interrupt controllers, you should be ready to:

1. **Learn Exception Context** - Register saving and restoration
2. **Study Kernel Entry/Exit** - Kernel entry and exit mechanisms
3. **Understand Nested Interrupts** - Handling nested interrupts
4. **Explore Interrupt Handlers** - Writing interrupt handlers
5. **Begin Interrupt Debugging** - Debug interrupt handling

**Where** to go next:

Continue with the next lesson on **"Exception Context"** to learn:

- Register context saving
- Exception frame structure
- Context restoration
- Nested exception handling
- Per-CPU exception context

**Why** the next lesson is important:

Exception context management is essential for correct exception handling. Understanding how registers are saved and restored is critical for kernel development.

**How** to continue learning:

1. **Study Kernel Code** - Examine exception context code
2. **Use Debugger** - Inspect exception contexts
3. **Trace Exceptions** - Trace exception handling flow
4. **Read Documentation** - Study RISC-V exception specification
5. **Write Handlers** - Write exception handlers and test

## Resources

**Official Documentation**:

- [RISC-V Platform Specification](https://github.com/riscv/riscv-platform-specs) - PLIC/CLINT specs
- [RISC-V Privileged ISA](https://github.com/riscv/riscv-isa-manual) - Exception specification

**Kernel Sources**:

- [Linux RISC-V PLIC Driver](https://github.com/torvalds/linux/tree/master/drivers/irqchip) - PLIC driver code
- [Linux RISC-V CLINT](https://github.com/torvalds/linux/tree/master/drivers/clocksource) - CLINT code
