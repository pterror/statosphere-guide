# Gotchas

<div v-pre>

Known issues and non-obvious behaviors that affect people writing Statosphere configs.

## The `lazy` field has no effect

**Problem:** Generators have a `lazy` field described as making a generator run without holding up the chat. In the current release, this field is stored but never checked in the execution loop. All generators block the response regardless of `lazy: true`.

**Workaround:** There is no workaround for true background generation. Do not rely on `lazy` to reduce latency.

**Source:** `lazy` is set in `Generator.tsx` but absent from all conditional logic in `Stage.tsx` at commit `e67cd9f`. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L849-L851))

---

## The imageToImageType typo

**Problem:** In Image-to-Image generators, the field should be `imageToImageType`, but the source code reads from a misspelled key `iamgeToImageType`. Setting `imageToImageType` to `"canny"` or `"face"` has no effect — the stage always gets `undefined` and defaults to `"edit"`.

**Workaround:** Until this is fixed upstream, Image-to-Image generators always use the `"edit"` (Qwen) model regardless of what you write in `imageToImageType`.

**Source:** the misspelling exists in the current release at commit `e67cd9f`.

---

## The replace() built-in bug

**Problem:** The built-in `replace(input, regex, newValue)` function has a bug where it references the local variable name `regexString` instead of the actual regex argument. Depending on your expression context, this may produce unexpected behavior or an error.

**Workaround:** Define your own replace function that uses `split` and `join` for simple cases:

```json
{
  "name": "myReplace",
  "parameters": "input, pattern, replacement",
  "body": "join(split(input, pattern), replacement)"
}
```

This treats `pattern` as a literal string (not a regex), but it works reliably for simple substitution.

---

## The "Initialization" phase does not exist

**Problem:** Some earlier documentation or creator notes referenced an `"Initialization"` phase for generators. This phase is not present in the current schema ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/generator-schema.json)) and the code never triggers initialization-phase generators.

**Workaround:** Use `"On Input"` with a condition that fires only when the variable you want to initialize is null:

```json
{
  "phase": "On Input",
  "condition": "isNull(myVariable)"
}
```

This runs the generator only on the first turn where `myVariable` has not been set yet, effectively initializing it.

---

## `/setVar` values are evaluated as expressions, not raw strings

**Problem:** The value after `=` in `/setVar` is passed to `updateVariable`, which evaluates it as a mathjs expression. Writing `/setVar mood=happy` does not set `mood` to the string `"happy"` — it tries to evaluate the variable `happy`, which is likely `null` or undefined.

**Fix:** Always wrap string values in quotes: `/setVar mood="happy"`. Numeric and boolean values do not need quotes.

**Source:** ([Stage.tsx L831](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L831))

---

## Template tags only expand inside string literals

**Problem:** Template tags like `{{hp}}` only work inside string literals in expressions. They are not a general-purpose variable reference syntax.

This works:

```
"HP: {{hp}}"
```

This does not:

```
{{hp}} + 10
```

**Fix:** Reference variables by name directly in expressions:

```
hp + 10
```

Use template tags only when building string output.

---

## String values in initialValue need escaped quotes

**Problem:** Every formula field in Statosphere is evaluated as a mathjs expression. If you want a variable to start as a string value like `neutral`, you need to write it as a string literal in the expression — which means quotes inside quotes.

In JSON, that looks like:

```json
{ "initialValue": "\"neutral\"" }
```

Writing `"initialValue": "neutral"` makes the expression parser look for a variable named `neutral`, which likely does not exist and evaluates to null.

**Fix:** Always wrap string values in escaped double quotes in JSON: `"\"yourstring\""`.

---

## Variables referenced by classifiers or generators are auto-persisted

At load time, Statosphere scans every classifier and generator `updates` block and marks the target variables as non-constant. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L272-L304)) Non-constant variables are saved to chat state between turns; constant variables (those with no update formulas and no classifier/generator writes) reset to `initialValue` on every page load.

If you expect a variable to keep its value across sessions and it is not being updated anywhere, check whether it is actually being written by a classifier or generator `updates` block, or has at least one update formula.

---

## Config changes do not create version history entries

Chub.ai tracks version history for bots, but changes to a stage's configuration do not appear to create a new history entry. If you accidentally paste bad config and save, you may not be able to easily recover the previous config from version history.

**Recommendation:** Copy your working config to a separate text file before making changes.

---

## Chub exclusivity

Stages are a Chub.ai front-end feature. Users accessing your bot through any other interface (direct API, SillyTavern, etc.) will not see any Statosphere effects. Consider noting this in your bot's creator notes.

---

## Zero-shot backend availability

The zero-shot classifier uses an external Hugging Face Space ([Ravenok/statosphere-backend](https://huggingface.co/spaces/Ravenok/statosphere-backend)) maintained by the author. If this endpoint is down or has exhausted its GPU quota, Statosphere falls back to a much smaller local model. Results in fallback mode are noticeably worse.

The backend also blocks requests from origins other than the author's own stages as an anti-abuse measure.

</div>
