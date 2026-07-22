import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createAppHttpServer } from "../server/app-server.mjs";
import { CoachStore } from "../server/coach-store.mjs";
import { contracts } from "../server/contracts/index.mjs";

async function withServer(run) {
  const dataDir = await mkdtemp(join(tmpdir(), "skillpilot-mcp-protocol-"));
  const server = createAppHttpServer({ coachStore: new CoachStore({ dataDir }) });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
  }
}

async function rpc(baseUrl, locale, method, params = {}) {
  const response = await fetch(`${baseUrl}/mcp/${locale}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream"
    },
    body: JSON.stringify({ jsonrpc: "2.0", id: Math.floor(Math.random() * 1_000_000), method, params })
  });
  if (response.status !== 200) {
    assert.fail(`Unexpected HTTP ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  assert.equal(payload.error, undefined, JSON.stringify(payload.error));
  return payload.result;
}

test("DE and EN expose isolated, correctly annotated tool and resource contracts", async () => {
  await withServer(async (baseUrl) => {
    for (const contract of Object.values(contracts)) {
      const initialized = await rpc(baseUrl, contract.locale, "initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "skillpilot-contract-test", version: "0.1.0" }
      });
      assert.equal(initialized.serverInfo.name, contract.serverName);
      assert.equal(initialized.instructions, contract.instructions);

      const tools = (await rpc(baseUrl, contract.locale, "tools/list")).tools;
      assert.equal(tools.length, 6);
      assert.ok(tools.every((tool) => tool.name.endsWith(`_${contract.locale}`)));

      const renderTool = tools.find((tool) => tool.name === contract.tools.open.name);
      assert.equal(renderTool._meta.ui.resourceUri, contract.resourceUri);
      assert.deepEqual(renderTool._meta.ui.visibility, ["model", "app"]);
      assert.deepEqual(renderTool._meta.securitySchemes, [{ type: "noauth" }]);
      assert.equal(renderTool.annotations.readOnlyHint, false);

      const chooseTool = tools.find((tool) => tool.name === contract.tools.choose.name);
      assert.deepEqual(chooseTool._meta.ui.visibility, ["app"]);
      assert.equal(chooseTool._meta.ui.resourceUri, undefined);
      assert.equal(chooseTool.annotations.openWorldHint, false);
      assert.equal("language" in chooseTool.inputSchema.properties, false);

      const resources = (await rpc(baseUrl, contract.locale, "resources/list")).resources;
      assert.equal(resources.length, 1);
      assert.equal(resources[0].uri, contract.resourceUri);
      assert.equal(resources[0].mimeType, "text/html;profile=mcp-app");

      const read = await rpc(baseUrl, contract.locale, "resources/read", { uri: contract.resourceUri });
      assert.equal(read.contents[0].mimeType, "text/html;profile=mcp-app");
      assert.match(read.contents[0].text, /ui\/initialize/);
      assert.doesNotMatch(read.contents[0].text, /<script[^>]+src=/i);
    }
  });
});

test("complete DE flow crosses the widget boundary without leaking opaque references", async () => {
  await withServer(async (baseUrl) => {
    const contract = contracts.de;
    const emptyContext = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.context.name,
      arguments: {}
    });
    assert.equal(emptyContext.structuredContent.phase, "not-started");
    assert.equal(emptyContext.content[0].text, contract.copy.emptyContext);

    const opened = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.open.name,
      arguments: { learning_request: "Ich möchte Mathematik in der Oberstufe in Hessen lernen." }
    });
    assert.equal(opened.structuredContent.phase, "scope-choice");
    assert.doesNotMatch(JSON.stringify(opened.structuredContent), /spapp_|choice_/);
    assert.doesNotMatch(JSON.stringify(opened.content), /spapp_|choice_/);
    assert.match(opened._meta.skillpilotApp.sessionRef, /^spapp_/);
    assert.equal(opened._meta.skillpilotApp.choiceRefs.length, 2);

    const selected = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.choose.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        choiceRef: opened._meta.skillpilotApp.choiceRefs[0]
      }
    });
    assert.equal(selected.structuredContent.phase, "practice");
    assert.equal(selected.structuredContent.courseLabel, "Grundkurs");
    assert.doesNotMatch(JSON.stringify(selected.structuredContent), /spapp_|choice_/);

    const selectedRetry = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.choose.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        choiceRef: opened._meta.skillpilotApp.choiceRefs[0]
      }
    });
    assert.equal(selectedRetry.structuredContent.revision, selected.structuredContent.revision);

    const idempotencyKey = "widget_22222222-2222-4222-8222-222222222222";
    const submitted = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.submit.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        answer: "Aus 3(x − 2) = 15 folgt x − 2 = 5 und damit x = 7.",
        idempotencyKey
      }
    });
    assert.equal(submitted.structuredContent.phase, "awaiting-evaluation");
    assert.doesNotMatch(JSON.stringify(submitted.structuredContent), /x = 7|spapp_|submission_/);

    const submittedRetry = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.submit.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        answer: "Aus 3(x − 2) = 15 folgt x − 2 = 5 und damit x = 7.",
        idempotencyKey
      }
    });
    assert.equal(submittedRetry.structuredContent.revision, submitted.structuredContent.revision);

    const pending = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.pending.name,
      arguments: {}
    });
    assert.match(pending.structuredContent.learnerAnswer, /x = 7/);

    const evaluated = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.evaluate.name,
      arguments: {
        score: 2,
        feedback: "Richtig; der mathematisch äquivalente Lösungsweg wird vollständig anerkannt."
      }
    });
    assert.equal(evaluated.structuredContent.phase, "feedback");
    assert.equal(evaluated.structuredContent.score, 2);

    const evaluatedRetry = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.evaluate.name,
      arguments: {
        score: 2,
        feedback: "Richtig; der mathematisch äquivalente Lösungsweg wird vollständig anerkannt."
      }
    });
    assert.equal(evaluatedRetry.structuredContent.revision, evaluated.structuredContent.revision);

    const freshContext = await rpc(baseUrl, "de", "tools/call", {
      name: contract.tools.context.name,
      arguments: {}
    });
    assert.equal(freshContext.structuredContent.phase, "feedback");
    assert.equal(freshContext._meta, undefined);
    assert.doesNotMatch(JSON.stringify(freshContext), /spapp_|choice_|submission_/);
  });
});
