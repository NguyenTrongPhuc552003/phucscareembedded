---
sidebar_position: 5
---

# Practical Exercises

Master collections and strings through hands-on practice with comprehensive explanations using the 4W+H framework.

## What Are Practical Exercises?

**What**: Practical exercises are hands-on coding challenges that reinforce your understanding of collections and strings in Rust. These exercises combine vectors, hash maps, hash sets, and string handling to solve real-world problems.

**Why**: Understanding practical exercises is crucial because:

- **Reinforcement** solidifies your understanding of concepts
- **Real-world application** connects theory to practice
- **Problem-solving skills** develops your ability to solve complex problems
- **Code quality** improves through hands-on practice
- **Confidence building** prepares you for real projects
- **Pattern recognition** helps you identify common solutions
- **Best practices** reinforces idiomatic Rust programming

**When**: Use practical exercises when you need to:

- Reinforce your understanding of collections and strings
- Practice solving real-world problems
- Build confidence in Rust programming
- Prepare for more advanced topics
- Develop problem-solving skills
- Apply multiple concepts together

**How**: Practical exercises work by:

- **Combining concepts** from multiple lessons
- **Real-world scenarios** that you might encounter
- **Progressive difficulty** from simple to complex
- **Comprehensive solutions** with detailed explanations
- **Best practices** and idiomatic Rust patterns

**Where**: Practical exercises are used throughout Rust learning to reinforce concepts and build practical skills.

## Exercise 1: Student Grade Management System

### Problem Description

**What**: Create a system to manage student grades using collections and strings.

**Why**: This exercise combines vectors, hash maps, and string handling to solve a common real-world problem.

**When**: Use this exercise to practice working with multiple collection types and string processing.

**How**: Here's how to implement the student grade management system:

```rust
use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Student {
    name: String,
    id: u32,
    grades: Vec<f64>,
}

impl Student {
    fn new(name: String, id: u32) -> Self {
        Self {
            name,
            id,
            grades: Vec::new(),
        }
    }

    fn add_grade(&mut self, grade: f64) {
        if grade >= 0.0 && grade <= 100.0 {
            self.grades.push(grade);
        } else {
            println!("Invalid grade: {}. Grade must be between 0 and 100.", grade);
        }
    }

    fn average_grade(&self) -> Option<f64> {
        if self.grades.is_empty() {
            None
        } else {
            Some(self.grades.iter().sum::<f64>() / self.grades.len() as f64)
        }
    }

    fn letter_grade(&self) -> Option<char> {
        if let Some(avg) = self.average_grade() {
            match avg {
                90.0..=100.0 => Some('A'),
                80.0..=89.9 => Some('B'),
                70.0..=79.9 => Some('C'),
                60.0..=69.9 => Some('D'),
                0.0..=59.9 => Some('F'),
                _ => None,
            }
        } else {
            None
        }
    }
}

struct GradeManager {
    students: HashMap<u32, Student>,
    course_name: String,
}

impl GradeManager {
    fn new(course_name: String) -> Self {
        Self {
            students: HashMap::new(),
            course_name,
        }
    }

    fn add_student(&mut self, student: Student) {
        self.students.insert(student.id, student);
    }

    fn add_grade(&mut self, student_id: u32, grade: f64) {
        if let Some(student) = self.students.get_mut(&student_id) {
            student.add_grade(grade);
        } else {
            println!("Student with ID {} not found.", student_id);
        }
    }

    fn get_student(&self, student_id: u32) -> Option<&Student> {
        self.students.get(&student_id)
    }

    fn class_average(&self) -> Option<f64> {
        let valid_averages: Vec<f64> = self.students
            .values()
            .filter_map(|student| student.average_grade())
            .collect();

        if valid_averages.is_empty() {
            None
        } else {
            Some(valid_averages.iter().sum::<f64>() / valid_averages.len() as f64)
        }
    }

    fn grade_distribution(&self) -> HashMap<char, usize> {
        let mut distribution = HashMap::new();

        for student in self.students.values() {
            if let Some(letter) = student.letter_grade() {
                *distribution.entry(letter).or_insert(0) += 1;
            }
        }

        distribution
    }

    fn top_students(&self, count: usize) -> Vec<(String, f64)> {
        let mut student_averages: Vec<(String, f64)> = self.students
            .values()
            .filter_map(|student| {
                student.average_grade().map(|avg| (student.name.clone(), avg))
            })
            .collect();

        student_averages.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap());
        student_averages.truncate(count);
        student_averages
    }

    fn generate_report(&self) -> String {
        let mut report = format!("Grade Report for {}\n", self.course_name);
        report.push_str(&"=".repeat(50));
        report.push('\n');

        // Class statistics
        if let Some(class_avg) = self.class_average() {
            report.push_str(&format!("Class Average: {:.2}\n", class_avg));
        }

        // Grade distribution
        let distribution = self.grade_distribution();
        report.push_str("\nGrade Distribution:\n");
        for (grade, count) in &distribution {
            report.push_str(&format!("  {}: {} students\n", grade, count));
        }

        // Top students
        let top_students = self.top_students(3);
        if !top_students.is_empty() {
            report.push_str("\nTop Students:\n");
            for (i, (name, avg)) in top_students.iter().enumerate() {
                report.push_str(&format!("  {}. {}: {:.2}\n", i + 1, name, avg));
            }
        }

        // Individual student details
        report.push_str("\nStudent Details:\n");
        for student in self.students.values() {
            report.push_str(&format!("  {} (ID: {})\n", student.name, student.id));
            if let Some(avg) = student.average_grade() {
                report.push_str(&format!("    Average: {:.2}\n", avg));
            }
            if let Some(letter) = student.letter_grade() {
                report.push_str(&format!("    Letter Grade: {}\n", letter));
            }
            report.push_str(&format!("    Grades: {:?}\n", student.grades));
        }

        report
    }
}

fn main() {
    let mut manager = GradeManager::new("Rust Programming".to_string());

    // Add students
    let student1 = Student::new("Alice Johnson".to_string(), 1001);
    let student2 = Student::new("Bob Smith".to_string(), 1002);
    let student3 = Student::new("Charlie Brown".to_string(), 1003);

    manager.add_student(student1);
    manager.add_student(student2);
    manager.add_student(student3);

    // Add grades
    manager.add_grade(1001, 95.0);
    manager.add_grade(1001, 87.0);
    manager.add_grade(1001, 92.0);

    manager.add_grade(1002, 78.0);
    manager.add_grade(1002, 85.0);
    manager.add_grade(1002, 88.0);

    manager.add_grade(1003, 92.0);
    manager.add_grade(1003, 94.0);
    manager.add_grade(1003, 89.0);

    // Generate and display report
    let report = manager.generate_report();
    println!("{}", report);
}
```

**Explanation**:

- `Student` struct stores student information and grades
- `GradeManager` manages multiple students using a HashMap
- `add_grade()` validates grades before adding them
- `average_grade()` calculates student averages
- `letter_grade()` converts numeric grades to letter grades
- `class_average()` calculates the overall class average
- `grade_distribution()` shows how many students got each letter grade
- `top_students()` identifies the highest-performing students
- `generate_report()` creates a comprehensive text report

**Why**: This exercise demonstrates how to combine multiple collection types and string processing to solve a real-world problem.

## Exercise 2: Text Analysis Tool

### Problem Description

**What**: Create a comprehensive text analysis tool that processes text files and provides detailed statistics.

**Why**: This exercise combines string handling, collections, and file processing to create a useful tool.

**When**: Use this exercise to practice text processing and data analysis.

**How**: Here's how to implement the text analysis tool:

```rust
use std::collections::{HashMap, HashSet};
use std::fs;

#[derive(Debug)]
struct TextStats {
    word_count: usize,
    character_count: usize,
    byte_count: usize,
    line_count: usize,
    sentence_count: usize,
    paragraph_count: usize,
    unique_words: usize,
    average_word_length: f64,
    longest_word: String,
    shortest_word: String,
    word_frequencies: HashMap<String, usize>,
    character_frequencies: HashMap<char, usize>,
    most_common_words: Vec<(String, usize)>,
    least_common_words: Vec<(String, usize)>,
}

impl TextStats {
    fn new() -> Self {
        Self {
            word_count: 0,
            character_count: 0,
            byte_count: 0,
            line_count: 0,
            sentence_count: 0,
            paragraph_count: 0,
            unique_words: 0,
            average_word_length: 0.0,
            longest_word: String::new(),
            shortest_word: String::new(),
            word_frequencies: HashMap::new(),
            character_frequencies: HashMap::new(),
            most_common_words: Vec::new(),
            least_common_words: Vec::new(),
        }
    }

    fn analyze_text(&mut self, text: &str) {
        // Basic counts
        self.character_count = text.chars().count();
        self.byte_count = text.len();
        self.line_count = text.lines().count();

        // Sentence count (simplified)
        self.sentence_count = text.matches('.').count() +
                             text.matches('!').count() +
                             text.matches('?').count();

        // Paragraph count
        self.paragraph_count = text.split("\n\n").count();

        // Word analysis
        let words: Vec<&str> = text.split_whitespace().collect();
        self.word_count = words.len();

        // Word frequencies
        for word in &words {
            let clean_word = word.to_lowercase()
                .chars()
                .filter(|c| c.is_alphabetic())
                .collect::<String>();

            if !clean_word.is_empty() {
                *self.word_frequencies.entry(clean_word).or_insert(0) += 1;
            }
        }

        self.unique_words = self.word_frequencies.len();

        // Character frequencies
        for ch in text.chars() {
            if ch.is_alphabetic() {
                *self.character_frequencies.entry(ch.to_lowercase().next().unwrap()).or_insert(0) += 1;
            }
        }

        // Word length analysis
        let valid_words: Vec<&str> = words.iter()
            .filter(|w| w.chars().any(|c| c.is_alphabetic()))
            .cloned()
            .collect();

        if !valid_words.is_empty() {
            let total_length: usize = valid_words.iter().map(|w| w.len()).sum();
            self.average_word_length = total_length as f64 / valid_words.len() as f64;

            // Find longest and shortest words
            self.longest_word = valid_words.iter()
                .max_by_key(|w| w.len())
                .unwrap_or(&"")
                .to_string();

            self.shortest_word = valid_words.iter()
                .min_by_key(|w| w.len())
                .unwrap_or(&"")
                .to_string();
        }

        // Most and least common words
        let mut word_freq_vec: Vec<(String, usize)> = self.word_frequencies
            .iter()
            .map(|(word, count)| (word.clone(), *count))
            .collect();

        word_freq_vec.sort_by(|a, b| b.1.cmp(&a.1));
        self.most_common_words = word_freq_vec.iter().take(10).cloned().collect();

        word_freq_vec.sort_by(|a, b| a.1.cmp(&b.1));
        self.least_common_words = word_freq_vec.iter().take(10).cloned().collect();
    }

    fn generate_report(&self) -> String {
        let mut report = String::new();

        report.push_str("=== TEXT ANALYSIS REPORT ===\n\n");

        // Basic statistics
        report.push_str("BASIC STATISTICS:\n");
        report.push_str(&format!("  Characters: {}\n", self.character_count));
        report.push_str(&format!("  Bytes: {}\n", self.byte_count));
        report.push_str(&format!("  Words: {}\n", self.word_count));
        report.push_str(&format!("  Lines: {}\n", self.line_count));
        report.push_str(&format!("  Sentences: {}\n", self.sentence_count));
        report.push_str(&format!("  Paragraphs: {}\n", self.paragraph_count));
        report.push_str(&format!("  Unique words: {}\n", self.unique_words));

        // Word analysis
        report.push_str("\nWORD ANALYSIS:\n");
        report.push_str(&format!("  Average word length: {:.2}\n", self.average_word_length));
        report.push_str(&format!("  Longest word: '{}'\n", self.longest_word));
        report.push_str(&format!("  Shortest word: '{}'\n", self.shortest_word));

        // Most common words
        report.push_str("\nMOST COMMON WORDS:\n");
        for (i, (word, count)) in self.most_common_words.iter().enumerate() {
            report.push_str(&format!("  {}. {} ({} times)\n", i + 1, word, count));
        }

        // Least common words
        report.push_str("\nLEAST COMMON WORDS:\n");
        for (i, (word, count)) in self.least_common_words.iter().enumerate() {
            report.push_str(&format!("  {}. {} ({} times)\n", i + 1, word, count));
        }

        // Character frequency
        report.push_str("\nCHARACTER FREQUENCY (Top 10):\n");
        let mut char_freq_vec: Vec<(char, usize)> = self.character_frequencies
            .iter()
            .map(|(ch, count)| (*ch, *count))
            .collect();
        char_freq_vec.sort_by(|a, b| b.1.cmp(&a.1));

        for (i, (ch, count)) in char_freq_vec.iter().take(10).enumerate() {
            report.push_str(&format!("  {}. '{}' ({} times)\n", i + 1, ch, count));
        }

        report
    }
}

fn main() {
    // Sample text for analysis
    let sample_text = "The quick brown fox jumps over the lazy dog. The dog was not amused.
    The fox continued to jump over the dog. This is a test of the text analysis system.
    The system should count words, characters, and provide statistics about the text.
    It should also identify the most common words and characters in the text.";

    let mut analyzer = TextStats::new();
    analyzer.analyze_text(sample_text);

    let report = analyzer.generate_report();
    println!("{}", report);

    // Additional analysis
    println!("\n=== ADDITIONAL ANALYSIS ===");

    // Word length distribution
    let mut length_distribution: HashMap<usize, usize> = HashMap::new();
    for word in sample_text.split_whitespace() {
        let clean_word = word.chars().filter(|c| c.is_alphabetic()).collect::<String>();
        if !clean_word.is_empty() {
            *length_distribution.entry(clean_word.len()).or_insert(0) += 1;
        }
    }

    println!("Word length distribution:");
    let mut lengths: Vec<usize> = length_distribution.keys().cloned().collect();
    lengths.sort();
    for length in lengths {
        println!("  {} letters: {} words", length, length_distribution[&length]);
    }
}
```

**Explanation**:

- `TextStats` struct stores all analysis results
- `analyze_text()` performs comprehensive text analysis
- Word frequency analysis counts word occurrences
- Character frequency analysis counts character occurrences
- Word length analysis finds longest and shortest words
- `generate_report()` creates a detailed text report
- Additional analysis provides word length distribution

**Why**: This exercise demonstrates advanced text processing and data analysis using collections and strings.

## Exercise 3: Inventory Management System

### Problem Description

**What**: Create an inventory management system using hash maps and vectors to track products and their quantities.

**Why**: This exercise combines multiple collection types to solve a common business problem.

**When**: Use this exercise to practice working with complex data structures and business logic.

**How**: Here's how to implement the inventory management system:

```rust
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
struct Product {
    id: String,
    name: String,
    category: String,
    price: f64,
    quantity: u32,
    description: String,
}

impl Product {
    fn new(id: String, name: String, category: String, price: f64, quantity: u32, description: String) -> Self {
        Self {
            id,
            name,
            category,
            price,
            quantity,
            description,
        }
    }

    fn total_value(&self) -> f64 {
        self.price * self.quantity as f64
    }

    fn is_in_stock(&self) -> bool {
        self.quantity > 0
    }

    fn is_low_stock(&self, threshold: u32) -> bool {
        self.quantity <= threshold
    }
}

#[derive(Debug)]
struct InventoryManager {
    products: HashMap<String, Product>,
    categories: HashSet<String>,
    low_stock_threshold: u32,
}

impl InventoryManager {
    fn new(low_stock_threshold: u32) -> Self {
        Self {
            products: HashMap::new(),
            categories: HashSet::new(),
            low_stock_threshold,
        }
    }

    fn add_product(&mut self, product: Product) {
        self.categories.insert(product.category.clone());
        self.products.insert(product.id.clone(), product);
    }

    fn update_quantity(&mut self, product_id: &str, new_quantity: u32) -> bool {
        if let Some(product) = self.products.get_mut(product_id) {
            product.quantity = new_quantity;
            true
        } else {
            false
        }
    }

    fn adjust_quantity(&mut self, product_id: &str, adjustment: i32) -> bool {
        if let Some(product) = self.products.get_mut(product_id) {
            if adjustment < 0 && (-adjustment) as u32 > product.quantity {
                return false; // Not enough stock
            }
            product.quantity = (product.quantity as i32 + adjustment) as u32;
            true
        } else {
            false
        }
    }

    fn get_product(&self, product_id: &str) -> Option<&Product> {
        self.products.get(product_id)
    }

    fn search_products(&self, query: &str) -> Vec<&Product> {
        let query_lower = query.to_lowercase();
        self.products.values()
            .filter(|product| {
                product.name.to_lowercase().contains(&query_lower) ||
                product.description.to_lowercase().contains(&query_lower) ||
                product.category.to_lowercase().contains(&query_lower)
            })
            .collect()
    }

    fn get_products_by_category(&self, category: &str) -> Vec<&Product> {
        self.products.values()
            .filter(|product| product.category == category)
            .collect()
    }

    fn get_low_stock_products(&self) -> Vec<&Product> {
        self.products.values()
            .filter(|product| product.is_low_stock(self.low_stock_threshold))
            .collect()
    }

    fn get_out_of_stock_products(&self) -> Vec<&Product> {
        self.products.values()
            .filter(|product| !product.is_in_stock())
            .collect()
    }

    fn get_total_inventory_value(&self) -> f64 {
        self.products.values()
            .map(|product| product.total_value())
            .sum()
    }

    fn get_category_statistics(&self) -> HashMap<String, (usize, f64)> {
        let mut stats: HashMap<String, (usize, f64)> = HashMap::new();

        for product in self.products.values() {
            let entry = stats.entry(product.category.clone()).or_insert((0, 0.0));
            entry.0 += 1;
            entry.1 += product.total_value();
        }

        stats
    }

    fn generate_inventory_report(&self) -> String {
        let mut report = String::new();

        report.push_str("=== INVENTORY REPORT ===\n\n");

        // Basic statistics
        report.push_str(&format!("Total Products: {}\n", self.products.len()));
        report.push_str(&format!("Total Categories: {}\n", self.categories.len()));
        report.push_str(&format!("Total Inventory Value: ${:.2}\n", self.get_total_inventory_value()));

        // Low stock products
        let low_stock = self.get_low_stock_products();
        if !low_stock.is_empty() {
            report.push_str(&format!("\nLow Stock Products (≤{}):\n", self.low_stock_threshold));
            for product in low_stock {
                report.push_str(&format!("  {} - {} ({} in stock)\n",
                    product.id, product.name, product.quantity));
            }
        }

        // Out of stock products
        let out_of_stock = self.get_out_of_stock_products();
        if !out_of_stock.is_empty() {
            report.push_str("\nOut of Stock Products:\n");
            for product in out_of_stock {
                report.push_str(&format!("  {} - {}\n", product.id, product.name));
            }
        }

        // Category statistics
        report.push_str("\nCategory Statistics:\n");
        let category_stats = self.get_category_statistics();
        for (category, (count, value)) in &category_stats {
            report.push_str(&format!("  {}: {} products, ${:.2} value\n",
                category, count, value));
        }

        // All products
        report.push_str("\nAll Products:\n");
        for product in self.products.values() {
            report.push_str(&format!("  {} - {} ({} in stock, ${:.2} each)\n",
                product.id, product.name, product.quantity, product.price));
        }

        report
    }
}

fn main() {
    let mut inventory = InventoryManager::new(5); // Low stock threshold: 5

    // Add products
    let products = vec![
        Product::new("LAP001".to_string(), "Gaming Laptop".to_string(), "Electronics".to_string(), 1299.99, 10, "High-performance gaming laptop".to_string()),
        Product::new("PHN001".to_string(), "Smartphone".to_string(), "Electronics".to_string(), 699.99, 25, "Latest model smartphone".to_string()),
        Product::new("BOK001".to_string(), "Rust Programming Book".to_string(), "Books".to_string(), 49.99, 3, "Learn Rust programming".to_string()),
        Product::new("BOK002".to_string(), "Python Guide".to_string(), "Books".to_string(), 39.99, 8, "Python programming guide".to_string()),
        Product::new("CLO001".to_string(), "Cotton T-Shirt".to_string(), "Clothing".to_string(), 19.99, 0, "Comfortable cotton t-shirt".to_string()),
        Product::new("CLO002".to_string(), "Jeans".to_string(), "Clothing".to_string(), 79.99, 2, "Classic blue jeans".to_string()),
    ];

    for product in products {
        inventory.add_product(product);
    }

    // Generate report
    let report = inventory.generate_inventory_report();
    println!("{}", report);

    // Search functionality
    println!("\n=== SEARCH RESULTS ===");
    let search_results = inventory.search_products("book");
    println!("Search results for 'book':");
    for product in search_results {
        println!("  {} - {} ({} in stock)", product.id, product.name, product.quantity);
    }

    // Category analysis
    println!("\n=== CATEGORY ANALYSIS ===");
    let electronics = inventory.get_products_by_category("Electronics");
    println!("Electronics products:");
    for product in electronics {
        println!("  {} - {} (${:.2})", product.id, product.name, product.price);
    }

    // Low stock alert
    println!("\n=== LOW STOCK ALERT ===");
    let low_stock = inventory.get_low_stock_products();
    if low_stock.is_empty() {
        println!("No products are low in stock.");
    } else {
        println!("Products with low stock:");
        for product in low_stock {
            println!("  {} - {} ({} in stock)", product.id, product.name, product.quantity);
        }
    }
}
```

**Explanation**:

- `Product` struct stores product information and methods
- `InventoryManager` manages products using a HashMap
- `add_product()` adds products and tracks categories
- `update_quantity()` and `adjust_quantity()` manage stock levels
- `search_products()` provides text-based search functionality
- `get_products_by_category()` filters products by category
- `get_low_stock_products()` identifies products needing restocking
- `get_total_inventory_value()` calculates total inventory value
- `generate_inventory_report()` creates a comprehensive report

**Why**: This exercise demonstrates how to use multiple collection types to solve complex business problems.

## Exercise 4: Social Network Analysis

### Problem Description

**What**: Create a social network analysis tool that processes user connections and provides insights.

**Why**: This exercise combines hash maps, hash sets, and string processing to analyze social networks.

**When**: Use this exercise to practice working with graph-like data structures and network analysis.

**How**: Here's how to implement the social network analysis tool:

```rust
use std::collections::{HashMap, HashSet};

#[derive(Debug, Clone)]
struct User {
    id: String,
    name: String,
    email: String,
    connections: HashSet<String>,
    posts: Vec<String>,
}

impl User {
    fn new(id: String, name: String, email: String) -> Self {
        Self {
            id,
            name,
            email,
            connections: HashSet::new(),
            posts: Vec::new(),
        }
    }

    fn add_connection(&mut self, user_id: String) {
        self.connections.insert(user_id);
    }

    fn remove_connection(&mut self, user_id: &str) {
        self.connections.remove(user_id);
    }

    fn add_post(&mut self, content: String) {
        self.posts.push(content);
    }

    fn connection_count(&self) -> usize {
        self.connections.len()
    }

    fn post_count(&self) -> usize {
        self.posts.len()
    }
}

#[derive(Debug)]
struct SocialNetwork {
    users: HashMap<String, User>,
    posts: Vec<(String, String)>, // (user_id, content)
}

impl SocialNetwork {
    fn new() -> Self {
        Self {
            users: HashMap::new(),
            posts: Vec::new(),
        }
    }

    fn add_user(&mut self, user: User) {
        self.users.insert(user.id.clone(), user);
    }

    fn add_connection(&mut self, user1_id: &str, user2_id: &str) -> bool {
        if let (Some(user1), Some(user2)) = (self.users.get_mut(user1_id), self.users.get_mut(user2_id)) {
            user1.add_connection(user2_id.to_string());
            user2.add_connection(user1_id.to_string());
            true
        } else {
            false
        }
    }

    fn remove_connection(&mut self, user1_id: &str, user2_id: &str) -> bool {
        if let (Some(user1), Some(user2)) = (self.users.get_mut(user1_id), self.users.get_mut(user2_id)) {
            user1.remove_connection(user2_id);
            user2.remove_connection(user1_id);
            true
        } else {
            false
        }
    }

    fn add_post(&mut self, user_id: &str, content: String) -> bool {
        if let Some(user) = self.users.get_mut(user_id) {
            user.add_post(content.clone());
            self.posts.push((user_id.to_string(), content));
            true
        } else {
            false
        }
    }

    fn get_user(&self, user_id: &str) -> Option<&User> {
        self.users.get(user_id)
    }

    fn get_connections(&self, user_id: &str) -> Vec<&User> {
        if let Some(user) = self.users.get(user_id) {
            user.connections.iter()
                .filter_map(|id| self.users.get(id))
                .collect()
        } else {
            Vec::new()
        }
    }

    fn get_mutual_connections(&self, user1_id: &str, user2_id: &str) -> Vec<&User> {
        if let (Some(user1), Some(user2)) = (self.users.get(user1_id), self.users.get(user2_id)) {
            user1.connections.intersection(&user2.connections)
                .filter_map(|id| self.users.get(id))
                .collect()
        } else {
            Vec::new()
        }
    }

    fn get_most_connected_users(&self, count: usize) -> Vec<(&User, usize)> {
        let mut user_connections: Vec<(&User, usize)> = self.users.values()
            .map(|user| (user, user.connection_count()))
            .collect();

        user_connections.sort_by(|a, b| b.1.cmp(&a.1));
        user_connections.truncate(count);
        user_connections
    }

    fn get_least_connected_users(&self, count: usize) -> Vec<(&User, usize)> {
        let mut user_connections: Vec<(&User, usize)> = self.users.values()
            .map(|user| (user, user.connection_count()))
            .collect();

        user_connections.sort_by(|a, b| a.1.cmp(&b.1));
        user_connections.truncate(count);
        user_connections
    }

    fn get_network_statistics(&self) -> (usize, usize, f64, f64) {
        let user_count = self.users.len();
        let total_connections: usize = self.users.values().map(|u| u.connection_count()).sum();
        let average_connections = if user_count > 0 { total_connections as f64 / user_count as f64 } else { 0.0 };
        let total_posts = self.posts.len() as f64;

        (user_count, total_connections, average_connections, total_posts)
    }

    fn get_network_report(&self) -> String {
        let mut report = String::new();

        report.push_str("=== SOCIAL NETWORK ANALYSIS ===\n\n");

        // Basic statistics
        let (user_count, total_connections, avg_connections, total_posts) = self.get_network_statistics();
        report.push_str(&format!("Total Users: {}\n", user_count));
        report.push_str(&format!("Total Connections: {}\n", total_connections));
        report.push_str(&format!("Average Connections per User: {:.2}\n", avg_connections));
        report.push_str(&format!("Total Posts: {}\n", total_posts as usize));

        // Most connected users
        let most_connected = self.get_most_connected_users(5);
        if !most_connected.is_empty() {
            report.push_str("\nMost Connected Users:\n");
            for (i, (user, count)) in most_connected.iter().enumerate() {
                report.push_str(&format!("  {}. {} ({} connections)\n", i + 1, user.name, count));
            }
        }

        // Least connected users
        let least_connected = self.get_least_connected_users(5);
        if !least_connected.is_empty() {
            report.push_str("\nLeast Connected Users:\n");
            for (i, (user, count)) in least_connected.iter().enumerate() {
                report.push_str(&format!("  {}. {} ({} connections)\n", i + 1, user.name, count));
            }
        }

        // User details
        report.push_str("\nUser Details:\n");
        for user in self.users.values() {
            report.push_str(&format!("  {} ({}): {} connections, {} posts\n",
                user.name, user.id, user.connection_count(), user.post_count()));
        }

        report
    }
}

fn main() {
    let mut network = SocialNetwork::new();

    // Add users
    let users = vec![
        User::new("U001".to_string(), "Alice Johnson".to_string(), "alice@example.com".to_string()),
        User::new("U002".to_string(), "Bob Smith".to_string(), "bob@example.com".to_string()),
        User::new("U003".to_string(), "Charlie Brown".to_string(), "charlie@example.com".to_string()),
        User::new("U004".to_string(), "Diana Prince".to_string(), "diana@example.com".to_string()),
        User::new("U005".to_string(), "Eve Wilson".to_string(), "eve@example.com".to_string()),
    ];

    for user in users {
        network.add_user(user);
    }

    // Add connections
    network.add_connection("U001", "U002");
    network.add_connection("U001", "U003");
    network.add_connection("U002", "U003");
    network.add_connection("U002", "U004");
    network.add_connection("U003", "U004");
    network.add_connection("U004", "U005");

    // Add posts
    network.add_post("U001", "Hello, world!".to_string());
    network.add_post("U001", "Learning Rust is fun!".to_string());
    network.add_post("U002", "Great weather today!".to_string());
    network.add_post("U003", "Working on a new project".to_string());
    network.add_post("U004", "Just finished a great book".to_string());
    network.add_post("U005", "Excited about the weekend!".to_string());

    // Generate report
    let report = network.get_network_report();
    println!("{}", report);

    // Additional analysis
    println!("\n=== ADDITIONAL ANALYSIS ===");

    // Mutual connections
    let mutual = network.get_mutual_connections("U001", "U002");
    println!("Mutual connections between Alice and Bob:");
    for user in mutual {
        println!("  {}", user.name);
    }

    // User connections
    if let Some(alice) = network.get_user("U001") {
        println!("\nAlice's connections:");
        for connection in network.get_connections("U001") {
            println!("  {}", connection.name);
        }
    }
}
```

**Explanation**:

- `User` struct stores user information and connections
- `SocialNetwork` manages users and their relationships
- `add_connection()` creates bidirectional connections
- `get_mutual_connections()` finds common connections
- `get_most_connected_users()` identifies popular users
- `get_network_statistics()` provides network metrics
- `get_network_report()` creates a comprehensive analysis

**Why**: This exercise demonstrates how to use collections to model and analyze complex relationships.

## Key Takeaways

**What** you've learned from these practical exercises:

1. **Real-world Applications** - How to apply collections and strings to solve practical problems
2. **Data Management** - Using hash maps and vectors for complex data structures
3. **Text Processing** - Advanced string manipulation and analysis
4. **Business Logic** - Implementing real-world business rules
5. **Report Generation** - Creating comprehensive text reports
6. **Search and Filtering** - Finding and organizing data
7. **Statistics and Analysis** - Calculating metrics and insights
8. **Code Organization** - Structuring complex applications
9. **Error Handling** - Managing edge cases and validation

**Why** these exercises matter:

- **Practical skills** prepare you for real-world programming
- **Problem-solving** develops your ability to tackle complex challenges
- **Code quality** improves through hands-on practice
- **Confidence** builds through successful problem solving

## Next Steps

Now that you've completed the "Collections and Strings" chapter, you're ready to learn about:

- **Modules and Packages** - Organizing code and managing dependencies
- **Advanced Concepts** - Generics, traits, and lifetimes
- **Performance Optimization** - Efficient collection usage
- **Real-world Projects** - Building complete applications

**Where** to go next: Continue with the next chapter on "Modules and Packages" to learn about code organization and dependency management!
