import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  publicationFiles,
  validateClaudePluginPackage,
} from "../ai/claude/plugin/skillpilot-coach-v1/check-package.mjs";
import {
  buildClaudePluginPackage,
} from "../ai/claude/plugin/skillpilot-coach-v1/build-package.mjs";

const defaultRepositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = "ai/claude/plugin/skillpilot-coach-v1";
const releaseRoot = `${pluginRoot}/release`;
const historicalReleaseRoot = `${releaseRoot}/history`;
const connectorContractBaselinePath =
  "ai/claude/connector-v1/release/contract-baseline.json";
const expectedPluginIdentity = "skillpilot-coach-v1";
const expectedPluginVersion = "1.1.0";
const expectedHistoricalReleaseFiles = new Map([
  [
    "1.0.0/contract-baseline.json",
    "2b3f1bc1fdc60c72c5168590b1899fb0360500da5be208a578eaa3d82ca65058",
  ],
  [
    "1.0.0/evidence-manifest.json",
    "e50c542b86765dc60107930a6fcf267db820aa4096c9c33fe467792f79aa9557",
  ],
  [
    "1.0.0/lifecycle.json",
    "400e350edc1192b54cadc57daeb832b61dfe760ed5b0329b8d7e1f581720d311",
  ],
  [
    "1.0.0/release-gates.json",
    "6fa535653113636334bb1ea5d76d003c36afc572d1cb68db961d5cbbb6c1237e",
  ],
  [
    "1.0.4/direct-install-beta.json",
    "992857d4fd32aab856d61a584ff96d5276c47df8bf446587fbab6ad757c26c03",
  ],
  [
    "1.0.4/marketplace-publication.json",
    "6db56658c333bcf5fc688bcdb274dd74a7d3df957f97e28793672a091da7e965",
  ],
  [
    "1.0.4/support-readiness-drill.template.md",
    "bd95af3fca52496d32c98183b2454b874645ac1f4ccf68da806f67c626764cb8",
  ],
]);
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedTools = [
  "get_skillpilot_coach_context",
  "resume_skillpilot_learning_plan",
  "switch_skillpilot_learning_plan_subject",
  "render_skillpilot_goal_visualization",
  "start_skillpilot_memory_practice",
  "review_skillpilot_memory_practice_card",
  "get_skillpilot_navigation_options",
  "set_skillpilot_focus",
  "set_skillpilot_active_goal",
  "set_skillpilot_mastery",
  "start_skillpilot_verified_recall",
  "get_skillpilot_verified_recall_answers",
  "record_skillpilot_verified_recall_results",
  "get_skillpilot_exam_evaluation",
];
const expectedMcpApps = [
  "render_skillpilot_goal_visualization",
  "start_skillpilot_memory_practice",
];
const expectedRequiredGates = [
  "openai-review-freeze",
  "plugin-package-structural-check",
  "anthropic-plugin-cli-validation",
  "reproducible-plugin-archive",
  "remote-mcp-contract-fourteen-tools-two-apps",
  "paid-web-chat-real-client",
  "android-direct-install-real-client",
  "first-party-24h-learning-session",
  "oauth-learner-session-separation",
  "permanent-id-nondisclosure",
  "negative-replay-origin-redaction",
  "privacy-legal-support-approval",
  "anthropic-plugin-submission-metadata",
  "public-github-source-sanitization",
  "anthropic-console-submitter-role",
];
const expectedSubmissionPrerequisiteEvidence = [
  {
    gateId: "android-direct-install-real-client",
    evidenceId: "android-direct-install-real-client-final-candidate",
    kind: "android-real-client-acceptance-record",
  },
  {
    gateId: "public-github-source-sanitization",
    evidenceId: "public-github-source-final-plugin-candidate",
    kind: "public-source-security-review",
  },
  {
    gateId: "anthropic-console-submitter-role",
    evidenceId: "anthropic-console-submitter-role-final-candidate",
    kind: "submitter-authorization-record",
  },
];
const lifecycleStates = [
  "PRE_SUBMISSION",
  "READY_FOR_SUBMISSION",
  "SUBMITTED",
  "PUBLISHED",
];

export function verifyClaudePluginV1Release({
  repositoryRoot = defaultRepositoryRoot,
  expectedState = null,
} = {}) {
  const errors = [];
  const blockers = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  let gates;
  let lifecycle;
  let evidence;
  let baseline;
  try {
    gates = readJson(repositoryRoot, `${releaseRoot}/release-gates.json`);
    lifecycle = readJson(repositoryRoot, `${releaseRoot}/lifecycle.json`);
    evidence = readJson(repositoryRoot, `${releaseRoot}/evidence-manifest.json`);
    baseline = readJson(repositoryRoot, `${releaseRoot}/contract-baseline.json`);
  } catch (error) {
    return unknownResult(error, blockers);
  }

  const packageValidation = validateClaudePluginPackage(
    safeRepositoryPath(repositoryRoot, pluginRoot),
  );
  errors.push(...packageValidation.errors.map((error) => `Plugin package: ${error}`));
  verifyHistoricalReleaseHistory(repositoryRoot, check);

  check(gates.schemaVersion === 1, "Unsupported plugin release-gates schemaVersion.");
  check(lifecycle.schemaVersion === 1, "Unsupported plugin lifecycle schemaVersion.");
  check(evidence.schemaVersion === 1, "Unsupported plugin evidence schemaVersion.");
  check(baseline.schemaVersion === 1, "Unsupported plugin contract-baseline schemaVersion.");

  for (const document of [gates, lifecycle, evidence, baseline]) {
    check(
      document?.lane === "CLAUDE_PUBLIC_PLUGIN_V1",
      "Every plugin release document must use lane CLAUDE_PUBLIC_PLUGIN_V1.",
    );
    check(
      document?.pluginIdentity === expectedPluginIdentity,
      "Every plugin release document must use the SkillPilot Claude plugin identity.",
    );
    check(
      document?.pluginVersion === expectedPluginVersion,
      "Every plugin release document must use Claude plugin version 1.1.0.",
    );
  }

  check(
    lifecycleStates.includes(lifecycle?.state),
    `Plugin lifecycle state must be one of ${lifecycleStates.join(", ")}.`,
  );
  if (expectedState !== null) {
    check(
      lifecycle?.state === expectedState,
      `Expected plugin lifecycle ${expectedState}, found ${String(lifecycle?.state)}.`,
    );
  }
  check(
    lifecycle?.submissionTarget === "ANTHROPIC_PLUGIN_CONSOLE",
    "Plugin lifecycle must target the independent Anthropic plugin submission console.",
  );
  check(
    lifecycle?.connectorDirectoryDependency === "none",
    "Plugin lifecycle must not depend on Connector Directory publication.",
  );
  check(
    sameSet(lifecycle?.supportedSurfaces, [
      "paid_claude_web_chat",
      "claude_pro_android_chat",
    ]),
    "Plugin lifecycle must scope the 1.1 candidate to eligible paid Claude Web chat and intended Claude Pro Android use pending exact-candidate acceptance.",
  );
  check(
    lifecycle?.distributionQualification?.directInstallPilot
        === "historical_pre_1_1_paid_web_and_claude_pro_account_direct_install_then_native_android_chat"
      && ["pending", "approved"].includes(
        lifecycle?.distributionQualification?.androidDirectInstallAcceptance,
      )
      && [null, "android-direct-install-real-client-final-candidate"].includes(
        lifecycle?.distributionQualification?.androidDirectInstallEvidenceId,
      )
      && ["not_verified", "verified"].includes(
        lifecycle?.distributionQualification?.androidPublicListingVerification,
      )
      && [null, "anthropic-plugin-android-public-listing-verification"].includes(
        lifecycle?.distributionQualification?.androidPublicListingEvidenceId,
      ),
    "Plugin lifecycle must distinguish historical pre-1.1 paid Web and Claude Pro Android observations from exact 1.1 acceptance and post-publication Android listing verification.",
  );
  check(
    sameSet(lifecycle?.excludedClaims, [
      "claude_free",
      "claude_ios_chat",
      "android_in_app_plugin_installation",
      "claude_desktop_chat",
      "claude_cowork",
      "public_claude_code",
      "hooks",
      "subagents",
    ]),
    "Plugin lifecycle must exclude Claude Free, iOS, Android in-app installation, Desktop Chat, Cowork, public Claude Code, hooks and subagent claims.",
  );
  check(
    lifecycle?.productOwnerAuthorization?.approvedAt === "2026-09-04"
      && lifecycle?.productOwnerAuthorization?.approvedBy === "product-owner"
      && /Claude public plugin v1/u.test(lifecycle?.productOwnerAuthorization?.scope ?? "")
      && Array.isArray(lifecycle?.productOwnerAuthorization?.excludes)
      && lifecycle.productOwnerAuthorization.excludes.some((entry) => /OpenAI/u.test(entry))
      && lifecycle.productOwnerAuthorization.excludes.some((entry) => /Connector Directory/u.test(entry)),
    "Plugin lifecycle must record the Claude-plugin-only Product Owner authorization and its exclusions.",
  );
  check(
    lifecycle?.releaseLine?.major === 1
      && lifecycle?.releaseLine?.version === expectedPluginVersion,
    "Plugin lifecycle must identify the Claude plugin v1 release line.",
  );
  check(
    ["pre_submission_candidate", "frozen_for_submission", "published"].includes(
      lifecycle?.releaseLine?.status,
    ),
    "Plugin release-line status is invalid.",
  );
  check(
    lifecycle?.externalStateEvidence
      && ["submissionEvidenceId", "publicationEvidenceId"].every(
        (field) => lifecycle.externalStateEvidence[field] === null
          || nonBlankWithin(lifecycle.externalStateEvidence[field], 200),
      ),
    "Plugin external-state evidence fields must be null or evidence IDs.",
  );

  check(
    gates?.submissionChannel === "ANTHROPIC_PLUGIN_CONSOLE",
    "Plugin gates must target the Anthropic plugin console.",
  );
  check(
    gates?.connectorDirectoryDependency === "none",
    "Plugin gates must be independent of the Connector Directory lane.",
  );
  const gateList = Array.isArray(gates?.gates) ? gates.gates : [];
  const gateIds = gateList.map((gate) => gate?.id);
  check(
    sameSet(gateIds, expectedRequiredGates),
    "Plugin release gates must match the independent public-plugin gate set exactly.",
  );
  check(
    gateList.every((gate) => gate?.required === true),
    "Every declared Claude plugin v1 gate must be required.",
  );
  check(
    gateList.every((gate) => ["pass", "pending", "blocked"].includes(gate?.status)),
    "Plugin gates must use pass, pending or blocked status.",
  );
  check(
    new Set(gateIds).size === gateIds.length,
    "Plugin gate IDs must be unique.",
  );
  check(
    gateIds.every((gateId) => !/(?:team|enterprise|directory|permanent-slug)/iu.test(gateId ?? "")),
    "Plugin readiness must not include Team, Enterprise, Directory or permanent-slug gates.",
  );

  const evidenceEntries = Array.isArray(evidence?.entries) ? evidence.entries : [];
  const evidenceById = new Map(evidenceEntries.map((entry) => [entry?.id, entry]));
  check(
    evidence?.candidateContractSha256 === baseline?.candidateContractSha256,
    "Plugin evidence manifest must bind to the checked-in plugin candidate digest.",
  );
  check(
    evidence?.candidateRevision === baseline?.baseRevision,
    "Plugin evidence manifest must bind to the checked-in plugin candidate revision.",
  );
  check(
    evidenceById.size === evidenceEntries.length,
    "Plugin evidence IDs must be unique.",
  );
  validateEvidence({
    entries: evidenceEntries,
    gateIds: new Set(gateIds),
    baseline,
    check,
  });

  for (const prerequisite of expectedSubmissionPrerequisiteEvidence) {
    const gate = gateList.find(({ id }) => id === prerequisite.gateId);
    const entry = evidenceById.get(prerequisite.evidenceId);
    check(
      sameSet(gate?.evidence, [prerequisite.evidenceId]),
      `Gate ${prerequisite.gateId} must use its dedicated evidence record.`,
    );
    check(
      entry?.kind === prerequisite.kind
        && sameSet(entry?.gateIds, [prerequisite.gateId]),
      `Evidence ${prerequisite.evidenceId} must have kind ${prerequisite.kind} and bind only to gate ${prerequisite.gateId}.`,
    );
  }

  for (const gate of gateList) {
    const gateEvidenceIds = Array.isArray(gate?.evidence) ? gate.evidence : [];
    check(
      new Set(gateEvidenceIds).size === gateEvidenceIds.length,
      `Gate ${String(gate?.id)} has duplicate evidence IDs.`,
    );
    check(
      gateEvidenceIds.every((evidenceId) => evidenceById.has(evidenceId)),
      `Gate ${String(gate?.id)} references unknown evidence.`,
    );
    if (gate?.status === "pass") {
      check(
        gateEvidenceIds.length > 0,
        `Passed gate ${String(gate?.id)} needs approved evidence.`,
      );
      for (const evidenceId of gateEvidenceIds) {
        const entry = evidenceById.get(evidenceId);
        check(
          entry?.status === "approved"
            && entry?.candidateContractSha256 === baseline?.candidateContractSha256
            && entry?.candidateRevision === baseline?.baseRevision
            && Array.isArray(entry?.gateIds)
            && entry.gateIds.includes(gate.id),
          `Passed gate ${String(gate?.id)} is not backed by approved current-candidate evidence.`,
        );
      }
    }
  }

  let currentBaseline;
  try {
    currentBaseline = buildCurrentPluginBaseline({
      repositoryRoot,
      baseRevision: baseline?.baseRevision,
      capturedAt: baseline?.capturedAt,
      state: baseline?.state,
    });
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
  }
  if (currentBaseline) {
    check(
      stableStringify(baseline) === stableStringify(currentBaseline),
      "Checked-in Claude plugin baseline does not match the current publication package.",
    );
  }

  const requiredPending = gateList.filter((gate) => gate?.status !== "pass");
  blockers.push(...requiredPending.map((gate) => `${gate.id}: ${gate.status}`));

  const state = lifecycle?.state;
  const submissionEvidenceId = lifecycle?.externalStateEvidence?.submissionEvidenceId;
  const publicationEvidenceId = lifecycle?.externalStateEvidence?.publicationEvidenceId;
  if (["PRE_SUBMISSION", "READY_FOR_SUBMISSION"].includes(state)) {
    check(
      submissionEvidenceId === null && publicationEvidenceId === null,
      `${state} must not record submission or publication evidence before those external states occur.`,
    );
  } else if (state === "SUBMITTED") {
    check(
      publicationEvidenceId === null,
      "SUBMITTED must not record publication evidence before publication occurs.",
    );
  }

  if (state === "PRE_SUBMISSION") {
    check(gates?.submissionReady === false, "PRE_SUBMISSION must keep submissionReady=false.");
    check(
      baseline?.state === "PRE_SUBMISSION_CANDIDATE",
      "PRE_SUBMISSION must use a PRE_SUBMISSION_CANDIDATE plugin baseline.",
    );
    check(
      lifecycle?.releaseLine?.status === "pre_submission_candidate",
      "PRE_SUBMISSION must keep the plugin release line pre_submission_candidate.",
    );
    check(
      lifecycle?.distributionQualification?.androidDirectInstallAcceptance === "pending"
        && lifecycle?.distributionQualification?.androidDirectInstallEvidenceId === null
        && lifecycle?.distributionQualification?.androidPublicListingVerification
          === "not_verified"
        && lifecycle?.distributionQualification?.androidPublicListingEvidenceId === null,
      "PRE_SUBMISSION must keep exact-candidate Android acceptance pending and public-listing Android reach unverified.",
    );
  } else if (["READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(state)) {
    check(gates?.submissionReady === true, `${state} requires submissionReady=true.`);
    check(requiredPending.length === 0, `${state} requires every plugin gate to pass.`);
    check(
      baseline?.state === "FROZEN_FOR_SUBMISSION",
      `${state} requires a FROZEN_FOR_SUBMISSION plugin baseline.`,
    );
    check(
      lifecycle?.releaseLine?.status
        === (state === "PUBLISHED" ? "published" : "frozen_for_submission"),
      `${state} requires the matching immutable plugin release-line status.`,
    );
    const androidEvidenceId = "android-direct-install-real-client-final-candidate";
    const androidEvidence = evidenceById.get(androidEvidenceId);
    check(
      lifecycle?.distributionQualification?.androidDirectInstallAcceptance === "approved"
        && lifecycle?.distributionQualification?.androidDirectInstallEvidenceId
          === androidEvidenceId,
      `${state} requires approved exact-candidate Claude Pro Android acceptance after account-level direct installation.`,
    );
    check(
      androidEvidence?.kind === "android-real-client-acceptance-record"
        && androidEvidence?.status === "approved"
        && androidEvidence?.candidateContractSha256
          === baseline?.candidateContractSha256
        && androidEvidence?.candidateRevision === baseline?.baseRevision,
      `${state} requires approved current-candidate Android real-client evidence.`,
    );
    if (["READY_FOR_SUBMISSION", "SUBMITTED"].includes(state)) {
      check(
        lifecycle?.distributionQualification?.androidPublicListingVerification
            === "not_verified"
          && lifecycle?.distributionQualification?.androidPublicListingEvidenceId === null,
        `${state} must defer Android public-listing verification until publication.`,
      );
    }
  }

  if (["SUBMITTED", "PUBLISHED"].includes(state)) {
    verifyLifecycleEvidence({
      field: "submissionEvidenceId",
      state: "SUBMITTED",
      expectedEvidenceId: "anthropic-plugin-submission-receipt",
      expectedKind: "external-lifecycle-record",
      lifecycle,
      evidenceById,
      baseline,
      check,
    });
  }
  if (state === "PUBLISHED") {
    verifyLifecycleEvidence({
      field: "publicationEvidenceId",
      state: "PUBLISHED",
      expectedEvidenceId: "anthropic-plugin-android-public-listing-verification",
      expectedKind: "android-public-listing-acceptance-record",
      lifecycle,
      evidenceById,
      baseline,
      check,
    });
    const publicationEvidenceId = "anthropic-plugin-android-public-listing-verification";
    const publicationEvidence = evidenceById.get(publicationEvidenceId);
    check(
      lifecycle?.externalStateEvidence?.publicationEvidenceId === publicationEvidenceId
        && lifecycle?.distributionQualification?.androidPublicListingVerification
          === "verified"
        && lifecycle?.distributionQualification?.androidPublicListingEvidenceId
          === publicationEvidenceId,
      "PUBLISHED requires the dedicated Android public-listing verification evidence ID.",
    );
    check(
      publicationEvidence?.kind === "android-public-listing-acceptance-record"
        && publicationEvidence?.status === "approved"
        && publicationEvidence?.candidateContractSha256
          === baseline?.candidateContractSha256
        && publicationEvidence?.candidateRevision === baseline?.baseRevision,
      "PUBLISHED requires approved exact-candidate Android public-listing acceptance evidence.",
    );
  }

  return {
    errors,
    blockers,
    lifecycleState: lifecycle?.state ?? "UNKNOWN",
    publicationStatus: lifecycle?.state ?? "UNKNOWN",
    pluginVersion: lifecycle?.pluginVersion ?? "UNKNOWN",
    requiredGateCount: gateList.length,
    requiredPendingCount: requiredPending.length,
    candidateContractSha256: baseline?.candidateContractSha256 ?? null,
  };
}

export function buildCurrentPluginBaseline({
  repositoryRoot = defaultRepositoryRoot,
  baseRevision = currentRevision(repositoryRoot),
  capturedAt = new Date().toISOString().slice(0, 10),
  state = "PRE_SUBMISSION_CANDIDATE",
} = {}) {
  if (!/^[0-9a-f]{40}$/u.test(baseRevision ?? "")) {
    throw new Error("Claude plugin baseline baseRevision must be a full Git SHA.");
  }
  const root = safeRepositoryPath(repositoryRoot, pluginRoot);
  const validation = validateClaudePluginPackage(root);
  if (validation.errors.length > 0) {
    throw new Error(`Cannot baseline invalid Claude plugin:\n- ${validation.errors.join("\n- ")}`);
  }

  const files = publicationFiles.map((relativePath) => {
    const repositoryPath = `${pluginRoot}/${relativePath}`;
    const absolute = safeRepositoryPath(repositoryRoot, repositoryPath);
    return {
      path: repositoryPath,
      sha256: sha256(readFileSync(absolute)),
    };
  });

  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-plugin-baseline-"));
  let archive;
  try {
    archive = buildClaudePluginPackage({
      root,
      outputPath: resolve(temporaryRoot, "skillpilot-coach-v1.plugin"),
    });
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }

  const connectorContractBaseline = loadConnectorContractBaselineBinding(repositoryRoot);
  const remoteContract = {
    endpoint: expectedEndpoint,
    ownership: "remote_connector",
    directoryPublicationRequired: false,
    connectorContractBaseline,
    tools: expectedTools,
    mcpApps: expectedMcpApps,
  };
  const candidateContractSha256 = calculatePluginCandidateContractSha256({
    baseRevision,
    files,
    archiveSha256: archive.sha256,
    remoteContract,
  });

  return {
    schemaVersion: 1,
    lane: "CLAUDE_PUBLIC_PLUGIN_V1",
    pluginIdentity: expectedPluginIdentity,
    pluginVersion: expectedPluginVersion,
    state,
    capturedAt,
    baseRevision,
    candidateContractSha256,
    digestAlgorithm: "SHA-256 over sorted UTF-8 records for base revision, publication-file digests, deterministic .plugin archive digest and canonical remote-contract JSON including the exact Claude connector-v1 contract-baseline digest",
    purpose: "Pins the public Claude plugin v1 submission package and the exact consumed Claude connector-v1 contract baseline independently from Connector Directory listing state and gates.",
    archive: {
      name: "skillpilot-coach-v1.plugin",
      format: "deterministic-stored-zip",
      bytes: archive.bytes,
      sha256: archive.sha256,
      entries: archive.entries,
    },
    remoteContract,
    files,
  };
}

export function calculatePluginCandidateContractSha256({
  baseRevision,
  files,
  archiveSha256,
  remoteContract,
}) {
  const records = [
    `base:${baseRevision}\n`,
    ...files.map((entry) => `file:${entry.path}\0${entry.sha256}\n`),
    `package:skillpilot-coach-v1.plugin\0${archiveSha256}\n`,
    `remote:${stableStringify(remoteContract)}\n`,
  ].sort((left, right) => compareCodeUnits(left, right));
  return sha256(Buffer.from(records.join(""), "utf8"));
}

function validateEvidence({ entries, gateIds, baseline, check }) {
  for (const entry of entries) {
    const entryGateIds = Array.isArray(entry?.gateIds) ? entry.gateIds : [];
    const entryLifecycleStates = Array.isArray(entry?.lifecycleStates)
      ? entry.lifecycleStates
      : [];
    check(nonBlankWithin(entry?.id, 200), "Every plugin evidence entry needs an ID.");
    check(
      ["reference_required", "recorded", "approved"].includes(entry?.status),
      `Plugin evidence ${entry?.id ?? "UNKNOWN"} has an invalid status.`,
    );
    check(
      new Set(entryGateIds).size === entryGateIds.length
        && entryGateIds.every((gateId) => gateIds.has(gateId)),
      `Plugin evidence ${entry?.id ?? "UNKNOWN"} must name valid unique gate IDs.`,
    );
    check(
      new Set(entryLifecycleStates).size === entryLifecycleStates.length
        && entryLifecycleStates.every((state) => ["SUBMITTED", "PUBLISHED"].includes(state)),
      `Plugin evidence ${entry?.id ?? "UNKNOWN"} has invalid lifecycle-state bindings.`,
    );
    check(
      entryGateIds.length > 0 || entryLifecycleStates.length > 0,
      `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs a gate or lifecycle-state binding.`,
    );
    check(
      entry?.candidateContractSha256 === baseline?.candidateContractSha256,
      `Plugin evidence ${entry?.id ?? "UNKNOWN"} must bind to the current plugin candidate digest.`,
    );
    if (["recorded", "approved"].includes(entry?.status)) {
      check(
        nonBlankWithin(entry?.externalEvidenceId, 500),
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs an external ID.`,
      );
      check(
        /^[0-9a-f]{64}$/u.test(entry?.sha256 ?? ""),
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs a SHA-256 digest.`,
      );
      check(
        entry?.candidateContractSha256 === baseline?.candidateContractSha256,
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} must bind to the current plugin candidate.`,
      );
      check(
        entry?.candidateRevision === baseline?.baseRevision,
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} must bind to the current plugin candidate revision.`,
      );
    }
    if (entry?.status === "approved") {
      check(
        nonBlankWithin(entry?.approvedBy, 200),
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs an approver.`,
      );
      check(
        /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?$/u.test(entry?.approvedAt ?? ""),
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs approvedAt.`,
      );
      check(
        entry?.candidateRevision === baseline?.baseRevision,
        `Plugin evidence ${entry?.id ?? "UNKNOWN"} needs the exact current candidateRevision.`,
      );
    }
  }
}

function verifyLifecycleEvidence({
  field,
  state,
  expectedEvidenceId,
  expectedKind,
  lifecycle,
  evidenceById,
  baseline,
  check,
}) {
  const evidenceId = lifecycle?.externalStateEvidence?.[field];
  check(nonBlankWithin(evidenceId, 200), `${state} requires ${field}.`);
  check(
    evidenceId === expectedEvidenceId,
    `${state} requires ${field} to use ${expectedEvidenceId}.`,
  );
  const entry = evidenceById.get(evidenceId);
  check(Boolean(entry), `${field} references unknown plugin evidence ${String(evidenceId)}.`);
  if (!entry) return;
  check(entry.kind === expectedKind, `${field} plugin evidence must have kind ${expectedKind}.`);
  check(entry.status === "approved", `${field} plugin evidence must be approved.`);
  check(
    entry.candidateContractSha256 === baseline?.candidateContractSha256,
    `${field} plugin evidence targets a different candidate.`,
  );
  check(
    entry.candidateRevision === baseline?.baseRevision,
    `${field} plugin evidence targets a different candidate revision.`,
  );
  check(
    Array.isArray(entry.lifecycleStates) && entry.lifecycleStates.includes(state),
    `${field} plugin evidence is not bound to ${state}.`,
  );
}

function loadConnectorContractBaselineBinding(repositoryRoot) {
  const absolute = safeRepositoryPath(repositoryRoot, connectorContractBaselinePath);
  const bytes = readFileSync(absolute);
  let baseline;
  try {
    baseline = JSON.parse(bytes.toString("utf8"));
  } catch (error) {
    throw new Error(
      `Cannot parse Claude connector-v1 contract baseline: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  if (baseline?.schemaVersion !== 1) {
    throw new Error("Unsupported Claude connector-v1 contract-baseline schemaVersion.");
  }
  if (!/^[0-9a-f]{40}$/u.test(baseline?.baseRevision ?? "")) {
    throw new Error("Claude connector-v1 contract baseline needs a full baseRevision.");
  }
  if (!/^[0-9a-f]{64}$/u.test(baseline?.candidateContractSha256 ?? "")) {
    throw new Error("Claude connector-v1 contract baseline needs candidateContractSha256.");
  }
  const files = Array.isArray(baseline?.files) ? baseline.files : [];
  const trees = Array.isArray(baseline?.trees) ? baseline.trees : [];
  if (files.length === 0 || trees.length === 0) {
    throw new Error("Claude connector-v1 contract baseline needs files and trees.");
  }
  const records = [
    `base:${baseline.baseRevision}\n`,
    ...files.map((entry) => connectorContractRecord("file", entry)),
    ...trees.map((entry) => connectorContractRecord("tree", entry)),
  ].sort((left, right) => compareCodeUnits(left, right));
  const calculatedDigest = sha256(Buffer.from(records.join(""), "utf8"));
  if (calculatedDigest !== baseline.candidateContractSha256) {
    throw new Error(
      "Claude connector-v1 contract baseline candidateContractSha256 does not match its inventory.",
    );
  }

  return {
    path: connectorContractBaselinePath,
    sha256: sha256(bytes),
    baseRevision: baseline.baseRevision,
    candidateContractSha256: baseline.candidateContractSha256,
  };
}

function verifyHistoricalReleaseHistory(repositoryRoot, check) {
  const historyRoot = safeRepositoryPath(repositoryRoot, historicalReleaseRoot);
  const actualFiles = [];
  for (const versionEntry of readdirSync(historyRoot, { withFileTypes: true })) {
    const version = versionEntry.name;
    check(
      versionEntry.isDirectory() && !versionEntry.isSymbolicLink(),
      `Historical plugin release entry must be a directory: ${version}`,
    );
    if (!versionEntry.isDirectory() || versionEntry.isSymbolicLink()) continue;
    for (const fileEntry of readdirSync(resolve(historyRoot, version), {
      withFileTypes: true,
    })) {
      const relativePath = `${version}/${fileEntry.name}`;
      actualFiles.push(relativePath);
      check(
        fileEntry.isFile() && !fileEntry.isSymbolicLink(),
        `Historical plugin release entry must be a regular file: ${relativePath}`,
      );
      const expectedDigest = expectedHistoricalReleaseFiles.get(relativePath);
      check(
        expectedDigest !== undefined,
        `Unexpected historical plugin release file: ${relativePath}`,
      );
      if (expectedDigest !== undefined && fileEntry.isFile()) {
        check(
          sha256(readFileSync(resolve(historyRoot, relativePath))) === expectedDigest,
          `Historical plugin release file changed: ${relativePath}`,
        );
      }
    }
  }
  check(
    sameSet(actualFiles, [...expectedHistoricalReleaseFiles.keys()]),
    "Historical plugin release inventory must retain the complete immutable 1.0.0 dossier and 1.0.4 publication metadata.",
  );
}

function connectorContractRecord(kind, entry) {
  if (!nonBlankWithin(entry?.path, 500) || !/^[0-9a-f]{64}$/u.test(entry?.sha256 ?? "")) {
    throw new Error(`Invalid Claude connector-v1 ${kind} contract-baseline entry.`);
  }
  return `${kind}:${entry.path}\0${entry.sha256}\n`;
}

function unknownResult(error, blockers) {
  return {
    errors: [error instanceof Error ? error.message : String(error)],
    blockers,
    lifecycleState: "UNKNOWN",
    publicationStatus: "UNKNOWN",
    pluginVersion: "UNKNOWN",
    requiredGateCount: 0,
    requiredPendingCount: 0,
    candidateContractSha256: null,
  };
}

function currentRevision(repositoryRoot) {
  return execFileSync("git", ["-C", resolve(repositoryRoot), "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
}

function readJson(repositoryRoot, repositoryPath) {
  return JSON.parse(readFileSync(safeRepositoryPath(repositoryRoot, repositoryPath), "utf8"));
}

function safeRepositoryPath(repositoryRoot, repositoryPath) {
  const root = resolve(repositoryRoot);
  const target = resolve(root, repositoryPath);
  if (target !== root && !target.startsWith(`${root}${sep}`)) {
    throw new Error(`Path escapes repository root: ${repositoryPath}`);
  }
  if (!existsSync(target)) {
    throw new Error(`Missing release file: ${repositoryPath}`);
  }
  const stat = lstatSync(target);
  if (stat.isSymbolicLink()) {
    throw new Error(`Release path must not be a symlink: ${repositoryPath}`);
  }
  return target;
}

function stableStringify(value) {
  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableStringify(entry)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    return `{${Object.keys(value).sort(compareCodeUnits).map((key) =>
      `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  }
  return JSON.stringify(value);
}

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function sameSet(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && new Set(actual).size === actual.length
    && expected.every((entry) => actual.includes(entry));
}

function nonBlankWithin(value, maximum) {
  return typeof value === "string"
    && value.trim().length > 0
    && value.length <= maximum;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function parseArguments(arguments_) {
  const result = { expectedState: null, printCurrentBaseline: false, errors: [] };
  for (let index = 0; index < arguments_.length; index += 1) {
    const argument = arguments_[index];
    if (argument === "--print-current-baseline") {
      result.printCurrentBaseline = true;
    } else if (argument === "--expect-state") {
      result.expectedState = arguments_[index + 1] ?? null;
      index += 1;
    } else {
      result.errors.push(`Unknown argument: ${argument}`);
    }
  }
  if (result.expectedState !== null && !lifecycleStates.includes(result.expectedState)) {
    result.errors.push(`Invalid --expect-state: ${result.expectedState}`);
  }
  return result;
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (invokedPath === import.meta.url) {
  const options = parseArguments(process.argv.slice(2));
  if (options.errors.length > 0) {
    for (const error of options.errors) console.error(error);
    process.exitCode = 2;
  } else if (options.printCurrentBaseline) {
    console.log(JSON.stringify(buildCurrentPluginBaseline(), null, 2));
  } else {
    const result = verifyClaudePluginV1Release({
      expectedState: options.expectedState,
    });
    if (result.errors.length > 0) {
      console.error(`CHECK claude_plugin_v1_release FAIL state=${result.lifecycleState}`);
      for (const error of result.errors) console.error(`ERROR ${error}`);
      if (result.blockers.length > 0) {
        console.error("PLUGIN_SUBMISSION_BLOCKED pending release gates:");
        for (const blocker of result.blockers) console.error(`- ${blocker}`);
      }
      process.exitCode = 1;
    } else {
      console.log(
        `CHECK claude_plugin_v1_release STRUCTURAL_PASS state=${result.lifecycleState} `
          + `version=${result.pluginVersion} required_gates=${result.requiredGateCount} `
          + `required_pending=${result.requiredPendingCount}`,
      );
      if (result.blockers.length > 0) {
        console.log("PLUGIN_SUBMISSION_BLOCKED pending release gates:");
        for (const blocker of result.blockers) console.log(`- ${blocker}`);
      }
    }
  }
}
