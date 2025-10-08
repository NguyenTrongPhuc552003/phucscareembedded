---
sidebar_position: 1
---

# Vectors Basics

Master dynamic arrays in Rust with comprehensive explanations using the 4W+H framework.

## What Are Vectors in Rust?

**What**: Vectors (`Vec<T>`) are dynamic arrays that can grow and shrink at runtime. They're one of the most commonly used collection types in Rust, providing efficient storage and access to sequences of data.

**Why**: Understanding vectors is crucial because:

- **Dynamic sizing** allows you to store varying amounts of data
- **Memory efficiency** provides optimal memory usage with automatic reallocation
- **Type safety** ensures all elements are of the same type
- **Performance** offers fast access and iteration
- **Flexibility** supports various operations like insertion, deletion, and modification
- **Real-world usage** is essential for most Rust applications
- **Foundation** for understanding other collection types

**When**: Use vectors when you need to:

- Store a collection of items that can grow or shrink
- Access elements by index efficiently
- Iterate over a sequence of data
- Build dynamic data structures
- Handle user input of unknown size
- Process lists of items

**How**: Vectors work in Rust by:

- **Heap allocation** storing data on the heap for dynamic sizing
- **Ownership management** with Rust's ownership system
- **Automatic reallocation** when capacity is exceeded
- **Zero-cost abstractions** providing efficient operations
- **Memory safety** preventing buffer overflows and memory leaks

**Where**: Vectors are used throughout Rust programs for data storage, processing, and algorithm implementation.

## Understanding Vector Creation

### Creating Empty Vectors

**What**: Empty vectors are created when you don't know the initial size or want to build the collection incrementally.

**Why**: Understanding empty vector creation is important because:

- **Dynamic building** allows you to add elements as needed
- **Memory efficiency** starts with minimal memory allocation
- **Flexibility** enables various construction patterns
- **Common pattern** in many Rust applications

**When**: Use empty vectors when you need to build collections incrementally.

**How**: Here's how to create empty vectors:

```rust
fn main() {
    // Create empty vector with type annotation
    let mut numbers: Vec<i32> = Vec::new();
    println!("Empty vector: {:?}", numbers);

    // Create empty vector using vec! macro
    let mut names: Vec<String> = vec![];
    println!("Empty vector with macro: {:?}", names);

    // Add elements to the vector
    numbers.push(1);
    numbers.push(2);
    numbers.push(3);
    println!("After adding elements: {:?}", numbers);

    names.push(String::from("Alice"));
    names.push(String::from("Bob"));
    println!("After adding names: {:?}", names);
}
```

**Explanation**:

- `Vec::new()` creates an empty vector with no elements
- `vec![]` is a macro that creates an empty vector
- Type annotation `Vec<i32>` specifies the element type
- `push()` method adds elements to the end of the vector
- `{:?}` format specifier prints the vector contents
- Vectors start empty and grow as elements are added

**Why**: Empty vectors provide a foundation for building collections dynamically.

### Creating Vectors with Initial Values

**What**: Vectors can be created with initial values using the `vec!` macro or `Vec::from()`.

**Why**: Understanding vector initialization is important because:

- **Convenience** allows you to create vectors with known initial data
- **Performance** avoids multiple push operations
- **Readability** makes code more concise and clear
- **Common pattern** in many Rust applications

**When**: Use initial values when you know the starting data for your vector.

**How**: Here's how to create vectors with initial values:

```rust
fn main() {
    // Create vector with initial values using vec! macro
    let numbers = vec![1, 2, 3, 4, 5];
    println!("Numbers: {:?}", numbers);

    // Create vector with strings
    let fruits = vec!["apple", "banana", "orange"];
    println!("Fruits: {:?}", fruits);

    // Create vector with mixed operations
    let squares: Vec<i32> = vec![1, 4, 9, 16, 25];
    println!("Squares: {:?}", squares);

    // Create vector with repeated values
    let zeros = vec![0; 5];  // 5 zeros
    println!("Zeros: {:?}", zeros);

    // Create vector with calculated values
    let mut calculated = Vec::new();
    for i in 1..=5 {
        calculated.push(i * i);
    }
    println!("Calculated: {:?}", calculated);
}
```

**Explanation**:

- `vec![1, 2, 3, 4, 5]` creates a vector with the specified values
- `vec!["apple", "banana", "orange"]` creates a vector of string literals
- `vec![0; 5]` creates a vector with 5 zeros (repeated value)
- Type inference determines the vector type from the values
- The `vec!` macro is more convenient than multiple `push()` calls

**Why**: Initial values provide a convenient way to create vectors with known data.

### Creating Vectors with Capacity

**What**: Vectors can be created with a specified initial capacity to avoid reallocations.

**Why**: Understanding capacity is important because:

- **Performance optimization** reduces memory reallocations
- **Memory efficiency** prevents unnecessary allocations
- **Predictable behavior** when you know the approximate size
- **Advanced usage** for performance-critical applications

**When**: Use capacity when you know the approximate size of your vector.

**How**: Here's how to create vectors with capacity:

```rust
fn main() {
    // Create vector with specific capacity
    let mut numbers: Vec<i32> = Vec::with_capacity(10);
    println!("Initial capacity: {}", numbers.capacity());
    println!("Initial length: {}", numbers.len());

    // Add elements to see capacity behavior
    for i in 1..=15 {
        numbers.push(i);
        println!("Length: {}, Capacity: {}", numbers.len(), numbers.capacity());
    }

    // Create vector with capacity and initial values
    let mut names = Vec::with_capacity(5);
    names.push("Alice");
    names.push("Bob");
    names.push("Charlie");

    println!("Names: {:?}", names);
    println!("Final capacity: {}", names.capacity());
}
```

**Explanation**:

- `Vec::with_capacity(10)` creates a vector with capacity for 10 elements
- `capacity()` returns the current capacity
- `len()` returns the current number of elements
- Capacity may grow beyond the initial value as needed
- This prevents multiple reallocations during growth

**Why**: Capacity optimization is important for performance-critical applications.

## Understanding Vector Operations

### Adding Elements

**What**: Vectors support various methods for adding elements at different positions.

**Why**: Understanding addition operations is important because:

- **Flexibility** allows you to add elements where needed
- **Performance** different methods have different performance characteristics
- **Common operations** essential for building collections
- **Real-world usage** needed in most applications

**When**: Use addition operations when you need to expand your vector.

**How**: Here's how to add elements to vectors:

```rust
fn main() {
    let mut numbers = vec![1, 2, 3];
    println!("Initial: {:?}", numbers);

    // Add element to the end
    numbers.push(4);
    println!("After push: {:?}", numbers);

    // Add multiple elements
    numbers.extend([5, 6, 7]);
    println!("After extend: {:?}", numbers);

    // Insert element at specific position
    numbers.insert(0, 0);  // Insert 0 at the beginning
    println!("After insert at 0: {:?}", numbers);

    // Insert element in the middle
    numbers.insert(3, 99);  // Insert 99 at position 3
    println!("After insert at 3: {:?}", numbers);

    // Add elements from another vector
    let more_numbers = vec![8, 9, 10];
    numbers.extend(more_numbers);
    println!("After extending with vector: {:?}", numbers);
}
```

**Explanation**:

- `push()` adds an element to the end of the vector
- `extend()` adds multiple elements from an iterator
- `insert(index, value)` inserts an element at a specific position
- Insertion shifts existing elements to make room
- `extend()` can work with arrays, vectors, or other iterators

**Why**: Different addition methods provide flexibility for various use cases.

### Removing Elements

**What**: Vectors support various methods for removing elements at different positions.

**Why**: Understanding removal operations is important because:

- **Data management** allows you to remove unwanted elements
- **Memory efficiency** frees up space when elements are no longer needed
- **Common operations** essential for dynamic collections
- **Performance** different methods have different performance characteristics

**When**: Use removal operations when you need to delete elements from your vector.

**How**: Here's how to remove elements from vectors:

```rust
fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    println!("Initial: {:?}", numbers);

    // Remove element from the end
    let last = numbers.pop();
    println!("Popped: {:?}", last);
    println!("After pop: {:?}", numbers);

    // Remove element at specific position
    let removed = numbers.remove(2);  // Remove element at index 2
    println!("Removed: {}", removed);
    println!("After remove: {:?}", numbers);

    // Remove element by value (first occurrence)
    if let Some(pos) = numbers.iter().position(|&x| x == 5) {
        numbers.remove(pos);
        println!("After removing 5: {:?}", numbers);
    }

    // Remove multiple elements
    numbers.retain(|&x| x % 2 == 0);  // Keep only even numbers
    println!("After retaining even numbers: {:?}", numbers);

    // Clear all elements
    numbers.clear();
    println!("After clear: {:?}", numbers);
}
```

**Explanation**:

- `pop()` removes and returns the last element
- `remove(index)` removes and returns the element at the specified index
- `retain(predicate)` keeps only elements that satisfy the condition
- `clear()` removes all elements from the vector
- Removal shifts elements to fill gaps

**Why**: Different removal methods provide flexibility for various deletion needs.

### Accessing Elements

**What**: Vectors provide multiple ways to access elements safely and efficiently.

**Why**: Understanding access operations is important because:

- **Data retrieval** allows you to read vector contents
- **Safety** prevents out-of-bounds access
- **Performance** different methods have different performance characteristics
- **Common operations** essential for using vector data

**When**: Use access operations when you need to read vector elements.

**How**: Here's how to access elements in vectors:

```rust
fn main() {
    let numbers = vec![10, 20, 30, 40, 50];

    // Access by index (panics if out of bounds)
    println!("First element: {}", numbers[0]);
    println!("Third element: {}", numbers[2]);

    // Safe access with get()
    match numbers.get(1) {
        Some(value) => println!("Second element: {}", value),
        None => println!("Index out of bounds"),
    }

    // Safe access with get() for out-of-bounds
    match numbers.get(10) {
        Some(value) => println!("Element at 10: {}", value),
        None => println!("Index 10 is out of bounds"),
    }

    // Access with default value
    let value = numbers.get(3).unwrap_or(&0);
    println!("Element at 3 (or 0): {}", value);

    // Access with default value for out-of-bounds
    let value = numbers.get(10).unwrap_or(&-1);
    println!("Element at 10 (or -1): {}", value);

    // Iterate over all elements
    println!("All elements:");
    for (index, value) in numbers.iter().enumerate() {
        println!("  {}: {}", index, value);
    }
}
```

**Explanation**:

- `numbers[0]` accesses element by index (can panic if out of bounds)
- `numbers.get(1)` returns `Option<&T>` for safe access
- `unwrap_or(&default)` provides a default value for None cases
- `iter().enumerate()` provides both index and value
- Safe access prevents runtime panics

**Why**: Safe access methods prevent crashes and provide better error handling.

## Understanding Vector Iteration

### Basic Iteration

**What**: Iteration allows you to process each element in a vector efficiently.

**Why**: Understanding iteration is important because:

- **Data processing** enables you to work with all elements
- **Performance** provides efficient access to vector contents
- **Common pattern** essential for most vector operations
- **Flexibility** supports various processing needs

**When**: Use iteration when you need to process all elements in a vector.

**How**: Here's how to iterate over vectors:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5];

    // Iterate with for loop
    println!("Iterating with for loop:");
    for number in &numbers {
        println!("  {}", number);
    }

    // Iterate with index
    println!("Iterating with index:");
    for (index, number) in numbers.iter().enumerate() {
        println!("  {}: {}", index, number);
    }

    // Iterate and modify
    let mut numbers = vec![1, 2, 3, 4, 5];
    println!("Before modification: {:?}", numbers);

    for number in &mut numbers {
        *number *= 2;  // Double each number
    }

    println!("After modification: {:?}", numbers);

    // Iterate with conditions
    println!("Even numbers:");
    for number in &numbers {
        if number % 2 == 0 {
            println!("  {}", number);
        }
    }
}
```

**Explanation**:

- `for number in &numbers` iterates over references to elements
- `enumerate()` provides both index and value
- `for number in &mut numbers` allows modification of elements
- `*number` dereferences the mutable reference
- Iteration is efficient and idiomatic in Rust

**Why**: Iteration is fundamental to working with vector data.

### Advanced Iteration

**What**: Advanced iteration includes filtering, mapping, and other functional operations.

**Why**: Understanding advanced iteration is important because:

- **Functional programming** enables powerful data transformations
- **Performance** provides efficient processing of large datasets
- **Readability** makes code more concise and expressive
- **Common patterns** in modern Rust applications

**When**: Use advanced iteration when you need to transform or filter vector data.

**How**: Here's how to use advanced iteration:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Filter even numbers
    let even_numbers: Vec<i32> = numbers.iter()
        .filter(|&x| x % 2 == 0)
        .cloned()
        .collect();
    println!("Even numbers: {:?}", even_numbers);

    // Map to squares
    let squares: Vec<i32> = numbers.iter()
        .map(|x| x * x)
        .collect();
    println!("Squares: {:?}", squares);

    // Filter and map in one chain
    let even_squares: Vec<i32> = numbers.iter()
        .filter(|&x| x % 2 == 0)
        .map(|x| x * x)
        .collect();
    println!("Even squares: {:?}", even_squares);

    // Sum all numbers
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);

    // Find maximum
    let max = numbers.iter().max();
    println!("Maximum: {:?}", max);

    // Count elements
    let count = numbers.iter().count();
    println!("Count: {}", count);

    // Check if any element satisfies condition
    let has_even = numbers.iter().any(|&x| x % 2 == 0);
    println!("Has even numbers: {}", has_even);

    // Check if all elements satisfy condition
    let all_positive = numbers.iter().all(|&x| x > 0);
    println!("All positive: {}", all_positive);
}
```

**Explanation**:

- `filter()` keeps only elements that satisfy the condition
- `map()` transforms each element
- `cloned()` converts references to owned values
- `collect()` gathers results into a new vector
- `sum()`, `max()`, `count()` are reduction operations
- `any()` and `all()` are boolean operations

**Why**: Advanced iteration provides powerful tools for data processing.

## Understanding Vector Memory Management

### Ownership and Borrowing

**What**: Vectors follow Rust's ownership rules, affecting how they can be used and passed around.

**Why**: Understanding ownership is important because:

- **Memory safety** prevents use-after-free and double-free errors
- **Performance** enables efficient memory management
- **Rust fundamentals** essential for understanding the language
- **Common patterns** needed for working with vectors

**When**: Use ownership knowledge when passing vectors between functions.

**How**: Here's how ownership works with vectors:

```rust
fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];

    // Borrowing for reading
    print_vector(&numbers);

    // Borrowing for modification
    modify_vector(&mut numbers);
    println!("After modification: {:?}", numbers);

    // Moving ownership
    let moved_numbers = take_ownership(numbers);
    println!("Moved vector: {:?}", moved_numbers);

    // This would cause a compile error:
    // println!("{:?}", numbers);  // Error: use after move
}

fn print_vector(vec: &Vec<i32>) {
    println!("Vector: {:?}", vec);
}

fn modify_vector(vec: &mut Vec<i32>) {
    vec.push(6);
    vec.push(7);
}

fn take_ownership(vec: Vec<i32>) -> Vec<i32> {
    println!("Taking ownership of: {:?}", vec);
    vec  // Return the vector
}
```

**Explanation**:

- `&numbers` creates an immutable reference
- `&mut numbers` creates a mutable reference
- `take_ownership(numbers)` moves the vector
- After moving, the original variable is no longer valid
- References allow borrowing without taking ownership

**Why**: Understanding ownership is crucial for working with vectors safely.

### Memory Layout

**What**: Vectors store data on the heap with a pointer, length, and capacity on the stack.

**Why**: Understanding memory layout is important because:

- **Performance** helps you understand vector behavior
- **Memory efficiency** enables better resource management
- **Debugging** aids in troubleshooting vector issues
- **Advanced usage** for performance-critical applications

**When**: Use memory layout knowledge for performance optimization.

**How**: Here's how vector memory layout works:

```rust
fn main() {
    let mut numbers = Vec::new();

    println!("Initial state:");
    println!("  Length: {}", numbers.len());
    println!("  Capacity: {}", numbers.capacity());
    println!("  Pointer: {:p}", numbers.as_ptr());

    // Add elements and observe capacity changes
    for i in 1..=10 {
        numbers.push(i);
        println!("After adding {}: len={}, cap={}", i, numbers.len(), numbers.capacity());
    }

    // Shrink to fit
    numbers.shrink_to_fit();
    println!("After shrink_to_fit: len={}, cap={}", numbers.len(), numbers.capacity());

    // Reserve additional capacity
    numbers.reserve(20);
    println!("After reserve(20): len={}, cap={}", numbers.len(), numbers.capacity());
}
```

**Explanation**:

- `len()` returns the number of elements
- `capacity()` returns the allocated capacity
- `as_ptr()` returns the pointer to the heap data
- Capacity grows automatically as needed
- `shrink_to_fit()` reduces capacity to match length
- `reserve()` pre-allocates additional capacity

**Why**: Understanding memory layout helps optimize vector performance.

## Common Vector Patterns

### Building Vectors

**What**: Common patterns for constructing vectors from various data sources.

**Why**: Understanding building patterns is important because:

- **Efficiency** provides optimal ways to create vectors
- **Readability** makes code more maintainable
- **Performance** avoids unnecessary allocations
- **Common usage** in real-world applications

**When**: Use building patterns when creating vectors from data.

**How**: Here's how to build vectors efficiently:

```rust
fn main() {
    // Build from range
    let numbers: Vec<i32> = (1..=10).collect();
    println!("Range: {:?}", numbers);

    // Build from array
    let array = [1, 2, 3, 4, 5];
    let vector: Vec<i32> = array.iter().cloned().collect();
    println!("From array: {:?}", vector);

    // Build with condition
    let even_numbers: Vec<i32> = (1..=20)
        .filter(|&x| x % 2 == 0)
        .collect();
    println!("Even numbers: {:?}", even_numbers);

    // Build with transformation
    let squares: Vec<i32> = (1..=5)
        .map(|x| x * x)
        .collect();
    println!("Squares: {:?}", squares);

    // Build incrementally
    let mut result = Vec::new();
    for i in 1..=5 {
        if i % 2 == 0 {
            result.push(i * i);
        }
    }
    println!("Incremental: {:?}", result);
}
```

**Explanation**:

- `(1..=10).collect()` creates a vector from a range
- `array.iter().cloned().collect()` converts an array to a vector
- `filter()` and `map()` can be chained for complex transformations
- Incremental building allows conditional logic
- `collect()` is the key method for gathering results

**Why**: Building patterns provide efficient ways to create vectors from data.

### Searching and Filtering

**What**: Common patterns for finding and filtering elements in vectors.

**Why**: Understanding search patterns is important because:

- **Data processing** enables you to find specific elements
- **Performance** different methods have different characteristics
- **Common operations** essential for most applications
- **Flexibility** supports various search needs

**When**: Use search patterns when you need to find or filter elements.

**How**: Here's how to search and filter vectors:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    // Find first occurrence
    if let Some(pos) = numbers.iter().position(|&x| x == 5) {
        println!("Found 5 at position: {}", pos);
    }

    // Find last occurrence
    if let Some(pos) = numbers.iter().rposition(|&x| x == 5) {
        println!("Found 5 at position (from end): {}", pos);
    }

    // Find element
    if let Some(&value) = numbers.iter().find(|&x| x > 7) {
        println!("First value > 7: {}", value);
    }

    // Filter elements
    let even_numbers: Vec<i32> = numbers.iter()
        .filter(|&x| x % 2 == 0)
        .cloned()
        .collect();
    println!("Even numbers: {:?}", even_numbers);

    // Partition elements
    let (even, odd): (Vec<i32>, Vec<i32>) = numbers.iter()
        .partition(|&x| x % 2 == 0);
    println!("Even: {:?}, Odd: {:?}", even, odd);

    // Check conditions
    let all_positive = numbers.iter().all(|&x| x > 0);
    let any_negative = numbers.iter().any(|&x| x < 0);
    println!("All positive: {}, Any negative: {}", all_positive, any_negative);
}
```

**Explanation**:

- `position()` finds the index of the first matching element
- `rposition()` finds the index from the end
- `find()` returns the first matching element
- `filter()` keeps only elements that satisfy the condition
- `partition()` splits elements into two groups
- `all()` and `any()` check conditions on all elements

**Why**: Search patterns provide powerful tools for finding and filtering data.

## Practice Exercises

### Exercise 1: Number Statistics

**What**: Calculate statistics for a vector of numbers.

**How**: Implement this exercise:

```rust
fn main() {
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let sum: i32 = numbers.iter().sum();
    let average = sum as f64 / numbers.len() as f64;
    let max = numbers.iter().max().unwrap();
    let min = numbers.iter().min().unwrap();

    println!("Numbers: {:?}", numbers);
    println!("Sum: {}", sum);
    println!("Average: {:.2}", average);
    println!("Max: {}", max);
    println!("Min: {}", min);
}
```

### Exercise 2: Word Counter

**What**: Count words in a text using vectors.

**How**: Implement this exercise:

```rust
fn main() {
    let text = "hello world hello rust world";
    let words: Vec<&str> = text.split_whitespace().collect();

    println!("Text: {}", text);
    println!("Words: {:?}", words);
    println!("Word count: {}", words.len());

    // Count unique words
    let mut unique_words = Vec::new();
    for word in &words {
        if !unique_words.contains(word) {
            unique_words.push(word);
        }
    }
    println!("Unique words: {:?}", unique_words);
    println!("Unique word count: {}", unique_words.len());
}
```

### Exercise 3: Prime Number Generator

**What**: Generate prime numbers using vectors.

**How**: Implement this exercise:

```rust
fn main() {
    let limit = 50;
    let mut primes = Vec::new();

    for num in 2..=limit {
        let is_prime = (2..num).all(|i| num % i != 0);
        if is_prime {
            primes.push(num);
        }
    }

    println!("Prime numbers up to {}: {:?}", limit, primes);
    println!("Count: {}", primes.len());
}
```

## Key Takeaways

**What** you've learned about vectors:

1. **Vector Creation** - How to create empty vectors, vectors with values, and vectors with capacity
2. **Element Operations** - How to add, remove, and access elements safely
3. **Iteration** - How to iterate over vectors with various methods
4. **Memory Management** - How ownership and borrowing work with vectors
5. **Common Patterns** - How to build, search, and filter vectors effectively
6. **Performance** - How to optimize vector usage for better performance
7. **Safety** - How Rust's type system prevents common vector errors

**Why** these concepts matter:

- **Dynamic collections** are essential for most Rust applications
- **Memory safety** prevents common programming errors
- **Performance** enables efficient data processing
- **Flexibility** supports various programming patterns

## Next Steps

Now that you understand vectors, you're ready to learn about:

- **HashMaps** - Key-value storage with fast lookups
- **HashSets** - Unique element storage
- **String handling** - Working with text data
- **Advanced collections** - More complex data structures

**Where** to go next: Continue with the next lesson on "HashMaps" to learn about key-value storage in Rust!
