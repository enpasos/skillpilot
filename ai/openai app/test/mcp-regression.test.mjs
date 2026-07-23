import assert from "node:assert/strict";
import { createServer as createHttpServer } from "node:http";
import test from "node:test";
import { ActionRegressionClient } from "../mcp-regression/action-regression-client.mjs";
import { createRegressionHttpServer } from "../mcp-regression/app-server.mjs";
import { RegressionAuditLogger } from "../mcp-regression/audit-logger.mjs";
import { REGRESSION_SERVER_NAME } from "../mcp-regression/create-mcp-server.mjs";

const PROBE = Object.freeze({
  probe_id: "8b21986a-6ad7-4c05-9e7f-e969f08b113e",
  token: "SPREG-ABCDEFGHJKLMNPQR",
  proof: "0123456789abcdef0123456789abcdef"
});
const VERIFICATION = Object.freeze({ ok: true, probe_id: PROBE.probe_id, proof_valid: true });

async function withRegressionServer(run, options = {}) {
  const audit = [];
  const client =
    options.client ??
    {
      createProbe: async () => ({ payload: { ...PROBE }, backendRequestId: "backend-create-1" }),
      verifyProbe: async (probe) => {
        assert.deepEqual(probe, PROBE);
        return { payload: { ...VERIFICATION }, backendRequestId: "backend-verify-1" };
      }
    };
  const server = createRegressionHttpServer({
    client,
    auditLogger: new RegressionAuditLogger({ sink: (line) => audit.push(JSON.parse(line)) })
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  try {
    await run(`http://127.0.0.1:${server.address().port}`, audit);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

async function rpc(baseUrl, method, params = {}) {
  const response = await fetch(`${baseUrl}/mcp`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params })
  });
  if (response.status !== 200) {
    assert.fail(`Unexpected HTTP ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  assert.equal(payload.error, undefined, JSON.stringify(payload.error));
  return payload.result;
}

function callParams(name, argumentsValue = {}, session = undefined) {
  return {
    name,
    arguments: argumentsValue,
    ...(session ? { _meta: { "openai/session": session } } : {})
  };
}

test("UI-less endpoint exposes exactly two regression tools and no UI capability", async () => {
  await withRegressionServer(async (baseUrl) => {
    const initialized = await rpc(baseUrl, "initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "skillpilot-regression-test", version: "0.1.0" }
    });
    assert.equal(initialized.serverInfo.name, REGRESSION_SERVER_NAME);
    assert.equal(initialized.capabilities.resources, undefined);
    assert.match(initialized.instructions, /MCP_RUN_RETAIN/);

    const tools = (await rpc(baseUrl, "tools/list")).tools;
    assert.deepEqual(
      tools.map(({ name }) => name),
      [
        "create_mcp_retention_probe",
        "verify_mcp_retention_probe"
      ]
    );
    for (const tool of tools) {
      const serialized = JSON.stringify(tool);
      assert.doesNotMatch(serialized, /resourceUri|outputTemplate|widget|\"ui\"/i);
      assert.deepEqual(tool._meta.securitySchemes, [{ type: "noauth" }]);
      assert.equal(tool.annotations.openWorldHint, false);
      assert.equal(tool.inputSchema.additionalProperties, false);
      assert.equal(tool.outputSchema.additionalProperties, false);
    }
    const create = tools.find(({ name }) => name === "create_mcp_retention_probe");
    const verify = tools.find(({ name }) => name === "verify_mcp_retention_probe");
    assert.match(create.description, /MCP_RUN_SINGLE/);
    assert.match(create.description, /never call verify_mcp_retention_probe/i);
    assert.match(create.description, /Only MCP_RUN_CHAIN permits/i);
    assert.match(create.description, /Never call this tool for MCP_RECALL_RETAIN/i);
    assert.match(verify.description, /Never call this tool for MCP_RUN_SINGLE/i);
    assert.match(verify.description, /MCP_VERIFY_RETAIN/);
    assert.match(verify.description, /Never create a replacement tuple/i);
    assert.match(create.outputSchema.properties.probe_id.pattern, /\[89ab\]/);
    assert.match(create.outputSchema.properties.token.pattern, /SPREG-/);
    assert.equal(create.outputSchema.properties.proof.pattern, "^[0-9a-f]{32}$");
    assert.deepEqual(verify.inputSchema.properties, create.outputSchema.properties);
  });
});

test("standalone HTTP surface has health, CORS, no-store, and closed unknown routes", async () => {
  await withRegressionServer(async (baseUrl) => {
    const health = await fetch(`${baseUrl}/health`);
    assert.equal(health.status, 200);
    assert.equal(health.headers.get("cache-control"), "no-store");
    assert.deepEqual(await health.json(), {
      status: "ok",
      service: "skillpilot-openai-mcp-retention-regression",
      mcpPath: "/mcp",
      ui: false
    });

    const cors = await fetch(`${baseUrl}/mcp`, { method: "OPTIONS" });
    assert.equal(cors.status, 204);
    assert.equal(cors.headers.get("access-control-allow-origin"), "*");
    assert.equal(cors.headers.get("cache-control"), "no-store");

    const missing = await fetch(`${baseUrl}/not-found`);
    assert.equal(missing.status, 404);
    assert.equal(missing.headers.get("cache-control"), "no-store");
  });
});

test("create and verify proxy the exact tuple while ordinary content contains no values", async () => {
  await withRegressionServer(async (baseUrl, audit) => {
    const created = await rpc(
      baseUrl,
      "tools/call",
      callParams("create_mcp_retention_probe", {}, "chat-correlation-A")
    );
    assert.deepEqual(created.structuredContent, PROBE);
    assert.deepEqual(created.content, [
      {
        type: "text",
        text: "MCP_CREATE_COMPLETE. Do not call verify_mcp_retention_probe unless the exact initiating command is MCP_RUN_CHAIN."
      }
    ]);
    assert.doesNotMatch(JSON.stringify(created.content), /SPREG-|8b21986a|0123456789abcdef/);
    assert.equal(created._meta, undefined);

    const verified = await rpc(
      baseUrl,
      "tools/call",
      callParams("verify_mcp_retention_probe", PROBE, "chat-correlation-A")
    );
    assert.deepEqual(verified.structuredContent, VERIFICATION);
    assert.deepEqual(verified.content, [
      {
        type: "text",
        text: "MCP_VERIFY_COMPLETE. Use structuredContent and follow the exact response format for the initiating command."
      }
    ]);
    assert.doesNotMatch(JSON.stringify(verified.content), /SPREG-|8b21986a|0123456789abcdef/);
    assert.equal(verified._meta, undefined);

    assert.deepEqual(
      audit.map(({ event }) => event),
      ["probe_created", "probe_verified"]
    );
    assert.equal(audit[0].backend_request_id, "backend-create-1");
    assert.equal(audit[0].session_present, true);
    assert.match(audit[0].session_sha256, /^[0-9a-f]{64}$/);
    assert.equal(audit[1].session_sha256, audit[0].session_sha256);
    assert.equal(JSON.stringify(audit).includes("chat-correlation-A"), false);
    assert.equal(JSON.stringify(audit).includes(PROBE.token), false);
    assert.equal(JSON.stringify(audit).includes(PROBE.proof), false);
  });
});

test("missing or invalid openai/session is audited as absent and is never required", async () => {
  await withRegressionServer(async (baseUrl, audit) => {
    const created = await rpc(
      baseUrl,
      "tools/call",
      callParams("create_mcp_retention_probe")
    );
    const verified = await rpc(baseUrl, "tools/call", {
      name: "verify_mcp_retention_probe",
      arguments: PROBE,
      _meta: { "openai/session": "contains a space" }
    });
    assert.deepEqual(created.structuredContent, PROBE);
    assert.deepEqual(verified.structuredContent, VERIFICATION);
    assert.equal(audit[0].session_present, false);
    assert.equal(audit[0].session_sha256, null);
    assert.equal(audit[1].session_present, false);
    assert.equal(audit[1].session_sha256, null);
  });
});

test("a one-character proof mutation produces a negative MCP verification", async () => {
  const client = {
    createProbe: async () => ({ payload: { ...PROBE }, backendRequestId: "backend-create-3" }),
    verifyProbe: async (probe) => ({
      payload: {
        ok: probe.proof === PROBE.proof,
        probe_id: probe.probe_id,
        proof_valid: probe.proof === PROBE.proof
      },
      backendRequestId: "backend-negative-3"
    })
  };
  await withRegressionServer(
    async (baseUrl, audit) => {
      const mutatedProof = `${PROBE.proof.slice(0, -1)}0`;
      const result = await rpc(
        baseUrl,
        "tools/call",
        callParams(
          "verify_mcp_retention_probe",
          { ...PROBE, proof: mutatedProof },
          "chat-correlation-negative"
        )
      );
      assert.deepEqual(result.structuredContent, {
        ok: false,
        probe_id: PROBE.probe_id,
        proof_valid: false
      });
      assert.equal(result._meta, undefined);
      assert.equal(audit[0].event, "probe_verified");
      assert.equal(audit[0].proof_valid, false);
      assert.equal(JSON.stringify(audit).includes(mutatedProof), false);
    },
    { client }
  );
});

test("public API client preserves methods, exact fields, and backend request IDs", async () => {
  const requests = [];
  const backend = createHttpServer(async (request, response) => {
    let body = "";
    for await (const chunk of request) body += chunk;
    requests.push({ method: request.method, url: request.url, body });
    response.setHeader("content-type", "application/json");
    response.setHeader("x-regression-request-id", `request-${requests.length}`);
    if (request.method === "GET" && request.url === "/api/action-regression/v1/probe") {
      response.end(JSON.stringify(PROBE));
      return;
    }
    if (request.method === "POST" && request.url === "/api/action-regression/v1/verify") {
      const submitted = JSON.parse(body);
      response.end(
        JSON.stringify({
          ok: submitted.proof === PROBE.proof,
          probe_id: submitted.probe_id,
          proof_valid: submitted.proof === PROBE.proof
        })
      );
      return;
    }
    response.writeHead(404).end();
  });
  await new Promise((resolve) => backend.listen(0, "127.0.0.1", resolve));
  try {
    const client = new ActionRegressionClient({
      baseUrl: `http://127.0.0.1:${backend.address().port}/api/action-regression`
    });
    const created = await client.createProbe();
    assert.deepEqual(created, { payload: PROBE, backendRequestId: "request-1" });
    const verified = await client.verifyProbe(created.payload);
    assert.deepEqual(verified, { payload: VERIFICATION, backendRequestId: "request-2" });
    const mutated = await client.verifyProbe({
      ...created.payload,
      proof: `${created.payload.proof.slice(0, -1)}0`
    });
    assert.deepEqual(mutated, {
      payload: { ok: false, probe_id: PROBE.probe_id, proof_valid: false },
      backendRequestId: "request-3"
    });
    assert.deepEqual(
      requests.map(({ method, url }) => [method, url]),
      [
        ["GET", "/api/action-regression/v1/probe"],
        ["POST", "/api/action-regression/v1/verify"],
        ["POST", "/api/action-regression/v1/verify"]
      ]
    );
  } finally {
    await new Promise((resolve, reject) =>
      backend.close((error) => (error ? reject(error) : resolve()))
    );
  }
});
