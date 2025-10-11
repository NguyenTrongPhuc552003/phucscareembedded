---
sidebar_position: 1
---

# Profiling Tools

Master profiling tools in Rust with comprehensive explanations using the 4W+H framework.

## What Are Profiling Tools?

**What**: Profiling tools are software utilities that analyze program execution to identify performance bottlenecks, memory usage patterns, and resource consumption in Rust applications.

**Why**: Understanding profiling tools is crucial because:

- **Performance Analysis**: Identify where your program spends the most time
- **Memory Optimization**: Detect memory leaks and excessive allocations
- **Bottleneck Detection**: Find the slowest parts of your code
- **Resource Monitoring**: Track CPU, memory, and I/O usage
- **Optimization Guidance**: Provide data-driven insights for improvements
- **Debugging**: Help diagnose performance-related issues

**When**: Use profiling tools when:

- Performance issues are reported or suspected
- Before and after optimization efforts
- During development of performance-critical code
- When memory usage is unexpectedly high
- During load testing and stress testing
- When comparing different implementations

**Where**: Profiling tools are used in:

- Performance-critical applications
- Web servers and APIs
- Data processing pipelines
- Game engines and real-time systems
- Embedded systems and IoT devices
- Machine learning and scientific computing

**How**: Profiling tools work through:

- **Instrumentation**: Adding measurement code to track execution
- **Sampling**: Periodically recording program state
- **Event tracking**: Monitoring specific operations and calls
- **Memory profiling**: Tracking allocations and deallocations
- **Visualization**: Creating charts and graphs of performance data

## Rust Profiling Tools

### Cargo Profiling

**What**: The cargo profiling is the profiling of the cargo.

**Why**: This is essential because it ensures that the cargo is properly profiled.

**When**: Use the cargo profiling when profiling the cargo.

**How**: The cargo profiling is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
// Cargo.toml configuration for profiling
[profile.release]
opt-level = 3          # Maximum optimization
lto = true             # Link-time optimization
codegen-units = 1      # Single codegen unit for better optimization
panic = "abort"        # Smaller binary size
strip = true           # Remove debug symbols

[profile.bench]
opt-level = 3
lto = true
codegen-units = 1
```

**Code Explanation**: This example demonstrates how to use cargo profiling:

- **`profile.release`**: The release profile
- **`opt-level = 3`**: The optimization level
- **`lto = true`**: The link-time optimization
- **`codegen-units = 1`**: The codegen units

**Why this works**: The `profile.release` section configures the release build for maximum performance. `opt-level = 3` enables the highest optimization level, `lto = true` enables link-time optimization for better cross-crate optimizations, and `codegen-units = 1` ensures the entire crate is optimized as a single unit.

### Built-in Timing

**What**: The basic profiling setup is the setup of the basic profiling.

**Why**: This is essential because it ensures that the basic profiling is properly setup.

**When**: Use the basic profiling setup when setting up the basic profiling.

**How**: The basic profiling setup is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
// Basic profiling setup
use std::time::Instant;

// Simple timing profiler
pub struct SimpleProfiler {
    start_time: Instant,
    name: String,
}

impl SimpleProfiler {
    pub fn new(name: &str) -> Self {
        Self {
            start_time: Instant::now(),
            name: name.to_string(),
        }
    }

    pub fn elapsed(&self) -> std::time::Duration {
        self.start_time.elapsed()
    }

    pub fn print_elapsed(&self) {
        println!("{}: {:?}", self.name, self.elapsed());
    }
}
```

**Code Explanation**: The `SimpleProfiler` struct demonstrates basic profiling in Rust:

- **`new(name: &str)`**: Creates a new profiler instance, capturing the current time with `Instant::now()` and storing a descriptive name
- **`elapsed()`**: Returns the duration since the profiler was created by calling `elapsed()` on the stored `Instant`
- **`print_elapsed()`**: Convenience method that prints the elapsed time with the operation name
- **`Drop` implementation**: Automatically prints timing information when the profiler goes out of scope, making it perfect for RAII-style profiling

**Why this works**: This approach uses Rust's ownership system to automatically track timing. When the profiler is created, it captures the current time. When it's dropped (goes out of scope), it automatically prints the elapsed time, making it impossible to forget to measure timing.

### Advanced Profiling with `perf` Integration

**What**: The advanced profiling with `perf` integration is the profiling of the advanced profiling with `perf` integration.

**Why**: This is essential because it ensures that the advanced profiling with `perf` integration is properly implemented.

**When**: Use the advanced profiling with `perf` integration when implementing the advanced profiling with `perf` integration.

**How**: The advanced profiling with `perf` integration is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::time::{Duration, Instant};
use std::collections::HashMap;

// Advanced profiler with detailed metrics
pub struct AdvancedProfiler {
    start_time: Instant,
    name: String,
    checkpoints: HashMap<String, Instant>,
    measurements: Vec<(String, Duration)>,
}

impl AdvancedProfiler {
    pub fn new(name: &str) -> Self {
        Self {
            start_time: Instant::now(),
            name: name.to_string(),
            checkpoints: HashMap::new(),
            measurements: Vec::new(),
        }
    }

    pub fn checkpoint(&mut self, name: &str) {
        self.checkpoints.insert(name.to_string(), Instant::now());
    }

    pub fn measure_section(&mut self, name: &str) -> Duration {
        if let Some(start) = self.checkpoints.remove(name) {
            let duration = start.elapsed();
            self.measurements.push((name.to_string(), duration));
            duration
        } else {
            Duration::from_secs(0)
        }
    }

    pub fn get_total_time(&self) -> Duration {
        self.start_time.elapsed()
    }
}
```

**Code Explanation**: This example demonstrates how to use advanced profiling with `perf` integration:

- **`AdvancedProfiler`**: The advanced profiler struct
- **`checkpoints`**: The checkpoints HashMap
- **`measurements`**: The measurements Vec
- **`checkpoint(name)`**: The checkpoint function
- **`measure_section(name)`**: The measure section function
- **`get_total_time()`**: The get total time function

**Why this works**: This pattern allows Rust to use advanced profiling with `perf` integration. The `AdvancedProfiler` struct provides a advanced profiler implementation, the `checkpoints` HashMap stores named timing points that can be referenced later for measuring specific code sections, the `measurements` Vec records all measured durations with their names for later analysis, the `checkpoint(name)` function records a timing point with a descriptive name, allowing you to measure the duration between any two checkpoints, the `measure_section(name)` function calculates the duration since a checkpoint was set and stores the measurement, and the `get_total_time()` function returns the total elapsed time since the profiler was created.

## Memory Profiling

### Memory Usage Tracking

**What**: The memory usage tracking is the tracking of the memory usage.

**Why**: This is essential because it ensures that the memory usage is properly tracked.

**When**: Use the memory usage tracking when tracking the memory usage.

**How**: The memory usage tracking is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};

// Custom allocator for memory profiling
pub struct ProfilingAllocator {
    allocated: AtomicUsize,
    peak: AtomicUsize,
}

impl ProfilingAllocator {
    pub fn new() -> Self {
        Self {
            allocated: AtomicUsize::new(0),
            peak: AtomicUsize::new(0),
        }
    }

    pub fn get_allocated(&self) -> usize {
        self.allocated.load(Ordering::SeqCst)
    }

    pub fn get_peak(&self) -> usize {
        self.peak.load(Ordering::SeqCst)
    }

    pub fn reset(&self) {
        self.allocated.store(0, Ordering::SeqCst);
        self.peak.store(0, Ordering::SeqCst);
    }
}

unsafe impl GlobalAlloc for ProfilingAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let size = layout.size();
        let ptr = System.alloc(layout);

        if !ptr.is_null() {
            let current = self.allocated.fetch_add(size, Ordering::SeqCst);
            let new_total = current + size;

            // Update peak if necessary
            let mut peak = self.peak.load(Ordering::SeqCst);
            while peak < new_total {
                match self.peak.compare_exchange_weak(peak, new_total, Ordering::SeqCst, Ordering::SeqCst) {
                    Ok(_) => break,
                    Err(current_peak) => peak = current_peak,
                }
            }
        }

        ptr
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        let size = layout.size();
        self.allocated.fetch_sub(size, Ordering::SeqCst);
        System.dealloc(ptr, layout);
    }
}

// Global allocator instance
#[global_allocator]
static ALLOCATOR: ProfilingAllocator = ProfilingAllocator::new();

// Memory profiling utilities
pub struct MemoryProfiler {
    start_allocated: usize,
    start_peak: usize,
    name: String,
}

impl MemoryProfiler {
    pub fn new(name: &str) -> Self {
        Self {
            start_allocated: ALLOCATOR.get_allocated(),
            start_peak: ALLOCATOR.get_peak(),
            name: name.to_string(),
        }
    }

    pub fn get_memory_delta(&self) -> (usize, usize) {
        let current_allocated = ALLOCATOR.get_allocated();
        let current_peak = ALLOCATOR.get_peak();

        (
            current_allocated.saturating_sub(self.start_allocated),
            current_peak.saturating_sub(self.start_peak),
        )
    }

    pub fn print_memory_report(&self) {
        let (delta_allocated, delta_peak) = self.get_memory_delta();
        println!("=== Memory Report for {} ===", self.name);
        println!("Current allocated: {} bytes", ALLOCATOR.get_allocated());
        println!("Peak allocated: {} bytes", ALLOCATOR.get_peak());
        println!("Delta allocated: {} bytes", delta_allocated);
        println!("Delta peak: {} bytes", delta_peak);
    }
}

// Usage example
fn memory_profiling_example() {
    let _profiler = MemoryProfiler::new("memory_test");

    // Allocate some memory
    let mut data = Vec::with_capacity(1000);
    for i in 0..1000 {
        data.push(i);
    }

    // Drop the data
    drop(data);

    // Profiler will show memory usage
}
```

**Code Explanation**: This example demonstrates how to use memory profiling:

- **`ProfilingAllocator`**: The profiling allocator struct
- **`allocated`**: The allocated AtomicUsize
- **`peak`**: The peak AtomicUsize
- **`get_allocated()`**: The get allocated function
- **`get_peak()`**: The get peak function
- **`reset()`**: The reset function

**Why this works**: This pattern allows Rust to use memory profiling. The `ProfilingAllocator` struct provides a profiling allocator implementation, the `allocated` AtomicUsize tracks the total amount of memory allocated, the `peak` AtomicUsize tracks the peak memory usage, the `get_allocated()` function returns the total amount of memory allocated, the `get_peak()` function returns the peak memory usage, and the `reset()` function resets the allocator.

### Heap Profiling

**What**: The heap profiler is the profiler of the heap.

**Why**: This is essential because it ensures that the heap profiler is properly implemented.

**When**: Use the heap profiler when implementing the heap profiler.

**How**: The heap profiler is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

// Heap profiler for tracking allocations
pub struct HeapProfiler {
    allocations: Arc<Mutex<HashMap<String, AllocationInfo>>>,
}

#[derive(Debug, Clone)]
pub struct AllocationInfo {
    pub count: usize,
    pub total_size: usize,
    pub average_size: f64,
    pub max_size: usize,
    pub min_size: usize,
}

impl HeapProfiler {
    pub fn new() -> Self {
        Self {
            allocations: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn record_allocation(&self, location: &str, size: usize) {
        let mut allocations = self.allocations.lock().unwrap();
        let info = allocations.entry(location.to_string()).or_insert(AllocationInfo {
            count: 0,
            total_size: 0,
            average_size: 0.0,
            max_size: 0,
            min_size: usize::MAX,
        });

        info.count += 1;
        info.total_size += size;
        info.average_size = info.total_size as f64 / info.count as f64;
        info.max_size = info.max_size.max(size);
        info.min_size = info.min_size.min(size);
    }

    pub fn print_report(&self) {
        let allocations = self.allocations.lock().unwrap();
        println!("=== Heap Profiling Report ===");

        let mut sorted: Vec<_> = allocations.iter().collect();
        sorted.sort_by(|a, b| b.1.total_size.cmp(&a.1.total_size));

        for (location, info) in sorted {
            println!("Location: {}", location);
            println!("  Count: {}", info.count);
            println!("  Total size: {} bytes", info.total_size);
            println!("  Average size: {:.2} bytes", info.average_size);
            println!("  Max size: {} bytes", info.max_size);
            println!("  Min size: {} bytes", info.min_size);
            println!();
        }
    }
}

// Global heap profiler
lazy_static::lazy_static! {
    static ref HEAP_PROFILER: HeapProfiler = HeapProfiler::new();
}

// Macro for easy profiling
#[macro_export]
macro_rules! profile_allocation {
    ($location:expr, $size:expr) => {
        HEAP_PROFILER.record_allocation($location, $size);
    };
}

// Usage example
fn heap_profiling_example() {
    // Simulate allocations
    profile_allocation!("vec_creation", 1000);
    profile_allocation!("string_creation", 100);
    profile_allocation!("vec_creation", 2000);

    HEAP_PROFILER.print_report();
}
```

**Code Explanation**: This example demonstrates how to use heap profiling:

- **`HeapProfiler`**: The heap profiler struct
- **`allocations`**: The allocations HashMap
- **`record_allocation(location, size)`**: The record allocation function
- **`print_report()`**: The print report function

**Why this works**: This pattern allows Rust to use heap profiling. The `HeapProfiler` struct provides a heap profiler implementation, the `allocations` HashMap tracks the allocations, the `record_allocation(location, size)` function records an allocation, and the `print_report()` function prints the report.

## CPU Usage Monitoring

**What**: The CPU usage monitoring is the monitoring of the CPU usage.

**Why**: This is essential because it ensures that the CPU usage is properly monitored.

**When**: Use the CPU usage monitoring when monitoring the CPU usage.

**How**: The CPU usage monitoring is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::time::{Duration, Instant};
use std::thread;
use std::sync::{Arc, Mutex};

// CPU profiler for tracking execution time
pub struct CPUProfiler {
    start_time: Instant,
    samples: Arc<Mutex<Vec<CPUSample>>>,
    sampling_interval: Duration,
}

#[derive(Debug, Clone)]
pub struct CPUSample {
    pub timestamp: Instant,
    pub function_name: String,
    pub duration: Duration,
    pub thread_id: u64,
}

impl CPUProfiler {
    pub fn new(sampling_interval: Duration) -> Self {
        Self {
            start_time: Instant::now(),
            samples: Arc::new(Mutex::new(Vec::new())),
            sampling_interval,
        }
    }

    pub fn start_sampling(&self) {
        let samples = Arc::clone(&self.samples);
        let interval = self.sampling_interval;

        thread::spawn(move || {
            loop {
                thread::sleep(interval);
                // In a real implementation, you would sample the call stack here
            }
        });
    }

    pub fn record_function_call(&self, function_name: &str, duration: Duration) {
        let sample = CPUSample {
            timestamp: Instant::now(),
            function_name: function_name.to_string(),
            duration,
            thread_id: thread_id::get(),
        };

        self.samples.lock().unwrap().push(sample);
    }

    pub fn get_function_stats(&self) -> HashMap<String, FunctionStats> {
        let samples = self.samples.lock().unwrap();
        let mut stats: HashMap<String, FunctionStats> = HashMap::new();

        for sample in samples.iter() {
            let entry = stats.entry(sample.function_name.clone()).or_insert(FunctionStats {
                call_count: 0,
                total_time: Duration::from_secs(0),
                average_time: Duration::from_secs(0),
                max_time: Duration::from_secs(0),
                min_time: Duration::from_secs(u64::MAX),
            });

            entry.call_count += 1;
            entry.total_time += sample.duration;
            entry.average_time = entry.total_time / entry.call_count as u32;
            entry.max_time = entry.max_time.max(sample.duration);
            entry.min_time = entry.min_time.min(sample.duration);
        }

        stats
    }

    pub fn print_cpu_report(&self) {
        let stats = self.get_function_stats();
        println!("=== CPU Profiling Report ===");

        let mut sorted: Vec<_> = stats.iter().collect();
        sorted.sort_by(|a, b| b.1.total_time.cmp(&a.1.total_time));

        for (function, stat) in sorted {
            println!("Function: {}", function);
            println!("  Call count: {}", stat.call_count);
            println!("  Total time: {:?}", stat.total_time);
            println!("  Average time: {:?}", stat.average_time);
            println!("  Max time: {:?}", stat.max_time);
            println!("  Min time: {:?}", stat.min_time);
            println!();
        }
    }
}

#[derive(Debug, Clone)]
pub struct FunctionStats {
    pub call_count: usize,
    pub total_time: Duration,
    pub average_time: Duration,
    pub max_time: Duration,
    pub min_time: Duration,
}

// Thread ID utility
fn thread_id() -> u64 {
    thread::current().id().as_u64().get()
}

// Usage example
fn cpu_profiling_example() {
    let profiler = CPUProfiler::new(Duration::from_millis(10));

    // Simulate function calls
    profiler.record_function_call("process_data", Duration::from_millis(50));
    profiler.record_function_call("validate_input", Duration::from_millis(10));
    profiler.record_function_call("process_data", Duration::from_millis(45));

    profiler.print_cpu_report();
}
```

**Code Explanation**: This example demonstrates how to use CPU profiling:

- **`CPUProfiler`**: The CPU profiler struct
- **`samples`**: The samples Arc<Mutex<Vec<CPUSample>>>
- **`sampling_interval`**: The sampling interval
- **`record_function_call(function_name, duration)`**: The record function call function
- **`get_function_stats()`**: The get function stats function
- **`print_cpu_report()`**: The print CPU report function

**Why this works**: This pattern allows Rust to use CPU profiling. The `CPUProfiler` struct provides a CPU profiler implementation, the `samples` Arc<Mutex<Vec<CPUSample>>> records the samples, the `sampling_interval` is the sampling interval, the `record_function_call(function_name, duration)` function records a function call, the `get_function_stats()` function returns the function stats, and the `print_cpu_report()` function prints the CPU report.

## Basic Flame Graph Setup

**What**: The flame graph generation is the generation of the flame graph.

**Why**: This is essential because it ensures that the flame graph is properly generated.

**When**: Use the flame graph generation when generating the flame graph.

**How**: The flame graph generation is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

// Flame graph data structure
pub struct FlameGraph {
    samples: Vec<StackSample>,
    start_time: Instant,
}

#[derive(Debug, Clone)]
pub struct StackSample {
    pub timestamp: Instant,
    pub stack: Vec<String>,
    pub duration: Duration,
}

impl FlameGraph {
    pub fn new() -> Self {
        Self {
            samples: Vec::new(),
            start_time: Instant::now(),
        }
    }

    pub fn record_sample(&mut self, stack: Vec<String>, duration: Duration) {
        self.samples.push(StackSample {
            timestamp: Instant::now(),
            stack,
            duration,
        });
    }

    pub fn generate_flame_graph_data(&self) -> String {
        let mut output = String::new();
        output.push_str("digraph flame_graph {\n");

        for sample in &self.samples {
            if sample.stack.len() > 1 {
                for i in 0..sample.stack.len() - 1 {
                    let from = &sample.stack[i];
                    let to = &sample.stack[i + 1];
                    output.push_str(&format!("  \"{}\" -> \"{}\" [label=\"{:?}\"];\n", from, to, sample.duration));
                }
            }
        }

        output.push_str("}\n");
        output
    }

    pub fn save_flame_graph(&self, filename: &str) -> std::io::Result<()> {
        let data = self.generate_flame_graph_data();
        std::fs::write(filename, data)
    }
}

// Profiling macro for automatic stack tracking
#[macro_export]
macro_rules! profile_function {
    ($name:expr, $body:block) => {{
        let start = std::time::Instant::now();
        let result = $body;
        let duration = start.elapsed();

        // Record the function call
        println!("Function {} took {:?}", $name, duration);
        result
    }};
}

// Usage example
fn flame_graph_example() {
    let mut flame_graph = FlameGraph::new();

    // Simulate function calls with stack traces
    flame_graph.record_sample(
        vec!["main".to_string(), "process_data".to_string()],
        Duration::from_millis(100),
    );

    flame_graph.record_sample(
        vec!["main".to_string(), "process_data".to_string(), "validate".to_string()],
        Duration::from_millis(50),
    );

    flame_graph.record_sample(
        vec!["main".to_string(), "save_data".to_string()],
        Duration::from_millis(75),
    );

    // Save flame graph data
    flame_graph.save_flame_graph("flame_graph.dot").unwrap();
}
```

**Code Explanation**: This example demonstrates how to use flame graph generation:

- **`FlameGraph`**: The flame graph struct
- **`samples`**: The samples Vec
- **`start_time`**: The start time
- **`record_sample(stack, duration)`**: The record sample function
- **`generate_flame_graph_data()`**: The generate flame graph data function
- **`save_flame_graph(filename)`**: The save flame graph function

**Why this works**: This pattern allows Rust to use flame graph generation. The `FlameGraph` struct provides a flame graph implementation, the `samples` Vec records the samples, the `start_time` is the start time, the `record_sample(stack, duration)` function records a sample, the `generate_flame_graph_data()` function generates the flame graph data, and the `save_flame_graph(filename)` function saves the flame graph.

## Bottleneck Detection

**What**: The performance analysis is the analysis of the performance.

**Why**: This is essential because it ensures that the performance is properly analyzed.

**When**: Use the performance analysis when analyzing the performance.

**How**: The performance analysis is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

// Performance analyzer for detecting bottlenecks
pub struct PerformanceAnalyzer {
    measurements: HashMap<String, Vec<Duration>>,
    thresholds: HashMap<String, Duration>,
}

impl PerformanceAnalyzer {
    pub fn new() -> Self {
        Self {
            measurements: HashMap::new(),
            thresholds: HashMap::new(),
        }
    }

    pub fn set_threshold(&mut self, operation: &str, threshold: Duration) {
        self.thresholds.insert(operation.to_string(), threshold);
    }

    pub fn record_measurement(&mut self, operation: &str, duration: Duration) {
        self.measurements
            .entry(operation.to_string())
            .or_insert_with(Vec::new)
            .push(duration);
    }

    pub fn analyze_bottlenecks(&self) -> Vec<BottleneckReport> {
        let mut reports = Vec::new();

        for (operation, measurements) in &self.measurements {
            if let Some(threshold) = self.thresholds.get(operation) {
                let average = measurements.iter().sum::<Duration>() / measurements.len() as u32;
                let max = measurements.iter().max().copied().unwrap_or_default();

                if average > *threshold || max > *threshold {
                    reports.push(BottleneckReport {
                        operation: operation.clone(),
                        average_time: average,
                        max_time: max,
                        threshold: *threshold,
                        measurement_count: measurements.len(),
                        severity: if max > *threshold * 2 {
                            BottleneckSeverity::Critical
                        } else if average > *threshold {
                            BottleneckSeverity::High
                        } else {
                            BottleneckSeverity::Medium
                        },
                    });
                }
            }
        }

        reports.sort_by(|a, b| b.severity.cmp(&a.severity));
        reports
    }

    pub fn print_analysis_report(&self) {
        let bottlenecks = self.analyze_bottlenecks();

        println!("=== Performance Analysis Report ===");

        if bottlenecks.is_empty() {
            println!("No bottlenecks detected!");
            return;
        }

        for report in bottlenecks {
            println!("Operation: {}", report.operation);
            println!("  Severity: {:?}", report.severity);
            println!("  Average time: {:?}", report.average_time);
            println!("  Max time: {:?}", report.max_time);
            println!("  Threshold: {:?}", report.threshold);
            println!("  Measurements: {}", report.measurement_count);
            println!();
        }
    }
}

#[derive(Debug, Clone)]
pub struct BottleneckReport {
    pub operation: String,
    pub average_time: Duration,
    pub max_time: Duration,
    pub threshold: Duration,
    pub measurement_count: usize,
    pub severity: BottleneckSeverity,
}

#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub enum BottleneckSeverity {
    Low,
    Medium,
    High,
    Critical,
}

// Usage example
fn performance_analysis_example() {
    let mut analyzer = PerformanceAnalyzer::new();

    // Set thresholds
    analyzer.set_threshold("database_query", Duration::from_millis(100));
    analyzer.set_threshold("file_io", Duration::from_millis(50));
    analyzer.set_threshold("computation", Duration::from_millis(200));

    // Record measurements
    analyzer.record_measurement("database_query", Duration::from_millis(150));
    analyzer.record_measurement("database_query", Duration::from_millis(120));
    analyzer.record_measurement("file_io", Duration::from_millis(30));
    analyzer.record_measurement("computation", Duration::from_millis(250));

    analyzer.print_analysis_report();
}
```

**Code Explanation**: This example demonstrates how to use performance analysis:

- **`PerformanceAnalyzer`**: The performance analyzer struct
- **`measurements`**: The measurements HashMap
- **`thresholds`**: The thresholds HashMap
- **`set_threshold(operation, threshold)`**: The set threshold function
- **`record_measurement(operation, duration)`**: The record measurement function
- **`analyze_bottlenecks()`**: The analyze bottlenecks function
- **`print_analysis_report()`**: The print analysis report function

**Why this works**: This pattern allows Rust to use performance analysis. The `PerformanceAnalyzer` struct provides a performance analyzer implementation, the `measurements` HashMap records the measurements, the `thresholds` HashMap records the thresholds, the `set_threshold(operation, threshold)` function sets the threshold, the `record_measurement(operation, duration)` function records a measurement, the `analyze_bottlenecks()` function analyzes the bottlenecks, and the `print_analysis_report()` function prints the analysis report.

## Key Takeaways

- **Profiling tools** provide essential insights into program performance
- **Memory profiling** helps identify allocation patterns and leaks
- **CPU profiling** reveals execution bottlenecks and hotspots
- **Flame graphs** visualize call stack performance
- **Performance analysis** guides optimization efforts
- **Automated profiling** enables continuous performance monitoring

## Next Steps

- Learn about **benchmarking** and performance measurement
- Explore **compiler optimizations** and build configurations
- Study **memory optimization** techniques
- Practice with **advanced profiling** tools

## Resources

- [Criterion.rs Documentation](https://docs.rs/criterion/latest/criterion/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [FlameGraph Documentation](https://github.com/flamegraph-rs/flamegraph)
- [Perf Documentation](https://perf.wiki.kernel.org/)
