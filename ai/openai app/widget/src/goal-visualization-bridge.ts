import {
  App,
  PostMessageTransport,
  type McpUiHostContext
} from "@modelcontextprotocol/ext-apps";

export type GoalVisualizationHostContext = McpUiHostContext;

export type GoalVisualizationToolResult = {
  structuredContent?: unknown;
};

export class GoalVisualizationBridge {
  private readonly app: App;
  readonly ready: Promise<void>;

  constructor(
    onToolResult: (result: GoalVisualizationToolResult) => void,
    onHostContextChanged: (context: GoalVisualizationHostContext) => void,
    target: Window = window.parent
  ) {
    this.app = new App(
      { name: "skillpilot-goal-visualization", version: "1.0.0" },
      {},
      { autoResize: true, strict: true }
    );
    this.app.ontoolresult = (result) => {
      onToolResult(result as GoalVisualizationToolResult);
    };
    this.app.addEventListener("hostcontextchanged", (context) => {
      onHostContextChanged(this.app.getHostContext() ?? context);
    });
    this.ready = this.app.connect(new PostMessageTransport(target, target));
  }

  hostContext(): McpUiHostContext | undefined {
    return this.app.getHostContext();
  }

  async requestTeardown(): Promise<void> {
    await this.ready;
    await this.app.requestTeardown();
  }
}
