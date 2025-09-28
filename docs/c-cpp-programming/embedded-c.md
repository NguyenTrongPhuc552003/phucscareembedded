---
sidebar_position: 1
---

# Embedded C Programming

This guide covers C programming best practices for embedded systems, focusing on the Rock 5B+ platform.

## Embedded C Fundamentals

Embedded C programming requires understanding of:

- **Memory Management**: Stack, heap, and static memory
- **Hardware Interaction**: Registers, interrupts, and peripherals
- **Real-time Constraints**: Timing, deadlines, and responsiveness
- **Resource Limitations**: CPU, memory, and power constraints

## Memory Management

### 1. Memory Layout

```
┌─────────────────────────────────────┐
│           High Memory               │
├─────────────────────────────────────┤
│           Stack (grows down)        │
├─────────────────────────────────────┤
│           Heap (grows up)           │
├─────────────────────────────────────┤
│           BSS (uninitialized)      │
├─────────────────────────────────────┤
│           Data (initialized)        │
├─────────────────────────────────────┤
│           Text (code)               │
├─────────────────────────────────────┤
│           Low Memory                │
└─────────────────────────────────────┘
```

### 2. Memory Allocation Strategies

```c
// Static allocation (compile-time)
static int buffer[1000];

// Stack allocation (function scope)
void function() {
    int local_buffer[100];  // Stack allocated
}

// Heap allocation (runtime)
int *dynamic_buffer = malloc(1000 * sizeof(int));
if (dynamic_buffer == NULL) {
    // Handle allocation failure
}
free(dynamic_buffer);
```

## Hardware Interaction

### 1. Register Access

```c
// Define register addresses
#define GPIO_BASE 0xFE200000
#define GPIO_SET_OFFSET 0x1C
#define GPIO_CLR_OFFSET 0x28

// Define register pointers
volatile uint32_t *gpio_set = (volatile uint32_t *)(GPIO_BASE + GPIO_SET_OFFSET);
volatile uint32_t *gpio_clr = (volatile uint32_t *)(GPIO_BASE + GPIO_CLR_OFFSET);

// Set GPIO pin
void set_gpio_pin(int pin) {
    *gpio_set = (1 << pin);
}

// Clear GPIO pin
void clear_gpio_pin(int pin) {
    *gpio_clr = (1 << pin);
}
```

### 2. Bit Manipulation

```c
// Set bit
#define SET_BIT(reg, bit) ((reg) |= (1 << (bit)))

// Clear bit
#define CLEAR_BIT(reg, bit) ((reg) &= ~(1 << (bit)))

// Toggle bit
#define TOGGLE_BIT(reg, bit) ((reg) ^= (1 << (bit)))

// Check bit
#define CHECK_BIT(reg, bit) (((reg) >> (bit)) & 1)

// Example usage
uint32_t control_register = 0;
SET_BIT(control_register, 5);      // Set bit 5
CLEAR_BIT(control_register, 3);    // Clear bit 3
if (CHECK_BIT(control_register, 5)) {
    // Bit 5 is set
}
```

## Interrupt Handling

### 1. Interrupt Service Routine

```c
// Interrupt handler
volatile int interrupt_flag = 0;

void interrupt_handler(void) {
    // Clear interrupt source
    // Set flag for main loop processing
    interrupt_flag = 1;
}

// Main loop
int main() {
    while (1) {
        if (interrupt_flag) {
            // Process interrupt
            interrupt_flag = 0;
        }
        // Other tasks
    }
}
```

### 2. Critical Sections

```c
// Disable interrupts
void disable_interrupts(void) {
    __asm__ __volatile__ ("cpsid i" : : : "memory");
}

// Enable interrupts
void enable_interrupts(void) {
    __asm__ __volatile__ ("cpsie i" : : : "memory");
}

// Critical section
void critical_section(void) {
    disable_interrupts();
    // Critical code here
    enable_interrupts();
}
```

## Real-time Programming

### 1. Timing Functions

```c
#include <time.h>
#include <sys/time.h>

// High-resolution timing
struct timespec start, end;
clock_gettime(CLOCK_MONOTONIC, &start);

// Your code here

clock_gettime(CLOCK_MONOTONIC, &end);
long elapsed = (end.tv_sec - start.tv_sec) * 1000000000L + 
               (end.tv_nsec - start.tv_nsec);
```

### 2. Task Scheduling

```c
// Simple task scheduler
typedef struct {
    void (*task)(void);
    uint32_t period;
    uint32_t last_run;
} task_t;

task_t tasks[] = {
    {led_task, 100, 0},
    {sensor_task, 50, 0},
    {communication_task, 200, 0}
};

void scheduler(void) {
    uint32_t current_time = get_time_ms();
    
    for (int i = 0; i < 3; i++) {
        if (current_time - tasks[i].last_run >= tasks[i].period) {
            tasks[i].task();
            tasks[i].last_run = current_time;
        }
    }
}
```

## Performance Optimization

### 1. Loop Optimization

```c
// Unoptimized loop
for (int i = 0; i < 1000; i++) {
    array[i] = i * 2;
}

// Optimized loop (unroll by 4)
for (int i = 0; i < 1000; i += 4) {
    array[i] = i * 2;
    array[i+1] = (i+1) * 2;
    array[i+2] = (i+2) * 2;
    array[i+3] = (i+3) * 2;
}
```

### 2. Memory Access Optimization

```c
// Cache-friendly access pattern
void process_array(int *array, int size) {
    // Sequential access (good for cache)
    for (int i = 0; i < size; i++) {
        array[i] = process_element(array[i]);
    }
}

// Avoid cache misses
void avoid_cache_misses(int **matrix, int rows, int cols) {
    // Access by row (better cache locality)
    for (int i = 0; i < rows; i++) {
        for (int j = 0; j < cols; j++) {
            matrix[i][j] = 0;
        }
    }
}
```

## Error Handling

### 1. Return Codes

```c
typedef enum {
    SUCCESS = 0,
    ERROR_INVALID_PARAM = -1,
    ERROR_TIMEOUT = -2,
    ERROR_MEMORY = -3
} error_code_t;

error_code_t read_sensor(int sensor_id, float *value) {
    if (sensor_id < 0 || sensor_id >= MAX_SENSORS) {
        return ERROR_INVALID_PARAM;
    }
    
    if (value == NULL) {
        return ERROR_INVALID_PARAM;
    }
    
    // Read sensor
    *value = sensor_read(sensor_id);
    return SUCCESS;
}
```

### 2. Assertions

```c
#include <assert.h>

void process_data(int *data, int size) {
    assert(data != NULL);
    assert(size > 0);
    assert(size < MAX_SIZE);
    
    // Process data
    for (int i = 0; i < size; i++) {
        data[i] = data[i] * 2;
    }
}
```

## Debugging Techniques

### 1. Print Debugging

```c
#include <stdio.h>

#define DEBUG_ENABLED 1

#if DEBUG_ENABLED
#define DEBUG_PRINT(fmt, ...) printf("[DEBUG] " fmt "\n", ##__VA_ARGS__)
#else
#define DEBUG_PRINT(fmt, ...)
#endif

void debug_function(void) {
    DEBUG_PRINT("Function called");
    DEBUG_PRINT("Value: %d", some_value);
}
```

### 2. LED Debugging

```c
// Use LEDs for debugging
void debug_led(int pattern) {
    for (int i = 0; i < pattern; i++) {
        set_led(1);
        delay_ms(200);
        set_led(0);
        delay_ms(200);
    }
}

// Usage
if (error_condition) {
    debug_led(3);  // 3 blinks for error
}
```

## Best Practices

### 1. Code Style

```c
// Use meaningful variable names
int sensor_temperature = 0;
int max_retry_count = 3;

// Use constants for magic numbers
#define MAX_BUFFER_SIZE 1024
#define TIMEOUT_MS 5000

// Use enums for related constants
typedef enum {
    STATE_IDLE,
    STATE_ACTIVE,
    STATE_ERROR
} system_state_t;
```

### 2. Memory Safety

```c
// Always check pointer validity
if (ptr != NULL) {
    // Use pointer
}

// Initialize variables
int value = 0;
char buffer[MAX_SIZE] = {0};

// Use const where possible
const int MAX_ITEMS = 100;
```

### 3. Performance Tips

- Use appropriate data types
- Minimize function calls in loops
- Use lookup tables for calculations
- Optimize critical paths
- Profile your code

## Common Pitfalls

### 1. Buffer Overflows

```c
// Dangerous
char buffer[10];
strcpy(buffer, "This is too long");  // Buffer overflow!

// Safe
char buffer[10];
strncpy(buffer, "This is too long", sizeof(buffer) - 1);
buffer[sizeof(buffer) - 1] = '\0';
```

### 2. Integer Overflow

```c
// Dangerous
uint8_t a = 200;
uint8_t b = 100;
uint8_t result = a + b;  // Overflow!

// Safe
uint16_t result = (uint16_t)a + (uint16_t)b;
```

### 3. Uninitialized Variables

```c
// Dangerous
int value;  // Uninitialized
if (value > 0) {  // Undefined behavior
    // ...
}

// Safe
int value = 0;  // Always initialize
if (value > 0) {
    // ...
}
```

## Next Steps

- [C++ Best Practices](./cpp-best-practices.md)
- [Memory Management](./memory-management.md)
- [Debugging Techniques](./debugging-techniques.md)

## Resources

- [Embedded C Coding Standard](https://barrgroup.com/embedded-systems/books/embedded-c-coding-standard)
- [MISRA C Guidelines](https://www.misra.org.uk/)
- [ARM Cortex-A Programming](https://developer.arm.com/documentation)
- [Rock 5B+ Programming Guide](https://wiki.radxa.com/Rock5/software)
