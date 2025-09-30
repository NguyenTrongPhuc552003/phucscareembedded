---
sidebar_position: 3
---

# Development Environment Setup

This guide covers setting up a complete development environment for embedded Linux and GPU development on the Rock 5B+.

## Cross-Compilation Toolchain

### 1. Install ARM64 Toolchain

```bash
# Install cross-compilation tools
sudo apt install -y gcc-aarch64-linux-gnu g++-aarch64-linux-gnu
sudo apt install -y binutils-aarch64-linux-gnu

# Verify installation
aarch64-linux-gnu-gcc --version
```

### 2. Set Up Environment Variables

```bash
# Add to ~/.bashrc
export CROSS_COMPILE=aarch64-linux-gnu-
export ARCH=arm64
export CROSS_COMPILE_PATH=/usr/bin/aarch64-linux-gnu-
```

## Kernel Development Setup

### 1. Install Kernel Development Tools

```bash
# Install kernel build dependencies
sudo apt install -y libncurses-dev libssl-dev
sudo apt install -y flex bison libelf-dev
sudo apt install -y bc rsync

# Install device tree compiler
sudo apt install -y device-tree-compiler
```

### 2. Clone Kernel Source

```bash
# Clone Rock 5B+ kernel
git clone https://github.com/radxa/kernel.git -b stable-5.10-rock5
cd kernel

# Configure for Rock 5B+
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- rockchip_linux_defconfig
```

## GPU Development Setup

### 1. Install Mali GPU Tools

```bash
# Install Mali GPU development libraries
sudo apt install -y libmali-g610-dkm libmali-g610-dkm-dev
sudo apt install -y libmali-g610-dkm-tools

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

## Debugging Tools Setup

### 1. Install GDB and OpenOCD

```bash
# Install debugging tools
sudo apt install -y gdb-multiarch openocd
sudo apt install -y gdbserver

# Install additional debugging tools
sudo apt install -y strace ltrace valgrind
sudo apt install -y perf-tools-unstable
```

### 2. Configure JTAG Debugging

```bash
# Install JTAG tools
sudo apt install -y openocd

# Create OpenOCD configuration for Rock 5B+
cat > /etc/openocd/rock5b.cfg << EOF
# Rock 5B+ OpenOCD configuration
source [find interface/jlink.cfg]
source [find target/aarch64.cfg]
EOF
```

## IDE and Editor Setup

### 1. VS Code Setup

```bash
# Install VS Code
wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
sudo apt update
sudo apt install -y code
```

### 2. Install VS Code Extensions

```bash
# Install essential extensions
code --install-extension ms-vscode.cpptools
code --install-extension ms-vscode.cmake-tools
code --install-extension ms-vscode.hexeditor
code --install-extension ms-vscode.remote-ssh
```

## Version Control Setup

### 1. Configure Git

```bash
# Set up Git
git config --global user.name "Phuc Nguyen"
git config --global user.email "your.email@example.com"

# Set up SSH keys
ssh-keygen -t ed25519 -C "your.email@example.com"
ssh-add ~/.ssh/id_ed25519
```

### 2. Set Up Repository

```bash
# Clone your project repository
git clone https://github.com/nguyentrongphuc552003/phucscareembedded.git
cd phucscareembedded
```

## Testing the Setup

### 1. Test Cross-Compilation

```bash
# Create a simple test program
cat > test.c << EOF
#include <stdio.h>
int main() {
    printf("Hello, Embedded World!\n");
    return 0;
}
EOF

# Cross-compile
aarch64-linux-gnu-gcc -o test test.c

# Verify binary
file test
```

### 2. Test GPU Access

```bash
# Test OpenCL
clinfo | grep "Device Name"

# Test Vulkan
vulkaninfo | grep "deviceName"
```

## Next Steps

- [Embedded Linux Development](../embedded-linux/kernel-development.md)
- [GPU Development](../gpu-development/mali-gpu.md)
- [C/C++ Programming](../c-cpp-programming/embedded-c.md)

## Troubleshooting

### Common Issues

**Cross-compilation fails:**
- Verify toolchain installation
- Check environment variables
- Ensure target architecture is correct

**GPU tools not working:**
- Check Mali GPU driver installation
- Verify OpenCL/Vulkan libraries
- Check device permissions

**Yocto build fails:**
- Verify all dependencies are installed
- Check disk space (need 50GB+)
- Ensure proper environment setup

For more detailed troubleshooting, see our [Troubleshooting Guide](./troubleshooting.md).
