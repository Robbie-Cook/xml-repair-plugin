
export const server = async ({ client }) => {
  const isUnfinishedXml = (text) => {
    if (!text.trim()) return false;
    
    // Check if it ends with a partial tag like <tool or <tool name="...
    if (/<[^>]*$/.test(text)) return true;
    
    // Count open vs closed tags for common tool-like tags
    const tags = text.match(/<\/?[\w:-]+(\s+[\w:-]+(="[^"]*")?)*\s*\/?>/g) || [];
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

  return {
    "experimental.text.complete": async (input, output) => {
      const text = output.text;
      if (!text || !text.trim()) return;

      if (isUnfinishedXml(text)) {
        console.log(`[XML Repair] Detected unfinished XML in session ${input.sessionID}. Continuing...`);
        
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
