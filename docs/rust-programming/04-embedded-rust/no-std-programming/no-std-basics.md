---
sidebar_position: 1
---

# no_std Basics

Master bare-metal programming in Rust with comprehensive explanations using the 4W+H framework.

## What Is no_std Programming?

**What**: `no_std` programming in Rust means writing code that doesn't use the standard library (`std`), instead relying only on the core library (`core`) and optionally the alloc crate for heap allocation.

**Why**: Understanding `no_std` programming is crucial because:

- **Embedded systems** often have limited resources and can't support the full standard library
- **Bare metal programming** requires direct hardware access without OS abstractions
- **Performance** enables zero-cost abstractions and predictable execution
- **Memory constraints** allow programming on systems with very limited RAM
- **Real-time systems** require deterministic behavior without dynamic allocation
- **Bootloaders and kernels** need to run before any operating system is available

**When**: Use `no_std` programming when you need to:

- Write firmware for microcontrollers and embedded systems
- Create bootloaders, kernels, or operating system components
- Build real-time systems with strict timing requirements
- Develop code for resource-constrained environments
- Write drivers and low-level system software
- Create portable code that works across different platforms

**How**: `no_std` programming works by:

- **Excluding std** using `#![no_std]` attribute
- **Using core library** for fundamental types and traits
- **Optional alloc** for heap allocation when available
- **Custom panic handlers** for error handling
- **Direct hardware access** through memory-mapped I/O
- **Manual memory management** without garbage collection

**Where**: `no_std` programming is used in embedded systems, microcontrollers, real-time systems, bootloaders, kernels, and any environment where the standard library is unavailable or inappropriate.

## Understanding Core vs Standard Library

### Core Library Fundamentals

**What**: The `core` library provides fundamental types, traits, and operations without requiring an operating system or heap allocation.

**Why**: Understanding the core library is important because:

- **Foundation** provides essential types and traits for all Rust code
- **No dependencies** works without any external libraries
- **Zero-cost** abstractions with no runtime overhead
- **Portability** enables code to run on any platform
- **Embedded-friendly** designed for resource-constrained environments

**When**: Use the core library when you need fundamental Rust functionality without standard library features.

**How**: Here's how to use the core library:

```rust
#![no_std]

use core::fmt;
use core::option::Option;
use core::result::Result;

// Basic types from core
fn demonstrate_core_types() {
    // Primitive types
    let number: i32 = 42;
    let boolean: bool = true;
    let character: char = 'A';

    // Option and Result from core
    let some_value: Option<i32> = Some(42);
    let none_value: Option<i32> = None;

    let ok_result: Result<i32, &str> = Ok(42);
    let err_result: Result<i32, &str> = Err("Error occurred");

    // Pattern matching with core types
    match some_value {
        Some(value) => {
            // Handle the value
        }
        None => {
            // Handle the absence
        }
    }
}

// Custom implementation using core traits
struct SimpleStruct {
    value: i32,
}

impl fmt::Display for SimpleStruct {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "SimpleStruct({})", self.value)
    }
}

impl fmt::Debug for SimpleStruct {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "SimpleStruct {{ value: {} }}", self.value)
    }
}

fn main() {
    let simple = SimpleStruct { value: 42 };
    // Note: println! is not available in no_std
    // You would need custom output methods
}
```

**Explanation**:

- `#![no_std]` attribute excludes the standard library
- `use core::fmt` imports formatting traits from core
- `Option` and `Result` are available from core for error handling
- Custom implementations of `Display` and `Debug` traits
- No `println!` macro available - need custom output methods

**Why**: The core library provides essential functionality without requiring an operating system or heap allocation.

### Standard Library Limitations

**What**: The standard library provides many features that aren't available in `no_std` environments.

**Why**: Understanding these limitations is important because:

- **Dependencies** many std features require an operating system
- **Allocation** many std types require heap allocation
- **Threading** std threading requires OS support
- **I/O operations** file and network I/O need OS abstractions
- **Collections** dynamic collections require heap allocation

**When**: You need to avoid std features when programming for embedded systems or bare metal.

**How**: Here's what's not available in `no_std`:

```rust
#![no_std]

// These are NOT available in no_std:
// use std::collections::HashMap;  // Requires heap allocation
// use std::thread;               // Requires OS threading
// use std::fs::File;             // Requires file system
// use std::net::TcpStream;      // Requires networking
// use std::io::stdout;           // Requires standard I/O

// Instead, use core alternatives:
use core::option::Option;
use core::result::Result;
use core::fmt;

// Custom collections without heap allocation
struct FixedArray<T, const N: usize> {
    data: [Option<T>; N],
    len: usize,
}

impl<T, const N: usize> FixedArray<T, N> {
    fn new() -> Self {
        Self {
            data: [(); N].map(|_| None),
            len: 0,
        }
    }

    fn push(&mut self, item: T) -> Result<(), &'static str> {
        if self.len >= N {
            return Err("Array is full");
        }

        self.data[self.len] = Some(item);
        self.len += 1;
        Ok(())
    }

    fn get(&self, index: usize) -> Option<&T> {
        if index < self.len {
            self.data[index].as_ref()
        } else {
            None
        }
    }
}

// Custom string without heap allocation
struct FixedString<const N: usize> {
    data: [u8; N],
    len: usize,
}

impl<const N: usize> FixedString<N> {
    fn new() -> Self {
        Self {
            data: [0; N],
            len: 0,
        }
    }

    fn push_str(&mut self, s: &str) -> Result<(), &'static str> {
        let bytes = s.as_bytes();
        if self.len + bytes.len() > N {
            return Err("String would exceed capacity");
        }

        for (i, &byte) in bytes.iter().enumerate() {
            self.data[self.len + i] = byte;
        }
        self.len += bytes.len();
        Ok(())
    }

    fn as_str(&self) -> &str {
        unsafe {
            core::str::from_utf8_unchecked(&self.data[..self.len])
        }
    }
}

fn main() {
    // Use fixed-size collections instead of dynamic ones
    let mut array: FixedArray<i32, 10> = FixedArray::new();
    let _ = array.push(42);
    let _ = array.push(100);

    let mut string: FixedString<50> = FixedString::new();
    let _ = string.push_str("Hello, no_std!");
}
```

**Explanation**:

- Standard library collections like `HashMap` and `Vec` are not available
- Threading, file I/O, and networking require OS support
- Custom fixed-size collections replace dynamic collections
- Fixed-size strings replace `String` type
- All memory is allocated at compile time

**Why**: Understanding std limitations helps you design appropriate alternatives for embedded systems.

## Understanding Allocators and Heap Allocation

### Custom Allocators

**What**: Custom allocators allow you to control how memory is allocated and deallocated in `no_std` environments.

**Why**: Understanding custom allocators is important because:

- **Memory control** enables precise control over memory usage
- **Performance** allows optimization for specific use cases
- **Embedded systems** often have specific memory requirements
- **Real-time systems** need predictable allocation behavior
- **Resource constraints** require efficient memory management

**When**: Use custom allocators when you need specific memory allocation behavior or when the default allocator is inappropriate.

**How**: Here's how to implement a custom allocator:

```rust
#![no_std]
#![feature(alloc_error_handler)]

extern crate alloc;

use alloc::alloc::{GlobalAlloc, Layout};
use core::ptr::null_mut;

// Simple bump allocator
struct BumpAllocator {
    heap_start: usize,
    heap_end: usize,
    next: usize,
}

impl BumpAllocator {
    const fn new(heap_start: usize, heap_end: usize) -> Self {
        Self {
            heap_start,
            heap_end,
            next: heap_start,
        }
    }
}

unsafe impl GlobalAlloc for BumpAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let start = self.next;
        let end = start + layout.size();

        // Check if we have enough space
        if end > self.heap_end {
            return null_mut();
        }

        // Align the pointer
        let aligned_start = (start + layout.align() - 1) & !(layout.align() - 1);
        let aligned_end = aligned_start + layout.size();

        if aligned_end > self.heap_end {
            return null_mut();
        }

        // Update next pointer
        core::ptr::write_volatile(&self.next as *const usize as *mut usize, aligned_end);

        aligned_start as *mut u8
    }

    unsafe fn dealloc(&self, _ptr: *mut u8, _layout: Layout) {
        // Bump allocator doesn't support deallocation
        // Memory is freed when the allocator is reset
    }
}

// Global allocator instance
#[global_allocator]
static ALLOCATOR: BumpAllocator = BumpAllocator::new(0x2000_0000, 0x2000_1000);

// Custom allocator with free list
struct FreeListAllocator {
    heap_start: usize,
    heap_end: usize,
    free_list: *mut FreeNode,
}

struct FreeNode {
    size: usize,
    next: *mut FreeNode,
}

impl FreeListAllocator {
    const fn new(heap_start: usize, heap_end: usize) -> Self {
        Self {
            heap_start,
            heap_end,
            free_list: null_mut(),
        }
    }

    unsafe fn init(&mut self) {
        // Initialize the free list with the entire heap
        let node = self.heap_start as *mut FreeNode;
        (*node).size = self.heap_end - self.heap_start;
        (*node).next = null_mut();
        self.free_list = node;
    }
}

unsafe impl GlobalAlloc for FreeListAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let mut current = self.free_list;

        while !current.is_null() {
            let node = &*current;
            if node.size >= layout.size() {
                // Found a suitable block
                let ptr = current as *mut u8;

                // Split the block if it's much larger than needed
                if node.size > layout.size() + core::mem::size_of::<FreeNode>() {
                    let new_size = node.size - layout.size();
                    let new_node = current.add(layout.size()) as *mut FreeNode;
                    (*new_node).size = new_size;
                    (*new_node).next = (*current).next;

                    // Update current node
                    (*current).size = layout.size();
                    (*current).next = new_node;
                }

                return ptr;
            }
            current = node.next;
        }

        null_mut() // No suitable block found
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // Add the block back to the free list
        let node = ptr as *mut FreeNode;
        (*node).size = layout.size();
        (*node).next = self.free_list;

        // Update the free list head
        core::ptr::write_volatile(&self.free_list as *const *mut FreeNode as *mut *mut FreeNode, node);
    }
}

fn main() {
    // Initialize the free list allocator
    unsafe {
        let mut allocator = FreeListAllocator::new(0x2000_0000, 0x2000_1000);
        allocator.init();
    }

    // Now you can use standard collections with custom allocator
    // let vec: Vec<i32> = Vec::new(); // This would use the custom allocator
}
```

**Explanation**:

- `BumpAllocator` is a simple allocator that just moves a pointer forward
- `FreeListAllocator` maintains a linked list of free memory blocks
- Custom allocators implement the `GlobalAlloc` trait
- Memory alignment is handled properly for different data types
- Deallocation strategies vary between allocator types

**Why**: Custom allocators provide precise control over memory allocation behavior in embedded systems.

### Heapless Data Structures

**What**: Heapless data structures are collections that don't require heap allocation and have fixed maximum sizes.

**Why**: Understanding heapless data structures is important because:

- **No allocation** eliminates the need for heap allocation
- **Predictable memory** usage is known at compile time
- **Real-time systems** avoid allocation delays
- **Embedded systems** work within strict memory constraints
- **Performance** eliminates allocation overhead

**When**: Use heapless data structures when you need collections without heap allocation.

**How**: Here's how to implement heapless data structures:

```rust
#![no_std]

use core::fmt;

// Heapless vector with fixed capacity
pub struct HeaplessVec<T, const N: usize> {
    data: [Option<T>; N],
    len: usize,
}

impl<T, const N: usize> HeaplessVec<T, N> {
    pub const fn new() -> Self {
        Self {
            data: [(); N].map(|_| None),
            len: 0,
        }
    }

    pub fn push(&mut self, item: T) -> Result<(), &'static str> {
        if self.len >= N {
            return Err("Vector is full");
        }

        self.data[self.len] = Some(item);
        self.len += 1;
        Ok(())
    }

    pub fn pop(&mut self) -> Option<T> {
        if self.len == 0 {
            return None;
        }

        self.len -= 1;
        self.data[self.len].take()
    }

    pub fn get(&self, index: usize) -> Option<&T> {
        if index < self.len {
            self.data[index].as_ref()
        } else {
            None
        }
    }

    pub fn get_mut(&mut self, index: usize) -> Option<&mut T> {
        if index < self.len {
            self.data[index].as_mut()
        } else {
            None
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn is_full(&self) -> bool {
        self.len >= N
    }

    pub fn capacity(&self) -> usize {
        N
    }

    pub fn clear(&mut self) {
        for i in 0..self.len {
            self.data[i] = None;
        }
        self.len = 0;
    }
}

// Heapless string with fixed capacity
pub struct HeaplessString<const N: usize> {
    data: [u8; N],
    len: usize,
}

impl<const N: usize> HeaplessString<N> {
    pub const fn new() -> Self {
        Self {
            data: [0; N],
            len: 0,
        }
    }

    pub fn push_str(&mut self, s: &str) -> Result<(), &'static str> {
        let bytes = s.as_bytes();
        if self.len + bytes.len() > N {
            return Err("String would exceed capacity");
        }

        for (i, &byte) in bytes.iter().enumerate() {
            self.data[self.len + i] = byte;
        }
        self.len += bytes.len();
        Ok(())
    }

    pub fn push(&mut self, ch: char) -> Result<(), &'static str> {
        let mut buf = [0; 4];
        let bytes = ch.encode_utf8(&mut buf).as_bytes();

        if self.len + bytes.len() > N {
            return Err("Character would exceed capacity");
        }

        for (i, &byte) in bytes.iter().enumerate() {
            self.data[self.len + i] = byte;
        }
        self.len += bytes.len();
        Ok(())
    }

    pub fn as_str(&self) -> &str {
        unsafe {
            core::str::from_utf8_unchecked(&self.data[..self.len])
        }
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn is_full(&self) -> bool {
        self.len >= N
    }

    pub fn capacity(&self) -> usize {
        N
    }

    pub fn clear(&mut self) {
        self.data = [0; N];
        self.len = 0;
    }
}

// Heapless hash map with fixed capacity
pub struct HeaplessHashMap<K, V, const N: usize>
where
    K: PartialEq + Copy,
    V: Copy,
{
    data: [Option<(K, V)>; N],
    len: usize,
}

impl<K, V, const N: usize> HeaplessHashMap<K, V, N>
where
    K: PartialEq + Copy,
    V: Copy,
{
    pub const fn new() -> Self {
        Self {
            data: [(); N].map(|_| None),
            len: 0,
        }
    }

    pub fn insert(&mut self, key: K, value: V) -> Result<(), &'static str> {
        // Check if key already exists
        for i in 0..self.len {
            if let Some((k, _)) = self.data[i] {
                if k == key {
                    self.data[i] = Some((key, value));
                    return Ok(());
                }
            }
        }

        // Insert new key-value pair
        if self.len >= N {
            return Err("HashMap is full");
        }

        self.data[self.len] = Some((key, value));
        self.len += 1;
        Ok(())
    }

    pub fn get(&self, key: &K) -> Option<&V> {
        for i in 0..self.len {
            if let Some((k, v)) = self.data[i] {
                if k == *key {
                    return Some(v);
                }
            }
        }
        None
    }

    pub fn remove(&mut self, key: &K) -> Option<V> {
        for i in 0..self.len {
            if let Some((k, v)) = self.data[i] {
                if k == *key {
                    // Move last element to this position
                    self.data[i] = self.data[self.len - 1];
                    self.data[self.len - 1] = None;
                    self.len -= 1;
                    return Some(v);
                }
            }
        }
        None
    }

    pub fn len(&self) -> usize {
        self.len
    }

    pub fn is_empty(&self) -> bool {
        self.len == 0
    }

    pub fn is_full(&self) -> bool {
        self.len >= N
    }

    pub fn capacity(&self) -> usize {
        N
    }

    pub fn clear(&mut self) {
        for i in 0..self.len {
            self.data[i] = None;
        }
        self.len = 0;
    }
}

fn main() {
    // Heapless vector
    let mut vec: HeaplessVec<i32, 10> = HeaplessVec::new();
    let _ = vec.push(42);
    let _ = vec.push(100);
    let _ = vec.push(200);

    // Heapless string
    let mut string: HeaplessString<50> = HeaplessString::new();
    let _ = string.push_str("Hello, ");
    let _ = string.push('W');
    let _ = string.push_str("orld!");

    // Heapless hash map
    let mut map: HeaplessHashMap<&str, i32, 5> = HeaplessHashMap::new();
    let _ = map.insert("key1", 42);
    let _ = map.insert("key2", 100);

    if let Some(value) = map.get(&"key1") {
        // Use the value
    }
}
```

**Explanation**:

- `HeaplessVec<T, N>` is a vector with fixed capacity `N`
- `HeaplessString<N>` is a string with fixed capacity `N`
- `HeaplessHashMap<K, V, N>` is a hash map with fixed capacity `N`
- All operations return `Result` or `Option` to handle capacity limits
- Memory usage is known at compile time
- No heap allocation is required

**Why**: Heapless data structures provide collections without heap allocation, making them suitable for embedded systems.

## Understanding Memory Management

### Stack vs Heap in no_std

**What**: In `no_std` environments, you have more control over memory management, with emphasis on stack allocation and optional heap allocation.

**Why**: Understanding memory management in `no_std` is important because:

- **Resource constraints** embedded systems have limited memory
- **Performance** stack allocation is faster than heap allocation
- **Predictability** stack allocation has deterministic behavior
- **Real-time systems** need predictable memory usage
- **Embedded systems** often avoid heap allocation entirely

**When**: Use stack allocation for most data and heap allocation only when necessary.

**How**: Here's how to manage memory in `no_std`:

```rust
#![no_std]

// Stack-allocated data structures
struct StackData {
    buffer: [u8; 1024],
    counter: u32,
    flags: u8,
}

impl StackData {
    fn new() -> Self {
        Self {
            buffer: [0; 1024],
            counter: 0,
            flags: 0,
        }
    }

    fn process(&mut self, data: &[u8]) -> Result<(), &'static str> {
        if data.len() > self.buffer.len() {
            return Err("Data too large for buffer");
        }

        // Copy data to stack buffer
        for (i, &byte) in data.iter().enumerate() {
            self.buffer[i] = byte;
        }

        self.counter += 1;
        self.flags |= 0x01; // Set processed flag

        Ok(())
    }
}

// Memory pool for fixed-size allocations
struct MemoryPool<const N: usize> {
    memory: [u8; N],
    free_blocks: [bool; N],
    block_size: usize,
}

impl<const N: usize> MemoryPool<N> {
    fn new(block_size: usize) -> Self {
        Self {
            memory: [0; N],
            free_blocks: [true; N],
            block_size,
        }
    }

    fn allocate(&mut self) -> Option<&mut [u8]> {
        for i in 0..N {
            if self.free_blocks[i] {
                self.free_blocks[i] = false;
                let start = i * self.block_size;
                let end = start + self.block_size;
                return Some(&mut self.memory[start..end]);
            }
        }
        None
    }

    fn deallocate(&mut self, ptr: *mut u8) -> Result<(), &'static str> {
        let start = self.memory.as_mut_ptr();
        let end = unsafe { start.add(N) };

        if ptr < start || ptr >= end {
            return Err("Pointer not in pool");
        }

        let offset = unsafe { ptr.offset_from(start) } as usize;
        let block_index = offset / self.block_size;

        if block_index >= N {
            return Err("Invalid block index");
        }

        self.free_blocks[block_index] = true;
        Ok(())
    }
}

// Static memory allocation
static mut GLOBAL_BUFFER: [u8; 4096] = [0; 4096];
static mut GLOBAL_COUNTER: u32 = 0;

fn get_global_buffer() -> &'static mut [u8] {
    unsafe { &mut GLOBAL_BUFFER }
}

fn increment_global_counter() -> u32 {
    unsafe {
        GLOBAL_COUNTER += 1;
        GLOBAL_COUNTER
    }
}

// Memory-mapped I/O simulation
struct MemoryMappedIO {
    base_address: usize,
}

impl MemoryMappedIO {
    fn new(base_address: usize) -> Self {
        Self { base_address }
    }

    unsafe fn read_register(&self, offset: usize) -> u32 {
        let ptr = (self.base_address + offset) as *const u32;
        core::ptr::read_volatile(ptr)
    }

    unsafe fn write_register(&self, offset: usize, value: u32) {
        let ptr = (self.base_address + offset) as *mut u32;
        core::ptr::write_volatile(ptr, value);
    }
}

fn main() {
    // Stack allocation
    let mut stack_data = StackData::new();
    let test_data = b"Hello, no_std!";
    let _ = stack_data.process(test_data);

    // Memory pool
    let mut pool: MemoryPool<100> = MemoryPool::new(64);
    if let Some(buffer) = pool.allocate() {
        // Use the buffer
        buffer[0] = 42;
        // Deallocate when done
        let _ = pool.deallocate(buffer.as_mut_ptr());
    }

    // Static memory
    let global_buf = get_global_buffer();
    global_buf[0] = 100;

    let counter = increment_global_counter();

    // Memory-mapped I/O
    let io = MemoryMappedIO::new(0x4000_0000);
    unsafe {
        let value = io.read_register(0x00);
        io.write_register(0x04, value + 1);
    }
}
```

**Explanation**:

- Stack allocation is preferred for most data structures
- Memory pools provide fixed-size allocation without heap
- Static memory allocation uses global variables
- Memory-mapped I/O provides direct hardware access
- All memory management is explicit and predictable

**Why**: Proper memory management in `no_std` environments ensures predictable behavior and efficient resource usage.

## Key Takeaways

**What** you've learned about `no_std` programming:

1. **Core library** provides fundamental types and traits without std dependencies
2. **Custom allocators** enable controlled memory allocation in embedded systems
3. **Heapless data structures** provide collections without heap allocation
4. **Memory management** requires explicit control over stack and heap usage
5. **Embedded systems** benefit from predictable memory usage and performance
6. **Real-time systems** require deterministic behavior without allocation delays

**Why** these concepts matter:

- **Resource constraints** embedded systems have limited memory and processing power
- **Performance** stack allocation and heapless structures provide better performance
- **Predictability** deterministic memory usage is essential for real-time systems
- **Reliability** avoiding heap allocation reduces the risk of memory-related failures

## Next Steps

Now that you understand `no_std` basics, you're ready to learn about:

- **Panic handling** - Custom panic handlers for embedded systems
- **Hardware abstraction** - Creating abstractions for hardware peripherals
- **Interrupts and timers** - Handling asynchronous events and timing
- **Communication protocols** - Implementing UART, I2C, and SPI communication

**Where** to go next: Continue with the next lesson on "Panic Handling" to learn about error handling in `no_std` environments!
