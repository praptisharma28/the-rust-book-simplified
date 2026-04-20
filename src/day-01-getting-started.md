# **The Rust Programming Language**

* Authors: Steve Klabnik, Carol Nichols, Chris Krycho, and with help from the Rust community.

* The part that will be covered here on day 1 from the official rust book is:

<img width="242" height="208" alt="Screenshot 2025-10-14 at 4 16 33 PM" src="https://github.com/user-attachments/assets/7cb39aee-a7b1-4db8-b00d-116e073e0845" />

### About This Edition

* The book assumes, one is using **Rust 1.85.0 or later**, using the **2024 edition**.
* You set this in your `Cargo.toml` as:

  ```toml
  edition = "2024"
  ```

---

# **Foreword**

Rust is about **empowerment** — helping any programmer write reliable and efficient code confidently.

### Traditional Systems Programming (like C/C++)

Traditionally, systems programming involves *manual memory management* (you have to manually allocate and free memory for data), *concurrency issues* (problems that happen when multiple parts of a program run at the same time), and *hard-to-detect bugs* (errors that are tricky to find). Only a few experts could handle it safely, and even then, crashes or vulnerabilities were common.

Memory management is how a computer keeps track of data your program uses, allocates space for it, and cleans it up when it’s no longer needed.
Concurrency is when a program does multiple things at the same time. It can speed things up but requires coordination to avoid mistakes.

### Rust’s Promise

Rust eliminates most of these traditional pitfalls by:

* Preventing *memory* and *concurrency* errors at compile time (the compiler checks for mistakes before the program runs).
* Giving you **low-level control** over performance (you can manage resources like memory and CPU directly), but without the danger.

You can now “dip down” into low-level control safely — with no crashes, no security holes, and no headaches.

### For Experienced Low-Level Developers

Rust allows you to go even further:

* Introduce **parallelism** safely — the compiler guarantees thread safety (threads are parts of a program that can run simultaneously, and Rust ensures they don’t interfere with each other).
* Optimize aggressively — without fear of introducing new bugs.

### Not Just Low-Level

Rust is also ideal for:

* Command-line applications (programs run from terminal/console)
* Web servers (software that delivers web pages)
* Embedded systems (small computers inside devices like watches, sensors, etc.)

### The Spirit of Rust

Rust is not just a programming language; it is a tool that helps you become a more confident, fearless, and efficient programmer.

---

# **Introduction**

This is the same text as *The Rust Programming Language* published by No Starch Press. Rust is designed to help you write **fast** and **reliable** software. It combines:

* **High-level ergonomics** (easy and convenient to write)
* **Low-level control** (efficient and powerful)

### Who Rust Is For

#### Teams of Developers

* The Rust compiler catches subtle bugs (especially concurrency issues) that might otherwise require complex testing.
* Rust’s tools make collaboration productive:

  * **Cargo** – dependency and build manager (manages libraries and project builds)
  * **Rustfmt** – code formatter (automatically formats your code neatly)
  * **rust-analyzer** – IDE assistance (helps with auto-completion, hints, and error checking)

#### Students

* Excellent for learning memory management, concurrency, and systems-level concepts.
* The community is welcoming and the book makes hard concepts accessible.

#### Companies

Rust is used across many industries for:

* Command-line tools
* Web services
* Embedded and IoT devices (Internet of Things, devices connected to the internet)
* Cryptocurrencies(Solana)
* Machine learning
* Even parts of **Firefox** are written in Rust.

#### Open Source Developers

Rust invites contributions to the language, compiler, libraries, and tooling.

#### People Who Value Speed and Stability

Rust provides **fast code** and **safe abstractions** (high-level constructs that are safe to use but don’t slow down the program).
It avoids “brittle legacy” issues and delivers **zero-cost abstractions** — high-level code that performs as fast as low-level implementations.

### Rust’s Goal

Rust removes the trade-off between **safety and speed**, **productivity and control**.
You can have both.

---

# **1. Getting Started**

---

## **1.1 Installation**

### The Recommended Way — `rustup`

Rust’s official installer and version manager is called **rustup**. It is used to:

* Install Rust
* Update Rust
* Manage toolchains (different versions of Rust for different projects)
* Access documentation

Install Rust by running in your terminal:

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

Follow the on-screen instructions. It installs:

* **rustup** – toolchain manager
* **cargo** – package manager and build system

### Verifying Installation

Restart your terminal and check:

```bash
rustc --version
```

If you see something like:

```
rustc 1.85.0 (or newer)
```

Your installation is complete.

### Windows Users

Rust works on Linux, macOS, and Windows.
On Windows, install [Visual Studio Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/).
If prompted during installation, choose **“Yes”** to install them.

### Keeping Rust Updated

Rust releases updates every 6 weeks.
To update:

```bash
rustup update
```

### Uninstalling Rust

If you ever need to remove it:

```bash
rustup self uninstall
```

---

### Local Documentation

The installation of Rust also includes a local copy of the documentation so that you can read it offline.
Run:

```bash
rustup doc
```

This opens the documentation in your web browser from local files.

Whenever you’re unsure about a type or function from the standard library, consult the API documentation to learn how it works.

---

### Text Editors and Integrated Development Environments (IDEs)

Rust does not assume any particular text editor.
You can use any editor, but modern IDEs provide powerful support.

#### Recommended Editors and IDEs

* Visual Studio Code (with `rust-analyzer`)
* IntelliJ IDEA (Rust plugin)
* Vim/Neovim (with `rust-analyzer` LSP — Language Server Protocol, gives real-time feedback)
* Emacs (`rust-mode` or LSP)
* Sublime Text, Atom, etc.

Rust maintains a current list on its [tools page](https://www.rust-lang.org/tools).

#### What `rust-analyzer` Provides

* Auto-completion (suggests code automatically)
* Inline error checking (shows errors as you type)
* Go-to-definition (jump to function or variable definition)
* Type hints and inline documentation (helps understand types)
* Real-time feedback from the compiler

---

### Working Offline with This Book

Many examples in this book use crates beyond the standard library. (A **crate** is a package of Rust code, like a library in Python or Node.js.)
To work through them offline, download dependencies ahead of time.

Run:

```bash
cargo new get-dependencies
cd get-dependencies
cargo add rand@0.8.5 trpl@0.2.0
```

This caches the crates so you won’t need the internet later.
Once done, you can delete the project:

```bash
cd ..
rm -rf get-dependencies
```

When working offline, use:

```bash
cargo run --offline
```

or

```bash
cargo build --offline
```

This instructs Cargo to use cached crates only.

#### Summary Table

| Task                 | Command                           | Description                              |
| -------------------- | --------------------------------- | ---------------------------------------- |
| Open docs locally    | `rustup doc`                      | Opens local documentation in the browser |
| Create dummy project | `cargo new get-dependencies`      | Pre-caches dependencies                  |
| Add crates           | `cargo add rand@0.8.5 trpl@0.2.0` | Downloads example crates                 |
| Work offline         | `cargo run --offline`             | Builds using cached dependencies only    |

---

## **1.2 Hello, World!**

Now that Rust is installed, you can write your first Rust program.

### Step 1: Create a File

```bash
mkdir hello_world
cd hello_world
touch main.rs
```

### Step 2: Write the Code

In `main.rs`:

```rust
fn main() {
    println!("Hello, world!");
}
```

### Step 3: Run It

Compile and execute:

```bash
rustc main.rs
./main     # macOS/Linux
main.exe   # Windows
```

Output:

```
Hello, world!
```

### Explanation

```rust
fn main() {
```

* `fn` defines a function.
* `main` is the entry point of the program (where execution starts).
* `()` means no parameters.
* `{}` marks the function body.

Inside:

```rust
println!("Hello, world!");
```

* `println!` is a **macro** (special code that generates code, indicated by `!`)
* Prints text to the console
* `"Hello, world!"` is a string literal (text enclosed in quotes)

Rust compiles directly to machine code — no interpreter involved.

---

## **1.3 Hello, Cargo!**

Instead of using `rustc` manually, Rust provides **Cargo**, a powerful build system and package manager.

### What is Cargo?

Cargo is Rust’s:

* Package Manager (like `npm` or `pip`, manages libraries)
* Build Tool (like `make`, compiles the program)
* Project Manager (organizes the files and dependencies)

It handles dependencies, compilation, documentation, and testing.

### Creating a Project with Cargo

Run:

```bash
cargo new hello_cargo
cd hello_cargo
```

Structure created:

```
hello_cargo/
├── Cargo.toml
└── src/
    └── main.rs
```

### Cargo.toml

Configuration file written in **TOML (Tom’s Obvious, Minimal Language, similar to INI files)**.

```toml
[package]
name = "hello_cargo"
version = "0.1.0"
edition = "2024"

[dependencies]
```

Defines:

* Package name
* Version
* Edition
* Dependencies (external libraries)

### src/main.rs

Automatically created with:

```rust
fn main() {
    println!("Hello, world!");
}
```

### Building and Running with Cargo

Build:

```bash
cargo build
```

Run:

```bash
cargo run
```

Check code (faster, without building) :

```bash
cargo check
```

All builds are stored in the `target/` directory.

---

### Building for Release

For optimized builds (faster, smaller binary):

```bash
cargo build --release
```

Output is placed in:

```
target/release/
```

The release build runs faster but takes longer to compile.

---

### Summary of Commands

| Task           | Command                  | Description                        |
| -------------- | ------------------------ | ---------------------------------- |
| Install Rust   | `rustup`                 | Installs & manages Rust toolchains |
| Check version  | `rustc --version`        | Confirms Rust installation         |
| Update Rust    | `rustup update`          | Updates to latest version          |
| Run manually   | `rustc main.rs`          | Compiles to a binary               |
| Create project | `cargo new project_name` | Sets up Cargo project              |
| Build project  | `cargo build`            | Compiles debug version             |
| Run project    | `cargo run`              | Builds and runs the app            |
| Check errors   | `cargo check`            | Checks for errors quickly          |
| Optimize build | `cargo build --release`  | Produces production binary         |

---

✅ Congrats, pat your back, next part is gonna be more amazing, up to this point, you’ve completed:

* The **Foreword**
* The **Introduction**
* **Chapter 1 → Getting Started**, including:

  * 1.1 Installation
  * 1.2 Hello, World!
  * 1.3 Hello, Cargo!
