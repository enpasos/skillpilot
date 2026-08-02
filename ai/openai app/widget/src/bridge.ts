import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";

export type ToolResult = {
  structuredContent?: CoachView;
  content?: Array<{ type: string; text?: string }>;
  _meta?: WidgetMetadata;
  isError?: boolean;
};

export type CoachView = {
  communicationLocale: "de" | "en";
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

export type MessageDelivery = {
  hostAdvertisedTextMessages: boolean;
  rejected: boolean;
};

export class McpAppBridge {
  private readonly app: App;
  private readonly toolResultListeners = new Set<(result: ToolResult) => void>();
  readonly ready: Promise<void>;

  constructor(target: Window = window.parent) {
    this.app = new App(
      { name: "skillpilot-coach-v1", version: "0.1.0" },
      {},
      { autoResize: true, strict: true }
    );
    this.app.ontoolresult = (result) => {
      for (const listener of this.toolResultListeners) listener(result as ToolResult);
    };
    this.ready = this.app.connect(new PostMessageTransport(target, target));
  }

  onToolResult(listener: (result: ToolResult) => void): () => void {
    this.toolResultListeners.add(listener);
    return () => this.toolResultListeners.delete(listener);
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<ToolResult> {
    await this.ready;
    return (await this.app.callServerTool({ name, arguments: args })) as ToolResult;
  }

  async updateModelContext(text: string): Promise<void> {
    await this.ready;
    await this.app.updateModelContext({
      content: [{ type: "text", text }]
    });
  }

  async sendFollowUpMessage(text: string): Promise<MessageDelivery> {
    await this.ready;
    const hostAdvertisedTextMessages = Boolean(
      this.app.getHostCapabilities()?.message?.text
    );
    const result = await this.app.sendMessage({
      role: "user",
      content: [{ type: "text", text }]
    });
    return {
      hostAdvertisedTextMessages,
      rejected: result.isError === true
    };
  }
}

declare const __SKILLPILOT_LOCALE__: "de" | "en";
