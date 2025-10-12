# U-Boot Configuration

## What is U-Boot?

U-Boot (Universal Bootloader) is an open-source bootloader widely used in embedded Linux systems. It provides a flexible and powerful platform for initializing hardware, loading operating systems, and managing the boot process across various architectures including ARM, x86, MIPS, and PowerPC.

### Key Features

- **Multi-Architecture Support**: Runs on various CPU architectures
- **Network Boot**: Supports TFTP, NFS, and other network boot methods
- **Flash Support**: Works with various flash memory types
- **Scripting**: Provides a command-line interface and scripting capabilities
- **Environment Variables**: Persistent configuration storage

## Why Use U-Boot?

### Flexibility

- **Configurable**: Highly customizable for different hardware platforms
- **Extensible**: Easy to add new features and commands
- **Portable**: Runs on multiple architectures and hardware platforms

### Reliability

- **Mature Codebase**: Well-tested and stable codebase
- **Error Handling**: Comprehensive error detection and recovery
- **Debugging**: Built-in debugging and logging capabilities

### Industry Standard

- **Wide Adoption**: Used by major embedded Linux vendors
- **Community Support**: Large community and extensive documentation
- **Professional Support**: Commercial support available

## When to Use U-Boot?

### Development Phase

- **Prototyping**: Rapid hardware testing and validation
- **Debugging**: System-level debugging and troubleshooting
- **Configuration**: Hardware and software configuration

### Production Phase

- **Field Updates**: Remote firmware updates and maintenance
- **Recovery**: System recovery and repair operations
- **Monitoring**: System health monitoring and diagnostics

## Where is U-Boot Located?

### Memory Layout

```
0x00000000 - 0x0000FFFF: Boot ROM
0x00010000 - 0x000FFFFF: U-Boot (1MB)
0x00100000 - 0x00FFFFFF: Kernel Image
0x01000000 - 0xFFFFFFFF: Root Filesystem
```

### Storage Locations

- **Flash Memory**: Primary storage for U-Boot binary
- **eMMC/SD Card**: Alternative storage for U-Boot
- **Network**: Network boot from TFTP server
- **USB**: Boot from USB storage devices

## How to Configure U-Boot?

### Basic Configuration

#### 1. Environment Variables

```bash
# Set boot arguments
setenv bootargs 'console=ttyS0,115200 root=/dev/mmcblk0p2 rw'

# Set boot command
setenv bootcmd 'mmc read 0x1000000 0x2000 0x4000; bootm 0x1000000'

# Set boot delay
setenv bootdelay 3

# Set baud rate
setenv baudrate 115200

# Save environment
saveenv
```

#### 2. Network Configuration

```bash
# Set IP address
setenv ipaddr 192.168.1.100

# Set server IP
setenv serverip 192.168.1.1

# Set gateway
setenv gatewayip 192.168.1.1

# Set netmask
setenv netmask 255.255.255.0

# Set MAC address
setenv ethaddr 00:11:22:33:44:55
```

#### 3. Boot Configuration

```bash
# Set boot device
setenv bootdevice mmc

# Set kernel image location
setenv kernel_addr 0x1000000

# Set device tree location
setenv fdt_addr 0x2000000

# Set root filesystem location
setenv rootfs_addr 0x3000000
```

### Advanced Configuration

#### 1. Custom Boot Scripts

```bash
# Create custom boot script
setenv bootscript 'echo "Starting custom boot sequence"; \
    mmc read 0x1000000 0x2000 0x4000; \
    mmc read 0x2000000 0x6000 0x1000; \
    bootm 0x1000000 - 0x2000000'

# Set boot command to use script
setenv bootcmd 'run bootscript'
```

#### 2. Conditional Boot Logic

```bash
# Boot from different sources based on conditions
setenv bootcmd 'if test ${bootdevice} = mmc; then \
        run mmcboot; \
    elif test ${bootdevice} = net; then \
        run netboot; \
    else \
        run defaultboot; \
    fi'

# Define boot methods
setenv mmcboot 'mmc read 0x1000000 0x2000 0x4000; bootm 0x1000000'
setenv netboot 'tftp 0x1000000 kernel.img; bootm 0x1000000'
setenv defaultboot 'echo "No boot method specified"'
```

#### 3. Recovery Mode

```bash
# Recovery boot sequence
setenv recovery_cmd 'echo "Entering recovery mode"; \
    mmc read 0x1000000 0x8000 0x4000; \
    bootm 0x1000000'

# Set recovery trigger
setenv recovery_trigger 'if test ${recovery} = yes; then run recovery_cmd; fi'
```

### U-Boot Compilation

#### 1. Configuration

```bash
# Configure for specific board
make rock5b_defconfig

# Custom configuration
make menuconfig
```

#### 2. Compilation

```bash
# Compile U-Boot
make CROSS_COMPILE=aarch64-linux-gnu-

# Generate binary
make CROSS_COMPILE=aarch64-linux-gnu- u-boot.bin
```

#### 3. Installation

```bash
# Install to SD card
sudo dd if=u-boot.bin of=/dev/sdb bs=512 seek=64

# Install to eMMC
sudo dd if=u-boot.bin of=/dev/mmcblk0 bs=512 seek=64
```

### Device Tree Integration

#### 1. Device Tree Source

```dts
// U-Boot device tree configuration
/ {
    chosen {
        bootargs = "console=ttyS0,115200 root=/dev/mmcblk0p2 rw";
        linux,initrd-start = <0x1000000>;
        linux,initrd-end = <0x2000000>;
    };

    memory {
        device_type = "memory";
        reg = <0x0 0x40000000>;
    };

    aliases {
        serial0 = &uart0;
        mmc0 = &sdmmc0;
    };
};
```

#### 2. Device Tree Compilation

```bash
# Compile device tree
dtc -I dts -O dtb -o rock5b.dtb rock5b.dts

# Include in U-Boot
make CROSS_COMPILE=aarch64-linux-gnu- u-boot.dtb
```

### Network Boot Configuration

#### 1. TFTP Server Setup

```bash
# Install TFTP server
sudo apt-get install tftpd-hpa

# Configure TFTP server
echo "TFTP_USERNAME=\"tftp\"" >> /etc/default/tftpd-hpa
echo "TFTP_DIRECTORY=\"/srv/tftp\"" >> /etc/default/tftpd-hpa
echo "TFTP_ADDRESS=\"0.0.0.0:69\"" >> /etc/default/tftpd-hpa
echo "TFTP_OPTIONS=\"--secure\"" >> /etc/default/tftpd-hpa

# Start TFTP server
sudo systemctl start tftpd-hpa
```

#### 2. U-Boot Network Boot

```bash
# Set up network boot
setenv serverip 192.168.1.1
setenv ipaddr 192.168.1.100

# Load kernel via TFTP
tftp 0x1000000 kernel.img

# Load device tree via TFTP
tftp 0x2000000 rock5b.dtb

# Boot with device tree
bootm 0x1000000 - 0x2000000
```

### Secure Boot Implementation

#### 1. Key Generation

```bash
# Generate private key
openssl genrsa -out private_key.pem 2048

# Generate public key
openssl rsa -in private_key.pem -pubout -out public_key.pem

# Generate certificate
openssl req -new -x509 -key private_key.pem -out certificate.pem -days 365
```

#### 2. Image Signing

```bash
# Sign kernel image
openssl dgst -sha256 -sign private_key.pem -out kernel.sig kernel.img

# Sign device tree
openssl dgst -sha256 -sign private_key.pem -out rock5b.dtb.sig rock5b.dtb
```

#### 3. U-Boot Secure Boot

```bash
# Load public key
setenv pubkey_addr 0x4000000
tftp ${pubkey_addr} public_key.pem

# Verify kernel signature
verify_kernel ${kernel_addr} ${pubkey_addr}

# Boot if verification succeeds
if test $? -eq 0; then bootm ${kernel_addr}; fi
```

### Debugging and Troubleshooting

#### 1. Enable Debug Output

```bash
# Enable verbose output
setenv debug 1

# Enable network debug
setenv netdebug 1

# Enable memory debug
setenv memdebug 1
```

#### 2. Common Issues

**Boot Hangs**

```bash
# Check hardware connections
mmc info
mmc list

# Test memory
md 0x1000000 0x100

# Check environment
printenv
```

**Network Issues**

```bash
# Test network connectivity
ping 192.168.1.1

# Check network configuration
printenv | grep -E "(ip|net|eth)"

# Test TFTP
tftp 0x1000000 test.bin
```

**Memory Issues**

```bash
# Check memory configuration
bdinfo

# Test memory access
md 0x0 0x100
mw 0x1000000 0x12345678 0x100
md 0x1000000 0x100
```

### Performance Optimization

#### 1. Boot Time Optimization

```bash
# Reduce boot delay
setenv bootdelay 0

# Skip unnecessary checks
setenv skip_checks 1

# Use compressed images
setenv image_compression gzip
```

#### 2. Memory Optimization

```bash
# Optimize memory layout
setenv kernel_addr 0x1000000
setenv fdt_addr 0x2000000
setenv ramdisk_addr 0x3000000

# Use high memory for large images
setenv large_image_addr 0x8000000
```

### Custom Commands

#### 1. Adding Custom Commands

```c
// Custom U-Boot command
static int do_mycommand(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    if (argc < 2) {
        printf("Usage: mycommand <arg>\n");
        return 1;
    }

    printf("My command executed with arg: %s\n", argv[1]);
    return 0;
}

U_BOOT_CMD(
    mycommand, 2, 1, do_mycommand,
    "My custom command",
    "arg - argument for my command"
);
```

#### 2. Environment Variable Commands

```c
// Custom environment variable handler
static int do_setmyvar(cmd_tbl_t *cmdtp, int flag, int argc, char * const argv[])
{
    if (argc < 2) {
        printf("Usage: setmyvar <value>\n");
        return 1;
    }

    env_set("myvar", argv[1]);
    return 0;
}

U_BOOT_CMD(
    setmyvar, 2, 1, do_setmyvar,
    "Set my custom variable",
    "value - value to set"
);
```

## Best Practices

### Configuration Management

1. **Version Control**: Keep U-Boot configurations in version control
2. **Documentation**: Document all custom configurations
3. **Testing**: Test configurations on multiple hardware platforms
4. **Backup**: Maintain backup configurations for recovery

### Security

1. **Secure Boot**: Implement secure boot for production systems
2. **Access Control**: Restrict access to U-Boot configuration
3. **Audit Trail**: Log all configuration changes
4. **Key Management**: Secure storage of cryptographic keys

### Performance

1. **Optimization**: Optimize boot time and memory usage
2. **Monitoring**: Monitor boot performance and identify bottlenecks
3. **Profiling**: Use profiling tools to analyze boot process
4. **Caching**: Implement caching for frequently used data

## Conclusion

U-Boot configuration is a critical aspect of embedded Linux development that requires careful planning and implementation. By understanding the configuration options, implementing proper security measures, and following best practices, developers can create robust and efficient boot systems that meet the demanding requirements of modern embedded applications.

## Further Reading

- [U-Boot Documentation](https://www.denx.de/wiki/U-Boot)
- [U-Boot Source Code](https://github.com/u-boot/u-boot)
- [ARM Boot Process](https://developer.arm.com/documentation)
- [Embedded Linux Bootloaders](https://elinux.org/Bootloaders)
