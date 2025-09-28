---
sidebar_position: 1
---

# Rock 5B+ Hardware Overview

Complete hardware specifications and features of the Rock 5B+ development board.

## Specifications

### CPU & GPU
- **CPU**: ARM Cortex-A76 quad-core @ 2.4GHz
- **GPU**: Mali-G610 MP4 GPU
- **NPU**: 6 TOPS AI processing unit

### Memory & Storage
- **RAM**: 4GB/8GB/16GB LPDDR4X
- **Storage**: eMMC, microSD, M.2 NVMe
- **Boot**: U-Boot bootloader

### Connectivity
- **WiFi**: 802.11ax (WiFi 6)
- **Bluetooth**: 5.0
- **Ethernet**: Gigabit Ethernet
- **USB**: USB 3.0, USB 2.0, USB-C

### GPIO & Peripherals
- **GPIO**: 40-pin header
- **I2C**: Multiple I2C buses
- **SPI**: SPI interfaces
- **UART**: Serial communication
- **PWM**: PWM outputs

## Pinout Diagram

```
┌─────────────────────────────────────┐
│  Rock 5B+ GPIO Header (40-pin)      │
├─────────────────────────────────────┤
│  1: 3.3V   2: 5V    3: GPIO2_A0   │
│  4: 5V     5: GPIO2_A1  6: GND     │
│  7: GPIO2_A2  8: GPIO2_A3  9: GND  │
│ 10: GPIO2_A4 11: GPIO2_A5 12: GND  │
│ 13: GPIO2_A6 14: GND  15: GPIO2_A7 │
│ 16: GPIO2_B0 17: 3.3V 18: GPIO2_B1 │
│ 19: GPIO2_B2 20: GND  21: GPIO2_B3 │
│ 22: GPIO2_B4 23: GPIO2_B5 24: GND  │
│ 25: GPIO2_B6 26: GPIO2_B7 27: GND  │
│ 28: GPIO2_C0 29: GPIO2_C1 30: GND  │
│ 31: GPIO2_C2 32: GPIO2_C3 33: GND  │
│ 34: GPIO2_C4 35: GPIO2_C5 36: GND  │
│ 37: GPIO2_C6 38: GPIO2_C7 39: GND  │
│ 40: GPIO2_D0 41: GPIO2_D1 42: GND  │
└─────────────────────────────────────┘
```

## Power Requirements

- **Input**: 5V/3A (USB-C)
- **Power Consumption**: 2-8W depending on load
- **Power Management**: Built-in PMIC

## Next Steps

- [OS Installation](./os-installation.md)
- [Peripheral Setup](./peripheral-setup.md)
- [Troubleshooting](./troubleshooting.md)
