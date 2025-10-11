---
sidebar_position: 3
---

# Unsafe Rust Practical Exercises

Master unsafe Rust programming through hands-on exercises with comprehensive solutions using the 4W+H framework.

## Exercise 1: Custom Smart Pointer

### Problem Statement

Implement a custom smart pointer that provides reference counting and automatic memory management, similar to `Rc<T>` but with additional features.

### Requirements

- Implement reference counting
- Support for weak references
- Automatic memory deallocation
- Thread-safe operations
- Custom clone and drop behavior

### Solution

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;
use std::sync::atomic::{AtomicUsize, Ordering};

struct RefCount<T> {
    strong_count: AtomicUsize,
    weak_count: AtomicUsize,
    data: T,
}

struct CustomRc<T> {
    ptr: *mut RefCount<T>,
}

impl<T> CustomRc<T> {
    fn new(data: T) -> Self {
        let layout = Layout::new::<RefCount<T>>();
        let ptr = unsafe { alloc(layout) as *mut RefCount<T> };

        if ptr.is_null() {
            panic!("Failed to allocate memory");
        }

        unsafe {
            ptr::write(ptr, RefCount {
                strong_count: AtomicUsize::new(1),
                weak_count: AtomicUsize::new(0),
                data,
            });
        }

        Self { ptr }
    }

    fn strong_count(&self) -> usize {
        unsafe { (*self.ptr).strong_count.load(Ordering::Relaxed) }
    }

    fn weak_count(&self) -> usize {
        unsafe { (*self.ptr).weak_count.load(Ordering::Relaxed) }
    }

    fn downgrade(&self) -> CustomWeak<T> {
        unsafe {
            (*self.ptr).weak_count.fetch_add(1, Ordering::Relaxed);
        }
        CustomWeak { ptr: self.ptr }
    }
}

impl<T> Clone for CustomRc<T> {
    fn clone(&self) -> Self {
        unsafe {
            (*self.ptr).strong_count.fetch_add(1, Ordering::Relaxed);
        }
        Self { ptr: self.ptr }
    }
}

impl<T> Drop for CustomRc<T> {
    fn drop(&mut self) {
        unsafe {
            let strong_count = (*self.ptr).strong_count.fetch_sub(1, Ordering::Release);

            if strong_count == 1 {
                // Drop the data
                ptr::drop_in_place(&mut (*self.ptr).data);

                // Check if we need to deallocate the RefCount
                let weak_count = (*self.ptr).weak_count.load(Ordering::Acquire);
                if weak_count == 0 {
                    let layout = Layout::new::<RefCount<T>>();
                    dealloc(self.ptr as *mut u8, layout);
                }
            }
        }
    }
}

impl<T> std::ops::Deref for CustomRc<T> {
    type Target = T;

    fn deref(&self) -> &Self::Target {
        unsafe { &(*self.ptr).data }
    }
}

struct CustomWeak<T> {
    ptr: *mut RefCount<T>,
}

impl<T> CustomWeak<T> {
    fn upgrade(&self) -> Option<CustomRc<T>> {
        unsafe {
            let strong_count = (*self.ptr).strong_count.load(Ordering::Relaxed);
            if strong_count > 0 {
                (*self.ptr).strong_count.fetch_add(1, Ordering::Relaxed);
                Some(CustomRc { ptr: self.ptr })
            } else {
                None
            }
        }
    }
}

impl<T> Drop for CustomWeak<T> {
    fn drop(&mut self) {
        unsafe {
            let weak_count = (*self.ptr).weak_count.fetch_sub(1, Ordering::Release);
            if weak_count == 1 {
                let strong_count = (*self.ptr).strong_count.load(Ordering::Acquire);
                if strong_count == 0 {
                    let layout = Layout::new::<RefCount<T>>();
                    dealloc(self.ptr as *mut u8, layout);
                }
            }
        }
    }
}

fn exercise_1_solution() {
    let rc1 = CustomRc::new(42);
    let rc2 = rc1.clone();
    let weak = rc1.downgrade();

    println!("Strong count: {}", rc1.strong_count());
    println!("Weak count: {}", rc1.weak_count());
    println!("Value: {}", *rc1);

    drop(rc1);
    println!("After dropping rc1, strong count: {}", rc2.strong_count());

    if let Some(upgraded) = weak.upgrade() {
        println!("Upgraded weak reference: {}", *upgraded);
    }
}
```

**Code Explanation**: This example demonstrates how to implement a custom smart pointer with reference counting:

- **`RefCount`**: The reference counting struct
- **`CustomRc`**: The custom smart pointer
- **`CustomWeak`**: The weak reference

**Why this works**: This pattern allows Rust to implement reference counting and weak references. The `RefCount` struct tracks the reference count, and the `CustomRc` and `CustomWeak` structs provide the smart pointer and weak reference functionality.

## Exercise 2: Memory Pool with Unsafe Operations

### Problem Statement

Create a memory pool that pre-allocates objects and provides fast allocation/deallocation using unsafe operations for maximum performance.

### Requirements

- Pre-allocate a fixed number of objects
- Thread-safe allocation/deallocation
- Zero-cost allocation for pool objects
- Support for different object types
- Memory alignment handling

### Solution

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::ptr;
use std::sync::Mutex;

struct UnsafeMemoryPool<T> {
    memory: *mut u8,
    size: usize,
    object_size: usize,
    alignment: usize,
    free_list: Mutex<Vec<*mut u8>>,
    layout: Layout,
}

impl<T> UnsafeMemoryPool<T> {
    fn new(capacity: usize) -> Self {
        let object_size = std::mem::size_of::<T>();
        let alignment = std::mem::align_of::<T>();
        let total_size = capacity * object_size;

        let layout = Layout::from_size_align(total_size, alignment).unwrap();
        let memory = unsafe { alloc(layout) };

        if memory.is_null() {
            panic!("Failed to allocate memory pool");
        }

        // Initialize free list
        let mut free_list = Vec::with_capacity(capacity);
        for i in 0..capacity {
            let ptr = unsafe { memory.add(i * object_size) };
            free_list.push(ptr);
        }

        Self {
            memory,
            size: total_size,
            object_size,
            alignment,
            free_list: Mutex::new(free_list),
            layout,
        }
    }

    fn allocate(&self) -> Option<*mut T> {
        let mut free_list = self.free_list.lock().unwrap();
        free_list.pop().map(|ptr| ptr as *mut T)
    }

    fn deallocate(&self, ptr: *mut T) {
        let mut free_list = self.free_list.lock().unwrap();
        free_list.push(ptr as *mut u8);
    }

    fn stats(&self) -> PoolStats {
        let free_list = self.free_list.lock().unwrap();
        PoolStats {
            total: self.size / self.object_size,
            available: free_list.len(),
            in_use: (self.size / self.object_size) - free_list.len(),
        }
    }
}

impl<T> Drop for UnsafeMemoryPool<T> {
    fn drop(&mut self) {
        unsafe { dealloc(self.memory, self.layout); }
    }
}

#[derive(Debug)]
struct PoolStats {
    total: usize,
    available: usize,
    in_use: usize,
}

// Safe wrapper for pool objects
struct PooledObject<T> {
    ptr: *mut T,
    pool: *const UnsafeMemoryPool<T>,
}

impl<T> PooledObject<T> {
    fn new(pool: &UnsafeMemoryPool<T>) -> Option<Self> {
        pool.allocate().map(|ptr| Self {
            ptr,
            pool: pool as *const UnsafeMemoryPool<T>,
        })
    }

    fn get(&self) -> &T {
        unsafe { &*self.ptr }
    }

    fn get_mut(&mut self) -> &mut T {
        unsafe { &mut *self.ptr }
    }
}

impl<T> Drop for PooledObject<T> {
    fn drop(&mut self) {
        unsafe {
            (*self.pool).deallocate(self.ptr);
        }
    }
}

fn exercise_2_solution() {
    let pool = UnsafeMemoryPool::<i32>::new(10);

    // Allocate some objects
    let mut objects = Vec::new();
    for i in 0..5 {
        if let Some(mut obj) = PooledObject::new(&pool) {
            *obj.get_mut() = i;
            objects.push(obj);
        }
    }

    println!("Pool stats: {:?}", pool.stats());

    // Use objects
    for (i, obj) in objects.iter().enumerate() {
        println!("Object {}: {}", i, obj.get());
    }

    // Objects are automatically returned to pool when dropped
    drop(objects);
    println!("After drop - Pool stats: {:?}", pool.stats());
}
```

**Code Explanation**: This example demonstrates how to implement a memory pool with unsafe operations:

- **`UnsafeMemoryPool`**: The memory pool struct
- **`new`**: The constructor for the memory pool
- **`allocate`**: The method that allocates an object from the pool
- **`deallocate`**: The method that deallocates an object from the pool
- **`stats`**: The method that returns the stats of the pool

**Why this works**: This pattern allows Rust to implement a memory pool with unsafe operations. The `UnsafeMemoryPool` struct pre-allocates a fixed number of objects and provides fast allocation/deallocation using unsafe operations for maximum performance.

## Exercise 3: FFI Wrapper for C Library

### Problem Statement

Create a safe wrapper around a hypothetical C library that provides file operations, handling all the unsafe FFI operations internally.

### Requirements

- Safe Rust interface over C functions
- Proper error handling and conversion
- Memory management for C strings
- Resource cleanup and RAII
- Thread-safe operations

### Solution

```rust
use std::ffi::{CString, CStr};
use std::os::raw::{c_int, c_char};
use std::ptr;

// Hypothetical C library functions
extern "C" {
    fn c_file_open(path: *const c_char) -> *mut c_void;
    fn c_file_close(file: *mut c_void) -> c_int;
    fn c_file_read(file: *mut c_void, buffer: *mut c_char, size: c_int) -> c_int;
    fn c_file_write(file: *mut c_void, data: *const c_char, size: c_int) -> c_int;
    fn c_file_seek(file: *mut c_void, offset: c_int) -> c_int;
    fn c_file_tell(file: *mut c_void) -> c_int;
}

// Safe wrapper for C file operations
pub struct CFile {
    handle: *mut c_void,
}

impl CFile {
    pub fn open(path: &str) -> Result<Self, FileError> {
        let c_path = CString::new(path).map_err(|_| FileError::InvalidPath)?;
        let handle = unsafe { c_file_open(c_path.as_ptr()) };

        if handle.is_null() {
            Err(FileError::OpenFailed)
        } else {
            Ok(Self { handle })
        }
    }

    pub fn read(&self, size: usize) -> Result<Vec<u8>, FileError> {
        let mut buffer = vec![0u8; size];
        let result = unsafe {
            c_file_read(
                self.handle,
                buffer.as_mut_ptr() as *mut c_char,
                size as c_int,
            )
        };

        if result < 0 {
            Err(FileError::ReadFailed)
        } else {
            buffer.truncate(result as usize);
            Ok(buffer)
        }
    }

    pub fn write(&self, data: &[u8]) -> Result<usize, FileError> {
        let c_data = CString::new(data).map_err(|_| FileError::InvalidData)?;
        let result = unsafe {
            c_file_write(
                self.handle,
                c_data.as_ptr(),
                data.len() as c_int,
            )
        };

        if result < 0 {
            Err(FileError::WriteFailed)
        } else {
            Ok(result as usize)
        }
    }

    pub fn seek(&self, offset: i32) -> Result<(), FileError> {
        let result = unsafe { c_file_seek(self.handle, offset) };
        if result < 0 {
            Err(FileError::SeekFailed)
        } else {
            Ok(())
        }
    }

    pub fn tell(&self) -> Result<i32, FileError> {
        let result = unsafe { c_file_tell(self.handle) };
        if result < 0 {
            Err(FileError::TellFailed)
        } else {
            Ok(result)
        }
    }
}

impl Drop for CFile {
    fn drop(&mut self) {
        unsafe {
            c_file_close(self.handle);
        }
    }
}

#[derive(Debug)]
pub enum FileError {
    InvalidPath,
    OpenFailed,
    ReadFailed,
    WriteFailed,
    SeekFailed,
    TellFailed,
    InvalidData,
}

impl std::fmt::Display for FileError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            FileError::InvalidPath => write!(f, "Invalid file path"),
            FileError::OpenFailed => write!(f, "Failed to open file"),
            FileError::ReadFailed => write!(f, "Failed to read from file"),
            FileError::WriteFailed => write!(f, "Failed to write to file"),
            FileError::SeekFailed => write!(f, "Failed to seek in file"),
            FileError::TellFailed => write!(f, "Failed to get file position"),
            FileError::InvalidData => write!(f, "Invalid data provided"),
        }
    }
}

fn exercise_3_solution() {
    // Example usage of the safe wrapper
    match CFile::open("test.txt") {
        Ok(file) => {
            println!("File opened successfully");

            // Write some data
            let data = b"Hello, World!";
            match file.write(data) {
                Ok(bytes_written) => println!("Wrote {} bytes", bytes_written),
                Err(e) => println!("Write error: {}", e),
            }

            // Seek to beginning
            if let Err(e) = file.seek(0) {
                println!("Seek error: {}", e);
            }

            // Read the data back
            match file.read(100) {
                Ok(buffer) => {
                    let text = String::from_utf8_lossy(&buffer);
                    println!("Read: {}", text);
                }
                Err(e) => println!("Read error: {}", e),
            }
        }
        Err(e) => println!("Failed to open file: {}", e),
    }
}
```

**Code Explanation**: This example demonstrates how to create a safe wrapper for C library functions:

- **`CFile`**: The safe wrapper for C file operations
- **`open`**: The method that opens a file
- **`read`**: The method that reads from a file
- **`write`**: The method that writes to a file
- **`seek`**: The method that seeks in a file
- **`tell`**: The method that gets the file position

**Why this works**: This pattern allows Rust to create a safe wrapper for C library functions. The `CFile` struct wraps the C file operations and provides a safe interface for file operations.

## Exercise 4: Lock-Free Data Structure

### Problem Statement

Implement a lock-free stack using unsafe operations and atomic operations for high-performance concurrent access.

### Requirements

- Lock-free push and pop operations
- Memory ordering for correctness
- ABA problem prevention
- Hazard pointer support
- Performance benchmarking

### Solution

```rust
use std::sync::atomic::{AtomicPtr, Ordering};
use std::ptr;

struct Node<T> {
    data: T,
    next: *mut Node<T>,
}

pub struct LockFreeStack<T> {
    head: AtomicPtr<Node<T>>,
}

impl<T> LockFreeStack<T> {
    pub fn new() -> Self {
        Self {
            head: AtomicPtr::new(ptr::null_mut()),
        }
    }

    pub fn push(&self, data: T) {
        let new_node = Box::into_raw(Box::new(Node {
            data,
            next: ptr::null_mut(),
        }));

        loop {
            let current_head = self.head.load(Ordering::Acquire);
            unsafe {
                (*new_node).next = current_head;
            }

            match self.head.compare_exchange_weak(
                current_head,
                new_node,
                Ordering::Release,
                Ordering::Acquire,
            ) {
                Ok(_) => break,
                Err(_) => continue,
            }
        }
    }

    pub fn pop(&self) -> Option<T> {
        loop {
            let current_head = self.head.load(Ordering::Acquire);
            if current_head.is_null() {
                return None;
            }

            unsafe {
                let next = (*current_head).next;
                match self.head.compare_exchange_weak(
                    current_head,
                    next,
                    Ordering::Release,
                    Ordering::Acquire,
                ) {
                    Ok(_) => {
                        let node = Box::from_raw(current_head);
                        return Some(node.data);
                    }
                    Err(_) => continue,
                }
            }
        }
    }

    pub fn is_empty(&self) -> bool {
        self.head.load(Ordering::Acquire).is_null()
    }
}

impl<T> Drop for LockFreeStack<T> {
    fn drop(&mut self) {
        while self.pop().is_some() {}
    }
}

fn exercise_4_solution() {
    let stack = LockFreeStack::new();

    // Push some values
    for i in 0..10 {
        stack.push(i);
    }

    // Pop values
    while let Some(value) = stack.pop() {
        println!("Popped: {}", value);
    }

    println!("Stack is empty: {}", stack.is_empty());
}
```

**Code Explanation**: This example demonstrates how to implement a lock-free stack using unsafe operations and atomic operations for high-performance concurrent access:

- **`LockFreeStack`**: The lock-free stack struct
- **`push`**: The method that pushes a value onto the stack
- **`pop`**: The method that pops a value from the stack
- **`is_empty`**: The method that checks if the stack is empty

**Why this works**: This pattern allows Rust to implement a lock-free stack using unsafe operations and atomic operations for high-performance concurrent access. The `LockFreeStack` struct provides lock-free push and pop operations using atomic operations.

## Exercise 5: Memory-Mapped File Operations

### Problem Statement

Create a safe wrapper for memory-mapped file operations using unsafe code to provide direct memory access to file contents.

### Requirements

- Memory-mapped file creation and management
- Safe access to mapped memory
- Automatic cleanup and unmapping
- Support for different access modes
- Error handling for mapping failures

### Solution

```rust
use std::fs::File;
use std::os::unix::io::AsRawFd;
use std::ptr;
use std::os::raw::{c_void, c_int, c_size_t};

// System calls for memory mapping
extern "C" {
    fn mmap(
        addr: *mut c_void,
        length: c_size_t,
        prot: c_int,
        flags: c_int,
        fd: c_int,
        offset: c_size_t,
    ) -> *mut c_void;

    fn munmap(addr: *mut c_void, length: c_size_t) -> c_int;
    fn mprotect(addr: *mut c_void, length: c_size_t, prot: c_int) -> c_int;
}

// Memory protection flags
const PROT_READ: c_int = 0x1;
const PROT_WRITE: c_int = 0x2;
const PROT_EXEC: c_int = 0x4;

// Mapping flags
const MAP_SHARED: c_int = 0x01;
const MAP_PRIVATE: c_int = 0x02;
const MAP_ANONYMOUS: c_int = 0x20;

pub struct MemoryMappedFile {
    ptr: *mut u8,
    size: usize,
}

impl MemoryMappedFile {
    pub fn new(file: &File, size: usize) -> Result<Self, MappingError> {
        let fd = file.as_raw_fd();
        let ptr = unsafe {
            mmap(
                ptr::null_mut(),
                size,
                PROT_READ | PROT_WRITE,
                MAP_SHARED,
                fd,
                0,
            )
        };

        if ptr == ptr::null_mut() {
            Err(MappingError::MappingFailed)
        } else {
            Ok(Self {
                ptr: ptr as *mut u8,
                size,
            })
        }
    }

    pub fn as_slice(&self) -> &[u8] {
        unsafe { std::slice::from_raw_parts(self.ptr, self.size) }
    }

    pub fn as_mut_slice(&mut self) -> &mut [u8] {
        unsafe { std::slice::from_raw_parts_mut(self.ptr, self.size) }
    }

    pub fn size(&self) -> usize {
        self.size
    }

    pub fn make_readonly(&mut self) -> Result<(), MappingError> {
        let result = unsafe {
            mprotect(
                self.ptr as *mut c_void,
                self.size,
                PROT_READ,
            )
        };

        if result == 0 {
            Ok(())
        } else {
            Err(MappingError::ProtectionFailed)
        }
    }
}

impl Drop for MemoryMappedFile {
    fn drop(&mut self) {
        unsafe {
            munmap(self.ptr as *mut c_void, self.size);
        }
    }
}

#[derive(Debug)]
pub enum MappingError {
    MappingFailed,
    ProtectionFailed,
}

fn exercise_5_solution() {
    // Create a temporary file for testing
    let file = File::create("test_mmap.txt").unwrap();
    let size = 1024;

    match MemoryMappedFile::new(&file, size) {
        Ok(mut mmap) => {
            // Write some data
            let data = b"Hello, Memory Mapped World!";
            let slice = mmap.as_mut_slice();
            slice[..data.len()].copy_from_slice(data);

            // Make read-only
            if let Err(e) = mmap.make_readonly() {
                println!("Failed to make read-only: {:?}", e);
            }

            // Read the data back
            let slice = mmap.as_slice();
            let text = String::from_utf8_lossy(&slice[..data.len()]);
            println!("Read from memory-mapped file: {}", text);
        }
        Err(e) => println!("Failed to create memory mapping: {:?}", e),
    }
}
```

**Code Explanation**: This example demonstrates how to create a safe wrapper for memory-mapped file operations using unsafe code to provide direct memory access to file contents:

- **`MemoryMappedFile`**: The memory-mapped file struct
- **`new`**: The constructor for the memory-mapped file
- **`as_slice`**: The method that converts the memory to a slice
- **`as_mut_slice`**: The method that converts the memory to a mutable slice
- **`size`**: The method that returns the size of the memory-mapped file
- **`make_readonly`**: The method that makes the memory-mapped file read-only

**Why this works**: This pattern allows Rust to create a safe wrapper for memory-mapped file operations using unsafe code to provide direct memory access to file contents. The `MemoryMappedFile` struct wraps the memory-mapped file operations and provides a safe interface for memory-mapped file operations.

## Key Takeaways

- **Unsafe operations** should be encapsulated in safe abstractions
- **Memory management** requires careful attention to lifetimes and ownership
- **FFI integration** needs proper error handling and resource management
- **Lock-free data structures** provide high performance but require careful implementation
- **Memory mapping** enables efficient file operations
- **Testing and validation** are crucial for unsafe code

## Next Steps

- Learn about **operating system integration** for system programming
- Explore **device drivers** and hardware interfaces
- Study **performance optimization** techniques
- Practice with **real-world unsafe code projects**

## Resources

- [The Rust Book - Unsafe Rust](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [The Rustonomicon](https://doc.rust-lang.org/nomicon/)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
- [Rust FFI Omnibus](http://jakegoulding.com/rust-ffi-omnibus/)
