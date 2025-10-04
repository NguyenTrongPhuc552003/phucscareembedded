# Rust Embedded Development - First Project Tutorial

## Getting Started with Your First Embedded Rust Project

This tutorial will guide you through creating your first embedded Rust project, following the roadmap structure.

## Prerequisites

Before starting, ensure you have:
- Rust toolchain installed (`rustup`)
- Cross-compilation target for your hardware
- Hardware development board (STM32, Raspberry Pi Pico, or ESP32)
- Basic understanding of electronics

## Project Setup

### 1. Install Required Tools

```bash
# Install Rust (if not already installed)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add embedded target (example for ARM Cortex-M)
rustup target add thumbv7em-none-eabihf

# Install cargo-generate for project templates
cargo install cargo-generate

# Install probe-rs for debugging
cargo install probe-rs --locked
```

### 2. Create New Project

```bash
# Generate a new embedded project
cargo generate --git https://github.com/rust-embedded/cortex-m-quickstart

# Or create manually
cargo new my-embedded-project
cd my-embedded-project
```

### 3. Configure Cargo.toml

```toml
[package]
name = "my-embedded-project"
version = "0.1.0"
edition = "2021"

[dependencies]
# Core embedded crates
cortex-m = "0.7"
cortex-m-rt = "0.7"
panic-halt = "0.2"

# Hardware abstraction layer
stm32f4xx-hal = "0.15"  # Adjust for your hardware

[profile.release]
opt-level = "s"  # Optimize for size
lto = true       # Link-time optimization
```

## Your First Program: LED Blinking

### 1. Create src/main.rs

```rust
#![no_std]
#![no_main]

use cortex_m_rt::entry;
use panic_halt as _;

#[entry]
fn main() -> ! {
    // Initialize peripherals
    let dp = stm32::Peripherals::take().unwrap();
    let cp = cortex_m::Peripherals::take().unwrap();
    
    // Configure GPIO for LED
    let gpioc = dp.GPIOC;
    let rcc = dp.RCC;
    
    // Enable clock for GPIOC
    rcc.ahb1enr.modify(|_, w| w.gpiocen().set_bit());
    
    // Configure PC13 as output (LED on STM32F4 Discovery)
    gpioc.moder.modify(|_, w| w.moder13().bits(0b01));
    
    // Blink LED
    loop {
        // Turn LED on
        gpioc.bsrr.write(|w| w.bs13().set_bit());
        
        // Simple delay
        for _ in 0..1_000_000 {
            cortex_m::asm::nop();
        }
        
        // Turn LED off
        gpioc.bsrr.write(|w| w.br13().set_bit());
        
        // Simple delay
        for _ in 0..1_000_000 {
            cortex_m::asm::nop();
        }
    }
}
```

### 2. Create memory.x for memory layout

```text
MEMORY
{
  FLASH : ORIGIN = 0x08000000, LENGTH = 512K
  RAM : ORIGIN = 0x20000000, LENGTH = 128K
}
```

### 3. Build and Flash

```bash
# Build the project
cargo build --release

# Flash to hardware
probe-rs download --chip STM32F407VGTx target/thumbv7em-none-eabihf/release/my-embedded-project
```

## Next Steps

1. **Add Error Handling**: Implement proper error handling with `Result` types
2. **Use Timers**: Replace simple delay loops with hardware timers
3. **Add Communication**: Implement UART, SPI, or I2C communication
4. **Sensor Integration**: Read data from sensors
5. **Real-time Features**: Add interrupt handling

## Common Issues and Solutions

### Build Errors
- **Target not found**: Add the correct target with `rustup target add <target>`
- **Linker errors**: Check memory.x file matches your hardware
- **Dependency conflicts**: Update Cargo.toml with compatible versions

### Hardware Issues
- **LED not blinking**: Check GPIO pin configuration and hardware connections
- **Flash fails**: Verify probe-rs configuration and hardware connections
- **Debugging**: Use `probe-rs` with GDB for step-by-step debugging

## Resources

- [Embedded Rust Book](https://docs.rust-embedded.org/book/)
- [STM32F4xx HAL Documentation](https://docs.rs/stm32f4xx-hal/)
- [Probe-rs Documentation](https://probe.rs/docs/)

## Project Structure

```
my-embedded-project/
├── Cargo.toml
├── memory.x
├── src/
│   └── main.rs
└── target/
    └── thumbv7em-none-eabihf/
        └── release/
```

This tutorial provides a solid foundation for your first embedded Rust project. Follow the roadmap to gradually add more complex features and capabilities.