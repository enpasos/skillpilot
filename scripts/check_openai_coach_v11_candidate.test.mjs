import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { loadAndVerifyCandidate, verifyDescriptor, verifyHistoricalBaseline } from "./check_openai_coach_v11_candidate.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const currentManifest = () => JSON.parse(readFileSync(resolve(root,
  "ai/openai plugin/skillpilot-coach-v1/.codex-plugin/plugin.json"), "utf8"));
const actualDescriptor = () => JSON.parse(readFileSync(resolve(root,
  `ai/openai candidates/skillpilot-coach-v1/${currentManifest().version}/candidate.json`), "utf8"));

function candidateFixture(t) {
  const fixture = mkdtempSync(resolve(tmpdir(), "skillpilot-openai-candidate-test-"));
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  const manifestDirectory = resolve(fixture,
    "ai/openai plugin/skillpilot-coach-v1/.codex-plugin");
  mkdirSync(manifestDirectory, { recursive: true });
  writeFileSync(resolve(manifestDirectory, "plugin.json"), JSON.stringify(currentManifest()));
  return fixture;
}

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

test("the current descriptor version must match the manifest without rebinding history", (t) => {
  const fixture = candidateFixture(t);
  const manifest = currentManifest();
  const descriptor = actualDescriptor();
  descriptor.candidateVersion = "1.1.0";
  const directory = resolve(fixture,
    `ai/openai candidates/skillpilot-coach-v1/${manifest.version}`);
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, "candidate.json"), JSON.stringify(descriptor));
  assert.throws(() => loadAndVerifyCandidate(fixture),
    /Candidate descriptor version must match the current manifest/u);
  assert.equal(JSON.parse(readFileSync(resolve(root,
    "ai/openai candidates/skillpilot-coach-v1/1.1.0/candidate.json"), "utf8")).candidateVersion,
  "1.1.0", "The former candidate descriptor remains unchanged.");
});

test("a missing current descriptor cannot silently fall back to the earlier candidate", (t) => {
  const fixture = candidateFixture(t);
  const directory = resolve(fixture, "ai/openai candidates/skillpilot-coach-v1/1.1.0");
  mkdirSync(directory, { recursive: true });
  writeFileSync(resolve(directory, "candidate.json"), readFileSync(resolve(root,
    "ai/openai candidates/skillpilot-coach-v1/1.1.0/candidate.json")));
  assert.throws(() => loadAndVerifyCandidate(fixture),
    { message: `Missing candidate descriptor for current package ${currentManifest().version}.` });
});

test("candidate versions stay on the stable 1.1 line", () => {
  for (const candidateVersion of ["1.1.01", "1.1.1-beta.1", "1.2.0", "../1.1.1"]) {
    assert.throws(() => verifyDescriptor({ ...actualDescriptor(), candidateVersion }),
      /stable 1\.1\.x package version/u);
  }
});
