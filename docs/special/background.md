# Background Variable

<div v-pre>

If your config has a variable named `background`, Statosphere treats it specially: it uses the variable's value as the chat's background image URL.

## How it works

Set `background` to an image URL — by hand, via `/setVar`, or through a generator's `updates` — and Statosphere applies it as the chat background on the next turn.

```json
{
  "variables": [
    {
      "name": "background",
      "initialValue": "\"https://example.com/my-scene.jpg\""
    }
  ]
}
```

Or update it conditionally using a generator (the most common pattern):

```json
{
  "generators": [
    {
      "name": "SceneBackground",
      "type": "Image",
      "phase": "On Response",
      "condition": "sceneChanged",
      "prompt": "\"Illustration of: \" + currentScene",
      "aspectRatio": "16:9",
      "updates": [
        { "variable": "background", "setTo": "{{content}}" }
      ]
    }
  ]
}
```

When the `Image` generator finishes, `{{content}}` is the URL of the generated image. Storing it in `background` triggers Statosphere to apply it.

## Using a static background

If you just want a fixed background for the whole conversation, set an `initialValue` and no update formula:

```json
{
  "name": "background",
  "initialValue": "\"https://example.com/tavern.jpg\""
}
```

## Using /setVar to change it

You can change the background manually in chat:

```
/setVar background=https://example.com/new-scene.jpg
```

This is useful for testing image URLs before wiring up a generator.

## Notes

- The variable must be named exactly `background` (case-sensitive — lowercase). The check reads `this.scope.background` directly. ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L349-L355))
- The value passed to `updateEnvironment` is the variable's value, or an empty string if the variable is unset.
- If the URL is invalid or the image fails to load, the background reverts to default. No error appears in the chat.
- The background changes on the turn when the variable is updated — not retroactively for prior messages.

</div>
