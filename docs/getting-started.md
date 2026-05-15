# Getting Started

<div v-pre>

## Step 1: Add the stage to your bot or chat

Statosphere needs to be added before it does anything. You have two options:

- **Per-chat:** Open a chat's settings, find the stage dropdown, and search for "Statosphere." Add it to that specific chat.
- **Per-bot (recommended for sharing):** On your bot's page, scroll down to the Stages section and add Statosphere there. This applies it for everyone who starts a new chat with your bot.

The creator recommends testing in a specific chat first before applying to a public bot.

## What a settings file looks like

Statosphere is controlled by a settings file in JSON format. JSON looks like this: field names on the left in quotes, their values on the right. You do not need to write it by hand — the visual editor (below) builds it for you. What matters is knowing that the "Configuration" field in Statosphere expects this kind of text when you paste your settings in.

## Step 2: Open the config editor

Statosphere does nothing without configuration. Rather than handwriting JSON, use the official external editor:

**[lord-raven.github.io/statosphere-editor/](https://lord-raven.github.io/statosphere-editor/)**

Build your setup in the editor's GUI, then click "Copy" at the bottom to get the JSON.

## Step 3: Paste into the stage config modal

1. In Chub, open the chat or bot settings and find the Statosphere stage.
2. Open its configuration modal. You will see a single text field labeled "Configuration."
3. Paste the JSON from the editor into that field.
4. Save.

## Step 4: Refresh the chat

Statosphere reads the config when the page loads. After pasting, refresh the chat page to pick up the new config.

## A minimal working example

Here is a complete config you could paste right now. It tracks a `mood` variable and flips it when the classifier detects positive or negative sentiment in the user's message.

```json
{
  "variables": [
    {
      "name": "mood",
      "initialValue": "\"neutral\""
    }
  ],
  "classifiers": [
    {
      "name": "Sentiment",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "This message expresses {} sentiment.",
      "classifications": [
        {
          "label": "positive",
          "category": "sentiment",
          "threshold": 0.6,
          "updates": [
            { "variable": "mood", "setTo": "\"happy\"" }
          ]
        },
        {
          "label": "negative",
          "category": "sentiment",
          "threshold": 0.6,
          "updates": [
            { "variable": "mood", "setTo": "\"unhappy\"" }
          ]
        }
      ]
    }
  ],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "true",
      "modification": "\"The user's current mood is: \" + mood"
    }
  ]
}
```

What this does:
- Starts with `mood = "neutral"`.
- After each user message, the classifier checks whether it sounds positive or negative.
- Whichever label wins (above `threshold: 0.6` — meaning the classifier needs to be at least 60% confident) sets `mood` to the matching string.
- A Stage Direction injects the current mood as a hidden instruction before the bot replies.

## Editing an existing config

Drop your current config JSON back into the editor to modify it, then copy and re-paste. The editor understands the full config shape.

## Debugging

If something is not working, open your browser's developer console: press **F12**, then click the **Console** tab at the top of the panel that appears. Look for any red error messages — those will tell you if your config has a problem. Statosphere also logs what it loaded, what classifiers fired, and what values your variables have after each turn.

See [Debug Mode](./special/debug-mode) for more detail on reading the console output.

</div>
