const DEFAULT_BASE_URL = "https://skillpilot.com/api/action-regression";
const DEFAULT_TIMEOUT_MS = 10_000;

const PROBE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const TOKEN_PATTERN = /^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$/;
const PROOF_PATTERN = /^[0-9a-f]{32}$/;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9._:-]{1,128}$/;

export class ActionRegressionClient {
  constructor({
    baseUrl = process.env.ACTION_REGRESSION_BASE_URL || DEFAULT_BASE_URL,
    fetchImpl = globalThis.fetch,
    timeoutMs = DEFAULT_TIMEOUT_MS
  } = {}) {
    this.baseUrl = normalizedBaseUrl(baseUrl);
    if (typeof fetchImpl !== "function") throw new TypeError("fetchImpl must be a function");
    if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
      throw new TypeError("timeoutMs must be a positive integer");
    }
    this.fetchImpl = fetchImpl;
    this.timeoutMs = timeoutMs;
  }

  async createProbe() {
    const response = await this.#request("/v1/probe", { method: "GET" });
    return {
      payload: validateProbe(response.payload),
      backendRequestId: response.backendRequestId
    };
  }

  async verifyProbe(probe) {
    const validatedProbe = validateProbe(probe);
    const response = await this.#request("/v1/verify", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(validatedProbe)
    });
    return {
      payload: validateVerification(response.payload, validatedProbe.probe_id),
      backendRequestId: response.backendRequestId
    };
  }

  async #request(path, init) {
    let response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        ...init,
        headers: { accept: "application/json", ...(init.headers ?? {}) },
        signal: AbortSignal.timeout(this.timeoutMs)
      });
    } catch (error) {
      throw new ActionRegressionClientError("The public action-regression API could not be reached.", {
        cause: error
      });
    }

    const backendRequestId = safeRequestId(response.headers.get("x-regression-request-id"));
    if (!response.ok) {
      throw new ActionRegressionClientError(
        `The public action-regression API returned HTTP ${response.status}.`,
        { backendRequestId }
      );
    }

    let payload;
    try {
      payload = await response.json();
    } catch (error) {
      throw new ActionRegressionClientError(
        "The public action-regression API returned invalid JSON.",
        { cause: error, backendRequestId }
      );
    }
    return { payload, backendRequestId };
  }
}

export class ActionRegressionClientError extends Error {
  constructor(message, { cause, backendRequestId = null } = {}) {
    super(message, { cause });
    this.name = "ActionRegressionClientError";
    this.backendRequestId = backendRequestId;
  }
}

export function validateProbe(value) {
  assertPlainObjectWithExactKeys(value, ["probe_id", "proof", "token"], "probe");
  if (!PROBE_ID_PATTERN.test(value.probe_id)) throw new TypeError("probe_id has an invalid format");
  if (!TOKEN_PATTERN.test(value.token)) throw new TypeError("token has an invalid format");
  if (!PROOF_PATTERN.test(value.proof)) throw new TypeError("proof has an invalid format");
  return { probe_id: value.probe_id, token: value.token, proof: value.proof };
}

export function validateVerification(value, expectedProbeId) {
  assertPlainObjectWithExactKeys(value, ["ok", "probe_id", "proof_valid"], "verification");
  if (typeof value.ok !== "boolean" || typeof value.proof_valid !== "boolean") {
    throw new TypeError("verification flags must be booleans");
  }
  if (!PROBE_ID_PATTERN.test(value.probe_id)) {
    throw new TypeError("verification probe_id has an invalid format");
  }
  if (value.probe_id !== expectedProbeId) {
    throw new TypeError("verification returned a different probe_id");
  }
  return { ok: value.ok, probe_id: value.probe_id, proof_valid: value.proof_valid };
}

function normalizedBaseUrl(value) {
  const parsed = new URL(String(value));
  if (!new Set(["http:", "https:"]).has(parsed.protocol) || parsed.username || parsed.password) {
    throw new TypeError("ACTION_REGRESSION_BASE_URL must be an absolute HTTP(S) URL without credentials");
  }
  parsed.pathname = parsed.pathname.replace(/\/+$/, "");
  parsed.search = "";
  parsed.hash = "";
  return parsed.href.replace(/\/$/, "");
}

function safeRequestId(value) {
  return typeof value === "string" && REQUEST_ID_PATTERN.test(value) ? value : null;
}

function assertPlainObjectWithExactKeys(value, expectedKeys, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(`${label} response must be an object`);
  }
  const keys = Object.keys(value).sort();
  if (keys.length !== expectedKeys.length || keys.some((key, index) => key !== expectedKeys[index])) {
    throw new TypeError(`${label} response contains unexpected fields`);
  }
}
