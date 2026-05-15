# Classifiers

<div v-pre>

Classifiers watch what is said and translate it into variable updates. You describe what you are looking for — "this message implies the user is attacking" — and the classifier decides whether that description fits, then writes to your variables if it does.

::: details How it works under the hood
Classifiers use a zero-shot NLP model hosted on Hugging Face. You do not train anything; you just write the descriptions. If that external service is unavailable, Statosphere falls back to a smaller local model — see [Introduction](../introduction) for more on what that means in practice.
:::

## What a classifier does

A classifier defines one or more **labels** — candidate descriptions of the message. Each label is tested against the message using the hypothesis template you provide. The model scores how well each label fits. If a label's score meets its threshold, the updates for that label are applied.

## Basic shape

```json
{
  "name": "Sentiment",
  "inputTemplate": "{{content}}",
  "inputHypothesis": "This message expresses {} sentiment.",
  "classifications": [
    {
      "label": "positive",
      "category": "sentiment",
      "threshold": 0.6,
      "updates": [
        { "variable": "mood", "setTo": "\"happy\"" }
      ]
    },
    {
      "label": "negative",
      "category": "sentiment",
      "threshold": 0.6,
      "updates": [
        { "variable": "mood", "setTo": "\"unhappy\"" }
      ]
    }
  ]
}
```

## Top-level fields

### name

A label for the classifier, used in logs and as a dependency reference. Must be unique.

### condition

A formula. The classifier only runs if this evaluates to true (or a number greater than zero). Omit or leave blank to always run.

Classifiers are network calls, so adding a condition to avoid unnecessary ones is good practice.

```json
{ "condition": "hp > 0" }
{ "condition": "inCombat" }
```

### inputTemplate

If set, this classifier runs on the user's message. The value is a string (which can include template tags) that is sent to the classifier model. Almost always `"{{content}}"`.

### responseTemplate

If set, this classifier runs on the bot's reply. Same format as `inputTemplate`.

You can set both — the classifier runs twice, once on input and once on response.

### inputHypothesis

The hypothesis template for input classification. The `{}` placeholder (notice: **single** curly braces, not `{{content}}`) is replaced with each label word in turn. This is different from `{{content}}` — `{}` is where the label gets plugged in; `{{content}}` is a template tag for message text.

```json
{ "inputHypothesis": "This message expresses {} sentiment." }
{ "inputHypothesis": "The user is attempting to {}." }
```

### responseHypothesis

Same as `inputHypothesis` but for the bot's reply.

### useLlm

Default: `false`. When `true`, sends the classification task to the chat LLM instead of the zero-shot NLP model. This can give better results for complex or nuanced tasks, but is slower.

### useHistory

Default: `false`. Only relevant when `useLlm` is `true`. When enabled, the chat history is included in the LLM request for additional context. Increases token usage and response time.

### historyContextSize

Default: `0` (use preset size). Only relevant when `useHistory` is `true`. Set a number to limit how much history is included, which can speed up LLM requests.

### dependencies

A comma-separated list of classifier or generator names that must complete before this classifier runs. Useful for ordering when one classifier's updates affect another's condition.

Most beginners will not need this field.

## The classifications array

Each entry in `classifications` is a label to test.

### label

The word or phrase substituted into `{}` in the hypothesis template. This is what the model scores.

```json
{ "label": "positive" }
{ "label": "taking damage" }
{ "label": "trying to move to a new location" }
```

### condition

A formula. This label is only included in the classification task if this evaluates to true (or a number greater than zero). Use this to remove irrelevant labels and make the model's job easier (and faster).

```json
{ "condition": "inCombat" }
```

### category

Labels in the same category compete: only the one with the highest score (above its threshold) has its updates applied. Labels without a category are independent.

```json
{ "category": "sentiment" }
{ "category": "action" }
```

For sentiment, you would put `positive`, `neutral`, and `negative` all in the `"sentiment"` category so only the best match wins.

### threshold

The minimum score (0–1) for this label's updates to be applied. [Default: 0.7](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Classifier.tsx#L70). Lower values make the classifier more trigger-happy; higher values make it more conservative.

```json
{ "threshold": 0.6 }
{ "threshold": 0.8 }
```

### dynamic

::: tip Advanced — skip if you're just getting started
This field is for cases where you do not know your label list ahead of time.
:::

Default: `false`. When `true`, the `label` field is a **formula** that evaluates to a string or an array of strings — generating multiple labels at runtime. Useful when your label list comes from a variable.

```json
{
  "label": "characterNames",
  "dynamic": true
}
```

If `characterNames` is `["Alice", "Bob", "Carol"]`, the classifier tests three labels: "Alice", "Bob", "Carol".

### updates

An array of variable updates to apply when this label wins.

```json
"updates": [
  { "variable": "mood", "setTo": "\"happy\"" },
  { "variable": "lastEvent", "setTo": "\"positive_input\"" }
]
```

Each update has:
- `variable` — the name of the variable to set
- `setTo` — an expression whose result is the new value

## Worked example: a three-label sentiment classifier

```json
{
  "name": "UserSentiment",
  "inputTemplate": "{{content}}",
  "inputHypothesis": "This message expresses {} feelings.",
  "classifications": [
    {
      "label": "positive",
      "category": "sentiment",
      "threshold": 0.65,
      "updates": [{ "variable": "mood", "setTo": "\"happy\"" }]
    },
    {
      "label": "neutral",
      "category": "sentiment",
      "threshold": 0.5,
      "updates": [{ "variable": "mood", "setTo": "\"neutral\"" }]
    },
    {
      "label": "negative",
      "category": "sentiment",
      "threshold": 0.65,
      "updates": [{ "variable": "mood", "setTo": "\"unhappy\"" }]
    }
  ]
}
```

All three labels share the category `"sentiment"`, so only the highest-scoring one above its threshold sets `mood`. If none reach their threshold, `mood` is not changed.

</div>
