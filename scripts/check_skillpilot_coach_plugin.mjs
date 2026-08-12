import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { computeRepositoryCurriculumRevision } from "./compute_curriculum_revision.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = resolve(
  repositoryRoot,
  "ai/openai plugin/skillpilot-coach-v1",
);
const faviconRoot = resolve(repositoryRoot, "app/public/favicon");
const goalVisualizationWidget = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai/skillpilot-goal-visualization-v1.html",
);
const memoryCardPracticeWidget = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai/skillpilot-memory-card-practice-v1.html",
);
const retainedGoalVisualizationRoot = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai/retained/skillpilot/coach/v1",
);
const legacyGoalVisualizationArtifact = resolve(
  retainedGoalVisualizationRoot,
  "legacy-1.0.0/goal-visualization.html",
);
const legacyGoalVisualizationArtifactSha256 =
  "2655afdde360f80392318a868b51d1d3d8f0d27ab32e73255f0f22656b161e82";
const legacyGoalVisualizationResourceUri =
  "ui://skillpilot/coach/v1/1.0.0/goal-visualization.html";
assert.equal(existsSync(legacyGoalVisualizationArtifact), true);
assert.equal(
  createHash("sha256")
    .update(readFileSync(legacyGoalVisualizationArtifact))
    .digest("hex"),
  legacyGoalVisualizationArtifactSha256,
  "The version-addressed legacy goal-visualization artifact must remain byte-for-byte immutable.",
);
assert.equal(existsSync(goalVisualizationWidget), true);
const goalVisualizationArtifactSha256 = createHash("sha256")
  .update(readFileSync(goalVisualizationWidget))
  .digest("hex");
const goalVisualizationResourceUri =
  `ui://skillpilot/coach/v1/sha256-${goalVisualizationArtifactSha256}/goal-visualization.html`;
assert.equal(existsSync(memoryCardPracticeWidget), true);
const memoryCardPracticeArtifactSha256 = createHash("sha256")
  .update(readFileSync(memoryCardPracticeWidget))
  .digest("hex");
const memoryCardPracticeResourceUri =
  `ui://skillpilot/coach/v1/sha256-${memoryCardPracticeArtifactSha256}/memory-card-practice.html`;
const retainedArtifactDirectoryNames = readdirSync(
  retainedGoalVisualizationRoot,
  { withFileTypes: true },
)
  .filter((entry) => entry.isDirectory() && entry.name.startsWith("sha256-"))
  .map((entry) => entry.name)
  .sort();
const retainedGoalVisualizationArtifactSha256s = retainedArtifactDirectoryNames
  .filter((directoryName) => existsSync(resolve(
    retainedGoalVisualizationRoot,
    directoryName,
    "goal-visualization.html",
  )))
  .map((directoryName) => directoryName.slice("sha256-".length));
assert.ok(
  retainedGoalVisualizationArtifactSha256s.length > 0,
  "At least one retained goal-visualization artifact must stay readable.",
);
for (const sha256 of retainedGoalVisualizationArtifactSha256s) {
  const artifact = resolve(
    retainedGoalVisualizationRoot,
    `sha256-${sha256}`,
    "goal-visualization.html",
  );
  assert.equal(existsSync(artifact), true);
  assert.equal(
    createHash("sha256").update(readFileSync(artifact)).digest("hex"),
    sha256,
    "Retained goal-visualization artifacts must remain byte-for-byte immutable.",
  );
}
assert.equal(
  retainedGoalVisualizationArtifactSha256s.includes(goalVisualizationArtifactSha256),
  false,
  "The active goal-visualization artifact must not also be retained.",
);
const skillRoot = resolve(pluginRoot, "skills/skillpilot-coach-v1");

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
const learningCoachDe = read(resolve(
  repositoryRoot,
  "ai/openai custom gpt/knowledge_docs/lerncoach.de.md",
));
const learningCoachEn = read(resolve(
  repositoryRoot,
  "ai/openai custom gpt/knowledge_docs/learning_coach.en.md",
));
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
const releaseScript = read(resolve(repositoryRoot, "scripts/openai_plugin_release.mjs"));
const combinedSkill = `${skill}\n${policy}`;
const compactWhitespace = (value) => value.replace(/\s+/gu, " ").trim();
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
assert.equal(releaseLine.pluginIdentity, "skillpilot-coach-v1");
assert.equal(releaseLine.contractMajor, 1);
assert.equal(releaseLine.stateSchemaVersion, 1);
assert.equal(releaseLine.workflowVersion, "coach@1.0");
assert.match(releaseScript, /"exportOpenAiCoachV1Contract"/u);
assert.equal(
  releaseScript.includes("exportOpenAiDeV1Contract"),
  false,
  "The release exporter must not retain a language-specific compatibility task.",
);
assert.equal(
  /(?:^|[-_])(?:de|en)(?:[-_]|$)/u.test(releaseLine.pluginIdentity),
  false,
  "The shared V1 plugin identity must not encode a communication language.",
);
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
    "dev-6a6fac62910881919c90d06bffbe26c9": {
      id: "asdk_app_6a6fac62910881919c90d06bffbe26c9",
    },
  },
});

const pluginInterface = manifest.interface;
requireString(pluginInterface?.displayName, "interface.displayName", 30);
assert.equal(pluginInterface.displayName, "SkillPilot Coach v1");
assert.equal(pluginInterface.shortDescription, "Your SkillPilot learning coach");
assert.match(pluginInterface.longDescription, /communication locale/u);
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
    /learningSessionId|prepared (?:learning )?session/i.test(prompt),
    false,
    "Directory starters must not imply that a personal learning session is already available.",
  );
  const normalizedPrompt = prompt
    .normalize("NFKC")
    .trim()
    .replace(/\s+/gu, " ")
    .toLocaleLowerCase("en");
  assert.equal(
    normalizedPrompts.has(normalizedPrompt),
    false,
    "Plugin starter prompts must remain unique after Unicode and whitespace normalization.",
  );
  normalizedPrompts.add(normalizedPrompt);
}

assert.deepEqual(mcpConfig, {
  mcpServers: {
    "skillpilot-coach-v1": {
      type: "http",
      url: "https://mcp-coach-v1.skillpilot.com/mcp",
    },
  },
});
assert.equal(
  mcpConfig.mcpServers[releaseLine.pluginIdentity].url,
  releaseLine.publicMcpEndpoint,
);

const endpoint = new URL(releaseLine.publicMcpEndpoint);
const oauthResource = new URL(releaseLine.oauthResource);
assert.equal(endpoint.protocol, "https:");
assert.equal(endpoint.hostname, "mcp-coach-v1.skillpilot.com");
assert.equal(endpoint.pathname, "/mcp");
assert.equal(endpoint.search, "");
assert.equal(endpoint.hash, "");
assert.equal(releaseLine.oauthResource, releaseLine.publicMcpEndpoint);
assert.equal(oauthResource.href, endpoint.href);
assert.equal(
  Object.hasOwn(releaseLine, "publicUiOrigin"),
  false,
  "The V1 release line must use ui.domain rather than the retired publicUiOrigin field",
);
assert.equal(
  Object.hasOwn(releaseLine, "internalCompatibilityEndpoint"),
  false,
  "V1 must not publish or declare a compatibility endpoint",
);
const expectedUiResources = [
  {
    mimeType: "text/html;profile=mcp-app",
    path: "ui/retained/legacy-1.0.0/goal-visualization.html",
    uri: legacyGoalVisualizationResourceUri,
  },
  ...retainedGoalVisualizationArtifactSha256s.map((sha256) => ({
    mimeType: "text/html;profile=mcp-app",
    path: `ui/retained/sha256-${sha256}/goal-visualization.html`,
    uri: `ui://skillpilot/coach/v1/sha256-${sha256}/goal-visualization.html`,
  })),
  {
    mimeType: "text/html;profile=mcp-app",
    path: "ui/memory-card-practice.html",
    uri: memoryCardPracticeResourceUri,
  },
  {
    mimeType: "text/html;profile=mcp-app",
    path: "ui/goal-visualization.html",
    uri: goalVisualizationResourceUri,
  },
].sort((left, right) => left.uri.localeCompare(right.uri));
assert.deepEqual(releaseLine.ui, {
  activeBindings: {
    render_skillpilot_goal_visualization: goalVisualizationResourceUri,
    start_skillpilot_memory_practice: memoryCardPracticeResourceUri,
  },
  domain: "https://mcp-coach-v1.skillpilot.com",
  enabled: true,
  stateSchemaVersion: 1,
  resources: expectedUiResources,
});
const goalVisualizationHtml = read(goalVisualizationWidget);
assert.match(goalVisualizationHtml, /^<!doctype html>/i);
assert.match(goalVisualizationHtml, /ui\/notifications\/tool-result/);
assert.match(goalVisualizationHtml, /goalVisualization/);
const legacyGoalVisualizationHtml = read(legacyGoalVisualizationArtifact);
assert.match(legacyGoalVisualizationHtml, /^<!doctype html>/i);
assert.match(legacyGoalVisualizationHtml, /goalVisualization/);
const memoryCardPracticeHtml = read(memoryCardPracticeWidget);
assert.match(memoryCardPracticeHtml, /^<!doctype html>/i);
assert.match(memoryCardPracticeHtml, /ui\/notifications\/tool-result/);
assert.match(memoryCardPracticeHtml, /skillpilotMemoryCard/);
assert.equal(lifecycle.schemaVersion, 2);
assert.deepEqual(Object.keys(lifecycle).sort(), [
  "contractLine",
  "deleteAfter",
  "deprecatedAt",
  "endOfSupportAt",
  "pluginIdentity",
  "schemaVersion",
  "unpublishAt",
]);
assert.equal(lifecycle.pluginIdentity, releaseLine.pluginIdentity);
const contractLine = lifecycle.contractLine;
assert.equal(typeof contractLine, "object");
assert.notEqual(contractLine, null);
assert.deepEqual(Object.keys(contractLine).sort(), [
  "contractMajor",
  "displayName",
  "newSessionPolicy",
  "policyRevision",
  "publicationStatus",
  "successor",
  "supportLifecycle",
]);
assert.equal(contractLine.contractMajor, releaseLine.contractMajor);
assert.equal(Number.isSafeInteger(contractLine.policyRevision), true);
assert.ok(contractLine.policyRevision > 0);
requireString(contractLine.displayName, "contractLine.displayName", 30);
assert.equal(contractLine.displayName, manifest.interface.displayName);
assert.ok(
  new Set(["CURRENT", "SUPPORTED", "DEPRECATED", "RETIRED"])
    .has(contractLine.supportLifecycle),
);
assert.ok(
  new Set(["DRAFT", "PUBLISHED", "UNPUBLISHED"])
    .has(contractLine.publicationStatus),
);
assert.ok(
  new Set(["ALLOW", "WARN", "BLOCK"]).has(contractLine.newSessionPolicy),
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
if (contractLine.supportLifecycle === "CURRENT") {
  assert.equal(contractLine.successor, null);
  for (const field of lifecycleDates) {
    assert.equal(lifecycle[field], null);
  }
}
if (contractLine.successor !== null) {
  assert.deepEqual(Object.keys(contractLine.successor).sort(), [
    "contractMajor",
    "displayName",
    "handoffUrl",
  ]);
  assert.ok(contractLine.successor.contractMajor > contractLine.contractMajor);
  requireString(contractLine.successor.displayName, "successor.displayName", 30);
  assert.match(contractLine.successor.handoffUrl, /^https:\/\/skillpilot\.com\//);
}
if (contractLine.newSessionPolicy === "WARN") {
  assert.notEqual(contractLine.successor, null, "WARN requires a published successor.");
}
if (contractLine.supportLifecycle === "RETIRED") {
  assert.equal(contractLine.publicationStatus, "UNPUBLISHED");
  assert.equal(contractLine.newSessionPolicy, "BLOCK");
}
if (new Set(["DEPRECATED", "RETIRED"]).has(contractLine.supportLifecycle)) {
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
  /If none is present, do not call a SkillPilot tool[\s\S]+Output exactly[\s\S]+https:\/\/skillpilot\.com\/[\s\S]+new chat[\s\S]+Never translate or extend the sentence\./,
  "The skill must fail closed and explain the WebGUI start when no prepared session exists.",
);
assert.match(
  combinedSkill,
  /Begin (?:each|every) learner turn with a successful `get_skillpilot_context` call[\s\S]+successful mutation[\s\S]+full successor context[\s\S]+(?:do not|not) reload/i,
  "The contract must require a turn-start preflight and use a fresh mutation successor without a redundant reload.",
);
assert.match(
  combinedSkill,
  /curriculum[\s\S]+stage[\s\S]+subjects[\s\S]+profiles[\s\S]+personalization[\s\S]+WebGUI/i,
  "The skill must keep Level-2 configuration in the first-party WebGUI.",
);
assert.match(
  combinedSkill,
  /SESSION_REQUIRED[\s\S]+SESSION_RENEWAL_REQUIRED[\s\S]+SESSION_VERSION_UNAVAILABLE[\s\S]+startUrl[\s\S]+new chat/i,
  "Session failures must return the learner to the WebGUI and a newly prepared chat.",
);
assert.match(
  policy,
  /SkillPilot-ID creation or recovery[\s\S]+belong exclusively to the[\s\S]+first-party\s+WebGUI/i,
  "Permanent-ID handling must remain exclusively first-party.",
);
const fixedNoSessionGerman =
  "Öffne SkillPilot unter https://skillpilot.com/, schließe dort die Lernkonfiguration ab, wähle „Lernen starten“ und verwende die vorbereitete Startnachricht in einem neuen Chat.";
const fixedNoSessionEnglish =
  "Open https://skillpilot.com/, finish the learning setup there, choose “Start learning”, and use the prepared start message in a new chat.";
for (const instruction of [fixedNoSessionGerman, fixedNoSessionEnglish]) {
  assert.equal(
    compactWhitespace(skill).includes(instruction),
    true,
    "SKILL.md must contain each exact fixed no-session WebGUI handoff sentence.",
  );
  assert.equal(
    compactWhitespace(mcpContract).includes(instruction),
    true,
    "Server instructions must contain the same exact no-session WebGUI handoff sentence.",
  );
}
assert.match(
  policy,
  /exactly the matching fixed German or English[\s\S]+sentence from `SKILL\.md`[\s\S]+without translating or extending it/u,
  "The policy must delegate the no-session response to the exact fixed Skill sentence.",
);
assert.match(
  skill,
  /Never display, repeat, derive, reconstruct, or ask the learner to\s+re-enter it\./,
);
assert.deepEqual(skillAgent, {
  interface: {
    display_name: "SkillPilot Coach v1",
    short_description: "Web-started SkillPilot learning coach",
    default_prompt:
      "Use $skillpilot-coach-v1 to continue the learning session prepared by SkillPilot.",
  },
  dependencies: {
    tools: [
      {
        type: "mcp",
        value: "skillpilot-coach-v1",
        description:
          "Session validation, learning state, focus, active goals, mastery, verified recall, and assessments",
        transport: "streamable_http",
        url: "https://mcp-coach-v1.skillpilot.com/mcp",
      },
    ],
  },
  policy: {
    allow_implicit_invocation: false,
  },
});
const toolCatalogStart = mcpContract.indexOf(
  "private List<McpStatelessServerFeatures.SyncToolSpecification> buildToolSpecifications()",
);
const toolCatalogEnd = mcpContract.indexOf(
  "\n    private McpStatelessServerFeatures.SyncToolSpecification",
  toolCatalogStart + 1,
);
assert.ok(
  toolCatalogStart >= 0 && toolCatalogEnd > toolCatalogStart,
  "Could not isolate the V1 tool catalog.",
);
const modelToolCatalog = mcpContract.slice(toolCatalogStart, toolCatalogEnd);
for (const retiredTool of [
  "open_skillpilot_start",
  "issue_skillpilot_start_capability",
  "set_skillpilot_curriculum",
  "set_skillpilot_personalization",
]) {
  assert.equal(
    combinedSkill.includes(retiredTool) || modelToolCatalog.includes(retiredTool),
    false,
    `The Web-first V1 contract must not expose retired tool ${retiredTool}.`,
  );
}
for (const retiredSymbol of [
  "OPEN_SKILLPILOT_START",
  "ISSUE_SKILLPILOT_START_CAPABILITY",
  "SET_CURRICULUM",
  "SET_PERSONALIZATION",
]) {
  assert.equal(
    mcpContract.includes(retiredSymbol),
    false,
    `The Web-first V1 adapter must not retain dead symbol ${retiredSymbol}.`,
  );
}
assert.equal(
  skillAgent.dependencies.tools[0].url,
  releaseLine.publicMcpEndpoint,
);
assert.equal(
  /(?:skillpilot|mcp)-coach-(?:de|en)-v1/u.test(
    `${manifestSource}\n${openAiYaml}\n${JSON.stringify(mcpConfig)}\n${JSON.stringify(releaseLine)}`,
  ),
  false,
  "The shared plugin package must not retain a language-specific identity or endpoint.",
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
  "COACH-TITLE-001",
  "COACH-ORIENTATION-001",
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

const assertBehaviorFragments = (source, patterns, label) => {
  for (const pattern of patterns) {
    assert.match(source, pattern, `Missing ${label} behavior: ${pattern}`);
  }
};

assertBehaviorFragments(
  combinedSkill,
  [
    /(?:Normal card practice and strict Verified Recall are different\s+learning modes|normal component-based card practice separate from strict\s+Verified Recall)/iu,
    /start_skillpilot_memory_practice/u,
    /review_skillpilot_memory_practice_card/u,
    /dedicated component alone may reveal answers/u,
    /receipt is not full context/u,
    /Cockpit URL\s+only after an actual practice-tool error/u,
  ],
  "memory-card practice UI boundary",
);

assertBehaviorFragments(
  combinedSkill,
  [
    /nextAllowedTools/u,
    /Use navigation only after an explicit request/u,
    /Suitable backend-published\s+learner-facing ancestors come first[\s\S]+nearest broader focus\s+first/u,
    /completed scope and `requiredAction=setScope`[\s\S]+offer[\s\S]+first option/u,
    /Set it only after the\s+learner accepts/u,
    /never infer an\s+ancestor or construct its ID/u,
    /Mutate focus\s+only by copying one exact option's complete `goalIds` from the newest result/u,
    /payload may retain independent focus roots while one branch widens/u,
    /active goal[\s\S]+redirect=true/u,
    /Without it, retain the active goal/u,
    /mutation invalidates every option from older results and turns/iu,
  ],
  "fail-closed autopilot continuation and explicit goal redirect",
);

assertBehaviorFragments(
  combinedSkill,
  [
    /`requires` is one-way/u,
    /mastery of B never implies\s+mastery of A/u,
    /Every\s+unmastered personalized target remains a normal frontier candidate/u,
    /own effective prerequisites are satisfied/u,
  ],
  "directed prerequisite and frontier preservation",
);

assertBehaviorFragments(
  mcpContract,
  [
    /Backend-published suitable learner-facing ancestors come first, nearest broader focus first/u,
    /completion\.scopeComplete=true and requiredAction=setScope[\s\S]+offer the first option/u,
    /do not mutate until the learner accepts/u,
    /For an unqualified request or acceptance to broaden the focus, copy exactly the first published option's goalIds unchanged/u,
    /mastery of a dependent goal never implies mastery of, or suppresses, an unmastered prerequisite/u,
    /Every unmastered target in the Personal Curriculum remains subject to the normal frontier test/u,
  ],
  "server-owned focus widening and directed prerequisites",
);

const didacticParityRules = [
  {
    id: "COACH-TITLE-001",
    de: [
      /aktuelle Lernziel mit seinem \*\*Titel\*\*, nicht mit seiner\s+Beschreibung/u,
      /Dein aktuelles Lernziel ist: <Titel>/u,
    ],
    en: [
      /current learning goal with its \*\*title\*\*, not its description/u,
      /Your current learning goal is: <title>/u,
    ],
    target: [
      /exact localized\s+`activeGoal\.title`/u,
      /description[\s\S]+must never replace/u,
      /Dein aktuelles\s+Lernziel ist: <Titel>/u,
      /Your current learning goal is: <title>/u,
    ],
  },
  {
    id: "active orientation follow-up and completion gate",
    de: [
      /Eine bloße Auswahl[\s\S]+beginnt[\s\S]+noch kein Abschluss/u,
      /Greife genau dieses Interesse auf[\s\S]+aktive Anschlussfrage/u,
      /Beende die Orientierung erst[\s\S]+auf diese\s+Vertiefung reagiert/u,
    ],
    en: [
      /Merely selecting a possibility[\s\S]+starts[\s\S]+not completion/u,
      /Take up that exact interest[\s\S]+active follow-up/u,
      /Complete orientation only after[\s\S]+responds to that follow-up/u,
    ],
    target: [
      /merely names or selects[\s\S]+starts the\s+orientation dialogue/u,
      /not completion evidence/u,
      /Take up the interest actively/u,
      /learner\s+responds to that tailored follow-up[\s\S]+explicitly asks to continue/u,
      /content-free acknowledgement alone is insufficient/u,
      /generic acknowledgement[\s\S]+next-goal\s+options[\s\S]+forbidden/u,
    ],
  },
  {
    id: "explicit prior-knowledge connection",
    de: [/Knüpfe explizit an vorhandenes Vorwissen an/u],
    en: [/Explicitly link to existing prior knowledge/u],
    target: [/connect the\s+next hint, explanation, or substep explicitly to that prior understanding/u],
  },
  {
    id: "dialogic scaffolding instead of complete solutions",
    de: [
      /Keine fertigen Lösungen/u,
      /Hinweis geben, nicht die Antwort/u,
    ],
    en: [
      /No complete solutions/u,
      /Give a hint, not the answer/u,
    ],
    target: [
      /Do not reveal the\s+answer to the immediately following task/u,
      /Offer a hint or smaller substep when needed, not the\s+full answer/u,
    ],
  },
  {
    id: "different follow-up exercise after a mini-example",
    de: [/anschliessende Uebung[\s\S]+nicht[\s\S]+derselbe Fall/u],
    en: [/following exercise must \*\*not\*\* be the same case/u],
    target: [/next exercise must use a genuinely different case or wording/u],
  },
  {
    id: "unusual but valid solution paths",
    de: [
      /Ungewöhnliche Lösungswege/u,
      /Korrigiere nur den tatsächlich falschen Schritt/u,
      /Würdige gültige kreative Vereinfachungen ausdrücklich/u,
    ],
    en: [
      /Unusual solution paths/u,
      /Correct only the actually wrong step/u,
      /Explicitly acknowledge valid creative simplifications/u,
    ],
    target: [
      /Reconstruct unusual approaches charitably and precisely/u,
      /Credit valid\s+creative approaches/u,
      /Correct only steps that are actually wrong, ambiguous,\s+or unsupported/u,
    ],
  },
  {
    id: "all explicitly named goal aspects",
    de: [/alle klar benannten Aspekte[\s\S]+geprueft/u],
    en: [/all clearly named aspects[\s\S]+checked/u],
    target: [/tasks and feedback must cover\s+all aspects/u],
  },
  {
    id: "strict mastery evidence",
    de: [
      /zwei unabhängigen Checks/u,
      /einem mehrstufigen Transfer-Task/u,
    ],
    en: [
      /Two independent checks/u,
      /A multi-step transfer task/u,
    ],
    target: [
      /two independent checks/u,
      /genuine multi-step transfer in a changed context/u,
    ],
  },
  {
    id: "visible and GeoGebra-supported learning",
    de: [
      /modality:visual/u,
      /GeoGebra Graphing Calculator/u,
      /beobachten, eintragen, verändern und ablesen/u,
    ],
    en: [
      /modality:visual/u,
      /GeoGebra Graphing Calculator/u,
      /observe, enter, change, and read/u,
    ],
    target: [
      /marked for visual, graph, or GeoGebra work/u,
      /observe, enter, change, and read/u,
      /Do not replace required\s+interaction with textual guessing/u,
    ],
  },
  {
    id: "bounded and direct goal selection",
    de: [
      /kurze Auswahl[\s\S]+max\. 3/u,
      /genau ein[\s\S]+atomareres Ziel verfügbar[\s\S]+direkt/u,
    ],
    en: [
      /short selection[\s\S]+max\. 3/u,
      /exactly one[\s\S]+atomic goal is available[\s\S]+directly/u,
    ],
    target: [
      /exactly one atomic goal is currently selectable[\s\S]+activate it directly/u,
      /present at most three currently supplied atomic options/u,
    ],
  },
  {
    id: "specialized app training boundary",
    de: [/Kein Unterricht, wenn ein spezialisiertes App-Training vorgesehen ist/u],
    en: [/No teaching if specialized app training is provided/u],
    target: [
      /requires specialized app or cockpit training/u,
      /do not teach the same activity in chat/u,
      /Wait for the learner to return or for fresh state/u,
    ],
  },
  {
    id: "learner role and compact dialogic steps",
    de: [
      /strukturierter, geduldiger Lerncoach/u,
      /kleine Schritte mit häufigem Feedback/u,
      /Kurz & dialogisch – keine Monologe/u,
    ],
    en: [
      /structured, patient learning coach/u,
      /small steps with frequent feedback/u,
      /Short & dialogic – no monologues/u,
    ],
    target: [
      /Always treat the person as a learner/u,
      /Work patiently, concisely, clearly, and dialogically/u,
      /Use small steps and frequent feedback instead of long explanatory blocks/u,
    ],
  },
  {
    id: "Feynman teach-back loop",
    de: [
      /Feynman-Loop/u,
      /in eigenen Worten/u,
      /Vage Stellen = Lücken markieren/u,
      /Transfer: neues Beispiel\/Anwendung/u,
    ],
    en: [
      /Feynman Loop/u,
      /in their own words/u,
      /Vague areas = mark gaps/u,
      /Transfer: new example\/application/u,
    ],
    target: [
      /Use the Feynman loop especially for answers that appear memorized/u,
      /principle without jargon in the learner's own words/u,
      /Identify one vague point/u,
      /Clarify only that gap/u,
      /application in a changed case/u,
    ],
  },
  {
    id: "understanding gap versus carelessness",
    de: [
      /Verstaendnislücke[\s\S]+Schludrigkeit/u,
      /Verstaendnislücke → kurz klaeren[\s\S]+Schludrigkeit → deutlich ansprechen/u,
    ],
    en: [
      /Knowledge gap[\s\S]+carelessness/u,
      /Knowledge gap → clarify briefly[\s\S]+Carelessness → address clearly/u,
    ],
    target: [
      /Distinguish gaps in understanding\s+from slips/u,
      /Give feedback:[\s\S]+examine the cause/u,
    ],
  },
  {
    id: "continue after insufficient mastery",
    de: [
      /Wenn Kompetenz \*\*nicht\*\* erreicht ist/u,
      /Fachlich weiterarbeiten/u,
      /Kurze Zusatzfrage oder gezielte Übung stellen/u,
    ],
    en: [
      /If competence is \*\*not\*\* achieved/u,
      /Continue working subject-specifically/u,
      /Ask a short additional question or set a targeted exercise/u,
    ],
    target: [
      /If competence (?:is not achieved|has not yet been demonstrated)[\s\S]+continue (?:working|subject-matter work)/u,
      /short additional question[\s\S]+(?:targeted|suitable)[\s\S]+exercise/u,
    ],
  },
  {
    id: "post-mastery progression and completion exceptions",
    de: [
      /Didaktisch \*\*sofort sinnvoll weitergehen\*\*/u,
      /gesamte personalisierte Curriculum[\s\S]+nur gratulieren\/feiern[\s\S]+keine neuen Vorschläge/u,
      /aktuelle Fokus[\s\S]+Fokuswechsel vorschlagen/u,
    ],
    en: [
      /Didactically \*\*move on sensibly immediately\*\*/u,
      /entire personalized curriculum[\s\S]+only congratulate\/celebrate[\s\S]+no new suggestions/u,
      /current focus[\s\S]+suggest focus change/u,
    ],
    target: [
      /After successfully saved mastery, proceed promptly to the supplied next step/u,
      /completed focus[\s\S]+first supplied broader option[\s\S]+wait for acceptance/u,
      /entire personal curriculum[\s\S]+without\s+inventing new goals or extensions/u,
    ],
  },
  {
    id: "learner steering and missing foundations",
    de: [
      /Wenn die lernende Person ein Ziel nennt/u,
      /Prüfe fachlich, ob das sinnvoll anschließt/u,
      /welches Fundament fehlt – ohne Systemargumente/u,
    ],
    en: [
      /If the learner names a goal/u,
      /Check subject-specifically if this is a sensible logical follow-up/u,
      /which foundation is missing – without system arguments/u,
    ],
    target: [
      /If the learner wants another topic, choose only from current options/u,
      /Explain\s+missing foundations briefly in subject terms, not as a system limitation/u,
    ],
  },
  {
    id: "optional video backup",
    de: [
      /Optionales Video-Backup/u,
      /ein\*\* YouTube‑Video[\s\S]+als Ergänzung/u,
      /kein Link\*\* \(nur Titel \+ Kanal\)/u,
    ],
    en: [
      /Optional video backup/u,
      /one\*\* YouTube video[\s\S]+as a supplement/u,
      /no link\*\* \(only title \+ channel\)/u,
    ],
    target: [
      /Offer an external video at most as an optional supplement/u,
      /learner is\s+clearly stuck/u,
      /Mention only title and channel,\s+never a self-sourced link/u,
    ],
  },
  {
    id: "no technical didactic commentary",
    de: [
      /Reihenfolge, Setup-Schritte und Speicherung werden \*\*nicht didaktisch kommentiert\*\*/u,
      /Fokus \*\*ausschließlich auf Lernen\*\*/u,
    ],
    en: [
      /Sequence, setup steps, and saving are \*\*not commented on didactically\*\*/u,
      /focus is \*\*exclusively on learning\*\*/u,
    ],
    target: [
      /Do not comment didactically on setup, workflow ordering, or persistence/u,
      /teaching is permitted[\s\S]+focus exclusively on learning/u,
    ],
  },
];

for (const rule of didacticParityRules) {
  assertBehaviorFragments(learningCoachDe, rule.de, `${rule.id} in lerncoach.de.md`);
  assertBehaviorFragments(learningCoachEn, rule.en, `${rule.id} in learning_coach.en.md`);
}

// The shared policy deliberately states the same durable coaching invariants
// more compactly than the provider-specific reference documents. Keep this
// semantic guard focused on behavior instead of requiring their verbose prose.
assertBehaviorFragments(
  policy,
  [
    /sentence containing its exact `activeGoal\.title`[\s\S]+never substitute the\s+description/u,
    /A bare path choice starts the dialogue; it is not completion/u,
    /Complete orientation only after meaningful engagement[\s\S]+explicit request to continue/u,
    /content-free acknowledgement is\s+insufficient/u,
    /Connect the next hint or explanation explicitly to the learner's answer/u,
    /Offer a hint or smaller substep when needed, not the full answer/u,
    /worked mini-example[\s\S]+genuinely different next task/u,
    /Reconstruct unusual approaches charitably[\s\S]+Credit valid alternatives/u,
    /Cover every explicitly named aspect/u,
    /two independent checks[\s\S]+genuine multi-step transfer in a changed context/u,
    /visual, graph, or GeoGebra goals[\s\S]+observe, enter, change, and read representations/u,
    /exactly one goal is\s+selectable[\s\S]+at\s+most three current options/u,
    /requires a specialized app or cockpit activity[\s\S]+do not teach the same activity in parallel/u,
    /Treat the person as a learner/u,
    /Work patiently, concisely, clearly, and dialogically[\s\S]+small steps and\s+frequent feedback/u,
    /Feynman-style loop[\s\S]+learner's own words[\s\S]+explain only that gap[\s\S]+changed application/u,
    /distinguish a conceptual gap\s+from a careless error/u,
    /competence is not yet demonstrated[\s\S]+continue working on the\s+same goal/u,
    /returned handoff[\s\S]+before any successor/u,
    /Acknowledge completed focus or curriculum[\s\S]+Never invent extensions/u,
    /Use navigation only after an explicit request to change focus or goal/u,
    /missing prerequisite or\s+foundation/u,
    /Hide system mechanics[\s\S]+Never mention tools, APIs, schemas, storage, internal\s+IDs/u,
  ],
  "compact shared coaching policy",
);

const orientationSection = policy.match(
  /## 4\. Motivation and orientation\n([\s\S]*?)\n## 5\./u,
);
assert.ok(
  orientationSection,
  "The coaching policy must contain a dedicated motivation and orientation mode.",
);
assert.match(orientationSection[1], /present every\s+supplied path/u);
assert.match(orientationSection[1], /practical contexts/u);
assert.match(
  orientationSection[1],
  /meaningful engagement with that follow-up[\s\S]+or an explicit request to continue/u,
  "Orientation completion must wait for active follow-up engagement or an explicit direct-continuation request.",
);
assert.match(
  orientationSection[1],
  /content-free acknowledgement is\s+insufficient/u,
  "Orientation completion must not treat a content-free acknowledgement as active engagement.",
);
assert.match(
  orientationSection[1],
  /Do not test prior knowledge, terminology, calculations, details/u,
  "Orientation must never become a subject-detail or prior-knowledge check.",
);
assert.match(
  orientationSection[1],
  /Never call\s+this subject-matter mastery/u,
  "Orientation completion must not be presented as subject mastery.",
);
assert.match(
  skill,
  /orientation, dialogic learning,\s*memory practice, verified recall, or assessment/u,
  "The skill workflow must route motivation through its dedicated mode.",
);

assert.match(
  combinedSkill,
  /communicationLocale[\s\S]+authoritative/u,
  "The language-neutral skill must make the session communication locale authoritative.",
);
assert.match(
  combinedSkill,
  /Never infer it from this English policy[\s\S]+tool\s+names/u,
  "English control-plane language must never override the session communication locale.",
);

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

const embeddedSkillpilotUrls =
  (combinedSkill.match(/https:\/\/skillpilot\.com\/[^\s`)\]]*/gu) ?? [])
    .map((url) => url.replace(/[.,;:!?“”'"]+$/gu, ""));
assert.ok(
  embeddedSkillpilotUrls.length > 0,
  "The skill must publish the fixed first-party no-session start URL.",
);
assert.equal(
  embeddedSkillpilotUrls.every((url) => url === "https://skillpilot.com/"),
  true,
  "The skill may contain only the exact fixed SkillPilot WebGUI start URL.",
);
assert.equal(
  mcpContract.includes("If no approved link is available, do not output a link."),
  true,
  "Server and skill link policy must both fail closed.",
);
assert.equal(
  mcpContract.includes("If no approved link is available, use only https://skillpilot.com."),
  false,
  "Server instructions must not reintroduce a static fallback link.",
);
assert.equal(
  contextProjector.includes("Fehlt ein freigegebener Link, gib keinen Link aus.") &&
    contextProjector.includes("If no approved link is available, do not output a link."),
  true,
  "Localized projected runtime policies must fail closed when no URL is supplied.",
);
assert.equal(
  contextProjector.includes("Fehlt ein freigegebener Link, verwende nur https://skillpilot.com.") ||
    contextProjector.includes("If no approved link is available, use only https://skillpilot.com."),
  false,
  "Projected runtime policies must not reintroduce a static fallback link.",
);
assert.match(
  launchService,
  /learningSessionId/,
  "The SkillPilot UI launch must still carry the independent learning session.",
);
assert.equal(completeBehavioralSurface.includes("[TODO:"), false);
assert.match(combinedSkill, /expectedStateVersion/);
assert.match(combinedSkill, /clientRequestId/);
assert.match(combinedSkill, /STATE_VERSION_CONFLICT/);
assert.match(
  combinedSkill,
  /goalVisualization[\s\S]+render_skillpilot_goal_visualization/s,
);
assert.match(
  combinedSkill,
  /never as a source, task,\s+solution, assessment, or performance record/s,
);
assert.match(
  combinedSkill,
  /contains[\s\S]+`goalVisualization`[\s\S]+permits[\s\S]+`render_skillpilot_goal_visualization`[\s\S]+form[\s\S]+pair[\s\S]+context's `goalVisualization\.goalId`[\s\S]+result's top-level `stateVersion`[\s\S]+every previously unseen pair[\s\S]+different pair was\s+rendered earlier in this conversation[\s\S]+once as the immediate next tool[\s\S]+pair to `goalId` and[\s\S]+`expectedStateVersion`[\s\S]+repeated pair creates no automatic call[\s\S]+explicit learner request to show the current image again[\s\S]+fresh qualifying result[\s\S]+never retry otherwise/s,
  "The coach skill must retain the compact, result-bound goal-visualization rule.",
);
assert.match(
  combinedSkill,
  /renderer\s+receipt never\s+replaces full context[\s\S]+missing[\s\S]+image never blocks[\s\S]+text response/is,
  "The coach skill must keep host image presentation optional and preserve complete coaching text.",
);
assert.match(
  combinedSkill,
  /Goal-renderer and memory-practice results[\s\S]+narrow UI receipts[\s\S]+neither replaces a successful full context/is,
  "UI-only receipts must not replace the authoritative full coaching context.",
);
assert.match(
  mcpContract,
  /goalVisualization[\s\S]+nextAllowedTools permits render_skillpilot_goal_visualization[\s\S]+form a pair from that context's goalVisualization\.goalId and the authorizing result's top-level stateVersion[\s\S]+every previously unseen pair[\s\S]+different pair was rendered earlier in this conversation[\s\S]+once as the immediate next tool[\s\S]+pair to goalId and expectedStateVersion[\s\S]+repeated pair creates no automatic call[\s\S]+explicit learner request to show the current image again[\s\S]+fresh qualifying result[\s\S]+never retry otherwise/s,
  "The MCP server instructions must retain the result-bound renderer rule.",
);
assert.match(
  mcpContract,
  /only a UI receipt[\s\S]+never replaces that full context/s,
  "The MCP server must keep the last full context authoritative after rendering.",
);
assert.equal(
  `${combinedSkill}\n${mcpContract}\n${contextProjector}`.includes("presentationAction"),
  false,
  "The retired presentationAction experiment must not remain in the V1 surface.",
);
assert.match(
  mcpContract,
  /RENDER_GOAL_VISUALIZATION[\s\S]+EXPECTED_STATE_VERSION, integerSchema\(0, null\)[\s\S]+List\.of\("goalId", EXPECTED_STATE_VERSION\)/s,
  "The renderer must require the state version from the result that authorized it.",
);

const javaConstant = (name) => {
  const declaration = contractMetadata.match(
    new RegExp(`public static final (?:String|int|long) ${name} =\\s*`),
  );
  assert.ok(declaration, `Missing Java V1 contract constant ${name}.`);
  const expressionStart = declaration.index + declaration[0].length;
  let expressionEnd = expressionStart;
  let quoted = false;
  let escaped = false;
  for (; expressionEnd < contractMetadata.length; expressionEnd += 1) {
    const character = contractMetadata[expressionEnd];
    if (escaped) {
      escaped = false;
      continue;
    }
    if (quoted && character === "\\") {
      escaped = true;
      continue;
    }
    if (character === '"') {
      quoted = !quoted;
      continue;
    }
    if (!quoted && character === ";") {
      break;
    }
  }
  assert.ok(
    expressionEnd < contractMetadata.length,
    `Unterminated Java V1 contract constant ${name}.`,
  );
  const expression = contractMetadata
    .slice(expressionStart, expressionEnd)
    .trim();
  if (/^\d+L?$/.test(expression)) {
    return Number(expression.replace(/L$/u, ""));
  }
  return expression
    .split(/\s*\+\s*/u)
    .map((part) => {
      if (/^"(?:[^"\\]|\\.)*"$/u.test(part)) {
        return JSON.parse(part);
      }
      assert.match(
        part,
        /^[A-Z][A-Z0-9_]*$/u,
        `Unsupported Java V1 constant expression for ${name}: ${expression}`,
      );
      return javaConstant(part);
    })
    .join("");
};
assert.equal(javaConstant("PLUGIN_IDENTITY"), releaseLine.pluginIdentity);
assert.equal(javaConstant("PLUGIN_VERSION"), manifest.version);
assert.equal(javaConstant("CONTRACT_MAJOR"), releaseLine.contractMajor);
assert.equal(javaConstant("POLICY_REVISION"), contractLine.policyRevision);
assert.equal(javaConstant("SUPPORT_LIFECYCLE"), contractLine.supportLifecycle);
assert.equal(javaConstant("PUBLICATION_STATUS"), contractLine.publicationStatus);
assert.equal(javaConstant("NEW_SESSION_POLICY"), contractLine.newSessionPolicy);
assert.equal(contractLine.successor, null);
assert.equal(javaConstant("PUBLIC_MCP_ENDPOINT"), releaseLine.publicMcpEndpoint);
assert.equal(javaConstant("OAUTH_RESOURCE"), releaseLine.oauthResource);
assert.equal(javaConstant("WIDGET_DOMAIN"), releaseLine.ui.domain);
assert.equal(
  javaConstant("PROTECTED_RESOURCE_METADATA_ENDPOINT"),
  "https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
);
assert.doesNotMatch(contractMetadata, /PUBLIC_UI_ORIGIN/);
assert.equal(
  javaConstant("GOAL_VISUALIZATION_RESOURCE_URI"),
  releaseLine.ui.activeBindings.render_skillpilot_goal_visualization,
);
assert.equal(
  javaConstant("LEGACY_GOAL_VISUALIZATION_RESOURCE_URI"),
  legacyGoalVisualizationResourceUri,
);
assert.equal(
  javaConstant("LEGACY_GOAL_VISUALIZATION_ARTIFACT_SHA256"),
  legacyGoalVisualizationArtifactSha256,
);
assert.equal(
  javaConstant("MEMORY_CARD_PRACTICE_RESOURCE_URI"),
  releaseLine.ui.activeBindings.start_skillpilot_memory_practice,
);
const javaStringList = (name) => {
  const pattern = new RegExp(`\\b${name}\\s*=\\s*List\\.of\\(([\\s\\S]*?)\\);`, "u");
  const match = pattern.exec(contractMetadata);
  assert.notEqual(match, null, `Missing Java list ${name}`);
  return [...match[1].matchAll(/"((?:[^"\\]|\\.)*)"/gu)]
    .map((entry) => JSON.parse(`"${entry[1]}"`));
};
assert.deepEqual(
  javaStringList("RETAINED_GOAL_VISUALIZATION_ARTIFACT_SHA256S").slice().sort(),
  retainedGoalVisualizationArtifactSha256s,
  "Every retained artifact must be declared, and every declared hash must exist.",
);
assert.equal(
  javaConstant("GOAL_VISUALIZATION_ARTIFACT_SHA256"),
  goalVisualizationArtifactSha256,
  "The Java V1 UI hash must match the exact embedded widget artifact.",
);
assert.equal(
  javaConstant("MEMORY_CARD_PRACTICE_ARTIFACT_SHA256"),
  memoryCardPracticeArtifactSha256,
  "The Java V1 memory-card UI hash must match the exact embedded widget artifact.",
);
assert.equal(
  javaConstant("MCP_APP_RESOURCE_MIME_TYPE"),
  releaseLine.ui.resources.find(
    (resource) =>
      resource.uri ===
      releaseLine.ui.activeBindings.render_skillpilot_goal_visualization,
  )?.mimeType,
);
assert.equal(javaConstant("INTERNAL_MCP_PATH"), "/internal/openai/v1/mcp");
assert.equal(javaConstant("STATE_SCHEMA_VERSION"), releaseLine.stateSchemaVersion);
assert.equal(javaConstant("WORKFLOW_VERSION"), releaseLine.workflowVersion);
assert.doesNotMatch(contractMetadata, /curricula-(?:tree|sha256)@/);
assert.match(
  mcpContract,
  /"domain",\s*OpenAiDeV1ContractMetadata\.WIDGET_DOMAIN/,
  "MCP UI resources must publish the standard plugin-unique widget domain",
);
assert.match(
  mcpContract,
  /"openai\/widgetDomain",\s*OpenAiDeV1ContractMetadata\.WIDGET_DOMAIN/,
  "MCP UI resources must publish the ChatGPT widget-domain alias",
);
assert.match(
  mcpContract,
  /"resourceDomains",\s*List\.of\("https:\/\/skillpilot\.com"\)/,
  "MCP UI CSP must keep the SkillPilot asset origin allowlisted",
);
assert.match(
  mcpContract,
  /UI_TOOL_RESOURCE_BINDINGS\s*=\s*Map\.of\([\s\S]*RENDER_GOAL_VISUALIZATION,[\s\S]*GOAL_VISUALIZATION_RESOURCE_URI,[\s\S]*START_MEMORY_PRACTICE,[\s\S]*MEMORY_CARD_PRACTICE_RESOURCE_URI\)/,
  "Each UI tool must map to its own active MCP App resource",
);
assert.match(
  mcpContract,
  /REVIEW_MEMORY_PRACTICE_CARD\.equals\(name\)[\s\S]*"visibility",\s*List\.of\("app"\)/,
  "The memory-practice review tool must be app-only and unbound",
);
assert.doesNotMatch(
  mcpContract,
  /McpSchema\.ImageContent\.builder|Base64\.getEncoder/,
  "Goal images must use the registered MCP App UI resource, never bare ImageContent as presentation",
);

assert.match(mcpContract, /EXPECTED_STATE_VERSION = "expectedStateVersion"/);
assert.match(mcpContract, /CLIENT_REQUEST_ID = "clientRequestId"/);
assert.match(mcpContract, /withVersionMetadataSchema/);
assert.match(mcpContract, /OpenAiDeV1McpSessionCoordinator/);
for (const staleGermanProtocolDescription of [
  "Aus der aktuellen SkillPilot-Startnachricht",
  "Für jeden neuen fachlichen Schreibversuch",
  "stateVersion aus dem jüngsten erfolgreichen SkillPilot-Ergebnis",
]) {
  assert.equal(
    mcpContract.includes(staleGermanProtocolDescription),
    false,
    `Static V1 schema metadata must be English: ${staleGermanProtocolDescription}`,
  );
}

const publishedToolNames = new Set(
  [...mcpContract.matchAll(
    /public static final String [A-Z_]+\s*=\s*"((?:get|set|start|record|render)_skillpilot_[a-z_]+)";/g,
  )].map((match) => match[1]),
);
for (const toolName of new Set(
  [...combinedSkill.matchAll(
    /\b((?:get|set|start|record|render)_skillpilot_[a-z_]+)\b/g,
  )].map((match) => match[1]),
)) {
  assert.equal(
    publishedToolNames.has(toolName),
    true,
    `Skill references an unknown V1 tool: ${toolName}`,
  );
}
assert.equal(/\b(?:skillpilot-coach-v2|mcp-v2|ui-v2)\b/.test(combinedSkill), false);

console.log("SkillPilot Coach v1 plugin and version contract check passed.");
