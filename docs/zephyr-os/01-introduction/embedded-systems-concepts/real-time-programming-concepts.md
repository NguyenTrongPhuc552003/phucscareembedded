---
sidebar_position: 2
sidebar_label: Real-Time Programming Concepts
---

# Real-Time Programming Concepts

## 🎯 Learning Objectives

- Understand what real-time systems are and their characteristics
- Learn about different types of real-time constraints
- Explore real-time programming patterns and best practices
- Understand timing analysis and schedulability concepts

---

## ❓ What are Real-Time Systems?

**Real-time systems** are computing systems that must respond to external events within specific, guaranteed time constraints. The correctness of a real-time system depends not only on the logical result of computation but also on the time at which the result is produced.

### Key Characteristics:

- **Timeliness**: Operations must complete within specified deadlines
- **Predictability**: System behavior must be predictable and consistent
- **Reliability**: High reliability is often required
- **Concurrency**: Often handle multiple tasks simultaneously
- **Responsiveness**: Must react quickly to external events

---

## 🚀 Why are Real-Time Systems Important?

### 1. **Safety-Critical Applications**

Many real-time systems are safety-critical:

```c
// Anti-lock braking system
void abs_control_loop(void)
{
    while (1) {
        // Read wheel speed sensors
        read_wheel_speeds();

        // Calculate slip ratio
        float slip_ratio = calculate_slip_ratio();

        // Apply brake pressure if needed
        if (slip_ratio > SLIP_THRESHOLD) {
            apply_brake_pressure();
        }

        // Must complete within 1ms
        k_sleep(K_MSEC(1));
    }
}
```

**Why this matters**: Safety-critical systems must respond within guaranteed time bounds to prevent accidents and ensure system safety.

### 2. **Industrial Control**

Real-time systems are essential for industrial automation:

```c
// PID controller for temperature control
void pid_control_loop(void)
{
    while (1) {
        // Read temperature sensor
        float current_temp = read_temperature();

        // Calculate PID output
        float error = setpoint - current_temp;
        float output = pid_calculate(error);

        // Update heater output
        set_heater_power(output);

        // Control loop must run every 100ms
        k_sleep(K_MSEC(100));
    }
}
```

**Why this matters**: Industrial processes require precise timing to maintain product quality and process efficiency.

### 3. **Communication Systems**

Real-time systems enable reliable communication:

```c
// UART communication with timing constraints
void uart_communication_task(void)
{
    while (1) {
        // Wait for data with timeout
        if (k_sem_take(&uart_data_sem, K_MSEC(10)) == 0) {
            // Process received data
            process_uart_data();
        } else {
            // Handle timeout
            handle_communication_timeout();
        }
    }
}
```

**Why this matters**: Communication protocols often have strict timing requirements for reliable data transmission.

---

## 🛠️ How Real-Time Systems Work

### 1. **Types of Real-Time Constraints**

Real-time systems are classified by the strictness of their timing requirements:

#### Hard Real-Time Systems

```c
// Flight control system - missing deadline is catastrophic
void flight_control_task(void)
{
    while (1) {
        // Read sensor data
        read_sensors();

        // Calculate control output
        calculate_control();

        // Update actuators
        update_actuators();

        // Must complete within 10ms - hard deadline
        if (k_uptime_get() - task_start_time > 10) {
            // System failure - missing deadline
            system_failure();
        }
    }
}
```

#### Soft Real-Time Systems

```c
// Video streaming - missing deadline degrades quality
void video_processing_task(void)
{
    while (1) {
        // Process video frame
        process_video_frame();

        // Try to complete within 33ms (30 FPS)
        if (k_uptime_get() - frame_start_time > 33) {
            // Skip frame or reduce quality
            skip_frame();
        }
    }
}
```

#### Firm Real-Time Systems

```c
// Data logging - missing deadline makes data useless
void data_logging_task(void)
{
    while (1) {
        // Collect sensor data
        collect_sensor_data();

        // Try to log within 1 second
        if (k_uptime_get() - log_start_time > 1000) {
            // Discard data - too old
            discard_data();
        } else {
            // Log data
            log_data();
        }
    }
}
```

### 2. **Real-Time Scheduling**

Real-time systems use specialized scheduling algorithms:

#### Rate Monotonic Scheduling (RMS)

```c
// Higher frequency tasks get higher priority
K_THREAD_DEFINE(high_freq_task, 1024, high_freq_function, NULL, NULL, NULL, 1, 0, 0);
K_THREAD_DEFINE(medium_freq_task, 1024, medium_freq_function, NULL, NULL, NULL, 2, 0, 0);
K_THREAD_DEFINE(low_freq_task, 1024, low_freq_function, NULL, NULL, NULL, 3, 0, 0);

void high_freq_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Critical task - runs every 10ms
        critical_operation();
        k_sleep(K_MSEC(10));
    }
}

void medium_freq_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Important task - runs every 50ms
        important_operation();
        k_sleep(K_MSEC(50));
    }
}

void low_freq_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Background task - runs every 200ms
        background_operation();
        k_sleep(K_MSEC(200));
    }
}
```

#### Earliest Deadline First (EDF)

```c
// Dynamic priority based on deadline
typedef struct {
    k_tid_t thread_id;
    uint32_t deadline;
    uint32_t period;
} edf_task_t;

void edf_scheduler(void)
{
    // Sort tasks by deadline
    sort_tasks_by_deadline();

    // Schedule task with earliest deadline
    schedule_earliest_deadline_task();
}
```

### 3. **Real-Time Programming Patterns**

#### Event-Driven Programming

```c
// Event-driven system with state machine
typedef enum {
    STATE_IDLE,
    STATE_ACTIVE,
    STATE_ERROR
} system_state_t;

static system_state_t current_state = STATE_IDLE;

void event_handler(event_type_t event)
{
    switch (current_state) {
        case STATE_IDLE:
            if (event == EVENT_START) {
                current_state = STATE_ACTIVE;
                start_operation();
            }
            break;

        case STATE_ACTIVE:
            if (event == EVENT_STOP) {
                current_state = STATE_IDLE;
                stop_operation();
            } else if (event == EVENT_ERROR) {
                current_state = STATE_ERROR;
                handle_error();
            }
            break;

        case STATE_ERROR:
            if (event == EVENT_RESET) {
                current_state = STATE_IDLE;
                reset_system();
            }
            break;
    }
}
```

#### Producer-Consumer Pattern

```c
// Producer-consumer with bounded buffer
#define BUFFER_SIZE 10
static sensor_data_t data_buffer[BUFFER_SIZE];
static uint8_t write_index = 0;
static uint8_t read_index = 0;
static uint8_t count = 0;

K_MUTEX_DEFINE(buffer_mutex);
K_SEM_DEFINE(data_available, 0, 1);
K_SEM_DEFINE(space_available, BUFFER_SIZE, 1);

void producer_task(void)
{
    while (1) {
        // Wait for space in buffer
        k_sem_take(&space_available, K_FOREVER);

        // Get data
        sensor_data_t data = read_sensor();

        // Add to buffer
        k_mutex_lock(&buffer_mutex, K_FOREVER);
        data_buffer[write_index] = data;
        write_index = (write_index + 1) % BUFFER_SIZE;
        count++;
        k_mutex_unlock(&buffer_mutex);

        // Signal data available
        k_sem_give(&data_available);
    }
}

void consumer_task(void)
{
    while (1) {
        // Wait for data
        k_sem_take(&data_available, K_FOREVER);

        // Get data from buffer
        k_mutex_lock(&buffer_mutex, K_FOREVER);
        sensor_data_t data = data_buffer[read_index];
        read_index = (read_index + 1) % BUFFER_SIZE;
        count--;
        k_mutex_unlock(&buffer_mutex);

        // Process data
        process_data(data);

        // Signal space available
        k_sem_give(&space_available);
    }
}
```

---

## 📊 Real-Time System Analysis

### 1. **Schedulability Analysis**

Determine if a set of tasks can meet their deadlines:

```c
// Task parameters
typedef struct {
    uint32_t period;      // Task period (ms)
    uint32_t deadline;    // Task deadline (ms)
    uint32_t execution_time; // Worst-case execution time (ms)
    uint32_t priority;    // Task priority
} task_params_t;

// Rate Monotonic Analysis
bool is_schedulable_rm(task_params_t tasks[], uint8_t num_tasks)
{
    float utilization = 0.0;

    // Calculate total utilization
    for (uint8_t i = 0; i < num_tasks; i++) {
        utilization += (float)tasks[i].execution_time / tasks[i].period;
    }

    // Check Liu-Layland bound
    float bound = num_tasks * (pow(2, 1.0/num_tasks) - 1);

    return utilization <= bound;
}

// Response time analysis
uint32_t calculate_response_time(task_params_t tasks[], uint8_t num_tasks, uint8_t task_index)
{
    uint32_t response_time = tasks[task_index].execution_time;
    uint32_t prev_response_time = 0;

    while (response_time != prev_response_time) {
        prev_response_time = response_time;
        response_time = tasks[task_index].execution_time;

        // Add interference from higher priority tasks
        for (uint8_t i = 0; i < task_index; i++) {
            response_time += ceil((float)response_time / tasks[i].period) * tasks[i].execution_time;
        }
    }

    return response_time;
}
```

### 2. **Timing Analysis**

Measure and analyze system timing:

```c
// Timing measurement
uint32_t measure_execution_time(void (*function)(void))
{
    uint32_t start_time = k_cycle_get_32();
    function();
    uint32_t end_time = k_cycle_get_32();

    return end_time - start_time;
}

// Jitter analysis
typedef struct {
    uint32_t min_time;
    uint32_t max_time;
    uint32_t avg_time;
    uint32_t jitter;
} timing_stats_t;

void analyze_timing(timing_stats_t *stats, uint32_t times[], uint8_t count)
{
    stats->min_time = times[0];
    stats->max_time = times[0];
    uint32_t sum = 0;

    for (uint8_t i = 0; i < count; i++) {
        if (times[i] < stats->min_time) {
            stats->min_time = times[i];
        }
        if (times[i] > stats->max_time) {
            stats->max_time = times[i];
        }
        sum += times[i];
    }

    stats->avg_time = sum / count;
    stats->jitter = stats->max_time - stats->min_time;
}
```

---

## 💡 Example: Real-Time Data Acquisition System

Let's create a comprehensive example showing real-time programming concepts:

```c
#include <zephyr.h>
#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/sensor.h>

// Task parameters
#define NUM_TASKS 3
#define SAMPLE_RATE_MS 10
#define PROCESS_RATE_MS 50
#define TRANSMIT_RATE_MS 100

// Task priorities (higher number = higher priority)
#define SAMPLE_PRIORITY 3
#define PROCESS_PRIORITY 2
#define TRANSMIT_PRIORITY 1

// Data structures
typedef struct {
    int32_t temperature;
    int32_t pressure;
    uint32_t timestamp;
} sensor_data_t;

typedef struct {
    float filtered_temp;
    float filtered_pressure;
    uint32_t sample_count;
} processed_data_t;

// Thread stacks
K_THREAD_STACK_DEFINE(sample_stack, 1024);
K_THREAD_STACK_DEFINE(process_stack, 1024);
K_THREAD_STACK_DEFINE(transmit_stack, 1024);

// Thread data
struct k_thread sample_thread_data;
struct k_thread process_thread_data;
struct k_thread transmit_thread_data;

// Synchronization
K_MUTEX_DEFINE(data_mutex);
K_SEM_DEFINE(sample_ready, 0, 1);
K_SEM_DEFINE(process_ready, 0, 1);

// Data buffers
#define BUFFER_SIZE 20
static sensor_data_t raw_data[BUFFER_SIZE];
static processed_data_t processed_data;
static uint8_t data_index = 0;
static uint8_t data_count = 0;

// Timing statistics
static uint32_t sample_times[100];
static uint32_t process_times[100];
static uint8_t timing_index = 0;

// Hardware devices
static const struct device *temp_sensor;
static const struct device *pressure_sensor;
static const struct device *gpio_dev;

// LED configuration
#define LED0_NODE DT_ALIAS(led0)
#define LED0_GPIO_LABEL DT_GPIO_LABEL(LED0_NODE, gpios)
#define LED0_GPIO_PIN DT_GPIO_PIN(LED0_NODE, gpios)
#define LED0_GPIO_FLAGS DT_GPIO_FLAGS(LED0_NODE, gpios)

// Sample task - highest priority
void sample_task(void *arg1, void *arg2, void *arg3)
{
    uint32_t start_time, end_time;

    while (1) {
        start_time = k_cycle_get_32();

        // Read sensors
        struct sensor_value temp_val, pressure_val;
        sensor_sample_fetch(temp_sensor);
        sensor_sample_fetch(pressure_sensor);

        sensor_channel_get(temp_sensor, SENSOR_CHAN_AMBIENT_TEMP, &temp_val);
        sensor_channel_get(pressure_sensor, SENSOR_CHAN_PRESS, &pressure_val);

        // Store data
        k_mutex_lock(&data_mutex, K_FOREVER);
        raw_data[data_index].temperature = temp_val.val1;
        raw_data[data_index].pressure = pressure_val.val1;
        raw_data[data_index].timestamp = k_uptime_get_32();

        data_index = (data_index + 1) % BUFFER_SIZE;
        if (data_count < BUFFER_SIZE) {
            data_count++;
        }
        k_mutex_unlock(&data_mutex);

        // Signal data ready
        k_sem_give(&sample_ready);

        // Measure execution time
        end_time = k_cycle_get_32();
        sample_times[timing_index] = end_time - start_time;
        timing_index = (timing_index + 1) % 100;

        // Wait for next sample period
        k_sleep(K_MSEC(SAMPLE_RATE_MS));
    }
}

// Process task - medium priority
void process_task(void *arg1, void *arg2, void *arg3)
{
    uint32_t start_time, end_time;

    while (1) {
        // Wait for sample data
        k_sem_take(&sample_ready, K_FOREVER);

        start_time = k_cycle_get_32();

        // Process data
        k_mutex_lock(&data_mutex, K_FOREVER);

        // Calculate filtered values
        float temp_sum = 0, pressure_sum = 0;
        for (uint8_t i = 0; i < data_count; i++) {
            temp_sum += raw_data[i].temperature;
            pressure_sum += raw_data[i].pressure;
        }

        processed_data.filtered_temp = temp_sum / data_count;
        processed_data.filtered_pressure = pressure_sum / data_count;
        processed_data.sample_count = data_count;

        k_mutex_unlock(&data_mutex);

        // Signal processing complete
        k_sem_give(&process_ready);

        // Measure execution time
        end_time = k_cycle_get_32();
        process_times[timing_index] = end_time - start_time;

        // Wait for next process period
        k_sleep(K_MSEC(PROCESS_RATE_MS));
    }
}

// Transmit task - lowest priority
void transmit_task(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Wait for processed data
        k_sem_take(&process_ready, K_FOREVER);

        // Transmit data
        printk("Temp: %.2f°C, Pressure: %.2f Pa, Samples: %d\n",
               processed_data.filtered_temp,
               processed_data.filtered_pressure,
               processed_data.sample_count);

        // Toggle LED to indicate transmission
        gpio_pin_toggle(gpio_dev, LED0_GPIO_PIN);

        // Wait for next transmit period
        k_sleep(K_MSEC(TRANSMIT_RATE_MS));
    }
}

// Timing analysis task
void timing_analysis_task(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        k_sleep(K_MSEC(5000));  // Analyze every 5 seconds

        // Calculate timing statistics
        uint32_t min_sample = sample_times[0];
        uint32_t max_sample = sample_times[0];
        uint32_t sum_sample = 0;

        for (uint8_t i = 0; i < 100; i++) {
            if (sample_times[i] < min_sample) {
                min_sample = sample_times[i];
            }
            if (sample_times[i] > max_sample) {
                max_sample = sample_times[i];
            }
            sum_sample += sample_times[i];
        }

        printk("Sample timing - Min: %d, Max: %d, Avg: %d, Jitter: %d\n",
               min_sample, max_sample, sum_sample / 100, max_sample - min_sample);
    }
}

// Main application
void main(void)
{
    int ret;

    printk("Real-Time Data Acquisition System\n");

    // Initialize hardware
    gpio_dev = device_get_binding(LED0_GPIO_LABEL);
    if (gpio_dev == NULL) {
        printk("Error: GPIO device not found\n");
        return;
    }

    ret = gpio_pin_configure(gpio_dev, LED0_GPIO_PIN,
                            GPIO_OUTPUT_ACTIVE | LED0_GPIO_FLAGS);
    if (ret < 0) {
        printk("Error: GPIO configuration failed\n");
        return;
    }

    temp_sensor = device_get_binding(DT_LABEL(DT_ALIAS(temp0)));
    if (temp_sensor == NULL) {
        printk("Error: Temperature sensor not found\n");
        return;
    }

    pressure_sensor = device_get_binding(DT_LABEL(DT_ALIAS(pressure0)));
    if (pressure_sensor == NULL) {
        printk("Error: Pressure sensor not found\n");
        return;
    }

    // Create real-time tasks
    k_thread_create(&sample_thread_data, sample_stack,
                   K_THREAD_STACK_SIZEOF(sample_stack),
                   sample_task, NULL, NULL, NULL,
                   SAMPLE_PRIORITY, 0, K_NO_WAIT);

    k_thread_create(&process_thread_data, process_stack,
                   K_THREAD_STACK_SIZEOF(process_stack),
                   process_task, NULL, NULL, NULL,
                   PROCESS_PRIORITY, 0, K_NO_WAIT);

    k_thread_create(&transmit_thread_data, transmit_stack,
                   K_THREAD_STACK_SIZEOF(transmit_stack),
                   transmit_task, NULL, NULL, NULL,
                   TRANSMIT_PRIORITY, 0, K_NO_WAIT);

    printk("Real-time tasks created\n");

    // Main loop
    while (1) {
        k_sleep(K_FOREVER);
    }
}
```

### Code Explanation:

1. **Real-Time Scheduling**:

   - Sample task: Highest priority, runs every 10ms
   - Process task: Medium priority, runs every 50ms
   - Transmit task: Lowest priority, runs every 100ms

2. **Synchronization**:

   - Mutex: Protects shared data buffers
   - Semaphores: Signal data availability between tasks
   - Producer-consumer pattern: Efficient data flow

3. **Timing Analysis**:

   - Execution time measurement: Cycle-accurate timing
   - Jitter analysis: Measure timing variations
   - Real-time monitoring: Continuous timing statistics

4. **Error Handling**:
   - Hardware validation: Check device availability
   - Resource protection: Mutex for shared data
   - Graceful degradation: Continue operation on errors

---

## 🔗 Resources

- [Real-Time Systems by Jane W. S. Liu](https://www.oreilly.com/library/view/real-time-systems/9780132496542/) - Comprehensive real-time systems theory
- [Real-Time Programming](https://www.embedded.com/real-time-programming/) - Industry articles and best practices
- [Scheduling Algorithms](https://www.embedded.com/rtos-scheduling-algorithms/) - Real-time scheduling theory
- [Timing Analysis](https://www.embedded.com/understanding-real-time-latency/) - Timing analysis techniques

---

## 📝 Summary

Real-time programming is essential for systems that must respond to events within specific time constraints:

### Key Concepts:

- **Real-Time Constraints**: Hard, soft, and firm deadlines
- **Scheduling Algorithms**: RMS, EDF, and priority-based
- **Programming Patterns**: Event-driven, producer-consumer
- **Timing Analysis**: Schedulability and performance analysis

### Design Principles:

- **Predictability**: System behavior must be predictable
- **Efficiency**: Optimize for worst-case performance
- **Reliability**: Handle errors gracefully
- **Testing**: Verify timing constraints

### Implementation Considerations:

- **Priority Assignment**: Higher frequency tasks get higher priority
- **Synchronization**: Use appropriate primitives for data sharing
- **Timing Measurement**: Monitor and analyze system performance
- **Error Handling**: Design for fault tolerance

In the next lesson, we'll explore Zephyr's kernel architecture and understand how it provides real-time capabilities.
