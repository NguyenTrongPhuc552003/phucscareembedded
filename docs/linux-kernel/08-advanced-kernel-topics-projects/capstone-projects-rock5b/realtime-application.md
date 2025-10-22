---
sidebar_position: 2
---

# Capstone Project: Real-Time Application

Develop a real-time control system on Rock 5B+ that demonstrates mastery of real-time Linux concepts, PREEMPT_RT configuration, latency optimization, and deterministic performance.

## Project Overview

**What**: This capstone project involves building a complete real-time control application on the Rock 5B+ platform, incorporating PREEMPT_RT kernel, real-time scheduling, low-latency drivers, and deterministic performance.

**Why**: This project is crucial because:

- **Real-World Relevance**: Real-time systems are critical in industry
- **Skill Demonstration**: Shows real-time development mastery
- **Performance Analysis**: Demonstrates optimization skills
- **Portfolio**: Proves real-time capabilities
- **Industry Demand**: Real-time skills are highly valued
- **Integration**: Combines kernel and application development

**When**: This project is undertaken:

- **RT Knowledge**: After completing real-time Linux lessons
- **System Understanding**: With kernel fundamentals mastery
- **Performance Skills**: With profiling and tuning knowledge
- **Career Development**: When preparing for RT positions
- **Specialization**: Focusing on real-time systems

**How**: The project progresses through phases:

```
Project Phases:
1. Requirements and Design (Week 1)
2. Kernel Configuration (Week 1)
3. Driver Development (Week 2)
4. Application Implementation (Week 2-3)
5. Latency Optimization (Week 3)
6. Testing and Validation (Week 4)
7. Documentation (Week 4)
```

**Where**: This project applies in:

- **Industrial Control**: Factory automation
- **Robotics**: Robot controllers
- **Audio/Video**: Low-latency processing
- **Automotive**: Vehicle control systems
- **Aerospace**: Flight control systems

## Project Requirements and Design

**What**: Define project requirements focusing on real-time constraints, deterministic behavior, and performance targets.

**Why**: Clear requirements are important because:

- **Measurable Goals**: Quantifiable success criteria
- **Design Validation**: Guide implementation choices
- **Performance Targets**: Define optimization goals
- **Testing**: Enable verification
- **Scope Management**: Keep project focused

**How**: Requirements are defined through:

```
Example Project: Real-Time Motor Control System

1. Hardware Requirements:
   - Rock 5B+ (8-core ARM64)
   - Stepper motor with driver (e.g., A4988)
   - Rotary encoder for feedback
   - Emergency stop button
   - Status LEDs
   - GPIO connections:
     * Motor step: GPIO 3
     * Motor direction: GPIO 5
     * Enable: GPIO 7
     * Encoder A: GPIO 11
     * Encoder B: GPIO 13
     * Emergency stop: GPIO 15

2. Functional Requirements:
   FR1: Precise motor control
        - Position accuracy: ±0.1°
        - Speed range: 1-1000 RPM
        - Acceleration control
   
   FR2: Closed-loop feedback
        - Encoder position tracking
        - Position error correction
        - Velocity feedback
   
   FR3: Safety features
        - Emergency stop (< 10ms response)
        - Limit switches
        - Error detection and recovery
   
   FR4: User interface
        - Command interface (ioctl or sysfs)
        - Status reporting
        - Configuration parameters

3. Real-Time Requirements:
   RT1: Control loop frequency: 1000 Hz (1ms period)
   RT2: Maximum latency: 100μs
   RT3: Maximum jitter: 50μs
   RT4: Deadline miss rate: < 0.01%
   RT5: Emergency stop latency: < 10ms
   RT6: Deterministic behavior under load

4. Non-Functional Requirements:
   NF1: Power efficiency
   NF2: Thermal management
   NF3: Code maintainability
   NF4: Documentation completeness
   NF5: Upstream quality

5. System Architecture:
   
   User Space:
   +------------------+
   |  Control App     | <- Real-time application
   +------------------+
           |
           | ioctl/sysfs
           v
   Kernel Space:
   +------------------+
   | Motor Driver     | <- Real-time kernel driver
   +------------------+
           |
           | GPIO/IRQ
           v
   Hardware:
   +------------------+
   | Motor + Encoder  |
   +------------------+

6. Control Loop Design:
   
   1ms Control Loop:
   +------------+
   | Read       | <- Read encoder position (10μs)
   | Encoder    |
   +------------+
         |
         v
   +------------+
   | Calculate  | <- PID control algorithm (20μs)
   | Error      |
   +------------+
         |
         v
   +------------+
   | Update     | <- Generate step pulses (30μs)
   | Motor      |
   +------------+
         |
         v
   +------------+
   | Log Data   | <- Optional logging (40μs)
   +------------+
   
   Total worst-case execution time: 100μs
   Slack time: 900μs

7. Data Structures:
   
struct motor_control {
    /* Configuration */
    int32_t steps_per_rev;
    int32_t max_speed;
    int32_t acceleration;
    
    /* State */
    int64_t target_position;
    int64_t current_position;
    int32_t current_speed;
    enum motor_state state;
    
    /* PID controller */
    struct pid_controller pid;
    
    /* Statistics */
    struct rt_stats stats;
    
    /* Synchronization */
    spinlock_t lock;
    struct hrtimer timer;
};

struct rt_stats {
    u64 loop_count;
    u64 min_latency_ns;
    u64 max_latency_ns;
    u64 total_latency_ns;
    u64 deadline_misses;
    u64 last_loop_time;
};
```

**Explanation**:

- **Hardware**: Specific platform and peripherals
- **Functional**: What system must do
- **Real-time**: Timing constraints
- **Non-functional**: Quality attributes
- **Architecture**: High-level design
- **Control loop**: Detailed timing
- **Data structures**: Implementation details

**Where**: Requirements apply to:

- **Design**: Guide implementation
- **Development**: Implementation checklist
- **Testing**: Verification criteria
- **Documentation**: Project specification

## Real-Time Kernel Configuration

**What**: Configure and build a PREEMPT_RT kernel optimized for real-time performance on Rock 5B+.

**Why**: Proper configuration is important because:

- **Latency**: Minimize worst-case latency
- **Determinism**: Ensure predictable behavior
- **Performance**: Optimize for real-time
- **Reliability**: Stable operation
- **Features**: Enable required capabilities

**How**: Kernel is configured through:

```bash
# 1. Get RT-patched kernel source
git clone https://git.kernel.org/pub/scm/linux/kernel/git/rt/linux-rt-devel.git
cd linux-rt-devel
git checkout linux-6.x.y-rt

# 2. Apply Rock 5B+ device tree and config
# Use Rock 5B+ defconfig as base
make ARCH=arm64 rockchip_defconfig

# 3. Configure for real-time
make ARCH=arm64 menuconfig

# Essential RT options:
CONFIG_PREEMPT_RT=y                    # Full RT preemption
CONFIG_HIGH_RES_TIMERS=y               # High-resolution timers
CONFIG_NO_HZ_FULL=y                    # Tickless operation
CONFIG_RCU_NOCB_CPU=y                  # Offload RCU callbacks
CONFIG_IRQ_FORCED_THREADING=y          # Thread all IRQs
CONFIG_CPU_FREQ_DEFAULT_GOV_PERFORMANCE=y  # Performance governor

# Disable options that increase latency:
CONFIG_CPU_IDLE=n                      # No CPU idle (optional)
CONFIG_CPU_FREQ=n                      # No frequency scaling (optional)
CONFIG_PM=n                            # No power management (optional)
CONFIG_ACPI=n                          # No ACPI
CONFIG_APM=n                           # No APM

# Enable debugging (development only):
CONFIG_DEBUG_PREEMPT=y                 # Preemption debugging
CONFIG_PROVE_LOCKING=y                 # Lock debugging
CONFIG_DEBUG_ATOMIC_SLEEP=y            # Atomic sleep debugging

# Enable tracing:
CONFIG_FTRACE=y                        # Function tracing
CONFIG_FUNCTION_TRACER=y
CONFIG_FUNCTION_GRAPH_TRACER=y
CONFIG_STACK_TRACER=y
CONFIG_DYNAMIC_FTRACE=y
CONFIG_IRQSOFF_TRACER=y                # IRQ-off time tracer
CONFIG_PREEMPT_TRACER=y                # Preemption-off tracer

# 4. Build kernel
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- -j$(nproc)
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- modules
make ARCH=arm64 CROSS_COMPILE=aarch64-linux-gnu- dtbs

# 5. Install on Rock 5B+
sudo make ARCH=arm64 modules_install
sudo cp arch/arm64/boot/Image /boot/
sudo cp arch/arm64/boot/dts/rockchip/rk3588-rock-5b-plus.dtb /boot/

# 6. Boot parameters for RT
# Edit /boot/extlinux/extlinux.conf
APPEND ... isolcpus=2-7 nohz_full=2-7 rcu_nocbs=2-7 nosoftlockup

# Explanation:
# isolcpus=2-7      : Isolate CPUs 2-7 for RT tasks
# nohz_full=2-7     : Disable timer tick on isolated CPUs
# rcu_nocbs=2-7     : Offload RCU callbacks from isolated CPUs
# nosoftlockup      : Disable soft lockup detector

# 7. Runtime configuration
# Set RT scheduling for IRQ threads
#!/bin/bash
for irq in /proc/irq/*/; do
    for thread in $irq/*/; do
        if [ -f "$thread/sched_affinity" ]; then
            echo 1 > "$thread/sched_affinity"  # Move to CPU 0
        fi
        if [ -f "$thread/sched_priority" ]; then
            echo 49 > "$thread/sched_priority"  # RT priority
        fi
    done
done

# Set performance governor
for cpu in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do
    echo performance > $cpu
done

# Disable unnecessary services
systemctl disable bluetooth
systemctl disable cups
systemctl disable avahi-daemon

# 8. Verify RT configuration
uname -a  # Check for PREEMPT RT
cat /sys/kernel/realtime  # Should be 1
cat /proc/cmdline  # Check boot parameters
cyclictest -p 99 -m -n -i 1000 -l 100000  # Test latency
```

**Explanation**:

- **RT patch**: Full preemption support
- **Config options**: Minimize latency
- **Build process**: Cross-compilation for ARM64
- **Boot parameters**: CPU isolation and optimization
- **Runtime setup**: IRQ affinity and governors
- **Verification**: Confirm RT capabilities

**Where**: Configuration applies to:

- **Development**: Testing environment
- **Production**: Deployment system
- **Validation**: Performance testing
- **Optimization**: Tuning baseline

## Real-Time Driver Implementation

**What**: Implement a real-time device driver that provides deterministic, low-latency hardware access.

**Why**: RT driver is important because:

- **Latency**: Minimize interrupt latency
- **Determinism**: Predictable timing
- **Integration**: Work with RT application
- **Performance**: Meet timing requirements
- **Quality**: Production-ready code

**How**: RT driver is implemented:

```c
// motor_rt.c - Real-time motor control driver

#include <linux/module.h>
#include <linux/kernel.h>
#include <linux/gpio.h>
#include <linux/hrtimer.h>
#include <linux/ktime.h>
#include <linux/interrupt.h>
#include <linux/sched.h>
#include <linux/sched/rt.h>

// GPIO pin definitions
#define GPIO_MOTOR_STEP      3
#define GPIO_MOTOR_DIR       5
#define GPIO_MOTOR_ENABLE    7
#define GPIO_ENCODER_A       11
#define GPIO_ENCODER_B       13
#define GPIO_EMERGENCY_STOP  15

// Timing constants
#define CONTROL_PERIOD_NS    1000000  // 1ms = 1000000ns
#define MIN_PULSE_WIDTH_NS   1000     // 1μs minimum pulse

// Motor control structure
struct motor_rt {
    struct device *dev;
    
    // Hardware resources
    int gpio_step;
    int gpio_dir;
    int gpio_enable;
    int gpio_enc_a;
    int gpio_enc_b;
    int gpio_estop;
    int irq_enc_a;
    int irq_estop;
    
    // Control state
    s64 target_position;
    s64 current_position;
    s32 current_velocity;
    s32 target_velocity;
    
    // PID controller
    s32 kp, ki, kd;
    s64 error_sum;
    s32 last_error;
    
    // High-resolution timer
    struct hrtimer timer;
    ktime_t period;
    
    // Statistics
    u64 loop_count;
    u64 min_latency;
    u64 max_latency;
    u64 deadline_misses;
    ktime_t last_loop_start;
    
    // Synchronization
    raw_spinlock_t lock;  // Use raw_spinlock for RT
    
    // State
    bool running;
    bool emergency_stop;
};

static struct motor_rt *motor;

// Emergency stop IRQ handler
static irqreturn_t estop_irq_handler(int irq, void *dev_id)
{
    struct motor_rt *motor = dev_id;
    unsigned long flags;
    
    raw_spin_lock_irqsave(&motor->lock, flags);
    
    // Immediately stop motor
    gpio_set_value(motor->gpio_enable, 0);
    motor->emergency_stop = true;
    motor->running = false;
    
    raw_spin_unlock_irqrestore(&motor->lock, flags);
    
    pr_alert("motor_rt: Emergency stop triggered!\n");
    
    return IRQ_HANDLED;
}

// Encoder IRQ handler
static irqreturn_t encoder_irq_handler(int irq, void *dev_id)
{
    struct motor_rt *motor = dev_id;
    int enc_a, enc_b;
    
    // Read encoder pins
    enc_a = gpio_get_value(motor->gpio_enc_a);
    enc_b = gpio_get_value(motor->gpio_enc_b);
    
    // Update position based on quadrature encoding
    if (enc_a == enc_b)
        motor->current_position++;
    else
        motor->current_position--;
    
    return IRQ_HANDLED;
}

// PID controller
static s32 pid_calculate(struct motor_rt *motor, s32 error)
{
    s64 p_term, i_term, d_term;
    s32 output;
    
    // Proportional term
    p_term = (s64)motor->kp * error;
    
    // Integral term with anti-windup
    motor->error_sum += error;
    if (motor->error_sum > 1000000)
        motor->error_sum = 1000000;
    else if (motor->error_sum < -1000000)
        motor->error_sum = -1000000;
    i_term = (s64)motor->ki * motor->error_sum;
    
    // Derivative term
    d_term = (s64)motor->kd * (error - motor->last_error);
    motor->last_error = error;
    
    // Calculate output
    output = (s32)((p_term + i_term + d_term) / 1000);
    
    return output;
}

// Control loop timer callback
static enum hrtimer_restart motor_control_loop(struct hrtimer *timer)
{
    struct motor_rt *motor = container_of(timer, struct motor_rt, timer);
    ktime_t now, loop_start;
    s64 latency_ns;
    s32 error, control_output;
    unsigned long flags;
    
    loop_start = ktime_get();
    
    // Check if we missed deadline
    latency_ns = ktime_to_ns(ktime_sub(loop_start, motor->last_loop_start)) -
                 CONTROL_PERIOD_NS;
    if (latency_ns > 0) {
        motor->deadline_misses++;
        if (latency_ns > motor->max_latency)
            motor->max_latency = latency_ns;
    }
    
    raw_spin_lock_irqsave(&motor->lock, flags);
    
    if (!motor->running || motor->emergency_stop) {
        raw_spin_unlock_irqrestore(&motor->lock, flags);
        return HRTIMER_NORESTART;
    }
    
    // Calculate position error
    error = (s32)(motor->target_position - motor->current_position);
    
    // Run PID controller
    control_output = pid_calculate(motor, error);
    
    // Set direction
    if (control_output > 0)
        gpio_set_value(motor->gpio_dir, 1);
    else
        gpio_set_value(motor->gpio_dir, 0);
    
    // Generate step pulse if needed
    if (control_output != 0) {
        gpio_set_value(motor->gpio_step, 1);
        ndelay(MIN_PULSE_WIDTH_NS);
        gpio_set_value(motor->gpio_step, 0);
    }
    
    // Update statistics
    motor->loop_count++;
    now = ktime_get();
    latency_ns = ktime_to_ns(ktime_sub(now, loop_start));
    
    if (latency_ns < motor->min_latency || motor->min_latency == 0)
        motor->min_latency = latency_ns;
    if (latency_ns > motor->max_latency)
        motor->max_latency = latency_ns;
    
    motor->last_loop_start = loop_start;
    
    raw_spin_unlock_irqrestore(&motor->lock, flags);
    
    // Schedule next iteration
    hrtimer_forward_now(timer, motor->period);
    
    return HRTIMER_RESTART;
}

// Start control loop
static int motor_start(struct motor_rt *motor)
{
    unsigned long flags;
    
    raw_spin_lock_irqsave(&motor->lock, flags);
    
    if (motor->running) {
        raw_spin_unlock_irqrestore(&motor->lock, flags);
        return -EBUSY;
    }
    
    // Reset state
    motor->running = true;
    motor->emergency_stop = false;
    motor->loop_count = 0;
    motor->min_latency = 0;
    motor->max_latency = 0;
    motor->deadline_misses = 0;
    motor->error_sum = 0;
    motor->last_error = 0;
    
    // Enable motor
    gpio_set_value(motor->gpio_enable, 1);
    
    // Start control loop timer
    motor->last_loop_start = ktime_get();
    hrtimer_start(&motor->timer, motor->period, HRTIMER_MODE_REL_PINNED);
    
    raw_spin_unlock_irqrestore(&motor->lock, flags);
    
    pr_info("motor_rt: Control loop started\n");
    
    return 0;
}

// Stop control loop
static void motor_stop(struct motor_rt *motor)
{
    unsigned long flags;
    
    raw_spin_lock_irqsave(&motor->lock, flags);
    motor->running = false;
    raw_spin_unlock_irqrestore(&motor->lock, flags);
    
    hrtimer_cancel(&motor->timer);
    gpio_set_value(motor->gpio_enable, 0);
    
    pr_info("motor_rt: Control loop stopped\n");
    pr_info("motor_rt: Statistics:\n");
    pr_info("  Total loops: %llu\n", motor->loop_count);
    pr_info("  Min latency: %llu ns\n", motor->min_latency);
    pr_info("  Max latency: %llu ns\n", motor->max_latency);
    pr_info("  Deadline misses: %llu\n", motor->deadline_misses);
}

// sysfs attributes for control
static ssize_t target_position_store(struct device *dev,
                                     struct device_attribute *attr,
                                     const char *buf, size_t count)
{
    struct motor_rt *motor = dev_get_drvdata(dev);
    s64 pos;
    unsigned long flags;
    
    if (kstrtos64(buf, 10, &pos))
        return -EINVAL;
    
    raw_spin_lock_irqsave(&motor->lock, flags);
    motor->target_position = pos;
    raw_spin_unlock_irqrestore(&motor->lock, flags);
    
    return count;
}

static ssize_t target_position_show(struct device *dev,
                                    struct device_attribute *attr,
                                    char *buf)
{
    struct motor_rt *motor = dev_get_drvdata(dev);
    return sprintf(buf, "%lld\n", motor->target_position);
}

static DEVICE_ATTR_RW(target_position);

// Module init
static int __init motor_rt_init(void)
{
    int ret;
    
    motor = kzalloc(sizeof(*motor), GFP_KERNEL);
    if (!motor)
        return -ENOMEM;
    
    // Initialize GPIO pins
    motor->gpio_step = GPIO_MOTOR_STEP;
    motor->gpio_dir = GPIO_MOTOR_DIR;
    motor->gpio_enable = GPIO_MOTOR_ENABLE;
    motor->gpio_enc_a = GPIO_ENCODER_A;
    motor->gpio_enc_b = GPIO_ENCODER_B;
    motor->gpio_estop = GPIO_EMERGENCY_STOP;
    
    // Request GPIOs
    ret = gpio_request_array((struct gpio[]){
        { motor->gpio_step, GPIOF_OUT_INIT_LOW, "motor_step" },
        { motor->gpio_dir, GPIOF_OUT_INIT_LOW, "motor_dir" },
        { motor->gpio_enable, GPIOF_OUT_INIT_LOW, "motor_enable" },
        { motor->gpio_enc_a, GPIOF_IN, "encoder_a" },
        { motor->gpio_enc_b, GPIOF_IN, "encoder_b" },
        { motor->gpio_estop, GPIOF_IN, "emergency_stop" },
    }, 6);
    
    if (ret) {
        pr_err("motor_rt: Failed to request GPIOs\n");
        goto err_gpio;
    }
    
    // Setup interrupts
    motor->irq_enc_a = gpio_to_irq(motor->gpio_enc_a);
    ret = request_irq(motor->irq_enc_a, encoder_irq_handler,
                     IRQF_TRIGGER_RISING | IRQF_TRIGGER_FALLING,
                     "encoder_a", motor);
    if (ret)
        goto err_irq_enc;
    
    motor->irq_estop = gpio_to_irq(motor->gpio_estop);
    ret = request_irq(motor->irq_estop, estop_irq_handler,
                     IRQF_TRIGGER_FALLING, "emergency_stop", motor);
    if (ret)
        goto err_irq_estop;
    
    // Initialize PID parameters
    motor->kp = 1000;
    motor->ki = 100;
    motor->kd = 50;
    
    // Initialize timer
    raw_spin_lock_init(&motor->lock);
    hrtimer_init(&motor->timer, CLOCK_MONOTONIC, HRTIMER_MODE_REL_PINNED);
    motor->timer.function = motor_control_loop;
    motor->period = ktime_set(0, CONTROL_PERIOD_NS);
    
    pr_info("motor_rt: Driver initialized\n");
    return 0;
    
err_irq_estop:
    free_irq(motor->irq_enc_a, motor);
err_irq_enc:
    gpio_free_array((struct gpio[]){
        { motor->gpio_step }, { motor->gpio_dir },
        { motor->gpio_enable }, { motor->gpio_enc_a },
        { motor->gpio_enc_b }, { motor->gpio_estop },
    }, 6);
err_gpio:
    kfree(motor);
    return ret;
}

static void __exit motor_rt_exit(void)
{
    motor_stop(motor);
    
    free_irq(motor->irq_estop, motor);
    free_irq(motor->irq_enc_a, motor);
    
    gpio_free_array((struct gpio[]){
        { motor->gpio_step }, { motor->gpio_dir },
        { motor->gpio_enable }, { motor->gpio_enc_a },
        { motor->gpio_enc_b }, { motor->gpio_estop },
    }, 6);
    
    kfree(motor);
    
    pr_info("motor_rt: Driver unloaded\n");
}

module_init(motor_rt_init);
module_exit(motor_rt_exit);

MODULE_LICENSE("GPL v2");
MODULE_AUTHOR("Your Name <your.email@example.com>");
MODULE_DESCRIPTION("Real-time motor control driver");
```

**Explanation**:

- **RT primitives**: raw_spinlock, hrtimer
- **Interrupt handling**: Low-latency IRQ handlers
- **Control loop**: Deterministic timing
- **PID controller**: Position control
- **Statistics**: Performance monitoring
- **Safety**: Emergency stop handling

**Where**: RT driver applies to:

- **Control systems**: Motor, servo control
- **Data acquisition**: High-speed sampling
- **Signal processing**: Real-time audio/video
- **Communication**: Time-critical protocols

## Testing and Performance Analysis

**What**: Comprehensive testing validates real-time performance and identifies optimization opportunities.

**Why**: Testing is crucial because:

- **Verification**: Confirm RT requirements met
- **Performance**: Measure actual latency
- **Reliability**: Ensure deterministic behavior
- **Optimization**: Identify bottlenecks
- **Certification**: Document compliance

**How**: Testing includes:

```bash
# Real-Time Testing Suite

# 1. Latency Testing with cyclictest
# Basic latency test
sudo cyclictest -p 99 -m -n -i 1000 -l 100000

# Test on isolated CPUs
sudo cyclictest -p 99 -m -n -i 1000 -l 100000 -a 2-7

# With statistics
sudo cyclictest -p 99 -m -n -i 1000 -l 1000000 --histogram=200 > latency.log

# Analyze results
# Max latency should be < 100μs for this project

# 2. Stress Testing
# Run CPU stress while testing latency
sudo stress-ng --cpu 4 --io 2 --vm 1 &
sudo cyclictest -p 99 -m -n -i 1000 -l 100000

# 3. Control Loop Performance
# Load driver and start control
sudo insmod motor_rt.ko
echo 1000 > /sys/module/motor_rt/parameters/start

# Monitor performance
watch -n 1 cat /sys/module/motor_rt/parameters/statistics

# 4. Trace Analysis
# Enable function tracer
echo function_graph > /sys/kernel/debug/tracing/current_tracer
echo 1 > /sys/kernel/debug/tracing/tracing_on

# Capture trace
cat /sys/kernel/debug/tracing/trace > trace.log

# Analyze worst-case path
grep -A 20 "motor_control_loop" trace.log | head -50

# 5. IRQ Latency
# Measure IRQ response time
sudo /usr/bin/time -v cat /proc/interrupts

# Check IRQ threading
ps -eLo pid,tid,class,rtprio,ni,pri,psr,pcpu,stat,comm | grep -E 'FF|RR'

# 6. Performance Counters
# Use perf to analyze
sudo perf stat -e cycles,instructions,cache-misses,branch-misses \
    sleep 60

# Record for detailed analysis
sudo perf record -a -g sleep 60
sudo perf report

# 7. Real-Time Scheduling Analysis
# Check scheduler latency
sudo trace-cmd record -e sched_switch -e sched_wakeup sleep 10
sudo trace-cmd report > sched.log

# Analyze scheduling delays
grep "motor_control" sched.log

# 8. Memory Allocation Analysis
# Check for dynamic allocations in RT path
sudo trace-cmd record -e kmem:kmalloc -e kmem:kfree sleep 10
sudo trace-cmd report | grep motor_rt

# 9. Lock Contention Analysis
# Detect lock contention
sudo perf lock record -a sleep 10
sudo perf lock report

# 10. Test Report Generation
#!/bin/bash
# Generate comprehensive test report

echo "Real-Time Performance Test Report" > rt_report.txt
echo "=================================" >> rt_report.txt
echo "" >> rt_report.txt

echo "Test Date: $(date)" >> rt_report.txt
echo "Kernel: $(uname -r)" >> rt_report.txt
echo "Platform: Rock 5B+" >> rt_report.txt
echo "" >> rt_report.txt

echo "Latency Test Results:" >> rt_report.txt
echo "-------------------" >> rt_report.txt
sudo cyclictest -p 99 -m -n -i 1000 -l 100000 -q >> rt_report.txt
echo "" >> rt_report.txt

echo "Control Loop Statistics:" >> rt_report.txt
echo "----------------------" >> rt_report.txt
cat /sys/module/motor_rt/parameters/statistics >> rt_report.txt
echo "" >> rt_report.txt

echo "IRQ Statistics:" >> rt_report.txt
echo "--------------" >> rt_report.txt
cat /proc/interrupts | grep -E "encoder|estop" >> rt_report.txt

# Expected Results:
# - Max latency < 100μs
# - Average latency < 50μs
# - Deadline miss rate < 0.01%
# - Jitter < 50μs
# - Emergency stop < 10ms
```

**Where**: Testing applies throughout:

- **Development**: Continuous verification
- **Optimization**: Performance tuning
- **Validation**: Final certification
- **Production**: Ongoing monitoring
- **Maintenance**: Regression testing

## Key Takeaways

**What** you've accomplished:

1. **RT System**: Complete real-time control system
2. **Latency Optimization**: Achieved sub-100μs latency
3. **Determinism**: Predictable, deadline-meeting system
4. **Testing**: Comprehensive performance validation
5. **Documentation**: Complete project documentation

**Why** this project matters:

- **Industry Relevance**: Real-time systems are critical
- **Skill Demonstration**: Proves RT development capability
- **Career Value**: Highly sought-after expertise
- **Portfolio**: Impressive professional work
- **Practical Application**: Solves real problems

**When** to apply this:

- **Industrial Control**: Factory automation
- **Professional Work**: RT system development
- **Research**: RT systems research
- **Career Development**: Specialization in RT

**Where** these skills apply:

- **Industrial Automation**: Manufacturing control
- **Robotics**: Robot controllers
- **Automotive**: Vehicle systems
- **Aerospace**: Flight control
- **Medical**: Medical device control

## Resources

- [PREEMPT_RT Documentation](https://wiki.linuxfoundation.org/realtime/start)
- [Cyclictest Guide](https://wiki.linuxfoundation.org/realtime/documentation/howto/tools/cyclictest)
- [Real-Time Linux](https://www.kernel.org/doc/html/latest/scheduler/sched-rt-group.html)
- [Linux Trace Tools](https://www.kernel.org/doc/html/latest/trace/index.html)

Happy real-time development! ⏱️🎯

