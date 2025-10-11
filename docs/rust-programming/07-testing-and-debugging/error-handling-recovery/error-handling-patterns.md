---
sidebar_position: 1
---

# Error Handling Patterns

Master error handling patterns in Rust with comprehensive explanations using the 4W+H framework.

## What Are Error Handling Patterns?

**What**: Error handling patterns are established approaches for managing errors, failures, and exceptional conditions in Rust programs. They provide structured ways to handle, propagate, and recover from errors.

**Why**: Error handling patterns provide:

- **Robustness** - programs that handle errors gracefully
- **Reliability** - predictable behavior in error conditions
- **Maintainability** - clear error handling code
- **User experience** - meaningful error messages and recovery
- **Debugging** - clear error information for troubleshooting

**When**: Use error handling patterns when you need to:

- Handle potential failures in operations
- Provide meaningful error messages
- Implement recovery strategies
- Ensure program stability
- Debug and troubleshoot issues

**Where**: Error handling patterns are used throughout Rust programs, from low-level operations to high-level application logic.

## How to Use Result and Option

### Basic Result Usage

**What**: `Result<T, E>` is Rust's primary error handling type that represents either success (`Ok(T)`) or failure (`Err(E)`).

**How**: Here's how to use `Result` for error handling:

```rust
use std::fs;
use std::io;

// Function that can fail
fn read_file(filename: &str) -> Result<String, io::Error> {
    fs::read_to_string(filename)
}

// Function that processes the result
fn process_file(filename: &str) -> Result<(), io::Error> {
    let content = read_file(filename)?;  // ? operator propagates errors
    println!("File content: {}", content);
    Ok(())
}

fn main() {
    match process_file("example.txt") {
        Ok(()) => println!("File processed successfully"),
        Err(e) => println!("Error processing file: {}", e),
    }
}
```

**Explanation**:

- `Result<String, io::Error>` indicates the function can return either a string or an error
- `?` operator automatically propagates errors up the call stack
- `match` handles both success and error cases
- Error handling is explicit and type-safe

**Why**: `Result` provides type-safe error handling that prevents crashes and makes errors explicit.

### Advanced Result Usage

**What**: Advanced `Result` usage includes custom error types, error chaining, and error recovery.

**How**: Here's how to implement advanced `Result` usage:

```rust
use std::fs;
use std::io;
use std::num::ParseIntError;

// Custom error type
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(ParseIntError),
    InvalidData(String),
}

impl From<io::Error> for AppError {
    fn from(err: io::Error) -> Self {
        AppError::Io(err)
    }
}

impl From<ParseIntError> for AppError {
    fn from(err: ParseIntError) -> Self {
        AppError::Parse(err)
    }
}

// Function that can fail with custom error
fn read_and_parse_number(filename: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(filename)?;  // Io error
    let trimmed = content.trim();

    if trimmed.is_empty() {
        return Err(AppError::InvalidData("Empty file".to_string()));
    }

    let number = trimmed.parse::<i32>()?;  // Parse error
    Ok(number)
}

// Function with error recovery
fn process_with_recovery(filename: &str) -> Result<i32, AppError> {
    match read_and_parse_number(filename) {
        Ok(number) => Ok(number),
        Err(AppError::Io(_)) => {
            // Try alternative file
            read_and_parse_number("backup.txt")
        },
        Err(e) => Err(e),
    }
}

fn main() {
    match process_with_recovery("data.txt") {
        Ok(number) => println!("Number: {}", number),
        Err(e) => println!("Error: {:?}", e),
    }
}
```

**Explanation**:

- Custom error type `AppError` provides specific error information
- `From` trait implementations enable automatic error conversion
- Error recovery attempts alternative approaches
- Error chaining preserves error context

**Why**: Advanced `Result` usage provides better error information and recovery strategies.

### Option Usage

**What**: `Option<T>` represents a value that might or might not exist, providing a safe alternative to null pointers.

**How**: Here's how to use `Option` for optional values:

```rust
use std::collections::HashMap;

// Function that might not find a value
fn find_user(users: &HashMap<String, i32>, name: &str) -> Option<i32> {
    users.get(name).copied()
}

// Function that processes optional values
fn process_user(users: &HashMap<String, i32>, name: &str) -> Option<String> {
    let age = find_user(users, name)?;  // ? operator for Option

    if age < 18 {
        None  // User is too young
    } else {
        Some(format!("User {} is {} years old", name, age))
    }
}

// Function with default values
fn get_user_info(users: &HashMap<String, i32>, name: &str) -> String {
    find_user(users, name)
        .map(|age| format!("User {} is {} years old", name, age))
        .unwrap_or_else(|| format!("User {} not found", name))
}

fn main() {
    let mut users = HashMap::new();
    users.insert("Alice".to_string(), 25);
    users.insert("Bob".to_string(), 17);

    // Handle optional values
    match process_user(&users, "Alice") {
        Some(info) => println!("{}", info),
        None => println!("User not found or too young"),
    }

    // Use default values
    println!("{}", get_user_info(&users, "Charlie"));
}
```

**Explanation**:

- `Option<T>` represents optional values safely
- `?` operator works with `Option` for early returns
- `map` and `unwrap_or_else` provide default value handling
- No null pointer dereferences are possible

**Why**: `Option` prevents null pointer errors and makes optional values explicit.

## Understanding Error Propagation

### Error Propagation with ?

**What**: The `?` operator provides concise error propagation by automatically returning errors from functions.

**How**: Here's how to use the `?` operator for error propagation:

```rust
use std::fs;
use std::io;
use std::num::ParseIntError;

// Function with multiple error types
fn read_and_parse_number(filename: &str) -> Result<i32, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(filename)?;  // Io error
    let number = content.trim().parse::<i32>()?;   // Parse error
    Ok(number)
}

// Function that processes multiple files
fn process_files(filenames: &[&str]) -> Result<Vec<i32>, Box<dyn std::error::Error>> {
    let mut numbers = Vec::new();

    for filename in filenames {
        let number = read_and_parse_number(filename)?;  // Propagate errors
        numbers.push(number);
    }

    Ok(numbers)
}

// Function with error context
fn process_with_context(filename: &str) -> Result<i32, Box<dyn std::error::Error>> {
    let content = fs::read_to_string(filename)
        .map_err(|e| format!("Failed to read file '{}': {}", filename, e))?;

    let number = content.trim().parse::<i32>()
        .map_err(|e| format!("Failed to parse number from '{}': {}", filename, e))?;

    Ok(number)
}

fn main() {
    let filenames = ["data1.txt", "data2.txt", "data3.txt"];

    match process_files(&filenames) {
        Ok(numbers) => println!("Numbers: {:?}", numbers),
        Err(e) => println!("Error: {}", e),
    }
}
```

**Explanation**:

- `?` operator automatically propagates errors
- `Box<dyn std::error::Error>` handles multiple error types
- Error context provides meaningful error messages
- Error propagation is concise and readable

**Why**: Error propagation with `?` makes error handling concise and readable.

### Error Chaining

**What**: Error chaining preserves error context and provides detailed error information.

**How**: Here's how to implement error chaining:

```rust
use std::fs;
use std::io;
use std::num::ParseIntError;

// Custom error type with chaining
#[derive(Debug)]
enum AppError {
    Io(io::Error),
    Parse(ParseIntError),
    InvalidData(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "IO error: {}", e),
            AppError::Parse(e) => write!(f, "Parse error: {}", e),
            AppError::InvalidData(msg) => write!(f, "Invalid data: {}", msg),
        }
    }
}

impl std::error::Error for AppError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            AppError::Io(e) => Some(e),
            AppError::Parse(e) => Some(e),
            AppError::InvalidData(_) => None,
        }
    }
}

// Function with error chaining
fn read_and_parse_number(filename: &str) -> Result<i32, AppError> {
    let content = fs::read_to_string(filename)
        .map_err(|e| AppError::Io(e))?;

    let trimmed = content.trim();
    if trimmed.is_empty() {
        return Err(AppError::InvalidData("Empty file".to_string()));
    }

    let number = trimmed.parse::<i32>()
        .map_err(|e| AppError::Parse(e))?;

    Ok(number)
}

fn main() {
    match read_and_parse_number("data.txt") {
        Ok(number) => println!("Number: {}", number),
        Err(e) => {
            println!("Error: {}", e);
            if let Some(source) = e.source() {
                println!("Caused by: {}", source);
            }
        }
    }
}
```

**Explanation**:

- Custom error type implements `Display` and `Error` traits
- Error chaining preserves context through the call stack
- `source()` method provides access to underlying errors
- Error information is detailed and useful for debugging

**Why**: Error chaining provides better error information and debugging capabilities.

## Understanding Recovery Strategies

### Retry Mechanisms

**What**: Retry mechanisms automatically retry failed operations with exponential backoff and circuit breaker patterns.

**How**: Here's how to implement retry mechanisms:

```rust
use std::thread;
use std::time::Duration;

// Retry configuration
struct RetryConfig {
    max_attempts: usize,
    base_delay: Duration,
    max_delay: Duration,
}

impl RetryConfig {
    fn new() -> Self {
        Self {
            max_attempts: 3,
            base_delay: Duration::from_millis(100),
            max_delay: Duration::from_secs(1),
        }
    }
}

// Function that can fail
fn unreliable_operation() -> Result<String, String> {
    // Simulate random failure
    if rand::random::<f64>() < 0.7 {
        Err("Operation failed".to_string())
    } else {
        Ok("Operation succeeded".to_string())
    }
}

// Retry mechanism
fn retry_operation<F, T, E>(operation: F, config: RetryConfig) -> Result<T, E>
where
    F: Fn() -> Result<T, E>,
{
    let mut delay = config.base_delay;

    for attempt in 1..=config.max_attempts {
        match operation() {
            Ok(result) => return Ok(result),
            Err(e) if attempt == config.max_attempts => return Err(e),
            Err(_) => {
                println!("Attempt {} failed, retrying in {:?}", attempt, delay);
                thread::sleep(delay);
                delay = std::cmp::min(delay * 2, config.max_delay);
            }
        }
    }

    unreachable!()
}

fn main() {
    let config = RetryConfig::new();

    match retry_operation(unreliable_operation, config) {
        Ok(result) => println!("Success: {}", result),
        Err(e) => println!("Failed after retries: {}", e),
    }
}
```

**Explanation**:

- Retry configuration controls retry behavior
- Exponential backoff prevents overwhelming failing services
- Maximum attempts limit retry attempts
- Retry mechanism is generic and reusable

**Why**: Retry mechanisms provide resilience against transient failures.

### Circuit Breaker Pattern

**What**: Circuit breaker pattern prevents cascading failures by stopping calls to failing services.

**How**: Here's how to implement the circuit breaker pattern:

```rust
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

// Circuit breaker states
#[derive(Debug, Clone)]
enum CircuitState {
    Closed,    // Normal operation
    Open,      // Circuit is open, calls fail fast
    HalfOpen,  // Testing if service is back
}

// Circuit breaker implementation
struct CircuitBreaker {
    state: Arc<Mutex<CircuitState>>,
    failure_count: Arc<Mutex<usize>>,
    last_failure: Arc<Mutex<Option<Instant>>>,
    failure_threshold: usize,
    timeout: Duration,
}

impl CircuitBreaker {
    fn new(failure_threshold: usize, timeout: Duration) -> Self {
        Self {
            state: Arc::new(Mutex::new(CircuitState::Closed)),
            failure_count: Arc::new(Mutex::new(0)),
            last_failure: Arc::new(Mutex::new(None)),
            failure_threshold,
            timeout,
        }
    }

    fn call<F, T, E>(&self, operation: F) -> Result<T, E>
    where
        F: Fn() -> Result<T, E>,
    {
        let state = self.state.lock().unwrap();
        match *state {
            CircuitState::Open => {
                // Check if timeout has passed
                if let Some(last_failure) = *self.last_failure.lock().unwrap() {
                    if Instant::now().duration_since(last_failure) >= self.timeout {
                        // Transition to half-open
                        drop(state);
                        self.transition_to_half_open();
                        return self.call(operation);
                    }
                }
                Err("Circuit breaker is open".to_string().into())
            },
            CircuitState::HalfOpen => {
                // Test the service
                drop(state);
                match operation() {
                    Ok(result) => {
                        self.on_success();
                        Ok(result)
                    },
                    Err(e) => {
                        self.on_failure();
                        Err(e)
                    }
                }
            },
            CircuitState::Closed => {
                drop(state);
                match operation() {
                    Ok(result) => {
                        self.on_success();
                        Ok(result)
                    },
                    Err(e) => {
                        self.on_failure();
                        Err(e)
                    }
                }
            }
        }
    }

    fn on_success(&self) {
        let mut state = self.state.lock().unwrap();
        *state = CircuitState::Closed;
        *self.failure_count.lock().unwrap() = 0;
    }

    fn on_failure(&self) {
        let mut failure_count = self.failure_count.lock().unwrap();
        *failure_count += 1;

        if *failure_count >= self.failure_threshold {
            let mut state = self.state.lock().unwrap();
            *state = CircuitState::Open;
            *self.last_failure.lock().unwrap() = Some(Instant::now());
        }
    }

    fn transition_to_half_open(&self) {
        let mut state = self.state.lock().unwrap();
        *state = CircuitState::HalfOpen;
    }
}

fn main() {
    let circuit_breaker = CircuitBreaker::new(3, Duration::from_secs(5));

    for i in 0..10 {
        match circuit_breaker.call(|| {
            if i < 5 {
                Err("Service error".to_string())
            } else {
                Ok("Service success".to_string())
            }
        }) {
            Ok(result) => println!("Call {}: {}", i, result),
            Err(e) => println!("Call {}: Error - {}", i, e),
        }
    }
}
```

**Explanation**:

- Circuit breaker has three states: Closed, Open, HalfOpen
- Failure threshold determines when to open the circuit
- Timeout determines when to test the service again
- Circuit breaker prevents cascading failures

**Why**: Circuit breaker pattern provides resilience against failing services.

### Graceful Degradation

**What**: Graceful degradation provides alternative functionality when primary services fail.

**How**: Here's how to implement graceful degradation:

```rust
use std::time::Duration;

// Primary service
fn primary_service() -> Result<String, String> {
    // Simulate service failure
    if rand::random::<f64>() < 0.8 {
        Err("Primary service unavailable".to_string())
    } else {
        Ok("Primary service response".to_string())
    }
}

// Fallback service
fn fallback_service() -> Result<String, String> {
    // Simulate fallback service
    Ok("Fallback service response".to_string())
}

// Cached response
fn cached_response() -> Option<String> {
    // Simulate cached response
    Some("Cached response".to_string())
}

// Service with graceful degradation
fn service_with_degradation() -> Result<String, String> {
    // Try primary service
    match primary_service() {
        Ok(response) => Ok(response),
        Err(_) => {
            // Try fallback service
            match fallback_service() {
                Ok(response) => Ok(response),
                Err(_) => {
                    // Try cached response
                    match cached_response() {
                        Some(response) => Ok(response),
                        None => Err("All services unavailable".to_string()),
                    }
                }
            }
        }
    }
}

fn main() {
    match service_with_degradation() {
        Ok(response) => println!("Service response: {}", response),
        Err(e) => println!("Service error: {}", e),
    }
}
```

**Explanation**:

- Primary service is tried first
- Fallback service is used if primary fails
- Cached response is used if fallback fails
- Graceful degradation provides alternative functionality

**Why**: Graceful degradation ensures service availability even when components fail.

## Understanding Error Handling Best Practices

### Error Design

**What**: Good error design provides clear, actionable error information.

**How**: Here's how to design good errors:

```rust
use std::fmt;

// Well-designed error type
#[derive(Debug)]
enum DatabaseError {
    ConnectionFailed(String),
    QueryFailed(String),
    TransactionFailed(String),
    InvalidData(String),
}

impl fmt::Display for DatabaseError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            DatabaseError::ConnectionFailed(msg) => {
                write!(f, "Database connection failed: {}", msg)
            },
            DatabaseError::QueryFailed(msg) => {
                write!(f, "Database query failed: {}", msg)
            },
            DatabaseError::TransactionFailed(msg) => {
                write!(f, "Database transaction failed: {}", msg)
            },
            DatabaseError::InvalidData(msg) => {
                write!(f, "Invalid data: {}", msg)
            },
        }
    }
}

impl std::error::Error for DatabaseError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        None
    }
}

// Function with good error handling
fn execute_query(query: &str) -> Result<String, DatabaseError> {
    if query.is_empty() {
        return Err(DatabaseError::InvalidData("Empty query".to_string()));
    }

    if query.contains("DROP") {
        return Err(DatabaseError::InvalidData("Dangerous query not allowed".to_string()));
    }

    // Simulate query execution
    if query.contains("ERROR") {
        return Err(DatabaseError::QueryFailed("Query execution failed".to_string()));
    }

    Ok("Query executed successfully".to_string())
}

fn main() {
    let queries = vec![
        "SELECT * FROM users",
        "DROP TABLE users",
        "SELECT * FROM users WHERE ERROR",
        "",
    ];

    for query in queries {
        match execute_query(query) {
            Ok(result) => println!("Query '{}': {}", query, result),
            Err(e) => println!("Query '{}': Error - {}", query, e),
        }
    }
}
```

**Explanation**:

- Error types are specific and meaningful
- Error messages provide context and guidance
- Error handling is comprehensive and clear
- Errors are actionable and informative

**Why**: Good error design makes debugging easier and provides better user experience.

### Error Logging

**What**: Error logging provides visibility into errors and helps with debugging.

**How**: Here's how to implement error logging:

```rust
use log::{error, warn, info, debug};
use std::fs;
use std::io;

// Function with error logging
fn process_file(filename: &str) -> Result<String, io::Error> {
    debug!("Processing file: {}", filename);

    match fs::read_to_string(filename) {
        Ok(content) => {
            info!("Successfully read file: {}", filename);
            Ok(content)
        },
        Err(e) => {
            error!("Failed to read file '{}': {}", filename, e);
            Err(e)
        }
    }
}

// Function with structured error logging
fn process_data(data: &str) -> Result<String, String> {
    debug!("Processing data: length={}", data.len());

    if data.is_empty() {
        warn!("Empty data provided");
        return Err("Empty data".to_string());
    }

    if data.len() > 1000 {
        warn!("Data too large: length={}", data.len());
        return Err("Data too large".to_string());
    }

    info!("Data processed successfully: length={}", data.len());
    Ok(data.to_uppercase())
}

fn main() {
    env_logger::init();

    // Test file processing
    match process_file("example.txt") {
        Ok(content) => println!("File content: {}", content),
        Err(e) => println!("File error: {}", e),
    }

    // Test data processing
    match process_data("hello world") {
        Ok(result) => println!("Processed data: {}", result),
        Err(e) => println!("Data error: {}", e),
    }
}
```

**Explanation**:

- Error logging provides visibility into failures
- Structured logging includes relevant context
- Different log levels for different severity
- Error information helps with debugging

**Why**: Error logging provides visibility into system behavior and helps with debugging.

## Key Takeaways

**What** you've learned about error handling patterns:

1. **Result and Option** - type-safe error handling
2. **Error propagation** - using ? operator for concise error handling
3. **Error chaining** - preserving error context
4. **Recovery strategies** - retry mechanisms and circuit breakers
5. **Graceful degradation** - providing alternative functionality
6. **Error design** - creating meaningful error types
7. **Error logging** - providing visibility into errors

**Why** these concepts matter:

- **Robustness** - programs that handle errors gracefully
- **Reliability** - predictable behavior in error conditions
- **Maintainability** - clear error handling code
- **User experience** - meaningful error messages and recovery

## Next Steps

Now that you understand error handling patterns, you're ready to learn about:

- **Recovery strategies** - advanced error recovery techniques
- **Testing best practices** - comprehensive testing strategies
- **Performance optimization** - advanced performance techniques
- **Production debugging** - debugging in production environments

**Where** to go next: Continue with the next lesson on "Recovery Strategies" to learn about advanced error recovery techniques!
