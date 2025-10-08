---
sidebar_position: 2
---

# Traits Basics

Master trait-based design in Rust with comprehensive explanations using the 4W+H framework.

## What Are Traits?

**What**: Traits are Rust's way of defining shared behavior. They allow you to specify what methods a type must implement, enabling polymorphism and code reuse while maintaining type safety.

**Why**: Understanding traits is crucial because:

- **Code reuse** allows you to define behavior once and implement it for multiple types
- **Polymorphism** enables you to write code that works with different types that share the same behavior
- **Type safety** ensures compile-time checking of trait implementations
- **Abstraction** helps you create clear interfaces and contracts
- **Extensibility** allows you to add new behavior to existing types
- **Generic programming** enables powerful abstractions with trait bounds

**When**: Use traits when you need to:

- Define shared behavior across multiple types
- Create generic functions that work with types having certain capabilities
- Implement polymorphism without runtime overhead
- Add methods to existing types (extension traits)
- Create clear interfaces and contracts
- Build reusable libraries and frameworks

**How**: Traits work in Rust by:

- **Trait definitions** specifying required methods and associated types
- **Trait implementations** providing concrete behavior for specific types
- **Trait bounds** constraining generic types to have certain capabilities
- **Trait objects** enabling dynamic dispatch at runtime
- **Default implementations** providing common behavior that can be overridden

**Where**: Traits are used throughout Rust programs for defining interfaces, enabling polymorphism, and creating powerful abstractions.

## Understanding Basic Traits

### Defining Traits

**What**: Trait definitions specify what methods a type must implement to satisfy the trait.

**Why**: Understanding trait definitions is important because:

- **Interface specification** creates clear contracts for behavior
- **Code organization** helps you structure related functionality
- **Type safety** ensures all required methods are implemented
- **Documentation** makes expected behavior explicit

**When**: Use trait definitions when you need to specify shared behavior across multiple types.

**How**: Here's how to define basic traits:

```rust
// Basic trait definition
trait Drawable {
    fn draw(&self);
    fn area(&self) -> f64;
}

// Trait with default implementation
trait Printable {
    fn print(&self) {
        println!("Default print implementation");
    }

    fn format(&self) -> String;
}

// Trait with associated types
trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
    fn has_next(&self) -> bool;
}

// Trait with generic methods
trait Comparable<T> {
    fn compare(&self, other: &T) -> i32;
    fn is_equal(&self, other: &T) -> bool {
        self.compare(other) == 0
    }
}

// Trait with multiple methods
trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
    fn describe(&self) -> String {
        format!("Shape with area: {:.2}", self.area())
    }
}

fn main() {
    // Traits are defined but not used directly
    println!("Traits defined successfully!");
}
```

**Explanation**:

- `trait Drawable` defines a trait with two required methods: `draw()` and `area()`
- `trait Printable` has a default implementation for `print()` and requires `format()` to be implemented
- `trait Iterator` uses an associated type `Item` to specify what the iterator yields
- `trait Comparable<T>` is generic and works with any type `T`
- `trait Shape` has both required methods and a default implementation for `describe()`

**Why**: Trait definitions create clear interfaces that types must implement, enabling polymorphism and code reuse.

### Implementing Traits

**What**: Trait implementations provide concrete behavior for specific types.

**Why**: Understanding trait implementations is important because:

- **Concrete behavior** provides actual functionality for types
- **Type safety** ensures all required methods are implemented
- **Polymorphism** enables the same code to work with different types
- **Code reuse** allows you to implement behavior once and use it everywhere

**When**: Use trait implementations when you need to provide concrete behavior for types.

**How**: Here's how to implement traits:

```rust
// Define the trait
trait Drawable {
    fn draw(&self);
    fn area(&self) -> f64;
}

// Define a struct
struct Circle {
    radius: f64,
}

// Implement the trait for the struct
impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing a circle with radius: {}", self.radius);
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

// Another struct
struct Rectangle {
    width: f64,
    height: f64,
}

// Implement the same trait for another struct
impl Drawable for Rectangle {
    fn draw(&self) {
        println!("Drawing a rectangle: {}x{}", self.width, self.height);
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }
}

// Generic function that works with any Drawable type
fn draw_shape<T: Drawable>(shape: &T) {
    shape.draw();
    println!("Area: {:.2}", shape.area());
}

fn main() {
    let circle = Circle { radius: 5.0 };
    let rectangle = Rectangle { width: 10.0, height: 8.0 };

    // Use the trait methods directly
    circle.draw();
    println!("Circle area: {:.2}", circle.area());

    rectangle.draw();
    println!("Rectangle area: {:.2}", rectangle.area());

    // Use the generic function
    draw_shape(&circle);
    draw_shape(&rectangle);
}
```

**Explanation**:

- `impl Drawable for Circle` implements the `Drawable` trait for the `Circle` struct
- Each method in the trait must be implemented with concrete behavior
- `impl Drawable for Rectangle` implements the same trait for a different struct
- `fn draw_shape<T: Drawable>(shape: &T)` uses a trait bound to work with any type that implements `Drawable`
- The same function can work with different types that implement the same trait

**Why**: Trait implementations enable polymorphism by allowing different types to share the same interface.

### Trait Bounds

**What**: Trait bounds constrain generic types to have certain capabilities.

**Why**: Understanding trait bounds is important because:

- **Type safety** ensures generic types have required capabilities
- **Compile-time checking** prevents runtime errors
- **Clear interfaces** make function requirements explicit
- **Powerful abstractions** enable sophisticated generic programming

**When**: Use trait bounds when you need to constrain generic types to have certain capabilities.

**How**: Here's how to use trait bounds:

```rust
use std::fmt::Display;
use std::fmt::Debug;

// Trait with multiple methods
trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

// Generic function with trait bounds
fn print_shape_info<T: Shape + Display>(shape: &T) {
    println!("Shape: {}", shape);
    println!("Area: {:.2}", shape.area());
    println!("Perimeter: {:.2}", shape.perimeter());
}

// Generic function with where clause
fn process_shapes<T, U>(shape1: &T, shape2: &U) -> f64
where
    T: Shape + Clone,
    U: Shape + Clone,
{
    let area1 = shape1.area();
    let area2 = shape2.area();
    area1 + area2
}

// Generic function with multiple trait bounds
fn debug_and_display<T>(item: &T)
where
    T: Debug + Display,
{
    println!("Debug: {:?}", item);
    println!("Display: {}", item);
}

// Generic struct with trait bounds
struct ShapeContainer<T: Shape> {
    shape: T,
    name: String,
}

impl<T: Shape> ShapeContainer<T> {
    fn new(shape: T, name: String) -> Self {
        Self { shape, name }
    }

    fn get_area(&self) -> f64 {
        self.shape.area()
    }

    fn get_perimeter(&self) -> f64 {
        self.shape.perimeter()
    }
}

// Implement Shape for Circle
struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }

    fn perimeter(&self) -> f64 {
        2.0 * std::f64::consts::PI * self.radius
    }
}

impl Display for Circle {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Circle(r={})", self.radius)
    }
}

impl Debug for Circle {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Circle {{ radius: {} }}", self.radius)
    }
}

fn main() {
    let circle = Circle { radius: 5.0 };

    // Use trait bounds
    print_shape_info(&circle);

    // Use where clause
    let total_area = process_shapes(&circle, &circle);
    println!("Total area: {:.2}", total_area);

    // Use multiple trait bounds
    debug_and_display(&circle);

    // Use generic struct with trait bounds
    let container = ShapeContainer::new(circle, "My Circle".to_string());
    println!("Container area: {:.2}", container.get_area());
}
```

**Explanation**:

- `T: Shape + Display` requires `T` to implement both `Shape` and `Display` traits
- `where` clauses provide cleaner syntax for complex trait bounds
- `T: Shape + Clone` requires both shape and cloning capabilities
- `struct ShapeContainer<T: Shape>` constrains the generic type to implement `Shape`
- Trait bounds ensure type safety while enabling powerful abstractions

**Why**: Trait bounds enable powerful generic programming while maintaining type safety and clear interfaces.

## Understanding Advanced Traits

### Associated Types

**What**: Associated types allow traits to define types that implementors must specify.

**Why**: Understanding associated types is important because:

- **Type relationships** enable traits to specify related types
- **Flexibility** allows implementors to choose appropriate types
- **Type safety** ensures compile-time checking of type relationships
- **Powerful abstractions** enable sophisticated generic programming

**When**: Use associated types when you need to specify related types in trait definitions.

**How**: Here's how to use associated types:

```rust
// Trait with associated types
trait Iterator {
    type Item;

    fn next(&mut self) -> Option<Self::Item>;
    fn has_next(&self) -> bool;
}

// Trait with multiple associated types
trait Container {
    type Item;
    type Index;

    fn get(&self, index: Self::Index) -> Option<&Self::Item>;
    fn len(&self) -> usize;
    fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

// Trait with associated types and constraints
trait Comparable {
    type Other;

    fn compare(&self, other: &Self::Other) -> i32;
    fn is_equal(&self, other: &Self::Other) -> bool {
        self.compare(other) == 0
    }
}

// Implement Iterator for a custom type
struct NumberIterator {
    current: i32,
    max: i32,
}

impl Iterator for NumberIterator {
    type Item = i32;

    fn next(&mut self) -> Option<Self::Item> {
        if self.current < self.max {
            let value = self.current;
            self.current += 1;
            Some(value)
        } else {
            None
        }
    }

    fn has_next(&self) -> bool {
        self.current < self.max
    }
}

// Implement Container for Vec
impl<T> Container for Vec<T> {
    type Item = T;
    type Index = usize;

    fn get(&self, index: Self::Index) -> Option<&Self::Item> {
        self.get(index)
    }

    fn len(&self) -> usize {
        self.len()
    }
}

// Implement Comparable for i32
impl Comparable for i32 {
    type Other = i32;

    fn compare(&self, other: &Self::Other) -> i32 {
        if self > other {
            1
        } else if self < other {
            -1
        } else {
            0
        }
    }
}

fn main() {
    // Use Iterator
    let mut iter = NumberIterator { current: 0, max: 5 };
    while let Some(value) = iter.next() {
        println!("Iterator value: {}", value);
    }

    // Use Container
    let vec = vec![1, 2, 3, 4, 5];
    if let Some(item) = vec.get(2) {
        println!("Vec item at index 2: {}", item);
    }

    // Use Comparable
    let a = 10;
    let b = 20;
    println!("10 compared to 20: {}", a.compare(&b));
    println!("Are they equal? {}", a.is_equal(&b));
}
```

**Explanation**:

- `type Item;` defines an associated type that implementors must specify
- `type Item = i32;` provides the concrete type for the associated type
- `Self::Item` refers to the associated type in the implementation
- Associated types enable traits to specify related types without generics
- This approach is more flexible than generic traits for certain use cases

**Why**: Associated types enable powerful abstractions by allowing traits to specify related types that implementors can choose.

### Default Implementations

**What**: Default implementations provide common behavior that can be overridden by implementors.

**Why**: Understanding default implementations is important because:

- **Code reuse** eliminates duplication of common behavior
- **Flexibility** allows implementors to override when needed
- **Convenience** provides sensible defaults for common operations
- **Extensibility** enables adding new methods to existing traits

**When**: Use default implementations when you have common behavior that most implementors will use.

**How**: Here's how to use default implementations:

```rust
// Trait with default implementations
trait Animal {
    fn name(&self) -> &str;
    fn species(&self) -> &str;

    // Default implementation
    fn make_sound(&self) -> String {
        format!("{} makes a sound", self.name())
    }

    // Default implementation that uses other methods
    fn introduce(&self) -> String {
        format!("Hi, I'm {} the {}", self.name(), self.species())
    }

    // Default implementation with conditional logic
    fn is_domesticated(&self) -> bool {
        match self.species() {
            "dog" | "cat" | "cow" | "pig" => true,
            _ => false,
        }
    }
}

// Trait with default implementations that can be overridden
trait Vehicle {
    fn brand(&self) -> &str;
    fn model(&self) -> &str;

    // Default implementation
    fn start(&self) -> String {
        format!("Starting {} {}", self.brand(), self.model())
    }

    // Default implementation with parameters
    fn accelerate(&self, speed: f64) -> String {
        format!("Accelerating to {:.1} mph", speed)
    }

    // Default implementation that can be overridden
    fn stop(&self) -> String {
        "Stopping vehicle".to_string()
    }
}

// Implement Animal for Dog
struct Dog {
    name: String,
}

impl Animal for Dog {
    fn name(&self) -> &str {
        &self.name
    }

    fn species(&self) -> &str {
        "dog"
    }

    // Override the default implementation
    fn make_sound(&self) -> String {
        format!("{} barks: Woof!", self.name())
    }
}

// Implement Animal for Cat
struct Cat {
    name: String,
}

impl Animal for Cat {
    fn name(&self) -> &str {
        &self.name
    }

    fn species(&self) -> &str {
        "cat"
    }

    // Override the default implementation
    fn make_sound(&self) -> String {
        format!("{} meows: Meow!", self.name())
    }
}

// Implement Vehicle for Car
struct Car {
    brand: String,
    model: String,
}

impl Vehicle for Car {
    fn brand(&self) -> &str {
        &self.brand
    }

    fn model(&self) -> &str {
        &self.model
    }

    // Override the default implementation
    fn stop(&self) -> String {
        format!("Applying brakes to {} {}", self.brand(), self.model())
    }
}

fn main() {
    let dog = Dog { name: "Buddy".to_string() };
    let cat = Cat { name: "Whiskers".to_string() };
    let car = Car { brand: "Toyota".to_string(), model: "Camry".to_string() };

    // Use default implementations
    println!("{}", dog.introduce());
    println!("{}", dog.make_sound());
    println!("Is {} domesticated? {}", dog.name(), dog.is_domesticated());

    println!("{}", cat.introduce());
    println!("{}", cat.make_sound());
    println!("Is {} domesticated? {}", cat.name(), cat.is_domesticated());

    // Use vehicle methods
    println!("{}", car.start());
    println!("{}", car.accelerate(60.0));
    println!("{}", car.stop());
}
```

**Explanation**:

- `fn make_sound(&self) -> String { ... }` provides a default implementation
- `fn introduce(&self) -> String { ... }` uses other trait methods in the default implementation
- `fn is_domesticated(&self) -> bool { ... }` provides conditional logic in the default implementation
- Implementors can override default implementations when they need different behavior
- Default implementations enable code reuse while maintaining flexibility

**Why**: Default implementations provide convenient common behavior while allowing customization when needed.

### Trait Objects

**What**: Trait objects enable dynamic dispatch, allowing you to work with different types that implement the same trait through a common interface.

**Why**: Understanding trait objects is important because:

- **Dynamic dispatch** enables runtime polymorphism
- **Type erasure** allows you to work with different types uniformly
- **Flexibility** enables collections of different types that share behavior
- **Runtime behavior** allows for dynamic method selection

**When**: Use trait objects when you need to work with different types that implement the same trait at runtime.

**How**: Here's how to use trait objects:

```rust
// Define a trait
trait Drawable {
    fn draw(&self);
    fn area(&self) -> f64;
}

// Implement the trait for different types
struct Circle {
    radius: f64,
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing a circle with radius: {}", self.radius);
    }

    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }
}

struct Rectangle {
    width: f64,
    height: f64,
}

impl Drawable for Rectangle {
    fn draw(&self) {
        println!("Drawing a rectangle: {}x{}", self.width, self.height);
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }
}

struct Triangle {
    base: f64,
    height: f64,
}

impl Drawable for Triangle {
    fn draw(&self) {
        println!("Drawing a triangle: base={}, height={}", self.base, self.height);
    }

    fn area(&self) -> f64 {
        0.5 * self.base * self.height
    }
}

// Function that works with trait objects
fn draw_all_shapes(shapes: &[&dyn Drawable]) {
    for shape in shapes {
        shape.draw();
        println!("Area: {:.2}", shape.area());
        println!("---");
    }
}

// Function that returns a trait object
fn create_shape(shape_type: &str) -> Box<dyn Drawable> {
    match shape_type {
        "circle" => Box::new(Circle { radius: 5.0 }),
        "rectangle" => Box::new(Rectangle { width: 10.0, height: 8.0 }),
        "triangle" => Box::new(Triangle { base: 6.0, height: 4.0 }),
        _ => panic!("Unknown shape type"),
    }
}

// Generic function that works with trait objects
fn process_drawable<T: Drawable>(shape: &T) {
    shape.draw();
    println!("Area: {:.2}", shape.area());
}

fn main() {
    // Create different shapes
    let circle = Circle { radius: 5.0 };
    let rectangle = Rectangle { width: 10.0, height: 8.0 };
    let triangle = Triangle { base: 6.0, height: 4.0 };

    // Use trait objects in a slice
    let shapes: &[&dyn Drawable] = &[&circle, &rectangle, &triangle];
    draw_all_shapes(shapes);

    // Create shapes dynamically
    let dynamic_circle = create_shape("circle");
    let dynamic_rectangle = create_shape("rectangle");

    // Use the dynamic shapes
    dynamic_circle.draw();
    println!("Dynamic circle area: {:.2}", dynamic_circle.area());

    dynamic_rectangle.draw();
    println!("Dynamic rectangle area: {:.2}", dynamic_rectangle.area());

    // Use generic function with trait objects
    process_drawable(&circle);
    process_drawable(&rectangle);
    process_drawable(&triangle);
}
```

**Explanation**:

- `&dyn Drawable` creates a trait object that can hold any type implementing `Drawable`
- `Box<dyn Drawable>` creates a boxed trait object for ownership
- `draw_all_shapes(shapes: &[&dyn Drawable])` works with a slice of trait objects
- `create_shape(shape_type: &str) -> Box<dyn Drawable>` returns different types as trait objects
- Trait objects enable dynamic dispatch and runtime polymorphism

**Why**: Trait objects enable powerful runtime polymorphism by allowing you to work with different types through a common interface.

## Understanding Trait Composition

### Multiple Trait Bounds

**What**: You can combine multiple traits to create more specific constraints.

**Why**: Understanding multiple trait bounds is important because:

- **Precise constraints** ensure types have all required capabilities
- **Type safety** prevents runtime errors by checking all requirements
- **Powerful abstractions** enable sophisticated generic programming
- **Clear interfaces** make function requirements explicit

**When**: Use multiple trait bounds when you need types that implement several traits.

**How**: Here's how to use multiple trait bounds:

```rust
use std::fmt::Display;
use std::fmt::Debug;
use std::clone::Clone;
use std::cmp::PartialOrd;

// Define multiple traits
trait Shape {
    fn area(&self) -> f64;
    fn perimeter(&self) -> f64;
}

trait Drawable {
    fn draw(&self);
}

trait Comparable {
    fn compare(&self, other: &Self) -> i32;
}

// Generic function with multiple trait bounds
fn process_shape<T>(shape: &T)
where
    T: Shape + Drawable + Display + Debug,
{
    println!("Shape: {}", shape);
    println!("Debug: {:?}", shape);
    shape.draw();
    println!("Area: {:.2}", shape.area());
    println!("Perimeter: {:.2}", shape.perimeter());
}

// Generic function with complex trait bounds
fn compare_and_display<T, U>(item1: &T, item2: &U)
where
    T: Display + Clone + PartialOrd,
    U: Display + Clone + PartialOrd,
{
    println!("Item 1: {}", item1);
    println!("Item 2: {}", item2);

    let cloned1 = item1.clone();
    let cloned2 = item2.clone();

    if cloned1 > cloned2 {
        println!("Item 1 is greater");
    } else if cloned1 < cloned2 {
        println!("Item 2 is greater");
    } else {
        println!("Items are equal");
    }
}

// Generic struct with multiple trait bounds
struct ShapeProcessor<T>
where
    T: Shape + Drawable + Clone,
{
    shape: T,
    name: String,
}

impl<T> ShapeProcessor<T>
where
    T: Shape + Drawable + Clone,
{
    fn new(shape: T, name: String) -> Self {
        Self { shape, name }
    }

    fn process(&self) {
        println!("Processing: {}", self.name);
        self.shape.draw();
        println!("Area: {:.2}", self.shape.area());
    }

    fn clone_shape(&self) -> T {
        self.shape.clone()
    }
}

// Implement all required traits for Circle
struct Circle {
    radius: f64,
}

impl Shape for Circle {
    fn area(&self) -> f64 {
        std::f64::consts::PI * self.radius * self.radius
    }

    fn perimeter(&self) -> f64 {
        2.0 * std::f64::consts::PI * self.radius
    }
}

impl Drawable for Circle {
    fn draw(&self) {
        println!("Drawing a circle with radius: {}", self.radius);
    }
}

impl Display for Circle {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Circle(r={})", self.radius)
    }
}

impl Debug for Circle {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        write!(f, "Circle {{ radius: {} }}", self.radius)
    }
}

impl Clone for Circle {
    fn clone(&self) -> Self {
        Circle { radius: self.radius }
    }
}

impl PartialOrd for Circle {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        self.radius.partial_cmp(&other.radius)
    }
}

fn main() {
    let circle = Circle { radius: 5.0 };

    // Use multiple trait bounds
    process_shape(&circle);

    // Use complex trait bounds
    let circle1 = Circle { radius: 5.0 };
    let circle2 = Circle { radius: 3.0 };
    compare_and_display(&circle1, &circle2);

    // Use generic struct with multiple trait bounds
    let processor = ShapeProcessor::new(circle, "My Circle".to_string());
    processor.process();

    let cloned = processor.clone_shape();
    println!("Cloned shape area: {:.2}", cloned.area());
}
```

**Explanation**:

- `T: Shape + Drawable + Display + Debug` requires `T` to implement all four traits
- `where` clauses provide cleaner syntax for complex trait bounds
- `T: Shape + Drawable + Clone` constrains the generic type to implement all three traits
- Multiple trait bounds ensure type safety while enabling powerful abstractions
- Complex trait bounds enable sophisticated generic programming

**Why**: Multiple trait bounds enable powerful generic programming while maintaining type safety and clear interfaces.

### Trait Inheritance

**What**: Traits can inherit from other traits, creating trait hierarchies.

**Why**: Understanding trait inheritance is important because:

- **Code reuse** eliminates duplication in trait definitions
- **Hierarchical organization** creates logical trait relationships
- **Extensibility** allows you to build upon existing traits
- **Polymorphism** enables working with trait hierarchies

**When**: Use trait inheritance when you have traits that build upon other traits.

**How**: Here's how to use trait inheritance:

```rust
// Base trait
trait Animal {
    fn name(&self) -> &str;
    fn species(&self) -> &str;

    fn introduce(&self) -> String {
        format!("Hi, I'm {} the {}", self.name(), self.species())
    }
}

// Trait that inherits from Animal
trait Pet: Animal {
    fn owner(&self) -> &str;
    fn is_house_trained(&self) -> bool;

    fn pet_info(&self) -> String {
        format!("{} is owned by {} and is {}house trained",
                self.name(),
                self.owner(),
                if self.is_house_trained() { "" } else { "not " })
    }
}

// Trait that inherits from Animal
trait WildAnimal: Animal {
    fn habitat(&self) -> &str;
    fn is_dangerous(&self) -> bool;

    fn wild_info(&self) -> String {
        format!("{} lives in {} and is {}dangerous",
                self.name(),
                self.habitat(),
                if self.is_dangerous() { "" } else { "not " })
    }
}

// Trait that inherits from Pet
trait ServiceAnimal: Pet {
    fn service_type(&self) -> &str;
    fn is_working(&self) -> bool;

    fn service_info(&self) -> String {
        format!("{} is a {} and is currently {}",
                self.name(),
                self.service_type(),
                if self.is_working() { "working" } else { "off duty" })
    }
}

// Implement the trait hierarchy
struct Dog {
    name: String,
    owner: String,
    house_trained: bool,
}

impl Animal for Dog {
    fn name(&self) -> &str {
        &self.name
    }

    fn species(&self) -> &str {
        "dog"
    }
}

impl Pet for Dog {
    fn owner(&self) -> &str {
        &self.owner
    }

    fn is_house_trained(&self) -> bool {
        self.house_trained
    }
}

struct GuideDog {
    name: String,
    owner: String,
    house_trained: bool,
    service_type: String,
    working: bool,
}

impl Animal for GuideDog {
    fn name(&self) -> &str {
        &self.name
    }

    fn species(&self) -> &str {
        "dog"
    }
}

impl Pet for GuideDog {
    fn owner(&self) -> &str {
        &self.owner
    }

    fn is_house_trained(&self) -> bool {
        self.house_trained
    }
}

impl ServiceAnimal for GuideDog {
    fn service_type(&self) -> &str {
        &self.service_type
    }

    fn is_working(&self) -> bool {
        self.working
    }
}

// Generic function that works with trait hierarchies
fn process_animal<T: Animal>(animal: &T) {
    println!("{}", animal.introduce());
}

fn process_pet<T: Pet>(pet: &T) {
    println!("{}", pet.introduce());
    println!("{}", pet.pet_info());
}

fn process_service_animal<T: ServiceAnimal>(service_animal: &T) {
    println!("{}", service_animal.introduce());
    println!("{}", service_animal.pet_info());
    println!("{}", service_animal.service_info());
}

fn main() {
    let dog = Dog {
        name: "Buddy".to_string(),
        owner: "Alice".to_string(),
        house_trained: true,
    };

    let guide_dog = GuideDog {
        name: "Luna".to_string(),
        owner: "Bob".to_string(),
        house_trained: true,
        service_type: "guide dog".to_string(),
        working: true,
    };

    // Use trait hierarchies
    process_animal(&dog);
    process_pet(&dog);

    process_animal(&guide_dog);
    process_pet(&guide_dog);
    process_service_animal(&guide_dog);
}
```

**Explanation**:

- `trait Pet: Animal` means `Pet` inherits from `Animal`
- `trait ServiceAnimal: Pet` means `ServiceAnimal` inherits from `Pet`
- Implementors must implement all traits in the hierarchy
- Generic functions can work with any level of the trait hierarchy
- Trait inheritance creates logical relationships between traits

**Why**: Trait inheritance enables code reuse and creates logical trait hierarchies while maintaining type safety.

## Practice Exercises

### Exercise 1: Basic Trait Implementation

**What**: Create a trait and implement it for different types.

**How**: Implement this exercise:

```rust
trait Greetable {
    fn greet(&self) -> String;
    fn name(&self) -> &str;
}

struct Person {
    name: String,
    age: u32,
}

impl Greetable for Person {
    fn greet(&self) -> String {
        format!("Hello, I'm {} and I'm {} years old", self.name, self.age)
    }

    fn name(&self) -> &str {
        &self.name
    }
}

struct Robot {
    name: String,
    model: String,
}

impl Greetable for Robot {
    fn greet(&self) -> String {
        format!("Hello, I'm {} model {}", self.name, self.model)
    }

    fn name(&self) -> &str {
        &self.name
    }
}

fn main() {
    let person = Person { name: "Alice".to_string(), age: 30 };
    let robot = Robot { name: "Robo".to_string(), model: "X-1000".to_string() };

    println!("{}", person.greet());
    println!("{}", robot.greet());
}
```

### Exercise 2: Trait with Default Implementation

**What**: Create a trait with default implementations.

**How**: Implement this exercise:

```rust
trait Calculator {
    fn add(&self, a: f64, b: f64) -> f64 {
        a + b
    }

    fn subtract(&self, a: f64, b: f64) -> f64 {
        a - b
    }

    fn multiply(&self, a: f64, b: f64) -> f64 {
        a * b
    }

    fn divide(&self, a: f64, b: f64) -> f64 {
        if b != 0.0 {
            a / b
        } else {
            f64::NAN
        }
    }

    fn calculate(&self, operation: &str, a: f64, b: f64) -> f64;
}

struct BasicCalculator;

impl Calculator for BasicCalculator {
    fn calculate(&self, operation: &str, a: f64, b: f64) -> f64 {
        match operation {
            "add" => self.add(a, b),
            "subtract" => self.subtract(a, b),
            "multiply" => self.multiply(a, b),
            "divide" => self.divide(a, b),
            _ => f64::NAN,
        }
    }
}

fn main() {
    let calc = BasicCalculator;

    println!("5 + 3 = {}", calc.calculate("add", 5.0, 3.0));
    println!("5 - 3 = {}", calc.calculate("subtract", 5.0, 3.0));
    println!("5 * 3 = {}", calc.calculate("multiply", 5.0, 3.0));
    println!("5 / 3 = {}", calc.calculate("divide", 5.0, 3.0));
}
```

## Key Takeaways

**What** you've learned about traits:

1. **Trait Definitions** - Specify required methods and behavior
2. **Trait Implementations** - Provide concrete behavior for types
3. **Trait Bounds** - Constrain generic types to have certain capabilities
4. **Associated Types** - Define related types in trait definitions
5. **Default Implementations** - Provide common behavior that can be overridden
6. **Trait Objects** - Enable dynamic dispatch and runtime polymorphism
7. **Trait Composition** - Combine multiple traits for powerful abstractions
8. **Trait Inheritance** - Create trait hierarchies and logical relationships

**Why** these concepts matter:

- **Code reuse** eliminates duplication and improves maintainability
- **Type safety** prevents runtime errors and ensures correctness
- **Polymorphism** enables powerful abstractions and generic programming
- **Flexibility** allows you to create reusable components and interfaces

## Next Steps

Now that you understand traits, you're ready to learn about:

- **Lifetimes** - Manage reference lifetimes and prevent dangling references
- **Smart Pointers** - Use advanced pointer types for memory management
- **Concurrency** - Write safe concurrent and parallel programs
- **Advanced Generics** - Master complex generic programming patterns

**Where** to go next: Continue with the next lesson on "Lifetimes" to learn about reference lifetime management in Rust!
