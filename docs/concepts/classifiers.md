# Classifiers

<div v-pre>

Classifiers run zero-shot Natural Language Inference (NLI) against the user's input message or the LLM's response. They detect which labels best describe the text and use the results to update variables.

## Classifier Fields

[`Classifier.tsx:L3-L38`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Classifier.tsx#L3-L38)

```typescript
class Classifier {
  name: string
  condition: string          // mathjs expression; skip classifier if falsy
  inputTemplate: string      // template for classifying user input
  responseTemplate: string   // template for classifying bot response
  inputHypothesis: string    // NLI hypothesis for input classification
  responseHypothesis: string // NLI hypothesis for response classification
  dependencies: string       // comma-separated variable names
  classifications: Map<string, Classification>
  useLlm: boolean            // use LLM entailment scoring instead of HF model
  useHistory: boolean        // include conversation history in sequence
  historyContextSize: number // number of history turns to include
}
```

Runtime fields `skipped`, `processed`, `promise`, and `result` track execution state within a single turn.

## Classification

[`Classifier.tsx:L53-L71`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Classifier.tsx#L53-L71)

```typescript
class Classification {
  label: string             // static label text
  condition: string         // default 'true'; skip if falsy
  category: string          // grouping key; only highest-scoring label in a category wins
  threshold: number         // default 0.7; minimum entailment score to trigger
  dynamic: string           // expression returning string | string[]; overrides label
  updates: Map<string, string>  // variable name → formula string
}
```

## How Classification Works

[`Stage.tsx:L468-L584`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L468-L584)

During the appropriate phase (`OnInput` or `OnResponse`), `processRequests` kicks off each classifier whose `condition` evaluates to truthy. The classifier's `kickOffClassifier` method:

1. Evaluates the sequence template (`inputTemplate` or `responseTemplate`) with the current scope to produce the text to classify.
2. Evaluates the hypothesis template (`inputHypothesis` or `responseHypothesis`).
3. Collects candidate labels — for each `Classification`, if `dynamic` is set, evaluates it to get a string or array of strings; otherwise uses `label`.
4. Routes the request to `queryLlm` (if `useLlm`) or `queryHf` (Gradio/Xenova). See [Classification Backends](../classification-backends).
5. Receives scores per label.

After scores arrive, `processRequests` applies the **category grouping rule**: within each `category` group, only the label with the highest entailment score is considered active. A label is applied if its score exceeds its `threshold` **and** it is the highest-scoring label in its category.

When a label is applied, its `updates` map is evaluated: each entry maps a variable name to a mathjs expression, and the result is assigned to that variable.

## State Predicates

[`Classifier.tsx:L40-L50`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Classifier.tsx#L40-L50)

Convenience predicates on the runtime instance:

- `skipped` — condition evaluated to falsy.
- `processed` — classification completed and results applied.
- `promise` — the in-flight async call.
- `result` — raw scores from the backend.

## JSON Shape

```json
{
  "classifiers": [
    {
      "name": "sentimentDetector",
      "condition": "true",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "This text expresses {} emotion.",
      "classifications": [
        {
          "label": "positive",
          "category": "sentiment",
          "threshold": 0.6,
          "updates": {
            "mood": "\"happy\"",
            "moodScore": "moodScore + 20"
          }
        },
        {
          "label": "negative",
          "category": "sentiment",
          "threshold": 0.6,
          "updates": {
            "mood": "\"sad\"",
            "moodScore": "moodScore - 20"
          }
        }
      ]
    }
  ]
}
```

Because both `positive` and `negative` share `category: "sentiment"`, only whichever scores higher will fire. This prevents contradictory variable updates in the same turn.

## Cross-Reference

Classification is routed to one of three backends depending on `useLlm` and availability. See [Classification Backends](../classification-backends) for the full routing logic.

</div>
