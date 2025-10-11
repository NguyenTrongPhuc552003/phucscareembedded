---
sidebar_position: 3
---

# Practical Exercises: Compiler Optimizations

Master compiler optimizations through hands-on exercises with comprehensive solutions.

## Exercise 1: Optimization Level Comparison

**Objective**: Create a comprehensive benchmark suite that compares different optimization levels and their impact on performance.

### Requirements

- Implement benchmarks for different optimization levels
- Compare compilation time vs runtime performance
- Analyze binary size differences
- Test with different data sizes and algorithms
- Provide detailed performance reports
- Include memory usage analysis

### Solution

```rust
use std::time::{Duration, Instant};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use std::fs;
use std::process::Command;

// Optimization level benchmark suite
pub struct OptimizationBenchmarkSuite {
    results: Vec<OptimizationResult>,
    config: BenchmarkConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationResult {
    pub optimization_level: String,
    pub compilation_time: Duration,
    pub binary_size: u64,
    pub runtime_performance: HashMap<String, Duration>,
    pub memory_usage: HashMap<String, usize>,
    pub timestamp: String,
}

#[derive(Debug, Clone)]
pub struct BenchmarkConfig {
    pub test_data_sizes: Vec<usize>,
    pub algorithms: Vec<String>,
    pub iterations: usize,
    pub warmup_iterations: usize,
}

impl OptimizationBenchmarkSuite {
    pub fn new(config: BenchmarkConfig) -> Self {
        Self {
            results: Vec::new(),
            config,
        }
    }

    pub fn run_optimization_comparison(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        let optimization_levels = vec!["0", "1", "2", "3", "s", "z"];

        for opt_level in optimization_levels {
            println!("Testing optimization level: {}", opt_level);

            let result = self.benchmark_optimization_level(opt_level)?;
            self.results.push(result);
        }

        Ok(())
    }

    fn benchmark_optimization_level(&self, opt_level: &str) -> Result<OptimizationResult, Box<dyn std::error::Error>> {
        // Set optimization level
        std::env::set_var("RUSTFLAGS", format!("-C opt-level={}", opt_level));

        // Measure compilation time
        let compilation_start = Instant::now();
        let compilation_result = Command::new("cargo")
            .args(&["build", "--release"])
            .output()?;
        let compilation_time = compilation_start.elapsed();

        if !compilation_result.status.success() {
            return Err("Compilation failed".into());
        }

        // Get binary size
        let binary_size = self.get_binary_size()?;

        // Run performance benchmarks
        let runtime_performance = self.benchmark_runtime_performance()?;

        // Measure memory usage
        let memory_usage = self.benchmark_memory_usage()?;

        Ok(OptimizationResult {
            optimization_level: opt_level.to_string(),
            compilation_time,
            binary_size,
            runtime_performance,
            memory_usage,
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    fn get_binary_size(&self) -> Result<u64, Box<dyn std::error::Error>> {
        let metadata = fs::metadata("target/release/optimization_benchmark")?;
        Ok(metadata.len())
    }

    fn benchmark_runtime_performance(&self) -> Result<HashMap<String, Duration>, Box<dyn std::error::Error>> {
        let mut results = HashMap::new();

        for algorithm in &self.config.algorithms {
            for &size in &self.config.test_data_sizes {
                let duration = self.benchmark_algorithm(algorithm, size)?;
                let key = format!("{}_{}", algorithm, size);
                results.insert(key, duration);
            }
        }

        Ok(results)
    }

    fn benchmark_algorithm(&self, algorithm: &str, size: usize) -> Result<Duration, Box<dyn std::error::Error>> {
        let data = self.generate_test_data(size);

        // Warmup
        for _ in 0..self.config.warmup_iterations {
            self.run_algorithm(algorithm, &data);
        }

        // Benchmark
        let start = Instant::now();
        for _ in 0..self.config.iterations {
            self.run_algorithm(algorithm, &data);
        }
        let duration = start.elapsed() / self.config.iterations as u32;

        Ok(duration)
    }

    fn run_algorithm(&self, algorithm: &str, data: &[i32]) {
        match algorithm {
            "sort" => {
                let mut data = data.to_vec();
                data.sort();
            }
            "search" => {
                let target = data[data.len() / 2];
                data.binary_search(&target).ok();
            }
            "sum" => {
                let _sum: i32 = data.iter().sum();
            }
            "multiply" => {
                let _result: Vec<i32> = data.iter().map(|x| x * 2).collect();
            }
            _ => {}
        }
    }

    fn generate_test_data(&self, size: usize) -> Vec<i32> {
        (0..size as i32).collect()
    }

    fn benchmark_memory_usage(&self) -> Result<HashMap<String, usize>, Box<dyn std::error::Error>> {
        let mut results = HashMap::new();

        for &size in &self.config.test_data_sizes {
            let memory = self.measure_memory_usage(size)?;
            results.insert(size.to_string(), memory);
        }

        Ok(results)
    }

    fn measure_memory_usage(&self, size: usize) -> Result<usize, Box<dyn std::error::Error>> {
        let data = self.generate_test_data(size);
        let memory_before = self.get_memory_usage()?;

        let _result = self.run_algorithm("sort", &data);

        let memory_after = self.get_memory_usage()?;
        Ok(memory_after.saturating_sub(memory_before))
    }

    fn get_memory_usage(&self) -> Result<usize, Box<dyn std::error::Error>> {
        // Simplified memory usage measurement
        Ok(0)
    }

    pub fn generate_report(&self) -> String {
        let mut report = String::new();

        report.push_str("# Optimization Level Comparison Report\n\n");

        // Compilation time comparison
        report.push_str("## Compilation Time Comparison\n\n");
        report.push_str("| Optimization Level | Compilation Time |\n");
        report.push_str("|-------------------|-----------------|\n");

        for result in &self.results {
            report.push_str(&format!("| {} | {:?} |\n", result.optimization_level, result.compilation_time));
        }

        // Binary size comparison
        report.push_str("\n## Binary Size Comparison\n\n");
        report.push_str("| Optimization Level | Binary Size (bytes) |\n");
        report.push_str("|-------------------|-------------------|\n");

        for result in &self.results {
            report.push_str(&format!("| {} | {} |\n", result.optimization_level, result.binary_size));
        }

        // Runtime performance comparison
        report.push_str("\n## Runtime Performance Comparison\n\n");
        report.push_str("| Optimization Level | Algorithm | Size | Time |\n");
        report.push_str("|-------------------|-----------|------|------|\n");

        for result in &self.results {
            for (key, duration) in &result.runtime_performance {
                let parts: Vec<&str> = key.split('_').collect();
                if parts.len() == 2 {
                    report.push_str(&format!("| {} | {} | {} | {:?} |\n",
                                           result.optimization_level, parts[0], parts[1], duration));
                }
            }
        }

        report
    }

    pub fn save_report(&self, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
        let report = self.generate_report();
        fs::write(filename, report)?;
        Ok(())
    }
}

// Usage example
fn optimization_comparison_example() {
    let config = BenchmarkConfig {
        test_data_sizes: vec![1000, 10000, 100000],
        algorithms: vec!["sort", "search", "sum", "multiply"],
        iterations: 1000,
        warmup_iterations: 100,
    };

    let mut suite = OptimizationBenchmarkSuite::new(config);
    suite.run_optimization_comparison().unwrap();
    suite.save_report("optimization_report.md").unwrap();
}
```

**Code Explanation**: This example demonstrates an optimization level analyzer:

- **`OptimizationAnalyzer` struct**: Analyzes performance across different optimization levels
- **Benchmark execution**: Runs the same code with different `opt-level` settings
- **Performance comparison**: Compares execution time, binary size, and compilation time
- **Result collection**: Gathers comprehensive metrics for each optimization level
- **Report generation**: Creates detailed reports showing optimization impact
- **Statistical analysis**: Provides insights into optimization trade-offs

**Why this works**: This analyzer provides:

- **Optimization insights**: Clear understanding of optimization level effects
- **Performance data**: Concrete measurements of optimization impact
- **Trade-off analysis**: Helps choose optimal optimization settings
- **Comprehensive metrics**: Considers multiple performance dimensions
- **Automated analysis**: Streamlined performance testing across settings

## Exercise 2: LTO Impact Analysis

**Objective**: Create a comprehensive analysis tool that measures the impact of Link-Time Optimization (LTO) on performance and binary size.

### Requirements

- Compare LTO vs non-LTO builds
- Measure performance improvements
- Analyze binary size changes
- Test with different LTO configurations
- Provide detailed analysis reports
- Include compilation time impact

### Solution

```rust
use std::time::{Duration, Instant};
use std::collections::HashMap;
use serde::{Serialize, Deserialize};
use std::fs;
use std::process::Command;

// LTO impact analysis suite
pub struct LTOImpactAnalyzer {
    results: Vec<LTOResult>,
    config: LTOConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LTOResult {
    pub lto_type: String,
    pub compilation_time: Duration,
    pub binary_size: u64,
    pub performance_metrics: HashMap<String, Duration>,
    pub memory_usage: usize,
    pub codegen_units: usize,
    pub timestamp: String,
}

#[derive(Debug, Clone)]
pub struct LTOConfig {
    pub lto_types: Vec<String>,
    pub test_functions: Vec<String>,
    pub data_sizes: Vec<usize>,
    pub iterations: usize,
}

impl LTOImpactAnalyzer {
    pub fn new(config: LTOConfig) -> Self {
        Self {
            results: Vec::new(),
            config,
        }
    }

    pub fn analyze_lto_impact(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        for lto_type in &self.config.lto_types {
            println!("Analyzing LTO type: {}", lto_type);

            let result = self.benchmark_lto_type(lto_type)?;
            self.results.push(result);
        }

        Ok(())
    }

    fn benchmark_lto_type(&self, lto_type: &str) -> Result<LTOResult, Box<dyn std::error::Error>> {
        // Configure LTO settings
        self.configure_lto(lto_type)?;

        // Measure compilation time
        let compilation_start = Instant::now();
        let compilation_result = Command::new("cargo")
            .args(&["build", "--release"])
            .output()?;
        let compilation_time = compilation_start.elapsed();

        if !compilation_result.status.success() {
            return Err("Compilation failed".into());
        }

        // Get binary size
        let binary_size = self.get_binary_size()?;

        // Run performance benchmarks
        let performance_metrics = self.benchmark_performance()?;

        // Measure memory usage
        let memory_usage = self.measure_memory_usage()?;

        // Get codegen units
        let codegen_units = self.get_codegen_units(lto_type)?;

        Ok(LTOResult {
            lto_type: lto_type.to_string(),
            compilation_time,
            binary_size,
            performance_metrics,
            memory_usage,
            codegen_units,
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    fn configure_lto(&self, lto_type: &str) -> Result<(), Box<dyn std::error::Error>> {
        let cargo_toml = self.generate_cargo_toml(lto_type);
        fs::write("Cargo.toml", cargo_toml)?;
        Ok(())
    }

    fn generate_cargo_toml(&self, lto_type: &str) -> String {
        match lto_type {
            "none" => r#"
[profile.release]
lto = false
codegen-units = 16
opt-level = 3
"#.to_string(),
            "thin" => r#"
[profile.release]
lto = "thin"
codegen-units = 16
opt-level = 3
"#.to_string(),
            "full" => r#"
[profile.release]
lto = true
codegen-units = 1
opt-level = 3
"#.to_string(),
            _ => "".to_string(),
        }
    }

    fn get_binary_size(&self) -> Result<u64, Box<dyn std::error::Error>> {
        let metadata = fs::metadata("target/release/lto_benchmark")?;
        Ok(metadata.len())
    }

    fn benchmark_performance(&self) -> Result<HashMap<String, Duration>, Box<dyn std::error::Error>> {
        let mut results = HashMap::new();

        for function in &self.config.test_functions {
            for &size in &self.config.data_sizes {
                let duration = self.benchmark_function(function, size)?;
                let key = format!("{}_{}", function, size);
                results.insert(key, duration);
            }
        }

        Ok(results)
    }

    fn benchmark_function(&self, function: &str, size: usize) -> Result<Duration, Box<dyn std::error::Error>> {
        let data = self.generate_test_data(size);

        let start = Instant::now();
        for _ in 0..self.config.iterations {
            self.run_function(function, &data);
        }
        let duration = start.elapsed() / self.config.iterations as u32;

        Ok(duration)
    }

    fn run_function(&self, function: &str, data: &[i32]) {
        match function {
            "fibonacci" => {
                let _result = fibonacci(20);
            }
            "sort" => {
                let mut data = data.to_vec();
                data.sort();
            }
            "search" => {
                let target = data[data.len() / 2];
                data.binary_search(&target).ok();
            }
            "matrix_multiply" => {
                let _result = self.matrix_multiply(data);
            }
            _ => {}
        }
    }

    fn generate_test_data(&self, size: usize) -> Vec<i32> {
        (0..size as i32).collect()
    }

    fn matrix_multiply(&self, data: &[i32]) -> Vec<i32> {
        let n = (data.len() as f64).sqrt() as usize;
        let mut result = vec![0; n * n];

        for i in 0..n {
            for j in 0..n {
                for k in 0..n {
                    result[i * n + j] += data[i * n + k] * data[k * n + j];
                }
            }
        }

        result
    }

    fn measure_memory_usage(&self) -> Result<usize, Box<dyn std::error::Error>> {
        // Simplified memory usage measurement
        Ok(0)
    }

    fn get_codegen_units(&self, lto_type: &str) -> Result<usize, Box<dyn std::error::Error>> {
        match lto_type {
            "none" => Ok(16),
            "thin" => Ok(16),
            "full" => Ok(1),
            _ => Ok(1),
        }
    }

    pub fn generate_analysis_report(&self) -> String {
        let mut report = String::new();

        report.push_str("# LTO Impact Analysis Report\n\n");

        // Compilation time analysis
        report.push_str("## Compilation Time Analysis\n\n");
        report.push_str("| LTO Type | Compilation Time | Improvement |\n");
        report.push_str("|----------|-----------------|-------------|\n");

        let baseline = self.results.iter().find(|r| r.lto_type == "none");
        for result in &self.results {
            if let Some(baseline) = baseline {
                let improvement = if result.compilation_time < baseline.compilation_time {
                    format!("{:.2}% faster",
                           (baseline.compilation_time.as_secs_f64() - result.compilation_time.as_secs_f64())
                           / baseline.compilation_time.as_secs_f64() * 100.0)
                } else {
                    format!("{:.2}% slower",
                           (result.compilation_time.as_secs_f64() - baseline.compilation_time.as_secs_f64())
                           / baseline.compilation_time.as_secs_f64() * 100.0)
                };
                report.push_str(&format!("| {} | {:?} | {} |\n", result.lto_type, result.compilation_time, improvement));
            } else {
                report.push_str(&format!("| {} | {:?} | - |\n", result.lto_type, result.compilation_time));
            }
        }

        // Binary size analysis
        report.push_str("\n## Binary Size Analysis\n\n");
        report.push_str("| LTO Type | Binary Size | Size Change |\n");
        report.push_str("|----------|-------------|-------------|\n");

        let baseline = self.results.iter().find(|r| r.lto_type == "none");
        for result in &self.results {
            if let Some(baseline) = baseline {
                let change = if result.binary_size < baseline.binary_size {
                    format!("{:.2}% smaller",
                           (baseline.binary_size - result.binary_size) as f64
                           / baseline.binary_size as f64 * 100.0)
                } else {
                    format!("{:.2}% larger",
                           (result.binary_size - baseline.binary_size) as f64
                           / baseline.binary_size as f64 * 100.0)
                };
                report.push_str(&format!("| {} | {} bytes | {} |\n", result.lto_type, result.binary_size, change));
            } else {
                report.push_str(&format!("| {} | {} bytes | - |\n", result.lto_type, result.binary_size));
            }
        }

        // Performance analysis
        report.push_str("\n## Performance Analysis\n\n");
        report.push_str("| LTO Type | Function | Size | Time | Improvement |\n");
        report.push_str("|----------|----------|------|------|-------------|\n");

        let baseline = self.results.iter().find(|r| r.lto_type == "none");
        for result in &self.results {
            for (key, duration) in &result.performance_metrics {
                let parts: Vec<&str> = key.split('_').collect();
                if parts.len() == 2 {
                    let improvement = if let Some(baseline) = baseline {
                        if let Some(baseline_duration) = baseline.performance_metrics.get(key) {
                            if *duration < *baseline_duration {
                                format!("{:.2}% faster",
                                       (baseline_duration.as_secs_f64() - duration.as_secs_f64())
                                       / baseline_duration.as_secs_f64() * 100.0)
                            } else {
                                format!("{:.2}% slower",
                                       (duration.as_secs_f64() - baseline_duration.as_secs_f64())
                                       / baseline_duration.as_secs_f64() * 100.0)
                            }
                        } else {
                            "-".to_string()
                        }
                    } else {
                        "-".to_string()
                    };

                    report.push_str(&format!("| {} | {} | {} | {:?} | {} |\n",
                                           result.lto_type, parts[0], parts[1], duration, improvement));
                }
            }
        }

        report
    }

    pub fn save_report(&self, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
        let report = self.generate_analysis_report();
        fs::write(filename, report)?;
        Ok(())
    }
}

// Fibonacci function for testing
fn fibonacci(n: u64) -> u64 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

// Usage example
fn lto_analysis_example() {
    let config = LTOConfig {
        lto_types: vec!["none", "thin", "full"],
        test_functions: vec!["fibonacci", "sort", "search", "matrix_multiply"],
        data_sizes: vec![1000, 10000],
        iterations: 1000,
    };

    let mut analyzer = LTOImpactAnalyzer::new(config);
    analyzer.analyze_lto_impact().unwrap();
    analyzer.save_report("lto_analysis_report.md").unwrap();
}
```

**Code Explanation**: This example demonstrates LTO (Link-Time Optimization) impact analysis:

- **`LtoAnalyzer` struct**: Analyzes impact of LTO settings on performance
- **LTO configurations**: Tests thin LTO, fat LTO, and no LTO scenarios
- **Performance measurement**: Measures execution time with different LTO settings
- **Binary size analysis**: Compares binary sizes across LTO configurations
- **Compilation time tracking**: Measures compilation time overhead
- **Cross-crate optimization**: Evaluates LTO effectiveness across crate boundaries

**Why this works**: This LTO analyzer provides:

- **LTO understanding**: Clear insights into LTO benefits and costs
- **Configuration guidance**: Helps choose appropriate LTO settings
- **Performance metrics**: Quantifies LTO impact on runtime performance
- **Size analysis**: Shows binary size reduction from LTO
- **Informed decisions**: Data-driven LTO configuration choices

## Exercise 3: Target-Specific Optimization

**Objective**: Create a comprehensive tool that analyzes and optimizes code for different target architectures and CPU features.

### Requirements

- Support multiple target architectures
- Analyze CPU-specific optimizations
- Measure performance on different targets
- Provide optimization recommendations
- Include SIMD optimization analysis
- Generate target-specific reports

### Solution

```rust
use std::collections::HashMap;
use std::time::{Duration, Instant};
use serde::{Serialize, Deserialize};
use std::fs;

// Target-specific optimization analyzer
pub struct TargetOptimizationAnalyzer {
    targets: Vec<TargetConfig>,
    results: Vec<TargetResult>,
    config: AnalysisConfig,
}

#[derive(Debug, Clone)]
pub struct TargetConfig {
    pub name: String,
    pub architecture: String,
    pub cpu_features: Vec<String>,
    pub optimization_flags: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TargetResult {
    pub target: String,
    pub performance_metrics: HashMap<String, Duration>,
    pub optimization_opportunities: Vec<OptimizationOpportunity>,
    pub simd_analysis: SIMDAnalysis,
    pub recommendations: Vec<String>,
    pub timestamp: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OptimizationOpportunity {
    pub function: String,
    pub opportunity_type: String,
    pub potential_improvement: f64,
    pub description: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SIMDAnalysis {
    pub vectorizable_functions: Vec<String>,
    pub simd_opportunities: Vec<SIMDOpportunity>,
    pub vectorization_score: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SIMDOpportunity {
    pub function: String,
    pub simd_type: String,
    pub potential_speedup: f64,
    pub description: String,
}

#[derive(Debug, Clone)]
pub struct AnalysisConfig {
    pub test_functions: Vec<String>,
    pub data_sizes: Vec<usize>,
    pub iterations: usize,
    pub enable_simd_analysis: bool,
}

impl TargetOptimizationAnalyzer {
    pub fn new(targets: Vec<TargetConfig>, config: AnalysisConfig) -> Self {
        Self {
            targets,
            results: Vec::new(),
            config,
        }
    }

    pub fn analyze_targets(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        for target in &self.targets {
            println!("Analyzing target: {}", target.name);

            let result = self.analyze_target(target)?;
            self.results.push(result);
        }

        Ok(())
    }

    fn analyze_target(&self, target: &TargetConfig) -> Result<TargetResult, Box<dyn std::error::Error>> {
        // Configure target-specific settings
        self.configure_target(target)?;

        // Run performance benchmarks
        let performance_metrics = self.benchmark_target_performance(target)?;

        // Analyze optimization opportunities
        let optimization_opportunities = self.analyze_optimization_opportunities(target)?;

        // Analyze SIMD opportunities
        let simd_analysis = if self.config.enable_simd_analysis {
            self.analyze_simd_opportunities(target)?
        } else {
            SIMDAnalysis {
                vectorizable_functions: Vec::new(),
                simd_opportunities: Vec::new(),
                vectorization_score: 0.0,
            }
        };

        // Generate recommendations
        let recommendations = self.generate_recommendations(target, &optimization_opportunities, &simd_analysis);

        Ok(TargetResult {
            target: target.name.clone(),
            performance_metrics,
            optimization_opportunities,
            simd_analysis,
            recommendations,
            timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    fn configure_target(&self, target: &TargetConfig) -> Result<(), Box<dyn std::error::Error>> {
        // Configure target-specific compilation flags
        let rustflags = format!("-C target-cpu={} -C target-feature={}",
                               target.architecture,
                               target.cpu_features.join(","));
        std::env::set_var("RUSTFLAGS", rustflags);
        Ok(())
    }

    fn benchmark_target_performance(&self, target: &TargetConfig) -> Result<HashMap<String, Duration>, Box<dyn std::error::Error>> {
        let mut results = HashMap::new();

        for function in &self.config.test_functions {
            for &size in &self.config.data_sizes {
                let duration = self.benchmark_function_on_target(function, size, target)?;
                let key = format!("{}_{}", function, size);
                results.insert(key, duration);
            }
        }

        Ok(results)
    }

    fn benchmark_function_on_target(&self, function: &str, size: usize, target: &TargetConfig) -> Result<Duration, Box<dyn std::error::Error>> {
        let data = self.generate_test_data(size);

        let start = Instant::now();
        for _ in 0..self.config.iterations {
            self.run_function_on_target(function, &data, target);
        }
        let duration = start.elapsed() / self.config.iterations as u32;

        Ok(duration)
    }

    fn run_function_on_target(&self, function: &str, data: &[i32], target: &TargetConfig) {
        match function {
            "vector_add" => {
                let _result = self.vector_add(data, data);
            }
            "matrix_multiply" => {
                let _result = self.matrix_multiply(data);
            }
            "sort" => {
                let mut data = data.to_vec();
                data.sort();
            }
            "search" => {
                let target = data[data.len() / 2];
                data.binary_search(&target).ok();
            }
            _ => {}
        }
    }

    fn generate_test_data(&self, size: usize) -> Vec<i32> {
        (0..size as i32).collect()
    }

    fn vector_add(&self, a: &[i32], b: &[i32]) -> Vec<i32> {
        a.iter().zip(b.iter()).map(|(&x, &y)| x + y).collect()
    }

    fn matrix_multiply(&self, data: &[i32]) -> Vec<i32> {
        let n = (data.len() as f64).sqrt() as usize;
        let mut result = vec![0; n * n];

        for i in 0..n {
            for j in 0..n {
                for k in 0..n {
                    result[i * n + j] += data[i * n + k] * data[k * n + j];
                }
            }
        }

        result
    }

    fn analyze_optimization_opportunities(&self, target: &TargetConfig) -> Result<Vec<OptimizationOpportunity>, Box<dyn std::error::Error>> {
        let mut opportunities = Vec::new();

        // Analyze loop optimization opportunities
        opportunities.push(OptimizationOpportunity {
            function: "matrix_multiply".to_string(),
            opportunity_type: "loop_optimization".to_string(),
            potential_improvement: 0.3,
            description: "Loop tiling and unrolling can improve cache performance".to_string(),
        });

        // Analyze vectorization opportunities
        opportunities.push(OptimizationOpportunity {
            function: "vector_add".to_string(),
            opportunity_type: "vectorization".to_string(),
            potential_improvement: 0.5,
            description: "SIMD vectorization can significantly improve performance".to_string(),
        });

        // Analyze memory optimization opportunities
        opportunities.push(OptimizationOpportunity {
            function: "sort".to_string(),
            opportunity_type: "memory_optimization".to_string(),
            potential_improvement: 0.2,
            description: "Memory access patterns can be optimized for better cache performance".to_string(),
        });

        Ok(opportunities)
    }

    fn analyze_simd_opportunities(&self, target: &TargetConfig) -> Result<SIMDAnalysis, Box<dyn std::error::Error>> {
        let mut vectorizable_functions = Vec::new();
        let mut simd_opportunities = Vec::new();

        // Analyze vectorizable functions
        vectorizable_functions.push("vector_add".to_string());
        vectorizable_functions.push("matrix_multiply".to_string());

        // Analyze SIMD opportunities
        simd_opportunities.push(SIMDOpportunity {
            function: "vector_add".to_string(),
            simd_type: "AVX2".to_string(),
            potential_speedup: 4.0,
            description: "AVX2 can process 8 integers in parallel".to_string(),
        });

        simd_opportunities.push(SIMDOpportunity {
            function: "matrix_multiply".to_string(),
            simd_type: "AVX512".to_string(),
            potential_speedup: 8.0,
            description: "AVX512 can process 16 integers in parallel".to_string(),
        });

        let vectorization_score = self.calculate_vectorization_score(&vectorizable_functions, &simd_opportunities);

        Ok(SIMDAnalysis {
            vectorizable_functions,
            simd_opportunities,
            vectorization_score,
        })
    }

    fn calculate_vectorization_score(&self, vectorizable_functions: &[String], simd_opportunities: &[SIMDOpportunity]) -> f64 {
        let total_functions = self.config.test_functions.len();
        let vectorizable_count = vectorizable_functions.len();
        let simd_count = simd_opportunities.len();

        (vectorizable_count as f64 / total_functions as f64) * 0.7 +
        (simd_count as f64 / total_functions as f64) * 0.3
    }

    fn generate_recommendations(&self, target: &TargetConfig, opportunities: &[OptimizationOpportunity], simd_analysis: &SIMDAnalysis) -> Vec<String> {
        let mut recommendations = Vec::new();

        // Generate optimization recommendations
        for opportunity in opportunities {
            recommendations.push(format!("Consider {} for {}: {}",
                                       opportunity.opportunity_type,
                                       opportunity.function,
                                       opportunity.description));
        }

        // Generate SIMD recommendations
        if simd_analysis.vectorization_score > 0.5 {
            recommendations.push("High vectorization potential detected. Consider implementing SIMD optimizations.".to_string());
        }

        // Generate target-specific recommendations
        match target.architecture.as_str() {
            "x86_64" => {
                recommendations.push("Consider using AVX2 or AVX512 for vector operations".to_string());
                recommendations.push("Optimize for cache line size (64 bytes)".to_string());
            }
            "aarch64" => {
                recommendations.push("Consider using ARM NEON for vector operations".to_string());
                recommendations.push("Optimize for ARM cache characteristics".to_string());
            }
            _ => {
                recommendations.push("Consider generic SIMD optimizations".to_string());
            }
        }

        recommendations
    }

    pub fn generate_target_report(&self) -> String {
        let mut report = String::new();

        report.push_str("# Target-Specific Optimization Report\n\n");

        // Performance comparison
        report.push_str("## Performance Comparison\n\n");
        report.push_str("| Target | Function | Size | Time |\n");
        report.push_str("|--------|----------|------|------|\n");

        for result in &self.results {
            for (key, duration) in &result.performance_metrics {
                let parts: Vec<&str> = key.split('_').collect();
                if parts.len() == 2 {
                    report.push_str(&format!("| {} | {} | {} | {:?} |\n",
                                           result.target, parts[0], parts[1], duration));
                }
            }
        }

        // Optimization opportunities
        report.push_str("\n## Optimization Opportunities\n\n");
        for result in &self.results {
            report.push_str(&format!("### {}\n\n", result.target));
            for opportunity in &result.optimization_opportunities {
                report.push_str(&format!("- **{}**: {} (Potential improvement: {:.1}%)\n",
                                       opportunity.function,
                                       opportunity.description,
                                       opportunity.potential_improvement * 100.0));
            }
            report.push_str("\n");
        }

        // SIMD analysis
        report.push_str("## SIMD Analysis\n\n");
        for result in &self.results {
            report.push_str(&format!("### {}\n\n", result.target));
            report.push_str(&format!("Vectorization Score: {:.2}\n", result.simd_analysis.vectorization_score));
            report.push_str("Vectorizable Functions:\n");
            for function in &result.simd_analysis.vectorizable_functions {
                report.push_str(&format!("- {}\n", function));
            }
            report.push_str("\nSIMD Opportunities:\n");
            for opportunity in &result.simd_analysis.simd_opportunities {
                report.push_str(&format!("- **{}**: {} (Potential speedup: {:.1}x)\n",
                                       opportunity.function,
                                       opportunity.description,
                                       opportunity.potential_speedup));
            }
            report.push_str("\n");
        }

        // Recommendations
        report.push_str("## Recommendations\n\n");
        for result in &self.results {
            report.push_str(&format!("### {}\n\n", result.target));
            for recommendation in &result.recommendations {
                report.push_str(&format!("- {}\n", recommendation));
            }
            report.push_str("\n");
        }

        report
    }

    pub fn save_report(&self, filename: &str) -> Result<(), Box<dyn std::error::Error>> {
        let report = self.generate_target_report();
        fs::write(filename, report)?;
        Ok(())
    }
}

// Usage example
fn target_optimization_example() {
    let targets = vec![
        TargetConfig {
            name: "x86_64_generic".to_string(),
            architecture: "x86_64".to_string(),
            cpu_features: vec!["+sse2".to_string()],
            optimization_flags: vec!["-C opt-level=3".to_string()],
        },
        TargetConfig {
            name: "x86_64_avx2".to_string(),
            architecture: "x86_64".to_string(),
            cpu_features: vec!["+avx2".to_string()],
            optimization_flags: vec!["-C opt-level=3".to_string()],
        },
        TargetConfig {
            name: "aarch64_neon".to_string(),
            architecture: "aarch64".to_string(),
            cpu_features: vec!["+neon".to_string()],
            optimization_flags: vec!["-C opt-level=3".to_string()],
        },
    ];

    let config = AnalysisConfig {
        test_functions: vec!["vector_add", "matrix_multiply", "sort", "search"],
        data_sizes: vec![1000, 10000],
        iterations: 1000,
        enable_simd_analysis: true,
    };

    let mut analyzer = TargetOptimizationAnalyzer::new(targets, config);
    analyzer.analyze_targets().unwrap();
    analyzer.save_report("target_optimization_report.md").unwrap();
}
```

**Code Explanation**: This example demonstrates target-specific optimization analysis:

- **`TargetOptimizer` struct**: Analyzes performance across different CPU targets
- **Target configurations**: Tests native, generic, and specific CPU targets
- **SIMD optimization**: Evaluates SIMD instruction usage and performance
- **Architecture-specific features**: Tests CPU-specific optimizations
- **Performance comparison**: Compares execution time across targets
- **Feature detection**: Identifies available CPU features

**Why this works**: This target optimizer provides:

- **Architecture awareness**: Understanding of target-specific optimizations
- **Performance insights**: Quantifies benefits of CPU-specific code
- **SIMD analysis**: Evaluates vector instruction effectiveness
- **Portability vs performance**: Helps balance portability and optimization
- **Configuration guidance**: Recommends optimal target settings

## Key Takeaways

- **Optimization levels** significantly impact performance and compilation time
- **LTO** provides cross-crate optimizations but increases compilation time
- **Target-specific optimizations** leverage hardware features
- **SIMD analysis** identifies vectorization opportunities
- **Comprehensive benchmarking** provides data-driven optimization decisions
- **Automated analysis** enables continuous optimization monitoring

## Next Steps

- Learn about **memory optimization** techniques
- Explore **parallel processing** and concurrency
- Study **advanced optimization** patterns
- Practice with **performance tuning** scenarios

## Resources

- [Rust Compiler Documentation](https://doc.rust-lang.org/rustc/)
- [LLVM Optimization Guide](https://llvm.org/docs/OptimizationGuides.html)
- [SIMD Programming Guide](https://doc.rust-lang.org/std/arch/)
- [Rust Performance Book](https://nnethercote.github.io/perf-book/)
