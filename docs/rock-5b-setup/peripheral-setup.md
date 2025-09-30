# Rock 5B+ Peripheral Setup Guide

Complete guide to setting up and configuring peripherals on the Rock 5B+ development board.

## Introduction

The Rock 5B+ offers extensive peripheral connectivity through GPIO, I2C, SPI, UART, and other interfaces. This guide covers the setup and configuration of various peripherals for embedded development projects.

## GPIO Configuration

### 1. Basic GPIO Setup

```bash
# Enable GPIO interface
echo 18 > /sys/class/gpio/export
echo out > /sys/class/gpio/gpio18/direction

# Set GPIO value
echo 1 > /sys/class/gpio/gpio18/value
echo 0 > /sys/class/gpio/gpio18/value

# Read GPIO value
cat /sys/class/gpio/gpio18/value

# Unexport when done
echo 18 > /sys/class/gpio/unexport
```

### 2. GPIO Programming in C

```c
// gpio_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>

#define GPIO_PATH "/sys/class/gpio"
#define GPIO_PIN 18

int export_gpio(int pin) {
    char path[50];
    int fd;
    
    sprintf(path, "%s/export", GPIO_PATH);
    fd = open(path, O_WRONLY);
    if (fd < 0) {
        perror("Failed to open export file");
        return -1;
    }
    
    char pin_str[10];
    sprintf(pin_str, "%d", pin);
    write(fd, pin_str, strlen(pin_str));
    close(fd);
    
    return 0;
}

int set_gpio_direction(int pin, const char* direction) {
    char path[50];
    int fd;
    
    sprintf(path, "%s/gpio%d/direction", GPIO_PATH, pin);
    fd = open(path, O_WRONLY);
    if (fd < 0) {
        perror("Failed to open direction file");
        return -1;
    }
    
    write(fd, direction, strlen(direction));
    close(fd);
    
    return 0;
}

int set_gpio_value(int pin, int value) {
    char path[50];
    int fd;
    
    sprintf(path, "%s/gpio%d/value", GPIO_PATH, pin);
    fd = open(path, O_WRONLY);
    if (fd < 0) {
        perror("Failed to open value file");
        return -1;
    }
    
    char value_str[2];
    sprintf(value_str, "%d", value);
    write(fd, value_str, strlen(value_str));
    close(fd);
    
    return 0;
}

int read_gpio_value(int pin) {
    char path[50];
    int fd;
    char value;
    
    sprintf(path, "%s/gpio%d/value", GPIO_PATH, pin);
    fd = open(path, O_RDONLY);
    if (fd < 0) {
        perror("Failed to open value file");
        return -1;
    }
    
    read(fd, &value, 1);
    close(fd);
    
    return value - '0';
}

int main() {
    // Export GPIO pin
    if (export_gpio(GPIO_PIN) < 0) {
        return 1;
    }
    
    // Set as output
    if (set_gpio_direction(GPIO_PIN, "out") < 0) {
        return 1;
    }
    
    // Blink LED
    for (int i = 0; i < 10; i++) {
        set_gpio_value(GPIO_PIN, 1);
        sleep(1);
        set_gpio_value(GPIO_PIN, 0);
        sleep(1);
    }
    
    return 0;
}
```

## I2C Configuration

### 1. Enable I2C Interface

```bash
# Enable I2C in device tree
sudo nano /boot/firmware/config.txt

# Add these lines:
dtparam=i2c_arm=on
dtparam=i2c_vc=on

# Reboot to apply changes
sudo reboot

# Check I2C devices
i2cdetect -y 1
```

### 2. I2C Programming

```c
// i2c_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/i2c-dev.h>

#define I2C_DEVICE "/dev/i2c-1"
#define I2C_ADDRESS 0x48

int i2c_write_byte(int fd, unsigned char reg, unsigned char data) {
    unsigned char buffer[2];
    buffer[0] = reg;
    buffer[1] = data;
    
    if (write(fd, buffer, 2) != 2) {
        perror("Failed to write to I2C device");
        return -1;
    }
    
    return 0;
}

int i2c_read_byte(int fd, unsigned char reg) {
    unsigned char buffer[1];
    buffer[0] = reg;
    
    if (write(fd, buffer, 1) != 1) {
        perror("Failed to write register address");
        return -1;
    }
    
    if (read(fd, buffer, 1) != 1) {
        perror("Failed to read from I2C device");
        return -1;
    }
    
    return buffer[0];
}

int main() {
    int fd;
    
    // Open I2C device
    fd = open(I2C_DEVICE, O_RDWR);
    if (fd < 0) {
        perror("Failed to open I2C device");
        return 1;
    }
    
    // Set I2C slave address
    if (ioctl(fd, I2C_SLAVE, I2C_ADDRESS) < 0) {
        perror("Failed to set I2C slave address");
        close(fd);
        return 1;
    }
    
    // Write to register
    if (i2c_write_byte(fd, 0x00, 0x55) < 0) {
        close(fd);
        return 1;
    }
    
    // Read from register
    int value = i2c_read_byte(fd, 0x00);
    if (value < 0) {
        close(fd);
        return 1;
    }
    
    printf("Read value: 0x%02x\n", value);
    
    close(fd);
    return 0;
}
```

## SPI Configuration

### 1. Enable SPI Interface

```bash
# Enable SPI in device tree
sudo nano /boot/firmware/config.txt

# Add these lines:
dtparam=spi=on
dtoverlay=spi1-1cs

# Reboot to apply changes
sudo reboot

# Check SPI devices
ls /dev/spi*
```

### 2. SPI Programming

```c
// spi_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/spi/spidev.h>

#define SPI_DEVICE "/dev/spidev0.0"
#define SPI_MODE 0
#define SPI_BITS_PER_WORD 8
#define SPI_SPEED 1000000

int spi_transfer(int fd, unsigned char* tx_buffer, unsigned char* rx_buffer, int length) {
    struct spi_ioc_transfer transfer;
    
    transfer.tx_buf = (unsigned long)tx_buffer;
    transfer.rx_buf = (unsigned long)rx_buffer;
    transfer.len = length;
    transfer.speed_hz = SPI_SPEED;
    transfer.bits_per_word = SPI_BITS_PER_WORD;
    transfer.delay_usecs = 0;
    
    if (ioctl(fd, SPI_IOC_MESSAGE(1), &transfer) < 0) {
        perror("Failed to perform SPI transfer");
        return -1;
    }
    
    return 0;
}

int main() {
    int fd;
    unsigned char tx_buffer[2] = {0x01, 0x02};
    unsigned char rx_buffer[2] = {0};
    
    // Open SPI device
    fd = open(SPI_DEVICE, O_RDWR);
    if (fd < 0) {
        perror("Failed to open SPI device");
        return 1;
    }
    
    // Set SPI mode
    if (ioctl(fd, SPI_IOC_WR_MODE, &SPI_MODE) < 0) {
        perror("Failed to set SPI mode");
        close(fd);
        return 1;
    }
    
    // Set bits per word
    if (ioctl(fd, SPI_IOC_WR_BITS_PER_WORD, &SPI_BITS_PER_WORD) < 0) {
        perror("Failed to set bits per word");
        close(fd);
        return 1;
    }
    
    // Set speed
    if (ioctl(fd, SPI_IOC_WR_MAX_SPEED_HZ, &SPI_SPEED) < 0) {
        perror("Failed to set SPI speed");
        close(fd);
        return 1;
    }
    
    // Perform SPI transfer
    if (spi_transfer(fd, tx_buffer, rx_buffer, 2) < 0) {
        close(fd);
        return 1;
    }
    
    printf("Received: 0x%02x 0x%02x\n", rx_buffer[0], rx_buffer[1]);
    
    close(fd);
    return 0;
}
```

## UART Configuration

### 1. Enable UART Interface

```bash
# Enable UART in device tree
sudo nano /boot/firmware/config.txt

# Add these lines:
enable_uart=1
dtoverlay=uart1

# Reboot to apply changes
sudo reboot

# Check UART devices
ls /dev/ttyS*
```

### 2. UART Programming

```c
// uart_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <termios.h>
#include <string.h>

#define UART_DEVICE "/dev/ttyS1"
#define BAUD_RATE B115200

int configure_uart(int fd) {
    struct termios tty;
    
    if (tcgetattr(fd, &tty) != 0) {
        perror("Failed to get UART attributes");
        return -1;
    }
    
    // Set baud rate
    cfsetospeed(&tty, BAUD_RATE);
    cfsetispeed(&tty, BAUD_RATE);
    
    // Configure 8N1
    tty.c_cflag &= ~PARENB;  // No parity
    tty.c_cflag &= ~CSTOPB;  // 1 stop bit
    tty.c_cflag &= ~CSIZE;   // Clear size bits
    tty.c_cflag |= CS8;      // 8 data bits
    tty.c_cflag &= ~CRTSCTS; // No hardware flow control
    tty.c_cflag |= CREAD | CLOCAL; // Enable reading
    
    // Configure input
    tty.c_iflag &= ~(IXON | IXOFF | IXANY); // No software flow control
    tty.c_iflag &= ~(ICANON | ECHO | ECHOE | ISIG); // Raw input
    
    // Configure output
    tty.c_oflag &= ~OPOST; // Raw output
    
    // Configure local
    tty.c_lflag &= ~(ICANON | ECHO | ECHOE | ISIG); // Raw input
    
    // Set timeouts
    tty.c_cc[VTIME] = 10; // 1 second timeout
    tty.c_cc[VMIN] = 0;   // Non-blocking
    
    if (tcsetattr(fd, TCSANOW, &tty) != 0) {
        perror("Failed to set UART attributes");
        return -1;
    }
    
    return 0;
}

int main() {
    int fd;
    char buffer[256];
    
    // Open UART device
    fd = open(UART_DEVICE, O_RDWR | O_NOCTTY | O_SYNC);
    if (fd < 0) {
        perror("Failed to open UART device");
        return 1;
    }
    
    // Configure UART
    if (configure_uart(fd) < 0) {
        close(fd);
        return 1;
    }
    
    // Send data
    const char* message = "Hello from Rock 5B+!\n";
    write(fd, message, strlen(message));
    
    // Read data
    int bytes_read = read(fd, buffer, sizeof(buffer) - 1);
    if (bytes_read > 0) {
        buffer[bytes_read] = '\0';
        printf("Received: %s", buffer);
    }
    
    close(fd);
    return 0;
}
```

## Camera Module Setup

### 1. Enable Camera Interface

```bash
# Enable camera in device tree
sudo nano /boot/firmware/config.txt

# Add these lines:
camera_auto_detect=1
dtoverlay=imx219

# Reboot to apply changes
sudo reboot

# Check camera devices
ls /dev/video*
```

### 2. Camera Programming

```c
// camera_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/videodev2.h>

#define CAMERA_DEVICE "/dev/video0"

int main() {
    int fd;
    struct v4l2_capability cap;
    
    // Open camera device
    fd = open(CAMERA_DEVICE, O_RDWR);
    if (fd < 0) {
        perror("Failed to open camera device");
        return 1;
    }
    
    // Get camera capabilities
    if (ioctl(fd, VIDIOC_QUERYCAP, &cap) < 0) {
        perror("Failed to query camera capabilities");
        close(fd);
        return 1;
    }
    
    printf("Camera: %s\n", cap.card);
    printf("Driver: %s\n", cap.driver);
    printf("Version: %d\n", cap.version);
    
    close(fd);
    return 0;
}
```

## Audio Configuration

### 1. Enable Audio Interface

```bash
# Check audio devices
aplay -l
arecord -l

# Test audio output
speaker-test -t wav -c 2

# Test audio input
arecord -f cd -d 5 test.wav
```

### 2. Audio Programming

```c
// audio_example.c
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/ioctl.h>
#include <linux/soundcard.h>

#define AUDIO_DEVICE "/dev/dsp"

int main() {
    int fd;
    int sample_rate = 44100;
    int channels = 2;
    int format = AFMT_S16_LE;
    
    // Open audio device
    fd = open(AUDIO_DEVICE, O_WRONLY);
    if (fd < 0) {
        perror("Failed to open audio device");
        return 1;
    }
    
    // Set audio parameters
    ioctl(fd, SOUND_PCM_WRITE_RATE, &sample_rate);
    ioctl(fd, SOUND_PCM_WRITE_CHANNELS, &channels);
    ioctl(fd, SOUND_PCM_WRITE_FMT, &format);
    
    // Generate sine wave
    short buffer[1024];
    for (int i = 0; i < 1024; i++) {
        buffer[i] = (short)(32767 * sin(2 * M_PI * 440 * i / sample_rate));
    }
    
    // Play audio
    write(fd, buffer, sizeof(buffer));
    
    close(fd);
    return 0;
}
```

## Network Configuration

### 1. Ethernet Setup

```bash
# Check network interfaces
ip addr show

# Configure static IP
sudo nano /etc/netplan/01-netcfg.yaml

# Add configuration:
network:
  version: 2
  ethernets:
    eth0:
      dhcp4: false
      addresses: [192.168.1.100/24]
      gateway4: 192.168.1.1
      nameservers:
        addresses: [8.8.8.8, 8.8.4.4]

# Apply configuration
sudo netplan apply
```

### 2. WiFi Setup

```bash
# Scan for networks
iwlist wlan0 scan

# Connect to WiFi
sudo wpa_supplicant -B -i wlan0 -c /etc/wpa_supplicant/wpa_supplicant.conf
sudo dhclient wlan0

# Check connection
ping -c 4 8.8.8.8
```

## Best Practices

### 1. Resource Management
- Always close file descriptors
- Use proper error handling
- Implement timeouts for operations
- Clean up resources on exit

### 2. Performance Optimization
- Use appropriate buffer sizes
- Minimize system calls
- Use non-blocking I/O when possible
- Implement proper synchronization

### 3. Security Considerations
- Validate input data
- Use proper permissions
- Implement access controls
- Monitor system resources

## Troubleshooting

### 1. Common Issues
- Permission denied errors
- Device not found errors
- Communication failures
- Performance problems

### 2. Debugging Techniques
- Check system logs
- Use debugging tools
- Monitor system resources
- Test with simple examples

## Conclusion

Proper peripheral setup is essential for embedded development on the Rock 5B+. By following this guide and implementing the provided examples, you can successfully configure and use various peripherals for your projects.

Remember to:
- Test each peripheral individually
- Document your configuration
- Use proper error handling
- Follow security best practices

## Resources

- [Rock 5B+ Hardware Documentation](https://wiki.radxa.com/Rock5/hardware)
- [Linux Device Tree](https://www.kernel.org/doc/Documentation/devicetree/)
- [GPIO Programming](https://elinux.org/GPIO)
- [I2C/SPI Programming](https://elinux.org/I2C)

Happy coding! 🔧
