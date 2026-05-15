# Introduction

Statosphere is a Chub.ai stage extension that gives you tools to make your bots smarter and more reactive — without writing any code. You describe what you want in a JSON config file, and Statosphere handles the rest: reading the conversation, updating your variables, injecting instructions, and generating images or extra text.

## What it lets you do

Here are six concrete things botmakers use it for, drawn from the [creator's own notes](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/public/chub_meta.yaml).

### 1. Stat tracking and display

Keep numeric stats like HP, gold, relationship scores, or sanity. A classifier watches for relevant events in the conversation (damage, healing, spending), updates the number, and a content rule surfaces it in the bot's replies or as a hidden system note.

### 2. Scenario escalation

Increment a turn counter each time the user sends a message. Feed that counter into content rules that inject new scenario details — rising tension, new NPCs appearing, doors unlocking — as the number grows. Add a classifier to speed up or slow down the pace based on what's happening in the story.

### 3. Behavior reinforcement

Use a classifier to detect when the user's message should trigger one of the bot's quirks or rules. When the classifier fires, a content rule adds a Stage Direction reminding the bot of that rule — nudging it without the user seeing the instruction.

### 4. Dynamic response guidance

Detect what the user is doing: examining something, moving on, asking a question, taking action. Then inject different writing instructions for each case. "The user is examining an object — be descriptive." "The user is ending the scene — introduce the next one."

### 5. Input clean-up

Some users write messages with bracketed out-of-character instructions. An Input content rule can strip those brackets, move the instruction into a hidden Stage Direction, and leave the chat history clean.

### 6. Content generation

Use generators to make extra LLM calls: produce a one-sentence recap of recent events, write flavor text, or update a scene background image whenever the location changes. Generators can store their output in variables, which other rules then use.

## Five building blocks

Everything in Statosphere is built from five types of configuration objects:

| Building block | What it does |
|---|---|
| **Variables** | Named values you track and update across turns |
| **Functions** | Reusable expression helpers you define once and call anywhere |
| **Classifiers** | Rules that read what was said and update variables accordingly |
| **Generators** | Extra LLM or image calls whose results are stored in variables |
| **Content Rules** | Rules that modify what the user sends, what the bot sees, or what gets displayed |

All five live in the same JSON config. You do not have to use all five — a simple stat tracker might only need variables, a classifier, and a content rule.

## What Statosphere cannot do

- It only works on Chub.ai. Users on other frontends will not see any effects.
- Its config is visible to users — any logic you build can be inspected.
- Every zero-shot classifier call hits an external Hugging Face inference endpoint. If that endpoint is down, Statosphere falls back to a much smaller local model and results will be less accurate.
- Generators make additional LLM calls. Bots that use them will respond more slowly and cost more tokens.
- Configuration changes do not appear to create a new version-history entry on Chub, so it is easy to accidentally overwrite your config with no easy undo.
