# Debug Mode

<div v-pre>

Statosphere writes diagnostic output to the browser's developer console. This output is always present to some degree, but you can get more of it by enabling debug mode.

## How to enable it

Add a variable named `debugMode` to your config and give it a truthy initial value:

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

Any truthy value works: `1`, `true`, `"yes"`. Set it to `0` or `false` to disable it when you are done testing.

## Where to see the output

Open your browser's developer console before refreshing the chat:

- **Chrome / Edge:** F12, then click the "Console" tab.
- **Firefox:** F12 → Console.
- **Safari:** Enable developer tools in Preferences → Advanced, then use the Develop menu.

After refreshing, you will see Statosphere's load-time output: what config it parsed, which variables were initialized, and any validation errors.

As the conversation runs, new log lines appear after each message — what classifiers fired, what scores they produced, which updates were applied, and any errors.

## What to look for

### Config parse errors

If your JSON is malformed or missing required fields, Statosphere will log an error and likely do nothing. Look for lines containing "error" or "invalid" near the top of the log.

### Classifier scores

Debug output includes the score each label received. If a classifier is not firing when you expect it to, check whether the score is close to your threshold — you may need to lower the threshold or adjust the hypothesis template.

### Variable values

After each turn, the log shows current variable values. If a variable is not updating as expected, compare the logged value to what you expected and trace back which classifier or update formula should have set it.

### Generator errors

If a generator fails (network error, bad prompt, model unavailable), the error appears in the console. Generators do not surface errors in the chat UI.

## Toggling it mid-session

You can toggle debug mode without refreshing the page:

```
/setVar debugMode=1
```

or to turn it off:

```
/setVar debugMode=0
```

## Removing it for production

When your config is working correctly, remove or zero out `debugMode` before sharing the bot. Leaving it on does not break anything, but it clutters the console for other users.

</div>
