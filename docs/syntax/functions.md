# Functions

<div v-pre>

Functions let you define reusable pieces of logic once and call them from any expression in your config. If you find yourself writing the same formula in multiple places, a function is the right tool.

## Basic shape

```json
{
  "name": "clamp",
  "parameters": "value, lo, hi",
  "body": "max(lo, min(hi, value))"
}
```

Once defined, you call it in any expression:

```
clamp(hp + healAmount, 0, max_hp)
```

## Fields

### name

The name you use to call this function in expressions. Pick something descriptive and short. Case-sensitive when called.

### parameters

A comma-separated list of parameter names. These are the local variables available inside the function body. Parameters can shadow global variable names within the function.

```
"parameters": "value, lo, hi"
"parameters": "text, pattern"
"parameters": "a, b"
```

### body

A single mathjs expression. The value it evaluates to is what the function returns.

```json
{ "body": "max(lo, min(hi, value))" }
{ "body": "contains(text, pattern) ? \"yes\" : \"no\"" }
{ "body": "a + b" }
```

The body is a **mathjs expression**, not a JavaScript statement. You cannot use `return`, `if/else` blocks, or multiple lines. Use the ternary operator (`? :`) for conditionals.

## When to use a custom function

Use a custom function when:

- You repeat the same formula in more than one place
- A formula is long enough to obscure what it means
- You want to give a meaningful name to a computation

The built-in helpers (see [Expressions](./expressions)) cover most common needs. Add a custom function when you need something they do not.

## Examples

### Clamping a number between two bounds

```json
{
  "name": "clamp",
  "parameters": "value, lo, hi",
  "body": "max(lo, min(hi, value))"
}
```

Usage:

```
clamp(hp - damage, 0, max_hp)
```

### Converting a number to a descriptive label

```json
{
  "name": "hpLabel",
  "parameters": "current, maximum",
  "body": "current / maximum < 0.25 ? \"critical\" : current / maximum < 0.6 ? \"hurt\" : \"fine\""
}
```

Usage:

```
hpLabel(hp, max_hp)
```

### Working around the replace() bug

The built-in `replace()` has a known bug in the current release. Define your own version:

```json
{
  "name": "myReplace",
  "parameters": "input, pattern, replacement",
  "body": "join(split(input, pattern), replacement)"
}
```

This is less flexible than a real regex replace (it treats `pattern` as a literal string), but it works for simple substitution cases. See [Gotchas](../reference/gotchas) for more detail.

### A function that uses another function

Functions can call other functions defined earlier in the list:

```json
[
  {
    "name": "clamp",
    "parameters": "value, lo, hi",
    "body": "max(lo, min(hi, value))"
  },
  {
    "name": "applyDamage",
    "parameters": "current, dmg, maximum",
    "body": "clamp(current - dmg, 0, maximum)"
  }
]
```

</div>
