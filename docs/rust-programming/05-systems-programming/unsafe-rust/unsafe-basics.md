---
sidebar_position: 1
---

# Unsafe Rust Basics

Master unsafe Rust programming with comprehensive explanations using the 4W+H framework.

## What Is Unsafe Rust?

**What**: Unsafe Rust is a subset of Rust that allows you to bypass certain safety guarantees to perform operations that the compiler cannot verify as safe, such as dereferencing raw pointers, calling unsafe functions, or accessing mutable static variables.

**Why**: Unsafe Rust is necessary because:

- **Systems Programming**: Low-level operations require direct memory manipulation
- **Performance**: Some operations are only possible with unsafe code
- **FFI Integration**: Interfacing with C libraries requires unsafe operations
- **Hardware Access**: Direct hardware manipulation needs unsafe code
- **Optimization**: Certain optimizations require unsafe operations
- **Legacy Code**: Interfacing with existing unsafe codebases

**When**: Use unsafe Rust when:

- Working with raw pointers and memory addresses
- Calling C functions from Rust
- Implementing performance-critical algorithms
- Accessing hardware registers
- Creating safe abstractions over unsafe code
- Working with uninitialized memory

**Where**: Unsafe Rust is used in:

- Operating system kernels and drivers
- Embedded systems and microcontrollers
- High-performance libraries and frameworks
- FFI bindings and C interop
- Game engines and graphics programming
- Database systems and file systems

**How**: Unsafe Rust is implemented through:

- Unsafe blocks and functions
- Raw pointers and dereferencing
- Unsafe traits and implementations
- Memory manipulation operations
- FFI declarations and calls

## Unsafe Operations

### Unsafe Blocks

```rust
fn unsafe_basics() {
    let mut x = 42;
    let y = &x as *const i32;

    // Unsafe block allows dereferencing raw pointers
    unsafe {
        println!("Value through raw pointer: {}", *y);

        // Modify through raw pointer
        let z = &mut x as *mut i32;
        *z = 100;
        println!("Modified value: {}", x);
    }
}
```

### Raw Pointers

```rust
fn raw_pointers_example() {
    let mut data = vec![1, 2, 3, 4, 5];

    // Create raw pointers
    let ptr = data.as_mut_ptr();
    let len = data.len();

    unsafe {
        // Access elements through raw pointer
        for i in 0..len {
            let element = *ptr.add(i);
            println!("Element {}: {}", i, element);
        }

        // Modify elements
        for i in 0..len {
            *ptr.add(i) *= 2;
        }
    }

    println!("Modified data: {:?}", data);
}
```

### Unsafe Functions

```rust
// Unsafe function declaration
unsafe fn dangerous_operation(ptr: *mut i32, value: i32) {
    if !ptr.is_null() {
        *ptr = value;
    }
}

// Safe wrapper around unsafe function
fn safe_wrapper(data: &mut i32, value: i32) {
    unsafe {
        dangerous_operation(data as *mut i32, value);
    }
}

fn unsafe_functions_example() {
    let mut x = 42;
    safe_wrapper(&mut x, 100);
    println!("Value after unsafe operation: {}", x);
}
```

## Memory Manipulation

### Uninitialized Memory

```rust
use std::mem;

fn uninitialized_memory_example() {
    // Create uninitialized memory
    let mut uninit: [i32; 5] = unsafe { mem::uninitialized() };

    // Initialize manually
    for i in 0..5 {
        uninit[i] = i as i32;
    }

    println!("Uninitialized array: {:?}", uninit);

    // Alternative: MaybeUninit
    let mut maybe_uninit: [std::mem::MaybeUninit<i32>; 5] =
        unsafe { std::mem::uninitialized() };

    for i in 0..5 {
        maybe_uninit[i] = std::mem::MaybeUninit::new(i as i32);
    }

    // Convert to initialized array
    let init: [i32; 5] = unsafe { mem::transmute(maybe_uninit) };
    println!("MaybeUninit array: {:?}", init);
}
```

### Memory Copying

```rust
use std::ptr;

fn memory_copying_example() {
    let src = vec![1, 2, 3, 4, 5];
    let mut dst = vec![0; 5];

    unsafe {
        // Copy memory from src to dst
        ptr::copy_nonoverlapping(
            src.as_ptr(),
            dst.as_mut_ptr(),
            src.len()
        );
    }

    println!("Copied data: {:?}", dst);

    // Move data without copying
    let mut data = vec![1, 2, 3, 4, 5];
    let ptr = data.as_mut_ptr();
    let len = data.len();
    let cap = data.capacity();

    // Forget the original vector
    mem::forget(data);

    // Reconstruct from raw parts
    let reconstructed = unsafe {
        Vec::from_raw_parts(ptr, len, cap)
    };

    println!("Reconstructed: {:?}", reconstructed);
}
```

### Memory Layout Manipulation

```rust
use std::mem;

fn memory_layout_example() {
    // Transmute between types
    let x: i32 = 42;
    let y: u32 = unsafe { mem::transmute(x) };
    println!("Transmuted: {} -> {}", x, y);

    // Transmute arrays
    let bytes: [u8; 4] = [0x00, 0x00, 0x00, 0x2A];
    let value: i32 = unsafe { mem::transmute(bytes) };
    println!("Bytes to int: {:?} -> {}", bytes, value);

    // Zero-sized types
    struct Empty;
    let empty = Empty;
    let size = mem::size_of::<Empty>();
    println!("Empty struct size: {}", size);
}
```

## Raw Pointers Deep Dive

### Pointer Arithmetic

```rust
fn pointer_arithmetic_example() {
    let data = vec![1, 2, 3, 4, 5];
    let ptr = data.as_ptr();

    unsafe {
        // Pointer arithmetic
        for i in 0..data.len() {
            let element = *ptr.add(i);
            println!("Element {}: {}", i, element);
        }

        // Offset pointers
        let offset_ptr = ptr.add(2);
        println!("Element at offset 2: {}", *offset_ptr);

        // Distance between pointers
        let distance = offset_ptr.offset_from(ptr);
        println!("Distance: {}", distance);
    }
}
```

### Pointer Casting

```rust
fn pointer_casting_example() {
    let data = vec![1, 2, 3, 4, 5];
    let ptr = data.as_ptr() as *const u8;

    unsafe {
        // Cast to different types
        let int_ptr = ptr as *const i32;
        let value = *int_ptr;
        println!("First 4 bytes as i32: {}", value);

        // Cast to mutable
        let mut_ptr = ptr as *mut u8;
        // Note: This is dangerous if the original data is immutable
    }
}
```

### Null Pointers

```rust
fn null_pointers_example() {
    let null_ptr: *const i32 = std::ptr::null();
    let null_mut_ptr: *mut i32 = std::ptr::null_mut();

    println!("Null pointer: {:p}", null_ptr);
    println!("Null mutable pointer: {:p}", null_mut_ptr);

    // Check for null
    if null_ptr.is_null() {
        println!("Pointer is null");
    }

    // Create non-null pointer
    let data = 42;
    let ptr = &data as *const i32;
    println!("Non-null pointer: {:p}", ptr);
}
```

## Unsafe Traits

### Implementing Unsafe Traits

```rust
// Unsafe trait
unsafe trait UnsafeTrait {
    fn dangerous_method(&self);
}

// Safe implementation
struct SafeStruct {
    data: i32,
}

unsafe impl UnsafeTrait for SafeStruct {
    fn dangerous_method(&self) {
        println!("Dangerous method called with data: {}", self.data);
    }
}

fn unsafe_traits_example() {
    let safe_struct = SafeStruct { data: 42 };
    safe_struct.dangerous_method();
}
```

### Send and Sync

```rust
use std::thread;

// Custom type that is not Send by default
struct NotSend {
    data: *const i32,
}

unsafe impl Send for NotSend {}

// Custom type that is not Sync by default
struct NotSync {
    data: *mut i32,
}

unsafe impl Sync for NotSync {}

fn send_sync_example() {
    let data = 42;
    let not_send = NotSend { data: &data };

    // Can now be sent between threads
    thread::spawn(move || {
        println!("NotSend in thread: {:p}", not_send.data);
    }).join().unwrap();
}
```

## Static Variables

### Mutable Static Variables

```rust
use std::sync::Mutex;

// Mutable static variable
static mut COUNTER: i32 = 0;

// Thread-safe mutable static
static THREAD_SAFE_COUNTER: Mutex<i32> = Mutex::new(0);

fn static_variables_example() {
    // Unsafe access to mutable static
    unsafe {
        COUNTER += 1;
        println!("Unsafe counter: {}", COUNTER);
    }

    // Safe access to thread-safe static
    {
        let mut counter = THREAD_SAFE_COUNTER.lock().unwrap();
        *counter += 1;
        println!("Thread-safe counter: {}", *counter);
    }
}
```

### Static Functions

```rust
// Static function that can be called from C
#[no_mangle]
pub extern "C" fn rust_function(x: i32) -> i32 {
    x * 2
}

// Static function with C calling convention
extern "C" fn c_function(x: i32) -> i32 {
    x + 1
}

fn static_functions_example() {
    let result = c_function(42);
    println!("C function result: {}", result);
}
```

## Advanced Unsafe Patterns

### Unsafe Unions

```rust
use std::mem;

// Unsafe union
union IntOrFloat {
    int: i32,
    float: f32,
}

fn unsafe_unions_example() {
    let mut union_data = IntOrFloat { int: 42 };

    unsafe {
        // Access as integer
        println!("As int: {}", union_data.int);

        // Access as float (dangerous!)
        union_data.float = 3.14;
        println!("As float: {}", union_data.float);
    }
}
```

### Unsafe Code in Safe Contexts

```rust
// Safe function that uses unsafe internally
fn safe_string_from_raw(ptr: *const u8, len: usize) -> Option<String> {
    if ptr.is_null() || len == 0 {
        return None;
    }

    unsafe {
        // Create slice from raw parts
        let slice = std::slice::from_raw_parts(ptr, len);

        // Convert to string
        std::str::from_utf8(slice)
            .ok()
            .map(|s| s.to_string())
    }
}

fn safe_unsafe_example() {
    let data = b"Hello, World!";
    let ptr = data.as_ptr();
    let len = data.len();

    if let Some(string) = safe_string_from_raw(ptr, len) {
        println!("String from raw: {}", string);
    }
}
```

## Practical Examples

### Custom Vector Implementation

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;

struct CustomVec<T> {
    ptr: *mut T,
    len: usize,
    cap: usize,
}

impl<T> CustomVec<T> {
    fn new() -> Self {
        Self {
            ptr: ptr::null_mut(),
            len: 0,
            cap: 0,
        }
    }

    fn push(&mut self, item: T) {
        if self.len >= self.cap {
            self.grow();
        }

        unsafe {
            ptr::write(self.ptr.add(self.len), item);
        }
        self.len += 1;
    }

    fn grow(&mut self) {
        let new_cap = if self.cap == 0 { 1 } else { self.cap * 2 };
        let new_layout = Layout::array::<T>(new_cap).unwrap();

        let new_ptr = if self.cap == 0 {
            unsafe { alloc(new_layout) }
        } else {
            let old_layout = Layout::array::<T>(self.cap).unwrap();
            unsafe {
                let new_ptr = alloc(new_layout);
                ptr::copy_nonoverlapping(self.ptr, new_ptr, self.len);
                dealloc(self.ptr as *mut u8, old_layout);
                new_ptr
            }
        };

        self.ptr = new_ptr as *mut T;
        self.cap = new_cap;
    }

    fn get(&self, index: usize) -> Option<&T> {
        if index < self.len {
            unsafe { Some(&*self.ptr.add(index)) }
        } else {
            None
        }
    }
}

impl<T> Drop for CustomVec<T> {
    fn drop(&mut self) {
        if !self.ptr.is_null() {
            unsafe {
                // Drop all elements
                for i in 0..self.len {
                    ptr::drop_in_place(self.ptr.add(i));
                }

                // Deallocate memory
                let layout = Layout::array::<T>(self.cap).unwrap();
                dealloc(self.ptr as *mut u8, layout);
            }
        }
    }
}

fn custom_vec_example() {
    let mut vec = CustomVec::new();
    vec.push(1);
    vec.push(2);
    vec.push(3);

    for i in 0..3 {
        if let Some(value) = vec.get(i) {
            println!("Element {}: {}", i, value);
        }
    }
}
```

## Safety Guidelines

### Unsafe Code Best Practices

```rust
// 1. Minimize unsafe code
fn safe_abstraction() {
    // Keep unsafe code in small, well-tested functions
    let result = unsafe_operation();
    // Use result safely
}

unsafe fn unsafe_operation() -> i32 {
    // Minimal unsafe code
    42
}

// 2. Document safety invariants
/// # Safety
///
/// This function is safe to call if:
/// - `ptr` is not null
/// - `ptr` points to valid memory
/// - `len` is the correct length
unsafe fn safe_raw_slice(ptr: *const u8, len: usize) -> &[u8] {
    std::slice::from_raw_parts(ptr, len)
}

// 3. Use safe wrappers
struct SafeWrapper {
    data: *mut i32,
}

impl SafeWrapper {
    fn new(value: i32) -> Self {
        let layout = Layout::new::<i32>();
        let ptr = unsafe { alloc(layout) as *mut i32 };
        unsafe { ptr::write(ptr, value); }

        Self { data: ptr }
    }

    fn get(&self) -> i32 {
        unsafe { *self.data }
    }

    fn set(&mut self, value: i32) {
        unsafe { *self.data = value; }
    }
}

impl Drop for SafeWrapper {
    fn drop(&mut self) {
        unsafe {
            ptr::drop_in_place(self.data);
            let layout = Layout::new::<i32>();
            dealloc(self.data as *mut u8, layout);
        }
    }
}
```

## Key Takeaways

- **Unsafe Rust** allows bypassing safety guarantees when necessary
- **Raw pointers** provide direct memory access but require careful handling
- **Unsafe functions** should be wrapped in safe abstractions
- **Memory manipulation** requires understanding of Rust's memory model
- **Safety invariants** must be documented and maintained
- **Minimize unsafe code** and keep it well-tested

## Next Steps

- Learn about **FFI integration** for C interop
- Explore **operating system integration** for system programming
- Study **device drivers** and hardware interfaces
- Practice with **performance optimization** techniques

## Resources

- [The Rust Book - Unsafe Rust](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [The Rustonomicon](https://doc.rust-lang.org/nomicon/)
- [Rust Reference - Unsafe Operations](https://doc.rust-lang.org/reference/unsafe.html)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
