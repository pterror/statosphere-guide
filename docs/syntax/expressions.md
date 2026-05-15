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

Returns `true` if `haystack` contains `needle`. Works for strings (substring check) and arrays (element check).

```
contains(mood, "angry")          → true if mood contains the word "angry"
contains(items, "sword")         → true if the items array includes "sword"
```

### capture(string, regex)

Returns the first capture group from a JavaScript regex match, or `null` if no match.

```
capture(content, "HP: (\\d+)")   → "42" if content contains "HP: 42"
capture(message, "feeling (\\w+)")
```

The regex is a JavaScript regex string. Use `\\d` for a digit, `\\w` for a word character, etc. Flags are not supported in this form.

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
