# Recipe: Response Guidance

<div v-pre>

This recipe detects when the bot is drifting from a character's defined personality or voice, then nudges it back via a Stage Direction — without the user seeing the nudge.

It also demonstrates dynamic response guidance: reading what the *user* is doing and giving the bot matching writing instructions.

## The config

```json
{
  "variables": [
    {
      "name": "userAction",
      "initialValue": "\"talking\""
    },
    {
      "name": "driftDetected",
      "initialValue": "false"
    }
  ],
  "classifiers": [
    {
      "name": "UserIntent",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "The user is primarily {}.",
      "classifications": [
        {
          "label": "examining or observing something closely",
          "category": "intent",
          "threshold": 0.6,
          "updates": [{ "variable": "userAction", "setTo": "\"examining\"" }]
        },
        {
          "label": "trying to end the scene or move on",
          "category": "intent",
          "threshold": 0.6,
          "updates": [{ "variable": "userAction", "setTo": "\"transitioning\"" }]
        },
        {
          "label": "taking a direct action or attacking",
          "category": "intent",
          "threshold": 0.6,
          "updates": [{ "variable": "userAction", "setTo": "\"acting\"" }]
        },
        {
          "label": "talking or asking a question",
          "category": "intent",
          "threshold": 0.5,
          "updates": [{ "variable": "userAction", "setTo": "\"talking\"" }]
        }
      ]
    },
    {
      "name": "CharacterDrift",
      "responseTemplate": "{{content}}",
      "responseHypothesis": "This response sounds {}.",
      "classifications": [
        {
          "label": "out of character or too formal",
          "threshold": 0.7,
          "updates": [{ "variable": "driftDetected", "setTo": "true" }]
        }
      ]
    }
  ],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "userAction == \"examining\"",
      "modification": "\"The user is examining something. Write a detailed, sensory description. Focus on what {{char}} notices.\""
    },
    {
      "category": "Stage Direction",
      "condition": "userAction == \"transitioning\"",
      "modification": "\"The user is trying to move on. Wrap up the current moment naturally and introduce the next scene.\""
    },
    {
      "category": "Stage Direction",
      "condition": "userAction == \"acting\"",
      "modification": "\"The user is taking action. Write a dynamic, punchy response. React to the action directly.\""
    },
    {
      "category": "Stage Direction",
      "condition": "driftDetected",
      "modification": "\"Important: stay in character as {{char}}. Speak in their established voice and manner.\""
    }
  ]
}
```

## How it works

1. `UserIntent` reads the user's message and classifies what they are trying to do. It updates `userAction` to one of four values.

2. Four Stage Direction rules each fire for a different `userAction` value, giving the bot a specific writing instruction tailored to what the user is doing.

3. `CharacterDrift` reads the *bot's* response (note `responseTemplate`) and flags whether it sounds out of character. If so, `driftDetected` is set to `true`. (Statosphere auto-creates variables that classifiers write to, but declaring `driftDetected` explicitly in `variables` as shown above is good practice — it makes the config easier to read.)

4. A final Stage Direction fires when `driftDetected` is true, reminding the bot to stay in character. This fires on the *next* turn after drift was detected — Statosphere cannot modify the response that was already generated.

## Limitations

The drift detection fires after the response is already shown. It cannot retroactively change the bad reply; it prevents the *next* one from drifting. For more immediate correction, consider using `useLlm: true` on the classifier, which may detect tone issues more reliably.

## Customizing the character voice reminder

Replace the generic drift reminder with something specific to your character:

```json
{
  "category": "Stage Direction",
  "condition": "driftDetected",
  "modification": "\"Remember: {{char}} speaks in short, clipped sentences. They never apologize and they never explain themselves. Get back on track.\""
}
```

</div>

## Try it

<ClientOnly>
  <StatosphereStudio embedded template="persistent-memory" />
</ClientOnly>
