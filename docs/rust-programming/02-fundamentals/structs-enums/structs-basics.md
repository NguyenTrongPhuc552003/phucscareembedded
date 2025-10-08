---
sidebar_position: 1
---

# Structs Basics

Master the fundamentals of Rust structs with comprehensive explanations using the 4W+H framework.

## What Are Structs in Rust?

**What**: Structs are custom data types that allow you to group related data together. They're similar to classes in other languages but focus on data rather than behavior.

**Why**: Understanding structs is crucial because:

- **Data organization** helps you group related information together
- **Type safety** provides compile-time guarantees about your data
- **Code clarity** makes your programs more readable and maintainable
- **Real-world modeling** allows you to represent real-world concepts in code
- **Performance** enables efficient data storage and access
- **Reusability** lets you create reusable data structures

**When**: Use structs when you need to:

- Group related data together
- Create custom data types
- Model real-world entities
- Organize complex data
- Build reusable components
- Represent state in your programs

**How**: Structs work in Rust by:

- **Defining structure** with named fields
- **Instantiating** with specific values
- **Accessing fields** using dot notation
- **Ownership rules** applying to struct fields
- **Memory layout** organizing data efficiently

**Where**: Structs are used throughout Rust programs for data modeling, API design, and building complex applications.

## Understanding Struct Definition

### Basic Struct Syntax

**What**: The fundamental syntax for defining structs in Rust.

**Why**: Understanding struct definition is important because:

- **Type creation** allows you to define custom data types
- **Field specification** lets you specify what data the struct contains
- **Compile-time safety** ensures all fields are properly typed
- **Code organization** helps you structure your data logically

**When**: Use struct definition when you need to create a new data type.

**How**: Here's how to define a basic struct:

```rust
struct Person {
    name: String,
    age: u32,
    email: String,
}
```

**Explanation**:

- `struct Person` declares a new struct type named `Person`
- `name: String` defines a field called `name` that holds a `String` value
- `age: u32` defines a field called `age` that holds an unsigned 32-bit integer
- `email: String` defines a field called `email` that holds a `String` value
- Each field has a name and a type, separated by a colon
- The struct definition ends with a semicolon
- This creates a blueprint for creating `Person` instances

**Why**: This demonstrates the basic syntax for defining structs and shows how to specify the data that each instance will contain.

### Struct Field Types

**What**: Different types of fields you can include in structs.

**Why**: Understanding field types is important because:

- **Flexibility** allows you to store different kinds of data
- **Type safety** ensures each field has the correct type
- **Memory efficiency** lets you choose appropriate types for your data
- **API design** enables you to create clear interfaces

**When**: Use different field types when you need to store various kinds of data.

**How**: Here's how to use different field types:

```rust
struct UserProfile {
    id: u64,                    // Unsigned 64-bit integer
    username: String,           // Owned string
    is_active: bool,            // Boolean value
    score: f64,                 // 64-bit floating point
    tags: Vec<String>,         // Vector of strings
    metadata: Option<String>,   // Optional string
}

fn main() {
    let user = UserProfile {
        id: 12345,
        username: String::from("alice_developer"),
        is_active: true,
        score: 95.5,
        tags: vec![String::from("rust"), String::from("programming")],
        metadata: Some(String::from("Senior Developer")),
    };

    println!("User: {} (ID: {})", user.username, user.id);
    println!("Active: {}, Score: {}", user.is_active, user.score);
    println!("Tags: {:?}", user.tags);
}
```

**Explanation**:

- `id: u64` stores a large unsigned integer for unique identification
- `username: String` stores an owned string for the user's name
- `is_active: bool` stores a boolean flag for account status
- `score: f64` stores a floating-point number for user rating
- `tags: Vec<String>` stores a vector (dynamic array) of strings
- `metadata: Option<String>` stores an optional string that might not exist
- Each field type serves a specific purpose in the data structure
- The struct can hold both simple and complex data types

**Why**: This demonstrates the flexibility of Rust structs and shows how to combine different data types in a single structure.

## Understanding Struct Instantiation

### Creating Struct Instances

**What**: How to create instances of structs with specific values.

**Why**: Understanding struct instantiation is important because:

- **Data creation** allows you to create actual instances of your structs
- **Value assignment** lets you set specific values for each field
- **Memory allocation** creates the actual data in memory
- **Usage patterns** shows how to work with struct instances

**When**: Use struct instantiation when you need to create actual instances of your structs.

**How**: Here's how to create struct instances:

```rust
struct Person {
    name: String,
    age: u32,
    email: String,
}

fn main() {
    // Create a new Person instance
    let person1 = Person {
        name: String::from("Alice"),
        age: 25,
        email: String::from("alice@example.com"),
    };

    // Create another Person instance
    let person2 = Person {
        name: String::from("Bob"),
        age: 30,
        email: String::from("bob@example.com"),
    };

    println!("Person 1: {} (age {})", person1.name, person1.age);
    println!("Person 2: {} (age {})", person2.name, person2.age);
}
```

**Explanation**:

- `let person1 = Person { ... }` creates a new instance of the Person struct
- `name: String::from("Alice")` assigns a specific value to the name field
- `age: 25` assigns a specific value to the age field
- `email: String::from("alice@example.com")` assigns a specific value to the email field
- Each field must be provided with a value of the correct type
- The order of fields doesn't matter, but all fields must be specified
- `person1` and `person2` are separate instances with their own data

**Why**: This demonstrates how to create actual instances of structs and shows the relationship between struct definitions and instances.

### Field Initialization Shorthand

**What**: Rust's shorthand syntax for initializing struct fields when variable names match field names.

**Why**: Understanding field initialization shorthand is important because:

- **Code conciseness** reduces boilerplate when variable names match field names
- **Readability** makes code cleaner and easier to read
- **Efficiency** speeds up development by reducing repetitive code
- **Idiomatic Rust** follows Rust's preferred coding style

**When**: Use field initialization shorthand when your variable names match your struct field names.

**How**: Here's how to use field initialization shorthand:

```rust
struct Point {
    x: i32,
    y: i32,
    z: i32,
}

fn main() {
    let x = 10;
    let y = 20;
    let z = 30;

    // Long form - explicitly specifying field names
    let point1 = Point {
        x: x,
        y: y,
        z: z,
    };

    // Shorthand form - when variable names match field names
    let point2 = Point {
        x,
        y,
        z,
    };

    println!("Point 1: ({}, {}, {})", point1.x, point1.y, point1.z);
    println!("Point 2: ({}, {}, {})", point2.x, point2.y, point2.z);
}
```

**Explanation**:

- `let x = 10;` creates a variable named `x` with value 10
- `let y = 20;` creates a variable named `y` with value 20
- `let z = 30;` creates a variable named `z` with value 30
- `Point { x: x, y: y, z: z }` is the long form where field names are explicitly specified
- `Point { x, y, z }` is the shorthand form where Rust automatically matches variable names to field names
- Both forms create identical struct instances
- The shorthand form is preferred when variable names match field names

**Why**: This demonstrates Rust's shorthand syntax and shows how to write more concise code when variable names match struct field names.

## Understanding Field Access

### Reading Struct Fields

**What**: How to access and read values from struct fields.

**Why**: Understanding field access is important because:

- **Data retrieval** allows you to get values from struct instances
- **Information access** enables you to use the data stored in structs
- **Field inspection** lets you examine the current state of struct instances
- **Data processing** allows you to work with the stored information

**When**: Use field access when you need to read values from struct instances.

**How**: Here's how to access struct fields:

```rust
struct Student {
    name: String,
    age: u32,
    grade: char,
    gpa: f64,
}

fn main() {
    let student = Student {
        name: String::from("Emma"),
        age: 20,
        grade: 'A',
        gpa: 3.8,
    };

    // Access individual fields using dot notation
    println!("Student Information:");
    println!("Name: {}", student.name);
    println!("Age: {}", student.age);
    println!("Grade: {}", student.grade);
    println!("GPA: {}", student.gpa);

    // Use fields in calculations
    let is_honor_roll = student.gpa >= 3.5;
    println!("Honor Roll: {}", is_honor_roll);

    // Use fields in conditional logic
    if student.age >= 18 {
        println!("{} is an adult student", student.name);
    }
}
```

**Explanation**:

- `student.name` accesses the name field and returns the String value
- `student.age` accesses the age field and returns the u32 value
- `student.grade` accesses the grade field and returns the char value
- `student.gpa` accesses the gpa field and returns the f64 value
- Dot notation (`.`) is used to access fields on struct instances
- Field values can be used in expressions, calculations, and conditional logic
- The type of each field determines what operations you can perform on it

**Why**: This demonstrates how to access struct fields and shows how the retrieved values can be used in various contexts.

### Modifying Struct Fields

**What**: How to modify struct fields when the struct instance is mutable.

**Why**: Understanding field modification is important because:

- **Data updates** allows you to change the values stored in struct fields
- **State changes** enables you to update the state of your data structures
- **Mutable access** shows how to work with mutable struct instances
- **Field updates** demonstrates how to modify specific fields

**When**: Use field modification when you need to change the values stored in struct fields.

**How**: Here's how to modify struct fields:

```rust
struct Counter {
    value: i32,
    step: i32,
}

fn main() {
    let mut counter = Counter {
        value: 0,
        step: 1,
    };

    println!("Initial value: {}", counter.value);

    // Modify the value field
    counter.value += counter.step;
    println!("After increment: {}", counter.value);

    // Modify the step field
    counter.step = 5;
    println!("New step: {}", counter.step);

    // Use the new step
    counter.value += counter.step;
    println!("After step increment: {}", counter.value);

    // Reset the counter
    counter.value = 0;
    println!("Reset value: {}", counter.value);
}
```

**Explanation**:

- `let mut counter` declares a mutable variable, allowing field modification
- `counter.value += counter.step` modifies the value field by adding the step
- `counter.step = 5` directly assigns a new value to the step field
- `counter.value = 0` resets the value field to zero
- Only mutable struct instances can have their fields modified
- Each field can be modified independently
- Field modifications take effect immediately

**Why**: This demonstrates how to modify struct fields and shows the importance of mutability for field updates.

## Understanding Struct Ownership

### Ownership of Struct Fields

**What**: How ownership rules apply to struct fields and instances.

**Why**: Understanding struct ownership is important because:

- **Memory management** shows how Rust manages memory for struct instances
- **Ownership rules** demonstrates how Rust's ownership system applies to structs
- **Field ownership** explains who owns the data in struct fields
- **Move semantics** shows how struct instances are moved between variables

**When**: Use struct ownership knowledge when working with struct instances and their fields.

**How**: Here's how struct ownership works:

```rust
struct Book {
    title: String,
    author: String,
    pages: u32,
}

fn main() {
    let book1 = Book {
        title: String::from("The Rust Programming Language"),
        author: String::from("Steve Klabnik"),
        pages: 552,
    };

    println!("Book: {} by {}", book1.title, book1.author);

    // Move the struct instance to another variable
    let book2 = book1;  // book1 is moved to book2

    // This would cause a compile error:
    // println!("Book: {}", book1.title);  // Error: use after move

    println!("Book: {} by {}", book2.title, book2.author);

    // The struct instance is dropped when book2 goes out of scope
}
```

**Explanation**:

- `let book1 = Book { ... }` creates a struct instance owned by `book1`
- The `String` fields (`title`, `author`) are owned by the struct instance
- `let book2 = book1;` moves the entire struct instance from `book1` to `book2`
- After the move, `book1` is no longer valid and cannot be used
- The struct instance is now owned by `book2`
- When `book2` goes out of scope, the entire struct and its fields are dropped
- This demonstrates Rust's move semantics for struct instances

**Why**: This demonstrates how Rust's ownership system applies to structs and shows the importance of understanding move semantics.

### Borrowing Struct Fields

**What**: How to borrow struct fields without taking ownership.

**Why**: Understanding struct borrowing is important because:

- **Access without ownership** allows you to read struct fields without taking ownership
- **Multiple references** enables you to have multiple references to the same struct
- **Borrowing rules** shows how Rust's borrowing system applies to structs
- **Field access** demonstrates how to access fields through references

**When**: Use struct borrowing when you need to access struct fields without taking ownership.

**How**: Here's how to borrow struct fields:

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn print_dimensions(rect: &Rectangle) {
    println!("Width: {}, Height: {}", rect.width, rect.height);
}

fn calculate_area(rect: &Rectangle) -> u32 {
    rect.width * rect.height
}

fn main() {
    let rect = Rectangle {
        width: 30,
        height: 50,
    };

    // Borrow the struct to pass to functions
    print_dimensions(&rect);

    let area = calculate_area(&rect);
    println!("Area: {}", area);

    // The original struct is still valid
    println!("Original width: {}", rect.width);
}
```

**Explanation**:

- `fn print_dimensions(rect: &Rectangle)` takes a reference to a Rectangle
- `fn calculate_area(rect: &Rectangle) -> u32` also takes a reference to a Rectangle
- `&rect` creates a reference to the struct instance
- `rect.width` and `rect.height` access fields through the reference
- The original struct instance remains valid after the function calls
- References allow you to access struct data without taking ownership
- Multiple functions can borrow the same struct instance

**Why**: This demonstrates how to work with struct references and shows how borrowing allows you to access struct data without taking ownership.

## Understanding Struct Patterns

### Struct Update Syntax

**What**: How to create new struct instances based on existing ones using update syntax.

**Why**: Understanding struct update syntax is important because:

- **Efficient updates** allows you to create new structs based on existing ones
- **Partial updates** enables you to change only some fields while keeping others
- **Code reuse** reduces duplication when creating similar struct instances
- **Update patterns** shows common patterns for struct modification

**When**: Use struct update syntax when you need to create new struct instances based on existing ones.

**How**: Here's how to use struct update syntax:

```rust
struct User {
    id: u64,
    username: String,
    email: String,
    is_active: bool,
    last_login: String,
}

fn main() {
    let user1 = User {
        id: 1,
        username: String::from("alice"),
        email: String::from("alice@example.com"),
        is_active: true,
        last_login: String::from("2024-01-15"),
    };

    // Create a new user based on user1, changing only some fields
    let user2 = User {
        id: 2,
        username: String::from("bob"),
        email: String::from("bob@example.com"),
        ..user1  // Use the rest of the fields from user1
    };

    // Create another user with different active status
    let user3 = User {
        is_active: false,
        ..user2  // Use the rest of the fields from user2
    };

    println!("User 1: {} ({})", user1.username, user1.email);
    println!("User 2: {} ({})", user2.username, user2.email);
    println!("User 3: {} - Active: {}", user3.username, user3.is_active);
}
```

**Explanation**:

- `let user1 = User { ... }` creates the first user with all fields specified
- `let user2 = User { ... }` creates a new user with some fields changed
- `..user1` uses the rest of the fields from `user1` for the new struct
- `let user3 = User { ... }` creates another user with different active status
- `..user2` uses the rest of the fields from `user2` for the new struct
- The update syntax allows you to change specific fields while keeping others
- This pattern is useful for creating variations of existing struct instances

**Why**: This demonstrates the struct update syntax and shows how to efficiently create new struct instances based on existing ones.

### Tuple Structs

**What**: Alternative struct syntax using tuples instead of named fields.

**Why**: Understanding tuple structs is important because:

- **Alternative syntax** provides a different way to define structs
- **Positional access** allows you to access fields by position instead of name
- **Lightweight structs** creates simple structs without field names
- **Pattern matching** enables you to destructure tuple structs

**When**: Use tuple structs when you need simple structs without named fields.

**How**: Here's how to use tuple structs:

```rust
// Tuple struct with one field
struct UserId(u64);

// Tuple struct with multiple fields
struct Point(i32, i32, i32);

// Tuple struct with different types
struct Color(u8, u8, u8, u8);  // RGBA values

fn main() {
    let user_id = UserId(12345);
    let point = Point(10, 20, 30);
    let color = Color(255, 128, 64, 255);

    // Access fields by position
    println!("User ID: {}", user_id.0);
    println!("Point: ({}, {}, {})", point.0, point.1, point.2);
    println!("Color: RGBA({}, {}, {}, {})", color.0, color.1, color.2, color.3);

    // Destructure tuple structs
    let Point(x, y, z) = point;
    println!("Destructured: x={}, y={}, z={}", x, y, z);
}
```

**Explanation**:

- `struct UserId(u64)` defines a tuple struct with one field of type `u64`
- `struct Point(i32, i32, i32)` defines a tuple struct with three `i32` fields
- `struct Color(u8, u8, u8, u8)` defines a tuple struct with four `u8` fields
- `UserId(12345)` creates an instance by providing values in order
- `point.0`, `point.1`, `point.2` access fields by position (0-indexed)
- `let Point(x, y, z) = point;` destructures the tuple struct into variables
- Tuple structs are useful for simple data that doesn't need named fields

**Why**: This demonstrates tuple structs and shows how they provide an alternative syntax for defining structs with positional access.

## Practice Exercises

### Exercise 1: Basic Struct Creation

**What**: Create a struct to represent a student with basic information.

**How**: Here's how to practice basic struct creation:

```rust
struct Student {
    name: String,
    age: u32,
    grade: char,
    gpa: f64,
}

fn main() {
    let student = Student {
        name: String::from("Alice"),
        age: 20,
        grade: 'A',
        gpa: 3.8,
    };

    println!("Student: {} (age {})", student.name, student.age);
    println!("Grade: {}, GPA: {}", student.grade, student.gpa);
}
```

### Exercise 2: Struct with Different Field Types

**What**: Create a struct that demonstrates various field types.

**How**: Here's how to practice with different field types:

```rust
struct Product {
    id: u64,
    name: String,
    price: f64,
    in_stock: bool,
    tags: Vec<String>,
}

fn main() {
    let product = Product {
        id: 1001,
        name: String::from("Rust Programming Book"),
        price: 49.99,
        in_stock: true,
        tags: vec![String::from("programming"), String::from("rust")],
    };

    println!("Product: {} (ID: {})", product.name, product.id);
    println!("Price: ${}, In Stock: {}", product.price, product.in_stock);
    println!("Tags: {:?}", product.tags);
}
```

### Exercise 3: Mutable Struct Fields

**What**: Create a mutable struct and modify its fields.

**How**: Here's how to practice with mutable struct fields:

```rust
struct Counter {
    value: i32,
    step: i32,
}

fn main() {
    let mut counter = Counter {
        value: 0,
        step: 1,
    };

    println!("Initial: {}", counter.value);

    // Increment the counter
    counter.value += counter.step;
    println!("After increment: {}", counter.value);

    // Change the step
    counter.step = 5;
    counter.value += counter.step;
    println!("After step change: {}", counter.value);
}
```

## Key Takeaways

**What** you've learned about structs:

1. **Struct Definition** - How to define structs with named fields and different types
2. **Struct Instantiation** - How to create instances of structs with specific values
3. **Field Access** - How to access and modify struct fields using dot notation
4. **Field Initialization Shorthand** - How to use shorthand syntax when variable names match field names
5. **Struct Ownership** - How ownership rules apply to struct instances and fields
6. **Struct Borrowing** - How to access struct fields through references
7. **Struct Update Syntax** - How to create new structs based on existing ones
8. **Tuple Structs** - Alternative struct syntax using positional access
9. **Data Organization** - How to group related data together effectively
10. **Type Safety** - How structs provide compile-time data validation

**Why** these concepts matter:

- **Data organization** makes your code more readable and maintainable
- **Type safety** prevents many common programming errors
- **Real-world modeling** allows you to represent entities in your code
- **Code clarity** makes your programs easier to understand and debug
- **Memory safety** ensures proper memory management through ownership
- **API design** enables you to create clean interfaces for your data
- **Flexibility** allows you to choose the right struct pattern for your needs

## Next Steps

Now that you understand basic structs, you're ready to learn about:

- **Struct methods** - Adding behavior to your structs
- **Associated functions** - Functions that work with structs
- **Enums** - Handling multiple possibilities
- **Advanced struct patterns** - Complex data structures
- **Struct traits** - Implementing common behavior
- **Generic structs** - Creating reusable struct definitions

**Where** to go next: Continue with the next lesson on "Struct Methods" to learn how to add behavior to your structs!

## Resources

**Official Documentation**:

- [The Rust Book - Defining Structs](https://doc.rust-lang.org/book/ch05-01-defining-structs.html)
- [Rust by Example - Structs](https://doc.rust-lang.org/rust-by-example/custom_types/structs.html)
- [Rust Reference - Structs](https://doc.rust-lang.org/reference/items/structs.html)

**Community Resources**:

- [Rust Community](https://www.rust-lang.org/community)
- [Rust Users Forum](https://users.rust-lang.org/)
- [Reddit r/rust](https://reddit.com/r/rust)

**Learning Resources**:

- [Rustlings](https://github.com/rust-lang/rustlings)
- [Exercism Rust Track](https://exercism.org/tracks/rust)
- [Rust Cookbook](https://rust-lang-nursery.github.io/rust-cookbook/)

Happy coding! 🦀
