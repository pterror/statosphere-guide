# Variables

<div v-pre>

Variables are the memory of your Statosphere config. They hold a value — a number, a string, a boolean — that persists from one message to the next. Classifiers and generators write to them; content rules and expressions read from them.

## Basic shape

```json
{
  "name": "hp",
  "initialValue": "100"
}
```

That is a complete variable definition. `name` and `initialValue` are the only required fields.

## Fields

### name

The identifier you use to reference this variable everywhere else in the config. Case-insensitive when used in expressions and template tags, but it is good practice to be consistent.

Use simple names without spaces: `hp`, `mood`, `turnCount`, `currentScene`.

### initialValue

An **expression** evaluated once when the stage loads. The result becomes the variable's starting value.

```json
{ "name": "hp", "initialValue": "100" }
{ "name": "mood", "initialValue": "\"neutral\"" }
{ "name": "sceneChanged", "initialValue": "false" }
```

Notice that string values need to be wrapped in quotes *inside* the expression string. `"neutral"` as a JSON string would be the variable name `neutral`; `"\"neutral\""` evaluates to the string `"neutral"`.

### Update phases

Variables can have up to four update formulas, each running at a different point in the conversation turn:

| Field | When it runs |
|---|---|
| `perTurnUpdate` | At the very start of processing the user's message, before any classifiers run |
| `postInputUpdate` | After input classifiers have run, but before the bot replies |
| `preResponseUpdate` | Immediately when the bot's reply arrives, before response classifiers run |
| `postResponseUpdate` | After response classifiers have run |

Each field is an expression whose result replaces the variable's current value. Leave a field blank (or omit it) and the variable is not updated at that phase.

## Turn order diagram

```
User sends message
  └─ perTurnUpdate runs on all variables
  └─ Input classifiers run
  └─ postInputUpdate runs on all variables
  └─ Content rules for Input / Post Input apply
  └─ Bot generates reply
  └─ preResponseUpdate runs on all variables
  └─ Response classifiers run
  └─ postResponseUpdate runs on all variables
  └─ Content rules for Response / Post Response apply
  └─ Stage Direction and system message content rules apply
  └─ Reply displayed to user
```

## Constants vs. tracked variables

If a variable has no update formulas and is never written to by a classifier or generator, it acts as a constant — useful for thresholds and config values you want to name rather than hard-code.

Variables that *are* written by classifiers or generators are automatically persisted in chat state. You do not need to do anything special to make this happen.

## Examples

### A numeric counter that increments every turn

```json
{
  "name": "turnCount",
  "initialValue": "0",
  "perTurnUpdate": "turnCount + 1"
}
```

### A string variable that classifiers write to

```json
{
  "name": "mood",
  "initialValue": "\"neutral\""
}
```

(A classifier sets it; no update formula needed on the variable itself.)

### A derived variable that summarizes another

```json
{
  "name": "hpStatus",
  "initialValue": "\"full\"",
  "postResponseUpdate": "hp < 25 ? \"critical\" : hp < 60 ? \"hurt\" : \"fine\""
}
```

This re-derives `hpStatus` from `hp` after every response, so it always stays in sync. You can then use `hpStatus` in content rules without repeating the threshold logic.

### A turn-scoped flag reset each turn

```json
{
  "name": "sceneChanged",
  "initialValue": "false",
  "perTurnUpdate": "false"
}
```

Classifiers can set `sceneChanged` to `true` during the turn. It resets to `false` at the start of the next turn. This is useful for gating generators that should only fire when something actually happened.

</div>
