---
sidebar_position: 2
---

# Socket Programming

Master socket programming for embedded Linux systems with comprehensive explanations using the 4W+H framework.

## What is Socket Programming?

**What**: Socket programming is a method of network communication that allows applications to send and receive data over networks using standardized interfaces. It provides a programming interface for network communication protocols like TCP and UDP.

**Why**: Understanding socket programming is crucial because:

- **Network communication** enables data exchange between devices
- **Protocol implementation** provides access to TCP/IP stack
- **Real-time communication** supports time-sensitive applications
- **System integration** connects embedded devices to networks
- **Professional development** is essential for embedded Linux programming

**When**: Socket programming is used when:

- **Client-server applications** require network communication
- **Real-time systems** need low-latency data exchange
- **IoT applications** connect devices to cloud services
- **Industrial systems** implement network protocols
- **Remote monitoring** requires data transmission

**How**: Socket programming works by:

- **Socket creation** establishing communication endpoints
- **Address binding** associating sockets with network addresses
- **Data transmission** sending and receiving data packets
- **Connection management** handling connection states
- **Error handling** managing communication failures

**Where**: Socket programming is used in:

- **Embedded systems** - IoT devices and industrial controllers
- **Network services** - Web servers and API endpoints
- **Real-time applications** - Control systems and monitoring
- **Communication protocols** - Custom protocol implementation
- **System integration** - Connecting different system components

## TCP Socket Programming

**What**: TCP (Transmission Control Protocol) socket programming provides reliable, connection-oriented communication with error detection and correction.

**Why**: TCP is valuable because:

- **Reliability** ensures data delivery without loss or corruption
- **Ordering** guarantees data arrives in correct sequence
- **Flow control** prevents data overflow at receiver
- **Error detection** identifies and corrects transmission errors
- **Connection management** provides session establishment and teardown

**How**: TCP sockets are implemented through:

```c
// Example: TCP server implementation
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <signal.h>

#define PORT 8080
#define BUFFER_SIZE 1024
#define MAX_CLIENTS 10

typedef struct {
    int socket_fd;
    struct sockaddr_in address;
    char client_ip[INET_ADDRSTRLEN];
    int port;
} client_info_t;

static int server_socket;
static client_info_t clients[MAX_CLIENTS];
static int client_count = 0;

// Signal handler for graceful shutdown
void signal_handler(int sig) {
    printf("\nShutting down server...\n");
    close(server_socket);
    exit(0);
}

// Initialize server socket
int init_server() {
    struct sockaddr_in server_addr;
    int opt = 1;

    // Create socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Failed to create socket");
        return -1;
    }

    // Set socket options
    if (setsockopt(server_socket, SOL_SOCKET, SO_REUSEADDR, &opt, sizeof(opt)) < 0) {
        perror("Failed to set socket options");
        close(server_socket);
        return -1;
    }

    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // Bind socket to address
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Failed to bind socket");
        close(server_socket);
        return -1;
    }

    // Listen for connections
    if (listen(server_socket, MAX_CLIENTS) < 0) {
        perror("Failed to listen");
        close(server_socket);
        return -1;
    }

    printf("Server listening on port %d\n", PORT);
    return 0;
}

// Handle client connection
void* handle_client(void* arg) {
    client_info_t* client = (client_info_t*)arg;
    char buffer[BUFFER_SIZE];
    int bytes_received;

    printf("Client connected: %s:%d\n", client->client_ip, client->port);

    while (1) {
        // Receive data from client
        bytes_received = recv(client->socket_fd, buffer, BUFFER_SIZE - 1, 0);

        if (bytes_received <= 0) {
            if (bytes_received == 0) {
                printf("Client disconnected: %s:%d\n", client->client_ip, client->port);
            } else {
                perror("Failed to receive data");
            }
            break;
        }

        // Null-terminate received data
        buffer[bytes_received] = '\0';
        printf("Received from %s:%d: %s", client->client_ip, client->port, buffer);

        // Echo data back to client
        if (send(client->socket_fd, buffer, bytes_received, 0) < 0) {
            perror("Failed to send data");
            break;
        }
    }

    // Close client socket
    close(client->socket_fd);
    return NULL;
}

// Accept client connections
void accept_connections() {
    struct sockaddr_in client_addr;
    socklen_t client_addr_len = sizeof(client_addr);
    pthread_t thread_id;

    while (1) {
        // Accept new connection
        int client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_addr_len);
        if (client_socket < 0) {
            perror("Failed to accept connection");
            continue;
        }

        // Check if we can handle more clients
        if (client_count >= MAX_CLIENTS) {
            printf("Maximum clients reached, rejecting connection\n");
            close(client_socket);
            continue;
        }

        // Store client information
        clients[client_count].socket_fd = client_socket;
        clients[client_count].address = client_addr;
        inet_ntop(AF_INET, &client_addr.sin_addr, clients[client_count].client_ip, INET_ADDRSTRLEN);
        clients[client_count].port = ntohs(client_addr.sin_port);

        // Create thread to handle client
        if (pthread_create(&thread_id, NULL, handle_client, &clients[client_count]) != 0) {
            perror("Failed to create thread");
            close(client_socket);
            continue;
        }

        client_count++;
        printf("Client %d connected\n", client_count);
    }
}

int main() {
    // Set up signal handler
    signal(SIGINT, signal_handler);

    // Initialize server
    if (init_server() < 0) {
        printf("Failed to initialize server\n");
        return -1;
    }

    // Accept connections
    accept_connections();

    return 0;
}
```

**Explanation**:

- **Socket creation** - `socket()` creates TCP socket with `SOCK_STREAM`
- **Address binding** - `bind()` associates socket with IP address and port
- **Connection listening** - `listen()` enables socket to accept connections
- **Client acceptance** - `accept()` creates new socket for each client
- **Data transmission** - `send()` and `recv()` handle data exchange

**Where**: TCP sockets are used in:

- **Web servers** - HTTP and HTTPS communication
- **Database connections** - Reliable data exchange
- **File transfer** - FTP and similar protocols
- **Remote procedure calls** - RPC and API communication
- **Real-time systems** - Control and monitoring applications

## UDP Socket Programming

**What**: UDP (User Datagram Protocol) socket programming provides connectionless, unreliable communication with minimal overhead.

**Why**: UDP is beneficial because:

- **Low latency** provides faster communication than TCP
- **Minimal overhead** reduces protocol overhead
- **Broadcast support** enables one-to-many communication
- **Real-time suitability** works well for time-sensitive data
- **Simplicity** easier to implement than TCP

**How**: UDP sockets are implemented through:

```c
// Example: UDP client-server implementation
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
#include <sys/time.h>

#define PORT 8080
#define BUFFER_SIZE 1024
#define TIMEOUT_SEC 5

// UDP Server implementation
int udp_server() {
    int server_socket;
    struct sockaddr_in server_addr, client_addr;
    char buffer[BUFFER_SIZE];
    socklen_t client_addr_len = sizeof(client_addr);
    int bytes_received;

    // Create UDP socket
    server_socket = socket(AF_INET, SOCK_DGRAM, 0);
    if (server_socket < 0) {
        perror("Failed to create socket");
        return -1;
    }

    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(PORT);

    // Bind socket to address
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0) {
        perror("Failed to bind socket");
        close(server_socket);
        return -1;
    }

    printf("UDP Server listening on port %d\n", PORT);

    while (1) {
        // Receive data from client
        bytes_received = recvfrom(server_socket, buffer, BUFFER_SIZE - 1, 0,
                                 (struct sockaddr*)&client_addr, &client_addr_len);

        if (bytes_received < 0) {
            perror("Failed to receive data");
            continue;
        }

        // Null-terminate received data
        buffer[bytes_received] = '\0';

        printf("Received from %s:%d: %s",
               inet_ntoa(client_addr.sin_addr),
               ntohs(client_addr.sin_port),
               buffer);

        // Echo data back to client
        if (sendto(server_socket, buffer, bytes_received, 0,
                   (struct sockaddr*)&client_addr, client_addr_len) < 0) {
            perror("Failed to send data");
        }
    }

    close(server_socket);
    return 0;
}

// UDP Client implementation
int udp_client(const char* server_ip) {
    int client_socket;
    struct sockaddr_in server_addr;
    char buffer[BUFFER_SIZE];
    char message[] = "Hello, UDP Server!";
    int bytes_sent, bytes_received;
    struct timeval timeout;

    // Create UDP socket
    client_socket = socket(AF_INET, SOCK_DGRAM, 0);
    if (client_socket < 0) {
        perror("Failed to create socket");
        return -1;
    }

    // Set receive timeout
    timeout.tv_sec = TIMEOUT_SEC;
    timeout.tv_usec = 0;
    if (setsockopt(client_socket, SOL_SOCKET, SO_RCVTIMEO, &timeout, sizeof(timeout)) < 0) {
        perror("Failed to set timeout");
        close(client_socket);
        return -1;
    }

    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_port = htons(PORT);
    inet_pton(AF_INET, server_ip, &server_addr.sin_addr);

    // Send message to server
    bytes_sent = sendto(client_socket, message, strlen(message), 0,
                        (struct sockaddr*)&server_addr, sizeof(server_addr));

    if (bytes_sent < 0) {
        perror("Failed to send data");
        close(client_socket);
        return -1;
    }

    printf("Sent: %s\n", message);

    // Receive response from server
    bytes_received = recvfrom(client_socket, buffer, BUFFER_SIZE - 1, 0, NULL, NULL);

    if (bytes_received < 0) {
        perror("Failed to receive data");
        close(client_socket);
        return -1;
    }

    // Null-terminate received data
    buffer[bytes_received] = '\0';
    printf("Received: %s\n", buffer);

    close(client_socket);
    return 0;
}

// Broadcast implementation
int udp_broadcast() {
    int broadcast_socket;
    struct sockaddr_in broadcast_addr;
    char message[] = "Broadcast message";
    int broadcast_enable = 1;

    // Create UDP socket
    broadcast_socket = socket(AF_INET, SOCK_DGRAM, 0);
    if (broadcast_socket < 0) {
        perror("Failed to create socket");
        return -1;
    }

    // Enable broadcast
    if (setsockopt(broadcast_socket, SOL_SOCKET, SO_BROADCAST,
                   &broadcast_enable, sizeof(broadcast_enable)) < 0) {
        perror("Failed to enable broadcast");
        close(broadcast_socket);
        return -1;
    }

    // Configure broadcast address
    memset(&broadcast_addr, 0, sizeof(broadcast_addr));
    broadcast_addr.sin_family = AF_INET;
    broadcast_addr.sin_port = htons(PORT);
    broadcast_addr.sin_addr.s_addr = INADDR_BROADCAST;

    // Send broadcast message
    if (sendto(broadcast_socket, message, strlen(message), 0,
               (struct sockaddr*)&broadcast_addr, sizeof(broadcast_addr)) < 0) {
        perror("Failed to send broadcast");
        close(broadcast_socket);
        return -1;
    }

    printf("Broadcast sent: %s\n", message);
    close(broadcast_socket);
    return 0;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printf("Usage: %s {server|client|broadcast} [server_ip]\n", argv[0]);
        return -1;
    }

    if (strcmp(argv[1], "server") == 0) {
        return udp_server();
    } else if (strcmp(argv[1], "client") == 0) {
        if (argc < 3) {
            printf("Server IP required for client mode\n");
            return -1;
        }
        return udp_client(argv[2]);
    } else if (strcmp(argv[1], "broadcast") == 0) {
        return udp_broadcast();
    } else {
        printf("Invalid mode: %s\n", argv[1]);
        return -1;
    }
}
```

**Explanation**:

- **Socket creation** - `socket()` creates UDP socket with `SOCK_DGRAM`
- **Address configuration** - Sets up server and client addresses
- **Data transmission** - `sendto()` and `recvfrom()` handle data exchange
- **Broadcast support** - Enables one-to-many communication
- **Timeout handling** - Implements receive timeouts for reliability

**Where**: UDP sockets are used in:

- **Real-time applications** - Gaming and multimedia streaming
- **Network discovery** - Service discovery protocols
- **Sensor data** - High-frequency sensor readings
- **Broadcast communication** - Network announcements
- **Custom protocols** - Lightweight communication protocols

## Network Protocol Implementation

**What**: Network protocol implementation involves creating custom communication protocols or implementing existing standards for embedded systems.

**Why**: Protocol implementation is important because:

- **Standardization** ensures compatibility with other systems
- **Optimization** allows custom protocols for specific needs
- **Integration** enables communication with existing systems
- **Efficiency** provides optimal performance for applications
- **Reliability** ensures robust communication

**How**: Protocol implementation is achieved through:

```c
// Example: Custom embedded communication protocol
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdint.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>

#define PROTOCOL_VERSION 1
#define MAX_PAYLOAD_SIZE 256
#define HEADER_SIZE 8

// Protocol message structure
typedef struct {
    uint8_t version;
    uint8_t type;
    uint16_t length;
    uint32_t sequence;
    uint8_t payload[MAX_PAYLOAD_SIZE];
} protocol_message_t;

// Message types
typedef enum {
    MSG_TYPE_DATA = 0x01,
    MSG_TYPE_ACK = 0x02,
    MSG_TYPE_NACK = 0x03,
    MSG_TYPE_HEARTBEAT = 0x04,
    MSG_TYPE_CONFIG = 0x05
} message_type_t;

// Protocol state
typedef struct {
    int socket_fd;
    uint32_t sequence_number;
    uint32_t last_ack_received;
    int timeout_ms;
    int retry_count;
} protocol_state_t;

// Initialize protocol
int protocol_init(protocol_state_t* state, int socket_fd) {
    state->socket_fd = socket_fd;
    state->sequence_number = 0;
    state->last_ack_received = 0;
    state->timeout_ms = 5000;
    state->retry_count = 3;
    return 0;
}

// Create protocol message
int create_message(protocol_message_t* msg, message_type_t type,
                   const uint8_t* payload, uint16_t payload_len) {
    if (payload_len > MAX_PAYLOAD_SIZE) {
        return -1;
    }

    msg->version = PROTOCOL_VERSION;
    msg->type = type;
    msg->length = payload_len;
    msg->sequence = 0; // Will be set by sender

    if (payload && payload_len > 0) {
        memcpy(msg->payload, payload, payload_len);
    }

    return 0;
}

// Send protocol message
int send_message(protocol_state_t* state, protocol_message_t* msg) {
    msg->sequence = state->sequence_number++;

    // Send message
    if (send(state->socket_fd, msg, HEADER_SIZE + msg->length, 0) < 0) {
        perror("Failed to send message");
        return -1;
    }

    printf("Sent message: type=%d, seq=%u, len=%u\n",
           msg->type, msg->sequence, msg->length);

    return 0;
}

// Receive protocol message
int receive_message(protocol_state_t* state, protocol_message_t* msg) {
    ssize_t bytes_received;

    // Receive header first
    bytes_received = recv(state->socket_fd, msg, HEADER_SIZE, MSG_WAITALL);
    if (bytes_received != HEADER_SIZE) {
        perror("Failed to receive message header");
        return -1;
    }

    // Validate version
    if (msg->version != PROTOCOL_VERSION) {
        printf("Invalid protocol version: %d\n", msg->version);
        return -1;
    }

    // Receive payload if present
    if (msg->length > 0) {
        if (msg->length > MAX_PAYLOAD_SIZE) {
            printf("Payload too large: %u\n", msg->length);
            return -1;
        }

        bytes_received = recv(state->socket_fd, msg->payload, msg->length, MSG_WAITALL);
        if (bytes_received != msg->length) {
            perror("Failed to receive message payload");
            return -1;
        }
    }

    printf("Received message: type=%d, seq=%u, len=%u\n",
           msg->type, msg->sequence, msg->length);

    return 0;
}

// Send data with acknowledgment
int send_data_with_ack(protocol_state_t* state, const uint8_t* data, uint16_t len) {
    protocol_message_t msg;
    protocol_message_t ack_msg;
    int retry = 0;

    // Create data message
    if (create_message(&msg, MSG_TYPE_DATA, data, len) < 0) {
        return -1;
    }

    // Send message with retry
    while (retry < state->retry_count) {
        if (send_message(state, &msg) < 0) {
            return -1;
        }

        // Wait for acknowledgment
        if (receive_message(state, &ack_msg) < 0) {
            retry++;
            printf("Retry %d/%d\n", retry, state->retry_count);
            continue;
        }

        // Check if it's an acknowledgment
        if (ack_msg.type == MSG_TYPE_ACK && ack_msg.sequence == msg.sequence) {
            printf("Message acknowledged\n");
            return 0;
        } else if (ack_msg.type == MSG_TYPE_NACK) {
            printf("Message rejected\n");
            return -1;
        }

        retry++;
    }

    printf("Failed to receive acknowledgment after %d retries\n", state->retry_count);
    return -1;
}

// Handle incoming messages
int handle_message(protocol_state_t* state, protocol_message_t* msg) {
    switch (msg->type) {
        case MSG_TYPE_DATA:
            printf("Received data: %.*s\n", msg->length, msg->payload);

            // Send acknowledgment
            protocol_message_t ack;
            create_message(&ack, MSG_TYPE_ACK, NULL, 0);
            ack.sequence = msg->sequence;
            send_message(state, &ack);
            break;

        case MSG_TYPE_ACK:
            printf("Received acknowledgment for sequence %u\n", msg->sequence);
            state->last_ack_received = msg->sequence;
            break;

        case MSG_TYPE_NACK:
            printf("Received negative acknowledgment for sequence %u\n", msg->sequence);
            break;

        case MSG_TYPE_HEARTBEAT:
            printf("Received heartbeat\n");
            // Send heartbeat response
            protocol_message_t heartbeat;
            create_message(&heartbeat, MSG_TYPE_HEARTBEAT, NULL, 0);
            send_message(state, &heartbeat);
            break;

        case MSG_TYPE_CONFIG:
            printf("Received configuration message\n");
            // Handle configuration
            break;

        default:
            printf("Unknown message type: %d\n", msg->type);
            return -1;
    }

    return 0;
}

// Protocol server
int protocol_server(int port) {
    int server_socket, client_socket;
    struct sockaddr_in server_addr, client_addr;
    socklen_t client_addr_len = sizeof(client_addr);
    protocol_state_t state;
    protocol_message_t msg;

    // Create server socket
    server_socket = socket(AF_INET, SOCK_STREAM, 0);
    if (server_socket < 0) {
        perror("Failed to create socket");
        return -1;
    }

    // Configure server address
    memset(&server_addr, 0, sizeof(server_addr));
    server_addr.sin_family = AF_INET;
    server_addr.sin_addr.s_addr = INADDR_ANY;
    server_addr.sin_port = htons(port);

    // Bind and listen
    if (bind(server_socket, (struct sockaddr*)&server_addr, sizeof(server_addr)) < 0 ||
        listen(server_socket, 1) < 0) {
        perror("Failed to bind/listen");
        close(server_socket);
        return -1;
    }

    printf("Protocol server listening on port %d\n", port);

    // Accept client connection
    client_socket = accept(server_socket, (struct sockaddr*)&client_addr, &client_addr_len);
    if (client_socket < 0) {
        perror("Failed to accept connection");
        close(server_socket);
        return -1;
    }

    printf("Client connected\n");

    // Initialize protocol
    protocol_init(&state, client_socket);

    // Handle messages
    while (1) {
        if (receive_message(&state, &msg) < 0) {
            break;
        }

        if (handle_message(&state, &msg) < 0) {
            break;
        }
    }

    close(client_socket);
    close(server_socket);
    return 0;
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        printf("Usage: %s server <port>\n", argv[0]);
        return -1;
    }

    if (strcmp(argv[1], "server") == 0) {
        int port = atoi(argv[2]);
        return protocol_server(port);
    }

    return 0;
}
```

**Explanation**:

- **Message structure** - Defines protocol message format with header and payload
- **Message types** - Implements different message types for various purposes
- **Sequence numbers** - Provides message ordering and acknowledgment
- **Retry mechanism** - Implements reliable message delivery
- **Error handling** - Manages communication failures and timeouts

**Where**: Protocol implementation is used in:

- **Custom applications** - Specialized communication requirements
- **Industrial protocols** - Modbus, Profinet, EtherCAT
- **IoT protocols** - MQTT, CoAP, custom sensor protocols
- **Real-time systems** - Time-critical communication
- **Embedded systems** - Resource-constrained communication

## Key Takeaways

**What** you've accomplished in this lesson:

1. **Socket Programming Understanding** - You understand socket programming concepts and implementation
2. **TCP Implementation** - You can implement reliable TCP communication
3. **UDP Implementation** - You can implement fast UDP communication
4. **Protocol Design** - You can create custom communication protocols
5. **Practical Experience** - You have hands-on experience with network programming

**Why** these concepts matter:

- **Network communication** enables embedded systems to exchange data
- **Protocol implementation** provides reliable and efficient communication
- **Professional development** prepares you for embedded systems industry
- **System integration** enables embedded devices to work in larger systems
- **Foundation building** provides the basis for advanced networking concepts

**When** to use these concepts:

- **Client-server applications** - Implementing network services
- **Real-time communication** - Time-sensitive data exchange
- **IoT applications** - Connecting devices to networks
- **Industrial systems** - Implementing communication protocols
- **Learning progression** - Building on this foundation for advanced topics

**Where** these skills apply:

- **Embedded Linux development** - Creating networked applications
- **IoT development** - Building connected devices
- **Industrial automation** - Implementing communication protocols
- **Professional development** - Working in embedded systems industry
- **System integration** - Connecting different system components

## Next Steps

**What** you're ready for next:

After mastering socket programming, you should be ready to:

1. **Learn about I2C and SPI** - Understand serial communication protocols
2. **Explore UART communication** - Learn about serial interfaces
3. **Study industrial protocols** - Understand CAN and Modbus
4. **Begin advanced networking** - Learn about real-time communication
5. **Understand system integration** - Connect multiple communication methods

**Where** to go next:

Continue with the next lesson on **"I2C and SPI Communication"** to learn:

- How to implement I2C master and slave devices
- SPI bus configuration and optimization
- Error handling and recovery in serial communication
- Performance optimization techniques

**Why** the next lesson is important:

The next lesson builds on your network programming knowledge by covering serial communication protocols that are essential for connecting embedded devices to sensors, displays, and other peripherals. You'll learn about I2C and SPI, which are fundamental to embedded system design.

**How** to continue learning:

1. **Practice socket programming** - Experiment with different network protocols
2. **Study protocol design** - Learn about communication protocol principles
3. **Read documentation** - Explore networking and protocol documentation
4. **Join communities** - Engage with embedded Linux developers
5. **Build projects** - Create networked embedded applications

## Resources

**Official Documentation**:

- [Linux Socket Programming](https://www.kernel.org/doc/html/latest/networking/) - Socket programming guide
- [TCP/IP Protocol Suite](https://tools.ietf.org/html/rfc793) - TCP specification
- [UDP Protocol](https://tools.ietf.org/html/rfc768) - UDP specification

**Community Resources**:

- [Embedded Linux Wiki](https://elinux.org/Network_Programming) - Network programming resources
- [Stack Overflow](https://stackoverflow.com/questions/tagged/socket-programming) - Technical Q&A
- [Reddit r/embeddedlinux](https://reddit.com/r/embeddedlinux) - Community discussions

**Learning Resources**:

- [Unix Network Programming](https://www.oreilly.com/library/view/unix-network-programming/9780132977585/) - Comprehensive guide
- [Linux Socket Programming](https://www.oreilly.com/library/view/linux-socket-programming/9780130080212/) - Professional reference
- [Network Programming Guide](https://beej.us/guide/bgnet/) - Online tutorial

Happy learning! 🔌
