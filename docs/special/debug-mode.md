# Debug Mode

<div v-pre>

Statosphere always writes diagnostic output to your browser's developer console — you do not need to turn it on. This output is there every time you load a chat, whether or not you have a `debugMode` variable in your config.

## How to read the console output

Open your browser's developer console: press **F12**, then click the **Console** tab.

- **Chrome / Edge:** F12, then click the "Console" tab.
- **Firefox:** F12 → Console.
- **Safari:** Enable developer tools in Preferences → Advanced, then use the Develop menu.

After refreshing the chat page, you will see Statosphere's load-time output: what config it parsed, which variables were initialized, and any errors.

As the conversation runs, new log lines appear after each message. Here is what to look for:

### Red error messages

These appear if your settings file is malformed (missing a comma, wrong field name, etc.). Fix these first — if there are errors, Statosphere may do nothing at all.

### Classifier scores

The log shows the score each label received. If a classifier is not firing when you expect, check whether the score is close to your threshold. You may need to lower the threshold or adjust the hypothesis template.

### Variable values

After each turn, the log shows your variable values. If a variable is not updating as expected, compare the logged value to what you expected and trace back which classifier or update formula should have changed it.

### Generator errors

If a generator fails (network error, bad prompt, model unavailable), the error appears in the console. Generators do not surface errors in the chat itself.

## The `debugMode` variable

The `debugMode` variable is recognized and stored by the stage ([source](https://github.com/Lord-Raven/statosphere/blob/e67cd9ffaf1ee63e7b5c7bce11462516f547f5f7/src/Stage.tsx#L313-L316)), but in the current release it does not change the console output — logging behavior is identical whether `debugMode` is set or not. Its main value is as a **convention** signaling that you are in a testing configuration.

```json
{
  "variables": [
    {
      "name": "debugMode",
      "initialValue": "1"
    }
  ]
}
```

Any truthy value works: `1`, `true`, `"yes"`. Set it to `0` or `false` when you are done testing.

## Toggling it mid-session

```
/setVar debugMode=1
```

or to turn it off:

```
/setVar debugMode=0
```

## Removing it for production

When your config is working correctly, remove or zero out `debugMode` before sharing the bot. Leaving it on does not break anything, but it is a signal that you may have forgotten to clean up.

</div>
