import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";
import type { SkillPilotCapabilityArguments } from "./skillpilot-start";

export type SkillPilotStartToolResult = {
  structuredContent?: unknown;
  content?: Array<{ type: string; text?: string }>;
  _meta?: Record<string, unknown>;
  isError?: boolean;
};

export type SkillPilotStartHostSupport = {
  serverTools: boolean;
  textMessages: boolean;
  openLinks: boolean;
};

export type SkillPilotStartMessageDelivery = {
  supported: boolean;
  hostAccepted: boolean;
};

export class SkillPilotStartBridge {
  private readonly app: App;
  readonly ready: Promise<void>;

  constructor(
    onToolResult: (result: SkillPilotStartToolResult) => void,
    target: Window = window.parent
  ) {
    this.app = new App(
      { name: "skillpilot-start", version: "1.0.0" },
      {},
      { autoResize: true, strict: true }
    );
    // One-shot tool notifications can arrive immediately after initialize.
    this.app.ontoolresult = (result) => {
      onToolResult(result as SkillPilotStartToolResult);
    };
    this.ready = this.app.connect(new PostMessageTransport(target, target));
  }

  async hostSupport(): Promise<SkillPilotStartHostSupport> {
    await this.ready;
    const capabilities = this.app.getHostCapabilities();
    return {
      serverTools: capabilities?.serverTools !== undefined,
      textMessages: capabilities?.message?.text !== undefined,
      openLinks: capabilities?.openLinks !== undefined
    };
  }

  async issueCapability(
    arguments_: SkillPilotCapabilityArguments
  ): Promise<SkillPilotStartToolResult> {
    if (!(await this.hostSupport()).serverTools) {
      throw new Error("host-does-not-support-server-tools");
    }
    return await this.app.callServerTool({
      name: "issue_skillpilot_start_capability",
      arguments: arguments_
    }) as SkillPilotStartToolResult;
  }

  async sendStartMessage(text: string): Promise<SkillPilotStartMessageDelivery> {
    if (!(await this.hostSupport()).textMessages) {
      return { supported: false, hostAccepted: false };
    }
    const result = await this.app.sendMessage({
      role: "user",
      content: [{ type: "text", text }]
    });
    return {
      supported: true,
      hostAccepted: result.isError !== true
    };
  }

  async openLink(url: string): Promise<boolean> {
    if (!(await this.hostSupport()).openLinks) return false;
    const result = await this.app.openLink({ url });
    return result.isError !== true;
  }
}
