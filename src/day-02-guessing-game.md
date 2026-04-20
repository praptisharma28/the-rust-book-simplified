#### The part that will be covered here on day 2 from the official rust book is:

<img width="249" height="35" alt="Screenshot 2025-10-15 at 6 38 25 PM" src="https://github.com/user-attachments/assets/5a8a226c-6434-4f3a-84d8-c1b441e0d895" />

# Programming a Guessing Game

This is Rust’s *first real project*.
By the end of this chapter, you’ll build a simple command-line **Guessing Game** that:

1. Picks a random number.
2. Asks the user to guess it.
3. Tells you if your guess is too low, too high, or correct.

You’ll use:

* Variables
* Loops
* Crates (external packages)
* Error handling
* Pattern matching (`match`)
* Type conversion

So you’ll touch *almost every* fundamental Rust concept in one short program.

---

## Step 1: Creating a New Project

(Please code along and push it on your GitHub; you can even reply to my tweet on X with the repository link.)

Use Cargo to start a new project:

```bash
cargo new guessing_game
cd guessing_game
```

This gives you a folder like:

```
guessing_game/
├── Cargo.toml
└── src/
    └── main.rs
```

By default, `main.rs` has this:

```rust
fn main() {
    println!("Hello, world!");
}
```

Let’s run it to make sure everything’s okay:

```bash
cargo run
```

Output:

```
Hello, world!
```

Great — now we’ll replace that with real code.

---

## Step 2: Getting User Input

We want to ask the player for their guess.
To read input from the terminal, we’ll use Rust’s **standard library (std)**.

### Code

```rust
use std::io;

fn main() {
    println!("Guess the number!");

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    println!("You guessed: {guess}");
}
```

---

### Explanation

#### 1. `use std::io;`

This brings Rust’s **I/O library** (input/output) into scope.
You’ll use it to read from the keyboard.

---

#### 2. `let mut guess = String::new();`

* `let` → declares a variable.
* `mut` → makes it *mutable* (changeable).
* `String::new()` → creates a new, empty string.

Without `mut`, we can’t modify `guess` later.

---

#### 3. `io::stdin().read_line(&mut guess)`

* `io::stdin()` → gets a handle to standard input (keyboard).
* `.read_line(&mut guess)` → reads a line and appends it to `guess`.
* `&mut guess` → passes a mutable reference, allowing the function to modify it.

This method returns a `Result` type — it can succeed or fail.
That’s why we handle it with `.expect()` next.

---

#### 4. `.expect("Failed to read line");`

This is **error handling**.
If reading input fails, the program will crash with that message.

---

#### 5. `println!("You guessed: {guess}");`

Prints the value of `guess`.
In Rust 1.58+, you can use `{guess}` directly instead of `{}` and providing the variable after.

---

### Summary So Far

* Took user input.
* Stored it in a mutable string.
* Printed it back to the user.

You’ve used:

* `use` (import modules)
* `let mut` (mutable variables)
* `String::new()`
* `read_line()`
* `expect()`
* `println!()`

---

## Step 3: Generating a Secret Number

Now we’ll generate a random number between 1 and 100.

Rust’s standard library doesn’t include random number generation — you get that via an **external crate** called `rand`.

### Step 3.1: Add `rand` to Your Dependencies

Open your `Cargo.toml` and add this line under `[dependencies]`:

```toml
rand = "0.8.5"
```

Then save it and run:

```bash
cargo build
```

Cargo will download and compile the crate.

---

### Step 3.2: Use `rand` in Your Code

```rust
use std::io;
use rand::Rng;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("The secret number is: {secret_number}");
}
```

---

### Explanation

#### 1. `use rand::Rng;`

The `Rng` trait provides methods like `.gen_range()` for generating random numbers.
You must import a trait before using its methods.

---

#### 2. `rand::thread_rng()`

Gives a random number generator local to the current thread and automatically seeded.

---

#### 3. `.gen_range(1..=100)`

Generates a number between **1 and 100 inclusive**.
`1..=100` is a **range expression**:

* `1..100` → 1 to 99
* `1..=100` → 1 through 100 (inclusive)

---

## Step 4: Comparing the Guess and Secret Number

Now we’ll get user input, convert it to a number, and compare it to the secret number.

### Code

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    println!("Please input your guess.");

    let mut guess = String::new();

    io::stdin()
        .read_line(&mut guess)
        .expect("Failed to read line");

    let guess: u32 = guess.trim().parse().expect("Please type a number!");

    println!("You guessed: {guess}");

    match guess.cmp(&secret_number) {
        Ordering::Less => println!("Too small!"),
        Ordering::Greater => println!("Too big!"),
        Ordering::Equal => println!("You win!"),
    }
}
```

---

### Explanation

#### 1. `use std::cmp::Ordering;`

The **Ordering** enum has three variants:

```rust
Ordering::Less
Ordering::Greater
Ordering::Equal
```

---

#### 2. `let guess: u32 = guess.trim().parse().expect("Please type a number!");`

Step by step:

* `guess` was a `String`.
* `trim()` removes whitespace and newlines.
* `parse()` converts it into another type — here, a `u32`.
* `expect()` handles errors for invalid input.

---

#### 3. `match guess.cmp(&secret_number)`

The `cmp()` method compares two values and returns an `Ordering`.
We then pattern match it:

```rust
match guess.cmp(&secret_number) {
    Ordering::Less => println!("Too small!"),
    Ordering::Greater => println!("Too big!"),
    Ordering::Equal => println!("You win!"),
}
```

---

## Step 5: Adding a Loop

We’ll wrap the main logic in a loop so the user can keep guessing.

### Code

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please input your guess.");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
```

---

### Explanation

1. `loop { ... }` runs indefinitely until `break` is used.
2. The match on `parse()` ensures invalid input doesn’t crash the program:

```rust
let guess: u32 = match guess.trim().parse() {
    Ok(num) => num,
    Err(_) => continue,
};
```

If parsing fails, `continue` restarts the loop.

3. `break` exits the loop when the player wins.

---

## Step 6: Final Version

```rust
use std::io;
use rand::Rng;
use std::cmp::Ordering;

fn main() {
    println!("Guess the number!");

    let secret_number = rand::thread_rng().gen_range(1..=100);

    loop {
        println!("Please input your guess.");

        let mut guess = String::new();

        io::stdin()
            .read_line(&mut guess)
            .expect("Failed to read line");

        let guess: u32 = match guess.trim().parse() {
            Ok(num) => num,
            Err(_) => continue,
        };

        println!("You guessed: {guess}");

        match guess.cmp(&secret_number) {
            Ordering::Less => println!("Too small!"),
            Ordering::Greater => println!("Too big!"),
            Ordering::Equal => {
                println!("You win!");
                break;
            }
        }
    }
}
```

---

## Concepts You Just Learned

| Concept                     | Explanation                         |
| --------------------------- | ----------------------------------- |
| `use std::io;`              | Importing from the standard library |
| `mut`                       | Mutable variable                    |
| `String::new()`             | Create a new, empty string          |
| `read_line()`               | Read input from terminal            |
| `expect()`                  | Handle potential errors             |
| `rand::thread_rng()`        | Get random number generator         |
| `.gen_range(1..=100)`       | Generate a random number in range   |
| `cmp()`                     | Compare two numbers                 |
| `Ordering`                  | Enum for comparison results         |
| `match`                     | Pattern matching (branching logic)  |
| `loop`, `break`, `continue` | Control flow tools                  |
| `Result` & `Ok/Err`         | Error handling system               |
| `trim()`, `parse()`         | String to number conversion         |

---

## Summary

Pat your back, you’ve just built a complete command-line game with:

* Random number generation
* Robust input handling
* Pattern matching for game logic
* Safe error management via Rust’s type system

This single program demonstrates why Rust is both **safe** and **powerful**.
