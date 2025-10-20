---
sidebar_position: 3
---

# Rock 5B+ Development Setup

Master the complete development environment setup for Rock 5B+ ARM64 development, including hardware configuration, software tools, and debugging setup.

## What is Rock 5B+ Development Setup?

**What**: Rock 5B+ development setup involves configuring a complete development environment for ARM64 kernel and application development on the Rock 5B+ single-board computer, including host system configuration, target board setup, and development tools.

**Why**: Proper development setup is crucial because:

- **Hardware optimization** - Configure development environment for Rock 5B+ specific features
- **Development efficiency** - Streamline the development and testing workflow
- **Debugging capabilities** - Enable effective debugging and analysis
- **Cross-compilation** - Set up efficient cross-compilation from host to target
- **Professional development** - Create a production-ready development environment
- **Learning foundation** - Provide the basis for embedded Linux development

**When**: Development setup is needed when:

- **Starting development** - Initial setup for Rock 5B+ development
- **Environment migration** - Moving to a new development system
- **Team onboarding** - Setting up consistent development environments
- **CI/CD setup** - Configuring automated build and test systems
- **Hardware changes** - Updating setup for new hardware configurations
- **Tool updates** - Upgrading development tools and toolchains

**How**: Development setup works through:

```bash
# Example: Complete Rock 5B+ development setup
# 1. Host system preparation
sudo apt update
sudo apt install -y build-essential git curl wget

# 2. Install ARM64 cross-compilation toolchain
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y gdb-multiarch qemu-user-static

# 3. Install kernel development tools
sudo apt install -y libc6-dev-arm64-cross linux-libc-dev-arm64-cross
sudo apt install -y device-tree-compiler

# 4. Install additional development tools
sudo apt install -y u-boot-tools mkimage
sudo apt install -y parted dosfstools

# 5. Set up development environment
mkdir -p ~/rock5b-dev/{kernel,rootfs,projects}
cd ~/rock5b-dev

# 6. Clone kernel source
git clone https://github.com/torvalds/linux.git kernel
cd kernel
git checkout v5.15

# 7. Configure environment variables
cat >> ~/.bashrc << 'EOF'
# Rock 5B+ development environment
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-
export CC=aarch64-linux-gnu-gcc
export CXX=aarch64-linux-gnu-g++
export TARGET=aarch64-linux-gnu
export SYSROOT=/usr/aarch64-linux-gnu
export ROCK5B_DTB=rockchip/rk3588-rock-5b-plus.dtb
export ROCK5B_DEFCONFIG=defconfig
EOF

source ~/.bashrc
```

**Explanation**:

- **Host system setup** - Configure development machine with necessary tools
- **Cross-compilation toolchain** - Install ARM64 development tools
- **Kernel development** - Set up kernel source and build environment
- **Environment configuration** - Configure development environment variables
- **Project organization** - Create structured development workspace

**Where**: Development setup is used in:

- **Embedded Linux development** - IoT devices and single-board computers
- **Kernel development** - Custom kernel builds and modifications
- **Driver development** - Device driver implementation and testing
- **Application development** - Cross-platform application development
- **Rock 5B+** - ARM64 single-board computer development

## Hardware Requirements

**What**: Rock 5B+ development requires specific hardware components and peripherals to create a complete development environment.

**Why**: Understanding hardware requirements is important because:

- **System compatibility** - Ensure all components work together
- **Performance optimization** - Choose hardware that supports development needs
- **Debugging capabilities** - Enable effective debugging and analysis
- **Development efficiency** - Optimize hardware for development workflow
- **Cost optimization** - Balance performance and cost for development needs

**How**: Hardware requirements include:

### Rock 5B+ Board Specifications

```bash
# Example: Rock 5B+ hardware specifications
# SoC: Rockchip RK3588
# CPU: 4x ARM Cortex-A76 @ 2.4GHz + 4x ARM Cortex-A55 @ 1.8GHz
# GPU: Mali-G610 MP4
# Memory: 4GB/8GB/16GB LPDDR4X
# Storage: eMMC 5.1, microSD, M.2 NVMe
# Connectivity: Gigabit Ethernet, WiFi 6, Bluetooth 5.0
# I/O: 40-pin GPIO, UART, SPI, I2C, USB 3.0, USB-C
# Video: HDMI 2.1, MIPI DSI, MIPI CSI
# Audio: 3.5mm jack, I2S, SPDIF

# Check hardware specifications
cat /proc/cpuinfo | grep -E "processor|model name|cpu MHz"
cat /proc/meminfo | grep MemTotal
lscpu | grep -E "Architecture|CPU|Thread|Core"
```

### Development Host Requirements

```bash
# Example: Development host requirements
# Minimum requirements:
# - CPU: x86_64, 4+ cores recommended
# - RAM: 8GB+ recommended
# - Storage: 50GB+ free space
# - OS: Linux (Ubuntu 20.04+ recommended)

# Check host system
uname -a
lscpu | grep -E "Architecture|CPU|Thread|Core"
free -h
df -h

# Recommended development setup:
# - CPU: x86_64, 8+ cores
# - RAM: 16GB+
# - Storage: 100GB+ SSD
# - OS: Ubuntu 22.04 LTS
# - Network: Gigabit Ethernet
```

### Essential Peripherals

```bash
# Example: Essential peripherals for Rock 5B+ development
# 1. Power supply: 5V/3A USB-C power adapter
# 2. Storage: microSD card (32GB+ recommended)
# 3. Display: HDMI monitor or MIPI DSI display
# 4. Input: USB keyboard and mouse
# 5. Network: Ethernet cable or WiFi
# 6. Debug: USB-to-serial adapter for UART debugging
# 7. Storage: M.2 NVMe SSD (optional, for faster storage)

# Check connected peripherals
lsusb
lsblk
lspci
dmesg | grep -i "usb\|storage\|network"
```

**Explanation**:

- **Board specifications** - Rock 5B+ hardware capabilities and features
- **Host requirements** - Development machine specifications
- **Peripheral needs** - Essential accessories for development
- **Performance considerations** - Hardware choices for optimal development
- **Cost optimization** - Balancing performance and cost

**Where**: Hardware requirements are important in:

- **Development planning** - Planning development environment setup
- **Procurement** - Purchasing development hardware
- **System design** - Designing development workflows
- **Performance optimization** - Optimizing development efficiency
- **Rock 5B+** - ARM64 development platform

## Software Toolchain Setup

**What**: Software toolchain setup involves installing and configuring all necessary development tools, compilers, and libraries for Rock 5B+ development.

**Why**: Proper toolchain setup is crucial because:

- **Development efficiency** - Streamline development and build processes
- **Cross-compilation** - Enable building for ARM64 from x86_64 hosts
- **Debugging capabilities** - Provide comprehensive debugging tools
- **Library support** - Ensure all necessary libraries are available
- **Version compatibility** - Maintain compatibility between tools and target

**How**: Software toolchain setup works through:

### Cross-Compilation Toolchain

```bash
# Example: Cross-compilation toolchain setup
# Install ARM64 cross-compilation toolchain
sudo apt update
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y gdb-multiarch

# Install additional development tools
sudo apt install -y make cmake ninja-build
sudo apt install -y git curl wget
sudo apt install -y device-tree-compiler

# Install kernel development tools
sudo apt install -y libc6-dev-arm64-cross linux-libc-dev-arm64-cross
sudo apt install -y u-boot-tools mkimage

# Verify toolchain installation
aarch64-linux-gnu-gcc --version
aarch64-linux-gnu-g++ --version
aarch64-linux-gnu-gdb --version
```

### Development Libraries

```bash
# Example: Development libraries setup
# Install target system libraries
sudo apt install -y libc6-dev-arm64-cross
sudo apt install -y libssl-dev-arm64-cross
sudo apt install -y libncurses-dev-arm64-cross
sudo apt install -y libreadline-dev-arm64-cross

# Install development headers
sudo apt install -y linux-libc-dev-arm64-cross
sudo apt install -y libc6-dev-arm64-cross

# Install additional libraries
sudo apt install -y libusb-1.0-dev-arm64-cross
sudo apt install -y libudev-dev-arm64-cross
sudo apt install -y libpthread-stubs0-dev-arm64-cross
```

### Build System Tools

```bash
# Example: Build system tools setup
# Install build tools
sudo apt install -y build-essential
sudo apt install -y cmake ninja-build
sudo apt install -y autoconf automake libtool
sudo apt install -y pkg-config

# Install version control tools
sudo apt install -y git git-lfs
sudo apt install -y subversion

# Install compression tools
sudo apt install -y zip unzip tar
sudo apt install -y xz-utils bzip2
```

**Explanation**:

- **Cross-compilation toolchain** - ARM64 development tools for x86_64 hosts
- **Development libraries** - Target-specific libraries and headers
- **Build system tools** - Tools for building and managing projects
- **Version control** - Tools for source code management
- **Compression tools** - Tools for packaging and distribution

**Where**: Software toolchain setup is used in:

- **Development environments** - Local development setups
- **CI/CD systems** - Automated build environments
- **Team environments** - Consistent development setups
- **Production systems** - Stable, tested toolchain versions
- **Rock 5B+** - ARM64 development toolchains

## Kernel Development Environment

**What**: Kernel development environment setup involves configuring the Linux kernel source, build system, and development tools for Rock 5B+ development.

**Why**: Proper kernel development setup is important because:

- **Kernel development** - Enable custom kernel builds and modifications
- **Driver development** - Support device driver implementation
- **Debugging** - Provide kernel debugging capabilities
- **Testing** - Enable kernel testing and validation
- **Professional development** - Support professional kernel development

**How**: Kernel development environment setup works through:

### Kernel Source Setup

```bash
# Example: Kernel source setup
# Create development directory
mkdir -p ~/rock5b-dev/kernel
cd ~/rock5b-dev/kernel

# Clone kernel source
git clone https://github.com/torvalds/linux.git
cd linux

# Checkout stable version
git checkout v5.15

# Create development branch
git checkout -b rock5b-dev

# Configure git
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### Kernel Configuration

```bash
# Example: Kernel configuration for Rock 5B+
# Set up environment
export ARCH=arm64
export CROSS_COMPILE=aarch64-linux-gnu-

# Configure kernel
make defconfig
make menuconfig

# Rock 5B+ specific configuration
# Enable RK3588 SoC support
CONFIG_ARCH_ROCKCHIP=y
CONFIG_ARCH_ROCKCHIP_3588=y

# Enable Mali GPU support
CONFIG_DRM_PANFROST=y
CONFIG_DRM_PANFROST_DEBUG=y

# Enable UART support
CONFIG_SERIAL_8250=y
CONFIG_SERIAL_8250_CONSOLE=y

# Enable GPIO support
CONFIG_GPIOLIB=y
CONFIG_GPIO_SYSFS=y

# Enable USB support
CONFIG_USB=y
CONFIG_USB_XHCI_HCD=y

# Enable Ethernet support
CONFIG_NET_VENDOR_REALTEK=y
CONFIG_R8169=y

# Save configuration
make savedefconfig
```

### Kernel Build System

```bash
# Example: Kernel build system setup
# Build kernel
make -j$(nproc) Image dtbs modules

# Build modules
make -j$(nproc) modules

# Install modules
make INSTALL_MOD_PATH=/path/to/rootfs modules_install

# Create device tree blob
make dtbs

# Verify build
file arch/arm64/boot/Image
ls -la arch/arm64/boot/dts/rockchip/
```

**Explanation**:

- **Kernel source** - Linux kernel source code and version management
- **Configuration** - Kernel configuration for Rock 5B+ hardware
- **Build system** - Kernel compilation and module building
- **Device tree** - Hardware description and configuration
- **Verification** - Build artifact validation

**Where**: Kernel development environment is used in:

- **Kernel development** - Custom kernel builds and modifications
- **Driver development** - Device driver implementation
- **Hardware support** - Adding support for new hardware
- **Performance tuning** - Kernel optimization for specific use cases
- **Rock 5B+** - ARM64 kernel development

## Debugging Setup

**What**: Debugging setup involves configuring debugging tools and interfaces for effective development and troubleshooting on Rock 5B+.

**Why**: Proper debugging setup is crucial because:

- **Development efficiency** - Enable faster debugging and problem resolution
- **Kernel debugging** - Support kernel-level debugging and analysis
- **Driver debugging** - Enable device driver debugging and testing
- **Application debugging** - Support user-space application debugging
- **Hardware debugging** - Enable hardware-level debugging and analysis

**How**: Debugging setup works through:

### UART Debugging

```bash
# Example: UART debugging setup
# Connect USB-to-serial adapter to Rock 5B+ UART pins
# UART pins on Rock 5B+:
# - Pin 8: GND
# - Pin 10: TX (connect to RX on adapter)
# - Pin 12: RX (connect to TX on adapter)

# Install serial communication tools
sudo apt install -y minicom screen

# Configure UART connection
sudo minicom -s
# Set device: /dev/ttyUSB0
# Set baud rate: 1500000
# Set data bits: 8
# Set parity: None
# Set stop bits: 1

# Connect to UART
sudo minicom -D /dev/ttyUSB0 -b 1500000
```

### GDB Debugging

```bash
# Example: GDB debugging setup
# Install GDB for ARM64
sudo apt install -y gdb-multiarch

# Debug kernel with KGDB
# 1. Enable KGDB in kernel configuration
CONFIG_KGDB=y
CONFIG_KGDB_SERIAL_CONSOLE=y
CONFIG_KGDB_KDB=y

# 2. Boot kernel with KGDB enabled
# Add to kernel command line: kgdboc=ttyS0,1500000

# 3. Connect GDB to kernel
gdb-multiarch vmlinux
(gdb) target remote /dev/ttyUSB0
(gdb) continue
```

### JTAG Debugging

```bash
# Example: JTAG debugging setup
# Install OpenOCD
sudo apt install -y openocd

# Install GDB with OpenOCD support
sudo apt install -y gdb-multiarch

# Configure OpenOCD for Rock 5B+
# Create openocd.cfg
cat > openocd.cfg << 'EOF'
# OpenOCD configuration for Rock 5B+
source [find interface/jlink.cfg]
source [find target/aarch64.cfg]
adapter speed 1000
init
targets
EOF

# Start OpenOCD
openocd -f openocd.cfg

# Connect GDB to OpenOCD
gdb-multiarch vmlinux
(gdb) target remote localhost:3333
(gdb) continue
```

**Explanation**:

- **UART debugging** - Serial console debugging and kernel output
- **GDB debugging** - Source-level debugging with GDB
- **JTAG debugging** - Hardware-level debugging with JTAG
- **KGDB** - Kernel debugging with GDB
- **OpenOCD** - Open On-Chip Debugger for hardware debugging

**Where**: Debugging setup is used in:

- **Kernel development** - Kernel-level debugging and analysis
- **Driver development** - Device driver debugging and testing
- **Application development** - User-space application debugging
- **Hardware debugging** - Hardware-level debugging and analysis
- **Rock 5B+** - ARM64 debugging and development

## Development Workflow

**What**: Development workflow defines the process and tools for efficient development, testing, and deployment on Rock 5B+.

**Why**: Proper development workflow is important because:

- **Development efficiency** - Streamline development and testing processes
- **Code quality** - Ensure consistent code quality and standards
- **Testing** - Enable comprehensive testing and validation
- **Deployment** - Simplify deployment and distribution
- **Collaboration** - Support team development and collaboration

**How**: Development workflow works through:

### Development Process

```bash
# Example: Development workflow
# 1. Create development branch
git checkout -b feature/my-feature

# 2. Develop and test locally
# Make changes to code
# Test on host system
# Cross-compile for target

# 3. Test on target hardware
# Deploy to Rock 5B+
# Test functionality
# Debug issues

# 4. Commit changes
git add .
git commit -m "Add feature X"

# 5. Push to remote
git push origin feature/my-feature

# 6. Create pull request
# Review code
# Merge to main branch
```

### Testing Process

```bash
# Example: Testing workflow
# 1. Unit testing
# Test individual components
# Verify functionality

# 2. Integration testing
# Test component interactions
# Verify system behavior

# 3. Hardware testing
# Test on Rock 5B+
# Verify hardware compatibility

# 4. Performance testing
# Measure performance
# Optimize if needed

# 5. Regression testing
# Test existing functionality
# Ensure no regressions
```

### Deployment Process

```bash
# Example: Deployment workflow
# 1. Build release
# Compile optimized binaries
# Create release packages

# 2. Deploy to target
# Copy to Rock 5B+
# Install and configure

# 3. Verify deployment
# Test functionality
# Monitor performance

# 4. Document changes
# Update documentation
# Record deployment notes
```

**Explanation**:

- **Development process** - Code development and version control
- **Testing process** - Comprehensive testing and validation
- **Deployment process** - Release and deployment management
- **Quality assurance** - Code quality and standards
- **Collaboration** - Team development and code review

**Where**: Development workflow is used in:

- **Professional development** - Commercial software development
- **Open source projects** - Community-driven development
- **Team development** - Collaborative development environments
- **CI/CD systems** - Automated development and deployment
- **Rock 5B+** - ARM64 development projects

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Hardware Understanding** - You understand Rock 5B+ hardware requirements and specifications
2. **Software Setup** - You know how to set up complete development toolchains
3. **Kernel Environment** - You can configure kernel development environments
4. **Debugging Setup** - You understand debugging tools and interfaces
5. **Workflow Knowledge** - You know development processes and best practices

**Why** these concepts matter:

- **Development efficiency** enables productive and efficient development
- **Hardware knowledge** provides the foundation for embedded development
- **Software setup** ensures proper development environment configuration
- **Debugging capabilities** enable effective problem resolution
- **Workflow knowledge** supports professional development practices

**When** to use these concepts:

- **Initial setup** - When setting up new development environments
- **Development** - During active development and testing
- **Debugging** - When troubleshooting issues and problems
- **Deployment** - When deploying and distributing software
- **Maintenance** - When maintaining and updating development environments

**Where** these skills apply:

- **Embedded Linux** - Development for ARM64 embedded systems
- **Kernel development** - Custom kernel builds and modifications
- **Driver development** - Device driver implementation and testing
- **Application development** - Cross-platform application development
- **Rock 5B+** - ARM64 single-board computer development

## Next Steps

**What** you're ready for next:

After mastering Rock 5B+ development setup, you should be ready to:

1. **Learn kernel configuration** - Understand advanced kernel configuration options
2. **Study debugging techniques** - Learn advanced debugging methods and tools
3. **Explore testing methods** - Understand kernel testing and validation
4. **Begin practical development** - Start building kernel modules and drivers
5. **Understand deployment** - Learn kernel installation and deployment

**Where** to go next:

Continue with the next lesson on **"Kernel Configuration and Compilation"** to learn:

- Advanced kernel configuration options and dependencies
- Kernel compilation process and optimization
- Module compilation and installation
- Build system troubleshooting and debugging

**Why** the next lesson is important:

The next lesson builds directly on your development setup by focusing on kernel configuration and compilation. You'll learn how to optimize kernel builds and resolve common build issues.

**How** to continue learning:

1. **Practice setup** - Set up multiple development environments
2. **Experiment with tools** - Try different debugging and development tools
3. **Read documentation** - Study Rock 5B+ and ARM64 documentation
4. **Join communities** - Engage with embedded Linux developers
5. **Build projects** - Start with simple development projects

## Resources

**Official Documentation**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [ARM64 Linux Kernel](https://www.kernel.org/doc/html/latest/arm64/) - ARM64 kernel documentation
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation

**Community Resources**:

- [Rock 5B+ Community](https://forum.radxa.com/) - Community forums and support
- [ARM64 Development](https://developer.arm.com/tools-and-software/open-source-software) - ARM development tools
- [Stack Overflow](https://stackoverflow.com/questions/tagged/arm64) - Technical Q&A

**Learning Resources**:

- [Embedded Linux Development](https://www.oreilly.com/library/view/linux-device-drivers/0596005903/) - Comprehensive guide
- [ARM64 Assembly](https://developer.arm.com/documentation/den0024/latest) - ARM64 architecture reference
- [Device Tree Specification](https://www.devicetree.org/specifications/) - Device tree documentation

**Rock 5B+ Specific**:

- [Rock 5B+ Getting Started](https://wiki.radxa.com/Rock5/getting_started) - Board setup guide
- [Rock 5B+ Hardware](https://wiki.radxa.com/Rock5/hardware) - Hardware specifications
- [Rock 5B+ Software](https://wiki.radxa.com/Rock5/software) - Software and OS support

Happy learning! 🐧
