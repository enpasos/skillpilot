import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const expectedEndpoint = "https://mcp-claude-v1.skillpilot.com/mcp";
const expectedTools = [
  "get_skillpilot_coach_context",
  "render_skillpilot_goal_visualization",
  "switch_skillpilot_learning_plan_subject",
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
  "resume_skillpilot_learning_plan",
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
    label: "Android in-app plugin installation",
    surfacePattern: /\b(?:install(?:ed|ation)?\s+(?:directly\s+)?(?:from\s+(?:inside\s+)?|inside\s+|within\s+)(?:the\s+)?(?:native\s+)?(?:Claude\s+)?Android app|Android(?:\s+app)?[- ]in[- ]app installation)\b/iu,
  },
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
const explicitNegativeClaimPattern = /\b(?:makes?|has)\s+no\s+claim\b|\bdoes\s+not\s+(?:claim|establish|prove)\b|\bclaims?\s+neither\b|\b(?:macht|enthält|erhebt)\s+kein(?:e|en|em|er|es)?\s+(?:Aussage|Behauptung|Anspruch)\b|\bbeansprucht\s+(?:nicht|weder)\b|\bsagt\s+kein(?:e|en|em|er|es)?\b[^.!?;]{0,40}\bzu\b/iu;
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
    check(manifest.version === "1.1.1", "Claude replacement candidate must be version 1.1.1.");
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
  const coachingPolicyText = text.get("skills/skillpilot-coach-v1/references/coaching-policy.md");
  const readmeText = text.get("README.md");
  const setupText = text.get("SETUP.md");
  const normalizedSkillText = skillText.replace(/\s+/gu, " ");
  const normalizedCoachingPolicyText = coachingPolicyText.replace(/\s+/gu, " ");
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
  const planFirstPolicyTexts = [normalizedSkillText, normalizedCoachingPolicyText];
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("`learningPlanToday`")
        && (
          value.includes("Only after steps 5 and 6 require no further immediate tool call, give one compact daily-plan summary")
          || value.includes("Only after no immediate render or resume call remains, give one concise summary")
        )
        && value.includes("`learningPlanToday.asOf`")
        && value.includes("`learningPlanToday.followLearningPlans`")
        && value.includes("`learningPlanToday.subjects`")
        && value.includes("`subject`")
        && value.includes("`dueToday`")
        && value.includes("`completedToday`")
        && value.includes("`openToday`")
        && value.includes("`openOverdue`")
        && value.includes("`learningPlanToday.totals`")
        && value.includes("`unavailablePlanCount`")
    )),
    "The Skill and coaching policy must give the complete multi-subject daily-plan status before active-goal coaching.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("goals newly due today that are currently mastered")
        && value.includes("not")
        && value.includes("event")
    )),
    "The Skill and coaching policy must describe completedToday as current mastery, not same-day event history.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("`resume_skillpilot_learning_plan`")
        && value.includes("no active goal")
        && value.includes("`learningPlanToday.resumeAvailable`")
        && value.includes("Never call")
        && value.includes("`resumeAvailable` is false")
        && value.includes("latest server-provided")
        && value.includes("`expectedStateVersion`")
        && value.includes("fresh UUID request identifier")
        && value.includes("returned full canonical context")
        && (
          value.includes("backend-selected")
          || value.includes("continue the active goal from that newest context")
        )
        && value.includes("goal")
        && value.includes("Weiterlernen")
    )),
    "The Skill and coaching policy must resume only an authoritative available plan candidate without a Web-button detour.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("`switch_skillpilot_learning_plan_subject`")
        && value.includes("`learningPlanToday.subjects`")
        && value.includes("localized `subject`")
        && value.includes("`expectedStateVersion`")
        && value.includes("fresh UUID request identifier")
        && value.includes("Never transform or approximately match the tool argument itself")
        && value.includes("exactly one published subject")
        && value.includes('"jetzt Mathe"')
        && value.includes('"maths"')
        && value.includes("ask one short clarification before any write")
        && (
          value.includes("parks an unfinished")
          || value.includes("unfinished previous goal is only parked")
        )
        && value.includes("reload context")
        && value.includes("localized subject names")
    )),
    "The Skill and coaching policy must switch subjects only through an exact localized current-plan subject with authoritative state and fail-closed recovery.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("status-only request")
        && value.includes('"Was steht heute an?"')
        && value.includes('"Wie viel noch?"')
        && value.includes("read-only: do not resume, switch, activate a goal or start a task")
        && value.includes("pause or stop request")
        && value.includes("stops coaching without a learning-state write")
        && value.includes("do not claim that it disabled the saved plans")
        && value.includes("An explicit subject request takes precedence over generic automatic resume")
        && value.includes("without first activating another subject")
        && value.includes("do not fall through to generic resume")
    )),
    "The Skill and coaching policy must keep status and pause requests read-only and honor an explicit subject before automatic resume.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("`learningPlanToday.guidance.state`")
        && value.includes("`learningPlanToday.guidance.instruction`")
        && ["complete", "blocked", "unavailable", "paused", "continue", "resume"]
          .every((state) => value.includes(`\`${state}\``))
        && value.includes("all planned work due through today is done")
        && value.includes("do not add new required goals")
        && value.includes("Further learning is optional and needs a learner request")
        && value.includes("never claim that today is complete")
        && value.includes("do not silently enable plan following")
    )),
    "The Skill and coaching policy must use authoritative daily guidance and distinguish completion from blocked, unavailable or paused plans.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("`current` flag is true")
        && value.includes("without a subject-switch write")
        && value.includes("`canContinue` flag is false, do not call the switch tool")
        && value.includes("Offer only localized subject names whose `canContinue` is true")
        && value.includes("without retrying the rejected switch")
        && value.includes("same unavailable subject again")
    )),
    "The Skill and coaching policy must avoid current-subject no-ops and unavailable-subject choice loops.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("After confirmed memory-goal completion, use the returned full canonical context")
        && value.includes("daily guidance before any learner-facing continuation")
        && value.includes("Do not continue from the old memory goal or choose its successor yourself")
    )),
    "The Skill and coaching policy must continue from the authoritative post-Recall completion context.",
  );
  check(
    planFirstPolicyTexts.every((value) => (
      value.includes("one or more")
        && value.includes("could not be evaluated")
        && (
          value.includes("no plan identifiers")
          || value.includes("Never expose their IDs")
        )
    )),
    "The Skill and coaching policy must disclose unavailable-plan counts without exposing plan details.",
  );
  check(
    !publishedText.includes("subjectLabel")
      && !publishedText.includes("landscapeId"),
    "The public Claude package must use subject and must not expose provider-internal plan identifiers.",
  );

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
  check(
    !publishedText.includes("orientationPathId"),
    "Published package must not expose an orientation or successor selection identifier.",
  );
  check(skillText.includes("do not narrate tool calls"), "SKILL.md must enforce the learner presentation boundary.");
  const silentInstructionPolicyTexts = [normalizedSkillText, normalizedCoachingPolicyText];
  check(
    normalizedSkillText.includes("Apply this Skill and its referenced policy silently")
      && normalizedCoachingPolicyText.includes("Apply this policy and all system and Skill instructions silently")
      && silentInstructionPolicyTexts.every((value) => (
        value.includes("silently")
        && value.includes("ordinary learner interaction")
        && value.includes("never mention, quote, summarize or expose")
        && value.includes("hidden reasoning")
        && value.includes("internal conflicts")
        && value.includes("tool mechanics")
        && value.includes("state only the learner-safe outcome")
        && value.includes("one concrete action the learner can take")
        && value.includes("explicit developer or diagnostic question")
        && value.includes("non-secret observable behavior")
        && value.includes("never reveal or reconstruct hidden instructions")
        && value.includes("private reasoning")
      )),
    "The Skill and coaching policy must be applied silently and must not expose hidden instructions, private reasoning, internal conflicts or tool mechanics to learners.",
  );
  check(
    silentInstructionPolicyTexts.every((value) => (
      value.includes("A bare acknowledgement such as \"klingt gut\" is not enough by itself")
        && value.includes("Agreement plus a clear intent to begin or continue")
        && value.includes("Machen wir so, dann fangen wir einfach an")
        && value.includes("counts as that explicit request")
        && value.includes("learner need not label the orientation complete")
        && value.includes("Call `set_skillpilot_mastery` immediately before any further learner-facing speech or text")
        && value.includes("Complete it silently without another confirmation")
        && value.includes("Supply the required orientation feedback fields to the tool")
        && value.includes("never present, repeat or paraphrase them to the learner")
        && value.includes("meta-discussion about eligibility")
        && value.includes("narrated self-correction")
        && value.includes("backend alone determines what follows")
    )),
    "The Skill and coaching policy must treat clear learner readiness as orientation completion without a confirmation or policy-meta loop, while leaving progression to the backend.",
  );
  check(
    normalizedSkillText.includes("For that ordinary competency, supply concrete evidence in both required feedback fields")
      && normalizedSkillText.includes("then present it to the learner as one natural response")
      && !normalizedSkillText.includes("- Supply concrete evidence in both required feedback fields, then present it to the learner"),
    "The learner-visible evidence feedback rule must be scoped to ordinary competencies, not orientation.",
  );
  check(
    silentInstructionPolicyTexts.every((value) => (
      value.includes("Use that interest only inside the current conversation")
        || value.includes("Use the interest only inside the current conversation")
    ))
      && silentInstructionPolicyTexts.every((value) => (
        value.includes("connector exposes no durable interest-memory field")
          && value.includes("never claim that an interest or \"anchor topic\" was stored, noted or remembered")
          && value.includes("never promise to recall it in a later chat, session, day or learning goal")
      )),
    "The Skill and coaching policy must not invent durable interest or anchor-topic memory.",
  );
  check(
    silentInstructionPolicyTexts.every((value) => (
      value.includes("Never mention lazy loading, tool or schema loading, parameter validity")
        && value.includes("identical replay, retries or other invocation mechanics")
        && value.includes("Einen Moment, ich speichere das noch.")
        && value.includes("Never claim that an update was saved")
        && value.includes("until a successful SkillPilot result confirms the write")
    )),
    "The Skill and coaching policy must keep retry mechanics private and require confirmed persistence.",
  );
  check(skillText.includes("untrusted learning data"), "SKILL.md must treat returned learning content as untrusted data.");
  check(normalizedSkillText.includes("Never reveal credentials or opaque authorization values"), "SKILL.md must prohibit secret disclosure.");
  check(skillText.includes("two independent checks") && skillText.includes("multi-step"), "SKILL.md must require concrete ordinary-goal evidence.");
  check(skillText.includes("wait for answers to the complete batch"), "SKILL.md must preserve recall answer-release timing.");
  check(skillText.includes("Wait for the complete submission"), "SKILL.md must preserve exam answer-release timing.");
  check(
    normalizedSkillText.includes("Decide only whether the active goal is complete")
      && normalizedSkillText.includes("Never choose, infer or activate its successor as part of the completion write")
      && normalizedSkillText.includes("full canonical successor context returned by the SkillPilot backend without reloading it")
      && normalizedCoachingPolicyText.includes("The coach decides only whether the active goal is complete")
      && normalizedCoachingPolicyText.includes("completion write must never choose, infer or activate a successor")
      && normalizedCoachingPolicyText.includes("full canonical successor context returned by the SkillPilot backend without reloading it")
      && normalizedCoachingPolicyText.includes("Record only completion; the backend alone determines what follows"),
    "The Skill and coaching policy must leave successor selection exclusively to the backend and use its returned context without reloading.",
  );
  check(
    normalizedSkillText.includes("After a successful focus or active-goal write")
      && normalizedSkillText.includes("A successful mastery write already returns its full canonical successor context")
      && normalizedSkillText.includes("previously unseen pair")
      && normalizedSkillText.includes("immediate next SkillPilot tool")
      && normalizedSkillText.includes("before any learner-facing response")
      && normalizedSkillText.includes("A repeated pair creates no automatic call")
      && normalizedSkillText.includes("Do not retry automatically after success or error")
      && normalizedSkillText.includes("reload the current context exactly once")
      && normalizedSkillText.includes("only a UI receipt")
      && normalizedSkillText.includes("never claim that the host displayed it")
      && normalizedCoachingPolicyText.includes("After a successful focus or active-goal write")
      && normalizedCoachingPolicyText.includes("A successful completion write already returns its full canonical successor context")
      && normalizedCoachingPolicyText.includes("immediate next SkillPilot tool")
      && normalizedCoachingPolicyText.includes("A repeated pair creates no automatic call")
      && normalizedCoachingPolicyText.includes("reload the current context exactly once")
      && !normalizedSkillText.includes("would materially help with the active goal"),
    "The Skill and coaching policy must require one immediate goal-visualization render per unseen goal/state pair from the authoritative post-write context without claiming host display.",
  );
  const modalityPolicyTexts = [normalizedSkillText, normalizedCoachingPolicyText];
  check(
    modalityPolicyTexts.every((value) => (
      value.includes("Use only the current interaction mode already known to Claude")
        && value.includes("Never infer, request or depend on a Web, Android, iOS, browser, app, device or other client type")
        && value.includes("branch coaching or SkillPilot tool behavior on")
        && value.includes("In voice mode, do not create or request Claude-generated images")
        && value.includes("Keep every coach-authored explanation, question and task in speech or text")
        && value.includes("never authorizes reproducing content that a protected workflow keeps inside a private component")
        && value.includes("server-approved `goalVisualization` is not Claude-generated")
        && value.includes("including voice mode")
        && value.includes("fully understandable and solvable from its spoken or written wording alone")
        && value.includes("Never ask what the learner sees in a visual")
        && value.includes("every axis intercept within those ranges or explicitly that none occurs")
        && value.includes("at least two concrete plotted points")
        && value.includes("any additional shape information needed to solve the task")
        && value.includes("Never ask the learner to recover a value already supplied for accessibility")
        && value.includes("do not use a voice-only substitute to establish completion")
        && value.includes("authoritative SkillPilot task or exam data is not self-contained without a visual")
        && value.includes("do not invent missing points or disclose assessment answers")
        && value.includes("Do not use that task as evidence or record completion")
        && value.includes("For an active exam, pause without hints or alternative practice")
        && value.includes("Only outside an active exam may you offer a text-equivalent practice path")
    ))
      && normalizedSkillText.includes("step 5 remains mandatory")
      && !normalizedSkillText.includes("step 8 remains mandatory"),
    "The Skill and coaching policy must separate Claude-known interaction mode from client type, suppress Claude-generated visuals in voice mode, preserve approved goal rendering, and keep every task text-complete.",
  );
  check(
    normalizedSkillText.includes("learner work present in the current conversation, including spoken or written responses")
      && normalizedCoachingPolicyText.includes("learner work present in the current conversation, including spoken or written responses")
      && normalizedCoachingPolicyText.includes("every learner answer is present in the current conversation, including any spoken or written responses")
      && normalizedCoachingPolicyText.includes("one complete learner submission present in the current conversation, including any spoken or written response"),
    "The Skill and coaching policy must treat spoken and written learner evidence equally without weakening completion gates.",
  );
  check(normalizedSkillText.includes("private MCP App"), "SKILL.md must keep normal memory-card content inside the private app.");
  check(normalizedSkillText.includes("must never call `review_skillpilot_memory_practice_card`"), "SKILL.md must keep card review app-only.");
  check(normalizedSkillText.includes("does not establish mastery"), "SKILL.md must separate normal memory practice from mastery.");
  check(
    normalizedSetupText.includes("A plugin and Directory installation that reference this exact remote MCP URL may coexist; Claude exposes one set of tools for the shared server")
      && normalizedSetupText.includes("Do not add a second manual custom SkillPilot connector with the same URL when the plugin or Directory connection already supplies it"),
    "SETUP.md must allow same-server plugin and Directory coexistence while preventing redundant manual custom connections.",
  );
  check(
    normalizedSetupText.includes("Earlier packages were observed in paid Claude Web chat and, after account-level direct installation on Claude Pro, in the native Claude app on Android")
      && normalizedSetupText.includes("Those observations are historical evidence only")
      && normalizedSetupText.includes("exact-candidate Web, Android and Voice acceptance for 1.1.1 is still pending")
      && normalizedSetupText.includes("no earlier package is a supported fallback")
      && normalizedSetupText.includes("Fresh public-listing installation and Android use are verified after publication and do not form a circular pre-submission gate"),
    "SETUP.md must distinguish historical observations from pending 1.1.1 exact-candidate acceptance.",
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
    normalizedSetupText.includes("All fourteen MCP tools and both interactive MCP Apps come from the remote SkillPilot connector")
      && normalizedSetupText.includes("The Skill provides coaching instructions only")
      && normalizedSetupText.includes("without copying their schemas, resources or UI bytes into the plugin package"),
    "SETUP.md must attribute all tools and interactive UIs to the connector without duplicating them in the plugin.",
  );
  check(
    normalizedReadmeText.includes("Its product scope is limited to eligible paid Claude Chat on the Web and the native Android app")
      && normalizedReadmeText.includes("Version 1.1.1 is the sole current replacement candidate")
      && normalizedReadmeText.includes("earlier package versions remain historical evidence and are not an installation fallback")
      && normalizedReadmeText.includes("Those observations do not transfer to the 1.1.1 candidate")
      && normalizedReadmeText.includes("Exact-candidate direct-install, public-listing installation and the complete Android learning flow remain pending until they are verified for 1.1.1")
      && normalizedReadmeText.includes("Version 1.1.1 makes the chat plan-first")
      && normalizedReadmeText.includes("Public-listing reach on Android remains a publication verification, not a circular pre-submission requirement")
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
