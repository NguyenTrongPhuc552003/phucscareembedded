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

**What**: The global allocator trait is a trait that provides the basic interface for all allocators.

**Why**: This trait is essential because it provides the basic interface for all allocators.

**When**: Use the global allocator trait when implementing a custom allocator.

**How**: The global allocator trait is implemented as a trait with the following methods:

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

**Code Explanation**: This example demonstrates the basic structure of a custom allocator:

- **`struct SimpleAllocator`**: A zero-sized struct that implements the allocator interface
- **`unsafe impl GlobalAlloc`**: The trait implementation must be marked `unsafe` because allocators can cause undefined behavior if implemented incorrectly
- **`alloc(layout: Layout)`**: Allocates memory with the specified size and alignment. Returns a raw pointer to the allocated memory
- **`dealloc(ptr, layout)`**: Frees memory that was previously allocated with the same layout
- **`#[global_allocator]`**: This attribute tells Rust to use this allocator for all heap allocations in the program
- **`System.alloc(layout)`**: Delegates to the system allocator (a simple pass-through implementation)

**Why this works**: By implementing `GlobalAlloc`, we can intercept all memory allocations in the program. This is useful for debugging, profiling, or implementing specialized allocation strategies.

### Layout and Alignment

**What**: The layout and alignment are the size and alignment of the memory block to be allocated.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment.

**When**: Use the layout and alignment when allocating memory.

**How**: The layout and alignment are implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates how to work with memory layouts and alignment:

- **`Layout::new::<[i32; 100]>()`**: Creates a layout for an array of 100 i32 values
- **`layout.size()`**: Returns the total size in bytes needed for the layout
- **`layout.align()`**: Returns the alignment requirement for the layout
- **`alloc(layout)`**: Allocates memory with the specified layout, returning a raw pointer
- **`ptr::write()`**: Safely writes a value to a raw pointer location
- **`ptr::read()`**: Safely reads a value from a raw pointer location
- **`dealloc(ptr, layout)`**: Frees memory that was allocated with the same layout

**Why this works**: Layouts ensure that memory is allocated with the correct size and alignment for the data type. This prevents alignment issues and ensures optimal memory access patterns.

## Memory Pool Allocator

### Basic Memory Pool

**What**: The basic memory pool is a memory pool that allocates memory in blocks of a fixed size.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment.

**When**: Use the basic memory pool when allocating memory in blocks of a fixed size.

**How**: The basic memory pool is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a basic memory pool allocator:

- **`MemoryPool` struct**: Manages a pool of fixed-size memory blocks with thread-safe access
- **`new(block_size, num_blocks)`**: Creates a pool with specified block size and number of blocks
- **`free_blocks: Mutex<Vec<*mut u8>>`**: Thread-safe collection of available memory blocks
- **`allocate()`**: Returns a free block from the pool, or `None` if no blocks available
- **`deallocate(ptr)`**: Returns a block to the pool for reuse
- **`Drop` trait**: Automatically frees the entire pool when the allocator is destroyed
- **Block verification**: Ensures returned blocks are within the pool's memory range

**Why this works**: Memory pools pre-allocate blocks of memory, eliminating the overhead of system calls for each allocation. This provides predictable performance and reduces fragmentation.

### Thread-Safe Memory Pool

**What**: The thread-safe memory pool is a memory pool that allocates memory in blocks of a fixed size and is thread-safe.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is thread-safe.

**When**: Use the thread-safe memory pool when allocating memory in blocks of a fixed size and is thread-safe.

**How**: The thread-safe memory pool is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a thread-safe memory pool allocator:

- **`ThreadSafePool` struct**: Similar to `MemoryPool` but designed for concurrent access
- **`Arc<ThreadSafePool>`**: Atomic reference counting allows sharing the pool across threads
- **`Mutex<Vec<*mut u8>>`**: Protects the free blocks list from race conditions
- **`thread::spawn()`**: Creates multiple threads that concurrently use the same pool
- **`Arc::clone()`**: Creates additional references to the pool for each thread
- **Thread safety**: Multiple threads can safely allocate and deallocate blocks simultaneously
- **Block isolation**: Each thread gets its own blocks, preventing data races

**Why this works**: The `Mutex` ensures that only one thread can modify the free blocks list at a time, while `Arc` allows multiple threads to share the same pool safely.

## Arena Allocator

### Linear Arena

**What**: The linear arena allocator is a memory allocator that allocates memory in a linear fashion.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is linear.

**When**: Use the linear arena allocator when allocating memory in a linear fashion.

**How**: The linear arena allocator is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a linear arena allocator:

- **`Arena` struct**: Manages a contiguous block of memory with a linear allocation pattern
- **`offset` field**: Tracks the current position in the arena for the next allocation
- **`allocate<T>(value)`**: Allocates space for a value and returns a mutable reference
- **Alignment handling**: Ensures allocations are properly aligned for the data type
- **`reset()` method**: Resets the arena to the beginning, making all memory available again
- **Linear allocation**: Allocations are made sequentially, providing very fast allocation
- **No individual deallocation**: Memory is freed only when the entire arena is reset

**Why this works**: Arena allocators are extremely fast because they only need to increment a pointer for each allocation. They're ideal for temporary data that can be freed all at once.

### Bump Allocator

**What**: The bump allocator is a memory allocator that allocates memory in a bump fashion.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is bump.

**When**: Use the bump allocator when allocating memory in a bump fashion.

**How**: The bump allocator is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a thread-safe bump allocator:

- **`BumpAllocator` struct**: Uses atomic operations for thread-safe bump allocation
- **`AtomicUsize`**: Thread-safe counter for the current allocation offset
- **`compare_exchange_weak()`**: Atomic operation that safely updates the offset
- **Lock-free allocation**: No mutexes needed, providing high performance
- **Alignment handling**: Ensures proper alignment for each allocation
- **Memory bounds checking**: Prevents allocation beyond the arena's capacity
- **Race condition prevention**: Atomic operations ensure thread safety

**Why this works**: Atomic operations provide thread safety without the overhead of mutexes. The `compare_exchange_weak` operation ensures that only one thread can successfully update the offset at a time.

## Specialized Allocators

### Stack Allocator

**What**: The stack allocator is a memory allocator that allocates memory in a stack fashion.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is stack.

**When**: Use the stack allocator when allocating memory in a stack fashion.

**How**: The stack allocator is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a stack-based allocator:

- **`StackAllocator` struct**: Manages memory like a stack with push/pop operations
- **`stack_pointer` field**: Tracks the current top of the stack
- **`push<T>(value)`**: Allocates space and stores a value on the stack
- **`pop<T>()`**: Removes and returns the most recently pushed value (LIFO order)
- **Stack discipline**: Values must be popped in reverse order of pushing
- **Alignment handling**: Ensures proper alignment for each stack frame
- **Memory bounds checking**: Prevents stack overflow

**Why this works**: Stack allocators provide very fast allocation and deallocation with LIFO semantics. They're ideal for temporary data that follows a nested scope pattern.

### Free List Allocator

**What**: The free list allocator is a memory allocator that allocates memory in a free list fashion.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is free list.

**When**: Use the free list allocator when allocating memory in a free list fashion.

**How**: The free list allocator is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a free list allocator:

- **`FreeListAllocator` struct**: Manages memory using a list of free blocks
- **`free_list: Vec<(*mut u8, usize)>`**: Tracks available memory blocks with their sizes
- **Best fit algorithm**: Finds the smallest suitable block for each allocation
- **Alignment handling**: Ensures allocated blocks meet alignment requirements
- **Block splitting**: Divides large blocks into smaller ones when needed
- **Fragmentation management**: Tracks free space to minimize waste
- **No coalescing**: Simplified implementation that doesn't merge adjacent free blocks

**Why this works**: Free list allocators provide flexible allocation for variable-sized objects while managing fragmentation through block tracking and best-fit selection.

## Global Allocator Implementation

### Custom Global Allocator

**What**: The custom global allocator is a global allocator that allocates memory in a custom fashion.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is custom.

**When**: Use the custom global allocator when allocating memory in a custom fashion.

**How**: The custom global allocator is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates a custom global allocator:

- **`CustomGlobalAllocator` struct**: Combines a memory pool with system allocator fallback
- **`Mutex<MemoryPool>`**: Thread-safe access to the memory pool
- **Size-based routing**: Small allocations use the pool, large ones use system allocator
- **`GlobalAlloc` implementation**: Implements the global allocator interface
- **Fallback mechanism**: Uses system allocator when pool is exhausted
- **`#[global_allocator]`**: Makes this the default allocator for the entire program
- **Performance optimization**: Pool provides fast allocation for common small objects

**Why this works**: This hybrid approach provides the speed of memory pools for small allocations while maintaining compatibility with large allocations through system fallback.

## Performance Considerations

### Allocation Performance

**What**: The allocation performance is a performance measurement for allocators.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is performance measurement for allocators.

**When**: Use the allocation performance when allocating memory in a performance measurement for allocators.

**How**: The allocation performance is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates performance measurement for allocators:

- **`Instant::now()`**: High-precision timing for performance measurement
- **`elapsed()`**: Calculates the duration between two time points
- **Iteration testing**: Performs many allocations to measure average performance
- **System vs custom**: Compares performance between different allocator implementations
- **Benchmarking approach**: Standard methodology for measuring allocator performance
- **Timing precision**: Uses system clock for accurate microsecond-level measurements

**Why this works**: Performance testing helps identify which allocator provides better performance for specific workloads and allocation patterns.

### Memory Fragmentation

**What**: The fragmentation analysis is a performance measurement for allocators.

**Why**: This is essential because it ensures that the memory block is allocated with the correct size and alignment and is performance measurement for allocators.

**When**: Use the fragmentation analysis when allocating memory in a performance measurement for allocators.

**How**: The fragmentation analysis is implemented as a struct with the size and alignment of the memory block to be allocated.

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

**Code Explanation**: This example demonstrates memory fragmentation analysis:

- **`allocations: Vec<Vec<u8>>`**: Tracks allocated memory blocks for analysis
- **Variable size allocation**: Creates different sized allocations to simulate real-world patterns
- **Periodic deallocation**: Clears allocations every 10th iteration to create fragmentation
- **Fragmentation simulation**: Mix of small and large allocations creates memory holes
- **Memory pattern analysis**: Studies how allocation patterns affect memory layout
- **Fragmentation measurement**: Helps understand how allocators handle memory reuse

**Why this works**: Fragmentation analysis helps identify how different allocation patterns affect memory efficiency and helps choose the right allocator for specific workloads.

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
