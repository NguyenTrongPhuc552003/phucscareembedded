---
sidebar_position: 3
---

# OOM Handling

Master Out-Of-Memory (OOM) handling in the Linux kernel, understanding how the kernel manages memory exhaustion and how to prevent and handle OOM conditions on the Rock 5B+ platform.

## What is OOM Handling?

**What**: OOM (Out-Of-Memory) handling is the kernel's mechanism for managing situations when the system runs out of available memory, including the OOM killer that selects and terminates processes to free memory.

**Why**: Understanding OOM handling is crucial because:

- **System stability** - Preventing complete system failure
- **Resource management** - Managing limited memory
- **Process protection** - Protecting critical processes
- **Recovery** - Graceful handling of memory exhaustion
- **Rock 5B+ development** - Limited memory in embedded systems
- **Professional development** - Essential for robust systems

**When**: OOM handling is relevant when:

- **Memory exhaustion** - System runs out of memory
- **Memory pressure** - Approaching memory limits
- **Resource limits** - cgroup memory limits exceeded
- **Embedded systems** - Limited memory environments
- **Production systems** - Long-running applications
- **ARM64 platforms** - Resource-constrained devices

**How**: OOM handling works by:

- **Memory reclamation** - Attempting to free memory first
- **OOM killer** - Selecting victim process
- **Score calculation** - Determining which process to kill
- **Process termination** - Killing selected process
- **Notification** - Alerting administrators
- **Prevention** - Avoiding OOM situations

**Where**: OOM handling is found in:

- **Kernel memory management** - Core memory subsystem
- **Process management** - Process lifecycle
- **cgroup limits** - Container memory limits
- **Production systems** - All Linux systems
- **Rock 5B+** - ARM64 kernel
- **Embedded applications** - Resource-constrained systems

## OOM Killer Mechanism

**What**: The OOM killer is the kernel component that selects and terminates processes when the system runs out of memory to free up resources.

**Why**: Understanding the OOM killer is important because:

- **Process selection** - Knowing how victims are chosen
- **Protection** - Protecting critical processes
- **Tuning** - Adjusting OOM behavior
- **Debugging** - Understanding OOM events

**How**: The OOM killer works through:

```c
// Example: OOM killer concepts

// 1. OOM score calculation
// The kernel calculates an OOM score for each process based on:
// - Memory usage (higher usage = higher score)
// - Process age (newer processes score higher)
// - Process privileges (root processes score lower)
// - OOM score adjustment

// 2. OOM score adjustment interface
// Per-process OOM score adjustment (-1000 to 1000)
// -1000 = never kill (except OOM_SCORE_ADJ_MIN)
// 0 = default
// 1000 = always kill first

// Set OOM score adjustment for current process
void set_oom_score_adj(int adj) {
    // In userspace:
    // echo -1000 > /proc/self/oom_score_adj

    // In kernel:
    current->signal->oom_score_adj = adj;
}

// 3. OOM notifier registration
#include <linux/oom.h>

static int my_oom_notify(struct notifier_block *self,
                         unsigned long notused, void *param) {
    pr_warn("OOM condition detected!\n");

    // Take action (e.g., free caches)
    free_driver_caches();

    return NOTIFY_OK;
}

static struct notifier_block my_oom_nb = {
    .notifier_call = my_oom_notify,
};

int register_oom_handler(void) {
    return register_oom_notifier(&my_oom_nb);
}

void unregister_oom_handler(void) {
    unregister_oom_notifier(&my_oom_nb);
}

// 4. Memory reservation (to prevent OOM)
static void *emergency_pool;

int reserve_emergency_memory(void) {
    // Reserve memory for critical operations
    emergency_pool = kmalloc(PAGE_SIZE * 16, GFP_KERNEL);
    if (!emergency_pool)
        return -ENOMEM;

    return 0;
}

void *alloc_from_emergency_pool(size_t size) {
    // Use reserved memory when regular allocation fails
    if (size <= PAGE_SIZE * 16)
        return emergency_pool;

    return NULL;
}

// 5. Checking for memory pressure
bool is_under_memory_pressure(void) {
    // Check if system is under memory pressure
    struct zone *zone;

    for_each_populated_zone(zone) {
        if (!zone_watermark_ok(zone, 0, high_wmark_pages(zone),
                              0, 0))
            return true;
    }

    return false;
}
```

**Explanation**:

- **OOM score** - Process killing priority
- **Score adjustment** - Tuning process protection
- **OOM notifier** - Notification before OOM kill
- **Memory reservation** - Emergency memory pools
- **Memory pressure** - Detecting low memory

## OOM Prevention Strategies

**What**: OOM prevention involves techniques to avoid running out of memory, including memory limits, monitoring, and proactive management.

**Why**: Understanding prevention is important because:

- **Stability** - Preventing OOM better than handling it
- **Performance** - Avoiding disruptive OOM kills
- **Reliability** - Maintaining system availability
- **Resource planning** - Proper capacity planning

**How**: OOM prevention works through:

```bash
# OOM prevention on Rock 5B+

# 1. Set process memory limits (cgroups)
# Create memory cgroup
mkdir /sys/fs/cgroup/memory/myapp
echo 512M > /sys/fs/cgroup/memory/myapp/memory.limit_in_bytes

# Move process to cgroup
echo $PID > /sys/fs/cgroup/memory/myapp/cgroup.procs

# 2. Monitor memory usage
#!/bin/bash
while true; do
    FREE_MEM=$(cat /proc/meminfo | grep MemAvailable | awk '{print $2}')
    THRESHOLD=102400  # 100MB in KB

    if [ $FREE_MEM -lt $THRESHOLD ]; then
        echo "WARNING: Low memory! $FREE_MEM KB available"
        # Take action: clear caches, etc.
        sync
        echo 3 > /proc/sys/vm/drop_caches
    fi

    sleep 10
done

# 3. Configure vm.min_free_kbytes
# Reserve minimum free memory
echo 16384 > /proc/sys/vm/min_free_kbytes  # 16MB

# 4. Configure overcommit behavior
# 0 = heuristic (default)
# 1 = always overcommit
# 2 = never overcommit
echo 2 > /proc/sys/vm/overcommit_memory

# Set overcommit ratio (percentage)
echo 80 > /proc/sys/vm/overcommit_ratio

# 5. Enable OOM logging
echo 1 > /proc/sys/vm/oom_dump_tasks

# 6. Set panic on OOM (for critical systems)
echo 1 > /proc/sys/vm/panic_on_oom

# 7. Monitor memory pressure (PSI)
cat /proc/pressure/memory
# Example output:
# some avg10=0.00 avg60=0.00 avg300=0.00 total=0
# full avg10=0.00 avg60=0.00 avg300=0.00 total=0
```

**Explanation**:

- **Memory cgroups** - Limit per-process/container memory
- **Monitoring** - Proactive low memory detection
- **min_free_kbytes** - Reserved free memory
- **Overcommit control** - Memory allocation policy
- **Panic on OOM** - Reboot instead of killing processes

## OOM Debugging

**What**: OOM debugging involves analyzing OOM events to understand their causes and prevent future occurrences.

**Why**: Understanding OOM debugging is important because:

- **Root cause analysis** - Finding why OOM occurred
- **Prevention** - Avoiding future OOM events
- **Optimization** - Reducing memory usage
- **System tuning** - Proper configuration

**How**: OOM debugging works through:

```bash
# OOM debugging on Rock 5B+

# 1. View OOM killer messages
dmesg | grep -i "out of memory"
dmesg | grep -i "oom"

# Example OOM message:
# Out of memory: Killed process 1234 (myapp) total-vm:1048576kB,
# anon-rss:524288kB, file-rss:0kB, shmem-rss:0kB, UID:1000

# 2. Check which process was killed
journalctl -k | grep "Killed process"

# 3. View OOM scores for all processes
#!/bin/bash
echo "PID    Score  Adj  Command"
for pid in /proc/[0-9]*; do
    if [ -f $pid/oom_score ]; then
        score=$(cat $pid/oom_score)
        adj=$(cat $pid/oom_score_adj)
        cmd=$(cat $pid/comm 2>/dev/null)
        echo "$(basename $pid) $score $adj $cmd"
    fi
done | sort -k2 -rn | head -20

# 4. Analyze memory usage before OOM
cat /var/log/syslog | grep -B 20 "Out of memory"

# 5. Monitor memory trends
#!/bin/bash
LOG="/var/log/memory_usage.log"
while true; do
    echo "$(date '+%Y-%m-%d %H:%M:%S')" >> $LOG
    cat /proc/meminfo >> $LOG
    echo "---" >> $LOG
    sleep 60
done

# 6. Check for memory leaks
# Use kmemleak as discussed in previous lesson
cat /sys/kernel/debug/kmemleak

# 7. Analyze slab usage
cat /proc/slabinfo | sort -k3 -rn | head -20
```

**Explanation**:

- **dmesg/journalctl** - OOM event logs
- **OOM scores** - Process killing priority
- **Memory trends** - Historical analysis
- **Slab analysis** - Kernel memory usage

## Rock 5B+ OOM Handling

**What**: OOM handling on Rock 5B+ requires special considerations due to ARM64 architecture and limited memory in embedded systems.

**Why**: Understanding Rock 5B+ OOM handling is important because:

- **Limited memory** - 4GB-16GB typical RAM
- **Embedded constraints** - No swap typically
- **Production stability** - Critical for long-running systems
- **ARM64 specifics** - Platform considerations

**How**: Rock 5B+ OOM handling involves:

```bash
# Rock 5B+ specific OOM configuration

# 1. Recommended sysctl settings for embedded
cat > /etc/sysctl.d/99-oom-rock5b.conf << EOF
# Reserve 32MB minimum free memory
vm.min_free_kbytes = 32768

# Disable overcommit for stability
vm.overcommit_memory = 2
vm.overcommit_ratio = 80

# OOM killer tuning
vm.oom_dump_tasks = 1
vm.oom_kill_allocating_task = 0

# Memory pressure notification
vm.watermark_scale_factor = 10
EOF

sysctl -p /etc/sysctl.d/99-oom-rock5b.conf

# 2. Set up OOM monitoring service
cat > /usr/local/bin/oom-monitor.sh << 'EOF'
#!/bin/bash
ALERT_THRESHOLD=204800  # 200MB

while true; do
    AVAIL=$(cat /proc/meminfo | grep MemAvailable | awk '{print $2}')

    if [ $AVAIL -lt $ALERT_THRESHOLD ]; then
        logger -p user.warn "Low memory: ${AVAIL}KB available"

        # Clear caches if very low
        if [ $AVAIL -lt 102400 ]; then
            sync
            echo 3 > /proc/sys/vm/drop_caches
            logger "Cleared page cache due to low memory"
        fi
    fi

    sleep 30
done
EOF

chmod +x /usr/local/bin/oom-monitor.sh

# 3. Create systemd service
cat > /etc/systemd/system/oom-monitor.service << EOF
[Unit]
Description=OOM Monitor for Rock 5B+
After=multi-user.target

[Service]
Type=simple
ExecStart=/usr/local/bin/oom-monitor.sh
Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl enable oom-monitor.service
systemctl start oom-monitor.service

# 4. Protect critical processes
# Set negative OOM score for critical daemons
for pid in $(pgrep sshd); do
    echo -1000 > /proc/$pid/oom_score_adj
done

# 5. Monitor memory pressure
watch -n 1 'cat /proc/pressure/memory'
```

**Explanation**:

- **sysctl tuning** - Optimized for embedded
- **OOM monitoring** - Proactive memory management
- **Process protection** - Protect critical services
- **Memory pressure** - Early warning system

## Key Takeaways

**What** you've accomplished:

1. **OOM Understanding** - You understand OOM handling mechanism
2. **OOM Killer** - You know how the OOM killer works
3. **Prevention** - You can prevent OOM conditions
4. **Debugging** - You can analyze OOM events
5. **Rock 5B+ OOM** - You understand embedded system considerations

**Why** these concepts matter:

- **System stability** - Preventing catastrophic failures
- **Reliability** - Maintaining system availability
- **Resource management** - Proper memory planning
- **Platform knowledge** - Embedded constraints

**When** to use these concepts:

- **System configuration** - Setting up new systems
- **Debugging** - Investigating OOM events
- **Monitoring** - Proactive system management
- **Production** - Long-running embedded systems

**Where** these skills apply:

- **System administration** - All Linux systems
- **Embedded development** - Resource-constrained platforms
- **Production systems** - High-availability systems
- **Rock 5B+** - ARM64 embedded development

## Next Steps

You've completed Chapter 5: Advanced Memory Management! Continue with:

1. **Chapter 6: Kernel Synchronization and Concurrency** - Master synchronization primitives and lock-free programming

## Resources

**Official Documentation**:

- [OOM Killer](https://www.kernel.org/doc/html/latest/admin-guide/mm/concepts.html#oom-killer) - OOM killer documentation
- [cgroups](https://www.kernel.org/doc/html/latest/admin-guide/cgroup-v2.html) - Control groups

**Learning Resources**:

- [Understanding the Linux Kernel](https://www.oreilly.com/library/view/understanding-the-linux/0596005652/) - Memory management

**Rock 5B+ Specific**:

- [ARM64 Memory](https://developer.arm.com/documentation/den0024/latest) - ARM64 memory management

Happy learning! 🐧
