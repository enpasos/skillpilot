import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE
} from "@modelcontextprotocol/ext-apps/server";
import { z } from "zod";
import { CoachConflictError, CoachInputError } from "./coach-store.mjs";
import {
  pendingSubmissionForModel,
  privateWidgetMeta,
  publicCoachState,
  visibleSummary
} from "./presentation.mjs";

const moduleDir = dirname(fileURLToPath(import.meta.url));

function coachOutputSchema(contract) {
  const description = contract.schemaDescriptions.coachOutput;
  return {
    communicationLocale: z.enum(["de", "en"]).describe(description.communicationLocale),
    revision: z.number().int().nonnegative().describe(description.revision),
    phase: z
      .enum(["not-started", "scope-choice", "practice", "awaiting-evaluation", "feedback"])
      .describe(description.phase),
    title: z.string().describe(description.title),
    summary: z.string().describe(description.summary),
    prompt: z.string().nullable().describe(description.prompt),
    choices: z
      .array(
        z.object({
          label: z.string().describe(description.choiceLabel),
          detail: z.string().describe(description.choiceDetail)
        })
      )
      .describe(description.choices),
    answerLabel: z.string().nullable().describe(description.answerLabel),
    answerPlaceholder: z.string().nullable().describe(description.answerPlaceholder),
    submitLabel: z.string().nullable().describe(description.submitLabel),
    courseLabel: z.string().nullable().describe(description.courseLabel),
    feedback: z.string().nullable().describe(description.feedback),
    score: z.number().nullable().describe(description.score),
    maxScore: z.number().nullable().describe(description.maxScore),
    passed: z.boolean().nullable().describe(description.passed)
  };
}

const noAuth = [{ type: "noauth" }];
const readOnly = { readOnlyHint: true, openWorldHint: false, destructiveHint: false };
const privateWrite = { readOnlyHint: false, openWorldHint: false, destructiveHint: false };

function toolMeta(tool, ui = undefined) {
  return {
    securitySchemes: noAuth,
    ...(ui ? { ui } : {}),
    "openai/toolInvocation/invoking": tool.invoking,
    "openai/toolInvocation/invoked": tool.invoked,
    ...(ui?.resourceUri ? { "openai/outputTemplate": ui.resourceUri } : {}),
    ...(ui?.visibility?.includes("app") ? { "openai/widgetAccessible": true } : {})
  };
}

function coachReply(state, catalog, { includePrivateMeta = true } = {}) {
  return {
    content: [{ type: "text", text: visibleSummary(state, catalog) }],
    structuredContent: publicCoachState(state, catalog),
    ...(includePrivateMeta ? { _meta: privateWidgetMeta(state, catalog) } : {})
  };
}

function errorReply(error, catalog) {
  const expected = error instanceof CoachConflictError || error instanceof CoachInputError;
  const text = expected ? error.message : catalog.genericError;
  if (!expected) console.error("Unexpected coach tool error", error);
  return { isError: true, content: [{ type: "text", text }] };
}

async function widgetHtml(catalog) {
  return readFile(join(moduleDir, "../dist", catalog.locale, "widget.html"), "utf8");
}

function widgetResourceMeta(contract) {
  const variableName = "SKILLPILOT_WIDGET_DOMAIN";
  const configuredDomain = process.env[variableName]?.trim() || contract.widgetDomain;
  const parsedDomain = new URL(configuredDomain);
  if (
    parsedDomain.protocol !== "https:" ||
    parsedDomain.username ||
    parsedDomain.password ||
    parsedDomain.pathname !== "/" ||
    parsedDomain.search ||
    parsedDomain.hash
  ) {
    throw new Error(`${variableName} must be an HTTPS origin without a path, query, or fragment`);
  }
  const domain = parsedDomain.origin;
  const ui = {
    prefersBorder: true,
    csp: { connectDomains: [], resourceDomains: [] },
    domain
  };
  return {
    ui,
    "openai/widgetDescription":
      "Interactive SkillPilot learning card for course selection, practice, submission, and feedback.",
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": { connect_domains: [], resource_domains: [] },
    "openai/widgetDomain": domain
  };
}

function widgetResourceDescription() {
  return "Interactive interface for the SkillPilot learning coach.";
}

export async function createCoachMcpServer(contract, catalog, store) {
  const html = await widgetHtml(catalog);
  const outputSchema = coachOutputSchema(contract);
  const inputDescription = contract.schemaDescriptions.input;
  const pendingDescription = contract.schemaDescriptions.pendingOutput;
  const server = new McpServer(
    { name: contract.serverName, version: "0.1.0" },
    { instructions: contract.instructions }
  );

  registerAppResource(
    server,
    contract.resourceName,
    contract.resourceUri,
    {
      title: contract.appName,
      description: widgetResourceDescription(contract),
      _meta: widgetResourceMeta(contract)
    },
    async () => ({
      contents: [
        {
          uri: contract.resourceUri,
          mimeType: RESOURCE_MIME_TYPE,
          text: html,
          _meta: widgetResourceMeta(contract)
        }
      ]
    })
  );
  registerAppTool(
    server,
    contract.tools.open.name,
    {
      title: contract.tools.open.title,
      description: contract.tools.open.description,
      inputSchema: {
        learning_request: z
          .string()
          .trim()
          .min(1)
          .max(500)
          .optional()
          .describe(inputDescription.learningRequest)
      },
      outputSchema,
      securitySchemes: noAuth,
      annotations: privateWrite,
      _meta: toolMeta(contract.tools.open, {
        resourceUri: contract.resourceUri,
        visibility: ["model", "app"]
      })
    },
    async ({ learning_request }) => {
      try {
        return coachReply(await store.open(catalog, learning_request), catalog);
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  registerAppTool(
    server,
    contract.tools.choose.name,
    {
      title: contract.tools.choose.title,
      description: contract.tools.choose.description,
      inputSchema: {
        sessionRef: z.string().min(20).max(100).describe(inputDescription.sessionRef),
        choiceRef: z.string().min(20).max(100).describe(inputDescription.choiceRef)
      },
      outputSchema,
      securitySchemes: noAuth,
      annotations: privateWrite,
      _meta: toolMeta(contract.tools.choose, { visibility: ["app"] })
    },
    async ({ sessionRef, choiceRef }) => {
      try {
        return coachReply(await store.choose(catalog, sessionRef, choiceRef), catalog);
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  registerAppTool(
    server,
    contract.tools.submit.name,
    {
      title: contract.tools.submit.title,
      description: contract.tools.submit.description,
      inputSchema: {
        sessionRef: z.string().min(20).max(100).describe(inputDescription.sessionRef),
        answer: z.string().trim().min(1).max(4_000).describe(inputDescription.answer),
        idempotencyKey: z.string().min(20).max(100).describe(inputDescription.idempotencyKey)
      },
      outputSchema,
      securitySchemes: noAuth,
      annotations: privateWrite,
      _meta: toolMeta(contract.tools.submit, { visibility: ["app"] })
    },
    async ({ sessionRef, answer, idempotencyKey }) => {
      try {
        return coachReply(
          await store.submit(catalog, sessionRef, answer, idempotencyKey),
          catalog
        );
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  registerAppTool(
    server,
    contract.tools.pending.name,
    {
      title: contract.tools.pending.title,
      description: contract.tools.pending.description,
      inputSchema: {},
      outputSchema: {
        communicationLocale: z
          .enum(["de", "en"])
          .describe(pendingDescription.communicationLocale),
        task: z.string().describe(pendingDescription.task),
        learnerAnswer: z.string().describe(pendingDescription.learnerAnswer),
        courseLabel: z.string().nullable().describe(pendingDescription.courseLabel),
        gradingInstruction: z.string().describe(pendingDescription.gradingInstruction)
      },
      securitySchemes: noAuth,
      annotations: readOnly,
      _meta: toolMeta(contract.tools.pending, { visibility: ["model"] })
    },
    async () => {
      try {
        const state = await store.pending(catalog);
        const payload = pendingSubmissionForModel(state, catalog);
        return {
          content: [{ type: "text", text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  registerAppTool(
    server,
    contract.tools.evaluate.name,
    {
      title: contract.tools.evaluate.title,
      description: contract.tools.evaluate.description,
      inputSchema: {
        score: z.number().min(0).max(2).describe(inputDescription.score),
        feedback: z.string().trim().min(1).max(2_000).describe(inputDescription.feedback)
      },
      outputSchema,
      securitySchemes: noAuth,
      annotations: privateWrite,
      _meta: toolMeta(contract.tools.evaluate, {
        resourceUri: contract.resourceUri,
        visibility: ["model"]
      })
    },
    async ({ score, feedback }) => {
      try {
        return coachReply(
          await store.evaluate(catalog, {
            score,
            maxScore: 2,
            passed: score >= 1.5,
            feedback
          }),
          catalog
        );
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  registerAppTool(
    server,
    contract.tools.context.name,
    {
      title: contract.tools.context.title,
      description: contract.tools.context.description,
      inputSchema: {},
      outputSchema,
      securitySchemes: noAuth,
      annotations: readOnly,
      _meta: toolMeta(contract.tools.context, { visibility: ["model"] })
    },
    async () => {
      try {
        return coachReply(await store.current(catalog), catalog, { includePrivateMeta: false });
      } catch (error) {
        return errorReply(error, catalog);
      }
    }
  );

  return server;
}
