---
sidebar_position: 2
---

# Advanced Testing

Master advanced testing techniques in Rust including integration tests, test fixtures, and testing best practices.

## What Is Advanced Testing?

**What**: Advanced testing goes beyond basic unit tests to include integration tests, test fixtures, mocking, and sophisticated test organization patterns.

**Why**: Advanced testing provides:

- **Integration verification** - test how components work together
- **Test reusability** - share test setup across multiple tests
- **Dependency isolation** - test components in isolation from external dependencies
- **Performance testing** - verify code meets performance requirements
- **Test maintainability** - organize tests for long-term maintenance

**When**: Use advanced testing when you need to:

- Test multiple components together
- Share test setup across tests
- Mock external dependencies
- Test performance characteristics
- Organize large test suites

**Where**: Advanced tests are typically placed in separate test directories or modules.

## How to Write Integration Tests

### Basic Integration Test

**What**: Integration tests verify that multiple components work together correctly.

**How**: Here's how to write integration tests:

```rust
// src/lib.rs - Library code
pub mod math {
    pub fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    pub fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }
}

pub mod calculator {
    use crate::math;

    pub struct Calculator {
        pub result: i32,
    }

    impl Calculator {
        pub fn new() -> Self {
            Self { result: 0 }
        }

        pub fn add(&mut self, value: i32) {
            self.result = math::add(self.result, value);
        }

        pub fn multiply(&mut self, value: i32) {
            self.result = math::multiply(self.result, value);
        }

        pub fn get_result(&self) -> i32 {
            self.result
        }
    }
}
```

```rust
// tests/integration_test.rs - Integration test
use my_lib::calculator::Calculator;

#[test]
fn test_calculator_operations() {
    let mut calc = Calculator::new();

    // Test addition
    calc.add(5);
    assert_eq!(calc.get_result(), 5);

    // Test multiplication
    calc.multiply(3);
    assert_eq!(calc.get_result(), 15);

    // Test multiple operations
    calc.add(10);
    assert_eq!(calc.get_result(), 25);
}
```

**Explanation**:

- Integration tests are in the `tests/` directory
- They test the public API of the library
- Multiple components work together
- Tests verify the complete workflow

**Why**: Integration tests ensure components work together correctly in realistic scenarios.

### Testing with External Dependencies

**What**: Integration tests can test interactions with external systems like databases or APIs.

**How**: Here's how to test with external dependencies:

```rust
// src/lib.rs
use std::collections::HashMap;

pub struct UserService {
    users: HashMap<u32, User>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct User {
    pub id: u32,
    pub name: String,
    pub email: String,
}

impl UserService {
    pub fn new() -> Self {
        Self {
            users: HashMap::new(),
        }
    }

    pub fn create_user(&mut self, name: String, email: String) -> User {
        let id = (self.users.len() + 1) as u32;
        let user = User { id, name, email };
        self.users.insert(id, user.clone());
        user
    }

    pub fn get_user(&self, id: u32) -> Option<&User> {
        self.users.get(&id)
    }

    pub fn update_user(&mut self, id: u32, name: String, email: String) -> Result<(), String> {
        if let Some(user) = self.users.get_mut(&id) {
            user.name = name;
            user.email = email;
            Ok(())
        } else {
            Err("User not found".to_string())
        }
    }
}
```

```rust
// tests/user_service_test.rs
use my_lib::UserService;

#[test]
fn test_user_service_integration() {
    let mut service = UserService::new();

    // Create users
    let user1 = service.create_user("Alice".to_string(), "alice@example.com".to_string());
    let user2 = service.create_user("Bob".to_string(), "bob@example.com".to_string());

    // Verify users were created
    assert_eq!(user1.id, 1);
    assert_eq!(user2.id, 2);

    // Test retrieval
    let retrieved_user = service.get_user(1).unwrap();
    assert_eq!(retrieved_user.name, "Alice");

    // Test update
    service.update_user(1, "Alice Smith".to_string(), "alice.smith@example.com".to_string()).unwrap();
    let updated_user = service.get_user(1).unwrap();
    assert_eq!(updated_user.name, "Alice Smith");

    // Test error case
    let result = service.update_user(999, "Unknown".to_string(), "unknown@example.com".to_string());
    assert!(result.is_err());
}
```

**Explanation**:

- Integration tests verify the complete user service workflow
- Multiple operations are tested together
- Error cases are also tested
- The test simulates real usage patterns

**Why**: Integration tests ensure the complete system works correctly.

## Understanding Test Fixtures

### Basic Test Fixtures

**What**: Test fixtures provide reusable setup and teardown for tests.

**How**: Here's how to implement test fixtures:

```rust
// src/lib.rs
use std::fs;
use std::path::Path;

pub struct FileManager {
    base_path: String,
}

impl FileManager {
    pub fn new(base_path: String) -> Self {
        Self { base_path }
    }

    pub fn create_file(&self, filename: &str, content: &str) -> Result<(), std::io::Error> {
        let path = Path::new(&self.base_path).join(filename);
        fs::create_dir_all(path.parent().unwrap())?;
        fs::write(path, content)
    }

    pub fn read_file(&self, filename: &str) -> Result<String, std::io::Error> {
        let path = Path::new(&self.base_path).join(filename);
        fs::read_to_string(path)
    }

    pub fn delete_file(&self, filename: &str) -> Result<(), std::io::Error> {
        let path = Path::new(&self.base_path).join(filename);
        fs::remove_file(path)
    }
}
```

```rust
// tests/file_manager_test.rs
use my_lib::FileManager;
use std::fs;
use std::path::Path;

struct TestFixture {
    file_manager: FileManager,
    test_dir: String,
}

impl TestFixture {
    fn new() -> Self {
        let test_dir = "test_temp".to_string();
        let file_manager = FileManager::new(test_dir.clone());
        Self {
            file_manager,
            test_dir,
        }
    }

    fn setup(&self) {
        // Create test directory
        fs::create_dir_all(&self.test_dir).unwrap();
    }

    fn teardown(&self) {
        // Clean up test directory
        let _ = fs::remove_dir_all(&self.test_dir);
    }
}

impl Drop for TestFixture {
    fn drop(&mut self) {
        self.teardown();
    }
}

#[test]
fn test_file_operations() {
    let fixture = TestFixture::new();
    fixture.setup();

    // Test file creation
    fixture.file_manager.create_file("test.txt", "Hello, World!").unwrap();

    // Test file reading
    let content = fixture.file_manager.read_file("test.txt").unwrap();
    assert_eq!(content, "Hello, World!");

    // Test file deletion
    fixture.file_manager.delete_file("test.txt").unwrap();

    // Verify file is deleted
    let result = fixture.file_manager.read_file("test.txt");
    assert!(result.is_err());
}
```

**Explanation**:

- `TestFixture` struct manages test setup and teardown
- `setup()` method prepares the test environment
- `teardown()` method cleans up after tests
- `Drop` trait ensures cleanup happens automatically

**Why**: Test fixtures provide consistent test environment and automatic cleanup.

### Advanced Test Fixtures

**What**: Advanced fixtures can manage complex test state and provide helper methods.

**How**: Here's how to implement advanced fixtures:

```rust
// src/lib.rs
use std::collections::HashMap;

pub struct Database {
    tables: HashMap<String, Vec<Record>>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct Record {
    pub id: u32,
    pub data: String,
}

impl Database {
    pub fn new() -> Self {
        Self {
            tables: HashMap::new(),
        }
    }

    pub fn create_table(&mut self, name: &str) {
        self.tables.insert(name.to_string(), Vec::new());
    }

    pub fn insert(&mut self, table: &str, data: String) -> u32 {
        let id = self.tables.get(table).map_or(0, |records| records.len() as u32 + 1);
        let record = Record { id, data };
        self.tables.get_mut(table).unwrap().push(record);
        id
    }

    pub fn select(&self, table: &str, id: u32) -> Option<&Record> {
        self.tables.get(table)?.iter().find(|r| r.id == id)
    }
}
```

```rust
// tests/database_test.rs
use my_lib::Database;

struct DatabaseFixture {
    db: Database,
}

impl DatabaseFixture {
    fn new() -> Self {
        let mut db = Database::new();
        db.create_table("users");
        db.create_table("posts");
        Self { db }
    }

    fn with_users(&mut self, count: usize) -> &mut Self {
        for i in 1..=count {
            self.db.insert("users", format!("User {}", i));
        }
        self
    }

    fn with_posts(&mut self, count: usize) -> &mut Self {
        for i in 1..=count {
            self.db.insert("posts", format!("Post {}", i));
        }
        self
    }

    fn get_user_count(&self) -> usize {
        self.db.tables.get("users").map_or(0, |users| users.len())
    }

    fn get_post_count(&self) -> usize {
        self.db.tables.get("posts").map_or(0, |posts| posts.len())
    }
}

#[test]
fn test_database_operations() {
    let mut fixture = DatabaseFixture::new()
        .with_users(3)
        .with_posts(2);

    // Verify setup
    assert_eq!(fixture.get_user_count(), 3);
    assert_eq!(fixture.get_post_count(), 2);

    // Test insertion
    let user_id = fixture.db.insert("users", "New User".to_string());
    assert_eq!(user_id, 4);

    // Test selection
    let user = fixture.db.select("users", 1).unwrap();
    assert_eq!(user.data, "User 1");

    // Test non-existent record
    let result = fixture.db.select("users", 999);
    assert!(result.is_none());
}
```

**Explanation**:

- `DatabaseFixture` provides fluent interface for test setup
- `with_users()` and `with_posts()` methods create test data
- Helper methods like `get_user_count()` verify state
- Method chaining makes test setup readable

**Why**: Advanced fixtures make tests more maintainable and readable.

## Understanding Mocking and Stubbing

### Basic Mocking

**What**: Mocking allows you to replace external dependencies with controllable test doubles.

**How**: Here's how to implement basic mocking:

```rust
// src/lib.rs
pub trait EmailService {
    fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String>;
}

pub struct UserNotifier {
    email_service: Box<dyn EmailService>,
}

impl UserNotifier {
    pub fn new(email_service: Box<dyn EmailService>) -> Self {
        Self { email_service }
    }

    pub fn notify_user(&self, email: &str, name: &str) -> Result<(), String> {
        let subject = "Welcome!";
        let body = format!("Hello {}, welcome to our service!", name);
        self.email_service.send_email(email, subject, &body)
    }
}
```

```rust
// tests/user_notifier_test.rs
use my_lib::{EmailService, UserNotifier};

struct MockEmailService {
    sent_emails: Vec<(String, String, String)>,
}

impl MockEmailService {
    fn new() -> Self {
        Self {
            sent_emails: Vec::new(),
        }
    }

    fn get_sent_emails(&self) -> &[(String, String, String)] {
        &self.sent_emails
    }
}

impl EmailService for MockEmailService {
    fn send_email(&self, to: &str, subject: &str, body: &str) -> Result<(), String> {
        // In a real mock, you might want to use RefCell or similar
        // For simplicity, we'll just return Ok(())
        Ok(())
    }
}

#[test]
fn test_user_notification() {
    let mock_service = MockEmailService::new();
    let notifier = UserNotifier::new(Box::new(mock_service));

    let result = notifier.notify_user("user@example.com", "Alice");
    assert!(result.is_ok());
}
```

**Explanation**:

- `MockEmailService` implements the `EmailService` trait
- The mock can track calls and return controlled responses
- Tests can verify interactions without external dependencies
- Mocking isolates the code under test

**Why**: Mocking allows testing in isolation without external dependencies.

### Advanced Mocking with State

**What**: Advanced mocks can track state and provide more sophisticated behavior.

**How**: Here's how to implement stateful mocks:

```rust
// src/lib.rs
use std::sync::{Arc, Mutex};

pub trait PaymentService {
    fn process_payment(&self, amount: f64, card_number: &str) -> Result<String, String>;
    fn refund_payment(&self, transaction_id: &str) -> Result<(), String>;
}

pub struct OrderProcessor {
    payment_service: Arc<dyn PaymentService>,
}

impl OrderProcessor {
    pub fn new(payment_service: Arc<dyn PaymentService>) -> Self {
        Self { payment_service }
    }

    pub fn process_order(&self, amount: f64, card_number: &str) -> Result<String, String> {
        self.payment_service.process_payment(amount, card_number)
    }
}
```

```rust
// tests/order_processor_test.rs
use my_lib::{PaymentService, OrderProcessor};
use std::sync::{Arc, Mutex};
use std::collections::HashMap;

struct MockPaymentService {
    transactions: Arc<Mutex<HashMap<String, f64>>>,
    should_fail: bool,
}

impl MockPaymentService {
    fn new() -> Self {
        Self {
            transactions: Arc::new(Mutex::new(HashMap::new())),
            should_fail: false,
        }
    }

    fn set_should_fail(&mut self, should_fail: bool) {
        self.should_fail = should_fail;
    }

    fn get_transaction_count(&self) -> usize {
        self.transactions.lock().unwrap().len()
    }
}

impl PaymentService for MockPaymentService {
    fn process_payment(&self, amount: f64, card_number: &str) -> Result<String, String> {
        if self.should_fail {
            return Err("Payment failed".to_string());
        }

        let transaction_id = format!("txn_{}", card_number);
        self.transactions.lock().unwrap().insert(transaction_id.clone(), amount);
        Ok(transaction_id)
    }

    fn refund_payment(&self, transaction_id: &str) -> Result<(), String> {
        let mut transactions = self.transactions.lock().unwrap();
        if transactions.remove(transaction_id).is_some() {
            Ok(())
        } else {
            Err("Transaction not found".to_string())
        }
    }
}

#[test]
fn test_successful_payment() {
    let mock_service = Arc::new(MockPaymentService::new());
    let processor = OrderProcessor::new(mock_service.clone());

    let result = processor.process_order(100.0, "1234567890");
    assert!(result.is_ok());
    assert_eq!(mock_service.get_transaction_count(), 1);
}

#[test]
fn test_failed_payment() {
    let mut mock_service = MockPaymentService::new();
    mock_service.set_should_fail(true);
    let mock_service = Arc::new(mock_service);
    let processor = OrderProcessor::new(mock_service.clone());

    let result = processor.process_order(100.0, "1234567890");
    assert!(result.is_err());
    assert_eq!(mock_service.get_transaction_count(), 0);
}
```

**Explanation**:

- `MockPaymentService` tracks transaction state
- `set_should_fail()` controls mock behavior
- `get_transaction_count()` verifies mock state
- Tests can verify both success and failure scenarios

**Why**: Stateful mocks provide more realistic testing scenarios.

## Understanding Test Organization

### Test Modules

**What**: Organizing tests into modules improves maintainability and readability.

**How**: Here's how to organize tests:

```rust
// tests/common/mod.rs
pub mod fixtures;
pub mod mocks;

// tests/common/fixtures.rs
pub struct TestData {
    pub users: Vec<String>,
    pub products: Vec<String>,
}

impl TestData {
    pub fn new() -> Self {
        Self {
            users: vec!["Alice".to_string(), "Bob".to_string()],
            products: vec!["Product A".to_string(), "Product B".to_string()],
        }
    }
}

// tests/common/mocks.rs
use std::sync::{Arc, Mutex};

pub struct MockLogger {
    logs: Arc<Mutex<Vec<String>>>,
}

impl MockLogger {
    pub fn new() -> Self {
        Self {
            logs: Arc::new(Mutex::new(Vec::new())),
        }
    }

    pub fn get_logs(&self) -> Vec<String> {
        self.logs.lock().unwrap().clone()
    }
}

impl crate::Logger for MockLogger {
    fn log(&self, message: &str) {
        self.logs.lock().unwrap().push(message.to_string());
    }
}
```

```rust
// tests/integration_test.rs
mod common;

use common::fixtures::TestData;
use common::mocks::MockLogger;

#[test]
fn test_with_shared_fixtures() {
    let test_data = TestData::new();
    let mock_logger = MockLogger::new();

    // Use shared test data and mocks
    assert_eq!(test_data.users.len(), 2);
    assert_eq!(test_data.products.len(), 2);
}
```

**Explanation**:

- `common` module contains shared test utilities
- `fixtures` module provides test data
- `mocks` module provides mock implementations
- Tests can reuse common setup

**Why**: Organized tests are easier to maintain and understand.

### Test Configuration

**What**: Test configuration allows different test behavior based on environment.

**How**: Here's how to implement test configuration:

```rust
// tests/config.rs
use std::env;

pub struct TestConfig {
    pub database_url: String,
    pub api_base_url: String,
    pub test_timeout: u64,
}

impl TestConfig {
    pub fn new() -> Self {
        Self {
            database_url: env::var("TEST_DATABASE_URL")
                .unwrap_or_else(|_| "sqlite::memory:".to_string()),
            api_base_url: env::var("TEST_API_URL")
                .unwrap_or_else(|_| "http://localhost:3000".to_string()),
            test_timeout: env::var("TEST_TIMEOUT")
                .unwrap_or_else(|_| "30".to_string())
                .parse()
                .unwrap_or(30),
        }
    }

    pub fn is_integration_test(&self) -> bool {
        env::var("INTEGRATION_TESTS").is_ok()
    }
}
```

```rust
// tests/integration_test.rs
use crate::config::TestConfig;

#[test]
fn test_with_configuration() {
    let config = TestConfig::new();

    if config.is_integration_test() {
        // Run integration tests
        println!("Running integration test with database: {}", config.database_url);
    } else {
        // Skip integration tests
        println!("Skipping integration test");
    }
}
```

**Explanation**:

- `TestConfig` reads environment variables for test configuration
- Different test behavior based on configuration
- Environment variables control test execution
- Tests can be run in different modes

**Why**: Test configuration allows flexible test execution in different environments.

## Key Takeaways

**What** you've learned about advanced testing:

1. **Integration tests** - test multiple components together
2. **Test fixtures** - provide reusable setup and teardown
3. **Mocking and stubbing** - isolate components from dependencies
4. **Test organization** - structure tests for maintainability
5. **Test configuration** - control test behavior with environment
6. **Stateful mocks** - track state and provide sophisticated behavior
7. **Test utilities** - share common test code across tests

**Why** these concepts matter:

- **Integration testing** ensures components work together
- **Test fixtures** provide consistent test environment
- **Mocking** enables isolated testing
- **Organization** makes tests maintainable
- **Configuration** allows flexible test execution

## Next Steps

Now that you understand advanced testing, you're ready to learn about:

- **Property-based testing** - testing with generated data
- **Fuzzing techniques** - automated bug discovery
- **Debugging tools** - debugging techniques and tools
- **Error handling and recovery** - robust error management

**Where** to go next: Continue with the next lesson on "Property-Based Testing" to learn about testing with generated data!
