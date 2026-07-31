import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeRepositoryCurriculumRevision } from "./compute_curriculum_revision.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = resolve(
  repositoryRoot,
  "ai/openai plugin/skillpilot-coach-de-v1",
);
const faviconRoot = resolve(repositoryRoot, "app/public/favicon");
const goalVisualizationWidget = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai/skillpilot-goal-visualization-v1.html",
);
const skillRoot = resolve(pluginRoot, "skills/skillpilot-coach-de-v1");

const read = (path) => readFileSync(path, "utf8");
const readJson = (path) => JSON.parse(read(path));

const manifestSource = read(resolve(pluginRoot, ".codex-plugin/plugin.json"));
const manifest = JSON.parse(manifestSource);
const appConfig = readJson(resolve(pluginRoot, ".app.json"));
const mcpConfig = readJson(resolve(pluginRoot, ".mcp.json"));
const releaseLine = readJson(resolve(pluginRoot, "release/line.json"));
const lifecycle = readJson(resolve(pluginRoot, "release/lifecycle.json"));
const skill = read(resolve(skillRoot, "SKILL.md"));
const policy = read(resolve(skillRoot, "references/coaching-policy.md"));
const openAiYaml = read(resolve(skillRoot, "agents/openai.yaml"));
// JSON is a strict YAML 1.2 subset. Keeping this small metadata file in that
// subset lets CI parse and validate it without a second package-manager tree.
const skillAgent = JSON.parse(openAiYaml);
const mcpContract = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java",
));
const contextProjector = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachContextProjector.java",
));
const launchService = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/service/OpenAiDeCoachConnectionService.java",
));
const contractMetadata = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1ContractMetadata.java",
));
const combinedSkill = `${skill}\n${policy}`;
const completeBehavioralSurface =
  `${manifestSource}\n${combinedSkill}\n${openAiYaml}\n${mcpContract}\n${contextProjector}\n${launchService}`;
const runtimeCurriculumRevision = computeRepositoryCurriculumRevision();
assert.match(runtimeCurriculumRevision, /^curricula-sha256@[0-9a-f]{64}$/);

// Final directory limits and required MCP listing URLs:
// https://developers.openai.com/plugins/deploy/submission-errors#listing-and-interface-errors
const requireString = (value, label, maxLength) => {
  assert.equal(typeof value, "string", `${label} must be a string.`);
  assert.ok(value.trim().length > 0, `${label} must not be blank.`);
  assert.ok(value.length <= maxLength, `${label} exceeds ${maxLength} characters.`);
};

const requireHttpsUrl = (value, label, maxLength) => {
  requireString(value, label, maxLength);
  const parsed = new URL(value);
  assert.equal(parsed.protocol, "https:", `${label} must use HTTPS.`);
  assert.equal(parsed.username, "", `${label} must not contain credentials.`);
  assert.equal(parsed.password, "", `${label} must not contain credentials.`);
};

assert.equal(manifest.name, releaseLine.pluginIdentity);
assert.match(manifest.name, /^[A-Za-z0-9][A-Za-z0-9_-]*$/);
assert.ok(manifest.name.length <= 64);
assert.match(
  manifest.version,
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  "version must be strict SemVer without leading zeroes or empty identifiers.",
);
const [manifestMajor] = manifest.version.split(".").map(Number);
assert.equal(manifestMajor, releaseLine.contractMajor);
assert.equal(releaseLine.schemaVersion, 1);
assert.equal(releaseLine.pluginIdentity, "skillpilot-coach-de-v1");
assert.equal(releaseLine.contractMajor, 1);
assert.equal(releaseLine.stateSchemaVersion, 1);
assert.equal(releaseLine.workflowVersion, "coach-de@1.0");
assert.equal(Object.hasOwn(releaseLine, "curriculumRevision"), false);
requireString(manifest.description, "description", 1024);
requireString(manifest.author?.name, "author.name", 120);
requireHttpsUrl(manifest.author?.url, "author.url", 2048);
assert.equal(manifest.skills, "./skills/");
assert.equal(manifest.mcpServers, "./.mcp.json");
assert.equal(manifest.apps, "./.app.json");
assert.equal(existsSync(resolve(pluginRoot, ".app.json")), true);
assert.deepEqual(appConfig, {
  apps: {
    "dev-6a66d0224a888191a193f2a97b86954e": {
      id: "asdk_app_6a66d0224a888191a193f2a97b86954e",
    },
  },
});

const pluginInterface = manifest.interface;
requireString(pluginInterface?.displayName, "interface.displayName", 30);
assert.equal(pluginInterface.displayName, "SkillPilot Coach DE v1");
requireString(pluginInterface?.shortDescription, "interface.shortDescription", 30);
requireString(pluginInterface?.longDescription, "interface.longDescription", 4000);
requireString(pluginInterface?.developerName, "interface.developerName", 80);
assert.ok(
  new Set([
    "Productivity",
    "Creativity",
    "Developer Tools",
    "Business & Operations",
    "Data & Analytics",
    "Communication",
    "Education & Research",
    "Security",
    "Finance",
    "Healthcare",
    "Travel",
    "Entertainment",
    "Other",
  ]).has(pluginInterface?.category),
  "Plugin category must use the current directory vocabulary.",
);
for (const field of [
  "websiteURL",
  "privacyPolicyURL",
  "termsOfServiceURL",
]) {
  requireHttpsUrl(
    pluginInterface?.[field],
    `interface.${field}`,
    1024,
  );
}
assert.equal(Object.hasOwn(pluginInterface, "supportURL"), false);
assert.equal(pluginInterface.brandColor, "#f59e0b");
assert.equal(pluginInterface.composerIcon, "./assets/favicon-96x96.png");
assert.equal(pluginInterface.logo, "./assets/web-app-manifest-512x512.png");
for (const [sourceName, pluginPath] of [
  ["favicon-96x96.png", pluginInterface.composerIcon],
  ["web-app-manifest-512x512.png", pluginInterface.logo],
]) {
  assert.deepEqual(
    readFileSync(resolve(pluginRoot, pluginPath)),
    readFileSync(resolve(faviconRoot, sourceName)),
    `${pluginPath} must be an exact copy of app/public/favicon/${sourceName}.`,
  );
}
assert.ok(
  Array.isArray(pluginInterface.capabilities) &&
    pluginInterface.capabilities.length <= 20,
  "Plugin capabilities must be an array with at most 20 entries.",
);
for (const capability of pluginInterface.capabilities) {
  requireString(capability, "interface.capabilities[]", 120);
}
assert.ok(
  Array.isArray(pluginInterface?.defaultPrompt) &&
    pluginInterface.defaultPrompt.length > 0 &&
    pluginInterface.defaultPrompt.length <= 3,
  "Plugin starter prompts must contain one to three entries.",
);
const normalizedPrompts = new Set();
for (const prompt of pluginInterface.defaultPrompt) {
  requireString(prompt, "interface.defaultPrompt[]", 128);
  assert.equal(/[\r\n]/.test(prompt), false, "Plugin starter prompts must fit on one line.");
  assert.equal(
    prompt.includes("@"),
    false,
    "Plugin starter prompts must not contain App @mentions.",
  );
  assert.equal(
    /learningSessionId|SkillPilot-Lernsession|vorbereitet/i.test(prompt),
    false,
    "Directory starters must not imply that a personal learning session is already available.",
  );
  const normalizedPrompt = prompt
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("de");
  assert.equal(
    normalizedPrompts.has(normalizedPrompt),
    false,
    "Plugin starter prompts must remain unique after Unicode and whitespace normalization.",
  );
  normalizedPrompts.add(normalizedPrompt);
}

assert.deepEqual(mcpConfig, {
  mcpServers: {
    "skillpilot-coach-de-v1": {
      type: "http",
      url: "https://mcp-v1.skillpilot.com/mcp",
    },
  },
});
assert.equal(
  mcpConfig.mcpServers[releaseLine.pluginIdentity].url,
  releaseLine.publicMcpEndpoint,
);

const endpoint = new URL(releaseLine.publicMcpEndpoint);
const oauthResource = new URL(releaseLine.oauthResource);
const uiOrigin = new URL(releaseLine.publicUiOrigin);
assert.equal(endpoint.protocol, "https:");
assert.equal(endpoint.pathname, "/mcp");
assert.equal(endpoint.origin, oauthResource.origin);
assert.equal(releaseLine.oauthResource, oauthResource.origin);
assert.equal(releaseLine.publicUiOrigin, uiOrigin.origin);
assert.equal(endpoint.hostname, `mcp-v${releaseLine.contractMajor}.skillpilot.com`);
assert.equal(uiOrigin.hostname, `ui-v${releaseLine.contractMajor}.skillpilot.com`);
assert.notEqual(releaseLine.publicMcpEndpoint, releaseLine.oauthResource);
assert.equal(
  Object.hasOwn(releaseLine, "internalCompatibilityEndpoint"),
  false,
  "V1 must not publish or declare a compatibility endpoint",
);
assert.deepEqual(releaseLine.ui, {
  enabled: true,
  stateSchemaVersion: 1,
  resources: [
    {
      mimeType: "text/html;profile=mcp-app",
      path: "ui/goal-visualization.html",
      uri: "ui://skillpilot/coach/v1/1.0.0/goal-visualization.html",
    },
  ],
});
assert.equal(existsSync(goalVisualizationWidget), true);
const goalVisualizationHtml = read(goalVisualizationWidget);
assert.match(goalVisualizationHtml, /^<!doctype html>/i);
assert.match(goalVisualizationHtml, /ui\/notifications\/tool-result/);
assert.match(goalVisualizationHtml, /goalVisualization/);

assert.equal(lifecycle.schemaVersion, 1);
assert.equal(lifecycle.pluginIdentity, releaseLine.pluginIdentity);
assert.equal(lifecycle.contractMajor, releaseLine.contractMajor);
assert.ok(
  new Set(["CURRENT", "SUPPORTED", "DEPRECATED", "UNPUBLISHED", "RETIRED"])
    .has(lifecycle.lifecycle),
);
const lifecycleDates = [
  "deprecatedAt",
  "endOfSupportAt",
  "unpublishAt",
  "deleteAfter",
];
for (const field of lifecycleDates) {
  assert.ok(
    lifecycle[field] === null ||
      /^\d{4}-\d{2}-\d{2}$/.test(lifecycle[field]),
    `${field} must be null or an ISO calendar date.`,
  );
}
if (lifecycle.lifecycle === "CURRENT") {
  assert.equal(lifecycle.successorIdentity, null);
  for (const field of lifecycleDates) {
    assert.equal(lifecycle[field], null);
  }
} else {
  requireString(lifecycle.successorIdentity, "successorIdentity", 64);
  assert.notEqual(lifecycle.successorIdentity, releaseLine.pluginIdentity);
}
if (
  new Set(["DEPRECATED", "UNPUBLISHED", "RETIRED"]).has(
    lifecycle.lifecycle,
  )
) {
  for (const field of lifecycleDates) {
    assert.notEqual(lifecycle[field], null, `${field} is required.`);
  }
  const orderedDates = lifecycleDates.map((field) => lifecycle[field]);
  assert.deepEqual(
    [...orderedDates].sort(),
    orderedDates,
    "Lifecycle dates must be chronological.",
  );
}

const frontmatterMatch = skill.match(/^---\n([\s\S]*?)\n---(?:\n|$)/);
assert.ok(frontmatterMatch, "SKILL.md must contain a closed YAML frontmatter block.");
const frontmatterEntries = new Map();
for (const line of frontmatterMatch[1].split("\n")) {
  const match = line.match(/^([a-z][a-z0-9_-]*):\s+(.+)$/);
  assert.ok(
    match,
    "Skill frontmatter is intentionally restricted to non-empty plain scalar fields.",
  );
  assert.equal(
    frontmatterEntries.has(match[1]),
    false,
    `Duplicate SKILL.md frontmatter field: ${match[1]}`,
  );
  frontmatterEntries.set(match[1], match[2].trim());
}
assert.deepEqual(
  [...frontmatterEntries.keys()].sort(),
  ["description", "name"],
  "SKILL.md frontmatter must contain exactly name and description.",
);
assert.equal(frontmatterEntries.get("name"), releaseLine.pluginIdentity);
requireString(
  frontmatterEntries.get("description"),
  "SKILL.md description",
  1024,
);
assert.match(skill, /references\/coaching-policy\.md/);
assert.match(
  skill,
  /Fehlt sie, rufe kein SkillPilot-Werkzeug\s+auf\./,
  "The skill must fail closed before any tool call when no prepared session exists.",
);
assert.match(skill, /Zeige, wiederhole, erfrage oder rekonstruiere sie nicht\./);
assert.deepEqual(skillAgent, {
  interface: {
    display_name: "SkillPilot Coach DE v1",
    short_description: "Persönlicher deutscher SkillPilot-Lerncoach",
    default_prompt:
      "Verwende $skillpilot-coach-de-v1 und fahre mit meinem vorbereiteten SkillPilot-Lernschritt fort.",
  },
  dependencies: {
    tools: [
      {
        type: "mcp",
        value: "skillpilot-coach-de-v1",
        description:
          "SkillPilot-Lernzustand, Navigation, Mastery, Verified Recall und Prüfungen",
        transport: "streamable_http",
        url: "https://mcp-v1.skillpilot.com/mcp",
      },
    ],
  },
  policy: {
    allow_implicit_invocation: false,
  },
});
assert.equal(
  skillAgent.dependencies.tools[0].url,
  releaseLine.publicMcpEndpoint,
);

const policyIds = [
  "COACH-STATE-001",
  "COACH-SESSION-001",
  "COACH-INTENT-001",
  "COACH-CONTEXT-001",
  "COACH-SCOPE-001",
  "COACH-FOCUS-001",
  "COACH-MUTATION-001",
  "COACH-QUESTION-001",
  "COACH-GOAL-001",
  "COACH-MASTERY-001",
  "COACH-RECALL-001",
  "COACH-EXAM-001",
  "COACH-RESOURCE-001",
  "COACH-ERROR-001",
  "COACH-PRIVACY-001",
];
for (const policyId of policyIds) {
  assert.ok(
    combinedSkill.includes(policyId),
    `Missing behavioral policy trace: ${policyId}`,
  );
}

const forbiddenLegacyFragments = [
  "startCode",
  "chatSessionToken",
  "redeemStartCode",
  "getVisible",
  "setVisible",
  "selectionReference",
  "choiceNumber",
];
for (const fragment of forbiddenLegacyFragments) {
  assert.equal(
    completeBehavioralSurface.includes(fragment),
    false,
    `Legacy transport leaked into the coach contract: ${fragment}`,
  );
}

assert.equal(
  combinedSkill.includes("https://skillpilot.com"),
  false,
  "The skill must never contain a model-selected or model-built SkillPilot URL.",
);
assert.equal(
  mcpContract.includes("Fehlt ein freigegebener Link, gib keinen Link aus."),
  true,
  "Server and skill link policy must both fail closed.",
);
assert.equal(
  mcpContract.includes("Fehlt ein freigegebener Link, verwende nur https://skillpilot.com."),
  false,
  "Server instructions must not reintroduce a static fallback link.",
);
assert.equal(
  contextProjector.includes("Fehlt ein freigegebener Link, gib keinen Link aus."),
  true,
  "Projected runtime policies must fail closed when no URL is supplied.",
);
assert.equal(
  contextProjector.includes("Fehlt ein freigegebener Link, verwende nur https://skillpilot.com."),
  false,
  "Projected runtime policies must not reintroduce a static fallback link.",
);
assert.match(
  launchService,
  /SkillPilot-Lernsession:[\s\S]+learningSessionId/,
  "The SkillPilot UI launch must still carry the independent learning session.",
);
assert.equal(completeBehavioralSurface.includes("[TODO:"), false);
assert.match(combinedSkill, /expectedStateVersion/);
assert.match(combinedSkill, /clientRequestId/);
assert.match(combinedSkill, /STATE_VERSION_CONFLICT/);
assert.match(combinedSkill, /MCP-App.*Zielvisualisierung/s);
assert.match(combinedSkill, /nicht als\s+Quelle, Beleg, Aufgabe, Lösung oder\s+Leistungsnachweis/s);

const javaConstant = (name) => {
  const match = contractMetadata.match(
    new RegExp(`public static final (?:String|int) ${name} =\\s*(?:\"([^\"]+)\"|(\\d+));`),
  );
  assert.ok(match, `Missing Java V1 contract constant ${name}.`);
  return match[1] ?? Number(match[2]);
};
assert.equal(javaConstant("PLUGIN_IDENTITY"), releaseLine.pluginIdentity);
assert.equal(javaConstant("PLUGIN_VERSION"), manifest.version);
assert.equal(javaConstant("CONTRACT_MAJOR"), releaseLine.contractMajor);
assert.equal(javaConstant("PUBLIC_MCP_ENDPOINT"), releaseLine.publicMcpEndpoint);
assert.equal(javaConstant("OAUTH_RESOURCE"), releaseLine.oauthResource);
assert.equal(javaConstant("PUBLIC_UI_ORIGIN"), releaseLine.publicUiOrigin);
assert.equal(
  javaConstant("GOAL_VISUALIZATION_RESOURCE_URI"),
  releaseLine.ui.resources[0].uri,
);
assert.equal(
  javaConstant("MCP_APP_RESOURCE_MIME_TYPE"),
  releaseLine.ui.resources[0].mimeType,
);
assert.equal(
  javaConstant("INTERNAL_MCP_PATH"),
  "/internal/openai/de/v1/mcp",
);
assert.equal(javaConstant("STATE_SCHEMA_VERSION"), releaseLine.stateSchemaVersion);
assert.equal(javaConstant("WORKFLOW_VERSION"), releaseLine.workflowVersion);
assert.doesNotMatch(contractMetadata, /curricula-(?:tree|sha256)@/);

assert.match(mcpContract, /EXPECTED_STATE_VERSION = "expectedStateVersion"/);
assert.match(mcpContract, /CLIENT_REQUEST_ID = "clientRequestId"/);
assert.match(mcpContract, /withVersionMetadataSchema/);
assert.match(mcpContract, /OpenAiDeV1McpSessionCoordinator/);

const publishedToolNames = new Set(
  [...mcpContract.matchAll(
    /public static final String [A-Z_]+ = "((?:get|set|start|record)_skillpilot_[a-z_]+_de)";/g,
  )].map((match) => match[1]),
);
for (const toolName of new Set(
  [...combinedSkill.matchAll(
    /\b((?:get|set|start|record)_skillpilot_[a-z_]+_de)\b/g,
  )].map((match) => match[1]),
)) {
  assert.equal(
    publishedToolNames.has(toolName),
    true,
    `Skill references an unknown V1 tool: ${toolName}`,
  );
}
assert.equal(/\b(?:skillpilot-coach-de-v2|mcp-v2|ui-v2)\b/.test(combinedSkill), false);

console.log("SkillPilot Coach DE v1 plugin and version contract check passed.");
