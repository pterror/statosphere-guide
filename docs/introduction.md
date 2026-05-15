# Introduction

## What Is Statosphere?

Statosphere is a Chub.ai "stage" — a JavaScript module that intercepts every message in a chat before it reaches the LLM and after the LLM responds. A stage can inspect and rewrite both sides of that exchange, inject system prompts, fire off image generation requests, and maintain persistent state across turns.

The extension is authored by Lord-Raven and published at [https://github.com/Lord-Raven/statosphere](https://github.com/Lord-Raven/statosphere). This guide is pinned to commit [`e67cd9f`](https://github.com/Lord-Raven/statosphere/tree/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7).

## What Is a Chub Stage?

Chub.ai (Character Hub) supports a "stage" plugin interface. A stage is a class that extends `StageBase` from `@chub-ai/stages-ts` and exports two primary methods:

- `beforePrompt(userMessage)` — called after the user sends a message but before the LLM sees it.
- `afterResponse(botMessage)` — called after the LLM responds but before the response is displayed.

Each method can return a modified user message, system-prompt additions (called `stageDirections` and `systemMessage`), and persistent chat state.

Statosphere's entry point is a single library export:

```
src/index.ts  →  export { Stage as Stage } from "./Stage"
```

See [`src/index.ts:L1`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/index.ts#L1).

## How the Application Bootstraps

In development mode, [`src/App.tsx`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/App.tsx#L1-L13) picks `TestStageRunner` (a local harness that loads `assets/test-init.json`). In production it uses `ReactRunner`. Both paths instantiate `new Stage(data)`.

[`src/main.tsx`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/main.tsx#L1-L15) is a standard ReactDOM bootstrap that mounts `<App />` into the DOM.

## What Problem Does Statosphere Solve?

A plain Chub.ai character card has no persistent state beyond the conversation history itself. Statosphere adds:

- **Variables** — numeric or string values that persist across turns and can be updated by expressions evaluated by `mathjs`.
- **Classifiers** — zero-shot NLI classification that reads the latest message and sets variables based on detected sentiment, topic, or intent.
- **Generators** — text and image generation (via a Gradio backend or the LLM itself) triggered at configurable phases.
- **Content Rules** — conditional rewriting of user input, LLM output, and the system prompt.
- **Custom Functions** — user-defined mathjs functions that can be called from any expression.

Together these allow botmakers to build characters with mood systems, dynamic scene descriptions, conditional story triggers, and any other state-driven behavior without writing custom code.

## Five Core Elements

The five elements are described in `public/chub_meta.yaml`'s `creator_notes` field, which is the primary user-facing manual for the extension. This guide expands on each element with implementation details drawn from the source.

| Element | Docs Page |
|---------|-----------|
| Variables | [Concepts: Variables](./concepts/variables) |
| Functions | [Concepts: Functions](./concepts/functions) |
| Classifiers | [Concepts: Classifiers](./concepts/classifiers) |
| Generators | [Concepts: Generators](./concepts/generators) |
| Content Rules | [Concepts: Content Rules](./concepts/content-rules) |
