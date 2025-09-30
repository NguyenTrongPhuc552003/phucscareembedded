# Troubleshooting Guide for Rock 5B+ Development

Common issues and solutions for Rock 5B+ embedded development projects.

## Introduction

This guide covers common troubleshooting scenarios you might encounter when developing on the Rock 5B+ platform. From hardware setup issues to software configuration problems, we'll provide solutions to get your development back on track.

## Hardware Issues

### 1. Power Supply Problems

**Symptoms:**
- Board doesn't boot
- Random shutdowns
- Unstable performance

**Solutions:**
```bash
# Check power supply voltage
sudo cat /sys/class/power_supply/battery/voltage_now

# Monitor power consumption
sudo cat /sys/class/power_supply/battery/current_now

# Check for power warnings
dmesg | grep -i power
```

**Prevention:**
- Use official 5V/3A USB-C power supply
- Avoid cheap or underpowered adapters
- Ensure stable power source

### 2. Thermal Issues

**Symptoms:**
- Performance throttling
- System instability
- High temperature warnings

**Solutions:**
```bash
# Check CPU temperature
cat /sys/class/thermal/thermal_zone*/temp

# Monitor thermal zones
watch -n 1 'cat /sys/class/thermal/thermal_zone*/temp'

# Check for thermal throttling
dmesg | grep -i thermal
```

**Cooling Solutions:**
- Install heatsink or fan
- Improve case ventilation
- Use thermal pads for better heat transfer
- Monitor temperature during heavy workloads

### 3. GPIO and Peripheral Issues

**Symptoms:**
- GPIO not responding
- I2C/SPI communication failures
- Sensor reading errors

**Solutions:**
```bash
# Check GPIO status
ls /sys/class/gpio/

# Test GPIO functionality
echo 18 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio18/direction
echo 1 > /sys/class/gpio/gpio18/value

# Check I2C devices
i2cdetect -y 1

# Check SPI devices
ls /dev/spi*
```

## Software Issues

### 1. Boot Problems

**Symptoms:**
- Boot loop
- Kernel panic
- Bootloader errors

**Solutions:**
```bash
# Check boot logs
dmesg | head -50

# Check system logs
journalctl -b

# Verify bootloader
sudo dd if=/dev/mmcblk0 bs=512 count=1 | hexdump -C

# Check partition table
sudo fdisk -l /dev/mmcblk0
```

**Recovery Steps:**
1. Reflash bootloader
2. Restore from backup
3. Use recovery mode
4. Check SD card integrity

### 2. Network Connectivity Issues

**Symptoms:**
- No internet connection
- WiFi not working
- Ethernet problems

**Solutions:**
```bash
# Check network interfaces
ip addr show

# Test connectivity
ping -c 4 8.8.8.8

# Check WiFi status
iwconfig

# Restart network services
sudo systemctl restart networking
sudo systemctl restart NetworkManager
```

**WiFi Troubleshooting:**
```bash
# Scan for networks
iwlist wlan0 scan

# Connect to WiFi
sudo wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
sudo dhclient wlan0

# Check WiFi driver
lsmod | grep wifi
```

### 3. Development Environment Issues

**Symptoms:**
- Cross-compilation failures
- Missing libraries
- Build errors

**Solutions:**
```bash
# Update package lists
sudo apt update && sudo apt upgrade

# Install development tools
sudo apt install -y build-essential cmake git
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# Check toolchain
aarch64-linux-gnu-gcc --version

# Install missing libraries
sudo apt install -y libssl-dev libncurses-dev
sudo apt install -y libusb-1.0-0-dev libudev-dev
```

## Cross-Compilation Issues

### 1. Toolchain Problems

**Symptoms:**
- "Command not found" errors
- Wrong architecture binaries
- Linking failures

**Solutions:**
```bash
# Install ARM64 toolchain
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu

# Set environment variables
export CC=aarch64-linux-gnu-gcc
export CXX=aarch64-linux-gnu-g++
export AR=aarch64-linux-gnu-ar
export STRIP=aarch64-linux-gnu-strip

# Verify toolchain
aarch64-linux-gnu-gcc --version
file $(which aarch64-linux-gnu-gcc)
```

### 2. Library Dependencies

**Symptoms:**
- Missing library errors
- Version conflicts
- Runtime linking issues

**Solutions:**
```bash
# Install ARM64 libraries
sudo apt install -y libc6-dev-arm64-cross
sudo apt install -y libssl-dev:arm64 libncurses-dev:arm64

# Use pkg-config for cross-compilation
export PKG_CONFIG_PATH=/usr/lib/aarch64-linux-gnu/pkgconfig
export PKG_CONFIG_LIBDIR=/usr/lib/aarch64-linux-gnu/pkgconfig

# Check library dependencies
aarch64-linux-gnu-objdump -p your_binary | grep NEEDED
```

## GPU Development Issues

### 1. OpenCL Problems

**Symptoms:**
- OpenCL devices not found
- Kernel compilation errors
- Performance issues

**Solutions:**
```bash
# Check OpenCL installation
clinfo

# Install OpenCL drivers
sudo apt install -y ocl-icd-opencl-dev
sudo apt install -y mesa-opencl-icd

# Test OpenCL
clinfo | grep -i mali
```

### 2. Vulkan Issues

**Symptoms:**
- Vulkan not supported
- Driver errors
- Application crashes

**Solutions:**
```bash
# Check Vulkan support
vulkaninfo

# Install Vulkan drivers
sudo apt install -y vulkan-tools vulkan-validationlayers-dev
sudo apt install -y mesa-vulkan-drivers

# Test Vulkan
vulkaninfo --summary
```

## Debugging Techniques

### 1. System Monitoring

```bash
# Monitor system resources
htop
iotop
nethogs

# Check system information
lscpu
free -h
df -h

# Monitor processes
ps aux | grep your_process
```

### 2. Log Analysis

```bash
# Check system logs
journalctl -f

# Check kernel messages
dmesg | tail -50

# Check application logs
tail -f /var/log/your_app.log

# Filter specific errors
dmesg | grep -i error
journalctl | grep -i fail
```

### 3. Performance Profiling

```bash
# CPU profiling
perf top
perf record -g your_program
perf report

# Memory profiling
valgrind --tool=memcheck your_program
valgrind --tool=massif your_program

# GPU profiling
sudo apt install -y gpu-utils
gpu-monitor
```

## Common Error Messages

### 1. "Permission Denied"
```bash
# Check file permissions
ls -la /path/to/file

# Fix permissions
sudo chmod +x /path/to/script
sudo chown user:user /path/to/file
```

### 2. "No Space Left on Device"
```bash
# Check disk usage
df -h

# Clean up space
sudo apt autoremove
sudo apt autoclean
sudo rm -rf /tmp/*

# Check for large files
find / -size +100M -type f 2>/dev/null
```

### 3. "Device or Resource Busy"
```bash
# Check what's using the device
lsof /dev/device_name

# Kill processes using the device
sudo kill -9 process_id

# Unmount if necessary
sudo umount /dev/device_name
```

## Recovery Procedures

### 1. System Recovery

```bash
# Boot from SD card
# Access recovery mode
# Restore from backup

# Reflash system
sudo dd if=system_image.img of=/dev/mmcblk0 bs=4M status=progress
```

### 2. Data Recovery

```bash
# Check filesystem
sudo fsck /dev/mmcblk0p2

# Recover deleted files
sudo apt install -y testdisk
testdisk

# Backup important data
sudo tar -czf backup.tar.gz /home/user/important_data
```

## Prevention Strategies

### 1. Regular Backups

```bash
# Create system backup
sudo dd if=/dev/mmcblk0 of=backup.img bs=4M status=progress

# Backup configuration
sudo tar -czf config_backup.tar.gz /etc /home/user/.config
```

### 2. Monitoring Setup

```bash
# Install monitoring tools
sudo apt install -y htop iotop nethogs

# Set up log rotation
sudo nano /etc/logrotate.d/your_app

# Configure automatic updates
sudo apt install -y unattended-upgrades
```

### 3. Development Best Practices

- Use version control (Git)
- Test on multiple hardware configurations
- Implement proper error handling
- Use logging and debugging tools
- Document configuration changes

## Getting Help

### 1. Community Resources

- [Rock 5B+ Official Forum](https://forum.radxa.com/)
- [GitHub Issues](https://github.com/radxa/rock5b)
- [Discord Community](https://discord.gg/radxa)

### 2. Documentation

- [Official Wiki](https://wiki.radxa.com/Rock5)
- [Hardware Documentation](https://wiki.radxa.com/Rock5/hardware)
- [Software Guides](https://wiki.radxa.com/Rock5/software)

### 3. Professional Support

- Contact Radxa support for hardware issues
- Consult embedded systems experts
- Use professional debugging services

## Conclusion

Troubleshooting embedded development issues requires systematic approach and good understanding of the platform. By following this guide and using the provided solutions, you can resolve most common issues and maintain a stable development environment.

Remember to:
- Keep backups of working configurations
- Document solutions for future reference
- Stay updated with latest firmware and software
- Join community forums for ongoing support

## Resources

- [Rock 5B+ Troubleshooting](https://wiki.radxa.com/Rock5/troubleshooting)
- [Linux System Administration](https://www.linux.org/)
- [Embedded Linux Development](https://elinux.org/)
- [ARM Development Tools](https://developer.arm.com/)

Happy debugging! 🔧