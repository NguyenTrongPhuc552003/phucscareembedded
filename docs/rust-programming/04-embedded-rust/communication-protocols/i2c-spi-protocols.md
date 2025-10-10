---
sidebar_position: 2
---

# I2C and SPI Protocols

Master I2C (Inter-Integrated Circuit) and SPI (Serial Peripheral Interface) communication protocols in embedded Rust with comprehensive explanations using the 4W+H framework.

## What Are I2C and SPI Protocols in Embedded Systems?

**What**: I2C and SPI are synchronous serial communication protocols that enable data exchange between microcontrollers and peripheral devices using different interface configurations.

**Why**: Understanding I2C and SPI protocols is crucial because:

- **Device communication** enables data exchange with sensors, displays, and other peripherals
- **System integration** connects multiple devices in embedded systems
- **Sensor interfacing** facilitates communication with various sensors and modules
- **Display control** enables communication with LCD, OLED, and other displays
- **Memory interfacing** supports communication with EEPROM, Flash, and other memory devices
- **Modular design** enables scalable system architecture

**When**: Use I2C and SPI protocols when you need to:

- Communicate with sensors and actuators
- Interface with displays and memory devices
- Connect multiple devices in a system
- Implement modular system architecture
- Create device-to-device communication
- Build sensor networks and IoT systems

**How**: I2C and SPI protocols work by:

- **I2C**: Two-wire interface (SDA, SCL) with master-slave architecture and addressing
- **SPI**: Four-wire interface (MOSI, MISO, SCLK, CS) with master-slave architecture
- **Synchronous communication** using shared clock signals
- **Device addressing** enabling multiple devices on the same bus
- **Data transmission** supporting various data formats and speeds
- **Error handling** managing communication errors and timeouts

**Where**: I2C and SPI protocols are used in embedded systems, IoT devices, sensor networks, display systems, memory interfaces, and any application requiring device-to-device communication.

## Understanding I2C Communication

### What is I2C Communication?

**What**: I2C (Inter-Integrated Circuit) is a two-wire synchronous serial communication protocol that enables multiple devices to communicate on the same bus using addressing.

**Why**: Understanding I2C communication is important because:

- **Multi-device support** enables communication with multiple devices on the same bus
- **Simple wiring** requires only two wires (SDA, SCL)
- **Device addressing** supports up to 128 devices on the same bus
- **Low power consumption** enables efficient power management
- **Wide device support** compatible with many sensors and peripherals
- **System scalability** facilitates system expansion

**When**: Use I2C communication when you need to:

- Connect multiple sensors and devices
- Implement low-power applications
- Create scalable system architecture
- Interface with standard I2C devices
- Build sensor networks
- Implement device discovery

**How**: Here's how to implement I2C communication:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// I2C configuration
pub struct I2cConfig {
    pub clock_speed: u32,
    pub addressing_mode: I2cAddressingMode,
    pub timeout_ms: u32,
    pub interrupt_enabled: bool,
    pub dma_enabled: bool,
}

// I2C addressing mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum I2cAddressingMode {
    SevenBit,   // 7-bit addressing (0-127)
    TenBit,     // 10-bit addressing (0-1023)
}

// I2C transaction type
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum I2cTransactionType {
    Write,      // Write transaction
    Read,       // Read transaction
    WriteRead,  // Write followed by read
}

// I2C transaction
pub struct I2cTransaction {
    pub device_address: u16,
    pub transaction_type: I2cTransactionType,
    pub write_data: [u8; 256],
    pub write_length: u8,
    pub read_data: [u8; 256],
    pub read_length: u8,
    pub timeout_ms: u32,
}

// I2C status
pub struct I2cStatus {
    pub bus_busy: bool,
    pub transaction_complete: bool,
    pub error_occurred: bool,
    pub nack_received: bool,
    pub arbitration_lost: bool,
    pub bus_error: bool,
}

// I2C implementation
pub struct I2c {
    config: I2cConfig,
    status: I2cStatus,
    initialized: bool,
    current_transaction: Option<I2cTransaction>,
    tx_count: AtomicU32,
    rx_count: AtomicU32,
    error_count: AtomicU32,
    timeout_count: AtomicU32,
    nack_count: AtomicU32,
}

impl I2c {
    pub fn new() -> Self {
        Self {
            config: I2cConfig {
                clock_speed: 100_000,  // 100 kHz
                addressing_mode: I2cAddressingMode::SevenBit,
                timeout_ms: 1000,
                interrupt_enabled: true,
                dma_enabled: false,
            },
            status: I2cStatus {
                bus_busy: false,
                transaction_complete: false,
                error_occurred: false,
                nack_received: false,
                arbitration_lost: false,
                bus_error: false,
            },
            initialized: false,
            current_transaction: None,
            tx_count: AtomicU32::new(0),
            rx_count: AtomicU32::new(0),
            error_count: AtomicU32::new(0),
            timeout_count: AtomicU32::new(0),
            nack_count: AtomicU32::new(0),
        }
    }

    pub fn initialize(&mut self, config: I2cConfig) -> Result<(), I2cError> {
        // Validate configuration
        if config.clock_speed == 0 {
            return Err(I2cError::InvalidClockSpeed);
        }

        if config.timeout_ms == 0 {
            return Err(I2cError::InvalidTimeout);
        }

        // Store configuration
        self.config = config;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn write(&mut self, device_address: u16, data: &[u8]) -> Result<(), I2cError> {
        if !self.initialized {
            return Err(I2cError::NotInitialized);
        }

        if data.len() > 256 {
            return Err(I2cError::DataTooLong);
        }

        // Create write transaction
        let mut transaction = I2cTransaction {
            device_address,
            transaction_type: I2cTransactionType::Write,
            write_data: [0; 256],
            write_length: data.len() as u8,
            read_data: [0; 256],
            read_length: 0,
            timeout_ms: self.config.timeout_ms,
        };

        // Copy data
        transaction.write_data[..data.len()].copy_from_slice(data);

        // Execute transaction
        self.execute_transaction(transaction)
    }

    pub fn read(&mut self, device_address: u16, buffer: &mut [u8]) -> Result<usize, I2cError> {
        if !self.initialized {
            return Err(I2cError::NotInitialized);
        }

        if buffer.len() > 256 {
            return Err(I2cError::BufferTooSmall);
        }

        // Create read transaction
        let mut transaction = I2cTransaction {
            device_address,
            transaction_type: I2cTransactionType::Read,
            write_data: [0; 256],
            write_length: 0,
            read_data: [0; 256],
            read_length: buffer.len() as u8,
            timeout_ms: self.config.timeout_ms,
        };

        // Execute transaction
        self.execute_transaction(transaction)?;

        // Copy received data
        let received_length = transaction.read_length as usize;
        buffer[..received_length].copy_from_slice(&transaction.read_data[..received_length]);

        Ok(received_length)
    }

    pub fn write_read(&mut self, device_address: u16, write_data: &[u8], read_buffer: &mut [u8]) -> Result<usize, I2cError> {
        if !self.initialized {
            return Err(I2cError::NotInitialized);
        }

        if write_data.len() > 256 || read_buffer.len() > 256 {
            return Err(I2cError::DataTooLong);
        }

        // Create write-read transaction
        let mut transaction = I2cTransaction {
            device_address,
            transaction_type: I2cTransactionType::WriteRead,
            write_data: [0; 256],
            write_length: write_data.len() as u8,
            read_data: [0; 256],
            read_length: read_buffer.len() as u8,
            timeout_ms: self.config.timeout_ms,
        };

        // Copy write data
        transaction.write_data[..write_data.len()].copy_from_slice(write_data);

        // Execute transaction
        self.execute_transaction(transaction)?;

        // Copy received data
        let received_length = transaction.read_length as usize;
        read_buffer[..received_length].copy_from_slice(&transaction.read_data[..received_length]);

        Ok(received_length)
    }

    pub fn scan_bus(&mut self) -> Result<Vec<u16>, I2cError> {
        if !self.initialized {
            return Err(I2cError::NotInitialized);
        }

        let mut devices = Vec::new();

        // Scan 7-bit addresses (0-127)
        for address in 0..128 {
            // Try to write to device
            if self.hardware_scan_address(address as u16) {
                devices.push(address as u16);
            }
        }

        Ok(devices)
    }

    fn execute_transaction(&mut self, mut transaction: I2cTransaction) -> Result<(), I2cError> {
        // Check if bus is busy
        if self.status.bus_busy {
            return Err(I2cError::BusBusy);
        }

        // Set bus busy
        self.status.bus_busy = true;
        self.status.transaction_complete = false;
        self.status.error_occurred = false;

        // Store current transaction
        self.current_transaction = Some(transaction);

        // Start transaction
        self.hardware_start_transaction();

        // Wait for completion or timeout
        let start_time = self.get_system_time();
        while !self.status.transaction_complete && !self.status.error_occurred {
            // Check timeout
            if self.get_system_time() - start_time > self.config.timeout_ms {
                self.timeout_count.fetch_add(1, Ordering::Relaxed);
                self.status.bus_busy = false;
                return Err(I2cError::Timeout);
            }

            // Process transaction
            self.process_transaction();
        }

        // Check for errors
        if self.status.error_occurred {
            self.error_count.fetch_add(1, Ordering::Relaxed);
            self.status.bus_busy = false;
            return Err(I2cError::TransactionFailed);
        }

        // Update counters
        if let Some(ref transaction) = self.current_transaction {
            if transaction.write_length > 0 {
                self.tx_count.fetch_add(transaction.write_length as u32, Ordering::Relaxed);
            }
            if transaction.read_length > 0 {
                self.rx_count.fetch_add(transaction.read_length as u32, Ordering::Relaxed);
            }
        }

        // Clear transaction
        self.current_transaction = None;
        self.status.bus_busy = false;

        Ok(())
    }

    fn process_transaction(&mut self) {
        if let Some(ref mut transaction) = self.current_transaction {
            match transaction.transaction_type {
                I2cTransactionType::Write => {
                    self.process_write_transaction(transaction);
                }
                I2cTransactionType::Read => {
                    self.process_read_transaction(transaction);
                }
                I2cTransactionType::WriteRead => {
                    self.process_write_read_transaction(transaction);
                }
            }
        }
    }

    fn process_write_transaction(&mut self, transaction: &mut I2cTransaction) {
        // Hardware-specific write processing
        self.hardware_process_write(transaction);
    }

    fn process_read_transaction(&mut self, transaction: &mut I2cTransaction) {
        // Hardware-specific read processing
        self.hardware_process_read(transaction);
    }

    fn process_write_read_transaction(&mut self, transaction: &mut I2cTransaction) {
        // Hardware-specific write-read processing
        self.hardware_process_write_read(transaction);
    }

    fn handle_i2c_interrupt(&mut self) {
        // Handle I2C interrupt
        if self.hardware_check_nack() {
            self.status.nack_received = true;
            self.nack_count.fetch_add(1, Ordering::Relaxed);
        }

        if self.hardware_check_arbitration_lost() {
            self.status.arbitration_lost = true;
        }

        if self.hardware_check_bus_error() {
            self.status.bus_error = true;
        }

        // Process current transaction
        self.process_transaction();

        // Check if transaction is complete
        if self.hardware_is_transaction_complete() {
            self.status.transaction_complete = true;
        }
    }

    pub fn get_status(&self) -> &I2cStatus {
        &self.status
    }

    pub fn get_statistics(&self) -> I2cStatistics {
        I2cStatistics {
            tx_count: self.tx_count.load(Ordering::Relaxed),
            rx_count: self.rx_count.load(Ordering::Relaxed),
            error_count: self.error_count.load(Ordering::Relaxed),
            timeout_count: self.timeout_count.load(Ordering::Relaxed),
            nack_count: self.nack_count.load(Ordering::Relaxed),
        }
    }

    pub fn reset_statistics(&mut self) {
        self.tx_count.store(0, Ordering::Relaxed);
        self.rx_count.store(0, Ordering::Relaxed);
        self.error_count.store(0, Ordering::Relaxed);
        self.timeout_count.store(0, Ordering::Relaxed);
        self.nack_count.store(0, Ordering::Relaxed);
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific I2C initialization
    }

    fn hardware_start_transaction(&self) {
        // Hardware-specific transaction start
    }

    fn hardware_scan_address(&self, address: u16) -> bool {
        // Hardware-specific address scan
        false
    }

    fn hardware_process_write(&self, transaction: &I2cTransaction) {
        // Hardware-specific write processing
    }

    fn hardware_process_read(&self, transaction: &I2cTransaction) {
        // Hardware-specific read processing
    }

    fn hardware_process_write_read(&self, transaction: &I2cTransaction) {
        // Hardware-specific write-read processing
    }

    fn hardware_check_nack(&self) -> bool {
        // Hardware-specific NACK check
        false
    }

    fn hardware_check_arbitration_lost(&self) -> bool {
        // Hardware-specific arbitration lost check
        false
    }

    fn hardware_check_bus_error(&self) -> bool {
        // Hardware-specific bus error check
        false
    }

    fn hardware_is_transaction_complete(&self) -> bool {
        // Hardware-specific transaction complete check
        false
    }

    fn get_system_time(&self) -> u32 {
        // Hardware-specific system time
        0
    }
}

// I2C statistics
pub struct I2cStatistics {
    pub tx_count: u32,
    pub rx_count: u32,
    pub error_count: u32,
    pub timeout_count: u32,
    pub nack_count: u32,
}

// Error type
#[derive(Debug)]
pub enum I2cError {
    NotInitialized,
    InvalidClockSpeed,
    InvalidTimeout,
    DataTooLong,
    BufferTooSmall,
    BusBusy,
    TransactionFailed,
    Timeout,
    NackReceived,
    ArbitrationLost,
    BusError,
    HardwareError,
}

// Global I2C instance
static mut I2C: I2c = I2c {
    config: I2cConfig {
        clock_speed: 100_000,
        addressing_mode: I2cAddressingMode::SevenBit,
        timeout_ms: 1000,
        interrupt_enabled: true,
        dma_enabled: false,
    },
    status: I2cStatus {
        bus_busy: false,
        transaction_complete: false,
        error_occurred: false,
        nack_received: false,
        arbitration_lost: false,
        bus_error: false,
    },
    initialized: false,
    current_transaction: None,
    tx_count: AtomicU32::new(0),
    rx_count: AtomicU32::new(0),
    error_count: AtomicU32::new(0),
    timeout_count: AtomicU32::new(0),
    nack_count: AtomicU32::new(0),
};

// I2C interrupt handler
#[no_mangle]
pub extern "C" fn i2c_interrupt_handler() {
    unsafe {
        I2C.handle_i2c_interrupt();
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
    // Initialize I2C
    unsafe {
        let config = I2cConfig {
            clock_speed: 100_000,
            addressing_mode: I2cAddressingMode::SevenBit,
            timeout_ms: 1000,
            interrupt_enabled: true,
            dma_enabled: false,
        };

        let _ = I2C.initialize(config);
    }

    // Main application loop
    loop {
        // Scan I2C bus
        unsafe {
            if let Ok(devices) = I2C.scan_bus() {
                // Process discovered devices
                for device in devices {
                    process_i2c_device(device);
                }
            }
        }

        // Test I2C communication
        unsafe {
            // Write to device
            let data = b"Hello, I2C!";
            let _ = I2C.write(0x48, data);

            // Read from device
            let mut buffer = [0u8; 64];
            if let Ok(len) = I2C.read(0x48, &mut buffer) {
                process_i2c_data(&buffer[..len]);
            }

            // Write-read transaction
            let write_data = b"Command";
            let mut read_buffer = [0u8; 32];
            if let Ok(len) = I2C.write_read(0x48, write_data, &mut read_buffer) {
                process_i2c_response(&read_buffer[..len]);
            }
        }

        // Get statistics
        unsafe {
            let stats = I2C.get_statistics();
            let status = I2C.get_status();
        }

        // Process application logic
        process_application_logic();
    }
}

fn process_i2c_device(device_address: u16) {
    // Process discovered I2C device
}

fn process_i2c_data(data: &[u8]) {
    // Process received I2C data
}

fn process_i2c_response(response: &[u8]) {
    // Process I2C response data
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **I2C configuration** sets up communication parameters
- **Transaction management** handles write, read, and write-read operations
- **Bus scanning** discovers devices on the I2C bus
- **Error handling** manages communication errors gracefully
- **Hardware abstraction** provides platform-independent I2C interfaces

**Why**: I2C communication enables efficient multi-device communication with minimal wiring requirements.

## Understanding SPI Communication

### What is SPI Communication?

**What**: SPI (Serial Peripheral Interface) is a four-wire synchronous serial communication protocol that enables high-speed data exchange between master and slave devices.

**Why**: Understanding SPI communication is important because:

- **High speed** enables fast data transmission
- **Full duplex** supports simultaneous bidirectional communication
- **Simple protocol** provides straightforward communication
- **Wide device support** compatible with many peripherals
- **Low latency** enables real-time communication
- **System integration** facilitates device integration

**When**: Use SPI communication when you need to:

- Interface with high-speed devices
- Implement real-time communication
- Connect displays and memory devices
- Create high-performance systems
- Interface with sensors requiring fast data rates
- Implement data logging systems

**How**: Here's how to implement SPI communication:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// SPI configuration
pub struct SpiConfig {
    pub clock_speed: u32,
    pub mode: SpiMode,
    pub bit_order: SpiBitOrder,
    pub cs_polarity: SpiCsPolarity,
    pub timeout_ms: u32,
    pub interrupt_enabled: bool,
    pub dma_enabled: bool,
}

// SPI mode
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SpiMode {
    Mode0,  // CPOL=0, CPHA=0
    Mode1,  // CPOL=0, CPHA=1
    Mode2,  // CPOL=1, CPHA=0
    Mode3,  // CPOL=1, CPHA=1
}

// SPI bit order
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SpiBitOrder {
    MsbFirst,   // Most significant bit first
    LsbFirst,   // Least significant bit first
}

// SPI CS polarity
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SpiCsPolarity {
    ActiveLow,  // CS active low
    ActiveHigh, // CS active high
}

// SPI transaction
pub struct SpiTransaction {
    pub cs_pin: u8,
    pub write_data: [u8; 256],
    pub write_length: u16,
    pub read_data: [u8; 256],
    pub read_length: u16,
    pub timeout_ms: u32,
}

// SPI status
pub struct SpiStatus {
    pub bus_busy: bool,
    pub transaction_complete: bool,
    pub error_occurred: bool,
    pub overrun_error: bool,
    pub underrun_error: bool,
    pub frame_error: bool,
}

// SPI implementation
pub struct Spi {
    config: SpiConfig,
    status: SpiStatus,
    initialized: bool,
    current_transaction: Option<SpiTransaction>,
    tx_count: AtomicU32,
    rx_count: AtomicU32,
    error_count: AtomicU32,
    timeout_count: AtomicU32,
    overrun_count: AtomicU32,
    underrun_count: AtomicU32,
}

impl Spi {
    pub fn new() -> Self {
        Self {
            config: SpiConfig {
                clock_speed: 1_000_000,  // 1 MHz
                mode: SpiMode::Mode0,
                bit_order: SpiBitOrder::MsbFirst,
                cs_polarity: SpiCsPolarity::ActiveLow,
                timeout_ms: 1000,
                interrupt_enabled: true,
                dma_enabled: false,
            },
            status: SpiStatus {
                bus_busy: false,
                transaction_complete: false,
                error_occurred: false,
                overrun_error: false,
                underrun_error: false,
                frame_error: false,
            },
            initialized: false,
            current_transaction: None,
            tx_count: AtomicU32::new(0),
            rx_count: AtomicU32::new(0),
            error_count: AtomicU32::new(0),
            timeout_count: AtomicU32::new(0),
            overrun_count: AtomicU32::new(0),
            underrun_count: AtomicU32::new(0),
        }
    }

    pub fn initialize(&mut self, config: SpiConfig) -> Result<(), SpiError> {
        // Validate configuration
        if config.clock_speed == 0 {
            return Err(SpiError::InvalidClockSpeed);
        }

        if config.timeout_ms == 0 {
            return Err(SpiError::InvalidTimeout);
        }

        // Store configuration
        self.config = config;

        // Hardware-specific initialization
        self.hardware_initialize();

        self.initialized = true;
        Ok(())
    }

    pub fn write(&mut self, cs_pin: u8, data: &[u8]) -> Result<(), SpiError> {
        if !self.initialized {
            return Err(SpiError::NotInitialized);
        }

        if data.len() > 256 {
            return Err(SpiError::DataTooLong);
        }

        // Create write transaction
        let mut transaction = SpiTransaction {
            cs_pin,
            write_data: [0; 256],
            write_length: data.len() as u16,
            read_data: [0; 256],
            read_length: 0,
            timeout_ms: self.config.timeout_ms,
        };

        // Copy data
        transaction.write_data[..data.len()].copy_from_slice(data);

        // Execute transaction
        self.execute_transaction(transaction)
    }

    pub fn read(&mut self, cs_pin: u8, buffer: &mut [u8]) -> Result<usize, SpiError> {
        if !self.initialized {
            return Err(SpiError::NotInitialized);
        }

        if buffer.len() > 256 {
            return Err(SpiError::BufferTooSmall);
        }

        // Create read transaction
        let mut transaction = SpiTransaction {
            cs_pin,
            write_data: [0; 256],
            write_length: 0,
            read_data: [0; 256],
            read_length: buffer.len() as u16,
            timeout_ms: self.config.timeout_ms,
        };

        // Execute transaction
        self.execute_transaction(transaction)?;

        // Copy received data
        let received_length = transaction.read_length as usize;
        buffer[..received_length].copy_from_slice(&transaction.read_data[..received_length]);

        Ok(received_length)
    }

    pub fn write_read(&mut self, cs_pin: u8, write_data: &[u8], read_buffer: &mut [u8]) -> Result<usize, SpiError> {
        if !self.initialized {
            return Err(SpiError::NotInitialized);
        }

        if write_data.len() > 256 || read_buffer.len() > 256 {
            return Err(SpiError::DataTooLong);
        }

        // Create write-read transaction
        let mut transaction = SpiTransaction {
            cs_pin,
            write_data: [0; 256],
            write_length: write_data.len() as u16,
            read_data: [0; 256],
            read_length: read_buffer.len() as u16,
            timeout_ms: self.config.timeout_ms,
        };

        // Copy write data
        transaction.write_data[..write_data.len()].copy_from_slice(write_data);

        // Execute transaction
        self.execute_transaction(transaction)?;

        // Copy received data
        let received_length = transaction.read_length as usize;
        read_buffer[..received_length].copy_from_slice(&transaction.read_data[..received_length]);

        Ok(received_length)
    }

    pub fn transfer(&mut self, cs_pin: u8, data: &mut [u8]) -> Result<(), SpiError> {
        if !self.initialized {
            return Err(SpiError::NotInitialized);
        }

        if data.len() > 256 {
            return Err(SpiError::DataTooLong);
        }

        // Create transfer transaction
        let mut transaction = SpiTransaction {
            cs_pin,
            write_data: [0; 256],
            write_length: data.len() as u16,
            read_data: [0; 256],
            read_length: data.len() as u16,
            timeout_ms: self.config.timeout_ms,
        };

        // Copy data
        transaction.write_data[..data.len()].copy_from_slice(data);

        // Execute transaction
        self.execute_transaction(transaction)?;

        // Copy received data back
        data.copy_from_slice(&transaction.read_data[..data.len()]);

        Ok(())
    }

    fn execute_transaction(&mut self, mut transaction: SpiTransaction) -> Result<(), SpiError> {
        // Check if bus is busy
        if self.status.bus_busy {
            return Err(SpiError::BusBusy);
        }

        // Set bus busy
        self.status.bus_busy = true;
        self.status.transaction_complete = false;
        self.status.error_occurred = false;

        // Store current transaction
        self.current_transaction = Some(transaction);

        // Start transaction
        self.hardware_start_transaction();

        // Wait for completion or timeout
        let start_time = self.get_system_time();
        while !self.status.transaction_complete && !self.status.error_occurred {
            // Check timeout
            if self.get_system_time() - start_time > self.config.timeout_ms {
                self.timeout_count.fetch_add(1, Ordering::Relaxed);
                self.status.bus_busy = false;
                return Err(SpiError::Timeout);
            }

            // Process transaction
            self.process_transaction();
        }

        // Check for errors
        if self.status.error_occurred {
            self.error_count.fetch_add(1, Ordering::Relaxed);
            self.status.bus_busy = false;
            return Err(SpiError::TransactionFailed);
        }

        // Update counters
        if let Some(ref transaction) = self.current_transaction {
            if transaction.write_length > 0 {
                self.tx_count.fetch_add(transaction.write_length as u32, Ordering::Relaxed);
            }
            if transaction.read_length > 0 {
                self.rx_count.fetch_add(transaction.read_length as u32, Ordering::Relaxed);
            }
        }

        // Clear transaction
        self.current_transaction = None;
        self.status.bus_busy = false;

        Ok(())
    }

    fn process_transaction(&mut self) {
        if let Some(ref mut transaction) = self.current_transaction {
            // Hardware-specific transaction processing
            self.hardware_process_transaction(transaction);
        }
    }

    fn handle_spi_interrupt(&mut self) {
        // Handle SPI interrupt
        if self.hardware_check_overrun() {
            self.status.overrun_error = true;
            self.overrun_count.fetch_add(1, Ordering::Relaxed);
        }

        if self.hardware_check_underrun() {
            self.status.underrun_error = true;
            self.underrun_count.fetch_add(1, Ordering::Relaxed);
        }

        if self.hardware_check_frame_error() {
            self.status.frame_error = true;
        }

        // Process current transaction
        self.process_transaction();

        // Check if transaction is complete
        if self.hardware_is_transaction_complete() {
            self.status.transaction_complete = true;
        }
    }

    pub fn get_status(&self) -> &SpiStatus {
        &self.status
    }

    pub fn get_statistics(&self) -> SpiStatistics {
        SpiStatistics {
            tx_count: self.tx_count.load(Ordering::Relaxed),
            rx_count: self.rx_count.load(Ordering::Relaxed),
            error_count: self.error_count.load(Ordering::Relaxed),
            timeout_count: self.timeout_count.load(Ordering::Relaxed),
            overrun_count: self.overrun_count.load(Ordering::Relaxed),
            underrun_count: self.underrun_count.load(Ordering::Relaxed),
        }
    }

    pub fn reset_statistics(&mut self) {
        self.tx_count.store(0, Ordering::Relaxed);
        self.rx_count.store(0, Ordering::Relaxed);
        self.error_count.store(0, Ordering::Relaxed);
        self.timeout_count.store(0, Ordering::Relaxed);
        self.overrun_count.store(0, Ordering::Relaxed);
        self.underrun_count.store(0, Ordering::Relaxed);
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific SPI initialization
    }

    fn hardware_start_transaction(&self) {
        // Hardware-specific transaction start
    }

    fn hardware_process_transaction(&self, transaction: &SpiTransaction) {
        // Hardware-specific transaction processing
    }

    fn hardware_check_overrun(&self) -> bool {
        // Hardware-specific overrun check
        false
    }

    fn hardware_check_underrun(&self) -> bool {
        // Hardware-specific underrun check
        false
    }

    fn hardware_check_frame_error(&self) -> bool {
        // Hardware-specific frame error check
        false
    }

    fn hardware_is_transaction_complete(&self) -> bool {
        // Hardware-specific transaction complete check
        false
    }

    fn get_system_time(&self) -> u32 {
        // Hardware-specific system time
        0
    }
}

// SPI statistics
pub struct SpiStatistics {
    pub tx_count: u32,
    pub rx_count: u32,
    pub error_count: u32,
    pub timeout_count: u32,
    pub overrun_count: u32,
    pub underrun_count: u32,
}

// Error type
#[derive(Debug)]
pub enum SpiError {
    NotInitialized,
    InvalidClockSpeed,
    InvalidTimeout,
    DataTooLong,
    BufferTooSmall,
    BusBusy,
    TransactionFailed,
    Timeout,
    OverrunError,
    UnderrunError,
    FrameError,
    HardwareError,
}

// Global SPI instance
static mut SPI: Spi = Spi {
    config: SpiConfig {
        clock_speed: 1_000_000,
        mode: SpiMode::Mode0,
        bit_order: SpiBitOrder::MsbFirst,
        cs_polarity: SpiCsPolarity::ActiveLow,
        timeout_ms: 1000,
        interrupt_enabled: true,
        dma_enabled: false,
    },
    status: SpiStatus {
        bus_busy: false,
        transaction_complete: false,
        error_occurred: false,
        overrun_error: false,
        underrun_error: false,
        frame_error: false,
    },
    initialized: false,
    current_transaction: None,
    tx_count: AtomicU32::new(0),
    rx_count: AtomicU32::new(0),
    error_count: AtomicU32::new(0),
    timeout_count: AtomicU32::new(0),
    overrun_count: AtomicU32::new(0),
    underrun_count: AtomicU32::new(0),
};

// SPI interrupt handler
#[no_mangle]
pub extern "C" fn spi_interrupt_handler() {
    unsafe {
        SPI.handle_spi_interrupt();
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
    // Initialize SPI
    unsafe {
        let config = SpiConfig {
            clock_speed: 1_000_000,
            mode: SpiMode::Mode0,
            bit_order: SpiBitOrder::MsbFirst,
            cs_polarity: SpiCsPolarity::ActiveLow,
            timeout_ms: 1000,
            interrupt_enabled: true,
            dma_enabled: false,
        };

        let _ = SPI.initialize(config);
    }

    // Main application loop
    loop {
        // Test SPI communication
        unsafe {
            // Write to device
            let data = b"Hello, SPI!";
            let _ = SPI.write(0, data);

            // Read from device
            let mut buffer = [0u8; 64];
            if let Ok(len) = SPI.read(0, &mut buffer) {
                process_spi_data(&buffer[..len]);
            }

            // Write-read transaction
            let write_data = b"Command";
            let mut read_buffer = [0u8; 32];
            if let Ok(len) = SPI.write_read(0, write_data, &mut read_buffer) {
                process_spi_response(&read_buffer[..len]);
            }

            // Transfer data
            let mut transfer_data = [0x01, 0x02, 0x03, 0x04];
            let _ = SPI.transfer(0, &mut transfer_data);
            process_spi_transfer(&transfer_data);
        }

        // Get statistics
        unsafe {
            let stats = SPI.get_statistics();
            let status = SPI.get_status();
        }

        // Process application logic
        process_application_logic();
    }
}

fn process_spi_data(data: &[u8]) {
    // Process received SPI data
}

fn process_spi_response(response: &[u8]) {
    // Process SPI response data
}

fn process_spi_transfer(data: &[u8]) {
    // Process SPI transfer data
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **SPI configuration** sets up communication parameters
- **Transaction management** handles write, read, and transfer operations
- **Error handling** manages communication errors gracefully
- **Hardware abstraction** provides platform-independent SPI interfaces
- **Statistics tracking** monitors communication performance

**Why**: SPI communication enables high-speed, full-duplex data exchange between devices in embedded systems.

## Key Takeaways

**What** you've learned about I2C and SPI protocols in embedded Rust:

1. **I2C Communication** - Two-wire multi-device communication protocol
2. **SPI Communication** - Four-wire high-speed communication protocol
3. **Device Addressing** - Managing multiple devices on communication buses
4. **Transaction Management** - Handling write, read, and combined operations
5. **Error Handling** - Managing communication errors and timeouts
6. **Hardware Abstraction** - Platform-independent communication interfaces
7. **Performance Optimization** - Efficient communication implementation

**Why** these concepts matter:

- **Device Communication** - Enables data exchange with sensors and peripherals
- **System Integration** - Connects multiple devices in embedded systems
- **Performance** - Provides high-speed communication capabilities
- **Scalability** - Supports system expansion with additional devices
- **Reliability** - Ensures robust communication with error handling

## Next Steps

Now that you understand I2C and SPI protocols, you're ready to learn about:

- **Practical Exercises** - Hands-on communication projects
- **Advanced Embedded Concepts** - More sophisticated embedded programming techniques
- **System Integration** - Combining multiple communication protocols
- **Performance Optimization** - Advanced communication optimization

**Where** to go next: Continue with the next lesson on "Practical Exercises" to apply your communication protocol knowledge!
