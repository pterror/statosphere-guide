# Schemas Reference

<div v-pre>

Statosphere validates its config JSON at runtime using Ajv against five schemas defined in `src/assets/`. The same schemas are used by the external editor at [https://lord-raven.github.io/statosphere-editor/](https://lord-raven.github.io/statosphere-editor/).

Permalink base: `https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/`

## variable-schema.json

[`src/assets/variable-schema.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/variable-schema.json)

An array of variable definition objects. Fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | yes | — | Identifier used in expressions and `{{tags}}` |
| `initialValue` | string | yes | — | mathjs expression; evaluated on load |
| `perTurnUpdate` | string | no | `""` | Evaluated at start of each turn |
| `postInputUpdate` | string | no | `""` | Evaluated after input-phase processing |
| `preResponseUpdate` | string | no | `""` | Evaluated before response-phase processing |
| `postResponseUpdate` | string | no | `""` | Evaluated after response-phase processing |

A variable with all update fields empty is treated as constant (`constant = true`).

## function-schema.json

[`src/assets/function-schema.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/function-schema.json)

An array of function definition objects. Fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Function name; callable from any expression |
| `parameters` | string | yes | Comma-separated parameter names |
| `body` | string | yes | JavaScript function body (return statement expected) |

## classifier-schema.json

[`src/assets/classifier-schema.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/classifier-schema.json)

An array of classifier objects. Top-level fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | yes | — | Identifier for debugging |
| `condition` | string | no | `"true"` | Skip classifier if falsy |
| `inputTemplate` | string | no | `""` | Text to classify for input phase |
| `responseTemplate` | string | no | `""` | Text to classify for response phase |
| `inputHypothesis` | string | no | `""` | NLI hypothesis for input; `{}` is replaced with label |
| `responseHypothesis` | string | no | `""` | NLI hypothesis for response |
| `useLlm` | boolean | no | `false` | Use LLM entailment scoring backend |
| `useHistory` | boolean | no | `false` | Include conversation history |
| `historyContextSize` | number | no | `5` | Turns of history to include |
| `classifications` | array | yes | — | Array of Classification objects (see below) |

Classification object fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `label` | string | yes | — | Candidate label text |
| `condition` | string | no | `"true"` | Skip label if falsy |
| `category` | string | no | `""` | Only highest-scoring label in category wins |
| `threshold` | number | no | `0.7` | Minimum entailment score to apply updates |
| `dynamic` | string | no | `""` | Expression returning string or string[]; overrides label |
| `updates` | object | no | `{}` | Map of variable name → mathjs formula |

## generator-schema.json

[`src/assets/generator-schema.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/generator-schema.json)

An array of generator objects. Key fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `type` | string | yes | — | `"Text"`, `"Image"`, or `"Image to Image"` |
| `phase` | string | yes | — | `"On Input"` or `"On Response"` |
| `condition` | string | no | `"true"` | Skip generator if falsy |
| `retryCondition` | string | no | `"false"` | Re-run up to 3 times if truthy |
| `prompt` | string | no | `""` | Generation prompt (template-substituted) |
| `negativePrompt` | string | no | `""` | Negative prompt for image generation |
| `maxTokens` | number | no | `200` | Max tokens for text generation |
| `minTokens` | number | no | `0` | Min tokens for text generation |
| `aspectRatio` | string | no | `"photo_horizontal"` | Image aspect ratio |
| `updates` | object | no | `{}` | Map of variable name → formula; applied after generation |
| `iamgeToImageType` | string | no | `"Edit"` | **Note the typo.** `"Canny"`, `"Edit"`, or `"Face"` |

## content-schema.json

[`src/assets/content-schema.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/assets/content-schema.json)

An array of content rule objects. Fields:

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `category` | string | yes | — | `"Input"`, `"Post Input"`, `"Stage Direction"`, `"Response"`, `"Post Response"` |
| `condition` | string | no | `"true"` | Skip rule if falsy |
| `modification` | string | no | `"{{content}}"` | Template producing transformed text |

</div>
