---
sidebar_position: 1
---

# Driver Architecture

Master device driver architecture in Rust with comprehensive explanations using the 4W+H framework.

## What Are Device Drivers?

**What**: Device drivers are software components that act as intermediaries between the operating system kernel and hardware devices, providing a standardized interface for applications to interact with hardware.

**Why**: Understanding driver architecture is crucial because:

- **Hardware Abstraction**: Provide consistent interface to diverse hardware
- **System Integration**: Enable kernel-level hardware access
- **Performance**: Optimize hardware operations for efficiency
- **Security**: Control hardware access and prevent unauthorized use
- **Compatibility**: Ensure hardware works across different systems
- **Maintainability**: Create modular, reusable driver components

**When**: Use device drivers when:

- Developing kernel modules
- Creating hardware interfaces
- Building embedded systems
- Implementing real-time systems
- Working with specialized hardware
- Developing system-level software

**Where**: Device drivers are used in:

- Operating system kernels
- Embedded systems and microcontrollers
- Real-time operating systems
- Virtual machine hypervisors
- Hardware abstraction layers
- System-on-chip (SoC) platforms

**How**: Device drivers are implemented through:

- Kernel module development
- Hardware register access
- Interrupt handling
- Memory management
- I/O operations
- Driver registration and lifecycle

## Driver Architecture Patterns

### Layered Driver Architecture

```rust
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// Driver layer abstraction
pub trait DriverLayer {
    fn initialize(&mut self) -> Result<(), DriverError>;
    fn cleanup(&mut self) -> Result<(), DriverError>;
    fn is_initialized(&self) -> bool;
}

// Hardware abstraction layer
pub trait HardwareLayer {
    fn read_register(&self, address: u32) -> Result<u32, DriverError>;
    fn write_register(&self, address: u32, value: u32) -> Result<(), DriverError>;
    fn enable_interrupt(&self, irq: u32) -> Result<(), DriverError>;
    fn disable_interrupt(&self, irq: u32) -> Result<(), DriverError>;
}

// Device abstraction layer
pub trait DeviceLayer {
    fn open(&mut self) -> Result<(), DriverError>;
    fn close(&mut self) -> Result<(), DriverError>;
    fn read(&mut self, buffer: &mut [u8]) -> Result<usize, DriverError>;
    fn write(&mut self, data: &[u8]) -> Result<usize, DriverError>;
    fn ioctl(&mut self, command: u32, arg: usize) -> Result<usize, DriverError>;
}

// Driver error types
#[derive(Debug, Clone)]
pub enum DriverError {
    DeviceNotFound,
    PermissionDenied,
    InvalidParameter,
    HardwareError,
    Timeout,
    Interrupted,
    OutOfMemory,
    NotSupported,
}

impl std::fmt::Display for DriverError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            DriverError::DeviceNotFound => write!(f, "Device not found"),
            DriverError::PermissionDenied => write!(f, "Permission denied"),
            DriverError::InvalidParameter => write!(f, "Invalid parameter"),
            DriverError::HardwareError => write!(f, "Hardware error"),
            DriverError::Timeout => write!(f, "Operation timeout"),
            DriverError::Interrupted => write!(f, "Operation interrupted"),
            DriverError::OutOfMemory => write!(f, "Out of memory"),
            DriverError::NotSupported => write!(f, "Operation not supported"),
        }
    }
}

impl std::error::Error for DriverError {}

// Result type for driver operations
pub type DriverResult<T> = Result<T, DriverError>;
```

### Driver Registration System

```rust
use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::any::Any;

// Driver registration system
pub struct DriverRegistry {
    drivers: Arc<RwLock<HashMap<String, Box<dyn DriverLayer + Send + Sync>>>>,
    device_map: Arc<Mutex<HashMap<String, String>>>,
}

impl DriverRegistry {
    pub fn new() -> Self {
        Self {
            drivers: Arc::new(RwLock::new(HashMap::new())),
            device_map: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn register_driver(&self, name: String, driver: Box<dyn DriverLayer + Send + Sync>) -> DriverResult<()> {
        let mut drivers = self.drivers.write().unwrap();

        if drivers.contains_key(&name) {
            return Err(DriverError::DeviceNotFound);
        }

        drivers.insert(name, driver);
        Ok(())
    }

    pub fn unregister_driver(&self, name: &str) -> DriverResult<()> {
        let mut drivers = self.drivers.write().unwrap();

        if let Some(mut driver) = drivers.remove(name) {
            driver.cleanup()?;
            Ok(())
        } else {
            Err(DriverError::DeviceNotFound)
        }
    }

    pub fn get_driver(&self, name: &str) -> Option<Arc<dyn DriverLayer + Send + Sync>> {
        let drivers = self.drivers.read().unwrap();
        drivers.get(name).map(|d| Arc::new(d.as_ref()))
    }

    pub fn bind_device(&self, device_id: String, driver_name: String) -> DriverResult<()> {
        let mut device_map = self.device_map.lock().unwrap();
        device_map.insert(device_id, driver_name);
        Ok(())
    }

    pub fn get_driver_for_device(&self, device_id: &str) -> Option<String> {
        let device_map = self.device_map.lock().unwrap();
        device_map.get(device_id).cloned()
    }
}

// Global driver registry
lazy_static::lazy_static! {
    static ref GLOBAL_REGISTRY: DriverRegistry = DriverRegistry::new();
}

pub fn get_driver_registry() -> &'static DriverRegistry {
    &GLOBAL_REGISTRY
}
```

## Hardware Abstraction

### Register Access Layer

```rust
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// Hardware register access
pub struct RegisterAccess {
    registers: Arc<Mutex<HashMap<u32, u32>>>,
    base_address: u32,
}

impl RegisterAccess {
    pub fn new(base_address: u32) -> Self {
        Self {
            registers: Arc::new(Mutex::new(HashMap::new())),
            base_address,
        }
    }

    pub fn read_register(&self, offset: u32) -> DriverResult<u32> {
        let registers = self.registers.lock().unwrap();
        let address = self.base_address + offset;

        registers.get(&address).cloned().ok_or(DriverError::HardwareError)
    }

    pub fn write_register(&self, offset: u32, value: u32) -> DriverResult<()> {
        let mut registers = self.registers.lock().unwrap();
        let address = self.base_address + offset;

        registers.insert(address, value);
        Ok(())
    }

    pub fn read_field(&self, offset: u32, mask: u32, shift: u32) -> DriverResult<u32> {
        let value = self.read_register(offset)?;
        Ok((value & mask) >> shift)
    }

    pub fn write_field(&self, offset: u32, mask: u32, shift: u32, value: u32) -> DriverResult<()> {
        let current = self.read_register(offset)?;
        let new_value = (current & !mask) | ((value << shift) & mask);
        self.write_register(offset, new_value)
    }
}

// Bit manipulation utilities
pub struct BitField {
    pub mask: u32,
    pub shift: u32,
}

impl BitField {
    pub fn new(mask: u32, shift: u32) -> Self {
        Self { mask, shift }
    }

    pub fn extract(&self, value: u32) -> u32 {
        (value & self.mask) >> self.shift
    }

    pub fn insert(&self, value: u32, field_value: u32) -> u32 {
        (value & !self.mask) | ((field_value << self.shift) & self.mask)
    }
}

// Register definitions
pub struct RegisterDefinition {
    pub offset: u32,
    pub fields: HashMap<String, BitField>,
}

impl RegisterDefinition {
    pub fn new(offset: u32) -> Self {
        Self {
            offset,
            fields: HashMap::new(),
        }
    }

    pub fn add_field(&mut self, name: String, mask: u32, shift: u32) {
        self.fields.insert(name, BitField::new(mask, shift));
    }

    pub fn read_field(&self, access: &RegisterAccess, field_name: &str) -> DriverResult<u32> {
        let field = self.fields.get(field_name)
            .ok_or(DriverError::InvalidParameter)?;

        let value = access.read_register(self.offset)?;
        Ok(field.extract(value))
    }

    pub fn write_field(&self, access: &RegisterAccess, field_name: &str, value: u32) -> DriverResult<()> {
        let field = self.fields.get(field_name)
            .ok_or(DriverError::InvalidParameter)?;

        let current = access.read_register(self.offset)?;
        let new_value = field.insert(current, value);
        access.write_register(self.offset, new_value)
    }
}
```

### Interrupt Handling

```rust
use std::sync::{Arc, Mutex, Condvar};
use std::collections::HashMap;
use std::thread;

// Interrupt handler trait
pub trait InterruptHandler {
    fn handle_interrupt(&mut self, irq: u32) -> DriverResult<()>;
    fn enable_interrupt(&mut self, irq: u32) -> DriverResult<()>;
    fn disable_interrupt(&mut self, irq: u32) -> DriverResult<()>;
}

// Interrupt manager
pub struct InterruptManager {
    handlers: Arc<Mutex<HashMap<u32, Box<dyn InterruptHandler + Send + Sync>>>>,
    interrupt_queue: Arc<Mutex<VecDeque<u32>>>,
    condition: Arc<Condvar>,
    running: Arc<Mutex<bool>>,
}

impl InterruptManager {
    pub fn new() -> Self {
        Self {
            handlers: Arc::new(Mutex::new(HashMap::new())),
            interrupt_queue: Arc::new(Mutex::new(VecDeque::new())),
            condition: Arc::new(Condvar::new()),
            running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn register_handler(&self, irq: u32, handler: Box<dyn InterruptHandler + Send + Sync>) -> DriverResult<()> {
        let mut handlers = self.handlers.lock().unwrap();
        handlers.insert(irq, handler);
        Ok(())
    }

    pub fn unregister_handler(&self, irq: u32) -> DriverResult<()> {
        let mut handlers = self.handlers.lock().unwrap();
        handlers.remove(&irq);
        Ok(())
    }

    pub fn trigger_interrupt(&self, irq: u32) -> DriverResult<()> {
        let mut queue = self.interrupt_queue.lock().unwrap();
        queue.push_back(irq);
        self.condition.notify_one();
        Ok(())
    }

    pub fn start_interrupt_processing(&self) -> DriverResult<()> {
        let running = Arc::clone(&self.running);
        let handlers = Arc::clone(&self.handlers);
        let queue = Arc::clone(&self.interrupt_queue);
        let condition = Arc::clone(&self.condition);

        {
            let mut running = running.lock().unwrap();
            *running = true;
        }

        thread::spawn(move || {
            loop {
                let mut queue = queue.lock().unwrap();

                while queue.is_empty() {
                    queue = condition.wait(queue).unwrap();
                }

                if let Some(irq) = queue.pop_front() {
                    drop(queue);

                    let mut handlers = handlers.lock().unwrap();
                    if let Some(handler) = handlers.get_mut(&irq) {
                        let _ = handler.handle_interrupt(irq);
                    }
                }

                // Check if we should stop
                let running = running.lock().unwrap();
                if !*running {
                    break;
                }
            }
        });

        Ok(())
    }

    pub fn stop_interrupt_processing(&self) {
        let mut running = self.running.lock().unwrap();
        *running = false;
        self.condition.notify_all();
    }
}

// Interrupt service routine
pub struct InterruptServiceRoutine {
    irq: u32,
    handler: Box<dyn Fn(u32) -> DriverResult<()> + Send + Sync>,
}

impl InterruptServiceRoutine {
    pub fn new<F>(irq: u32, handler: F) -> Self
    where
        F: Fn(u32) -> DriverResult<()> + Send + Sync + 'static,
    {
        Self {
            irq,
            handler: Box::new(handler),
        }
    }

    pub fn handle(&self, irq: u32) -> DriverResult<()> {
        if irq == self.irq {
            (self.handler)(irq)
        } else {
            Ok(())
        }
    }
}
```

## Device Driver Implementation

### Character Device Driver

```rust
use std::sync::{Arc, Mutex, RwLock};
use std::collections::VecDeque;
use std::time::{Duration, Instant};

// Character device driver
pub struct CharDeviceDriver {
    name: String,
    major_number: u32,
    minor_number: u32,
    buffer: Arc<Mutex<VecDeque<u8>>>,
    open_count: Arc<Mutex<u32>>,
    device_info: Arc<RwLock<DeviceInfo>>,
}

#[derive(Debug, Clone)]
pub struct DeviceInfo {
    pub name: String,
    pub major: u32,
    pub minor: u32,
    pub open_count: u32,
    pub last_access: Option<Instant>,
}

impl CharDeviceDriver {
    pub fn new(name: String, major: u32, minor: u32) -> Self {
        Self {
            name: name.clone(),
            major_number: major,
            minor_number: minor,
            buffer: Arc::new(Mutex::new(VecDeque::new())),
            open_count: Arc::new(Mutex::new(0)),
            device_info: Arc::new(RwLock::new(DeviceInfo {
                name,
                major,
                minor,
                open_count: 0,
                last_access: None,
            })),
        }
    }

    pub fn open(&self) -> DriverResult<()> {
        let mut count = self.open_count.lock().unwrap();
        *count += 1;

        let mut info = self.device_info.write().unwrap();
        info.open_count = *count;
        info.last_access = Some(Instant::now());

        Ok(())
    }

    pub fn close(&self) -> DriverResult<()> {
        let mut count = self.open_count.lock().unwrap();
        if *count > 0 {
            *count -= 1;
        }

        let mut info = self.device_info.write().unwrap();
        info.open_count = *count;

        Ok(())
    }

    pub fn read(&self, buffer: &mut [u8]) -> DriverResult<usize> {
        let mut device_buffer = self.buffer.lock().unwrap();
        let mut bytes_read = 0;

        for (i, byte) in buffer.iter_mut().enumerate() {
            if let Some(b) = device_buffer.pop_front() {
                *byte = b;
                bytes_read += 1;
            } else {
                break;
            }
        }

        let mut info = self.device_info.write().unwrap();
        info.last_access = Some(Instant::now());

        Ok(bytes_read)
    }

    pub fn write(&self, data: &[u8]) -> DriverResult<usize> {
        let mut device_buffer = self.buffer.lock().unwrap();

        for &byte in data {
            device_buffer.push_back(byte);
        }

        let mut info = self.device_info.write().unwrap();
        info.last_access = Some(Instant::now());

        Ok(data.len())
    }

    pub fn ioctl(&self, command: u32, arg: usize) -> DriverResult<usize> {
        match command {
            0x1001 => { // GET_DEVICE_INFO
                let info = self.device_info.read().unwrap();
                Ok(info.open_count as usize)
            }
            0x1002 => { // CLEAR_BUFFER
                let mut buffer = self.buffer.lock().unwrap();
                buffer.clear();
                Ok(0)
            }
            0x1003 => { // GET_BUFFER_SIZE
                let buffer = self.buffer.lock().unwrap();
                Ok(buffer.len())
            }
            _ => Err(DriverError::NotSupported),
        }
    }

    pub fn get_device_info(&self) -> DeviceInfo {
        self.device_info.read().unwrap().clone()
    }
}

// Device file operations
pub struct DeviceFileOperations {
    driver: Arc<CharDeviceDriver>,
}

impl DeviceFileOperations {
    pub fn new(driver: Arc<CharDeviceDriver>) -> Self {
        Self { driver }
    }

    pub fn open(&self) -> DriverResult<()> {
        self.driver.open()
    }

    pub fn release(&self) -> DriverResult<()> {
        self.driver.close()
    }

    pub fn read(&self, buffer: &mut [u8]) -> DriverResult<usize> {
        self.driver.read(buffer)
    }

    pub fn write(&self, data: &[u8]) -> DriverResult<usize> {
        self.driver.write(data)
    }

    pub fn ioctl(&self, command: u32, arg: usize) -> DriverResult<usize> {
        self.driver.ioctl(command, arg)
    }
}
```

### Block Device Driver

```rust
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

// Block device driver
pub struct BlockDeviceDriver {
    name: String,
    major_number: u32,
    minor_number: u32,
    block_size: usize,
    total_blocks: u64,
    storage: Arc<Mutex<HashMap<u64, Vec<u8>>>>,
    open_count: Arc<Mutex<u32>>,
}

impl BlockDeviceDriver {
    pub fn new(name: String, major: u32, minor: u32, block_size: usize, total_blocks: u64) -> Self {
        Self {
            name,
            major_number: major,
            minor_number: minor,
            block_size,
            total_blocks,
            storage: Arc::new(Mutex::new(HashMap::new())),
            open_count: Arc::new(Mutex::new(0)),
        }
    }

    pub fn open(&self) -> DriverResult<()> {
        let mut count = self.open_count.lock().unwrap();
        *count += 1;
        Ok(())
    }

    pub fn close(&self) -> DriverResult<()> {
        let mut count = self.open_count.lock().unwrap();
        if *count > 0 {
            *count -= 1;
        }
        Ok(())
    }

    pub fn read_block(&self, block_number: u64, buffer: &mut [u8]) -> DriverResult<usize> {
        if block_number >= self.total_blocks {
            return Err(DriverError::InvalidParameter);
        }

        if buffer.len() < self.block_size {
            return Err(DriverError::InvalidParameter);
        }

        let storage = self.storage.lock().unwrap();

        if let Some(block_data) = storage.get(&block_number) {
            buffer[..self.block_size].copy_from_slice(block_data);
            Ok(self.block_size)
        } else {
            // Return zero-filled block
            buffer[..self.block_size].fill(0);
            Ok(self.block_size)
        }
    }

    pub fn write_block(&self, block_number: u64, data: &[u8]) -> DriverResult<usize> {
        if block_number >= self.total_blocks {
            return Err(DriverError::InvalidParameter);
        }

        if data.len() != self.block_size {
            return Err(DriverError::InvalidParameter);
        }

        let mut storage = self.storage.lock().unwrap();
        storage.insert(block_number, data.to_vec());
        Ok(self.block_size)
    }

    pub fn get_device_info(&self) -> BlockDeviceInfo {
        BlockDeviceInfo {
            name: self.name.clone(),
            major: self.major_number,
            minor: self.minor_number,
            block_size: self.block_size,
            total_blocks: self.total_blocks,
            open_count: *self.open_count.lock().unwrap(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct BlockDeviceInfo {
    pub name: String,
    pub major: u32,
    pub minor: u32,
    pub block_size: usize,
    pub total_blocks: u64,
    pub open_count: u32,
}

// Block device operations
pub struct BlockDeviceOperations {
    driver: Arc<BlockDeviceDriver>,
}

impl BlockDeviceOperations {
    pub fn new(driver: Arc<BlockDeviceDriver>) -> Self {
        Self { driver }
    }

    pub fn open(&self) -> DriverResult<()> {
        self.driver.open()
    }

    pub fn release(&self) -> DriverResult<()> {
        self.driver.close()
    }

    pub fn read(&self, block_number: u64, buffer: &mut [u8]) -> DriverResult<usize> {
        self.driver.read_block(block_number, buffer)
    }

    pub fn write(&self, block_number: u64, data: &[u8]) -> DriverResult<usize> {
        self.driver.write_block(block_number, data)
    }

    pub fn ioctl(&self, command: u32, arg: usize) -> DriverResult<usize> {
        match command {
            0x2001 => { // GET_DEVICE_INFO
                let info = self.driver.get_device_info();
                Ok(info.total_blocks as usize)
            }
            0x2002 => { // GET_BLOCK_SIZE
                let info = self.driver.get_device_info();
                Ok(info.block_size)
            }
            _ => Err(DriverError::NotSupported),
        }
    }
}
```

## Driver Lifecycle Management

### Driver Initialization and Cleanup

```rust
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;

// Driver lifecycle manager
pub struct DriverLifecycleManager {
    drivers: Arc<Mutex<Vec<Box<dyn DriverLayer + Send + Sync>>>>,
    running: Arc<Mutex<bool>>,
}

impl DriverLifecycleManager {
    pub fn new() -> Self {
        Self {
            drivers: Arc::new(Mutex::new(Vec::new())),
            running: Arc::new(Mutex::new(false)),
        }
    }

    pub fn add_driver(&self, driver: Box<dyn DriverLayer + Send + Sync>) -> DriverResult<()> {
        let mut drivers = self.drivers.lock().unwrap();
        drivers.push(driver);
        Ok(())
    }

    pub fn initialize_all(&self) -> DriverResult<()> {
        let drivers = self.drivers.lock().unwrap();

        for driver in drivers.iter() {
            driver.initialize()?;
        }

        Ok(())
    }

    pub fn cleanup_all(&self) -> DriverResult<()> {
        let drivers = self.drivers.lock().unwrap();

        for driver in drivers.iter() {
            driver.cleanup()?;
        }

        Ok(())
    }

    pub fn start_monitoring(&self) -> DriverResult<()> {
        let running = Arc::clone(&self.running);
        let drivers = Arc::clone(&self.drivers);

        {
            let mut running = running.lock().unwrap();
            *running = true;
        }

        thread::spawn(move || {
            loop {
                // Monitor driver health
                {
                    let drivers = drivers.lock().unwrap();
                    for driver in drivers.iter() {
                        if !driver.is_initialized() {
                            eprintln!("Driver not initialized");
                        }
                    }
                }

                thread::sleep(Duration::from_secs(1));

                // Check if we should stop
                let running = running.lock().unwrap();
                if !*running {
                    break;
                }
            }
        });

        Ok(())
    }

    pub fn stop_monitoring(&self) {
        let mut running = self.running.lock().unwrap();
        *running = false;
    }
}

// Driver health monitoring
pub trait DriverHealth {
    fn get_health_status(&self) -> HealthStatus;
    fn perform_health_check(&self) -> DriverResult<()>;
}

#[derive(Debug, Clone)]
pub enum HealthStatus {
    Healthy,
    Warning(String),
    Critical(String),
    Unknown,
}

// Driver statistics
#[derive(Debug, Clone)]
pub struct DriverStatistics {
    pub operations_count: u64,
    pub error_count: u64,
    pub last_operation_time: Option<std::time::Instant>,
    pub average_operation_time: Duration,
}

impl Default for DriverStatistics {
    fn default() -> Self {
        Self {
            operations_count: 0,
            error_count: 0,
            last_operation_time: None,
            average_operation_time: Duration::from_millis(0),
        }
    }
}

// Statistics tracking
pub struct DriverStatisticsTracker {
    stats: Arc<Mutex<DriverStatistics>>,
}

impl DriverStatisticsTracker {
    pub fn new() -> Self {
        Self {
            stats: Arc::new(Mutex::new(DriverStatistics::default())),
        }
    }

    pub fn record_operation(&self, duration: Duration) {
        let mut stats = self.stats.lock().unwrap();
        stats.operations_count += 1;
        stats.last_operation_time = Some(std::time::Instant::now());

        // Update average operation time
        let total_time = stats.average_operation_time * (stats.operations_count - 1) as u32 + duration;
        stats.average_operation_time = total_time / stats.operations_count as u32;
    }

    pub fn record_error(&self) {
        let mut stats = self.stats.lock().unwrap();
        stats.error_count += 1;
    }

    pub fn get_statistics(&self) -> DriverStatistics {
        self.stats.lock().unwrap().clone()
    }
}
```

## Practical Examples

### Simple GPIO Driver

```rust
use std::sync::{Arc, Mutex};

// GPIO driver implementation
pub struct GpioDriver {
    base_address: u32,
    register_access: RegisterAccess,
    pin_count: u32,
    pin_states: Arc<Mutex<HashMap<u32, bool>>>,
}

impl GpioDriver {
    pub fn new(base_address: u32, pin_count: u32) -> Self {
        Self {
            base_address,
            register_access: RegisterAccess::new(base_address),
            pin_count,
            pin_states: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn set_pin_direction(&self, pin: u32, output: bool) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let direction_register = 0x00; // GPIO direction register
        let pin_mask = 1 << pin;

        if output {
            // Set pin as output
            let current = self.register_access.read_register(direction_register)?;
            self.register_access.write_register(direction_register, current | pin_mask)?;
        } else {
            // Set pin as input
            let current = self.register_access.read_register(direction_register)?;
            self.register_access.write_register(direction_register, current & !pin_mask)?;
        }

        Ok(())
    }

    pub fn set_pin_value(&self, pin: u32, value: bool) -> DriverResult<()> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let output_register = 0x04; // GPIO output register
        let pin_mask = 1 << pin;

        let current = self.register_access.read_register(output_register)?;
        let new_value = if value {
            current | pin_mask
        } else {
            current & !pin_mask
        };

        self.register_access.write_register(output_register, new_value)?;

        // Update internal state
        let mut states = self.pin_states.lock().unwrap();
        states.insert(pin, value);

        Ok(())
    }

    pub fn get_pin_value(&self, pin: u32) -> DriverResult<bool> {
        if pin >= self.pin_count {
            return Err(DriverError::InvalidParameter);
        }

        let input_register = 0x08; // GPIO input register
        let pin_mask = 1 << pin;

        let value = self.register_access.read_register(input_register)?;
        Ok((value & pin_mask) != 0)
    }

    pub fn get_pin_state(&self, pin: u32) -> Option<bool> {
        let states = self.pin_states.lock().unwrap();
        states.get(&pin).cloned()
    }
}

impl DriverLayer for GpioDriver {
    fn initialize(&mut self) -> DriverResult<()> {
        // Initialize GPIO controller
        let control_register = 0x0C; // GPIO control register
        self.register_access.write_register(control_register, 0x01)?; // Enable GPIO

        Ok(())
    }

    fn cleanup(&mut self) -> DriverResult<()> {
        // Disable GPIO controller
        let control_register = 0x0C;
        self.register_access.write_register(control_register, 0x00)?;

        Ok(())
    }

    fn is_initialized(&self) -> bool {
        let control_register = 0x0C;
        self.register_access.read_register(control_register)
            .map(|v| v & 0x01 != 0)
            .unwrap_or(false)
    }
}

// Usage example
fn gpio_driver_example() -> DriverResult<()> {
    let mut gpio = GpioDriver::new(0x10000000, 32);

    // Initialize driver
    gpio.initialize()?;

    // Configure pin 0 as output
    gpio.set_pin_direction(0, true)?;

    // Set pin 0 high
    gpio.set_pin_value(0, true)?;

    // Configure pin 1 as input
    gpio.set_pin_direction(1, false)?;

    // Read pin 1 value
    let value = gpio.get_pin_value(1)?;
    println!("Pin 1 value: {}", value);

    // Cleanup
    gpio.cleanup()?;

    Ok(())
}
```

## Key Takeaways

- **Driver architecture** provides modular, maintainable hardware interfaces
- **Hardware abstraction** enables consistent access to diverse hardware
- **Interrupt handling** is essential for responsive hardware interaction
- **Device drivers** bridge the gap between hardware and software
- **Lifecycle management** ensures proper driver initialization and cleanup
- **Error handling** is crucial for robust driver operation

## Next Steps

- Learn about **kernel integration** and module development
- Explore **performance optimization** techniques
- Study **real-time systems** programming
- Practice with **advanced driver development** projects

## Resources

- [Linux Device Drivers](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/)
- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust for Linux](https://github.com/Rust-for-Linux/linux)
- [Embedded Rust Book](https://docs.rust-embedded.org/book/)
