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
/setVar mood=angry
What do you do next?
```

The `/setVar` commands are stripped before the message reaches the bot. The bot only sees `What do you do next?`.

## Case sensitivity

The command keyword is case-insensitive: `/setVar`, `/setvar`, `/SETVAR` all work.

Variable names follow the same case rules as everywhere else in Statosphere.

## Value format

The value is set as a raw string. Statosphere parses it as an expression where possible:

- `/setVar hp=42` — sets `hp` to the number `42`
- `/setVar mood=happy` — sets `mood` to the string `"happy"` (no quotes needed)
- `/setVar defeated=true` — sets `defeated` to boolean `true`

## Use cases

### Debugging

When a classifier misbehaves and updates a variable to the wrong value, use `/setVar` to correct it without refreshing:

```
/setVar hp=30
```

### Manual triggers

If you want to force a scene change, mood shift, or any other state transition without waiting for the classifier to detect it:

```
/setVar currentScene=the dungeon
/setVar sceneChanged=true
```

### Skipping initialization

If you want to start a game mid-scenario rather than from the beginning:

```
/setVar turnCount=20
/setVar currentScene=the final boss arena
/setVar hp=15
```

## Notes

- `/setVar` runs before classifiers, so the new value is in place when classifiers run that turn.
- If the variable does not exist in your config (i.e., it was not declared), setting it with `/setVar` still works for that session.
- This command is intended for testing and botmaker use. If you have public bots using Statosphere, users can use `/setVar` to change state. If that is a concern, note it in your bot's creator notes.

</div>
