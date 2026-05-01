
export const isUnfinishedXml = (text) => {
  if (!text || !text.trim()) return false;

  const trimmedText = text.trimEnd();

  // 1. Check if it ends with a partial tag like <tool or <tool_call
  // or a partial closing tag like </tool
  if (/<[^>]*$/.test(trimmedText)) return true;

  // 2. Check if the model output was terminated by a stop token (eot_id / _C)
  // When this happens, the model may have been cut off mid-response, so we
  // still need to check for unbalanced tags even though the text doesn't end
  // with a partial tag.
  const hasStopToken = /_C$/.test(trimmedText) || /<\|eot_id\|>/.test(trimmedText);

  // 3. Count open vs closed tags for common tool-like tags
  const textToCheck = hasStopToken ? trimmedText.replace(/_C$/, '').trimEnd() : trimmedText;
  const tags = textToCheck.match(/<\/?[\w:-]+(\s+[\w:-]+(="[^"]*")?)*\s*\/?>/g) || [];
  const stack = [];

  for (const tag of tags) {
    if (tag.endsWith('/>')) continue; // Self-closing

    const match = tag.match(/<(\/)?([\w:-]+)/);
    if (!match) continue;

    const [_, isClosing, name] = match;
    if (isClosing) {
      const lastIndex = stack.lastIndexOf(name);
      if (lastIndex !== -1) {
        stack.splice(lastIndex, 1);
      }
    } else {
      stack.push(name);
    }
  }

  return stack.length > 0;
};

export const server = async ({ client }) => {
  return {
    "experimental.text.complete": async (input, output) => {
      const text = output.text;
      if (!text || !text.trim()) return;

      if (isUnfinishedXml(text)) {
        console.log(`[XML Repair] Detected unfinished XML in session ${input.sessionID}. Content ends with: "${text.slice(-20).replace(/\n/g, '\\n')}"`);
        
        // Trigger auto-continue
        await client.session.promptAsync({
          path: { id: input.sessionID },
          body: {
            message: "continue"
          }
        });
      }
    }
  };
};
