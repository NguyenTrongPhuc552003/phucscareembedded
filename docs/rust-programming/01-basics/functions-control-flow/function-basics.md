---
sidebar_position: 1
---

# Function Basics

Master the fundamentals of Rust functions with comprehensive explanations using the 4W+H framework.

## What Are Functions?

**What**: Functions are reusable blocks of code that perform specific tasks. In Rust, functions are first-class citizens and form the backbone of program organization.

**Why**: Functions help you:

- **Organize code** into logical, manageable pieces
- **Avoid repetition** by reusing code
- **Improve readability** by giving meaningful names to operations
- **Enable testing** by isolating functionality
- **Facilitate maintenance** by centralizing logic

**When**: Use functions when you have:

- Code that needs to be executed multiple times
- Complex logic that should be separated
- Operations that can be given descriptive names
- Code that might be tested independently

## How to Define Functions in Rust

### Basic Function Syntax

**How**: Here's the fundamental syntax for defining functions in Rust:

```rust
fn main() {
    println!("Hello from main!");
    greet();  // Function call
}

fn greet() {
    println!("Hello, world!");
}
```

**Explanation**:

- `fn` is the keyword to define a function
- `greet` is the function name (use snake_case in Rust)
- `()` indicates no parameters
- `{}` contains the function body
- The function is called from `main()` using `greet()`

**Where**: Functions can be defined anywhere in your code, but they must be defined before they're called (or use forward declarations).

### Function with Parameters

**What**: Parameters allow functions to accept input values.

**How**: Here's how to define and use functions with parameters:

```rust
fn main() {
    greet("Alice");  // Pass string literal
    greet("Bob");    // Pass another string
}

fn greet(name: &str) {
    println!("Hello, {}!", name);
}
```

**Explanation**:

- `name: &str` is a parameter with type annotation
- `&str` means "string slice" - a reference to string data
- The `{}` in `println!` is a placeholder for the parameter
- We call the function with different string values

**Why**: Parameters make functions flexible and reusable with different inputs.

### Function with Return Values

**What**: Return values allow functions to send data back to the caller.

**How**: Here's how to create functions that return values:

```rust
fn main() {
    let result = add(5, 3);  // Store the returned value
    println!("5 + 3 = {}", result);
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // No semicolon - this is an expression that returns
}
```

**Explanation**:

- `-> i32` specifies the return type
- `x + y` is an expression (no semicolon) that becomes the return value
- The returned value is stored in the `result` variable
- `i32` is a 32-bit signed integer type

**Why**: Return values allow functions to produce results that can be used elsewhere in your program.

## Understanding Function Parameters

### Multiple Parameters

**What**: Functions can accept multiple parameters of the same or different types.

**How**: Here's how to work with multiple parameters:

```rust
fn main() {
    let sum = add(10, 20);        // Two integer parameters
    let product = multiply(3, 4); // Two integer parameters
    let quotient = divide(15, 3); // Two integer parameters

    println!("Sum: {}", sum);
    println!("Product: {}", product);
    println!("Quotient: {}", quotient);
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // Returns the sum of two integers
}

fn multiply(x: i32, y: i32) -> i32 {
    x * y  // Returns the product of two integers
}

fn divide(x: i32, y: i32) -> i32 {
    x / y  // Returns the quotient (integer division)
}
```

**Explanation**:

- Each function takes two `i32` parameters
- Parameters are separated by commas
- Each parameter must have a type annotation
- The functions perform different mathematical operations
- All return `i32` values

**Why**: Multiple parameters allow functions to work with complex data and perform sophisticated operations.

### Different Parameter Types

**What**: Rust functions can accept parameters of different types in a single function.

**How**: Here's how to mix different parameter types:

```rust
fn main() {
    print_info("Alice", 25, 5.6);  // String, integer, float
    print_info("Bob", 30, 6.0);   // Different values, same types
}

fn print_info(name: &str, age: u32, height: f64) {
    println!("Name: {}, Age: {}, Height: {}", name, age, height);
}
```

**Explanation**:

- `name: &str` - string slice (text data)
- `age: u32` - unsigned 32-bit integer (positive numbers only)
- `height: f64` - 64-bit floating-point number (decimal numbers)
- Each parameter has its own type annotation
- The function can handle different data types simultaneously

**Why**: Real-world functions often need to work with different types of data (text, numbers, decimals).

### Function with No Parameters

**What**: Some functions don't need input parameters but can still return values.

**How**: Here's how to create parameterless functions:

```rust
fn main() {
    let current_time = get_current_time();  // No parameters needed
    println!("Current time: {}", current_time);
}

fn get_current_time() -> &'static str {
    "12:00 PM"  // Returns a string literal
}
```

**Explanation**:

- `()` indicates no parameters
- `-> &'static str` means it returns a string that lives for the entire program
- The function provides a fixed value (simplified example)
- No input is required to get the current time

**Why**: Some functions provide constant values or perform operations that don't require input.

## Understanding Return Values

### Explicit Return

**What**: Explicit return uses the `return` keyword to send a value back to the caller.

**How**: Here's how to use explicit returns:

```rust
fn main() {
    let result = calculate_area(5.0, 3.0);
    println!("Area: {}", result);
}

fn calculate_area(length: f64, width: f64) -> f64 {
    return length * width;  // Explicit return with 'return' keyword
}
```

**Explanation**:

- `return` keyword explicitly sends the value back
- The calculation `length * width` is performed
- The result is returned to the caller
- `f64` indicates the return type is a 64-bit float

**When**: Use explicit return when you need to return early from a function or when the logic is complex.

**Why**: Explicit returns make the return point clear and can be used for early exits from functions.

### Implicit Return (Expression)

**What**: Implicit return is the Rust-idiomatic way where the last expression becomes the return value.

**How**: Here's the preferred Rust style:

```rust
fn main() {
    let result = calculate_area(5.0, 3.0);
    println!("Area: {}", result);
}

fn calculate_area(length: f64, width: f64) -> f64 {
    length * width  // No semicolon - this is an expression that returns
}
```

**Explanation**:

- No `return` keyword needed
- No semicolon after the expression
- The last expression automatically becomes the return value
- This is the idiomatic Rust style

**Why**: Implicit returns are cleaner and more idiomatic in Rust. They encourage expression-based programming.

### Multiple Return Values

**What**: Rust functions can return multiple values using tuples.

**How**: Here's how to return multiple values:

```rust
fn main() {
    let (sum, product) = calculate_both(5, 3);  // Destructure the tuple
    println!("Sum: {}, Product: {}", sum, product);
}

fn calculate_both(x: i32, y: i32) -> (i32, i32) {
    (x + y, x * y)  // Return a tuple with two values
}
```

**Explanation**:

- `-> (i32, i32)` indicates the function returns a tuple of two integers
- `(x + y, x * y)` creates a tuple with sum and product
- `let (sum, product)` destructures the tuple into separate variables
- Both values are returned in a single tuple

**Why**: Multiple return values allow functions to provide several related results without creating complex data structures.

### No Return Value

**What**: Functions that don't return meaningful values return the unit type `()`.

**How**: Here's how functions without return values work:

```rust
fn main() {
    print_separator();  // Function call
    println!("This is some text");
    print_separator();  // Another function call
}

fn print_separator() {
    println!("-------------------");
    // No return value - implicitly returns unit type ()
}
```

**Explanation**:

- No return type annotation means it returns `()`
- `()` is the unit type (like `void` in other languages)
- The function performs side effects (printing) but doesn't return data
- Rust automatically returns `()` if no explicit return is provided

**Why**: Some functions perform actions (side effects) without needing to return data to the caller.

## Understanding Function Scope

### Local Variables

**What**: Each function has its own scope where variables are local and don't interfere with other functions.

**How**: Here's how variable scope works in functions:

```rust
fn main() {
    let x = 5;  // Variable in main's scope
    println!("x in main: {}", x);

    another_function();  // Call another function

    println!("x in main after function call: {}", x);  // x is still 5
}

fn another_function() {
    let x = 10;  // Different variable with same name
    println!("x in another_function: {}", x);  // This x is 10
}
```

**Explanation**:

- `x` in `main()` and `x` in `another_function()` are completely separate
- Each function has its own scope (namespace)
- Variables in one function cannot access variables in another function
- The `x` in `main()` remains unchanged after calling `another_function()`

**Why**: Scope isolation prevents functions from accidentally modifying each other's variables, making code safer and more predictable.

### Parameter Scope

**What**: Function parameters are local variables that receive copies of the values passed to the function.

**How**: Here's how parameter scope works:

```rust
fn main() {
    let x = 5;   // Original variable
    let y = 10;  // Original variable

    println!("Before function call: x = {}, y = {}", x, y);

    swap_values(x, y);  // Pass copies of x and y

    println!("After function call: x = {}, y = {}", x, y);  // Original values unchanged
}

fn swap_values(a: i32, b: i32) {
    println!("Inside function: a = {}, b = {}", a, b);
    // Parameters a and b are local copies
    // Changes to a and b don't affect the original x and y
}
```

**Explanation**:

- `x` and `y` in `main()` are passed as copies to `swap_values()`
- The parameters `a` and `b` are local variables in `swap_values()`
- Changes to `a` and `b` don't affect the original `x` and `y`
- This is called "pass by value" - copies are made

**Why**: Parameter scope ensures that functions can't accidentally modify the caller's variables, providing data safety.

## Rust's Approach to Function Naming

### No Function Overloading

**What**: Rust doesn't support function overloading (multiple functions with the same name but different parameters).

**Why**: Rust prioritizes clarity and explicit naming over convenience. This prevents ambiguity and makes code more readable.

**How**: Instead of overloading, use descriptive function names:

```rust
// This won't work in Rust - no function overloading
// fn add(x: i32, y: i32) -> i32 { x + y }
// fn add(x: f64, y: f64) -> f64 { x + y }

// Instead, use different function names
fn add_i32(x: i32, y: i32) -> i32 {
    x + y  // Integer addition
}

fn add_f64(x: f64, y: f64) -> f64 {
    x + y  // Float addition
}

fn main() {
    let result1 = add_i32(5, 3);    // Integer addition
    let result2 = add_f64(5.0, 3.0); // Float addition

    println!("i32 add: {}", result1);
    println!("f64 add: {}", result2);
}
```

**Explanation**:

- `add_i32` clearly indicates integer addition
- `add_f64` clearly indicates float addition
- No ambiguity about which function is being called
- The compiler knows exactly which function to use

**When**: Use descriptive names whenever you need similar functions with different parameter types.

## Function Documentation

### Basic Documentation

**What**: Rust uses special documentation comments (`///`) to document functions.

**Why**: Good documentation helps other developers (and future you) understand what functions do, how to use them, and what to expect.

**How**: Here's how to document functions properly:

```rust
/// Adds two numbers together
///
/// # Arguments
///
/// * `x` - The first number
/// * `y` - The second number
///
/// # Returns
///
/// The sum of the two numbers
fn add(x: i32, y: i32) -> i32 {
    x + y
}

fn main() {
    let result = add(5, 3);
    println!("Result: {}", result);
}
```

**Explanation**:

- `///` creates documentation comments (not regular comments)
- The first line is a brief description
- `# Arguments` section describes each parameter
- `# Returns` section describes what the function returns
- This documentation can be generated into HTML docs

**When**: Document all public functions and any complex private functions.

### Example Documentation

**What**: Documentation can include examples that show how to use the function.

**How**: Here's how to add examples to your documentation:

````rust
/// Calculates the area of a rectangle
///
/// # Examples
///
/// ```
/// let area = calculate_area(5.0, 3.0);
/// assert_eq!(area, 15.0);
/// ```
fn calculate_area(length: f64, width: f64) -> f64 {
    length * width
}

fn main() {
    let area = calculate_area(5.0, 3.0);
    println!("Area: {}", area);
}
````

**Explanation**:

- The example shows how to call the function
- `assert_eq!` verifies the expected result
- Examples are tested automatically by Rust's documentation system
- This helps users understand the function's behavior

**Why**: Examples make documentation more useful by showing real usage patterns.

## Common Function Patterns

### Validation Functions

**What**: Functions that check if data meets certain criteria.

**How**: Here's how to create validation functions:

```rust
fn main() {
    let age = 25;
    let name = "Alice";

    if is_valid_age(age) {
        println!("{} is {} years old", name, age);
    } else {
        println!("Invalid age");
    }
}

fn is_valid_age(age: u32) -> bool {
    age > 0 && age < 150  // Returns true if age is valid
}
```

**Explanation**:

- `is_valid_age` returns a boolean (`true` or `false`)
- The function checks if age is between 0 and 150
- `u32` ensures the age is a positive integer
- The result is used in an `if` statement

**Why**: Validation functions help ensure data integrity and prevent errors.

### Calculation Functions

**What**: Functions that perform mathematical calculations.

**How**: Here's how to create calculation functions:

```rust
fn main() {
    let radius = 5.0;
    let area = calculate_circle_area(radius);
    let circumference = calculate_circle_circumference(radius);

    println!("Radius: {}", radius);
    println!("Area: {:.2}", area);
    println!("Circumference: {:.2}", circumference);
}

fn calculate_circle_area(radius: f64) -> f64 {
    std::f64::consts::PI * radius * radius  // π × r²
}

fn calculate_circle_circumference(radius: f64) -> f64 {
    2.0 * std::f64::consts::PI * radius  // 2 × π × r
}
```

**Explanation**:

- `std::f64::consts::PI` provides the mathematical constant π
- Each function performs a specific calculation
- `{:.2}` formats the output to 2 decimal places
- The functions are reusable for any radius value

**Why**: Calculation functions encapsulate mathematical formulas and make them reusable.

### Utility Functions

**What**: Functions that perform common operations on data.

**How**: Here's how to create utility functions:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];
    let sum = calculate_sum(&numbers);
    let average = calculate_average(&numbers);

    println!("Numbers: {:?}", numbers);
    println!("Sum: {}", sum);
    println!("Average: {:.2}", average);
}

fn calculate_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()  // Sum all numbers in the slice
}

fn calculate_average(numbers: &[i32]) -> f64 {
    let sum: i32 = numbers.iter().sum();
    sum as f64 / numbers.len() as f64  // Convert to float and divide
}
```

**Explanation**:

- `&[i32]` is a slice reference (can work with arrays of any size)
- `numbers.iter().sum()` uses iterator methods to sum all elements
- `as f64` converts integer to float for division
- `numbers.len()` gets the number of elements

**Why**: Utility functions provide reusable operations that work with different data sizes.

## Function Composition

### Chaining Functions

**What**: Function composition means using the output of one function as input to another.

**How**: Here's how to chain functions together:

```rust
fn main() {
    let number = 5;
    let result = square(add_one(number));  // Chain: add_one then square
    println!("square(add_one({})) = {}", number, result);
}

fn add_one(x: i32) -> i32 {
    x + 1  // First operation: add 1
}

fn square(x: i32) -> i32 {
    x * x  // Second operation: square the result
}
```

**Explanation**:

- `add_one(5)` returns `6`
- `square(6)` returns `36`
- The functions are composed: `square(add_one(5))`
- This creates a pipeline of operations

**Why**: Function composition allows you to build complex operations from simple, reusable functions.

## Error Handling in Functions

### Functions that Can Fail

**What**: Some functions might fail, so Rust provides `Result` type for error handling.

**How**: Here's how to handle potential failures:

```rust
fn main() {
    let result = divide(10, 2);  // This will succeed
    match result {
        Ok(value) => println!("Result: {}", value),
        Err(error) => println!("Error: {}", error),
    }

    let result2 = divide(10, 0);  // This will fail
    match result2 {
        Ok(value) => println!("Result: {}", value),
        Err(error) => println!("Error: {}", error),
    }
}

fn divide(x: i32, y: i32) -> Result<i32, String> {
    if y == 0 {
        Err("Division by zero".to_string())  // Return error
    } else {
        Ok(x / y)  // Return success with value
    }
}
```

**Explanation**:

- `Result<i32, String>` means "either an integer or an error string"
- `Ok(value)` wraps the successful result
- `Err(error)` wraps the error message
- `match` handles both success and error cases

**Why**: Error handling prevents crashes and makes your programs more robust.

### Functions with Option

**What**: `Option` type handles cases where a function might not return a value.

**How**: Here's how to use `Option` for optional results:

```rust
fn main() {
    let result = find_element(&[1, 2, 3, 4, 5], 3);  // Find 3
    match result {
        Some(index) => println!("Found at index: {}", index),
        None => println!("Not found"),
    }
}

fn find_element(arr: &[i32], target: i32) -> Option<usize> {
    for (index, &element) in arr.iter().enumerate() {
        if element == target {
            return Some(index);  // Found it!
        }
    }
    None  // Not found
}
```

**Explanation**:

- `Option<usize>` means "either a position or nothing"
- `Some(index)` means "found at this position"
- `None` means "not found"
- The function searches through the array

**Why**: `Option` makes it clear when a function might not have a result, preventing null pointer errors.

## Practice Exercises

### Exercise 1: Basic Functions

**What**: Create simple mathematical functions.

**How**: Try implementing these functions:

```rust
fn main() {
    let result = add(5, 3);
    println!("5 + 3 = {}", result);

    let product = multiply(4, 6);
    println!("4 * 6 = {}", product);
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // Your implementation here
}

fn multiply(x: i32, y: i32) -> i32 {
    x * y  // Your implementation here
}
```

### Exercise 2: Temperature Conversion

**What**: Create functions to convert between Celsius and Fahrenheit.

**How**: Implement these conversion functions:

```rust
fn main() {
    let celsius = 25.0;
    let fahrenheit = celsius_to_fahrenheit(celsius);
    let celsius_back = fahrenheit_to_celsius(fahrenheit);

    println!("{}°C = {:.1}°F", celsius, fahrenheit);
    println!("{}°F = {:.1}°C", fahrenheit, celsius_back);
}

fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0  // Formula: C × 9/5 + 32
}

fn fahrenheit_to_celsius(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * 5.0 / 9.0  // Formula: (F - 32) × 5/9
}
```

### Exercise 3: String Functions

**What**: Create functions that work with text data.

**How**: Implement these string functions:

```rust
fn main() {
    let name = "Alice";
    let greeting = create_greeting(name);
    println!("{}", greeting);

    let count = count_vowels(name);
    println!("Vowels in '{}': {}", name, count);
}

fn create_greeting(name: &str) -> String {
    format!("Hello, {}!", name)  // Create a greeting string
}

fn count_vowels(text: &str) -> usize {
    text.chars().filter(|c| "aeiouAEIOU".contains(*c)).count()  // Count vowels
}
```

## Key Takeaways

**What** you've learned about Rust functions:

1. **Functions are defined with `fn`** - followed by name, parameters, and return type
2. **Parameters specify types** - Rust requires explicit type annotations for safety
3. **Return values are expressions** - no semicolon for the last expression
4. **Functions can return tuples** - for multiple values in a single return
5. **Documentation is important** - use `///` for function documentation
6. **No function overloading** - use descriptive names for different parameter types
7. **Error handling is built-in** - use `Result` and `Option` for robust functions
8. **Function composition** - chain functions to build complex operations

**Why** these concepts matter:

- **Type safety** prevents many common programming errors
- **Explicit error handling** makes programs more reliable
- **Clear naming** improves code readability and maintainability
- **Function composition** enables building complex systems from simple parts

## Next Steps

Now that you understand functions, you're ready to learn about:

- **Control flow structures** (if/else, loops) - making decisions and repeating actions
- **Pattern matching with match** - powerful conditional logic
- **Error handling patterns** - robust error management
- **Advanced function concepts** - closures, iterators, and more

**Where** to go next: Continue with the next lesson on "If Expressions" to learn about conditional logic in Rust!
