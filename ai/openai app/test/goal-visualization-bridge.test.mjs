import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

async function buildBridgeSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/goal-visualization-bridge.ts")],
    bundle: true,
    format: "iife",
    globalName: "GoalVisualizationBridgeBundle",
    platform: "browser",
    target: "es2022",
    write: false,
    plugins: [
      {
        name: "goal-visualization-bridge-sdk",
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
                    return globalThis.__bridgeReady;
                  }
                  requestTeardown() {
                    globalThis.__teardownCount += 1;
                    return Promise.resolve();
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

test("teardown does not wait for a host handshake that never settles", async () => {
  const context = {
    Promise,
    __bridgeReady: new Promise(() => undefined),
    __teardownCount: 0
  };
  context.globalThis = context;
  vm.runInNewContext(bridgeSource, context, {
    filename: "goal-visualization-bridge.test-bundle.js"
  });

  const { GoalVisualizationBridge } = context.GoalVisualizationBridgeBundle;
  const bridge = new GoalVisualizationBridge(() => undefined, {});

  await bridge.requestTeardown();

  assert.equal(context.__teardownCount, 1);
});
