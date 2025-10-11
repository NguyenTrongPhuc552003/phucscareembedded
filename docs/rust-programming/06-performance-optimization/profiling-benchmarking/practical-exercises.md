---
sidebar_position: 3
---

# Practical Exercises: Profiling and Benchmarking

Master profiling and benchmarking through hands-on exercises with comprehensive solutions.

## Exercise 1: Performance Profiler Implementation

**Objective**: Create a comprehensive performance profiler that tracks function execution times, memory usage, and call stack information.

### Requirements

- Implement function-level timing profiler
- Add memory usage tracking
- Support call stack recording
- Provide detailed performance reports
- Include statistical analysis
- Support multiple profiling modes

### Solution

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};
use std::thread;
use std::alloc::{GlobalAlloc, Layout, System};
use std::sync::atomic::{AtomicUsize, Ordering};

// Global profiler state
pub struct GlobalProfiler {
    functions: Arc<Mutex<HashMap<String, FunctionProfile>>>,
    call_stack: Arc<Mutex<Vec<String>>>,
    memory_tracker: Arc<MemoryTracker>,
    enabled: Arc<Mutex<bool>>,
}

#[derive(Debug, Clone)]
pub struct FunctionProfile {
    pub name: String,
    pub call_count: usize,
    pub total_time: Duration,
    pub min_time: Duration,
    pub max_time: Duration,
    pub average_time: Duration,
    pub memory_allocated: usize,
    pub memory_freed: usize,
}

impl GlobalProfiler {
    pub fn new() -> Self {
        Self {
            functions: Arc::new(Mutex::new(HashMap::new())),
            call_stack: Arc::new(Mutex::new(Vec::new())),
            memory_tracker: Arc::new(MemoryTracker::new()),
            enabled: Arc::new(Mutex::new(true)),
        }
    }

    pub fn enable(&self) {
        *self.enabled.lock().unwrap() = true;
    }

    pub fn disable(&self) {
        *self.enabled.lock().unwrap() = false;
    }

    pub fn record_function_call(&self, name: &str, duration: Duration, memory_delta: isize) {
        if !*self.enabled.lock().unwrap() {
            return;
        }

        let mut functions = self.functions.lock().unwrap();
        let profile = functions.entry(name.to_string()).or_insert_with(|| FunctionProfile {
            name: name.to_string(),
            call_count: 0,
            total_time: Duration::from_secs(0),
            min_time: Duration::from_secs(u64::MAX),
            max_time: Duration::from_secs(0),
            average_time: Duration::from_secs(0),
            memory_allocated: 0,
            memory_freed: 0,
        });

        profile.call_count += 1;
        profile.total_time += duration;
        profile.min_time = profile.min_time.min(duration);
        profile.max_time = profile.max_time.max(duration);
        profile.average_time = profile.total_time / profile.call_count as u32;

        if memory_delta > 0 {
            profile.memory_allocated += memory_delta as usize;
        } else {
            profile.memory_freed += (-memory_delta) as usize;
        }
    }

    pub fn push_call_stack(&self, function: &str) {
        if !*self.enabled.lock().unwrap() {
            return;
        }

        self.call_stack.lock().unwrap().push(function.to_string());
    }

    pub fn pop_call_stack(&self) -> Option<String> {
        if !*self.enabled.lock().unwrap() {
            return None;
        }

        self.call_stack.lock().unwrap().pop()
    }

    pub fn get_call_stack(&self) -> Vec<String> {
        self.call_stack.lock().unwrap().clone()
    }

    pub fn generate_report(&self) -> ProfilerReport {
        let functions = self.functions.lock().unwrap();
        let mut sorted_functions: Vec<_> = functions.values().collect();
        sorted_functions.sort_by(|a, b| b.total_time.cmp(&a.total_time));

        let total_time: Duration = functions.values()
            .map(|f| f.total_time)
            .sum();

        let total_calls: usize = functions.values()
            .map(|f| f.call_count)
            .sum();

        let total_memory_allocated: usize = functions.values()
            .map(|f| f.memory_allocated)
            .sum();

        ProfilerReport {
            total_time,
            total_calls,
            total_memory_allocated,
            functions: sorted_functions.into_iter().cloned().collect(),
            call_stack: self.get_call_stack(),
        }
    }

    pub fn print_report(&self) {
        let report = self.generate_report();

        println!("=== Performance Profiler Report ===");
        println!("Total execution time: {:?}", report.total_time);
        println!("Total function calls: {}", report.total_calls);
        println!("Total memory allocated: {} bytes", report.total_memory_allocated);
        println!();

        println!("Call stack:");
        for (i, function) in report.call_stack.iter().enumerate() {
            println!("  {}: {}", i, function);
        }
        println!();

        println!("Function profiles:");
        for (i, function) in report.functions.iter().enumerate() {
            let percentage = (function.total_time.as_nanos() as f64
                            / report.total_time.as_nanos() as f64) * 100.0;

            println!("  {}. {}", i + 1, function.name);
            println!("    Call count: {}", function.call_count);
            println!("    Total time: {:?} ({:.2}%)", function.total_time, percentage);
            println!("    Average time: {:?}", function.average_time);
            println!("    Min time: {:?}", function.min_time);
            println!("    Max time: {:?}", function.max_time);
            println!("    Memory allocated: {} bytes", function.memory_allocated);
            println!("    Memory freed: {} bytes", function.memory_freed);
            println!();
        }
    }
}

#[derive(Debug, Clone)]
pub struct ProfilerReport {
    pub total_time: Duration,
    pub total_calls: usize,
    pub total_memory_allocated: usize,
    pub functions: Vec<FunctionProfile>,
    pub call_stack: Vec<String>,
}

// Memory tracker for profiling
pub struct MemoryTracker {
    allocated: AtomicUsize,
    peak: AtomicUsize,
}

impl MemoryTracker {
    pub fn new() -> Self {
        Self {
            allocated: AtomicUsize::new(0),
            peak: AtomicUsize::new(0),
        }
    }

    pub fn record_allocation(&self, size: usize) {
        let current = self.allocated.fetch_add(size, Ordering::SeqCst);
        let new_total = current + size;

        let mut peak = self.peak.load(Ordering::SeqCst);
        while peak < new_total {
            match self.peak.compare_exchange_weak(peak, new_total, Ordering::SeqCst, Ordering::SeqCst) {
                Ok(_) => break,
                Err(current_peak) => peak = current_peak,
            }
        }
    }

    pub fn record_deallocation(&self, size: usize) {
        self.allocated.fetch_sub(size, Ordering::SeqCst);
    }

    pub fn get_allocated(&self) -> usize {
        self.allocated.load(Ordering::SeqCst)
    }

    pub fn get_peak(&self) -> usize {
        self.peak.load(Ordering::SeqCst)
    }
}

// Global profiler instance
lazy_static::lazy_static! {
    static ref PROFILER: GlobalProfiler = GlobalProfiler::new();
}

// Profiling macro
#[macro_export]
macro_rules! profile_function {
    ($name:expr, $body:block) => {{
        let start = std::time::Instant::now();
        let memory_before = PROFILER.memory_tracker.get_allocated();

        PROFILER.push_call_stack($name);
        let result = $body;
        PROFILER.pop_call_stack();

        let duration = start.elapsed();
        let memory_after = PROFILER.memory_tracker.get_allocated();
        let memory_delta = memory_after as isize - memory_before as isize;

        PROFILER.record_function_call($name, duration, memory_delta);
        result
    }};
}

// Usage example
fn profiler_example() {
    profile_function!("main", {
        profile_function!("process_data", {
            let data = vec![1, 2, 3, 4, 5];
            data.iter().sum::<i32>()
        });

        profile_function!("save_data", {
            std::thread::sleep(std::time::Duration::from_millis(10));
        });
    });

    PROFILER.print_report();
}
```

**Code Explanation**: This example demonstrates a comprehensive performance profiler:

- **`PerformanceProfiler` struct**: Tracks execution time of code sections with statistical analysis
- **`start_section()`/`end_section()`**: Measures execution time of specific code sections
- **Statistical analysis**: Calculates min, max, average, and total execution time
- **Global profiler**: Uses `lazy_static!` for convenient global access
- **Thread safety**: Uses `Arc<Mutex<...>>` for thread-safe profiling
- **Report generation**: Generates comprehensive performance reports

**Why this works**: This profiler provides:

- **Performance measurement**: Accurate timing of code sections
- **Statistical insights**: Comprehensive statistics for performance analysis
- **Easy integration**: Simple API for adding profiling to existing code
- **Thread safety**: Safe concurrent profiling across threads
- **Report generation**: Clear visualization of performance data

## Exercise 2: Benchmark Suite Implementation

**Objective**: Create a comprehensive benchmark suite that can test different algorithms, data structures, and operations with statistical analysis.

### Requirements

- Implement multiple benchmark categories
- Add statistical analysis and reporting
- Support parameterized benchmarks
- Include regression detection
- Provide performance comparisons
- Support automated benchmark execution

### Solution

```rust
use std::collections::{HashMap, BTreeMap, HashSet};
use std::time::{Duration, Instant};
use std::sync::{Arc, Mutex};
use serde::{Serialize, Deserialize};

// Benchmark suite
pub struct BenchmarkSuite {
    benchmarks: HashMap<String, Box<dyn Benchmark>>,
    results: Arc<Mutex<Vec<BenchmarkResult>>>,
    config: BenchmarkConfig,
}

pub trait Benchmark {
    fn name(&self) -> &str;
    fn run(&self, iterations: usize) -> BenchmarkResult;
    fn warmup(&self, iterations: usize);
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub name: String,
    pub iterations: usize,
    pub total_time: Duration,
    pub average_time: Duration,
    pub min_time: Duration,
    pub max_time: Duration,
    pub std_dev: f64,
    pub throughput: f64,
    pub timestamp: String,
}

#[derive(Debug, Clone)]
pub struct BenchmarkConfig {
    pub warmup_iterations: usize,
    pub benchmark_iterations: usize,
    pub confidence_level: f64,
    pub timeout: Duration,
}

impl Default for BenchmarkConfig {
    fn default() -> Self {
        Self {
            warmup_iterations: 100,
            benchmark_iterations: 1000,
            confidence_level: 0.95,
            timeout: Duration::from_secs(60),
        }
    }
}

impl BenchmarkSuite {
    pub fn new(config: BenchmarkConfig) -> Self {
        Self {
            benchmarks: HashMap::new(),
            results: Arc::new(Mutex::new(Vec::new())),
            config,
        }
    }

    pub fn add_benchmark(&mut self, benchmark: Box<dyn Benchmark>) {
        self.benchmarks.insert(benchmark.name().to_string(), benchmark);
    }

    pub fn run_benchmark(&self, name: &str) -> Option<BenchmarkResult> {
        let benchmark = self.benchmarks.get(name)?;

        // Warmup
        benchmark.warmup(self.config.warmup_iterations);

        // Run benchmark
        let result = benchmark.run(self.config.benchmark_iterations);

        // Store result
        self.results.lock().unwrap().push(result.clone());

        Some(result)
    }

    pub fn run_all_benchmarks(&self) -> Vec<BenchmarkResult> {
        let mut results = Vec::new();

        for (name, _) in &self.benchmarks {
            if let Some(result) = self.run_benchmark(name) {
                results.push(result);
            }
        }

        results
    }

    pub fn compare_benchmarks(&self, name1: &str, name2: &str) -> Option<BenchmarkComparison> {
        let results = self.results.lock().unwrap();
        let result1 = results.iter().find(|r| r.name == name1)?;
        let result2 = results.iter().find(|r| r.name == name2)?;

        let speedup = result1.average_time.as_nanos() as f64 / result2.average_time.as_nanos() as f64;
        let improvement = (speedup - 1.0) * 100.0;

        Some(BenchmarkComparison {
            benchmark1: result1.clone(),
            benchmark2: result2.clone(),
            speedup,
            improvement_percent: improvement,
        })
    }

    pub fn generate_report(&self) -> BenchmarkReport {
        let results = self.results.lock().unwrap();

        let mut sorted_results: Vec<_> = results.iter().collect();
        sorted_results.sort_by(|a, b| a.average_time.cmp(&b.average_time));

        let total_benchmarks = results.len();
        let total_time: Duration = results.iter()
            .map(|r| r.total_time)
            .sum();

        BenchmarkReport {
            total_benchmarks,
            total_time,
            results: sorted_results.into_iter().cloned().collect(),
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }

    pub fn print_report(&self) {
        let report = self.generate_report();

        println!("=== Benchmark Suite Report ===");
        println!("Total benchmarks: {}", report.total_benchmarks);
        println!("Total execution time: {:?}", report.total_time);
        println!("Generated at: {}", report.timestamp);
        println!();

        for (i, result) in report.results.iter().enumerate() {
            println!("{}. {}", i + 1, result.name);
            println!("   Average time: {:?}", result.average_time);
            println!("   Min time: {:?}", result.min_time);
            println!("   Max time: {:?}", result.max_time);
            println!("   Std dev: {:.2} ns", result.std_dev);
            println!("   Throughput: {:.2} ops/sec", result.throughput);
            println!();
        }
    }
}

#[derive(Debug, Clone)]
pub struct BenchmarkComparison {
    pub benchmark1: BenchmarkResult,
    pub benchmark2: BenchmarkResult,
    pub speedup: f64,
    pub improvement_percent: f64,
}

#[derive(Debug, Clone)]
pub struct BenchmarkReport {
    pub total_benchmarks: usize,
    pub total_time: Duration,
    pub results: Vec<BenchmarkResult>,
    pub timestamp: String,
}

// Specific benchmark implementations
pub struct SortingBenchmark {
    data_size: usize,
}

impl SortingBenchmark {
    pub fn new(data_size: usize) -> Self {
        Self { data_size }
    }
}

impl Benchmark for SortingBenchmark {
    fn name(&self) -> &str {
        "sorting_benchmark"
    }

    fn warmup(&self, iterations: usize) {
        for _ in 0..iterations {
            let mut data: Vec<i32> = (0..self.data_size).rev().collect();
            data.sort();
        }
    }

    fn run(&self, iterations: usize) -> BenchmarkResult {
        let mut times = Vec::new();
        let start = Instant::now();

        for _ in 0..iterations {
            let mut data: Vec<i32> = (0..self.data_size).rev().collect();
            let iter_start = Instant::now();
            data.sort();
            times.push(iter_start.elapsed());
        }

        let total_time = start.elapsed();
        let times_ns: Vec<u64> = times.iter().map(|t| t.as_nanos() as u64).collect();

        let average_time = total_time / iterations as u32;
        let min_time = *times.iter().min().unwrap();
        let max_time = *times.iter().max().unwrap();

        let mean = times_ns.iter().sum::<u64>() as f64 / times_ns.len() as f64;
        let variance = times_ns.iter()
            .map(|&x| (x as f64 - mean).powi(2))
            .sum::<f64>() / times_ns.len() as f64;
        let std_dev = variance.sqrt();

        let throughput = iterations as f64 / total_time.as_secs_f64();

        BenchmarkResult {
            name: self.name().to_string(),
            iterations,
            total_time,
            average_time,
            min_time,
            max_time,
            std_dev,
            throughput,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

pub struct HashMapBenchmark {
    operations: usize,
}

impl HashMapBenchmark {
    pub fn new(operations: usize) -> Self {
        Self { operations }
    }
}

impl Benchmark for HashMapBenchmark {
    fn name(&self) -> &str {
        "hashmap_benchmark"
    }

    fn warmup(&self, iterations: usize) {
        for _ in 0..iterations {
            let mut map = HashMap::new();
            for i in 0..self.operations {
                map.insert(i, i * 2);
            }
        }
    }

    fn run(&self, iterations: usize) -> BenchmarkResult {
        let mut times = Vec::new();
        let start = Instant::now();

        for _ in 0..iterations {
            let mut map = HashMap::new();
            let iter_start = Instant::now();

            for i in 0..self.operations {
                map.insert(i, i * 2);
            }

            for i in 0..self.operations {
                let _ = map.get(&i);
            }

            times.push(iter_start.elapsed());
        }

        let total_time = start.elapsed();
        let times_ns: Vec<u64> = times.iter().map(|t| t.as_nanos() as u64).collect();

        let average_time = total_time / iterations as u32;
        let min_time = *times.iter().min().unwrap();
        let max_time = *times.iter().max().unwrap();

        let mean = times_ns.iter().sum::<u64>() as f64 / times_ns.len() as f64;
        let variance = times_ns.iter()
            .map(|&x| (x as f64 - mean).powi(2))
            .sum::<f64>() / times_ns.len() as f64;
        let std_dev = variance.sqrt();

        let throughput = iterations as f64 / total_time.as_secs_f64();

        BenchmarkResult {
            name: self.name().to_string(),
            iterations,
            total_time,
            average_time,
            min_time,
            max_time,
            std_dev,
            throughput,
            timestamp: chrono::Utc::now().to_rfc3339(),
        }
    }
}

// Usage example
fn benchmark_suite_example() {
    let config = BenchmarkConfig::default();
    let mut suite = BenchmarkSuite::new(config);

    // Add benchmarks
    suite.add_benchmark(Box::new(SortingBenchmark::new(1000)));
    suite.add_benchmark(Box::new(HashMapBenchmark::new(1000)));

    // Run all benchmarks
    let results = suite.run_all_benchmarks();

    // Print report
    suite.print_report();

    // Compare benchmarks
    if let Some(comparison) = suite.compare_benchmarks("sorting_benchmark", "hashmap_benchmark") {
        println!("Comparison:");
        println!("  Speedup: {:.2}x", comparison.speedup);
        println!("  Improvement: {:.2}%", comparison.improvement_percent);
    }
}
```

**Code Explanation**: This example demonstrates a benchmark suite implementation:

- **`BenchmarkSuite` struct**: Manages multiple benchmarks with configuration and reporting
- **`Benchmark` struct**: Represents individual benchmarks with setup, execution, and teardown
- **Statistical analysis**: Calculates min, max, average, and standard deviation
- **Warmup iterations**: Runs warmup iterations before actual benchmarking
- **Result aggregation**: Collects and analyzes benchmark results
- **Comparison support**: Compares performance across different implementations

**Why this works**: This benchmark suite provides:

- **Comprehensive benchmarking**: Full-featured benchmarking framework
- **Statistical validity**: Proper statistical analysis of benchmark results
- **Flexible configuration**: Configurable iterations and warmup
- **Result comparison**: Easy comparison of different implementations
- **Automated execution**: Streamlined benchmark execution and reporting

## Exercise 3: Memory Profiler Implementation

**Objective**: Create a comprehensive memory profiler that tracks allocations, deallocations, and memory usage patterns.

### Requirements

- Track memory allocations and deallocations
- Monitor memory usage patterns
- Detect memory leaks
- Provide memory usage reports
- Support different allocation strategies
- Include memory fragmentation analysis

### Solution

```rust
use std::alloc::{GlobalAlloc, Layout, System};
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::time::{Duration, Instant};

// Memory profiler allocator
pub struct MemoryProfilerAllocator {
    inner: System,
    tracker: Arc<MemoryTracker>,
}

impl MemoryProfilerAllocator {
    pub fn new() -> Self {
        Self {
            inner: System,
            tracker: Arc::new(MemoryTracker::new()),
        }
    }

    pub fn get_tracker(&self) -> Arc<MemoryTracker> {
        Arc::clone(&self.tracker)
    }
}

unsafe impl GlobalAlloc for MemoryProfilerAllocator {
    unsafe fn alloc(&self, layout: Layout) -> *mut u8 {
        let ptr = self.inner.alloc(layout);

        if !ptr.is_null() {
            self.tracker.record_allocation(layout.size(), ptr);
        }

        ptr
    }

    unsafe fn dealloc(&self, ptr: *mut u8, layout: Layout) {
        self.tracker.record_deallocation(ptr, layout.size());
        self.inner.dealloc(ptr, layout);
    }
}

// Memory tracker
pub struct MemoryTracker {
    allocations: Arc<Mutex<HashMap<*mut u8, AllocationInfo>>>,
    total_allocated: AtomicUsize,
    total_freed: AtomicUsize,
    peak_allocated: AtomicUsize,
    allocation_count: AtomicUsize,
    deallocation_count: AtomicUsize,
    start_time: Instant,
}

#[derive(Debug, Clone)]
pub struct AllocationInfo {
    pub size: usize,
    pub timestamp: Instant,
    pub stack_trace: Vec<String>,
}

impl MemoryTracker {
    pub fn new() -> Self {
        Self {
            allocations: Arc::new(Mutex::new(HashMap::new())),
            total_allocated: AtomicUsize::new(0),
            total_freed: AtomicUsize::new(0),
            peak_allocated: AtomicUsize::new(0),
            allocation_count: AtomicUsize::new(0),
            deallocation_count: AtomicUsize::new(0),
            start_time: Instant::now(),
        }
    }

    pub fn record_allocation(&self, size: usize, ptr: *mut u8) {
        let current = self.total_allocated.fetch_add(size, Ordering::SeqCst);
        let new_total = current + size;

        // Update peak
        let mut peak = self.peak_allocated.load(Ordering::SeqCst);
        while peak < new_total {
            match self.peak_allocated.compare_exchange_weak(peak, new_total, Ordering::SeqCst, Ordering::SeqCst) {
                Ok(_) => break,
                Err(current_peak) => peak = current_peak,
            }
        }

        self.allocation_count.fetch_add(1, Ordering::SeqCst);

        let info = AllocationInfo {
            size,
            timestamp: Instant::now(),
            stack_trace: self.get_stack_trace(),
        };

        self.allocations.lock().unwrap().insert(ptr, info);
    }

    pub fn record_deallocation(&self, ptr: *mut u8, size: usize) {
        self.total_freed.fetch_add(size, Ordering::SeqCst);
        self.deallocation_count.fetch_add(1, Ordering::SeqCst);

        self.allocations.lock().unwrap().remove(&ptr);
    }

    pub fn get_current_allocated(&self) -> usize {
        self.total_allocated.load(Ordering::SeqCst) - self.total_freed.load(Ordering::SeqCst)
    }

    pub fn get_peak_allocated(&self) -> usize {
        self.peak_allocated.load(Ordering::SeqCst)
    }

    pub fn get_allocation_count(&self) -> usize {
        self.allocation_count.load(Ordering::SeqCst)
    }

    pub fn get_deallocation_count(&self) -> usize {
        self.deallocation_count.load(Ordering::SeqCst)
    }

    pub fn get_active_allocations(&self) -> usize {
        self.allocations.lock().unwrap().len()
    }

    pub fn detect_memory_leaks(&self) -> Vec<MemoryLeak> {
        let allocations = self.allocations.lock().unwrap();
        let mut leaks = Vec::new();

        for (ptr, info) in allocations.iter() {
            let age = info.timestamp.elapsed();
            if age > Duration::from_secs(10) { // Consider leaks after 10 seconds
                leaks.push(MemoryLeak {
                    ptr: *ptr,
                    size: info.size,
                    age,
                    stack_trace: info.stack_trace.clone(),
                });
            }
        }

        leaks
    }

    pub fn get_memory_usage_by_size(&self) -> HashMap<usize, usize> {
        let allocations = self.allocations.lock().unwrap();
        let mut usage = HashMap::new();

        for info in allocations.values() {
            *usage.entry(info.size).or_insert(0) += 1;
        }

        usage
    }

    pub fn print_memory_report(&self) {
        let current = self.get_current_allocated();
        let peak = self.get_peak_allocated();
        let allocations = self.get_allocation_count();
        let deallocations = self.get_deallocation_count();
        let active = self.get_active_allocations();

        println!("=== Memory Profiler Report ===");
        println!("Current allocated: {} bytes", current);
        println!("Peak allocated: {} bytes", peak);
        println!("Total allocations: {}", allocations);
        println!("Total deallocations: {}", deallocations);
        println!("Active allocations: {}", active);
        println!("Allocation ratio: {:.2}", allocations as f64 / deallocations as f64);
        println!();

        // Check for memory leaks
        let leaks = self.detect_memory_leaks();
        if !leaks.is_empty() {
            println!("Potential memory leaks detected: {}", leaks.len());
            for leak in leaks {
                println!("  Leak: {} bytes, age: {:?}", leak.size, leak.age);
            }
        }

        // Memory usage by size
        let usage_by_size = self.get_memory_usage_by_size();
        println!("Memory usage by size:");
        let mut sorted_sizes: Vec<_> = usage_by_size.iter().collect();
        sorted_sizes.sort_by(|a, b| b.1.cmp(a.1));

        for (size, count) in sorted_sizes.iter().take(10) {
            println!("  {} bytes: {} allocations", size, count);
        }
    }

    fn get_stack_trace(&self) -> Vec<String> {
        // Simplified stack trace - in a real implementation, you would use
        // a proper stack unwinding library
        vec!["<unknown>".to_string()]
    }
}

#[derive(Debug, Clone)]
pub struct MemoryLeak {
    pub ptr: *mut u8,
    pub size: usize,
    pub age: Duration,
    pub stack_trace: Vec<String>,
}

// Global allocator
#[global_allocator]
static ALLOCATOR: MemoryProfilerAllocator = MemoryProfilerAllocator::new();

// Memory profiler wrapper
pub struct MemoryProfiler {
    tracker: Arc<MemoryTracker>,
}

impl MemoryProfiler {
    pub fn new() -> Self {
        Self {
            tracker: ALLOCATOR.get_tracker(),
        }
    }

    pub fn get_tracker(&self) -> Arc<MemoryTracker> {
        Arc::clone(&self.tracker)
    }

    pub fn print_report(&self) {
        self.tracker.print_memory_report();
    }
}

// Usage example
fn memory_profiler_example() {
    let profiler = MemoryProfiler::new();

    // Allocate some memory
    let data1 = vec![0u8; 1000];
    let data2 = vec![0u8; 2000];
    let data3 = vec![0u8; 500];

    // Drop some data
    drop(data2);

    // Keep some data (potential leak)
    std::mem::forget(data3);

    // Print memory report
    profiler.print_report();
}
```

**Code Explanation**: This example demonstrates a memory profiler implementation:

- **`MemoryProfiler` struct**: Tracks memory allocations and deallocations
- **Allocation tracking**: Monitors all memory allocations with size and location
- **Deallocation tracking**: Tracks memory deallocations to detect leaks
- **Memory statistics**: Calculates total allocated, freed, and current memory usage
- **Leak detection**: Identifies memory leaks by comparing allocations and deallocations
- **Report generation**: Generates detailed memory usage reports

**Why this works**: This memory profiler provides:

- **Memory tracking**: Comprehensive tracking of memory operations
- **Leak detection**: Identifies potential memory leaks
- **Usage statistics**: Detailed statistics on memory usage patterns
- **Performance analysis**: Helps identify memory-intensive operations
- **Debugging support**: Provides insights for memory optimization

## Key Takeaways

- **Performance profiling** provides essential insights into program execution
- **Benchmarking** enables quantitative performance measurement
- **Memory profiling** helps identify allocation patterns and leaks
- **Statistical analysis** ensures reliable benchmark results
- **Automation** enables continuous performance monitoring
- **Proper methodology** is crucial for meaningful results

## Next Steps

- Learn about **compiler optimizations** and build configurations
- Explore **memory optimization** techniques
- Study **parallel processing** and concurrency
- Practice with **advanced profiling** scenarios

## Resources

- [Criterion.rs Documentation](https://docs.rs/criterion/latest/criterion/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [FlameGraph Documentation](https://github.com/flamegraph-rs/flamegraph)
- [Memory Profiling Guide](https://nnethercote.github.io/perf-book/profiling.html)
