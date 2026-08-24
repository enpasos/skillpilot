import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  verifyOpenAiPluginReviewFreeze,
} from "./check_openai_plugin_review_freeze.mjs";

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const dossierRoot = "ai/claude/connector-v1";
const carouselRoot = `${dossierRoot}/assets/carousel`;
const carouselManifestPath = `${carouselRoot}/manifest.json`;
const claudeAppManifestPath = `${carouselRoot}/source-app-manifest.json`;
const retainedResourceIndexPath =
  "backend/src/main/resources/claude-connector-v1/mcp-apps/retained-resources.json";
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedBaseUrl = "https://mcp-claude-v1.skillpilot.com";
const expectedDocumentationUrl =
  "https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/";
const expectedPrivacyUrl = `${expectedBaseUrl}/privacy`;
const expectedLearnerStartUrl = "https://skillpilot.com/";
const expectedTools = [
  "get_skillpilot_coach_context",
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

const expectedRequiredGates = [
  "openai-review-freeze",
  "claude-contract-tests",
  "full-backend-suite",
  "release-package-validation",
  "public-docs-online",
  "public-edge-and-oauth",
  "openai-production-differential",
  "mcp-inspector-all-twelve-tools-two-resources",
  "hosted-claude-all-twelve-tools-two-apps",
  "negative-and-replay-cases",
  "first-party-24h-learning-session",
  "permanent-id-and-id-file-nondisclosure",
  "oauth-session-separation",
  "reviewer-account-and-reset",
  "privacy-and-legal-approval",
  "support-and-security-owner",
  "load-latency-and-log-redaction",
  "rollback-drill",
  "listing-and-permanent-slug-approval",
  "icon-rights-and-portal-asset",
  "mcp-app-carousel",
  "team-enterprise-directory-access",
  "portal-compliance-acknowledgements",
];

const expectedOptionalGates = [
  "claude-code-client",
  "allowed-link-uris",
];

const expectedContractTrees = [
  "ai/claude/app",
  "ai/claude/connector-v1/assets/carousel",
  "app/src/coachVariants/claudeV1",
  "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1",
  "backend/src/main/resources/claude-connector-v1",
];

const expectedContractFiles = [
  "ai/claude/connector-v1/assets/icon-512.png",
  "ai/claude/connector-v1/directory-listing.json",
  "ai/claude/connector-v1/reviewer-test-plan.md",
  "app/package.json",
  "app/scripts/testClaudeV1StartUi.tsx",
  "app/scripts/testRootRoutePolicy.ts",
  "app/src/App.tsx",
  "app/src/components/SessionSetup.tsx",
  "app/src/locales/de.ts",
  "app/src/locales/en.ts",
  "app/src/utils/claudeCoach.ts",
  "app/src/utils/rootRoutePolicy.ts",
  "backend/src/main/resources/db/changelog/changes/023-add-claude-connector-v1.yaml",
  "backend/src/main/resources/db/changelog/changes/024-replace-claude-v1-binding-with-learning-sessions.yaml",
  "backend/src/main/resources/db/changelog/db.changelog-master.yaml",
  "deploy/nginx/skillpilot-claude-acme.conf",
  "deploy/nginx/skillpilot-claude-connector-v1.conf",
  "docs/deploy/claude-connector-v1-release.md",
  "docs/deploy/claude-connector-v1-user-guide.de.md",
  "docs/deploy/claude-connector-v1-user-guide.md",
  "scripts/capture_claude_mcp_app_carousel.mjs",
];

export function verifyClaudeConnectorV1Release({
  repositoryRoot = defaultRepositoryRoot,
  submissionReady = false,
} = {}) {
  const errors = [];
  const blockers = [];
  const check = (condition, message) => {
    if (!condition) {
      errors.push(message);
    }
  };

  let listing;
  let gates;
  let lifecycle;
  let evidence;
  let baseline;
  let retainedResourceIndex;
  let carouselManifest;
  let claudeAppManifest;
  try {
    listing = readJson(repositoryRoot, `${dossierRoot}/directory-listing.json`);
    gates = readJson(repositoryRoot, `${dossierRoot}/release-gates.json`);
    lifecycle = readJson(repositoryRoot, `${dossierRoot}/release/lifecycle.json`);
    evidence = readJson(repositoryRoot, `${dossierRoot}/evidence/manifest.json`);
    baseline = readJson(
      repositoryRoot,
      `${dossierRoot}/release/contract-baseline.json`,
    );
    retainedResourceIndex = readJson(repositoryRoot, retainedResourceIndexPath);
    carouselManifest = readJson(repositoryRoot, carouselManifestPath);
    claudeAppManifest = readJson(repositoryRoot, claudeAppManifestPath);
    verifyOpenAiPluginReviewFreeze({ repositoryRoot });
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : String(error)],
      blockers,
      publicationStatus: "UNKNOWN",
      lifecycleState: "UNKNOWN",
      toolCount: 0,
      requiredGateCount: 0,
      requiredPendingCount: 0,
    };
  }

  check(listing.schemaVersion === 1, "Unsupported directory listing schemaVersion.");
  check(gates.schemaVersion === 1, "Unsupported release-gates schemaVersion.");
  check(lifecycle.schemaVersion === 1, "Unsupported lifecycle schemaVersion.");
  check(evidence.schemaVersion === 1, "Unsupported evidence schemaVersion.");
  check(baseline.schemaVersion === 1, "Unsupported contract-baseline schemaVersion.");
  check(carouselManifest.schemaVersion === 1, "Unsupported carousel schemaVersion.");

  check(
    ["PRE_SUBMISSION", "READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(
      lifecycle.state,
    ),
    "Lifecycle state must be PRE_SUBMISSION, READY_FOR_SUBMISSION, SUBMITTED or PUBLISHED.",
  );
  check(listing.connector?.type === "remote_mcp", "Connector type must be remote_mcp.");
  check(listing.connector?.serverUrl === expectedEndpoint, "Unexpected public MCP endpoint.");
  check(
    listing.connector?.transport === "streamable_http",
    "Claude Connector v1 must use Streamable HTTP.",
  );
  check(listing.connector?.sameUrlForEveryUser === true, "Connector URL must be user-neutral.");
  check(listing.connector?.mcpApps === true, "Claude Connector v1 must publish its two MCP Apps.");
  check(listing.connector?.prompts === false, "Claude Connector v1 must not publish prompts.");
  check(listing.connector?.resources === true, "Claude Connector v1 must publish its two UI resources.");

  const listingCopy = listing.listing ?? {};
  check(nonBlankWithin(listingCopy.name, 100), "Listing name must contain 1-100 characters.");
  check(nonBlankWithin(listingCopy.tagline, 55), "Listing tagline must contain 1-55 characters.");
  check(
    nonBlankWithin(listingCopy.description, 2_000),
    "Listing description must contain 1-2000 characters.",
  );
  check(
    Array.isArray(listingCopy.categories)
      && listingCopy.categories.length >= 1
      && listingCopy.categories.length <= 5
      && new Set(listingCopy.categories).size === listingCopy.categories.length
      && listingCopy.categories.every((entry) => nonBlankWithin(entry, 100)),
    "Listing must contain 1-5 non-empty categories.",
  );
  check(
    listingCopy.documentationUrl === expectedDocumentationUrl,
    "Listing documentation URL must use the public Claude user guide.",
  );
  check(
    listingCopy.privacyPolicyUrl === expectedPrivacyUrl,
    "Listing privacy URL must use the connector-specific privacy page.",
  );
  check(isCleanHttpsUrl(listingCopy.documentationUrl), "Documentation URL must be clean absolute HTTPS.");
  check(isCleanHttpsUrl(listingCopy.privacyPolicyUrl), "Privacy URL must be clean absolute HTTPS.");
  check(
    typeof listingCopy.supportContact === "string"
      && /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(listingCopy.supportContact),
    "Support contact must be an email address.",
  );
  check(
    listingCopy.iconPath === `${dossierRoot}/assets/icon-512.png`,
    "Listing must use the release-owned icon asset.",
  );
  check(
    listingCopy.carouselManifestPath === carouselManifestPath,
    "Listing must reference the release-owned MCP App carousel manifest.",
  );
  check(
    /^[0-9a-f]{64}$/u.test(listingCopy.iconSha256 ?? ""),
    "Listing iconSha256 must be a lowercase SHA-256 digest.",
  );
  check(
    typeof listingCopy.slug === "string" && /^[a-z0-9-]+$/u.test(listingCopy.slug),
    "Candidate slug must use lowercase URL-safe characters.",
  );

  check(
    Array.isArray(listing.useCases)
      && listing.useCases.length >= 3
      && listing.useCases.every(
        (entry) => nonBlankWithin(entry?.title, 120)
          && nonBlankWithin(entry?.description, 1_000)
          && nonBlankWithin(entry?.examplePrompt, 1_000),
      ),
    "At least three complete use cases are required.",
  );
  check(
    Array.isArray(listing.prerequisites) && listing.prerequisites.length > 0,
    "User prerequisites must be documented.",
  );
  check(listing.authentication?.mode === "oauth_2_cimd", "OAuth must use CIMD.");
  check(listing.authentication?.pkce === "S256", "OAuth must require PKCE S256.");
  check(
    listing.authentication?.authorizationServer === expectedBaseUrl,
    "Unexpected OAuth authorization server.",
  );
  check(
    sameSet(listing.authentication?.scopes, [
      "skillpilot.read",
      "skillpilot.write",
      "offline_access",
    ]),
    "OAuth scopes must match the Claude v1 contract.",
  );
  check(
    listing.learnerSession?.startUrl === expectedLearnerStartUrl,
    "Learner sessions must start at the first-party Claude launch URL.",
  );
  check(
    listing.learnerSession?.tokenPrefix === "spc_",
    "Learner sessions must use the opaque spc_ prefix.",
  );
  check(
    listing.learnerSession?.lifetimeHours === 24,
    "Learner sessions must expire after exactly 24 hours.",
  );
  check(
    listing.learnerSession?.permanentIdShared === false
      && listing.learnerSession?.idFileRequired === false,
    "Permanent learner ID and ID-file material must remain inside SkillPilot.",
  );
  check(
    listing.learnerSession?.oauthTransportIndependent === true,
    "Connector OAuth must remain independent from the learner session.",
  );
  check(
    listingCopy.description.includes(expectedLearnerStartUrl)
      && listingCopy.description.includes("spc_")
      && /exactly 24 hours/u.test(listingCopy.description)
      && /Connector OAuth/u.test(listingCopy.description)
      && /technical connection/u.test(listingCopy.description),
    "Listing copy must explain the first-party 24-hour session and transport-only OAuth.",
  );
  check(listing.dataHandling?.readsUserData === true, "Listing must disclose readsUserData.");
  check(listing.dataHandling?.writesUserData === true, "Listing must disclose writesUserData.");
  check(
    listing.dataHandling?.receivesCompleteClaudeTranscript === false,
    "Listing must not claim receipt of the complete Claude transcript.",
  );
  check(
    listing.dataHandling?.receivesClaudeMemory === false,
    "Listing must not claim receipt of Claude memory.",
  );
  check(
    listing.dataHandling?.processesExplicitMcpRequestsAndArguments === true,
    "Listing must disclose processing of explicit MCP requests and arguments.",
  );
  check(
    listing.dataHandling?.storesResultingLearningState === true,
    "Listing must disclose stored learning state.",
  );
  check(
    listing.dataHandling?.portalConversationDataClassification
      === "requires_product_legal_portal_decision",
    "Portal conversation-data classification must remain an explicit human decision.",
  );
  check(
    Array.isArray(listing.allowedLinkUris) && listing.allowedLinkUris.length === 0,
    "Claude Connector v1 must not declare allowed link URIs.",
  );
  check(sameSet(listing.surfacesClaimed, ["Claude.ai"]), "Only Claude.ai may be claimed.");

  verifyIcon(repositoryRoot, listingCopy, check);
  errors.push(...validateMcpAppCarousel({
    repositoryRoot,
    manifest: carouselManifest,
    appManifest: claudeAppManifest,
    submissionReady,
  }));
  const toolCount = verifyImplementation(repositoryRoot, retainedResourceIndex, check);
  verifyDocumentationAndEdge(repositoryRoot, check);
  verifyBaseline(repositoryRoot, baseline, check);
  verifyRepositoryEvidence(repositoryRoot, evidence, check);

  const stateResult = validateClaudeReleaseState({
    listing,
    gates,
    lifecycle,
    evidence,
    baseline,
    submissionReady,
  });
  errors.push(...stateResult.errors);
  blockers.push(...stateResult.blockers);

  return {
    errors,
    blockers,
    publicationStatus: lifecycle.state,
    lifecycleState: lifecycle.state,
    toolCount,
    requiredGateCount: stateResult.requiredGateCount,
    requiredPendingCount: stateResult.requiredPendingCount,
  };
}

export function validateClaudeReleaseState({
  listing,
  gates,
  lifecycle,
  evidence,
  baseline,
  submissionReady = false,
}) {
  const errors = [];
  const blockers = [];
  const check = (condition, message) => {
    if (!condition) {
      errors.push(message);
    }
  };
  const gateList = Array.isArray(gates?.gates) ? gates.gates : [];
  const gateIds = gateList.map((gate) => gate?.id);
  const gateIdSet = new Set(gateIds);
  const evidenceEntries = Array.isArray(evidence?.entries) ? evidence.entries : [];
  const evidenceIds = evidenceEntries.map((entry) => entry?.id);
  const evidenceById = new Map(evidenceEntries.map((entry) => [entry?.id, entry]));

  check(gateIds.length === gateIdSet.size, "Release gate IDs must be unique.");
  check(
    sameSet(
      gateList.filter((gate) => gate?.required === true).map((gate) => gate.id),
      expectedRequiredGates,
    ),
    "Required release gate inventory changed without updating the checker.",
  );
  check(
    sameSet(
      gateList.filter((gate) => gate?.required === false).map((gate) => gate.id),
      expectedOptionalGates,
    ),
    "Optional release gate inventory changed without updating the checker.",
  );
  for (const gate of gateList) {
    check(typeof gate?.required === "boolean", `Gate ${gate?.id ?? "UNKNOWN"} needs a boolean required flag.`);
    check(
      ["pass", "pending", "blocked", "not_required"].includes(gate?.status),
      `Gate ${gate?.id ?? "UNKNOWN"} has an invalid status.`,
    );
    check(Array.isArray(gate?.evidence), `Gate ${gate?.id ?? "UNKNOWN"} needs an evidence-ID array.`);
    const references = Array.isArray(gate?.evidence) ? gate.evidence : [];
    check(
      references.every((entry) => nonBlankWithin(entry, 200))
        && new Set(references).size === references.length,
      `Gate ${gate?.id ?? "UNKNOWN"} evidence IDs must be non-empty and unique.`,
    );
    if (gate?.required === true) {
      check(gate.status !== "not_required", `Required gate ${gate.id} cannot be not_required.`);
    } else {
      check(gate?.status === "not_required", `Optional gate ${gate?.id} must be not_required.`);
    }
    for (const reference of references) {
      const entry = evidenceById.get(reference);
      check(Boolean(entry), `Gate ${gate?.id ?? "UNKNOWN"} references unknown evidence ${reference}.`);
      if (entry) {
        check(
          Array.isArray(entry.gateIds) && entry.gateIds.includes(gate.id),
          `Evidence ${reference} is not bound to gate ${gate.id}.`,
        );
      }
    }
    if (gate?.status === "pass") {
      check(references.length > 0, `Passing gate ${gate.id} must name durable evidence.`);
      for (const reference of references) {
        const entry = evidenceById.get(reference);
        check(entry?.status === "approved", `Passing gate ${gate.id} has unapproved evidence ${reference}.`);
        check(
          entry?.candidateContractSha256 === baseline?.candidateContractSha256,
          `Passing gate ${gate.id} evidence ${reference} targets a different candidate.`,
        );
      }
    }
  }

  check(evidenceIds.length === new Set(evidenceIds).size, "Evidence manifest IDs must be unique.");
  for (const entry of evidenceEntries) {
    const entryGateIds = Array.isArray(entry?.gateIds) ? entry.gateIds : [];
    const lifecycleStates = Array.isArray(entry?.lifecycleStates)
      ? entry.lifecycleStates
      : [];
    check(nonBlankWithin(entry?.id, 200), "Every evidence entry needs an ID.");
    check(
      ["reference_required", "recorded", "approved"].includes(entry?.status),
      `Evidence ${entry?.id ?? "UNKNOWN"} has an invalid status.`,
    );
    check(
      Array.isArray(entry?.gateIds)
        && new Set(entryGateIds).size === entryGateIds.length
        && entryGateIds.every((gateId) => gateIdSet.has(gateId)),
      `Evidence ${entry?.id ?? "UNKNOWN"} must name valid unique gate IDs.`,
    );
    check(
      new Set(lifecycleStates).size === lifecycleStates.length
        && lifecycleStates.every((state) => ["SUBMITTED", "PUBLISHED"].includes(state)),
      `Evidence ${entry?.id ?? "UNKNOWN"} has invalid lifecycle-state bindings.`,
    );
    check(
      entryGateIds.length > 0 || lifecycleStates.length > 0,
      `Evidence ${entry?.id ?? "UNKNOWN"} needs a gate or lifecycle-state binding.`,
    );
    check(
      entry?.candidateContractSha256 === null
        || entry?.candidateContractSha256 === baseline?.candidateContractSha256,
      `Evidence ${entry?.id ?? "UNKNOWN"} targets an unknown candidate digest.`,
    );
    if (["recorded", "approved"].includes(entry?.status)) {
      check(nonBlankWithin(entry.externalEvidenceId, 500), `Evidence ${entry.id} needs an external ID.`);
      check(/^[0-9a-f]{64}$/u.test(entry.sha256 ?? ""), `Evidence ${entry.id} needs a SHA-256 digest.`);
      check(
        entry.candidateContractSha256 === baseline?.candidateContractSha256,
        `Evidence ${entry.id} must bind to the current candidate digest.`,
      );
    }
    if (entry?.status === "approved") {
      check(nonBlankWithin(entry.approvedBy, 200), `Evidence ${entry.id} needs an approver.`);
      check(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?$/u.test(entry.approvedAt ?? ""), `Evidence ${entry.id} needs approvedAt.`);
      check(
        /^[0-9a-f]{40}$/u.test(entry.candidateRevision ?? ""),
        `Evidence ${entry.id} needs the tested candidateRevision.`,
      );
    }
  }

  check(
    lifecycle?.directoryIdentity?.permanentSlugCandidate === listing?.listing?.slug,
    "Lifecycle slug candidate must match the listing.",
  );
  check(
    lifecycle?.majorLines?.[0]?.endpoint === expectedEndpoint,
    "Lifecycle major-v1 endpoint must match the public connector.",
  );
  check(
    lifecycle?.productOwnerUnfreeze?.approvedAt === "2026-08-23"
      && lifecycle?.productOwnerUnfreeze?.approvedBy === "product-owner"
      && /Claude Connector v1/u.test(lifecycle?.productOwnerUnfreeze?.scope ?? "")
      && Array.isArray(lifecycle?.productOwnerUnfreeze?.excludes)
      && lifecycle.productOwnerUnfreeze.excludes.some((entry) => /OpenAI/u.test(entry))
      && lifecycle.productOwnerUnfreeze.excludes.some((entry) => /major line 2/u.test(entry)),
    "Lifecycle must record the 2026-08-23 Claude-v1-only Product Owner unfreeze.",
  );
  check(
    lifecycle?.breakingChangeProcessAppliesAfter
      === "final_submission_freeze_or_publication",
    "Breaking-change process must begin only after final submission freeze or publication.",
  );
  check(
    [
      "pre_submission_candidate_rebuild",
      "frozen_for_submission",
      "published",
    ].includes(lifecycle?.majorLines?.[0]?.status),
    "Lifecycle major-v1 status is invalid.",
  );
  check(
    lifecycle?.majorLines?.[1]?.status === "unallocated",
    "The future v2 line must remain unallocated.",
  );
  check(
    lifecycle?.externalStateEvidence
      && ["submissionEvidenceId", "publicationEvidenceId"].every(
        (field) => lifecycle.externalStateEvidence[field] === null
          || nonBlankWithin(lifecycle.externalStateEvidence[field], 200),
      ),
    "Lifecycle external-state evidence fields must be null or evidence IDs.",
  );

  const requiredGates = gateList.filter((gate) => gate?.required === true);
  const requiredPending = requiredGates.filter((gate) => gate.status !== "pass");
  blockers.push(...requiredPending.map((gate) => `${gate.id}: ${gate.status}`));

  const state = lifecycle?.state;
  if (state === "PRE_SUBMISSION") {
    check(gates?.submissionReady === false, "PRE_SUBMISSION must keep submissionReady=false.");
    check(
      baseline?.state === "PRE_SUBMISSION_CANDIDATE",
      "PRE_SUBMISSION must use a PRE_SUBMISSION_CANDIDATE baseline.",
    );
    check(
      lifecycle?.majorLines?.[0]?.status === "pre_submission_candidate_rebuild",
      "PRE_SUBMISSION Claude v1 must remain marked as a candidate rebuild.",
    );
  } else if (["READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(state)) {
    check(gates?.submissionReady === true, `${state} requires submissionReady=true.`);
    check(requiredPending.length === 0, `${state} requires every required gate to pass.`);
    check(
      baseline?.state === "FROZEN_FOR_SUBMISSION",
      `${state} requires a FROZEN_FOR_SUBMISSION contract baseline.`,
    );
    check(lifecycle?.directoryIdentity?.slugApproved === true, `${state} requires slugApproved=true.`);
    check(
      lifecycle?.majorLines?.[0]?.status
        === (state === "PUBLISHED" ? "published" : "frozen_for_submission"),
      `${state} requires the matching immutable major-v1 status.`,
    );
  }

  if (["SUBMITTED", "PUBLISHED"].includes(state)) {
    verifyLifecycleEvidence(
      "submissionEvidenceId",
      "SUBMITTED",
      lifecycle,
      evidenceById,
      baseline,
      check,
    );
  }
  if (state === "PUBLISHED") {
    verifyLifecycleEvidence(
      "publicationEvidenceId",
      "PUBLISHED",
      lifecycle,
      evidenceById,
      baseline,
      check,
    );
  }

  if (submissionReady) {
    check(
      state === "READY_FOR_SUBMISSION",
      "Strict mode requires lifecycle state READY_FOR_SUBMISSION.",
    );
  }

  return {
    errors,
    blockers,
    requiredGateCount: requiredGates.length,
    requiredPendingCount: requiredPending.length,
  };
}

function verifyLifecycleEvidence(
  field,
  lifecycleState,
  lifecycle,
  evidenceById,
  baseline,
  check,
) {
  const evidenceId = lifecycle?.externalStateEvidence?.[field];
  check(nonBlankWithin(evidenceId, 200), `${lifecycleState} requires ${field}.`);
  const entry = evidenceById.get(evidenceId);
  check(Boolean(entry), `${field} references unknown evidence ${String(evidenceId)}.`);
  if (!entry) {
    return;
  }
  check(entry.status === "approved", `${field} evidence must be approved.`);
  check(
    entry.candidateContractSha256 === baseline?.candidateContractSha256,
    `${field} evidence targets a different candidate.`,
  );
  check(
    Array.isArray(entry.lifecycleStates)
      && entry.lifecycleStates.includes(lifecycleState),
    `${field} evidence is not bound to ${lifecycleState}.`,
  );
  check(
    /^[0-9a-f]{40}$/u.test(entry.candidateRevision ?? ""),
    `${field} evidence needs the observed candidateRevision.`,
  );
}

export function validateMcpAppCarousel({
  repositoryRoot = defaultRepositoryRoot,
  manifest,
  appManifest,
  submissionReady = false,
} = {}) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };
  const expectedFixture = "synthetic-authorized-adult-release-fixture";
  const expectedAttestations = [
    "appResponseOnly",
    "browserChromeExcluded",
    "learnerDataExcluded",
    "oauthValuesExcluded",
    "permanentLearnerIdExcluded",
    "promptExcluded",
    "protectedAnswersExcluded",
    "temporaryLearningSessionExcluded",
  ];
  const expectedApprovals = ["legal", "product", "qa"];
  const expectedApps = new Map([
    [
      "render_skillpilot_goal_visualization",
      "goal-visualization.html",
    ],
    [
      "start_skillpilot_memory_practice",
      "memory-card-practice.html",
    ],
  ]);

  check(manifest?.schemaVersion === 1, "Carousel manifest must use schemaVersion 1.");
  check(appManifest?.schemaVersion === 1, "Claude MCP App manifest must use schemaVersion 1.");
  check(appManifest?.provider === "claude", "Carousel must target the Claude MCP Apps.");
  check(
    manifest?.generatedBy === "scripts/capture_claude_mcp_app_carousel.mjs",
    "Carousel manifest must name the reproducible capture script.",
  );
  check(
    manifest?.captureHost === "local-standards-compatible-mcp-app-host"
      && manifest?.targetSurface === "Claude.ai",
    "Carousel must disclose its reproducible capture host and Claude.ai target surface.",
  );
  check(nonBlankWithin(manifest?.purpose, 1_000), "Carousel manifest needs a purpose.");
  check(
    /^[0-9a-f]{40}$/u.test(manifest?.sourceRevision ?? ""),
    "Carousel manifest needs a full sourceRevision.",
  );
  check(
    /^\d{4}-\d{2}-\d{2}$/u.test(manifest?.sourceDate ?? ""),
    "Carousel manifest needs a sourceDate.",
  );
  check(
    manifest?.sourceAppManifest === claudeAppManifestPath,
    "Carousel must reference the active Claude MCP App manifest.",
  );
  try {
    check(
      sha256(readFileSync(safeRepositoryPath(repositoryRoot, claudeAppManifestPath)))
        === manifest?.sourceAppManifestSha256,
      "Carousel source MCP App manifest hash changed.",
    );
  } catch (error) {
    check(
      false,
      `Cannot verify carousel source MCP App manifest: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }

  const serializedManifest = JSON.stringify(manifest ?? {});
  for (const forbidden of ["spc_", "learningSessionId", "reviewCapability"]) {
    check(
      !serializedManifest.includes(forbidden),
      `Carousel manifest exposes forbidden private value marker: ${forbidden}.`,
    );
  }

  const assets = Array.isArray(manifest?.assets) ? manifest.assets : [];
  check(
    assets.length >= 3 && assets.length <= 5,
    "Carousel must contain between 3 and 5 screenshots.",
  );
  const ids = assets.map((asset) => asset?.id);
  const paths = assets.map((asset) => asset?.path);
  check(
    ids.every((id) => nonBlankWithin(id, 120))
      && new Set(ids).size === ids.length,
    "Carousel asset IDs must be non-empty and unique.",
  );
  check(
    paths.every((path) => typeof path === "string")
      && new Set(paths).size === paths.length,
    "Carousel asset paths must be unique.",
  );

  const coveredTools = new Set();
  for (const asset of assets) {
    const label = asset?.id ?? "UNKNOWN";
    check(
      typeof asset?.path === "string"
        && /^ai\/claude\/connector-v1\/assets\/carousel\/[^/]+\.png$/u.test(
          asset.path,
        ),
      `Carousel asset ${label} must be a direct PNG child of the carousel directory.`,
    );
    check(asset?.format === "PNG", `Carousel asset ${label} must declare PNG format.`);
    check(nonBlankWithin(asset?.locale, 40), `Carousel asset ${label} needs a locale.`);
    check(
      asset?.surface === "Claude.ai",
      `Carousel asset ${label} must show the Claude.ai surface.`,
    );
    check(
      nonBlankWithin(asset?.pairedPrompt, 1_000),
      `Carousel asset ${label} needs a paired prompt of at most 1000 characters.`,
    );
    check(
      nonBlankWithin(asset?.interaction, 300),
      `Carousel asset ${label} needs an interaction description.`,
    );
    check(
      asset?.fixture === expectedFixture,
      `Carousel asset ${label} must use the approved synthetic fixture.`,
    );

    const attestationKeys = Object.keys(asset?.attestations ?? {});
    check(
      sameSet(attestationKeys, expectedAttestations)
        && expectedAttestations.every((key) => asset.attestations[key] === true),
      `Carousel asset ${label} needs every exact privacy attestation set to true.`,
    );
    const approvalKeys = Object.keys(asset?.approvals ?? {});
    const allowedApprovalStates = submissionReady
      ? ["approved"]
      : ["pending", "approved"];
    check(
      sameSet(approvalKeys, expectedApprovals)
        && expectedApprovals.every((key) => allowedApprovalStates.includes(
          asset.approvals[key],
        )),
      submissionReady
        ? `Carousel asset ${label} needs Product, QA and Legal approval.`
        : `Carousel asset ${label} needs exact Product, QA and Legal approval states.`,
    );

    let bytes;
    try {
      const absolute = safeRepositoryPath(repositoryRoot, asset.path);
      const stat = lstatSync(absolute);
      check(
        stat.isFile() && !stat.isSymbolicLink(),
        `Carousel asset ${label} must be a regular non-symlink file.`,
      );
      bytes = readFileSync(absolute);
    } catch (error) {
      check(
        false,
        `Cannot read carousel asset ${label}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
    if (bytes) {
      const dimensions = pngDimensions(bytes);
      check(Boolean(dimensions), `Carousel asset ${label} is not a valid PNG.`);
      if (dimensions) {
        check(
          dimensions.width >= 1_000,
          `Carousel asset ${label} must be at least 1000 pixels wide.`,
        );
        check(
          asset?.width === dimensions.width && asset?.height === dimensions.height,
          `Carousel asset ${label} dimensions differ from its manifest.`,
        );
      }
      check(
        sha256(bytes) === asset?.sha256,
        `Carousel asset ${label} hash differs from its manifest.`,
      );
    }

    const expectedFileName = expectedApps.get(asset?.toolName);
    check(Boolean(expectedFileName), `Carousel asset ${label} names an unknown MCP App tool.`);
    if (!expectedFileName) continue;
    coveredTools.add(asset.toolName);
    const expectedUri = appManifest?.tools?.[asset.toolName]?.resourceUri;
    const resource = appManifest?.resources?.find(
      (candidate) => candidate?.uri === expectedUri,
    );
    check(Boolean(resource), `Carousel asset ${label} has no active MCP App resource.`);
    if (!resource) continue;
    const expectedResourcePath = `sha256-${resource.sha256}/${expectedFileName}`;
    const expectedClasspathPath =
      `backend/src/main/resources/claude-connector-v1/mcp-apps/${expectedFileName}`;
    check(
      resource.path === expectedResourcePath,
      `Carousel asset ${label} targets the wrong MCP App file.`,
    );
    check(
      resource.classpathPath === expectedClasspathPath,
      `Carousel asset ${label} targets the wrong deployed MCP App resource.`,
    );
    check(
      asset?.resourceName === resource.name
        && asset?.resourceUri === resource.uri
        && asset?.sourceResourceSha256 === resource.sha256,
      `Carousel asset ${label} is not bound to the active MCP App resource.`,
    );
    check(
      resource.uri.includes(`/sha256-${resource.sha256}/${expectedFileName}`),
      `Carousel asset ${label} resource URI is not content-addressed.`,
    );
    try {
      const resourceBytes = readFileSync(safeRepositoryPath(
        repositoryRoot,
        expectedClasspathPath,
      ));
      check(
        sha256(resourceBytes) === resource.sha256,
        `Carousel source resource changed for ${label}.`,
      );
    } catch (error) {
      check(
        false,
        `Cannot verify carousel source resource ${label}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }

  check(
    sameSet([...coveredTools], [...expectedApps.keys()]),
    "Carousel must cover both active SkillPilot MCP Apps.",
  );
  return errors;
}

function verifyIcon(repositoryRoot, listing, check) {
  let bytes;
  try {
    const iconPath = safeRepositoryPath(repositoryRoot, listing.iconPath);
    const stat = lstatSync(iconPath);
    check(stat.isFile() && !stat.isSymbolicLink(), "Release icon must be a regular file.");
    bytes = readFileSync(iconPath);
  } catch (error) {
    check(false, `Cannot read release icon: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  check(
    bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])),
    "Release icon must be a PNG.",
  );
  check(bytes.length >= 24, "Release icon is too short to contain PNG dimensions.");
  if (bytes.length >= 24) {
    check(bytes.readUInt32BE(16) === 512, "Release icon width must be 512 pixels.");
    check(bytes.readUInt32BE(20) === 512, "Release icon height must be 512 pixels.");
  }
  check(sha256(bytes) === listing.iconSha256, "Release icon hash differs from listing metadata.");
}

function verifyRepositoryEvidence(repositoryRoot, evidence, check) {
  const entries = Array.isArray(evidence?.entries) ? evidence.entries : [];
  for (const entry of entries) {
    if (typeof entry?.externalEvidenceId !== "string"
        || !entry.externalEvidenceId.startsWith("repository:")) {
      continue;
    }
    const relativePath = entry.externalEvidenceId.slice("repository:".length);
    try {
      const path = safeRepositoryPath(repositoryRoot, relativePath);
      const stat = lstatSync(path);
      check(
        stat.isFile() && !stat.isSymbolicLink(),
        `Repository evidence is not a regular file: ${entry.id}.`,
      );
      check(
        sha256(readFileSync(path)) === entry.sha256,
        `Repository evidence hash changed: ${entry.id}.`,
      );
    } catch (error) {
      check(
        false,
        `Cannot verify repository evidence ${entry?.id ?? "UNKNOWN"}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}

export function validateClaudeWebStartImplementation(
  adapterSource,
  uiTestSource,
  sessionSetupSource,
) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  check(
    adapterSource.includes("const CLAUDE_V1_WEB_CHAT_URL = 'https://claude.ai/new'"),
    "Claude Web start must pin exactly https://claude.ai/new.",
  );
  check(
    adapterSource.includes("if (!prompt.trim()) throw new Error('Missing Claude start prompt')")
      && adapterSource.includes(
        "return `${CLAUDE_V1_WEB_CHAT_URL}?q=${encodeURIComponent(prompt)}`",
      ),
    "Claude Web start must encode one non-empty complete prompt as q.",
  );
  check(
    [
      "const keys = [...url.searchParams.keys()]",
      "return keys.length === 1",
      "&& keys[0] === 'q'",
      "url.searchParams.getAll('q').length === 1",
      "Boolean(url.searchParams.get('q')?.trim())",
    ].every((fragment) => adapterSource.includes(fragment)),
    "Claude Web URL validation must require exactly one non-empty q parameter.",
  );
  check(
    [
      "url.origin !== 'https://claude.ai'",
      "url.pathname !== '/new'",
      "url.username",
      "url.password",
      "url.hash",
    ].every((fragment) => adapterSource.includes(fragment)),
    "Claude Web URL validation must reject foreign origins, paths, credentials and fragments.",
  );
  check(
    adapterSource.includes("webUrl: buildClaudeWebPromptUrl(response.prompt)")
      && adapterSource.includes("desktopUrl: ''")
      && !adapterSource.includes("claude://")
      && /export const getSafeClaudeDesktopUrl = \(value: string\): string \| null => \{\s*void value\s*return null\s*\}/u.test(
        adapterSource,
      ),
    "Claude v1 start must remain Web-only with no Desktop route.",
  );

  const activeLaunchSource = uniqueFunctionSource(
    sessionSetupSource,
    "const handleLaunchClaude = async () => {",
  );
  const activeClaudeUiSource = uniqueClaudeUiRegion(sessionSetupSource);
  check(
    activeLaunchSource !== null && activeClaudeUiSource !== null,
    "Active Claude Web-start handler and UI must remain uniquely identifiable.",
  );

  if (activeLaunchSource !== null && activeClaudeUiSource !== null) {
    const popupOpen = "const claudeWindow = window.open('', '_blank')";
    const popupFailure = [
      "if (!claudeWindow) {",
      "setClaudeActionState('failed')",
      "return",
    ];
    const launchRequest = "const result = await requestClaudeLaunch({";
    const validatedUrl = "const webUrl = getSafeClaudeWebUrl(result.webUrl)";
    const invalidUrlFailure =
      "if (!webUrl) throw new Error('Invalid Claude Web launch URL')";
    const validatedNavigation = "claudeWindow.location.href = webUrl";
    const popupOpenIndex = activeLaunchSource.indexOf(popupOpen);
    const launchRequestIndex = activeLaunchSource.indexOf(launchRequest);
    const validatedUrlIndex = activeLaunchSource.indexOf(validatedUrl);
    const invalidUrlFailureIndex = activeLaunchSource.indexOf(invalidUrlFailure);
    const validatedNavigationIndex = activeLaunchSource.indexOf(validatedNavigation);
    const firstAwaitIndex = activeLaunchSource.indexOf("await ");
    const popupGuardPattern = /const claudeWindow = window\.open\('', '_blank'\)\s*if \(!claudeWindow\) \{\s*setClaudeActionState\('failed'\)\s*return\s*\}\s*try \{/u;
    const installNavigationPattern = /if \(!installUrl\) throw new Error\('Invalid Claude connector install URL'\)\s*claudeWindow\.opener = null\s*claudeWindow\.location\.href = installUrl\s*setClaudeActionState\('install-opened'\)\s*return/u;
    const webNavigationPattern = /const webUrl = getSafeClaudeWebUrl\(result\.webUrl\)\s*if \(!webUrl\) throw new Error\('Invalid Claude Web launch URL'\)\s*claudeWindow\.opener = null\s*claudeWindow\.location\.href = webUrl\s*setClaudeActionState\('launched'\)/u;
    const closeOnFailurePattern = /\}\s*catch \{\s*claudeWindow\?\.close\(\)\s*setClaudeActionState\('failed'\)\s*\}\s*\}/u;
    const navigationSinks = [
      ...(activeLaunchSource.match(/\bwindow\.open\s*\(/gu) ?? []),
      ...(activeLaunchSource.match(/\b[A-Za-z_$][\w$]*\.location(?:\.href)?\s*=/gu) ?? []),
      ...(activeLaunchSource.match(/\b[A-Za-z_$][\w$]*\.location\.(?:assign|replace)\s*\(/gu) ?? []),
    ];

    check(
      popupOpenIndex >= 0
        && countOccurrences(activeLaunchSource, "window.open(") === 1
        && popupFailure.every((fragment) => activeLaunchSource.includes(fragment))
        && popupGuardPattern.test(activeLaunchSource)
        && (firstAwaitIndex < 0 || popupOpenIndex < firstAwaitIndex),
      "Active Claude Web start must fail closed when its click-time popup is blocked.",
    );
    check(
      launchRequestIndex >= 0
        && validatedUrlIndex > launchRequestIndex
        && invalidUrlFailureIndex > validatedUrlIndex
        && validatedNavigationIndex > invalidUrlFailureIndex,
      "Active Claude UI start must navigate only with the validated q-prefilled Web URL.",
    );
    check(
      navigationSinks.length === 3
        && countOccurrences(activeLaunchSource, "claudeWindow.location.href = installUrl") === 1
        && countOccurrences(activeLaunchSource, validatedNavigation) === 1
        && countOccurrences(activeLaunchSource, "result.webUrl") === 1
        && countOccurrences(activeLaunchSource, "claudeWindow.opener = null") === 2
        && installNavigationPattern.test(activeLaunchSource)
        && webNavigationPattern.test(activeLaunchSource)
        && closeOnFailurePattern.test(activeLaunchSource),
      "Active Claude Web start must keep its only navigation sinks terminal, opener-isolated and close-on-failure.",
    );
    check(
      !activeLaunchSource.includes("https://claude.ai/new")
        && !/(?:\?\?|\|\|)\s*['"]https:\/\/claude\.ai\/new['"]/u.test(
          activeLaunchSource,
        ),
      "Active Claude UI start must not degrade an invalid q URL to a bare Claude chat.",
    );

    const activeClaudeSurface = `${activeLaunchSource}\n${activeClaudeUiSource}`;
    const forbiddenActiveFallbacks = [
      /navigator\.clipboard|clipboard\.writeText/iu,
      /copyClaudePrompt|handleCopyClaudeFallback|claudePromptCopied/iu,
      /claudeLaunchFallback|fallback-copied/iu,
      /getSafeClaudeDesktopUrl|\.desktopUrl|claude:\/\//iu,
      /<textarea\b|<Copy\b|claudeCopyPrompt/iu,
      /claudeOpenWeb|claudeOpenApp|claudeFallbackHint|claudeClipboardFallbackHint/iu,
      /window\.open\s*\(\s*webUrl/iu,
      /href=\{[^}]*webUrl[^}]*\}/iu,
      /result\s*(?:\.\s*prompt|\[\s*['"]prompt['"]\s*\])/iu,
    ];
    check(
      !activeClaudeSurface.includes("https://claude.ai/new")
        && countOccurrences(activeClaudeUiSource, "<a") === 1
        && activeClaudeUiSource.includes("href={claudeInstallFallbackUrl}")
        && forbiddenActiveFallbacks.every((pattern) => !pattern.test(activeClaudeSurface)),
      "Active Claude UI start must not expose clipboard, textarea, copy, Desktop or manual launch fallbacks.",
    );
  }

  for (const fragment of [
    "assert.equal(promptUrl, `https://claude.ai/new?q=${encodeURIComponent(startPrompt)}`)",
    "assert.deepEqual([...parsedPromptUrl.searchParams.keys()], ['q'])",
    "assert.equal(parsedPromptUrl.searchParams.get('q'), startPrompt)",
    "assert.equal(new URL(launch.webUrl).searchParams.get('q'), launch.prompt)",
    "https://user:password@claude.ai/new?q=prompt",
    "https://claude.ai/new?q=prompt#fragment",
    "https://claude.ai/new?q=prompt&next=https%3A%2F%2Fevil.example",
    "https://claude.ai/new?q=one&q=two",
    "https://claude.ai/new?q=",
    "https://claude.ai/new?q=%20%20%20",
    "assert.equal(launch.desktopUrl, '')",
    "getSafeClaudeDesktopUrl('claude://claude.ai/new')",
    "!promptUrl.toLowerCase().includes(LEARNER_ID.toLowerCase())",
    "!promptUrl.includes(encodeURIComponent(LEARNER_ID))",
  ]) {
    check(
      uiTestSource.includes(fragment),
      `Claude Web-start UI test is missing guard: ${fragment}`,
    );
  }

  return errors;
}

export function validateClaudeWebStartReviewEvidence(reviewerTestPlan, reviewerAccess) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  check(
    /opens exactly `https:\/\/claude\.ai\/new` with one\s+URL-encoded `q` parameter containing the complete start prompt/u.test(
      reviewerTestPlan,
    )
      && reviewerTestPlan.includes("prefills but does not automatically send it")
      && reviewerTestPlan.includes("explicitly select **Send**"),
    "Reviewer test plan must verify the exact q prefill and explicit Send boundary.",
  );
  check(
    reviewerTestPlan.includes("redact it from screenshots and")
      && reviewerTestPlan.includes("recorded browser addresses"),
    "Reviewer test plan must redact the learner session from screenshots and browser addresses.",
  );
  check(
    /targets exactly `https:\/\/claude\.ai\/new` with exactly one non-empty,\s+URL-encoded `q` query parameter containing the complete prepared start\s+prompt/u.test(
      reviewerAccess,
    )
      && reviewerAccess.includes("never auto-sends it")
      && /reviewer explicitly\s+selects \*\*Send\*\*/u.test(reviewerAccess),
    "Reviewer access must describe the exact Web q prefill without auto-send.",
  );
  check(
    reviewerAccess.includes("normal start path uses no manual copy/paste")
      && reviewerAccess.includes("no Claude Desktop launch route"),
    "Reviewer access must keep the normal start free of copy/paste and Desktop routing.",
  );
  check(
    /Treat the complete `q`-bearing Claude Web URL, including its encoded `spc_`\s+value, like a credential\./u.test(
      reviewerAccess,
    )
      && reviewerAccess.includes("Never capture that URL in evidence or screenshots")
      && reviewerAccess.includes("redact the entire browser address bar"),
    "Reviewer evidence must treat the complete q URL, including spc_, as a redacted secret.",
  );

  return errors;
}

export function validateClaudeDistributionDocumentation(concept, implementationPlan) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  check(
    /The Connectors Directory is the preferred one-time installation for Claude\s+Web/u.test(
      concept,
    )
      && /optional companion for Claude Code and\s+Cowork/u.test(concept)
      && /not required for the Claude Web Directory candidate/u.test(concept),
    "Claude concept must define Directory-first Web distribution and the optional Code/Cowork plugin.",
  );
  check(
    /Connectors-Directory-Eintrag als bevorzugte Einmal-Installation für\s+Claude Web/u.test(
      implementationPlan,
    )
      && /optionalen Begleiter für Claude Code und\s+Cowork/u.test(implementationPlan)
      && /keine\s+Voraussetzung des Claude-Web-Kandidaten/u.test(implementationPlan),
    "Claude implementation plan must define Directory-first Web distribution and the optional Code/Cowork plugin.",
  );

  for (const [name, text] of [
    ["concept", concept],
    ["implementation plan", implementationPlan],
  ]) {
    check(
      !/plugin is the preferred one-time installation|Claude plugin is the preferred|plugin is the preferred installation/iu.test(
        text,
      )
        && !/Claude-Plugin als bevorzugte Einmal-Installation|Plugin ist der bevorzugte Einmal-Installationsweg|bevorzugten Plugin-Installationsweg/iu.test(
          text,
        ),
      `Claude ${name} must not describe the optional plugin as the preferred Web installation.`,
    );
  }

  return errors;
}

function verifyImplementation(repositoryRoot, retainedResourceIndex, check) {
  for (const retiredResource of [
    "backend/src/main/resources/claude-connector-v1/connect.html",
    "backend/src/main/resources/claude-connector-v1/connect.js",
    "backend/src/main/resources/claude-connector-v1/id-decrypt.js",
  ]) {
    check(
      !existsSync(safeRepositoryPath(repositoryRoot, retiredResource)),
      `Retired Claude learner-binding resource must be absent: ${retiredResource}`,
    );
  }
  const firstPartyStartRequest = readText(
    repositoryRoot,
    "app/src/coachVariants/claudeV1/request.ts",
  );
  const firstPartyStartCopy = readText(
    repositoryRoot,
    "app/src/coachVariants/claudeV1/copy.ts",
  );
  const firstPartyStartTest = readText(
    repositoryRoot,
    "app/src/coachVariants/claudeV1/claudeV1Start.test.ts",
  );
  const unifiedWebStartAdapter = readText(
    repositoryRoot,
    "app/src/utils/claudeCoach.ts",
  );
  const unifiedWebStartTest = readText(
    repositoryRoot,
    "app/scripts/testClaudeV1StartUi.tsx",
  );
  const sharedSessionSetup = readText(
    repositoryRoot,
    "app/src/components/SessionSetup.tsx",
  );
  const sharedStartApp = readText(repositoryRoot, "app/src/App.tsx");
  const rootRoutePolicy = readText(
    repositoryRoot,
    "app/src/utils/rootRoutePolicy.ts",
  );
  const contract = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/ClaudeV1Contract.java",
  );
  const adapter = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractAdapter.java",
  );
  const metadata = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/oauth/ClaudeV1OAuthMetadataController.java",
  );
  const contractTest = readText(
    repositoryRoot,
    "backend/src/test/java/com/skillpilot/backend/connectors/claude/v1/mcp/ClaudeV1McpContractTest.java",
  );
  const changelogMaster = readText(
    repositoryRoot,
    "backend/src/main/resources/db/changelog/db.changelog-master.yaml",
  );
  const goalVisualizationResource = readText(
    repositoryRoot,
    "backend/src/main/resources/claude-connector-v1/mcp-apps/goal-visualization.html",
  );
  const memoryPracticeResource = readText(
    repositoryRoot,
    "backend/src/main/resources/claude-connector-v1/mcp-apps/memory-card-practice.html",
  );
  const appBuildScript = readText(
    repositoryRoot,
    "ai/claude/app/scripts/build-apps.mjs",
  );
  const appBuildTest = readText(
    repositoryRoot,
    "ai/claude/app/test/build.test.mjs",
  );
  const learningSessionService = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/session/ClaudeV1LearningSessionService.java",
  );
  const sessionTokenCodec = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/session/ClaudeV1SessionTokenCodec.java",
  );
  const firstPartyStartController = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/web/ClaudeV1CoachUiController.java",
  );
  const learningSessionMigration = readText(
    repositoryRoot,
    "backend/src/main/resources/db/changelog/changes/024-replace-claude-v1-binding-with-learning-sessions.yaml",
  );

  for (const error of validateClaudeWebStartImplementation(
    unifiedWebStartAdapter,
    unifiedWebStartTest,
    sharedSessionSetup,
  )) {
    check(false, error);
  }
  check(
    !sharedStartApp.includes("/lernen/claude")
      && !sharedStartApp.includes("ClaudeV1StartView")
      && !rootRoutePolicy.includes("/lernen/claude")
      && !existsSync(safeRepositoryPath(
        repositoryRoot,
        "app/src/views/ClaudeV1StartView.tsx",
      )),
    "The retired standalone Claude start route and view must remain absent.",
  );
  check(
    unifiedWebStartTest.includes(
      "the shared standard start must not depend on a hidden provider query",
    )
      && unifiedWebStartTest.includes(
        "the retired standalone Claude URL must not remain in the application router",
      ),
    "Claude Web-start tests must pin the shared standard root and retired-route absence.",
  );

  for (const fragment of [
    "const LEARNING_SESSION_PATTERN = /^spc_[A-Za-z0-9_-]{43}$/u",
    "const FOREIGN_SESSION_IN_PROMPT_PATTERN = /sps_[A-Za-z0-9_-]{43}/u",
    "/api/ui/learners/${encodeURIComponent(sanitizedId)}/claude/v1/launch",
    "communicationLocale: normalizeConversationLanguage(input.language)",
    "client: input.client ?? 'web-start'",
    "url.origin !== 'https://claude.ai'",
    "prompt.toLowerCase().includes(sanitizedId.toLowerCase())",
  ]) {
    check(
      firstPartyStartRequest.includes(fragment),
      `Claude first-party start request is missing guard: ${fragment}`,
    );
  }
  check(
    /genau 24 Stunden/u.test(firstPartyStartCopy)
      && /exactly 24 hours/u.test(firstPartyStartCopy)
      && !/höchstens 24 Stunden|no more than 24 hours/iu.test(firstPartyStartCopy),
    "Claude start copy must promise the exact 24-hour learner-session lifetime.",
  );
  for (const fragment of [
    "permanent ID stays out of the body",
    "https://claude.ai/new?session=secret",
    "responsePayload({ learningSessionId: SESSION_B })",
    "responsePayload({ prompt: `${promptWithSession()}\\n${LEARNER_ID}` })",
  ]) {
    check(
      firstPartyStartTest.includes(fragment),
      `Claude first-party start test is missing guard: ${fragment}`,
    );
  }
  check(
    learningSessionService.includes("public static final Duration SESSION_TTL = Duration.ofHours(24);")
      && learningSessionService.includes("Instant expiresAt = startedAt.plus(SESSION_TTL);")
      && learningSessionService.includes('!"web-start".equals(request.client())')
      && learningSessionService.includes('learningSessionId: " + learningSessionId'),
    "Claude learning-session service must implement the exact first-party 24-hour launch contract.",
  );
  check(
    sessionTokenCodec.includes('public static final String TOKEN_PREFIX = "spc_";')
      && sessionTokenCodec.includes('Pattern.compile("^spc_[A-Za-z0-9_-]{43}$")')
      && sessionTokenCodec.includes('"SkillPilot\\0ClaudeConnector\\0LearningSession\\0v1\\0"')
      && sessionTokenCodec.includes("HmacSHA256"),
    "Claude learner-session tokens must retain their provider-specific format and HMAC boundary.",
  );
  check(
    firstPartyStartController.includes('@RequestMapping("/api/ui/learners/{skillpilotId}/claude/v1")')
      && firstPartyStartController.includes('@PostMapping("/launch")')
      && firstPartyStartController.includes("CacheControl.noStore()"),
    "Claude first-party launch controller must expose only the no-store launch POST.",
  );
  check(
    learningSessionMigration.includes("id: 024-replace-claude-v1-binding-with-learning-sessions")
      && learningSessionMigration.includes("tableName: claude_v1_learning_session")
      && learningSessionMigration.includes("tableName: claude_v1_session_idempotency")
      && learningSessionMigration.includes("DELETE FROM oauth2_authorization_consent")
      && learningSessionMigration.includes("value: REVOKED"),
    "Claude migration 024 must replace durable learner bindings with revocable 24-hour sessions.",
  );

  const actualTools = [...contract.matchAll(
    /public static final String TOOL_[A-Z_]+\s*=\s*"([^"]+)";/gu,
  )].map((match) => match[1]);
  check(sameSet(actualTools, expectedTools), "Java contract must publish exactly the twelve approved tools.");
  check(actualTools.every((name) => codePointLength(name) <= 64), "Every Claude tool name must contain at most 64 characters.");
  check(
    contract.includes(`"${expectedDocumentationUrl}"`),
    "Java contract must pin the public user-guide URL.",
  );
  for (const fragment of [
    ".title(title)",
    ".annotations(McpSchema.ToolAnnotations.builder()",
    ".readOnlyHint(readOnly)",
    ".destructiveHint(!readOnly)",
    ".idempotentHint(true)",
    ".openWorldHint(false)",
    'schema.put("additionalProperties", false)',
    "buildResourceSpecifications()",
    "resourceSpecifications()",
    "loadRetainedUiResources()",
    "RETAINED_RESOURCE_INDEX_CLASSPATH",
    "MCP_APP_RESOURCE_URI_PREFIX",
    '"visibility", List.of("app")',
  ]) {
    check(adapter.includes(fragment), `MCP adapter is missing contract fragment: ${fragment}`);
  }
  check(
    metadata.includes('"resource_documentation", properties.getPublicDocumentationUrl()'),
    "OAuth resource metadata must point resource_documentation at the user guide.",
  );
  check(
    !metadata.includes('"resource_documentation", properties.getPublicPrivacyUrl()'),
    "OAuth resource_documentation must not point at the privacy page.",
  );
  for (const fragment of [
    "publishesExactlyTheTwelveApprovedTools",
    "everyToolCarriesRealMcpAnnotationsNotMetaHints",
    "readAndWriteToolSetsCoverTheWholeCatalogue",
    "everyWriteToolDemandsConcurrencyAndIdempotencyArguments",
    "solutionReleasingToolsRequireACapability",
    'schemaOf(toolName).get("additionalProperties")',
    "publishesTwoActiveByteAddressedClaudeResourcesWithHostOnlyUiDomainAndPassiveRetention",
    "everyToolRequiresLearningSessionIdIncludingAppOnlyMemoryReview",
  ]) {
    check(contractTest.includes(fragment), `MCP contract test is missing guard: ${fragment}`);
  }
  check(
    contract.includes(
      '"ee8f5203b9b3d186c660c802e340f19c.claudemcpcontent.com"',
    ) && !contract.includes(
      '"https://ee8f5203b9b3d186c660c802e340f19c.claudemcpcontent.com"',
    ),
    "Claude resource ui.domain must be the endpoint-derived host without a URL scheme.",
  );
  check(
    goalVisualizationResource.length > 0
      && memoryPracticeResource.length > 0
      && readdirSync(safeRepositoryPath(
        repositoryRoot,
        "backend/src/main/resources/claude-connector-v1/mcp-apps",
      )).filter((entry) => entry.endsWith(".html")).sort().join(",")
        === "goal-visualization.html,memory-card-practice.html",
    "Claude Connector v1 must package exactly two non-empty MCP Apps UI resources.",
  );
  check(
    retainedResourceIndex?.schemaVersion === 1
      && Array.isArray(retainedResourceIndex.resources),
    "Claude Connector v1 must publish a retained-resource index.",
  );
  const retainedKeys = new Set();
  for (const entry of retainedResourceIndex.resources ?? []) {
    const valid = entry
      && Object.keys(entry).sort().join(",") === "filename,sha256"
      && ["goal-visualization.html", "memory-card-practice.html"].includes(entry.filename)
      && /^[0-9a-f]{64}$/u.test(entry.sha256)
      && !retainedKeys.has(`${entry.sha256}/${entry.filename}`);
    check(valid, "Claude retained-resource index entry has an invalid shape.");
    if (!valid) continue;
    retainedKeys.add(`${entry.sha256}/${entry.filename}`);
    const retainedBytes = readText(
      repositoryRoot,
      `backend/src/main/resources/claude-connector-v1/mcp-apps/retained/sha256-${entry.sha256}/${entry.filename}`,
    );
    check(
      sha256(Buffer.from(retainedBytes, "utf8")) === entry.sha256,
      `Claude retained resource digest changed: ${entry.sha256}/${entry.filename}`,
    );
  }
  for (const fragment of [
    "retainPreviousClasspathResource",
    "materializeRetainedResources",
    "retainedResources.delete",
  ]) {
    check(appBuildScript.includes(fragment), `Claude MCP Apps build lacks retention guard: ${fragment}`);
  }
  check(
    appBuildTest.includes("a changed active UI is retained byte-identically and never rebound to a tool"),
    "Claude MCP Apps tests must protect passive retained-resource continuity.",
  );
  check(
    changelogMaster.includes(
      "file: db/changelog/changes/023-add-claude-connector-v1.yaml",
    ),
    "Liquibase master changelog must include the Claude-v1 migration.",
  );
  check(
    changelogMaster.includes(
      "file: db/changelog/changes/024-replace-claude-v1-binding-with-learning-sessions.yaml",
    ),
    "Liquibase master changelog must include the additive Claude-v1 learning-session migration.",
  );
  return actualTools.length;
}

function verifyDocumentationAndEdge(repositoryRoot, check) {
  const docsIndex = readText(repositoryRoot, "docs/deploy/index.md");
  const mkdocs = readText(repositoryRoot, "mkdocs.yml");
  const guide = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.md");
  const guideDe = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.de.md");
  const runbook = readText(repositoryRoot, "docs/deploy/claude-connector-v1-release.md");
  const concept = readText(repositoryRoot, "docs/deploy/claude-connector-v1-concept.md");
  const implementationPlan = readText(
    repositoryRoot,
    "docs/deploy/claude-connector-v1-implementation-plan.md",
  );
  const reviewerTestPlan = readText(
    repositoryRoot,
    "ai/claude/connector-v1/reviewer-test-plan.md",
  );
  const reviewerAccess = readText(
    repositoryRoot,
    "ai/claude/connector-v1/reviewer-access.template.md",
  );
  const tls = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-connector-v1.conf");
  const acme = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-acme.conf");
  for (const error of validateClaudeWebStartReviewEvidence(
    reviewerTestPlan,
    reviewerAccess,
  )) {
    check(false, error);
  }
  for (const path of [
    "claude-connector-v1-user-guide.md",
    "claude-connector-v1-user-guide.de.md",
    "claude-connector-v1-release.md",
  ]) {
    check(docsIndex.includes(path), `Deployment index must link ${path}.`);
    check(mkdocs.includes(`deploy/${path}`), `MkDocs navigation must include ${path}.`);
  }
  for (const text of [guide, guideDe]) {
    check(text.includes(expectedLearnerStartUrl), "User guides must publish the first-party Claude launch URL.");
    check(text.includes("spc_"), "User guides must explain the opaque learner session.");
    check(/24 (?:hours|Stunden)/u.test(text), "User guides must explain the exact 24-hour lifetime.");
    check(/offline_access/u.test(text), "User guides must separate transport OAuth from learner access.");
    check(
      /Connectors Directory/u.test(text),
      "User guides must name the Connectors Directory as the Claude Web installation path.",
    );
    check(
      /MCP Apps|interaktiven\s+Oberflächen|interactive\s+UIs/u.test(text),
      "User guides must explain that the connector supplies both UIs.",
    );
    check(
      !/(?:select|upload|choose|wähl|hochlad)[^\n]{0,120}\.skillpilot|Lokal entschlüsseln/iu.test(text),
      "User guides must not instruct learners to use the retired ID-file flow.",
    );
  }
  check(
    /not\s+required for Claude Web/u.test(guide),
    "English user guide must state that the optional plugin is not required for Claude Web.",
  );
  check(
    /für Claude Web nicht erforderlich/u.test(guideDe),
    "German user guide must state that the optional plugin is not required for Claude Web.",
  );
  check(runbook.includes("--submission-ready"), "Release runbook must include the strict gate.");
  check(runbook.includes("rollback"), "Release runbook must include rollback guidance.");
  check(
    ["`/connect`", "`/connect/`", "`/connect/details`", "`/connect/bind`"].every(
      (route) => runbook.includes(route),
    ) && /return HTTP 404/u.test(runbook),
    "Release runbook must verify that every retired public binding route returns 404.",
  );
  check(
    concept.includes(expectedLearnerStartUrl)
      && concept.includes("spc_")
      && /exactly 24 hours/u.test(concept)
      && /OAuth contains no learner binding page/u.test(concept)
      && /offline_access/u.test(concept),
    "Claude concept must describe the learner-free OAuth and exact 24-hour first-party session target.",
  );
  check(
    implementationPlan.includes(expectedLearnerStartUrl)
      && implementationPlan.includes("spc_")
      && /exakt 24 Stunden/u.test(implementationPlan)
      && /ID-Datei-\/Binding-Seite ist vollständig verworfen/u.test(implementationPlan)
      && /offline_access/u.test(implementationPlan),
    "Claude implementation plan must supersede the retired binding flow with the exact 24-hour target.",
  );
  for (const error of validateClaudeDistributionDocumentation(
    concept,
    implementationPlan,
  )) {
    check(false, error);
  }
  for (const [name, text] of [
    ["concept", concept],
    ["implementation plan", implementationPlan],
  ]) {
    check(
      !/(?:^|[`\s])\/connect(?:\/|\*|\{|`)/mu.test(text)
        && !/Consent and learner binding/iu.test(text),
      `Claude ${name} must not publish the retired learner-binding route as an active contract.`,
    );
  }
  for (const text of [tls, acme]) {
    check(
      /server_name\s+mcp-claude-v1\.skillpilot\.com;/u.test(text),
      "Claude nginx templates must use the exact dedicated host.",
    );
    check(/location \/\s*\{[\s\S]*?return 404;/u.test(text), "Claude nginx templates must fail closed.");
  }
  check(
    tls.includes("/internal/connectors/claude/v1/mcp"),
    "TLS vhost must proxy only to the internal Claude-v1 route.",
  );
  check(
    !/location\s+(?:=|\^~)\s+\/connect\/?\s*\{/u.test(tls)
      && !tls.includes("/internal/connectors/claude/v1/connect"),
    "Claude vhost must not proxy the retired learner-binding surface.",
  );
  check(!tls.includes("mcp-coach-v1"), "Claude vhost must not alias the frozen OpenAI origin.");
}

function verifyBaseline(repositoryRoot, baseline, check) {
  check(
    /^[0-9a-f]{40}$/u.test(baseline.baseRevision ?? ""),
    "Contract baseline needs a full baseRevision.",
  );
  check(Array.isArray(baseline.trees) && baseline.trees.length > 0, "Contract baseline has no trees.");
  const treePaths = Array.isArray(baseline.trees) ? baseline.trees.map((entry) => entry?.path) : [];
  check(treePaths.length === new Set(treePaths).size, "Contract baseline tree paths must be unique.");
  check(
    sameSet(treePaths, expectedContractTrees),
    "Contract baseline tree inventory is incomplete.",
  );
  check(
    JSON.stringify(treePaths) === JSON.stringify([...treePaths].sort((left, right) => left.localeCompare(right))),
    "Contract baseline tree paths must be sorted.",
  );
  for (const entry of baseline.trees ?? []) {
    check(/^[0-9a-f]{64}$/u.test(entry?.sha256 ?? ""), `Invalid baseline tree digest: ${entry?.path ?? "UNKNOWN"}`);
    try {
      const path = safeRepositoryPath(repositoryRoot, entry.path);
      const stat = lstatSync(path);
      check(stat.isDirectory() && !stat.isSymbolicLink(), `Baseline tree is not a directory: ${entry.path}`);
      check(
        sha256ContractTree(repositoryRoot, entry.path) === entry.sha256,
        `Claude v1 candidate tree changed: ${entry.path}`,
      );
    } catch (error) {
      check(false, `Cannot verify baseline tree ${entry?.path ?? "UNKNOWN"}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  check(Array.isArray(baseline.files) && baseline.files.length > 0, "Contract baseline has no files.");
  const paths = Array.isArray(baseline.files) ? baseline.files.map((entry) => entry?.path) : [];
  check(paths.length === new Set(paths).size, "Contract baseline paths must be unique.");
  check(
    sameSet(paths, expectedContractFiles),
    "Contract baseline file inventory is incomplete.",
  );
  check(
    JSON.stringify(paths) === JSON.stringify([...paths].sort((left, right) => left.localeCompare(right))),
    "Contract baseline paths must be sorted.",
  );
  check(
    /^[0-9a-f]{64}$/u.test(baseline.candidateContractSha256 ?? ""),
    "Contract baseline needs candidateContractSha256.",
  );
  check(
    calculateCandidateContractSha256(
      baseline.files ?? [],
      baseline.trees ?? [],
      baseline.baseRevision,
    ) === baseline.candidateContractSha256,
    "Contract baseline candidateContractSha256 does not match its file inventory.",
  );
  for (const entry of baseline.files ?? []) {
    check(/^[0-9a-f]{64}$/u.test(entry?.sha256 ?? ""), `Invalid baseline digest: ${entry?.path ?? "UNKNOWN"}`);
    try {
      const path = safeRepositoryPath(repositoryRoot, entry.path);
      const stat = lstatSync(path);
      check(stat.isFile() && !stat.isSymbolicLink(), `Baseline path is not a regular file: ${entry.path}`);
      check(sha256(readFileSync(path)) === entry.sha256, `Claude v1 candidate changed: ${entry.path}`);
    } catch (error) {
      check(false, `Cannot verify baseline path ${entry?.path ?? "UNKNOWN"}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

function readJson(repositoryRoot, path) {
  try {
    return JSON.parse(readText(repositoryRoot, path));
  } catch (error) {
    throw new Error(`Cannot parse ${path}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function uniqueSourceRegion(source, startMarker, endMarker) {
  if (typeof source !== "string") return null;
  const start = source.indexOf(startMarker);
  if (start < 0 || source.indexOf(startMarker, start + startMarker.length) >= 0) {
    return null;
  }
  const end = source.indexOf(endMarker, start + startMarker.length);
  if (end < 0 || source.indexOf(endMarker, end + endMarker.length) >= 0) return null;
  return source.slice(start, end);
}

function uniqueClaudeUiRegion(source) {
  const region = uniqueSourceRegion(
    source,
    "data-testid=\"claude-v1-start-options\"",
    "{chatLaunchIssue !== 'none' && (",
  );
  if (region === null) return null;
  const cockpitHref = "href={personalCurriculumReady ? learnerCockpitHref : undefined}";
  const cockpitHrefIndex = region.indexOf(cockpitHref);
  if (
    cockpitHrefIndex < 0
    || region.indexOf(cockpitHref, cockpitHrefIndex + cockpitHref.length) >= 0
  ) {
    return null;
  }
  const cockpitAnchorIndex = region.lastIndexOf("<a", cockpitHrefIndex);
  return cockpitAnchorIndex >= 0 ? region.slice(0, cockpitAnchorIndex) : null;
}

function uniqueFunctionSource(source, declaration) {
  if (typeof source !== "string") return null;
  const code = maskStringsAndComments(source);
  const start = code.indexOf(declaration);
  if (start < 0 || code.indexOf(declaration, start + declaration.length) >= 0) {
    return null;
  }
  const openingBrace = code.indexOf("{", start);
  if (openingBrace < 0) return null;
  let depth = 0;
  for (let index = openingBrace; index < code.length; index += 1) {
    if (code[index] === "{") depth += 1;
    if (code[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  return null;
}

function maskStringsAndComments(source) {
  const masked = source.split("");
  let state = "code";
  for (let index = 0; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];
    if (state === "code") {
      if (char === "/" && next === "/") {
        masked[index] = masked[index + 1] = " ";
        index += 1;
        state = "line-comment";
      } else if (char === "/" && next === "*") {
        masked[index] = masked[index + 1] = " ";
        index += 1;
        state = "block-comment";
      } else if (char === "'" || char === '"' || char === "`") {
        masked[index] = " ";
        state = char;
      }
    } else if (state === "line-comment") {
      if (char === "\n") {
        state = "code";
      } else {
        masked[index] = " ";
      }
    } else if (state === "block-comment") {
      masked[index] = " ";
      if (char === "*" && next === "/") {
        masked[index + 1] = " ";
        index += 1;
        state = "code";
      }
    } else {
      masked[index] = " ";
      if (char === "\\") {
        if (index + 1 < source.length) masked[index + 1] = " ";
        index += 1;
      } else if (char === state) {
        state = "code";
      }
    }
  }
  return masked.join("");
}

function countOccurrences(source, fragment) {
  if (!fragment) return 0;
  let count = 0;
  let offset = 0;
  while (true) {
    const index = source.indexOf(fragment, offset);
    if (index < 0) return count;
    count += 1;
    offset = index + fragment.length;
  }
}

function readText(repositoryRoot, path) {
  const absolute = safeRepositoryPath(repositoryRoot, path);
  if (!existsSync(absolute)) {
    throw new Error(`Missing required Claude release file ${path}.`);
  }
  const stat = lstatSync(absolute);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`Claude release path is not a regular file: ${path}.`);
  }
  return readFileSync(absolute, "utf8");
}

function safeRepositoryPath(repositoryRoot, path) {
  if (typeof path !== "string" || path.length === 0 || isAbsolute(path) || path.includes("\0")) {
    throw new Error(`Invalid repository-relative path: ${String(path)}`);
  }
  const root = resolve(repositoryRoot);
  const absolute = resolve(root, path);
  if (!absolute.startsWith(`${root}${sep}`)) {
    throw new Error(`Repository path escapes root: ${path}`);
  }
  return absolute;
}

function nonBlankWithin(value, maxLength) {
  return typeof value === "string"
    && value.trim().length > 0
    && codePointLength(value) <= maxLength;
}

function isCleanHttpsUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:"
      && url.username === ""
      && url.password === ""
      && url.search === ""
      && url.hash === "";
  } catch {
    return false;
  }
}

function codePointLength(value) {
  return [...value].length;
}

function sameSet(actual, expected) {
  return Array.isArray(actual)
    && actual.length === expected.length
    && new Set(actual).size === actual.length
    && expected.every((entry) => actual.includes(entry));
}

function pngDimensions(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (
    !Buffer.isBuffer(bytes)
    || bytes.length < 24
    || !bytes.subarray(0, 8).equals(signature)
    || bytes.toString("ascii", 12, 16) !== "IHDR"
  ) {
    return null;
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

/**
 * Hashes the repository-relevant files below a Claude contract tree.
 *
 * <p>Contract trees contain local dependency and build directories while they are being tested.
 * Those ignored bytes are neither candidate sources nor reproducible across workstations. Git's
 * cached-plus-untracked inventory includes every candidate source before and after commit while
 * excluding ignored node_modules and generated dist directories.
 */
export function sha256ContractTree(repositoryRoot, treePath) {
  const tree = safeRepositoryPath(repositoryRoot, treePath);
  const treeStat = lstatSync(tree);
  if (!treeStat.isDirectory() || treeStat.isSymbolicLink()) {
    throw new Error(`Contract tree is not a directory: ${treePath}`);
  }

  const inventory = execFileSync(
    "git",
    [
      "-C",
      resolve(repositoryRoot),
      "ls-files",
      "-z",
      "--cached",
      "--others",
      "--exclude-standard",
      "--",
      treePath,
    ],
  )
    .toString("utf8")
    .split("\0")
    .filter(Boolean)
    // The index still lists tracked files deleted by this candidate. Their absence is part of
    // the new tree digest, so only bytes that exist in the working tree contribute records.
    .filter((path) => existsSync(safeRepositoryPath(repositoryRoot, path)))
    .sort((left, right) => left.localeCompare(right));

  if (inventory.length === 0) {
    throw new Error(`Contract tree contains no repository files: ${treePath}`);
  }

  const prefix = `${treePath}/`;
  const records = inventory.map((path) => {
    if (!path.startsWith(prefix)) {
      throw new Error(`Contract inventory escaped tree ${treePath}: ${path}`);
    }
    const absolute = safeRepositoryPath(repositoryRoot, path);
    const stat = lstatSync(absolute);
    if (!stat.isFile() || stat.isSymbolicLink()) {
      throw new Error(`Contract tree contains non-file: ${path}`);
    }
    return `${path.slice(prefix.length)}\0${stat.size}\0${sha256(readFileSync(absolute))}\n`;
  });
  return sha256(Buffer.from(records.join(""), "utf8"));
}

export function calculateCandidateContractSha256(
  files,
  trees = [],
  baseRevision = "",
) {
  const records = [
    `base:${baseRevision}\n`,
    ...files.map((entry) => ({ ...entry, kind: "file" })),
    ...trees.map((entry) => ({ ...entry, kind: "tree" })),
  ]
    .map((entry) => typeof entry === "string"
      ? entry
      : `${entry.kind}:${entry.path}\0${entry.sha256}\n`)
    .sort((left, right) => left.localeCompare(right))
    .join("");
  return sha256(Buffer.from(records, "utf8"));
}

const invokedPath = process.argv[1]
  ? pathToFileURL(resolve(process.argv[1])).href
  : "";
if (invokedPath === import.meta.url) {
  const submissionReady = process.argv.slice(2).includes("--submission-ready");
  const unknownArguments = process.argv.slice(2).filter(
    (argument) => argument !== "--submission-ready",
  );
  if (unknownArguments.length > 0) {
    console.error(`Unknown argument(s): ${unknownArguments.join(", ")}`);
    process.exitCode = 2;
  } else {
    const result = verifyClaudeConnectorV1Release({ submissionReady });
    if (result.errors.length > 0) {
      console.error(
        `CHECK claude_connector_v1_release FAIL mode=${submissionReady ? "submission-ready" : "pre-submission"}`,
      );
      for (const error of result.errors) {
        console.error(`ERROR ${error}`);
      }
      if (result.blockers.length > 0) {
        console.error("SUBMISSION_BLOCKED pending release gates:");
        for (const blocker of result.blockers) {
          console.error(`- ${blocker}`);
        }
      }
      process.exitCode = 1;
    } else {
      console.log(
        `CHECK claude_connector_v1_release STRUCTURAL_PASS state=${result.publicationStatus} `
          + `tools=${result.toolCount} required_gates=${result.requiredGateCount} `
          + `required_pending=${result.requiredPendingCount}`,
      );
      if (result.blockers.length > 0) {
        console.log("SUBMISSION_BLOCKED pending release gates:");
        for (const blocker of result.blockers) {
          console.log(`- ${blocker}`);
        }
      }
    }
  }
}
