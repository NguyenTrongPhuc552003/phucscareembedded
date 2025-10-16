---
sidebar_position: 1
sidebar_label: Embedded Systems Fundamentals
---

# Embedded Systems Fundamentals

## 🎯 Learning Objectives

- Understand what embedded systems are and their characteristics
- Learn about microcontrollers and their architecture
- Explore memory organization and management in embedded systems
- Understand interrupt handling and timing concepts

---

## ❓ What are Embedded Systems?

**Embedded systems** are specialized computing systems designed to perform specific functions within larger mechanical or electronic systems. Unlike general-purpose computers, embedded systems are typically:

- **Dedicated**: Designed for specific tasks
- **Resource-constrained**: Limited memory, processing power, and energy
- **Real-time**: Must respond to events within specific time constraints
- **Reliable**: Must operate continuously without failure
- **Cost-effective**: Optimized for mass production

### Examples of Embedded Systems:

- **Consumer Electronics**: Smartphones, smart watches, fitness trackers
- **Automotive**: Engine control units, anti-lock braking systems, infotainment
- **Industrial**: Programmable logic controllers, sensors, actuators
- **Medical**: Pacemakers, insulin pumps, patient monitors
- **IoT Devices**: Smart home sensors, environmental monitors, asset trackers

---

## 🚀 Why are Embedded Systems Important?

### 1. **Ubiquity in Modern Life**

Embedded systems are everywhere in our daily lives:

```c
// Smart home temperature sensor
#include <zephyr/sensor.h>

void read_temperature(void)
{
    struct sensor_value temp;
    sensor_sample_fetch(temp_sensor);
    sensor_channel_get(temp_sensor, SENSOR_CHAN_AMBIENT_TEMP, &temp);

    // Send to home automation system
    send_to_cloud(temp.val1, temp.val2);
}
```

**Why this matters**: Embedded systems enable the Internet of Things (IoT) and smart devices that make our lives more convenient and efficient.

### 2. **Real-Time Requirements**

Many embedded systems must respond to events within strict time constraints:

```c
// Anti-lock braking system
void abs_interrupt_handler(void)
{
    // Must respond within 1ms
    if (wheel_speed < threshold) {
        // Apply brake pressure
        apply_brake_pressure();
    }
}
```

**Why this matters**: Safety-critical systems require deterministic behavior and guaranteed response times.

### 3. **Resource Optimization**

Embedded systems must work within tight resource constraints:

```c
// Memory-constrained sensor node
#define MAX_SAMPLES 100
static sensor_data_t samples[MAX_SAMPLES];
static uint8_t sample_count = 0;

void store_sample(sensor_data_t data)
{
    if (sample_count < MAX_SAMPLES) {
        samples[sample_count++] = data;
    } else {
        // Send data and reset
        send_samples();
        sample_count = 0;
    }
}
```

**Why this matters**: Efficient use of limited resources enables cost-effective and battery-powered devices.

---

## 🛠️ How Embedded Systems Work

### 1. **Microcontroller Architecture**

Embedded systems are typically built around microcontrollers:

```
┌─────────────────────────────────────┐
│              CPU Core               │  ← ARM Cortex-M, RISC-V, etc.
├─────────────────────────────────────┤
│            Memory System            │  ← Flash, RAM, EEPROM
├─────────────────────────────────────┤
│          Peripheral Interfaces      │  ← GPIO, UART, SPI, I2C, ADC
├─────────────────────────────────────┤
│         Clock and Power Mgmt        │  ← System clocks, power control
└─────────────────────────────────────┘
```

**Key Components**:

- **CPU Core**: Executes instructions and manages system
- **Memory**: Stores program code and data
- **Peripherals**: Interface with external world
- **Clock System**: Provides timing for all operations

### 2. **Memory Organization**

Embedded systems have different types of memory:

```c
// Memory layout in embedded systems
// Flash Memory (Program Storage)
const char version[] = "1.0.0";  // Stored in flash
const uint32_t config_table[] = {0x1234, 0x5678};  // Stored in flash

// RAM (Runtime Data)
static uint32_t sensor_data[100];  // Stored in RAM
static bool system_initialized = false;  // Stored in RAM

// EEPROM (Persistent Data)
uint8_t eeprom_read(uint16_t address);
void eeprom_write(uint16_t address, uint8_t data);
```

**Memory Types**:

- **Flash**: Non-volatile, stores program code and constants
- **RAM**: Volatile, stores runtime data and variables
- **EEPROM**: Non-volatile, stores configuration and persistent data
- **Registers**: Fastest access, used for peripheral control

### 3. **Interrupt Handling**

Interrupts enable real-time response to external events:

```c
// Interrupt service routine
void button_press_handler(const struct device *dev, struct gpio_callback *cb,
                         uint32_t pins)
{
    // This function is called when button is pressed
    // Must be fast and efficient
    button_pressed = true;
    k_sem_give(&button_sem);
}

// Configure interrupt
void configure_button_interrupt(void)
{
    gpio_pin_interrupt_configure(button_dev, BUTTON_PIN, GPIO_INT_EDGE_TO_ACTIVE);
    gpio_init_callback(&button_cb, button_press_handler, BIT(BUTTON_PIN));
    gpio_add_callback(button_dev, &button_cb);
}
```

**Interrupt Characteristics**:

- **Fast Response**: Interrupts provide immediate response to events
- **Priority-based**: Higher priority interrupts can preempt lower ones
- **Context Switching**: Automatic saving and restoring of CPU state
- **Nesting**: Interrupts can be interrupted by higher priority interrupts

---

## 📊 Embedded Systems vs General-Purpose Computers

| Aspect          | Embedded Systems   | General-Purpose Computers |
| --------------- | ------------------ | ------------------------- |
| **Purpose**     | Specific function  | General computing         |
| **Resources**   | Limited (KB-MB)    | Abundant (GB-TB)          |
| **Power**       | Low power (mW-W)   | High power (W-kW)         |
| **Real-time**   | Often required     | Usually not required      |
| **OS**          | RTOS or bare metal | General-purpose OS        |
| **Development** | Cross-compilation  | Native compilation        |
| **Debugging**   | Hardware debuggers | Software debuggers        |
| **Cost**        | Low cost           | Higher cost               |

### When to Use Embedded Systems:

- **Dedicated Function**: When you need a specific, well-defined function
- **Resource Constraints**: When memory, power, or cost are limited
- **Real-Time Requirements**: When timing is critical
- **Reliability**: When the system must work continuously
- **Integration**: When the system must be integrated into a larger system

---

## 💡 Example: Temperature Monitoring System

Let's create a comprehensive example showing embedded systems concepts:

```c
#include <zephyr.h>
#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/uart.h>
#include <zephyr/sensor.h>

// Hardware configuration
#define LED0_NODE DT_ALIAS(led0)
#define BUTTON0_NODE DT_ALIAS(sw0)
#define TEMP_SENSOR_NODE DT_ALIAS(temp0)
#define UART0_NODE DT_ALIAS(serial0)

// GPIO configuration
#define LED0_GPIO_LABEL DT_GPIO_LABEL(LED0_NODE, gpios)
#define LED0_GPIO_PIN DT_GPIO_PIN(LED0_NODE, gpios)
#define LED0_GPIO_FLAGS DT_GPIO_FLAGS(LED0_NODE, gpios)

#define BUTTON0_GPIO_LABEL DT_GPIO_LABEL(BUTTON0_NODE, gpios)
#define BUTTON0_GPIO_PIN DT_GPIO_PIN(BUTTON0_NODE, gpios)
#define BUTTON0_GPIO_FLAGS DT_GPIO_FLAGS(BUTTON0_NODE, gpios)

// Thread stacks
K_THREAD_STACK_DEFINE(temp_thread_stack, 1024);
K_THREAD_STACK_DEFINE(led_thread_stack, 1024);

// Thread data
struct k_thread temp_thread_data;
struct k_thread led_thread_data;

// Synchronization
K_MUTEX_DEFINE(print_mutex);
K_SEM_DEFINE(button_sem, 0, 1);

// Global variables
static const struct device *gpio_dev;
static const struct device *uart_dev;
static const struct device *temp_sensor;
static volatile bool led_state = false;
static volatile bool system_enabled = true;

// Temperature data structure
typedef struct {
    int32_t temperature;
    uint32_t timestamp;
} temp_data_t;

// Temperature data buffer
#define MAX_TEMP_SAMPLES 50
static temp_data_t temp_buffer[MAX_TEMP_SAMPLES];
static uint8_t temp_index = 0;

// Button interrupt callback
void button_press_handler(const struct device *dev, struct gpio_callback *cb,
                         uint32_t pins)
{
    // Toggle system enable/disable
    system_enabled = !system_enabled;
    k_sem_give(&button_sem);
}

// Configure button interrupt
void configure_button_interrupt(void)
{
    const struct device *button_dev = device_get_binding(BUTTON0_GPIO_LABEL);

    gpio_pin_configure(button_dev, BUTTON0_GPIO_PIN,
                      GPIO_INPUT | BUTTON0_GPIO_FLAGS);
    gpio_pin_interrupt_configure(button_dev, BUTTON0_GPIO_PIN,
                                GPIO_INT_EDGE_TO_ACTIVE);

    static struct gpio_callback button_cb;
    gpio_init_callback(&button_cb, button_press_handler, BIT(BUTTON0_GPIO_PIN));
    gpio_add_callback(button_dev, &button_cb);
}

// Temperature monitoring thread
void temp_thread_function(void *arg1, void *arg2, void *arg3)
{
    struct sensor_value temp;
    temp_data_t data;

    while (1) {
        if (system_enabled) {
            // Read temperature sensor
            sensor_sample_fetch(temp_sensor);
            sensor_channel_get(temp_sensor, SENSOR_CHAN_AMBIENT_TEMP, &temp);

            // Store temperature data
            data.temperature = temp.val1;
            data.timestamp = k_uptime_get_32();

            temp_buffer[temp_index] = data;
            temp_index = (temp_index + 1) % MAX_TEMP_SAMPLES;

            // Print temperature
            k_mutex_lock(&print_mutex, K_FOREVER);
            printk("Temperature: %d.%d°C\n", temp.val1, temp.val2);
            k_mutex_unlock(&print_mutex);

            // Send via UART
            char uart_msg[64];
            snprintf(uart_msg, sizeof(uart_msg), "TEMP:%d.%d\n",
                    temp.val1, temp.val2);
            uart_fifo_fill(uart_dev, uart_msg, strlen(uart_msg));
        }

        k_sleep(K_MSEC(1000));  // Read every second
    }
}

// LED control thread
void led_thread_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        if (system_enabled) {
            // Blink LED to indicate system is active
            led_state = !led_state;
            gpio_pin_set(gpio_dev, LED0_GPIO_PIN, led_state);
        } else {
            // Turn off LED when system is disabled
            gpio_pin_set(gpio_dev, LED0_GPIO_PIN, 0);
        }

        k_sleep(K_MSEC(500));
    }
}

// Button handling thread
void button_thread_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Wait for button press
        k_sem_take(&button_sem, K_FOREVER);

        k_mutex_lock(&print_mutex, K_FOREVER);
        printk("System %s\n", system_enabled ? "enabled" : "disabled");
        k_mutex_unlock(&print_mutex);
    }
}

// Main application
void main(void)
{
    int ret;

    printk("Embedded Systems Example\n");

    // Initialize GPIO
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

    // Initialize UART
    uart_dev = device_get_binding(DT_LABEL(UART0_NODE));
    if (uart_dev == NULL) {
        printk("Error: UART device not found\n");
        return;
    }

    // Initialize temperature sensor
    temp_sensor = device_get_binding(DT_LABEL(TEMP_SENSOR_NODE));
    if (temp_sensor == NULL) {
        printk("Error: Temperature sensor not found\n");
        return;
    }

    // Configure button interrupt
    configure_button_interrupt();

    // Create threads
    k_thread_create(&temp_thread_data, temp_thread_stack,
                   K_THREAD_STACK_SIZEOF(temp_thread_stack),
                   temp_thread_function, NULL, NULL, NULL,
                   K_PRIO_COOP(7), 0, K_NO_WAIT);

    k_thread_create(&led_thread_data, led_thread_stack,
                   K_THREAD_STACK_SIZEOF(led_thread_stack),
                   led_thread_function, NULL, NULL, NULL,
                   K_PRIO_COOP(6), 0, K_NO_WAIT);

    printk("System initialized\n");

    // Main loop
    while (1) {
        k_sleep(K_FOREVER);
    }
}
```

### Code Explanation:

1. **Hardware Abstraction**:

   - Device tree: Hardware configuration
   - Driver APIs: GPIO, UART, sensor control
   - Error handling: Proper error checking

2. **Memory Management**:

   - Static allocation: Fixed-size buffers
   - Circular buffer: Efficient data storage
   - Stack allocation: Thread-specific memory

3. **Interrupt Handling**:

   - Button interrupt: Immediate response to user input
   - Interrupt callback: Fast, efficient handling
   - Semaphore signaling: Communication between interrupt and thread

4. **Real-Time Behavior**:
   - Thread priorities: Temperature monitoring has higher priority
   - Timing constraints: 1-second temperature readings
   - Deterministic behavior: Predictable system response

---

## 🔗 Resources

- [Embedded Systems Design](https://www.embedded.com/) - Industry news and articles
- [ARM Cortex-M Documentation](https://developer.arm.com/ip-products/processors/cortex-m) - ARM microcontroller documentation
- [Real-Time Systems](https://www.oreilly.com/library/view/real-time-systems/9780132496542/) - Real-time systems theory
- [Embedded C Programming](https://www.oreilly.com/library/view/programming-embedded-systems/0596007650/) - Embedded programming guide

---

## 📝 Summary

Embedded systems are specialized computing systems with unique characteristics:

### Key Characteristics:

- **Dedicated Purpose**: Designed for specific functions
- **Resource Constraints**: Limited memory, processing, and power
- **Real-Time Requirements**: Must respond within time constraints
- **Reliability**: Must operate continuously without failure
- **Integration**: Part of larger systems

### Key Components:

- **Microcontroller**: CPU, memory, and peripherals
- **Memory System**: Flash, RAM, and EEPROM
- **Peripherals**: GPIO, UART, SPI, I2C, ADC
- **Interrupt System**: Real-time event handling

### Development Considerations:

- **Cross-Compilation**: Develop on host, run on target
- **Hardware Debugging**: Use debuggers and oscilloscopes
- **Resource Optimization**: Efficient use of limited resources
- **Real-Time Design**: Consider timing constraints
- **Testing**: Hardware-in-the-loop testing

In the next lesson, we'll explore real-time programming concepts and understand how they apply to Zephyr development.
