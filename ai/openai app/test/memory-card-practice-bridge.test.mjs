import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function buildBridgeSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/memory-card-practice-bridge.ts")],
    bundle: true,
    format: "iife",
    globalName: "MemoryCardPracticeBridgeBundle",
    platform: "browser",
    target: "es2022",
    write: false,
    plugins: [
      {
        name: "memory-card-practice-bridge-sdk",
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
                  callServerTool(params) {
                    globalThis.__toolCalls.push(params);
                    return Promise.resolve({ _meta: { ok: true } });
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

test("bridge registers tool results before connect and uses standards-first tools/call", async () => {
  const context = {
    Promise,
    __handlerBeforeConnect: false,
    __toolCalls: [],
    __openedLinks: []
  };
  context.globalThis = context;
  vm.runInNewContext(bridgeSource, context, {
    filename: "memory-card-practice-bridge.test-bundle.js"
  });

  const { MemoryCardPracticeBridge } = context.MemoryCardPracticeBridgeBundle;
  const bridge = new MemoryCardPracticeBridge(() => undefined, {});
  await bridge.callTool("review_skillpilot_memory_practice_card", {
    learningSessionId: `sps_${"A".repeat(43)}`,
    goalId: "goal-1",
    cardId: "card-1",
    reviewCapability: "B".repeat(43),
    rating: "known",
    expectedStateVersion: 3,
    clientRequestId: "request-1"
  });

  assert.equal(context.__handlerBeforeConnect, true);
  assert.equal(context.__toolCalls.length, 1);
  assert.equal(
    context.__toolCalls[0].name,
    "review_skillpilot_memory_practice_card"
  );
  assert.equal(context.__toolCalls[0].arguments.clientRequestId, "request-1");
});

test("cockpit fallback uses the standard ui/open-link request", async () => {
  const context = {
    Promise,
    __handlerBeforeConnect: false,
    __toolCalls: [],
    __openedLinks: []
  };
  context.globalThis = context;
  vm.runInNewContext(bridgeSource, context);
  const { MemoryCardPracticeBridge } = context.MemoryCardPracticeBridgeBundle;
  const bridge = new MemoryCardPracticeBridge(() => undefined, {});
  assert.equal(await bridge.openLink("https://skillpilot.com/?goal=goal-1"), true);
  assert.equal(
    context.__openedLinks[0].url,
    "https://skillpilot.com/?goal=goal-1"
  );
});
