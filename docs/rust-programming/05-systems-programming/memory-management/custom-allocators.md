---
sidebar_position: 2
---

# Custom Allocators

Master custom memory allocators in systems programming with comprehensive explanations using the 4W+H framework.

## What Are Custom Allocators?

**What**: Custom allocators are user-defined memory management systems that replace or supplement the default heap allocator, providing specialized memory allocation strategies for specific use cases.

**Why**: Custom allocators are essential because:

- **Performance Optimization**: Tailored allocation strategies can be significantly faster than general-purpose allocators
- **Memory Efficiency**: Reduce fragmentation and improve memory utilization
- **Predictable Performance**: Eliminate allocation latency spikes in real-time systems
- **Specialized Use Cases**: Support for embedded systems, game engines, and high-performance applications
- **Resource Control**: Fine-grained control over memory usage and lifetime

**When**: Use custom allocators when:

- Building performance-critical applications
- Working with embedded systems with limited memory
- Implementing real-time systems with strict timing requirements
- Creating game engines or graphics applications
- Managing large numbers of small, short-lived objects
- Implementing specialized data structures

**Where**: Custom allocators are used in:

- Operating system kernels and drivers
- Embedded systems and microcontrollers
- Game engines and graphics programming
- Database systems and file systems
- Network servers and high-performance computing
- Real-time systems and control systems

**How**: Custom allocators are implemented through:

- Implementing the `GlobalAlloc` trait
- Creating specialized allocation strategies
- Managing memory pools and arenas
- Handling alignment and fragmentation
- Integrating with Rust's ownership system

## Basic Allocator Interface

### The GlobalAlloc Trait

```rust
use std::alloc::{GlobalAlloc, Layout, System};
use std::ptr;

struct SimpleAllocator;

unsafe impl GlobalAlloc for SimpleAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        // Delegate to system allocator for now
        System.alloc(layout)
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        System.dealloc(ptr, layout);
    }
}

// Set as global allocator
#[global_allocator]
static GLOBAL: SimpleAllocator = SimpleAllocator;

fn basic_allocator_example() {
    // This will use our custom allocator
    let vec = vec![1, 2, 3, 4, 5];
    println!("Allocated vector: {:?}", vec);
}
```

### Layout and Alignment

```rust
use std::alloc::{alloc, dealloc, Layout};

fn layout_example() {
    // Create layout for 100 i32s
    let layout = Layout::new::<[i32; 100]>();
    println!("Layout size: {}", layout.size());
    println!("Layout alignment: {}", layout.align());

    unsafe {
        let ptr = alloc(layout) as *mut [i32; 100];
        if !ptr.is_null() {
            // Initialize the array
            for i in 0..100 {
                ptr::write(&mut (*ptr)[i], i as i32);
            }

            // Use the array
            println!("First element: {}", (*ptr)[0]);
            println!("Last element: {}", (*ptr)[99]);

            dealloc(ptr as *mut u8, layout);
        }
    }
}
```

## Memory Pool Allocator

### Basic Memory Pool

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;
use std::sync::Mutex;

struct MemoryPool {
    memory: *mut u8,
    size: usize,
    block_size: usize,
    free_blocks: Mutex<Vec<*mut u8>>,
    layout: Layout,
}

impl MemoryPool {
    fn new(block_size: usize, num_blocks: usize) -> Self {
        let total_size = block_size * num_blocks;
        let layout = Layout::from_size_align(total_size, block_size).unwrap();

        let memory = unsafe { alloc(layout) };
        if memory.is_null() {
            panic!("Failed to allocate memory pool");
        }

        // Initialize free blocks
        let mut free_blocks = Vec::new();
        for i in 0..num_blocks {
            let block = unsafe { memory.add(i * block_size) };
            free_blocks.push(block);
        }

        Self {
            memory,
            size: total_size,
            block_size,
            free_blocks: Mutex::new(free_blocks),
            layout,
        }
    }

    fn allocate(&self) -> Option<*mut u8> {
        self.free_blocks.lock().unwrap().pop()
    }

    fn deallocate(&self, ptr: *mut u8) {
        // Verify the pointer is within our pool
        if ptr >= self.memory && ptr < unsafe { self.memory.add(self.size) } {
            self.free_blocks.lock().unwrap().push(ptr);
        }
    }
}

impl Drop for MemoryPool {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn memory_pool_example() {
    let pool = MemoryPool::new(64, 10); // 64-byte blocks, 10 blocks

    // Allocate some blocks
    let blocks: Vec<*mut u8> = (0..5).filter_map(|_| pool.allocate()).collect();

    println!("Allocated {} blocks", blocks.len());

    // Use the blocks
    for (i, block) in blocks.iter().enumerate() {
        unsafe {
            ptr::write(*block as *mut i32, i as i32);
            println!("Block {}: {}", i, ptr::read(*block as *mut i32));
        }
    }

    // Deallocate blocks
    for block in blocks {
        pool.deallocate(block);
    }
}
```

### Thread-Safe Memory Pool

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;
use std::sync::{Mutex, Arc};
use std::thread;

struct ThreadSafePool {
    memory: *mut u8,
    size: usize,
    block_size: usize,
    free_blocks: Mutex<Vec<*mut u8>>,
    layout: Layout,
}

impl ThreadSafePool {
    fn new(block_size: usize, num_blocks: usize) -> Self {
        let total_size = block_size * num_blocks;
        let layout = Layout::from_size_align(total_size, block_size).unwrap();

        let memory = unsafe { alloc(layout) };
        if memory.is_null() {
            panic!("Failed to allocate memory pool");
        }

        let mut free_blocks = Vec::new();
        for i in 0..num_blocks {
            let block = unsafe { memory.add(i * block_size) };
            free_blocks.push(block);
        }

        Self {
            memory,
            size: total_size,
            block_size,
            free_blocks: Mutex::new(free_blocks),
            layout,
        }
    }

    fn allocate(&self) -> Option<*mut u8> {
        self.free_blocks.lock().unwrap().pop()
    }

    fn deallocate(&self, ptr: *mut u8) {
        if ptr >= self.memory && ptr < unsafe { self.memory.add(self.size) } {
            self.free_blocks.lock().unwrap().push(ptr);
        }
    }
}

impl Drop for ThreadSafePool {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn thread_safe_pool_example() {
    let pool = Arc::new(ThreadSafePool::new(64, 20));
    let mut handles = vec![];

    // Spawn multiple threads using the pool
    for thread_id in 0..5 {
        let pool = Arc::clone(&pool);
        let handle = thread::spawn(move || {
            let mut blocks = Vec::new();

            // Allocate some blocks
            for _ in 0..3 {
                if let Some(block) = pool.allocate() {
                    unsafe {
                        ptr::write(block as *mut i32, thread_id);
                    }
                    blocks.push(block);
                }
            }

            // Use the blocks
            for (i, block) in blocks.iter().enumerate() {
                unsafe {
                    let value = ptr::read(*block as *mut i32);
                    println!("Thread {}: Block {} = {}", thread_id, i, value);
                }
            }

            // Deallocate blocks
            for block in blocks {
                pool.deallocate(block);
            }
        });

        handles.push(handle);
    }

    // Wait for all threads
    for handle in handles {
        handle.join().unwrap();
    }
}
```

## Arena Allocator

### Linear Arena

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct Arena {
    memory: *mut u8,
    size: usize,
    offset: usize,
    layout: Layout,
}

impl Arena {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate arena");
        }

        Self {
            memory,
            size,
            offset: 0,
            layout,
        }
    }

    fn allocate<T>(&mut self, value: T) -> Option<&mut T> {
        let size = std::mem::size_of::<T>();
        let align = std::mem::align_of::<T>();

        // Align the offset
        let aligned_offset = (self.offset + align - 1) & !(align - 1);

        if aligned_offset + size <= self.size {
            let ptr = unsafe { self.memory.add(aligned_offset) as *mut T };
            unsafe {
                ptr::write(ptr, value);
                self.offset = aligned_offset + size;
                Some(&mut *ptr)
            }
        } else {
            None
        }
    }

    fn reset(&mut self) {
        self.offset = 0;
    }
}

impl Drop for Arena {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn arena_example() {
    let mut arena = Arena::new(1024);

    // Allocate some values
    if let Some(x) = arena.allocate(42i32) {
        println!("Allocated i32: {}", x);
    }

    if let Some(s) = arena.allocate("Hello".to_string()) {
        println!("Allocated String: {}", s);
    }

    if let Some(v) = arena.allocate(vec![1, 2, 3]) {
        println!("Allocated Vec: {:?}", v);
    }

    // Reset the arena
    arena.reset();
    println!("Arena reset");
}
```

### Bump Allocator

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;
use std::sync::atomic::{AtomicUsize, Ordering};

struct BumpAllocator {
    memory: *mut u8,
    size: usize,
    offset: AtomicUsize,
    layout: Layout,
}

impl BumpAllocator {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate bump allocator");
        }

        Self {
            memory,
            size,
            offset: AtomicUsize::new(0),
            layout,
        }
    }

    fn allocate<T>(&self, value: T) -> Option<&mut T> {
        let size = std::mem::size_of::<T>();
        let align = std::mem::align_of::<T>();

        // Atomic bump allocation
        let mut current = self.offset.load(Ordering::Relaxed);
        loop {
            let aligned_offset = (current + align - 1) & !(align - 1);

            if aligned_offset + size > self.size {
                return None;
            }

            match self.offset.compare_exchange_weak(
                current,
                aligned_offset + size,
                Ordering::Acquire,
                Ordering::Relaxed,
            ) {
                Ok(_) => {
                    let ptr = unsafe { self.memory.add(aligned_offset) as *mut T };
                    unsafe {
                        ptr::write(ptr, value);
                        return Some(&mut *ptr);
                    }
                }
                Err(new_current) => current = new_current,
            }
        }
    }
}

impl Drop for BumpAllocator {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn bump_allocator_example() {
    let allocator = BumpAllocator::new(1024);

    // Allocate some values
    if let Some(x) = allocator.allocate(42i32) {
        println!("Bump allocated i32: {}", x);
    }

    if let Some(s) = allocator.allocate("World".to_string()) {
        println!("Bump allocated String: {}", s);
    }
}
```

## Specialized Allocators

### Stack Allocator

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct StackAllocator {
    memory: *mut u8,
    size: usize,
    stack_pointer: usize,
    layout: Layout,
}

impl StackAllocator {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate stack allocator");
        }

        Self {
            memory,
            size,
            stack_pointer: 0,
            layout,
        }
    }

    fn push<T>(&mut self, value: T) -> Option<&mut T> {
        let size = std::mem::size_of::<T>();
        let align = std::mem::align_of::<T>();

        // Align stack pointer
        let aligned_sp = (self.stack_pointer + align - 1) & !(align - 1);

        if aligned_sp + size <= self.size {
            let ptr = unsafe { self.memory.add(aligned_sp) as *mut T };
            unsafe {
                ptr::write(ptr, value);
                self.stack_pointer = aligned_sp + size;
                Some(&mut *ptr)
            }
        } else {
            None
        }
    }

    fn pop<T>(&mut self) -> Option<T> {
        let size = std::mem::size_of::<T>();
        let align = std::mem::align_of::<T>();

        if self.stack_pointer >= size {
            self.stack_pointer -= size;
            let aligned_sp = (self.stack_pointer + align - 1) & !(align - 1);
            let ptr = unsafe { self.memory.add(aligned_sp) as *mut T };
            unsafe { Some(ptr::read(ptr)) }
        } else {
            None
        }
    }
}

impl Drop for StackAllocator {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn stack_allocator_example() {
    let mut stack = StackAllocator::new(1024);

    // Push some values
    if let Some(x) = stack.push(42i32) {
        println!("Pushed i32: {}", x);
    }

    if let Some(s) = stack.push("Hello".to_string()) {
        println!("Pushed String: {}", s);
    }

    // Pop values (LIFO order)
    if let Some(s) = stack.pop::<String>() {
        println!("Popped String: {}", s);
    }

    if let Some(x) = stack.pop::<i32>() {
        println!("Popped i32: {}", x);
    }
}
```

### Free List Allocator

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct FreeListAllocator {
    memory: *mut u8,
    size: usize,
    free_list: Vec<(*mut u8, usize)>, // (pointer, size)
    layout: Layout,
}

impl FreeListAllocator {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate free list allocator");
        }

        Self {
            memory,
            size,
            free_list: vec![(memory, size)],
            layout,
        }
    }

    fn allocate(&mut self, size: usize, align: usize) -> Option<*mut u8> {
        // Find best fit block
        let mut best_index = None;
        let mut best_size = usize::MAX;

        for (i, (ptr, block_size)) in self.free_list.iter().enumerate() {
            if *block_size >= size {
                // Check alignment
                let aligned_ptr = (*ptr as usize + align - 1) & !(align - 1);
                if aligned_ptr + size <= *ptr as usize + *block_size {
                    if *block_size < best_size {
                        best_size = *block_size;
                        best_index = Some(i);
                    }
                }
            }
        }

        if let Some(index) = best_index {
            let (ptr, block_size) = self.free_list.remove(index);
            let aligned_ptr = (ptr as usize + align - 1) & !(align - 1);

            // Add remaining space back to free list
            let remaining_size = (ptr as usize + block_size) - (aligned_ptr + size);
            if remaining_size > 0 {
                self.free_list.push((unsafe { ptr.add(block_size - remaining_size) }, remaining_size));
            }

            Some(aligned_ptr as *mut u8)
        } else {
            None
        }
    }

    fn deallocate(&mut self, ptr: *mut u8, size: usize) {
        // Add to free list (simplified - no coalescing)
        self.free_list.push((ptr, size));
    }
}

impl Drop for FreeListAllocator {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn free_list_example() {
    let mut allocator = FreeListAllocator::new(1024);

    // Allocate some blocks
    if let Some(ptr1) = allocator.allocate(64, 8) {
        println!("Allocated block 1 at: {:p}", ptr1);

        if let Some(ptr2) = allocator.allocate(32, 4) {
            println!("Allocated block 2 at: {:p}", ptr2);

            // Deallocate blocks
            allocator.deallocate(ptr1, 64);
            allocator.deallocate(ptr2, 32);
            println!("Deallocated blocks");
        }
    }
}
```

## Global Allocator Implementation

### Custom Global Allocator

```rust
use std::alloc::{GlobalAlloc, Layout, System};
use std::ptr;
use std::sync::Mutex;

struct CustomGlobalAllocator {
    pool: Mutex<MemoryPool>,
}

impl CustomGlobalAllocator {
    fn new() -> Self {
        Self {
            pool: Mutex::new(MemoryPool::new(64, 1000)), // 64-byte blocks, 1000 blocks
        }
    }
}

unsafe impl GlobalAlloc for CustomGlobalAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        // For small allocations, use our pool
        if layout.size() <= 64 {
            if let Ok(mut pool) = self.pool.lock() {
                if let Some(ptr) = pool.allocate() {
                    return ptr;
                }
            }
        }

        // Fall back to system allocator for large allocations
        System.alloc(layout)
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        // For small allocations, return to pool
        if layout.size() <= 64 {
            if let Ok(mut pool) = self.pool.lock() {
                pool.deallocate(ptr);
                return;
            }
        }

        // Use system deallocator for large allocations
        System.dealloc(ptr, layout);
    }
}

// Set as global allocator
#[global_allocator]
static GLOBAL: CustomGlobalAllocator = CustomGlobalAllocator::new();

fn global_allocator_example() {
    // This will use our custom global allocator
    let small_vec = vec![1, 2, 3, 4, 5]; // Uses pool
    let large_vec = vec![0; 1000]; // Uses system allocator

    println!("Small vector: {:?}", small_vec);
    println!("Large vector length: {}", large_vec.len());
}
```

## Performance Considerations

### Allocation Performance

```rust
use std::time::Instant;

fn allocation_performance() {
    let iterations = 100_000;

    // Test system allocator
    let start = Instant::now();
    for _ in 0..iterations {
        let _vec = vec![1, 2, 3, 4, 5];
    }
    let system_time = start.elapsed();

    // Test custom allocator (if implemented)
    let start = Instant::now();
    for _ in 0..iterations {
        // Custom allocation would go here
    }
    let custom_time = start.elapsed();

    println!("System allocator: {:?}", system_time);
    println!("Custom allocator: {:?}", custom_time);
}
```

### Memory Fragmentation

```rust
fn fragmentation_analysis() {
    // Analyze memory fragmentation patterns
    let mut allocations = Vec::new();

    // Allocate and deallocate in different patterns
    for i in 0..1000 {
        let size = if i % 2 == 0 { 32 } else { 64 };
        let vec = vec![0u8; size];
        allocations.push(vec);

        // Deallocate every 10th allocation
        if i % 10 == 0 {
            allocations.clear();
        }
    }

    println!("Fragmentation analysis complete");
}
```

## Practical Exercises

### Exercise 1: Implement a Buddy Allocator

```rust
// TODO: Implement a buddy allocator
// 1. Divide memory into power-of-2 sized blocks
// 2. Implement allocation and deallocation
// 3. Handle block splitting and merging
// 4. Optimize for minimal fragmentation
```

### Exercise 2: Create a Slab Allocator

```rust
// TODO: Implement a slab allocator
// 1. Pre-allocate objects of the same size
// 2. Track free and allocated objects
// 3. Implement fast allocation/deallocation
// 4. Handle multiple object sizes
```

### Exercise 3: Build a Memory Profiler

```rust
// TODO: Create a memory profiler
// 1. Track allocation patterns
// 2. Measure fragmentation
// 3. Identify memory leaks
// 4. Generate performance reports
```

## Key Takeaways

- **Custom allocators** can significantly improve performance for specific use cases
- **Memory pools** reduce allocation overhead for frequent allocations
- **Arena allocators** provide fast, predictable allocation patterns
- **Thread safety** is crucial for multi-threaded applications
- **Fragmentation** can be minimized with appropriate allocation strategies
- **Global allocators** allow system-wide optimization

## Next Steps

- Learn about **unsafe Rust** for low-level memory operations
- Explore **operating system integration** for system-level programming
- Study **device drivers** and hardware interfaces
- Practice with **performance profiling** and optimization

## Resources

- [The Rustonomicon - Custom Allocators](https://doc.rust-lang.org/nomicon/alloc.html)
- [Rust Reference - Global Allocators](https://doc.rust-lang.org/reference/items/static-items.html#global-allocators)
- [Systems Programming with Rust](https://doc.rust-lang.org/book/ch20-00-final-project-a-web-server.html)
- [Memory Management in Rust](https://doc.rust-lang.org/nomicon/vec-alloc.html)
