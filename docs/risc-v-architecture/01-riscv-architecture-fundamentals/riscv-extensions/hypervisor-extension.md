---
sidebar_position: 2
---

# Hypervisor Extension

Master RISC-V Hypervisor Extension (H) that enables virtualization support, allowing multiple guest operating systems to run concurrently on RISC-V systems, essential for cloud computing, containers, and virtualized environments.

## What Is the Hypervisor Extension?

**What**: The RISC-V Hypervisor Extension (H) adds a new privilege level (Hypervisor mode or HS-mode) above Supervisor mode, enabling hardware-assisted virtualization. It allows a hypervisor to run multiple guest operating systems with hardware support for isolation and virtualization.

**Why**: Understanding the Hypervisor Extension is crucial because:

- **Virtualization** - Enables running multiple VMs on single hardware
- **Cloud Computing** - Essential for cloud and datacenter deployments
- **Containers** - Supports container runtime environments
- **Security** - Hardware isolation between VMs
- **Performance** - Hardware-assisted virtualization is more efficient
- **KVM Support** - Enables Kernel-based Virtual Machine on RISC-V

**When**: Hypervisor Extension is used when:

- **Virtual Machine Management** - Running multiple VMs concurrently
- **Cloud Services** - Cloud providers virtualizing customer workloads
- **Development** - Isolated development environments
- **Testing** - Testing kernel on virtual hardware
- **Legacy Support** - Running legacy OSes on modern hardware
- **Resource Sharing** - Sharing hardware resources among VMs

**How**: Hypervisor Extension works through:

- **HS-Mode** - Hypervisor Supervisor mode (hypervisor runs here)
- **VS-Mode** - Virtual Supervisor mode (guest kernels run here)
- **Two-Stage Translation** - Nested page tables for guest memory
- **Virtualization CSRs** - CSRs for guest state management
- **Interrupt Virtualization** - Hardware support for interrupt virtualization
- **Timer Virtualization** - Virtual timer support for guests

**Where**: Hypervisor Extension is found in:

- **High-End RISC-V CPUs** - Server and datacenter processors
- **Cloud Infrastructure** - Cloud provider platforms
- **Virtualization Platforms** - Virtualization software stacks
- **KVM** - Kernel Virtual Machine implementation
- **QEMU** - Emulator with RISC-V hypervisor support
- **Development Tools** - Testing and development environments

## Hypervisor Privilege Levels

**What**: Hypervisor Extension introduces a new privilege level hierarchy for virtualization.

**How**: Privilege levels work:

```c
// Example: RISC-V privilege levels with Hypervisor Extension
// Machine Mode (M) - Highest privilege
//   ├── Hypervisor Supervisor Mode (HS) - Hypervisor runs here
//   │     ├── Virtual Supervisor Mode (VS) - Guest kernels
//   │     └── Virtual User Mode (VU) - Guest user programs
//   ├── Supervisor Mode (S) - Host OS kernel (when no hypervisor)
//   └── User Mode (U) - Host user programs

// Privilege level encoding:
#define PRV_U  0  // User mode
#define PRV_S  1  // Supervisor mode
#define PRV_HS 2  // Hypervisor Supervisor mode
#define PRV_M  3  // Machine mode

// Example: Checking Hypervisor Extension support
bool has_hypervisor_extension(void) {
    unsigned long misa;

    // Read misa CSR
    __asm__ volatile("csrr %0, misa" : "=r"(misa));

    // Check 'H' bit (Hypervisor extension)
    return (misa & (1UL << ('H' - 'A'))) != 0;
}

// Example: Current privilege level detection
unsigned int get_current_privilege_level(void) {
    unsigned long mstatus;
    unsigned int level;

    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Extract MPP field (previous privilege)
    // In hypervisor context, MPP indicates privilege
    level = (mstatus >> MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    // If in HS-mode, check hstatus for VS-mode indication
    if (level == PRV_HS) {
        unsigned long hstatus;
        __asm__ volatile("csrr %0, hstatus" : "=r"(hstatus));

        // Check if guest mode (VS-mode)
        if (hstatus & HSTATUS_VTSR) {
            return PRV_VS;  // Virtual Supervisor mode
        }
    }

    return level;
}

// Example: Entering hypervisor mode
void enter_hypervisor_mode(void (*hypervisor_entry)(void)) {
    unsigned long mstatus;
    unsigned long mtvec;

    // Configure machine mode for hypervisor delegation
    __asm__ volatile("csrr %0, mstatus" : "=r"(mstatus));

    // Set MPP to Hypervisor Supervisor mode
    mstatus &= ~MSTATUS_MPP_MASK;
    mstatus |= (PRV_HS << MSTATUS_MPP_SHIFT) & MSTATUS_MPP_MASK;

    __asm__ volatile("csrw mstatus, %0" : : "r"(mstatus));

    // Set hypervisor trap handler
    mtvec = (unsigned long)hypervisor_entry;
    __asm__ volatile("csrw mtvec, %0" : : "r"(mtvec));

    // Set mepc to hypervisor entry point
    __asm__ volatile("csrw mepc, %0" : : "r"(hypervisor_entry));

    // Enter hypervisor mode via MRET
    __asm__ volatile("mret");
}

// Example: Hypervisor entry point
void hypervisor_entry_point(void) {
    // Hypervisor starts here in HS-mode
    // Initialize hypervisor state

    // Configure hstatus CSR
    unsigned long hstatus = 0;
    hstatus |= HSTATUS_VTSR;  // Enable VS-mode
    __asm__ volatile("csrw hstatus, %0" : : "r"(hstatus));

    // Initialize hypervisor CSRs
    setup_hypervisor_csrs();

    // Start hypervisor main loop
    hypervisor_main();
}
```

**Explanation**:

- **HS-mode** hypervisor runs in Hypervisor Supervisor mode
- **VS-mode** guest kernels run in Virtual Supervisor mode
- **Privilege hierarchy** Machine > HS > VS > VU
- **Extension check** verify Hypervisor Extension via misa CSR
- **Mode transitions** use MRET/SRET to transition between modes

## Two-Stage Address Translation

**What**: Two-stage address translation allows guests to use their own page tables while hypervisor maintains control over physical memory.

**Why**: Two-stage translation is essential because:

- **Guest Isolation** - Guests manage their own virtual memory
- **Security** - Hypervisor controls actual physical memory
- **Flexibility** - Guests see their own address space
- **Performance** - Hardware-accelerated nested page table walks
- **Transparency** - Guests don't need to know about hypervisor

**How**: Two-stage translation works:

```c
// Example: Two-stage address translation
// Stage 1: Guest Virtual (GV) -> Guest Physical (GP)
//          Uses guest page tables (gpa -> gva)
// Stage 2: Guest Physical (GP) -> Physical (P)
//          Uses hypervisor page tables (pa -> gpa)

// Example: Hypervisor page table setup for guest
struct guest_memory_map {
    unsigned long guest_phys_start;
    unsigned long guest_phys_size;
    unsigned long host_phys_start;
    bool is_valid;
};

// Map guest physical address to host physical address
void map_guest_physical(struct guest_memory_map *map,
                       unsigned long guest_pa, unsigned long host_pa,
                       unsigned long size, unsigned long flags) {
    // Create hypervisor page table entry mapping guest physical to host physical
    // This is Stage 2 translation

    unsigned long hgatp;  // Hypervisor Guest Address Translation and Protection

    // Get current hgatp value
    __asm__ volatile("csrr %0, hgatp" : "=r"(hgatp));

    // Build Stage 2 page table entry
    // Map guest physical page to host physical page
    install_stage2_pte(hgatp, guest_pa, host_pa, flags);

    // Flush Stage 2 TLB
    __asm__ volatile("hfence.vvma %0" :: "r"(guest_pa));
}

// Example: Guest page table management
void setup_guest_page_table(struct guest_vcpu *vcpu, unsigned long gpa_root) {
    unsigned long hgatp;

    // Configure hgatp (Hypervisor Guest Address Translation and Protection)
    // hgatp controls Stage 2 translation for the guest

    // Build hgatp value:
    // [63:60] - Mode (Sv39, Sv48, etc.)
    // [59:44] - VMID (Virtual Machine ID)
    // [43:0]  - PPN (Root page table physical page number)

    unsigned long mode = SATP_MODE_SV39 << 60;
    unsigned long vmid = vcpu->vmid << 44;
    unsigned long ppn = gpa_root >> PAGE_SHIFT;

    hgatp = mode | vmid | ppn;

    // Write hgatp for this guest
    __asm__ volatile("csrw hgatp, %0" : : "r"(hgatp));

    // Flush Stage 2 TLB
    __asm__ volatile("hfence.vvma zero, zero");
}

// Example: Address translation walk
unsigned long translate_guest_address(struct guest_vcpu *vcpu,
                                     unsigned long guest_va) {
    unsigned long guest_pa, host_pa;

    // Stage 1: Translate guest virtual to guest physical
    // Walk guest page tables (Stage 1)
    guest_pa = walk_stage1_page_table(vcpu->satp, guest_va);

    if (!guest_pa) {
        return 0;  // Guest page fault
    }

    // Stage 2: Translate guest physical to host physical
    // Walk hypervisor page tables (Stage 2)
    unsigned long hgatp;
    __asm__ volatile("csrr %0, hgatp" : "=r"(hgatp));

    host_pa = walk_stage2_page_table(hgatp, guest_pa);

    return host_pa;
}

// Example: Stage 1 page fault (guest page fault)
void handle_guest_page_fault(struct guest_vcpu *vcpu, unsigned long guest_va,
                            unsigned long scause) {
    // Guest encountered page fault in its page tables
    // Inject page fault to guest

    // Save fault information in guest CSRs
    unsigned long sepc = vcpu->sepc;
    unsigned long stval = guest_va;

    // Set guest cause
    vcpu->scause = scause;
    vcpu->stval = stval;

    // Guest will handle its own page fault
    // Return to guest to handle fault
}

// Example: Stage 2 page fault (hypervisor page fault)
void handle_stage2_page_fault(struct guest_vcpu *vcpu, unsigned long guest_pa) {
    // Guest physical address not mapped in hypervisor page tables
    // Hypervisor must allocate and map page

    // Allocate host physical page
    unsigned long host_pa = alloc_host_page();

    if (!host_pa) {
        // Out of memory
        inject_exception_to_guest(vcpu, CAUSE_LOAD_ACCESS_FAULT);
        return;
    }

    // Map guest physical to host physical
    map_guest_physical(vcpu->memory_map, guest_pa, host_pa,
                      PAGE_SIZE, VM_READ | VM_WRITE);

    // Retry instruction
    // Guest instruction will succeed after mapping
}
```

**Explanation**:

- **Two stages** guest virtual → guest physical → host physical
- **Stage 1** guest manages its own page tables
- **Stage 2** hypervisor manages guest physical to host physical mapping
- **hgatp CSR** controls Stage 2 translation for guest
- **TLB flushing** hfence.vvma flushes Stage 2 TLB entries

## Guest State Management

**What**: Hypervisor manages guest state including registers, CSRs, and execution context.

**How**: Guest state management works:

```c
// Example: Guest VCPU state structure
struct guest_vcpu {
    // Guest general registers
    unsigned long gpr[32];  // x0-x31

    // Guest CSRs
    unsigned long sepc;     // Guest exception PC
    unsigned long scause;   // Guest exception cause
    unsigned long stval;    // Guest trap value
    unsigned long sstatus;  // Guest status
    unsigned long satp;     // Guest page table root

    // Guest state
    unsigned long vmid;     // Virtual Machine ID
    unsigned long state;    // VCPU state (running, paused, etc.)

    // Hypervisor state
    unsigned long hstatus;  // Hypervisor status
    unsigned long hgatp;   // Stage 2 page table root
};

// Example: Saving guest state
void save_guest_state(struct guest_vcpu *vcpu) {
    // Save guest general registers
    // (Saved when trap occurs)

    // Save guest CSRs
    // These are in VS-mode, accessed via hstatus
    vcpu->sepc = read_guest_csr(vcpu, CSR_SEPC);
    vcpu->scause = read_guest_csr(vcpu, CSR_SCAUSE);
    vcpu->stval = read_guest_csr(vcpu, CSR_STVAL);
    vcpu->sstatus = read_guest_csr(vcpu, CSR_SSTATUS);
    vcpu->satp = read_guest_csr(vcpu, CSR_SATP);
}

// Example: Restoring guest state
void restore_guest_state(struct guest_vcpu *vcpu) {
    // Restore guest CSRs
    write_guest_csr(vcpu, CSR_SEPC, vcpu->sepc);
    write_guest_csr(vcpu, CSR_SCAUSE, vcpu->scause);
    write_guest_csr(vcpu, CSR_STVAL, vcpu->stval);
    write_guest_csr(vcpu, CSR_SSTATUS, vcpu->sstatus);
    write_guest_csr(vcpu, CSR_SATP, vcpu->satp);

    // Restore guest general registers
    // (Restored before returning to guest)

    // Restore Stage 2 page table
    __asm__ volatile("csrw hgatp, %0" : : "r"(vcpu->hgatp));
}

// Example: Entering guest (VS-mode)
void enter_guest(struct guest_vcpu *vcpu) {
    // Restore guest state
    restore_guest_state(vcpu);

    // Set up for guest entry
    unsigned long hstatus;
    __asm__ volatile("csrr %0, hstatus" : "=r"(hstatus));

    // Enable VS-mode
    hstatus |= HSTATUS_VTSR;  // Virtual Trap Supervisor Registers

    __asm__ volatile("csrw hstatus, %0" : : "r"(hstatus));

    // Set hypervisor trap vector
    __asm__ volatile("csrw stvec, %0" : : "r"(hypervisor_trap_handler));

    // Load guest entry point
    unsigned long sepc = vcpu->sepc;
    __asm__ volatile("csrw sepc, %0" : : "r"(sepc));

    // Return to guest via SRET (enters VS-mode)
    __asm__ volatile("sret");

    // Execution continues in guest (VS-mode)
}

// Example: Exiting guest (VS-mode to HS-mode)
void exit_guest(struct guest_vcpu *vcpu, unsigned long scause) {
    // Save guest state
    save_guest_state(vcpu);

    // Save exit reason
    vcpu->exit_reason = scause;

    // Handle exit based on cause
    handle_guest_exit(vcpu, scause);
}
```

**Explanation**:

- **VCPU state** hypervisor maintains complete guest state
- **CSR virtualization** guest CSRs accessed via hstatus virtualization
- **State save/restore** save state on exit, restore on entry
- **VS-mode entry** enter guest via SRET, automatically enters VS-mode
- **Exit handling** handle exits based on exit cause

## Interrupt Virtualization

**What**: Interrupt virtualization allows guests to handle interrupts while hypervisor maintains control.

**How**: Interrupt virtualization works:

```c
// Example: Virtual interrupt injection
void inject_virtual_interrupt(struct guest_vcpu *vcpu, unsigned int irq) {
    // Inject interrupt to guest
    // Set virtual interrupt pending bit

    unsigned long hvip;  // Hypervisor Virtual Interrupt Pending

    __asm__ volatile("csrr %0, hvip" : "=r"(hvip));

    // Set interrupt pending bit
    hvip |= (1UL << irq);

    __asm__ volatile("csrw hvip, %0" : : "r"(hvip));

    // Guest will see interrupt via vsip CSR (Virtual Supervisor Interrupt Pending)
}

// Example: Virtual interrupt handling in guest
void guest_interrupt_handler(struct guest_vcpu *vcpu) {
    unsigned long vsip;  // Virtual Supervisor Interrupt Pending

    // Read virtual interrupt pending (from guest perspective)
    // vsip is virtualized view of sip

    // Check which interrupts are pending
    if (vsip & (1 << IRQ_S_EXT)) {
        // Handle external interrupt
        handle_guest_external_interrupt(vcpu);
    }

    if (vsip & (1 << IRQ_S_TIMER)) {
        // Handle timer interrupt
        handle_guest_timer_interrupt(vcpu);
    }
}

// Example: Physical interrupt routing to guest
void route_interrupt_to_guest(struct guest_vcpu *vcpu, unsigned int irq) {
    // Physical interrupt occurred, route to appropriate guest

    // Check if interrupt should go to this guest
    if (vcpu->interrupt_mask & (1 << irq)) {
        // Inject to guest
        inject_virtual_interrupt(vcpu, irq);

        // If guest is not running, wake it up
        if (vcpu->state == VCPU_PAUSED) {
            schedule_vcpu(vcpu);
        }
    }
}

// Example: Virtual timer for guest
void setup_guest_timer(struct guest_vcpu *vcpu, unsigned long timeout) {
    // Setup virtual timer for guest
    // Guest sees virtual time, hypervisor manages physical timer

    vcpu->virtual_timer = timeout;
    vcpu->virtual_time = get_physical_time();  // Snapshot physical time

    // Schedule physical timer interrupt
    schedule_physical_timer(timeout, vcpu);
}

void handle_guest_timer(struct guest_vcpu *vcpu) {
    // Physical timer expired for this guest

    // Update virtual time
    unsigned long elapsed = get_physical_time() - vcpu->virtual_time;
    vcpu->virtual_time += elapsed;

    // Inject timer interrupt to guest
    inject_virtual_interrupt(vcpu, IRQ_S_TIMER);
}
```

**Explanation**:

- **Virtual interrupts** guests see virtual interrupts via vsip CSR
- **Interrupt injection** hypervisor injects interrupts to guests
- **Interrupt routing** physical interrupts routed to appropriate guests
- **Virtual timer** guests see virtual time, hypervisor manages physical timer
- **Interrupt masking** hypervisor controls which interrupts reach guests

## KVM on RISC-V

**What**: KVM (Kernel-based Virtual Machine) is a Linux kernel module that provides virtualization support using the Hypervisor Extension.

**How**: KVM works on RISC-V:

```c
// Example: KVM RISC-V VCPU structure (simplified)
struct kvm_vcpu_arch {
    // Guest register state
    struct riscv_cpu_context gpr;  // Guest general registers

    // Guest CSRs
    unsigned long guest_csr[CSR_COUNT];

    // Hypervisor state
    unsigned long hstatus;
    unsigned long hgatp;

    // VCPU state
    unsigned long state;
    unsigned long vcpu_id;
};

// Example: KVM VCPU run (enter guest)
int kvm_arch_vcpu_ioctl_run(struct kvm_vcpu *vcpu) {
    struct kvm_vcpu_arch *arch = &vcpu->arch;
    int ret;

    // Prepare to enter guest
    prepare_vcpu_entry(arch);

    // Load guest state
    load_guest_registers(arch);
    load_guest_csrs(arch);

    // Set hypervisor CSRs
    __asm__ volatile("csrw hgatp, %0" : : "r"(arch->hgatp));

    // Enter guest
    ret = __kvm_riscv_vcpu_enter_guest(vcpu);

    // Guest exited, save state
    save_guest_registers(arch);
    save_guest_csrs(arch);

    // Handle exit
    handle_vcpu_exit(vcpu);

    return ret;
}

// Example: KVM guest entry (assembly)
// __kvm_riscv_vcpu_enter_guest:
//   Save host registers
//   Load guest registers
//   Set hgatp (Stage 2 page table)
//   Set hstatus
//   sret  // Enter guest (VS-mode)
//   // Guest executes here
//   // On exit, trap to hypervisor
//   // Save guest registers
//   // Load host registers
//   // Return

// Example: KVM MMU (Memory Management Unit)
void kvm_riscv_mmu_map(struct kvm *kvm, unsigned long gpa,
                      unsigned long hpa, unsigned long size,
                      unsigned long flags) {
    // Map guest physical to host physical in Stage 2 page tables

    // Get hypervisor page table root
    unsigned long hgatp = kvm->arch.hgatp;

    // Install Stage 2 PTE
    install_stage2_pte_range(hgatp, gpa, hpa, size, flags);

    // Invalidate Stage 2 TLB
    __asm__ volatile("hfence.vvma %0" :: "r"(gpa));
}
```

**Explanation**:

- **KVM architecture** KVM provides kernel interface to hypervisor
- **VCPU management** KVM manages VCPU lifecycle and state
- **Guest entry/exit** KVM handles entering and exiting guests
- **MMU integration** KVM manages Stage 2 page tables
- **Device emulation** KVM handles device virtualization

## Next Steps

**What** you're ready for next:

After mastering Hypervisor Extension, you should be ready to:

1. **Learn Cryptographic Extensions** - Hardware cryptographic acceleration
2. **Study Custom Extensions** - Platform-specific extensions
3. **Understand KVM Implementation** - Deep dive into KVM on RISC-V
4. **Explore Device Virtualization** - I/O device virtualization
5. **Begin Virtualization Development** - Apply hypervisor knowledge

**Where** to go next:

Continue with the next lesson on **"Cryptographic Extensions"** to learn:

- Cryptographic instruction set
- Hash functions acceleration
- Encryption/decryption support
- Kernel cryptographic framework
- Performance optimizations

**Why** the next lesson is important:

Cryptographic Extensions provide hardware acceleration for cryptographic operations, essential for secure communications and data protection.

**How** to continue learning:

1. **Study Spec** - Read RISC-V Hypervisor Extension specification
2. **Use QEMU** - Test virtualization with QEMU
3. **Study KVM Code** - Examine KVM RISC-V implementation
4. **Write Hypervisor** - Implement simple hypervisor
5. **Benchmark** - Measure virtualization performance

## Resources

**Official Documentation**:

- [RISC-V Hypervisor Extension Specification](https://github.com/riscv/riscv-isa-manual) - Complete hypervisor spec
- [RISC-V Foundation](https://riscv.org/technical/specifications/) - All RISC-V specifications

**Kernel Sources**:

- [Linux KVM RISC-V](https://github.com/torvalds/linux/tree/master/arch/riscv/kvm) - KVM implementation
