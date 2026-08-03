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

  async requestTeardown(): Promise<void> {
    // requestTeardown is a notification, not a handshake-dependent request.
    // In particular, do not wait for ui/initialize here: a host that mounted
    // the resource but never completes that handshake is exactly the host we
    // need to ask to discard the hidden component.
    await this.app.requestTeardown();
  }
}
