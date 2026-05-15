# Turn Order

<div v-pre>

This page describes exactly when each part of your Statosphere config runs during a conversation turn. Knowing this order helps you understand why a variable might not have the value you expect when a rule fires.

## When the user sends a message

```
1. perTurnUpdate runs on all variables
   (Use this for things that should reset or advance each turn)

2. Input classifiers run
   (Read the user's message; update variables)

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

```
7. preResponseUpdate runs on all variables
   (Use this for things that should update when a reply arrives)

8. Response classifiers run
   (Read the bot's reply; update variables)

9. postResponseUpdate runs on all variables
   (Use this for derived values that depend on response classifier results)

10. Response content rules apply
    (Modify the bot's reply before display)

11. Post Response content rules apply
    (Inject notes based on response classifier results)

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

- `"On Input"` generators fire between step 2 and step 4 — after input classifiers, before content rules.
- `"On Response"` generators fire between step 8 and step 10 — after response classifiers, before response content rules.

Lazy generators (with `lazy: true`) fire at the same point but do not hold up the turn — the reply is delivered first and the generator completes asynchronously.

## Quick reference table

| Step | Phase | What updates |
|------|-------|--------------|
| 1 | Per-turn | `perTurnUpdate` on all variables |
| 2 | Input classifiers | Variables in classifier `updates` |
| 3 | Post-input | `postInputUpdate` on all variables |
| 4 | Input content rules | What the bot receives as the user message |
| 5 | Post Input content rules | Injected system notes after input processing |
| 6 | Stage Direction rules | Hidden instructions for the bot |
| — | Bot generates reply | — |
| 7 | Pre-response | `preResponseUpdate` on all variables |
| 8 | Response classifiers | Variables in classifier `updates` |
| 9 | Post-response | `postResponseUpdate` on all variables |
| 10 | Response content rules | What is displayed as the bot's reply |
| 11 | Post Response rules | Injected notes after response processing |

</div>
