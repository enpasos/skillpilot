import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import test from "node:test";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  calculateCandidateContractSha256,
  validateClaudeDistributionClaimSafety,
  validateMcpAppCarousel,
  validateClaudeReleaseState,
  verifyClaudeConnectorV1Release,
} from "./check_claude_connector_v1_release.mjs";

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));

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

  const listing = JSON.parse(readFileSync(
    resolve(repositoryRoot, "ai/claude/connector-v1/directory-listing.json"),
    "utf8",
  ));
  assert.equal(
    listing.learnerSession.startUrl,
    "https://skillpilot.com/",
  );

  const vhost = readFileSync(
    resolve(repositoryRoot, "deploy/nginx/skillpilot-claude-connector-v1.conf"),
    "utf8",
  );
  assert.doesNotMatch(vhost, /location\s+(?:=|\^~)\s+\/connect\/?\s*\{/u);
  assert.doesNotMatch(vhost, /\/internal\/connectors\/claude\/v1\/connect/u);
});

test("Claude distribution validators reject append-only contradictory claims", () => {
  const concept = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-concept.md"),
    "utf8",
  );
  const implementationPlan = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-implementation-plan.md"),
    "utf8",
  );
  const guide = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.md"),
    "utf8",
  );
  const guideDe = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.de.md"),
    "utf8",
  );
  const runbook = readFileSync(
    resolve(repositoryRoot, "docs/deploy/claude-connector-v1-release.md"),
    "utf8",
  );

  assert.deepEqual(
    validateClaudeDistributionClaimSafety(
      concept,
      implementationPlan,
      guide,
      guideDe,
      runbook,
    ),
    [],
  );

  for (const [name, appendedClaim] of [
    ["Claude Free EN", "The SkillPilot plugin is available on Claude Free."],
    ["Claude Free DE", "Das SkillPilot-Plugin ist in Claude Free verfügbar."],
    ["native mobile EN", "The SkillPilot plugin supports native-mobile plugin support."],
    ["native mobile DE", "Das SkillPilot-Plugin bietet native Plugin-Unterstützung auf Mobilgeräten."],
    ["Desktop EN", "The SkillPilot plugin supports Claude Desktop Chat."],
    ["Desktop DE", "Das SkillPilot-Plugin unterstützt Claude Desktop Chat."],
    ["hyphenated Desktop DE", "Das SkillPilot-Plugin unterstützt Claude Desktop-Chat."],
    ["expanding Desktop EN", "The SkillPilot plugin supports not only Claude Desktop Chat."],
    ["expanding Desktop DE", "Das SkillPilot-Plugin unterstützt nicht nur Claude Desktop Chat."],
    ["Cowork EN", "The SkillPilot plugin supports Claude Cowork."],
    ["Cowork DE", "Das SkillPilot-Plugin unterstützt Claude Cowork."],
    ["historical surfaces EN", "The public SkillPilot plugin is the preferred complete installation for eligible paid Claude Web chat, Desktop Chat and Cowork users."],
    ["historical surfaces DE", "Das öffentliche SkillPilot-Plugin ist die bevorzugte vollständige Installation für berechtigte bezahlte Nutzer von Claude Web Chat, Desktop Chat und Cowork."],
    ["Skill subject EN", "The SkillPilot coaching Skill works in paid Claude Web chat, Desktop Chat and Cowork."],
    ["Skill subject DE", "Der SkillPilot-Coaching-Skill funktioniert in Claude Desktop Chat und Cowork."],
    ["Markdown line wrap", "The SkillPilot plugin supports\nClaude Desktop Chat."],
    ["passive modal DE", "Das SkillPilot-Plugin kann in Claude Cowork verwendet werden."],
    ["public Claude Code EN", "The SkillPilot plugin supports public Claude Code."],
    ["public Claude Code DE", "Das SkillPilot-Plugin unterstützt öffentliches Claude Code."],
    ["coexistence EN", "Plugin and Directory installations must never coexist."],
    ["coexistence DE", "Plugin und Directory-Installationen dürfen niemals koexistieren."],
    ["plugin ownership EN", "The plugin shell owns all fourteen tools and both MCP Apps UIs."],
    ["plugin ownership DE", "Die Plugin-Shell besitzt alle vierzehn Tools und beide MCP Apps UI-Ressourcen."],
  ]) {
    const errors = validateClaudeDistributionClaimSafety(
      concept,
      implementationPlan,
      guide,
      guideDe,
      `${runbook}\n${appendedClaim}\n`,
    );
    assert.ok(
      errors.some((error) => error.includes("forbidden contradictory claim")),
      `${name} append-only contradiction must be rejected`,
    );
  }

  for (const claim of [
    "The SkillPilot plugin provides no support for Claude Desktop Chat.",
    "The SkillPilot plugin includes no Claude Cowork support.",
    "The SkillPilot plugin supports neither Claude Desktop Chat nor Cowork.",
    "The SkillPilot plugin supports paid Web chat only, not Claude Desktop Chat.",
    "Das SkillPilot-Plugin bietet keine Unterstützung für Claude Desktop Chat.",
    "Das SkillPilot-Plugin enthält keine Unterstützung für Claude Cowork.",
    "Das SkillPilot-Plugin unterstützt weder Claude Desktop Chat noch Cowork.",
    "Das SkillPilot-Plugin unterstützt nur Claude Web Chat, nicht Claude Desktop Chat.",
  ]) {
    assert.deepEqual(
      validateClaudeDistributionClaimSafety(claim),
      [],
      `explicit negative boundary must be allowed: ${claim}`,
    );
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
  assert.equal(result.toolCount, 14);
  assert.equal(result.requiredGateCount, 17);
  assert.equal(result.blockers.length, result.requiredPendingCount);

  const gates = readJson("ai/claude/connector-v1/release-gates.json");
  for (const retired of [
    "openai-review-freeze",
    "openai-production-differential",
    "mcp-inspector-all-fourteen-tools-two-resources",
    "claude-contract-tests",
    "full-backend-suite",
    "release-package-validation",
    "load-latency-and-log-redaction",
  ]) {
    assert.equal(gates.gates.some(({ id }) => id === retired), false, retired);
  }
  assert.ok(gates.gates.some(
    ({ id }) => id === "hosted-claude-all-fourteen-tools-two-apps",
  ));
  const web = gates.gates.find(({ id }) => id === "automated-coach-web-ui-e2e");
  assert.equal(web.status, "pass");
  assert.deepEqual(web.evidence, ["plugin:automated-coach-web-ui-e2e-final-candidate"]);
  assert.equal(
    gates.gates.some(({ id }) => (
      id.includes("all-thirteen-tools") || id.includes("all-twelve-tools")
    )),
    false,
  );
});

test("Claude MCP App carousel is reproducible, private and approval-gated", () => {
  const manifest = readJson(
    "ai/claude/connector-v1/assets/carousel/manifest.json",
  );
  const appManifest = readJson(manifest.sourceAppManifest);

  assert.deepEqual(validateMcpAppCarousel({
    repositoryRoot,
    manifest,
    appManifest,
  }), []);
  assert.ok(validateMcpAppCarousel({
    repositoryRoot,
    manifest,
    appManifest,
    submissionReady: true,
  }).some((error) => error.includes("Product, QA and Legal approval")));

  const approved = structuredClone(manifest);
  for (const asset of approved.assets) {
    asset.approvals = { product: "approved", qa: "approved", legal: "approved" };
  }
  assert.deepEqual(validateMcpAppCarousel({
    repositoryRoot,
    manifest: approved,
    appManifest,
    submissionReady: true,
  }), []);

  for (const [name, mutate, expected] of [
    [
      "too few assets",
      (fixture) => fixture.assets.splice(2),
      "between 3 and 5",
    ],
    [
      "path traversal",
      (fixture) => { fixture.assets[0].path = "ai/claude/connector-v1/assets/carousel/../icon-512.png"; },
      "direct PNG child",
    ],
    [
      "digest mismatch",
      (fixture) => { fixture.assets[0].sha256 = "0".repeat(64); },
      "hash differs",
    ],
    [
      "dimension mismatch",
      (fixture) => { fixture.assets[0].width += 1; },
      "dimensions differ",
    ],
    [
      "blank prompt",
      (fixture) => { fixture.assets[0].pairedPrompt = " "; },
      "paired prompt",
    ],
    [
      "private session marker",
      (fixture) => { fixture.assets[0].pairedPrompt += " spc_secret"; },
      "forbidden private value",
    ],
    [
      "false attestation",
      (fixture) => { fixture.assets[0].attestations.learnerDataExcluded = false; },
      "privacy attestation",
    ],
    [
      "only one MCP App",
      (fixture) => {
        for (const asset of fixture.assets) {
          asset.toolName = "start_skillpilot_memory_practice";
          asset.resourceName = fixture.assets[1].resourceName;
          asset.resourceUri = fixture.assets[1].resourceUri;
          asset.sourceResourceSha256 = fixture.assets[1].sourceResourceSha256;
        }
      },
      "both active SkillPilot MCP Apps",
    ],
  ]) {
    const fixture = structuredClone(manifest);
    mutate(fixture);
    const errors = validateMcpAppCarousel({
      repositoryRoot,
      manifest: fixture,
      appManifest,
    });
    assert.ok(
      errors.some((error) => error.includes(expected)),
      `${name} must be rejected: ${errors.join(" | ")}`,
    );
  }

  const fixtureRoot = createCarouselFixture(manifest, appManifest);
  try {
    assert.equal(
      existsSync(resolve(fixtureRoot, "ai/claude/app/dist/manifest.json")),
      false,
      "clean-checkout carousel validation must not depend on ignored dist files",
    );
    assert.deepEqual(validateMcpAppCarousel({
      repositoryRoot: fixtureRoot,
      manifest,
      appManifest,
    }), []);

    const drifted = resolve(fixtureRoot, appManifest.resources[0].classpathPath);
    writeFileSync(drifted, `${readFileSync(drifted, "utf8")}\n<!-- later build -->\n`);
    const notes = [];
    assert.deepEqual(validateMcpAppCarousel({
      repositoryRoot: fixtureRoot,
      manifest,
      appManifest,
      notes,
    }), [], "a later build of the app does not invalidate its screenshots");
    assert.ok(notes.some((note) => note.includes("earlier build of its MCP App")));

    const wrongClasspathManifest = structuredClone(appManifest);
    wrongClasspathManifest.resources[0].classpathPath =
      "backend/src/main/resources/claude-connector-v1/mcp-apps/wrong.html";
    assert.ok(validateMcpAppCarousel({
      repositoryRoot: fixtureRoot,
      manifest,
      appManifest: wrongClasspathManifest,
    }).some((error) => error.includes("wrong deployed MCP App resource")));

    const narrow = structuredClone(manifest);
    const narrowPath = resolve(fixtureRoot, narrow.assets[0].path);
    const narrowBytes = readFileSync(narrowPath);
    narrowBytes.writeUInt32BE(999, 16);
    writeFileSync(narrowPath, narrowBytes);
    narrow.assets[0].width = 999;
    narrow.assets[0].sha256 = sha256(narrowBytes);
    assert.ok(validateMcpAppCarousel({
      repositoryRoot: fixtureRoot,
      manifest: narrow,
      appManifest,
    }).some((error) => error.includes("at least 1000 pixels wide")));

    copyFileSync(
      resolve(repositoryRoot, manifest.assets[0].path),
      narrowPath,
    );
    rmSync(narrowPath);
    symlinkSync(resolve(repositoryRoot, manifest.assets[0].path), narrowPath);
    assert.ok(validateMcpAppCarousel({
      repositoryRoot: fixtureRoot,
      manifest,
      appManifest,
    }).some((error) => error.includes("non-symlink")));
  } finally {
    rmSync(fixtureRoot, { recursive: true, force: true });
  }
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
  submitted.lifecycle.majorLines[0].status = "submitted";
  let result = validateClaudeReleaseState(submitted);
  assert.ok(result.errors.some((message) => message.includes("submissionEvidenceId")));

  addLifecycleEvidence(submitted, "submission-receipt", "SUBMITTED");
  submitted.lifecycle.externalStateEvidence.submissionEvidenceId = "submission-receipt";
  result = validateClaudeReleaseState(submitted);
  assert.deepEqual(result.errors, []);

  submitted.lifecycle.majorLines[0].status = "pre_submission_candidate_rebuild";
  result = validateClaudeReleaseState(submitted);
  assert.ok(result.errors.some((message) => message.includes("SUBMITTED requires major-v1 status submitted")));
  submitted.lifecycle.majorLines[0].status = "submitted";

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

test("passing gates reject missing, unapproved and unnamed-commit evidence", () => {
  const missing = readyFixture();
  missing.gates.gates[0].evidence = ["unknown-evidence"];
  let result = validateClaudeReleaseState({ ...missing, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("unknown evidence")));

  const unapproved = readyFixture();
  unapproved.evidence.entries[0].status = "recorded";
  result = validateClaudeReleaseState({ ...unapproved, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("unapproved evidence")));

  const unnamedCommit = readyFixture();
  unnamedCommit.evidence.entries[0].candidateRevision = null;
  result = validateClaudeReleaseState({ ...unnamedCommit, submissionReady: true });
  assert.ok(result.errors.some((message) => message.includes("needs the commit it was made with")));
  assert.ok(result.errors.some((message) => message.includes("must name the commit it was made with")));

  const earlierCommit = readyFixture();
  earlierCommit.evidence.entries[0].candidateRevision = "f".repeat(40);
  result = validateClaudeReleaseState({ ...earlierCommit, submissionReady: true });
  assert.deepEqual(result.errors, [], "a record made on an earlier commit keeps its gate passing");
});

test("shared server checks use the one plugin record", () => {
  const unapprovedShared = readyFixture();
  unapprovedShared.pluginEvidence.entries.find(
    ({ id }) => id === "automated-coach-web-ui-e2e-final-candidate",
  ).status = "reference_required";
  let result = validateClaudeReleaseState({ ...unapprovedShared, submissionReady: true });
  assert.ok(result.errors.some((message) => (
    message.includes("automated-coach-web-ui-e2e has unapproved evidence plugin:")
  )));

  const localCopy = readyFixture();
  localCopy.gates.gates.find(({ id }) => id === "oauth-session-separation").evidence = [
    "approved-ci-green-for-submitted-commit",
  ];
  result = validateClaudeReleaseState(localCopy);
  assert.ok(result.errors.some((message) => (
    message.includes("must use the shared plugin record oauth-session-separation-final-plugin-candidate")
  )));

  const foreignShared = readyFixture();
  foreignShared.gates.gates.find(({ id }) => id === "reviewer-account-and-reset").evidence = [
    "plugin:automated-coach-web-ui-e2e-final-candidate",
  ];
  result = validateClaudeReleaseState(foreignShared);
  assert.ok(result.errors.some((message) => message.includes("has no shared plugin record")));

  const unknownShared = readyFixture();
  unknownShared.pluginEvidence.entries = unknownShared.pluginEvidence.entries.filter(
    ({ id }) => id !== "first-party-session-final-plugin-candidate",
  );
  result = validateClaudeReleaseState(unknownShared);
  assert.ok(result.errors.some((message) => message.includes("unknown plugin evidence")));
});

test("operations practice is recommended and blocks no submission", () => {
  const fixture = readyFixture();
  const rollback = fixture.gates.gates.find(({ id }) => id === "rollback-drill");
  assert.equal(rollback.required, false);
  assert.equal(rollback.status, "recommended");
  assert.deepEqual(validateClaudeReleaseState({ ...fixture, submissionReady: true }).errors, []);

  rollback.status = "pending";
  let result = validateClaudeReleaseState(fixture);
  assert.ok(result.errors.some((message) => message.includes("Optional gate rollback-drill must be recommended")));

  rollback.required = true;
  result = validateClaudeReleaseState(fixture);
  assert.ok(result.errors.some((message) => message.includes("Required release gate inventory changed")));
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

test("lifecycle defines the candidate as the running commit without a submission freeze", () => {
  const frozen = readyFixture();
  frozen.lifecycle.breakingChangeProcessAppliesAfter = "final_submission_freeze_or_publication";
  let result = validateClaudeReleaseState(frozen);
  assert.ok(result.errors.some((message) => message.includes("begin with the submission")));

  const undefinedCandidate = readyFixture();
  delete undefinedCandidate.lifecycle.candidate;
  result = validateClaudeReleaseState(undefinedCandidate);
  assert.ok(result.errors.some((message) => message.includes("commit production runs at submission")));

  const withoutDecision = readyFixture();
  delete withoutDecision.lifecycle.productOwnerReleaseDecisions;
  result = validateClaudeReleaseState(withoutDecision);
  assert.ok(result.errors.some((message) => message.includes("2026-11-28 Product Owner release decision")));
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

test("candidate contract digest uses deterministic code-unit ordering", () => {
  const baseRevision = "1".repeat(40);
  const files = [
    { path: "ai/claude/app/a.md", sha256: "a".repeat(64) },
    { path: "ai/claude/app/README.md", sha256: "b".repeat(64) },
  ];
  const trees = [
    { path: "ai/claude/app/z", sha256: "c".repeat(64) },
    { path: "ai/claude/app/Assets", sha256: "d".repeat(64) },
  ];
  const expectedRecords = [
    `base:${baseRevision}\n`,
    `file:ai/claude/app/README.md\0${"b".repeat(64)}\n`,
    `file:ai/claude/app/a.md\0${"a".repeat(64)}\n`,
    `tree:ai/claude/app/Assets\0${"d".repeat(64)}\n`,
    `tree:ai/claude/app/z\0${"c".repeat(64)}\n`,
  ].join("");

  assert.equal(
    calculateCandidateContractSha256(files, trees, baseRevision),
    sha256(expectedRecords),
  );
});

function readyFixture() {
  const listing = readJson("ai/claude/connector-v1/directory-listing.json");
  const gates = readJson("ai/claude/connector-v1/release-gates.json");
  const lifecycle = readJson("ai/claude/connector-v1/release/lifecycle.json");

  lifecycle.state = "READY_FOR_SUBMISSION";
  lifecycle.majorLines[0].status = "pre_submission_candidate_rebuild";
  lifecycle.directoryIdentity.slugApproved = true;
  gates.submissionReady = true;

  const approvedRecord = (id, gateId) => ({
    id,
    status: "approved",
    observedAt: "2026-08-23",
    scope: `Synthetic unit-test evidence for ${gateId}`,
    gateIds: [gateId],
    candidateContractSha256: null,
    candidateRevision: "b".repeat(40),
    externalEvidenceId: `test-fixture:${gateId}`,
    sha256: "a".repeat(64),
    approvedBy: "unit-test",
    approvedAt: "2026-08-23T12:00:00Z",
  });
  const evidenceEntries = [];
  const pluginEntries = [];
  for (const gate of gates.gates) {
    if (!gate.required) {
      gate.evidence = [];
      continue;
    }
    gate.status = "pass";
    const shared = gate.evidence.find((reference) => reference.startsWith("plugin:"));
    if (shared) {
      pluginEntries.push(approvedRecord(shared.slice("plugin:".length), gate.id));
      continue;
    }
    const evidenceId = `approved-${gate.id}`;
    gate.evidence = [evidenceId];
    evidenceEntries.push(approvedRecord(evidenceId, gate.id));
  }
  const evidence = {
    schemaVersion: 1,
    policy: "Synthetic unit-test fixture only.",
    entries: evidenceEntries,
  };
  const pluginEvidence = { schemaVersion: 1, entries: pluginEntries };

  return { listing, gates, lifecycle, evidence, pluginEvidence };
}

function addLifecycleEvidence(fixture, id, lifecycleState) {
  fixture.evidence.entries.push({
    id,
    status: "approved",
    observedAt: "2026-08-23",
    scope: `Synthetic ${lifecycleState} evidence`,
    gateIds: [],
    lifecycleStates: [lifecycleState],
    candidateContractSha256: null,
    candidateRevision: "b".repeat(40),
    externalEvidenceId: `test-fixture:${id}`,
    sha256: "c".repeat(64),
    approvedBy: "unit-test",
    approvedAt: "2026-08-23T12:00:00Z",
  });
}

function createCarouselFixture(manifest, appManifest) {
  const fixtureRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-carousel-"),
  );
  const paths = [
    manifest.sourceAppManifest,
    ...manifest.assets.map((asset) => asset.path),
    ...appManifest.resources.map((resource) => resource.classpathPath),
  ];
  for (const path of new Set(paths)) {
    const destination = resolve(fixtureRoot, path);
    mkdirSync(dirname(destination), { recursive: true });
    copyFileSync(resolve(repositoryRoot, path), destination);
  }
  return fixtureRoot;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(repositoryRoot, path), "utf8"));
}
