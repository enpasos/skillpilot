import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  readdirSync,
  readFileSync,
} from "node:fs";
import { dirname, isAbsolute, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

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
const pluginEvidencePath =
  "ai/claude/plugin/skillpilot-coach-v1/release/evidence-manifest.json";
// Gates whose test is the same server check as a plugin gate use the plugin
// record instead of a copy of their own (Product Owner, 28 November 2026).
const sharedEvidencePrefix = "plugin:";
const expectedCandidateSource = "https://skillpilot.com/version.json";
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedBaseUrl = "https://mcp-claude-v1.skillpilot.com";
const expectedDocumentationUrl =
  "https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/";
const expectedPrivacyUrl = `${expectedBaseUrl}/privacy`;
const expectedLearnerStartUrl = "https://skillpilot.com/";
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

const expectedRequiredGates = [
  "ci-green-for-submitted-commit",
  "public-docs-online",
  "public-edge-and-oauth",
  "hosted-claude-all-fourteen-tools-two-apps",
  "automated-coach-web-ui-e2e",
  "negative-and-replay-cases",
  "first-party-24h-learning-session",
  "permanent-id-and-id-file-nondisclosure",
  "oauth-session-separation",
  "reviewer-account-and-reset",
  "privacy-and-legal-approval",
  "support-and-security-owner",
  "listing-and-permanent-slug-approval",
  "icon-rights-and-portal-asset",
  "mcp-app-carousel",
  "developer-portal-submitter-access",
  "portal-compliance-acknowledgements",
];

// Optional gates and the only status each may have: not_required for a
// capability the candidate does not claim, recommended for internal operations
// practice that blocks no submission.
const expectedOptionalGates = new Map([
  ["claude-code-client", "not_required"],
  ["allowed-link-uris", "not_required"],
  ["rollback-drill", "recommended"],
  ["load-and-latency", "recommended"],
]);

const sharedPluginEvidence = new Map([
  ["hosted-claude-all-fourteen-tools-two-apps", "remote-mcp-contract-final-plugin-candidate"],
  ["automated-coach-web-ui-e2e", "automated-coach-web-ui-e2e-final-candidate"],
  ["negative-and-replay-cases", "negative-replay-origin-redaction-final-plugin-candidate"],
  ["first-party-24h-learning-session", "first-party-session-final-plugin-candidate"],
  ["permanent-id-and-id-file-nondisclosure", "permanent-id-nondisclosure-final-plugin-candidate"],
  ["oauth-session-separation", "oauth-session-separation-final-plugin-candidate"],
]);

const forbiddenDistributionClaimPatterns = [
  {
    label: "Claude Free availability",
    patterns: [
      /\b(?:the\s+)?(?:public\s+)?(?:SkillPilot\s+)?plugin(?:\s+package)?\s+(?:is|will be)\s+(?:now\s+)?available\s+(?:on|in|for)\s+Claude Free\b/iu,
      /\b(?:Das\s+)?(?:öffentliche\s+)?(?:SkillPilot-)?Plugin(?:-Paket)?\s+(?:ist|wird)\s+(?:jetzt\s+)?(?:in|auf|für)\s+Claude Free\s+(?:verfügbar|unterstützt|nutzbar)\b/iu,
    ],
  },
  {
    label: "native-mobile plugin support",
    patterns: [
      /\b(?:the\s+)?(?:public\s+)?(?:SkillPilot\s+)?plugin(?:\s+package)?\s+(?:claims|supports|provides|offers|includes)\b[^.\n]{0,80}\bnative[- ]mobile(?:[- ]plugin)? support\b/iu,
      /\b(?:Das\s+)?(?:öffentliche\s+)?(?:SkillPilot-)?Plugin(?:-Paket)?\s+(?:beansprucht|unterstützt|bietet)\b[^.\n]{0,80}\bnative(?:[- ]mobile)?(?:\s+Plugin-Unterstützung|[- ]Plugin-Unterstützung|\s+Nutzung des Plugins auf Mobilgeräten)\b/iu,
    ],
  },
  {
    label: "prohibition of same-server plugin and Directory coexistence",
    patterns: [
      /\bPlugin and Directory(?:\s+(?:connector\s+)?installations?|\s+entries?)?\s+(?:must|can|may)\s+never\s+(?:coexist|be enabled together)\b/iu,
      /\bPlugin und Directory(?:-Installation|-Eintrag)?(?:en)?\s+dürfen\s+niemals\s+(?:koexistieren|gleichzeitig bestehen|gemeinsam aktiviert werden)\b/iu,
    ],
  },
  {
    label: "plugin ownership of connector tools or UI",
    patterns: [
      /(?:^|[.!?]\s+)\s*(?:The\s+)?(?:public\s+)?(?:SkillPilot\s+)?plugin(?:\s+shell)?\s+(?:owns|supplies|implements|duplicates|provides)\b[^.\n]{0,120}\b(?:MCP\s+)?(?:tools?|Apps?|UIs?|UI resources?)\b/imu,
      /(?:^|[.!?]\s+)\s*(?:Das|Die)\s+(?:öffentliche\s+)?(?:SkillPilot-)?Plugin(?:-Shell)?\s+(?:besitzt|liefert|implementiert|dupliziert|stellt)\b[^.\n]{0,120}\b(?:Tools?|Werkzeuge|MCP Apps?|UIs?|UI-Ressourcen|Oberflächen)\b/imu,
    ],
  },
];
const forbiddenPluginSurfaceClaims = [
  {
    label: "Claude Desktop Chat plugin support",
    surfacePattern: /\b(?:Claude\s+)?Desktop(?:\s+|[-‐‑–—]\s*)Chat\b/iu,
  },
  {
    label: "Claude Cowork plugin support",
    surfacePattern: /\b(?:Claude\s+)?Cowork\b/iu,
  },
  {
    label: "public Claude Code plugin support",
    surfacePattern: /\b(?:public\s+|öffentlich(?:es|en|er|e)\s+)?Claude Code\b/iu,
  },
];
const pluginClaimSubjectPattern = /\b(?:(?:the|das|der|die)\s+(?:(?:public|öffentlich(?:e|en|er|es)?)\s+)?(?:SkillPilot[-\s]+)?plugin(?:[-\s]+(?:package|shell|Paket))?|(?:public|öffentlich(?:e|en|er|es)?)\s+(?:SkillPilot[-\s]+)?plugin(?:[-\s]+(?:package|shell|Paket))?|SkillPilot[-\s]+(?:plugin(?:[-\s]+(?:package|shell|Paket))?|coach(?:ing)?(?:[-\s]+v1)?[-\s]+skill|coaching[-\s]+skill|coach[-\s]+v1))\b/iu;
const positivePluginClaimPattern = /\b(?:supports?|provides?|offers?|includes?|works?|runs?|enables?|covers?|ships?|bundles?|can|may|will|would|could|(?:is|are)\s+(?:not\s+)?(?:now\s+)?(?:available|supported|usable|compatible|intended)|(?:is\s+)?(?:the\s+)?preferred\s+complete\s+installation|unterstützt|bietet|liefert|enthält|funktioniert|läuft|ermöglicht|deckt|kann|könnte|wird|soll|ist\s+(?:nicht\s+)?(?:jetzt\s+)?(?:verfügbar|unterstützt|nutzbar|kompatibel|vorgesehen)|(?:ist\s+)?(?:die\s+)?bevorzugte\s+vollständige\s+Installation)\b/iu;
const explicitClaimNegationPattern = /\b(?:not|no|neither|nor|without|never|(?:does|do|is|are|can|will|would|should|must)n['’]t|nicht|kein(?:e|en|em|er|es)?|weder|noch|ohne|niemals)\b/iu;
const nonNegatingExpansionPattern = /\b(?:not\s+only|nicht\s+nur)\b/iu;
const explicitNegativeClaimPattern = /\b(?:makes?|has)\s+no\s+claim\b|\bdoes\s+not\s+claim\b|\bclaims?\s+neither\b|\b(?:macht|enthält|erhebt)\s+kein(?:e|en|em|er|es)?\s+(?:Aussage|Behauptung|Anspruch)\b|\bbeansprucht\s+(?:nicht|weder)\b|\bsagt\s+kein(?:e|en|em|er|es)?\b[^.!?;]{0,40}\bzu\b/iu;
const claimClauseBoundaryPattern = /\s+(?:but|however|whereas|yet|aber|jedoch|hingegen|sondern)\s+/iu;

function containsPositivePluginSurfaceClaim(text, surfacePattern) {
  const normalizedText = text.replace(/\s+/gu, " ");
  const sentences = normalizedText.split(/(?<=[.!?;])\s+/u);

  for (const sentence of sentences) {
    const sentenceHasSubject = pluginClaimSubjectPattern.test(sentence);
    for (const clause of sentence.split(claimClauseBoundaryPattern)) {
      if (!sentenceHasSubject && !pluginClaimSubjectPattern.test(clause)) continue;
      const predicates = allMatches(positivePluginClaimPattern, clause);
      if (predicates.length === 0) continue;

      for (const surface of allMatches(surfacePattern, clause)) {
        if (explicitNegativeClaimPattern.test(clause.slice(0, surface.index))) continue;
        const predicate = predicates.reduce((nearest, candidate) => (
          Math.abs(candidate.index - surface.index) < Math.abs(nearest.index - surface.index)
            ? candidate
            : nearest
        ));
        const claimStart = Math.max(0, Math.min(predicate.index, surface.index) - 18);
        const claimEnd = Math.max(
          predicate.index + predicate[0].length,
          surface.index + surface[0].length,
        );
        const claimFragment = clause.slice(claimStart, claimEnd);
        const isNegated = explicitClaimNegationPattern.test(claimFragment)
          && !nonNegatingExpansionPattern.test(claimFragment);
        if (!isNegated) return true;
      }
    }
  }

  return false;
}

function allMatches(pattern, value) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...value.matchAll(new RegExp(pattern.source, flags))];
}

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
  let pluginEvidence;
  const notes = [];
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
    pluginEvidence = readJson(repositoryRoot, pluginEvidencePath);
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : String(error)],
      blockers,
      notes,
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
    notes,
  }));
  const toolCount = verifyImplementation(repositoryRoot, retainedResourceIndex, check);
  verifyDocumentationAndEdge(repositoryRoot, check);
  verifyHistoricalBaseline(baseline, check);
  verifyRepositoryEvidence(repositoryRoot, evidence, check);

  const stateResult = validateClaudeReleaseState({
    listing,
    gates,
    lifecycle,
    evidence,
    pluginEvidence,
    submissionReady,
  });
  errors.push(...stateResult.errors);
  blockers.push(...stateResult.blockers);

  return {
    errors,
    blockers,
    notes,
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
  pluginEvidence = null,
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
  const pluginEntries = Array.isArray(pluginEvidence?.entries) ? pluginEvidence.entries : [];
  const pluginEvidenceById = new Map(pluginEntries.map((entry) => [entry?.id, entry]));
  const resolveEvidence = (reference) => (
    typeof reference === "string" && reference.startsWith(sharedEvidencePrefix)
      ? pluginEvidenceById.get(reference.slice(sharedEvidencePrefix.length))
      : evidenceById.get(reference)
  );

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
      [...expectedOptionalGates.keys()],
    ),
    "Optional release gate inventory changed without updating the checker.",
  );
  for (const gate of gateList) {
    check(typeof gate?.required === "boolean", `Gate ${gate?.id ?? "UNKNOWN"} needs a boolean required flag.`);
    check(Array.isArray(gate?.evidence), `Gate ${gate?.id ?? "UNKNOWN"} needs an evidence-ID array.`);
    const references = Array.isArray(gate?.evidence) ? gate.evidence : [];
    check(
      references.every((entry) => nonBlankWithin(entry, 200))
        && new Set(references).size === references.length,
      `Gate ${gate?.id ?? "UNKNOWN"} evidence IDs must be non-empty and unique.`,
    );
    if (gate?.required === true) {
      check(
        ["pass", "pending", "blocked"].includes(gate.status),
        `Required gate ${gate.id} must be pass, pending or blocked.`,
      );
    } else {
      check(
        gate?.status === expectedOptionalGates.get(gate?.id),
        `Optional gate ${gate?.id} must be ${String(expectedOptionalGates.get(gate?.id))}.`,
      );
    }
    const sharedRecord = sharedPluginEvidence.get(gate?.id);
    if (sharedRecord) {
      check(
        sameSet(references, [`${sharedEvidencePrefix}${sharedRecord}`]),
        `Gate ${gate.id} must use the shared plugin record ${sharedRecord}.`,
      );
    }
    for (const reference of references) {
      if (reference.startsWith(sharedEvidencePrefix)) {
        check(
          sharedRecord !== undefined,
          `Gate ${gate?.id ?? "UNKNOWN"} has no shared plugin record.`,
        );
        check(
          pluginEvidenceById.has(reference.slice(sharedEvidencePrefix.length)),
          `Gate ${gate?.id ?? "UNKNOWN"} references unknown plugin evidence ${reference}.`,
        );
        continue;
      }
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
        const entry = resolveEvidence(reference);
        check(entry?.status === "approved", `Passing gate ${gate.id} has unapproved evidence ${reference}.`);
        check(
          /^[0-9a-f]{40}$/u.test(entry?.candidateRevision ?? ""),
          `Passing gate ${gate.id} evidence ${reference} must name the commit it was made with.`,
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
      !String(entry?.id ?? "").startsWith(sharedEvidencePrefix),
      `Evidence ${entry?.id ?? "UNKNOWN"} must not use the shared plugin prefix.`,
    );
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
        || entry?.candidateContractSha256 === undefined
        || /^[0-9a-f]{64}$/u.test(entry?.candidateContractSha256),
      `Evidence ${entry?.id ?? "UNKNOWN"} has a malformed candidate digest.`,
    );
    if (["recorded", "approved"].includes(entry?.status)) {
      check(nonBlankWithin(entry.externalEvidenceId, 500), `Evidence ${entry.id} needs an external ID.`);
      check(/^[0-9a-f]{64}$/u.test(entry.sha256 ?? ""), `Evidence ${entry.id} needs a SHA-256 digest.`);
      check(
        /^[0-9a-f]{40}$/u.test(entry.candidateRevision ?? ""),
        `Evidence ${entry.id} needs the commit it was made with (candidateRevision).`,
      );
    }
    if (entry?.status === "approved") {
      check(nonBlankWithin(entry.approvedBy, 200), `Evidence ${entry.id} needs an approver.`);
      check(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}Z)?$/u.test(entry.approvedAt ?? ""), `Evidence ${entry.id} needs approvedAt.`);
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
    lifecycle?.candidate?.source === expectedCandidateSource
      && lifecycle?.candidate?.decidedAt === "2026-11-28"
      && lifecycle?.candidate?.decidedBy === "product-owner"
      && nonBlankWithin(lifecycle?.candidate?.definition, 1_000),
    "Lifecycle must define the connector candidate as the commit production runs at submission.",
  );
  check(
    Array.isArray(lifecycle?.productOwnerReleaseDecisions)
      && lifecycle.productOwnerReleaseDecisions.some((decision) => (
        decision?.approvedAt === "2026-11-28"
          && decision?.approvedBy === "product-owner"
          && nonBlankWithin(decision?.scope, 2_000)
      )),
    "Lifecycle must record the 2026-11-28 Product Owner release decision.",
  );
  check(
    lifecycle?.breakingChangeProcessAppliesAfter === "submission",
    "Breaking-change process must begin with the submission.",
  );
  check(
    ["pre_submission_candidate_rebuild", "submitted", "published"].includes(
      lifecycle?.majorLines?.[0]?.status,
    ),
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
  const expectedMajorStatus = {
    PRE_SUBMISSION: "pre_submission_candidate_rebuild",
    READY_FOR_SUBMISSION: "pre_submission_candidate_rebuild",
    SUBMITTED: "submitted",
    PUBLISHED: "published",
  }[state];
  if (expectedMajorStatus) {
    check(
      lifecycle?.majorLines?.[0]?.status === expectedMajorStatus,
      `${state} requires major-v1 status ${expectedMajorStatus}.`,
    );
  }
  if (state === "PRE_SUBMISSION") {
    check(gates?.submissionReady === false, "PRE_SUBMISSION must keep submissionReady=false.");
  } else if (["READY_FOR_SUBMISSION", "SUBMITTED", "PUBLISHED"].includes(state)) {
    check(gates?.submissionReady === true, `${state} requires submissionReady=true.`);
    check(requiredPending.length === 0, `${state} requires every required gate to pass.`);
    check(lifecycle?.directoryIdentity?.slugApproved === true, `${state} requires slugApproved=true.`);
  }

  if (["SUBMITTED", "PUBLISHED"].includes(state)) {
    verifyLifecycleEvidence("submissionEvidenceId", "SUBMITTED", lifecycle, evidenceById, check);
  }
  if (state === "PUBLISHED") {
    verifyLifecycleEvidence("publicationEvidenceId", "PUBLISHED", lifecycle, evidenceById, check);
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
    Array.isArray(entry.lifecycleStates)
      && entry.lifecycleStates.includes(lifecycleState),
    `${field} evidence is not bound to ${lifecycleState}.`,
  );
  check(
    /^[0-9a-f]{40}$/u.test(entry.candidateRevision ?? ""),
    `${field} evidence needs the commit production ran (candidateRevision).`,
  );
}

export function validateMcpAppCarousel({
  repositoryRoot = defaultRepositoryRoot,
  manifest,
  appManifest,
  submissionReady = false,
  notes = [],
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
      // The screenshots show the app as it was captured. A later build of the
      // app does not invalidate them; the carousel approval decides whether to
      // capture again before submission.
      if (sha256(resourceBytes) !== resource.sha256) {
        notes.push(`Carousel ${label} was captured from an earlier build of its MCP App; capture again before submission if the app looks different.`);
      }
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

export function validateClaudeDistributionClaimSafety(...documents) {
  const publishedText = documents
    .filter((document) => typeof document === "string")
    .join("\n");
  const errors = [];

  for (const { label, patterns } of forbiddenDistributionClaimPatterns) {
    if (patterns.some((pattern) => pattern.test(publishedText))) {
      errors.push(
        `Claude distribution documentation contains a forbidden contradictory claim: ${label}.`,
      );
    }
  }
  for (const { label, surfacePattern } of forbiddenPluginSurfaceClaims) {
    if (containsPositivePluginSurfaceClaim(publishedText, surfacePattern)) {
      errors.push(
        `Claude distribution documentation contains a forbidden contradictory claim: ${label}.`,
      );
    }
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
  // The listing promises fourteen tools. The backend contract tests in CI pin
  // the catalogue itself; this only keeps the listing and the code in step.
  const contract = readText(
    repositoryRoot,
    "backend/src/main/java/com/skillpilot/backend/connectors/claude/v1/ClaudeV1Contract.java",
  );
  const actualTools = [...contract.matchAll(
    /public static final String TOOL_[A-Z_]+\s*=\s*"([^"]+)";/gu,
  )].map((match) => match[1]);
  check(sameSet(actualTools, expectedTools), "Java contract must publish exactly the fourteen approved tools.");
  check(actualTools.every((name) => codePointLength(name) <= 64), "Every Claude tool name must contain at most 64 characters.");

  const mcpAppsRoot = "backend/src/main/resources/claude-connector-v1/mcp-apps";
  check(
    readdirSync(safeRepositoryPath(repositoryRoot, mcpAppsRoot))
      .filter((entry) => entry.endsWith(".html")).sort().join(",")
      === "goal-visualization.html,memory-card-practice.html"
      && ["goal-visualization.html", "memory-card-practice.html"].every(
        (name) => readText(repositoryRoot, `${mcpAppsRoot}/${name}`).length > 0,
      ),
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
      `${mcpAppsRoot}/retained/sha256-${entry.sha256}/${entry.filename}`,
    );
    check(
      sha256(Buffer.from(retainedBytes, "utf8")) === entry.sha256,
      `Claude retained resource digest changed: ${entry.sha256}/${entry.filename}`,
    );
  }
  return actualTools.length;
}

function verifyDocumentationAndEdge(repositoryRoot, check) {
  const connectorReadme = readText(repositoryRoot, "ai/claude/connector-v1/README.md");
  const guide = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.md");
  const guideDe = readText(repositoryRoot, "docs/deploy/claude-connector-v1-user-guide.de.md");
  const runbook = readText(repositoryRoot, "docs/deploy/claude-connector-v1-release.md");
  const tls = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-connector-v1.conf");
  const acme = readText(repositoryRoot, "deploy/nginx/skillpilot-claude-acme.conf");
  for (const error of validateClaudeDistributionClaimSafety(
    connectorReadme,
    guide,
    guideDe,
    runbook,
  )) {
    check(false, error);
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
  check(!tls.includes("mcp-coach-v1"), "Claude vhost must not alias the OpenAI origin.");
}

// The baseline of 28 September 2026 is a historical record, not a freeze: the
// connector candidate is the commit production runs at submission (Product
// Owner, 28 November 2026). The file stays byte-identical because the plugin
// candidate digest names it, so only its own consistency is checked here.
function verifyHistoricalBaseline(baseline, check) {
  check(
    /^[0-9a-f]{40}$/u.test(baseline.baseRevision ?? ""),
    "Historical contract baseline needs a full baseRevision.",
  );
  check(
    Array.isArray(baseline.files) && baseline.files.length > 0
      && Array.isArray(baseline.trees) && baseline.trees.length > 0,
    "Historical contract baseline needs its files and trees.",
  );
  check(
    /^[0-9a-f]{64}$/u.test(baseline.candidateContractSha256 ?? "")
      && calculateCandidateContractSha256(
        baseline.files ?? [],
        baseline.trees ?? [],
        baseline.baseRevision,
      ) === baseline.candidateContractSha256,
    "Historical contract baseline candidateContractSha256 does not match its inventory.",
  );
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
    .sort(compareCodeUnits)
    .join("");
  return sha256(Buffer.from(records, "utf8"));
}

function compareCodeUnits(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
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
      for (const note of result.notes) {
        console.log(`NOTE ${note}`);
      }
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
