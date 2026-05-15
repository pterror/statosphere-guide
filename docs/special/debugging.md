# How Do I Tell If It's Working?

<div v-pre>

When something in your config is not behaving as expected, the console and `/setVar` are your two main tools. This page walks through how to use both, and covers the two most common failure patterns: a variable that is not updating, and a rule that is not firing.

## The console as ground truth

Open your browser's developer console (F12, then the Console tab). Statosphere writes diagnostic output after every turn. What to look for:

### Classifier scores

Every label that was tested gets a score in the log. If a classifier is not firing when you expect it to, check whether the score is landing below the threshold. A score of `0.55` against a threshold of `0.6` means the classifier is *almost* firing — lower the threshold to `0.5` and test again.

If the score is `0.2` or lower, the hypothesis template may not match what is being said. Try rewriting `inputHypothesis` to be more direct.

### Variable values

After each turn, the log shows every variable's current value. If a variable is not changing, compare the logged value to what you expected. If it stayed at its previous value, the classifier or update formula that should have changed it did not fire — look at the classifier scores for that turn.

### Red error messages

Red errors mean your config has a syntax or evaluation problem. Fix these first — if there are errors, Statosphere may skip large parts of processing silently.

### Generator errors

Generator failures (network errors, bad prompts, unavailable models) appear as errors in the console. They do not surface in the chat itself.

## `/setVar` as a manual test harness

`/setVar` lets you set a variable to any value for the current turn, without waiting for a classifier to detect it. This is useful for testing how content rules and Stage Directions respond to a specific state.

For example: if you have a Stage Direction that fires when `mood == "anxious"`, but the classifier never sets `mood` to `"anxious"` during your test, you can force it:

```
/setVar mood="anxious"
What is happening next?
```

The Stage Direction will fire as if the classifier had set the mood. If the bot's reply now reflects the anxious state, your content rule is working — the problem is in the classifier, not the rule.

See the [/setVar Command](./setvar) page for full syntax.

## Stuck variable diagnostic

If a variable is not updating when you expect it to, work through this checklist:

1. **Is the classifier firing at all?** Check the console for its scores. If the label's score is below the threshold, the classifier is not firing.

2. **Is the threshold being met?** A score of `0.58` against a threshold of `0.6` is just under. Lower the threshold temporarily to confirm the classifier *can* fire.

3. **Is the condition on the classification true?** If the label has a `condition` field, check whether that formula evaluates to true at the time the classifier runs. Use `/setVar` to put variables into the state you expect, then send a message and check the logs.

4. **Is the update formula correct?** If the classifier fires but the variable does not change, check the `setTo` expression for the update. A typo in the formula may silently evaluate to `null` rather than an error.

## Non-firing rule diagnostic

If a content rule (or Stage Direction) is not doing anything:

1. **Does the `category` match the phase?** An `"Input"` rule only fires during `beforePrompt` (on the user's message). A `"Response"` rule only fires during `afterResponse` (on the bot's reply). Make sure the category matches when you expect the rule to run.

2. **Is the `condition` true?** Check what the variable values actually are at that point (look at the console log). Use `/setVar` to force the state the condition requires, send a message, and verify the rule fires.

3. **Is the source variable what you expect?** Variable names are case-sensitive. A mismatch between `mood` and `Mood` is a common source of silent failures.

## Suggested debugging workflow

1. Lower thresholds aggressively during testing. Set classifier thresholds to `0.3` or lower to see what *would* fire under normal conditions. Once you know the classifier is detecting the right things, raise thresholds to appropriate values (`0.6`–`0.8`) before using the config in production.

2. Use `/setVar` to simulate specific states. Do not wait for classifiers to naturally reach a state you want to test — set it directly and verify the downstream behavior.

3. Use the console after every turn to confirm what fired. Do not assume a classifier fired or a variable updated — check the log.

4. Raise thresholds back to production values before sharing. A threshold of `0.3` is too low for real use; it will fire on almost any input.

</div>
