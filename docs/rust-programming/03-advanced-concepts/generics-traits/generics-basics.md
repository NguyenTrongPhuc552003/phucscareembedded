---
sidebar_position: 1
---

# Generics Basics

Master generic programming in Rust with comprehensive explanations using the 4W+H framework.

## What Are Generics?

**What**: Generics are a way to write code that works with multiple types without duplicating code. They allow you to write functions, structs, enums, and methods that can work with any type while maintaining type safety.

**Why**: Understanding generics is crucial because:

- **Code reuse** allows you to write functions that work with multiple types
- **Type safety** ensures compile-time type checking without runtime overhead
- **Performance** generates optimized code for each specific type
- **Flexibility** enables you to create reusable components
- **Abstraction** helps you write more general and powerful code
- **Maintainability** reduces code duplication and makes updates easier

**When**: Use generics when you need to:

- Write functions that work with multiple types
- Create data structures that can hold different types
- Implement algorithms that work with various data types
- Build reusable libraries and frameworks
- Avoid code duplication for similar functionality
- Create type-safe abstractions

**How**: Generics work in Rust by:

- **Type parameters** using angle brackets `<T>` to specify generic types
- **Compile-time specialization** generating specific code for each used type
- **Trait bounds** constraining generic types to have certain capabilities
- **Zero-cost abstractions** providing generics without runtime overhead
- **Type inference** automatically determining generic types when possible

**Where**: Generics are used throughout Rust programs for collections, algorithms, error handling, and building reusable libraries.

## Understanding Generic Functions

### Basic Generic Functions

**What**: Generic functions can work with any type by using type parameters.

**Why**: Understanding generic functions is important because:

- **Code reuse** eliminates the need to write separate functions for each type
- **Type safety** ensures compile-time type checking
- **Performance** generates optimized code for each specific type
- **Flexibility** allows functions to work with any compatible type

**When**: Use generic functions when you need to write code that works with multiple types.

**How**: Here's how to create basic generic functions:

```rust
// Generic function that works with any type
fn identity<T>(value: T) -> T {
    value
}

// Generic function with multiple type parameters
fn swap<T, U>(a: T, b: U) -> (U, T) {
    (b, a)
}

// Generic function with constraints
fn find_largest<T: PartialOrd>(list: &[T]) -> Option<&T> {
    if list.is_empty() {
        return None;
    }

    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    Some(largest)
}

fn main() {
    // Works with integers
    let number = identity(42);
    println!("Number: {}", number);

    // Works with strings
    let text = identity("Hello, World!");
    println!("Text: {}", text);

    // Works with floats
    let pi = identity(3.14159);
    println!("Pi: {}", pi);

    // Swap different types
    let (a, b) = swap(10, "hello");
    println!("Swapped: {} and {}", a, b);

    // Find largest in different types
    let numbers = [3, 1, 4, 1, 5, 9, 2, 6];
    if let Some(largest) = find_largest(&numbers) {
        println!("Largest number: {}", largest);
    }

    let words = ["apple", "banana", "cherry"];
    if let Some(largest) = find_largest(&words) {
        println!("Largest word: {}", largest);
    }
}
```

**Explanation**:

- `fn identity<T>(value: T) -> T` creates a generic function that takes any type `T` and returns the same type
- `fn swap<T, U>(a: T, b: U) -> (U, T)` uses two different generic types `T` and `U`
- `fn find_largest<T: PartialOrd>(list: &[T])` constrains `T` to types that can be compared using `PartialOrd`
- The same function works with integers, strings, floats, and any comparable type
- Rust generates optimized code for each specific type used

**Why**: Generic functions eliminate code duplication while maintaining type safety and performance.

### Generic Functions with Multiple Constraints

**What**: You can constrain generic types to have multiple capabilities using trait bounds.

**Why**: Understanding multiple constraints is important because:

- **Flexibility** allows you to use multiple traits on the same generic type
- **Type safety** ensures the type has all required capabilities
- **Powerful abstractions** enable complex generic programming
- **Clear interfaces** make function requirements explicit

**When**: Use multiple constraints when you need a type that implements several traits.

**How**: Here's how to use multiple trait bounds:

```rust
use std::fmt::Display;
use std::fmt::Debug;

// Generic function with multiple trait bounds
fn print_and_compare<T: Display + PartialOrd>(a: T, b: T) -> T {
    println!("a: {}, b: {}", a, b);
    if a > b {
        a
    } else {
        b
    }
}

// Generic function with where clause for complex bounds
fn process_data<T, U>(data: T, processor: U) -> String
where
    T: Display + Clone,
    U: Fn(T) -> String,
{
    let cloned_data = data.clone();
    println!("Processing: {}", data);
    processor(cloned_data)
}

// Generic function with associated types
fn find_and_display<T>(items: &[T], target: &T) -> Option<usize>
where
    T: PartialEq + Display,
{
    for (index, item) in items.iter().enumerate() {
        if item == target {
            println!("Found: {}", item);
            return Some(index);
        }
    }
    None
}

fn main() {
    // Works with integers
    let result1 = print_and_compare(10, 20);
    println!("Larger: {}", result1);

    // Works with strings
    let result2 = print_and_compare("apple", "banana");
    println!("Larger: {}", result2);

    // Process data with custom processor
    let processor = |x: i32| format!("Processed: {}", x * 2);
    let result = process_data(42, processor);
    println!("Result: {}", result);

    // Find and display items
    let numbers = [1, 2, 3, 4, 5];
    if let Some(index) = find_and_display(&numbers, &3) {
        println!("Found at index: {}", index);
    }
}
```

**Explanation**:

- `T: Display + PartialOrd` requires `T` to implement both `Display` and `PartialOrd` traits
- `where` clauses provide cleaner syntax for complex trait bounds
- `T: Display + Clone` requires both display and cloning capabilities
- `U: Fn(T) -> String` constrains `U` to be a function that takes `T` and returns `String`
- Multiple constraints ensure the type has all required capabilities

**Why**: Multiple constraints enable powerful generic programming while maintaining type safety.

### Generic Functions with Lifetimes

**What**: You can combine generics with lifetimes to create functions that work with references of any lifetime.

**Why**: Understanding generics with lifetimes is important because:

- **Reference safety** ensures references are valid for the required duration
- **Flexibility** allows functions to work with references of any lifetime
- **Memory safety** prevents dangling references and use-after-free errors
- **Reusability** enables functions to work with different reference lifetimes

**When**: Use generics with lifetimes when you need to work with references of unknown lifetimes.

**How**: Here's how to combine generics with lifetimes:

```rust
// Generic function with lifetime parameters
fn longest<'a, T>(x: &'a T, y: &'a T) -> &'a T
where
    T: PartialOrd,
{
    if x > y { x } else { y }
}

// Generic function that returns a reference with the same lifetime
fn get_first<'a, T>(items: &'a [T]) -> Option<&'a T> {
    items.first()
}

// Generic function with multiple lifetime parameters
fn combine_strings<'a, 'b>(s1: &'a str, s2: &'b str) -> String {
    format!("{} {}", s1, s2)
}

// Generic function with lifetime and trait bounds
fn find_item<'a, T>(items: &'a [T], predicate: impl Fn(&T) -> bool) -> Option<&'a T> {
    for item in items {
        if predicate(item) {
            return Some(item);
        }
    }
    None
}

fn main() {
    // Works with integer references
    let a = 10;
    let b = 20;
    let longer = longest(&a, &b);
    println!("Longer: {}", longer);

    // Works with string references
    let s1 = "hello";
    let s2 = "world";
    let longer_str = longest(&s1, &s2);
    println!("Longer string: {}", longer_str);

    // Get first item from slice
    let numbers = [1, 2, 3, 4, 5];
    if let Some(first) = get_first(&numbers) {
        println!("First number: {}", first);
    }

    // Combine strings
    let combined = combine_strings("Hello", "World");
    println!("Combined: {}", combined);

    // Find item with predicate
    let words = ["apple", "banana", "cherry"];
    if let Some(found) = find_item(&words, |word| word.starts_with('b')) {
        println!("Found word starting with 'b': {}", found);
    }
}
```

**Explanation**:

- `fn longest<'a, T>(x: &'a T, y: &'a T) -> &'a T` combines lifetime `'a` with generic type `T`
- The lifetime `'a` ensures both input references and the return reference have the same lifetime
- `T: PartialOrd` constrains `T` to types that can be compared
- `impl Fn(&T) -> bool` uses a generic closure type for the predicate
- Lifetime parameters ensure memory safety while maintaining flexibility

**Why**: Generics with lifetimes enable safe, flexible code that works with references of any lifetime.

## Understanding Generic Structs

### Basic Generic Structs

**What**: Generic structs can hold data of any type using type parameters.

**Why**: Understanding generic structs is important because:

- **Type safety** ensures compile-time type checking
- **Code reuse** eliminates the need for separate structs for each type
- **Performance** generates optimized code for each specific type
- **Flexibility** allows structs to work with any compatible type

**When**: Use generic structs when you need to create data structures that can hold different types.

**How**: Here's how to create basic generic structs:

```rust
// Generic struct for a single value
struct Container<T> {
    value: T,
}

// Generic struct with multiple type parameters
struct Pair<T, U> {
    first: T,
    second: U,
}

// Generic struct with constraints
struct SortedList<T: PartialOrd> {
    items: Vec<T>,
}

impl<T> Container<T> {
    fn new(value: T) -> Self {
        Self { value }
    }

    fn get(&self) -> &T {
        &self.value
    }

    fn set(&mut self, value: T) {
        self.value = value;
    }
}

impl<T, U> Pair<T, U> {
    fn new(first: T, second: U) -> Self {
        Self { first, second }
    }

    fn swap(self) -> Pair<U, T> {
        Pair {
            first: self.second,
            second: self.first,
        }
    }
}

impl<T: PartialOrd> SortedList<T> {
    fn new() -> Self {
        Self { items: Vec::new() }
    }

    fn insert(&mut self, item: T) {
        let mut pos = 0;
        for (i, existing) in self.items.iter().enumerate() {
            if item < *existing {
                pos = i;
                break;
            }
            pos = i + 1;
        }
        self.items.insert(pos, item);
    }

    fn get(&self, index: usize) -> Option<&T> {
        self.items.get(index)
    }
}

fn main() {
    // Container with integer
    let mut int_container = Container::new(42);
    println!("Integer container: {}", int_container.get());
    int_container.set(100);
    println!("After set: {}", int_container.get());

    // Container with string
    let string_container = Container::new("Hello, World!".to_string());
    println!("String container: {}", string_container.get());

    // Pair with different types
    let pair = Pair::new(10, "hello");
    println!("Pair: {} and {}", pair.first, pair.second);

    // Swap the pair
    let swapped = pair.swap();
    println!("Swapped: {} and {}", swapped.first, swapped.second);

    // Sorted list
    let mut sorted_list = SortedList::new();
    sorted_list.insert(3);
    sorted_list.insert(1);
    sorted_list.insert(4);
    sorted_list.insert(1);
    sorted_list.insert(5);

    println!("Sorted list:");
    for i in 0..sorted_list.items.len() {
        if let Some(item) = sorted_list.get(i) {
            println!("  [{}]: {}", i, item);
        }
    }
}
```

**Explanation**:

- `struct Container<T>` creates a generic struct that can hold any type `T`
- `struct Pair<T, U>` uses two different generic types for different fields
- `struct SortedList<T: PartialOrd>` constrains `T` to types that can be compared
- `impl<T>` provides methods for any type `T`
- `impl<T: PartialOrd>` provides methods only for comparable types
- The same struct can hold integers, strings, or any other compatible type

**Why**: Generic structs eliminate code duplication while maintaining type safety and performance.

### Advanced Generic Structs

**What**: More sophisticated generic structs with complex type relationships and constraints.

**Why**: Understanding advanced generic structs is important because:

- **Complex relationships** enable sophisticated data structures
- **Type safety** ensures compile-time validation of complex constraints
- **Performance** generates optimized code for each specific type combination
- **Abstraction** enables powerful generic programming patterns

**When**: Use advanced generic structs when you need complex data structures with multiple type parameters.

**How**: Here's how to create advanced generic structs:

```rust
use std::fmt::Display;
use std::clone::Clone;

// Generic struct with associated types
struct Node<T> {
    data: T,
    children: Vec<Node<T>>,
}

impl<T> Node<T> {
    fn new(data: T) -> Self {
        Self {
            data,
            children: Vec::new(),
        }
    }

    fn add_child(&mut self, child: Node<T>) {
        self.children.push(child);
    }

    fn get_data(&self) -> &T {
        &self.data
    }

    fn get_children(&self) -> &Vec<Node<T>> {
        &self.children
    }
}

// Generic struct with multiple constraints
struct Cache<K, V>
where
    K: Clone + PartialEq,
    V: Clone,
{
    entries: Vec<(K, V)>,
    max_size: usize,
}

impl<K, V> Cache<K, V>
where
    K: Clone + PartialEq,
    V: Clone,
{
    fn new(max_size: usize) -> Self {
        Self {
            entries: Vec::new(),
            max_size,
        }
    }

    fn insert(&mut self, key: K, value: V) {
        // Remove existing entry if it exists
        self.entries.retain(|(k, _)| k != &key);

        // Add new entry
        self.entries.push((key, value));

        // Remove oldest entries if over capacity
        if self.entries.len() > self.max_size {
            self.entries.remove(0);
        }
    }

    fn get(&self, key: &K) -> Option<&V> {
        self.entries.iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v)
    }

    fn size(&self) -> usize {
        self.entries.len()
    }
}

// Generic struct with lifetime parameters
struct ReferenceWrapper<'a, T> {
    data: &'a T,
    metadata: String,
}

impl<'a, T> ReferenceWrapper<'a, T> {
    fn new(data: &'a T, metadata: String) -> Self {
        Self { data, metadata }
    }

    fn get_data(&self) -> &'a T {
        self.data
    }

    fn get_metadata(&self) -> &str {
        &self.metadata
    }
}

// Generic struct with trait bounds
struct DisplayableContainer<T: Display> {
    value: T,
    label: String,
}

impl<T: Display> DisplayableContainer<T> {
    fn new(value: T, label: String) -> Self {
        Self { value, label }
    }

    fn display(&self) -> String {
        format!("{}: {}", self.label, self.value)
    }
}

fn main() {
    // Node with integers
    let mut root = Node::new(1);
    let child1 = Node::new(2);
    let child2 = Node::new(3);
    root.add_child(child1);
    root.add_child(child2);

    println!("Root data: {}", root.get_data());
    println!("Number of children: {}", root.get_children().len());

    // Cache with string keys and integer values
    let mut cache = Cache::new(3);
    cache.insert("key1".to_string(), 100);
    cache.insert("key2".to_string(), 200);
    cache.insert("key3".to_string(), 300);

    if let Some(value) = cache.get(&"key1".to_string()) {
        println!("Cache hit: {}", value);
    }

    println!("Cache size: {}", cache.size());

    // Reference wrapper
    let number = 42;
    let wrapper = ReferenceWrapper::new(&number, "important number".to_string());
    println!("Wrapped data: {}", wrapper.get_data());
    println!("Metadata: {}", wrapper.get_metadata());

    // Displayable container
    let container = DisplayableContainer::new(3.14159, "Pi".to_string());
    println!("{}", container.display());
}
```

**Explanation**:

- `struct Node<T>` creates a tree structure that can hold any type
- `struct Cache<K, V>` uses two generic types with specific constraints
- `struct ReferenceWrapper<'a, T>` combines lifetimes with generics
- `struct DisplayableContainer<T: Display>` constrains `T` to displayable types
- Complex constraints ensure type safety while enabling powerful abstractions

**Why**: Advanced generic structs enable sophisticated data structures with strong type safety and performance.

## Understanding Generic Enums

### Basic Generic Enums

**What**: Generic enums can represent different types of data using type parameters.

**Why**: Understanding generic enums is important because:

- **Type safety** ensures compile-time type checking
- **Flexibility** allows enums to work with any type
- **Performance** generates optimized code for each specific type
- **Pattern matching** enables powerful control flow with type safety

**When**: Use generic enums when you need to represent different types of data in a single enum.

**How**: Here's how to create basic generic enums:

```rust
// Generic enum for optional values
enum Maybe<T> {
    Just(T),
    Nothing,
}

// Generic enum for either of two types
enum Either<L, R> {
    Left(L),
    Right(R),
}

// Generic enum for different operations
enum Operation<T> {
    Add(T, T),
    Subtract(T, T),
    Multiply(T, T),
    Divide(T, T),
}

impl<T> Maybe<T> {
    fn new(value: T) -> Self {
        Maybe::Just(value)
    }

    fn is_just(&self) -> bool {
        matches!(self, Maybe::Just(_))
    }

    fn is_nothing(&self) -> bool {
        matches!(self, Maybe::Nothing)
    }

    fn unwrap(self) -> T {
        match self {
            Maybe::Just(value) => value,
            Maybe::Nothing => panic!("Called unwrap on Nothing"),
        }
    }
}

impl<L, R> Either<L, R> {
    fn left(value: L) -> Self {
        Either::Left(value)
    }

    fn right(value: R) -> Self {
        Either::Right(value)
    }

    fn is_left(&self) -> bool {
        matches!(self, Either::Left(_))
    }

    fn is_right(&self) -> bool {
        matches!(self, Either::Right(_))
    }
}

fn main() {
    // Maybe with integer
    let maybe_number = Maybe::new(42);
    println!("Maybe number is just: {}", maybe_number.is_just());

    let maybe_nothing: Maybe<i32> = Maybe::Nothing;
    println!("Maybe nothing is nothing: {}", maybe_nothing.is_nothing());

    // Either with different types
    let either = Either::left("hello");
    println!("Either is left: {}", either.is_left());

    let either_right = Either::right(42);
    println!("Either is right: {}", either_right.is_right());

    // Pattern matching with generic enums
    match maybe_number {
        Maybe::Just(value) => println!("Got value: {}", value),
        Maybe::Nothing => println!("Got nothing"),
    }

    match either {
        Either::Left(value) => println!("Left value: {}", value),
        Either::Right(value) => println!("Right value: {}", value),
    }
}
```

**Explanation**:

- `enum Maybe<T>` creates a generic enum that can hold any type `T` or nothing
- `enum Either<L, R>` uses two different generic types for left and right variants
- `enum Operation<T>` uses a single generic type for all variants
- Generic enums enable type-safe representation of different data types
- Pattern matching works seamlessly with generic enums

**Why**: Generic enums provide type-safe ways to represent different types of data in a single enum.

### Advanced Generic Enums

**What**: More sophisticated generic enums with complex type relationships and constraints.

**Why**: Understanding advanced generic enums is important because:

- **Complex relationships** enable sophisticated data representations
- **Type safety** ensures compile-time validation of complex constraints
- **Performance** generates optimized code for each specific type combination
- **Abstraction** enables powerful generic programming patterns

**When**: Use advanced generic enums when you need complex data representations with multiple type parameters.

**How**: Here's how to create advanced generic enums:

```rust
use std::fmt::Display;
use std::clone::Clone;

// Generic enum with associated data and constraints
enum Result<T, E> {
    Ok(T),
    Err(E),
}

// Generic enum with multiple type parameters
enum Tree<T> {
    Leaf(T),
    Branch(T, Box<Tree<T>>, Box<Tree<T>>),
}

// Generic enum with lifetime parameters
enum Reference<T> {
    Owned(T),
    Borrowed(&'static T),
}

// Generic enum with trait bounds
enum Displayable<T: Display> {
    Value(T),
    Labeled(String, T),
}

impl<T, E> Result<T, E> {
    fn is_ok(&self) -> bool {
        matches!(self, Result::Ok(_))
    }

    fn is_err(&self) -> bool {
        matches!(self, Result::Err(_))
    }

    fn unwrap(self) -> T {
        match self {
            Result::Ok(value) => value,
            Result::Err(_) => panic!("Called unwrap on Err"),
        }
    }

    fn unwrap_or(self, default: T) -> T {
        match self {
            Result::Ok(value) => value,
            Result::Err(_) => default,
        }
    }
}

impl<T> Tree<T> {
    fn leaf(value: T) -> Self {
        Tree::Leaf(value)
    }

    fn branch(value: T, left: Tree<T>, right: Tree<T>) -> Self {
        Tree::Branch(value, Box::new(left), Box::new(right))
    }

    fn is_leaf(&self) -> bool {
        matches!(self, Tree::Leaf(_))
    }

    fn is_branch(&self) -> bool {
        matches!(self, Tree::Branch(_, _, _))
    }
}

impl<T: Display> Displayable<T> {
    fn new(value: T) -> Self {
        Displayable::Value(value)
    }

    fn with_label(value: T, label: String) -> Self {
        Displayable::Labeled(label, value)
    }

    fn display(&self) -> String {
        match self {
            Displayable::Value(value) => format!("{}", value),
            Displayable::Labeled(label, value) => format!("{}: {}", label, value),
        }
    }
}

fn main() {
    // Result with different types
    let success: Result<i32, String> = Result::Ok(42);
    let failure: Result<i32, String> = Result::Err("Something went wrong".to_string());

    println!("Success is ok: {}", success.is_ok());
    println!("Failure is err: {}", failure.is_err());

    // Tree with integers
    let tree = Tree::branch(
        1,
        Tree::leaf(2),
        Tree::branch(3, Tree::leaf(4), Tree::leaf(5))
    );

    println!("Tree is branch: {}", tree.is_branch());

    // Displayable with different types
    let displayable_int = Displayable::new(42);
    println!("Displayable int: {}", displayable_int.display());

    let displayable_string = Displayable::with_label("Hello", "Greeting".to_string());
    println!("Displayable string: {}", displayable_string.display());

    // Pattern matching with complex enums
    match success {
        Result::Ok(value) => println!("Success: {}", value),
        Result::Err(error) => println!("Error: {}", error),
    }

    match tree {
        Tree::Leaf(value) => println!("Leaf: {}", value),
        Tree::Branch(value, left, right) => {
            println!("Branch: {}", value);
            println!("Left: {:?}", left.is_leaf());
            println!("Right: {:?}", right.is_leaf());
        }
    }
}
```

**Explanation**:

- `enum Result<T, E>` creates a generic enum for success and error cases
- `enum Tree<T>` creates a generic tree structure that can hold any type
- `enum Reference<T>` combines generics with lifetime parameters
- `enum Displayable<T: Display>` constrains the generic type to displayable types
- Complex generic enums enable sophisticated data representations with type safety

**Why**: Advanced generic enums provide powerful abstractions for complex data structures while maintaining type safety.

## Understanding Generic Methods

### Basic Generic Methods

**What**: Generic methods can work with any type using type parameters.

**Why**: Understanding generic methods is important because:

- **Code reuse** eliminates the need to write separate methods for each type
- **Type safety** ensures compile-time type checking
- **Performance** generates optimized code for each specific type
- **Flexibility** allows methods to work with any compatible type

**When**: Use generic methods when you need to write methods that work with multiple types.

**How**: Here's how to create basic generic methods:

```rust
struct Calculator;

impl Calculator {
    // Generic method that works with any type
    fn add<T>(a: T, b: T) -> T
    where
        T: std::ops::Add<Output = T>,
    {
        a + b
    }

    // Generic method with multiple type parameters
    fn combine<T, U>(a: T, b: U) -> (T, U) {
        (a, b)
    }

    // Generic method with constraints
    fn find_max<T>(items: &[T]) -> Option<&T>
    where
        T: PartialOrd,
    {
        if items.is_empty() {
            return None;
        }

        let mut max = &items[0];
        for item in items {
            if item > max {
                max = item;
            }
        }
        Some(max)
    }
}

// Generic struct with generic methods
struct Container<T> {
    value: T,
}

impl<T> Container<T> {
    fn new(value: T) -> Self {
        Self { value }
    }

    fn get(&self) -> &T {
        &self.value
    }

    fn set(&mut self, value: T) {
        self.value = value;
    }

    // Generic method on generic struct
    fn map<U, F>(self, f: F) -> Container<U>
    where
        F: FnOnce(T) -> U,
    {
        Container::new(f(self.value))
    }
}

fn main() {
    // Generic methods on Calculator
    let sum = Calculator::add(10, 20);
    println!("Sum: {}", sum);

    let float_sum = Calculator::add(3.14, 2.86);
    println!("Float sum: {}", float_sum);

    let combined = Calculator::combine("hello", 42);
    println!("Combined: {:?}", combined);

    let numbers = [3, 1, 4, 1, 5, 9, 2, 6];
    if let Some(max) = Calculator::find_max(&numbers) {
        println!("Max number: {}", max);
    }

    // Generic methods on Container
    let mut container = Container::new(42);
    println!("Container value: {}", container.get());

    container.set(100);
    println!("After set: {}", container.get());

    // Map to different type
    let string_container = container.map(|x| format!("Number: {}", x));
    println!("Mapped container: {}", string_container.get());
}
```

**Explanation**:

- `fn add<T>(a: T, b: T) -> T` creates a generic method that works with any addable type
- `fn combine<T, U>(a: T, b: U) -> (T, U)` uses two different generic types
- `fn find_max<T>(items: &[T]) -> Option<&T>` constrains `T` to comparable types
- `fn map<U, F>(self, f: F) -> Container<U>` uses a generic closure type
- Generic methods enable powerful abstractions while maintaining type safety

**Why**: Generic methods eliminate code duplication while maintaining type safety and performance.

### Advanced Generic Methods

**What**: More sophisticated generic methods with complex type relationships and constraints.

**Why**: Understanding advanced generic methods is important because:

- **Complex relationships** enable sophisticated generic programming
- **Type safety** ensures compile-time validation of complex constraints
- **Performance** generates optimized code for each specific type combination
- **Abstraction** enables powerful generic programming patterns

**When**: Use advanced generic methods when you need complex generic programming with multiple type parameters.

**How**: Here's how to create advanced generic methods:

```rust
use std::fmt::Display;
use std::clone::Clone;
use std::ops::Add;

// Generic struct with complex methods
struct DataProcessor<T> {
    data: T,
}

impl<T> DataProcessor<T> {
    fn new(data: T) -> Self {
        Self { data }
    }

    // Generic method with associated types
    fn process<U, F>(self, processor: F) -> DataProcessor<U>
    where
        F: FnOnce(T) -> U,
    {
        DataProcessor::new(processor(self.data))
    }

    // Generic method with multiple constraints
    fn transform<U, F>(&self, transformer: F) -> U
    where
        F: FnOnce(&T) -> U,
    {
        transformer(&self.data)
    }
}

// Generic struct with lifetime parameters
struct ReferenceProcessor<'a, T> {
    data: &'a T,
}

impl<'a, T> ReferenceProcessor<'a, T> {
    fn new(data: &'a T) -> Self {
        Self { data }
    }

    // Generic method with lifetime parameters
    fn process<U, F>(&self, processor: F) -> U
    where
        F: FnOnce(&T) -> U,
    {
        processor(self.data)
    }

    // Generic method that returns references
    fn get_data(&self) -> &'a T {
        self.data
    }
}

// Generic struct with trait bounds
struct DisplayableProcessor<T: Display> {
    data: T,
}

impl<T: Display> DisplayableProcessor<T> {
    fn new(data: T) -> Self {
        Self { data }
    }

    // Generic method with trait bounds
    fn format<U, F>(&self, formatter: F) -> U
    where
        F: FnOnce(&T) -> U,
    {
        formatter(&self.data)
    }

    // Generic method that uses the trait
    fn display(&self) -> String {
        format!("{}", self.data)
    }
}

// Generic struct with multiple type parameters
struct PairProcessor<T, U> {
    first: T,
    second: U,
}

impl<T, U> PairProcessor<T, U> {
    fn new(first: T, second: U) -> Self {
        Self { first, second }
    }

    // Generic method with multiple type parameters
    fn process<A, B, F>(self, processor: F) -> (A, B)
    where
        F: FnOnce(T, U) -> (A, B),
    {
        processor(self.first, self.second)
    }

    // Generic method with constraints
    fn combine<F>(self, combiner: F) -> F::Output
    where
        F: FnOnce(T, U) -> F::Output,
    {
        combiner(self.first, self.second)
    }
}

fn main() {
    // DataProcessor with different types
    let processor = DataProcessor::new(42);
    let string_processor = processor.process(|x| format!("Number: {}", x));
    println!("Processed: {}", string_processor.data);

    let transformed = string_processor.transform(|s| s.len());
    println!("Transformed length: {}", transformed);

    // ReferenceProcessor with lifetime
    let number = 42;
    let ref_processor = ReferenceProcessor::new(&number);
    let processed = ref_processor.process(|x| x * 2);
    println!("Processed reference: {}", processed);

    // DisplayableProcessor with trait bounds
    let display_processor = DisplayableProcessor::new("Hello, World!");
    let formatted = display_processor.format(|s| format!("Formatted: {}", s));
    println!("{}", formatted);

    // PairProcessor with multiple types
    let pair_processor = PairProcessor::new(10, "hello");
    let (a, b) = pair_processor.process(|x, y| (x * 2, format!("{} world", y)));
    println!("Processed pair: {} and {}", a, b);

    let combined = pair_processor.combine(|x, y| format!("{} {}", x, y));
    println!("Combined: {}", combined);
}
```

**Explanation**:

- `fn process<U, F>(self, processor: F) -> DataProcessor<U>` uses generic closures with associated types
- `fn process<U, F>(&self, processor: F) -> U` combines lifetimes with generic methods
- `fn format<U, F>(&self, formatter: F) -> U` uses trait bounds with generic methods
- `fn process<A, B, F>(self, processor: F) -> (A, B)` uses multiple generic type parameters
- Complex generic methods enable powerful abstractions while maintaining type safety

**Why**: Advanced generic methods provide sophisticated generic programming capabilities with strong type safety.

## Practice Exercises

### Exercise 1: Generic Stack

**What**: Create a generic stack data structure.

**How**: Implement this exercise:

```rust
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Self { items: Vec::new() }
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

    fn size(&self) -> usize {
        self.items.len()
    }
}

fn main() {
    let mut stack = Stack::new();

    stack.push(1);
    stack.push(2);
    stack.push(3);

    println!("Stack size: {}", stack.size());

    while let Some(item) = stack.pop() {
        println!("Popped: {}", item);
    }
}
```

### Exercise 2: Generic Binary Tree

**What**: Create a generic binary tree data structure.

**How**: Implement this exercise:

```rust
enum BinaryTree<T> {
    Empty,
    Node(T, Box<BinaryTree<T>>, Box<BinaryTree<T>>),
}

impl<T> BinaryTree<T> {
    fn new() -> Self {
        BinaryTree::Empty
    }

    fn insert(self, value: T) -> Self
    where
        T: PartialOrd,
    {
        match self {
            BinaryTree::Empty => BinaryTree::Node(value, Box::new(BinaryTree::Empty), Box::new(BinaryTree::Empty)),
            BinaryTree::Node(data, left, right) => {
                if value < data {
                    BinaryTree::Node(data, Box::new(left.insert(value)), right)
                } else {
                    BinaryTree::Node(data, left, Box::new(right.insert(value)))
                }
            }
        }
    }

    fn contains(&self, value: &T) -> bool
    where
        T: PartialOrd,
    {
        match self {
            BinaryTree::Empty => false,
            BinaryTree::Node(data, left, right) => {
                if value == data {
                    true
                } else if value < data {
                    left.contains(value)
                } else {
                    right.contains(value)
                }
            }
        }
    }
}

fn main() {
    let mut tree = BinaryTree::new();
    tree = tree.insert(5);
    tree = tree.insert(3);
    tree = tree.insert(7);
    tree = tree.insert(1);
    tree = tree.insert(9);

    println!("Contains 5: {}", tree.contains(&5));
    println!("Contains 4: {}", tree.contains(&4));
}
```

## Key Takeaways

**What** you've learned about generics:

1. **Generic Functions** - Write functions that work with multiple types
2. **Generic Structs** - Create data structures that can hold any type
3. **Generic Enums** - Represent different types of data in a single enum
4. **Generic Methods** - Write methods that work with any type
5. **Trait Bounds** - Constrain generic types to have certain capabilities
6. **Lifetime Parameters** - Combine generics with lifetime management
7. **Type Safety** - Ensure compile-time type checking without runtime overhead

**Why** these concepts matter:

- **Code reuse** eliminates duplication and improves maintainability
- **Type safety** prevents runtime errors and ensures correctness
- **Performance** generates optimized code for each specific type
- **Flexibility** enables powerful abstractions and generic programming

## Next Steps

Now that you understand generics, you're ready to learn about:

- **Traits** - Define shared behavior and implement trait objects
- **Lifetimes** - Manage reference lifetimes and prevent dangling references
- **Smart Pointers** - Use advanced pointer types for memory management
- **Concurrency** - Write safe concurrent and parallel programs

**Where** to go next: Continue with the next lesson on "Traits" to learn about defining shared behavior in Rust!
