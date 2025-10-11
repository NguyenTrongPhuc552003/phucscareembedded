---
sidebar_position: 2
---

# Fuzzing

Master fuzzing techniques in Rust for automated bug discovery and robust testing.

## What Is Fuzzing?

**What**: Fuzzing is an automated testing technique that provides random, malformed, or unexpected inputs to a program to find bugs, crashes, or security vulnerabilities. It's particularly effective for finding edge cases and boundary conditions.

**Why**: Fuzzing provides:

- **Automated bug discovery** - finds bugs without manual test case creation
- **Edge case detection** - discovers boundary conditions and unusual inputs
- **Security testing** - finds vulnerabilities and security issues
- **Regression prevention** - catches bugs introduced by changes
- **Comprehensive coverage** - tests with many more inputs than manual testing

**When**: Use fuzzing when you need to:

- Test input parsing and validation
- Find security vulnerabilities
- Test network protocols and file formats
- Discover edge cases in algorithms
- Test error handling and recovery

**Where**: Fuzzing is typically used for testing external interfaces, parsers, and systems that process untrusted input.

## How to Use Cargo Fuzz

### Basic Fuzzing Setup

**What**: Cargo Fuzz is a fuzzing framework for Rust that integrates with LLVM's libFuzzer.

**How**: Here's how to set up basic fuzzing:

```rust
// fuzz/fuzz_targets/parser_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn parse_json(input: &str) -> Result<serde_json::Value, serde_json::Error> {
    serde_json::from_str(input)
}

fuzz_target!(|data: &[u8]| {
    // Convert bytes to string (may be invalid UTF-8)
    if let Ok(s) = std::str::from_utf8(data) {
        // Test the parser with fuzzed input
        let _ = parse_json(s);
    }
});
```

**Explanation**:

- `#![no_main]` disables the standard main function
- `fuzz_target!` macro defines the fuzzing target
- `data: &[u8]` provides random byte input
- The function tests the parser with fuzzed input
- Invalid UTF-8 is handled gracefully

**Why**: Basic fuzzing setup provides automated testing with random inputs.

### Advanced Fuzzing

**What**: Advanced fuzzing can test complex interactions and stateful systems.

**How**: Here's how to implement advanced fuzzing:

```rust
// fuzz/fuzz_targets/stateful_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;
use std::collections::HashMap;

// Stateful system to test
struct Database {
    data: HashMap<String, String>,
    transaction_log: Vec<String>,
}

impl Database {
    fn new() -> Self {
        Self {
            data: HashMap::new(),
            transaction_log: Vec::new(),
        }
    }

    fn insert(&mut self, key: String, value: String) {
        self.data.insert(key.clone(), value.clone());
        self.transaction_log.push(format!("INSERT: {} = {}", key, value));
    }

    fn get(&self, key: &str) -> Option<&String> {
        self.data.get(key)
    }

    fn delete(&mut self, key: &str) -> bool {
        if self.data.remove(key).is_some() {
            self.transaction_log.push(format!("DELETE: {}", key));
            true
        } else {
            false
        }
    }
}

fuzz_target!(|data: &[u8]| {
    if data.len() < 2 {
        return;
    }

    let mut db = Database::new();
    let mut i = 0;

    while i < data.len() - 1 {
        let operation = data[i] % 3;
        let key_len = (data[i + 1] % 10) + 1;

        if i + key_len + 1 >= data.len() {
            break;
        }

        let key = String::from_utf8_lossy(&data[i + 2..i + 2 + key_len]).to_string();
        i += key_len + 2;

        match operation {
            0 => {
                // INSERT operation
                if i < data.len() {
                    let value = format!("value_{}", data[i]);
                    db.insert(key, value);
                }
            },
            1 => {
                // GET operation
                let _ = db.get(&key);
            },
            2 => {
                // DELETE operation
                let _ = db.delete(&key);
            },
            _ => {}
        }
    }
});
```

**Explanation**:

- Fuzzing tests a stateful database system
- Operations are determined by fuzzed input
- Key and value lengths are derived from input
- The system is tested with random operations

**Why**: Advanced fuzzing tests complex stateful systems with random operations.

## Understanding Fuzzing Techniques

### Input Generation

**What**: Fuzzing generates various types of inputs to test different scenarios.

**How**: Here's how to implement different input generation strategies:

```rust
// fuzz/fuzz_targets/input_generation.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn process_input(input: &str) -> Result<String, String> {
    if input.is_empty() {
        return Err("Empty input".to_string());
    }

    if input.len() > 1000 {
        return Err("Input too long".to_string());
    }

    if input.contains('\0') {
        return Err("Null character found".to_string());
    }

    Ok(input.to_uppercase())
}

fuzz_target!(|data: &[u8]| {
    // Strategy 1: Direct byte input
    if let Ok(s) = std::str::from_utf8(data) {
        let _ = process_input(s);
    }

    // Strategy 2: Modified input
    if data.len() > 0 {
        let mut modified = data.to_vec();
        if modified.len() > 1 {
            modified[0] = modified[0].wrapping_add(1);
        }
        if let Ok(s) = std::str::from_utf8(&modified) {
            let _ = process_input(s);
        }
    }

    // Strategy 3: Truncated input
    if data.len() > 10 {
        let truncated = &data[..data.len() / 2];
        if let Ok(s) = std::str::from_utf8(truncated) {
            let _ = process_input(s);
        }
    }
});
```

**Explanation**:

- Multiple input generation strategies are used
- Direct byte input tests normal cases
- Modified input tests edge cases
- Truncated input tests boundary conditions

**Why**: Different input generation strategies test various scenarios and edge cases.

### Mutation-Based Fuzzing

**What**: Mutation-based fuzzing takes existing inputs and modifies them to create new test cases.

**How**: Here's how to implement mutation-based fuzzing:

```rust
// fuzz/fuzz_targets/mutation_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn parse_config(input: &str) -> Result<HashMap<String, String>, String> {
    let mut config = HashMap::new();

    for line in input.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }

        if let Some((key, value)) = line.split_once('=') {
            config.insert(key.trim().to_string(), value.trim().to_string());
        } else {
            return Err(format!("Invalid line: {}", line));
        }
    }

    Ok(config)
}

fuzz_target!(|data: &[u8]| {
    if let Ok(s) = std::str::from_utf8(data) {
        // Test original input
        let _ = parse_config(s);

        // Test mutations
        let mutations = generate_mutations(s);
        for mutation in mutations {
            let _ = parse_config(&mutation);
        }
    }
});

fn generate_mutations(input: &str) -> Vec<String> {
    let mut mutations = Vec::new();

    // Mutation 1: Add random characters
    for i in 0..input.len() {
        let mut mutated = input.to_string();
        mutated.insert(i, 'X');
        mutations.push(mutated);
    }

    // Mutation 2: Remove characters
    for i in 0..input.len() {
        let mut mutated = input.to_string();
        mutated.remove(i);
        mutations.push(mutated);
    }

    // Mutation 3: Replace characters
    for i in 0..input.len() {
        let mut mutated = input.to_string();
        mutated.replace_range(i..i+1, "Y");
        mutations.push(mutated);
    }

    mutations
}
```

**Explanation**:

- Mutation-based fuzzing modifies existing inputs
- Multiple mutation strategies are used
- Each mutation tests a different scenario
- Mutations help find edge cases and boundary conditions

**Why**: Mutation-based fuzzing is effective for finding bugs in parsers and input processors.

### Grammar-Based Fuzzing

**What**: Grammar-based fuzzing generates inputs according to a formal grammar specification.

**How**: Here's how to implement grammar-based fuzzing:

```rust
// fuzz/fuzz_targets/grammar_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn parse_expression(input: &str) -> Result<i32, String> {
    let tokens: Vec<&str> = input.split_whitespace().collect();
    if tokens.is_empty() {
        return Err("Empty expression".to_string());
    }

    let mut stack = Vec::new();

    for token in tokens {
        match token {
            "+" => {
                if stack.len() < 2 {
                    return Err("Not enough operands".to_string());
                }
                let b = stack.pop().unwrap();
                let a = stack.pop().unwrap();
                stack.push(a + b);
            },
            "-" => {
                if stack.len() < 2 {
                    return Err("Not enough operands".to_string());
                }
                let b = stack.pop().unwrap();
                let a = stack.pop().unwrap();
                stack.push(a - b);
            },
            "*" => {
                if stack.len() < 2 {
                    return Err("Not enough operands".to_string());
                }
                let b = stack.pop().unwrap();
                let a = stack.pop().unwrap();
                stack.push(a * b);
            },
            _ => {
                if let Ok(num) = token.parse::<i32>() {
                    stack.push(num);
                } else {
                    return Err(format!("Invalid token: {}", token));
                }
            }
        }
    }

    if stack.len() != 1 {
        return Err("Invalid expression".to_string());
    }

    Ok(stack[0])
}

fuzz_target!(|data: &[u8]| {
    if let Ok(s) = std::str::from_utf8(data) {
        // Test original input
        let _ = parse_expression(s);

        // Test grammar-generated inputs
        let expressions = generate_expressions(data);
        for expr in expressions {
            let _ = parse_expression(&expr);
        }
    }
});

fn generate_expressions(data: &[u8]) -> Vec<String> {
    let mut expressions = Vec::new();

    // Generate simple expressions
    for i in 0..data.len().min(10) {
        let num1 = (data[i] % 100) as i32;
        let num2 = (data[(i + 1) % data.len()] % 100) as i32;
        let op = match data[i] % 3 {
            0 => "+",
            1 => "-",
            _ => "*",
        };
        expressions.push(format!("{} {} {}", num1, op, num2));
    }

    // Generate complex expressions
    if data.len() >= 3 {
        let num1 = (data[0] % 100) as i32;
        let num2 = (data[1] % 100) as i32;
        let num3 = (data[2] % 100) as i32;
        let op1 = match data[0] % 3 {
            0 => "+",
            1 => "-",
            _ => "*",
        };
        let op2 = match data[1] % 3 {
            0 => "+",
            1 => "-",
            _ => "*",
        };
        expressions.push(format!("{} {} {} {} {}", num1, op1, num2, op2, num3));
    }

    expressions
}
```

**Explanation**:

- Grammar-based fuzzing generates inputs according to rules
- Simple expressions test basic functionality
- Complex expressions test edge cases
- Grammar rules ensure valid input structure

**Why**: Grammar-based fuzzing generates more realistic test inputs.

## Understanding Fuzzing Best Practices

### Fuzzing Setup

**What**: Proper fuzzing setup ensures effective bug discovery and maintainable tests.

**How**: Here's how to set up fuzzing properly:

```rust
// fuzz/fuzz_targets/setup_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn process_data(input: &[u8]) -> Result<Vec<u8>, String> {
    if input.is_empty() {
        return Err("Empty input".to_string());
    }

    if input.len() > 10000 {
        return Err("Input too large".to_string());
    }

    // Process the data
    let mut result = Vec::new();
    for &byte in input {
        result.push(byte.wrapping_add(1));
    }

    Ok(result)
}

fuzz_target!(|data: &[u8]| {
    // Test with original input
    let _ = process_data(data);

    // Test with modified input
    if data.len() > 0 {
        let mut modified = data.to_vec();
        modified[0] = modified[0].wrapping_add(1);
        let _ = process_data(&modified);
    }

    // Test with truncated input
    if data.len() > 1 {
        let truncated = &data[..data.len() / 2];
        let _ = process_data(truncated);
    }
});
```

**Explanation**:

- Fuzzing setup includes multiple test strategies
- Original input is tested first
- Modified input tests edge cases
- Truncated input tests boundary conditions

**Why**: Proper fuzzing setup ensures comprehensive testing and bug discovery.

### Fuzzing Configuration

**What**: Fuzzing configuration controls how fuzzing is performed and what inputs are generated.

**How**: Here's how to configure fuzzing:

```rust
// fuzz/fuzz_targets/config_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn validate_input(input: &str) -> Result<bool, String> {
    if input.is_empty() {
        return Err("Empty input".to_string());
    }

    if input.len() > 1000 {
        return Err("Input too long".to_string());
    }

    if input.contains('\0') {
        return Err("Null character found".to_string());
    }

    if input.chars().any(|c| c.is_control()) {
        return Err("Control character found".to_string());
    }

    Ok(true)
}

fuzz_target!(|data: &[u8]| {
    // Test with UTF-8 input
    if let Ok(s) = std::str::from_utf8(data) {
        let _ = validate_input(s);
    }

    // Test with ASCII input
    if data.iter().all(|&b| b.is_ascii()) {
        if let Ok(s) = std::str::from_utf8(data) {
            let _ = validate_input(s);
        }
    }

    // Test with binary input
    let binary = data.iter().map(|&b| format!("{:08b}", b)).collect::<Vec<_>>().join("");
    let _ = validate_input(&binary);
});
```

**Explanation**:

- Fuzzing configuration tests different input types
- UTF-8 input tests normal text processing
- ASCII input tests restricted character sets
- Binary input tests edge cases

**Why**: Fuzzing configuration ensures comprehensive testing of different input types.

## Understanding Fuzzing Tools

### Cargo Fuzz

**What**: Cargo Fuzz is the standard fuzzing tool for Rust projects.

**How**: Here's how to use Cargo Fuzz:

```bash
# Install cargo-fuzz
cargo install cargo-fuzz

# Initialize fuzzing in a project
cargo fuzz init

# Run a specific fuzzing target
cargo fuzz run parser_fuzz

# Run fuzzing with specific options
cargo fuzz run parser_fuzz -- -max_len=1000 -timeout=60
```

**Explanation**:

- `cargo fuzz init` sets up fuzzing in a project
- `cargo fuzz run` runs a specific fuzzing target
- Options control fuzzing behavior and limits

**Why**: Cargo Fuzz provides easy-to-use fuzzing for Rust projects.

### Custom Fuzzing

**What**: Custom fuzzing allows you to implement specialized fuzzing strategies.

**How**: Here's how to implement custom fuzzing:

```rust
// fuzz/fuzz_targets/custom_fuzz.rs
#![no_main]
use libfuzzer_sys::fuzz_target;

// Function to test
fn process_json(input: &str) -> Result<serde_json::Value, serde_json::Error> {
    serde_json::from_str(input)
}

fuzz_target!(|data: &[u8]| {
    // Custom fuzzing strategy
    let inputs = generate_custom_inputs(data);

    for input in inputs {
        let _ = process_json(&input);
    }
});

fn generate_custom_inputs(data: &[u8]) -> Vec<String> {
    let mut inputs = Vec::new();

    // Strategy 1: Generate valid JSON
    if data.len() >= 2 {
        let key_len = (data[0] % 10) + 1;
        let value_len = (data[1] % 10) + 1;

        if key_len + value_len < data.len() {
            let key = String::from_utf8_lossy(&data[2..2 + key_len]).to_string();
            let value = String::from_utf8_lossy(&data[2 + key_len..2 + key_len + value_len]).to_string();
            inputs.push(format!("{{\"{}\": \"{}\"}}", key, value));
        }
    }

    // Strategy 2: Generate malformed JSON
    if data.len() >= 1 {
        let corruption_point = (data[0] % 20) + 1;
        let mut json = String::from("{\"key\": \"value\"}");

        if corruption_point < json.len() {
            json.insert(corruption_point, 'X');
            inputs.push(json);
        }
    }

    // Strategy 3: Generate nested JSON
    if data.len() >= 3 {
        let depth = (data[0] % 5) + 1;
        let mut json = String::new();

        for i in 0..depth {
            json.push('{');
            json.push_str(&format!("\"level{}\": ", i));
        }

        json.push_str("\"value\"");

        for _ in 0..depth {
            json.push('}');
        }

        inputs.push(json);
    }

    inputs
}
```

**Explanation**:

- Custom fuzzing implements specialized strategies
- Valid JSON generation tests normal cases
- Malformed JSON generation tests error handling
- Nested JSON generation tests complex structures

**Why**: Custom fuzzing allows testing of specific scenarios and edge cases.

## Key Takeaways

**What** you've learned about fuzzing:

1. **Fuzzing basics** - automated testing with random inputs
2. **Input generation** - various strategies for creating test inputs
3. **Mutation-based fuzzing** - modifying existing inputs
4. **Grammar-based fuzzing** - generating inputs according to rules
5. **Fuzzing setup** - proper configuration and organization
6. **Custom fuzzing** - specialized strategies for specific needs
7. **Fuzzing tools** - Cargo Fuzz and other fuzzing frameworks

**Why** these concepts matter:

- **Bug discovery** - finds bugs automatically
- **Edge case testing** - discovers boundary conditions
- **Security testing** - finds vulnerabilities
- **Comprehensive coverage** - tests with many inputs

## Next Steps

Now that you understand fuzzing, you're ready to learn about:

- **Debugging tools** - debugging techniques and tools
- **Error handling and recovery** - robust error management
- **Performance testing** - testing performance characteristics
- **Testing best practices** - comprehensive testing strategies

**Where** to go next: Continue with the next lesson on "Debugging Techniques" to learn about debugging tools and techniques!
