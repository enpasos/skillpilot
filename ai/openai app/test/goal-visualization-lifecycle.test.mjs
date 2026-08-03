import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const visualization = (goalId, imageUrl = `https://skillpilot.com/${goalId}.png`) => ({
  goalVisualization: {
    goalId,
    title: `Goal ${goalId}`,
    imageUrl,
    altText: `Visualization ${goalId}`,
    cockpitUrl: `https://skillpilot.com/?goal=${goalId}`
  }
});

class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.hidden = false;
    this.children = [];
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) ?? [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatch(type) {
    for (const listener of this.listeners.get(type) ?? []) {
      listener({ type, target: this });
    }
  }

  replaceChildren(...children) {
    this.children = children;
  }

  appendChild(child) {
    this.children.push(child);
    return child;
  }

  contains(child) {
    return this.children.includes(child);
  }
}

async function buildLifecycleSource() {
  const result = await build({
    entryPoints: [join(root, "widget/src/goal-visualization-main.ts")],
    bundle: true,
    format: "iife",
    platform: "browser",
    target: "es2022",
    write: false,
    loader: { ".css": "text" },
    plugins: [
      {
        name: "goal-visualization-test-bridge",
        setup(esbuild) {
          esbuild.onResolve(
            { filter: /goal-visualization-bridge$/ },
            () => ({ path: "goal-visualization-bridge", namespace: "test" })
          );
          esbuild.onLoad(
            { filter: /.*/, namespace: "test" },
            () => ({
              loader: "ts",
              contents: `
                export type GoalVisualizationToolResult = { structuredContent?: unknown };
                export class GoalVisualizationBridge {
                  ready = globalThis.__bridgeReady;
                  constructor(onToolResult: (result: GoalVisualizationToolResult) => void) {
                    globalThis.__deliverToolResult = onToolResult;
                  }
                  async requestTeardown(): Promise<void> {
                    globalThis.__teardownCount += 1;
                  }
                }
              `
            })
          );
        }
      }
    ]
  });
  const script = result.outputFiles.find((file) =>
    file.text.includes("Missing goal visualization root")
  );
  assert.ok(script, "esbuild must emit the lifecycle JavaScript bundle");
  return script.text;
}

const lifecycleSource = await buildLifecycleSource();

function createHarness(initialToolOutput, options = {}) {
  const rootElement = new FakeElement("main");
  const images = [];
  const windowListeners = new Map();
  const timers = new Map();
  const widgetStates = [];
  let nextTimerId = 1;

  const context = {
    URL,
    console,
    Promise,
    __bridgeReady: options.bridgeReady === false
      ? new Promise(() => undefined)
      : Promise.resolve(),
    __teardownCount: 0,
    __closeCount: 0,
    document: {
      head: new FakeElement("head"),
      documentElement: new FakeElement("html"),
      createElement(tagName) {
        const element = new FakeElement(tagName);
        if (tagName === "img") images.push(element);
        return element;
      },
      querySelector(selector) {
        return selector === "#root" ? rootElement : null;
      }
    },
    addEventListener(type, listener) {
      const listeners = windowListeners.get(type) ?? [];
      listeners.push(listener);
      windowListeners.set(type, listeners);
    },
    setTimeout(callback) {
      const id = nextTimerId++;
      timers.set(id, callback);
      return id;
    },
    clearTimeout(id) {
      timers.delete(id);
    }
  };
  context.window = context;
  context.globalThis = context;
  context.parent = context;
  if (options.compatibilityGlobals !== false) {
    context.openai = {
      toolOutput: initialToolOutput,
      setWidgetState(state) {
        widgetStates.push(state);
      }
    };
    if (options.requestClose !== false) {
      context.openai.requestClose = () => {
        context.__closeCount += 1;
      };
    }
  }

  vm.runInNewContext(lifecycleSource, context, {
    filename: "goal-visualization-main.test-bundle.js"
  });

  return {
    context,
    images,
    rootElement,
    timers,
    widgetStates,
    emitGlobals(globals) {
      for (const listener of windowListeners.get("openai:set_globals") ?? []) {
        listener({ detail: { globals } });
      }
    }
  };
}

async function flushPromises() {
  await Promise.resolve();
  await Promise.resolve();
}

test("a compatibility image stays hidden until load and load cancels its timeout", () => {
  const harness = createHarness(visualization("ATOM_1"));
  const image = harness.images[0];

  assert.ok(image);
  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, [image]);
  assert.equal(harness.timers.size, 1);

  image.dispatch("load");

  assert.equal(harness.rootElement.hidden, false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.widgetStates.length, 1);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 0);
});

test("an MCP Apps tool result renders without ChatGPT compatibility globals", () => {
  const harness = createHarness(undefined, { compatibilityGlobals: false });

  harness.context.__deliverToolResult({
    structuredContent: visualization("NATIVE_HOST")
  });
  const image = harness.images[0];

  assert.ok(image);
  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, [image]);

  image.dispatch("load");

  assert.equal(harness.rootElement.hidden, false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.widgetStates.length, 0);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 0);
});

test("an image error collapses the component and requests close exactly once", async () => {
  const harness = createHarness(visualization("ATOM_1"));
  const image = harness.images[0];

  image.dispatch("error");
  image.dispatch("error");
  await flushPromises();

  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.context.__closeCount, 1);
  assert.equal(harness.context.__teardownCount, 1);
});

test("a stale failure cannot erase a replacement and a later valid result can recover", async () => {
  const harness = createHarness(visualization("STALE"));
  const staleImage = harness.images[0];

  harness.emitGlobals({ toolOutput: visualization("CURRENT") });
  const currentImage = harness.images[1];
  staleImage.dispatch("error");
  currentImage.dispatch("load");

  assert.equal(harness.rootElement.hidden, false);
  assert.deepEqual(harness.rootElement.children, [currentImage]);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 0);

  harness.emitGlobals({ toolOutput: visualization("BROKEN") });
  const brokenImage = harness.images[2];
  brokenImage.dispatch("error");
  await flushPromises();
  assert.equal(harness.context.__closeCount, 1);
  assert.equal(harness.context.__teardownCount, 1);

  harness.emitGlobals({ toolOutput: visualization("RECOVERED") });
  const recoveredImage = harness.images[3];
  recoveredImage.dispatch("load");

  assert.equal(harness.rootElement.hidden, false);
  assert.deepEqual(harness.rootElement.children, [recoveredImage]);
});

test("the bounded timeout collapses a host that never finishes image loading", async () => {
  const harness = createHarness(visualization("ATOM_1"));
  const timeout = [...harness.timers.values()][0];
  assert.equal(typeof timeout, "function");

  timeout();
  await flushPromises();

  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
  assert.equal(harness.context.__closeCount, 1);
  assert.equal(harness.context.__teardownCount, 1);
});

test("a host that never supplies payload is closed after the bootstrap deadline", async () => {
  const harness = createHarness(undefined, {
    bridgeReady: false,
    requestClose: false
  });
  const timeout = [...harness.timers.values()][0];
  assert.equal(typeof timeout, "function");

  timeout();
  await flushPromises();

  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 1);
});

test("a late payload replaces the bootstrap deadline with the image deadline", () => {
  const harness = createHarness(undefined);
  const bootstrapTimeoutId = [...harness.timers.keys()][0];

  harness.emitGlobals({ toolOutput: visualization("LATE") });
  const image = harness.images[0];

  assert.ok(image);
  assert.equal(harness.timers.has(bootstrapTimeoutId), false);
  assert.equal(harness.timers.size, 1);

  image.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.context.__teardownCount, 0);
});

test("a recovered component requests teardown again after a later failure", async () => {
  const harness = createHarness(visualization("FIRST"));
  harness.images[0].dispatch("error");
  await flushPromises();

  harness.emitGlobals({ toolOutput: visualization("RECOVERED") });
  harness.images[1].dispatch("load");
  harness.emitGlobals({ toolOutput: visualization("SECOND_FAILURE") });
  harness.images[2].dispatch("error");
  await flushPromises();

  assert.equal(harness.context.__closeCount, 2);
  assert.equal(harness.context.__teardownCount, 2);
  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
});
