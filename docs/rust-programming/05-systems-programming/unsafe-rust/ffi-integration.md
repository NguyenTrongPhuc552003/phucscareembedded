---
sidebar_position: 2
---

# FFI Integration

Master Foreign Function Interface (FFI) integration in Rust with comprehensive explanations using the 4W+H framework.

## What Is FFI Integration?

**What**: FFI (Foreign Function Interface) integration allows Rust code to call functions written in other languages (primarily C) and enables other languages to call Rust functions, enabling interoperability between different programming languages.

**Why**: FFI integration is essential because:

- **Legacy Code**: Interfacing with existing C libraries and codebases
- **Performance**: Leveraging highly optimized C libraries
- **System APIs**: Accessing operating system functions and system calls
- **Hardware Access**: Direct hardware manipulation through C drivers
- **Ecosystem**: Using mature libraries from other language ecosystems
- **Cross-language**: Building polyglot applications

**When**: Use FFI integration when:

- Calling C functions from Rust
- Exposing Rust functions to C
- Working with system libraries
- Accessing hardware drivers
- Using performance-critical C libraries
- Building language bindings

**Where**: FFI integration is used in:

- Operating system kernels and drivers
- Embedded systems and microcontrollers
- High-performance computing applications
- Game engines and graphics programming
- Database systems and file systems
- Network programming and protocols

**How**: FFI integration is implemented through:

- External function declarations
- Calling conventions and ABI compatibility
- Data type mappings between languages
- Memory management across language boundaries
- Error handling and exception propagation

## Basic FFI Concepts

### External Function Declarations

```rust
use std::ffi::{CString, CStr};
use std::os::raw::{c_char, c_int};

// Declare external C functions
extern "C" {
    fn strlen(s: *const c_char) -> usize;
    fn printf(format: *const c_char, ...) -> c_int;
}

// Safe wrapper for strlen
fn safe_strlen(s: &str) -> usize {
    let c_string = CString::new(s).unwrap();
    unsafe { strlen(c_string.as_ptr()) }
}

fn basic_ffi_example() {
    let text = "Hello, World!";
    let length = safe_strlen(text);
    println!("Length of '{}': {}", text, length);
}
```

### Calling Conventions

```rust
// Different calling conventions
extern "C" {
    // Standard C calling convention
    fn c_function(x: c_int) -> c_int;
}

extern "stdcall" {
    // Windows stdcall convention
    fn stdcall_function(x: c_int) -> c_int;
}

extern "fastcall" {
    // Fastcall convention
    fn fastcall_function(x: c_int) -> c_int;
}

// Rust functions with C calling convention
#[no_mangle]
pub extern "C" fn rust_function(x: c_int) -> c_int {
    x * 2
}

fn calling_conventions_example() {
    // Call C functions (if available)
    // let result = unsafe { c_function(42) };
    // println!("C function result: {}", result);

    // Rust function can be called from C
    let result = rust_function(21);
    println!("Rust function result: {}", result);
}
```

## Data Type Mappings

### Primitive Types

```rust
use std::os::raw::*;

fn primitive_types_example() {
    // Rust to C type mappings
    let rust_i32: i32 = 42;
    let c_int: c_int = rust_i32;

    let rust_f64: f64 = 3.14;
    let c_double: c_double = rust_f64;

    let rust_bool: bool = true;
    let c_bool: c_uchar = rust_bool as c_uchar;

    println!("i32: {} -> c_int: {}", rust_i32, c_int);
    println!("f64: {} -> c_double: {}", rust_f64, c_double);
    println!("bool: {} -> c_uchar: {}", rust_bool, c_bool);
}
```

### String Handling

```rust
use std::ffi::{CString, CStr};
use std::os::raw::c_char;

// C function that takes a string
extern "C" {
    fn puts(s: *const c_char) -> c_int;
}

fn string_handling_example() {
    // Rust string to C string
    let rust_string = "Hello from Rust!";
    let c_string = CString::new(rust_string).unwrap();

    unsafe {
        puts(c_string.as_ptr());
    }

    // C string to Rust string
    let c_str = unsafe { CStr::from_ptr(c_string.as_ptr()) };
    let rust_str = c_str.to_str().unwrap();
    println!("C string converted back: {}", rust_str);
}
```

### Array Handling

```rust
use std::os::raw::c_int;

// C function that takes an array
extern "C" {
    fn sum_array(arr: *const c_int, len: c_int) -> c_int;
}

fn array_handling_example() {
    let rust_array = vec![1, 2, 3, 4, 5];

    unsafe {
        let sum = sum_array(rust_array.as_ptr(), rust_array.len() as c_int);
        println!("Sum of array: {}", sum);
    }
}
```

## Advanced FFI Patterns

### Struct Interop

```rust
use std::os::raw::{c_int, c_char};
use std::ffi::CString;

// C struct definition
#[repr(C)]
struct CStruct {
    id: c_int,
    name: *const c_char,
    value: c_int,
}

// Rust equivalent
#[derive(Debug)]
struct RustStruct {
    id: i32,
    name: String,
    value: i32,
}

// Convert Rust struct to C struct
fn rust_to_c_struct(rust_struct: &RustStruct) -> CStruct {
    let c_name = CString::new(rust_struct.name.clone()).unwrap();
    CStruct {
        id: rust_struct.id,
        name: c_name.as_ptr(),
        value: rust_struct.value,
    }
}

// Convert C struct to Rust struct
unsafe fn c_to_rust_struct(c_struct: &CStruct) -> RustStruct {
    let name = CStr::from_ptr(c_struct.name).to_string_lossy().to_string();
    RustStruct {
        id: c_struct.id,
        name,
        value: c_struct.value,
    }
}

fn struct_interop_example() {
    let rust_struct = RustStruct {
        id: 1,
        name: "Test".to_string(),
        value: 42,
    };

    let c_struct = rust_to_c_struct(&rust_struct);
    println!("C struct: id={}, value={}", c_struct.id, c_struct.value);

    let converted_back = unsafe { c_to_rust_struct(&c_struct) };
    println!("Converted back: {:?}", converted_back);
}
```

### Callback Functions

```rust
use std::os::raw::{c_int, c_void};
use std::ffi::CString;

// C callback type
type CallbackFn = extern "C" fn(data: *const c_void, result: *mut c_int) -> c_int;

// C function that takes a callback
extern "C" {
    fn process_with_callback(
        data: *const c_void,
        callback: CallbackFn,
        result: *mut c_int,
    ) -> c_int;
}

// Rust callback function
extern "C" fn rust_callback(data: *const c_void, result: *mut c_int) -> c_int {
    unsafe {
        let value = *(data as *const c_int);
        *result = value * 2;
        0 // Success
    }
}

fn callback_example() {
    let data = 42;
    let mut result = 0;

    unsafe {
        let status = process_with_callback(
            &data as *const c_int as *const c_void,
            rust_callback,
            &mut result,
        );

        if status == 0 {
            println!("Callback result: {}", result);
        }
    }
}
```

### Error Handling

```rust
use std::os::raw::{c_int, c_char};
use std::ffi::{CString, CStr};

// C function that can fail
extern "C" {
    fn risky_operation(input: *const c_char) -> c_int;
    fn get_last_error() -> *const c_char;
}

// Rust error type
#[derive(Debug)]
enum FFIError {
    OperationFailed(String),
    InvalidInput,
}

// Safe wrapper with error handling
fn safe_risky_operation(input: &str) -> Result<i32, FFIError> {
    let c_input = CString::new(input).map_err(|_| FFIError::InvalidInput)?;

    let result = unsafe { risky_operation(c_input.as_ptr()) };

    if result < 0 {
        let error_msg = unsafe {
            CStr::from_ptr(get_last_error()).to_string_lossy().to_string()
        };
        Err(FFIError::OperationFailed(error_msg))
    } else {
        Ok(result)
    }
}

fn error_handling_example() {
    match safe_risky_operation("test input") {
        Ok(result) => println!("Operation succeeded: {}", result),
        Err(FFIError::OperationFailed(msg)) => println!("Operation failed: {}", msg),
        Err(FFIError::InvalidInput) => println!("Invalid input"),
    }
}
```

## Memory Management

### Manual Memory Management

```rust
use std::alloc::{alloc, dealloc, Layout};
use std::os::raw::c_void;

// C function that allocates memory
extern "C" {
    fn c_alloc(size: usize) -> *mut c_void;
    fn c_free(ptr: *mut c_void);
}

// Safe wrapper for C memory allocation
struct CMemory {
    ptr: *mut c_void,
    size: usize,
}

impl CMemory {
    fn new(size: usize) -> Option<Self> {
        let ptr = unsafe { c_alloc(size) };
        if ptr.is_null() {
            None
        } else {
            Some(Self { ptr, size })
        }
    }

    fn as_slice(&self) -> &[u8] {
        unsafe { std::slice::from_raw_parts(self.ptr as *const u8, self.size) }
    }

    fn as_mut_slice(&mut self) -> &mut [u8] {
        unsafe { std::slice::from_raw_parts_mut(self.ptr as *mut u8, self.size) }
    }
}

impl Drop for CMemory {
    fn drop(&mut self) {
        unsafe { c_free(self.ptr) };
    }
}

fn memory_management_example() {
    let mut c_memory = CMemory::new(1024).unwrap();

    // Use the memory
    let slice = c_memory.as_mut_slice();
    slice[0] = 42;
    slice[1] = 24;

    println!("First byte: {}", slice[0]);
    println!("Second byte: {}", slice[1]);

    // Memory is automatically freed when CMemory goes out of scope
}
```

### Reference Counting

```rust
use std::os::raw::c_void;
use std::sync::Arc;

// C object with reference counting
extern "C" {
    fn c_object_new() -> *mut c_void;
    fn c_object_ref(obj: *mut c_void);
    fn c_object_unref(obj: *mut c_void);
    fn c_object_get_value(obj: *mut c_void) -> i32;
}

// Safe wrapper with reference counting
struct CObject {
    ptr: *mut c_void,
}

impl CObject {
    fn new() -> Option<Self> {
        let ptr = unsafe { c_object_new() };
        if ptr.is_null() {
            None
        } else {
            Some(Self { ptr })
        }
    }

    fn get_value(&self) -> i32 {
        unsafe { c_object_get_value(self.ptr) }
    }
}

impl Clone for CObject {
    fn clone(&self) -> Self {
        unsafe { c_object_ref(self.ptr) };
        Self { ptr: self.ptr }
    }
}

impl Drop for CObject {
    fn drop(&mut self) {
        unsafe { c_object_unref(self.ptr) };
    }
}

fn reference_counting_example() {
    let obj1 = CObject::new().unwrap();
    let obj2 = obj1.clone(); // Reference count increased

    println!("Value: {}", obj1.get_value());
    println!("Value: {}", obj2.get_value());

    // Reference count decreased when objects go out of scope
}
```

## Practical FFI Examples

### System Call Wrapper

```rust
use std::os::raw::{c_int, c_char};
use std::ffi::CString;

// System call wrapper
extern "C" {
    fn syscall(number: c_int, ...) -> c_int;
}

// Safe wrapper for system calls
fn safe_syscall(number: i32, arg1: i32) -> Result<i32, String> {
    let result = unsafe { syscall(number, arg1) };

    if result < 0 {
        Err(format!("System call failed with error: {}", result))
    } else {
        Ok(result)
    }
}

fn system_call_example() {
    // Example system call (getpid)
    match safe_syscall(39, 0) { // SYS_getpid = 39 on x86_64
        Ok(pid) => println!("Process ID: {}", pid),
        Err(e) => println!("Error: {}", e),
    }
}
```

### Library Binding

```rust
use std::os::raw::{c_int, c_char};
use std::ffi::{CString, CStr};

// Hypothetical C library functions
extern "C" {
    fn lib_init() -> c_int;
    fn lib_cleanup();
    fn lib_process_data(data: *const c_char, len: c_int) -> c_int;
    fn lib_get_result(buffer: *mut c_char, size: c_int) -> c_int;
}

// Safe wrapper for the library
struct CLibrary {
    initialized: bool,
}

impl CLibrary {
    fn new() -> Result<Self, String> {
        let result = unsafe { lib_init() };
        if result == 0 {
            Ok(Self { initialized: true })
        } else {
            Err("Failed to initialize library".to_string())
        }
    }

    fn process_data(&self, data: &str) -> Result<String, String> {
        if !self.initialized {
            return Err("Library not initialized".to_string());
        }

        let c_data = CString::new(data).unwrap();
        let result = unsafe { lib_process_data(c_data.as_ptr(), data.len() as c_int) };

        if result == 0 {
            // Get the result
            let mut buffer = vec![0u8; 1024];
            let result_len = unsafe { lib_get_result(buffer.as_mut_ptr() as *mut c_char, buffer.len() as c_int) };

            if result_len > 0 {
                let result_str = unsafe { CStr::from_ptr(buffer.as_ptr() as *const c_char) };
                Ok(result_str.to_string_lossy().to_string())
            } else {
                Err("Failed to get result".to_string())
            }
        } else {
            Err("Processing failed".to_string())
        }
    }
}

impl Drop for CLibrary {
    fn drop(&mut self) {
        if self.initialized {
            unsafe { lib_cleanup(); }
        }
    }
}

fn library_binding_example() {
    let lib = CLibrary::new().unwrap();

    match lib.process_data("Hello, World!") {
        Ok(result) => println!("Processed result: {}", result),
        Err(e) => println!("Error: {}", e),
    }
}
```

## Key Takeaways

- **FFI integration** enables interoperability between Rust and other languages
- **Calling conventions** must match between languages
- **Data type mappings** require careful attention to memory layout
- **Memory management** across language boundaries needs special care
- **Error handling** should be consistent and safe
- **Safe wrappers** should encapsulate unsafe FFI code

## Next Steps

- Learn about **operating system integration** for system programming
- Explore **device drivers** and hardware interfaces
- Study **performance optimization** techniques
- Practice with **real-world FFI projects**

## Resources

- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
- [Rust FFI Omnibus](http://jakegoulding.com/rust-ffi-omnibus/)
- [The Rustonomicon - FFI](https://doc.rust-lang.org/nomicon/ffi.html)
