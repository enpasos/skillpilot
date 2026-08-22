import assert from "node:assert/strict";
import test from "node:test";

import { MEMORY_CARD_COPY } from "../src/memory-card-copy.js";
import {
  renderMemoryCardMath,
  tokenizeMemoryCardContent
} from "../src/memory-card-content.js";

test("card tokenizer keeps ordinary HTML as text and isolates TeX", () => {
  assert.deepEqual(
    tokenizeMemoryCardContent("<img src=x onerror=alert(1)> und $x^2$"),
    [
      { type: "text", value: "<img src=x onerror=alert(1)> und " },
      { type: "math", value: "x^2", display: false }
    ]
  );
  assert.deepEqual(
    tokenizeMemoryCardContent("Preis \\$5 und $$a+b$$"),
    [
      { type: "text", value: "Preis \\$5 und " },
      { type: "math", value: "a+b", display: true }
    ]
  );
});

test("KaTeX rendering is self-contained and does not trust learner commands", () => {
  const normal = renderMemoryCardMath("\\frac{1}{2}", false);
  assert.match(normal, /<math/);
  assert.doesNotMatch(normal, /<script|javascript:|\shref=/i);

  const untrusted = renderMemoryCardMath("\\href{javascript:alert(1)}{click}", false);
  assert.match(untrusted, /<mtext>\\href<\/mtext>/);
  assert.doesNotMatch(untrusted, /<a\b|\shref=|<script/i);
});

test("all visible copy is learner-facing and makes no mastery claim", () => {
  const samples = [];
  for (const copy of Object.values(MEMORY_CARD_COPY)) {
    for (const value of Object.values(copy)) {
      samples.push(typeof value === "function" ? value(2, 8) : value);
    }
  }
  const visibleCopy = samples.join("\n");
  assert.doesNotMatch(
    visibleCopy,
    /stateVersion|goalId|cardId|capabilit|OAuth|MCP|_meta|structuredContent|sessionId/i
  );
  assert.doesNotMatch(visibleCopy, /gemeistert|mastered|Lernziel abgeschlossen/i);
});
