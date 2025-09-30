---
slug: building-first-kernel-module
title: Building Your First Linux Kernel Module
authors: [phuc]
tags: [embedded-linux, kernel-development, tutorial]
---

Learn how to create, build, and test your first Linux kernel module for embedded systems.

<!-- truncate -->

## Introduction

Linux kernel modules are pieces of code that can be loaded and unloaded into the kernel at runtime. They extend the kernel's functionality without requiring a reboot. In this tutorial, we'll create a simple "Hello World" kernel module and learn the fundamentals of kernel module development.

## Prerequisites

Before we begin, make sure you have:

- Rock 5B+ development board
- Ubuntu 22.04 installed
- Kernel development tools installed
- Basic understanding of C programming

## Setting Up the Development Environment

First, let's install the necessary development tools:

```bash
# Install kernel development tools
sudo apt update
sudo apt install -y build-essential libncurses-dev libssl-dev
sudo apt install -y flex bison libelf-dev bc rsync
sudo apt install -y linux-headers-$(uname -r)
```

## Creating Your First Kernel Module

Let's create a simple "Hello World" kernel module:

```c
// hello_kernel.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("A simple hello world kernel module");
MODULE_VERSION("0.1");

static int __init hello_init(void)
{
    printk(KERN_INFO "Hello, Kernel World!\n");
    return 0;
}

static void __exit hello_exit(void)
{
    printk(KERN_INFO "Goodbye, Kernel World!\n");
}

module_init(hello_init);
module_exit(hello_exit);
```

## Creating the Makefile

Create a Makefile to build the kernel module:

```makefile
# Makefile
obj-m += hello_kernel.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean
```

## Building the Module

Now let's build the kernel module:

```bash
# Build the module
make

# Check if the module was built successfully
ls -la *.ko
```

## Loading and Testing the Module

Let's load the module and see it in action:

```bash
# Load the module
sudo insmod hello_kernel.ko

# Check if the module is loaded
lsmod | grep hello_kernel

# View kernel messages
dmesg | tail

# Unload the module
sudo rmmod hello_kernel

# Check kernel messages again
dmesg | tail
```

## Understanding the Code

Let's break down the key components of our kernel module:

### Module Information
```c
MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("A simple hello world kernel module");
MODULE_VERSION("0.1");
```

These macros provide metadata about the module.

### Initialization Function
```c
static int __init hello_init(void)
{
    printk(KERN_INFO "Hello, Kernel World!\n");
    return 0;
}
```

The `__init` macro indicates this function is called during module initialization.

### Cleanup Function
```c
static void __exit hello_exit(void)
{
    printk(KERN_INFO "Goodbye, Kernel World!\n");
}
```

The `__exit` macro indicates this function is called during module cleanup.

### Module Registration
```c
module_init(hello_init);
module_exit(hello_exit);
```

These macros register the initialization and cleanup functions.

## Advanced Example: GPIO Module

Let's create a more practical example - a GPIO control module:

```c
// gpio_module.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/gpio.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>

#define DEVICE_NAME "gpio_module"
#define CLASS_NAME "gpio_class"
#define GPIO_PIN 18

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("GPIO control kernel module");
MODULE_VERSION("0.1");

static int major_number;
static struct class* gpio_class = NULL;
static struct device* gpio_device = NULL;
static int gpio_pin = GPIO_PIN;

// Function prototypes
static int device_open(struct inode*, struct file*);
static int device_release(struct inode*, struct file*);
static ssize_t device_read(struct file*, char*, size_t, loff_t*);
static ssize_t device_write(struct file*, const char*, size_t, loff_t*);

// File operations structure
static struct file_operations fops = {
    .open = device_open,
    .read = device_read,
    .write = device_write,
    .release = device_release,
};

// Device open function
static int device_open(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "GPIO device opened\n");
    return 0;
}

// Device release function
static int device_release(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "GPIO device closed\n");
    return 0;
}

// Device read function
static ssize_t device_read(struct file *filep, char *buffer, size_t len, loff_t *offset) {
    int gpio_value;
    char message[10];
    
    gpio_value = gpio_get_value(gpio_pin);
    sprintf(message, "%d\n", gpio_value);
    
    if (copy_to_user(buffer, message, strlen(message)) != 0) {
        return -EFAULT;
    }
    
    return strlen(message);
}

// Device write function
static ssize_t device_write(struct file *filep, const char *buffer, size_t len, loff_t *offset) {
    char message[10];
    int value;
    
    if (copy_from_user(message, buffer, len) != 0) {
        return -EFAULT;
    }
    
    message[len] = '\0';
    value = simple_strtol(message, NULL, 10);
    
    if (value == 0 || value == 1) {
        gpio_set_value(gpio_pin, value);
        printk(KERN_INFO "GPIO %d set to %d\n", gpio_pin, value);
    } else {
        printk(KERN_ERR "Invalid GPIO value: %d\n", value);
        return -EINVAL;
    }
    
    return len;
}

// Module initialization
static int __init gpio_module_init(void) {
    printk(KERN_INFO "GPIO module initialized\n");
    
    // Request GPIO
    if (gpio_request(gpio_pin, "gpio_module") < 0) {
        printk(KERN_ERR "Failed to request GPIO %d\n", gpio_pin);
        return -1;
    }
    
    // Set GPIO as output
    gpio_direction_output(gpio_pin, 0);
    
    // Register character device
    major_number = register_chrdev(0, DEVICE_NAME, &fops);
    if (major_number < 0) {
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to register char device\n");
        return major_number;
    }
    
    // Create device class
    gpio_class = class_create(THIS_MODULE, CLASS_NAME);
    if (IS_ERR(gpio_class)) {
        unregister_chrdev(major_number, DEVICE_NAME);
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to create device class\n");
        return PTR_ERR(gpio_class);
    }
    
    // Create device
    gpio_device = device_create(gpio_class, NULL, MKDEV(major_number, 0), NULL, DEVICE_NAME);
    if (IS_ERR(gpio_device)) {
        class_destroy(gpio_class);
        unregister_chrdev(major_number, DEVICE_NAME);
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to create device\n");
        return PTR_ERR(gpio_device);
    }
    
    return 0;
}

// Module cleanup
static void __exit gpio_module_exit(void) {
    device_destroy(gpio_class, MKDEV(major_number, 0));
    class_destroy(gpio_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    gpio_free(gpio_pin);
    printk(KERN_INFO "GPIO module removed\n");
}

module_init(gpio_module_init);
module_exit(gpio_module_exit);
```

## Testing the GPIO Module

```bash
# Build and load the module
make
sudo insmod gpio_module.ko

# Test GPIO control
echo "1" > /dev/gpio_module  # Set GPIO high
cat /dev/gpio_module         # Read GPIO state
echo "0" > /dev/gpio_module  # Set GPIO low

# Unload the module
sudo rmmod gpio_module
```

## Best Practices

### 1. Error Handling
Always check return values and handle errors gracefully:

```c
if (gpio_request(gpio_pin, "gpio_module") < 0) {
    printk(KERN_ERR "Failed to request GPIO %d\n", gpio_pin);
    return -1;
}
```

### 2. Resource Management
Always free resources in the cleanup function:

```c
static void __exit gpio_module_exit(void) {
    // Free all allocated resources
    device_destroy(gpio_class, MKDEV(major_number, 0));
    class_destroy(gpio_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    gpio_free(gpio_pin);
}
```

### 3. Documentation
Document your code thoroughly:

```c
/**
 * @brief Set GPIO pin value
 * @param pin GPIO pin number
 * @param value 0 or 1
 * @return 0 on success, negative on error
 */
static int set_gpio_value(int pin, int value) {
    // Implementation
}
```

## Common Pitfalls

### 1. Forgetting to Free Resources
Always free resources in the cleanup function to prevent memory leaks.

### 2. Not Checking Return Values
Always check return values from kernel functions.

### 3. Using User Space Functions
Don't use user space functions like `printf()` in kernel space. Use `printk()` instead.

## Next Steps

Now that you've created your first kernel module, you can:

1. Explore more advanced kernel programming concepts
2. Learn about interrupt handling
3. Study device driver development
4. Experiment with different hardware interfaces

## Resources

- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [Linux Device Drivers](https://lwn.net/Kernel/LDD3/)
- [Kernel Newbies](https://kernelnewbies.org/)
- [Rock 5B+ Kernel Development](https://wiki.radxa.com/Rock5/software/kernel)

## Conclusion

Congratulations! You've successfully created your first Linux kernel module. This is just the beginning of your journey into kernel development. Keep experimenting, learning, and building amazing embedded systems!

Happy coding! 🚀
