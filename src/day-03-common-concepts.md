# Chapter 3 - Common Programming Concepts (Functions and Control Flow)

This chapter introduces **core concepts** that are present in nearly every programming language, explained through **Rust’s syntax and semantics**.
Even though these concepts aren’t unique to Rust, understanding how Rust implements them helps you write **safe, efficient, and reliable code**. We will cover:

<img width="272" height="197" alt="Screenshot 2025-10-16 at 8 22 00 PM" src="https://github.com/user-attachments/assets/e1b24da8-d8cd-4e63-a160-9dcf01b7cd7a" />

---

### Keywords

Rust has a set of **reserved keywords** - special words that the compiler uses for specific tasks.
You **cannot** use them as variable names or function identifiers.

Example keywords include:

```
fn, let, mut, const, if, else, loop, match, while, for, impl, trait, pub, use
```

A few are reserved for **future use** (they have no functionality yet).

Full list: [Appendix A in the Rust Book](https://doc.rust-lang.org/book/appendix-01-keywords.html)

---

## Variables and Mutability

By default, **variables in Rust are immutable**.
Once you assign a value, you cannot change it and this is a **feature**, not a restriction.

Rust’s design encourages **immutability** to ensure safety and concurrency.

However, when needed, you can make a variable **mutable** using the keyword `mut`.

---

### Immutable Example (This will fail to compile)

**Filename:** `src/main.rs`

```rust
fn main() {
    let x = 5;
    println!("The value of x is: {x}");
    x = 6; // Error: trying to reassign an immutable variable
    println!("The value of x is: {x}");
}
```

**Run:**

```bash
cargo run
```

**Output:**

```
error[E0384]: cannot assign twice to immutable variable `x`
 --> src/main.rs:4:5
  |
2 |     let x = 5;
  |         - first assignment to `x`
3 |     println!("The value of x is: {x}");
4 |     x = 6;
  |     ^^^^^ cannot assign twice to immutable variable
  |
help: consider making this binding mutable
  |
2 |     let mut x = 5;
  |         +++
```

**Explanation:**
Rust is telling you that you **cannot reassign** to `x` because it was declared **without `mut`**.

This compile-time safety prevents potential bugs where one part of the code assumes a value never changes, but another part changes it unexpectedly.

---

### Mutable Example

**Filename:** `src/main.rs`

```rust
fn main() {
    let mut x = 5;
    println!("The value of x is: {x}");
    x = 6; // Allowed
    println!("The value of x is: {x}");
}
```

**Output:**

```
The value of x is: 5
The value of x is: 6
```

**Tip:** Use `mut` sparingly.
Prefer immutability unless you explicitly need to mutate — it improves safety and readability.

---

## Constants

Constants are **always immutable**, even more strictly than variables.

* Declared using `const`
* Must have a **type annotation**
* Value must be **known at compile time**
* Can be declared **in any scope**, even **global**

**Example:**

```rust
const THREE_HOURS_IN_SECONDS: u32 = 60 * 60 * 3;
```

**Explanation:**

* `THREE_HOURS_IN_SECONDS` is a **constant expression**.
* Constants follow **ALL_CAPS_WITH_UNDERSCORES** naming.
* The compiler evaluates constant expressions at **compile time**, ensuring performance and predictability.

---

**Why Constants Matter**

* Used for **configuration values** (e.g., max limits, default sizes)
* Stay in memory throughout program execution
* Improve **readability** and **maintainability**

Example:

```rust
const MAX_POINTS: u32 = 100_000;
```

If you ever want to change it later — you change it once.

---

## Shadowing

Rust allows **redefining a variable with the same name** — this is called **shadowing**.

This is not mutation.
It’s creating a **new variable** that overrides the previous one **in scope**.

---

**Example:**

```rust
fn main() {
    let x = 5;

    let x = x + 1;

    {
        let x = x * 2;
        println!("The value of x in the inner scope is: {x}");
    }

    println!("The value of x is: {x}");
}
```

**Output:**

```
The value of x in the inner scope is: 12
The value of x is: 6
```

**How this works:**

* First `x` = 5
* Second `x` shadows it = 6
* Inner scope shadows it again = 12
* After inner scope ends → back to `x = 6`

---

### Shadowing vs `mut`

| Feature                | Shadowing | `mut`  |
| ---------------------- | --------- | ------ |
| Creates new variable   | ✅         | ❌     |
| Allows type change     | ✅         | ❌     |
| Same variable reused   | ✅         | ✅     |
| Requires `let` keyword | ✅         | ❌     |

Example of **type change via shadowing:**

```rust
let spaces = "   ";  // &str
let spaces = spaces.len(); // usize
```

If you tried this with `mut`:

```rust
let mut spaces = "   ";
spaces = spaces.len(); // Error: mismatched types
```

---

## Data Types

Rust is **statically typed** — the compiler must know the **type of every variable** at compile time.

Most of the time, it can **infer** the type, but sometimes you need **type annotations**.

Example:

```rust
let guess: u32 = "42".parse().expect("Not a number!");
```

If you omit the type:

```
error[E0284]: type annotations needed
```

---

### Scalar Types

Scalar = single value.
Four primary scalar types in Rust:

1. **Integers**
2. **Floating-point numbers**
3. **Booleans**
4. **Characters**

---

### 1. Integer Types

| Length                 | Signed | Unsigned |
| ---------------------- | ------ | -------- |
| 8-bit                  | i8     | u8       |
| 16-bit                 | i16    | u16      |
| 32-bit                 | i32    | u32      |
| 64-bit                 | i64    | u64      |
| 128-bit                | i128   | u128     |
| Architecture dependent | isize  | usize    |

**Signed** → can store negative numbers
**Unsigned** → only positive numbers

Example:

```rust
let x: i8 = -128;
let y: u8 = 255;
```

---

### Integer Literals

| Format         | Example       |
| -------------- | ------------- |
| Decimal        | `98_222`      |
| Hex            | `0xff`        |
| Octal          | `0o77`        |
| Binary         | `0b1111_0000` |
| Byte (u8 only) | `b'A'`        |

---

### Integer Overflow

Example: `u8` can hold 0–255.
If you try `256`, overflow happens.

In **debug mode** → program panics.
In **release mode** → wraps around (256 → 0, 257 → 1).

Rust gives special methods to handle this safely:

* `wrapping_add`
* `checked_add`
* `overflowing_add`
* `saturating_add`

---

### 2. Floating-Point Types

* `f32` → 32-bit float
* `f64` → 64-bit float (default)

**Example:**

```rust
fn main() {
    let x = 2.0; // f64
    let y: f32 = 3.0;
}
```

Follows **IEEE-754** standard.

---

### 3. Numeric Operations

```rust
fn main() {
    let sum = 5 + 10;
    let difference = 95.5 - 4.3;
    let product = 4 * 30;
    let quotient = 56.7 / 32.2;
    let truncated = -5 / 3; // -1
    let remainder = 43 % 5;
}
```

---

### 4. Booleans

```rust
fn main() {
    let t = true;
    let f: bool = false; // explicit type
}
```

Used mainly in conditionals (`if`, `while`, etc.).

---

### 5. Characters

Rust’s `char` type represents **Unicode scalar values**.

```rust
fn main() {
    let c = 'z';
    let z: char = 'ℤ';
    let heart_eyed_cat = '😻';
}
```

Each `char` is **4 bytes** and supports **emoji, accented letters, CJK characters, etc.**

---

## Compound Types

Rust provides two primitive compound types:

1. **Tuple**
2. **Array**

---

### Tuples

Tuples group multiple values (of possibly different types).

```rust
fn main() {
    let tup: (i32, f64, u8) = (500, 6.4, 1);
}
```

Destructuring:

```rust
let (x, y, z) = tup;
println!("The value of y is: {y}");
```

Access by index:

```rust
let five_hundred = x.0;
let six_point_four = x.1;
let one = x.2;
```

Empty tuple → `()` (unit type).
Used when functions return nothing.

---

### Arrays

All elements must have the **same type** and **fixed length**.

```rust
fn main() {
    let a = [1, 2, 3, 4, 5];
}
```

Type declaration:

```rust
let a: [i32; 5] = [1, 2, 3, 4, 5];
```

Initialize all with same value:

```rust
let a = [3; 5]; // [3, 3, 3, 3, 3]
```

---

Access elements:

```rust
let first = a[0];
let second = a[1];
```

Invalid access → program **panics safely**:

```rust
use std::io;

fn main() {
    let a = [1, 2, 3, 4, 5];
    println!("Please enter an array index.");

    let mut index = String::new();
    io::stdin().read_line(&mut index).expect("Failed to read line");

    let index: usize = index.trim().parse().expect("Not a number");
    let element = a[index];

    println!("The value of the element at index {index} is: {element}");
}
```

If user enters invalid index:

```
index out of bounds: the len is 5 but the index is 10
```

Rust **stops execution** immediately instead of letting you access invalid memory — this is **memory safety** in action.

---

## Functions in Rust

Functions in Rust are the building blocks of modularity and code reuse. They allow you to group logic under a name and call it from other parts of the program.

### Defining a Function

```rust
fn main() {
    println!("Hello, world!");
    another_function();
}

fn another_function() {
    println!("Another function.");
}
```

* `fn` → keyword used to define a function.
* `main()` → the entry point of the program (like `int main()` in C).
* `{}` → denotes the function body.
* You can **define functions anywhere** in your file — before or after `main()` — as long as they are visible in scope.

Rust doesn’t care about order of function definitions because it **resolves everything at compile time**, not runtime.

---

## Function Parameters

Functions can take *parameters* — variables passed into the function.

### Example

```rust
fn main() {
    another_function(5);
}

fn another_function(x: i32) {
    println!("The value of x is: {x}");
}
```

* `x: i32` → defines a parameter `x` of type 32-bit integer.
* Rust **requires** explicit type annotations for parameters — unlike Python or JavaScript.
  This makes type inference simpler elsewhere in the program.

### Parameter vs Argument

| Term          | Meaning                                                                         |
| ------------- | ------------------------------------------------------------------------------- |
| **Parameter** | Variable name in the function definition (`x` in `fn another_function(x: i32)`) |
| **Argument**  | Actual value passed when calling the function (`5` in `another_function(5)`)    |

---

### Multiple Parameters

```rust
fn main() {
    print_labeled_measurement(5, 'h');
}

fn print_labeled_measurement(value: i32, unit_label: char) {
    println!("The measurement is: {value}{unit_label}");
}
```

Here, you see:

* One `i32` integer parameter.
* One `char` parameter (`'h'`).
* `println!` supports placeholders that expand to variable values inside `{}`.

---

## Statements vs Expressions

Rust makes a **sharp distinction** between *statements* and *expressions*.
This distinction is what gives Rust flexibility in functional-style programming.

| Concept        | Description          | Returns Value? |
| -------------- | -------------------- | -------------- |
| **Statement**  | Performs an action   | No           |
| **Expression** | Evaluates to a value | Yes          |

---

### Example: Statement

```rust
let y = 6;
```

* `let y = 6;` is a **statement**.
* Statements do not return values.

You **can’t** do:

```rust
let x = (let y = 6);
```

because `let y = 6` doesn’t return a value — it’s just an action.

---

### Example: Expression

```rust
let y = {
    let x = 3;
    x + 1
};

println!("The value of y is: {y}");
```

Here:

* `{ let x = 3; x + 1 }` is an **expression block**.
* It evaluates to **`4`** (the result of `x + 1`).
* That value gets assigned to `y`.

> ⚠️ Important rule: If you put a semicolon `;` after an expression, it becomes a **statement**, meaning it won’t return a value.

Example:

```rust
x + 1;  // now it returns nothing!
```

---

## Functions with Return Values

Rust functions can return values — these are **implicit** unless you use the `return` keyword.

### Example

```rust
fn five() -> i32 {
    5
}

fn main() {
    let x = five();
    println!("The value of x is: {x}");
}
```

* `-> i32` → specifies return type.
* The final line (`5`) has **no semicolon**, meaning it’s an *expression* whose value is returned.

---

### Another Example

```rust
fn plus_one(x: i32) -> i32 {
    x + 1
}
```

works fine, but if you add a semicolon:

```rust
fn plus_one(x: i32) -> i32 {
    x + 1;
}
```

you’ll get:

```
error[E0308]: mismatched types
expected `i32`, found `()`
```

because now it returns `()` (the *unit type*, meaning “nothing”).

---

## Comments

Rust supports single-line and multi-line comments.

```rust
// This is a comment

// Another example:
// Explaining complex logic
```

You can also place comments inline:

```rust
let lucky_number = 7; // I'm feeling lucky today
```

These are ignored by the compiler, purely for readability.

---

## Control Flow — `if`, `else if`, `else`

### Basic `if` Example

```rust
fn main() {
    let number = 3;

    if number < 5 {
        println!("condition was true");
    } else {
        println!("condition was false");
    }
}
```

* The condition **must** be a `bool`.
* Rust will **not** automatically convert integers to booleans (unlike C, JS, etc.).

Example of invalid code:

```rust
if number {
    println!("This won't compile");
}
```

will throw:

```
expected `bool`, found integer
```

---

### Multiple Conditions (`else if`)

```rust
fn main() {
    let number = 6;

    if number % 4 == 0 {
        println!("divisible by 4");
    } else if number % 3 == 0 {
        println!("divisible by 3");
    } else if number % 2 == 0 {
        println!("divisible by 2");
    } else {
        println!("not divisible by 4, 3, or 2");
    }
}
```

Rust will stop at the **first true** condition and skip the rest.

---

### `if` as an Expression

Because `if` returns a value, you can assign it directly:

```rust
let condition = true;
let number = if condition { 5 } else { 6 };
println!("The value of number is: {number}");
```

Output → `The value of number is: 5`

⚠️ The two branches **must return the same type**.

This will **not compile**:

```rust
let number = if condition { 5 } else { "six" };
```

because one branch returns an integer, the other a string.

---

## Repetition with Loops

Rust has three looping constructs:

1. `loop`
2. `while`
3. `for`

---

### Infinite `loop`

```rust
loop {
    println!("again!");
}
```

This will print forever until you press `Ctrl + C`.

You can exit with:

```rust
break;
```

and skip to next iteration using:

```rust
continue;
```

---

### Returning Values from a Loop

Loops can **return values** with `break`.

```rust
fn main() {
    let mut counter = 0;
    let result = loop {
        counter += 1;
        if counter == 10 {
            break counter * 2;
        }
    };
    println!("The result is {result}");
}
```

Output → `The result is 20`

---

### Loop Labels

Used when you have nested loops:

```rust
fn main() {
    let mut count = 0;

    'counting_up: loop {
        println!("count = {count}");
        let mut remaining = 10;

        loop {
            println!("remaining = {remaining}");
            if remaining == 9 {
                break;
            }
            if count == 2 {
                break 'counting_up;
            }
            remaining -= 1;
        }

        count += 1;
    }

    println!("End count = {count}");
}
```

Output:

```
count = 0
remaining = 10
remaining = 9
count = 1
remaining = 10
remaining = 9
count = 2
remaining = 10
End count = 2
```

---

### `while` Loops

Runs while a condition is true:

```rust
fn main() {
    let mut number = 3;

    while number != 0 {
        println!("{number}!");
        number -= 1;
    }

    println!("LIFTOFF!!!");
}
```

Output:

```
3!
2!
1!
LIFTOFF!!!
```

---

### `for` Loops

Used to iterate through collections like arrays:

```rust
fn main() {
    let a = [10, 20, 30, 40, 50];
    for element in a {
        println!("the value is: {element}");
    }
}
```

This is safer than using a manual index (no risk of going out of bounds).

You can also use ranges:

```rust
for number in (1..4).rev() {
    println!("{number}!");
}
println!("LIFTOFF!!!");
```

Output:

```
3!
2!
1!
LIFTOFF!!!
```

---

## Summary

| Concept       | Key Idea                             |
| ------------- | ------------------------------------ |
| `fn`          | Defines a function                   |
| Statements    | Do not return values                 |
| Expressions   | Evaluate to values                   |
| Return Values | The final expression (no `;`)        |
| `if`          | Conditional branching (must be bool) |
| Loops         | `loop`, `while`, `for`               |
| `break`       | Exit a loop                          |
| `continue`    | Skip iteration                       |
| Comments      | Use `//` for single line             |

---

Now, pat your back for coming this far, this will only become more interesting with time!
