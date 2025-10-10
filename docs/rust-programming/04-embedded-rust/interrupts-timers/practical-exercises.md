---
sidebar_position: 3
---

# Practical Exercises: Interrupts and Timers

Apply your knowledge of interrupts and timers in embedded Rust with hands-on exercises using the 4W+H framework.

## What Are These Practical Exercises?

**What**: These exercises provide hands-on experience with interrupt handling and timer peripherals in embedded Rust, covering real-world applications and scenarios.

**Why**: Understanding these exercises is important because:

- **Practical application** reinforces theoretical knowledge through hands-on experience
- **Real-world skills** develops industry-relevant embedded programming abilities
- **Problem solving** enhances debugging and troubleshooting capabilities
- **System integration** teaches how to combine interrupts and timers effectively
- **Performance optimization** enables efficient embedded system design
- **Professional development** prepares for embedded systems careers

**When**: Use these exercises when you need to:

- Practice interrupt handling and timer programming
- Apply theoretical knowledge to real projects
- Develop embedded systems skills
- Prepare for embedded programming interviews
- Build portfolio projects
- Debug timing and interrupt issues

**How**: These exercises work by:

- **Progressive complexity** building from simple to advanced applications
- **Real-world scenarios** using practical embedded system examples
- **Code implementation** providing complete working examples
- **Testing and validation** ensuring correct functionality
- **Performance analysis** optimizing system performance
- **Documentation** creating clear, maintainable code

**Where**: These exercises apply to embedded systems, IoT devices, real-time applications, motor control, sensor interfacing, and any application requiring precise timing and event handling.

## Exercise 1: Interrupt-Driven GPIO Control

### What is Interrupt-Driven GPIO Control?

**What**: Interrupt-driven GPIO control uses hardware interrupts to respond to GPIO pin state changes, enabling efficient event-driven programming.

**Why**: Understanding interrupt-driven GPIO is important because:

- **Efficiency** eliminates polling and reduces CPU usage
- **Responsiveness** provides immediate response to GPIO events
- **Power management** enables low-power operation
- **Real-time behavior** supports time-critical applications
- **System scalability** allows handling multiple GPIO events

**When**: Use interrupt-driven GPIO when you need to:

- Respond to button presses or sensor triggers
- Implement low-power applications
- Handle multiple GPIO events efficiently
- Create responsive user interfaces
- Build real-time systems

**How**: Here's how to implement interrupt-driven GPIO control:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// GPIO interrupt configuration
pub struct GpioInterruptConfig {
    pub pin: u8,
    pub trigger: GpioTrigger,
    pub pull_mode: GpioPullMode,
    pub interrupt_enabled: bool,
}

// GPIO trigger types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GpioTrigger {
    Rising,     // Trigger on rising edge
    Falling,    // Trigger on falling edge
    Both,       // Trigger on both edges
    High,       // Trigger when high
    Low,        // Trigger when low
}

// GPIO pull modes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GpioPullMode {
    None,       // No pull-up/pull-down
    PullUp,     // Pull-up resistor
    PullDown,   // Pull-down resistor
}

// GPIO interrupt manager
pub struct GpioInterruptManager {
    configs: [Option<GpioInterruptConfig>; 16],
    interrupt_counters: [AtomicU32; 16],
    initialized: bool,
}

impl GpioInterruptManager {
    pub fn new() -> Self {
        Self {
            configs: [None; 16],
            interrupt_counters: [AtomicU32::new(0); 16],
            initialized: false,
        }
    }

    pub fn initialize(&mut self) -> Result<(), GpioError> {
        // Hardware-specific GPIO initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn configure_interrupt(&mut self, config: GpioInterruptConfig) -> Result<(), GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if config.pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        // Store configuration
        self.configs[config.pin as usize] = Some(config);

        // Hardware-specific interrupt configuration
        self.hardware_configure_interrupt(config.pin, config.trigger, config.pull_mode);

        // Enable interrupt if requested
        if config.interrupt_enabled {
            self.hardware_enable_interrupt(config.pin);
        }

        Ok(())
    }

    pub fn enable_interrupt(&mut self, pin: u8) -> Result<(), GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        if let Some(config) = &mut self.configs[pin as usize] {
            config.interrupt_enabled = true;
            self.hardware_enable_interrupt(pin);
        } else {
            return Err(GpioError::PinNotConfigured);
        }

        Ok(())
    }

    pub fn disable_interrupt(&mut self, pin: u8) -> Result<(), GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        if let Some(config) = &mut self.configs[pin as usize] {
            config.interrupt_enabled = false;
            self.hardware_disable_interrupt(pin);
        } else {
            return Err(GpioError::PinNotConfigured);
        }

        Ok(())
    }

    pub fn handle_interrupt(&mut self, pin: u8) -> Result<(), GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        // Increment interrupt counter
        self.interrupt_counters[pin as usize].fetch_add(1, Ordering::Relaxed);

        // Handle GPIO interrupt
        self.process_gpio_interrupt(pin);

        // Clear interrupt flag
        self.hardware_clear_interrupt(pin);

        Ok(())
    }

    pub fn get_interrupt_count(&self, pin: u8) -> Result<u32, GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        Ok(self.interrupt_counters[pin as usize].load(Ordering::Relaxed))
    }

    pub fn get_pin_state(&self, pin: u8) -> Result<bool, GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        // Hardware-specific pin state read
        Ok(self.hardware_get_pin_state(pin))
    }

    pub fn set_pin_state(&mut self, pin: u8, state: bool) -> Result<(), GpioError> {
        if !self.initialized {
            return Err(GpioError::NotInitialized);
        }

        if pin >= 16 {
            return Err(GpioError::InvalidPin);
        }

        // Hardware-specific pin state write
        self.hardware_set_pin_state(pin, state);

        Ok(())
    }

    fn process_gpio_interrupt(&self, pin: u8) {
        // Handle GPIO interrupt based on pin
        match pin {
            0 => self.handle_button_press(),
            1 => self.handle_sensor_trigger(),
            2 => self.handle_switch_change(),
            _ => {
                // Handle other GPIO interrupts
            }
        }
    }

    fn handle_button_press(&self) {
        // Handle button press interrupt
        // - Toggle LED
        // - Update system state
        // - Process button event
    }

    fn handle_sensor_trigger(&self) {
        // Handle sensor trigger interrupt
        // - Read sensor data
        // - Update sensor state
        // - Process sensor event
    }

    fn handle_switch_change(&self) {
        // Handle switch change interrupt
        // - Read switch state
        // - Update system configuration
        // - Process switch event
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific GPIO initialization
    }

    fn hardware_configure_interrupt(&self, pin: u8, trigger: GpioTrigger, pull_mode: GpioPullMode) {
        // Hardware-specific interrupt configuration
    }

    fn hardware_enable_interrupt(&self, pin: u8) {
        // Hardware-specific interrupt enable
    }

    fn hardware_disable_interrupt(&self, pin: u8) {
        // Hardware-specific interrupt disable
    }

    fn hardware_clear_interrupt(&self, pin: u8) {
        // Hardware-specific interrupt clear
    }

    fn hardware_get_pin_state(&self, pin: u8) -> bool {
        // Hardware-specific pin state read
        false
    }

    fn hardware_set_pin_state(&self, pin: u8, state: bool) {
        // Hardware-specific pin state write
    }
}

// Error type
#[derive(Debug)]
pub enum GpioError {
    NotInitialized,
    InvalidPin,
    PinNotConfigured,
    HardwareError,
    ConfigurationError,
}

// Global GPIO interrupt manager
static mut GPIO_MANAGER: GpioInterruptManager = GpioInterruptManager {
    configs: [None; 16],
    interrupt_counters: [AtomicU32::new(0); 16],
    initialized: false,
};

// GPIO interrupt handlers
#[no_mangle]
pub extern "C" fn gpio_pin_0_interrupt_handler() {
    unsafe {
        let _ = GPIO_MANAGER.handle_interrupt(0);
    }
}

#[no_mangle]
pub extern "C" fn gpio_pin_1_interrupt_handler() {
    unsafe {
        let _ = GPIO_MANAGER.handle_interrupt(1);
    }
}

#[no_mangle]
pub extern "C" fn gpio_pin_2_interrupt_handler() {
    unsafe {
        let _ = GPIO_MANAGER.handle_interrupt(2);
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
    // Initialize GPIO interrupt manager
    unsafe {
        let _ = GPIO_MANAGER.initialize();

        // Configure button interrupt (pin 0)
        let button_config = GpioInterruptConfig {
            pin: 0,
            trigger: GpioTrigger::Falling,
            pull_mode: GpioPullMode::PullUp,
            interrupt_enabled: true,
        };
        let _ = GPIO_MANAGER.configure_interrupt(button_config);

        // Configure sensor interrupt (pin 1)
        let sensor_config = GpioInterruptConfig {
            pin: 1,
            trigger: GpioTrigger::Rising,
            pull_mode: GpioPullMode::None,
            interrupt_enabled: true,
        };
        let _ = GPIO_MANAGER.configure_interrupt(sensor_config);

        // Configure switch interrupt (pin 2)
        let switch_config = GpioInterruptConfig {
            pin: 2,
            trigger: GpioTrigger::Both,
            pull_mode: GpioPullMode::PullDown,
            interrupt_enabled: true,
        };
        let _ = GPIO_MANAGER.configure_interrupt(switch_config);
    }

    // Main application loop
    loop {
        // Check interrupt counts
        unsafe {
            let button_count = GPIO_MANAGER.get_interrupt_count(0).unwrap();
            let sensor_count = GPIO_MANAGER.get_interrupt_count(1).unwrap();
            let switch_count = GPIO_MANAGER.get_interrupt_count(2).unwrap();
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

- **Interrupt configuration** sets up GPIO pins for interrupt-driven operation
- **Event handling** processes GPIO interrupts efficiently
- **State management** tracks GPIO pin states and interrupt counts
- **Hardware abstraction** provides platform-independent GPIO interfaces
- **Error handling** manages GPIO-related errors gracefully

**Why**: Interrupt-driven GPIO control enables efficient, responsive embedded systems with minimal CPU overhead.

## Exercise 2: Timer-Based Delay Functions

### What are Timer-Based Delay Functions?

**What**: Timer-based delay functions use hardware timers to implement precise delays, replacing busy-waiting loops with efficient timer-based timing.

**Why**: Understanding timer-based delays is important because:

- **Precision** provides accurate timing measurements
- **Efficiency** eliminates CPU busy-waiting
- **Power management** enables low-power operation
- **System responsiveness** allows other tasks to run during delays
- **Real-time behavior** supports time-critical applications

**When**: Use timer-based delays when you need to:

- Implement precise delays and timeouts
- Create non-blocking delay functions
- Build real-time systems
- Optimize power consumption
- Handle multiple timing requirements

**How**: Here's how to implement timer-based delay functions:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Timer delay configuration
pub struct TimerDelayConfig {
    pub timer_frequency: u32,
    pub prescaler: u32,
    pub auto_reload: bool,
    pub interrupt_enabled: bool,
}

// Timer delay manager
pub struct TimerDelayManager {
    config: TimerDelayConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
    delay_count: u32,
    delay_active: bool,
}

impl TimerDelayManager {
    pub fn new() -> Self {
        Self {
            config: TimerDelayConfig {
                timer_frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: true,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
            delay_count: 0,
            delay_active: false,
        }
    }

    pub fn initialize(&mut self, config: TimerDelayConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.timer_frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.timer_frequency / self.config.prescaler;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn start(&mut self) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific start
        self.hardware_start();

        self.running = true;
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific stop
        self.hardware_stop();

        self.running = false;
        Ok(())
    }

    pub fn delay_us(&mut self, microseconds: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if !self.running {
            return Err(TimerError::NotRunning);
        }

        // Calculate delay count
        let delay_count = (microseconds * self.config.timer_frequency) / 1_000_000;

        if delay_count > self.max_count {
            return Err(TimerError::InvalidDelay);
        }

        // Set delay count
        self.delay_count = delay_count;
        self.delay_active = true;

        // Hardware-specific delay start
        self.hardware_start_delay(delay_count);

        Ok(())
    }

    pub fn delay_ms(&mut self, milliseconds: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if !self.running {
            return Err(TimerError::NotRunning);
        }

        // Calculate delay count
        let delay_count = (milliseconds * self.config.timer_frequency) / 1_000;

        if delay_count > self.max_count {
            return Err(TimerError::InvalidDelay);
        }

        // Set delay count
        self.delay_count = delay_count;
        self.delay_active = true;

        // Hardware-specific delay start
        self.hardware_start_delay(delay_count);

        Ok(())
    }

    pub fn delay_s(&mut self, seconds: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if !self.running {
            return Err(TimerError::NotRunning);
        }

        // Calculate delay count
        let delay_count = seconds * self.config.timer_frequency;

        if delay_count > self.max_count {
            return Err(TimerError::InvalidDelay);
        }

        // Set delay count
        self.delay_count = delay_count;
        self.delay_active = true;

        // Hardware-specific delay start
        self.hardware_start_delay(delay_count);

        Ok(())
    }

    pub fn is_delay_active(&self) -> bool {
        self.delay_active
    }

    pub fn get_remaining_delay(&self) -> u32 {
        if !self.delay_active {
            return 0;
        }

        let current_count = self.hardware_get_count();
        if current_count >= self.delay_count {
            0
        } else {
            self.delay_count - current_count
        }
    }

    pub fn handle_timer_interrupt(&mut self) {
        if self.delay_active {
            // Check if delay is complete
            if self.hardware_get_count() >= self.delay_count {
                self.delay_active = false;
                self.hardware_clear_delay();
            }
        }
    }

    pub fn get_count(&self) -> u32 {
        self.hardware_get_count()
    }

    pub fn get_frequency(&self) -> u32 {
        self.config.timer_frequency
    }

    pub fn get_period_us(&self) -> u32 {
        1_000_000 / self.config.timer_frequency
    }

    pub fn get_period_ms(&self) -> u32 {
        1_000 / self.config.timer_frequency
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific timer initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific timer start
    }

    fn hardware_stop(&self) {
        // Hardware-specific timer stop
    }

    fn hardware_start_delay(&self, delay_count: u32) {
        // Hardware-specific delay start
    }

    fn hardware_clear_delay(&self) {
        // Hardware-specific delay clear
    }

    fn hardware_get_count(&self) -> u32 {
        // Hardware-specific count read
        self.count
    }
}

// Error type
#[derive(Debug)]
pub enum TimerError {
    NotInitialized,
    NotRunning,
    InvalidFrequency,
    InvalidPrescaler,
    InvalidDelay,
    HardwareError,
    ConfigurationError,
}

// Global timer delay manager
static mut DELAY_MANAGER: TimerDelayManager = TimerDelayManager {
    config: TimerDelayConfig {
        timer_frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
    },
    initialized: false,
    running: false,
    count: 0,
    max_count: 0,
    delay_count: 0,
    delay_active: false,
};

// Timer interrupt handler
#[no_mangle]
pub extern "C" fn timer_interrupt_handler() {
    unsafe {
        DELAY_MANAGER.handle_timer_interrupt();
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
    // Initialize timer delay manager
    unsafe {
        let config = TimerDelayConfig {
            timer_frequency: 1000,
            prescaler: 1,
            auto_reload: true,
            interrupt_enabled: true,
        };

        let _ = DELAY_MANAGER.initialize(config);
        let _ = DELAY_MANAGER.start();
    }

    // Main application loop
    loop {
        // Test different delay functions
        unsafe {
            // Microsecond delay
            let _ = DELAY_MANAGER.delay_us(1000);
            while DELAY_MANAGER.is_delay_active() {
                // Wait for delay to complete
            }

            // Millisecond delay
            let _ = DELAY_MANAGER.delay_ms(100);
            while DELAY_MANAGER.is_delay_active() {
                // Wait for delay to complete
            }

            // Second delay
            let _ = DELAY_MANAGER.delay_s(1);
            while DELAY_MANAGER.is_delay_active() {
                // Wait for delay to complete
            }
        }

        // Process application logic
        process_application_logic();
    }
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **Timer configuration** sets up hardware timers for delay functions
- **Delay implementation** provides precise timing without busy-waiting
- **Interrupt handling** manages timer events efficiently
- **Hardware abstraction** provides platform-independent timer interfaces
- **Error handling** manages timer-related errors gracefully

**Why**: Timer-based delay functions enable precise, efficient timing in embedded systems without blocking the CPU.

## Exercise 3: PWM Generator Implementation

### What is PWM Generator Implementation?

**What**: PWM (Pulse Width Modulation) generator implementation creates variable-duty-cycle square wave signals for motor control, LED dimming, and analog signal generation.

**Why**: Understanding PWM generation is important because:

- **Motor control** enables precise motor speed and direction control
- **LED dimming** provides smooth brightness control
- **Analog signals** generates analog-like signals from digital outputs
- **Power control** enables efficient power management
- **System integration** facilitates integration with other system components

**When**: Use PWM generation when you need to:

- Control motor speed and direction
- Dim LEDs and other lighting
- Generate analog signals
- Control power delivery
- Create variable output signals

**How**: Here's how to implement PWM generation:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// PWM configuration
pub struct PwmConfig {
    pub frequency: u32,
    pub duty_cycle: u32,  // 0-100%
    pub channel: u8,
    pub polarity: PwmPolarity,
    pub auto_reload: bool,
    pub interrupt_enabled: bool,
}

// PWM polarity
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PwmPolarity {
    Normal,     // Normal polarity
    Inverted,   // Inverted polarity
}

// PWM generator
pub struct PwmGenerator {
    config: PwmConfig,
    initialized: bool,
    running: bool,
    period: u32,
    compare_value: u32,
    duty_cycle: u32,
    frequency: u32,
}

impl PwmGenerator {
    pub fn new() -> Self {
        Self {
            config: PwmConfig {
                frequency: 1000,
                duty_cycle: 50,
                channel: 0,
                polarity: PwmPolarity::Normal,
                auto_reload: true,
                interrupt_enabled: false,
            },
            initialized: false,
            running: false,
            period: 0,
            compare_value: 0,
            duty_cycle: 50,
            frequency: 1000,
        }
    }

    pub fn initialize(&mut self, config: PwmConfig) -> Result<(), PwmError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(PwmError::InvalidFrequency);
        }

        if config.duty_cycle > 100 {
            return Err(PwmError::InvalidDutyCycle);
        }

        if config.channel >= 4 {
            return Err(PwmError::InvalidChannel);
        }

        // Store configuration
        self.config = config;

        // Calculate period and compare value
        self.frequency = config.frequency;
        self.period = 1_000_000 / config.frequency; // Period in microseconds
        self.duty_cycle = config.duty_cycle;
        self.compare_value = (self.period * config.duty_cycle) / 100;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn start(&mut self) -> Result<(), PwmError> {
        if !self.initialized {
            return Err(PwmError::NotInitialized);
        }

        // Hardware-specific start
        self.hardware_start();

        self.running = true;
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), PwmError> {
        if !self.initialized {
            return Err(PwmError::NotInitialized);
        }

        // Hardware-specific stop
        self.hardware_stop();

        self.running = false;
        Ok(())
    }

    pub fn set_duty_cycle(&mut self, duty_cycle: u32) -> Result<(), PwmError> {
        if !self.initialized {
            return Err(PwmError::NotInitialized);
        }

        if duty_cycle > 100 {
            return Err(PwmError::InvalidDutyCycle);
        }

        // Update duty cycle
        self.duty_cycle = duty_cycle;
        self.compare_value = (self.period * duty_cycle) / 100;

        // Hardware-specific duty cycle update
        self.hardware_set_duty_cycle(duty_cycle);

        Ok(())
    }

    pub fn set_frequency(&mut self, frequency: u32) -> Result<(), PwmError> {
        if !self.initialized {
            return Err(PwmError::NotInitialized);
        }

        if frequency == 0 {
            return Err(PwmError::InvalidFrequency);
        }

        // Update frequency
        self.frequency = frequency;
        self.period = 1_000_000 / frequency;
        self.compare_value = (self.period * self.duty_cycle) / 100;

        // Hardware-specific frequency update
        self.hardware_set_frequency(frequency);

        Ok(())
    }

    pub fn set_polarity(&mut self, polarity: PwmPolarity) -> Result<(), PwmError> {
        if !self.initialized {
            return Err(PwmError::NotInitialized);
        }

        // Update polarity
        self.config.polarity = polarity;

        // Hardware-specific polarity update
        self.hardware_set_polarity(polarity);

        Ok(())
    }

    pub fn get_duty_cycle(&self) -> u32 {
        self.duty_cycle
    }

    pub fn get_frequency(&self) -> u32 {
        self.frequency
    }

    pub fn get_period(&self) -> u32 {
        self.period
    }

    pub fn get_compare_value(&self) -> u32 {
        self.compare_value
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_config(&self) -> &PwmConfig {
        &self.config
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific PWM initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific PWM start
    }

    fn hardware_stop(&self) {
        // Hardware-specific PWM stop
    }

    fn hardware_set_duty_cycle(&self, duty_cycle: u32) {
        // Hardware-specific duty cycle update
    }

    fn hardware_set_frequency(&self, frequency: u32) {
        // Hardware-specific frequency update
    }

    fn hardware_set_polarity(&self, polarity: PwmPolarity) {
        // Hardware-specific polarity update
    }
}

// Error type
#[derive(Debug)]
pub enum PwmError {
    NotInitialized,
    InvalidFrequency,
    InvalidDutyCycle,
    InvalidChannel,
    HardwareError,
    ConfigurationError,
}

// Global PWM generator
static mut PWM_GENERATOR: PwmGenerator = PwmGenerator {
    config: PwmConfig {
        frequency: 1000,
        duty_cycle: 50,
        channel: 0,
        polarity: PwmPolarity::Normal,
        auto_reload: true,
        interrupt_enabled: false,
    },
    initialized: false,
    running: false,
    period: 0,
    compare_value: 0,
    duty_cycle: 50,
    frequency: 1000,
};

// PWM interrupt handler
#[no_mangle]
pub extern "C" fn pwm_interrupt_handler() {
    // Handle PWM interrupt
    // - Update PWM parameters
    // - Process PWM events
    // - Clear interrupt flags
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
    // Initialize PWM generator
    unsafe {
        let config = PwmConfig {
            frequency: 1000,
            duty_cycle: 50,
            channel: 0,
            polarity: PwmPolarity::Normal,
            auto_reload: true,
            interrupt_enabled: false,
        };

        let _ = PWM_GENERATOR.initialize(config);
        let _ = PWM_GENERATOR.start();
    }

    // Main application loop
    loop {
        // Test different PWM configurations
        unsafe {
            // Set different duty cycles
            let _ = PWM_GENERATOR.set_duty_cycle(25);  // 25% duty cycle
            delay_ms(1000);

            let _ = PWM_GENERATOR.set_duty_cycle(50);  // 50% duty cycle
            delay_ms(1000);

            let _ = PWM_GENERATOR.set_duty_cycle(75);  // 75% duty cycle
            delay_ms(1000);

            // Set different frequencies
            let _ = PWM_GENERATOR.set_frequency(2000); // 2 kHz
            delay_ms(1000);

            let _ = PWM_GENERATOR.set_frequency(5000); // 5 kHz
            delay_ms(1000);

            // Set inverted polarity
            let _ = PWM_GENERATOR.set_polarity(PwmPolarity::Inverted);
            delay_ms(1000);

            // Set normal polarity
            let _ = PWM_GENERATOR.set_polarity(PwmPolarity::Normal);
            delay_ms(1000);
        }

        // Process application logic
        process_application_logic();
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

- **PWM configuration** sets up hardware timers for PWM generation
- **Duty cycle control** enables precise control of output signal characteristics
- **Frequency management** provides flexible PWM frequency control
- **Polarity control** enables normal and inverted PWM output
- **Hardware abstraction** provides platform-independent PWM interfaces

**Why**: PWM generation enables precise control of motors, LEDs, and other devices in embedded systems.

## Key Takeaways

**What** you've learned about practical exercises for interrupts and timers:

1. **Interrupt-Driven GPIO** - Efficient event-driven GPIO control
2. **Timer-Based Delays** - Precise timing without busy-waiting
3. **PWM Generation** - Variable-duty-cycle signal generation
4. **Hardware Abstraction** - Platform-independent embedded interfaces
5. **Error Handling** - Comprehensive error management for embedded systems
6. **Performance Optimization** - Efficient embedded system design
7. **Real-world Applications** - Practical embedded system implementations

**Why** these exercises matter:

- **Practical Skills** - Hands-on experience with embedded programming
- **Real-world Application** - Industry-relevant embedded system development
- **Problem Solving** - Enhanced debugging and troubleshooting capabilities
- **System Integration** - Combining interrupts and timers effectively
- **Professional Development** - Preparation for embedded systems careers

## Next Steps

Now that you've completed the practical exercises for interrupts and timers, you're ready to learn about:

- **Communication Protocols** - UART, I2C, and SPI implementation
- **Advanced Embedded Concepts** - More sophisticated embedded programming techniques
- **System Integration** - Combining multiple embedded system components
- **Performance Optimization** - Advanced embedded system optimization

**Where** to go next: Continue with the next lesson on "Communication Protocols" to learn about UART, I2C, and SPI implementation!
