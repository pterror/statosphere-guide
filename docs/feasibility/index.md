# Can I build this?

<div v-pre>

> "I have an idea for game X. Can I build it with Statosphere alone — no custom code, no extensions, no specialized knowledge beyond what's in this guide?"

This section helps you answer that before you spend a weekend on it. Read the decision tree, glance at the matrix, then jump to [Worked Sketches](./worked-sketches) for shape-matching against real game ideas, or [Patterns](./patterns) for the building blocks once you know your idea fits.

## A short decision tree

Walk these in order. The first "no" is usually a meaningful answer.

**1. Does your game's persistent state fit in a small number of named values?**

State in Statosphere lives in [variables](../syntax/variables). A few dozen of them — numbers, booleans, short strings, small arrays — is comfortable. Hundreds of distinct, individually-addressable things (every card in a deck, every tile on a map, every item in a sprawling inventory) is not. If your game wants "the world" as a structured database, the platform will fight you.

If yes → continue.

**2. Does the bot need to react to *categories* of player intent, not specific tokens?**

"Is the player attacking?" "Is the player flirting?" "Is the player asking about an object?" — these are exactly what [classifiers](../syntax/classifiers) are for. A classifier asks "is this label implied by what the player wrote?" for each label you set up, then fires on the best match. Mutually-exclusive categories (the `category` field) ensure only one wins.

What classifiers do **not** do well: extract arbitrary structured data from free text. "What number did the player roll?" or "Which of fifty named items did they pick up?" are not questions a classifier answers cleanly. You can sometimes corner them with multi-label classifiers (one label per item) or with [`capture()`](../syntax/expressions) on a regex, but both are brittle once the space gets large.

**3. Does your game depend on randomness that isn't the LLM's whim?**

This is where most "I'll build a dice game in Statosphere" ideas die. mathjs has `random()`, but Statosphere gives you no way to make random numbers that come back the same when you replay or branch the scene — no reproducible dice, no way to commit to a roll before the player sees the outcome, and no clean way to make randomness feel mechanical instead of narrative. You can fake dice with a classifier that "rolls" on free text, but it is not random — it is the model's choice with extra steps.

:::tip Advanced
The platform actually executes [custom function](../syntax/functions) bodies as real JavaScript via `new Function(...)`, not as bare mathjs expressions. That means `Math.random()`, multi-line logic, and control flow are all available inside a function body, even though the guide presents functions as single-line formulas. See [Advanced: full JavaScript bodies](../syntax/functions#advanced-full-javascript-bodies) for how to use this. Treat it as a hatch, not a load-bearing pattern: this is undocumented upstream and a future tightening of the schema could close it.
:::

**4. Does your game require any of the following?**

If yes to any of these, Statosphere alone is not enough. These are hard limits.

- **Multiple human players in the same scene.** Stages are one chat, one user.
- **State that persists across separate chats.** Variables live in the chat's message state. Starting a new chat starts a new game.
- **Anything happening between user messages.** No timers, no background ticks, no scheduled events. The turn is the clock.
- **Network access.** Generators talk to Chub's LLM and image services; you cannot call an arbitrary API.
- **Reading or writing files.** Nothing escapes the chat.

**5. Are your generators few, and can they wait?**

[Generators](../syntax/generators) are real LLM or image calls. Each one adds latency and gates the response. One classifier and one Stage Direction is essentially free; three image generators on every turn will make the chat feel broken. The `lazy` field that would let them run in the background does not work — see [Gotchas](../reference/gotchas#the-lazy-field-has-no-effect).

If you walked all five and answered yes/yes/no/no/yes — you can almost certainly build it. Mixed answers usually mean "doable with caveats." Multiple no's on the hard limits mean reach for extensions or write something custom.

## Good at vs. bad at

| Statosphere is good at | Statosphere is bad at |
| --- | --- |
| Tracking a few persistent numbers and flags across a chat | Modeling large structured collections (decks, maps, big inventories) |
| Detecting *categories* of intent from free-text input | Extracting specific named entities or numbers reliably |
| Injecting context into every prompt so the bot stays in character | Acting between user turns or on a clock |
| Gating scenes, moods, and behaviors on accumulated state | Multi-user or cross-chat continuity |
| Swapping the chat background to mark scene transitions | Real audio, real animation, real anything outside text and images |
| Per-NPC moods, relationships, status effects | Combinatorially-large state spaces (per-tile, per-card, per-skill) |

## Where to next

- [Worked Sketches](./worked-sketches) — twelve game ideas from "trivially doable" to "fight the platform," with verdicts and how-you'd-build-it sketches.
- [Patterns](./patterns) — the recurring building blocks (inventory, state machine, stat with consequences, memory bank, turn-count timer, classifier-as-RNG) you'll assemble most games out of.

</div>