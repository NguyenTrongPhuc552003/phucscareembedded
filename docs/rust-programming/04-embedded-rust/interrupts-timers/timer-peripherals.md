---
sidebar_position: 2
---

# Timer Peripherals

Master timer peripherals in embedded Rust with comprehensive explanations using the 4W+H framework.

## What Are Timer Peripherals in Embedded Systems?

**What**: Timer peripherals are hardware components that provide precise timing, counting, and periodic event generation capabilities in embedded systems.

**Why**: Understanding timer peripherals is crucial because:

- **Precise timing** enables accurate time measurement and event scheduling
- **Periodic operations** supports regular task execution and system maintenance
- **PWM generation** facilitates motor control, LED dimming, and analog signal generation
- **Event capture** enables precise measurement of external events
- **System synchronization** coordinates multiple system components
- **Real-time control** supports time-critical applications

**When**: Use timer peripherals when you need to:

- Measure time intervals and frequencies
- Generate periodic events and interrupts
- Create PWM signals for motor control
- Implement precise delays and timeouts
- Capture external events and signals
- Synchronize system operations

**How**: Timer peripherals work by:

- **Clock sources** providing timing references from system clocks
- **Prescalers** dividing clock frequencies for different timing ranges
- **Counters** tracking elapsed time and events
- **Compare registers** generating events at specific time intervals
- **Capture registers** recording external event timestamps
- **Interrupt generation** notifying the processor of timer events

**Where**: Timer peripherals are used in embedded systems, real-time applications, motor control, sensor interfacing, communication protocols, and any application requiring precise timing.

## Understanding Timer Types and Modes

### What are Timer Types?

**What**: Timer types refer to different categories of timer peripherals, each designed for specific timing applications and use cases.

**Why**: Understanding timer types is important because:

- **Application matching** ensures the right timer for specific requirements
- **Performance optimization** enables optimal timer selection for different tasks
- **Resource management** helps allocate timer resources efficiently
- **System design** facilitates proper timer architecture planning
- **Debugging** simplifies timer-related troubleshooting

**When**: Use different timer types when you need to:

- Handle different timing requirements
- Optimize system performance
- Manage timer resources efficiently
- Design complex timing systems
- Debug timing-related issues

**How**: Here's how to implement different timer types:

```rust
#![no_std]

use core::marker::PhantomData;
use core::sync::atomic::{AtomicU32, Ordering};

// Timer types enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimerType {
    GeneralPurpose,    // General-purpose timer
    Advanced,         // Advanced timer with additional features
    Basic,           // Basic timer with minimal features
    LowPower,        // Low-power timer for power management
    HighResolution,  // High-resolution timer for precise timing
}

// Timer modes
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TimerMode {
    OneShot,         // Single-shot timer
    Periodic,        // Periodic timer
    Continuous,       // Continuous counting
    InputCapture,     // Input capture mode
    OutputCompare,    // Output compare mode
    PWM,             // PWM generation mode
}

// Timer configuration
pub struct TimerConfig {
    pub timer_type: TimerType,
    pub mode: TimerMode,
    pub frequency: u32,
    pub prescaler: u32,
    pub auto_reload: bool,
    pub interrupt_enabled: bool,
    pub dma_enabled: bool,
}

// General-purpose timer implementation
pub struct GeneralPurposeTimer {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
    compare_value: u32,
    capture_value: u32,
}

impl GeneralPurposeTimer {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                timer_type: TimerType::GeneralPurpose,
                mode: TimerMode::Periodic,
                frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: false,
                dma_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
            compare_value: 0,
            capture_value: 0,
        }
    }

    pub fn initialize(&mut self, config: TimerConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.frequency / self.config.prescaler;

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

    pub fn get_count(&self) -> Result<u32, TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific count read
        Ok(self.hardware_get_count())
    }

    pub fn set_count(&mut self, count: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if count > self.max_count {
            return Err(TimerError::InvalidCount);
        }

        // Hardware-specific count write
        self.hardware_set_count(count);
        self.count = count;

        Ok(())
    }

    pub fn set_compare_value(&mut self, value: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if value > self.max_count {
            return Err(TimerError::InvalidCompareValue);
        }

        // Hardware-specific compare value write
        self.hardware_set_compare_value(value);
        self.compare_value = value;

        Ok(())
    }

    pub fn get_capture_value(&self) -> Result<u32, TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific capture value read
        Ok(self.hardware_get_capture_value())
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_config(&self) -> &TimerConfig {
        &self.config
    }

    pub fn get_frequency(&self) -> u32 {
        self.config.frequency
    }

    pub fn get_period_us(&self) -> u32 {
        1_000_000 / self.config.frequency
    }

    pub fn get_period_ms(&self) -> u32 {
        1_000 / self.config.frequency
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_get_count(&self) -> u32 {
        // Hardware-specific count read
        self.count
    }

    fn hardware_set_count(&self, count: u32) {
        // Hardware-specific count write
    }

    fn hardware_set_compare_value(&self, value: u32) {
        // Hardware-specific compare value write
    }

    fn hardware_get_capture_value(&self) -> u32 {
        // Hardware-specific capture value read
        self.capture_value
    }
}

// Advanced timer implementation
pub struct AdvancedTimer {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
    compare_values: [u32; 4],
    capture_values: [u32; 4],
    pwm_duty_cycles: [u32; 4],
}

impl AdvancedTimer {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                timer_type: TimerType::Advanced,
                mode: TimerMode::PWM,
                frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: false,
                dma_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
            compare_values: [0; 4],
            capture_values: [0; 4],
            pwm_duty_cycles: [0; 4],
        }
    }

    pub fn initialize(&mut self, config: TimerConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.frequency / self.config.prescaler;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn set_pwm_duty_cycle(&mut self, channel: u8, duty_cycle: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if channel >= 4 {
            return Err(TimerError::InvalidChannel);
        }

        if duty_cycle > 100 {
            return Err(TimerError::InvalidDutyCycle);
        }

        // Calculate compare value for duty cycle
        let compare_value = (self.max_count * duty_cycle) / 100;
        self.compare_values[channel as usize] = compare_value;
        self.pwm_duty_cycles[channel as usize] = duty_cycle;

        // Hardware-specific PWM configuration
        self.hardware_set_pwm_duty_cycle(channel, compare_value);

        Ok(())
    }

    pub fn get_pwm_duty_cycle(&self, channel: u8) -> Result<u32, TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if channel >= 4 {
            return Err(TimerError::InvalidChannel);
        }

        Ok(self.pwm_duty_cycles[channel as usize])
    }

    pub fn set_pwm_frequency(&mut self, frequency: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        // Update frequency
        self.config.frequency = frequency;
        self.max_count = self.config.frequency / self.config.prescaler;

        // Hardware-specific frequency update
        self.hardware_set_frequency(frequency);

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

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_config(&self) -> &TimerConfig {
        &self.config
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_set_pwm_duty_cycle(&self, channel: u8, compare_value: u32) {
        // Hardware-specific PWM configuration
    }

    fn hardware_set_frequency(&self, frequency: u32) {
        // Hardware-specific frequency update
    }
}

// Basic timer implementation
pub struct BasicTimer {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
}

impl BasicTimer {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                timer_type: TimerType::Basic,
                mode: TimerMode::Periodic,
                frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: false,
                dma_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
        }
    }

    pub fn initialize(&mut self, config: TimerConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.frequency / self.config.prescaler;

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

    pub fn get_count(&self) -> Result<u32, TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific count read
        Ok(self.hardware_get_count())
    }

    pub fn set_count(&mut self, count: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if count > self.max_count {
            return Err(TimerError::InvalidCount);
        }

        // Hardware-specific count write
        self.hardware_set_count(count);
        self.count = count;

        Ok(())
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_config(&self) -> &TimerConfig {
        &self.config
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_get_count(&self) -> u32 {
        // Hardware-specific count read
        self.count
    }

    fn hardware_set_count(&self, count: u32) {
        // Hardware-specific count write
    }
}

// Error type
#[derive(Debug)]
pub enum TimerError {
    NotInitialized,
    InvalidFrequency,
    InvalidPrescaler,
    InvalidCount,
    InvalidCompareValue,
    InvalidChannel,
    InvalidDutyCycle,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    // General-purpose timer
    let mut gp_timer = GeneralPurposeTimer::new();
    let config = TimerConfig {
        timer_type: TimerType::GeneralPurpose,
        mode: TimerMode::Periodic,
        frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = gp_timer.initialize(config);
    let _ = gp_timer.start();
    let _ = gp_timer.set_compare_value(500);
    let count = gp_timer.get_count().unwrap();

    // Advanced timer for PWM
    let mut adv_timer = AdvancedTimer::new();
    let pwm_config = TimerConfig {
        timer_type: TimerType::Advanced,
        mode: TimerMode::PWM,
        frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: false,
        dma_enabled: false,
    };

    let _ = adv_timer.initialize(pwm_config);
    let _ = adv_timer.set_pwm_duty_cycle(0, 50); // 50% duty cycle
    let _ = adv_timer.set_pwm_frequency(2000);
    let _ = adv_timer.start();

    // Basic timer
    let mut basic_timer = BasicTimer::new();
    let basic_config = TimerConfig {
        timer_type: TimerType::Basic,
        mode: TimerMode::Periodic,
        frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = basic_timer.initialize(basic_config);
    let _ = basic_timer.start();
    let count = basic_timer.get_count().unwrap();
}
```

**Explanation**:

- **Timer types** provide different capabilities for various applications
- **Configuration management** handles timer setup and parameters
- **Mode support** enables different timer operating modes
- **Hardware abstraction** provides platform-independent timer interfaces
- **Error handling** manages timer-related errors gracefully

**Why**: Understanding timer types enables optimal timer selection and configuration for different embedded applications.

### Timer Mode Implementation

**What**: Timer mode implementation provides different operating modes for timer peripherals, each optimized for specific timing applications.

**Why**: Understanding timer modes is important because:

- **Application optimization** enables optimal timer configuration for specific tasks
- **Feature utilization** maximizes timer peripheral capabilities
- **Performance tuning** optimizes timer performance for different applications
- **Resource efficiency** ensures efficient timer resource usage
- **System integration** facilitates timer integration with other system components

**When**: Use different timer modes when you need to:

- Implement different timing requirements
- Optimize timer performance
- Utilize timer features effectively
- Integrate timers with other peripherals
- Debug timing-related issues

**How**: Here's how to implement different timer modes:

```rust
#![no_std]

use core::marker::PhantomData;
use core::sync::atomic::{AtomicU32, Ordering};

// Timer mode implementations
pub struct TimerModeController<T> {
    timer: T,
    mode: TimerMode,
    initialized: bool,
}

impl<T> TimerModeController<T> {
    pub fn new(timer: T) -> Self {
        Self {
            timer,
            mode: TimerMode::Periodic,
            initialized: false,
        }
    }

    pub fn set_mode(&mut self, mode: TimerMode) -> Result<(), TimerError> {
        // Validate mode for timer type
        if !self.is_mode_supported(mode) {
            return Err(TimerError::UnsupportedMode);
        }

        self.mode = mode;
        self.configure_mode();
        Ok(())
    }

    pub fn get_mode(&self) -> TimerMode {
        self.mode
    }

    fn is_mode_supported(&self, mode: TimerMode) -> bool {
        // Check if mode is supported by timer type
        match mode {
            TimerMode::OneShot => true,
            TimerMode::Periodic => true,
            TimerMode::Continuous => true,
            TimerMode::InputCapture => true,
            TimerMode::OutputCompare => true,
            TimerMode::PWM => true,
        }
    }

    fn configure_mode(&self) {
        // Hardware-specific mode configuration
        match self.mode {
            TimerMode::OneShot => self.configure_one_shot_mode(),
            TimerMode::Periodic => self.configure_periodic_mode(),
            TimerMode::Continuous => self.configure_continuous_mode(),
            TimerMode::InputCapture => self.configure_input_capture_mode(),
            TimerMode::OutputCompare => self.configure_output_compare_mode(),
            TimerMode::PWM => self.configure_pwm_mode(),
        }
    }

    fn configure_one_shot_mode(&self) {
        // Configure timer for one-shot mode
        // - Set auto-reload to false
        // - Configure interrupt on overflow
        // - Set up single-shot behavior
    }

    fn configure_periodic_mode(&self) {
        // Configure timer for periodic mode
        // - Set auto-reload to true
        // - Configure interrupt on overflow
        // - Set up periodic behavior
    }

    fn configure_continuous_mode(&self) {
        // Configure timer for continuous mode
        // - Set auto-reload to false
        // - Configure continuous counting
        // - Set up overflow handling
    }

    fn configure_input_capture_mode(&self) {
        // Configure timer for input capture mode
        // - Set up capture channels
        // - Configure capture triggers
        // - Set up capture interrupts
    }

    fn configure_output_compare_mode(&self) {
        // Configure timer for output compare mode
        // - Set up compare channels
        // - Configure compare values
        // - Set up compare interrupts
    }

    fn configure_pwm_mode(&self) {
        // Configure timer for PWM mode
        // - Set up PWM channels
        // - Configure PWM frequency
        // - Set up PWM duty cycles
    }
}

// One-shot timer implementation
pub struct OneShotTimer {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
    timeout_value: u32,
}

impl OneShotTimer {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                timer_type: TimerType::GeneralPurpose,
                mode: TimerMode::OneShot,
                frequency: 1000,
                prescaler: 1,
                auto_reload: false,
                interrupt_enabled: true,
                dma_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
            timeout_value: 0,
        }
    }

    pub fn initialize(&mut self, config: TimerConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.frequency / self.config.prescaler;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn start(&mut self, timeout_value: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if timeout_value > self.max_count {
            return Err(TimerError::InvalidTimeout);
        }

        self.timeout_value = timeout_value;

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

    pub fn is_timeout(&self) -> bool {
        if !self.running {
            return false;
        }

        let current_count = self.hardware_get_count();
        current_count >= self.timeout_value
    }

    pub fn get_remaining_time(&self) -> u32 {
        if !self.running {
            return 0;
        }

        let current_count = self.hardware_get_count();
        if current_count >= self.timeout_value {
            0
        } else {
            self.timeout_value - current_count
        }
    }

    pub fn reset(&mut self) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific reset
        self.hardware_reset();

        self.count = 0;
        self.running = false;
        Ok(())
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_get_count(&self) -> u32 {
        // Hardware-specific count read
        self.count
    }

    fn hardware_reset(&self) {
        // Hardware-specific reset
    }
}

// Periodic timer implementation
pub struct PeriodicTimer {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
    period: u32,
    overflow_count: u32,
}

impl PeriodicTimer {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                timer_type: TimerType::GeneralPurpose,
                mode: TimerMode::Periodic,
                frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: true,
                dma_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
            period: 0,
            overflow_count: 0,
        }
    }

    pub fn initialize(&mut self, config: TimerConfig) -> Result<(), TimerError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(TimerError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(TimerError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate maximum count
        self.max_count = self.config.frequency / self.config.prescaler;
        self.period = self.max_count;

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

    pub fn set_period(&mut self, period: u32) -> Result<(), TimerError> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if period == 0 || period > self.max_count {
            return Err(TimerError::InvalidPeriod);
        }

        self.period = period;

        // Hardware-specific period update
        self.hardware_set_period(period);

        Ok(())
    }

    pub fn get_period(&self) -> u32 {
        self.period
    }

    pub fn get_overflow_count(&self) -> u32 {
        self.overflow_count
    }

    pub fn handle_overflow(&mut self) {
        self.overflow_count += 1;
        // Handle periodic timer overflow
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_set_period(&self, period: u32) {
        // Hardware-specific period update
    }
}

// Error type
#[derive(Debug)]
pub enum TimerError {
    NotInitialized,
    InvalidFrequency,
    InvalidPrescaler,
    InvalidCount,
    InvalidTimeout,
    InvalidPeriod,
    UnsupportedMode,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    // One-shot timer
    let mut one_shot = OneShotTimer::new();
    let config = TimerConfig {
        timer_type: TimerType::GeneralPurpose,
        mode: TimerMode::OneShot,
        frequency: 1000,
        prescaler: 1,
        auto_reload: false,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = one_shot.initialize(config);
    let _ = one_shot.start(500); // 500ms timeout
    let is_timeout = one_shot.is_timeout();
    let remaining = one_shot.get_remaining_time();

    // Periodic timer
    let mut periodic = PeriodicTimer::new();
    let periodic_config = TimerConfig {
        timer_type: TimerType::GeneralPurpose,
        mode: TimerMode::Periodic,
        frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = periodic.initialize(periodic_config);
    let _ = periodic.set_period(1000); // 1 second period
    let _ = periodic.start();
    let overflow_count = periodic.get_overflow_count();
}
```

**Explanation**:

- **Mode controllers** provide different timer operating modes
- **One-shot timers** implement single-shot timing behavior
- **Periodic timers** implement periodic timing behavior
- **Hardware abstraction** provides platform-independent timer interfaces
- **Error handling** manages timer-related errors gracefully

**Why**: Timer mode implementation enables optimal timer configuration for different embedded applications.

## Understanding Clock Configuration

### What is Clock Configuration?

**What**: Clock configuration refers to the setup and management of clock sources, prescalers, and timing parameters for timer peripherals.

**Why**: Understanding clock configuration is important because:

- **Timing accuracy** ensures precise timing measurements and events
- **Performance optimization** enables optimal timer performance
- **Resource management** helps allocate clock resources efficiently
- **System integration** facilitates timer integration with system clocks
- **Power management** enables efficient power usage in timer operations

**When**: Use clock configuration when you need to:

- Set up timer timing parameters
- Optimize timer performance
- Manage clock resources
- Integrate timers with system clocks
- Debug timing-related issues

**How**: Here's how to implement clock configuration:

```rust
#![no_std]

use core::marker::PhantomData;
use core::sync::atomic::{AtomicU32, Ordering};

// Clock source enumeration
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ClockSource {
    Internal,        // Internal system clock
    External,        // External clock source
    HighSpeed,       // High-speed clock
    LowSpeed,        // Low-speed clock
    Crystal,         // Crystal oscillator
    RC,              // RC oscillator
}

// Clock configuration
pub struct ClockConfig {
    pub source: ClockSource,
    pub frequency: u32,
    pub prescaler: u32,
    pub auto_reload: bool,
    pub interrupt_enabled: bool,
}

// Clock manager
pub struct ClockManager {
    config: ClockConfig,
    initialized: bool,
    running: bool,
    base_frequency: u32,
    timer_frequency: u32,
}

impl ClockManager {
    pub fn new() -> Self {
        Self {
            config: ClockConfig {
                source: ClockSource::Internal,
                frequency: 1000,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: false,
            },
            initialized: false,
            running: false,
            base_frequency: 0,
            timer_frequency: 0,
        }
    }

    pub fn initialize(&mut self, config: ClockConfig) -> Result<(), ClockError> {
        // Validate configuration
        if config.frequency == 0 {
            return Err(ClockError::InvalidFrequency);
        }

        if config.prescaler == 0 {
            return Err(ClockError::InvalidPrescaler);
        }

        // Store configuration
        self.config = config;

        // Calculate frequencies
        self.base_frequency = self.get_base_frequency();
        self.timer_frequency = self.base_frequency / self.config.prescaler;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn start(&mut self) -> Result<(), ClockError> {
        if !self.initialized {
            return Err(ClockError::NotInitialized);
        }

        // Hardware-specific start
        self.hardware_start();

        self.running = true;
        Ok(())
    }

    pub fn stop(&mut self) -> Result<(), ClockError> {
        if !self.initialized {
            return Err(ClockError::NotInitialized);
        }

        // Hardware-specific stop
        self.hardware_stop();

        self.running = false;
        Ok(())
    }

    pub fn set_frequency(&mut self, frequency: u32) -> Result<(), ClockError> {
        if !self.initialized {
            return Err(ClockError::NotInitialized);
        }

        if frequency == 0 {
            return Err(ClockError::InvalidFrequency);
        }

        // Update frequency
        self.config.frequency = frequency;
        self.timer_frequency = self.base_frequency / self.config.prescaler;

        // Hardware-specific frequency update
        self.hardware_set_frequency(frequency);

        Ok(())
    }

    pub fn set_prescaler(&mut self, prescaler: u32) -> Result<(), ClockError> {
        if !self.initialized {
            return Err(ClockError::NotInitialized);
        }

        if prescaler == 0 {
            return Err(ClockError::InvalidPrescaler);
        }

        // Update prescaler
        self.config.prescaler = prescaler;
        self.timer_frequency = self.base_frequency / self.config.prescaler;

        // Hardware-specific prescaler update
        self.hardware_set_prescaler(prescaler);

        Ok(())
    }

    pub fn get_frequency(&self) -> u32 {
        self.timer_frequency
    }

    pub fn get_base_frequency(&self) -> u32 {
        self.base_frequency
    }

    pub fn get_prescaler(&self) -> u32 {
        self.config.prescaler
    }

    pub fn get_period_us(&self) -> u32 {
        1_000_000 / self.timer_frequency
    }

    pub fn get_period_ms(&self) -> u32 {
        1_000 / self.timer_frequency
    }

    pub fn is_running(&self) -> bool {
        self.running
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_config(&self) -> &ClockConfig {
        &self.config
    }

    fn get_base_frequency(&self) -> u32 {
        match self.config.source {
            ClockSource::Internal => 48_000_000,  // 48 MHz internal clock
            ClockSource::External => 8_000_000,   // 8 MHz external clock
            ClockSource::HighSpeed => 100_000_000, // 100 MHz high-speed clock
            ClockSource::LowSpeed => 32_768,      // 32.768 kHz low-speed clock
            ClockSource::Crystal => 16_000_000,    // 16 MHz crystal
            ClockSource::RC => 4_000_000,          // 4 MHz RC oscillator
        }
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific initialization
    }

    fn hardware_start(&self) {
        // Hardware-specific start
    }

    fn hardware_stop(&self) {
        // Hardware-specific stop
    }

    fn hardware_set_frequency(&self, frequency: u32) {
        // Hardware-specific frequency update
    }

    fn hardware_set_prescaler(&self, prescaler: u32) {
        // Hardware-specific prescaler update
    }
}

// Error type
#[derive(Debug)]
pub enum ClockError {
    NotInitialized,
    InvalidFrequency,
    InvalidPrescaler,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    let mut clock_manager = ClockManager::new();

    // Configure internal clock
    let config = ClockConfig {
        source: ClockSource::Internal,
        frequency: 1000,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
    };

    let _ = clock_manager.initialize(config);
    let _ = clock_manager.start();

    // Update frequency
    let _ = clock_manager.set_frequency(2000);

    // Update prescaler
    let _ = clock_manager.set_prescaler(2);

    // Get timing information
    let frequency = clock_manager.get_frequency();
    let period_us = clock_manager.get_period_us();
    let period_ms = clock_manager.get_period_ms();
}
```

**Explanation**:

- **Clock sources** provide different timing references
- **Prescalers** divide clock frequencies for different timing ranges
- **Frequency management** handles timer frequency configuration
- **Hardware abstraction** provides platform-independent clock interfaces
- **Error handling** manages clock-related errors gracefully

**Why**: Clock configuration enables precise timing control and optimal timer performance in embedded systems.

## Key Takeaways

**What** you've learned about timer peripherals in embedded Rust:

1. **Timer Types** - Different timer categories for various applications
2. **Timer Modes** - Various operating modes for different timing requirements
3. **Clock Configuration** - Setup and management of timer clock sources
4. **Hardware Abstraction** - Platform-independent timer interfaces
5. **Error Handling** - Comprehensive error management for timer operations
6. **Performance Optimization** - Efficient timer configuration and usage
7. **System Integration** - Timer integration with other system components

**Why** these concepts matter:

- **Precise Timing** - Accurate time measurement and event scheduling
- **System Performance** - Optimal timer performance for embedded applications
- **Resource Management** - Efficient allocation and usage of timer resources
- **Real-time Control** - Support for time-critical applications
- **System Integration** - Seamless integration with other system components

## Next Steps

Now that you understand timer peripherals, you're ready to learn about:

- **PWM Generation** - Pulse width modulation for motor control and LED dimming
- **Practical Exercises** - Hands-on timer projects and applications
- **Communication Protocols** - UART, I2C, and SPI implementation
- **Advanced Embedded Concepts** - More sophisticated embedded programming techniques

**Where** to go next: Continue with the next lesson on "Practical Exercises" to apply your timer knowledge!
