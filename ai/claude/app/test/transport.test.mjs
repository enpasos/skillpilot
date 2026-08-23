import assert from "node:assert/strict";
import test from "node:test";

import { App } from "@modelcontextprotocol/ext-apps";

import {
  SilentPostMessageTransport,
  SkillPilotMcpAppBridge
} from "../src/mcp-app-bridge.js";

test("silent transport validates trusted messages without logging private payloads", async () => {
  const privateText = "PRIVATE_CARD_FRONT";
  const privateCapability = "PRIVATE_REVIEW_CAPABILITY";
  const privateLearningSession = `spc_${"S".repeat(43)}`;
  const view = new FakeMessageTarget();
  const parent = new FakePostMessageTarget();
  const transport = new SilentPostMessageTransport(parent, parent, view);
  const received = [];
  const errors = [];
  const consoleCalls = captureConsoleCalls();

  transport.onmessage = (message) => received.push(message);
  transport.onerror = (error) => errors.push(error);

  try {
    await transport.start();

    view.dispatchMessage({
      source: {},
      data: {
        jsonrpc: "2.0",
        method: "notifications/tools/list_changed",
        params: { privateText }
      }
    });
    view.dispatchMessage({ source: parent, data: { unrelated: privateText } });
    view.dispatchMessage({
      source: parent,
      data: {
        jsonrpc: "2.0",
        method: "notifications/tools/list_changed",
        params: { privateText }
      }
    });
    view.dispatchMessage({
      source: parent,
      data: {
        jsonrpc: "2.0",
        method: 7,
        params: { privateCapability }
      }
    });
    await transport.send({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        arguments: {
          learningSessionId: privateLearningSession,
          reviewCapability: privateCapability
        }
      }
    });

    assert.deepEqual(received, [{
      jsonrpc: "2.0",
      method: "notifications/tools/list_changed",
      params: { privateText }
    }]);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].message, "Invalid JSON-RPC message received");
    assert.doesNotMatch(errors[0].message, /PRIVATE_/);
    assert.deepEqual(parent.messages, [{
      message: {
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          arguments: {
            learningSessionId: privateLearningSession,
            reviewCapability: privateCapability
          }
        }
      },
      targetOrigin: "*"
    }]);
    assert.deepEqual(consoleCalls.calls, []);
  } finally {
    consoleCalls.restore();
    await transport.close();
  }
});

test("silent transport start is idempotent and close removes its listener", async () => {
  const view = new FakeMessageTarget();
  const parent = new FakePostMessageTarget();
  const transport = new SilentPostMessageTransport(parent, parent, view);
  let received = 0;
  let closed = 0;
  transport.onmessage = () => {
    received += 1;
  };
  transport.onclose = () => {
    closed += 1;
  };

  await transport.start();
  await transport.start();
  assert.equal(view.listenerCount, 1);
  await transport.close();
  assert.equal(view.listenerCount, 0);
  assert.equal(closed, 1);

  view.dispatchMessage({
    source: parent,
    data: { jsonrpc: "2.0", method: "notifications/tools/list_changed" }
  });
  assert.equal(received, 0);
});

test("SkillPilot bridge always supplies the silent parent-source transport", async (t) => {
  const originalWindow = globalThis.window;
  const originalConnect = App.prototype.connect;
  const parent = new FakePostMessageTarget();
  const view = new FakeMessageTarget();
  view.parent = parent;
  let suppliedTransport;

  globalThis.window = view;
  App.prototype.connect = async function (transport) {
    suppliedTransport = transport;
  };
  t.after(() => {
    App.prototype.connect = originalConnect;
    if (originalWindow === undefined) delete globalThis.window;
    else globalThis.window = originalWindow;
  });

  const bridge = new SkillPilotMcpAppBridge("transport-test", () => {});
  await bridge.ready;
  assert.ok(suppliedTransport instanceof SilentPostMessageTransport);
});

class FakeMessageTarget {
  #listeners = new Set();

  addEventListener(type, listener) {
    if (type === "message") this.#listeners.add(listener);
  }

  removeEventListener(type, listener) {
    if (type === "message") this.#listeners.delete(listener);
  }

  dispatchMessage(event) {
    for (const listener of this.#listeners) listener(event);
  }

  get listenerCount() {
    return this.#listeners.size;
  }
}

class FakePostMessageTarget {
  messages = [];

  postMessage(message, targetOrigin) {
    this.messages.push({ message, targetOrigin });
  }
}

function captureConsoleCalls() {
  const calls = [];
  const originals = new Map();
  for (const method of ["debug", "error", "info", "log", "warn"]) {
    originals.set(method, console[method]);
    console[method] = (...args) => calls.push({ method, args });
  }
  return {
    calls,
    restore() {
      for (const [method, original] of originals) console[method] = original;
    }
  };
}
