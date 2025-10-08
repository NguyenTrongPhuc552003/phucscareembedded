---
sidebar_position: 3
---

# HashSets Basics

Master unique element storage in Rust with comprehensive explanations using the 4W+H framework.

## What Are HashSets in Rust?

**What**: HashSets (`HashSet<T>`) are collections that store unique elements using a hash table. They provide fast membership testing, insertion, and deletion operations, ensuring that each element appears only once in the collection.

**Why**: Understanding HashSets is crucial because:

- **Unique storage** ensures no duplicate elements in the collection
- **Fast membership testing** provides O(1) average time complexity for lookups
- **Set operations** enable mathematical set operations (union, intersection, difference)
- **Performance** offers optimal time complexity for common operations
- **Data deduplication** automatically removes duplicate values
- **Efficient filtering** provides fast membership checks
- **Algorithm implementation** supports many algorithms requiring unique elements

**When**: Use HashSets when you need to:

- Store unique elements without duplicates
- Perform fast membership testing
- Implement set operations (union, intersection, difference)
- Remove duplicates from collections
- Track unique items or states
- Implement algorithms requiring unique elements
- Cache unique values for performance

**How**: HashSets work in Rust by:

- **Hash function** computing hash values for elements
- **Uniqueness constraint** preventing duplicate elements
- **Fast lookups** using hash table for O(1) average access
- **Ownership** following Rust's ownership rules
- **Memory safety** preventing common hash table issues

**Where**: HashSets are used throughout Rust programs for data deduplication, caching, algorithm implementation, and set operations.

## Understanding HashSet Creation

### Creating Empty HashSets

**What**: Empty HashSets are created when you want to build the collection incrementally or don't know the initial data.

**Why**: Understanding empty HashSet creation is important because:

- **Dynamic building** allows you to add elements as needed
- **Memory efficiency** starts with minimal memory allocation
- **Flexibility** enables various construction patterns
- **Common pattern** in many Rust applications

**When**: Use empty HashSets when you need to build collections incrementally.

**How**: Here's how to create empty HashSets:

```rust
use std::collections::HashSet;

fn main() {
    // Create empty HashSet with type annotations
    let mut numbers: HashSet<i32> = HashSet::new();
    println!("Empty HashSet: {:?}", numbers);

    // Create empty HashSet using new()
    let mut words: HashSet<String> = HashSet::new();
    println!("Empty words HashSet: {:?}", words);

    // Add elements
    numbers.insert(1);
    numbers.insert(2);
    numbers.insert(3);
    numbers.insert(2);  // Duplicate - won't be added
    println!("After adding numbers: {:?}", numbers);

    words.insert("hello".to_string());
    words.insert("world".to_string());
    words.insert("rust".to_string());
    words.insert("hello".to_string());  // Duplicate - won't be added
    println!("After adding words: {:?}", words);
}
```

**Explanation**:

- `HashSet::new()` creates an empty HashSet with no elements
- Type annotations `HashSet<i32>` specify the element type
- `insert(element)` adds elements to the HashSet
- Duplicate elements are automatically ignored
- `{:?}` format specifier prints the HashSet contents

**Why**: Empty HashSets provide a foundation for building unique collections dynamically.

### Creating HashSets with Initial Values

**What**: HashSets can be created with initial elements using the `from()` method or iterator methods.

**Why**: Understanding HashSet initialization is important because:

- **Convenience** allows you to create HashSets with known initial data
- **Performance** avoids multiple insert operations
- **Readability** makes code more concise and clear
- **Common pattern** in many Rust applications

**When**: Use initial values when you know the starting elements for your HashSet.

**How**: Here's how to create HashSets with initial values:

```rust
use std::collections::HashSet;

fn main() {
    // Create HashSet from array
    let numbers = HashSet::from([1, 2, 3, 4, 5]);
    println!("Numbers: {:?}", numbers);

    // Create HashSet from vector
    let colors = vec!["red", "green", "blue", "yellow"];
    let color_set: HashSet<&str> = colors.into_iter().collect();
    println!("Colors: {:?}", color_set);

    // Create HashSet with calculated values
    let mut squares = HashSet::new();
    for i in 1..=5 {
        squares.insert(i * i);
    }
    println!("Squares: {:?}", squares);

    // Create HashSet from iterator with transformation
    let words = vec!["hello", "world", "rust", "programming"];
    let word_lengths: HashSet<usize> = words
        .iter()
        .map(|word| word.len())
        .collect();
    println!("Word lengths: {:?}", word_lengths);

    // Create HashSet from string characters
    let text = "hello world";
    let unique_chars: HashSet<char> = text.chars().collect();
    println!("Unique characters: {:?}", unique_chars);
}
```

**Explanation**:

- `HashSet::from([...])` creates a HashSet from an array
- `colors.into_iter().collect()` converts a vector to a HashSet
- `map()` transforms data during collection
- `text.chars().collect()` creates a HashSet from string characters
- Duplicate elements are automatically removed during collection

**Why**: Initial values provide convenient ways to create HashSets with known data.

### Creating HashSets with Capacity

**What**: HashSets can be created with a specified initial capacity to avoid reallocations.

**Why**: Understanding capacity is important because:

- **Performance optimization** reduces memory reallocations
- **Memory efficiency** prevents unnecessary allocations
- **Predictable behavior** when you know the approximate size
- **Advanced usage** for performance-critical applications

**When**: Use capacity when you know the approximate number of elements.

**How**: Here's how to create HashSets with capacity:

```rust
use std::collections::HashSet;

fn main() {
    // Create HashSet with specific capacity
    let mut numbers: HashSet<i32> = HashSet::with_capacity(10);
    println!("Initial capacity: {}", numbers.capacity());
    println!("Initial length: {}", numbers.len());

    // Add elements and observe capacity changes
    for i in 1..=15 {
        numbers.insert(i);
        println!("After adding {}: len={}, cap={}", i, numbers.len(), numbers.capacity());
    }

    // Create HashSet with capacity and initial values
    let mut words = HashSet::with_capacity(5);
    words.insert("hello".to_string());
    words.insert("world".to_string());
    words.insert("rust".to_string());

    println!("Words: {:?}", words);
    println!("Final capacity: {}", words.capacity());
}
```

**Explanation**:

- `HashSet::with_capacity(10)` creates a HashSet with capacity for 10 elements
- `capacity()` returns the current capacity
- `len()` returns the current number of elements
- Capacity may grow beyond the initial value as needed
- This prevents multiple reallocations during growth

**Why**: Capacity optimization is important for performance-critical applications.

## Understanding HashSet Operations

### Adding and Removing Elements

**What**: HashSets support various methods for adding and removing elements while maintaining uniqueness.

**Why**: Understanding element operations is important because:

- **Data management** allows you to store and remove elements
- **Uniqueness** ensures no duplicate elements
- **Common operations** essential for using HashSets
- **Performance** different methods have different characteristics

**When**: Use element operations when you need to manage elements in your HashSet.

**How**: Here's how to add and remove elements in HashSets:

```rust
use std::collections::HashSet;

fn main() {
    let mut numbers = HashSet::new();

    // Insert elements
    numbers.insert(1);
    numbers.insert(2);
    numbers.insert(3);
    println!("After initial inserts: {:?}", numbers);

    // Insert duplicate (won't be added)
    let was_inserted = numbers.insert(2);
    println!("Was 2 inserted? {}", was_inserted);
    println!("After duplicate insert: {:?}", numbers);

    // Insert new element
    let was_inserted = numbers.insert(4);
    println!("Was 4 inserted? {}", was_inserted);
    println!("After new insert: {:?}", numbers);

    // Remove element
    let was_removed = numbers.remove(&2);
    println!("Was 2 removed? {}", was_removed);
    println!("After removing 2: {:?}", numbers);

    // Remove non-existent element
    let was_removed = numbers.remove(&5);
    println!("Was 5 removed? {}", was_removed);
    println!("After removing 5: {:?}", numbers);

    // Clear all elements
    numbers.clear();
    println!("After clear: {:?}", numbers);
    println!("Is empty: {}", numbers.is_empty());
}
```

**Explanation**:

- `insert(element)` adds an element and returns `true` if it was new
- `insert()` returns `false` if the element already existed
- `remove(&element)` removes an element and returns `true` if it existed
- `remove()` returns `false` if the element didn't exist
- `clear()` removes all elements from the HashSet

**Why**: Different element methods provide flexibility for various scenarios.

### Membership Testing

**What**: HashSets provide fast membership testing to check if elements exist in the collection.

**Why**: Understanding membership testing is important because:

- **Fast lookups** provide O(1) average time complexity for membership checks
- **Common operations** essential for using HashSet data
- **Performance** different methods have different characteristics
- **Safety** prevents panics from missing elements

**When**: Use membership testing when you need to check if elements exist in your HashSet.

**How**: Here's how to test membership in HashSets:

```rust
use std::collections::HashSet;

fn main() {
    let mut numbers = HashSet::new();
    numbers.insert(1);
    numbers.insert(2);
    numbers.insert(3);

    // Check if element exists
    if numbers.contains(&2) {
        println!("2 is in the HashSet");
    } else {
        println!("2 is not in the HashSet");
    }

    // Check for non-existent element
    if numbers.contains(&5) {
        println!("5 is in the HashSet");
    } else {
        println!("5 is not in the HashSet");
    }

    // Check multiple elements
    let test_numbers = [1, 2, 5, 6];
    for num in test_numbers {
        if numbers.contains(&num) {
            println!("{} is in the HashSet", num);
        } else {
            println!("{} is not in the HashSet", num);
        }
    }

    // Check if all elements from a collection are in the HashSet
    let subset = [1, 2];
    let all_present = subset.iter().all(|&x| numbers.contains(&x));
    println!("Are all elements from subset present? {}", all_present);

    // Check if any elements from a collection are in the HashSet
    let candidates = [3, 4, 5];
    let any_present = candidates.iter().any(|&x| numbers.contains(&x));
    println!("Are any elements from candidates present? {}", any_present);
}
```

**Explanation**:

- `contains(&element)` returns `true` if the element exists
- `contains()` returns `false` if the element doesn't exist
- `all()` checks if all elements satisfy a condition
- `any()` checks if any elements satisfy a condition
- Membership testing is very fast (O(1) average)

**Why**: Fast membership testing is essential for many algorithms and data processing tasks.

### Set Operations

**What**: HashSets support mathematical set operations like union, intersection, and difference.

**Why**: Understanding set operations is important because:

- **Mathematical operations** enable complex set manipulations
- **Data analysis** allows you to compare and combine datasets
- **Algorithm implementation** supports many algorithms requiring set operations
- **Performance** provides efficient set operations

**When**: Use set operations when you need to combine or compare HashSets.

**How**: Here's how to perform set operations on HashSets:

```rust
use std::collections::HashSet;

fn main() {
    let set1: HashSet<i32> = [1, 2, 3, 4, 5].iter().cloned().collect();
    let set2: HashSet<i32> = [4, 5, 6, 7, 8].iter().cloned().collect();

    println!("Set 1: {:?}", set1);
    println!("Set 2: {:?}", set2);

    // Union - elements in either set
    let union: HashSet<i32> = set1.union(&set2).cloned().collect();
    println!("Union: {:?}", union);

    // Intersection - elements in both sets
    let intersection: HashSet<i32> = set1.intersection(&set2).cloned().collect();
    println!("Intersection: {:?}", intersection);

    // Difference - elements in set1 but not in set2
    let difference: HashSet<i32> = set1.difference(&set2).cloned().collect();
    println!("Difference (set1 - set2): {:?}", difference);

    // Symmetric difference - elements in either set but not both
    let symmetric_diff: HashSet<i32> = set1.symmetric_difference(&set2).cloned().collect();
    println!("Symmetric difference: {:?}", symmetric_diff);

    // Check if one set is a subset of another
    let subset = [1, 2, 3];
    let is_subset = subset.iter().all(|&x| set1.contains(&x));
    println!("Is [1, 2, 3] a subset of set1? {}", is_subset);

    // Check if sets are disjoint (no common elements)
    let set3: HashSet<i32> = [9, 10, 11].iter().cloned().collect();
    let is_disjoint = set1.is_disjoint(&set3);
    println!("Are set1 and set3 disjoint? {}", is_disjoint);
}
```

**Explanation**:

- `union(&other)` returns elements in either set
- `intersection(&other)` returns elements in both sets
- `difference(&other)` returns elements in the first set but not the second
- `symmetric_difference(&other)` returns elements in either set but not both
- `is_disjoint(&other)` checks if sets have no common elements

**Why**: Set operations provide powerful tools for data analysis and algorithm implementation.

## Understanding HashSet Iteration

### Basic Iteration

**What**: Iteration allows you to process each element in a HashSet efficiently.

**Why**: Understanding iteration is important because:

- **Data processing** enables you to work with all elements
- **Performance** provides efficient access to HashSet contents
- **Common pattern** essential for most HashSet operations
- **Flexibility** supports various processing needs

**When**: Use iteration when you need to process all elements in a HashSet.

**How**: Here's how to iterate over HashSets:

```rust
use std::collections::HashSet;

fn main() {
    let mut numbers = HashSet::new();
    numbers.insert(1);
    numbers.insert(2);
    numbers.insert(3);
    numbers.insert(4);
    numbers.insert(5);

    // Iterate over all elements
    println!("All numbers:");
    for number in &numbers {
        println!("  {}", number);
    }

    // Iterate and modify elements (if mutable)
    let mut squares = HashSet::new();
    for number in &numbers {
        squares.insert(number * number);
    }
    println!("Squares: {:?}", squares);

    // Iterate with conditions
    println!("Even numbers:");
    for number in &numbers {
        if number % 2 == 0 {
            println!("  {}", number);
        }
    }

    // Iterate with transformation
    let doubled: HashSet<i32> = numbers.iter().map(|&x| x * 2).collect();
    println!("Doubled numbers: {:?}", doubled);

    // Iterate with filtering
    let evens: HashSet<i32> = numbers.iter().filter(|&&x| x % 2 == 0).cloned().collect();
    println!("Even numbers: {:?}", evens);
}
```

**Explanation**:

- `for number in &numbers` iterates over all elements
- `numbers.iter()` creates an iterator over the HashSet
- `map()` transforms each element
- `filter()` keeps only elements that satisfy a condition
- `collect()` converts the iterator back to a HashSet

**Why**: Iteration is fundamental to working with HashSet data.

### Advanced Iteration

**What**: Advanced iteration includes functional operations and complex transformations.

**Why**: Understanding advanced iteration is important because:

- **Functional programming** enables powerful data transformations
- **Performance** provides efficient processing of large datasets
- **Readability** makes code more concise and expressive
- **Common patterns** in modern Rust applications

**When**: Use advanced iteration when you need to transform or filter HashSet data.

**How**: Here's how to use advanced iteration:

```rust
use std::collections::HashSet;

fn main() {
    let numbers: HashSet<i32> = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].iter().cloned().collect();

    // Filter and transform
    let even_squares: HashSet<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .map(|&x| x * x)
        .collect();
    println!("Even squares: {:?}", even_squares);

    // Find maximum and minimum
    let max = numbers.iter().max();
    let min = numbers.iter().min();
    println!("Max: {:?}, Min: {:?}", max, min);

    // Calculate sum and count
    let sum: i32 = numbers.iter().sum();
    let count = numbers.len();
    let average = sum as f64 / count as f64;
    println!("Sum: {}, Count: {}, Average: {:.2}", sum, count, average);

    // Check conditions
    let all_positive = numbers.iter().all(|&x| x > 0);
    let any_even = numbers.iter().any(|&x| x % 2 == 0);
    println!("All positive: {}, Any even: {}", all_positive, any_even);

    // Partition elements
    let (evens, odds): (HashSet<i32>, HashSet<i32>) = numbers
        .iter()
        .partition(|&&x| x % 2 == 0);
    println!("Evens: {:?}, Odds: {:?}", evens, odds);
}
```

**Explanation**:

- `filter()` keeps only elements that satisfy the condition
- `map()` transforms each element
- `max()`, `min()`, `sum()` are reduction operations
- `all()`, `any()` check conditions on all elements
- `partition()` splits elements into two groups

**Why**: Advanced iteration provides powerful tools for data processing.

## Understanding HashSet Memory Management

### Ownership and Borrowing

**What**: HashSets follow Rust's ownership rules, affecting how they can be used and passed around.

**Why**: Understanding ownership is important because:

- **Memory safety** prevents use-after-free and double-free errors
- **Performance** enables efficient memory management
- **Rust fundamentals** essential for understanding the language
- **Common patterns** needed for working with HashSets

**When**: Use ownership knowledge when passing HashSets between functions.

**How**: Here's how ownership works with HashSets:

```rust
use std::collections::HashSet;

fn main() {
    let mut numbers = HashSet::new();
    numbers.insert(1);
    numbers.insert(2);
    numbers.insert(3);

    // Borrowing for reading
    print_numbers(&numbers);

    // Borrowing for modification
    modify_numbers(&mut numbers);
    println!("After modification: {:?}", numbers);

    // Moving ownership
    let moved_numbers = take_ownership(numbers);
    println!("Moved numbers: {:?}", moved_numbers);

    // This would cause a compile error:
    // println!("{:?}", numbers);  // Error: use after move
}

fn print_numbers(numbers: &HashSet<i32>) {
    println!("Numbers: {:?}", numbers);
}

fn modify_numbers(numbers: &mut HashSet<i32>) {
    numbers.insert(4);
    numbers.insert(5);
}

fn take_ownership(numbers: HashSet<i32>) -> HashSet<i32> {
    println!("Taking ownership of: {:?}", numbers);
    numbers  // Return the HashSet
}
```

**Explanation**:

- `&numbers` creates an immutable reference
- `&mut numbers` creates a mutable reference
- `take_ownership(numbers)` moves the HashSet
- After moving, the original variable is no longer valid
- References allow borrowing without taking ownership

**Why**: Understanding ownership is crucial for working with HashSets safely.

### Element Ownership

**What**: HashSets take ownership of elements, affecting how they can be used.

**Why**: Understanding element ownership is important because:

- **Memory management** affects how data is stored and accessed
- **Performance** influences the choice of element types
- **Common patterns** needed for working with different data types
- **Rust fundamentals** essential for understanding HashSet behavior

**When**: Use ownership knowledge when choosing element types.

**How**: Here's how element ownership works:

```rust
use std::collections::HashSet;

fn main() {
    // String elements (owned)
    let mut owned_words = HashSet::new();
    owned_words.insert("hello".to_string());
    owned_words.insert("world".to_string());

    // String slice elements (borrowed)
    let mut borrowed_words = HashSet::new();
    borrowed_words.insert("hello");
    borrowed_words.insert("world");

    // Integer elements (copied)
    let mut int_numbers = HashSet::new();
    int_numbers.insert(1);
    int_numbers.insert(2);

    // Mixed ownership
    let mut mixed_data = HashSet::new();
    mixed_data.insert("hello".to_string());
    mixed_data.insert("world".to_string());

    println!("Owned words: {:?}", owned_words);
    println!("Borrowed words: {:?}", borrowed_words);
    println!("Int numbers: {:?}", int_numbers);
    println!("Mixed data: {:?}", mixed_data);

    // Accessing elements
    let hello_exists = owned_words.contains("hello");
    let world_exists = borrowed_words.contains("world");
    let one_exists = int_numbers.contains(&1);

    println!("Hello exists: {}", hello_exists);
    println!("World exists: {}", world_exists);
    println!("One exists: {}", one_exists);
}
```

**Explanation**:

- `String` elements are owned by the HashSet
- `&str` elements are borrowed (string literals)
- `i32` elements are copied (implement Copy trait)
- Different element types have different ownership implications
- `contains()` works with the appropriate reference type

**Why**: Understanding element ownership helps choose appropriate types for your use case.

## Common HashSet Patterns

### Deduplication

**What**: Common patterns for removing duplicates from collections using HashSets.

**Why**: Understanding deduplication is important because:

- **Data cleaning** removes duplicate values from datasets
- **Performance** provides efficient deduplication
- **Common operations** essential for data processing
- **Memory efficiency** reduces storage requirements

**When**: Use deduplication when you need to remove duplicate values from collections.

**How**: Here's how to deduplicate data with HashSets:

```rust
use std::collections::HashSet;

fn main() {
    // Deduplicate numbers
    let numbers = vec![1, 2, 3, 2, 4, 3, 5, 1, 6];
    let unique_numbers: HashSet<i32> = numbers.into_iter().collect();
    println!("Unique numbers: {:?}", unique_numbers);

    // Deduplicate strings
    let words = vec!["hello", "world", "hello", "rust", "world", "programming"];
    let unique_words: HashSet<&str> = words.into_iter().collect();
    println!("Unique words: {:?}", unique_words);

    // Deduplicate with transformation
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let unique_squares: HashSet<i32> = numbers
        .iter()
        .map(|&x| x * x)
        .collect();
    println!("Unique squares: {:?}", unique_squares);

    // Deduplicate characters
    let text = "hello world";
    let unique_chars: HashSet<char> = text.chars().collect();
    println!("Unique characters: {:?}", unique_chars);

    // Deduplicate with condition
    let numbers = vec![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let unique_evens: HashSet<i32> = numbers
        .iter()
        .filter(|&&x| x % 2 == 0)
        .cloned()
        .collect();
    println!("Unique even numbers: {:?}", unique_evens);
}
```

**Explanation**:

- `numbers.into_iter().collect()` removes duplicates automatically
- `words.into_iter().collect()` deduplicates string slices
- `map()` transforms data before deduplication
- `filter()` applies conditions before deduplication
- HashSets automatically handle uniqueness

**Why**: Deduplication is essential for data cleaning and analysis.

### Caching and Memoization

**What**: Common patterns for using HashSets as caches and for memoization.

**Why**: Understanding caching patterns is important because:

- **Performance** provides fast lookups for computed values
- **Memory efficiency** avoids recomputing expensive operations
- **Common operations** essential for optimization
- **Algorithm implementation** supports many algorithms requiring caching

**When**: Use caching patterns when you need to store computed results for reuse.

**How**: Here's how to use HashSets for caching:

```rust
use std::collections::HashSet;

fn main() {
    // Cache computed values
    let mut computed_squares = HashSet::new();
    let mut computed_cubes = HashSet::new();

    for i in 1..=10 {
        let square = i * i;
        let cube = i * i * i;

        if !computed_squares.contains(&square) {
            computed_squares.insert(square);
            println!("Computed square: {}", square);
        }

        if !computed_cubes.contains(&cube) {
            computed_cubes.insert(cube);
            println!("Computed cube: {}", cube);
        }
    }

    println!("Computed squares: {:?}", computed_squares);
    println!("Computed cubes: {:?}", computed_cubes);

    // Cache unique results
    let mut unique_results = HashSet::new();
    let functions = [|x| x * 2, |x| x * 3, |x| x * 4];

    for i in 1..=5 {
        for func in &functions {
            let result = func(i);
            if unique_results.insert(result) {
                println!("New unique result: {}", result);
            }
        }
    }

    println!("Unique results: {:?}", unique_results);
}
```

**Explanation**:

- `computed_squares.contains(&square)` checks if value was already computed
- `unique_results.insert(result)` adds new results and returns `true` if new
- Caching prevents recomputing expensive operations
- HashSets provide fast lookup for cached values

**Why**: Caching patterns are essential for performance optimization.

## Practice Exercises

### Exercise 1: Unique Words

**What**: Find unique words in a text using a HashSet.

**How**: Implement this exercise:

```rust
use std::collections::HashSet;

fn main() {
    let text = "hello world hello rust world programming rust";
    let words: Vec<&str> = text.split_whitespace().collect();

    let unique_words: HashSet<&str> = words.into_iter().collect();

    println!("Text: {}", text);
    println!("Unique words: {:?}", unique_words);
    println!("Number of unique words: {}", unique_words.len());

    // Check if specific words are unique
    let test_words = ["hello", "world", "rust", "python"];
    for word in test_words {
        if unique_words.contains(word) {
            println!("'{}' is in the text", word);
        } else {
            println!("'{}' is not in the text", word);
        }
    }
}
```

### Exercise 2: Set Operations

**What**: Perform set operations on two HashSets.

**How**: Implement this exercise:

```rust
use std::collections::HashSet;

fn main() {
    let set1: HashSet<i32> = [1, 2, 3, 4, 5].iter().cloned().collect();
    let set2: HashSet<i32> = [4, 5, 6, 7, 8].iter().cloned().collect();

    println!("Set 1: {:?}", set1);
    println!("Set 2: {:?}", set2);

    // Union
    let union: HashSet<i32> = set1.union(&set2).cloned().collect();
    println!("Union: {:?}", union);

    // Intersection
    let intersection: HashSet<i32> = set1.intersection(&set2).cloned().collect();
    println!("Intersection: {:?}", intersection);

    // Difference
    let difference: HashSet<i32> = set1.difference(&set2).cloned().collect();
    println!("Difference (set1 - set2): {:?}", difference);

    // Symmetric difference
    let symmetric_diff: HashSet<i32> = set1.symmetric_difference(&set2).cloned().collect();
    println!("Symmetric difference: {:?}", symmetric_diff);
}
```

### Exercise 3: Prime Numbers

**What**: Find prime numbers using a HashSet for efficient lookup.

**How**: Implement this exercise:

```rust
use std::collections::HashSet;

fn main() {
    let limit = 50;
    let mut primes = HashSet::new();

    for num in 2..=limit {
        let mut is_prime = true;

        for i in 2..num {
            if num % i == 0 {
                is_prime = false;
                break;
            }
        }

        if is_prime {
            primes.insert(num);
        }
    }

    println!("Prime numbers up to {}: {:?}", limit, primes);
    println!("Number of primes: {}", primes.len());

    // Check if specific numbers are prime
    let test_numbers = [17, 25, 29, 35, 37];
    for num in test_numbers {
        if primes.contains(&num) {
            println!("{} is prime", num);
        } else {
            println!("{} is not prime", num);
        }
    }
}
```

## Key Takeaways

**What** you've learned about HashSets:

1. **HashSet Creation** - How to create empty HashSets, HashSets with values, and HashSets with capacity
2. **Element Operations** - How to add, remove, and check elements safely
3. **Membership Testing** - How to test membership efficiently
4. **Set Operations** - How to perform union, intersection, and difference operations
5. **Iteration** - How to iterate over HashSets with various methods
6. **Memory Management** - How ownership and borrowing work with HashSets
7. **Common Patterns** - How to deduplicate data and implement caching
8. **Performance** - How to optimize HashSet usage for better performance

**Why** these concepts matter:

- **Unique storage** is essential for many programming scenarios
- **Fast lookups** enable efficient membership testing
- **Set operations** provide powerful data manipulation tools
- **Memory safety** prevents common programming errors

## Next Steps

Now that you understand HashSets, you're ready to learn about:

- **String handling** - Working with text data
- **Advanced collections** - More complex data structures
- **Performance optimization** - Efficient collection usage
- **Algorithm implementation** - Using collections in algorithms

**Where** to go next: Continue with the next lesson on "String Handling" to learn about working with text data in Rust!
