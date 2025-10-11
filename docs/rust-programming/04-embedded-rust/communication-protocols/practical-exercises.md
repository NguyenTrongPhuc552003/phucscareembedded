---
sidebar_position: 3
---

# Practical Exercises: Communication Protocols

Apply your knowledge of UART, I2C, and SPI communication protocols in embedded Rust with hands-on exercises using the 4W+H framework.

## Exercise 1: UART Command-Line Interface

### What is a UART Command-Line Interface?

**What**: A UART command-line interface (CLI) provides a text-based interface for controlling and monitoring embedded systems through serial communication.

**Why**: Understanding UART CLI implementation is important because:

- **System control** enables remote control of embedded systems
- **Debugging support** provides real-time system monitoring
- **Configuration management** allows runtime parameter adjustment
- **Data logging** supports system data collection and analysis
- **User interaction** creates intuitive system interfaces
- **Development tools** facilitates embedded system development

**When**: Use UART CLI when you need to:

- Create debugging interfaces for embedded systems
- Implement remote control functionality
- Build configuration interfaces
- Develop data logging systems
- Create user-friendly system interfaces
- Build development and testing tools

**How**: Here's how to implement a UART command-line interface:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// CLI command structure
pub struct CliCommand {
    pub name: &'static str,
    pub description: &'static str,
    pub handler: fn(&[&str]) -> CliResult,
    pub min_args: usize,
    pub max_args: usize,
}

// CLI result
pub enum CliResult {
    Success(String),
    Error(String),
    Help(String),
}

// CLI parser
pub struct CliParser {
    commands: [Option<CliCommand>; 16],
    command_count: usize,
    initialized: bool,
    prompt: &'static str,
    buffer: [u8; 256],
    buffer_index: usize,
    line_ready: bool,
}

impl CliParser {
    pub fn new() -> Self {
        Self {
            commands: [None; 16],
            command_count: 0,
            initialized: false,
            prompt: "> ",
            buffer: [0; 256],
            buffer_index: 0,
            line_ready: false,
        }
    }

    pub fn initialize(&mut self) -> Result<(), CliError> {
        // Register default commands
        self.register_command(CliCommand {
            name: "help",
            description: "Show available commands",
            handler: help_command,
            min_args: 0,
            max_args: 1,
        });

        self.register_command(CliCommand {
            name: "version",
            description: "Show system version",
            handler: version_command,
            min_args: 0,
            max_args: 0,
        });

        self.register_command(CliCommand {
            name: "status",
            description: "Show system status",
            handler: status_command,
            min_args: 0,
            max_args: 0,
        });

        self.register_command(CliCommand {
            name: "reset",
            description: "Reset system",
            handler: reset_command,
            min_args: 0,
            max_args: 0,
        });

        self.initialized = true;
        Ok(())
    }

    pub fn register_command(&mut self, command: CliCommand) -> Result<(), CliError> {
        if self.command_count >= 16 {
            return Err(CliError::TooManyCommands);
        }

        self.commands[self.command_count] = Some(command);
        self.command_count += 1;

        Ok(())
    }

    pub fn process_input(&mut self, byte: u8) -> Result<Option<CliResult>, CliError> {
        if !self.initialized {
            return Err(CliError::NotInitialized);
        }

        match byte {
            b'\r' | b'\n' => {
                if self.buffer_index > 0 {
                    self.line_ready = true;
                    return self.process_line();
                }
            }
            b'\x08' | b'\x7F' => {  // Backspace
                if self.buffer_index > 0 {
                    self.buffer_index -= 1;
                    self.buffer[self.buffer_index] = 0;
                }
            }
            b'\x03' => {  // Ctrl+C
                self.clear_buffer();
                return Ok(Some(CliResult::Success("Command cancelled".to_string())));
            }
            _ => {
                if self.buffer_index < 255 && byte >= 32 && byte <= 126 {
                    self.buffer[self.buffer_index] = byte;
                    self.buffer_index += 1;
                }
            }
        }

        Ok(None)
    }

    fn process_line(&mut self) -> Result<Option<CliResult>, CliError> {
        let line = core::str::from_utf8(&self.buffer[..self.buffer_index])
            .map_err(|_| CliError::InvalidUtf8)?;

        let args: Vec<&str> = line.trim().split_whitespace().collect();

        if args.is_empty() {
            self.clear_buffer();
            return Ok(Some(CliResult::Success(String::new())));
        }

        let command_name = args[0];
        let command_args = &args[1..];

        // Find and execute command
        for i in 0..self.command_count {
            if let Some(command) = &self.commands[i] {
                if command.name == command_name {
                    // Validate argument count
                    if command_args.len() < command.min_args || command_args.len() > command.max_args {
                        self.clear_buffer();
                        return Ok(Some(CliResult::Error(format!(
                            "Usage: {} ({} arguments required)",
                            command.name,
                            if command.min_args == command.max_args {
                                command.min_args.to_string()
                            } else {
                                format!("{}-{}", command.min_args, command.max_args)
                            }
                        ))));
                    }

                    // Execute command
                    let result = (command.handler)(command_args);
                    self.clear_buffer();
                    return Ok(Some(result));
                }
            }
        }

        // Command not found
        self.clear_buffer();
        Ok(Some(CliResult::Error(format!("Unknown command: {}", command_name))))
    }

    fn clear_buffer(&mut self) {
        self.buffer_index = 0;
        self.buffer.fill(0);
        self.line_ready = false;
    }

    pub fn get_prompt(&self) -> &str {
        self.prompt
    }

    pub fn is_line_ready(&self) -> bool {
        self.line_ready
    }

    pub fn get_buffer(&self) -> &[u8] {
        &self.buffer[..self.buffer_index]
    }
}

// Command handlers
fn help_command(args: &[&str]) -> CliResult {
    if args.len() > 0 {
        // Show help for specific command
        CliResult::Help(format!("Help for command: {}", args[0]))
    } else {
        // Show all commands
        CliResult::Help("Available commands:\n  help - Show available commands\n  version - Show system version\n  status - Show system status\n  reset - Reset system".to_string())
    }
}

fn version_command(_args: &[&str]) -> CliResult {
    CliResult::Success("System Version: 1.0.0\nBuild Date: 2024-01-01\nRust Version: 1.70.0".to_string())
}

fn status_command(_args: &[&str]) -> CliResult {
    CliResult::Success("System Status:\n  CPU: Running\n  Memory: OK\n  UART: Active\n  I2C: Ready\n  SPI: Ready".to_string())
}

fn reset_command(_args: &[&str]) -> CliResult {
    CliResult::Success("System reset initiated...".to_string())
}

// Error type
#[derive(Debug)]
pub enum CliError {
    NotInitialized,
    TooManyCommands,
    InvalidUtf8,
    CommandNotFound,
    InvalidArguments,
}

// Global CLI parser
static mut CLI_PARSER: CliParser = CliParser {
    commands: [None; 16],
    command_count: 0,
    initialized: false,
    prompt: "> ",
    buffer: [0; 256],
    buffer_index: 0,
    line_ready: false,
};

// UART CLI implementation
pub struct UartCli {
    uart: Uart,
    parser: CliParser,
    initialized: bool,
}

impl UartCli {
    pub fn new() -> Self {
        Self {
            uart: Uart::new(),
            parser: CliParser::new(),
            initialized: false,
        }
    }

    pub fn initialize(&mut self, uart_config: UartConfig) -> Result<(), CliError> {
        // Initialize UART
        self.uart.initialize(uart_config)?;

        // Initialize CLI parser
        self.parser.initialize()?;

        // Send welcome message
        self.send_welcome_message();

        self.initialized = true;
        Ok(())
    }

    pub fn process(&mut self) -> Result<(), CliError> {
        if !self.initialized {
            return Err(CliError::NotInitialized);
        }

        // Read UART data
        while let Some(byte) = self.uart.read_byte()? {
            // Process input
            if let Some(result) = self.parser.process_input(byte)? {
                self.handle_result(result);
            }
        }

        Ok(())
    }

    fn send_welcome_message(&mut self) {
        let _ = self.uart.write_string("Embedded Rust CLI v1.0.0\n");
        let _ = self.uart.write_string("Type 'help' for available commands\n");
        let _ = self.uart.write_string(self.parser.get_prompt());
    }

    fn handle_result(&mut self, result: CliResult) {
        match result {
            CliResult::Success(message) => {
                if !message.is_empty() {
                    let _ = self.uart.write_string(&message);
                    let _ = self.uart.write_string("\n");
                }
                let _ = self.uart.write_string(self.parser.get_prompt());
            }
            CliResult::Error(message) => {
                let _ = self.uart.write_string("Error: ");
                let _ = self.uart.write_string(&message);
                let _ = self.uart.write_string("\n");
                let _ = self.uart.write_string(self.parser.get_prompt());
            }
            CliResult::Help(message) => {
                let _ = self.uart.write_string(&message);
                let _ = self.uart.write_string("\n");
                let _ = self.uart.write_string(self.parser.get_prompt());
            }
        }
    }

    pub fn send_message(&mut self, message: &str) -> Result<(), CliError> {
        if !self.initialized {
            return Err(CliError::NotInitialized);
        }

        self.uart.write_string(message)?;
        self.uart.write_string("\n")?;
        self.uart.write_string(self.parser.get_prompt())?;

        Ok(())
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }
}

// Example usage
fn main() {
    // Initialize UART CLI
    let mut cli = UartCli::new();

    let uart_config = UartConfig {
        baud_rate: 115200,
        data_bits: UartDataBits::Bits8,
        parity: UartParity::None,
        stop_bits: UartStopBits::One,
        flow_control: UartFlowControl::None,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = cli.initialize(uart_config);

    // Main application loop
    loop {
        // Process CLI
        let _ = cli.process();

        // Process application logic
        process_application_logic();
    }
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **Command parsing** processes user input and executes commands
- **Command registration** allows adding new commands dynamically
- **Error handling** manages invalid commands and arguments
- **UART integration** provides serial communication interface
- **User interface** creates intuitive command-line experience

**Why**: UART CLI implementation enables remote control and debugging of embedded systems through serial communication.

## Exercise 2: I2C Sensor Network

### What is an I2C Sensor Network?

**What**: An I2C sensor network connects multiple sensors to a microcontroller using the I2C protocol, enabling centralized data collection and processing.

**Why**: Understanding I2C sensor networks is important because:

- **Multi-sensor support** enables data collection from multiple sources
- **Scalable architecture** supports system expansion with additional sensors
- **Centralized processing** facilitates data analysis and decision making
- **Low power consumption** enables efficient sensor operation
- **System integration** connects sensors with other system components
- **Data logging** supports comprehensive system monitoring

**When**: Use I2C sensor networks when you need to:

- Monitor multiple environmental parameters
- Implement sensor fusion applications
- Create data logging systems
- Build IoT sensor nodes
- Develop monitoring systems
- Create sensor-based control systems

**How**: Here's how to implement an I2C sensor network:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Sensor types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SensorType {
    Temperature,
    Humidity,
    Pressure,
    Light,
    Accelerometer,
    Gyroscope,
    Magnetometer,
    Gas,
}

// Sensor data
pub struct SensorData {
    pub sensor_type: SensorType,
    pub value: f32,
    pub unit: &'static str,
    pub timestamp: u32,
    pub quality: u8,  // 0-100
}

// Sensor configuration
pub struct SensorConfig {
    pub address: u16,
    pub sensor_type: SensorType,
    pub update_interval_ms: u32,
    pub enabled: bool,
    pub calibration_data: [f32; 4],
}

// Sensor network
pub struct SensorNetwork {
    sensors: [Option<SensorConfig>; 16],
    sensor_count: usize,
    initialized: bool,
    i2c: I2c,
    data_buffer: [SensorData; 16],
    data_count: usize,
    last_update: u32,
    update_interval: u32,
}

impl SensorNetwork {
    pub fn new() -> Self {
        Self {
            sensors: [None; 16],
            sensor_count: 0,
            initialized: false,
            i2c: I2c::new(),
            data_buffer: [SensorData {
                sensor_type: SensorType::Temperature,
                value: 0.0,
                unit: "",
                timestamp: 0,
                quality: 0,
            }; 16],
            data_count: 0,
            last_update: 0,
            update_interval: 1000,  // 1 second
        }
    }

    pub fn initialize(&mut self, i2c_config: I2cConfig) -> Result<(), SensorError> {
        // Initialize I2C
        self.i2c.initialize(i2c_config)?;

        // Scan for sensors
        self.scan_sensors()?;

        self.initialized = true;
        Ok(())
    }

    pub fn add_sensor(&mut self, config: SensorConfig) -> Result<(), SensorError> {
        if self.sensor_count >= 16 {
            return Err(SensorError::TooManySensors);
        }

        // Validate sensor address
        if config.address == 0 || config.address > 127 {
            return Err(SensorError::InvalidAddress);
        }

        // Check if address is already used
        for i in 0..self.sensor_count {
            if let Some(sensor) = &self.sensors[i] {
                if sensor.address == config.address {
                    return Err(SensorError::AddressInUse);
                }
            }
        }

        // Add sensor
        self.sensors[self.sensor_count] = Some(config);
        self.sensor_count += 1;

        Ok(())
    }

    pub fn remove_sensor(&mut self, address: u16) -> Result<(), SensorError> {
        for i in 0..self.sensor_count {
            if let Some(sensor) = &self.sensors[i] {
                if sensor.address == address {
                    // Remove sensor
                    self.sensors[i] = None;

                    // Shift remaining sensors
                    for j in i..self.sensor_count - 1 {
                        self.sensors[j] = self.sensors[j + 1];
                    }

                    self.sensor_count -= 1;
                    return Ok(());
                }
            }
        }

        Err(SensorError::SensorNotFound)
    }

    pub fn update_sensors(&mut self) -> Result<(), SensorError> {
        if !self.initialized {
            return Err(SensorError::NotInitialized);
        }

        let current_time = self.get_system_time();

        // Check if it's time to update
        if current_time - self.last_update < self.update_interval {
            return Ok(());
        }

        self.data_count = 0;

        // Update each sensor
        for i in 0..self.sensor_count {
            if let Some(sensor) = &self.sensors[i] {
                if sensor.enabled {
                    if let Ok(data) = self.read_sensor_data(sensor) {
                        self.data_buffer[self.data_count] = data;
                        self.data_count += 1;
                    }
                }
            }
        }

        self.last_update = current_time;
        Ok(())
    }

    pub fn get_sensor_data(&self, sensor_type: SensorType) -> Option<&SensorData> {
        for i in 0..self.data_count {
            if self.data_buffer[i].sensor_type == sensor_type {
                return Some(&self.data_buffer[i]);
            }
        }
        None
    }

    pub fn get_all_sensor_data(&self) -> &[SensorData] {
        &self.data_buffer[..self.data_count]
    }

    pub fn get_sensor_count(&self) -> usize {
        self.sensor_count
    }

    pub fn get_enabled_sensor_count(&self) -> usize {
        let mut count = 0;
        for i in 0..self.sensor_count {
            if let Some(sensor) = &self.sensors[i] {
                if sensor.enabled {
                    count += 1;
                }
            }
        }
        count
    }

    fn scan_sensors(&mut self) -> Result<(), SensorError> {
        // Scan I2C bus for devices
        let devices = self.i2c.scan_bus()?;

        // Try to identify sensors
        for device in devices {
            if let Some(sensor_type) = self.identify_sensor(device) {
                let config = SensorConfig {
                    address: device,
                    sensor_type,
                    update_interval_ms: 1000,
                    enabled: true,
                    calibration_data: [0.0; 4],
                };

                let _ = self.add_sensor(config);
            }
        }

        Ok(())
    }

    fn identify_sensor(&self, address: u16) -> Option<SensorType> {
        // Try to read sensor identification
        let mut buffer = [0u8; 4];
        if let Ok(len) = self.i2c.read(address, &mut buffer) {
            if len > 0 {
                // Check for known sensor signatures
                match address {
                    0x48 => Some(SensorType::Temperature),  // LM75
                    0x40 => Some(SensorType::Humidity),      // SHT30
                    0x76 => Some(SensorType::Pressure),      // BMP280
                    0x29 => Some(SensorType::Light),        // TSL2561
                    0x68 => Some(SensorType::Accelerometer), // MPU6050
                    _ => None,
                }
            } else {
                None
            }
        } else {
            None
        }
    }

    fn read_sensor_data(&self, sensor: &SensorConfig) -> Result<SensorData, SensorError> {
        let mut buffer = [0u8; 8];
        let mut data = SensorData {
            sensor_type: sensor.sensor_type,
            value: 0.0,
            unit: "",
            timestamp: self.get_system_time(),
            quality: 100,
        };

        match sensor.sensor_type {
            SensorType::Temperature => {
                if let Ok(len) = self.i2c.read(sensor.address, &mut buffer) {
                    if len >= 2 {
                        // Convert raw data to temperature
                        let raw_temp = ((buffer[0] as u16) << 8) | (buffer[1] as u16);
                        data.value = self.convert_temperature(raw_temp, &sensor.calibration_data);
                        data.unit = "°C";
                    }
                }
            }
            SensorType::Humidity => {
                if let Ok(len) = self.i2c.read(sensor.address, &mut buffer) {
                    if len >= 2 {
                        // Convert raw data to humidity
                        let raw_humidity = ((buffer[0] as u16) << 8) | (buffer[1] as u16);
                        data.value = self.convert_humidity(raw_humidity, &sensor.calibration_data);
                        data.unit = "%";
                    }
                }
            }
            SensorType::Pressure => {
                if let Ok(len) = self.i2c.read(sensor.address, &mut buffer) {
                    if len >= 3 {
                        // Convert raw data to pressure
                        let raw_pressure = ((buffer[0] as u32) << 16) | ((buffer[1] as u32) << 8) | (buffer[2] as u32);
                        data.value = self.convert_pressure(raw_pressure, &sensor.calibration_data);
                        data.unit = "hPa";
                    }
                }
            }
            _ => {
                // Generic sensor reading
                if let Ok(len) = self.i2c.read(sensor.address, &mut buffer) {
                    if len > 0 {
                        data.value = buffer[0] as f32;
                        data.unit = "raw";
                    }
                }
            }
        }

        Ok(data)
    }

    fn convert_temperature(&self, raw: u16, calibration: &[f32; 4]) -> f32 {
        // Temperature conversion with calibration
        let temp = (raw as f32) * 0.1;  // Basic conversion
        temp + calibration[0] + calibration[1] * temp + calibration[2] * temp * temp
    }

    fn convert_humidity(&self, raw: u16, calibration: &[f32; 4]) -> f32 {
        // Humidity conversion with calibration
        let humidity = (raw as f32) * 0.1;  // Basic conversion
        humidity + calibration[0] + calibration[1] * humidity
    }

    fn convert_pressure(&self, raw: u32, calibration: &[f32; 4]) -> f32 {
        // Pressure conversion with calibration
        let pressure = (raw as f32) * 0.01;  // Basic conversion
        pressure + calibration[0] + calibration[1] * pressure
    }

    fn get_system_time(&self) -> u32 {
        // Hardware-specific system time
        0
    }
}

// Error type
#[derive(Debug)]
pub enum SensorError {
    NotInitialized,
    TooManySensors,
    InvalidAddress,
    AddressInUse,
    SensorNotFound,
    I2cError(I2cError),
    ReadError,
    ConversionError,
}

impl From<I2cError> for SensorError {
    fn from(error: I2cError) -> Self {
        SensorError::I2cError(error)
    }
}

// Example usage
fn main() {
    // Initialize sensor network
    let mut network = SensorNetwork::new();

    let i2c_config = I2cConfig {
        clock_speed: 100_000,
        addressing_mode: I2cAddressingMode::SevenBit,
        timeout_ms: 1000,
        interrupt_enabled: true,
        dma_enabled: false,
    };

    let _ = network.initialize(i2c_config);

    // Main application loop
    loop {
        // Update sensors
        let _ = network.update_sensors();

        // Process sensor data
        let sensor_data = network.get_all_sensor_data();
        for data in sensor_data {
            process_sensor_data(data);
        }

        // Process application logic
        process_application_logic();
    }
}

fn process_sensor_data(data: &SensorData) {
    // Process sensor data
    // - Log data
    // - Update system state
    // - Trigger actions
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **Sensor management** handles multiple sensors on I2C bus
- **Data collection** reads sensor data with calibration
- **Network scanning** automatically discovers sensors
- **Data processing** converts raw sensor data to meaningful values
- **Error handling** manages sensor communication errors

**Why**: I2C sensor networks enable comprehensive environmental monitoring with multiple sensors on a single bus.

## Exercise 3: SPI Display Driver

### What is an SPI Display Driver?

**What**: An SPI display driver provides a high-level interface for controlling displays (LCD, OLED, etc.) using the SPI communication protocol.

**Why**: Understanding SPI display drivers is important because:

- **Display control** enables visual output from embedded systems
- **High performance** supports fast display updates
- **User interface** creates interactive system interfaces
- **Data visualization** presents sensor data and system information
- **System integration** connects displays with other system components
- **User experience** enhances system usability

**When**: Use SPI display drivers when you need to:

- Create user interfaces for embedded systems
- Display sensor data and system information
- Implement data visualization
- Build interactive systems
- Create status displays
- Develop monitoring interfaces

**How**: Here's how to implement an SPI display driver:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::sync::atomic::{AtomicU32, Ordering};

// Display types
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum DisplayType {
    Lcd,
    Oled,
    Tft,
    Eink,
}

// Display resolution
pub struct DisplayResolution {
    pub width: u16,
    pub height: u16,
    pub color_depth: u8,
}

// Color representation
pub struct Color {
    pub red: u8,
    pub green: u8,
    pub blue: u8,
}

// Display configuration
pub struct DisplayConfig {
    pub display_type: DisplayType,
    pub resolution: DisplayResolution,
    pub spi_config: SpiConfig,
    pub cs_pin: u8,
    pub dc_pin: u8,
    pub rst_pin: u8,
    pub backlight_pin: u8,
}

// Display driver
pub struct DisplayDriver {
    config: DisplayConfig,
    spi: Spi,
    initialized: bool,
    current_x: u16,
    current_y: u16,
    font_size: u8,
    background_color: Color,
    foreground_color: Color,
    buffer: [u8; 8192],  // Display buffer
    buffer_dirty: bool,
}

impl DisplayDriver {
    pub fn new() -> Self {
        Self {
            config: DisplayConfig {
                display_type: DisplayType::Oled,
                resolution: DisplayResolution {
                    width: 128,
                    height: 64,
                    color_depth: 1,
                },
                spi_config: SpiConfig {
                    clock_speed: 10_000_000,
                    mode: SpiMode::Mode0,
                    bit_order: SpiBitOrder::MsbFirst,
                    cs_polarity: SpiCsPolarity::ActiveLow,
                    timeout_ms: 1000,
                    interrupt_enabled: true,
                    dma_enabled: false,
                },
                cs_pin: 0,
                dc_pin: 1,
                rst_pin: 2,
                backlight_pin: 3,
            },
            spi: Spi::new(),
            initialized: false,
            current_x: 0,
            current_y: 0,
            font_size: 8,
            background_color: Color { red: 0, green: 0, blue: 0 },
            foreground_color: Color { red: 255, green: 255, blue: 255 },
            buffer: [0; 8192],
            buffer_dirty: false,
        }
    }

    pub fn initialize(&mut self, config: DisplayConfig) -> Result<(), DisplayError> {
        // Store configuration
        self.config = config;

        // Initialize SPI
        self.spi.initialize(self.config.spi_config)?;

        // Hardware-specific initialization
        self.hardware_initialize();

        // Clear display
        self.clear();
        self.update();

        self.initialized = true;
        Ok(())
    }

    pub fn clear(&mut self) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        // Clear buffer
        self.buffer.fill(0);
        self.buffer_dirty = true;

        // Reset cursor position
        self.current_x = 0;
        self.current_y = 0;

        Ok(())
    }

    pub fn set_pixel(&mut self, x: u16, y: u16, color: Color) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        if x >= self.config.resolution.width || y >= self.config.resolution.height {
            return Err(DisplayError::InvalidCoordinates);
        }

        // Set pixel in buffer
        let pixel_index = (y as usize * self.config.resolution.width as usize + x as usize) / 8;
        let bit_index = (y as usize * self.config.resolution.width as usize + x as usize) % 8;

        if color.red > 0 || color.green > 0 || color.blue > 0 {
            self.buffer[pixel_index] |= 1 << (7 - bit_index);
        } else {
            self.buffer[pixel_index] &= !(1 << (7 - bit_index));
        }

        self.buffer_dirty = true;
        Ok(())
    }

    pub fn draw_line(&mut self, x1: u16, y1: u16, x2: u16, y2: u16, color: Color) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        // Bresenham's line algorithm
        let dx = (x2 as i32 - x1 as i32).abs();
        let dy = (y2 as i32 - y1 as i32).abs();
        let sx = if x1 < x2 { 1 } else { -1 };
        let sy = if y1 < y2 { 1 } else { -1 };
        let mut err = dx - dy;

        let mut x = x1 as i32;
        let mut y = y1 as i32;

        loop {
            self.set_pixel(x as u16, y as u16, color)?;

            if x == x2 as i32 && y == y2 as i32 {
                break;
            }

            let e2 = 2 * err;
            if e2 > -dy {
                err -= dy;
                x += sx;
            }
            if e2 < dx {
                err += dx;
                y += sy;
            }
        }

        Ok(())
    }

    pub fn draw_rectangle(&mut self, x: u16, y: u16, width: u16, height: u16, color: Color, filled: bool) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        if filled {
            // Draw filled rectangle
            for py in y..y + height {
                for px in x..x + width {
                    self.set_pixel(px, py, color)?;
                }
            }
        } else {
            // Draw rectangle outline
            self.draw_line(x, y, x + width - 1, y, color)?;
            self.draw_line(x + width - 1, y, x + width - 1, y + height - 1, color)?;
            self.draw_line(x + width - 1, y + height - 1, x, y + height - 1, color)?;
            self.draw_line(x, y + height - 1, x, y, color)?;
        }

        Ok(())
    }

    pub fn draw_text(&mut self, text: &str, x: u16, y: u16, color: Color) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        let mut current_x = x;
        let mut current_y = y;

        for byte in text.bytes() {
            if byte == b'\n' {
                current_x = x;
                current_y += self.font_size as u16;
            } else if byte == b'\r' {
                current_x = x;
            } else {
                // Draw character
                self.draw_character(byte, current_x, current_y, color)?;
                current_x += self.font_size as u16;

                // Check for line wrap
                if current_x >= self.config.resolution.width {
                    current_x = x;
                    current_y += self.font_size as u16;
                }
            }
        }

        Ok(())
    }

    fn draw_character(&mut self, character: u8, x: u16, y: u16, color: Color) -> Result<(), DisplayError> {
        // Simple 8x8 font implementation
        let font_data = self.get_font_data(character);

        for row in 0..8 {
            for col in 0..8 {
                if (font_data[row] & (1 << (7 - col))) != 0 {
                    self.set_pixel(x + col as u16, y + row as u16, color)?;
                }
            }
        }

        Ok(())
    }

    fn get_font_data(&self, character: u8) -> [u8; 8] {
        // Simple 8x8 font data
        match character {
            b'A' => [0x3C, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00],
            b'B' => [0x7C, 0x66, 0x66, 0x7C, 0x66, 0x66, 0x7C, 0x00],
            b'C' => [0x3C, 0x66, 0x60, 0x60, 0x60, 0x66, 0x3C, 0x00],
            b'D' => [0x7C, 0x66, 0x66, 0x66, 0x66, 0x66, 0x7C, 0x00],
            b'E' => [0x7E, 0x60, 0x60, 0x7C, 0x60, 0x60, 0x7E, 0x00],
            b'F' => [0x7E, 0x60, 0x60, 0x7C, 0x60, 0x60, 0x60, 0x00],
            b'G' => [0x3C, 0x66, 0x60, 0x6E, 0x66, 0x66, 0x3C, 0x00],
            b'H' => [0x66, 0x66, 0x66, 0x7E, 0x66, 0x66, 0x66, 0x00],
            b'I' => [0x3C, 0x18, 0x18, 0x18, 0x18, 0x18, 0x3C, 0x00],
            b'J' => [0x1E, 0x0C, 0x0C, 0x0C, 0x0C, 0x6C, 0x38, 0x00],
            b'K' => [0x66, 0x6C, 0x78, 0x70, 0x78, 0x6C, 0x66, 0x00],
            b'L' => [0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x7E, 0x00],
            b'M' => [0x63, 0x77, 0x7F, 0x6B, 0x63, 0x63, 0x63, 0x00],
            b'N' => [0x66, 0x76, 0x7E, 0x7E, 0x6E, 0x66, 0x66, 0x00],
            b'O' => [0x3C, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00],
            b'P' => [0x7C, 0x66, 0x66, 0x7C, 0x60, 0x60, 0x60, 0x00],
            b'Q' => [0x3C, 0x66, 0x66, 0x66, 0x6A, 0x6C, 0x36, 0x00],
            b'R' => [0x7C, 0x66, 0x66, 0x7C, 0x6C, 0x66, 0x66, 0x00],
            b'S' => [0x3C, 0x66, 0x60, 0x3C, 0x06, 0x66, 0x3C, 0x00],
            b'T' => [0x7E, 0x18, 0x18, 0x18, 0x18, 0x18, 0x18, 0x00],
            b'U' => [0x66, 0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x00],
            b'V' => [0x66, 0x66, 0x66, 0x66, 0x66, 0x3C, 0x18, 0x00],
            b'W' => [0x63, 0x63, 0x63, 0x6B, 0x7F, 0x77, 0x63, 0x00],
            b'X' => [0x66, 0x66, 0x3C, 0x18, 0x3C, 0x66, 0x66, 0x00],
            b'Y' => [0x66, 0x66, 0x66, 0x3C, 0x18, 0x18, 0x18, 0x00],
            b'Z' => [0x7E, 0x06, 0x0C, 0x18, 0x30, 0x60, 0x7E, 0x00],
            b'0' => [0x3C, 0x66, 0x6E, 0x76, 0x66, 0x66, 0x3C, 0x00],
            b'1' => [0x18, 0x38, 0x18, 0x18, 0x18, 0x18, 0x7E, 0x00],
            b'2' => [0x3C, 0x66, 0x06, 0x0C, 0x18, 0x30, 0x7E, 0x00],
            b'3' => [0x3C, 0x66, 0x06, 0x1C, 0x06, 0x66, 0x3C, 0x00],
            b'4' => [0x06, 0x0E, 0x1E, 0x36, 0x7F, 0x06, 0x06, 0x00],
            b'5' => [0x7E, 0x60, 0x7C, 0x06, 0x06, 0x66, 0x3C, 0x00],
            b'6' => [0x3C, 0x66, 0x60, 0x7C, 0x66, 0x66, 0x3C, 0x00],
            b'7' => [0x7E, 0x06, 0x0C, 0x18, 0x30, 0x30, 0x30, 0x00],
            b'8' => [0x3C, 0x66, 0x66, 0x3C, 0x66, 0x66, 0x3C, 0x00],
            b'9' => [0x3C, 0x66, 0x66, 0x3E, 0x06, 0x66, 0x3C, 0x00],
            b' ' => [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
            b'.' => [0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x00],
            b',' => [0x00, 0x00, 0x00, 0x00, 0x00, 0x18, 0x18, 0x30],
            b':' => [0x00, 0x00, 0x18, 0x00, 0x00, 0x18, 0x18, 0x00],
            b';' => [0x00, 0x00, 0x18, 0x00, 0x00, 0x18, 0x18, 0x30],
            b'!' => [0x18, 0x18, 0x18, 0x18, 0x00, 0x00, 0x18, 0x00],
            b'?' => [0x3C, 0x66, 0x06, 0x0C, 0x18, 0x00, 0x18, 0x00],
            _ => [0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00],
        }
    }

    pub fn update(&mut self) -> Result<(), DisplayError> {
        if !self.initialized {
            return Err(DisplayError::NotInitialized);
        }

        if !self.buffer_dirty {
            return Ok(());
        }

        // Send buffer to display
        self.hardware_update_display();

        self.buffer_dirty = false;
        Ok(())
    }

    pub fn set_background_color(&mut self, color: Color) {
        self.background_color = color;
    }

    pub fn set_foreground_color(&mut self, color: Color) {
        self.foreground_color = color;
    }

    pub fn set_font_size(&mut self, size: u8) {
        self.font_size = size;
    }

    pub fn get_resolution(&self) -> &DisplayResolution {
        &self.config.resolution
    }

    pub fn is_initialized(&self) -> bool {
        self.initialized
    }

    // Hardware-specific methods (placeholders)
    fn hardware_initialize(&self) {
        // Hardware-specific display initialization
    }

    fn hardware_update_display(&self) {
        // Hardware-specific display update
    }
}

// Error type
#[derive(Debug)]
pub enum DisplayError {
    NotInitialized,
    InvalidCoordinates,
    SpiError(SpiError),
    HardwareError,
    ConfigurationError,
}

impl From<SpiError> for DisplayError {
    fn from(error: SpiError) -> Self {
        DisplayError::SpiError(error)
    }
}

// Example usage
fn main() {
    // Initialize display driver
    let mut display = DisplayDriver::new();

    let config = DisplayConfig {
        display_type: DisplayType::Oled,
        resolution: DisplayResolution {
            width: 128,
            height: 64,
            color_depth: 1,
        },
        spi_config: SpiConfig {
            clock_speed: 10_000_000,
            mode: SpiMode::Mode0,
            bit_order: SpiBitOrder::MsbFirst,
            cs_polarity: SpiCsPolarity::ActiveLow,
            timeout_ms: 1000,
            interrupt_enabled: true,
            dma_enabled: false,
        },
        cs_pin: 0,
        dc_pin: 1,
        rst_pin: 2,
        backlight_pin: 3,
    };

    let _ = display.initialize(config);

    // Main application loop
    loop {
        // Clear display
        let _ = display.clear();

        // Draw text
        let _ = display.draw_text("Hello, World!", 10, 10, Color { red: 255, green: 255, blue: 255 });

        // Draw rectangle
        let _ = display.draw_rectangle(10, 30, 50, 20, Color { red: 255, green: 0, blue: 0 }, false);

        // Draw line
        let _ = display.draw_line(10, 60, 100, 60, Color { red: 0, green: 255, blue: 0 });

        // Update display
        let _ = display.update();

        // Process application logic
        process_application_logic();
    }
}

fn process_application_logic() {
    // Main application logic
}
```

**Explanation**:

- **Display control** provides high-level interface for display operations
- **Graphics primitives** support lines, rectangles, and text rendering
- **Buffer management** handles display updates efficiently
- **Font rendering** supports text display with custom fonts
- **Hardware abstraction** provides platform-independent display interfaces

**Why**: SPI display drivers enable rich visual interfaces for embedded systems with high-performance graphics capabilities.

## Key Takeaways

**What** you've learned about practical exercises for communication protocols:

1. **UART CLI Implementation** - Command-line interface for embedded systems
2. **I2C Sensor Networks** - Multi-sensor data collection and processing
3. **SPI Display Drivers** - High-performance display control and graphics
4. **Protocol Integration** - Combining multiple communication protocols
5. **Real-world Applications** - Practical embedded system implementations
6. **System Design** - Comprehensive embedded system architecture
7. **Performance Optimization** - Efficient communication implementation

**Why** these exercises matter:

- **Practical Skills** - Hands-on experience with embedded programming
- **Real-world Application** - Industry-relevant embedded system development
- **System Integration** - Combining multiple communication protocols
- **User Interface** - Creating intuitive system interfaces
- **Professional Development** - Preparation for embedded systems careers

## Next Steps

Now that you've completed the practical exercises for communication protocols, you've mastered:

- **UART Communication** - Serial communication for debugging and control
- **I2C Communication** - Multi-device sensor networks
- **SPI Communication** - High-speed display and peripheral control
- **Protocol Integration** - Combining multiple communication methods
- **System Design** - Comprehensive embedded system architecture

**Where** to go next: You've completed the entire "04. Embedded Rust Development" chapter! You're now ready to:

- **Apply your knowledge** to real embedded projects
- **Build complex systems** using multiple communication protocols
- **Create professional embedded applications** with Rust
- **Continue learning** advanced embedded programming techniques
- **Start your embedded Rust journey** with confidence!

**Congratulations** on completing the Embedded Rust Development chapter! 🎉
