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
    locale: z.enum(["de", "en"]).describe(description.locale),
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

function coachReply(state, contract, { includePrivateMeta = true } = {}) {
  return {
    content: [{ type: "text", text: visibleSummary(state, contract) }],
    structuredContent: publicCoachState(state, contract),
    ...(includePrivateMeta ? { _meta: privateWidgetMeta(state, contract) } : {})
  };
}

function errorReply(error, contract) {
  const expected = error instanceof CoachConflictError || error instanceof CoachInputError;
  const text = expected
    ? error.message
    : contract.locale === "de"
      ? "Der SkillPilot-Lerncoach konnte die Aktion nicht ausführen."
      : "The SkillPilot learning coach could not complete the action.";
  if (!expected) console.error("Unexpected coach tool error", error);
  return { isError: true, content: [{ type: "text", text }] };
}

async function widgetHtml(contract) {
  return readFile(join(moduleDir, "../dist", contract.locale, "widget.html"), "utf8");
}

function widgetResourceMeta(contract) {
  const domain = process.env[`SKILLPILOT_WIDGET_DOMAIN_${contract.locale.toUpperCase()}`];
  const ui = {
    prefersBorder: true,
    csp: { connectDomains: [], resourceDomains: [] },
    ...(domain ? { domain } : {})
  };
  return {
    ui,
    "openai/widgetDescription":
      contract.locale === "de"
        ? "Interaktive SkillPilot-Lernkarte für Kurswahl, Aufgabe, Einreichung und Feedback."
        : "Interactive SkillPilot learning card for course selection, practice, submission, and feedback.",
    "openai/widgetPrefersBorder": true,
    "openai/widgetCSP": { connect_domains: [], resource_domains: [] },
    ...(domain ? { "openai/widgetDomain": domain } : {})
  };
}

export async function createCoachMcpServer(contract, store) {
  const html = await widgetHtml(contract);
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
      description:
        contract.locale === "de"
          ? "Interaktive Oberfläche des deutschen SkillPilot-Lerncoachs."
          : "Interactive interface for the English SkillPilot learning coach.",
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
        return coachReply(await store.open(contract, learning_request), contract);
      } catch (error) {
        return errorReply(error, contract);
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
        return coachReply(await store.choose(contract, sessionRef, choiceRef), contract);
      } catch (error) {
        return errorReply(error, contract);
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
          await store.submit(contract, sessionRef, answer, idempotencyKey),
          contract
        );
      } catch (error) {
        return errorReply(error, contract);
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
        locale: z.enum(["de", "en"]).describe(pendingDescription.locale),
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
        const state = await store.pending(contract);
        const payload = pendingSubmissionForModel(state, contract);
        return {
          content: [{ type: "text", text: JSON.stringify(payload) }],
          structuredContent: payload
        };
      } catch (error) {
        return errorReply(error, contract);
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
          await store.evaluate(contract, {
            score,
            maxScore: 2,
            passed: score >= 1.5,
            feedback
          }),
          contract
        );
      } catch (error) {
        return errorReply(error, contract);
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
        return coachReply(await store.current(contract), contract, { includePrivateMeta: false });
      } catch (error) {
        return errorReply(error, contract);
      }
    }
  );

  return server;
}
