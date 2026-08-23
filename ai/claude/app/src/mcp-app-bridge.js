import { App } from "@modelcontextprotocol/ext-apps";
import { JSONRPCMessageSchema } from "@modelcontextprotocol/sdk/types.js";

/**
 * postMessage transport for private MCP App payloads.
 *
 * The ext-apps default transport logs complete JSON-RPC messages. Claude's
 * memory-practice messages may contain private card content and opaque review
 * capabilities, so this transport validates and forwards messages without
 * writing message data to the browser console.
 */
export class SilentPostMessageTransport {
  #eventTarget;
  #eventSource;
  #messageTarget;
  #messageListener;
  #started = false;

  constructor(eventTarget, eventSource, messageTarget = window) {
    if (!eventTarget || typeof eventTarget.postMessage !== "function") {
      throw new TypeError("A postMessage event target is required");
    }
    if (!eventSource) {
      throw new TypeError("A trusted message source is required");
    }
    if (
      !messageTarget ||
      typeof messageTarget.addEventListener !== "function" ||
      typeof messageTarget.removeEventListener !== "function"
    ) {
      throw new TypeError("A message listener target is required");
    }

    this.#eventTarget = eventTarget;
    this.#eventSource = eventSource;
    this.#messageTarget = messageTarget;
    this.#messageListener = (event) => {
      if (event.source !== this.#eventSource) return;

      const parsed = JSONRPCMessageSchema.safeParse(event.data);
      if (parsed.success) {
        this.onmessage?.(parsed.data);
        return;
      }

      // Ignore unrelated host messages. A malformed message that explicitly
      // claims to be JSON-RPC is reported without including its private data.
      if (event.data?.jsonrpc === "2.0") {
        this.onerror?.(new Error("Invalid JSON-RPC message received"));
      }
    };
  }

  async start() {
    if (this.#started) return;
    this.#messageTarget.addEventListener("message", this.#messageListener);
    this.#started = true;
  }

  async send(message) {
    this.#eventTarget.postMessage(message, "*");
  }

  async close() {
    if (this.#started) {
      this.#messageTarget.removeEventListener("message", this.#messageListener);
      this.#started = false;
    }
    this.onclose?.();
  }

  onclose;
  onerror;
  onmessage;
  sessionId;
  setProtocolVersion;
}

/**
 * Small standards-only bridge shared by the Claude MCP Apps.
 *
 * No provider compatibility globals are read. Learner identity is represented
 * only by the short-lived session received in private tool-result metadata and
 * returned in component-local tool arguments.
 */
export class SkillPilotMcpAppBridge {
  #app;

  constructor(name, onToolResult) {
    this.#app = new App(
      { name, version: "1.0.0" },
      {},
      { autoResize: true, strict: true }
    );
    this.#app.ontoolresult = onToolResult;
    const parentWindow = window.parent;
    this.ready = this.#app.connect(
      new SilentPostMessageTransport(parentWindow, parentWindow, window)
    );
  }

  async callTool(name, args) {
    await this.ready;
    return this.#app.callServerTool({ name, arguments: args });
  }

  async requestTeardown() {
    await this.#app.requestTeardown();
  }
}
