---
sidebar_position: 2
---

# Error Handling with Result

Master robust error handling in Rust using the Result type with comprehensive explanations using the 4W+H framework.

## What Is Error Handling with Result?

**What**: The `Result<T, E>` type is Rust's primary mechanism for handling operations that might succeed or fail. It's an enum with two variants: `Ok(T)` for success and `Err(E)` for errors, providing explicit error handling without exceptions.

**Why**: Understanding Result-based error handling is crucial because:

- **Explicit error handling** makes error cases visible and mandatory to handle
- **Type safety** prevents runtime crashes by catching errors at compile time
- **No exceptions** eliminates the unpredictability of exception-based error handling
- **Composable error handling** allows you to chain operations and handle errors appropriately
- **Performance** avoids the overhead of exception handling mechanisms
- **Debugging** makes error paths explicit and easier to trace
- **API design** enables clear contracts about what can fail and how

**When**: Use Result-based error handling when you need to:

- Handle operations that might fail (file I/O, network requests, parsing)
- Provide clear error information to callers
- Chain operations where any step might fail
- Create robust APIs that don't panic
- Handle user input validation
- Work with external systems that might fail

**How**: Result-based error handling works by:

- **Wrapping success values** in `Ok(value)` when operations succeed
- **Wrapping error information** in `Err(error)` when operations fail
- **Pattern matching** to handle both success and error cases
- **Error propagation** using `?` operator for concise error handling
- **Error transformation** using methods like `map`, `map_err`, and `and_then`
- **Combinator methods** for chaining operations and handling errors

**Where**: Result types are used throughout Rust programs for I/O operations, parsing, network requests, and any operation that might fail.

## Understanding Basic Result Usage

### Creating Result Values

**What**: How to create Result values for both success and error cases.

**Why**: Understanding Result creation is important because:

- **Explicit error modeling** allows you to represent failure cases in your types
- **API design** enables you to communicate what can fail to your users
- **Type safety** ensures error cases are handled at compile time
- **Error information** provides context about what went wrong

**When**: Use Result creation when you need to represent operations that might fail.

**How**: Here's how to create Result values:

```rust
fn main() {
    // Creating successful results
    let success_result: Result<i32, String> = Ok(42);
    let another_success = Ok("Hello, World!");

    // Creating error results
    let error_result: Result<i32, String> = Err("Something went wrong".to_string());
    let another_error = Err("Invalid input".to_string());

    // Processing results
    process_result(success_result);
    process_result(error_result);

    // Creating results from conditions
    let number = 10;
    let result = if number > 0 {
        Ok(number)
    } else {
        Err("Number must be positive".to_string())
    };

    process_result(result);
}

fn process_result<T>(result: Result<T, String>) {
    match result {
        Ok(value) => println!("Success: {:?}", value),
        Err(error) => println!("Error: {}", error),
    }
}
```

**Explanation**:

- `Ok(42)` creates a successful Result containing the value 42
- `Err("Something went wrong".to_string())` creates an error Result with an error message
- `Result<i32, String>` specifies the success type (i32) and error type (String)
- `if number > 0` conditionally creates Ok or Err based on the condition
- `match result` handles both success and error cases
- `Ok(value)` destructures the success case to access the contained value
- `Err(error)` destructures the error case to access the error information
- Result creation allows you to explicitly represent both success and failure cases

**Why**: This demonstrates how to create Result values and shows the explicit nature of error handling in Rust.

### Basic Result Pattern Matching

**What**: How to use pattern matching to handle Result values safely.

**Why**: Understanding Result pattern matching is important because:

- **Exhaustive handling** ensures both success and error cases are covered
- **Type safety** prevents runtime errors by catching unhandled cases
- **Explicit error handling** makes error cases visible and mandatory
- **Data extraction** allows you to safely access success values

**When**: Use Result pattern matching when you need to handle both success and error cases.

**How**: Here's how to pattern match on Result values:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Safe array access that returns Result
    let first = safe_get(&numbers, 0);
    let middle = safe_get(&numbers, 2);
    let out_of_bounds = safe_get(&numbers, 10);

    // Pattern matching on results
    match first {
        Ok(value) => println!("First element: {}", value),
        Err(error) => println!("Error: {}", error),
    }

    match middle {
        Ok(value) => println!("Middle element: {}", value),
        Err(error) => println!("Error: {}", error),
    }

    match out_of_bounds {
        Ok(value) => println!("Out of bounds element: {}", value),
        Err(error) => println!("Error: {}", error),
    }
}

fn safe_get<T>(vec: &Vec<T>, index: usize) -> Result<&T, String> {
    if index < vec.len() {
        Ok(&vec[index])
    } else {
        Err(format!("Index {} out of bounds for vector of length {}", index, vec.len()))
    }
}
```

**Explanation**:

- `safe_get` function returns `Result<&T, String>` for safe array access
- `Ok(&vec[index])` wraps the successful array access in Ok
- `Err(format!(...))` wraps the error case with a descriptive error message
- `match first` handles both success and error cases
- `Ok(value)` destructures the success case to access the array element
- `Err(error)` destructures the error case to access the error message
- Pattern matching ensures both cases are handled explicitly
- This prevents runtime panics from array index out of bounds errors

**Why**: This demonstrates how pattern matching on Result values provides safe error handling.

## Understanding Result Methods

### Unwrapping Methods

**What**: Methods that extract values from Result types, with different panic behaviors.

**Why**: Understanding unwrapping methods is important because:

- **Quick prototyping** allows you to extract values for simple cases
- **Panic behavior** provides different levels of safety
- **Error messages** can be customized for better debugging
- **Production code** requires careful consideration of when to use these methods

**When**: Use unwrapping methods when you're certain about the Result's state or for prototyping.

**How**: Here's how to use unwrapping methods:

```rust
fn main() {
    let success_result: Result<i32, String> = Ok(42);
    let error_result: Result<i32, String> = Err("Something went wrong".to_string());

    // unwrap() - panics on error
    let value1 = success_result.unwrap();
    println!("Success value: {}", value1);

    // This would panic:
    // let value2 = error_result.unwrap(); // Don't run this!

    // expect() - panics with custom message
    let value3 = success_result.expect("Expected a successful result");
    println!("Expected value: {}", value3);

    // This would panic with custom message:
    // let value4 = error_result.expect("This should not fail");

    // unwrap_or() - provides default value on error
    let value5 = error_result.unwrap_or(0);
    println!("Default value: {}", value5);

    // unwrap_or_else() - computes default value on error
    let value6 = error_result.unwrap_or_else(|error| {
        println!("Error occurred: {}", error);
        -1
    });
    println!("Computed default: {}", value6);
}
```

**Explanation**:

- `unwrap()` extracts the value from Ok or panics on Err
- `expect("message")` extracts the value from Ok or panics with a custom message on Err
- `unwrap_or(default)` extracts the value from Ok or returns the default value on Err
- `unwrap_or_else(|error| ...)` extracts the value from Ok or calls the closure on Err
- `unwrap()` and `expect()` should be used carefully as they can cause panics
- `unwrap_or()` and `unwrap_or_else()` provide safe alternatives with default values
- These methods are useful for prototyping but should be used carefully in production code

**Why**: This demonstrates different ways to extract values from Result types with varying levels of safety.

### Transformation Methods

**What**: Methods that transform Result values without unwrapping them.

**Why**: Understanding transformation methods is important because:

- **Composable operations** allow you to chain transformations safely
- **Error preservation** maintains error information through transformations
- **Type safety** ensures transformations are applied correctly
- **Functional programming** enables elegant data processing pipelines

**When**: Use transformation methods when you need to modify success values while preserving error information.

**How**: Here's how to use transformation methods:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Safe division that returns Result
    let result1 = safe_divide(10, 2);
    let result2 = safe_divide(10, 0);

    // Transform success values
    let doubled1 = result1.map(|x| x * 2.0);
    let doubled2 = result2.map(|x| x * 2.0);

    println!("Doubled success: {:?}", doubled1);
    println!("Doubled error: {:?}", doubled2);

    // Transform error messages
    let better_error1 = result1.map_err(|e| format!("Calculation failed: {}", e));
    let better_error2 = result2.map_err(|e| format!("Calculation failed: {}", e));

    println!("Better error success: {:?}", better_error1);
    println!("Better error error: {:?}", better_error2);

    // Chain transformations
    let final_result = result1
        .map(|x| x * 2.0)
        .map(|x| x + 1.0)
        .map(|x| format!("Result: {:.2}", x));

    println!("Chained result: {:?}", final_result);
}

fn safe_divide(a: i32, b: i32) -> Result<f64, String> {
    if b == 0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a as f64 / b as f64)
    }
}
```

**Explanation**:

- `map(|x| x * 2.0)` transforms the success value by doubling it
- `map_err(|e| format!(...))` transforms the error message to be more descriptive
- `map()` only affects the success case, leaving errors unchanged
- `map_err()` only affects the error case, leaving success values unchanged
- Transformations can be chained together for complex data processing
- The Result type is preserved through transformations
- This allows you to build complex data processing pipelines safely

**Why**: This demonstrates how to transform Result values while preserving error information.

### Combinator Methods

**What**: Methods that combine multiple Result values or handle complex error scenarios.

**Why**: Understanding combinator methods is important because:

- **Complex operations** allow you to handle multiple Result values together
- **Error handling** provides sophisticated ways to manage errors
- **Composable logic** enables building complex error handling pipelines
- **Functional programming** provides elegant ways to work with Result types

**When**: Use combinator methods when you need to handle multiple Result values or complex error scenarios.

**How**: Here's how to use combinator methods:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // and_then - chain operations that return Results
    let result1 = safe_get(&numbers, 0)
        .and_then(|x| safe_divide(*x as f64, 2.0));

    println!("Chained result: {:?}", result1);

    // or_else - handle errors with alternative operations
    let result2 = safe_get(&numbers, 10)
        .or_else(|_| Ok(&0)); // Provide default value on error

    println!("Fallback result: {:?}", result2);

    // and - combine two Results
    let result3 = safe_get(&numbers, 0);
    let result4 = safe_get(&numbers, 1);
    let combined = result3.and(result4);

    println!("Combined result: {:?}", combined);

    // or - try alternative on error
    let result5 = safe_get(&numbers, 10)
        .or(safe_get(&numbers, 0));

    println!("Alternative result: {:?}", result5);
}

fn safe_get<T>(vec: &Vec<T>, index: usize) -> Result<&T, String> {
    if index < vec.len() {
        Ok(&vec[index])
    } else {
        Err(format!("Index {} out of bounds", index))
    }
}

fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}
```

**Explanation**:

- `and_then(|x| ...)` chains operations that return Results
- `or_else(|_| ...)` handles errors by providing alternative operations
- `and(result)` combines two Results into a tuple Result
- `or(result)` tries an alternative Result if the first one fails
- `and_then` is useful for chaining operations that might fail
- `or_else` is useful for providing fallback behavior on errors
- `and` and `or` are useful for combining multiple Result values
- These methods enable complex error handling logic

**Why**: This demonstrates how to combine and chain Result operations for complex error handling scenarios.

## Understanding Error Propagation

### The ? Operator

**What**: The `?` operator provides concise error propagation by automatically handling Result types.

**Why**: Understanding the `?` operator is important because:

- **Conciseness** reduces boilerplate code for error handling
- **Error propagation** automatically forwards errors up the call stack
- **Readability** makes error handling code cleaner and more focused
- **Composability** enables chaining operations without nested match statements

**When**: Use the `?` operator when you want to propagate errors up the call stack automatically.

**How**: Here's how to use the `?` operator:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Using ? operator for error propagation
    match process_numbers(&numbers) {
        Ok(result) => println!("Final result: {}", result),
        Err(error) => println!("Error: {}", error),
    }
}

fn process_numbers(numbers: &Vec<i32>) -> Result<f64, String> {
    // Get first number
    let first = safe_get(numbers, 0)?;

    // Get second number
    let second = safe_get(numbers, 1)?;

    // Perform division
    let result = safe_divide(*first as f64, *second as f64)?;

    // Return success
    Ok(result)
}

fn safe_get<T>(vec: &Vec<T>, index: usize) -> Result<&T, String> {
    if index < vec.len() {
        Ok(&vec[index])
    } else {
        Err(format!("Index {} out of bounds", index))
    }
}

fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}
```

**Explanation**:

- `safe_get(numbers, 0)?` automatically handles the Result, returning the value on success or propagating the error
- `safe_divide(*first as f64, *second as f64)?` automatically handles the division Result
- The `?` operator is equivalent to a match statement that returns on error
- If any operation fails, the error is automatically propagated up the call stack
- The function signature must return a Result type to use the `?` operator
- This eliminates the need for nested match statements and makes error handling more concise

**Why**: This demonstrates how the `?` operator provides concise error propagation without boilerplate code.

### Error Transformation with ?

**What**: How to transform errors while using the `?` operator for better error messages.

**Why**: Understanding error transformation with `?` is important because:

- **Better error messages** provide more context about what went wrong
- **Error chaining** allows you to add context to errors as they propagate
- **Debugging** makes it easier to trace where errors originated
- **User experience** provides more helpful error messages

**When**: Use error transformation with `?` when you need to add context to errors as they propagate.

**How**: Here's how to transform errors with the `?` operator:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Process with error transformation
    match process_with_context(&numbers) {
        Ok(result) => println!("Final result: {}", result),
        Err(error) => println!("Error: {}", error),
    }
}

fn process_with_context(numbers: &Vec<i32>) -> Result<f64, String> {
    // Get first number with context
    let first = safe_get(numbers, 0)
        .map_err(|e| format!("Failed to get first number: {}", e))?;

    // Get second number with context
    let second = safe_get(numbers, 1)
        .map_err(|e| format!("Failed to get second number: {}", e))?;

    // Perform division with context
    let result = safe_divide(*first as f64, *second as f64)
        .map_err(|e| format!("Failed to divide {} by {}: {}", first, second, e))?;

    // Return success
    Ok(result)
}

fn safe_get<T>(vec: &Vec<T>, index: usize) -> Result<&T, String> {
    if index < vec.len() {
        Ok(&vec[index])
    } else {
        Err(format!("Index {} out of bounds", index))
    }
}

fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else {
        Ok(a / b)
    }
}
```

**Explanation**:

- `safe_get(numbers, 0).map_err(|e| format!(...))` transforms the error to add context
- The `?` operator still propagates the error, but now with additional context
- Each step adds its own context to the error message
- This creates a chain of error context that helps with debugging
- The error messages become more descriptive as they propagate up the call stack
- This pattern is useful for building robust error handling systems

**Why**: This demonstrates how to add context to errors while using the `?` operator for better error messages.

## Understanding Custom Error Types

### Defining Custom Error Types

**What**: How to create custom error types for better error handling and type safety.

**Why**: Understanding custom error types is important because:

- **Type safety** provides compile-time guarantees about error types
- **Error categorization** allows you to handle different error types differently
- **API design** enables clear contracts about what can fail
- **Debugging** makes it easier to identify and handle specific error types

**When**: Use custom error types when you need to handle different kinds of errors with different logic.

**How**: Here's how to define and use custom error types:

```rust
#[derive(Debug)]
enum MathError {
    DivisionByZero,
    NegativeNumber,
    Overflow,
}

impl std::fmt::Display for MathError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            MathError::DivisionByZero => write!(f, "Division by zero is not allowed"),
            MathError::NegativeNumber => write!(f, "Negative numbers are not allowed"),
            MathError::Overflow => write!(f, "Arithmetic overflow occurred"),
        }
    }
}

impl std::error::Error for MathError {}

fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Test different error cases
    let result1 = safe_divide_with_custom_error(10, 2);
    let result2 = safe_divide_with_custom_error(10, 0);
    let result3 = safe_divide_with_custom_error(-5, 2);

    process_custom_result(result1);
    process_custom_result(result2);
    process_custom_result(result3);
}

fn safe_divide_with_custom_error(a: i32, b: i32) -> Result<f64, MathError> {
    if a < 0 {
        return Err(MathError::NegativeNumber);
    }

    if b == 0 {
        return Err(MathError::DivisionByZero);
    }

    let result = a as f64 / b as f64;

    if result.is_infinite() || result.is_nan() {
        return Err(MathError::Overflow);
    }

    Ok(result)
}

fn process_custom_result(result: Result<f64, MathError>) {
    match result {
        Ok(value) => println!("Success: {}", value),
        Err(MathError::DivisionByZero) => println!("Error: Cannot divide by zero"),
        Err(MathError::NegativeNumber) => println!("Error: Negative numbers not allowed"),
        Err(MathError::Overflow) => println!("Error: Arithmetic overflow occurred"),
    }
}
```

**Explanation**:

- `enum MathError` defines different types of mathematical errors
- `impl std::fmt::Display` provides human-readable error messages
- `impl std::error::Error` makes the type compatible with Rust's error handling system
- `safe_divide_with_custom_error` returns `Result<f64, MathError>` with specific error types
- Each error case is handled differently in `process_custom_result`
- Custom error types provide better error categorization and handling
- This enables more sophisticated error handling logic

**Why**: This demonstrates how custom error types provide better error categorization and handling.

### Error Conversion and Chaining

**What**: How to convert between different error types and chain error handling.

**Why**: Understanding error conversion and chaining is important because:

- **Error compatibility** allows you to work with different error types
- **Error chaining** enables building complex error handling systems
- **Type safety** ensures error types are handled correctly
- **API integration** allows you to work with different libraries and their error types

**When**: Use error conversion and chaining when you need to work with different error types or build complex error handling systems.

**How**: Here's how to convert and chain errors:

```rust
use std::num::ParseIntError;

#[derive(Debug)]
enum AppError {
    ParseError(ParseIntError),
    MathError(MathError),
    CustomError(String),
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::ParseError(e) => write!(f, "Parse error: {}", e),
            AppError::MathError(e) => write!(f, "Math error: {}", e),
            AppError::CustomError(msg) => write!(f, "Custom error: {}", msg),
        }
    }
}

impl std::error::Error for AppError {}

// Convert ParseIntError to AppError
impl From<ParseIntError> for AppError {
    fn from(error: ParseIntError) -> Self {
        AppError::ParseError(error)
    }
}

// Convert MathError to AppError
impl From<MathError> for AppError {
    fn from(error: MathError) -> Self {
        AppError::MathError(error)
    }
}

fn main() {
    let input = "42";
    let result = process_string_input(input);

    match result {
        Ok(value) => println!("Success: {}", value),
        Err(error) => println!("Error: {}", error),
    }
}

fn process_string_input(input: &str) -> Result<f64, AppError> {
    // Parse string to integer
    let number: i32 = input.parse()?; // Automatically converts ParseIntError to AppError

    // Perform mathematical operation
    let result = safe_divide_with_custom_error(number, 2)?; // Automatically converts MathError to AppError

    Ok(result)
}

fn safe_divide_with_custom_error(a: i32, b: i32) -> Result<f64, MathError> {
    if a < 0 {
        return Err(MathError::NegativeNumber);
    }

    if b == 0 {
        return Err(MathError::DivisionByZero);
    }

    let result = a as f64 / b as f64;

    if result.is_infinite() || result.is_nan() {
        return Err(MathError::Overflow);
    }

    Ok(result)
}
```

**Explanation**:

- `enum AppError` defines a unified error type that can contain different error types
- `impl From<ParseIntError> for AppError` converts ParseIntError to AppError
- `impl From<MathError> for AppError` converts MathError to AppError
- `input.parse()?` automatically converts ParseIntError to AppError using the From trait
- `safe_divide_with_custom_error(number, 2)?` automatically converts MathError to AppError
- Error conversion allows you to work with different error types in a unified way
- This enables building complex error handling systems that work with multiple error types

**Why**: This demonstrates how error conversion and chaining enable complex error handling systems.

## Key Takeaways

**What** you've learned about error handling with Result:

1. **Result Type** - How to use `Result<T, E>` for operations that might fail
2. **Pattern Matching** - How to handle both success and error cases with match
3. **Unwrapping Methods** - How to extract values with different safety levels
4. **Transformation Methods** - How to transform Result values while preserving errors
5. **Combinator Methods** - How to combine and chain Result operations
6. **Error Propagation** - How to use the `?` operator for concise error handling
7. **Custom Error Types** - How to create and use custom error types
8. **Error Conversion** - How to convert between different error types
9. **Error Chaining** - How to build complex error handling systems
10. **Best Practices** - How to write robust error handling code

**Why** these concepts matter:

- **Explicit error handling** prevents runtime crashes and makes errors visible
- **Type safety** ensures error cases are handled at compile time
- **Composable error handling** enables building complex error handling systems
- **Better debugging** makes error paths explicit and easier to trace
- **API design** enables clear contracts about what can fail
- **User experience** provides better error messages and handling

## Next Steps

Now that you understand error handling with Result, you're ready to learn about:

- **Advanced error handling** - More sophisticated error handling patterns
- **Error recovery** - Strategies for recovering from errors
- **Error logging** - How to log and monitor errors
- **Error handling best practices** - Idiomatic Rust error handling

**Where** to go next: Continue with the next lesson on "Option Handling" to learn about working with optional values in Rust!

## Resources

**Official Documentation**:

- [The Rust Book - Error Handling](https://doc.rust-lang.org/book/ch09-00-error-handling.html)
- [Rust by Example - Result](https://doc.rust-lang.org/rust-by-example/error/result.html)
- [Rust Reference - Result](https://doc.rust-lang.org/std/result/)

**Community Resources**:

- [Rust Community](https://www.rust-lang.org/community)
- [Rust Users Forum](https://users.rust-lang.org/)
- [Reddit r/rust](https://reddit.com/r/rust)

**Learning Resources**:

- [Rustlings](https://github.com/rust-lang/rustlings)
- [Exercism Rust Track](https://exercism.org/tracks/rust)
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/)

**Practice Tips**:

1. **Understand the Result type** - Make sure you can explain how Result works
2. **Practice with different error types** - Try various error handling scenarios
3. **Use the ? operator** - Practice error propagation patterns
4. **Create custom error types** - Build error types for your specific use cases
5. **Handle errors explicitly** - Avoid using unwrap() in production code
6. **Read error messages carefully** - Rust's compiler errors are very helpful for learning
7. **Practice regularly** - Consistent practice is key to mastering error handling

Happy coding! 🦀
