---
sidebar_position: 4
---

# Library Development

Master creating reusable code and publishing libraries in Rust with comprehensive explanations using the 4W+H framework.

## What Is Library Development?

**What**: Library development is the process of creating reusable code packages that can be shared across projects and with the community. In Rust, libraries are distributed as crates and can be published to crates.io for public use.

**Why**: Understanding library development is crucial because:

- **Code reuse** allows you to share functionality across multiple projects
- **Community contribution** enables you to contribute to the Rust ecosystem
- **Modular design** helps you create well-structured, maintainable code
- **API design** teaches you to create clean, user-friendly interfaces
- **Documentation** improves your ability to communicate code functionality
- **Testing** ensures your code works correctly for all users
- **Versioning** helps you manage changes and compatibility

**When**: Use library development when you need to:

- Create reusable functionality for multiple projects
- Share code with other developers
- Contribute to the Rust ecosystem
- Build modular applications
- Create domain-specific libraries
- Develop tools and utilities for others

**How**: Library development works in Rust by:

- **Creating library crates** with `cargo new --lib`
- **Designing public APIs** with clear interfaces
- **Writing comprehensive documentation** for users
- **Testing thoroughly** to ensure reliability
- **Publishing to crates.io** for public distribution
- **Managing versions** and breaking changes

**Where**: Library development is used throughout the Rust ecosystem for creating reusable components, tools, and frameworks.

## Understanding Library Structure

### Basic Library Crate

**What**: A library crate is a collection of Rust code that can be used by other programs but doesn't have a main function.

**Why**: Understanding library structure is important because:

- **Code organization** helps you structure reusable functionality
- **Public APIs** define what users can access
- **Module design** enables clear separation of concerns
- **Documentation** helps users understand your library

**When**: Use library crates when you need to create reusable code that can be shared.

**How**: Here's how to create a basic library crate:

```rust
// lib.rs - Main library file
//! # My Awesome Library
//!
//! This library provides utilities for working with text data.
//! It includes functions for text processing, validation, and formatting.

/// Text processing utilities
pub mod text_utils {
    /// Capitalizes the first letter of each word in a string
    ///
    /// # Examples
    ///
    /// ```
    /// use my_awesome_library::text_utils::capitalize_words;
    /// 
    /// let text = "hello world";
    /// assert_eq!(capitalize_words(text), "Hello World");
    /// ```
    pub fn capitalize_words(text: &str) -> String {
        text.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    /// Counts the number of words in a string
    ///
    /// # Examples
    ///
    /// ```
    /// use my_awesome_library::text_utils::count_words;
    /// 
    /// let text = "Hello world from Rust";
    /// assert_eq!(count_words(text), 4);
    /// ```
    pub fn count_words(text: &str) -> usize {
        text.split_whitespace().count()
    }
    
    /// Removes extra whitespace from a string
    ///
    /// # Examples
    ///
    /// ```
    /// use my_awesome_library::text_utils::normalize_whitespace;
    /// 
    /// let text = "  hello    world  ";
    /// assert_eq!(normalize_whitespace(text), "hello world");
    /// ```
    pub fn normalize_whitespace(text: &str) -> String {
        text.split_whitespace().collect::<Vec<_>>().join(" ")
    }
}

/// Validation utilities
pub mod validation {
    /// Validates an email address
    ///
    /// # Examples
    ///
    /// ```
    /// use my_awesome_library::validation::is_valid_email;
    /// 
    /// assert!(is_valid_email("user@example.com"));
    /// assert!(!is_valid_email("invalid-email"));
    /// ```
    pub fn is_valid_email(email: &str) -> bool {
        email.contains('@') && email.contains('.') && !email.starts_with('@') && !email.ends_with('@')
    }
    
    /// Validates a phone number (basic format)
    ///
    /// # Examples
    ///
    /// ```
    /// use my_awesome_library::validation::is_valid_phone;
    /// 
    /// assert!(is_valid_phone("123-456-7890"));
    /// assert!(!is_valid_phone("invalid"));
    /// ```
    pub fn is_valid_phone(phone: &str) -> bool {
        phone.chars().all(|c| c.is_ascii_digit() || c == '-' || c == ' ' || c == '(' || c == ')')
            && phone.chars().filter(|c| c.is_ascii_digit()).count() >= 10
    }
}

/// Error types for the library
pub mod errors {
    use std::fmt;
    
    /// Errors that can occur in the library
    #[derive(Debug, Clone)]
    pub enum LibraryError {
        /// Invalid input provided
        InvalidInput(String),
        /// Processing failed
        ProcessingError(String),
        /// Validation failed
        ValidationError(String),
    }
    
    impl fmt::Display for LibraryError {
        fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
            match self {
                LibraryError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
                LibraryError::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
                LibraryError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
            }
        }
    }
    
    impl std::error::Error for LibraryError {}
}

/// Main library struct
pub struct TextProcessor {
    config: ProcessingConfig,
}

/// Configuration for text processing
#[derive(Debug, Clone)]
pub struct ProcessingConfig {
    pub max_length: usize,
    pub allow_special_chars: bool,
    pub case_sensitive: bool,
}

impl Default for ProcessingConfig {
    fn default() -> Self {
        Self {
            max_length: 1000,
            allow_special_chars: true,
            case_sensitive: false,
        }
    }
}

impl TextProcessor {
    /// Creates a new text processor with default configuration
    pub fn new() -> Self {
        Self {
            config: ProcessingConfig::default(),
        }
    }
    
    /// Creates a new text processor with custom configuration
    pub fn with_config(config: ProcessingConfig) -> Self {
        Self { config }
    }
    
    /// Processes text according to the processor configuration
    pub fn process(&self, text: &str) -> Result<String, errors::LibraryError> {
        if text.len() > self.config.max_length {
            return Err(errors::LibraryError::InvalidInput(
                format!("Text too long: {} characters (max: {})", text.len(), self.config.max_length)
            ));
        }
        
        let mut result = text.to_string();
        
        if !self.config.case_sensitive {
            result = result.to_lowercase();
        }
        
        if !self.config.allow_special_chars {
            result = result.chars()
                .filter(|c| c.is_ascii_alphanumeric() || c.is_whitespace())
                .collect();
        }
        
        Ok(result)
    }
}

/// Convenience functions for common operations
pub mod convenience {
    use super::{text_utils, validation, TextProcessor, ProcessingConfig};
    
    /// Quick text processing with default settings
    pub fn quick_process(text: &str) -> String {
        text_utils::normalize_whitespace(text)
    }
    
    /// Quick validation of common data types
    pub fn quick_validate_email(email: &str) -> bool {
        validation::is_valid_email(email)
    }
    
    /// Quick validation of phone numbers
    pub fn quick_validate_phone(phone: &str) -> bool {
        validation::is_valid_phone(phone)
    }
}

// Re-export commonly used items for easier access
pub use text_utils::*;
pub use validation::*;
pub use errors::LibraryError;
pub use convenience::*;
```

**Explanation**:

- `//!` creates library-level documentation
- `pub mod` makes modules public for external use
- `///` creates documentation for public items
- `# Examples` sections provide usage examples
- `pub use` re-exports items for easier access
- Error types provide clear error handling
- Configuration structs allow customization

**Why**: A well-structured library provides clear APIs, comprehensive documentation, and flexible configuration options.

### Advanced Library Organization

**What**: How to organize complex libraries with multiple modules and features.

**Why**: Understanding advanced library organization is important because:

- **Scalability** helps you manage growing libraries
- **Feature organization** enables optional functionality
- **Clear separation** makes code easier to understand
- **Maintainability** improves long-term code management

**When**: Use advanced organization when you need to create complex libraries with multiple features.

**How**: Here's how to organize a complex library:

```rust
// lib.rs - Main library file
//! # Advanced Text Processing Library
//!
//! A comprehensive library for text processing, validation, and analysis.
//! Supports multiple features and configurations.

// Core functionality
pub mod core {
    pub mod text_processing;
    pub mod validation;
    pub mod analysis;
}

// Optional features
#[cfg(feature = "regex")]
pub mod regex_utils;

#[cfg(feature = "unicode")]
pub mod unicode_utils;

#[cfg(feature = "serialization")]
pub mod serialization;

// Error handling
pub mod errors {
    use std::fmt;
    
    #[derive(Debug, Clone)]
    pub enum LibraryError {
        InvalidInput(String),
        ProcessingError(String),
        ValidationError(String),
        FeatureNotAvailable(String),
    }
    
    impl fmt::Display for LibraryError {
        fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
            match self {
                LibraryError::InvalidInput(msg) => write!(f, "Invalid input: {}", msg),
                LibraryError::ProcessingError(msg) => write!(f, "Processing error: {}", msg),
                LibraryError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
                LibraryError::FeatureNotAvailable(msg) => write!(f, "Feature not available: {}", msg),
            }
        }
    }
    
    impl std::error::Error for LibraryError {}
}

// Configuration
pub mod config {
    use serde::{Deserialize, Serialize};
    
    #[derive(Debug, Clone, Serialize, Deserialize)]
    pub struct LibraryConfig {
        pub max_text_length: usize,
        pub enable_unicode: bool,
        pub enable_regex: bool,
        pub case_sensitive: bool,
    }
    
    impl Default for LibraryConfig {
        fn default() -> Self {
            Self {
                max_text_length: 10000,
                enable_unicode: true,
                enable_regex: false,
                case_sensitive: false,
            }
        }
    }
}

// Main library struct
pub struct AdvancedTextProcessor {
    config: config::LibraryConfig,
}

impl AdvancedTextProcessor {
    pub fn new() -> Self {
        Self {
            config: config::LibraryConfig::default(),
        }
    }
    
    pub fn with_config(config: config::LibraryConfig) -> Self {
        Self { config }
    }
    
    pub fn process_text(&self, text: &str) -> Result<String, errors::LibraryError> {
        if text.len() > self.config.max_text_length {
            return Err(errors::LibraryError::InvalidInput(
                format!("Text too long: {} characters", text.len())
            ));
        }
        
        let mut result = text.to_string();
        
        if !self.config.case_sensitive {
            result = result.to_lowercase();
        }
        
        Ok(result)
    }
}

// Re-exports for easy access
pub use core::*;
pub use errors::LibraryError;
pub use config::LibraryConfig;
```

**Explanation**:

- Feature flags (`#[cfg(feature = "...")]`) enable optional functionality
- Clear module separation organizes related functionality
- Configuration structs allow customization
- Error types provide comprehensive error handling
- Re-exports make the API easier to use

**Why**: Advanced organization enables you to create flexible, feature-rich libraries that can be customized for different use cases.

## Understanding Cargo.toml Configuration

### Basic Cargo.toml

**What**: The Cargo.toml file configures your library's metadata, dependencies, and features.

**Why**: Understanding Cargo.toml is important because:

- **Metadata** defines your library's identity and information
- **Dependencies** specify what other crates your library needs
- **Features** enable optional functionality
- **Versioning** manages compatibility and updates

**When**: Use Cargo.toml configuration when you need to define your library's requirements and capabilities.

**How**: Here's how to configure a basic Cargo.toml:

```toml
[package]
name = "my-awesome-library"
version = "0.1.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "A library for text processing and validation"
license = "MIT"
repository = "https://github.com/yourusername/my-awesome-library"
homepage = "https://github.com/yourusername/my-awesome-library"
documentation = "https://docs.rs/my-awesome-library"
keywords = ["text", "processing", "validation", "utilities"]
categories = ["text-processing", "development-tools"]

[dependencies]
# Core dependencies
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"

# Optional dependencies
regex = { version = "1.0", optional = true }
unicode-normalization = { version = "0.1", optional = true }

[dev-dependencies]
# Development dependencies
criterion = "0.5"
proptest = "1.0"

[features]
default = []
regex = ["dep:regex"]
unicode = ["dep:unicode-normalization"]
all = ["regex", "unicode"]

[lib]
name = "my_awesome_library"
path = "src/lib.rs"

[[example]]
name = "basic_usage"
path = "examples/basic_usage.rs"

[[example]]
name = "advanced_usage"
path = "examples/advanced_usage.rs"

[package.metadata.docs.rs]
features = ["all"]
```

**Explanation**:

- `[package]` defines basic library information
- `[dependencies]` specifies required dependencies
- `[dev-dependencies]` specifies development-only dependencies
- `[features]` defines optional functionality
- `[lib]` configures the library target
- `[[example]]` defines example programs

**Why**: Proper Cargo.toml configuration ensures your library is properly documented, versioned, and easy to use.

### Advanced Cargo.toml Features

**What**: More sophisticated Cargo.toml configuration for complex libraries.

**Why**: Understanding advanced Cargo.toml features is important because:

- **Complex dependencies** enable sophisticated functionality
- **Feature flags** provide flexible configuration
- **Workspace management** helps organize multiple related crates
- **Publishing configuration** ensures proper distribution

**When**: Use advanced Cargo.toml features when you need to create complex libraries with multiple features and dependencies.

**How**: Here's how to use advanced Cargo.toml features:

```toml
[package]
name = "advanced-text-library"
version = "0.2.0"
edition = "2021"
authors = ["Your Name <your.email@example.com>"]
description = "An advanced library for text processing with multiple features"
license = "MIT OR Apache-2.0"
repository = "https://github.com/yourusername/advanced-text-library"
homepage = "https://github.com/yourusername/advanced-text-library"
documentation = "https://docs.rs/advanced-text-library"
keywords = ["text", "processing", "nlp", "validation", "analysis"]
categories = ["text-processing", "development-tools", "algorithms"]
readme = "README.md"
rust-version = "1.70"

[dependencies]
# Core dependencies
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
thiserror = "1.0"

# Optional dependencies with features
regex = { version = "1.0", optional = true }
unicode-normalization = { version = "0.1", optional = true }
clap = { version = "4.0", optional = true, features = ["derive"] }
tokio = { version = "1.0", optional = true, features = ["full"] }

# Platform-specific dependencies
[target.'cfg(target_os = "windows")'.dependencies]
winapi = { version = "0.3", features = ["winuser"] }

[target.'cfg(target_os = "linux")'.dependencies]
libc = "0.2"

[target.'cfg(target_os = "macos")'.dependencies]
core-foundation = "0.9"

[dev-dependencies]
# Development dependencies
criterion = "0.5"
proptest = "1.0"
tempfile = "3.0"
mockito = "1.0"

[features]
default = ["std"]
std = []
regex = ["dep:regex"]
unicode = ["dep:unicode-normalization"]
cli = ["dep:clap"]
async = ["dep:tokio"]
all = ["regex", "unicode", "cli", "async"]

# No-std support
no-std = []
alloc = ["no-std"]

[package.metadata.docs.rs]
features = ["all"]
rustdoc-args = ["--cfg", "docsrs"]

[package.metadata.cargo-machete]
ignored = ["regex", "unicode-normalization"]

[workspace]
members = [
    "crates/core",
    "crates/cli",
    "crates/web",
]
resolver = "2"

[workspace.dependencies]
serde = "1.0"
serde_json = "1.0"
thiserror = "1.0"

[workspace.package]
version = "0.2.0"
edition = "2021"
license = "MIT OR Apache-2.0"
authors = ["Your Name <your.email@example.com>"]
repository = "https://github.com/yourusername/advanced-text-library"
homepage = "https://github.com/yourusername/advanced-text-library"
documentation = "https://docs.rs/advanced-text-library"
keywords = ["text", "processing", "nlp", "validation", "analysis"]
categories = ["text-processing", "development-tools", "algorithms"]
readme = "README.md"
rust-version = "1.70"
```

**Explanation**:

- `rust-version` specifies minimum Rust version
- `[target.'cfg(...)'.dependencies]` specifies platform-specific dependencies
- `[workspace]` manages multiple related crates
- `[package.metadata.docs.rs]` configures documentation generation
- `[package.metadata.cargo-machete]` configures dependency analysis
- Complex feature flags enable flexible functionality

**Why**: Advanced Cargo.toml configuration enables you to create sophisticated libraries with multiple features and platform support.

## Understanding Documentation

### Basic Documentation

**What**: How to write comprehensive documentation for your library.

**Why**: Understanding documentation is important because:

- **User experience** helps users understand how to use your library
- **API clarity** makes your library easier to use
- **Examples** show practical usage patterns
- **Maintenance** helps you remember how your code works

**When**: Use documentation when you need to create user-friendly libraries.

**How**: Here's how to write basic documentation:

```rust
//! # Text Processing Library
//!
//! A comprehensive library for text processing, validation, and analysis.
//! This library provides utilities for working with text data in Rust.
//!
//! ## Features
//!
//! - Text processing and normalization
//! - Email and phone number validation
//! - Text analysis and statistics
//! - Unicode support
//! - Regular expression support
//!
//! ## Quick Start
//!
//! ```rust
//! use text_processing_lib::TextProcessor;
//! use text_processing_lib::validation::is_valid_email;
//!
//! // Create a text processor
//! let processor = TextProcessor::new();
//!
//! // Process text
//! let result = processor.process("Hello, World!").unwrap();
//! println!("{}", result);
//!
//! // Validate email
//! let email = "user@example.com";
//! if is_valid_email(email) {
//!     println!("Valid email: {}", email);
//! }
//! ```
//!
//! ## Examples
//!
//! See the [examples](https://github.com/yourusername/text-processing-lib/tree/main/examples)
//! directory for more detailed usage examples.

/// Text processing utilities
pub mod text_utils {
    /// Capitalizes the first letter of each word in a string
    ///
    /// This function takes a string and capitalizes the first letter of each word,
    /// while keeping the rest of the letters in lowercase.
    ///
    /// # Arguments
    ///
    /// * `text` - The input string to capitalize
    ///
    /// # Returns
    ///
    /// A new string with each word capitalized
    ///
    /// # Examples
    ///
    /// ```
    /// use text_processing_lib::text_utils::capitalize_words;
    /// 
    /// let text = "hello world";
    /// assert_eq!(capitalize_words(text), "Hello World");
    /// ```
    ///
    /// # Panics
    ///
    /// This function will not panic for any input.
    ///
    /// # Performance
    ///
    /// Time complexity: O(n) where n is the length of the input string.
    /// Space complexity: O(n) for the output string.
    pub fn capitalize_words(text: &str) -> String {
        text.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    /// Counts the number of words in a string
    ///
    /// This function counts the number of words in a string, where words are
    /// separated by whitespace.
    ///
    /// # Arguments
    ///
    /// * `text` - The input string to count words in
    ///
    /// # Returns
    ///
    /// The number of words in the string
    ///
    /// # Examples
    ///
    /// ```
    /// use text_processing_lib::text_utils::count_words;
    /// 
    /// let text = "Hello world from Rust";
    /// assert_eq!(count_words(text), 4);
    /// ```
    ///
    /// # Performance
    ///
    /// Time complexity: O(n) where n is the length of the input string.
    /// Space complexity: O(1).
    pub fn count_words(text: &str) -> usize {
        text.split_whitespace().count()
    }
}

/// Validation utilities
pub mod validation {
    /// Validates an email address
    ///
    /// This function performs basic email validation by checking for the presence
    /// of an '@' symbol and a '.' in the domain part.
    ///
    /// # Arguments
    ///
    /// * `email` - The email address to validate
    ///
    /// # Returns
    ///
    /// `true` if the email appears to be valid, `false` otherwise
    ///
    /// # Examples
    ///
    /// ```
    /// use text_processing_lib::validation::is_valid_email;
    /// 
    /// assert!(is_valid_email("user@example.com"));
    /// assert!(!is_valid_email("invalid-email"));
    /// ```
    ///
    /// # Note
    ///
    /// This is a basic validation and may not catch all invalid email formats.
    /// For production use, consider using a more comprehensive email validation library.
    pub fn is_valid_email(email: &str) -> bool {
        email.contains('@') && email.contains('.') && !email.starts_with('@') && !email.ends_with('@')
    }
}
```

**Explanation**:

- `//!` creates library-level documentation
- `///` creates item-level documentation
- `# Arguments` describes function parameters
- `# Returns` describes return values
- `# Examples` provides usage examples
- `# Panics` describes panic conditions
- `# Performance` describes complexity
- `# Note` provides additional information

**Why**: Comprehensive documentation makes your library easier to use and understand.

### Advanced Documentation

**What**: More sophisticated documentation techniques for complex libraries.

**Why**: Understanding advanced documentation is important because:

- **Complex APIs** require detailed explanations
- **Feature documentation** helps users understand optional functionality
- **Migration guides** help users upgrade between versions
- **Performance documentation** helps users optimize their code

**When**: Use advanced documentation when you need to create comprehensive documentation for complex libraries.

**How**: Here's how to write advanced documentation:

```rust
//! # Advanced Text Processing Library
//!
//! A comprehensive library for text processing, validation, and analysis.
//! This library provides utilities for working with text data in Rust.
//!
//! ## Features
//!
//! - **Text Processing**: Normalization, formatting, and transformation
//! - **Validation**: Email, phone, and custom validation
//! - **Analysis**: Statistics, patterns, and insights
//! - **Unicode Support**: Full Unicode text processing
//! - **Regular Expressions**: Pattern matching and replacement
//! - **Async Support**: Asynchronous text processing
//!
//! ## Quick Start
//!
//! ```rust
//! use advanced_text_lib::TextProcessor;
//! use advanced_text_lib::validation::is_valid_email;
//!
//! // Create a text processor
//! let processor = TextProcessor::new();
//!
//! // Process text
//! let result = processor.process("Hello, World!").unwrap();
//! println!("{}", result);
//!
//! // Validate email
//! let email = "user@example.com";
//! if is_valid_email(email) {
//!     println!("Valid email: {}", email);
//! }
//! ```
//!
//! ## Feature Flags
//!
//! This library supports several feature flags to enable optional functionality:
//!
//! - `regex`: Enable regular expression support
//! - `unicode`: Enable Unicode text processing
//! - `async`: Enable asynchronous processing
//! - `all`: Enable all features
//!
//! ## Examples
//!
//! See the [examples](https://github.com/yourusername/advanced-text-lib/tree/main/examples)
//! directory for more detailed usage examples.
//!
//! ## Migration Guide
//!
//! When upgrading between versions, see the [migration guide](https://github.com/yourusername/advanced-text-lib/blob/main/MIGRATION.md)
//! for breaking changes and upgrade instructions.
//!
//! ## Performance
//!
//! This library is designed for performance and includes several optimizations:
//!
//! - Zero-copy string operations where possible
//! - Efficient Unicode processing
//! - Optimized regular expressions
//! - Memory-efficient data structures
//!
//! ## Thread Safety
//!
//! All public types in this library are thread-safe and can be safely shared
//! between threads.

/// Text processing utilities
pub mod text_utils {
    /// Capitalizes the first letter of each word in a string
    ///
    /// This function takes a string and capitalizes the first letter of each word,
    /// while keeping the rest of the letters in lowercase.
    ///
    /// # Arguments
    ///
    /// * `text` - The input string to capitalize
    ///
    /// # Returns
    ///
    /// A new string with each word capitalized
    ///
    /// # Examples
    ///
    /// ```
    /// use advanced_text_lib::text_utils::capitalize_words;
    /// 
    /// let text = "hello world";
    /// assert_eq!(capitalize_words(text), "Hello World");
    /// ```
    ///
    /// # Panics
    ///
    /// This function will not panic for any input.
    ///
    /// # Performance
    ///
    /// Time complexity: O(n) where n is the length of the input string.
    /// Space complexity: O(n) for the output string.
    ///
    /// # Thread Safety
    ///
    /// This function is thread-safe and can be called from multiple threads.
    pub fn capitalize_words(text: &str) -> String {
        text.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
}

/// Validation utilities
pub mod validation {
    /// Validates an email address
    ///
    /// This function performs basic email validation by checking for the presence
    /// of an '@' symbol and a '.' in the domain part.
    ///
    /// # Arguments
    ///
    /// * `email` - The email address to validate
    ///
    /// # Returns
    ///
    /// `true` if the email appears to be valid, `false` otherwise
    ///
    /// # Examples
    ///
    /// ```
    /// use advanced_text_lib::validation::is_valid_email;
    /// 
    /// assert!(is_valid_email("user@example.com"));
    /// assert!(!is_valid_email("invalid-email"));
    /// ```
    ///
    /// # Note
    ///
    /// This is a basic validation and may not catch all invalid email formats.
    /// For production use, consider using a more comprehensive email validation library.
    ///
    /// # Performance
    ///
    /// Time complexity: O(n) where n is the length of the email string.
    /// Space complexity: O(1).
    ///
    /// # Thread Safety
    ///
    /// This function is thread-safe and can be called from multiple threads.
    pub fn is_valid_email(email: &str) -> bool {
        email.contains('@') && email.contains('.') && !email.starts_with('@') && !email.ends_with('@')
    }
}
```

**Explanation**:

- Comprehensive feature documentation
- Performance and thread safety information
- Migration guides for version upgrades
- Detailed examples and use cases
- Clear API documentation with all sections

**Why**: Advanced documentation provides comprehensive information for users and helps them understand all aspects of your library.

## Understanding Testing

### Basic Testing

**What**: How to write comprehensive tests for your library.

**Why**: Understanding testing is important because:

- **Reliability** ensures your library works correctly
- **Regression prevention** catches bugs when making changes
- **Documentation** tests serve as examples for users
- **Confidence** helps you release stable code

**When**: Use testing when you need to ensure your library works correctly for all users.

**How**: Here's how to write basic tests:

```rust
// lib.rs
//! # Text Processing Library
//!
//! A library for text processing and validation.

/// Text processing utilities
pub mod text_utils {
    /// Capitalizes the first letter of each word in a string
    pub fn capitalize_words(text: &str) -> String {
        text.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    /// Counts the number of words in a string
    pub fn count_words(text: &str) -> usize {
        text.split_whitespace().count()
    }
}

/// Validation utilities
pub mod validation {
    /// Validates an email address
    pub fn is_valid_email(email: &str) -> bool {
        email.contains('@') && email.contains('.') && !email.starts_with('@') && !email.ends_with('@')
    }
    
    /// Validates a phone number
    pub fn is_valid_phone(phone: &str) -> bool {
        phone.chars().all(|c| c.is_ascii_digit() || c == '-' || c == ' ' || c == '(' || c == ')')
            && phone.chars().filter(|c| c.is_ascii_digit()).count() >= 10
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_capitalize_words() {
        assert_eq!(text_utils::capitalize_words("hello world"), "Hello World");
        assert_eq!(text_utils::capitalize_words("rust programming"), "Rust Programming");
        assert_eq!(text_utils::capitalize_words(""), "");
        assert_eq!(text_utils::capitalize_words("single"), "Single");
    }
    
    #[test]
    fn test_count_words() {
        assert_eq!(text_utils::count_words("hello world"), 2);
        assert_eq!(text_utils::count_words("rust programming language"), 3);
        assert_eq!(text_utils::count_words(""), 0);
        assert_eq!(text_utils::count_words("single"), 1);
    }
    
    #[test]
    fn test_is_valid_email() {
        // Valid emails
        assert!(validation::is_valid_email("user@example.com"));
        assert!(validation::is_valid_email("test.email@domain.org"));
        assert!(validation::is_valid_email("user+tag@example.com"));
        
        // Invalid emails
        assert!(!validation::is_valid_email("invalid-email"));
        assert!(!validation::is_valid_email("@example.com"));
        assert!(!validation::is_valid_email("user@"));
        assert!(!validation::is_valid_email(""));
    }
    
    #[test]
    fn test_is_valid_phone() {
        // Valid phones
        assert!(validation::is_valid_phone("123-456-7890"));
        assert!(validation::is_valid_phone("(123) 456-7890"));
        assert!(validation::is_valid_phone("123 456 7890"));
        assert!(validation::is_valid_phone("1234567890"));
        
        // Invalid phones
        assert!(!validation::is_valid_phone("invalid"));
        assert!(!validation::is_valid_phone("123"));
        assert!(!validation::is_valid_phone(""));
    }
    
    #[test]
    fn test_edge_cases() {
        // Empty strings
        assert_eq!(text_utils::capitalize_words(""), "");
        assert_eq!(text_utils::count_words(""), 0);
        assert!(!validation::is_valid_email(""));
        assert!(!validation::is_valid_phone(""));
        
        // Whitespace only
        assert_eq!(text_utils::capitalize_words("   "), "");
        assert_eq!(text_utils::count_words("   "), 0);
        
        // Single character
        assert_eq!(text_utils::capitalize_words("a"), "A");
        assert_eq!(text_utils::count_words("a"), 1);
    }
}
```

**Explanation**:

- `#[cfg(test)]` includes tests only in test builds
- `use super::*;` imports all items from the parent module
- Tests cover normal cases, edge cases, and error conditions
- Each test has a descriptive name
- Tests verify both positive and negative cases

**Why**: Comprehensive testing ensures your library works correctly and provides examples for users.

### Advanced Testing

**What**: More sophisticated testing techniques for complex libraries.

**Why**: Understanding advanced testing is important because:

- **Property-based testing** finds edge cases automatically
- **Integration testing** verifies component interactions
- **Performance testing** ensures your library is fast
- **Mock testing** isolates components for testing

**When**: Use advanced testing when you need to create robust, well-tested libraries.

**How**: Here's how to write advanced tests:

```rust
// lib.rs
//! # Advanced Text Processing Library
//!
//! A comprehensive library for text processing and validation.

/// Text processing utilities
pub mod text_utils {
    /// Capitalizes the first letter of each word in a string
    pub fn capitalize_words(text: &str) -> String {
        text.split_whitespace()
            .map(|word| {
                let mut chars = word.chars();
                match chars.next() {
                    None => String::new(),
                    Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                }
            })
            .collect::<Vec<_>>()
            .join(" ")
    }
    
    /// Counts the number of words in a string
    pub fn count_words(text: &str) -> usize {
        text.split_whitespace().count()
    }
}

/// Validation utilities
pub mod validation {
    /// Validates an email address
    pub fn is_valid_email(email: &str) -> bool {
        email.contains('@') && email.contains('.') && !email.starts_with('@') && !email.ends_with('@')
    }
    
    /// Validates a phone number
    pub fn is_valid_phone(phone: &str) -> bool {
        phone.chars().all(|c| c.is_ascii_digit() || c == '-' || c == ' ' || c == '(' || c == ')')
            && phone.chars().filter(|c| c.is_ascii_digit()).count() >= 10
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    // Basic unit tests
    #[test]
    fn test_capitalize_words() {
        assert_eq!(text_utils::capitalize_words("hello world"), "Hello World");
        assert_eq!(text_utils::capitalize_words("rust programming"), "Rust Programming");
        assert_eq!(text_utils::capitalize_words(""), "");
        assert_eq!(text_utils::capitalize_words("single"), "Single");
    }
    
    #[test]
    fn test_count_words() {
        assert_eq!(text_utils::count_words("hello world"), 2);
        assert_eq!(text_utils::count_words("rust programming language"), 3);
        assert_eq!(text_utils::count_words(""), 0);
        assert_eq!(text_utils::count_words("single"), 1);
    }
    
    // Property-based tests
    #[test]
    fn test_capitalize_words_properties() {
        let test_cases = vec![
            "hello world",
            "rust programming language",
            "a b c d e",
            "single word",
            "multiple   spaces",
            "  leading spaces",
            "trailing spaces  ",
            "  both  sides  ",
        ];
        
        for input in test_cases {
            let result = text_utils::capitalize_words(input);
            
            // Property: result should not be empty if input is not empty
            if !input.trim().is_empty() {
                assert!(!result.is_empty(), "Result should not be empty for non-empty input: '{}'", input);
            }
            
            // Property: result should have same number of words as input
            assert_eq!(
                text_utils::count_words(&result),
                text_utils::count_words(input),
                "Word count should be preserved: '{}' -> '{}'",
                input,
                result
            );
            
            // Property: first character of each word should be uppercase
            for word in result.split_whitespace() {
                if let Some(first_char) = word.chars().next() {
                    assert!(
                        first_char.is_uppercase(),
                        "First character should be uppercase: '{}' in '{}'",
                        word,
                        result
                    );
                }
            }
        }
    }
    
    // Integration tests
    #[test]
    fn test_text_processing_workflow() {
        let input = "  hello world from rust  ";
        
        // Step 1: Count words
        let word_count = text_utils::count_words(input);
        assert_eq!(word_count, 4);
        
        // Step 2: Capitalize words
        let capitalized = text_utils::capitalize_words(input);
        assert_eq!(capitalized, "Hello World From Rust");
        
        // Step 3: Verify word count is preserved
        assert_eq!(text_utils::count_words(&capitalized), word_count);
    }
    
    // Error handling tests
    #[test]
    fn test_validation_error_cases() {
        let invalid_emails = vec![
            "",
            "@example.com",
            "user@",
            "invalid-email",
            "user@.com",
            ".user@example.com",
        ];
        
        for email in invalid_emails {
            assert!(
                !validation::is_valid_email(email),
                "Email should be invalid: '{}'",
                email
            );
        }
        
        let invalid_phones = vec![
            "",
            "123",
            "invalid",
            "abc-def-ghij",
            "123-456",
        ];
        
        for phone in invalid_phones {
            assert!(
                !validation::is_valid_phone(phone),
                "Phone should be invalid: '{}'",
                phone
            );
        }
    }
    
    // Performance tests
    #[test]
    fn test_performance_large_text() {
        let large_text = "hello world ".repeat(1000);
        
        let start = std::time::Instant::now();
        let result = text_utils::capitalize_words(&large_text);
        let duration = start.elapsed();
        
        // Should complete within reasonable time (adjust threshold as needed)
        assert!(duration.as_millis() < 100, "Processing took too long: {:?}", duration);
        
        // Result should be correct
        assert_eq!(text_utils::count_words(&result), text_utils::count_words(&large_text));
    }
    
    // Unicode tests
    #[test]
    fn test_unicode_support() {
        let unicode_text = "café naïve résumé";
        let result = text_utils::capitalize_words(unicode_text);
        
        // Should handle Unicode correctly
        assert!(result.contains("Café"));
        assert!(result.contains("Naïve"));
        assert!(result.contains("Résumé"));
    }
    
    // Concurrent access tests
    #[test]
    fn test_concurrent_access() {
        use std::thread;
        
        let input = "hello world from rust";
        let mut handles = vec![];
        
        // Spawn multiple threads
        for i in 0..10 {
            let input = input.to_string();
            let handle = thread::spawn(move || {
                let result = text_utils::capitalize_words(&input);
                (i, result)
            });
            handles.push(handle);
        }
        
        // Collect results
        for handle in handles {
            let (thread_id, result) = handle.join().unwrap();
            assert_eq!(result, "Hello World From Rust", "Thread {} failed", thread_id);
        }
    }
}
```

**Explanation**:

- Property-based tests verify invariants
- Integration tests verify component interactions
- Performance tests ensure reasonable execution time
- Unicode tests verify international support
- Concurrent access tests verify thread safety
- Error handling tests verify edge cases

**Why**: Advanced testing ensures your library is robust, performant, and works correctly in all scenarios.

## Understanding Publishing

### Preparing for Publication

**What**: How to prepare your library for publication to crates.io.

**Why**: Understanding publication preparation is important because:

- **Quality assurance** ensures your library meets standards
- **Documentation** helps users understand your library
- **Versioning** manages compatibility and updates
- **Metadata** makes your library discoverable

**When**: Use publication preparation when you're ready to share your library with the community.

**How**: Here's how to prepare for publication:

```bash
# 1. Check your library for issues
cargo check
cargo test
cargo clippy
cargo fmt

# 2. Generate documentation
cargo doc --no-deps --open

# 3. Check for security vulnerabilities
cargo audit

# 4. Verify your Cargo.toml
cargo publish --dry-run

# 5. Publish to crates.io
cargo publish
```

**Explanation**:

- `cargo check` verifies your code compiles
- `cargo test` runs all tests
- `cargo clippy` checks for code quality issues
- `cargo fmt` formats your code
- `cargo doc` generates documentation
- `cargo audit` checks for security issues
- `cargo publish --dry-run` simulates publication
- `cargo publish` publishes to crates.io

**Why**: Proper preparation ensures your library is ready for publication and meets community standards.

### Advanced Publication

**What**: More sophisticated publication techniques for complex libraries.

**Why**: Understanding advanced publication is important because:

- **Workspace management** helps organize multiple related crates
- **Feature flags** enable optional functionality
- **Version management** handles compatibility and updates
- **Documentation hosting** provides comprehensive user guides

**When**: Use advanced publication when you need to publish complex libraries with multiple features.

**How**: Here's how to use advanced publication techniques:

```toml
# Cargo.toml for workspace
[workspace]
members = [
    "crates/core",
    "crates/cli",
    "crates/web",
]
resolver = "2"

[workspace.package]
version = "0.2.0"
edition = "2021"
license = "MIT OR Apache-2.0"
authors = ["Your Name <your.email@example.com>"]
repository = "https://github.com/yourusername/advanced-text-lib"
homepage = "https://github.com/yourusername/advanced-text-lib"
documentation = "https://docs.rs/advanced-text-lib"
keywords = ["text", "processing", "nlp", "validation", "analysis"]
categories = ["text-processing", "development-tools", "algorithms"]
readme = "README.md"
rust-version = "1.70"

[workspace.dependencies]
serde = "1.0"
serde_json = "1.0"
thiserror = "1.0"

# Core library
[package]
name = "advanced-text-lib"
version.workspace = true
edition.workspace = true
license.workspace = true
authors.workspace = true
repository.workspace = true
homepage.workspace = true
documentation.workspace = true
keywords.workspace = true
categories.workspace = true
readme.workspace = true
rust-version.workspace = true
description = "Advanced text processing library"

[dependencies]
serde.workspace = true
serde_json.workspace = true
thiserror.workspace = true

[features]
default = ["std"]
std = []
regex = ["dep:regex"]
unicode = ["dep:unicode-normalization"]
all = ["regex", "unicode"]

[package.metadata.docs.rs]
features = ["all"]
rustdoc-args = ["--cfg", "docsrs"]

# CLI tool
[package]
name = "advanced-text-cli"
version.workspace = true
edition.workspace = true
license.workspace = true
authors.workspace = true
repository.workspace = true
homepage.workspace = true
documentation.workspace = true
keywords.workspace = true
categories.workspace = true
readme.workspace = true
rust-version.workspace = true
description = "CLI tool for advanced text processing"

[dependencies]
advanced-text-lib = { path = "../core", features = ["all"] }
clap = { version = "4.0", features = ["derive"] }
serde.workspace = true
serde_json.workspace = true
thiserror.workspace = true

# Web interface
[package]
name = "advanced-text-web"
version.workspace = true
edition.workspace = true
license.workspace = true
authors.workspace = true
repository.workspace = true
homepage.workspace = true
documentation.workspace = true
keywords.workspace = true
categories.workspace = true
readme.workspace = true
rust-version.workspace = true
description = "Web interface for advanced text processing"

[dependencies]
advanced-text-lib = { path = "../core", features = ["all"] }
warp = "0.3"
serde.workspace = true
serde_json.workspace = true
thiserror.workspace = true
```

**Explanation**:

- Workspace configuration manages multiple related crates
- Shared dependencies reduce duplication
- Feature flags enable optional functionality
- Documentation configuration ensures comprehensive docs
- Multiple packages provide different interfaces

**Why**: Advanced publication techniques enable you to create sophisticated libraries with multiple components and interfaces.

## Practice Exercises

### Exercise 1: Create a Simple Library

**What**: Create a basic library for mathematical operations.

**How**: Implement this exercise:

```rust
// lib.rs
//! # Math Utilities Library
//!
//! A simple library for mathematical operations.

/// Mathematical operations
pub mod math {
    /// Adds two numbers
    pub fn add(a: f64, b: f64) -> f64 {
        a + b
    }
    
    /// Subtracts two numbers
    pub fn subtract(a: f64, b: f64) -> f64 {
        a - b
    }
    
    /// Multiplies two numbers
    pub fn multiply(a: f64, b: f64) -> f64 {
        a * b
    }
    
    /// Divides two numbers
    pub fn divide(a: f64, b: f64) -> Result<f64, String> {
        if b == 0.0 {
            Err("Division by zero".to_string())
        } else {
            Ok(a / b)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_add() {
        assert_eq!(math::add(2.0, 3.0), 5.0);
    }
    
    #[test]
    fn test_subtract() {
        assert_eq!(math::subtract(5.0, 3.0), 2.0);
    }
    
    #[test]
    fn test_multiply() {
        assert_eq!(math::multiply(2.0, 3.0), 6.0);
    }
    
    #[test]
    fn test_divide() {
        assert_eq!(math::divide(6.0, 2.0), Ok(3.0));
        assert!(math::divide(6.0, 0.0).is_err());
    }
}
```

### Exercise 2: Create a Library with Features

**What**: Create a library with optional features and dependencies.

**How**: Implement this exercise:

```rust
// lib.rs
//! # Feature-Rich Library
//!
//! A library with optional features and dependencies.

/// Core functionality
pub mod core {
    /// Basic text processing
    pub fn process_text(text: &str) -> String {
        text.to_string()
    }
}

/// Optional regex functionality
#[cfg(feature = "regex")]
pub mod regex_utils {
    use regex::Regex;
    
    /// Find all matches of a pattern in text
    pub fn find_matches(text: &str, pattern: &str) -> Vec<String> {
        let regex = Regex::new(pattern).unwrap();
        regex.find_iter(text)
            .map(|m| m.as_str().to_string())
            .collect()
    }
}

/// Optional Unicode functionality
#[cfg(feature = "unicode")]
pub mod unicode_utils {
    use unicode_normalization::UnicodeNormalization;
    
    /// Normalize Unicode text
    pub fn normalize(text: &str) -> String {
        text.nfc().collect()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_core_functionality() {
        let result = core::process_text("hello world");
        assert_eq!(result, "hello world");
    }
    
    #[cfg(feature = "regex")]
    #[test]
    fn test_regex_functionality() {
        let text = "hello world hello rust";
        let matches = regex_utils::find_matches(text, r"\b\w+");
        assert_eq!(matches.len(), 4);
    }
    
    #[cfg(feature = "unicode")]
    #[test]
    fn test_unicode_functionality() {
        let text = "café";
        let normalized = unicode_utils::normalize(text);
        assert_eq!(normalized, "café");
    }
}
```

## Key Takeaways

**What** you've learned about library development:

1. **Library Structure** - How to organize code for reuse
2. **Cargo.toml Configuration** - Managing dependencies and features
3. **Documentation** - Writing comprehensive user guides
4. **Testing** - Ensuring code quality and reliability
5. **Publishing** - Sharing libraries with the community
6. **Feature Flags** - Enabling optional functionality
7. **Version Management** - Handling compatibility and updates

**Why** these concepts matter:

- **Code reuse** enables efficient development
- **Community contribution** helps the Rust ecosystem
- **Quality assurance** ensures reliable libraries
- **Documentation** improves user experience

## Next Steps

Now that you understand library development, you're ready to learn about:

- **Project Management** - Organizing large applications
- **Testing and Documentation** - Ensuring code quality
- **Performance Optimization** - Optimizing compilation and runtime
- **Advanced Topics** - Complex Rust concepts

**Where** to go next: Continue with the next lesson on "Practical Exercises" to reinforce your understanding of modules and packages!
