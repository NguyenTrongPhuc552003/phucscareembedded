---
sidebar_position: 3
---

# Bootloader Development

This guide covers bootloader development for embedded Linux systems, focusing on U-Boot for the Rock 5B+ platform.

## Understanding Bootloaders

### 1. Boot Process Overview

```
┌─────────────────────────────────────┐
│           Power On                  │
├─────────────────────────────────────┤
│           ROM Bootloader            │
├─────────────────────────────────────┤
│           U-Boot                    │
├─────────────────────────────────────┤
│           Linux Kernel              │
├─────────────────────────────────────┤
│           Init Process              │
├─────────────────────────────────────┤
│           User Space                 │
└─────────────────────────────────────┘
```

### 2. Bootloader Responsibilities

- **Hardware Initialization**: CPU, memory, peripherals
- **Device Tree Loading**: Hardware configuration
- **Kernel Loading**: Load and start Linux kernel
- **Environment Management**: Boot parameters and configuration
- **Recovery Mode**: System recovery and updates

## U-Boot Development

### 1. U-Boot Source Code

```bash
# Clone U-Boot source
git clone https://github.com/radxa/u-boot.git -b stable-5.10-rock5
cd u-boot

# Configure for Rock 5B+
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- rock5b_defconfig

# Build U-Boot
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc)
```

### 2. U-Boot Configuration

```bash
# Edit configuration
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- menuconfig

# Key configuration options:
# - CONFIG_ARM64=y
# - CONFIG_ROCKCHIP_RK3588=y
# - CONFIG_CMD_BOOTZ=y
# - CONFIG_CMD_DTB=y
```

### 3. Custom U-Boot Commands

```c
// Custom command implementation
#include <common.h>
#include <command.h>

static int do_mycommand(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    if (argc < 2) {
        printf("Usage: mycommand <parameter>\n");
        return CMD_RET_USAGE;
    }
    
    printf("My command executed with parameter: %s\n", argv[1]);
    
    return CMD_RET_SUCCESS;
}

U_BOOT_CMD(
    mycommand, 2, 1, do_mycommand,
    "My custom command",
    "parameter - Description of parameter"
);
```

## Device Tree Configuration

### 1. Device Tree Basics

```dts
// rock5b.dts
/dts-v1/;

#include "rk3588.dtsi"

/ {
    model = "Radxa ROCK 5B";
    compatible = "radxa,rock-5b", "rockchip,rk3588";

    chosen {
        stdout-path = "serial2:1500000n8";
        bootargs = "console=ttyS2,1500000n8";
    };

    memory@0 {
        device_type = "memory";
        reg = <0x0 0x0 0x0 0x80000000>;
    };
};
```

### 2. Custom Device Tree

```dts
// Custom device tree overlay
/dts-v1/;
/plugin/;

/ {
    fragment@0 {
        target-path = "/";
        
        __overlay__ {
            my-custom-device {
                compatible = "my,custom-device";
                status = "okay";
                my-parameter = <0x12345678>;
            };
        };
    };
};
```

## Boot Environment

### 1. U-Boot Environment Variables

```bash
# Set boot environment
setenv bootargs 'console=ttyS2,1500000n8 root=/dev/mmcblk0p2 rw'
setenv bootcmd 'load mmc 0:1 0x80080000 Image; load mmc 0:1 0x80000000 rk3588-rock-5b.dtb; booti 0x80080000 - 0x80000000'
setenv bootdelay 3

# Save environment
saveenv
```

### 2. Boot Scripts

```bash
# Create boot script
echo 'load mmc 0:1 0x80080000 Image' > boot.scr
echo 'load mmc 0:1 0x80000000 rk3588-rock-5b.dtb' >> boot.scr
echo 'booti 0x80080000 - 0x80000000' >> boot.scr

# Compile script
mkimage -C none -A arm64 -T script -d boot.scr boot.scr.uimg
```

## Bootloader Debugging

### 1. Serial Console Debugging

```bash
# Connect serial console
# Baud rate: 1500000
# Data bits: 8
# Stop bits: 1
# Parity: None
# Flow control: None

# U-Boot debug commands
md 0x80000000 100    # Memory dump
mm 0x80000000        # Memory modify
mw 0x80000000 0x12345678  # Memory write
```

### 2. Network Boot

```bash
# Configure network
setenv ipaddr 192.168.1.100
setenv serverip 192.168.1.1
setenv netmask 255.255.255.0
setenv gatewayip 192.168.1.1

# Boot from network
tftp 0x80080000 Image
tftp 0x80000000 rk3588-rock-5b.dtb
booti 0x80080000 - 0x80000000
```

## Custom Bootloader Features

### 1. Recovery Mode

```c
// Recovery mode implementation
#include <common.h>
#include <command.h>

static int recovery_mode = 0;

static int do_recovery(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    recovery_mode = 1;
    printf("Entering recovery mode...\n");
    
    // Load recovery image
    if (load_recovery_image()) {
        printf("Recovery image loaded successfully\n");
        return CMD_RET_SUCCESS;
    } else {
        printf("Failed to load recovery image\n");
        return CMD_RET_FAILURE;
    }
}

U_BOOT_CMD(
    recovery, 1, 1, do_recovery,
    "Enter recovery mode",
    ""
);
```

### 2. Secure Boot

```c
// Secure boot implementation
#include <common.h>
#include <crypto.h>

static int verify_kernel_signature(void *kernel, size_t size)
{
    // Load public key
    // Verify signature
    // Return verification result
    return 1; // Placeholder
}

static int secure_boot(void)
{
    if (verify_kernel_signature(kernel_addr, kernel_size)) {
        printf("Kernel signature verified\n");
        return 0;
    } else {
        printf("Kernel signature verification failed\n");
        return -1;
    }
}
```

## Bootloader Optimization

### 1. Boot Time Optimization

```c
// Optimize boot time
static void optimize_boot_time(void)
{
    // Disable unnecessary peripherals
    // Optimize memory initialization
    // Use faster boot methods
    // Minimize delay loops
}
```

### 2. Memory Optimization

```c
// Memory usage optimization
static void optimize_memory_usage(void)
{
    // Use stack for temporary data
    // Minimize global variables
    // Use const data where possible
    // Optimize data structures
}
```

## Testing and Validation

### 1. Bootloader Testing

```bash
# Test bootloader functionality
# 1. Power cycle testing
# 2. Boot time measurement
# 3. Memory testing
# 4. Peripheral testing
# 5. Recovery mode testing
```

### 2. Automated Testing

```bash
#!/bin/bash
# Automated bootloader testing script

echo "Testing U-Boot functionality..."

# Test basic commands
echo "Testing basic commands..."
uboot_test_commands

# Test boot process
echo "Testing boot process..."
uboot_test_boot

# Test recovery mode
echo "Testing recovery mode..."
uboot_test_recovery

echo "All tests completed"
```

## Best Practices

### 1. Code Organization

- Use modular design
- Implement proper error handling
- Document all functions
- Use consistent coding style
- Implement proper logging

### 2. Security Considerations

- Implement secure boot
- Use encrypted storage
- Validate all inputs
- Implement access control
- Regular security updates

### 3. Performance Optimization

- Minimize boot time
- Optimize memory usage
- Use efficient algorithms
- Profile critical paths
- Regular performance testing

## Next Steps

- [File System Development](./filesystem.md)
- [Kernel Development](./kernel-development.md)
- [Device Driver Development](./device-drivers.md)

## Resources

- [U-Boot Documentation](https://www.denx.de/wiki/U-Boot/Documentation)
- [Device Tree Specification](https://www.devicetree.org/specifications/)
- [Rock 5B+ Bootloader Guide](https://wiki.radxa.com/Rock5/software/bootloader)
- [ARM Boot Process](https://developer.arm.com/documentation)
