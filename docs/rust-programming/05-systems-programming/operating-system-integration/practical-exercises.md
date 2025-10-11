---
sidebar_position: 3
---

# Practical Exercises: Operating System Integration

Master operating system integration through hands-on exercises with comprehensive solutions.

## Exercise 1: System Call Wrapper Library

**Objective**: Create a comprehensive system call wrapper library that provides safe, idiomatic Rust interfaces to common system calls.

### Requirements

- Implement wrappers for file operations (open, read, write, close)
- Add process management system calls (fork, exec, wait)
- Include memory management system calls (mmap, munmap)
- Provide error handling and result types
- Support both blocking and non-blocking operations

### Solution

```rust
use std::os::raw::{c_int, c_void, c_char, c_size_t};
use std::ffi::{CString, CStr};
use std::ptr;
use std::io::{self, Read, Write};

// System call numbers (Linux x86_64)
const SYS_READ: c_int = 0;
const SYS_WRITE: c_int = 1;
const SYS_OPEN: c_int = 2;
const SYS_CLOSE: c_int = 3;
const SYS_FORK: c_int = 57;
const SYS_EXECVE: c_int = 59;
const SYS_WAIT4: c_int = 61;
const SYS_MMAP: c_int = 9;
const SYS_MUNMAP: c_int = 11;

// File flags
const O_RDONLY: c_int = 0;
const O_WRONLY: c_int = 1;
const O_RDWR: c_int = 2;
const O_CREAT: c_int = 64;
const O_TRUNC: c_int = 512;

// Memory protection flags
const PROT_READ: c_int = 0x1;
const PROT_WRITE: c_int = 0x2;
const PROT_EXEC: c_int = 0x4;

// Mapping flags
const MAP_PRIVATE: c_int = 0x02;
const MAP_ANONYMOUS: c_int = 0x20;

// System call wrapper
extern "C" {
    fn syscall(number: c_int, ...) -> c_int;
}

// Error handling
#[derive(Debug)]
pub enum SyscallError {
    InvalidArgument(String),
    PermissionDenied,
    FileNotFound,
    OutOfMemory,
    Interrupted,
    Other(c_int),
}

impl std::fmt::Display for SyscallError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SyscallError::InvalidArgument(msg) => write!(f, "Invalid argument: {}", msg),
            SyscallError::PermissionDenied => write!(f, "Permission denied"),
            SyscallError::FileNotFound => write!(f, "File not found"),
            SyscallError::OutOfMemory => write!(f, "Out of memory"),
            SyscallError::Interrupted => write!(f, "Operation interrupted"),
            SyscallError::Other(code) => write!(f, "System call failed with code: {}", code),
        }
    }
}

impl std::error::Error for SyscallError {}

// Result type for system calls
pub type SyscallResult<T> = Result<T, SyscallError>;

// File operations
pub struct FileDescriptor {
    fd: c_int,
}

impl FileDescriptor {
    pub fn open(path: &str, flags: c_int, mode: c_int) -> SyscallResult<Self> {
        let c_path = CString::new(path)
            .map_err(|_| SyscallError::InvalidArgument("Invalid path".to_string()))?;

        let fd = unsafe { syscall(SYS_OPEN, c_path.as_ptr(), flags, mode) };

        if fd < 0 {
            Err(SyscallError::Other(fd))
        } else {
            Ok(Self { fd })
        }
    }

    pub fn read(&self, buffer: &mut [u8]) -> SyscallResult<usize> {
        let result = unsafe {
            syscall(
                SYS_READ,
                self.fd,
                buffer.as_mut_ptr() as *mut c_void,
                buffer.len(),
            )
        };

        if result < 0 {
            Err(SyscallError::Other(result))
        } else {
            Ok(result as usize)
        }
    }

    pub fn write(&self, data: &[u8]) -> SyscallResult<usize> {
        let result = unsafe {
            syscall(
                SYS_WRITE,
                self.fd,
                data.as_ptr() as *const c_void,
                data.len(),
            )
        };

        if result < 0 {
            Err(SyscallError::Other(result))
        } else {
            Ok(result as usize)
        }
    }

    pub fn close(self) -> SyscallResult<()> {
        let result = unsafe { syscall(SYS_CLOSE, self.fd) };

        if result < 0 {
            Err(SyscallError::Other(result))
        } else {
            Ok(())
        }
    }
}

// Process management
pub struct Process {
    pid: c_int,
}

impl Process {
    pub fn fork() -> SyscallResult<Process> {
        let pid = unsafe { syscall(SYS_FORK) };

        if pid < 0 {
            Err(SyscallError::Other(pid))
        } else {
            Ok(Process { pid })
        }
    }

    pub fn exec(program: &str, args: &[&str]) -> SyscallResult<()> {
        let c_program = CString::new(program)
            .map_err(|_| SyscallError::InvalidArgument("Invalid program".to_string()))?;

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
            Err(SyscallError::Other(result))
        } else {
            Ok(())
        }
    }

    pub fn wait(&self) -> SyscallResult<c_int> {
        let mut status = 0;
        let result = unsafe {
            syscall(SYS_WAIT4, self.pid, &mut status as *mut c_int, 0, ptr::null::<c_void>())
        };

        if result < 0 {
            Err(SyscallError::Other(result))
        } else {
            Ok(status)
        }
    }
}

// Memory management
pub struct MemoryMapping {
    ptr: *mut c_void,
    size: usize,
}

impl MemoryMapping {
    pub fn new(size: usize) -> SyscallResult<Self> {
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
            Err(SyscallError::OutOfMemory)
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

// Usage example
fn main() -> Result<(), Box<dyn std::error::Error>> {
    // File operations
    let file = FileDescriptor::open("test.txt", O_CREAT | O_WRONLY, 0o644)?;
    file.write(b"Hello, System Calls!")?;
    file.close()?;

    // Process management
    let process = Process::fork()?;
    if process.pid == 0 {
        // Child process
        Process::exec("echo", &["Hello from child process"])?;
    } else {
        // Parent process
        let status = process.wait()?;
        println!("Child process exited with status: {}", status);
    }

    // Memory management
    let mut mapping = MemoryMapping::new(4096)?;
    let slice = mapping.as_mut_slice();
    slice[0] = 42;
    slice[1] = 24;

    println!("Mapped memory: {:?}", &slice[..2]);

    Ok(())
}
```

## Exercise 2: Process Monitor

**Objective**: Create a process monitoring tool that tracks system processes, their resource usage, and provides real-time updates.

### Requirements

- Monitor running processes and their PIDs
- Track CPU and memory usage
- Display process hierarchy (parent-child relationships)
- Provide real-time updates
- Support filtering and searching

### Solution

```rust
use std::process::{Command, Stdio};
use std::io::{BufRead, BufReader};
use std::collections::HashMap;
use std::time::{Duration, Instant};
use std::thread;

// Process information structure
#[derive(Debug, Clone)]
pub struct ProcessInfo {
    pub pid: u32,
    pub ppid: u32,
    pub name: String,
    pub cpu_usage: f64,
    pub memory_usage: u64,
    pub status: String,
    pub start_time: String,
}

// Process monitor
pub struct ProcessMonitor {
    processes: HashMap<u32, ProcessInfo>,
    update_interval: Duration,
}

impl ProcessMonitor {
    pub fn new(update_interval: Duration) -> Self {
        Self {
            processes: HashMap::new(),
            update_interval,
        }
    }

    pub fn start_monitoring(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        loop {
            self.update_processes()?;
            self.display_processes();
            thread::sleep(self.update_interval);
        }
    }

    fn update_processes(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Get process list from ps command
        let output = Command::new("ps")
            .args(&["-eo", "pid,ppid,comm,pcpu,pmem,stat,start"])
            .output()?;

        let output_str = String::from_utf8(output.stdout)?;

        for line in output_str.lines().skip(1) {
            let fields: Vec<&str> = line.split_whitespace().collect();
            if fields.len() >= 7 {
                let pid = fields[0].parse::<u32>()?;
                let ppid = fields[1].parse::<u32>()?;
                let name = fields[2].to_string();
                let cpu_usage = fields[3].parse::<f64>()?;
                let memory_usage = fields[4].parse::<u64>()?;
                let status = fields[5].to_string();
                let start_time = fields[6].to_string();

                let process_info = ProcessInfo {
                    pid,
                    ppid,
                    name,
                    cpu_usage,
                    memory_usage,
                    status,
                    start_time,
                };

                self.processes.insert(pid, process_info);
            }
        }

        Ok(())
    }

    fn display_processes(&self) {
        println!("\n=== Process Monitor ===");
        println!("{:<8} {:<8} {:<20} {:<8} {:<8} {:<8} {:<12}",
                 "PID", "PPID", "NAME", "CPU%", "MEM%", "STATUS", "START");
        println!("{}", "-".repeat(80));

        let mut sorted_processes: Vec<_> = self.processes.values().collect();
        sorted_processes.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());

        for process in sorted_processes {
            println!("{:<8} {:<8} {:<20} {:<8.1} {:<8.1} {:<8} {:<12}",
                     process.pid,
                     process.ppid,
                     process.name,
                     process.cpu_usage,
                     process.memory_usage,
                     process.status,
                     process.start_time);
        }
    }

    pub fn get_process_tree(&self) -> HashMap<u32, Vec<u32>> {
        let mut tree: HashMap<u32, Vec<u32>> = HashMap::new();

        for process in self.processes.values() {
            tree.entry(process.ppid)
                .or_insert_with(Vec::new)
                .push(process.pid);
        }

        tree
    }

    pub fn find_processes_by_name(&self, name: &str) -> Vec<&ProcessInfo> {
        self.processes.values()
            .filter(|p| p.name.contains(name))
            .collect()
    }

    pub fn get_top_processes(&self, count: usize) -> Vec<&ProcessInfo> {
        let mut sorted: Vec<_> = self.processes.values().collect();
        sorted.sort_by(|a, b| b.cpu_usage.partial_cmp(&a.cpu_usage).unwrap());
        sorted.into_iter().take(count).collect()
    }
}

// Usage example
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut monitor = ProcessMonitor::new(Duration::from_secs(2));

    // Start monitoring in a separate thread
    let monitor_handle = thread::spawn(move || {
        monitor.start_monitoring()
    });

    // Main thread can do other work
    thread::sleep(Duration::from_secs(10));

    // Stop monitoring (in a real implementation, you'd use a channel or atomic flag)
    println!("Monitoring stopped");

    Ok(())
}
```

## Exercise 3: Inter-Process Communication System

**Objective**: Implement a comprehensive IPC system that supports multiple communication methods including pipes, shared memory, and message queues.

### Requirements

- Implement named and unnamed pipes
- Add shared memory with synchronization
- Support message queues
- Provide high-level abstractions
- Include error handling and cleanup

### Solution

```rust
use std::sync::{Arc, Mutex, Condvar};
use std::collections::VecDeque;
use std::thread;
use std::time::Duration;

// Message structure
#[derive(Debug, Clone)]
pub struct Message {
    pub id: u64,
    pub sender: String,
    pub content: Vec<u8>,
    pub timestamp: std::time::SystemTime,
}

// IPC communication methods
pub enum IPCMethod {
    Pipe,
    SharedMemory,
    MessageQueue,
}

// Named pipe implementation
pub struct NamedPipe {
    name: String,
    buffer: Arc<Mutex<VecDeque<Message>>>,
    condition: Arc<Condvar>,
}

impl NamedPipe {
    pub fn new(name: String) -> Self {
        Self {
            name,
            buffer: Arc::new(Mutex::new(VecDeque::new())),
            condition: Arc::new(Condvar::new()),
        }
    }

    pub fn send(&self, message: Message) -> Result<(), String> {
        let mut buffer = self.buffer.lock().unwrap();
        buffer.push_back(message);
        self.condition.notify_one();
        Ok(())
    }

    pub fn receive(&self, timeout: Option<Duration>) -> Result<Message, String> {
        let buffer = Arc::clone(&self.buffer);
        let condition = Arc::clone(&self.condition);

        let mut buffer = buffer.lock().unwrap();

        if let Some(timeout) = timeout {
            let (buffer, _) = condition.wait_timeout(buffer, timeout)
                .map_err(|_| "Wait timeout".to_string())?;

            if buffer.is_empty() {
                return Err("Timeout waiting for message".to_string());
            }
        } else {
            while buffer.is_empty() {
                buffer = condition.wait(buffer).unwrap();
            }
        }

        buffer.pop_front().ok_or("No message available".to_string())
    }
}

// Shared memory implementation
pub struct SharedMemory {
    name: String,
    size: usize,
    data: Arc<Mutex<Vec<u8>>>,
    readers: Arc<Mutex<u32>>,
    writers: Arc<Mutex<u32>>,
    condition: Arc<Condvar>,
}

impl SharedMemory {
    pub fn new(name: String, size: usize) -> Self {
        Self {
            name,
            size,
            data: Arc::new(Mutex::new(vec![0; size])),
            readers: Arc::new(Mutex::new(0)),
            writers: Arc::new(Mutex::new(0)),
            condition: Arc::new(Condvar::new()),
        }
    }

    pub fn write(&self, offset: usize, data: &[u8]) -> Result<(), String> {
        if offset + data.len() > self.size {
            return Err("Write would exceed shared memory size".to_string());
        }

        let mut shared_data = self.data.lock().unwrap();
        let mut writers = self.writers.lock().unwrap();

        // Wait for readers to finish
        while *writers > 0 {
            writers = self.condition.wait(writers).unwrap();
        }

        *writers += 1;
        drop(writers);

        shared_data[offset..offset + data.len()].copy_from_slice(data);

        let mut writers = self.writers.lock().unwrap();
        *writers -= 1;
        self.condition.notify_all();

        Ok(())
    }

    pub fn read(&self, offset: usize, len: usize) -> Result<Vec<u8>, String> {
        if offset + len > self.size {
            return Err("Read would exceed shared memory size".to_string());
        }

        let shared_data = self.data.lock().unwrap();
        let mut readers = self.readers.lock().unwrap();

        // Wait for writers to finish
        while *readers > 0 {
            readers = self.condition.wait(readers).unwrap();
        }

        *readers += 1;
        drop(readers);

        let result = shared_data[offset..offset + len].to_vec();

        let mut readers = self.readers.lock().unwrap();
        *readers -= 1;
        self.condition.notify_all();

        Ok(result)
    }
}

// Message queue implementation
pub struct MessageQueue {
    name: String,
    messages: Arc<Mutex<VecDeque<Message>>>,
    max_size: usize,
    condition: Arc<Condvar>,
}

impl MessageQueue {
    pub fn new(name: String, max_size: usize) -> Self {
        Self {
            name,
            messages: Arc::new(Mutex::new(VecDeque::new())),
            max_size,
            condition: Arc::new(Condvar::new()),
        }
    }

    pub fn enqueue(&self, message: Message) -> Result<(), String> {
        let mut messages = self.messages.lock().unwrap();

        if messages.len() >= self.max_size {
            return Err("Message queue is full".to_string());
        }

        messages.push_back(message);
        self.condition.notify_one();
        Ok(())
    }

    pub fn dequeue(&self, timeout: Option<Duration>) -> Result<Message, String> {
        let messages = Arc::clone(&self.messages);
        let condition = Arc::clone(&self.condition);

        let mut messages = messages.lock().unwrap();

        if let Some(timeout) = timeout {
            let (messages, _) = condition.wait_timeout(messages, timeout)
                .map_err(|_| "Wait timeout".to_string())?;

            if messages.is_empty() {
                return Err("Timeout waiting for message".to_string());
            }
        } else {
            while messages.is_empty() {
                messages = condition.wait(messages).unwrap();
            }
        }

        messages.pop_front().ok_or("No message available".to_string())
    }

    pub fn size(&self) -> usize {
        self.messages.lock().unwrap().len()
    }
}

// High-level IPC manager
pub struct IPCManager {
    pipes: std::collections::HashMap<String, NamedPipe>,
    shared_memories: std::collections::HashMap<String, SharedMemory>,
    message_queues: std::collections::HashMap<String, MessageQueue>,
}

impl IPCManager {
    pub fn new() -> Self {
        Self {
            pipes: std::collections::HashMap::new(),
            shared_memories: std::collections::HashMap::new(),
            message_queues: std::collections::HashMap::new(),
        }
    }

    pub fn create_pipe(&mut self, name: String) -> Result<(), String> {
        if self.pipes.contains_key(&name) {
            return Err("Pipe already exists".to_string());
        }

        self.pipes.insert(name.clone(), NamedPipe::new(name));
        Ok(())
    }

    pub fn create_shared_memory(&mut self, name: String, size: usize) -> Result<(), String> {
        if self.shared_memories.contains_key(&name) {
            return Err("Shared memory already exists".to_string());
        }

        self.shared_memories.insert(name.clone(), SharedMemory::new(name, size));
        Ok(())
    }

    pub fn create_message_queue(&mut self, name: String, max_size: usize) -> Result<(), String> {
        if self.message_queues.contains_key(&name) {
            return Err("Message queue already exists".to_string());
        }

        self.message_queues.insert(name.clone(), MessageQueue::new(name, max_size));
        Ok(())
    }

    pub fn get_pipe(&self, name: &str) -> Option<&NamedPipe> {
        self.pipes.get(name)
    }

    pub fn get_shared_memory(&self, name: &str) -> Option<&SharedMemory> {
        self.shared_memories.get(name)
    }

    pub fn get_message_queue(&self, name: &str) -> Option<&MessageQueue> {
        self.message_queues.get(name)
    }
}

// Usage example
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let mut ipc_manager = IPCManager::new();

    // Create IPC resources
    ipc_manager.create_pipe("test_pipe".to_string())?;
    ipc_manager.create_shared_memory("test_memory".to_string(), 1024)?;
    ipc_manager.create_message_queue("test_queue".to_string(), 100)?;

    // Use named pipe
    if let Some(pipe) = ipc_manager.get_pipe("test_pipe") {
        let message = Message {
            id: 1,
            sender: "sender1".to_string(),
            content: b"Hello, Pipe!".to_vec(),
            timestamp: std::time::SystemTime::now(),
        };

        pipe.send(message)?;

        let received = pipe.receive(Some(Duration::from_secs(1)))?;
        println!("Received from pipe: {:?}", received);
    }

    // Use shared memory
    if let Some(shm) = ipc_manager.get_shared_memory("test_memory") {
        shm.write(0, b"Hello, Shared Memory!")?;

        let data = shm.read(0, 21)?;
        println!("Read from shared memory: {}", String::from_utf8_lossy(&data));
    }

    // Use message queue
    if let Some(queue) = ipc_manager.get_message_queue("test_queue") {
        let message = Message {
            id: 2,
            sender: "sender2".to_string(),
            content: b"Hello, Message Queue!".to_vec(),
            timestamp: std::time::SystemTime::now(),
        };

        queue.enqueue(message)?;

        let received = queue.dequeue(Some(Duration::from_secs(1)))?;
        println!("Received from queue: {:?}", received);
    }

    Ok(())
}
```

## Exercise 4: System Resource Monitor

**Objective**: Create a comprehensive system resource monitoring tool that tracks CPU, memory, disk, and network usage with real-time updates.

### Requirements

- Monitor CPU usage and load average
- Track memory usage and swap
- Monitor disk I/O and usage
- Track network interfaces and traffic
- Provide historical data and trends
- Support alerting and notifications

### Solution

```rust
use std::time::{Duration, Instant};
use std::thread;
use std::sync::{Arc, Mutex};
use std::collections::VecDeque;

// System resource information
#[derive(Debug, Clone)]
pub struct SystemResources {
    pub cpu_usage: f64,
    pub memory_total: u64,
    pub memory_used: u64,
    pub memory_free: u64,
    pub swap_total: u64,
    pub swap_used: u64,
    pub disk_usage: Vec<DiskUsage>,
    pub network_interfaces: Vec<NetworkInterface>,
    pub load_average: (f64, f64, f64),
    pub timestamp: Instant,
}

#[derive(Debug, Clone)]
pub struct DiskUsage {
    pub device: String,
    pub total: u64,
    pub used: u64,
    pub free: u64,
    pub mount_point: String,
}

#[derive(Debug, Clone)]
pub struct NetworkInterface {
    pub name: String,
    pub bytes_sent: u64,
    pub bytes_received: u64,
    pub packets_sent: u64,
    pub packets_received: u64,
}

// Resource monitor
pub struct ResourceMonitor {
    resources: Arc<Mutex<SystemResources>>,
    history: Arc<Mutex<VecDeque<SystemResources>>>,
    max_history: usize,
}

impl ResourceMonitor {
    pub fn new(max_history: usize) -> Self {
        Self {
            resources: Arc::new(Mutex::new(SystemResources {
                cpu_usage: 0.0,
                memory_total: 0,
                memory_used: 0,
                memory_free: 0,
                swap_total: 0,
                swap_used: 0,
                disk_usage: Vec::new(),
                network_interfaces: Vec::new(),
                load_average: (0.0, 0.0, 0.0),
                timestamp: Instant::now(),
            })),
            history: Arc::new(Mutex::new(VecDeque::new())),
            max_history,
        }
    }

    pub fn start_monitoring(&self, interval: Duration) -> Result<(), Box<dyn std::error::Error>> {
        let resources = Arc::clone(&self.resources);
        let history = Arc::clone(&self.history);
        let max_history = self.max_history;

        thread::spawn(move || {
            loop {
                if let Ok(current_resources) = Self::get_current_resources() {
                    // Update current resources
                    {
                        let mut resources = resources.lock().unwrap();
                        *resources = current_resources;
                    }

                    // Update history
                    {
                        let mut history = history.lock().unwrap();
                        history.push_back(current_resources);

                        if history.len() > max_history {
                            history.pop_front();
                        }
                    }
                }

                thread::sleep(interval);
            }
        });

        Ok(())
    }

    fn get_current_resources() -> Result<SystemResources, Box<dyn std::error::Error>> {
        // Get CPU usage
        let cpu_usage = Self::get_cpu_usage()?;

        // Get memory information
        let (memory_total, memory_used, memory_free) = Self::get_memory_info()?;
        let (swap_total, swap_used) = Self::get_swap_info()?;

        // Get disk usage
        let disk_usage = Self::get_disk_usage()?;

        // Get network interfaces
        let network_interfaces = Self::get_network_interfaces()?;

        // Get load average
        let load_average = Self::get_load_average()?;

        Ok(SystemResources {
            cpu_usage,
            memory_total,
            memory_used,
            memory_free,
            swap_total,
            swap_used,
            disk_usage,
            network_interfaces,
            load_average,
            timestamp: Instant::now(),
        })
    }

    fn get_cpu_usage() -> Result<f64, Box<dyn std::error::Error>> {
        // Read /proc/stat to get CPU usage
        let content = std::fs::read_to_string("/proc/stat")?;
        let lines: Vec<&str> = content.lines().collect();

        if lines.is_empty() {
            return Ok(0.0);
        }

        let cpu_line = lines[0];
        let values: Vec<&str> = cpu_line.split_whitespace().collect();

        if values.len() < 8 {
            return Ok(0.0);
        }

        let user: u64 = values[1].parse()?;
        let nice: u64 = values[2].parse()?;
        let system: u64 = values[3].parse()?;
        let idle: u64 = values[4].parse()?;
        let iowait: u64 = values[5].parse()?;
        let irq: u64 = values[6].parse()?;
        let softirq: u64 = values[7].parse()?;

        let total = user + nice + system + idle + iowait + irq + softirq;
        let idle_total = idle + iowait;

        if total == 0 {
            Ok(0.0)
        } else {
            Ok(((total - idle_total) as f64 / total as f64) * 100.0)
        }
    }

    fn get_memory_info() -> Result<(u64, u64, u64), Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string("/proc/meminfo")?;
        let mut total = 0;
        let mut free = 0;
        let mut available = 0;

        for line in content.lines() {
            if line.starts_with("MemTotal:") {
                total = line.split_whitespace().nth(1).unwrap().parse()?;
            } else if line.starts_with("MemFree:") {
                free = line.split_whitespace().nth(1).unwrap().parse()?;
            } else if line.starts_with("MemAvailable:") {
                available = line.split_whitespace().nth(1).unwrap().parse()?;
            }
        }

        let used = total - available;
        Ok((total, used, free))
    }

    fn get_swap_info() -> Result<(u64, u64), Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string("/proc/meminfo")?;
        let mut total = 0;
        let mut free = 0;

        for line in content.lines() {
            if line.starts_with("SwapTotal:") {
                total = line.split_whitespace().nth(1).unwrap().parse()?;
            } else if line.starts_with("SwapFree:") {
                free = line.split_whitespace().nth(1).unwrap().parse()?;
            }
        }

        let used = total - free;
        Ok((total, used))
    }

    fn get_disk_usage() -> Result<Vec<DiskUsage>, Box<dyn std::error::Error>> {
        let mut disk_usage = Vec::new();

        // Use df command to get disk usage
        let output = std::process::Command::new("df")
            .args(&["-h"])
            .output()?;

        let output_str = String::from_utf8(output.stdout)?;

        for line in output_str.lines().skip(1) {
            let fields: Vec<&str> = line.split_whitespace().collect();
            if fields.len() >= 6 {
                let device = fields[0].to_string();
                let total = Self::parse_size(fields[1])?;
                let used = Self::parse_size(fields[2])?;
                let free = Self::parse_size(fields[3])?;
                let mount_point = fields[5].to_string();

                disk_usage.push(DiskUsage {
                    device,
                    total,
                    used,
                    free,
                    mount_point,
                });
            }
        }

        Ok(disk_usage)
    }

    fn get_network_interfaces() -> Result<Vec<NetworkInterface>, Box<dyn std::error::Error>> {
        let mut interfaces = Vec::new();

        // Read /proc/net/dev to get network statistics
        let content = std::fs::read_to_string("/proc/net/dev")?;

        for line in content.lines().skip(2) {
            let parts: Vec<&str> = line.split(':').collect();
            if parts.len() == 2 {
                let name = parts[0].trim().to_string();
                let stats: Vec<&str> = parts[1].split_whitespace().collect();

                if stats.len() >= 8 {
                    let bytes_received = stats[0].parse()?;
                    let packets_received = stats[1].parse()?;
                    let bytes_sent = stats[8].parse()?;
                    let packets_sent = stats[9].parse()?;

                    interfaces.push(NetworkInterface {
                        name,
                        bytes_sent,
                        bytes_received,
                        packets_sent,
                        packets_received,
                    });
                }
            }
        }

        Ok(interfaces)
    }

    fn get_load_average() -> Result<(f64, f64, f64), Box<dyn std::error::Error>> {
        let content = std::fs::read_to_string("/proc/loadavg")?;
        let values: Vec<&str> = content.split_whitespace().collect();

        if values.len() >= 3 {
            let load1 = values[0].parse()?;
            let load5 = values[1].parse()?;
            let load15 = values[2].parse()?;
            Ok((load1, load5, load15))
        } else {
            Ok((0.0, 0.0, 0.0))
        }
    }

    fn parse_size(size_str: &str) -> Result<u64, Box<dyn std::error::Error>> {
        let size_str = size_str.to_lowercase();
        let (number, unit) = if size_str.ends_with('k') {
            (size_str.trim_end_matches('k'), 1024)
        } else if size_str.ends_with('m') {
            (size_str.trim_end_matches('m'), 1024 * 1024)
        } else if size_str.ends_with('g') {
            (size_str.trim_end_matches('g'), 1024 * 1024 * 1024)
        } else {
            (size_str.as_str(), 1)
        };

        let number: f64 = number.parse()?;
        Ok((number * unit as f64) as u64)
    }

    pub fn get_current_resources(&self) -> SystemResources {
        self.resources.lock().unwrap().clone()
    }

    pub fn get_history(&self) -> Vec<SystemResources> {
        self.history.lock().unwrap().iter().cloned().collect()
    }

    pub fn display_resources(&self) {
        let resources = self.get_current_resources();

        println!("\n=== System Resources ===");
        println!("CPU Usage: {:.1}%", resources.cpu_usage);
        println!("Memory: {} MB / {} MB ({:.1}% used)",
                 resources.memory_used / 1024,
                 resources.memory_total / 1024,
                 (resources.memory_used as f64 / resources.memory_total as f64) * 100.0);
        println!("Swap: {} MB / {} MB",
                 resources.swap_used / 1024,
                 resources.swap_total / 1024);
        println!("Load Average: {:.2}, {:.2}, {:.2}",
                 resources.load_average.0,
                 resources.load_average.1,
                 resources.load_average.2);

        println!("\n=== Disk Usage ===");
        for disk in &resources.disk_usage {
            println!("{}: {} MB / {} MB ({:.1}% used) - {}",
                     disk.device,
                     disk.used / 1024,
                     disk.total / 1024,
                     (disk.used as f64 / disk.total as f64) * 100.0,
                     disk.mount_point);
        }

        println!("\n=== Network Interfaces ===");
        for interface in &resources.network_interfaces {
            println!("{}: {} bytes sent, {} bytes received",
                     interface.name,
                     interface.bytes_sent,
                     interface.bytes_received);
        }
    }
}

// Usage example
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let monitor = ResourceMonitor::new(100);

    // Start monitoring
    monitor.start_monitoring(Duration::from_secs(1))?;

    // Display resources every 5 seconds
    for _ in 0..10 {
        thread::sleep(Duration::from_secs(5));
        monitor.display_resources();
    }

    Ok(())
}
```

## Key Takeaways

- **System calls** provide low-level access to operating system services
- **Process management** enables creation and control of processes
- **Thread synchronization** is essential for concurrent programming
- **IPC mechanisms** allow communication between processes
- **Resource monitoring** provides insights into system performance
- **Error handling** is crucial for robust system programming

## Next Steps

- Learn about **device drivers** and hardware interfaces
- Explore **performance optimization** techniques
- Study **real-time systems** programming
- Practice with **advanced system programming** projects

## Resources

- [The Rust Book - FFI](https://doc.rust-lang.org/book/ch19-01-unsafe-rust.html)
- [Rust by Example - FFI](https://doc.rust-lang.org/rust-by-example/std_misc/ffi.html)
- [Linux System Call Reference](https://man7.org/linux/man-pages/man2/syscalls.2.html)
- [Systems Programming with Rust](https://doc.rust-lang.org/book/ch20-00-final-project-a-web-server.html)
