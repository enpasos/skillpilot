export type ToolResult = {
  structuredContent?: CoachView;
  content?: Array<{ type: string; text?: string }>;
  _meta?: WidgetMetadata;
  isError?: boolean;
};

export type CoachView = {
  locale: "de" | "en";
  revision: number;
  phase: "not-started" | "scope-choice" | "practice" | "awaiting-evaluation" | "feedback";
  title: string;
  summary: string;
  prompt: string | null;
  choices: Array<{ label: string; detail: string }>;
  answerLabel: string | null;
  answerPlaceholder: string | null;
  submitLabel: string | null;
  courseLabel: string | null;
  feedback: string | null;
  score: number | null;
  maxScore: number | null;
  passed: boolean | null;
};

export type WidgetMetadata = {
  skillpilotApp?: {
    sessionRef?: string;
    choiceRefs?: string[];
  };
};

type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason: unknown) => void;
  timeout: ReturnType<typeof setTimeout>;
};

export class McpAppBridge {
  private nextId = 0;
  private pending = new Map<number, PendingRequest>();
  private toolResultListeners = new Set<(result: ToolResult) => void>();
  readonly ready: Promise<void>;

  constructor(private readonly target: Window = window.parent) {
    window.addEventListener("message", this.handleMessage, { passive: true });
    this.ready = this.initialize();
    void this.ready.then(() => this.startAutoResize());
  }

  onToolResult(listener: (result: ToolResult) => void): () => void {
    this.toolResultListeners.add(listener);
    return () => this.toolResultListeners.delete(listener);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    await this.ready;
    return (await this.request("tools/call", { name, arguments: args })) as ToolResult;
  }

  async updateModelContext(text: string): Promise<void> {
    await this.ready;
    await this.request("ui/update-model-context", {
      content: [{ type: "text", text }]
    });
  }

  async sendUserMessage(text: string): Promise<void> {
    await this.ready;
    await this.request("ui/message", {
      role: "user",
      content: [{ type: "text", text }]
    });
  }

  private initialize = async (): Promise<void> => {
    await this.request("ui/initialize", {
      appInfo: { name: `skillpilot-coach-${__SKILLPILOT_LOCALE__}`, version: "0.1.0" },
      appCapabilities: {},
      protocolVersion: "2026-01-26"
    });
    this.notify("ui/notifications/initialized", {});
  };

  private request(method: string, params: unknown): Promise<unknown> {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`MCP Apps bridge request timed out: ${method}`));
      }, 15_000);
      this.pending.set(id, { resolve, reject, timeout });
      this.target.postMessage({ jsonrpc: "2.0", id, method, params }, "*");
    });
  }

  private notify(method: string, params: unknown): void {
    this.target.postMessage({ jsonrpc: "2.0", method, params }, "*");
  }

  private startAutoResize(): void {
    let scheduled = false;
    let lastWidth = 0;
    let lastHeight = 0;
    const publish = () => {
      scheduled = false;
      const width = Math.ceil(document.documentElement.getBoundingClientRect().width);
      const height = Math.ceil(document.documentElement.getBoundingClientRect().height);
      if (width === lastWidth && height === lastHeight) return;
      lastWidth = width;
      lastHeight = height;
      this.notify("ui/notifications/size-changed", { width, height });
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(publish);
    };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.documentElement);
    observer.observe(document.body);
    schedule();
  }

  private handleMessage = (event: MessageEvent): void => {
    if (event.source !== this.target) return;
    const message = event.data;
    if (!message || message.jsonrpc !== "2.0") return;

    if (typeof message.id === "number") {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      clearTimeout(pending.timeout);
      this.pending.delete(message.id);
      if (message.error) pending.reject(message.error);
      else pending.resolve(message.result);
      return;
    }

    if (message.method === "ui/notifications/tool-result") {
      for (const listener of this.toolResultListeners) listener(message.params as ToolResult);
    }
  };
}

declare const __SKILLPILOT_LOCALE__: "de" | "en";
