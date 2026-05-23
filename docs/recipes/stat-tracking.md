# Recipe: HP Tracker

<div v-pre>

This recipe tracks a character's hit points across the conversation. A classifier watches for damage and healing events and updates `hp` accordingly. A content rule surfaces the current HP in every prompt so the bot always knows the character's condition.

## The config

```json
{
  "variables": [
    {
      "name": "hp",
      "initialValue": "50"
    },
    {
      "name": "max_hp",
      "initialValue": "50"
    }
  ],
  "classifiers": [
    {
      "name": "CombatEvents",
      "inputTemplate": "{{content}}",
      "inputHypothesis": "The user describes the character {}.",
      "responseTemplate": "{{content}}",
      "responseHypothesis": "The character {}.",
      "classifications": [
        {
          "label": "taking damage or being hurt",
          "category": "health_event",
          "threshold": 0.65,
          "updates": [
            { "variable": "hp", "setTo": "max(0, hp - 10)" }
          ]
        },
        {
          "label": "healing or recovering",
          "category": "health_event",
          "threshold": 0.65,
          "updates": [
            { "variable": "hp", "setTo": "min(max_hp, hp + 15)" }
          ]
        }
      ]
    }
  ],
  "content": [
    {
      "category": "Stage Direction",
      "condition": "true",
      "modification": "\"HP: \" + hp + \"/\" + max_hp + \". \" + (hp < 15 ? \"The character is critically injured.\" : hp < 30 ? \"The character is hurt.\" : \"The character is in reasonable shape.\")"
    }
  ]
}
```

## How it works

1. Two variables hold current and maximum HP. Both start at 50.
2. One classifier runs on both user input and bot responses, looking for damage or healing events. Each label applies a fixed delta — adjust the numbers to fit your game.
3. The `max()` and `min()` calls prevent HP from going below 0 or above `max_hp`.
4. A Stage Direction tells the bot the current HP and an automatic status label on every turn.

The Stage Direction formula uses nested ternary choices (`? :`): "if HP is below 15 say 'critically injured'; if HP is below 30 say 'hurt'; otherwise say 'in reasonable shape'." To change the thresholds, edit the `15` and `30` values in the `modification` field.

## Extending it

- Add more classifier labels: `"dying"` (below 5 HP), `"unconscious"`, `"dead"`.
- Add a variable for `armor` and subtract it from damage: `max(0, hp - max(0, 10 - armor))`.
- Display the HP bar in the Response category by appending it to the bot's reply: `"{{content}}\n\nHP: " + hp + "/" + max_hp`.
- Add multiple stat types: `stamina`, `mana`, `sanity` — each with its own classifier and display line.

## Using /setVar for manual corrections

If the classifier gets the numbers wrong, the user can correct them directly:

```
/setVar hp=35
```

See [/setVar Command](../special/setvar).

</div>

## Try it

<ClientOnly>
  <StatosphereStudio embedded template="hp-tracker" />
</ClientOnly>
