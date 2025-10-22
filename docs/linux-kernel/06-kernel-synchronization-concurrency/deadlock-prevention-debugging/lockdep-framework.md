---
sidebar_position: 2
---

# Lockdep Framework

Master the Lockdep framework in the Linux kernel, understanding how to use this powerful lock dependency validator to prevent deadlocks on the Rock 5B+ platform.

## What is Lockdep?

**What**: Lockdep (Lock Dependency Validator) is a runtime lock validation framework that detects potential deadlocks by analyzing lock dependencies and usage patterns in kernel code.

**Why**: Understanding Lockdep is crucial because:

- **Automatic detection** - Finds potential deadlocks automatically
- **Early warning** - Detects issues before they cause hangs
- **Lock dependency tracking** - Monitors all lock relationships
- **Comprehensive coverage** - Validates all locking scenarios
- **Rock 5B+ development** - Essential for ARM64 kernel development
- **Professional development** - Industry-standard debugging tool

**When**: Lockdep is used when:

- **Development** - Testing new locking code
- **Debugging** - Investigating potential deadlocks
- **Code review** - Validating lock usage
- **Testing** - Stress testing synchronization
- **Multi-core systems** - Rock 5B+ 8-core validation
- **Production** - Optional runtime validation

**How**: Lockdep works by:

- **Lock class tracking** - Classifying locks by usage
- **Dependency graph** - Building lock dependency chains
- **Chain validation** - Detecting circular dependencies
- **Context checking** - Validating lock contexts
- **Annotation support** - Custom lock annotations
- **Runtime monitoring** - Continuous validation

**Where**: Lockdep is found in:

- **Kernel core** - All kernel locking
- **Device drivers** - Driver lock validation
- **File systems** - FS locking validation
- **Network stack** - Network lock validation
- **Testing** - Development and QA
- **Rock 5B+** - ARM64 kernel debugging

## Lockdep Configuration

**What**: Lockdep requires specific kernel configuration options to be enabled for lock validation.

**Why**: Understanding Lockdep configuration is important because:

- **Feature enablement** - Activate Lockdep
- **Performance impact** - Understand overhead
- **Debug options** - Additional debugging features
- **Production use** - When to enable/disable

**How**: Lockdep configuration works through:

```bash
# Lockdep kernel configuration

# 1. Essential Lockdep options
# Enable in kernel .config:
CONFIG_PROVE_LOCKING=y          # Main lockdep functionality
CONFIG_DEBUG_LOCK_ALLOC=y       # Lock allocation debugging
CONFIG_LOCK_STAT=y              # Lock statistics
CONFIG_DEBUG_LOCKDEP=y          # Extra lockdep debugging

# 2. Additional helpful options
CONFIG_DEBUG_ATOMIC_SLEEP=y     # Detect sleeping in atomic context
CONFIG_DEBUG_MUTEXES=y          # Mutex debugging
CONFIG_DEBUG_SPINLOCK=y         # Spinlock debugging
CONFIG_DEBUG_WW_MUTEX_SLOWPATH=y # Wait-wound mutex debugging

# 3. Check if lockdep is enabled
cat /proc/config.gz | zgrep PROVE_LOCKING
# or
cat /boot/config-$(uname -r) | grep PROVE_LOCKING

# 4. Runtime lockdep control
# Disable lockdep temporarily
echo 0 > /proc/sys/kernel/lock_stat
# Enable lockdep
echo 1 > /proc/sys/kernel/lock_stat

# 5. View lockdep statistics
cat /proc/lockdep_stats

# 6. Reset lockdep statistics
echo 0 > /proc/lock_stat

# 7. Check lockdep chains
cat /proc/lockdep_chains | head -20
```

**Explanation**:

- **CONFIG_PROVE_LOCKING** - Core lockdep feature
- **CONFIG_LOCK_STAT** - Lock statistics collection
- **Runtime control** - Enable/disable via /proc
- **Statistics** - Monitor lockdep activity

## Lockdep Annotations

**What**: Lockdep provides annotations to help it understand custom locking schemes and validate them correctly.

**Why**: Understanding annotations is important because:

- **Custom locks** - Teach lockdep about new lock types
- **Complex scenarios** - Handle non-standard locking
- **Nested locks** - Properly validate nesting
- **False positives** - Suppress incorrect warnings

**How**: Lockdep annotations work through:

```c
// Example: Lockdep annotations
#include <linux/lockdep.h>

// 1. Lock class keys
static struct lock_class_key my_lock_key;

void init_custom_lock(spinlock_t *lock) {
    spin_lock_init(lock);

    // Assign lock class
    lockdep_set_class(lock, &my_lock_key);
}

// 2. Nested locking annotation
void nested_locking_example(void) {
    spinlock_t outer_lock, inner_lock;

    // Acquire outer lock
    spin_lock(&outer_lock);

    // Acquire inner lock with nesting annotation
    spin_lock_nested(&inner_lock, SINGLE_DEPTH_NESTING);

    // Critical section

    spin_unlock(&inner_lock);
    spin_unlock(&outer_lock);
}

// 3. Subclass annotation for lock ordering
enum lock_subclass {
    SUBCLASS_PARENT = 0,
    SUBCLASS_CHILD = 1,
};

void hierarchical_locking(struct node *parent, struct node *child) {
    // Lock parent first
    spin_lock_nested(&parent->lock, SUBCLASS_PARENT);

    // Lock child second
    spin_lock_nested(&child->lock, SUBCLASS_CHILD);

    // Work with both nodes

    spin_unlock(&child->lock);
    spin_unlock(&parent->lock);
}

// 4. Dynamic lock class
void dynamic_lock_class_example(struct device *dev) {
    static struct lock_class_key device_key;

    spin_lock_init(&dev->lock);
    lockdep_set_class(&dev->lock, &device_key);
}

// 5. Lock dependency annotation
void annotate_lock_dependency(void) {
    spinlock_t lock_a, lock_b;

    // Tell lockdep about expected dependency
    lock_acquire(&lock_a.dep_map, 0, 0, 0, 1, NULL, _RET_IP_);
    lock_acquire(&lock_b.dep_map, 0, 0, 0, 1, NULL, _RET_IP_);

    // Normal locking
    spin_lock(&lock_a);
    spin_lock(&lock_b);

    spin_unlock(&lock_b);
    spin_unlock(&lock_a);

    lock_release(&lock_b.dep_map, _RET_IP_);
    lock_release(&lock_a.dep_map, _RET_IP_);
}

// 6. RCU lock annotation
void rcu_lock_annotation_example(void) {
    struct data *ptr;

    // Tell lockdep we're in RCU read-side
    rcu_read_lock();

    ptr = rcu_dereference(global_ptr);
    if (ptr)
        use_data(ptr);

    rcu_read_unlock();
}

// 7. Mutex annotation for nested mutexes
void nested_mutex_example(struct node *parent, struct node *child) {
    // Annotate nesting level
    mutex_lock_nested(&parent->mutex, SUBCLASS_PARENT);
    mutex_lock_nested(&child->mutex, SUBCLASS_CHILD);

    // Work

    mutex_unlock(&child->mutex);
    mutex_unlock(&parent->mutex);
}

// 8. Lockdep assertions
void lockdep_assertion_example(spinlock_t *lock, struct mutex *mtx) {
    // Assert lock is held
    lockdep_assert_held(lock);

    // Assert IRQs are disabled
    lockdep_assert_irqs_disabled();

    // Assert in atomic context
    lockdep_assert_in_irq();

    // Assert mutex is held
    lockdep_assert_held(&mtx->dep_map);
}

// 9. Marking lock as held (for complex scenarios)
void complex_locking_scenario(spinlock_t *lock) {
    // In some complex cases, manually mark lock as held
    lock_acquire(&lock->dep_map, 0, 0, 0, 1, NULL, _RET_IP_);

    // Do complex locking logic

    lock_release(&lock->dep_map, _RET_IP_);
}
```

**Explanation**:

- **lockdep_set_class** - Assign lock class
- **spin_lock_nested** - Annotate nested locking
- **lock_acquire/release** - Manual dependency tracking
- **lockdep_assert_held** - Assert lock is held
- **Subclasses** - Distinguish lock instances

## Reading Lockdep Output

**What**: Lockdep generates detailed reports when it detects potential deadlocks, which need to be interpreted correctly.

**Why**: Understanding lockdep output is important because:

- **Problem diagnosis** - Identify the issue
- **Root cause** - Find where deadlock can occur
- **Fix guidance** - Understand how to fix
- **False positives** - Distinguish real issues

**How**: Reading lockdep output works through:

```bash
# Example lockdep output interpretation

# 1. Typical lockdep warning
=====================================================
WARNING: possible circular locking dependency detected
5.15.0 #1 Not tainted
-----------------------------------------------------
process/1234 is trying to acquire lock:
ffff88810a2b4d98 (&dev->lock){+.+.}, at: device_operation+0x42/0x100

but task is already holding lock:
ffff88810a2b4c90 (&queue->lock){+.+.}, at: queue_operation+0x1e/0x80

which lock already depends on the new lock.

the existing dependency chain (in reverse order) is:

-> #1 (&queue->lock){+.+.}:
       lock_acquire+0xc5/0x2e0
       _raw_spin_lock+0x35/0x50
       queue_operation+0x1e/0x80
       process_data+0x156/0x200

-> #0 (&dev->lock){+.+.}:
       __lock_acquire+0x1234/0x1c00
       lock_acquire+0xc5/0x2e0
       _raw_spin_lock+0x35/0x50
       device_operation+0x42/0x100

other info that might help us debug this:

 Possible unsafe locking scenario:

       CPU0                    CPU1
       ----                    ----
  lock(&queue->lock);
                               lock(&dev->lock);
                               lock(&queue->lock);
  lock(&dev->lock);

 *** DEADLOCK ***

# Interpretation:
# - Process tried to acquire dev->lock while holding queue->lock
# - But somewhere else, dev->lock was acquired before queue->lock
# - This creates circular dependency: queue->lock -> dev->lock
#                                and: dev->lock -> queue->lock
# - Fix: Always acquire locks in same order

# 2. Check for specific lock class issues
cat /proc/lockdep | grep "lock_class"

# 3. View lock dependencies
cat /proc/lockdep_chains | grep -A 10 "lock_chain"

# 4. Monitor for new lockdep warnings
dmesg -w | grep -i "lockdep\|deadlock"
```

**Explanation**:

- **Circular dependency** - Lock ordering violation
- **Dependency chain** - Shows lock acquisition history
- **Unsafe scenario** - Shows how deadlock can occur
- **Stack traces** - Shows where locks are acquired

## Rock 5B+ Lockdep Usage

**What**: Using Lockdep effectively on the Rock 5B+ ARM64 platform for multi-core lock validation.

**Why**: Understanding Rock 5B+ Lockdep is important because:

- **Multi-core validation** - 8-core lock interactions
- **ARM64 specifics** - ARM memory model considerations
- **Performance impact** - Lockdep overhead on ARM64
- **Debugging** - ARM64 debugging workflow

**How**: Rock 5B+ Lockdep involves:

```bash
# Rock 5B+ Lockdep usage and monitoring

# 1. Enable lockdep for testing
# Add to kernel command line:
# lockdep=1

# 2. Monitor lockdep activity
watch -n 1 'cat /proc/lockdep_stats'

# 3. Check for ARM64 specific lock issues
dmesg | grep -i "lock.*arm64\|lock.*aarch64"

# 4. Profile lock overhead
perf stat -e cycles,instructions,cache-misses -- ./test_locks

# 5. Check lock statistics
cat /proc/lock_stat | sort -k2 -rn | head -20

# 6. Monitor per-CPU lockdep chains
for cpu in /sys/devices/system/cpu/cpu*/; do
    echo "CPU: $cpu"
    cat $cpu/online
done

# 7. Stress test with lockdep enabled
stress-ng --cpu 8 --io 4 --vm 2 --timeout 60s

# 8. Check lockdep memory usage
cat /proc/lockdep_stats | grep "memory used"

# 9. Reset after fixing issues
echo 0 > /proc/lock_stat
echo 1 > /proc/lock_stat

# 10. ARM64 cache coherency with locks
perf stat -e l2d_cache,l2d_cache_refill -a -- ./lock_test
```

**Explanation**:

- **lockdep_stats** - Monitor lockdep activity
- **lock_stat** - Lock contention statistics
- **Stress testing** - Find race conditions
- **Memory usage** - Lockdep overhead tracking

## Key Takeaways

**What** you've accomplished:

1. **Lockdep Understanding** - You understand lockdep framework
2. **Configuration** - You know how to enable lockdep
3. **Annotations** - You can use lockdep annotations
4. **Output Reading** - You can interpret lockdep warnings
5. **Rock 5B+ Lockdep** - You know ARM64 lockdep usage

**Why** these concepts matter:

- **Deadlock prevention** - Catching issues early
- **Code quality** - Validating lock usage
- **Reliability** - Preventing production deadlocks
- **Platform knowledge** - Rock 5B+ validation

**When** to use these concepts:

- **Development** - Testing new locking code
- **Debugging** - Investigating deadlocks
- **Code review** - Validating synchronization
- **Testing** - Stress testing locks

**Where** these skills apply:

- **Kernel development** - All locking code
- **Driver development** - Driver synchronization
- **Quality assurance** - Lock validation testing
- **Rock 5B+** - ARM64 kernel development

## Next Steps

Continue with:

1. **Debugging Techniques** - Additional concurrency debugging methods

## Resources

**Official Documentation**:

- [Lockdep Design](https://www.kernel.org/doc/html/latest/locking/lockdep-design.html) - Lockdep internals
- [Lock Debugging](https://www.kernel.org/doc/html/latest/locking/lockdep.html) - Lockdep usage

**Learning Resources**:

- [Linux Kernel Development](https://www.oreilly.com/library/view/linux-kernel-development/9780768696974/) - Debugging chapter

**Rock 5B+ Specific**:

- [ARM64 Debugging](https://developer.arm.com/documentation/den0024/latest) - ARM64 debug features

Happy learning! 🐧
