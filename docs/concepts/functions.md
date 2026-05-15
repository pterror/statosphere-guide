# Functions

Custom functions let you define reusable mathjs expressions that can be called from variable update formulas, classifier conditions, generator prompts, and content rule conditions. They are registered with the mathjs evaluator during `load()`.

## CustomFunction

[`CustomFunction.tsx:L3-L13`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/CustomFunction.tsx#L3-L13)

```typescript
class CustomFunction {
  name: string
  parameters: string    // comma-separated parameter names
  dependencies: string  // initially '', filled in during load()
  body: string          // passed through stage.stripComments
}
```

`dependencies` starts empty. During `load()`, the stage computes a dependency closure across all custom functions and fills in which other custom functions each function calls.

## Registration with mathjs

[`Stage.tsx:L141-L184`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L141-L184)

Built-in string functions are registered first. These are wrapped in `math.import()` calls that install them as mathjs symbols, making them available in any expression. The built-ins are:

| Name | Behavior |
|------|----------|
| `split(str, sep)` | Split string on separator, returns array |
| `contains(str, sub)` | Substring test, returns boolean |
| `capture(str, regex)` | Returns first capture group match |
| `replace(str, regex, repl)` | Regex replace — **see bug note below** |
| `join(arr, sep)` | Join array to string |
| `substring(str, start, end)` | Slice |
| `isNull(val)` | Null/undefined check |
| `isNotNull(val)` | Inverse null check |

### The `replace` Bug

[`Stage.tsx:L155-L160`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L155-L160)

The `replace` built-in implementation references `regexString` — a variable that is never declared in scope at that point. This causes the function to throw a `ReferenceError` when called. The `replace` built-in is effectively broken. Callers that need regex replacement must work around this by using a custom function or alternative built-ins.

## Dependency Closure

[`Stage.tsx:L193-L226`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L193-L226)

Because mathjs functions can call each other, a function `f` that calls `g` needs `g`'s logic available when `f` executes. Statosphere resolves this by computing a transitive dependency closure: for each function, it collects all custom functions it transitively calls and concatenates their bodies into a single `new Function(...)` call.

The dependency list is stored in `CustomFunction.dependencies` (a comma-separated string) and later used during argument rewriting.

## Call-Site Argument Rewriting

[`Stage.tsx:L228-L247`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L228-L247)

Custom functions receive their dependencies as additional trailing arguments. This means every call site must be rewritten to append the dependency values. The `updateFunctionArguments` method ([`Stage.tsx:L954-L984`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L954-L984)) scans an expression string for calls to known custom functions and rewrites their argument lists using a paren-balanced parser.

**Why this is needed:** mathjs does not support closures. A registered function cannot reference other registered functions by name at call time. Statosphere works around this by injecting dependencies as explicit arguments, effectively inlining the dependency graph at each call site.

## `createFunction`

[`CustomFunction.tsx:L16-L24`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/CustomFunction.tsx#L16-L24)

```typescript
function createFunction(cf: CustomFunction): Function {
  const allParams = cf.parameters + (cf.dependencies ? ', ' + cf.dependencies : '')
  return new Function(allParams, cf.body)
}
```

This creates a native JavaScript `Function` with the parameter list being the declared parameters concatenated with the dependency function names.

## JSON Shape

```json
{
  "functions": [
    {
      "name": "clamp",
      "parameters": "val, lo, hi",
      "body": "return Math.max(lo, Math.min(hi, val));"
    }
  ]
}
```

After registration, `clamp(moodScore, 0, 100)` is valid in any expression field. If `clamp` itself called another custom function, the stage would append that function as an additional parameter automatically.
