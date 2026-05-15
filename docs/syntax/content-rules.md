# Content Rules

<div v-pre>

Content rules modify the text that flows through a conversation. They let you rewrite what the user sends before the bot sees it, inject hidden instructions for the bot, and filter the bot's reply before it appears in chat.

Every rule has a category (which defines *what* it touches), a condition (which defines *when* it fires), and a modification (the new value).

## The five categories

### Input

Modifies the user's message before it goes to the bot.

The bot sees the modified version. The chat history shows the original. Use this to clean up, add context, or strip content the bot should not see literally.

### Post Input

Adds a system-level note *after* classifiers have run on the user's message.

This is a good place to inject information that summarizes what classifiers detected — something like "the user appears to be attacking."

### Stage Direction

Adds a hidden instruction block that is sent to the bot as part of the prompt but is never shown to the user.

This is the most common category. Use it to inject character reminders, current state summaries, and writing instructions.

### Response

Modifies the bot's reply before it is displayed to the user.

The user sees the modified version. Use this to strip unwanted phrases, reformat output, or add framing text.

### Post Response

Adds a system-level note *after* classifiers have run on the bot's reply.

Useful for noting what was detected in the response — but less commonly needed than the others.

## Basic shape

```json
{
  "category": "Stage Direction",
  "condition": "hp < 25",
  "modification": "\"{{char}} is badly injured and struggling to speak.\""
}
```

If `hp < 25`, this injects the quoted text as a hidden stage direction. Otherwise it does nothing.

## Fields

### category

One of: `"Input"`, `"Post Input"`, `"Stage Direction"`, `"Response"`, `"Post Response"`.

### condition

An expression. The rule only applies if this evaluates to truthy. Omit or leave blank to always apply.

```json
{ "condition": "mood == \"angry\"" }
{ "condition": "turnCount > 10" }
{ "condition": "true" }
```

### modification

An expression whose result replaces (or becomes) the content for that category.

Use `{{content}}` to embed the current content in your modification, rather than replacing it entirely.

```json
{ "modification": "\"{{content}} [The user seems agitated.]\"" }
{ "modification": "replace(content, \"[OOC:\", \"\")" }
```

If you omit `modification`, the default is `"{{content}}"` — meaning the content is unchanged (the rule fires but has no effect). You probably always want to set this.

## Content rules are additive for some categories

For Stage Direction and system message categories, multiple matching rules are concatenated — all of them apply. For Input and Response, the last matching rule wins (each one replaces the previous result).

## Worked examples

### Inject a stat display into every Stage Direction

```json
{
  "category": "Stage Direction",
  "condition": "true",
  "modification": "\"HP: \" + hp + \"/\" + max_hp + \". Mood: \" + mood + \".\""
}
```

This runs unconditionally and tells the bot the current state on every turn.

### Inject a conditional reminder

```json
{
  "category": "Stage Direction",
  "condition": "mood == \"angry\"",
  "modification": "\"{{char}} is currently furious. Their responses should be sharp and clipped.\""
}
```

Only fires when `mood` is `"angry"`.

### Strip OOC brackets from user input

```json
{
  "category": "Input",
  "condition": "contains(\"{{content}}\", \"[\")",
  "modification": "replace(\"{{content}}\", \"\\\\[.*?\\\\]\", \"\")"
}
```

Removes any text in square brackets from what the bot receives. See the note about the `replace` bug in [Gotchas](../reference/gotchas) — if this does not work, use a custom function.

### Add context text around the user's message

```json
{
  "category": "Input",
  "condition": "true",
  "modification": "\"[Turn \" + turnCount + \"] \" + \"{{content}}\""
}
```

Prepends a turn number to every user message.

### Censor a word from the bot's reply

```json
{
  "category": "Response",
  "condition": "true",
  "modification": "replace(\"{{content}}\", \"badword\", \"***\")"
}
```

Again: the built-in `replace` has a bug. If you need this, define your own replace function first.

</div>
