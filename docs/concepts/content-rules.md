# Content Rules

<div v-pre>

Content rules are conditional transformations applied to message text and system prompts at five defined points in the turn.

## ContentCategory

[`ContentRule.tsx:L3-L9`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/ContentRule.tsx#L3-L9)

```typescript
enum ContentCategory {
  Input = 'Input',
  PostInput = 'Post Input',
  StageDirection = 'Stage Direction',
  Response = 'Response',
  PostResponse = 'Post Response',
}
```

## ContentRule Fields

[`ContentRule.tsx:L11-L21`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/ContentRule.tsx#L11-L21)

```typescript
class ContentRule {
  category: ContentCategory
  condition: string    // default 'true'; skip rule if falsy
  modification: string // default '{{content}}'; template producing new text
}
```

`condition` is evaluated as a mathjs expression against the current variable scope. `modification` is processed through `replaceTags` (variable substitution) after the condition passes.

## evaluateAndApply

[`ContentRule.tsx:L23-L35`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/ContentRule.tsx#L23-L35)

```typescript
evaluateAndApply(stage, targetCategory: ContentCategory): string | null
```

Returns `null` if the rule's category does not match `targetCategory`, or if `condition` evaluates to falsy. Otherwise evaluates `modification` with `{{content}}` replaced by the current text being transformed, then passes the result through `replaceTags` for variable substitution.

## Category-to-Field Mapping

Different categories write to different return fields. From [`Stage.tsx:L858-L881`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L858-L881) (in `beforePrompt`) and [`Stage.tsx:L909-L934`](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L909-L934) (in `afterResponse`):

| Category | Phase | Output field |
|----------|-------|-------------|
| `Input` | beforePrompt | `modifiedMessage` (replaces user message) |
| `Post Input` | beforePrompt | `systemMessage` (injected into system prompt) |
| `Stage Direction` | beforePrompt | `stageDirections` (prefixed with "Response Instruction: ") |
| `Response` | afterResponse | `modifiedMessage` (replaces bot response) |
| `Post Response` | afterResponse | `systemMessage` |

Rules are applied sequentially. Each rule in a category receives the output of the previous rule as `{{content}}`, so rules chain.

## Worked Example: A Rewrite Rule

This rule rewrites the bot's response when a combat variable is active:

```json
{
  "content": [
    {
      "category": "Response",
      "condition": "inCombat == 1",
      "modification": "{{content}}\n\n[HP: {{playerHP}}/{{playerMaxHP}}]"
    }
  ]
}
```

When `inCombat` is `1`, the rule appends an HP status line to every bot response. `{{content}}` expands to the original response text. `{{playerHP}}` and `{{playerMaxHP}}` expand to their current variable values.

A more aggressive rewrite — completely replacing the user message before the LLM sees it:

```json
{
  "content": [
    {
      "category": "Input",
      "condition": "silenced == 1",
      "modification": "[The character attempted to speak but was silenced. Narrate this failure.]"
    }
  ]
}
```

When `silenced` is `1`, the user's actual message is discarded and replaced with the scripted narration instruction.

## Stage Directions

Rules in the `Stage Direction` category produce `stageDirections`. The return value from `beforePrompt` prefixes each direction with `"Response Instruction: "`:

```typescript
stageDirections = stageDirectionRules.map(r => "Response Instruction: " + r).join('\n')
```

This is a lightweight way to append behavioral instructions to the LLM context without modifying the system prompt or the user message.

</div>
