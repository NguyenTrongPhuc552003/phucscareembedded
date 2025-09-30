---
sidebar_position: 2
---

# Device Driver Development

This comprehensive guide covers Linux device driver development for embedded systems, focusing on the Rock 5B+ platform.

## Understanding Device Drivers

Device drivers are kernel modules that provide an interface between hardware devices and the operating system. They act as translators, converting generic OS requests into device-specific commands.

### Driver Types

- **Character Drivers**: Handle byte streams (keyboards, mice, serial ports)
- **Block Drivers**: Handle block-oriented devices (hard drives, SSDs)
- **Network Drivers**: Handle network interfaces (Ethernet, WiFi)
- **Platform Drivers**: Handle platform-specific devices (GPIO, I2C, SPI)

## Driver Architecture

```
┌──────────────────────────────────────┐
│ User Space                           │
│  ┌─────────────────────────────────┐ │
│  │ Application                     │ │
│  └─────────────────────────────────┘ │
├──────────────────────────────────────┤
│ System Calls                         │
├──────────────────────────────────────┤
│ Kernel Space                         │
│  ┌─────────────────────────────────┐ │
│  │ Device Driver                   │ │
│  │  ┌────────────────────────────┐ │ │
│  │  │   File Operations          │ │ │
│  │  │ (open, read, write)        │ │ │
│  │  └────────────────────────────┘ │ │
│  │  ┌────────────────────────────┐ │ │
│  │  │  Interrupt Handler         │ │ │
│  │  └────────────────────────────┘ │ │
│  └─────────────────────────────────┘ │
├──────────────────────────────────────┤
│ Hardware                             │
└──────────────────────────────────────┘
```

## Development Environment Setup

### 1. Install Development Tools

```bash
# Install kernel development tools
sudo apt install -y build-essential libncurses-dev libssl-dev
sudo apt install -y flex bison libelf-dev bc rsync
sudo apt install -y device-tree-compiler

# Install cross-compilation tools
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# Install kernel headers
sudo apt install -y linux-headers-$(uname -r)
```

### 2. Set Up Development Environment

```bash
# Create driver development directory
mkdir -p ~/driver-dev
cd ~/driver-dev

# Clone kernel source for reference
git clone https://github.com/radxa/kernel.git -b stable-5.10-rock5
cd kernel
```

## Writing Your First Character Driver

### 1. Basic Character Driver

```c
// simple_char_driver.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>

#define DEVICE_NAME "simple_char"
#define CLASS_NAME "simple_char_class"

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("A simple character driver");
MODULE_VERSION("0.1");

static int major_number;
static struct class* simple_char_class = NULL;
static struct device* simple_char_device = NULL;
static char message[256] = {0};
static short size_of_message;

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
    printk(KERN_INFO "Simple char device opened\n");
    return 0;
}

// Device release function
static int device_release(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "Simple char device closed\n");
    return 0;
}

// Device read function
static ssize_t device_read(struct file *filep, char *buffer, size_t len, loff_t *offset) {
    int error_count = 0;
    
    if (*offset >= size_of_message) {
        return 0;
    }
    
    error_count = copy_to_user(buffer, message + *offset, len);
    if (error_count == 0) {
        *offset += len;
        return len;
    } else {
        return -EFAULT;
    }
}

// Device write function
static ssize_t device_write(struct file *filep, const char *buffer, size_t len, loff_t *offset) {
    sprintf(message, "%s", buffer);
    size_of_message = strlen(message);
    printk(KERN_INFO "Received %zu characters from the user\n", len);
    return len;
}

// Module initialization
static int __init simple_char_init(void) {
    printk(KERN_INFO "Simple char driver initialized\n");
    
    // Register character device
    major_number = register_chrdev(0, DEVICE_NAME, &fops);
    if (major_number < 0) {
        printk(KERN_ALERT "Failed to register char device\n");
        return major_number;
    }
    
    printk(KERN_INFO "Registered with major number %d\n", major_number);
    
    // Create device class
    simple_char_class = class_create(THIS_MODULE, CLASS_NAME);
    if (IS_ERR(simple_char_class)) {
        unregister_chrdev(major_number, DEVICE_NAME);
        printk(KERN_ALERT "Failed to create device class\n");
        return PTR_ERR(simple_char_class);
    }
    
    // Create device
    simple_char_device = device_create(simple_char_class, NULL, MKDEV(major_number, 0), NULL, DEVICE_NAME);
    if (IS_ERR(simple_char_device)) {
        class_destroy(simple_char_class);
        unregister_chrdev(major_number, DEVICE_NAME);
        printk(KERN_ALERT "Failed to create device\n");
        return PTR_ERR(simple_char_device);
    }
    
    return 0;
}

// Module cleanup
static void __exit simple_char_exit(void) {
    device_destroy(simple_char_class, MKDEV(major_number, 0));
    class_destroy(simple_char_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    printk(KERN_INFO "Simple char driver removed\n");
}

module_init(simple_char_init);
module_exit(simple_char_exit);
```

### 2. Makefile for Driver

```makefile
# Makefile
obj-m += simple_char_driver.o

all:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) modules

clean:
	make -C /lib/modules/$(shell uname -r)/build M=$(PWD) clean
```

### 3. Build and Test Driver

```bash
# Build the driver
make

# Load the driver
sudo insmod simple_char_driver.ko

# Check if device was created
ls -l /dev/simple_char

# Test the driver
echo "Hello World" > /dev/simple_char
cat /dev/simple_char

# Unload the driver
sudo rmmod simple_char_driver
```

## GPIO Driver Development

### 1. GPIO Driver for Rock 5B+

```c
// gpio_driver.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/gpio.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>

#define DEVICE_NAME "rock5b_gpio"
#define CLASS_NAME "rock5b_gpio_class"
#define GPIO_PIN 18  // GPIO2_A2 on Rock 5B+

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("Rock 5B+ GPIO Driver");
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

// Device read function (read GPIO state)
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

// Device write function (set GPIO state)
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
static int __init gpio_driver_init(void) {
    printk(KERN_INFO "GPIO driver initialized\n");
    
    // Request GPIO
    if (gpio_request(gpio_pin, "rock5b_gpio") < 0) {
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
static void __exit gpio_driver_exit(void) {
    device_destroy(gpio_class, MKDEV(major_number, 0));
    class_destroy(gpio_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    gpio_free(gpio_pin);
    printk(KERN_INFO "GPIO driver removed\n");
}

module_init(gpio_driver_init);
module_exit(gpio_driver_exit);
```

### 2. Test GPIO Driver

```bash
# Build and load driver
make
sudo insmod gpio_driver.ko

# Test GPIO control
echo "1" > /dev/rock5b_gpio  # Set GPIO high
cat /dev/rock5b_gpio         # Read GPIO state
echo "0" > /dev/rock5b_gpio  # Set GPIO low

# Unload driver
sudo rmmod gpio_driver
```

## Interrupt-Driven Driver

### 1. Interrupt Handler Driver

```c
// interrupt_driver.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/gpio.h>
#include <linux/interrupt.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>
#include <linux/wait.h>
#include <linux/sched.h>

#define DEVICE_NAME "interrupt_driver"
#define CLASS_NAME "interrupt_class"
#define GPIO_PIN 18
#define IRQ_NUMBER 49  // GPIO interrupt number

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("Interrupt-driven GPIO driver");
MODULE_VERSION("0.1");

static int major_number;
static struct class* interrupt_class = NULL;
static struct device* interrupt_device = NULL;
static int irq_number;
static int irq_count = 0;
static int gpio_pin = GPIO_PIN;

// Wait queue for blocking read
static DECLARE_WAIT_QUEUE_HEAD(wq);
static int data_ready = 0;

// Function prototypes
static int device_open(struct inode*, struct file*);
static int device_release(struct inode*, struct file*);
static ssize_t device_read(struct file*, char*, size_t, loff_t*);
static irqreturn_t gpio_irq_handler(int, void*);

// File operations structure
static struct file_operations fops = {
    .open = device_open,
    .read = device_read,
    .release = device_release,
};

// Interrupt handler
static irqreturn_t gpio_irq_handler(int irq, void *dev_id) {
    irq_count++;
    data_ready = 1;
    wake_up_interruptible(&wq);
    printk(KERN_INFO "GPIO interrupt occurred! Count: %d\n", irq_count);
    return IRQ_HANDLED;
}

// Device open function
static int device_open(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "Interrupt device opened\n");
    return 0;
}

// Device release function
static int device_release(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "Interrupt device closed\n");
    return 0;
}

// Device read function (blocking read)
static ssize_t device_read(struct file *filep, char *buffer, size_t len, loff_t *offset) {
    char message[20];
    int error_count;
    
    // Wait for interrupt
    if (wait_event_interruptible(wq, data_ready)) {
        return -ERESTARTSYS;
    }
    
    sprintf(message, "Interrupt count: %d\n", irq_count);
    data_ready = 0;
    
    error_count = copy_to_user(buffer, message, strlen(message));
    if (error_count == 0) {
        return strlen(message);
    } else {
        return -EFAULT;
    }
}

// Module initialization
static int __init interrupt_driver_init(void) {
    printk(KERN_INFO "Interrupt driver initialized\n");
    
    // Request GPIO
    if (gpio_request(gpio_pin, "interrupt_gpio") < 0) {
        printk(KERN_ERR "Failed to request GPIO %d\n", gpio_pin);
        return -1;
    }
    
    // Set GPIO as input
    gpio_direction_input(gpio_pin);
    
    // Get IRQ number
    irq_number = gpio_to_irq(gpio_pin);
    if (irq_number < 0) {
        gpio_free(gpio_pin);
        printk(KERN_ERR "Failed to get IRQ number\n");
        return -1;
    }
    
    // Request interrupt
    if (request_irq(irq_number, gpio_irq_handler, IRQF_TRIGGER_RISING, "gpio_interrupt", NULL)) {
        gpio_free(gpio_pin);
        printk(KERN_ERR "Failed to request IRQ %d\n", irq_number);
        return -1;
    }
    
    // Register character device
    major_number = register_chrdev(0, DEVICE_NAME, &fops);
    if (major_number < 0) {
        free_irq(irq_number, NULL);
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to register char device\n");
        return major_number;
    }
    
    // Create device class
    interrupt_class = class_create(THIS_MODULE, CLASS_NAME);
    if (IS_ERR(interrupt_class)) {
        unregister_chrdev(major_number, DEVICE_NAME);
        free_irq(irq_number, NULL);
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to create device class\n");
        return PTR_ERR(interrupt_class);
    }
    
    // Create device
    interrupt_device = device_create(interrupt_class, NULL, MKDEV(major_number, 0), NULL, DEVICE_NAME);
    if (IS_ERR(interrupt_device)) {
        class_destroy(interrupt_class);
        unregister_chrdev(major_number, DEVICE_NAME);
        free_irq(irq_number, NULL);
        gpio_free(gpio_pin);
        printk(KERN_ALERT "Failed to create device\n");
        return PTR_ERR(interrupt_device);
    }
    
    return 0;
}

// Module cleanup
static void __exit interrupt_driver_exit(void) {
    device_destroy(interrupt_class, MKDEV(major_number, 0));
    class_destroy(interrupt_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    free_irq(irq_number, NULL);
    gpio_free(gpio_pin);
    printk(KERN_INFO "Interrupt driver removed\n");
}

module_init(interrupt_driver_init);
module_exit(interrupt_driver_exit);
```

## I2C Driver Development

### 1. I2C Client Driver

```c
// i2c_driver.c
#include <linux/init.h>
#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/i2c.h>
#include <linux/fs.h>
#include <linux/uaccess.h>
#include <linux/device.h>
#include <linux/cdev.h>

#define DEVICE_NAME "i2c_sensor"
#define CLASS_NAME "i2c_sensor_class"
#define I2C_ADAPTER 0
#define I2C_ADDRESS 0x48

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Phuc Nguyen");
MODULE_DESCRIPTION("I2C sensor driver");
MODULE_VERSION("0.1");

static int major_number;
static struct class* i2c_class = NULL;
static struct device* i2c_device = NULL;
static struct i2c_client *client = NULL;

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
    printk(KERN_INFO "I2C device opened\n");
    return 0;
}

// Device release function
static int device_release(struct inode *inodep, struct file *filep) {
    printk(KERN_INFO "I2C device closed\n");
    return 0;
}

// Device read function
static ssize_t device_read(struct file *filep, char *buffer, size_t len, loff_t *offset) {
    char data[2];
    char message[20];
    int error_count;
    
    // Read from I2C device
    if (i2c_master_recv(client, data, 2) < 0) {
        printk(KERN_ERR "Failed to read from I2C device\n");
        return -EIO;
    }
    
    sprintf(message, "0x%02x%02x\n", data[0], data[1]);
    
    error_count = copy_to_user(buffer, message, strlen(message));
    if (error_count == 0) {
        return strlen(message);
    } else {
        return -EFAULT;
    }
}

// Device write function
static ssize_t device_write(struct file *filep, const char *buffer, size_t len, loff_t *offset) {
    char data[2];
    
    if (copy_from_user(data, buffer, len) != 0) {
        return -EFAULT;
    }
    
    // Write to I2C device
    if (i2c_master_send(client, data, len) < 0) {
        printk(KERN_ERR "Failed to write to I2C device\n");
        return -EIO;
    }
    
    printk(KERN_INFO "Wrote %zu bytes to I2C device\n", len);
    return len;
}

// I2C probe function
static int i2c_probe(struct i2c_client *client, const struct i2c_device_id *id) {
    printk(KERN_INFO "I2C device probed\n");
    return 0;
}

// I2C remove function
static int i2c_remove(struct i2c_client *client) {
    printk(KERN_INFO "I2C device removed\n");
    return 0;
}

// I2C device ID table
static const struct i2c_device_id i2c_id[] = {
    { "i2c_sensor", 0 },
    { }
};
MODULE_DEVICE_TABLE(i2c, i2c_id);

// I2C driver structure
static struct i2c_driver i2c_driver = {
    .driver = {
        .name = "i2c_sensor",
    },
    .probe = i2c_probe,
    .remove = i2c_remove,
    .id_table = i2c_id,
};

// Module initialization
static int __init i2c_driver_init(void) {
    struct i2c_adapter *adapter;
    struct i2c_board_info board_info;
    
    printk(KERN_INFO "I2C driver initialized\n");
    
    // Get I2C adapter
    adapter = i2c_get_adapter(I2C_ADAPTER);
    if (!adapter) {
        printk(KERN_ERR "Failed to get I2C adapter\n");
        return -ENODEV;
    }
    
    // Create I2C client
    memset(&board_info, 0, sizeof(board_info));
    strcpy(board_info.type, "i2c_sensor");
    board_info.addr = I2C_ADDRESS;
    
    client = i2c_new_client_device(adapter, &board_info);
    if (!client) {
        i2c_put_adapter(adapter);
        printk(KERN_ERR "Failed to create I2C client\n");
        return -ENODEV;
    }
    
    // Register character device
    major_number = register_chrdev(0, DEVICE_NAME, &fops);
    if (major_number < 0) {
        i2c_unregister_device(client);
        i2c_put_adapter(adapter);
        printk(KERN_ALERT "Failed to register char device\n");
        return major_number;
    }
    
    // Create device class
    i2c_class = class_create(THIS_MODULE, CLASS_NAME);
    if (IS_ERR(i2c_class)) {
        unregister_chrdev(major_number, DEVICE_NAME);
        i2c_unregister_device(client);
        i2c_put_adapter(adapter);
        printk(KERN_ALERT "Failed to create device class\n");
        return PTR_ERR(i2c_class);
    }
    
    // Create device
    i2c_device = device_create(i2c_class, NULL, MKDEV(major_number, 0), NULL, DEVICE_NAME);
    if (IS_ERR(i2c_device)) {
        class_destroy(i2c_class);
        unregister_chrdev(major_number, DEVICE_NAME);
        i2c_unregister_device(client);
        i2c_put_adapter(adapter);
        printk(KERN_ALERT "Failed to create device\n");
        return PTR_ERR(i2c_device);
    }
    
    // Register I2C driver
    if (i2c_add_driver(&i2c_driver)) {
        device_destroy(i2c_class, MKDEV(major_number, 0));
        class_destroy(i2c_class);
        unregister_chrdev(major_number, DEVICE_NAME);
        i2c_unregister_device(client);
        i2c_put_adapter(adapter);
        printk(KERN_ERR "Failed to add I2C driver\n");
        return -1;
    }
    
    return 0;
}

// Module cleanup
static void __exit i2c_driver_exit(void) {
    device_destroy(i2c_class, MKDEV(major_number, 0));
    class_destroy(i2c_class);
    unregister_chrdev(major_number, DEVICE_NAME);
    i2c_del_driver(&i2c_driver);
    if (client) {
        i2c_unregister_device(client);
    }
    printk(KERN_INFO "I2C driver removed\n");
}

module_init(i2c_driver_init);
module_exit(i2c_driver_exit);
```

## Debugging Device Drivers

### 1. Using printk for Debugging

```c
// Debug levels
printk(KERN_EMERG "Emergency message\n");
printk(KERN_ALERT "Alert message\n");
printk(KERN_CRIT "Critical message\n");
printk(KERN_ERR "Error message\n");
printk(KERN_WARNING "Warning message\n");
printk(KERN_NOTICE "Notice message\n");
printk(KERN_INFO "Info message\n");
printk(KERN_DEBUG "Debug message\n");
```

### 2. Using GDB for Kernel Debugging

```bash
# Install debugging tools
sudo apt install -y gdb-multiarch

# Start kernel with debugging
qemu-system-aarch64 -M virt -cpu cortex-a57 \
    -kernel arch/arm64/boot/Image \
    -append "console=ttyAMA0" \
    -nographic -s -S

# Connect GDB
gdb-multiarch vmlinux
(gdb) target remote :1234
(gdb) b your_function
(gdb) c
```

### 3. Using ftrace for Performance Analysis

```bash
# Enable ftrace
echo 1 > /sys/kernel/debug/tracing/tracing_on

# Set trace function
echo function > /sys/kernel/debug/tracing/current_tracer
echo your_function > /sys/kernel/debug/tracing/set_ftrace_filter

# View trace
cat /sys/kernel/debug/tracing/trace
```

## Best Practices

### 1. Error Handling

```c
// Always check return values
if (register_chrdev(major_number, DEVICE_NAME, &fops) < 0) {
    printk(KERN_ALERT "Failed to register char device\n");
    return -1;
}

// Clean up on error
if (error_condition) {
    unregister_chrdev(major_number, DEVICE_NAME);
    return -1;
}
```

### 2. Memory Management

```c
// Use appropriate memory allocation
void *ptr = kmalloc(size, GFP_KERNEL);
if (!ptr) {
    return -ENOMEM;
}

// Free memory
kfree(ptr);
```

### 3. Concurrency Control

```c
#include <linux/spinlock.h>

static DEFINE_SPINLOCK(my_lock);

// Critical section
spin_lock(&my_lock);
// Critical code here
spin_unlock(&my_lock);
```

## Testing Device Drivers

### 1. Unit Testing

```c
// Test function
static int test_driver_function(void) {
    int result;
    
    // Test case 1
    result = driver_function(valid_input);
    if (result != expected_output) {
        printk(KERN_ERR "Test case 1 failed\n");
        return -1;
    }
    
    // Test case 2
    result = driver_function(invalid_input);
    if (result != -EINVAL) {
        printk(KERN_ERR "Test case 2 failed\n");
        return -1;
    }
    
    printk(KERN_INFO "All tests passed\n");
    return 0;
}
```

### 2. Integration Testing

```bash
# Test driver with hardware
sudo insmod your_driver.ko
echo "test" > /dev/your_device
cat /dev/your_device
sudo rmmod your_driver
```

## Next Steps

- [Bootloader Development](./bootloader.md)
- [File System Development](./filesystem.md)
- [Kernel Development](./kernel-development.md)

## Resources

- [Linux Device Drivers](https://lwn.net/Kernel/LDD3/)
- [Linux Kernel Documentation](https://www.kernel.org/doc/)
- [Rock 5B+ GPIO Documentation](https://wiki.radxa.com/Rock5/hardware/gpio)
- [I2C Driver Documentation](https://www.kernel.org/doc/html/latest/i2c/writing-clients.html)
