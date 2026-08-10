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
                    if (globalThis.__connectMode === "reject") {
                      return Promise.reject(new Error("connect-rejected"));
                    }
                    if (globalThis.__connectMode === "pending") {
                      return new Promise(() => undefined);
                    }
                    return Promise.resolve();
                  }
                  getHostCapabilities() {
                    return globalThis.__hostCapabilities;
                  }
                  callServerTool(params) {
                    globalThis.__toolCalls.push(params);
                    if (globalThis.__standardToolError) {
                      return Promise.reject(globalThis.__standardToolError);
                    }
                    return Promise.resolve(globalThis.__standardToolResult);
                  }
                  sendMessage(params) {
                    globalThis.__messages.push(params);
                    if (globalThis.__standardMessageError) {
                      return Promise.reject(globalThis.__standardMessageError);
                    }
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

function createHarness(hostCapabilities, options = {}) {
  const context = {
    Promise,
    Error,
    JSON,
    __handlerBeforeConnect: false,
    __hostCapabilities: hostCapabilities,
    __connectMode: options.connectMode ?? "resolve",
    __toolCalls: [],
    __messages: [],
    __openedLinks: [],
    __standardToolResult: options.standardToolResult
      ?? { structuredContent: { status: "CAPABILITY_ISSUED" } },
    __standardToolError: options.standardToolError,
    __standardMessageError: options.standardMessageError,
    __messageResult: options.standardMessageResult ?? {},
    __compatToolCalls: [],
    __compatMessages: [],
    __compatOpenedLinks: []
  };
  if (options.compatibility) {
    const compatibility = options.compatibility;
    context.openai = {
      ...(compatibility.callTool === false
        ? {}
        : {
          callTool(name, arguments_) {
            context.__compatToolCalls.push({ name, arguments: arguments_ });
            if (compatibility.toolError) {
              return Promise.reject(compatibility.toolError);
            }
            return Promise.resolve(compatibility.toolResult);
          }
        }),
      ...(compatibility.sendFollowUpMessage === false
        ? {}
        : {
          sendFollowUpMessage(request) {
            context.__compatMessages.push(request);
            if (compatibility.messageError) {
              return Promise.reject(compatibility.messageError);
            }
            return Promise.resolve(compatibility.messageResult);
          }
        }),
      ...(compatibility.openExternal === false
        ? {}
        : {
          openExternal(request) {
            context.__compatOpenedLinks.push(request);
            return Promise.resolve(compatibility.openResult);
          }
        })
    };
  }
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

const capabilityEnvelope = {
  structuredContent: {
    status: "CAPABILITY_ISSUED",
    contractMajor: 1,
    providerNoticeVersion: "openai-provider-eligibility-v1"
  },
  _meta: {
    skillpilotStart: {
      setupCapability: `spc_${"A".repeat(43)}`
    }
  }
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

test("bridge feature-detects a complete action channel before using it", async () => {
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

test("ChatGPT Web compatibility aliases form one complete working action channel", async () => {
  const { context, bridge } = createHarness({}, {
    connectMode: "pending",
    compatibility: {
      toolResult: capabilityEnvelope,
      messageResult: undefined,
      openResult: undefined
    }
  });

  assert.deepEqual(
    JSON.parse(JSON.stringify(await bridge.hostSupport())),
    { serverTools: true, textMessages: true, openLinks: true }
  );
  const result = await bridge.issueCapability(capabilityArguments);
  assert.deepEqual(
    JSON.parse(JSON.stringify(result)),
    capabilityEnvelope
  );
  assert.equal(context.__compatToolCalls.length, 1);
  assert.equal(
    context.__compatToolCalls[0].name,
    "issue_skillpilot_start_capability"
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__compatToolCalls[0].arguments)),
    capabilityArguments
  );
  assert.doesNotMatch(
    JSON.stringify(context.__compatToolCalls[0].arguments),
    /skillpilot.?id|learner|session/i
  );
  assert.deepEqual(context.__toolCalls, []);

  assert.deepEqual(
    JSON.parse(JSON.stringify(await bridge.sendStartMessage("private start message"))),
    { supported: true, hostAccepted: true }
  );
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__compatMessages)),
    [{ prompt: "private start message", scrollToBottom: true }]
  );
  assert.deepEqual(context.__messages, []);

  assert.equal(await bridge.openLink("https://skillpilot.com/"), true);
  assert.deepEqual(
    JSON.parse(JSON.stringify(context.__compatOpenedLinks)),
    [{ href: "https://skillpilot.com/", redirectUrl: false }]
  );
});

test("a ready shared MCP Apps channel wins and is never double-dispatched", async () => {
  const { context, bridge } = createHarness({
    serverTools: {},
    message: { text: {} },
    openLinks: {}
  }, {
    compatibility: {
      toolResult: capabilityEnvelope,
      messageResult: undefined
    }
  });
  await bridge.ready;

  await bridge.issueCapability(capabilityArguments);
  await bridge.sendStartMessage("private start message");
  await bridge.openLink("https://skillpilot.com/");

  assert.equal(context.__toolCalls.length, 1);
  assert.equal(context.__messages.length, 1);
  assert.equal(context.__openedLinks.length, 1);
  assert.deepEqual(context.__compatToolCalls, []);
  assert.deepEqual(context.__compatMessages, []);
  assert.deepEqual(context.__compatOpenedLinks, []);
});

test("a new explicit start attempt re-evaluates the standard-first action channel", async () => {
  const { context, bridge } = createHarness({}, {
    compatibility: {
      toolResult: capabilityEnvelope,
      messageResult: undefined
    }
  });
  await bridge.ready;

  await bridge.issueCapability(capabilityArguments);
  await bridge.sendStartMessage("compatibility start message");

  assert.equal(context.__compatToolCalls.length, 1);
  assert.equal(context.__compatMessages.length, 1);
  assert.deepEqual(context.__toolCalls, []);
  assert.deepEqual(context.__messages, []);

  context.__hostCapabilities = {
    serverTools: {},
    message: { text: {} }
  };
  bridge.beginAttempt();

  await bridge.issueCapability(capabilityArguments);
  await bridge.sendStartMessage("standard start message");

  assert.equal(context.__compatToolCalls.length, 1);
  assert.equal(context.__compatMessages.length, 1);
  assert.equal(context.__toolCalls.length, 1);
  assert.equal(context.__messages.length, 1);
});

test("a rejected standard handshake still permits the complete compatibility channel", async () => {
  const { context, bridge } = createHarness({}, {
    connectMode: "reject",
    compatibility: {
      toolResult: capabilityEnvelope,
      messageResult: undefined
    }
  });

  await assert.rejects(bridge.ready, /connect-rejected/);
  await bridge.issueCapability(capabilityArguments);
  await bridge.sendStartMessage("private start message");

  assert.equal(context.__compatToolCalls.length, 1);
  assert.equal(context.__compatMessages.length, 1);
  assert.deepEqual(context.__toolCalls, []);
  assert.deepEqual(context.__messages, []);
});

test("compatibility callTool normalizes only bounded MCP result envelopes", async () => {
  const objectWrapper = createHarness({}, {
    compatibility: {
      toolResult: { result: capabilityEnvelope },
      messageResult: undefined
    }
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(await objectWrapper.bridge.issueCapability(capabilityArguments))),
    capabilityEnvelope
  );

  const jsonWrapper = createHarness({}, {
    compatibility: {
      toolResult: { result: JSON.stringify(capabilityEnvelope) },
      messageResult: undefined
    }
  });
  assert.deepEqual(
    JSON.parse(JSON.stringify(await jsonWrapper.bridge.issueCapability(capabilityArguments))),
    capabilityEnvelope
  );

  const malformed = createHarness({}, {
    compatibility: {
      toolResult: { result: "not-json" },
      messageResult: undefined
    }
  });
  await assert.rejects(
    malformed.bridge.issueCapability(capabilityArguments),
    /invalid-compatibility-tool-result/
  );

  const oversized = createHarness({}, {
    compatibility: {
      toolResult: { result: "x".repeat(64 * 1024 + 1) },
      messageResult: undefined
    }
  });
  await assert.rejects(
    oversized.bridge.issueCapability(capabilityArguments),
    /invalid-compatibility-tool-result/
  );
});

test("a dispatched standard action never falls through to a compatibility alias", async () => {
  const { context, bridge } = createHarness({
    serverTools: {},
    message: { text: {} }
  }, {
    standardToolError: new Error("standard-outcome-unknown"),
    compatibility: {
      toolResult: capabilityEnvelope,
      messageResult: undefined
    }
  });
  await bridge.ready;

  await assert.rejects(
    bridge.issueCapability(capabilityArguments),
    /standard-outcome-unknown/
  );
  assert.equal(context.__toolCalls.length, 1);
  assert.deepEqual(context.__compatToolCalls, []);
});

test("ui/message sends exactly one private start message and reports rejection", async () => {
  const { context, bridge } = createHarness({
    serverTools: {},
    message: { text: {} }
  }, {
    standardMessageResult: { isError: true }
  });

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
  await supported.bridge.ready;
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
