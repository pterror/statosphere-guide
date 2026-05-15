# MCP and Environment

Statosphere uses two integration points beyond the core stage interface: the Model Context Protocol (MCP) tool registry and `messenger.updateEnvironment` for controlling the chat UI.

## MCP Tool Registration

[`Stage.tsx:L102-L114`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L102-L114)

In the constructor, the stage registers a demo MCP tool:

```typescript
this.mcp.registerTool(
  'ping-statosphere',
  {
    description: 'A simple ping tool to verify Statosphere MCP integration',
    inputSchema: z.object({}),
  },
  async () => {
    return { content: [{ type: 'text', text: 'pong' }] } satisfies CallToolResult
  }
)
```

`CallToolResult` is imported from `@modelcontextprotocol/sdk/types` ([`Stage.tsx:L28`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L28)). The `this.mcp.registerTool` API is provided by `StageBase`.

This is the only MCP tool registered. It exists as a proof-of-concept integration point; the actual logic of Statosphere does not use MCP for its core operations.

### `zod` Imported but Unused

[`Stage.tsx:L29`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L29) imports `z` from `zod`. The `z.object({})` call in the MCP registration appears to use it, but `zod` is not declared as a dependency in `package.json`. The schema validation for MCP input is effectively a no-op empty object schema. See [Gotchas](./gotchas#zod-unused).

## `messenger.updateEnvironment`

The `messenger` object is provided by `StageBase` and allows the stage to push environment updates to the Chub.ai UI.

### Background Image

[`Stage.tsx:L349-L355`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L349-L355)

```typescript
checkBackground() {
  if (this.background) {
    this.messenger.updateEnvironment({ background: this.background })
  }
}
```

`checkBackground` is called during `load()`. If a `background` URL was set in the config, it is pushed to the UI immediately. Generators can update `this.background` by writing to a variable named `background` (by convention), which will be picked up the next time `checkBackground` is called or an image generator completes.

### Input Enabled Toggle

[`Stage.tsx:L894`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L894) and [`Stage.tsx:L927`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L927)

At the start of `afterResponse`:
```typescript
this.messenger.updateEnvironment({ input_enabled: false })
```

At the end of `afterResponse`:
```typescript
this.messenger.updateEnvironment({ input_enabled: true })
```

This disables the chat input while the stage processes the bot's response (classifiers, generators, variable updates, content rules). It re-enables input only after all post-response work is complete and the final modified message is ready. This prevents race conditions where a user sends a second message while response-phase classifiers or generators are still running.
