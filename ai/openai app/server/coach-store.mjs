import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const moduleDir = dirname(fileURLToPath(import.meta.url));
export const DEFAULT_DATA_DIR = join(moduleDir, "../../../tmp/openai-mcp-app-prototype");

function nowIso() {
  return new Date().toISOString();
}

function createState(catalog, learningRequest) {
  const createdAt = nowIso();
  return {
    revision: 1,
    locale: catalog.locale,
    sessionRef: `spapp_${randomUUID()}`,
    phase: "scope-choice",
    learningRequest: learningRequest?.trim() || null,
    courseCode: null,
    appliedChoiceRef: null,
    optionRefs: Object.fromEntries(
      catalog.copy.choices.map((choice) => [choice.code, `choice_${randomUUID()}`])
    ),
    submission: null,
    evaluation: null,
    createdAt,
    updatedAt: createdAt
  };
}

function clone(value) {
  return structuredClone(value);
}

export class CoachStore {
  #file;
  #states = new Map();
  #ready;
  #writeQueue = Promise.resolve();

  constructor({ dataDir = process.env.SKILLPILOT_MCP_APP_DATA_DIR || DEFAULT_DATA_DIR } = {}) {
    this.#file = join(dataDir, "coach-state.json");
    this.#ready = this.#load();
  }

  async #load() {
    try {
      const raw = JSON.parse(await readFile(this.#file, "utf8"));
      for (const [locale, state] of Object.entries(raw.states || {})) {
        this.#states.set(locale, state);
      }
    } catch (error) {
      if (error?.code !== "ENOENT") throw error;
    }
  }

  async #persist() {
    const payload = JSON.stringify(
      { schemaVersion: 1, states: Object.fromEntries(this.#states) },
      null,
      2
    );
    this.#writeQueue = this.#writeQueue.then(async () => {
      await mkdir(dirname(this.#file), { recursive: true });
      const temporary = `${this.#file}.${process.pid}.tmp`;
      await writeFile(temporary, `${payload}\n`, { mode: 0o600 });
      await rename(temporary, this.#file);
    });
    return this.#writeQueue;
  }

  async open(catalog, learningRequest) {
    await this.#ready;
    let state = this.#states.get(catalog.locale);
    if (!state) {
      state = createState(catalog, learningRequest);
      this.#states.set(catalog.locale, state);
      await this.#persist();
    } else if (learningRequest?.trim() && !state.learningRequest) {
      state.learningRequest = learningRequest.trim();
      state.revision += 1;
      state.updatedAt = nowIso();
      await this.#persist();
    }
    return clone(state);
  }

  async current(catalog) {
    await this.#ready;
    const state = this.#states.get(catalog.locale);
    return state ? clone(state) : null;
  }

  async choose(catalog, sessionRef, choiceRef) {
    await this.#ready;
    const state = this.#requireSession(catalog, sessionRef);
    if (state.phase !== "scope-choice" && state.appliedChoiceRef === choiceRef) {
      return clone(state);
    }
    if (state.phase !== "scope-choice") {
      throw new CoachConflictError("The learning path has already been selected.");
    }
    const choice = catalog.copy.choices.find(
      (candidate) => state.optionRefs[candidate.code] === choiceRef
    );
    if (!choice) {
      throw new CoachConflictError("The selection is stale or invalid.");
    }
    state.courseCode = choice.code;
    state.appliedChoiceRef = choiceRef;
    state.phase = "practice";
    state.optionRefs = {};
    state.revision += 1;
    state.updatedAt = nowIso();
    await this.#persist();
    return clone(state);
  }

  async submit(catalog, sessionRef, answer, idempotencyKey) {
    await this.#ready;
    const state = this.#requireSession(catalog, sessionRef);
    const normalized = answer?.trim();
    if (!normalized) throw new CoachInputError("The answer must not be empty.");
    if (normalized.length > 4_000) {
      throw new CoachInputError("The answer must not exceed 4,000 characters.");
    }
    if (
      state.phase !== "practice" &&
      state.submission?.idempotencyKey &&
      state.submission.idempotencyKey === idempotencyKey
    ) {
      if (state.submission.answer !== normalized) {
        throw new CoachConflictError(
          "The idempotency key was already used for a different answer."
        );
      }
      return clone(state);
    }
    if (state.phase !== "practice") {
      throw new CoachConflictError("There is no open practice answer to submit.");
    }
    state.submission = {
      receipt: `submission_${randomUUID()}`,
      idempotencyKey,
      answer: normalized,
      submittedAt: nowIso()
    };
    state.evaluation = null;
    state.phase = "awaiting-evaluation";
    state.revision += 1;
    state.updatedAt = nowIso();
    await this.#persist();
    return clone(state);
  }

  async pending(catalog) {
    await this.#ready;
    const state = this.#states.get(catalog.locale);
    if (!state?.submission || state.phase !== "awaiting-evaluation") {
      throw new CoachConflictError("There is no submitted answer waiting for evaluation.");
    }
    return clone(state);
  }

  async evaluate(catalog, { score, maxScore, passed, feedback }) {
    await this.#ready;
    const state = this.#states.get(catalog.locale);
    const normalizedFeedback = feedback?.trim();
    if (
      state?.phase === "feedback" &&
      state.evaluation?.score === score &&
      state.evaluation?.maxScore === maxScore &&
      state.evaluation?.passed === Boolean(passed) &&
      state.evaluation?.feedback === normalizedFeedback
    ) {
      return clone(state);
    }
    if (!state?.submission || state.phase !== "awaiting-evaluation") {
      throw new CoachConflictError("There is no submitted answer waiting for evaluation.");
    }
    if (!normalizedFeedback) throw new CoachInputError("Feedback must not be empty.");
    if (normalizedFeedback.length > 2_000) {
      throw new CoachInputError("Feedback must not exceed 2,000 characters.");
    }
    if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
      throw new CoachInputError("Score and maximum score must be valid numbers.");
    }
    if (score < 0 || score > maxScore) {
      throw new CoachInputError("Score must be between zero and the maximum score.");
    }
    state.evaluation = {
      score,
      maxScore,
      passed: Boolean(passed),
      feedback: normalizedFeedback,
      evaluatedAt: nowIso()
    };
    state.phase = "feedback";
    state.revision += 1;
    state.updatedAt = nowIso();
    await this.#persist();
    return clone(state);
  }

  async reset(catalog) {
    await this.#ready;
    this.#states.delete(catalog.locale);
    await this.#persist();
  }

  #requireSession(catalog, sessionRef) {
    const state = this.#states.get(catalog.locale);
    if (!state || !sessionRef || state.sessionRef !== sessionRef) {
      throw new CoachConflictError("The widget session is stale or invalid.");
    }
    return state;
  }
}

export class CoachConflictError extends Error {
  constructor(message) {
    super(message);
    this.name = "CoachConflictError";
  }
}

export class CoachInputError extends Error {
  constructor(message) {
    super(message);
    this.name = "CoachInputError";
  }
}
