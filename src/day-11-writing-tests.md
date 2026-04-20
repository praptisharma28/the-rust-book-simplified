# Chapter 10

We will cover:

<img width="252" height="120" alt="Screenshot 2025-10-27 at 7 51 53 PM" src="https://github.com/user-attachments/assets/8d69faa9-5903-4f52-9d13-751b58df406d" />

## Part 1: Generics, Traits

Rust provides **powerful abstraction tools** that let you write flexible and reusable code **without sacrificing performance**.
The three main concepts we’ll study are:

1. **Generics** — placeholders for types.
2. **Traits** — shared behavior definitions for types.
3. **Lifetimes** — constraints that ensure references remain valid.

---

### Removing Duplication by Extracting a Function

Let’s begin with a simple example before we dive into generics.

Suppose you have a list of integers and want to find the largest number.

```rust
fn main() {
    let number_list = vec![34, 50, 25, 100, 65];

    let mut largest = &number_list[0];

    for number in &number_list {
        if number > largest {
            largest = number;
        }
    }

    println!("The largest number is {largest}");
}
```

This works fine for one list, but if you need to repeat this for multiple lists, you’d duplicate the code.
Instead, you can **extract the logic into a function**:

```rust
fn largest(list: &[i32]) -> &i32 {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}

fn main() {
    let number_list = vec![34, 50, 25, 100, 65];
    let result = largest(&number_list);
    println!("The largest number is {result}");
}
```

Now your logic is reusable.
You’ve abstracted the behavior (finding the largest number) into a **function** that works on *any* list of integers.

---

### Generic Data Types

Now imagine you want to use the same function for **characters** (`char`) or **floating-point numbers** (`f64`).

If you tried to write separate functions:

```rust
fn largest_i32(list: &[i32]) -> &i32 { ... }
fn largest_char(list: &[char]) -> &char { ... }
```

You’d again have duplicated logic.
Generics solve this problem.

---

### Defining a Function with Generics

You can define a function that works for **any comparable type**:

```rust
fn largest<T>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

Here, `T` is a **generic type parameter** — a placeholder for any type.
However, this code will **not compile** yet because the compiler doesn’t know that `T` supports the `>` comparison operator.

To fix this, we add a **trait bound** (we’ll explain traits shortly):

```rust
fn largest<T: PartialOrd>(list: &[T]) -> &T {
    let mut largest = &list[0];
    for item in list {
        if item > largest {
            largest = item;
        }
    }
    largest
}
```

Now, Rust knows that `T` must be a type that implements the **PartialOrd** trait — meaning it supports comparisons like `>`, `<`, `>=`, etc.

---

### Using Generics in Structs

Generics can also be used inside structs.

For example:

```rust
struct Point<T> {
    x: T,
    y: T,
}
```

This means `x` and `y` are of the same type `T`.

Example:

```rust
fn main() {
    let integer = Point { x: 5, y: 10 };
    let float = Point { x: 1.0, y: 4.0 };
}
```

However, this **won’t compile**:

```rust
let wont_work = Point { x: 5, y: 4.0 };
```

because `x` and `y` must have the *same* type.

If you want to allow different types, use multiple generic parameters:

```rust
struct Point<T, U> {
    x: T,
    y: U,
}

fn main() {
    let both_integer = Point { x: 5, y: 10 };
    let integer_and_float = Point { x: 5, y: 4.0 };
}
```

---

### Using Generics in Enums

Enums can also be generic.

You’ve already used them:

```rust
enum Option<T> {
    Some(T),
    None,
}

enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

These allow Option and Result to store any type of value — making them **extremely versatile**.

For instance:

```rust
let some_number = Some(5);
let some_string = Some("hello");
```

`Option<T>` becomes `Option<i32>` and `Option<&str>` here.

---

### Using Generics in Methods

You can also define methods on structs or enums with generics.

For example:

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn x(&self) -> &T {
        &self.x
    }
}
```

Here’s how you use it:

```rust
fn main() {
    let p = Point { x: 5, y: 10 };
    println!("p.x = {}", p.x());
}
```

Notice the syntax:
`impl<T> Point<T>` — this tells Rust that we’re implementing methods for all `Point<T>` types, regardless of the specific `T`.

You can also **restrict** implementations to specific types:

```rust
impl Point<f32> {
    fn distance_from_origin(&self) -> f32 {
        (self.x.powi(2) + self.y.powi(2)).sqrt()
    }
}
```

Now, only `Point<f32>` instances have this method.

---

### Generic Methods with Different Type Parameters

You can define methods that use **different generic parameters** from the struct.

```rust
struct Point<X1, Y1> {
    x: X1,
    y: Y1,
}

impl<X1, Y1> Point<X1, Y1> {
    fn mixup<X2, Y2>(self, other: Point<X2, Y2>) -> Point<X1, Y2> {
        Point {
            x: self.x,
            y: other.y,
        }
    }
}

fn main() {
    let p1 = Point { x: 5, y: 10.4 };
    let p2 = Point { x: "Hello", y: 'c' };

    let p3 = p1.mixup(p2);

    println!("p3.x = {}, p3.y = {}", p3.x, p3.y);
}
```

Output:

```
p3.x = 5, p3.y = c
```

Here, we combined two different `Point` instances into one — reusing type parameters flexibly.

---

### Performance of Generics

Rust’s **generics have zero runtime cost** due to a process called **monomorphization**.

**Monomorphization** means that during compilation, Rust replaces each instance of a generic function or type with a *specific version* for each concrete type it’s used with.

For example, this code:

```rust
let integer = Some(5);
let float = Some(5.0);
```

is turned into:

```rust
enum Option_i32 {
    Some(i32),
    None,
}

enum Option_f64 {
    Some(f64),
    None,
}
```

So at runtime, your program is as efficient as if you’d written all those versions by hand.
Generics cost **nothing** at runtime — they’re purely a compile-time abstraction.

---

### Traits: Defining Shared Behavior

A **trait** defines shared behavior — similar to **interfaces** in other languages.

For example, suppose you have two data types — `NewsArticle` and `SocialPost` — and you want both to provide a summary.

You define a trait:

```rust
pub trait Summary {
    fn summarize(&self) -> String;
}
```

This defines the *signature* of the `summarize` method.
Any type that implements this trait must define its own version of this method.

---

### Implementing a Trait for a Type

You can implement `Summary` for multiple types:

```rust
pub struct NewsArticle {
    pub headline: String,
    pub location: String,
    pub author: String,
    pub content: String,
}

impl Summary for NewsArticle {
    fn summarize(&self) -> String {
        format!("{}, by {} ({})", self.headline, self.author, self.location)
    }
}

pub struct SocialPost {
    pub username: String,
    pub content: String,
    pub reply: bool,
    pub repost: bool,
}

impl Summary for SocialPost {
    fn summarize(&self) -> String {
        format!("{}: {}", self.username, self.content)
    }
}
```

Now both `NewsArticle` and `SocialPost` implement the `Summary` trait, each with its own behavior.

You can call the trait method just like any other method:

```rust
use aggregator::{SocialPost, Summary};

fn main() {
    let post = SocialPost {
        username: String::from("horse_ebooks"),
        content: String::from("of course, as you probably already know, people"),
        reply: false,
        repost: false,
    };

    println!("1 new post: {}", post.summarize());
}
```

## **Part 2: Lifetimes in Rust**

### **1. Understanding Lifetimes**

Lifetimes are a form of **generic parameter** in Rust that describe **how long a reference is valid**.
While type generics (like `<T>`) describe *what kind* of data a function can handle, **lifetime generics** describe *how long* references to that data remain valid.

Rust uses lifetimes to ensure **memory safety without garbage collection**, by checking that **no reference outlives the data it points to**.

Every reference in Rust has an associated lifetime — the scope during which that reference is valid.
In most cases, lifetimes are **inferred automatically** by the compiler, but sometimes we must explicitly annotate them to help the **borrow checker** understand how references relate to each other.

---

### **2. Preventing Dangling References with Lifetimes**

The **main goal** of lifetimes is to prevent **dangling references** — situations where a reference points to memory that no longer exists.

Example (which does *not* compile):

```rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x;
    } // x goes out of scope here
    println!("r: {}", r);
}
```

#### Explanation

* `x` is declared in the **inner scope** and destroyed when the inner scope ends.
* `r` is declared in the **outer scope**, but it references `x`.
* After the inner scope ends, `x` is gone, so `r` would point to invalid memory.

Rust’s **borrow checker** prevents this by rejecting the code with an error like:

```
error[E0597]: `x` does not live long enough
```

---

### **3. The Borrow Checker**

The **borrow checker** analyzes lifetimes of all references to ensure:

> "No reference outlives the data it points to."

Consider lifetimes `'a` and `'b`:

```rust
fn main() {
    let r; // ---------+-- 'a
    {      //          |
        let x = 5; // -+-- 'b
        r = &x;    // |    |
    }      // ------+    |
    println!("r: {r}"); // |
} // ---------------------+
```

Here `'b` (the lifetime of `x`) is **shorter** than `'a` (the lifetime of `r`).
Rust compares these and rejects the code because `r` refers to data that does not live long enough.

---

### **4. Fixing Dangling References**

The correct version ensures that the **data (`x`) outlives the reference (`r`)**:

```rust
fn main() {
    let x = 5;
    let r = &x;
    println!("r: {r}");
}
```

Now, both the data and reference exist in the same scope — safe and valid.

---

### **5. Generic Lifetimes in Functions**

Consider a function to find the longer of two string slices:

```rust
fn main() {
    let string1 = String::from("abcd");
    let string2 = "xyz";

    let result = longest(string1.as_str(), string2);
    println!("The longest string is {result}");
}
```

If you try this implementation:

```rust
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() { x } else { y }
}
```

It fails with an error:

```
error[E0106]: missing lifetime specifier
```

#### Why?

The compiler doesn’t know whether the returned reference comes from `x` or `y`.
Since each reference could have a different lifetime, Rust requires you to **explicitly define their relationship**.

---

### **6. Lifetime Annotation Syntax**

Syntax examples:

```rust
&i32         // reference without lifetime
&'a i32      // reference with lifetime 'a
&'a mut i32  // mutable reference with lifetime 'a
```

Lifetime annotations **don’t change** how long something lives.
They only **describe** how multiple references relate in terms of validity.

---

### **7. Lifetime Annotations in Function Signatures**

We use **angle brackets** to declare lifetimes, just like type parameters.

Example of fixing `longest`:

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() { x } else { y }
}
```

Explanation:

* `'a` is a generic lifetime parameter.
* Both parameters `x` and `y`, and the return value, share the same lifetime `'a`.
* It tells Rust:
  “The returned reference will be valid as long as both `x` and `y` are valid — i.e., the smaller of their lifetimes.”

Now, Rust can verify this and the function compiles safely.

---

### **8. How Lifetimes Relate During Function Calls**

Example where both inputs live long enough:

```rust
fn main() {
    let string1 = String::from("long string is long");

    {
        let string2 = String::from("xyz");
        let result = longest(string1.as_str(), string2.as_str());
        println!("The longest string is {result}");
    }
}
```

✅ Works fine because `string2` lives long enough for the `println!`.

Now, an invalid case:

```rust
fn main() {
    let string1 = String::from("long string is long");
    let result;
    {
        let string2 = String::from("xyz");
        result = longest(string1.as_str(), string2.as_str());
    } // string2 dropped here
    println!("The longest string is {result}");
}
```

❌ Compilation fails because `result` might refer to `string2`, which has gone out of scope.
Rust enforces this strictly, even if we *know* it would refer to `string1` in this case.

---

### **9. Thinking in Terms of Lifetimes**

If a function only depends on one reference’s lifetime, you can limit annotations accordingly:

```rust
fn longest<'a>(x: &'a str, y: &str) -> &'a str {
    x
}
```

Here, `'a` applies only to `x` and the return value. `y` is independent.

---

### **10. Returning References to Local Data (Dangling References)**

Invalid example:

```rust
fn longest<'a>(x: &str, y: &str) -> &'a str {
    let result = String::from("really long string");
    result.as_str()
}
```

This fails because `result` is created inside the function and destroyed when the function ends, leaving a **dangling reference**.
Lifetime annotations can’t fix this; the correct solution is to return **owned data** instead:

```rust
fn longest(x: &str, y: &str) -> String {
    String::from("really long string")
}
```

---

### **11. Lifetimes in Struct Definitions**

When a struct holds **references**, each reference needs a lifetime annotation:

```rust
struct ImportantExcerpt<'a> {
    part: &'a str,
}
```

Example usage:

```rust
fn main() {
    let novel = String::from("Call me Ishmael. Some years ago...");
    let first_sentence = novel.split('.').next().unwrap();
    let i = ImportantExcerpt {
        part: first_sentence,
    };
}
```

This ensures that `ImportantExcerpt` cannot outlive the `String` it borrows from.

---

### **12. Lifetime Elision (Automatic Inference Rules)**

Rust has **lifetime elision rules** that allow omitting explicit lifetimes in common cases.
These are *compiler heuristics* based on frequent patterns.

#### The Three Lifetime Elision Rules

1. **Each input reference gets its own lifetime.**

   ```rust
   fn foo(x: &i32) → fn foo<'a>(x: &'a i32)
   fn foo(x: &i32, y: &i32) → fn foo<'a, 'b>(x: &'a i32, y: &'b i32)
   ```

2. **If there’s exactly one input lifetime, it’s assigned to all output lifetimes.**

   ```rust
   fn foo<'a>(x: &'a i32) -> &'a i32
   ```

3. **If there are multiple input lifetimes and one of them is &self (a method),**
   the lifetime of `self` is assigned to all output lifetimes.

---

#### Applying to an Example

The function:

```rust
fn first_word(s: &str) -> &str {
    // ...
}
```

Follows these rules:

1. Input `&str` gets `'a`.
2. Output lifetime matches input lifetime `'a`.

So effectively:

```rust
fn first_word<'a>(s: &'a str) -> &'a str
```

No explicit annotation is needed because it fits Rust’s rules.

---

### **13. Lifetime Annotations in Method Definitions**

If a struct has lifetimes, you must declare them after `impl`:

```rust
impl<'a> ImportantExcerpt<'a> {
    fn level(&self) -> i32 {
        3
    }
}
```

Here, no explicit lifetime is needed for `self` — elision handles it.

Another example:

```rust
impl<'a> ImportantExcerpt<'a> {
    fn announce_and_return_part(&self, announcement: &str) -> &str {
        println!("Attention please: {announcement}");
        self.part
    }
}
```

Explanation:

* Both inputs (`&self` and `announcement`) get their own lifetimes.
* Because one input is `&self`, the return type takes on `self`’s lifetime (rule 3).
* So no explicit lifetime annotation is required.

---

### **14. The `'static` Lifetime**

The `'static` lifetime indicates that a reference **lives for the entire duration** of the program.

Example:

```rust
let s: &'static str = "I have a static lifetime.";
```

String literals are stored in the **binary**, not on the stack, so they exist for the program’s whole runtime.

However, you should not use `'static` to “force” a reference to compile unless it genuinely has a static lifetime. It’s often better to fix the underlying ownership or scope issue.

---

### **Final Summary**

* Every reference has a **lifetime** (its valid scope).
* Rust’s **borrow checker** ensures no reference outlives its data.
* **Lifetime annotations** describe relationships between references when the compiler cannot infer them automatically.
* **Lifetime elision rules** handle common patterns automatically.
* Lifetimes apply to **functions, structs, and methods** to ensure valid borrowing.
* The **'static lifetime** means data lives for the whole program duration.

Together, **Generics, Traits, and Lifetimes** form the foundation of **safe, reusable, and performant code in Rust** — giving developers the power of abstraction **without sacrificing memory safety or performance.**
