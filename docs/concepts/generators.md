# Generators

<div v-pre>

Generators produce text or images using external services. They fire at a configured phase and write results back to variables.

## GeneratorPhase

[`Generator.tsx:L4-L8`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L4-L8)

```typescript
enum GeneratorPhase {
  Initialization = 'Initialization',  // declared but never runs — see Gotchas
  OnInput = 'On Input',
  OnResponse = 'On Response',
}
```

Only `OnInput` and `OnResponse` are wired into the execution loop. `Initialization` is declared but disabled. See [Gotchas](../gotchas#initialization-phase-disabled).

## GeneratorType

[`Generator.tsx:L10-L14`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L10-L14)

```typescript
enum GeneratorType {
  Text = 'Text',
  Image = 'Image',
  ImageToImage = 'Image to Image',
}
```

## ImageToImageType

[`Generator.tsx:L16-L20`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L16-L20)

```typescript
enum ImageToImageType {
  Canny = 'Canny',
  Edit = 'Edit',
  Face = 'Face',
}
```

## Generator Fields

[`Generator.tsx:L22-L84`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L22-L84)

Key fields:

| Field | Default | Purpose |
|-------|---------|---------|
| `type` | — | `Text`, `Image`, or `Image to Image` |
| `phase` | — | `On Input` or `On Response` |
| `condition` | `'true'` | Skip generator if this evaluates falsy |
| `retryCondition` | `'false'` | Re-run up to 3 times if truthy after result arrives |
| `prompt` | — | Template string for the generation prompt |
| `negativePrompt` | — | Negative prompt (image generation only) |
| `template` | — | Additional template for text generation |
| `includeHistory` | — | Whether to include conversation history |
| `historyContextSize` | — | Number of history turns to include |
| `minTokens` / `maxTokens` | — | Token bounds for text generation |
| `stoppingStrings` | — | Early-stop sequences for text generation |
| `aspectRatio` | `AspectRatio.PHOTO_HORIZONTAL` | Image aspect ratio |
| `removeBackground` | — | Post-process image background removal |
| `updates` | — | Map of variable name → formula; applied after result arrives |
| `dependencies` | — | Comma-separated custom function names |
| `sourceImageUrl` | — | Source image for image-to-image |
| `imageToImageType` | `Edit` | `Canny`, `Edit`, or `Face` — read from **misspelt** field `iamgeToImageType` |
| `lazy` | — | If true, only run when explicitly triggered |

### The `iamgeToImageType` Typo

[`Generator.tsx:L73`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L73)

The constructor reads `data.iamgeToImageType` (note the transposed `a` and `e` in `image`). If your config uses the correctly-spelled key `imageToImageType`, the field will always read as `undefined` and fall back to `Edit`. To actually select `Canny` or `Face`, you must use the misspelt key in your JSON.

## Execution Flow

[`Stage.tsx:L586-L668`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L586-L668)

`kickOffGenerator` branches on `GeneratorType`:

- `Text` — calls `generator.textGen` with the rendered prompt.
- `Image` — calls `generator.makeImage` with prompt, negative prompt, and aspect ratio.
- `ImageToImage` — calls `generator.imageToImage` with the source image URL and `transfer_type` derived from `imageToImageType`.

## Retry Logic

[`Stage.tsx:L644-L668`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L644-L668)

`applyGeneratorResponse` handles the result. After the first result arrives:

1. `retryCondition` is evaluated against the current scope (which includes the new result).
2. If truthy and `retries < 3`, the generator re-fires and `retries` increments.
3. If falsy or the retry limit is reached, `updates` are applied — each variable is set to the evaluated formula.

`retries` is a runtime field that resets to 0 at the start of each turn.

## State Predicates

[`Generator.tsx:L86-L96`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L86-L96)

- `skipped` — condition was falsy.
- `processed` — result applied, variable updates complete.
- `promise` — in-flight async call.
- `result` — raw result string or URL.

## JSON Shape

```json
{
  "generators": [
    {
      "type": "Text",
      "phase": "On Response",
      "condition": "mood == \"happy\"",
      "prompt": "Write a short cheerful observation about: {{content}}",
      "maxTokens": 80,
      "updates": {
        "lastObservation": "result"
      }
    }
  ]
}
```

The `result` variable in the `updates` formula refers to the generator's output string, available in scope when updates are evaluated.

</div>
