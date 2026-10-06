// SPDX-License-Identifier: Apache-2.0
import assert from "node:assert/strict";
import { createHash, randomBytes } from "node:crypto";
import { mkdir, mkdtemp, readFile, readdir, rename, rm } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { createPocApp } from "../server/app.mjs";

const CLIENT_ID = "skillpilot-gemini-poc";
const REDIRECT_URI = "https://gemini.google.com/poc-test/oauth/callback";
const TOOL_NAMES = [
  "get_skillpilot_poc_status",
  "get_skillpilot_poc_context",
  "record_skillpilot_poc_completion"
];

async function listen(appOptions) {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const origin = `http://127.0.0.1:${server.address().port}`;
  const app = createPocApp({ ...appOptions, origin });
  server.on("request", app);
  return {
    app,
    origin,
    async close() {
      server.closeAllConnections();
      await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    }
  };
}

async function withServer(run) {
  const dataDir = await mkdtemp(join(tmpdir(), "skillpilot-gemini-poc-protocol-"));
  const clock = { value: Date.now() };
  const audit = [];
  const options = {
    operatorKey: randomBytes(32).toString("base64url"),
    clientSecret: randomBytes(32).toString("base64url"),
    redirectUris: [REDIRECT_URI],
    dataDir,
    now: () => clock.value,
    audit: (event) => audit.push(event)
  };
  let service = await listen(options);
  const harness = {
    options, clock, audit, dataDir,
    get app() { return service.app; },
    get origin() { return service.origin; },
    async restart() {
      await service.close();
      service = await listen(options);
    }
  };
  try {
    await run(harness);
  } finally {
    await service.close();
    await rm(dataDir, { recursive: true, force: true });
  }
}

// Exercise the same OAuth code/consent/token exchange as a confidential host;
// no test-only token mint bypass is used by these protocol tests.
async function authorize(harness) {
  const verifier = randomBytes(32).toString("base64url");
  const state = randomBytes(24).toString("base64url");
  const authorization = new URL("/authorize", harness.origin);
  authorization.search = new URLSearchParams({
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: "code",
    code_challenge_method: "S256",
    code_challenge: createHash("sha256").update(verifier).digest("base64url"),
    scope: "poc:probe",
    resource: `${harness.origin}/mcp`,
    state
  });
  const consentPage = await fetch(authorization, { redirect: "manual" });
  assert.equal(consentPage.status, 200);
  assert.equal(consentPage.headers.get("referrer-policy"), "strict-origin",
    "the consent page must override the app default so browser forms retain a same-origin Origin");
  const nonce = (await consentPage.text()).match(/name="nonce"\s+value="([^"]+)"/)?.[1];
  assert.ok(nonce, "authorization must require an explicit consent form");
  const consent = await fetch(`${harness.origin}/consent`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      nonce, operator_key: harness.options.operatorKey, decision: "allow"
    }),
    redirect: "manual"
  });
  assert.equal(consent.status, 302);
  const callback = new URL(consent.headers.get("location"));
  assert.equal(callback.origin + callback.pathname, REDIRECT_URI);
  assert.equal(callback.searchParams.get("state"), state);
  assert.ok(callback.searchParams.get("code"));
  const tokenResponse = await fetch(`${harness.origin}/token`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${harness.options.clientSecret}`).toString("base64")}`
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: callback.searchParams.get("code"),
      code_verifier: verifier,
      redirect_uri: REDIRECT_URI,
      resource: `${harness.origin}/mcp`
    })
  });
  assert.equal(tokenResponse.status, 200);
  const tokens = await tokenResponse.json();
  assert.ok(tokens.access_token);
  return tokens.access_token;
}

async function rpc(harness, token, method, params = {}) {
  const response = await fetch(`${harness.origin}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "MCP-Protocol-Version": "2025-11-25",
      ...(token === undefined ? {} : { authorization: `Bearer ${token}` })
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  const body = await response.text();
  return { status: response.status, headers: response.headers, body, payload: body ? JSON.parse(body) : null };
}

async function call(harness, token, name, args = {}) {
  const response = await rpc(harness, token, "tools/call", { name, arguments: args });
  assert.equal(response.status, 200, response.body);
  assert.equal(response.payload.error, undefined, response.body);
  return response.payload.result;
}

async function session(harness) {
  const response = await fetch(`${harness.origin}/operator/sessions`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${harness.options.operatorKey}`,
      "content-type": "application/json"
    },
    body: "{}"
  });
  assert.equal(response.status, 201);
  const issued = await response.json();
  assert.ok(issued.probeSessionId);
  assert.ok(issued.startPrompt.includes(issued.probeSessionId));
  assert.equal(new Date(issued.expiresAt).getTime(), harness.clock.value + 24 * 60 * 60 * 1000);
  return issued;
}

function assertSuccess(result) {
  assert.notEqual(result.isError, true, JSON.stringify(result));
  assert.equal(result.structuredContent.syntheticOnly, true);
  assert.doesNotMatch(JSON.stringify(result), /skillpilotId|learnerId|chatSessionToken|workFeedback|outcomeFeedback/);
  return result.structuredContent;
}

async function contentsOf(directory) {
  const chunks = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) chunks.push(await contentsOf(path));
    else if (entry.isFile()) chunks.push(await readFile(path, "utf8"));
  }
  return chunks.join("\n");
}

test("HTTP audit retains the public SDK metadata and OAuth routes", async () => {
  await withServer(async (harness) => {
    const metadataRoutes = [
      "/.well-known/oauth-authorization-server",
      "/.well-known/oauth-protected-resource/mcp"
    ];
    for (const route of metadataRoutes) {
      const response = await fetch(`${harness.origin}${route}`);
      assert.equal(response.status, 200);
      await response.json();
    }
    const accessToken = await authorize(harness);
    assert.deepEqual(harness.audit.filter((event) => event.event === "http"), [
      ...metadataRoutes.map((route) => ({ event: "http", route, method: "GET", status: 200 })),
      { event: "http", route: "/authorize", method: "GET", status: 200 },
      { event: "http", route: "/consent", method: "POST", status: 302 },
      { event: "http", route: "/token", method: "POST", status: 200 }
    ]);
    for (const secret of [accessToken, harness.options.operatorKey, harness.options.clientSecret]) {
      assert.equal(JSON.stringify(harness.audit).includes(secret), false);
    }
  });
});

test("MCP request audit retains only bounded methods and incoming protocol versions", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    harness.audit.length = 0;
    const privateInput = "FORBIDDEN_PROTOCOL_INPUT_a30bca22";
    const initializeParams = {
      protocolVersion: "2025-06-18",
      capabilities: { experimental: { privateInput } },
      clientInfo: { name: privateInput, version: privateInput },
      _meta: { privateInput }
    };
    const initialized = await rpc(harness, accessToken, "initialize", initializeParams);
    assert.equal(initialized.status, 200);
    assert.equal((await rpc(harness, accessToken, "tools/list")).status, 200);
    assertSuccess(await call(harness, accessToken, TOOL_NAMES[0]));
    const notified = await fetch(`${harness.origin}/mcp`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": "2025-11-25"
      },
      body: JSON.stringify({ jsonrpc: "2.0", method: "notifications/initialized", params: { privateInput } })
    });
    assert.equal(notified.status, 202);
    await notified.text();
    await rpc(harness, accessToken, privateInput, { privateInput });
    const malformedVersion = await fetch(`${harness.origin}/mcp`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${accessToken}`,
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        "MCP-Protocol-Version": privateInput
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: privateInput, method: "initialize", params: {
        ...initializeParams, protocolVersion: privateInput
      } })
    });
    await malformedVersion.text();
    assert.deepEqual(harness.audit.filter((event) => event.event === "mcp.request"), [
      { event: "mcp.request", rpcMethod: "initialize", protocolVersion: "2025-06-18" },
      { event: "mcp.request", rpcMethod: "tools/list", protocolVersion: "2025-11-25" },
      { event: "mcp.request", rpcMethod: "tools/call", protocolVersion: "2025-11-25" },
      { event: "mcp.request", rpcMethod: "notifications/initialized", protocolVersion: "2025-11-25" },
      { event: "mcp.request", rpcMethod: "other", protocolVersion: "2025-11-25" },
      { event: "mcp.request", rpcMethod: "initialize" }
    ]);
    assert.equal(JSON.stringify(harness.audit).includes(privateInput), false,
      "method, version, client info, capabilities, metadata, params and request IDs must not copy free input");
    assert.equal(JSON.stringify(harness.audit).includes(accessToken), false);
  });
});

test("MCP authentication and operator authorization remain separate", async () => {
  await withServer(async (harness) => {
    for (const token of [undefined, "foreign-openai-or-claude-token", harness.options.operatorKey]) {
      const denied = await rpc(harness, token, "tools/list");
      assert.equal(denied.status, 401);
      assert.match(denied.headers.get("www-authenticate"), /resource_metadata=/);
    }
    const accessToken = await authorize(harness);
    for (const token of [undefined, "incorrect-operator-key", accessToken]) {
      const denied = await fetch(`${harness.origin}/operator/sessions`, {
        method: "POST",
        headers: token ? { authorization: `Bearer ${token}` } : {}
      });
      assert.equal(denied.status, 401);
    }
    const initialized = await rpc(harness, accessToken, "initialize", {
      protocolVersion: "2025-11-25", capabilities: {},
      clientInfo: { name: "skillpilot-gemini-poc-contract-test", version: "0.1.0" }
    });
    assert.equal(initialized.status, 200);
    assert.match(initialized.payload.result.serverInfo.name, /gemini.*poc|poc.*gemini/i);
    assert.equal(initialized.headers.has("mcp-session-id"), false,
      "MCP transport state must not substitute for the explicit probe session");
    const status = assertSuccess(await call(harness, accessToken, TOOL_NAMES[0]));
    assert.match(JSON.stringify(status), /poc|canary|synthetic/i);
    const missingSession = await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: `gp_${randomBytes(32).toString("base64url")}`
    });
    assert.equal(missingSession.isError, true);
    assert.equal(missingSession.structuredContent.code, "SESSION_REQUIRED");
  });
});

test("the isolated tool catalog accepts only its small structured canary inputs", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    const listed = await rpc(harness, accessToken, "tools/list");
    assert.equal(listed.status, 200);
    const tools = listed.payload.result.tools;
    assert.deepEqual(tools.map((tool) => tool.name).sort(), [...TOOL_NAMES].sort());
    for (const tool of tools) {
      assert.ok(tool.description?.trim());
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.annotations.openWorldHint, false);
      assert.equal(tool.annotations.destructiveHint, false);
      assert.equal(tool.annotations.readOnlyHint, tool.name !== TOOL_NAMES[2]);
      assert.doesNotMatch(JSON.stringify(Object.keys(tool.inputSchema.properties)),
        /skillpilotId|learnerId|answer|feedback|mastery|goalId/i);
    }
    assert.deepEqual(Object.keys(tools.find((tool) => tool.name === TOOL_NAMES[0]).inputSchema.properties), []);
    assert.deepEqual(Object.keys(tools.find((tool) => tool.name === TOOL_NAMES[1]).inputSchema.properties), ["probeSessionId"]);
    assert.deepEqual(Object.keys(tools.find((tool) => tool.name === TOOL_NAMES[2]).inputSchema.properties).sort(),
      ["completionCapability", "probeSessionId"]);
    const issued = await session(harness);
    const before = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    const privateProse = "FORBIDDEN_CHAT_PROSE_75fe7407";
    for (const [name, args] of [
      [TOOL_NAMES[0], { learnerId: privateProse }],
      [TOOL_NAMES[1], { probeSessionId: issued.probeSessionId, answer: privateProse }],
      [TOOL_NAMES[2], {
        probeSessionId: issued.probeSessionId,
        completionCapability: before.completionCapability,
        workFeedback: privateProse
      }],
      [TOOL_NAMES[2], {
        probeSessionId: issued.probeSessionId,
        completionCapability: before.completionCapability,
        metadata: { outcomeFeedback: privateProse }
      }]
    ]) {
      const rejected = await rpc(harness, accessToken, "tools/call", { name, arguments: args });
      assert.equal(rejected.status, 200);
      assert.ok(rejected.payload.error || rejected.payload.result?.isError, "unknown arguments must fail");
    }
    const after = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    assert.equal(after.completed, false);
    assert.equal(after.stateVersion, before.stateVersion);
    assert.equal((await contentsOf(harness.dataDir)).includes(privateProse), false,
      "rejected chat prose must not reach persisted state");
    assert.equal(JSON.stringify(harness.audit).includes(privateProse), false,
      "audit records must not copy rejected input prose");
  });
});

test("completion is persisted, replayed without another mutation and recoverable after restart", async () => {
  await withServer(async (harness) => {
    let accessToken = await authorize(harness);
    const issued = await session(harness);
    const initial = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    assert.equal(initial.completed, false);
    assert.equal(initial.stateVersion, 0);
    assert.ok(initial.completionCapability);
    const input = { probeSessionId: issued.probeSessionId, completionCapability: initial.completionCapability };
    const concurrent = await Promise.all(Array.from({ length: 8 }, () =>
      call(harness, accessToken, TOOL_NAMES[2], input)));
    const completed = concurrent[0];
    for (const receipt of concurrent) assert.deepEqual(receipt, completed,
      "concurrent duplicate saves must share one persisted receipt");
    const receipt = assertSuccess(completed);
    assert.equal(receipt.saved, true);
    assert.equal(receipt.completed, true);
    assert.equal(receipt.stateVersion, 1);
    assert.ok(Number.isFinite(new Date(receipt.savedAt).getTime()));
    assert.deepEqual(await call(harness, accessToken, TOOL_NAMES[2], input), completed,
      "retry must return the saved receipt without a second mutation");
    const subsequent = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    assert.equal(subsequent.completed, true);
    assert.equal(subsequent.stateVersion, 1);
    assert.equal(subsequent.completionCapability, undefined);
    assert.equal((await contentsOf(harness.dataDir)).includes(issued.probeSessionId), false,
      "persist the probe-session hash instead of its bearer value");
    await harness.restart();
    accessToken = await authorize(harness);
    const recovered = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    assert.equal(recovered.completed, true);
    assert.equal(recovered.stateVersion, 1);
    assert.deepEqual(await call(harness, accessToken, TOOL_NAMES[2], input), completed);
  });
});

test("an ordinary MCP SDK client completes initialize, discovery and a persisted canary", async () => {
  await withServer(async (harness) => {
    const token = await authorize(harness);
    const issued = await session(harness);
    const client = new Client({ name: "gemini-poc-sdk-client", version: "0.1.0" }, { capabilities: {} });
    const transport = new StreamableHTTPClientTransport(new URL(`${harness.origin}/mcp`), {
      requestInit: { headers: { authorization: `Bearer ${token}` } }
    });
    try {
      await client.connect(transport);
      const tools = await client.listTools();
      assert.deepEqual(tools.tools.map((tool) => tool.name).sort(), [...TOOL_NAMES].sort());
      const context = assertSuccess(await client.callTool({
        name: TOOL_NAMES[1], arguments: { probeSessionId: issued.probeSessionId }
      }));
      const receipt = assertSuccess(await client.callTool({
        name: TOOL_NAMES[2],
        arguments: { probeSessionId: issued.probeSessionId, completionCapability: context.completionCapability }
      }));
      assert.equal(receipt.saved, true);
      const subsequent = assertSuccess(await client.callTool({
        name: TOOL_NAMES[1], arguments: { probeSessionId: issued.probeSessionId }
      }));
      assert.equal(subsequent.completed, true);
      assert.equal(subsequent.stateVersion, 1);
    } finally {
      await client.close();
    }
  });
});

test("capabilities are bound to one probe session and reject altered values", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    const a = await session(harness);
    const b = await session(harness);
    assert.notEqual(a.probeSessionId, b.probeSessionId);
    const aContext = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: a.probeSessionId }));
    const bContext = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: b.probeSessionId }));
    assert.notEqual(aContext.completionCapability, bContext.completionCapability);
    for (const args of [
      { probeSessionId: b.probeSessionId, completionCapability: aContext.completionCapability },
      { probeSessionId: a.probeSessionId, completionCapability: `${aContext.completionCapability}altered` },
      { probeSessionId: "sps_openai-session", completionCapability: aContext.completionCapability },
      { probeSessionId: "spc_claude-session", completionCapability: aContext.completionCapability }
    ]) {
      assert.equal((await call(harness, accessToken, TOOL_NAMES[2], args)).isError, true);
    }
    const receipt = assertSuccess(await call(harness, accessToken, TOOL_NAMES[2], {
      probeSessionId: a.probeSessionId, completionCapability: aContext.completionCapability
    }));
    assert.equal(receipt.stateVersion, 1);
    const unaffected = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: b.probeSessionId }));
    assert.equal(unaffected.completed, false);
    assert.equal(unaffected.stateVersion, 0);
  });
});

test("the absolute session lifetime and one-hour action boundary guard reads, writes and replays", async () => {
  await withServer(async (harness) => {
    let accessToken = await authorize(harness);
    const issued = await session(harness);
    const initial = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: issued.probeSessionId }));
    const args = { probeSessionId: issued.probeSessionId, completionCapability: initial.completionCapability };
    const expiresAt = new Date(issued.expiresAt).getTime();
    harness.clock.value = expiresAt - 60 * 60 * 1000;
    accessToken = await authorize(harness);
    assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: issued.probeSessionId }));
    const receipt = assertSuccess(await call(harness, accessToken, TOOL_NAMES[2], args));
    assert.equal(receipt.stateVersion, 1);
    harness.clock.value += 1;
    for (const [name, input] of [[TOOL_NAMES[1], { probeSessionId: issued.probeSessionId }], [TOOL_NAMES[2], args]]) {
      const denied = await call(harness, accessToken, name, input);
      assert.equal(denied.isError, true);
      assert.equal(denied.structuredContent.code, "SESSION_RENEWAL_REQUIRED");
    }
    harness.clock.value = expiresAt;
    accessToken = await authorize(harness);
    const expired = await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: issued.probeSessionId });
    assert.equal(expired.isError, true);
    assert.equal(expired.structuredContent.code, "SESSION_REQUIRED");
    const fresh = await session(harness);
    assert.notEqual(fresh.probeSessionId, issued.probeSessionId);
    accessToken = await authorize(harness);
    const freshContext = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], { probeSessionId: fresh.probeSessionId }));
    assert.equal(freshContext.stateVersion, 0);
    assert.equal(freshContext.completed, false);
  });
});

test("malformed, oversized and non-JSON MCP inputs stop before tools or persistence", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    const issued = await session(harness);
    const original = await readFile(join(harness.dataDir, "probe-state.json"), "utf8");
    const marker = "REJECTED_OVERSIZED_PROSE_8c477dab";
    const cases = [
      { contentType: "application/json", body: '{"jsonrpc":', status: 400, code: "INVALID_JSON" },
      {
        contentType: "application/json",
        body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/call", params: {
          name: TOOL_NAMES[2], arguments: { probeSessionId: issued.probeSessionId, answer: marker.repeat(1000) }
        } }),
        status: 413, code: "INPUT_TOO_LARGE"
      },
      { contentType: "text/plain", body: "{}", status: 415, code: "JSON_REQUIRED" }
    ];
    for (const attempt of cases) {
      const response = await fetch(`${harness.origin}/mcp`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${accessToken}`,
          "content-type": attempt.contentType,
          accept: "application/json, text/event-stream"
        },
        body: attempt.body
      });
      assert.equal(response.status, attempt.status);
      assert.equal((await response.json()).code, attempt.code);
    }
    const unauthenticated = await fetch(`${harness.origin}/mcp`, {
      method: "POST", headers: { "content-type": "application/json" }, body: marker.repeat(1000)
    });
    assert.equal(unauthenticated.status, 401, "OAuth must run before processing untrusted request bodies");
    assert.equal(await readFile(join(harness.dataDir, "probe-state.json"), "utf8"), original);
    assert.equal(JSON.stringify(harness.audit).includes(marker), false);
    assert.equal(harness.audit.some((event) => event.event === "tool"), false,
      "rejected HTTP bodies must never invoke a tool");
  });
});

test("read tools and HTTP read requests cannot record a completion", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    const issued = await session(harness);
    const stateFile = join(harness.dataDir, "probe-state.json");
    const original = await readFile(stateFile, "utf8");
    for (let round = 0; round < 3; round += 1) {
      const status = assertSuccess(await call(harness, accessToken, TOOL_NAMES[0]));
      assert.equal(status.saved, undefined);
      const context = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
        probeSessionId: issued.probeSessionId
      }));
      assert.equal(context.completed, false);
      assert.equal(context.stateVersion, 0);
      assert.equal(context.saved, undefined);
    }
    const readUrl = new URL("/mcp", harness.origin);
    readUrl.searchParams.set("name", TOOL_NAMES[2]);
    readUrl.searchParams.set("probeSessionId", issued.probeSessionId);
    const get = await fetch(readUrl, {
      headers: { authorization: `Bearer ${accessToken}`, accept: "text/event-stream" }
    });
    assert.equal(get.status, 405, "stateless JSON PoC offers no standalone SSE stream");
    await get.body?.cancel();
    assert.equal(await readFile(stateFile, "utf8"), original,
      "discovery and context reads must preserve the persisted state byte for byte");
    assert.equal(harness.audit.some((event) => event.event === "tool" && event.tool === TOOL_NAMES[2]), false);
  });
});

test("a failed disk commit returns no success and permits one later recovery save", async () => {
  await withServer(async (harness) => {
    const accessToken = await authorize(harness);
    const issued = await session(harness);
    const context = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
      probeSessionId: issued.probeSessionId
    }));
    const input = { probeSessionId: issued.probeSessionId, completionCapability: context.completionCapability };
    const stateFile = join(harness.dataDir, "probe-state.json");
    const backupFile = join(harness.dataDir, "probe-state.before-failure.json");
    const original = await readFile(stateFile, "utf8");
    await rename(stateFile, backupFile);
    await mkdir(stateFile, { mode: 0o700 });
    try {
      const failed = await call(harness, accessToken, TOOL_NAMES[2], input);
      assert.equal(failed.isError, true);
      assert.equal(failed.structuredContent.code, "PERSISTENCE_FAILED");
      assert.notEqual(failed.structuredContent.saved, true);
      assert.doesNotMatch(JSON.stringify(failed), /probe-state\.json|EISDIR|before-failure/);
      const unchanged = assertSuccess(await call(harness, accessToken, TOOL_NAMES[1], {
        probeSessionId: issued.probeSessionId
      }));
      assert.equal(unchanged.completed, false);
      assert.equal(unchanged.stateVersion, 0);
      assert.equal(await readFile(backupFile, "utf8"), original);
    } finally {
      await rm(stateFile, { recursive: true, force: true });
      await rename(backupFile, stateFile);
    }
    const recovered = assertSuccess(await call(harness, accessToken, TOOL_NAMES[2], input));
    assert.equal(recovered.saved, true);
    assert.equal(recovered.completed, true);
    assert.equal(recovered.stateVersion, 1);
    const persisted = JSON.parse(await readFile(stateFile, "utf8"));
    assert.equal(Object.values(persisted.sessions)[0].stateVersion, 1);
    assert.equal(Object.values(persisted.sessions)[0].completed, true);
  });
});
