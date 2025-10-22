---
sidebar_position: 1
---

# Capstone Project: Custom Device Driver

Build a complete, production-quality device driver for Rock 5B+ that demonstrates mastery of kernel development, incorporating driver architecture, power management, and best practices learned throughout the course.

## Project Overview

**What**: This capstone project involves developing a complete custom device driver for a peripheral on the Rock 5B+ platform, integrating all aspects of kernel development from architecture design to power management and upstream contribution.

**Why**: This project is crucial because:

- **Integration**: Combines all learned concepts
- **Real-World Application**: Practical, deployable driver
- **Portfolio**: Demonstrates professional capability
- **Complete Workflow**: Experience full development cycle
- **Career Readiness**: Industry-standard development
- **Community Contribution**: Potentially upstream contribution

**When**: This project is undertaken:

- **Course Completion**: After completing all previous lessons
- **Skill Integration**: When ready to apply integrated knowledge
- **Portfolio Building**: For professional development
- **Job Preparation**: Before seeking kernel development positions
- **Open Source Contribution**: When preparing for community participation

**How**: The project progresses through phases:

```
Project Phases:
1. Hardware Selection and Research (Week 1)
2. Driver Architecture Design (Week 1-2)
3. Core Implementation (Week 2-3)
4. Power Management Integration (Week 3)
5. Testing and Validation (Week 4)
6. Documentation (Week 4)
7. Upstream Preparation (Optional)
```

**Where**: This project applies in:

- **Professional Work**: Employment as kernel developer
- **Open Source**: Community contribution
- **Product Development**: Commercial product drivers
- **Research**: Academic kernel research
- **Personal Projects**: Rock 5B+ projects

## Hardware Selection and Requirements

**What**: Select an appropriate hardware peripheral and define project requirements, ensuring the driver will demonstrate key kernel concepts.

**Why**: Proper selection is important because:

- **Learning**: Hardware should demonstrate concepts
- **Feasibility**: Must be completable in timeframe
- **Relevance**: Should solve real problem
- **Documentation**: Hardware must have documentation
- **Testing**: Must be testable on Rock 5B+

**How**: Hardware is selected through:

```
Hardware Selection Criteria:
1. Availability on Rock 5B+:
   - GPIO-based devices
   - I2C peripherals (sensors, displays)
   - SPI devices (ADC, DAC, displays)
   - Platform devices (existing but needs driver)
   - USB devices
   - UART devices

2. Complexity Level:
   - Beginner: Simple GPIO device (LED, button)
   - Intermediate: I2C sensor or simple SPI device
   - Advanced: Complex SPI device, custom platform device

3. Example Project Ideas:

a) I2C Environmental Sensor Driver
   Hardware: BME680 environmental sensor
   Concepts: I2C, IIO subsystem, power management
   Features:
   - Temperature, humidity, pressure, gas resistance
   - IIO interface
   - Interrupt handling
   - Runtime PM
   - Calibration support

b) SPI LED Matrix Driver
   Hardware: MAX7219 LED matrix
   Concepts: SPI, framebuffer, DMA
   Features:
   - SPI communication
   - Framebuffer interface
   - DMA transfers
   - Brightness control
   - Power management

c) GPIO-Based Rotary Encoder Driver
   Hardware: KY-040 rotary encoder
   Concepts: GPIO, interrupts, input subsystem
   Features:
   - GPIO configuration
   - Interrupt handling
   - Input event reporting
   - Debouncing
   - Device tree support

d) Platform Driver for Custom Hardware
   Hardware: Custom FPGA peripheral
   Concepts: Platform device, memory-mapped I/O
   Features:
   - Platform device model
   - MMIO access
   - Interrupt handling
   - DMA support
   - Power domains

4. Requirements Documentation:
   - Hardware datasheet
   - Electrical characteristics
   - Communication protocol
   - Register map
   - Timing requirements
   - Power states

5. Functional Requirements:
   - Data acquisition/control
   - Error handling
   - Power management
   - Hot-plug support (if applicable)
   - Configuration interface

6. Non-Functional Requirements:
   - Performance targets
   - Power consumption limits
   - Latency requirements
   - Code quality standards
   - Documentation completeness
```

**Example: BME680 Environmental Sensor Driver Specification**

```
Hardware: BME680 Environmental Sensor
Interface: I2C (address 0x76 or 0x77)
Kernel Subsystem: IIO (Industrial I/O)

Functional Requirements:
1. Sensor Data:
   - Temperature (-40°C to +85°C, ±1°C)
   - Humidity (0-100%, ±3%)
   - Pressure (300-1100 hPa, ±1 hPa)
   - Gas resistance (0-500kΩ)

2. Features:
   - Configurable oversampling
   - Configurable IIR filter
   - One-shot and continuous modes
   - Interrupt support
   - Calibration data handling

3. Power Management:
   - Sleep mode when idle
   - Force mode for single measurement
   - Runtime PM integration

4. Interfaces:
   - IIO sysfs attributes
   - IIO buffer for continuous read
   - Device tree configuration

Non-Functional Requirements:
- Maximum measurement time: 1 second
- Power consumption: <1mA active, <0.1µA sleep
- I2C speed: up to 400kHz
- Code follows kernel coding style
- Full documentation
```

**Where**: Requirements apply to:

- **Project Planning**: Initial phase
- **Design Validation**: Ensure feasibility
- **Implementation**: Guide development
- **Testing**: Verify completeness
- **Documentation**: Specify behavior

## Driver Architecture and Design

**What**: Design the driver architecture, defining components, interfaces, and interactions with kernel subsystems.

**Why**: Proper architecture is important because:

- **Maintainability**: Well-designed code is maintainable
- **Extensibility**: Easy to add features
- **Integration**: Proper subsystem integration
- **Performance**: Efficient design
- **Quality**: Professional standard code

**How**: Architecture is designed through:

```c
// Example: BME680 driver architecture

// 1. File Structure
drivers/iio/chemical/bme680.c          // Main driver
drivers/iio/chemical/bme680_i2c.c      // I2C interface
drivers/iio/chemical/bme680_spi.c      // SPI interface (optional)
drivers/iio/chemical/bme680.h          // Internal header

// 2. Data Structures
/**
 * struct bme680_calib_data - Calibration data
 * @par_t1: Temperature calibration coefficient
 * @par_p1: Pressure calibration coefficient
 * @par_h1: Humidity calibration coefficient
 * ...
 */
struct bme680_calib_data {
	u16 par_t1;
	s16 par_t2;
	s8  par_t3;
	u16 par_p1;
	s16 par_p2;
	s8  par_p3;
	// ... more calibration parameters
};

/**
 * struct bme680_data - Device instance data
 * @dev: Device pointer
 * @regmap: Register map
 * @calib: Calibration data
 * @lock: Protection lock
 * @temp_oversample: Temperature oversampling setting
 * @press_oversample: Pressure oversampling setting
 * @humidity_oversample: Humidity oversampling setting
 * @gas_oversample: Gas oversampling setting
 * @filter: IIR filter coefficient
 */
struct bme680_data {
	struct device *dev;
	struct regmap *regmap;
	struct bme680_calib_data calib;
	struct mutex lock;
	
	/* Configuration */
	u8 temp_oversample;
	u8 press_oversample;
	u8 humidity_oversample;
	u8 gas_oversample;
	u8 filter;
	
	/* Runtime state */
	bool measuring;
	struct completion meas_complete;
};

// 3. Register Definitions
#define BME680_REG_TEMP_MSB		0x22
#define BME680_REG_TEMP_LSB		0x23
#define BME680_REG_TEMP_XLSB		0x24
#define BME680_REG_PRESS_MSB		0x1F
#define BME680_REG_PRESS_LSB		0x20
#define BME680_REG_PRESS_XLSB		0x21
#define BME680_REG_HUM_MSB		0x25
#define BME680_REG_HUM_LSB		0x26
#define BME680_REG_GAS_R_MSB		0x2A
#define BME680_REG_GAS_R_LSB		0x2B
#define BME680_REG_CTRL_MEAS		0x74
#define BME680_REG_CTRL_HUM		0x72
#define BME680_REG_CONFIG		0x75
#define BME680_REG_CTRL_GAS_1		0x71

// 4. Component Architecture
/*
 * Driver Components:
 * 
 * +------------------+
 * |   IIO Core       |
 * +------------------+
 *         |
 *         v
 * +------------------+
 * |  bme680_core     | <- Core driver logic
 * +------------------+
 *    |           |
 *    v           v
 * +------+   +------+
 * | I2C  |   | SPI  | <- Bus interfaces
 * +------+   +------+
 *    |           |
 *    v           v
 * +------------------+
 * |   Hardware       |
 * +------------------+
 */

// 5. Initialization Flow
static int bme680_probe(struct device *dev, struct regmap *regmap)
{
	struct iio_dev *indio_dev;
	struct bme680_data *data;
	int ret;
	
	/* 1. Allocate IIO device */
	indio_dev = devm_iio_device_alloc(dev, sizeof(*data));
	if (!indio_dev)
		return -ENOMEM;
	
	data = iio_priv(indio_dev);
	data->dev = dev;
	data->regmap = regmap;
	
	/* 2. Initialize hardware */
	ret = bme680_chip_init(data);
	if (ret)
		return ret;
	
	/* 3. Read calibration data */
	ret = bme680_read_calib_data(data);
	if (ret)
		return ret;
	
	/* 4. Set up IIO device */
	indio_dev->name = "bme680";
	indio_dev->channels = bme680_channels;
	indio_dev->num_channels = ARRAY_SIZE(bme680_channels);
	indio_dev->info = &bme680_info;
	indio_dev->modes = INDIO_DIRECT_MODE;
	
	/* 5. Enable runtime PM */
	pm_runtime_get_noresume(dev);
	pm_runtime_set_active(dev);
	pm_runtime_enable(dev);
	
	/* 6. Register IIO device */
	ret = devm_iio_device_register(dev, indio_dev);
	if (ret) {
		pm_runtime_disable(dev);
		pm_runtime_set_suspended(dev);
		return ret;
	}
	
	pm_runtime_mark_last_busy(dev);
	pm_runtime_put_autosuspend(dev);
	
	return 0;
}

// 6. Data Flow Architecture
/*
 * Read Operation Flow:
 * 
 * User Space (cat /sys/bus/iio/devices/iio:device0/in_temp_input)
 *      |
 *      v
 * IIO Core (iio_read_channel_raw)
 *      |
 *      v
 * Driver (bme680_read_raw)
 *      |
 *      +---> Runtime PM Resume
 *      |
 *      +---> Trigger Measurement
 *      |
 *      +---> Wait for Completion
 *      |
 *      +---> Read Raw Data
 *      |
 *      +---> Apply Calibration
 *      |
 *      +---> Runtime PM Suspend
 *      |
 *      v
 * Return Data to User
 */
```

**Explanation**:

- **File structure**: Organized, modular code
- **Data structures**: Encapsulate state and configuration
- **Register map**: Hardware interface definition
- **Component hierarchy**: Layered architecture
- **Initialization**: Proper setup sequence
- **Data flow**: Clear data path

**Where**: Architecture applies to:

- **Design Phase**: Before implementation
- **Code Review**: Validating design
- **Documentation**: Explaining design
- **Maintenance**: Understanding code
- **Extensions**: Adding features

## Implementation Best Practices

**What**: Implement the driver following kernel coding standards, best practices, and quality requirements.

**Why**: Best practices are important because:

- **Code Quality**: Professional standard code
- **Maintainability**: Easy to understand and modify
- **Upstream**: Acceptable for kernel mainline
- **Performance**: Efficient implementation
- **Reliability**: Robust error handling

**How**: Implementation follows best practices:

```c
// Example: Implementation best practices

// 1. Proper Error Handling
static int bme680_read_temp(struct bme680_data *data, int *val)
{
	int ret;
	u32 adc_temp;
	s32 var1, var2;
	
	/* Runtime PM */
	ret = pm_runtime_get_sync(data->dev);
	if (ret < 0) {
		pm_runtime_put_noidle(data->dev);
		return ret;
	}
	
	/* Trigger measurement */
	ret = bme680_set_mode(data, BME680_FORCED_MODE);
	if (ret < 0)
		goto err_pm;
	
	/* Wait for completion */
	ret = bme680_wait_for_eoc(data);
	if (ret < 0)
		goto err_pm;
	
	/* Read raw data */
	ret = bme680_read_adc_temp(data, &adc_temp);
	if (ret < 0)
		goto err_pm;
	
	/* Calculate compensated value */
	var1 = ((((adc_temp >> 3) - ((s32)data->calib.par_t1 << 1))) *
		((s32)data->calib.par_t2)) >> 11;
	var2 = (((((adc_temp >> 4) - ((s32)data->calib.par_t1)) *
		  ((adc_temp >> 4) - ((s32)data->calib.par_t1))) >> 12) *
		((s32)data->calib.par_t3)) >> 14;
	
	*val = (var1 + var2) * 5; /* Convert to millidegrees */
	
	pm_runtime_mark_last_busy(data->dev);
	pm_runtime_put_autosuspend(data->dev);
	
	return IIO_VAL_INT;
	
err_pm:
	pm_runtime_mark_last_busy(data->dev);
	pm_runtime_put_autosuspend(data->dev);
	return ret;
}

// 2. Resource Management
static int bme680_probe(struct i2c_client *client)
{
	struct iio_dev *indio_dev;
	struct bme680_data *data;
	struct regmap *regmap;
	int ret;
	
	/* Use devm_ functions for automatic cleanup */
	regmap = devm_regmap_init_i2c(client, &bme680_regmap_config);
	if (IS_ERR(regmap))
		return PTR_ERR(regmap);
	
	indio_dev = devm_iio_device_alloc(&client->dev, sizeof(*data));
	if (!indio_dev)
		return -ENOMEM;
	
	data = iio_priv(indio_dev);
	mutex_init(&data->lock);
	init_completion(&data->meas_complete);
	
	/* Request IRQ if available */
	if (client->irq) {
		ret = devm_request_threaded_irq(&client->dev, client->irq,
						NULL, bme680_irq_thread,
						IRQF_TRIGGER_RISING | IRQF_ONESHOT,
						"bme680", indio_dev);
		if (ret) {
			dev_err(&client->dev, "Failed to request IRQ\n");
			return ret;
		}
	}
	
	return bme680_core_probe(&client->dev, regmap, client->irq,
				 client->name);
}

// 3. Locking Strategy
static int bme680_read_raw(struct iio_dev *indio_dev,
			   struct iio_chan_spec const *chan,
			   int *val, int *val2, long mask)
{
	struct bme680_data *data = iio_priv(indio_dev);
	int ret;
	
	switch (mask) {
	case IIO_CHAN_INFO_RAW:
		mutex_lock(&data->lock);
		switch (chan->type) {
		case IIO_TEMP:
			ret = bme680_read_temp(data, val);
			break;
		case IIO_PRESSURE:
			ret = bme680_read_press(data, val);
			break;
		case IIO_HUMIDITYRELATIVE:
			ret = bme680_read_humidity(data, val);
			break;
		default:
			ret = -EINVAL;
		}
		mutex_unlock(&data->lock);
		return ret;
		
	case IIO_CHAN_INFO_OVERSAMPLING_RATIO:
		*val = 1 << chan->address;
		return IIO_VAL_INT;
		
	default:
		return -EINVAL;
	}
}

// 4. Power Management
static int bme680_runtime_suspend(struct device *dev)
{
	struct iio_dev *indio_dev = dev_get_drvdata(dev);
	struct bme680_data *data = iio_priv(indio_dev);
	
	/* Put device in sleep mode */
	return bme680_set_mode(data, BME680_SLEEP_MODE);
}

static int bme680_runtime_resume(struct device *dev)
{
	struct iio_dev *indio_dev = dev_get_drvdata(dev);
	struct bme680_data *data = iio_priv(indio_dev);
	
	/* Wake up device - actual measurement triggered on read */
	return 0;
}

static const struct dev_pm_ops bme680_pm_ops = {
	SET_RUNTIME_PM_OPS(bme680_runtime_suspend,
			   bme680_runtime_resume, NULL)
};

// 5. Device Tree Support
static const struct of_device_id bme680_of_match[] = {
	{ .compatible = "bosch,bme680", },
	{ }
};
MODULE_DEVICE_TABLE(of, bme680_of_match);

// 6. Module Information
MODULE_AUTHOR("Your Name <your.email@example.com>");
MODULE_DESCRIPTION("Bosch BME680 temperature, pressure, humidity & gas sensor driver");
MODULE_LICENSE("GPL v2");
```

**Explanation**:

- **Error handling**: All errors handled properly
- **Resource management**: Use devm_ for cleanup
- **Locking**: Protect shared data
- **Power management**: Runtime PM integration
- **Device tree**: Platform configuration
- **Module info**: Proper metadata

**Where**: Implementation practices apply to:

- **All code**: Throughout implementation
- **Code review**: Verification
- **Upstream**: Kernel mainline standards
- **Professional work**: Industry standards

## Testing and Validation

**What**: Comprehensive testing ensures driver correctness, reliability, and performance.

**Why**: Testing is crucial because:

- **Correctness**: Verify driver works
- **Reliability**: Ensure stability
- **Performance**: Meet requirements
- **Regression**: Prevent breakage
- **Confidence**: Ready for deployment

**How**: Testing includes:

```bash
# Testing Plan

# 1. Build Testing
# Test compilation on multiple configurations
make ARCH=arm64 defconfig
make ARCH=arm64 drivers/iio/chemical/bme680.ko
make ARCH=arm64 modules_install

# Test with different config options
make ARCH=arm64 allmodconfig
make ARCH=arm64 drivers/iio/chemical/bme680.ko

# 2. Static Analysis
# Check coding style
scripts/checkpatch.pl --strict drivers/iio/chemical/bme680.c

# Run sparse
make C=1 ARCH=arm64 drivers/iio/chemical/bme680.ko

# Run coccinelle checks
make coccicheck MODE=report COCCI=scripts/coccinelle/api/

# 3. Functional Testing
# Load module
sudo modprobe bme680

# Check device registration
ls /sys/bus/iio/devices/
cat /sys/bus/iio/devices/iio:device0/name

# Read sensor values
cat /sys/bus/iio/devices/iio:device0/in_temp_input
cat /sys/bus/iio/devices/iio:device0/in_pressure_input
cat /sys/bus/iio/devices/iio:device0/in_humidityrelative_input

# Configure settings
echo 8 > /sys/bus/iio/devices/iio:device0/in_temp_oversampling_ratio
cat /sys/bus/iio/devices/iio:device0/in_temp_oversampling_ratio

# 4. Stress Testing
# Continuous reading
while true; do
    cat /sys/bus/iio/devices/iio:device0/in_temp_input
done

# Concurrent access
for i in {1..10}; do
    (while true; do cat /sys/bus/iio/devices/iio:device0/in_temp_input; done) &
done

# 5. Power Management Testing
# Check runtime PM status
cat /sys/devices/.../power/runtime_status
cat /sys/devices/.../power/runtime_usage

# Verify auto-suspend
cat /sys/bus/iio/devices/iio:device0/in_temp_input
sleep 2
cat /sys/devices/.../power/runtime_status  # Should be "suspended"

# 6. Error Injection
# Simulate I2C errors
# echo "i2c 1 0x76" > /sys/kernel/debug/fail_i2c_transfer/trigger

# Test error handling
cat /sys/bus/iio/devices/iio:device0/in_temp_input

# 7. Memory Leak Testing
# Check for leaks with kmemleak
echo scan > /sys/kernel/debug/kmemleak
cat /sys/kernel/debug/kmemleak

# Load/unload cycle
for i in {1..100}; do
    sudo modprobe bme680
    sudo modprobe -r bme680
done

# 8. Performance Testing
# Measure read latency
time cat /sys/bus/iio/devices/iio:device0/in_temp_input

# Measure throughput
time for i in {1..1000}; do
    cat /sys/bus/iio/devices/iio:device0/in_temp_input > /dev/null
done

# 9. Kernel Log Analysis
# Check for warnings/errors
dmesg | grep -i "bme680\|warn\|error\|bug"

# 10. Test Documentation
# Create test report documenting:
# - Test environment (Rock 5B+, kernel version)
# - Test cases executed
# - Results (pass/fail)
# - Performance measurements
# - Issues found and fixed
```

**Where**: Testing applies throughout:

- **Development**: Continuous testing
- **Pre-release**: Final validation
- **Regression**: After changes
- **Certification**: For production
- **Maintenance**: Ongoing verification

## Key Takeaways

**What** you've accomplished:

1. **Complete Driver**: Full device driver implementation
2. **Best Practices**: Professional coding standards
3. **Testing**: Comprehensive validation
4. **Documentation**: Complete project documentation
5. **Portfolio**: Demonstrable professional work

**Why** this project matters:

- **Skill Integration**: Combines all learned concepts
- **Professional Work**: Industry-standard development
- **Career Ready**: Prepared for kernel positions
- **Open Source**: Community contribution capable
- **Confidence**: Proven capability

**When** to apply this:

- **Job Applications**: Portfolio demonstration
- **Open Source**: Community contribution
- **Professional Work**: Employment projects
- **Further Learning**: Foundation for specialization

**Where** these skills apply:

- **Kernel Development**: Professional positions
- **Embedded Systems**: Product development
- **Open Source**: Community participation
- **Research**: Academic work
- **Innovation**: New product development

## Resources

- [IIO Subsystem Documentation](https://www.kernel.org/doc/html/latest/driver-api/iio/index.html)
- [I2C Driver Documentation](https://www.kernel.org/doc/html/latest/i2c/writing-clients.html)
- [Device Tree Bindings](https://www.kernel.org/doc/html/latest/devicetree/bindings/)
- [Runtime PM](https://www.kernel.org/doc/html/latest/power/runtime_pm.html)

Happy driver development! 🚀💻

