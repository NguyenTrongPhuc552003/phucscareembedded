---
sidebar_position: 1
---

# Interrupt Handling

Master interrupt handling in embedded Rust with comprehensive explanations using the 4W+H framework.

## What Is Interrupt Handling in Embedded Systems?

**What**: Interrupt handling in embedded systems refers to the mechanisms and techniques used to respond to asynchronous events that require immediate attention from the processor.

**Why**: Understanding interrupt handling is crucial because:

- **Real-time responsiveness** enables immediate response to critical events
- **System efficiency** allows the processor to handle multiple tasks concurrently
- **Event-driven programming** supports reactive system design
- **Hardware integration** facilitates direct hardware event handling
- **Performance optimization** enables efficient resource utilization
- **System reliability** ensures robust handling of critical events

**When**: Use interrupt handling when you need to:

- Respond to hardware events (button presses, sensor readings)
- Handle time-critical operations (timers, communication)
- Implement real-time systems
- Process asynchronous data (UART, SPI, I2C)
- Manage system events (power management, errors)
- Create responsive user interfaces

**How**: Interrupt handling works by:

- **Interrupt vectors** defining entry points for different interrupt types
- **Interrupt service routines (ISRs)** handling specific interrupt events
- **Priority management** controlling interrupt execution order
- **Context switching** preserving and restoring processor state
- **Nesting control** managing interrupt nesting and preemption
- **Error handling** managing interrupt-related errors gracefully

**Where**: Interrupt handling is used in embedded systems, real-time applications, IoT devices, automotive systems, and any application requiring responsive event handling.

## Understanding Interrupt Service Routines (ISRs)

### What are Interrupt Service Routines?

**What**: Interrupt Service Routines (ISRs) are special functions that are automatically called by the processor when specific interrupt events occur.

**Why**: Understanding ISRs is important because:

- **Event handling** provides immediate response to hardware events
- **System responsiveness** enables real-time system behavior
- **Hardware integration** facilitates direct hardware event processing
- **Performance** allows efficient handling of asynchronous events
- **Reliability** ensures robust event processing

**When**: Use ISRs when you need to:

- Handle hardware interrupts
- Process time-critical events
- Implement real-time systems
- Manage asynchronous data
- Respond to system events

**How**: Here's how to implement ISRs in embedded Rust:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Interrupt vector table
#[link_section = ".vector_table.interrupts"]
#[no_mangle]
pub static INTERRUPT_VECTORS: [Option<unsafe extern "C" fn()>; 240] = {
    const fn make_vector_table() -> [Option<unsafe extern "C" fn()>; 240] {
        let mut table = [None; 240];
        table[0] = Some(sys_tick_handler);
        table[1] = Some(gpio_interrupt_handler);
        table[2] = Some(uart_interrupt_handler);
        table[3] = Some(timer_interrupt_handler);
        table
    }
    make_vector_table()
};

// Global interrupt counters
static GPIO_INTERRUPT_COUNT: AtomicU32 = AtomicU32::new(0);
static UART_INTERRUPT_COUNT: AtomicU32 = AtomicU32::new(0);
static TIMER_INTERRUPT_COUNT: AtomicU32 = AtomicU32::new(0);

// System tick interrupt handler
#[no_mangle]
pub extern "C" fn sys_tick_handler() {
    // System tick interrupt - called every 1ms
    // Update system time, handle timeouts, etc.

    // Example: Update system tick counter
    static mut TICK_COUNT: u32 = 0;
    unsafe {
        TICK_COUNT += 1;
    }
}

// GPIO interrupt handler
#[no_mangle]
pub extern "C" fn gpio_interrupt_handler() {
    // GPIO interrupt handler
    GPIO_INTERRUPT_COUNT.fetch_add(1, Ordering::Relaxed);

    // Handle GPIO interrupt
    // - Read GPIO status register
    // - Determine which pin triggered the interrupt
    // - Process the event
    // - Clear interrupt flags

    // Example: Toggle LED on button press
    handle_button_press();
}

// UART interrupt handler
#[no_mangle]
pub extern "C" fn uart_interrupt_handler() {
    // UART interrupt handler
    UART_INTERRUPT_COUNT.fetch_add(1, Ordering::Relaxed);

    // Handle UART interrupt
    // - Check UART status register
    // - Read received data
    // - Process received data
    // - Clear interrupt flags

    // Example: Process received UART data
    handle_uart_data();
}

// Timer interrupt handler
#[no_mangle]
pub extern "C" fn timer_interrupt_handler() {
    // Timer interrupt handler
    TIMER_INTERRUPT_COUNT.fetch_add(1, Ordering::Relaxed);

    // Handle timer interrupt
    // - Update timer counter
    // - Handle timer events
    // - Clear interrupt flags

    // Example: Update PWM duty cycle
    handle_timer_event();
}

// Interrupt handler implementations
fn handle_button_press() {
    // Read GPIO status to determine which pin triggered
    // Process button press event
    // Update system state
}

fn handle_uart_data() {
    // Read UART data register
    // Process received data
    // Update communication buffers
}

fn handle_timer_event() {
    // Update timer counter
    // Handle timer events
    // Update PWM or other timer-based operations
}

// Interrupt management functions
pub fn enable_interrupts() {
    unsafe {
        core::arch::asm!("cpsie i", options(nomem, nostack));
    }
}

pub fn disable_interrupts() {
    unsafe {
        core::arch::asm!("cpsid i", options(nomem, nostack));
    }
}

pub fn get_gpio_interrupt_count() -> u32 {
    GPIO_INTERRUPT_COUNT.load(Ordering::Relaxed)
}

pub fn get_uart_interrupt_count() -> u32 {
    UART_INTERRUPT_COUNT.load(Ordering::Relaxed)
}

pub fn get_timer_interrupt_count() -> u32 {
    TIMER_INTERRUPT_COUNT.load(Ordering::Relaxed)
}

// Panic handler
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    // Disable interrupts on panic
    disable_interrupts();

    // Enter infinite loop
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Example usage
fn main() {
    // Initialize system
    initialize_system();

    // Enable interrupts
    enable_interrupts();

    // Main application loop
    loop {
        // Check interrupt counts
        let gpio_count = get_gpio_interrupt_count();
        let uart_count = get_uart_interrupt_count();
        let timer_count = get_timer_interrupt_count();

        // Process application logic
        process_application_logic();

        // Small delay to prevent busy waiting
        delay_ms(1);
    }
}

fn initialize_system() {
    // Initialize hardware
    // Configure interrupt priorities
    // Set up interrupt vectors
}

fn process_application_logic() {
    // Main application logic
    // This runs between interrupts
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- **Interrupt vectors** define entry points for different interrupt types
- **ISR functions** handle specific interrupt events
- **Atomic operations** ensure thread-safe interrupt counting
- **Interrupt management** provides functions to enable/disable interrupts
- **Error handling** manages interrupt-related errors gracefully

**Why**: ISRs provide the foundation for responsive, event-driven embedded systems.

### Advanced ISR Implementation

**What**: Advanced ISR implementation includes interrupt prioritization, nesting control, and context management.

**Why**: Understanding advanced ISR implementation is important because:

- **Priority management** controls interrupt execution order
- **Nesting control** manages interrupt nesting and preemption
- **Context management** preserves and restores processor state
- **Performance** enables efficient interrupt handling
- **Reliability** ensures robust interrupt processing

**When**: Use advanced ISR implementation when you need to:

- Handle multiple interrupt sources
- Implement priority-based interrupt handling
- Manage interrupt nesting
- Optimize interrupt performance
- Ensure system reliability

**How**: Here's how to implement advanced ISR handling:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Interrupt priority levels
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum InterruptPriority {
    Level0 = 0,  // Highest priority
    Level1 = 1,
    Level2 = 2,
    Level3 = 3,
    Level4 = 4,
    Level5 = 5,
    Level6 = 6,
    Level7 = 7,  // Lowest priority
}

// Interrupt context
pub struct InterruptContext {
    pub interrupt_number: u8,
    pub priority: InterruptPriority,
    pub nesting_level: u8,
    pub timestamp: u32,
}

// Interrupt manager
pub struct InterruptManager {
    active_interrupts: [Option<InterruptContext>; 8],
    interrupt_counters: [AtomicU32; 8],
    nesting_level: AtomicU32,
    max_nesting_level: AtomicU32,
}

impl InterruptManager {
    pub fn new() -> Self {
        Self {
            active_interrupts: [None; 8],
            interrupt_counters: [AtomicU32::new(0); 8],
            nesting_level: AtomicU32::new(0),
            max_nesting_level: AtomicU32::new(0),
        }
    }

    pub fn register_interrupt(&mut self, interrupt_number: u8, priority: InterruptPriority) -> Result<(), InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        // Configure interrupt priority
        self.configure_interrupt_priority(interrupt_number, priority);

        // Enable interrupt
        self.enable_interrupt(interrupt_number);

        Ok(())
    }

    pub fn handle_interrupt(&mut self, interrupt_number: u8) -> Result<(), InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        // Update interrupt counter
        self.interrupt_counters[interrupt_number as usize].fetch_add(1, Ordering::Relaxed);

        // Update nesting level
        let current_nesting = self.nesting_level.fetch_add(1, Ordering::Relaxed);
        let max_nesting = self.max_nesting_level.load(Ordering::Relaxed);
        if current_nesting > max_nesting {
            self.max_nesting_level.store(current_nesting, Ordering::Relaxed);
        }

        // Create interrupt context
        let context = InterruptContext {
            interrupt_number,
            priority: self.get_interrupt_priority(interrupt_number),
            nesting_level: current_nesting as u8,
            timestamp: self.get_timestamp(),
        };

        // Store active interrupt
        self.active_interrupts[interrupt_number as usize] = Some(context);

        // Handle interrupt
        self.process_interrupt(interrupt_number);

        // Clear active interrupt
        self.active_interrupts[interrupt_number as usize] = None;

        // Decrement nesting level
        self.nesting_level.fetch_sub(1, Ordering::Relaxed);

        Ok(())
    }

    pub fn get_interrupt_count(&self, interrupt_number: u8) -> Result<u32, InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        Ok(self.interrupt_counters[interrupt_number as usize].load(Ordering::Relaxed))
    }

    pub fn get_nesting_level(&self) -> u32 {
        self.nesting_level.load(Ordering::Relaxed)
    }

    pub fn get_max_nesting_level(&self) -> u32 {
        self.max_nesting_level.load(Ordering::Relaxed)
    }

    pub fn is_interrupt_active(&self, interrupt_number: u8) -> bool {
        if interrupt_number >= 8 {
            return false;
        }

        self.active_interrupts[interrupt_number as usize].is_some()
    }

    fn configure_interrupt_priority(&self, interrupt_number: u8, priority: InterruptPriority) {
        // Hardware-specific implementation
        // This would configure the actual interrupt priority
    }

    fn enable_interrupt(&self, interrupt_number: u8) {
        // Hardware-specific implementation
        // This would enable the actual interrupt
    }

    fn get_interrupt_priority(&self, interrupt_number: u8) -> InterruptPriority {
        // Hardware-specific implementation
        // This would read the actual interrupt priority
        InterruptPriority::Level0
    }

    fn get_timestamp(&self) -> u32 {
        // Hardware-specific implementation
        // This would get the actual timestamp
        0
    }

    fn process_interrupt(&self, interrupt_number: u8) {
        match interrupt_number {
            0 => self.handle_sys_tick_interrupt(),
            1 => self.handle_gpio_interrupt(),
            2 => self.handle_uart_interrupt(),
            3 => self.handle_timer_interrupt(),
            _ => {
                // Handle unknown interrupt
            }
        }
    }

    fn handle_sys_tick_interrupt(&self) {
        // System tick interrupt handling
    }

    fn handle_gpio_interrupt(&self) {
        // GPIO interrupt handling
    }

    fn handle_uart_interrupt(&self) {
        // UART interrupt handling
    }

    fn handle_timer_interrupt(&self) {
        // Timer interrupt handling
    }
}

// Error type
#[derive(Debug)]
pub enum InterruptError {
    InvalidInterruptNumber,
    InterruptAlreadyRegistered,
    InterruptNotRegistered,
    PriorityConfigurationError,
    HardwareError,
}

// Global interrupt manager
static mut INTERRUPT_MANAGER: InterruptManager = InterruptManager {
    active_interrupts: [None; 8],
    interrupt_counters: [AtomicU32::new(0); 8],
    nesting_level: AtomicU32::new(0),
    max_nesting_level: AtomicU32::new(0),
};

// Interrupt handlers
#[no_mangle]
pub extern "C" fn sys_tick_handler() {
    unsafe {
        let _ = INTERRUPT_MANAGER.handle_interrupt(0);
    }
}

#[no_mangle]
pub extern "C" fn gpio_interrupt_handler() {
    unsafe {
        let _ = INTERRUPT_MANAGER.handle_interrupt(1);
    }
}

#[no_mangle]
pub extern "C" fn uart_interrupt_handler() {
    unsafe {
        let _ = INTERRUPT_MANAGER.handle_interrupt(2);
    }
}

#[no_mangle]
pub extern "C" fn timer_interrupt_handler() {
    unsafe {
        let _ = INTERRUPT_MANAGER.handle_interrupt(3);
    }
}

// Panic handler
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Example usage
fn main() {
    // Initialize interrupt manager
    unsafe {
        let _ = INTERRUPT_MANAGER.register_interrupt(0, InterruptPriority::Level0);
        let _ = INTERRUPT_MANAGER.register_interrupt(1, InterruptPriority::Level1);
        let _ = INTERRUPT_MANAGER.register_interrupt(2, InterruptPriority::Level2);
        let _ = INTERRUPT_MANAGER.register_interrupt(3, InterruptPriority::Level3);
    }

    // Main application loop
    loop {
        // Check interrupt statistics
        unsafe {
            let sys_tick_count = INTERRUPT_MANAGER.get_interrupt_count(0).unwrap();
            let gpio_count = INTERRUPT_MANAGER.get_interrupt_count(1).unwrap();
            let uart_count = INTERRUPT_MANAGER.get_interrupt_count(2).unwrap();
            let timer_count = INTERRUPT_MANAGER.get_interrupt_count(3).unwrap();

            let nesting_level = INTERRUPT_MANAGER.get_nesting_level();
            let max_nesting = INTERRUPT_MANAGER.get_max_nesting_level();
        }

        // Process application logic
        process_application_logic();

        // Small delay
        delay_ms(1);
    }
}

fn process_application_logic() {
    // Main application logic
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- **Interrupt prioritization** controls interrupt execution order
- **Nesting management** tracks interrupt nesting levels
- **Context management** preserves interrupt state
- **Performance monitoring** tracks interrupt statistics
- **Error handling** manages interrupt-related errors

**Why**: Advanced ISR implementation enables robust, efficient interrupt handling in complex embedded systems.

## Understanding Interrupt Priorities and Nesting

### What are Interrupt Priorities?

**What**: Interrupt priorities determine the order in which interrupts are processed when multiple interrupts occur simultaneously or when a higher-priority interrupt occurs during the execution of a lower-priority interrupt.

**Why**: Understanding interrupt priorities is important because:

- **System responsiveness** ensures critical events are handled first
- **Real-time behavior** enables predictable system timing
- **Resource management** prevents lower-priority interrupts from blocking critical operations
- **System stability** ensures reliable interrupt handling
- **Performance** enables efficient interrupt processing

**When**: Use interrupt priorities when you need to:

- Handle multiple interrupt sources
- Implement real-time systems
- Ensure critical events are processed first
- Manage system resources efficiently
- Create predictable system behavior

**How**: Here's how to implement interrupt priority management:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Interrupt priority configuration
pub struct InterruptPriorityConfig {
    pub interrupt_number: u8,
    pub priority: InterruptPriority,
    pub sub_priority: u8,
    pub enabled: bool,
}

// Interrupt priority manager
pub struct InterruptPriorityManager {
    priority_configs: [InterruptPriorityConfig; 8],
    current_priority: AtomicU32,
    max_priority: AtomicU32,
}

impl InterruptPriorityManager {
    pub fn new() -> Self {
        Self {
            priority_configs: [
                InterruptPriorityConfig {
                    interrupt_number: 0,
                    priority: InterruptPriority::Level0,
                    sub_priority: 0,
                    enabled: false,
                }; 8
            ],
            current_priority: AtomicU32::new(0),
            max_priority: AtomicU32::new(0),
        }
    }

    pub fn configure_priority(&mut self, interrupt_number: u8, priority: InterruptPriority, sub_priority: u8) -> Result<(), InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        // Validate priority
        if priority as u8 > 7 {
            return Err(InterruptError::InvalidPriority);
        }

        if sub_priority > 3 {
            return Err(InterruptError::InvalidSubPriority);
        }

        // Configure interrupt priority
        self.priority_configs[interrupt_number as usize] = InterruptPriorityConfig {
            interrupt_number,
            priority,
            sub_priority,
            enabled: true,
        };

        // Apply hardware configuration
        self.apply_priority_configuration(interrupt_number, priority, sub_priority);

        Ok(())
    }

    pub fn enable_interrupt(&mut self, interrupt_number: u8) -> Result<(), InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        self.priority_configs[interrupt_number as usize].enabled = true;
        self.apply_interrupt_enable(interrupt_number);

        Ok(())
    }

    pub fn disable_interrupt(&mut self, interrupt_number: u8) -> Result<(), InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        self.priority_configs[interrupt_number as usize].enabled = false;
        self.apply_interrupt_disable(interrupt_number);

        Ok(())
    }

    pub fn get_interrupt_priority(&self, interrupt_number: u8) -> Result<InterruptPriority, InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        Ok(self.priority_configs[interrupt_number as usize].priority)
    }

    pub fn is_interrupt_enabled(&self, interrupt_number: u8) -> Result<bool, InterruptError> {
        if interrupt_number >= 8 {
            return Err(InterruptError::InvalidInterruptNumber);
        }

        Ok(self.priority_configs[interrupt_number as usize].enabled)
    }

    pub fn can_interrupt_preempt(&self, current_interrupt: u8, new_interrupt: u8) -> bool {
        if current_interrupt >= 8 || new_interrupt >= 8 {
            return false;
        }

        let current_priority = self.priority_configs[current_interrupt as usize].priority;
        let new_priority = self.priority_configs[new_interrupt as usize].priority;

        // Higher priority (lower number) can preempt lower priority
        new_priority < current_priority
    }

    pub fn get_current_priority(&self) -> u32 {
        self.current_priority.load(Ordering::Relaxed)
    }

    pub fn get_max_priority(&self) -> u32 {
        self.max_priority.load(Ordering::Relaxed)
    }

    fn apply_priority_configuration(&self, interrupt_number: u8, priority: InterruptPriority, sub_priority: u8) {
        // Hardware-specific implementation
        // This would configure the actual interrupt priority
    }

    fn apply_interrupt_enable(&self, interrupt_number: u8) {
        // Hardware-specific implementation
        // This would enable the actual interrupt
    }

    fn apply_interrupt_disable(&self, interrupt_number: u8) {
        // Hardware-specific implementation
        // This would disable the actual interrupt
    }
}

// Interrupt nesting control
pub struct InterruptNestingController {
    nesting_level: AtomicU32,
    max_nesting_level: AtomicU32,
    interrupt_stack: [Option<u8>; 8],
    stack_pointer: AtomicU32,
}

impl InterruptNestingController {
    pub fn new() -> Self {
        Self {
            nesting_level: AtomicU32::new(0),
            max_nesting_level: AtomicU32::new(0),
            interrupt_stack: [None; 8],
            stack_pointer: AtomicU32::new(0),
        }
    }

    pub fn enter_interrupt(&mut self, interrupt_number: u8) -> Result<(), InterruptError> {
        let current_level = self.nesting_level.fetch_add(1, Ordering::Relaxed);

        // Update maximum nesting level
        let max_level = self.max_nesting_level.load(Ordering::Relaxed);
        if current_level > max_level {
            self.max_nesting_level.store(current_level, Ordering::Relaxed);
        }

        // Push interrupt to stack
        let stack_ptr = self.stack_pointer.load(Ordering::Relaxed);
        if stack_ptr >= 8 {
            return Err(InterruptError::StackOverflow);
        }

        self.interrupt_stack[stack_ptr as usize] = Some(interrupt_number);
        self.stack_pointer.store(stack_ptr + 1, Ordering::Relaxed);

        Ok(())
    }

    pub fn exit_interrupt(&mut self) -> Result<Option<u8>, InterruptError> {
        let current_level = self.nesting_level.fetch_sub(1, Ordering::Relaxed);

        if current_level == 0 {
            return Err(InterruptError::StackUnderflow);
        }

        // Pop interrupt from stack
        let stack_ptr = self.stack_pointer.load(Ordering::Relaxed);
        if stack_ptr == 0 {
            return Err(InterruptError::StackUnderflow);
        }

        let interrupt_number = self.interrupt_stack[(stack_ptr - 1) as usize];
        self.stack_pointer.store(stack_ptr - 1, Ordering::Relaxed);

        Ok(interrupt_number)
    }

    pub fn get_nesting_level(&self) -> u32 {
        self.nesting_level.load(Ordering::Relaxed)
    }

    pub fn get_max_nesting_level(&self) -> u32 {
        self.max_nesting_level.load(Ordering::Relaxed)
    }

    pub fn get_current_interrupt(&self) -> Option<u8> {
        let stack_ptr = self.stack_pointer.load(Ordering::Relaxed);
        if stack_ptr == 0 {
            None
        } else {
            self.interrupt_stack[(stack_ptr - 1) as usize]
        }
    }
}

// Error type
#[derive(Debug)]
pub enum InterruptError {
    InvalidInterruptNumber,
    InvalidPriority,
    InvalidSubPriority,
    StackOverflow,
    StackUnderflow,
    HardwareError,
}

// Interrupt priority enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum InterruptPriority {
    Level0 = 0,  // Highest priority
    Level1 = 1,
    Level2 = 2,
    Level3 = 3,
    Level4 = 4,
    Level5 = 5,
    Level6 = 6,
    Level7 = 7,  // Lowest priority
}

// Global interrupt managers
static mut PRIORITY_MANAGER: InterruptPriorityManager = InterruptPriorityManager {
    priority_configs: [
        InterruptPriorityConfig {
            interrupt_number: 0,
            priority: InterruptPriority::Level0,
            sub_priority: 0,
            enabled: false,
        }; 8
    ],
    current_priority: AtomicU32::new(0),
    max_priority: AtomicU32::new(0),
};

static mut NESTING_CONTROLLER: InterruptNestingController = InterruptNestingController {
    nesting_level: AtomicU32::new(0),
    max_nesting_level: AtomicU32::new(0),
    interrupt_stack: [None; 8],
    stack_pointer: AtomicU32::new(0),
};

// Interrupt handlers with priority management
#[no_mangle]
pub extern "C" fn sys_tick_handler() {
    unsafe {
        let _ = NESTING_CONTROLLER.enter_interrupt(0);
        // Handle system tick interrupt
        let _ = NESTING_CONTROLLER.exit_interrupt();
    }
}

#[no_mangle]
pub extern "C" fn gpio_interrupt_handler() {
    unsafe {
        let _ = NESTING_CONTROLLER.enter_interrupt(1);
        // Handle GPIO interrupt
        let _ = NESTING_CONTROLLER.exit_interrupt();
    }
}

#[no_mangle]
pub extern "C" fn uart_interrupt_handler() {
    unsafe {
        let _ = NESTING_CONTROLLER.enter_interrupt(2);
        // Handle UART interrupt
        let _ = NESTING_CONTROLLER.exit_interrupt();
    }
}

#[no_mangle]
pub extern "C" fn timer_interrupt_handler() {
    unsafe {
        let _ = NESTING_CONTROLLER.enter_interrupt(3);
        // Handle timer interrupt
        let _ = NESTING_CONTROLLER.exit_interrupt();
    }
}

// Panic handler
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Example usage
fn main() {
    // Configure interrupt priorities
    unsafe {
        let _ = PRIORITY_MANAGER.configure_priority(0, InterruptPriority::Level0, 0);
        let _ = PRIORITY_MANAGER.configure_priority(1, InterruptPriority::Level1, 0);
        let _ = PRIORITY_MANAGER.configure_priority(2, InterruptPriority::Level2, 0);
        let _ = PRIORITY_MANAGER.configure_priority(3, InterruptPriority::Level3, 0);

        let _ = PRIORITY_MANAGER.enable_interrupt(0);
        let _ = PRIORITY_MANAGER.enable_interrupt(1);
        let _ = PRIORITY_MANAGER.enable_interrupt(2);
        let _ = PRIORITY_MANAGER.enable_interrupt(3);
    }

    // Main application loop
    loop {
        // Check interrupt statistics
        unsafe {
            let nesting_level = NESTING_CONTROLLER.get_nesting_level();
            let max_nesting = NESTING_CONTROLLER.get_max_nesting_level();
            let current_interrupt = NESTING_CONTROLLER.get_current_interrupt();
        }

        // Process application logic
        process_application_logic();

        // Small delay
        delay_ms(1);
    }
}

fn process_application_logic() {
    // Main application logic
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- **Priority configuration** sets interrupt priorities and sub-priorities
- **Nesting control** manages interrupt nesting and preemption
- **Stack management** tracks interrupt execution order
- **Performance monitoring** tracks nesting statistics
- **Error handling** manages priority and nesting errors

**Why**: Interrupt priority management enables predictable, real-time system behavior in complex embedded applications.

## Understanding Critical Sections and Atomics

### What are Critical Sections?

**What**: Critical sections are code regions that must be executed atomically to prevent race conditions and ensure data consistency in multi-threaded or interrupt-driven environments.

**Why**: Understanding critical sections is important because:

- **Data consistency** prevents race conditions and data corruption
- **System stability** ensures reliable operation in interrupt-driven systems
- **Performance** enables efficient synchronization without blocking
- **Debugging** facilitates identification and resolution of concurrency issues
- **Reliability** ensures robust operation in complex systems

**When**: Use critical sections when you need to:

- Protect shared data from concurrent access
- Ensure atomic operations in interrupt handlers
- Prevent race conditions in multi-threaded code
- Synchronize access to hardware resources
- Maintain data consistency in real-time systems

**How**: Here's how to implement critical sections in embedded Rust:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Critical section manager
pub struct CriticalSection {
    interrupt_state: bool,
    nesting_level: u32,
}

impl CriticalSection {
    pub fn new() -> Self {
        Self {
            interrupt_state: false,
            nesting_level: 0,
        }
    }

    pub fn enter(&mut self) -> bool {
        // Save current interrupt state
        self.interrupt_state = self.are_interrupts_enabled();

        // Disable interrupts
        self.disable_interrupts();

        // Increment nesting level
        self.nesting_level += 1;

        self.interrupt_state
    }

    pub fn exit(&mut self) {
        // Decrement nesting level
        if self.nesting_level > 0 {
            self.nesting_level -= 1;
        }

        // Restore interrupt state if we're exiting the outermost critical section
        if self.nesting_level == 0 && self.interrupt_state {
            self.enable_interrupts();
        }
    }

    pub fn is_in_critical_section(&self) -> bool {
        self.nesting_level > 0
    }

    pub fn get_nesting_level(&self) -> u32 {
        self.nesting_level
    }

    fn are_interrupts_enabled(&self) -> bool {
        // Hardware-specific implementation
        // This would check the actual interrupt enable state
        true
    }

    fn disable_interrupts(&self) {
        unsafe {
            core::arch::asm!("cpsid i", options(nomem, nostack));
        }
    }

    fn enable_interrupts(&self) {
        unsafe {
            core::arch::asm!("cpsie i", options(nomem, nostack));
        }
    }
}

// Atomic operations wrapper
pub struct AtomicOperations {
    critical_section: CriticalSection,
}

impl AtomicOperations {
    pub fn new() -> Self {
        Self {
            critical_section: CriticalSection::new(),
        }
    }

    pub fn atomic_read<T>(&mut self, atomic: &AtomicU32) -> u32 {
        self.critical_section.enter();
        let value = atomic.load(Ordering::Relaxed);
        self.critical_section.exit();
        value
    }

    pub fn atomic_write<T>(&mut self, atomic: &AtomicU32, value: u32) {
        self.critical_section.enter();
        atomic.store(value, Ordering::Relaxed);
        self.critical_section.exit();
    }

    pub fn atomic_increment(&mut self, atomic: &AtomicU32) -> u32 {
        self.critical_section.enter();
        let value = atomic.fetch_add(1, Ordering::Relaxed);
        self.critical_section.exit();
        value
    }

    pub fn atomic_decrement(&mut self, atomic: &AtomicU32) -> u32 {
        self.critical_section.enter();
        let value = atomic.fetch_sub(1, Ordering::Relaxed);
        self.critical_section.exit();
        value
    }

    pub fn atomic_compare_and_swap(&mut self, atomic: &AtomicU32, expected: u32, new_value: u32) -> bool {
        self.critical_section.enter();
        let result = atomic.compare_exchange(expected, new_value, Ordering::Relaxed, Ordering::Relaxed).is_ok();
        self.critical_section.exit();
        result
    }
}

// Shared data protection
pub struct ProtectedData<T> {
    data: T,
    critical_section: CriticalSection,
}

impl<T> ProtectedData<T> {
    pub fn new(data: T) -> Self {
        Self {
            data,
            critical_section: CriticalSection::new(),
        }
    }

    pub fn read<F, R>(&mut self, f: F) -> R
    where
        F: FnOnce(&T) -> R,
    {
        self.critical_section.enter();
        let result = f(&self.data);
        self.critical_section.exit();
        result
    }

    pub fn write<F, R>(&mut self, f: F) -> R
    where
        F: FnOnce(&mut T) -> R,
    {
        self.critical_section.enter();
        let result = f(&mut self.data);
        self.critical_section.exit();
        result
    }

    pub fn modify<F, R>(&mut self, f: F) -> R
    where
        F: FnOnce(&mut T) -> R,
    {
        self.critical_section.enter();
        let result = f(&mut self.data);
        self.critical_section.exit();
        result
    }
}

// Interrupt-safe data structure
pub struct InterruptSafeCounter {
    counter: AtomicU32,
    max_value: u32,
    overflow_count: AtomicU32,
}

impl InterruptSafeCounter {
    pub fn new(max_value: u32) -> Self {
        Self {
            counter: AtomicU32::new(0),
            max_value,
            overflow_count: AtomicU32::new(0),
        }
    }

    pub fn increment(&self) -> u32 {
        let current = self.counter.fetch_add(1, Ordering::Relaxed);
        if current >= self.max_value {
            self.counter.store(0, Ordering::Relaxed);
            self.overflow_count.fetch_add(1, Ordering::Relaxed);
        }
        current
    }

    pub fn decrement(&self) -> u32 {
        let current = self.counter.fetch_sub(1, Ordering::Relaxed);
        if current == 0 {
            self.counter.store(self.max_value, Ordering::Relaxed);
        }
        current
    }

    pub fn get_value(&self) -> u32 {
        self.counter.load(Ordering::Relaxed)
    }

    pub fn get_overflow_count(&self) -> u32 {
        self.overflow_count.load(Ordering::Relaxed)
    }

    pub fn reset(&self) {
        self.counter.store(0, Ordering::Relaxed);
        self.overflow_count.store(0, Ordering::Relaxed);
    }
}

// Global protected data
static mut PROTECTED_COUNTER: InterruptSafeCounter = InterruptSafeCounter {
    counter: AtomicU32::new(0),
    max_value: 1000,
    overflow_count: AtomicU32::new(0),
};

// Interrupt handlers with critical section protection
#[no_mangle]
pub extern "C" fn sys_tick_handler() {
    // Increment counter atomically
    unsafe {
        PROTECTED_COUNTER.increment();
    }
}

#[no_mangle]
pub extern "C" fn gpio_interrupt_handler() {
    // Decrement counter atomically
    unsafe {
        PROTECTED_COUNTER.decrement();
    }
}

#[no_mangle]
pub extern "C" fn uart_interrupt_handler() {
    // Read counter value atomically
    unsafe {
        let value = PROTECTED_COUNTER.get_value();
        let overflow = PROTECTED_COUNTER.get_overflow_count();
    }
}

#[no_mangle]
pub extern "C" fn timer_interrupt_handler() {
    // Reset counter atomically
    unsafe {
        PROTECTED_COUNTER.reset();
    }
}

// Panic handler
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Example usage
fn main() {
    // Initialize system
    initialize_system();

    // Main application loop
    loop {
        // Read protected data
        unsafe {
            let counter_value = PROTECTED_COUNTER.get_value();
            let overflow_count = PROTECTED_COUNTER.get_overflow_count();
        }

        // Process application logic
        process_application_logic();

        // Small delay
        delay_ms(1);
    }
}

fn initialize_system() {
    // Initialize hardware
    // Configure interrupt priorities
    // Set up interrupt vectors
}

fn process_application_logic() {
    // Main application logic
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- **Critical section management** provides nested critical section support
- **Atomic operations** ensure thread-safe data access
- **Protected data** provides safe access to shared resources
- **Interrupt safety** ensures reliable operation in interrupt-driven systems
- **Performance monitoring** tracks critical section usage

**Why**: Critical sections and atomics ensure data consistency and system stability in interrupt-driven embedded systems.

## Key Takeaways

**What** you've learned about interrupt handling in embedded Rust:

1. **Interrupt Service Routines** - ISR implementation and management
2. **Interrupt Priorities** - Priority-based interrupt handling
3. **Interrupt Nesting** - Managing interrupt nesting and preemption
4. **Critical Sections** - Protecting shared data from concurrent access
5. **Atomic Operations** - Thread-safe data access in interrupt contexts
6. **Error Handling** - Managing interrupt-related errors gracefully
7. **Performance Monitoring** - Tracking interrupt statistics and performance

**Why** these concepts matter:

- **Real-time Responsiveness** - Immediate response to critical events
- **System Stability** - Reliable operation in interrupt-driven systems
- **Data Consistency** - Prevention of race conditions and data corruption
- **Performance** - Efficient interrupt handling and resource utilization
- **Debugging** - Facilitated identification and resolution of concurrency issues

## Next Steps

Now that you understand interrupt handling, you're ready to learn about:

- **Timer Peripherals** - Hardware timer configuration and usage
- **Communication Protocols** - UART, I2C, and SPI implementation
- **Practical Exercises** - Hands-on interrupt handling projects
- **Advanced Embedded Concepts** - More sophisticated embedded programming techniques

**Where** to go next: Continue with the next lesson on "Timer Peripherals" to learn about hardware timer configuration and usage!
