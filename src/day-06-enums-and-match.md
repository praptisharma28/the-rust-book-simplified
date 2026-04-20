## Day 6 - Chapter 5: Structs

This chapter introduces **structs**, one of Rust’s most important features for defining custom data types. Structs let you group related data together, providing a foundation for organized, idiomatic Rust code.
From the book, we will cover:

<img width="257" height="104" alt="Screenshot 2025-10-21 at 3 38 45 PM" src="https://github.com/user-attachments/assets/de9baef3-7177-4c84-94fe-46b8289f6d6b" />

---

## 1. What Are Structs?

Structs (short for *structures*) group related data together under one name.
They’re like named tuples, but each field has a name, making code more readable.
Structs are similar to objects in OOP — they hold data, and you can define methods for them.

### Example

```rust
struct User {
    active: bool,
    username: String,
    email: String,
    sign_in_count: u64,
}
```

---

## 2. Creating Instances of Structs

Once defined, create instances as follows:

```rust
fn main() {
    let user1 = User {
        email: String::from("someone@example.com"),
        username: String::from("someusername123"),
        active: true,
        sign_in_count: 1,
    };
}
```

Field order doesn’t matter because fields are explicitly named.

### Accessing Fields

```rust
println!("{}", user1.email);
```

If the struct is mutable:

```rust
let mut user1 = User {
    email: String::from("someone@example.com"),
    username: String::from("someusername123"),
    active: true,
    sign_in_count: 1,
};

user1.email = String::from("anotheremail@example.com");
```

The whole struct must be mutable; individual fields cannot be selectively mutable.

---

## 3. Returning Structs from Functions

You can return structs from functions:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username: username,
        email: email,
        sign_in_count: 1,
    }
}
```

---

## 4. Field Init Shorthand

Rust provides shorthand syntax when field names and variable names are identical:

```rust
fn build_user(email: String, username: String) -> User {
    User {
        active: true,
        username,
        email,
        sign_in_count: 1,
    }
}
```

---

## 5. Struct Update Syntax

You can reuse fields from another instance using `..`:

```rust
let user2 = User {
    email: String::from("another@example.com"),
    ..user1
};
```

This copies or moves fields from `user1`.
Ownership of non-`Copy` types (like `String`) moves, making `user1` partially invalid afterward.

---

## 6. Tuple Structs

Tuple structs are like tuples but have unique types:

```rust
struct Color(i32, i32, i32);
struct Point(i32, i32, i32);

fn main() {
    let black = Color(0, 0, 0);
    let origin = Point(0, 0, 0);
}
```

Even though both contain three `i32`s, they’re distinct types. You can destructure them:

```rust
let Point(x, y, z) = origin;
```

---

## 7. Unit-Like Structs

Structs with no fields:

```rust
struct AlwaysEqual;

fn main() {
    let subject = AlwaysEqual;
}
```

Used when you need to implement traits but store no data.

---

## 8. Ownership in Structs

If a struct owns its data (using `String`), it owns everything inside.
If fields are references (`&str`), you must define **lifetimes**, which come later in Chapter 10.
For now, prefer `String`.

---

## 9. Borrowing Struct Fields

You can borrow individual fields:

```rust
struct Point { x: i32, y: i32 }

fn main() {
    let mut p = Point { x: 0, y: 0 };
    let x = &mut p.x;
    *x += 1;
    println!("{}, {}", p.x, p.y);
}
```

However, you cannot borrow the whole struct immutably while a field is mutably borrowed:

```rust
fn print_point(p: &Point) {
    println!("{}, {}", p.x, p.y);
}

fn main() {
    let mut p = Point { x: 0, y: 0 };
    let x = &mut p.x;
    print_point(&p); // Error
}
```

---

## 10. Example: Rectangle Area

### (a) Using Separate Variables

```rust
fn main() {
    let width1 = 30;
    let height1 = 50;

    println!(
        "The area of the rectangle is {} square pixels.",
        area(width1, height1)
    );
}

fn area(width: u32, height: u32) -> u32 {
    width * height
}
```

### (b) Using Tuples

```rust
fn main() {
    let rect1 = (30, 50);

    println!(
        "The area of the rectangle is {} square pixels.",
        area(rect1)
    );
}

fn area(dimensions: (u32, u32)) -> u32 {
    dimensions.0 * dimensions.1
}
```

### (c) Using Structs

```rust
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    println!("The area is {} square pixels.", area(&rect1));
}

fn area(rectangle: &Rectangle) -> u32 {
    rectangle.width * rectangle.height
}
```

This approach gives clear meaning to data and avoids ownership transfer.

---

## 11. Printing Structs with Debug

Printing structs directly gives an error because `Display` isn’t implemented.
Use `#[derive(Debug)]` and `{:?}` for debug printing:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    println!("rect1 is {rect1:?}");
}
```

Pretty-print with `{:#?}`.

---

## 12. Using the `dbg!` Macro

`dbg!` prints file name, line number, and value to stderr:

```rust
#[derive(Debug)]
struct Rectangle { width: u32, height: u32 }

fn main() {
    let scale = 2;
    let rect1 = Rectangle { width: dbg!(30 * scale), height: 50 };
    dbg!(&rect1);
}
```

It takes ownership of its expression unless you use `&`.

---

## 13. Derive Attributes

`#[derive(Debug)]` is one of many traits you can auto-implement. Others include `Clone`, `Copy`, `PartialEq`, `Eq`, `Hash`, and `Default`.

---

## Defining Methods on Structs

Instead of external functions, you can define **methods** inside an `impl` block:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}
```

Call with method syntax:

```rust
rect1.area();
```

---

### Why `&self`?

* `self` — takes ownership
* `&self` — immutable borrow (read-only)
* `&mut self` — mutable borrow (allows modification)

`&self` is most common since most methods read data without modifying it.

---

### Methods with Parameters

You can add extra parameters:

```rust
impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

---

### Associated Functions

Functions without `self` are called **associated functions** and are called using `::`:

```rust
impl Rectangle {
    fn square(size: u32) -> Self {
        Self { width: size, height: size }
    }
}

let sq = Rectangle::square(10);
```

---

### Multiple `impl` Blocks

You can define multiple `impl` blocks for better organization.

---

### Method Call Sugar

Rust automatically handles references and ownership:

```rust
rect1.area();
```

is equivalent to:

```rust
Rectangle::area(&rect1);
```

Rust automatically adds `&`, `&mut`, or moves ownership as needed.

---

### Ownership and Methods

* `&self` → reads data
* `&mut self` → modifies data
* `self` → consumes the instance

Example:

```rust
impl Rectangle {
    fn area(&self) -> u32 { self.width * self.height }
    fn set_width(&mut self, width: u32) { self.width = width; }
    fn max(self, other: Self) -> Self {
        Rectangle {
            width: self.width.max(other.width),
            height: self.height.max(other.height),
        }
    }
}
```

---

### The “Cannot Move Out of *self” Error

If you try to move out of `*self` in a method that takes `&mut self`, Rust will error to prevent unsafe behavior.
If all fields are `Copy`, you can derive `Copy` and `Clone`:

```rust
#[derive(Copy, Clone)]
struct Rectangle {
    width: u32,
    height: u32,
}
```

---

## Summary

| Concept                     | Description                                                         |
| --------------------------- | ------------------------------------------------------------------- |
| Struct                      | Defines a custom type grouping related values                       |
| Field init shorthand        | Allows concise initialization when variable and field names match   |
| Struct update syntax (`..`) | Reuses fields from another instance                                 |
| Tuple struct                | Struct without field names but unique type                          |
| Unit-like struct            | Struct with no fields                                               |
| Owned data                  | Prefer `String` for owned fields                                    |
| Borrowing                   | Use references to avoid ownership transfer                          |
| Debug printing              | Use `#[derive(Debug)]` and `{:?}`                                   |
| `dbg!()` macro              | Prints file, line, and value for debugging                          |
| Method                      | Function defined inside an `impl` block                             |
| `self` forms                | `self`, `&self`, `&mut self` for ownership control                  |
| Associated function         | Function without `self`, called with `::`                           |
| Automatic referencing       | Rust automatically adds `&` or `&mut` for methods                   |
| Ownership in methods        | `&self` reads, `&mut self` modifies, `self` consumes                |
| `Copy` and `Clone`          | Enable safe duplication of structs                                  |
| Organization                | Grouping logic in `impl` blocks improves readability and modularity |

---

# Method Syntax in Rust

---

### What Are Methods?

Methods in Rust are *functions associated with a type* (like structs, enums, or traits).
They are declared with the `fn` keyword just like normal functions, but with two key differences:

1. They are defined **inside an `impl` block** (short for *implementation*).
2. Their **first parameter is always `self`**, which represents the instance of the type on which the method is called.

This `self` lets methods operate on data *inside* the struct — similar to how methods work in object-oriented languages, but with Rust’s safety and ownership guarantees.

---

## Defining Methods on Structs

Let’s take a simple struct:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}
```

Earlier, we had a *standalone function* that took a `Rectangle` as a parameter to compute its area.
Now, we’ll instead make it a *method* defined directly on the `Rectangle` struct:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}
```

Now we can call it like this:

```rust
fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    println!(
        "The area of the rectangle is {} square pixels.",
        rect1.area()
    );
}
```

Output:

```
The area of the rectangle is 1500 square pixels.
```

---

### How This Works

* `impl Rectangle { ... }` begins an *implementation block*.
* Inside it, `fn area(&self) -> u32` defines a *method*.
* The parameter `&self` means:

  * The method **borrows** the instance immutably.
  * We don’t take ownership.
  * We can *read* its fields but not modify them.

Inside the method body, we use `self.width` and `self.height` —
`self` refers to the instance (`rect1` in our example).

When calling, `rect1.area()` is **method syntax**.
Rust automatically translates this to:

```rust
Rectangle::area(&rect1);
```

That’s why you don’t need to manually pass `rect1` — Rust does it.

---

## Why &self, not self or &mut self?

Rust allows three main forms for the first parameter of methods:

| Syntax      | Ownership          | Meaning              |
| ----------- | ------------------ | -------------------- |
| `&self`     | Borrow (immutable) | Read data only       |
| `&mut self` | Borrow (mutable)   | Modify data          |
| `self`      | Take ownership     | Consume the instance |

You use:

* `&self` → when you just want to read.
* `&mut self` → when you want to modify.
* `self` → when you want to consume or transform it.

Taking ownership (`self`) is rare, used mainly when a method *returns a completely new instance* or *moves* data out of it.

---

## Why Use Methods?

Using methods instead of plain functions:

* Improves organization — related behaviors live together.
* Provides the clean `.method()` syntax.
* Avoids repeating the type everywhere.
* Clearly associates functionality with a type.

---

## Methods and Fields with the Same Name

You can define a method with the same name as a field.
Example:

```rust
impl Rectangle {
    fn width(&self) -> bool {
        self.width > 0
    }
}

fn main() {
    let rect1 = Rectangle {
        width: 30,
        height: 50,
    };

    if rect1.width() {
        println!("The rectangle has a nonzero width; it is {}", rect1.width);
    }
}
```

When you call `rect1.width()`, Rust knows it’s the **method**.
When you use `rect1.width`, Rust knows it’s the **field**.

Methods like this that return a field’s value are called **getters**.
Unlike languages like Java or Python, Rust doesn’t generate getters automatically — you define them yourself.
You’ll learn more about making fields private and exposing public getters in Chapter 7.

---

## Methods with More Parameters

Let’s add another method — one that takes another `Rectangle` as an argument and checks if `self` can contain it.

```rust
impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

Usage:

```rust
fn main() {
    let rect1 = Rectangle { width: 30, height: 50 };
    let rect2 = Rectangle { width: 10, height: 40 };
    let rect3 = Rectangle { width: 60, height: 45 };

    println!("Can rect1 hold rect2? {}", rect1.can_hold(&rect2));
    println!("Can rect1 hold rect3? {}", rect1.can_hold(&rect3));
}
```

Output:

```
Can rect1 hold rect2? true
Can rect1 hold rect3? false
```

Here, we pass `&rect2` and `&rect3` — immutable borrows, since we only read their data.

---

## Associated Functions

Not all functions in an `impl` block need to be methods.
If a function doesn’t take `self` as its first parameter, it’s called an **associated function**.

Example — a constructor-like function:

```rust
impl Rectangle {
    fn square(size: u32) -> Self {
        Self {
            width: size,
            height: size,
        }
    }
}
```

Here:

* `Self` means the same as `Rectangle`.
* This function doesn’t take any instance — it creates one.
* We call it using the `::` syntax:

  ```rust
  let sq = Rectangle::square(3);
  ```

`::` is used for both *associated functions* and *modules* in Rust.

---

## Multiple impl Blocks

A struct can have multiple `impl` blocks.

These two are equivalent:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}
```

You may not need to split them, but it’s valid — and sometimes useful when combining traits, generics, or organization.

---

## Method Calls Are Syntactic Sugar

Rust translates method calls into plain function calls.

Example:

```rust
impl Rectangle {
    fn area(&self) -> u32 {
        self.width * self.height
    }
    fn set_width(&mut self, width: u32) {
        self.width = width;
    }
}
```

Then, these calls:

```rust
let mut r = Rectangle { width: 1, height: 2 };
let area1 = r.area();
let area2 = Rectangle::area(&r);
assert_eq!(area1, area2);

r.set_width(2);
Rectangle::set_width(&mut r, 2);
```

are **identical**.

Rust automatically adds:

* `&` for immutable `self`
* `&mut` for mutable `self`

Unlike C or C++, Rust doesn’t need an arrow operator (`->`).
It dereferences automatically when calling with `.`.

---

## Deeper Dereferencing

Rust even adds as many references/dereferences as needed to match the `self` type.

```rust
let r = &mut Box::new(Rectangle { width: 1, height: 2 });
let area1 = r.area();
let area2 = Rectangle::area(&**r);
assert_eq!(area1, area2);
```

Here:

* `r` is `&mut Box<Rectangle>`
* Rust automatically dereferences `r` and `*Box` until it gets `Rectangle`
* Then it immutably borrows for `area()`

Rust can “downgrade” a mutable reference to a shared one (`&mut` → `&`) when it’s safe,
but it never upgrades `&` to `&mut`.

---

## Methods and Ownership

Let’s see how ownership and borrowing rules apply to methods.

### Example: Three Kinds of Methods

```rust
impl Rectangle {    
    fn area(&self) -> u32 {
        self.width * self.height
    }

    fn set_width(&mut self, width: u32) {
        self.width = width;
    }

    fn max(self, other: Rectangle) -> Rectangle {
        Rectangle { 
            width: self.width.max(other.width),
            height: self.height.max(other.height),
        }
    }
}
```

### Calling These Methods

```rust
let rect = Rectangle { width: 0, height: 0 };
println!("{}", rect.area());

let other_rect = Rectangle { width: 1, height: 1 };
let max_rect = rect.max(other_rect);
```

This is valid — because:

* `rect.area()` borrows immutably.
* `rect.max()` takes ownership (moves `rect`).

---

### Mutability with &mut self

If you try to modify something through an immutable variable:

```rust
let rect = Rectangle { width: 0, height: 0 };
rect.set_width(10);
```

Rust errors:

```
cannot borrow `rect` as mutable, as it is not declared as mutable
```

Fix: declare it `mut`.

```rust
let mut rect = Rectangle { width: 0, height: 0 };
rect.set_width(10); // now OK
```

However, if you then do:

```rust
let rect_ref = &rect;
rect_ref.set_width(20);
```

It fails again — because even though the original `rect` is mutable,
`rect_ref` is an immutable reference.
You can’t call a `&mut self` method through a shared reference.

---

## Moves with `self`

When a method takes `self`, it **moves** the instance.

```rust
let rect = Rectangle { width: 0, height: 0 };
let other = Rectangle { width: 1, height: 1 };
let max_rect = rect.max(other);
println!("{}", rect.area()); // ❌ rect moved
```

Error:

```
borrow of moved value: `rect`
```

That’s because `max` takes ownership of `rect`, so `rect` can’t be used again.

---

## Calling `self` Methods on References

Sometimes, you might want to call a `self`-taking method (`fn consumes(self)`) on a reference —
for example, inside another method that takes `&mut self`:

```rust
fn set_to_max(&mut self, other: Rectangle) {
    *self = self.max(other);
}
```

This fails because `self.max()` tries to move out of `*self`,
but `*self` is borrowed — Rust prevents that move to avoid double-free errors.

---

## Why Rust Prevents Moves from &mut self

Rust disallows moving fields out of borrowed data unless the type implements `Copy`.
Here’s why:

If we derive `Copy`, the method becomes valid:

```rust
#[derive(Copy, Clone)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn max(self, other: Self) -> Self {
        Rectangle { 
            width: self.width.max(other.width),
            height: self.height.max(other.height),
        }
    }

    fn set_to_max(&mut self, other: Rectangle) {
        *self = self.max(other);
    }
}
```

Now `self.max(other)` works because copying doesn’t consume ownership.

---

If `Rectangle` owned heap data like a `String`, automatic copying would lead to **double frees** (two deallocations of the same heap memory).
That’s why Rust doesn’t auto-derive `Copy`. You must do it manually only when it’s safe.

Example of unsafe move (if Rust allowed it):

```rust
struct Rectangle {
    width: u32,
    height: u32,
    name: String,
}

fn set_to_max(&mut self, other: Rectangle) {
    let max = self.max(other);
    drop(*self);
    *self = max;
}
```

Here, both `self.name` and `other.name` would be freed,
and then again when `*self = max` overwrites it — causing **undefined behavior**.
So Rust forbids this move entirely.

---

## Summary

* **Structs** let you create custom types grouping related data.
* **Methods** define behavior tied to those structs.
* **Associated functions** (without `self`) are functions tied to the type itself, often used as constructors.
* **Ownership and borrowing rules** apply the same way for methods:

  * `&self` — shared access.
  * `&mut self` — exclusive mutable access.
  * `self` — ownership transfer.
* Rust’s method syntax (`rect.area()`) is syntactic sugar for plain function calls (`Rectangle::area(&rect)`).
* Rust’s design ensures memory safety even in tricky cases like moving or copying from `self`.

---
In the next file, we will cover enums and pattern matching.
