---
sidebar_position: 1
---

# CPU Frequency Scaling

Master dynamic CPU frequency and voltage scaling (DVFS) to balance performance and power consumption, understanding governors, policies, and ARM64-specific power management on Rock 5B+.

## What is CPU Frequency Scaling?

**What**: CPU frequency scaling is a power management technique that dynamically adjusts CPU frequency and voltage based on system load to reduce power consumption while maintaining performance when needed.

**Why**: Understanding CPU frequency scaling is crucial because:

- **Power Efficiency**: Reduces power consumption during low utilization
- **Thermal Management**: Lowers heat generation and temperature
- **Battery Life**: Extends battery life in mobile and embedded systems
- **Cost Savings**: Reduces electricity costs in data centers
- **Performance Balance**: Maintains performance when needed
- **Environmental Impact**: Reduces carbon footprint

**When**: Frequency scaling is used when:

- **Variable Workloads**: System load varies significantly
- **Power Constraints**: Limited power budget or battery operation
- **Thermal Limits**: Need to manage system temperature
- **Idle Periods**: CPU is underutilized
- **Performance Requirements**: Balance between performance and power
- **Mobile/Embedded Systems**: Rock 5B+ and similar platforms

**How**: CPU frequency scaling works through:

```c
// Example: CPU frequency scaling framework
// CPU frequency policy structure
struct cpufreq_policy {
    unsigned int cpu;               // CPU number
    unsigned int min;               // Minimum frequency (kHz)
    unsigned int max;               // Maximum frequency (kHz)
    unsigned int cur;               // Current frequency (kHz)
    unsigned int suspend_freq;      // Suspend frequency
    unsigned int policy;            // Policy type
    struct cpufreq_governor *governor;
    void *governor_data;
    unsigned int transition_delay_us;
    bool transition_ongoing;
    struct cpufreq_frequency_table *freq_table;
    // ... more fields
};

// Frequency table entry
struct cpufreq_frequency_table {
    unsigned int driver_data;   // Driver specific data
    unsigned int frequency;     // Frequency in kHz
    unsigned int flags;        // Entry flags
};

// Governor structure
struct cpufreq_governor {
    char name[CPUFREQ_NAME_LEN];
    int (*init)(struct cpufreq_policy *policy);
    void (*exit)(struct cpufreq_policy *policy);
    int (*start)(struct cpufreq_policy *policy);
    void (*stop)(struct cpufreq_policy *policy);
    void (*limits)(struct cpufreq_policy *policy);
    int (*store_setspeed)(struct cpufreq_policy *policy,
                         unsigned int freq);
    unsigned int (*show_setspeed)(struct cpufreq_policy *policy);
    struct list_head governor_list;
    struct module *owner;
};

// Change CPU frequency
static int cpufreq_set_frequency(unsigned int cpu, unsigned int target_freq)
{
    struct cpufreq_policy *policy;
    int ret;
    
    policy = cpufreq_cpu_get(cpu);
    if (!policy)
        return -ENODEV;
    
    // Validate frequency
    if (target_freq < policy->min || target_freq > policy->max) {
        ret = -EINVAL;
        goto out;
    }
    
    // Change frequency
    ret = __cpufreq_driver_target(policy, target_freq,
                                  CPUFREQ_RELATION_L);
    
out:
    cpufreq_cpu_put(policy);
    return ret;
}
```

**Where**: Frequency scaling is essential in:

- **Mobile devices**: Smartphones and tablets
- **Embedded systems**: Rock 5B+ and IoT devices
- **Laptops**: Battery-powered systems
- **Data centers**: Server power optimization
- **Edge computing**: Power-constrained edge devices

## CPUFreq Governors

**What**: CPUFreq governors are policy plugins that determine when and how to adjust CPU frequency based on system load and performance requirements.

**Why**: Understanding governors is important because:

- **Policy Control**: Different policies for different use cases
- **Performance Tuning**: Choose appropriate governor for workload
- **Power Optimization**: Optimize power consumption
- **Custom Policies**: Implement custom scaling policies
- **Workload Adaptation**: Adapt to changing workload patterns

**How**: Governors operate through:

```c
// Example: CPUFreq governors
// Performance governor - Always maximum frequency
static int cpufreq_governor_performance(struct cpufreq_policy *policy,
                                       unsigned int event)
{
    switch (event) {
    case CPUFREQ_GOV_START:
    case CPUFREQ_GOV_LIMITS:
        pr_debug("setting to %u kHz\n", policy->max);
        __cpufreq_driver_target(policy, policy->max,
                               CPUFREQ_RELATION_H);
        break;
    }
    return 0;
}

// Powersave governor - Always minimum frequency
static int cpufreq_governor_powersave(struct cpufreq_policy *policy,
                                     unsigned int event)
{
    switch (event) {
    case CPUFREQ_GOV_START:
    case CPUFREQ_GOV_LIMITS:
        pr_debug("setting to %u kHz\n", policy->min);
        __cpufreq_driver_target(policy, policy->min,
                               CPUFREQ_RELATION_L);
        break;
    }
    return 0;
}

// Ondemand governor - Load-based scaling
struct od_cpu_dbs_info_s {
    struct cpu_dbs_info cdbs;
    unsigned int freq_lo;
    unsigned int freq_lo_delay_us;
    unsigned int freq_hi_delay_us;
    unsigned int sample_type:1;
};

static void od_check_cpu(int cpu, unsigned int load)
{
    struct od_cpu_dbs_info_s *dbs_info = &per_cpu(od_cpu_dbs_info, cpu);
    struct cpufreq_policy *policy = dbs_info->cdbs.policy;
    
    // If load is high, increase frequency
    if (load > dbs_tuners_ins.up_threshold) {
        // Increase to maximum frequency
        if (policy->cur < policy->max)
            __cpufreq_driver_target(policy, policy->max,
                                   CPUFREQ_RELATION_H);
    } else {
        // Calculate new frequency based on load
        unsigned int freq_next;
        freq_next = load * policy->max / 100;
        
        if (freq_next < policy->min)
            freq_next = policy->min;
            
        if (policy->cur != freq_next)
            __cpufreq_driver_target(policy, freq_next,
                                   CPUFREQ_RELATION_L);
    }
}

// Conservative governor - Gradual scaling
static void cs_check_cpu(int cpu, unsigned int load)
{
    struct cs_cpu_dbs_info_s *dbs_info = &per_cpu(cs_cpu_dbs_info, cpu);
    struct cpufreq_policy *policy = dbs_info->cdbs.policy;
    unsigned int freq_target;
    
    // Gradually increase frequency if load is high
    if (load > dbs_tuners_ins.up_threshold) {
        // Increase by one step
        freq_target = policy->cur + dbs_tuners_ins.freq_step;
        if (freq_target > policy->max)
            freq_target = policy->max;
    }
    // Gradually decrease frequency if load is low
    else if (load < dbs_tuners_ins.down_threshold) {
        // Decrease by one step
        freq_target = policy->cur - dbs_tuners_ins.freq_step;
        if (freq_target < policy->min)
            freq_target = policy->min;
    } else {
        freq_target = policy->cur;
    }
    
    __cpufreq_driver_target(policy, freq_target, CPUFREQ_RELATION_L);
}

// Schedutil governor - Scheduler-driven scaling
static void sugov_update_single(struct update_util_data *hook, u64 time,
                                unsigned int flags)
{
    struct sugov_cpu *sg_cpu = container_of(hook, struct sugov_cpu, update_util);
    struct sugov_policy *sg_policy = sg_cpu->sg_policy;
    unsigned long util, max;
    unsigned int next_f;
    
    // Get CPU utilization from scheduler
    util = sg_cpu->util;
    max = sg_cpu->max;
    
    // Calculate next frequency based on utilization
    next_f = get_next_freq(sg_policy, util, max);
    
    // Update frequency
    if (next_f != sg_policy->next_freq) {
        sg_policy->next_freq = next_f;
        sg_policy->work_in_progress = true;
        schedule_work(&sg_policy->work);
    }
}
```

**Explanation**:

- **Performance**: Maximum frequency always (maximum performance, high power)
- **Powersave**: Minimum frequency always (minimum power, reduced performance)
- **Ondemand**: Quickly scale up, gradually scale down (balanced)
- **Conservative**: Gradual scaling up and down (smooth transitions)
- **Schedutil**: Use scheduler utilization data (modern, efficient)

**Where**: Different governors suit different scenarios:

- **Performance**: High-performance computing, real-time systems
- **Powersave**: Battery conservation, idle systems
- **Ondemand**: General-purpose desktop and server
- **Conservative**: Smooth performance, avoid frequency jumps
- **Schedutil**: Modern systems, integrated with scheduler

## Dynamic Voltage and Frequency Scaling (DVFS)

**What**: DVFS simultaneously adjusts CPU voltage and frequency to achieve power savings while maintaining performance, as lower frequencies allow lower voltages.

**Why**: Understanding DVFS is important because:

- **Power Reduction**: Voltage reduction provides quadratic power savings
- **Thermal Benefits**: Significantly reduces heat generation
- **Efficiency**: Better power-performance tradeoff
- **Hardware Protection**: Prevents overvoltage and overheating
- **Battery Life**: Maximizes battery runtime

**How**: DVFS is implemented through:

```c
// Example: Dynamic Voltage and Frequency Scaling
// Operating Performance Point (OPP)
struct dev_pm_opp {
    struct list_head node;
    bool available;
    bool dynamic;
    bool turbo;
    bool suspend;
    unsigned long rate;      // Frequency in Hz
    unsigned long u_volt;    // Voltage in uV
    unsigned long u_volt_min;
    unsigned long u_volt_max;
    struct device_node *np;
    // ... more fields
};

// OPP table for CPU
struct cpu_opp_table {
    unsigned int freq_khz;
    unsigned long voltage_uv;
};

static struct cpu_opp_table rock5b_opp[] = {
    { .freq_khz = 408000,  .voltage_uv = 675000 },
    { .freq_khz = 600000,  .voltage_uv = 675000 },
    { .freq_khz = 816000,  .voltage_uv = 675000 },
    { .freq_khz = 1008000, .voltage_uv = 712500 },
    { .freq_khz = 1200000, .voltage_uv = 750000 },
    { .freq_khz = 1416000, .voltage_uv = 787500 },
    { .freq_khz = 1608000, .voltage_uv = 850000 },
    { .freq_khz = 1800000, .voltage_uv = 950000 },
    { .freq_khz = 2016000, .voltage_uv = 1050000 },
    { .freq_khz = 2208000, .voltage_uv = 1100000 },
    { .freq_khz = 2256000, .voltage_uv = 1100000 },
};

// Change OPP (frequency and voltage)
static int set_opp(struct device *dev, unsigned long target_freq)
{
    struct dev_pm_opp *opp;
    unsigned long old_freq, freq, old_uV, uV;
    struct regulator *reg;
    int ret;
    
    // Find OPP for target frequency
    opp = dev_pm_opp_find_freq_ceil(dev, &target_freq);
    if (IS_ERR(opp))
        return PTR_ERR(opp);
    
    freq = dev_pm_opp_get_freq(opp);
    uV = dev_pm_opp_get_voltage(opp);
    
    reg = dev_get_regulator(dev, "cpu");
    if (IS_ERR(reg))
        return PTR_ERR(reg);
    
    old_freq = clk_get_rate(dev->clk);
    old_uV = regulator_get_voltage(reg);
    
    // Scaling up: increase voltage first
    if (freq > old_freq) {
        ret = regulator_set_voltage(reg, uV, uV);
        if (ret)
            return ret;
        ret = clk_set_rate(dev->clk, freq);
    }
    // Scaling down: decrease frequency first
    else {
        ret = clk_set_rate(dev->clk, freq);
        if (ret)
            return ret;
        ret = regulator_set_voltage(reg, uV, uV);
    }
    
    return ret;
}

// Power calculation
static unsigned long calculate_power(unsigned long freq, unsigned long voltage)
{
    // Dynamic power: P = C * V^2 * f
    // C = capacitance (constant for a given CPU)
    unsigned long power_dynamic;
    
    power_dynamic = (voltage * voltage * freq) / 1000000000;
    
    return power_dynamic;
}

// Thermal throttling
static void thermal_throttle(struct cpufreq_policy *policy,
                            unsigned int temperature)
{
    unsigned int target_freq;
    
    // If temperature is too high, reduce frequency
    if (temperature > THERMAL_THRESHOLD_HIGH) {
        target_freq = policy->min;
    } else if (temperature > THERMAL_THRESHOLD_MED) {
        target_freq = policy->max * 75 / 100;
    } else {
        target_freq = policy->max;
    }
    
    __cpufreq_driver_target(policy, target_freq, CPUFREQ_RELATION_L);
}
```

**Explanation**:

- **OPP tables**: Define valid frequency-voltage pairs
- **Voltage scaling**: Adjust voltage with frequency
- **Scaling order**: Voltage before frequency when scaling up
- **Power savings**: Quadratic reduction with voltage
- **Thermal management**: Throttle frequency at high temperatures

**Where**: DVFS is critical in:

- **ARM processors**: Rock 5B+ and mobile processors
- **Mobile devices**: Smartphones and tablets
- **Embedded systems**: Power-constrained devices
- **Laptops**: Battery-powered systems
- **Data centers**: Server power optimization

## ARM64 Power Management

**What**: ARM64 provides specific power management features including CPU idle states, cluster power management, and heterogeneous multi-processing (big.LITTLE).

**Why**: Understanding ARM64 power management is important because:

- **Platform-Specific**: ARM64 has unique power features
- **Cluster Management**: Manage multiple CPU clusters
- **Big.LITTLE**: Optimize heterogeneous CPU architectures
- **Idle States**: Multiple CPU sleep states
- **Rock 5B+ Specific**: RK3588 power management

**How**: ARM64 power management works through:

```c
// Example: ARM64 power management
// CPU idle state
struct cpuidle_state {
    char name[CPUIDLE_NAME_LEN];
    char desc[CPUIDLE_DESC_LEN];
    unsigned int flags;
    unsigned int exit_latency;      // Wakeup latency (us)
    int power_usage;                // Power usage
    unsigned int target_residency;  // Minimum idle time (us)
    int (*enter)(struct cpuidle_device *dev,
                struct cpuidle_driver *drv,
                int index);
};

// ARM64 idle states for Rock 5B+
static struct cpuidle_state rk3588_idle_states[] = {
    {
        .name = "WFI",
        .desc = "Wait For Interrupt",
        .exit_latency = 1,
        .target_residency = 1,
        .power_usage = 100,
        .enter = arm64_enter_idle_state,
    },
    {
        .name = "CPU_SLEEP_0",
        .desc = "CPU Power Down",
        .exit_latency = 100,
        .target_residency = 1000,
        .power_usage = 10,
        .enter = arm64_enter_idle_state,
    },
    {
        .name = "CLUSTER_SLEEP",
        .desc = "Cluster Power Down",
        .exit_latency = 500,
        .target_residency = 5000,
        .power_usage = 1,
        .enter = arm64_enter_idle_state,
    },
};

// Enter ARM64 idle state
static int arm64_enter_idle_state(struct cpuidle_device *dev,
                                  struct cpuidle_driver *drv,
                                  int index)
{
    // Enter low-power state
    cpu_do_idle();
    
    return index;
}

// Big.LITTLE cluster management
struct cluster_info {
    unsigned int cluster_id;
    cpumask_t cpus;
    unsigned int max_freq;
    unsigned int power_efficiency;
};

static struct cluster_info clusters[] = {
    {
        .cluster_id = 0,
        .max_freq = 2400000,  // big cores (Cortex-A76)
        .power_efficiency = 70,
    },
    {
        .cluster_id = 1,
        .max_freq = 1800000,  // LITTLE cores (Cortex-A55)
        .power_efficiency = 100,
    },
};

// Task migration between clusters
static int migrate_task_cluster(struct task_struct *task, int target_cluster)
{
    struct cluster_info *cluster = &clusters[target_cluster];
    int cpu;
    
    // Find idle CPU in target cluster
    cpu = cpumask_any(&cluster->cpus);
    
    // Migrate task
    return migrate_task_to(task, cpu);
}

// Energy-aware scheduling
static int select_cpu_energy_aware(struct task_struct *task)
{
    unsigned long util = task_util(task);
    int cpu;
    
    // Use LITTLE cores for low utilization tasks
    if (util < LITTLE_THRESHOLD) {
        cpu = cpumask_any(&clusters[1].cpus);
    }
    // Use big cores for high utilization tasks
    else {
        cpu = cpumask_any(&clusters[0].cpus);
    }
    
    return cpu;
}

// CPU hotplug
static int cpu_hotplug_offline(unsigned int cpu)
{
    struct cpufreq_policy *policy;
    
    // Stop CPU frequency scaling
    policy = cpufreq_cpu_get(cpu);
    if (policy) {
        cpufreq_governor_stop(policy);
        cpufreq_cpu_put(policy);
    }
    
    // Power down CPU
    return cpu_down(cpu);
}

static int cpu_hotplug_online(unsigned int cpu)
{
    struct cpufreq_policy *policy;
    
    // Power up CPU
    int ret = cpu_up(cpu);
    if (ret)
        return ret;
    
    // Resume CPU frequency scaling
    policy = cpufreq_cpu_get(cpu);
    if (policy) {
        cpufreq_governor_start(policy);
        cpufreq_cpu_put(policy);
    }
    
    return 0;
}
```

**Explanation**:

- **Idle states**: Multiple power states with different latencies
- **Cluster management**: Control big and LITTLE clusters
- **Task migration**: Move tasks between clusters
- **Energy-aware scheduling**: Choose appropriate core for task
- **CPU hotplug**: Power on/off entire CPUs

**Where**: ARM64 power management is used in:

- **Rock 5B+**: RK3588 SoC with Cortex-A76/A55
- **Mobile devices**: Smartphones with big.LITTLE
- **Embedded systems**: ARM-based IoT devices
- **Servers**: ARM server processors
- **Edge devices**: Power-constrained edge computing

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Frequency Scaling Understanding**: You understand CPU frequency scaling
2. **Governor Knowledge**: You know different CPUFreq governors
3. **DVFS Awareness**: You understand voltage-frequency scaling
4. **ARM64 Power Management**: You know ARM64-specific features
5. **Rock 5B+ Optimization**: You can optimize Rock 5B+ power

**Why** these concepts matter:

- **Power Efficiency**: Critical for battery and power-constrained systems
- **Thermal Management**: Prevents overheating and thermal throttling
- **Cost Savings**: Reduces electricity costs
- **Environmental Impact**: Reduces carbon footprint
- **Professional Skills**: Essential for embedded and mobile systems

**When** to use these concepts:

- **Mobile Development**: Battery-powered devices
- **Embedded Systems**: Power-constrained platforms
- **Data Centers**: Server power optimization
- **Thermal Constraints**: High-temperature environments
- **Cost Reduction**: Minimizing operational costs

**Where** these skills apply:

- **Embedded Linux**: Rock 5B+ and IoT devices
- **Mobile Development**: Smartphone and tablet systems
- **Server Administration**: Data center power management
- **Edge Computing**: Power-efficient edge devices
- **Professional Development**: Systems and power engineering

## Next Steps

**What** you're ready for next:

After mastering CPU frequency scaling, you should be ready to:

1. **Learn System Sleep States**: Understand suspend and hibernation
2. **Study Device Power Management**: Manage device power states
3. **Explore Runtime PM**: Dynamic device power management
4. **Apply to Projects**: Implement power optimization

**Where** to go next:

Continue with the next lesson on **"Sleep States"** to learn:

- System suspend and resume
- Hibernation mechanisms
- Wake-up sources and events
- ARM64 system sleep states

**Why** the next lesson is important:

The next lesson builds on your frequency scaling knowledge by teaching you about system-wide sleep states, which provide even greater power savings during extended idle periods.

**How** to continue learning:

1. **Experiment with Governors**: Test different governors on Rock 5B+
2. **Monitor Power**: Use power monitoring tools
3. **Measure Impact**: Quantify power savings
4. **Study Thermal**: Understand thermal management
5. **Apply Knowledge**: Optimize real systems

## Resources

**Official Documentation**:

- [Linux Kernel Documentation](https://www.kernel.org/doc/html/latest/) - Comprehensive kernel documentation
- [CPUFreq Documentation](https://www.kernel.org/doc/html/latest/admin-guide/pm/cpufreq.html) - CPU frequency scaling
- [Power Management](https://www.kernel.org/doc/html/latest/admin-guide/pm/) - Power management guide

**Community Resources**:

- [Kernel Newbies](https://kernelnewbies.org/) - Resources for kernel developers
- [LWN.net](https://lwn.net/) - Linux news and articles
- [ARM Community](https://community.arm.com/) - ARM developer resources

**Learning Resources**:

- [Linux Kernel Development by Robert Love](https://www.oreilly.com/library/view/linux-kernel-development/9780768696794/) - Kernel development reference
- [Embedded Linux System Design](https://www.packtpub.com/product/embedded-linux-system-design-and-development/9781788992664) - Embedded systems guide
- [ARM System Developer's Guide](https://www.elsevier.com/books/arm-system-developers-guide/sloss/978-1-55860-874-0) - ARM development reference

**Rock 5B+ Specific**:

- [Rock 5B+ Documentation](https://wiki.radxa.com/Rock5) - Official board documentation
- [RK3588 Datasheet](https://www.rock-chips.com/a/en/products/RK3588/) - SoC documentation
- [ARM Power Management](https://developer.arm.com/documentation/den0022/latest/) - ARM power management guide

Happy power optimizing! ⚡🔋

