---
sidebar_position: 2
---

# If Expressions

Master conditional logic in Rust with comprehensive explanations using the 4W+H framework.

## What Are If Expressions?

**What**: If expressions are conditional statements that allow your program to make decisions based on boolean conditions. In Rust, `if` can be used both as a statement (for side effects) and as an expression (to return values).

**Why**: Conditional logic is essential for:

- **Making decisions** based on data
- **Handling different scenarios** in your program
- **Controlling program flow** based on conditions
- **Creating interactive applications** that respond to user input
- **Implementing business logic** with multiple outcomes

**When**: Use if expressions when you need to:

- Execute different code based on conditions
- Validate input data
- Handle error cases
- Implement business rules
- Create user interfaces with conditional behavior

## How to Use Basic If Statements

### Simple If Statement

**What**: A basic if statement executes code only when a condition is true.

**How**: Here's the fundamental syntax:

```rust
fn main() {
    let number = 6;

    if number % 2 == 0 {  // Check if number is even
        println!("{} is even", number);  // Execute if condition is true
    }

    if number % 2 != 0 {  // Check if number is odd
        println!("{} is odd", number);  // Execute if condition is true
    }
}
```

**Explanation**:

- `number % 2 == 0` checks if the remainder when dividing by 2 is 0 (even number)
- `number % 2 != 0` checks if the remainder is not 0 (odd number)
- The code inside `{}` only runs if the condition is true
- Both conditions are checked independently

**Why**: Simple if statements allow you to execute code conditionally without affecting the rest of your program.

### If-Else Statement

**What**: An if-else statement provides an alternative path when the condition is false.

**How**: Here's how to use if-else:

```rust
fn main() {
    let number = 7;

    if number % 2 == 0 {  // Check if even
        println!("{} is even", number);  // Execute if true
    } else {  // Alternative path
        println!("{} is odd", number);   // Execute if false
    }
}
```

**Explanation**:

- The `if` condition is checked first
- If true, the first block executes
- If false, the `else` block executes
- Only one path will be taken
- This is more efficient than two separate if statements

**Why**: If-else statements ensure that exactly one path is taken, making your logic more predictable and efficient.

### If-Else If-Else Chain

**What**: Multiple conditions can be checked in sequence using else-if chains.

**How**: Here's how to handle multiple conditions:

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {  // First condition
        println!("{} is divisible by 4", number);
    } else if number % 3 == 0 {  // Second condition
        println!("{} is divisible by 3", number);
    } else if number % 2 == 0 {  // Third condition
        println!("{} is divisible by 2", number);
    } else {  // Default case
        println!("{} is not divisible by 4, 3, or 2", number);
    }
}
```

**Explanation**:

- Conditions are checked in order from top to bottom
- Only the first true condition executes
- Once a condition is true, the rest are skipped
- The `else` block handles all remaining cases

**Why**: Else-if chains allow you to handle multiple specific cases while maintaining a single execution path.

## Understanding If as Expressions

### If Expressions Return Values

**What**: In Rust, `if` can be used as an expression that returns a value, not just a statement that executes code.

**Why**: This allows you to assign values based on conditions, making your code more concise and functional.

**How**: Here's how to use if as an expression:

```rust
fn main() {
    let number = 6;

    let result = if number % 2 == 0 {  // If condition is true
        "even"  // Return this value
    } else {  // If condition is false
        "odd"   // Return this value
    };

    println!("{} is {}", number, result);
}
```

**Explanation**:

- The entire `if` expression evaluates to a value
- Both branches must return the same type (`&str` in this case)
- The result is assigned to the `result` variable
- No semicolon after the `if` expression (it's an expression, not a statement)

**When**: Use if expressions when you need to assign a value based on a condition.

### Multiple Conditions with Expressions

**What**: You can chain multiple conditions in if expressions to handle complex logic.

**How**: Here's how to handle multiple conditions:

```rust
fn main() {
    let score = 85;

    let grade = if score >= 90 {  // A grade
        "A"
    } else if score >= 80 {  // B grade
        "B"
    } else if score >= 70 {  // C grade
        "C"
    } else if score >= 60 {  // D grade
        "D"
    } else {  // F grade
        "F"
    };

    println!("Score: {}, Grade: {}", score, grade);
}
```

**Explanation**:

- Each condition is checked in order
- The first true condition determines the return value
- All branches must return the same type (`&str`)
- The expression evaluates to a single value

**Why**: This pattern is common for classification, grading, and categorization logic.

### Complex Expressions

**What**: If expressions can contain complex calculations and return different types of values.

**How**: Here's how to use complex expressions:

```rust
fn main() {
    let x = 5;
    let y = 10;

    let max = if x > y {  // Compare values
        x  // Return x if it's larger
    } else {
        y  // Return y if it's larger
    };

    println!("Max of {} and {} is {}", x, y, max);
}
```

**Explanation**:

- The condition `x > y` compares two values
- If true, the expression returns `x`
- If false, the expression returns `y`
- Both branches return the same type (`i32`)
- The result is the maximum of the two values

**Why**: Complex expressions allow you to perform calculations and return results based on conditions.

## Understanding Boolean Conditions

### Comparison Operators

**What**: Comparison operators allow you to compare values and create boolean conditions.

**How**: Here are all the comparison operators in Rust:

```rust
fn main() {
    let a = 5;
    let b = 10;

    println!("a = {}, b = {}", a, b);
    println!("a == b: {}", a == b);  // Equal to
    println!("a != b: {}", a != b);  // Not equal to
    println!("a < b: {}", a < b);    // Less than
    println!("a > b: {}", a > b);    // Greater than
    println!("a <= b: {}", a <= b);  // Less than or equal
    println!("a >= b: {}", a >= b);  // Greater than or equal
}
```

**Explanation**:

- `==` checks if two values are equal
- `!=` checks if two values are not equal
- `<` checks if the left value is less than the right
- `>` checks if the left value is greater than the right
- `<=` checks if the left value is less than or equal to the right
- `>=` checks if the left value is greater than or equal to the right
- All operators return `true` or `false`

**Why**: Comparison operators are fundamental for creating conditions that control program flow.

### Logical Operators

**What**: Logical operators allow you to combine multiple conditions using AND, OR, and NOT logic.

**How**: Here's how to use logical operators:

```rust
fn main() {
    let age = 25;
    let has_license = true;
    let has_insurance = false;

    // AND operator (&&) - both conditions must be true
    if age >= 18 && has_license {
        println!("Can drive");
    }

    // OR operator (||) - at least one condition must be true
    if age >= 18 || has_license {
        println!("Can drive or has license");
    }

    // NOT operator (!) - inverts the condition
    if !has_insurance {
        println!("No insurance");
    }

    // Complex conditions - combine multiple operators
    if age >= 18 && has_license && has_insurance {
        println!("Fully qualified to drive");
    }
}
```

**Explanation**:

- `&&` (AND) requires both conditions to be true
- `||` (OR) requires at least one condition to be true
- `!` (NOT) inverts a boolean value
- You can combine multiple operators for complex logic
- Use parentheses to control order of evaluation

**Why**: Logical operators allow you to create sophisticated conditions that handle real-world scenarios.

### String Comparisons

**What**: String comparisons allow you to check text data for equality and other conditions.

**How**: Here's how to compare strings:

```rust
fn main() {
    let name = "Alice";
    let age = 25;

    // Exact string comparison
    if name == "Alice" && age >= 18 {
        println!("Welcome, Alice!");
    }

    // Not equal comparison
    if name != "Bob" {
        println!("You're not Bob");
    }

    // Case-insensitive comparison
    if name.to_lowercase() == "alice" {
        println!("Hello, Alice!");
    }
}
```

**Explanation**:

- `==` compares strings for exact equality
- `!=` checks if strings are different
- `to_lowercase()` converts to lowercase for case-insensitive comparison
- String comparisons are case-sensitive by default
- You can combine string comparisons with other conditions

**Why**: String comparisons are essential for user input validation, authentication, and text processing.

## Understanding Nested If Statements

### Nested Conditions

**What**: Nested if statements place one if statement inside another, creating a hierarchy of conditions.

**How**: Here's how to use nested conditions:

```rust
fn main() {
    let age = 25;
    let has_license = true;
    let has_insurance = true;

    if age >= 18 {  // First condition: age check
        if has_license {  // Second condition: license check
            if has_insurance {  // Third condition: insurance check
                println!("You can drive!");  // All conditions met
            } else {
                println!("You need insurance to drive");  // Missing insurance
            }
        } else {
            println!("You need a license to drive");  // Missing license
        }
    } else {
        println!("You're too young to drive");  // Too young
    }
}
```

**Explanation**:

- The outer `if` checks age first
- Only if age is valid, the inner `if` checks for license
- Only if license is valid, the innermost `if` checks for insurance
- Each level provides specific error messages
- The structure creates a decision tree

**Why**: Nested conditions allow you to handle complex scenarios with specific error messages for each failure point.

### Flattened Nested Conditions

**What**: You can often simplify nested conditions by using logical operators to flatten the structure.

**How**: Here's how to flatten nested conditions:

```rust
fn main() {
    let age = 25;
    let has_license = true;
    let has_insurance = true;

    if age >= 18 && has_license && has_insurance {  // All conditions combined
        println!("You can drive!");
    } else if age < 18 {  // Specific failure cases
        println!("You're too young to drive");
    } else if !has_license {
        println!("You need a license to drive");
    } else if !has_insurance {
        println!("You need insurance to drive");
    }
}
```

**Explanation**:

- `&&` combines all success conditions into one check
- `else if` statements handle each specific failure case
- The logic is flattened into a single level
- Each condition is checked in order
- This approach is often more readable

**Why**: Flattened conditions are easier to read and maintain, especially for complex business logic.

## Working with Different Data Types

### Numeric Conditions

**What**: You can use if statements with different numeric types to create conditions based on numeric values.

**How**: Here's how to work with numeric conditions:

```rust
fn main() {
    let temperature = 25.5;  // Floating-point number

    let weather = if temperature > 30.0 {  // Hot weather
        "hot"
    } else if temperature > 20.0 {  // Warm weather
        "warm"
    } else if temperature > 10.0 {  // Cool weather
        "cool"
    } else {  // Cold weather
        "cold"
    };

    println!("Temperature: {}°C, Weather: {}", temperature, weather);
}
```

**Explanation**:

- `temperature` is a floating-point number (`f64`)
- Each condition checks a different temperature range
- The conditions are ordered from highest to lowest
- The first true condition determines the result
- All branches return the same type (`&str`)

**Why**: Numeric conditions are common in scientific calculations, weather applications, and data analysis.

### Character Conditions

**What**: You can use if statements with character data to handle single-character inputs and classifications.

**How**: Here's how to work with character conditions:

```rust
fn main() {
    let grade = 'B';  // Single character

    let description = if grade == 'A' {  // Excellent grade
        "Excellent"
    } else if grade == 'B' {  // Good grade
        "Good"
    } else if grade == 'C' {  // Average grade
        "Average"
    } else if grade == 'D' {  // Below average grade
        "Below Average"
    } else if grade == 'F' {  // Fail grade
        "Fail"
    } else {  // Invalid grade
        "Invalid Grade"
    };

    println!("Grade: {}, Description: {}", grade, description);
}
```

**Explanation**:

- `grade` is a single character (`char`)
- Each condition checks for a specific grade character
- Character comparisons use single quotes (`'A'`)
- The `else` block handles invalid grades
- This pattern is common in grading systems

**Why**: Character conditions are useful for handling single-character inputs, menu selections, and grade classifications.

### Boolean Conditions

**What**: You can combine multiple boolean variables to create complex decision logic.

**How**: Here's how to work with boolean conditions:

```rust
fn main() {
    let is_weekend = true;   // Boolean variable
    let is_holiday = false;  // Boolean variable
    let is_sunny = true;     // Boolean variable

    let activity = if is_weekend && is_sunny {  // Best conditions
        "Go to the park"
    } else if is_weekend {  // Weekend but not sunny
        "Stay home and relax"
    } else if is_holiday {  // Holiday but not weekend
        "Celebrate the holiday"
    } else {  // Regular weekday
        "Go to work"
    };

    println!("Activity: {}", activity);
}
```

**Explanation**:

- Each variable is a boolean (`true` or `false`)
- `&&` combines conditions (both must be true)
- The conditions are ordered by priority
- Boolean variables make conditions very readable
- This pattern is common in decision-making logic

**Why**: Boolean conditions make complex decision logic readable and maintainable.

## Common If Expression Patterns

### Range Checking

**What**: Range checking validates that values fall within specific numeric ranges.

**How**: Here's how to implement range checking:

```rust
fn main() {
    let score = 85;

    let grade = if score >= 90 && score <= 100 {  // A range: 90-100
        "A"
    } else if score >= 80 && score < 90 {  // B range: 80-89
        "B"
    } else if score >= 70 && score < 80 {  // C range: 70-79
        "C"
    } else if score >= 60 && score < 70 {  // D range: 60-69
        "D"
    } else if score >= 0 && score < 60 {   // F range: 0-59
        "F"
    } else {  // Invalid range
        "Invalid Score"
    };

    println!("Score: {}, Grade: {}", score, grade);
}
```

**Explanation**:

- Each condition checks both upper and lower bounds
- `&&` ensures the value is within the range
- Ranges are mutually exclusive (no overlap)
- The `else` block handles invalid scores
- This pattern is common in grading systems

**Why**: Range checking ensures data validity and provides clear boundaries for different categories.

### Multiple Variable Conditions

**What**: You can compare multiple variables to find the largest, smallest, or determine relationships.

**How**: Here's how to compare multiple variables:

```rust
fn main() {
    let x = 5;
    let y = 10;
    let z = 15;

    let result = if x > y && x > z {  // x is largest
        "x is the largest"
    } else if y > x && y > z {  // y is largest
        "y is the largest"
    } else if z > x && z > y {  // z is largest
        "z is the largest"
    } else {  // There's a tie
        "There's a tie"
    };

    println!("{}", result);
}
```

**Explanation**:

- Each condition checks if one variable is greater than both others
- `&&` ensures the variable is greater than both competitors
- The conditions are mutually exclusive
- The `else` block handles ties (when no variable is clearly largest)
- This pattern is useful for finding maximum values

**Why**: Multiple variable comparisons are common in algorithms, data analysis, and decision-making systems.

### Function Calls in Conditions

**What**: You can call functions within conditions to create more complex logic.

**How**: Here's how to use function calls in conditions:

```rust
fn main() {
    let number = 17;

    if is_prime(number) {  // Call function in condition
        println!("{} is prime", number);
    } else {
        println!("{} is not prime", number);
    }
}

fn is_prime(n: u32) -> bool {  // Function that returns boolean
    if n < 2 {  // Numbers less than 2 are not prime
        return false;
    }

    for i in 2..n {  // Check divisors from 2 to n-1
        if n % i == 0 {  // If divisible by any number
            return false;  // Not prime
        }
    }
    true  // If no divisors found, it's prime
}
```

**Explanation**:

- `is_prime(number)` calls the function and returns a boolean
- The function checks if a number is prime
- The condition uses the function's return value
- This allows complex logic to be separated into functions
- Function calls make conditions more readable

**Why**: Function calls in conditions allow you to create reusable logic and keep conditions simple and readable.

## Error Handling with If

### Safe Division

**What**: You can use if statements to prevent runtime errors by checking for dangerous conditions.

**How**: Here's how to handle division by zero safely:

```rust
fn main() {
    let dividend = 10;
    let divisor = 0;

    if divisor != 0 {  // Check for safe division
        let result = dividend / divisor;
        println!("{} / {} = {}", dividend, divisor, result);
    } else {  // Handle the error case
        println!("Cannot divide by zero!");
    }
}
```

**Explanation**:

- `divisor != 0` checks if division is safe
- Only perform division if the divisor is not zero
- The `else` block handles the error case
- This prevents a runtime panic from division by zero
- Always check for dangerous operations before performing them

**Why**: Safe division prevents crashes and provides meaningful error messages.

### Safe Array Access

**What**: You can use if statements to prevent array index out-of-bounds errors.

**How**: Here's how to safely access array elements:

```rust
fn main() {
    let numbers = [1, 2, 3, 4, 5];
    let index = 3;

    if index < numbers.len() {  // Check if index is valid
        println!("numbers[{}] = {}", index, numbers[index]);
    } else {  // Handle out-of-bounds case
        println!("Index {} is out of bounds!", index);
    }
}
```

**Explanation**:

- `index < numbers.len()` checks if the index is within bounds
- `numbers.len()` returns the number of elements in the array
- Only access the array if the index is valid
- The `else` block handles invalid indices
- This prevents runtime panics from array access

**Why**: Safe array access prevents crashes and provides clear error messages for debugging.

## Practice Exercises

### Exercise 1: Number Classification

**What**: Classify numbers as positive, negative, or zero.

**How**: Try implementing this classification:

```rust
fn main() {
    let number = 15;

    let classification = if number > 0 {  // Positive numbers
        "positive"
    } else if number < 0 {  // Negative numbers
        "negative"
    } else {  // Zero
        "zero"
    };

    println!("{} is {}", number, classification);
}
```

### Exercise 2: Age Categories

**What**: Categorize people by age groups.

**How**: Implement this age categorization:

```rust
fn main() {
    let age = 25;

    let category = if age < 13 {  // Children
        "child"
    } else if age < 20 {  // Teenagers
        "teenager"
    } else if age < 65 {  // Adults
        "adult"
    } else {  // Seniors
        "senior"
    };

    println!("Age {} is a {}", age, category);
}
```

### Exercise 3: Temperature Converter

**What**: Convert between Celsius and Fahrenheit.

**How**: Implement this temperature conversion:

```rust
fn main() {
    let temperature = 25.0;
    let scale = "C";

    let converted = if scale == "C" {  // Convert from Celsius
        temperature * 9.0 / 5.0 + 32.0  // To Fahrenheit
    } else {  // Convert from Fahrenheit
        (temperature - 32.0) * 5.0 / 9.0  // To Celsius
    };

    let new_scale = if scale == "C" { "F" } else { "C" };

    println!("{}°{} = {:.1}°{}", temperature, scale, converted, new_scale);
}
```

### Exercise 4: Password Strength

**What**: Assess password strength based on length.

**How**: Implement this password strength checker:

```rust
fn main() {
    let password = "MyPassword123";

    let strength = if password.len() < 6 {  // Very short
        "weak"
    } else if password.len() < 10 {  // Short
        "medium"
    } else if password.len() < 15 {  // Medium
        "strong"
    } else {  // Long
        "very strong"
    };

    println!("Password strength: {}", strength);
}
```

## Key Takeaways

**What** you've learned about if expressions:

1. **If statements use boolean conditions** - expressions that evaluate to true/false
2. **If can be used as expressions** - return values based on conditions
3. **Use logical operators** - && (AND), || (OR), ! (NOT) for complex conditions
4. **Nest conditions carefully** - consider flattening for readability
5. **Handle edge cases** - check for division by zero, array bounds, etc.
6. **Use meaningful variable names** - make conditions readable
7. **Error handling is important** - prevent runtime crashes with safe checks

**Why** these concepts matter:

- **Conditional logic** is fundamental to programming
- **Safe programming** prevents crashes and improves reliability
- **Readable conditions** make code maintainable
- **Error handling** creates robust applications

## Next Steps

Now that you understand if expressions, you're ready to learn about:

- **Loop structures** (loop, while, for) - repeating actions and iterations
- **Pattern matching with match** - powerful conditional logic
- **Advanced control flow** - complex program flow management
- **Error handling patterns** - robust error management

**Where** to go next: Continue with the next lesson on "Loops" to learn about repetition and iteration in Rust!
