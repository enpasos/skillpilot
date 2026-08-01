import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import {
  advancePublishedIndex,
  assertBehavioralReviewApproved,
  assertExactReleaseTree,
  assertReleaseCompatible,
  assertSuccessorVersionClassification,
  determineReleaseVerificationMode,
  internalDraftLabel,
  listFiles,
  loadReleaseContract,
  validatePublishedIndex,
} from "./lib/openai_plugin_contract_compatibility.mjs";
import {
  createReproducibleTrackedArchive,
} from "./lib/reproducible_plugin_archive.mjs";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pluginRoot = resolve(
  repositoryRoot,
  "ai/openai plugin/skillpilot-coach-de-v1",
);
const manifest = readJson(resolve(pluginRoot, ".codex-plugin/plugin.json"));
const line = readJson(resolve(pluginRoot, "release/line.json"));
const releaseIndexPath = resolve(
  repositoryRoot,
  "contracts/openai",
  line.pluginIdentity,
  "release-index.json",
);
const releaseIndex = readJson(releaseIndexPath);
const draftRoot = resolve(
  repositoryRoot,
  "contracts/drafts/openai",
  line.pluginIdentity,
);
const draftLabel = internalDraftLabel(manifest.version);
const draftVersion = resolve(draftRoot, draftLabel);
const publishedRoot = resolve(
  repositoryRoot,
  "contracts/published/openai",
  line.pluginIdentity,
);
const publishedVersion = resolve(publishedRoot, manifest.version);
validatePublishedIndex(
  releaseIndex,
  line.pluginIdentity,
  line.contractMajor,
);
const currentBaseline =
  releaseIndex.baselinePath === null
    ? null
    : resolve(repositoryRoot, releaseIndex.baselinePath);
if (currentBaseline !== null) {
  assert.equal(
    currentBaseline.startsWith(`${publishedRoot}/`),
    true,
    "Published baselinePath escapes the plugin release directory.",
  );
}
const verificationMode = determineReleaseVerificationMode(
  manifest.version,
  releaseIndex,
);
const tmpRoot = resolve(repositoryRoot, "tmp");
const goalVisualizationWidgetSource = resolve(
  repositoryRoot,
  "backend/src/main/resources/openai/skillpilot-goal-visualization-v1.html",
);

const command = process.argv[2];
if (!new Set(["candidate", "prepare", "verify", "record-published"]).has(command)) {
  throw new Error(
    "Usage: node scripts/openai_plugin_release.mjs <candidate|prepare|verify|record-published> [--confirm-openai-published]",
  );
}
if (
  command === "record-published" &&
  !process.argv.includes("--confirm-openai-published")
) {
  throw new Error(
    "record-published requires --confirm-openai-published after the OpenAI portal publication has actually completed.",
  );
}

mkdirSync(tmpRoot, { recursive: true });
const workRoot = mkdtempSync(resolve(tmpRoot, "openai-plugin-release-v1-"));
const candidate = resolve(workRoot, manifest.version);

try {
  buildCandidate(candidate);
  validateCandidate(candidate);
  if (verificationMode === "compatible-successor") {
    assert.equal(
      currentBaseline !== null && existsSync(currentBaseline),
      true,
      `Missing current published baseline ${relative(repositoryRoot, currentBaseline)}`,
    );
    assertReleaseCompatible(currentBaseline, candidate);
    const surfaceChanges = assertSuccessorVersionClassification(
      releaseIndex.latestPublishedVersion,
      manifest.version,
      currentBaseline,
      candidate,
    );
    assertBehavioralReviewApproved(
      surfaceChanges,
      readFileSync(resolve(candidate, "release-notes.md"), "utf8"),
      releaseIndex.latestPublishedVersion,
      manifest.version,
    );
    printSurfaceChangeReport(surfaceChanges);
  }
  if (verificationMode === "exact-published") {
    assert.equal(
      currentBaseline !== null && existsSync(currentBaseline),
      true,
      `Missing published baseline ${relative(repositoryRoot, currentBaseline)}`,
    );
    assertExactReleaseTree(candidate, currentBaseline);
  }
  if (command === "candidate") {
    const output = resolve(
      tmpRoot,
      `${line.pluginIdentity}-${manifest.version}-candidate`,
    );
    if (existsSync(output)) {
      rmSync(output, { recursive: true, force: true });
    }
    cpSync(candidate, output, { recursive: true });
    const candidateKind =
      verificationMode === "initial-draft"
        ? "Initial"
        : verificationMode === "exact-published"
          ? "Published"
          : "Compatible";
    const candidateLabel =
      verificationMode === "exact-published" ? manifest.version : draftLabel;
    console.log(
      `${candidateKind} candidate ${candidateLabel} created at ${relative(repositoryRoot, output)}`,
    );
  } else if (command === "prepare") {
    if (verificationMode === "exact-published") {
      throw new Error(
        `Version ${manifest.version} is already published and immutable. Start a new package version before preparing another draft.`,
      );
    }
    mkdirSync(draftRoot, { recursive: true });
    if (existsSync(draftVersion)) {
      rmSync(draftVersion, { recursive: true, force: true });
    }
    cpSync(candidate, draftVersion, { recursive: true });
    console.log(
      `Internal V1 release draft ${draftLabel} refreshed at ${relative(repositoryRoot, draftVersion)}`,
    );
  } else if (command === "verify") {
    if (verificationMode === "exact-published") {
      console.log(
        `OpenAI plugin V1 release exactly matches published version ${releaseIndex.latestPublishedVersion}`,
      );
    } else {
      assert.equal(
        existsSync(draftVersion),
        true,
        `Missing internal draft ${draftLabel} at ${relative(repositoryRoot, draftVersion)}. ` +
          "Run prepare locally, review the result, and commit it before deployment.",
      );
      assertInternalDraftTree(candidate, draftVersion);
      console.log(
        `OpenAI plugin V1 sources exactly match internal draft ${draftLabel}`,
      );
    }
  } else {
    assert.notEqual(
      verificationMode,
      "exact-published",
      `Version ${manifest.version} is already recorded as published.`,
    );
    assert.equal(
      existsSync(draftVersion),
      true,
      `Missing internal draft ${draftLabel} at ${relative(repositoryRoot, draftVersion)}. ` +
        "Run prepare locally, review the result, and commit it first.",
    );
    assertInternalDraftTree(candidate, draftVersion);
    assert.equal(
      existsSync(publishedVersion),
      false,
      `Published baseline already exists: ${relative(repositoryRoot, publishedVersion)}`,
    );
    mkdirSync(publishedRoot, { recursive: true });
    cpSync(draftVersion, publishedVersion, { recursive: true });
    const nextIndex = advancePublishedIndex(
      releaseIndex,
      manifest.version,
      relative(repositoryRoot, publishedVersion).replaceAll("\\", "/"),
    );
    writeJson(releaseIndexPath, nextIndex);
    console.log(
      `Recorded actually published V1 baseline at ${relative(repositoryRoot, publishedVersion)}`,
    );
  }
} finally {
  rmSync(workRoot, { recursive: true, force: true });
}

function buildCandidate(output) {
  mkdirSync(output, { recursive: true });
  const contractOutput = resolve(output, "contract");
  run(
    resolve(repositoryRoot, "backend/gradlew"),
    [
      "-p",
      resolve(repositoryRoot, "backend"),
      "exportOpenAiDeV1Contract",
      `-PoutputDir=${contractOutput}`,
    ],
    repositoryRoot,
  );
  for (const requiredContractFile of [
    "contract.json",
    "error-catalog.json",
    "resources-list.json",
    "security-schemes.json",
    "server-instructions.txt",
    "tools-list.json",
  ]) {
    assert.equal(
      existsSync(resolve(contractOutput, requiredContractFile)),
      true,
      `Contract exporter did not create contract/${requiredContractFile}.`,
    );
  }

  cpSync(
    resolve(pluginRoot, ".codex-plugin/plugin.json"),
    resolve(output, "plugin.json"),
  );
  cpSync(resolve(pluginRoot, ".app.json"), resolve(output, "app.json"));
  cpSync(resolve(pluginRoot, ".mcp.json"), resolve(output, "mcp.json"));
  cpSync(resolve(pluginRoot, "release/line.json"), resolve(output, "line.json"));
  cpSync(
    resolve(pluginRoot, "release/lifecycle.json"),
    resolve(output, "lifecycle.json"),
  );
  cpSync(
    resolve(pluginRoot, `release-notes/${manifest.version}.md`),
    resolve(output, "release-notes.md"),
  );
  cpSync(
    resolve(pluginRoot, "assets"),
    resolve(output, "assets"),
    { recursive: true },
  );
  assert.equal(
    existsSync(goalVisualizationWidgetSource),
    true,
    "Missing built goal-visualization MCP UI resource. Run npm --prefix \"ai/openai app\" run build.",
  );
  const uiArtifactPath = resolve(output, "ui/goal-visualization.html");
  mkdirSync(dirname(uiArtifactPath), { recursive: true });
  cpSync(goalVisualizationWidgetSource, uiArtifactPath);

  const skillRoot = resolve(pluginRoot, "skills");
  const skillBundle = bundleManifest(skillRoot);
  writeJson(resolve(output, "skills-bundle.json"), skillBundle);
  writeFileSync(
    resolve(output, "skills-bundle.sha256"),
    `${sha256(Buffer.from(canonicalJson(skillBundle)))}\n`,
  );

  const uiManifest = {
    schemaVersion: line.ui.stateSchemaVersion,
    domain: line.ui.domain,
    enabled: line.ui.enabled,
    resources: line.ui.resources.map((resource) => {
      const artifact = resolve(output, resource.path);
      assert.equal(
        artifact.startsWith(`${output}/`),
        true,
        `UI resource path escapes release snapshot: ${resource.path}`,
      );
      assert.equal(
        existsSync(artifact),
        true,
        `UI resource artifact is missing: ${resource.path}`,
      );
      return {
        ...resource,
        sha256: sha256(readFileSync(artifact)),
      };
    }),
  };
  writeJson(resolve(output, "ui-manifest.json"), uiManifest);

  const archive = resolve(
    output,
    `${line.pluginIdentity}-${manifest.version}.tar`,
  );
  createReproducibleTrackedArchive({
    repositoryRoot,
    sourceRoot: pluginRoot,
    archivePath: archive,
  });

  const files = listFiles(output)
    .filter((path) => path !== "snapshot-manifest.json")
    .map((path) => ({
      path,
      bytes: statSync(resolve(output, path)).size,
      sha256: sha256(readFileSync(resolve(output, path))),
    }));
  writeJson(resolve(output, "snapshot-manifest.json"), {
    schemaVersion: 1,
    pluginIdentity: line.pluginIdentity,
    pluginVersion: manifest.version,
    contractMajor: line.contractMajor,
    files,
  });
}

function validateCandidate(output) {
  const releaseContract = loadReleaseContract(output);
  const contract = releaseContract.contract;
  const candidatePlugin = readJson(resolve(output, "plugin.json"));
  const candidateLine = readJson(resolve(output, "line.json"));
  const snapshot = readJson(resolve(output, "snapshot-manifest.json"));
  assert.equal(
    candidatePlugin.name,
    releaseIndex.pluginIdentity,
    "Candidate plugin identity disagrees with published index.",
  );
  assert.equal(
    candidatePlugin.version,
    manifest.version,
    "Candidate plugin version disagrees with source manifest.",
  );
  assert.equal(
    candidateLine.pluginIdentity,
    releaseIndex.pluginIdentity,
    "Candidate release line identity disagrees with published index.",
  );
  assert.equal(
    candidateLine.contractMajor,
    releaseIndex.contractMajor,
    "Candidate release line major disagrees with published index.",
  );
  assert.equal(
    contract.pluginIdentity,
    releaseIndex.pluginIdentity,
    "Exported contract identity disagrees with published index.",
  );
  assert.equal(
    contract.contractMajor,
    releaseIndex.contractMajor,
    "Exported contract major disagrees with published index.",
  );
  assert.equal(
    releaseContract.errorCatalog.contractMajor,
    releaseIndex.contractMajor,
    "Exported error catalog major disagrees with published index.",
  );
  assert.equal(
    snapshot.pluginIdentity,
    releaseIndex.pluginIdentity,
    "Snapshot identity disagrees with published index.",
  );
  assert.equal(
    snapshot.pluginVersion,
    manifest.version,
    "Snapshot version disagrees with source manifest.",
  );
  assert.equal(
    snapshot.contractMajor,
    releaseIndex.contractMajor,
    "Snapshot major disagrees with published index.",
  );
  assert.equal(
    releaseContract.uiManifest.enabled,
    true,
    "The V1 goal-visualization MCP UI must be enabled.",
  );
  assert.equal(
    releaseContract.uiManifest.domain,
    candidateLine.ui.domain,
    "The exported MCP UI widget domain must match the V1 release line.",
  );
  assert.equal(
    Object.hasOwn(candidateLine, "publicUiOrigin"),
    false,
    "The V1 release line must use ui.domain rather than the retired publicUiOrigin field.",
  );
  assert.deepEqual(
    releaseContract.resources.map((resource) => ({
      mimeType: resource.mimeType,
      path: resource.path,
      uri: resource.uri,
    })),
    candidateLine.ui.resources,
    "Exported MCP resources disagree with the release line.",
  );
  assert.deepEqual(
    releaseContract.uiManifest.resources.map((resource) => ({
      mimeType: resource.mimeType,
      path: resource.path,
      uri: resource.uri,
    })),
    candidateLine.ui.resources,
    "UI manifest resources disagree with the release line.",
  );
  for (const resource of releaseContract.uiManifest.resources) {
    assert.equal(
      resource.sha256,
      resource.__artifactSha256,
      `UI manifest hash disagrees with ${resource.path}.`,
    );
  }
  for (const assetPath of [
    candidatePlugin.interface?.composerIcon,
    candidatePlugin.interface?.logo,
  ]) {
    assert.match(
      assetPath,
      /^\.\/assets\/[^/]+$/,
      "Plugin icon and logo must use a direct path below ./assets/.",
    );
    assert.equal(
      existsSync(resolve(output, assetPath)),
      true,
      `Snapshot is missing referenced plugin asset ${assetPath}.`,
    );
  }
}

function printSurfaceChangeReport(changes) {
  console.log("OpenAI V1 public-surface diff:");
  if (changes.minorRequired.length === 0) {
    console.log("- no additive capability requiring MINOR");
  } else {
    for (const change of changes.minorRequired) {
      console.log(`- MINOR: ${change}`);
    }
  }
  if (changes.reviewRequired.length === 0) {
    console.log("- no behavioural text change requiring release review");
  } else {
    for (const change of changes.reviewRequired) {
      console.log(`- REVIEW: ${change}`);
    }
  }
}

function assertInternalDraftTree(candidateRoot, expectedDraftRoot) {
  try {
    assertExactReleaseTree(candidateRoot, expectedDraftRoot);
  } catch (error) {
    if (error instanceof Error) {
      error.message +=
        `\nThe internal draft ${draftLabel} is read-only during deployment. ` +
        "If the source change is intentional, run " +
        "`node scripts/openai_plugin_release.mjs prepare` locally, review the " +
        "result, and commit it before deploying.";
    }
    throw error;
  }
}

function bundleManifest(root) {
  return {
    schemaVersion: 1,
    files: listFiles(root).map((path) => ({
      path,
      bytes: statSync(resolve(root, path)).size,
      sha256: sha256(readFileSync(resolve(root, path))),
    })),
  };
}

function run(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `${executable} failed (${result.status}):\n${result.stdout}\n${result.stderr}`,
    );
  }
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  writeFileSync(path, `${canonicalJson(value)}\n`);
}

function canonicalJson(value) {
  return JSON.stringify(sortValue(value), null, 2);
}

function sortValue(value) {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, sortValue(child)]),
    );
  }
  return value;
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}
