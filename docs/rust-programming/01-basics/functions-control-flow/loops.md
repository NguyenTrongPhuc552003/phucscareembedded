---
sidebar_position: 3
---

# Loops

Master repetition and iteration in Rust with comprehensive explanations using the 4W+H framework.

## What Are Loops?

**What**: Loops are control structures that allow you to repeat code multiple times. Rust provides three main types of loops: `loop`, `while`, and `for`.

**Why**: Loops are essential for:

- **Repeating operations** without writing duplicate code
- **Processing collections** of data efficiently
- **Implementing algorithms** that require iteration
- **Creating interactive programs** that run until completion
- **Handling user input** with validation loops

**When**: Use loops when you need to:

- Repeat code a specific number of times
- Process each item in a collection
- Continue until a condition is met
- Implement algorithms with iteration
- Create interactive user interfaces

## Understanding the Loop Statement

### Basic Loop

**What**: The `loop` keyword creates an infinite loop that runs until explicitly stopped with `break`.

**How**: Here's the fundamental syntax:

```rust
fn main() {
    let mut counter = 0;  // Mutable counter variable

    loop {  // Infinite loop
        counter += 1;  // Increment counter
        println!("Counter: {}", counter);

        if counter >= 5 {  // Exit condition
            break;  // Exit the loop
        }
    }
}
```

**Explanation**:

- `loop` creates an infinite loop that runs forever
- `counter += 1` increments the counter by 1
- `if counter >= 5` checks if we've reached our target
- `break` immediately exits the loop
- Without `break`, the loop would run forever

**Why**: Basic loops are useful for operations that need to run until a specific condition is met.

### Loop with Break and Continue

**What**: You can use `break` to exit a loop and `continue` to skip to the next iteration.

**How**: Here's how to control loop flow:

```rust
fn main() {
    let mut number = 0;

    loop {
        number += 1;  // Increment number

        if number % 2 == 0 {  // Check if even
            continue;  // Skip even numbers, go to next iteration
        }

        if number > 10 {  // Check if too large
            break;  // Exit loop completely
        }

        println!("Odd number: {}", number);  // Only prints odd numbers
    }
}
```

**Explanation**:

- `continue` skips the rest of the current iteration
- `break` exits the loop entirely
- Only odd numbers less than or equal to 10 are printed
- The loop processes numbers 1, 3, 5, 7, 9, then exits

**Why**: Break and continue give you fine-grained control over loop execution.

### Loop with Return Value

**What**: Loops can return values when they exit, making them useful as expressions.

**How**: Here's how to return values from loops:

```rust
fn main() {
    let mut counter = 0;

    let result = loop {  // Loop as an expression
        counter += 1;  // Increment counter

        if counter == 10 {  // Exit condition
            break counter * 2;  // Return value from loop
        }
    };

    println!("Result: {}", result);  // Prints: Result: 20
}
```

**Explanation**:

- The entire `loop` is an expression that returns a value
- `break counter * 2` returns `20` (10 \* 2)
- The result is assigned to the `result` variable
- This pattern is common for finding values through iteration

**Why**: Returning values from loops allows you to use loops in expressions and assignments.

### Nested Loops

**What**: You can place loops inside other loops to handle complex iteration patterns.

**How**: Here's how to use nested loops:

```rust
fn main() {
    let mut outer = 0;  // Outer loop counter

    loop {  // Outer loop
        outer += 1;  // Increment outer counter
        let mut inner = 0;  // Inner loop counter

        loop {  // Inner loop
            inner += 1;  // Increment inner counter
            println!("Outer: {}, Inner: {}", outer, inner);

            if inner >= 3 {  // Exit inner loop
                break;  // Break inner loop only
            }
        }

        if outer >= 2 {  // Exit outer loop
            break;  // Break outer loop
        }
    }
}
```

**Explanation**:

- The outer loop runs twice (outer = 1, 2)
- The inner loop runs 3 times for each outer iteration
- `break` in the inner loop only exits the inner loop
- `break` in the outer loop exits the entire nested structure
- This creates a 2x3 pattern of iterations

**Why**: Nested loops are useful for processing multi-dimensional data, matrices, and complex algorithms.

## Understanding While Loops

### Basic While Loop

**What**: While loops repeat code as long as a condition is true, automatically checking the condition before each iteration.

**How**: Here's the fundamental syntax:

```rust
fn main() {
    let mut number = 3;  // Start with 3

    while number != 0 {  // Continue while number is not 0
        println!("{}!", number);  // Print countdown
        number -= 1;  // Decrement number
    }

    println!("LIFTOFF!!!");  // Execute after loop
}
```

**Explanation**:

- `while number != 0` checks the condition before each iteration
- The loop continues as long as `number` is not equal to 0
- `number -= 1` decrements the number by 1
- The loop automatically stops when the condition becomes false
- Code after the loop executes when the condition is false

**Why**: While loops are perfect for countdowns, validation loops, and operations that continue until a condition changes.

### While with Simple Condition

**What**: You can use while loops with simple numeric conditions for controlled iteration.

**How**: Here's how to use while with a simple condition:

```rust
fn main() {
    let mut counter = 0;  // Start counter at 0

    while counter < 5 {  // Continue while counter is less than 5
        println!("Counter: {}", counter);  // Print current value
        counter += 1;  // Increment counter
    }
}
```

**Explanation**:

- `counter < 5` is the loop condition
- The loop runs 5 times (counter = 0, 1, 2, 3, 4)
- `counter += 1` increments the counter
- The loop stops when counter reaches 5
- This is equivalent to `for counter in 0..5`

**Why**: Simple while loops are useful for counting and controlled iteration.

### While with Multiple Conditions

**What**: You can combine multiple conditions using logical operators in while loops.

**How**: Here's how to use multiple conditions:

```rust
fn main() {
    let mut x = 0;  // First variable
    let mut y = 10;  // Second variable

    while x < 5 && y > 5 {  // Both conditions must be true
        println!("x: {}, y: {}", x, y);  // Print both values
        x += 1;  // Increment x
        y -= 1;  // Decrement y
    }
}
```

**Explanation**:

- `x < 5 && y > 5` requires both conditions to be true
- The loop continues as long as both conditions are met
- `x` increases while `y` decreases
- The loop stops when either condition becomes false
- This creates a synchronized countdown/countup

**Why**: Multiple conditions allow you to create complex loop logic with precise control.

### While with Break and Continue

**What**: You can use `break` and `continue` in while loops just like in `loop` statements.

**How**: Here's how to control while loop flow:

```rust
fn main() {
    let mut number = 0;  // Start at 0

    while number < 20 {  // Continue while less than 20
        number += 1;  // Increment number

        if number % 3 == 0 {  // Check if divisible by 3
            continue;  // Skip multiples of 3
        }

        if number > 15 {  // Check if too large
            break;  // Exit loop early
        }

        println!("Number: {}", number);  // Print valid numbers
    }
}
```

**Explanation**:

- The loop continues while `number < 20`
- `continue` skips multiples of 3
- `break` exits the loop when number exceeds 15
- Only numbers that are not multiples of 3 and ≤ 15 are printed
- This demonstrates early exit and skipping logic

**Why**: Break and continue in while loops provide flexible control over loop execution.

## Understanding For Loops

### Basic For Loop

**What**: For loops iterate over collections and ranges, providing the most common way to process data in Rust.

**How**: Here's the fundamental syntax:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];  // Array of numbers

    for number in numbers.iter() {  // Iterate over each number
        println!("Number: {}", number);  // Process each item
    }
}
```

**Explanation**:

- `numbers.iter()` creates an iterator over the array
- `for number in` assigns each item to the `number` variable
- The loop automatically handles the iteration
- No manual counter or index management needed
- The loop stops when all items are processed

**Why**: For loops are the most idiomatic way to iterate over collections in Rust.

### For Loop with Range

**What**: You can use for loops with numeric ranges to iterate over sequences of numbers.

**How**: Here's how to use ranges:

```rust
fn main() {
    // Range from 1 to 5 (exclusive) - 1..6
    for number in 1..6 {  // Numbers 1, 2, 3, 4, 5
        println!("Number: {}", number);
    }

    // Range from 1 to 5 (inclusive) - 1..=5
    for number in 1..=5 {  // Numbers 1, 2, 3, 4, 5
        println!("Number: {}", number);
    }
}
```

**Explanation**:

- `1..6` creates a range from 1 to 5 (exclusive of 6)
- `1..=5` creates a range from 1 to 5 (inclusive)
- The `..` operator excludes the end value
- The `..=` operator includes the end value
- Ranges are commonly used for counting and iteration

**Why**: Range-based for loops are perfect for counting, indexing, and numeric sequences.

### For Loop with Index

**What**: You can get both the index and value when iterating over collections.

**How**: Here's how to use enumerate:

```rust
fn main() {
    let fruits = ["apple", "banana", "orange"];  // Array of fruits

    for (index, fruit) in fruits.iter().enumerate() {  // Get index and value
        println!("{}: {}", index, fruit);  // Print index and fruit
    }
}
```

**Explanation**:

- `fruits.iter()` creates an iterator over the array
- `.enumerate()` adds index information to each item
- `(index, fruit)` destructures the tuple into index and value
- The index starts at 0 and increments automatically
- This pattern is common when you need both position and content

**Why**: Indexed iteration is useful for processing arrays with position-dependent logic.

### For Loop with Step

**What**: You can control the step size and direction of iteration.

**How**: Here's how to use step and reverse:

```rust
fn main() {
    // Count by 2s - step_by(2)
    for number in (1..=10).step_by(2) {  // Numbers 1, 3, 5, 7, 9
        println!("Even step: {}", number);
    }

    // Count backwards - rev()
    for number in (1..=5).rev() {  // Numbers 5, 4, 3, 2, 1
        println!("Countdown: {}", number);
    }
}
```

**Explanation**:

- `(1..=10).step_by(2)` creates a range that steps by 2
- `(1..=5).rev()` reverses the range to count backwards
- `step_by(2)` skips every other number
- `rev()` reverses the iteration order
- These methods can be chained for complex iteration patterns

**Why**: Step and reverse give you fine-grained control over iteration patterns.

## Understanding Loop Control

### Break with Label

**What**: Loop labels allow you to break out of nested loops by specifying which loop to exit.

**How**: Here's how to use labeled breaks:

```rust
fn main() {
    let mut count = 0;  // Outer loop counter

    'counting_up: loop {  // Label the outer loop
        println!("count = {}", count);
        let mut remaining = 10;  // Inner loop counter

        loop {  // Inner loop (no label)
            println!("remaining = {}", remaining);
            if remaining == 9 {  // Exit inner loop
                break;  // Break inner loop only
            }
            if count == 2 {  // Exit outer loop
                break 'counting_up;  // Break labeled outer loop
            }
            remaining -= 1;
        }

        count += 1;
    }

    println!("End count = {}", count);
}
```

**Explanation**:

- `'counting_up:` labels the outer loop
- `break;` exits the inner loop only
- `break 'counting_up;` exits the labeled outer loop
- Labels must start with a single quote (`'`)
- This allows precise control over nested loop exit

**Why**: Labeled breaks are essential for complex nested loop logic where you need to exit specific levels.

### Continue with Label

**What**: Loop labels also work with `continue` to control which loop iteration to skip to.

**How**: Here's how to use labeled continue:

```rust
fn main() {
    let mut x = 0;  // Outer loop variable
    let mut y = 0;  // Inner loop variable

    'outer: while x < 5 {  // Label the outer loop
        x += 1;  // Increment outer counter
        y = 0;  // Reset inner counter

        while y < 5 {  // Inner loop
            y += 1;  // Increment inner counter

            if y == 3 {  // Skip condition
                continue 'outer;  // Continue outer loop iteration
            }

            println!("x: {}, y: {}", x, y);  // Print valid combinations
        }
    }
}
```

**Explanation**:

- `'outer:` labels the outer while loop
- `continue 'outer;` skips to the next iteration of the outer loop
- This bypasses the rest of the inner loop
- The inner loop counter is reset on each outer iteration
- Only certain combinations of x and y are printed

**Why**: Labeled continue allows you to skip entire iterations of outer loops from inner loops.

## Common Loop Patterns

### Summing Numbers

**What**: Accumulating values by adding each element to a running total.

**How**: Here's how to sum numbers in a collection:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];  // Array of numbers
    let mut sum = 0;  // Running total

    for number in numbers.iter() {  // Iterate over each number
        sum += number;  // Add to running total
    }

    println!("Sum: {}", sum);  // Print final sum
}
```

**Explanation**:

- `sum` starts at 0 and accumulates values
- `sum += number` adds each number to the total
- The loop processes each element once
- This pattern is common in data analysis and statistics

**Why**: Summing is fundamental to many algorithms and data processing tasks.

### Finding Maximum

**What**: Finding the largest value in a collection by comparing each element.

**How**: Here's how to find the maximum value:

```rust
fn main() {
    let numbers = [3, 7, 1, 9, 4];  // Array of numbers
    let mut max = numbers[0];  // Start with first element

    for &number in numbers.iter() {  // Iterate over each number
        if number > max {  // Compare with current maximum
            max = number;  // Update maximum
        }
    }

    println!("Maximum: {}", max);  // Print result
}
```

**Explanation**:

- `max` starts with the first element
- `&number` dereferences the reference to get the value
- `if number > max` compares each element with the current maximum
- The maximum is updated whenever a larger value is found
- This pattern works for any comparable type

**Why**: Finding maximum values is common in data analysis, optimization, and algorithm design.

### Counting Elements

**What**: Counting how many elements meet a specific condition.

**How**: Here's how to count elements with a condition:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // Array of numbers
    let mut even_count = 0;  // Counter for even numbers

    for number in numbers.iter() {  // Iterate over each number
        if number % 2 == 0 {  // Check if even
            even_count += 1;  // Increment counter
        }
    }

    println!("Even numbers: {}", even_count);  // Print count
}
```

**Explanation**:

- `even_count` starts at 0 and counts matches
- `number % 2 == 0` checks if the number is even
- `even_count += 1` increments the counter for each match
- This pattern is useful for filtering and statistics

**Why**: Counting elements is essential for data analysis, validation, and reporting.

### String Processing

**What**: Processing text data character by character to analyze or transform strings.

**How**: Here's how to process strings:

```rust
fn main() {
    let text = "Hello, World!";  // String to process
    let mut vowel_count = 0;  // Counter for vowels

    for ch in text.chars() {  // Iterate over each character
        if "aeiouAEIOU".contains(ch) {  // Check if vowel
            vowel_count += 1;  // Increment counter
        }
    }

    println!("Vowels in '{}': {}", text, vowel_count);  // Print result
}
```

**Explanation**:

- `text.chars()` creates an iterator over characters
- `ch` represents each character in the string
- `"aeiouAEIOU".contains(ch)` checks if the character is a vowel
- This pattern is common in text processing and analysis

**Why**: String processing is essential for text analysis, parsing, and data cleaning.

## Working with Collections

### Vector Iteration

**What**: Vectors are dynamic arrays that can be modified during iteration.

**How**: Here's how to iterate and modify vectors:

```rust
fn main() {
    let mut numbers = vec![1, 2, 3, 4, 5];  // Mutable vector

    // Iterate and modify
    for number in numbers.iter_mut() {  // Mutable iterator
        *number *= 2;  // Double each number
    }

    println!("Doubled: {:?}", numbers);  // Print modified vector
}
```

**Explanation**:

- `vec![1, 2, 3, 4, 5]` creates a mutable vector
- `numbers.iter_mut()` creates a mutable iterator
- `*number` dereferences the mutable reference
- `*number *= 2` doubles each element
- The vector is modified in place

**Why**: Mutable iteration is useful for in-place transformations and data processing.

### HashMap Iteration

**What**: HashMaps store key-value pairs that can be iterated over.

**How**: Here's how to iterate over HashMaps:

```rust
use std::collections::HashMap;  // Import HashMap

fn main() {
    let mut scores = HashMap::new();  // Create HashMap
    scores.insert("Alice", 95);  // Insert key-value pairs
    scores.insert("Bob", 87);
    scores.insert("Charlie", 92);

    for (name, score) in scores.iter() {  // Iterate over key-value pairs
        println!("{}: {}", name, score);  // Print each pair
    }
}
```

**Explanation**:

- `HashMap::new()` creates an empty HashMap
- `scores.insert()` adds key-value pairs
- `scores.iter()` creates an iterator over key-value pairs
- `(name, score)` destructures each key-value pair
- This pattern is common for data storage and lookup

**Why**: HashMap iteration is essential for processing associative data and key-value relationships.

### String Iteration

**What**: Strings can be iterated in different ways depending on your needs.

**How**: Here's how to iterate over strings:

```rust
fn main() {
    let text = "Hello, World!";  // String to process

    // Iterate by characters
    for ch in text.chars() {  // Character iterator
        println!("Character: {}", ch);  // Print each character
    }

    // Iterate by words
    for word in text.split_whitespace() {  // Word iterator
        println!("Word: {}", word);  // Print each word
    }
}
```

**Explanation**:

- `text.chars()` creates an iterator over characters
- `text.split_whitespace()` creates an iterator over words
- Characters include spaces, punctuation, and letters
- Words are separated by whitespace
- This pattern is common in text processing

**Why**: String iteration is fundamental to text analysis, parsing, and data processing.

## Advanced Loop Patterns

### Fibonacci Sequence

**What**: The Fibonacci sequence is a classic example of iterative algorithms using loops.

**How**: Here's how to generate the Fibonacci sequence:

```rust
fn main() {
    let mut a = 0;  // First Fibonacci number
    let mut b = 1;  // Second Fibonacci number

    println!("Fibonacci sequence:");
    for i in 0..10 {  // Generate first 10 numbers
        if i == 0 {  // First number
            println!("F{} = {}", i, a);
        } else if i == 1 {  // Second number
            println!("F{} = {}", i, b);
        } else {  // Subsequent numbers
            let next = a + b;  // Calculate next number
            println!("F{} = {}", i, next);
            a = b;  // Update a
            b = next;  // Update b
        }
    }
}
```

**Explanation**:

- The Fibonacci sequence starts with 0, 1
- Each subsequent number is the sum of the previous two
- `a` and `b` track the last two numbers
- The loop generates the sequence iteratively
- This demonstrates state management in loops

**Why**: Fibonacci is a classic example of iterative algorithms and state management.

### Prime Number Generation

**What**: Finding prime numbers using nested loops to test divisibility.

**How**: Here's how to find prime numbers:

```rust
fn main() {
    let limit = 20;  // Upper limit for prime search
    println!("Prime numbers up to {}:", limit);

    for number in 2..=limit {  // Check each number from 2 to limit
        let mut is_prime = true;  // Assume prime initially

        for i in 2..number {  // Check divisors from 2 to number-1
            if number % i == 0 {  // If divisible
                is_prime = false;  // Not prime
                break;  // Exit inner loop
            }
        }

        if is_prime {  // If still prime
            println!("{}", number);  // Print prime number
        }
    }
}
```

**Explanation**:

- The outer loop checks each number from 2 to the limit
- The inner loop tests divisibility by numbers from 2 to number-1
- `is_prime` tracks whether the number is prime
- `break` exits the inner loop when a divisor is found
- This demonstrates nested loop logic

**Why**: Prime number generation is a classic example of nested loops and algorithm design.

### Matrix Operations

**What**: Processing two-dimensional data using nested loops for matrix operations.

**How**: Here's how to work with matrices:

```rust
fn main() {
    let matrix = [  // 3x3 matrix
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    // Print matrix
    for row in matrix.iter() {  // Iterate over rows
        for element in row.iter() {  // Iterate over elements in row
            print!("{} ", element);  // Print each element
        }
        println!();  // New line after each row
    }

    // Calculate sum
    let mut sum = 0;  // Running total
    for row in matrix.iter() {  // Iterate over rows
        for element in row.iter() {  // Iterate over elements
            sum += element;  // Add to total
        }
    }
    println!("Sum: {}", sum);  // Print total
}
```

**Explanation**:

- The outer loop iterates over rows
- The inner loop iterates over elements in each row
- `print!()` prints without newline
- `println!()` adds a newline after each row
- This pattern is common for 2D data processing

**Why**: Matrix operations are fundamental to linear algebra, graphics, and scientific computing.

## Practice Exercises

### Exercise 1: Countdown

**What**: Create a countdown timer using a while loop.

**How**: Implement this countdown:

```rust
fn main() {
    let mut count = 5;  // Start countdown at 5

    while count > 0 {  // Continue while count is positive
        println!("{}!", count);  // Print countdown
        count -= 1;  // Decrement count
    }

    println!("LIFTOFF!!!");  // Final message
}
```

### Exercise 2: Number Guessing Game

**What**: Create an interactive guessing game using a loop.

**How**: Implement this game:

```rust
use std::io;  // Import for input/output

fn main() {
    let secret_number = 42;  // Secret number to guess
    let mut attempts = 0;  // Track number of attempts

    loop {  // Infinite loop until correct guess
        println!("Guess the number (1-100):");

        let mut guess = String::new();  // String to store input
        io::stdin().read_line(&mut guess).expect("Failed to read line");
        let guess: u32 = match guess.trim().parse() {  // Convert to number
            Ok(num) => num,
            Err(_) => {
                println!("Please enter a valid number!");
                continue;  // Skip to next iteration
            }
        };

        attempts += 1;  // Increment attempt counter

        if guess == secret_number {  // Correct guess
            println!("You win! You guessed it in {} attempts!", attempts);
            break;  // Exit loop
        } else if guess < secret_number {  // Too small
            println!("Too small!");
        } else {  // Too big
            println!("Too big!");
        }
    }
}
```

### Exercise 3: Factorial Calculation

**What**: Calculate the factorial of a number using a for loop.

**How**: Implement this calculation:

```rust
fn main() {
    let n = 5;  // Number to calculate factorial
    let mut factorial = 1;  // Start with 1

    for i in 1..=n {  // Multiply by each number from 1 to n
        factorial *= i;  // Multiply factorial by i
    }

    println!("{}! = {}", n, factorial);  // Print result
}
```

### Exercise 4: Array Statistics

**What**: Calculate statistics (sum, average, max, min) for an array.

**How**: Implement this analysis:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // Array of numbers
    let mut sum = 0;  // Running sum
    let mut max = numbers[0];  // Start with first element
    let mut min = numbers[0];  // Start with first element

    for &number in numbers.iter() {  // Iterate over each number
        sum += number;  // Add to sum
        if number > max {  // Check if new maximum
            max = number;
        }
        if number < min {  // Check if new minimum
            min = number;
        }
    }

    let average = sum as f64 / numbers.len() as f64;  // Calculate average

    println!("Numbers: {:?}", numbers);  // Print array
    println!("Sum: {}", sum);  // Print sum
    println!("Average: {:.2}", average);  // Print average
    println!("Max: {}", max);  // Print maximum
    println!("Min: {}", min);  // Print minimum
}
```

## Key Takeaways

**What** you've learned about loops:

1. **Loop** - infinite loop, use break to exit, can return values
2. **While** - loop while condition is true, automatic condition checking
3. **For** - iterate over collections or ranges, most idiomatic in Rust
4. **Break** - exit loop immediately, can exit specific labeled loops
5. **Continue** - skip to next iteration, can skip to specific labeled loops
6. **Labels** - control nested loops with break/continue for precise control
7. **Iterators** - powerful way to process collections efficiently
8. **Pattern matching** - destructuring in for loops for complex data

**Why** these concepts matter:

- **Repetition** is fundamental to programming and algorithms
- **Efficient iteration** is key to processing data
- **Loop control** allows complex program flow
- **Collection processing** is essential for data manipulation
- **Algorithm implementation** often requires loops

## Next Steps

Now that you understand loops, you're ready to learn about:

- **Pattern matching with match** - powerful conditional logic
- **Advanced control flow** - complex program flow management
- **Error handling patterns** - robust error management
- **Function composition** - building complex programs from simple parts

**Where** to go next: Continue with the next lesson on "Match Expressions" to learn about pattern matching in Rust!
