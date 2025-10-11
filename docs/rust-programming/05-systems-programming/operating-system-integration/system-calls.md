---
sidebar_position: 1
---

# System Calls

Master system calls in Rust with comprehensive explanations using the 4W+H framework.

## Basic System Call Concepts

### System Call Interface

**What**: The system call interface is the interface of the system call.

**Why**: This is essential because it ensures that the system call is properly interfaced.

**When**: Use the system call interface when interfacing the system call.

**How**: The system call interface is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::{c_int, c_void};
use std::ptr;

// System call wrapper
extern "C" {
    fn syscall(number: c_int, ...) -> c_int;
}

// Common system call numbers (Linux x86_64)
const SYS_READ: c_int = 0;
const SYS_WRITE: c_int = 1;
const SYS_OPEN: c_int = 2;
const SYS_CLOSE: c_int = 3;
const SYS_GETPID: c_int = 39;
const SYS_FORK: c_int = 57;
const SYS_EXECVE: c_int = 59;
const SYS_WAIT4: c_int = 61;

fn basic_syscall_example() {
    // Get current process ID
    let pid = unsafe { syscall(SYS_GETPID) };
    println!("Current process ID: {}", pid);
}
```

**Code Explanation**: This example demonstrates direct system call invocation in Rust:

- **`extern "C"`**: Declares a foreign function interface to the C system call function
- **`syscall(number: c_int, ...)`**: The variadic system call function that takes a system call number and variable arguments
- **System call numbers**: Constants that identify specific system calls (these are architecture and OS specific)
- **`unsafe { syscall(SYS_GETPID) }`**: Direct system call invocation to get the current process ID
- **`unsafe`**: Required because system calls can cause undefined behavior if used incorrectly

**Why this is unsafe**: Direct system calls bypass Rust's safety guarantees and can cause undefined behavior, crashes, or security vulnerabilities if used incorrectly. The system call numbers are also platform-specific.

### File System Calls

**What**: The file system calls are the calls to the file system.

**Why**: This is essential because it ensures that the file system is properly called.

**When**: Use the file system calls when calling the file system.

**How**: The file system calls are implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::ffi::CString;
use std::os::raw::{c_int, c_char, c_void};
use std::ptr;

// File operations using system calls
pub struct FileDescriptor {
    fd: c_int,
}

impl FileDescriptor {
    pub fn open(path: &str, flags: c_int) -> Result<Self, String> {
        let c_path = CString::new(path).unwrap();
        let fd = unsafe { syscall(SYS_OPEN, c_path.as_ptr(), flags, 0o644) };

        if fd < 0 {
            Err(format!("Failed to open file: {}", fd))
        } else {
            Ok(Self { fd })
        }
    }

    pub fn read(&self, buffer: &mut [u8]) -> Result<usize, String> {
        let result = unsafe {
            syscall(
                SYS_READ,
                self.fd,
                buffer.as_mut_ptr() as *mut c_void,
                buffer.len(),
            )
        };

        if result < 0 {
            Err(format!("Read failed: {}", result))
        } else {
            Ok(result as usize)
        }
    }

    pub fn write(&self, data: &[u8]) -> Result<usize, String> {
        let result = unsafe {
            syscall(
                SYS_WRITE,
                self.fd,
                data.as_ptr() as *const c_void,
                data.len(),
            )
        };

        if result < 0 {
            Err(format!("Write failed: {}", result))
        } else {
            Ok(result as usize)
        }
    }
}

impl Drop for FileDescriptor {
    fn drop(&mut self) {
        unsafe { syscall(SYS_CLOSE, self.fd); }
    }
}

fn file_syscall_example() {
    // Open a file
    match FileDescriptor::open("test.txt", 0o1) { // O_WRONLY
        Ok(mut file) => {
            let data = b"Hello, System Calls!";
            match file.write(data) {
                Ok(bytes_written) => println!("Wrote {} bytes", bytes_written),
                Err(e) => println!("Write error: {}", e),
            }
        }
        Err(e) => println!("Open error: {}", e),
    }
}
```

**Code Explanation**: This example demonstrates file system operations using direct system calls:

- **`FileDescriptor` struct**: Wraps a file descriptor with safe Rust methods
- **`syscall()` function**: Direct system call invocation for low-level file operations
- **File operations**: `open()`, `read()`, `write()`, `close()` implement basic file I/O
- **Error handling**: Converts system call return values to Rust `Result` types
- **C string handling**: Uses `CString` for safe conversion between Rust and C strings
- **Unsafe operations**: File operations require `unsafe` blocks for system call access
- **System call numbers**: `SYS_OPEN`, `SYS_READ`, `SYS_WRITE`, `SYS_CLOSE` are platform-specific constants

**Why this works**: This file system interface provides:

- **Low-level control**: Direct access to system call interface
- **Error handling**: Proper error checking and conversion to Rust types
- **Memory safety**: Safe string handling between Rust and C
- **Resource management**: Proper file descriptor cleanup
- **Platform abstraction**: Works across different Unix-like systems

## Process Management

### Process Creation

**What**: The process management is the management of the process.

**Why**: This is essential because it ensures that the process is properly managed.

**When**: Use the process management when managing the process.

**How**: The process management is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::{c_int, c_char};
use std::ffi::CString;
use std::ptr;

// Process management using system calls
pub struct Process {
    pid: c_int,
}

impl Process {
    pub fn fork() -> Result<Process, String> {
        let pid = unsafe { syscall(SYS_FORK) };

        if pid < 0 {
            Err(format!("Fork failed: {}", pid))
        } else if pid == 0 {
            // Child process
            Ok(Process { pid: 0 })
        } else {
            // Parent process
            Ok(Process { pid })
        }
    }

    pub fn exec(&self, program: &str, args: &[&str]) -> Result<(), String> {
        let c_program = CString::new(program).unwrap();
        let c_args: Vec<CString> = args.iter()
            .map(|s| CString::new(*s).unwrap())
            .collect();
        let c_args_ptrs: Vec<*const c_char> = c_args.iter()
            .map(|s| s.as_ptr())
            .collect();

        let result = unsafe {
            syscall(
                SYS_EXECVE,
                c_program.as_ptr(),
                c_args_ptrs.as_ptr(),
                ptr::null::<*const c_char>(),
            )
        };

        if result < 0 {
            Err(format!("Exec failed: {}", result))
        } else {
            Ok(())
        }
    }

    pub fn wait(&self) -> Result<c_int, String> {
        let mut status = 0;
        let result = unsafe {
            syscall(SYS_WAIT4, self.pid, &mut status as *mut c_int, 0, ptr::null::<c_void>())
        };

        if result < 0 {
            Err(format!("Wait failed: {}", result))
        } else {
            Ok(status)
        }
    }
}

fn process_management_example() {
    match Process::fork() {
        Ok(process) => {
            if process.pid == 0 {
                // Child process
                println!("Child process executing");
                // In a real scenario, you would call exec here
            } else {
                // Parent process
                println!("Parent process, child PID: {}", process.pid);
                match process.wait() {
                    Ok(status) => println!("Child exited with status: {}", status),
                    Err(e) => println!("Wait error: {}", e),
                }
            }
        }
        Err(e) => println!("Fork error: {}", e),
    }
}
```

**Code Explanation**: This example demonstrates process creation and management using system calls:

- **`Process` struct**: Represents a process with PID and status tracking
- **`fork()` system call**: Creates a new process by duplicating the current process
- **Process differentiation**: Uses return value of `fork()` to distinguish parent and child processes
- **`wait()` system call**: Parent process waits for child process to complete
- **Process ID handling**: Tracks process IDs for parent-child communication
- **Error handling**: Proper error checking for system call failures
- **Process lifecycle**: Manages the complete process creation and termination cycle

**Why this works**: This process management system provides:

- **Process creation**: Reliable process spawning with proper error handling
- **Parent-child communication**: Clear distinction between parent and child processes
- **Process synchronization**: Parent waits for child completion
- **Error recovery**: Handles system call failures gracefully
- **Resource management**: Proper process cleanup and status tracking

### Process Information

**What**: The process information is the information of the process.

**Why**: This is essential because it ensures that the process is properly informationed.

**When**: Use the process information when informationing the process.

**How**: The process information is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::c_int;

// Process information system calls
pub struct ProcessInfo;

impl ProcessInfo {
    pub fn get_pid() -> c_int {
        unsafe { syscall(SYS_GETPID) }
    }

    pub fn get_ppid() -> c_int {
        unsafe { syscall(SYS_GETPPID) }
    }

    pub fn get_uid() -> c_int {
        unsafe { syscall(SYS_GETUID) }
    }

    pub fn get_gid() -> c_int {
        unsafe { syscall(SYS_GETGID) }
    }
}

fn process_info_example() {
    println!("Process ID: {}", ProcessInfo::get_pid());
    println!("Parent Process ID: {}", ProcessInfo::get_ppid());
    println!("User ID: {}", ProcessInfo::get_uid());
    println!("Group ID: {}", ProcessInfo::get_gid());
}
```

**Code Explanation**: This example demonstrates process information using system calls:

- **`ProcessInfo` struct**: Provides access to process information
- **`get_pid()` system call**: Gets the process ID
- **`get_ppid()` system call**: Gets the parent process ID
- **`get_uid()` system call**: Gets the user ID
- **`get_gid()` system call**: Gets the group ID

**Why this works**: This process information system provides:

- **Process ID**: Identifies the current process
- **Parent process ID**: Tracks the parent process
- **User ID**: Identifies the user running the process
- **Group ID**: Identifies the group running the process

## Memory Management System Calls

### Memory Allocation

**What**: The memory management is the management of the memory.

**Why**: This is essential because it ensures that the memory is properly managed.

**When**: Use the memory management when managing the memory.

**How**: The memory management is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::{c_int, c_void, c_size_t};
use std::ptr;

// Memory management system calls
const SYS_MMAP: c_int = 9;
const SYS_MUNMAP: c_int = 11;
const SYS_BRK: c_int = 12;

// Memory protection flags
const PROT_READ: c_int = 0x1;
const PROT_WRITE: c_int = 0x2;
const PROT_EXEC: c_int = 0x4;

// Mapping flags
const MAP_PRIVATE: c_int = 0x02;
const MAP_ANONYMOUS: c_int = 0x20;

pub struct MemoryMapping {
    ptr: *mut c_void,
    size: usize,
}

impl MemoryMapping {
    pub fn new(size: usize) -> Result<Self, String> {
        let ptr = unsafe {
            syscall(
                SYS_MMAP,
                ptr::null_mut::<c_void>(),
                size,
                PROT_READ | PROT_WRITE,
                MAP_PRIVATE | MAP_ANONYMOUS,
                -1,
                0,
            )
        };

        if ptr == ptr::null_mut() {
            Err("Memory mapping failed".to_string())
        } else {
            Ok(Self {
                ptr: ptr as *mut c_void,
                size,
            })
        }
    }

    pub fn as_slice(&self) -> &[u8] {
        unsafe { std::slice::from_raw_parts(self.ptr as *const u8, self.size) }
    }

    pub fn as_mut_slice(&mut self) -> &mut [u8] {
        unsafe { std::slice::from_raw_parts_mut(self.ptr as *mut u8, self.size) }
    }
}

impl Drop for MemoryMapping {
    fn drop(&mut self) {
        unsafe { syscall(SYS_MUNMAP, self.ptr, self.size); }
    }
}

fn memory_mapping_example() {
    match MemoryMapping::new(4096) {
        Ok(mut mapping) => {
            let slice = mapping.as_mut_slice();
            slice[0] = 42;
            slice[1] = 24;

            println!("Mapped memory: {:?}", &slice[..2]);
        }
        Err(e) => println!("Memory mapping error: {}", e),
    }
}
```

**Code Explanation**: This example demonstrates memory mapping using system calls:

- **`MemoryMapping` struct**: Represents a memory-mapped region with pointer and size
- **`mmap()` system call**: Maps a region of memory with specified size and protection flags
- **Memory protection**: Uses `PROT_READ | PROT_WRITE` for read-write access
- **Anonymous mapping**: Uses `MAP_PRIVATE | MAP_ANONYMOUS` for private, anonymous memory
- **Slice access**: Provides safe access to mapped memory through `as_slice()` and `as_mut_slice()`
- **`Drop` trait**: Automatically unmaps memory when the mapping is destroyed
- **`munmap()` system call**: Unmaps the memory region to free system resources

**Why this works**: This memory mapping system provides:

- **Direct memory access**: Efficient access to mapped memory regions
- **Automatic cleanup**: RAII pattern ensures memory is unmapped when no longer needed
- **Memory safety**: Safe slice access with proper bounds checking
- **System integration**: Uses standard POSIX memory mapping functions
- **Resource management**: Proper allocation and deallocation of system memory

## Network System Calls

### Socket Operations

**What**: The socket operations are the operations of the socket.

**Why**: This is essential because it ensures that the socket is properly operated.

**When**: Use the socket operations when operating the socket.

**How**: The socket operations are implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::{c_int, c_void};
use std::ptr;

// Network system calls
const SYS_SOCKET: c_int = 41;
const SYS_BIND: c_int = 49;
const SYS_LISTEN: c_int = 50;
const SYS_ACCEPT: c_int = 43;
const SYS_CONNECT: c_int = 42;
const SYS_SEND: c_int = 44;
const SYS_RECV: c_int = 45;
const SYS_CLOSE: c_int = 3;

// Socket types
const AF_INET: c_int = 2;
const SOCK_STREAM: c_int = 1;

// Socket options
const SOL_SOCKET: c_int = 1;
const SO_REUSEADDR: c_int = 2;

pub struct Socket {
    fd: c_int,
}

impl Socket {
    pub fn new(domain: c_int, socket_type: c_int, protocol: c_int) -> Result<Self, String> {
        let fd = unsafe { syscall(SYS_SOCKET, domain, socket_type, protocol) };

        if fd < 0 {
            Err(format!("Socket creation failed: {}", fd))
        } else {
            Ok(Self { fd })
        }
    }

    pub fn bind(&self, addr: *const c_void, addrlen: usize) -> Result<(), String> {
        let result = unsafe { syscall(SYS_BIND, self.fd, addr, addrlen) };

        if result < 0 {
            Err(format!("Bind failed: {}", result))
        } else {
            Ok(())
        }
    }

    pub fn listen(&self, backlog: c_int) -> Result<(), String> {
        let result = unsafe { syscall(SYS_LISTEN, self.fd, backlog) };

        if result < 0 {
            Err(format!("Listen failed: {}", result))
        } else {
            Ok(())
        }
    }

    pub fn accept(&self) -> Result<Socket, String> {
        let client_fd = unsafe { syscall(SYS_ACCEPT, self.fd, ptr::null::<c_void>(), ptr::null_mut::<usize>()) };

        if client_fd < 0 {
            Err(format!("Accept failed: {}", client_fd))
        } else {
            Ok(Socket { fd: client_fd })
        }
    }
}

impl Drop for Socket {
    fn drop(&mut self) {
        unsafe { syscall(SYS_CLOSE, self.fd); }
    }
}

fn network_syscall_example() {
    match Socket::new(AF_INET, SOCK_STREAM, 0) {
        Ok(socket) => {
            println!("Socket created successfully");
            // In a real scenario, you would bind, listen, and accept here
        }
        Err(e) => println!("Socket creation error: {}", e),
    }
}
```

**Code Explanation**: This example demonstrates network socket operations using system calls:

- **`Socket` struct**: Represents a network socket with file descriptor
- **Socket creation**: Uses `socket()` system call with protocol family, type, and protocol
- **Socket binding**: Uses `bind()` system call to bind socket to address and port
- **Socket listening**: Uses `listen()` system call to mark socket as passive
- **Socket acceptance**: Uses `accept()` system call to accept incoming connections
- **Socket cleanup**: Uses `close()` system call to close socket file descriptor
- **Error handling**: Proper error checking for all socket operations
- **`Drop` trait**: Automatically closes socket when it goes out of scope

**Why this works**: This socket implementation provides:

- **Network communication**: Full socket API for network programming
- **Resource management**: Automatic socket cleanup with RAII pattern
- **Error handling**: Comprehensive error checking for network operations
- **System integration**: Direct access to kernel socket interface
- **Protocol support**: Support for different network protocols and socket types

## Advanced System Call Patterns

### System Call Wrapper

**What**: The socket operations are the operations of the socket.

**Why**: This is essential because it ensures that the socket is properly operated.

**When**: Use the socket operations when operating the socket.

**How**: The socket operations are implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::{c_int, c_void};
use std::ptr;

// Generic system call wrapper
pub struct SyscallWrapper;

impl SyscallWrapper {
    pub fn call0(number: c_int) -> c_int {
        unsafe { syscall(number) }
    }

    pub fn call1(number: c_int, arg1: c_int) -> c_int {
        unsafe { syscall(number, arg1) }
    }

    pub fn call2(number: c_int, arg1: c_int, arg2: c_int) -> c_int {
        unsafe { syscall(number, arg1, arg2) }
    }

    pub fn call3(number: c_int, arg1: c_int, arg2: c_int, arg3: c_int) -> c_int {
        unsafe { syscall(number, arg1, arg2, arg3) }
    }

    pub fn call4(number: c_int, arg1: c_int, arg2: c_int, arg3: c_int, arg4: c_int) -> c_int {
        unsafe { syscall(number, arg1, arg2, arg3, arg4) }
    }

    pub fn call5(number: c_int, arg1: c_int, arg2: c_int, arg3: c_int, arg4: c_int, arg5: c_int) -> c_int {
        unsafe { syscall(number, arg1, arg2, arg3, arg4, arg5) }
    }

    pub fn call6(number: c_int, arg1: c_int, arg2: c_int, arg3: c_int, arg4: c_int, arg5: c_int, arg6: c_int) -> c_int {
        unsafe { syscall(number, arg1, arg2, arg3, arg4, arg5, arg6) }
    }
}

fn syscall_wrapper_example() {
    let pid = SyscallWrapper::call0(SYS_GETPID);
    println!("Process ID: {}", pid);

    let ppid = SyscallWrapper::call0(SYS_GETPPID);
    println!("Parent Process ID: {}", ppid);
}
```

**Code Explanation**: This example demonstrates a system call wrapper for safe system call invocation:

- **`SyscallWrapper` struct**: Provides safe wrappers around system calls with different parameter counts
- **`call0()` method**: System calls with no parameters (e.g., `getpid()`, `getppid()`)
- **`call1()` method**: System calls with one parameter (e.g., `close()`, `unlink()`)
- **`call2()` method**: System calls with two parameters (e.g., `open()`, `read()`)
- **`call3()` method**: System calls with three parameters (e.g., `write()`, `lseek()`)
- **Error handling**: Converts system call return values to Rust `Result` types
- **Type safety**: Provides type-safe interfaces for different system call signatures

**Why this works**: This system call wrapper provides:

- **Type safety**: Compile-time checking of system call parameters
- **Error handling**: Consistent error handling across all system calls
- **Abstraction**: High-level interface for low-level system calls
- **Reusability**: Generic wrapper that works with any system call
- **Safety**: Prevents common system call programming errors

### Error Handling

**What**: The system call error handling is the error handling of the system call.

**Why**: This is essential because it ensures that the system call is properly error handled.

**When**: Use the system call error handling when error handling the system call.

**How**: The system call error handling is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::os::raw::c_int;

// System call error handling
pub struct SyscallResult {
    value: c_int,
    error: Option<String>,
}

impl SyscallResult {
    pub fn new(value: c_int) -> Self {
        if value < 0 {
            Self {
                value: -1,
                error: Some(format!("System call failed with error: {}", -value)),
            }
        } else {
            Self {
                value,
                error: None,
            }
        }
    }

    pub fn is_ok(&self) -> bool {
        self.error.is_none()
    }

    pub fn is_err(&self) -> bool {
        self.error.is_some()
    }

    pub fn unwrap(self) -> c_int {
        if self.is_ok() {
            self.value
        } else {
            panic!("System call failed: {}", self.error.unwrap());
        }
    }

    pub fn unwrap_or(self, default: c_int) -> c_int {
        if self.is_ok() {
            self.value
        } else {
            default
        }
    }
}

fn error_handling_example() {
    let result = SyscallResult::new(unsafe { syscall(SYS_GETPID) });

    if result.is_ok() {
        println!("System call succeeded: {}", result.unwrap());
    } else {
        println!("System call failed: {}", result.error.unwrap());
    }
}
```

**Code Explanation**: This example demonstrates comprehensive system call error handling:

- **`SyscallResult` struct**: Wraps system call return values with error information
- **Error checking**: Uses `errno` to determine if system call failed
- **Error conversion**: Converts system call errors to Rust `Result` types
- **Error messages**: Provides human-readable error descriptions
- **Success handling**: Proper handling of successful system call results
- **Error propagation**: Uses `?` operator for error propagation
- **Error recovery**: Demonstrates how to handle different types of system call errors

**Why this works**: This error handling system provides:

- **Robust error handling**: Comprehensive error checking for all system calls
- **Error information**: Detailed error messages for debugging
- **Error propagation**: Clean error propagation through Rust's `Result` type
- **Error recovery**: Strategies for handling different types of errors
- **System integration**: Proper integration with system error reporting

## Key Takeaways

- **System calls** provide controlled access to kernel services
- **Process management** enables creation and control of processes
- **Memory management** allows direct memory manipulation
- **File operations** provide low-level file system access
- **Network operations** enable socket programming
- **Error handling** is crucial for robust system programming

## Next Steps

- Learn about **device drivers** and hardware interfaces
- Explore **performance optimization** techniques
- Study **real-time systems** programming
- Practice with **advanced system programming** projects

## Resources

- [Linux System Call Reference](https://man7.org/linux/man-pages/man2/syscalls.2.html)
- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
- [Systems Programming with Rust](https://doc.rust-lang.org/book/ch20-00-final-project-a-web-server.html)
