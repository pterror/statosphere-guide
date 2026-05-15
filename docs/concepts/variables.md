# Variables

<div v-pre>

Variables are the fundamental state-persistence mechanism in Statosphere. Each variable has a name, an initial value expression, and up to four update expressions that fire at different points in the turn lifecycle.

## VariableDefinition

[`Variable.tsx:L3-L21`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Variable.tsx#L3-L21)

```typescript
class VariableDefinition {
  name: string
  initialValue: string        // mathjs expression; evaluated once on load
  perTurnUpdate: string       // evaluated at the start of every turn
  postInputUpdate: string     // evaluated after user input is processed
  preResponseUpdate: string   // evaluated before the LLM response
  postResponseUpdate: string  // evaluated after the LLM response
  constant: boolean           // true when no update formula is set
}
```

Each formula string is preprocessed by `stage.processCode()` before being stored. `processCode` strips JavaScript-style comments and rewrites custom-function call sites to include dependency arguments (see [Functions](./functions)).

`constant` is computed as `true` when all four update fields are empty strings. A constant variable is set once (on `initialValue` evaluation) and never changed by the update cycle. However, the stage will automatically promote a variable to non-constant (set `constant = false`) when a generator or classifier references it in an `updates` map — see [`Stage.tsx:L272-L304`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L272-L304).

## Variable (runtime instance)

[`Variable.tsx:L23-L30`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Variable.tsx#L23-L30)

```typescript
class Variable {
  definition: VariableDefinition
  value: any
}
```

The constructor evaluates `initialValue` through `stage.evaluate` against `stage.buildScope()`. `buildScope` returns a flat object mapping every variable name to its current value, so the initial value of a variable can reference other variables that were defined earlier in the array.

## Update Phases

The four update phases correspond to four points in the turn lifecycle:

| Phase | When it runs |
|-------|-------------|
| `perTurnUpdate` | Beginning of `beforePrompt`, before any classifiers or generators fire |
| `postInputUpdate` | After input-phase classifiers and generators complete |
| `preResponseUpdate` | Beginning of `afterResponse`, before response-phase classifiers and generators |
| `postResponseUpdate` | After response-phase classifiers and generators complete |

Phase processors are implemented at [`Stage.tsx:L418-L448`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L418-L448). Each iterates through variable definitions in order, evaluates the relevant formula against the current scope, and writes the result back.

## Message-State Persistence

Between turns, the runtime values of non-constant variables must be serialized into chat state so they survive page reloads and session boundaries. The stage uses two methods for this:

- `readMessageState(state)` ([`Stage.tsx:L364-L384`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L364-L384)) — deserializes variable values from the stored message state object.
- `writeMessageState()` ([`Stage.tsx:L386-L416`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L386-L416)) — serializes current values back into the message state object.

Only non-constant variables participate in persistence. Constant variables are always re-evaluated from `initialValue` on load.

## Worked Example

A mood system that shifts between three states based on classifier output:

```json
{
  "variables": [
    {
      "name": "mood",
      "initialValue": "\"neutral\"",
      "perTurnUpdate": ""
    },
    {
      "name": "moodScore",
      "initialValue": "0",
      "perTurnUpdate": "moodScore * 0.9"
    }
  ]
}
```

`moodScore` decays 10% per turn. A classifier sets `moodScore` and `mood` when it detects positive or negative sentiment. Because both variables are referenced in the classifier's `updates` map, they are automatically flagged as non-constant even though their update formulas are empty — the classifier writes to them directly.

The `mood` variable can then be used in a content rule:

```json
{
  "content": [
    {
      "category": "Stage Direction",
      "condition": "mood == \"happy\"",
      "modification": "{{char}} is currently in a cheerful mood."
    }
  ]
}
```

Condition and modification expressions are evaluated with the current variable scope, so `mood` resolves to its current string value.

</div>
