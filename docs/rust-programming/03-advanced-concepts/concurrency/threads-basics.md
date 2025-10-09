---
sidebar_position: 1
---

# Threads Basics

Master concurrent programming with threads in Rust with comprehensive explanations using the 4W+H framework.

## What Are Threads?

**What**: Threads are the smallest unit of execution that can be scheduled by the operating system. In Rust, threads allow you to run multiple pieces of code concurrently, potentially improving performance and responsiveness.

**Why**: Understanding threads is crucial because:

- **Concurrent execution** allows multiple tasks to run simultaneously
- **Performance improvement** can be achieved through parallel processing
- **Responsive applications** can handle multiple operations without blocking
- **Resource utilization** enables better use of multi-core processors
- **Real-time systems** often require concurrent execution for time-critical tasks

**When**: Use threads when you need to:

- Process data in parallel to improve performance
- Handle multiple I/O operations concurrently
- Create responsive user interfaces
- Implement real-time systems
- Utilize multiple CPU cores effectively

**How**: Rust provides thread primitives through the `std::thread` module, with safety guarantees that prevent data races.

**Where**: Threads are used throughout Rust programs for concurrent execution, parallel processing, and responsive applications.

## Understanding Basic Thread Creation

### Creating Simple Threads

**What**: The most basic way to create threads in Rust is using `std::thread::spawn`.

**How**: Here's how to create and use threads:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    println!("Main thread starting");

    // Create a new thread
    let handle = thread::spawn(|| {
        println!("Hello from the spawned thread!");

        // Simulate some work
        for i in 1..=5 {
            println!("Thread: {}", i);
            thread::sleep(Duration::from_millis(1000));
        }

        println!("Spawned thread finished");
    });

    // Main thread continues while spawned thread runs
    for i in 1..=3 {
        println!("Main: {}", i);
        thread::sleep(Duration::from_millis(500));
    }

    // Wait for the spawned thread to complete
    handle.join().unwrap();

    println!("Main thread finished");
}
```

**Explanation**:

- `thread::spawn(|| { ... })` creates a new thread with a closure
- The closure contains the code that will run in the new thread
- `handle.join()` waits for the thread to complete
- Both threads run concurrently, as shown by the interleaved output
- `thread::sleep()` simulates work being done

**Why**: Basic thread creation allows you to run code concurrently and potentially improve performance.

### Thread Handles and Joining

**What**: Thread handles allow you to control and wait for thread completion.

**How**: Here's how to work with thread handles:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handles: Vec<thread::JoinHandle<()>> = (0..5)
        .map(|i| {
            thread::spawn(move || {
                println!("Thread {} starting", i);
                thread::sleep(Duration::from_millis(1000));
                println!("Thread {} finished", i);
            })
        })
        .collect();

    // Wait for all threads to complete
    for handle in handles {
        handle.join().unwrap();
    }

    println!("All threads completed");
}
```

**Explanation**:

- `thread::spawn()` returns a `JoinHandle<()>`
- `move` keyword moves the captured variable `i` into the closure
- `collect()` gathers all handles into a vector
- `join()` waits for each thread to complete
- All threads run concurrently, then we wait for all to finish

**Why**: Thread handles provide control over thread lifecycle and synchronization.

### Threads with Return Values

**What**: Threads can return values that can be retrieved when the thread completes.

**How**: Here's how to get return values from threads:

```rust
use std::thread;

fn main() {
    let handle = thread::spawn(|| {
        println!("Thread is working...");

        // Simulate some computation
        let mut sum = 0;
        for i in 1..=1000 {
            sum += i;
        }

        sum  // Return the computed value
    });

    // Do other work in main thread
    println!("Main thread is doing other work...");

    // Get the result from the thread
    let result = handle.join().unwrap();
    println!("Thread result: {}", result);
}
```

**Explanation**:

- The closure returns a value (`sum`)
- `join()` returns `Result<T, Box<dyn Any + Send + 'static>>`
- `unwrap()` extracts the return value
- The thread computes a value while the main thread does other work
- The result is available when the thread completes

**Why**: Return values allow threads to communicate results back to the main thread.

## Understanding Thread Safety

### Moving Data into Threads

**What**: Rust's ownership system ensures thread safety by moving data into threads.

**How**: Here's how to safely move data into threads:

```rust
use std::thread;

fn main() {
    let data = vec![1, 2, 3, 4, 5];
    println!("Original data: {:?}", data);

    let handle = thread::spawn(move || {
        // data is moved into this thread
        println!("Thread received: {:?}", data);

        let sum: i32 = data.iter().sum();
        println!("Sum: {}", sum);

        sum
    });

    // data is no longer available in main thread
    // println!("{:?}", data);  // This would cause a compile error

    let result = handle.join().unwrap();
    println!("Final result: {}", result);
}
```

**Explanation**:

- `move` keyword moves `data` into the thread closure
- After moving, `data` is no longer available in the main thread
- This prevents data races by ensuring only one thread owns the data
- The thread can safely use the data without conflicts

**Why**: Moving data into threads prevents data races and ensures thread safety.

### Shared Data with Arc

**What**: `Arc` (Atomically Reference Counted) allows multiple threads to share ownership of data.

**How**: Here's how to share data between threads:

```rust
use std::thread;
use std::sync::Arc;

fn main() {
    let data = Arc::new(vec![1, 2, 3, 4, 5]);
    println!("Original data: {:?}", data);

    let mut handles = vec![];

    for i in 0..3 {
        let data_clone = Arc::clone(&data);

        let handle = thread::spawn(move || {
            println!("Thread {} received: {:?}", i, data_clone);

            let sum: i32 = data_clone.iter().sum();
            println!("Thread {} sum: {}", i, sum);

            sum
        });

        handles.push(handle);
    }

    // Wait for all threads to complete
    for handle in handles {
        let result = handle.join().unwrap();
        println!("Thread result: {}", result);
    }
}
```

**Explanation**:

- `Arc::new()` creates an atomically reference counted pointer
- `Arc::clone()` creates another reference to the same data
- Multiple threads can safely share the same data
- `Arc` ensures the data is only deallocated when all references are dropped
- Each thread gets its own clone of the `Arc`, not the data itself

**Why**: `Arc` enables safe sharing of immutable data between multiple threads.

### Mutable Shared Data with Arc&lt;Mutex&lt;T&gt;&gt;

**What**: `Arc<Mutex<T>>` allows multiple threads to safely share and modify the same data.

**How**: Here's how to share mutable data between threads:

```rust
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for i in 0..5 {
        let counter = Arc::clone(&counter);

        let handle = thread::spawn(move || {
            for _ in 0..10 {
                // Lock the mutex to access the data
                let mut num = counter.lock().unwrap();
                *num += 1;
                println!("Thread {}: counter = {}", i, *num);

                // Lock is automatically released when num goes out of scope
                thread::sleep(Duration::from_millis(100));
            }
        });

        handles.push(handle);
    }

    // Wait for all threads to complete
    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final counter value: {}", *counter.lock().unwrap());
}
```

**Explanation**:

- `Arc<Mutex<T>>` combines shared ownership with mutual exclusion
- `counter.lock()` acquires the mutex lock
- Only one thread can hold the lock at a time
- The lock is automatically released when the guard goes out of scope
- This prevents data races while allowing shared mutable access

**Why**: `Arc<Mutex<T>>` enables safe sharing of mutable data between multiple threads.

## Understanding Thread Communication

### Message Passing with Channels

**What**: Channels provide a way for threads to communicate by sending and receiving messages.

**How**: Here's how to use channels for thread communication:

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    // Spawn a thread that sends messages
    let tx_clone = tx.clone();
    thread::spawn(move || {
        let messages = vec![
            String::from("Hello"),
            String::from("from"),
            String::from("the"),
            String::from("thread"),
        ];

        for msg in messages {
            tx_clone.send(msg).unwrap();
            thread::sleep(Duration::from_millis(1000));
        }
    });

    // Spawn another thread that sends messages
    thread::spawn(move || {
        let messages = vec![
            String::from("Another"),
            String::from("thread"),
            String::from("message"),
        ];

        for msg in messages {
            tx.send(msg).unwrap();
            thread::sleep(Duration::from_millis(500));
        }
    });

    // Receive messages in the main thread
    for received in rx {
        println!("Received: {}", received);
    }
}
```

**Explanation**:

- `mpsc::channel()` creates a multiple producer, single consumer channel
- `tx` (transmitter) is used to send messages
- `rx` (receiver) is used to receive messages
- `tx.clone()` creates additional transmitters for multiple producers
- `send()` sends a message, `recv()` receives a message
- The receiver blocks until a message is available

**Why**: Channels provide a safe and efficient way for threads to communicate without shared state.

### Synchronous Channels

**What**: Synchronous channels have bounded capacity and block when full.

**How**: Here's how to use synchronous channels:

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    // Create a synchronous channel with capacity 2
    let (tx, rx) = mpsc::sync_channel(2);

    // Producer thread
    let tx_clone = tx.clone();
    thread::spawn(move || {
        for i in 1..=5 {
            println!("Sending: {}", i);
            tx_clone.send(i).unwrap();
            thread::sleep(Duration::from_millis(1000));
        }
    });

    // Consumer thread
    thread::spawn(move || {
        for received in rx {
            println!("Received: {}", received);
            thread::sleep(Duration::from_millis(2000));
        }
    });

    // Keep main thread alive
    thread::sleep(Duration::from_millis(10000));
}
```

**Explanation**:

- `sync_channel(2)` creates a synchronous channel with capacity 2
- When the channel is full, `send()` blocks until space is available
- This provides backpressure control
- The producer will block when trying to send the 3rd message
- This prevents memory buildup from fast producers and slow consumers

**Why**: Synchronous channels provide flow control and prevent memory issues with fast producers.

### Thread-Safe Data Structures

**What**: Rust provides thread-safe data structures that can be safely used across multiple threads.

**How**: Here's how to use thread-safe data structures:

```rust
use std::thread;
use std::sync::{Arc, Mutex};
use std::collections::HashMap;
use std::time::Duration;

fn main() {
    let shared_map = Arc::new(Mutex::new(HashMap::new()));
    let mut handles = vec![];

    // Spawn multiple threads that modify the shared map
    for i in 0..5 {
        let map = Arc::clone(&shared_map);

        let handle = thread::spawn(move || {
            for j in 0..3 {
                let key = format!("thread_{}_key_{}", i, j);
                let value = i * 10 + j;

                {
                    let mut map = map.lock().unwrap();
                    map.insert(key.clone(), value);
                    println!("Thread {} inserted: {} = {}", i, key, value);
                }

                thread::sleep(Duration::from_millis(100));
            }
        });

        handles.push(handle);
    }

    // Wait for all threads to complete
    for handle in handles {
        handle.join().unwrap();
    }

    // Print the final state of the map
    let map = shared_map.lock().unwrap();
    println!("Final map contents:");
    for (key, value) in map.iter() {
        println!("  {}: {}", key, value);
    }
}
```

**Explanation**:

- `Arc<Mutex<HashMap>>` creates a thread-safe hash map
- Each thread acquires the lock before modifying the map
- The lock is released when the guard goes out of scope
- This ensures only one thread can modify the map at a time
- All threads can safely access the shared data structure

**Why**: Thread-safe data structures enable multiple threads to safely share and modify data.

## Understanding Common Thread Patterns

### Producer-Consumer Pattern

**What**: The producer-consumer pattern involves threads that produce data and threads that consume data.

**How**: Here's how to implement the producer-consumer pattern:

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();
    let mut handles = vec![];

    // Producer threads
    for i in 0..3 {
        let tx_clone = tx.clone();
        let handle = thread::spawn(move || {
            for j in 0..5 {
                let data = format!("Producer {}: Item {}", i, j);
                println!("Producing: {}", data);
                tx_clone.send(data).unwrap();
                thread::sleep(Duration::from_millis(500));
            }
        });
        handles.push(handle);
    }

    // Consumer thread
    let consumer_handle = thread::spawn(move || {
        for received in rx {
            println!("Consuming: {}", received);
            thread::sleep(Duration::from_millis(200));
        }
    });

    // Wait for all producer threads to complete
    for handle in handles {
        handle.join().unwrap();
    }

    // Close the channel by dropping the transmitter
    drop(tx);

    // Wait for consumer to finish
    consumer_handle.join().unwrap();
}
```

**Explanation**:

- Multiple producer threads send data through the channel
- A single consumer thread receives and processes the data
- The channel acts as a buffer between producers and consumer
- `drop(tx)` closes the channel, signaling no more data will be sent
- This pattern is useful for decoupling data production from consumption

**Why**: The producer-consumer pattern enables efficient data processing pipelines.

### Worker Pool Pattern

**What**: The worker pool pattern uses a fixed number of worker threads to process tasks from a queue.

**How**: Here's how to implement a worker pool:

```rust
use std::thread;
use std::sync::{Arc, Mutex, mpsc};
use std::time::Duration;

type Job = Box<dyn FnOnce() + Send + 'static>;

struct Worker {
    id: usize,
    thread: thread::JoinHandle<()>,
}

impl Worker {
    fn new(id: usize, receiver: Arc<Mutex<mpsc::Receiver<Job>>>) -> Worker {
        let thread = thread::spawn(move || {
            loop {
                let job = receiver.lock().unwrap().recv();

                match job {
                    Ok(job) => {
                        println!("Worker {} got a job; executing.", id);
                        job();
                    }
                    Err(_) => {
                        println!("Worker {} disconnected; shutting down.", id);
                        break;
                    }
                }
            }
        });

        Worker { id, thread }
    }
}

struct ThreadPool {
    workers: Vec<Worker>,
    sender: mpsc::Sender<Job>,
}

impl ThreadPool {
    fn new(size: usize) -> ThreadPool {
        let (sender, receiver) = mpsc::channel();
        let receiver = Arc::new(Mutex::new(receiver));
        let mut workers = Vec::with_capacity(size);

        for id in 0..size {
            workers.push(Worker::new(id, Arc::clone(&receiver)));
        }

        ThreadPool { workers, sender }
    }

    fn execute<F>(&self, f: F)
    where
        F: FnOnce() + Send + 'static,
    {
        let job = Box::new(f);
        self.sender.send(job).unwrap();
    }
}

fn main() {
    let pool = ThreadPool::new(4);

    for i in 0..8 {
        pool.execute(move || {
            println!("Executing task {}", i);
            thread::sleep(Duration::from_millis(1000));
        });
    }

    // Give tasks time to complete
    thread::sleep(Duration::from_millis(5000));
}
```

**Explanation**:

- `ThreadPool` manages a fixed number of worker threads
- `Job` is a type alias for closures that can be sent between threads
- Workers continuously receive and execute jobs from the queue
- The pool distributes work among available workers
- This pattern is useful for CPU-intensive tasks that can be parallelized

**Why**: Worker pools provide efficient task distribution and resource management.

## Understanding Thread Safety and Performance

### Avoiding Deadlocks

**What**: Deadlocks occur when threads are waiting for each other indefinitely.

**How**: Here's how to avoid deadlocks:

```rust
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;

fn main() {
    let mutex1 = Arc::new(Mutex::new(0));
    let mutex2 = Arc::new(Mutex::new(0));

    // Thread 1: Always acquire mutex1 first, then mutex2
    let m1 = Arc::clone(&mutex1);
    let m2 = Arc::clone(&mutex2);
    let handle1 = thread::spawn(move || {
        for _ in 0..5 {
            let _lock1 = m1.lock().unwrap();
            println!("Thread 1 acquired mutex1");
            thread::sleep(Duration::from_millis(100));

            let _lock2 = m2.lock().unwrap();
            println!("Thread 1 acquired mutex2");
            thread::sleep(Duration::from_millis(100));
        }
    });

    // Thread 2: Always acquire mutex1 first, then mutex2 (same order!)
    let m1 = Arc::clone(&mutex1);
    let m2 = Arc::clone(&mutex2);
    let handle2 = thread::spawn(move || {
        for _ in 0..5 {
            let _lock1 = m1.lock().unwrap();
            println!("Thread 2 acquired mutex1");
            thread::sleep(Duration::from_millis(100));

            let _lock2 = m2.lock().unwrap();
            println!("Thread 2 acquired mutex2");
            thread::sleep(Duration::from_millis(100));
        }
    });

    handle1.join().unwrap();
    handle2.join().unwrap();
}
```

**Explanation**:

- Both threads acquire mutexes in the same order (mutex1, then mutex2)
- This prevents deadlocks by ensuring consistent lock ordering
- If threads acquired locks in different orders, deadlock could occur
- Consistent ordering is a key strategy for deadlock prevention

**Why**: Avoiding deadlocks ensures your concurrent programs don't hang indefinitely.

### Performance Considerations

**What**: Thread creation and synchronization have overhead that should be considered.

**How**: Here's how to understand thread performance:

```rust
use std::thread;
use std::time::{Duration, Instant};
use std::sync::{Arc, Mutex};

fn sequential_sum(numbers: &[i32]) -> i32 {
    numbers.iter().sum()
}

fn parallel_sum(numbers: &[i32], num_threads: usize) -> i32 {
    let chunk_size = numbers.len() / num_threads;
    let numbers = Arc::new(numbers);
    let mut handles = vec![];

    for i in 0..num_threads {
        let start = i * chunk_size;
        let end = if i == num_threads - 1 {
            numbers.len()
        } else {
            (i + 1) * chunk_size
        };

        let numbers = Arc::clone(&numbers);
        let handle = thread::spawn(move || {
            numbers[start..end].iter().sum::<i32>()
        });
        handles.push(handle);
    }

    handles.into_iter()
        .map(|h| h.join().unwrap())
        .sum()
}

fn main() {
    let numbers: Vec<i32> = (1..=1_000_000).collect();

    // Sequential execution
    let start = Instant::now();
    let seq_result = sequential_sum(&numbers);
    let seq_duration = start.elapsed();

    // Parallel execution
    let start = Instant::now();
    let par_result = parallel_sum(&numbers, 4);
    let par_duration = start.elapsed();

    println!("Sequential result: {} in {:?}", seq_result, seq_duration);
    println!("Parallel result: {} in {:?}", par_result, par_duration);
    println!("Speedup: {:.2}x",
             seq_duration.as_nanos() as f64 / par_duration.as_nanos() as f64);
}
```

**Explanation**:

- Sequential execution processes all data in one thread
- Parallel execution divides work among multiple threads
- Thread creation and synchronization have overhead
- For small datasets, sequential might be faster
- For large datasets, parallel can provide significant speedup

**Why**: Understanding performance characteristics helps you choose the right approach for your use case.

## Practice Exercises

### Exercise 1: Basic Thread Creation

**What**: Create multiple threads that perform different tasks.

**How**: Implement this program:

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let mut handles = vec![];

    for i in 0..3 {
        let handle = thread::spawn(move || {
            println!("Thread {} starting", i);
            thread::sleep(Duration::from_millis(1000));
            println!("Thread {} finished", i);
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }
}
```

### Exercise 2: Thread Communication

**What**: Create a program where threads communicate using channels.

**How**: Implement this program:

```rust
use std::thread;
use std::sync::mpsc;
use std::time::Duration;

fn main() {
    let (tx, rx) = mpsc::channel();

    thread::spawn(move || {
        for i in 1..=5 {
            tx.send(i).unwrap();
            thread::sleep(Duration::from_millis(500));
        }
    });

    for received in rx {
        println!("Received: {}", received);
    }
}
```

### Exercise 3: Shared Data with Mutex

**What**: Create a program where multiple threads safely modify shared data.

**How**: Implement this program:

```rust
use std::thread;
use std::sync::{Arc, Mutex};
use std::time::Duration;

fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];

    for _ in 0..5 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            for _ in 0..10 {
                let mut num = counter.lock().unwrap();
                *num += 1;
                thread::sleep(Duration::from_millis(100));
            }
        });
        handles.push(handle);
    }

    for handle in handles {
        handle.join().unwrap();
    }

    println!("Final counter: {}", *counter.lock().unwrap());
}
```

## Key Takeaways

**What** you've learned about threads:

1. **Thread creation** - using `thread::spawn()` to create new threads
2. **Thread handles** - using `JoinHandle` to control thread lifecycle
3. **Thread safety** - using `Arc` and `Mutex` for safe data sharing
4. **Thread communication** - using channels for message passing
5. **Common patterns** - producer-consumer and worker pool patterns
6. **Performance considerations** - understanding overhead and speedup
7. **Deadlock prevention** - consistent lock ordering strategies

**Why** these concepts matter:

- **Concurrent execution** enables better resource utilization
- **Thread safety** prevents data races and ensures correctness
- **Communication patterns** enable complex concurrent systems
- **Performance** can be significantly improved with proper parallelization
- **Safety** is maintained through Rust's ownership system

## Next Steps

Now that you understand threads, you're ready to learn about:

- **Advanced concurrency patterns** - complex synchronization and coordination
- **Async programming** - asynchronous I/O and event-driven programming
- **Performance optimization** - choosing the right concurrency approach
- **Real-time systems** - deterministic concurrent programming

**Where** to go next: Continue with the next lesson on "Message Passing" to learn about advanced thread communication patterns!
