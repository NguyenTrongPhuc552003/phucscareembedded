---
sidebar_position: 4
---

# String Handling

Master text processing in Rust with comprehensive explanations using the 4W+H framework.

## What Is String Handling in Rust?

**What**: String handling in Rust involves working with text data using `String` (owned) and `&str` (borrowed) types. Rust provides powerful tools for string manipulation, UTF-8 encoding support, and safe text processing.

**Why**: Understanding string handling is crucial because:

- **Text processing** is fundamental to most applications
- **UTF-8 support** enables proper internationalization
- **Memory safety** prevents common string-related bugs
- **Performance** provides efficient string operations
- **Data validation** allows safe text input handling
- **API design** enables clear text-based interfaces
- **Real-world usage** essential for practical programming

**When**: Use string handling when you need to:

- Process user input and text data
- Manipulate and transform strings
- Work with international text (UTF-8)
- Parse and validate text data
- Build text-based user interfaces
- Handle file content and data processing
- Implement text algorithms and search

**How**: String handling works in Rust by:

- **Ownership system** managing string memory safely
- **UTF-8 encoding** supporting international characters
- **String types** providing different ownership models
- **String methods** offering powerful manipulation tools
- **Memory safety** preventing buffer overflows and use-after-free

**Where**: String handling is used throughout Rust programs for user interfaces, data processing, file I/O, and text manipulation.

## Understanding String Types

### String vs &str

**What**: Rust has two main string types: `String` (owned) and `&str` (borrowed string slice).

**Why**: Understanding string types is important because:

- **Ownership** affects how strings are stored and passed around
- **Performance** different types have different characteristics
- **Memory management** influences string usage patterns
- **Common operations** require understanding both types

**When**: Use different string types based on your ownership and performance needs.

**How**: Here's how to work with different string types:

```rust
fn main() {
    // String (owned) - mutable, growable
    let mut owned_string = String::from("Hello");
    owned_string.push_str(", World!");
    println!("Owned string: {}", owned_string);

    // &str (borrowed) - immutable, fixed-size
    let borrowed_string = "Hello, World!";
    println!("Borrowed string: {}", borrowed_string);

    // String literals are &str
    let literal: &str = "This is a string literal";
    println!("String literal: {}", literal);

    // Converting between types
    let from_literal = String::from("Converted from literal");
    let to_slice: &str = &from_literal;
    println!("From literal: {}", from_literal);
    println!("As slice: {}", to_slice);

    // String methods work on both types
    println!("Length: {}", owned_string.len());
    println!("Is empty: {}", owned_string.is_empty());
    println!("Contains 'World': {}", owned_string.contains("World"));
}
```

**Explanation**:

- `String::from()` creates an owned string from a string literal
- `&str` is a borrowed string slice (immutable reference)
- String literals are `&str` by default
- `&owned_string` creates a `&str` from a `String`
- Both types support many of the same methods

**Why**: Understanding the difference between owned and borrowed strings is crucial for memory management.

### Creating Strings

**What**: Various ways to create strings in Rust, each with different characteristics.

**Why**: Understanding string creation is important because:

- **Flexibility** provides different ways to create strings
- **Performance** different methods have different costs
- **Common patterns** essential for string manipulation
- **Memory efficiency** helps choose appropriate creation methods

**When**: Use different creation methods based on your specific needs.

**How**: Here's how to create strings in different ways:

```rust
fn main() {
    // String literals (compile-time)
    let literal = "Hello, World!";
    println!("Literal: {}", literal);

    // String::new() - empty string
    let mut empty = String::new();
    empty.push_str("Hello");
    empty.push('!');
    println!("Empty to filled: {}", empty);

    // String::from() - from string literal
    let from_literal = String::from("Hello, World!");
    println!("From literal: {}", from_literal);

    // String::with_capacity() - pre-allocated
    let mut with_capacity = String::with_capacity(20);
    with_capacity.push_str("Hello, World!");
    println!("With capacity: {}", with_capacity);

    // From other types
    let from_number = 42.to_string();
    let from_char = 'A'.to_string();
    println!("From number: {}", from_number);
    println!("From char: {}", from_char);

    // Using format! macro
    let formatted = format!("Hello, {}!", "Rust");
    println!("Formatted: {}", formatted);

    // String concatenation
    let part1 = String::from("Hello");
    let part2 = String::from(", World!");
    let combined = part1 + &part2;
    println!("Combined: {}", combined);
}
```

**Explanation**:

- String literals are created at compile time
- `String::new()` creates an empty, mutable string
- `String::from()` creates a string from a string literal
- `String::with_capacity()` pre-allocates memory
- `to_string()` converts other types to strings
- `format!` macro creates formatted strings
- `+` operator concatenates strings (consumes the first)

**Why**: Different creation methods provide flexibility for various use cases.

## Understanding String Operations

### Basic String Manipulation

**What**: Fundamental operations for working with strings including length, indexing, and basic modifications.

**Why**: Understanding basic operations is important because:

- **Data access** allows you to read string contents
- **Common operations** essential for string processing
- **Safety** prevents common string-related errors
- **Performance** different operations have different costs

**When**: Use basic operations when you need to read or modify string data.

**How**: Here's how to perform basic string operations:

```rust
fn main() {
    let mut text = String::from("Hello, World!");

    // Length and capacity
    println!("Length: {}", text.len());
    println!("Capacity: {}", text.capacity());
    println!("Is empty: {}", text.is_empty());

    // Adding content
    text.push('!');  // Add single character
    text.push_str(" How are you?");  // Add string
    println!("After adding: {}", text);

    // Checking content
    println!("Starts with 'Hello': {}", text.starts_with("Hello"));
    println!("Ends with '?': {}", text.ends_with("?"));
    println!("Contains 'World': {}", text.contains("World"));

    // Case operations
    println!("Uppercase: {}", text.to_uppercase());
    println!("Lowercase: {}", text.to_lowercase());

    // Trimming whitespace
    let spaced = "  Hello, World!  ";
    println!("Original: '{}'", spaced);
    println!("Trimmed: '{}'", spaced.trim());

    // Replacing content
    let replaced = text.replace("World", "Rust");
    println!("Replaced: {}", replaced);
}
```

**Explanation**:

- `len()` returns the number of bytes (not characters)
- `capacity()` returns the allocated capacity
- `push()` adds a single character
- `push_str()` adds a string slice
- `starts_with()`, `ends_with()`, `contains()` check content
- `to_uppercase()`, `to_lowercase()` change case
- `trim()` removes leading and trailing whitespace
- `replace()` replaces all occurrences

**Why**: Basic operations provide the foundation for string manipulation.

### String Slicing and Indexing

**What**: Accessing parts of strings using slicing and understanding Rust's approach to string indexing.

**Why**: Understanding string slicing is important because:

- **Data access** allows you to work with parts of strings
- **Safety** prevents invalid memory access
- **Performance** provides efficient string processing
- **Common operations** essential for text manipulation

**When**: Use string slicing when you need to access specific parts of strings.

**How**: Here's how to work with string slicing:

```rust
fn main() {
    let text = "Hello, World!";

    // String slicing (safe)
    let hello = &text[0..5];  // "Hello"
    let world = &text[7..12];  // "World"
    let exclamation = &text[12..];  // "!"

    println!("Original: {}", text);
    println!("Hello: {}", hello);
    println!("World: {}", world);
    println!("Exclamation: {}", exclamation);

    // Character access (safe)
    if let Some(first_char) = text.chars().next() {
        println!("First character: {}", first_char);
    }

    if let Some(last_char) = text.chars().last() {
        println!("Last character: {}", last_char);
    }

    // Iterating over characters
    println!("Characters:");
    for (i, ch) in text.chars().enumerate() {
        println!("  {}: {}", i, ch);
    }

    // Iterating over bytes
    println!("Bytes:");
    for (i, byte) in text.bytes().enumerate() {
        println!("  {}: {}", i, byte);
    }

    // Finding substrings
    if let Some(pos) = text.find("World") {
        println!("'World' found at position: {}", pos);
        let after_world = &text[pos..];
        println!("After 'World': {}", after_world);
    }
}
```

**Explanation**:

- `&text[start..end]` creates a string slice
- `&text[start..]` creates a slice from start to end
- `chars()` provides an iterator over characters
- `bytes()` provides an iterator over bytes
- `find()` returns the position of a substring
- String slicing is safe and prevents out-of-bounds access

**Why**: String slicing provides safe and efficient access to string parts.

### String Searching and Matching

**What**: Finding and matching patterns within strings using various search methods.

**Why**: Understanding string searching is important because:

- **Data processing** enables you to find specific content
- **Pattern matching** supports text analysis
- **Common operations** essential for text processing
- **Performance** different methods have different characteristics

**When**: Use string searching when you need to find or match patterns in text.

**How**: Here's how to search and match strings:

```rust
fn main() {
    let text = "Hello, World! Hello, Rust!";

    // Simple searching
    println!("Contains 'World': {}", text.contains("World"));
    println!("Contains 'Python': {}", text.contains("Python"));

    // Finding positions
    if let Some(pos) = text.find("Hello") {
        println!("'Hello' found at position: {}", pos);
    }

    if let Some(pos) = text.rfind("Hello") {
        println!("'Hello' found at position (reverse): {}", pos);
    }

    // Finding multiple occurrences
    let mut start = 0;
    while let Some(pos) = text[start..].find("Hello") {
        let actual_pos = start + pos;
        println!("'Hello' found at position: {}", actual_pos);
        start = actual_pos + 1;
    }

    // Pattern matching with starts_with and ends_with
    println!("Starts with 'Hello': {}", text.starts_with("Hello"));
    println!("Ends with 'Rust!': {}", text.ends_with("Rust!"));

    // Case-insensitive searching
    let lower_text = text.to_lowercase();
    println!("Contains 'world' (case-insensitive): {}", lower_text.contains("world"));

    // Searching with conditions
    let words: Vec<&str> = text.split_whitespace().collect();
    let hello_words: Vec<&str> = words.iter()
        .filter(|word| word.starts_with("Hello"))
        .cloned()
        .collect();
    println!("Words starting with 'Hello': {:?}", hello_words);
}
```

**Explanation**:

- `contains()` checks if a substring exists
- `find()` returns the position of the first occurrence
- `rfind()` returns the position of the last occurrence
- `starts_with()` and `ends_with()` check prefixes and suffixes
- `split_whitespace()` splits text into words
- `filter()` finds words matching conditions

**Why**: String searching provides powerful tools for text analysis and processing.

## Understanding String Iteration

### Character Iteration

**What**: Iterating over characters in strings to process text data.

**Why**: Understanding character iteration is important because:

- **Text processing** enables you to work with individual characters
- **Unicode support** handles international characters correctly
- **Common operations** essential for text manipulation
- **Performance** provides efficient character processing

**When**: Use character iteration when you need to process individual characters.

**How**: Here's how to iterate over characters:

```rust
fn main() {
    let text = "Hello, 世界! 🌍";

    // Basic character iteration
    println!("Characters:");
    for ch in text.chars() {
        println!("  {}", ch);
    }

    // Character iteration with positions
    println!("Characters with positions:");
    for (i, ch) in text.char_indices() {
        println!("  {}: {}", i, ch);
    }

    // Character counting
    let char_count = text.chars().count();
    let byte_count = text.len();
    println!("Character count: {}", char_count);
    println!("Byte count: {}", byte_count);

    // Filtering characters
    let letters: Vec<char> = text.chars()
        .filter(|ch| ch.is_alphabetic())
        .collect();
    println!("Letters only: {:?}", letters);

    // Character analysis
    let mut vowel_count = 0;
    let mut consonant_count = 0;
    let mut other_count = 0;

    for ch in text.chars() {
        if ch.is_alphabetic() {
            if "aeiouAEIOU".contains(ch) {
                vowel_count += 1;
            } else {
                consonant_count += 1;
            }
        } else {
            other_count += 1;
        }
    }

    println!("Vowels: {}, Consonants: {}, Other: {}", vowel_count, consonant_count, other_count);
}
```

**Explanation**:

- `chars()` provides an iterator over characters
- `char_indices()` provides characters with their byte positions
- `count()` counts the number of characters
- `len()` counts the number of bytes
- `is_alphabetic()` checks if a character is a letter
- Character iteration handles Unicode correctly

**Why**: Character iteration is essential for text processing and analysis.

### Word and Line Iteration

**What**: Iterating over words and lines in text for structured text processing.

**Why**: Understanding word and line iteration is important because:

- **Text analysis** enables you to work with structured text
- **Common operations** essential for text processing
- **Performance** provides efficient text parsing
- **Flexibility** supports various text formats

**When**: Use word and line iteration when you need to process structured text.

**How**: Here's how to iterate over words and lines:

```rust
fn main() {
    let text = "Hello, World!\nHow are you?\nI'm doing great!";

    // Line iteration
    println!("Lines:");
    for (i, line) in text.lines().enumerate() {
        println!("  {}: {}", i, line);
    }

    // Word iteration
    println!("Words:");
    for (i, word) in text.split_whitespace().enumerate() {
        println!("  {}: {}", i, word);
    }

    // Custom word splitting
    let custom_words: Vec<&str> = text.split(|c| c == ' ' || c == ',' || c == '!')
        .filter(|word| !word.is_empty())
        .collect();
    println!("Custom split words: {:?}", custom_words);

    // Word analysis
    let words: Vec<&str> = text.split_whitespace().collect();
    let word_count = words.len();
    let avg_length = words.iter().map(|w| w.len()).sum::<usize>() as f64 / word_count as f64;

    println!("Word count: {}", word_count);
    println!("Average word length: {:.2}", avg_length);

    // Longest word
    if let Some(longest) = words.iter().max_by_key(|w| w.len()) {
        println!("Longest word: {}", longest);
    }

    // Word frequency (simplified)
    let mut word_freq = std::collections::HashMap::new();
    for word in words {
        let count = word_freq.entry(word).or_insert(0);
        *count += 1;
    }
    println!("Word frequencies: {:?}", word_freq);
}
```

**Explanation**:

- `lines()` splits text into lines
- `split_whitespace()` splits text into words
- `split()` allows custom splitting
- `max_by_key()` finds the longest word
- `HashMap` tracks word frequencies
- Word and line iteration provides structured text processing

**Why**: Word and line iteration are essential for text analysis and processing.

## Understanding String Methods

### String Transformation

**What**: Methods for transforming strings including case changes, trimming, and formatting.

**Why**: Understanding string transformation is important because:

- **Data cleaning** prepares text for processing
- **User interface** formats text for display
- **Common operations** essential for text manipulation
- **Performance** provides efficient string processing

**When**: Use string transformation when you need to modify string content.

**How**: Here's how to transform strings:

```rust
fn main() {
    let text = "  Hello, World!  ";

    // Trimming whitespace
    let trimmed = text.trim();
    println!("Original: '{}'", text);
    println!("Trimmed: '{}'", trimmed);

    // Case transformation
    println!("Uppercase: {}", text.to_uppercase());
    println!("Lowercase: {}", text.to_lowercase());
    println!("Title case: {}", text.to_lowercase());

    // Replacing content
    let replaced = text.replace("World", "Rust");
    println!("Replaced: {}", replaced);

    // Multiple replacements
    let multi_replaced = text.replace("Hello", "Hi").replace("World", "Rust");
    println!("Multiple replacements: {}", multi_replaced);

    // String formatting
    let name = "Alice";
    let age = 25;
    let formatted = format!("Hello, {}! You are {} years old.", name, age);
    println!("Formatted: {}", formatted);

    // String padding
    let padded = format!("{:>10}", "Hello");
    println!("Right-padded: '{}'", padded);

    let left_padded = format!("{:<10}", "Hello");
    println!("Left-padded: '{}'", left_padded);

    // String truncation
    let truncated = if text.len() > 10 {
        &text[..10]
    } else {
        text
    };
    println!("Truncated: '{}'", truncated);
}
```

**Explanation**:

- `trim()` removes leading and trailing whitespace
- `to_uppercase()` and `to_lowercase()` change case
- `replace()` replaces all occurrences
- `format!` macro creates formatted strings
- `{:>10}` right-pads to 10 characters
- `{:<10}` left-pads to 10 characters
- String slicing truncates text

**Why**: String transformation provides essential tools for text processing.

### String Validation

**What**: Methods for validating string content including checking formats and content.

**Why**: Understanding string validation is important because:

- **Data validation** ensures text meets requirements
- **Input processing** validates user input
- **Common operations** essential for robust applications
- **Safety** prevents invalid data from causing errors

**When**: Use string validation when you need to check string content.

**How**: Here's how to validate strings:

```rust
fn main() {
    let text = "Hello, World!";
    let number = "12345";
    let email = "user@example.com";
    let empty = "";

    // Basic validation
    println!("Is empty: {}", empty.is_empty());
    println!("Is not empty: {}", !text.is_empty());

    // Character type validation
    println!("Is alphabetic: {}", text.chars().all(|c| c.is_alphabetic()));
    println!("Is numeric: {}", number.chars().all(|c| c.is_numeric()));
    println!("Is alphanumeric: {}", text.chars().all(|c| c.is_alphanumeric()));

    // Case validation
    println!("Is uppercase: {}", text.chars().all(|c| c.is_uppercase()));
    println!("Is lowercase: {}", text.chars().all(|c| c.is_lowercase()));

    // Whitespace validation
    let spaced = "  \t\n  ";
    println!("Is whitespace: {}", spaced.chars().all(|c| c.is_whitespace()));

    // Length validation
    println!("Length >= 5: {}", text.len() >= 5);
    println!("Length <= 20: {}", text.len() <= 20);

    // Pattern validation
    println!("Starts with 'Hello': {}", text.starts_with("Hello"));
    println!("Ends with '!': {}", text.ends_with("!"));
    println!("Contains 'World': {}", text.contains("World"));

    // Email validation (simplified)
    let is_valid_email = email.contains('@') && email.contains('.');
    println!("Is valid email: {}", is_valid_email);

    // Custom validation function
    fn is_valid_password(password: &str) -> bool {
        password.len() >= 8 &&
        password.chars().any(|c| c.is_uppercase()) &&
        password.chars().any(|c| c.is_lowercase()) &&
        password.chars().any(|c| c.is_numeric())
    }

    let password = "MyPassword123";
    println!("Is valid password: {}", is_valid_password(password));
}
```

**Explanation**:

- `is_empty()` checks if string is empty
- `is_alphabetic()` checks if all characters are letters
- `is_numeric()` checks if all characters are digits
- `is_alphanumeric()` checks if all characters are letters or digits
- `is_uppercase()` and `is_lowercase()` check case
- `is_whitespace()` checks if all characters are whitespace
- Custom validation functions provide specific checks

**Why**: String validation ensures data integrity and prevents errors.

## Understanding UTF-8 and Unicode

### Unicode Support

**What**: Rust's support for Unicode and UTF-8 encoding for international text.

**Why**: Understanding Unicode support is important because:

- **Internationalization** enables support for global languages
- **Text processing** handles international characters correctly
- **Common operations** essential for modern applications
- **Safety** prevents encoding-related errors

**When**: Use Unicode support when working with international text.

**How**: Here's how to work with Unicode in Rust:

```rust
fn main() {
    let text = "Hello, 世界! 🌍";

    // Character count vs byte count
    println!("Text: {}", text);
    println!("Character count: {}", text.chars().count());
    println!("Byte count: {}", text.len());

    // Iterating over Unicode characters
    println!("Unicode characters:");
    for (i, ch) in text.char_indices() {
        println!("  {}: {} (U+{:04X})", i, ch, ch as u32);
    }

    // Unicode categories
    for ch in text.chars() {
        if ch.is_alphabetic() {
            println!("'{}' is alphabetic", ch);
        } else if ch.is_numeric() {
            println!("'{}' is numeric", ch);
        } else if ch.is_whitespace() {
            println!("'{}' is whitespace", ch);
        } else {
            println!("'{}' is other", ch);
        }
    }

    // Unicode normalization
    let text1 = "café";
    let text2 = "cafe\u{0301}";  // e with combining acute accent
    println!("Text1: {}", text1);
    println!("Text2: {}", text2);
    println!("Are equal: {}", text1 == text2);

    // Unicode case conversion
    let mixed = "Hello, 世界!";
    println!("Original: {}", mixed);
    println!("Uppercase: {}", mixed.to_uppercase());
    println!("Lowercase: {}", mixed.to_lowercase());
}
```

**Explanation**:

- `chars()` provides Unicode characters, not bytes
- `char_indices()` provides characters with byte positions
- `is_alphabetic()` works with Unicode letters
- `is_numeric()` works with Unicode digits
- `is_whitespace()` works with Unicode whitespace
- Unicode normalization handles different representations
- Case conversion works with Unicode characters

**Why**: Unicode support is essential for international applications.

### String Encoding

**What**: Understanding how strings are encoded and how to work with different encodings.

**Why**: Understanding string encoding is important because:

- **Data processing** handles different text encodings
- **File I/O** works with various text formats
- **Common operations** essential for text processing
- **Safety** prevents encoding-related errors

**When**: Use string encoding knowledge when working with different text formats.

**How**: Here's how to work with string encoding:

```rust
fn main() {
    let text = "Hello, 世界!";

    // UTF-8 encoding
    let utf8_bytes = text.as_bytes();
    println!("UTF-8 bytes: {:?}", utf8_bytes);

    // Converting bytes back to string
    if let Ok(decoded) = std::str::from_utf8(utf8_bytes) {
        println!("Decoded: {}", decoded);
    }

    // Handling invalid UTF-8
    let invalid_utf8 = b"Hello, \xFF World!";
    match std::str::from_utf8(invalid_utf8) {
        Ok(text) => println!("Valid UTF-8: {}", text),
        Err(e) => println!("Invalid UTF-8: {}", e),
    }

    // String length in different units
    println!("Character count: {}", text.chars().count());
    println!("Byte count: {}", text.len());
    println!("Grapheme count: {}", text.chars().count());  // Simplified

    // Working with ASCII
    let ascii_text = "Hello, World!";
    println!("Is ASCII: {}", ascii_text.is_ascii());
    println!("ASCII bytes: {:?}", ascii_text.as_bytes());

    // ASCII operations
    let ascii_upper = ascii_text.to_ascii_uppercase();
    let ascii_lower = ascii_text.to_ascii_lowercase();
    println!("ASCII uppercase: {}", ascii_upper);
    println!("ASCII lowercase: {}", ascii_lower);
}
```

**Explanation**:

- `as_bytes()` converts string to UTF-8 bytes
- `from_utf8()` converts bytes back to string
- `is_ascii()` checks if string is ASCII
- `to_ascii_uppercase()` and `to_ascii_lowercase()` work with ASCII
- UTF-8 encoding supports all Unicode characters
- Error handling prevents invalid UTF-8 issues

**Why**: Understanding string encoding is crucial for text processing and file I/O.

## Common String Patterns

### Text Processing

**What**: Common patterns for processing and analyzing text data.

**Why**: Understanding text processing patterns is important because:

- **Data analysis** enables you to extract information from text
- **Common operations** essential for text processing
- **Performance** provides efficient text analysis
- **Flexibility** supports various text processing needs

**When**: Use text processing patterns when you need to analyze or transform text.

**How**: Here's how to implement common text processing patterns:

```rust
fn main() {
    let text = "Hello, World! How are you today?";

    // Word frequency analysis
    let words: Vec<&str> = text.split_whitespace().collect();
    let mut word_freq = std::collections::HashMap::new();
    for word in words {
        let count = word_freq.entry(word).or_insert(0);
        *count += 1;
    }
    println!("Word frequencies: {:?}", word_freq);

    // Character frequency analysis
    let mut char_freq = std::collections::HashMap::new();
    for ch in text.chars() {
        if ch.is_alphabetic() {
            let count = char_freq.entry(ch.to_lowercase().next().unwrap()).or_insert(0);
            *count += 1;
        }
    }
    println!("Character frequencies: {:?}", char_freq);

    // Text statistics
    let word_count = text.split_whitespace().count();
    let char_count = text.chars().count();
    let byte_count = text.len();
    let sentence_count = text.matches('.').count() + text.matches('!').count() + text.matches('?').count();

    println!("Statistics:");
    println!("  Words: {}", word_count);
    println!("  Characters: {}", char_count);
    println!("  Bytes: {}", byte_count);
    println!("  Sentences: {}", sentence_count);

    // Text cleaning
    let cleaned = text
        .to_lowercase()
        .chars()
        .filter(|c| c.is_alphabetic() || c.is_whitespace())
        .collect::<String>();
    println!("Cleaned text: {}", cleaned);

    // Text transformation
    let transformed = text
        .split_whitespace()
        .map(|word| word.to_uppercase())
        .collect::<Vec<_>>()
        .join(" ");
    println!("Transformed: {}", transformed);
}
```

**Explanation**:

- Word frequency analysis counts word occurrences
- Character frequency analysis counts character occurrences
- Text statistics provide basic text metrics
- Text cleaning removes unwanted characters
- Text transformation modifies text structure
- HashMap provides efficient frequency counting

**Why**: Text processing patterns are essential for data analysis and text manipulation.

### String Parsing

**What**: Common patterns for parsing and extracting data from strings.

**Why**: Understanding string parsing is important because:

- **Data extraction** enables you to get specific information from text
- **Common operations** essential for text processing
- **Performance** provides efficient parsing
- **Flexibility** supports various parsing needs

**When**: Use string parsing when you need to extract structured data from text.

**How**: Here's how to implement common string parsing patterns:

```rust
fn main() {
    let data = "name:Alice,age:25,city:New York";

    // Simple key-value parsing
    let mut parsed_data = std::collections::HashMap::new();
    for pair in data.split(',') {
        if let Some((key, value)) = pair.split_once(':') {
            parsed_data.insert(key.trim(), value.trim());
        }
    }
    println!("Parsed data: {:?}", parsed_data);

    // CSV-like parsing
    let csv_data = "Alice,25,New York\nBob,30,Los Angeles\nCharlie,35,Chicago";
    let mut records = Vec::new();
    for line in csv_data.lines() {
        let fields: Vec<&str> = line.split(',').collect();
        records.push(fields);
    }
    println!("CSV records: {:?}", records);

    // Number parsing
    let number_text = "123 456 789";
    let numbers: Result<Vec<i32>, _> = number_text
        .split_whitespace()
        .map(|s| s.parse::<i32>())
        .collect();
    match numbers {
        Ok(nums) => println!("Parsed numbers: {:?}", nums),
        Err(e) => println!("Parse error: {}", e),
    }

    // URL-like parsing
    let url = "https://example.com/path?param=value&other=123";
    if let Some((base, query)) = url.split_once('?') {
        println!("Base URL: {}", base);
        println!("Query string: {}", query);

        let mut params = std::collections::HashMap::new();
        for param in query.split('&') {
            if let Some((key, value)) = param.split_once('=') {
                params.insert(key, value);
            }
        }
        println!("Parameters: {:?}", params);
    }
}
```

**Explanation**:

- `split_once()` splits on the first occurrence
- `split()` splits on all occurrences
- `parse()` converts strings to numbers
- `Result` type handles parsing errors
- HashMap stores parsed key-value pairs
- String parsing extracts structured data

**Why**: String parsing is essential for data processing and text analysis.

## Key Takeaways

**What** you've learned about string handling:

1. **String Types** - How to work with `String` and `&str` types
2. **String Creation** - Various ways to create strings
3. **String Operations** - Basic manipulation and modification
4. **String Slicing** - Safe access to string parts
5. **String Searching** - Finding and matching patterns
6. **String Iteration** - Processing characters, words, and lines
7. **String Methods** - Transformation and validation
8. **Unicode Support** - Working with international text
9. **Common Patterns** - Text processing and parsing

**Why** these concepts matter:

- **Text processing** is fundamental to most applications
- **Unicode support** enables internationalization
- **Memory safety** prevents common string-related bugs
- **Performance** provides efficient text operations

## Next Steps

Now that you understand string handling, you're ready to learn about:

- **Practical exercises** - Hands-on practice and reinforcement
- **Advanced collections** - More complex data structures
- **Performance optimization** - Efficient string usage
- **Algorithm implementation** - Using strings in algorithms

**Where** to go next: Continue with the next lesson on "Practical Exercises" to reinforce your understanding of collections and strings!
