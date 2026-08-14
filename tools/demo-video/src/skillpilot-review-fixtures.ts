import { access, readFile, rename, rm } from "node:fs/promises";

import { assertPrivateInputFile, ensurePrivateFile, writePrivateFile } from "./private-fs.js";

const ROOT_CURRICULUM_ID = "a0e13c56-c25f-4742-9272-3a1a603ee52e";
const MATHEMATICS_CURRICULUM_ID = "68a8ac50-f5f5-4e24-8aa9-5e408ca01ced";
const ORIENTATION_GOAL_ID = "71cec9fb-3751-4d61-8b34-c5adbbf6e5f2";
const NARROW_FUNCTIONS_FOCUS_ID = "c9d92f32-167a-4006-a940-b8063a6ed434";
const ABI26_GK_SCOPE_ID = "9ad83149-3cb7-5b87-a617-3eae3715a50c";
const ABI26_GK_GOAL_ID = "53de0639-c08b-53dc-8f70-9b519b7ecbbd";

export const SKILLPILOT_REVIEW_ENVIRONMENT = Object.freeze({
  p2SkillpilotId: "SKILLPILOT_REVIEW_P2_SKILLPILOT_ID",
  p3StartUrl: "SKILLPILOT_REVIEW_P3_START_URL",
  p4StartUrl: "SKILLPILOT_REVIEW_P4_START_URL",
  p5StartUrl: "SKILLPILOT_REVIEW_P5_START_URL",
  n2StartUrl: "SKILLPILOT_REVIEW_N2_START_URL",
  n3StartUrl: "SKILLPILOT_REVIEW_N3_START_URL",
});

type CourseLevel = "GK" | "LK";

interface PersonalizationOption {
  optionId?: unknown;
  kind?: unknown;
  landscapeId?: unknown;
  filterId?: unknown;
  scopeKey?: unknown;
  scopeValue?: unknown;
}

interface PersonalizationPlan {
  stage?: unknown;
  problemCode?: unknown;
  options?: unknown;
}

interface LearnerState {
  skillpilotId?: unknown;
  frontier?: unknown;
  activeGoal?: unknown;
  stateMachine?: { goalOptions?: unknown; activeGoal?: unknown } | null;
}

interface LaunchResponse {
  prompt?: unknown;
  webUrl?: unknown;
  learningSessionId?: unknown;
  expiresAt?: unknown;
}

const LEARNING_SESSION_PATTERN = /^sps_[A-Za-z0-9_-]{43}$/u;
const LEARNING_SESSION_IN_PROMPT_PATTERN = /sps_[A-Za-z0-9_-]{43}/gu;
const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;
const DEFAULT_CLEANUP_MAX_ATTEMPTS = 3;

export interface SkillPilotReviewFixtures {
  readonly environment: Readonly<Record<string, string>>;
  readonly learnerCount: number;
  cleanup(): Promise<void>;
}

export interface PrepareSkillPilotReviewFixturesOptions {
  baseUrl?: string;
  fetchImpl?: typeof fetch;
  requestTimeoutMs?: number;
  cleanupMaxAttempts?: number;
  cleanupLedgerPath?: string;
}

export interface SkillPilotReviewCleanupResult {
  deletedLearnerCount: number;
  pendingLearnerCount: number;
}

const asRecord = (value: unknown): Record<string, unknown> | null => (
  value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
);

const asString = (value: unknown): string | null => (
  typeof value === "string" && value.trim() ? value.trim() : null
);

const asOptions = (value: unknown): PersonalizationOption[] => (
  Array.isArray(value)
    ? value.filter((entry) => asRecord(entry) !== null) as PersonalizationOption[]
    : []
);

const normalizeBaseUrl = (raw: string): URL => {
  const base = new URL(raw);
  const localDevelopment = base.hostname === "localhost" || base.hostname === "127.0.0.1";
  if ((base.protocol !== "https:" && !(localDevelopment && base.protocol === "http:"))
      || base.username
      || base.password
      || base.search
      || base.hash) {
    throw new Error("SkillPilot review fixture base URL must be a credential-free HTTPS origin");
  }
  base.pathname = "/";
  return base;
};

const findOption = (
  plan: PersonalizationPlan,
  courseLevel: CourseLevel,
): PersonalizationOption | undefined => {
  const options = asOptions(plan.options);
  return options.find((option) => (
    option.kind === "VALUE"
    && option.landscapeId === ROOT_CURRICULUM_ID
    && option.filterId === "DE-HE"
  ))
    ?? options.find((option) => (
      option.kind === "SCOPE_VALUE"
      && option.scopeKey === "durationModel"
      && option.scopeValue === "G9"
    ))
    ?? options.find((option) => (
      option.kind === "SCOPE_VALUE"
      && option.scopeKey === "stage"
      && option.scopeValue === "SekII"
    ))
    ?? options.find((option) => (
      option.kind === "VALUE"
      && option.landscapeId === MATHEMATICS_CURRICULUM_ID
      && option.filterId === null
    ))
    ?? options.find((option) => option.kind === "COMPLETE_GROUP")
    ?? options.find((option) => (
      option.kind === "VALUE"
      && option.landscapeId === MATHEMATICS_CURRICULUM_ID
      && option.filterId === courseLevel
    ));
};

const goalId = (value: unknown): string | null => asString(asRecord(value)?.id);

class SkillPilotReviewApi {
  readonly #baseUrl: URL;
  readonly #fetch: typeof fetch;
  readonly #requestTimeoutMs: number;

  constructor(baseUrl: URL, fetchImpl: typeof fetch, requestTimeoutMs: number) {
    this.#baseUrl = baseUrl;
    this.#fetch = fetchImpl;
    this.#requestTimeoutMs = requestTimeoutMs;
  }

  async #request<T>(
    method: "GET" | "POST" | "PUT" | "DELETE",
    pathname: string,
    operation: string,
    body?: unknown,
    notFoundIsSuccess = false,
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.#requestTimeoutMs);
    try {
      let response: Response;
      try {
        response = await this.#fetch(new URL(pathname, this.#baseUrl), {
          method,
          signal: controller.signal,
          ...(body === undefined ? {} : {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }),
        });
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error(`${operation} timed out after ${this.#requestTimeoutMs} ms`, { cause: error });
        }
        throw new Error(`${operation} failed before receiving a response`, { cause: error });
      }
      if (notFoundIsSuccess && response.status === 404) return undefined as T;
      if (!response.ok) {
        throw new Error(`${operation} failed (HTTP ${response.status})`);
      }
      if (response.status === 204) return undefined as T;
      try {
        return await response.json() as T;
      } catch (error) {
        if (controller.signal.aborted) {
          throw new Error(`${operation} timed out after ${this.#requestTimeoutMs} ms`, { cause: error });
        }
        throw new Error(`${operation} returned an invalid JSON response`, { cause: error });
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  async createConfiguredLearner(
    courseLevel: CourseLevel,
    onCreated: (id: string) => Promise<void>,
  ): Promise<string> {
    const created = await this.#request<{ state?: LearnerState }>(
      "POST",
      "/api/ui/learners",
      "Create disposable learner",
    );
    const id = asString(created.state?.skillpilotId);
    if (!id || !/^[A-Za-z0-9_-]{16,128}$/u.test(id)) {
      throw new Error("Create disposable learner returned an invalid identifier");
    }
    await onCreated(id);

    await this.#request<void>(
      "PUT",
      `/api/ui/learners/${encodeURIComponent(id)}/curriculum`,
      "Select review curriculum",
      { curriculumId: ROOT_CURRICULUM_ID },
    );

    let plan = await this.#request<PersonalizationPlan>(
      "GET",
      `/api/ui/learners/${encodeURIComponent(id)}/personalization-plan`,
      "Read review personalization plan",
    );
    for (let step = 0; step < 12 && plan.stage !== "COMPLETE"; step += 1) {
      if (plan.stage === "INVALID") {
        throw new Error("Review personalization plan is invalid");
      }
      const option = findOption(plan, courseLevel);
      const optionId = asString(option?.optionId);
      if (!optionId) {
        throw new Error("Expected current review personalization option is unavailable");
      }
      plan = await this.#request<PersonalizationPlan>(
        "POST",
        `/api/ui/learners/${encodeURIComponent(id)}/personalization-options`,
        "Apply review personalization option",
        { config: {}, goalIds: [], filters: [], optionId },
      );
    }
    if (plan.stage !== "COMPLETE") {
      throw new Error("Review personalization did not complete within the bounded plan");
    }
    return id;
  }

  async setScope(id: string, ids: string[]): Promise<LearnerState> {
    return await this.#request<LearnerState>(
      "POST",
      `/api/ui/learners/${encodeURIComponent(id)}/scope`,
      "Set disposable review focus",
      { goalIds: ids },
    );
  }

  async setActiveGoal(id: string, idOfGoal: string): Promise<void> {
    const updated = await this.#request<LearnerState>(
      "POST",
      `/api/ui/learners/${encodeURIComponent(id)}/active-goal`,
      "Set disposable review goal",
      { goalId: idOfGoal },
    );
    const actualActiveGoal = goalId(updated.stateMachine?.activeGoal)
      ?? goalId(updated.activeGoal);
    if (actualActiveGoal !== idOfGoal) {
      throw new Error("Set disposable review goal did not persist the requested active goal");
    }
  }

  async createLaunch(
    id: string,
    launchIntent?: Record<string, unknown>,
  ): Promise<string> {
    const response = await this.#request<LaunchResponse>(
      "POST",
      `/api/ui/learners/${encodeURIComponent(id)}/openai/v1/launch`,
      "Create protected review launch",
      {
        communicationLocale: "de",
        client: "openai-plugin-review-demo",
        selectedCurriculum: ROOT_CURRICULUM_ID,
        providerEligibilityConfirmed: true,
        ...(launchIntent ? { launchIntent } : {}),
      },
    );
    const prompt = asString(response.prompt);
    const webUrl = asString(response.webUrl);
    const sessionId = asString(response.learningSessionId);
    const expiresAt = asString(response.expiresAt);
    if (!prompt || !webUrl || !sessionId || !expiresAt) {
      throw new Error("Protected review launch response is incomplete");
    }
    const promptSessions = prompt.match(LEARNING_SESSION_IN_PROMPT_PATTERN) ?? [];
    if (!LEARNING_SESSION_PATTERN.test(sessionId)
        || promptSessions.length !== 1
        || promptSessions[0] !== sessionId) {
      throw new Error("Protected review launch returned an invalid session prompt");
    }
    const expiry = Date.parse(expiresAt);
    if (!Number.isFinite(expiry) || expiry <= Date.now()) {
      throw new Error("Protected review launch returned an invalid expiry");
    }
    const provider = new URL(webUrl);
    if (provider.origin !== "https://chatgpt.com"
        || provider.pathname !== "/"
        || provider.search
        || provider.hash
        || provider.username
        || provider.password) {
      throw new Error("Protected review launch returned an untrusted provider origin");
    }
    const start = new URL("https://chatgpt.com/");
    start.searchParams.set("prompt", prompt);
    const startUrl = start.toString();
    const reparsed = new URL(startUrl);
    if (reparsed.searchParams.size !== 1 || reparsed.searchParams.get("prompt") !== prompt) {
      throw new Error("Protected review start URL failed canonicalization");
    }
    return startUrl;
  }

  async deleteLearner(id: string): Promise<void> {
    await this.#request<void>(
      "DELETE",
      `/api/ui/learners/${encodeURIComponent(id)}`,
      "Delete disposable review learner",
      { confirmationSkillpilotId: id },
      true,
    );
  }
}

const firstAvailableGoalId = (state: LearnerState): string | null => {
  const stateMachineOptions = Array.isArray(state.stateMachine?.goalOptions)
    ? state.stateMachine.goalOptions
    : [];
  const frontier = Array.isArray(state.frontier) ? state.frontier : [];
  return stateMachineOptions.map(goalId).find((id): id is string => id !== null)
    ?? frontier.map(goalId).find((id): id is string => id !== null)
    ?? goalId(state.activeGoal);
};

function reviewFixtureRuntime(options: PrepareSkillPilotReviewFixturesOptions): {
  api: SkillPilotReviewApi;
  cleanupMaxAttempts: number;
} {
  const baseUrl = normalizeBaseUrl(options.baseUrl ?? "https://skillpilot.com");
  const requestTimeoutMs = options.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS;
  const cleanupMaxAttempts = options.cleanupMaxAttempts ?? DEFAULT_CLEANUP_MAX_ATTEMPTS;
  if (!Number.isSafeInteger(requestTimeoutMs) || requestTimeoutMs <= 0) {
    throw new Error("Review fixture request timeout must be a positive safe integer");
  }
  if (!Number.isSafeInteger(cleanupMaxAttempts) || cleanupMaxAttempts <= 0) {
    throw new Error("Review fixture cleanup attempts must be a positive safe integer");
  }
  return {
    api: new SkillPilotReviewApi(baseUrl, options.fetchImpl ?? fetch, requestTimeoutMs),
    cleanupMaxAttempts,
  };
}

const cleanupLedgerTemporaryPath = (path: string): string => `${path}.tmp`;

async function pathExists(path: string): Promise<boolean> {
  return await access(path).then(
    () => true,
    (error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return false;
      throw error;
    },
  );
}

async function loadCleanupLedger(path: string | undefined): Promise<string[]> {
  if (!path) return [];
  const temporaryPath = cleanupLedgerTemporaryPath(path);
  const [targetExists, temporaryExists] = await Promise.all([
    pathExists(path),
    pathExists(temporaryPath),
  ]);
  if (!targetExists && temporaryExists) {
    await assertPrivateInputFile(temporaryPath, "Review fixture cleanup ledger temporary file");
    await rename(temporaryPath, path);
    await ensurePrivateFile(path);
  } else if (targetExists && temporaryExists) {
    // The committed file is a conservative superset. A DELETE that already
    // succeeded is safely accepted as 404 when this older ledger is replayed.
    await rm(temporaryPath, { force: true });
  }
  if (!targetExists && !temporaryExists) return [];

  await assertPrivateInputFile(path, "Review fixture cleanup ledger");
  let ledger: unknown;
  try {
    ledger = JSON.parse(await readFile(path, "utf8"));
  } catch {
    throw new Error("Review fixture cleanup ledger is not valid JSON");
  }
  const record = asRecord(ledger);
  const ids = record?.skillpilotIds;
  if (!record
      || Object.keys(record).some((key) => key !== "schemaVersion" && key !== "skillpilotIds")
      || record.schemaVersion !== 1
      || !Array.isArray(ids)
      || ids.some((id) => typeof id !== "string" || !/^[A-Za-z0-9_-]{16,128}$/u.test(id))
      || new Set(ids).size !== ids.length) {
    throw new Error("Review fixture cleanup ledger has an invalid schema");
  }
  return [...ids] as string[];
}

async function persistCleanupLedger(path: string | undefined, learners: readonly string[]): Promise<void> {
  if (!path) return;
  const temporaryPath = cleanupLedgerTemporaryPath(path);
  if (learners.length === 0) {
    await Promise.all([
      rm(path, { force: true }),
      rm(temporaryPath, { force: true }),
    ]);
    return;
  }
  await rm(temporaryPath, { force: true });
  try {
    await writePrivateFile(
      temporaryPath,
      `${JSON.stringify({ schemaVersion: 1, skillpilotIds: learners }, null, 2)}\n`,
      { encoding: "utf8" },
    );
    try {
      await rename(temporaryPath, path);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (process.platform !== "win32"
          || (code !== "EEXIST" && code !== "EPERM" && code !== "EACCES")) throw error;
      // Windows cannot atomically replace an existing file. The private temp
      // file still narrows the platform-specific non-atomic fallback window.
      await rm(path, { force: true });
      await rename(temporaryPath, path);
    }
    await ensurePrivateFile(path);
  } finally {
    await rm(temporaryPath, { force: true });
  }
}

async function cleanupLearners(
  api: SkillPilotReviewApi,
  learners: string[],
  cleanupMaxAttempts: number,
  cleanupLedgerPath?: string,
): Promise<number> {
  const initialCount = learners.length;
  const failures: unknown[] = [];
  for (const id of [...learners].reverse()) {
    let lastFailure: unknown;
    let deleted = false;
    for (let attempt = 1; attempt <= cleanupMaxAttempts; attempt += 1) {
      try {
        await api.deleteLearner(id);
        deleted = true;
        break;
      } catch (error) {
        lastFailure = error;
      }
    }
    if (deleted) {
      const pendingIndex = learners.indexOf(id);
      if (pendingIndex >= 0) learners.splice(pendingIndex, 1);
      await persistCleanupLedger(cleanupLedgerPath, learners);
    } else {
      failures.push(lastFailure);
    }
  }
  if (failures.length > 0) {
    throw new Error(
      `Failed to delete ${failures.length} disposable review learner(s); ${learners.length} cleanup operation(s) remain pending`,
    );
  }
  return initialCount - learners.length;
}

/** Recovers only previously ledgered learners and never creates a new learner. */
export async function cleanupPendingSkillPilotReviewFixtures(
  options: PrepareSkillPilotReviewFixturesOptions = {},
): Promise<SkillPilotReviewCleanupResult> {
  const { api, cleanupMaxAttempts } = reviewFixtureRuntime(options);
  const learners = await loadCleanupLedger(options.cleanupLedgerPath);
  const deletedLearnerCount = await cleanupLearners(
    api,
    learners,
    cleanupMaxAttempts,
    options.cleanupLedgerPath,
  );
  return { deletedLearnerCount, pendingLearnerCount: learners.length };
}

export async function prepareSkillPilotReviewFixtures(
  options: PrepareSkillPilotReviewFixturesOptions = {},
): Promise<SkillPilotReviewFixtures> {
  const { api, cleanupMaxAttempts } = reviewFixtureRuntime(options);
  const learners = await loadCleanupLedger(options.cleanupLedgerPath);
  const environment: Record<string, string> = {};

  const create = async (courseLevel: CourseLevel): Promise<string> => {
    return await api.createConfiguredLearner(courseLevel, async (id) => {
      learners.push(id);
      await persistCleanupLedger(options.cleanupLedgerPath, learners);
    });
  };

  const cleanup = async (): Promise<void> => {
    await cleanupLearners(api, learners, cleanupMaxAttempts, options.cleanupLedgerPath);
  };

  try {
    // A previous terminated run leaves a private capability ledger. Recover it
    // before creating any new disposable learner.
    if (learners.length > 0) await cleanup();
    const p2 = await create("LK");
    await api.setActiveGoal(p2, ORIENTATION_GOAL_ID);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.p2SkillpilotId] = p2;

    const p3 = await create("LK");
    // The memory goal requires the orientation goal. Keep the fixture on the
    // normal frontier and let the recorded coach flow complete orientation
    // before it requests card practice; never manufacture mastery as setup.
    await api.setActiveGoal(p3, ORIENTATION_GOAL_ID);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.p3StartUrl] = await api.createLaunch(p3);

    const p4 = await create("GK");
    await api.setScope(p4, [ABI26_GK_SCOPE_ID]);
    await api.setActiveGoal(p4, ABI26_GK_GOAL_ID);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.p4StartUrl] = await api.createLaunch(p4, {
      type: "ABI26_EXAM",
      goalId: ABI26_GK_GOAL_ID,
      courseLevel: "GK",
    });

    const p5 = await create("LK");
    const p5State = await api.setScope(p5, [NARROW_FUNCTIONS_FOCUS_ID]);
    const p5Goal = firstAvailableGoalId(p5State);
    if (!p5Goal) throw new Error("The narrowed review focus offers no active learning goal");
    await api.setActiveGoal(p5, p5Goal);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.p5StartUrl] = await api.createLaunch(p5);

    const n2 = await create("LK");
    await api.setActiveGoal(n2, ORIENTATION_GOAL_ID);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.n2StartUrl] = await api.createLaunch(n2);

    const n3 = await create("GK");
    await api.setScope(n3, [ABI26_GK_SCOPE_ID]);
    await api.setActiveGoal(n3, ABI26_GK_GOAL_ID);
    environment[SKILLPILOT_REVIEW_ENVIRONMENT.n3StartUrl] = await api.createLaunch(n3, {
      type: "ABI26_EXAM",
      goalId: ABI26_GK_GOAL_ID,
      courseLevel: "GK",
    });

    const protectedStartUrls = Object.entries(environment)
      .filter(([name]) => name.endsWith("_START_URL"))
      .map(([, value]) => value);
    if (protectedStartUrls.length !== 5 || new Set(protectedStartUrls).size !== 5) {
      throw new Error("Review fixture preparation did not create five distinct protected start URLs");
    }

    return {
      environment: Object.freeze({ ...environment }),
      learnerCount: learners.length,
      cleanup,
    };
  } catch (error) {
    try {
      await cleanup();
    } catch (cleanupError) {
      throw new AggregateError(
        [error, cleanupError],
        "Review fixture preparation failed and disposable learner cleanup was incomplete",
      );
    }
    throw error;
  }
}
