import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  sha256Tree,
  verifyOpenAiPluginReviewFreeze,
} from "./check_openai_plugin_review_freeze.mjs";

const defaultRepositoryRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "..",
);

const dossierRoot = "ai/claude/connector-v1";
const retainedResourceIndexPath =
  "backend/src/main/resources/claude-connector-v1/mcp-apps/retained-resources.json";
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedBaseUrl = "https://mcp-claude-v1.skillpilot.com";
const expectedDocumentationUrl =
  "https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/";
const expectedPrivacyUrl = `${expectedBaseUrl}/privacy`;
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
  "reviewer-account-and-reset",
  "privacy-and-legal-approval",
  "support-and-security-owner",
  "load-latency-and-log-redaction",
  "rollback-drill",
  "listing-and-permanent-slug-approval",
  "icon-rights-and-portal-asset",
  "team-enterprise-directory-access",
  "portal-compliance-acknowledgements",
];

const expectedOptionalGates = [
  "claude-code-client",
  "mcp-app-carousel",
  "allowed-link-uris",
];

const expectedContractTrees = [
  "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1",
  "backend/src/main/resources/claude-connector-v1",
];

const expectedContractFiles = [
  "ai/claude/connector-v1/assets/icon-512.png",
  "ai/claude/connector-v1/directory-listing.json",
  "ai/claude/connector-v1/reviewer-test-plan.md",
  "backend/src/main/resources/db/changelog/changes/023-add-claude-connector-v1.yaml",
  "deploy/nginx/skillpilot-claude-acme.conf",
  "deploy/nginx/skillpilot-claude-connector-v1.conf",
  "docs/deploy/claude-connector-v1-release.md",
  "docs/deploy/claude-connector-v1-user-guide.de.md",
  "docs/deploy/claude-connector-v1-user-guide.md",
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
  } else if (["READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(state)) {
    check(gates?.submissionReady === true, `${state} requires submissionReady=true.`);
    check(requiredPending.length === 0, `${state} requires every required gate to pass.`);
    check(
      baseline?.state === "FROZEN_FOR_SUBMISSION",
      `${state} requires a FROZEN_FOR_SUBMISSION contract baseline.`,
    );
    check(lifecycle?.directoryIdentity?.slugApproved === true, `${state} requires slugApproved=true.`);
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

function verifyImplementation(repositoryRoot, retainedResourceIndex, check) {
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
    "memoryReviewSchemaIsAppOnlyAndAcceptsNoSessionIdentifier",
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
  return actualTools.length;
}

function verifyDocumentationAndEdge(repositoryRoot, check) {
  const docsIndex = readText(repositoryRoot, "docs/deploy/index.md");
  const mkdocs = readText(repositoryRoot, "mkdocs.yml");
  const guide = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.md");
  const guideDe = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.de.md");
  const runbook = readText(repositoryRoot, "docs/deploy/claude-connector-v1-release.md");
  const tls = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-connector-v1.conf");
  const acme = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-acme.conf");
  for (const path of [
    "claude-connector-v1-user-guide.md",
    "claude-connector-v1-user-guide.de.md",
    "claude-connector-v1-release.md",
  ]) {
    check(docsIndex.includes(path), `Deployment index must link ${path}.`);
    check(mkdocs.includes(`deploy/${path}`), `MkDocs navigation must include ${path}.`);
  }
  for (const text of [guide, guideDe]) {
    check(text.includes(expectedEndpoint), "User guides must publish the exact MCP endpoint.");
    check(text.includes(".skillpilot"), "User guides must explain the encrypted ID file.");
  }
  check(runbook.includes("--submission-ready"), "Release runbook must include the strict gate.");
  check(runbook.includes("rollback"), "Release runbook must include rollback guidance.");
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
      check(sha256Tree(path) === entry.sha256, `Claude v1 candidate tree changed: ${entry.path}`);
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

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
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
