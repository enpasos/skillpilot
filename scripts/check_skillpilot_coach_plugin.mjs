import assert from "node:assert/strict";
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
const openAiResourceRoot = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai",
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
const openAiYaml = read(resolve(skillRoot, "agents/openai.yaml"));
// JSON is a strict YAML 1.2 subset. Keeping this small metadata file in that
// subset lets CI parse and validate it without a second package-manager tree.
const skillAgent = JSON.parse(openAiYaml);
const mcpContract = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeV1McpContractAdapter.java",
));
const goalVisualizationImageResolver = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/v1/OpenAiDeGoalVisualizationImageResolver.java",
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
  "The V1 release line must not retain the retired publicUiOrigin field",
);
assert.equal(
  Object.hasOwn(releaseLine, "internalCompatibilityEndpoint"),
  false,
  "V1 must not publish or declare a compatibility endpoint",
);
assert.equal(
  Object.hasOwn(releaseLine, "ui"),
  false,
  "The unpublished V1 release line must not retain experimental MCP UI metadata.",
);
assert.deepEqual(
  existsSync(openAiResourceRoot)
    ? readdirSync(openAiResourceRoot, { recursive: true })
        .map((entry) => String(entry))
        .filter((entry) => entry.endsWith(".html"))
    : [],
  [],
  "current V1 must not retain or publish MCP widget HTML",
);

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
  /If it does not, do not call any SkillPilot\s+tool\./,
  "The skill must fail closed before any tool call when no prepared session exists.",
);
assert.match(skill, /Never show, repeat, request, or reconstruct\s+it\./);
assert.deepEqual(skillAgent, {
  interface: {
    display_name: "SkillPilot Coach v1",
    short_description: "Personal SkillPilot learning coach",
    default_prompt:
      "Use $skillpilot-coach-v1 and continue my prepared SkillPilot learning step.",
  },
  dependencies: {
    tools: [
      {
        type: "mcp",
        value: "skillpilot-coach-v1",
        description:
          "SkillPilot learning state, navigation, mastery, verified recall, and assessments",
        transport: "streamable_http",
        url: "https://mcp-coach-v1.skillpilot.com/mcp",
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

const orientationSection = policy.match(
  /## 5\. Motivation and orientation mode\n([\s\S]*?)\n## 6\./u,
);
assert.ok(
  orientationSection,
  "The coaching policy must contain a dedicated motivation and orientation mode.",
);
assert.match(orientationSection[1], /Show possibilities/u);
assert.match(orientationSection[1], /Offer positive perspectives/u);
assert.match(
  orientationSection[1],
  /visible\s+engagement, expressed interest, or readiness to continue/u,
);
assert.match(
  orientationSection[1],
  /test neither prior knowledge nor terminology, calculations,\s*details/u,
  "Orientation must never become a subject-detail or prior-knowledge check.",
);
assert.match(
  orientationSection[1],
  /never describe the result as subject-matter\s+mastery/u,
  "Orientation completion must not be presented as subject mastery.",
);
assert.match(
  skill,
  /motivational orientation, dialogic scaffolding,\s*verified recall, or strict assessment/u,
  "The skill workflow must route motivation through its dedicated mode.",
);

assert.match(
  combinedSkill,
  /communicationLocale[\s\S]+authoritative/u,
  "The language-neutral skill must make the session communication locale authoritative.",
);
assert.match(
  combinedSkill,
  /Never infer or override[\s\S]+English (?:skill|policy)[\s\S]+tool names/u,
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

assert.equal(
  combinedSkill.includes("https://skillpilot.com"),
  false,
  "The skill must never contain a model-selected or model-built SkillPilot URL.",
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
assert.match(combinedSkill, /standard MCP image(?:-| )content/s);
assert.match(combinedSkill, /goal visualization/s);
assert.match(
  combinedSkill,
  /never as a source,\s+evidence, task, solution, or performance record/s,
);
assert.match(
  combinedSkill,
  /goalVisualization[\s\S]+immediate next tool call in the same assistant turn[\s\S]+expectedStateVersion/s,
  "The coach skill must use the documented data-then-render call flow.",
);
assert.match(
  combinedSkill,
  /Never call it[\s\S]+after a newer successful SkillPilot result[\s\S]+Never retry/s,
  "The coach skill must bind one render attempt to the authorizing full result.",
);
assert.match(
  combinedSkill,
  /image receipt[\s\S]+does not replace the latest full SkillPilot context/s,
  "The renderer receipt must not replace the authoritative full coaching context.",
);
assert.match(
  mcpContract,
  /goalVisualization[\s\S]+render_skillpilot_goal_visualization[\s\S]+immediate next tool call in the same assistant turn[\s\S]+expectedStateVersion/s,
  "The MCP server instructions must publish the immediate data-then-render boundary.",
);
assert.match(
  mcpContract,
  /image receipt only[\s\S]+does not replace the latest full SkillPilot context/s,
  "The MCP server must keep the last full context authoritative after rendering.",
);
assert.match(
  combinedSkill,
  /standard MCP image(?:-| )content/s,
  "The bundled skill must define the renderer as standard MCP image content.",
);
assert.match(
  combinedSkill,
  /surface-neutral[\s\S]+does not depend on client metadata/s,
  "The bundled skill must keep image authorization independent of optional client metadata.",
);
assert.match(
  combinedSkill,
  /no MCP UI template|does not (?:create|bind)[^\n]*MCP UI component/s,
  "The bundled skill must not reintroduce an MCP UI component.",
);
assert.doesNotMatch(
  mcpContract,
  /request\.meta\(\)|openai\/userAgent|OpenAiDeClientSurface|supportsGoalVisualization/,
  "Optional client metadata must not gate the surface-neutral MCP image contract.",
);
assert.match(
  mcpContract,
  /RENDER_GOAL_VISUALIZATION[\s\S]+EXPECTED_STATE_VERSION, integerSchema\(0, null\)[\s\S]+List\.of\("goalId", EXPECTED_STATE_VERSION\)/s,
  "The renderer must require the state version from the result that authorized it.",
);

const javaConstant = (name) => {
  const declaration = contractMetadata.match(
    new RegExp(`public static final (?:String|int) ${name} =\\s*`),
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
  if (/^\d+$/.test(expression)) {
    return Number(expression);
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
assert.equal(javaConstant("PUBLIC_MCP_ENDPOINT"), releaseLine.publicMcpEndpoint);
assert.equal(javaConstant("OAUTH_RESOURCE"), releaseLine.oauthResource);
assert.equal(
  javaConstant("PROTECTED_RESOURCE_METADATA_ENDPOINT"),
  "https://mcp-coach-v1.skillpilot.com/.well-known/oauth-protected-resource/mcp",
);
assert.doesNotMatch(contractMetadata, /PUBLIC_UI_ORIGIN/);
assert.equal(javaConstant("INTERNAL_MCP_PATH"), "/internal/openai/v1/mcp");
assert.equal(javaConstant("STATE_SCHEMA_VERSION"), releaseLine.stateSchemaVersion);
assert.equal(javaConstant("WORKFLOW_VERSION"), releaseLine.workflowVersion);
assert.doesNotMatch(contractMetadata, /curricula-(?:tree|sha256)@/);
assert.doesNotMatch(mcpContract, /openai\/outputTemplate|resourceUri|widgetDomain/);
assert.match(mcpContract, /this\.resourceSpecifications = List\.of\(\)/);
assert.match(mcpContract, /McpSchema\.ImageContent\.builder/);
assert.match(mcpContract, /Base64\.getEncoder\(\)\.encodeToString/);
assert.match(goalVisualizationImageResolver, /MAX_MCP_IMAGE_BYTES/);
assert.match(goalVisualizationImageResolver, /PUBLIC_IMAGE_PREFIX/);

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
