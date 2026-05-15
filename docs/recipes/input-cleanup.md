# Recipe: Input Cleanup

<div v-pre>

Some users write out-of-character instructions alongside their in-character messages — things like `[make this more dramatic]` or `[respond in first person]`. This recipe strips those brackets from what the bot receives (keeping the chat clean) and moves the instruction into a hidden Stage Direction so the bot still acts on it.

## The config

```json
{
  "variables": [
    {
      "name": "oocInstruction",
      "initialValue": "\"\"",
      "perTurnUpdate": "\"\""
    }
  ],
  "classifiers": [
    {
      "name": "OocDetector",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "This message contains {}.",
      "classifications": [
        {
          "label": "an out-of-character instruction in square brackets",
          "threshold": 0.6,
          "updates": [
            {
              "variable": "oocInstruction",
              "setTo": "capture(\"{{content}}\", \"\\\\[([^\\\\]]+)\\\\]\")[0][0]"
            }
          ]
        }
      ]
    }
  ],
  "content": [
    {
      "category": "Input",
      "condition": "isNotNull(oocInstruction) and oocInstruction != \"\"",
      "modification": "join(split(\"{{content}}\", \"[\" + oocInstruction + \"]\"), \"\")"
    },
    {
      "category": "Stage Direction",
      "condition": "isNotNull(oocInstruction) and oocInstruction != \"\"",
      "modification": "\"Author's note: \" + oocInstruction"
    }
  ]
}
```

## How it works

1. `oocInstruction` starts empty and resets to empty at the start of every turn via `perTurnUpdate`.

2. `OocDetector` checks whether the user's message contains bracketed text. If the classifier fires, it captures the text inside the brackets and stores it in `oocInstruction`. The `[0][0]` indexing is necessary because `capture()` returns an array of arrays — one sub-array per match, each containing its capture groups — so `[0][0]` extracts the first capture group of the first match as a plain string.

3. The `Input` rule fires when `oocInstruction` is not empty. It strips the full `[...]` block from the message so the bot never sees it.

4. The `Stage Direction` rule takes the captured instruction and injects it as an author's note — hidden from the chat history but visible to the bot.

## Simpler approach: no regex

If your use case is specific (e.g., users always write their instruction after a `//` marker), you can use `split` instead of `capture`:

```json
{
  "variables": [
    { "name": "oocInstruction", "initialValue": "\"\"", "perTurnUpdate": "\"\"" }
  ],
  "content": [
    {
      "category": "Input",
      "condition": "contains(\"{{content}}\", \"//\")",
      "modification": "split(\"{{content}}\", \"//\")[0]"
    },
    {
      "category": "Stage Direction",
      "condition": "contains(\"{{content}}\", \"//\")",
      "modification": "\"Author instruction: \" + split(\"{{content}}\", \"//\")[1]"
    }
  ]
}
```

This splits the message at `//` and sends the first half to the bot as the user's message, while the second half becomes a hidden stage direction.

## Important notes

- The `replace` built-in has a known bug and may not work for regex-based stripping. The `split`/`join` approach in the simpler example avoids it entirely.
- These rules only run on the current turn. Previous messages in the history are not affected.
- If you want the bot to treat the instruction as very authoritative, consider using `"Post Input"` instead of `"Stage Direction"` to position it closer to the end of the prompt.

</div>
