---
sidebar_position: 5
---

# Smart Pointers Practical Exercises

Apply your knowledge of smart pointers with hands-on exercises that reinforce key concepts.

## Exercise 1: Memory Management with Box&lt;T&gt;

**Objective**: Create a recursive data structure using `Box&lt;T&gt;` and understand heap allocation.

**Task**: Implement a binary search tree with the following operations:

- Insert values
- Search for values
- In-order traversal
- Calculate tree height

**Requirements**:

- Use `Box&lt;T&gt;` for recursive node references
- Implement proper memory management
- Handle edge cases (empty tree, single node)

**Hint**: Remember that `Box&lt;T&gt;` is essential for recursive data structures in Rust.

## Exercise 2: Shared Ownership with Rc&lt;T&gt;

**Objective**: Implement a shared ownership pattern using `Rc&lt;T&gt;` and `RefCell&lt;T&gt;`.

**Task**: Create a simple file system simulation with:

- Files that can be shared between directories
- Directories that can contain files
- Reference counting to track file usage

**Requirements**:

- Use `Rc&lt;T&gt;` for shared file ownership
- Use `RefCell&lt;T&gt;` for interior mutability
- Implement file sharing between directories
- Display reference counts

**Hint**: Think about how files can be referenced by multiple directories.

## Exercise 3: Thread-Safe Sharing with Arc&lt;T&gt; and Mutex&lt;T&gt;

**Objective**: Implement thread-safe data sharing using `Arc&lt;T&gt;` and `Mutex&lt;T&gt;`.

**Task**: Create a thread-safe counter that can be incremented by multiple threads:

- Use `Arc&lt;Mutex&lt;T&gt;&gt;` for thread-safe sharing
- Create multiple threads that increment the counter
- Ensure thread safety and proper synchronization

**Requirements**:

- Use `Arc&lt;T&gt;` for shared ownership across threads
- Use `Mutex&lt;T&gt;` for thread-safe mutation
- Handle potential deadlocks
- Display final counter value

**Hint**: Remember that `Arc&lt;T&gt;` is the thread-safe version of `Rc&lt;T&gt;`.

## Exercise 4: Breaking Reference Cycles with Weak&lt;T&gt;

**Objective**: Implement a parent-child relationship without creating reference cycles.

**Task**: Create a family tree structure where:

- Parents can have multiple children
- Children can access their parents
- No reference cycles are created
- Memory is properly deallocated

**Requirements**:

- Use `Weak&lt;T&gt;` for parent references
- Use `Rc&lt;T&gt;` for child references
- Implement methods to traverse up the tree
- Ensure proper memory management

**Hint**: Use weak references for parent relationships to break cycles.

## Exercise 5: Observer Pattern with Smart Pointers

**Objective**: Implement the observer pattern using smart pointers to prevent reference cycles.

**Task**: Create a simple event system where:

- Subjects can notify multiple observers
- Observers can be added and removed dynamically
- No reference cycles are created
- Dead observers are automatically cleaned up

**Requirements**:

- Use `Weak&lt;T&gt;` for observer references
- Implement automatic cleanup of dead observers
- Allow dynamic observer management
- Ensure thread safety if needed

**Hint**: Use weak references to prevent cycles between subjects and observers.

## Exercise 6: Cache Implementation with Weak References

**Objective**: Implement a cache system using weak references to avoid keeping objects alive.

**Task**: Create a cache that:

- Stores weak references to cached objects
- Automatically removes dead references
- Allows objects to be deallocated when not needed
- Provides efficient lookup and cleanup

**Requirements**:

- Use `Weak&lt;T&gt;` for cache entries
- Implement automatic cleanup of dead references
- Provide methods for cache management
- Handle cache eviction

**Hint**: Weak references allow cached objects to be deallocated when not needed.

## Exercise 7: Complex Data Structure with Smart Pointers

**Objective**: Implement a complex data structure using multiple smart pointer types.

**Task**: Create a graph data structure where:

- Nodes can be shared between multiple graphs
- Edges can be bidirectional
- No reference cycles are created
- Memory is properly managed

**Requirements**:

- Use appropriate smart pointers for different relationships
- Implement graph traversal algorithms
- Handle edge cases (cycles, disconnected components)
- Ensure proper memory management

**Hint**: Consider using weak references for certain relationships to break cycles.

## Exercise 8: Performance Comparison

**Objective**: Compare the performance of different smart pointer types.

**Task**: Benchmark the performance of:

- `Box&lt;T&gt;` vs stack allocation
- `Rc&lt;T&gt;` vs `Arc&lt;T&gt;`
- `RefCell&lt;T&gt;` vs `Mutex&lt;T&gt;`
- Strong vs weak references

**Requirements**:

- Create benchmarks for each comparison
- Measure memory usage and execution time
- Analyze the results
- Draw conclusions about when to use each type

**Hint**: Use `std::time::Instant` for timing measurements.

## Exercise 9: Real-World Application

**Objective**: Apply smart pointers to a real-world problem.

**Task**: Implement a simple web server that:

- Manages multiple client connections
- Shares data between connections
- Handles concurrent requests safely
- Manages memory efficiently

**Requirements**:

- Use appropriate smart pointers for different scenarios
- Ensure thread safety
- Handle resource cleanup
- Implement proper error handling

**Hint**: Consider using `Arc&lt;Mutex&lt;T&gt;&gt;` for shared state and `Box&lt;T&gt;` for large data structures.

## Exercise 10: Debugging Smart Pointer Issues

**Objective**: Learn to debug common smart pointer problems.

**Task**: Identify and fix issues in the following scenarios:

- Reference cycles causing memory leaks
- Deadlocks in multi-threaded code
- Use-after-free errors
- Performance issues with smart pointers

**Requirements**:

- Analyze problematic code
- Identify the root cause
- Implement proper fixes
- Test the solutions

**Hint**: Use tools like `Rc::strong_count` and `Rc::weak_count` for debugging.

## Key Learning Outcomes

After completing these exercises, you should be able to:

1. **Choose the right smart pointer** for different scenarios
2. **Implement complex data structures** using smart pointers
3. **Avoid common pitfalls** like reference cycles and deadlocks
4. **Debug smart pointer issues** effectively
5. **Optimize performance** by choosing appropriate smart pointer types
6. **Apply smart pointers** to real-world problems
7. **Understand memory management** in Rust applications

## Next Steps

Now that you've completed the smart pointers exercises, you're ready to:

- **Move to the next chapter** in the Rust programming series
- **Apply these concepts** to your own projects
- **Explore advanced patterns** with smart pointers
- **Contribute to open-source projects** that use smart pointers

**Where** to go next: Continue with the next lesson in the Rust programming series to learn about more advanced concepts!
