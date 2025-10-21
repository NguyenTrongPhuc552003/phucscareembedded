---
sidebar_position: 3
---

# Module Parameters

Master module parameter handling and configuration in loadable kernel modules, understanding how to create configurable modules for Rock 5B+ ARM64 systems.

## What are Module Parameters?

**What**: Module parameters are variables that can be set when a module is loaded, allowing modules to be configured without recompilation.

**Why**: Understanding module parameters is crucial because:

- **Runtime configuration** - Configure modules without recompilation
- **Flexibility** - Adapt modules to different environments
- **Testing** - Test modules with different configurations
- **Production deployment** - Configure modules for production use
- **User control** - Allow users to configure module behavior

**When**: Module parameters are used when:

- **Module loading** - When loading modules with specific configurations
- **Testing** - During module testing and validation
- **Production** - In production system deployment
- **Development** - During module development
- **Debugging** - When debugging module behavior

**How**: Module parameters work through:

```c
// Example: Module parameter definitions
#include <linux/moduleparam.h>

// Parameter declarations
static int my_int_param = 42;
static char *my_string_param = "default";
static bool my_bool_param = true;
static int my_array_param[10];
static int my_array_count = 0;

// Parameter definitions
module_param(my_int_param, int, S_IRUGO | S_IWUSR);
module_param(my_string_param, charp, S_IRUGO | S_IWUSR);
module_param(my_bool_param, bool, S_IRUGO | S_IWUSR);
module_param_array(my_array_param, int, &my_array_count, S_IRUGO | S_IWUSR);

// Parameter descriptions
MODULE_PARM_DESC(my_int_param, "An integer parameter");
MODULE_PARM_DESC(my_string_param, "A string parameter");
MODULE_PARM_DESC(my_bool_param, "A boolean parameter");
MODULE_PARM_DESC(my_array_param, "An array parameter");
```

**Where**: Module parameters are essential in:

- **All kernel modules** - Desktop, server, and embedded
- **Driver development** - Device driver configuration
- **System modules** - System-level module configuration
- **Embedded systems** - IoT and industrial devices
- **Rock 5B+** - ARM64 embedded development

## Parameter Types

**What**: Module parameters support various data types for different configuration needs.

**Why**: Understanding parameter types is important because:

- **Type safety** - Ensure proper parameter types
- **Validation** - Validate parameter values
- **User interface** - Provide appropriate user interfaces
- **Documentation** - Document parameter types
- **Error handling** - Handle parameter errors

**How**: Parameter types work through:

```c
// Example: Different parameter types
// Integer parameters
static int int_param = 100;
static unsigned int uint_param = 200;
static long long_param = 300;
static unsigned long ulong_param = 400;

// String parameters
static char *string_param = "default_string";
static char char_param = 'A';

// Boolean parameters
static bool bool_param = false;
static int bool_as_int = 0;

// Array parameters
static int int_array[20];
static int int_array_count = 0;
static char *string_array[10];
static int string_array_count = 0;

// Parameter definitions with permissions
module_param(int_param, int, S_IRUGO | S_IWUSR);
module_param(uint_param, uint, S_IRUGO | S_IWUSR);
module_param(long_param, long, S_IRUGO | S_IWUSR);
module_param(ulong_param, ulong, S_IRUGO | S_IWUSR);
module_param(string_param, charp, S_IRUGO | S_IWUSR);
module_param(char_param, byte, S_IRUGO | S_IWUSR);
module_param(bool_param, bool, S_IRUGO | S_IWUSR);
module_param(bool_as_int, bool, S_IRUGO | S_IWUSR);
module_param_array(int_array, int, &int_array_count, S_IRUGO | S_IWUSR);
module_param_array(string_array, charp, &string_array_count, S_IRUGO | S_IWUSR);

// Parameter descriptions
MODULE_PARM_DESC(int_param, "Integer parameter (0-1000)");
MODULE_PARM_DESC(uint_param, "Unsigned integer parameter");
MODULE_PARM_DESC(long_param, "Long integer parameter");
MODULE_PARM_DESC(ulong_param, "Unsigned long parameter");
MODULE_PARM_DESC(string_param, "String parameter");
MODULE_PARM_DESC(char_param, "Character parameter");
MODULE_PARM_DESC(bool_param, "Boolean parameter");
MODULE_PARM_DESC(bool_as_int, "Boolean parameter as integer");
MODULE_PARM_DESC(int_array, "Integer array parameter");
MODULE_PARM_DESC(string_array, "String array parameter");
```

**Explanation**:

- **Integer types** - int, uint, long, ulong for numeric parameters
- **String types** - charp for string parameters
- **Boolean types** - bool for boolean parameters
- **Array types** - Arrays of various types
- **Permissions** - Read/write permissions for parameters

**Where**: Parameter types are used in:

- **All kernel modules** - Every module can use parameters
- **Driver development** - Device driver configuration
- **System modules** - System-level configuration
- **Embedded modules** - Embedded system configuration
- **Rock 5B+** - ARM64 embedded modules

## Parameter Permissions

**What**: Parameter permissions control who can read and write module parameters.

**Why**: Understanding parameter permissions is important because:

- **Security** - Control access to sensitive parameters
- **User interface** - Provide appropriate user interfaces
- **System administration** - Enable system administration
- **Debugging** - Allow debugging access
- **Documentation** - Document parameter access

**How**: Parameter permissions work through:

```c
// Example: Parameter permissions
// Read-only parameters (S_IRUGO)
static int read_only_param = 42;
module_param(read_only_param, int, S_IRUGO);
MODULE_PARM_DESC(read_only_param, "Read-only parameter");

// Read-write parameters (S_IRUGO | S_IWUSR)
static int read_write_param = 100;
module_param(read_write_param, int, S_IRUGO | S_IWUSR);
MODULE_PARM_DESC(read_write_param, "Read-write parameter");

// Write-only parameters (S_IWUSR)
static int write_only_param = 200;
module_param(write_only_param, int, S_IWUSR);
MODULE_PARM_DESC(write_only_param, "Write-only parameter");

// Group permissions
static int group_read_param = 300;
module_param(group_read_param, int, S_IRUGO | S_IRGRP);
MODULE_PARM_DESC(group_read_param, "Group readable parameter");

// Owner permissions
static int owner_param = 400;
module_param(owner_param, int, S_IRUGO | S_IWUSR | S_IRGRP | S_IWGRP);
MODULE_PARM_DESC(owner_param, "Owner and group parameter");
```

**Explanation**:

- **S_IRUGO** - Read permission for user, group, and others
- **S_IWUSR** - Write permission for user
- **S_IRGRP** - Read permission for group
- **S_IWGRP** - Write permission for group
- **Combined permissions** - Multiple permission flags

**Where**: Parameter permissions are used in:

- **All kernel modules** - Every module should set appropriate permissions
- **Driver development** - Device driver parameter access
- **System modules** - System-level parameter access
- **Security modules** - Security-sensitive parameters
- **Rock 5B+** - ARM64 embedded modules

## Parameter Validation

**What**: Parameter validation ensures that parameter values are within acceptable ranges and formats.

**Why**: Understanding parameter validation is important because:

- **Data integrity** - Ensure parameter values are valid
- **Error prevention** - Prevent invalid parameter values
- **User feedback** - Provide feedback on invalid parameters
- **System stability** - Maintain system stability
- **Debugging** - Help debug parameter issues

**How**: Parameter validation works through:

```c
// Example: Parameter validation
static int validate_int_param(int value)
{
    if (value < 0 || value > 1000) {
        printk(KERN_ERR "Invalid int_param: %d (must be 0-1000)\n", value);
        return -EINVAL;
    }
    return 0;
}

static int validate_string_param(const char *value)
{
    if (!value || strlen(value) == 0) {
        printk(KERN_ERR "Invalid string_param: empty string\n");
        return -EINVAL;
    }
    if (strlen(value) > 100) {
        printk(KERN_ERR "Invalid string_param: too long\n");
        return -EINVAL;
    }
    return 0;
}

// Parameter setter functions
static int set_int_param(const char *val, const struct kernel_param *kp)
{
    int ret;
    int new_value;

    ret = kstrtoint(val, 0, &new_value);
    if (ret)
        return ret;

    ret = validate_int_param(new_value);
    if (ret)
        return ret;

    *(int *)kp->arg = new_value;
    printk(KERN_INFO "int_param set to %d\n", new_value);
    return 0;
}

static int set_string_param(const char *val, const struct kernel_param *kp)
{
    int ret;

    ret = validate_string_param(val);
    if (ret)
        return ret;

    kfree(*(char **)kp->arg);
    *(char **)kp->arg = kstrdup(val, GFP_KERNEL);
    if (!*(char **)kp->arg)
        return -ENOMEM;

    printk(KERN_INFO "string_param set to %s\n", *(char **)kp->arg);
    return 0;
}

// Parameter getter functions
static int get_int_param(char *buffer, const struct kernel_param *kp)
{
    return sprintf(buffer, "%d\n", *(int *)kp->arg);
}

static int get_string_param(char *buffer, const struct kernel_param *kp)
{
    return sprintf(buffer, "%s\n", *(char **)kp->arg);
}

// Parameter operations
static const struct kernel_param_ops int_param_ops = {
    .set = set_int_param,
    .get = get_int_param,
};

static const struct kernel_param_ops string_param_ops = {
    .set = set_string_param,
    .get = get_string_param,
};

// Parameter definitions with custom operations
static int my_int_param = 42;
static char *my_string_param = "default";

module_param_cb(my_int_param, &int_param_ops, &my_int_param, S_IRUGO | S_IWUSR);
module_param_cb(my_string_param, &string_param_ops, &my_string_param, S_IRUGO | S_IWUSR);

MODULE_PARM_DESC(my_int_param, "Validated integer parameter (0-1000)");
MODULE_PARM_DESC(my_string_param, "Validated string parameter");
```

**Explanation**:

- **Validation functions** - Check parameter values
- **Setter functions** - Set parameter values with validation
- **Getter functions** - Get parameter values
- **Parameter operations** - Custom parameter operations
- **Error handling** - Handle validation errors

**Where**: Parameter validation is used in:

- **All kernel modules** - Every module should validate parameters
- **Driver development** - Device driver parameter validation
- **System modules** - System-level parameter validation
- **Security modules** - Security-sensitive parameter validation
- **Rock 5B+** - ARM64 embedded modules

## Parameter Arrays

**What**: Parameter arrays allow modules to accept multiple values of the same type.

**Why**: Understanding parameter arrays is important because:

- **Multiple values** - Accept multiple parameter values
- **Configuration flexibility** - Provide flexible configuration
- **Data organization** - Organize related parameters
- **User interface** - Provide array-based interfaces
- **System configuration** - Configure multiple system components

**How**: Parameter arrays work through:

```c
// Example: Parameter arrays
static int int_array[20];
static int int_array_count = 0;
static char *string_array[10];
static int string_array_count = 0;
static bool bool_array[5];
static int bool_array_count = 0;

// Array parameter definitions
module_param_array(int_array, int, &int_array_count, S_IRUGO | S_IWUSR);
module_param_array(string_array, charp, &string_array_count, S_IRUGO | S_IWUSR);
module_param_array(bool_array, bool, &bool_array_count, S_IRUGO | S_IWUSR);

// Array parameter descriptions
MODULE_PARM_DESC(int_array, "Integer array parameter");
MODULE_PARM_DESC(string_array, "String array parameter");
MODULE_PARM_DESC(bool_array, "Boolean array parameter");

// Array validation
static int validate_int_array(void)
{
    int i;
    
    for (i = 0; i < int_array_count; i++) {
        if (int_array[i] < 0 || int_array[i] > 1000) {
            printk(KERN_ERR "Invalid int_array[%d]: %d\n", i, int_array[i]);
            return -EINVAL;
        }
    }
    return 0;
}

// Array processing
static void process_int_array(void)
{
    int i;
    
    printk(KERN_INFO "Processing int_array with %d elements:\n", int_array_count);
    for (i = 0; i < int_array_count; i++) {
        printk(KERN_INFO "  int_array[%d] = %d\n", i, int_array[i]);
    }
}
```

**Explanation**:

- **Array declarations** - Declare array parameters
- **Count variables** - Track array element count
- **Array definitions** - Define array parameters
- **Array validation** - Validate array elements
- **Array processing** - Process array elements

**Where**: Parameter arrays are used in:

- **All kernel modules** - Every module can use array parameters
- **Driver development** - Device driver array configuration
- **System modules** - System-level array configuration
- **Network modules** - Network configuration arrays
- **Rock 5B+** - ARM64 embedded modules

## Parameter Documentation

**What**: Parameter documentation provides information about module parameters for users and developers.

**Why**: Understanding parameter documentation is important because:

- **User guidance** - Help users understand parameters
- **Developer reference** - Provide developer reference
- **System administration** - Enable system administration
- **Debugging** - Help debug parameter issues
- **Maintenance** - Facilitate module maintenance

**How**: Parameter documentation works through:

```c
// Example: Parameter documentation
// Basic parameter descriptions
MODULE_PARM_DESC(int_param, "Integer parameter (0-1000)");
MODULE_PARM_DESC(string_param, "String parameter (max 100 chars)");
MODULE_PARM_DESC(bool_param, "Boolean parameter (true/false)");

// Detailed parameter descriptions
MODULE_PARM_DESC(debug_level, 
    "Debug level (0-7):\n"
    "  0 = No debug output\n"
    "  1 = Error messages only\n"
    "  2 = Warning messages\n"
    "  3 = Info messages\n"
    "  4 = Debug messages\n"
    "  5 = Verbose debug\n"
    "  6 = Trace messages\n"
    "  7 = All messages");

MODULE_PARM_DESC(timeout_ms,
    "Timeout in milliseconds (100-10000):\n"
    "  Minimum: 100ms\n"
    "  Maximum: 10000ms\n"
    "  Default: 1000ms");

// Array parameter descriptions
MODULE_PARM_DESC(int_array,
    "Integer array parameter:\n"
    "  Format: int_array=val1,val2,val3\n"
    "  Values: 0-1000\n"
    "  Max elements: 20");

// Complex parameter descriptions
MODULE_PARM_DESC(config_file,
    "Configuration file path:\n"
    "  Format: /path/to/config\n"
    "  Must exist and be readable\n"
    "  Default: /etc/my_module.conf");
```

**Explanation**:

- **Basic descriptions** - Simple parameter descriptions
- **Detailed descriptions** - Comprehensive parameter information
- **Format specifications** - Parameter format information
- **Range specifications** - Parameter value ranges
- **Usage examples** - Parameter usage examples

**Where**: Parameter documentation is used in:

- **All kernel modules** - Every module should document parameters
- **Driver development** - Device driver parameter documentation
- **System modules** - System-level parameter documentation
- **Open source projects** - Community-developed modules
- **Rock 5B+** - ARM64 embedded modules

## ARM64 Specific Considerations

**What**: ARM64 specific considerations address unique aspects of ARM64 architecture parameter handling.

**Why**: Understanding ARM64 considerations is important because:

- **Architecture differences** - ARM64 has different requirements
- **Memory model** - ARM64 specific memory considerations
- **Performance characteristics** - ARM64 specific performance
- **Hardware features** - ARM64 specific hardware capabilities
- **Real-world application** - Practical ARM64 development

**How**: ARM64 considerations involve:

```c
// Example: ARM64 specific parameter handling
// ARM64 cache line size parameter
static int cache_line_size = 64;
module_param(cache_line_size, int, S_IRUGO | S_IWUSR);
MODULE_PARM_DESC(cache_line_size, "ARM64 cache line size (32, 64, 128)");

// ARM64 memory barrier parameter
static bool use_memory_barriers = true;
module_param(use_memory_barriers, bool, S_IRUGO | S_IWUSR);
MODULE_PARM_DESC(use_memory_barriers, "Use ARM64 memory barriers");

// ARM64 specific validation
static int validate_arm64_params(void)
{
    // Validate cache line size
    if (cache_line_size != 32 && cache_line_size != 64 && cache_line_size != 128) {
        printk(KERN_ERR "Invalid cache_line_size: %d\n", cache_line_size);
        return -EINVAL;
    }
    
    return 0;
}

// ARM64 specific processing
static void process_arm64_params(void)
{
    if (use_memory_barriers) {
        printk(KERN_INFO "ARM64 memory barriers enabled\n");
        // Enable ARM64 specific memory barriers
    }
    
    printk(KERN_INFO "ARM64 cache line size: %d\n", cache_line_size);
}
```

**Explanation**:

- **ARM64 specific parameters** - Parameters specific to ARM64
- **Cache considerations** - ARM64 cache line size parameters
- **Memory barriers** - ARM64 memory barrier parameters
- **Validation** - ARM64 specific parameter validation
- **Processing** - ARM64 specific parameter processing

**Where**: ARM64 considerations are important in:

- **ARM64 systems** - All ARM64-based Linux systems
- **Embedded development** - IoT and industrial devices
- **Mobile devices** - Smartphones and tablets
- **Server systems** - ARM64 servers and workstations
- **Rock 5B+** - ARM64 single-board computer

## Rock 5B+ Parameter Development

**What**: Rock 5B+ specific parameter development addresses unique aspects of the Rock 5B+ platform.

**Why**: Understanding Rock 5B+ development is important because:

- **Platform specifics** - Rock 5B+ has unique requirements
- **RK3588 SoC** - Specific SoC features and limitations
- **Embedded nature** - Resource-constrained environment
- **Real-world application** - Practical embedded development
- **Hardware integration** - Platform-specific hardware

**How**: Rock 5B+ development involves:

```c
// Example: Rock 5B+ specific parameter development
// Rock 5B+ GPIO parameters
static int gpio_pin = 18;
static bool gpio_active_high = true;
static int gpio_debounce_ms = 50;

module_param(gpio_pin, int, S_IRUGO | S_IWUSR);
module_param(gpio_active_high, bool, S_IRUGO | S_IWUSR);
module_param(gpio_debounce_ms, int, S_IRUGO | S_IWUSR);

MODULE_PARM_DESC(gpio_pin, "Rock 5B+ GPIO pin number (0-63)");
MODULE_PARM_DESC(gpio_active_high, "GPIO active high (true/false)");
MODULE_PARM_DESC(gpio_debounce_ms, "GPIO debounce time in milliseconds");

// Rock 5B+ specific validation
static int validate_rock5b_params(void)
{
    // Validate GPIO pin
    if (gpio_pin < 0 || gpio_pin > 63) {
        printk(KERN_ERR "Invalid GPIO pin: %d (must be 0-63)\n", gpio_pin);
        return -EINVAL;
    }
    
    // Validate debounce time
    if (gpio_debounce_ms < 0 || gpio_debounce_ms > 1000) {
        printk(KERN_ERR "Invalid debounce time: %d ms\n", gpio_debounce_ms);
        return -EINVAL;
    }
    
    return 0;
}

// Rock 5B+ specific processing
static void process_rock5b_params(void)
{
    printk(KERN_INFO "Rock 5B+ GPIO configuration:\n");
    printk(KERN_INFO "  Pin: %d\n", gpio_pin);
    printk(KERN_INFO "  Active high: %s\n", gpio_active_high ? "yes" : "no");
    printk(KERN_INFO "  Debounce: %d ms\n", gpio_debounce_ms);
}
```

**Explanation**:

- **Rock 5B+ specific parameters** - Parameters specific to Rock 5B+
- **GPIO parameters** - Rock 5B+ GPIO configuration
- **Hardware parameters** - Rock 5B+ hardware configuration
- **Validation** - Rock 5B+ specific parameter validation
- **Processing** - Rock 5B+ specific parameter processing

**Where**: Rock 5B+ development is important in:

- **Embedded development** - Learning practical embedded development
- **ARM64 systems** - Understanding ARM64 development
- **Single-board computers** - SBC development
- **Real-time systems** - Real-time Linux development
- **Rock 5B+** - Specific platform development

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Parameter Understanding** - You understand module parameter concepts and usage
2. **Parameter Types** - You know different parameter types and their usage
3. **Parameter Validation** - You understand parameter validation techniques
4. **Parameter Arrays** - You know how to handle parameter arrays
5. **Platform Specifics** - You know ARM64 and Rock 5B+ considerations

**Why** these concepts matter:

- **Module flexibility** - Essential for configurable modules
- **User interface** - Important for user interaction
- **System administration** - Critical for system management
- **Development efficiency** - Valuable for module development
- **Professional development** - Valuable skill for kernel developers

**When** to use these concepts:

- **Module development** - When creating configurable modules
- **Driver development** - When developing device drivers
- **System configuration** - When configuring system modules
- **Embedded development** - When developing embedded modules
- **Learning** - When learning kernel development

**Where** these skills apply:

- **Kernel development** - Creating configurable kernel modules
- **Driver development** - Device driver configuration
- **System programming** - System-level programming
- **Embedded development** - Embedded Linux development
- **Professional development** - Working in systems programming

## Next Steps

**What** you're ready for next:

After mastering module parameters, you should be ready to:

1. **Learn character devices** - Understand character device drivers
2. **Study device operations** - Learn device file operations
3. **Begin platform drivers** - Start creating platform drivers
4. **Understand device trees** - Learn device tree integration
5. **Explore advanced topics** - Learn advanced driver concepts

**Where** to go next:

Continue with the next lesson on **"Character Device Drivers"** to learn:

- How to create character device drivers
- Device file operations and interfaces
- Driver registration and management
- User space interaction

**Why** the next lesson is important:

The next lesson builds on your module knowledge by teaching you how to create device drivers. You'll learn how to interface with hardware and provide user space access.

**How** to continue learning:

1. **Practice parameter development** - Create modules with parameters
2. **Study driver examples** - Examine existing device drivers
3. **Read documentation** - Study driver development documentation
4. **Join communities** - Engage with kernel developers
5. **Build projects** - Start with simple driver projects

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [Module Parameters](https://www.kernel.org/doc/html/latest/admin-guide/kernel-parameters.html) - Parameter documentation
- [Device Drivers](https://www.kernel.org/doc/html/latest/driver-api/) - Driver development documentation

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for new kernel developers
- [Linux Kernel Mailing List](https://lore.kernel.org/lkml/) - Kernel development discussions
- [Stack Overflow](https://stackoverflow.com/questions/tagged/linux-kernel) - Technical Q&A

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Comprehensive textbook
- [Understanding the Linux Kernel by Bovet and Cesati](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Detailed kernel internals
- [Linux Device Drivers by Corbet, Rubini, and Kroah-Hartman](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Driver development guide

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Architecture Reference](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture guide
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

Happy learning! 🐧
