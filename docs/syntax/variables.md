# Variables

<div v-pre>

Variables are the memory of your Statosphere config. They hold a value — a number (like `50`), a word or phrase (like `"happy"`, called a string), or a yes/no flag (`true` or `false`, called a boolean) — that is saved between messages. Classifiers and generators write to them; content rules and expressions read from them.

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

The identifier you use to reference this variable everywhere else in the config. Uppercase and lowercase do not matter — `HP` and `hp` both work — but it is good practice to be consistent.

Use simple names without spaces: `hp`, `mood`, `turnCount`, `currentScene`.

### initialValue

An **expression** evaluated once when the stage loads. The result becomes the variable's starting value.

```json
{ "name": "hp", "initialValue": "100" }
{ "name": "mood", "initialValue": "\"neutral\"" }
{ "name": "sceneChanged", "initialValue": "false" }
```

Here is the one tricky thing about starting a variable with a word value: you need quotes inside quotes. `"\"neutral\""` looks weird, but think of it this way — the outer quotes are required by the settings file format, and the inner `\"` marks tell the formula parser "this is a word, not a variable name." Just copy the pattern: `"\"your word here\""`.

> **Why does this matter?** Without the inner quotes, the formula parser treats `neutral` as a variable name and looks it up — not the string you wanted.

### Update phases

Most of the time you will use `perTurnUpdate` — it runs at the start of each turn, before any classifiers have read the new message. The others exist for more advanced timing needs.

| Field | When it runs |
|---|---|
| `perTurnUpdate` | At the very start of processing the user's message, before any classifiers run |
| `postInputUpdate` | After input classifiers have run, but before the bot replies |
| `preResponseUpdate` | Immediately when the bot's reply arrives, before response classifiers run |
| `postResponseUpdate` | After response classifiers have run |

Each field is a formula whose result replaces the variable's current value. Leave a field blank (or omit it) and the variable is not updated at that phase.

## Turn order diagram

```
User sends message
  └─ /setVar commands processed (before any variable updates)
  └─ perTurnUpdate runs on all variables
  └─ Input classifiers run
  └─ postInputUpdate runs on all variables
  └─ Content rules for Input / Post Input / Stage Direction apply
  └─ Bot generates reply
  └─ preResponseUpdate runs on all variables
  └─ Response classifiers run
  └─ postResponseUpdate runs on all variables
  └─ Content rules for Response / Post Response apply
  └─ Reply displayed to user
```

Stage Direction content rules are evaluated **before** the bot replies (in the same `beforePrompt` pass as Input rules), not after. See [Turn Order](../special/turn-order) for the full step-by-step breakdown.

## Saved vs. reset-each-load variables

A variable is **saved between messages** (and across page reloads) if it has an update formula or is written to by a classifier or generator. Statosphere detects this automatically at load time — you do not need to do anything special. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L272-L304))

A variable that has no update formulas *and* is never written to by a classifier or generator is treated as a constant — it resets to `initialValue` every time the page loads. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Variable.tsx#L19)) This is fine for fixed values like `max_hp`; it is a problem if you expected a variable to keep its value and it is not being updated anywhere.

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

The `?` and `:` symbols make a choice: if the condition before `?` is true, use the first option; otherwise use the second. Nested, this reads: "if HP is below 25 say 'critical'; if HP is below 60 say 'hurt'; otherwise say 'fine'."

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
