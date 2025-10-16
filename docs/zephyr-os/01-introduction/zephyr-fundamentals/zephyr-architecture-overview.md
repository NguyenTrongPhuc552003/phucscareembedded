---
sidebar_position: 2
sidebar_label: Zephyr Architecture Overview
---

# Zephyr Architecture Overview

## 🎯 Learning Objectives

- Understand Zephyr's microkernel architecture and design principles
- Learn about the different layers and components of Zephyr OS
- Explore how Zephyr's modular design enables scalability
- Understand the relationship between kernel services and applications

---

## ❓ What is Zephyr's Architecture?

Zephyr OS uses a **microkernel architecture** with a modular, layered design that separates concerns and enables scalability. The architecture is designed to be:

- **Modular**: Components can be included or excluded based on requirements
- **Scalable**: Memory footprint from 8KB to several MB
- **Portable**: Hardware abstraction layer enables portability
- **Configurable**: Features can be enabled/disabled at compile time

---

## 🚀 Why Microkernel Architecture?

### Advantages of Microkernel Design:

1. **Modularity**: Only include what you need
2. **Maintainability**: Easier to debug and update individual components
3. **Portability**: Hardware abstraction enables easy porting
4. **Security**: Smaller kernel surface reduces attack vectors
5. **Flexibility**: Easy to customize for specific applications

### Comparison with Monolithic Kernels:

| Aspect          | Microkernel (Zephyr) | Monolithic (Linux)    |
| --------------- | -------------------- | --------------------- |
| **Size**        | Small (8KB-2MB)      | Large (20MB+)         |
| **Performance** | Good for embedded    | Excellent for desktop |
| **Modularity**  | High                 | Medium                |
| **Complexity**  | Low                  | High                  |
| **Real-time**   | Excellent            | Good with patches     |

---

## 🛠️ How Zephyr Architecture Works

### 1. **Layered Architecture**

Zephyr is organized in distinct layers:

```
┌─────────────────────────────────────┐
│           Application Layer         │  ← Your application code
├─────────────────────────────────────┤
│         Kernel Services Layer       │  ← Threading, memory, etc.
├─────────────────────────────────────┤
│      Hardware Abstraction Layer     │  ← Device drivers, HAL
├─────────────────────────────────────┤
│         Hardware Layer              │  ← Target microcontroller
└─────────────────────────────────────┘
```

### 2. **Core Kernel Components**

The Zephyr kernel consists of several core components:

```c
// Kernel configuration
CONFIG_MULTITHREADING=y          // Threading support
CONFIG_SCHED_DEADLINE=y          // Deadline scheduling
CONFIG_PREEMPT_ENABLED=y         // Preemptive scheduling
CONFIG_TIMESLICING=y             // Time slicing
CONFIG_MEMORY_PROTECTION=y       // Memory protection
CONFIG_STACK_CANARIES=y          // Stack protection
```

**Core Components**:

- **Scheduler**: Manages thread execution and priorities
- **Memory Manager**: Handles memory allocation and protection
- **Interrupt Manager**: Manages hardware interrupts
- **Timer Services**: Provides timing and delay functions
- **Synchronization**: Mutexes, semaphores, and other primitives

---

## 📊 Zephyr Architecture Layers

### 1. **Application Layer**

Your application code runs in this layer:

```c
// main.c - Application entry point
#include <zephyr.h>
#include <zephyr/kernel.h>

// Thread definition
K_THREAD_DEFINE(my_thread, 1024, thread_function, NULL, NULL, NULL, 7, 0, 0);

void thread_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Application logic
        printk("Thread running\n");
        k_sleep(K_MSEC(1000));
    }
}

void main(void)
{
    printk("Application started\n");

    // Application initialization
    // ...

    // Main loop or let threads handle everything
    while (1) {
        k_sleep(K_FOREVER);
    }
}
```

**Key Features**:

- **Main Function**: Application entry point
- **Threads**: Your application tasks
- **Interrupt Handlers**: Hardware event handling
- **Device Drivers**: Custom hardware interfaces

### 2. **Kernel Services Layer**

Core kernel services provide real-time capabilities:

```c
// Threading services
#include <zephyr/kernel.h>

// Create thread
k_tid_t thread_id = k_thread_create(&thread_data, thread_stack,
                                   K_THREAD_STACK_SIZEOF(thread_stack),
                                   thread_function, NULL, NULL, NULL,
                                   K_PRIO_COOP(7), 0, K_NO_WAIT);

// Synchronization
K_MUTEX_DEFINE(my_mutex);
K_SEM_DEFINE(my_sem, 0, 1);

// Memory management
void *ptr = k_malloc(64);
k_free(ptr);

// Timing services
k_sleep(K_MSEC(100));
k_timer_start(&timer, K_MSEC(1000), K_MSEC(1000));
```

**Core Services**:

- **Thread Management**: Creation, scheduling, and synchronization
- **Memory Management**: Allocation, deallocation, and protection
- **Interrupt Handling**: Fast interrupt service routines
- **Timer Services**: Hardware and software timers
- **Synchronization**: Mutexes, semaphores, and condition variables

### 3. **Hardware Abstraction Layer (HAL)**

Device drivers and hardware abstraction:

```c
// GPIO driver example
#include <zephyr/drivers/gpio.h>

static const struct device *gpio_dev = DEVICE_DT_GET(DT_ALIAS(led0));

// Configure GPIO pin
gpio_pin_configure(gpio_dev, LED_PIN, GPIO_OUTPUT_ACTIVE);

// Control GPIO pin
gpio_pin_set(gpio_dev, LED_PIN, 1);  // Set high
gpio_pin_set(gpio_dev, LED_PIN, 0);  // Set low
```

**HAL Components**:

- **Device Drivers**: Hardware-specific drivers
- **Pin Control**: GPIO and peripheral configuration
- **Clock Management**: System and peripheral clocks
- **Power Management**: Sleep modes and power optimization

### 4. **Hardware Layer**

Target microcontroller and peripherals:

```c
// Hardware-specific configuration
// stm32f4.dtsi
/ {
    soc {
        uart1: serial@40011000 {
            compatible = "st,stm32-uart";
            reg = <0x40011000 0x400>;
            interrupts = <37 0>;
            clocks = <&rcc STM32_CLOCK_BUS_APB2 0x00004000>;
            status = "disabled";
        };
    };
};
```

---

## 🔧 Zephyr's Modular Design

### 1. **Configuration System**

Zephyr uses Kconfig for feature selection:

```kconfig
# Kconfig file
config MULTITHREADING
    bool "Multithreading support"
    default y
    help
      Enable multithreading support in the kernel.

config SCHED_DEADLINE
    bool "Deadline scheduling"
    depends on MULTITHREADING
    default y
    help
      Enable deadline scheduling algorithm.

config MEMORY_PROTECTION
    bool "Memory protection"
    default n
    help
      Enable memory protection features.
```

**Why this matters**: Only include features you need, reducing memory footprint and complexity.

### 2. **Device Tree Integration**

Hardware configuration through device tree:

```dts
// board.dts
/ {
    chosen {
        zephyr,console = &uart0;
        zephyr,shell-uart = &uart0;
    };

    leds {
        compatible = "gpio-leds";
        led0: led_0 {
            gpios = <&gpioa 5 GPIO_ACTIVE_HIGH>;
            label = "User LD2";
        };
    };
};

&uart0 {
    status = "okay";
    current-speed = <115200>;
    pinctrl-0 = <&uart0_tx_pa2 &uart0_rx_pa3>;
    pinctrl-names = "default";
};
```

**Benefits**:

- **Hardware Abstraction**: Code is portable across different boards
- **Configuration Management**: Centralized hardware configuration
- **Validation**: Compile-time checking of hardware configuration

### 3. **Build System**

CMake-based build system:

```cmake
# CMakeLists.txt
cmake_minimum_required(VERSION 3.20.0)

find_package(Zephyr REQUIRED HINTS $ENV{ZEPHYR_BASE})
project(my_zephyr_app)

# Application sources
target_sources(app PRIVATE src/main.c)

# Include directories
target_include_directories(app PRIVATE include)

# Compiler definitions
target_compile_definitions(app PRIVATE MY_FEATURE=1)
```

**Advantages**:

- **Dependency Management**: Automatic handling of dependencies
- **Cross-Platform**: Works on Windows, Linux, and macOS
- **IDE Integration**: Better integration with modern IDEs

---

## 💡 Example: Multi-Threaded Application

Let's create a comprehensive example showing Zephyr's architecture:

```c
#include <zephyr.h>
#include <zephyr/kernel.h>
#include <zephyr/drivers/gpio.h>
#include <zephyr/drivers/uart.h>

// Device tree aliases
#define LED0_NODE DT_ALIAS(led0)
#define UART0_NODE DT_ALIAS(serial0)

// GPIO configuration
#define LED0_GPIO_LABEL DT_GPIO_LABEL(LED0_NODE, gpios)
#define LED0_GPIO_PIN DT_GPIO_PIN(LED0_NODE, gpios)
#define LED0_GPIO_FLAGS DT_GPIO_FLAGS(LED0_NODE, gpios)

// Thread stacks
K_THREAD_STACK_DEFINE(led_thread_stack, 1024);
K_THREAD_STACK_DEFINE(uart_thread_stack, 1024);

// Thread data
struct k_thread led_thread_data;
struct k_thread uart_thread_data;

// Synchronization
K_MUTEX_DEFINE(print_mutex);
K_SEM_DEFINE(data_ready, 0, 1);

// Global variables
static const struct device *gpio_dev;
static const struct device *uart_dev;
static volatile bool led_state = false;

// LED control function
void led_control(bool state)
{
    gpio_pin_set(gpio_dev, LED0_GPIO_PIN, state);
    led_state = state;
}

// LED thread function
void led_thread_function(void *arg1, void *arg2, void *arg3)
{
    while (1) {
        // Toggle LED
        led_control(!led_state);

        // Print status
        k_mutex_lock(&print_mutex, K_FOREVER);
        printk("LED state: %s\n", led_state ? "ON" : "OFF");
        k_mutex_unlock(&print_mutex);

        // Wait for 1 second
        k_sleep(K_MSEC(1000));
    }
}

// UART thread function
void uart_thread_function(void *arg1, void *arg2, void *arg3)
{
    char buffer[64];
    int len;

    while (1) {
        // Read from UART
        len = uart_fifo_read(uart_dev, buffer, sizeof(buffer) - 1);
        if (len > 0) {
            buffer[len] = '\0';

            // Print received data
            k_mutex_lock(&print_mutex, K_FOREVER);
            printk("UART received: %s", buffer);
            k_mutex_unlock(&print_mutex);

            // Signal data ready
            k_sem_give(&data_ready);
        }

        k_sleep(K_MSEC(100));
    }
}

// Main application
void main(void)
{
    int ret;

    printk("Zephyr Architecture Example\n");

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

    // Create LED thread
    k_thread_create(&led_thread_data, led_thread_stack,
                   K_THREAD_STACK_SIZEOF(led_thread_stack),
                   led_thread_function, NULL, NULL, NULL,
                   K_PRIO_COOP(7), 0, K_NO_WAIT);

    // Create UART thread
    k_thread_create(&uart_thread_data, uart_thread_stack,
                   K_THREAD_STACK_SIZEOF(uart_thread_stack),
                   uart_thread_function, NULL, NULL, NULL,
                   K_PRIO_COOP(6), 0, K_NO_WAIT);

    printk("Threads created successfully\n");

    // Main loop
    while (1) {
        // Wait for data ready signal
        k_sem_take(&data_ready, K_FOREVER);

        // Process received data
        k_mutex_lock(&print_mutex, K_FOREVER);
        printk("Processing data...\n");
        k_mutex_unlock(&print_mutex);

        k_sleep(K_MSEC(100));
    }
}
```

### Code Explanation:

1. **Layered Architecture**:

   - Application layer: Main function and thread functions
   - Kernel services: Threading, synchronization, timing
   - HAL: GPIO and UART drivers
   - Hardware: Device tree configuration

2. **Threading Model**:

   - LED thread: Handles LED blinking
   - UART thread: Handles serial communication
   - Main thread: Coordinates between threads

3. **Synchronization**:

   - Mutex: Protects shared printk calls
   - Semaphore: Signals data ready condition

4. **Hardware Abstraction**:
   - Device tree: Hardware configuration
   - Driver APIs: GPIO and UART control
   - Error handling: Proper error checking

---

## 🔗 Resources

- [Zephyr Kernel Documentation](https://docs.zephyrproject.org/latest/kernel/index.html) - Kernel architecture details
- [Zephyr Device Tree Guide](https://docs.zephyrproject.org/latest/develop/dts/index.html) - Device tree configuration
- [Zephyr Build System](https://docs.zephyrproject.org/latest/develop/build/index.html) - Build system documentation
- [Zephyr Configuration](https://docs.zephyrproject.org/latest/develop/build/kconfig/index.html) - Kconfig system

---

## 📝 Summary

Zephyr's architecture is designed for embedded systems with the following key characteristics:

### Architecture Benefits:

- **Modular Design**: Only include what you need
- **Layered Structure**: Clear separation of concerns
- **Hardware Abstraction**: Portable across different hardware
- **Real-Time Capabilities**: Deterministic behavior
- **Scalable**: From 8KB to several MB

### Key Components:

- **Application Layer**: Your application code
- **Kernel Services**: Threading, memory, interrupts
- **Hardware Abstraction**: Device drivers and HAL
- **Hardware Layer**: Target microcontroller

### Design Principles:

- **Microkernel**: Small, focused kernel
- **Modularity**: Configurable features
- **Portability**: Hardware abstraction
- **Real-Time**: Deterministic scheduling
- **Efficiency**: Optimized for embedded systems

In the next lesson, we'll explore embedded systems concepts and understand how they relate to Zephyr development.
