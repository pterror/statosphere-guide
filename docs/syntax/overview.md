# Config Overview

<div v-pre>

Your config is one settings file that can have up to five sections. Every section is optional — omit any you do not need.

```json
{
  "variables": [...],
  "functions": [...],
  "classifiers": [...],
  "generators": [...],
  "content": [...]
}
```

You paste this object into the "Configuration" field in Statosphere's config modal on Chub.ai. The easiest way to produce it is the [Statosphere editor](https://lord-raven.github.io/statosphere-editor/), but it is plain JSON and you can write or edit it by hand.

## What each section does

### variables

A list of named values that Statosphere tracks and updates as the conversation progresses. You read them in expressions (using their name), display them in content rules (using template tags), and write to them from classifiers and generators.

See [Variables](./variables).

### functions

A list of custom helper functions you write once and call from any expression elsewhere in the config. Useful for logic you need in several places.

See [Functions](./functions).

### classifiers

A list of classification tasks. Each one watches the user's message, the bot's reply, or both, and updates variables based on what it detects. Classifiers use either a zero-shot NLP model or the chat LLM itself.

See [Classifiers](./classifiers).

### generators

A list of extra generation tasks. Each one fires an additional LLM or image-generation call and stores the result in one or more variables.

See [Generators](./generators).

### content

A list of rules that modify what text flows through the conversation. Rules can rewrite the user's message, inject hidden instructions, filter the bot's reply, and more.

The key name is `content` (not `contentRules`) — that is the name the schema and parser expect.

See [Content Rules](./content-rules).

## Formulas everywhere

Almost every field that is not a plain name or a fixed choice (like a category name) accepts a **formula** — a small calculation that can reference your variables, do arithmetic, compare values, and call built-in helpers.

See [Expressions](./expressions) for the full reference.

## A skeleton config

Each section is explained on its own page — use the sidebar to dive in. Here is what all five sections together look like:

```json
{
  "variables": [
    { "name": "hp", "initialValue": "100" }
  ],
  "functions": [],
  "classifiers": [
    {
      "name": "HitDetector",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "The user describes taking {} damage.",
      "classifications": [
        {
          "label": "physical",
          "category": "damage",
          "updates": [{ "variable": "hp", "setTo": "hp - 10" }]
        }
      ]
    }
  ],
  "generators": [],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "true",
      "modification": "\"HP: \" + hp"
    }
  ]
}
```

</div>
