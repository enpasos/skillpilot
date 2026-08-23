import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { renderMemoryCardMath } from "../src/memory-card-content.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

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

test("temporary learning sessions have no DOM or logging sink", async () => {
  const mainSource = await readFile(join(root, "src/memory-card-practice-main.js"), "utf8");
  const bridgeSource = await readFile(join(root, "src/mcp-app-bridge.js"), "utf8");
  const visibleAssignments = mainSource.match(/(?:textContent|innerHTML)\s*=\s*[^;]+/g) ?? [];
  assert.doesNotMatch(visibleAssignments.join("\n"), /learningSessionId|skillpilotId|learnerId/i);
  assert.doesNotMatch(`${mainSource}\n${bridgeSource}`, /console\.(?:debug|error|info|log|warn)\s*\(/);
  assert.doesNotMatch(`${mainSource}\n${bridgeSource}`, /localStorage|sessionStorage|indexedDB/i);
});
