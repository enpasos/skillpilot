import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = resolve(
  repositoryRoot,
  "ai/openai plugin/skillpilot-coach-de",
);
const skillRoot = resolve(pluginRoot, "skills/skillpilot-coach-de");

const read = (path) => readFileSync(path, "utf8");
const readJson = (path) => JSON.parse(read(path));

const manifestSource = read(resolve(pluginRoot, ".codex-plugin/plugin.json"));
const manifest = JSON.parse(manifestSource);
const appConfig = readJson(resolve(pluginRoot, ".app.json"));
const mcpConfig = readJson(resolve(pluginRoot, ".mcp.json"));
const skill = read(resolve(skillRoot, "SKILL.md"));
const policy = read(resolve(skillRoot, "references/coaching-policy.md"));
const openAiYaml = read(resolve(skillRoot, "agents/openai.yaml"));
// JSON is a strict YAML 1.2 subset. Keeping this small metadata file in that
// subset lets CI parse and validate it without a second package-manager tree.
const skillAgent = JSON.parse(openAiYaml);
const mcpContract = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachMcpContract.java",
));
const contextProjector = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/openai/mcp/de/OpenAiDeCoachContextProjector.java",
));
const launchService = read(resolve(
  repositoryRoot,
  "backend/src/main/java/com/skillpilot/backend/service/OpenAiDeCoachConnectionService.java",
));
const combinedSkill = `${skill}\n${policy}`;
const completeBehavioralSurface =
  `${manifestSource}\n${combinedSkill}\n${openAiYaml}\n${mcpContract}\n${contextProjector}\n${launchService}`;

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

assert.equal(manifest.name, "skillpilot-coach-de");
assert.match(manifest.name, /^[A-Za-z0-9][A-Za-z0-9_-]*$/);
assert.ok(manifest.name.length <= 64);
assert.match(
  manifest.version,
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/,
  "version must be strict SemVer without leading zeroes or empty identifiers.",
);
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
  "supportURL",
]) {
  requireHttpsUrl(
    pluginInterface?.[field],
    `interface.${field}`,
    1024,
  );
}
assert.equal(
  pluginInterface.supportURL,
  "https://skillpilot.com/imprint",
  "The support listing must lead to the published support contact.",
);
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
    "skillpilot-coach-de": {
      type: "http",
      url: "https://skillpilot.com/api/openai/de/mcp",
    },
  },
});

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
assert.equal(frontmatterEntries.get("name"), "skillpilot-coach-de");
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
    display_name: "SkillPilot Coach (Deutsch)",
    short_description: "Persönlicher deutscher SkillPilot-Lerncoach",
    default_prompt:
      "Verwende $skillpilot-coach-de und fahre mit meinem vorbereiteten SkillPilot-Lernschritt fort.",
  },
  dependencies: {
    tools: [
      {
        type: "mcp",
        value: "skillpilot-coach-de",
        description:
          "SkillPilot-Lernzustand, Navigation, Mastery, Verified Recall und Prüfungen",
        transport: "streamable_http",
        url: "https://skillpilot.com/api/openai/de/mcp",
      },
    ],
  },
  policy: {
    allow_implicit_invocation: false,
  },
});

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

console.log("SkillPilot Coach plugin contract check passed.");
