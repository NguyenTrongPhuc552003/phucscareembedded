---
sidebar_position: 3
---

# Practical Exercises: no_std Programming

Master `no_std` programming through hands-on exercises with comprehensive explanations using the 4W+H framework.

## Exercise 1: Bare Metal LED Blinker

### What is the LED Blinker Exercise?

**What**: Create a simple program that blinks an LED at regular intervals using `no_std` Rust without any operating system or standard library.

**Why**: This exercise is important because:

- **Foundation building** establishes basic `no_std` programming skills
- **Hardware interaction** teaches direct hardware control
- **Timing concepts** introduces embedded timing and delays
- **Project structure** demonstrates proper `no_std` project organization
- **Debugging skills** develops embedded debugging techniques

**When**: Use this exercise when you need to:

- Learn basic `no_std` programming
- Understand embedded hardware control
- Practice embedded project setup
- Develop timing and delay concepts

**How**: Here's how to implement the LED blinker:

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

// Panic handler for no_std environment
#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    // In a real system, you might:
    // - Blink an LED in a specific pattern
    // - Send error message via UART
    // - Store error information in flash
    loop {
        // Halt execution
        asm!("wfi", options(nomem, nostack));
    }
}

// Entry point for the application
#[no_mangle]
pub extern "C" fn _start() -> ! {
    // Initialize hardware
    initialize_hardware();

    // Main application loop
    loop {
        // Turn LED on
        led_on();
        delay_ms(500);

        // Turn LED off
        led_off();
        delay_ms(500);
    }
}

// Hardware initialization
fn initialize_hardware() {
    // In a real system, this would:
    // - Configure system clocks
    // - Enable GPIO peripherals
    // - Set up GPIO pins for LED control
    // - Configure any other necessary peripherals
}

// LED control functions
fn led_on() {
    // In a real system, this would:
    // - Set GPIO pin high
    // - Write to GPIO output data register
    // - Use HAL functions for safe GPIO control
}

fn led_off() {
    // In a real system, this would:
    // - Set GPIO pin low
    // - Write to GPIO output data register
    // - Use HAL functions for safe GPIO control
}

// Simple delay function
fn delay_ms(ms: u32) {
    // In a real system, this would:
    // - Use a hardware timer
    // - Implement precise timing
    // - Handle different clock frequencies

    // Simple busy-wait delay (not recommended for production)
    for _ in 0..(ms * 1000) {
        asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- `#![no_std]` and `#![no_main]` configure the crate for bare-metal programming
- Custom panic handler provides error handling without standard library
- `_start` function serves as the entry point instead of `main`
- Hardware initialization sets up necessary peripherals
- LED control functions demonstrate basic hardware interaction
- Delay function provides timing control (simplified for educational purposes)

**Why**: This exercise establishes the foundation for `no_std` programming and embedded hardware control.

### Advanced LED Blinker with Patterns

**What**: Extend the basic LED blinker to support different blinking patterns and user interaction.

**Why**: This advanced exercise is important because:

- **Pattern recognition** teaches how to implement different LED patterns
- **State machines** introduces state machine concepts for embedded systems
- **User interaction** demonstrates input handling in embedded systems
- **Code organization** shows how to structure larger embedded applications

**When**: Use this exercise when you need to:

- Learn state machine implementation
- Practice user interaction in embedded systems
- Understand pattern-based programming
- Develop more complex embedded applications

**How**: Here's how to implement the advanced LED blinker:

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

// LED patterns
#[derive(Clone, Copy)]
enum LedPattern {
    Solid,
    Blink,
    FastBlink,
    SlowBlink,
    DoubleBlink,
}

// Application state
struct AppState {
    current_pattern: LedPattern,
    pattern_step: u32,
    button_pressed: bool,
    last_button_state: bool,
}

impl AppState {
    fn new() -> Self {
        Self {
            current_pattern: LedPattern::Blink,
            pattern_step: 0,
            button_pressed: false,
            last_button_state: false,
        }
    }

    fn update_button_state(&mut self, button_state: bool) {
        self.last_button_state = self.button_pressed;
        self.button_pressed = button_state;

        // Detect button press (rising edge)
        if !self.last_button_state && self.button_pressed {
            self.next_pattern();
        }
    }

    fn next_pattern(&mut self) {
        self.current_pattern = match self.current_pattern {
            LedPattern::Solid => LedPattern::Blink,
            LedPattern::Blink => LedPattern::FastBlink,
            LedPattern::FastBlink => LedPattern::SlowBlink,
            LedPattern::SlowBlink => LedPattern::DoubleBlink,
            LedPattern::DoubleBlink => LedPattern::Solid,
        };
        self.pattern_step = 0;
    }

    fn execute_pattern(&mut self) {
        match self.current_pattern {
            LedPattern::Solid => {
                led_on();
            },
            LedPattern::Blink => {
                if self.pattern_step % 100 < 50 {
                    led_on();
                } else {
                    led_off();
                }
            },
            LedPattern::FastBlink => {
                if self.pattern_step % 20 < 10 {
                    led_on();
                } else {
                    led_off();
                }
            },
            LedPattern::SlowBlink => {
                if self.pattern_step % 200 < 100 {
                    led_on();
                } else {
                    led_off();
                }
            },
            LedPattern::DoubleBlink => {
                let cycle = self.pattern_step % 300;
                if (cycle < 50) || (cycle >= 100 && cycle < 150) {
                    led_on();
                } else {
                    led_off();
                }
            },
        }

        self.pattern_step += 1;
    }
}

// Global application state
static mut APP_STATE: AppState = AppState {
    current_pattern: LedPattern::Blink,
    pattern_step: 0,
    button_pressed: false,
    last_button_state: false,
};

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    // Error pattern: rapid blinking
    loop {
        led_on();
        delay_ms(50);
        led_off();
        delay_ms(50);
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    initialize_hardware();

    loop {
        // Read button state
        let button_state = read_button();

        // Update application state
        unsafe {
            APP_STATE.update_button_state(button_state);
            APP_STATE.execute_pattern();
        }

        // Small delay for button debouncing
        delay_ms(10);
    }
}

fn initialize_hardware() {
    // Initialize GPIO for LED and button
    // Configure system clocks
    // Set up interrupt handlers if needed
}

fn read_button() -> bool {
    // In a real system, this would:
    // - Read GPIO input register
    // - Handle button debouncing
    // - Return true if button is pressed
    false // Placeholder
}

fn led_on() {
    // Set LED GPIO pin high
}

fn led_off() {
    // Set LED GPIO pin low
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- `LedPattern` enum defines different LED patterns
- `AppState` struct manages application state and pattern execution
- Button handling includes debouncing and edge detection
- Pattern execution uses state machines for different LED behaviors
- Global state management demonstrates embedded programming patterns

**Why**: This exercise teaches state machine implementation and user interaction in embedded systems.

## Exercise 2: Serial Communication Echo

### What is the Serial Echo Exercise?

**What**: Implement a UART-based echo server that receives characters and sends them back to the sender.

**Why**: This exercise is important because:

- **Communication protocols** teaches serial communication fundamentals
- **Buffer management** introduces data buffering concepts
- **Error handling** demonstrates communication error management
- **Protocol design** shows how to design simple communication protocols

**When**: Use this exercise when you need to:

- Learn serial communication in embedded systems
- Understand UART programming
- Practice buffer management
- Develop communication protocols

**How**: Here's how to implement the serial echo:

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

// UART configuration
struct UartConfig {
    baud_rate: u32,
    data_bits: u8,
    stop_bits: u8,
    parity: Parity,
}

#[derive(Clone, Copy)]
enum Parity {
    None,
    Even,
    Odd,
}

// UART driver (simplified)
struct UartDriver {
    config: UartConfig,
    tx_buffer: [u8; 64],
    rx_buffer: [u8; 64],
    tx_head: usize,
    tx_tail: usize,
    rx_head: usize,
    rx_tail: usize,
}

impl UartDriver {
    fn new(config: UartConfig) -> Self {
        Self {
            config,
            tx_buffer: [0; 64],
            tx_head: 0,
            tx_tail: 0,
            rx_buffer: [0; 64],
            rx_head: 0,
            rx_tail: 0,
        }
    }

    fn initialize(&mut self) {
        // Initialize UART hardware
        // Configure baud rate, data bits, stop bits, parity
        // Enable UART interrupts
    }

    fn write_byte(&mut self, byte: u8) -> Result<(), UartError> {
        if self.tx_buffer_full() {
            return Err(UartError::BufferFull);
        }

        self.tx_buffer[self.tx_head] = byte;
        self.tx_head = (self.tx_head + 1) % self.tx_buffer.len();

        // Start transmission if not already transmitting
        self.start_transmission();
        Ok(())
    }

    fn read_byte(&mut self) -> Option<u8> {
        if self.rx_buffer_empty() {
            return None;
        }

        let byte = self.rx_buffer[self.rx_tail];
        self.rx_tail = (self.rx_tail + 1) % self.rx_buffer.len();
        Some(byte)
    }

    fn write_string(&mut self, s: &str) -> Result<(), UartError> {
        for &byte in s.as_bytes() {
            self.write_byte(byte)?;
        }
        Ok(())
    }

    fn tx_buffer_full(&self) -> bool {
        (self.tx_head + 1) % self.tx_buffer.len() == self.tx_tail
    }

    fn rx_buffer_empty(&self) -> bool {
        self.rx_head == self.rx_tail
    }

    fn start_transmission(&mut self) {
        // Start UART transmission
        // Enable transmit interrupt
    }

    fn handle_tx_interrupt(&mut self) {
        // Handle transmit interrupt
        // Send next byte from buffer
        // Disable interrupt when buffer is empty
    }

    fn handle_rx_interrupt(&mut self, byte: u8) {
        // Handle receive interrupt
        // Store received byte in buffer
        if !self.rx_buffer_full() {
            self.rx_buffer[self.rx_head] = byte;
            self.rx_head = (self.rx_head + 1) % self.rx_buffer.len();
        }
    }

    fn rx_buffer_full(&self) -> bool {
        (self.rx_head + 1) % self.rx_buffer.len() == self.rx_tail
    }
}

#[derive(Debug)]
enum UartError {
    BufferFull,
    BufferEmpty,
    HardwareError,
}

// Global UART driver
static mut UART: UartDriver = UartDriver {
    config: UartConfig {
        baud_rate: 9600,
        data_bits: 8,
        stop_bits: 1,
        parity: Parity::None,
    },
    tx_buffer: [0; 64],
    tx_head: 0,
    tx_tail: 0,
    rx_buffer: [0; 64],
    rx_head: 0,
    rx_tail: 0,
};

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    // Send panic message via UART
    unsafe {
        let _ = UART.write_string("PANIC: System error occurred\n");
    }
    loop {
        asm!("wfi", options(nomem, nostack));
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    // Initialize UART
    unsafe {
        UART.initialize();
        UART.write_string("UART Echo Server Ready\n").ok();
    }

    // Main echo loop
    loop {
        // Check for received data
        if let Some(byte) = unsafe { UART.read_byte() } {
            // Echo the received byte
            let _ = unsafe { UART.write_byte(byte) };
        }

        // Small delay to prevent busy waiting
        delay_ms(1);
    }
}

// UART interrupt handlers
#[no_mangle]
pub extern "C" fn uart_tx_interrupt() {
    unsafe {
        UART.handle_tx_interrupt();
    }
}

#[no_mangle]
pub extern "C" fn uart_rx_interrupt() {
    // In a real system, this would be called by the interrupt handler
    // with the received byte as a parameter
    let received_byte = 0; // Placeholder
    unsafe {
        UART.handle_rx_interrupt(received_byte);
    }
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- `UartDriver` provides a complete UART interface with buffering
- Circular buffers handle data flow between hardware and application
- Interrupt-driven communication enables efficient data transfer
- Error handling manages communication errors gracefully
- Echo functionality demonstrates basic communication protocols

**Why**: This exercise teaches serial communication fundamentals and buffer management in embedded systems.

### Advanced Serial Protocol

**What**: Implement a more sophisticated serial protocol with commands and responses.

**Why**: This advanced exercise is important because:

- **Protocol design** teaches how to design communication protocols
- **Command parsing** introduces command interpretation
- **State machines** demonstrates protocol state management
- **Error recovery** shows how to handle communication errors

**When**: Use this exercise when you need to:

- Learn protocol design for embedded systems
- Practice command parsing and interpretation
- Understand state machine implementation
- Develop robust communication systems

**How**: Here's how to implement the advanced serial protocol:

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

// Protocol commands
#[derive(Debug, Clone, Copy)]
enum Command {
    Ping,
    GetStatus,
    SetLed(u8),
    GetLed,
    SetDelay(u32),
    GetDelay,
    Unknown,
}

// Protocol state
#[derive(Debug, Clone, Copy)]
enum ProtocolState {
    WaitingForStart,
    ReceivingCommand,
    ReceivingData,
    Processing,
    SendingResponse,
}

// Protocol handler
struct ProtocolHandler {
    state: ProtocolState,
    command_buffer: [u8; 32],
    buffer_index: usize,
    current_command: Command,
    led_state: u8,
    delay_ms: u32,
}

impl ProtocolHandler {
    fn new() -> Self {
        Self {
            state: ProtocolState::WaitingForStart,
            command_buffer: [0; 32],
            buffer_index: 0,
            current_command: Command::Unknown,
            led_state: 0,
            delay_ms: 1000,
        }
    }

    fn process_byte(&mut self, byte: u8) -> Option<&str> {
        match self.state {
            ProtocolState::WaitingForStart => {
                if byte == b'$' {
                    self.state = ProtocolState::ReceivingCommand;
                    self.buffer_index = 0;
                }
            },
            ProtocolState::ReceivingCommand => {
                if byte == b' ' {
                    self.state = ProtocolState::ReceivingData;
                    self.parse_command();
                } else if byte == b'\n' {
                    self.state = ProtocolState::Processing;
                    self.parse_command();
                } else {
                    self.command_buffer[self.buffer_index] = byte;
                    self.buffer_index += 1;
                }
            },
            ProtocolState::ReceivingData => {
                if byte == b'\n' {
                    self.state = ProtocolState::Processing;
                } else {
                    self.command_buffer[self.buffer_index] = byte;
                    self.buffer_index += 1;
                }
            },
            _ => {}
        }

        if self.state == ProtocolState::Processing {
            self.state = ProtocolState::WaitingForStart;
            return Some(self.execute_command());
        }

        None
    }

    fn parse_command(&mut self) {
        let command_str = core::str::from_utf8(&self.command_buffer[..self.buffer_index]).unwrap_or("");

        self.current_command = match command_str {
            "PING" => Command::Ping,
            "STATUS" => Command::GetStatus,
            "LED" => Command::GetLed,
            "DELAY" => Command::GetDelay,
            _ => {
                // Parse commands with data
                if command_str.starts_with("LED ") {
                    if let Ok(value) = core::str::from_utf8(&self.command_buffer[4..self.buffer_index]).unwrap_or("0").parse::<u8>() {
                        Command::SetLed(value)
                    } else {
                        Command::Unknown
                    }
                } else if command_str.starts_with("DELAY ") {
                    if let Ok(value) = core::str::from_utf8(&self.command_buffer[6..self.buffer_index]).unwrap_or("1000").parse::<u32>() {
                        Command::SetDelay(value)
                    } else {
                        Command::Unknown
                    }
                } else {
                    Command::Unknown
                }
            }
        };
    }

    fn execute_command(&mut self) -> &'static str {
        match self.current_command {
            Command::Ping => "PONG\n",
            Command::GetStatus => "OK\n",
            Command::SetLed(value) => {
                self.led_state = value;
                "LED set\n"
            },
            Command::GetLed => {
                // In a real system, this would format the LED state
                "LED: 0\n"
            },
            Command::SetDelay(value) => {
                self.delay_ms = value;
                "DELAY set\n"
            },
            Command::GetDelay => {
                // In a real system, this would format the delay value
                "DELAY: 1000\n"
            },
            Command::Unknown => "ERROR: Unknown command\n",
        }
    }
}

// Global protocol handler
static mut PROTOCOL: ProtocolHandler = ProtocolHandler {
    state: ProtocolState::WaitingForStart,
    command_buffer: [0; 32],
    buffer_index: 0,
    current_command: Command::Unknown,
    led_state: 0,
    delay_ms: 1000,
};

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {
        asm!("wfi", options(nomem, nostack));
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    // Initialize UART
    unsafe {
        UART.initialize();
        UART.write_string("Protocol Server Ready\n").ok();
    }

    // Main protocol loop
    loop {
        // Check for received data
        if let Some(byte) = unsafe { UART.read_byte() } {
            if let Some(response) = unsafe { PROTOCOL.process_byte(byte) } {
                let _ = unsafe { UART.write_string(response) };
            }
        }

        delay_ms(1);
    }
}

// Placeholder UART functions (same as previous exercise)
static mut UART: UartDriver = UartDriver {
    config: UartConfig {
        baud_rate: 9600,
        data_bits: 8,
        stop_bits: 1,
        parity: Parity::None,
    },
    tx_buffer: [0; 64],
    tx_head: 0,
    tx_tail: 0,
    rx_buffer: [0; 64],
    rx_head: 0,
    rx_tail: 0,
};

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- `ProtocolHandler` manages communication protocol state
- Command parsing interprets text-based commands
- State machine handles protocol flow
- Command execution processes different protocol commands
- Response generation provides structured responses

**Why**: This exercise teaches protocol design and state machine implementation in embedded systems.

## Exercise 3: Memory Management and Data Structures

### What is the Memory Management Exercise?

**What**: Implement custom data structures and memory management without heap allocation.

**Why**: This exercise is important because:

- **Memory constraints** teaches how to work within limited memory
- **Data structures** introduces stack-based data structures
- **Memory efficiency** demonstrates memory optimization techniques
- **Resource management** shows how to manage resources without dynamic allocation

**When**: Use this exercise when you need to:

- Learn memory management in embedded systems
- Understand stack-based programming
- Practice resource-constrained programming
- Develop efficient data structures

**How**: Here's how to implement memory management:

```rust
#![no_std]
#![no_main]

use core::panic::PanicInfo;
use core::arch::asm;

// Stack-based vector implementation
struct StackVec<T, const N: usize> {
    data: [T; N],
    len: usize,
}

impl<T, const N: usize> StackVec<T, N> {
    fn new() -> Self {
        Self {
            data: unsafe { core::mem::zeroed() },
            len: 0,
        }
    }

    fn push(&mut self, item: T) -> Result<(), &'static str> {
        if self.len >= N {
            return Err("Vector is full");
        }

        self.data[self.len] = item;
        self.len += 1;
        Ok(())
    }

    fn pop(&mut self) -> Option<T> {
        if self.len == 0 {
            return None;
        }

        self.len -= 1;
        Some(unsafe { core::ptr::read(&self.data[self.len]) })
    }

    fn get(&self, index: usize) -> Option<&T> {
        if index >= self.len {
            return None;
        }
        Some(&self.data[index])
    }

    fn len(&self) -> usize {
        self.len
    }

    fn is_empty(&self) -> bool {
        self.len == 0
    }

    fn is_full(&self) -> bool {
        self.len >= N
    }
}

// Stack-based string implementation
struct StackString<const N: usize> {
    data: [u8; N],
    len: usize,
}

impl<const N: usize> StackString<N> {
    fn new() -> Self {
        Self {
            data: [0; N],
            len: 0,
        }
    }

    fn from_str(s: &str) -> Result<Self, &'static str> {
        if s.len() >= N {
            return Err("String too long");
        }

        let mut result = Self::new();
        for (i, &byte) in s.as_bytes().iter().enumerate() {
            result.data[i] = byte;
        }
        result.len = s.len();
        Ok(result)
    }

    fn push_char(&mut self, c: char) -> Result<(), &'static str> {
        if self.len >= N {
            return Err("String is full");
        }

        let mut buffer = [0u8; 4];
        let encoded = c.encode_utf8(&mut buffer);

        if self.len + encoded.len() > N {
            return Err("String would overflow");
        }

        for &byte in encoded.as_bytes() {
            self.data[self.len] = byte;
            self.len += 1;
        }

        Ok(())
    }

    fn as_str(&self) -> &str {
        unsafe { core::str::from_utf8_unchecked(&self.data[..self.len]) }
    }

    fn len(&self) -> usize {
        self.len
    }
}

// Memory pool for fixed-size allocations
struct MemoryPool<T, const N: usize> {
    blocks: [Option<T>; N],
    free_list: [usize; N],
    free_count: usize,
}

impl<T, const N: usize> MemoryPool<T, N> {
    fn new() -> Self {
        let mut free_list = [0; N];
        for i in 0..N {
            free_list[i] = i;
        }

        Self {
            blocks: [(); N].map(|_| None),
            free_list,
            free_count: N,
        }
    }

    fn allocate(&mut self, value: T) -> Result<usize, &'static str> {
        if self.free_count == 0 {
            return Err("Pool is full");
        }

        let index = self.free_list[self.free_count - 1];
        self.blocks[index] = Some(value);
        self.free_count -= 1;
        Ok(index)
    }

    fn deallocate(&mut self, index: usize) -> Result<(), &'static str> {
        if index >= N || self.blocks[index].is_none() {
            return Err("Invalid index or already deallocated");
        }

        self.blocks[index] = None;
        self.free_list[self.free_count] = index;
        self.free_count += 1;
        Ok(())
    }

    fn get(&self, index: usize) -> Option<&T> {
        self.blocks.get(index)?.as_ref()
    }

    fn get_mut(&mut self, index: usize) -> Option<&mut T> {
        self.blocks.get_mut(index)?.as_mut()
    }
}

// Application data structures
struct SensorData {
    temperature: f32,
    humidity: f32,
    pressure: f32,
    timestamp: u32,
}

struct DataLogger {
    data: StackVec<SensorData, 100>,
    current_index: usize,
}

impl DataLogger {
    fn new() -> Self {
        Self {
            data: StackVec::new(),
            current_index: 0,
        }
    }

    fn log_data(&mut self, sensor_data: SensorData) -> Result<(), &'static str> {
        if self.data.is_full() {
            // Overwrite oldest data
            self.current_index = (self.current_index + 1) % 100;
        }

        self.data.push(sensor_data)
    }

    fn get_latest(&self) -> Option<&SensorData> {
        if self.data.is_empty() {
            return None;
        }
        self.data.get(self.data.len() - 1)
    }

    fn get_average_temperature(&self) -> Option<f32> {
        if self.data.is_empty() {
            return None;
        }

        let mut sum = 0.0;
        for i in 0..self.data.len() {
            if let Some(data) = self.data.get(i) {
                sum += data.temperature;
            }
        }
        Some(sum / self.data.len() as f32)
    }
}

// Global application state
static mut DATA_LOGGER: DataLogger = DataLogger {
    data: StackVec::new(),
    current_index: 0,
};

static mut MEMORY_POOL: MemoryPool<SensorData, 50> = MemoryPool::new();

#[panic_handler]
fn panic(_info: &PanicInfo) -> ! {
    loop {
        asm!("wfi", options(nomem, nostack));
    }
}

#[no_mangle]
pub extern "C" fn _start() -> ! {
    // Initialize system
    initialize_system();

    // Main application loop
    loop {
        // Simulate sensor data collection
        let sensor_data = SensorData {
            temperature: 25.0,
            humidity: 60.0,
            pressure: 1013.25,
            timestamp: get_timestamp(),
        };

        // Log sensor data
        unsafe {
            if let Err(e) = DATA_LOGGER.log_data(sensor_data) {
                // Handle logging error
            }
        }

        // Process data
        process_sensor_data();

        // Delay between readings
        delay_ms(1000);
    }
}

fn initialize_system() {
    // Initialize hardware
    // Set up sensors
    // Configure system clocks
}

fn get_timestamp() -> u32 {
    // In a real system, this would get actual timestamp
    0
}

fn process_sensor_data() {
    unsafe {
        if let Some(latest) = DATA_LOGGER.get_latest() {
            // Process latest sensor data
            if let Some(avg_temp) = DATA_LOGGER.get_average_temperature() {
                // Use average temperature for processing
            }
        }
    }
}

fn delay_ms(ms: u32) {
    for _ in 0..(ms * 1000) {
        asm!("nop", options(nomem, nostack));
    }
}
```

**Explanation**:

- `StackVec` provides a stack-based vector implementation
- `StackString` enables string handling without heap allocation
- `MemoryPool` provides fixed-size memory allocation
- `DataLogger` demonstrates data logging without dynamic allocation
- Resource management shows how to manage memory efficiently

**Why**: This exercise teaches memory management and data structures in resource-constrained environments.

## Key Takeaways

**What** you've learned through these practical exercises:

1. **Bare Metal Programming** - Direct hardware control without operating system
2. **State Machine Implementation** - Managing application state and behavior
3. **Serial Communication** - UART programming and protocol design
4. **Memory Management** - Working within memory constraints
5. **Data Structures** - Stack-based data structures and algorithms
6. **Resource Management** - Efficient resource usage in embedded systems
7. **Error Handling** - Robust error handling in embedded applications

**Why** these exercises matter:

- **Practical Skills** - Hands-on experience with embedded programming
- **Problem Solving** - Ability to solve real-world embedded challenges
- **Industry Readiness** - Preparation for professional embedded development
- **Portfolio Building** - Concrete examples of embedded Rust skills

## Next Steps

Now that you've completed these practical exercises, you're ready to learn about:

- **Hardware Abstraction Layers** - Creating abstractions for hardware peripherals
- **Interrupts and Timers** - Handling asynchronous events and timing
- **Communication Protocols** - Implementing UART, I2C, and SPI communication
- **Advanced Embedded Concepts** - More sophisticated embedded programming techniques

**Where** to go next: Continue with the next lesson on "Hardware Abstraction Layers" to learn about creating abstractions for embedded hardware!
