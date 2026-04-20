# **Chapter 4 (Part 1)**
# **Understanding Ownership**

We are going to cover: 

<img width="253" height="91" alt="Screenshot 2025-10-17 at 9 04 49 PM" src="https://github.com/user-attachments/assets/ee640235-18f5-4878-a124-956c3df608b5" />

Rust’s ownership system is what makes it stand out from almost every other language.
It ensures **memory safety without garbage collection**, which is why Rust can run both fast and safe.

To master ownership, you must understand:

1. What makes a program safe or unsafe
2. How memory works (stack vs. heap)
3. How ownership, moves, and cloning control memory

---

## 1. **Safety is the Absence of Undefined Behavior**

Rust defines *safety* as:

> “A program is safe if it cannot cause undefined behavior.”

Let’s start with a simple, *safe* program.

```rust
fn read(y: bool) {
    if y {
        println!("y is true!");
    }
}

fn main() {
    let x = true;
    read(x);
}
```

✅ This compiles and runs fine.
`x` is defined *before* it’s used.

---

Now see this **unsafe** version:

```rust
fn read(y: bool) {
    if y {
        println!("y is true!");
    }
}

fn main() {
    read(x); // oh no! x isn't defined!
    let x = true;
}
```

This fails with:

```
error[E0425]: cannot find value `x` in this scope
 --> src/main.rs:8:10
  |
8 |     read(x);
  |          ^ not found in this scope
```

Rust prevents compilation because otherwise, `x` would be used **before** it’s defined — which is undefined behavior.

In languages like Python or JavaScript, this would raise a runtime exception (`NameError`, `ReferenceError`).
But Rust checks this *at compile time* instead, removing the cost of runtime checks.

---

### Why Undefined Behavior Is Dangerous

If Rust allowed that unsafe program, here’s what would happen (in assembly terms):

Safe version:

```assembly
main:
    mov     edi, 1  ; put 1 (true) into register edi
    call    read
```

Unsafe version:

```assembly
main:
    call    read
    mov     edi, 1  ; this happens too late!
```

Here, `read` expects the argument to be in `edi`, but it’s not set yet — it could contain any garbage value.
That’s **undefined behavior**: the CPU might crash, overwrite memory, or worse.

---

### Rust’s Core Promise

Rust guarantees:

* No reading uninitialized memory
* No double frees
* No invalid pointer dereferences

By enforcing these **ownership rules at compile time**.

---

## 2. **Ownership as a Discipline for Memory Safety**

Ownership prevents **unsafe operations on memory**.

Memory is where your program stores its data.
It can be thought of as two regions:

| Memory Type | Managed by              | Lifetime              | Example Data            |
| ----------- | ----------------------- | --------------------- | ----------------------- |
| **Stack**   | Rust automatically      | Ends with scope       | integers, small structs |
| **Heap**    | Rust + Ownership system | Can live indefinitely | strings, vectors, boxes |

---

### Example — Stack Memory

```rust
fn main() {
    let a = 5;
    let mut b = a;
    b += 1;
}
```

Here:

* Both `a` and `b` live on the **stack**
* `b` gets a **copy** of `a`
* Changing `b` doesn’t affect `a`

Stack data is small and cheap to copy.

---

### Example — Heap Memory with `Box`

Now let’s see what happens when we store a **large array**.

```rust
fn main() {
    let a = [0; 1_000_000];
    let b = a;
}
```

This **copies** one million elements — 2 million total!
That’s wasteful.

To avoid copying large data, Rust uses **pointers** via heap allocations.

```rust
fn main() {
    let a = Box::new([0; 1_000_000]);
    let b = a;
}
```

Now:

* The array lives once, in the **heap**.
* Both `a` and `b` just hold a **pointer**.
* But — ownership moves from `a` to `b`.
  `a` can no longer be used.

---

## 3. **Rust Does Not Permit Manual Memory Management**

In C or C++, you call `malloc()` and `free()`.
In Rust, you don’t manually free memory — it’s handled automatically when ownership ends.

Imagine Rust let you do this:

```rust
fn free<T>(_t: T) {}

fn main() {
    let b = Box::new([0; 100]);
    free(b);             // manually free memory
    assert!(b[0] == 0);  // use freed memory ❌
}
```

This is *undefined behavior* — you’re accessing freed memory.
Rust prevents this at compile time.

So, **Rust never lets you call `free()` yourself.**
It frees memory automatically when a variable’s owner goes out of scope.

---

## 4. **A Box’s Owner Manages Deallocation**

Rust’s (almost correct) deallocation rule:

> If a variable owns a box, when its frame ends, the heap memory is freed.

Example:

```rust
fn main() {
    let a_num = 4;
    make_and_drop();
}

fn make_and_drop() {
    let a_box = Box::new(5);
}
```

When `make_and_drop()` ends:

* Stack frame for `a_box` ends
* Its heap memory (5) is freed automatically

✅ Safe and automatic.

---

### The Problem of Double Free

```rust
let a = Box::new([0; 1_000_000]);
let b = a;
```

If both `a` and `b` owned the same memory, Rust would free it twice — undefined behavior.

So Rust’s *correct* rule is:

> If a variable owns heap data, when it’s moved, the previous owner is invalidated.

That’s **ownership**.

---

## 5. **Collections and Ownership**

Types like `Vec`, `String`, and `HashMap` internally use heap memory — but with ownership.

Example:

```rust
fn main() {
    let first = String::from("Ferris");
    let full = add_suffix(first);
    println!("{full}");
}

fn add_suffix(mut name: String) -> String {
    name.push_str(" Jr.");
    name
}
```

Step by step:

1. `first` owns “Ferris” on the heap.
2. Calling `add_suffix(first)` **moves** ownership to `name`.
3. `name.push_str(" Jr.")` modifies the string in place.
4. Returning `name` moves ownership to `full`.

No copies, no leaks, no double frees.

---

### If We Try to Use `first` After Move

```rust
fn main() {
    let first = String::from("Ferris");
    let full = add_suffix(first);
    println!("{full}, originally {first}");
}
```

Rust errors out:

```
error[E0382]: borrow of moved value: `first`
```

Explanation:

* `first` was *moved* into `add_suffix`
* `String` does not implement `Copy`
* Using it again is invalid — it no longer owns the data

---

## 6. **Cloning Avoids Moves**

If you need to *reuse* a variable after moving, use `.clone()`.

```rust
fn main() {
    let first = String::from("Ferris");
    let first_clone = first.clone();
    let full = add_suffix(first_clone);
    println!("{full}, originally {first}");
}

fn add_suffix(mut name: String) -> String {
    name.push_str(" Jr.");
    name
}
```

Here:

* `clone()` creates a deep copy of the heap data
* `first` and `first_clone` each own separate heap allocations

✅ Both safe to use.

---

## 7. **Summary: Ownership in Rust**

Ownership is Rust’s secret weapon for memory safety.

| Rule                                                  | Meaning                                        |
| ----------------------------------------------------- | ---------------------------------------------- |
| **Each heap value has one owner**                     | Only one variable controls freeing that memory |
| **When the owner goes out of scope, memory is freed** | No leaks, no garbage collector needed          |
| **Ownership can move**                                | But the old owner becomes invalid              |
| **Use `.clone()` to copy heap data**                  | Creates a new owned allocation                 |

By enforcing these at compile time, Rust ensures **no undefined behavior** due to invalid memory access.

---

# **References and Borrowing**

---

## **Why References Exist**

We already know ownership and move semantics keep memory safe — but they can make programs *annoyingly restrictive*.

For example:

```rust
fn main() {
    let m1 = String::from("Hello");
    let m2 = String::from("world");
    greet(m1, m2);
    let s = format!("{} {}", m1, m2); // ❌ Error: moved values
}

fn greet(g1: String, g2: String) {
    println!("{} {}!", g1, g2);
}
```

Here, ownership of `m1` and `m2` *moves* into `greet`.
After that, `main` can’t use them — they’ve been dropped at the end of `greet`.

Rust will reject this because you’d be trying to use freed memory.

---

You *could* fix it like this:

```rust
fn main() {
    let m1 = String::from("Hello");
    let m2 = String::from("world");
    let (m1_again, m2_again) = greet(m1, m2);
    let s = format!("{} {}", m1_again, m2_again);
}

fn greet(g1: String, g2: String) -> (String, String) {
    println!("{} {}!", g1, g2);
    (g1, g2)
}
```

This returns the ownership back — but it’s **ugly and verbose**.
That’s where **references** come in.

---

## **References: Non-Owning Pointers**

We can rewrite the program beautifully:

```rust
fn main() {
    let m1 = String::from("Hello");
    let m2 = String::from("world");
    greet(&m1, &m2); // borrow them instead of moving
    let s = format!("{} {}", m1, m2);
}

fn greet(g1: &String, g2: &String) {
    println!("{} {}!", g1, g2);
}
```

* `&m1` creates a **reference** (borrow).
* The parameter type `&String` means *“a reference to a String”*, not the String itself.
* `g1` doesn’t own the data — it just *borrows* it.
* So when `greet` ends, `m1` and `m2` are still valid in `main`.

This is *the foundation of Rust memory safety*.

---

### **Key Idea**

* **`m1` owns** the heap data `"Hello"`.
* **`g1` only points** to it temporarily.
* When `greet` finishes, **nothing gets freed** — because `g1` doesn’t own it.

That’s why references are called **non-owning pointers**.

---

## **Dereferencing — Accessing Data Behind Pointers**

You’ve seen `&` to *borrow*.
The opposite is `*` to *dereference* — to actually *use* the value behind a pointer.

Example:

```rust
fn main() {
    let mut x: Box<i32> = Box::new(1);
    let a: i32 = *x;     // read heap value → a = 1
    *x += 1;             // write heap value → x now points to 2

    let r1: &Box<i32> = &x;  
    let b: i32 = **r1;   // two dereferences to reach heap value

    let r2: &i32 = &*x;  // direct reference to heap value
    let c: i32 = *r2;    // one dereference
}
```

* `r1` points to the box on the stack → needs `**r1` to reach heap data.
* `r2` points directly to heap → only `*r2` needed.

---

Rust often *automatically inserts* these dereferences and references for you.

So, these are all equivalent:

```rust
let x: Box<i32> = Box::new(-1);
let x_abs1 = i32::abs(*x); // explicit
let x_abs2 = x.abs();      // implicit
assert_eq!(x_abs1, x_abs2);

let r: &Box<i32> = &x;
let r_abs1 = i32::abs(**r);
let r_abs2 = r.abs();
assert_eq!(r_abs1, r_abs2);

let s = String::from("Hello");
let s_len1 = str::len(&s);
let s_len2 = s.len();
assert_eq!(s_len1, s_len2);
```

Rust’s **dot syntax (`.`)** automatically dereferences as needed — so method calls feel natural.

---

## **Rust’s Core Safety Rule**

> **Pointer Safety Principle:**
> Data should never be **aliased** and **mutated** at the same time.

Aliasing = multiple access paths to the same data.
Mutation = modifying it.
Together = danger (use-after-free, data races, etc.).

Rust’s borrow checker enforces this rule.

---

### Example (Undefined Behavior if Allowed)

```rust
fn main() {
    let mut v = vec![1, 2, 3];
    let num: &i32 = &v[2];
    v.push(4);
    println!("Third element is {}", *num);
}
```

* `num` points into the vector’s heap.
* `v.push(4)` might reallocate the heap.
* `num` becomes a dangling pointer.
  If Rust didn’t stop you, you’d read invalid memory.

Compiler error:

```
error[E0502]: cannot borrow `v` as mutable because it is also borrowed as immutable
```

That’s the borrow checker saving you.

---

## **Permissions Model (Borrow Checker Logic)**

Rust internally tracks **permissions** for every variable:

| Permission | Meaning         |
| ---------- | --------------- |
| R          | Read            |
| W          | Write           |
| O          | Own (move/drop) |

Normally, variables have `R+O`.
`mut` adds `W`.

When you create a reference, permissions *shift temporarily*.

Example (safe version):

```rust
fn main() {
    let mut v = vec![1, 2, 3];
    let num: &i32 = &v[2];
    println!("Third element is {}", *num);
    v.push(4);
}
```

1. After borrow `&v[2]`:

   * `v` loses `W` and `O` (cannot mutate or move).
   * `num` gains `R`.
2. After `println!`:

   * `num` no longer used → `v` regains `W` and `O`.
3. Then `v.push(4)` works fine.

---

### **Places vs Variables**

Permissions apply to *places*, not just variables.

A *place* = anything assignable:

* `a`
* `*a`
* `a[0]`
* `a.field`
* combinations like `(*a)[0].1`

So you can mutate through a reference without reassigning the reference itself.

Example:

```rust
fn main() {
    let x = 0;
    let mut x_ref = &x;
    println!("{x_ref} {x}");
}
```

* `x_ref` can be reassigned (has W).
* `*x_ref` cannot be mutated (no W on pointee).

---

## **Mutable References**

So far, we had shared (`&T`) references.
Now comes unique (`&mut T`) references — they allow mutation, but no aliasing.

Example:

```rust
fn main() {
    let mut v = vec![1, 2, 3];
    let num: &mut i32 = &mut v[2];
    *num += 1;
    println!("Third element is {}", *num);
    println!("Vector is now {:?}", v);
}
```

Key observations:

1. When `num` exists, `v` loses all permissions — can’t be used or read.
2. `*num` gets `R` + `W` — it can read and modify `v[2]`.
3. After `num` dies (last use), `v` regains permissions.

That’s how Rust guarantees safety:
**No aliases if mutation exists.**

---

### **Downgrading a Mutable Reference**

You can create a shared (`&T`) reference *from* a mutable (`&mut T`) one:

```rust
fn main() {
    let mut v = vec![1, 2, 3];
    let num: &mut i32 = &mut v[2];
    let num2: &i32 = &*num;
    println!("{} {}", *num, *num2);
}
```

The borrow `&*num` removes write permission from `*num`, but keeps read.
So both can safely read at the same time — no mutation while aliasing.

---

## **Reference Lifetimes**

A reference’s **lifetime** = from where it’s created to its last use.

Example:

```rust
fn main() {
    let mut x = 1;
    let y = &x;
    let z = *y;
    x += z;
}
```

After `z = *y`, `y`’s lifetime ends → `x` regains `W` permission.

---

Control flow can split lifetimes too:

```rust
fn ascii_capitalize(v: &mut Vec<char>) {
    let c = &v[0];
    if c.is_ascii_lowercase() {
        let up = c.to_ascii_uppercase();
        v[0] = up;
    } else {
        println!("Already capitalized: {:?}", v);
    }
}
```

* In the `if` branch, `c` is used → `v` regains `W` only after mutation.
* In the `else` branch, `c` isn’t used → `v` regains `W` immediately.

Rust tracks this automatically.

---

## **Data Must Outlive References**

Rust enforces that **referenced data must live longer** than the reference itself.

Example:

```rust
fn main() {
    let s = String::from("Hello world");
    let s_ref = &s;
    drop(s);
    println!("{}", s_ref); // ❌
}
```

* `drop(s)` tries to free `s` while `s_ref` still exists.
* Borrowing removed `O` from `s`, but `drop` requires it → compile error.

---

### **Function-Level References (Flow Permission F)**

Inside functions, Rust must ensure *input/output references* are also safe.

Example:

```rust
fn first(strings: &Vec<String>) -> &String {
    let s_ref = &strings[0];
    s_ref
}
```

Perfectly fine — the reference returned (`s_ref`) points to data inside the input `strings`, which outlives it.

---

Now, consider this:

```rust
fn first_or<'a, 'b, 'c>(strings: &'a Vec<String>, default: &'b String) -> &'c String {
    if strings.len() > 0 {
        &strings[0]
    } else {
        default
    }
}
```

Rust can’t compile this.
It doesn’t know whether the returned `&String` comes from `strings` or `default`.
So it gives:

```
error[E0106]: missing lifetime specifier
```

That’s Rust saying: *“Tell me which one lives long enough!”*

---

Example of why that matters:

```rust
fn main() {
    let strings = vec![];
    let default = String::from("default");
    let s = first_or(&strings, &default);
    drop(default);
    println!("{}", s);
}
```

If `first_or` returned `default`, `s` would become invalid after `drop(default)`.
Hence, Rust prevents it unless lifetimes are declared explicitly.

We’ll fully cover this in **Chapter 10: Lifetimes**.

---

### **Another Example: Returning a Reference to Local Data**

```rust
fn return_a_string() -> &String {
    let s = String::from("Hello world");
    let s_ref = &s;
    s_ref
}
```

This is unsafe because `s` is dropped at the end of the function — so the returned reference would point to freed memory. Rust correctly refuses to compile it.

---

## **Summary**

* References let you access data *without taking ownership*.
* Created with `&` or `&mut`.
* Dereferenced with `*` (often implicit).
* Borrow checker ensures:

  * You can’t mutate and alias at once.
  * Permissions (R/W/O) are tracked and restored after use.
  * Data always outlives its references.

Rust’s reference system looks restrictive, but it’s what allows **C-level performance with absolute safety** — no garbage collector, no memory leaks, no data races.

You have come very far, now in the next part, we will cover some other important aspects of ownership.
