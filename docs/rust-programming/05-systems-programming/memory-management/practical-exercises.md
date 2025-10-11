---
sidebar_position: 3
---

# Memory Management Practical Exercises

Master memory management through hands-on exercises with comprehensive solutions using the 4W+H framework.

## What Are These Exercises?

**What**: These exercises provide practical, hands-on experience with memory management concepts in systems programming, covering memory layout, custom allocators, and performance optimization.

**Why**: These exercises are essential because:

- **Practical Application**: Apply theoretical knowledge to real-world scenarios
- **Problem-Solving Skills**: Develop debugging and optimization abilities
- **Performance Understanding**: Learn to identify and fix memory-related performance issues
- **Systems Programming**: Gain experience with low-level memory management
- **Career Preparation**: Build skills needed for systems programming roles

**When**: Complete these exercises when:

- Learning memory management concepts
- Preparing for systems programming interviews
- Building performance-critical applications
- Working with embedded systems
- Optimizing existing codebases

**Where**: These exercises apply in:

- Systems programming and operating systems
- Embedded systems development
- Game engines and graphics programming
- Database systems and file systems
- High-performance computing applications
- Real-time systems and control systems

**How**: Complete these exercises by:

- Following step-by-step instructions
- Implementing solutions from scratch
- Testing and debugging your code
- Measuring and optimizing performance
- Comparing different approaches

## Exercise 1: Memory Layout Analyzer

### Problem Statement

Create a tool that analyzes the memory layout of different data structures and provides detailed information about size, alignment, and field offsets.

### Requirements

- Analyze struct and enum layouts
- Calculate field offsets and padding
- Compare different layout strategies
- Generate memory layout diagrams
- Support for different alignment requirements

### Solution

```rust
use std::mem;

struct LayoutAnalyzer;

impl LayoutAnalyzer {
    fn analyze_struct<T>() {
        println!("=== Struct Analysis ===");
        println!("Type: {}", std::any::type_name::<T>());
        println!("Size: {} bytes", mem::size_of::<T>());
        println!("Alignment: {} bytes", mem::align_of::<T>());
        println!("Size of pointer: {} bytes", mem::size_of::<*const T>());
    }

    fn analyze_enum<T>() {
        println!("=== Enum Analysis ===");
        println!("Type: {}", std::any::type_name::<T>());
        println!("Size: {} bytes", mem::size_of::<T>());
        println!("Alignment: {} bytes", mem::align_of::<T>());
    }

    fn compare_layouts() {
        // Compare different struct layouts
        #[derive(Debug)]
        struct Layout1 {
            a: u8,
            b: u32,
            c: u8,
            d: u16,
        }

        #[derive(Debug)]
        struct Layout2 {
            b: u32,
            d: u16,
            a: u8,
            c: u8,
        }

        #[repr(packed)]
        #[derive(Debug)]
        struct Layout3 {
            a: u8,
            b: u32,
            c: u8,
            d: u16,
        }

        Self::analyze_struct::<Layout1>();
        Self::analyze_struct::<Layout2>();
        Self::analyze_struct::<Layout3>();
    }
}

// Test the analyzer
fn exercise_1_solution() {
    LayoutAnalyzer::compare_layouts();
}
```

### Advanced Features

```rust
use std::mem;
use std::ptr;

struct AdvancedLayoutAnalyzer;

impl AdvancedLayoutAnalyzer {
    fn analyze_field_offsets<T>() {
        println!("=== Field Offset Analysis ===");

        // Create a dummy instance to get field addresses
        let dummy = unsafe { mem::zeroed::<T>() };
        let base_ptr = &dummy as *const T as *const u8;

        // This is a simplified approach - in practice, you'd need
        // more sophisticated techniques to get field offsets
        println!("Base address: {:p}", base_ptr);
    }

    fn generate_memory_diagram<T>() {
        println!("=== Memory Diagram ===");
        let size = mem::size_of::<T>();
        let align = mem::align_of::<T>();

        println!("Memory layout for {} bytes:", size);
        for i in 0..size {
            if i % align == 0 {
                print!("|");
            }
            print!("-");
        }
        println!("|");
    }
}

fn advanced_analysis() {
    #[derive(Debug)]
    struct ComplexStruct {
        a: u8,
        b: u32,
        c: u8,
        d: u16,
        e: String,
    }

    AdvancedLayoutAnalyzer::analyze_field_offsets::<ComplexStruct>();
    AdvancedLayoutAnalyzer::generate_memory_diagram::<ComplexStruct>();
}
```

## Exercise 2: Custom Memory Allocator

### Problem Statement

Implement a custom memory allocator that uses a free-list strategy with block coalescing to minimize fragmentation.

### Requirements

- Implement allocation and deallocation
- Handle block splitting and merging
- Support different alignment requirements
- Track allocation statistics
- Provide memory usage reports

### Solution

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct FreeListAllocator {
    memory: *mut u8,
    size: usize,
    free_blocks: Vec<FreeBlock>,
    layout: Layout,
}

#[derive(Debug, Clone)]
struct FreeBlock {
    ptr: *mut u8,
    size: usize,
}

impl FreeListAllocator {
    fn new(size: usize) -> Self {
        let layout = Layout::from_size_align(size, 8).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate memory");
        }

        Self {
            memory,
            size,
            free_blocks: vec![FreeBlock { ptr: memory, size }],
            layout,
        }
    }

    fn allocate(&mut self, size: usize, align: usize) -> Option<*mut u8> {
        // Find best fit block
        let mut best_index = None;
        let mut best_size = usize::MAX;

        for (i, block) in self.free_blocks.iter().enumerate() {
            if block.size >= size {
                // Check alignment
                let aligned_ptr = (block.ptr as usize + align - 1) & !(align - 1);
                if aligned_ptr + size <= block.ptr as usize + block.size {
                    if block.size < best_size {
                        best_size = block.size;
                        best_index = Some(i);
                    }
                }
            }
        }

        if let Some(index) = best_index {
            let block = self.free_blocks.remove(index);
            let aligned_ptr = (block.ptr as usize + align - 1) & !(align - 1);

            // Add remaining space back to free list
            let remaining_size = (block.ptr as usize + block.size) - (aligned_ptr + size);
            if remaining_size > 0 {
                self.free_blocks.push(FreeBlock {
                    ptr: unsafe { (aligned_ptr + size) as *mut u8 },
                    size: remaining_size,
                });
            }

            Some(aligned_ptr as *mut u8)
        } else {
            None
        }
    }

    fn deallocate(&mut self, ptr: *mut u8, size: usize) {
        // Add to free list and coalesce
        self.free_blocks.push(FreeBlock { ptr, size });
        self.coalesce_blocks();
    }

    fn coalesce_blocks(&mut self) {
        // Sort blocks by address
        self.free_blocks.sort_by_key(|block| block.ptr as usize);

        // Coalesce adjacent blocks
        let mut i = 0;
        while i < self.free_blocks.len() - 1 {
            let current = &self.free_blocks[i];
            let next = &self.free_blocks[i + 1];

            if current.ptr as usize + current.size == next.ptr as usize {
                // Merge blocks
                self.free_blocks[i].size += next.size;
                self.free_blocks.remove(i + 1);
            } else {
                i += 1;
            }
        }
    }

    fn get_stats(&self) -> AllocatorStats {
        let total_free = self.free_blocks.iter().map(|b| b.size).sum();
        let largest_block = self.free_blocks.iter().map(|b| b.size).max().unwrap_or(0);

        AllocatorStats {
            total_size: self.size,
            free_size: total_free,
            used_size: self.size - total_free,
            num_blocks: self.free_blocks.len(),
            largest_block,
        }
    }
}

#[derive(Debug)]
struct AllocatorStats {
    total_size: usize,
    free_size: usize,
    used_size: usize,
    num_blocks: usize,
    largest_block: usize,
}

impl Drop for FreeListAllocator {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

fn exercise_2_solution() {
    let mut allocator = FreeListAllocator::new(1024);

    // Allocate some blocks
    let blocks: Vec<*mut u8> = (0..5)
        .filter_map(|_| allocator.allocate(64, 8))
        .collect();

    println!("Allocated {} blocks", blocks.len());
    println!("Stats: {:?}", allocator.get_stats());

    // Deallocate some blocks
    for (i, block) in blocks.iter().enumerate() {
        if i % 2 == 0 {
            allocator.deallocate(*block, 64);
        }
    }

    println!("After deallocation:");
    println!("Stats: {:?}", allocator.get_stats());
}
```

## Exercise 3: Memory Pool Implementation

### Problem Statement

Create a memory pool that pre-allocates objects of the same type and provides fast allocation/deallocation with object reuse.

### Requirements

- Pre-allocate a fixed number of objects
- Implement thread-safe allocation/deallocation
- Support object initialization and cleanup
- Track pool usage statistics
- Handle pool exhaustion gracefully

### Solution

```rust
use std::sync::{Mutex, Arc};
use std::thread;

struct ObjectPool<T> {
    objects: Mutex<Vec<Box<T>>>,
    factory: fn() -> T,
    reset: fn(&mut T),
}

impl<T> ObjectPool<T> {
    fn new(capacity: usize, factory: fn() -> T, reset: fn(&mut T)) -> Self {
        let mut objects = Vec::with_capacity(capacity);
        for _ in 0..capacity {
            objects.push(Box::new(factory()));
        }

        Self {
            objects: Mutex::new(objects),
            factory,
            reset,
        }
    }

    fn acquire(&self) -> Option<PooledObject<T>> {
        self.objects.lock().unwrap().pop().map(|obj| {
            PooledObject {
                obj: Some(obj),
                pool: Arc::new(self.clone()),
            }
        })
    }

    fn release(&self, mut obj: Box<T>) {
        (self.reset)(&mut obj);
        self.objects.lock().unwrap().push(obj);
    }

    fn stats(&self) -> PoolStats {
        let objects = self.objects.lock().unwrap();
        PoolStats {
            total: objects.capacity(),
            available: objects.len(),
            in_use: objects.capacity() - objects.len(),
        }
    }
}

impl<T> Clone for ObjectPool<T> {
    fn clone(&self) -> Self {
        Self {
            objects: Mutex::new(Vec::new()),
            factory: self.factory,
            reset: self.reset,
        }
    }
}

struct PooledObject<T> {
    obj: Option<Box<T>>,
    pool: Arc<ObjectPool<T>>,
}

impl<T> PooledObject<T> {
    fn get(&self) -> &T {
        self.obj.as_ref().unwrap()
    }

    fn get_mut(&mut self) -> &mut T {
        self.obj.as_mut().unwrap()
    }
}

impl<T> Drop for PooledObject<T> {
    fn drop(&mut self) {
        if let Some(obj) = self.obj.take() {
            self.pool.release(obj);
        }
    }
}

#[derive(Debug)]
struct PoolStats {
    total: usize,
    available: usize,
    in_use: usize,
}

// Example usage
fn exercise_3_solution() {
    let pool = Arc::new(ObjectPool::new(
        10,
        || String::new(),
        |s| s.clear(),
    ));

    // Test single-threaded usage
    {
        let obj = pool.acquire().unwrap();
        println!("Acquired object: '{}'", obj.get());
        // Object is automatically returned to pool when dropped
    }

    // Test multi-threaded usage
    let mut handles = vec![];
    for i in 0..5 {
        let pool = Arc::clone(&pool);
        let handle = thread::spawn(move || {
            if let Some(mut obj) = pool.acquire() {
                obj.get_mut().push_str(&format!("Thread {}", i));
                println!("Thread {}: '{}'", i, obj.get());
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Pool stats: {:?}", pool.stats());
}
```

## Exercise 4: Memory Profiler

### Problem Statement

Build a memory profiler that tracks allocation patterns, measures fragmentation, and identifies potential memory leaks.

### Requirements

- Track all allocations and deallocations
- Measure memory fragmentation
- Detect potential memory leaks
- Generate allocation reports
- Provide performance metrics

### Solution

```rust
use std::collections::HashMap;
use std::sync::{Mutex, Arc};
use std::time::{Duration, Instant};

struct MemoryProfiler {
    allocations: Mutex<HashMap<*mut u8, AllocationInfo>>,
    stats: Mutex<ProfilerStats>,
    start_time: Instant,
}

#[derive(Debug, Clone)]
struct AllocationInfo {
    size: usize,
    timestamp: Instant,
    stack_trace: Vec<String>,
}

#[derive(Debug)]
struct ProfilerStats {
    total_allocations: usize,
    total_deallocations: usize,
    peak_memory: usize,
    current_memory: usize,
    fragmentation: f64,
}

impl MemoryProfiler {
    fn new() -> Self {
        Self {
            allocations: Mutex::new(HashMap::new()),
            stats: Mutex::new(ProfilerStats {
                total_allocations: 0,
                total_deallocations: 0,
                peak_memory: 0,
                current_memory: 0,
                fragmentation: 0.0,
            }),
            start_time: Instant::now(),
        }
    }

    fn record_allocation(&self, ptr: *mut u8, size: usize) {
        let mut allocations = self.allocations.lock().unwrap();
        let mut stats = self.stats.lock().unwrap();

        allocations.insert(ptr, AllocationInfo {
            size,
            timestamp: Instant::now(),
            stack_trace: self.get_stack_trace(),
        });

        stats.total_allocations += 1;
        stats.current_memory += size;
        stats.peak_memory = stats.peak_memory.max(stats.current_memory);
    }

    fn record_deallocation(&self, ptr: *mut u8) {
        let mut allocations = self.allocations.lock().unwrap();
        let mut stats = self.stats.lock().unwrap();

        if let Some(info) = allocations.remove(&ptr) {
            stats.total_deallocations += 1;
            stats.current_memory -= info.size;
        }
    }

    fn get_stack_trace(&self) -> Vec<String> {
        // Simplified stack trace - in practice, you'd use a proper stack unwinding library
        vec!["<stack trace>".to_string()]
    }

    fn calculate_fragmentation(&self) -> f64 {
        let allocations = self.allocations.lock().unwrap();
        let stats = self.stats.lock().unwrap();

        if stats.current_memory == 0 {
            return 0.0;
        }

        // Simplified fragmentation calculation
        let num_blocks = allocations.len();
        let avg_block_size = if num_blocks > 0 {
            stats.current_memory as f64 / num_blocks as f64
        } else {
            0.0
        };

        // Fragmentation increases with more small blocks
        1.0 - (avg_block_size / 1024.0).min(1.0)
    }

    fn generate_report(&self) -> ProfilerReport {
        let allocations = self.allocations.lock().unwrap();
        let stats = self.stats.lock().unwrap();

        ProfilerReport {
            duration: self.start_time.elapsed(),
            total_allocations: stats.total_allocations,
            total_deallocations: stats.total_deallocations,
            peak_memory: stats.peak_memory,
            current_memory: stats.current_memory,
            active_allocations: allocations.len(),
            fragmentation: self.calculate_fragmentation(),
        }
    }
}

#[derive(Debug)]
struct ProfilerReport {
    duration: Duration,
    total_allocations: usize,
    total_deallocations: usize,
    peak_memory: usize,
    current_memory: usize,
    active_allocations: usize,
    fragmentation: f64,
}

fn exercise_4_solution() {
    let profiler = Arc::new(MemoryProfiler::new());

    // Simulate some allocations
    let mut pointers = vec![];
    for i in 0..100 {
        let size = (i % 10 + 1) * 64;
        let ptr = unsafe { std::alloc::alloc(std::alloc::Layout::from_size_align(size, 8).unwrap()) };
        if !ptr.is_null() {
            profiler.record_allocation(ptr, size);
            pointers.push(ptr);
        }
    }

    // Deallocate some pointers
    for (i, ptr) in pointers.iter().enumerate() {
        if i % 2 == 0 {
            profiler.record_deallocation(*ptr);
            unsafe { std::alloc::dealloc(*ptr, std::alloc::Layout::from_size_align(64, 8).unwrap()); }
        }
    }

    // Generate report
    let report = profiler.generate_report();
    println!("Memory Profiler Report:");
    println!("{:#?}", report);
}
```

## Exercise 5: Performance Benchmarking

### Problem Statement

Create a benchmarking suite that compares different memory allocation strategies and measures their performance characteristics.

### Requirements

- Compare system allocator vs custom allocators
- Measure allocation/deallocation speed
- Track memory usage patterns
- Test different allocation sizes
- Generate performance reports

### Solution

```rust
use std::time::{Duration, Instant};
use std::alloc::{alloc, dealloc, Layout};

struct BenchmarkSuite;

impl BenchmarkSuite {
    fn benchmark_system_allocator(iterations: usize, size: usize) -> Duration {
        let start = Instant::now();
        let mut pointers = Vec::new();

        for _ in 0..iterations {
            let layout = Layout::from_size_align(size, 8).unwrap();
            let ptr = unsafe { alloc(layout) };
            if !ptr.is_null() {
                pointers.push((ptr, layout));
            }
        }

        // Deallocate
        for (ptr, layout) in pointers {
            unsafe { dealloc(ptr, layout); }
        }

        start.elapsed()
    }

    fn benchmark_custom_allocator(iterations: usize, size: usize) -> Duration {
        let start = Instant::now();
        let mut allocator = FreeListAllocator::new(iterations * size * 2);
        let mut pointers = Vec::new();

        for _ in 0..iterations {
            if let Some(ptr) = allocator.allocate(size, 8) {
                pointers.push(ptr);
            }
        }

        // Deallocate
        for ptr in pointers {
            allocator.deallocate(ptr, size);
        }

        start.elapsed()
    }

    fn run_comprehensive_benchmark() {
        let test_cases = vec![
            (1000, 64),
            (1000, 256),
            (1000, 1024),
            (10000, 64),
            (10000, 256),
        ];

        println!("=== Memory Allocation Benchmark ===");
        println!("{:<12} {:<8} {:<15} {:<15} {:<10}", "Iterations", "Size", "System (ms)", "Custom (ms)", "Speedup");
        println!("{}", "-".repeat(70));

        for (iterations, size) in test_cases {
            let system_time = Self::benchmark_system_allocator(iterations, size);
            let custom_time = Self::benchmark_custom_allocator(iterations, size);

            let speedup = system_time.as_nanos() as f64 / custom_time.as_nanos() as f64;

            println!(
                "{:<12} {:<8} {:<15.2} {:<15.2} {:<10.2}x",
                iterations,
                size,
                system_time.as_secs_f64() * 1000.0,
                custom_time.as_secs_f64() * 1000.0,
                speedup
            );
        }
    }
}

fn exercise_5_solution() {
    BenchmarkSuite::run_comprehensive_benchmark();
}
```

## Exercise 6: Memory Leak Detection

### Problem Statement

Implement a memory leak detector that tracks allocations and identifies objects that are never deallocated.

### Requirements

- Track all allocations with timestamps
- Identify unreleased memory
- Generate leak reports
- Support for different allocation patterns
- Provide debugging information

### Solution

```rust
use std::collections::HashMap;
use std::sync::{Mutex, Arc};
use std::time::Instant;

struct LeakDetector {
    allocations: Mutex<HashMap<*mut u8, LeakInfo>>,
    start_time: Instant,
}

#[derive(Debug, Clone)]
struct LeakInfo {
    size: usize,
    timestamp: Instant,
    location: String,
}

impl LeakDetector {
    fn new() -> Self {
        Self {
            allocations: Mutex::new(HashMap::new()),
            start_time: Instant::now(),
        }
    }

    fn track_allocation(&self, ptr: *mut u8, size: usize, location: &str) {
        let mut allocations = self.allocations.lock().unwrap();
        allocations.insert(ptr, LeakInfo {
            size,
            timestamp: Instant::now(),
            location: location.to_string(),
        });
    }

    fn track_deallocation(&self, ptr: *mut u8) {
        let mut allocations = self.allocations.lock().unwrap();
        allocations.remove(&ptr);
    }

    fn detect_leaks(&self) -> Vec<LeakReport> {
        let allocations = self.allocations.lock().unwrap();
        let mut leaks = Vec::new();

        for (ptr, info) in allocations.iter() {
            let age = info.timestamp.duration_since(self.start_time);
            leaks.push(LeakReport {
                ptr: *ptr,
                size: info.size,
                age,
                location: info.location.clone(),
            });
        }

        leaks.sort_by_key(|leak| leak.size);
        leaks
    }
}

#[derive(Debug)]
struct LeakReport {
    ptr: *mut u8,
    size: usize,
    age: std::time::Duration,
    location: String,
}

fn exercise_6_solution() {
    let detector = Arc::new(LeakDetector::new());

    // Simulate some allocations (some will be leaked)
    let mut pointers = vec![];
    for i in 0..10 {
        let size = 64;
        let ptr = unsafe { std::alloc::alloc(std::alloc::Layout::from_size_align(size, 8).unwrap()) };
        if !ptr.is_null() {
            detector.track_allocation(ptr, size, &format!("allocation_{}", i));
            pointers.push(ptr);
        }
    }

    // Deallocate only half (simulate leaks)
    for (i, ptr) in pointers.iter().enumerate() {
        if i % 2 == 0 {
            detector.track_deallocation(*ptr);
            unsafe { std::alloc::dealloc(*ptr, std::alloc::Layout::from_size_align(64, 8).unwrap()); }
        }
    }

    // Detect leaks
    let leaks = detector.detect_leaks();
    println!("Detected {} memory leaks:", leaks.len());
    for leak in leaks {
        println!("Leak: {:p}, size: {} bytes, age: {:?}, location: {}",
                leak.ptr, leak.size, leak.age, leak.location);
    }
}
```

## Key Takeaways

- **Memory layout** analysis helps optimize data structures
- **Custom allocators** can significantly improve performance
- **Memory pools** reduce allocation overhead
- **Profiling tools** are essential for performance optimization
- **Leak detection** prevents memory-related bugs
- **Benchmarking** validates optimization efforts

## Next Steps

- Learn about **unsafe Rust** for low-level operations
- Explore **operating system integration** for system programming
- Study **device drivers** and hardware interfaces
- Practice with **performance optimization** techniques

## Resources

- [The Rustonomicon - Memory Management](https://doc.rust-lang.org/nomicon/)
- [Rust Reference - Type Layout](https://doc.rust-lang.org/reference/type-layout.html)
- [Systems Programming with Rust](https://doc.rust-lang.org/book/ch20-00-final-project-a-web-server.html)
- [Memory Management Best Practices](https://doc.rust-lang.org/nomicon/vec-alloc.html)
