
export const server = async ({ client }) => {
  const isUnfinishedXml = (text) => {
    if (!text || !text.trim()) return false;
    
    const trimmedText = text.trimEnd();

    // 1. Check if it ends with a partial tag like <tool or <tool_call
    // or a partial closing tag like </tool
    if (/<[^>]*$/.test(trimmedText)) return true;
    
    // 2. Count open vs closed tags for common tool-like tags
    // We'll use a stack-based approach but specifically for tags that
    // are common in LLM outputs (tool_call, tool_code, etc.)
    const tags = trimmedText.match(/<\/?[\w:-]+(\s+[\w:-]+(="[^"]*")?)*\s*\/?>/g) || [];
    const stack = [];
    
    for (const tag of tags) {
      if (tag.endsWith('/>')) continue; // Self-closing
      
      const match = tag.match(/<(\/)?([\w:-]+)/);
      if (!match) continue;
      
      const [_, isClosing, name] = match;
      if (isClosing) {
        // Find matching opening tag in stack (search from end)
        const lastIndex = stack.lastIndexOf(name);
        if (lastIndex !== -1) {
          stack.splice(lastIndex, 1);
        }
      } else {
        stack.push(name);
      }
    }
    
    // 3. Special case: if it ends with text but has unclosed tags
    if (stack.length > 0) return true;

    return false;
  };

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
