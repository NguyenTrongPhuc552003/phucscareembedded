---
sidebar_position: 4
---

# Match Expressions

Master pattern matching in Rust with comprehensive explanations using the 4W+H framework.

## What Are Match Expressions?

**What**: Match expressions are powerful control structures that allow you to compare a value against a series of patterns and execute code based on the first matching pattern.

**Why**: Match expressions are essential for:

- **Exhaustive pattern matching** - ensuring all cases are handled
- **Safe data handling** - preventing runtime errors through compile-time checks
- **Clean code organization** - replacing complex if-else chains
- **Functional programming** - enabling declarative programming styles
- **Error handling** - managing success and failure cases elegantly

**When**: Use match expressions when you need to:

- Handle multiple possible values or states
- Process different data types safely
- Implement state machines or finite automata
- Handle errors and optional values
- Create clean, readable conditional logic

## Understanding Basic Match

### Simple Match

**What**: A basic match expression compares a value against literal patterns and executes the corresponding code.

**How**: Here's the fundamental syntax:

```rust
fn main() {
    let number = 3;  // Value to match against

    match number {  // Match expression
        1 => println!("One"),  // Pattern 1
        2 => println!("Two"),  // Pattern 2
        3 => println!("Three"),  // Pattern 3
        _ => println!("Something else"),  // Catch-all pattern
    }
}
```

**Explanation**:

- `match number` starts the match expression
- Each `pattern => code` is called an "arm"
- Patterns are checked in order from top to bottom
- `_` is the catch-all pattern that matches anything
- Only the first matching pattern executes
- The match is exhaustive (all possibilities covered)

**Why**: Simple match expressions provide clear, readable alternatives to if-else chains.

### Match with Return Values

**What**: Match expressions can return values, making them useful as expressions in assignments and function calls.

**How**: Here's how to use match as an expression:

```rust
fn main() {
    let number = 2;  // Value to match

    let description = match number {  // Match as expression
        1 => "one",  // Return string literal
        2 => "two",  // Return string literal
        3 => "three",  // Return string literal
        _ => "something else",  // Return string literal
    };

    println!("{} is {}", number, description);  // Use returned value
}
```

**Explanation**:

- The entire `match` expression evaluates to a value
- Each arm returns a value of the same type (`&str`)
- The result is assigned to the `description` variable
- No semicolon after the match expression (it's an expression, not a statement)
- This pattern is common for value transformation

**Why**: Returning values from match expressions enables functional programming patterns and clean data transformation.

### Match with Multiple Patterns

**What**: You can match multiple values using the `|` (or) operator to combine patterns.

**How**: Here's how to use multiple patterns:

```rust
fn main() {
    let number = 5;  // Value to match

    match number {  // Match with multiple patterns
        1 | 2 | 3 => println!("Small number"),  // Multiple patterns with |
        4 | 5 | 6 => println!("Medium number"),  // Multiple patterns with |
        7 | 8 | 9 => println!("Large number"),  // Multiple patterns with |
        _ => println!("Very large number"),  // Catch-all pattern
    }
}
```

**Explanation**:

- `1 | 2 | 3` matches any of the values 1, 2, or 3
- The `|` operator means "or" for pattern matching
- This reduces code duplication by grouping similar cases
- Patterns are still checked in order
- This is more concise than separate arms for each value

**Why**: Multiple patterns reduce code duplication and make match expressions more maintainable.

## Understanding Match with Ranges

### Range Patterns

**What**: Range patterns allow you to match values within a specific range using the `..=` operator.

**How**: Here's how to use range patterns:

```rust
fn main() {
    let score = 85;  // Score to grade

    let grade = match score {  // Match with ranges
        90..=100 => "A",  // Range from 90 to 100 (inclusive)
        80..=89 => "B",   // Range from 80 to 89 (inclusive)
        70..=79 => "C",   // Range from 70 to 79 (inclusive)
        60..=69 => "D",   // Range from 60 to 69 (inclusive)
        0..=59 => "F",    // Range from 0 to 59 (inclusive)
        _ => "Invalid score",  // Catch-all for invalid scores
    };

    println!("Score: {}, Grade: {}", score, grade);  // Print result
}
```

**Explanation**:

- `90..=100` creates an inclusive range from 90 to 100
- The `..=` operator includes both endpoints
- Ranges are checked in order from top to bottom
- The first matching range determines the grade
- This pattern is common for classification systems

**Why**: Range patterns are perfect for grading systems, age categories, and any classification based on numeric ranges.

### Character Ranges

**What**: You can use range patterns with characters to classify text data.

**How**: Here's how to match character ranges:

```rust
fn main() {
    let ch = 'M';  // Character to classify

    let category = match ch {  // Match character ranges
        'A'..='Z' => "uppercase letter",  // A to Z inclusive
        'a'..='z' => "lowercase letter",  // a to z inclusive
        '0'..='9' => "digit",             // 0 to 9 inclusive
        _ => "other character",           // Catch-all for other chars
    };

    println!("'{}' is a {}", ch, category);  // Print classification
}
```

**Explanation**:

- `'A'..='Z'` matches any uppercase letter
- `'a'..='z'` matches any lowercase letter
- `'0'..='9'` matches any digit
- Character ranges use ASCII/Unicode ordering
- This pattern is common in text processing and validation

**Why**: Character ranges are essential for text processing, input validation, and character classification.

## Understanding Match with Guards

### Guard Conditions

**What**: Guards add additional conditions to patterns using the `if` keyword, allowing more complex matching logic.

**How**: Here's how to use guard conditions:

```rust
fn main() {
    let number = 15;  // Value to match with guards

    match number {  // Match with guard conditions
        x if x < 10 => println!("Less than 10"),        // Guard: x < 10
        x if x < 20 => println!("Between 10 and 20"),   // Guard: x < 20
        x if x < 30 => println!("Between 20 and 30"),  // Guard: x < 30
        _ => println!("30 or greater"),                 // Catch-all
    }
}
```

**Explanation**:

- `x if x < 10` binds the value to `x` and adds a condition
- The guard `if x < 10` must be true for the pattern to match
- Guards are evaluated after pattern matching
- This allows complex conditions that can't be expressed with simple patterns
- Guards are useful for range-like conditions with variables

**Why**: Guards provide flexibility for complex matching conditions that go beyond simple pattern matching.

### Complex Guards

**What**: Guards can use complex conditions with multiple variables and logical operators.

**How**: Here's how to use complex guards:

```rust
fn main() {
    let x = 5;   // First variable
    let y = 10;  // Second variable

    match (x, y) {  // Match tuple with complex guards
        (a, b) if a == b => println!("Equal"),           // Guard: a == b
        (a, b) if a > b => println!("First is greater"), // Guard: a > b
        (a, b) if a < b => println!("Second is greater"), // Guard: a < b
        _ => println!("Something else"),                 // Catch-all
    }
}
```

**Explanation**:

- `(a, b)` destructures the tuple into variables `a` and `b`
- `if a == b` checks if the values are equal
- `if a > b` checks if the first is greater
- `if a < b` checks if the second is greater
- Guards can use any boolean expression
- This pattern is common for comparing multiple values

**Why**: Complex guards enable sophisticated matching logic that combines pattern matching with conditional logic.

## Understanding Match with Tuples

### Tuple Patterns

**What**: Tuple patterns allow you to destructure tuples and match against their components.

**How**: Here's how to match tuple patterns:

```rust
fn main() {
    let point = (3, 4);  // Tuple to match

    match point {  // Match tuple patterns
        (0, 0) => println!("Origin"),                    // Exact match
        (0, y) => println!("On y-axis at {}", y),        // First is 0, bind second
        (x, 0) => println!("On x-axis at {}", x),        // Second is 0, bind first
        (x, y) => println!("Point at ({}, {})", x, y),   // Bind both values
    }
}
```

**Explanation**:

- `(0, 0)` matches the exact tuple (0, 0)
- `(0, y)` matches any tuple where the first element is 0, binding the second to `y`
- `(x, 0)` matches any tuple where the second element is 0, binding the first to `x`
- `(x, y)` matches any tuple, binding both elements to variables
- This pattern is common for coordinate systems and geometric calculations

**Why**: Tuple patterns are essential for working with coordinate data, pairs, and structured data.

### Nested Tuples

**What**: You can match nested tuples by using nested pattern syntax.

**How**: Here's how to match nested tuples:

```rust
fn main() {
    let nested = ((1, 2), (3, 4));  // Nested tuple

    match nested {  // Match nested tuple patterns
        ((0, 0), (0, 0)) => println!("Both points are origin"),  // Both origins
        ((0, 0), _) => println!("First point is origin"),        // First is origin
        (_, (0, 0)) => println!("Second point is origin"),       // Second is origin
        ((x1, y1), (x2, y2)) => println!("Points: ({}, {}) and ({}, {})", x1, y1, x2, y2),  // Both points
    }
}
```

**Explanation**:

- `((0, 0), (0, 0))` matches nested tuples where both inner tuples are (0, 0)
- `((0, 0), _)` matches when the first inner tuple is (0, 0), ignoring the second
- `(_, (0, 0))` matches when the second inner tuple is (0, 0), ignoring the first
- `((x1, y1), (x2, y2))` destructures both inner tuples into separate variables
- This pattern is common for working with multiple coordinate points

**Why**: Nested tuple patterns are essential for complex data structures and multi-dimensional data.

## Match with Arrays

### Array Patterns

```rust
fn main() {
    let array = [1, 2, 3];

    match array {
        [1, 2, 3] => println!("Exact match"),
        [1, 2, _] => println!("Starts with 1, 2"),
        [_, 2, _] => println!("Middle element is 2"),
        _ => println!("No match"),
    }
}
```

### Array Slices

```rust
fn main() {
    let array = [1, 2, 3, 4, 5];

    match array {
        [first, ..] if *first == 1 => println!("Starts with 1"),
        [.., last] if *last == 5 => println!("Ends with 5"),
        [first, middle @ .., last] => println!("First: {}, Last: {}, Middle: {:?}", first, last, middle),
        _ => println!("No match"),
    }
}
```

## Match with Enums

### Basic Enum Matching

```rust
enum Direction {
    North,
    South,
    East,
    West,
}

fn main() {
    let direction = Direction::North;

    match direction {
        Direction::North => println!("Go north"),
        Direction::South => println!("Go south"),
        Direction::East => println!("Go east"),
        Direction::West => println!("Go west"),
    }
}
```

### Enum with Data

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}

fn main() {
    let message = Message::Move { x: 10, y: 20 };

    match message {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => println!("Move to ({}, {})", x, y),
        Message::Write(text) => println!("Write: {}", text),
        Message::ChangeColor(r, g, b) => println!("Change color to RGB({}, {}, {})", r, g, b),
    }
}
```

## Match with Option

### Option Matching

```rust
fn main() {
    let some_number = Some(42);
    let no_number: Option<i32> = None;

    match some_number {
        Some(value) => println!("Got value: {}", value),
        None => println!("No value"),
    }

    match no_number {
        Some(value) => println!("Got value: {}", value),
        None => println!("No value"),
    }
}
```

### Option with Functions

```rust
fn divide(x: i32, y: i32) -> Option<i32> {
    if y != 0 {
        Some(x / y)
    } else {
        None
    }
}

fn main() {
    let result = divide(10, 2);

    match result {
        Some(value) => println!("Result: {}", value),
        None => println!("Cannot divide by zero"),
    }
}
```

## Match with Result

### Result Matching

```rust
fn divide(x: i32, y: i32) -> Result<i32, String> {
    if y != 0 {
        Ok(x / y)
    } else {
        Err("Division by zero".to_string())
    }
}

fn main() {
    let result = divide(10, 2);

    match result {
        Ok(value) => println!("Result: {}", value),
        Err(error) => println!("Error: {}", error),
    }

    let error_result = divide(10, 0);

    match error_result {
        Ok(value) => println!("Result: {}", value),
        Err(error) => println!("Error: {}", error),
    }
}
```

## Advanced Match Patterns

### Destructuring

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let point = Point { x: 3, y: 4 };

    match point {
        Point { x: 0, y: 0 } => println!("Origin"),
        Point { x: 0, y } => println!("On y-axis at {}", y),
        Point { x, y: 0 } => println!("On x-axis at {}", x),
        Point { x, y } => println!("Point at ({}, {})", x, y),
    }
}
```

### Binding with @

```rust
fn main() {
    let number = 15;

    match number {
        x @ 1..=10 => println!("Small number: {}", x),
        x @ 11..=20 => println!("Medium number: {}", x),
        x @ 21..=30 => println!("Large number: {}", x),
        x => println!("Very large number: {}", x),
    }
}
```

### Multiple Patterns with Binding

```rust
fn main() {
    let value = Some(42);

    match value {
        Some(x @ 1..=10) => println!("Small value: {}", x),
        Some(x @ 11..=100) => println!("Medium value: {}", x),
        Some(x) => println!("Large value: {}", x),
        None => println!("No value"),
    }
}
```

## Common Match Patterns

### Error Handling

```rust
fn parse_number(s: &str) -> Result<i32, String> {
    match s.parse::<i32>() {
        Ok(value) => Ok(value),
        Err(_) => Err("Invalid number".to_string()),
    }
}

fn main() {
    let result = parse_number("42");

    match result {
        Ok(value) => println!("Parsed: {}", value),
        Err(error) => println!("Error: {}", error),
    }
}
```

### State Machine

```rust
enum State {
    Idle,
    Running,
    Paused,
    Stopped,
}

fn main() {
    let state = State::Running;

    match state {
        State::Idle => println!("System is idle"),
        State::Running => println!("System is running"),
        State::Paused => println!("System is paused"),
        State::Stopped => println!("System is stopped"),
    }
}
```

## Practice Exercises

### Exercise 1: Grade Classification

```rust
fn main() {
    let score = 85;

    let grade = match score {
        90..=100 => "A",
        80..=89 => "B",
        70..=79 => "C",
        60..=69 => "D",
        0..=59 => "F",
        _ => "Invalid score",
    };

    println!("Score: {}, Grade: {}", score, grade);
}
```

### Exercise 2: Day of Week

```rust
fn main() {
    let day = 3;

    let day_name = match day {
        1 => "Monday",
        2 => "Tuesday",
        3 => "Wednesday",
        4 => "Thursday",
        5 => "Friday",
        6 => "Saturday",
        7 => "Sunday",
        _ => "Invalid day",
    };

    println!("Day {} is {}", day, day_name);
}
```

### Exercise 3: Calculator

```rust
fn main() {
    let operation = "+";
    let x = 10;
    let y = 5;

    let result = match operation {
        "+" => x + y,
        "-" => x - y,
        "*" => x * y,
        "/" => {
            if y != 0 {
                x / y
            } else {
                println!("Cannot divide by zero!");
                return;
            }
        },
        _ => {
            println!("Invalid operation!");
            return;
        }
    };

    println!("{} {} {} = {}", x, operation, y, result);
}
```

### Exercise 4: Pattern Matching with Tuples

```rust
fn main() {
    let point = (0, 5);

    match point {
        (0, 0) => println!("Origin"),
        (0, y) => println!("On y-axis at {}", y),
        (x, 0) => println!("On x-axis at {}", x),
        (x, y) => println!("Point at ({}, {})", x, y),
    }
}
```

## Key Takeaways

1. **Match is exhaustive** - must handle all possible cases
2. **Use `_` for catch-all** - handles any remaining cases
3. **Patterns can be complex** - tuples, arrays, enums, structs
4. **Guards add conditions** - use `if` for additional logic
5. **Binding with `@`** - capture matched values
6. **Match returns values** - can be used as expressions

## Next Steps

Now that you understand match expressions, you're ready to learn about:

- Error handling patterns
- Advanced control flow
- Function composition
- Ownership and borrowing
