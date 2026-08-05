import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";

export type MemoryCardPracticeToolResult = {
  structuredContent?: unknown;
  content?: Array<{ type: string; text?: string }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

export class MemoryCardPracticeBridge {
  private readonly app: App;
  readonly ready: Promise<void>;

  constructor(
    onToolResult: (result: MemoryCardPracticeToolResult) => void,
    target: Window = window.parent
  ) {
    this.app = new App(
      { name: "skillpilot-memory-card-practice", version: "1.0.0" },
      {},
      { autoResize: true, strict: true }
    );
    // Register before connect so a fast host cannot deliver the initial result
    // between the initialize handshake and handler registration.
    this.app.ontoolresult = (result) => {
      onToolResult(result as MemoryCardPracticeToolResult);
    };
    this.ready = this.app.connect(new PostMessageTransport(target, target));
  }

  async callTool(
    name: string,
    args: Record<string, unknown>
  ): Promise<MemoryCardPracticeToolResult> {
    await this.ready;
    return (await this.app.callServerTool({ name, arguments: args })) as MemoryCardPracticeToolResult;
  }

  async openLink(url: string): Promise<boolean> {
    await this.ready;
    const result = await this.app.openLink({ url });
    return result.isError !== true;
  }
}

