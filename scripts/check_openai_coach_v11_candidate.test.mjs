import assert from "node:assert/strict";
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import {
  calculateTreeInventory,
  calculateReviewFreezeTreeSha256,
  loadAndVerifyCandidate,
  verifyDescriptor,
  verifyFrozenTree,
} from "./check_openai_coach_v11_candidate.mjs";

const repositoryRoot = resolve(dirname(new URL(import.meta.url).pathname), "..");
const candidatePath = resolve(
  repositoryRoot,
  "ai/openai candidates/skillpilot-coach-v1/1.1.0/candidate.json",
);

function actualDescriptor() {
  return structuredClone(JSON.parse(
    readFileSync(candidatePath, "utf8"),
  ));
}

test("local candidate descriptor and frozen OpenAI 1.0 tree are exact", () => {
  const descriptor = loadAndVerifyCandidate(repositoryRoot);
  assert.equal(descriptor.candidateVersion, "1.1.0");
  assert.equal(descriptor.featureGate.defaultEnabled, false);
  assert.equal(descriptor.toolSurface.disabledToolCount, 12);
  assert.equal(descriptor.toolSurface.enabledToolCount, 14);
});

test("descriptor rejects enabling the candidate by default", () => {
  const descriptor = actualDescriptor();
  descriptor.featureGate.defaultEnabled = true;
  assert.throws(
    () => verifyDescriptor(descriptor),
    /Expected values to be strictly deep-equal/u,
  );
});

test("frozen tree verification rejects changed bytes and added files", () => {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "skillpilot-openai-v11-"));
  try {
    const treeRoot = resolve(temporaryRoot, "frozen-v1");
    mkdirSync(treeRoot, { recursive: true });
    writeFileSync(resolve(treeRoot, "one.txt"), "one\n");
    const files = calculateTreeInventory(treeRoot);
    const treeSha256 = calculateReviewFreezeTreeSha256(files);
    const baseContract = {
      tree: "frozen-v1",
      treeDigestAlgorithm:
        "review-freeze-sha256-v1:path-nul-bytes-nul-content-sha256-lf",
      treeSha256,
      files,
    };
    assert.equal(
      verifyFrozenTree({
        root: temporaryRoot,
        baseContract,
        expectedTreeSha256: treeSha256,
      }),
      treeSha256,
    );

    writeFileSync(resolve(treeRoot, "one.txt"), "changed\n");
    assert.throws(
      () => verifyFrozenTree({
        root: temporaryRoot,
        baseContract,
        expectedTreeSha256: treeSha256,
      }),
      /changed byte-for-byte/u,
    );

    writeFileSync(resolve(treeRoot, "one.txt"), "one\n");
    writeFileSync(resolve(treeRoot, "two.txt"), "two\n");
    assert.throws(
      () => verifyFrozenTree({
        root: temporaryRoot,
        baseContract,
        expectedTreeSha256: treeSha256,
      }),
      /changed byte-for-byte/u,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});
