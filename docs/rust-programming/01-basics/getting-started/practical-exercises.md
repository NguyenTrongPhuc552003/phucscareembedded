---
sidebar_position: 4
---

# Practical Exercises

Master your Rust programming skills with comprehensive hands-on exercises using the 4W+H framework.

## What Are Practical Exercises?

**What**: Practical exercises are hands-on coding challenges that reinforce the concepts you've learned in Week 1: Getting Started with Rust.

**Why**: Practical exercises are essential because:

- **Skill reinforcement** helps you internalize Rust concepts through practice
- **Real-world application** connects theoretical knowledge to practical programming
- **Problem-solving development** builds your ability to think like a programmer
- **Confidence building** gives you hands-on experience with Rust syntax and features
- **Learning progression** prepares you for more advanced Rust concepts

**When**: Complete these exercises when:

- You've finished the Week 1 lessons (Installation, Hello World, Cargo Basics)
- You want to practice what you've learned
- You're preparing for the next chapter (Variables and Data Types)
- You need hands-on experience with Rust programming
- You want to build confidence in your Rust skills

**How**: These exercises work by:

- **Progressive difficulty** starting with simple programs and building complexity
- **Real-world scenarios** using practical examples you might encounter
- **Comprehensive coverage** testing all the concepts from Week 1
- **Detailed explanations** helping you understand every line of code
- **Skill building** preparing you for advanced Rust programming

**Where**: Use these exercises in your learning journey to solidify your understanding of Rust fundamentals and prepare for more advanced topics.

## Exercise 1: Hello World Variations

**What**: This exercise builds on the basic "Hello, World!" program to create variations that demonstrate different Rust concepts.

**Why**: Hello World variations are important because:

- **Foundation building** reinforces the basic structure of Rust programs
- **Concept introduction** demonstrates arrays, loops, and user input
- **Progressive learning** builds complexity gradually from simple concepts
- **Confidence building** gives you success with familiar patterns
- **Skill development** prepares you for more complex programming tasks

**When**: Complete this exercise when:

- You've mastered the basic Hello World program
- You want to practice with arrays and loops
- You're learning about user input in Rust
- You need to build confidence with basic Rust syntax
- You're preparing for more advanced exercises

### Basic Hello World

**What**: The traditional Hello World program that demonstrates the basic structure of a Rust program.

**How**: Here's the fundamental Hello World program:

```rust
fn main() {
    println!("Hello, world!");
}
```

**Explanation**:

- `fn main()` defines the main function, which is the entry point of every Rust program
- `println!` is a macro that prints text to the console with a newline
- `"Hello, world!"` is a string literal that will be displayed
- This is the simplest possible Rust program that produces output

**Why**: This program establishes the basic structure and demonstrates that your Rust environment is working correctly.

### Personalized Greeting

**What**: A program that asks for user input and creates a personalized greeting.

**How**: Here's how to create an interactive greeting program:

```rust
use std::io;

fn main() {
    println!("What's your name?");
    let mut name = String::new();
    io::stdin().read_line(&mut name).expect("Failed to read line");

    println!("Hello, {}!", name.trim());
}
```

**Explanation**:

- `use std::io;` imports the input/output module for user input
- `let mut name = String::new();` creates a mutable string to store user input
- `io::stdin().read_line(&mut name)` reads a line from standard input into the name variable
- `.expect("Failed to read line")` handles potential errors from input reading
- `name.trim()` removes whitespace (like newlines) from the input
- The program creates a personalized greeting using the user's name

**Why**: This program demonstrates user input, string handling, and basic error handling in Rust.

### Multiple Greetings

**What**: A program that uses arrays and loops to generate multiple greetings.

**How**: Here's how to create multiple greetings using arrays and loops:

```rust
fn main() {
    let greetings = ["Hello", "Hi", "Hey", "Greetings"];
    let names = ["Alice", "Bob", "Charlie"];

    for greeting in greetings.iter() {
        for name in names.iter() {
            println!("{}, {}!", greeting, name);
        }
    }
}
```

**Explanation**:

- `let greetings = [...]` creates an array of greeting strings
- `let names = [...]` creates an array of name strings
- `for greeting in greetings.iter()` iterates over each greeting
- `for name in names.iter()` iterates over each name (nested loop)
- `greetings.iter()` creates an iterator over the greetings array
- The nested loops create all possible combinations of greetings and names
- This demonstrates array usage and nested loop patterns in Rust

**Why**: This program introduces arrays, iterators, and nested loops while building on basic output concepts.

## Exercise 2: Simple Calculator

**What**: This exercise creates a calculator program that demonstrates user input, type conversion, pattern matching, and error handling.

**Why**: Calculator programs are valuable because:

- **Real-world application** demonstrates practical programming concepts
- **Input handling** teaches you to work with user input and type conversion
- **Error handling** shows how to handle invalid input and edge cases
- **Pattern matching** introduces the powerful `match` expression
- **Mathematical operations** demonstrates basic arithmetic in Rust

**When**: Complete this exercise when:

- You understand basic input/output operations
- You want to practice with type conversion
- You're learning about pattern matching with `match`
- You need experience with error handling
- You want to build a practical application

### Basic Calculator

**What**: A calculator that performs basic arithmetic operations (addition, subtraction, multiplication, division) with user input.

**How**: Here's how to create a simple calculator:

```rust
use std::io;

fn main() {
    println!("Simple Calculator");
    println!("Enter first number:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let num1: f64 = input.trim().parse().expect("Please enter a valid number");

    println!("Enter second number:");
    input.clear();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let num2: f64 = input.trim().parse().expect("Please enter a valid number");

    println!("Enter operation (+, -, *, /):");
    input.clear();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let operation = input.trim();

    let result = match operation {
        "+" => num1 + num2,
        "-" => num1 - num2,
        "*" => num1 * num2,
        "/" => {
            if num2 != 0.0 {
                num1 / num2
            } else {
                println!("Error: Division by zero!");
                return;
            }
        },
        _ => {
            println!("Error: Invalid operation!");
            return;
        }
    };

    println!("Result: {} {} {} = {}", num1, operation, num2, result);
}
```

**Explanation**:

- `use std::io;` imports the input/output module for user input
- `let mut input = String::new();` creates a mutable string for input
- `io::stdin().read_line(&mut input)` reads user input into the string
- `input.trim().parse()` converts the string to a number, removing whitespace first
- `input.clear()` clears the string for reuse
- `match operation` uses pattern matching to handle different operations
- `if num2 != 0.0` checks for division by zero to prevent errors
- `return` exits the program early if there's an error
- The program demonstrates input validation, error handling, and mathematical operations

**Why**: This program teaches essential programming concepts like user input, type conversion, pattern matching, and error handling while creating a practical application.

### Enhanced Calculator with Functions

```rust
use std::io;

fn add(a: f64, b: f64) -> f64 {
    a + b
}

fn subtract(a: f64, b: f64) -> f64 {
    a - b
}

fn multiply(a: f64, b: f64) -> f64 {
    a * b
}

fn divide(a: f64, b: f64) -> Option<f64> {
    if b != 0.0 {
        Some(a / b)
    } else {
        None
    }
}

fn main() {
    println!("Enhanced Calculator");
    println!("Enter first number:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let num1: f64 = input.trim().parse().expect("Please enter a valid number");

    println!("Enter second number:");
    input.clear();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let num2: f64 = input.trim().parse().expect("Please enter a valid number");

    println!("Enter operation (+, -, *, /):");
    input.clear();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let operation = input.trim();

    let result = match operation {
        "+" => Some(add(num1, num2)),
        "-" => Some(subtract(num1, num2)),
        "*" => Some(multiply(num1, num2)),
        "/" => divide(num1, num2),
        _ => {
            println!("Error: Invalid operation!");
            return;
        }
    };

    match result {
        Some(value) => println!("Result: {} {} {} = {}", num1, operation, num2, value),
        None => println!("Error: Division by zero!"),
    }
}
```

## Exercise 3: Number Guessing Game

### Basic Guessing Game

```rust
use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..101);
    let mut attempts = 0;

    loop {
        println!("Please input your guess:");

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
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win! You guessed it in {} attempts!", attempts);
                break;
            }
        }
    }
}
```

### Enhanced Guessing Game with Limits

```rust
use std::io;
use std::cmp::Ordering;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..101);
    let max_attempts = 7;
    let mut attempts = 0;

    loop {
        if attempts >= max_attempts {
            println!("You've used all {} attempts! The secret number was {}", max_attempts, secret_number);
            break;
        }

        println!("Attempt {}/{}: Please input your guess:", attempts + 1, max_attempts);

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
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win! You guessed it in {} attempts!", attempts);
                break;
            }
        }
    }
}
```

## Exercise 4: Temperature Converter

### Celsius to Fahrenheit

```rust
use std::io;

fn celsius_to_fahrenheit(celsius: f64) -> f64 {
    celsius * 9.0 / 5.0 + 32.0
}

fn fahrenheit_to_celsius(fahrenheit: f64) -> f64 {
    (fahrenheit - 32.0) * 5.0 / 9.0
}

fn main() {
    println!("Temperature Converter");
    println!("Choose conversion:");
    println!("1. Celsius to Fahrenheit");
    println!("2. Fahrenheit to Celsius");

    let mut choice = String::new();
    io::stdin().read_line(&mut choice).expect("Failed to read line");

    match choice.trim() {
        "1" => {
            println!("Enter temperature in Celsius:");
            let mut input = String::new();
            io::stdin().read_line(&mut input).expect("Failed to read line");
            let celsius: f64 = input.trim().parse().expect("Please enter a valid number");
            let fahrenheit = celsius_to_fahrenheit(celsius);
            println!("{}°C = {:.2}°F", celsius, fahrenheit);
        },
        "2" => {
            println!("Enter temperature in Fahrenheit:");
            let mut input = String::new();
            io::stdin().read_line(&mut input).expect("Failed to read line");
            let fahrenheit: f64 = input.trim().parse().expect("Please enter a valid number");
            let celsius = fahrenheit_to_celsius(fahrenheit);
            println!("{}°F = {:.2}°C", fahrenheit, celsius);
        },
        _ => println!("Invalid choice!"),
    }
}
```

## Exercise 5: Simple Text Adventure

### Basic Adventure Game

```rust
use std::io;

fn main() {
    println!("Welcome to the Rust Adventure!");
    println!("You find yourself in a dark forest.");
    println!("What do you do?");
    println!("1. Go left");
    println!("2. Go right");
    println!("3. Go straight");

    let mut choice = String::new();
    io::stdin().read_line(&mut choice).expect("Failed to read line");

    match choice.trim() {
        "1" => {
            println!("You go left and find a treasure chest!");
            println!("You win!");
        },
        "2" => {
            println!("You go right and encounter a friendly dragon!");
            println!("The dragon gives you a magic sword!");
            println!("You win!");
        },
        "3" => {
            println!("You go straight and fall into a pit!");
            println!("Game over!");
        },
        _ => println!("Invalid choice! You stand still and nothing happens."),
    }
}
```

## Exercise 6: Number Statistics

### Basic Statistics Calculator

```rust
use std::io;

fn main() {
    println!("Number Statistics Calculator");
    println!("Enter numbers separated by spaces:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");

    let numbers: Vec<f64> = input
        .split_whitespace()
        .map(|s| s.parse().expect("Please enter valid numbers"))
        .collect();

    if numbers.is_empty() {
        println!("No numbers entered!");
        return;
    }

    let sum: f64 = numbers.iter().sum();
    let average = sum / numbers.len() as f64;
    let min = numbers.iter().fold(f64::INFINITY, |a, &b| a.min(b));
    let max = numbers.iter().fold(f64::NEG_INFINITY, |a, &b| a.max(b));

    println!("Numbers: {:?}", numbers);
    println!("Sum: {}", sum);
    println!("Average: {:.2}", average);
    println!("Minimum: {}", min);
    println!("Maximum: {}", max);
}
```

## Exercise 7: Password Generator

### Simple Password Generator

```rust
use std::io;
use rand::Rng;

fn generate_password(length: usize) -> String {
    const CHARSET: &[u8] = b"ABCDEFGHIJKLMNOPQRSTUVWXYZ\
                            abcdefghijklmnopqrstuvwxyz\
                            0123456789!@#$%^&*";

    let mut rng = rand::thread_rng();
    let password: String = (0..length)
        .map(|_| {
            let idx = rng.gen_range(0..CHARSET.len());
            CHARSET[idx] as char
        })
        .collect();

    password
}

fn main() {
    println!("Password Generator");
    println!("Enter password length:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let length: usize = input.trim().parse().expect("Please enter a valid number");

    if length < 4 {
        println!("Password length must be at least 4 characters!");
        return;
    }

    let password = generate_password(length);
    println!("Generated password: {}", password);
}
```

## Exercise 8: File Size Converter

### Byte Converter

```rust
use std::io;

fn convert_bytes(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    const THRESHOLD: u64 = 1024;

    let mut size = bytes as f64;
    let mut unit_index = 0;

    while size >= THRESHOLD as f64 && unit_index < UNITS.len() - 1 {
        size /= THRESHOLD as f64;
        unit_index += 1;
    }

    format!("{:.2} {}", size, UNITS[unit_index])
}

fn main() {
    println!("File Size Converter");
    println!("Enter size in bytes:");

    let mut input = String::new();
    io::stdin().read_line(&mut input).expect("Failed to read line");
    let bytes: u64 = input.trim().parse().expect("Please enter a valid number");

    let converted = convert_bytes(bytes);
    println!("{} bytes = {}", bytes, converted);
}
```

## Exercise 9: Simple Quiz Game

### Basic Quiz

```rust
use std::io;

struct Question {
    question: String,
    answer: String,
}

fn main() {
    let questions = vec![
        Question {
            question: "What is the capital of France?".to_string(),
            answer: "Paris".to_string(),
        },
        Question {
            question: "What is 2 + 2?".to_string(),
            answer: "4".to_string(),
        },
        Question {
            question: "What is the largest planet in our solar system?".to_string(),
            answer: "Jupiter".to_string(),
        },
    ];

    let mut score = 0;

    for (i, question) in questions.iter().enumerate() {
        println!("Question {}: {}", i + 1, question.question);

        let mut answer = String::new();
        io::stdin().read_line(&mut answer).expect("Failed to read line");

        if answer.trim().to_lowercase() == question.answer.to_lowercase() {
            println!("Correct!");
            score += 1;
        } else {
            println!("Incorrect! The answer is: {}", question.answer);
        }
        println!();
    }

    println!("Quiz complete! Your score: {}/{}", score, questions.len());
}
```

## Exercise 10: Simple Todo List

### Basic Todo List

```rust
use std::io;

struct TodoItem {
    id: u32,
    task: String,
    completed: bool,
}

fn main() {
    let mut todos: Vec<TodoItem> = Vec::new();
    let mut next_id = 1;

    loop {
        println!("Todo List Manager");
        println!("1. Add task");
        println!("2. List tasks");
        println!("3. Mark complete");
        println!("4. Exit");
        println!("Choose an option:");

        let mut choice = String::new();
        io::stdin().read_line(&mut choice).expect("Failed to read line");

        match choice.trim() {
            "1" => {
                println!("Enter task:");
                let mut task = String::new();
                io::stdin().read_line(&mut task).expect("Failed to read line");

                todos.push(TodoItem {
                    id: next_id,
                    task: task.trim().to_string(),
                    completed: false,
                });
                next_id += 1;
                println!("Task added!");
            },
            "2" => {
                if todos.is_empty() {
                    println!("No tasks yet!");
                } else {
                    for todo in &todos {
                        let status = if todo.completed { "✓" } else { " " };
                        println!("{} [{}] {}", status, todo.id, todo.task);
                    }
                }
            },
            "3" => {
                println!("Enter task ID to mark complete:");
                let mut input = String::new();
                io::stdin().read_line(&mut input).expect("Failed to read line");
                let id: u32 = input.trim().parse().expect("Please enter a valid ID");

                if let Some(todo) = todos.iter_mut().find(|t| t.id == id) {
                    todo.completed = true;
                    println!("Task marked as complete!");
                } else {
                    println!("Task not found!");
                }
            },
            "4" => {
                println!("Goodbye!");
                break;
            },
            _ => println!("Invalid choice!"),
        }
        println!();
    }
}
```

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Hello World Mastery** - You've created variations of the Hello World program with user input and loops
2. **Calculator Development** - You've built a functional calculator with error handling and pattern matching
3. **Input/Output Skills** - You can handle user input, type conversion, and formatted output
4. **Error Handling** - You understand how to handle invalid input and edge cases
5. **Pattern Matching** - You can use `match` expressions for conditional logic
6. **Array and Loop Usage** - You can work with arrays and create nested loops
7. **Practical Programming** - You've built real-world applications that solve problems

**Why** these concepts matter:

- **Hello World variations** build confidence and introduce fundamental concepts
- **Calculator programs** demonstrate practical programming skills and error handling
- **Input/output operations** are essential for interactive applications
- **Error handling** makes your programs robust and user-friendly
- **Pattern matching** is a powerful Rust feature for conditional logic
- **Arrays and loops** enable you to work with collections of data
- **Practical applications** connect learning to real-world programming

**When** to use these concepts:

- **Building interactive programs** - Use input/output operations for user interaction
- **Handling user data** - Use type conversion and validation for robust input handling
- **Creating conditional logic** - Use pattern matching for complex decision-making
- **Working with collections** - Use arrays and loops for data processing
- **Error prevention** - Use error handling to create reliable programs
- **Learning progression** - Build on these concepts for advanced Rust programming

**Where** these skills apply:

- **Personal projects** - Creating your own Rust applications and tools
- **Team development** - Working with others on shared Rust codebases
- **Open source contribution** - Understanding and contributing to Rust projects
- **Professional development** - Using Rust effectively in production environments
- **Learning progression** - Building on this foundation for advanced Rust concepts

## Practice Tips

**What** you should focus on when practicing:

1. **Start Simple** - Begin with basic exercises and gradually increase complexity
2. **Read Error Messages** - Rust's compiler errors are very helpful and descriptive
3. **Experiment** - Try modifying the code to see what happens and learn from changes
4. **Use Documentation** - Refer to the Rust Book and standard library documentation
5. **Practice Regularly** - Code every day to build muscle memory and confidence
6. **Understand Concepts** - Don't just copy code; understand why each line works
7. **Build Projects** - Create your own variations and extensions of these exercises

**Why** these tips matter:

- **Progressive learning** ensures you build skills systematically
- **Error understanding** helps you debug and improve your code
- **Experimentation** deepens your understanding of how Rust works
- **Documentation usage** teaches you to be self-sufficient as a programmer
- **Regular practice** builds the muscle memory needed for programming fluency

## Next Steps

**What** you're ready for next:

After completing these exercises, you should be comfortable with:

- **Basic Rust syntax** - Understanding the fundamental structure of Rust programs
- **Input/output operations** - Reading user input and displaying formatted output
- **Simple control flow** - Using conditional logic and basic loops
- **Basic error handling** - Managing potential errors in your programs
- **Cargo project management** - Creating and managing Rust projects
- **Pattern matching** - Using `match` expressions for conditional logic
- **Array and loop usage** - Working with collections and iteration

**Where** to go next:

Continue with the next chapter on **"Variables and Data Types"** to learn:

- How to declare and use variables in Rust
- Understanding Rust's powerful type system
- Working with different data types (integers, floats, booleans, characters)
- Using compound types (tuples, arrays)
- Type conversions and annotations

**Why** the next chapter is important:

The next chapter builds directly on your practical experience by showing you how to store and manipulate data in your Rust programs. You'll learn about Rust's powerful type system and how to use variables effectively.

**How** to continue learning:

1. **Complete all exercises** - Make sure you understand each exercise thoroughly
2. **Experiment with variations** - Try modifying the code to create your own versions
3. **Read the documentation** - Explore the resources provided
4. **Join the community** - Engage with other Rust learners and developers
5. **Build projects** - Start creating your own Rust applications

## Resources

**Official Documentation**:

- [The Rust Book](https://doc.rust-lang.org/book/) - Comprehensive Rust programming guide
- [Rust by Example](https://doc.rust-lang.org/rust-by-example/) - Learn Rust through examples
- [Rust Playground](https://play.rust-lang.org/) - Online Rust compiler

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
