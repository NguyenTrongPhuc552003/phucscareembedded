---
sidebar_position: 1
---

# Testing Fundamentals

Master the fundamentals of unit testing in Rust with comprehensive explanations using the 4W+H framework.

## What Is Unit Testing?

**What**: Unit testing is the practice of testing individual units of code (functions, methods, or modules) in isolation to verify they work correctly. In Rust, unit tests are first-class citizens with built-in support.

**Why**: Unit testing provides:

- **Early bug detection** - catch issues before they reach production
- **Code confidence** - ensure changes don't break existing functionality
- **Documentation** - tests serve as executable examples of how code should work
- **Refactoring safety** - make changes with confidence that behavior is preserved
- **Design feedback** - writing tests often reveals design issues early

**When**: Use unit testing when you need to:

- Verify individual function behavior
- Test edge cases and error conditions
- Ensure code works as expected
- Document expected behavior
- Support refactoring and maintenance

**Where**: Unit tests are typically placed in the same file as the code they test (for private functions) or in separate test modules.

## How to Write Basic Unit Tests

### Simple Function Test

**What**: Testing a basic function to verify it produces the expected output.

**How**: Here's how to write a simple unit test:

```rust
// Function to test
fn add(x: i32, y: i32) -> i32 {
    x + y
}

// Unit test
#[cfg(test)]
mod tests {
    use super::*;  // Import functions from parent module

    #[test]
    fn test_add() {
        let result = add(2, 3);
        assert_eq!(result, 5);  // Verify the result is correct
    }
}
```

**Explanation**:

- `#[cfg(test)]` ensures tests only compile in test mode
- `use super::*;` imports all items from the parent module
- `#[test]` marks a function as a test
- `assert_eq!` verifies that two values are equal
- Tests are run with `cargo test`

**Why**: Basic tests verify that functions work correctly with expected inputs.

### Testing with Multiple Assertions

**What**: A single test can contain multiple assertions to verify different aspects of behavior.

**How**: Here's how to use multiple assertions:

```rust
fn divide(a: f64, b: f64) -> f64 {
    a / b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_divide() {
        // Test normal division
        assert_eq!(divide(10.0, 2.0), 5.0);

        // Test division by 1
        assert_eq!(divide(7.0, 1.0), 7.0);

        // Test decimal division
        assert_eq!(divide(1.0, 3.0), 1.0 / 3.0);

        // Test with floating point precision
        assert!((divide(1.0, 3.0) - 0.3333333333333333).abs() < 1e-10);
    }
}
```

**Explanation**:

- Multiple `assert_eq!` calls test different scenarios
- `assert!` tests a boolean condition
- Floating point comparisons use approximate equality
- Each assertion verifies a specific aspect of the function

**Why**: Multiple assertions provide comprehensive coverage of function behavior.

### Testing Edge Cases

**What**: Edge cases are boundary conditions and unusual inputs that might cause problems.

**How**: Here's how to test edge cases:

```rust
fn factorial(n: u32) -> u32 {
    match n {
        0 => 1,
        1 => 1,
        _ => n * factorial(n - 1),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_factorial_edge_cases() {
        // Test base cases
        assert_eq!(factorial(0), 1);
        assert_eq!(factorial(1), 1);

        // Test small values
        assert_eq!(factorial(2), 2);
        assert_eq!(factorial(3), 6);

        // Test larger value
        assert_eq!(factorial(5), 120);
    }
}
```

**Explanation**:

- Base cases (0 and 1) are critical for recursive functions
- Small values verify the basic logic
- Larger values test the complete algorithm
- Edge cases often reveal bugs in boundary conditions

**Why**: Edge cases are where bugs most commonly occur, so they need thorough testing.

## Understanding Test Organization

### Test Modules

**What**: Tests are organized in modules to keep them separate from production code.

**How**: Here's how to organize tests:

```rust
// Production code
pub fn calculate_area(length: f64, width: f64) -> f64 {
    length * width
}

pub fn calculate_perimeter(length: f64, width: f64) -> f64 {
    2.0 * (length + width)
}

// Test module
#[cfg(test)]
mod tests {
    use super::*;  // Import all public functions

    #[test]
    fn test_calculate_area() {
        assert_eq!(calculate_area(5.0, 3.0), 15.0);
        assert_eq!(calculate_area(0.0, 10.0), 0.0);
    }

    #[test]
    fn test_calculate_perimeter() {
        assert_eq!(calculate_perimeter(5.0, 3.0), 16.0);
        assert_eq!(calculate_perimeter(0.0, 0.0), 0.0);
    }
}
```

**Explanation**:

- `#[cfg(test)]` ensures tests only compile during testing
- `use super::*;` imports all items from the parent module
- Each test focuses on a specific function
- Tests are grouped logically by functionality

**Why**: Organized tests are easier to maintain and understand.

### Testing Private Functions

**What**: You can test private functions by placing tests in the same module.

**How**: Here's how to test private functions:

```rust
// Private helper function
fn is_even(n: i32) -> bool {
    n % 2 == 0
}

// Public function that uses the helper
pub fn get_even_numbers(numbers: &[i32]) -> Vec<i32> {
    numbers.iter().filter(|&&n| is_even(n)).cloned().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_even() {
        // Test the private function directly
        assert!(is_even(2));
        assert!(is_even(4));
        assert!(!is_even(3));
        assert!(!is_even(5));
    }

    #[test]
    fn test_get_even_numbers() {
        let numbers = vec![1, 2, 3, 4, 5, 6];
        let evens = get_even_numbers(&numbers);
        assert_eq!(evens, vec![2, 4, 6]);
    }
}
```

**Explanation**:

- Private functions can be tested directly in the same module
- `is_even` is tested with various inputs
- The public function is also tested to verify integration
- This approach provides comprehensive coverage

**Why**: Testing private functions ensures internal logic is correct and helps with debugging.

## Understanding Assertion Macros

### Basic Assertions

**What**: Rust provides several assertion macros for different types of verification.

**How**: Here's how to use different assertion macros:

```rust
fn process_number(n: i32) -> (bool, i32) {
    let is_positive = n > 0;
    let doubled = n * 2;
    (is_positive, doubled)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_assertion_macros() {
        let (is_positive, doubled) = process_number(5);

        // assert! - test boolean condition
        assert!(is_positive);

        // assert_eq! - test equality
        assert_eq!(doubled, 10);

        // assert_ne! - test inequality
        assert_ne!(doubled, 5);

        // assert! with custom message
        assert!(is_positive, "Expected positive number, got {}", 5);
    }
}
```

**Explanation**:

- `assert!` tests a boolean condition
- `assert_eq!` verifies two values are equal
- `assert_ne!` verifies two values are not equal
- Custom messages provide better error information

**Why**: Different assertion macros make tests more expressive and provide better error messages.

### Custom Error Messages

**What**: Custom error messages help debug test failures by providing context.

**How**: Here's how to add custom error messages:

```rust
fn find_max(numbers: &[i32]) -> Option<i32> {
    numbers.iter().max().copied()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_find_max_with_messages() {
        let numbers = vec![3, 7, 1, 9, 4];
        let max = find_max(&numbers);

        assert_eq!(max, Some(9), "Expected max to be 9, got {:?}", max);

        // Test empty array
        let empty: Vec<i32> = vec![];
        let max_empty = find_max(&empty);

        assert_eq!(max_empty, None, "Expected None for empty array, got {:?}", max_empty);
    }
}
```

**Explanation**:

- Custom messages include the actual values for debugging
- Messages help identify which assertion failed
- Context makes it easier to understand test failures
- `{:?}` format is used for debug representation

**Why**: Custom error messages make test failures much easier to debug and understand.

## Understanding Test-Driven Development (TDD)

### Red-Green-Refactor Cycle

**What**: TDD follows the Red-Green-Refactor cycle: write failing tests first, make them pass, then refactor.

**How**: Here's how to practice TDD:

```rust
// Step 1: Write a failing test (RED)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_discount() {
        // This test will fail because the function doesn't exist yet
        let price = 100.0;
        let discount_rate = 0.1;
        let discounted_price = calculate_discount(price, discount_rate);
        assert_eq!(discounted_price, 90.0);
    }
}

// Step 2: Write minimal code to make test pass (GREEN)
fn calculate_discount(price: f64, discount_rate: f64) -> f64 {
    price * (1.0 - discount_rate)
}

// Step 3: Add more tests and refactor (REFACTOR)
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_discount() {
        assert_eq!(calculate_discount(100.0, 0.1), 90.0);
    }

    #[test]
    fn test_calculate_discount_zero() {
        assert_eq!(calculate_discount(100.0, 0.0), 100.0);
    }

    #[test]
    fn test_calculate_discount_full() {
        assert_eq!(calculate_discount(100.0, 1.0), 0.0);
    }
}
```

**Explanation**:

- Start with a failing test (RED phase)
- Write minimal code to make it pass (GREEN phase)
- Add more tests and improve the code (REFACTOR phase)
- Each cycle improves the code incrementally

**Why**: TDD ensures comprehensive test coverage and drives better design.

### TDD Example: String Calculator

**What**: A complete TDD example building a string calculator step by step.

**How**: Here's how to build a calculator using TDD:

```rust
// Step 1: Test for empty string
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_string() {
        assert_eq!(add(""), 0);
    }
}

// Minimal implementation
fn add(numbers: &str) -> i32 {
    if numbers.is_empty() {
        0
    } else {
        numbers.parse().unwrap_or(0)
    }
}

// Step 2: Test for single number
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_string() {
        assert_eq!(add(""), 0);
    }

    #[test]
    fn test_single_number() {
        assert_eq!(add("5"), 5);
    }
}

// Updated implementation
fn add(numbers: &str) -> i32 {
    if numbers.is_empty() {
        0
    } else {
        numbers.parse().unwrap_or(0)
    }
}

// Step 3: Test for two numbers
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_empty_string() {
        assert_eq!(add(""), 0);
    }

    #[test]
    fn test_single_number() {
        assert_eq!(add("5"), 5);
    }

    #[test]
    fn test_two_numbers() {
        assert_eq!(add("1,2"), 3);
    }
}

// Final implementation
fn add(numbers: &str) -> i32 {
    if numbers.is_empty() {
        0
    } else {
        numbers.split(',')
               .map(|s| s.trim().parse::<i32>().unwrap_or(0))
               .sum()
    }
}
```

**Explanation**:

- Each test drives the next feature
- Implementation grows incrementally
- Tests serve as documentation
- Refactoring is safe because tests ensure behavior is preserved

**Why**: TDD creates robust, well-tested code with clear requirements.

## Understanding Test Organization Patterns

### Testing Structs and Methods

**What**: Testing structs involves testing their methods and state changes.

**How**: Here's how to test structs:

```rust
#[derive(Debug, PartialEq)]
pub struct BankAccount {
    balance: f64,
    account_number: String,
}

impl BankAccount {
    pub fn new(account_number: String) -> Self {
        Self {
            balance: 0.0,
            account_number,
        }
    }

    pub fn deposit(&mut self, amount: f64) -> Result<(), String> {
        if amount <= 0.0 {
            Err("Amount must be positive".to_string())
        } else {
            self.balance += amount;
            Ok(())
        }
    }

    pub fn withdraw(&mut self, amount: f64) -> Result<f64, String> {
        if amount <= 0.0 {
            Err("Amount must be positive".to_string())
        } else if amount > self.balance {
            Err("Insufficient funds".to_string())
        } else {
            self.balance -= amount;
            Ok(self.balance)
        }
    }

    pub fn get_balance(&self) -> f64 {
        self.balance
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_new_account() {
        let account = BankAccount::new("12345".to_string());
        assert_eq!(account.get_balance(), 0.0);
        assert_eq!(account.account_number, "12345");
    }

    #[test]
    fn test_deposit() {
        let mut account = BankAccount::new("12345".to_string());

        // Test successful deposit
        assert!(account.deposit(100.0).is_ok());
        assert_eq!(account.get_balance(), 100.0);

        // Test invalid deposit
        assert!(account.deposit(-50.0).is_err());
        assert_eq!(account.get_balance(), 100.0); // Balance unchanged
    }

    #[test]
    fn test_withdraw() {
        let mut account = BankAccount::new("12345".to_string());
        account.deposit(100.0).unwrap();

        // Test successful withdrawal
        let result = account.withdraw(30.0);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 70.0);
        assert_eq!(account.get_balance(), 70.0);

        // Test insufficient funds
        let result = account.withdraw(100.0);
        assert!(result.is_err());
        assert_eq!(account.get_balance(), 70.0); // Balance unchanged
    }
}
```

**Explanation**:

- Tests cover constructor, methods, and error cases
- State changes are verified after each operation
- Error conditions are tested with invalid inputs
- The struct's behavior is thoroughly validated

**Why**: Struct testing ensures objects behave correctly and maintain proper state.

### Testing Error Conditions

**What**: Error conditions are critical to test as they represent failure modes.

**How**: Here's how to test error conditions:

```rust
pub fn safe_divide(a: f64, b: f64) -> Result<f64, String> {
    if b == 0.0 {
        Err("Division by zero".to_string())
    } else if !a.is_finite() || !b.is_finite() {
        Err("Non-finite numbers".to_string())
    } else {
        Ok(a / b)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safe_divide_success() {
        let result = safe_divide(10.0, 2.0);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), 5.0);
    }

    #[test]
    fn test_safe_divide_by_zero() {
        let result = safe_divide(10.0, 0.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Division by zero");
    }

    #[test]
    fn test_safe_divide_infinity() {
        let result = safe_divide(f64::INFINITY, 2.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Non-finite numbers");
    }

    #[test]
    fn test_safe_divide_nan() {
        let result = safe_divide(f64::NAN, 2.0);
        assert!(result.is_err());
        assert_eq!(result.unwrap_err(), "Non-finite numbers");
    }
}
```

**Explanation**:

- Success cases verify normal operation
- Error cases test all failure modes
- Error messages are verified for correctness
- Edge cases like infinity and NaN are tested

**Why**: Error testing ensures robust error handling and prevents crashes.

## Understanding Test Utilities

### Test Setup and Teardown

**What**: Setup and teardown functions prepare test environment and clean up after tests.

**How**: Here's how to implement test utilities:

```rust
use std::fs;
use std::path::Path;

pub struct TestFile {
    path: String,
}

impl TestFile {
    pub fn new(filename: &str) -> Self {
        let path = format!("test_data/{}", filename);
        Self { path }
    }

    pub fn create_with_content(&self, content: &str) -> Result<(), std::io::Error> {
        fs::create_dir_all("test_data")?;
        fs::write(&self.path, content)
    }

    pub fn read_content(&self) -> Result<String, std::io::Error> {
        fs::read_to_string(&self.path)
    }
}

impl Drop for TestFile {
    fn drop(&mut self) {
        // Cleanup: remove test file
        let _ = fs::remove_file(&self.path);
        let _ = fs::remove_dir("test_data");
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_operations() {
        let test_file = TestFile::new("test.txt");

        // Setup: create test file
        test_file.create_with_content("Hello, World!").unwrap();

        // Test: verify content
        let content = test_file.read_content().unwrap();
        assert_eq!(content, "Hello, World!");

        // Teardown: automatically handled by Drop trait
    }
}
```

**Explanation**:

- `TestFile` struct manages test file lifecycle
- `create_with_content` sets up test data
- `Drop` trait automatically cleans up after tests
- Tests are isolated and don't interfere with each other

**Why**: Proper setup and teardown ensure tests are isolated and don't leave artifacts.

### Test Data Builders

**What**: Test data builders create complex test objects with sensible defaults.

**How**: Here's how to implement test data builders:

```rust
#[derive(Debug, PartialEq)]
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
    pub age: u32,
    pub is_active: bool,
}

pub struct UserBuilder {
    id: u32,
    name: String,
    email: String,
    age: u32,
    is_active: bool,
}

impl UserBuilder {
    pub fn new() -> Self {
        Self {
            id: 1,
            name: "John Doe".to_string(),
            email: "john@example.com".to_string(),
            age: 25,
            is_active: true,
        }
    }

    pub fn with_id(mut self, id: u32) -> Self {
        self.id = id;
        self
    }

    pub fn with_name(mut self, name: &str) -> Self {
        self.name = name.to_string();
        self
    }

    pub fn with_email(mut self, email: &str) -> Self {
        self.email = email.to_string();
        self
    }

    pub fn with_age(mut self, age: u32) -> Self {
        self.age = age;
        self
    }

    pub fn inactive(mut self) -> Self {
        self.is_active = false;
        self
    }

    pub fn build(self) -> User {
        User {
            id: self.id,
            name: self.name,
            email: self.email,
            age: self.age,
            is_active: self.is_active,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_builder_default() {
        let user = UserBuilder::new().build();

        assert_eq!(user.id, 1);
        assert_eq!(user.name, "John Doe");
        assert_eq!(user.email, "john@example.com");
        assert_eq!(user.age, 25);
        assert!(user.is_active);
    }

    #[test]
    fn test_user_builder_custom() {
        let user = UserBuilder::new()
            .with_id(42)
            .with_name("Alice")
            .with_email("alice@example.com")
            .with_age(30)
            .inactive()
            .build();

        assert_eq!(user.id, 42);
        assert_eq!(user.name, "Alice");
        assert_eq!(user.email, "alice@example.com");
        assert_eq!(user.age, 30);
        assert!(!user.is_active);
    }
}
```

**Explanation**:

- `UserBuilder` provides fluent interface for creating test users
- Default values make tests concise
- Method chaining allows customizing only needed fields
- Builders make test data creation more readable

**Why**: Test data builders make tests more maintainable and readable.

## Key Takeaways

**What** you've learned about unit testing:

1. **Unit tests verify individual functions** - test one thing at a time
2. **Use assertion macros** - `assert!`, `assert_eq!`, `assert_ne!` for verification
3. **Test edge cases and errors** - boundary conditions and failure modes
4. **Organize tests in modules** - keep tests separate from production code
5. **Practice TDD** - write tests first, then implementation
6. **Use test utilities** - builders, setup/teardown for complex tests
7. **Custom error messages** - make test failures easier to debug

**Why** these concepts matter:

- **Reliability** - tests catch bugs before they reach production
- **Confidence** - tests enable safe refactoring and changes
- **Documentation** - tests serve as executable examples
- **Design** - writing tests often improves code design

## Next Steps

Now that you understand unit testing fundamentals, you're ready to learn about:

- **Integration testing** - testing multiple components together
- **Test fixtures and setup** - advanced test organization
- **Mocking and stubbing** - testing with dependencies
- **Property-based testing** - testing with generated data

**Where** to go next: Continue with the next lesson on "Advanced Testing" to learn about integration tests and test organization!
