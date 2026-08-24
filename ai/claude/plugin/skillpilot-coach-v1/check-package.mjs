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
const forbiddenDistributionClaimPatterns = [
  {
    label: "Claude Free availability",
    pattern: /\b(?:the\s+)?(?:public\s+)?(?:SkillPilot\s+)?plugin(?:\s+package)?\s+(?:is|will be)\s+(?:now\s+)?available\s+(?:on|in|for)\s+Claude Free\b/iu,
  },
  {
    label: "prohibition of same-server plugin and Directory coexistence",
    pattern: /\bPlugin and Directory(?:\s+(?:connector\s+)?installations?|\s+entries?)?\s+(?:must|can|may)\s+never\s+(?:coexist|be enabled together)\b/iu,
  },
  {
    label: "plugin ownership of connector tools or UI",
    pattern: /(?:^|[.!?]\s+)\s*(?:The\s+)?(?:public\s+)?(?:SkillPilot\s+)?plugin(?:\s+shell)?\s+(?:owns|supplies|implements|duplicates|provides)\b[^.\n]{0,120}\b(?:MCP\s+)?(?:tools?|Apps?|UIs?|UI resources?)\b/imu,
  },
];
const forbiddenPluginSurfaceClaims = [
  {
    label: "unqualified native-mobile plugin support",
    surfacePattern: /\bnative[- ]mobile(?:[- ]plugin)?(?:\s+support)?\b/iu,
  },
  {
    label: "unverified iOS plugin support",
    surfacePattern: /\b(?:native\s+)?(?:Claude\s+)?(?:iOS|iPhone|iPad)(?:\s+Chat)?\b/iu,
  },
  {
    label: "Claude Desktop Chat plugin support",
    surfacePattern: /\b(?:Claude\s+)?Desktop Chat\b/iu,
  },
  {
    label: "Claude Cowork plugin support",
    surfacePattern: /\b(?:Claude\s+)?Cowork\b/iu,
  },
  {
    label: "public Claude Code plugin support",
    surfacePattern: /\b(?:public\s+)?Claude Code\b/iu,
  },
];
const pluginClaimSubjectPattern = /\b(?:(?:the|das|der|die)\s+(?:(?:public|öffentlich(?:e|en|er|es)?)\s+)?(?:SkillPilot[-\s]+)?plugin(?:[-\s]+(?:package|shell|Paket))?|(?:public|öffentlich(?:e|en|er|es)?)\s+(?:SkillPilot[-\s]+)?plugin(?:[-\s]+(?:package|shell|Paket))?|SkillPilot[-\s]+(?:plugin(?:[-\s]+(?:package|shell|Paket))?|coach(?:ing)?(?:[-\s]+v1)?[-\s]+skill|coaching[-\s]+skill|coach[-\s]+v1))\b/iu;
const positivePluginClaimPattern = /\b(?:supports?|provides?|offers?|includes?|works?|runs?|enables?|covers?|ships?|bundles?|can|may|will|would|could|(?:is|are)\s+(?:not\s+)?(?:now\s+)?(?:available|supported|usable|compatible|intended)|(?:is\s+)?(?:the\s+)?preferred\s+complete\s+installation|unterstützt|bietet|liefert|enthält|funktioniert|läuft|ermöglicht|deckt|kann|könnte|wird|soll|ist\s+(?:nicht\s+)?(?:jetzt\s+)?(?:verfügbar|unterstützt|nutzbar|kompatibel|vorgesehen)|(?:ist\s+)?(?:die\s+)?bevorzugte\s+vollständige\s+Installation)\b/iu;
const explicitClaimNegationPattern = /\b(?:not|no|neither|nor|without|never|(?:does|do|is|are|can|will|would|should|must)n['’]t|nicht|kein(?:e|en|em|er|es)?|weder|noch|ohne|niemals)\b/iu;
const explicitNegativeClaimPattern = /\b(?:makes?|has)\s+no\s+claim\b|\bdoes\s+not\s+claim\b|\bclaims?\s+neither\b|\b(?:macht|enthält|erhebt)\s+kein(?:e|en|em|er|es)?\s+(?:Aussage|Behauptung|Anspruch)\b|\bbeansprucht\s+(?:nicht|weder)\b|\bsagt\s+kein(?:e|en|em|er|es)?\b[^.!?;]{0,40}\bzu\b/iu;
const claimClauseBoundaryPattern = /\s+(?:but|however|whereas|yet|aber|jedoch|hingegen|sondern)\s+/iu;

function containsPositivePluginSurfaceClaim(text, surfacePattern) {
  const normalizedText = text.replace(/\s+/gu, " ");
  const sentences = normalizedText.split(/(?<=[.!?;])\s+/u);

  for (const sentence of sentences) {
    const sentenceHasSubject = pluginClaimSubjectPattern.test(sentence);
    for (const clause of sentence.split(claimClauseBoundaryPattern)) {
      if (!sentenceHasSubject && !pluginClaimSubjectPattern.test(clause)) continue;

      const predicates = allMatches(positivePluginClaimPattern, clause);
      if (predicates.length === 0) continue;

      for (const surface of allMatches(surfacePattern, clause)) {
        if (explicitNegativeClaimPattern.test(clause.slice(0, surface.index))) continue;
        const predicate = predicates.reduce((nearest, candidate) => (
          Math.abs(candidate.index - surface.index) < Math.abs(nearest.index - surface.index)
            ? candidate
            : nearest
        ));
        const claimStart = Math.max(0, Math.min(predicate.index, surface.index) - 18);
        const claimEnd = Math.max(
          predicate.index + predicate[0].length,
          surface.index + surface[0].length,
        );
        const claimSpan = clause.slice(claimStart, claimEnd);
        if (!explicitClaimNegationPattern.test(claimSpan)) return true;
      }
    }
  }

  return false;
}

function allMatches(pattern, value) {
  const flags = pattern.flags.includes("g") ? pattern.flags : `${pattern.flags}g`;
  return [...value.matchAll(new RegExp(pattern.source, flags))];
}
export const publicationFiles = [
  ".claude-plugin/plugin.json",
  ".mcp.json",
  "README.md",
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
  const readmeText = text.get("README.md");
  const setupText = text.get("SETUP.md");
  const normalizedSkillText = skillText.replace(/\s+/gu, " ");
  const normalizedReadmeText = readmeText.replace(/\s+/gu, " ");
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
  for (const { label, pattern } of forbiddenDistributionClaimPatterns) {
    check(
      !pattern.test(publishedText),
      `Package contains a forbidden contradictory Claude distribution claim: ${label}.`,
    );
  }
  for (const { label, surfacePattern } of forbiddenPluginSurfaceClaims) {
    check(
      !containsPositivePluginSurfaceClaim(publishedText, surfacePattern),
      `Package contains a forbidden contradictory Claude distribution claim: ${label}.`,
    );
  }
  check(
    normalizedSkillText.includes("`learningSessionId`")
      && normalizedSkillText.includes("every SkillPilot tool call"),
    "SKILL.md must require the first-party learningSessionId on every SkillPilot tool call.",
  );
  check(
    publishedText.includes("https://skillpilot.com/")
      && publishedText.includes("spc_")
      && /exact(?:ly|e) 24(?:-hour| hours| Stunden)/iu.test(publishedText),
    "Package must document the exact 24-hour first-party spc_ start flow.",
  );
  check(
    !publishedText.includes("?coach=claude"),
    "Package must use the standard SkillPilot start and must not restore the retired Claude query gate.",
  );
  check(
    !/encrypted\s+\.skillpilot|\.skillpilot\s+(?:ID[- ]?)?file|ID[- ]file|ID-Datei/iu.test(publishedText),
    "Package must not use the retired encrypted ID-file flow.",
  );
  check(
    /offline_access/u.test(setupText)
      && /technical (?:plugin )?connection|technical connector (?:connection|transport)/iu.test(setupText)
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
  check(
    normalizedSetupText.includes("A plugin and Directory installation that reference this exact remote MCP URL may coexist; Claude exposes one set of tools for the shared server")
      && normalizedSetupText.includes("Do not add a second manual custom SkillPilot connector with the same URL when the plugin or Directory connection already supplies it"),
    "SETUP.md must allow same-server plugin and Directory coexistence while preventing redundant manual custom connections.",
  );
  check(
    normalizedSetupText.includes("The package has been observed in paid Claude Web chat and, after account-level direct installation on Claude Pro, in the native Claude app on Android")
      && normalizedSetupText.includes("Fresh public-listing installation and Android use are verified after publication and do not form a circular pre-submission gate"),
    "SETUP.md must distinguish the Web-and-Android direct-install pilot from post-publication listing verification.",
  );
  check(
    normalizedSetupText.includes("The v1 publication scope is limited to eligible paid Claude Chat on the Web and the native Android app after account-level installation")
      && normalizedSetupText.includes("does not claim Claude Desktop Chat or Cowork support"),
    "SETUP.md must keep the v1 publication scope limited to eligible paid Claude Web and verified native Android chat.",
  );
  check(
    normalizedSetupText.includes("The plugin is not available on Claude Free")
      && normalizedSetupText.includes("does not claim iOS plugin support")
      && normalizedSetupText.includes("installation from inside the Android app"),
    "SETUP.md must reject Claude Free, iOS and Android in-app installation claims.",
  );
  check(
    normalizedSetupText.includes("The Connectors Directory remains a separate connector-only distribution route with its own Team/Enterprise submission gate and is not a prerequisite for plugin submission")
      && normalizedSetupText.includes("Its Team/Enterprise publisher gate applies only to Directory submission and does not gate public plugin submission"),
    "SETUP.md must preserve the independent Connector Directory lane without gating plugin submission.",
  );
  check(
    normalizedSetupText.includes("All twelve MCP tools and both interactive MCP Apps come from the remote SkillPilot connector")
      && normalizedSetupText.includes("The Skill provides coaching instructions only")
      && normalizedSetupText.includes("without copying their schemas, resources or UI bytes into the plugin package"),
    "SETUP.md must attribute all tools and interactive UIs to the connector without duplicating them in the plugin.",
  );
  check(
    normalizedReadmeText.includes("Its product scope is limited to eligible paid Claude Chat on the Web and the native Android app")
      && normalizedReadmeText.includes("A direct-install pilot has demonstrated the package in paid Claude Web chat")
      && normalizedReadmeText.includes("The Product Owner has also used the account-level direct installation with a Claude Pro account in the native Claude app on Android")
      && normalizedReadmeText.includes("Public-listing reach on Android is a publication verification, not a circular pre-submission requirement")
      && normalizedReadmeText.includes("The permanent SkillPilot ID remains inside SkillPilot")
      && normalizedReadmeText.includes("[SETUP.md](./SETUP.md)")
      && normalizedReadmeText.includes("https://skillpilot.com/legal")
      && normalizedReadmeText.includes("support@skillpilot.com"),
    "README.md must state the Web-and-Android direct-install boundary, post-publication listing verification, first-party identity boundary, setup route and public support links.",
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
