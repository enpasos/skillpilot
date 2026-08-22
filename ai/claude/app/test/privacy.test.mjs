import assert from "node:assert/strict";
import test from "node:test";

import { renderMemoryCardMath } from "../src/memory-card-content.js";

test("private card math cannot invoke KaTeX console diagnostics", () => {
  const calls = [];
  const original = {
    debug: console.debug,
    error: console.error,
    log: console.log,
    warn: console.warn
  };
  for (const method of Object.keys(original)) {
    console[method] = (...args) => calls.push([method, ...args]);
  }

  try {
    for (const expression of [
      "\\message{PRIVATE_CARD_FRONT}",
      "\\errmessage{PRIVATE_CARD_BACK}",
      "\\show\\reviewCapability"
    ]) {
      assert.throws(
        () => renderMemoryCardMath(expression, false),
        /Unsupported TeX diagnostic command/
      );
    }
  } finally {
    for (const [method, implementation] of Object.entries(original)) {
      console[method] = implementation;
    }
  }

  assert.deepEqual(calls, []);
});
