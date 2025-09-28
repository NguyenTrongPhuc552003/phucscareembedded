---
sidebar_position: 3
---

# Memory Management for Embedded Systems

This guide covers advanced memory management techniques for embedded C/C++ programming, focusing on the Rock 5B+ platform.

## Memory Layout in Embedded Systems

### 1. Memory Hierarchy

```
┌─────────────────────────────────────┐
│           High Memory               │
├─────────────────────────────────────┤
│           Stack (grows down)        │
├─────────────────────────────────────┤
│           Heap (grows up)           │
├─────────────────────────────────────┤
│           BSS (uninitialized)      │
├─────────────────────────────────────┤
│           Data (initialized)        │
├─────────────────────────────────────┤
│           Text (code)               │
├─────────────────────────────────────┤
│           Low Memory                │
└─────────────────────────────────────┘
```

### 2. Memory Types

- **Flash Memory**: Program storage (non-volatile)
- **RAM**: Runtime data (volatile)
- **Cache**: High-speed memory for CPU
- **Registers**: Fastest memory in CPU

## Dynamic Memory Management

### 1. Custom Memory Allocators

```c
#include <stdint.h>
#include <stddef.h>

// Simple memory pool allocator
typedef struct {
    uint8_t* pool;
    size_t pool_size;
    size_t used_size;
    uint32_t* free_list;
    size_t free_count;
} memory_pool_t;

// Initialize memory pool
int memory_pool_init(memory_pool_t* pool, uint8_t* buffer, size_t size) {
    if (!pool || !buffer || size < sizeof(uint32_t)) {
        return -1;
    }
    
    pool->pool = buffer;
    pool->pool_size = size;
    pool->used_size = 0;
    pool->free_list = (uint32_t*)buffer;
    pool->free_count = 0;
    
    return 0;
}

// Allocate memory from pool
void* memory_pool_alloc(memory_pool_t* pool, size_t size) {
    if (!pool || size == 0) {
        return NULL;
    }
    
    // Align size to 4-byte boundary
    size = (size + 3) & ~3;
    
    if (pool->used_size + size > pool->pool_size) {
        return NULL; // Out of memory
    }
    
    void* ptr = pool->pool + pool->used_size;
    pool->used_size += size;
    
    return ptr;
}

// Free memory (simple implementation)
void memory_pool_free(memory_pool_t* pool, void* ptr) {
    // In a simple pool, we don't actually free memory
    // This would be implemented in a more sophisticated allocator
    (void)pool;
    (void)ptr;
}
```

### 2. Stack-Based Allocation

```c
#include <alloca.h>

// Stack-based temporary buffer
void process_data(size_t data_size) {
    // Allocate on stack (automatically freed)
    uint8_t* buffer = alloca(data_size);
    
    if (!buffer) {
        return; // Stack overflow
    }
    
    // Use buffer
    memset(buffer, 0, data_size);
    
    // Process data...
    
    // Buffer automatically freed when function returns
}
```

## Memory Optimization Techniques

### 1. Data Structure Optimization

```c
// Unoptimized structure
struct unoptimized_data {
    char name[32];
    int id;
    float value;
    char description[64];
    bool active;
};

// Optimized structure (packed, reordered)
struct optimized_data {
    int id;           // 4 bytes
    float value;      // 4 bytes
    bool active;      // 1 byte
    char name[32];    // 32 bytes
    char description[64]; // 64 bytes
} __attribute__((packed));

// Size comparison
// Unoptimized: ~105 bytes (with padding)
// Optimized: ~105 bytes (no padding)
```

### 2. Memory Pool Management

```c
// Fixed-size memory pool
#define POOL_SIZE 1024
#define BLOCK_SIZE 32
#define NUM_BLOCKS (POOL_SIZE / BLOCK_SIZE)

typedef struct {
    uint8_t pool[POOL_SIZE];
    uint8_t free_map[NUM_BLOCKS / 8]; // Bitmap for free blocks
} fixed_pool_t;

// Initialize fixed pool
void fixed_pool_init(fixed_pool_t* pool) {
    memset(pool->free_map, 0xFF, sizeof(pool->free_map));
}

// Allocate from fixed pool
void* fixed_pool_alloc(fixed_pool_t* pool) {
    for (int i = 0; i < NUM_BLOCKS; i++) {
        int byte_idx = i / 8;
        int bit_idx = i % 8;
        
        if (pool->free_map[byte_idx] & (1 << bit_idx)) {
            // Block is free
            pool->free_map[byte_idx] &= ~(1 << bit_idx);
            return &pool->pool[i * BLOCK_SIZE];
        }
    }
    return NULL; // No free blocks
}

// Free block in fixed pool
void fixed_pool_free(fixed_pool_t* pool, void* ptr) {
    if (!ptr) return;
    
    uint8_t* block = (uint8_t*)ptr;
    if (block < pool->pool || block >= pool->pool + POOL_SIZE) {
        return; // Invalid pointer
    }
    
    int block_idx = (block - pool->pool) / BLOCK_SIZE;
    int byte_idx = block_idx / 8;
    int bit_idx = block_idx % 8;
    
    pool->free_map[byte_idx] |= (1 << bit_idx);
}
```

## Memory Safety

### 1. Buffer Overflow Protection

```c
#include <string.h>

// Safe string copy
int safe_strcpy(char* dest, const char* src, size_t dest_size) {
    if (!dest || !src || dest_size == 0) {
        return -1;
    }
    
    size_t src_len = strnlen(src, dest_size - 1);
    if (src_len >= dest_size) {
        return -1; // Source too long
    }
    
    memcpy(dest, src, src_len);
    dest[src_len] = '\0';
    
    return 0;
}

// Safe string concatenation
int safe_strcat(char* dest, const char* src, size_t dest_size) {
    if (!dest || !src || dest_size == 0) {
        return -1;
    }
    
    size_t dest_len = strnlen(dest, dest_size);
    size_t src_len = strnlen(src, dest_size - dest_len - 1);
    
    if (dest_len + src_len >= dest_size) {
        return -1; // Would overflow
    }
    
    memcpy(dest + dest_len, src, src_len);
    dest[dest_len + src_len] = '\0';
    
    return 0;
}
```

### 2. Memory Leak Detection

```c
#include <stdio.h>

// Simple memory leak detector
static size_t allocated_memory = 0;
static size_t peak_memory = 0;

void* debug_malloc(size_t size) {
    void* ptr = malloc(size);
    if (ptr) {
        allocated_memory += size;
        if (allocated_memory > peak_memory) {
            peak_memory = allocated_memory;
        }
        printf("Allocated %zu bytes, total: %zu\n", size, allocated_memory);
    }
    return ptr;
}

void debug_free(void* ptr) {
    if (ptr) {
        // Note: This is simplified - real implementation would track sizes
        free(ptr);
        printf("Freed memory\n");
    }
}

void print_memory_stats(void) {
    printf("Current allocated: %zu bytes\n", allocated_memory);
    printf("Peak allocated: %zu bytes\n", peak_memory);
}
```

## Real-Time Memory Management

### 1. Lock-Free Memory Management

```c
#include <stdatomic.h>

// Lock-free ring buffer
typedef struct {
    uint8_t* buffer;
    size_t size;
    atomic_size_t head;
    atomic_size_t tail;
} lockfree_ring_t;

// Initialize ring buffer
int ring_init(lockfree_ring_t* ring, uint8_t* buffer, size_t size) {
    if (!ring || !buffer || size == 0) {
        return -1;
    }
    
    ring->buffer = buffer;
    ring->size = size;
    atomic_init(&ring->head, 0);
    atomic_init(&ring->tail, 0);
    
    return 0;
}

// Write to ring buffer
int ring_write(lockfree_ring_t* ring, const uint8_t* data, size_t len) {
    size_t head = atomic_load(&ring->head);
    size_t tail = atomic_load(&ring->tail);
    
    if (head == (tail + 1) % ring->size) {
        return -1; // Buffer full
    }
    
    for (size_t i = 0; i < len && head != tail; i++) {
        ring->buffer[head] = data[i];
        head = (head + 1) % ring->size;
    }
    
    atomic_store(&ring->head, head);
    return 0;
}

// Read from ring buffer
int ring_read(lockfree_ring_t* ring, uint8_t* data, size_t len) {
    size_t head = atomic_load(&ring->head);
    size_t tail = atomic_load(&ring->tail);
    
    if (head == tail) {
        return -1; // Buffer empty
    }
    
    size_t read_len = 0;
    while (tail != head && read_len < len) {
        data[read_len] = ring->buffer[tail];
        tail = (tail + 1) % ring->size;
        read_len++;
    }
    
    atomic_store(&ring->tail, tail);
    return read_len;
}
```

## Memory-Mapped I/O

### 1. Hardware Register Access

```c
#include <stdint.h>
#include <stddef.h>

// Memory-mapped I/O for Rock 5B+
#define GPIO_BASE_ADDR 0xFE200000
#define GPIO_SET_OFFSET 0x1C
#define GPIO_CLR_OFFSET 0x28

// GPIO register structure
typedef struct {
    volatile uint32_t data;
    volatile uint32_t data_dir;
    volatile uint32_t reserved[6];
    volatile uint32_t set;
    volatile uint32_t clr;
} gpio_regs_t;

// Map GPIO registers
gpio_regs_t* gpio_map_registers(void) {
    // In real implementation, use mmap()
    return (gpio_regs_t*)GPIO_BASE_ADDR;
}

// Safe GPIO operations
void gpio_set_pin(gpio_regs_t* gpio, int pin) {
    if (!gpio || pin < 0 || pin > 31) {
        return;
    }
    
    gpio->set = (1 << pin);
}

void gpio_clear_pin(gpio_regs_t* gpio, int pin) {
    if (!gpio || pin < 0 || pin > 31) {
        return;
    }
    
    gpio->clr = (1 << pin);
}
```

## Best Practices

### 1. Memory Allocation Guidelines

- Use stack allocation for small, temporary data
- Use fixed-size pools for predictable memory usage
- Avoid dynamic allocation in real-time code
- Always check allocation failures
- Use RAII in C++ for automatic cleanup

### 2. Performance Optimization

- Minimize memory fragmentation
- Use cache-friendly data structures
- Align data structures to cache lines
- Profile memory usage regularly
- Use memory-mapped I/O for hardware access

### 3. Safety Considerations

- Always validate pointers before use
- Use bounds checking for arrays
- Implement memory leak detection
- Use static analysis tools
- Test with memory constraints

## Next Steps

- [Debugging Techniques](./debugging-techniques.md)
- [C++ Best Practices](./cpp-best-practices.md)
- [Embedded C Programming](./embedded-c.md)

## Resources

- [Memory Management in Embedded Systems](https://www.embedded.com/design/programming-languages-and-tools/4428708/Memory-management-in-embedded-systems)
- [ARM Cortex-A Programming](https://developer.arm.com/documentation)
- [Rock 5B+ Memory Layout](https://wiki.radxa.com/Rock5/hardware/memory)
