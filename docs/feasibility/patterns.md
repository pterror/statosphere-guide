# Patterns

<div v-pre>

Recurring building blocks. Most games are built from a handful of these shapes. Recognize the shape and the rest is filling in details. Each pattern names itself, describes what it does in one paragraph, and gives a sketch you can drop into a config and adapt. They are deliberately incomplete — the goal is to let you recognize the shape, not paste-and-ship.

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
    { "name": "turn", "initialValue": "0", "perTurnUpdate": "turn + 1" },
    { "name": "guard_alerted", "initialValue": "false" }
  ],
  "content": [
    { "category": "Stage Direction", "condition": "turn >= 5 and not guard_alerted",
      "modification": "\"The guard's patrol is now passing nearby. They will notice the user if anything draws attention.\"" }
  ]
}
```

The `perTurnUpdate` field on a variable runs its formula automatically at the start of every turn and saves the result back. `"turn + 1"` reads the current value of `turn` and gives back one more — Statosphere writes that as the new value of `turn`. No content rule needed.

The Stage Direction fires whenever `turn` has crossed 5 and the guard has not been alerted yet. Once `guard_alerted` flips to `true`, that Stage Direction stops appearing.

---

## Approximating time

Slice-of-life and time-flavored bots often want a sense of "what time of day is it?" or "how many days have passed?" None of these are real clocks — Statosphere has no background timer — but turn count gives you a workable proxy.

### Turn count as time of day

```json
{
  "variables": [
    { "name": "turn", "initialValue": "0", "perTurnUpdate": "turn + 1" },
    { "name": "timeLabel", "initialValue": "\"morning\"",
      "perTurnUpdate": "turn < 5 ? \"morning\" : turn < 10 ? \"afternoon\" : \"evening\"" }
  ],
  "content": [
    { "category": "Stage Direction", "condition": "true",
      "modification": "\"It is currently \" + timeLabel + \".\""
    }
  ]
}
```

`timeLabel` recalculates each turn from `turn`. This is not real time — it is a proxy — but it is perfectly fine for many narratives.

### Day of week from turn count

If a "day" is a fixed number of turns, you can derive a day name. mathjs does not support JavaScript-style array indexing (`["Mon",...][i]`), so the cleanest approach is a custom function:

```json
{
  "functions": [
    {
      "name": "dayName",
      "parameters": "n",
      "body": "const days = [\"Mon\",\"Tue\",\"Wed\",\"Thu\",\"Fri\",\"Sat\",\"Sun\"]; return days[n % 7];"
    }
  ],
  "variables": [
    { "name": "turn", "initialValue": "0", "perTurnUpdate": "turn + 1" },
    { "name": "dayLength", "initialValue": "8" }
  ],
  "content": [
    { "category": "Stage Direction", "condition": "true",
      "modification": "\"Today is \" + dayName(floor(turn / dayLength)) + \".\""
    }
  ]
}
```

Every `dayLength` turns, the day number advances by one. The function cycles through all seven names, so after seven days it wraps back to Monday.

:::tip Advanced
If you need the real-world date or actual clock time, a custom function can read `Date.now()` — see [Advanced: full JavaScript bodies](../syntax/functions#advanced-full-javascript-bodies).
:::

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
For a real coin flip, a [custom function](../syntax/functions) body runs as real JavaScript and can call `Math.random()`. Commit the result to a variable in a single update so it does not re-roll on every reference. See [Advanced: full JavaScript bodies](../syntax/functions#advanced-full-javascript-bodies) for the full picture — including caveats about this being undocumented upstream.
:::

:::warning
None of this produces random numbers that come back the same when you replay the scene. Reload the chat, branch a message, or rewind: the rolls are gone. Don't promise reproducibility you can't deliver.
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
