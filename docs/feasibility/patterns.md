# Patterns

<div v-pre>

Recurring building blocks. Most games decompose into a handful of these, composed. Each pattern names itself, describes what it does in one paragraph, and gives a sketch you can drop into a config and adapt. They are deliberately incomplete — the goal is to let you recognize the shape, not paste-and-ship.

For the syntax details, see the [Syntax](../syntax/overview) section. For full examples with explanation, see [Recipes](../recipes/stat-tracking).

---

## Inventory

A small bag of named items the player carries. Items are added by classifier on pickup events, removed on drop/use events, surfaced in Stage Direction so the bot knows what's available.

```json
{
  "variables": [
    { "name": "pack", "initialValue": "[]" }
  ],
  "functions": [
    { "name": "addItem", "parameters": "bag, item", "body": "isNotNull(item) and not contains(join(bag, \"|\"), item) ? concat(bag, [item]) : bag" }
  ],
  "classifiers": [{
    "name": "PackEvents",
    "inputHypothesis": "The user {}.",
    "classifications": [
      { "label": "picks up an item", "threshold": 0.65,
        "updates": [{ "variable": "pack", "setTo": "addItem(pack, capture(content, \"pick(?:s)? up (?:the |a |an )?([\\\\w ]+)\", \"i\")[0][0])" }] }
    ]
  }],
  "content": [
    { "category": "Stage Direction", "condition": "true",
      "modification": "\"The user is carrying: \" + (size(pack) > 0 ? join(pack, \", \") : \"nothing\") + \".\""
    }
  ]
}
```

The `capture()` step is the brittle bit. Works well for "pick up the X" phrasing; falls apart for "I grab the rusty thing on the table." A Text generator that returns a short item name is more robust if you can afford the latency.

---

## Scene state machine

A `scene` variable that names the current location or chapter. Transitions are gated on conditions. Per-scene Stage Directions inject the right context. Locked scenes have boolean unlock flags.

```json
{
  "variables": [
    { "name": "scene", "initialValue": "\"village_square\"" },
    { "name": "found_key", "initialValue": "false" }
  ],
  "classifiers": [{
    "name": "Transitions",
    "inputHypothesis": "The user {}.",
    "classifications": [
      { "label": "enters the cave", "threshold": 0.7,
        "updates": [{ "variable": "scene", "setTo": "\"cave_entrance\"" }] },
      { "label": "finds a small iron key", "threshold": 0.7,
        "updates": [{ "variable": "found_key", "setTo": "true" }] }
    ]
  }],
  "content": [
    { "category": "Stage Direction", "condition": "scene == \"cave_entrance\"",
      "modification": "\"The cave entrance yawns dark. \" + (found_key ? \"The iron lock on the inner gate is openable.\" : \"An iron gate blocks the way deeper.\")" }
  ]
}
```

Transitions are one-way unless you write the reverse classification too. For a free-roam map you'd want a "where is the user going" classifier with one label per location.

---

## Stat with derived consequences

A numeric stat plus narrative consequences at thresholds. The stat updates from classifier events; the consequences appear in Stage Direction via nested ternaries.

```json
{
  "variables": [
    { "name": "sanity", "initialValue": "100" }
  ],
  "classifiers": [{
    "name": "SanityEvents",
    "inputHypothesis": "The user {}.",
    "classifications": [
      { "label": "sees something disturbing", "threshold": 0.65,
        "updates": [{ "variable": "sanity", "setTo": "max(0, sanity - 15)" }] }
    ]
  }],
  "content": [
    { "category": "Stage Direction", "condition": "true",
      "modification": "\"Sanity: \" + sanity + \". \" + (sanity < 20 ? \"The user is hallucinating; shadows move at the edge of vision.\" : sanity < 50 ? \"The user is jumpy and unfocused.\" : \"The user is composed.\")"
    }
  ]
}
```

Stack consequences by writing more thresholds. Avoid more than three or four bands — beyond that, the model will not differentiate them in its output.

---

## Memory bank

The bot "remembers" facts the user mentions — names, preferences, side details — and references them later. Implemented as an array of short strings surfaced in Stage Direction.

```json
{
  "variables": [
    { "name": "memories", "initialValue": "[]" }
  ],
  "generators": [{
    "name": "RememberFact",
    "type": "Text",
    "phase": "On Input",
    "condition": "true",
    "prompt": "From this user message, extract a single short fact worth remembering about them, or reply 'none'. Message: {{content}}",
    "updates": [{ "variable": "memories",
      "setTo": "result == \"none\" or isNull(result) ? memories : concat(memories, [result])" }]
  }],
  "content": [
    { "category": "Stage Direction", "condition": "size(memories) > 0",
      "modification": "\"What you remember about the user: \" + join(memories, \"; \") + \".\"" }
  ]
}
```

Every input triggers an LLM call — meaningful latency. Cap the array if you don't want it to grow unbounded. The generator returning "none" is a soft signal, not a guarantee; expect occasional junk entries.

---

## Turn-count timer

Things that should happen "after a while." A counter increments each turn; a Stage Direction or transition fires when it crosses a threshold.

```json
{
  "variables": [
    { "name": "turn", "initialValue": "0" },
    { "name": "guard_alerted", "initialValue": "false" }
  ],
  "content": [
    { "category": "Stage Direction", "condition": "turn >= 5 and not guard_alerted",
      "modification": "\"The guard's patrol is now passing nearby. They will notice the user if anything draws attention.\"" },
    { "category": "Stage Direction", "condition": "true",
      "modification": "(turn := turn + 1) > 0 ? \"\" : \"\"" }
  ]
}
```

The increment-via-content-rule trick (`turn := turn + 1`) is ugly but reliable. The cleaner approach is to give the `turn` variable a `postResponse` update formula of `turn + 1` so it counts itself.

---

## Classifier-as-RNG

You want a coin flip or a small random outcome that *feels* random to the player. A classifier with low thresholds on labels that don't actually correspond to message content can yield surprisingly noisy choices — but it is the model's noise, not real randomness.

```json
{
  "classifiers": [{
    "name": "CoinFlip",
    "inputHypothesis": "The outcome is {}.",
    "classifications": [
      { "label": "favorable", "category": "flip", "threshold": 0.0,
        "updates": [{ "variable": "last_flip", "setTo": "\"heads\"" }] },
      { "label": "unfavorable", "category": "flip", "threshold": 0.0,
        "updates": [{ "variable": "last_flip", "setTo": "\"tails\"" }] }
    ]
  }]
}
```

Categories make labels mutually exclusive — exactly one wins. Threshold 0 ensures one always fires. The outcome is biased by the message content, so it's only random in a loose sense.

:::tip Advanced
For a real coin flip, a [custom function](../syntax/functions) body runs as JavaScript and can call `Math.random()`. Commit the result to a variable in a single update so it does not re-roll on every reference. This is undocumented in the rest of the guide — depend on it cautiously.
:::

:::warning
None of this is seeded. Reload the chat, branch a message, or rewind: the rolls are gone. Don't promise reproducibility you can't deliver.
:::

---

## Conditional unlock

A boolean that flips when a condition is met and never goes back. Useful for one-time discoveries, plot flags, and gating future scenes.

```json
{
  "variables": [
    { "name": "knows_truth", "initialValue": "false" }
  ],
  "classifiers": [{
    "name": "Revelations",
    "responseHypothesis": "The bot's reply {}.",
    "classifications": [
      { "label": "reveals the king's secret", "threshold": 0.75,
        "updates": [{ "variable": "knows_truth", "setTo": "true" }] }
    ]
  }],
  "content": [
    { "category": "Stage Direction", "condition": "knows_truth",
      "modification": "\"The user now knows the king is an impostor. Other characters will sense if the user lets this slip.\"" }
  ]
}
```

Boolean flags compose well. Most "remember that X happened" needs are this pattern, not the memory-bank pattern.

</div>
