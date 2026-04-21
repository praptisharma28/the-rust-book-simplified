# Understanding Ownership(Part 2)

Today, we will complete:

<img width="222" height="92" alt="Screenshot 2025-10-19 at 9 23 10 PM" src="https://github.com/user-attachments/assets/cf3dfbb1-6df9-4f76-b120-ffb12f9b7d85" />


Now you’ll understand *how to share data without transferring ownership* — safely.

---

## References and Borrowing

Let’s start with the problem Rust solves here.

### Problem: Borrowing Data

Suppose you have this code:

```rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
```

### Explanation:

* `&s1` — this **creates a reference** to `s1`, not a copy.
* The function `calculate_length` takes `s: &String`, meaning “I’ll look at a string, but I won’t own it.”
* Ownership of `s1` is **not transferred**, only borrowed temporarily.
* After the function call, `s1` is still valid — you can still use it.

Output:

```
The length of 'hello' is 5.
```

This is Rust’s borrowing system in action.

---

## References are Immutable by Default

By default, a reference (`&T`) **cannot modify** the value it points to.

Example:

```rust
fn change(some_string: &String) {
    some_string.push_str(", world");
}
```

Compilation error:

```
cannot borrow `*some_string` as mutable, as it is behind a `&` reference
```

This happens because `&String` is an **immutable reference** — you’re not allowed to change the data.

---

## Mutable References

To modify a borrowed value, you must use a **mutable reference** (`&mut`):

```rust
fn main() {
    let mut s = String::from("hello");
    change(&mut s);
    println!("{}", s);
}

fn change(some_string: &mut String) {
    some_string.push_str(", world");
}
```

Output:

```
hello, world
```

### Rules of Mutable References:

1. You can have **only one mutable reference** to a value at a time.
2. You **cannot** have a mutable reference while an immutable one exists.

This avoids **data races** — situations where multiple pointers try to read and write simultaneously.

---

## Compile-Time Safety Example

```rust
let mut s = String::from("hello");

let r1 = &mut s;
let r2 = &mut s;

println!("{}, {}", r1, r2);
```

Error:

```
cannot borrow `s` as mutable more than once at a time
```

Rust prevents this *before* the program even runs.

If you separate lifetimes, it’s fine:

```rust
let mut s = String::from("hello");

{
    let r1 = &mut s;
    println!("{}", r1);
} // r1 goes out of scope here

let r2 = &mut s;
println!("{}", r2);
```

Works — because `r1` is dropped before `r2` begins.

---

## Mixing Mutable and Immutable References

```rust
let mut s = String::from("hello");

let r1 = &s; // immutable
let r2 = &s; // immutable
let r3 = &mut s; // mutable
```

Error:

```
cannot borrow `s` as mutable because it is also borrowed as immutable
```

You can’t have both immutable and mutable references *active* at the same time.

But this works:

```rust
let mut s = String::from("hello");

let r1 = &s;
let r2 = &s;
println!("{} and {}", r1, r2); // both used here

let r3 = &mut s; // r1 and r2 no longer used
println!("{}", r3);
```

Works — after immutable refs are no longer used, the mutable one is allowed.

---

## Dangling References

A **dangling reference** points to data that has been freed — Rust **completely forbids** this.

Example:

```rust
fn dangle() -> &String {
    let s = String::from("hello");
    &s
}
```

Error:

```
returns a reference to data owned by the current function
```

Because `s` is dropped at the end of `dangle`, returning `&s` would make a reference to invalid memory.

Fix:

```rust
fn no_dangle() -> String {
    let s = String::from("hello");
    s
}
```

Now ownership is returned safely.

---

## The Rules of References (Summary)

1. You can have **either one mutable reference** or **any number of immutable references**.
2. References must **always be valid** (no dangling refs).

These two rules are what make Rust’s memory model *safe without garbage collection.*

---

## Next Concept: Slices

Now that you understand ownership and borrowing, slices let you reference a **part** of a collection (like a string or array) without taking ownership.

### Problem Example

You want a function that returns the first word of a string:

```rust
fn first_word(s: &String) -> ?
```

You could find the index of the space, but returning that index isn’t ideal — what if the string changes?

Example:

```rust
let mut s = String::from("hello world");
let word = first_word(&s);
s.clear(); // empties the string
```

Now `word`’s index points to invalid data.

---

## String Slices (`&str`)

A **string slice** is a reference to part of a string.

```rust
let s = String::from("hello world");

let hello = &s[0..5];
let world = &s[6..11];
```

`hello` → "hello"
`world` → "world"

The syntax `[start..end]` uses **byte indices**.

Shorthand:

* `&s[..2]` means “from 0 to 2”.
* `&s[3..]` means “from 3 to end”.
* `&s[..]` means “the whole string”.

---

## Slices as Function Parameters

Now fix the earlier problem:

```rust
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();

    for (i, &item) in bytes.iter().enumerate() {
        if item == b' ' {
            return &s[0..i];
        }
    }

    &s[..]
}
```

Works for both `String` and string literals:

```rust
let my_string = String::from("hello world");
let word = first_word(&my_string[..]);

let my_literal = "hello world";
let word = first_word(my_literal);
```

---

## String Slices Prevent Errors

If you use the slice version:

```rust
let mut s = String::from("hello world");
let word = first_word(&s);
s.clear(); // ERROR!
```

Compile-time error — can’t mutate while a slice exists.
Rust automatically prevents invalid references!

---

## Other Slices — Arrays

Slices aren’t just for strings:

```rust
let a = [1, 2, 3, 4, 5];
let slice = &a[1..3];

assert_eq!(slice, &[2, 3]);
```

`slice` type: `&[i32]`
It borrows a section of the array safely.

---

## Key Takeaways

| Concept                          | Description                                       |
| -------------------------------- | ------------------------------------------------- |
| **Reference (`&T`)**             | Borrow data immutably                             |
| **Mutable Reference (`&mut T`)** | Borrow data mutably                               |
| **Borrowing Rules**              | Either multiple immutable refs OR one mutable ref |
| **Dangling Ref**                 | Forbidden — data must live long enough            |
| **Slice (`&[T]` or `&str`)**     | Borrow part of data without ownership             |
| **Compiler Enforcement**         | Borrow checker ensures safety at compile time     |

---

## Final Summary

> Rust prevents memory errors by enforcing ownership, lifetimes, and borrowing rules at **compile time**, not runtime.

You’ve now learned:

* Shared vs mutable borrowing
* Reference rules and lifetimes
* Slices for partial borrowing
* How the borrow checker ensures safe memory access

---

## Ownership Recap

This chapter ties together everything we’ve learned about **ownership**, **borrowing**, and **slices**, while also comparing Rust’s memory management model to **garbage collection (GC)** used in other languages. It also clarifies concepts like the **stack vs heap**, **pointers**, and how Rust avoids **undefined behavior** without using a garbage collector.

---

### Why Ownership Exists

In programming, data in memory must eventually be cleaned up (freed) after it’s no longer needed.
Languages handle this in two main ways:

1. **Garbage Collection (GC):** Memory is managed automatically by a background process.
2. **Ownership (Rust’s approach):** Memory is managed at **compile time** using strict rules.

Ownership gives you **control and safety without a garbage collector**, which leads to better performance and predictability.

---

## Ownership vs Garbage Collection

Let’s compare how memory management works in **Python (GC)** versus **Rust (Ownership)**.

---

### What is Garbage Collection?

In languages like **Python**, **Java**, **Go**, or **JavaScript**, memory is automatically managed by a **garbage collector** (GC).

Here’s what happens:

* The program allocates memory for data while running.
* The **GC periodically scans memory** to find objects that are no longer being used.
* Once it confirms that no variable refers to a piece of data anymore, it **frees** that memory.

#### Advantages of GC

* Easy for developers — no need to manually manage memory.
* Avoids “use-after-free” bugs (accessing freed memory).
* Prevents some types of memory leaks automatically.

#### Drawbacks of GC

* **Performance overhead:** The GC has to pause and scan memory. This can slow down execution or cause unpredictable “stop-the-world” moments.
* **Unpredictable behavior:** You never know *exactly* when something will be cleaned up.
* **Hidden data sharing:** It’s often unclear which variables point to the same data, causing side effects.

---

### Example: Garbage Collection in Python

Let’s take an example in Python that demonstrates this issue.

```python
class Document:
    def __init__(self, words: list[str]):
        """Create a new document"""
        self.words = words

    def add_word(self, word: str):
        """Add a word to the document"""
        self.words.append(word)

    def get_words(self) -> list[str]:
        """Return the list of words"""
        return self.words

# Create a list and two documents
words = ["Hello"]
d = Document(words)

d2 = Document(d.get_words())  # shares same list
d2.add_word("world")
```

---

### What’s Happening Here

Let’s answer two important questions:

#### 1. When is the memory freed?

There are **three references** to the same `["Hello"]` list:

* `words`
* `d.words`
* `d2.words`

Python will only deallocate (free) that list **after all three references go out of scope.**

So, you cannot predict *exactly* when the data will be freed just by reading the code.
This is **unpredictable memory cleanup**.

#### 2. What are the contents of `d`?

Both `d` and `d2` point to the **same list** in memory!
So when we do:

```python
d2.add_word("world")
```

It also modifies `d.words`.
Now both show:

```python
["Hello", "world"]
```

This is a **shared mutable reference** — it can easily cause unexpected bugs.
You didn’t intend to mutate `d`, but you did!

---

### Hidden Pointers

Even though Python doesn’t explicitly use the word “pointer,” every object is actually stored **on the heap**, and variables hold **references (pointers)** to them.

This makes it **hard to see which variable points to what**, leading to side effects like the one above.

---

## Rust’s Approach: Ownership Model

Rust makes these ideas **explicit and predictable** using ownership and borrowing rules.
Let’s recreate the same `Document` idea in Rust:

```rust
type Document = Vec<String>;

fn new_document(words: Vec<String>) -> Document {
    words
}

fn add_word(this: &mut Document, word: String) {
    this.push(word);
}

fn get_words(this: &Document) -> &[String] {
    this.as_slice()
}
```

---

### What’s Different Here?

Let’s look closely at how each function behaves.

---

#### `new_document`

```rust
fn new_document(words: Vec<String>) -> Document {
    words
}
```

* This function **takes ownership** of the `Vec<String>` (`words`).
* When we call `new_document`, the ownership of the vector moves into the function.
* When the `Document` goes out of scope, Rust automatically **drops (frees)** the memory.
* This is **predictable cleanup** — at the exact end of the owner’s lifetime.

---

#### `add_word`

```rust
fn add_word(this: &mut Document, word: String) {
    this.push(word);
}
```

* We pass a **mutable reference** `&mut Document`, so we can modify it safely.
* The function **takes ownership** of the `word`, ensuring no other variable can use it after.
* No other code can mutate `this` at the same time — Rust enforces this at compile time.

---

#### `get_words`

```rust
fn get_words(this: &Document) -> &[String] {
    this.as_slice()
}
```

* This function returns an **immutable reference** to the list of words.
* You can **read** the contents, but not modify them.
* You also cannot accidentally “leak” mutable references that allow unwanted changes.

---

## Example in Rust

Now let’s translate the Python example completely:

```rust
fn main() {
    let words = vec!["hello".to_string()];
    let d = new_document(words);

    // Clone (deep copy) the contents of `d`
    let words_copy = get_words(&d).to_vec();
    let mut d2 = new_document(words_copy);

    add_word(&mut d2, "world".to_string());

    // Verify that d was not affected
    assert!(!get_words(&d).contains(&"world".into()));
}
```

---

### Explanation

* `words` is moved into `d` → `d` now owns the memory.
* `get_words(&d)` returns a reference (a “view”) of the data, not ownership.
* `.to_vec()` clones each `String` — now `d2` has its *own copy*.
* Modifying `d2` does not affect `d`.

No accidental sharing.
No undefined behavior.
Predictable cleanup and performance.

---

## Summary — Garbage Collection vs Ownership

| Aspect             | Garbage Collection (Python/Java)    | Ownership (Rust)                                |
| ------------------ | ----------------------------------- | ----------------------------------------------- |
| **Memory cleanup** | Done automatically at runtime by GC | Done automatically when owner goes out of scope |
| **Performance**    | Overhead due to GC scanning         | No GC overhead, compile-time guarantees         |
| **Predictability** | Cleanup timing unpredictable        | Fully predictable                               |
| **Safety**         | Avoids unsafe access at runtime     | Enforced safety at compile time                 |
| **Data sharing**   | Implicit and hidden                 | Explicit via `&` and `&mut`                     |
| **Mutability**     | Allowed anywhere                    | Controlled via borrowing rules                  |

---

## The Core Concepts of Ownership (Quick Recap)

Let’s recall the three key rules:

1. **Each value in Rust has a single owner.**
2. **When the owner goes out of scope, the value is dropped (freed).**
3. **There can only be one mutable reference OR any number of immutable references at a time.**

These rules guarantee **memory safety** without runtime overhead.

---

### Borrowing and References

* **Immutable reference (`&T`):** Lets you read data without taking ownership.
* **Mutable reference (`&mut T`):** Lets you modify data, but only one can exist at a time.
* **Dangling references** are prevented at compile time.

---

### Stack vs Heap (Recap)

* **Stack:** Fast memory for small, fixed-size data (like integers).
* **Heap:** Slower memory for dynamic data (like `Vec`, `String`, etc).
* Rust automatically decides where to store data, but **ownership** ensures heap data is properly freed.

---

## Final Takeaway

Rust doesn’t remove memory management — it just **moves it from runtime to compile-time**.

If you’ve used other programming languages, you’ve already dealt with memory and pointers — just indirectly. Rust makes them **visible and safe**, so you can:

* Predict exactly when cleanup happens,
* Avoid garbage collection overhead,
* Prevent unintended data mutations,
* And write faster, safer, more reliable code.

Finally, we are done with ownership. Will move to stucts in day 6.
---

### Summary Quote

> “If Rust is not your first language, then you’ve already worked with memory and pointers —
> Rust just makes those ideas explicit, predictable, and safe.”
