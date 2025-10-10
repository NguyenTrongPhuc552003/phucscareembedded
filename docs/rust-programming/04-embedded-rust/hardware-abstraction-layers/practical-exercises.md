---
sidebar_position: 3
---

# Practical Exercises: Hardware Abstraction Layers

Master Hardware Abstraction Layer development through hands-on exercises with comprehensive explanations using the 4W+H framework.

## What Are Practical HAL Exercises?

**What**: Practical HAL exercises are hands-on coding activities that reinforce theoretical knowledge through real-world hardware abstraction layer development scenarios.

**Why**: Understanding practical HAL exercises is crucial because:

- **Skill development** builds practical HAL development skills
- **Pattern application** reinforces HAL design patterns through practice
- **Hardware integration** teaches real hardware interface development
- **Problem solving** develops ability to solve complex hardware abstraction challenges
- **Portfolio building** provides concrete examples of HAL development skills
- **Industry readiness** prepares for professional embedded development

**When**: Use practical HAL exercises when you need to:

- Apply HAL design patterns to real problems
- Build practical hardware abstraction skills
- Create reusable hardware interfaces
- Test understanding of HAL concepts
- Develop problem-solving abilities
- Prepare for embedded systems interviews

**How**: Practical HAL exercises work by:

- **Progressive complexity** starting with simple abstractions and building to complex systems
- **Real hardware scenarios** using actual embedded hardware interfaces
- **Pattern implementation** applying HAL design patterns in practice
- **Code organization** demonstrating proper HAL structure and organization
- **Testing and validation** ensuring HAL implementations work correctly
- **Documentation** creating clear HAL interface specifications

**Where**: These exercises are used in embedded systems education, professional development, and portfolio building for embedded Rust developers.

## Exercise 1: GPIO HAL Implementation

### What is the GPIO HAL Exercise?

**What**: Create a complete GPIO (General Purpose Input/Output) Hardware Abstraction Layer that provides a safe, type-safe interface for controlling GPIO pins.

**Why**: This exercise is important because:

- **Foundation building** establishes basic HAL development skills
- **Type safety** demonstrates compile-time safety for hardware operations
- **Pattern application** applies HAL design patterns in practice
- **Hardware abstraction** teaches how to abstract hardware complexity
- **API design** develops skills in creating user-friendly hardware interfaces

**When**: Use this exercise when you need to:

- Learn basic HAL development
- Understand GPIO hardware abstraction
- Practice HAL design patterns
- Develop type-safe hardware interfaces
- Create reusable hardware abstractions

**How**: Here's how to implement the GPIO HAL:

```rust
#![no_std]

use core::marker::PhantomData;
use core::ptr::{read_volatile, write_volatile};

// GPIO HAL trait definitions
pub trait DigitalPin {
    type Error;

    fn set_high(&mut self) -> Result<(), Self::Error>;
    fn set_low(&mut self) -> Result<(), Self::Error>;
    fn is_high(&self) -> Result<bool, Self::Error>;
    fn is_low(&self) -> Result<bool, Self::Error>;
}

pub trait AnalogPin {
    type Error;

    fn read_analog(&self) -> Result<u16, Self::Error>;
}

// GPIO modes using typestate pattern
pub struct Input;
pub struct Output;
pub struct Analog;
pub struct Interrupt;

// GPIO pin abstraction
pub struct GpioPin<MODE> {
    port: u8,
    pin: u8,
    _mode: PhantomData<MODE>,
}

impl GpioPin<Input> {
    pub fn new_input(port: u8, pin: u8) -> Self {
        Self {
            port,
            pin,
            _mode: PhantomData,
        }
    }

    pub fn configure_pull_up(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn configure_pull_down(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn configure_no_pull(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    // State transition: Input -> Output
    pub fn into_output(self) -> GpioPin<Output> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }

    // State transition: Input -> Analog
    pub fn into_analog(self) -> GpioPin<Analog> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }

    // State transition: Input -> Interrupt
    pub fn into_interrupt(self) -> GpioPin<Interrupt> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }
}

impl GpioPin<Output> {
    pub fn new_output(port: u8, pin: u8) -> Self {
        Self {
            port,
            pin,
            _mode: PhantomData,
        }
    }

    pub fn configure_push_pull(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn configure_open_drain(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn set_speed(&mut self, speed: GpioSpeed) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    // State transition: Output -> Input
    pub fn into_input(self) -> GpioPin<Input> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }

    // State transition: Output -> Analog
    pub fn into_analog(self) -> GpioPin<Analog> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }
}

impl GpioPin<Analog> {
    pub fn new_analog(port: u8, pin: u8) -> Self {
        Self {
            port,
            pin,
            _mode: PhantomData,
        }
    }

    // State transition: Analog -> Input
    pub fn into_input(self) -> GpioPin<Input> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }

    // State transition: Analog -> Output
    pub fn into_output(self) -> GpioPin<Output> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }
}

impl GpioPin<Interrupt> {
    pub fn new_interrupt(port: u8, pin: u8) -> Self {
        Self {
            port,
            pin,
            _mode: PhantomData,
        }
    }

    pub fn enable_interrupt(&mut self, trigger: InterruptTrigger) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn disable_interrupt(&mut self) -> Result<(), GpioError> {
        // Hardware-specific implementation
        Ok(())
    }

    pub fn is_interrupt_pending(&self) -> Result<bool, GpioError> {
        // Hardware-specific implementation
        Ok(false)
    }

    // State transition: Interrupt -> Input
    pub fn into_input(self) -> GpioPin<Input> {
        GpioPin {
            port: self.port,
            pin: self.pin,
            _mode: PhantomData,
        }
    }
}

// Implement DigitalPin trait for Input mode
impl DigitalPin for GpioPin<Input> {
    type Error = GpioError;

    fn set_high(&mut self) -> Result<(), Self::Error> {
        Err(GpioError::InvalidOperation)
    }

    fn set_low(&mut self) -> Result<(), Self::Error> {
        Err(GpioError::InvalidOperation)
    }

    fn is_high(&self) -> Result<bool, Self::Error> {
        // Hardware-specific implementation
        Ok(false)
    }

    fn is_low(&self) -> Result<bool, Self::Error> {
        // Hardware-specific implementation
        Ok(true)
    }
}

// Implement DigitalPin trait for Output mode
impl DigitalPin for GpioPin<Output> {
    type Error = GpioError;

    fn set_high(&mut self) -> Result<(), Self::Error> {
        // Hardware-specific implementation
        Ok(())
    }

    fn set_low(&mut self) -> Result<(), Self::Error> {
        // Hardware-specific implementation
        Ok(())
    }

    fn is_high(&self) -> Result<bool, Self::Error> {
        // Hardware-specific implementation
        Ok(false)
    }

    fn is_low(&self) -> Result<bool, Self::Error> {
        // Hardware-specific implementation
        Ok(true)
    }
}

// Implement AnalogPin trait for Analog mode
impl AnalogPin for GpioPin<Analog> {
    type Error = GpioError;

    fn read_analog(&self) -> Result<u16, Self::Error> {
        // Hardware-specific implementation
        Ok(0)
    }
}

// GPIO speed enumeration
#[derive(Debug, Clone, Copy)]
pub enum GpioSpeed {
    Low,
    Medium,
    High,
    VeryHigh,
}

// Interrupt trigger enumeration
#[derive(Debug, Clone, Copy)]
pub enum InterruptTrigger {
    RisingEdge,
    FallingEdge,
    BothEdges,
    HighLevel,
    LowLevel,
}

// Error type
#[derive(Debug)]
pub enum GpioError {
    InvalidPin,
    InvalidPort,
    HardwareError,
    ConfigurationError,
    InvalidOperation,
}

// Example usage
fn main() {
    // Create GPIO pin in input mode
    let input_pin = GpioPin::<Input>::new_input(0, 5);
    let _ = input_pin.is_high();

    // Transition to output mode
    let mut output_pin = input_pin.into_output();
    let _ = output_pin.set_high();
    let _ = output_pin.set_low();

    // Transition to analog mode
    let analog_pin = output_pin.into_analog();
    let _ = analog_pin.read_analog();

    // Transition to interrupt mode
    let mut interrupt_pin = analog_pin.into_input().into_interrupt();
    let _ = interrupt_pin.enable_interrupt(InterruptTrigger::RisingEdge);

    // Transition back to input mode
    let _input_pin = interrupt_pin.into_input();
}
```

**Explanation**:

- **Typestate pattern** ensures compile-time safety for GPIO modes
- **Trait implementations** provide common interfaces for different pin modes
- **State transitions** enable safe mode changes
- **Error handling** manages hardware errors gracefully
- **Type safety** prevents invalid operations at compile time

**Why**: This exercise teaches fundamental HAL development skills and type-safe hardware abstraction.

### Advanced GPIO HAL with Builder Pattern

**What**: Extend the basic GPIO HAL to include a builder pattern for complex GPIO configuration.

**Why**: This advanced exercise is important because:

- **Complex configuration** simplifies GPIO setup with many parameters
- **Validation** ensures configuration parameters are valid
- **Readability** makes GPIO configuration code more readable
- **Flexibility** allows optional parameters and different configuration paths
- **Error handling** provides clear error messages for invalid configurations

**When**: Use this exercise when you need to:

- Learn builder pattern implementation
- Practice complex hardware configuration
- Understand parameter validation
- Create readable hardware setup code
- Handle optional configuration parameters

**How**: Here's how to implement the advanced GPIO HAL:

```rust
#![no_std]

use core::marker::PhantomData;

// GPIO configuration builder
pub struct GpioPinBuilder<MODE> {
    port: Option<u8>,
    pin: Option<u8>,
    mode: Option<GpioMode>,
    output_type: Option<GpioOutputType>,
    speed: Option<GpioSpeed>,
    pull: Option<GpioPull>,
    alternate_function: Option<u8>,
    _mode: PhantomData<MODE>,
}

// GPIO configuration types
#[derive(Debug, Clone, Copy)]
pub enum GpioMode {
    Input,
    Output,
    Alternate,
    Analog,
}

#[derive(Debug, Clone, Copy)]
pub enum GpioOutputType {
    PushPull,
    OpenDrain,
}

#[derive(Debug, Clone, Copy)]
pub enum GpioSpeed {
    Low,
    Medium,
    High,
    VeryHigh,
}

#[derive(Debug, Clone, Copy)]
pub enum GpioPull {
    None,
    PullUp,
    PullDown,
}

impl<MODE> GpioPinBuilder<MODE> {
    pub fn new() -> Self {
        Self {
            port: None,
            pin: None,
            mode: None,
            output_type: None,
            speed: None,
            pull: None,
            alternate_function: None,
            _mode: PhantomData,
        }
    }

    pub fn port(mut self, port: u8) -> Self {
        self.port = Some(port);
        self
    }

    pub fn pin(mut self, pin: u8) -> Self {
        self.pin = Some(pin);
        self
    }

    pub fn mode(mut self, mode: GpioMode) -> Self {
        self.mode = Some(mode);
        self
    }

    pub fn output_type(mut self, output_type: GpioOutputType) -> Self {
        self.output_type = Some(output_type);
        self
    }

    pub fn speed(mut self, speed: GpioSpeed) -> Self {
        self.speed = Some(speed);
        self
    }

    pub fn pull(mut self, pull: GpioPull) -> Self {
        self.pull = Some(pull);
        self
    }

    pub fn alternate_function(mut self, alternate_function: u8) -> Self {
        self.alternate_function = Some(alternate_function);
        self
    }

    pub fn build(self) -> Result<GpioPin<MODE>, GpioConfigError> {
        // Validate configuration
        let port = self.port.ok_or(GpioConfigError::MissingPort)?;
        let pin = self.pin.ok_or(GpioConfigError::MissingPin)?;
        let mode = self.mode.ok_or(GpioConfigError::MissingMode)?;

        // Validate parameters
        if port > 15 {
            return Err(GpioConfigError::InvalidPort);
        }

        if pin > 15 {
            return Err(GpioConfigError::InvalidPin);
        }

        if mode == GpioMode::Alternate && self.alternate_function.is_none() {
            return Err(GpioConfigError::MissingAlternateFunction);
        }

        // Create GPIO pin
        Ok(GpioPin {
            port,
            pin,
            mode,
            output_type: self.output_type.unwrap_or(GpioOutputType::PushPull),
            speed: self.speed.unwrap_or(GpioSpeed::Medium),
            pull: self.pull.unwrap_or(GpioPull::None),
            alternate_function: self.alternate_function,
            _mode: PhantomData,
        })
    }
}

// Enhanced GPIO pin with configuration
pub struct GpioPin<MODE> {
    port: u8,
    pin: u8,
    mode: GpioMode,
    output_type: GpioOutputType,
    speed: GpioSpeed,
    pull: GpioPull,
    alternate_function: Option<u8>,
    _mode: PhantomData<MODE>,
}

impl<MODE> GpioPin<MODE> {
    pub fn get_port(&self) -> u8 {
        self.port
    }

    pub fn get_pin(&self) -> u8 {
        self.pin
    }

    pub fn get_mode(&self) -> GpioMode {
        self.mode
    }

    pub fn get_output_type(&self) -> GpioOutputType {
        self.output_type
    }

    pub fn get_speed(&self) -> GpioSpeed {
        self.speed
    }

    pub fn get_pull(&self) -> GpioPull {
        self.pull
    }

    pub fn get_alternate_function(&self) -> Option<u8> {
        self.alternate_function
    }
}

// Error types
#[derive(Debug)]
pub enum GpioConfigError {
    MissingPort,
    MissingPin,
    MissingMode,
    MissingAlternateFunction,
    InvalidPort,
    InvalidPin,
    InvalidAlternateFunction,
}

// Example usage
fn main() {
    // Configure GPIO pin using builder pattern
    let gpio_pin = GpioPinBuilder::new()
        .port(0)
        .pin(5)
        .mode(GpioMode::Output)
        .output_type(GpioOutputType::PushPull)
        .speed(GpioSpeed::High)
        .pull(GpioPull::None)
        .build()
        .unwrap();

    // Configure alternate function pin
    let alternate_pin = GpioPinBuilder::new()
        .port(0)
        .pin(6)
        .mode(GpioMode::Alternate)
        .output_type(GpioOutputType::PushPull)
        .speed(GpioSpeed::VeryHigh)
        .alternate_function(7)
        .build()
        .unwrap();

    // Configure analog pin
    let analog_pin = GpioPinBuilder::new()
        .port(0)
        .pin(7)
        .mode(GpioMode::Analog)
        .pull(GpioPull::None)
        .build()
        .unwrap();
}
```

**Explanation**:

- **Builder pattern** provides fluent interface for GPIO configuration
- **Parameter validation** ensures configuration parameters are valid
- **Optional parameters** allow flexible GPIO configuration
- **Error handling** provides clear error messages for invalid configurations
- **Type safety** ensures compile-time safety for GPIO operations

**Why**: This exercise teaches advanced HAL development skills and complex hardware configuration patterns.

## Exercise 2: UART HAL Implementation

### What is the UART HAL Exercise?

**What**: Create a complete UART (Universal Asynchronous Receiver-Transmitter) Hardware Abstraction Layer that provides a safe, type-safe interface for serial communication.

**Why**: This exercise is important because:

- **Communication protocols** teaches serial communication fundamentals
- **Buffer management** introduces data buffering concepts
- **Error handling** demonstrates communication error management
- **HAL patterns** applies HAL design patterns to communication peripherals
- **API design** develops skills in creating user-friendly communication interfaces

**When**: Use this exercise when you need to:

- Learn communication HAL development
- Understand serial communication abstraction
- Practice buffer management
- Develop communication protocols
- Create reusable communication interfaces

**How**: Here's how to implement the UART HAL:

```rust
#![no_std]

use core::marker::PhantomData;

// UART configuration
pub struct UartConfig {
    pub baud_rate: u32,
    pub data_bits: u8,
    pub stop_bits: u8,
    pub parity: Parity,
    pub flow_control: FlowControl,
}

#[derive(Debug, Clone, Copy)]
pub enum Parity {
    None,
    Even,
    Odd,
}

#[derive(Debug, Clone, Copy)]
pub enum FlowControl {
    None,
    RtsCts,
    XonXoff,
}

// UART HAL trait
pub trait UartHal {
    type Error;

    fn initialize(&mut self, config: UartConfig) -> Result<(), Self::Error>;
    fn write(&mut self, data: &[u8]) -> Result<(), Self::Error>;
    fn read(&mut self, buffer: &mut [u8]) -> Result<usize, Self::Error>;
    fn is_ready_to_write(&self) -> Result<bool, Self::Error>;
    fn is_ready_to_read(&self) -> Result<bool, Self::Error>;
    fn flush(&mut self) -> Result<(), Self::Error>;
}

// UART driver implementation
pub struct UartDriver {
    config: UartConfig,
    initialized: bool,
    tx_buffer: [u8; 64],
    rx_buffer: [u8; 64],
    tx_head: usize,
    tx_tail: usize,
    rx_head: usize,
    rx_tail: usize,
}

impl UartDriver {
    pub fn new() -> Self {
        Self {
            config: UartConfig {
                baud_rate: 9600,
                data_bits: 8,
                stop_bits: 1,
                parity: Parity::None,
                flow_control: FlowControl::None,
            },
            initialized: false,
            tx_buffer: [0; 64],
            rx_buffer: [0; 64],
            tx_head: 0,
            tx_tail: 0,
            rx_head: 0,
            rx_tail: 0,
        }
    }

    pub fn get_config(&self) -> &UartConfig {
        &self.config
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_tx_buffer_usage(&self) -> usize {
        if self.tx_head >= self.tx_tail {
            self.tx_head - self.tx_tail
        } else {
            self.tx_buffer.len() - self.tx_tail + self.tx_head
        }
    }

    pub fn get_rx_buffer_usage(&self) -> usize {
        if self.rx_head >= self.rx_tail {
            self.rx_head - self.rx_tail
        } else {
            self.rx_buffer.len() - self.rx_tail + self.rx_head
        }
    }

    pub fn is_tx_buffer_full(&self) -> bool {
        self.get_tx_buffer_usage() >= self.tx_buffer.len() - 1
    }

    pub fn is_rx_buffer_empty(&self) -> bool {
        self.get_rx_buffer_usage() == 0
    }

    pub fn is_tx_buffer_empty(&self) -> bool {
        self.get_tx_buffer_usage() == 0
    }

    pub fn is_rx_buffer_full(&self) -> bool {
        self.get_rx_buffer_usage() >= self.rx_buffer.len() - 1
    }
}

impl UartHal for UartDriver {
    type Error = UartError;

    fn initialize(&mut self, config: UartConfig) -> Result<(), Self::Error> {
        // Validate configuration
        if config.baud_rate == 0 {
            return Err(UartError::InvalidBaudRate);
        }

        if config.data_bits < 5 || config.data_bits > 8 {
            return Err(UartError::InvalidDataBits);
        }

        if config.stop_bits < 1 || config.stop_bits > 2 {
            return Err(UartError::InvalidStopBits);
        }

        // Store configuration
        self.config = config;

        // Hardware-specific initialization
        // This would configure the actual UART hardware

        self.initialized = true;
        Ok(())
    }

    fn write(&mut self, data: &[u8]) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(UartError::NotInitialized);
        }

        for &byte in data {
            if self.is_tx_buffer_full() {
                return Err(UartError::BufferFull);
            }

            self.tx_buffer[self.tx_head] = byte;
            self.tx_head = (self.tx_head + 1) % self.tx_buffer.len();
        }

        // Start transmission if not already transmitting
        self.start_transmission();
        Ok(())
    }

    fn read(&mut self, buffer: &mut [u8]) -> Result<usize, Self::Error> {
        if !self.initialized {
            return Err(UartError::NotInitialized);
        }

        let mut bytes_read = 0;
        for byte in buffer.iter_mut() {
            if self.is_rx_buffer_empty() {
                break;
            }

            *byte = self.rx_buffer[self.rx_tail];
            self.rx_tail = (self.rx_tail + 1) % self.rx_buffer.len();
            bytes_read += 1;
        }

        Ok(bytes_read)
    }

    fn is_ready_to_write(&self) -> Result<bool, Self::Error> {
        if !self.initialized {
            return Err(UartError::NotInitialized);
        }

        Ok(!self.is_tx_buffer_full())
    }

    fn is_ready_to_read(&self) -> Result<bool, Self::Error> {
        if !self.initialized {
            return Err(UartError::NotInitialized);
        }

        Ok(!self.is_rx_buffer_empty())
    }

    fn flush(&mut self) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(UartError::NotInitialized);
        }

        // Wait for transmission to complete
        while !self.is_tx_buffer_empty() {
            // Busy wait or yield to other tasks
        }

        Ok(())
    }
}

impl UartDriver {
    fn start_transmission(&mut self) {
        // Hardware-specific implementation
        // This would start UART transmission
    }

    pub fn handle_tx_interrupt(&mut self) {
        // Handle transmit interrupt
        if !self.is_tx_buffer_empty() {
            let byte = self.tx_buffer[self.tx_tail];
            self.tx_tail = (self.tx_tail + 1) % self.tx_buffer.len();

            // Send byte to hardware
            // Hardware-specific implementation
        }
    }

    pub fn handle_rx_interrupt(&mut self, byte: u8) {
        // Handle receive interrupt
        if !self.is_rx_buffer_full() {
            self.rx_buffer[self.rx_head] = byte;
            self.rx_head = (self.rx_head + 1) % self.rx_buffer.len();
        }
    }
}

// Error type
#[derive(Debug)]
pub enum UartError {
    NotInitialized,
    InvalidBaudRate,
    InvalidDataBits,
    InvalidStopBits,
    BufferFull,
    BufferEmpty,
    HardwareError,
    Timeout,
}

// Example usage
fn main() {
    let mut uart = UartDriver::new();

    // Initialize UART
    let config = UartConfig {
        baud_rate: 9600,
        data_bits: 8,
        stop_bits: 1,
        parity: Parity::None,
        flow_control: FlowControl::None,
    };

    let _ = uart.initialize(config);

    // Write data
    let _ = uart.write(b"Hello, UART!");

    // Read data
    let mut buffer = [0u8; 32];
    let bytes_read = uart.read(&mut buffer).unwrap();

    // Check status
    let is_ready_to_write = uart.is_ready_to_write().unwrap();
    let is_ready_to_read = uart.is_ready_to_read().unwrap();
}
```

**Explanation**:

- **UART HAL trait** provides common interface for UART operations
- **Buffer management** handles data buffering for transmission and reception
- **Configuration validation** ensures valid UART parameters
- **Error handling** manages communication errors gracefully
- **Interrupt handling** supports interrupt-driven communication

**Why**: This exercise teaches communication HAL development and buffer management in embedded systems.

### Advanced UART HAL with Protocol Support

**What**: Extend the basic UART HAL to include protocol support for structured communication.

**Why**: This advanced exercise is important because:

- **Protocol implementation** teaches structured communication
- **Message framing** introduces message-based communication
- **Error recovery** demonstrates communication error handling
- **State management** shows how to manage communication states
- **API design** develops skills in creating protocol interfaces

**When**: Use this exercise when you need to:

- Learn protocol implementation
- Practice structured communication
- Understand message framing
- Develop error recovery strategies
- Create protocol interfaces

**How**: Here's how to implement the advanced UART HAL:

```rust
#![no_std]

use core::marker::PhantomData;

// Protocol message types
#[derive(Debug, Clone, Copy)]
pub enum MessageType {
    Command,
    Response,
    Data,
    Error,
}

// Protocol message
pub struct ProtocolMessage {
    pub message_type: MessageType,
    pub id: u8,
    pub data: [u8; 32],
    pub length: usize,
}

impl ProtocolMessage {
    pub fn new(message_type: MessageType, id: u8) -> Self {
        Self {
            message_type,
            id,
            data: [0; 32],
            length: 0,
        }
    }

    pub fn set_data(&mut self, data: &[u8]) -> Result<(), ProtocolError> {
        if data.len() > self.data.len() {
            return Err(ProtocolError::DataTooLong);
        }

        self.data[..data.len()].copy_from_slice(data);
        self.length = data.len();
        Ok(())
    }

    pub fn get_data(&self) -> &[u8] {
        &self.data[..self.length]
    }
}

// Protocol error type
#[derive(Debug)]
pub enum ProtocolError {
    DataTooLong,
    InvalidMessage,
    ChecksumError,
    Timeout,
    BufferFull,
    BufferEmpty,
}

// Protocol HAL trait
pub trait ProtocolHal {
    type Error;

    fn send_message(&mut self, message: &ProtocolMessage) -> Result<(), Self::Error>;
    fn receive_message(&mut self, message: &mut ProtocolMessage) -> Result<(), Self::Error>;
    fn is_message_available(&self) -> Result<bool, Self::Error>;
    fn flush(&mut self) -> Result<(), Self::Error>;
}

// UART protocol implementation
pub struct UartProtocol {
    uart: UartDriver,
    tx_message_buffer: [ProtocolMessage; 8],
    rx_message_buffer: [ProtocolMessage; 8],
    tx_head: usize,
    tx_tail: usize,
    rx_head: usize,
    rx_tail: usize,
}

impl UartProtocol {
    pub fn new(uart: UartDriver) -> Self {
        Self {
            uart,
            tx_message_buffer: [ProtocolMessage::new(MessageType::Command, 0); 8],
            rx_message_buffer: [ProtocolMessage::new(MessageType::Command, 0); 8],
            tx_head: 0,
            tx_tail: 0,
            rx_head: 0,
            rx_tail: 0,
        }
    }

    pub fn get_uart(&self) -> &UartDriver {
        &self.uart
    }

    pub fn get_uart_mut(&mut self) -> &mut UartDriver {
        &mut self.uart
    }

    pub fn is_tx_message_buffer_full(&self) -> bool {
        (self.tx_head + 1) % self.tx_message_buffer.len() == self.tx_tail
    }

    pub fn is_rx_message_buffer_empty(&self) -> bool {
        self.rx_head == self.rx_tail
    }

    pub fn is_tx_message_buffer_empty(&self) -> bool {
        self.tx_head == self.tx_tail
    }

    pub fn is_rx_message_buffer_full(&self) -> bool {
        (self.rx_head + 1) % self.rx_message_buffer.len() == self.rx_tail
    }
}

impl ProtocolHal for UartProtocol {
    type Error = ProtocolError;

    fn send_message(&mut self, message: &ProtocolMessage) -> Result<(), Self::Error> {
        if self.is_tx_message_buffer_full() {
            return Err(ProtocolError::BufferFull);
        }

        // Store message in buffer
        self.tx_message_buffer[self.tx_head] = *message;
        self.tx_head = (self.tx_head + 1) % self.tx_message_buffer.len();

        // Start transmission
        self.start_message_transmission();
        Ok(())
    }

    fn receive_message(&mut self, message: &mut ProtocolMessage) -> Result<(), Self::Error> {
        if self.is_rx_message_buffer_empty() {
            return Err(ProtocolError::BufferEmpty);
        }

        // Get message from buffer
        *message = self.rx_message_buffer[self.rx_tail];
        self.rx_tail = (self.rx_tail + 1) % self.rx_message_buffer.len();

        Ok(())
    }

    fn is_message_available(&self) -> Result<bool, Self::Error> {
        Ok(!self.is_rx_message_buffer_empty())
    }

    fn flush(&mut self) -> Result<(), Self::Error> {
        self.uart.flush().map_err(|_| ProtocolError::Timeout)?;
        Ok(())
    }
}

impl UartProtocol {
    fn start_message_transmission(&mut self) {
        if !self.is_tx_message_buffer_empty() {
            let message = &self.tx_message_buffer[self.tx_tail];

            // Send message header
            let header = [
                message.message_type as u8,
                message.id,
                message.length as u8,
            ];
            let _ = self.uart.write(&header);

            // Send message data
            let _ = self.uart.write(&message.data[..message.length]);

            // Send checksum
            let checksum = self.calculate_checksum(message);
            let _ = self.uart.write(&[checksum]);

            // Move to next message
            self.tx_tail = (self.tx_tail + 1) % self.tx_message_buffer.len();
        }
    }

    fn calculate_checksum(&self, message: &ProtocolMessage) -> u8 {
        let mut checksum = 0u8;
        checksum ^= message.message_type as u8;
        checksum ^= message.id;
        checksum ^= message.length as u8;

        for &byte in &message.data[..message.length] {
            checksum ^= byte;
        }

        checksum
    }

    pub fn handle_rx_data(&mut self, data: &[u8]) {
        // Parse received data and store in message buffer
        if data.len() >= 3 {
            let message_type = match data[0] {
                0 => MessageType::Command,
                1 => MessageType::Response,
                2 => MessageType::Data,
                3 => MessageType::Error,
                _ => return,
            };

            let id = data[1];
            let length = data[2] as usize;

            if data.len() >= 3 + length + 1 {
                let message_data = &data[3..3 + length];
                let received_checksum = data[3 + length];

                // Verify checksum
                let mut checksum = 0u8;
                checksum ^= message_type as u8;
                checksum ^= id;
                checksum ^= length as u8;

                for &byte in message_data {
                    checksum ^= byte;
                }

                if checksum == received_checksum {
                    // Store valid message
                    if !self.is_rx_message_buffer_full() {
                        let mut message = ProtocolMessage::new(message_type, id);
                        let _ = message.set_data(message_data);
                        self.rx_message_buffer[self.rx_head] = message;
                        self.rx_head = (self.rx_head + 1) % self.rx_message_buffer.len();
                    }
                }
            }
        }
    }
}

// Example usage
fn main() {
    let uart = UartDriver::new();
    let mut protocol = UartProtocol::new(uart);

    // Send a command message
    let mut command = ProtocolMessage::new(MessageType::Command, 1);
    let _ = command.set_data(b"Hello, Protocol!");
    let _ = protocol.send_message(&command);

    // Send a data message
    let mut data = ProtocolMessage::new(MessageType::Data, 2);
    let _ = data.set_data(b"Data payload");
    let _ = protocol.send_message(&data);

    // Check for received messages
    if protocol.is_message_available().unwrap() {
        let mut received_message = ProtocolMessage::new(MessageType::Command, 0);
        let _ = protocol.receive_message(&mut received_message);
    }
}
```

**Explanation**:

- **Protocol messages** provide structured communication
- **Message buffering** handles multiple messages
- **Checksum validation** ensures data integrity
- **Error handling** manages protocol errors
- **State management** tracks communication state

**Why**: This exercise teaches advanced communication HAL development and protocol implementation.

## Exercise 3: Timer HAL Implementation

### What is the Timer HAL Exercise?

**What**: Create a complete Timer Hardware Abstraction Layer that provides a safe, type-safe interface for timing operations.

**Why**: This exercise is important because:

- **Timing operations** teaches timer and timing fundamentals
- **PWM generation** introduces pulse width modulation
- **Interrupt handling** demonstrates timer interrupt management
- **HAL patterns** applies HAL design patterns to timer peripherals
- **API design** develops skills in creating user-friendly timing interfaces

**When**: Use this exercise when you need to:

- Learn timer HAL development
- Understand timing abstraction
- Practice PWM generation
- Develop interrupt handling
- Create reusable timing interfaces

**How**: Here's how to implement the Timer HAL:

```rust
#![no_std]

use core::marker::PhantomData;

// Timer configuration
pub struct TimerConfig {
    pub frequency: u32,
    pub mode: TimerMode,
    pub prescaler: u32,
    pub auto_reload: bool,
    pub interrupt_enabled: bool,
}

#[derive(Debug, Clone, Copy)]
pub enum TimerMode {
    OneShot,
    Periodic,
    Continuous,
}

// Timer HAL trait
pub trait TimerHal {
    type Error;

    fn initialize(&mut self, config: TimerConfig) -> Result<(), Self::Error>;
    fn start(&mut self) -> Result<(), Self::Error>;
    fn stop(&mut self) -> Result<(), Self::Error>;
    fn get_count(&self) -> Result<u32, Self::Error>;
    fn set_count(&mut self, count: u32) -> Result<(), Self::Error>;
    fn is_running(&self) -> Result<bool, Self::Error>;
    fn reset(&mut self) -> Result<(), Self::Error>;
}

// Timer driver implementation
pub struct TimerDriver {
    config: TimerConfig,
    initialized: bool,
    running: bool,
    count: u32,
    max_count: u32,
}

impl TimerDriver {
    pub fn new() -> Self {
        Self {
            config: TimerConfig {
                frequency: 1000,
                mode: TimerMode::Periodic,
                prescaler: 1,
                auto_reload: true,
                interrupt_enabled: false,
            },
            initialized: false,
            running: false,
            count: 0,
            max_count: 0,
        }
    }

    pub fn get_config(&self) -> &TimerConfig {
        &self.config
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    pub fn get_max_count(&self) -> u32 {
        self.max_count
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
}

impl TimerHal for TimerDriver {
    type Error = TimerError;

    fn initialize(&mut self, config: TimerConfig) -> Result<(), Self::Error> {
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
        // This would configure the actual timer hardware

        self.initialized = true;
        Ok(())
    }

    fn start(&mut self) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific implementation
        // This would start the timer hardware

        self.running = true;
        Ok(())
    }

    fn stop(&mut self) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific implementation
        // This would stop the timer hardware

        self.running = false;
        Ok(())
    }

    fn get_count(&self) -> Result<u32, Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific implementation
        // This would read the actual timer count

        Ok(self.count)
    }

    fn set_count(&mut self, count: u32) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        if count > self.max_count {
            return Err(TimerError::InvalidCount);
        }

        // Hardware-specific implementation
        // This would set the actual timer count

        self.count = count;
        Ok(())
    }

    fn is_running(&self) -> Result<bool, Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        Ok(self.running)
    }

    fn reset(&mut self) -> Result<(), Self::Error> {
        if !self.initialized {
            return Err(TimerError::NotInitialized);
        }

        // Hardware-specific implementation
        // This would reset the timer hardware

        self.count = 0;
        Ok(())
    }
}

impl TimerDriver {
    pub fn handle_overflow_interrupt(&mut self) {
        // Handle timer overflow interrupt
        if self.config.mode == TimerMode::OneShot {
            self.running = false;
        } else if self.config.mode == TimerMode::Periodic {
            self.count = 0;
        }
        // Continuous mode doesn't need special handling
    }

    pub fn handle_compare_interrupt(&mut self) {
        // Handle timer compare interrupt
        // This would be used for PWM or other compare-based operations
    }
}

// Error type
#[derive(Debug)]
pub enum TimerError {
    NotInitialized,
    InvalidFrequency,
    InvalidPrescaler,
    InvalidCount,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    let mut timer = TimerDriver::new();

    // Initialize timer
    let config = TimerConfig {
        frequency: 1000,
        mode: TimerMode::Periodic,
        prescaler: 1,
        auto_reload: true,
        interrupt_enabled: true,
    };

    let _ = timer.initialize(config);

    // Start timer
    let _ = timer.start();

    // Check if timer is running
    let is_running = timer.is_running().unwrap();

    // Get timer count
    let count = timer.get_count().unwrap();

    // Set timer count
    let _ = timer.set_count(100);

    // Stop timer
    let _ = timer.stop();

    // Reset timer
    let _ = timer.reset();
}
```

**Explanation**:

- **Timer HAL trait** provides common interface for timer operations
- **Configuration management** handles timer setup and parameters
- **State tracking** monitors timer state and count
- **Interrupt handling** supports timer interrupt management
- **Error handling** manages timer errors gracefully

**Why**: This exercise teaches timer HAL development and timing operations in embedded systems.

## Key Takeaways

**What** you've learned through these practical HAL exercises:

1. **GPIO HAL Development** - Type-safe GPIO pin control with state management
2. **UART HAL Development** - Serial communication with buffer management
3. **Timer HAL Development** - Timing operations with interrupt support
4. **HAL Design Patterns** - Builder pattern, typestate pattern, and trait-based design
5. **Error Handling** - Comprehensive error management for hardware operations
6. **API Design** - Creating user-friendly hardware interfaces
7. **Testing and Validation** - Ensuring HAL implementations work correctly

**Why** these exercises matter:

- **Practical Skills** - Hands-on experience with HAL development
- **Pattern Application** - Applying HAL design patterns in practice
- **Hardware Abstraction** - Creating reusable hardware interfaces
- **Industry Readiness** - Preparation for professional embedded development
- **Portfolio Building** - Concrete examples of HAL development skills

## Next Steps

Now that you've completed these practical HAL exercises, you're ready to learn about:

- **Interrupts and Timers** - Asynchronous event handling
- **Communication Protocols** - UART, I2C, and SPI implementation
- **Advanced HAL Concepts** - More sophisticated hardware abstraction
- **Real-world Projects** - Complete embedded system development

**Where** to go next: Continue with the next lesson on "Interrupts and Timers" to learn about asynchronous event handling!
