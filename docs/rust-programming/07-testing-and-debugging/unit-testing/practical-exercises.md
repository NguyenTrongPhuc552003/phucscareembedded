---
sidebar_position: 3
---

# Practical Exercises

Master unit testing in Rust through hands-on exercises with comprehensive solutions.

## Exercise 1: Basic Function Testing

**What**: Test a simple mathematical function with various inputs.

**How**: Implement tests for this function:

```rust
fn square(x: i32) -> i32 {
    x * x
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_square() {
        assert_eq!(square(2), 4);
        assert_eq!(square(0), 0);
        assert_eq!(square(-3), 9);
    }
}
```

**Explanation**:

- `square` function calculates the square of a number
- Tests cover positive, zero, and negative inputs
- `assert_eq!` verifies the expected results
- Tests ensure the function works correctly for all cases

**Why**: Basic function testing verifies that functions work correctly with expected inputs.

## Exercise 2: String Processing Tests

**What**: Test string manipulation functions with various inputs.

**How**: Implement tests for string functions:

```rust
fn count_words(text: &str) -> usize {
    text.split_whitespace().count()
}

fn reverse_string(s: &str) -> String {
    s.chars().rev().collect()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_count_words() {
        assert_eq!(count_words("Hello world"), 2);
        assert_eq!(count_words(""), 0);
        assert_eq!(count_words("   "), 0);
    }

    #[test]
    fn test_reverse_string() {
        assert_eq!(reverse_string("hello"), "olleh");
        assert_eq!(reverse_string(""), "");
        assert_eq!(reverse_string("a"), "a");
    }
}
```

**Explanation**:

- `count_words` counts words in a string
- `reverse_string` reverses a string
- Tests cover normal, empty, and edge cases
- String functions are tested thoroughly

**Why**: String processing tests ensure text manipulation functions work correctly.

## Exercise 3: Error Handling Tests

**What**: Test functions that can fail with proper error handling.

**How**: Implement tests for error conditions:

```rust
fn parse_positive_number(s: &str) -> Result<i32, String> {
    match s.parse::<i32>() {
        Ok(n) if n > 0 => Ok(n),
        Ok(_) => Err("Number must be positive".to_string()),
        Err(_) => Err("Invalid number format".to_string()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_parse_positive_number_success() {
        assert_eq!(parse_positive_number("42"), Ok(42));
    }

    #[test]
    fn test_parse_positive_number_negative() {
        assert_eq!(parse_positive_number("-5"), Err("Number must be positive".to_string()));
    }

    #[test]
    fn test_parse_positive_number_zero() {
        assert_eq!(parse_positive_number("0"), Err("Number must be positive".to_string()));
    }

    #[test]
    fn test_parse_positive_number_invalid() {
        assert_eq!(parse_positive_number("abc"), Err("Invalid number format".to_string()));
    }
}
```

**Explanation**:

- `parse_positive_number` parses positive integers
- Tests cover success and error cases
- Error messages are verified for correctness
- Error handling is thoroughly tested

**Why**: Error handling tests ensure functions handle failures gracefully.

## Exercise 4: Struct Testing

**What**: Test struct methods and state changes.

**How**: Implement tests for a struct:

```rust
#[derive(Debug, PartialEq)]
struct BankAccount {
    balance: f64,
    account_number: String,
}

impl BankAccount {
    fn new(account_number: String) -> Self {
        Self {
            balance: 0.0,
            account_number,
        }
    }

    fn deposit(&mut self, amount: f64) -> Result<(), String> {
        if amount <= 0.0 {
            return Err("Amount must be positive".to_string());
        }
        self.balance += amount;
        Ok(())
    }

    fn withdraw(&mut self, amount: f64) -> Result<f64, String> {
        if amount <= 0.0 {
            return Err("Amount must be positive".to_string());
        }
        if amount > self.balance {
            return Err("Insufficient funds".to_string());
        }
        self.balance -= amount;
        Ok(self.balance)
    }

    fn get_balance(&self) -> f64 {
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

        assert!(account.deposit(100.0).is_ok());
        assert_eq!(account.get_balance(), 100.0);

        assert!(account.deposit(-50.0).is_err());
        assert_eq!(account.get_balance(), 100.0);
    }

    #[test]
    fn test_withdraw() {
        let mut account = BankAccount::new("12345".to_string());
        account.deposit(100.0).unwrap();

        assert_eq!(account.withdraw(30.0), Ok(70.0));
        assert_eq!(account.get_balance(), 70.0);

        assert!(account.withdraw(100.0).is_err());
        assert_eq!(account.get_balance(), 70.0);
    }
}
```

**Explanation**:

- `BankAccount` struct manages account state
- Tests cover constructor, methods, and error cases
- State changes are verified after each operation
- Error conditions are tested with invalid inputs

**Why**: Struct testing ensures objects behave correctly and maintain proper state.

## Exercise 5: Integration Testing

**What**: Test multiple components working together.

**How**: Implement integration tests:

```rust
use std::collections::HashMap;

struct UserService {
    users: HashMap<String, User>,
}

#[derive(Debug, Clone, PartialEq)]
struct User {
    id: String,
    name: String,
    email: String,
}

impl UserService {
    fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }

    fn create_user(&mut self, name: String, email: String) -> User {
        let id = format!("user_{}", self.users.len() + 1);
        let user = User { id, name, email };
        self.users.insert(user.id.clone(), user.clone());
        user
    }

    fn get_user(&self, id: &str) -> Option<&User> {
        self.users.get(id)
    }

    fn update_user(&mut self, id: &str, name: String, email: String) -> Result<(), String> {
        if let Some(user) = self.users.get_mut(id) {
            user.name = name;
            user.email = email;
            Ok(())
        } else {
            Err("User not found".to_string())
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_service_integration() {
        let mut service = UserService::new();

        let user1 = service.create_user("Alice".to_string(), "alice@example.com".to_string());
        let user2 = service.create_user("Bob".to_string(), "bob@example.com".to_string());

        assert_eq!(user1.id, "user_1");
        assert_eq!(user2.id, "user_2");

        let retrieved_user = service.get_user("user_1").unwrap();
        assert_eq!(retrieved_user.name, "Alice");

        service.update_user("user_1", "Alice Smith".to_string(), "alice.smith@example.com".to_string()).unwrap();
        let updated_user = service.get_user("user_1").unwrap();
        assert_eq!(updated_user.name, "Alice Smith");

        let result = service.update_user("user_999", "Unknown".to_string(), "unknown@example.com".to_string());
        assert!(result.is_err());
    }
}
```

**Explanation**:

- Integration tests verify multiple components working together
- User service manages user creation, retrieval, and updates
- Tests cover the complete workflow
- Error cases are also tested

**Why**: Integration tests ensure components work together correctly.

## Exercise 6: Test Fixtures

**What**: Create test fixtures for reusable test setup.

**How**: Implement test fixtures:

```rust
use std::fs;
use std::path::Path;

struct TestFile {
    path: String,
}

impl TestFile {
    fn new(filename: &str) -> Self {
        let path = format!("test_data/{}", filename);
        Self { path }
    }

    fn create_with_content(&self, content: &str) -> Result<(), std::io::Error> {
        fs::create_dir_all("test_data")?;
        fs::write(&self.path, content)
    }

    fn read_content(&self) -> Result<String, std::io::Error> {
        fs::read_to_string(&self.path)
    }
}

impl Drop for TestFile {
    fn drop(&mut self) {
        let _ = fs::remove_file(&self.path);
        let _ = fs::remove_dir("test_data");
    }
}

fn process_file(filename: &str) -> Result<String, std::io::Error> {
    let content = fs::read_to_string(filename)?;
    Ok(content.to_uppercase())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_file_operations() {
        let test_file = TestFile::new("test.txt");

        test_file.create_with_content("Hello, World!").unwrap();

        let content = test_file.read_content().unwrap();
        assert_eq!(content, "Hello, World!");

        let result = process_file(&test_file.path);
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), "HELLO, WORLD!");
    }
}
```

**Explanation**:

- `TestFile` struct manages test file lifecycle
- `create_with_content` sets up test data
- `Drop` trait ensures cleanup after tests
- Tests are isolated and don't interfere with each other

**Why**: Test fixtures provide consistent test environment and automatic cleanup.

## Exercise 7: Mock Testing

**What**: Test components in isolation using mocks.

**How**: Implement mock testing:

```rust
use std::sync::{Arc, Mutex};

pub trait EmailService {
    fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String>;
}

pub struct UserNotifier {
    email_service: Arc<dyn EmailService>,
}

impl UserNotifier {
    pub fn new(email_service: Arc<dyn EmailService>) -> Self {
        Self { email_service }
    }

    pub fn notify_user(&self, email: &str, name: &str) -> Result<(), String> {
        let subject = "Welcome!";
        let body = format!("Hello {}, welcome to our service!", name);
        self.email_service.send_email(email, subject, &body)
    }
}

struct MockEmailService {
    sent_emails: Arc<Mutex<Vec<(String, String, String)>>>,
}

impl MockEmailService {
    fn new() -> Self {
        Self {
            sent_emails: Arc::new(Mutex::new(Vec::new())),
        }
    }

    fn get_sent_emails(&self) -> Vec<(String, String, String)> {
        self.sent_emails.lock().unwrap().clone()
    }
}

impl EmailService for MockEmailService {
    fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String> {
        self.sent_emails.lock().unwrap().push((to.to_string(), subject.to_string(), body.to_string()));
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_user_notification() {
        let mock_service = Arc::new(MockEmailService::new());
        let notifier = UserNotifier::new(mock_service.clone());

        let result = notifier.notify_user("user@example.com", "Alice");
        assert!(result.is_ok());

        let sent_emails = mock_service.get_sent_emails();
        assert_eq!(sent_emails.len(), 1);
        assert_eq!(sent_emails[0].0, "user@example.com");
        assert_eq!(sent_emails[0].1, "Welcome!");
        assert_eq!(sent_emails[0].2, "Hello Alice, welcome to our service!");
    }
}
```

**Explanation**:

- `MockEmailService` implements the `EmailService` trait
- Mock tracks calls and returns controlled responses
- Tests verify interactions without external dependencies
- Mocking isolates the code under test

**Why**: Mock testing allows testing in isolation without external dependencies.

## Exercise 8: Performance Testing

**What**: Test performance characteristics of functions.

**How**: Implement performance tests:

```rust
use std::time::Instant;

fn fibonacci(n: u32) -> u32 {
    match n {
        0 => 0,
        1 => 1,
        _ => fibonacci(n - 1) + fibonacci(n - 2),
    }
}

fn fibonacci_iterative(n: u32) -> u32 {
    if n <= 1 {
        return n;
    }

    let mut a = 0;
    let mut b = 1;
    for _ in 2..=n {
        let temp = a + b;
        a = b;
        b = temp;
    }
    b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_fibonacci_correctness() {
        assert_eq!(fibonacci(0), 0);
        assert_eq!(fibonacci(1), 1);
        assert_eq!(fibonacci(10), 55);
        assert_eq!(fibonacci(20), 6765);
    }

    #[test]
    fn test_fibonacci_performance() {
        let start = Instant::now();
        let result = fibonacci(20);
        let duration = start.elapsed();

        assert_eq!(result, 6765);
        assert!(duration.as_millis() < 1000, "Fibonacci took too long: {:?}", duration);
    }

    #[test]
    fn test_fibonacci_iterative_performance() {
        let start = Instant::now();
        let result = fibonacci_iterative(20);
        let duration = start.elapsed();

        assert_eq!(result, 6765);
        assert!(duration.as_millis() < 100, "Iterative fibonacci took too long: {:?}", duration);
    }
}
```

**Explanation**:

- Performance tests measure execution time
- Correctness tests verify results
- Performance thresholds ensure acceptable performance
- Different implementations are compared

**Why**: Performance tests ensure functions meet performance requirements.

## Key Takeaways

**What** you've learned about unit testing:

1. **Basic function testing** - test simple functions with various inputs
2. **String processing tests** - test text manipulation functions
3. **Error handling tests** - test functions that can fail
4. **Struct testing** - test object methods and state changes
5. **Integration testing** - test multiple components together
6. **Test fixtures** - reusable test setup and teardown
7. **Mock testing** - test components in isolation
8. **Performance testing** - test performance characteristics

**Why** these concepts matter:

- **Comprehensive testing** - thorough coverage of functionality
- **Isolation** - test components independently
- **Performance** - ensure acceptable performance
- **Maintainability** - organized and reusable tests

## Next Steps

Now that you understand unit testing, you're ready to learn about:

- **Advanced testing** - integration tests and test organization
- **Property-based testing** - testing with generated data
- **Fuzzing techniques** - automated bug discovery
- **Debugging tools** - debugging techniques and tools

**Where** to go next: Continue with the next lesson on "Advanced Testing" to learn about integration tests and test organization!
