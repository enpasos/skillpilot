import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  lstatSync,
  readFileSync,
  readdirSync,
} from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

export const FROZEN_V1_TREE_SHA256 =
  "32582795363ff26cde71c5255dd78461f35d40bd7f2993c86751ba1032b159cb";
export const FROZEN_V1_CONTRACT_SHA256 =
  "d2f08a66efa3488e5f87758de41688a18ce47ba2951bb2d3147e522d1fd30b38";
export const REVIEW_FREEZE_TREE_DIGEST_ALGORITHM =
  "review-freeze-sha256-v1:path-nul-bytes-nul-content-sha256-lf";
export const RUNTIME_TEST_CLASS =
  "com.skillpilot.backend.openai.mcp.de.v1.OpenAiDeV11DailyPlanContractTest";

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

function normalizedRelativePath(root, path) {
  return relative(root, path).split(sep).join("/");
}

function assertSafeRelativePath(path, field) {
  assert.equal(typeof path, "string", `${field} must be a string.`);
  assert.ok(path.length > 0, `${field} must not be empty.`);
  assert.equal(path.startsWith("/"), false, `${field} must be relative.`);
  assert.equal(path.includes("\\"), false, `${field} must use POSIX separators.`);
  assert.equal(
    path.split("/").some((segment) => segment === "" || segment === "." || segment === ".."),
    false,
    `${field} contains an unsafe path segment.`,
  );
}

export function calculateTreeInventory(treeRoot) {
  const entries = [];

  function visit(directory) {
    const directoryEntries = readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => left.name.localeCompare(right.name));
    for (const entry of directoryEntries) {
      const path = resolve(directory, entry.name);
      const relativePath = normalizedRelativePath(treeRoot, path);
      const metadata = lstatSync(path);
      assert.equal(
        metadata.isSymbolicLink(),
        false,
        `Frozen V1 tree must not contain symbolic links: ${relativePath}`,
      );
      if (metadata.isDirectory()) {
        visit(path);
      } else {
        assert.equal(
          metadata.isFile(),
          true,
          `Frozen V1 tree contains a non-file entry: ${relativePath}`,
        );
        const bytes = readFileSync(path);
        entries.push({
          path: relativePath,
          bytes: bytes.length,
          sha256: sha256(bytes),
        });
      }
    }
  }

  visit(treeRoot);
  return entries;
}

export function calculateReviewFreezeTreeSha256(entries) {
  const inventory = entries
    .map((entry) => `${entry.path}\0${entry.bytes}\0${entry.sha256}\n`)
    .join("");
  return sha256(Buffer.from(inventory, "utf8"));
}

export function verifyFrozenTree({
  root = repositoryRoot,
  baseContract,
  expectedTreeSha256 = FROZEN_V1_TREE_SHA256,
}) {
  assertSafeRelativePath(baseContract.tree, "baseContract.tree");
  const treeRoot = resolve(root, baseContract.tree);
  assert.ok(
    treeRoot.startsWith(`${resolve(root)}${sep}`),
    "Frozen V1 tree escapes the repository root.",
  );
  const actualFiles = calculateTreeInventory(treeRoot);
  assert.deepEqual(
    actualFiles,
    baseContract.files,
    "Frozen OpenAI 1.0.0 package tree changed byte-for-byte.",
  );
  const actualTreeSha256 = calculateReviewFreezeTreeSha256(actualFiles);
  assert.equal(
    baseContract.treeDigestAlgorithm,
    REVIEW_FREEZE_TREE_DIGEST_ALGORITHM,
    "Candidate descriptor must use the official review-freeze tree digest algorithm.",
  );
  assert.equal(
    baseContract.treeSha256,
    expectedTreeSha256,
    "Candidate descriptor does not name the frozen OpenAI 1.0.0 tree digest.",
  );
  assert.equal(
    actualTreeSha256,
    expectedTreeSha256,
    "Frozen OpenAI 1.0.0 package tree digest changed.",
  );
  return actualTreeSha256;
}

export function verifyDescriptor(descriptor) {
  assert.equal(descriptor.schemaVersion, 1);
  assert.equal(descriptor.pluginIdentity, "skillpilot-coach-v1");
  assert.equal(descriptor.candidateVersion, "1.1.0");
  assert.equal(descriptor.status, "LOCAL_CANDIDATE_ONLY");

  assert.equal(descriptor.baseContract.version, "1.0.0");
  assert.equal(
    descriptor.baseContract.tree,
    "ai/openai plugin/skillpilot-coach-v1",
  );
  assert.equal(
    descriptor.baseContract.mcpContractSha256,
    FROZEN_V1_CONTRACT_SHA256,
  );
  assert.equal(
    descriptor.baseContract.treeDigestAlgorithm,
    REVIEW_FREEZE_TREE_DIGEST_ALGORITHM,
  );
  assert.equal(descriptor.baseContract.treeSha256, FROZEN_V1_TREE_SHA256);
  assert.ok(Array.isArray(descriptor.baseContract.files));
  assert.ok(descriptor.baseContract.files.length > 0);
  for (const [index, entry] of descriptor.baseContract.files.entries()) {
    assertSafeRelativePath(entry.path, `baseContract.files[${index}].path`);
    assert.ok(Number.isSafeInteger(entry.bytes) && entry.bytes >= 0);
    assert.match(entry.sha256, /^[0-9a-f]{64}$/u);
  }

  assert.deepEqual(descriptor.featureGate, {
    property: "skillpilot.openai.coach.v1.daily-plan-tools-enabled",
    defaultEnabled: false,
  });
  assert.deepEqual(descriptor.candidateArtifacts, {
    skill: {
      path: "SKILL.md",
      bytes: 2789,
      sha256: "f5cbe1ab953a29a58f6eede54432f2643dada6eb9ec1591294403850fbb65849",
    },
    releaseNotes: "release-notes.md",
  });
  assert.deepEqual(descriptor.toolSurface, {
    disabledToolCount: 12,
    enabledToolCount: 14,
    addedTools: [
      "get_skillpilot_daily_plan",
      "resume_skillpilot_learning_plan",
    ],
  });
  assert.deepEqual(descriptor.runtimeProof, {
    gradleProject: "backend",
    testClass: RUNTIME_TEST_CLASS,
  });
  assert.deepEqual(descriptor.activation, {
    productionEnabled: false,
    prepareAllowed: false,
    publishAllowed: false,
    portalMutationAllowed: false,
    reviewFreezeLifted: false,
  });
  return descriptor;
}

export function loadAndVerifyCandidate(root = repositoryRoot) {
  const rootCandidate = resolve(
    root,
    "ai/openai candidates/skillpilot-coach-v1/1.1.0",
  );
  const frozenRoot = resolve(root, "ai/openai plugin/skillpilot-coach-v1");
  assert.equal(
    rootCandidate === frozenRoot || rootCandidate.startsWith(`${frozenRoot}${sep}`),
    false,
    "The 1.1.0 candidate must stay outside the frozen OpenAI plugin tree.",
  );
  const descriptor = verifyDescriptor(JSON.parse(
    readFileSync(resolve(rootCandidate, "candidate.json"), "utf8"),
  ));
  verifyFrozenTree({ root, baseContract: descriptor.baseContract });
  const skillPath = resolve(rootCandidate, descriptor.candidateArtifacts.skill.path);
  assert.equal(
    skillPath.startsWith(`${rootCandidate}${sep}`),
    true,
    "Candidate SKILL escapes the local candidate tree.",
  );
  const skillBytes = readFileSync(skillPath);
  assert.equal(skillBytes.length, descriptor.candidateArtifacts.skill.bytes);
  assert.equal(sha256(skillBytes), descriptor.candidateArtifacts.skill.sha256);
  const skill = skillBytes.toString("utf8");
  const contextIndex = skill.indexOf("`get_skillpilot_context`");
  const visualizationIndex = skill.indexOf("`render_skillpilot_goal_visualization`");
  const dailyPlanIndex = skill.indexOf("`get_skillpilot_daily_plan`");
  const resumeIndex = skill.indexOf("`resume_skillpilot_learning_plan`");
  const learnerSummaryIndex = skill.indexOf("briefly tell the learner");
  assert.ok(contextIndex >= 0, "Candidate SKILL must load context first.");
  assert.ok(
    visualizationIndex > contextIndex,
    "Candidate SKILL must inspect context before rendering a visualization.",
  );
  assert.ok(
    dailyPlanIndex > visualizationIndex,
    "Candidate SKILL must render a due visualization before reading the daily plan.",
  );
  assert.ok(
    resumeIndex > dailyPlanIndex,
    "Candidate SKILL must inspect the daily plan before deciding whether to resume it.",
  );
  assert.ok(
    learnerSummaryIndex > resumeIndex,
    "Candidate SKILL must resume an available plan before giving the learner-facing daily summary.",
  );
  assert.ok(
    skill.includes("Do not call `get_skillpilot_daily_plan` first."),
    "Candidate SKILL must state the visualization-before-daily-plan gate explicitly.",
  );
  assert.ok(
    skill.includes("but do not give a learner-facing response yet.")
      && skill.includes("before any learner-facing response."),
    "Candidate SKILL must keep both the initial and resumed context flow silent until immediate tool calls finish.",
  );
  const releaseNotesPath = resolve(
    rootCandidate,
    descriptor.candidateArtifacts.releaseNotes,
  );
  assert.equal(
    releaseNotesPath.startsWith(`${rootCandidate}${sep}`),
    true,
    "Candidate release notes escape the local candidate tree.",
  );
  assert.ok(readFileSync(releaseNotesPath, "utf8").includes("lokaler Kandidat 1.1.0"));
  return descriptor;
}

export function verifyRuntimeContract(root = repositoryRoot) {
  const backendRoot = resolve(root, "backend");
  const result = spawnSync(
    resolve(backendRoot, "gradlew"),
    ["test", "--tests", RUNTIME_TEST_CLASS],
    {
      cwd: backendRoot,
      encoding: "utf8",
      stdio: "inherit",
    },
  );
  assert.equal(
    result.error,
    undefined,
    `Could not run the OpenAI 1.1.0 runtime proof: ${result.error?.message}`,
  );
  assert.equal(
    result.status,
    0,
    `OpenAI 1.1.0 runtime proof failed with exit code ${result.status}.`,
  );
}

export function checkOpenAiCoachV11Candidate(root = repositoryRoot) {
  const descriptor = loadAndVerifyCandidate(root);
  verifyRuntimeContract(root);
  return descriptor;
}

const isMain = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isMain) {
  const descriptor = checkOpenAiCoachV11Candidate();
  console.log(
    "OpenAI Coach local 1.1.0 candidate check passed: "
      + `frozen_v1_tree=${descriptor.baseContract.treeSha256} `
      + `tree_digest_algorithm=${descriptor.baseContract.treeDigestAlgorithm} `
      + `default_enabled=${descriptor.featureGate.defaultEnabled} `
      + `tools=${descriptor.toolSurface.disabledToolCount}->`
      + `${descriptor.toolSurface.enabledToolCount}`,
  );
}
