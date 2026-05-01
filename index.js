
export const isUnfinishedXml = (text) => {
  if (!text || !text.trim()) return false;
  
  const trimmedText = text.trimEnd();

  // 1. Check if it ends with a partial tag like <tool or <tool_call
  // or a partial closing tag like </tool
  if (/<[^>]*$/.test(trimmedText)) return true;
  
  // 2. Count open vs closed tags for common tool-like tags
  const tags = trimmedText.match(/<\/?[\w:-]+(\s+[\w:-]+(="[^"]*")?)*\s*\/?>/g) || [];
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
