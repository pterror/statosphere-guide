# Gotchas

<div v-pre>

Known issues and non-obvious behaviors that affect people writing Statosphere configs.

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

## The "Initialization" phase does not run

**Problem:** The generator schema includes an `"Initialization"` option for the `phase` field, suggesting generators can run when the stage first loads. In the current release, this phase does not actually trigger.

**Workaround:** Use `"On Input"` with a condition that fires only when the variable you want to initialize is null:

```json
{
  "phase": "On Input",
  "condition": "isNull(myVariable)"
}
```

This runs the generator only on the first turn where `myVariable` has not been set yet, effectively initializing it.

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

Variables that appear in classifier or generator `updates` blocks are automatically saved to chat state. Variables that only have an `initialValue` with no updates (and are never written to by a classifier or generator) are not persisted — they reset to `initialValue` on every page load.

This is intentional behavior for constants. But if you expect a variable to keep its value across sessions and it is not being updated anywhere, check whether it is actually being written.

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
