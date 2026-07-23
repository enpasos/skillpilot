import { createServer as createHttpServer } from "node:http";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { ActionRegressionClient } from "./action-regression-client.mjs";
import { RegressionAuditLogger } from "./audit-logger.mjs";
import { createRegressionMcpServer } from "./create-mcp-server.mjs";

const port = Number(process.env.MCP_REGRESSION_PORT || 8791);
const host = process.env.MCP_REGRESSION_HOST || "127.0.0.1";
const allowedMethods = new Set(["POST", "GET", "DELETE"]);

export function createRegressionHttpServer({
  client = new ActionRegressionClient(),
  auditLogger = new RegressionAuditLogger()
} = {}) {
  return createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const isMcpPath = /^\/mcp\/?$/.test(url.pathname);

      if (request.method === "OPTIONS" && isMcpPath) {
        writeCors(response);
        response.writeHead(204).end();
        return;
      }

      if (isMcpPath && request.method && allowedMethods.has(request.method)) {
        writeCors(response);
        await handleMcp(request, response, { client, auditLogger });
        return;
      }

      if (request.method === "GET" && url.pathname === "/health") {
        json(response, 200, {
          status: "ok",
          service: "skillpilot-openai-mcp-retention-regression",
          mcpPath: "/mcp",
          ui: false
        });
        return;
      }

      if (request.method === "GET" && url.pathname === "/.well-known/openai-apps-challenge") {
        const token = process.env.OPENAI_APPS_CHALLENGE;
        if (!token) {
          response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not configured");
        } else {
          response.writeHead(200, { "content-type": "text/plain; charset=utf-8" }).end(token);
        }
        return;
      }

      if (request.method === "GET" && url.pathname === "/") {
        json(response, 200, {
          service: "skillpilot-openai-mcp-retention-regression",
          mcp: "/mcp",
          health: "/health",
          ui: false
        });
        return;
      }

      response
        .writeHead(404, {
          "content-type": "text/plain; charset=utf-8",
          "cache-control": "no-store",
          "x-content-type-options": "nosniff"
        })
        .end("Not Found");
    } catch (error) {
      console.error("Regression MCP HTTP request failed", error);
      if (!response.headersSent) json(response, 500, { error: "Internal server error" });
      else response.end();
    }
  });
}

async function handleMcp(request, response, dependencies) {
  const server = createRegressionMcpServer(dependencies);
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });
  response.on("close", () => {
    void transport.close();
    void server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(request, response);
  } catch (error) {
    console.error("Regression MCP request failed", error);
    if (!response.headersSent) json(response, 500, { error: "MCP request failed" });
  }
}

function writeCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  response.setHeader(
    "Access-Control-Allow-Headers",
    "content-type, accept, authorization, mcp-session-id, mcp-protocol-version"
  );
  response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

function json(response, status, body) {
  response.writeHead(status, {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(JSON.stringify(body));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createRegressionHttpServer().listen(port, host, () => {
    console.log(`SkillPilot UI-less MCP regression server listening on http://${host}:${port}`);
    console.log(`MCP endpoint: http://${host}:${port}/mcp`);
  });
}
