import { App, PostMessageTransport } from "@modelcontextprotocol/ext-apps";
import type {
  SkillPilotCapabilityArguments,
  SkillPilotSetupToolCall,
  SkillPilotSetupToolName
} from "./skillpilot-start";

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

export type SkillPilotOpenAiCompatibilityApi = {
  callTool?: (
    name: string,
    arguments_: Record<string, unknown>
  ) => Promise<unknown>;
  sendFollowUpMessage?: (request: {
    prompt: string;
    scrollToBottom?: boolean;
  }) => Promise<unknown>;
  openExternal?: (request: {
    href: string;
    redirectUrl?: boolean;
  }) => void | Promise<unknown>;
};

type ActionChannel = "mcp-app" | "chatgpt-compatibility";

type OpenAiCompatibilityGlobal = typeof globalThis & {
  openai?: SkillPilotOpenAiCompatibilityApi;
};

const MAX_COMPATIBILITY_RESULT_JSON_LENGTH = 64 * 1024;
const SETUP_TOOL_NAMES = new Set<SkillPilotSetupToolName>([
  "get_skillpilot_context",
  "set_skillpilot_curriculum",
  "set_skillpilot_personalization"
]);

export class SkillPilotStartBridge {
  private readonly app: App;
  private readonly compatibilityApi: () => SkillPilotOpenAiCompatibilityApi | undefined;
  private standardReady = false;
  private standardFailed = false;
  private actionChannel: ActionChannel | undefined;
  readonly ready: Promise<void>;

  constructor(
    onToolResult: (result: SkillPilotStartToolResult) => void,
    target: Window = window.parent,
    compatibilityApi: () => SkillPilotOpenAiCompatibilityApi | undefined = () =>
      (globalThis as OpenAiCompatibilityGlobal).openai
  ) {
    this.compatibilityApi = compatibilityApi;
    this.app = new App(
      { name: "skillpilot-start", version: "1.0.0" },
      {},
      { autoResize: true, strict: true }
    );
    // One-shot tool notifications can arrive immediately after initialize.
    this.app.ontoolresult = (result) => {
      onToolResult(result as SkillPilotStartToolResult);
    };
    this.ready = this.app
      .connect(new PostMessageTransport(target, target))
      .then(() => {
        this.standardReady = true;
      })
      .catch((error: unknown) => {
        this.standardFailed = true;
        throw error;
      });
    // ChatGPT's compatibility bridge can be usable even when the shared MCP
    // Apps handshake is unavailable. Keep a rejected handshake from becoming
    // an unrelated unhandled rejection in that valid fallback case.
    void this.ready.catch(() => undefined);
  }

  async hostSupport(): Promise<SkillPilotStartHostSupport> {
    const actionChannel = await this.resolveActionChannel(false);
    return {
      serverTools: actionChannel !== undefined,
      textMessages: actionChannel !== undefined,
      openLinks: this.hasStandardOpenLinks()
        || typeof this.compatibilityApi()?.openExternal === "function"
    };
  }

  beginAttempt(): void {
    this.actionChannel = undefined;
  }

  async issueCapability(
    arguments_: SkillPilotCapabilityArguments
  ): Promise<SkillPilotStartToolResult> {
    return await this.callTool(
      "issue_skillpilot_start_capability",
      arguments_ as Record<string, unknown>
    );
  }

  async callSetupTool(call: SkillPilotSetupToolCall): Promise<SkillPilotStartToolResult> {
    if (!SETUP_TOOL_NAMES.has(call.name)) {
      throw new Error("unsupported-setup-tool");
    }
    return await this.callTool(call.name, call.arguments);
  }

  private async callTool(
    name: "issue_skillpilot_start_capability" | SkillPilotSetupToolName,
    arguments_: Record<string, unknown>
  ): Promise<SkillPilotStartToolResult> {
    const actionChannel = await this.resolveActionChannel(true);
    if (!actionChannel) {
      throw new Error("host-does-not-support-server-tools");
    }
    if (actionChannel === "chatgpt-compatibility") {
      const compatibilityApi = this.compatibilityApi();
      if (typeof compatibilityApi?.callTool !== "function") {
        throw new Error("host-compatibility-tools-became-unavailable");
      }
      const result = await compatibilityApi.callTool(
        name,
        arguments_
      );
      return normalizeCompatibilityToolResult(result);
    }
    return await this.app.callServerTool({
      name,
      arguments: arguments_
    }) as SkillPilotStartToolResult;
  }

  async sendStartMessage(text: string): Promise<SkillPilotStartMessageDelivery> {
    const actionChannel = await this.resolveActionChannel(true);
    if (!actionChannel) {
      return { supported: false, hostAccepted: false };
    }
    if (actionChannel === "chatgpt-compatibility") {
      const compatibilityApi = this.compatibilityApi();
      if (typeof compatibilityApi?.sendFollowUpMessage !== "function") {
        return { supported: false, hostAccepted: false };
      }
      const result = await compatibilityApi.sendFollowUpMessage({
        prompt: text,
        scrollToBottom: true
      });
      return {
        supported: true,
        hostAccepted: !isErrorResult(result)
      };
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
    if (this.hasStandardOpenLinks()) {
      const result = await this.app.openLink({ url });
      return result.isError !== true;
    }
    const compatibilityApi = this.compatibilityApi();
    if (typeof compatibilityApi?.openExternal !== "function") {
      if (!this.standardReady && !this.standardFailed) {
        try {
          await this.ready;
        } catch {
          // Continue with the dynamically feature-detected compatibility API.
        }
      }
      if (this.hasStandardOpenLinks()) {
        const result = await this.app.openLink({ url });
        return result.isError !== true;
      }
      const lateCompatibilityApi = this.compatibilityApi();
      if (typeof lateCompatibilityApi?.openExternal !== "function") return false;
      await lateCompatibilityApi.openExternal({ href: url, redirectUrl: false });
      return true;
    }
    await compatibilityApi.openExternal({ href: url, redirectUrl: false });
    return true;
  }

  private async resolveActionChannel(lock: boolean): Promise<ActionChannel | undefined> {
    if (this.actionChannel) return this.actionChannel;

    let channel: ActionChannel | undefined;
    if (this.hasStandardActions()) {
      channel = "mcp-app";
    } else if (this.hasCompatibilityActions()) {
      // Do not wait for a missing or hanging shared handshake when ChatGPT has
      // already exposed the complete compatibility action pair.
      channel = "chatgpt-compatibility";
    } else if (!this.standardFailed) {
      try {
        await this.ready;
      } catch {
        // The compatibility API is checked again below after handshake failure.
      }
      if (this.hasStandardActions()) {
        channel = "mcp-app";
      } else if (this.hasCompatibilityActions()) {
        channel = "chatgpt-compatibility";
      }
    }

    if (lock && channel) this.actionChannel = channel;
    return channel;
  }

  private hasStandardActions(): boolean {
    if (!this.standardReady) return false;
    const capabilities = this.app.getHostCapabilities();
    return capabilities?.serverTools !== undefined
      && capabilities?.message?.text !== undefined;
  }

  private hasStandardOpenLinks(): boolean {
    return this.standardReady
      && this.app.getHostCapabilities()?.openLinks !== undefined;
  }

  private hasCompatibilityActions(): boolean {
    const compatibilityApi = this.compatibilityApi();
    return typeof compatibilityApi?.callTool === "function"
      && typeof compatibilityApi.sendFollowUpMessage === "function";
  }
}

function normalizeCompatibilityToolResult(value: unknown): SkillPilotStartToolResult {
  const direct = toolResultEnvelope(value);
  if (direct) return direct;

  const wrapper = record(value);
  if (!wrapper || !("result" in wrapper)) {
    throw new Error("invalid-compatibility-tool-result");
  }
  let nested: unknown = wrapper.result;
  if (typeof nested === "string") {
    if (
      nested.length === 0
      || nested.length > MAX_COMPATIBILITY_RESULT_JSON_LENGTH
    ) {
      throw new Error("invalid-compatibility-tool-result");
    }
    try {
      nested = JSON.parse(nested) as unknown;
    } catch {
      throw new Error("invalid-compatibility-tool-result");
    }
  }
  const result = toolResultEnvelope(nested);
  if (!result) throw new Error("invalid-compatibility-tool-result");
  return result;
}

function toolResultEnvelope(value: unknown): SkillPilotStartToolResult | undefined {
  const source = record(value);
  if (!source) return undefined;
  if (
    !("structuredContent" in source)
    && !("content" in source)
    && !("_meta" in source)
    && !("isError" in source)
  ) {
    return undefined;
  }

  const content = Array.isArray(source.content)
    ? source.content.flatMap((item) => {
      const entry = record(item);
      if (!entry || typeof entry.type !== "string") return [];
      return [{
        type: entry.type,
        ...(typeof entry.text === "string" ? { text: entry.text } : {})
      }];
    })
    : undefined;
  const meta = record(source._meta);
  return {
    ...(source.structuredContent !== undefined
      ? { structuredContent: source.structuredContent }
      : {}),
    ...(content ? { content } : {}),
    ...(meta ? { _meta: meta } : {}),
    ...(typeof source.isError === "boolean" ? { isError: source.isError } : {})
  };
}

function isErrorResult(value: unknown): boolean {
  return record(value)?.isError === true;
}

function record(value: unknown): Record<string, unknown> | undefined {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;
}
