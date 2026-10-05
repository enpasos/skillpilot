import assert from "node:assert/strict";
import { fileURLToPath } from "node:url";
import test from "node:test";
import vm from "node:vm";
import { build } from "esbuild";

// Run the production entrypoint with the real bundled MCP Apps SDK. Only the
// browser DOM, image events, parent host and clock are controlled here.
const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL("../widget/src/goal-visualization-main.ts", import.meta.url))],
  bundle: true, format: "iife", platform: "browser", target: "es2022",
  write: false, loader: { ".css": "text" }
});
const script = outputFiles[0].text;

test("the real SDK accepts delayed and successive goal results without discarding pending images", async () => {
  const host = mount();
  const initialize = await host.waitForMessage("ui/initialize");
  assert.equal(host.context.openai, undefined, "native delivery needs no compatibility globals");
  host.advance(30_000);
  assert.equal(host.root.hidden, true);
  assert.equal(host.root.children.length, 0);
  assert.equal(host.teardowns(), 0, "a delayed host handshake must not trigger local teardown");
  host.receive({ jsonrpc: "2.0", id: initialize.id, result: {
    protocolVersion: "2026-01-26", hostInfo: { name: "local-test-host", version: "1.0.0" },
    hostCapabilities: {}, hostContext: {}
  } });
  await host.waitForMessage("ui/notifications/initialized");
  host.advance(30_000);
  assert.equal(host.teardowns(), 0, "a delayed tool result must remain eligible after initialization");
  host.deliver("FIRST");
  await host.flush();
  const first = host.root.children[0];
  assert.ok(first);
  assert.equal(host.root.hidden, true);
  host.advance(25_000);
  assert.equal(host.root.children[0], first);
  assert.equal(host.teardowns(), 0, "a slow successful image must not be discarded at fifteen seconds");
  first.emit("load");
  assert.equal(host.root.hidden, false);

  host.deliver("SECOND");
  await host.flush();
  const second = host.root.children[0];
  assert.notEqual(second, first);
  assert.equal(second.src, "https://skillpilot.com/SECOND.png");
  first.emit("load");
  first.emit("error");
  assert.equal(host.root.children[0], second);
  assert.equal(host.root.hidden, true);
  host.advance(25_000);
  second.emit("load");
  assert.equal(host.root.hidden, false);
  assert.equal(host.teardowns(), 0);
  host.deliver("SECOND");
  await host.flush();
  assert.equal(host.root.children[0], second, "duplicate notifications keep the same image element");

  host.deliver("BROKEN");
  await host.flush();
  const broken = host.root.children[0];
  broken.emit("error");
  broken.emit("error");
  await host.flush();
  assert.equal(host.root.hidden, true);
  assert.equal(host.root.children.length, 0);
  assert.equal(host.teardowns(), 1, "a real image failure still requests standard teardown exactly once");
});

function mount() {
  const root = new Element();
  const messages = [];
  const listeners = new Map();
  const timers = new Map();
  let nextTimerId = 1;
  let now = 0;
  const parent = { postMessage(message) { messages.push(message); } };
  const schedule = (callback, delay = 0) => {
    const id = nextTimerId++;
    timers.set(id, { callback, at: now + delay });
    return id;
  };
  const context = {
    AbortController, URL, Promise,
    console: { debug() {}, warn() {}, error() {} },
    parent, innerWidth: 640,
    document: {
      head: new Element(), body: new Element(), documentElement: new Element(),
      createElement: () => new Element(), querySelector: selector => selector === "#root" ? root : null
    },
    ResizeObserver: class { observe() {} disconnect() {} },
    requestAnimationFrame: callback => schedule(callback),
    setTimeout: schedule, clearTimeout: id => timers.delete(id),
    addEventListener(type, listener) {
      const registered = listeners.get(type) ?? new Set();
      registered.add(listener);
      listeners.set(type, registered);
    },
    removeEventListener(type, listener) { listeners.get(type)?.delete(listener); }
  };
  context.window = context;
  context.globalThis = context;
  vm.runInNewContext(script, context, { filename: "goal-visualization-real-sdk.test-bundle.js" });
  const receive = data => {
    for (const listener of listeners.get("message") ?? []) listener({ source: parent, data });
  };
  const flush = async () => { for (let i = 0; i < 20; i += 1) await Promise.resolve(); };
  return {
    root, context, receive, flush,
    teardowns: () => messages.filter(message => message.method === "ui/notifications/request-teardown").length,
    async waitForMessage(method) {
      await flush();
      const message = messages.find(value => value.method === method);
      assert.ok(message, `Missing SDK message ${method}`);
      return message;
    },
    deliver(goalId) {
      receive({ jsonrpc: "2.0", method: "ui/notifications/tool-result", params: {
        content: [], structuredContent: { goalVisualization: {
          goalId, title: "Learning goal", imageUrl: `https://skillpilot.com/${goalId}.png`,
          altText: "Approved image", cockpitUrl: "https://skillpilot.com/cockpit"
        } }
      } });
    },
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
    }
  };
}

class Element {
  hidden = false;
  children = [];
  listeners = new Map();
  style = { height: "" };
  addEventListener(type, callback) {
    const callbacks = this.listeners.get(type) ?? [];
    callbacks.push(callback);
    this.listeners.set(type, callbacks);
  }
  emit(type) { for (const callback of this.listeners.get(type) ?? []) callback(); }
  replaceChildren(...children) { this.children = children; }
  appendChild(child) { this.children.push(child); }
  contains(child) { return this.children.includes(child); }
  getBoundingClientRect() { return { height: 20 }; }
}
