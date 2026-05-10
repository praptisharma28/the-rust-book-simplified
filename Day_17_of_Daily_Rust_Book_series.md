# Day 17 - Chapter 16: Fearless Concurrency

In this chapter, we will cover:

<img width="275" height="208" alt="Chapter 16 topics" src="https://github.com/user-attachments/assets/ce748d33-7ad9-42b0-bbf1-364f138db21e" />

---

By this point in the book, you've seen how hard Rust works to keep your memory safe. Handling concurrent programming safely and efficiently is one of Rust's core goals — and it approaches it the same way.

**Concurrency** is when multiple tasks are in progress at the same time — your program isn't waiting for one thing to finish before starting another. This can mean tasks truly running in parallel on multiple CPU cores, or a single core switching between tasks rapidly enough to seem simultaneous.

Rust calls this **Fearless Concurrency**. The idea is simple: concurrency bugs should be compile-time errors, not runtime. Once your code compiles, you can be confident it's free from data races and invalid memory access, free from logical errors.

Rust achieves this using two tools you already know: **ownership** and the **type system**.

---

## Key Terms

**Process** — a running instance of a program. The OS manages multiple processes at once.

**Thread** — an independent unit of execution *within* a process. A single program can have multiple threads running simultaneously.

---

## Threads

### Why threads?

Running tasks concurrently using threads can improve performance — a web server handling multiple requests at once, for example. But threads come with well-known problems:

- **Race conditions**
- **Deadlocks**
- **Heisenbugs** (bugs that only appear under very specific timing conditions, nearly impossible to reproduce)

### The 1:1 model

Rust uses a **1:1 model**: one OS thread per Rust thread.

Some crates offer other models (green threads, async, etc.), but the standard library keeps it simple.

---

## Spawning Threads

### `thread::spawn`

To create a new thread, use `thread::spawn`. It takes a closure containing the code the new thread should run.

```rust
use std::thread;
use std::time::Duration;

fn main() {
    thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }
}
```

### `thread::sleep`

`thread::sleep` pauses the current thread for a given duration, giving other threads a chance to run. This is the basic mechanism behind concurrent execution.

> **Important:** When the main thread exits, all spawned threads are shut down immediately — even if they haven't finished running.

In the example above, the spawned thread tries to count to 9, but gets cut off when the main thread finishes at 5.

---

## Waiting for Threads to Finish

To make sure a spawned thread runs to completion, save the return value of `thread::spawn` (a `JoinHandle`) and call `.join()` on it.

```rust
use std::thread;
use std::time::Duration;

fn main() {
    let handle = thread::spawn(|| {
        for i in 1..10 {
            println!("hi number {i} from the spawned thread!");
            thread::sleep(Duration::from_millis(1));
        }
    });

    for i in 1..5 {
        println!("hi number {i} from the main thread!");
        thread::sleep(Duration::from_millis(1));
    }

    handle.join().unwrap(); // waits here until the spawned thread finishes
}
```

Calling `.join()` blocks the current thread until the target thread finishes. Where you place it matters — if you call it before the main thread's work, the main thread just waits and the two don't run concurrently at all.

---

## Using `move` Closures with Threads

If a spawned thread needs data from the main thread, you have to use the `move` keyword.

Why?

- By default, a closure borrows variables from the outer scope.
- But Rust can't guarantee how long the spawned thread will live.
- If the main thread drops the value while the spawned thread still needs it, that's unsafe.
- So Rust refuses to compile.

```rust
// This won't compile
let v = vec![1, 2, 3];
let handle = thread::spawn(|| {
    println!("{v:?}"); // borrows v — Rust rejects this
});
```

The fix is `move`, it transfers ownership of `v` into the closure itself. Now the thread owns the data, and there's no risk of it being dropped out from under the thread.

```rust
let v = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("{v:?}"); // v is now owned by this closure
});
handle.join().unwrap();
```

> **Note:** `move` transfers ownership into the closure. You can't use `v` in the main thread after that.

---

## Message Passing
 
Another way to handle concurrency is **message passing** — threads communicate by sending data to each other instead of sharing it.
 
The core primitive for this in Rust is a **channel**.
 
### Channels
 
A channel is a one-way pipe between two threads: data goes in one end and comes out the other.
 
It has two halves:
- **Transmitter (`tx`)** — the sending end. A thread calls `.send()` on it to push data into the channel.
- **Receiver (`rx`)** — the receiving end. Another thread reads from it to get the data.
Rust's standard library implements channels via `std::sync::mpsc`.
> **mpsc** stands for *multiple producer, single consumer* — you can have multiple transmitters sending into the same channel, but only one receiver on the other end.
 
```rust
use std::sync::mpsc;
 
fn main() {
    let (tx, rx) = mpsc::channel();
}
```
 
`mpsc::channel()` returns a tuple — the first element is the transmitter, the second is the receiver.
 
### Sending and Receiving
 
Move the transmitter into a spawned thread and call `.send()` to pass a value across:
 
```rust
use std::sync::mpsc;
use std::thread;
 
fn main() {
    let (tx, rx) = mpsc::channel();
 
    thread::spawn(move || {
        let val = String::from("hi");
        tx.send(val).unwrap();
    });
 
    let received = rx.recv().unwrap();
    println!("Got: {received}");
}
```
 
`tx.send(val)` returns `Result<T, E>` — it errors if the receiver has already been dropped.
 
On the receiving side, you have two options:

- `rx.recv()` — blocks until a value arrives. Returns `Err` when the channel closes.
- `rx.try_recv()` — returns immediately. `Ok(value)` if something is there, `Err` if not. Use this when the receiver has other work to do.
 
### Ownership Through Channels
 
When you send a value through a channel, ownership transfers to the receiver. Using the value after sending it won't compile:
 
```rust
thread::spawn(move || {
    let val = String::from("hi");
    tx.send(val).unwrap();
    println!("{val}"); // error: val was moved into the channel
});
```
 
This is intentional. Once a value is sent, the receiving thread owns it and may modify or drop it at any time. Using it on the sending side after that point would be unsafe. Rust catches this at compile time.
 
### Sending Multiple Values
 
A thread can send multiple values through a channel. On the receiving end, treating `rx` as an iterator will yield each value as it arrives and stop when the channel closes:
 
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
 
fn main() {
    let (tx, rx) = mpsc::channel();
 
    thread::spawn(move || {
        let vals = vec!["hi", "from", "the", "thread"];
        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });
 
    for received in rx {  // iterates until the channel closes
        println!("Got: {received}");
    }
}
```
 
### Multiple Producers
 
Since `mpsc` allows multiple producers, you can clone the transmitter and give each spawned thread its own copy — all feeding into the same receiver:
 
```rust
use std::sync::mpsc;
use std::thread;
use std::time::Duration;
 
fn main() {
    let (tx, rx) = mpsc::channel();
    let tx2 = tx.clone();
 
    thread::spawn(move || {
        let vals = vec!["hi", "from", "the", "thread"];
        for val in vals {
            tx.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });
 
    thread::spawn(move || {
        let vals = vec!["more", "messages", "for", "you"];
        for val in vals {
            tx2.send(val).unwrap();
            thread::sleep(Duration::from_secs(1));
        }
    });
 
    for received in rx {
        println!("Got: {received}");
    }
}
```
 
Each thread gets its own transmitter clone. All messages converge at the single receiver. The order of output isn't guaranteed — that's concurrency.

---
 
## Shared State
 
Channels work well when threads have clear ownership over the data they pass around. But sometimes multiple threads genuinely need to access the *same* piece of data. For that, Rust gives you shared state concurrency.
 
The key primitive here is the **Mutex**.
 
### Mutex
 
A **Mutex** (*mutual exclusion*) ensures only one thread can access the data inside it at a time. Before a thread can read or modify the data, it must acquire the mutex's **lock**. While one thread holds the lock, all others wait. When it's done, it releases the lock and the next thread can proceed.
 
Think of it as a key to a room — only one person can be inside at a time, and to get in you need the key.
 
In Rust, `Mutex<T>` wraps your data. You don't access the data directly — you go through the mutex.
 
```rust
use std::sync::Mutex;
 
fn main() {
    let m = Mutex::new(5);
 
    {
        let mut num = m.lock().unwrap();
        *num = 6;
    } // lock is released here
 
    println!("m = {m:?}");
}
```
 
`.lock()` blocks the current thread until the lock is available. It returns a `MutexGuard` — a smart pointer that gives you mutable access to the inner value. When the `MutexGuard` goes out of scope, the lock is released automatically. No need to remember to unlock it.
 
`.lock()` returns a `Result` because it can fail — if another thread panicked while holding the lock, the mutex is considered *poisoned* and `.unwrap()` will panic too. For now, `.unwrap()` is fine.
 
### Sharing a Mutex Across Threads
 
To use a `Mutex` across multiple threads, you need shared ownership. `Rc<T>` won't work here — it's not thread-safe. Use `Arc<T>` (**Atomically Reference Counted**) instead:
 
```rust
use std::sync::{Arc, Mutex};
use std::thread;
 
fn main() {
    let counter = Arc::new(Mutex::new(0));
    let mut handles = vec![];
 
    for _ in 0..10 {
        let counter = Arc::clone(&counter);
        let handle = thread::spawn(move || {
            let mut num = counter.lock().unwrap();
            *num += 1;
        });
        handles.push(handle);
    }
 
    for handle in handles {
        handle.join().unwrap();
    }
 
    println!("Result: {}", *counter.lock().unwrap()); // 10
}
```
 
Each thread gets an `Arc` clone — not a clone of the data, just a clone of the pointer. They all point to the same `Mutex`. Final result: `10`.
 
### Watch Out for Deadlocks
 
A **deadlock** happens when two threads each hold a lock that the other needs. Neither can proceed, so both wait forever.
 
```
Thread A holds Lock 1, waiting for Lock 2
Thread B holds Lock 2, waiting for Lock 1
```
 
Rust doesn't save you from deadlocks at compile time — they're a logic problem, not a type problem. The way to avoid them is to always acquire locks in the same order across all threads, and keep the time a lock is held as short as possible.
 
### `Mutex<T>` and Interior Mutability
 
You may notice something familiar here. `Mutex<T>` lets you mutate data through a shared reference — the same idea as `RefCell<T>`, which you may have seen with `Rc<T>`. Both provide **interior mutability**: the ability to mutate data even when you only have a shared reference to the container.
 
The difference is the context they're designed for:
 
- `RefCell<T>` / `Rc<T>` — single-threaded interior mutability
- `Mutex<T>` / `Arc<T>` — multi-threaded interior mutability
The concept is same, but different safety guarantees.

---


## `Send` and `Sync`
 
Throughout this chapter, Rust has been quietly enforcing thread safety on your behalf — refusing to compile code that would let two threads race on the same data, or let a non-thread-safe type cross a thread boundary. The mechanism behind all of that is two marker traits: `Send` and `Sync`.
 
You don't usually implement these yourself. But knowing what they mean makes the compiler's error messages much less mysterious.
 
### `Send`
 
A type is `Send` if ownership of it can be safely transferred to another thread.
 
Almost every Rust type is `Send`. The notable exception is `Rc<T>`. Because `Rc<T>` updates its reference count without any synchronization, cloning it across threads could cause two threads to increment or decrement the count simultaneously — corrupting it. So `Rc<T>` is deliberately *not* `Send`. If you try to move an `Rc<T>` into a spawned thread, the compiler will stop you. That's exactly why `Arc<T>` exists.
 
### `Sync`
 
A type is `Sync` if multiple threads can safely hold references to it at the same time.

- `i32` is `Sync`.
- `Mutex<T>` is `Sync` if `T` is `Send`.
- `Rc<T>` and `RefCell<T>` are not.
 
### Marker Traits
 
`Send` and `Sync` are **marker traits** — they carry no methods. They exist purely to communicate a guarantee to the compiler. Rust uses them to check, at compile time, whether the types in your concurrent code are actually safe to use that way.
 
This is the final piece of how Fearless Concurrency works. Rust doesn't rely on runtime checks or documentation conventions to prevent data races. The type system itself tracks which types are safe to send and share across threads — and rejects your program if they're not.
 
> **Note:** Manually implementing `Send` or `Sync` requires `unsafe` code. It's your way of telling the compiler "I've verified this is safe" when it can't figure that out itself. This is rare, and almost never necessary in practice.
 
---
 
## Summary
 
Rust's approach to concurrency makes it extremely safe and provide a kind of compile-time guarantee. The same ownership rules that prevent memory bugs also prevent data races.
 
To recap what you've covered:

- Use **threads** to run code concurrently. Use `move` closures to safely hand data to a spawned thread.
- Use **channels** (`mpsc`) when threads need to communicate by passing ownership of data.
- Use **`Mutex<T>`** when multiple threads need access to the same data. Wrap it in `Arc<T>` to share it.
- **`Send`** and **`Sync`** are the trait-level guarantees that tie all of it together — enforced automatically by the compiler.

This chapter covered the standard library tools. You'll also see concurrency in crates and **async Rust** — they build on the same `Send` and `Sync` rules.


 
 
