---
sidebar_position: 4
---

# Practical Exercises: Generics and Traits

Master generics and traits through hands-on exercises with comprehensive explanations using the 4W+H framework.

## Exercise 1: Generic Data Structure Library

### Problem Statement

**What**: Create a comprehensive generic data structure library that includes a stack, queue, and linked list.

**Why**: This exercise teaches you how to build reusable data structures that work with any type while maintaining type safety.

**How**: Implement the following data structures:

```rust
// Generic Stack
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

// Generic Queue
struct Queue<T> {
    items: Vec<T>,
}

impl<T> Queue<T> {
    fn new() -> Self {
        Queue { items: Vec::new() }
    }

    fn enqueue(&mut self, item: T) {
        self.items.push(item);
    }

    fn dequeue(&mut self) -> Option<T> {
        if self.items.is_empty() {
            None
        } else {
            Some(self.items.remove(0))
        }
    }

    fn front(&self) -> Option<&T> {
        self.items.first()
    }

    fn is_empty(&self) -> bool {
        self.items.is_empty()
    }

    fn len(&self) -> usize {
        self.items.len()
    }
}

// Generic Linked List Node
struct Node<T> {
    value: T,
    next: Option<Box<Node<T>>>,
}

impl<T> Node<T> {
    fn new(value: T) -> Self {
        Node { value, next: None }
    }
}

struct LinkedList<T> {
    head: Option<Box<Node<T>>>,
    length: usize,
}

impl<T> LinkedList<T> {
    fn new() -> Self {
        LinkedList { head: None, length: 0 }
    }

    fn push_front(&mut self, value: T) {
        let mut new_node = Box::new(Node::new(value));
        new_node.next = self.head.take();
        self.head = Some(new_node);
        self.length += 1;
    }

    fn pop_front(&mut self) -> Option<T> {
        if let Some(mut head) = self.head.take() {
            self.head = head.next.take();
            self.length -= 1;
            Some(head.value)
        } else {
            None
        }
    }

    fn len(&self) -> usize {
        self.length
    }

    fn is_empty(&self) -> bool {
        self.head.is_none()
    }
}

fn main() {
    // Test Stack
    let mut stack = Stack::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);

    println!("Stack length: {}", stack.len());
    while let Some(value) = stack.pop() {
        println!("Popped: {}", value);
    }

    // Test Queue
    let mut queue = Queue::new();
    queue.enqueue("first");
    queue.enqueue("second");
    queue.enqueue("third");

    println!("Queue length: {}", queue.len());
    while let Some(value) = queue.dequeue() {
        println!("Dequeued: {}", value);
    }

    // Test Linked List
    let mut list = LinkedList::new();
    list.push_front(10);
    list.push_front(20);
    list.push_front(30);

    println!("List length: {}", list.len());
    while let Some(value) = list.pop_front() {
        println!("Popped: {}", value);
    }
}
```

**Explanation**:

- Each data structure is generic over type `T`
- The implementations provide common operations for each structure
- All structures maintain their own invariants and state
- The code demonstrates how generics enable reusable data structures
- Type safety is maintained throughout all operations

**Why**: This exercise teaches you how to build reusable, type-safe data structures that work with any type.

### Advanced Challenge

**What**: Add trait bounds to make the data structures more powerful.

**How**: Enhance the data structures with trait bounds:

```rust
use std::fmt::Display;

impl<T: Display> Stack<T> {
    fn display_all(&self) {
        for (i, item) in self.items.iter().enumerate() {
            println!("Stack[{}]: {}", i, item);
        }
    }
}

impl<T: PartialEq> Stack<T> {
    fn contains(&self, target: &T) -> bool {
        self.items.contains(target)
    }
}

impl<T: Clone> Stack<T> {
    fn clone_stack(&self) -> Stack<T> {
        Stack {
            items: self.items.clone(),
        }
    }
}

fn main() {
    let mut stack = Stack::new();
    stack.push(1);
    stack.push(2);
    stack.push(3);

    stack.display_all();
    println!("Contains 2: {}", stack.contains(&2));

    let cloned = stack.clone_stack();
    cloned.display_all();
}
```

## Exercise 2: Plugin System with Traits

### Problem Statement

**What**: Create a plugin system that allows different types of processors to be registered and used.

**Why**: This exercise teaches you how to use traits to create extensible systems that can be enhanced with new functionality.

**How**: Implement the plugin system:

```rust
use std::collections::HashMap;

// Base trait for all plugins
trait Plugin {
    fn name(&self) -> &str;
    fn version(&self) -> &str;
    fn execute(&self, input: &str) -> String;
}

// Text processor plugin
struct TextProcessor {
    name: String,
    version: String,
}

impl TextProcessor {
    fn new() -> Self {
        TextProcessor {
            name: "TextProcessor".to_string(),
            version: "1.0.0".to_string(),
        }
    }
}

impl Plugin for TextProcessor {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn execute(&self, input: &str) -> String {
        input.to_uppercase()
    }
}

// Number processor plugin
struct NumberProcessor {
    name: String,
    version: String,
}

impl NumberProcessor {
    fn new() -> Self {
        NumberProcessor {
            name: "NumberProcessor".to_string(),
            version: "1.0.0".to_string(),
        }
    }
}

impl Plugin for NumberProcessor {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn execute(&self, input: &str) -> String {
        match input.parse::<i32>() {
            Ok(num) => format!("Number: {}", num * 2),
            Err(_) => "Invalid number".to_string(),
        }
    }
}

// Plugin manager
struct PluginManager {
    plugins: HashMap<String, Box<dyn Plugin>>,
}

impl PluginManager {
    fn new() -> Self {
        PluginManager {
            plugins: HashMap::new(),
        }
    }

    fn register_plugin(&mut self, plugin: Box<dyn Plugin>) {
        let name = plugin.name().to_string();
        self.plugins.insert(name, plugin);
    }

    fn execute_plugin(&self, name: &str, input: &str) -> Option<String> {
        self.plugins.get(name).map(|plugin| plugin.execute(input))
    }

    fn list_plugins(&self) {
        for (name, plugin) in &self.plugins {
            println!("Plugin: {} (version: {})", name, plugin.version());
        }
    }
}

fn main() {
    let mut manager = PluginManager::new();

    // Register plugins
    manager.register_plugin(Box::new(TextProcessor::new()));
    manager.register_plugin(Box::new(NumberProcessor::new()));

    // List all plugins
    manager.list_plugins();

    // Execute plugins
    if let Some(result) = manager.execute_plugin("TextProcessor", "hello world") {
        println!("TextProcessor result: {}", result);
    }

    if let Some(result) = manager.execute_plugin("NumberProcessor", "42") {
        println!("NumberProcessor result: {}", result);
    }
}
```

**Explanation**:

- `Plugin` trait defines the interface for all plugins
- Different plugin types implement the trait with specific behavior
- `PluginManager` uses trait objects to store different plugin types
- The system is extensible - new plugins can be added easily
- Type safety is maintained through the trait system

**Why**: This exercise demonstrates how traits enable extensible, plugin-based architectures.

### Advanced Challenge

**What**: Add configuration and error handling to the plugin system.

**How**: Enhance the plugin system:

```rust
use std::collections::HashMap;

#[derive(Debug)]
enum PluginError {
    NotFound,
    ExecutionError(String),
}

trait ConfigurablePlugin: Plugin {
    fn configure(&mut self, config: HashMap<String, String>);
    fn get_config(&self) -> HashMap<String, String>;
}

struct AdvancedTextProcessor {
    name: String,
    version: String,
    config: HashMap<String, String>,
}

impl AdvancedTextProcessor {
    fn new() -> Self {
        AdvancedTextProcessor {
            name: "AdvancedTextProcessor".to_string(),
            version: "2.0.0".to_string(),
            config: HashMap::new(),
        }
    }
}

impl Plugin for AdvancedTextProcessor {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn execute(&self, input: &str) -> String {
        let operation = self.config.get("operation").unwrap_or(&"uppercase".to_string());
        match operation.as_str() {
            "uppercase" => input.to_uppercase(),
            "lowercase" => input.to_lowercase(),
            "reverse" => input.chars().rev().collect(),
            _ => input.to_string(),
        }
    }
}

impl ConfigurablePlugin for AdvancedTextProcessor {
    fn configure(&mut self, config: HashMap<String, String>) {
        self.config = config;
    }

    fn get_config(&self) -> HashMap<String, String> {
        self.config.clone()
    }
}

fn main() {
    let mut processor = AdvancedTextProcessor::new();

    let mut config = HashMap::new();
    config.insert("operation".to_string(), "reverse".to_string());
    processor.configure(config);

    let result = processor.execute("hello world");
    println!("Result: {}", result);
}
```

## Exercise 3: Generic Algorithm Library

### Problem Statement

**What**: Create a library of generic algorithms that work with different types and constraints.

**Why**: This exercise teaches you how to write reusable algorithms that work with various types while maintaining type safety.

**How**: Implement the algorithm library:

```rust
use std::cmp::PartialOrd;
use std::clone::Clone;

// Generic sorting algorithms
pub fn bubble_sort<T: PartialOrd + Clone>(mut arr: Vec<T>) -> Vec<T> {
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

pub fn selection_sort<T: PartialOrd + Clone>(mut arr: Vec<T>) -> Vec<T> {
    let n = arr.len();
    for i in 0..n {
        let mut min_idx = i;
        for j in i + 1..n {
            if arr[j] < arr[min_idx] {
                min_idx = j;
            }
        }
        if min_idx != i {
            arr.swap(i, min_idx);
        }
    }
    arr
}

// Generic search algorithms
pub fn linear_search<T: PartialEq>(arr: &[T], target: &T) -> Option<usize> {
    for (i, item) in arr.iter().enumerate() {
        if item == target {
            return Some(i);
        }
    }
    None
}

pub fn binary_search<T: PartialOrd>(arr: &[T], target: &T) -> Option<usize> {
    let mut left = 0;
    let mut right = arr.len();

    while left < right {
        let mid = left + (right - left) / 2;
        if arr[mid] == *target {
            return Some(mid);
        } else if arr[mid] < *target {
            left = mid + 1;
        } else {
            right = mid;
        }
    }
    None
}

// Generic utility functions
pub fn find_max<T: PartialOrd>(arr: &[T]) -> Option<&T> {
    arr.iter().max_by(|a, b| a.partial_cmp(b).unwrap())
}

pub fn find_min<T: PartialOrd>(arr: &[T]) -> Option<&T> {
    arr.iter().min_by(|a, b| a.partial_cmp(b).unwrap())
}

pub fn count_occurrences<T: PartialEq>(arr: &[T], target: &T) -> usize {
    arr.iter().filter(|&x| x == target).count()
}

// Generic data transformation
pub fn map<T, U, F>(arr: &[T], f: F) -> Vec<U>
where
    F: Fn(&T) -> U,
{
    arr.iter().map(f).collect()
}

pub fn filter<T, F>(arr: &[T], f: F) -> Vec<T>
where
    F: Fn(&T) -> bool,
    T: Clone,
{
    arr.iter().filter(|&x| f(x)).cloned().collect()
}

fn main() {
    let numbers = vec![64, 34, 25, 12, 22, 11, 90];
    println!("Original: {:?}", numbers);

    let sorted = bubble_sort(numbers.clone());
    println!("Bubble sorted: {:?}", sorted);

    let selection_sorted = selection_sort(numbers.clone());
    println!("Selection sorted: {:?}", selection_sorted);

    if let Some(index) = linear_search(&sorted, &22) {
        println!("Found 22 at index: {}", index);
    }

    if let Some(index) = binary_search(&sorted, &22) {
        println!("Binary search found 22 at index: {}", index);
    }

    if let Some(max) = find_max(&sorted) {
        println!("Maximum: {}", max);
    }

    let doubled = map(&sorted, |x| x * 2);
    println!("Doubled: {:?}", doubled);

    let evens = filter(&sorted, |x| x % 2 == 0);
    println!("Even numbers: {:?}", evens);
}
```

**Explanation**:

- All algorithms are generic over type `T` with appropriate trait bounds
- Sorting algorithms require `PartialOrd + Clone` for comparison and copying
- Search algorithms use `PartialEq` for equality and `PartialOrd` for ordering
- Utility functions work with different trait bounds as needed
- The algorithms are reusable with any type that meets the requirements

**Why**: This exercise demonstrates how to create reusable, type-safe algorithms that work with different types.

### Advanced Challenge

**What**: Add custom trait bounds and more sophisticated algorithms.

**How**: Enhance the algorithm library:

```rust
use std::cmp::PartialOrd;
use std::clone::Clone;
use std::fmt::Display;

// Custom trait for algorithms that need display capability
trait Displayable: Display + Clone + PartialOrd {}

impl<T: Display + Clone + PartialOrd> Displayable for T {}

// Generic algorithm with custom trait bounds
pub fn sort_and_display<T: Displayable>(mut arr: Vec<T>) -> Vec<T> {
    println!("Sorting array of {} items", arr.len());
    for (i, item) in arr.iter().enumerate() {
        println!("  [{}]: {}", i, item);
    }

    arr.sort_by(|a, b| a.partial_cmp(b).unwrap());

    println!("Sorted array:");
    for (i, item) in arr.iter().enumerate() {
        println!("  [{}]: {}", i, item);
    }

    arr
}

// Generic algorithm with multiple trait bounds
pub fn process_and_analyze<T, U, F>(arr: &[T], processor: F) -> (Option<&T>, usize, Vec<U>)
where
    T: PartialOrd + Clone,
    U: Clone,
    F: Fn(&T) -> U,
{
    let max = arr.iter().max_by(|a, b| a.partial_cmp(b).unwrap());
    let count = arr.len();
    let processed: Vec<U> = arr.iter().map(processor).collect();

    (max, count, processed)
}

fn main() {
    let numbers = vec![64, 34, 25, 12, 22, 11, 90];
    let sorted = sort_and_display(numbers);

    let (max, count, doubled) = process_and_analyze(&sorted, |x| x * 2);

    println!("Analysis:");
    println!("  Count: {}", count);
    if let Some(max_val) = max {
        println!("  Maximum: {}", max_val);
    }
    println!("  Doubled: {:?}", doubled);
}
```

**Explanation**:

- `Displayable` trait defines a custom trait bound for types that need to display and clone
- `sort_and_display` algorithm uses the `Displayable` trait bound to sort and display the array
- `process_and_analyze` algorithm uses multiple trait bounds to process and analyze the array

**Why**: This exercise demonstrates how to create reusable, type-safe algorithms with custom trait bounds.

## Exercise 4: Generic Serialization System

### Problem Statement

**What**: Create a generic serialization system that can work with different types and formats.

**Why**: This exercise teaches you how to use traits to create flexible serialization systems that can work with various types.

**How**: Implement the serialization system:

```rust
use std::collections::HashMap;

// Trait for serializable types
trait Serializable {
    fn serialize(&self) -> String;
    fn deserialize(data: &str) -> Result<Self, String>
    where
        Self: Sized;
}

// Trait for different serialization formats
trait SerializationFormat {
    fn format_name(&self) -> &str;
    fn serialize<T: Serializable>(&self, data: &T) -> String;
    fn deserialize<T: Serializable>(&self, data: &str) -> Result<T, String>;
}

// JSON-like format
struct JsonFormat;

impl SerializationFormat for JsonFormat {
    fn format_name(&self) -> &str {
        "JSON"
    }

    fn serialize<T: Serializable>(&self, data: &T) -> String {
        data.serialize()
    }

    fn deserialize<T: Serializable>(&self, data: &str) -> Result<T, String> {
        T::deserialize(data)
    }
}

// XML-like format
struct XmlFormat;

impl SerializationFormat for XmlFormat {
    fn format_name(&self) -> &str {
        "XML"
    }

    fn serialize<T: Serializable>(&self, data: &T) -> String {
        format!("<data>{}</data>", data.serialize())
    }

    fn deserialize<T: Serializable>(&self, data: &str) -> Result<T, String> {
        // Simple XML parsing (in real implementation, use proper XML parser)
        if data.starts_with("<data>") && data.ends_with("</data>") {
            let content = &data[6..data.len()-7];
            T::deserialize(content)
        } else {
            Err("Invalid XML format".to_string())
        }
    }
}

// Generic serializer
struct Serializer<F: SerializationFormat> {
    format: F,
}

impl<F: SerializationFormat> Serializer<F> {
    fn new(format: F) -> Self {
        Serializer { format }
    }

    fn serialize<T: Serializable>(&self, data: &T) -> String {
        self.format.serialize(data)
    }

    fn deserialize<T: Serializable>(&self, data: &str) -> Result<T, String> {
        self.format.deserialize(data)
    }

    fn format_name(&self) -> &str {
        self.format.format_name()
    }
}

// Example serializable types
#[derive(Clone)]
struct Person {
    name: String,
    age: u32,
}

impl Serializable for Person {
    fn serialize(&self) -> String {
        format!("{{\"name\":\"{}\",\"age\":{}}}", self.name, self.age)
    }

    fn deserialize(data: &str) -> Result<Self, String> {
        // Simple JSON parsing (in real implementation, use proper JSON parser)
        if data.starts_with("{\"name\":\"") && data.contains("\",\"age\":") && data.ends_with("}") {
            let name_start = data.find("\"name\":\"").unwrap() + 8;
            let name_end = data.find("\",\"age\":").unwrap();
            let name = data[name_start..name_end].to_string();

            let age_start = data.find("\",\"age\":").unwrap() + 8;
            let age_end = data.len() - 1;
            let age = data[age_start..age_end].parse::<u32>()
                .map_err(|_| "Invalid age".to_string())?;

            Ok(Person { name, age })
        } else {
            Err("Invalid JSON format".to_string())
        }
    }
}

fn main() {
    let person = Person {
        name: "Alice".to_string(),
        age: 30,
    };

    // Test JSON format
    let json_serializer = Serializer::new(JsonFormat);
    let json_data = json_serializer.serialize(&person);
    println!("JSON: {}", json_data);

    let deserialized_person = json_serializer.deserialize::<Person>(&json_data).unwrap();
    println!("Deserialized: {} is {} years old", deserialized_person.name, deserialized_person.age);

    // Test XML format
    let xml_serializer = Serializer::new(XmlFormat);
    let xml_data = xml_serializer.serialize(&person);
    println!("XML: {}", xml_data);

    let deserialized_person2 = xml_serializer.deserialize::<Person>(&xml_data).unwrap();
    println!("Deserialized: {} is {} years old", deserialized_person2.name, deserialized_person2.age);
}
```

**Explanation**:

- `Serializable` trait defines the interface for serializable types
- `SerializationFormat` trait defines different serialization formats
- `Serializer` is generic over the format type
- Different formats can be implemented by implementing the trait
- The system is extensible and type-safe

**Why**: This exercise demonstrates how traits enable flexible, extensible systems that can work with different types and formats.

## Key Takeaways

**What** you've learned through these practical exercises:

1. **Generic Data Structures** - Building reusable, type-safe data structures
2. **Plugin Systems** - Using traits to create extensible architectures
3. **Algorithm Libraries** - Writing reusable algorithms with trait bounds
4. **Serialization Systems** - Creating flexible systems with multiple implementations
5. **Trait Bounds** - Applying constraints to generic code
6. **Type Safety** - Ensuring compile-time type checking
7. **Code Reuse** - Writing generic code that works with multiple types

**Why** these exercises matter:

- **Practical Skills** - Hands-on experience with real-world scenarios
- **Problem Solving** - Developing solutions to complex programming problems
- **Code Quality** - Writing maintainable, type-safe code
- **Architecture Design** - Understanding how to design extensible systems
- **Rust Mastery** - Deepening understanding of Rust's type system

## Next Steps

Now that you've completed these practical exercises, you're ready to learn about:

- **Lifetime management** - Reference lifetime handling in generic code
- **Smart pointers** - Advanced pointer types and memory management
- **Concurrency** - Safe concurrent programming with generics
- **Advanced patterns** - Complex trait relationships and implementations

**Where** to go next: Continue with the next lesson on "Lifetimes" to learn about reference lifetime management in Rust!
