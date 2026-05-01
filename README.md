# Opencode XML Repair Plugin

A plugin for [Opencode](https://opencode.ai) that automatically detects truncated or unclosed XML structures in assistant responses and triggers a continuation.

This is particularly useful for models that may occasionally hit output limits or produce mangled XML when calling tools.

## Features

- **Partial Tag Detection:** Detects if a message ends with an unclosed opening or closing XML tag.
- **Tag Balancing:** Maintains a stack of open XML tags to identify when a structure is incomplete.
- **Auto-Continue:** Automatically sends a "continue" prompt to the session when unfinished XML is detected.

## Installation

### Local Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Robbie-Cook/xml-repair-plugin.git
   ```

2. Register the plugin with Opencode:
   ```bash
   opencode plugin ./xml-repair-plugin
   ```

3. Restart Opencode to initialize the plugin.

## Testing

The plugin includes a test suite to verify the detection logic against various mangled XML patterns.

To run the tests:
```bash
node test.js
```

## How it Works

The plugin hooks into the `experimental.text.complete` event. When a text part is completed, it analyzes the content for:
- Trailing partial tags (e.g., `<tool_ca` or `</tool`)
- Unbalanced tags (e.g., `<thought>` without a corresponding `</thought>`)

If an inconsistency is found, it uses the Opencode SDK to programmatically request a continuation of the current session.
