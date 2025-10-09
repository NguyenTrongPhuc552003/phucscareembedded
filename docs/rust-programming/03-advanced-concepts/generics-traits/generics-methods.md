---
sidebar_position: 2
---

# Generic Methods and Implementations

Master generic methods and implementations in Rust with comprehensive explanations using the 4W+H framework.

## What Are Generic Methods?

**What**: Generic methods are functions within structs, enums, or traits that can work with different types while maintaining type safety. They allow you to write reusable code that adapts to the specific types being used.

**Why**: Understanding generic methods is crucial because:

- **Code reuse** enables writing methods that work with multiple types
- **Type safety** ensures compile-time type checking
- **Performance** provides zero-cost abstractions
- **Flexibility** allows methods to adapt to different data types
- **API design** creates more versatile and reusable interfaces

**When**: Use generic methods when you need to:

- Write methods that work with different types
- Create flexible data structures
- Implement algorithms that work with various types
- Build reusable libraries and frameworks
- Create type-safe APIs

**How**: Generic methods work by using type parameters that are specified when the method is called, allowing the same method to work with different types while maintaining type safety.

**Where**: Generic methods are used throughout Rust programs for flexible data structures, algorithms, and API design.

## Understanding Generic Methods

### Basic Generic Methods

**What**: Generic methods allow structs and enums to have methods that work with different types.

**How**: Here's how to create generic methods:

```rust
struct Container<T> {
    value: T,
}

impl<T> Container<T> {
    fn new(value: T) -> Self {
        Container { value }
    }

    fn get(&self) -> &T {
        &self.value
    }

    fn set(&mut self, value: T) {
        self.value = value;
    }
}

fn main() {
    let mut int_container = Container::new(42);
    let mut string_container = Container::new("Hello".to_string());

    println!("Int container: {}", int_container.get());
    println!("String container: {}", string_container.get());

    int_container.set(100);
    string_container.set("World".to_string());

    println!("Updated int: {}", int_container.get());
    println!("Updated string: {}", string_container.get());
}
```

**Explanation**:

- `impl<T> Container<T>` creates a generic implementation block
- The type parameter `T` can be any type
- `new()`, `get()`, and `set()` methods work with any type `T`
- Each instance of `Container` is specialized for a specific type
- The compiler ensures type safety at compile time

**Why**: Generic methods allow you to write flexible code that works with different types while maintaining type safety.

### Generic Methods with Constraints

**What**: You can add trait bounds to generic methods to constrain what types can be used.

**How**: Here's how to use trait bounds in generic methods:

```rust
use std::fmt::Display;

struct Calculator<T> {
    value: T,
}

impl<T: Display + Clone> Calculator<T> {
    fn new(value: T) -> Self {
        Calculator { value }
    }

    fn display(&self) {
        println!("Value: {}", self.value);
    }

    fn duplicate(&self) -> Self {
        Calculator { value: self.value.clone() }
    }
}

impl<T: Display + Clone + PartialOrd> Calculator<T> {
    fn is_greater_than(&self, other: &T) -> bool {
        self.value > *other
    }
}

fn main() {
    let calc = Calculator::new(42);
    calc.display();

    let duplicate = calc.duplicate();
    duplicate.display();

    let other_calc = Calculator::new(30);
    println!("Is greater: {}", calc.is_greater_than(&other_calc.value));
}
```

**Explanation**:

- `T: Display + Clone` constrains `T` to types that implement both traits
- `T: Display + Clone + PartialOrd` adds another constraint for comparison
- Different `impl` blocks can have different constraints
- The compiler ensures that only compatible types can be used
- This provides more functionality while maintaining type safety

**Why**: Trait bounds allow you to add functionality that depends on specific capabilities of the type.

### Generic Methods in Enums

**What**: Enums can also have generic methods that work with their variants.

**How**: Here's how to create generic methods for enums:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}

impl<T, E> Result<T, E> {
    fn is_ok(&self) -> bool {
        match self {
            Result::Ok(_) => true,
            Result::Err(_) => false,
        }
    }

    fn is_err(&self) -> bool {
        !self.is_ok()
    }

    fn unwrap_or(self, default: T) -> T {
        match self {
            Result::Ok(value) => value,
            Result::Err(_) => default,
        }
    }
}

fn main() {
    let success: Result<i32, &str> = Result::Ok(42);
    let failure: Result<i32, &str> = Result::Err("Something went wrong");

    println!("Success is ok: {}", success.is_ok());
    println!("Failure is err: {}", failure.is_err());

    let value = success.unwrap_or(0);
    let default_value = failure.unwrap_or(-1);

    println!("Success value: {}", value);
    println!("Failure default: {}", default_value);
}
```

**Explanation**:

- `Result<T, E>` is a generic enum with two type parameters
- Generic methods can work with the enum's type parameters
- `unwrap_or()` demonstrates how generic methods can use the type parameters
- The methods work regardless of the specific types used
- This pattern is common in Rust's standard library

**Why**: Generic enums with methods provide powerful abstractions for handling different types of data and errors.

## Understanding Generic Implementations

### Multiple Generic Parameters

**What**: You can have multiple type parameters in generic implementations.

**How**: Here's how to use multiple generic parameters:

```rust
struct Pair<T, U> {
    first: T,
    second: U,
}

impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Self {
        Pair { first, second }
    }

    fn get_first(&self) -> &T {
        &self.first
    }

    fn get_second(&self) -> &U {
        &self.second
    }

    fn swap(self) -> Pair<U, T> {
        Pair {
            first: self.second,
            second: self.first,
        }
    }
}

impl<T, U> Pair<T, U>
where
    T: Clone,
    U: Clone,
{
    fn clone_pair(&self) -> Self {
        Pair {
            first: self.first.clone(),
            second: self.second.clone(),
        }
    }
}

fn main() {
    let pair = Pair::new(42, "Hello".to_string());
    println!("First: {}, Second: {}", pair.get_first(), pair.get_second());

    let cloned = pair.clone_pair();
    println!("Cloned - First: {}, Second: {}", cloned.get_first(), cloned.get_second());

    let swapped = pair.swap();
    println!("Swapped - First: {}, Second: {}", swapped.get_first(), swapped.get_second());
}
```

**Explanation**:

- `Pair<T, U>` has two generic type parameters
- Methods can work with both type parameters
- `where` clauses provide additional constraints
- `swap()` method returns a `Pair<U, T>` with types reversed
- Different constraints can be applied to different methods

**Why**: Multiple generic parameters allow you to create flexible data structures that can hold different types of data.

### Associated Types in Generic Implementations

**What**: You can use associated types in generic implementations to create more flexible APIs.

**How**: Here's how to use associated types:

```rust
trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
}

struct Counter {
    count: u32,
    max: u32,
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.count < self.max {
            let current = self.count;
            self.count += 1;
            Some(current)
        } else {
            None
        }
    }
}

struct StringIterator {
    strings: Vec<String>,
    index: usize,
}

impl Iterator for StringIterator {
    type Item = String;

    fn next(&mut self) -> Option<Self::Item> {
        if self.index < self.strings.len() {
            let result = self.strings[self.index].clone();
            self.index += 1;
            Some(result)
        } else {
            None
        }
    }
}

fn main() {
    let mut counter = Counter { count: 0, max: 3 };
    while let Some(value) = counter.next() {
        println!("Counter: {}", value);
    }

    let mut string_iter = StringIterator {
        strings: vec!["Hello".to_string(), "World".to_string()],
        index: 0,
    };
    while let Some(value) = string_iter.next() {
        println!("String: {}", value);
    }
}
```

**Explanation**:

- `Iterator` trait uses an associated type `Item`
- Each implementation specifies what type `Item` represents
- `Counter` uses `u32` as its item type
- `StringIterator` uses `String` as its item type
- This allows different iterators to work with different types

**Why**: Associated types provide more flexibility than generic parameters in trait definitions.

## Understanding Performance of Generics

### Zero-Cost Abstractions

**What**: Rust's generics are designed to have zero runtime cost through monomorphization.

**Why**: Understanding performance is important because:

- **Zero-cost abstractions** mean generics don't add runtime overhead
- **Monomorphization** creates specialized code for each type used
- **Compile-time optimization** allows the compiler to optimize for specific types
- **Memory efficiency** ensures no runtime type information is stored
- **Performance predictability** makes performance characteristics clear

**How**: Here's how generics achieve zero-cost abstractions:

```rust
fn add<T>(a: T, b: T) -> T
where
    T: std::ops::Add<Output = T>,
{
    a + b
}

fn main() {
    let int_result = add(5, 3);
    let float_result = add(5.0, 3.0);

    println!("Int result: {}", int_result);
    println!("Float result: {}", float_result);
}
```

**Explanation**:

- The generic function `add` works with any type that implements `Add`
- At compile time, Rust creates specialized versions for each type used
- `add(5, 3)` creates a version that works specifically with integers
- `add(5.0, 3.0)` creates a version that works specifically with floats
- No runtime type checking or dynamic dispatch occurs

**Why**: Zero-cost abstractions allow you to write generic code without performance penalties.

### Generic vs Dynamic Dispatch

**What**: Generics use static dispatch (compile-time) while trait objects use dynamic dispatch (runtime).

**How**: Here's the difference:

```rust
// Static dispatch with generics
fn process_static<T: std::fmt::Display>(value: T) {
    println!("Static: {}", value);
}

// Dynamic dispatch with trait objects
fn process_dynamic(value: &dyn std::fmt::Display) {
    println!("Dynamic: {}", value);
}

fn main() {
    let number = 42;
    let text = "Hello";

    // Static dispatch - specialized at compile time
    process_static(number);
    process_static(text);

    // Dynamic dispatch - resolved at runtime
    process_dynamic(&number);
    process_dynamic(&text);
}
```

**Explanation**:

- `process_static` uses generics with static dispatch
- The compiler creates specialized versions for each type
- `process_dynamic` uses trait objects with dynamic dispatch
- The method to call is determined at runtime
- Static dispatch is faster but increases binary size
- Dynamic dispatch is slower but more flexible

**Why**: Understanding the trade-offs helps you choose the right approach for your use case.

## Common Generic Method Patterns

### Builder Pattern with Generics

**What**: The builder pattern can be enhanced with generics for type-safe construction.

**How**: Here's how to implement a generic builder:

```rust
struct QueryBuilder<T> {
    table: String,
    conditions: Vec<String>,
    _phantom: std::marker::PhantomData<T>,
}

impl<T> QueryBuilder<T> {
    fn new(table: &str) -> Self {
        QueryBuilder {
            table: table.to_string(),
            conditions: Vec::new(),
            _phantom: std::marker::PhantomData,
        }
    }

    fn where_clause(mut self, condition: &str) -> Self {
        self.conditions.push(condition.to_string());
        self
    }

    fn build(self) -> String {
        let mut query = format!("SELECT * FROM {}", self.table);
        if !self.conditions.is_empty() {
            query.push_str(" WHERE ");
            query.push_str(&self.conditions.join(" AND "));
        }
        query
    }
}

fn main() {
    let query = QueryBuilder::<String>::new("users")
        .where_clause("age > 18")
        .where_clause("active = true")
        .build();

    println!("Query: {}", query);
}
```

**Explanation**:

- `QueryBuilder<T>` is generic but doesn't actually use `T` in the struct
- `PhantomData<T>` is used to maintain the generic parameter
- The builder pattern provides a fluent API for construction
- The generic parameter can be used for type safety in more complex scenarios

**Why**: Generic builders provide type-safe construction patterns that can be specialized for different use cases.

### Generic Algorithms

**What**: You can create generic algorithms that work with different types and constraints.

**How**: Here's how to create a generic sorting algorithm:

```rust
fn bubble_sort<T>(mut arr: Vec<T>) -> Vec<T>
where
    T: PartialOrd + Clone,
{
    let n = arr.len();
    for i in 0..n {
        for j in 0..n - i - 1 {
            if arr[j] > arr[j + 1] {
                arr.swap(j, j + 1);
            }
        }
    }
    arr
}

fn find_max<T>(arr: &[T]) -> Option<&T>
where
    T: PartialOrd,
{
    arr.iter().max_by(|a, b| a.partial_cmp(b).unwrap())
}

fn main() {
    let numbers = vec![64, 34, 25, 12, 22, 11, 90];
    let sorted_numbers = bubble_sort(numbers);
    println!("Sorted: {:?}", sorted_numbers);

    let words = vec!["banana", "apple", "cherry", "date"];
    let sorted_words = bubble_sort(words);
    println!("Sorted words: {:?}", sorted_words);

    let max_number = find_max(&[1, 5, 3, 9, 2]);
    println!("Max number: {:?}", max_number);
}
```

**Explanation**:

- `bubble_sort` works with any type that implements `PartialOrd + Clone`
- `find_max` works with any type that implements `PartialOrd`
- The same algorithm works with different types
- Type constraints ensure the operations are valid
- This demonstrates the power of generic programming

**Why**: Generic algorithms allow you to write reusable code that works with different types while maintaining type safety.

## Practice Exercises

### Exercise 1: Generic Stack

**What**: Create a generic stack data structure.

**How**: Implement this stack:

```rust
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack { items: Vec::new() }
    }

    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    fn pop(&mut self) -> Option<T> {
        self.items.pop()
    }

    fn peek(&self) -> Option<&T> {
        self.items.last()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut stack = Stack::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);

    println!("Stack length: {}", stack.len());
    println!("Top element: {:?}", stack.peek());

    while let Some(value) = stack.pop() {
        println!("Popped: {}", value);
    }
}
```

### Exercise 2: Generic Binary Tree

**What**: Create a generic binary tree with insertion and traversal.

**How**: Implement this tree:

```rust
struct TreeNode<T> {
    value: T,
    left: Option<Box<TreeNode<T>>>,
    right: Option<Box<TreeNode<T>>>,
}

impl<T: PartialOrd> TreeNode<T> {
    fn new(value: T) -> Self {
        TreeNode {
            value,
            left: None,
            right: None,
        }
    }

    fn insert(&mut self, value: T) {
        if value < self.value {
            if let Some(left) = &mut self.left {
                left.insert(value);
            } else {
                self.left = Some(Box::new(TreeNode::new(value)));
            }
        } else {
            if let Some(right) = &mut self.right {
                right.insert(value);
            } else {
                self.right = Some(Box::new(TreeNode::new(value)));
            }
        }
    }

    fn contains(&self, value: &T) -> bool {
        if *value == self.value {
            true
        } else if *value < self.value {
            self.left.as_ref().map_or(false, |left| left.contains(value))
        } else {
            self.right.as_ref().map_or(false, |right| right.contains(value))
        }
    }
}

fn main() {
    let mut tree = TreeNode::new(5);
    tree.insert(3);
    tree.insert(7);
    tree.insert(1);
    tree.insert(9);

    println!("Contains 3: {}", tree.contains(&3));
    println!("Contains 6: {}", tree.contains(&6));
}
```

## Key Takeaways

**What** you've learned about generic methods and implementations:

1. **Generic Methods** - Methods that work with different types while maintaining type safety
2. **Trait Bounds** - Constraints that ensure types have required capabilities
3. **Multiple Parameters** - Generic implementations can have multiple type parameters
4. **Associated Types** - Flexible type relationships in trait implementations
5. **Zero-Cost Abstractions** - Generics provide performance without runtime overhead
6. **Static vs Dynamic Dispatch** - Understanding when to use each approach
7. **Common Patterns** - Builder pattern, algorithms, and data structures with generics

**Why** these concepts matter:

- **Type Safety** ensures compile-time error checking
- **Performance** provides zero-cost abstractions
- **Reusability** enables code that works with multiple types
- **Flexibility** allows APIs to adapt to different use cases
- **Maintainability** reduces code duplication while maintaining type safety

## Next Steps

Now that you understand generic methods and implementations, you're ready to learn about:

- **Advanced trait patterns** - Complex trait relationships and implementations
- **Lifetime management** - Reference lifetime handling in generic code
- **Smart pointers** - Advanced pointer types and memory management
- **Concurrency** - Safe concurrent programming with generics

**Where** to go next: Continue with the next lesson on "Advanced Traits" to learn about complex trait relationships and implementations!
