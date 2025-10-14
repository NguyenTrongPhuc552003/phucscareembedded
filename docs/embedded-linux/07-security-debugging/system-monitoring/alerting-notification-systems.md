---
sidebar_position: 3
---

# Alerting and Notification Systems

Master alerting and notification systems for embedded Linux systems with comprehensive explanations using the 4W+H framework.

## What are Alerting and Notification Systems?

**What**: Alerting and notification systems are mechanisms that automatically detect issues, anomalies, or threshold violations and notify relevant personnel or systems about these events.

**Why**: Alerting and notification systems are essential because:

- **Proactive monitoring** - Enables proactive detection and response to issues
- **Rapid response** - Ensures rapid response to critical issues
- **Issue prevention** - Prevents issues from escalating into major problems
- **System reliability** - Maintains system reliability and availability
- **Operational efficiency** - Improves operational efficiency and response times

**When**: Alerting and notification systems should be implemented when:

- **Production systems** - Systems running in production environments
- **Critical applications** - Applications with high availability requirements
- **24/7 operations** - Systems requiring continuous monitoring
- **Resource constraints** - Systems with limited resources that need careful monitoring
- **Compliance requirements** - Systems requiring compliance monitoring

**How**: Alerting and notification systems are implemented through:

- **Monitoring integration** - Integrating with monitoring systems and tools
- **Threshold configuration** - Configuring alert thresholds and conditions
- **Notification channels** - Setting up multiple notification channels
- **Escalation policies** - Implementing escalation and response policies
- **Alert management** - Managing and tracking alert lifecycle

**Where**: Alerting and notification systems are used in:

- **Embedded systems** - IoT devices, industrial controllers, medical devices
- **Server systems** - Enterprise servers and cloud infrastructure
- **Mobile devices** - Smartphones, tablets, and wearables
- **Automotive systems** - Connected vehicles and autonomous systems
- **Consumer electronics** - Smart TVs, gaming consoles, routers

## Alerting Fundamentals

**What**: Alerting fundamentals involve understanding the core concepts, principles, and best practices for implementing effective alerting systems.

**Why**: Understanding alerting fundamentals is important because:

- **Effective alerting** - Enables implementation of effective alerting systems
- **Alert fatigue prevention** - Prevents alert fatigue and noise
- **Response optimization** - Optimizes response times and effectiveness
- **System reliability** - Improves system reliability and availability
- **Operational efficiency** - Enhances operational efficiency

### Alert Types and Severity

**What**: Alert types and severity levels categorize alerts based on their nature, impact, and urgency.

**Why**: Alert categorization is crucial because:

- **Priority management** - Helps prioritize alerts and responses
- **Resource allocation** - Guides resource allocation for alert handling
- **Escalation policies** - Enables appropriate escalation policies
- **Response planning** - Aids in response planning and execution
- **Alert management** - Improves alert management and tracking

**How**: Alert types and severity are implemented through:

```bash
# Example: Alert types and severity configuration
#!/bin/bash

# Alert severity levels
ALERT_CRITICAL=1
ALERT_HIGH=2
ALERT_MEDIUM=3
ALERT_LOW=4
ALERT_INFO=5

# Alert types
ALERT_TYPE_CPU="CPU"
ALERT_TYPE_MEMORY="MEMORY"
ALERT_TYPE_DISK="DISK"
ALERT_TYPE_NETWORK="NETWORK"
ALERT_TYPE_APPLICATION="APPLICATION"
ALERT_TYPE_SYSTEM="SYSTEM"

# Alert configuration
declare -A ALERT_THRESHOLDS
ALERT_THRESHOLDS["CPU_CRITICAL"]=90
ALERT_THRESHOLDS["CPU_HIGH"]=80
ALERT_THRESHOLDS["CPU_MEDIUM"]=70
ALERT_THRESHOLDS["MEMORY_CRITICAL"]=95
ALERT_THRESHOLDS["MEMORY_HIGH"]=85
ALERT_THRESHOLDS["MEMORY_MEDIUM"]=75
ALERT_THRESHOLDS["DISK_CRITICAL"]=95
ALERT_THRESHOLDS["DISK_HIGH"]=85
ALERT_THRESHOLDS["DISK_MEDIUM"]=75

# Function to determine alert severity
determine_alert_severity() {
    local metric_type=$1
    local metric_value=$2
    local severity=$ALERT_INFO

    case $metric_type in
        "CPU")
            if [ "$metric_value" -ge "${ALERT_THRESHOLDS[CPU_CRITICAL]}" ]; then
                severity=$ALERT_CRITICAL
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[CPU_HIGH]}" ]; then
                severity=$ALERT_HIGH
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[CPU_MEDIUM]}" ]; then
                severity=$ALERT_MEDIUM
            fi
            ;;
        "MEMORY")
            if [ "$metric_value" -ge "${ALERT_THRESHOLDS[MEMORY_CRITICAL]}" ]; then
                severity=$ALERT_CRITICAL
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[MEMORY_HIGH]}" ]; then
                severity=$ALERT_HIGH
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[MEMORY_MEDIUM]}" ]; then
                severity=$ALERT_MEDIUM
            fi
            ;;
        "DISK")
            if [ "$metric_value" -ge "${ALERT_THRESHOLDS[DISK_CRITICAL]}" ]; then
                severity=$ALERT_CRITICAL
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[DISK_HIGH]}" ]; then
                severity=$ALERT_HIGH
            elif [ "$metric_value" -ge "${ALERT_THRESHOLDS[DISK_MEDIUM]}" ]; then
                severity=$ALERT_MEDIUM
            fi
            ;;
    esac

    echo $severity
}

# Function to get severity name
get_severity_name() {
    local severity=$1

    case $severity in
        $ALERT_CRITICAL) echo "CRITICAL" ;;
        $ALERT_HIGH) echo "HIGH" ;;
        $ALERT_MEDIUM) echo "MEDIUM" ;;
        $ALERT_LOW) echo "LOW" ;;
        $ALERT_INFO) echo "INFO" ;;
        *) echo "UNKNOWN" ;;
    esac
}

# Function to check if alert should be sent
should_send_alert() {
    local severity=$1
    local alert_type=$2
    local current_time=$(date +%s)
    local last_alert_time=0
    local cooldown_period=300  # 5 minutes

    # Check cooldown period
    if [ -f "/tmp/last_alert_${alert_type}" ]; then
        last_alert_time=$(cat "/tmp/last_alert_${alert_type}")
    fi

    local time_diff=$((current_time - last_alert_time))

    # Send alert if cooldown period has passed or severity is critical
    if [ "$time_diff" -ge "$cooldown_period" ] || [ "$severity" -eq "$ALERT_CRITICAL" ]; then
        echo "$current_time" > "/tmp/last_alert_${alert_type}"
        return 0
    fi

    return 1
}

# Function to create alert message
create_alert_message() {
    local alert_type=$1
    local severity=$2
    local metric_value=$3
    local threshold=$4
    local hostname=$(hostname)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    local severity_name=$(get_severity_name $severity)

    cat << EOF
ALERT: $alert_type $severity_name
Host: $hostname
Time: $timestamp
Metric: $metric_value%
Threshold: $threshold%
Message: $alert_type usage is $metric_value%, exceeding threshold of $threshold%
EOF
}

# Example usage
check_cpu_alert() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_int=${cpu_usage%.*}

    local severity=$(determine_alert_severity "CPU" $cpu_int)
    local severity_name=$(get_severity_name $severity)

    if [ "$severity" -le "$ALERT_MEDIUM" ]; then
        if should_send_alert $severity "CPU"; then
            local threshold=${ALERT_THRESHOLDS[CPU_CRITICAL]}
            if [ "$cpu_int" -ge "${ALERT_THRESHOLDS[CPU_HIGH]}" ]; then
                threshold=${ALERT_THRESHOLDS[CPU_HIGH]}
            fi
            if [ "$cpu_int" -ge "${ALERT_THRESHOLDS[CPU_MEDIUM]}" ]; then
                threshold=${ALERT_THRESHOLDS[CPU_MEDIUM]}
            fi

            local message=$(create_alert_message "CPU" $severity $cpu_int $threshold)
            echo "$message"
        fi
    fi
}
```

**Explanation**:

- **Severity levels** - Defines alert severity levels from critical to info
- **Alert types** - Defines different types of alerts
- **Thresholds** - Configures alert thresholds for different metrics
- **Severity determination** - Determines alert severity based on metric values
- **Cooldown periods** - Implements cooldown periods to prevent alert spam

**Where**: Alert types and severity are used in:

- **Alert management** - Managing and categorizing alerts
- **Response planning** - Planning alert responses
- **Escalation policies** - Implementing escalation policies
- **Resource allocation** - Allocating resources for alert handling
- **Alert filtering** - Filtering and prioritizing alerts

### Alert Conditions and Triggers

**What**: Alert conditions and triggers define when alerts should be generated based on specific conditions or threshold violations.

**Why**: Alert conditions and triggers are important because:

- **Precise alerting** - Enables precise and accurate alerting
- **False positive reduction** - Reduces false positives and noise
- **Context awareness** - Provides context-aware alerting
- **Conditional logic** - Enables complex conditional logic
- **Alert accuracy** - Improves alert accuracy and relevance

**How**: Alert conditions and triggers are implemented through:

```bash
# Example: Alert conditions and triggers
#!/bin/bash

# Alert condition types
CONDITION_TYPE_THRESHOLD="THRESHOLD"
CONDITION_TYPE_RATE="RATE"
CONDITION_TYPE_ANOMALY="ANOMALY"
CONDITION_TYPE_PATTERN="PATTERN"
CONDITION_TYPE_COMPOUND="COMPOUND"

# Alert trigger operators
OPERATOR_GT="GT"
OPERATOR_LT="LT"
OPERATOR_EQ="EQ"
OPERATOR_NE="NE"
OPERATOR_GTE="GTE"
OPERATOR_LTE="LTE"

# Alert condition structure
declare -A ALERT_CONDITIONS
ALERT_CONDITIONS["CPU_HIGH"]="CPU:GT:80:300"
ALERT_CONDITIONS["CPU_CRITICAL"]="CPU:GT:90:60"
ALERT_CONDITIONS["MEMORY_HIGH"]="MEMORY:GT:85:300"
ALERT_CONDITIONS["MEMORY_CRITICAL"]="MEMORY:GT:95:60"
ALERT_CONDITIONS["DISK_HIGH"]="DISK:GT:85:600"
ALERT_CONDITIONS["DISK_CRITICAL"]="DISK:GT:95:300"

# Function to parse alert condition
parse_alert_condition() {
    local condition=$1
    local IFS=':'
    read -r metric operator threshold duration <<< "$condition"
    echo "$metric $operator $threshold $duration"
}

# Function to evaluate threshold condition
evaluate_threshold_condition() {
    local metric=$1
    local operator=$2
    local threshold=$3
    local current_value=$4

    case $operator in
        "GT")
            [ "$current_value" -gt "$threshold" ]
            ;;
        "LT")
            [ "$current_value" -lt "$threshold" ]
            ;;
        "EQ")
            [ "$current_value" -eq "$threshold" ]
            ;;
        "NE")
            [ "$current_value" -ne "$threshold" ]
            ;;
        "GTE")
            [ "$current_value" -ge "$threshold" ]
            ;;
        "LTE")
            [ "$current_value" -le "$threshold" ]
            ;;
        *)
            false
            ;;
    esac
}

# Function to check alert conditions
check_alert_conditions() {
    local metric_type=$1
    local current_value=$2

    for condition_name in "${!ALERT_CONDITIONS[@]}"; do
        local condition=${ALERT_CONDITIONS[$condition_name]}
        local parsed=$(parse_alert_condition "$condition")
        read -r metric operator threshold duration <<< "$parsed"

        if [ "$metric" = "$metric_type" ]; then
            if evaluate_threshold_condition "$metric" "$operator" "$threshold" "$current_value"; then
                echo "$condition_name:$threshold:$duration"
            fi
        fi
    done
}

# Function to check rate-based conditions
check_rate_conditions() {
    local metric_type=$1
    local current_value=$2
    local previous_value=$3
    local time_diff=$4

    if [ "$time_diff" -gt 0 ]; then
        local rate=$(( (current_value - previous_value) * 100 / time_diff ))

        # Check if rate exceeds threshold
        if [ "$rate" -gt 10 ]; then  # 10% per second
            echo "RATE_HIGH:$rate:$time_diff"
        fi
    fi
}

# Function to check anomaly conditions
check_anomaly_conditions() {
    local metric_type=$1
    local current_value=$2
    local historical_values=("$@")

    # Calculate average of historical values
    local sum=0
    local count=${#historical_values[@]}

    for value in "${historical_values[@]}"; do
        sum=$((sum + value))
    done

    local average=$((sum / count))
    local deviation=$(( (current_value - average) * 100 / average ))

    # Check if deviation exceeds threshold
    if [ "$deviation" -gt 50 ]; then  # 50% deviation
        echo "ANOMALY_HIGH:$deviation:$average"
    fi
}

# Function to check compound conditions
check_compound_conditions() {
    local cpu_value=$1
    local memory_value=$2
    local disk_value=$3

    # Check if multiple metrics are high
    local high_count=0

    if [ "$cpu_value" -gt 80 ]; then
        ((high_count++))
    fi

    if [ "$memory_value" -gt 80 ]; then
        ((high_count++))
    fi

    if [ "$disk_value" -gt 80 ]; then
        ((high_count++))
    fi

    if [ "$high_count" -ge 2 ]; then
        echo "COMPOUND_HIGH:$high_count"
    fi
}

# Example usage
check_all_conditions() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_int=${cpu_usage%.*}

    local memory_usage=$(free | grep "Mem:" | awk '{printf "%.0f", $3/$2 * 100.0}')
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

    # Check threshold conditions
    local cpu_conditions=$(check_alert_conditions "CPU" $cpu_int)
    local memory_conditions=$(check_alert_conditions "MEMORY" $memory_usage)
    local disk_conditions=$(check_alert_conditions "DISK" $disk_usage)

    # Check compound conditions
    local compound_conditions=$(check_compound_conditions $cpu_int $memory_usage $disk_usage)

    # Process all conditions
    for condition in $cpu_conditions $memory_conditions $disk_conditions $compound_conditions; do
        if [ -n "$condition" ]; then
            echo "Alert condition triggered: $condition"
        fi
    done
}
```

**Explanation**:

- **Condition types** - Defines different types of alert conditions
- **Operators** - Defines comparison operators for conditions
- **Threshold evaluation** - Evaluates threshold-based conditions
- **Rate checking** - Checks rate-based conditions
- **Anomaly detection** - Detects anomalous behavior
- **Compound conditions** - Checks compound conditions

**Where**: Alert conditions and triggers are used in:

- **Alert generation** - Generating alerts based on conditions
- **Threshold monitoring** - Monitoring threshold violations
- **Anomaly detection** - Detecting anomalous behavior
- **Complex alerting** - Implementing complex alerting logic
- **Alert filtering** - Filtering alerts based on conditions

## Notification Channels

**What**: Notification channels are the methods and systems used to deliver alerts to relevant personnel or systems.

**Why**: Notification channels are important because:

- **Alert delivery** - Ensures alerts are delivered to the right people
- **Response facilitation** - Facilitates rapid response to alerts
- **Channel redundancy** - Provides redundancy in alert delivery
- **Preference management** - Manages user preferences for notifications
- **Escalation support** - Supports alert escalation and routing

### Email Notifications

**What**: Email notifications deliver alerts via email to relevant personnel.

**Why**: Email notifications are valuable because:

- **Wide availability** - Email is widely available and accessible
- **Rich content** - Supports rich content and formatting
- **Delivery confirmation** - Provides delivery confirmation
- **Archive capability** - Enables alert archiving and history
- **Integration** - Integrates with existing email systems

**How**: Email notifications are implemented through:

```bash
# Example: Email notification system
#!/bin/bash

# Email configuration
SMTP_SERVER="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="alerts@company.com"
SMTP_PASS="password"
FROM_EMAIL="alerts@company.com"
TO_EMAIL="admin@company.com"

# Function to send email alert
send_email_alert() {
    local subject="$1"
    local body="$2"
    local priority="$3"

    # Create email content
    local email_content=$(cat << EOF
From: $FROM_EMAIL
To: $TO_EMAIL
Subject: $subject
X-Priority: $priority
Content-Type: text/plain; charset=UTF-8

$body

---
This is an automated alert from the monitoring system.
Time: $(date)
Host: $(hostname)
EOF
)

    # Send email using sendmail
    echo "$email_content" | sendmail -t

    # Alternative: Send email using curl
    # curl -s --url "smtp://$SMTP_SERVER:$SMTP_PORT" \
    #      --mail-from "$FROM_EMAIL" \
    #      --mail-rcpt "$TO_EMAIL" \
    #      --user "$SMTP_USER:$SMTP_PASS" \
    #      --upload-file - <<< "$email_content"
}

# Function to send HTML email alert
send_html_email_alert() {
    local subject="$1"
    local body="$2"
    local priority="$3"

    # Create HTML email content
    local html_content=$(cat << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>$subject</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .alert { border: 1px solid #ccc; padding: 15px; margin: 10px 0; }
        .critical { background-color: #ffebee; border-color: #f44336; }
        .high { background-color: #fff3e0; border-color: #ff9800; }
        .medium { background-color: #f3e5f5; border-color: #9c27b0; }
        .low { background-color: #e8f5e8; border-color: #4caf50; }
        .info { background-color: #e3f2fd; border-color: #2196f3; }
    </style>
</head>
<body>
    <h2>$subject</h2>
    <div class="alert $priority">
        <pre>$body</pre>
    </div>
    <p><small>This is an automated alert from the monitoring system.</small></p>
    <p><small>Time: $(date) | Host: $(hostname)</small></p>
</body>
</html>
EOF
)

    # Send HTML email
    echo "$html_content" | sendmail -t
}

# Function to send email with attachment
send_email_with_attachment() {
    local subject="$1"
    local body="$2"
    local attachment_file="$3"
    local priority="$4"

    # Create email with attachment
    local email_content=$(cat << EOF
From: $FROM_EMAIL
To: $TO_EMAIL
Subject: $subject
X-Priority: $priority
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="boundary123"

--boundary123
Content-Type: text/plain; charset=UTF-8

$body

--boundary123
Content-Type: application/octet-stream
Content-Disposition: attachment; filename="$(basename "$attachment_file")"

$(cat "$attachment_file")

--boundary123--
EOF
)

    echo "$email_content" | sendmail -t
}

# Example usage
send_cpu_alert() {
    local cpu_usage=$1
    local severity=$2

    local subject="CPU Alert - $(hostname)"
    local body="CPU usage is ${cpu_usage}% on $(hostname) at $(date)"
    local priority="high"

    if [ "$severity" -eq 1 ]; then
        priority="critical"
    fi

    send_email_alert "$subject" "$body" "$priority"
}
```

**Explanation**:

- **SMTP configuration** - Configures SMTP server settings
- **Email content** - Creates email content with headers
- **HTML support** - Supports HTML email formatting
- **Attachment support** - Supports email attachments
- **Priority handling** - Handles email priority levels

**Where**: Email notifications are used in:

- **Alert delivery** - Delivering alerts to personnel
- **System notifications** - Sending system notifications
- **Report delivery** - Delivering monitoring reports
- **Escalation** - Escalating alerts via email
- **Documentation** - Documenting alerts and incidents

### SMS Notifications

**What**: SMS notifications deliver alerts via SMS to mobile devices.

**Why**: SMS notifications are valuable because:

- **Immediate delivery** - Provides immediate alert delivery
- **Mobile access** - Enables mobile access to alerts
- **High reliability** - SMS has high delivery reliability
- **Urgent alerts** - Suitable for urgent and critical alerts
- **Backup channel** - Serves as backup notification channel

**How**: SMS notifications are implemented through:

```bash
# Example: SMS notification system
#!/bin/bash

# SMS configuration
SMS_API_URL="https://api.twilio.com/2010-04-01/Accounts"
SMS_ACCOUNT_SID="your_account_sid"
SMS_AUTH_TOKEN="your_auth_token"
SMS_FROM_NUMBER="+1234567890"
SMS_TO_NUMBER="+0987654321"

# Function to send SMS alert
send_sms_alert() {
    local message="$1"
    local priority="$2"

    # Truncate message if too long
    if [ ${#message} -gt 160 ]; then
        message="${message:0:157}..."
    fi

    # Send SMS using curl
    curl -X POST "$SMS_API_URL/$SMS_ACCOUNT_SID/Messages.json" \
         -u "$SMS_ACCOUNT_SID:$SMS_AUTH_TOKEN" \
         -d "From=$SMS_FROM_NUMBER" \
         -d "To=$SMS_TO_NUMBER" \
         -d "Body=$message"
}

# Function to send SMS with retry
send_sms_with_retry() {
    local message="$1"
    local priority="$2"
    local max_retries=3
    local retry_count=0

    while [ $retry_count -lt $max_retries ]; do
        if send_sms_alert "$message" "$priority"; then
            echo "SMS sent successfully"
            return 0
        else
            echo "SMS send failed, retrying..."
            ((retry_count++))
            sleep 5
        fi
    done

    echo "SMS send failed after $max_retries retries"
    return 1
}

# Function to send critical SMS alert
send_critical_sms_alert() {
    local alert_type="$1"
    local value="$2"
    local threshold="$3"

    local message="CRITICAL: $alert_type usage is ${value}% (threshold: ${threshold}%) on $(hostname) at $(date)"

    send_sms_with_retry "$message" "critical"
}

# Example usage
send_cpu_sms_alert() {
    local cpu_usage=$1
    local severity=$2

    if [ "$severity" -le 2 ]; then  # Critical or High
        local message="CPU Alert: ${cpu_usage}% usage on $(hostname) at $(date)"
        send_sms_with_retry "$message" "high"
    fi
}
```

**Explanation**:

- **SMS API integration** - Integrates with SMS API services
- **Message truncation** - Truncates messages to fit SMS limits
- **Retry mechanism** - Implements retry mechanism for failed sends
- **Priority handling** - Handles different priority levels
- **Critical alerts** - Sends critical alerts via SMS

**Where**: SMS notifications are used in:

- **Critical alerts** - Sending critical alerts
- **Mobile notifications** - Mobile device notifications
- **Urgent alerts** - Urgent alert delivery
- **Backup notifications** - Backup notification channel
- **Emergency alerts** - Emergency alert systems

### Webhook Notifications

**What**: Webhook notifications deliver alerts via HTTP POST requests to webhook endpoints.

**Why**: Webhook notifications are valuable because:

- **Integration** - Integrates with external systems and services
- **Real-time delivery** - Provides real-time alert delivery
- **Custom processing** - Enables custom alert processing
- **Automation** - Supports automated response and actions
- **Flexibility** - Provides flexibility in alert handling

**How**: Webhook notifications are implemented through:

```bash
# Example: Webhook notification system
#!/bin/bash

# Webhook configuration
WEBHOOK_URL="https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK"
WEBHOOK_TIMEOUT=30
WEBHOOK_RETRIES=3

# Function to send webhook alert
send_webhook_alert() {
    local alert_data="$1"
    local webhook_url="$2"

    # Send webhook using curl
    curl -X POST "$webhook_url" \
         -H "Content-Type: application/json" \
         -d "$alert_data" \
         --timeout $WEBHOOK_TIMEOUT \
         --retry $WEBHOOK_RETRIES
}

# Function to create Slack webhook payload
create_slack_payload() {
    local alert_type="$1"
    local severity="$2"
    local value="$3"
    local threshold="$4"
    local hostname=$(hostname)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    # Determine color based on severity
    local color="good"
    case $severity in
        1) color="danger" ;;  # Critical
        2) color="warning" ;; # High
        3) color="warning" ;; # Medium
        4) color="good" ;;    # Low
        5) color="good" ;;    # Info
    esac

    cat << EOF
{
    "text": "Alert: $alert_type $severity",
    "attachments": [
        {
            "color": "$color",
            "fields": [
                {
                    "title": "Host",
                    "value": "$hostname",
                    "short": true
                },
                {
                    "title": "Alert Type",
                    "value": "$alert_type",
                    "short": true
                },
                {
                    "title": "Current Value",
                    "value": "${value}%",
                    "short": true
                },
                {
                    "title": "Threshold",
                    "value": "${threshold}%",
                    "short": true
                },
                {
                    "title": "Time",
                    "value": "$timestamp",
                    "short": false
                }
            ]
        }
    ]
}
EOF
}

# Function to create generic webhook payload
create_generic_payload() {
    local alert_type="$1"
    local severity="$2"
    local value="$3"
    local threshold="$4"
    local hostname=$(hostname)
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    cat << EOF
{
    "alert_type": "$alert_type",
    "severity": "$severity",
    "value": $value,
    "threshold": $threshold,
    "hostname": "$hostname",
    "timestamp": "$timestamp",
    "message": "$alert_type usage is ${value}%, exceeding threshold of ${threshold}%"
}
EOF
}

# Function to send Slack alert
send_slack_alert() {
    local alert_type="$1"
    local severity="$2"
    local value="$3"
    local threshold="$4"

    local payload=$(create_slack_payload "$alert_type" "$severity" "$value" "$threshold")
    send_webhook_alert "$payload" "$WEBHOOK_URL"
}

# Function to send generic webhook alert
send_generic_webhook_alert() {
    local alert_type="$1"
    local severity="$2"
    local value="$3"
    local threshold="$4"
    local webhook_url="$5"

    local payload=$(create_generic_payload "$alert_type" "$severity" "$value" "$threshold")
    send_webhook_alert "$payload" "$webhook_url"
}

# Example usage
send_cpu_webhook_alert() {
    local cpu_usage=$1
    local severity=$2
    local threshold=$3

    send_slack_alert "CPU" "$severity" "$cpu_usage" "$threshold"
}
```

**Explanation**:

- **Webhook integration** - Integrates with webhook services
- **JSON payloads** - Creates JSON payloads for webhooks
- **Slack integration** - Integrates with Slack webhooks
- **Generic webhooks** - Supports generic webhook endpoints
- **Retry mechanism** - Implements retry mechanism for failed sends

**Where**: Webhook notifications are used in:

- **External integrations** - Integrating with external systems
- **Automation** - Automating alert responses
- **Custom processing** - Custom alert processing
- **Real-time delivery** - Real-time alert delivery
- **System integration** - Integrating with monitoring systems

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Alerting Fundamentals** - You understand alerting fundamentals and best practices
2. **Alert Types and Severity** - You can categorize and prioritize alerts
3. **Alert Conditions** - You know how to implement alert conditions and triggers
4. **Notification Channels** - You can implement multiple notification channels
5. **Alert Management** - You understand alert management and lifecycle

**Why** these concepts matter:

- **Proactive monitoring** - Enables proactive system monitoring
- **Rapid response** - Ensures rapid response to issues
- **System reliability** - Maintains system reliability and availability
- **Operational efficiency** - Improves operational efficiency
- **Professional development** - Prepares you for operations roles

**When** to use these concepts:

- **Production systems** - When monitoring production systems
- **Critical applications** - When monitoring critical applications
- **24/7 operations** - When implementing 24/7 monitoring
- **Incident response** - When responding to incidents
- **System maintenance** - During system maintenance

**Where** these skills apply:

- **Embedded Linux development** - Monitoring embedded systems
- **System administration** - Managing and monitoring systems
- **DevOps** - Implementing monitoring and alerting
- **Site reliability engineering** - Ensuring system reliability
- **Operations** - Managing system operations

## Next Steps

**What** you're ready for next:

After mastering alerting and notification systems, you should be ready to:

1. **Learn about incident response** - Master incident response and management
2. **Explore capacity planning** - Learn capacity planning and scaling
3. **Study security monitoring** - Learn security monitoring and threat detection
4. **Begin disaster recovery** - Learn disaster recovery and business continuity
5. **Continue learning** - Build on this foundation for advanced topics

**Where** to go next:

Continue with the next lesson on **"Incident Response and Management"** to learn:

- How to respond to incidents and outages
- Incident management processes and procedures
- Post-incident analysis and improvement
- Crisis communication and coordination

**Why** the next lesson is important:

The next lesson builds on your alerting knowledge by showing you how to effectively respond to and manage incidents when alerts are triggered, which is crucial for maintaining system reliability.

**How** to continue learning:

1. **Practice alerting** - Implement alerting systems in your projects
2. **Study monitoring tools** - Learn more about monitoring and alerting tools
3. **Read operations documentation** - Explore operations and monitoring documentation
4. **Join operations communities** - Engage with operations professionals
5. **Build operations skills** - Start creating operations-focused applications

## Resources

**Official Documentation**:

- [Prometheus Alerting](https://prometheus.io/docs/alerting/latest/overview/) - Prometheus alerting documentation
- [Grafana Alerting](https://grafana.com/docs/grafana/latest/alerting/) - Grafana alerting documentation
- [Nagios](https://www.nagios.org/documentation/) - Nagios documentation

**Community Resources**:

- [Linux Monitoring](https://elinux.org/Monitoring) - Embedded Linux monitoring resources
- [Stack Overflow](https://stackoverflow.com/questions/tagged/alerting) - Technical Q&A
- [Reddit r/sysadmin](https://reddit.com/r/sysadmin) - System administration discussions

**Learning Resources**:

- [Site Reliability Engineering](https://www.oreilly.com/library/view/site-reliability-engineering/9781491929114/) - SRE practices
- [Incident Response](https://www.oreilly.com/library/view/incident-response/9781492038861/) - Incident response guide
- [Monitoring and Observability](https://www.oreilly.com/library/view/monitoring-and-observability/9781492052317/) - Monitoring practices

Happy learning! 🚨
