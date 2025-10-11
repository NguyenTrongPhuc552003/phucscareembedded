---
sidebar_position: 2
---

# Kernel Integration

Master kernel integration in Rust with comprehensive explanations using the 4W+H framework.

## What Is Kernel Integration?

**What**: Kernel integration involves developing software components that run in the operating system kernel space, including kernel modules, device drivers, and system services that have direct access to hardware and kernel resources.

**Why**: Understanding kernel integration is crucial because:

- **System Performance**: Enable direct hardware access and optimized system operations
- **Security**: Provide controlled access to sensitive system resources
- **Functionality**: Extend kernel capabilities with custom features
- **Hardware Support**: Add support for new hardware devices
- **Real-time Systems**: Enable deterministic, low-latency operations
- **System Control**: Provide fine-grained control over system behavior

**When**: Use kernel integration when:

- Developing kernel modules and drivers
- Implementing system-level functionality
- Creating hardware interfaces
- Building real-time systems
- Developing embedded systems
- Working with specialized hardware

**Where**: Kernel integration is used in:

- Operating system kernels
- Real-time operating systems
- Embedded systems and microcontrollers
- Virtual machine hypervisors
- System-on-chip (SoC) platforms
- Specialized computing systems

**How**: Kernel integration is implemented through:

- Kernel module development
- System call implementation
- Interrupt handling
- Memory management
- Hardware abstraction
- Driver registration and lifecycle

## Kernel Module Development

### Basic Kernel Module Structure

```rust
use std::os::raw::{c_int, c_char, c_void};
use std::ffi::{CString, CStr};
use std::ptr;

// Kernel module information
#[repr(C)]
pub struct KernelModule {
    pub name: *const c_char,
    pub version: *const c_char,
    pub license: *const c_char,
    pub author: *const c_char,
    pub description: *const c_char,
}

// Module initialization and cleanup functions
extern "C" {
    fn module_init(init_fn: extern "C" fn() -> c_int);
    fn module_exit(exit_fn: extern "C" fn());
    fn printk(fmt: *const c_char, ...) -> c_int;
}

// Kernel module macros
macro_rules! module_init {
    ($init_fn:expr) => {
        extern "C" fn __init() -> c_int {
            $init_fn()
        }
        module_init(__init);
    };
}

macro_rules! module_exit {
    ($exit_fn:expr) => {
        extern "C" fn __exit() {
            $exit_fn();
        }
        module_exit(__exit);
    };
}

// Simple kernel module
pub struct SimpleKernelModule {
    name: String,
    version: String,
    license: String,
    author: String,
    description: String,
}

impl SimpleKernelModule {
    pub fn new() -> Self {
        Self {
            name: "simple_rust_module".to_string(),
            version: "1.0.0".to_string(),
            license: "GPL".to_string(),
            author: "Rust Developer".to_string(),
            description: "A simple Rust kernel module".to_string(),
        }
    }

    pub fn init(&self) -> c_int {
        unsafe {
            let msg = CString::new("Simple Rust kernel module loaded\n").unwrap();
            printk(msg.as_ptr());
        }
        0 // Success
    }

    pub fn cleanup(&self) {
        unsafe {
            let msg = CString::new("Simple Rust kernel module unloaded\n").unwrap();
            printk(msg.as_ptr());
        }
    }
}

// Module registration
static MODULE: SimpleKernelModule = SimpleKernelModule::new();

extern "C" fn init_module() -> c_int {
    MODULE.init()
}

extern "C" fn cleanup_module() {
    MODULE.cleanup();
}

// Module metadata
#[no_mangle]
pub static __this_module: KernelModule = KernelModule {
    name: b"simple_rust_module\0".as_ptr() as *const c_char,
    version: b"1.0.0\0".as_ptr() as *const c_char,
    license: b"GPL\0".as_ptr() as *const c_char,
    author: b"Rust Developer\0".as_ptr() as *const c_char,
    description: b"A simple Rust kernel module\0".as_ptr() as *const c_char,
};

// Register module functions
module_init!(init_module);
module_exit!(cleanup_module);
```

### Character Device Module

```rust
use std::os::raw::{c_int, c_char, c_void, c_ulong};
use std::ffi::{CString, CStr};
use std::ptr;
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

// Kernel data structures
#[repr(C)]
pub struct FileOperations {
    pub owner: *const c_void,
    pub llseek: Option<extern "C" fn(*mut c_void, c_ulong, c_int) -> c_ulong>,
    pub read: Option<extern "C" fn(*mut c_void, *mut c_char, usize, *mut c_ulong) -> c_int>,
    pub write: Option<extern "C" fn(*mut c_void, *const c_char, usize, *mut c_ulong) -> c_int>,
    pub open: Option<extern "C" fn(*mut c_void) -> c_int>,
    pub release: Option<extern "C" fn(*mut c_void) -> c_int>,
    pub ioctl: Option<extern "C" fn(*mut c_void, c_ulong, c_ulong) -> c_int>,
}

// Character device driver
pub struct CharDeviceModule {
    major_number: c_int,
    minor_number: c_int,
    device_name: String,
    buffer: Arc<Mutex<VecDeque<u8>>>,
    open_count: Arc<Mutex<c_int>>,
}

impl CharDeviceModule {
    pub fn new(device_name: String) -> Self {
        Self {
            major_number: 0,
            minor_number: 0,
            device_name,
            buffer: Arc::new(Mutex::new(VecDeque::new())),
            open_count: Arc::new(Mutex::new(0)),
        }
    }

    pub fn register_device(&mut self) -> c_int {
        // Register character device
        let c_name = CString::new(self.device_name.clone()).unwrap();
        let major = unsafe {
            register_chrdev(0, c_name.as_ptr(), &FILE_OPS)
        };

        if major < 0 {
            return major;
        }

        self.major_number = major;
        0
    }

    pub fn unregister_device(&self) {
        if self.major_number > 0 {
            unsafe {
                unregister_chrdev(self.major_number, CString::new(self.device_name.clone()).unwrap().as_ptr());
            }
        }
    }

    pub fn get_major_number(&self) -> c_int {
        self.major_number
    }
}

// File operations implementation
extern "C" fn device_open(_inode: *mut c_void) -> c_int {
    unsafe {
        let msg = CString::new("Device opened\n").unwrap();
        printk(msg.as_ptr());
    }
    0
}

extern "C" fn device_release(_inode: *mut c_void) -> c_int {
    unsafe {
        let msg = CString::new("Device closed\n").unwrap();
        printk(msg.as_ptr());
    }
    0
}

extern "C" fn device_read(_file: *mut c_void, buffer: *mut c_char, length: usize, _offset: *mut c_ulong) -> c_int {
    // Simple read implementation
    let data = b"Hello from Rust kernel module!\n";
    let copy_len = std::cmp::min(length, data.len());

    unsafe {
        ptr::copy_nonoverlapping(data.as_ptr(), buffer as *mut u8, copy_len);
    }

    copy_len as c_int
}

extern "C" fn device_write(_file: *mut c_void, buffer: *const c_char, length: usize, _offset: *mut c_ulong) -> c_int {
    // Simple write implementation
    unsafe {
        let msg = CString::new("Data written to device\n").unwrap();
        printk(msg.as_ptr());
    }

    length as c_int
}

extern "C" fn device_ioctl(_file: *mut c_void, command: c_ulong, _arg: c_ulong) -> c_int {
    match command {
        0x1001 => {
            unsafe {
                let msg = CString::new("IOCTL command received\n").unwrap();
                printk(msg.as_ptr());
            }
            0
        }
        _ => -1, // Invalid command
    }
}

// File operations structure
static FILE_OPS: FileOperations = FileOperations {
    owner: ptr::null(),
    llseek: None,
    read: Some(device_read),
    write: Some(device_write),
    open: Some(device_open),
    release: Some(device_release),
    ioctl: Some(device_ioctl),
};

// External kernel functions
extern "C" {
    fn register_chrdev(major: c_int, name: *const c_char, fops: *const FileOperations) -> c_int;
    fn unregister_chrdev(major: c_int, name: *const c_char);
    fn printk(fmt: *const c_char, ...) -> c_int;
}

// Global device instance
static mut DEVICE: Option<CharDeviceModule> = None;

// Module initialization
extern "C" fn init_char_device() -> c_int {
    unsafe {
        DEVICE = Some(CharDeviceModule::new("rust_char_device".to_string()));

        if let Some(ref mut device) = DEVICE {
            let result = device.register_device();
            if result < 0 {
                let msg = CString::new("Failed to register character device\n").unwrap();
                printk(msg.as_ptr());
                return result;
            }

            let msg = CString::new("Character device registered successfully\n").unwrap();
            printk(msg.as_ptr());
        }
    }

    0
}

// Module cleanup
extern "C" fn cleanup_char_device() {
    unsafe {
        if let Some(ref device) = DEVICE {
            device.unregister_device();
            let msg = CString::new("Character device unregistered\n").unwrap();
            printk(msg.as_ptr());
        }
        DEVICE = None;
    }
}

// Register module functions
module_init!(init_char_device);
module_exit!(cleanup_char_device);
```

## System Call Implementation

### Custom System Call

```rust
use std::os::raw::{c_int, c_long, c_ulong};
use std::ffi::CString;

// System call numbers
const SYS_CUSTOM_CALL: c_int = 1000;

// System call data structure
#[repr(C)]
pub struct CustomSyscallData {
    pub operation: c_int,
    pub parameter1: c_ulong,
    pub parameter2: c_ulong,
    pub result: c_long,
}

// System call implementation
extern "C" fn sys_custom_call(data: *mut CustomSyscallData) -> c_long {
    if data.is_null() {
        return -1; // Invalid parameter
    }

    unsafe {
        let syscall_data = &mut *data;

        match syscall_data.operation {
            1 => {
                // Operation 1: Add two numbers
                syscall_data.result = (syscall_data.parameter1 + syscall_data.parameter2) as c_long;
            }
            2 => {
                // Operation 2: Multiply two numbers
                syscall_data.result = (syscall_data.parameter1 * syscall_data.parameter2) as c_long;
            }
            3 => {
                // Operation 3: Get system information
                syscall_data.result = get_system_info();
            }
            _ => {
                return -1; // Invalid operation
            }
        }

        syscall_data.result
    }
}

// System information function
fn get_system_info() -> c_long {
    // Return a simple system identifier
    0x12345678
}

// System call registration
extern "C" {
    fn syscall_table_init();
    fn register_syscall(number: c_int, handler: extern "C" fn(*mut CustomSyscallData) -> c_long);
}

// Register system call
extern "C" fn init_syscall() -> c_int {
    unsafe {
        register_syscall(SYS_CUSTOM_CALL, sys_custom_call);

        let msg = CString::new("Custom system call registered\n").unwrap();
        printk(msg.as_ptr());
    }

    0
}

// System call cleanup
extern "C" fn cleanup_syscall() {
    unsafe {
        let msg = CString::new("Custom system call unregistered\n").unwrap();
        printk(msg.as_ptr());
    }
}

// Register module functions
module_init!(init_syscall);
module_exit!(cleanup_syscall);
```

### Interrupt Handler Module

```rust
use std::os::raw::{c_int, c_void};
use std::ffi::CString;
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

// Interrupt handler data
pub struct InterruptHandler {
    irq_number: c_int,
    handler_name: String,
    interrupt_count: Arc<Mutex<u64>>,
    interrupt_queue: Arc<Mutex<VecDeque<InterruptEvent>>>,
}

#[derive(Debug, Clone)]
pub struct InterruptEvent {
    pub irq: c_int,
    pub timestamp: u64,
    pub data: u32,
}

impl InterruptHandler {
    pub fn new(irq_number: c_int, handler_name: String) -> Self {
        Self {
            irq_number,
            handler_name,
            interrupt_count: Arc::new(Mutex::new(0)),
            interrupt_queue: Arc::new(Mutex::new(VecDeque::new())),
        }
    }

    pub fn register_handler(&self) -> c_int {
        unsafe {
            let result = request_irq(
                self.irq_number,
                interrupt_handler_wrapper,
                IRQF_SHARED,
                CString::new(self.handler_name.clone()).unwrap().as_ptr(),
                self as *const _ as *mut c_void,
            );

            if result < 0 {
                let msg = CString::new("Failed to register interrupt handler\n").unwrap();
                printk(msg.as_ptr());
                return result;
            }

            let msg = CString::new("Interrupt handler registered successfully\n").unwrap();
            printk(msg.as_ptr());
        }

        0
    }

    pub fn unregister_handler(&self) {
        unsafe {
            free_irq(self.irq_number, self as *const _ as *mut c_void);

            let msg = CString::new("Interrupt handler unregistered\n").unwrap();
            printk(msg.as_ptr());
        }
    }

    pub fn get_interrupt_count(&self) -> u64 {
        *self.interrupt_count.lock().unwrap()
    }

    pub fn get_interrupt_events(&self) -> Vec<InterruptEvent> {
        let mut queue = self.interrupt_queue.lock().unwrap();
        queue.drain(..).collect()
    }
}

// Interrupt handler function
extern "C" fn interrupt_handler_wrapper(irq: c_int, dev_id: *mut c_void) -> c_int {
    if dev_id.is_null() {
        return IRQ_NONE;
    }

    unsafe {
        let handler = &*(dev_id as *const InterruptHandler);

        // Increment interrupt count
        {
            let mut count = handler.interrupt_count.lock().unwrap();
            *count += 1;
        }

        // Add interrupt event to queue
        {
            let mut queue = handler.interrupt_queue.lock().unwrap();
            queue.push_back(InterruptEvent {
                irq,
                timestamp: get_timestamp(),
                data: 0, // Could read from hardware register
            });

            // Keep only last 100 events
            if queue.len() > 100 {
                queue.pop_front();
            }
        }

        let msg = CString::new("Interrupt handled\n").unwrap();
        printk(msg.as_ptr());
    }

    IRQ_HANDLED
}

// Interrupt flags
const IRQF_SHARED: c_int = 0x00000080;
const IRQ_NONE: c_int = 0;
const IRQ_HANDLED: c_int = 1;

// External kernel functions
extern "C" {
    fn request_irq(irq: c_int, handler: extern "C" fn(c_int, *mut c_void) -> c_int, flags: c_int, name: *const c_char, dev_id: *mut c_void) -> c_int;
    fn free_irq(irq: c_int, dev_id: *mut c_void);
    fn printk(fmt: *const c_char, ...) -> c_int;
    fn get_timestamp() -> u64;
}

// Global interrupt handler
static mut INTERRUPT_HANDLER: Option<InterruptHandler> = None;

// Module initialization
extern "C" fn init_interrupt_handler() -> c_int {
    unsafe {
        INTERRUPT_HANDLER = Some(InterruptHandler::new(1, "rust_interrupt_handler".to_string()));

        if let Some(ref handler) = INTERRUPT_HANDLER {
            let result = handler.register_handler();
            if result < 0 {
                return result;
            }
        }
    }

    0
}

// Module cleanup
extern "C" fn cleanup_interrupt_handler() {
    unsafe {
        if let Some(ref handler) = INTERRUPT_HANDLER {
            handler.unregister_handler();
        }
        INTERRUPT_HANDLER = None;
    }
}

// Register module functions
module_init!(init_interrupt_handler);
module_exit!(cleanup_interrupt_handler);
```

## Memory Management in Kernel

### Kernel Memory Allocation

```rust
use std::os::raw::{c_void, c_int, c_ulong};
use std::ptr;

// Kernel memory allocation functions
extern "C" {
    fn kmalloc(size: c_ulong, flags: c_int) -> *mut c_void;
    fn kfree(ptr: *mut c_void);
    fn vmalloc(size: c_ulong) -> *mut c_void;
    fn vfree(ptr: *mut c_void);
    fn get_zeroed_page(flags: c_int) -> *mut c_void;
    fn free_page(ptr: *mut c_void);
}

// Memory allocation flags
const GFP_KERNEL: c_int = 0x00000010;
const GFP_ATOMIC: c_int = 0x00000020;
const GFP_DMA: c_int = 0x00000040;

// Kernel memory manager
pub struct KernelMemoryManager {
    allocated_blocks: std::collections::HashMap<*mut c_void, usize>,
}

impl KernelMemoryManager {
    pub fn new() -> Self {
        Self {
            allocated_blocks: std::collections::HashMap::new(),
        }
    }

    pub fn allocate(&mut self, size: usize, flags: c_int) -> Result<*mut c_void, c_int> {
        unsafe {
            let ptr = kmalloc(size as c_ulong, flags);
            if ptr.is_null() {
                return Err(-1);
            }

            self.allocated_blocks.insert(ptr, size);
            Ok(ptr)
        }
    }

    pub fn allocate_atomic(&mut self, size: usize) -> Result<*mut c_void, c_int> {
        self.allocate(size, GFP_ATOMIC)
    }

    pub fn allocate_dma(&mut self, size: usize) -> Result<*mut c_void, c_int> {
        self.allocate(size, GFP_DMA)
    }

    pub fn allocate_virtual(&mut self, size: usize) -> Result<*mut c_void, c_int> {
        unsafe {
            let ptr = vmalloc(size as c_ulong);
            if ptr.is_null() {
                return Err(-1);
            }

            self.allocated_blocks.insert(ptr, size);
            Ok(ptr)
        }
    }

    pub fn allocate_page(&mut self, flags: c_int) -> Result<*mut c_void, c_int> {
        unsafe {
            let ptr = get_zeroed_page(flags);
            if ptr.is_null() {
                return Err(-1);
            }

            self.allocated_blocks.insert(ptr, 4096); // Page size
            Ok(ptr)
        }
    }

    pub fn deallocate(&mut self, ptr: *mut c_void) -> Result<(), c_int> {
        if let Some(size) = self.allocated_blocks.remove(&ptr) {
            unsafe {
                if size == 4096 {
                    free_page(ptr);
                } else {
                    kfree(ptr);
                }
            }
            Ok(())
        } else {
            Err(-1)
        }
    }

    pub fn deallocate_virtual(&mut self, ptr: *mut c_void) -> Result<(), c_int> {
        if let Some(_) = self.allocated_blocks.remove(&ptr) {
            unsafe {
                vfree(ptr);
            }
            Ok(())
        } else {
            Err(-1)
        }
    }

    pub fn get_allocated_size(&self, ptr: *mut c_void) -> Option<usize> {
        self.allocated_blocks.get(&ptr).cloned()
    }
}

// Memory pool implementation
pub struct MemoryPool {
    block_size: usize,
    total_blocks: usize,
    free_blocks: Vec<*mut c_void>,
    allocated_blocks: std::collections::HashMap<*mut c_void, bool>,
}

impl MemoryPool {
    pub fn new(block_size: usize, total_blocks: usize) -> Result<Self, c_int> {
        let mut pool = Self {
            block_size,
            total_blocks,
            free_blocks: Vec::new(),
            allocated_blocks: std::collections::HashMap::new(),
        };

        // Allocate initial blocks
        for _ in 0..total_blocks {
            unsafe {
                let ptr = kmalloc(block_size as c_ulong, GFP_KERNEL);
                if ptr.is_null() {
                    return Err(-1);
                }

                pool.free_blocks.push(ptr);
                pool.allocated_blocks.insert(ptr, false);
            }
        }

        Ok(pool)
    }

    pub fn allocate_block(&mut self) -> Option<*mut c_void> {
        if let Some(ptr) = self.free_blocks.pop() {
            self.allocated_blocks.insert(ptr, true);
            Some(ptr)
        } else {
            None
        }
    }

    pub fn deallocate_block(&mut self, ptr: *mut c_void) -> bool {
        if let Some(&allocated) = self.allocated_blocks.get(&ptr) {
            if allocated {
                self.allocated_blocks.insert(ptr, false);
                self.free_blocks.push(ptr);
                true
            } else {
                false
            }
        } else {
            false
        }
    }

    pub fn get_free_blocks(&self) -> usize {
        self.free_blocks.len()
    }

    pub fn get_allocated_blocks(&self) -> usize {
        self.total_blocks - self.free_blocks.len()
    }
}

impl Drop for MemoryPool {
    fn drop(&mut self) {
        // Free all blocks
        for ptr in &self.free_blocks {
            unsafe {
                kfree(*ptr);
            }
        }
    }
}
```

## Practical Examples

### Simple Kernel Module with Proc Interface

```rust
use std::os::raw::{c_int, c_char, c_void};
use std::ffi::{CString, CStr};
use std::ptr;
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

// Proc file operations
#[repr(C)]
pub struct ProcOps {
    pub open: Option<extern "C" fn(*mut c_void) -> c_int>,
    pub read: Option<extern "C" fn(*mut c_void, *mut c_char, usize, *mut c_ulong) -> c_int>,
    pub write: Option<extern "C" fn(*mut c_void, *const c_char, usize, *mut c_ulong) -> c_int>,
    pub release: Option<extern "C" fn(*mut c_void) -> c_int>,
}

// Proc interface data
pub struct ProcInterface {
    proc_entry: *mut c_void,
    data: Arc<Mutex<VecDeque<String>>>,
    read_position: Arc<Mutex<usize>>,
}

impl ProcInterface {
    pub fn new(proc_name: &str) -> Result<Self, c_int> {
        let c_name = CString::new(proc_name).unwrap();
        let proc_entry = unsafe {
            proc_create(c_name.as_ptr(), 0o644, ptr::null_mut(), &PROC_OPS)
        };

        if proc_entry.is_null() {
            return Err(-1);
        }

        Ok(Self {
            proc_entry,
            data: Arc::new(Mutex::new(VecDeque::new())),
            read_position: Arc::new(Mutex::new(0)),
        })
    }

    pub fn add_data(&self, data: String) {
        let mut queue = self.data.lock().unwrap();
        queue.push_back(data);

        // Keep only last 100 entries
        if queue.len() > 100 {
            queue.pop_front();
        }
    }

    pub fn cleanup(&self) {
        unsafe {
            proc_remove(self.proc_entry);
        }
    }
}

// Proc file operations implementation
extern "C" fn proc_open(_inode: *mut c_void) -> c_int {
    0
}

extern "C" fn proc_read(_file: *mut c_void, buffer: *mut c_char, length: usize, offset: *mut c_ulong) -> c_int {
    let data = "Hello from Rust kernel module!\n";
    let copy_len = std::cmp::min(length, data.len());

    unsafe {
        ptr::copy_nonoverlapping(data.as_ptr(), buffer as *mut u8, copy_len);
        *offset = copy_len as c_ulong;
    }

    copy_len as c_int
}

extern "C" fn proc_write(_file: *mut c_void, buffer: *const c_char, length: usize, _offset: *mut c_ulong) -> c_int {
    // Simple write implementation
    unsafe {
        let msg = CString::new("Data written to proc file\n").unwrap();
        printk(msg.as_ptr());
    }

    length as c_int
}

extern "C" fn proc_release(_inode: *mut c_void) -> c_int {
    0
}

// Proc operations structure
static PROC_OPS: ProcOps = ProcOps {
    open: Some(proc_open),
    read: Some(proc_read),
    write: Some(proc_write),
    release: Some(proc_release),
};

// External kernel functions
extern "C" {
    fn proc_create(name: *const c_char, mode: c_int, parent: *mut c_void, proc_ops: *const ProcOps) -> *mut c_void;
    fn proc_remove(proc_entry: *mut c_void);
    fn printk(fmt: *const c_char, ...) -> c_int;
}

// Global proc interface
static mut PROC_INTERFACE: Option<ProcInterface> = None;

// Module initialization
extern "C" fn init_proc_interface() -> c_int {
    unsafe {
        match ProcInterface::new("rust_proc") {
            Ok(interface) => {
                PROC_INTERFACE = Some(interface);

                let msg = CString::new("Proc interface created\n").unwrap();
                printk(msg.as_ptr());
            }
            Err(_) => {
                let msg = CString::new("Failed to create proc interface\n").unwrap();
                printk(msg.as_ptr());
                return -1;
            }
        }
    }

    0
}

// Module cleanup
extern "C" fn cleanup_proc_interface() {
    unsafe {
        if let Some(ref interface) = PROC_INTERFACE {
            interface.cleanup();
        }
        PROC_INTERFACE = None;
    }
}

// Register module functions
module_init!(init_proc_interface);
module_exit!(cleanup_proc_interface);
```

## Key Takeaways

- **Kernel integration** enables direct hardware access and system control
- **Module development** provides extensible kernel functionality
- **System calls** enable user-space to kernel-space communication
- **Interrupt handling** is essential for responsive hardware interaction
- **Memory management** requires careful allocation and deallocation
- **Error handling** is crucial for kernel stability

## Next Steps

- Learn about **performance optimization** techniques
- Explore **real-time systems** programming
- Study **advanced kernel programming** concepts
- Practice with **complex driver development** projects

## Resources

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/0672329468/)
- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust for Linux](https://github.com/Rust-for-Linux/linux)
- [Linux Kernel Documentation](https://www.kernel.org/doc/)
