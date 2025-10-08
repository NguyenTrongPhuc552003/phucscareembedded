---
sidebar_position: 1
---

# Variables and Mutability

Master variable declaration, mutability, and shadowing in Rust with comprehensive explanations using the 4W+H framework.

## What Are Variables in Rust?

**What**: Variables in Rust are named storage locations that hold values. Unlike many other languages, Rust variables are immutable by default, meaning their values cannot be changed after initialization.

**Why**: Variables are essential because:

- **Data storage** allows you to store and retrieve values in your programs
- **Memory management** provides controlled access to memory locations
- **Code organization** makes your code readable and maintainable
- **Type safety** ensures values are used correctly throughout your program
- **Performance** enables efficient memory usage and optimization

**When**: Use variables when:

- Storing data that your program needs to access
- Creating temporary storage for calculations
- Managing state in your application
- Passing data between functions
- Building complex data structures

**How**: Variables work in Rust by:

- **Declaration** using the `let` keyword to create new variables
- **Initialization** assigning values when variables are created
- **Immutability** preventing accidental changes to variable values
- **Mutability** allowing changes when explicitly declared with `mut`
- **Scope management** controlling when variables are accessible

**Where**: Variables are used throughout Rust programs, from simple scripts to complex applications, providing the foundation for data manipulation and program logic.

## Variable Declaration

**What**: Variable declaration is the process of creating named storage locations for values in your Rust program.

**Why**: Understanding variable declaration is crucial because:

- **Memory allocation** creates space for your data
- **Type safety** ensures values are used correctly
- **Code clarity** makes your intentions explicit
- **Performance** enables efficient memory usage
- **Error prevention** catches type mismatches at compile time

**When**: Declare variables when:

- You need to store data for later use
- Creating temporary storage for calculations
- Managing application state
- Passing data between functions
- Building complex data structures

### Basic Variable Declaration

**What**: The fundamental way to create variables in Rust using the `let` keyword.

**How**: Here's how to declare variables in Rust:

```rust
fn main() {
    // Immutable variable (default)
    let x = 5;
    println!("The value of x is: {}", x);

    // Mutable variable
    let mut y = 10;
    println!("The value of y is: {}", y);
    y = 15;
    println!("The value of y is: {}", y);
}
```

**Explanation**:

- `let x = 5;` creates an immutable variable named `x` with value 5
- `let mut y = 10;` creates a mutable variable named `y` with value 10
- `y = 15;` changes the value of the mutable variable `y` to 15
- Immutable variables cannot be changed after initialization
- Mutable variables can be modified using the `mut` keyword
- The `println!` macro displays the current values of the variables

**Why**: This demonstrates the fundamental difference between immutable and mutable variables in Rust, showing how Rust's default immutability prevents accidental changes while allowing explicit mutability when needed.

### Understanding Immutability

**What**: Immutability in Rust means that once a variable is assigned a value, it cannot be changed. This is Rust's default behavior and helps prevent many common programming errors.

**Why**: Immutability is valuable because:

- **Error prevention** stops accidental changes to variable values
- **Code clarity** makes it clear which values can change
- **Concurrency safety** prevents data races in multi-threaded programs
- **Debugging** makes it easier to track down issues
- **Performance** enables compiler optimizations

**How**: Here's how immutability works in Rust:

```rust
fn main() {
    let x = 5;
    // x = 6; // This would cause a compile error!
    println!("x is immutable: {}", x);

    // But you can create a new variable with the same name
    let x = x + 1; // This is shadowing, not mutation
    println!("x is now: {}", x);
}
```

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `x = 6;` would cause a compile error because `x` is immutable
- `let x = x + 1;` creates a new variable `x` that shadows the old one
- This is called "shadowing" - creating a new variable with the same name
- The old `x` is no longer accessible, but the new `x` has the value 6
- Shadowing is different from mutation - it creates a new variable

**Why**: This demonstrates Rust's default immutability and introduces the concept of shadowing, which is a powerful feature for creating new variables with the same name.

## Mutability

**What**: Mutability in Rust allows you to change the value of a variable after it's been created. This is controlled by the `mut` keyword and is not the default behavior.

**Why**: Mutability is important because:

- **State management** allows you to track changing values in your program
- **Loop counters** enable you to increment and decrement values
- **User input** allows you to update values based on user actions
- **Algorithm implementation** enables you to modify data during processing
- **Performance** can be more efficient than creating new variables

**When**: Use mutable variables when:

- You need to change a value after initialization
- Implementing counters or accumulators
- Processing user input that changes over time
- Implementing algorithms that modify data
- Managing application state that changes

### When to Use Mutable Variables

**What**: Guidelines for when to use the `mut` keyword to create mutable variables.

**How**: Here's when and how to use mutable variables:

```rust
fn main() {
    // Use mut when you need to change the value
    let mut counter = 0;
    counter += 1;
    counter += 1;
    println!("Counter: {}", counter);

    // Use immutable when the value won't change
    let max_attempts = 3;
    println!("Max attempts: {}", max_attempts);
}
```

**Explanation**:

- `let mut counter = 0;` creates a mutable variable for counting
- `counter += 1;` increments the counter (requires `mut`)
- `let max_attempts = 3;` creates an immutable variable for a constant value
- Use `mut` when you need to change the value after initialization
- Use immutable variables for values that don't change
- This demonstrates the principle of using mutability only when necessary

**Why**: This shows the practical difference between mutable and immutable variables, helping you understand when to use each type.

### Mutable vs Immutable Examples

```rust
fn main() {
    // Immutable - good for constants
    let pi = 3.14159;
    let max_users = 1000;

    // Mutable - good for changing values
    let mut current_user = 0;
    let mut is_running = true;

    // You can still use immutable for values that don't change
    let user_name = "Alice";
    let user_age = 25;

    println!("Pi: {}", pi);
    println!("Current user: {}", current_user);
    println!("User: {}, Age: {}", user_name, user_age);
}
```

## Variable Shadowing

### Basic Shadowing

```rust
fn main() {
    let x = 5;
    let x = x + 1;        // Shadowing with same type
    let x = x * 2;        // Shadowing with same type
    println!("The value of x is: {}", x);
}
```

### Shadowing with Different Types

```rust
fn main() {
    let spaces = "   ";           // String type
    let spaces = spaces.len();    // Number type (usize)
    println!("Number of spaces: {}", spaces);
}
```

### Shadowing vs Mutation

```rust
fn main() {
    // Shadowing - creates new variable
    let x = 5;
    let x = x + 1;        // New variable, old one is shadowed
    let x = x * 2;        // Another new variable
    println!("x = {}", x);

    // Mutation - changes existing variable
    let mut y = 5;
    y = y + 1;            // Changes the same variable
    y = y * 2;           // Changes the same variable
    println!("y = {}", y);
}
```

## Constants

### Defining Constants

```rust
const MAX_POINTS: u32 = 100_000;
const PI: f64 = 3.14159;
const COMPANY_NAME: &str = "Rust Corp";

fn main() {
    println!("Max points: {}", MAX_POINTS);
    println!("Pi: {}", PI);
    println!("Company: {}", COMPANY_NAME);
}
```

### Constants vs Variables

```rust
const MAX_USERS: u32 = 1000;        // Constant
let current_users = 50;             // Variable

fn main() {
    // Constants must be known at compile time
    println!("Max users: {}", MAX_USERS);

    // Variables can be computed at runtime
    let mut active_users = current_users;
    active_users += 10;
    println!("Active users: {}", active_users);
}
```

## Variable Scope

### Understanding Scope

```rust
fn main() {
    let x = 5;              // x is in scope here

    {
        let y = 10;         // y is in scope here
        println!("x: {}, y: {}", x, y);
    }                       // y goes out of scope here

    // println!("y: {}", y); // This would cause an error!
    println!("x: {}", x);   // x is still in scope
}
```

### Scope and Shadowing

```rust
fn main() {
    let x = 5;
    println!("x before inner scope: {}", x);

    {
        let x = 10;         // This shadows the outer x
        println!("x in inner scope: {}", x);
    }                       // Inner x goes out of scope

    println!("x after inner scope: {}", x); // Outer x is still 5
}
```

## Variable Patterns

### Destructuring

```rust
fn main() {
    let (x, y, z) = (1, 2, 3);
    println!("x: {}, y: {}, z: {}", x, y, z);

    let (name, age) = ("Alice", 25);
    println!("Name: {}, Age: {}", name, age);
}
```

### Ignoring Values

```rust
fn main() {
    let (x, _, z) = (1, 2, 3);  // Ignore the middle value
    println!("x: {}, z: {}", x, z);

    let (_, age) = ("Bob", 30); // Ignore the name
    println!("Age: {}", age);
}
```

## Best Practices

### Naming Conventions

```rust
fn main() {
    // Use snake_case for variables
    let user_name = "Alice";
    let max_retry_count = 3;
    let is_authenticated = true;

    // Use UPPER_CASE for constants
    const MAX_CONNECTIONS: u32 = 100;
    const API_VERSION: &str = "v1";

    // Use descriptive names
    let number_of_failed_attempts = 0;
    let should_retry_connection = true;
}
```

### When to Use Each Type

```rust
fn main() {
    // Use const for values that never change
    const PI: f64 = 3.14159;
    const MAX_SIZE: usize = 1024;

    // Use let for values that don't change after initialization
    let user_id = 12345;
    let file_path = "/home/user/document.txt";

    // Use let mut for values that change
    let mut counter = 0;
    let mut current_user = None;
    let mut is_connected = false;
}
```

## Common Patterns

### Counter Pattern

```rust
fn main() {
    let mut count = 0;

    // Increment counter
    count += 1;
    count += 1;
    count += 1;

    println!("Count: {}", count);
}
```

### State Pattern

```rust
fn main() {
    let mut state = "idle";
    println!("Initial state: {}", state);

    state = "running";
    println!("Current state: {}", state);

    state = "stopped";
    println!("Final state: {}", state);
}
```

### Accumulator Pattern

```rust
fn main() {
    let mut sum = 0;
    let numbers = [1, 2, 3, 4, 5];

    for num in numbers.iter() {
        sum += num;
    }

    println!("Sum: {}", sum);
}
```

## Error Handling

### Common Variable Errors

```rust
fn main() {
    // Error: trying to mutate immutable variable
    // let x = 5;
    // x = 6; // This won't compile!

    // Solution: use mut
    let mut x = 5;
    x = 6;
    println!("x: {}", x);

    // Error: variable not in scope
    // {
    //     let y = 10;
    // }
    // println!("y: {}", y); // This won't compile!

    // Solution: declare in correct scope
    let y = 10;
    println!("y: {}", y);
}
```

### Shadowing vs Mutation Errors

```rust
fn main() {
    let x = 5;
    let x = x + 1;        // This is shadowing, not mutation
    println!("x: {}", x);

    // If you want to mutate, use mut
    let mut y = 5;
    y = y + 1;            // This is mutation
    println!("y: {}", y);
}
```

## Practice Exercises

### Exercise 1: Variable Declaration

```rust
fn main() {
    // Declare immutable variables
    let name = "Alice";
    let age = 25;
    let height = 5.6;

    // Declare mutable variables
    let mut score = 0;
    let mut attempts = 0;

    // Print all variables
    println!("Name: {}", name);
    println!("Age: {}", age);
    println!("Height: {}", height);
    println!("Score: {}", score);
    println!("Attempts: {}", attempts);
}
```

### Exercise 2: Shadowing Practice

```rust
fn main() {
    let x = 5;
    println!("x = {}", x);

    let x = x + 1;
    println!("x = {}", x);

    let x = x * 2;
    println!("x = {}", x);

    {
        let x = x - 3;
        println!("x in inner scope = {}", x);
    }

    println!("x in outer scope = {}", x);
}
```

### Exercise 3: Constants and Variables

```rust
const MAX_ATTEMPTS: u32 = 3;
const PI: f64 = 3.14159;

fn main() {
    let mut current_attempt = 0;
    let user_name = "Bob";

    println!("Max attempts: {}", MAX_ATTEMPTS);
    println!("Pi: {}", PI);
    println!("User: {}", user_name);
    println!("Current attempt: {}", current_attempt);

    current_attempt += 1;
    println!("Current attempt: {}", current_attempt);
}
```

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Variable Declaration Mastery** - You understand how to create variables using `let` and `let mut`
2. **Immutability Understanding** - You know that Rust variables are immutable by default
3. **Mutability Control** - You can use `mut` to create variables that can be changed
4. **Shadowing Knowledge** - You understand how shadowing creates new variables with the same name
5. **Scope Awareness** - You know how variable scope affects accessibility
6. **Constant Usage** - You can create compile-time constants with `const`
7. **Best Practices** - You understand naming conventions and when to use each type

**Why** these concepts matter:

- **Immutability by default** prevents many common programming errors
- **Explicit mutability** makes it clear when values can change
- **Shadowing** provides flexibility for creating new variables with the same name
- **Scope management** ensures proper memory usage and prevents conflicts
- **Constants** enable compile-time optimization and clear intent
- **Naming conventions** make code readable and maintainable

**When** to use these concepts:

- **Creating variables** - Use `let` for immutable, `let mut` for mutable
- **Managing state** - Use mutable variables for changing application state
- **Creating constants** - Use `const` for values that never change
- **Variable reuse** - Use shadowing when you need a new variable with the same name
- **Scope control** - Declare variables in the appropriate scope for their usage

**Where** these skills apply:

- **Personal projects** - Creating and managing variables in your own Rust applications
- **Team development** - Working with others on shared Rust codebases
- **Open source contribution** - Understanding and contributing to Rust projects
- **Professional development** - Using Rust effectively in production environments
- **Learning progression** - Building on this foundation for advanced Rust concepts

## Next Steps

**What** you're ready for next:

After mastering variables and mutability, you should be comfortable with:

- **Variable declaration** - Creating immutable and mutable variables
- **Immutability concepts** - Understanding Rust's default immutability
- **Mutability control** - Using `mut` when you need to change values
- **Shadowing** - Creating new variables with the same name
- **Scope management** - Understanding variable lifetime and accessibility
- **Constants** - Creating compile-time constants
- **Best practices** - Following Rust naming conventions and patterns

**Where** to go next:

Continue with the next lesson on **"Scalar Types"** to learn:

- How to work with integers, floating-point numbers, booleans, and characters
- Understanding Rust's type system and type inference
- Using different numeric types for different purposes
- Working with boolean logic and character data
- Understanding type safety and compiler checks

**Why** the next lesson is important:

The next lesson builds directly on your variable knowledge by showing you how to work with different data types in Rust. You'll learn about Rust's powerful type system and how to use various scalar types effectively.

**How** to continue learning:

1. **Practice variable concepts** - Create your own examples with different variable types
2. **Experiment with shadowing** - Try creating variables with the same name
3. **Understand scope** - Practice with variables in different scopes
4. **Read the documentation** - Explore the resources provided
5. **Join the community** - Engage with other Rust learners and developers

## Resources

**Official Documentation**:

- [The Rust Book - Variables and Mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html) - Comprehensive variable guide
- [Rust by Example - Variables](https://doc.rust-lang.org/rust-by-example/variable_bindings.html) - Learn by example
- [Rust Reference - Variables](https://doc.rust-lang.org/reference/variables.html) - Technical reference

**Community Resources**:

- [Rust Community](https://www.rust-lang.org/community) - Official community page
- [Rust Users Forum](https://users.rust-lang.org/) - Community discussions and help
- [Reddit r/rust](https://reddit.com/r/rust) - Active Rust community on Reddit
- [Rust Discord](https://discord.gg/rust-lang) - Real-time chat with Rust community

**Learning Resources**:

- [Rustlings](https://github.com/rust-lang/rustlings) - Interactive Rust exercises
- [Exercism Rust Track](https://exercism.org/tracks/rust) - Practice problems
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/) - Common programming tasks

Happy coding! 🦀
