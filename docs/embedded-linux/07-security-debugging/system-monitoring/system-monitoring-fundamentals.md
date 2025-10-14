---
sidebar_position: 1
---

# System Monitoring Fundamentals

Master system monitoring fundamentals for embedded Linux systems with comprehensive explanations using the 4W+H framework.

## What is System Monitoring?

**What**: System monitoring involves continuously observing and analyzing system performance, health, and behavior to ensure optimal operation and early detection of issues.

**Why**: System monitoring is essential because:

- **Proactive maintenance** - Prevents issues before they become critical
- **Performance optimization** - Identifies performance bottlenecks and optimization opportunities
- **Resource management** - Ensures efficient use of system resources
- **Availability assurance** - Maintains system availability and reliability
- **Capacity planning** - Helps plan for future resource needs

**When**: System monitoring should be implemented when:

- **Production systems** - Systems running in production environments
- **Critical applications** - Applications with high availability requirements
- **Resource-constrained systems** - Systems with limited resources
- **Performance-sensitive systems** - Systems where performance is critical
- **Maintenance windows** - During system maintenance and updates

**How**: System monitoring is implemented through:

- **Monitoring tools** - Using specialized monitoring software and tools
- **Metrics collection** - Collecting system metrics and performance data
- **Alerting systems** - Implementing alerting and notification systems
- **Dashboards** - Creating monitoring dashboards and visualizations
- **Logging systems** - Implementing comprehensive logging systems

**Where**: System monitoring is used in:

- **Embedded systems** - IoT devices, industrial controllers, medical devices
- **Server systems** - Enterprise servers and cloud infrastructure
- **Mobile devices** - Smartphones, tablets, and wearables
- **Automotive systems** - Connected vehicles and autonomous systems
- **Consumer electronics** - Smart TVs, gaming consoles, routers

## Monitoring Metrics

**What**: Monitoring metrics are quantifiable measurements that provide insight into system performance, health, and behavior.

**Why**: Monitoring metrics are important because:

- **Performance measurement** - Measures system performance objectively
- **Trend analysis** - Enables analysis of performance trends over time
- **Capacity planning** - Helps plan for future resource needs
- **Issue detection** - Enables early detection of potential issues
- **Optimization guidance** - Provides guidance for system optimization

### System Resource Metrics

**What**: System resource metrics measure the usage and availability of system resources such as CPU, memory, disk, and network.

**Why**: System resource metrics are crucial because:

- **Resource utilization** - Monitors resource utilization and efficiency
- **Bottleneck identification** - Identifies resource bottlenecks
- **Capacity planning** - Helps plan resource capacity
- **Performance optimization** - Guides performance optimization
- **Issue prevention** - Prevents resource-related issues

**How**: System resource metrics are collected through:

```bash
# Example: System resource monitoring
#!/bin/bash

# CPU monitoring
echo "=== CPU Information ==="
echo "CPU cores: $(nproc)"
echo "CPU model: $(lscpu | grep "Model name" | cut -d: -f2 | xargs)"
echo "CPU usage:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1

# Memory monitoring
echo "=== Memory Information ==="
echo "Total memory: $(free -h | grep "Mem:" | awk '{print $2}')"
echo "Used memory: $(free -h | grep "Mem:" | awk '{print $3}')"
echo "Available memory: $(free -h | grep "Mem:" | awk '{print $7}')"
echo "Memory usage percentage: $(free | grep "Mem:" | awk '{printf "%.2f%%", $3/$2 * 100.0}')"

# Disk monitoring
echo "=== Disk Information ==="
echo "Disk usage:"
df -h
echo "Disk I/O:"
iostat -x 1 1

# Network monitoring
echo "=== Network Information ==="
echo "Network interfaces:"
ip addr show
echo "Network connections:"
ss -tuln | wc -l
echo "Network statistics:"
cat /proc/net/dev

# Process monitoring
echo "=== Process Information ==="
echo "Total processes: $(ps aux | wc -l)"
echo "Running processes: $(ps aux | grep -v "\[" | wc -l)"
echo "Top 5 processes by CPU:"
ps aux --sort=-%cpu | head -6
echo "Top 5 processes by memory:"
ps aux --sort=-%mem | head -6

# Load average
echo "=== Load Average ==="
echo "Load average: $(cat /proc/loadavg)"
echo "Uptime: $(uptime)"

# System information
echo "=== System Information ==="
echo "Kernel version: $(uname -r)"
echo "System uptime: $(uptime -p)"
echo "Last boot: $(who -b | awk '{print $3, $4}')"
echo "Current time: $(date)"
```

**Explanation**:

- **CPU monitoring** - Monitors CPU usage, cores, and model information
- **Memory monitoring** - Monitors memory usage, availability, and percentage
- **Disk monitoring** - Monitors disk usage and I/O operations
- **Network monitoring** - Monitors network interfaces and connections
- **Process monitoring** - Monitors running processes and resource usage

**Where**: System resource metrics are used in:

- **Performance monitoring** - Monitoring system performance
- **Capacity planning** - Planning system capacity
- **Resource optimization** - Optimizing resource usage
- **Issue detection** - Detecting resource-related issues
- **System administration** - Managing system resources

### Application Metrics

**What**: Application metrics measure the performance and behavior of specific applications and services.

**Why**: Application metrics are important because:

- **Application performance** - Monitors application performance
- **User experience** - Ensures good user experience
- **Service availability** - Monitors service availability
- **Error tracking** - Tracks application errors and exceptions
- **Business metrics** - Tracks business-relevant metrics

**How**: Application metrics are collected through:

```c
// Example: Application metrics collection
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <time.h>
#include <sys/time.h>
#include <unistd.h>

// Application metrics structure
typedef struct {
    unsigned long requests_total;
    unsigned long requests_success;
    unsigned long requests_error;
    double response_time_avg;
    double response_time_max;
    time_t start_time;
    time_t last_request_time;
} app_metrics_t;

// Global metrics instance
static app_metrics_t metrics = {0};

// Initialize metrics
void init_metrics() {
    metrics.start_time = time(NULL);
    metrics.last_request_time = 0;
}

// Record request
void record_request(int success, double response_time) {
    metrics.requests_total++;

    if (success) {
        metrics.requests_success++;
    } else {
        metrics.requests_error++;
    }

    // Update average response time
    metrics.response_time_avg =
        (metrics.response_time_avg * (metrics.requests_total - 1) + response_time) /
        metrics.requests_total;

    // Update max response time
    if (response_time > metrics.response_time_max) {
        metrics.response_time_max = response_time;
    }

    metrics.last_request_time = time(NULL);
}

// Get metrics
app_metrics_t* get_metrics() {
    return &metrics;
}

// Print metrics
void print_metrics() {
    time_t now = time(NULL);
    double uptime = difftime(now, metrics.start_time);
    double requests_per_second = metrics.requests_total / uptime;
    double success_rate = (double)metrics.requests_success / metrics.requests_total * 100.0;

    printf("=== Application Metrics ===\n");
    printf("Uptime: %.2f seconds\n", uptime);
    printf("Total requests: %lu\n", metrics.requests_total);
    printf("Successful requests: %lu\n", metrics.requests_success);
    printf("Error requests: %lu\n", metrics.requests_error);
    printf("Success rate: %.2f%%\n", success_rate);
    printf("Requests per second: %.2f\n", requests_per_second);
    printf("Average response time: %.2f ms\n", metrics.response_time_avg);
    printf("Max response time: %.2f ms\n", metrics.response_time_max);
    printf("Last request: %s", ctime(&metrics.last_request_time));
}

// Export metrics to file
void export_metrics(const char* filename) {
    FILE* fp = fopen(filename, "w");
    if (fp == NULL) {
        perror("fopen");
        return;
    }

    time_t now = time(NULL);
    double uptime = difftime(now, metrics.start_time);
    double requests_per_second = metrics.requests_total / uptime;
    double success_rate = (double)metrics.requests_success / metrics.requests_total * 100.0;

    fprintf(fp, "# HELP app_requests_total Total number of requests\n");
    fprintf(fp, "# TYPE app_requests_total counter\n");
    fprintf(fp, "app_requests_total %lu\n", metrics.requests_total);

    fprintf(fp, "# HELP app_requests_success Number of successful requests\n");
    fprintf(fp, "# TYPE app_requests_success counter\n");
    fprintf(fp, "app_requests_success %lu\n", metrics.requests_success);

    fprintf(fp, "# HELP app_requests_error Number of error requests\n");
    fprintf(fp, "# TYPE app_requests_error counter\n");
    fprintf(fp, "app_requests_error %lu\n", metrics.requests_error);

    fprintf(fp, "# HELP app_success_rate Success rate percentage\n");
    fprintf(fp, "# TYPE app_success_rate gauge\n");
    fprintf(fp, "app_success_rate %.2f\n", success_rate);

    fprintf(fp, "# HELP app_requests_per_second Requests per second\n");
    fprintf(fp, "# TYPE app_requests_per_second gauge\n");
    fprintf(fp, "app_requests_per_second %.2f\n", requests_per_second);

    fprintf(fp, "# HELP app_response_time_avg Average response time in milliseconds\n");
    fprintf(fp, "# TYPE app_response_time_avg gauge\n");
    fprintf(fp, "app_response_time_avg %.2f\n", metrics.response_time_avg);

    fprintf(fp, "# HELP app_response_time_max Maximum response time in milliseconds\n");
    fprintf(fp, "# TYPE app_response_time_max gauge\n");
    fprintf(fp, "app_response_time_max %.2f\n", metrics.response_time_max);

    fclose(fp);
}

// Example usage
int main() {
    init_metrics();

    // Simulate some requests
    for (int i = 0; i < 100; i++) {
        int success = (rand() % 10) != 0;  // 90% success rate
        double response_time = (double)(rand() % 100) / 10.0;  // 0-10ms

        record_request(success, response_time);
        usleep(10000);  // 10ms delay
    }

    print_metrics();
    export_metrics("metrics.prom");

    return 0;
}
```

**Explanation**:

- **Metrics structure** - Defines application metrics structure
- **Request recording** - Records request metrics
- **Metrics calculation** - Calculates derived metrics
- **Metrics export** - Exports metrics in Prometheus format
- **Real-time monitoring** - Provides real-time metrics

**Where**: Application metrics are used in:

- **Application monitoring** - Monitoring application performance
- **Service monitoring** - Monitoring service availability
- **User experience** - Ensuring good user experience
- **Business intelligence** - Tracking business metrics
- **Performance optimization** - Optimizing application performance

## Monitoring Tools

**What**: Monitoring tools are software applications and utilities used to collect, analyze, and visualize system metrics and performance data.

**Why**: Monitoring tools are valuable because:

- **Automation** - Automates monitoring and alerting
- **Visualization** - Provides visual representation of data
- **Analysis** - Enables analysis of monitoring data
- **Alerting** - Provides alerting and notification capabilities
- **Integration** - Integrates with other systems and tools

### System Monitoring Tools

**What**: System monitoring tools monitor system resources, performance, and health.

**Why**: System monitoring tools are important because:

- **System visibility** - Provides visibility into system behavior
- **Performance monitoring** - Monitors system performance
- **Resource management** - Manages system resources
- **Issue detection** - Detects system issues early
- **Capacity planning** - Helps with capacity planning

**How**: System monitoring tools are used through:

```bash
# Example: System monitoring tools setup
# Install monitoring tools
sudo apt-get update
sudo apt-get install htop iotop nethogs sysstat

# Basic system monitoring
htop
iotop
nethogs

# System statistics
sar -u 1 10        # CPU usage
sar -r 1 10        # Memory usage
sar -d 1 10        # Disk I/O
sar -n DEV 1 10    # Network statistics

# Custom monitoring script
cat > system_monitor.sh << 'EOF'
#!/bin/bash

# Configuration
LOG_FILE="/var/log/system_monitor.log"
ALERT_CPU=80
ALERT_MEMORY=80
ALERT_DISK=90

# Function to log with timestamp
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to check CPU usage
check_cpu() {
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | cut -d'%' -f1)
    local cpu_int=${cpu_usage%.*}

    if [ "$cpu_int" -gt "$ALERT_CPU" ]; then
        log_message "ALERT: High CPU usage: ${cpu_usage}%"
        return 1
    fi

    log_message "CPU usage: ${cpu_usage}%"
    return 0
}

# Function to check memory usage
check_memory() {
    local memory_usage=$(free | grep "Mem:" | awk '{printf "%.0f", $3/$2 * 100.0}')

    if [ "$memory_usage" -gt "$ALERT_MEMORY" ]; then
        log_message "ALERT: High memory usage: ${memory_usage}%"
        return 1
    fi

    log_message "Memory usage: ${memory_usage}%"
    return 0
}

# Function to check disk usage
check_disk() {
    local disk_usage=$(df / | tail -1 | awk '{print $5}' | cut -d'%' -f1)

    if [ "$disk_usage" -gt "$ALERT_DISK" ]; then
        log_message "ALERT: High disk usage: ${disk_usage}%"
        return 1
    fi

    log_message "Disk usage: ${disk_usage}%"
    return 0
}

# Function to check system load
check_load() {
    local load_avg=$(cat /proc/loadavg | awk '{print $1}')
    local cpu_cores=$(nproc)
    local load_threshold=$(echo "$cpu_cores * 0.8" | bc)

    if (( $(echo "$load_avg > $load_threshold" | bc -l) )); then
        log_message "ALERT: High system load: ${load_avg} (cores: ${cpu_cores})"
        return 1
    fi

    log_message "System load: ${load_avg} (cores: ${cpu_cores})"
    return 0
}

# Function to check network connections
check_network() {
    local connections=$(ss -tuln | wc -l)
    local max_connections=1000

    if [ "$connections" -gt "$max_connections" ]; then
        log_message "ALERT: High number of network connections: ${connections}"
        return 1
    fi

    log_message "Network connections: ${connections}"
    return 0
}

# Main monitoring loop
main() {
    log_message "Starting system monitoring"

    while true; do
        check_cpu
        check_memory
        check_disk
        check_load
        check_network

        sleep 60
    done
}

# Run monitoring
main
EOF

chmod +x system_monitor.sh
./system_monitor.sh &
```

**Explanation**:

- **htop** - Interactive process viewer and system monitor
- **iotop** - I/O monitoring tool
- **nethogs** - Network usage monitoring
- **sar** - System activity reporter
- **Custom monitoring** - Custom monitoring script with alerting

**Where**: System monitoring tools are used in:

- **System administration** - Managing system resources
- **Performance monitoring** - Monitoring system performance
- **Issue detection** - Detecting system issues
- **Capacity planning** - Planning system capacity
- **Maintenance** - During system maintenance

### Application Monitoring Tools

**What**: Application monitoring tools monitor specific applications and services.

**Why**: Application monitoring tools are valuable because:

- **Application visibility** - Provides visibility into application behavior
- **Performance monitoring** - Monitors application performance
- **Error tracking** - Tracks application errors
- **User experience** - Monitors user experience
- **Business metrics** - Tracks business-relevant metrics

**How**: Application monitoring tools are implemented through:

```bash
# Example: Application monitoring setup
# Install application monitoring tools
sudo apt-get install prometheus-node-exporter grafana

# Configure Prometheus
cat > /etc/prometheus/prometheus.yml << 'EOF'
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'application'
    static_configs:
      - targets: ['localhost:8080']
    metrics_path: '/metrics'
    scrape_interval: 5s
EOF

# Start Prometheus
systemctl start prometheus
systemctl enable prometheus

# Configure Grafana
systemctl start grafana-server
systemctl enable grafana-server

# Access Grafana
# http://localhost:3000
# Default login: admin/admin

# Custom application metrics endpoint
cat > metrics_server.c << 'EOF'
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>

// Simple HTTP server for metrics
int main() {
    int server_fd, new_socket;
    struct sockaddr_in address;
    int opt = 1;
    int addrlen = sizeof(address);

    // Create socket
    if ((server_fd = socket(AF_INET, SOCK_STREAM, 0)) == 0) {
        perror("socket failed");
        exit(EXIT_FAILURE);
    }

    // Set socket options
    if (setsockopt(server_fd, SOL_SOCKET, SO_REUSEADDR | SO_REUSEPORT, &opt, sizeof(opt))) {
        perror("setsockopt");
        exit(EXIT_FAILURE);
    }

    address.sin_family = AF_INET;
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_port = htons(8080);

    // Bind socket
    if (bind(server_fd, (struct sockaddr *)&address, sizeof(address)) < 0) {
        perror("bind failed");
        exit(EXIT_FAILURE);
    }

    // Listen for connections
    if (listen(server_fd, 3) < 0) {
        perror("listen");
        exit(EXIT_FAILURE);
    }

    printf("Metrics server listening on port 8080\n");

    while (1) {
        if ((new_socket = accept(server_fd, (struct sockaddr *)&address, (socklen_t*)&addrlen)) < 0) {
            perror("accept");
            exit(EXIT_FAILURE);
        }

        // Send metrics response
        char response[] = "HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\n\r\n# HELP app_requests_total Total requests\n# TYPE app_requests_total counter\napp_requests_total 100\n";
        send(new_socket, response, strlen(response), 0);
        close(new_socket);
    }

    return 0;
}
EOF

gcc -o metrics_server metrics_server.c
./metrics_server &
```

**Explanation**:

- **Prometheus** - Metrics collection and storage
- **Grafana** - Metrics visualization and dashboards
- **Node Exporter** - System metrics collection
- **Custom metrics** - Custom application metrics endpoint
- **HTTP server** - Simple HTTP server for metrics

**Where**: Application monitoring tools are used in:

- **Application monitoring** - Monitoring application performance
- **Service monitoring** - Monitoring service availability
- **Business intelligence** - Tracking business metrics
- **Performance optimization** - Optimizing application performance
- **User experience** - Monitoring user experience

## Key Takeaways

**What** you've accomplished in this lesson:

1. **System Monitoring** - You understand system monitoring fundamentals
2. **Monitoring Metrics** - You can collect and analyze system and application metrics
3. **Monitoring Tools** - You know how to use monitoring tools effectively
4. **Custom Monitoring** - You can implement custom monitoring solutions
5. **Monitoring Best Practices** - You understand monitoring best practices

**Why** these concepts matter:

- **System reliability** - Enhances system reliability and availability
- **Performance optimization** - Enables performance optimization
- **Proactive maintenance** - Enables proactive system maintenance
- **Professional development** - Prepares you for system administration roles
- **System understanding** - Improves understanding of system behavior

**When** to use these concepts:

- **Production systems** - When managing production systems
- **Performance monitoring** - When monitoring system performance
- **Issue detection** - When detecting and resolving issues
- **Capacity planning** - When planning system capacity
- **Maintenance** - During system maintenance

**Where** these skills apply:

- **Embedded Linux development** - Monitoring embedded systems
- **System administration** - Managing and monitoring systems
- **DevOps** - Implementing monitoring and alerting
- **Performance engineering** - Optimizing system performance
- **Site reliability engineering** - Ensuring system reliability

## Next Steps

**What** you're ready for next:

After mastering system monitoring fundamentals, you should be ready to:

1. **Learn about advanced monitoring** - Master advanced monitoring techniques
2. **Explore alerting systems** - Learn alerting and notification systems
3. **Study performance optimization** - Learn performance optimization techniques
4. **Begin incident response** - Learn incident response and management
5. **Continue learning** - Build on this foundation for advanced topics

**Where** to go next:

Continue with the next lesson on **"Performance Monitoring and Optimization"** to learn:

- How to monitor and optimize system performance
- Performance profiling and analysis
- Bottleneck identification and resolution
- Performance tuning techniques

**Why** the next lesson is important:

The next lesson builds on your monitoring knowledge by focusing specifically on performance monitoring and optimization, which is crucial for maintaining optimal system performance.

**How** to continue learning:

1. **Practice monitoring** - Implement monitoring in your projects
2. **Study monitoring tools** - Learn more about monitoring tools
3. **Read monitoring documentation** - Explore monitoring tool documentation
4. **Join monitoring communities** - Engage with monitoring professionals
5. **Build monitoring skills** - Start creating monitoring-focused applications

## Resources

**Official Documentation**:

- [Prometheus](https://prometheus.io/docs/) - Prometheus documentation
- [Grafana](https://grafana.com/docs/) - Grafana documentation
- [Node Exporter](https://github.com/prometheus/node_exporter) - Node Exporter documentation

**Community Resources**:

- [Linux Monitoring](https://elinux.org/Monitoring) - Embedded Linux monitoring resources
- [Stack Overflow](https://stackoverflow.com/questions/tagged/monitoring) - Technical Q&A
- [Reddit r/sysadmin](https://reddit.com/r/sysadmin) - System administration discussions

**Learning Resources**:

- [System Monitoring](https://www.oreilly.com/library/view/system-monitoring/9781492048458/) - System monitoring guide
- [Linux Performance](https://www.oreilly.com/library/view/linux-performance/9781492052317/) - Linux performance tuning
- [Site Reliability Engineering](https://www.oreilly.com/library/view/site-reliability-engineering/9781491929114/) - SRE practices

Happy learning! 📊
