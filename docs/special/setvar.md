# /setVar Command

<div v-pre>

Anyone in the chat — including the user playing a bot you have built — can manually set a Statosphere variable by typing a `/setVar` command at the start of their message.

## Syntax

```
/setVar variableName=value
```

You can include multiple commands in a single message:

```
/setVar hp=42
/setVar mood="angry"
What do you do next?
```

The `/setVar` commands are stripped before the message reaches the bot. The bot only sees `What do you do next?`.

## Case sensitivity

The command keyword is case-insensitive: `/setVar`, `/setvar`, `/SETVAR` all work. The regex used is `/\/setvar\s+([A-Za-z_][A-Za-z0-9_]*)\s*=\s*([^\n\r]+)/gi` (the `i` flag). ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L824))

Variable names follow the same case rules as everywhere else in Statosphere.

## Value format

The value is treated as a mathjs expression and evaluated. That means:

- `/setVar hp=42` — sets `hp` to the number `42`
- `/setVar mood="happy"` — sets `mood` to the string `"happy"` (quotes are required for strings)
- `/setVar defeated=true` — sets `defeated` to boolean `true`

Writing `/setVar mood=happy` without quotes will try to evaluate `happy` as a variable name. If that variable is not defined, the result is `null` or an error.

## Use cases

### Debugging

When a classifier misbehaves and updates a variable to the wrong value, use `/setVar` to correct it without refreshing:

```
/setVar hp=30
```

### Manual triggers

If you want to force a scene change, mood shift, or any other state transition without waiting for the classifier to detect it:

```
/setVar currentScene="the dungeon"
/setVar sceneChanged=true
```

### Skipping initialization

If you want to start a game mid-scenario rather than from the beginning:

```
/setVar turnCount=20
/setVar currentScene="the final boss arena"
/setVar hp=15
```

## Notes

- `/setVar` runs before `perTurnUpdate` and before classifiers, so the new value is in place for all subsequent processing that turn. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L820-L843))
- If the variable does not exist in your config (i.e., it was not declared), the command is silently ignored — only declared variables can be set this way. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L829-L832))
- This command is intended for testing and botmaker use. If you have public bots using Statosphere, users can use `/setVar` to change state. If that is a concern, note it in your bot's creator notes.

</div>
