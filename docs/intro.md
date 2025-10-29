---
sidebar_position: 1
---

# Welcome to Embedded Development

Welcome to Phuc's comprehensive guide for Linux kernel development, Rust programming, embedded Linux development, and RISC-V architecture! This documentation covers everything you need to know about developing for embedded systems, with a focus on the Rock 5B+ (ARM64) and VisionFive 2 (RISC-V) development boards.

## What You'll Learn

This guide covers:

### Linux Kernel Development

- **Kernel Fundamentals**: Architecture, process/memory management, system calls, and ARM64 specifics
- **Device Drivers**: Character devices, platform drivers, DMA, interrupts, and power management
- **Real-Time Systems**: PREEMPT_RT kernel, scheduling policies, latency optimization, and real-time applications
- **Advanced Topics**: Synchronization, security hardening, performance optimization, and kernel contribution

### Rust Programming

- **Core Concepts**: Ownership, borrowing, lifetimes, and memory safety without garbage collection
- **Systems Programming**: Unsafe Rust, FFI, concurrency primitives, and async programming
- **Embedded Development**: no_std programming, bare-metal development, and hardware abstraction layers
- **Testing & Optimization**: Unit testing, profiling, benchmarking, and production applications

### Embedded Linux Development

- **System Fundamentals**: Linux architecture, cross-compilation, device drivers, and kernel development
- **Build Systems**: U-Boot bootloader, Buildroot, Yocto Project, and custom image creation
- **Networking & Protocols**: Socket programming, I2C/SPI/UART, CAN bus, and industrial protocols
- **Production Deployment**: Real-time optimization, security hardening, debugging, and case studies

### Linux Kernel on RISC-V Architecture

- **RISC-V Fundamentals**: ISA introduction, privilege levels, memory model, and standard extensions
- **Kernel Architecture**: Boot process, memory management, exception handling, and system call interface
- **Development Environment**: Cross-compilation toolchain, QEMU emulation, VisionFive 2 setup, and debugging tools
- **Kernel Modules & Drivers**: Loadable modules, device tree, platform drivers, and interrupt controllers
- **Advanced Topics**: Vector extensions, hypervisor support, security extensions, and kernel contribution

## Prerequisites

Before starting, you should have:

- Basic knowledge of Linux command line
- Understanding of programming concepts (C programming recommended for kernel development)
- Familiarity with version control (Git)
- Rock 5B+ (ARM64) or VisionFive 2 (RISC-V) development board (recommended)
- Basic understanding of computer architecture (for kernel development)

## Development Environment

We'll set up a complete development environment including:

- Cross-compilation toolchains for ARM64 and RISC-V
- Kernel development tools and debugging (GDB, KGDB, OpenOCD)
- Real-time Linux development environment
- QEMU emulation for RISC-V
- Development boards and peripherals
- Version control and CI/CD pipelines

## Getting Help

If you encounter issues:

1. Check the [Troubleshooting Guide](./getting-started/troubleshooting.md)
2. Search existing [GitHub Issues](https://github.com/nguyentrongphuc552003/phucscareembedded/issues)
3. Join our community discussions

Let's start your embedded development journey! 🚀
