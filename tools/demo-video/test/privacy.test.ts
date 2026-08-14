import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertTextIsPrivate,
  createRedactorScript,
  findForbiddenText,
  maskLocator,
  redactForbiddenText,
  redactSensitiveText,
  validateForbiddenPatterns,
} from "../src/privacy.js";
import type { Locator } from "playwright";

test("redacts every configured sensitive pattern without exposing it in output", () => {
  const patterns = validateForbiddenPatterns([
    "sps_[A-Za-z0-9_-]{43}",
    "Bearer\\s+[A-Za-z0-9._-]+",
  ]);
  const session = `sps_${"A".repeat(43)}`;
  const input = `Continue ${session} with Bearer secret.token`;
  const redacted = redactForbiddenText(input, patterns);
  assert.equal(findForbiddenText(input, patterns).length, 2);
  assert.equal(findForbiddenText(redacted, patterns).length, 0);
  assert.equal(redacted, "Continue [REDACTED] with [REDACTED]");
});

test("fails early for an invalid privacy regular expression", () => {
  assert.throws(() => validateForbiddenPatterns(["["]), /Invalid privacy\.forbiddenPatterns/);
});

test("redacts exact runtime secrets and fails closed before artifact publication", () => {
  const config = {
    maskSelectors: [], requiredMaskSelectors: [], maskTextSelectors: [], maskLabel: "REDACTED", maskColor: "#111111",
    forbiddenPatterns: ["sps_[A-Za-z0-9_-]+"], evidenceSelectors: [], failOnForbiddenText: true,
  };
  assert.equal(redactSensitiveText("URL=private-url", config, ["private-url"]), "URL=[REDACTED]");
  assert.throws(() => assertTextIsPrivate("sps_secret", config, [], "narration"), /narration/);
});

test("maskLocator installs the persistent selector in the locator owning frame", async () => {
  const installed: string[] = [];
  const attributes = new Map<string, string>();
  const locator = {
    evaluate: async (callback: Function, argument: unknown) => {
      const apiName = "__DEMO_VIDEO_REDACTOR__";
      (globalThis as Record<string, unknown>)[apiName] = {
        add: (selector: string) => installed.push(selector),
        remove: () => undefined,
      };
      try {
        return callback({ setAttribute: (name: string, value: string) => attributes.set(name, value) }, argument);
      } finally {
        delete (globalThis as Record<string, unknown>)[apiName];
      }
    },
  } as unknown as Locator;

  await maskLocator(locator, "iframe-secret");
  assert.equal(attributes.get("data-demo-video-secret"), "iframe-secret");
  assert.deepEqual(installed, ['[data-demo-video-secret="iframe-secret"]']);
});

test("text-selective masks inspect candidate text against privacy patterns", () => {
  const script = createRedactorScript(
    [],
    ["[data-message-author-role='user']"],
    ["sps_[A-Za-z0-9_-]{43}"],
    "#111111",
    "REDACTED",
  );
  assert.match(script, /textContent/);
  assert.match(script, /forbiddenPatterns\.some/);
  assert.match(script, /data-message-author-role/);
});
