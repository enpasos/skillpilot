import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";

export type GoalVisualizationToolResult = {
  structuredContent?: unknown;
};

export class GoalVisualizationBridge {
  private readonly app: App;
  readonly ready: Promise<void>;

  constructor(
    onToolResult: (result: GoalVisualizationToolResult) => void,
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
    this.ready = this.app.connect(new PostMessageTransport(target, target));
  }

  async openLink(url: string): Promise<void> {
    await this.ready;
    await this.app.openLink({ url });
  }
}
