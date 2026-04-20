## Chapter 8 – Common Collections

In this chapter, we will cover:

<img width="267" height="147" alt="Screenshot 2025-10-27 at 4 05 58 PM" src="https://github.com/user-attachments/assets/ce33c6f2-5d4d-4e6d-871a-eafc8c9f6589" />


Rust’s standard library provides several **collection types** — data structures that store multiple values in a single data type. The most commonly used collections are:

* **Vectors (`Vec<T>`)** – for storing a list of items of the same type in a growable, contiguous array.
* **Strings (`String`)** – for text that is stored as a collection of UTF-8–encoded bytes.
* **Hash maps (`HashMap<K, V>`)** – for storing key-value pairs.

These are the *core* collections you’ll use in almost every Rust program.

---

### 8.1. Storing Lists of Values with Vectors

A **vector** (`Vec<T>`) is a growable array type — all elements must be of the same type, and it stores them next to each other in memory.

#### Creating a Vector

```rust
let v: Vec<i32> = Vec::new();
```

* `Vec::new()` creates an empty vector.
* You can add elements later using `push`.

A shorthand for initializing with elements:

```rust
let v = vec![1, 2, 3];
```

* `vec![]` is a **macro** that creates a vector and infers its type from the elements.

---

#### Updating a Vector

```rust
let mut v = Vec::new();
v.push(5);
v.push(6);
v.push(7);
```

* `push` appends elements at the end.
* The vector must be `mut` since `push` modifies it.

---

#### Dropping a Vector

When a vector goes out of scope, all its elements are also **dropped** automatically.

```rust
{
    let v = vec![1, 2, 3, 4];
} // v is dropped here, memory freed
```

Rust ensures memory safety — no use-after-free or leaks occur.

---

### 8.2. Reading Elements of Vectors

You can access elements in two ways:

```rust
let v = vec![10, 20, 30, 40];

let third: &i32 = &v[2];
println!("The third element is {third}");

match v.get(2) {
    Some(value) => println!("The third element is {value}"),
    None => println!("There is no third element."),
}
```

* `v[2]` uses **indexing** and will **panic** if out of bounds.
* `v.get(2)` returns an `Option<&T>`, allowing safe error handling.

If you try `v[100]`, it panics at runtime. But `v.get(100)` gives `None`.

---

#### Borrowing Rules with Vectors

```rust
let mut v = vec![1, 2, 3, 4, 5];
let first = &v[0];
v.push(6);
println!("The first element is: {first}");
```

This code **won’t compile** because:

* You borrowed `v` immutably (`&v[0]`).
* Then tried to mutate it (`v.push(6)`).

When you push to a vector, Rust may reallocate memory — invalidating existing references.
Rust’s **borrow checker** prevents this to ensure safety.

---

### 8.3. Iterating over a Vector

Iterating by reference:

```rust
let v = vec![100, 32, 57];
for i in &v {
    println!("{i}");
}
```

Iterating by mutable reference:

```rust
let mut v = vec![100, 32, 57];
for i in &mut v {
    *i += 50; // must dereference to modify
}
```

---

### 8.4. Storing Multiple Types in a Vector

Vectors store elements of one type. But using **enums**, we can store different variants:

```rust
enum SpreadsheetCell {
    Int(i32),
    Float(f64),
    Text(String),
}

let row = vec![
    SpreadsheetCell::Int(3),
    SpreadsheetCell::Text(String::from("blue")),
    SpreadsheetCell::Float(10.12),
];
```

* Each variant is a single type (the enum).
* The compiler knows the size and type of each element at compile time.

---

## 8.5. Strings

A **String** is a collection of UTF-8 encoded bytes, built on top of `Vec<u8>`.

Rust has two main string types:

* `String` – an owned, growable, heap-allocated string.
* `&str` – a string slice; a reference to a string (often a literal).

---

### Creating a New String

```rust
let mut s = String::new();
```

Or create from a string literal:

```rust
let s = "initial contents".to_string();
```

Or using `String::from()`:

```rust
let s = String::from("hello");
```

All three create a `String`.

---

### Updating a String

#### Appending with `push_str` and `push`

```rust
let mut s = String::from("foo");
s.push_str("bar"); // foo + bar = foobar
```

`push_str` takes a string slice (`&str`) because it doesn’t take ownership.

```rust
let mut s = String::from("lo");
s.push('l'); // adds a single character
```

---

### Concatenation with `+`

```rust
let s1 = String::from("Hello, ");
let s2 = String::from("world!");
let s3 = s1 + &s2;
```

* `s1` is **moved** and can’t be used after this.
* `&s2` is borrowed.
* `+` actually calls `add(self, s: &str)`.

---

### Using `format!`

`format!` works like `println!` but returns a string:

```rust
let s1 = String::from("tic");
let s2 = String::from("tac");
let s3 = String::from("toe");

let s = format!("{s1}-{s2}-{s3}");
```

* Doesn’t take ownership.
* More flexible than `+`.

---

### Indexing Strings

You **can’t** index strings directly like `s[0]`.

Why?

Because Rust strings are UTF-8 encoded, and one character may take multiple bytes.
For example, “नमस्ते” takes 18 bytes but only 6 characters.

```rust
let s = String::from("नमस्ते");
let h = s[0]; // ❌ compile-time error
```

---

### Slicing Strings

You can slice a valid range:

```rust
let hello = "Здравствуйте";
let s = &hello[0..4]; // takes first 4 bytes, not characters
```

`0..4` works only if it cuts cleanly between character boundaries.

---

### Iterating over Strings

```rust
for c in "नमस्ते".chars() {
    println!("{c}");
}
```

* `.chars()` iterates over Unicode scalar values.

To get raw bytes:

```rust
for b in "नमस्ते".bytes() {
    println!("{b}");
}
```

---

## 8.6. Hash Maps

A **hash map** (`HashMap<K, V>`) stores key-value pairs.

To use it:

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();
scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);
```

---

### Accessing Values

```rust
let team_name = String::from("Blue");
let score = scores.get(&team_name);
```

`get` returns an `Option<&V>`.

To iterate:

```rust
for (key, value) in &scores {
    println!("{key}: {value}");
}
```

---

### Ownership Rules with Hash Maps

For keys and values that implement `Copy` (like integers), values are copied in.
For owned types like `String`, ownership is moved:

```rust
let field_name = String::from("Favorite color");
let field_value = String::from("Blue");
let mut map = HashMap::new();
map.insert(field_name, field_value);
```

After this, both `field_name` and `field_value` are invalid — ownership moved.

---

### Updating Hash Maps

#### Overwriting a Value

```rust
scores.insert(String::from("Blue"), 25);
```

This replaces the old value.

---

#### Inserting Only If Key Doesn’t Exist

```rust
scores.entry(String::from("Yellow")).or_insert(50);
scores.entry(String::from("Blue")).or_insert(50);
```

* `entry()` returns an enum `Entry`.
* `or_insert()` inserts only if the key is missing.

---

#### Updating Based on Old Value

```rust
let text = "hello world wonderful world";
let mut map = HashMap::new();

for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}
println!("{:?}", map);
```

This is a **word counter** using HashMap.

---

## Chapter Summary

* **Vectors**: Store lists of elements of the same type.
* **Strings**: Collections of UTF-8 bytes — safe, explicit, and owned.
* **HashMaps**: Store key-value pairs with full control over ownership and updates.

Each of these collections interacts with **ownership** and **borrowing** rules differently, but consistently. Rust’s rules guarantee that you can never have dangling references or memory leaks.
