# Day 13 - Chapter 12: Building a Command Line Program

You've learnt a lot about Rust so far, enough in fact that we can start building our very first project. Consider this a recap of what's been covered so far and a peek into what lies ahead in this book. In this chapter, we will cover:

<img width="338" height="266" alt="Screenshot" src="https://github.com/user-attachments/assets/b086cdf8-30cf-46e9-98d0-6d6ca8fc095f" />

### What, Why, How?

What: We’ll build a CLI tool that replicates the behaviour of a classic Unix utility called `grep` which is said to stand for ***g**lobally search a **re**gular expression and **p**rint*. It's core functionality is to search for a pattern in a file. It takes 2 arguments, first a file path and second a query string to search for. The query string can be any regular expression, they're beyond the scope of this book but you can learn more about them [here]().

Why: Rust is **the** language of command line tools, this is primarily thanks to it's cross-platform support,  single binary output and a brilliant suite of libraries. Even though a fully featured version of `grep` called `ripgrep` has been created by a fellow rustacean, our goal here is to learn which is why we won't be using any external libraries like `clap` which greatly simplifies the process of accepting command line input.

How: We'll be following a pattern you will utilize throughout your programming career. We will write bad code that doesn't compile (pseudo code), then bad code that does compile but doesn't work, then bad code that compiles and works then finally optimize it to be good code that works. Then you rinse and repeat, you don't go from nothing to fully working idiomatic code, the middle is where the magic happens and these layers will reduce as you gain more experience. For your first project, we will go through it together.

You will utilize a lot of concepts we've covered so far about organizing code, handling errors, writing tests and more. We will also use some concepts like iterators and traits that haven't been covered yet, this is also something you will commonly experience as a programmer.

### Taking Input

We will start by creating a new project using `cargo new <project-name>` as always. We'll call our project `tgrep` (tutorial grep) keeping in line with ambiguous acronyms unix loves and to distinguish it from `grep` that you might have on your machine.

```
cargo new tgrep
  Creating binary (application) `tgrep` package
cd tgrep
```

In this section we will focus on making `tgrep` accept and print it's two arguments. The two arguments being the file path and the string to search for.

We will use the `std::env::args` function from the Rust standard library to read the arguments passed to our program. This function returns an iterator over all the arguments provided. We'll learn more about iterators in a following chapter, but for now keep in mind that iterators produce a series of values and there is a method on them called `collect` that can be used to turn the iterator into a collection of all the values the iterator produces.

First, we have to bring the `std::env::args` function into scope, we will instead import the `std::env` module and use the function like so `env::args`. We do this so we can easily utilize other exports from `env`. This also reduces ambiguity since `args` can be mistaken for a function defined in the current module.

NOTE: The `std::env::args` function will panic if any argument contains invalid unicode. If you don't know what that is, no need to worry about it for now.

We will call the `collect`  method on the iterator returned by `args` to get a vector of the passed arguments. `collect` is one of the few functions that frequently needs annotated types because it cannot infer the kind of collection you.

Finally, we print the vector using the `dbg` macro which stands for debug. When we put all of this together, we get:

src/main.rs
```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();
    dbg!(args);
}
```

Now, let's try to run it with no arguments first.

```
cargo run
   Compiling tgrep v0.1.0 (/home/nitishc/progmag/the-rust-book-simplified/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.21s
     Running `target/debug/tgrep`
[src/main.rs:5:5] args = [
    "target/debug/tgrep",
]
```

Notice how even with no arguments supplied, the vector still has a single element. This is the path of the executable which was invoked, it matches the behavior of arguments list in C allowing convenient access to the program name.

Now let's run it with 2 arguments as intended, it is possible to just run `cargo run needle haystack` and that would work but it's good practice to separate arguments for our program by two hyphens so people don't get confused. Let's see what that gives us:

```
cargo run -- needle haystack
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.01s
     Running `target/debug/tgrep needle haystack`
[src/main.rs:5:5] args = [
    "target/debug/tgrep",
    "needle",
    "haystack",
]
```

Perfect! That's what we wanted to see, now let's save those argument values in variables so we can use them throughout the rest of the program.

As we just saw, the first argument is always the path to the executable so we ignore `args[0]` and starting at index 1. The first argument is the query to search for and the second is the file path so we name the variable accordingly and pretty print them.

src/main.rs
```rust
use std::env;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");
}
```

Let's run this program again and see if everything is working as intended.

```
cargo run -- needle haystack.txt
   Compiling tgrep v0.1.0 (/home/nitishc/progmag/the-rust-book-simplified/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.20s
     Running `target/debug/tgrep needle haystack.txt`
Searching for needle
In file haystack.txt
```

Great! The program works exactly as we expect it to. It is very flaky in it's current state as it would panic if less than 2 arguments are supplied but we can ignore that for now, we'll add error handling in a later section. In the section we will working on adding the capability to read a file.

### Reading a File

Now let's read the file specified in the `file_path` argument and print it's contents. First, we need a sample file to test with. We'll use a file with a small amount of text over multiple lines with some repeated words. Let's create a file called `poem.txt` at the root level of your project with this Emily Dickinson poem:

poem.txt
```text
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

With the text in place, let's edit `src/main.rs` and add code to read the file. We need to bring in `std::fs` which handles files.

src/main.rs
```rust
use std::env;
use std::fs;

fn main() {
    let args: Vec<String> = env::args().collect();

    let query = &args[1];
    let file_path = &args[2];

    println!("Searching for {query}");
    println!("In file {file_path}");

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
```

`fs::read_to_string` takes the `file_path`, opens that file, and returns a `Result<String>` that contains the file's contents. For now we're using `expect` which will panic if the file can't be read.

Let's run this code with any string as the first argument and the `poem.txt` file as the second:

```
cargo run -- the poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep the poem.txt`
Searching for the
In file poem.txt
With text:
I'm nobody! Who are you?
Are you nobody, too?
Then there's a pair of us - don't tell!
They'd banish us, you know.

How dreary to be somebody!
How public, like a frog
To tell your name the livelong day
To an admiring bog!
```

Great! The code read and printed the contents of the file. But the code has a few problems. At the moment, the `main` function has multiple responsibilities: it's parsing arguments **and** reading files. As the program grows, this will become harder to maintain. We're also using `expect` for errors, which gives unhelpful panic messages to users. It's best to begin refactoring early, so let's do that next.

### Refactoring to Improve Modularity and Error Handling

To improve our program, we'll fix four problems with the current structure:

1. **`main` does too much** — it parses arguments and reads files. As the program grows, `main` will become a mess.
2. **Configuration is scattered** — `query` and `file_path` are related config values but they're just loose variables.
3. **Bad error messages** — `expect` prints the same generic message regardless of what went wrong (missing file, no permissions, etc.).
4. **Ugly panics for users** — if someone runs the program without enough arguments, they get a raw "index out of bounds" error instead of a friendly message.

#### Separating Concerns in Binary Projects

The problem of `main` doing too much is common in binary projects. Many Rust programmers split their code into `main.rs` and `lib.rs` when `main` starts getting large. Here's the typical pattern:

- Split your program into a `main.rs` file and a `lib.rs` file and move your program's logic to `lib.rs`.
- Keep command line parsing in `main` while it's small.
- When parsing logic gets complicated, extract it into functions or types.

The responsibilities that remain in `main` should be limited to:

- Calling the command line parsing logic
- Setting up configuration
- Calling a `run` function in `lib.rs`
- Handling the error if `run` returns an error

This pattern separates concerns: `main.rs` handles running the program and `lib.rs` handles the logic. Because you can't test `main` directly, this structure lets you test all your program's logic by moving it out of `main`.

#### Extracting the Argument Parser

Let's extract the argument parsing into a function called `parse_config` that `main` will call:

src/main.rs
```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let (query, file_path) = parse_config(&args);

    println!("Searching for {query}");
    println!("In file {file_path}");

    let contents = fs::read_to_string(file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

fn parse_config(args: &[String]) -> (&str, &str) {
    let query = &args[1];
    let file_path = &args[2];

    (query, file_path)
}
```

We're still collecting arguments into a vector, but now `parse_config` holds the logic for mapping arguments to variables. `main` no longer has that responsibility.

This might seem like overkill for our small program, but we're refactoring in small, incremental steps. After making this change, run the program again to verify that argument parsing still works.

#### Grouping Configuration Values

We can take another step to improve `parse_config`. Right now we're returning a **tuple**, but then we immediately break it apart again. That's usually a sign we don't have the right abstraction.

Also, the name `parse_config` implies the two values are related and both part of one configuration value. We should put them into a **struct** with meaningful field names to make their purpose clear:

src/main.rs
```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = parse_config(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

fn parse_config(args: &[String]) -> Config {
    let query = args[1].clone();
    let file_path = args[2].clone();

    Config { query, file_path }
}
```

We've added a `Config` struct with fields `query` and `file_path`. The signature of `parse_config` now indicates it returns a `Config` value.

Notice we're using `.clone()` to create owned `String` values. The `args` variable in `main` owns the argument values and is only letting `parse_config` borrow them. We'd violate Rust's borrowing rules if `Config` tried to take ownership of the values in `args` directly.

**The Trade-Offs of Using `clone`**

Many Rustaceans avoid `clone` because of its runtime cost. In Chapter 13, you'll learn more efficient methods. But for now, it's okay to copy a few strings — your file path and query string are very small. It's better to have a working program that's a bit inefficient than to hyperoptimize on your first pass.

#### Creating a Constructor for Config

Since `parse_config`'s purpose is to create a `Config` instance, we can change it from a plain function to a `new` function associated with the `Config` struct. This is more idiomatic — just like `String::new`, we can create instances with `Config::new`:

src/main.rs
```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::new(&args);

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}

struct Config {
    query: String,
    file_path: String,
}

impl Config {
    fn new(args: &[String]) -> Config {
        let query = args[1].clone();
        let file_path = args[2].clone();

        Config { query, file_path }
    }
}
```

We've moved `parse_config` into an `impl` block and renamed it to `new`. Try compiling this to make sure it works.

#### Fixing the Error Handling

Now let's fix our error handling. Recall that accessing `args[1]` or `args[2]` will **panic** if the vector has fewer than 3 items. Try running the program without arguments:

```
cargo run
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep`

thread 'main' panicked at src/main.rs:27:21:
index out of bounds: the len is 1 but the index is 1
```

"index out of bounds" is a message for programmers, not end users. Let's fix that.

First, let's add a check in `new` that verifies we have enough arguments before accessing them:

src/main.rs
```rust
impl Config {
    fn new(args: &[String]) -> Config {
        if args.len() < 3 {
            panic!("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Config { query, file_path }
    }
}
```

If we run without arguments now:

```
cargo run
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep`

thread 'main' panicked at src/main.rs:26:13:
not enough arguments
```

Better message! But we still get all the extra output about threads and backtraces. As we discussed in Chapter 9, `panic!` is for programming problems, not usage problems. Instead, let's return a `Result` to indicate success or failure.

#### Returning a Result Instead of Calling panic!

We'll change `new` to return a `Result<Config, &'static str>`. We'll also rename it to `build` because many programmers expect `new` to never fail. When `Config::build` communicates to `main`, we can use `Result` to signal problems cleanly:

src/main.rs
```rust
impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        Ok(Config { query, file_path })
    }
}
```

Our `build` function returns a `Result` with a `Config` instance in the success case and a string literal in the error case. Now we need to update `main` to handle this `Result`:

src/main.rs
```rust
use std::process;

fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        println!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    // --snip--
}
```

We've used `unwrap_or_else`, which we haven't covered in detail yet. It's defined on `Result<T, E>` and allows custom, non-panic error handling. If the `Result` is `Ok`, it returns the inner value. If it's `Err`, it calls the closure (the anonymous function between the pipes) with the error value.

We've brought `process` into scope. In the error case, we print the error and call `process::exit(1)`, which stops the program with a nonzero exit code — the convention for signaling errors to the shell.

Let's try it:

```
cargo run
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.48s
     Running `target/debug/tgrep`
Problem parsing arguments: not enough arguments
```

Much friendlier for our users!

#### Extracting Logic from main

Now let's extract all the logic from `main` into a `run` function. When we're done, `main` will be concise and easy to verify, and we'll be able to test all the other logic.

src/main.rs
```rust
fn main() {
    // --snip--

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    run(config);
}

fn run(config: Config) {
    let contents = fs::read_to_string(config.file_path)
        .expect("Should have been able to read the file");

    println!("With text:\n{contents}");
}
```

The `run` function contains all the remaining logic from `main`, starting from reading the file.

#### Returning Errors from run

Let's improve the error handling in `run`, just like we did with `Config::build`. Instead of `expect`, `run` will return a `Result<T, E>` when something goes wrong. This lets us consolidate error handling in `main`:

src/main.rs
```rust
use std::error::Error;

// --snip--

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    println!("With text:\n{contents}");

    Ok(())
}
```

Three significant changes here:

1. **Return type changed to `Result<(), Box<dyn Error>>`**. The `Ok` case still returns `()`. For the error type, we used `Box<dyn Error>`, which means the function returns a type that implements the `Error` trait, but we don't have to specify which particular type. This gives us flexibility. We'll cover trait objects in Chapter 18.

2. **Removed `expect` in favor of `?`**. Instead of panicking on an error, `?` returns the error value for the caller to handle.

3. **`run` now returns `Ok(())` in the success case**. The `Ok(())` syntax might look strange, but it's the idiomatic way to indicate we're calling `run` for its side effects only.

When you run this, it will compile but show a warning:

```
cargo run -- the poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
warning: unused `Result` that must be used
  --> src/main.rs:19:5
   |
19 |     run(config);
   |     ^^^^^^^^^^^
   |
   = note: this `Result` may be an `Err` variant, which should be handled
```

Rust is reminding us that we might be ignoring an error! Let's fix that.

#### Handling Errors Returned from run in main

We'll check for errors using a technique similar to what we used with `Config::build`:

src/main.rs
```rust
fn main() {
    // --snip--

    println!("Searching for {}", config.query);
    println!("In file {}", config.file_path);

    if let Err(e) = run(config) {
        println!("Application error: {e}");
        process::exit(1);
    }
}
```

We use `if let` rather than `unwrap_or_else` because `run` returns `()` in the success case, not a value we want to unwrap. We only care about detecting errors.

#### Splitting Code into a Library Crate

Now we'll split `src/main.rs` and put some code into `src/lib.rs`. This lets us test the searching logic and keeps `main.rs` small.

Let's define the search function in `src/lib.rs` with a body that calls the `unimplemented!` macro for now:

src/lib.rs
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    unimplemented!();
}
```

We've used `pub` to make `search` part of our library's public API. Now let's bring this into `main.rs` and use it:

src/main.rs
```rust
use tgrep::search;

// --snip--

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    for line in search(&config.query, &contents) {
        println!("{line}");
    }

    Ok(())
}
```

We add `use tgrep::search` to bring the search function from our library into scope. Then in `run`, instead of printing the entire file, we call `search` and print each matching line. This is also a good time to remove the `println!` calls in `main` that displayed the query and file path, so our program only prints search results.

Whew! That was a lot of work, but we've set ourselves up for success. Now it's much easier to handle errors, and we've made the code more modular. Almost all our work from here on out will be in `src/lib.rs`.

Let's take advantage of this modularity by doing something that would have been difficult before: we'll write some **tests**!

### Adding Functionality with Test-Driven Development

Now that our search logic is in `src/lib.rs` separate from `main`, it's much easier to write tests for our core functionality. We can call functions directly with various arguments without having to run our binary from the command line.

In this section, we'll add the searching logic using **Test-Driven Development (TDD)** with these steps:

1. Write a test that fails and run it to make sure it fails for the reason you expect.
2. Write or modify just enough code to make the new test pass.
3. Refactor the code and make sure the tests continue to pass.
4. Repeat from step 1!

TDD helps drive code design and maintains high test coverage throughout the process.

#### Writing a Failing Test

In `src/lib.rs`, we'll add a `tests` module with a test function, as we did in Chapter 11. The test specifies the behavior we want: it takes a query and text, and returns only lines that contain the query:

src/lib.rs
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn one_result() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }
}
```

This test searches for the string `"duct"`. The text is three lines, but only one contains `"duct"`. The backslash after the opening quote tells Rust not to put a newline at the beginning of the string.

If we run this test now, it will fail because `unimplemented!` panics with "not implemented". In accordance with TDD, let's take a small step and define `search` to always return an empty vector. Then the test should compile and fail because an empty vector doesn't match our expected result:

src/lib.rs
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    vec![]
}
```

#### Understanding the Lifetime Annotation

Notice the explicit lifetime `'a` in the signature of `search`. Recall from Chapter 10 that lifetime parameters specify which argument lifetime is connected to the return value's lifetime. Here, we indicate that the returned vector should contain string slices that reference slices of `contents` (rather than `query`).

If we forgot the lifetime annotations, we'd get this error:

```
error[E0106]: missing lifetime specifier
 --> src/lib.rs:1:51
  |
1 | pub fn search(query: &str, contents: &str) -> Vec<&str> {
  |                      ----            ----         ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `query` or `contents`
```

Rust can't know which parameter we need for the output, so we must tell it explicitly. Since `contents` is the parameter that contains all our text and we want to return parts of that text that match, `contents` is the only parameter that should be connected to the return value.

#### Writing Code to Pass the Test

Currently our test fails because we always return an empty vector. To implement `search`, our program needs to:

1. Iterate through each line of the contents.
2. Check whether the line contains our query string.
3. If it does, add it to the results.
4. If it doesn't, do nothing.
5. Return the list of matching results.

**Iterating Through Lines**

Rust has a helpful method called `lines` for iterating through strings line by line:

src/lib.rs
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        // do something with line
    }
}
```

The `lines` method returns an iterator. Recall from earlier that iterators produce a series of values, and we can use `for` loops with them.

**Searching Each Line**

Strings have a helpful method called `contains` that checks whether a string contains a substring:

src/lib.rs
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    for line in contents.lines() {
        if line.contains(query) {
            // do something with line
        }
    }
}
```

**Storing Matching Lines**

To finish the function, we need to store matching lines. We'll create a mutable vector before the loop and `push` matching lines into it:

src/lib.rs
```rust
pub fn search<'a>(query: &str, contents: &'a str) -> Vec<&'a str> {
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.contains(query) {
            results.push(line);
        }
    }

    results
}
```

Now let's run the test:

```
cargo test
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.22s
     Running unittests src/lib.rs (target/debug/deps/tgrep-9cd200e5fac0fc94)

running 1 test
test tests::one_result ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Our test passed! The code isn't using some useful iterator features yet, but we'll return to that in Chapter 13.

Now the entire program should work. Let's try it with a word from the Emily Dickinson poem:

```
cargo run -- frog poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.38s
     Running `target/debug/tgrep frog poem.txt`
How public, like a frog
```

Let's try a word that matches multiple lines, like `body`:

```
cargo run -- body poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep body poem.txt`
I'm nobody! Who are you?
Are you nobody, too?
How dreary to be somebody!
```

And let's make sure we get nothing when searching for a word that isn't in the poem:

```
cargo run -- monomorphization poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep monomorphization poem.txt`

```

Excellent! We've built our own mini version of a classic tool.

To round out this project, we'll briefly demonstrate how to work with environment variables and how to print to standard error.

### Working with Environment Variables

We'll add an extra feature: **case-insensitive searching** controlled by an environment variable. We could make this a command line option, but by using an environment variable, users can set it once and have all searches be case insensitive in that terminal session.

#### Writing a Failing Test for Case-Insensitive Search

We'll add a new `search_case_insensitive` function to our library. Following TDD, let's write a failing test first. We'll rename our old test from `one_result` to `case_sensitive` to clarify the differences:

src/lib.rs
```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn case_sensitive() {
        let query = "duct";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Duct tape.";

        assert_eq!(vec!["safe, fast, productive."], search(query, contents));
    }

    #[test]
    fn case_insensitive() {
        let query = "rUsT";
        let contents = "\
Rust:
safe, fast, productive.
Pick three.
Trust me.";

        assert_eq!(
            vec!["Rust:", "Trust me."],
            search_case_insensitive(query, contents)
        );
    }
}
```

Notice we added `"Duct tape."` to the old test. This ensures our case-sensitive search doesn't accidentally match uppercase letters — a form of **regression testing** to make sure we don't break existing functionality.

The new test uses `"rUsT"` as its query, which should match `"Rust:"` (capital R) and `"Trust me."` (lowercase r). This test will fail to compile because we haven't defined `search_case_insensitive` yet.

#### Implementing the search_case_insensitive Function

The `search_case_insensitive` function is almost the same as `search`. The only difference is that we lowercase both the query and each line before comparing:

src/lib.rs
```rust
pub fn search_case_insensitive<'a>(
    query: &str,
    contents: &'a str,
) -> Vec<&'a str> {
    let query = query.to_lowercase();
    let mut results = Vec::new();

    for line in contents.lines() {
        if line.to_lowercase().contains(&query) {
            results.push(line);
        }
    }

    results
}
```

We call `to_lowercase` on the query and store it in a new variable with the same name, **shadowing** the original. This means no matter whether the user's query is `"rust"`, `"RUST"`, `"Rust"`, or `"rUsT"`, we treat it as `"rust"`.

Note that `query` is now a `String` rather than a string slice because `to_lowercase` creates new data. When we pass it to `contains`, we need to add `&` because `contains` takes a string slice.

Let's see if our tests pass:

```
cargo test
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 1.33s
     Running unittests src/lib.rs (target/debug/deps/tgrep-9cd200e5fac0fc94)

running 2 tests
test tests::case_insensitive ... ok
test tests::case_sensitive ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out
```

Great! Now let's wire this into our program. We need to:

1. Add a configuration option to `Config`
2. Check for the environment variable when building `Config`
3. Call the appropriate search function based on the config

First, add `ignore_case` to the `Config` struct:

src/main.rs
```rust
pub struct Config {
    pub query: String,
    pub file_path: String,
    pub ignore_case: bool,
}
```

Then update `run` to choose between the two search functions:

src/main.rs
```rust
use tgrep::{search, search_case_insensitive};

// --snip--

fn run(config: Config) -> Result<(), Box<dyn Error>> {
    let contents = fs::read_to_string(config.file_path)?;

    let results = if config.ignore_case {
        search_case_insensitive(&config.query, &contents)
    } else {
        search(&config.query, &contents)
    };

    for line in results {
        println!("{line}");
    }

    Ok(())
}
```

Finally, check for the environment variable in `Config::build`. The `env::var` function is already in scope since we imported `std::env`:

src/main.rs
```rust
impl Config {
    fn build(args: &[String]) -> Result<Config, &'static str> {
        if args.len() < 3 {
            return Err("not enough arguments");
        }

        let query = args[1].clone();
        let file_path = args[2].clone();

        let ignore_case = env::var("IGNORE_CASE").is_ok();

        Ok(Config {
            query,
            file_path,
            ignore_case,
        })
    }
}
```

`env::var("IGNORE_CASE")` returns a `Result`. If the environment variable is set to any value, it returns `Ok`. If it's not set, it returns `Err`. We use `is_ok()` to check whether the variable is set — we don't care about its actual value, just whether it exists.

Let's try it! First without the environment variable:

```
cargo run -- to poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
```

Now with `IGNORE_CASE` set:

```
IGNORE_CASE=1 cargo run -- to poem.txt
   Compiling tgrep v0.1.0 (file:///projects/tgrep)
    Finished `dev` profile [unoptimized + debuginfo] target(s) in 0.0s
     Running `target/debug/tgrep to poem.txt`
Are you nobody, too?
How dreary to be somebody!
To tell your name the livelong day
To an admiring bog!
```

Excellent! We now have case-insensitive searching controlled by an environment variable.

**Windows Note:** If you're using PowerShell, set the environment variable separately:

```powershell
PS> $Env:IGNORE_CASE=1; cargo run -- to poem.txt
```

To unset it:

```powershell
PS> Remove-Item Env:IGNORE_CASE
```

### Redirecting Errors to Standard Error

At the moment, all our output goes to standard output using `println!`. But terminals actually have two output streams:

- **Standard output (stdout)** — for normal program output
- **Standard error (stderr)** — for error messages

This distinction lets users redirect successful output to a file while still seeing errors on the screen. Our program currently misbehaves: error messages go to stdout, so they end up in files when redirected.

Let's demonstrate the problem:

```
cargo run > output.txt
```

The `>` tells the shell to write stdout to `output.txt`. We didn't pass arguments, so we expect an error. But the error message doesn't appear on screen — it went into the file:

```
cat output.txt
Problem parsing arguments: not enough arguments
```

That's not ideal. We want errors on screen and only successful search results in files.

Rust provides the `eprintln!` macro that prints to **standard error** instead of standard output. Let's change the two places in `main` where we print errors:

src/main.rs
```rust
fn main() {
    let args: Vec<String> = env::args().collect();

    let config = Config::build(&args).unwrap_or_else(|err| {
        eprintln!("Problem parsing arguments: {err}");
        process::exit(1);
    });

    if let Err(e) = run(config) {
        eprintln!("Application error: {e}");
        process::exit(1);
    }
}
```

Now let's run it the same way:

```
cargo run > output.txt
Problem parsing arguments: not enough arguments
```

Now we see the error on screen, and `output.txt` is empty — exactly what we want!

Let's also verify that successful output still goes to the file:

```
cargo run -- to poem.txt > output.txt
```

No terminal output, and `output.txt` contains:

```
Are you nobody, too?
How dreary to be somebody!
```

Now we're using standard output for successful output and standard error for errors, which is the proper convention for command line programs.

### Summary

This chapter recapped many concepts you've learned so far and covered how to perform common I/O operations in Rust. You learned how to:

- Accept **command line arguments** using `std::env::args`
- **Read files** using `std::fs::read_to_string`
- **Refactor** code by extracting functions, grouping related data into structs, and using constructors
- **Handle errors** properly with `Result` instead of `panic!`, and use `unwrap_or_else` and `if let` for clean error handling
- **Split code** into `main.rs` and `lib.rs` for better organization and testability
- Write **tests** using Test-Driven Development (TDD)
- Work with **lifetimes** when returning references from functions
- Use **environment variables** for configuration options
- Print to **standard error** with `eprintln!` so errors don't get mixed with normal output

Combined with concepts from previous chapters, you're now prepared to write real command line applications that are well organized, handle errors gracefully, and are properly tested.

Next, we'll explore some Rust features that were influenced by functional languages: **closures and iterators**.
