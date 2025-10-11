---
sidebar_position: 2
---

# Benchmarking Techniques

Master benchmarking techniques in Rust with comprehensive explanations using the 4W+H framework.

## What Are Benchmarking Techniques?

**What**: Benchmarking techniques are systematic methods for measuring and comparing the performance of code, algorithms, and systems to establish baselines and track improvements.

**Why**: Understanding benchmarking techniques is crucial because:

- **Performance Measurement**: Quantify the actual performance of your code
- **Optimization Validation**: Verify that optimizations actually improve performance
- **Regression Detection**: Catch performance regressions in CI/CD pipelines
- **Comparative Analysis**: Compare different implementations and algorithms
- **Capacity Planning**: Understand system limits and resource requirements
- **Scientific Rigor**: Provide statistically valid performance data

**When**: Use benchmarking techniques when:

- Implementing performance-critical code
- Comparing different algorithms or data structures
- Validating optimization efforts
- Setting up continuous performance monitoring
- Preparing for production deployment
- Researching and developing new features

**Where**: Benchmarking techniques are used in:

- Performance-critical applications and libraries
- Web servers and APIs
- Database systems and data processing
- Game engines and real-time systems
- Machine learning and scientific computing
- Embedded systems and IoT devices

**How**: Benchmarking techniques are implemented through:

- **Statistical Analysis**: Using proper statistical methods for valid results
- **Controlled Testing**: Eliminating external factors and variables
- **Reproducible Results**: Ensuring consistent and repeatable measurements
- **Automated Testing**: Integrating benchmarks into CI/CD pipelines
- **Performance Baselines**: Establishing reference points for comparison

## Criterion.rs Benchmarking

### Basic Benchmarking Setup

**What**: The basic benchmarking setup is the setup of the basic benchmarking.

**Why**: This is essential because it ensures that the basic benchmarking is properly setup.

**When**: Use the basic benchmarking setup when setting up the basic benchmarking.

**How**: The basic benchmarking setup is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use criterion::{black_box, criterion_group, criterion_main, Criterion, BenchmarkId};
use std::time::Duration;

// Simple function to benchmark
fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// Optimized iterative version
fn fibonacci_iterative(n: u64) -> u64 {
    if n <= 1 {
        return n;
    }

    let mut a = 0;
    let mut b = 1;
    for _ in 2..=n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}

// Basic benchmark function
fn bench_fibonacci(c: &mut Criterion) {
    c.bench_function("fibonacci_recursive", |b| {
        b.iter(|| fibonacci(black_box(20)))
    });

    c.bench_function("fibonacci_iterative", |b| {
        b.iter(|| fibonacci_iterative(black_box(20)))
    });
}
```

**Code Explanation**: This demonstrates the basic Criterion.rs benchmarking pattern:

- **`c.bench_function(name, closure)`**: Creates a benchmark with a descriptive name and a closure that defines what to benchmark
- **`b.iter(|| code)`**: The closure passed to `iter()` contains the code to be benchmarked. Criterion will call this closure many times and measure the execution time
- **`black_box(value)`**: Prevents the compiler from optimizing away the computation. Without this, the compiler might optimize the entire function call away, making the benchmark meaningless
- **Function comparison**: By benchmarking both recursive and iterative versions, we can compare their performance directly

**Why this works**: The `black_box` function is crucial because it tells the compiler "this value is used" without actually doing anything with it. This prevents the compiler from optimizing away the computation we're trying to measure, ensuring we get accurate timing data.

### Advanced Benchmarking Patterns

**What**: The advanced benchmarking patterns are the patterns of the advanced benchmarking.

**Why**: This is essential because it ensures that the advanced benchmarking is properly implemented.

**When**: Use the advanced benchmarking patterns when implementing the advanced benchmarking.

**How**: The advanced benchmarking patterns are implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use criterion::{criterion_group, criterion_main, Criterion, BenchmarkId, Throughput};
use std::collections::{HashMap, BTreeMap};
use std::time::Duration;

// Benchmark different data structures
fn bench_data_structures(c: &mut Criterion) {
    let mut group = c.benchmark_group("data_structures");

    for size in [100, 1000, 10000].iter() {
        let keys: Vec<String> = (0..*size).map(|i| format!("key_{}", i)).collect();
        let values: Vec<i32> = (0..*size).collect();

        // HashMap benchmark
        group.bench_with_input(BenchmarkId::new("hashmap_insert", size), size, |b, &size| {
            b.iter(|| {
                let mut map = HashMap::new();
                for i in 0..size {
                    map.insert(keys[i].clone(), values[i]);
                }
                map
            })
        });

        // BTreeMap benchmark
        group.bench_with_input(BenchmarkId::new("btreemap_insert", size), size, |b, &size| {
            b.iter(|| {
                let mut map = BTreeMap::new();
                for i in 0..size {
                    map.insert(keys[i].clone(), values[i]);
                }
                map
            })
        });
    }

    group.finish();
}

// Memory usage benchmarking
fn bench_memory_usage(c: &mut Criterion) {
    let mut group = c.benchmark_group("memory_usage");

    for size in [1000, 10000, 100000].iter() {
        group.throughput(Throughput::Elements(*size as u64));

        group.bench_with_input(BenchmarkId::new("vec_allocation", size), size, |b, &size| {
            b.iter(|| {
                let mut vec = Vec::with_capacity(size);
                for i in 0..size {
                    vec.push(i);
                }
                vec
            })
        });

        group.bench_with_input(BenchmarkId::new("vec_no_capacity", size), size, |b, &size| {
            b.iter(|| {
                let mut vec = Vec::new();
                for i in 0..size {
                    vec.push(i);
                }
                vec
            })
        });
    }

    group.finish();
}

// Algorithm comparison
fn bench_sorting_algorithms(c: &mut Criterion) {
    let mut group = c.benchmark_group("sorting_algorithms");

    for size in [100, 1000, 10000].iter() {
        let data: Vec<i32> = (0..*size).rev().collect();

        // Quick sort
        group.bench_with_input(BenchmarkId::new("quicksort", size), &data, |b, data| {
            b.iter_batched(
                || data.clone(),
                |mut data| {
                    data.sort_unstable();
                    data
                },
                criterion::BatchSize::SmallInput,
            )
        });

        // Merge sort
        group.bench_with_input(BenchmarkId::new("mergesort", size), &data, |b, data| {
            b.iter_batched(
                || data.clone(),
                |mut data| {
                    data.sort();
                    data
                },
                criterion::BatchSize::SmallInput,
            )
        });
    }

    group.finish();
}

// I/O benchmarking
fn bench_io_operations(c: &mut Criterion) {
    let mut group = c.benchmark_group("io_operations");

    for size in [1024, 10240, 102400].iter() {
        let data = vec![0u8; *size];

        group.bench_with_input(BenchmarkId::new("write_file", size), &data, |b, data| {
            b.iter(|| {
                std::fs::write("/tmp/benchmark_test", data).unwrap();
            })
        });

        group.bench_with_input(BenchmarkId::new("read_file", size), &data, |b, _data| {
            b.iter(|| {
                std::fs::read("/tmp/benchmark_test").unwrap()
            })
        });
    }

    group.finish();
}

criterion_group!(
    benches,
    bench_data_structures,
    bench_memory_usage,
    bench_sorting_algorithms,
    bench_io_operations
);
criterion_main!(benches);
```

**Code Explanation**: This example demonstrates how to use advanced benchmarking patterns:

- **`bench_data_structures`**: The function that benchmarks the data structures
- **`bench_memory_usage`**: The function that benchmarks the memory usage
- **`bench_sorting_algorithms`**: The function that benchmarks the sorting algorithms
- **`bench_io_operations`**: The function that benchmarks the I/O operations

**Why this works**: This pattern allows Rust to use advanced benchmarking patterns. The `bench_data_structures` function benchmarks the data structures, the `bench_memory_usage` function benchmarks the memory usage, the `bench_sorting_algorithms` function benchmarks the sorting algorithms, and the `bench_io_operations` function benchmarks the I/O operations.

## Statistical Analysis

### Robust Statistical Methods

**What**: The robust statistical methods are the methods of the robust statistical.

**Why**: This is essential because it ensures that the robust statistical is properly implemented.

**When**: Use the robust statistical methods when implementing the robust statistical.

**How**: The robust statistical methods are implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};

// Statistical analysis for benchmark results
pub struct BenchmarkAnalyzer {
    measurements: Vec<f64>,
    name: String,
}

impl BenchmarkAnalyzer {
    pub fn new(name: &str) -> Self {
        Self {
            measurements: Vec::new(),
            name: name.to_string(),
        }
    }

    pub fn add_measurement(&mut self, duration: Duration) {
        self.measurements.push(duration.as_nanos() as f64);
    }

    pub fn calculate_statistics(&self) -> BenchmarkStatistics {
        if self.measurements.is_empty() {
            return BenchmarkStatistics::default();
        }

        let mut sorted = self.measurements.clone();
        sorted.sort_by(|a, b| a.partial_cmp(b).unwrap());

        let n = sorted.len();
        let sum: f64 = sorted.iter().sum();
        let mean = sum / n as f64;

        // Calculate variance
        let variance = sorted.iter()
            .map(|x| (x - mean).powi(2))
            .sum::<f64>() / (n - 1) as f64;
        let std_dev = variance.sqrt();

        // Calculate percentiles
        let p50 = self.percentile(&sorted, 0.5);
        let p90 = self.percentile(&sorted, 0.9);
        let p95 = self.percentile(&sorted, 0.95);
        let p99 = self.percentile(&sorted, 0.99);

        // Calculate confidence interval (95%)
        let se = std_dev / (n as f64).sqrt();
        let t_value = 1.96; // Approximate for large n
        let margin = t_value * se;

        BenchmarkStatistics {
            count: n,
            mean,
            median: p50,
            std_dev,
            min: sorted[0],
            max: sorted[n - 1],
            p90,
            p95,
            p99,
            confidence_interval: (mean - margin, mean + margin),
        }
    }

    fn percentile(&self, sorted: &[f64], p: f64) -> f64 {
        let n = sorted.len();
        let index = (p * (n - 1) as f64).round() as usize;
        sorted[index.min(n - 1)]
    }

    pub fn print_report(&self) {
        let stats = self.calculate_statistics();
        println!("=== Benchmark Report: {} ===", self.name);
        println!("Sample count: {}", stats.count);
        println!("Mean: {:.2} ns", stats.mean);
        println!("Median: {:.2} ns", stats.median);
        println!("Std Dev: {:.2} ns", stats.std_dev);
        println!("Min: {:.2} ns", stats.min);
        println!("Max: {:.2} ns", stats.max);
        println!("P90: {:.2} ns", stats.p90);
        println!("P95: {:.2} ns", stats.p95);
        println!("P99: {:.2} ns", stats.p99);
        println!("95% CI: ({:.2}, {:.2}) ns",
                 stats.confidence_interval.0,
                 stats.confidence_interval.1);
    }
}

#[derive(Debug, Clone, Default)]
pub struct BenchmarkStatistics {
    pub count: usize,
    pub mean: f64,
    pub median: f64,
    pub std_dev: f64,
    pub min: f64,
    pub max: f64,
    pub p90: f64,
    pub p95: f64,
    pub p99: f64,
    pub confidence_interval: (f64, f64),
}

// Usage example
fn statistical_analysis_example() {
    let mut analyzer = BenchmarkAnalyzer::new("fibonacci_benchmark");

    // Simulate benchmark measurements
    for _ in 0..100 {
        let start = Instant::now();
        fibonacci(20);
        analyzer.add_measurement(start.elapsed());
    }

    analyzer.print_report();
}
```

**Code Explanation**: This example demonstrates how to use statistical analysis for benchmark results:

- **`BenchmarkAnalyzer`**: The benchmark analyzer struct
- **`new`**: The constructor for the benchmark analyzer
- **`add_measurement`**: The function that adds a measurement to the benchmark analyzer
- **`calculate_statistics`**: The function that calculates the statistics of the benchmark analyzer
- **`print_report`**: The function that prints the report of the benchmark analyzer

**Why this works**: This pattern allows Rust to use statistical analysis for benchmark results. The `BenchmarkAnalyzer` struct provides a benchmark analyzer implementation, the `new` constructor creates a new benchmark analyzer, the `add_measurement` function adds a measurement to the benchmark analyzer, the `calculate_statistics` function calculates the statistics of the benchmark analyzer, and the `print_report` function prints the report of the benchmark analyzer.

### Regression Detection

**What**: The regression detection is the detection of the regression.

**Why**: This is essential because it ensures that the regression is properly detected.

**When**: Use the regression detection when detecting the regression.

**How**: The regression detection is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::collections::HashMap;
use std::time::Duration;

// Regression detection for benchmarks
pub struct RegressionDetector {
    baselines: HashMap<String, f64>,
    threshold: f64, // Percentage threshold for regression detection
}

impl RegressionDetector {
    pub fn new(threshold: f64) -> Self {
        Self {
            baselines: HashMap::new(),
            threshold,
        }
    }

    pub fn set_baseline(&mut self, benchmark: &str, baseline_time: Duration) {
        self.baselines.insert(benchmark.to_string(), baseline_time.as_nanos() as f64);
    }

    pub fn check_regression(&self, benchmark: &str, current_time: Duration) -> RegressionResult {
        let current_ns = current_time.as_nanos() as f64;

        if let Some(baseline_ns) = self.baselines.get(benchmark) {
            let improvement = baseline_ns - current_ns;
            let improvement_percent = (improvement / baseline_ns) * 100.0;
            let regression_percent = (-improvement / baseline_ns) * 100.0;

            if improvement_percent > self.threshold {
                RegressionResult::Improvement {
                    benchmark: benchmark.to_string(),
                    improvement_percent,
                    baseline_time: Duration::from_nanos(*baseline_ns as u64),
                    current_time,
                }
            } else if regression_percent > self.threshold {
                RegressionResult::Regression {
                    benchmark: benchmark.to_string(),
                    regression_percent,
                    baseline_time: Duration::from_nanos(*baseline_ns as u64),
                    current_time,
                }
            } else {
                RegressionResult::NoChange {
                    benchmark: benchmark.to_string(),
                    baseline_time: Duration::from_nanos(*baseline_ns as u64),
                    current_time,
                }
            }
        } else {
            RegressionResult::NoBaseline {
                benchmark: benchmark.to_string(),
                current_time,
            }
        }
    }
}

#[derive(Debug, Clone)]
pub enum RegressionResult {
    Improvement {
        benchmark: String,
        improvement_percent: f64,
        baseline_time: Duration,
        current_time: Duration,
    },
    Regression {
        benchmark: String,
        regression_percent: f64,
        baseline_time: Duration,
        current_time: Duration,
    },
    NoChange {
        benchmark: String,
        baseline_time: Duration,
        current_time: Duration,
    },
    NoBaseline {
        benchmark: String,
        current_time: Duration,
    },
}

// Usage example
fn regression_detection_example() {
    let mut detector = RegressionDetector::new(5.0); // 5% threshold

    // Set baseline
    detector.set_baseline("fibonacci", Duration::from_millis(100));

    // Check for regression
    let result = detector.check_regression("fibonacci", Duration::from_millis(110));

    match result {
        RegressionResult::Regression { benchmark, regression_percent, .. } => {
            println!("Regression detected in {}: {:.2}% slower", benchmark, regression_percent);
        }
        RegressionResult::Improvement { benchmark, improvement_percent, .. } => {
            println!("Improvement detected in {}: {:.2}% faster", benchmark, improvement_percent);
        }
        RegressionResult::NoChange { .. } => {
            println!("No significant change detected");
        }
        RegressionResult::NoBaseline { .. } => {
            println!("No baseline available for comparison");
        }
    }
}
```

**Code Explanation**: This example demonstrates how to use regression detection for benchmarks:

- **`RegressionDetector`**: The regression detector struct
- **`new`**: The constructor for the regression detector
- **`set_baseline`**: The function that sets the baseline for the regression detector
- **`check_regression`**: The function that checks for regression in the regression detector

**Why this works**: This pattern allows Rust to use regression detection for benchmarks. The `RegressionDetector` struct provides a regression detector implementation, the `new` constructor creates a new regression detector, the `set_baseline` function sets the baseline for the regression detector, and the `check_regression` function checks for regression in the regression detector.

## CI/CD Integration

**What**: The CI/CD integration is the integration of the CI/CD.

**Why**: This is essential because it ensures that the CI/CD is properly integrated.

**When**: Use the CI/CD integration when integrating the CI/CD.

**How**: The CI/CD integration is implemented as a struct with the size and alignment of the memory block to be allocated.

```rust
use std::process::Command;
use std::fs;
use serde::{Deserialize, Serialize};

// Benchmark results for CI/CD
#[derive(Debug, Serialize, Deserialize)]
pub struct BenchmarkResult {
    pub benchmark_name: String,
    pub duration_ns: u64,
    pub timestamp: String,
    pub git_commit: String,
    pub git_branch: String,
    pub environment: String,
}

// CI/CD benchmark runner
pub struct CIBenchmarkRunner {
    results_dir: String,
    baseline_file: String,
}

impl CIBenchmarkRunner {
    pub fn new(results_dir: &str) -> Self {
        Self {
            results_dir: results_dir.to_string(),
            baseline_file: format!("{}/baseline.json", results_dir),
        }
    }

    pub fn run_benchmark(&self, benchmark_name: &str) -> BenchmarkResult {
        let start = std::time::Instant::now();

        // Run your benchmark here
        fibonacci(20);

        let duration = start.elapsed();

        BenchmarkResult {
            benchmark_name: benchmark_name.to_string(),
            duration_ns: duration.as_nanos() as u64,
            timestamp: chrono::Utc::now().to_rfc3339(),
            git_commit: self.get_git_commit(),
            git_branch: self.get_git_branch(),
            environment: self.get_environment(),
        }
    }

    pub fn save_result(&self, result: &BenchmarkResult) -> std::io::Result<()> {
        let filename = format!("{}/{}_{}.json",
                              self.results_dir,
                              result.benchmark_name,
                              result.timestamp.replace(":", "-"));

        let json = serde_json::to_string_pretty(result)?;
        fs::write(filename, json)
    }

    pub fn load_baseline(&self) -> std::io::Result<Vec<BenchmarkResult>> {
        if fs::metadata(&self.baseline_file).is_err() {
            return Ok(Vec::new());
        }

        let content = fs::read_to_string(&self.baseline_file)?;
        let results: Vec<BenchmarkResult> = serde_json::from_str(&content)?;
        Ok(results)
    }

    pub fn save_baseline(&self, results: &[BenchmarkResult]) -> std::io::Result<()> {
        let json = serde_json::to_string_pretty(results)?;
        fs::write(&self.baseline_file, json)
    }

    pub fn compare_with_baseline(&self, current: &BenchmarkResult) -> Option<f64> {
        let baseline_results = self.load_baseline().ok()?;

        if let Some(baseline) = baseline_results.iter()
            .find(|r| r.benchmark_name == current.benchmark_name) {

            let improvement = (baseline.duration_ns as f64 - current.duration_ns as f64)
                            / baseline.duration_ns as f64 * 100.0;
            Some(improvement)
        } else {
            None
        }
    }

    fn get_git_commit(&self) -> String {
        Command::new("git")
            .args(&["rev-parse", "HEAD"])
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
            .unwrap_or_else(|_| "unknown".to_string())
    }

    fn get_git_branch(&self) -> String {
        Command::new("git")
            .args(&["rev-parse", "--abbrev-ref", "HEAD"])
            .output()
            .map(|output| String::from_utf8_lossy(&output.stdout).trim().to_string())
            .unwrap_or_else(|_| "unknown".to_string())
    }

    fn get_environment(&self) -> String {
        std::env::var("CI_ENVIRONMENT")
            .unwrap_or_else(|_| "local".to_string())
    }
}

// Usage example
fn ci_benchmarking_example() {
    let runner = CIBenchmarkRunner::new("./benchmark_results");

    let result = runner.run_benchmark("fibonacci");
    runner.save_result(&result).unwrap();

    if let Some(improvement) = runner.compare_with_baseline(&result) {
        if improvement > 0.0 {
            println!("Performance improved by {:.2}%", improvement);
        } else {
            println!("Performance regressed by {:.2}%", -improvement);
        }
    } else {
        println!("No baseline available for comparison");
    }
}
```

**Code Explanation**: This example demonstrates how to use CI/CD integration for benchmarking:

- **`BenchmarkResult`**: The benchmark result struct
- **`CIBenchmarkRunner`**: The CI/CD benchmark runner struct
- **`new`**: The constructor for the CI/CD benchmark runner
- **`run_benchmark`**: The function that runs the benchmark
- **`save_result`**: The function that saves the result of the benchmark
- **`load_baseline`**: The function that loads the baseline for the benchmark
- **`save_baseline`**: The function that saves the baseline for the benchmark
- **`compare_with_baseline`**: The function that compares the current benchmark with the baseline

**Why this works**: This pattern allows Rust to use CI/CD integration for benchmarking. The `BenchmarkResult` struct provides a benchmark result implementation, the `CIBenchmarkRunner` struct provides a CI/CD benchmark runner implementation, the `new` constructor creates a new CI/CD benchmark runner, the `run_benchmark` function runs the benchmark, the `save_result` function saves the result of the benchmark, the `load_baseline` function loads the baseline for the benchmark, the `save_baseline` function saves the baseline for the benchmark, and the `compare_with_baseline` function compares the current benchmark with the baseline.

## Key Takeaways

- **Criterion.rs** provides robust benchmarking framework for Rust
- **Statistical analysis** ensures valid and reliable benchmark results
- **Regression detection** helps maintain performance standards
- **Continuous benchmarking** integrates performance monitoring into CI/CD
- **Proper methodology** is essential for meaningful benchmark results
- **Automation** enables consistent performance monitoring

## Next Steps

- Learn about **compiler optimizations** and build configurations
- Explore **memory optimization** techniques
- Study **parallel processing** and concurrency
- Practice with **advanced benchmarking** scenarios

## Resources

- [Criterion.rs Documentation](https://docs.rs/criterion/latest/criterion/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
- [Statistical Analysis Guide](https://en.wikipedia.org/wiki/Statistical_analysis)
- [CI/CD Best Practices](https://docs.github.com/en/actions)
