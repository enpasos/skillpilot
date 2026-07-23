import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { sessionCorrelationFromExtra } from "./session-correlation.mjs";

export const REGRESSION_SERVER_NAME = "skillpilot-openai-mcp-retention-regression";

export const REGRESSION_INSTRUCTIONS = `You are running a deterministic MCP result-retention test. Treat a command as valid only when the user's entire trimmed message is exactly one of: MCP_RUN_SINGLE, MCP_RUN_CHAIN, MCP_RUN_RETAIN, MCP_RECALL_RETAIN, MCP_VERIFY_RETAIN, MCP_HELP.

Never invent, predict, normalize, shorten, or reformat probe_id, token, or proof, and never reuse a tuple from another run or conversation. Obtain values only from the actual create_mcp_retention_probe result belonging to the current test. The values are inert synthetic markers, not credentials.
Tool-call count and turn boundary are part of the measurement; never make an unrequested second tool call.

MCP_RUN_SINGLE: Call create_mcp_retention_probe exactly once. Reply exactly "MCP_SINGLE probe_id=<probe_id> token=<token>" using its structured result, or MCP_SINGLE_ERROR. Do not verify.
MCP_RUN_CHAIN: Call create_mcp_retention_probe once, then call verify_mcp_retention_probe once in the same assistant turn with the unchanged three fields. Reply exactly MCP_CHAIN_PASS only if ok=true, proof_valid=true, and probe_id matches; otherwise MCP_CHAIN_FAIL or MCP_CHAIN_ERROR. Do not reveal values.
MCP_RUN_RETAIN: Call create_mcp_retention_probe exactly once. Retain its probe_id, token, and proof for the next user turn without showing them. Reply exactly MCP_RETAIN_READY on success or MCP_RETAIN_ERROR. Do not verify.
MCP_RECALL_RETAIN: Do not call any tool. If a successful MCP_RUN_RETAIN exists in this conversation and its structured result is available, reply exactly "MCP_RETAIN token=<retained token>". Otherwise reply exactly MCP_RETAIN_MISSING.
MCP_VERIFY_RETAIN: Do not create or reload a probe. Call verify_mcp_retention_probe exactly once using the unchanged tuple from the immediately preceding successful MCP_RUN_RETAIN. Reply exactly MCP_VERIFY_PASS only if verification succeeds and probe_id matches; otherwise MCP_VERIFY_MISSING, MCP_VERIFY_FAIL, or MCP_VERIFY_ERROR. Do not reveal values.
MCP_HELP: Call no tool and reply exactly "MCP_RUN_SINGLE MCP_RUN_CHAIN MCP_RUN_RETAIN MCP_RECALL_RETAIN MCP_VERIFY_RETAIN MCP_HELP".
For any other message, call no tool and reply exactly MCP_UNKNOWN_COMMAND.`;

const probeShape = {
  probe_id: z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .describe("Fresh UUID-v4 identifier of the inert synthetic probe"),
  token: z
    .string()
    .regex(/^SPREG-[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{16}$/)
    .describe("Fresh inert synthetic marker belonging to the probe"),
  proof: z
    .string()
    .regex(/^[0-9a-f]{32}$/)
    .describe("Integrity proof belonging to the same probe")
};
const verificationShape = {
  ok: z.boolean().describe("Whether the submitted synthetic tuple is valid"),
  probe_id: z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)
    .describe("UUID-v4 identifier of the verified synthetic probe"),
  proof_valid: z.boolean().describe("Whether the integrity proof is valid")
};
const emptyInputSchema = z.strictObject({});
const probeSchema = z.strictObject(probeShape);
const verificationSchema = z.strictObject(verificationShape);
const readOnly = { readOnlyHint: true, openWorldHint: false, destructiveHint: false };
const noAuthMeta = { securitySchemes: [{ type: "noauth" }] };

export function createRegressionMcpServer({ client, auditLogger }) {
  const server = new McpServer(
    { name: REGRESSION_SERVER_NAME, version: "0.1.1" },
    { instructions: REGRESSION_INSTRUCTIONS }
  );

  server.registerTool(
    "create_mcp_retention_probe",
    {
      title: "Create MCP retention probe (no automatic verification)",
      description:
        'Creates one fresh inert synthetic tuple. Call exactly once only for MCP_RUN_SINGLE, MCP_RUN_CHAIN, or MCP_RUN_RETAIN. For MCP_RUN_SINGLE, after this call reply exactly "MCP_SINGLE probe_id=<probe_id> token=<token>" and stop; never call verify_mcp_retention_probe. For MCP_RUN_RETAIN, after this call reply exactly MCP_RETAIN_READY and stop without revealing the tuple; never call verify_mcp_retention_probe. Only MCP_RUN_CHAIN permits verify_mcp_retention_probe in the same turn. Never call this tool for MCP_RECALL_RETAIN or MCP_VERIFY_RETAIN. It accesses no learner, account, or authorization data.',
      inputSchema: emptyInputSchema,
      outputSchema: probeSchema,
      annotations: readOnly,
      _meta: noAuthMeta
    },
    async (_arguments, extra) => {
      try {
        const { payload, backendRequestId } = await client.createProbe();
        const session = sessionCorrelationFromExtra(extra);
        auditLogger.log("probe_created", {
          tool: "create_mcp_retention_probe",
          probe_id: payload.probe_id,
          backend_request_id: backendRequestId,
          session_present: Boolean(session),
          session_sha256: session?.hash ?? null
        });
        return structuredReply(
          "MCP_CREATE_COMPLETE. Do not call verify_mcp_retention_probe unless the exact initiating command is MCP_RUN_CHAIN.",
          payload
        );
      } catch (error) {
        const session = sessionCorrelationFromExtra(extra);
        auditLogger.log("probe_create_failed", {
          tool: "create_mcp_retention_probe",
          probe_id: null,
          backend_request_id: error?.backendRequestId ?? null,
          session_present: Boolean(session),
          session_sha256: session?.hash ?? null
        });
        return errorReply("MCP_CREATE_ERROR", error);
      }
    }
  );

  server.registerTool(
    "verify_mcp_retention_probe",
    {
      title: "Verify existing MCP retention probe (only when commanded)",
      description:
        "Verifies one existing inert synthetic tuple. Never call this tool for MCP_RUN_SINGLE, MCP_RUN_RETAIN, or MCP_RECALL_RETAIN. Call it only (1) immediately after create_mcp_retention_probe for the exact command MCP_RUN_CHAIN, or (2) on the later exact command MCP_VERIFY_RETAIN using the unchanged tuple from the immediately preceding successful MCP_RUN_RETAIN. For MCP_VERIFY_RETAIN, do not call create_mcp_retention_probe. Never create a replacement tuple or substitute different values. It accesses no learner, account, or authorization data.",
      inputSchema: probeSchema,
      outputSchema: verificationSchema,
      annotations: readOnly,
      _meta: noAuthMeta
    },
    async (probe, extra) => {
      try {
        const { payload, backendRequestId } = await client.verifyProbe(probe);
        const session = sessionCorrelationFromExtra(extra);
        auditLogger.log("probe_verified", {
          tool: "verify_mcp_retention_probe",
          probe_id: payload.probe_id,
          backend_request_id: backendRequestId,
          session_present: Boolean(session),
          session_sha256: session?.hash ?? null,
          proof_valid: payload.proof_valid
        });
        return structuredReply(
          "MCP_VERIFY_COMPLETE. Use structuredContent and follow the exact response format for the initiating command.",
          payload
        );
      } catch (error) {
        const session = sessionCorrelationFromExtra(extra);
        auditLogger.log("probe_verify_failed", {
          tool: "verify_mcp_retention_probe",
          probe_id: probe.probe_id,
          backend_request_id: error?.backendRequestId ?? null,
          session_present: Boolean(session),
          session_sha256: session?.hash ?? null,
          proof_valid: null
        });
        return errorReply("MCP_VERIFY_ERROR", error);
      }
    }
  );

  return server;
}

function structuredReply(text, payload) {
  return { content: [{ type: "text", text }], structuredContent: payload };
}

function errorReply(code, error) {
  console.error(`${code}: ${error instanceof Error ? error.message : "Unexpected failure"}`);
  return { isError: true, content: [{ type: "text", text: code }] };
}
