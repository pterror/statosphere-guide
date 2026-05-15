# Stage Lifecycle

This page traces the complete execution path for a single turn, from user message to displayed response.

## Overview

Statosphere hooks into two methods of the `StageBase` interface:

- `beforePrompt(userMessage)` — runs before the LLM sees the message.
- `afterResponse(botMessage)` — runs after the LLM responds.

Both are defined in [`Stage.tsx:L809-L937`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L809-L937).

## `beforePrompt` Walkthrough

[`Stage.tsx:L809-L882`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L809-L882)

1. **Parse `/setVar` commands.** The method scans the user message for `/setVar name=value` commands using the regex `/\/setvar\s+([A-Za-z_]\w*)\s*=\s*([^\n\r]+)/i`, applies each assignment, and strips the commands from the message text. Lines `L818-L838`.

2. **`processVariablesPreInput`.** Evaluates the `perTurnUpdate` formula for every non-constant variable definition. `L843`.

3. **Kick off input-phase classifiers and generators.** Calls `processRequests(OnInput, char, user)`, which starts all classifiers and generators whose `phase` is `OnInput` and whose `condition` is truthy.

4. **Busy-wait loop.** [`Stage.tsx:L845-L852`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L845-L852):
   ```typescript
   while (!processRequests(OnInput, char, user)) {
     await sleep(500)
   }
   ```
   `processRequests` returns `true` when all classifiers and generators for the phase have either completed or been skipped. Until then the method polls every 500 ms. See [Gotchas](./gotchas#busy-wait) for implications.

5. **`processVariablesPostInput`.** Evaluates `postInputUpdate` for all non-constant variables. `L856`.

6. **Apply content rules for `Input`, `Post Input`, `Stage Direction`.** `L858-L871`. Rules are evaluated in order; each category's output chains into the next rule of that category.

7. **Return.** [`Stage.tsx:L874-L881`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L874-L881):
   ```typescript
   return {
     stageDirections,
     messageState: writeMessageState(),
     modifiedMessage,
     systemMessage,
     error: null,
     chatState: null,
   }
   ```

## `afterResponse` Walkthrough

[`Stage.tsx:L884-L937`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L884-L937)

1. **Disable user input.** [`Stage.tsx:L894`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L894): `this.messenger.updateEnvironment({ input_enabled: false })`. This prevents the user from sending another message while the stage processes.

2. **`processVariablesPreResponse`.** Evaluates `preResponseUpdate` formulas.

3. **Kick off response-phase classifiers and generators.** `processRequests(OnResponse, ...)`.

4. **Busy-wait loop.** Same `while (!processRequests(...)) await sleep(500)` pattern. `L905-L907`.

5. **`processVariablesPostResponse`.** Evaluates `postResponseUpdate` formulas.

6. **Apply content rules for `Response` and `Post Response`.** `L909-L934`. `Response` rules write to `modifiedMessage`; `Post Response` rules write to `systemMessage`.

7. **Re-enable user input.** [`Stage.tsx:L927`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L927): `this.messenger.updateEnvironment({ input_enabled: true })`.

8. **Return.** The modified bot message and updated message state.

## `load()` and `LoadResponse.error`

[`Stage.tsx:L322-L327`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L322-L327)

`load()` returns a `LoadResponse` with `{ success, error, initState, chatState }`. In the `StageBase` contract, `error` is intended to signal a fatal load failure. Statosphere repurposes this field: it sets `error` to an HTML string containing a user-visible notice (summarizing what was loaded — variable count, classifier count, etc.) even when `success` is `true`. See [Gotchas](./gotchas#loadresponse-error-reuse).

## `resetGeneratorsAndClassifiers`

[`Stage.tsx:L450-L466`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L450-L466)

Called at the start of each turn to reset all `skipped`, `processed`, `promise`, and `result` fields on every classifier and generator. This ensures that conditions are re-evaluated fresh each turn.
