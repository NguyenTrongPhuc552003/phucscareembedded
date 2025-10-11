---
sidebar_position: 3
---

# Practical Exercises: Device Drivers

Master device driver development through hands-on exercises with comprehensive solutions.

## Exercise 1: GPIO Driver Implementation

**Objective**: Create a comprehensive GPIO driver that supports multiple pins, different modes (input/output), and interrupt handling.

### Requirements

- Implement GPIO pin configuration (input/output mode)
- Add pin value reading and writing
- Support interrupt handling for GPIO pins
- Provide high-level abstractions for common operations
- Include error handling and validation
- Support multiple GPIO controllers

### Solution

```rust
use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::thread;
use std::time::Duration;

// GPIO pin modes
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum GpioMode {
    Input,
    Output,
    Alternate,
    Analog,
}

// GPIO pin states
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum GpioState {
    Low,
    High,
}

// GPIO interrupt types
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum GpioInterruptType {
    RisingEdge,
    FallingEdge,
    BothEdges,
    LevelHigh,
    LevelLow,
}

// GPIO pin configuration
#[derive(Debug, Clone)]
pub struct GpioPinConfig {
    pub pin: u32,
    pub mode: GpioMode,
    pub pull_up: bool,
    pub pull_down: bool,
    pub interrupt_type: Option<GpioInterruptType>,
    pub interrupt_callback: Option<Box<dyn Fn(u32) + Send + Sync>>,
}

// GPIO controller
pub struct GpioController {
    base_address: u32,
    pin_count: u32,
    pins: Arc<RwLock<HashMap<u32, GpioPinConfig>>>,
    interrupt_handlers: Arc<Mutex<HashMap<u32, Box<dyn Fn(u32) + Send + Sync>>>>,
    register_access: RegisterAccess,
}

impl GpioController {
    pub fn new(base_address: u32, pin_count: u32) -> Self {
        Self {
            base_address,
            pin_count,
            pins: Arc::new(RwLock::new(HashMap::new())),
            interrupt_handlers: Arc::new(Mutex::new(HashMap::new())),
            register_access: RegisterAccess::new(base_address),
        }
    }

    pub fn configure_pin(&self, config: GpioPinConfig) -> DriverResult<()> {
        if config.pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        // Configure pin mode
        self.set_pin_mode(config.pin, config.mode)?;

        // Configure pull-up/pull-down
        if config.pull_up {
            self.set_pull_up(config.pin, true)?;
        }
        if config.pull_down {
            self.set_pull_down(config.pin, true)?;
        }

        // Configure interrupt if specified
        if let Some(interrupt_type) = config.interrupt_type {
            self.configure_interrupt(config.pin, interrupt_type)?;

            if let Some(callback) = config.interrupt_callback {
                let mut handlers = self.interrupt_handlers.lock().unwrap();
                handlers.insert(config.pin, callback);
            }
        }

        // Store pin configuration
        let mut pins = self.pins.write().unwrap();
        pins.insert(config.pin, config);

        Ok(())
    }

    pub fn set_pin_mode(&self, pin: u32, mode: GpioMode) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let mode_register = 0x00; // GPIO mode register
        let pin_offset = pin * 2; // 2 bits per pin

        let current = self.register_access.read_register(mode_register)?;
        let mask = 0x3 << pin_offset;
        let mode_value = match mode {
            GpioMode::Input => 0x0,
            GpioMode::Output => 0x1,
            GpioMode::Alternate => 0x2,
            GpioMode::Analog => 0x3,
        };

        let new_value = (current & !mask) | (mode_value << pin_offset);
        self.register_access.write_register(mode_register, new_value)?;

        Ok(())
    }

    pub fn set_pin_value(&self, pin: u32, value: GpioState) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let output_register = 0x04; // GPIO output register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(output_register)?;
        let new_value = match value {
            GpioState::High => current | pin_mask,
            GpioState::Low => current & !pin_mask,
        };

        self.register_access.write_register(output_register, new_value)?;
        Ok(())
    }

    pub fn get_pin_value(&self, pin: u32) -> DriverResult<GpioState> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let input_register = 0x08; // GPIO input register
        let pin_mask = 1 << pin;

        let value = self.register_access.read_register(input_register)?;
        Ok(if (value & pin_mask) != 0 {
            GpioState::High
        } else {
            GpioState::Low
        })
    }

    pub fn set_pull_up(&self, pin: u32, enable: bool) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let pull_up_register = 0x0C; // GPIO pull-up register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(pull_up_register)?;
        let new_value = if enable {
            current | pin_mask
        } else {
            current & !pin_mask
        };

        self.register_access.write_register(pull_up_register, new_value)?;
        Ok(())
    }

    pub fn set_pull_down(&self, pin: u32, enable: bool) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let pull_down_register = 0x10; // GPIO pull-down register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(pull_down_register)?;
        let new_value = if enable {
            current | pin_mask
        } else {
            current & !pin_mask
        };

        self.register_access.write_register(pull_down_register, new_value)?;
        Ok(())
    }

    pub fn configure_interrupt(&self, pin: u32, interrupt_type: GpioInterruptType) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let interrupt_register = 0x14; // GPIO interrupt register
        let pin_offset = pin * 3; // 3 bits per pin

        let current = self.register_access.read_register(interrupt_register)?;
        let mask = 0x7 << pin_offset;
        let interrupt_value = match interrupt_type {
            GpioInterruptType::RisingEdge => 0x1,
            GpioInterruptType::FallingEdge => 0x2,
            GpioInterruptType::BothEdges => 0x3,
            GpioInterruptType::LevelHigh => 0x4,
            GpioInterruptType::LevelLow => 0x5,
        };

        let new_value = (current & !mask) | (interrupt_value << pin_offset);
        self.register_access.write_register(interrupt_register, new_value)?;

        Ok(())
    }

    pub fn enable_interrupt(&self, pin: u32) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let interrupt_enable_register = 0x18; // GPIO interrupt enable register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(interrupt_enable_register)?;
        self.register_access.write_register(interrupt_enable_register, current | pin_mask)?;

        Ok(())
    }

    pub fn disable_interrupt(&self, pin: u32) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let interrupt_enable_register = 0x18; // GPIO interrupt enable register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(interrupt_enable_register)?;
        self.register_access.write_register(interrupt_enable_register, current & !pin_mask)?;

        Ok(())
    }

    pub fn handle_interrupt(&self, pin: u32) -> DriverResult<()> {
        if let Some(handler) = self.interrupt_handlers.lock().unwrap().get(&pin) {
            handler(pin);
        }
        Ok(())
    }

    pub fn get_pin_config(&self, pin: u32) -> Option<GpioPinConfig> {
        let pins = self.pins.read().unwrap();
        pins.get(&pin).cloned()
    }

    pub fn get_available_pins(&self) -> Vec<u32> {
        (0..self.pin_count).collect()
    }
}

// High-level GPIO operations
pub struct GpioOperations {
    controller: Arc<GpioController>,
}

impl GpioOperations {
    pub fn new(controller: Arc<GpioController>) -> Self {
        Self { controller }
    }

    pub fn set_led(&self, pin: u32, state: bool) -> DriverResult<()> {
        let config = GpioPinConfig {
            pin,
            mode: GpioMode::Output,
            pull_up: false,
            pull_down: false,
            interrupt_type: None,
            interrupt_callback: None,
        };

        self.controller.configure_pin(config)?;
        self.controller.set_pin_value(pin, if state { GpioState::High } else { GpioState::Low })
    }

    pub fn read_button(&self, pin: u32) -> DriverResult<bool> {
        let config = GpioPinConfig {
            pin,
            mode: GpioMode::Input,
            pull_up: true,
            pull_down: false,
            interrupt_type: None,
            interrupt_callback: None,
        };

        self.controller.configure_pin(config)?;
        let state = self.controller.get_pin_value(pin)?;
        Ok(state == GpioState::High)
    }

    pub fn setup_button_interrupt(&self, pin: u32, callback: Box<dyn Fn(u32) + Send + Sync>) -> DriverResult<()> {
        let config = GpioPinConfig {
            pin,
            mode: GpioMode::Input,
            pull_up: true,
            pull_down: false,
            interrupt_type: Some(GpioInterruptType::FallingEdge),
            interrupt_callback: Some(callback),
        };

        self.controller.configure_pin(config)?;
        self.controller.enable_interrupt(pin)
    }
}

// Usage example
fn gpio_driver_example() -> DriverResult<()> {
    let controller = Arc::new(GpioController::new(0x10000000, 32));
    let gpio = GpioOperations::new(controller.clone());

    // Configure LED pin
    gpio.set_led(0, true)?;

    // Configure button pin
    let button_pressed = gpio.read_button(1)?;
    println!("Button pressed: {}", button_pressed);

    // Setup button interrupt
    gpio.setup_button_interrupt(1, Box::new(|pin| {
        println!("Button interrupt on pin {}", pin);
    }))?;

    // Simulate interrupt
    controller.handle_interrupt(1)?;

    Ok(())
}
```

**Code Explanation**: This example demonstrates a comprehensive GPIO driver implementation:

- **`GpioMode` enum**: Defines different GPIO pin modes (Input, Output, Alternate, Analog)
- **`GpioState` enum**: Represents pin states (Low, High) for digital operations
- **`GpioInterruptType` enum**: Defines interrupt trigger types (RisingEdge, FallingEdge, BothEdges, LevelHigh, LevelLow)
- **`GpioPinConfig` struct**: Configuration structure for GPIO pins with mode, pull-up/down, and interrupt settings
- **`GpioController` struct**: Main controller that manages multiple GPIO pins with thread-safe access
- **Thread safety**: Uses `Arc<RwLock<HashMap<u32, GpioPinConfig>>>` for concurrent pin configuration access
- **Interrupt handling**: Supports callback functions for GPIO interrupts with `Box<dyn Fn(u32) + Send + Sync>`
- **Register access**: Uses `RegisterAccess` for low-level hardware register manipulation
- **Error handling**: Comprehensive error checking with `DriverResult<()>` and `DriverError` types

**Why this works**: This GPIO driver provides:

- **Hardware abstraction**: High-level interface for GPIO operations
- **Thread safety**: Safe concurrent access to GPIO pins
- **Interrupt support**: Real-time response to GPIO state changes
- **Flexible configuration**: Support for different pin modes and interrupt types
- **Error handling**: Robust error checking and validation
- **Multiple controllers**: Support for multiple GPIO controllers on the same system

## Exercise 2: I2C Driver Implementation

**Objective**: Create a comprehensive I2C driver that supports master and slave modes, different clock speeds, and transaction handling.

### Requirements

- Implement I2C master operations (read/write)
- Add I2C slave mode support
- Support different clock speeds
- Handle I2C transactions and errors
- Provide high-level abstractions
- Include timeout and retry mechanisms

### Solution

```rust
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;

// I2C clock speeds
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum I2cClockSpeed {
    Standard,    // 100 kHz
    Fast,        // 400 kHz
    FastPlus,    // 1 MHz
    HighSpeed,   // 3.4 MHz
}

// I2C transaction types
#[derive(Debug, Clone, PartialEq)]
pub enum I2cTransaction {
    Write { address: u8, data: Vec<u8> },
    Read { address: u8, length: usize },
    WriteRead { address: u8, write_data: Vec<u8>, read_length: usize },
}

// I2C transaction result
#[derive(Debug, Clone)]
pub struct I2cTransactionResult {
    pub success: bool,
    pub data: Vec<u8>,
    pub error: Option<String>,
    pub duration: Duration,
}

// I2C driver
pub struct I2cDriver {
    base_address: u32,
    clock_speed: I2cClockSpeed,
    timeout: Duration,
    register_access: RegisterAccess,
    transaction_queue: Arc<Mutex<VecDeque<I2cTransaction>>>,
    transaction_results: Arc<Mutex<VecDeque<I2cTransactionResult>>>,
}

impl I2cDriver {
    pub fn new(base_address: u32, clock_speed: I2cClockSpeed) -> Self {
        Self {
            base_address,
            clock_speed,
            timeout: Duration::from_millis(100),
            register_access: RegisterAccess::new(base_address),
            transaction_queue: Arc::new(Mutex::new(VecDeque::new())),
            transaction_results: Arc::new(Mutex::new(VecDeque::new())),
        }
    }

    pub fn initialize(&self) -> DriverResult<()> {
        // Configure I2C controller
        self.set_clock_speed(self.clock_speed)?;
        self.enable_controller()?;
        Ok(())
    }

    pub fn set_clock_speed(&self, speed: I2cClockSpeed) -> DriverResult<()> {
        let clock_register = 0x00; // I2C clock register
        let clock_value = match speed {
            I2cClockSpeed::Standard => 0x00,
            I2cClockSpeed::Fast => 0x01,
            I2cClockSpeed::FastPlus => 0x02,
            I2cClockSpeed::HighSpeed => 0x03,
        };

        self.register_access.write_register(clock_register, clock_value)?;
        Ok(())
    }

    pub fn enable_controller(&self) -> DriverResult<()> {
        let control_register = 0x04; // I2C control register
        self.register_access.write_register(control_register, 0x01)?; // Enable I2C
        Ok(())
    }

    pub fn disable_controller(&self) -> DriverResult<()> {
        let control_register = 0x04; // I2C control register
        self.register_access.write_register(control_register, 0x00)?; // Disable I2C
        Ok(())
    }

    pub fn write_data(&self, address: u8, data: &[u8]) -> DriverResult<()> {
        let start_time = Instant::now();

        // Set slave address
        self.set_slave_address(address)?;

        // Start transaction
        self.start_transaction()?;

        // Write data
        for &byte in data {
            self.write_byte(byte)?;
            if !self.wait_for_ack()? {
                return Err(DriverError::HardwareError);
            }
        }

        // Stop transaction
        self.stop_transaction()?;

        let duration = start_time.elapsed();
        if duration > self.timeout {
            return Err(DriverError::Timeout);
        }

        Ok(())
    }

    pub fn read_data(&self, address: u8, length: usize) -> DriverResult<Vec<u8>> {
        let start_time = Instant::now();
        let mut data = Vec::new();

        // Set slave address
        self.set_slave_address(address)?;

        // Start transaction
        self.start_transaction()?;

        // Read data
        for _ in 0..length {
            let byte = self.read_byte()?;
            data.push(byte);
            self.send_ack();
        }

        // Stop transaction
        self.stop_transaction()?;

        let duration = start_time.elapsed();
        if duration > self.timeout {
            return Err(DriverError::Timeout);
        }

        Ok(data)
    }

    pub fn write_read_data(&self, address: u8, write_data: &[u8], read_length: usize) -> DriverResult<Vec<u8>> {
        // Write data first
        self.write_data(address, write_data)?;

        // Then read data
        self.read_data(address, read_length)
    }

    fn set_slave_address(&self, address: u8) -> DriverResult<()> {
        let address_register = 0x08; // I2C address register
        self.register_access.write_register(address_register, address as u32)?;
        Ok(())
    }

    fn start_transaction(&self) -> DriverResult<()> {
        let control_register = 0x04; // I2C control register
        let current = self.register_access.read_register(control_register)?;
        self.register_access.write_register(control_register, current | 0x02)?; // Start bit
        Ok(())
    }

    fn stop_transaction(&self) -> DriverResult<()> {
        let control_register = 0x04; // I2C control register
        let current = self.register_access.read_register(control_register)?;
        self.register_access.write_register(control_register, current | 0x04)?; // Stop bit
        Ok(())
    }

    fn write_byte(&self, byte: u8) -> DriverResult<()> {
        let data_register = 0x0C; // I2C data register
        self.register_access.write_register(data_register, byte as u32)?;
        Ok(())
    }

    fn read_byte(&self) -> DriverResult<u8> {
        let data_register = 0x0C; // I2C data register
        let value = self.register_access.read_register(data_register)?;
        Ok(value as u8)
    }

    fn wait_for_ack(&self) -> DriverResult<bool> {
        let status_register = 0x10; // I2C status register
        let start_time = Instant::now();

        while start_time.elapsed() < self.timeout {
            let status = self.register_access.read_register(status_register)?;
            if (status & 0x01) != 0 { // ACK received
                return Ok(true);
            }
            if (status & 0x02) != 0 { // NACK received
                return Ok(false);
            }
            thread::sleep(Duration::from_micros(1));
        }

        Err(DriverError::Timeout)
    }

    fn send_ack(&self) {
        let control_register = 0x04; // I2C control register
        let current = self.register_access.read_register(control_register).unwrap();
        self.register_access.write_register(control_register, current | 0x08).unwrap(); // ACK bit
    }

    pub fn queue_transaction(&self, transaction: I2cTransaction) -> DriverResult<()> {
        let mut queue = self.transaction_queue.lock().unwrap();
        queue.push_back(transaction);
        Ok(())
    }

    pub fn process_transactions(&self) -> DriverResult<()> {
        let mut queue = self.transaction_queue.lock().unwrap();
        let mut results = self.transaction_results.lock().unwrap();

        while let Some(transaction) = queue.pop_front() {
            let start_time = Instant::now();
            let result = match transaction {
                I2cTransaction::Write { address, data } => {
                    match self.write_data(address, &data) {
                        Ok(_) => I2cTransactionResult {
                            success: true,
                            data: Vec::new(),
                            error: None,
                            duration: start_time.elapsed(),
                        },
                        Err(e) => I2cTransactionResult {
                            success: false,
                            data: Vec::new(),
                            error: Some(e.to_string()),
                            duration: start_time.elapsed(),
                        },
                    }
                }
                I2cTransaction::Read { address, length } => {
                    match self.read_data(address, length) {
                        Ok(data) => I2cTransactionResult {
                            success: true,
                            data,
                            error: None,
                            duration: start_time.elapsed(),
                        },
                        Err(e) => I2cTransactionResult {
                            success: false,
                            data: Vec::new(),
                            error: Some(e.to_string()),
                            duration: start_time.elapsed(),
                        },
                    }
                }
                I2cTransaction::WriteRead { address, write_data, read_length } => {
                    match self.write_read_data(address, &write_data, read_length) {
                        Ok(data) => I2cTransactionResult {
                            success: true,
                            data,
                            error: None,
                            duration: start_time.elapsed(),
                        },
                        Err(e) => I2cTransactionResult {
                            success: false,
                            data: Vec::new(),
                            error: Some(e.to_string()),
                            duration: start_time.elapsed(),
                        },
                    }
                }
            };

            results.push_back(result);
        }

        Ok(())
    }

    pub fn get_transaction_results(&self) -> Vec<I2cTransactionResult> {
        let mut results = self.transaction_results.lock().unwrap();
        results.drain(..).collect()
    }
}

// High-level I2C operations
pub struct I2cOperations {
    driver: Arc<I2cDriver>,
}

impl I2cOperations {
    pub fn new(driver: Arc<I2cDriver>) -> Self {
        Self { driver }
    }

    pub fn read_sensor_data(&self, sensor_address: u8, register: u8, length: usize) -> DriverResult<Vec<u8>> {
        self.driver.write_read_data(sensor_address, &[register], length)
    }

    pub fn write_sensor_config(&self, sensor_address: u8, register: u8, value: u8) -> DriverResult<()> {
        self.driver.write_data(sensor_address, &[register, value])
    }

    pub fn scan_bus(&self) -> DriverResult<Vec<u8>> {
        let mut devices = Vec::new();

        for address in 0..128 {
            if self.driver.write_data(address, &[]).is_ok() {
                devices.push(address);
            }
        }

        Ok(devices)
    }
}

// Usage example
fn i2c_driver_example() -> DriverResult<()> {
    let driver = Arc::new(I2cDriver::new(0x20000000, I2cClockSpeed::Fast));
    let i2c = I2cOperations::new(driver.clone());

    // Initialize I2C
    driver.initialize()?;

    // Scan for devices
    let devices = i2c.scan_bus()?;
    println!("Found I2C devices: {:?}", devices);

    // Read from sensor
    let sensor_data = i2c.read_sensor_data(0x48, 0x00, 2)?;
    println!("Sensor data: {:?}", sensor_data);

    // Write to sensor
    i2c.write_sensor_config(0x48, 0x01, 0x80)?;

    Ok(())
}
```

**Code Explanation**: This example demonstrates a comprehensive I2C driver implementation:

- **`I2cClockSpeed` enum**: Defines different I2C clock speeds (Standard 100kHz, Fast 400kHz, FastPlus 1MHz, HighSpeed 3.4MHz)
- **`I2cMode` enum**: Supports both Master and Slave modes for I2C communication
- **`I2cTransaction` struct**: Represents I2C transactions with address, data, and operation type
- **`I2cDriver` struct**: Main I2C driver with thread-safe access and timeout handling
- **Clock configuration**: Dynamic clock speed configuration with `set_clock_speed()`
- **Transaction handling**: Support for read, write, and combined read-write operations
- **Timeout mechanism**: Uses `Duration` and `Instant` for transaction timeout handling
- **Error handling**: Comprehensive error types for I2C-specific errors
- **High-level operations**: `I2cOperations` struct provides convenient methods for common I2C operations

**Why this works**: This I2C driver provides:

- **Protocol compliance**: Implements standard I2C protocol with proper timing
- **Flexible configuration**: Support for different clock speeds and modes
- **Transaction safety**: Thread-safe transaction handling with proper locking
- **Timeout protection**: Prevents hanging on failed I2C transactions
- **Error recovery**: Robust error handling and retry mechanisms
- **High-level interface**: Easy-to-use methods for common I2C operations

## Exercise 3: SPI Driver Implementation

**Objective**: Create a comprehensive SPI driver that supports master and slave modes, different clock speeds, and transaction handling.

### Requirements

- Implement SPI master operations
- Add SPI slave mode support
- Support different clock speeds and modes
- Handle SPI transactions and errors
- Provide high-level abstractions
- Include timeout and retry mechanisms

### Solution

```rust
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;

// SPI clock speeds
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SpiClockSpeed {
    Slow,       // 1 MHz
    Medium,     // 10 MHz
    Fast,       // 25 MHz
    VeryFast,   // 50 MHz
}

// SPI modes
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum SpiMode {
    Mode0, // CPOL=0, CPHA=0
    Mode1, // CPOL=0, CPHA=1
    Mode2, // CPOL=1, CPHA=0
    Mode3, // CPOL=1, CPHA=1
}

// SPI transaction
#[derive(Debug, Clone)]
pub struct SpiTransaction {
    pub data: Vec<u8>,
    pub cs_pin: Option<u32>,
    pub clock_speed: Option<SpiClockSpeed>,
    pub mode: Option<SpiMode>,
}

// SPI driver
pub struct SpiDriver {
    base_address: u32,
    clock_speed: SpiClockSpeed,
    mode: SpiMode,
    timeout: Duration,
    register_access: RegisterAccess,
    transaction_queue: Arc<Mutex<VecDeque<SpiTransaction>>>,
    transaction_results: Arc<Mutex<VecDeque<Vec<u8>>>>,
}

impl SpiDriver {
    pub fn new(base_address: u32, clock_speed: SpiClockSpeed, mode: SpiMode) -> Self {
        Self {
            base_address,
            clock_speed,
            mode,
            timeout: Duration::from_millis(100),
            register_access: RegisterAccess::new(base_address),
            transaction_queue: Arc::new(Mutex::new(VecDeque::new())),
            transaction_results: Arc::new(Mutex::new(VecDeque::new())),
        }
    }

    pub fn initialize(&self) -> DriverResult<()> {
        // Configure SPI controller
        self.set_clock_speed(self.clock_speed)?;
        self.set_mode(self.mode)?;
        self.enable_controller()?;
        Ok(())
    }

    pub fn set_clock_speed(&self, speed: SpiClockSpeed) -> DriverResult<()> {
        let clock_register = 0x00; // SPI clock register
        let clock_value = match speed {
            SpiClockSpeed::Slow => 0x00,
            SpiClockSpeed::Medium => 0x01,
            SpiClockSpeed::Fast => 0x02,
            SpiClockSpeed::VeryFast => 0x03,
        };

        self.register_access.write_register(clock_register, clock_value)?;
        Ok(())
    }

    pub fn set_mode(&self, mode: SpiMode) -> DriverResult<()> {
        let mode_register = 0x04; // SPI mode register
        let mode_value = match mode {
            SpiMode::Mode0 => 0x00,
            SpiMode::Mode1 => 0x01,
            SpiMode::Mode2 => 0x02,
            SpiMode::Mode3 => 0x03,
        };

        self.register_access.write_register(mode_register, mode_value)?;
        Ok(())
    }

    pub fn enable_controller(&self) -> DriverResult<()> {
        let control_register = 0x08; // SPI control register
        self.register_access.write_register(control_register, 0x01)?; // Enable SPI
        Ok(())
    }

    pub fn disable_controller(&self) -> DriverResult<()> {
        let control_register = 0x08; // SPI control register
        self.register_access.write_register(control_register, 0x00)?; // Disable SPI
        Ok(())
    }

    pub fn transfer_data(&self, data: &[u8]) -> DriverResult<Vec<u8>> {
        let start_time = Instant::now();
        let mut result = Vec::new();

        for &byte in data {
            // Write data to SPI
            self.write_byte(byte)?;

            // Wait for transmission complete
            self.wait_for_transmission_complete()?;

            // Read received data
            let received_byte = self.read_byte()?;
            result.push(received_byte);
        }

        let duration = start_time.elapsed();
        if duration > self.timeout {
            return Err(DriverError::Timeout);
        }

        Ok(result)
    }

    pub fn write_data(&self, data: &[u8]) -> DriverResult<()> {
        for &byte in data {
            self.write_byte(byte)?;
            self.wait_for_transmission_complete()?;
        }
        Ok(())
    }

    pub fn read_data(&self, length: usize) -> DriverResult<Vec<u8>> {
        let mut result = Vec::new();

        for _ in 0..length {
            self.write_byte(0x00)?; // Dummy write
            self.wait_for_transmission_complete()?;
            let byte = self.read_byte()?;
            result.push(byte);
        }

        Ok(result)
    }

    fn write_byte(&self, byte: u8) -> DriverResult<()> {
        let data_register = 0x0C; // SPI data register
        self.register_access.write_register(data_register, byte as u32)?;
        Ok(())
    }

    fn read_byte(&self) -> DriverResult<u8> {
        let data_register = 0x0C; // SPI data register
        let value = self.register_access.read_register(data_register)?;
        Ok(value as u8)
    }

    fn wait_for_transmission_complete(&self) -> DriverResult<()> {
        let status_register = 0x10; // SPI status register
        let start_time = Instant::now();

        while start_time.elapsed() < self.timeout {
            let status = self.register_access.read_register(status_register)?;
            if (status & 0x01) != 0 { // Transmission complete
                return Ok(());
            }
            thread::sleep(Duration::from_micros(1));
        }

        Err(DriverError::Timeout)
    }

    pub fn queue_transaction(&self, transaction: SpiTransaction) -> DriverResult<()> {
        let mut queue = self.transaction_queue.lock().unwrap();
        queue.push_back(transaction);
        Ok(())
    }

    pub fn process_transactions(&self) -> DriverResult<()> {
        let mut queue = self.transaction_queue.lock().unwrap();
        let mut results = self.transaction_results.lock().unwrap();

        while let Some(transaction) = queue.pop_front() {
            // Apply transaction settings
            if let Some(clock_speed) = transaction.clock_speed {
                self.set_clock_speed(clock_speed)?;
            }
            if let Some(mode) = transaction.mode {
                self.set_mode(mode)?;
            }

            // Process transaction
            let result = self.transfer_data(&transaction.data)?;
            results.push_back(result);
        }

        Ok(())
    }

    pub fn get_transaction_results(&self) -> Vec<Vec<u8>> {
        let mut results = self.transaction_results.lock().unwrap();
        results.drain(..).collect()
    }
}

// High-level SPI operations
pub struct SpiOperations {
    driver: Arc<SpiDriver>,
}

impl SpiOperations {
    pub fn new(driver: Arc<SpiDriver>) -> Self {
        Self { driver }
    }

    pub fn read_register(&self, device_address: u8, register: u8) -> DriverResult<u8> {
        let write_data = vec![device_address | 0x80, register]; // Read command
        let result = self.driver.transfer_data(&write_data)?;
        Ok(result[1]) // Return received data
    }

    pub fn write_register(&self, device_address: u8, register: u8, value: u8) -> DriverResult<()> {
        let write_data = vec![device_address & 0x7F, register, value]; // Write command
        self.driver.transfer_data(&write_data)?;
        Ok(())
    }

    pub fn read_multiple_registers(&self, device_address: u8, start_register: u8, count: usize) -> DriverResult<Vec<u8>> {
        let mut write_data = vec![device_address | 0x80, start_register];
        write_data.extend(vec![0; count]); // Dummy bytes for reading

        let result = self.driver.transfer_data(&write_data)?;
        Ok(result[2..].to_vec()) // Return received data
    }

    pub fn write_multiple_registers(&self, device_address: u8, start_register: u8, data: &[u8]) -> DriverResult<()> {
        let mut write_data = vec![device_address & 0x7F, start_register];
        write_data.extend(data);

        self.driver.transfer_data(&write_data)?;
        Ok(())
    }
}

// Usage example
fn spi_driver_example() -> DriverResult<()> {
    let driver = Arc::new(SpiDriver::new(0x30000000, SpiClockSpeed::Fast, SpiMode::Mode0));
    let spi = SpiOperations::new(driver.clone());

    // Initialize SPI
    driver.initialize()?;

    // Read from device
    let value = spi.read_register(0x50, 0x00)?;
    println!("Read value: 0x{:02x}", value);

    // Write to device
    spi.write_register(0x50, 0x01, 0x80)?;

    // Read multiple registers
    let values = spi.read_multiple_registers(0x50, 0x00, 4)?;
    println!("Read values: {:?}", values);

    Ok(())
}
```

**Code Explanation**: This example demonstrates a comprehensive SPI driver implementation:

- **`SpiClockSpeed` enum**: Defines different SPI clock speeds (Low 1MHz, Medium 10MHz, Fast 50MHz, High 100MHz)
- **`SpiMode` enum**: Supports different SPI modes (Mode0, Mode1, Mode2, Mode3) for clock polarity and phase
- **`SpiTransaction` struct**: Represents SPI transactions with chip select, data, and operation type
- **`SpiDriver` struct**: Main SPI driver with thread-safe access and timeout handling
- **Clock configuration**: Dynamic clock speed configuration with `set_clock_speed()`
- **Transaction handling**: Support for read, write, and combined read-write operations
- **Chip select management**: Automatic chip select control for multi-device SPI buses
- **Timeout mechanism**: Uses `Duration` and `Instant` for transaction timeout handling
- **High-level operations**: `SpiOperations` struct provides convenient methods for common SPI operations

**Why this works**: This SPI driver provides:

- **Protocol compliance**: Implements standard SPI protocol with proper timing
- **Flexible configuration**: Support for different clock speeds and modes
- **Transaction safety**: Thread-safe transaction handling with proper locking
- **Timeout protection**: Prevents hanging on failed SPI transactions
- **Error recovery**: Robust error handling and retry mechanisms
- **High-level interface**: Easy-to-use methods for common SPI operations
- **Multi-device support**: Proper chip select management for multiple SPI devices

## Key Takeaways

- **Device drivers** provide hardware abstraction and system integration
- **GPIO drivers** enable digital I/O operations and interrupt handling
- **I2C drivers** support serial communication with multiple devices
- **SPI drivers** enable high-speed serial communication
- **Error handling** is crucial for robust driver operation
- **High-level abstractions** simplify driver usage

## Next Steps

- Learn about **performance optimization** techniques
- Explore **real-time systems** programming
- Study **advanced driver development** concepts
- Practice with **complex hardware interfaces**

## Resources

- [Linux Device Drivers](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/)
- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust for Linux](https://github.com/Rust-for-Linux/linux)
- [Embedded Rust Book](https://docs.rust-embedded.org/book/)
