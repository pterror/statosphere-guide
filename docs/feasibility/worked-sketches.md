# Worked Sketches

<div v-pre>

Twelve game ideas, ordered from "you can ship this tonight" to "you'll be fighting the platform the whole way." Each one names the primitives you'd use and is honest about what falls down.

For the building blocks these sketches lean on, see [Patterns](./patterns).

---

## 1. Mood-aware companion

The bot is a single character whose mood drifts based on how the user talks to them. Cold, warm, annoyed, smitten. Mood colors every reply.

**Verdict:** Doable.

**Sketch:** One variable `mood` (string, initial `"neutral"`). One classifier on user input with mutually-exclusive labels `affectionate`, `hostile`, `dismissive`, `playful`, each updating `mood`. One Stage Direction every turn: `"The character is feeling " + mood + " toward the user."` Done in twenty lines of JSON.

**Where it falls down:** Mood is a single bucket. If you want decay back to neutral over time, you need a [turn-count timer](./patterns#turn-count-timer). If you want orthogonal axes (warmth × trust), that is more variables and a bigger classifier — still fine.

---

## 2. Combat HP and stamina tracker

Two stats for a single-character fight scene. The bot describes hits and you want HP/stamina to actually move.

**Verdict:** Doable.

**Sketch:** Extend the [stat-tracking recipe](../recipes/stat-tracking). Add `stamina` alongside `hp`, both clamped via `min`/`max`. One classifier with labels `taking damage`, `healing`, `exerting`, `resting`. Stage Direction surfaces both stats and a status word ("bloodied," "exhausted") on every turn.

**Where it falls down:** Damage amounts are fixed deltas, not the model's narrative intent. A "minor scratch" and "catastrophic blow" both subtract the same 10 unless you split them into separate labels. You can scale by adding `minor damage`/`major damage`/`mortal damage` labels with different deltas — at the cost of classifier accuracy.

---

## 3. Background-swapper for scene transitions

The chat background changes when the scene moves from tavern to forest to dungeon.

**Verdict:** Doable.

**Sketch:** Use the [`background` variable](../special/background). One classifier on bot responses with labels for each location. Each label sets `background` to the image URL. Or: an Image generator that produces a fresh background when a scene-change is detected (slow — see caveat).

**Where it falls down:** If you go the generated-image route, every detected transition adds an image-generation latency spike. Pre-baked URLs are instant and look better.

---

## 4. NPC relationship meters

The user is wandering a town with five named NPCs. Each NPC has their own opinion of the user, shifting based on interactions.

**Verdict:** Doable with caveats.

**Sketch:** One numeric variable per NPC (`alex_rel`, `mira_rel`, ...). One classifier categorizing the *target* of the user's last message (mutually exclusive: `addressing alex`, `addressing mira`, ...) and a second classifier for *sentiment*. Combine with a [custom function](../syntax/functions) `bump(name, delta)` — or just use one classifier with N×M labels (`flirt with alex`, `insult mira`, ...) if N is small.

**Where it falls down:** N×M labels stop scaling around 6-8 NPCs. Above that, classifier accuracy degrades and your config becomes unmaintainable. Also: if the user addresses someone by pronoun, the classifier has to guess from context.

---

## 5. Branching scenario with locked scenes

A short narrative with five named scenes. Each scene unlocks the next when a condition is met (item found, NPC convinced, riddle answered).

**Verdict:** Doable.

**Sketch:** One `scene` variable (string). One boolean per unlock condition (`has_key`, `convinced_guard`). Classifier detects condition-meeting events. Content rules in Stage Direction inject scene-specific instructions: `condition: scene == "throne_room"` → `"The throne room is silent. The king watches the user."` See the [state machine pattern](./patterns#scene-state-machine).

**Where it falls down:** Nothing serious. This is squarely in Statosphere's sweet spot.

---

## 6. Open-ended inventory

The user picks up, drops, and uses items across a dungeon. Items have arbitrary names — "rusty sword," "blue potion," "a strange device the goblin dropped."

**Verdict:** Doable with caveats.

**Sketch:** A `pack` variable initialized as an empty array. A classifier with `picking up an item`, `dropping an item`, `using an item`. On pickup, run a regex via `capture()` on the user's message — or better, a Text generator that returns the item name as a short string — and push to the array via a [custom function](../syntax/functions). Surface `join(pack, ", ")` in Stage Direction. See the [inventory pattern](./patterns#inventory).

**Where it falls down:** Naming consistency. The model might say "the sword" one turn and "the rusty blade" the next, and your array now has two entries for the same thing. Removing items on drop/use is a string-match problem, and it will miss. For a closed item set (12 fixed dungeon items) this is fine; for genuinely open inventory it leaks.

---

## 7. Dating sim with cumulative mood

A romance scenario where the date's reception of you depends on the *trajectory* of interactions, not just the last one. Make three good moves in a row and they melt. One disastrous one wipes out the goodwill.

**Verdict:** Doable.

**Sketch:** A numeric `affection` variable. A classifier with weighted labels: `charming move` (+3), `sweet gesture` (+2), `dull` (0), `awkward` (-2), `disaster` (-6). A second variable `streak` that increments on positive, resets on negative — surfaces "they're warming up to you" vs. "you've broken the mood." Stage Direction prompts the bot with both.

**Where it falls down:** "Mood is a number" feels reductive, but it works because the bot interprets the number narratively. The classifier is the weak point — it needs strong, distinct labels to separate "charming" from "dull."

---

## 8. Mystery with clues, suspects, and a final accusation

A whodunit with three suspects, six clues, and an ending that depends on the player accusing the right suspect with enough evidence.

**Verdict:** Doable. Honestly, this is one of Statosphere's best fits.

**Sketch:** Six boolean `clue_*` variables, all starting false. One classifier detects clue-discovery events (one label per clue — or per category if clues cluster). Three suspect-interrogation classifiers detecting "currently interrogating X." A final classifier detects an accusation; a content rule gated on `accusation == "alex" && clue_letter && clue_alibi` triggers the win ending, with parallel rules for failure modes.

**Where it falls down:** The classifier has to reliably distinguish "discovers the bloody letter" from "discusses the bloody letter already discovered." Idempotency is easier — let it re-fire, the boolean stays true. The harder problem is making the bot not spoil clues the player has not found; that needs Stage Direction discipline ("Do not reveal clues the user has not yet uncovered. Discovered clues: ...").

---

## 9. Dungeon crawler with random rooms

The user descends a dungeon. Each new room is randomly chosen from a pool.

**Verdict:** Partially.

**Sketch:** A `room` variable, a `depth` counter incrementing each turn. A classifier label `moving deeper` triggers a room transition. The transition picks the next room — but here's the snag. You have two options:
  - **Closed list, narrative selection:** Let the bot pick which room comes next, prompted via Stage Direction with the list. Not random; the model decides.
  - **mathjs `random()`:** Works, but the value changes every evaluation. You need to commit it to a variable in a single update and never recompute. Doable with care.

**Where it falls down:** "Random" in the procgen sense — seeded, reproducible, independent of the model — is not a thing here. Players who reload or branch the chat will get different rooms. If the experience hinges on a specific generated dungeon persisting across sessions, you cannot deliver that.

:::tip Advanced
A [custom function](../syntax/functions) body executes as real JavaScript and can call `Math.random()`. The function's return value is what the expression sees — call it once, commit it to a variable, and treat the variable as the source of truth from then on. This is enough for "pick one of N rooms randomly per visit" but still cannot be seeded. See [Advanced: full JavaScript bodies](../syntax/functions#advanced-full-javascript-bodies).
:::

---

## 10. Card game with a deck and a hand

A simple card game — Blackjack, a tarot draw, a five-card poker hand. Deck shuffles, hand is dealt, cards leave play.

**Verdict:** Partially. Smaller is much easier.

**Sketch:** `deck` and `hand` as arrays of strings. `shuffle()` and `draw()` as custom functions. A classifier label `requesting a card` triggers a draw. Stage Direction surfaces the hand.

**Where it falls down:** mathjs's array support is shallow. Implementing a real shuffle inside a single-expression body is awkward, but the [JavaScript mode](../syntax/functions#advanced-full-javascript-bodies) lets you write a proper Fisher-Yates shuffle. For a three-card tarot draw, fine. For maintaining state through a full hand of poker with discards, you are doing too much work in a system that wasn't built for it.

---

## 11. Turn-based combat with multiple enemies and initiative order

The user fights three goblins. Each has HP, each takes a turn, initiative order matters, abilities have cooldowns.

**Verdict:** Not without extensions, really.

**Sketch:** You'd need one HP variable per enemy, a turn-order variable, cooldown variables per ability per actor, a classifier that distinguishes player action targets, and content rules driving each enemy's reaction. You can build all of it. The result will be config measured in hundreds of lines, fragile against any deviation from the expected combat grammar, and slower than just letting the LLM narrate combat with a single HP tracker.

**Where it falls down:** Statosphere has no loops. "Each enemy takes a turn in order" must be unrolled — three separate Stage Directions gated on initiative position, or one giant ternary. The lift-to-value ratio is bad. Use a single-pool HP variable and let the model handle the rest narratively.

---

## 12. Persistent campaign across multiple chats

A long-running RPG where the character keeps their inventory, XP, and history from one session to the next.

**Verdict:** Not without extensions.

**Sketch:** You can't. Variables live in the chat's message state. A new chat is a new game. The closest thing is asking the user to paste a save string at the start of each session that you parse via `capture()` and `/setVar` — but at that point you've reinvented a worse save file, and the user is doing your job.

**Where it falls down:** This is one of Statosphere's hard limits. If your design requires cross-chat persistence, you're in extension territory — a custom stage or external storage. The platform deliberately scopes state to a single chat.

</div>
