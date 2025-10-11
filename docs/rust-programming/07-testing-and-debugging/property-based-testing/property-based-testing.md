---
sidebar_position: 1
---

# Property-Based Testing

Master property-based testing in Rust with comprehensive explanations using the 4W+H framework.

## What Is Property-Based Testing?

**What**: Property-based testing is a testing methodology where you define properties that your code should satisfy, and the testing framework generates random inputs to verify these properties. Instead of writing specific test cases, you describe the general behavior your code should have.

**Why**: Property-based testing provides:

- **Comprehensive coverage** - tests with many more inputs than manual test cases
- **Bug discovery** - finds edge cases you might not have thought of
- **Specification** - properties serve as executable specifications
- **Regression prevention** - catches bugs introduced by changes
- **Confidence** - high confidence that code works correctly across many inputs

**When**: Use property-based testing when you need to:

- Test functions with many possible inputs
- Verify mathematical properties
- Test data structures and algorithms
- Ensure code works across a wide range of inputs
- Catch edge cases and boundary conditions

**Where**: Property-based tests are typically placed alongside unit tests in the same test modules.

## How to Use QuickCheck

### Basic QuickCheck Usage

**What**: QuickCheck is a property-based testing framework that generates random inputs and verifies properties.

**How**: Here's how to use QuickCheck for basic property testing:

```rust
// Add to Cargo.toml
// [dev-dependencies]
// quickcheck = "1.0"

use quickcheck::quickcheck;

// Function to test
fn add(x: i32, y: i32) -> i32 {
    x + y
}

// Property: addition is commutative
fn prop_add_commutative(x: i32, y: i32) -> bool {
    add(x, y) == add(y, x)
}

// Property: addition is associative
fn prop_add_associative(x: i32, y: i32, z: i32) -> bool {
    add(add(x, y), z) == add(x, add(y, z))
}

// Property: adding zero doesn't change the value
fn prop_add_zero(x: i32) -> bool {
    add(x, 0) == x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_properties() {
        quickcheck(prop_add_commutative as fn(i32, i32) -> bool);
        quickcheck(prop_add_associative as fn(i32, i32, i32) -> bool);
        quickcheck(prop_add_zero as fn(i32) -> bool);
    }
}
```

**Explanation**:

- `quickcheck` macro runs the property function with many random inputs
- Properties return `bool` - `true` means the property holds
- Each property tests a specific mathematical relationship
- QuickCheck generates random inputs and verifies the property

**Why**: Property-based testing catches bugs that specific test cases might miss.

### Testing List Operations

**What**: Property-based testing is particularly effective for testing list operations and data structures.

**How**: Here's how to test list operations:

```rust
use quickcheck::quickcheck;

// Function to test
fn reverse<T: Clone>(list: &[T]) -> Vec<T> {
    list.iter().rev().cloned().collect()
}

// Property: reversing twice gives original list
fn prop_reverse_twice<T: Clone + PartialEq>(list: Vec<T>) -> bool {
    let reversed = reverse(&list);
    let double_reversed = reverse(&reversed);
    list == double_reversed
}

// Property: reverse preserves length
fn prop_reverse_length<T>(list: Vec<T>) -> bool {
    list.len() == reverse(&list).len()
}

// Property: reverse of empty list is empty
fn prop_reverse_empty<T>(list: Vec<T>) -> bool {
    if list.is_empty() {
        reverse(&list).is_empty()
    } else {
        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_reverse_properties() {
        quickcheck(prop_reverse_twice as fn(Vec<i32>) -> bool);
        quickcheck(prop_reverse_length as fn(Vec<i32>) -> bool);
        quickcheck(prop_reverse_empty as fn(Vec<i32>) -> bool);
    }
}
```

**Explanation**:

- Properties test mathematical relationships of list operations
- `reverse_twice` verifies that reversing twice returns the original
- `reverse_length` ensures the length is preserved
- `reverse_empty` handles the edge case of empty lists

**Why**: List operations have many mathematical properties that are perfect for property-based testing.

## Understanding Property Definition

### Mathematical Properties

**What**: Mathematical properties are relationships that should always hold true.

**How**: Here's how to define mathematical properties:

```rust
use quickcheck::quickcheck;

// Function to test
fn multiply(x: f64, y: f64) -> f64 {
    x * y
}

// Property: multiplication is commutative
fn prop_multiply_commutative(x: f64, y: f64) -> bool {
    multiply(x, y) == multiply(y, x)
}

// Property: multiplication by zero gives zero
fn prop_multiply_zero(x: f64) -> bool {
    multiply(x, 0.0) == 0.0
}

// Property: multiplication by one gives original
fn prop_multiply_one(x: f64) -> bool {
    multiply(x, 1.0) == x
}

// Property: multiplication is associative
fn prop_multiply_associative(x: f64, y: f64, z: f64) -> bool {
    multiply(multiply(x, y), z) == multiply(x, multiply(y, z))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_multiply_properties() {
        quickcheck(prop_multiply_commutative as fn(f64, f64) -> bool);
        quickcheck(prop_multiply_zero as fn(f64) -> bool);
        quickcheck(prop_multiply_one as fn(f64) -> bool);
        quickcheck(prop_multiply_associative as fn(f64, f64, f64) -> bool);
    }
}
```

**Explanation**:

- Mathematical properties test fundamental relationships
- Commutative property: order doesn't matter
- Zero property: multiplying by zero gives zero
- Identity property: multiplying by one gives original
- Associative property: grouping doesn't matter

**Why**: Mathematical properties ensure functions behave correctly according to mathematical rules.

### Data Structure Properties

**What**: Data structures should maintain certain invariants and properties.

**How**: Here's how to test data structure properties:

```rust
use quickcheck::quickcheck;
use std::collections::HashMap;

// Function to test
fn insert_and_get(map: &mut HashMap<String, i32>, key: String, value: i32) -> Option<i32> {
    map.insert(key.clone(), value);
    map.get(&key).copied()
}

// Property: after inserting, we can retrieve the value
fn prop_insert_retrieve(key: String, value: i32) -> bool {
    let mut map = HashMap::new();
    let result = insert_and_get(&mut map, key.clone(), value);
    result == Some(value)
}

// Property: inserting overwrites previous value
fn prop_insert_overwrite(key: String, value1: i32, value2: i32) -> bool {
    let mut map = HashMap::new();
    insert_and_get(&mut map, key.clone(), value1);
    let result = insert_and_get(&mut map, key, value2);
    result == Some(value2)
}

// Property: inserting different keys doesn't interfere
fn prop_insert_different_keys(key1: String, key2: String, value1: i32, value2: i32) -> bool {
    if key1 == key2 {
        return true; // Skip if keys are the same
    }

    let mut map = HashMap::new();
    insert_and_get(&mut map, key1.clone(), value1);
    insert_and_get(&mut map, key2.clone(), value2);

    map.get(&key1) == Some(&value1) && map.get(&key2) == Some(&value2)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_hashmap_properties() {
        quickcheck(prop_insert_retrieve as fn(String, i32) -> bool);
        quickcheck(prop_insert_overwrite as fn(String, i32, i32) -> bool);
        quickcheck(prop_insert_different_keys as fn(String, String, i32, i32) -> bool);
    }
}
```

**Explanation**:

- Data structure properties test invariants and behavior
- `insert_retrieve` verifies basic functionality
- `insert_overwrite` tests that new values replace old ones
- `insert_different_keys` ensures keys don't interfere with each other

**Why**: Data structure properties ensure correct behavior and maintain invariants.

### Algorithm Properties

**What**: Algorithms should satisfy certain properties regardless of input.

**How**: Here's how to test algorithm properties:

```rust
use quickcheck::quickcheck;

// Function to test
fn bubble_sort<T: Clone + Ord>(mut list: Vec<T>) -> Vec<T> {
    let n = list.len();
    for i in 0..n {
        for j in 0..n - i - 1 {
            if list[j] > list[j + 1] {
                list.swap(j, j + 1);
            }
        }
    }
    list
}

// Property: sorted list is in ascending order
fn prop_sorted_ascending(list: Vec<i32>) -> bool {
    let sorted = bubble_sort(list);
    sorted.windows(2).all(|w| w[0] <= w[1])
}

// Property: sorted list has same length as original
fn prop_sorted_length(list: Vec<i32>) -> bool {
    let sorted = bubble_sort(list.clone());
    sorted.len() == list.len()
}

// Property: sorted list contains same elements
fn prop_sorted_elements(list: Vec<i32>) -> bool {
    let mut sorted = bubble_sort(list.clone());
    let mut original = list;
    sorted.sort();
    original.sort();
    sorted == original
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bubble_sort_properties() {
        quickcheck(prop_sorted_ascending as fn(Vec<i32>) -> bool);
        quickcheck(prop_sorted_length as fn(Vec<i32>) -> bool);
        quickcheck(prop_sorted_elements as fn(Vec<i32>) -> bool);
    }
}
```

**Explanation**:

- Algorithm properties test correctness and behavior
- `sorted_ascending` verifies the result is sorted
- `sorted_length` ensures no elements are lost
- `sorted_elements` verifies all elements are preserved

**Why**: Algorithm properties ensure correctness and verify that algorithms work as expected.

## Understanding Shrinking

### What Is Shrinking?

**What**: Shrinking is the process of finding the smallest input that causes a property to fail, making it easier to understand and fix bugs.

**How**: Here's how shrinking works:

```rust
use quickcheck::quickcheck;

// Function with a bug
fn buggy_add(x: i32, y: i32) -> i32 {
    if x > 1000 || y > 1000 {
        x + y + 1  // Bug: adds 1 for large numbers
    } else {
        x + y
    }
}

// Property: addition should be correct
fn prop_add_correct(x: i32, y: i32) -> bool {
    buggy_add(x, y) == x + y
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_add_bug() {
        // This will fail and QuickCheck will shrink the input
        quickcheck(prop_add_correct as fn(i32, i32) -> bool);
    }
}
```

**Explanation**:

- The function has a bug for large numbers
- QuickCheck will find a failing input
- Shrinking will reduce it to the smallest failing case
- This makes it easier to understand the bug

**Why**: Shrinking helps identify the root cause of failures by finding minimal failing inputs.

### Custom Shrinking

**What**: You can define custom shrinking behavior for complex data types.

**How**: Here's how to implement custom shrinking:

```rust
use quickcheck::{quickcheck, TestResult};

// Custom data type
#[derive(Debug, Clone)]
struct Point {
    x: i32,
    y: i32,
}

impl Point {
    fn new(x: i32, y: i32) -> Self {
        Self { x, y }
    }

    fn distance_from_origin(&self) -> f64 {
        ((self.x * self.x + self.y * self.y) as f64).sqrt()
    }
}

// Property with custom shrinking
fn prop_point_distance(x: i32, y: i32) -> TestResult {
    let point = Point::new(x, y);
    let distance = point.distance_from_origin();

    // Skip invalid cases
    if distance.is_nan() || distance.is_infinite() {
        return TestResult::discard();
    }

    // Test property
    TestResult::from_bool(distance >= 0.0)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_point_properties() {
        quickcheck(prop_point_distance as fn(i32, i32) -> TestResult);
    }
}
```

**Explanation**:

- `TestResult` allows custom test results
- `discard()` skips invalid test cases
- `from_bool()` converts boolean to test result
- Custom shrinking helps with complex data types

**Why**: Custom shrinking provides better debugging for complex data structures.

## Understanding Fuzzing

### Basic Fuzzing

**What**: Fuzzing is automated testing that provides random, malformed, or unexpected inputs to find bugs.

**How**: Here's how to implement basic fuzzing:

```rust
use quickcheck::quickcheck;

// Function to test
fn parse_number(s: &str) -> Result<i32, String> {
    if s.is_empty() {
        return Err("Empty string".to_string());
    }

    if s.starts_with('-') && s.len() == 1 {
        return Err("Invalid number".to_string());
    }

    s.parse::<i32>().map_err(|_| "Parse error".to_string())
}

// Property: parsing should handle all inputs gracefully
fn prop_parse_handles_all_inputs(s: String) -> bool {
    let result = parse_number(&s);
    match result {
        Ok(n) => n.to_string() == s.trim(),
        Err(_) => true, // Error is acceptable
    }
}

// Property: valid numbers should parse correctly
fn prop_parse_valid_numbers(n: i32) -> bool {
    let s = n.to_string();
    parse_number(&s) == Ok(n)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_fuzzing() {
        quickcheck(prop_parse_handles_all_inputs as fn(String) -> bool);
        quickcheck(prop_parse_valid_numbers as fn(i32) -> bool);
    }
}
```

**Explanation**:

- Fuzzing tests with random string inputs
- Properties verify that parsing handles all inputs gracefully
- Valid numbers should parse correctly
- Invalid inputs should return errors

**Why**: Fuzzing finds bugs in input handling and edge cases.

### Advanced Fuzzing

**What**: Advanced fuzzing can test complex interactions and stateful systems.

**How**: Here's how to implement advanced fuzzing:

```rust
use quickcheck::quickcheck;
use std::collections::HashMap;

// Stateful system to test
struct BankAccount {
    balance: i32,
    transactions: Vec<String>,
}

impl BankAccount {
    fn new() -> Self {
        Self {
            balance: 0,
            transactions: Vec::new(),
        }
    }

    fn deposit(&mut self, amount: i32) -> Result<(), String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }
        self.balance += amount;
        self.transactions.push(format!("Deposit: {}", amount));
        Ok(())
    }

    fn withdraw(&mut self, amount: i32) -> Result<(), String> {
        if amount <= 0 {
            return Err("Amount must be positive".to_string());
        }
        if amount > self.balance {
            return Err("Insufficient funds".to_string());
        }
        self.balance -= amount;
        self.transactions.push(format!("Withdraw: {}", amount));
        Ok(())
    }
}

// Property: balance should never be negative
fn prop_balance_never_negative(operations: Vec<(bool, i32)>) -> bool {
    let mut account = BankAccount::new();

    for (is_deposit, amount) in operations {
        if is_deposit {
            let _ = account.deposit(amount);
        } else {
            let _ = account.withdraw(amount);
        }
    }

    account.balance >= 0
}

// Property: transaction count should match operations
fn prop_transaction_count(operations: Vec<(bool, i32)>) -> bool {
    let mut account = BankAccount::new();

    for (is_deposit, amount) in operations {
        if is_deposit {
            let _ = account.deposit(amount);
        } else {
            let _ = account.withdraw(amount);
        }
    }

    account.transactions.len() == operations.len()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_bank_account_fuzzing() {
        quickcheck(prop_balance_never_negative as fn(Vec<(bool, i32)>) -> bool);
        quickcheck(prop_transaction_count as fn(Vec<(bool, i32)>) -> bool);
    }
}
```

**Explanation**:

- Fuzzing tests stateful systems with random operations
- Properties verify invariants are maintained
- Balance should never be negative
- Transaction count should match operations

**Why**: Advanced fuzzing finds bugs in complex stateful systems.

## Understanding Property-Based Testing Best Practices

### Property Design

**What**: Good properties are specific, testable, and meaningful.

**How**: Here's how to design good properties:

```rust
use quickcheck::quickcheck;

// Good property: specific and testable
fn prop_sort_is_sorted(list: Vec<i32>) -> bool {
    let sorted = bubble_sort(list);
    sorted.windows(2).all(|w| w[0] <= w[1])
}

// Good property: tests invariant
fn prop_sort_preserves_length(list: Vec<i32>) -> bool {
    let sorted = bubble_sort(list.clone());
    sorted.len() == list.len()
}

// Good property: tests behavior
fn prop_sort_preserves_elements(list: Vec<i32>) -> bool {
    let mut sorted = bubble_sort(list.clone());
    let mut original = list;
    sorted.sort();
    original.sort();
    sorted == original
}

// Bad property: too vague
fn prop_sort_does_something(list: Vec<i32>) -> bool {
    let sorted = bubble_sort(list);
    !sorted.is_empty() || sorted.is_empty()  // Always true
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_good_properties() {
        quickcheck(prop_sort_is_sorted as fn(Vec<i32>) -> bool);
        quickcheck(prop_sort_preserves_length as fn(Vec<i32>) -> bool);
        quickcheck(prop_sort_preserves_elements as fn(Vec<i32>) -> bool);
    }
}
```

**Explanation**:

- Good properties are specific and testable
- Properties should test invariants and behavior
- Avoid properties that are always true
- Properties should be meaningful and useful

**Why**: Good properties provide better test coverage and catch more bugs.

### Property Organization

**What**: Organizing properties makes tests more maintainable and understandable.

**How**: Here's how to organize properties:

```rust
use quickcheck::quickcheck;

// Group related properties
mod sort_properties {
    use super::*;

    pub fn prop_sort_is_sorted(list: Vec<i32>) -> bool {
        let sorted = bubble_sort(list);
        sorted.windows(2).all(|w| w[0] <= w[1])
    }

    pub fn prop_sort_preserves_length(list: Vec<i32>) -> bool {
        let sorted = bubble_sort(list.clone());
        sorted.len() == list.len()
    }

    pub fn prop_sort_preserves_elements(list: Vec<i32>) -> bool {
        let mut sorted = bubble_sort(list.clone());
        let mut original = list;
        sorted.sort();
        original.sort();
        sorted == original
    }
}

mod math_properties {
    use super::*;

    pub fn prop_add_commutative(x: i32, y: i32) -> bool {
        add(x, y) == add(y, x)
    }

    pub fn prop_add_associative(x: i32, y: i32, z: i32) -> bool {
        add(add(x, y), z) == add(x, add(y, z))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sort_properties() {
        quickcheck(sort_properties::prop_sort_is_sorted as fn(Vec<i32>) -> bool);
        quickcheck(sort_properties::prop_sort_preserves_length as fn(Vec<i32>) -> bool);
        quickcheck(sort_properties::prop_sort_preserves_elements as fn(Vec<i32>) -> bool);
    }

    #[test]
    fn test_math_properties() {
        quickcheck(math_properties::prop_add_commutative as fn(i32, i32) -> bool);
        quickcheck(math_properties::prop_add_associative as fn(i32, i32, i32) -> bool);
    }
}
```

**Explanation**:

- Properties are grouped by functionality
- Each group has related properties
- Tests are organized by property groups
- This makes tests more maintainable

**Why**: Organized properties are easier to understand and maintain.

## Key Takeaways

**What** you've learned about property-based testing:

1. **Property definition** - describe general behavior, not specific cases
2. **QuickCheck usage** - generate random inputs and verify properties
3. **Mathematical properties** - test fundamental relationships
4. **Data structure properties** - test invariants and behavior
5. **Algorithm properties** - test correctness and behavior
6. **Shrinking** - find minimal failing inputs for debugging
7. **Fuzzing** - test with random and malformed inputs

**Why** these concepts matter:

- **Comprehensive testing** - covers many more inputs than manual tests
- **Bug discovery** - finds edge cases and boundary conditions
- **Specification** - properties serve as executable specifications
- **Confidence** - high confidence in code correctness

## Next Steps

Now that you understand property-based testing, you're ready to learn about:

- **Fuzzing techniques** - advanced automated bug discovery
- **Debugging tools** - debugging techniques and tools
- **Error handling and recovery** - robust error management
- **Performance testing** - testing performance characteristics

**Where** to go next: Continue with the next lesson on "Fuzzing" to learn about advanced automated bug discovery!
