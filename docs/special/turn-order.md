# Turn Order

<div v-pre>

This page describes exactly when each part of your Statosphere config runs during a conversation turn. Knowing this order helps you understand why a variable might not have the value you expect when a rule fires.

## When the user sends a message

([source: `beforePrompt`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L809-L882))

```
0. /setVar commands are parsed and applied
   (Before any variable updates)

1. perTurnUpdate runs on all variables
   (Use this for things that should reset or advance each turn)

2. Input classifiers and "On Input" generators run
   (Read the user's message; update variables; busy-wait until all complete)

3. postInputUpdate runs on all variables
   (Use this for derived values that depend on input classifier results)

4. Input content rules apply
   (Modify the user's message that the bot will see)

5. Post Input content rules apply
   (Inject notes based on classifier results)

6. Stage Direction content rules apply
   (Build the hidden instructions for this turn)

-- Bot generates its reply --
```

## When the bot replies

([source: `afterResponse`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L884-L937))

```
  (Input is disabled while processing)

7. preResponseUpdate runs on all variables
   (Use this for things that should update when a reply arrives)

8. Response classifiers and "On Response" generators run
   (Read the bot's reply; update variables; busy-wait until all complete)

9. postResponseUpdate runs on all variables
   (Use this for derived values that depend on response classifier results)

10. Response content rules apply
    (Modify the bot's reply before display)

11. Post Response content rules apply
    (Inject notes based on response classifier results)

  (Input is re-enabled)

-- Reply displayed to user --
```

## What this means in practice

### perTurnUpdate vs. postInputUpdate

`perTurnUpdate` fires before any classifier has seen the user's message. If you need a variable to depend on what a classifier detected in the user's message, use `postInputUpdate`.

Example:

```json
{
  "name": "sceneChanged",
  "perTurnUpdate": "false",
  "postInputUpdate": "..."
}
```

Resetting `sceneChanged` in `perTurnUpdate` ensures last turn's value is cleared before the new classifiers run.

### Stage Directions are built before the bot replies

All Stage Direction content rules are evaluated and assembled into the prompt before the bot generates its reply. This means you can use variable values updated by input classifiers (`postInputUpdate`) in your Stage Direction formulas.

### Response content rules fire after the bot replies

If you use a response classifier to detect something in the bot's reply and then want to act on it, that action cannot change the *current* reply. It sets a variable that will be available on the *next* turn.

### Generators and their phases

Generators and classifiers share the same busy-wait loop (`processRequests`). ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L468-L521)) They run concurrently (each fires its async request when its dependencies are met) and the loop polls every 500 ms until all are done.

- `"On Input"` generators and input classifiers run together in step 2 — before content rules.
- `"On Response"` generators and response classifiers run together in step 8 — before response content rules.

The `lazy` field exists but has no effect in the current release — the stage always waits for all generators before returning. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L849-L851))

## Quick reference table

| Step | Phase | What updates |
|------|-------|--------------|
| 0 | `/setVar` parsing | Variables named in `/setVar` commands |
| 1 | Per-turn | `perTurnUpdate` on all variables |
| 2 | Input classifiers + generators | Variables in classifier/generator `updates`; busy-wait |
| 3 | Post-input | `postInputUpdate` on all variables |
| 4 | Input content rules | What the bot receives as the user message |
| 5 | Post Input content rules | Injected system notes after input processing |
| 6 | Stage Direction rules | Hidden instructions for the bot |
| — | Bot generates reply | — |
| — | Input disabled | — |
| 7 | Pre-response | `preResponseUpdate` on all variables |
| 8 | Response classifiers + generators | Variables in classifier/generator `updates`; busy-wait |
| 9 | Post-response | `postResponseUpdate` on all variables |
| 10 | Response content rules | What is displayed as the bot's reply |
| 11 | Post Response rules | Injected notes after response processing |
| — | Input re-enabled | — |

</div>
