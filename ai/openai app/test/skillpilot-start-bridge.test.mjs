import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function buildBridgeSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/skillpilot-start-bridge.ts")],
    bundle: true,
    format: "iife",
    globalName: "SkillPilotStartBridgeBundle",
    platform: "browser",
    target: "es2022",
    write: false,
    plugins: [
      {
        name: "skillpilot-start-bridge-sdk",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /^@modelcontextprotocol\/ext-apps$/ },
            () => ({ path: "ext-apps", namespace: "test" })
          );
          esbuild.onLoad(
            { filter: /.*/, namespace: "test" },
            () => ({
              loader: "js",
              contents: `
                export class App {
                  connect() {
                    globalThis.__handlerBeforeConnect = typeof this.ontoolresult === "function";
                    return Promise.resolve();
                  }
                  getHostCapabilities() {
                    return globalThis.__hostCapabilities;
                  }
                  callServerTool(params) {
                    globalThis.__toolCalls.push(params);
                    return Promise.resolve({ structuredContent: { status: "SESSION_CREATED" } });
                  }
                  sendMessage(params) {
                    globalThis.__messages.push(params);
                    return Promise.resolve(globalThis.__messageResult);
                  }
                  openLink(params) {
                    globalThis.__openedLinks.push(params);
                    return Promise.resolve({});
                  }
                }
                export class PostMessageTransport {
                  constructor() {}
                }
              `
            })
          );
        }
      }
    ]
  });
  return result.outputFiles[0].text;
}

const bridgeSource = await buildBridgeSource();

function createHarness(hostCapabilities) {
  const context = {
    Promise,
    Error,
    __handlerBeforeConnect: false,
    __hostCapabilities: hostCapabilities,
    __toolCalls: [],
    __messages: [],
    __openedLinks: [],
    __messageResult: {}
  };
  context.globalThis = context;
  vm.runInNewContext(bridgeSource, context, {
    filename: "skillpilot-start-bridge.test-bundle.js"
  });
  const { SkillPilotStartBridge } = context.SkillPilotStartBridgeBundle;
  return { context, bridge: new SkillPilotStartBridge(() => undefined, {}) };
}

const capabilityArguments = {
  providerNoticeVersion: "openai-provider-eligibility-v1",
  providerEligibilityConfirmed: true,
};

test("bridge registers the result handler before connect and uses app-only tools/call", async () => {
  const { context, bridge } = createHarness({
    serverTools: {},
    message: { text: {} },
    openLinks: {}
  });

  await bridge.issueCapability(capabilityArguments);

  assert.equal(context.__handlerBeforeConnect, true);
  assert.equal(context.__toolCalls.length, 1);
  assert.equal(context.__toolCalls[0].name, "issue_skillpilot_start_capability");
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__toolCalls[0].arguments)),
    capabilityArguments
  );
  assert.doesNotMatch(
    JSON.stringify(context.__toolCalls[0].arguments),
    /skillpilot.?id|learner|session/i
  );
});

test("bridge feature-detects serverTools and message.text before using them", async () => {
  const { context, bridge } = createHarness({ message: {} });

  await assert.rejects(
    bridge.issueCapability(capabilityArguments),
    /host-does-not-support-server-tools/
  );
  assert.deepEqual(context.__toolCalls, []);

  assert.deepEqual(
    JSON.parse(JSON.stringify(await bridge.sendStartMessage("private start message"))),
    { supported: false, hostAccepted: false }
  );
  assert.deepEqual(context.__messages, []);
});

test("ui/message sends exactly one private start message and reports rejection", async () => {
  const { context, bridge } = createHarness({
    serverTools: {},
    message: { text: {} }
  });
  context.__messageResult = { isError: true };

  assert.deepEqual(
    JSON.parse(JSON.stringify(await bridge.sendStartMessage("private start message"))),
    { supported: true, hostAccepted: false }
  );
  assert.equal(context.__messages.length, 1);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__messages[0])),
    {
      role: "user",
      content: [{ type: "text", text: "private start message" }]
    }
  );
});

test("ui/open-link is used only when the host advertises openLinks", async () => {
  const supported = createHarness({ openLinks: {} });
  assert.equal(
    await supported.bridge.openLink("https://skillpilot.com/start"),
    true
  );
  assert.equal(
    supported.context.__openedLinks[0].url,
    "https://skillpilot.com/start"
  );

  const unsupported = createHarness({});
  assert.equal(
    await unsupported.bridge.openLink("https://skillpilot.com/start"),
    false
  );
  assert.deepEqual(unsupported.context.__openedLinks, []);
});
