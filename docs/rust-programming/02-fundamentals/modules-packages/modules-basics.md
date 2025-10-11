---
sidebar_position: 1
---

# Modules Basics

Master code organization in Rust with comprehensive explanations using the 4W+H framework.

## What Are Modules in Rust?

**What**: Modules in Rust are a way to organize code into logical units, control visibility, and create a clear structure for your programs. They help you group related functionality together and manage the scope of your code.

**Why**: Understanding modules is crucial because:

- **Code organization** helps you structure large programs logically
- **Visibility control** allows you to hide implementation details
- **Namespace management** prevents naming conflicts
- **Maintainability** makes code easier to understand and modify
- **Reusability** enables you to share code between different parts of your program
- **Team collaboration** allows multiple developers to work on different modules
- **Library development** is essential for creating reusable code

**When**: Use modules when you need to:

- Organize code into logical units
- Control what parts of your code are public or private
- Create libraries and reusable components
- Manage large codebases
- Separate concerns in your application
- Create clear interfaces between different parts of your program

**How**: Modules work in Rust by:

- **Defining boundaries** between different parts of your code
- **Controlling visibility** with `pub` keyword
- **Creating hierarchies** with nested modules
- **Managing imports** with `use` declarations
- **Organizing files** with the module system

**Where**: Modules are used throughout Rust programs for organization, libraries, and large applications.

## Understanding Module Declaration

### Basic Module Syntax

**What**: The fundamental syntax for declaring and using modules in Rust.

**Why**: Understanding module syntax is important because:

- **Code organization** helps you structure your programs
- **Visibility control** allows you to hide implementation details
- **Common patterns** essential for Rust programming
- **Best practices** improve code maintainability

**When**: Use module declarations when you need to organize your code into logical units.

**How**: Here's how to declare and use modules:

```rust
// Declare a module
mod math_utils {
    // Private function (not accessible outside the module)
    fn add_internal(a: i32, b: i32) -> i32 {
        a + b
    }

    // Public function (accessible from outside the module)
    pub fn add(a: i32, b: i32) -> i32 {
        add_internal(a, b)
    }

    pub fn subtract(a: i32, b: i32) -> i32 {
        a - b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }

    // Public constant
    pub const PI: f64 = 3.14159;

    // Private constant
    const E: f64 = 2.71828;
}

fn main() {
    // Use public functions from the module
    let sum = math_utils::add(5, 3);
    let difference = math_utils::subtract(10, 4);
    let product = math_utils::multiply(6, 7);
    let pi_value = math_utils::PI;

    println!("Sum: {}", sum);
    println!("Difference: {}", difference);
    println!("Product: {}", product);
    println!("PI: {}", pi_value);

    // This would cause a compile error - private function
    // let internal = math_utils::add_internal(1, 2);  // Error!
}
```

**Explanation**:

- `mod math_utils` declares a module named `math_utils`
- Functions without `pub` are private to the module
- Functions with `pub` are public and can be accessed from outside
- Constants can also be public or private
- `math_utils::add()` accesses the public function
- Private functions like `add_internal()` cannot be accessed from outside

**Why**: This demonstrates the basic module syntax and visibility control in Rust.

### Nested Modules

**What**: Modules can contain other modules, creating a hierarchical structure.

**Why**: Understanding nested modules is important because:

- **Organization** helps you create logical hierarchies
- **Namespace management** prevents naming conflicts
- **Code structure** makes large programs manageable
- **Common patterns** essential for complex applications

**When**: Use nested modules when you need to organize related functionality into subcategories.

**How**: Here's how to create and use nested modules:

```rust
mod library {
    // Public module
    pub mod math {
        pub fn add(a: i32, b: i32) -> i32 {
            a + b
        }

        pub fn subtract(a: i32, b: i32) -> i32 {
            a - b
        }

        // Nested module within math
        pub mod advanced {
            pub fn power(base: i32, exponent: u32) -> i32 {
                base.pow(exponent)
            }

            pub fn factorial(n: u32) -> u32 {
                if n <= 1 {
                    1
                } else {
                    n * factorial(n - 1)
                }
            }
        }
    }

    // Another public module
    pub mod string_utils {
        pub fn capitalize(s: &str) -> String {
            if s.is_empty() {
                String::new()
            } else {
                let mut chars = s.chars();
                let first = chars.next().unwrap().to_uppercase().collect::<String>();
                let rest: String = chars.collect();
                format!("{}{}", first, rest)
            }
        }

        pub fn reverse(s: &str) -> String {
            s.chars().rev().collect()
        }
    }

    // Private module (not accessible from outside)
    mod internal {
        fn secret_function() -> &'static str {
            "This is a secret!"
        }
    }
}

fn main() {
    // Access nested modules
    let sum = library::math::add(10, 5);
    let power = library::math::advanced::power(2, 3);
    let factorial = library::math::advanced::factorial(5);

    let capitalized = library::string_utils::capitalize("hello");
    let reversed = library::string_utils::reverse("world");

    println!("Sum: {}", sum);
    println!("2^3: {}", power);
    println!("5!: {}", factorial);
    println!("Capitalized: {}", capitalized);
    println!("Reversed: {}", reversed);

    // This would cause a compile error - private module
    // let secret = library::internal::secret_function();  // Error!
}
```

**Explanation**:

- `library::math` is a public module containing math functions
- `library::math::advanced` is a nested module within math
- `library::string_utils` is another public module for string operations
- `library::internal` is a private module (no `pub` keyword)
- You can access nested modules using `::` syntax
- Private modules cannot be accessed from outside the parent module

**Why**: Nested modules allow you to create logical hierarchies and organize complex codebases.

### Module Visibility

**What**: Understanding how visibility works in Rust modules and the different levels of access.

**Why**: Understanding module visibility is important because:

- **Encapsulation** allows you to hide implementation details
- **API design** enables you to create clean interfaces
- **Security** prevents unauthorized access to internal functions
- **Maintainability** makes code easier to modify without breaking external users

**When**: Use different visibility levels when you need to control access to your code.

**How**: Here's how to control visibility in modules:

```rust
mod visibility_demo {
    // Public module
    pub mod public_module {
        // Public function
        pub fn public_function() -> &'static str {
            "This is public"
        }

        // Private function (default)
        fn private_function() -> &'static str {
            "This is private"
        }

        // Public struct
        pub struct PublicStruct {
            pub field: i32,  // Public field
            private_field: i32,  // Private field
        }

        impl PublicStruct {
            // Public constructor
            pub fn new(value: i32) -> Self {
                Self {
                    field: value,
                    private_field: value * 2,
                }
            }

            // Public method
            pub fn get_private_field(&self) -> i32 {
                self.private_field
            }

            // Private method
            fn private_method(&self) -> i32 {
                self.private_field * 2
            }
        }
    }

    // Private module (no pub keyword)
    mod private_module {
        pub fn public_in_private() -> &'static str {
            "Public in private module"
        }

        fn private_in_private() -> &'static str {
            "Private in private module"
        }
    }

    // Re-export from private module
    pub use private_module::public_in_private;
}

fn main() {
    // Access public module
    let message = visibility_demo::public_module::public_function();
    println!("{}", message);

    // Create and use public struct
    let mut struct_instance = visibility_demo::public_module::PublicStruct::new(42);
    println!("Public field: {}", struct_instance.field);
    println!("Private field: {}", struct_instance.get_private_field());

    // Access re-exported function
    let re_exported = visibility_demo::public_in_private();
    println!("Re-exported: {}", re_exported);

    // These would cause compile errors:
    // let private = visibility_demo::public_module::private_function();  // Error!
    // let private_struct = visibility_demo::private_module::public_in_private();  // Error!
    // struct_instance.private_field = 100;  // Error!
}
```

**Explanation**:

- `pub mod` makes a module public
- `pub fn` makes a function public
- `pub struct` makes a struct public
- `pub field` makes a struct field public
- `pub use` re-exports items from other modules
- Private items (no `pub`) cannot be accessed from outside
- You can have public items in private modules, but they're still inaccessible

**Why**: Visibility control is essential for creating clean APIs and hiding implementation details.

## Understanding File-based Modules

### Module Files

**What**: How to organize modules across multiple files for better code organization.

**Why**: Understanding file-based modules is important because:

- **Code organization** helps you structure large projects
- **File management** makes code easier to navigate
- **Team collaboration** allows multiple developers to work on different files
- **Maintainability** improves code readability and organization

**When**: Use file-based modules when you need to organize large codebases into multiple files.

**How**: Here's how to create file-based modules:

```rust
// main.rs
mod math_utils;
mod string_utils;
mod data_structures;

use math_utils::*;
use string_utils::StringProcessor;
use data_structures::LinkedList;

fn main() {
    // Use functions from math_utils module
    let sum = add(10, 5);
    let product = multiply(3, 4);

    // Use struct from string_utils module
    let mut processor = StringProcessor::new();
    let result = processor.process("Hello, World!");

    // Use struct from data_structures module
    let mut list = LinkedList::new();
    list.push(1);
    list.push(2);
    list.push(3);

    println!("Sum: {}", sum);
    println!("Product: {}", product);
    println!("Processed: {}", result);
    println!("List length: {}", list.len());
}
```

**Explanation**:

- `mod math_utils;` tells Rust to look for a `math_utils.rs` file or `math_utils/mod.rs`
- `use math_utils::*;` imports all public items from the module
- `use string_utils::StringProcessor;` imports a specific struct
- Each module can be in its own file for better organization

**Why**: File-based modules allow you to organize large codebases into manageable files.

### Module Directories

**What**: How to organize modules into directories for complex project structures.

**Why**: Understanding module directories is important because:

- **Complex organization** helps you structure large projects
- **Hierarchical structure** creates logical groupings
- **Scalability** supports growing codebases
- **Team collaboration** allows multiple developers to work on different areas

**When**: Use module directories when you need to organize complex projects with many related modules.

**How**: Here's how to create module directories:

```rust
// main.rs
mod utils;
mod models;
mod services;

use utils::math::*;
use models::user::User;
use services::user_service::UserService;

fn main() {
    let sum = add(5, 3);
    let user = User::new("Alice".to_string(), 25);
    let mut user_service = UserService::new();

    user_service.add_user(user);
    println!("Sum: {}", sum);
    println!("Users: {}", user_service.count());
}
```

**Explanation**:

- `mod utils;` looks for `utils/mod.rs` or `utils.rs`
- `mod models;` looks for `models/mod.rs` or `models.rs`
- `mod services;` looks for `services/mod.rs` or `services.rs`
- Each directory can contain multiple modules

**Why**: Module directories provide a scalable way to organize complex projects.

## Understanding Use Declarations

### Basic Use Syntax

**What**: How to import items from modules using the `use` keyword.

**Why**: Understanding use declarations is important because:

- **Code simplification** reduces repetitive module paths
- **Readability** makes code cleaner and easier to read
- **Common patterns** essential for Rust programming
- **Best practices** improve code maintainability

**When**: Use `use` declarations when you need to simplify module access and improve code readability.

**How**: Here's how to use `use` declarations:

```rust
mod math_utils {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn subtract(a: i32, b: i32) -> i32 {
        a - b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }

    pub const PI: f64 = 3.14159;
}

mod string_utils {
    pub fn capitalize(s: &str) -> String {
        if s.is_empty() {
            String::new()
        } else {
            let mut chars = s.chars();
            let first = chars.next().unwrap().to_uppercase().collect::<String>();
            let rest: String = chars.collect();
            format!("{}{}", first, rest)
        }
    }

    pub fn reverse(s: &str) -> String {
        s.chars().rev().collect()
    }
}

fn main() {
    // Without use declarations (verbose)
    let sum1 = math_utils::add(5, 3);
    let product1 = math_utils::multiply(4, 6);
    let pi1 = math_utils::PI;

    // With use declarations (cleaner)
    use math_utils::{add, multiply, PI};
    use string_utils::{capitalize, reverse};

    let sum2 = add(5, 3);
    let product2 = multiply(4, 6);
    let pi2 = PI;

    let capitalized = capitalize("hello");
    let reversed = reverse("world");

    println!("Sum: {}", sum2);
    println!("Product: {}", product2);
    println!("PI: {}", pi2);
    println!("Capitalized: {}", capitalized);
    println!("Reversed: {}", reversed);
}
```

**Explanation**:

- `use math_utils::{add, multiply, PI};` imports specific items
- `use string_utils::{capitalize, reverse};` imports multiple functions
- After importing, you can use the items directly without the module path
- This makes code cleaner and more readable

**Why**: Use declarations simplify code and improve readability by reducing repetitive module paths.

### Advanced Use Patterns

**What**: More advanced patterns for using `use` declarations including aliases and re-exports.

**Why**: Understanding advanced use patterns is important because:

- **Flexibility** provides more options for organizing imports
- **Aliasing** helps avoid naming conflicts
- **Re-exports** enable you to create clean public APIs
- **Common patterns** essential for complex applications

**When**: Use advanced patterns when you need to handle naming conflicts or create clean APIs.

**How**: Here's how to use advanced use patterns:

```rust
mod math_utils {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn subtract(a: i32, b: i32) -> i32 {
        a - b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }
}

mod string_utils {
    pub fn add(a: &str, b: &str) -> String {
        format!("{}{}", a, b)
    }

    pub fn subtract(a: &str, b: &str) -> String {
        a.replace(b, "")
    }
}

mod re_export_demo {
    // Re-export items from other modules
    pub use math_utils::{add as math_add, subtract as math_subtract};
    pub use string_utils::{add as string_add, subtract as string_subtract};

    // Create a unified API
    pub mod operations {
        pub use super::math_utils::*;
        pub use super::string_utils::*;
    }
}

fn main() {
    // Using aliases to avoid naming conflicts
    use math_utils::{add as math_add, subtract as math_subtract};
    use string_utils::{add as string_add, subtract as string_subtract};

    let math_result = math_add(5, 3);
    let string_result = string_add("Hello", " World");

    println!("Math result: {}", math_result);
    println!("String result: {}", string_result);

    // Using re-exports
    let math_result2 = re_export_demo::math_add(10, 5);
    let string_result2 = re_export_demo::string_add("Rust", " Programming");

    println!("Math result 2: {}", math_result2);
    println!("String result 2: {}", string_result2);

    // Using the unified API
    let math_result3 = re_export_demo::operations::add(15, 10);
    let string_result3 = re_export_demo::operations::add("Advanced", " Rust");

    println!("Math result 3: {}", math_result3);
    println!("String result 3: {}", string_result3);
}
```

**Explanation**:

- `add as math_add` creates an alias to avoid naming conflicts
- `pub use` re-exports items from other modules
- `super::` refers to the parent module
- Re-exports allow you to create clean public APIs
- Aliases help resolve naming conflicts between modules

**Why**: Advanced use patterns provide flexibility for handling complex module relationships and naming conflicts.

## Understanding Module Organization

### Project Structure

**What**: How to organize modules in a Rust project for maintainability and clarity.

**Why**: Understanding project structure is important because:

- **Maintainability** makes code easier to understand and modify
- **Team collaboration** allows multiple developers to work effectively
- **Scalability** supports growing codebases
- **Best practices** improve code quality and organization

**When**: Use proper project structure when you need to organize large codebases or work in teams.

**How**: Here's how to organize a Rust project:

```rust
// main.rs - Entry point
mod config;
mod models;
mod services;
mod utils;

use config::AppConfig;
use models::user::User;
use services::user_service::UserService;
use utils::validation::validate_email;

fn main() {
    let config = AppConfig::new();
    let mut user_service = UserService::new();

    let user = User::new("Alice".to_string(), "alice@example.com".to_string());

    if validate_email(&user.email) {
        user_service.add_user(user);
        println!("User added successfully!");
    } else {
        println!("Invalid email address!");
    }
}
```

**Explanation**:

- `main.rs` is the entry point of the application
- `mod config;` imports configuration module
- `mod models;` imports data models
- `mod services;` imports business logic
- `mod utils;` imports utility functions
- Each module has a specific responsibility

**Why**: Proper project structure makes code more maintainable and easier to understand.

### Module Responsibilities

**What**: How to assign clear responsibilities to different modules for better organization.

**Why**: Understanding module responsibilities is important because:

- **Separation of concerns** makes code easier to understand
- **Maintainability** improves code quality
- **Testing** makes it easier to test individual components
- **Reusability** enables you to reuse modules in different contexts

**When**: Use clear module responsibilities when you need to organize complex applications.

**How**: Here's how to assign responsibilities to modules:

```rust
// config/mod.rs - Configuration management
pub struct AppConfig {
    pub database_url: String,
    pub api_key: String,
    pub debug_mode: bool,
}

impl AppConfig {
    pub fn new() -> Self {
        Self {
            database_url: "sqlite://app.db".to_string(),
            api_key: "default_key".to_string(),
            debug_mode: true,
        }
    }
}

// models/user.rs - Data models
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
    pub age: u32,
}

impl User {
    pub fn new(name: String, email: String) -> Self {
        Self {
            id: 0, // Will be set by the service
            name,
            email,
            age: 0, // Default age
        }
    }
}

// services/user_service.rs - Business logic
use crate::models::user::User;
use std::collections::HashMap;

pub struct UserService {
    users: HashMap<u32, User>,
    next_id: u32,
}

impl UserService {
    pub fn new() -> Self {
        Self {
            users: HashMap::new(),
            next_id: 1,
        }
    }

    pub fn add_user(&mut self, mut user: User) -> u32 {
        user.id = self.next_id;
        self.users.insert(user.id, user);
        self.next_id += 1;
        user.id
    }

    pub fn get_user(&self, id: u32) -> Option<&User> {
        self.users.get(&id)
    }

    pub fn count(&self) -> usize {
        self.users.len()
    }
}

// utils/validation.rs - Utility functions
pub fn validate_email(email: &str) -> bool {
    email.contains('@') && email.contains('.')
}

pub fn validate_age(age: u32) -> bool {
    age > 0 && age < 150
}
```

**Explanation**:

- `config` module handles application configuration
- `models` module defines data structures
- `services` module contains business logic
- `utils` module provides utility functions
- Each module has a clear, single responsibility
- Modules can depend on each other through imports

**Why**: Clear module responsibilities make code more maintainable and easier to understand.

## Key Takeaways

**What** you've learned about modules:

1. **Module Declaration** - How to declare and use modules
2. **Visibility Control** - Using `pub` to control access
3. **Nested Modules** - Creating hierarchical module structures
4. **File Organization** - Organizing modules across multiple files
5. **Use Declarations** - Importing items from modules
6. **Project Structure** - Organizing large codebases
7. **Module Responsibilities** - Assigning clear responsibilities

**Why** these concepts matter:

- **Code organization** makes programs more maintainable
- **Visibility control** enables clean API design
- **Module structure** supports team collaboration
- **Best practices** improve code quality

## Next Steps

Now that you understand modules, you're ready to learn about:

- **Packages and Crates** - Managing dependencies and publishing code
- **Advanced Module Patterns** - Complex module relationships
- **Library Development** - Creating reusable code
- **Project Management** - Organizing large applications

**Where** to go next: Continue with the next lesson on "Packages and Crates" to learn about dependency management!
