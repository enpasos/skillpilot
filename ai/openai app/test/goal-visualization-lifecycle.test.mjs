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
  let now = 0;
  let resolveBridge;
  let rejectBridge;
  const bridgeReady = new Promise((resolve, reject) => {
    resolveBridge = resolve;
    rejectBridge = reject;
  });
  if (options.bridgeReady !== false) resolveBridge();

  const context = {
    URL,
    console,
    Promise,
    __bridgeReady: bridgeReady,
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
    setTimeout(callback, delay = 0) {
      const id = nextTimerId++;
      timers.set(id, { callback, at: now + delay });
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
      toolResponseMetadata: options.initialMetadata,
      widgetState: options.initialWidgetState,
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
    resolveBridge,
    rejectBridge,
    advance(milliseconds) {
      const end = now + milliseconds;
      for (let executions = 0; ; executions += 1) {
        const next = [...timers].sort((left, right) => left[1].at - right[1].at)[0];
        if (!next || next[1].at > end) break;
        assert.ok(executions < 100, "Unexpected unbounded timer loop");
        now = next[1].at;
        timers.delete(next[0]);
        next[1].callback();
      }
      now = end;
    },
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

test("a compatibility image stays hidden until load without a deadline", () => {
  const harness = createHarness(visualization("ATOM_1"));
  const image = harness.images[0];

  assert.ok(image);
  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, [image]);
  assert.equal(harness.timers.size, 0);

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

test("an image taking more than twenty seconds remains eligible to display", () => {
  const harness = createHarness(visualization("ATOM_1"));
  const image = harness.images[0];
  harness.advance(25_000);

  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, [image]);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 0);
  image.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
});

test("a native tool result delayed thirty seconds still displays its image", async () => {
  const harness = createHarness(undefined, {
    bridgeReady: false,
    compatibilityGlobals: false
  });
  harness.advance(30_000);

  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
  assert.equal(harness.context.__closeCount, 0);
  assert.equal(harness.context.__teardownCount, 0);
  harness.resolveBridge();
  await flushPromises();
  harness.context.__deliverToolResult({ structuredContent: visualization("LATE_NATIVE") });
  const image = harness.images[0];
  image.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
  assert.equal(harness.context.__teardownCount, 0);
});

test("a compatibility payload can arrive after thirty seconds without being discarded", () => {
  const harness = createHarness(undefined);
  harness.advance(30_000);
  harness.emitGlobals({ toolOutput: visualization("LATE") });
  const image = harness.images[0];

  assert.ok(image);
  assert.equal(harness.timers.size, 0);

  image.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
  assert.equal(harness.timers.size, 0);
  assert.equal(harness.context.__teardownCount, 0);
});

test("a failed host connection dismisses the empty component", async () => {
  const harness = createHarness(undefined, { bridgeReady: false });
  harness.rejectBridge(new Error("Host connection failed"));
  await flushPromises();
  assert.equal(harness.rootElement.hidden, true);
  assert.deepEqual(harness.rootElement.children, []);
  assert.equal(harness.context.__closeCount, 1);
  assert.equal(harness.context.__teardownCount, 1);
});

test("a failed standards handshake retains an already supplied compatibility image", async () => {
  const harness = createHarness(visualization("COMPATIBILITY"), { bridgeReady: false });
  harness.rejectBridge(new Error("Standard bridge unavailable"));
  await flushPromises();
  const image = harness.images[0];
  assert.deepEqual(harness.rootElement.children, [image]);
  assert.equal(harness.context.__teardownCount, 0);
  image.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
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

test("a metadata-only successor replaces the first image without another toolOutput update", () => {
  const harness = createHarness(visualization("FIRST"));
  harness.images[0].dispatch("load");

  harness.emitGlobals({ toolResponseMetadata: {
    status: "complete",
    mcp_tool_result: { content: [], structuredContent: visualization("SECOND") }
  } });
  const second = harness.images[1];
  assert.ok(second);
  assert.equal(second.src, "https://skillpilot.com/SECOND.png");
  second.dispatch("load");
  assert.equal(harness.rootElement.hidden, false);
  assert.deepEqual(harness.rootElement.children, [second]);
  assert.equal(harness.context.__teardownCount, 0);

  harness.emitGlobals({ toolResponseMetadata: {
    status: "complete",
    call_tool_result: { result: { structuredContent: visualization("SECOND") } }
  } });
  assert.equal(harness.images.length, 2, "canonical duplicate envelopes do not reload the image");
});

test("initial canonical result metadata hydrates the image before a native result arrives", () => {
  for (const envelope of [
    { mcp_tool_result: { structuredContent: visualization("INITIAL_META") } },
    { call_tool_result: { result: { structuredContent: visualization("INITIAL_META") } } }
  ]) {
    const harness = createHarness(undefined, {
      initialMetadata: { status: "complete", ...envelope }
    });
    const image = harness.images[0];
    assert.ok(image);
    assert.equal(image.src, "https://skillpilot.com/INITIAL_META.png");
    image.dispatch("load");
    assert.equal(harness.rootElement.hidden, false);
  }
});

test("a complete structuredContent envelope updates the compatibility image", () => {
  const harness = createHarness(visualization("FIRST"));
  harness.images[0].dispatch("load");
  harness.emitGlobals({ toolOutput: { structuredContent: visualization("SECOND") } });
  assert.equal(harness.images.length, 2);
  assert.equal(harness.images[1].src, "https://skillpilot.com/SECOND.png");
});

test("current result metadata wins over stale widget state and window snapshots", () => {
  const harness = createHarness(visualization("FIRST"));
  harness.images[0].dispatch("load");
  harness.context.openai.widgetState = visualization("FIRST");
  harness.emitGlobals({
    toolResponseMetadata: {
      status: "complete",
      mcp_tool_result: { structuredContent: visualization("SECOND") }
    },
    widgetState: visualization("FIRST")
  });
  assert.equal(harness.images.length, 2);
  assert.equal(harness.images[1].src, "https://skillpilot.com/SECOND.png");
});

test("late persisted state and partial events cannot reverse a fresh native result", () => {
  const harness = createHarness(visualization("FIRST"));
  harness.images[0].dispatch("load");
  harness.context.__deliverToolResult({ structuredContent: visualization("SECOND") });
  const second = harness.images[1];
  second.dispatch("load");

  for (const globals of [
    { widgetState: visualization("FIRST") },
    { toolOutput: null },
    { toolResponseMetadata: { status: "pending" }, widgetState: visualization("FIRST") },
    { toolResponseMetadata: { mcp_tool_result: { structuredContent: {} } } }
  ]) {
    harness.emitGlobals(globals);
    assert.deepEqual(harness.rootElement.children, [second]);
    assert.equal(harness.rootElement.hidden, false);
  }
  assert.equal(harness.images.length, 2);
});

test("widget state is a bootstrap fallback until the first valid image only", () => {
  const initial = createHarness(undefined, { initialWidgetState: visualization("INITIAL") });
  assert.equal(initial.images[0].src, "https://skillpilot.com/INITIAL.png");

  const delayed = createHarness(undefined);
  delayed.emitGlobals({ widgetState: visualization("DELAYED") });
  assert.equal(delayed.images[0].src, "https://skillpilot.com/DELAYED.png");
  delayed.context.__deliverToolResult({ structuredContent: visualization("LIVE") });
  const live = delayed.images[1];
  live.dispatch("error");
  delayed.emitGlobals({ widgetState: visualization("DELAYED") });
  assert.deepEqual(delayed.rootElement.children, []);
  assert.equal(delayed.images.length, 2, "persisted state must not retry after a live image failure");
});

test("failed or unsafe result envelopes retain the last image across both host channels", () => {
  const harness = createHarness(visualization("CURRENT"));
  const current = harness.images[0];
  current.dispatch("load");
  for (const result of [
    { isError: true, structuredContent: visualization("FAILED") },
    { structuredContent: { goalVisualization: {
      ...visualization("UNSAFE").goalVisualization, imageUrl: "javascript:alert(1)"
    } } },
    { structuredContent: {} }
  ]) {
    harness.context.__deliverToolResult(result);
    harness.emitGlobals({ toolResponseMetadata: { status: "complete", mcp_tool_result: result } });
    assert.deepEqual(harness.rootElement.children, [current]);
    assert.equal(harness.rootElement.hidden, false);
  }
  assert.equal(harness.images.length, 1);
  assert.equal(harness.context.__teardownCount, 0);
});
