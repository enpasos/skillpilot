import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  verifyClaudePluginV1Release,
} from "./check_claude_plugin_v1_release.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginPath = "ai/claude/plugin/skillpilot-coach-v1";
const releasePath = `${pluginPath}/release`;
const connectorBaselinePath = "ai/claude/connector-v1/release/contract-baseline.json";

test("checked-in public plugin lane is structurally valid but fail-closed PRE_SUBMISSION", () => {
  const result = verifyClaudePluginV1Release({ repositoryRoot });

  assert.deepEqual(result.errors, []);
  assert.equal(result.lifecycleState, "PRE_SUBMISSION");
  assert.equal(result.requiredGateCount, 16);
  assert.equal(result.requiredPendingCount, 16);
  assert.equal(result.blockers.length, 16);

  const gates = readJson(repositoryRoot, `${releasePath}/release-gates.json`);
  assert.equal(gates.submissionReady, false);
  assert.equal(gates.connectorDirectoryDependency, "none");
  assert.equal(
    gates.gates.some(({ id }) => /(?:team|enterprise|directory|permanent-slug)/iu.test(id)),
    false,
  );

  const attemptedSubmission = verifyClaudePluginV1Release({
    repositoryRoot,
    expectedState: "READY_FOR_SUBMISSION",
  });
  assert.match(
    attemptedSubmission.errors.join("\n"),
    /Expected plugin lifecycle READY_FOR_SUBMISSION, found PRE_SUBMISSION/u,
  );
});

test("READY_FOR_SUBMISSION is independent of Directory gates and needs approved current evidence", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "READY_FOR_SUBMISSION");

  const result = verifyClaudePluginV1Release({
    repositoryRoot: fixture,
    expectedState: "READY_FOR_SUBMISSION",
  });

  assert.deepEqual(result.errors, []);
  assert.equal(result.requiredPendingCount, 0);
  assert.deepEqual(result.blockers, []);
});

test("Directory and Team or Enterprise gates cannot enter plugin readiness", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "READY_FOR_SUBMISSION");
  const gates = readJson(fixture, `${releasePath}/release-gates.json`);
  gates.gates.push({
    id: "team-enterprise-directory-access",
    owner: "Product Owner",
    required: true,
    status: "pass",
    evidence: [],
  });
  writeJson(fixture, `${releasePath}/release-gates.json`, gates);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(result.errors.join("\n"), /independent public-plugin gate set exactly/u);
  assert.match(result.errors.join("\n"), /Team, Enterprise, Directory or permanent-slug/u);
});

test("a passed gate rejects evidence for another plugin candidate digest", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "READY_FOR_SUBMISSION");
  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  evidence.entries[0].candidateContractSha256 = "0".repeat(64);
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(result.errors.join("\n"), /must bind to the current plugin candidate digest/u);
  assert.match(result.errors.join("\n"), /not backed by approved current-candidate evidence/u);
});

test("a passed gate rejects evidence for another 40-character candidate revision", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "READY_FOR_SUBMISSION");
  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  evidence.entries[0].candidateRevision = "f".repeat(40);
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /must bind to the current plugin candidate revision/u,
  );
  assert.match(
    result.errors.join("\n"),
    /not backed by approved current-candidate evidence/u,
  );
});

test("the evidence manifest rejects another 40-character candidate revision", (t) => {
  const fixture = createFixture(t);
  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  evidence.candidateRevision = "f".repeat(40);
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /evidence manifest must bind to the checked-in plugin candidate revision/u,
  );
});

test("recorded gate evidence rejects another 40-character candidate revision", (t) => {
  const fixture = createFixture(t);
  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  const entry = evidence.entries.find(({ gateIds }) => gateIds.length > 0);
  assert.ok(entry);
  entry.status = "recorded";
  entry.candidateRevision = "f".repeat(40);
  entry.externalEvidenceId = `test-evidence:${entry.id}`;
  entry.sha256 = createHash("sha256").update(entry.id).digest("hex");
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /must bind to the current plugin candidate revision/u,
  );
});

for (const [gateId, evidenceId] of [
  ["public-github-source-sanitization", "public-github-source-final-plugin-candidate"],
  ["anthropic-console-submitter-role", "anthropic-console-submitter-role-final-candidate"],
]) {
  test(`READY_FOR_SUBMISSION rejects missing approved ${gateId} evidence`, (t) => {
    const fixture = createFixture(t);
    promoteAllPluginGates(fixture, "READY_FOR_SUBMISSION");
    const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
    const entry = evidence.entries.find(({ id }) => id === evidenceId);
    assert.ok(entry, `Missing evidence fixture ${evidenceId}`);
    entry.status = "reference_required";
    entry.candidateRevision = null;
    entry.externalEvidenceId = null;
    entry.sha256 = null;
    entry.approvedBy = null;
    entry.approvedAt = null;
    writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

    const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

    assert.match(
      result.errors.join("\n"),
      new RegExp(`Passed gate ${gateId} is not backed by approved current-candidate evidence`, "u"),
    );
  });
}

test("public-source and submitter-role gates require their dedicated evidence kinds", (t) => {
  const fixture = createFixture(t);
  const gates = readJson(fixture, `${releasePath}/release-gates.json`);
  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  const sourceGate = gates.gates.find(({ id }) => id === "public-github-source-sanitization");
  const sourceEvidence = evidence.entries.find(
    ({ id }) => id === "public-github-source-final-plugin-candidate",
  );
  assert.ok(sourceGate);
  assert.ok(sourceEvidence);
  sourceGate.evidence = ["anthropic-console-submitter-role-final-candidate"];
  sourceEvidence.kind = "approval-record";
  writeJson(fixture, `${releasePath}/release-gates.json`, gates);
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /public-github-source-sanitization must use its dedicated evidence record/u,
  );
  assert.match(
    result.errors.join("\n"),
    /must have kind public-source-security-review/u,
  );
});

test("SUBMITTED requires an approved plugin-console receipt for the frozen candidate", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "SUBMITTED");

  const withoutReceipt = verifyClaudePluginV1Release({ repositoryRoot: fixture });
  assert.match(withoutReceipt.errors.join("\n"), /SUBMITTED requires submissionEvidenceId/u);

  approveLifecycleEvidence(
    fixture,
    "submissionEvidenceId",
    "anthropic-plugin-submission-receipt",
  );
  const withReceipt = verifyClaudePluginV1Release({
    repositoryRoot: fixture,
    expectedState: "SUBMITTED",
  });
  assert.deepEqual(withReceipt.errors, []);

  const evidence = readJson(fixture, `${releasePath}/evidence-manifest.json`);
  const receipt = evidence.entries.find(
    ({ id }) => id === "anthropic-plugin-submission-receipt",
  );
  assert.ok(receipt);
  receipt.candidateRevision = "f".repeat(40);
  writeJson(fixture, `${releasePath}/evidence-manifest.json`, evidence);

  const wrongRevision = verifyClaudePluginV1Release({ repositoryRoot: fixture });
  assert.match(
    wrongRevision.errors.join("\n"),
    /submissionEvidenceId plugin evidence targets a different candidate revision/u,
  );
});

test("PUBLISHED requires approved submission and publication evidence for one frozen candidate", (t) => {
  const fixture = createFixture(t);
  promoteAllPluginGates(fixture, "PUBLISHED");
  approveLifecycleEvidence(
    fixture,
    "submissionEvidenceId",
    "anthropic-plugin-submission-receipt",
  );

  const withoutPublication = verifyClaudePluginV1Release({ repositoryRoot: fixture });
  assert.match(withoutPublication.errors.join("\n"), /PUBLISHED requires publicationEvidenceId/u);

  approveLifecycleEvidence(
    fixture,
    "publicationEvidenceId",
    "anthropic-plugin-publication-verification",
  );
  const published = verifyClaudePluginV1Release({
    repositoryRoot: fixture,
    expectedState: "PUBLISHED",
  });
  assert.deepEqual(published.errors, []);
});

test("publication package byte drift invalidates the plugin baseline", (t) => {
  const fixture = createFixture(t);
  const setupPath = resolve(fixture, pluginPath, "SETUP.md");
  writeFileSync(setupPath, `${readFileSync(setupPath, "utf8")}\n`, "utf8");

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /Checked-in Claude plugin baseline does not match the current publication package/u,
  );
});

test("Claude connector-v1 contract-baseline drift invalidates the plugin candidate", (t) => {
  const fixture = createFixture(t);
  const connectorBaseline = readJson(fixture, connectorBaselinePath);
  connectorBaseline.capturedAt = "2026-08-25";
  writeJson(fixture, connectorBaselinePath, connectorBaseline);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /Checked-in Claude plugin baseline does not match the current publication package/u,
  );
});

test("invalid Claude connector-v1 contract inventory fails closed", (t) => {
  const fixture = createFixture(t);
  const connectorBaseline = readJson(fixture, connectorBaselinePath);
  connectorBaseline.files[0].sha256 = "0".repeat(64);
  writeJson(fixture, connectorBaselinePath, connectorBaseline);

  const result = verifyClaudePluginV1Release({ repositoryRoot: fixture });

  assert.match(
    result.errors.join("\n"),
    /connector-v1 contract baseline candidateContractSha256 does not match its inventory/u,
  );
});

function createFixture(t) {
  const fixture = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-plugin-release-test-"));
  const destination = resolve(fixture, pluginPath);
  mkdirSync(dirname(destination), { recursive: true });
  cpSync(resolve(repositoryRoot, pluginPath), destination, { recursive: true });
  const connectorBaselineDestination = resolve(fixture, connectorBaselinePath);
  mkdirSync(dirname(connectorBaselineDestination), { recursive: true });
  cpSync(resolve(repositoryRoot, connectorBaselinePath), connectorBaselineDestination);
  t.after(() => rmSync(fixture, { recursive: true, force: true }));
  return fixture;
}

function promoteAllPluginGates(repository, lifecycleState) {
  const baseline = readJson(repository, `${releasePath}/contract-baseline.json`);
  const gates = readJson(repository, `${releasePath}/release-gates.json`);
  const lifecycle = readJson(repository, `${releasePath}/lifecycle.json`);
  const evidence = readJson(repository, `${releasePath}/evidence-manifest.json`);

  baseline.state = "FROZEN_FOR_SUBMISSION";
  gates.submissionReady = true;
  for (const gate of gates.gates) gate.status = "pass";

  lifecycle.state = lifecycleState;
  lifecycle.releaseLine.status = lifecycleState === "PUBLISHED"
    ? "published"
    : "frozen_for_submission";

  for (const entry of evidence.entries.filter(({ gateIds }) => gateIds.length > 0)) {
    approve(entry, baseline);
  }

  writeJson(repository, `${releasePath}/contract-baseline.json`, baseline);
  writeJson(repository, `${releasePath}/release-gates.json`, gates);
  writeJson(repository, `${releasePath}/lifecycle.json`, lifecycle);
  writeJson(repository, `${releasePath}/evidence-manifest.json`, evidence);
}

function approveLifecycleEvidence(repository, field, evidenceId) {
  const baseline = readJson(repository, `${releasePath}/contract-baseline.json`);
  const lifecycle = readJson(repository, `${releasePath}/lifecycle.json`);
  const evidence = readJson(repository, `${releasePath}/evidence-manifest.json`);
  const entry = evidence.entries.find(({ id }) => id === evidenceId);
  assert.ok(entry, `Missing lifecycle evidence fixture ${evidenceId}`);
  approve(entry, baseline);
  lifecycle.externalStateEvidence[field] = evidenceId;
  writeJson(repository, `${releasePath}/lifecycle.json`, lifecycle);
  writeJson(repository, `${releasePath}/evidence-manifest.json`, evidence);
}

function approve(entry, baseline) {
  entry.status = "approved";
  entry.candidateContractSha256 = baseline.candidateContractSha256;
  entry.candidateRevision = baseline.baseRevision;
  entry.externalEvidenceId = `test-evidence:${entry.id}`;
  entry.sha256 = createHash("sha256").update(entry.id).digest("hex");
  entry.approvedBy = "test-approver";
  entry.approvedAt = "2026-08-24";
}

function readJson(repository, relativePath) {
  return JSON.parse(readFileSync(resolve(repository, relativePath), "utf8"));
}

function writeJson(repository, relativePath, value) {
  writeFileSync(resolve(repository, relativePath), `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
