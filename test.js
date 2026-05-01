
import { isUnfinishedXml } from './index.js';

const tests = [
  {
    name: "Valid closed XML",
    text: "<tool_call name=\"test\">hello</tool_call>",
    expected: false
  },
  {
    name: "Partial opening tag at end",
    text: "Here is the tool call: <tool_cal",
    expected: true
  },
  {
    name: "Partial closing tag at end",
    text: "<tool_call name=\"test\">hello</tool_c",
    expected: true
  },
  {
    name: "Unclosed tag (truncated inside)",
    text: "<tool_call name=\"test\">This is some content that never ge",
    expected: true
  },
  {
    name: "Self-closing tag",
    text: "<file_info path=\"test.txt\" />",
    expected: false
  },
  {
    name: "Multiple tags, one unclosed",
    text: "<thought>I should run this</thought> <tool_call name=\"ls\">",
    expected: true
  },
  {
    name: "Text only",
    text: "This is just a regular message with no XML.",
    expected: false
  },
  {
    name: "Empty string",
    text: "",
    expected: false
  }
];

console.log("Running XML Repair Logic Tests...");
let passed = 0;

tests.forEach(test => {
  const result = isUnfinishedXml(test.text);
  if (result === test.expected) {
    console.log(`✅ PASS: ${test.name}`);
    passed++;
  } else {
    console.log(`❌ FAIL: ${test.name}`);
    console.log(`   Input: "${test.text}"`);
    console.log(`   Expected: ${test.expected}, Got: ${result}`);
  }
});

console.log(`\nTests finished: ${passed}/${tests.length} passed.`);

if (passed === tests.length) {
  process.exit(0);
} else {
  process.exit(1);
}
