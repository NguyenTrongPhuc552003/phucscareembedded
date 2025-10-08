---
sidebar_position: 5
---

# Practical Exercises - Functions and Control Flow

Master functions, control flow, and pattern matching through hands-on exercises with comprehensive explanations using the 4W+H framework.

## What Are These Exercises?

**What**: These practical exercises combine all the concepts you've learned about functions, control flow, and pattern matching into real-world programming scenarios.

**Why**: Practical exercises help you:

- **Apply theoretical knowledge** to solve actual problems
- **Build confidence** through hands-on coding
- **Develop problem-solving skills** essential for programming
- **Practice good coding habits** like error handling and documentation
- **Prepare for real-world programming** challenges

**When**: Complete these exercises after studying:

- Function basics and parameters
- If expressions and conditional logic
- Loop structures (loop, while, for)
- Pattern matching with match expressions

## Exercise 1: Basic Functions

### Temperature Converter

**What**: Create functions to convert between Celsius and Fahrenheit temperature scales.

**Why**: Temperature conversion is a common real-world problem that demonstrates function design, parameter handling, and mathematical operations.

**How**: Here's how to implement temperature conversion functions:

```rust
fn main() {
    let celsius = 25.0;  // Input temperature in Celsius
    let fahrenheit = celsius_to_fahrenheit(celsius);  // Convert to Fahrenheit
    let celsius_back = fahrenheit_to_celsius(fahrenheit);  // Convert back to Celsius

    println!("{}°C = {:.1}°F", celsius, fahrenheit);  // Display conversion
    println!("{}°F = {:.1}°C", fahrenheit, celsius_back);  // Display reverse conversion
}

fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0  // Formula: C × 9/5 + 32
}

fn fahrenheit_to_celsius(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * 5.0 / 9.0  // Formula: (F - 32) × 5/9
}
```

**Explanation**:

- `celsius_to_fahrenheit` takes a Celsius value and returns Fahrenheit using the standard formula
- `fahrenheit_to_celsius` takes a Fahrenheit value and returns Celsius using the reverse formula
- Both functions use `f64` for floating-point precision
- The `{:.1}` format specifier displays results to 1 decimal place
- The functions demonstrate parameter passing and return values

**Where**: These functions can be used in weather applications, scientific calculations, or any system that needs temperature conversion.

### Calculator Functions

**What**: Create a set of basic mathematical functions for arithmetic operations.

**Why**: Calculator functions demonstrate fundamental programming concepts like function definition, parameter handling, and return values in a familiar context.

**How**: Here's how to implement basic calculator functions:

```rust
fn main() {
    let a = 10;  // First operand
    let b = 3;   // Second operand

    println!("{} + {} = {}", a, b, add(a, b));        // Addition
    println!("{} - {} = {}", a, b, subtract(a, b));    // Subtraction
    println!("{} * {} = {}", a, b, multiply(a, b));    // Multiplication
    println!("{} / {} = {}", a, b, divide(a, b));      // Division
    println!("{} % {} = {}", a, b, remainder(a, b));   // Remainder
}

fn add(x: i32, y: i32) -> i32 {
    x + y  // Return sum of two integers
}

fn subtract(x: i32, y: i32) -> i32 {
    x - y  // Return difference of two integers
}

fn multiply(x: i32, y: i32) -> i32 {
    x * y  // Return product of two integers
}

fn divide(x: i32, y: i32) -> i32 {
    x / y  // Return quotient (integer division)
}

fn remainder(x: i32, y: i32) -> i32 {
    x % y  // Return remainder after division
}
```

**Explanation**:

- Each function takes two `i32` parameters and returns an `i32`
- The functions perform basic arithmetic operations
- `add`, `subtract`, `multiply` are straightforward operations
- `divide` performs integer division (truncates decimal part)
- `remainder` (modulo) returns the remainder after division
- All functions use implicit return (no semicolon on the last expression)

**Where**: These functions form the foundation for more complex mathematical operations and can be used in calculators, financial applications, or scientific computing.

## Exercise 2: Control Flow

### Number Classification

**What**: Create a function that classifies numbers as positive, negative, or zero using if expressions.

**Why**: Number classification demonstrates conditional logic and decision-making in programming, which is fundamental to most applications.

**How**: Here's how to implement number classification:

```rust
fn main() {
    let numbers = [1, -5, 0, 100, -50];  // Array of test numbers

    for number in numbers.iter() {  // Iterate over each number
        let classification = classify_number(*number);  // Classify the number
        println!("{} is {}", number, classification);   // Print result
    }
}

fn classify_number(n: i32) -> &'static str {
    if n > 0 {  // Check if positive
        "positive"
    } else if n < 0 {  // Check if negative
        "negative"
    } else {  // Must be zero
        "zero"
    }
}
```

**Explanation**:

- `classify_number` takes an `i32` parameter and returns a string slice
- The function uses if-else-if-else chain to handle three cases
- `n > 0` checks if the number is positive
- `n < 0` checks if the number is negative
- The `else` case handles zero (when neither condition is true)
- `&'static str` means the string lives for the entire program duration
- The function demonstrates if expressions returning values

**Where**: This pattern is common in data validation, user input processing, and mathematical analysis applications.

### Grade Calculator

**What**: Create a function that converts numerical scores into letter grades using a grading scale.

**Why**: Grade calculation demonstrates range-based conditional logic and is a common real-world programming task in educational systems.

**How**: Here's how to implement a grade calculator:

```rust
fn main() {
    let scores = [95, 87, 92, 78, 85];  // Array of test scores

    for score in scores.iter() {  // Iterate over each score
        let grade = calculate_grade(*score);  // Calculate letter grade
        println!("Score: {}, Grade: {}", score, grade);  // Display result
    }
}

fn calculate_grade(score: u32) -> char {
    if score >= 90 {  // A grade: 90-100
        'A'
    } else if score >= 80 {  // B grade: 80-89
        'B'
    } else if score >= 70 {  // C grade: 70-79
        'C'
    } else if score >= 60 {  // D grade: 60-69
        'D'
    } else {  // F grade: 0-59
        'F'
    }
}
```

**Explanation**:

- `calculate_grade` takes a `u32` score and returns a `char` grade
- The function uses if-else-if-else chain to handle grade ranges
- Each condition checks if the score meets the minimum threshold
- The conditions are ordered from highest to lowest (90, 80, 70, 60)
- The `else` case handles failing grades (below 60)
- Character literals use single quotes (`'A'`, `'B'`, etc.)
- This demonstrates range-based classification logic

**Where**: This pattern is essential in educational software, grade management systems, and any application that needs to categorize numerical data into discrete ranges.

## Exercise 3: Loops

### Fibonacci Sequence

**What**: Generate the Fibonacci sequence using loops, where each number is the sum of the two preceding numbers.

**Why**: The Fibonacci sequence is a classic example that demonstrates loop control, state management, and iterative algorithms in programming.

**How**: Here's how to generate the Fibonacci sequence:

```rust
fn main() {
    let n = 10;  // Number of terms to generate
    println!("Fibonacci sequence up to {} terms:", n);

    let mut a = 0;  // First Fibonacci number
    let mut b = 1;  // Second Fibonacci number

    for i in 0..n {  // Loop from 0 to n-1
        if i == 0 {  // First term
            println!("F{} = {}", i, a);
        } else if i == 1 {  // Second term
            println!("F{} = {}", i, b);
        } else {  // Subsequent terms
            let next = a + b;  // Calculate next Fibonacci number
            println!("F{} = {}", i, next);
            a = b;      // Update a to previous b
            b = next;   // Update b to current next
        }
    }
}
```

**Explanation**:

- The Fibonacci sequence starts with 0, 1, and each subsequent number is the sum of the previous two
- `a` and `b` track the last two numbers in the sequence
- The loop handles the first two terms (0, 1) as special cases
- For subsequent terms, we calculate `next = a + b` and update the state
- `a = b` and `b = next` shift the state forward for the next iteration
- This demonstrates state management in loops and iterative algorithms

**Where**: Fibonacci sequences appear in nature, mathematics, and are used in algorithms for optimization, financial modeling, and computer graphics.

### Prime Number Checker

**What**: Create a function that determines whether a number is prime using nested loops and mathematical logic.

**Why**: Prime number checking demonstrates nested loops, early returns, and mathematical algorithms that are fundamental to cryptography and number theory.

**How**: Here's how to implement a prime number checker:

```rust
fn main() {
    let numbers = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11];  // Test numbers

    for number in numbers.iter() {  // Check each number
        if is_prime(*number) {  // If prime
            println!("{} is prime", number);
        } else {  // If not prime
            println!("{} is not prime", number);
        }
    }
}

fn is_prime(n: u32) -> bool {
    if n < 2 {  // Numbers less than 2 are not prime
        return false;  // Early return for invalid input
    }

    for i in 2..n {  // Check divisors from 2 to n-1
        if n % i == 0 {  // If divisible by any number
            return false;  // Not prime, exit early
        }
    }
    true  // If no divisors found, it's prime
}
```

**Explanation**:

- `is_prime` takes a `u32` and returns a `bool`
- Numbers less than 2 are not prime by definition
- The function checks all possible divisors from 2 to n-1
- `n % i == 0` checks if n is divisible by i
- If any divisor is found, the function returns `false` immediately
- If no divisors are found after checking all possibilities, it returns `true`
- This demonstrates early return and nested loop logic

**Where**: Prime number checking is essential in cryptography, security systems, and mathematical applications that require number theory.

### Factorial Calculator

**What**: Calculate the factorial of a number using a for loop, where factorial is the product of all positive integers up to that number.

**Why**: Factorial calculation demonstrates iterative algorithms and is fundamental to combinatorics, probability, and mathematical computations.

**How**: Here's how to implement a factorial calculator:

```rust
fn main() {
    let n = 5;  // Number to calculate factorial
    let factorial = calculate_factorial(n);  // Calculate factorial
    println!("{}! = {}", n, factorial);  // Display result
}

fn calculate_factorial(n: u32) -> u32 {
    let mut result = 1;  // Start with 1 (factorial of 0 and 1)
    for i in 1..=n {  // Loop from 1 to n (inclusive)
        result *= i;  // Multiply result by current number
    }
    result  // Return the final factorial
}
```

**Explanation**:

- `calculate_factorial` takes a `u32` and returns a `u32`
- `result` starts at 1 (the multiplicative identity)
- The loop iterates from 1 to n inclusive using `1..=n`
- `result *= i` is equivalent to `result = result * i`
- Each iteration multiplies the result by the current number
- The final result is the product of all numbers from 1 to n
- This demonstrates iterative multiplication and accumulator patterns

**Where**: Factorials are used in permutations, combinations, probability calculations, and mathematical series expansions.

## Exercise 4: Pattern Matching

### Day of Week

**What**: Create a function that converts day numbers to day names using pattern matching with match expressions.

**Why**: Day conversion demonstrates pattern matching with specific values and catch-all patterns, which is common in user interface programming and data validation.

**How**: Here's how to implement day name conversion:

```rust
fn main() {
    let days = [1, 2, 3, 4, 5, 6, 7, 8];  // Test day numbers (including invalid)

    for day in days.iter() {  // Process each day number
        let day_name = get_day_name(*day);  // Convert to day name
        println!("Day {} is {}", day, day_name);  // Display result
    }
}

fn get_day_name(day: u32) -> &'static str {
    match day {  // Pattern match on day number
        1 => "Monday",     // Match specific value 1
        2 => "Tuesday",    // Match specific value 2
        3 => "Wednesday",  // Match specific value 3
        4 => "Thursday",   // Match specific value 4
        5 => "Friday",     // Match specific value 5
        6 => "Saturday",   // Match specific value 6
        7 => "Sunday",     // Match specific value 7
        _ => "Invalid day", // Catch-all for any other value
    }
}
```

**Explanation**:

- `get_day_name` takes a `u32` day number and returns a string slice
- The match expression handles each valid day number (1-7)
- Each arm returns the corresponding day name
- The `_` pattern catches any value not explicitly matched
- This demonstrates exhaustive pattern matching and error handling
- The function provides clear feedback for invalid inputs

**Where**: This pattern is common in calendar applications, scheduling systems, and any program that needs to convert between numeric codes and human-readable names.

### Calculator with Match

**What**: Create a calculator function that uses pattern matching to handle different mathematical operations based on string input.

**Why**: This demonstrates how match expressions can handle string patterns and provide a clean alternative to if-else chains for operation selection.

**How**: Here's how to implement a calculator with pattern matching:

```rust
fn main() {
    let operations = ["+", "-", "*", "/", "%"];  // Array of operations
    let x = 10;  // First operand
    let y = 3;   // Second operand

    for op in operations.iter() {  // Test each operation
        let result = calculate(x, y, op);  // Calculate result
        println!("{} {} {} = {}", x, op, y, result);  // Display calculation
    }
}

fn calculate(x: i32, y: i32, operation: &str) -> i32 {
    match operation {  // Pattern match on operation string
        "+" => x + y,  // Addition
        "-" => x - y,  // Subtraction
        "*" => x * y,  // Multiplication
        "/" => x / y,  // Division
        "%" => x % y,  // Remainder
        _ => {  // Catch-all for invalid operations
            println!("Invalid operation: {}", operation);
            0  // Return 0 for invalid operations
        }
    }
}
```

**Explanation**:

- `calculate` takes two `i32` operands and a string operation
- The match expression handles each valid operation string
- Each arm performs the corresponding mathematical operation
- The `_` pattern handles invalid operations with error handling
- This approach is more readable than long if-else chains
- The function demonstrates string pattern matching and error handling

**Where**: This pattern is common in command-line calculators, expression parsers, and any system that needs to dispatch operations based on string input.

## Exercise 5: Advanced Functions

### Array Statistics

**What**: Create a function that calculates multiple statistics (sum, average, max, min) for an array and returns them as a tuple.

**Why**: Statistical analysis demonstrates advanced function concepts like multiple return values, iterator methods, and data processing algorithms.

**How**: Here's how to implement array statistics:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];  // Test data

    let stats = calculate_statistics(&numbers);  // Calculate all statistics
    println!("Numbers: {:?}", numbers);  // Display original array
    println!("Sum: {}", stats.0);        // Display sum
    println!("Average: {:.2}", stats.1); // Display average (2 decimal places)
    println!("Max: {}", stats.2);        // Display maximum
    println!("Min: {}", stats.3);       // Display minimum
}

fn calculate_statistics(numbers: &[i32]) -> (i32, f64, i32, i32) {
    let sum: i32 = numbers.iter().sum();  // Sum all numbers using iterator
    let count = numbers.len() as f64;     // Convert length to float
    let average = sum as f64 / count;     // Calculate average
    let max = *numbers.iter().max().unwrap();  // Find maximum value
    let min = *numbers.iter().min().unwrap();  // Find minimum value

    (sum, average, max, min)  // Return tuple with all statistics
}
```

**Explanation**:

- `calculate_statistics` takes a slice reference `&[i32]` and returns a tuple
- `numbers.iter().sum()` uses iterator methods to sum all elements
- `numbers.len()` gets the array length for average calculation
- `numbers.iter().max().unwrap()` finds the maximum value
- `numbers.iter().min().unwrap()` finds the minimum value
- The function returns a tuple `(sum, average, max, min)`
- This demonstrates multiple return values and iterator methods

**Where**: Statistical analysis is essential in data science, analytics applications, and any system that needs to summarize numerical data.

### String Processing

**What**: Create a function that analyzes text and returns various statistics about its content (length, word count, vowel count, consonant count).

**Why**: Text analysis demonstrates string manipulation, iterator methods, and character processing - essential skills for text processing applications.

**How**: Here's how to implement text analysis:

```rust
fn main() {
    let text = "Hello, World!";  // Test string

    let stats = analyze_text(text);  // Analyze the text
    println!("Text: '{}'", text);    // Display original text
    println!("Length: {}", stats.0); // Display character count
    println!("Words: {}", stats.1);  // Display word count
    println!("Vowels: {}", stats.2); // Display vowel count
    println!("Consonants: {}", stats.3); // Display consonant count
}

fn analyze_text(text: &str) -> (usize, usize, usize, usize) {
    let length = text.len();  // Get total character count
    let words = text.split_whitespace().count();  // Count words by splitting on whitespace
    let vowels = text.chars().filter(|c| "aeiouAEIOU".contains(*c)).count();  // Count vowels
    let consonants = text.chars().filter(|c| c.is_alphabetic() && !"aeiouAEIOU".contains(*c)).count();  // Count consonants

    (length, words, vowels, consonants)  // Return all statistics as tuple
}
```

**Explanation**:

- `analyze_text` takes a string slice `&str` and returns a tuple of counts
- `text.len()` returns the total number of characters
- `text.split_whitespace().count()` splits on whitespace and counts words
- `text.chars().filter()` creates an iterator over characters and filters them
- Vowel detection checks if characters are in the vowel string
- Consonant detection checks if characters are alphabetic but not vowels
- This demonstrates string iteration, filtering, and character classification

**Where**: Text analysis is fundamental in natural language processing, content management systems, and any application that processes written content.

## Exercise 6: Game Logic

### Number Guessing Game

```rust
use std::io;

fn main() {
    let secret_number = 42;
    let mut attempts = 0;
    let max_attempts = 5;

    println!("Welcome to the Number Guessing Game!");
    println!("I'm thinking of a number between 1 and 100.");

    loop {
        if attempts >= max_attempts {
            println!("You've used all {} attempts! The secret number was {}", max_attempts, secret_number);
            break;
        }

        println!("Attempt {}/{}: Enter your guess:", attempts + 1, max_attempts);

        let mut guess = String::new();
        io::stdin().read_line(&mut guess).expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => {
                println!("Please enter a valid number!");
                continue;
            }
        };

        attempts += 1;

        match guess.cmp(&secret_number) {
            std::cmp::Ordering::Less => println!("Too small!"),
            std::cmp::Ordering::Greater => println!("Too big!"),
            std::cmp::Ordering::Equal => {
                println!("You win! You guessed it in {} attempts!", attempts);
                break;
            }
        }
    }
}
```

### Rock Paper Scissors

```rust
use std::io;

fn main() {
    println!("Rock Paper Scissors Game!");
    println!("Enter your choice (rock, paper, scissors):");

    let mut choice = String::new();
    io::stdin().read_line(&mut choice).expect("Failed to read line");
    let choice = choice.trim().to_lowercase();

    let computer_choice = get_computer_choice();
    let result = determine_winner(&choice, &computer_choice);

    println!("You chose: {}", choice);
    println!("Computer chose: {}", computer_choice);
    println!("Result: {}", result);
}

fn get_computer_choice() -> String {
    let choices = ["rock", "paper", "scissors"];
    let index = (std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs() % 3) as usize;
    choices[index].to_string()
}

fn determine_winner(player: &str, computer: &str) -> &'static str {
    match (player, computer) {
        ("rock", "scissors") | ("paper", "rock") | ("scissors", "paper") => "You win!",
        ("scissors", "rock") | ("rock", "paper") | ("paper", "scissors") => "Computer wins!",
        _ => "It's a tie!",
    }
}
```

## Exercise 7: Mathematical Functions

### Quadratic Formula

```rust
fn main() {
    let a = 1.0;
    let b = -5.0;
    let c = 6.0;

    let roots = solve_quadratic(a, b, c);
    match roots {
        Some((x1, x2)) => println!("Roots: x1 = {:.2}, x2 = {:.2}", x1, x2),
        None => println!("No real roots"),
    }
}

fn solve_quadratic(a: f64, b: f64, c: f64) -> Option<(f64, f64)> {
    let discriminant = b * b - 4.0 * a * c;

    if discriminant < 0.0 {
        None
    } else {
        let x1 = (-b + discriminant.sqrt()) / (2.0 * a);
        let x2 = (-b - discriminant.sqrt()) / (2.0 * a);
        Some((x1, x2))
    }
}
```

### GCD and LCM

```rust
fn main() {
    let a = 48;
    let b = 18;

    let gcd = calculate_gcd(a, b);
    let lcm = calculate_lcm(a, b);

    println!("GCD of {} and {} is {}", a, b, gcd);
    println!("LCM of {} and {} is {}", a, b, lcm);
}

fn calculate_gcd(mut a: u32, mut b: u32) -> u32 {
    while b != 0 {
        let temp = b;
        b = a % b;
        a = temp;
    }
    a
}

fn calculate_lcm(a: u32, b: u32) -> u32 {
    (a * b) / calculate_gcd(a, b)
}
```

## Exercise 8: String Manipulation

### Palindrome Checker

```rust
fn main() {
    let words = ["racecar", "hello", "level", "world", "madam"];

    for word in words.iter() {
        if is_palindrome(word) {
            println!("'{}' is a palindrome", word);
        } else {
            println!("'{}' is not a palindrome", word);
        }
    }
}

fn is_palindrome(word: &str) -> bool {
    let word = word.to_lowercase();
    let chars: Vec<char> = word.chars().collect();
    let len = chars.len();

    for i in 0..len / 2 {
        if chars[i] != chars[len - 1 - i] {
            return false;
        }
    }
    true
}
```

### Word Counter

```rust
fn main() {
    let text = "The quick brown fox jumps over the lazy dog";

    let stats = count_words(text);
    println!("Text: '{}'", text);
    println!("Total words: {}", stats.0);
    println!("Unique words: {}", stats.1);
    println!("Average word length: {:.2}", stats.2);
}

fn count_words(text: &str) -> (usize, usize, f64) {
    let words: Vec<&str> = text.split_whitespace().collect();
    let total_words = words.len();

    let mut unique_words = std::collections::HashSet::new();
    let mut total_length = 0;

    for word in words.iter() {
        unique_words.insert(word.to_lowercase());
        total_length += word.len();
    }

    let unique_count = unique_words.len();
    let average_length = total_length as f64 / total_words as f64;

    (total_words, unique_count, average_length)
}
```

## Exercise 9: Data Processing

### Array Operations

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    let even_numbers = filter_even(&numbers);
    let doubled = map_double(&numbers);
    let sum = reduce_sum(&numbers);

    println!("Original: {:?}", numbers);
    println!("Even numbers: {:?}", even_numbers);
    println!("Doubled: {:?}", doubled);
    println!("Sum: {}", sum);
}

fn filter_even(numbers: &[i32]) -> Vec<i32> {
    numbers.iter().filter(|&&x| x % 2 == 0).cloned().collect()
}

fn map_double(numbers: &[i32]) -> Vec<i32> {
    numbers.iter().map(|&x| x * 2).collect()
}

fn reduce_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}
```

### Matrix Operations

```rust
fn main() {
    let matrix = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9]
    ];

    let sum = matrix_sum(&matrix);
    let transposed = matrix_transpose(&matrix);

    println!("Original matrix:");
    print_matrix(&matrix);
    println!("Sum: {}", sum);
    println!("Transposed matrix:");
    print_matrix(&transposed);
}

fn matrix_sum(matrix: &[[i32; 3]; 3]) -> i32 {
    let mut sum = 0;
    for row in matrix.iter() {
        for element in row.iter() {
            sum += element;
        }
    }
    sum
}

fn matrix_transpose(matrix: &[[i32; 3]; 3]) -> [[i32; 3]; 3] {
    let mut transposed = [[0; 3]; 3];
    for i in 0..3 {
        for j in 0..3 {
            transposed[j][i] = matrix[i][j];
        }
    }
    transposed
}

fn print_matrix(matrix: &[[i32; 3]; 3]) {
    for row in matrix.iter() {
        for element in row.iter() {
            print!("{} ", element);
        }
        println!();
    }
}
```

## Exercise 10: Advanced Control Flow

### State Machine

```rust
enum TrafficLight {
    Red,
    Yellow,
    Green,
}

impl TrafficLight {
    fn next(&self) -> TrafficLight {
        match self {
            TrafficLight::Red => TrafficLight::Green,
            TrafficLight::Yellow => TrafficLight::Red,
            TrafficLight::Green => TrafficLight::Yellow,
        }
    }

    fn duration(&self) -> u32 {
        match self {
            TrafficLight::Red => 30,
            TrafficLight::Yellow => 5,
            TrafficLight::Green => 25,
        }
    }
}

fn main() {
    let mut light = TrafficLight::Red;

    for cycle in 1..=3 {
        println!("Cycle {}: {:?} light for {} seconds", cycle, light, light.duration());
        light = light.next();
    }
}
```

### Menu System

```rust
use std::io;

fn main() {
    loop {
        println!("Menu:");
        println!("1. Add numbers");
        println!("2. Subtract numbers");
        println!("3. Multiply numbers");
        println!("4. Divide numbers");
        println!("5. Exit");
        println!("Enter your choice:");

        let mut choice = String::new();
        io::stdin().read_line(&mut choice).expect("Failed to read line");

        match choice.trim() {
            "1" => perform_operation("+"),
            "2" => perform_operation("-"),
            "3" => perform_operation("*"),
            "4" => perform_operation("/"),
            "5" => {
                println!("Goodbye!");
                break;
            }
            _ => println!("Invalid choice!"),
        }
    }
}

fn perform_operation(operation: &str) {
    println!("Enter first number:");
    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let x: f64 = input.trim().parse().expect("Please enter a valid number");

    println!("Enter second number:");
    input.clear();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let y: f64 = input.trim().parse().expect("Please enter a valid number");

    let result = match operation {
        "+" => x + y,
        "-" => x - y,
        "*" => x * y,
        "/" => {
            if y != 0.0 {
                x / y
            } else {
                println!("Cannot divide by zero!");
                return;
            }
        }
        _ => {
            println!("Invalid operation!");
            return;
        }
    };

    println!("{} {} {} = {}", x, operation, y, result);
}
```

## Key Takeaways

**What** you've accomplished through these exercises:

1. **Function Mastery** - You've learned to create, call, and design functions with parameters and return values
2. **Control Flow Expertise** - You can use if expressions, loops, and pattern matching to control program flow
3. **Problem-Solving Skills** - You've applied programming concepts to solve real-world problems
4. **Code Organization** - You understand how to break complex problems into manageable functions
5. **Error Handling** - You've learned to handle edge cases and invalid inputs gracefully

**Why** these exercises matter:

- **Practical Application** - You've seen how theoretical concepts apply to real programming tasks
- **Building Confidence** - Hands-on practice builds confidence in your programming abilities
- **Problem-Solving Foundation** - These exercises develop the problem-solving mindset essential for programming
- **Code Quality** - You've learned to write clean, readable, and maintainable code
- **Real-World Preparation** - These patterns appear in professional software development

**When** to use these concepts:

- **Function Design** - Break complex problems into smaller, manageable functions
- **Data Processing** - Use loops and iterators to process collections of data
- **User Interaction** - Use control flow to handle different user inputs and scenarios
- **Error Handling** - Always consider what can go wrong and handle edge cases
- **Code Organization** - Structure your code with clear, single-purpose functions

**Where** these skills apply:

- **Web Development** - Functions for handling requests, processing data, and generating responses
- **Data Analysis** - Statistical functions, data processing, and mathematical calculations
- **Game Development** - Game logic, user input handling, and state management
- **System Programming** - File processing, system utilities, and performance-critical applications
- **Scientific Computing** - Mathematical algorithms, data analysis, and research applications

## Practice Tips for Continued Learning

1. **Start Simple** - Begin with basic functions and gradually add complexity
2. **Use Meaningful Names** - Make your code self-documenting with clear function and variable names
3. **Handle Errors** - Always consider what can go wrong and provide meaningful error messages
4. **Test Thoroughly** - Verify your code works with different inputs, including edge cases
5. **Refactor Regularly** - Improve your code as you learn more techniques and best practices
6. **Read Others' Code** - Study well-written Rust code to learn new patterns and techniques
7. **Practice Daily** - Consistent practice is more valuable than occasional intensive sessions

## Next Steps

**What** you're ready for next:

After completing these exercises, you should be comfortable with:

- **Function definition and calling** - Creating reusable code blocks
- **Control flow structures** - Making decisions and repeating actions
- **Pattern matching** - Handling complex conditional logic elegantly
- **Error handling basics** - Preventing crashes and handling edge cases
- **Problem-solving with code** - Breaking down problems into programming solutions

**Where** to go next:

You're now ready to move on to **Week 4: Ownership Fundamentals**, where you'll learn about:

- **Ownership rules** - Rust's unique memory management system
- **References and borrowing** - Safe memory access without copying
- **Stack vs heap** - Understanding memory layout and performance
- **Lifetime management** - How Rust ensures memory safety

**Why** ownership is crucial:

Ownership is Rust's most distinctive feature and the key to its memory safety guarantees. Understanding ownership will unlock the full power of Rust and enable you to write safe, efficient systems programming code.

**How** to continue learning:

1. **Practice these exercises** - Run the code, modify it, and experiment with variations
2. **Try additional problems** - Create your own exercises based on real-world scenarios
3. **Read the Rust Book** - Continue with the official documentation
4. **Join the community** - Engage with other Rust learners and developers
5. **Build projects** - Apply your knowledge to create useful applications

**When** you're ready:

Move on to the next lesson when you can confidently:

- Write functions with parameters and return values
- Use if expressions and loops effectively
- Apply pattern matching to solve problems
- Handle errors and edge cases appropriately
- Break down complex problems into smaller functions

Happy coding! 🦀
