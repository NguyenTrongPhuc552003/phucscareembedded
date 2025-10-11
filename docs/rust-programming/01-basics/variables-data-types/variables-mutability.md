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

**What**: Examples of mutable and immutable variables.

**How**: Here's how to use mutable and immutable variables:

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

**Explanation**:

- `let pi = 3.14159;` creates an immutable variable `pi` with value 3.14159
- `let max_users = 1000;` creates another immutable variable `max_users` with value 1000
- `let mut current_user = 0;` creates a mutable variable `current_user` with value 0
- `let mut is_running = true;` creates another mutable variable `is_running` with value true
- `let user_name = "Alice";` creates an immutable variable `user_name` with value "Alice"
- `let user_age = 25;` creates another immutable variable `user_age` with value 25

**Why**: This demonstrates the difference between mutable and immutable variables, showing how to use each type appropriately.

## Variable Shadowing

### Basic Shadowing

**What**: Basic shadowing is when you create a new variable with the same name as an existing variable.

**How**: Here's how to use basic shadowing:

```rust
fn main() {
    let x = 5;
    let x = x + 1;        // Shadowing with same type
    let x = x * 2;        // Shadowing with same type
    println!("The value of x is: {}", x);
}
```

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `let x = x + 1;` creates a new variable `x` that shadows the old one
- `let x = x * 2;` creates another new variable `x` that shadows the old one
- The old `x` is no longer accessible, but the new `x` has the value 12

**Why**: This demonstrates basic shadowing, which is a powerful feature for creating new variables with the same name.

### Shadowing with Different Types

**What**: Shadowing with different types is when you create a new variable with the same name as an existing variable, but with a different type.

**How**: Here's how to use shadowing with different types:

```rust
fn main() {
    let spaces = "   ";           // String type
    let spaces = spaces.len();    // Number type (usize)
    println!("Number of spaces: {}", spaces);
}
```

**Explanation**:

- `let spaces = "   ";` creates an immutable variable `spaces` with value "   "
- `let spaces = spaces.len();` creates a new variable `spaces` that shadows the old one with the length of the string
- The old `spaces` is no longer accessible, but the new `spaces` has the value 3

**Why**: This demonstrates shadowing with different types, which is a powerful feature for creating new variables with the same name.

### Shadowing vs Mutation

**What**: Shadowing vs mutation is when you create a new variable with the same name as an existing variable, but with a different value.

**How**: Here's how to use shadowing vs mutation:

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

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `let x = x + 1;` creates a new variable `x` that shadows the old one
- `let x = x * 2;` creates another new variable `x` that shadows the old one
- The old `x` is no longer accessible, but the new `x` has the value 12

**Why**: This demonstrates shadowing vs mutation, which is a powerful feature for creating new variables with the same name.

## Constants

### Defining Constants

**What**: Defining constants is when you create a constant variable with the `const` keyword.

**How**: Here's how to define constants:

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

**Explanation**:

- `const MAX_POINTS: u32 = 100_000;` creates a constant variable `MAX_POINTS` with value 100_000
- `const PI: f64 = 3.14159;` creates another constant variable `PI` with value 3.14159
- `const COMPANY_NAME: &str = "Rust Corp";` creates another constant variable `COMPANY_NAME` with value "Rust Corp"

**Why**: This demonstrates defining constants, which is a powerful feature for creating constants with the `const` keyword.

### Constants vs Variables

**What**: Constants vs variables is when you create a constant variable with the `const` keyword and a variable with the `let` keyword.

**How**: Here's how to use constants vs variables:

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

**Explanation**:

- `const MAX_USERS: u32 = 1000;` creates a constant variable `MAX_USERS` with value 1000
- `let current_users = 50;` creates a variable `current_users` with value 50

**Why**: This demonstrates constants vs variables, which is a powerful feature for creating constants and variables with the `const` and `let` keywords.

## Variable Scope

### Understanding Scope

**What**: Understanding scope is when you understand how variables are accessible in your program.

**How**: Here's how to understand scope:

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

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `{` creates a new scope
- `let y = 10;` creates a new variable `y` with value 10
- `println!("x: {}, y: {}", x, y);` prints the value of `x` and `y`
- `}` closes the scope
- `println!("x: {}", x);` prints the value of `x`

**Why**: This demonstrates understanding scope, which is a powerful feature for creating new variables with the same name.

### Scope and Shadowing

**What**: Scope and shadowing is when you create a new variable with the same name as an existing variable.

**How**: Here's how to use scope and shadowing:

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

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `println!("x before inner scope: {}", x);` prints the value of `x`
- `{` creates a new scope
- `let x = 10;` creates a new variable `x` that shadows the old one
- `println!("x in inner scope: {}", x);` prints the value of `x`
- `}` closes the scope
- `println!("x after inner scope: {}", x);` prints the value of `x`

**Why**: This demonstrates scope and shadowing, which is a powerful feature for creating new variables with the same name.

## Variable Patterns

### Destructuring

**What**: Destructuring is when you create a new variable with the same name as an existing variable.

**How**: Here's how to use destructuring:

```rust
fn main() {
    let (x, y, z) = (1, 2, 3);
    println!("x: {}, y: {}, z: {}", x, y, z);

    let (name, age) = ("Alice", 25);
    println!("Name: {}, Age: {}", name, age);
}
```

**Explanation**:

- `let (x, y, z) = (1, 2, 3);` creates a tuple variable `(x, y, z)` with value (1, 2, 3)
- `println!("x: {}, y: {}, z: {}", x, y, z);` prints the value of `x`, `y`, and `z`
- `let (name, age) = ("Alice", 25);` creates a tuple variable `(name, age)` with value ("Alice", 25)
- `println!("Name: {}, Age: {}", name, age);` prints the value of `name` and `age`

**Why**: This demonstrates destructuring, which is a powerful feature for creating new variables with the same name.

### Ignoring Values

**What**: Ignoring values is when you create a new variable with the same name as an existing variable, but with a different value.

**How**: Here's how to use ignoring values:

```rust
fn main() {
    let (x, _, z) = (1, 2, 3);  // Ignore the middle value
    println!("x: {}, z: {}", x, z);

    let (_, age) = ("Bob", 30); // Ignore the name
    println!("Age: {}", age);
}
```

**Explanation**:

- `let (x, _, z) = (1, 2, 3);` creates a tuple variable `(x, _, z)` with value (1, 2, 3)
- `println!("x: {}, z: {}", x, z);` prints the value of `x` and `z`
- `let (_, age) = ("Bob", 30);` creates a tuple variable `(_, age)` with value ("Bob", 30)
- `println!("Age: {}", age);` prints the value of `age`

**Why**: This demonstrates ignoring values, which is a powerful feature for creating new variables with the same name.

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
