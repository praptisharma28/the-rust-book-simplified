# Day 14 - Chapter 13: Functional Language Features (Closures and Iterators)

In this chapter, we will cover:

<img width="338" height="266" alt="Screenshot 2026-04-20 230557" src="https://github.com/user-attachments/assets/b086cdf8-30cf-46e9-98d0-6d6ca8fc095f" />

---

## 1. Closures: A Quick Introduction

A closure is a small anonymous function.
You can:

- Save it in a variable
- Pass it to another function
- Call it later

Example:

```rust
let add_one = |x: i32| -> i32 {
    x + 1
};

let n = add_one(41);
assert_eq!(n, 42);
```

Short version:

```rust
let add_one = |x| x + 1;
```

Rust often infers closure types automatically.

---

## 2. Why Closures Are Special

Normal `fn` functions do not automatically capture local variables.
Closures can capture values from where they are created.

Rust Book style example:

```rust
user_preference.unwrap_or_else(|| self.most_stocked())
```

Here the closure `|| self.most_stocked()` uses `self` from outer scope.

That is the superpower of closures.

---

## 3. Closure Type Inference Rule

A closure gets one concrete type per parameter and return.
After inference, that closure keeps those types.

Example:

```rust
let identity = |x| x;

let s = identity(String::from("hello"));
let n = identity(5); // error
```

Why this fails:

- First call sets closure type to `String -> String`
- Second call tries to use `i32`

So this closure is not generic over all types.

---

## 4. How Closures Capture Values

Closures capture values in 3 ways:

1. Immutable borrow (`&T`)
2. Mutable borrow (`&mut T`)
3. Move ownership (`T`)

### Immutable borrow example

```rust
let list = vec![1, 2, 3];
let show = || println!("{list:?}");

show();
show();
```

### Mutable borrow example

```rust
let mut list = vec![1, 2, 3];
let mut add = || list.push(7);

add();
println!("{list:?}");
```

### Move ownership example

```rust
use std::thread;

let list = vec![1, 2, 3];

thread::spawn(move || {
    println!("From thread: {list:?}");
})
.join()
.unwrap();
```

`move` is commonly used in threads.

---

## 5. `FnOnce`, `FnMut`, `Fn`

Rust uses these traits to classify closures.

- `FnOnce`: closure can be called once
- `FnMut`: closure can be called many times and can mutate captured values
- `Fn`: closure can be called many times and does not mutate captured values

Important: all closures implement at least `FnOnce`.

Example from standard library (`unwrap_or_else`):

```rust
pub fn unwrap_or_else<F>(self, f: F) -> T
where
    F: FnOnce() -> T
```

It uses `FnOnce` because the closure is called at most once.

---

## 6. Iterators: Processing Items One by One

Iterator means an object that yields items one at a time.

Rust iterators are lazy.
Lazy means they do nothing until consumed.

Create iterator:

```rust
let v = vec![1, 2, 3];
let it = v.iter();
```

Use it:

```rust
for x in v.iter() {
    println!("{x}");
}
```

`for` loop uses iterators under the hood.

---

## 7. The `Iterator` Trait and `next`

Core shape:

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

- `Item` is the yielded type
- `next()` returns `Some(item)` until finished
- then it returns `None`

Example:

```rust
let v = vec![1, 2, 3];
let mut it = v.iter();

assert_eq!(it.next(), Some(&1));
assert_eq!(it.next(), Some(&2));
assert_eq!(it.next(), Some(&3));
assert_eq!(it.next(), None);
```

`next` takes `&mut self` because iterator state moves forward each call.

---

## 8. `iter`, `iter_mut`, `into_iter`

Very important difference:

- `iter()` gives `&T`
- `iter_mut()` gives `&mut T`
- `into_iter()` gives `T` (takes ownership)

Examples:

```rust
let v = vec![1, 2, 3];
for x in v.iter() {
    // x: &i32
}
```

```rust
let mut v = vec![1, 2, 3];
for x in v.iter_mut() {
    *x += 10;
}
```

```rust
let v = vec![String::from("a"), String::from("b")];
for s in v.into_iter() {
    // s: String
}
```

---

## 9. Consuming Methods vs Adapter Methods

Iterator methods are usually of two kinds.

### Consuming methods

These consume iterator and return final value.

Example:

```rust
let v = vec![1, 2, 3];
let total: i32 = v.iter().sum();
assert_eq!(total, 6);
```

Common consuming methods:

- `sum`
- `count`
- `collect`
- `find`
- `fold`

### Adapter methods

These return another iterator (still lazy).

Common adapter methods:

- `map`
- `filter`
- `enumerate`
- `zip`
- `take`

Example:

```rust
let v1 = vec![1, 2, 3];
let v2: Vec<_> = v1.iter().map(|x| x + 1).collect();
assert_eq!(v2, vec![2, 3, 4]);
```

If you only do this:

```rust
v1.iter().map(|x| x + 1);
```

it does nothing because it is not consumed.

---

## 10. Closures + Iterators Together

Many iterator methods take closures.
This makes code concise and expressive.

Example:

```rust
#[derive(PartialEq, Debug)]
struct Shoe {
    size: u32,
    style: String,
}

fn shoes_in_size(shoes: Vec<Shoe>, shoe_size: u32) -> Vec<Shoe> {
    shoes
        .into_iter()
        .filter(|s| s.size == shoe_size)
        .collect()
}
```

The closure captures `shoe_size` from environment.

---

## 11. Real Project Improvement (`minigrep`)

Chapter 13 improves Chapter 12 code in two useful places.

### 11.1 Remove unnecessary `clone`

Take iterator directly instead of borrowing a slice and cloning strings.

```rust
impl Config {
    fn build(mut args: impl Iterator<Item = String>) -> Result<Config, &'static str> {
        args.next();

        let query = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a query string"),
        };

        let file_path = match args.next() {
            Some(arg) => arg,
            None => return Err("Didn't get a file path"),
        };

        let ignore_case = std::env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

### 11.2 Rewrite search using iterator pipeline

```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    contents
        .lines()
        .filter(|line| line.contains(query))
        .collect()
}
```

This is simpler than manual loop + mutable vector.

---

## 12. Performance: Loops vs Iterators

Rust Book benchmark shows loop and iterator versions perform similarly.

Why?

- Rust heavily optimizes iterator chains
- Iterators are a zero-cost abstraction

Meaning: higher-level style without runtime penalty.

---

## 13. Common Mistakes

1. Forgetting laziness

```rust
v.iter().map(|x| x + 1); // does nothing by itself
```

2. Using wrong iterator kind

- Need ownership? use `into_iter()`
- Need references? use `iter()`

3. Accidentally moving captured values in closure

- Then closure may become `FnOnce`
- Some APIs require `FnMut` or `Fn`

---

## 14. Before We Go Deeper

So far, we have covered the core idea of closures and iterators.
Now let’s go one step deeper with practical patterns that appear often in real Rust code.

In the next sections, we will focus on:

- How `Fn` traits appear in actual APIs
- How to think in data pipelines (`map`, `filter`, `collect`)
- How to build and use your own iterator type

---

## 15. `Fn` Traits in Real APIs (`sort_by_key`)

The `Fn` traits become easier when you see where they are used.

`sort_by_key` calls your closure many times (once per element while sorting), so it needs a closure that can be called repeatedly.

Valid example:

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

fn main() {
    let mut list = [
        Rectangle { width: 10, height: 1 },
        Rectangle { width: 3, height: 5 },
        Rectangle { width: 7, height: 12 },
    ];

    list.sort_by_key(|r| r.width);
    println!("{list:#?}");
}
```

Why this works:

- The closure reads `r.width`
- It does not move captured values out
- It can be called multiple times safely

If a closure moves a captured value out, it becomes `FnOnce`, and that usually fails for `sort_by_key`.

---

## 16. `map` + `filter` + `collect`: Pipeline Mindset

A very common Rust pattern is this 3-step pipeline:

1. Transform (`map`)
2. Keep only what you need (`filter`)
3. Build final collection (`collect`)

Example:

```rust
fn main() {
    let nums = vec![1, 2, 3, 4, 5, 6];

    let result: Vec<i32> = nums
        .iter()
        .map(|x| x * 2)
        .filter(|x| *x > 6)
        .collect();

    assert_eq!(result, vec![8, 10, 12]);
}
```

Read it like a sentence:

"Take numbers, double them, keep those greater than 6, collect into a vector."

---

## 17. Building Your Own Iterator (Custom `Iterator`)

You are not limited to `Vec` iterators.
You can create your own iterator type by implementing `Iterator`.

Example custom counter:

```rust
struct Counter {
    count: u32,
}

impl Counter {
    fn new() -> Self {
        Counter { count: 0 }
    }
}

impl Iterator for Counter {
    type Item = u32;

    fn next(&mut self) -> Option<Self::Item> {
        self.count += 1;

        if self.count < 6 {
            Some(self.count)
        } else {
            None
        }
    }
}

fn main() {
    let mut counter = Counter::new();

    assert_eq!(counter.next(), Some(1));
    assert_eq!(counter.next(), Some(2));
    assert_eq!(counter.next(), Some(3));
    assert_eq!(counter.next(), Some(4));
    assert_eq!(counter.next(), Some(5));
    assert_eq!(counter.next(), None);
}
```

This is exactly how you model custom sequences in Rust.

---

## 18. Combining Custom Iterators with Adapters

Once your type implements `Iterator`, all iterator adapter methods become available.

Example:

```rust
fn main() {
    let sum: u32 = Counter::new()
        .zip(Counter::new().skip(1))
        .map(|(a, b)| a * b)
        .filter(|x| x % 3 == 0)
        .sum();

    assert_eq!(sum, 18);
}
```

This shows the real power of iterators:

- Compose small steps
- Keep logic readable
- Stay efficient

---

## 19. Loop vs Iterator: Which One Should You Pick?

Both are good Rust.
Choose the one that makes intent clearer.

Use iterator style when:

- You are transforming/filtering data
- You want a concise pipeline
- You want less mutable state

Use loop style when:

- You have complex branching
- You need fine-grained control in each iteration
- A loop is easier for beginners on that specific logic

Rust Book performance data supports using iterators confidently.

---

## 20. Practice Tasks

Try these quickly:

1. Write a function that takes `Vec<i32>` and returns squares of even numbers using iterator pipeline.
2. Modify `shoes_in_size` to return shoe styles (`Vec<String>`) instead of `Shoe` objects.
3. Create your own iterator that yields only odd numbers from 1 to 9.
4. Rewrite one `for` loop from your old code using `map` + `filter` + `collect`.

If you can solve these, you have practical command over closures and iterators.

---

## 21. Final Summary

- Closures are anonymous functions that can capture values from their environment.
- Rust classifies closures using `FnOnce`, `FnMut`, and `Fn` based on behavior.
- Iterators are lazy and become useful when consumed.
- Adapter methods (`map`, `filter`, etc.) build pipelines.
- Consuming methods (`collect`, `sum`, etc.) execute pipelines.
- Iterators are zero-cost abstractions, so this style stays performant.

Chapter 13 is the foundation for writing concise, idiomatic, and fast Rust data-processing code.
