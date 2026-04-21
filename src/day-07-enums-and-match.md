# Day 7 - Enums and Pattern Matching

## 1. Introduction

Enums (short for *enumerations*) allow you to define a type by enumerating its possible **variants** — that is, by explicitly listing all the possible forms a value of that type can take.
While structs group together related data, enums are about defining a type that can represent **exactly one of several possibilities**.

In this chapter, we’ll cover:

<img width="261" height="151" alt="Screenshot 2025-10-22 at 1 00 42 PM" src="https://github.com/user-attachments/assets/e2ec03ce-f037-4f4b-b046-a9ad8635a8ed" />

---

## 2. Defining an Enum

An enum defines a type by enumerating its possible variants.
Example — representing the kind of IP addresses:

```rust
enum IpAddrKind {
    V4,
    V6,
}
```

Now we can create instances:

```rust
let four = IpAddrKind::V4;
let six = IpAddrKind::V6;
```

These variants are namespaced under `IpAddrKind`, so we use the double colon `::` syntax.

We can even define a function that takes any variant:

```rust
fn route(ip_kind: IpAddrKind) {}
route(IpAddrKind::V4);
route(IpAddrKind::V6);
```

---

## 3. Storing Data with Enums

Initially, you might combine structs and enums to store both type and data:

```rust
enum IpAddrKind {
    V4,
    V6,
}

struct IpAddr {
    kind: IpAddrKind,
    address: String,
}

let home = IpAddr {
    kind: IpAddrKind::V4,
    address: String::from("127.0.0.1"),
};
```

However, you can store data **directly inside the enum variant**, making it cleaner:

```rust
enum IpAddr {
    V4(String),
    V6(String),
}

let home = IpAddr::V4(String::from("127.0.0.1"));
let loopback = IpAddr::V6(String::from("::1"));
```

Each variant can even hold **different types** and amounts of data:

```rust
enum IpAddr {
    V4(u8, u8, u8, u8),
    V6(String),
}
```

So enums are more flexible than structs when variants require different kinds of data.

---

## 4. Enum Variants Holding Structs

Enums can even hold other structs or enums:

```rust
struct Ipv4Addr { /* fields omitted */ }
struct Ipv6Addr { /* fields omitted */ }

enum IpAddr {
    V4(Ipv4Addr),
    V6(Ipv6Addr),
}
```

---

## 5. Enums with Multiple Data Types

You can create enums with completely different variant forms:

```rust
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
    ChangeColor(i32, i32, i32),
}
```

Each variant can store different types of values — unit-like, tuple-like, or struct-like.

You can also define methods on enums:

```rust
impl Message {
    fn call(&self) {
        // method body
    }
}

let m = Message::Write(String::from("hello"));
m.call();
```

---

## 6. The `Option` Enum

Rust doesn’t have **null**. Instead, it provides `Option<T>` to represent a value that may or may not exist.

```rust
enum Option<T> {
    None,
    Some(T),
}
```

Examples:

```rust
let some_number = Some(5);
let some_char = Some('e');
let absent_number: Option<i32> = None;
```

`Option<T>` and `T` are different types — this means Rust won’t let you use an `Option<i8>` like an `i8` without handling the `None` case.

For instance, this will not compile:

```rust
let x: i8 = 5;
let y: Option<i8> = Some(5);
let sum = x + y; // ❌ type mismatch
```

This strictness eliminates null pointer errors.

---

## 7. Pattern Matching with `match`

The `match` control flow construct lets you handle all possible variants of an enum safely.

Example:

```rust
enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter,
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => 1,
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

Each arm of the `match` must handle one pattern. The compiler checks that **all cases are covered**.

You can add logic inside an arm:

```rust
fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Penny => {
            println!("Lucky penny!");
            1
        }
        Coin::Nickel => 5,
        Coin::Dime => 10,
        Coin::Quarter => 25,
    }
}
```

---

## 8. Matching and Binding Values

You can extract data from enum variants inside a match.

```rust
#[derive(Debug)]
enum UsState {
    Alabama,
    Alaska,
}

enum Coin {
    Penny,
    Nickel,
    Dime,
    Quarter(UsState),
}

fn value_in_cents(coin: Coin) -> u8 {
    match coin {
        Coin::Quarter(state) => {
            println!("State quarter from {state:?}!");
            25
        }
        _ => 0,
    }
}
```

If we pass `Coin::Quarter(UsState::Alaska)`, it will print “State quarter from Alaska!”

---

## 9. Matching with `Option<T>`

`match` works perfectly with `Option<T>` too.

Example — incrementing an optional integer:

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        None => None,
        Some(i) => Some(i + 1),
    }
}

let five = Some(5);
let six = plus_one(five);
let none = plus_one(None);
```

---

## 10. Matches Must Be Exhaustive

Every possible variant must be handled:

```rust
fn plus_one(x: Option<i32>) -> Option<i32> {
    match x {
        Some(i) => Some(i + 1),
    }
}
```

This will not compile because `None` is not covered. Rust ensures safety by requiring exhaustive matches.

---

## 11. Catch-All Patterns and the `_` Placeholder

You can handle “all other cases” using `_`:

```rust
let dice_roll = 9;

match dice_roll {
    3 => add_fancy_hat(),
    7 => remove_fancy_hat(),
    _ => move_player(dice_roll),
}

fn add_fancy_hat() {}
fn remove_fancy_hat() {}
fn move_player(num_spaces: u8) {}
```

The `_` pattern matches any value not previously handled.

---

## 12. The `if let` Construct

`if let` is a shorthand for handling a single match case when you don’t need full pattern matching:

```rust
let some_u8_value = Some(3);

if let Some(3) = some_u8_value {
    println!("Three");
}
```

This is equivalent to:

```rust
match some_u8_value {
    Some(3) => println!("Three"),
    _ => (),
}
```

`if let` provides a concise, readable alternative when only one pattern matters.

---

## 13. Ownership Inventory #1

This section introduces scenarios inspired by common StackOverflow questions about **ownership** in **Rust**. These focus on **real-world situations** that test your understanding of ownership rules, borrowing, and memory management.

It mentions an **experimental in-browser IDE** that allows you to hover over functions to get more info about unfamiliar functions or types. Here’s a summary of concepts you should be familiar with based on the description:

1. **Memory Usage & Rust Types**:

   * Rust is strict about memory usage and avoids issues like null-pointer dereferencing or undefined behavior (e.g., double-free) by using ownership and borrowing.
   * The IDE functionality mentioned allows you to hover over the function to get detailed type information.

2. **Understanding Borrowing & Ownership**:

   * Ensure you understand when data is **moved** versus when it is **borrowed**. Rust forces you to acknowledge this behavior to prevent accidental memory corruption.

3. **Function/Method Explanations**:

   * The example function `make_exciting` shows how you can replace characters (`.` becomes `!` and `?` becomes `‽`) in a string. You’ll need to **inspect** or interact with the code to understand its **type** and how **ownership works** here.

---

## Summary

* **Structs** group multiple related fields.
* **Enums** define a type that can have one of several variants.
* Enums can store **different data types** in different variants.
* The **Option** enum replaces nulls, ensuring safety at compile time.
* The **match** construct exhaustively handles all cases.
* The **if let** syntax offers a convenient shorthand for simpler matches.
