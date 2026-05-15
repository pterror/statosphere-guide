# Expressions

<div v-pre>

Almost every formula field in Statosphere — variable updates, classifier conditions, generator conditions, content rule conditions and modifications — accepts an **expression**. Expressions are evaluated using [mathjs](https://mathjs.org/), a JavaScript math library with a friendly syntax.

This page covers everything you need to write useful expressions: literals, operators, variables, string handling, Statosphere's built-in helpers, and template tags.

## Literals

```
42          a number
3.14        a decimal
true        boolean true
false       boolean false
"hello"     a string (double quotes)
```

Single quotes do not work for strings in mathjs. Always use double quotes.

## Arithmetic

```
hp - 10
damage * 1.5
floor(hp / max_hp * 100)
```

Standard operators: `+`, `-`, `*`, `/`, `^` (power), `%` (mod).

## Comparisons

```
hp < 25
mood == "angry"
mood != "neutral"
turnCount >= 10
score <= 0
```

Use `==` and `!=` (not `===`/`!==`). Comparisons return `true` or `false`.

## Boolean logic

```
hp < 25 and mood == "angry"
hp > 0 or hasShield
not defeated
```

Use the words `and`, `or`, `not` — not `&&`, `||`, `!`.

## Conditionals (ternary)

```
hp < 25 ? "critical" : "fine"
turnCount > 5 ? "late" : "early"
```

The syntax is `condition ? valueIfTrue : valueIfFalse`. You can nest them:

```
hp < 10 ? "dying" : hp < 50 ? "hurt" : "fine"
```

## Referencing variables

Use a variable's name directly in any expression. Variable names are case-insensitive.

```
hp + 10
mood == "happy"
"Current HP: " + hp
```

If the variable does not yet exist (first turn before it is set), it evaluates to `null`.

## String concatenation

Use `+` to join strings:

```
"Hello, " + name + "!"
"HP: " + hp + " / " + max_hp
```

If you concatenate a number, it becomes a string automatically.

## Statosphere built-in helpers

These functions are not standard mathjs — Statosphere registers them on top. Each takes specific arguments and returns a value.

### split(string, separator)

Splits a string into an array.

```
split("a,b,c", ",")    → ["a", "b", "c"]
split(itemList, "|")
```

### contains(haystack, needle)

Returns `true` if `haystack` contains `needle`. Works for strings (substring check, **case-insensitive**) and arrays (element check, case-sensitive). ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L145-L149))

```
contains(mood, "Angry")          → true if mood contains "angry" (any case)
contains(items, "sword")         → true only if items includes exactly "sword"
```

### capture(string, regex, regexFlags)

Returns all capture groups from all matches as an array, or an empty array if no match. The third argument `regexFlags` is optional; it defaults to `"g"` (global match). ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L151-L154))

```
capture(content, "HP: (\\d+)")       → [["42"]] if content contains "HP: 42"
capture(message, "feeling (\\w+)")   → [["happy"]] if message contains "feeling happy"
capture(text, "(\\w+)=(\\w+)", "g")  → [["a","1"],["b","2"]] for "a=1 b=2"
```

Each element of the returned array is the array of capture groups for one match. If you want a single string, access `capture(...)[0][0]`.

The regex is a JavaScript regex string. Use `\\d` for a digit, `\\w` for a word character, etc.

### replace(input, regex, newValue)

Replaces matches of a regex in `input` with `newValue`.

```
replace(content, "\\[.*?\\]", "")   → strips bracketed text
replace(name, "\\s+", "_")
```

**Known bug:** the current release has a typo in this built-in that causes it to look up `regexString` instead of the regex argument. If you hit unexpected behavior with `replace`, define your own version as a custom function instead. See [Gotchas](../reference/gotchas).

### join(array, separator)

Joins an array into a string.

```
join(items, ", ")    → "sword, shield, potion"
join(tags, " | ")
```

### substring(string, start, end)

Returns the characters from index `start` up to (but not including) `end`.

```
substring("hello world", 0, 5)   → "hello"
substring(content, 0, 100)       → first 100 characters
```

Indices are zero-based.

### isNull(value)

Returns `true` if the value is `null` or `undefined`.

```
isNull(mood)       → true if mood has never been set
isNull(lastScene)
```

### isNotNull(value)

Returns `true` if the value is not `null` or `undefined`.

```
isNotNull(recap) ? recap : "No recap yet."
```

## All mathjs built-ins

Because expressions run in mathjs, the full mathjs function library is available. Useful examples:

```
abs(value)                   → absolute value
floor(3.9)                   → 3
ceil(3.1)                    → 4
round(3.567, 2)              → 3.57
min(a, b)                    → smaller of a, b
max(a, b)                    → larger of a, b
mean(1, 2, 3)                → 2
random(1, 10)                → random decimal between 1 and 10
floor(random(1, 7))          → random integer 1–6 (a die roll)
```

Full list: [mathjs function reference](https://mathjs.org/docs/reference/functions.html).

## Template tags

Inside **string literals** within expressions, you can embed template tags that get replaced with live values before the expression is evaluated. The tag syntax is `{{name}}`, and tags are case-insensitive.

### Character and chat tags

| Tag | Replaced with |
|---|---|
| `{{user}}` | The name of the current user |
| `{{char}}` | The character's name |
| `{{persona}}` | The user's persona description |
| `{{personality}}` | The character's personality field |
| `{{scenario}}` | The scenario field |
| `{{content}}` | The current message being processed |

### Variable tags

Any variable name works as a tag:

```
"{{hp}} / {{max_hp}}"     → "42 / 100"
"Mood: {{mood}}"          → "Mood: happy"
```

### Where tags can appear

Tags are only expanded inside string literals. They do **not** work as bare variable references.

```
"HP is {{hp}}"      ✓  works — tag inside a string
hp                  ✓  works — direct variable reference
{{hp}}              ✗  does not work outside a string
```

### Tag regex and character set

The tag substitution regex is `{{([A-z]*)}}` ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L695)). The `A-z` range in ASCII includes not just letters but also `[`, `\`, `]`, `^`, `_`, and `` ` `` (characters between `Z` and `a`). Variable names should stick to letters, digits, and underscores to avoid ambiguity.

### Double-quote escaping

Before a tag value is substituted into an expression string, any `"` characters in the value are escaped to `\"`. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L692)) This prevents the value from breaking the surrounding string literal, but it means tag values are always inserted as part of a quoted string — you cannot use a tag to inject raw expression syntax.

### Example: a Stage Direction that uses both

```json
{
  "category": "Stage Direction",
  "condition": "true",
  "modification": "\"{{char}} currently feels \" + mood + \". HP: \" + hp + \"/\" + max_hp"
}
```

Or using tags for everything:

```json
{
  "modification": "\"{{char}} currently feels {{mood}}. HP: {{hp}}/{{max_hp}}\""
}
```

Both approaches work. The second is shorter; the first allows arithmetic on `mood` or `hp` inline.

</div>
