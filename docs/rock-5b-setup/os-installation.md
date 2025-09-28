---
sidebar_position: 2
---

# Rock 5B+ OS Installation

This comprehensive guide covers installing and configuring operating systems on the Rock 5B+ development board.

## Supported Operating Systems

The Rock 5B+ supports several Linux distributions:

- **Ubuntu 22.04 LTS** (Recommended for development)
- **Debian 11** (Stable and lightweight)
- **Armbian** (Optimized for ARM boards)
- **Yocto Project** (Custom embedded Linux)

## Prerequisites

### Hardware Requirements
- Rock 5B+ development board
- microSD card (32GB+, Class 10, UHS-I)
- USB-C power adapter (5V/3A minimum)
- USB-C to USB-A cable
- HDMI cable and monitor
- Keyboard and mouse

### Software Requirements
- Computer with SD card reader
- Image flashing software (Balena Etcher, dd, or similar)
- Internet connection for downloads

## Ubuntu 22.04 Installation

### 1. Download Ubuntu Image

```bash
# Download the latest Ubuntu image for Rock 5B+
wget https://github.com/radxa-build/rock-5b/releases/latest/download/rock-5b-ubuntu-22.04-server-arm64.img.xz

# Verify download
ls -la rock-5b-ubuntu-22.04-server-arm64.img.xz
```

### 2. Flash Image to microSD Card

#### Method 1: Using Balena Etcher (Recommended)

1. Download and install [Balena Etcher](https://www.balena.io/etcher/)
2. Open Balena Etcher
3. Select the downloaded `.img.xz` file
4. Select your microSD card
5. Click "Flash!" and wait for completion

#### Method 2: Using Command Line

```bash
# Find your SD card device (replace /dev/sdX with your device)
lsblk

# Uncompress and flash the image
xzcat rock-5b-ubuntu-22.04-server-arm64.img.xz | sudo dd of=/dev/sdX bs=4M status=progress

# Sync to ensure data is written
sync
```

### 3. First Boot Setup

1. Insert the microSD card into the Rock 5B+
2. Connect HDMI cable to monitor
3. Connect keyboard and mouse
4. Power on the board
5. Wait for boot process to complete

### 4. Initial Configuration

```bash
# Login with default credentials
# Username: rock
# Password: rock

# Change default password
passwd

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install essential development tools
sudo apt install -y build-essential git cmake ninja-build
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y gdb-multiarch openocd
sudo apt install -y python3 python3-pip
sudo apt install -y vim nano htop tree
```

## Debian 11 Installation

### 1. Download Debian Image

```bash
# Download Debian image
wget https://github.com/radxa-build/rock-5b/releases/latest/download/rock-5b-debian-11-bullseye-arm64.img.xz
```

### 2. Flash and Boot

Follow the same flashing process as Ubuntu, then:

```bash
# Login with default credentials
# Username: rock
# Password: rock

# Update system
sudo apt update && sudo apt upgrade -y

# Install development tools
sudo apt install -y build-essential git cmake
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
```

## Armbian Installation

### 1. Download Armbian Image

```bash
# Download Armbian image for Rock 5B+
wget https://github.com/armbian/build/releases/latest/download/Armbian_rock5b_bullseye_current.img.xz
```

### 2. Flash and Configure

```bash
# Flash image
xzcat Armbian_rock5b_bullseye_current.img.xz | sudo dd of=/dev/sdX bs=4M status=progress

# Boot and configure
# Default username: root
# Default password: 1234
# You'll be prompted to create a new user and password
```

## Network Configuration

### 1. WiFi Setup

```bash
# List available WiFi networks
nmcli dev wifi list

# Connect to WiFi network
sudo nmcli dev wifi connect "YourSSID" password "YourPassword"

# Check connection
ip addr show wlan0
```

### 2. Ethernet Configuration

```bash
# Check Ethernet connection
ip addr show eth0

# Configure static IP (optional)
sudo nmcli connection modify "Wired connection 1" ipv4.addresses 192.168.1.100/24
sudo nmcli connection modify "Wired connection 1" ipv4.gateway 192.168.1.1
sudo nmcli connection modify "Wired connection 1" ipv4.dns "8.8.8.8,8.8.4.4"
sudo nmcli connection modify "Wired connection 1" ipv4.method manual
sudo nmcli connection up "Wired connection 1"
```

### 3. SSH Configuration

```bash
# Install SSH server
sudo apt install -y openssh-server

# Enable SSH service
sudo systemctl enable ssh
sudo systemctl start ssh

# Check SSH status
sudo systemctl status ssh

# Configure SSH (optional)
sudo nano /etc/ssh/sshd_config
# Uncomment and modify:
# Port 22
# PermitRootLogin no
# PasswordAuthentication yes

# Restart SSH service
sudo systemctl restart ssh
```

## GPU and Hardware Setup

### 1. Install Mali GPU Drivers

```bash
# Install Mali GPU development libraries
sudo apt install -y libmali-g610-dkm libmali-g610-dkm-dev
sudo apt install -y libmali-g610-dkm-tools

# Install OpenGL development tools
sudo apt install -y libgl1-mesa-dev libglu1-mesa-dev
sudo apt install -y freeglut3-dev

# Install OpenCL development tools
sudo apt install -y opencl-headers ocl-icd-opencl-dev
sudo apt install -y clinfo

# Install Vulkan development tools
sudo apt install -y vulkan-tools vulkan-validationlayers
sudo apt install -y libvulkan-dev
```

### 2. Verify GPU Installation

```bash
# Check OpenCL devices
clinfo

# Check Vulkan devices
vulkaninfo

# Check OpenGL
glxinfo | grep "OpenGL"
```

### 3. GPIO Configuration

```bash
# Add user to gpio group
sudo usermod -a -G gpio $USER

# Enable GPIO in device tree
echo "gpio" | sudo tee -a /etc/modules

# Test GPIO access
echo 18 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio18/direction
echo 1 > /sys/class/gpio/gpio18/value
echo 0 > /sys/class/gpio/gpio18/value
echo 18 > /sys/class/gpio/unexport
```

## Development Environment Setup

### 1. Install Cross-Compilation Tools

```bash
# Install ARM64 cross-compilation tools
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y binutils-aarch64-linux-gnu

# Set up environment variables
echo 'export CROSS_COMPILE=aarch64-linux-gnu-' >> ~/.bashrc
echo 'export ARCH=arm64' >> ~/.bashrc
echo 'export CROSS_COMPILE_PATH=/usr/bin/aarch64-linux-gnu-' >> ~/.bashrc
source ~/.bashrc
```

### 2. Install Kernel Development Tools

```bash
# Install kernel build dependencies
sudo apt install -y libncurses-dev libssl-dev
sudo apt install -y flex bison libelf-dev
sudo apt install -y bc rsync

# Install device tree compiler
sudo apt install -y device-tree-compiler
```

### 3. Install Debugging Tools

```bash
# Install debugging tools
sudo apt install -y gdb-multiarch openocd
sudo apt install -y gdbserver

# Install additional debugging tools
sudo apt install -y strace ltrace valgrind
sudo apt install -y perf-tools-unstable
```

## Yocto Project Setup

### 1. Install Yocto Dependencies

```bash
# Install required packages
sudo apt install -y gawk wget git-core diffstat unzip texinfo gcc-multilib
sudo apt install -y build-essential chrpath socat cpio python3 python3-pip
sudo apt install -y python3-pexpect xz-utils debianutils iputils-ping
sudo apt install -y python3-git python3-jinja2 libegl1-mesa libsdl1.2-dev
sudo apt install -y pylint3 xterm python3-subunit mesa-common-dev
```

### 2. Set Up Yocto Environment

```bash
# Create workspace
mkdir -p ~/yocto-workspace
cd ~/yocto-workspace

# Clone Poky
git clone -b kirkstone git://git.yoctoproject.org/poky.git
cd poky

# Set up environment
source oe-init-build-env build-rock5b
```

### 3. Configure Build

```bash
# Edit local.conf
echo 'MACHINE = "rock5b"' >> conf/local.conf
echo 'DISTRO = "poky"' >> conf/local.conf

# Build image
bitbake core-image-minimal
```

## Performance Optimization

### 1. CPU Governor Configuration

```bash
# Check current CPU governor
cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Set performance governor
echo performance | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor

# Make it persistent
echo 'GOVERNOR=performance' | sudo tee -a /etc/default/cpufrequtils
```

### 2. Memory Configuration

```bash
# Check memory usage
free -h

# Configure swap (if needed)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile

# Make swap persistent
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 3. Storage Optimization

```bash
# Check disk usage
df -h

# Clean package cache
sudo apt clean
sudo apt autoremove

# Configure log rotation
sudo nano /etc/logrotate.conf
```

## Troubleshooting

### 1. Boot Issues

**Problem**: Board won't boot
**Solutions**:
- Check power supply (5V/3A minimum)
- Verify microSD card is properly inserted
- Try a different microSD card
- Check if image was flashed correctly

**Problem**: No display output
**Solutions**:
- Check HDMI cable connection
- Try different HDMI port
- Verify monitor resolution settings
- Check if display is powered on

### 2. Network Issues

**Problem**: WiFi not working
**Solutions**:
```bash
# Check WiFi interface
ip link show

# Restart network manager
sudo systemctl restart NetworkManager

# Check WiFi drivers
lsmod | grep wifi
```

**Problem**: Ethernet not working
**Solutions**:
```bash
# Check Ethernet interface
ip link show eth0

# Restart network interface
sudo ip link set eth0 down
sudo ip link set eth0 up

# Check cable connection
```

### 3. Performance Issues

**Problem**: System running slowly
**Solutions**:
```bash
# Check CPU usage
top

# Check memory usage
free -h

# Check disk I/O
iostat

# Check temperature
sensors
```

### 4. Development Issues

**Problem**: Cross-compilation not working
**Solutions**:
```bash
# Verify toolchain installation
aarch64-linux-gnu-gcc --version

# Check environment variables
echo $CROSS_COMPILE
echo $ARCH

# Test cross-compilation
aarch64-linux-gnu-gcc -o test test.c
```

## Security Configuration

### 1. Firewall Setup

```bash
# Install UFW
sudo apt install -y ufw

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# Enable firewall
sudo ufw enable
```

### 2. SSH Security

```bash
# Edit SSH configuration
sudo nano /etc/ssh/sshd_config

# Recommended settings:
# Port 22
# PermitRootLogin no
# PasswordAuthentication yes
# PubkeyAuthentication yes
# MaxAuthTries 3
# ClientAliveInterval 300
# ClientAliveCountMax 2

# Restart SSH service
sudo systemctl restart ssh
```

### 3. System Updates

```bash
# Enable automatic security updates
sudo apt install -y unattended-upgrades

# Configure automatic updates
sudo dpkg-reconfigure unattended-upgrades

# Check update status
sudo unattended-upgrade --dry-run
```

## Next Steps

- [Peripheral Setup](./peripheral-setup.md)
- [Troubleshooting](./troubleshooting.md)
- [Hardware Overview](./hardware-overview.md)

## Resources

- [Rock 5B+ Official Documentation](https://wiki.radxa.com/Rock5)
- [Ubuntu ARM Documentation](https://ubuntu.com/download/arm)
- [Debian ARM Documentation](https://www.debian.org/ports/arm64/)
- [Armbian Documentation](https://docs.armbian.com/)
- [Yocto Project Documentation](https://docs.yoctoproject.org/)
