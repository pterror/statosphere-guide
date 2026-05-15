# Templating

<div v-pre>

Statosphere uses a simple `{{name}}` substitution system in expression strings, content rule modifications, generator prompts, and classifier templates.

## Standard Substitutions

`updateReplacements(userId, charId)` builds the substitution table ([`Stage.tsx:L670-L681`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L670-L681)):

| Tag | Expands to |
|-----|-----------|
| `{{user}}` | The user's display name |
| `{{persona}}` | The user's persona name |
| `{{char}}` | The character's name |
| `{{personality}}` | The character's personality field |
| `{{scenario}}` | The scenario text |

These are populated from the `userId` and `charId` lookups into the `characters` and `users` maps that were loaded during `load()`.

## Variable Substitutions

All variable names are also available as `{{variableName}}` tags. Lookup is **case-insensitive** — `{{Mood}}`, `{{mood}}`, and `{{MOOD}}` all resolve to the same variable. This is implemented in `replaceTags`.

## `replaceTags`

[`Stage.tsx:L683-L699`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L683-L699)

```typescript
replaceTags(source: string): string
```

The method uses the regex `{{[A-z]*}}` to find all tags, then does a case-insensitive lookup in `this.replacements` (the combined map of standard substitutions and variable values).

### The `[A-z]` Regex Quirk

The character class `[A-z]` in ASCII covers code points 65–122. This range includes all uppercase and lowercase letters, but it also includes the six punctuation characters between `Z` (90) and `a` (97): `[`, `\`, `]`, `^`, `_`, `` ` ``.

This means tags like `{{[var]}}` or `{{var_name}}` would be partially matched by the regex, while `{{var-name}}` (hyphen is 45, below `A`) would not. In practice, variable names are restricted to valid JavaScript identifiers, so `_` and digits (not covered by `[A-z]`) are the main edge cases. Variable names with underscores will have their underscores matched by the regex, so `{{my_var}}` works. Variable names with digits will not be found by `replaceTags`.

This is a known quirk — see [Gotchas](./gotchas#az-regex).

## Double-Quote Escaping

After tag substitution, any double-quote characters in the substituted values are escaped. This prevents variable values from breaking expression strings that embed the result inside double-quoted string literals.

## The `{{content}}` Tag

In content rule `modification` strings, `{{content}}` is a special tag that expands to the current message text being transformed. It is substituted before the standard `replaceTags` pass, so it participates in the same case-insensitive lookup as variables — there must not be a variable also named `content`, or it would shadow the current message text.

## `setContent`

[`Stage.tsx:L995-L998`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L995-L998)

`setContent(text)` updates `this.content` and also sets `this.replacements['content']` so that `{{content}}` always reflects the current message being processed.

</div>
