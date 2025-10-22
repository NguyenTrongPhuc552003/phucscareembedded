---
sidebar_position: 1
---

# Audit Framework

Master the Linux audit framework for kernel security monitoring, understanding system call auditing, security event logging, and compliance monitoring on ARM64 platforms including Rock 5B+.

## What is the Audit Framework?

**What**: The Linux audit framework is a comprehensive system for recording and monitoring security-relevant events in the kernel, providing detailed logs of system calls, file access, and security events for compliance and forensics.

**Why**: Understanding the audit framework is crucial because:

- **Security Monitoring**: Tracks security-relevant events
- **Compliance**: Required for regulatory compliance
- **Forensics**: Provides audit trails for investigation
- **Intrusion Detection**: Helps detect security breaches
- **Accountability**: Records user and process activities
- **Production Security**: Essential for secure deployments

**When**: The audit framework is relevant when:

- **Security Events**: System calls and file access
- **User Actions**: User authentication and authorization
- **Compliance Logging**: Regulatory requirements
- **Security Investigation**: Forensic analysis
- **Real-Time Monitoring**: Live security monitoring
- **Production Operation**: Production system monitoring

**How**: The audit framework works through:

```c
// Example: Audit framework implementation
// Audit record structure
struct audit_buffer {
    struct list_head list;
    struct sk_buff *skb;
    struct audit_context *ctx;
    gfp_t gfp_mask;
};

// Audit context for process
struct audit_context {
    int dummy;
    int in_syscall;
    enum audit_state state, current_state;
    unsigned int serial;
    int major;
    struct timespec64 ctime;
    unsigned long argv[4];
    long return_code;
    u64 prio;
    int return_valid;
    struct audit_names *names;
    int name_count;
    // ... more fields
};

// Generate audit record
static struct audit_buffer *audit_log_start(struct audit_context *ctx,
                                           gfp_t gfp_mask, int type)
{
    struct audit_buffer *ab;
    struct timespec64 t;

    ab = kzalloc(sizeof(*ab), gfp_mask);
    if (!ab)
        return NULL;

    ab->ctx = ctx;
    ab->gfp_mask = gfp_mask;

    ab->skb = nlmsg_new(AUDIT_BUFSIZ, gfp_mask);
    if (!ab->skb)
        goto err;

    ktime_get_coarse_real_ts64(&t);
    audit_log_format(ab, "audit(%llu.%03lu:%u): ",
                    (unsigned long long)t.tv_sec,
                    t.tv_nsec/1000000,
                    audit_serial());

    return ab;

err:
    kfree(ab);
    return NULL;
}

// Log audit message
static void audit_log_end(struct audit_buffer *ab)
{
    struct sk_buff *skb;
    struct nlmsghdr *nlh;

    if (!ab)
        return;

    skb = ab->skb;
    if (!skb)
        goto out;

    nlh = nlmsg_hdr(skb);
    nlh->nlmsg_len = skb->len;

    audit_log_multicast(skb, GFP_KERNEL);

out:
    kfree(ab);
}

// System call audit
static void audit_syscall_entry(int major, unsigned long a0,
                               unsigned long a1, unsigned long a2,
                               unsigned long a3)
{
    struct audit_context *context = audit_context();
    enum audit_state state;

    if (!context)
        return;

    state = context->state;
    if (state == AUDIT_DISABLED)
        return;

    context->major = major;
    context->argv[0] = a0;
    context->argv[1] = a1;
    context->argv[2] = a2;
    context->argv[3] = a3;
    context->ctime = current_kernel_time64();
    context->in_syscall = 1;
    context->current_state = state;
    context->serial = 0;
}

// File access audit
static void audit_inode(struct filename *name, const struct path *path,
                       unsigned int flags)
{
    struct audit_context *context = audit_context();
    struct audit_names *n;

    if (!context || !context->in_syscall)
        return;

    n = audit_alloc_name(context, AUDIT_TYPE_NORMAL);
    if (!n)
        return;

    n->name = name;
    n->ino = d_backing_inode(path->dentry)->i_ino;
    n->dev = d_backing_inode(path->dentry)->i_sb->s_dev;
    n->mode = d_backing_inode(path->dentry)->i_mode;
    n->uid = d_backing_inode(path->dentry)->i_uid;
    n->gid = d_backing_inode(path->dentry)->i_gid;
}
```

**Where**: The audit framework is used in:

- **All Linux Systems**: Desktop, server, and embedded
- **Enterprise Systems**: Corporate and government systems
- **Compliance**: Financial and healthcare systems
- **Security Systems**: High-security deployments
- **Rock 5B+**: ARM64 audit implementation

## Audit Rules and Configuration

**What**: Audit rules define which events to log and how to filter and process audit records.

**Why**: Understanding audit rules is important because:

- **Event Selection**: Choose what to monitor
- **Performance**: Minimize logging overhead
- **Compliance**: Meet regulatory requirements
- **Security Focus**: Monitor security-critical events
- **Resource Management**: Control log volume

**How**: Audit rules work through:

```c
// Example: Audit rule implementation
// Audit rule structure
struct audit_krule {
    u32 flags;
    u32 action;
    u32 mask[AUDIT_BITMASK_SIZE];
    u32 buflen;
    u32 field_count;
    char *filterkey;
    struct audit_field *fields;
    struct audit_field *arch_f;
    struct audit_field *inode_f;
    struct audit_watch *watch;
    struct audit_tree *tree;
    struct list_head rlist;
    struct list_head list;
    u64 prio;
};

// Audit rule field
struct audit_field {
    u32 type;
    u32 val;
    kuid_t uid;
    kgid_t gid;
    u32 op;
    char *lsm_str;
    void *lsm_rule;
};

// Add audit rule
static int audit_add_rule(struct audit_entry *entry)
{
    struct audit_entry *e;
    struct audit_watch *watch = entry->rule.watch;
    struct audit_tree *tree = entry->rule.tree;
    struct list_head *list;
    int err = 0;

    mutex_lock(&audit_filter_mutex);

    // Check for duplicate rules
    list = &audit_filter_list[entry->rule.listnr];
    list_for_each_entry(e, list, list) {
        if (audit_compare_rule(&entry->rule, &e->rule)) {
            err = -EEXIST;
            goto out;
        }
    }

    // Add rule to list
    if (watch) {
        err = audit_add_watch(&entry->rule, &list);
        if (err)
            goto out;
    }

    if (tree) {
        err = audit_add_tree_rule(&entry->rule);
        if (err)
            goto out;
    }

    entry->rule.prio = ++prio_low;
    list_add_tail_rcu(&entry->list, list);

out:
    mutex_unlock(&audit_filter_mutex);
    return err;
}

// Evaluate audit rule
static int audit_filter_rules(struct task_struct *tsk,
                             struct audit_krule *rule,
                             struct audit_context *ctx,
                             struct audit_names *name,
                             enum audit_state *state,
                             bool task_creation)
{
    const struct cred *cred = get_task_cred(tsk);
    int i, result = 0;

    for (i = 0; i < rule->field_count; i++) {
        struct audit_field *f = &rule->fields[i];
        u32 op = f->op;

        switch (f->type) {
        case AUDIT_UID:
            result = audit_uid_comparator(cred->uid, op, f->uid);
            break;
        case AUDIT_GID:
            result = audit_gid_comparator(cred->gid, op, f->gid);
            break;
        case AUDIT_ARCH:
            result = audit_comparator(ctx->arch, op, f->val);
            break;
        case AUDIT_SYSCALL:
            result = audit_comparator(ctx->major, op, f->val);
            break;
        case AUDIT_INODE:
            if (name)
                result = audit_comparator(name->ino, op, f->val);
            break;
        // ... more cases
        }

        if (!result) {
            put_cred(cred);
            return 0;
        }
    }

    put_cred(cred);

    if (rule->flags & AUDIT_FILTER_PREPEND)
        *state = rule->action;
    else
        *state = rule->action;

    return 1;
}

// Example audit rules
// Monitor file access
auditctl -w /etc/passwd -p wa -k passwd_changes

// Monitor system calls
auditctl -a always,exit -F arch=b64 -S openat -S open -k file_access

// Monitor executions
auditctl -a always,exit -F arch=b64 -S execve -k exec_monitoring

// Monitor network connections
auditctl -a always,exit -F arch=b64 -S socket -S connect -k network_activity
```

**Explanation**:

- **Rule Structure**: Defines filtering criteria
- **Field Types**: Various event attributes
- **Action Types**: Log or ignore events
- **Filtering**: Match events against rules
- **Performance**: Efficient rule evaluation

**Where**: Audit rules are used in:

- **Security Monitoring**: Monitoring security events
- **Compliance**: Meeting audit requirements
- **Forensics**: Collecting investigation data
- **Intrusion Detection**: Detecting attacks
- **System Administration**: System monitoring

## ARM64 Audit Implementation

**What**: ARM64 architecture requires specific audit implementation considerations for system call interception and event logging.

**Why**: Understanding ARM64 specifics is important because:

- **Platform Differences**: ARM64 specific implementation
- **System Calls**: Different syscall numbering
- **Performance**: ARM64 performance characteristics
- **Embedded Systems**: Critical for Rock 5B+
- **Production Deployment**: ARM64 deployments

**How**: ARM64 audit implementation involves:

```c
// Example: ARM64 specific audit implementation
// ARM64 system call table audit hooks
#ifdef CONFIG_ARM64
static long arm64_syscall_audit(int syscall_nr, struct pt_regs *regs)
{
    struct audit_context *context;
    long ret;

    context = audit_context();
    if (!context)
        return 0;

    // Audit syscall entry
    audit_syscall_entry(syscall_nr,
                       regs->regs[0], regs->regs[1],
                       regs->regs[2], regs->regs[3]);

    // Execute syscall
    ret = invoke_syscall(regs, syscall_nr);

    // Audit syscall exit
    audit_syscall_exit(context, ret);

    return ret;
}

// ARM64 syscall numbering
#define __NR_arm64_syscalls     450
#define ARM64_SYSCALL_OFFSET    0

// ARM64 audit architecture
#ifdef CONFIG_COMPAT
#define AUDIT_ARCH_ARM64    (EM_AARCH64|__AUDIT_ARCH_64BIT|__AUDIT_ARCH_LE)
#define AUDIT_ARCH_ARM      (EM_ARM|__AUDIT_ARCH_LE)
#else
#define AUDIT_ARCH_ARM64    (EM_AARCH64|__AUDIT_ARCH_64BIT|__AUDIT_ARCH_LE)
#endif

// ARM64 register access for audit
static void arm64_audit_get_registers(struct pt_regs *regs,
                                      unsigned long *args)
{
    args[0] = regs->regs[0];
    args[1] = regs->regs[1];
    args[2] = regs->regs[2];
    args[3] = regs->regs[3];
    args[4] = regs->regs[4];
    args[5] = regs->regs[5];
}

// Rock 5B+ device tree audit configuration
/ {
    compatible = "radxa,rock-5b-plus";

    audit {
        compatible = "linux,audit";
        status = "okay";

        enabled = <1>;
        rate-limit = <5000>;  // messages per second
        backlog = <8192>;

        features {
            syscall-audit = <1>;
            file-audit = <1>;
            network-audit = <1>;
        };
    };
};

// ARM64 kernel configuration
CONFIG_ARM64=y
CONFIG_AUDIT=y
CONFIG_AUDITSYSCALL=y
CONFIG_AUDIT_WATCH=y
CONFIG_AUDIT_TREE=y
CONFIG_AUDIT_GENERIC=y

// ARM64 specific audit rules
// Monitor ARM64 system calls
auditctl -a always,exit -F arch=b64 -S all -k arm64_syscalls

// Monitor ARM64 specific files
auditctl -w /sys/class/gpio -p wa -k gpio_access
auditctl -w /dev/i2c-* -p wa -k i2c_access
```

**Explanation**:

- **System Call Hooks**: ARM64 syscall interception
- **Register Access**: ARM64 register layout
- **Architecture ID**: ARM64 audit architecture ID
- **Device Tree**: Platform configuration
- **Kernel Config**: ARM64 audit configuration

**Where**: ARM64 audit is used in:

- **ARM64 Systems**: All ARM64 Linux systems
- **Embedded Devices**: ARM64 embedded systems
- **Mobile Devices**: ARM64 smartphones
- **Single-Board Computers**: Rock 5B+ platform
- **Server Systems**: ARM64 servers

## Performance and Resource Management

**What**: Audit framework performance optimization is critical for minimizing overhead while maintaining comprehensive logging.

**Why**: Understanding performance optimization is important because:

- **System Overhead**: Audit can impact performance
- **Log Volume**: Managing large log volumes
- **Real-Time Systems**: Maintaining timing guarantees
- **Embedded Systems**: Resource constraints
- **Production Systems**: Performance requirements

**How**: Performance optimization involves:

```c
// Example: Audit performance optimization
// Audit buffer management
#define AUDIT_BUFSIZ        1024
#define AUDIT_MAXFREE       (2 * AUDIT_BUFSIZ)

static struct sk_buff_head audit_queue;
static struct sk_buff_head audit_hold_queue;
static struct task_struct *kauditd_task;

// Rate limiting
static DEFINE_SPINLOCK(audit_rate_limit_lock);
static unsigned int audit_rate_limit = 0;
static unsigned int audit_rate_limit_burst = 0;
static unsigned int audit_rate_limit_counter = 0;

// Check rate limit
static int audit_rate_check(void)
{
    static unsigned long last_check = 0;
    unsigned long flags;
    unsigned long now = jiffies;
    int ret = 1;

    spin_lock_irqsave(&audit_rate_limit_lock, flags);

    if (audit_rate_limit && (now - last_check) < HZ) {
        if (++audit_rate_limit_counter > audit_rate_limit_burst) {
            ret = 0;
        }
    } else {
        last_check = now;
        audit_rate_limit_counter = 0;
    }

    spin_unlock_irqrestore(&audit_rate_limit_lock, flags);

    return ret;
}

// Backlog management
static void audit_log_lost(const char *message)
{
    static DEFINE_RATELIMIT_STATE(rs, 5 * HZ, 10);

    if (__ratelimit(&rs))
        pr_warn("audit_lost=%u audit_rate_limit=%u audit_backlog_limit=%u\n",
                atomic_read(&audit_lost),
                audit_rate_limit,
                audit_backlog_limit);
}

// Asynchronous logging
static void kauditd_send_queue(struct sk_buff_head *queue,
                               struct netlink_sock *nlsk)
{
    struct sk_buff *skb;

    while ((skb = skb_dequeue(queue))) {
        if (audit_net_id) {
            netlink_unicast(nlsk, skb, audit_net_id, 0);
        } else {
            kfree_skb(skb);
        }
    }
}

// Performance monitoring
static void audit_measure_performance(void)
{
    unsigned long start, end;
    int i;

    start = get_cycles();
    for (i = 0; i < 10000; i++) {
        struct audit_buffer *ab;
        ab = audit_log_start(NULL, GFP_KERNEL, AUDIT_TEST);
        audit_log_format(ab, "test message");
        audit_log_end(ab);
    }
    end = get_cycles();

    pr_info("Audit performance: %lu cycles per message\n",
            (end - start) / 10000);
}

// Configuration for performance
CONFIG_AUDIT_RATE_LIMIT=5000
CONFIG_AUDIT_BACKLOG_LIMIT=8192
CONFIG_AUDIT_TREE=n  // Disable if not needed
CONFIG_AUDIT_WATCH=n // Disable if not needed
```

**Explanation**:

- **Buffer Management**: Efficient buffer handling
- **Rate Limiting**: Preventing log flooding
- **Backlog Control**: Managing queue depth
- **Asynchronous Logging**: Non-blocking logging
- **Performance Tuning**: Optimizing for overhead

**Where**: Performance optimization applies to:

- **High-Load Systems**: High-transaction systems
- **Real-Time Systems**: Timing-critical systems
- **Embedded Devices**: Resource-constrained devices
- **Production Systems**: Performance requirements
- **Rock 5B+**: Embedded optimization

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Audit Framework Understanding**: You understand the audit system
2. **Rule Configuration**: You know how to configure audit rules
3. **ARM64 Implementation**: You understand ARM64 specifics
4. **Performance Optimization**: You know how to optimize
5. **Event Logging**: You understand comprehensive logging
6. **Production Readiness**: You can deploy audit systems

**Why** these concepts matter:

- **Security Monitoring**: Critical for security
- **Compliance**: Required for regulations
- **Forensics**: Essential for investigations
- **Accountability**: Tracks user actions
- **Professional Skills**: Industry-standard knowledge

**When** to use these concepts:

- **Security Monitoring**: Monitoring security events
- **Compliance**: Meeting requirements
- **Incident Response**: Investigating incidents
- **System Administration**: Monitoring systems
- **Production**: Operating secure systems

**Where** these skills apply:

- **Security Engineering**: Designing monitoring
- **System Administration**: Managing audit
- **Compliance**: Meeting regulations
- **Forensics**: Investigating incidents
- **Professional Development**: Security careers

## Next Steps

**What** you're ready for next:

After mastering the audit framework, you should be ready to:

1. **Learn Security Events**: Understand event types
2. **Study Intrusion Detection**: Learn threat detection
3. **Explore Security Tools**: Master security tools
4. **Master Monitoring**: Comprehensive monitoring
5. **Implement Systems**: Build monitoring systems

**Where** to go next:

Continue with the next lesson on **"Security Events"** to learn:

- Security event types and classification
- Event correlation and analysis
- Real-time event processing
- Threat intelligence integration

**Why** the next lesson is important:

The next lesson builds on your audit knowledge by teaching you how to analyze and respond to security events, completing your security monitoring capabilities.

**How** to continue learning:

1. **Study Audit Framework**: Analyze implementation
2. **Experiment with Rock 5B+**: Configure auditing
3. **Read Documentation**: Study audit documentation
4. **Join Communities**: Engage with security professionals
5. **Build Projects**: Implement audit systems

## Resources

**Official Documentation**:

- [Linux Audit Documentation](https://github.com/linux-audit/audit-documentation) - Official audit docs
- [Audit System](https://www.kernel.org/doc/html/latest/admin-guide/audit.html) - Kernel audit guide
- [auditd Manual](https://linux.die.net/man/8/auditd) - Audit daemon manual

**Community Resources**:

- [Linux Audit Project](https://github.com/linux-audit/audit-userspace) - Audit userspace
- [Security Mailing Lists](https://lore.kernel.org/linux-security-module/) - Security discussions
- [NIST Guidelines](https://www.nist.gov/) - Security standards

**Learning Resources**:

- [Linux Security](https://www.oreilly.com/library/view/linux-security-cookbook/0596003919/) - Security practices
- [Compliance Guide](https://www.cisecurity.org/) - CIS benchmarks
- [Forensics](https://www.sans.org/cyber-security-courses/) - Security forensics

**Rock 5B+ Specific**:

- [Rock 5B+ Security](https://wiki.radxa.com/Rock5/security) - Board security
- [ARM64 Audit](https://developer.arm.com/documentation/) - ARM64 security
- [Embedded Security](https://embeddedsecurity.io/) - Embedded security

Happy learning! 🐧
