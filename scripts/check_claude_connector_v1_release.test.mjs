import assert from "node:assert/strict";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  calculateCandidateContractSha256,
  validateClaudeReleaseState,
  verifyClaudeConnectorV1Release,
} from "./check_claude_connector_v1_release.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("retired Claude learner-binding edge and static resources stay absent", () => {
  for (const path of [
    "backend/src/main/resources/claude-connector-v1/connect.html",
    "backend/src/main/resources/claude-connector-v1/connect.js",
    "backend/src/main/resources/claude-connector-v1/id-decrypt.js",
  ]) {
    assert.equal(existsSync(resolve(repositoryRoot, path)), false, path);
  }

  const vhost = readFileSync(
    resolve(repositoryRoot, "deploy/nginx/skillpilot-claude-connector-v1.conf"),
    "utf8",
  );
  assert.doesNotMatch(vhost, /location\s+(?:=|\^~)\s+\/connect\/?\s*\{/u);
  assert.doesNotMatch(vhost, /\/internal\/connectors\/claude\/v1\/connect/u);

  const runbook = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-release.md"),
    "utf8",
  );
  for (const route of ["`/connect`", "`/connect/`", "`/connect/details`", "`/connect/bind`"]) {
    assert.ok(runbook.includes(route), `runbook must require HTTP 404 for ${route}`);
  }
});

test("Claude v1 dossier is a structurally valid pre-submission candidate", () => {
  const result = verifyClaudeConnectorV1Release({ repositoryRoot });

  assert.deepEqual(result.errors, []);
  assert.ok(
    ["PRE_SUBMISSION", "READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(
      result.lifecycleState,
    ),
  );
  assert.equal(result.toolCount, 12);
  assert.equal(result.requiredGateCount, 22);
  assert.equal(result.blockers.length, result.requiredPendingCount);
});

test("malformed retained-resource JSON is reported as a structured failure", () => {
  const fixtureRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-release-malformed-index-"),
  );
  const retainedResourceIndexPath =
    "backend/src/main/resources/claude-connector-v1/mcp-apps/retained-resources.json";

  try {
    for (const path of [
      "ai/claude/connector-v1/directory-listing.json",
      "ai/claude/connector-v1/release-gates.json",
      "ai/claude/connector-v1/release/lifecycle.json",
      "ai/claude/connector-v1/evidence/manifest.json",
      "ai/claude/connector-v1/release/contract-baseline.json",
    ]) {
      const destination = resolve(fixtureRoot, path);
      mkdirSync(dirname(destination), { recursive: true });
      copyFileSync(resolve(repositoryRoot, path), destination);
    }

    const retainedResourceIndex = resolve(fixtureRoot, retainedResourceIndexPath);
    mkdirSync(dirname(retainedResourceIndex), { recursive: true });
    writeFileSync(retainedResourceIndex, '{"schemaVersion":1,"resources":[\n', "utf8");

    let result;
    assert.doesNotThrow(() => {
      result = verifyClaudeConnectorV1Release({ repositoryRoot: fixtureRoot });
    });
    assert.equal(result.errors.length, 1);
    assert.match(
      result.errors[0],
      new RegExp(`^Cannot parse ${retainedResourceIndexPath}:`, "u"),
    );
    assert.equal(result.publicationStatus, "UNKNOWN");
    assert.equal(result.lifecycleState, "UNKNOWN");
    assert.equal(result.toolCount, 0);
    assert.equal(result.requiredGateCount, 0);
    assert.equal(result.requiredPendingCount, 0);
    assert.deepEqual(result.blockers, []);
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
});

test("strict state accepts a fully approved candidate fixture", () => {
  const fixture = readyFixture();
  const result = validateClaudeReleaseState({
    ...fixture,
    submissionReady: true,
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.requiredPendingCount, 0);
  assert.deepEqual(result.blockers, []);
});

test("submitted and published fixtures require approved Anthropic state evidence", () => {
  const submitted = readyFixture();
  submitted.lifecycle.state = "SUBMITTED";
  let result = validateClaudeReleaseState(submitted);
  assert.ok(result.errors.some((message) => message.includes("submissionEvidenceId")));

  addLifecycleEvidence(submitted, "submission-receipt", "SUBMITTED");
  submitted.lifecycle.externalStateEvidence.submissionEvidenceId = "submission-receipt";
  result = validateClaudeReleaseState(submitted);
  assert.deepEqual(result.errors, []);

  const published = structuredClone(submitted);
  published.lifecycle.state = "PUBLISHED";
  published.lifecycle.majorLines[0].status = "published";
  result = validateClaudeReleaseState(published);
  assert.ok(result.errors.some((message) => message.includes("publicationEvidenceId")));

  addLifecycleEvidence(published, "publication-verification", "PUBLISHED");
  published.lifecycle.externalStateEvidence.publicationEvidenceId =
    "publication-verification";
  result = validateClaudeReleaseState(published);
  assert.deepEqual(result.errors, []);
});

test("passing gates reject missing, unapproved and wrong-candidate evidence", () => {
  const missing = readyFixture();
  missing.gates.gates[0].evidence = ["unknown-evidence"];
  let result = validateClaudeReleaseState({ ...missing, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("unknown evidence")));

  const unapproved = readyFixture();
  unapproved.evidence.entries[0].status = "recorded";
  result = validateClaudeReleaseState({ ...unapproved, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("unapproved evidence")));

  const wrongCandidate = readyFixture();
  wrongCandidate.evidence.entries[0].candidateContractSha256 = "f".repeat(64);
  result = validateClaudeReleaseState({ ...wrongCandidate, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("different candidate")));
});

test("lifecycle rejects a widened or missing Claude-v1-only unfreeze", () => {
  const missing = readyFixture();
  delete missing.lifecycle.productOwnerUnfreeze;
  let result = validateClaudeReleaseState(missing);
  assert.ok(result.errors.some((message) => message.includes("Claude-v1-only")));

  const widened = readyFixture();
  widened.lifecycle.productOwnerUnfreeze.excludes = [];
  result = validateClaudeReleaseState(widened);
  assert.ok(result.errors.some((message) => message.includes("Claude-v1-only")));

  const allocatedV2 = readyFixture();
  allocatedV2.lifecycle.majorLines[1].status = "planned";
  result = validateClaudeReleaseState(allocatedV2);
  assert.ok(result.errors.some((message) => message.includes("future v2 line")));
});

test("candidate contract digest changes when a pinned file digest changes", () => {
  const baseline = readJson(
    "ai/claude/connector-v1/release/contract-baseline.json",
  );
  assert.equal(
    calculateCandidateContractSha256(
      baseline.files,
      baseline.trees,
      baseline.baseRevision,
    ),
    baseline.candidateContractSha256,
  );

  const changed = structuredClone(baseline.files);
  changed[0].sha256 = "0".repeat(64);
  assert.notEqual(
    calculateCandidateContractSha256(
      changed,
      baseline.trees,
      baseline.baseRevision,
    ),
    baseline.candidateContractSha256,
  );

  assert.notEqual(
    calculateCandidateContractSha256(
      baseline.files,
      baseline.trees,
      "f".repeat(40),
    ),
    baseline.candidateContractSha256,
  );
});

function readyFixture() {
  const listing = readJson("ai/claude/connector-v1/directory-listing.json");
  const gates = readJson("ai/claude/connector-v1/release-gates.json");
  const lifecycle = readJson("ai/claude/connector-v1/release/lifecycle.json");
  const baseline = readJson(
    "ai/claude/connector-v1/release/contract-baseline.json",
  );

  lifecycle.state = "READY_FOR_SUBMISSION";
  lifecycle.majorLines[0].status = "frozen_for_submission";
  lifecycle.directoryIdentity.slugApproved = true;
  baseline.state = "FROZEN_FOR_SUBMISSION";
  gates.submissionReady = true;

  const evidenceEntries = [];
  for (const gate of gates.gates) {
    if (!gate.required) {
      gate.evidence = [];
      continue;
    }
    const evidenceId = `approved-${gate.id}`;
    gate.status = "pass";
    gate.evidence = [evidenceId];
    evidenceEntries.push({
      id: evidenceId,
      status: "approved",
      observedAt: "2026-08-23",
      scope: `Synthetic unit-test evidence for ${gate.id}`,
      gateIds: [gate.id],
      candidateContractSha256: baseline.candidateContractSha256,
      candidateRevision: "b".repeat(40),
      externalEvidenceId: `test-fixture:${gate.id}`,
      sha256: "a".repeat(64),
      approvedBy: "unit-test",
      approvedAt: "2026-08-23T12:00:00Z",
    });
  }
  const evidence = {
    schemaVersion: 1,
    policy: "Synthetic unit-test fixture only.",
    entries: evidenceEntries,
  };

  return { listing, gates, lifecycle, evidence, baseline };
}

function addLifecycleEvidence(fixture, id, lifecycleState) {
  fixture.evidence.entries.push({
    id,
    status: "approved",
    observedAt: "2026-08-23",
    scope: `Synthetic ${lifecycleState} evidence`,
    gateIds: [],
    lifecycleStates: [lifecycleState],
    candidateContractSha256: fixture.baseline.candidateContractSha256,
    candidateRevision: "b".repeat(40),
    externalEvidenceId: `test-fixture:${id}`,
    sha256: "c".repeat(64),
    approvedBy: "unit-test",
    approvedAt: "2026-08-23T12:00:00Z",
  });
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), "utf8"));
}
