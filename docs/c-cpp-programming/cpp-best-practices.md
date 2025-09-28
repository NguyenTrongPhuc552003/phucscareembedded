---
sidebar_position: 2
---

# C++ Best Practices for Embedded Systems

This comprehensive guide covers C++ programming best practices specifically tailored for embedded systems development, focusing on the Rock 5B+ platform.

## Why C++ for Embedded Systems?

C++ offers several advantages over C for embedded development:

- **Object-Oriented Programming**: Better code organization and reusability
- **RAII (Resource Acquisition Is Initialization)**: Automatic resource management
- **Templates**: Code generation without runtime overhead
- **STL Containers**: Efficient data structures
- **Exception Handling**: Robust error management
- **Type Safety**: Compile-time error detection

## Memory Management

### 1. RAII and Smart Pointers

```cpp
#include <memory>
#include <iostream>

class Sensor {
private:
    int sensor_id;
    float* data_buffer;
    
public:
    Sensor(int id, size_t buffer_size) : sensor_id(id) {
        data_buffer = new float[buffer_size];
        std::cout << "Sensor " << sensor_id << " initialized\n";
    }
    
    ~Sensor() {
        delete[] data_buffer;
        std::cout << "Sensor " << sensor_id << " destroyed\n";
    }
    
    // Disable copy constructor and assignment
    Sensor(const Sensor&) = delete;
    Sensor& operator=(const Sensor&) = delete;
    
    // Move constructor
    Sensor(Sensor&& other) noexcept : sensor_id(other.sensor_id), data_buffer(other.data_buffer) {
        other.data_buffer = nullptr;
    }
    
    // Move assignment
    Sensor& operator=(Sensor&& other) noexcept {
        if (this != &other) {
            delete[] data_buffer;
            sensor_id = other.sensor_id;
            data_buffer = other.data_buffer;
            other.data_buffer = nullptr;
        }
        return *this;
    }
};

// Using smart pointers
class SensorManager {
private:
    std::unique_ptr<Sensor> sensor;
    
public:
    SensorManager(int sensor_id, size_t buffer_size) 
        : sensor(std::make_unique<Sensor>(sensor_id, buffer_size)) {}
    
    // Automatic cleanup when SensorManager is destroyed
    ~SensorManager() = default;
};
```

### 2. Custom Memory Allocators

```cpp
#include <memory>
#include <cstdlib>

// Custom allocator for embedded systems
template<typename T>
class EmbeddedAllocator {
private:
    static constexpr size_t POOL_SIZE = 1024;
    static char pool[POOL_SIZE];
    static size_t pool_offset;
    
public:
    using value_type = T;
    using pointer = T*;
    using const_pointer = const T*;
    using reference = T&;
    using const_reference = const T&;
    using size_type = std::size_t;
    using difference_type = std::ptrdiff_t;
    
    template<typename U>
    struct rebind {
        using other = EmbeddedAllocator<U>;
    };
    
    pointer allocate(size_type n) {
        size_t size = n * sizeof(T);
        if (pool_offset + size > POOL_SIZE) {
            throw std::bad_alloc();
        }
        
        pointer result = reinterpret_cast<pointer>(pool + pool_offset);
        pool_offset += size;
        return result;
    }
    
    void deallocate(pointer p, size_type n) {
        // Simple allocator - no deallocation
        // In real embedded systems, you might implement a more sophisticated allocator
    }
    
    template<typename U>
    bool operator==(const EmbeddedAllocator<U>& other) const {
        return true;
    }
    
    template<typename U>
    bool operator!=(const EmbeddedAllocator<U>& other) const {
        return false;
    }
};

// Static pool definition
template<typename T>
char EmbeddedAllocator<T>::pool[EmbeddedAllocator<T>::POOL_SIZE];

template<typename T>
size_t EmbeddedAllocator<T>::pool_offset = 0;

// Usage example
void demonstrate_custom_allocator() {
    std::vector<int, EmbeddedAllocator<int>> vec;
    vec.reserve(100);
    
    for (int i = 0; i < 100; ++i) {
        vec.push_back(i);
    }
}
```

## Object-Oriented Design Patterns

### 1. Singleton Pattern for Hardware Access

```cpp
#include <mutex>
#include <memory>

class GPIOController {
private:
    static std::unique_ptr<GPIOController> instance;
    static std::mutex instance_mutex;
    
    // Private constructor
    GPIOController() = default;
    
public:
    // Delete copy constructor and assignment
    GPIOController(const GPIOController&) = delete;
    GPIOController& operator=(const GPIOController&) = delete;
    
    // Thread-safe singleton
    static GPIOController& getInstance() {
        std::lock_guard<std::mutex> lock(instance_mutex);
        if (!instance) {
            instance = std::unique_ptr<GPIOController>(new GPIOController());
        }
        return *instance;
    }
    
    void setPin(int pin, bool value) {
        // GPIO implementation
        std::cout << "Setting pin " << pin << " to " << value << std::endl;
    }
    
    bool getPin(int pin) {
        // GPIO implementation
        return false;
    }
};

// Static member definitions
std::unique_ptr<GPIOController> GPIOController::instance = nullptr;
std::mutex GPIOController::instance_mutex;
```

### 2. Observer Pattern for Event Handling

```cpp
#include <vector>
#include <functional>
#include <algorithm>

// Event types
enum class EventType {
    BUTTON_PRESSED,
    SENSOR_READING,
    TIMER_EXPIRED
};

// Event data structure
struct Event {
    EventType type;
    uint32_t timestamp;
    void* data;
    
    Event(EventType t, uint32_t ts, void* d = nullptr) 
        : type(t), timestamp(ts), data(d) {}
};

// Observer interface
class EventObserver {
public:
    virtual ~EventObserver() = default;
    virtual void handleEvent(const Event& event) = 0;
};

// Event system
class EventSystem {
private:
    std::vector<EventObserver*> observers;
    std::mutex observers_mutex;
    
public:
    void subscribe(EventObserver* observer) {
        std::lock_guard<std::mutex> lock(observers_mutex);
        observers.push_back(observer);
    }
    
    void unsubscribe(EventObserver* observer) {
        std::lock_guard<std::mutex> lock(observers_mutex);
        observers.erase(std::remove(observers.begin(), observers.end(), observer), observers.end());
    }
    
    void publishEvent(const Event& event) {
        std::lock_guard<std::mutex> lock(observers_mutex);
        for (auto* observer : observers) {
            observer->handleEvent(event);
        }
    }
};

// Concrete observer example
class LEDController : public EventObserver {
public:
    void handleEvent(const Event& event) override {
        if (event.type == EventType::BUTTON_PRESSED) {
            std::cout << "LED: Button pressed, toggling LED\n";
            // Toggle LED implementation
        }
    }
};
```

### 3. State Machine Pattern

```cpp
#include <functional>
#include <unordered_map>

// State machine for embedded system
class SystemStateMachine {
public:
    enum class State {
        IDLE,
        INITIALIZING,
        RUNNING,
        ERROR,
        SHUTDOWN
    };
    
    enum class Event {
        START,
        INIT_COMPLETE,
        ERROR_OCCURRED,
        RESET,
        SHUTDOWN_REQUEST
    };
    
private:
    State current_state;
    std::unordered_map<std::pair<State, Event>, State> transitions;
    std::unordered_map<State, std::function<void()>> state_actions;
    
public:
    SystemStateMachine() : current_state(State::IDLE) {
        setupTransitions();
        setupStateActions();
    }
    
    void processEvent(Event event) {
        auto key = std::make_pair(current_state, event);
        auto it = transitions.find(key);
        
        if (it != transitions.end()) {
            State new_state = it->second;
            std::cout << "State transition: " << stateToString(current_state) 
                      << " -> " << stateToString(new_state) << std::endl;
            
            current_state = new_state;
            executeStateAction();
        } else {
            std::cout << "Invalid transition from " << stateToString(current_state) 
                      << " on event " << eventToString(event) << std::endl;
        }
    }
    
    State getCurrentState() const { return current_state; }
    
private:
    void setupTransitions() {
        transitions[{State::IDLE, Event::START}] = State::INITIALIZING;
        transitions[{State::INITIALIZING, Event::INIT_COMPLETE}] = State::RUNNING;
        transitions[{State::INITIALIZING, Event::ERROR_OCCURRED}] = State::ERROR;
        transitions[{State::RUNNING, Event::ERROR_OCCURRED}] = State::ERROR;
        transitions[{State::RUNNING, Event::SHUTDOWN_REQUEST}] = State::SHUTDOWN;
        transitions[{State::ERROR, Event::RESET}] = State::IDLE;
        transitions[{State::SHUTDOWN, Event::START}] = State::INITIALIZING;
    }
    
    void setupStateActions() {
        state_actions[State::IDLE] = []() { std::cout << "System idle\n"; };
        state_actions[State::INITIALIZING] = []() { std::cout << "Initializing system...\n"; };
        state_actions[State::RUNNING] = []() { std::cout << "System running normally\n"; };
        state_actions[State::ERROR] = []() { std::cout << "System in error state\n"; };
        state_actions[State::SHUTDOWN] = []() { std::cout << "Shutting down system\n"; };
    }
    
    void executeStateAction() {
        auto it = state_actions.find(current_state);
        if (it != state_actions.end()) {
            it->second();
        }
    }
    
    std::string stateToString(State state) const {
        switch (state) {
            case State::IDLE: return "IDLE";
            case State::INITIALIZING: return "INITIALIZING";
            case State::RUNNING: return "RUNNING";
            case State::ERROR: return "ERROR";
            case State::SHUTDOWN: return "SHUTDOWN";
            default: return "UNKNOWN";
        }
    }
    
    std::string eventToString(Event event) const {
        switch (event) {
            case Event::START: return "START";
            case Event::INIT_COMPLETE: return "INIT_COMPLETE";
            case Event::ERROR_OCCURRED: return "ERROR_OCCURRED";
            case Event::RESET: return "RESET";
            case Event::SHUTDOWN_REQUEST: return "SHUTDOWN_REQUEST";
            default: return "UNKNOWN";
        }
    }
};
```

## Template Programming

### 1. Generic Sensor Interface

```cpp
#include <type_traits>
#include <chrono>

// Sensor base class
template<typename T>
class Sensor {
protected:
    T last_value;
    std::chrono::steady_clock::time_point last_read;
    
public:
    virtual ~Sensor() = default;
    virtual T read() = 0;
    virtual bool isAvailable() const = 0;
    
    T getLastValue() const { return last_value; }
    
    std::chrono::milliseconds getTimeSinceLastRead() const {
        auto now = std::chrono::steady_clock::now();
        return std::chrono::duration_cast<std::chrono::milliseconds>(now - last_read);
    }
};

// Temperature sensor implementation
class TemperatureSensor : public Sensor<float> {
private:
    int sensor_pin;
    
public:
    TemperatureSensor(int pin) : sensor_pin(pin) {}
    
    float read() override {
        // Simulate temperature reading
        float temperature = 20.0f + (rand() % 100) / 10.0f;
        last_value = temperature;
        last_read = std::chrono::steady_clock::now();
        return temperature;
    }
    
    bool isAvailable() const override {
        return true; // Simplified for example
    }
};

// Generic sensor manager
template<typename T, typename SensorType>
class SensorManager {
private:
    std::vector<std::unique_ptr<SensorType>> sensors;
    
public:
    void addSensor(std::unique_ptr<SensorType> sensor) {
        sensors.push_back(std::move(sensor));
    }
    
    std::vector<T> readAllSensors() {
        std::vector<T> readings;
        readings.reserve(sensors.size());
        
        for (const auto& sensor : sensors) {
            if (sensor->isAvailable()) {
                readings.push_back(sensor->read());
            }
        }
        
        return readings;
    }
    
    size_t getSensorCount() const { return sensors.size(); }
};
```

### 2. Compile-Time Calculations

```cpp
#include <array>

// Compile-time factorial
template<int N>
struct Factorial {
    static constexpr int value = N * Factorial<N-1>::value;
};

template<>
struct Factorial<0> {
    static constexpr int value = 1;
};

// Compile-time power calculation
template<int Base, int Exponent>
struct Power {
    static constexpr int value = Base * Power<Base, Exponent-1>::value;
};

template<int Base>
struct Power<Base, 0> {
    static constexpr int value = 1;
};

// Compile-time array generation
template<int N>
struct Fibonacci {
    static constexpr int value = Fibonacci<N-1>::value + Fibonacci<N-2>::value;
};

template<>
struct Fibonacci<0> {
    static constexpr int value = 0;
};

template<>
struct Fibonacci<1> {
    static constexpr int value = 1;
};

// Generate Fibonacci sequence at compile time
template<int N>
struct FibonacciArray {
    static constexpr std::array<int, N> generate() {
        std::array<int, N> arr{};
        for (int i = 0; i < N; ++i) {
            arr[i] = Fibonacci<i>::value;
        }
        return arr;
    }
    
    static constexpr std::array<int, N> values = generate();
};

// Usage
constexpr auto fib_10 = FibonacciArray<10>::values;
```

## Exception Handling

### 1. Custom Exception Classes

```cpp
#include <stdexcept>
#include <string>

// Base exception for embedded systems
class EmbeddedException : public std::exception {
private:
    std::string message;
    int error_code;
    
public:
    EmbeddedException(const std::string& msg, int code = -1) 
        : message(msg), error_code(code) {}
    
    const char* what() const noexcept override {
        return message.c_str();
    }
    
    int getErrorCode() const { return error_code; }
};

// Specific exception types
class SensorException : public EmbeddedException {
public:
    SensorException(const std::string& msg, int sensor_id) 
        : EmbeddedException("Sensor " + std::to_string(sensor_id) + ": " + msg, sensor_id) {}
};

class CommunicationException : public EmbeddedException {
public:
    CommunicationException(const std::string& msg) 
        : EmbeddedException("Communication error: " + msg, -2) {}
};

class MemoryException : public EmbeddedException {
public:
    MemoryException(const std::string& msg) 
        : EmbeddedException("Memory error: " + msg, -3) {}
};

// Exception-safe resource management
class SafeResource {
private:
    int resource_id;
    bool is_allocated;
    
public:
    SafeResource(int id) : resource_id(id), is_allocated(false) {
        try {
            allocateResource();
            is_allocated = true;
        } catch (const std::exception& e) {
            throw MemoryException("Failed to allocate resource " + std::to_string(id) + ": " + e.what());
        }
    }
    
    ~SafeResource() {
        if (is_allocated) {
            try {
                deallocateResource();
            } catch (...) {
                // Log error but don't throw from destructor
            }
        }
    }
    
    // Disable copy
    SafeResource(const SafeResource&) = delete;
    SafeResource& operator=(const SafeResource&) = delete;
    
    // Enable move
    SafeResource(SafeResource&& other) noexcept 
        : resource_id(other.resource_id), is_allocated(other.is_allocated) {
        other.is_allocated = false;
    }
    
    SafeResource& operator=(SafeResource&& other) noexcept {
        if (this != &other) {
            if (is_allocated) {
                deallocateResource();
            }
            resource_id = other.resource_id;
            is_allocated = other.is_allocated;
            other.is_allocated = false;
        }
        return *this;
    }
    
private:
    void allocateResource() {
        // Simulate resource allocation
        if (resource_id < 0) {
            throw std::runtime_error("Invalid resource ID");
        }
    }
    
    void deallocateResource() {
        // Simulate resource deallocation
    }
};
```

### 2. Exception-Safe Programming

```cpp
#include <memory>
#include <vector>

// Exception-safe container operations
template<typename T>
class SafeVector {
private:
    std::vector<T> data;
    
public:
    // Strong exception safety
    void safeInsert(size_t index, const T& value) {
        if (index > data.size()) {
            throw std::out_of_range("Index out of range");
        }
        
        // Create temporary vector with new element
        std::vector<T> temp = data;
        temp.insert(temp.begin() + index, value);
        
        // Swap only if insertion succeeded
        data.swap(temp);
    }
    
    // Exception-safe resize
    void safeResize(size_t new_size, const T& default_value = T{}) {
        std::vector<T> temp = data;
        temp.resize(new_size, default_value);
        data.swap(temp);
    }
    
    // No-throw operations
    size_t size() const noexcept { return data.size(); }
    bool empty() const noexcept { return data.empty(); }
    
    // Access with bounds checking
    T& at(size_t index) {
        if (index >= data.size()) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
    
    const T& at(size_t index) const {
        if (index >= data.size()) {
            throw std::out_of_range("Index out of range");
        }
        return data[index];
    }
};
```

## Performance Optimization

### 1. Move Semantics

```cpp
#include <utility>
#include <string>

// Efficient string concatenation
class EfficientString {
private:
    std::string data;
    
public:
    EfficientString() = default;
    
    // Move constructor
    EfficientString(EfficientString&& other) noexcept 
        : data(std::move(other.data)) {}
    
    // Move assignment
    EfficientString& operator=(EfficientString&& other) noexcept {
        if (this != &other) {
            data = std::move(other.data);
        }
        return *this;
    }
    
    // Copy constructor (expensive)
    EfficientString(const EfficientString& other) : data(other.data) {}
    
    // Copy assignment (expensive)
    EfficientString& operator=(const EfficientString& other) {
        if (this != &other) {
            data = other.data;
        }
        return *this;
    }
    
    // Efficient concatenation using move
    EfficientString& operator+=(EfficientString&& other) {
        data += std::move(other.data);
        return *this;
    }
    
    // Efficient concatenation using rvalue reference
    EfficientString operator+(EfficientString&& other) && {
        return EfficientString(std::move(data) + std::move(other.data));
    }
    
    const std::string& getData() const { return data; }
};

// Usage example
void demonstrateMoveSemantics() {
    EfficientString str1("Hello");
    EfficientString str2("World");
    
    // Move semantics - no copying
    EfficientString result = std::move(str1) + std::move(str2);
    
    std::cout << "Result: " << result.getData() << std::endl;
}
```

### 2. Template Metaprogramming for Performance

```cpp
#include <type_traits>

// Compile-time type checking
template<typename T>
struct is_integral_constant {
    static constexpr bool value = false;
};

template<typename T, T v>
struct is_integral_constant<std::integral_constant<T, v>> {
    static constexpr bool value = true;
};

// SFINAE (Substitution Failure Is Not An Error)
template<typename T>
typename std::enable_if<std::is_arithmetic<T>::value, T>::type
safe_divide(T a, T b) {
    if (b == 0) {
        throw std::invalid_argument("Division by zero");
    }
    return a / b;
}

// Compile-time loop unrolling
template<int N>
struct UnrollLoop {
    template<typename Func>
    static void execute(Func&& func) {
        func(N - 1);
        UnrollLoop<N - 1>::execute(std::forward<Func>(func));
    }
};

template<>
struct UnrollLoop<0> {
    template<typename Func>
    static void execute(Func&& func) {
        // Base case - do nothing
    }
};

// Usage
void demonstrateUnrolling() {
    UnrollLoop<4>::execute([](int i) {
        std::cout << "Iteration " << i << std::endl;
    });
}
```

## STL for Embedded Systems

### 1. Custom STL Containers

```cpp
#include <array>
#include <vector>
#include <algorithm>

// Fixed-size array with bounds checking
template<typename T, size_t N>
class SafeArray {
private:
    std::array<T, N> data;
    
public:
    using value_type = T;
    using size_type = size_t;
    using iterator = typename std::array<T, N>::iterator;
    using const_iterator = typename std::array<T, N>::const_iterator;
    
    // Safe access with bounds checking
    T& at(size_type index) {
        if (index >= N) {
            throw std::out_of_range("Index out of bounds");
        }
        return data[index];
    }
    
    const T& at(size_type index) const {
        if (index >= N) {
            throw std::out_of_range("Index out of bounds");
        }
        return data[index];
    }
    
    // Direct access (unsafe but fast)
    T& operator[](size_type index) { return data[index]; }
    const T& operator[](size_type index) const { return data[index]; }
    
    // Iterators
    iterator begin() { return data.begin(); }
    iterator end() { return data.end(); }
    const_iterator begin() const { return data.begin(); }
    const_iterator end() const { return data.end(); }
    
    // Size and capacity
    size_type size() const { return N; }
    bool empty() const { return N == 0; }
    
    // Fill with value
    void fill(const T& value) { data.fill(value); }
    
    // Swap with another array
    void swap(SafeArray& other) { data.swap(other.data); }
};
```

### 2. Efficient Algorithms

```cpp
#include <algorithm>
#include <numeric>
#include <functional>

// Custom algorithms for embedded systems
template<typename Container, typename Predicate>
bool all_of_safe(const Container& container, Predicate pred) {
    return std::all_of(container.begin(), container.end(), pred);
}

template<typename Container, typename Predicate>
bool any_of_safe(const Container& container, Predicate pred) {
    return std::any_of(container.begin(), container.end(), pred);
}

// Efficient sorting for small containers
template<typename Container>
void sort_small(Container& container) {
    if (container.size() <= 1) return;
    
    // Use insertion sort for small containers
    for (auto it = container.begin() + 1; it != container.end(); ++it) {
        auto key = *it;
        auto j = it - 1;
        
        while (j >= container.begin() && *j > key) {
            *(j + 1) = *j;
            --j;
        }
        *(j + 1) = key;
    }
}

// Binary search with bounds checking
template<typename Container, typename T>
typename Container::iterator binary_search_safe(Container& container, const T& value) {
    auto it = std::lower_bound(container.begin(), container.end(), value);
    if (it != container.end() && *it == value) {
        return it;
    }
    return container.end();
}
```

## Best Practices Summary

### 1. Code Organization

```cpp
// Use namespaces to organize code
namespace EmbeddedSystem {
    namespace Hardware {
        class GPIOController { /* ... */ };
        class SensorManager { /* ... */ };
    }
    
    namespace Software {
        class EventSystem { /* ... */ };
        class StateMachine { /* ... */ };
    }
}

// Use constexpr for compile-time constants
constexpr int MAX_SENSORS = 10;
constexpr float SAMPLE_RATE = 1000.0f;

// Use const for immutable data
const std::string FIRMWARE_VERSION = "1.0.0";
```

### 2. Error Handling

```cpp
// Use exceptions for exceptional cases
void processSensorData() {
    try {
        auto data = readSensor();
        if (data.isValid()) {
            processValidData(data);
        } else {
            throw SensorException("Invalid sensor data");
        }
    } catch (const SensorException& e) {
        logError(e.what());
        handleSensorError();
    } catch (const std::exception& e) {
        logError("Unexpected error: " + std::string(e.what()));
        enterSafeMode();
    }
}
```

### 3. Performance Considerations

- Use `constexpr` for compile-time calculations
- Prefer move semantics over copying
- Use `noexcept` for functions that don't throw
- Minimize dynamic memory allocation
- Use templates for code generation
- Profile your code regularly

## Next Steps

- [Memory Management](./memory-management.md)
- [Debugging Techniques](./debugging-techniques.md)
- [Embedded C Programming](./embedded-c.md)

## Resources

- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/)
- [Effective C++](https://www.aristeia.com/books.html)
- [Modern C++ Features](https://en.cppreference.com/w/cpp/compiler_support)
- [Embedded C++ Best Practices](https://www.embedded.com/design/programming-languages-and-tools/4428708/Embedded-C---best-practices)
