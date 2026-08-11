export type SkillPilotStartLocale = "de" | "en";

export type SkillPilotStartPurpose = "START" | "RENEW_EXISTING";

export type SkillPilotStartStatus =
  | "ID_REQUIRED"
  | "MAJOR_UPGRADE_REQUIRED"
  | "TEMPORARILY_UNAVAILABLE";

export type SkillPilotSupportLifecycle =
  | "CURRENT"
  | "SUPPORTED"
  | "DEPRECATED"
  | "RETIRED";

export type SkillPilotPublicationStatus =
  | "DRAFT"
  | "PUBLISHED"
  | "UNPUBLISHED";

export type SkillPilotNewSessionPolicy = "ALLOW" | "WARN" | "BLOCK";

export type SkillPilotSuccessor = {
  contractMajor: number;
  displayName: string;
  handoffUrl: string;
};

export type SkillPilotContractLine = {
  contractMajor: 1;
  policyRevision: number;
  displayName: "SkillPilot Coach v1";
  supportLifecycle: SkillPilotSupportLifecycle;
  publicationStatus: SkillPilotPublicationStatus;
  newSessionPolicy: SkillPilotNewSessionPolicy;
  successor: SkillPilotSuccessor | null;
};

export type SkillPilotStartOpenResult = {
  purpose: SkillPilotStartPurpose;
  communicationLocale: SkillPilotStartLocale;
  status: SkillPilotStartStatus;
  supportedLocales: ["de", "en"];
  fallbackUrl: typeof SKILLPILOT_FALLBACK_URL;
  contractLine: SkillPilotContractLine;
  defaultLocale: SkillPilotStartLocale;
};

export type SkillPilotCapabilityArguments = {
  providerNoticeVersion: typeof PROVIDER_NOTICE_VERSION;
  providerEligibilityConfirmed: true;
  sourceMajorDecision?: "START_CURRENT_MAJOR";
};

export type SkillPilotIdentityMode = "CREATE" | "EXISTING";

export type SkillPilotStartCapability = {
  setupCapability: string;
  expiresAt: string;
  contractMajor: 1;
  policyRevision: number;
  providerNoticeVersion: typeof PROVIDER_NOTICE_VERSION;
  sourceMajorDecision: "ALLOW_CURRENT_MAJOR" | "START_CURRENT_MAJOR";
};

export type SkillPilotBootstrapBody = {
  schemaVersion: 1;
  identityMode: SkillPilotIdentityMode;
  skillpilotId?: string;
  communicationLocale: SkillPilotStartLocale;
  launchIntent: { type: "CURRENT_UNIT" };
  providerNoticeVersion: typeof PROVIDER_NOTICE_VERSION;
  clientRequestId: string;
};

export type SkillPilotBootstrapRequest = {
  endpoint: typeof SKILLPILOT_BOOTSTRAP_URL;
  setupCapability: string;
  capabilityExpiresAtMs: number;
  body: SkillPilotBootstrapBody;
};

export type SkillPilotLaunchResult = {
  schemaVersion: 1;
  status: "SESSION_CREATED";
  communicationLocale: SkillPilotStartLocale;
  expiresAt: string;
  /** Opaque host handoff. Never render, log, copy, or reconstruct this value. */
  startMessage: string;
  /** CREATE-only recovery value. Keep solely in component memory and local DOM. */
  createdSkillpilotId?: string;
};

export type SkillPilotSetupRequiredAction =
  | "setCurriculum"
  | "setPersonalization";

export type SkillPilotSetupToolName =
  | "get_skillpilot_context"
  | "get_skillpilot_navigation"
  | "set_skillpilot_curriculum"
  | "set_skillpilot_personalization";

export type SkillPilotCurriculumCatalogCategory = "SCHOOL" | "UNI" | "OTHER";

export type SkillPilotCurriculumQualityStatus = "green" | "orange" | "red";

export type SkillPilotSetupOption = {
  id: string;
  label: string;
  description?: string;
  category?: SkillPilotCurriculumCatalogCategory;
  qualityStatus?: SkillPilotCurriculumQualityStatus;
  sortRank?: number;
};

export type SkillPilotSetupDecision = {
  stageLabel: string;
  groupLabel: string;
  minSelections: number;
  maxSelections: number;
  selectedCount: number;
};

export type SkillPilotCurriculumSummary = {
  curriculumId: string;
  title?: string;
  subject?: string;
};

export type SkillPilotPersonalizationDecision = {
  rewindId?: string;
  stageLabel: string;
  groupLabel: string;
  selectedLabels: string[];
};

export type SkillPilotPersonalizationHistory = {
  schemaVersion: 1;
  currentDecision?: SkillPilotPersonalizationDecision;
  completedDecisions: SkillPilotPersonalizationDecision[];
  preservedDecisions: SkillPilotPersonalizationDecision[];
};

export type SkillPilotSetupState = {
  stateVersion: number;
  communicationLocale: SkillPilotStartLocale;
  requiredAction: SkillPilotSetupRequiredAction | null;
  options: SkillPilotSetupOption[];
  curriculum?: SkillPilotCurriculumSummary;
  personalizationHistory?: SkillPilotPersonalizationHistory;
  decision?: SkillPilotSetupDecision;
};

export type SkillPilotSetupToolCall = {
  name: SkillPilotSetupToolName;
  arguments: Record<string, unknown>;
};

export type SkillPilotBootstrapErrorStatus =
  | "START_NOT_AUTHORIZED"
  | "START_UNAVAILABLE"
  | "IDEMPOTENCY_KEY_REUSED"
  | "PROFILE_UNAVAILABLE"
  | "RETRY_EXPIRED"
  | "DELIVERY_EXPIRED"
  | "TEMPORARILY_UNAVAILABLE"
  | "INVALID_REQUEST";

export class SkillPilotBootstrapHttpError extends Error {
  constructor(
    public readonly status: SkillPilotBootstrapErrorStatus,
    public readonly retryable: boolean
  ) {
    super("skillpilot-bootstrap-http-error");
    this.name = "SkillPilotBootstrapHttpError";
  }
}

export const PROVIDER_NOTICE_VERSION = "openai-provider-eligibility-v2" as const;
export const SKILLPILOT_FALLBACK_URL = "https://skillpilot.com/" as const;
export const SKILLPILOT_BOOTSTRAP_URL =
  "https://mcp-coach-v1.skillpilot.com/bootstrap/v1/launch" as const;
export const HANDOFF_RETENTION_MS = 15 * 60 * 1_000;

const CAPABILITY_PATTERN = /^spc_[A-Za-z0-9_-]{43}$/;
const SESSION_PATTERN = /^sps_[A-Za-z0-9_-]{43}$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ISO_INSTANT_PATTERN =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,9})?Z$/;
const MAX_CAPABILITY_LIFETIME_MS = 10 * 60 * 1_000;
const MAX_SESSION_LIFETIME_MS = 24 * 60 * 60 * 1_000;
const CLOCK_SKEW_MS = 30_000;
const MAX_RESPONSE_BYTES = 8 * 1_024;
const MAX_SETUP_RESULT_BYTES = 64 * 1_024;
const MAX_SETUP_OPTIONS = 128;
const MAX_PERSONALIZATION_DECISIONS = 64;
const MAX_PERSONALIZATION_SELECTIONS = 32;
const SETUP_COMPLETE_REQUIRED_ACTIONS = new Set([
  "",
  "getFrontier",
  "chooseMemoryMode",
  "orientActiveGoal",
  "teachActiveGoal",
  "setActiveGoal",
  "setScope"
]);
const SUCCESSOR_HANDOFF_URLS = new Set([
  "https://skillpilot.com/openai/coach-v2"
]);
const START_MESSAGES: Record<SkillPilotStartLocale, string> = {
  de: "Verwende SkillPilot Coach v1 und fahre fort.",
  en: "Use SkillPilot Coach v1 and continue."
};

export function skillPilotStartOpenFromToolResult(
  value: unknown,
  metadataSource?: unknown
): SkillPilotStartOpenResult | undefined {
  const structured = structuredContent(value);
  if (
    !structured
    || !hasExactKeys(structured, [
      "purpose",
      "communicationLocale",
      "status",
      "supportedLocales",
      "fallbackUrl"
    ])
  ) {
    return undefined;
  }

  const metadata = firstStartMetadata(value, metadataSource);
  if (
    !metadata
    || !hasExactKeys(metadata, ["schemaVersion", "contractLine"])
    || metadata.schemaVersion !== 1
  ) {
    return undefined;
  }
  const purpose = startPurpose(structured.purpose);
  const communicationLocale = locale(structured.communicationLocale);
  const status = startStatus(structured.status);
  const supportedLocales = locales(structured.supportedLocales);
  const fallbackUrl = exactFallbackUrl(structured.fallbackUrl);
  const contractLine = contractLineFromUnknown(metadata.contractLine);
  if (
    !purpose
    || !communicationLocale
    || !status
    || !supportedLocales
    || !supportedLocales.includes(communicationLocale)
    || !fallbackUrl
    || !contractLine
  ) {
    return undefined;
  }
  if (!validStatusPolicyCombination(status, contractLine)) return undefined;

  return {
    purpose,
    communicationLocale,
    status,
    supportedLocales,
    fallbackUrl,
    contractLine,
    defaultLocale: communicationLocale
  };
}

export function createSkillPilotCapabilityArguments(
  start: SkillPilotStartOpenResult,
  providerEligibilityConfirmed: boolean
): SkillPilotCapabilityArguments | undefined {
  if (
    start.status !== "ID_REQUIRED"
    || !providerEligibilityConfirmed
    || start.contractLine.newSessionPolicy === "BLOCK"
  ) {
    return undefined;
  }
  return {
    providerNoticeVersion: PROVIDER_NOTICE_VERSION,
    providerEligibilityConfirmed: true,
    ...(start.contractLine.newSessionPolicy === "WARN"
      ? { sourceMajorDecision: "START_CURRENT_MAJOR" as const }
      : {})
  };
}

export function skillPilotCapabilityFromToolResult(
  value: unknown,
  metadataSource?: unknown,
  nowMs = Date.now()
): SkillPilotStartCapability | undefined {
  const structured = structuredContent(value);
  if (
    !structured
    || !hasExactKeys(structured, [
      "status",
      "contractMajor",
      "providerNoticeVersion"
    ])
    || structured.status !== "CAPABILITY_ISSUED"
    || structured.contractMajor !== 1
    || structured.providerNoticeVersion !== PROVIDER_NOTICE_VERSION
  ) {
    return undefined;
  }

  const metadata = firstStartMetadata(value, metadataSource);
  if (
    !metadata
    || !hasExactKeys(metadata, [
      "schemaVersion",
      "setupCapability",
      "expiresAt",
      "contractMajor",
      "policyRevision",
      "sourceMajorDecision",
      "providerNoticeVersion"
    ])
    || metadata.schemaVersion !== 1
    || metadata.contractMajor !== 1
    || metadata.providerNoticeVersion !== PROVIDER_NOTICE_VERSION
  ) {
    return undefined;
  }

  const setupCapability = exactCapability(metadata.setupCapability);
  const policyRevision = positiveSafeInteger(metadata.policyRevision);
  const sourceMajorDecision = sourceMajorDecisionFromUnknown(
    metadata.sourceMajorDecision
  );
  const expiresAt = futureTimestamp(
    metadata.expiresAt,
    nowMs,
    MAX_CAPABILITY_LIFETIME_MS + CLOCK_SKEW_MS
  );
  if (!setupCapability || !expiresAt || !policyRevision || !sourceMajorDecision) {
    return undefined;
  }

  return {
    setupCapability,
    expiresAt,
    contractMajor: 1,
    policyRevision,
    sourceMajorDecision,
    providerNoticeVersion: PROVIDER_NOTICE_VERSION
  };
}

export function canonicalSkillPilotId(value: unknown): string | undefined {
  if (typeof value !== "string" || value.length > 100) return undefined;
  const normalized = value.replace(/[\s\u200B-\u200D\u2060\uFEFF]+/gu, "").trim();
  return UUID_PATTERN.test(normalized) ? normalized : undefined;
}

export function createSkillPilotBootstrapRequest(
  capability: SkillPilotStartCapability,
  identityMode: SkillPilotIdentityMode,
  skillpilotId: unknown,
  communicationLocale: SkillPilotStartLocale,
  clientRequestId: unknown,
  nowMs = Date.now()
): SkillPilotBootstrapRequest | undefined {
  const normalizedId = identityMode === "EXISTING"
    ? canonicalSkillPilotId(skillpilotId)
    : undefined;
  const requestId = exactUuidV4(clientRequestId);
  const setupCapability = exactCapability(capability.setupCapability);
  const capabilityExpiresAt = futureTimestamp(
    capability.expiresAt,
    nowMs,
    MAX_CAPABILITY_LIFETIME_MS + CLOCK_SKEW_MS
  );
  if (
    (identityMode !== "CREATE" && identityMode !== "EXISTING")
    || (identityMode === "EXISTING" && !normalizedId)
    || (identityMode === "CREATE" && skillpilotId !== undefined)
    || !requestId
    || !setupCapability
    || !locale(communicationLocale)
    || !capabilityExpiresAt
  ) {
    return undefined;
  }

  return {
    endpoint: SKILLPILOT_BOOTSTRAP_URL,
    setupCapability,
    capabilityExpiresAtMs: Date.parse(capabilityExpiresAt),
    body: {
      schemaVersion: 1,
      identityMode,
      ...(identityMode === "EXISTING" ? { skillpilotId: normalizedId } : {}),
      communicationLocale,
      launchIntent: { type: "CURRENT_UNIT" },
      providerNoticeVersion: PROVIDER_NOTICE_VERSION,
      clientRequestId: requestId
    }
  };
}

export function skillPilotBootstrapFetchInit(
  request: SkillPilotBootstrapRequest,
  signal?: AbortSignal
): RequestInit {
  return {
    method: "POST",
    headers: {
      Authorization: `SkillPilotSetup ${request.setupCapability}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(request.body),
    credentials: "omit",
    redirect: "error",
    cache: "no-store",
    referrerPolicy: "no-referrer",
    mode: "cors",
    ...(signal ? { signal } : {})
  };
}

export async function sendSkillPilotBootstrap(
  request: SkillPilotBootstrapRequest,
  signal?: AbortSignal,
  fetchImplementation: typeof fetch = fetch
): Promise<SkillPilotLaunchResult> {
  if (request.endpoint !== SKILLPILOT_BOOTSTRAP_URL) {
    throw new Error("invalid-bootstrap-endpoint");
  }
  const response = await fetchImplementation(
    SKILLPILOT_BOOTSTRAP_URL,
    skillPilotBootstrapFetchInit(request, signal)
  );
  if (response.redirected) throw new Error("bootstrap-rejected");
  if (response.url && response.url !== SKILLPILOT_BOOTSTRAP_URL) {
    throw new Error("unexpected-bootstrap-response-url");
  }
  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.startsWith("application/json")) {
    throw new Error("invalid-bootstrap-content-type");
  }
  const text = await response.text();
  if (!text || new TextEncoder().encode(text).byteLength > MAX_RESPONSE_BYTES) {
    throw new Error("invalid-bootstrap-response-size");
  }
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error("invalid-bootstrap-json");
  }
  if (!response.ok) {
    const failure = skillPilotBootstrapErrorFromHttpResponse(value);
    if (!failure) throw new Error("invalid-bootstrap-error-result");
    throw new SkillPilotBootstrapHttpError(
      failure,
      failure === "TEMPORARILY_UNAVAILABLE"
    );
  }
  const result = skillPilotLaunchFromHttpResponse(value);
  if (!result) throw new Error("invalid-bootstrap-result");
  if (
    (request.body.identityMode === "CREATE" && !result.createdSkillpilotId)
    || (request.body.identityMode === "EXISTING" && result.createdSkillpilotId)
  ) {
    throw new Error("invalid-bootstrap-identity-result");
  }
  return result;
}

export function skillPilotBootstrapErrorFromHttpResponse(
  value: unknown
): SkillPilotBootstrapErrorStatus | undefined {
  const response = record(value);
  if (
    !response
    || !hasExactKeys(response, ["schemaVersion", "status", "fallbackUrl"])
    || response.schemaVersion !== 1
    || response.fallbackUrl !== SKILLPILOT_FALLBACK_URL
  ) {
    return undefined;
  }
  return bootstrapErrorStatus(response.status);
}

export function skillPilotLaunchFromHttpResponse(
  value: unknown,
  nowMs = Date.now()
): SkillPilotLaunchResult | undefined {
  const response = record(value);
  const expectedKeys = response && "createdSkillpilotId" in response
    ? [
      "schemaVersion",
      "status",
      "communicationLocale",
      "expiresAt",
      "startMessage",
      "createdSkillpilotId"
    ]
    : [
      "schemaVersion",
      "status",
      "communicationLocale",
      "expiresAt",
      "startMessage"
    ];
  if (
    !response
    || !hasExactKeys(response, expectedKeys)
    || response.schemaVersion !== 1
    || response.status !== "SESSION_CREATED"
  ) {
    return undefined;
  }
  const communicationLocale = locale(response.communicationLocale);
  const expiresAt = futureTimestamp(
    response.expiresAt,
    nowMs,
    MAX_SESSION_LIFETIME_MS + CLOCK_SKEW_MS
  );
  const startMessage = boundedExactText(response.startMessage, 500);
  const createdSkillpilotId = response.createdSkillpilotId === undefined
    ? undefined
    : canonicalSkillPilotId(response.createdSkillpilotId);
  if (!communicationLocale || !expiresAt || !startMessage) return undefined;
  if (response.createdSkillpilotId !== undefined && !createdSkillpilotId) return undefined;
  if (!isCanonicalStartMessage(startMessage, communicationLocale)) return undefined;
  return {
    schemaVersion: 1,
    status: "SESSION_CREATED",
    communicationLocale,
    expiresAt,
    startMessage,
    ...(createdSkillpilotId ? { createdSkillpilotId } : {})
  };
}

export function learningSessionIdFromStartMessage(
  startMessage: unknown,
  communicationLocale: SkillPilotStartLocale
): string | undefined {
  if (typeof startMessage !== "string") return undefined;
  if (!isCanonicalStartMessage(startMessage, communicationLocale)) return undefined;
  return startMessage.split("\n")[1]?.slice("learningSessionId: ".length);
}

export function createSkillPilotGetContextCall(
  learningSessionId: unknown
): SkillPilotSetupToolCall | undefined {
  const sessionId = exactLearningSessionId(learningSessionId);
  return sessionId
    ? {
      name: "get_skillpilot_context",
      arguments: { learningSessionId: sessionId }
    }
    : undefined;
}

export function createSkillPilotCurriculumNavigationCall(
  learningSessionId: unknown
): SkillPilotSetupToolCall | undefined {
  const sessionId = exactLearningSessionId(learningSessionId);
  return sessionId
    ? {
      name: "get_skillpilot_navigation",
      arguments: {
        learningSessionId: sessionId,
        target: "curriculum"
      }
    }
    : undefined;
}

export function createSkillPilotSetupMutationCall(
  requiredAction: SkillPilotSetupRequiredAction,
  learningSessionId: unknown,
  stateVersion: unknown,
  optionId: unknown,
  clientRequestId: unknown
): SkillPilotSetupToolCall | undefined {
  const sessionId = exactLearningSessionId(learningSessionId);
  const version = nonNegativeSafeInteger(stateVersion);
  const option = boundedExactText(optionId, 500);
  const requestId = exactUuidV4(clientRequestId);
  if (!sessionId || version === undefined || !option || !requestId) return undefined;
  if (requiredAction === "setCurriculum") {
    return {
      name: "set_skillpilot_curriculum",
      arguments: {
        learningSessionId: sessionId,
        curriculumId: option,
        expectedStateVersion: version,
        clientRequestId: requestId
      }
    };
  }
  if (requiredAction === "setPersonalization") {
    return {
      name: "set_skillpilot_personalization",
      arguments: {
        learningSessionId: sessionId,
        optionId: option,
        expectedStateVersion: version,
        clientRequestId: requestId
      }
    };
  }
  return undefined;
}

export function createSkillPilotPersonalizationRewindCall(
  learningSessionId: unknown,
  stateVersion: unknown,
  rewindId: unknown,
  clientRequestId: unknown
): SkillPilotSetupToolCall | undefined {
  const sessionId = exactLearningSessionId(learningSessionId);
  const version = nonNegativeSafeInteger(stateVersion);
  const rewind = boundedExactText(rewindId, 500);
  const requestId = exactUuidV4(clientRequestId);
  if (!sessionId || version === undefined || !rewind || !requestId) return undefined;
  return {
    name: "set_skillpilot_personalization",
    arguments: {
      learningSessionId: sessionId,
      rewindId: rewind,
      expectedStateVersion: version,
      clientRequestId: requestId
    }
  };
}

export function skillPilotSetupStateFromToolResult(
  value: unknown,
  expectedLocale: SkillPilotStartLocale
): SkillPilotSetupState | undefined {
  const envelope = record(value);
  if (!envelope || envelope.isError === true) return undefined;
  const source = record(envelope.structuredContent);
  if (!source || encodedByteLength(source) > MAX_SETUP_RESULT_BYTES) return undefined;
  return setupStateFromSource(source, expectedLocale);
}

export function skillPilotCurriculumNavigationStateFromToolResult(
  value: unknown,
  expectedLocale: SkillPilotStartLocale
): SkillPilotSetupState | undefined {
  const envelope = record(value);
  if (!envelope || envelope.isError === true) return undefined;
  const source = record(envelope.structuredContent);
  if (
    !source
    || encodedByteLength(source) > MAX_SETUP_RESULT_BYTES
    || !hasOnlyKeys(source, [
      "contractMajor",
      "stateVersion",
      "stateSchemaVersion",
      "workflowVersion",
      "curriculumRevision",
      "communicationLocale",
      "extensions",
      "target",
      "requiredAction",
      "curriculum",
      "curriculumCatalog",
      "decision",
      "options",
      "instruction"
    ])
    || source.contractMajor !== 1
    || positiveSafeInteger(source.stateSchemaVersion) === undefined
    || !boundedExactText(source.workflowVersion, 200)
    || !boundedExactText(source.curriculumRevision, 200)
    || !record(source.extensions)
    || source.target !== "curriculum"
    || source.requiredAction !== "setCurriculum"
    || !boundedExactText(source.instruction, 2_000)
    || source.curriculum === undefined
    || source.curriculum === null
    || source.curriculumCatalog === undefined
    || (source.decision !== undefined && source.decision !== null)
  ) {
    return undefined;
  }
  return setupStateFromSource(source, expectedLocale);
}

function setupStateFromSource(
  source: Record<string, unknown>,
  expectedLocale: SkillPilotStartLocale
): SkillPilotSetupState | undefined {
  const stateVersion = nonNegativeSafeInteger(source.stateVersion);
  const communicationLocale = locale(source.communicationLocale);
  const rawRequiredAction = boundedTrimmedText(source.requiredAction, 100);
  if (
    stateVersion === undefined
    || communicationLocale !== expectedLocale
    || rawRequiredAction === undefined
    || !Array.isArray(source.options)
    || source.options.length > MAX_SETUP_OPTIONS
  ) {
    return undefined;
  }
  const requiredAction = rawRequiredAction === "setCurriculum"
    || rawRequiredAction === "setPersonalization"
    ? rawRequiredAction
    : null;
  const curriculum = source.curriculum === undefined || source.curriculum === null
    ? undefined
    : setupCurriculumSummary(source.curriculum);
  if (source.curriculum !== undefined && source.curriculum !== null && !curriculum) {
    return undefined;
  }
  const personalizationHistory = source.personalizationHistory === undefined
    || source.personalizationHistory === null
    ? undefined
    : setupPersonalizationHistory(source.personalizationHistory);
  if (
    source.personalizationHistory !== undefined
    && source.personalizationHistory !== null
    && !personalizationHistory
  ) {
    return undefined;
  }
  if (
    (requiredAction === "setPersonalization" || requiredAction === null)
    && !curriculum
  ) {
    return undefined;
  }
  if (requiredAction === null) {
    if (!SETUP_COMPLETE_REQUIRED_ACTIONS.has(rawRequiredAction)) return undefined;
    return {
      stateVersion,
      communicationLocale,
      requiredAction: null,
      options: [],
      ...(curriculum ? { curriculum } : {}),
      ...(personalizationHistory ? { personalizationHistory } : {})
    };
  }
  const options = setupOptions(source.options, requiredAction);
  if (!options || options.length === 0) return undefined;
  if (requiredAction === "setCurriculum") {
    const catalog = setupCurriculumCatalog(source.curriculumCatalog, options);
    if (!catalog) return undefined;
    for (const option of options) {
      const metadata = catalog.get(option.id);
      if (!metadata) return undefined;
      option.category = metadata.category;
      option.qualityStatus = metadata.qualityStatus;
      option.sortRank = metadata.sortRank;
    }
  } else if (source.curriculumCatalog !== undefined && source.curriculumCatalog !== null) {
    return undefined;
  }
  const decision = source.decision === undefined || source.decision === null
    ? undefined
    : setupDecision(source.decision);
  if (source.decision !== undefined && source.decision !== null && !decision) {
    return undefined;
  }
  return {
    stateVersion,
    communicationLocale,
    requiredAction,
    options,
    ...(curriculum ? { curriculum } : {}),
    ...(personalizationHistory ? { personalizationHistory } : {}),
    ...(decision ? { decision } : {})
  };
}

export function isExactSkillPilotFallbackUrl(value: unknown): value is string {
  return value === SKILLPILOT_FALLBACK_URL;
}

function validStatusPolicyCombination(
  status: SkillPilotStartStatus,
  contractLine: SkillPilotContractLine
): boolean {
  const hasSuccessor = contractLine.successor !== null;
  if (status === "ID_REQUIRED") {
    return contractLine.newSessionPolicy === "ALLOW"
      || (contractLine.newSessionPolicy === "WARN" && hasSuccessor);
  }
  if (status === "MAJOR_UPGRADE_REQUIRED") {
    return contractLine.newSessionPolicy === "BLOCK" && hasSuccessor;
  }
  return contractLine.newSessionPolicy === "BLOCK" && !hasSuccessor;
}

function bootstrapErrorStatus(value: unknown): SkillPilotBootstrapErrorStatus | undefined {
  return value === "START_NOT_AUTHORIZED"
    || value === "START_UNAVAILABLE"
    || value === "IDEMPOTENCY_KEY_REUSED"
    || value === "PROFILE_UNAVAILABLE"
    || value === "RETRY_EXPIRED"
    || value === "DELIVERY_EXPIRED"
    || value === "TEMPORARILY_UNAVAILABLE"
    || value === "INVALID_REQUEST"
    ? value
    : undefined;
}

function contractLineFromUnknown(value: unknown): SkillPilotContractLine | undefined {
  const source = record(value);
  if (
    !source
    || !hasExactKeys(source, [
      "contractMajor",
      "policyRevision",
      "displayName",
      "supportLifecycle",
      "publicationStatus",
      "newSessionPolicy",
      "successor"
    ])
    || source.contractMajor !== 1
    || source.displayName !== "SkillPilot Coach v1"
  ) {
    return undefined;
  }
  const supportLifecycle = supportLifecycleFromUnknown(source.supportLifecycle);
  const publicationStatus = publicationStatusFromUnknown(source.publicationStatus);
  const newSessionPolicy = newSessionPolicyFromUnknown(source.newSessionPolicy);
  const policyRevision = positiveSafeInteger(source.policyRevision);
  const successor = source.successor === null
    ? null
    : successorFromUnknown(source.successor);
  if (
    !policyRevision
    || !supportLifecycle
    || !publicationStatus
    || !newSessionPolicy
    || successor === undefined
  ) {
    return undefined;
  }
  if (
    supportLifecycle === "RETIRED"
    && (publicationStatus !== "UNPUBLISHED" || newSessionPolicy !== "BLOCK")
  ) {
    return undefined;
  }
  return {
    contractMajor: 1,
    policyRevision,
    displayName: "SkillPilot Coach v1",
    supportLifecycle,
    publicationStatus,
    newSessionPolicy,
    successor
  };
}

function successorFromUnknown(value: unknown): SkillPilotSuccessor | undefined {
  const source = record(value);
  if (
    !source
    || !hasExactKeys(source, ["contractMajor", "displayName", "handoffUrl"])
    || source.contractMajor !== 2
  ) {
    return undefined;
  }
  const displayName = boundedExactText(source.displayName, 30);
  const handoffUrl = boundedExactText(source.handoffUrl, 200);
  if (
    displayName !== "SkillPilot Coach v2"
    || !handoffUrl
    || !SUCCESSOR_HANDOFF_URLS.has(handoffUrl)
  ) {
    return undefined;
  }
  return {
    contractMajor: 2,
    displayName,
    handoffUrl
  };
}

function isCanonicalStartMessage(
  value: string,
  communicationLocale: SkillPilotStartLocale
): boolean {
  const lines = value.split("\n");
  if (lines.length !== 2 || lines[0] !== START_MESSAGES[communicationLocale]) {
    return false;
  }
  const prefix = "learningSessionId: ";
  return lines[1].startsWith(prefix)
    && SESSION_PATTERN.test(lines[1].slice(prefix.length));
}

function structuredContent(value: unknown): Record<string, unknown> | undefined {
  const source = record(value);
  return record(source?.structuredContent) ?? source;
}

function firstStartMetadata(
  value: unknown,
  metadataSource?: unknown
): Record<string, unknown> | undefined {
  for (const candidate of metadataCandidates(value, metadataSource)) {
    const start = record(candidate.skillpilotStart);
    if (start) return start;
  }
  return undefined;
}

function metadataCandidates(...values: unknown[]): Record<string, unknown>[] {
  const candidates: Record<string, unknown>[] = [];
  const queue = values.map((value) => ({ value, depth: 0 }));
  const seen = new Set<object>();
  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) break;
    const candidate = record(item.value);
    if (!candidate || seen.has(candidate)) continue;
    seen.add(candidate);

    const metadata = record(candidate._meta);
    if (metadata) candidates.push(metadata);
    if (candidate.skillpilotStart !== undefined) candidates.push(candidate);

    if (item.depth >= 3) continue;
    for (const key of [
      "toolResponseMetadata",
      "mcp_tool_result",
      "call_tool_result",
      "toolResult",
      "result"
    ]) {
      if (candidate[key] !== undefined) {
        queue.push({ value: candidate[key], depth: item.depth + 1 });
      }
    }
  }
  return candidates;
}

function exactFallbackUrl(value: unknown): typeof SKILLPILOT_FALLBACK_URL | undefined {
  return value === SKILLPILOT_FALLBACK_URL ? SKILLPILOT_FALLBACK_URL : undefined;
}

function exactCapability(value: unknown): string | undefined {
  return typeof value === "string" && CAPABILITY_PATTERN.test(value)
    ? value
    : undefined;
}

function exactLearningSessionId(value: unknown): string | undefined {
  return typeof value === "string" && SESSION_PATTERN.test(value)
    ? value
    : undefined;
}

function exactUuidV4(value: unknown): string | undefined {
  return typeof value === "string" && UUID_V4_PATTERN.test(value)
    ? value
    : undefined;
}

function futureTimestamp(
  value: unknown,
  nowMs: number,
  maximumFutureMs?: number
): string | undefined {
  const text = boundedExactText(value, 100);
  if (!text || !ISO_INSTANT_PATTERN.test(text)) return undefined;
  const parsed = Date.parse(text);
  if (!Number.isFinite(parsed) || parsed <= nowMs) return undefined;
  if (maximumFutureMs !== undefined && parsed > nowMs + maximumFutureMs) {
    return undefined;
  }
  return text;
}

function startStatus(value: unknown): SkillPilotStartStatus | undefined {
  return value === "ID_REQUIRED"
    || value === "MAJOR_UPGRADE_REQUIRED"
    || value === "TEMPORARILY_UNAVAILABLE"
    ? value
    : undefined;
}

function startPurpose(value: unknown): SkillPilotStartPurpose | undefined {
  return value === "START" || value === "RENEW_EXISTING"
    ? value
    : undefined;
}

function locales(value: unknown): ["de", "en"] | undefined {
  return Array.isArray(value)
    && value.length === 2
    && value[0] === "de"
    && value[1] === "en"
    ? ["de", "en"]
    : undefined;
}

function locale(value: unknown): SkillPilotStartLocale | undefined {
  return value === "de" || value === "en" ? value : undefined;
}

function supportLifecycleFromUnknown(
  value: unknown
): SkillPilotSupportLifecycle | undefined {
  return value === "CURRENT"
    || value === "SUPPORTED"
    || value === "DEPRECATED"
    || value === "RETIRED"
    ? value
    : undefined;
}

function publicationStatusFromUnknown(
  value: unknown
): SkillPilotPublicationStatus | undefined {
  return value === "DRAFT" || value === "PUBLISHED" || value === "UNPUBLISHED"
    ? value
    : undefined;
}

function newSessionPolicyFromUnknown(
  value: unknown
): SkillPilotNewSessionPolicy | undefined {
  return value === "ALLOW" || value === "WARN" || value === "BLOCK"
    ? value
    : undefined;
}

function sourceMajorDecisionFromUnknown(
  value: unknown
): "ALLOW_CURRENT_MAJOR" | "START_CURRENT_MAJOR" | undefined {
  return value === "ALLOW_CURRENT_MAJOR" || value === "START_CURRENT_MAJOR"
    ? value
    : undefined;
}

function positiveSafeInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0
    ? value
    : undefined;
}

function nonNegativeSafeInteger(value: unknown): number | undefined {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0
    ? value
    : undefined;
}

function setupOptions(
  value: unknown,
  requiredAction: SkillPilotSetupRequiredAction
): SkillPilotSetupOption[] | undefined {
  if (!Array.isArray(value) || value.length > MAX_SETUP_OPTIONS) return undefined;
  const expectedKind = requiredAction === "setCurriculum"
    ? "curriculum"
    : "personalization";
  const expectedTool = requiredAction === "setCurriculum"
    ? "set_skillpilot_curriculum"
    : "set_skillpilot_personalization";
  const result: SkillPilotSetupOption[] = [];
  const ids = new Set<string>();
  for (const raw of value) {
    const option = record(raw);
    if (
      !option
      || Object.keys(option).some((key) => ![
        "kind",
        "id",
        "label",
        "description",
        "goalIds",
        "filterIds",
        "action"
      ].includes(key))
      || option.kind !== expectedKind
    ) {
      return undefined;
    }
    const id = boundedExactText(option.id, 500);
    const label = boundedExactText(option.label, 500);
    const description = option.description === undefined || option.description === null
      ? undefined
      : boundedExactText(option.description, 2_000);
    if (!id || !label || ids.has(id)) return undefined;
    if (option.description !== undefined && option.description !== null && !description) {
      return undefined;
    }
    for (const listName of ["goalIds", "filterIds"] as const) {
      const list = option[listName];
      if (
        list !== undefined
        && (!Array.isArray(list)
          || list.length > 32
          || list.some((entry) => !boundedExactText(entry, 500)))
      ) {
        return undefined;
      }
    }
    if (
      option.action !== undefined
      && option.action !== null
      && option.action !== expectedTool
    ) {
      return undefined;
    }
    ids.add(id);
    result.push({ id, label, ...(description ? { description } : {}) });
  }
  return result;
}

function setupCurriculumCatalog(
  value: unknown,
  options: readonly SkillPilotSetupOption[]
): Map<string, {
  category: SkillPilotCurriculumCatalogCategory;
  qualityStatus: SkillPilotCurriculumQualityStatus;
  sortRank: number;
}> | undefined {
  const catalog = record(value);
  if (
    !catalog
    || Object.keys(catalog).some((key) => !["schemaVersion", "entries"].includes(key))
    || catalog.schemaVersion !== 1
    || !Array.isArray(catalog.entries)
    || catalog.entries.length !== options.length
  ) {
    return undefined;
  }
  const optionIds = new Set(options.map((option) => option.id));
  const result = new Map<string, {
    category: SkillPilotCurriculumCatalogCategory;
    qualityStatus: SkillPilotCurriculumQualityStatus;
    sortRank: number;
  }>();
  for (const raw of catalog.entries) {
    const entry = record(raw);
    if (
      !entry
      || Object.keys(entry).some((key) => ![
        "optionId",
        "category",
        "qualityStatus",
        "sortRank"
      ].includes(key))
    ) {
      return undefined;
    }
    const optionId = boundedExactText(entry.optionId, 500);
    const category = entry.category === "SCHOOL"
      || entry.category === "UNI"
      || entry.category === "OTHER"
      ? entry.category
      : undefined;
    const qualityStatus = entry.qualityStatus === "green"
      || entry.qualityStatus === "orange"
      || entry.qualityStatus === "red"
      ? entry.qualityStatus
      : undefined;
    const sortRank = nonNegativeSafeInteger(entry.sortRank);
    if (
      !optionId
      || !optionIds.has(optionId)
      || result.has(optionId)
      || !category
      || !qualityStatus
      || sortRank === undefined
      || sortRank > 2
    ) {
      return undefined;
    }
    result.set(optionId, { category, qualityStatus, sortRank });
  }
  return result.size === optionIds.size ? result : undefined;
}

function setupCurriculumSummary(value: unknown): SkillPilotCurriculumSummary | undefined {
  const source = record(value);
  if (
    !source
    || !hasOnlyKeys(source, ["curriculumId", "title", "subject"])
  ) {
    return undefined;
  }
  const curriculumId = boundedExactText(source.curriculumId, 500);
  const title = source.title === undefined
    ? undefined
    : boundedTrimmedText(source.title, 500);
  const subject = source.subject === undefined
    ? undefined
    : boundedTrimmedText(source.subject, 500);
  if (
    !curriculumId
    || (source.title !== undefined && title === undefined)
    || (source.subject !== undefined && subject === undefined)
  ) {
    return undefined;
  }
  return {
    curriculumId,
    ...(title ? { title } : {}),
    ...(subject ? { subject } : {})
  };
}

function setupPersonalizationHistory(
  value: unknown
): SkillPilotPersonalizationHistory | undefined {
  const source = record(value);
  if (
    !source
    || !hasOnlyKeys(source, [
      "schemaVersion",
      "currentDecision",
      "completedDecisions",
      "preservedDecisions"
    ])
    || source.schemaVersion !== 1
    || !Array.isArray(source.completedDecisions)
    || !Array.isArray(source.preservedDecisions)
    || source.completedDecisions.length > MAX_PERSONALIZATION_DECISIONS
    || source.preservedDecisions.length > MAX_PERSONALIZATION_DECISIONS
  ) {
    return undefined;
  }
  const currentDecision = source.currentDecision === undefined
    || source.currentDecision === null
    ? undefined
    : setupPersonalizationHistoryDecision(source.currentDecision, true);
  const completedDecisions = source.completedDecisions.map((entry) =>
    setupPersonalizationHistoryDecision(entry, true)
  );
  const preservedDecisions = source.preservedDecisions.map((entry) =>
    setupPersonalizationHistoryDecision(entry, false)
  );
  if (
    (source.currentDecision !== undefined
      && source.currentDecision !== null
      && !currentDecision)
    || completedDecisions.some((entry) => !entry)
    || preservedDecisions.some((entry) => !entry)
  ) {
    return undefined;
  }
  const rewindIds = new Set<string>();
  for (const decision of [
    ...(currentDecision ? [currentDecision] : []),
    ...completedDecisions
  ]) {
    if (!decision?.rewindId || rewindIds.has(decision.rewindId)) return undefined;
    rewindIds.add(decision.rewindId);
  }
  return {
    schemaVersion: 1,
    ...(currentDecision ? { currentDecision } : {}),
    completedDecisions: completedDecisions as SkillPilotPersonalizationDecision[],
    preservedDecisions: preservedDecisions as SkillPilotPersonalizationDecision[]
  };
}

function setupPersonalizationHistoryDecision(
  value: unknown,
  rewindRequired: boolean
): SkillPilotPersonalizationDecision | undefined {
  const source = record(value);
  if (
    !source
    || !hasOnlyKeys(source, ["rewindId", "stageLabel", "groupLabel", "selectedLabels"])
    || !Object.hasOwn(source, "stageLabel")
    || !Object.hasOwn(source, "groupLabel")
    || !Object.hasOwn(source, "selectedLabels")
    || !Array.isArray(source.selectedLabels)
    || source.selectedLabels.length > MAX_PERSONALIZATION_SELECTIONS
  ) {
    return undefined;
  }
  const rewindId = source.rewindId === undefined
    ? undefined
    : boundedExactText(source.rewindId, 500);
  const stageLabel = boundedTrimmedText(source.stageLabel, 500);
  const groupLabel = boundedTrimmedText(source.groupLabel, 500);
  const selectedLabels = source.selectedLabels.map((label) =>
    boundedExactText(label, 320)
  );
  if (
    (rewindRequired ? !rewindId : source.rewindId !== undefined)
    || stageLabel === undefined
    || groupLabel === undefined
    || selectedLabels.some((label) => !label)
  ) {
    return undefined;
  }
  return {
    ...(rewindId ? { rewindId } : {}),
    stageLabel,
    groupLabel,
    selectedLabels: selectedLabels as string[]
  };
}

function setupDecision(value: unknown): SkillPilotSetupDecision | undefined {
  const source = record(value);
  if (
    !source
    || !hasExactKeys(source, [
      "stageLabel",
      "groupLabel",
      "minSelections",
      "maxSelections",
      "selectedCount"
    ])
  ) {
    return undefined;
  }
  const stageLabel = boundedExactText(source.stageLabel, 500);
  const groupLabel = boundedExactText(source.groupLabel, 500);
  const minSelections = nonNegativeSafeInteger(source.minSelections);
  const maxSelections = nonNegativeSafeInteger(source.maxSelections);
  const selectedCount = nonNegativeSafeInteger(source.selectedCount);
  if (
    !stageLabel
    || !groupLabel
    || minSelections === undefined
    || maxSelections === undefined
    || selectedCount === undefined
    || minSelections > maxSelections
    || selectedCount > maxSelections
  ) {
    return undefined;
  }
  return {
    stageLabel,
    groupLabel,
    minSelections,
    maxSelections,
    selectedCount
  };
}

function encodedByteLength(value: unknown): number {
  try {
    const json = JSON.stringify(value);
    return typeof json === "string"
      ? new TextEncoder().encode(json).byteLength
      : Number.POSITIVE_INFINITY;
  } catch {
    return Number.POSITIVE_INFINITY;
  }
}

function boundedExactText(value: unknown, maximumLength: number): string | undefined {
  if (
    typeof value !== "string"
    || !value
    || value.length > maximumLength
    || value !== value.trim()
  ) {
    return undefined;
  }
  return value;
}

function boundedTrimmedText(value: unknown, maximumLength: number): string | undefined {
  return typeof value === "string"
    && value.length <= maximumLength
    && value === value.trim()
    ? value
    : undefined;
}

function hasExactKeys(
  value: Record<string, unknown>,
  expectedKeys: readonly string[]
): boolean {
  const actual = Object.keys(value).sort();
  const expected = [...expectedKeys].sort();
  return actual.length === expected.length
    && actual.every((key, index) => key === expected[index]);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  allowedKeys: readonly string[]
): boolean {
  const allowed = new Set(allowedKeys);
  return Object.keys(value).every((key) => allowed.has(key));
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
