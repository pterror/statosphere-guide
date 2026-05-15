# Quick Reference

<div v-pre>

A single-page cheat sheet of all field names, defaults, valid values, built-in functions, and template tags.

## Top-level config keys

| Key | Type | Description |
|-----|------|-------------|
| `variables` | array | Variable definitions |
| `functions` | array | Custom function definitions |
| `classifiers` | array | Classifier definitions |
| `generators` | array | Generator definitions |
| `content` | array | Content rule definitions |

## Variable fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | yes | — | Identifier used in expressions |
| `initialValue` | yes | — | Expression for starting value |
| `perTurnUpdate` | no | (none) | Expression evaluated at turn start, before input classifiers |
| `postInputUpdate` | no | (none) | Expression evaluated after input classifiers run |
| `preResponseUpdate` | no | (none) | Expression evaluated when bot reply arrives, before response classifiers |
| `postResponseUpdate` | no | (none) | Expression evaluated after response classifiers run |

## Function fields

| Field | Required | Description |
|-------|----------|-------------|
| `name` | yes | Identifier used to call the function |
| `parameters` | no | Comma-separated parameter list |
| `body` | yes | mathjs expression; its value is returned |

## Classifier fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | yes | — | Unique name |
| `condition` | no | (always) | Expression; classifier skipped if falsy |
| `inputTemplate` | no | (no input classification) | Template for classifying user messages |
| `inputHypothesis` | no | — | Hypothesis for input; `{}` replaced by label |
| `responseTemplate` | no | (no response classification) | Template for classifying bot replies |
| `responseHypothesis` | no | — | Hypothesis for response; `{}` replaced by label |
| `useLlm` | no | `false` | Use chat LLM instead of zero-shot model |
| `useHistory` | no | `false` | Include chat history in LLM request |
| `historyContextSize` | no | `0` | Max tokens of history to include (0 = preset) |
| `dependencies` | no | (none) | Comma-separated names that must run first |

### Classification (per label) fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `label` | yes | — | Text substituted into hypothesis (or expression if `dynamic: true`) |
| `condition` | no | (always) | Expression; label excluded from task if falsy |
| `category` | no | (none) | Labels sharing a category compete; highest wins |
| `threshold` | no | `0.7` | Minimum score (0–1) to trigger updates |
| `dynamic` | no | `false` | If true, `label` is an expression returning string or array |
| `updates` | no | [] | Array of `{variable, setTo}` updates to apply |

## Generator fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `name` | yes | — | Unique name |
| `type` | no | `"Text"` | `"Text"`, `"Image"`, or `"Image-to-Image"` |
| `phase` | yes | — | `"On Input"` or `"On Response"` |
| `condition` | no | (always) | Expression; generator skipped if falsy |
| `lazy` | no | `false` | Stored but currently has no effect — stage always waits for all generators |
| `prompt` | no | — | Expression for the generation prompt |
| `dependencies` | no | (none) | Comma-separated names that must run first |
| `updates` | no | [] | Array of `{variable, setTo}` updates; `{{content}}` = result |

### Text generator additional fields

| Field | Default | Description |
|-------|---------|-------------|
| `includeHistory` | `false` | Include chat history in request |
| `historyContextSize` | `0` | Max tokens of history (0 = preset) |
| `minTokens` | `"50"` | Minimum response tokens |
| `maxTokens` | `"250"` | Maximum response tokens |
| `stoppingStrings` | `""` | Comma-delimited strings that end the response |
| `retryCondition` | `""` | Expression; if truthy, retry (max 3) |

### Image generator additional fields

| Field | Default | Description |
|-------|---------|-------------|
| `negativePrompt` | — | Content to exclude |
| `aspectRatio` | — | See valid values below |
| `removeBackground` | `false` | Attempt background removal |

### Aspect ratio valid values

`"21:9"`, `"16:9"`, `"3:2"`, `"5:4"`, `"1:1"`, `"4:5"`, `"2:3"`, `"9:16"`, `"9:21"`

### Image-to-Image additional fields

| Field | Default | Description |
|-------|---------|-------------|
| `sourceImageUrl` | — | Expression evaluating to image URL |
| `imageToImageType` | `"edit"` | `"edit"`, `"canny"`, or `"face"` — see [Gotchas](./gotchas) |
| `removeBackground` | `false` | Attempt background removal |

## Content rule fields

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `category` | yes | — | `"Input"`, `"Post Input"`, `"Stage Direction"`, `"Response"`, `"Post Response"` |
| `condition` | no | (always) | Expression; rule skipped if falsy |
| `modification` | no | `"{{content}}"` | Expression for the new content; `{{content}}` = current content |

## Statosphere built-in functions

| Function | Returns | Notes |
|----------|---------|-------|
| `split(string, separator)` | array | Splits string by separator |
| `contains(haystack, needle)` | boolean | Works for strings and arrays |
| `capture(string, regex, regexFlags?)` | array | All capture groups of all matches; optional flags (default `"g"`) |
| `replace(input, regex, newValue)` | string | Has a bug — see [Gotchas](./gotchas) |
| `join(array, separator)` | string | Joins array elements |
| `substring(string, start, end)` | string | Zero-based, end exclusive |
| `isNull(value)` | boolean | True if null or undefined |
| `isNotNull(value)` | boolean | True if not null or undefined |

All [mathjs functions](https://mathjs.org/docs/reference/functions.html) are also available: `abs`, `ceil`, `floor`, `round`, `min`, `max`, `mean`, `random`, and many more.

## Template tags

| Tag | Replaced with |
|-----|---------------|
| `{{user}}` | Current user's name |
| `{{char}}` | Character's name |
| `{{persona}}` | User's persona description |
| `{{personality}}` | Character's personality field |
| `{{scenario}}` | Scenario field |
| `{{content}}` | Current message being processed |
| `{{variableName}}` | Value of any variable (case-insensitive) |

Tags must appear inside string literals in expressions: `"Hello, {{user}}!"`.

## Special variables

| Name | Effect |
|------|--------|
| `background` | URL is applied as the chat background image |
| `debugMode` | If truthy, enables verbose console logging |

</div>
