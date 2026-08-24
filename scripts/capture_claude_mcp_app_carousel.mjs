import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "../app/node_modules/playwright/index.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const appRoot = resolve(repositoryRoot, "ai/claude/app");
const appManifestPath = resolve(appRoot, "dist/manifest.json");
const carouselRoot = resolve(
  repositoryRoot,
  "ai/claude/connector-v1/assets/carousel",
);
const carouselManifestPath = resolve(carouselRoot, "manifest.json");
const sourceAppManifestPath = resolve(carouselRoot, "source-app-manifest.json");
const publicImageUrl =
  "https://skillpilot.com/assets/goal-visualizations/physik/"
  + "5c44b9ba-9b05-4774-95d5-073230d3fc4f/"
  + "5c44b9ba-9b05-4774-95d5-073230d3fc4f.jpg";
const publicImagePath = resolve(
  repositoryRoot,
  "app/public/assets/goal-visualizations/physik/"
  + "5c44b9ba-9b05-4774-95d5-073230d3fc4f/"
  + "5c44b9ba-9b05-4774-95d5-073230d3fc4f.jpg",
);
const viewportWidth = 1280;
const appWidth = 1200;

const appManifestBytes = await readFile(appManifestPath);
const appManifest = JSON.parse(appManifestBytes.toString("utf8"));
const sourceRevision = execFileSync("git", ["rev-parse", "HEAD"], {
  cwd: repositoryRoot,
  encoding: "utf8",
}).trim();
const sourceDate = execFileSync(
  "git",
  ["show", "-s", "--format=%cs", sourceRevision],
  { cwd: repositoryRoot, encoding: "utf8" },
).trim();

const goalResource = resourceForTool(
  appManifest,
  "render_skillpilot_goal_visualization",
);
const memoryResource = resourceForTool(
  appManifest,
  "start_skillpilot_memory_practice",
);
const goalHtml = await readFile(resolve(appRoot, "dist", goalResource.path), "utf8");
const memoryHtml = await readFile(
  resolve(appRoot, "dist", memoryResource.path),
  "utf8",
);

await mkdir(carouselRoot, { recursive: true });
await verifySourceResource(goalResource, "goal-visualization.html");
await verifySourceResource(memoryResource, "memory-card-practice.html");
await writeFile(sourceAppManifestPath, appManifestBytes);

const browser = await chromium.launch({ headless: true });
const records = [];
try {
  const goalPage = await openMcpApp({
    browser,
    html: goalHtml,
    toolResult: goalToolResult(),
    imageRoute: {
      url: publicImageUrl,
      path: publicImagePath,
      contentType: "image/jpeg",
    },
  });
  try {
    const frame = goalPage.frameLocator("#app");
    await frame.locator("img").waitFor({ state: "visible" });
    await goalPage.waitForFunction(() => {
      const frame = document.querySelector("#app");
      const image = frame?.contentDocument?.querySelector("img");
      return Boolean(image?.complete && image.naturalWidth > 0);
    });
    records.push(await capture({
      page: goalPage,
      frame,
      fileName: "01-goal-visualization.png",
      id: "goal-visualization-de",
      locale: "de-DE",
      toolName: "render_skillpilot_goal_visualization",
      resource: goalResource,
      pairedPrompt:
        "Nutze SkillPilot, lade meinen aktuellen Lernkontext und zeige mir die "
        + "freigegebene Lernzielvisualisierung für mein aktives Ziel. Ändere nichts.",
      interaction: "initial MCP App response",
    }));
  } finally {
    await goalPage.close();
  }

  const memoryPage = await openMcpApp({
    browser,
    html: memoryHtml,
    toolResult: memoryToolResult(),
  });
  try {
    const frame = memoryPage.frameLocator("#app");
    await frame.getByRole("button", { name: /Antwort zeigen/u }).waitFor();
    records.push(await capture({
      page: memoryPage,
      frame,
      fileName: "02-memory-practice-question.png",
      id: "memory-practice-question-de",
      locale: "de-DE",
      toolName: "start_skillpilot_memory_practice",
      resource: memoryResource,
      pairedPrompt:
        "Starte die normale SkillPilot-Karteikartenübung für mein aktives "
        + "Lernkartenziel. Verwende keinen Verified Recall und ändere keine Meisterung.",
      interaction: "initial MCP App response",
    }));

    await frame.getByRole("button", { name: /Antwort zeigen/u }).click();
    await frame.getByText("Antwort", { exact: true }).waitFor();
    records.push(await capture({
      page: memoryPage,
      frame,
      fileName: "03-memory-practice-answer.png",
      id: "memory-practice-answer-de",
      locale: "de-DE",
      toolName: "start_skillpilot_memory_practice",
      resource: memoryResource,
      pairedPrompt:
        "Starte die normale SkillPilot-Karteikartenübung für mein aktives "
        + "Lernkartenziel. Verwende keinen Verified Recall und ändere keine Meisterung.",
      interaction: "learner selected Antwort zeigen inside the MCP App",
    }));
  } finally {
    await memoryPage.close();
  }
} finally {
  await browser.close();
}

const manifest = {
  schemaVersion: 1,
  purpose:
    "Submission carousel for the two real SkillPilot Claude MCP Apps. The PNGs "
    + "contain synthetic fixture data and only the rendered app response.",
  generatedBy: "scripts/capture_claude_mcp_app_carousel.mjs",
  captureHost: "local-standards-compatible-mcp-app-host",
  targetSurface: "Claude.ai",
  sourceRevision,
  sourceDate,
  sourceAppManifest:
    "ai/claude/connector-v1/assets/carousel/source-app-manifest.json",
  sourceAppManifestSha256: sha256(appManifestBytes),
  assets: records,
};
await writeFile(
  carouselManifestPath,
  `${JSON.stringify(manifest, null, 2)}\n`,
  "utf8",
);

for (const record of records) {
  console.log(
    `Captured ${record.path} ${record.width}x${record.height} sha256=${record.sha256}`,
  );
}
console.log(
  "Captured three sanitized Claude MCP App carousel candidates; approvals remain pending.",
);

async function openMcpApp({ browser, html, toolResult, imageRoute }) {
  const page = await browser.newPage({
    viewport: { width: viewportWidth, height: 1200 },
    deviceScaleFactor: 1,
    locale: "de-DE",
    colorScheme: "light",
  });
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));
  if (imageRoute) {
    await page.route(imageRoute.url, async (route) => {
      await route.fulfill({
        path: imageRoute.path,
        contentType: imageRoute.contentType,
      });
    });
  }
  await page.setContent(`<!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8">
        <style>
          html, body { margin: 0; padding: 0; background: #ffffff; }
          #app { display: block; width: ${appWidth}px; height: 1000px; border: 0; }
        </style>
      </head>
      <body><iframe id="app" title="SkillPilot MCP App"></iframe></body>
    </html>`);
  await page.evaluate(({ resourceHtml, result, width }) => {
    const frame = document.querySelector("#app");
    window.__skillpilotCaptureMessages = [];
    window.addEventListener("message", (event) => {
      const message = event.data;
      if (!message || message.jsonrpc !== "2.0") return;
      window.__skillpilotCaptureMessages.push({
        sourceMatches: event.source === frame.contentWindow,
        method: message.method ?? null,
        id: message.id ?? null,
      });
      if (event.source !== frame.contentWindow) return;

      if (message.method === "ui/initialize" && message.id !== undefined) {
        frame.contentWindow.postMessage({
          jsonrpc: "2.0",
          id: message.id,
          result: {
            protocolVersion: "2026-01-26",
            hostCapabilities: {},
            hostInfo: { name: "skillpilot-carousel-capture", version: "1.0.0" },
            hostContext: {
              theme: "light",
              displayMode: "inline",
              containerDimensions: { width, maxHeight: 900 },
              locale: "de-DE",
              platform: "web",
            },
          },
        }, "*");
        return;
      }

      if (message.method === "ui/notifications/initialized") {
        frame.contentWindow.postMessage({
          jsonrpc: "2.0",
          method: "ui/notifications/tool-result",
          params: result,
        }, "*");
      }
    });
    frame.srcdoc = resourceHtml;
  }, { resourceHtml: html, result: toolResult, width: appWidth });

  const frame = page.frameLocator("#app");
  await frame.locator("#root").waitFor({ state: "visible" });
  try {
    await page.waitForFunction(() => {
      const host = document.querySelector("#app");
      const root = host?.contentDocument?.querySelector("#root");
      return Boolean(root?.childElementCount);
    }, undefined, { timeout: 10_000 });
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      messages: window.__skillpilotCaptureMessages,
      rootChildCount:
        document.querySelector("#app")?.contentDocument
          ?.querySelector("#root")?.childElementCount ?? null,
      rootChildTags: Array.from(
        document.querySelector("#app")?.contentDocument
          ?.querySelector("#root")?.children ?? [],
        (element) => element.tagName,
      ),
    }));
    throw new Error(
      `MCP App capture handshake failed: ${JSON.stringify({
        ...diagnostics,
        pageErrors,
      })}`,
      { cause: error },
    );
  }
  return page;
}

async function capture({
  page,
  frame,
  fileName,
  id,
  locale,
  toolName,
  resource,
  pairedPrompt,
  interaction,
}) {
  const root = frame.locator("#root");
  const privateText = await root.evaluate((element) => element.outerHTML);
  for (const forbidden of ["spc_", "learningSessionId", "reviewCapability"]) {
    if (privateText.includes(forbidden)) {
      throw new Error(`Carousel root exposes forbidden private value: ${forbidden}`);
    }
  }
  const outputPath = resolve(carouselRoot, fileName);
  await root.screenshot({ path: outputPath, animations: "disabled" });
  const bytes = await readFile(outputPath);
  const { width, height } = pngDimensions(bytes);
  if (width < 1000) {
    throw new Error(`Carousel screenshot is too narrow: ${fileName} (${width}px)`);
  }
  return {
    id,
    path: `ai/claude/connector-v1/assets/carousel/${fileName}`,
    sha256: sha256(bytes),
    width,
    height,
    format: "PNG",
    locale,
    surface: "Claude.ai",
    toolName,
    resourceName: resource.name,
    resourceUri: resource.uri,
    sourceResourceSha256: resource.sha256,
    pairedPrompt,
    interaction,
    fixture: "synthetic-authorized-adult-release-fixture",
    attestations: {
      appResponseOnly: true,
      promptExcluded: true,
      browserChromeExcluded: true,
      temporaryLearningSessionExcluded: true,
      permanentLearnerIdExcluded: true,
      learnerDataExcluded: true,
      oauthValuesExcluded: true,
      protectedAnswersExcluded: true,
    },
    approvals: {
      product: "pending",
      qa: "pending",
      legal: "pending",
    },
  };
}

function resourceForTool(manifest, toolName) {
  const uri = manifest.tools?.[toolName]?.resourceUri;
  const resource = manifest.resources?.find((candidate) => candidate.uri === uri);
  if (!resource) throw new Error(`Missing active MCP App resource for ${toolName}`);
  return resource;
}

async function verifySourceResource(resource, expectedFileName) {
  const expectedPath = `sha256-${resource.sha256}/${expectedFileName}`;
  const expectedClasspathPath =
    `backend/src/main/resources/claude-connector-v1/mcp-apps/${expectedFileName}`;
  if (resource.path !== expectedPath) {
    throw new Error(`Unexpected built MCP App path: ${resource.path}`);
  }
  if (resource.classpathPath !== expectedClasspathPath) {
    throw new Error(
      `Unexpected deployed MCP App path: ${resource.classpathPath}`,
    );
  }
  const builtBytes = await readFile(resolve(appRoot, "dist", resource.path));
  const deployedBytes = await readFile(resolve(repositoryRoot, resource.classpathPath));
  if (sha256(builtBytes) !== resource.sha256) {
    throw new Error(`Built MCP App bytes changed for ${resource.name}`);
  }
  if (sha256(deployedBytes) !== resource.sha256) {
    throw new Error(`Deployed MCP App bytes changed for ${resource.name}`);
  }
}

function goalToolResult() {
  return {
    structuredContent: {
      goalVisualization: {
        goalId: "5c44b9ba-9b05-4774-95d5-073230d3fc4f",
        title: "Warum Physik? – Weltverständnis & Zukunft",
        description:
          "Entdecke, wie Physik hilft, Alltag, Medizin, Sterne und Energie zu verstehen.",
        imageUrl: publicImageUrl,
        altText:
          "Illustration mit Smartphone, medizinischer Bildgebung, Sternen und erneuerbarer Energie.",
        cockpitUrl: "https://skillpilot.com/cockpit",
      },
    },
  };
}

function memoryToolResult() {
  return {
    structuredContent: { status: "ready", stateVersion: 8 },
    _meta: {
      skillpilotMemoryCard: {
        learningSessionId: `spc_${"S".repeat(43)}`,
        communicationLocale: "de-DE",
        goalId: "DE_GYM_MATH_MEMORY_FUNCTIONS",
        goalTitle: "Grundwissen zu Funktionen und Gleichungen",
        expectedStateVersion: 8,
        progress: { due: 2, scheduled: 4, total: 8 },
        completed: false,
        cardBatch: {
          totalDueCards: 2,
          cards: [
            {
              id: "synthetic-card-1",
              front: "Wie lautet die Steigungsformel für zwei Punkte?",
              back: "$m = \\frac{y_2-y_1}{x_2-x_1}$",
              category: "Lineare Funktionen",
              reviewCapability: "R".repeat(48),
            },
            {
              id: "synthetic-card-2",
              front: "Was besagt das Nullprodukt?",
              back:
                "Ein Produkt ist genau dann null, wenn mindestens ein Faktor null ist.",
              category: "Gleichungen",
              reviewCapability: "T".repeat(48),
            },
          ],
        },
      },
    },
  };
}

function pngDimensions(bytes) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  if (
    bytes.length < 24
    || !bytes.subarray(0, 8).equals(signature)
    || bytes.toString("ascii", 12, 16) !== "IHDR"
  ) {
    throw new Error("Generated carousel asset is not a valid PNG.");
  }
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}
