---
sidebar_position: 3
---

# Compound Types

Master Rust's compound data types with comprehensive explanations using the 4W+H framework.

## What Are Compound Types in Rust?

**What**: Compound types in Rust are data structures that group multiple values together. The two main compound types are tuples and arrays, which allow you to store and organize related data efficiently.

**Why**: Compound types are essential because:

- **Data organization** allows you to group related values together
- **Type safety** ensures each element has the correct type
- **Memory efficiency** provides compact storage for multiple values
- **Function returns** enable functions to return multiple values
- **Data structures** form the foundation for complex data organization

**When**: Use compound types when:

- You need to store multiple related values
- Functions should return multiple results
- You want to group heterogeneous data (tuples)
- You need to store homogeneous collections (arrays)
- You're working with structured data

**How**: Compound types work in Rust by:

- **Grouping values** using parentheses for tuples and square brackets for arrays
- **Type specification** allowing different types in tuples, same types in arrays
- **Indexing access** using dot notation for tuples and bracket notation for arrays
- **Destructuring** extracting individual values from compound types
- **Memory layout** storing values contiguously in memory

**Where**: Compound types are used throughout Rust programs for data organization, function returns, and building more complex data structures.

## Tuples

**What**: Tuples are compound types that group together values of different types. They have a fixed size and can contain elements of different types.

**Why**: Understanding tuples is crucial because:

- **Multiple returns** allow functions to return several values
- **Data grouping** organize related but different types of data
- **Type safety** ensure each position has the correct type
- **Memory efficiency** provide compact storage for related values
- **Pattern matching** enable powerful destructuring operations

**When**: Use tuples when:

- Functions need to return multiple values
- You have related data of different types
- You need to group heterogeneous data
- You want to pass multiple parameters as a single unit
- You're working with coordinate pairs, RGB values, or similar structured data

### Basic Tuple Operations

**What**: The fundamental operations for creating, accessing, and working with tuples in Rust.

**How**: Here's how to work with tuples in Rust:

```rust
fn main() {
    // Creating tuples
    let tup = (500, 6.4, 1);
    let tup2: (i32, f64, u8) = (500, 6.4, 1);

    // Accessing tuple elements
    let (x, y, z) = tup;
    println!("x: {}, y: {}, z: {}", x, y, z);

    // Accessing by index
    println!("First element: {}", tup.0);
    println!("Second element: {}", tup.1);
    println!("Third element: {}", tup.2);
}
```

**Explanation**:

- `let tup = (500, 6.4, 1);` creates a tuple with three elements of different types
- `let tup2: (i32, f64, u8) = (500, 6.4, 1);` explicitly specifies the types of each element
- `let (x, y, z) = tup;` destructures the tuple into individual variables
- `tup.0`, `tup.1`, `tup.2` access tuple elements by index (0-based)
- Tuples can contain different types, unlike arrays which must have the same type
- The dot notation (`.0`, `.1`, etc.) is used to access tuple elements by position

**Why**: This demonstrates the basic tuple operations that form the foundation for working with compound data in Rust.

### Tuple Destructuring

**What**: Destructuring allows you to extract individual values from tuples into separate variables.

**How**: Here's how to destructure tuples in Rust:

```rust
fn main() {
    let tup = (1, 2, 3, 4, 5);

    // Destructure all elements
    let (a, b, c, d, e) = tup;
    println!("a: {}, b: {}, c: {}, d: {}, e: {}", a, b, c, d, e);

    // Destructure with some ignored
    let (first, _, third, _, fifth) = tup;
    println!("first: {}, third: {}, fifth: {}", first, third, fifth);

    // Destructure with rest
    let (first, second, ..) = tup;
    println!("first: {}, second: {}", first, second);
}
```

**Explanation**:

- `let (a, b, c, d, e) = tup;` extracts all five elements into individual variables
- `let (first, _, third, _, fifth) = tup;` uses `_` to ignore the second and fourth elements
- `let (first, second, ..) = tup;` uses `..` to ignore the remaining elements
- The `_` placeholder ignores values you don't need
- The `..` rest pattern ignores all remaining elements
- Destructuring is a powerful feature for extracting specific values from tuples

**Why**: Destructuring makes it easy to work with individual values from tuples without using index notation.

### Tuple as Return Values

```rust
fn calculate_stats(numbers: &[i32]) -> (i32, i32, f64) {
    let sum: i32 = numbers.iter().sum();
    let count = numbers.len() as i32;
    let average = sum as f64 / count as f64;

    (sum, count, average)
}

fn main() {
    let numbers = [1, 2, 3, 4, 5];
    let (sum, count, average) = calculate_stats(&numbers);

    println!("Sum: {}, Count: {}, Average: {:.2}", sum, count, average);
}
```

### Nested Tuples

```rust
fn main() {
    let nested = ((1, 2), (3, 4), (5, 6));

    // Access nested elements
    println!("First pair: {:?}", nested.0);
    println!("Second pair: {:?}", nested.1);

    // Destructure nested tuples
    let ((a, b), (c, d), (e, f)) = nested;
    println!("a: {}, b: {}, c: {}, d: {}, e: {}, f: {}", a, b, c, d, e, f);
}
```

### Unit Tuple

```rust
fn main() {
    // Unit tuple - empty tuple
    let unit = ();
    println!("Unit tuple: {:?}", unit);

    // Functions that return nothing return unit
    let result = println!("Hello, world!");
    println!("Println returns: {:?}", result);
}
```

## Arrays

### Basic Array Operations

```rust
fn main() {
    // Creating arrays
    let a = [1, 2, 3, 4, 5];
    let b: [i32; 5] = [1, 2, 3, 4, 5];
    let c = [3; 5]; // [3, 3, 3, 3, 3]

    println!("a: {:?}", a);
    println!("b: {:?}", b);
    println!("c: {:?}", c);

    // Accessing array elements
    println!("First element: {}", a[0]);
    println!("Second element: {}", a[1]);
    println!("Last element: {}", a[4]);
}
```

### Array Iteration

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];

    // Iterate with for loop
    for number in numbers.iter() {
        println!("Number: {}", number);
    }

    // Iterate with index
    for (index, number) in numbers.iter().enumerate() {
        println!("Index {}: {}", index, number);
    }

    // Iterate with range
    for i in 0..numbers.len() {
        println!("numbers[{}] = {}", i, numbers[i]);
    }
}
```

### Array Slicing

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Create slice
    let slice = &numbers[2..5]; // [3, 4, 5]
    println!("Slice: {:?}", slice);

    // Slice from beginning
    let first_half = &numbers[..5];
    println!("First half: {:?}", first_half);

    // Slice to end
    let second_half = &numbers[5..];
    println!("Second half: {:?}", second_half);

    // Full slice
    let full_slice = &numbers[..];
    println!("Full slice: {:?}", full_slice);
}
```

### Array Methods

```rust
fn main() {
    let mut numbers = [1, 2, 3, 4, 5];

    // Array length
    println!("Length: {}", numbers.len());

    // Check if empty
    println!("Is empty: {}", numbers.is_empty());

    // Get first and last elements
    println!("First: {:?}", numbers.first());
    println!("Last: {:?}", numbers.last());

    // Array contains
    println!("Contains 3: {}", numbers.contains(&3));

    // Array join
    let joined = numbers.iter().map(|x| x.to_string()).collect::<Vec<String>>().join(", ");
    println!("Joined: {}", joined);
}
```

### Multi-dimensional Arrays

```rust
fn main() {
    // 2D array
    let matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // Access elements
    println!("matrix[0][0]: {}", matrix[0][0]);
    println!("matrix[1][2]: {}", matrix[1][2]);

    // Iterate through 2D array
    for row in matrix.iter() {
        for element in row.iter() {
            print!("{} ", element);
        }
        println!();
    }
}
```

## Array vs Tuple Comparison

### When to Use Arrays

```rust
fn main() {
    // Use arrays for homogeneous data
    let scores = [85, 92, 78, 96, 88];
    let names = ["Alice", "Bob", "Charlie"];

    // Arrays are good for fixed-size collections
    let days_of_week = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    println!("Scores: {:?}", scores);
    println!("Names: {:?}", names);
    println!("Days: {:?}", days_of_week);
}
```

### When to Use Tuples

```rust
fn main() {
    // Use tuples for heterogeneous data
    let person = ("Alice", 25, 5.6);
    let coordinates = (10, 20);
    let rgb_color = (255, 128, 64);

    // Tuples are good for related data
    let file_info = ("document.txt", 1024, true);

    println!("Person: {:?}", person);
    println!("Coordinates: {:?}", coordinates);
    println!("RGB Color: {:?}", rgb_color);
    println!("File info: {:?}", file_info);
}
```

## Common Patterns

### Swapping Values

```rust
fn main() {
    let mut numbers = [1, 2, 3, 4, 5];
    println!("Before: {:?}", numbers);

    // Swap first and last elements
    let temp = numbers[0];
    numbers[0] = numbers[4];
    numbers[4] = temp;

    println!("After: {:?}", numbers);
}
```

### Finding Elements

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];

    // Find element
    if let Some(index) = numbers.iter().position(|&x| x == 3) {
        println!("Found 3 at index: {}", index);
    }

    // Find with custom logic
    if let Some(index) = numbers.iter().position(|&x| x > 3) {
        println!("Found element > 3 at index: {}", index);
    }
}
```

### Array Sum and Average

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];

    // Sum
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);

    // Average
    let average = sum as f64 / numbers.len() as f64;
    println!("Average: {:.2}", average);

    // Min and max
    let min = numbers.iter().min().unwrap();
    let max = numbers.iter().max().unwrap();
    println!("Min: {}, Max: {}", min, max);
}
```

## Error Handling

### Array Bounds Checking

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];

    // This will panic at runtime
    // println!("{}", numbers[10]);

    // Safe way to access
    if let Some(element) = numbers.get(2) {
        println!("Element at index 2: {}", element);
    } else {
        println!("Index out of bounds!");
    }

    // Safe way to access with default
    let element = numbers.get(10).unwrap_or(&0);
    println!("Element at index 10: {}", element);
}
```

### Tuple Access Safety

```rust
fn main() {
    let tup = (1, 2, 3);

    // This will panic at runtime
    // println!("{}", tup.5);

    // Safe way to access
    match tup {
        (a, b, c) => {
            println!("a: {}, b: {}, c: {}", a, b, c);
        }
    }
}
```

## Practice Exercises

### Exercise 1: Tuple Operations

```rust
fn main() {
    let point = (10, 20);
    let (x, y) = point;

    println!("Point: ({}, {})", x, y);

    // Calculate distance from origin
    let distance = ((x * x + y * y) as f64).sqrt();
    println!("Distance from origin: {:.2}", distance);
}
```

### Exercise 2: Array Statistics

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let sum: i32 = numbers.iter().sum();
    let count = numbers.len();
    let average = sum as f64 / count as f64;

    println!("Numbers: {:?}", numbers);
    println!("Sum: {}", sum);
    println!("Count: {}", count);
    println!("Average: {:.2}", average);
}
```

### Exercise 3: Matrix Operations

```rust
fn main() {
    let matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // Print matrix
    for row in matrix.iter() {
        for element in row.iter() {
            print!("{} ", element);
        }
        println!();
    }

    // Calculate sum of all elements
    let mut sum = 0;
    for row in matrix.iter() {
        for element in row.iter() {
            sum += element;
        }
    }
    println!("Sum of all elements: {}", sum);
}
```

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Tuple Mastery** - You understand how to create, access, and destructure tuples
2. **Array Knowledge** - You can work with arrays, slices, and multi-dimensional arrays
3. **Compound Type Understanding** - You know when to use tuples vs arrays
4. **Destructuring Skills** - You can extract values from tuples using pattern matching
5. **Array Operations** - You can iterate, slice, and manipulate arrays
6. **Memory Safety** - You understand bounds checking and safe access patterns
7. **Data Organization** - You can choose the right compound type for your data

**Why** these concepts matter:

- **Data organization** enables you to structure related information effectively
- **Type safety** prevents errors when working with multiple values
- **Memory efficiency** provides optimal storage for your data
- **Function returns** allow functions to provide multiple results
- **Pattern matching** enables powerful data extraction and manipulation
- **Bounds checking** prevents runtime errors and memory issues

**When** to use these concepts:

- **Tuples** - Use for related data of different types, function returns, coordinates
- **Arrays** - Use for collections of the same type, fixed-size data, matrices
- **Destructuring** - Use when you need to extract specific values from tuples
- **Slicing** - Use when you need to work with parts of arrays
- **Iteration** - Use when you need to process all elements in a collection
- **Bounds checking** - Use when accessing elements to prevent panics

**Where** these skills apply:

- **Personal projects** - Creating and managing structured data in your own Rust applications
- **Team development** - Working with others on shared Rust codebases
- **Open source contribution** - Understanding and contributing to Rust projects
- **Professional development** - Using Rust effectively in production environments
- **Learning progression** - Building on this foundation for advanced Rust concepts

## Next Steps

**What** you're ready for next:

After mastering compound types, you should be comfortable with:

- **Tuple operations** - Creating, accessing, and destructuring tuples
- **Array manipulation** - Working with arrays, slices, and multi-dimensional data
- **Data organization** - Choosing between tuples and arrays for different scenarios
- **Pattern matching** - Using destructuring to extract values from compound types
- **Memory safety** - Understanding bounds checking and safe access patterns
- **Data structures** - Building the foundation for more complex data organization

**Where** to go next:

Continue with the next lesson on **"Type Conversions"** to learn:

- How to convert between different data types in Rust
- Understanding safe and unsafe type conversions
- Working with type annotations and inference
- Handling conversion errors and edge cases
- Understanding Rust's type system and safety guarantees

**Why** the next lesson is important:

The next lesson builds directly on your compound type knowledge by showing you how to work with different data types and convert between them safely. You'll learn about Rust's type system and how to handle type conversions effectively.

**How** to continue learning:

1. **Practice compound types** - Create your own examples with tuples and arrays
2. **Experiment with destructuring** - Try different patterns for extracting values
3. **Work with slices** - Practice array slicing and manipulation
4. **Read the documentation** - Explore the resources provided
5. **Join the community** - Engage with other Rust learners and developers

## Resources

**Official Documentation**:

- [The Rust Book - Compound Types](https://doc.rust-lang.org/book/ch03-02-data-types.html) - Comprehensive compound types guide
- [Rust by Example - Tuples](https://doc.rust-lang.org/rust-by-example/primitives/tuples.html) - Learn by example
- [Rust by Example - Arrays](https://doc.rust-lang.org/rust-by-example/primitives/array.html) - Array examples

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
