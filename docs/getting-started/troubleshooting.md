---
sidebar_position: 4
---

# Troubleshooting Guide

This comprehensive troubleshooting guide covers common issues and solutions for embedded development on the Rock 5B+ platform.

## Hardware Issues

### 1. Board Won't Boot

**Symptoms:**
- No display output
- No LED indicators
- Board appears dead

**Solutions:**
```bash
# Check power supply
# - Ensure 5V/3A minimum
# - Check USB-C cable quality
# - Try different power adapter

# Check microSD card
# - Verify card is properly inserted
# - Try different microSD card
# - Check card format and image

# Check connections
# - Verify HDMI cable
# - Check keyboard/mouse connections
# - Ensure all cables are secure
```

### 2. Display Issues

**Symptoms:**
- No video output
- Distorted display
- Wrong resolution

**Solutions:**
```bash
# Check HDMI connection
# - Try different HDMI port
# - Use different HDMI cable
# - Check monitor compatibility

# Boot with different display settings
# - Try different resolution
# - Use VGA adapter if available
# - Check display settings in bootloader
```

### 3. Network Issues

**Symptoms:**
- No network connectivity
- Slow network performance
- Intermittent connection

**Solutions:**
```bash
# Check WiFi connection
nmcli dev wifi list
nmcli dev wifi connect "SSID" password "password"

# Check Ethernet connection
ip link show eth0
sudo ip link set eth0 up

# Test network connectivity
ping -c 4 8.8.8.8
ping -c 4 google.com
```

## Software Issues

### 1. Boot Problems

**Symptoms:**
- Kernel panic
- Boot loop
- System hangs during boot

**Solutions:**
```bash
# Check boot logs
dmesg | tail -50
journalctl -b

# Boot with different kernel parameters
# Add to bootargs: console=ttyS2,1500000n8 debug

# Check file system
fsck /dev/mmcblk0p2

# Reinstall bootloader
# Flash new image to microSD card
```

### 2. Performance Issues

**Symptoms:**
- Slow system response
- High CPU usage
- Memory issues

**Solutions:**
```bash
# Check system resources
top
htop
free -h
df -h

# Check running processes
ps aux | grep -v grep

# Check system logs
journalctl -f
dmesg | grep -i error
```

### 3. Development Environment Issues

**Symptoms:**
- Cross-compilation fails
- Libraries not found
- Permission denied errors

**Solutions:**
```bash
# Check toolchain installation
aarch64-linux-gnu-gcc --version
which aarch64-linux-gnu-gcc

# Check environment variables
echo $CROSS_COMPILE
echo $ARCH
echo $PATH

# Install missing dependencies
sudo apt update
sudo apt install -y build-essential
sudo apt install -y gcc-aarch64-linux-gnu
```

## GPIO Issues

### 1. GPIO Not Working

**Symptoms:**
- GPIO commands fail
- No response from GPIO pins
- Permission denied

**Solutions:**
```bash
# Check GPIO permissions
sudo usermod -a -G gpio $USER
groups $USER

# Check GPIO device
ls -la /sys/class/gpio/
cat /sys/kernel/debug/gpio

# Test GPIO manually
echo 18 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio18/direction
echo 1 > /sys/class/gpio/gpio18/value
```

### 2. GPIO Conflicts

**Symptoms:**
- GPIO already in use
- Unexpected behavior
- System crashes

**Solutions:**
```bash
# Check GPIO usage
cat /sys/kernel/debug/gpio

# Free conflicting GPIO
echo 18 > /sys/class/gpio/unexport

# Check device tree
cat /proc/device-tree/gpio*
```

## GPU Issues

### 1. GPU Not Detected

**Symptoms:**
- No GPU devices found
- OpenCL/Vulkan not working
- Performance issues

**Solutions:**
```bash
# Check GPU drivers
lsmod | grep mali
dmesg | grep -i mali

# Install GPU drivers
sudo apt install -y libmali-g610-dkm
sudo apt install -y libmali-g610-dkm-dev

# Check GPU status
clinfo
vulkaninfo
```

### 2. GPU Performance Issues

**Symptoms:**
- Slow GPU performance
- GPU not utilized
- Thermal throttling

**Solutions:**
```bash
# Check GPU frequency
cat /sys/class/devfreq/fdab0000.gpu/cur_freq
cat /sys/class/devfreq/fdab0000.gpu/max_freq

# Check GPU temperature
sensors
cat /sys/class/thermal/thermal_zone*/temp

# Check GPU usage
nvidia-smi  # If available
```

## Network Issues

### 1. WiFi Problems

**Symptoms:**
- Can't connect to WiFi
- Intermittent connection
- Slow WiFi speed

**Solutions:**
```bash
# Check WiFi interface
ip link show wlan0
iwconfig

# Restart network manager
sudo systemctl restart NetworkManager

# Check WiFi drivers
lsmod | grep wifi
dmesg | grep -i wifi

# Test WiFi connection
ping -c 4 8.8.8.8
```

### 2. Ethernet Issues

**Symptoms:**
- No Ethernet connection
- Slow Ethernet speed
- Connection drops

**Solutions:**
```bash
# Check Ethernet interface
ip link show eth0
ethtool eth0

# Restart network interface
sudo ip link set eth0 down
sudo ip link set eth0 up

# Check Ethernet drivers
lsmod | grep ethernet
dmesg | grep -i ethernet
```

## Development Issues

### 1. Cross-Compilation Problems

**Symptoms:**
- Compilation errors
- Linking errors
- Runtime errors

**Solutions:**
```bash
# Check toolchain
aarch64-linux-gnu-gcc --version
aarch64-linux-gnu-ld --version

# Check environment
echo $CROSS_COMPILE
echo $ARCH
echo $PATH

# Test cross-compilation
echo 'int main(){return 0;}' | aarch64-linux-gnu-gcc -x c -
```

### 2. Debugging Issues

**Symptoms:**
- GDB not working
- No debug symbols
- Remote debugging fails

**Solutions:**
```bash
# Install debugging tools
sudo apt install -y gdb-multiarch
sudo apt install -y gdbserver

# Check debug symbols
file ./program
objdump -h ./program

# Test remote debugging
gdbserver :1234 ./program
```

## System Recovery

### 1. Boot Recovery

**Symptoms:**
- System won't boot
- Boot loop
- Kernel panic

**Solutions:**
```bash
# Boot from different media
# - Use different microSD card
# - Boot from network
# - Use recovery mode

# Reinstall system
# - Flash new image
# - Restore from backup
# - Use recovery tools
```

### 2. Data Recovery

**Symptoms:**
- Data corruption
- File system errors
- Lost files

**Solutions:**
```bash
# Check file system
fsck /dev/mmcblk0p2

# Recover deleted files
extundelete /dev/mmcblk0p2 --restore-all

# Restore from backup
dd if=backup.img of=/dev/mmcblk0p2
```

## Performance Optimization

### 1. System Optimization

**Solutions:**
```bash
# Optimize CPU governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Optimize memory
echo 1 | sudo tee /proc/sys/vm/drop_caches

# Optimize I/O
echo noop | sudo tee /sys/block/mmcblk0/queue/scheduler
```

### 2. Development Optimization

**Solutions:**
```bash
# Use faster storage
# - Use SSD instead of microSD
# - Use faster microSD card
# - Use network storage

# Optimize compilation
# - Use parallel compilation
# - Use ccache
# - Use precompiled headers
```

## Common Error Messages

### 1. Permission Denied

**Error:** `Permission denied`

**Solutions:**
```bash
# Check file permissions
ls -la /path/to/file
chmod +x /path/to/file

# Check user groups
groups $USER
sudo usermod -a -G group $USER
```

### 2. No Such File or Directory

**Error:** `No such file or directory`

**Solutions:**
```bash
# Check file existence
ls -la /path/to/file

# Check PATH
echo $PATH
which command

# Install missing packages
sudo apt install -y package-name
```

### 3. Out of Memory

**Error:** `Out of memory`

**Solutions:**
```bash
# Check memory usage
free -h
top

# Increase swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## Getting Help

### 1. Documentation

- Check official documentation
- Read error messages carefully
- Search for similar issues online

### 2. Community Support

- GitHub Issues
- Forums and mailing lists
- Stack Overflow
- Reddit communities

### 3. Professional Support

- Commercial support
- Consulting services
- Training programs

## Prevention

### 1. Best Practices

- Regular backups
- System monitoring
- Proper documentation
- Testing procedures

### 2. Maintenance

- Regular updates
- System monitoring
- Performance tuning
- Security updates

## Next Steps

- [Hardware Setup](./hardware-setup.md)
- [Development Environment](./development-environment.md)
- [OS Installation](../rock-5b-setup/os-installation.md)

## Resources

- [Rock 5B+ Troubleshooting](https://wiki.radxa.com/Rock5/troubleshooting)
- [Linux Troubleshooting Guide](https://www.linux.org/docs/troubleshooting.html)
- [Embedded Systems Debugging](https://www.embedded.com/design/programming-languages-and-tools/4428708/Embedded-debugging-techniques)
