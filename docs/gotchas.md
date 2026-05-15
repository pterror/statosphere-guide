# Gotchas

<div v-pre>

Seven notable findings in the Statosphere codebase as of commit [`e67cd9f`](https://github.com/Lord-Raven/statosphere/tree/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7). Each has a direct source permalink.

## 1. Busy-Wait Loop {#busy-wait}

[`Stage.tsx:L845-L852`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L845-L852) and [`Stage.tsx:L905-L907`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L905-L907)

```typescript
while (!processRequests(OnInput, char, user)) {
  await sleep(500)
}
```

This pattern appears in both `beforePrompt` and `afterResponse`. Classifiers and generators are kicked off as async work, but the stage waits for completion by polling every 500 ms. There is no Promise combinator or event-based signaling.

**Implications:** If a classifier or generator is slow (e.g., the Gradio backend is under load), the stage will block for the full polling interval past completion. A classifier that consistently takes 600 ms will cause a nominal 1000 ms wait (two 500 ms poll cycles). The `input_enabled: false` period in `afterResponse` is extended for the entire duration of this wait.

## 2. `LoadResponse.error` Reuse {#loadresponse-error-reuse}

[`Stage.tsx:L322-L327`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L322-L327)

The `LoadResponse` type from `@chub-ai/stages-ts` defines `error` as a field for signaling load failure. Statosphere uses it to pass a user-visible HTML notice even on successful load — a summary of how many variables, classifiers, generators, and content rules were loaded.

This is a semantic repurposing: a non-null `error` field normally indicates failure, but here it can appear alongside `success: true`. Consumers of the stage interface that gate on `error != null` to detect failures will misread a successful Statosphere load as failed.

## 3. `iamgeToImageType` Typo {#iamgeto-imagetype-typo}

[`Generator.tsx:L73`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L73)

```typescript
this.imageToImageType = data.iamgeToImageType ?? ImageToImageType.Edit
```

The field read from the config data is `iamgeToImageType` (note `iamge` instead of `image`). Any config that spells the key correctly as `imageToImageType` will silently fall back to `Edit`. To actually use `Canny` or `Face`, the config must use the misspelt key:

```json
{ "iamgeToImageType": "Canny" }
```

The external editor may or may not mirror this typo — verify against the editor's output before assuming.

## 4. `replace` Built-in Bug {#replace-builtin-bug}

[`Stage.tsx:L155-L160`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L155-L160)

The `replace` built-in function registered with mathjs references a variable `regexString` that is not declared anywhere in the enclosing scope:

```typescript
math.import({
  replace: (str: string, regex: string, replacement: string) => {
    return str.replace(new RegExp(regexString, 'g'), replacement)
    //                              ^^^^^^^^^^^ not declared
  }
})
```

Calling `replace(text, pattern, repl)` from any expression will throw `ReferenceError: regexString is not defined`. The `replace` built-in is non-functional. Workarounds: use a custom function with a JavaScript `Function` body, or avoid regex replacement entirely.

## 5. `Initialization` Phase Disabled {#initialization-phase-disabled}

[`Generator.tsx:L4-L8`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Generator.tsx#L4-L8)

```typescript
enum GeneratorPhase {
  Initialization = 'Initialization',
  OnInput = 'On Input',
  OnResponse = 'On Response',
}
```

`Initialization` is declared but never included in the `processRequests` call. The execution loop only handles `OnInput` and `OnResponse`. A generator configured with `phase: "Initialization"` will never run. There is no error or warning — the generator is silently skipped every turn.

## 6. `zod` Imported but Unused {#zod-unused}

[`Stage.tsx:L29`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L29)

```typescript
import { z } from 'zod'
```

`z` is used only in the MCP tool registration: `z.object({})`. This creates an empty Zod schema that does no actual validation. `zod` is not declared in `package.json` — it resolves as a transitive dependency of `@chub-ai/stages-ts`. Any change to that dependency tree could break the import silently.

## 7. `{{[A-z]*}}` Regex Includes Punctuation {#az-regex}

[`Stage.tsx:L683-L699`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L683-L699)

The `replaceTags` method uses the regex `/{{[A-z]*}}/g`. The character class `[A-z]` covers ASCII 65–122, which includes the six non-letter characters between `Z` (90) and `a` (97): `[`, `\`, `]`, `^`, `_`, and `` ` ``.

In practice:
- Variable names with underscores (`my_var`) are matched correctly because `_` is in the range.
- Variable names with digits (`var1`) are **not matched** — digits are not in `[A-z]` — so `{{var1}}` will not be substituted.
- A tag like `{{[illegal]}}` could be partially recognized, though the lookup will simply fail to find a match and leave the tag unsubstituted.

If you have variables with numeric suffixes, they will not expand in templates. Rename them to purely alphabetic (or underscore-separated) names as a workaround.

</div>
