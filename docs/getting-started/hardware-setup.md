---
sidebar_position: 2
---

# Hardware Setup

This guide will help you set up your Rock 5B+ development board and essential peripherals for embedded development.

## Rock 5B+ Overview

The Rock 5B+ is a powerful single-board computer featuring:

- **CPU**: ARM Cortex-A76 quad-core @ 2.4GHz
- **GPU**: Mali-G610 MP4 GPU
- **Memory**: 4GB/8GB/16GB LPDDR4X
- **Storage**: eMMC, microSD, M.2 NVMe
- **Connectivity**: WiFi 6, Bluetooth 5.0, Gigabit Ethernet
- **GPIO**: 40-pin header with I2C, SPI, UART, PWM

## Required Hardware

### Essential Components
- Rock 5B+ board
- microSD card (32GB+, Class 10)
- USB-C power adapter (5V/3A)
- USB-C to USB-A cable
- HDMI cable
- Keyboard and mouse

### Optional Components
- M.2 NVMe SSD (for faster storage)
- USB-C hub with multiple ports
- GPIO expansion board
- Camera module
- Display (if not using HDMI)

## Initial Setup

### 1. Prepare the microSD Card

```bash
# Download the latest Ubuntu image for Rock 5B+
wget https://github.com/radxa-build/rock-5b/releases/latest/download/rock-5b-ubuntu-22.04-server-arm64.img.xz

# Flash the image to microSD card
xzcat rock-5b-ubuntu-22.04-server-arm64.img.xz | sudo dd of=/dev/sdX bs=4M status=progress
```

### 2. First Boot

1. Insert the microSD card into the Rock 5B+
2. Connect HDMI cable to monitor
3. Connect keyboard and mouse
4. Power on the board
5. Follow the initial setup wizard

### 3. Network Configuration

```bash
# Configure WiFi (if using WiFi)
sudo nmcli dev wifi connect "YourSSID" password "YourPassword"

# Or configure Ethernet
sudo ip addr add 192.168.1.100/24 dev eth0
sudo ip route add default via 192.168.1.1
```

## Development Environment Setup

### 1. Update System

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Install Development Tools

```bash
# Essential development tools
sudo apt install -y build-essential git cmake ninja-build
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y gdb-multiarch openocd
sudo apt install -y python3 python3-pip
sudo apt install -y vim nano htop tree
```

### 3. Install GPU Development Tools

```bash
# Install Mali GPU development tools
sudo apt install -y libmali-g610-dkm libmali-g610-dkm-dev
sudo apt install -y opencl-headers ocl-icd-opencl-dev
sudo apt install -y vulkan-tools vulkan-validationlayers
```

## GPIO and Peripheral Setup

### Enable GPIO Access

```bash
# Add user to gpio group
sudo usermod -a -G gpio $USER

# Enable GPIO in device tree
echo "gpio" | sudo tee -a /etc/modules
```

### Test GPIO Access

```bash
# Test GPIO 18 (pin 12)
echo 18 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio18/direction
echo 1 > /sys/class/gpio/gpio18/value
echo 0 > /sys/class/gpio/gpio18/value
echo 18 > /sys/class/gpio/unexport
```

## Next Steps

- [Development Environment Setup](./development-environment.md)
- [Embedded Linux Development](../embedded-linux/kernel-development.md)
- [GPU Development](../gpu-development/mali-gpu.md)

## Troubleshooting

### Common Issues

**Board won't boot:**
- Check power supply (5V/3A minimum)
- Verify microSD card is properly inserted
- Try a different microSD card

**No display output:**
- Check HDMI cable connection
- Try different HDMI port
- Verify monitor resolution settings

**Network issues:**
- Check WiFi credentials
- Verify Ethernet cable connection
- Check router/switch configuration

For more troubleshooting tips, see our [Troubleshooting Guide](./troubleshooting.md).
