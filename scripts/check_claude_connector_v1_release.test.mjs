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
  validateClaudeWebStartImplementation,
  validateClaudeWebStartReviewEvidence,
  validateClaudeReleaseState,
  verifyClaudeConnectorV1Release,
} from "./check_claude_connector_v1_release.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

test("Claude v1 Web q launch and evidence contract reject weakened sources", () => {
  const adapter = readFileSync(
    resolve(repositoryRoot, "app/src/utils/claudeCoach.ts"),
    "utf8",
  );
  const uiTest = readFileSync(
    resolve(repositoryRoot, "app/scripts/testClaudeV1StartUi.tsx"),
    "utf8",
  );
  const sessionSetup = readFileSync(
    resolve(repositoryRoot, "app/src/components/SessionSetup.tsx"),
    "utf8",
  );
  const reviewerTestPlan = readFileSync(
    resolve(repositoryRoot, "ai/claude/connector-v1/reviewer-test-plan.md"),
    "utf8",
  );
  const reviewerAccess = readFileSync(
    resolve(repositoryRoot, "ai/claude/connector-v1/reviewer-access.template.md"),
    "utf8",
  );

  assert.deepEqual(
    validateClaudeWebStartImplementation(adapter, uiTest, sessionSetup),
    [],
  );
  assert.deepEqual(
    validateClaudeWebStartReviewEvidence(reviewerTestPlan, reviewerAccess),
    [],
  );

  const wrongRouteErrors = validateClaudeWebStartImplementation(
    adapter.replace(
      "const CLAUDE_V1_WEB_CHAT_URL = 'https://claude.ai/new'",
      "const CLAUDE_V1_WEB_CHAT_URL = 'https://claude.ai/chat'",
    ),
    uiTest,
    sessionSetup,
  );
  assert.ok(wrongRouteErrors.some((error) => error.includes("pin exactly")));

  const duplicateQueryErrors = validateClaudeWebStartImplementation(
    adapter.replace("return keys.length === 1", "return keys.length >= 1"),
    uiTest,
    sessionSetup,
  );
  assert.ok(
    duplicateQueryErrors.some((error) => error.includes("exactly one non-empty q")),
  );

  const desktopRouteErrors = validateClaudeWebStartImplementation(
    adapter.replace("desktopUrl: ''", "desktopUrl: 'claude://claude.ai/new'"),
    uiTest,
    sessionSetup,
  );
  assert.ok(desktopRouteErrors.some((error) => error.includes("Web-only")));

  const unvalidatedUiErrors = validateClaudeWebStartImplementation(
    adapter,
    uiTest,
    sessionSetup.replace(
      "const webUrl = getSafeClaudeWebUrl(result.webUrl)",
      "const webUrl = result.webUrl",
    ),
  );
  assert.ok(
    unvalidatedUiErrors.some((error) => error.includes("validated q-prefilled")),
  );

  const bareChatFallbackErrors = validateClaudeWebStartImplementation(
    adapter,
    uiTest,
    sessionSetup.replace(
      "const webUrl = getSafeClaudeWebUrl(result.webUrl)\n      if (!webUrl) throw new Error('Invalid Claude Web launch URL')",
      "const webUrl = getSafeClaudeWebUrl(result.webUrl) ?? 'https://claude.ai/new'",
    ),
  );
  assert.ok(
    bareChatFallbackErrors.some((error) => error.includes("bare Claude chat")),
  );

  const popupBypassErrors = validateClaudeWebStartImplementation(
    adapter,
    uiTest,
    sessionSetup.replace(
      "if (!claudeWindow) {\n      setClaudeActionState('failed')\n      return\n    }",
      "if (!claudeWindow) return",
    ),
  );
  assert.ok(
    popupBypassErrors.some((error) => error.includes("click-time popup")),
  );

  for (const [name, weakenedSource] of [
    [
      "clipboard copy",
      sessionSetup.replace(
        "const webUrl = getSafeClaudeWebUrl(result.webUrl)",
        "await navigator.clipboard.writeText(result.prompt)\n      const webUrl = getSafeClaudeWebUrl(result.webUrl)",
      ),
    ],
    [
      "textarea copy surface",
      sessionSetup.replace(
        "{claudeActionState === 'failed' && (",
        "<textarea readOnly value={result.prompt} />\n                            {claudeActionState === 'failed' && (",
      ),
    ],
    [
      "Desktop fallback",
      sessionSetup.replace(
        "const webUrl = getSafeClaudeWebUrl(result.webUrl)",
        "const desktopUrl = result.desktopUrl\n      const webUrl = getSafeClaudeWebUrl(result.webUrl)",
      ),
    ],
    [
      "manual second launch",
      sessionSetup.replace(
        "claudeWindow.location.href = webUrl",
        "window.open(webUrl, '_blank', 'noopener,noreferrer')",
      ),
    ],
    [
      "manual launch link",
      sessionSetup.replace(
        "{claudeActionState === 'failed' && (",
        "<a href={manualClaudeUrl}>Open Claude manually</a>\n                            {claudeActionState === 'failed' && (",
      ),
    ],
  ]) {
    const errors = validateClaudeWebStartImplementation(
      adapter,
      uiTest,
      weakenedSource,
    );
    assert.ok(
      errors.some((error) => error.includes("must not expose")),
      `${name} must be rejected`,
    );
  }

  const chatGptOnlyCopy = sessionSetup.replace(
    "const handleOpenChatGpt = async () => {",
    "const handleOpenChatGpt = async () => {\n    await navigator.clipboard.writeText('ChatGPT-only')",
  );
  assert.deepEqual(
    validateClaudeWebStartImplementation(adapter, uiTest, chatGptOnlyCopy),
    [],
    "Claude guards must not constrain the separate ChatGPT/OpenAI launch handler",
  );

  const unredactedEvidenceErrors = validateClaudeWebStartReviewEvidence(
    reviewerTestPlan,
    reviewerAccess.replace(
      "redact the entire browser address bar",
      "retain the browser address bar",
    ),
  );
  assert.ok(
    unredactedEvidenceErrors.some((error) => error.includes("redacted secret")),
  );
});

test("retired Claude learner-binding and standalone-start surfaces stay absent", () => {
  for (const path of [
    "backend/src/main/resources/claude-connector-v1/connect.html",
    "backend/src/main/resources/claude-connector-v1/connect.js",
    "backend/src/main/resources/claude-connector-v1/id-decrypt.js",
  ]) {
    assert.equal(existsSync(resolve(repositoryRoot, path)), false, path);
  }
  assert.equal(
    existsSync(resolve(repositoryRoot, "app/src/views/ClaudeV1StartView.tsx")),
    false,
    "the standalone Claude start view must remain deleted",
  );

  const app = readFileSync(resolve(repositoryRoot, "app/src/App.tsx"), "utf8");
  assert.doesNotMatch(app, /\/lernen\/claude|ClaudeV1StartView/u);

  const listing = JSON.parse(readFileSync(
    resolve(repositoryRoot, "ai/claude/connector-v1/directory-listing.json"),
    "utf8",
  ));
  assert.equal(
    listing.learnerSession.startUrl,
    "https://skillpilot.com/?coach=claude",
  );

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
