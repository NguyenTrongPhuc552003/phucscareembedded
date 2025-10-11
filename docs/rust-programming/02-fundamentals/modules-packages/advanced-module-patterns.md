---
sidebar_position: 3
---

# Advanced Module Patterns

Master complex module relationships and advanced organization techniques in Rust with comprehensive explanations using the 4W+H framework.

## What Are Advanced Module Patterns?

**What**: Advanced module patterns are sophisticated techniques for organizing code using complex module relationships, conditional compilation, and advanced organization strategies. These patterns enable you to create maintainable, scalable, and flexible codebases.

**Why**: Understanding advanced module patterns is crucial because:

- **Complex organization** helps you structure large, sophisticated applications
- **Conditional compilation** allows you to create platform-specific or feature-specific code
- **Advanced relationships** enable you to model complex domain logic
- **Scalability** supports growing codebases with changing requirements
- **Flexibility** provides options for different deployment scenarios
- **Maintainability** makes complex code easier to understand and modify
- **Performance** enables you to optimize compilation and runtime behavior

**When**: Use advanced module patterns when you need to:

- Organize complex applications with many interconnected components
- Create platform-specific or feature-specific code
- Model complex domain relationships
- Build libraries that work in different environments
- Create flexible APIs that adapt to different use cases
- Manage large codebases with multiple teams

**How**: Advanced module patterns work in Rust by:

- **Conditional compilation** using `#[cfg]` attributes
- **Complex module hierarchies** with sophisticated relationships
- **Feature flags** for optional functionality
- **Advanced use patterns** for complex imports
- **Module organization** for large codebases

**Where**: Advanced module patterns are used in complex applications, libraries, and frameworks where sophisticated organization is required.

## Understanding Conditional Compilation

### Basic Conditional Compilation

**What**: Conditional compilation allows you to include or exclude code based on compile-time conditions.

**Why**: Understanding conditional compilation is important because:

- **Platform-specific code** enables you to write code for different operating systems
- **Feature flags** allow you to enable/disable functionality
- **Performance optimization** helps you optimize for different targets
- **Code organization** allows you to manage complex codebases

**When**: Use conditional compilation when you need to create platform-specific or feature-specific code.

**How**: Here's how to use conditional compilation:

```rust
// Platform-specific modules
#[cfg(target_os = "windows")]
mod windows_specific {
    pub fn get_system_info() -> String {
        "Windows System".to_string()
    }

    pub fn get_user_home() -> String {
        std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string())
    }
}

#[cfg(target_os = "linux")]
mod linux_specific {
    pub fn get_system_info() -> String {
        "Linux System".to_string()
    }

    pub fn get_user_home() -> String {
        std::env::var("HOME").unwrap_or_else(|_| "/home".to_string())
    }
}

#[cfg(target_os = "macos")]
mod macos_specific {
    pub fn get_system_info() -> String {
        "macOS System".to_string()
    }

    pub fn get_user_home() -> String {
        std::env::var("HOME").unwrap_or_else(|_| "/Users".to_string())
    }
}

// Feature-specific modules
#[cfg(feature = "async")]
mod async_operations {
    use std::future::Future;
    use std::pin::Pin;

    pub async fn async_operation() -> String {
        "Async operation completed".to_string()
    }

    pub fn spawn_async_task<F>(task: F) -> Pin<Box<dyn Future<Output = String> + Send>>
    where
        F: Future<Output = String> + Send + 'static,
    {
        Box::pin(task)
    }
}

#[cfg(not(feature = "async"))]
mod sync_operations {
    pub fn sync_operation() -> String {
        "Sync operation completed".to_string()
    }

    pub fn blocking_task() -> String {
        "Blocking task completed".to_string()
    }
}

// Debug-specific code
#[cfg(debug_assertions)]
mod debug_utilities {
    pub fn debug_log(message: &str) {
        println!("DEBUG: {}", message);
    }

    pub fn performance_timer() -> std::time::Instant {
        std::time::Instant::now()
    }
}

#[cfg(not(debug_assertions))]
mod release_utilities {
    pub fn debug_log(_message: &str) {
        // No-op in release builds
    }

    pub fn performance_timer() -> std::time::Instant {
        std::time::Instant::now()
    }
}

fn main() {
    // Platform-specific code
    #[cfg(target_os = "windows")]
    {
        let info = windows_specific::get_system_info();
        let home = windows_specific::get_user_home();
        println!("{} - Home: {}", info, home);
    }

    #[cfg(target_os = "linux")]
    {
        let info = linux_specific::get_system_info();
        let home = linux_specific::get_user_home();
        println!("{} - Home: {}", info, home);
    }

    #[cfg(target_os = "macos")]
    {
        let info = macos_specific::get_system_info();
        let home = macos_specific::get_user_home();
        println!("{} - Home: {}", info, home);
    }

    // Feature-specific code
    #[cfg(feature = "async")]
    {
        // Async code would go here
        println!("Async features enabled");
    }

    #[cfg(not(feature = "async"))]
    {
        let result = sync_operations::sync_operation();
        println!("{}", result);
    }

    // Debug-specific code
    debug_utilities::debug_log("Application started");
    let start_time = debug_utilities::performance_timer();
    // ... some work ...
    let elapsed = start_time.elapsed();
    println!("Operation took: {:?}", elapsed);
}
```

**Explanation**:

- `#[cfg(target_os = "windows")]` includes code only on Windows
- `#[cfg(feature = "async")]` includes code only when the async feature is enabled
- `#[cfg(debug_assertions)]` includes code only in debug builds
- `#[cfg(not(...))]` includes code when the condition is false
- Conditional compilation allows you to create platform-specific and feature-specific code
- The compiler only includes the relevant code based on the conditions

**Why**: Conditional compilation enables you to create flexible, platform-specific, and feature-specific code.

### Advanced Conditional Compilation

**What**: More sophisticated conditional compilation patterns for complex scenarios.

**Why**: Understanding advanced conditional compilation is important because:

- **Complex conditions** allow you to handle multiple scenarios
- **Feature combinations** enable you to create sophisticated feature sets
- **Performance optimization** helps you optimize for different targets
- **Code organization** allows you to manage complex codebases

**When**: Use advanced conditional compilation when you need to handle complex scenarios with multiple conditions.

**How**: Here's how to use advanced conditional compilation:

```rust
// Complex feature combinations
#[cfg(all(feature = "async", feature = "http"))]
mod async_http {
    pub async fn fetch_data(url: &str) -> Result<String, String> {
        // HTTP client implementation
        Ok("Data fetched".to_string())
    }

    pub async fn post_data(url: &str, data: &str) -> Result<String, String> {
        // HTTP POST implementation
        Ok("Data posted".to_string())
    }
}

#[cfg(all(feature = "async", not(feature = "http")))]
mod async_local {
    pub async fn process_data(data: &str) -> String {
        // Local processing
        format!("Processed: {}", data)
    }
}

#[cfg(all(not(feature = "async"), feature = "http"))]
mod sync_http {
    pub fn fetch_data(url: &str) -> Result<String, String> {
        // Synchronous HTTP client
        Ok("Data fetched".to_string())
    }
}

#[cfg(all(not(feature = "async"), not(feature = "http")))]
mod sync_local {
    pub fn process_data(data: &str) -> String {
        // Synchronous local processing
        format!("Processed: {}", data)
    }
}

// Platform and feature combinations
#[cfg(all(target_os = "windows", feature = "gui"))]
mod windows_gui {
    pub fn create_window() -> String {
        "Windows GUI window created".to_string()
    }
}

#[cfg(all(target_os = "linux", feature = "gui"))]
mod linux_gui {
    pub fn create_window() -> String {
        "Linux GUI window created".to_string()
    }
}

#[cfg(all(target_os = "macos", feature = "gui"))]
mod macos_gui {
    pub fn create_window() -> String {
        "macOS GUI window created".to_string()
    }
}

// Architecture-specific code
#[cfg(target_arch = "x86_64")]
mod x86_64_specific {
    pub fn optimized_operation() -> String {
        "x86_64 optimized operation".to_string()
    }
}

#[cfg(target_arch = "aarch64")]
mod aarch64_specific {
    pub fn optimized_operation() -> String {
        "ARM64 optimized operation".to_string()
    }
}

// Custom conditions
#[cfg(feature = "experimental")]
mod experimental {
    pub fn experimental_feature() -> String {
        "Experimental feature enabled".to_string()
    }
}

#[cfg(not(feature = "experimental"))]
mod stable {
    pub fn stable_feature() -> String {
        "Stable feature enabled".to_string()
    }
}

fn main() {
    // Complex feature combinations
    #[cfg(all(feature = "async", feature = "http"))]
    {
        println!("Async HTTP features enabled");
    }

    #[cfg(all(feature = "async", not(feature = "http")))]
    {
        println!("Async local features enabled");
    }

    #[cfg(all(not(feature = "async"), feature = "http"))]
    {
        println!("Sync HTTP features enabled");
    }

    #[cfg(all(not(feature = "async"), not(feature = "http"))]
    {
        println!("Sync local features enabled");
    }

    // Platform and feature combinations
    #[cfg(all(target_os = "windows", feature = "gui"))]
    {
        let window = windows_gui::create_window();
        println!("{}", window);
    }

    // Architecture-specific code
    #[cfg(target_arch = "x86_64")]
    {
        let result = x86_64_specific::optimized_operation();
        println!("{}", result);
    }

    #[cfg(target_arch = "aarch64")]
    {
        let result = aarch64_specific::optimized_operation();
        println!("{}", result);
    }

    // Custom conditions
    #[cfg(feature = "experimental")]
    {
        let result = experimental::experimental_feature();
        println!("{}", result);
    }

    #[cfg(not(feature = "experimental"))]
    {
        let result = stable::stable_feature();
        println!("{}", result);
    }
}
```

**Explanation**:

- `#[cfg(all(...))]` includes code when all conditions are true
- `#[cfg(any(...))]` includes code when any condition is true
- `#[cfg(not(...))]` includes code when the condition is false
- Complex conditions allow you to handle multiple scenarios
- Feature combinations enable sophisticated functionality
- Platform and architecture-specific code optimizes performance

**Why**: Advanced conditional compilation provides powerful tools for creating flexible, optimized code.

## Understanding Complex Module Hierarchies

### Nested Module Organization

**What**: How to create sophisticated module hierarchies for complex applications.

**Why**: Understanding nested module organization is important because:

- **Complex applications** require sophisticated organization
- **Domain modeling** helps you represent real-world relationships
- **Code organization** makes large codebases manageable
- **Team collaboration** allows multiple developers to work on different areas

**When**: Use nested module organization when you need to structure complex applications with many interconnected components.

**How**: Here's how to create complex module hierarchies:

```rust
// Complex application structure
mod application {
    // Core application modules
    pub mod core {
        pub mod config {
            pub struct AppConfig {
                pub database_url: String,
                pub api_key: String,
                pub debug_mode: bool,
            }

            impl AppConfig {
                pub fn new() -> Self {
                    Self {
                        database_url: "sqlite://app.db".to_string(),
                        api_key: "default_key".to_string(),
                        debug_mode: true,
                    }
                }
            }
        }

        pub mod errors {
            use std::fmt;

            #[derive(Debug)]
            pub enum AppError {
                DatabaseError(String),
                NetworkError(String),
                ValidationError(String),
                InternalError(String),
            }

            impl fmt::Display for AppError {
                fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
                    match self {
                        AppError::DatabaseError(msg) => write!(f, "Database error: {}", msg),
                        AppError::NetworkError(msg) => write!(f, "Network error: {}", msg),
                        AppError::ValidationError(msg) => write!(f, "Validation error: {}", msg),
                        AppError::InternalError(msg) => write!(f, "Internal error: {}", msg),
                    }
                }
            }

            impl std::error::Error for AppError {}
        }

        pub mod logging {
            pub struct Logger {
                level: LogLevel,
            }

            #[derive(Debug, Clone)]
            pub enum LogLevel {
                Debug,
                Info,
                Warning,
                Error,
            }

            impl Logger {
                pub fn new(level: LogLevel) -> Self {
                    Self { level }
                }

                pub fn log(&self, level: LogLevel, message: &str) {
                    if self.should_log(&level) {
                        println!("[{:?}] {}", level, message);
                    }
                }

                fn should_log(&self, level: &LogLevel) -> bool {
                    match (&self.level, level) {
                        (LogLevel::Debug, _) => true,
                        (LogLevel::Info, LogLevel::Info | LogLevel::Warning | LogLevel::Error) => true,
                        (LogLevel::Warning, LogLevel::Warning | LogLevel::Error) => true,
                        (LogLevel::Error, LogLevel::Error) => true,
                        _ => false,
                    }
                }
            }
        }
    }

    // Business logic modules
    pub mod business {
        pub mod user_management {
            use crate::application::core::errors::AppError;

            pub struct User {
                pub id: u32,
                pub name: String,
                pub email: String,
                pub role: UserRole,
            }

            #[derive(Debug, Clone)]
            pub enum UserRole {
                Admin,
                User,
                Guest,
            }

            impl User {
                pub fn new(name: String, email: String, role: UserRole) -> Self {
                    Self {
                        id: 0, // Will be set by the service
                        name,
                        email,
                        role,
                    }
                }

                pub fn is_admin(&self) -> bool {
                    matches!(self.role, UserRole::Admin)
                }
            }

            pub struct UserService {
                users: std::collections::HashMap<u32, User>,
                next_id: u32,
            }

            impl UserService {
                pub fn new() -> Self {
                    Self {
                        users: std::collections::HashMap::new(),
                        next_id: 1,
                    }
                }

                pub fn add_user(&mut self, mut user: User) -> Result<u32, AppError> {
                    if user.email.is_empty() {
                        return Err(AppError::ValidationError("Email cannot be empty".to_string()));
                    }

                    user.id = self.next_id;
                    self.users.insert(user.id, user);
                    self.next_id += 1;
                    Ok(user.id)
                }

                pub fn get_user(&self, id: u32) -> Option<&User> {
                    self.users.get(&id)
                }

                pub fn list_users(&self) -> Vec<&User> {
                    self.users.values().collect()
                }
            }
        }

        pub mod data_processing {
            use crate::application::core::errors::AppError;

            pub struct DataProcessor {
                pub name: String,
            }

            impl DataProcessor {
                pub fn new(name: String) -> Self {
                    Self { name }
                }

                pub fn process_data(&self, data: &str) -> Result<String, AppError> {
                    if data.is_empty() {
                        return Err(AppError::ValidationError("Data cannot be empty".to_string()));
                    }

                    Ok(format!("Processed by {}: {}", self.name, data))
                }

                pub fn validate_data(&self, data: &str) -> bool {
                    !data.is_empty() && data.len() > 3
                }
            }
        }
    }

    // API modules
    pub mod api {
        pub mod v1 {
            use crate::application::business::user_management::{User, UserService};
            use crate::application::core::errors::AppError;

            pub struct UserController {
                user_service: UserService,
            }

            impl UserController {
                pub fn new() -> Self {
                    Self {
                        user_service: UserService::new(),
                    }
                }

                pub fn create_user(&mut self, name: String, email: String) -> Result<u32, AppError> {
                    let user = User::new(name, email, crate::application::business::user_management::UserRole::User);
                    self.user_service.add_user(user)
                }

                pub fn get_user(&self, id: u32) -> Option<&User> {
                    self.user_service.get_user(id)
                }

                pub fn list_users(&self) -> Vec<&User> {
                    self.user_service.list_users()
                }
            }
        }

        pub mod v2 {
            use crate::application::business::user_management::{User, UserService};
            use crate::application::core::errors::AppError;

            pub struct UserController {
                user_service: UserService,
            }

            impl UserController {
                pub fn new() -> Self {
                    Self {
                        user_service: UserService::new(),
                    }
                }

                pub fn create_user(&mut self, name: String, email: String) -> Result<u32, AppError> {
                    let user = User::new(name, email, crate::application::business::user_management::UserRole::User);
                    self.user_service.add_user(user)
                }

                pub fn get_user(&self, id: u32) -> Option<&User> {
                    self.user_service.get_user(id)
                }

                pub fn list_users(&self) -> Vec<&User> {
                    self.user_service.list_users()
                }
            }
        }
    }

    // Utility modules
    pub mod utils {
        pub mod validation {
            pub fn validate_email(email: &str) -> bool {
                email.contains('@') && email.contains('.')
            }

            pub fn validate_name(name: &str) -> bool {
                !name.is_empty() && name.len() > 2
            }
        }

        pub mod formatting {
            pub fn format_user_info(name: &str, email: &str) -> String {
                format!("{} <{}>", name, email)
            }

            pub fn format_error_message(error: &str) -> String {
                format!("Error: {}", error)
            }
        }
    }
}

fn main() {
    // Use the complex module hierarchy
    let config = application::core::config::AppConfig::new();
    let logger = application::core::logging::Logger::new(application::core::logging::LogLevel::Info);

    let mut user_controller = application::api::v1::UserController::new();

    // Create users
    match user_controller.create_user("Alice".to_string(), "alice@example.com".to_string()) {
        Ok(id) => {
            logger.log(application::core::logging::LogLevel::Info, &format!("User created with ID: {}", id));
        }
        Err(e) => {
            logger.log(application::core::logging::LogLevel::Error, &format!("Failed to create user: {}", e));
        }
    }

    // List users
    let users = user_controller.list_users();
    for user in users {
        let formatted = application::utils::formatting::format_user_info(&user.name, &user.email);
        println!("User: {}", formatted);
    }
}
```

**Explanation**:

- `application::core` contains core application functionality
- `application::business` contains business logic modules
- `application::api` contains API modules with versioning
- `application::utils` contains utility functions
- Each module has a specific responsibility and clear interface
- The hierarchy reflects the application's domain structure
- Modules can depend on each other through clear interfaces

**Why**: Complex module hierarchies help you organize large applications and model complex domain relationships.

### Module Dependencies and Relationships

**What**: How to manage complex dependencies and relationships between modules.

**Why**: Understanding module dependencies is important because:

- **Dependency management** helps you avoid circular dependencies
- **Code organization** makes relationships clear and maintainable
- **Testing** enables you to test modules in isolation
- **Refactoring** makes it easier to modify code without breaking dependencies

**When**: Use complex module relationships when you need to model sophisticated domain logic.

**How**: Here's how to manage complex module relationships:

```rust
// Domain-driven module organization
mod domain {
    // Core domain entities
    pub mod entities {
        pub mod user {
            #[derive(Debug, Clone)]
            pub struct User {
                pub id: UserId,
                pub name: String,
                pub email: String,
                pub profile: UserProfile,
            }

            #[derive(Debug, Clone)]
            pub struct UserId(pub u32);

            #[derive(Debug, Clone)]
            pub struct UserProfile {
                pub bio: String,
                pub avatar_url: Option<String>,
                pub preferences: UserPreferences,
            }

            #[derive(Debug, Clone)]
            pub struct UserPreferences {
                pub theme: String,
                pub notifications: bool,
            }

            impl User {
                pub fn new(id: UserId, name: String, email: String) -> Self {
                    Self {
                        id,
                        name,
                        email,
                        profile: UserProfile {
                            bio: String::new(),
                            avatar_url: None,
                            preferences: UserPreferences {
                                theme: "default".to_string(),
                                notifications: true,
                            },
                        },
                    }
                }
            }
        }

        pub mod product {
            #[derive(Debug, Clone)]
            pub struct Product {
                pub id: ProductId,
                pub name: String,
                pub price: f64,
                pub category: ProductCategory,
            }

            #[derive(Debug, Clone)]
            pub struct ProductId(pub u32);

            #[derive(Debug, Clone)]
            pub enum ProductCategory {
                Electronics,
                Clothing,
                Books,
                Other,
            }

            impl Product {
                pub fn new(id: ProductId, name: String, price: f64, category: ProductCategory) -> Self {
                    Self {
                        id,
                        name,
                        price,
                        category,
                    }
                }
            }
        }
    }

    // Domain services
    pub mod services {
        use crate::domain::entities::{user, product};
        use crate::domain::repositories::{UserRepository, ProductRepository};
        use crate::domain::events::DomainEvent;

        pub struct UserService {
            user_repository: Box<dyn UserRepository>,
            event_publisher: Box<dyn EventPublisher>,
        }

        impl UserService {
            pub fn new(user_repository: Box<dyn UserRepository>, event_publisher: Box<dyn EventPublisher>) -> Self {
                Self {
                    user_repository,
                    event_publisher,
                }
            }

            pub fn create_user(&mut self, name: String, email: String) -> Result<user::UserId, String> {
                let user_id = user::UserId(1); // Generate ID
                let user = user::User::new(user_id.clone(), name, email);

                self.user_repository.save(&user)?;
                self.event_publisher.publish(DomainEvent::UserCreated(user_id.clone()));

                Ok(user_id)
            }

            pub fn get_user(&self, id: &user::UserId) -> Option<user::User> {
                self.user_repository.find_by_id(id)
            }
        }

        pub struct ProductService {
            product_repository: Box<dyn ProductRepository>,
            event_publisher: Box<dyn EventPublisher>,
        }

        impl ProductService {
            pub fn new(product_repository: Box<dyn ProductRepository>, event_publisher: Box<dyn EventPublisher>) -> Self {
                Self {
                    product_repository,
                    event_publisher,
                }
            }

            pub fn create_product(&mut self, name: String, price: f64, category: product::ProductCategory) -> Result<product::ProductId, String> {
                let product_id = product::ProductId(1); // Generate ID
                let product = product::Product::new(product_id.clone(), name, price, category);

                self.product_repository.save(&product)?;
                self.event_publisher.publish(DomainEvent::ProductCreated(product_id.clone()));

                Ok(product_id)
            }

            pub fn get_product(&self, id: &product::ProductId) -> Option<product::Product> {
                self.product_repository.find_by_id(id)
            }
        }
    }

    // Domain repositories (interfaces)
    pub mod repositories {
        use crate::domain::entities::{user, product};

        pub trait UserRepository {
            fn save(&mut self, user: &user::User) -> Result<(), String>;
            fn find_by_id(&self, id: &user::UserId) -> Option<user::User>;
            fn find_by_email(&self, email: &str) -> Option<user::User>;
        }

        pub trait ProductRepository {
            fn save(&mut self, product: &product::Product) -> Result<(), String>;
            fn find_by_id(&self, id: &product::ProductId) -> Option<product::Product>;
            fn find_by_category(&self, category: &product::ProductCategory) -> Vec<product::Product>;
        }
    }

    // Domain events
    pub mod events {
        use crate::domain::entities::{user, product};

        #[derive(Debug, Clone)]
        pub enum DomainEvent {
            UserCreated(user::UserId),
            UserUpdated(user::UserId),
            ProductCreated(product::ProductId),
            ProductUpdated(product::ProductId),
        }

        pub trait EventPublisher {
            fn publish(&mut self, event: DomainEvent);
        }
    }
}

// Infrastructure layer
mod infrastructure {
    use crate::domain::repositories::{UserRepository, ProductRepository};
    use crate::domain::events::{EventPublisher, DomainEvent};
    use crate::domain::entities::{user, product};
    use std::collections::HashMap;

    // In-memory implementations
    pub struct InMemoryUserRepository {
        users: HashMap<user::UserId, user::User>,
    }

    impl InMemoryUserRepository {
        pub fn new() -> Self {
            Self {
                users: HashMap::new(),
            }
        }
    }

    impl UserRepository for InMemoryUserRepository {
        fn save(&mut self, user: &user::User) -> Result<(), String> {
            self.users.insert(user.id.clone(), user.clone());
            Ok(())
        }

        fn find_by_id(&self, id: &user::UserId) -> Option<user::User> {
            self.users.get(id).cloned()
        }

        fn find_by_email(&self, email: &str) -> Option<user::User> {
            self.users.values().find(|u| u.email == email).cloned()
        }
    }

    pub struct InMemoryProductRepository {
        products: HashMap<product::ProductId, product::Product>,
    }

    impl InMemoryProductRepository {
        pub fn new() -> Self {
            Self {
                products: HashMap::new(),
            }
        }
    }

    impl ProductRepository for InMemoryProductRepository {
        fn save(&mut self, product: &product::Product) -> Result<(), String> {
            self.products.insert(product.id.clone(), product.clone());
            Ok(())
        }

        fn find_by_id(&self, id: &product::ProductId) -> Option<product::Product> {
            self.products.get(id).cloned()
        }

        fn find_by_category(&self, category: &product::ProductCategory) -> Vec<product::Product> {
            self.products.values()
                .filter(|p| std::mem::discriminant(&p.category) == std::mem::discriminant(category))
                .cloned()
                .collect()
        }
    }

    pub struct ConsoleEventPublisher;

    impl EventPublisher for ConsoleEventPublisher {
        fn publish(&mut self, event: DomainEvent) {
            println!("Event published: {:?}", event);
        }
    }
}

fn main() {
    // Create infrastructure components
    let user_repository = Box::new(infrastructure::InMemoryUserRepository::new());
    let product_repository = Box::new(infrastructure::InMemoryProductRepository::new());
    let event_publisher = Box::new(infrastructure::ConsoleEventPublisher);

    // Create domain services
    let mut user_service = domain::services::UserService::new(user_repository, event_publisher);
    let mut product_service = domain::services::ProductService::new(product_repository, Box::new(infrastructure::ConsoleEventPublisher));

    // Use the services
    match user_service.create_user("Alice".to_string(), "alice@example.com".to_string()) {
        Ok(user_id) => {
            println!("User created with ID: {:?}", user_id);

            if let Some(user) = user_service.get_user(&user_id) {
                println!("Retrieved user: {:?}", user);
            }
        }
        Err(e) => {
            println!("Failed to create user: {}", e);
        }
    }

    match product_service.create_product("Rust Book".to_string(), 29.99, domain::entities::product::ProductCategory::Books) {
        Ok(product_id) => {
            println!("Product created with ID: {:?}", product_id);

            if let Some(product) = product_service.get_product(&product_id) {
                println!("Retrieved product: {:?}", product);
            }
        }
        Err(e) => {
            println!("Failed to create product: {}", e);
        }
    }
}
```

**Explanation**:

- `domain::entities` contains domain entities and value objects
- `domain::services` contains domain services that orchestrate business logic
- `domain::repositories` defines interfaces for data access
- `domain::events` defines domain events for event-driven architecture
- `infrastructure` contains concrete implementations of interfaces
- The dependency flow goes from infrastructure to domain (dependency inversion)
- Each layer has clear responsibilities and interfaces

**Why**: Complex module relationships enable you to create maintainable, testable, and flexible applications.

## Understanding Advanced Use Patterns

### Complex Import Strategies

**What**: Advanced patterns for importing and organizing modules in complex applications.

**Why**: Understanding complex import strategies is important because:

- **Code organization** helps you manage large codebases
- **Dependency management** prevents circular dependencies
- **API design** enables you to create clean public interfaces
- **Maintainability** makes code easier to understand and modify

**When**: Use complex import strategies when you need to organize large applications with many modules.

**How**: Here's how to use complex import strategies:

```rust
// Complex import organization
mod application {
    // Re-export commonly used items
    pub use crate::domain::entities::user::User;
    pub use crate::domain::entities::product::Product;
    pub use crate::domain::services::{UserService, ProductService};
    pub use crate::domain::events::DomainEvent;

    // Module organization
    pub mod domain {
        pub mod entities {
            pub mod user {
                #[derive(Debug, Clone)]
                pub struct User {
                    pub id: u32,
                    pub name: String,
                    pub email: String,
                }

                impl User {
                    pub fn new(id: u32, name: String, email: String) -> Self {
                        Self { id, name, email }
                    }
                }
            }

            pub mod product {
                #[derive(Debug, Clone)]
                pub struct Product {
                    pub id: u32,
                    pub name: String,
                    pub price: f64,
                }

                impl Product {
                    pub fn new(id: u32, name: String, price: f64) -> Self {
                        Self { id, name, price }
                    }
                }
            }
        }

        pub mod services {
            use crate::application::domain::entities::{user, product};

            pub struct UserService {
                users: std::collections::HashMap<u32, user::User>,
                next_id: u32,
            }

            impl UserService {
                pub fn new() -> Self {
                    Self {
                        users: std::collections::HashMap::new(),
                        next_id: 1,
                    }
                }

                pub fn create_user(&mut self, name: String, email: String) -> u32 {
                    let id = self.next_id;
                    let user = user::User::new(id, name, email);
                    self.users.insert(id, user);
                    self.next_id += 1;
                    id
                }

                pub fn get_user(&self, id: u32) -> Option<&user::User> {
                    self.users.get(&id)
                }
            }

            pub struct ProductService {
                products: std::collections::HashMap<u32, product::Product>,
                next_id: u32,
            }

            impl ProductService {
                pub fn new() -> Self {
                    Self {
                        products: std::collections::HashMap::new(),
                        next_id: 1,
                    }
                }

                pub fn create_product(&mut self, name: String, price: f64) -> u32 {
                    let id = self.next_id;
                    let product = product::Product::new(id, name, price);
                    self.products.insert(id, product);
                    self.next_id += 1;
                    id
                }

                pub fn get_product(&self, id: u32) -> Option<&product::Product> {
                    self.products.get(&id)
                }
            }
        }

        pub mod events {
            #[derive(Debug, Clone)]
            pub enum DomainEvent {
                UserCreated(u32),
                ProductCreated(u32),
            }
        }
    }

    // API layer
    pub mod api {
        use crate::application::domain::services::{UserService, ProductService};
        use crate::application::domain::events::DomainEvent;

        pub struct ApiController {
            user_service: UserService,
            product_service: ProductService,
        }

        impl ApiController {
            pub fn new() -> Self {
                Self {
                    user_service: UserService::new(),
                    product_service: ProductService::new(),
                }
            }

            pub fn create_user(&mut self, name: String, email: String) -> u32 {
                let id = self.user_service.create_user(name, email);
                println!("User created with ID: {}", id);
                id
            }

            pub fn create_product(&mut self, name: String, price: f64) -> u32 {
                let id = self.product_service.create_product(name, price);
                println!("Product created with ID: {}", id);
                id
            }

            pub fn get_user(&self, id: u32) -> Option<&crate::application::domain::entities::user::User> {
                self.user_service.get_user(id)
            }

            pub fn get_product(&self, id: u32) -> Option<&crate::application::domain::entities::product::Product> {
                self.product_service.get_product(id)
            }
        }
    }
}

// Main application
fn main() {
    // Use the complex module structure
    let mut api = application::api::ApiController::new();

    // Create users and products
    let user_id = api.create_user("Alice".to_string(), "alice@example.com".to_string());
    let product_id = api.create_product("Rust Book".to_string(), 29.99);

    // Retrieve and display
    if let Some(user) = api.get_user(user_id) {
        println!("User: {:?}", user);
    }

    if let Some(product) = api.get_product(product_id) {
        println!("Product: {:?}", product);
    }
}
```

**Explanation**:

- `pub use` re-exports commonly used items for easier access
- Complex module hierarchies organize code by domain and responsibility
- Clear separation between domain logic and API layer
- Each module has a specific responsibility and clear interface
- The structure reflects the application's architecture

**Why**: Complex import strategies help you organize large applications and create clean, maintainable code.

## Key Takeaways

**What** you've learned about advanced module patterns:

1. **Conditional Compilation** - Using `#[cfg]` for platform and feature-specific code
2. **Complex Module Hierarchies** - Organizing large applications with sophisticated structures
3. **Module Dependencies** - Managing complex relationships between modules
4. **Advanced Import Strategies** - Using complex import patterns for large codebases
5. **Feature-Based Organization** - Organizing code by features and capabilities
6. **Domain-Driven Design** - Modeling complex domain relationships
7. **Infrastructure Patterns** - Separating concerns with clear interfaces

**Why** these concepts matter:

- **Complex organization** enables sophisticated applications
- **Conditional compilation** provides flexibility and optimization
- **Advanced patterns** support large-scale development
- **Best practices** improve code quality and maintainability

## Next Steps

Now that you understand advanced module patterns, you're ready to learn about:

- **Library Development** - Creating reusable code
- **Project Management** - Organizing large applications
- **Testing and Documentation** - Ensuring code quality
- **Performance Optimization** - Optimizing compilation and runtime

**Where** to go next: Continue with the next lesson on "Library Development" to learn about creating reusable code!
