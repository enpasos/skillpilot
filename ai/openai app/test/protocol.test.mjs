import assert from "node:assert/strict";
import { mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { createAppHttpServer } from "../server/app-server.mjs";
import { CoachStore } from "../server/coach-store.mjs";
import {
  catalogFor,
  coachContract,
  localizedCatalogs
} from "../server/contracts/index.mjs";

async function withServer(run) {
  const dataDir = await mkdtemp(join(tmpdir(), "skillpilot-mcp-protocol-"));
  const server = createAppHttpServer({ coachStore: new CoachStore({ dataDir }) });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  try {
    await run(`http://127.0.0.1:${address.port}`);
  } finally {
    await new Promise((resolve, reject) =>
      server.close((error) => (error ? reject(error) : resolve()))
    );
  }
}

async function rpc(baseUrl, locale, method, params = {}) {
  const response = await fetch(`${baseUrl}${coachContract.mcpPath}`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      accept: "application/json, text/event-stream",
      "x-skillpilot-demo-locale": locale
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Math.floor(Math.random() * 1_000_000),
      method,
      params
    })
  });
  if (response.status !== 200) {
    assert.fail(`Unexpected HTTP ${response.status}: ${await response.text()}`);
  }
  const payload = await response.json();
  assert.equal(payload.error, undefined, JSON.stringify(payload.error));
  return payload.result;
}

test("one neutral V1 endpoint exposes one English tool contract for every session locale", async () => {
  assert.equal(coachContract.pluginIdentity, "skillpilot-coach-v1");
  assert.equal(coachContract.mcpPath, "/mcp");
  assert.equal(coachContract.widgetDomain, "https://mcp-coach-v1.skillpilot.com");
  assert.doesNotMatch(coachContract.pluginIdentity, /(?:^|-)de(?:-|$)|(?:^|-)en(?:-|$)/);

  const expectedToolNames = Object.values(coachContract.tools)
    .map((tool) => tool.name)
    .sort();
  assert.ok(expectedToolNames.every((name) => !/_(?:de|en)$/.test(name)));

  await withServer(async (baseUrl) => {
    const publishedCatalogs = [];
    const localizedWidgets = new Map();
    const health = await (await fetch(`${baseUrl}/health`)).json();
    assert.equal(health.app.pluginIdentity, coachContract.pluginIdentity);
    assert.equal(health.app.mcpPath, "/mcp");
    assert.deepEqual(health.demoLocales.sort(), ["de", "en"]);

    for (const catalog of Object.values(localizedCatalogs)) {
      const initialized = await rpc(baseUrl, catalog.locale, "initialize", {
        protocolVersion: "2025-11-25",
        capabilities: {},
        clientInfo: { name: "skillpilot-contract-test", version: "0.1.0" }
      });
      assert.equal(initialized.serverInfo.name, coachContract.serverName);
      assert.equal(initialized.instructions, coachContract.instructions);

      const tools = (await rpc(baseUrl, catalog.locale, "tools/list")).tools;
      assert.equal(tools.length, expectedToolNames.length);
      assert.deepEqual(tools.map((tool) => tool.name).sort(), expectedToolNames);
      publishedCatalogs.push(tools);

      for (const tool of tools) {
        assert.ok(tool.title?.trim(), `${tool.name} needs a title`);
        assert.ok(tool.description?.trim(), `${tool.name} needs a description`);
        assert.doesNotMatch(tool.name, /_(?:de|en)$/);
        assert.equal("language" in (tool.inputSchema.properties ?? {}), false);
        assert.equal("locale" in (tool.inputSchema.properties ?? {}), false);
        for (const [propertyName, propertySchema] of Object.entries(
          tool.inputSchema.properties ?? {}
        )) {
          assert.ok(
            propertySchema.description?.trim(),
            `${tool.name}.${propertyName} needs an input description`
          );
        }
        for (const [propertyName, propertySchema] of Object.entries(
          tool.outputSchema?.properties ?? {}
        )) {
          assert.ok(
            propertySchema.description?.trim(),
            `${tool.name}.${propertyName} needs an output description`
          );
        }
      }

      const openTool = tools.find((tool) => tool.name === coachContract.tools.open.name);
      assert.equal(openTool._meta.ui.resourceUri, coachContract.resourceUri);
      assert.deepEqual(openTool._meta.ui.visibility, ["model", "app"]);
      assert.deepEqual(openTool._meta.securitySchemes, [{ type: "noauth" }]);
      assert.equal(openTool.annotations.readOnlyHint, false);

      const chooseTool = tools.find((tool) => tool.name === coachContract.tools.choose.name);
      assert.deepEqual(chooseTool._meta.ui.visibility, ["app"]);
      assert.equal(chooseTool._meta.ui.resourceUri, undefined);
      assert.equal(chooseTool.annotations.openWorldHint, false);

      const resources = (await rpc(baseUrl, catalog.locale, "resources/list")).resources;
      assert.equal(resources.length, 1);
      assert.equal(resources[0].uri, coachContract.resourceUri);
      assert.equal(resources[0].mimeType, "text/html;profile=mcp-app");
      assert.equal(resources[0]._meta.ui.domain, coachContract.widgetDomain);
      assert.equal(resources[0]._meta["openai/widgetDomain"], coachContract.widgetDomain);

      const read = await rpc(baseUrl, catalog.locale, "resources/read", {
        uri: coachContract.resourceUri
      });
      assert.equal(read.contents[0].mimeType, "text/html;profile=mcp-app");
      assert.equal(read.contents[0]._meta.ui.domain, coachContract.widgetDomain);
      assert.match(read.contents[0].text, /ui\/initialize/);
      assert.doesNotMatch(read.contents[0].text, /<script[^>]+src=/i);
      localizedWidgets.set(catalog.locale, read.contents[0].text);
    }

    assert.deepEqual(
      publishedCatalogs[0],
      publishedCatalogs[1],
      "localized payload catalogs must not fork the public MCP tool catalog"
    );
    assert.notEqual(
      localizedWidgets.get("de"),
      localizedWidgets.get("en"),
      "localized demo widgets may carry different learner-facing copy"
    );

    for (const removedPath of ["/mcp/de", "/mcp/en"]) {
      const response = await fetch(`${baseUrl}${removedPath}`, { method: "POST" });
      assert.equal(response.status, 404);
    }
  });
});

test("neutral instructions defer learner-facing language to SkillPilot session state", () => {
  for (const fragment of [
    "communicationLocale returned by SkillPilot session state as authoritative",
    "At first contact, briefly identify yourself once as an AI assistant",
    "you can make mistakes",
    "Do not routinely repeat this notice later"
  ]) {
    assert.ok(coachContract.instructions.includes(fragment), `Missing instruction: ${fragment}`);
  }
  assert.doesNotMatch(coachContract.instructions, /English SkillPilot tools|German SkillPilot tools/);
  assert.doesNotMatch(coachContract.instructions, /banner|disclaimer|haftung|liabilit/i);
});

test("complete German demo flow uses the neutral tools without leaking opaque references", async () => {
  await withServer(async (baseUrl) => {
    const catalog = catalogFor("de");
    const tools = coachContract.tools;
    const emptyContext = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.context.name,
      arguments: {}
    });
    assert.equal(emptyContext.structuredContent.phase, "not-started");
    assert.equal(emptyContext.structuredContent.communicationLocale, "de");
    assert.equal(emptyContext.content[0].text, catalog.copy.emptyContext);

    const opened = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.open.name,
      arguments: { learning_request: catalog.preview.initialRequest }
    });
    assert.equal(opened.structuredContent.phase, "scope-choice");
    assert.doesNotMatch(JSON.stringify(opened.structuredContent), /spapp_|choice_/);
    assert.doesNotMatch(JSON.stringify(opened.content), /spapp_|choice_/);
    assert.match(opened._meta.skillpilotApp.sessionRef, /^spapp_/);
    assert.equal(opened._meta.skillpilotApp.choiceRefs.length, 2);

    const selected = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.choose.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        choiceRef: opened._meta.skillpilotApp.choiceRefs[0]
      }
    });
    assert.equal(selected.structuredContent.phase, "practice");
    assert.equal(selected.structuredContent.courseLabel, "Grundkurs");

    const selectedRetry = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.choose.name,
      arguments: {
        sessionRef: opened._meta.skillpilotApp.sessionRef,
        choiceRef: opened._meta.skillpilotApp.choiceRefs[0]
      }
    });
    assert.equal(selectedRetry.structuredContent.revision, selected.structuredContent.revision);

    const idempotencyKey = "widget_22222222-2222-4222-8222-222222222222";
    const answer = "Aus 3(x − 2) = 15 folgt x − 2 = 5 und damit x = 7.";
    const submitted = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.submit.name,
      arguments: { sessionRef: opened._meta.skillpilotApp.sessionRef, answer, idempotencyKey }
    });
    assert.equal(submitted.structuredContent.phase, "awaiting-evaluation");
    assert.doesNotMatch(JSON.stringify(submitted.structuredContent), /x = 7|spapp_|submission_/);

    const submittedRetry = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.submit.name,
      arguments: { sessionRef: opened._meta.skillpilotApp.sessionRef, answer, idempotencyKey }
    });
    assert.equal(submittedRetry.structuredContent.revision, submitted.structuredContent.revision);

    const pending = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.pending.name,
      arguments: {}
    });
    assert.equal(pending.structuredContent.communicationLocale, "de");
    assert.match(pending.structuredContent.learnerAnswer, /x = 7/);

    const evaluation = {
      score: 2,
      feedback: "Richtig; der mathematisch äquivalente Lösungsweg wird vollständig anerkannt."
    };
    const evaluated = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.evaluate.name,
      arguments: evaluation
    });
    assert.equal(evaluated.structuredContent.phase, "feedback");
    assert.equal(evaluated.structuredContent.score, 2);

    const evaluatedRetry = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.evaluate.name,
      arguments: evaluation
    });
    assert.equal(evaluatedRetry.structuredContent.revision, evaluated.structuredContent.revision);

    const freshContext = await rpc(baseUrl, catalog.locale, "tools/call", {
      name: tools.context.name,
      arguments: {}
    });
    assert.equal(freshContext.structuredContent.phase, "feedback");
    assert.equal(freshContext._meta, undefined);
    assert.doesNotMatch(JSON.stringify(freshContext), /spapp_|choice_|submission_/);
  });
});
