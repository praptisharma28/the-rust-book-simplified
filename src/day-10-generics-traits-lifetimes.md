## Day 10: Chapter 9 — Error Handling

Errors are inevitable in software, and Rust ensures you handle them *before* your program compiles. This makes your code more robust and less prone to runtime crashes. We will cover:

<img width="252" height="106" alt="Screenshot 2025-10-27 at 4 33 21 PM" src="https://github.com/user-attachments/assets/d5fc94f6-afb0-4dd3-9fdf-8186a2a2e195" />

Rust divides errors into two categories:

* **Recoverable errors** – issues like “file not found,” which can be fixed or retried.
* **Unrecoverable errors** – bugs such as accessing memory out of bounds, where the program must stop.

Unlike languages with *exceptions*, Rust uses:

* `Result<T, E>` for recoverable errors
* `panic!` macro for unrecoverable errors

---

### Unrecoverable Errors with `panic!`

When something goes fundamentally wrong, `panic!` stops program execution and prints an error message.

Example:

```rust
fn main() {
    panic!("crash and burn");
}
```

Output:

```
thread 'main' panicked at src/main.rs:2:5: crash and burn
note: run with `RUST_BACKTRACE=1` to display a backtrace
```

You can see where the error occurred and even get a full backtrace using:

```
RUST_BACKTRACE=1 cargo run
```

Rust unwinds the stack (cleans up memory) when panicking, but you can also make your program abort immediately by setting this in `Cargo.toml`:

```toml
[profile.release]
panic = 'abort'
```

Example of a runtime panic:

```rust
fn main() {
    let v = vec![1, 2, 3];
    v[99];
}
```

Rust prevents you from accessing invalid memory, unlike C, where this would be undefined behavior.

---

### Recoverable Errors with `Result<T, E>`

When something might fail (like opening a file), use `Result`.

Example:

```rust
use std::fs::File;

fn main() {
    let greeting_file_result = File::open("hello.txt");
}
```

Here, `File::open` returns:

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

You can match on the result:

```rust
use std::fs::File;

fn main() {
    let greeting_file = match File::open("hello.txt") {
        Ok(file) => file,
        Err(error) => panic!("Problem opening the file: {error:?}"),
    };
}
```

If the file doesn’t exist, this will panic.

---

### Handling Different Kinds of Errors

Sometimes you want to handle errors differently:

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file = match File::open("hello.txt") {
        Ok(file) => file,
        Err(error) => match error.kind() {
            ErrorKind::NotFound => File::create("hello.txt").unwrap(),
            _ => panic!("Problem opening the file: {error:?}"),
        },
    };
}
```

---

### Simplifying with Closures

Instead of multiple `match` expressions:

```rust
use std::fs::File;
use std::io::ErrorKind;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap_or_else(|error| {
        if error.kind() == ErrorKind::NotFound {
            File::create("hello.txt").unwrap_or_else(|error| {
                panic!("Problem creating the file: {error:?}");
            })
        } else {
            panic!("Problem opening the file: {error:?}");
        }
    });
}
```

Cleaner and easier to read.

---

### Shortcuts for Panic on Error: `unwrap` and `expect`

Both are shortcuts for `match`:

```rust
use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt").unwrap();
}
```

Or with a custom error message:

```rust
use std::fs::File;

fn main() {
    let greeting_file = File::open("hello.txt")
        .expect("hello.txt should be included in this project");
}
```

`expect` is preferred because it gives context when debugging.

---

### Propagating Errors

Instead of handling errors immediately, you can pass them up the call stack.

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = match File::open("hello.txt") {
        Ok(file) => file,
        Err(e) => return Err(e),
    };

    let mut username = String::new();

    match username_file.read_to_string(&mut username) {
        Ok(_) => Ok(username),
        Err(e) => Err(e),
    }
}
```

This allows the calling code to decide how to handle the error.

---

### The `?` Operator

A cleaner, shorter way to propagate errors.

```rust
use std::fs::File;
use std::io::{self, Read};

fn read_username_from_file() -> Result<String, io::Error> {
    let mut username_file = File::open("hello.txt")?;
    let mut username = String::new();
    username_file.read_to_string(&mut username)?;
    Ok(username)
}
```

You can even chain:

```rust
fn read_username_from_file() -> Result<String, io::Error> {
    let mut username = String::new();
    File::open("hello.txt")?.read_to_string(&mut username)?;
    Ok(username)
}
```

Or make it a one-liner:

```rust
use std::fs;
use std::io;

fn read_username_from_file() -> Result<String, io::Error> {
    fs::read_to_string("hello.txt")
}
```

---

### Key Takeaways:

* Use `panic!` for unrecoverable errors.
* Use `Result<T, E>` for recoverable errors.
* `unwrap()` and `expect()` are quick but risky; prefer proper error handling.
* Use `?` to propagate errors efficiently.
* Rust enforces handling errors at compile time, ensuring safer code.
