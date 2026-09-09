import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const RUNTIME_TEST_CLASS =
  "com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV11DailyPlanContractTest";
export const REJECTED_SNAPSHOT_PATH =
  "contracts/drafts/openai/skillpilot-coach-v1/1.0.0-SNAPSHOT";
const REJECTED_MANIFEST_SHA256 =
  "e6408e7054d53ab4a52f32f541b07201f1a8f6e183ff5772bc2d8164162b0f32";
const REJECTED_CONTRACT_SHA256 =
  "a6f6487890c638a2d689e65e32d7bc758b6215e31539255afefb37938cfb22cc";
const readJson = (path) => JSON.parse(readFileSync(path, "utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

export function verifyDescriptor(descriptor) {
  assert.equal(descriptor.schemaVersion, 2);
  assert.equal(descriptor.pluginIdentity, "skillpilot-coach-v1");
  assert.equal(descriptor.candidateVersion, "1.1.0");
  assert.equal(descriptor.status, "PROMOTED_TO_CURRENT_DRAFT");
  assert.equal(descriptor.sourceRoot, "ai/openai plugin/skillpilot-coach-v1");
  assert.deepEqual(descriptor.baseContract, {
    version: "1.0.0",
    status: "REJECTED",
    snapshotPath: REJECTED_SNAPSHOT_PATH,
    snapshotManifestSha256: REJECTED_MANIFEST_SHA256,
    contractFileSha256: REJECTED_CONTRACT_SHA256,
  });
  assert.deepEqual(descriptor.featureGate, {
    property: "skillpilot.openai.coach.v1.daily-plan-tools-enabled",
    defaultEnabled: true,
  });
  assert.deepEqual(descriptor.toolSurface, {
    legacyToolCount: 12,
    enabledToolCount: 14,
    addedTools: ["resume_skillpilot_learning_plan", "switch_skillpilot_learning_plan_subject"],
    unpublishedToolRemoved: "get_skillpilot_daily_plan",
    dailyPlanProjection: "learningPlanToday",
  });
  assert.deepEqual(descriptor.runtimeProof, {
    gradleProject: "backend",
    testClass: RUNTIME_TEST_CLASS,
  });
  assert.deepEqual(descriptor.activation, {
    prepareAllowed: true,
    publishAllowed: false,
    portalMutationAllowed: false,
    reviewFreezeLifted: true,
    deploymentVerified: false,
  });
  return descriptor;
}

export function verifyHistoricalBaseline(root, baseContract) {
  assert.equal(baseContract.snapshotPath, REJECTED_SNAPSHOT_PATH,
    "Historical baseline must reference the rejected snapshot, never the live source tree.");
  for (const [file, expected] of [
    ["snapshot-manifest.json", REJECTED_MANIFEST_SHA256],
    ["contract/contract.json", REJECTED_CONTRACT_SHA256],
  ]) {
    assert.equal(sha256(readFileSync(resolve(root, baseContract.snapshotPath, file))), expected,
      "Rejected historical evidence changed: " + file);
  }
}

export function loadAndVerifyCandidate(root = repositoryRoot) {
  const descriptor = verifyDescriptor(readJson(resolve(root,
    "ai/openai candidates/skillpilot-coach-v1/1.1.0/candidate.json")));
  verifyHistoricalBaseline(root, descriptor.baseContract);
  const sourceRoot = resolve(root, descriptor.sourceRoot);
  const manifest = readJson(resolve(sourceRoot, ".codex-plugin/plugin.json"));
  assert.equal(manifest.name, descriptor.pluginIdentity);
  assert.equal(manifest.version, descriptor.candidateVersion);
  assert.equal(manifest.apps, undefined,
    "With MCP submits the server directly; no existing development-app reference.");
  const line = readJson(resolve(sourceRoot, "release/line.json"));
  assert.equal(line.contractMajor, 1);
  assert.equal(line.workflowVersion, "coach@1.1");
  const lifecycle = readJson(resolve(sourceRoot, "release/lifecycle.json"));
  assert.equal(lifecycle.contractLine.publicationStatus, "DRAFT");
  assert.equal(lifecycle.contractLine.policyRevision, 5);
  const activeSkill = readFileSync(resolve(sourceRoot,
    "skills/skillpilot-coach-v1/SKILL.md"), "utf8");
  assert.ok(activeSkill.includes("learningPlanToday"));
  for (const name of descriptor.toolSurface.addedTools) assert.ok(activeSkill.includes(name));
  assert.equal(activeSkill.includes("get_skillpilot_daily_plan"), false,
    "The current skill reads the plan in authoritative full context, not a separate tool.");
  // No active-source hash pins: semantic and executable runtime tests protect
  // current behavior; only the rejected historical snapshot remains immutable.
  return descriptor;
}

export function verifyRuntimeContract(root = repositoryRoot) {
  const backendRoot = resolve(root, "backend");
  const result = spawnSync(resolve(backendRoot, "gradlew"),
    ["test", "--tests", RUNTIME_TEST_CLASS],
    { cwd: backendRoot, encoding: "utf8", stdio: "inherit" });
  assert.equal(result.error, undefined, result.error?.message);
  assert.equal(result.status, 0, "OpenAI plan-first runtime tests failed.");
}

export function checkOpenAiCoachV11Candidate(root = repositoryRoot) {
  const descriptor = loadAndVerifyCandidate(root);
  verifyRuntimeContract(root);
  return descriptor;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const descriptor = checkOpenAiCoachV11Candidate();
  console.log("OpenAI Coach current " + descriptor.candidateVersion
    + " draft passed: development freeze inactive; plan tools enabled.");
}
