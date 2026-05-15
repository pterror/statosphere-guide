# Classification Backends

Statosphere supports three backends for zero-shot NLI classification. The active backend is selected per-classifier by the `useLlm` flag and by whether the Gradio remote is reachable.

## Backend 1: Remote Gradio (`Ravenok/statosphere-backend`)

The primary backend is a remote Gradio space. During `load()`, the stage connects to `Ravenok/statosphere-backend` via `@gradio/client`:

```typescript
this.client = await Client.connect("Ravenok/statosphere-backend")
```

The `client` field is defined at [`Stage.tsx:L330-L332`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L330-L332).

`queryHf` ([`Stage.tsx:L785-L807`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L785-L807)) sends the sequence, hypothesis, and candidate labels to the `/predict` endpoint. On failure, it flips `this.fallbackMode = true`, initiates a reconnection attempt in the background, and falls through to the Xenova local pipeline for the current request.

## Backend 2: In-Browser Xenova (`mobilebert-uncased-mnli`)

The fallback pipeline is loaded on-demand:

```typescript
pipeline("zero-shot-classification", "Xenova/mobilebert-uncased-mnli")
```

[`Stage.tsx:L330-L332`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L330-L332) (the `getPipeline` helper lazy-loads it).

The ONNX model files are bundled in `public/models/Xenova/mobilebert-uncased-mnli/`. This means classification works entirely in-browser without any network request when the Gradio backend is unavailable. The model is smaller and less accurate than a full-size NLI model, but it is sufficient for coarse sentiment and topic detection.

`fallbackMode` is a boolean on the `Stage` instance. Once set to `true` by a Gradio failure, all subsequent classifications use the local pipeline until the Gradio reconnection succeeds.

## Backend 3: LLM-Driven Entailment Scoring (`useLlm`)

When a classifier sets `useLlm: true`, `queryLlm` is used instead of `queryHf`:

[`Stage.tsx:L701-L783`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L701-L783)

The method constructs a prompt asking the LLM to score each candidate label's entailment against the sequence. The expected response format is:

```
1. label_name: 0.85
2. other_label: 0.42
```

The response is parsed with the regex `^\s*\d+\.\s*(.*?):\s*([0-9]*\.?[0-9]+)` to extract label names and numeric scores.

### Jaccard Label Matching

Because the LLM may paraphrase or reorder label text, the parser matches each returned label name to the known candidate labels using Jaccard similarity (≥ 0.5 threshold). Jaccard similarity is computed over word-level token sets:

```
jaccard(A, B) = |A ∩ B| / |A ∪ B|
```

This tolerates minor variations in how the LLM echoes the label names. If no candidate label achieves ≥ 0.5 Jaccard similarity with a returned name, that result is discarded.

This backend uses one of the configured `Generator` objects (via `generator.textGen`) to fire the scoring prompt, which means it consumes the LLM's context window and incurs latency comparable to a normal LLM response.

## Routing Summary

| Condition | Backend used |
|-----------|-------------|
| `classifier.useLlm == true` | LLM entailment scoring |
| `fallbackMode == false` | Remote Gradio |
| `fallbackMode == true` (after Gradio failure) | In-browser Xenova |

A Gradio failure during a turn does not cause that turn's classification to fail — it transparently retries with Xenova and queues a background reconnection.
