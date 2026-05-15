# Generators

<div v-pre>

Generators make additional LLM or image-generation calls beyond the normal chat reply. The results go into variables, which you can then use in content rules, expressions, or other classifiers.

Use generators for things like: generating a scene background image when the location changes, producing a short story recap, or creating procedural flavor text.

Generators are extra API calls. Each one adds latency and token cost. Use conditions to prevent unnecessary calls.

## Basic shape

### Text generator

```json
{
  "name": "StoryRecap",
  "type": "Text",
  "phase": "On Response",
  "condition": "turnCount % 5 == 0",
  "prompt": "Summarize the last few events in one sentence.",
  "includeHistory": true,
  "maxTokens": "80",
  "updates": [
    { "variable": "recap", "setTo": "{{content}}" }
  ]
}
```

### Image generator

```json
{
  "name": "SceneImage",
  "type": "Image",
  "phase": "On Response",
  "condition": "sceneChanged",
  "prompt": "\"A fantasy scene: \" + currentScene",
  "aspectRatio": "16:9",
  "updates": [
    { "variable": "background", "setTo": "{{content}}" }
  ]
}
```

## Fields shared by all generator types

### name

A unique identifier for this generator. Used in dependency references.

### type

One of: `"Text"`, `"Image"`, `"Image-to-Image"`. Default: `"Text"`.

### phase

When the generator fires:
- `"On Input"` — after the user sends a message, before the bot replies
- `"On Response"` — after the bot replies

Note: there is a schema entry for an `"Initialization"` phase, but **it does not currently run**. Use `"On Input"` with a condition like `isNull(someVariable)` to initialize variables on first use instead. See [Gotchas](../reference/gotchas).

### condition

An expression. The generator only runs if this evaluates to truthy. Always set a condition — generators are expensive.

```json
{ "condition": "sceneChanged" }
{ "condition": "turnCount % 5 == 0" }
{ "condition": "isNull(recap)" }
```

### lazy

Default: `false`. When `true`, the generator fires during its phase but does not hold up the chat — the main response is delivered first and the generator finishes in the background. Useful for generating content that does not need to be ready immediately. Note that lazy generators may not be ready before the next turn starts.

### dependencies

A comma-separated list of classifier or generator names that must complete before this generator fires.

### prompt

The prompt to send. This is an expression (or a string template). Use template tags to include current state.

```json
{ "prompt": "\"Describe the scene: \" + currentScene" }
{ "prompt": "\"What is {{char}} likely to do next, given mood = \" + mood + \"?\"" }
```

### updates

Variable updates applied when the generator finishes. Use `{{content}}` to reference the generator's output.

```json
"updates": [
  { "variable": "recap", "setTo": "{{content}}" },
  { "variable": "lastGeneratedAt", "setTo": "turnCount" }
]
```

## Text generator fields

### includeHistory

When `true`, recent chat history is included in the prompt for context. Increases token usage.

### historyContextSize

Default: `0` (use preset). Only relevant when `includeHistory` is `true`. A number limiting how much history is sent.

### minTokens

Default: `"50"`. The minimum number of tokens to request in the response.

### maxTokens

Default: `"250"`. The maximum number of tokens to request. Keep this low for concise outputs like labels or short phrases.

### stoppingStrings

A comma-delimited list of strings. If the LLM produces any of them, the response ends there.

```json
{ "stoppingStrings": "\\n,." }
```

### retryCondition

Default: `""` (never retry, treated as `false`). If this expression evaluates to `true` after the generator runs, the generator retries. `{{content}}` is available. The stage will retry at most three times.

```json
{ "retryCondition": "isNull({{content}}) or {{content}} == \"\"" }
{ "retryCondition": "not contains({{content}}, \"http\")" }
```

## Image generator fields

### negativePrompt

Content to exclude from the generated image.

```json
{ "negativePrompt": "blurry, low quality, text" }
```

### aspectRatio

Valid values: `"21:9"`, `"16:9"`, `"3:2"`, `"5:4"`, `"1:1"`, `"4:5"`, `"2:3"`, `"9:16"`, `"9:21"`.

```json
{ "aspectRatio": "16:9" }
```

### removeBackground

When `true`, attempts to remove the background from the generated image.

## Image-to-Image generator fields

Image-to-Image generators take an existing image and transform it.

### sourceImageUrl

An expression that evaluates to a URL of the source image.

```json
{ "sourceImageUrl": "background" }
```

### imageToImageType

The transform model to use. Values (case-sensitive, lowercase): `"edit"`, `"canny"`, `"face"`. Default: `"edit"`.

- `"edit"` (Qwen) — general-purpose image editing
- `"canny"` (Flux) — edge-guided generation
- `"face"` (Flux) — face-swap style transfer

**Known bug:** the current release reads this from a misspelled key `iamgeToImageType` in the source code. If you set `imageToImageType` to `"canny"` or `"face"`, the stage reads `undefined` and defaults to `"edit"`. See [Gotchas](../reference/gotchas).

## Worked examples

### A recap generator that fires every five turns

```json
{
  "name": "Recap",
  "type": "Text",
  "phase": "On Response",
  "condition": "turnCount % 5 == 0",
  "prompt": "\"In one sentence, summarize the most recent events in this conversation.\"",
  "includeHistory": true,
  "maxTokens": "80",
  "stoppingStrings": "\\n",
  "updates": [
    { "variable": "recap", "setTo": "{{content}}" }
  ]
}
```

### A scene background image gated on a flag

```json
{
  "name": "BackgroundImage",
  "type": "Image",
  "phase": "On Response",
  "condition": "sceneChanged",
  "prompt": "\"Fantasy scene, detailed illustration: \" + currentScene + \". No text, no UI elements.\"",
  "negativePrompt": "text, letters, watermark, ui",
  "aspectRatio": "16:9",
  "updates": [
    { "variable": "background", "setTo": "{{content}}" }
  ]
}
```

The `background` variable has a special meaning — Statosphere uses it to set the chat background. See [Background Variable](../special/background).

</div>
