---
sidebar_position: 1
---

# System Calls

Master system calls in Rust with comprehensive explanations using the 4W+H framework.

## What Are System Calls?

**What**: System calls are the interface between user-space programs and the operating system kernel, allowing programs to request services from the kernel such as file operations, process management, and hardware access.

**Why**: System calls are essential because:

- **Kernel Access**: Provide controlled access to kernel services and hardware
- **Security**: Enable secure interaction between user and kernel space
- **Abstraction**: Hide low-level hardware details from applications
- **Standardization**: Provide consistent interface across different systems
- **Resource Management**: Allow kernel to manage system resources
- **Process Isolation**: Maintain security boundaries between processes

**When**: Use system calls when:

- Performing file I/O operations
- Managing processes and threads
- Accessing network resources
- Interacting with hardware devices
- Managing memory and system resources
- Implementing system-level functionality

**Where**: System calls are used in:

- Operating system kernels and drivers
- System utilities and tools
- Embedded systems and microcontrollers
- Network servers and clients
- Database systems and file systems
- Real-time systems and control systems

**How**: System calls are implemented through:

- Direct system call invocation
- Library function wrappers
- FFI bindings to system libraries
- Assembly language interfaces
- Kernel entry points and syscalls

## Basic System Call Concepts

### System Call Interface

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

### File System Calls

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

## Process Management

### Process Creation

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

### Process Information

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

## Memory Management System Calls

### Memory Allocation

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

## Network System Calls

### Socket Operations

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

## Advanced System Call Patterns

### System Call Wrapper

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

### Error Handling

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

## Practical Examples

### Simple Shell Implementation

```rust
use std::ffi::CString;
use std::os::raw::{c_int, c_char};
use std::ptr;

// Simple shell using system calls
pub struct SimpleShell;

impl SimpleShell {
    pub fn run() {
        loop {
            print!("$ ");
            std::io::Write::flush(&mut std::io::stdout()).unwrap();

            let mut input = String::new();
            std::io::stdin().read_line(&mut input).unwrap();
            let input = input.trim();

            if input.is_empty() {
                continue;
            }

            if input == "exit" {
                break;
            }

            Self::execute_command(input);
        }
    }

    fn execute_command(command: &str) {
        let parts: Vec<&str> = command.split_whitespace().collect();
        if parts.is_empty() {
            return;
        }

        let program = parts[0];
        let args: Vec<&str> = parts.iter().skip(1).cloned().collect();

        // Fork a new process
        let pid = unsafe { syscall(SYS_FORK) };

        if pid == 0 {
            // Child process
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
                println!("Command not found: {}", program);
                unsafe { syscall(SYS_EXIT, 1); }
            }
        } else if pid > 0 {
            // Parent process
            let mut status = 0;
            unsafe { syscall(SYS_WAIT4, pid, &mut status as *mut c_int, 0, ptr::null::<c_void>()); }
        } else {
            println!("Fork failed");
        }
    }
}

fn shell_example() {
    SimpleShell::run();
}
```

### File System Monitor

```rust
use std::os::raw::{c_int, c_void};
use std::ptr;

// File system monitoring using system calls
const SYS_INOTIFY_INIT: c_int = 253;
const SYS_INOTIFY_ADD_WATCH: c_int = 254;
const SYS_INOTIFY_RM_WATCH: c_int = 255;

pub struct FileSystemMonitor {
    fd: c_int,
}

impl FileSystemMonitor {
    pub fn new() -> Result<Self, String> {
        let fd = unsafe { syscall(SYS_INOTIFY_INIT) };

        if fd < 0 {
            Err(format!("Inotify init failed: {}", fd))
        } else {
            Ok(Self { fd })
        }
    }

    pub fn watch(&self, path: &str, mask: u32) -> Result<c_int, String> {
        let c_path = std::ffi::CString::new(path).unwrap();
        let wd = unsafe { syscall(SYS_INOTIFY_ADD_WATCH, self.fd, c_path.as_ptr(), mask) };

        if wd < 0 {
            Err(format!("Add watch failed: {}", wd))
        } else {
            Ok(wd)
        }
    }

    pub fn unwatch(&self, wd: c_int) -> Result<(), String> {
        let result = unsafe { syscall(SYS_INOTIFY_RM_WATCH, self.fd, wd) };

        if result < 0 {
            Err(format!("Remove watch failed: {}", result))
        } else {
            Ok(())
        }
    }
}

impl Drop for FileSystemMonitor {
    fn drop(&mut self) {
        unsafe { syscall(SYS_CLOSE, self.fd); }
    }
}

fn filesystem_monitor_example() {
    match FileSystemMonitor::new() {
        Ok(monitor) => {
            println!("File system monitor created");
            // In a real scenario, you would watch for file system events
        }
        Err(e) => println!("Monitor creation error: {}", e),
    }
}
```

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
