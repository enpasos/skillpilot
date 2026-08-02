import { createServer as createHttpServer } from "node:http";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CoachStore } from "./coach-store.mjs";
import { createCoachMcpServer } from "./create-mcp-server.mjs";
import { catalogFor, coachContract, localizedCatalogs } from "./contracts/index.mjs";
import { previewPage } from "./preview-page.mjs";

const moduleDir = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8790);
const host = process.env.HOST || "127.0.0.1";
const store = new CoachStore();
const allowedMethods = new Set(["POST", "GET", "DELETE"]);
// Local preview fixture selector only. The production Spring endpoint derives
// communicationLocale from the authenticated SkillPilot learning session.
const demoLocaleHeader = "x-skillpilot-demo-locale";

export function createAppHttpServer({
  coachStore = store,
  defaultDemoLocale = process.env.SKILLPILOT_MCP_APP_DEMO_LOCALE || "de"
} = {}) {
  catalogFor(defaultDemoLocale);
  return createHttpServer(async (request, response) => {
    try {
      const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
      const isMcpPath = url.pathname === coachContract.mcpPath;

      if (request.method === "OPTIONS" && isMcpPath) {
        writeCors(response);
        response.writeHead(204).end();
        return;
      }

      if (isMcpPath && request.method && allowedMethods.has(request.method)) {
        const catalog = catalogFor(demoLocaleFromRequest(request, defaultDemoLocale));
        writeCors(response);
        await handleMcp(request, response, coachContract, catalog, coachStore);
        return;
      }

      const previewMatch = url.pathname.match(/^\/preview\/(de|en)$/);
      if (request.method === "GET" && previewMatch) {
        html(response, previewPage(coachContract, catalogFor(previewMatch[1])));
        return;
      }

      const resetMatch = url.pathname.match(/^\/preview\/(de|en)\/reset$/);
      if (request.method === "POST" && resetMatch) {
        await coachStore.reset(catalogFor(resetMatch[1]));
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
          app: {
            appName: coachContract.appName,
            pluginIdentity: coachContract.pluginIdentity,
            contractMajor: coachContract.contractMajor,
            mcpPath: coachContract.mcpPath
          },
          demoLocales: Object.keys(localizedCatalogs)
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
          `<!doctype html><html><head><meta charset="utf-8"><title>SkillPilot MCP App</title></head><body><main><h1>SkillPilot MCP App</h1><p>One public V1 contract: <code>/mcp</code></p><ul><li><a href="/preview/de">German demo payload</a></li><li><a href="/preview/en">English demo payload</a></li></ul></main></body></html>`
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

async function handleMcp(request, response, contract, catalog, coachStore) {
  const server = await createCoachMcpServer(contract, catalog, coachStore);
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
    console.error(`MCP request failed for ${contract.pluginIdentity}`, error);
    if (!response.headersSent) json(response, 500, { error: "MCP request failed" });
  }
}

function demoLocaleFromRequest(request, fallback) {
  const value = request.headers[demoLocaleHeader];
  return typeof value === "string" && value ? value : fallback;
}

function writeCors(response) {
  response.setHeader("Access-Control-Allow-Origin", "*");
  response.setHeader("Access-Control-Allow-Methods", "POST, GET, DELETE, OPTIONS");
  response.setHeader("Access-Control-Allow-Headers", `content-type, accept, authorization, mcp-session-id, mcp-protocol-version, ${demoLocaleHeader}`);
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
    console.log(`SkillPilot MCP App listening on http://localhost:${port}${coachContract.mcpPath}`);
    console.log(`German preview: http://localhost:${port}/preview/de`);
    console.log(`English preview: http://localhost:${port}/preview/en`);
  });
}
