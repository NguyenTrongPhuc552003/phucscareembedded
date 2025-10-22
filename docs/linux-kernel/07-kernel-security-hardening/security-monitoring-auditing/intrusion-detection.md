---
sidebar_position: 3
---

# Intrusion Detection

Master intrusion detection systems (IDS) in the Linux kernel, understanding anomaly detection, signature-based detection, behavioral analysis, and threat response on ARM64 platforms including Rock 5B+.

## What is Intrusion Detection?

**What**: Intrusion detection is the practice of monitoring system and network activities for malicious activities or policy violations, using both signature-based and anomaly-based detection techniques to identify potential security threats.

**Why**: Understanding intrusion detection is crucial because:

- **Threat Identification**: Detecting attacks and intrusions
- **Early Warning**: Identifying threats before damage
- **Attack Prevention**: Stopping attacks in progress
- **Forensic Evidence**: Collecting attack evidence
- **Compliance**: Meeting security requirements
- **Production Security**: Protecting live systems

**When**: Intrusion detection is relevant during:

- **Normal Operations**: Continuous monitoring
- **Attack Attempts**: Active intrusion attempts
- **Policy Violations**: Security policy breaches
- **Anomalous Behavior**: Unusual system activity
- **Incident Response**: Security incident investigation
- **Threat Hunting**: Proactive threat detection

**How**: Intrusion detection works through:

```c
// Example: Kernel-based intrusion detection
// IDS configuration structure
struct ids_config {
    bool signature_detection;
    bool anomaly_detection;
    bool behavioral_analysis;
    unsigned int alert_threshold;
    unsigned long scan_interval;
};

// IDS detection state
struct ids_state {
    struct list_head signatures;
    struct list_head anomalies;
    struct list_head alerts;
    spinlock_t lock;
    atomic_t alert_count;
};

// Signature structure
struct ids_signature {
    u32 sig_id;
    const char *name;
    const char *description;
    int (*detect)(struct security_event *event);
    enum threat_severity severity;
    struct list_head list;
};

// Detection function
static int ids_detect_threat(struct security_event *event)
{
    struct ids_signature *sig;
    int detected = 0;

    // Check signature-based detection
    list_for_each_entry(sig, &ids_state.signatures, list) {
        if (sig->detect(event)) {
            generate_ids_alert(sig, event);
            detected = 1;
        }
    }

    // Check anomaly-based detection
    if (detect_anomaly(event)) {
        generate_anomaly_alert(event);
        detected = 1;
    }

    // Check behavioral analysis
    if (detect_behavioral_anomaly(event)) {
        generate_behavioral_alert(event);
        detected = 1;
    }

    return detected;
}

// Common attack signatures
static int detect_buffer_overflow(struct security_event *event)
{
    // Detect buffer overflow attempts
    if (event->event_type == SEC_EVENT_SYSTEM_CALL) {
        unsigned long sp = task_pt_regs(current)->sp;
        unsigned long stack_top = current->stack_start;

        // Check for stack smashing
        if (sp < stack_top - THREAD_SIZE + 1024) {
            pr_alert("Possible buffer overflow detected\n");
            return 1;
        }
    }
    return 0;
}

static int detect_privilege_escalation_attempt(struct security_event *event)
{
    // Detect unauthorized privilege escalation
    if (event->event_type == SEC_EVENT_PRIVILEGE_ESCALATION) {
        const struct cred *cred = current_cred();

        // Check if escalation is from untrusted source
        if (!uid_eq(cred->uid, GLOBAL_ROOT_UID) &&
            uid_eq(event->new_uid, GLOBAL_ROOT_UID)) {
            pr_alert("Unauthorized privilege escalation attempt\n");
            return 1;
        }
    }
    return 0;
}
```

**Where**: Intrusion detection is used in:

- **All Environments**: Production, staging, development
- **Network Perimeters**: Network traffic monitoring
- **Host Systems**: Host-based detection
- **Cloud Infrastructure**: Cloud security monitoring
- **Rock 5B+**: ARM64 embedded IDS

## Signature-Based Detection

**What**: Signature-based detection identifies known attack patterns by matching observed behavior against a database of attack signatures.

**Why**: Understanding signature-based detection is important because:

- **Known Threats**: Detects known attack patterns
- **Low False Positives**: Accurate detection
- **Fast Detection**: Quick pattern matching
- **Compliance**: Required for standards
- **Threat Database**: Leverages threat intelligence

**How**: Signature-based detection works through:

```c
// Example: Signature-based detection implementation
// Signature database
static LIST_HEAD(signature_database);

// Register attack signature
static int register_attack_signature(struct ids_signature *sig)
{
    unsigned long flags;

    spin_lock_irqsave(&ids_state.lock, flags);
    list_add_tail(&sig->list, &signature_database);
    spin_unlock_irqrestore(&ids_state.lock, flags);

    pr_info("Registered IDS signature: %s (ID: %u)\n",
            sig->name, sig->sig_id);

    return 0;
}

// Common attack signatures
static struct ids_signature sql_injection_sig = {
    .sig_id = 1001,
    .name = "SQL Injection",
    .description = "Detects SQL injection attempts",
    .detect = detect_sql_injection,
    .severity = THREAT_HIGH,
};

static struct ids_signature xss_attack_sig = {
    .sig_id = 1002,
    .name = "Cross-Site Scripting",
    .description = "Detects XSS attacks",
    .detect = detect_xss_attack,
    .severity = THREAT_MEDIUM,
};

static struct ids_signature shell_injection_sig = {
    .sig_id = 1003,
    .name = "Shell Injection",
    .description = "Detects shell command injection",
    .detect = detect_shell_injection,
    .severity = THREAT_HIGH,
};

// Pattern matching engine
static int pattern_match(const char *data, const char *pattern)
{
    // Boyer-Moore string matching
    int m = strlen(pattern);
    int n = strlen(data);
    int bad_char[256];
    int i;

    // Preprocessing
    for (i = 0; i < 256; i++)
        bad_char[i] = m;

    for (i = 0; i < m - 1; i++)
        bad_char[(unsigned char)pattern[i]] = m - 1 - i;

    // Searching
    i = m - 1;
    while (i < n) {
        int j = m - 1;
        while (j >= 0 && data[i] == pattern[j]) {
            i--;
            j--;
        }
        if (j < 0)
            return i + 1;
        i += bad_char[(unsigned char)data[i]];
    }

    return -1;
}

// Detect shell injection
static int detect_shell_injection(struct security_event *event)
{
    const char *dangerous_chars[] = {
        ";", "|", "&", "$", "`", "$(", "||", "&&", NULL
    };
    const char **ptr;

    if (event->event_type == SEC_EVENT_PROCESS_EXECUTION) {
        for (ptr = dangerous_chars; *ptr; ptr++) {
            if (pattern_match(event->comm, *ptr) >= 0) {
                pr_alert("Shell injection detected in command: %s\n",
                        event->comm);
                return 1;
            }
        }
    }

    return 0;
}

// Signature update mechanism
static void update_signature_database(void)
{
    struct ids_signature *sig;
    struct file *file;
    loff_t pos = 0;
    char *buf;
    int ret;

    // Load signatures from file
    file = filp_open("/etc/ids/signatures.dat", O_RDONLY, 0);
    if (IS_ERR(file))
        return;

    buf = kmalloc(PAGE_SIZE, GFP_KERNEL);
    if (!buf) {
        filp_close(file, NULL);
        return;
    }

    while ((ret = kernel_read(file, buf, PAGE_SIZE, &pos)) > 0) {
        parse_and_register_signatures(buf, ret);
    }

    kfree(buf);
    filp_close(file, NULL);
}
```

**Explanation**:

- **Signature Database**: Collection of attack patterns
- **Pattern Matching**: Efficient string matching
- **Signature Registration**: Adding new signatures
- **Threat Severity**: Categorizing threats
- **Database Updates**: Keeping signatures current

**Where**: Signature-based detection is used in:

- **Network IDS**: Network traffic analysis
- **Host IDS**: System call monitoring
- **Web Application Firewalls**: HTTP request filtering
- **Email Gateways**: Malware detection
- **Endpoint Protection**: Malware signatures

## Anomaly-Based Detection

**What**: Anomaly-based detection identifies deviations from normal system behavior, detecting unknown threats and zero-day attacks.

**Why**: Understanding anomaly detection is important because:

- **Unknown Threats**: Detects novel attacks
- **Zero-Day Detection**: Identifies new vulnerabilities
- **Behavioral Analysis**: Learns normal patterns
- **Adaptive Defense**: Adapts to environment
- **Advanced Threats**: Detects sophisticated attacks

**How**: Anomaly detection works through:

```c
// Example: Anomaly-based detection implementation
// Behavioral baseline
struct behavior_baseline {
    unsigned long syscall_rate;
    unsigned long network_rate;
    unsigned long file_access_rate;
    unsigned long cpu_usage;
    unsigned long memory_usage;
    struct timespec64 last_update;
};

// Anomaly detector
struct anomaly_detector {
    struct behavior_baseline baseline;
    unsigned int sensitivity;
    unsigned int threshold;
    int (*detect)(struct security_event *event);
};

// Calculate baseline behavior
static void calculate_baseline(struct behavior_baseline *baseline)
{
    struct task_struct *p;
    unsigned long total_syscalls = 0;
    unsigned long total_processes = 0;

    rcu_read_lock();
    for_each_process(p) {
        total_syscalls += p->se.sum_exec_runtime;
        total_processes++;
    }
    rcu_read_unlock();

    baseline->syscall_rate = total_syscalls / total_processes;
    baseline->cpu_usage = get_cpu_usage();
    baseline->memory_usage = get_memory_usage();
    ktime_get_real_ts64(&baseline->last_update);
}

// Detect syscall rate anomaly
static int detect_syscall_anomaly(struct security_event *event)
{
    struct behavior_baseline *baseline = &anomaly_detector.baseline;
    unsigned long current_rate;
    unsigned long deviation;

    current_rate = current->se.sum_exec_runtime;

    // Calculate deviation from baseline
    if (current_rate > baseline->syscall_rate) {
        deviation = (current_rate - baseline->syscall_rate) * 100 /
                    baseline->syscall_rate;
    } else {
        deviation = (baseline->syscall_rate - current_rate) * 100 /
                    baseline->syscall_rate;
    }

    // Check if deviation exceeds threshold
    if (deviation > anomaly_detector.threshold) {
        pr_alert("Syscall rate anomaly detected: %lu%% deviation\n",
                deviation);
        return 1;
    }

    return 0;
}

// Detect network behavior anomaly
static int detect_network_anomaly(struct security_event *event)
{
    static unsigned long last_connections = 0;
    unsigned long current_connections;
    unsigned long rate;

    if (event->event_type == SEC_EVENT_NETWORK_CONNECTION) {
        current_connections = atomic_long_read(&total_connections);
        rate = current_connections - last_connections;

        // Check for connection flood
        if (rate > 1000) {  // More than 1000 new connections
            pr_alert("Network connection flood detected\n");
            return 1;
        }

        last_connections = current_connections;
    }

    return 0;
}

// Statistical anomaly detection
static int statistical_anomaly_detection(struct security_event *event)
{
    static unsigned long event_counts[SEC_EVENT_MAX];
    static unsigned long total_events = 0;
    double probability, threshold = 0.001;

    total_events++;
    event_counts[event->event_type]++;

    // Calculate event probability
    probability = (double)event_counts[event->event_type] / total_events;

    // Rare events might be anomalous
    if (probability < threshold) {
        pr_info("Rare event detected (p=%f): type=%d\n",
                probability, event->event_type);
        return 1;
    }

    return 0;
}

// Machine learning based detection
#ifdef CONFIG_ML_IDS
static int ml_anomaly_detection(struct security_event *event)
{
    struct ml_model *model;
    float anomaly_score;

    model = get_anomaly_detection_model();
    if (!model)
        return 0;

    // Extract features from event
    float features[10];
    extract_event_features(event, features, 10);

    // Calculate anomaly score
    anomaly_score = ml_predict_anomaly(model, features, 10);

    // High anomaly score indicates potential intrusion
    if (anomaly_score > 0.8) {
        pr_alert("ML anomaly detected (score=%f)\n", anomaly_score);
        return 1;
    }

    return 0;
}
#endif
```

**Explanation**:

- **Baseline Calculation**: Normal behavior profile
- **Deviation Detection**: Statistical anomaly detection
- **Rate Monitoring**: Activity rate analysis
- **Statistical Methods**: Probability-based detection
- **Machine Learning**: ML-based anomaly detection

**Where**: Anomaly detection is used in:

- **Zero-Day Protection**: Unknown threat detection
- **APT Detection**: Advanced persistent threats
- **Insider Threats**: Unusual user behavior
- **DDoS Detection**: Traffic anomalies
- **Fraud Detection**: Unusual transactions

## Behavioral Analysis

**What**: Behavioral analysis monitors and analyzes patterns of system and user behavior to detect malicious activities based on context and intent.

**Why**: Understanding behavioral analysis is important because:

- **Context Awareness**: Considers behavior context
- **Intent Detection**: Identifies malicious intent
- **Advanced Threats**: Detects sophisticated attacks
- **Low False Positives**: Context reduces false alarms
- **Adaptive Learning**: Learns from behavior

**How**: Behavioral analysis works through:

```c
// Example: Behavioral analysis implementation
// User behavior profile
struct user_profile {
    uid_t uid;
    unsigned long login_times[7][24];  // Login patterns by day/hour
    char usual_locations[10][INET_ADDRSTRLEN];
    char usual_commands[50][256];
    unsigned long file_access_pattern[100];
    struct timespec64 last_update;
};

// Analyze login behavior
static int analyze_login_behavior(struct security_event *event)
{
    struct user_profile *profile;
    struct tm tm;
    int day, hour;

    if (event->event_type != SEC_EVENT_AUTH_SUCCESS)
        return 0;

    profile = get_user_profile(event->uid);
    if (!profile)
        return 0;

    // Get current day and hour
    time64_to_tm(ktime_get_real_seconds(), 0, &tm);
    day = tm.tm_wday;
    hour = tm.tm_hour;

    // Check if login time is unusual
    if (profile->login_times[day][hour] < 5) {
        pr_alert("Unusual login time for user %u: %d:%02d\n",
                event->uid, hour, tm.tm_min);
        return 1;
    }

    return 0;
}

// Analyze command execution behavior
static int analyze_command_behavior(struct security_event *event)
{
    struct user_profile *profile;
    bool is_usual = false;
    int i;

    if (event->event_type != SEC_EVENT_PROCESS_EXECUTION)
        return 0;

    profile = get_user_profile(event->uid);
    if (!profile)
        return 0;

    // Check if command is in user's usual commands
    for (i = 0; i < 50; i++) {
        if (strcmp(profile->usual_commands[i], event->comm) == 0) {
            is_usual = true;
            break;
        }
    }

    if (!is_usual && is_dangerous_command(event->comm)) {
        pr_alert("Unusual dangerous command by user %u: %s\n",
                event->uid, event->comm);
        return 1;
    }

    return 0;
}

// Detect attack chains
static int detect_attack_chain(void)
{
    static struct security_event *recent_events[100];
    static int event_index = 0;
    int i;

    // Check for common attack chains
    // Example: Reconnaissance -> Exploit -> Privilege Escalation
    bool found_recon = false;
    bool found_exploit = false;
    bool found_privesc = false;

    for (i = 0; i < 100; i++) {
        if (!recent_events[i])
            continue;

        if (is_reconnaissance(recent_events[i]))
            found_recon = true;
        if (is_exploit_attempt(recent_events[i]))
            found_exploit = true;
        if (is_privilege_escalation(recent_events[i]))
            found_privesc = true;
    }

    if (found_recon && found_exploit && found_privesc) {
        pr_alert("Attack chain detected!\n");
        return 1;
    }

    return 0;
}
```

**Explanation**:

- **User Profiling**: Building behavior profiles
- **Pattern Analysis**: Analyzing behavior patterns
- **Context Evaluation**: Considering context
- **Chain Detection**: Identifying attack sequences
- **Adaptive Learning**: Updating profiles

**Where**: Behavioral analysis is used in:

- **User Activity Monitoring**: User behavior analysis
- **Insider Threat Detection**: Internal threats
- **APT Detection**: Advanced persistent threats
- **Fraud Detection**: Financial fraud
- **Identity Theft**: Account compromise

## ARM64 and Rock 5B+ IDS

**What**: ARM64 architecture and Rock 5B+ platform require specific IDS implementations and optimizations.

**Why**: Understanding ARM64 IDS is important because:

- **Platform Specifics**: ARM64 specific features
- **Performance**: Embedded optimization
- **Resource Constraints**: Limited resources
- **Hardware Features**: Platform capabilities
- **Production Deployment**: ARM64 deployments

**How**: ARM64 IDS involves:

```c
// Example: ARM64 specific IDS implementation
// ARM64 performance monitoring for IDS
#ifdef CONFIG_ARM64
static void arm64_ids_pmu_init(void)
{
    // Configure PMU for IDS monitoring
    u64 pmcr = read_sysreg(PMCR_EL0);
    pmcr |= PMCR_EL0_E | PMCR_EL0_P;
    write_sysreg(pmcr, PMCR_EL0);

    // Monitor cache behavior for side-channel attacks
    write_sysreg(0x04, PMEVTYPER0_EL0);  // L1D cache refill
    write_sysreg(0x16, PMEVTYPER1_EL0);  // L2D cache refill
}

// Detect side-channel attacks
static int detect_side_channel_attack(void)
{
    u64 l1_refills, l2_refills;
    static u64 baseline_l1 = 0, baseline_l2 = 0;

    l1_refills = read_sysreg(PMEVCNTR0_EL0);
    l2_refills = read_sysreg(PMEVCNTR1_EL0);

    // Abnormal cache behavior might indicate attack
    if (baseline_l1 && (l1_refills > baseline_l1 * 10)) {
        pr_alert("Possible side-channel attack detected\n");
        return 1;
    }

    baseline_l1 = l1_refills;
    baseline_l2 = l2_refills;
    return 0;
}

// Rock 5B+ hardware monitoring
static void rock5b_hardware_ids(void)
{
    // Monitor GPIO for physical tampering
    struct gpio_desc *tamper_detect;

    tamper_detect = gpio_to_desc(GPIO_TAMPER_DETECT);
    if (gpiod_get_value(tamper_detect)) {
        pr_emerg("Physical tampering detected!\n");
        generate_ids_alert("Physical tampering", THREAT_CRITICAL);
    }

    // Monitor temperature for attacks
    struct thermal_zone_device *tz;
    int temp;

    tz = thermal_zone_get_zone_by_name("cpu_thermal");
    thermal_zone_get_temp(tz, &temp);

    if (temp > 90000) {  // Abnormally high
        pr_alert("Abnormal temperature: possible hardware attack\n");
        generate_ids_alert("Temperature anomaly", THREAT_HIGH);
    }
}

// Device tree configuration
/ {
    compatible = "radxa,rock-5b-plus";

    intrusion-detection {
        compatible = "linux,ids";
        status = "okay";

        signature-detection = <1>;
        anomaly-detection = <1>;
        behavioral-analysis = <1>;

        monitoring {
            pmu-events = <1>;
            gpio-monitoring = <1>;
            thermal-monitoring = <1>;
        };

        sensitivity = <80>;  // 0-100
        threshold = <50>;     // Anomaly threshold percentage
    };
};

// ARM64 kernel configuration
CONFIG_ARM64=y
CONFIG_IDS=y
CONFIG_IDS_SIGNATURE=y
CONFIG_IDS_ANOMALY=y
CONFIG_IDS_BEHAVIORAL=y
CONFIG_ARM64_IDS_PMU=y
```

**Explanation**:

- **PMU Monitoring**: Performance counter monitoring
- **Side-Channel Detection**: Cache timing attacks
- **Hardware Monitoring**: Physical security
- **Thermal Monitoring**: Temperature anomalies
- **Platform Configuration**: Device tree setup

**Where**: ARM64 IDS is used in:

- **ARM64 Systems**: All ARM64 platforms
- **Embedded Devices**: IoT and industrial
- **Mobile Devices**: Smartphone security
- **Edge Computing**: Edge devices
- **Rock 5B+**: Embedded IDS

## Key Takeaways

**What** you've accomplished in this lesson:

1. **IDS Understanding**: You understand intrusion detection
2. **Signature Detection**: You know pattern-based detection
3. **Anomaly Detection**: You understand behavioral analysis
4. **Behavioral Analysis**: You know context-aware detection
5. **ARM64 Implementation**: You understand platform specifics
6. **Production Readiness**: You can deploy IDS systems

**Why** these concepts matter:

- **Threat Detection**: Identifying attacks
- **Security Defense**: Protecting systems
- **Incident Response**: Responding to threats
- **Compliance**: Meeting requirements
- **Professional Skills**: Security expertise

**When** to use these concepts:

- **Security Monitoring**: Continuous detection
- **Threat Hunting**: Proactive detection
- **Incident Response**: Active incidents
- **Compliance**: Audit requirements
- **Production**: Operating systems

**Where** these skills apply:

- **Security Operations**: SOC operations
- **Network Security**: Network protection
- **System Security**: Host protection
- **Cloud Security**: Cloud environments
- **Professional Development**: Security careers

## Next Steps

**What** you're ready for next:

After mastering intrusion detection, you should be ready to:

1. **Learn Performance Optimization**: System optimization
2. **Study Power Management**: Energy efficiency
3. **Explore Kernel Contribution**: Contributing to kernel
4. **Master Advanced Topics**: Capstone projects
5. **Build Production Systems**: Real-world deployment

**Where** to go next:

Continue with Phase 8 lessons starting with **"Kernel Performance Optimization"** to learn advanced kernel development topics.

**Why** continuing is important:

You've completed the security hardening phase. The next phase focuses on performance optimization, power management, and professional kernel development skills.

**How** to continue learning:

1. **Study IDS**: Analyze implementations
2. **Experiment with Rock 5B+**: Deploy IDS
3. **Read Documentation**: Study security documentation
4. **Join Communities**: Engage with security professionals
5. **Build Projects**: Implement IDS systems

## Resources

**Official Documentation**:

- [Snort IDS](https://www.snort.org/) - Network IDS
- [AIDE](https://aide.github.io/) - Host-based IDS
- [Linux Security](https://www.kernel.org/doc/html/latest/admin-guide/LSM/) - Security modules

**Community Resources**:

- [Security Onion](https://securityonionsolutions.com/) - Security monitoring
- [Suricata](https://suricata.io/) - Network IDS/IPS
- [OSSEC](https://www.ossec.net/) - Host IDS

**Learning Resources**:

- [Intrusion Detection](https://www.oreilly.com/library/view/intrusion-detection-systems/9780596009960/) - IDS guide
- [Network Security Monitoring](https://www.nostarch.com/nsm) - Network monitoring
- [Practical Intrusion Detection](https://www.amazon.com/Practical-Intrusion-Detection-Handbook-Administrators/dp/0735712654) - Practical guide

**Rock 5B+ Specific**:

- [Rock 5B+ Security](https://wiki.radxa.com/Rock5/security) - Platform security
- [ARM64 Security](https://developer.arm.com/documentation/) - ARM64 security
- [Embedded IDS](https://embeddedsecurity.io/) - Embedded IDS

Happy learning! 🐧
