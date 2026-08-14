import assert from "node:assert/strict";
import { test } from "node:test";

import { requiredSecretCaptures, verifyMaskEvidence } from "../src/recording-verifier.js";
import type { TimelineEvent } from "../src/types.js";

const event = (stepId: string, options: { screenshot?: string; secretInput?: boolean } = {}): TimelineEvent => ({
  chapterId: "chapter",
  chapterTitle: "Chapter",
  stepId,
  action: "screenshot",
  label: stepId,
  startedAtMs: 0,
  endedAtMs: 1,
  ...(options.screenshot ? { screenshot: options.screenshot } : {}),
  evidence: [],
  secretInput: options.secretInput ?? false,
});

test("requires the first evidence screenshot after every secret input", () => {
  const before = event("before", { screenshot: "before.png" });
  const secret = event("secret", { secretInput: true });
  const after = event("after", { screenshot: "after.png" });
  assert.deepEqual(requiredSecretCaptures([before, secret, after]), [after]);
  assert.throws(() => requiredSecretCaptures([secret]), /no following evidence screenshot/u);
});

test("does not let an unrelated configured mask satisfy a secret-input proof", () => {
  const capture = event("after", { screenshot: "after.png" });
  assert.throws(
    () => verifyMaskEvidence(capture, [{ area: 100, matches: 100, secret: false, configured: true }], true),
    /Secret input is not visibly protected/u,
  );
});

test("does not let an automatic secret mask satisfy a missing configured-selector proof", () => {
  const capture = event("after", { screenshot: "after.png" });
  const summary = verifyMaskEvidence(
    capture,
    [{ area: 100, matches: 100, secret: true, configured: false }],
    true,
  );
  assert.equal(summary.matchingMaskPixels, 100);
  assert.equal(summary.capturedConfiguredMask, false);
});
