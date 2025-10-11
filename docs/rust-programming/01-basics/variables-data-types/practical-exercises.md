---
sidebar_position: 5
---

# Practical Exercises - Variables and Data Types

Master your Rust programming skills with comprehensive hands-on exercises using the 4W+H framework.

## Exercise 1: Variable Declaration and Mutability

**What**: This exercise practices creating and using both immutable and mutable variables in Rust.

**Why**: Understanding variable declaration and mutability is crucial because:

- **Foundation building** establishes the basic concepts of Rust programming
- **Type understanding** helps you choose the right variable types
- **Mutability control** teaches you when and how to use mutable variables
- **Best practices** shows you Rust's approach to variable management
- **Real-world application** demonstrates practical variable usage

**When**: Use this exercise when:

- You're learning the basics of Rust variables
- You want to understand the difference between immutable and mutable variables
- You need practice with variable declaration and modification
- You're building confidence with Rust syntax
- You're preparing for more complex programming tasks

### Basic Variable Practice

**What**: A comprehensive exercise that demonstrates both immutable and mutable variable usage.

**How**: Here's how to practice variable declaration and mutability:

```rust
fn main() {
    // Declare immutable variables
    let name = "Alice";
    let age = 25;
    let height = 5.6;
    let is_student = true;

    // Declare mutable variables
    let mut score = 0;
    let mut attempts = 0;
    let mut is_playing = true;

    // Print all variables
    println!("Name: {}", name);
    println!("Age: {}", age);
    println!("Height: {}", height);
    println!("Is student: {}", is_student);
    println!("Score: {}", score);
    println!("Attempts: {}", attempts);
    println!("Is playing: {}", is_playing);

    // Modify mutable variables
    score += 10;
    attempts += 1;
    is_playing = false;

    println!("After modification:");
    println!("Score: {}", score);
    println!("Attempts: {}", attempts);
    println!("Is playing: {}", is_playing);
}
```

**Explanation**:

- `let name = "Alice";` creates an immutable string variable
- `let age = 25;` creates an immutable integer variable
- `let height = 5.6;` creates an immutable floating-point variable
- `let is_student = true;` creates an immutable boolean variable
- `let mut score = 0;` creates a mutable integer variable using the `mut` keyword
- `let mut attempts = 0;` creates another mutable integer variable
- `let mut is_playing = true;` creates a mutable boolean variable
- The first set of `println!` statements displays the initial values
- `score += 10;` modifies the mutable score variable
- `attempts += 1;` increments the attempts counter
- `is_playing = false;` changes the boolean state
- The second set of `println!` statements shows the modified values

**Why**: This exercise demonstrates the fundamental difference between immutable and mutable variables in Rust, showing how to declare, use, and modify variables appropriately.

### Shadowing Practice

**What**: A program that demonstrates variable shadowing.

**How**: Here's how to demonstrate variable shadowing:

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

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `println!("x = {}", x);` prints the value of `x`
- `let x = x + 1;` creates a new variable `x` that shadows the old one
- `println!("x = {}", x);` prints the new value of `x`
- `let x = x * 2;` creates another new variable `x` that shadows the old one
- `println!("x = {}", x);` prints the new value of `x`
- `{` creates a new scope
- `let x = x - 3;` creates a new variable `x` that shadows the old one
- `println!("x in inner scope = {}", x);` prints the new value of `x`
- `}` closes the scope
- `println!("x in outer scope = {}", x);` prints the new value of `x`

**Why**: This exercise demonstrates variable shadowing, which is a powerful feature for creating new variables with the same name.

## Exercise 2: Scalar Types Practice

### Integer Operations

**What**: A program that demonstrates integer operations.

**How**: Here's how to demonstrate integer operations:

```rust
fn main() {
    let a: i32 = 10;
    let b: i32 = 3;
    let c: u8 = 255;
    let d: i16 = -32768;

    println!("a + b = {}", a + b);
    println!("a - b = {}", a - b);
    println!("a * b = {}", a * b);
    println!("a / b = {}", a / b);
    println!("a % b = {}", a % b);

    println!("c = {}", c);
    println!("d = {}", d);

    // Check integer overflow
    let result = a.checked_add(b);
    match result {
        Some(value) => println!("a + b = {}", value),
        None => println!("Overflow occurred!"),
    }
}
```

**Explanation**:

- `let a: i32 = 10;` creates an immutable integer variable `a` with value 10
- `let b: i32 = 3;` creates another immutable integer variable `b` with value 3
- `let c: u8 = 255;` creates an immutable unsigned 8-bit integer variable `c` with value 255
- `let d: i16 = -32768;` creates another immutable 16-bit integer variable `d` with value -32768

- `println!("a + b = {}", a + b);` prints the sum of `a` and `b`
- `println!("a - b = {}", a - b);` prints the difference between `a` and `b`
- `println!("a * b = {}", a * b);` prints the product of `a` and `b`
- `println!("a / b = {}", a / b);` prints the quotient of `a` and `b`
- `println!("a % b = {}", a % b);` prints the remainder of `a` divided by `b`

- `println!("c = {}", c);` prints the value of `c`
- `println!("d = {}", d);` prints the value of `d`

- `let result = a.checked_add(b);` creates a new variable `result` that is the sum of `a` and `b`
- `match result {` matches the value of `result`
- `Some(value) => println!("a + b = {}", value),` prints the value of `value`
- `None => println!("Overflow occurred!"),` prints the message "Overflow occurred!"
- `}` closes the match statement

**Why**: This exercise demonstrates integer operations, including addition, subtraction, multiplication, division, and remainder.

### Floating-Point Operations

**What**: A program that demonstrates floating-point operations.

**How**: Here's how to demonstrate floating-point operations:

```rust
fn main() {
    let x: f64 = 3.14159;
    let y: f32 = 2.71828;
    let z: f64 = 1.41421;

    println!("x = {}", x);
    println!("y = {}", y);
    println!("z = {}", z);

    // Basic operations
    println!("x + y = {}", x + y as f64);
    println!("x - y = {}", x - y as f64);
    println!("x * y = {}", x * y as f64);
    println!("x / y = {}", x / y as f64);

    // Special values
    let inf = f64::INFINITY;
    let neg_inf = f64::NEG_INFINITY;
    let nan = f64::NAN;

    println!("Infinity: {}", inf);
    println!("Negative infinity: {}", neg_inf);
    println!("NaN: {}", nan);

    // Check for special values
    println!("Is infinity: {}", x.is_infinite());
    println!("Is NaN: {}", x.is_nan());
}
```

**Explanation**:

- `let x: f64 = 3.14159;` creates an immutable 64-bit floating-point variable `x` with value 3.14159
- `let y: f32 = 2.71828;` creates another immutable 32-bit floating-point variable `y` with value 2.71828
- `let z: f64 = 1.41421;` creates another immutable 64-bit floating-point variable `z` with value 1.41421

- `println!("x = {}", x);` prints the value of `x`
- `println!("y = {}", y);` prints the value of `y`
- `println!("z = {}", z);` prints the value of `z`

- `println!("x + y = {}", x + y as f64);` prints the sum of `x` and `y`
- `println!("x - y = {}", x - y as f64);` prints the difference between `x` and `y`
- `println!("x * y = {}", x * y as f64);` prints the product of `x` and `y`
- `println!("x / y = {}", x / y as f64);` prints the quotient of `x` and `y`

- `println!("Infinity: {}", inf);` prints the value of `inf`
- `println!("Negative infinity: {}", neg_inf);` prints the value of `neg_inf`
- `println!("NaN: {}", nan);` prints the value of `nan`

- `println!("Is infinity: {}", x.is_infinite());` prints whether `x` is infinite
- `println!("Is NaN: {}", x.is_nan());` prints whether `x` is NaN

**Why**: This exercise demonstrates floating-point operations, including addition, subtraction, multiplication, division, and special values.

### Character Operations

**What**: A program that demonstrates character operations.

**How**: Here's how to demonstrate character operations:

```rust
fn main() {
    let chars = ['A', 'a', '1', '中', '🚀', '∑'];

    for c in chars.iter() {
        println!("Character: {}", c);
        println!("  Is alphabetic: {}", c.is_alphabetic());
        println!("  Is numeric: {}", c.is_numeric());
        println!("  Is uppercase: {}", c.is_uppercase());
        println!("  Is lowercase: {}", c.is_lowercase());
        println!("  Unicode value: {}", *c as u32);
        println!();
    }
}
```

**Explanation**:

- `let chars = ['A', 'a', '1', '中', '🚀', '∑'];` creates an array of characters
- `for c in chars.iter() {` iterates over the characters
- `println!("Character: {}", c);` prints the character
- `println!("  Is alphabetic: {}", c.is_alphabetic());` prints whether the character is alphabetic
- `println!("  Is numeric: {}", c.is_numeric());` prints whether the character is numeric
- `println!("  Is uppercase: {}", c.is_uppercase());` prints whether the character is uppercase
- `println!("  Is lowercase: {}", c.is_lowercase());` prints whether the character is lowercase
- `println!("  Unicode value: {}", *c as u32);` prints the Unicode value of the character
- `println!();` prints a newline

**Why**: This exercise demonstrates character operations, including alphabetic, numeric, uppercase, lowercase, and Unicode values.

## Exercise 3: Compound Types Practice

### Tuple Operations

**What**: A program that demonstrates tuple operations.

**How**: Here's how to demonstrate tuple operations:

```rust
fn main() {
    // Create tuples
    let person = ("Alice", 25, 5.6);
    let coordinates = (10, 20);
    let rgb_color = (255, 128, 64);

    // Access tuple elements
    println!("Person: {:?}", person);
    println!("Name: {}", person.0);
    println!("Age: {}", person.1);
    println!("Height: {}", person.2);

    // Destructure tuples
    let (name, age, height) = person;
    println!("Name: {}, Age: {}, Height: {}", name, age, height);

    // Destructure with some ignored
    let (x, y) = coordinates;
    println!("Coordinates: ({}, {})", x, y);

    // Nested tuples
    let nested = ((1, 2), (3, 4));
    let ((a, b), (c, d)) = nested;
    println!("Nested: (({}, {}), ({}, {}))", a, b, c, d);
}
```

**Explanation**:

- `let person = ("Alice", 25, 5.6);` creates a tuple with three elements
- `let coordinates = (10, 20);` creates another tuple with two elements
- `let rgb_color = (255, 128, 64);` creates another tuple with three elements

- `println!("Person: {:?}", person);` prints the person tuple
- `println!("Name: {}", person.0);` prints the first element of the person tuple
- `println!("Age: {}", person.1);` prints the second element of the person tuple
- `println!("Height: {}", person.2);` prints the third element of the person tuple

- `let (name, age, height) = person;` destructures the person tuple
- `println!("Name: {}, Age: {}, Height: {}", name, age, height);` prints the destructured values

- `let (x, y) = coordinates;` destructures the coordinates tuple
- `println!("Coordinates: ({}, {})", x, y);` prints the destructured values

- `let nested = ((1, 2), (3, 4));` creates a nested tuple
- `let ((a, b), (c, d)) = nested;` destructures the nested tuple
- `println!("Nested: (({}, {}), ({}, {}))", a, b, c, d);` prints the destructured values

**Why**: This exercise demonstrates tuple operations, including creation, access, and destructuring.

### Array Operations

**What**: A program that demonstrates array operations.

**How**: Here's how to demonstrate array operations:

```rust
fn main() {
    // Create arrays
    let numbers = [1, 2, 3, 4, 5];
    let words = ["hello", "world", "rust"];
    let matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // Access array elements
    println!("Numbers: {:?}", numbers);
    println!("First number: {}", numbers[0]);
    println!("Last number: {}", numbers[4]);

    // Iterate through array
    for (index, number) in numbers.iter().enumerate() {
        println!("numbers[{}] = {}", index, number);
    }

    // Array operations
    let sum: i32 = numbers.iter().sum();
    let count = numbers.len();
    let average = sum as f64 / count as f64;

    println!("Sum: {}", sum);
    println!("Count: {}", count);
    println!("Average: {:.2}", average);

    // 2D array
    println!("Matrix:");
    for row in matrix.iter() {
        for element in row.iter() {
            print!("{} ", element);
        }
        println!();
    }
}
```

**Explanation**:

- `let numbers = [1, 2, 3, 4, 5];` creates an array with five elements
- `let words = ["hello", "world", "rust"];` creates another array with three elements
- `let matrix = [` creates a 2D array with three rows and three columns

- `println!("Numbers: {:?}", numbers);` prints the numbers array
- `println!("First number: {}", numbers[0]);` prints the first element of the numbers array
- `println!("Last number: {}", numbers[4]);` prints the fifth element of the numbers array

- `for (index, number) in numbers.iter().enumerate() {` iterates over the numbers array
- `println!("numbers[{}] = {}", index, number);` prints the index and value of the number

- `let sum: i32 = numbers.iter().sum();` creates a new variable `sum` that is the sum of the numbers array
- `let count = numbers.len();` creates a new variable `count` that is the length of the numbers array
- `let average = sum as f64 / count as f64;` creates a new variable `average` that is the average of the numbers array

- `println!("Sum: {}", sum);` prints the value of `sum`
- `println!("Count: {}", count);` prints the value of `count`
- `println!("Average: {:.2}", average);` prints the value of `average`

- `println!("Matrix:");` prints the matrix
- `for row in matrix.iter() {` iterates over the rows of the matrix
- `for element in row.iter() {` iterates over the elements of the row
- `print!("{} ", element);` prints the element
- `println!();` prints a newline

**Why**: This exercise demonstrates array operations, including creation, access, iteration, and operations.

## Exercise 4: Type Conversions Practice

### Numeric Conversions

**What**: A program that demonstrates numeric conversions.

**How**: Here's how to demonstrate numeric conversions:

```rust
fn main() {
    let x: i32 = 42;
    let y: f64 = 3.14;
    let z: u8 = 255;

    // Convert between types
    let a = x as f64;
    let b = y as i32;
    let c = z as i32;

    println!("x: {} -> f64: {}", x, a);
    println!("y: {} -> i32: {}", y, b);
    println!("z: {} -> i32: {}", z, c);

    // Safe conversions
    match x.try_into::<u8>() {
        Ok(value) => println!("x -> u8: {}", value),
        Err(_) => println!("x -> u8: conversion failed"),
    }

    match 300.try_into::<u8>() {
        Ok(value) => println!("300 -> u8: {}", value),
        Err(_) => println!("300 -> u8: conversion failed"),
    }
}
```

**Explanation**:

- `let x: i32 = 42;` creates an immutable integer variable `x` with value 42
- `let y: f64 = 3.14;` creates another immutable floating-point variable `y` with value 3.14
- `let z: u8 = 255;` creates another immutable unsigned 8-bit integer variable `z` with value 255

- `let a = x as f64;` converts the `i32` to `f64`
- `let b = y as i32;` converts the `f64` to `i32`
- `let c = z as i32;` converts the `u8` to `i32`

- `println!("x: {} -> f64: {}", x, a);` prints the value of `x` and `a`
- `println!("y: {} -> i32: {}", y, b);` prints the value of `y` and `b`
- `println!("z: {} -> i32: {}", z, c);` prints the value of `z` and `c`

- `match x.try_into::<u8>() {` matches the value of `x`
- `Ok(value) => println!("x -> u8: {}", value),` prints the value of `value`
- `Err(_) => println!("x -> u8: conversion failed"),` prints the message "conversion failed"
- `}` closes the match statement

- `match 300.try_into::<u8>() {` matches the value of `300`
- `Ok(value) => println!("300 -> u8: {}", value),` prints the value of `value`
- `Err(_) => println!("300 -> u8: conversion failed"),` prints the message "conversion failed"
- `}` closes the match statement

**Why**: This exercise demonstrates numeric conversions, including explicit and safe conversions.

### String Conversions

**What**: A program that demonstrates string conversions.

**How**: Here's how to demonstrate string conversions:

```rust
fn main() {
    let numbers = [42, 3.14, 100];
    let strings = ["42", "3.14", "hello"];

    // Convert numbers to strings
    for num in numbers.iter() {
        let str = num.to_string();
        println!("{} -> '{}'", num, str);
    }

    // Parse strings to numbers
    for s in strings.iter() {
        if let Ok(num) = s.parse::<i32>() {
            println!("'{}' -> i32: {}", s, num);
        } else if let Ok(num) = s.parse::<f64>() {
            println!("'{}' -> f64: {}", s, num);
        } else {
            println!("'{}' -> string: {}", s, s);
        }
    }
}
```

**Explanation**:

- `let numbers = [42, 3.14, 100];` creates an array of numbers
- `let strings = ["42", "3.14", "hello"];` creates another array of strings

- `for num in numbers.iter() {` iterates over the numbers array
- `let str = num.to_string();` converts the number to a string
- `println!("{} -> '{}'", num, str);` prints the number and string

- `for s in strings.iter() {` iterates over the strings array
- `if let Ok(num) = s.parse::<i32>() {` parses the string as an integer
- `println!("'{}' -> i32: {}", s, num);` prints the string and integer

- `if let Ok(num) = s.parse::<f64>() {` parses the string as a floating-point number
- `println!("'{}' -> f64: {}", s, num);` prints the string and floating-point number

- `else {` else clause
- `println!("'{}' -> string: {}", s, s);` prints the string
- `}` closes the else clause

**Why**: This exercise demonstrates string conversions, including number to string and string to number.

## Exercise 5: Constants and Variables

**What**: A program that demonstrates constants and variables.

**How**: Here's how to demonstrate constants and variables:

```rust
const MAX_USERS: u32 = 1000;
const PI: f64 = 3.14159;
const COMPANY_NAME: &str = "Rust Corp";
const IS_DEBUG: bool = true;

fn main() {
    println!("Max users: {}", MAX_USERS);
    println!("Pi: {}", PI);
    println!("Company: {}", COMPANY_NAME);
    println!("Debug mode: {}", IS_DEBUG);

    // Use constants in calculations
    let radius = 5.0;
    let area = PI * radius * radius;
    let circumference = 2.0 * PI * radius;

    println!("Radius: {}", radius);
    println!("Area: {:.2}", area);
    println!("Circumference: {:.2}", circumference);
}
```

**Explanation**:

- `const MAX_USERS: u32 = 1000;` creates a constant with value 1000
- `const PI: f64 = 3.14159;` creates another constant with value 3.14159
- `const COMPANY_NAME: &str = "Rust Corp";` creates another constant with value "Rust Corp"
- `const IS_DEBUG: bool = true;` creates another constant with value true

- `println!("Max users: {}", MAX_USERS);` prints the value of `MAX_USERS`
- `println!("Pi: {}", PI);` prints the value of `PI`
- `println!("Company: {}", COMPANY_NAME);` prints the value of `COMPANY_NAME`
- `println!("Debug mode: {}", IS_DEBUG);` prints the value of `IS_DEBUG`

- `let radius = 5.0;` creates a mutable floating-point variable `radius` with value 5.0
- `let area = PI * radius * radius;` creates a new variable `area` that is the area of the circle
- `let circumference = 2.0 * PI * radius;` creates a new variable `circumference` that is the circumference of the circle

- `println!("Radius: {}", radius);` prints the value of `radius`
- `println!("Area: {:.2}", area);` prints the value of `area`
- `println!("Circumference: {:.2}", circumference);` prints the value of `circumference`

**Why**: This exercise demonstrates constants and variables, including mutable and immutable variables.

## Exercise 6: Scope and Shadowing

### Scope Practice

**What**: A program that demonstrates scope and shadowing.

**How**: Here's how to demonstrate scope and shadowing:

```rust
fn main() {
    let x = 5;
    println!("x in outer scope: {}", x);

    {
        let y = 10;
        println!("x in inner scope: {}", x);
        println!("y in inner scope: {}", y);

        {
            let z = 15;
            println!("x in innermost scope: {}", x);
            println!("y in innermost scope: {}", y);
            println!("z in innermost scope: {}", z);
        }

        // z is out of scope here
        // println!("z: {}", z); // This would cause an error
    }

    // y is out of scope here
    // println!("y: {}", y); // This would cause an error
    println!("x in outer scope: {}", x);
}
```

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `println!("x in outer scope: {}", x);` prints the value of `x`
- `{` creates a new scope
- `let y = 10;` creates a new variable `y` with value 10
- `println!("x in inner scope: {}", x);` prints the value of `x`
- `println!("y in inner scope: {}", y);` prints the value of `y`
- `{` creates a new scope
- `let z = 15;` creates a new variable `z` with value 15
- `println!("x in innermost scope: {}", x);` prints the value of `x`
- `println!("y in innermost scope: {}", y);` prints the value of `y`
- `println!("z in innermost scope: {}", z);` prints the value of `z`
- `}` closes the scope
- `}` closes the scope
- `println!("x in outer scope: {}", x);` prints the value of `x`

**Why**: This exercise demonstrates scope and shadowing, including nested scopes and variable shadowing.

### Shadowing Practice

**What**: A program that demonstrates shadowing practice.

**How**: Here's how to demonstrate shadowing practice:

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

**Explanation**:

- `let x = 5;` creates an immutable variable `x` with value 5
- `println!("x = {}", x);` prints the value of `x`
- `let x = x + 1;` creates a new variable `x` that shadows the old one
- `println!("x = {}", x);` prints the new value of `x`
- `let x = x * 2;` creates another new variable `x` that shadows the old one
- `println!("x = {}", x);` prints the new value of `x`
- `{` creates a new scope
- `let x = x - 3;` creates a new variable `x` that shadows the old one
- `println!("x in inner scope = {}", x);` prints the new value of `x`
- `}` closes the scope
- `println!("x in outer scope = {}", x);` prints the new value of `x`

**Why**: This exercise demonstrates shadowing practice, which is a powerful feature for creating new variables with the same name.

## Exercise 7: Explicit Type Annotations

**What**: A program that demonstrates explicit type annotations.

**How**: Here's how to demonstrate explicit type annotations:

```rust
fn main() {
    // Explicit type annotations
    let x: i32 = 5;
    let y: f64 = 3.14;
    let z: bool = true;
    let c: char = 'A';
    let s: &str = "Hello";

    // Array with explicit type
    let numbers: [i32; 5] = [1, 2, 3, 4, 5];

    // Tuple with explicit type
    let point: (i32, i32) = (10, 20);

    println!("x: {}", x);
    println!("y: {}", y);
    println!("z: {}", z);
    println!("c: {}", c);
    println!("s: {}", s);
    println!("numbers: {:?}", numbers);
    println!("point: {:?}", point);
}
```

**Explanation**:

- `let x: i32 = 5;` creates an immutable integer variable `x` with value 5
- `let y: f64 = 3.14;` creates another immutable floating-point variable `y` with value 3.14
- `let z: bool = true;` creates another immutable boolean variable `z` with value true
- `let c: char = 'A';` creates another immutable character variable `c` with value 'A'
- `let s: &str = "Hello";` creates another immutable string variable `s` with value "Hello"
- `let numbers: [i32; 5] = [1, 2, 3, 4, 5];` creates an array with five elements
- `let point: (i32, i32) = (10, 20);` creates another tuple with two elements

**Why**: This exercise demonstrates explicit type annotations, including array and tuple types.

- `println!("x: {}", x);` prints the value of `x`
- `println!("y: {}", y);` prints the value of `y`
- `println!("z: {}", z);` prints the value of `z`
- `println!("c: {}", c);` prints the value of `c`
- `println!("s: {}", s);` prints the value of `s`
- `println!("numbers: {:?}", numbers);` prints the value of `numbers`
- `println!("point: {:?}", point);` prints the value of `point`

## Exercise 8: Number Formatting

**What**: A program that demonstrates number formatting.

**How**: Here's how to demonstrate number formatting:

```rust
fn main() {
    let number = 1234567;
    let float = 3.14159;

    // Basic formatting
    println!("Number: {}", number);
    println!("Float: {}", float);

    // Format with separators
    println!("Number with separators: {:,}", number);

    // Format with different bases
    println!("Binary: {:b}", number);
    println!("Hex: {:x}", number);
    println!("Octal: {:o}", number);

    // Format with padding
    println!("Padded: {:010}", number);

    // Float formatting
    println!("Float 2 decimal places: {:.2}", float);
    println!("Float 4 decimal places: {:.4}", float);
    println!("Float scientific: {:e}", float);
}
```

**Explanation**:

- `let number = 1234567;` creates an integer variable `number` with value 1234567
- `let float = 3.14159;` creates another floating-point variable `float` with value 3.14159

- `println!("Number: {}", number);` prints the value of `number`
- `println!("Float: {}", float);` prints the value of `float`

- `println!("Number with separators: {:,}", number);` prints the value of `number` with separators
- `println!("Binary: {:b}", number);` prints the value of `number` in binary
- `println!("Hex: {:x}", number);` prints the value of `number` in hexadecimal
- `println!("Octal: {:o}", number);` prints the value of `number` in octal
- `println!("Padded: {:010}", number);` prints the value of `number` with padding
- `println!("Float 2 decimal places: {:.2}", float);` prints the value of `float` with 2 decimal places
- `println!("Float 4 decimal places: {:.4}", float);` prints the value of `float` with 4 decimal places
- `println!("Float scientific: {:e}", float);` prints the value of `float` in scientific notation

**Why**: This exercise demonstrates number formatting, including separators, different bases, and padding.

## Exercise 9: Character Analysis

**What**: A program that demonstrates character operations.

**How**: Here's how to demonstrate character operations:

```rust
fn main() {
    let chars = ['A', 'a', '1', '中', '🚀', '∑', ' ', '\n', '\t'];

    for c in chars.iter() {
        println!("Character: '{}'", c);
        println!("  Is alphabetic: {}", c.is_alphabetic());
        println!("  Is numeric: {}", c.is_numeric());
        println!("  Is uppercase: {}", c.is_uppercase());
        println!("  Is lowercase: {}", c.is_lowercase());
        println!("  Is whitespace: {}", c.is_whitespace());
        println!("  Unicode value: {}", *c as u32);
        println!();
    }
}
```

**Explanation**:

- `let chars = ['A', 'a', '1', '中', '🚀', '∑', ' ', '\n', '\t'];` creates an array of characters
- `for c in chars.iter() {` iterates over the characters
- `println!("Character: '{}'", c);` prints the character
- `println!("  Is alphabetic: {}", c.is_alphabetic());` prints whether the character is alphabetic
- `println!("  Is numeric: {}", c.is_numeric());` prints whether the character is numeric
- `println!("  Is uppercase: {}", c.is_uppercase());` prints whether the character is uppercase
- `println!("  Is lowercase: {}", c.is_lowercase());` prints whether the character is lowercase
- `println!("  Is whitespace: {}", c.is_whitespace());` prints whether the character is whitespace
- `println!("  Unicode value: {}", *c as u32);` prints the Unicode value of the character
- `println!();` prints a newline

**Why**: This exercise demonstrates character operations, including alphabetic, numeric, uppercase, lowercase, whitespace, and Unicode values.

## Exercise 10: Array Statistics

**What**: A program that demonstrates array analysis.

**How**: Here's how to demonstrate array analysis:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Basic statistics
    let sum: i32 = numbers.iter().sum();
    let count = numbers.len();
    let average = sum as f64 / count as f64;

    // Min and max
    let min = numbers.iter().min().unwrap();
    let max = numbers.iter().max().unwrap();

    // Even and odd counts
    let even_count = numbers.iter().filter(|&&x| x % 2 == 0).count();
    let odd_count = numbers.iter().filter(|&&x| x % 2 != 0).count();

    println!("Numbers: {:?}", numbers);
    println!("Sum: {}", sum);
    println!("Count: {}", count);
    println!("Average: {:.2}", average);
    println!("Min: {}", min);
    println!("Max: {}", max);
    println!("Even count: {}", even_count);
    println!("Odd count: {}", odd_count);
}
```

**Explanation**:

- `let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];` creates an array of numbers
- `let sum: i32 = numbers.iter().sum();` calculates the sum of the numbers
- `let count = numbers.len();` calculates the length of the numbers
- `let average = sum as f64 / count as f64;` calculates the average of the numbers
- `let min = numbers.iter().min().unwrap();` calculates the minimum of the numbers
- `let max = numbers.iter().max().unwrap();` calculates the maximum of the numbers
- `let even_count = numbers.iter().filter(|&&x| x % 2 == 0).count();` calculates the number of even numbers
- `let odd_count = numbers.iter().filter(|&&x| x % 2 != 0).count();` calculates the number of odd numbers

**Why**: This exercise demonstrates array analysis, including sum, count, average, min, max, even count, and odd count.

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Variable Mastery** - You understand how to declare and use both immutable and mutable variables
2. **Type System Knowledge** - You can work with all scalar and compound types in Rust
3. **Conversion Skills** - You can safely convert between different data types
4. **Array and Tuple Operations** - You can manipulate compound data structures
5. **Scope Understanding** - You understand how variable scope and shadowing work
6. **Type Safety Awareness** - You know the importance of explicit type conversions
7. **Practical Programming** - You can write real Rust programs with proper type handling

**Why** these concepts matter:

- **Variable management** is fundamental to all programming in Rust
- **Type safety** prevents many common programming errors and bugs
- **Explicit conversions** make code intentions clear and debuggable
- **Scope understanding** helps you write clean, maintainable code
- **Array and tuple operations** enable you to work with complex data structures
- **Type annotations** make your code more readable and self-documenting
- **Practical experience** builds confidence in your Rust programming skills

**When** to use these concepts:

- **Variable declaration** - Use `let` for immutable variables, `let mut` for mutable ones
- **Type conversions** - Use `as` for basic conversions, `TryFrom`/`TryInto` for safe conversions
- **Array operations** - Use indexing and iteration for data processing
- **Tuple destructuring** - Use pattern matching to extract values from tuples
- **Scope management** - Use blocks to control variable lifetime
- **Type annotations** - Use explicit types when the compiler can't infer them
- **Error handling** - Always handle potential conversion failures

**Where** these skills apply:

- **Personal projects** - Creating robust applications with proper type handling
- **Team development** - Working with others on shared Rust codebases
- **Open source contribution** - Understanding and contributing to Rust projects
- **Professional development** - Using Rust effectively in production environments
- **Learning progression** - Building on this foundation for advanced Rust concepts

## Next Steps

**What** you're ready for next:

After completing these exercises, you should be comfortable with:

- **Variable declaration and mutability** - Creating and using variables appropriately
- **All scalar and compound types** - Working with integers, floats, booleans, characters, tuples, and arrays
- **Type conversions and casting** - Converting between different data types safely
- **Array and tuple operations** - Manipulating compound data structures
- **Type annotations and inference** - Helping the compiler understand your types
- **Scope and shadowing** - Understanding variable lifetime and shadowing behavior

**Where** to go next:

Continue with the next chapter on **"Functions and Control Flow"** to learn:

- How to define and call functions in Rust
- Working with function parameters and return values
- Implementing conditional logic with if expressions
- Creating loops for repetitive operations
- Using pattern matching with match expressions
- Building more complex programs with control flow

**Why** the next chapter is important:

The next chapter builds directly on your variable and data type knowledge by showing you how to organize code into functions and control program flow. You'll learn to create reusable code blocks and implement decision-making logic, which are essential skills for building real-world applications.

**How** to continue learning:

1. **Practice these exercises** - Make sure you understand each concept thoroughly
2. **Experiment with variations** - Try modifying the exercises to explore different scenarios
3. **Read the documentation** - Explore the resources provided for deeper understanding
4. **Join the community** - Engage with other Rust learners and developers
5. **Build small projects** - Apply what you've learned in practical applications

## Resources

**Official Documentation**:

- [The Rust Book - Variables and Mutability](https://doc.rust-lang.org/book/ch03-01-variables-and-mutability.html) - Comprehensive variable guide
- [Rust by Example - Variables](https://doc.rust-lang.org/rust-by-example/variable_bindings.html) - Learn by example
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

**Practice Tips**:

1. **Experiment with types** - Try different type annotations to see how they affect your code
2. **Practice conversions** - Understand when conversions are safe vs unsafe
3. **Use shadowing wisely** - Understand the difference between shadowing and mutation
4. **Check bounds** - Always validate array access to prevent runtime errors
5. **Format output** - Make your programs user-friendly with proper formatting
6. **Read error messages** - Rust's compiler errors are very helpful for learning
7. **Practice regularly** - Consistent practice is key to mastering Rust

Happy coding! 🦀
