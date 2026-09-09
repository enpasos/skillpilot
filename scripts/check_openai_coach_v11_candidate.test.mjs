import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadAndVerifyCandidate, verifyDescriptor, verifyHistoricalBaseline } from "./check_openai_coach_v11_candidate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const actualDescriptor = () => JSON.parse(readFileSync(resolve(root,
  "ai/openai candidates/skillpilot-coach-v1/1.1.0/candidate.json"), "utf8"));

test("promoted plan-first candidate uses current source and only archives the rejected baseline", () => {
  const descriptor = loadAndVerifyCandidate(root);
  assert.equal(descriptor.featureGate.defaultEnabled, true);
  assert.equal(descriptor.activation.reviewFreezeLifted, true);
  assert.equal(descriptor.activation.prepareAllowed, true);
  assert.equal(Object.hasOwn(descriptor, "candidateArtifacts"), false);
  assert.equal(Object.hasOwn(descriptor.baseContract, "files"), false);
  assert.equal(Object.hasOwn(descriptor.baseContract, "tree"), false);
});

test("promotion does not silently imply publication, deployment or portal permission", () => {
  for (const key of ["publishAllowed", "portalMutationAllowed", "deploymentVerified"]) {
    const descriptor = actualDescriptor();
    descriptor.activation[key] = true;
    assert.throws(() => verifyDescriptor(descriptor));
  }
});

test("historical baseline cannot be redirected to mutable source or forged", () => {
  const descriptor = actualDescriptor();
  descriptor.baseContract.snapshotPath = descriptor.sourceRoot;
  assert.throws(() => verifyDescriptor(descriptor));
  assert.throws(() => verifyHistoricalBaseline(root, descriptor.baseContract));
  descriptor.baseContract.snapshotPath = "../outside";
  assert.throws(() => verifyDescriptor(descriptor));
  descriptor.baseContract.snapshotManifestSha256 = "0".repeat(64);
  assert.throws(() => verifyDescriptor(descriptor));
});

test("plan projection and tool evolution are explicit", () => {
  const descriptor = actualDescriptor();
  assert.deepEqual(descriptor.toolSurface.addedTools,
    ["resume_skillpilot_learning_plan", "switch_skillpilot_learning_plan_subject"]);
  assert.equal(descriptor.toolSurface.unpublishedToolRemoved, "get_skillpilot_daily_plan");
  descriptor.featureGate.defaultEnabled = false;
  assert.throws(() => verifyDescriptor(descriptor));
});
