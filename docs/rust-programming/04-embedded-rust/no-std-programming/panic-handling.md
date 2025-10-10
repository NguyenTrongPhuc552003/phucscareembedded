---
sidebar_position: 2
---

# Panic Handling

Master error handling and panic management in embedded Rust with comprehensive explanations using the 4W+H framework.

## What Is Panic Handling in Embedded Rust?

**What**: Panic handling in embedded Rust refers to the mechanisms and strategies used to manage unrecoverable errors (panics) in `no_std` environments where the standard library's panic infrastructure is unavailable.

**Why**: Understanding panic handling is crucial because:

- **System reliability** ensures embedded systems can recover gracefully from critical errors
- **Debugging capabilities** provides meaningful error information in resource-constrained environments
- **Safety requirements** meets the strict reliability demands of embedded applications
- **Resource constraints** works within limited memory and processing capabilities
- **Real-time systems** maintains deterministic behavior even during error conditions
- **Production deployment** enables proper error reporting and system recovery

**When**: Use panic handling when you need to:

- Handle unrecoverable errors in embedded systems
- Provide debugging information in `no_std` environments
- Implement graceful error recovery strategies
- Meet safety-critical system requirements
- Debug embedded applications during development
- Ensure system stability in production environments

**How**: Panic handling works by:

- **Custom panic handlers** defining application-specific panic behavior
- **Error logging** capturing panic information for debugging
- **System recovery** implementing graceful shutdown or restart procedures
- **Resource cleanup** ensuring proper cleanup of system resources
- **Debugging support** providing meaningful error messages and context
- **Safety mechanisms** preventing system corruption during panics

**Where**: Panic handling is used in embedded systems, real-time applications, safety-critical systems, and any `no_std` environment where robust error handling is required.

## Understanding Panic Information

### PanicInfo Structure

**What**: `PanicInfo` is a structure that contains information about a panic, including the location and optional message.

**Why**: Understanding `PanicInfo` is important because:

- **Debugging** provides crucial information about where and why a panic occurred
- **Error reporting** enables meaningful error messages in embedded systems
- **Development** helps identify and fix issues during development
- **Production** allows logging and monitoring of system failures

**When**: Use `PanicInfo` when you need to extract and process panic information in your panic handler.

**How**: Here's how to work with `PanicInfo`:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::fmt::Write;

// Simple panic handler that extracts basic information
#[panic_handler]
fn panic(info: &PanicInfo) -> ! {
    // Extract panic location
    if let Some(location) = info.location() {
        // Location information is available
        // In a real system, you might log this to UART or flash
    }

    // Extract panic message
    if let Some(message) = info.message() {
        // Panic message is available
        // In a real system, you might log this to UART or flash
    }

    // Extract payload (for panic! macro with data)
    if let Some(payload) = info.payload().downcast_ref::<&str>() {
        // String payload is available
    }

    // Infinite loop to halt execution
    loop {}
}

// Advanced panic handler with detailed information extraction
struct PanicLogger {
    // In a real system, this might be a UART or flash storage
    buffer: [u8; 256],
    position: usize,
}

impl PanicLogger {
    fn new() -> Self {
        Self {
            buffer: [0; 256],
            position: 0,
        }
    }

    fn log_panic_info(&mut self, info: &PanicInfo) {
        // Log location information
        if let Some(location) = info.location() {
            self.log_str("Panic at: ");
            self.log_str(location.file());
            self.log_str(":");
            self.log_number(location.line() as u32);
            self.log_str(":");
            self.log_number(location.column() as u32);
            self.log_str("\n");
        }

        // Log panic message
        if let Some(message) = info.message() {
            self.log_str("Message: ");
            self.log_fmt(message);
            self.log_str("\n");
        }

        // Log payload if available
        if let Some(payload) = info.payload().downcast_ref::<&str>() {
            self.log_str("Payload: ");
            self.log_str(payload);
            self.log_str("\n");
        }
    }

    fn log_str(&mut self, s: &str) {
        let bytes = s.as_bytes();
        for &byte in bytes {
            if self.position < self.buffer.len() {
                self.buffer[self.position] = byte;
                self.position += 1;
            }
        }
    }

    fn log_number(&mut self, n: u32) {
        if n == 0 {
            self.log_str("0");
            return;
        }

        let mut num = n;
        let mut digits = [0u8; 10];
        let mut count = 0;

        while num > 0 {
            digits[count] = (num % 10) as u8 + b'0';
            num /= 10;
            count += 1;
        }

        for i in (0..count).rev() {
            if self.position < self.buffer.len() {
                self.buffer[self.position] = digits[i];
                self.position += 1;
            }
        }
    }

    fn log_fmt(&mut self, fmt: &core::fmt::Arguments) {
        // In a real implementation, you would format the arguments
        // For now, we'll just log a placeholder
        self.log_str("<formatted message>");
    }
}

// Panic handler using the logger
#[panic_handler]
fn panic_with_logging(info: &PanicInfo) -> ! {
    let mut logger = PanicLogger::new();
    logger.log_panic_info(info);

    // In a real system, you might:
    // - Send the log via UART
    // - Store it in flash memory
    // - Blink an LED to indicate panic
    // - Reset the system

    loop {}
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("This is a test panic");
}
```

**Explanation**:

- `PanicInfo` provides access to panic location, message, and payload
- Custom logging can extract and store panic information
- Location information includes file, line, and column numbers
- Message and payload provide additional context about the panic
- In real systems, this information would be logged to persistent storage

**Why**: `PanicInfo` enables comprehensive error reporting and debugging in embedded systems.

### Panic Payload Handling

**What**: Panic payloads are the data passed to the `panic!` macro, which can be strings, numbers, or other types.

**Why**: Understanding panic payloads is important because:

- **Rich error information** enables detailed error reporting
- **Custom error types** allows structured error data
- **Debugging support** provides context about failures
- **Production monitoring** enables error tracking and analysis

**When**: Use panic payloads when you need to provide additional context about why a panic occurred.

**How**: Here's how to handle different types of panic payloads:

```rust
#![no_std]

use core::panic::PanicInfo;

// Panic handler that handles different payload types
#[panic_handler]
fn panic_handler(info: &PanicInfo) -> ! {
    // Handle string payloads
    if let Some(message) = info.payload().downcast_ref::<&str>() {
        // Log string message
        log_error("String panic: ", message);
    }

    // Handle string payloads (allocated)
    if let Some(message) = info.payload().downcast_ref::<String>() {
        // Log owned string message
        log_error("Owned string panic: ", message.as_str());
    }

    // Handle numeric payloads
    if let Some(number) = info.payload().downcast_ref::<i32>() {
        // Log numeric error code
        log_number("Numeric panic: ", *number);
    }

    // Handle custom error types
    if let Some(error) = info.payload().downcast_ref::<CustomError>() {
        // Log custom error information
        log_custom_error(error);
    }

    // Handle generic payloads
    log_error("Generic panic occurred", "");

    loop {}
}

// Custom error type for structured error reporting
#[derive(Debug)]
struct CustomError {
    code: u32,
    module: &'static str,
    description: &'static str,
}

impl CustomError {
    fn new(code: u32, module: &'static str, description: &'static str) -> Self {
        Self { code, module, description }
    }
}

// Simple logging functions (in real systems, these would use UART, flash, etc.)
fn log_error(prefix: &str, message: &str) {
    // In a real system, this would log to UART or flash
    // For now, we'll just simulate logging
}

fn log_number(prefix: &str, number: i32) {
    // In a real system, this would log the number to UART or flash
    // For now, we'll just simulate logging
}

fn log_custom_error(error: &CustomError) {
    // In a real system, this would log structured error information
    // For now, we'll just simulate logging
}

// Example functions that might panic with different payloads
fn function_that_panics_with_string() {
    panic!("This is a string panic message");
}

fn function_that_panics_with_number() {
    panic!("Error code: {}", 42);
}

fn function_that_panics_with_custom_error() {
    let error = CustomError::new(0x1001, "sensor", "Temperature sensor failure");
    panic!("Custom error: {:?}", error);
}

fn main() {
    // These would trigger panics with different payload types
    // function_that_panics_with_string();
    // function_that_panics_with_number();
    // function_that_panics_with_custom_error();
}
```

**Explanation**:

- Different payload types can be extracted using `downcast_ref`
- String payloads provide human-readable error messages
- Numeric payloads enable error code reporting
- Custom error types allow structured error information
- Generic payloads provide fallback error handling

**Why**: Panic payload handling enables rich error reporting and debugging capabilities in embedded systems.

## Understanding Panic Handler Strategies

### Basic Panic Handlers

**What**: Basic panic handlers provide simple, minimal panic handling suitable for production systems.

**Why**: Understanding basic panic handlers is important because:

- **Simplicity** provides straightforward panic handling without complexity
- **Performance** minimizes overhead and resource usage
- **Reliability** ensures predictable behavior during panics
- **Production** suitable for deployment in production systems

**When**: Use basic panic handlers when you need simple, reliable panic handling without debugging features.

**How**: Here's how to implement basic panic handlers:

```rust
#![no_std]

use core::panic::PanicInfo;

// Minimal panic handler - just halt
#[panic_handler]
fn panic_halt(_info: &PanicInfo) -> ! {
    // Disable interrupts to prevent further issues
    unsafe {
        core::arch::asm!("cpsid i", options(nomem, nostack));
    }

    // Infinite loop to halt execution
    loop {
        // In a real system, you might:
        // - Blink an LED to indicate panic
        // - Set a status register
        // - Wait for watchdog reset
        core::arch::asm!("wfi", options(nomem, nostack)); // Wait for interrupt
    }
}

// Panic handler with LED indication
#[panic_handler]
fn panic_with_led(_info: &PanicInfo) -> ! {
    // Configure LED pin (this would be hardware-specific)
    // In a real system, you would configure GPIO pins here

    loop {
        // Blink LED rapidly to indicate panic
        // This would involve toggling a GPIO pin
        for _ in 0..100000 {
            core::arch::asm!("nop", options(nomem, nostack));
        }
        for _ in 0..100000 {
            core::arch::asm!("nop", options(nomem, nostack));
        }
    }
}

// Panic handler with system reset
#[panic_handler]
fn panic_reset(_info: &PanicInfo) -> ! {
    // In a real system, you would:
    // 1. Save critical state to non-volatile memory
    // 2. Perform system reset

    // For demonstration, we'll just halt
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Panic handler with watchdog reset
#[panic_handler]
fn panic_watchdog(_info: &PanicInfo) -> ! {
    // Disable watchdog to prevent automatic reset
    // In a real system, you would configure the watchdog timer

    // Wait for watchdog to reset the system
    loop {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Test panic");
}
```

**Explanation**:

- `panic_halt` provides minimal panic handling with interrupt disabling
- `panic_with_led` includes visual indication of panic state
- `panic_reset` prepares for system reset
- `panic_watchdog` relies on watchdog timer for system reset
- All handlers use infinite loops to halt execution

**Why**: Basic panic handlers provide reliable, minimal panic handling suitable for production systems.

### Debugging Panic Handlers

**What**: Debugging panic handlers provide detailed error information and debugging capabilities during development.

**Why**: Understanding debugging panic handlers is important because:

- **Development** enables effective debugging during development
- **Error analysis** provides detailed information about panic causes
- **Troubleshooting** helps identify and fix issues quickly
- **Testing** supports comprehensive testing and validation

**When**: Use debugging panic handlers during development and testing phases.

**How**: Here's how to implement debugging panic handlers:

```rust
#![no_std]

use core::panic::PanicInfo;
use core::fmt::Write;

// Debugging panic handler with detailed logging
struct DebugPanicHandler {
    // In a real system, this would be a UART or other output device
    output_buffer: [u8; 512],
    position: usize,
}

impl DebugPanicHandler {
    fn new() -> Self {
        Self {
            output_buffer: [0; 512],
            position: 0,
        }
    }

    fn log_panic_details(&mut self, info: &PanicInfo) {
        self.log_header();
        self.log_location(info);
        self.log_message(info);
        self.log_payload(info);
        self.log_footer();
    }

    fn log_header(&mut self) {
        self.write_str("=== PANIC OCCURRED ===\n");
        self.write_str("Timestamp: [would be real timestamp]\n");
        self.write_str("System State: [would be system state]\n");
    }

    fn log_location(&mut self, info: &PanicInfo) {
        if let Some(location) = info.location() {
            self.write_str("Location:\n");
            self.write_str("  File: ");
            self.write_str(location.file());
            self.write_str("\n");
            self.write_str("  Line: ");
            self.write_number(location.line() as u32);
            self.write_str("\n");
            self.write_str("  Column: ");
            self.write_number(location.column() as u32);
            self.write_str("\n");
        }
    }

    fn log_message(&mut self, info: &PanicInfo) {
        if let Some(message) = info.message() {
            self.write_str("Message: ");
            // In a real implementation, you would format the message
            self.write_str("<formatted message>\n");
        }
    }

    fn log_payload(&mut self, info: &PanicInfo) {
        if let Some(payload) = info.payload().downcast_ref::<&str>() {
            self.write_str("Payload: ");
            self.write_str(payload);
            self.write_str("\n");
        }
    }

    fn log_footer(&mut self) {
        self.write_str("=== END PANIC INFO ===\n");
        self.write_str("System halted for debugging\n");
    }

    fn write_str(&mut self, s: &str) {
        let bytes = s.as_bytes();
        for &byte in bytes {
            if self.position < self.output_buffer.len() {
                self.output_buffer[self.position] = byte;
                self.position += 1;
            }
        }
    }

    fn write_number(&mut self, n: u32) {
        if n == 0 {
            self.write_str("0");
            return;
        }

        let mut num = n;
        let mut digits = [0u8; 10];
        let mut count = 0;

        while num > 0 {
            digits[count] = (num % 10) as u8 + b'0';
            num /= 10;
            count += 1;
        }

        for i in (0..count).rev() {
            if self.position < self.output_buffer.len() {
                self.output_buffer[self.position] = digits[i];
                self.position += 1;
            }
        }
    }
}

// Debugging panic handler
#[panic_handler]
fn panic_debug(info: &PanicInfo) -> ! {
    let mut handler = DebugPanicHandler::new();
    handler.log_panic_details(info);

    // In a real system, you would:
    // - Send the log via UART
    // - Store it in flash memory
    // - Trigger a breakpoint for debugging
    // - Blink LEDs in a specific pattern

    // Trigger breakpoint for debugging
    unsafe {
        core::arch::asm!("bkpt", options(nomem, nostack));
    }

    // Infinite loop for manual inspection
    loop {
        // In a real system, you might:
        // - Blink LEDs in a pattern
        // - Send periodic status messages
        // - Wait for debugger attachment
        for _ in 0..1000000 {
            core::arch::asm!("nop", options(nomem, nostack));
        }
    }
}

// Panic handler with stack trace (simplified)
#[panic_handler]
fn panic_with_stack_trace(info: &PanicInfo) -> ! {
    // Log basic panic information
    let mut handler = DebugPanicHandler::new();
    handler.log_panic_details(info);

    // In a real system, you would:
    // - Capture stack pointer
    // - Walk the call stack
    // - Log function addresses
    // - Provide symbol information if available

    handler.write_str("Stack trace:\n");
    handler.write_str("  [would contain actual stack trace]\n");

    // Halt for debugging
    loop {
        unsafe {
            core::arch::asm!("bkpt", options(nomem, nostack));
        }
    }
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Debug panic test");
}
```

**Explanation**:

- Debugging panic handlers provide comprehensive error information
- Detailed logging includes location, message, and payload information
- Stack trace capabilities help identify the call chain leading to panic
- Breakpoint insertion enables debugging with external tools
- Rich error context aids in problem identification and resolution

**Why**: Debugging panic handlers provide essential debugging capabilities during development and testing.

### Production Panic Handlers

**What**: Production panic handlers are optimized for deployment in production systems with focus on reliability and minimal resource usage.

**Why**: Understanding production panic handlers is important because:

- **Reliability** ensures robust error handling in production systems
- **Performance** minimizes overhead and resource usage
- **Safety** meets safety-critical system requirements
- **Monitoring** enables error tracking and system health monitoring

**When**: Use production panic handlers in deployed systems where reliability and performance are critical.

**How**: Here's how to implement production panic handlers:

```rust
#![no_std]

use core::panic::PanicInfo;

// Production panic handler with error logging
struct ProductionPanicHandler {
    // In a real system, this would be flash memory or EEPROM
    error_log: [u8; 256],
    log_position: usize,
}

impl ProductionPanicHandler {
    fn new() -> Self {
        Self {
            error_log: [0; 256],
            log_position: 0,
        }
    }

    fn log_panic(&mut self, info: &PanicInfo) {
        // Log minimal essential information
        self.log_error_code(0xDEADBEEF); // Panic error code

        if let Some(location) = info.location() {
            self.log_location(location.file(), location.line());
        }

        // Log timestamp (in real system, this would be actual timestamp)
        self.log_timestamp();

        // Log system state (in real system, this would be actual system state)
        self.log_system_state();
    }

    fn log_error_code(&mut self, code: u32) {
        // Log error code in compact format
        self.write_bytes(&code.to_le_bytes());
    }

    fn log_location(&mut self, file: &str, line: u32) {
        // Log file name hash and line number
        let file_hash = self.hash_string(file);
        self.write_bytes(&file_hash.to_le_bytes());
        self.write_bytes(&line.to_le_bytes());
    }

    fn log_timestamp(&mut self) {
        // Log timestamp (in real system, this would be actual timestamp)
        let timestamp = 0x12345678; // Placeholder timestamp
        self.write_bytes(&timestamp.to_le_bytes());
    }

    fn log_system_state(&mut self) {
        // Log critical system state (in real system, this would be actual state)
        let system_state = 0x87654321; // Placeholder system state
        self.write_bytes(&system_state.to_le_bytes());
    }

    fn write_bytes(&mut self, bytes: &[u8]) {
        for &byte in bytes {
            if self.log_position < self.error_log.len() {
                self.error_log[self.log_position] = byte;
                self.log_position += 1;
            }
        }
    }

    fn hash_string(&self, s: &str) -> u32 {
        // Simple hash function for file names
        let mut hash = 0u32;
        for &byte in s.as_bytes() {
            hash = hash.wrapping_mul(31).wrapping_add(byte as u32);
        }
        hash
    }
}

// Production panic handler
#[panic_handler]
fn panic_production(info: &PanicInfo) -> ! {
    // Log panic information
    let mut handler = ProductionPanicHandler::new();
    handler.log_panic(info);

    // Perform system recovery actions
    panic_recovery();

    // Enter safe state
    panic_safe_state();
}

fn panic_recovery() {
    // In a real system, you would:
    // - Save critical data to non-volatile memory
    // - Notify external systems of the error
    // - Prepare for system restart
    // - Clean up resources
}

fn panic_safe_state() -> ! {
    // Disable interrupts to prevent further issues
    unsafe {
        core::arch::asm!("cpsid i", options(nomem, nostack));
    }

    // Enter safe state
    loop {
        // In a real system, you might:
        // - Blink status LED
        // - Send error notification
        // - Wait for watchdog reset
        // - Enter low-power mode

        // Wait for watchdog reset
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

// Panic handler with watchdog reset
#[panic_handler]
fn panic_watchdog_reset(info: &PanicInfo) -> ! {
    // Log minimal panic information
    let mut handler = ProductionPanicHandler::new();
    handler.log_panic(info);

    // Configure watchdog for reset
    // In a real system, you would configure the watchdog timer

    // Wait for watchdog to reset the system
    loop {
        core::arch::asm!("nop", options(nomem, nostack));
    }
}

// Panic handler with graceful shutdown
#[panic_handler]
fn panic_graceful_shutdown(info: &PanicInfo) -> ! {
    // Log panic information
    let mut handler = ProductionPanicHandler::new();
    handler.log_panic(info);

    // Perform graceful shutdown
    graceful_shutdown();

    // Enter safe state
    panic_safe_state();
}

fn graceful_shutdown() {
    // In a real system, you would:
    // - Save all critical data
    // - Notify external systems
    // - Close all connections
    // - Perform cleanup operations
    // - Prepare for restart
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Production panic test");
}
```

**Explanation**:

- Production panic handlers focus on reliability and minimal resource usage
- Error logging captures essential information in compact format
- System recovery procedures ensure graceful error handling
- Safe state entry prevents further system corruption
- Watchdog reset provides automatic system recovery

**Why**: Production panic handlers ensure robust error handling in deployed systems with focus on reliability and recovery.

## Understanding Panic Handler Libraries

### Using Panic Handler Crates

**What**: Panic handler crates provide pre-implemented panic handlers for common embedded scenarios.

**Why**: Understanding panic handler crates is important because:

- **Rapid development** enables quick setup of panic handling
- **Best practices** provides proven panic handling strategies
- **Maintenance** reduces the need to implement custom panic handlers
- **Compatibility** ensures compatibility with different embedded platforms

**When**: Use panic handler crates when you need proven panic handling without implementing custom solutions.

**How**: Here's how to use common panic handler crates:

```rust
#![no_std]

// Using panic-halt crate
// Add to Cargo.toml: panic-halt = "0.2"
// use panic_halt as _;

// Using panic-abort crate
// Add to Cargo.toml: panic-abort = "0.3"
// use panic_abort as _;

// Using panic-semihosting crate
// Add to Cargo.toml: panic-semihosting = "0.5"
// use panic_semihosting as _;

// Custom panic handler that combines multiple strategies
#[panic_handler]
fn panic_handler(info: &core::panic::PanicInfo) -> ! {
    // Log panic information (in real system, this would use UART or flash)
    log_panic_info(info);

    // Perform system-specific recovery
    system_recovery();

    // Enter safe state
    loop {
        // In a real system, you might:
        // - Blink status LED
        // - Send error notification
        // - Wait for watchdog reset
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

fn log_panic_info(info: &core::panic::PanicInfo) {
    // In a real system, this would log to UART or flash
    // For now, we'll just simulate logging
}

fn system_recovery() {
    // In a real system, you would:
    // - Save critical data
    // - Notify external systems
    // - Perform cleanup
}

// Conditional panic handling based on build configuration
#[cfg(debug_assertions)]
#[panic_handler]
fn panic_debug(info: &core::panic::PanicInfo) -> ! {
    // Debug panic handler with detailed logging
    debug_panic_handler(info);
}

#[cfg(not(debug_assertions))]
#[panic_handler]
fn panic_release(info: &core::panic::PanicInfo) -> ! {
    // Release panic handler with minimal overhead
    release_panic_handler(info);
}

fn debug_panic_handler(info: &core::panic::PanicInfo) {
    // Detailed logging for debugging
    // In a real system, this would use UART or semihosting
}

fn release_panic_handler(info: &core::panic::PanicInfo) {
    // Minimal logging for production
    // In a real system, this would use flash or EEPROM
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Test panic");
}
```

**Explanation**:

- Panic handler crates provide pre-implemented solutions
- Different crates offer different panic handling strategies
- Conditional compilation enables different panic handling for debug and release builds
- Custom panic handlers can combine multiple strategies

**Why**: Panic handler crates provide proven solutions for common embedded panic handling scenarios.

### Custom Panic Handler Implementation

**What**: Custom panic handler implementation allows you to create application-specific panic handling behavior.

**Why**: Understanding custom panic handler implementation is important because:

- **Application-specific** enables tailored panic handling for specific requirements
- **Integration** allows integration with existing system components
- **Optimization** enables optimization for specific hardware and software constraints
- **Control** provides full control over panic handling behavior

**When**: Use custom panic handler implementation when you need specific panic handling behavior not provided by existing crates.

**How**: Here's how to implement custom panic handlers:

```rust
#![no_std]

use core::panic::PanicInfo;

// Custom panic handler with hardware-specific features
struct HardwarePanicHandler {
    // Hardware-specific components
    led_controller: LEDController,
    uart_controller: UARTController,
    flash_storage: FlashStorage,
}

impl HardwarePanicHandler {
    fn new() -> Self {
        Self {
            led_controller: LEDController::new(),
            uart_controller: UARTController::new(),
            flash_storage: FlashStorage::new(),
        }
    }

    fn handle_panic(&mut self, info: &PanicInfo) {
        // Visual indication of panic
        self.led_controller.blink_error_pattern();

        // Log panic information to UART
        self.log_to_uart(info);

        // Store panic information in flash
        self.store_in_flash(info);

        // Notify external systems
        self.notify_external_systems();
    }

    fn log_to_uart(&mut self, info: &PanicInfo) {
        self.uart_controller.write_str("PANIC: ");

        if let Some(location) = info.location() {
            self.uart_controller.write_str("File: ");
            self.uart_controller.write_str(location.file());
            self.uart_controller.write_str(", Line: ");
            self.uart_controller.write_number(location.line() as u32);
            self.uart_controller.write_str("\n");
        }

        if let Some(message) = info.message() {
            self.uart_controller.write_str("Message: ");
            // In a real implementation, you would format the message
            self.uart_controller.write_str("<formatted message>\n");
        }
    }

    fn store_in_flash(&mut self, info: &PanicInfo) {
        // Store panic information in flash memory
        let panic_record = PanicRecord {
            timestamp: self.get_timestamp(),
            location: info.location().map(|loc| (loc.file(), loc.line())),
            message: info.message().map(|msg| "<formatted message>"),
        };

        self.flash_storage.store_panic_record(panic_record);
    }

    fn notify_external_systems(&mut self) {
        // Send panic notification to external systems
        // In a real system, this might use:
        // - CAN bus messages
        // - Ethernet notifications
        // - Wireless communication
    }

    fn get_timestamp(&self) -> u32 {
        // In a real system, this would get actual timestamp
        0x12345678
    }
}

// Hardware-specific components (simplified)
struct LEDController {
    // LED control registers
}

impl LEDController {
    fn new() -> Self {
        Self {}
    }

    fn blink_error_pattern(&mut self) {
        // Blink LED in error pattern
        // In a real system, this would control GPIO pins
    }
}

struct UARTController {
    // UART control registers
}

impl UARTController {
    fn new() -> Self {
        Self {}
    }

    fn write_str(&mut self, s: &str) {
        // Write string to UART
        // In a real system, this would use UART registers
    }

    fn write_number(&mut self, n: u32) {
        // Write number to UART
        // In a real system, this would format and send the number
    }
}

struct FlashStorage {
    // Flash control registers
}

impl FlashStorage {
    fn new() -> Self {
        Self {}
    }

    fn store_panic_record(&mut self, record: PanicRecord) {
        // Store panic record in flash
        // In a real system, this would write to flash memory
    }
}

struct PanicRecord {
    timestamp: u32,
    location: Option<(&'static str, u32)>,
    message: Option<&'static str>,
}

// Custom panic handler
#[panic_handler]
fn panic_handler(info: &PanicInfo) -> ! {
    let mut handler = HardwarePanicHandler::new();
    handler.handle_panic(info);

    // Enter safe state
    loop {
        // In a real system, you might:
        // - Continue blinking LED
        // - Send periodic status messages
        // - Wait for watchdog reset
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Hardware panic test");
}
```

**Explanation**:

- Custom panic handlers can integrate with hardware-specific components
- LED controllers provide visual indication of panic state
- UART controllers enable error logging and debugging
- Flash storage allows persistent error logging
- External system notification enables remote monitoring

**Why**: Custom panic handler implementation enables application-specific panic handling tailored to specific hardware and software requirements.

## Practice Exercises

### Exercise 1: Basic Panic Handler

**What**: Implement a basic panic handler that logs panic information.

**How**: Implement this exercise:

```rust
#![no_std]

use core::panic::PanicInfo;

#[panic_handler]
fn panic_handler(info: &PanicInfo) -> ! {
    // Log panic location
    if let Some(location) = info.location() {
        // In a real system, this would log to UART or flash
        // For now, we'll just simulate logging
    }

    // Log panic message
    if let Some(message) = info.message() {
        // In a real system, this would log to UART or flash
        // For now, we'll just simulate logging
    }

    // Halt execution
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Test panic");
}
```

### Exercise 2: Debugging Panic Handler

**What**: Implement a debugging panic handler with detailed error information.

**How**: Implement this exercise:

```rust
#![no_std]

use core::panic::PanicInfo;

struct DebugPanicHandler {
    // In a real system, this would be a UART or flash storage
    buffer: [u8; 256],
    position: usize,
}

impl DebugPanicHandler {
    fn new() -> Self {
        Self {
            buffer: [0; 256],
            position: 0,
        }
    }

    fn log_panic(&mut self, info: &PanicInfo) {
        self.write_str("=== PANIC DEBUG INFO ===\n");

        if let Some(location) = info.location() {
            self.write_str("File: ");
            self.write_str(location.file());
            self.write_str("\nLine: ");
            self.write_number(location.line() as u32);
            self.write_str("\n");
        }

        if let Some(message) = info.message() {
            self.write_str("Message: ");
            // In a real implementation, you would format the message
            self.write_str("<formatted message>\n");
        }

        self.write_str("=== END PANIC INFO ===\n");
    }

    fn write_str(&mut self, s: &str) {
        let bytes = s.as_bytes();
        for &byte in bytes {
            if self.position < self.buffer.len() {
                self.buffer[self.position] = byte;
                self.position += 1;
            }
        }
    }

    fn write_number(&mut self, n: u32) {
        if n == 0 {
            self.write_str("0");
            return;
        }

        let mut num = n;
        let mut digits = [0u8; 10];
        let mut count = 0;

        while num > 0 {
            digits[count] = (num % 10) as u8 + b'0';
            num /= 10;
            count += 1;
        }

        for i in (0..count).rev() {
            if self.position < self.buffer.len() {
                self.buffer[self.position] = digits[i];
                self.position += 1;
            }
        }
    }
}

#[panic_handler]
fn panic_handler(info: &PanicInfo) -> ! {
    let mut handler = DebugPanicHandler::new();
    handler.log_panic(info);

    // Trigger breakpoint for debugging
    unsafe {
        core::arch::asm!("bkpt", options(nomem, nostack));
    }

    // Halt for debugging
    loop {
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Debug panic test");
}
```

### Exercise 3: Production Panic Handler

**What**: Implement a production panic handler with error logging and system recovery.

**How**: Implement this exercise:

```rust
#![no_std]

use core::panic::PanicInfo;

struct ProductionPanicHandler {
    // In a real system, this would be flash memory or EEPROM
    error_log: [u8; 128],
    log_position: usize,
}

impl ProductionPanicHandler {
    fn new() -> Self {
        Self {
            error_log: [0; 128],
            log_position: 0,
        }
    }

    fn log_panic(&mut self, info: &PanicInfo) {
        // Log error code
        self.write_bytes(&[0xDE, 0xAD, 0xBE, 0xEF]);

        // Log location if available
        if let Some(location) = info.location() {
            let file_hash = self.hash_string(location.file());
            self.write_bytes(&file_hash.to_le_bytes());
            self.write_bytes(&(location.line() as u32).to_le_bytes());
        }

        // Log timestamp (placeholder)
        self.write_bytes(&[0x12, 0x34, 0x56, 0x78]);
    }

    fn write_bytes(&mut self, bytes: &[u8]) {
        for &byte in bytes {
            if self.log_position < self.error_log.len() {
                self.error_log[self.log_position] = byte;
                self.log_position += 1;
            }
        }
    }

    fn hash_string(&self, s: &str) -> u32 {
        let mut hash = 0u32;
        for &byte in s.as_bytes() {
            hash = hash.wrapping_mul(31).wrapping_add(byte as u32);
        }
        hash
    }
}

#[panic_handler]
fn panic_handler(info: &PanicInfo) -> ! {
    // Log panic information
    let mut handler = ProductionPanicHandler::new();
    handler.log_panic(info);

    // Perform system recovery
    system_recovery();

    // Enter safe state
    loop {
        // In a real system, you might:
        // - Blink status LED
        // - Wait for watchdog reset
        core::arch::asm!("wfi", options(nomem, nostack));
    }
}

fn system_recovery() {
    // In a real system, you would:
    // - Save critical data
    // - Notify external systems
    // - Perform cleanup
}

fn main() {
    // This would trigger a panic for demonstration
    // panic!("Production panic test");
}
```

## Key Takeaways

**What** you've learned about panic handling in embedded Rust:

1. **Panic Information** - `PanicInfo` provides access to panic location, message, and payload
2. **Custom Panic Handlers** - Application-specific panic handling behavior
3. **Debugging Support** - Detailed error information for development and debugging
4. **Production Handling** - Reliable error handling for deployed systems
5. **Hardware Integration** - Integration with hardware-specific components
6. **Error Logging** - Persistent storage of error information
7. **System Recovery** - Graceful error handling and system recovery

**Why** these concepts matter:

- **System Reliability** - Robust error handling ensures system stability
- **Debugging Capabilities** - Effective debugging tools accelerate development
- **Production Deployment** - Reliable error handling in production systems
- **Safety Requirements** - Meeting safety-critical system requirements

## Next Steps

Now that you understand panic handling, you're ready to learn about:

- **Hardware abstraction** - Creating abstractions for hardware peripherals
- **Interrupts and timers** - Handling asynchronous events and timing
- **Communication protocols** - Implementing UART, I2C, and SPI communication
- **Practical exercises** - Hands-on projects to apply your knowledge

**Where** to go next: Continue with the next lesson on "Hardware Abstraction Layers" to learn about creating abstractions for embedded hardware!
