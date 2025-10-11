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

**What**: The layered driver architecture divides the driver into multiple logical layers—each with a clear responsibility—such as hardware access, device management, and interface handling.

**Why**: This pattern increases modularity and maintainability by separating hardware-specific code from device logic and user-facing interfaces. It helps in isolating platform dependencies and allows layers to be testing or reused independently.

**When**: Use layered architecture when writing drivers for hardware that may exist in various platforms, for complex devices requiring clean separation of logic, or when targeting systems where testability and code reuse are priorities.

**How**: Each architectural layer is implemented using traits (interfaces) in Rust, such as `DriverLayer`, `HardwareLayer`, and `DeviceLayer`.

- The hardware layer directly interacts with registers and manages interrupts.
- The device layer handles logical operations like open/read/write.
- The driver layer manages driver lifecycle (initialization, cleanup, state).

This separation is illustrated in the following code example, making it easier to reason about, test, and modify each portion of the driver stack without impacting the others.

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
```

**Code Explanation**: This example demonstrates a layered driver architecture using Rust traits:

- **`DriverLayer`**: Defines the basic lifecycle operations for any driver (initialize, cleanup, status)
- **`HardwareLayer`**: Abstracts hardware register access and interrupt management. This layer handles the lowest-level hardware interaction
- **`DeviceLayer`**: Provides the standard device interface (open, close, read, write, ioctl) that applications use
- **`DriverError`**: Comprehensive error handling for all possible driver failure modes

**Why this works**: The layered approach provides:

- **Separation of concerns**: Each layer has a specific responsibility
- **Testability**: Each layer can be tested independently
- **Reusability**: Hardware layers can be reused across different device types
- **Safety**: Rust's type system ensures proper error handling at each layer

### Driver Error Types

**What**: Driver error types are a comprehensive list of all possible error conditions that can occur in device drivers.

**Why**: This pattern ensures that all error cases are handled and provides a clear, type-safe way to manage driver failures.

**When**: Use driver error types when writing device drivers to ensure that all error cases are handled.

**How**: The driver error types are defined as an enum with all possible error cases.

```rust
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

**Code Explanation**: This example demonstrates comprehensive error handling for device drivers:

- **`DriverError` enum**: Defines all possible error conditions that can occur in device drivers
- **`#[derive(Debug, Clone)]`**: Automatically implements Debug and Clone traits for the enum
- **`Display` implementation**: Provides human-readable error messages for each error type
- **`Error` trait implementation**: Makes DriverError compatible with Rust's standard error handling
- **`DriverResult<T>` type alias**: Creates a convenient type alias for `Result<T, DriverError>`

**Why this works**: This error handling system provides:

- **Type safety**: Compiler ensures all error cases are handled
- **User-friendly messages**: Clear error descriptions for debugging
- **Standard compatibility**: Works with Rust's error handling ecosystem
- **Comprehensive coverage**: Handles all common driver failure scenarios

### Driver Registration System

**What**: The driver registration system is a thread-safe system that manages the registration and unregistration of drivers.

**Why**: This pattern ensures that drivers are registered and unregistered in a thread-safe manner, and that drivers are properly initialized and cleaned up.

**When**: Use the driver registration system when writing device drivers that need to be registered and unregistered.

**How**: The driver registration system is implemented as a struct with a thread-safe HashMap of drivers.

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

**Code Explanation**: This example demonstrates a thread-safe driver registration system:

- **`DriverRegistry` struct**: Manages a collection of drivers and device mappings using thread-safe containers
- **`Arc<RwLock<HashMap<...>>>`**: Thread-safe storage for drivers. `Arc` allows sharing across threads, `RwLock` provides read-write locking
- **`register_driver()`**: Adds a new driver to the registry, checking for duplicates
- **`unregister_driver()`**: Removes a driver and calls its cleanup method
- **`bind_device()`**: Associates a device ID with a driver name for device-to-driver mapping
- **`lazy_static!`**: Creates a global registry instance that's initialized on first access

**Why this works**: This registration system provides:

- **Thread safety**: Multiple threads can safely register and access drivers
- **Device binding**: Maps specific devices to their appropriate drivers
- **Lifecycle management**: Handles driver initialization and cleanup
- **Global access**: Provides a single point of access to all registered drivers

## Hardware Abstraction

### Register Access Layer

**What**: The register access layer is a layer that provides access to hardware registers.

**Why**: This pattern ensures that hardware registers are accessed in a thread-safe manner, and that hardware registers are properly initialized and cleaned up.

**When**: Use the register access layer when writing device drivers that need to access hardware registers.

**How**: The register access layer is implemented as a struct with a thread-safe HashMap of registers.

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
```

**Code Explanation**: This example demonstrates hardware register access patterns in Rust:

- **`RegisterAccess` struct**: Simulates hardware register access using a HashMap to store register values. In real hardware, this would be memory-mapped I/O
- **`Arc<Mutex<HashMap<u32, u32>>>`**: Thread-safe storage for register values. `Arc` allows sharing across threads, `Mutex` provides synchronization
- **`base_address + offset`**: Calculates the actual hardware address by adding the offset to the base address
- **`read_register()`**: Locks the mutex, calculates the address, and retrieves the register value. Returns `HardwareError` if register not found
- **`write_register()`**: Locks the mutex, calculates the address, and stores the new value
- **`read_field()`**: Reads a specific bit field using bit masking (`value & mask`) and shifting (`>> shift`)
- **`write_field()`**: Updates a specific bit field by clearing the old bits (`current & !mask`) and setting new bits (`(value << shift) & mask`)

**Why this works**: This pattern provides safe, thread-safe access to hardware registers while abstracting the complexity of bit manipulation and memory-mapped I/O.

### Bit Field Manipulation

**What**: The bit field manipulation layer is a layer that provides bit field manipulation utilities.

**Why**: This pattern ensures that bit fields are manipulated in a thread-safe manner, and that bit fields are properly initialized and cleaned up.

**When**: Use the bit field manipulation layer when writing device drivers that need to manipulate bit fields.

**How**: The bit field manipulation layer is implemented as a struct with a thread-safe HashMap of bit fields.

```rust
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

**Code Explanation**: This example demonstrates bit field manipulation utilities:

- **`BitField` struct**: Represents a bit field with a mask (which bits to extract) and shift (position in the register)
- **`new(mask, shift)`**: Creates a new bit field. The mask defines which bits to work with, shift defines the position
- **`extract(value)`**: Extracts the bit field value by masking (`value & self.mask`) to isolate the bits, then shifting (`>> self.shift`) to move them to the right position
- **`insert(value, field_value)`**: Inserts a new value into the bit field by first clearing the old bits (`value & !self.mask`), then setting the new bits (`(field_value << self.shift) & self.mask`)
- **`RegisterDefinition`**: Manages multiple bit fields within a single register, providing a high-level interface for register manipulation

**Why this works**: Bit fields allow precise control over individual bits in hardware registers, which is essential for device driver programming where each bit often controls a specific hardware feature.

### Interrupt Handling

**What**: The interrupt handling layer is a layer that provides interrupt handling utilities.

**Why**: This pattern ensures that interrupts are handled in a thread-safe manner, and that interrupts are properly initialized and cleaned up.

**When**: Use the interrupt handling layer when writing device drivers that need to handle interrupts.

**How**: The interrupt handling layer is implemented as a struct with a thread-safe HashMap of interrupt handlers.

```rust
use std::sync::{Arc, Mutex, Condvar};
use std::collections::HashMap;
use std::thread;
use std::collections::VecDeque;

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
```

**Code Explanation**: This example demonstrates interrupt handling in Rust:

- **`InterruptHandler` trait**: Defines the interface for interrupt handlers with methods to handle, enable, and disable interrupts
- **`InterruptManager` struct**: Manages multiple interrupt handlers using thread-safe containers
- **`interrupt_queue`**: A thread-safe queue that stores pending interrupts for processing
- **`condition` variable**: Used to wake up the interrupt processing thread when new interrupts arrive
- **`start_interrupt_processing()`**: Spawns a background thread that processes interrupts from the queue
- **`trigger_interrupt()`**: Adds an interrupt to the queue and notifies the processing thread

**Why this works**: This interrupt handling system provides:

- **Thread safety**: Multiple threads can safely register handlers and trigger interrupts
- **Asynchronous processing**: Interrupts are processed in a background thread
- **Queue-based**: Interrupts are queued and processed in order
- **Lifecycle management**: Handles starting and stopping interrupt processing

## Device Driver Implementation

### Character Device Driver

**What**: The character device driver is a driver that provides character device interface.

**Why**: This pattern ensures that character device interface is provided in a thread-safe manner, and that character device interface is properly initialized and cleaned up.

**When**: Use the character device driver when writing device drivers that need to provide character device interface.

**How**: The character device driver is implemented as a struct with a thread-safe HashMap of character device interface.

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
```

**Code Explanation**: This example demonstrates a character device driver implementation:

- **`CharDeviceDriver` struct**: Represents a character device with major/minor numbers and internal state
- **`buffer: Arc<Mutex<VecDeque<u8>>>`**: Thread-safe circular buffer for storing data
- **`open_count`**: Tracks how many times the device has been opened
- **`open()`/`close()`**: Manage device open/close operations and update counters
- **`read()`/`write()`**: Handle data transfer operations with the device buffer
- **`ioctl()`**: Provides device-specific control operations (get info, clear buffer, etc.)
- **`DeviceInfo`**: Stores metadata about the device including access times and open count

**Why this works**: This character device driver provides:

- **Thread safety**: All operations are protected by mutexes
- **State tracking**: Monitors device usage and access patterns
- **Standard interface**: Implements the standard open/close/read/write/ioctl interface
- **Flexible control**: Supports device-specific operations through ioctl

### Block Device Driver

**What**: The block device driver is a driver that provides block device interface.

**Why**: This pattern ensures that block device interface is provided in a thread-safe manner, and that block device interface is properly initialized and cleaned up.

**When**: Use the block device driver when writing device drivers that need to provide block device interface.

**How**: The block device driver is implemented as a struct with a thread-safe HashMap of block device interface.

```rust
use std::sync::{Arc, Mutex, RwLock};
use std::collections::HashMap;
use std::time::{Duration, Instant};

// Block device sector size (e.g., 512 bytes)
const BLOCK_SIZE: usize = 512;

// Type alias for Result
pub type DriverResult<T> = Result<T, DriverError>;

#[derive(Debug, Clone)]
pub struct BlockDeviceInfo {
    pub name: String,
    pub major: u32,
    pub minor: u32,
    pub block_count: u64,
    pub block_size: usize,
    pub last_access: Option<Instant>,
}

#[derive(Debug)]
pub enum DriverError {
    Busy,
    NotSupported,
    IoError,
    OutOfBounds,
    Other(String),
}

pub struct BlockDeviceDriver {
    name: String,
    major_number: u32,
    minor_number: u32,
    storage: Arc<Mutex<Vec<u8>>>,
    block_count: u64,
    device_info: Arc<RwLock<BlockDeviceInfo>>,
}

impl BlockDeviceDriver {
    pub fn new(name: String, major: u32, minor: u32, block_count: u64) -> Self {
        let storage = vec![0u8; block_count as usize * BLOCK_SIZE];
        Self {
            name: name.clone(),
            major_number: major,
            minor_number: minor,
            storage: Arc::new(Mutex::new(storage)),
            block_count,
            device_info: Arc::new(RwLock::new(BlockDeviceInfo {
                name,
                major,
                minor,
                block_count,
                block_size: BLOCK_SIZE,
                last_access: None,
            })),
        }
    }

    pub fn read_block(&self, block_index: u64, buf: &mut [u8]) -> DriverResult<usize> {
        if block_index >= self.block_count || buf.len() < BLOCK_SIZE {
            return Err(DriverError::OutOfBounds);
        }
        let offset = (block_index as usize) * BLOCK_SIZE;
        let mut storage = self.storage.lock().unwrap();
        buf.copy_from_slice(&storage[offset..offset + BLOCK_SIZE]);
        let mut info = self.device_info.write().unwrap();
        info.last_access = Some(Instant::now());
        Ok(BLOCK_SIZE)
    }

    pub fn write_block(&self, block_index: u64, data: &[u8]) -> DriverResult<usize> {
        if block_index >= self.block_count || data.len() != BLOCK_SIZE {
            return Err(DriverError::OutOfBounds);
        }
        let offset = (block_index as usize) * BLOCK_SIZE;
        let mut storage = self.storage.lock().unwrap();
        storage[offset..offset + BLOCK_SIZE].copy_from_slice(data);
        let mut info = self.device_info.write().unwrap();
        info.last_access = Some(Instant::now());
        Ok(BLOCK_SIZE)
    }

    /// Example ioctl for block device (get info, flush, etc.)
    pub fn ioctl(&self, cmd: u32) -> DriverResult<usize> {
        match cmd {
            0x2001 => { // GET_BLOCK_COUNT
                let info = self.device_info.read().unwrap();
                Ok(info.block_count as usize)
            }
            0x2002 => { // GET_BLOCK_SIZE
                let info = self.device_info.read().unwrap();
                Ok(info.block_size)
            }
            0x2003 => { // FLUSH (no-op for memory-backed)
                Ok(0)
            }
            _ => Err(DriverError::NotSupported),
        }
    }

    pub fn get_device_info(&self) -> BlockDeviceInfo {
        self.device_info.read().unwrap().clone()
    }
}
```

**Code Explanation**: This example demonstrates a block device driver implementation:

- **`BlockDeviceDriver` struct**: Represents a block device with major/minor numbers and internal state
- **`buffer: Arc<Mutex<VecDeque<u8>>>`**: Thread-safe circular buffer for storing data
- **`open_count`**: Tracks how many times the device has been opened
- **`open()`/`close()`**: Manage device open/close operations and update counters
- **`read()`/`write()`**: Handle data transfer operations with the device buffer
- **`ioctl()`**: Provides device-specific control operations (get info, flush, etc.)
- **`DeviceInfo`**: Stores metadata about the device including access times and open count

**Why this works**: This block device driver provides:

- **Thread safety**: All operations are protected by mutexes
- **State tracking**: Monitors device usage and access patterns
- **Standard interface**: Implements the standard open/close/read/write/ioctl interface
- **Flexible control**: Supports device-specific operations through ioctl

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
