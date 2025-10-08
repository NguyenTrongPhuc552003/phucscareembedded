---
sidebar_position: 4
---

# Practical Exercises

Master pattern matching and error handling through comprehensive hands-on exercises using the 4W+H framework.

## What Are Practical Exercises?

**What**: Practical exercises are hands-on coding challenges that reinforce your understanding of pattern matching and error handling concepts. These exercises combine match expressions, Result types, and Option types to solve real-world problems.

**Why**: Understanding practical exercises is crucial because:

- **Skill reinforcement** solidifies your understanding through hands-on practice
- **Real-world application** connects theoretical knowledge to practical problems
- **Problem-solving** develops your ability to apply concepts in new situations
- **Code quality** teaches you to write idiomatic, robust Rust code
- **Debugging skills** helps you identify and fix common issues
- **Best practices** reinforces proper error handling and pattern matching techniques
- **Confidence building** prepares you for real Rust development

**When**: Use practical exercises when you need to:

- Reinforce your understanding of pattern matching concepts
- Practice error handling with Result and Option types
- Apply multiple concepts together in realistic scenarios
- Build confidence in writing Rust code
- Prepare for real-world Rust development
- Test your understanding of complex patterns

**How**: Practical exercises work by:

- **Progressive difficulty** starting with simple concepts and building complexity
- **Real-world scenarios** using problems you might encounter in actual development
- **Multiple approaches** showing different ways to solve the same problem
- **Best practices** demonstrating idiomatic Rust patterns
- **Error handling** emphasizing robust error management
- **Code quality** focusing on readable, maintainable solutions

**Where**: These exercises are used throughout Rust development for learning, skill building, and problem-solving practice.

## Exercise 1: User Input Validation System

### Problem Description

**What**: Create a comprehensive user input validation system that handles various types of user input with proper error handling.

**Why**: This exercise teaches you to combine pattern matching, Result types, and Option types in a realistic scenario.

**When**: Use this pattern when you need to validate and process user input safely.

**How**: Here's how to implement the user input validation system:

```rust
use std::io;

#[derive(Debug)]
enum ValidationError {
    EmptyInput,
    InvalidFormat,
    OutOfRange,
    InvalidEmail,
    WeakPassword,
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ValidationError::EmptyInput => write!(f, "Input cannot be empty"),
            ValidationError::InvalidFormat => write!(f, "Invalid input format"),
            ValidationError::OutOfRange => write!(f, "Value is out of valid range"),
            ValidationError::InvalidEmail => write!(f, "Invalid email format"),
            ValidationError::WeakPassword => write!(f, "Password is too weak"),
        }
    }
}

impl std::error::Error for ValidationError {}

fn main() {
    println!("User Input Validation System");
    println!("============================");

    // Test different validation scenarios
    test_validation();
}

fn test_validation() {
    // Test age validation
    let ages = vec!["25", "0", "150", "abc", "-5", ""];
    for age_str in ages {
        match validate_age(age_str) {
            Ok(age) => println!("Age '{}' is valid: {}", age_str, age),
            Err(error) => println!("Age '{}' is invalid: {}", age_str, error),
        }
    }

    println!();

    // Test email validation
    let emails = vec!["user@example.com", "invalid-email", "test@", "@domain.com", ""];
    for email in emails {
        match validate_email(email) {
            Ok(valid_email) => println!("Email '{}' is valid: {}", email, valid_email),
            Err(error) => println!("Email '{}' is invalid: {}", email, error),
        }
    }

    println!();

    // Test password validation
    let passwords = vec!["strongpass123", "weak", "12345678", "StrongPass!", ""];
    for password in passwords {
        match validate_password(password) {
            Ok(valid_password) => println!("Password '{}' is valid: {}", password, valid_password),
            Err(error) => println!("Password '{}' is invalid: {}", password, error),
        }
    }
}

fn validate_age(input: &str) -> Result<u32, ValidationError> {
    if input.is_empty() {
        return Err(ValidationError::EmptyInput);
    }

    let age: u32 = input.parse()
        .map_err(|_| ValidationError::InvalidFormat)?;

    if age < 1 || age > 120 {
        return Err(ValidationError::OutOfRange);
    }

    Ok(age)
}

fn validate_email(input: &str) -> Result<String, ValidationError> {
    if input.is_empty() {
        return Err(ValidationError::EmptyInput);
    }

    if !input.contains('@') || !input.contains('.') {
        return Err(ValidationError::InvalidEmail);
    }

    let parts: Vec<&str> = input.split('@').collect();
    if parts.len() != 2 || parts[0].is_empty() || parts[1].is_empty() {
        return Err(ValidationError::InvalidEmail);
    }

    Ok(input.to_string())
}

fn validate_password(input: &str) -> Result<String, ValidationError> {
    if input.is_empty() {
        return Err(ValidationError::EmptyInput);
    }

    if input.len() < 8 {
        return Err(ValidationError::WeakPassword);
    }

    let has_uppercase = input.chars().any(|c| c.is_uppercase());
    let has_lowercase = input.chars().any(|c| c.is_lowercase());
    let has_digit = input.chars().any(|c| c.is_digit(10));

    if !has_uppercase || !has_lowercase || !has_digit {
        return Err(ValidationError::WeakPassword);
    }

    Ok(input.to_string())
}
```

**Explanation**:

- `enum ValidationError` defines different types of validation errors
- `impl std::fmt::Display` provides human-readable error messages
- `validate_age` uses the `?` operator for error propagation
- `validate_email` checks for basic email format requirements
- `validate_password` enforces password strength requirements
- Pattern matching handles different error types appropriately
- This demonstrates comprehensive error handling in a realistic scenario

**Why**: This exercise combines multiple error handling concepts in a practical, real-world application.

## Exercise 2: File Processing System

### Problem Description

**What**: Create a file processing system that safely handles file operations with comprehensive error handling.

**Why**: This exercise teaches you to work with file I/O, Result types, and error propagation in a realistic scenario.

**When**: Use this pattern when you need to process files safely with proper error handling.

**How**: Here's how to implement the file processing system:

```rust
use std::fs;
use std::path::Path;

#[derive(Debug)]
enum FileError {
    FileNotFound,
    PermissionDenied,
    InvalidFormat,
    ProcessingError(String),
    EmptyFile,
}

impl std::fmt::Display for FileError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            FileError::FileNotFound => write!(f, "File not found"),
            FileError::PermissionDenied => write!(f, "Permission denied"),
            FileError::InvalidFormat => write!(f, "Invalid file format"),
            FileError::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
            FileError::EmptyFile => write!(f, "File is empty"),
        }
    }
}

impl std::error::Error for FileError {}

fn main() {
    println!("File Processing System");
    println!("=====================");

    // Test file processing
    test_file_processing();
}

fn test_file_processing() {
    let files = vec![
        "data.txt",
        "nonexistent.txt",
        "empty.txt",
        "config.json",
        "image.jpg",
    ];

    for filename in files {
        match process_file(filename) {
            Ok(result) => println!("File '{}' processed successfully: {}", filename, result),
            Err(error) => println!("File '{}' processing failed: {}", filename, error),
        }
    }
}

fn process_file(filename: &str) -> Result<String, FileError> {
    // Check if file exists
    if !Path::new(filename).exists() {
        return Err(FileError::FileNotFound);
    }

    // Read file content
    let content = fs::read_to_string(filename)
        .map_err(|_| FileError::PermissionDenied)?;

    // Check if file is empty
    if content.is_empty() {
        return Err(FileError::EmptyFile);
    }

    // Process based on file type
    let result = match filename.split('.').last() {
        Some("txt") => process_text_file(&content)?,
        Some("json") => process_json_file(&content)?,
        Some("csv") => process_csv_file(&content)?,
        _ => return Err(FileError::InvalidFormat),
    };

    Ok(result)
}

fn process_text_file(content: &str) -> Result<String, FileError> {
    let lines: Vec<&str> = content.lines().collect();
    let word_count: usize = content.split_whitespace().count();

    Ok(format!("Text file: {} lines, {} words", lines.len(), word_count))
}

fn process_json_file(content: &str) -> Result<String, FileError> {
    // Simple JSON validation
    if !content.trim_start().starts_with('{') && !content.trim_start().starts_with('[') {
        return Err(FileError::ProcessingError("Invalid JSON format".to_string()));
    }

    let char_count = content.chars().count();
    Ok(format!("JSON file: {} characters", char_count))
}

fn process_csv_file(content: &str) -> Result<String, FileError> {
    let lines: Vec<&str> = content.lines().collect();
    if lines.is_empty() {
        return Err(FileError::ProcessingError("Empty CSV file".to_string()));
    }

    let columns = lines[0].split(',').count();
    Ok(format!("CSV file: {} rows, {} columns", lines.len(), columns))
}
```

**Explanation**:

- `enum FileError` defines different types of file processing errors
- `process_file` uses the `?` operator for error propagation
- Pattern matching handles different file types appropriately
- Error handling covers file existence, permissions, and content validation
- This demonstrates comprehensive file processing with proper error handling

**Why**: This exercise teaches you to handle file operations safely with comprehensive error management.

## Exercise 3: Data Processing Pipeline

### Problem Description

**What**: Create a data processing pipeline that safely processes data with multiple validation steps and error handling.

**Why**: This exercise teaches you to chain multiple operations with proper error handling and data transformation.

**When**: Use this pattern when you need to process data through multiple validation and transformation steps.

**How**: Here's how to implement the data processing pipeline:

```rust
#[derive(Debug, Clone)]
struct Person {
    name: String,
    age: u32,
    email: String,
}

#[derive(Debug)]
enum ProcessingError {
    InvalidData(String),
    ValidationFailed(String),
    ProcessingError(String),
}

impl std::fmt::Display for ProcessingError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ProcessingError::InvalidData(msg) => write!(f, "Invalid data: {}", msg),
            ProcessingError::ValidationFailed(msg) => write!(f, "Validation failed: {}", msg),
            ProcessingError::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
        }
    }
}

impl std::error::Error for ProcessingError {}

fn main() {
    println!("Data Processing Pipeline");
    println!("========================");

    // Test data processing
    test_data_processing();
}

fn test_data_processing() {
    let raw_data = vec![
        ("Alice", "25", "alice@example.com"),
        ("Bob", "30", "bob@example.com"),
        ("Charlie", "0", "charlie@example.com"), // Invalid age
        ("David", "35", "invalid-email"), // Invalid email
        ("Eve", "28", "eve@example.com"),
    ];

    for (name, age_str, email) in raw_data {
        match process_person_data(name, age_str, email) {
            Ok(person) => println!("Processed: {:?}", person),
            Err(error) => println!("Failed to process {}: {}", name, error),
        }
    }
}

fn process_person_data(name: &str, age_str: &str, email: &str) -> Result<Person, ProcessingError> {
    // Step 1: Parse and validate age
    let age = parse_age(age_str)?;

    // Step 2: Validate email
    let valid_email = validate_email(email)?;

    // Step 3: Validate name
    let valid_name = validate_name(name)?;

    // Step 4: Create person
    let person = Person {
        name: valid_name,
        age,
        email: valid_email,
    };

    // Step 5: Final validation
    validate_person(&person)?;

    Ok(person)
}

fn parse_age(age_str: &str) -> Result<u32, ProcessingError> {
    if age_str.is_empty() {
        return Err(ProcessingError::InvalidData("Age cannot be empty".to_string()));
    }

    let age: u32 = age_str.parse()
        .map_err(|_| ProcessingError::InvalidData("Invalid age format".to_string()))?;

    if age < 1 || age > 120 {
        return Err(ProcessingError::ValidationFailed("Age must be between 1 and 120".to_string()));
    }

    Ok(age)
}

fn validate_email(email: &str) -> Result<String, ProcessingError> {
    if email.is_empty() {
        return Err(ProcessingError::InvalidData("Email cannot be empty".to_string()));
    }

    if !email.contains('@') || !email.contains('.') {
        return Err(ProcessingError::ValidationFailed("Invalid email format".to_string()));
    }

    Ok(email.to_string())
}

fn validate_name(name: &str) -> Result<String, ProcessingError> {
    if name.is_empty() {
        return Err(ProcessingError::InvalidData("Name cannot be empty".to_string()));
    }

    if name.len() < 2 {
        return Err(ProcessingError::ValidationFailed("Name must be at least 2 characters".to_string()));
    }

    Ok(name.to_string())
}

fn validate_person(person: &Person) -> Result<(), ProcessingError> {
    if person.name.len() < 2 {
        return Err(ProcessingError::ValidationFailed("Name is too short".to_string()));
    }

    if person.age < 1 || person.age > 120 {
        return Err(ProcessingError::ValidationFailed("Age is out of range".to_string()));
    }

    if !person.email.contains('@') {
        return Err(ProcessingError::ValidationFailed("Invalid email format".to_string()));
    }

    Ok(())
}
```

**Explanation**:

- `struct Person` represents the processed data
- `enum ProcessingError` defines different types of processing errors
- `process_person_data` chains multiple validation steps
- Each step can fail and propagate errors using the `?` operator
- Final validation ensures all data is correct
- This demonstrates comprehensive data processing with proper error handling

**Why**: This exercise teaches you to build robust data processing pipelines with comprehensive error handling.

## Exercise 4: Configuration Management System

### Problem Description

**What**: Create a configuration management system that safely loads and validates configuration data with proper error handling.

**Why**: This exercise teaches you to work with configuration data, Option types, and Result types in a realistic scenario.

**When**: Use this pattern when you need to manage configuration data safely with proper validation.

**How**: Here's how to implement the configuration management system:

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Config {
    database_url: Option<String>,
    port: Option<u16>,
    debug_mode: bool,
    max_connections: u32,
    timeout_seconds: u64,
}

#[derive(Debug)]
enum ConfigError {
    MissingRequired(String),
    InvalidValue(String),
    ParseError(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ConfigError::MissingRequired(key) => write!(f, "Missing required configuration: {}", key),
            ConfigError::InvalidValue(key) => write!(f, "Invalid value for configuration: {}", key),
            ConfigError::ParseError(msg) => write!(f, "Parse error: {}", msg),
        }
    }
}

impl std::error::Error for ConfigError {}

fn main() {
    println!("Configuration Management System");
    println!("===============================");

    // Test configuration loading
    test_config_loading();
}

fn test_config_loading() {
    let configs = vec![
        // Valid configuration
        create_test_config(true),
        // Missing required field
        create_test_config(false),
        // Invalid values
        create_invalid_config(),
    ];

    for (i, config_data) in configs.iter().enumerate() {
        match load_config(config_data) {
            Ok(config) => println!("Config {} loaded successfully: {:?}", i + 1, config),
            Err(error) => println!("Config {} failed to load: {}", i + 1, error),
        }
    }
}

fn create_test_config(include_database: bool) -> HashMap<String, String> {
    let mut config = HashMap::new();
    config.insert("port".to_string(), "8080".to_string());
    config.insert("debug_mode".to_string(), "true".to_string());
    config.insert("max_connections".to_string(), "100".to_string());
    config.insert("timeout_seconds".to_string(), "30".to_string());

    if include_database {
        config.insert("database_url".to_string(), "postgresql://localhost:5432/mydb".to_string());
    }

    config
}

fn create_invalid_config() -> HashMap<String, String> {
    let mut config = HashMap::new();
    config.insert("port".to_string(), "invalid_port".to_string());
    config.insert("debug_mode".to_string(), "maybe".to_string());
    config.insert("max_connections".to_string(), "-1".to_string());
    config.insert("timeout_seconds".to_string(), "not_a_number".to_string());
    config
}

fn load_config(config_data: &HashMap<String, String>) -> Result<Config, ConfigError> {
    // Load database URL (optional)
    let database_url = config_data.get("database_url").map(|s| s.clone());

    // Load port (optional)
    let port = match config_data.get("port") {
        Some(port_str) => {
            let port: u16 = port_str.parse()
                .map_err(|_| ConfigError::ParseError("Invalid port format".to_string()))?;
            Some(port)
        }
        None => None,
    };

    // Load debug mode (required)
    let debug_mode = match config_data.get("debug_mode") {
        Some(value) => match value.as_str() {
            "true" => true,
            "false" => false,
            _ => return Err(ConfigError::InvalidValue("debug_mode".to_string())),
        }
        None => return Err(ConfigError::MissingRequired("debug_mode".to_string())),
    };

    // Load max connections (required)
    let max_connections = match config_data.get("max_connections") {
        Some(value) => {
            let connections: u32 = value.parse()
                .map_err(|_| ConfigError::ParseError("Invalid max_connections format".to_string()))?;
            if connections == 0 {
                return Err(ConfigError::InvalidValue("max_connections".to_string()));
            }
            connections
        }
        None => return Err(ConfigError::MissingRequired("max_connections".to_string())),
    };

    // Load timeout (required)
    let timeout_seconds = match config_data.get("timeout_seconds") {
        Some(value) => {
            let timeout: u64 = value.parse()
                .map_err(|_| ConfigError::ParseError("Invalid timeout_seconds format".to_string()))?;
            if timeout == 0 {
                return Err(ConfigError::InvalidValue("timeout_seconds".to_string()));
            }
            timeout
        }
        None => return Err(ConfigError::MissingRequired("timeout_seconds".to_string())),
    };

    Ok(Config {
        database_url,
        port,
        debug_mode,
        max_connections,
        timeout_seconds,
    })
}
```

**Explanation**:

- `struct Config` represents the loaded configuration with optional and required fields
- `enum ConfigError` defines different types of configuration errors
- `load_config` safely loads and validates configuration data
- Optional fields are handled with `Option` types
- Required fields are validated and return errors if missing
- This demonstrates comprehensive configuration management with proper error handling

**Why**: This exercise teaches you to manage configuration data safely with comprehensive validation and error handling.

## Exercise 5: Advanced Pattern Matching

### Problem Description

**What**: Create a system that demonstrates advanced pattern matching techniques with complex data structures and conditions.

**Why**: This exercise teaches you to use advanced pattern matching features like guards, destructuring, and complex patterns.

**When**: Use this pattern when you need to handle complex data structures with sophisticated pattern matching.

**How**: Here's how to implement the advanced pattern matching system:

```rust
#[derive(Debug, Clone)]
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle { base: f64, height: f64 },
    Square { side: f64 },
}

#[derive(Debug, Clone)]
enum Color {
    Red,
    Green,
    Blue,
    Yellow,
    Custom(String),
}

#[derive(Debug, Clone)]
struct ColoredShape {
    shape: Shape,
    color: Color,
    opacity: f64,
}

fn main() {
    println!("Advanced Pattern Matching System");
    println!("================================");

    // Test advanced pattern matching
    test_advanced_pattern_matching();
}

fn test_advanced_pattern_matching() {
    let shapes = vec![
        ColoredShape {
            shape: Shape::Circle { radius: 5.0 },
            color: Color::Red,
            opacity: 1.0,
        },
        ColoredShape {
            shape: Shape::Rectangle { width: 10.0, height: 5.0 },
            color: Color::Green,
            opacity: 0.8,
        },
        ColoredShape {
            shape: Shape::Triangle { base: 8.0, height: 6.0 },
            color: Color::Blue,
            opacity: 0.5,
        },
        ColoredShape {
            shape: Shape::Square { side: 4.0 },
            color: Color::Custom("purple".to_string()),
            opacity: 0.9,
        },
    ];

    for shape in shapes {
        process_shape(&shape);
    }
}

fn process_shape(colored_shape: &ColoredShape) {
    match colored_shape {
        // Circle with high opacity
        ColoredShape {
            shape: Shape::Circle { radius },
            color: Color::Red,
            opacity
        } if *opacity > 0.8 => {
            println!("High opacity red circle with radius: {}", radius);
        }

        // Circle with low opacity
        ColoredShape {
            shape: Shape::Circle { radius },
            color,
            opacity
        } if *opacity <= 0.8 => {
            println!("Low opacity {:?} circle with radius: {}", color, radius);
        }

        // Rectangle with specific dimensions
        ColoredShape {
            shape: Shape::Rectangle { width, height },
            color: Color::Green,
            opacity
        } if *width > 5.0 && *height > 5.0 => {
            println!("Large green rectangle: {}x{}", width, height);
        }

        // Rectangle with small dimensions
        ColoredShape {
            shape: Shape::Rectangle { width, height },
            color,
            opacity
        } => {
            println!("Small {:?} rectangle: {}x{}", color, width, height);
        }

        // Triangle with custom color
        ColoredShape {
            shape: Shape::Triangle { base, height },
            color: Color::Custom(color_name),
            opacity
        } => {
            println!("Custom colored triangle: {}x{} in {}", base, height, color_name);
        }

        // Triangle with standard color
        ColoredShape {
            shape: Shape::Triangle { base, height },
            color,
            opacity
        } => {
            println!("Standard colored triangle: {}x{} in {:?}", base, height, color);
        }

        // Square with specific side length
        ColoredShape {
            shape: Shape::Square { side },
            color,
            opacity
        } if *side == 4.0 => {
            println!("4x4 {:?} square", color);
        }

        // Square with other side length
        ColoredShape {
            shape: Shape::Square { side },
            color,
            opacity
        } => {
            println!("{:?} square with side: {}", color, side);
        }
    }
}

fn calculate_area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle { base, height } => 0.5 * base * height,
        Shape::Square { side } => side * side,
    }
}

fn get_shape_info(shape: &Shape) -> String {
    match shape {
        Shape::Circle { radius } => format!("Circle with radius {}", radius),
        Shape::Rectangle { width, height } => format!("Rectangle {}x{}", width, height),
        Shape::Triangle { base, height } => format!("Triangle {}x{}", base, height),
        Shape::Square { side } => format!("Square {}x{}", side, side),
    }
}
```

**Explanation**:

- `enum Shape` defines different geometric shapes with associated data
- `enum Color` defines different colors including custom colors
- `struct ColoredShape` combines shape and color information
- Pattern matching uses guards (`if` conditions) for complex logic
- Destructuring extracts values from complex data structures
- Multiple patterns handle different combinations of shape and color
- This demonstrates advanced pattern matching with complex data structures

**Why**: This exercise teaches you to use advanced pattern matching features for complex data processing.

## Exercise 6: Error Recovery System

### Problem Description

**What**: Create an error recovery system that demonstrates different strategies for handling and recovering from errors.

**Why**: This exercise teaches you to implement error recovery strategies and handle different types of failures gracefully.

**When**: Use this pattern when you need to build robust systems that can recover from various types of errors.

**How**: Here's how to implement the error recovery system:

```rust
use std::collections::HashMap;

#[derive(Debug)]
enum SystemError {
    NetworkError(String),
    DatabaseError(String),
    ValidationError(String),
    TimeoutError(String),
    UnknownError(String),
}

impl std::fmt::Display for SystemError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            SystemError::NetworkError(msg) => write!(f, "Network error: {}", msg),
            SystemError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
            SystemError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            SystemError::TimeoutError(msg) => write!(f, "Timeout error: {}", msg),
            SystemError::UnknownError(msg) => write!(f, "Unknown error: {}", msg),
        }
    }
}

impl std::error::Error for SystemError {}

fn main() {
    println!("Error Recovery System");
    println!("====================");

    // Test error recovery
    test_error_recovery();
}

fn test_error_recovery() {
    let operations = vec![
        "network_operation",
        "database_operation",
        "validation_operation",
        "timeout_operation",
        "unknown_operation",
    ];

    for operation in operations {
        match perform_operation_with_recovery(operation) {
            Ok(result) => println!("Operation '{}' succeeded: {}", operation, result),
            Err(error) => println!("Operation '{}' failed: {}", operation, error),
        }
    }
}

fn perform_operation_with_recovery(operation: &str) -> Result<String, SystemError> {
    // Try primary operation
    match perform_primary_operation(operation) {
        Ok(result) => Ok(result),
        Err(error) => {
            println!("Primary operation failed: {}", error);

            // Try recovery strategies
            match error {
                SystemError::NetworkError(_) => {
                    println!("Attempting network recovery...");
                    perform_network_recovery(operation)
                }
                SystemError::DatabaseError(_) => {
                    println!("Attempting database recovery...");
                    perform_database_recovery(operation)
                }
                SystemError::ValidationError(_) => {
                    println!("Attempting validation recovery...");
                    perform_validation_recovery(operation)
                }
                SystemError::TimeoutError(_) => {
                    println!("Attempting timeout recovery...");
                    perform_timeout_recovery(operation)
                }
                SystemError::UnknownError(_) => {
                    println!("No recovery strategy available");
                    Err(error)
                }
            }
        }
    }
}

fn perform_primary_operation(operation: &str) -> Result<String, SystemError> {
    match operation {
        "network_operation" => Err(SystemError::NetworkError("Connection failed".to_string())),
        "database_operation" => Err(SystemError::DatabaseError("Query failed".to_string())),
        "validation_operation" => Err(SystemError::ValidationError("Invalid data".to_string())),
        "timeout_operation" => Err(SystemError::TimeoutError("Operation timed out".to_string())),
        "unknown_operation" => Err(SystemError::UnknownError("Unknown operation".to_string())),
        _ => Ok("Operation completed successfully".to_string()),
    }
}

fn perform_network_recovery(operation: &str) -> Result<String, SystemError> {
    // Simulate network recovery
    println!("  - Retrying with different endpoint...");
    println!("  - Using cached data...");
    Ok("Network recovery successful".to_string())
}

fn perform_database_recovery(operation: &str) -> Result<String, SystemError> {
    // Simulate database recovery
    println!("  - Switching to backup database...");
    println!("  - Using read-only mode...");
    Ok("Database recovery successful".to_string())
}

fn perform_validation_recovery(operation: &str) -> Result<String, SystemError> {
    // Simulate validation recovery
    println!("  - Using default values...");
    println!("  - Applying data sanitization...");
    Ok("Validation recovery successful".to_string())
}

fn perform_timeout_recovery(operation: &str) -> Result<String, SystemError> {
    // Simulate timeout recovery
    println!("  - Increasing timeout duration...");
    println!("  - Using asynchronous processing...");
    Ok("Timeout recovery successful".to_string())
}
```

**Explanation**:

- `enum SystemError` defines different types of system errors
- `perform_operation_with_recovery` implements error recovery strategies
- Pattern matching handles different error types with specific recovery strategies
- Each error type has its own recovery mechanism
- This demonstrates comprehensive error recovery with different strategies

**Why**: This exercise teaches you to implement robust error recovery systems that can handle various types of failures.

## Key Takeaways

**What** you've learned through these practical exercises:

1. **Pattern Matching Mastery** - How to use match expressions with complex patterns and guards
2. **Error Handling Excellence** - How to implement comprehensive error handling with Result types
3. **Option Management** - How to work with optional values safely and effectively
4. **Real-world Applications** - How to apply concepts to practical programming scenarios
5. **Error Recovery Strategies** - How to implement robust error recovery systems
6. **Code Quality** - How to write idiomatic, maintainable Rust code
7. **Problem-solving Skills** - How to approach complex programming challenges
8. **Best Practices** - How to follow Rust conventions and patterns

**Why** these exercises matter:

- **Skill reinforcement** solidifies your understanding through hands-on practice
- **Real-world application** connects theoretical knowledge to practical problems
- **Problem-solving** develops your ability to apply concepts in new situations
- **Code quality** teaches you to write idiomatic, robust Rust code
- **Confidence building** prepares you for real Rust development

## Next Steps

Now that you've completed these practical exercises, you're ready to:

- **Apply these concepts** in your own Rust projects
- **Explore advanced topics** like async programming and macros
- **Build real applications** using the patterns you've learned
- **Contribute to open source** Rust projects
- **Continue learning** with more advanced Rust concepts

**Where** to go next: You've mastered the fundamentals of pattern matching and error handling! Consider exploring the next chapter on "Collections and Strings" to continue your Rust journey.

## Resources

**Official Documentation**:

- [The Rust Book - Pattern Matching](https://doc.rust-lang.org/book/ch06-02-match.html)
- [The Rust Book - Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Rust by Example - Pattern Matching](https://doc.rust-lang.org/rust-by-example/flow_control/match.html)

**Community Resources**:

- [Rust Community](https://www.rust-lang.org/community)
- [Rust Users Forum](https://users.rust-lang.org/)
- [Reddit r/rust](https://reddit.com/r/rust)

**Learning Resources**:

- [Rustlings](https://github.com/rust-lang/rustlings)
- [Exercism Rust Track](https://exercism.org/tracks/rust)
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/)

**Practice Tips**:

1. **Work through exercises slowly** - Take time to understand each concept
2. **Experiment with variations** - Try modifying the exercises to explore different approaches
3. **Read error messages carefully** - Rust's compiler errors are very helpful for learning
4. **Practice regularly** - Consistent practice is key to mastering these concepts
5. **Build your own projects** - Apply what you've learned to real-world problems
6. **Join the community** - Engage with other Rust developers for support and learning
7. **Keep learning** - Rust has many advanced features to explore

Happy coding! 🦀
