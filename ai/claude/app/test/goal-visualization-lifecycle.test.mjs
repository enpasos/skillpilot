import assert from "node:assert/strict";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { runInNewContext } from "node:vm";
import { build } from "esbuild";

// Execute the production entrypoint and parser. Only the host bridge is replaced;
// the DOM and clock expose image events and delays without network or wall time.
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL("../src/goal-visualization-main.js", import.meta.url))],
  bundle: true,
  write: false,
  format: "iife",
  loader: { ".css": "text" },
  plugins: [{
    name: "test-host-bridge",
    setup(builder) {
      builder.onResolve({ filter: /\/mcp-app-bridge\.js$/ }, () => ({
        path: "host-bridge",
        namespace: "test-host"
      }));
      builder.onLoad({ filter: /.*/, namespace: "test-host" }, () => ({
        contents: "export const SkillPilotMcpAppBridge = globalThis.TestHostBridge;"
      }));
    }
  }]
});
const appScript = outputFiles[0].text;

test("a tool result delayed thirty seconds still displays its image", () => {
  const app = mountApp();
  app.advance(30_000);
  assert.equal(app.teardowns, 0);
  assert.equal(app.root.hidden, true);
  assert.equal(app.root.children.length, 0);

  app.resolveBridge();
  app.deliver(goalResult("goal-late"));
  const image = app.root.children[0];
  assert.equal(image.src, "https://skillpilot.com/goal-late.png");
  assert.equal(app.root.hidden, true);
  image.emit("load");
  assert.equal(app.root.hidden, false);
  assert.equal(app.teardowns, 0);
});

test("an image taking more than twenty seconds remains eligible to display", () => {
  const app = mountApp();
  app.deliver(goalResult("goal-slow"));
  const image = app.root.children[0];
  app.advance(25_000);
  assert.equal(app.root.children[0], image);
  assert.equal(app.root.hidden, true);
  assert.equal(app.teardowns, 0);

  image.emit("load");
  assert.equal(app.root.hidden, false);
  assert.equal(app.teardowns, 0);
});

test("successive goals display separately and ignore stale image events", () => {
  const app = mountApp();
  app.deliver(goalResult("goal-first"));
  const first = app.root.children[0];
  first.emit("load");
  assert.equal(app.root.hidden, false);

  app.deliver(goalResult("goal-second"));
  const second = app.root.children[0];
  assert.notEqual(second, first);
  assert.equal(second.src, "https://skillpilot.com/goal-second.png");
  assert.equal(app.root.hidden, true);
  first.emit("load");
  first.emit("error");
  assert.equal(app.root.hidden, true);
  assert.equal(app.root.children[0], second);
  assert.equal(app.teardowns, 0);

  second.emit("load");
  first.emit("error");
  assert.equal(app.root.hidden, false);
  assert.equal(app.root.children[0], second);
  assert.equal(app.teardowns, 0);
});

test("a real image error dismisses the empty component only once", () => {
  const app = mountApp();
  app.deliver(goalResult("goal-broken"));
  const image = app.root.children[0];
  image.emit("error");
  assert.equal(app.root.hidden, true);
  assert.equal(app.root.children.length, 0);
  assert.equal(app.teardowns, 1);

  image.emit("load");
  image.emit("error");
  app.advance(30_000);
  assert.equal(app.root.hidden, true);
  assert.equal(app.teardowns, 1);
});

test("a malformed final result dismisses a component with no valid image", () => {
  for (const result of [undefined, {}, { structuredContent: {} }, {
    structuredContent: { goalVisualization: { goalId: "incomplete" } }
  }]) {
    const app = mountApp();
    app.deliver(result);
    assert.equal(app.root.hidden, true);
    assert.equal(app.root.children.length, 0);
    assert.equal(app.teardowns, 1);
  }
});

test("invalid or repeated results retain an existing valid image", () => {
  const app = mountApp();
  const result = goalResult("goal-valid");
  app.deliver(result);
  const image = app.root.children[0];
  image.emit("load");

  app.deliver({ structuredContent: { goalVisualization: { title: "partial" } } });
  app.deliver(result);
  assert.equal(app.root.children[0], image);
  assert.equal(app.root.hidden, false);
  assert.equal(app.teardowns, 0);
});

test("a failed host connection dismisses the empty component", async () => {
  const app = mountApp();
  app.rejectBridge(new Error("Host connection failed"));
  await Promise.resolve();
  assert.equal(app.root.hidden, true);
  assert.equal(app.root.children.length, 0);
  assert.equal(app.teardowns, 1);
});

function goalResult(goalId) {
  return { structuredContent: { goalVisualization: {
    goalId,
    title: "Learning goal",
    imageUrl: `https://skillpilot.com/${goalId}.png`,
    altText: "An illustration of the learning goal",
    cockpitUrl: "https://skillpilot.com/cockpit"
  } } };
}

function mountApp() {
  const root = new FakeElement();
  root.hidden = true;
  const clock = new FakeClock();
  let receiveResult;
  let resolveBridge;
  let rejectBridge;
  let teardowns = 0;
  const ready = new Promise((resolve, reject) => {
    resolveBridge = resolve;
    rejectBridge = reject;
  });
  class TestHostBridge {
    ready = ready;
    constructor(_name, onResult) {
      receiveResult = onResult;
    }
    async requestTeardown() {
      teardowns += 1;
    }
  }
  runInNewContext(appScript, {
    TestHostBridge,
    HTMLElement: FakeElement,
    URL,
    window: clock,
    document: {
      head: { append() {} },
      querySelector: (selector) => selector === "#root" ? root : null,
      createElement: () => new FakeElement()
    }
  });
  return {
    root,
    resolveBridge,
    rejectBridge,
    deliver: (result) => receiveResult(result),
    advance: (milliseconds) => clock.advance(milliseconds),
    get teardowns() { return teardowns; }
  };
}

class FakeElement {
  hidden = false;
  children = [];
  listeners = new Map();
  addEventListener(type, handler) {
    const handlers = this.listeners.get(type) ?? [];
    handlers.push(handler);
    this.listeners.set(type, handlers);
  }
  emit(type) {
    for (const handler of this.listeners.get(type) ?? []) handler();
  }
  replaceChildren(...children) { this.children = children; }
  contains(element) { return this.children.includes(element); }
}

class FakeClock {
  now = 0;
  nextId = 1;
  timers = new Map();
  setTimeout = (callback, delay) => {
    const id = this.nextId++;
    this.timers.set(id, { callback, at: this.now + delay });
    return id;
  };
  clearTimeout = (id) => { this.timers.delete(id); };
  advance(milliseconds) {
    const end = this.now + milliseconds;
    for (let executions = 0; ; executions += 1) {
      const next = [...this.timers].sort((left, right) => left[1].at - right[1].at)[0];
      if (!next || next[1].at > end) break;
      assert.ok(executions < 100, "Unexpected unbounded timer loop");
      this.now = next[1].at;
      this.timers.delete(next[0]);
      next[1].callback();
    }
    this.now = end;
  }
}
