---
sidebar_position: 1
---

# Memory Layout

Master memory layout concepts in systems programming with comprehensive explanations using the 4W+H framework.

## What Is Memory Layout?

**What**: Memory layout refers to how data is organized and stored in computer memory, including the arrangement of stack, heap, and static memory regions, as well as the internal structure of data types.

**Why**: Understanding memory layout is crucial because:

- **Performance Optimization**: Proper memory layout can significantly improve cache performance
- **Memory Safety**: Understanding layout helps prevent buffer overflows and memory corruption
- **Systems Programming**: Essential for low-level programming, device drivers, and embedded systems
- **Debugging**: Helps identify memory-related issues and optimize data structures
- **Cross-platform Compatibility**: Understanding layout differences between architectures

**When**: Use memory layout knowledge when:

- Writing performance-critical code
- Implementing custom data structures
- Working with FFI (Foreign Function Interface)
- Debugging memory-related issues
- Optimizing cache performance
- Writing embedded or systems software

**Where**: Memory layout concepts apply in:

- Systems programming and operating systems
- Embedded systems development
- Performance-critical applications
- Database systems and file systems
- Graphics programming and game engines
- Network programming and protocols

**How**: Memory layout is managed through:

- Compiler optimizations and alignment
- Runtime memory management
- Operating system memory allocation
- Hardware memory management units (MMU)
- Cache hierarchy and memory controllers

## Memory Regions Overview

### Stack Memory

The stack is a LIFO (Last In, First Out) data structure that stores:

- Function parameters and local variables
- Return addresses and frame pointers
- Temporary data during function execution

```rust
fn stack_example() {
    let x = 42;           // Stored on stack
    let y = [1, 2, 3];    // Array stored on stack
    let z = String::from("hello"); // String data on heap, pointer on stack

    // Stack frame contains:
    // - x: i32 (4 bytes)
    // - y: [i32; 3] (12 bytes)
    // - z: String (24 bytes: ptr, len, capacity)
}
```

### Heap Memory

The heap stores dynamically allocated data:

- Data that outlives the current function
- Large data structures
- Data with unknown size at compile time

```rust
use std::alloc::{alloc, dealloc, Layout};

fn heap_example() {
    // Manual heap allocation
    let layout = Layout::new::<i32>();
    unsafe {
        let ptr = alloc(layout) as *mut i32;
        *ptr = 42;
        println!("Heap value: {}", *ptr);
        dealloc(ptr, layout);
    }
}
```

### Static Memory

Static memory contains:

- Global variables
- String literals
- Static data structures

```rust
static GLOBAL_COUNTER: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
const MAX_SIZE: usize = 1000;

fn static_example() {
    // Accessing static data
    let count = GLOBAL_COUNTER.load(std::sync::atomic::Ordering::Relaxed);
    println!("Global counter: {}", count);
}
```

## Data Type Layout

### Primitive Types

```rust
fn primitive_layouts() {
    // Size and alignment of primitive types
    println!("bool: {} bytes", std::mem::size_of::<bool>());
    println!("i8: {} bytes", std::mem::size_of::<i8>());
    println!("i32: {} bytes", std::mem::size_of::<i32>());
    println!("i64: {} bytes", std::mem::size_of::<i64>());
    println!("f32: {} bytes", std::mem::size_of::<f32>());
    println!("f64: {} bytes", std::mem::size_of::<f64>());
    println!("char: {} bytes", std::mem::size_of::<char>());
}
```

### Struct Layout

```rust
#[derive(Debug)]
struct Person {
    name: String,    // 24 bytes (String)
    age: u32,        // 4 bytes
    active: bool,    // 1 byte
    // Padding: 3 bytes (to align to 8-byte boundary)
}

fn struct_layout() {
    println!("Person size: {} bytes", std::mem::size_of::<Person>());
    println!("Person alignment: {} bytes", std::mem::align_of::<Person>());

    // Field offsets
    let person = Person {
        name: "Alice".to_string(),
        age: 30,
        active: true,
    };

    // Accessing fields shows memory layout
    println!("Person: {:?}", person);
}
```

### Enum Layout

```rust
#[derive(Debug)]
enum Message {
    Quit,                           // 0 bytes (tag only)
    Move { x: i32, y: i32 },        // 8 bytes + tag
    Write(String),                  // 24 bytes + tag
    ChangeColor(i32, i32, i32),     // 12 bytes + tag
}

fn enum_layout() {
    println!("Message size: {} bytes", std::mem::size_of::<Message>());
    println!("Message alignment: {} bytes", std::mem::align_of::<Message>());

    let messages = vec![
        Message::Quit,
        Message::Move { x: 10, y: 20 },
        Message::Write("Hello".to_string()),
        Message::ChangeColor(255, 0, 0),
    ];

    for msg in messages {
        println!("Message: {:?}", msg);
    }
}
```

## Memory Alignment

### Alignment Basics

```rust
#[repr(C)]  // C-compatible layout
struct AlignedStruct {
    a: u8,   // 1 byte
    b: u32,  // 4 bytes (aligned to 4-byte boundary)
    c: u8,   // 1 byte
    d: u16,  // 2 bytes (aligned to 2-byte boundary)
}

fn alignment_example() {
    println!("AlignedStruct size: {} bytes", std::mem::size_of::<AlignedStruct>());
    println!("AlignedStruct alignment: {} bytes", std::mem::align_of::<AlignedStruct>());

    // Field offsets
    let s = AlignedStruct { a: 1, b: 2, c: 3, d: 4 };
    println!("Struct: a={}, b={}, c={}, d={}", s.a, s.b, s.c, s.d);
}
```

### Packed Structs

```rust
#[repr(packed)]  // No padding between fields
struct PackedStruct {
    a: u8,
    b: u32,
    c: u8,
}

fn packed_example() {
    println!("PackedStruct size: {} bytes", std::mem::size_of::<PackedStruct>());
    println!("PackedStruct alignment: {} bytes", std::mem::align_of::<PackedStruct>());

    // Warning: packed structs may have alignment issues
    let s = PackedStruct { a: 1, b: 2, c: 3 };
    println!("Packed struct: a={}, b={}, c={}", s.a, s.b, s.c);
}
```

## Memory Mapping

### Virtual Memory Concepts

```rust
use std::ptr;

fn memory_mapping_example() {
    // Understanding virtual memory layout
    let stack_var = 42;
    let heap_var = Box::new(42);
    let static_var = &GLOBAL_COUNTER;

    println!("Stack variable address: {:p}", &stack_var);
    println!("Heap variable address: {:p}", heap_var.as_ref());
    println!("Static variable address: {:p}", static_var);

    // Memory regions (conceptual)
    println!("Stack grows downward");
    println!("Heap grows upward");
    println!("Static data in low memory");
}
```

### Memory Pages

```rust
use std::alloc::{alloc, dealloc, Layout};

fn page_alignment_example() {
    // Allocate memory aligned to page boundary
    let page_size = 4096; // Typical page size
    let layout = Layout::from_size_align(page_size, page_size).unwrap();

    unsafe {
        let ptr = alloc(layout);
        if !ptr.is_null() {
            println!("Allocated page-aligned memory at: {:p}", ptr);
            dealloc(ptr, layout);
        }
    }
}
```

## Advanced Memory Layout

### Custom Memory Layout

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct CustomAllocator {
    memory: *mut u8,
    size: usize,
    offset: usize,
}

impl CustomAllocator {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        Self {
            memory,
            size,
            offset: 0,
        }
    }

    fn allocate(&mut self, size: usize, align: usize) -> Option<*mut u8> {
        let aligned_offset = (self.offset + align - 1) & !(align - 1);

        if aligned_offset + size <= self.size {
            let ptr = unsafe { self.memory.add(aligned_offset) };
            self.offset = aligned_offset + size;
            Some(ptr)
        } else {
            None
        }
    }
}

impl Drop for CustomAllocator {
    fn drop(&mut self) {
        let layout = Layout::from_size_align(self.size, 8).unwrap();
        unsafe { dealloc(self.memory, layout); }
    }
}

fn custom_allocator_example() {
    let mut allocator = CustomAllocator::new(1024);

    // Allocate some memory
    if let Some(ptr) = allocator.allocate(64, 8) {
        unsafe {
            ptr::write(ptr as *mut i32, 42);
            let value = ptr::read(ptr as *mut i32);
            println!("Allocated value: {}", value);
        }
    }
}
```

### Memory Pool

```rust
use std::collections::VecDeque;
use std::sync::Mutex;

struct MemoryPool<T> {
    objects: Mutex<VecDeque<Box<T>>>,
    factory: fn() -> T,
}

impl<T> MemoryPool<T> {
    fn new(capacity: usize, factory: fn() -> T) -> Self {
        let mut objects = VecDeque::with_capacity(capacity);
        for _ in 0..capacity {
            objects.push_back(Box::new(factory()));
        }

        Self {
            objects: Mutex::new(objects),
            factory,
        }
    }

    fn acquire(&self) -> Option<Box<T>> {
        self.objects.lock().unwrap().pop_front()
    }

    fn release(&self, mut obj: Box<T>) {
        // Reset object state
        *obj = (self.factory)();
        self.objects.lock().unwrap().push_back(obj);
    }
}

fn memory_pool_example() {
    let pool = MemoryPool::new(10, || String::new());

    // Acquire objects from pool
    if let Some(mut obj) = pool.acquire() {
        obj.push_str("Hello from pool!");
        println!("Pool object: {}", obj);

        // Release back to pool
        pool.release(obj);
    }
}
```

## Performance Considerations

### Cache-Friendly Layout

```rust
// Cache-friendly struct layout
#[derive(Debug)]
struct CacheFriendly {
    // Group frequently accessed fields together
    id: u32,           // 4 bytes
    active: bool,      // 1 byte
    priority: u8,      // 1 byte
    // 2 bytes padding

    // Less frequently accessed fields
    description: String, // 24 bytes
    metadata: Vec<u8>,   // 24 bytes
}

// Cache-unfriendly layout (for comparison)
#[derive(Debug)]
struct CacheUnfriendly {
    description: String, // 24 bytes
    id: u32,            // 4 bytes
    metadata: Vec<u8>,   // 24 bytes
    active: bool,       // 1 byte
    priority: u8,       // 1 byte
    // 2 bytes padding
}

fn cache_performance_example() {
    let friendly = CacheFriendly {
        id: 1,
        active: true,
        priority: 5,
        description: "Test".to_string(),
        metadata: vec![1, 2, 3],
    };

    let unfriendly = CacheUnfriendly {
        description: "Test".to_string(),
        id: 1,
        metadata: vec![1, 2, 3],
        active: true,
        priority: 5,
    };

    println!("Cache-friendly size: {} bytes", std::mem::size_of::<CacheFriendly>());
    println!("Cache-unfriendly size: {} bytes", std::mem::size_of::<CacheUnfriendly>());
}
```

### Memory Access Patterns

```rust
fn memory_access_patterns() {
    // Sequential access (cache-friendly)
    let mut vec = Vec::with_capacity(1000);
    for i in 0..1000 {
        vec.push(i);
    }

    // Sequential access
    let sum: i32 = vec.iter().sum();
    println!("Sequential sum: {}", sum);

    // Random access (less cache-friendly)
    let mut random_sum = 0;
    for i in (0..1000).step_by(7) {
        random_sum += vec[i % vec.len()];
    }
    println!("Random access sum: {}", random_sum);
}
```

## Practical Exercises

### Exercise 1: Memory Layout Analysis

```rust
// Analyze the memory layout of different data structures
fn analyze_layouts() {
    // TODO: Implement layout analysis for:
    // 1. Different struct arrangements
    // 2. Enum variants with different payloads
    // 3. Array vs Vec memory layout
    // 4. String vs &str memory layout
}
```

### Exercise 2: Custom Memory Allocator

```rust
// Implement a simple memory allocator
struct SimpleAllocator {
    // TODO: Implement a basic memory allocator
    // 1. Track allocated and free blocks
    // 2. Implement allocation and deallocation
    // 3. Handle fragmentation
    // 4. Provide alignment support
}
```

### Exercise 3: Memory Pool Implementation

```rust
// Create a memory pool for frequently allocated objects
struct ObjectPool<T> {
    // TODO: Implement an object pool
    // 1. Pre-allocate objects
    // 2. Track available objects
    // 3. Implement acquire/release methods
    // 4. Handle pool exhaustion
}
```

## Key Takeaways

- **Memory layout** affects both performance and correctness
- **Alignment** is crucial for hardware compatibility and performance
- **Cache-friendly layouts** can significantly improve performance
- **Stack vs heap** choice impacts both performance and safety
- **Custom allocators** can optimize for specific use cases
- **Memory pools** reduce allocation overhead for frequent allocations

## Next Steps

- Learn about **custom allocators** and memory management strategies
- Explore **unsafe Rust** for low-level memory operations
- Study **operating system integration** for system-level programming
- Practice with **device drivers** and hardware interfaces

## Resources

- [The Rustonomicon - Memory Layout](https://doc.rust-lang.org/nomicon/other-reprs.html)
- [Rust Reference - Type Layout](https://doc.rust-lang.org/reference/type-layout.html)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
- [Systems Programming with Rust](https://doc.rust-lang.org/book/ch20-00-final-project-a-web-server.html)
