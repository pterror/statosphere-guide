# Recipe: Scene Direction

<div v-pre>

This recipe automatically detects when the scene changes, keeps a variable holding the current location, and updates the chat background image accordingly. A Stage Direction rule keeps the bot oriented within the new scene.

## The config

```json
{
  "variables": [
    {
      "name": "currentScene",
      "initialValue": "\"a quiet tavern\""
    },
    {
      "name": "sceneChanged",
      "initialValue": "false",
      "perTurnUpdate": "false"
    }
  ],
  "classifiers": [
    {
      "name": "SceneShift",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "The user is trying to move to or enter {}.",
      "classifications": [
        {
          "label": "a new location",
          "category": "movement",
          "threshold": 0.6,
          "updates": [
            { "variable": "sceneChanged", "setTo": "true" }
          ]
        }
      ]
    },
    {
      "name": "SceneIdentifier",
      "condition": "sceneChanged",
      "useLlm": true,
      "inputTemplate": "{{content}}",
      "inputHypothesis": "The user wants to go to {}.",
      "classifications": [
        {
          "label": "split(\"the forest|the castle|the market|the dungeon|the shore\", \"|\")",
          "dynamic": true,
          "category": "destination",
          "threshold": 0.5,
          "updates": [
            { "variable": "currentScene", "setTo": "label" }
          ]
        }
      ]
    }
  ],
  "generators": [
    {
      "name": "BackgroundImage",
      "type": "Image",
      "phase": "On Response",
      "condition": "sceneChanged",
      "prompt": "\"Fantasy scene illustration, no text: \" + currentScene",
      "negativePrompt": "text, letters, watermark, logo, ui",
      "aspectRatio": "16:9",
      "updates": [
        { "variable": "background", "setTo": "{{content}}" }
      ]
    }
  ],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "true",
      "modification": "\"Current scene: \" + currentScene + \".\""
    },
    {
      "category": "Stage Direction",
      "condition": "sceneChanged",
      "modification": "\"The scene has just changed. Describe the new setting in your response.\""
    }
  ]
}
```

## How it works

1. `currentScene` holds the name of the current location. `sceneChanged` is a turn-scoped flag — it resets to `false` at the start of every turn via `perTurnUpdate`.

2. `SceneShift` detects if the user is trying to move somewhere. If the score is above 0.6, it sets `sceneChanged = true`.

3. `SceneIdentifier` only runs when `sceneChanged` is true. It uses the LLM (`useLlm: true`) and a dynamic label list to identify which specific location the user is heading to. The label list is built from a pipe-separated string using `split()`.

4. The `BackgroundImage` generator only fires when `sceneChanged` is true. It generates an image of the current scene and stores the URL in `background`, which Statosphere automatically uses as the chat background. See [Background Variable](../special/background).

5. Two Stage Direction rules run every turn: one tells the bot the current scene name; the other (only when the scene just changed) instructs it to describe the new setting.

## Simplifying the scene identifier

The `SceneIdentifier` classifier in this example uses a static list. For a simpler setup, skip it and let the user manually set the scene:

```
/setVar currentScene=the damp cave
```

Then the image generator will pick up the new value on the next turn.

## Without image generation

If you do not need the background image, remove the `generators` section and the `background` variable. The Stage Direction rules still work on their own to keep the bot oriented.

</div>

## Try it

<ClientOnly>
  <StatosphereStudio embedded template="branching-scenario" />
</ClientOnly>
