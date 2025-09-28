---
sidebar_position: 4
---

# Debugging Techniques for Embedded Systems

This comprehensive guide covers debugging techniques and tools for embedded C/C++ development on the Rock 5B+ platform.

## Debugging Fundamentals

### 1. Debugging Mindset

- **Systematic Approach**: Debug methodically, not randomly
- **Reproducible Issues**: Make bugs reproducible before debugging
- **Root Cause Analysis**: Find the root cause, not just symptoms
- **Documentation**: Document debugging process and solutions

### 2. Common Debugging Challenges

- **Timing Issues**: Race conditions and timing-dependent bugs
- **Memory Problems**: Buffer overflows, memory leaks, corruption
- **Hardware Issues**: Peripheral failures, power problems
- **Real-time Constraints**: Debugging without affecting timing

## Print-Based Debugging

### 1. Printf Debugging

```c
#include <stdio.h>
#include <stdarg.h>

// Debug levels
typedef enum {
    DEBUG_LEVEL_ERROR = 0,
    DEBUG_LEVEL_WARNING = 1,
    DEBUG_LEVEL_INFO = 2,
    DEBUG_LEVEL_DEBUG = 3
} debug_level_t;

// Global debug level
static debug_level_t current_debug_level = DEBUG_LEVEL_INFO;

// Debug print function
void debug_print(debug_level_t level, const char* file, int line, const char* format, ...) {
    if (level > current_debug_level) {
        return;
    }
    
    const char* level_names[] = {"ERROR", "WARNING", "INFO", "DEBUG"};
    
    printf("[%s] %s:%d: ", level_names[level], file, line);
    
    va_list args;
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
    
    printf("\n");
}

// Debug macros
#define DEBUG_ERROR(fmt, ...)   debug_print(DEBUG_LEVEL_ERROR, __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define DEBUG_WARNING(fmt, ...) debug_print(DEBUG_LEVEL_WARNING, __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define DEBUG_INFO(fmt, ...)    debug_print(DEBUG_LEVEL_INFO, __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define DEBUG_DEBUG(fmt, ...)   debug_print(DEBUG_LEVEL_DEBUG, __FILE__, __LINE__, fmt, ##__VA_ARGS__)

// Usage example
void process_sensor_data(int sensor_id, float value) {
    DEBUG_INFO("Processing sensor %d with value %.2f", sensor_id, value);
    
    if (value < 0.0f || value > 100.0f) {
        DEBUG_WARNING("Sensor %d value out of range: %.2f", sensor_id, value);
    }
    
    // Process data...
    DEBUG_DEBUG("Sensor %d processing complete", sensor_id);
}
```

### 2. LED Debugging

```c
#include <unistd.h>

// LED debug patterns
typedef enum {
    LED_PATTERN_NORMAL = 1,
    LED_PATTERN_ERROR = 3,
    LED_PATTERN_WARNING = 2,
    LED_PATTERN_DEBUG = 4
} led_pattern_t;

// LED debug function
void led_debug(led_pattern_t pattern) {
    for (int i = 0; i < pattern; i++) {
        // Turn LED on
        printf("LED ON\n");
        usleep(200000); // 200ms
        
        // Turn LED off
        printf("LED OFF\n");
        usleep(200000); // 200ms
    }
    
    // Long pause between patterns
    usleep(1000000); // 1 second
}

// Usage in error handling
void handle_error(int error_code) {
    DEBUG_ERROR("Error occurred: %d", error_code);
    
    switch (error_code) {
        case 1:
            led_debug(LED_PATTERN_ERROR);
            break;
        case 2:
            led_debug(LED_PATTERN_WARNING);
            break;
        default:
            led_debug(LED_PATTERN_DEBUG);
            break;
    }
}
```

## Hardware Debugging

### 1. GPIO Debugging

```c
#include <stdio.h>
#include <unistd.h>

// GPIO debug pins
#define DEBUG_PIN_1 18
#define DEBUG_PIN_2 19
#define DEBUG_PIN_3 20

// GPIO debug functions
void gpio_debug_init(void) {
    // Export GPIO pins
    printf("echo %d > /sys/class/gpio/export\n", DEBUG_PIN_1);
    printf("echo %d > /sys/class/gpio/export\n", DEBUG_PIN_2);
    printf("echo %d > /sys/class/gpio/export\n", DEBUG_PIN_3);
    
    // Set as outputs
    printf("echo out > /sys/class/gpio/gpio%d/direction\n", DEBUG_PIN_1);
    printf("echo out > /sys/class/gpio/gpio%d/direction\n", DEBUG_PIN_2);
    printf("echo out > /sys/class/gpio/gpio%d/direction\n", DEBUG_PIN_3);
}

void gpio_debug_set(int pin, int value) {
    printf("echo %d > /sys/class/gpio/gpio%d/value\n", value, pin);
}

void gpio_debug_pulse(int pin) {
    gpio_debug_set(pin, 1);
    usleep(10000); // 10ms
    gpio_debug_set(pin, 0);
}

// Debug state machine
void debug_state_machine(int state) {
    switch (state) {
        case 0: // IDLE
            gpio_debug_set(DEBUG_PIN_1, 0);
            gpio_debug_set(DEBUG_PIN_2, 0);
            gpio_debug_set(DEBUG_PIN_3, 0);
            break;
        case 1: // INITIALIZING
            gpio_debug_set(DEBUG_PIN_1, 1);
            gpio_debug_set(DEBUG_PIN_2, 0);
            gpio_debug_set(DEBUG_PIN_3, 0);
            break;
        case 2: // RUNNING
            gpio_debug_set(DEBUG_PIN_1, 0);
            gpio_debug_set(DEBUG_PIN_2, 1);
            gpio_debug_set(DEBUG_PIN_3, 0);
            break;
        case 3: // ERROR
            gpio_debug_set(DEBUG_PIN_1, 1);
            gpio_debug_set(DEBUG_PIN_2, 1);
            gpio_debug_set(DEBUG_PIN_3, 1);
            break;
    }
}
```

### 2. Oscilloscope Debugging

```c
// Timing debug with GPIO
void debug_timing_start(void) {
    gpio_debug_set(DEBUG_PIN_1, 1);
}

void debug_timing_end(void) {
    gpio_debug_set(DEBUG_PIN_1, 0);
}

// Function execution timing
void timed_function(void) {
    debug_timing_start();
    
    // Your function code here
    usleep(100000); // Simulate work
    
    debug_timing_end();
}
```

## Software Debugging Tools

### 1. GDB Debugging

```bash
# Compile with debug symbols
gcc -g -O0 -o program program.c

# Start GDB
gdb ./program

# GDB commands
(gdb) break main
(gdb) run
(gdb) step
(gdb) next
(gdb) print variable_name
(gdb) watch variable_name
(gdb) backtrace
(gdb) continue
```

### 2. Remote GDB Debugging

```bash
# On target (Rock 5B+)
gdbserver :1234 ./program

# On host
gdb-multiarch ./program
(gdb) target remote 192.168.1.100:1234
(gdb) break main
(gdb) continue
```

### 3. Valgrind for Memory Debugging

```bash
# Install Valgrind
sudo apt install -y valgrind

# Run with Valgrind
valgrind --tool=memcheck --leak-check=full ./program

# Valgrind options
valgrind --tool=memcheck --track-origins=yes --leak-check=full ./program
```

## Advanced Debugging Techniques

### 1. Assertion-Based Debugging

```c
#include <assert.h>
#include <stdio.h>

// Custom assertion macro
#define ASSERT(condition, message) \
    do { \
        if (!(condition)) { \
            fprintf(stderr, "Assertion failed: %s\n", message); \
            fprintf(stderr, "File: %s, Line: %d\n", __FILE__, __LINE__); \
            abort(); \
        } \
    } while(0)

// Usage
void process_data(int* data, int size) {
    ASSERT(data != NULL, "Data pointer is NULL");
    ASSERT(size > 0, "Size must be positive");
    ASSERT(size < 1000, "Size too large");
    
    // Process data
    for (int i = 0; i < size; i++) {
        ASSERT(data[i] >= 0, "Data value must be non-negative");
        data[i] = data[i] * 2;
    }
}
```

### 2. Logging System

```c
#include <stdio.h>
#include <time.h>
#include <pthread.h>

// Thread-safe logging
static pthread_mutex_t log_mutex = PTHREAD_MUTEX_INITIALIZER;

void log_message(const char* level, const char* file, int line, const char* format, ...) {
    pthread_mutex_lock(&log_mutex);
    
    // Get timestamp
    time_t now = time(NULL);
    struct tm* tm_info = localtime(&now);
    
    // Print timestamp
    printf("[%04d-%02d-%02d %02d:%02d:%02d] ",
           tm_info->tm_year + 1900, tm_info->tm_mon + 1, tm_info->tm_mday,
           tm_info->tm_hour, tm_info->tm_min, tm_info->tm_sec);
    
    // Print level and location
    printf("[%s] %s:%d: ", level, file, line);
    
    // Print message
    va_list args;
    va_start(args, format);
    vprintf(format, args);
    va_end(args);
    
    printf("\n");
    fflush(stdout);
    
    pthread_mutex_unlock(&log_mutex);
}

// Logging macros
#define LOG_ERROR(fmt, ...)   log_message("ERROR", __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_WARNING(fmt, ...) log_message("WARNING", __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_INFO(fmt, ...)    log_message("INFO", __FILE__, __LINE__, fmt, ##__VA_ARGS__)
#define LOG_DEBUG(fmt, ...)   log_message("DEBUG", __FILE__, __LINE__, fmt, ##__VA_ARGS__)
```

### 3. Performance Profiling

```c
#include <time.h>
#include <sys/time.h>

// High-resolution timing
struct timespec get_time(void) {
    struct timespec ts;
    clock_gettime(CLOCK_MONOTONIC, &ts);
    return ts;
}

double time_diff_ms(struct timespec start, struct timespec end) {
    return (end.tv_sec - start.tv_sec) * 1000.0 + 
           (end.tv_nsec - start.tv_nsec) / 1000000.0;
}

// Function profiling
void profile_function(const char* name, void (*func)(void)) {
    struct timespec start = get_time();
    
    func();
    
    struct timespec end = get_time();
    double duration = time_diff_ms(start, end);
    
    printf("Function %s took %.3f ms\n", name, duration);
}

// Usage
void my_function(void) {
    // Your function code
    usleep(100000);
}

int main(void) {
    profile_function("my_function", my_function);
    return 0;
}
```

## Real-Time Debugging

### 1. Non-Intrusive Debugging

```c
#include <signal.h>
#include <ucontext.h>

// Signal handler for debugging
void debug_signal_handler(int sig, siginfo_t* info, void* context) {
    ucontext_t* uc = (ucontext_t*)context;
    
    printf("Signal %d received at address %p\n", sig, info->si_addr);
    printf("Program counter: %p\n", uc->uc_mcontext.pc);
    printf("Stack pointer: %p\n", uc->uc_mcontext.sp);
    
    // Don't exit, just log
}

// Setup signal handler
void setup_debug_signals(void) {
    struct sigaction sa;
    sa.sa_sigaction = debug_signal_handler;
    sa.sa_flags = SA_SIGINFO;
    sigemptyset(&sa.sa_mask);
    
    sigaction(SIGSEGV, &sa, NULL);
    sigaction(SIGBUS, &sa, NULL);
    sigaction(SIGFPE, &sa, NULL);
}
```

### 2. Watchdog Debugging

```c
#include <signal.h>
#include <unistd.h>

static volatile int watchdog_counter = 0;

// Watchdog signal handler
void watchdog_handler(int sig) {
    watchdog_counter++;
    printf("Watchdog tick: %d\n", watchdog_counter);
    
    if (watchdog_counter > 10) {
        printf("System appears to be stuck!\n");
        // Take corrective action
    }
}

// Setup watchdog
void setup_watchdog(void) {
    signal(SIGALRM, watchdog_handler);
    alarm(1); // 1 second watchdog
}

// Reset watchdog
void reset_watchdog(void) {
    watchdog_counter = 0;
    alarm(1);
}
```

## Debugging Best Practices

### 1. Systematic Approach

1. **Reproduce the Bug**: Make the bug happen consistently
2. **Isolate the Problem**: Narrow down the scope
3. **Gather Information**: Use debugging tools to collect data
4. **Form Hypothesis**: Make educated guesses about the cause
5. **Test Hypothesis**: Verify or disprove your theory
6. **Fix and Verify**: Implement fix and test thoroughly

### 2. Debugging Tools

- **GDB**: Source-level debugging
- **Valgrind**: Memory debugging
- **Strace**: System call tracing
- **Ltrace**: Library call tracing
- **Perf**: Performance profiling
- **Oscilloscope**: Hardware timing analysis

### 3. Prevention Strategies

- **Code Reviews**: Catch bugs before they happen
- **Unit Testing**: Test individual components
- **Integration Testing**: Test system interactions
- **Static Analysis**: Use tools like cppcheck, clang-tidy
- **Memory Sanitizers**: Use AddressSanitizer, ThreadSanitizer

## Next Steps

- [Memory Management](./memory-management.md)
- [C++ Best Practices](./cpp-best-practices.md)
- [Embedded C Programming](./embedded-c.md)

## Resources

- [GDB Documentation](https://www.gnu.org/software/gdb/documentation/)
- [Valgrind User Manual](https://valgrind.org/docs/manual/manual.html)
- [Embedded Debugging Techniques](https://www.embedded.com/design/programming-languages-and-tools/4428708/Embedded-debugging-techniques)
- [Rock 5B+ Debugging Guide](https://wiki.radxa.com/Rock5/software/debugging)
