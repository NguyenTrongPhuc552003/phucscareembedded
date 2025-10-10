---
sidebar_position: 2
---

# Register Access

Master direct hardware register access in embedded Rust with comprehensive explanations using the 4W+H framework.

## What Is Register Access in Embedded Systems?

**What**: Register access in embedded systems refers to the direct manipulation of hardware registers through memory-mapped I/O to control peripherals and system behavior.

**Why**: Understanding register access is crucial because:

- **Hardware control** provides direct control over hardware peripherals
- **Performance** enables optimal performance for time-critical operations
- **Precision** allows exact control over hardware behavior
- **Debugging** facilitates low-level hardware debugging
- **Portability** enables hardware-agnostic register manipulation
- **Safety** ensures memory-safe register access in Rust

**When**: Use register access when you need to:

- Control hardware peripherals directly
- Implement time-critical operations
- Debug hardware behavior at the register level
- Create low-level hardware drivers
- Optimize performance-critical code
- Understand hardware behavior

**How**: Register access works by:

- **Memory mapping** treating hardware registers as memory locations
- **Volatile access** ensuring compiler doesn't optimize register operations
- **Bit manipulation** controlling individual bits within registers
- **Type safety** using Rust's type system for safe register access
- **Error handling** managing hardware errors gracefully
- **Documentation** providing clear register interface specifications

**Where**: Register access is used in embedded systems, device drivers, bootloaders, real-time systems, and any application requiring direct hardware control.

## Understanding Memory-Mapped I/O

### What is Memory-Mapped I/O?

**What**: Memory-mapped I/O is a technique where hardware registers are mapped to specific memory addresses, allowing software to control hardware by reading from and writing to these memory locations.

**Why**: Understanding memory-mapped I/O is important because:

- **Unified addressing** provides a consistent interface for hardware and memory access
- **Efficiency** enables direct hardware control without special instructions
- **Simplicity** simplifies hardware programming with standard memory operations
- **Portability** allows hardware-agnostic register access patterns
- **Debugging** facilitates hardware debugging through memory inspection

**When**: Use memory-mapped I/O when you need to:

- Access hardware registers directly
- Implement device drivers
- Debug hardware behavior
- Create hardware abstraction layers
- Optimize hardware access performance

**How**: Here's how memory-mapped I/O works:

```rust
#![no_std]

use core::ptr::{read_volatile, write_volatile};

// GPIO register definitions for a hypothetical microcontroller
const GPIO_BASE: usize = 0x4002_0000;

// GPIO register offsets
const GPIO_MODER_OFFSET: usize = 0x00;    // GPIO Port Mode Register
const GPIO_OTYPER_OFFSET: usize = 0x04;   // GPIO Port Output Type Register
const GPIO_OSPEEDR_OFFSET: usize = 0x08;  // GPIO Port Output Speed Register
const GPIO_PUPDR_OFFSET: usize = 0x0C;    // GPIO Port Pull-up/Pull-down Register
const GPIO_IDR_OFFSET: usize = 0x10;      // GPIO Port Input Data Register
const GPIO_ODR_OFFSET: usize = 0x14;      // GPIO Port Output Data Register
const GPIO_BSRR_OFFSET: usize = 0x18;     // GPIO Port Bit Set/Reset Register
const GPIO_LCKR_OFFSET: usize = 0x1C;    // GPIO Port Configuration Lock Register

// GPIO mode values
const GPIO_MODE_INPUT: u32 = 0b00;
const GPIO_MODE_OUTPUT: u32 = 0b01;
const GPIO_MODE_ALTERNATE: u32 = 0b10;
const GPIO_MODE_ANALOG: u32 = 0b11;

// GPIO output type values
const GPIO_OTYPE_PUSH_PULL: u32 = 0b0;
const GPIO_OTYPE_OPEN_DRAIN: u32 = 0b1;

// GPIO speed values
const GPIO_SPEED_LOW: u32 = 0b00;
const GPIO_SPEED_MEDIUM: u32 = 0b01;
const GPIO_SPEED_HIGH: u32 = 0b10;
const GPIO_SPEED_VERY_HIGH: u32 = 0b11;

// GPIO pull-up/pull-down values
const GPIO_PUPD_NONE: u32 = 0b00;
const GPIO_PUPD_PULL_UP: u32 = 0b01;
const GPIO_PUPD_PULL_DOWN: u32 = 0b10;

// GPIO register access structure
pub struct GpioRegisters {
    base_address: usize,
}

impl GpioRegisters {
    pub fn new(base_address: usize) -> Self {
        Self { base_address }
    }

    // Read GPIO Mode Register
    pub fn read_moder(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_MODER_OFFSET) as *const u32)
        }
    }

    // Write GPIO Mode Register
    pub fn write_moder(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_MODER_OFFSET) as *mut u32, value);
        }
    }

    // Read GPIO Output Type Register
    pub fn read_otyper(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_OTYPER_OFFSET) as *const u32)
        }
    }

    // Write GPIO Output Type Register
    pub fn write_otyper(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_OTYPER_OFFSET) as *mut u32, value);
        }
    }

    // Read GPIO Output Speed Register
    pub fn read_ospeedr(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_OSPEEDR_OFFSET) as *const u32)
        }
    }

    // Write GPIO Output Speed Register
    pub fn write_ospeedr(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_OSPEEDR_OFFSET) as *mut u32, value);
        }
    }

    // Read GPIO Pull-up/Pull-down Register
    pub fn read_pupdr(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_PUPDR_OFFSET) as *const u32)
        }
    }

    // Write GPIO Pull-up/Pull-down Register
    pub fn write_pupdr(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_PUPDR_OFFSET) as *mut u32, value);
        }
    }

    // Read GPIO Input Data Register
    pub fn read_idr(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_IDR_OFFSET) as *const u32)
        }
    }

    // Read GPIO Output Data Register
    pub fn read_odr(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_ODR_OFFSET) as *const u32)
        }
    }

    // Write GPIO Output Data Register
    pub fn write_odr(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_ODR_OFFSET) as *mut u32, value);
        }
    }

    // Write GPIO Bit Set/Reset Register
    pub fn write_bsrr(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_BSRR_OFFSET) as *mut u32, value);
        }
    }

    // Read GPIO Configuration Lock Register
    pub fn read_lckr(&self) -> u32 {
        unsafe {
            read_volatile((self.base_address + GPIO_LCKR_OFFSET) as *const u32)
        }
    }

    // Write GPIO Configuration Lock Register
    pub fn write_lckr(&self, value: u32) {
        unsafe {
            write_volatile((self.base_address + GPIO_LCKR_OFFSET) as *mut u32, value);
        }
    }
}

// GPIO pin abstraction
pub struct GpioPin {
    registers: GpioRegisters,
    pin_number: u8,
}

impl GpioPin {
    pub fn new(registers: GpioRegisters, pin_number: u8) -> Self {
        Self { registers, pin_number }
    }

    pub fn configure_as_output(&self) -> Result<(), GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let pin_mask = 0b11 << (self.pin_number * 2);
        let mode_value = GPIO_MODE_OUTPUT << (self.pin_number * 2);

        let mut moder = self.registers.read_moder();
        moder &= !pin_mask;
        moder |= mode_value;
        self.registers.write_moder(moder);

        Ok(())
    }

    pub fn configure_as_input(&self) -> Result<(), GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let pin_mask = 0b11 << (self.pin_number * 2);
        let mode_value = GPIO_MODE_INPUT << (self.pin_number * 2);

        let mut moder = self.registers.read_moder();
        moder &= !pin_mask;
        moder |= mode_value;
        self.registers.write_moder(moder);

        Ok(())
    }

    pub fn set_high(&self) -> Result<(), GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let bit_set = 1 << self.pin_number;
        self.registers.write_bsrr(bit_set);
        Ok(())
    }

    pub fn set_low(&self) -> Result<(), GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let bit_reset = 1 << (self.pin_number + 16);
        self.registers.write_bsrr(bit_reset);
        Ok(())
    }

    pub fn is_high(&self) -> Result<bool, GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let idr = self.registers.read_idr();
        Ok((idr & (1 << self.pin_number)) != 0)
    }

    pub fn is_low(&self) -> Result<bool, GpioError> {
        if self.pin_number > 15 {
            return Err(GpioError::InvalidPin);
        }

        let idr = self.registers.read_idr();
        Ok((idr & (1 << self.pin_number)) == 0)
    }
}

// Error type
#[derive(Debug)]
pub enum GpioError {
    InvalidPin,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    // Create GPIO registers for Port A
    let gpio_a = GpioRegisters::new(GPIO_BASE);

    // Create GPIO pin 5
    let pin_5 = GpioPin::new(gpio_a, 5);

    // Configure pin as output
    let _ = pin_5.configure_as_output();

    // Set pin high
    let _ = pin_5.set_high();

    // Set pin low
    let _ = pin_5.set_low();

    // Configure pin as input
    let _ = pin_5.configure_as_input();

    // Read pin state
    let is_high = pin_5.is_high().unwrap();
    let is_low = pin_5.is_low().unwrap();
}
```

**Explanation**:

- **Memory mapping** treats hardware registers as memory locations
- **Volatile access** ensures compiler doesn't optimize register operations
- **Register offsets** define the layout of hardware registers
- **Bit manipulation** controls individual bits within registers
- **Type safety** provides safe register access through Rust's type system

**Why**: Memory-mapped I/O provides a unified interface for hardware and memory access in embedded systems.

### Volatile Access and Memory Ordering

**What**: Volatile access ensures that memory operations are not optimized away by the compiler and are performed in the order specified by the program.

**Why**: Understanding volatile access is important because:

- **Compiler optimization** prevents the compiler from optimizing away hardware operations
- **Memory ordering** ensures operations are performed in the correct sequence
- **Hardware behavior** maintains the expected behavior of hardware registers
- **Debugging** facilitates hardware debugging by preserving operation order
- **Performance** ensures optimal performance for hardware operations

**When**: Use volatile access when you need to:

- Access hardware registers
- Ensure memory operations are not optimized away
- Maintain correct operation ordering
- Debug hardware behavior
- Implement device drivers

**How**: Here's how to implement volatile access:

```rust
#![no_std]

use core::ptr::{read_volatile, write_volatile};
use core::sync::atomic::{fence, Ordering};

// Memory-mapped register with volatile access
pub struct VolatileRegister<T> {
    address: *mut T,
}

impl<T> VolatileRegister<T> {
    pub fn new(address: *mut T) -> Self {
        Self { address }
    }

    pub fn read(&self) -> T
    where
        T: Copy,
    {
        unsafe { read_volatile(self.address) }
    }

    pub fn write(&self, value: T) {
        unsafe { write_volatile(self.address, value) }
    }

    pub fn modify<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
        T: Copy,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }

    pub fn read_modify_write<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
        T: Copy,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }
}

// Memory barrier operations
pub struct MemoryBarrier;

impl MemoryBarrier {
    pub fn data_memory_barrier() {
        fence(Ordering::SeqCst);
    }

    pub fn instruction_memory_barrier() {
        fence(Ordering::SeqCst);
    }

    pub fn full_memory_barrier() {
        fence(Ordering::SeqCst);
    }
}

// Register field manipulation
pub struct RegisterField<T> {
    register: VolatileRegister<T>,
    mask: T,
    offset: u8,
}

impl<T> RegisterField<T>
where
    T: Copy + core::ops::BitAnd<Output = T> + core::ops::BitOr<Output = T> + core::ops::Not<Output = T> + core::ops::Shl<u8, Output = T> + core::ops::Shr<u8, Output = T> + PartialEq + From<u8>,
{
    pub fn new(register: VolatileRegister<T>, mask: T, offset: u8) -> Self {
        Self {
            register,
            mask,
            offset,
        }
    }

    pub fn read(&self) -> T {
        let value = self.register.read();
        (value & self.mask) >> self.offset
    }

    pub fn write(&self, value: T) {
        let current = self.register.read();
        let cleared = current & !self.mask;
        let shifted = value << self.offset;
        let new_value = cleared | (shifted & self.mask);
        self.register.write(new_value);
    }

    pub fn modify<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }
}

// Example usage with UART registers
const UART_BASE: usize = 0x4001_1000;

// UART register offsets
const UART_SR_OFFSET: usize = 0x00;    // Status Register
const UART_DR_OFFSET: usize = 0x04;    // Data Register
const UART_BRR_OFFSET: usize = 0x08;   // Baud Rate Register
const UART_CR1_OFFSET: usize = 0x0C;  // Control Register 1
const UART_CR2_OFFSET: usize = 0x10;   // Control Register 2
const UART_CR3_OFFSET: usize = 0x14;   // Control Register 3

// UART status register bits
const UART_SR_TXE: u32 = 1 << 7;  // Transmit Data Register Empty
const UART_SR_RXNE: u32 = 1 << 5; // Read Data Register Not Empty
const UART_SR_TC: u32 = 1 << 6;   // Transmission Complete

// UART control register 1 bits
const UART_CR1_UE: u32 = 1 << 13;  // USART Enable
const UART_CR1_TE: u32 = 1 << 3;   // Transmitter Enable
const UART_CR1_RE: u32 = 1 << 2;   // Receiver Enable

// UART driver using volatile access
pub struct UartDriver {
    status_register: VolatileRegister<u32>,
    data_register: VolatileRegister<u32>,
    baud_rate_register: VolatileRegister<u32>,
    control_register_1: VolatileRegister<u32>,
    control_register_2: VolatileRegister<u32>,
    control_register_3: VolatileRegister<u32>,
}

impl UartDriver {
    pub fn new() -> Self {
        Self {
            status_register: VolatileRegister::new((UART_BASE + UART_SR_OFFSET) as *mut u32),
            data_register: VolatileRegister::new((UART_BASE + UART_DR_OFFSET) as *mut u32),
            baud_rate_register: VolatileRegister::new((UART_BASE + UART_BRR_OFFSET) as *mut u32),
            control_register_1: VolatileRegister::new((UART_BASE + UART_CR1_OFFSET) as *mut u32),
            control_register_2: VolatileRegister::new((UART_BASE + UART_CR2_OFFSET) as *mut u32),
            control_register_3: VolatileRegister::new((UART_BASE + UART_CR3_OFFSET) as *mut u32),
        }
    }

    pub fn initialize(&mut self, baud_rate: u32) -> Result<(), UartError> {
        // Disable UART
        self.control_register_1.modify(|cr1| cr1 & !UART_CR1_UE);

        // Configure baud rate
        self.baud_rate_register.write(baud_rate);

        // Enable transmitter and receiver
        self.control_register_1.modify(|cr1| cr1 | UART_CR1_TE | UART_CR1_RE);

        // Enable UART
        self.control_register_1.modify(|cr1| cr1 | UART_CR1_UE);

        Ok(())
    }

    pub fn write_byte(&mut self, byte: u8) -> Result<(), UartError> {
        // Wait for transmit data register empty
        while (self.status_register.read() & UART_SR_TXE) == 0 {
            // Busy wait
        }

        // Write data
        self.data_register.write(byte as u32);

        // Wait for transmission complete
        while (self.status_register.read() & UART_SR_TC) == 0 {
            // Busy wait
        }

        Ok(())
    }

    pub fn read_byte(&mut self) -> Result<u8, UartError> {
        // Wait for data available
        while (self.status_register.read() & UART_SR_RXNE) == 0 {
            // Busy wait
        }

        // Read data
        let data = self.data_register.read() as u8;
        Ok(data)
    }

    pub fn write_string(&mut self, s: &str) -> Result<(), UartError> {
        for &byte in s.as_bytes() {
            self.write_byte(byte)?;
        }
        Ok(())
    }
}

// Error type
#[derive(Debug)]
pub enum UartError {
    HardwareError,
    Timeout,
    ConfigurationError,
}

// Example usage
fn main() {
    let mut uart = UartDriver::new();
    let _ = uart.initialize(9600);
    let _ = uart.write_string("Hello, UART!");
    let _ = uart.write_byte(b'A');
    let _ = uart.read_byte();
}
```

**Explanation**:

- **Volatile access** ensures compiler doesn't optimize hardware operations
- **Memory barriers** control memory ordering for hardware operations
- **Register fields** provide type-safe access to register bits
- **Atomic operations** ensure thread-safe register access
- **Error handling** manages hardware errors gracefully

**Why**: Volatile access ensures correct hardware behavior by preventing compiler optimizations and maintaining operation ordering.

## Understanding Bit Manipulation

### What is Bit Manipulation?

**What**: Bit manipulation is the process of setting, clearing, and testing individual bits within registers to control hardware behavior.

**Why**: Understanding bit manipulation is important because:

- **Hardware control** enables precise control over hardware peripherals
- **Efficiency** provides efficient hardware operations
- **Debugging** facilitates hardware debugging at the bit level
- **Performance** enables optimal performance for hardware operations
- **Flexibility** allows fine-grained hardware control

**When**: Use bit manipulation when you need to:

- Control individual hardware features
- Implement efficient hardware operations
- Debug hardware behavior
- Optimize hardware performance
- Create hardware abstraction layers

**How**: Here's how to implement bit manipulation:

```rust
#![no_std]

use core::ops::{BitAnd, BitOr, BitXor, Not, Shl, Shr};

// Bit manipulation utilities
pub struct BitManipulator;

impl BitManipulator {
    // Set a bit at the specified position
    pub fn set_bit<T>(value: T, position: u8) -> T
    where
        T: Copy + Shl<u8, Output = T> + BitOr<Output = T>,
    {
        value | (T::from(1) << position)
    }

    // Clear a bit at the specified position
    pub fn clear_bit<T>(value: T, position: u8) -> T
    where
        T: Copy + Shl<u8, Output = T> + Not<Output = T> + BitAnd<Output = T>,
    {
        value & !(T::from(1) << position)
    }

    // Toggle a bit at the specified position
    pub fn toggle_bit<T>(value: T, position: u8) -> T
    where
        T: Copy + Shl<u8, Output = T> + BitXor<Output = T>,
    {
        value ^ (T::from(1) << position)
    }

    // Test if a bit is set at the specified position
    pub fn is_bit_set<T>(value: T, position: u8) -> bool
    where
        T: Copy + Shl<u8, Output = T> + BitAnd<Output = T> + PartialEq,
    {
        (value & (T::from(1) << position)) != T::from(0)
    }

    // Extract a bit field from a value
    pub fn extract_field<T>(value: T, position: u8, width: u8) -> T
    where
        T: Copy + Shl<u8, Output = T> + Shr<u8, Output = T> + BitAnd<Output = T> + From<u8>,
    {
        let mask = (T::from(1) << width) - T::from(1);
        (value >> position) & mask
    }

    // Insert a value into a bit field
    pub fn insert_field<T>(value: T, field_value: T, position: u8, width: u8) -> T
    where
        T: Copy + Shl<u8, Output = T> + Shr<u8, Output = T> + BitAnd<Output = T> + BitOr<Output = T> + Not<Output = T> + From<u8>,
    {
        let mask = (T::from(1) << width) - T::from(1);
        let shifted_mask = mask << position;
        let shifted_field = (field_value & mask) << position;
        (value & !shifted_mask) | shifted_field
    }
}

// Register field manipulation
pub struct RegisterField<T> {
    register: *mut T,
    mask: T,
    offset: u8,
}

impl<T> RegisterField<T>
where
    T: Copy + BitAnd<Output = T> + BitOr<Output = T> + Not<Output = T> + Shl<u8, Output = T> + Shr<u8, Output = T> + PartialEq + From<u8>,
{
    pub fn new(register: *mut T, mask: T, offset: u8) -> Self {
        Self {
            register,
            mask,
            offset,
        }
    }

    pub fn read(&self) -> T {
        unsafe {
            let value = core::ptr::read_volatile(self.register);
            (value & self.mask) >> self.offset
        }
    }

    pub fn write(&self, value: T) {
        unsafe {
            let current = core::ptr::read_volatile(self.register);
            let cleared = current & !self.mask;
            let shifted = value << self.offset;
            let new_value = cleared | (shifted & self.mask);
            core::ptr::write_volatile(self.register, new_value);
        }
    }

    pub fn modify<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }
}

// GPIO pin control using bit manipulation
pub struct GpioPinControl {
    moder: RegisterField<u32>,
    otyper: RegisterField<u32>,
    ospeedr: RegisterField<u32>,
    pupdr: RegisterField<u32>,
    idr: RegisterField<u32>,
    odr: RegisterField<u32>,
    bsrr: RegisterField<u32>,
    pin_number: u8,
}

impl GpioPinControl {
    pub fn new(base_address: usize, pin_number: u8) -> Self {
        let moder = RegisterField::new(
            (base_address + 0x00) as *mut u32,
            0b11 << (pin_number * 2),
            pin_number * 2,
        );

        let otyper = RegisterField::new(
            (base_address + 0x04) as *mut u32,
            0b1 << pin_number,
            pin_number,
        );

        let ospeedr = RegisterField::new(
            (base_address + 0x08) as *mut u32,
            0b11 << (pin_number * 2),
            pin_number * 2,
        );

        let pupdr = RegisterField::new(
            (base_address + 0x0C) as *mut u32,
            0b11 << (pin_number * 2),
            pin_number * 2,
        );

        let idr = RegisterField::new(
            (base_address + 0x10) as *mut u32,
            0b1 << pin_number,
            pin_number,
        );

        let odr = RegisterField::new(
            (base_address + 0x14) as *mut u32,
            0b1 << pin_number,
            pin_number,
        );

        let bsrr = RegisterField::new(
            (base_address + 0x18) as *mut u32,
            0b1 << pin_number,
            pin_number,
        );

        Self {
            moder,
            otyper,
            ospeedr,
            pupdr,
            idr,
            odr,
            bsrr,
            pin_number,
        }
    }

    pub fn configure_as_output(&self) -> Result<(), GpioError> {
        self.moder.write(0b01); // Output mode
        Ok(())
    }

    pub fn configure_as_input(&self) -> Result<(), GpioError> {
        self.moder.write(0b00); // Input mode
        Ok(())
    }

    pub fn configure_as_alternate(&self) -> Result<(), GpioError> {
        self.moder.write(0b10); // Alternate function mode
        Ok(())
    }

    pub fn configure_as_analog(&self) -> Result<(), GpioError> {
        self.moder.write(0b11); // Analog mode
        Ok(())
    }

    pub fn set_output_type_push_pull(&self) -> Result<(), GpioError> {
        self.otyper.write(0b0); // Push-pull output
        Ok(())
    }

    pub fn set_output_type_open_drain(&self) -> Result<(), GpioError> {
        self.otyper.write(0b1); // Open-drain output
        Ok(())
    }

    pub fn set_speed_low(&self) -> Result<(), GpioError> {
        self.ospeedr.write(0b00); // Low speed
        Ok(())
    }

    pub fn set_speed_medium(&self) -> Result<(), GpioError> {
        self.ospeedr.write(0b01); // Medium speed
        Ok(())
    }

    pub fn set_speed_high(&self) -> Result<(), GpioError> {
        self.ospeedr.write(0b10); // High speed
        Ok(())
    }

    pub fn set_speed_very_high(&self) -> Result<(), GpioError> {
        self.ospeedr.write(0b11); // Very high speed
        Ok(())
    }

    pub fn set_pull_up(&self) -> Result<(), GpioError> {
        self.pupdr.write(0b01); // Pull-up
        Ok(())
    }

    pub fn set_pull_down(&self) -> Result<(), GpioError> {
        self.pupdr.write(0b10); // Pull-down
        Ok(())
    }

    pub fn set_no_pull(&self) -> Result<(), GpioError> {
        self.pupdr.write(0b00); // No pull-up/pull-down
        Ok(())
    }

    pub fn set_high(&self) -> Result<(), GpioError> {
        self.bsrr.write(0b1); // Set bit
        Ok(())
    }

    pub fn set_low(&self) -> Result<(), GpioError> {
        self.bsrr.write(0b1 << 16); // Reset bit
        Ok(())
    }

    pub fn is_high(&self) -> Result<bool, GpioError> {
        Ok(self.idr.read() != 0)
    }

    pub fn is_low(&self) -> Result<bool, GpioError> {
        Ok(self.idr.read() == 0)
    }
}

// Error type
#[derive(Debug)]
pub enum GpioError {
    InvalidPin,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    // Create GPIO pin control for pin 5
    let pin_control = GpioPinControl::new(0x4002_0000, 5);

    // Configure pin as output
    let _ = pin_control.configure_as_output();
    let _ = pin_control.set_output_type_push_pull();
    let _ = pin_control.set_speed_high();
    let _ = pin_control.set_no_pull();

    // Control pin state
    let _ = pin_control.set_high();
    let _ = pin_control.set_low();

    // Configure pin as input
    let _ = pin_control.configure_as_input();
    let _ = pin_control.set_pull_up();

    // Read pin state
    let is_high = pin_control.is_high().unwrap();
    let is_low = pin_control.is_low().unwrap();
}
```

**Explanation**:

- **Bit manipulation utilities** provide common bit operations
- **Register field manipulation** enables type-safe bit field access
- **GPIO control** demonstrates practical bit manipulation
- **Error handling** manages hardware errors gracefully
- **Type safety** ensures safe bit manipulation operations

**Why**: Bit manipulation provides precise control over hardware peripherals through efficient bit-level operations.

## Understanding Advanced Register Access

### Register Access Safety

**What**: Register access safety ensures that hardware register operations are performed safely without causing system instability or data corruption.

**Why**: Understanding register access safety is important because:

- **System stability** prevents system crashes and instability
- **Data integrity** ensures data is not corrupted during register operations
- **Hardware protection** prevents damage to hardware peripherals
- **Debugging** facilitates hardware debugging and troubleshooting
- **Performance** ensures optimal performance for hardware operations

**When**: Use register access safety when you need to:

- Implement safe hardware drivers
- Prevent system instability
- Ensure data integrity
- Debug hardware behavior
- Optimize hardware performance

**How**: Here's how to implement register access safety:

```rust
#![no_std]

use core::ptr::{read_volatile, write_volatile};
use core::sync::atomic::{fence, Ordering};

// Safe register access wrapper
pub struct SafeRegister<T> {
    address: *mut T,
    name: &'static str,
}

impl<T> SafeRegister<T> {
    pub fn new(address: *mut T, name: &'static str) -> Self {
        Self { address, name }
    }

    pub fn read(&self) -> T
    where
        T: Copy,
    {
        // Ensure memory ordering
        fence(Ordering::Acquire);
        let value = unsafe { read_volatile(self.address) };
        fence(Ordering::Acquire);
        value
    }

    pub fn write(&self, value: T) {
        // Ensure memory ordering
        fence(Ordering::Release);
        unsafe { write_volatile(self.address, value) };
        fence(Ordering::Release);
    }

    pub fn modify<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
        T: Copy,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }

    pub fn read_modify_write<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
        T: Copy,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }
}

// Register field with safety checks
pub struct SafeRegisterField<T> {
    register: SafeRegister<T>,
    mask: T,
    offset: u8,
    name: &'static str,
}

impl<T> SafeRegisterField<T>
where
    T: Copy + BitAnd<Output = T> + BitOr<Output = T> + Not<Output = T> + Shl<u8, Output = T> + Shr<u8, Output = T> + PartialEq + From<u8>,
{
    pub fn new(register: SafeRegister<T>, mask: T, offset: u8, name: &'static str) -> Self {
        Self {
            register,
            mask,
            offset,
            name,
        }
    }

    pub fn read(&self) -> T {
        let value = self.register.read();
        (value & self.mask) >> self.offset
    }

    pub fn write(&self, value: T) {
        // Validate value fits in field
        let max_value = (T::from(1) << self.offset) - T::from(1);
        if value > max_value {
            // Handle error - value too large for field
            return;
        }

        let current = self.register.read();
        let cleared = current & !self.mask;
        let shifted = value << self.offset;
        let new_value = cleared | (shifted & self.mask);
        self.register.write(new_value);
    }

    pub fn modify<F>(&self, f: F)
    where
        F: FnOnce(T) -> T,
    {
        let current = self.read();
        let modified = f(current);
        self.write(modified);
    }
}

// Hardware peripheral with safety checks
pub struct SafeGpioPeripheral {
    moder: SafeRegister<u32>,
    otyper: SafeRegister<u32>,
    ospeedr: SafeRegister<u32>,
    pupdr: SafeRegister<u32>,
    idr: SafeRegister<u32>,
    odr: SafeRegister<u32>,
    bsrr: SafeRegister<u32>,
    lckr: SafeRegister<u32>,
}

impl SafeGpioPeripheral {
    pub fn new(base_address: usize) -> Self {
        Self {
            moder: SafeRegister::new((base_address + 0x00) as *mut u32, "MODER"),
            otyper: SafeRegister::new((base_address + 0x04) as *mut u32, "OTYPER"),
            ospeedr: SafeRegister::new((base_address + 0x08) as *mut u32, "OSPEEDR"),
            pupdr: SafeRegister::new((base_address + 0x0C) as *mut u32, "PUPDR"),
            idr: SafeRegister::new((base_address + 0x10) as *mut u32, "IDR"),
            odr: SafeRegister::new((base_address + 0x14) as *mut u32, "ODR"),
            bsrr: SafeRegister::new((base_address + 0x18) as *mut u32, "BSRR"),
            lckr: SafeRegister::new((base_address + 0x1C) as *mut u32, "LCKR"),
        }
    }

    pub fn configure_pin(&self, pin: u8, mode: GpioMode) -> Result<(), GpioError> {
        if pin > 15 {
            return Err(GpioError::InvalidPin);
        }

        let pin_mask = 0b11 << (pin * 2);
        let mode_value = (mode as u32) << (pin * 2);

        self.moder.modify(|current| {
            let cleared = current & !pin_mask;
            cleared | mode_value
        });

        Ok(())
    }

    pub fn set_pin_high(&self, pin: u8) -> Result<(), GpioError> {
        if pin > 15 {
            return Err(GpioError::InvalidPin);
        }

        let bit_set = 1 << pin;
        self.bsrr.write(bit_set);
        Ok(())
    }

    pub fn set_pin_low(&self, pin: u8) -> Result<(), GpioError> {
        if pin > 15 {
            return Err(GpioError::InvalidPin);
        }

        let bit_reset = 1 << (pin + 16);
        self.bsrr.write(bit_reset);
        Ok(())
    }

    pub fn is_pin_high(&self, pin: u8) -> Result<bool, GpioError> {
        if pin > 15 {
            return Err(GpioError::InvalidPin);
        }

        let idr = self.idr.read();
        Ok((idr & (1 << pin)) != 0)
    }

    pub fn is_pin_low(&self, pin: u8) -> Result<bool, GpioError> {
        if pin > 15 {
            return Err(GpioError::InvalidPin);
        }

        let idr = self.idr.read();
        Ok((idr & (1 << pin)) == 0)
    }
}

// GPIO mode enumeration
#[derive(Debug, Clone, Copy)]
pub enum GpioMode {
    Input = 0b00,
    Output = 0b01,
    Alternate = 0b10,
    Analog = 0b11,
}

// Error type
#[derive(Debug)]
pub enum GpioError {
    InvalidPin,
    HardwareError,
    ConfigurationError,
}

// Example usage
fn main() {
    // Create safe GPIO peripheral
    let gpio = SafeGpioPeripheral::new(0x4002_0000);

    // Configure pin 5 as output
    let _ = gpio.configure_pin(5, GpioMode::Output);

    // Set pin high
    let _ = gpio.set_pin_high(5);

    // Set pin low
    let _ = gpio.set_pin_low(5);

    // Configure pin 6 as input
    let _ = gpio.configure_pin(6, GpioMode::Input);

    // Read pin state
    let is_high = gpio.is_pin_high(6).unwrap();
    let is_low = gpio.is_pin_low(6).unwrap();
}
```

**Explanation**:

- **Safe register access** ensures memory ordering and prevents optimization
- **Field validation** prevents invalid values from being written
- **Error handling** manages hardware errors gracefully
- **Memory barriers** ensure correct memory ordering
- **Type safety** provides compile-time safety for register operations

**Why**: Register access safety ensures stable and reliable hardware operations in embedded systems.

## Key Takeaways

**What** you've learned about register access in embedded Rust:

1. **Memory-Mapped I/O** - Direct hardware register access through memory addresses
2. **Volatile Access** - Ensuring compiler doesn't optimize hardware operations
3. **Bit Manipulation** - Precise control over individual register bits
4. **Register Safety** - Safe and reliable hardware register operations
5. **Field Manipulation** - Type-safe access to register fields
6. **Error Handling** - Comprehensive error management for hardware operations
7. **Performance** - Optimized hardware access for embedded systems

**Why** these concepts matter:

- **Hardware Control** - Direct control over hardware peripherals
- **System Stability** - Safe and reliable hardware operations
- **Performance** - Optimal performance for hardware access
- **Debugging** - Facilitated hardware debugging and troubleshooting
- **Portability** - Hardware-agnostic register access patterns

## Next Steps

Now that you understand register access, you're ready to learn about:

- **Practical Exercises** - Hands-on register access projects
- **Interrupts and Timers** - Asynchronous event handling
- **Communication Protocols** - UART, I2C, and SPI implementation
- **Advanced HAL Concepts** - More sophisticated hardware abstraction

**Where** to go next: Continue with the next lesson on "Practical Exercises" to apply your register access knowledge!
