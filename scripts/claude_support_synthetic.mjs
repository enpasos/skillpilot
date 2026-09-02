import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { verifyPublicClaudeDirectInstallBetaPublication } from "./claude_direct_install_beta_release.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const mainOrigin = "https://skillpilot.com";
const connectorOrigin = "https://mcp-claude-v1.skillpilot.com";
const protectedResourceUrl =
  `${connectorOrigin}/.well-known/oauth-protected-resource/mcp`;
const authorizationServerUrl =
  `${connectorOrigin}/.well-known/oauth-authorization-server`;
const connectorDocumentationUrl =
  "https://enpasos.github.io/skillpilot/deploy/claude-connector-v1-user-guide/";
const requiredScopes = ["skillpilot.read", "skillpilot.write"];

export const claudeSupportSyntheticTargets = Object.freeze({
  pluginPage: `${mainOrigin}/plugins`,
  legal: `${mainOrigin}/legal`,
  mainPrivacy: `${mainOrigin}/privacy`,
  connectorPrivacy: `${connectorOrigin}/privacy`,
  readiness: `${mainOrigin}/actuator/health/readiness`,
  protectedResourceMetadata: protectedResourceUrl,
  authorizationServerMetadata: authorizationServerUrl,
  mcp: `${connectorOrigin}/mcp`,
});

export async function verifyClaudeSupportSynthetic({
  fetchImpl = globalThis.fetch,
  verifyPublication = verifyPublicClaudeDirectInstallBetaPublication,
  timeoutMs = 10_000,
  maximumResponseBytes = 65_536,
  clock = () => Date.now(),
  checkedAt = () => new Date().toISOString(),
} = {}) {
  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl must be a function.");
  }
  if (typeof verifyPublication !== "function") {
    throw new Error("verifyPublication must be a function.");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs < 1 || timeoutMs > 60_000) {
    throw new Error("timeoutMs must be an integer from 1 through 60000.");
  }
  if (
    !Number.isSafeInteger(maximumResponseBytes) ||
    maximumResponseBytes < 1 ||
    maximumResponseBytes > 1_048_576
  ) {
    throw new Error(
      "maximumResponseBytes must be an integer from 1 through 1048576.",
    );
  }
  if (typeof clock !== "function" || typeof checkedAt !== "function") {
    throw new Error("clock and checkedAt must be functions.");
  }

  const readOnlyFetch = createReadOnlyFetch({
    fetchImpl,
    timeoutMs,
    maximumResponseBytes,
  });
  const checks = [];

  const publication = await runCheck({
    id: "public-plugin-publication",
    url: claudeSupportSyntheticTargets.pluginPage,
    clock,
    operation: () =>
      verifyPublication({
        baseUrl: mainOrigin,
        fetchImpl: readOnlyFetch,
      }),
  });
  checks.push(publication.check);

  checks.push(
    await checkHtml({
      id: "public-legal-page",
      url: claudeSupportSyntheticTargets.legal,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
    }),
  );
  checks.push(
    await checkHtml({
      id: "public-main-privacy-page",
      url: claudeSupportSyntheticTargets.mainPrivacy,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
    }),
  );
  checks.push(
    await checkHtml({
      id: "public-connector-privacy-page",
      url: claudeSupportSyntheticTargets.connectorPrivacy,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
      requiredTextMarkers: [
        'id="deutsch" class="language-section" lang="de"',
        'id="english" class="language-section" lang="en"',
        "support@skillpilot.com",
        "https://www.anthropic.com/legal/consumer-terms",
        "https://www.anthropic.com/legal/privacy",
      ],
    }),
  );

  checks.push(
    await checkJson({
      id: "application-readiness",
      url: claudeSupportSyntheticTargets.readiness,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
      expectedMediaTypes: ["application/vnd.spring-boot.actuator.v3+json"],
      validate: (body) => {
        if (!isRecord(body) || body.status !== "UP") {
          throw new Error("readiness status is not UP.");
        }
      },
    }),
  );

  checks.push(
    await checkJson({
      id: "oauth-protected-resource-metadata",
      url: protectedResourceUrl,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
      validate: validateProtectedResourceMetadata,
    }),
  );

  checks.push(
    await checkJson({
      id: "oauth-authorization-server-metadata",
      url: authorizationServerUrl,
      readOnlyFetch,
      maximumResponseBytes,
      clock,
      validate: validateAuthorizationServerMetadata,
    }),
  );

  checks.push(
    await checkMcpChallenge({
      id: "unauthenticated-mcp-challenge",
      url: claudeSupportSyntheticTargets.mcp,
      readOnlyFetch,
      clock,
    }),
  );

  const timestamp = checkedAt();
  assertCanonicalTimestamp(timestamp);

  return {
    schemaVersion: 1,
    synthetic: "claude-support-readiness",
    outcome: "pass",
    checkedAt: timestamp,
    candidate: {
      version: publication.value.version,
      sha256: publication.value.sha256,
    },
    checks,
  };
}

function createReadOnlyFetch({ fetchImpl, timeoutMs, maximumResponseBytes }) {
  return async (input, init = {}) => {
    const url = normalizeApprovedUrl(input);
    const method = String(init.method ?? "GET").toUpperCase();
    if (method !== "GET") {
      throw new Error("Claude support synthetic permits GET requests only.");
    }

    if (init.body !== undefined && init.body !== null) {
      throw new Error("Claude support synthetic GET requests must not have a body.");
    }
    const requestedHeaders = new Headers(init.headers);
    const unexpectedHeaders = [...requestedHeaders.keys()].filter(
      (name) => name !== "accept" && name !== "accept-encoding",
    );
    if (unexpectedHeaders.length !== 0) {
      throw new Error(
        "Claude support synthetic permits only fixed credential-free request headers.",
      );
    }
    const headers = new Headers({
      accept: requestedHeaders.get("accept") ?? "*/*",
      "accept-encoding": "identity",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    timeout.unref?.();
    let response;
    try {
      response = await fetchImpl(url, {
        ...init,
        method: "GET",
        redirect: "error",
        headers,
        signal: controller.signal,
        credentials: "omit",
      });
    } catch {
      clearTimeout(timeout);
      throw new Error(`request failed for approved target ${url.origin}${url.pathname}.`);
    }
    try {
      return await copyBoundedResponse(response, maximumResponseBytes);
    } catch (error) {
      if (error instanceof SafeSyntheticError) {
        throw error;
      }
      throw new Error(`request failed for approved target ${url.origin}${url.pathname}.`);
    } finally {
      clearTimeout(timeout);
    }
  };
}

class SafeSyntheticError extends Error {}

async function copyBoundedResponse(response, maximumResponseBytes) {
  if (
    response === null ||
    typeof response !== "object" ||
    typeof response.status !== "number" ||
    response.headers === undefined ||
    !(response.headers instanceof Headers)
  ) {
    throw new SafeSyntheticError("approved target returned an invalid fetch response.");
  }

  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^(0|[1-9][0-9]*)$/u.test(declaredLength)) {
      throw new SafeSyntheticError("response has an invalid Content-Length header.");
    }
    if (Number(declaredLength) > maximumResponseBytes) {
      throw new SafeSyntheticError("response exceeds the configured byte limit.");
    }
  }

  const chunks = [];
  let totalBytes = 0;
  if (response.body !== null) {
    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      totalBytes += value.byteLength;
      if (totalBytes > maximumResponseBytes) {
        await reader.cancel().catch(() => {});
        throw new SafeSyntheticError("response exceeds the configured byte limit.");
      }
      chunks.push(Buffer.from(value));
    }
  }

  return new Response(
    totalBytes === 0 ? null : Buffer.concat(chunks, totalBytes),
    {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    },
  );
}

function normalizeApprovedUrl(input) {
  let url;
  try {
    url = new URL(input instanceof URL ? input.href : String(input));
  } catch {
    throw new Error("Claude support synthetic received an invalid URL.");
  }
  if (
    url.protocol !== "https:" ||
    url.username !== "" ||
    url.password !== "" ||
    url.search !== "" ||
    url.hash !== ""
  ) {
    throw new Error("Claude support synthetic target is not an approved HTTPS URL.");
  }

  const approvedMainPath =
    url.origin === mainOrigin &&
    (url.pathname === "/plugins" ||
      url.pathname === "/legal" ||
      url.pathname === "/privacy" ||
      url.pathname === "/actuator/health/readiness" ||
      url.pathname === "/api/public/claude/plugins/index.json" ||
      url.pathname.startsWith("/api/public/claude/plugins/skillpilot-coach-v1/"));
  const approvedConnectorPath =
    url.origin === connectorOrigin &&
    [
      "/privacy",
      "/.well-known/oauth-protected-resource/mcp",
      "/.well-known/oauth-authorization-server",
      "/mcp",
    ].includes(url.pathname);
  if (!approvedMainPath && !approvedConnectorPath) {
    throw new Error("Claude support synthetic target is not allowlisted.");
  }
  return url;
}

async function checkHtml({
  id,
  url,
  readOnlyFetch,
  maximumResponseBytes,
  clock,
  requiredTextMarkers = [],
}) {
  return (
    await runCheck({
      id,
      url,
      clock,
      operation: async () => {
        const response = await fetchExpected(readOnlyFetch, url, 200);
        assertMediaType(response, "text/html");
        const bytes = await readBoundedBytes(response, maximumResponseBytes);
        if (bytes.length === 0) {
          throw new Error("HTML response is empty.");
        }
        const body = bytes.toString("utf8");
        if (!requiredTextMarkers.every((marker) => body.includes(marker))) {
          throw new Error("HTML response is missing required release markers.");
        }
        return { httpStatus: response.status };
      },
    })
  ).check;
}

async function checkJson({
  id,
  url,
  readOnlyFetch,
  maximumResponseBytes,
  clock,
  expectedMediaTypes = ["application/json"],
  validate,
}) {
  return (
    await runCheck({
      id,
      url,
      clock,
      operation: async () => {
        const response = await fetchExpected(readOnlyFetch, url, 200);
        assertMediaType(response, expectedMediaTypes);
        const bytes = await readBoundedBytes(response, maximumResponseBytes);
        let body;
        try {
          body = JSON.parse(bytes.toString("utf8"));
        } catch {
          throw new Error("response does not contain valid JSON.");
        }
        validate(body);
        return { httpStatus: response.status };
      },
    })
  ).check;
}

async function checkMcpChallenge({ id, url, readOnlyFetch, clock }) {
  return (
    await runCheck({
      id,
      url,
      clock,
      operation: async () => {
        const response = await fetchExpected(readOnlyFetch, url, 401);
        const challenge = response.headers.get("www-authenticate");
        if (challenge !== `Bearer resource_metadata="${protectedResourceUrl}"`) {
          throw new Error(
            "MCP response is missing the expected Bearer resource metadata challenge.",
          );
        }
        return { httpStatus: response.status };
      },
    })
  ).check;
}

async function fetchExpected(readOnlyFetch, url, expectedStatus) {
  const response = await readOnlyFetch(url, {
    method: "GET",
    headers: { accept: "*/*" },
  });
  if (
    response === null ||
    typeof response !== "object" ||
    typeof response.arrayBuffer !== "function" ||
    typeof response.status !== "number" ||
    response.headers === undefined
  ) {
    throw new Error("approved target returned an invalid fetch response.");
  }
  if (response.status !== expectedStatus) {
    throw new Error(`expected HTTP ${expectedStatus}, received HTTP ${response.status}.`);
  }
  return response;
}

async function readBoundedBytes(response, maximumResponseBytes) {
  const declaredLength = response.headers.get("content-length");
  if (declaredLength !== null) {
    if (!/^(0|[1-9][0-9]*)$/u.test(declaredLength)) {
      throw new Error("response has an invalid Content-Length header.");
    }
    if (Number(declaredLength) > maximumResponseBytes) {
      throw new Error("response exceeds the configured byte limit.");
    }
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length > maximumResponseBytes) {
    throw new Error("response exceeds the configured byte limit.");
  }
  return bytes;
}

function assertMediaType(response, expected) {
  const expectedTypes = Array.isArray(expected) ? expected : [expected];
  const contentType = response.headers.get("content-type");
  if (
    contentType === null ||
    !expectedTypes.includes(contentType.split(";", 1)[0].trim().toLowerCase())
  ) {
    throw new Error(
      `response does not have the expected ${expectedTypes.join(" or ")} media type.`,
    );
  }
}

function validateProtectedResourceMetadata(body) {
  if (!isRecord(body)) {
    throw new Error("protected-resource metadata is not an object.");
  }
  if (body.resource !== `${connectorOrigin}/mcp`) {
    throw new Error("protected-resource metadata has the wrong resource.");
  }
  assertExactStringSet(
    body.authorization_servers,
    [connectorOrigin],
    "protected-resource authorization servers",
  );
  assertExactStringSet(
    body.bearer_methods_supported,
    ["header"],
    "protected-resource bearer methods",
  );
  assertExactStringSet(
    body.scopes_supported,
    requiredScopes,
    "protected-resource scopes",
  );
  if (body.resource_documentation !== connectorDocumentationUrl) {
    throw new Error("protected-resource metadata has the wrong documentation URL.");
  }
}

function validateAuthorizationServerMetadata(body) {
  if (!isRecord(body)) {
    throw new Error("authorization-server metadata is not an object.");
  }
  const exactUrls = {
    issuer: connectorOrigin,
    authorization_endpoint: `${connectorOrigin}/oauth2/authorize`,
    token_endpoint: `${connectorOrigin}/oauth2/token`,
    revocation_endpoint: `${connectorOrigin}/oauth2/revoke`,
  };
  for (const [field, expected] of Object.entries(exactUrls)) {
    if (body[field] !== expected) {
      throw new Error(`authorization-server metadata has the wrong ${field}.`);
    }
  }
  assertExactStringSet(
    body.scopes_supported,
    [...requiredScopes, "offline_access"],
    "authorization-server scopes",
  );
  assertExactStringSet(
    body.response_types_supported,
    ["code"],
    "authorization-server response types",
  );
  assertExactStringSet(
    body.grant_types_supported,
    ["authorization_code", "refresh_token"],
    "authorization-server grant types",
  );
  assertExactStringSet(
    body.token_endpoint_auth_methods_supported,
    ["none"],
    "authorization-server token authentication methods",
  );
  assertExactStringSet(
    body.revocation_endpoint_auth_methods_supported,
    ["none"],
    "authorization-server revocation authentication methods",
  );
  assertExactStringSet(
    body.code_challenge_methods_supported,
    ["S256"],
    "authorization-server PKCE methods",
  );
  if (body.client_id_metadata_document_supported !== true) {
    throw new Error("authorization-server metadata does not advertise CIMD.");
  }
}

function assertExactStringSet(actual, expected, label) {
  if (
    !Array.isArray(actual) ||
    actual.some((value) => typeof value !== "string") ||
    new Set(actual).size !== actual.length ||
    actual.length !== expected.length ||
    !expected.every((value) => actual.includes(value))
  ) {
    throw new Error(`${label} are incomplete.`);
  }
}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

async function runCheck({ id, url, clock, operation }) {
  const startedAt = clock();
  try {
    const value = await operation();
    const finishedAt = clock();
    const httpStatus = isRecord(value) ? value.httpStatus : undefined;
    return {
      value,
      check: {
        id,
        url,
        outcome: "pass",
        ...(Number.isSafeInteger(httpStatus) ? { httpStatus } : {}),
        durationMs: Math.max(0, Math.round(finishedAt - startedAt)),
      },
    };
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown failure";
    throw new Error(`Claude support synthetic check ${id} failed: ${detail}`);
  }
}

function assertCanonicalTimestamp(value) {
  if (typeof value !== "string") {
    throw new Error("checkedAt must return a canonical UTC ISO-8601 timestamp.");
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    throw new Error("checkedAt must return a canonical UTC ISO-8601 timestamp.");
  }
}

async function main() {
  if (process.argv.length !== 3 || process.argv[2] !== "verify") {
    throw new Error(
      "Usage: node scripts/claude_support_synthetic.mjs verify",
    );
  }
  const result = await verifyClaudeSupportSynthetic();
  console.log(JSON.stringify(result, null, 2));
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : "Unknown failure.");
    process.exitCode = 1;
  });
}
