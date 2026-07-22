import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CoachStore } from "./coach-store.mjs";
import { createCoachMcpServer } from "./create-mcp-server.mjs";
import { contracts, contractFor } from "./contracts/index.mjs";
import { previewPage } from "./preview-page.mjs";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";
const store = new CoachStore();
const allowedMethods = new Set(["POST", "GET", "DELETE"]);

export function createAppHttpServer({ coachStore = store } = {}) {
  return createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const locale = localeFromPath(url.pathname);

      if (request.method === "OPTIONS" && locale) {
        writeCors(response);
        response.writeHead(204).end();
        return;
      }

      if (locale && request.method && allowedMethods.has(request.method)) {
        writeCors(response);
        await handleMcp(request, response, contractFor(locale), coachStore);
        return;
      }

      const previewMatch = url.pathname.match(/^\/preview\/(de|en)$/);
      if (request.method === "GET" && previewMatch) {
        html(response, previewPage(contractFor(previewMatch[1])));
        return;
      }

      const resetMatch = url.pathname.match(/^\/preview\/(de|en)\/reset$/);
      if (request.method === "POST" && resetMatch) {
        await coachStore.reset(contractFor(resetMatch[1]));
        json(response, 200, { reset: true });
        return;
      }

      const widgetMatch = url.pathname.match(/^\/preview\/(de|en)\/widget$/);
      if (request.method === "GET" && widgetMatch) {
        const widget = await readFile(join(moduleDir, "../dist", widgetMatch[1], "widget.html"), "utf8");
        html(response, widget);
        return;
      }

      if (request.method === "GET" && url.pathname === "/health") {
        json(response, 200, {
          status: "ok",
          apps: Object.values(contracts).map(({ appName, mcpPath, locale }) => ({
            appName,
            locale,
            mcpPath,
            preview: `/preview/${locale}`
          }))
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
        html(
          response,
          `<!doctype html><html><head><meta charset="utf-8"><title>SkillPilot MCP Apps</title></head><body><main><h1>SkillPilot MCP Apps</h1><ul><li><a href="/preview/de">Deutsch</a> — <code>/mcp/de</code></li><li><a href="/preview/en">English</a> — <code>/mcp/en</code></li></ul></main></body></html>`
        );
        return;
      }

      response.writeHead(404, { "content-type": "text/plain; charset=utf-8" }).end("Not Found");
    } catch (error) {
      console.error("HTTP request failed", error);
      if (!response.headersSent) {
        json(response, 500, { error: "Internal server error" });
      } else {
        response.end();
      }
    }
  });
}

async function handleMcp(request, response, contract, coachStore) {
  const server = await createCoachMcpServer(contract, coachStore);
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
    console.error(`MCP request failed for ${contract.locale}`, error);
    if (!response.headersSent) json(response, 500, { error: "MCP request failed" });
  }
}

function localeFromPath(pathname) {
  const match = pathname.match(/^\/mcp\/(de|en)(?:\/.*)?$/);
  return match?.[1] || null;
}

function writeCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", "content-type, accept, authorization, mcp-session-id, mcp-protocol-version");
  response.setHeader("Access-Control-Expose-Headers", "Mcp-Session-Id");
}

function html(response, body) {
  response.writeHead(200, {
    "content-type": "text/html; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  });
  response.end(body);
}

function json(response, status, body) {
  response.writeHead(status, { "content-type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(body));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  createAppHttpServer().listen(port, host, () => {
    console.log(`SkillPilot MCP Apps listening on http://localhost:${port}`);
    console.log(`German preview: http://localhost:${port}/preview/de`);
    console.log(`English preview: http://localhost:${port}/preview/en`);
  });
}
