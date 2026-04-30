# Day 12 - Chapter 11: Writing Automated Tests

<img width="364" height="157" alt="Chapter 11 topics" src="https://github.com/user-attachments/assets/a26dee1e-8a6a-49b5-8c5f-1ac79327cb64" />

**Why do we write tests**

- A simple reason is to ascertain whether or not an operation, a series of tasks, a function call, or any e2e event operates as desired.

Tests in Rust are basic functions that verify whether or not the non-test / target code is functioning in an expected manner.
Test functions typically perform these three actions:

- Set up any needed data or state.
- Run the code you want to test.
- Assert that the results are what you expect.

## How to write tests

Let's say you want to test a simple add function.

```bash
 cargo new adder --lib
```

This creates the crate below.

### Structuring Test Functions

src/lib.rs

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }
}
```

1. #[cfg(test)]:
   1. Excluded from normal builds (like cargo build).
   2. Module (in this case tests) is only compiled when running tests.
2. #[test] annotation: This attribute indicates this is a test function, so the test runner knows to treat this function as a test.
3. The tests are run when you run `cargo test` in the terminal.
4. use super::\* -> This line in the tests module marks it as a regular module that follows the usual visibility rules.

```bash

PS C:\Users\patra\Desktop\rust_daily_prapti\adder> cargo test
   Compiling adder v0.1.0 (C:\Users\patra\Desktop\rust_daily_prapti\adder)
    Finished `test` profile [unoptimized + debuginfo] target(s) in 0.72s
     Running unittests src\lib.rs (target\debug\deps\adder-804645d3c37b0252.exe)

running 1 test
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

   Doc-tests adder

running 0 tests

test result: ok. 0 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

### Explaining the output

- This shows that the one test was compiled, and it ran successfully as 1 passed and 0 failed.
- Doc-tests adder is for the results of any documentation tests. Rust can compile any code examples that appear in our API documentation and keeps your docs and your code in sync; documentation is in Chapter 14.

### Let's customize our tests to see what failure looks like

```rust
    #[test]
    fn another() {
        panic!("Make this test fail");
    }
```

Here, if you add this right below the it_works test inside `mod tests{}`:

- panic! is a macro that terminates execution; it causes the test to fail and prints an error message.
- The output difference is what it looks like when a test fails.

### Checking Results with assert!

The assert! macro is to ensure that some condition in a test is true.
We give the `assert!` macro an argument that returns a boolean value. If the value is `true`, then the test passes. If the value is `false`, the assert! macro internally calls panic! to cause the test to fail.

- Using the assert! macro helps us check that our code is functioning in the way we intend.

**Let's use an example**
In src/lib.rs

```rust
#[derive(Debug)]
struct Rectangle {
    width: u32,
    height: u32,
}

impl Rectangle {
    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }
}

// Above is a struct Rectangle, and an implementation on it.
// Below are the tests which are explained below.
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn larger_can_hold_smaller() {
        let larger = Rectangle {
            width: 8,
            height: 7,
        };
        let smaller = Rectangle {
            width: 5,
            height: 1,
        };

        assert!(larger.can_hold(&smaller));
    }
}
```

We have created a test larger_can_hold_smaller to test the functionality of the can_hold function to see whether or not this function returns a correct value for the two Rectangle structs with custom values, which should give true.

Running cargo test will return:

```bash

running 1 test
test tests::larger_can_hold_smaller ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

Since a (5, 1) can fit in (8, 7) based on the functions, here we used custom values to check whether or not the function runs properly.

There is also an easy way to check the opposite—that it should be false—just by using ! (not), so: assert!(!<condition>).

### Testing Equality with assert_eq! and assert_ne!

Not all functions simply return true or false; sometimes we want to check whether two values are exactly the same or even slightly different. Based on the function and how they should operate according to us, this is a common situation. The standard library provides a pair of macros to perform this test more conveniently:

- `assert_eq!` and `assert_ne!`: These macros compare two arguments for equality or inequality, respectively.

They’ll also print the two values if the assertion fails, which makes it easier to see why the test failed; conversely, the assert! macro only indicates that it got a false value for the == expression, without printing the values that led to the false value.

```rust
pub fn add_two(a: u64) -> u64 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_adds_two() {
        let result = add_two(2);
        assert_eq!(result, 5);
    }
}
```

This should get false, and in the terminal we see clearly:

```bash
running 1 test
test tests::it_adds_two ... FAILED
assertion `left == right` failed
  left: 4
 right: 5
test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

```

It clearly shows left and right values with an additional RUST_BACKTRACE = 1 suggestion to see the exact point of failure.

**assert_ne!**

- The assert_ne! macro will pass if the two values we give it are not equal and will fail if they are equal. This macro is most useful for cases when we’re not sure what a value will be, but we know what the value definitely shouldn't be.

Example: If there is a function which is random, but the value can never be 2, then we do an assert_ne!(function(), 2) to check that the function didn't return 2.

_Note: Under the surface, the assert_eq! and assert_ne! macros use the operators == and !=, respectively._

- When the assertions fail, these macros print their arguments using debug formatting, which means the values being compared must implement the `PartialEq` and `Debug` traits. All primitive types and most of the standard library types implement these traits.
- For structs and enums that you define yourself, you’ll need to implement PartialEq to assert equality of those types. You’ll also need to implement Debug to print the values when the assertion fails because both traits are derivable: `#[derive(PartialEq, Debug)]` on top of a struct.

### Adding Custom Failure Messages

Generally, let's say there are a lot of tests in your codebase which are huge functions; simply knowing whether or not the test failed is not enough. We also have the ability to add custom messages as optional arguments in `assert!`, `assert_eq!`, and `assert_ne!` macros.

**Example:**

Let's take src/lib.rs; the function greeting will obviously just return "Hello!", so the assert! will definitely fail. The format is:

- assert!(condition, "Error message");

```rust
pub fn greeting(name: &str) -> String {
    String::from("Hello!")
}

#[cfg(test)]
mod tests{
    use super::*
    #[test]
    fn greeting_contains_name() {
        let result = greeting("Carol");
        assert!(
            result.contains("Carol"),
            "\nGreeting did not contain name, value was `{result}` \n"
        );
    }
}
```

Here you see the line: Greeting did not contain name, value was `Hello!`

This shows that it clearly works and that even variables can be passed in those messages as part of the error message.

### Checking for panics with attribute should_panic

It’s important to check that our code handles error conditions as we expect, to check whether panic! macros run when we expect them to.

This test should_panic passes if the code inside the function panics; the test fails if the code inside the function doesn’t panic.

- #[should_panic]: This attribute basically marks a test as a must-panic test.
- We place the #[should_panic] attribute after the #[test] attribute and before the test function it applies to.
  Let's take this example: src/lib.rs

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 || value > 100 {
            panic!("Guess value must be between 1 and 100, got {value}.");
        }
        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic]
    fn greater_than_100() {
        Guess::new(200);
        // if the val is >100 or <1 new() will panic
    }
}
```

Part of the output on cargo test:

```bash
running 1 test
test tests::greater_than_100 - should panic ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

As you can see above, the function did panic! and, as a result, the test passed.

Now if we were to make a minor change:

```rust
Guess::new(80);
```

Then it won't panic and, as a result, the terminal output on running the test is:

```bash
running 1 test
test tests::greater_than_100 - should panic ... FAILED
note: test did not panic as expected at src\lib.rs:20:8

test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s
```

- We don’t get a very helpful message in this case, but when we look at the test function, we see that it’s annotated with #[should_panic]. The failure we got means that the code in the test function did not cause a panic.

- Tests that use `should_panic` can be imprecise. A `should_panic` test would pass even if the test panics for a different reason from the one we were expecting. To make `should_panic` tests more precise, we can add an optional `expected` parameter to the `should_panic` attribute. The test harness will make sure that the failure message contains the provided text.
- The expected parameter allows you to check the panic message: **it’s a substring match.**

```rust
pub struct Guess {
    value: i32,
}

impl Guess {
    pub fn new(value: i32) -> Guess {
        if value < 1 {
            panic!(
                "Guess value must be greater than or equal to 1, got {value}."
            );
        } else if value > 100 {
            panic!(
                "Guess value must be less than or equal to 100, got {value}."
            );
        }

        Guess { value }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    #[should_panic(expected = "blah blah")]
    fn greater_than_100() {
        Guess::new(200);
    }
}

```

This will fail since the panic message does not contain "blah blah".

```bash
running 1 test
test tests::greater_than_100 - should panic ... FAILED
Guess value must be less than or equal to 100, got 200.
note: panic did not contain expected string
      panic message: "Guess value must be less than or equal to 100, got 200."
 expected substring: "blah blah"
test result: FAILED. 0 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

```

- The failure message indicates that this test did indeed panic as we expected, but the panic message did not include the expected string.
- When part of the panic message contains "blah blah", then the test will pass.

So then, we can figure out where our bug is.

### Using Result<T, E> in Tests

The Result enum is very useful and extensively used; we can modify our tests to return Ok(()) or Err() type.

```rust
pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn it_works() -> Result<(), String> {
        let result = add(2, 2);

        if result == 4 {
            Ok(())
        } else {
            Err(String::from("two plus two does not equal four"))
        }
    }
}
```

- The it_works function now has the Result<(), String> return type. In the body of the function, rather than calling the assert_eq! macro, we return Ok(()) when the test passes and an Err with a String inside when the test fails.

- Writing tests so that they return a Result<T, E> enables you to use the question mark operator in the body of tests, which can be a convenient way to write tests that should fail if any operation within them returns an Err variant.

You can’t use the `#[should_panic]` annotation on tests that use `Result<T, E>`. To assert that an operation returns an Err variant, don’t use the question mark operator on the `Result<T, E>` value. Instead, use `assert!(value.is_err())`.

Now that you know several ways to write tests, let's see what happens when we run our tests and explore the different options we can use with cargo test.

## Controlling How Tests Are Run

1. cargo run compiles your code and then runs the resultant binary.
2. cargo test compiles your code in test mode and runs the resultant test binary.

**Separators --**

cargo test is followed by the separator -- and then the flags that go to the test binary.

### Running Tests in Parallel or Consecutively

If you don’t want to run the tests in parallel or if you want more fine-grained control over the number of threads used, you can send the --test-threads flag and the number of threads you want to use to the test binary. Take a look at the following example:

```bash
cargo test -- --test-threads=1
```

We set the number of test threads to 1, telling the program not to use any parallelism.

Running the tests using one thread will take longer than running them in parallel, but the tests won’t interfere with each other if they share state.

### Showing Function Output

Let's take a function that prints the value of its parameter and returns 10, as well as a test that passes and a test that fails.

src/lib.rs

```rust

fn prints_and_returns_10(a: i32) -> i32 {
    println!("I got the value {a}");
    10
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn this_test_will_pass() {
        let value = prints_and_returns_10(4);
        assert_eq!(value, 10);
    }

    #[test]
    fn this_test_will_fail() {
        let value = prints_and_returns_10(8);
        assert_eq!(value, 5);
    }
}

```

The output to this:

```bash
running 2 tests
test tests::this_test_will_pass ... ok
test tests::this_test_will_fail ... FAILED

failures:

---- tests::this_test_will_fail stdout ----
I got the value 8

thread 'tests::this_test_will_fail' panicked at src\lib.rs:20:9:
assertion `left == right` failed
  left: 10
 right: 5
note: run with `RUST_BACKTRACE=1` environment variable to display a backtrace


failures:
    tests::this_test_will_fail

test result: FAILED. 1 passed; 1 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s

```

The tests which fail:
The output from the test that failed, "I got the value 8", appears in the section of the test summary output, which also shows the cause of the test failure.

Now, if we want to see printed values for passing tests as well, we can tell Rust to also show the output of successful tests with --show-output:

cargo test -- --show-output

### Running a Subset of Tests by Name

Running a full test suite can sometimes take a long time, especially if you are working on only certain small sections and just want to check if those sections work.

To show how to only run certain tests, let's take this example:

```rust
pub fn add_two(a: u64) -> u64 {
    a + 2
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn add_two_and_two() {
        let result = add_two(2);
        assert_eq!(result, 4);
    }

    #[test]
    fn add_three_and_two() {
        let result = add_two(3);
        assert_eq!(result, 5);
    }

    #[test]
    fn one_hundred() {
        let result = add_two(100);
        assert_eq!(result, 102);
    }
}
```

Now to run, let's say, just the one_hundred test, we can use the command: cargo test one_hundred. Then the other tests will be filtered out, and only one test will run, as you can see below.

```bash

$ cargo test one_hundred
running 1 test
test tests::one_hundred ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 2 filtered out; finished in 0.00s

```

**Filtering to Run Multiple Tests**

We can specify part of a test name, and any test whose name matches that value will be run. For example, because two of our tests’ names contain add, we can run those two by running cargo test add.

```bash
$ cargo test add
running 2 tests
test tests::add_three_and_two ... ok
test tests::add_two_and_two ... ok

test result: ok. 2 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 0.00s
```

This allows you to run two tests beginning with add and filter out the one which wasn't.

### Ignoring Tests Unless Specifically Requested

Sometimes you don't want to run specific tests for any number of reasons, from them being time-consuming to being for future implementations. To exclude them during most runs of cargo test, we have an attribute called `#[ignore]` to ignore them.

Let's take an example: src/lib.rs

```rust
pub fn add(a : u64, b : u64 ) -> u64 {
    a+b
}

#[cfg(test)]
mod tests {
    use std::{thread::sleep, time::Duration};

    use super::*;

    #[test]
    fn it_works() {
        let result = add(2, 2);
        assert_eq!(result, 4);
    }

    #[test]
    #[ignore]
    fn expensive_test()->Result<(), String> {
        // code that takes long to run
        sleep(Duration::new(10,0)); // pauses execution for 10 secs
        Ok(())
    }
}
```

Now, on running the code above with a simple cargo test, it gives the below section, i.e., ignores the test:

```bash
$ cargo test
running 2 tests
test tests::expensive_test ... ignored
test tests::it_works ... ok

test result: ok. 1 passed; 0 failed; 1 ignored; 0 measured; 0 filtered out; finished in 0.00s

```

Now to run the ignored test, we use `cargo test -- --ignored`.
When we run that, the ignored test(s) are run.

```bash
$ cargo test -- --ignored
running 1 test
test tests::expensive_test ... ok

test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 1 filtered out; finished in 10.00s
```

## Test Organization

1. Unit tests: Small and more focused, testing one module in isolation at a time; can test private interfaces.
2. Integration tests: Entirely external to your library and use your code in the same way any other external code would, using only the public interface and potentially exercising multiple modules per test.

### Unit Tests

**Private Function Tests**
There are different opinions in the testing community about whether or not private functions should be tested directly.
But Rust does allow you to test private functions.

Example: src/lib.rs

```rust
pub fn add_two(a: i32) -> i32 {
    internal_adder(a, 2)
}

fn internal_adder(a: i32, b: i32) -> i32 {
    a + b
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn internal() {
        assert_eq!(4, internal_adder(2, 2));
    }
}
```

Here, `internal_adder` is not marked as `pub`,
But because the `tests` module is a child of the root module,
we can use `use super::*;` to bring it into scope and test it directly.

### Integration Tests

**The tests Directory**

Example structure:

```text
adder
├── Cargo.toml
├── src
│   └── lib.rs
└── tests
    └── integration_test.rs
```

tests/integration_test.rs

```rust
use adder;

#[test]
fn it_adds_two() {
    assert_eq!(4, adder::add_two(2));
}
```

**Submodules in Integration Tests**
To avoid this, we use the older naming convention for modules: create `tests/common/mod.rs` instead.

## Summary

Rust’s testing features provide a way to specify how code should function to ensure that it continues to work as you expect.

1. We learned multiple macros and attributes like assert!, assert_eq!, assert_ne!, #[cfg(test)], #[test], and #[ignore], and using the Result enum with tests.

2. Different ways of structuring tests, grouping and running only certain ones, and many more of Rust's features.

Unit tests exercise different parts of a library separately and can test private implementation details.

Integration tests check that many parts of the library work together correctly, and they use the library’s public API to test the code in the same way external code will use it.
