# Build Reference

## Dependencies

From [`package.json`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/package.json):

| Package | Version | Role |
|---------|---------|------|
| `@chub-ai/stages-ts` | `^0.5.2` | `StageBase` interface, `messenger`, `mcp` |
| `react` / `react-dom` | `^18` | UI framework (externalized in lib build) |
| `mathjs` | `^13.0.3` | Expression evaluator for all formulas |
| `ajv` | `^8.17.1` | JSON schema validation at load time |
| `@gradio/client` | `^1.14.0` | Gradio remote classification backend |
| `@xenova/transformers` | `2.17.2` | In-browser ONNX NLI pipeline |
| `@modelcontextprotocol/sdk` | (imported, not in package.json) | `CallToolResult` type for MCP tool |
| `zod` | (imported, not in package.json) | `z.object` in MCP registration — see Gotchas |

`@modelcontextprotocol/sdk` and `zod` are imported in `Stage.tsx` but are not declared in `package.json`. They are resolved transitively through `@chub-ai/stages-ts`.

## Vite Configuration

[`vite.config.ts`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/vite.config.ts)

Two build modes:

**Default mode** (`npm run dev`, `npm run preview`): React plugin only. Builds the full dev app with `TestStageRunner`.

**Library mode** (`npm run build`): Activates `vite-plugin-dts` and builds `src/index.ts` as a library in UMD, ES, CJS, and IIFE formats. React is externalized (not bundled). The output is the production artifact consumed by Chub.ai when the stage is loaded.

## Build Scripts

From `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "preview": "vite preview"
  }
}
```

`build` runs TypeScript compilation first (`tsc`), then Vite in library mode.

## Local Development Harness

[`src/TestRunner.tsx`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/TestRunner.tsx)

`TestStageRunner` is a generic React component (`L16-L102`) that:

1. Creates a `Stage` instance from `src/assets/test-init.json` (the dev fixture).
2. In a `useEffect` (`L86-L96`), calls `stage.load()`.
3. Provides a `runTests()` scaffold (`L39-L84`) for manually invoking `beforePrompt` and `afterResponse` with test data.

This harness is only active in dev mode. `src/App.tsx` selects it via `import.meta.env.DEV`.

## ONNX Model Bundle

`public/models/Xenova/mobilebert-uncased-mnli/` contains the bundled ONNX model files for in-browser zero-shot classification. These are served as static assets and loaded by `@xenova/transformers` on first use. The files add significant size to the repository but make offline/fallback classification possible without any CDN dependency.
