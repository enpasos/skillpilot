import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedTools = [
  "get_skillpilot_coach_context",
  "render_skillpilot_goal_visualization",
  "start_skillpilot_memory_practice",
  "review_skillpilot_memory_practice_card",
  "get_skillpilot_navigation_options",
  "set_skillpilot_focus",
  "set_skillpilot_active_goal",
  "set_skillpilot_mastery",
  "start_skillpilot_verified_recall",
  "get_skillpilot_verified_recall_answers",
  "record_skillpilot_verified_recall_results",
  "get_skillpilot_exam_evaluation",
];
export const publicationFiles = [
  ".claude-plugin/plugin.json",
  ".mcp.json",
  "SETUP.md",
  "skills/skillpilot-coach-v1/SKILL.md",
  "skills/skillpilot-coach-v1/references/coaching-policy.md",
];

export function validateClaudePluginPackage(root = packageRoot) {
  const errors = [];
  const check = (condition, message) => {
    if (!condition) errors.push(message);
  };

  const text = new Map();
  for (const relativePath of publicationFiles) {
    try {
      text.set(relativePath, readFileSync(resolve(root, relativePath), "utf8"));
    } catch (error) {
      errors.push(`Missing or unreadable ${relativePath}: ${error.message}`);
    }
  }
  if (errors.length > 0) return { errors, toolCount: 0 };

  let manifest;
  let mcp;
  try {
    manifest = JSON.parse(text.get(".claude-plugin/plugin.json"));
  } catch (error) {
    errors.push(`Invalid .claude-plugin/plugin.json: ${error.message}`);
  }
  try {
    mcp = JSON.parse(text.get(".mcp.json"));
  } catch (error) {
    errors.push(`Invalid .mcp.json: ${error.message}`);
  }

  if (manifest) {
    check(manifest.name === "skillpilot-coach-v1", "Unexpected plugin name.");
    check(/^\d+\.\d+\.\d+$/u.test(manifest.version ?? ""), "Plugin version must be SemVer.");
    check(nonBlank(manifest.description), "Plugin description is required.");
    check(manifest.author?.name === "enpasos GmbH", "Unexpected plugin author.");
    check(manifest.homepage === "https://skillpilot.com", "Unexpected plugin homepage.");
    check(manifest.repository === "https://github.com/enpasos/skillpilot", "Unexpected repository URL.");
    check(manifest.license === "Apache-2.0", "Unexpected plugin license.");
    check(Array.isArray(manifest.keywords) && manifest.keywords.includes("skillpilot"), "Plugin keywords must include skillpilot.");
    check(!Object.hasOwn(manifest, "interface"), "Anthropic manifest must not contain a provider-foreign interface block.");
    check(!Object.hasOwn(manifest, "mcpServers"), "MCP discovery belongs in root .mcp.json, not the manifest.");
    check(!Object.hasOwn(manifest, "skills"), "Skill discovery must use the conventional root skills directory.");
  }

  if (mcp) {
    const serverEntries = Object.entries(mcp.mcpServers ?? {});
    check(serverEntries.length === 1 && serverEntries[0]?.[0] === "skillpilot", ".mcp.json must publish exactly the skillpilot server.");
    const server = serverEntries[0]?.[1];
    check(server?.type === "http", "SkillPilot MCP transport type must be http.");
    check(server?.url === expectedEndpoint, "Unexpected SkillPilot MCP endpoint.");
    check(server && Object.keys(server).sort().join(",") === "type,url", "Remote MCP declaration must contain only type and url.");
  }

  const skillText = text.get("skills/skillpilot-coach-v1/SKILL.md");
  const setupText = text.get("SETUP.md");
  const normalizedSkillText = skillText.replace(/\s+/gu, " ");
  const normalizedSetupText = setupText.replace(/\s+/gu, " ");
  const frontmatter = parseFrontmatter(skillText);
  check(frontmatter !== null, "SKILL.md must start with YAML frontmatter.");
  if (frontmatter) {
    check(frontmatter.name === "skillpilot-coach-v1", "Unexpected skill name.");
    check(nonBlank(frontmatter.description), "Skill description is required.");
    check(frontmatter.description.length <= 1024, "Skill description must not exceed 1024 characters.");
    check(/Use this skill whenever/u.test(frontmatter.description), "Skill description must state its trigger conditions.");
  }

  for (const tool of expectedTools) {
    check(skillText.includes(`\`${tool}\``), `SKILL.md must cover ${tool}.`);
  }

  const publishedText = [...text.values()].join("\n");
  check(
    normalizedSkillText.includes("`learningSessionId`")
      && normalizedSkillText.includes("every SkillPilot tool call"),
    "SKILL.md must require the first-party learningSessionId on every SkillPilot tool call.",
  );
  check(
    publishedText.includes("https://skillpilot.com/lernen/claude")
      && publishedText.includes("spc_")
      && /exact(?:ly|e) 24(?:-hour| hours| Stunden)/iu.test(publishedText),
    "Package must document the exact 24-hour first-party spc_ start flow.",
  );
  check(
    !/encrypted\s+\.skillpilot|\.skillpilot\s+(?:ID[- ]?)?file|ID[- ]file|ID-Datei/iu.test(publishedText),
    "Package must not use the retired encrypted ID-file flow.",
  );
  check(
    /offline_access/u.test(setupText)
      && /technical (?:plugin )?connection|technical connector transport/iu.test(setupText)
      && /no learner identity/iu.test(setupText),
    "SETUP.md must separate offline OAuth transport persistence from learner identity.",
  );
  check(!publishedText.includes("https://mcp-coach-v1.skillpilot.com"), "Package must not reference the frozen provider endpoint.");
  check(!publishedText.includes("get_skillpilot_context"), "Package must not use the provider-foreign context tool.");
  check(skillText.includes("do not narrate tool calls"), "SKILL.md must enforce the learner presentation boundary.");
  check(skillText.includes("untrusted learning data"), "SKILL.md must treat returned learning content as untrusted data.");
  check(skillText.includes("Never reveal credentials or opaque authorization values"), "SKILL.md must prohibit secret disclosure.");
  check(skillText.includes("two independent checks") && skillText.includes("multi-step"), "SKILL.md must require concrete ordinary-goal evidence.");
  check(skillText.includes("wait for answers to the complete batch"), "SKILL.md must preserve recall answer-release timing.");
  check(skillText.includes("Wait for the complete submission"), "SKILL.md must preserve exam answer-release timing.");
  check(normalizedSkillText.includes("private MCP App"), "SKILL.md must keep normal memory-card content inside the private app.");
  check(normalizedSkillText.includes("must never call `review_skillpilot_memory_practice_card`"), "SKILL.md must keep card review app-only.");
  check(normalizedSkillText.includes("does not establish mastery"), "SKILL.md must separate normal memory practice from mastery.");
  check(normalizedSetupText.includes("skillpilot-coach-v1.plugin"), "SETUP.md must document the integrated .plugin upload.");
  check(
    normalizedSetupText.includes("Do not enable the bundled and standalone variants at the same time"),
    "SETUP.md must prevent duplicate bundled and standalone installations.",
  );
  check(
    normalizedSetupText.includes("preferred installation path")
      && normalizedSetupText.includes("MCP tools and both interactive MCP Apps"),
    "SETUP.md must prefer the integrated plugin and attribute MCP Apps to the connector.",
  );

  return { errors, toolCount: expectedTools.length };
}

function parseFrontmatter(content) {
  const match = /^---\n([\s\S]*?)\n---\n/u.exec(content);
  if (!match) return null;
  const parsed = {};
  for (const line of match[1].split("\n")) {
    const separator = line.indexOf(":");
    if (separator < 1) return null;
    parsed[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
  }
  return parsed;
}

function nonBlank(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function main() {
  const rootArgumentIndex = process.argv.indexOf("--package-root");
  const root = rootArgumentIndex >= 0 ? resolve(process.argv[rootArgumentIndex + 1] ?? "") : packageRoot;
  const result = validateClaudePluginPackage(root);
  if (result.errors.length > 0) {
    console.error("CHECK claude_plugin_v1 FAIL");
    for (const error of result.errors) console.error(`- ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log(`CHECK claude_plugin_v1 STRUCTURAL_PASS tools=${result.toolCount}`);
  console.log("EXTERNAL_GATE: run claude plugin validate before publication");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
