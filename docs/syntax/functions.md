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

A comma-separated list of parameter names. These are the local variables available inside the function body. If a parameter has the same name as one of your config variables, the parameter takes priority inside the function — the global variable is not visible there.

```
"parameters": "value, lo, hi"
"parameters": "text, pattern"
"parameters": "a, b"
```

### body

A formula the function evaluates and returns. For most uses, a single mathjs expression is all you need:

```json
{ "body": "max(lo, min(hi, value))" }
{ "body": "contains(text, pattern) ? \"yes\" : \"no\"" }
{ "body": "a + b" }
```

Write one formula. It can use `?` and `:` for choices (see [Expressions](./expressions#conditionals-ternary)). The result is what the function gives back.

For cases where a single expression is not enough, the body can be full JavaScript — see [Advanced: full JavaScript bodies](#advanced-full-javascript-bodies) below.

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

This treats `pattern` as a literal string (not a regex), but it works reliably for simple substitution cases. See [Gotchas](../reference/gotchas) for more detail.

If you need real regex replace, the [advanced mode](#advanced-full-javascript-bodies) below lets you write it as JavaScript directly.

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

---

## Advanced: full JavaScript bodies

:::tip Advanced — Full JavaScript
The user manual presents function bodies as single-line mathjs expressions. That is accurate for the common case. This section covers the real underlying capability, which is broader.
:::

The body field is not limited to a single mathjs expression. Under the hood, Statosphere builds each function using [`new Function(...parameters, body)`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/CustomFunction.tsx#L17-L22), which means the body is a real JavaScript function body. Multi-line logic, control flow, and browser globals are all available.

This capability is not documented in the upstream user manual and was verified at commit [`e67cd9f`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/CustomFunction.tsx). It could change in a future release.

### Multi-line bodies and return

Because the body is a JavaScript function body, you must use an explicit `return` statement when your body spans more than one expression. A single-expression body without `return` happens to work because mathjs wraps the call result — but once you add `let` declarations or `if` statements, you need `return` explicitly.

```json
{
  "name": "rollWithAdvantage",
  "parameters": "modifier",
  "body": "const a = Math.floor(Math.random() * 20) + 1;\nconst b = Math.floor(Math.random() * 20) + 1;\nreturn Math.max(a, b) + modifier;"
}
```

Written more readably (the `body` string allows actual newlines in JSON):

```json
{
  "name": "rollWithAdvantage",
  "parameters": "modifier",
  "body": "const a = Math.floor(Math.random() * 20) + 1;\nconst b = Math.floor(Math.random() * 20) + 1;\nreturn Math.max(a, b) + modifier;"
}
```

### Available constructs

Inside a function body you can use:

- **`if` / `else if` / `else`** blocks
- **`for`**, **`while`** loops
- **`try` / `catch`**
- **Ternary** `condition ? a : b`
- **`let`**, **`const`**, **`var`** local declarations
- **`return`** to produce the function's value

### Available globals

`new Function` runs in the global scope of the browser tab. The following are available and safe to use:

| Global | Examples |
|--------|---------|
| `Math` | `Math.random()`, `Math.floor()`, `Math.max()`, `Math.abs()`, `Math.PI` |
| `JSON` | `JSON.parse(str)`, `JSON.stringify(obj)` |
| `String` | `String(value)` |
| `Number` | `Number(value)`, `Number.isFinite(x)` |
| `Array` | `Array.isArray(x)`, `Array.from(x)` |
| `Date` | `Date.now()` — milliseconds since epoch, useful as a seed |
| `RegExp` | `new RegExp(pattern, flags)` |
| `console` | `console.log(...)` — logs to the browser console, useful for debugging |

**Do not use:** `fetch`, `setTimeout`, `setInterval`, `Promise`, or anything that returns asynchronously. The function is called synchronously inside mathjs evaluation. Async calls will appear to return `undefined` and the result will be silently wrong.

**Do not use the DOM:** `document`, `window`, `localStorage`, etc. Accessing them may work in isolation but can interfere with the chat UI.

### How variables and other functions are injected

Statosphere scans each function body for references to your config variables and other custom functions. Any it finds become extra parameters, appended after your declared parameters. ([source — dependency resolution](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L193-L226), [source — argument rewriting](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L954-L984))

The practical result: inside a function body, you reference a variable named `hp` by writing `hp` — Statosphere passes the current value in automatically at call time. You do not have to declare `hp` as a parameter. The same applies to other custom functions your body calls.

One consequence: if a variable name and a parameter name collide, the explicitly declared parameter wins. Name your parameters clearly to avoid shadowing a variable unintentionally.

### Example: regex replace using JavaScript

The built-in `replace()` function has a bug. Here is a proper regex replace using JavaScript directly:

```json
{
  "name": "regexReplace",
  "parameters": "input, pattern, flags, replacement",
  "body": "return input.replace(new RegExp(pattern, flags || 'g'), replacement);"
}
```

Usage:

```
regexReplace(content, "\\[.*?\\]", "g", "")
```

### Example: shuffle an array

```json
{
  "name": "shuffle",
  "parameters": "arr",
  "body": "const a = arr.slice();\nfor (let i = a.length - 1; i > 0; i--) {\n  const j = Math.floor(Math.random() * (i + 1));\n  const tmp = a[i]; a[i] = a[j]; a[j] = tmp;\n}\nreturn a;"
}
```

### Comments in function bodies

`stripComments` runs on every function body before `new Function` is called. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L943-L952)) Single-line comments (`// ...`) and block comments (`/* ... */`) are both stripped. You can use comments during development, but they will not survive to the constructed function — no runtime effect either way.

### Errors and failure modes

If a function body throws a JavaScript error at definition time (during `new Function(...)`), the error is logged to the console and the function is not registered — any expression that calls it will fail at evaluation time.

If a function throws at call time (during `math.evaluate`), the error propagates up to the formula evaluator. For variable update expressions, the error is caught and logged, and the variable update is silently skipped — the variable keeps its previous value. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L406-L411))

In short: **errors are silent from the user's perspective.** If a function stops working, open the browser console to see why.

### Honest limits

- **No side effects on variables from inside the body.** Variables are passed by value. Assigning to `hp` inside a function body does nothing to the config variable `hp`. To update a variable, return a new value and use a classifier `setTo` or a variable update expression.
- **No async, no network, no DOM.** See the globals table above.
- **This is undocumented upstream.** The user manual frames functions as single-line mathjs expressions. Treat the JavaScript capability as a hatch for things that genuinely need it, not the default approach.

</div>
