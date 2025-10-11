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

**What**: The stack memory is a memory region that is used to store local variables and function call frames.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is stack.

**When**: Use the stack memory when allocating memory in a stack fashion.

**How**: The stack memory is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates how different data types are stored in memory:

- **`x: i32`**: A 32-bit integer stored directly on the stack. Stack allocation is very fast (just moving the stack pointer)
- **`y: [i32; 3]`**: A fixed-size array stored on the stack. The entire array (12 bytes) is allocated in the stack frame
- **`z: String`**: The `String` struct itself (24 bytes) is on the stack, but the actual string data is on the heap. The stack contains a pointer, length, and capacity

**Why this matters**: Stack allocation is extremely fast (O(1)) but limited in size. Heap allocation is slower but can handle large, dynamic data. Understanding this distinction is crucial for performance optimization.

### Heap Memory

**What**: The heap memory is a memory region that is used to store dynamic data.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is heap.

**When**: Use the heap memory when allocating memory in a heap fashion.

**How**: The heap memory is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates manual heap allocation in Rust:

- **`Layout::new::<i32>()`**: Creates a memory layout for an `i32` type, specifying size and alignment requirements
- **`alloc(layout)`**: Allocates memory on the heap and returns a raw pointer. This is unsafe because it bypasses Rust's safety guarantees
- **`as *mut i32`**: Casts the raw pointer to a mutable pointer to `i32`
- **`*ptr = 42`**: Dereferences the pointer to store a value (unsafe operation)
- **`dealloc(ptr, layout)`**: Manually frees the allocated memory

**Why this is unsafe**: Manual memory management bypasses Rust's ownership system, which can lead to memory leaks, use-after-free, and double-free bugs. This is why it's wrapped in an `unsafe` block.

### Static Memory

**What**: The static memory is a memory region that is used to store global variables and constants.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is static.

**When**: Use the static memory when allocating memory in a static fashion.

**How**: The static memory is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
static GLOBAL_COUNTER: std::sync::atomic::AtomicUsize = std::sync::atomic::AtomicUsize::new(0);
const MAX_SIZE: usize = 1000;

fn static_example() {
    // Accessing static data
    let count = GLOBAL_COUNTER.load(std::sync::atomic::Ordering::Relaxed);
    println!("Global counter: {}", count);
}
```

**Code Explanation**: This example demonstrates static memory usage:

- **`GLOBAL_COUNTER`**: A global counter stored in static memory
- **`count`**: Accessing the global counter
- **`std::sync::atomic::Ordering::Relaxed`**: A relaxed atomic operation that doesn't guarantee memory ordering
- **`println!`**: Printing the global counter value

**Why this matters**: Static memory is allocated at compile time and is not reallocatable. This is useful for global variables that need to be accessed by multiple threads.

## Data Type Layout

### Primitive Types

**What**: The primitive types are the basic data types that are used to store data.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is primitive.

**When**: Use the primitive types when allocating memory in a primitive fashion.

**How**: The primitive types are implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the size and alignment of primitive types:

- **`bool`**: A boolean value (1 byte)
- **`i8`**: An 8-bit integer (1 byte)
- **`i32`**: A 32-bit integer (4 bytes)
- **`i64`**: A 64-bit integer (8 bytes)
- **`f32`**: A 32-bit floating-point number (4 bytes)
- **`f64`**: A 64-bit floating-point number (8 bytes)
- **`char`**: A Unicode character (4 bytes)

**Why this matters**: Understanding primitive types helps optimize memory usage and access patterns.

### Struct Layout

**What**: The struct layout is the layout of a struct.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is struct.

**When**: Use the struct layout when allocating memory in a struct fashion.

**How**: The struct layout is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the layout of a struct:

- **`Person`**: A struct with three fields: `name`, `age`, and `active`
- **`Person size`**: The total size of the struct (24 bytes)
- **`Person alignment`**: The alignment of the struct (8 bytes)

**Why this matters**: Understanding struct layout helps optimize memory usage and access patterns.

### Enum Layout

**What**: The enum layout is the layout of an enum.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is enum.

**When**: Use the enum layout when allocating memory in a enum fashion.

**How**: The enum layout is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the layout of an enum:

- **`Message`**: An enum with four variants: `Quit`, `Move`, `Write`, and `ChangeColor`
- **`Message size`**: The total size of the enum (24 bytes)
- **`Message alignment`**: The alignment of the enum (8 bytes)

**Why this matters**: Understanding enum layout helps optimize memory usage and access patterns.

## Memory Alignment

### Alignment Basics

**What**: The alignment basics are the basics of alignment.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is alignment basics.

**When**: Use the alignment basics when allocating memory in a alignment basics fashion.

**How**: The alignment basics is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the alignment of a struct:

- **`AlignedStruct`**: A struct with four fields: `a`, `b`, `c`, and `d`
- **`AlignedStruct size`**: The total size of the struct (8 bytes)
- **`AlignedStruct alignment`**: The alignment of the struct (4 bytes)

**Why this matters**: Understanding alignment helps optimize memory access patterns and reduce cache misses.

### Packed Structs

**What**: The packed structs are the structs that are packed.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is packed.

**When**: Use the packed structs when allocating memory in a packed fashion.

**How**: The packed structs is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the layout of a packed struct:

- **`PackedStruct`**: A struct with three fields: `a`, `b`, and `c`
- **`PackedStruct size`**: The total size of the struct (8 bytes)
- **`PackedStruct alignment`**: The alignment of the struct (1 byte)

**Why this matters**: Understanding packed structs helps optimize memory usage and access patterns.

## Memory Mapping

### Virtual Memory Concepts

**What**: The memory mapping is the mapping of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is memory mapping.

**When**: Use the memory mapping when allocating memory in a memory mapping fashion.

**How**: The memory mapping is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the virtual memory layout:

- **`stack_var`**: A stack variable
- **`heap_var`**: A heap variable
- **`static_var`**: A static variable

**Why this matters**: Understanding virtual memory layout helps optimize memory access patterns and reduce cache misses.

### Memory Pages

**What**: The memory pages are the pages of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is memory pages.

**When**: Use the memory pages when allocating memory in a memory pages fashion.

**How**: The memory pages is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the alignment of a memory page:

- **`page_size`**: The size of the memory page (4096 bytes)
- **`layout`**: The layout of the memory page
- **`alloc(layout)`**: Allocates memory with the specified layout
- **`dealloc(ptr, layout)`**: Frees memory that was allocated with the same layout

**Why this matters**: Understanding memory page alignment helps optimize memory access patterns and reduce cache misses.

## Advanced Memory Layout

### Custom Memory Layout

**What**: The custom memory layout is the layout of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is custom memory layout.

**When**: Use the custom memory layout when allocating memory in a custom memory layout fashion.

**How**: The custom memory layout is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a custom memory allocator:

- **`CustomAllocator`**: A custom memory allocator
- **`new(size)`**: Creates a new memory allocator with the specified size
- **`allocate(size, align)`**: Allocates memory with the specified size and alignment
- **`dealloc(ptr, size)`**: Frees memory that was previously allocated with the same size

**Why this works**: By implementing `GlobalAlloc`, we can intercept all memory allocations in the program. This is useful for debugging, profiling, or implementing specialized allocation strategies.

### Memory Pool

**What**: The memory pool is the pool of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is memory pool.

**When**: Use the memory pool when allocating memory in a memory pool fashion.

**How**: The memory pool is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a memory pool:

- **`MemoryPool`**: A memory pool
- **`new(capacity, factory)`**: Creates a new memory pool with the specified capacity and factory
- **`acquire()`**: Acquires an object from the pool
- **`release(obj)`**: Releases an object back to the pool

**Why this works**: Memory pools help reduce allocation overhead for frequently allocated objects.

## Performance Considerations

### Cache-Friendly Layout

**What**: The cache-friendly layout is the layout of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is cache-friendly layout.

**When**: Use the cache-friendly layout when allocating memory in a cache-friendly layout fashion.

**How**: The cache-friendly layout is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the cache-friendly and cache-unfriendly layout:

- **`CacheFriendly`**: A cache-friendly struct
- **`CacheUnfriendly`**: A cache-unfriendly struct
- **`CacheFriendly size`**: The total size of the struct (40 bytes)
- **`CacheUnfriendly size`**: The total size of the struct (40 bytes)

**Why this matters**: Understanding cache-friendly and cache-unfriendly layout helps optimize memory usage and access patterns.

### Memory Access Patterns

**What**: The memory access patterns are the patterns of the memory.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is memory access patterns.

**When**: Use the memory access patterns when allocating memory in a memory access patterns fashion.

**How**: The memory access patterns is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates the memory access patterns:

- **`vec`**: A vector with 1000 elements
- **`sum`**: The sum of the vector elements
- **`random_sum`**: The sum of the vector elements with random access

**Why this matters**: Understanding memory access patterns helps optimize memory usage and access patterns.

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
