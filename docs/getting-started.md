# Getting Started

<div v-pre>

## How a Botmaker Uses Statosphere

Statosphere is configured entirely through JSON. There is no code to write — every behavior is defined as data: arrays of variable definitions, function definitions, classifier definitions, generator definitions, and content rules.

The workflow is:

1. Open the external editor at [https://lord-raven.github.io/statosphere-editor/](https://lord-raven.github.io/statosphere-editor/).
2. Build your configuration using the editor's GUI.
3. Copy the resulting JSON.
4. In Chub.ai, navigate to the character's stage configuration.
5. Paste the JSON into the stage config field.
6. Refresh the chat.

The stage reads the config JSON during `load()` ([`Stage.tsx:L119-L328`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L119-L328)), validates each section against Ajv JSON schemas, and initializes the runtime objects.

## The Five-Element Model

A Statosphere config is an object with up to five arrays:

```json
{
  "variables": [...],
  "functions": [...],
  "classifiers": [...],
  "generators": [...],
  "content": [...]
}
```

Each array is validated against the corresponding schema in `src/assets/`:

- `variable-schema.json`
- `function-schema.json`
- `classifier-schema.json`
- `generator-schema.json`
- `content-schema.json`

See the [Schemas reference](./reference/schemas) for field-by-field documentation.

## The `/setVar` User Command

During any turn, the user can set a variable directly by typing a command in their message:

```
/setVar mood=happy
```

The stage scans for this pattern in `beforePrompt` using the regex `/\/setvar\s+([A-Za-z_]\w*)\s*=\s*([^\n\r]+)/i` and strips the command from the message before it reaches the LLM. See [`Stage.tsx:L818-L838`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L818-L838).

Multiple `/setVar` commands can appear in a single message. Each is processed in order. This is the primary mechanism for players to interact with the variable system directly.

## The `debugMode` Variable

If the stage has a variable named `debugMode` whose value evaluates to truthy, additional diagnostic output is surfaced. This is a convention in the config, not a hard-coded flag — you define it as an ordinary variable and set it to `1` when debugging.

## Minimal Working Example

A config that tracks a simple integer counter incremented on every turn:

```json
{
  "variables": [
    {
      "name": "turnCount",
      "initialValue": "0",
      "perTurnUpdate": "turnCount + 1"
    }
  ],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "true",
      "modification": "Turn number: {{turnCount}}"
    }
  ]
}
```

After each turn, `turnCount` is incremented and injected into the system prompt as a stage direction. The `{{turnCount}}` template substitution is handled by `replaceTags` ([`Stage.tsx:L683-L699`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L683-L699)).

</div>
