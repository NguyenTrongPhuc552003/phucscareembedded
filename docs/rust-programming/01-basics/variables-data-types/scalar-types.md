---
sidebar_position: 2
---

# Scalar Types

Master Rust's scalar data types with comprehensive explanations using the 4W+H framework.

## What Are Scalar Types in Rust?

**What**: Scalar types in Rust are primitive data types that represent single values. They include integers, floating-point numbers, booleans, and characters. These are the building blocks of all data in Rust programs.

**Why**: Scalar types are fundamental because:

- **Data representation** allows you to store and manipulate basic values
- **Type safety** ensures values are used correctly throughout your program
- **Performance** provides efficient memory usage and fast operations
- **Memory management** gives you control over how data is stored
- **Interoperability** enables communication with other systems and languages

**When**: Use scalar types when:

- Storing numeric values (integers, decimals)
- Representing true/false logic (booleans)
- Working with single characters or text
- Performing mathematical calculations
- Creating simple data structures
- Implementing algorithms and logic

**How**: Scalar types work in Rust by:

- **Type declaration** specifying the exact type of data you want to store
- **Value assignment** storing specific values in variables
- **Type inference** automatically determining types when possible
- **Type checking** ensuring operations are performed on compatible types
- **Memory allocation** efficiently storing values in memory

**Where**: Scalar types are used throughout Rust programs, from simple calculations to complex algorithms, providing the foundation for all data manipulation.

## Integer Types

**What**: Integer types in Rust represent whole numbers (positive, negative, and zero) with different sizes and ranges.

**Why**: Understanding integer types is crucial because:

- **Memory efficiency** allows you to choose the right size for your data
- **Range control** prevents overflow and underflow errors
- **Performance** enables fast arithmetic operations
- **Type safety** ensures operations are performed on compatible types
- **Platform compatibility** handles different system architectures

**When**: Use integer types when:

- Counting items or tracking quantities
- Performing mathematical calculations
- Working with array indices
- Storing user IDs or other numeric identifiers
- Implementing algorithms that require whole numbers

### Signed Integers

**What**: Signed integers can represent both positive and negative numbers, including zero.

**How**: Here's how to work with signed integers in Rust:

```rust
fn main() {
    let a: i8 = 127;        // 8-bit signed integer (-128 to 127)
    let b: i16 = 32767;     // 16-bit signed integer
    let c: i32 = 2147483647; // 32-bit signed integer (default)
    let d: i64 = 9223372036854775807; // 64-bit signed integer
    let e: i128 = 170141183460469231731687303715884105727; // 128-bit signed integer
    let f: isize = 100;     // Architecture-dependent size

    println!("i8: {}", a);
    println!("i16: {}", b);
    println!("i32: {}", c);
    println!("i64: {}", d);
    println!("i128: {}", e);
    println!("isize: {}", f);
}
```

**Explanation**:

- `i8` stores 8-bit signed integers from -128 to 127
- `i16` stores 16-bit signed integers from -32,768 to 32,767
- `i32` stores 32-bit signed integers (default for most operations)
- `i64` stores 64-bit signed integers for larger numbers
- `i128` stores 128-bit signed integers for very large numbers
- `isize` size depends on your system architecture (32-bit or 64-bit)
- Each type has a specific range of values it can represent
- The `i` prefix indicates "integer" and the number indicates the bit size

**Why**: Signed integers are essential for representing values that can be negative, such as temperatures, coordinates, or differences between values.

### Unsigned Integers

**What**: Unsigned integers can only represent positive numbers and zero (no negative values).

**How**: Here's how to work with unsigned integers in Rust:

```rust
fn main() {
    let a: u8 = 255;        // 8-bit unsigned integer (0 to 255)
    let b: u16 = 65535;     // 16-bit unsigned integer
    let c: u32 = 4294967295; // 32-bit unsigned integer
    let d: u64 = 18446744073709551615; // 64-bit unsigned integer
    let e: u128 = 340282366920938463463374607431768211455; // 128-bit unsigned integer
    let f: usize = 100;     // Architecture-dependent size

    println!("u8: {}", a);
    println!("u16: {}", b);
    println!("u32: {}", c);
    println!("u64: {}", d);
    println!("u128: {}", e);
    println!("usize: {}", f);
}
```

**Explanation**:

- `u8` stores 8-bit unsigned integers from 0 to 255
- `u16` stores 16-bit unsigned integers from 0 to 65,535
- `u32` stores 32-bit unsigned integers from 0 to 4,294,967,295
- `u64` stores 64-bit unsigned integers for very large positive numbers
- `u128` stores 128-bit unsigned integers for extremely large numbers
- `usize` size depends on your system architecture (32-bit or 64-bit)
- The `u` prefix indicates "unsigned" and the number indicates the bit size
- Unsigned integers can represent twice as many positive values as signed integers of the same size

**Why**: Unsigned integers are perfect for representing quantities that can never be negative, such as counts, sizes, or indices.

### Integer Literals

```rust
fn main() {
    let decimal = 98_222;           // Decimal
    let hex = 0xff;                 // Hexadecimal
    let octal = 0o77;               // Octal
    let binary = 0b1111_0000;       // Binary
    let byte = b'A';                // Byte (u8 only)

    println!("Decimal: {}", decimal);
    println!("Hex: {}", hex);
    println!("Octal: {}", octal);
    println!("Binary: {}", binary);
    println!("Byte: {}", byte);
}
```

### Integer Overflow

```rust
fn main() {
    // This will panic in debug mode
    // let x: u8 = 256; // Error: literal out of range

    // Safe way to handle overflow
    let x: u8 = 255;
    let y: u8 = 1;

    // Checked arithmetic
    match x.checked_add(y) {
        Some(result) => println!("Result: {}", result),
        None => println!("Overflow occurred!"),
    }

    // Wrapping arithmetic
    let result = x.wrapping_add(y);
    println!("Wrapping result: {}", result);
}
```

## Floating-Point Types

### Basic Floating-Point

```rust
fn main() {
    let x = 2.0;           // f64 (default)
    let y: f32 = 3.0;       // f32
    let z: f64 = 4.0;       // f64

    println!("f32: {}", y);
    println!("f64: {}", x);
    println!("f64: {}", z);
}
```

### Floating-Point Operations

```rust
fn main() {
    let x = 2.5;
    let y = 1.5;

    println!("Addition: {}", x + y);
    println!("Subtraction: {}", x - y);
    println!("Multiplication: {}", x * y);
    println!("Division: {}", x / y);
    println!("Remainder: {}", x % y);

    // Special values
    let inf = f64::INFINITY;
    let neg_inf = f64::NEG_INFINITY;
    let nan = f64::NAN;

    println!("Infinity: {}", inf);
    println!("Negative infinity: {}", neg_inf);
    println!("NaN: {}", nan);
}
```

### Floating-Point Precision

```rust
fn main() {
    let x = 0.1;
    let y = 0.2;
    let z = x + y;

    println!("0.1 + 0.2 = {}", z);
    println!("Expected: 0.3");

    // Check if values are approximately equal
    let epsilon = 1e-10;
    let is_equal = (z - 0.3).abs() < epsilon;
    println!("Are they equal? {}", is_equal);
}
```

## Boolean Type

### Basic Boolean Operations

```rust
fn main() {
    let t = true;
    let f: bool = false;

    println!("True: {}", t);
    println!("False: {}", f);

    // Boolean operations
    println!("t && f = {}", t && f);
    println!("t || f = {}", t || f);
    println!("!t = {}", !t);
    println!("!f = {}", !f);
}
```

### Boolean in Conditions

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("number is divisible by 4");
    } else if number % 3 == 0 {
        println!("number is divisible by 3");
    } else if number % 2 == 0 {
        println!("number is divisible by 2");
    } else {
        println!("number is not divisible by 4, 3, or 2");
    }

    // Boolean expressions
    let is_even = number % 2 == 0;
    let is_positive = number > 0;

    println!("Is even: {}", is_even);
    println!("Is positive: {}", is_positive);
}
```

## Character Type

### Basic Characters

```rust
fn main() {
    let c = 'z';
    let z = 'ℤ';
    let heart_eyed_cat = '😻';

    println!("c: {}", c);
    println!("z: {}", z);
    println!("heart_eyed_cat: {}", heart_eyed_cat);
}
```

### Character Operations

```rust
fn main() {
    let c = 'A';

    // Check if character is alphabetic
    println!("Is alphabetic: {}", c.is_alphabetic());

    // Check if character is numeric
    println!("Is numeric: {}", c.is_numeric());

    // Check if character is uppercase
    println!("Is uppercase: {}", c.is_uppercase());

    // Convert to lowercase
    let lower = c.to_lowercase().next().unwrap();
    println!("Lowercase: {}", lower);

    // Unicode operations
    let unicode_value = c as u32;
    println!("Unicode value: {}", unicode_value);
}
```

### Unicode Support

```rust
fn main() {
    // ASCII characters
    let ascii_char = 'A';
    println!("ASCII: {}", ascii_char);

    // Unicode characters
    let unicode_char = '中';
    println!("Unicode: {}", unicode_char);

    // Emoji
    let emoji = '🚀';
    println!("Emoji: {}", emoji);

    // Mathematical symbols
    let math_symbol = '∑';
    println!("Math symbol: {}", math_symbol);
}
```

## Type Inference

### Automatic Type Inference

```rust
fn main() {
    // Rust infers the type
    let x = 5;              // i32
    let y = 3.14;           // f64
    let z = true;           // bool
    let c = 'a';            // char

    println!("x: {}, type: i32", x);
    println!("y: {}, type: f64", y);
    println!("z: {}, type: bool", z);
    println!("c: {}, type: char", c);
}
```

### Explicit Type Annotations

```rust
fn main() {
    // Explicit type annotations
    let x: i32 = 5;
    let y: f64 = 3.14;
    let z: bool = true;
    let c: char = 'a';

    // Different integer types
    let a: u8 = 255;
    let b: i16 = -32768;
    let c: u32 = 4294967295;

    println!("x: {}", x);
    println!("y: {}", y);
    println!("z: {}", z);
    println!("c: {}", c);
    println!("a: {}", a);
    println!("b: {}", b);
    println!("c: {}", c);
}
```

## Type Conversions

### Implicit Conversions

```rust
fn main() {
    let x = 5;              // i32
    let y = 3.14;           // f64

    // No implicit conversions in Rust!
    // let z = x + y;        // This won't compile!

    // Explicit conversions
    let z = x as f64 + y;   // Convert i32 to f64
    println!("z: {}", z);
}
```

### Explicit Conversions

```rust
fn main() {
    let x = 5i32;
    let y = 3.14f64;

    // Convert between numeric types
    let a = x as f64;        // i32 to f64
    let b = y as i32;        // f64 to i32 (truncates)
    let c = x as u8;         // i32 to u8

    println!("x: {}", x);
    println!("y: {}", y);
    println!("a: {}", a);
    println!("b: {}", b);
    println!("c: {}", c);
}
```

### Safe Conversions

```rust
fn main() {
    let x = 300i32;

    // Safe conversion using TryFrom
    match x.try_into::<u8>() {
        Ok(value) => println!("Converted: {}", value),
        Err(_) => println!("Conversion failed: value too large"),
    }

    // Safe conversion using From/Into
    let y: f64 = x.into();  // i32 to f64
    println!("y: {}", y);
}
```

## Common Patterns

### Number Formatting

```rust
fn main() {
    let number = 1234567;

    // Format with separators
    println!("Formatted: {:,}", number);

    // Format with different bases
    println!("Binary: {:b}", number);
    println!("Hex: {:x}", number);
    println!("Octal: {:o}", number);

    // Format with padding
    println!("Padded: {:010}", number);
}
```

### Range Operations

```rust
fn main() {
    // Integer ranges
    for i in 1..=5 {
        println!("i: {}", i);
    }

    // Character ranges
    for c in 'a'..='e' {
        println!("c: {}", c);
    }

    // Float ranges (using step_by)
    for i in (0..10).step_by(2) {
        println!("i: {}", i);
    }
}
```

## Practice Exercises

### Exercise 1: Integer Operations

```rust
fn main() {
    let a: i32 = 10;
    let b: i32 = 3;

    println!("a + b = {}", a + b);
    println!("a - b = {}", a - b);
    println!("a * b = {}", a * b);
    println!("a / b = {}", a / b);
    println!("a % b = {}", a % b);
}
```

### Exercise 2: Floating-Point Math

```rust
fn main() {
    let radius = 5.0;
    let pi = std::f64::consts::PI;

    let area = pi * radius * radius;
    let circumference = 2.0 * pi * radius;

    println!("Radius: {}", radius);
    println!("Area: {:.2}", area);
    println!("Circumference: {:.2}", circumference);
}
```

### Exercise 3: Character Analysis

```rust
fn main() {
    let chars = ['A', 'a', '1', '中', '🚀'];

    for c in chars.iter() {
        println!("Character: {}", c);
        println!("  Is alphabetic: {}", c.is_alphabetic());
        println!("  Is numeric: {}", c.is_numeric());
        println!("  Is uppercase: {}", c.is_uppercase());
        println!("  Unicode value: {}", *c as u32);
        println!();
    }
}
```

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Integer Type Mastery** - You understand signed and unsigned integers with different sizes
2. **Floating-Point Knowledge** - You can work with f32 and f64 for decimal numbers
3. **Boolean Logic** - You understand how to use true/false values in conditions
4. **Character Handling** - You can work with Unicode characters and text
5. **Type Inference** - You understand how Rust automatically determines types
6. **Type Conversions** - You can safely convert between different numeric types
7. **Memory Efficiency** - You know how to choose appropriate types for your data

**Why** these concepts matter:

- **Type safety** prevents many common programming errors
- **Memory efficiency** allows you to optimize your programs
- **Performance** enables fast arithmetic operations
- **Unicode support** enables international text handling
- **Explicit conversions** make code more predictable and safer
- **Type inference** reduces boilerplate while maintaining safety

**When** to use these concepts:

- **Integer types** - Use for counting, indexing, and whole number calculations
- **Floating-point types** - Use for decimal numbers and scientific calculations
- **Boolean types** - Use for conditions, flags, and logical operations
- **Character types** - Use for single characters, text processing, and Unicode
- **Type conversions** - Use when you need to convert between different numeric types
- **Type annotations** - Use when you need to be explicit about types

**Where** these skills apply:

- **Personal projects** - Creating and managing data in your own Rust applications
- **Team development** - Working with others on shared Rust codebases
- **Open source contribution** - Understanding and contributing to Rust projects
- **Professional development** - Using Rust effectively in production environments
- **Learning progression** - Building on this foundation for advanced Rust concepts

## Next Steps

**What** you're ready for next:

After mastering scalar types, you should be comfortable with:

- **Integer operations** - Working with different integer types and ranges
- **Floating-point math** - Performing decimal calculations and handling precision
- **Boolean logic** - Using true/false values in conditions and expressions
- **Character processing** - Working with Unicode characters and text
- **Type conversions** - Safely converting between different numeric types
- **Type inference** - Understanding when Rust can determine types automatically

**Where** to go next:

Continue with the next lesson on **"Compound Types"** to learn:

- How to work with tuples and arrays in Rust
- Understanding Rust's compound data structures
- Using collections to store multiple values
- Working with structured data and sequences
- Understanding memory layout and performance implications

**Why** the next lesson is important:

The next lesson builds directly on your scalar type knowledge by showing you how to combine multiple values into structured data. You'll learn about Rust's compound types and how to work with collections of data.

**How** to continue learning:

1. **Practice scalar types** - Create your own examples with different numeric types
2. **Experiment with conversions** - Try converting between different types
3. **Work with characters** - Practice Unicode and text processing
4. **Read the documentation** - Explore the resources provided
5. **Join the community** - Engage with other Rust learners and developers

## Resources

**Official Documentation**:

- [The Rust Book - Data Types](https://doc.rust-lang.org/book/ch03-02-data-types.html) - Comprehensive data types guide
- [Rust by Example - Primitives](https://doc.rust-lang.org/rust-by-example/primitives.html) - Learn by example
- [Rust Reference - Types](https://doc.rust-lang.org/reference/types.html) - Technical reference

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
