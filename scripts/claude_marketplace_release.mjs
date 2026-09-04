import { createHash } from "node:crypto";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { buildClaudePluginPackage } from "../ai/claude/plugin/skillpilot-coach-v1/build-package.mjs";
import {
  publicationFiles,
  validateClaudePluginPackage,
} from "../ai/claude/plugin/skillpilot-coach-v1/check-package.mjs";
import { loadDirectInstallBetaLane } from "./claude_direct_install_beta_release.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = resolve(dirname(scriptPath), "..");
const laneRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/release/marketplace-publication.json";
const defaultOutputRelativePath =
  "tmp/claude-marketplace/skillpilot-claude-marketplace";
const marketplaceManifestOutputPath = ".claude-plugin/marketplace.json";
const templateOutputFiles = new Map([
  ["marketplace.json", marketplaceManifestOutputPath],
  ["README.md", "README.md"],
  ["CHANGELOG.md", "CHANGELOG.md"],
  ["validate.yml", ".github/workflows/validate.yml"],
]);
const expectedExternalEvidence = [
  "public-repository-default-branch",
  "clean-account-marketplace-install",
  "uploaded-plugin-migration-and-marketplace-refresh",
];
const expectedRepositoryName = "skillpilot-claude-marketplace";
const compareCodeUnits = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

export function loadClaudeMarketplaceLane(
  repositoryRoot = defaultRepositoryRoot,
) {
  const lanePath = resolveWithin(
    repositoryRoot,
    laneRelativePath,
    "Claude marketplace lane",
  );
  assertRegularFile(lanePath, "Claude marketplace lane");
  const lane = readJson(lanePath, "Claude marketplace lane");
  validateClaudeMarketplaceLane(lane);
  return lane;
}

export function validateClaudeMarketplaceLane(lane) {
  assertRecord(lane, "Claude marketplace lane");
  assertExactKeys(
    lane,
    ["schemaVersion", "lane", "target", "source", "plugin", "activation"],
    "Claude marketplace lane",
  );
  assertEqual(lane.schemaVersion, 1, "lane.schemaVersion");
  assertEqual(lane.lane, "personal_git_marketplace", "lane.lane");

  assertRecord(lane.target, "lane.target");
  assertExactKeys(
    lane.target,
    ["repository", "repositoryUrl", "defaultBranch", "marketplaceName"],
    "lane.target",
  );
  assertEqual(
    lane.target.repository,
    "enpasos/skillpilot-claude-marketplace",
    "lane.target.repository",
  );
  assertEqual(
    lane.target.repositoryUrl,
    `https://github.com/${lane.target.repository}`,
    "lane.target.repositoryUrl",
  );
  assertEqual(lane.target.defaultBranch, "main", "lane.target.defaultBranch");
  assertKebabCase(lane.target.marketplaceName, "lane.target.marketplaceName");

  assertRecord(lane.source, "lane.source");
  assertExactKeys(
    lane.source,
    ["templateRoot", "pluginRoot", "licenseFile", "publicationFiles"],
    "lane.source",
  );
  assertEqual(
    lane.source.templateRoot,
    "ai/claude/marketplace/skillpilot-marketplace",
    "lane.source.templateRoot",
  );
  assertEqual(
    lane.source.pluginRoot,
    "ai/claude/plugin/skillpilot-coach-v1",
    "lane.source.pluginRoot",
  );
  assertEqual(lane.source.licenseFile, "LICENSE", "lane.source.licenseFile");
  assertJsonEqual(
    lane.source.publicationFiles,
    publicationFiles,
    "lane.source.publicationFiles must remain the package allowlist",
  );

  assertRecord(lane.plugin, "lane.plugin");
  assertExactKeys(
    lane.plugin,
    ["name", "source", "version", "directInstallSha256"],
    "lane.plugin",
  );
  assertEqual(lane.plugin.name, "skillpilot-coach-v1", "lane.plugin.name");
  assertEqual(
    lane.plugin.source,
    `./plugins/${lane.plugin.name}`,
    "lane.plugin.source",
  );
  assertSemanticVersion(lane.plugin.version, "lane.plugin.version");
  if (!/^[0-9a-f]{64}$/u.test(lane.plugin.directInstallSha256)) {
    throw new Error("lane.plugin.directInstallSha256 must be a lowercase SHA-256 digest.");
  }

  assertRecord(lane.activation, "lane.activation");
  assertExactKeys(
    lane.activation,
    [
      "state",
      "firstPartyUiRoute",
      "marketplaceUiSwitchAllowed",
      "firstPartyGuideDecision",
      "evidence",
    ],
    "lane.activation",
  );
  assertOneOf(
    lane.activation.state,
    [
      "prepared_not_published",
      "published_pending_acceptance",
      "published_verified",
    ],
    "lane.activation.state",
  );
  assertOneOf(
    lane.activation.firstPartyUiRoute,
    ["controlled_direct_install_beta", "personal_git_marketplace"],
    "lane.activation.firstPartyUiRoute",
  );
  assertBoolean(
    lane.activation.marketplaceUiSwitchAllowed,
    "lane.activation.marketplaceUiSwitchAllowed",
  );
  assertRecord(
    lane.activation.firstPartyGuideDecision,
    "lane.activation.firstPartyGuideDecision",
  );
  assertExactKeys(
    lane.activation.firstPartyGuideDecision,
    [
      "status",
      "approvedAt",
      "approvedBy",
      "candidateVersion",
      "candidateSha256",
      "repositoryRevision",
      "repositoryTreeSha256",
      "evidenceRef",
    ],
    "lane.activation.firstPartyGuideDecision",
  );
  const guideDecision = lane.activation.firstPartyGuideDecision;
  assertOneOf(
    guideDecision.status,
    ["pending", "approved"],
    "lane.activation.firstPartyGuideDecision.status",
  );
  if (guideDecision.status === "pending") {
    for (const field of [
      "approvedAt",
      "approvedBy",
      "candidateVersion",
      "candidateSha256",
      "repositoryRevision",
      "repositoryTreeSha256",
      "evidenceRef",
    ]) {
      assertEqual(
        guideDecision[field],
        null,
        `pending first-party guide decision ${field}`,
      );
    }
  } else {
    assertCanonicalTimestamp(
      guideDecision.approvedAt,
      "lane.activation.firstPartyGuideDecision.approvedAt",
    );
    assertEqual(
      guideDecision.approvedBy,
      "product-owner",
      "lane.activation.firstPartyGuideDecision.approvedBy",
    );
    assertEqual(
      guideDecision.candidateVersion,
      lane.plugin.version,
      "lane.activation.firstPartyGuideDecision.candidateVersion",
    );
    assertEqual(
      guideDecision.candidateSha256,
      lane.plugin.directInstallSha256,
      "lane.activation.firstPartyGuideDecision.candidateSha256",
    );
    if (!/^[0-9a-f]{40}$/u.test(guideDecision.repositoryRevision ?? "")) {
      throw new Error(
        "lane.activation.firstPartyGuideDecision.repositoryRevision must be a full lowercase Git SHA.",
      );
    }
    if (!/^[0-9a-f]{64}$/u.test(guideDecision.repositoryTreeSha256 ?? "")) {
      throw new Error(
        "lane.activation.firstPartyGuideDecision.repositoryTreeSha256 must be a lowercase SHA-256 digest.",
      );
    }
    assertNonEmptyString(
      guideDecision.evidenceRef,
      "lane.activation.firstPartyGuideDecision.evidenceRef",
    );
  }
  if (!Array.isArray(lane.activation.evidence)) {
    throw new Error("lane.activation.evidence must be an array.");
  }
  assertJsonEqual(
    lane.activation.evidence.map(({ id }) => id),
    expectedExternalEvidence,
    "lane.activation.evidence identifiers",
  );
  for (const evidence of lane.activation.evidence) {
    assertRecord(evidence, `lane.activation.evidence ${String(evidence?.id)}`);
    assertExactKeys(
      evidence,
      [
        "id",
        "status",
        "revision",
        "treeSha256",
        "candidateVersion",
        "candidateSha256",
        "verifiedAt",
        "evidenceRef",
      ],
      `lane.activation.evidence ${evidence.id}`,
    );
    assertOneOf(
      evidence.status,
      ["pending", "pass"],
      `lane.activation.evidence ${evidence.id}.status`,
    );
    if (evidence.status === "pending") {
      for (const field of [
        "revision",
        "treeSha256",
        "candidateVersion",
        "candidateSha256",
        "verifiedAt",
        "evidenceRef",
      ]) {
        assertEqual(
          evidence[field],
          null,
          `pending evidence ${evidence.id}.${field}`,
        );
      }
    } else {
      if (!/^[0-9a-f]{40}$/u.test(evidence.revision ?? "")) {
        throw new Error(
          `passing evidence ${evidence.id}.revision must be a full lowercase Git SHA.`,
        );
      }
      if (!/^[0-9a-f]{64}$/u.test(evidence.treeSha256 ?? "")) {
        throw new Error(
          `passing evidence ${evidence.id}.treeSha256 must be a lowercase SHA-256 digest.`,
        );
      }
      assertEqual(
        evidence.candidateVersion,
        lane.plugin.version,
        `passing evidence ${evidence.id}.candidateVersion`,
      );
      assertEqual(
        evidence.candidateSha256,
        lane.plugin.directInstallSha256,
        `passing evidence ${evidence.id}.candidateSha256`,
      );
      assertCanonicalTimestamp(
        evidence.verifiedAt,
        `passing evidence ${evidence.id}.verifiedAt`,
      );
      assertNonEmptyString(
        evidence.evidenceRef,
        `passing evidence ${evidence.id}.evidenceRef`,
      );
    }
  }
  const passingEvidence = lane.activation.evidence.filter(
    ({ status }) => status === "pass",
  );
  if (
    passingEvidence.some(
      ({ revision }) => revision !== passingEvidence[0]?.revision,
    )
  ) {
    throw new Error("All passing marketplace evidence must reference one Git revision.");
  }
  if (
    passingEvidence.some(
      ({ treeSha256 }) => treeSha256 !== passingEvidence[0]?.treeSha256,
    )
  ) {
    throw new Error("All passing marketplace evidence must reference one tree SHA-256.");
  }
  const repositoryPublished =
    lane.activation.evidence[0]?.status === "pass";
  const guideSwitchApproved = guideDecision.status === "approved";
  if (guideSwitchApproved) {
    assertEqual(
      repositoryPublished,
      true,
      "Approved first-party marketplace guidance requires a verified public repository",
    );
    assertEqual(
      guideDecision.repositoryRevision,
      lane.activation.evidence[0].revision,
      "first-party guide decision and repository evidence revision",
    );
    assertEqual(
      guideDecision.repositoryTreeSha256,
      lane.activation.evidence[0].treeSha256,
      "first-party guide decision and repository evidence tree SHA-256",
    );
  }
  const expectedUiSwitch = repositoryPublished && guideSwitchApproved;
  const allEvidencePassed =
    passingEvidence.length === expectedExternalEvidence.length;
  const expectedState = allEvidencePassed
    ? "published_verified"
    : repositoryPublished
      ? "published_pending_acceptance"
      : "prepared_not_published";
  assertEqual(
    lane.activation.state,
    expectedState,
    "lane.activation.state must be derived from revision-bound evidence",
  );
  assertEqual(
    lane.activation.marketplaceUiSwitchAllowed,
    expectedUiSwitch,
    "lane.activation.marketplaceUiSwitchAllowed must be derived from repository verification and the Product Owner guide decision",
  );
  assertEqual(
    lane.activation.firstPartyUiRoute,
    expectedUiSwitch
      ? "personal_git_marketplace"
      : "controlled_direct_install_beta",
    "lane.activation.firstPartyUiRoute must match the approved first-party guide decision",
  );
}

export function validateClaudeMarketplaceManifest(
  marketplace,
  lane,
  pluginManifest,
) {
  validateClaudeMarketplaceLane(lane);
  assertRecord(marketplace, "marketplace.json");
  assertExactKeys(
    marketplace,
    ["$schema", "name", "description", "owner", "plugins"],
    "marketplace.json",
  );
  assertEqual(
    marketplace.$schema,
    "https://json.schemastore.org/claude-code-marketplace.json",
    "marketplace.json.$schema",
  );
  assertEqual(
    marketplace.name,
    lane.target.marketplaceName,
    "marketplace.json.name",
  );
  assertNonEmptyString(marketplace.description, "marketplace.json.description");
  if (Object.hasOwn(marketplace, "version")) {
    throw new Error("marketplace.json must not duplicate the plugin version.");
  }

  assertRecord(marketplace.owner, "marketplace.json.owner");
  assertExactKeys(
    marketplace.owner,
    ["name", "email", "url"],
    "marketplace.json.owner",
  );
  assertEqual(
    marketplace.owner.name,
    "enpasos - Enterprise Patterns & Solutions GmbH",
    "marketplace.json.owner.name",
  );
  assertEqual(
    marketplace.owner.email,
    "support@skillpilot.com",
    "marketplace.json.owner.email",
  );
  assertEqual(
    marketplace.owner.url,
    "https://skillpilot.com",
    "marketplace.json.owner.url",
  );

  if (!Array.isArray(marketplace.plugins) || marketplace.plugins.length !== 1) {
    throw new Error("marketplace.json.plugins must contain exactly one plugin.");
  }
  const plugin = marketplace.plugins[0];
  assertRecord(plugin, "marketplace.json.plugins[0]");
  assertExactKeys(
    plugin,
    ["name", "displayName", "source", "description", "strict"],
    "marketplace.json.plugins[0]",
  );
  assertEqual(plugin.name, lane.plugin.name, "marketplace plugin name");
  assertEqual(plugin.displayName, "SkillPilot Coach v1", "marketplace plugin displayName");
  assertEqual(plugin.source, lane.plugin.source, "marketplace plugin source");
  assertNonEmptyString(plugin.description, "marketplace plugin description");
  assertEqual(plugin.strict, true, "marketplace plugin strict mode");
  if (Object.hasOwn(plugin, "version")) {
    throw new Error("marketplace plugin entry must not duplicate plugin.json version.");
  }

  assertRecord(pluginManifest, "plugin.json");
  assertEqual(pluginManifest.name, lane.plugin.name, "plugin.json.name");
  assertEqual(pluginManifest.version, lane.plugin.version, "plugin.json.version");
  assertEqual(plugin.name, pluginManifest.name, "stable marketplace installation name");
}

export function validateMarketplaceCandidateAgainstDirectInstall(
  lane,
  directInstallLane,
) {
  validateClaudeMarketplaceLane(lane);
  assertRecord(directInstallLane, "Direct-install beta lane");
  assertRecord(directInstallLane.candidate, "Direct-install beta candidate");
  assertRecord(directInstallLane.readiness, "Direct-install beta readiness");
  assertEqual(
    lane.plugin.version,
    directInstallLane.candidate.version,
    "marketplace and direct-install candidate version",
  );
  assertEqual(
    lane.plugin.directInstallSha256,
    directInstallLane.candidate.sha256,
    "marketplace and direct-install candidate SHA-256",
  );
  if (
    lane.activation.state === "published_verified"
    && directInstallLane.readiness.openPublicBetaReady !== true
  ) {
    throw new Error(
      "Marketplace activation requires every direct-install open-public-beta blocker to pass.",
    );
  }
}

export function validatePublishedPublicationAgainstEvidence(
  lane,
  { revision, treeSha256 },
) {
  validateClaudeMarketplaceLane(lane);
  if (!/^[0-9a-f]{40}$/u.test(revision ?? "")) {
    throw new Error("Published marketplace revision is not a full Git SHA.");
  }
  validateGeneratedTreeAgainstEvidence(lane, treeSha256);
  const repositoryEvidence = lane.activation.evidence[0];
  if (repositoryEvidence.status === "pass") {
    assertEqual(
      revision,
      repositoryEvidence.revision,
      "published marketplace revision and approved evidence",
    );
  }
}

export function validateGeneratedTreeAgainstEvidence(lane, treeSha256) {
  validateClaudeMarketplaceLane(lane);
  if (!/^[0-9a-f]{64}$/u.test(treeSha256 ?? "")) {
    throw new Error("Generated marketplace tree is not a lowercase SHA-256 digest.");
  }
  const repositoryEvidence = lane.activation.evidence[0];
  if (repositoryEvidence.status === "pass") {
    assertEqual(
      treeSha256,
      repositoryEvidence.treeSha256,
      "generated marketplace tree and approved evidence",
    );
  }
}

export function prepareClaudeMarketplace({
  repositoryRoot = defaultRepositoryRoot,
  outputRoot = resolve(repositoryRoot, defaultOutputRelativePath),
  replaceDefaultOutput = true,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const paths = releasePaths(repositoryRoot, outputRoot);
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  validateSource(paths, lane, buildPackage);
  assertSafeOutputRoot(paths, lane);

  const outputExists = existsSync(paths.outputRoot);
  const isDefaultOutput =
    paths.outputRoot === resolve(repositoryRoot, defaultOutputRelativePath);
  if (outputExists && (!isDefaultOutput || !replaceDefaultOutput)) {
    throw new Error(
      `Refusing to replace an existing non-default marketplace output: ${paths.outputRoot}`,
    );
  }

  mkdirSync(dirname(paths.outputRoot), { recursive: true });
  const stagingParent = mkdtempSync(
    resolve(dirname(paths.outputRoot), ".skillpilot-marketplace-stage-"),
  );
  const stagedRoot = resolve(stagingParent, expectedRepositoryName);
  try {
    writeSnapshot(paths, lane, stagedRoot);
    verifyClaudeMarketplace({
      repositoryRoot,
      marketplaceRoot: stagedRoot,
      buildPackage,
    });
    if (outputExists) {
      rmSync(paths.outputRoot, { recursive: true, force: true });
    }
    renameSync(stagedRoot, paths.outputRoot);
  } finally {
    rmSync(stagingParent, { recursive: true, force: true });
  }

  return verifyClaudeMarketplace({
    repositoryRoot,
    marketplaceRoot: paths.outputRoot,
    buildPackage,
  });
}

export function verifyClaudeMarketplace({
  repositoryRoot = defaultRepositoryRoot,
  marketplaceRoot = resolve(repositoryRoot, defaultOutputRelativePath),
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const paths = releasePaths(repositoryRoot, marketplaceRoot);
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  validateSource(paths, lane, buildPackage);
  assertDirectory(paths.outputRoot, "Marketplace output");

  const expectedFiles = expectedOutputFiles(lane);
  const actualFiles = listRegularFiles(paths.outputRoot, { ignoreDotGit: true });
  assertJsonEqual(actualFiles, expectedFiles, "marketplace output file allowlist");

  for (const [templatePath, outputPath] of templateOutputFiles) {
    assertFileBytesEqual(
      resolve(paths.templateRoot, templatePath),
      resolve(paths.outputRoot, outputPath),
      `generated ${outputPath}`,
    );
  }
  assertFileBytesEqual(
    paths.licensePath,
    resolve(paths.outputRoot, "LICENSE"),
    "generated LICENSE",
  );
  for (const pluginPath of lane.source.publicationFiles) {
    assertFileBytesEqual(
      resolve(paths.pluginRoot, pluginPath),
      resolve(paths.outputPluginRoot, pluginPath),
      `generated plugin file ${pluginPath}`,
    );
  }

  const pluginValidation = validateClaudePluginPackage(paths.outputPluginRoot);
  if (pluginValidation.errors.length > 0) {
    throw new Error(
      `Exported Claude plugin validation failed:\n- ${pluginValidation.errors.join("\n- ")}`,
    );
  }
  const pluginManifest = readJson(
    resolve(paths.outputPluginRoot, ".claude-plugin/plugin.json"),
    "exported plugin.json",
  );
  const marketplace = readJson(
    resolve(paths.outputRoot, marketplaceManifestOutputPath),
    "exported marketplace.json",
  );
  validateClaudeMarketplaceManifest(marketplace, lane, pluginManifest);

  const treeSha256 = digestTree(paths.outputRoot, actualFiles);
  validateGeneratedTreeAgainstEvidence(lane, treeSha256);
  return {
    outputRoot: paths.outputRoot,
    marketplaceName: marketplace.name,
    pluginName: pluginManifest.name,
    version: pluginManifest.version,
    directInstallSha256: lane.plugin.directInstallSha256,
    treeSha256,
    files: actualFiles,
  };
}

export function validateClaudeMarketplaceWithCli({
  repositoryRoot = defaultRepositoryRoot,
  marketplaceRoot = resolve(repositoryRoot, defaultOutputRelativePath),
  runCommand = runCommandChecked,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const verified = verifyClaudeMarketplace({
    repositoryRoot,
    marketplaceRoot,
    buildPackage,
  });
  const pluginRoot = resolve(
    verified.outputRoot,
    "plugins",
    verified.pluginName,
  );
  runCommand("claude", ["plugin", "validate", "--strict", verified.outputRoot]);
  runCommand("claude", ["plugin", "validate", "--strict", pluginRoot]);
  return verified;
}

export function smokeTestLocalClaudeMarketplace({
  repositoryRoot = defaultRepositoryRoot,
  marketplaceRoot = resolve(repositoryRoot, defaultOutputRelativePath),
  marketplaceSource,
  runCommand = runCommandChecked,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const verified = validateClaudeMarketplaceWithCli({
    repositoryRoot,
    marketplaceRoot,
    runCommand,
    buildPackage,
  });
  const temporaryRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-marketplace-install-"),
  );
  const commandOptions = {
    env: {
      ...process.env,
      CLAUDE_CONFIG_DIR: resolve(temporaryRoot, "config"),
    },
  };
  const installSource = marketplaceSource ?? verified.outputRoot;
  try {
    runCommand(
      "claude",
      ["plugin", "marketplace", "add", installSource],
      commandOptions,
    );
    runCommand(
      "claude",
      [
        "plugin",
        "install",
        `${verified.pluginName}@${verified.marketplaceName}`,
        "--scope",
        "user",
      ],
      commandOptions,
    );
    const listed = runCommand(
      "claude",
      ["plugin", "list", "--json"],
      commandOptions,
    );
    let plugins;
    try {
      plugins = JSON.parse(listed.stdout);
    } catch (error) {
      throw new Error(`Claude plugin list is not valid JSON: ${error.message}`);
    }
    if (!Array.isArray(plugins)) {
      throw new Error("Claude plugin list must be a JSON array.");
    }
    const expectedId = `${verified.pluginName}@${verified.marketplaceName}`;
    const installed = plugins.find(({ id }) => id === expectedId);
    if (!installed) {
      throw new Error(`Local marketplace smoke test did not install ${expectedId}.`);
    }
    assertEqual(installed.version, verified.version, "locally installed plugin version");
    assertEqual(installed.enabled, true, "locally installed plugin enabled state");
    assertEqual(
      installed.mcpServers?.skillpilot?.url,
      "https://mcp-claude-v1.skillpilot.com/mcp",
      "locally installed SkillPilot MCP URL",
    );
    return { ...verified, installedId: expectedId };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

export function checkClaudeMarketplace({
  repositoryRoot = defaultRepositoryRoot,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const temporaryRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-marketplace-check-"),
  );
  try {
    const outputRoot = resolve(temporaryRoot, expectedRepositoryName);
    return prepareClaudeMarketplace({
      repositoryRoot,
      outputRoot,
      replaceDefaultOutput: false,
      buildPackage,
    });
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

export function verifyPublishedClaudeMarketplace({
  repositoryRoot = defaultRepositoryRoot,
  repositorySource,
  runCommand = runCommandChecked,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const lane = loadClaudeMarketplaceLane(repositoryRoot);
  const source = repositorySource ?? lane.target.repositoryUrl;
  if (source !== lane.target.repositoryUrl && source !== lane.target.repository) {
    throw new Error("Published marketplace source must match the configured repository.");
  }
  const temporaryRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-marketplace-public-"),
  );
  const checkoutRoot = resolve(temporaryRoot, expectedRepositoryName);
  try {
    runCommand("git", [
      "clone",
      "--depth=1",
      "--single-branch",
      `--branch=${lane.target.defaultBranch}`,
      source,
      checkoutRoot,
    ]);
    const repositoryMetadataOutput = runCommand("gh", [
      "repo",
      "view",
      lane.target.repository,
      "--json",
      "nameWithOwner,url,isPrivate,defaultBranchRef",
    ]).stdout;
    let repositoryMetadata;
    try {
      repositoryMetadata = JSON.parse(repositoryMetadataOutput);
    } catch (error) {
      throw new Error(`GitHub repository metadata is not valid JSON: ${error.message}`);
    }
    assertEqual(
      repositoryMetadata.nameWithOwner,
      lane.target.repository,
      "published marketplace GitHub repository",
    );
    assertEqual(
      repositoryMetadata.url,
      lane.target.repositoryUrl,
      "published marketplace GitHub URL",
    );
    assertEqual(
      repositoryMetadata.isPrivate,
      false,
      "published marketplace repository visibility",
    );
    assertEqual(
      repositoryMetadata.defaultBranchRef?.name,
      lane.target.defaultBranch,
      "published marketplace default branch",
    );
    const verified = validateClaudeMarketplaceWithCli({
      repositoryRoot,
      marketplaceRoot: checkoutRoot,
      runCommand,
      buildPackage,
    });
    const revision = runCommand("git", ["-C", checkoutRoot, "rev-parse", "HEAD"])
      .stdout.trim();
    validatePublishedPublicationAgainstEvidence(lane, {
      revision,
      treeSha256: verified.treeSha256,
    });
    smokeTestLocalClaudeMarketplace({
      repositoryRoot,
      marketplaceRoot: checkoutRoot,
      marketplaceSource: lane.target.repositoryUrl,
      runCommand,
      buildPackage,
    });
    const remoteHead = runCommand("git", [
      "ls-remote",
      lane.target.repositoryUrl,
      `refs/heads/${lane.target.defaultBranch}`,
    ]).stdout.trim().split(/\s+/u)[0];
    assertEqual(
      remoteHead,
      revision,
      "published marketplace default branch must not move during verification",
    );
    return {
      ...verified,
      repositorySource: source,
      revision,
      repositoryVisibility: "public",
    };
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function validateSource(paths, lane, buildPackage) {
  const directInstallLane = loadDirectInstallBetaLane(paths.repositoryRoot);
  validateMarketplaceCandidateAgainstDirectInstall(lane, directInstallLane);
  assertDirectory(paths.templateRoot, "Marketplace template root");
  assertDirectory(paths.pluginRoot, "Claude plugin source root");
  assertRegularFile(paths.licensePath, "Marketplace license source");
  for (const templatePath of templateOutputFiles.keys()) {
    assertRegularFile(
      resolve(paths.templateRoot, templatePath),
      `Marketplace template ${templatePath}`,
    );
  }
  for (const pluginPath of lane.source.publicationFiles) {
    assertRegularFile(
      resolve(paths.pluginRoot, pluginPath),
      `Claude plugin publication file ${pluginPath}`,
    );
  }
  const pluginValidation = validateClaudePluginPackage(paths.pluginRoot);
  if (pluginValidation.errors.length > 0) {
    throw new Error(
      `Claude plugin source validation failed:\n- ${pluginValidation.errors.join("\n- ")}`,
    );
  }
  const pluginManifest = readJson(
    resolve(paths.pluginRoot, ".claude-plugin/plugin.json"),
    "source plugin.json",
  );
  const marketplace = readJson(
    resolve(paths.templateRoot, "marketplace.json"),
    "marketplace template",
  );
  validateClaudeMarketplaceManifest(marketplace, lane, pluginManifest);
  validateMarketplaceTemplates(paths, lane);
  verifyDirectInstallCandidate(paths.pluginRoot, lane, buildPackage);
}

function validateMarketplaceTemplates(paths, lane) {
  const readme = readFileSync(resolve(paths.templateRoot, "README.md"), "utf8");
  const normalizedReadme = readme.replace(/\s+/gu, " ");
  const changelog = readFileSync(
    resolve(paths.templateRoot, "CHANGELOG.md"),
    "utf8",
  );
  const workflow = readFileSync(
    resolve(paths.templateRoot, "validate.yml"),
    "utf8",
  );
  for (const requiredReadmeText of [
    lane.target.repositoryUrl,
    `${lane.plugin.name}@${lane.target.marketplaceName}`,
    "Connect the SkillPilot connector included in the plugin",
    "Do not add a second custom connector or enter an MCP URL manually",
    "return to <https://skillpilot.com/> and start each new learning session",
    "current candidate boundaries and pending exact-client acceptance",
  ]) {
    assertIncludes(
      normalizedReadme,
      requiredReadmeText,
      `Marketplace README contract: ${requiredReadmeText}`,
    );
  }
  if (/official (?:Anthropic|Claude|SkillPilot) marketplace/iu.test(readme)) {
    throw new Error(
      "Marketplace README must not imply an official or Anthropic-curated listing.",
    );
  }
  assertIncludes(
    changelog,
    `## ${lane.plugin.version} -`,
    "Marketplace changelog current version",
  );
  for (const requiredWorkflowText of [
    "@anthropic-ai/claude-code@2.1.241",
    lane.plugin.directInstallSha256,
    `https://skillpilot.com/api/public/claude/plugins/${lane.plugin.name}/${lane.plugin.version}/sha256-${lane.plugin.directInstallSha256}/${lane.plugin.name}-${lane.plugin.version}.plugin`,
    "claude plugin validate --strict .",
    "claude plugin validate --strict ./plugins/skillpilot-coach-v1",
  ]) {
    assertIncludes(
      workflow,
      requiredWorkflowText,
      `Marketplace workflow contract: ${requiredWorkflowText}`,
    );
  }
}

function verifyDirectInstallCandidate(pluginRoot, lane, buildPackage) {
  const temporaryRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-marketplace-package-"),
  );
  try {
    const outputPath = resolve(temporaryRoot, "candidate.plugin");
    const built = buildPackage({ root: pluginRoot, outputPath });
    assertEqual(
      built.sha256,
      lane.plugin.directInstallSha256,
      "marketplace source direct-install SHA-256",
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
}

function releasePaths(repositoryRoot, outputRoot) {
  const root = resolve(repositoryRoot);
  const lane = loadClaudeMarketplaceLane(root);
  return {
    repositoryRoot: root,
    templateRoot: resolveWithin(root, lane.source.templateRoot, "Template root"),
    pluginRoot: resolveWithin(root, lane.source.pluginRoot, "Plugin root"),
    licensePath: resolveWithin(root, lane.source.licenseFile, "License file"),
    outputRoot: resolve(outputRoot),
    outputPluginRoot: resolve(outputRoot, "plugins", lane.plugin.name),
  };
}

function writeSnapshot(paths, lane, stagedRoot) {
  for (const [templatePath, outputPath] of templateOutputFiles) {
    copyRegularFile(
      resolve(paths.templateRoot, templatePath),
      resolve(stagedRoot, outputPath),
    );
  }
  copyRegularFile(paths.licensePath, resolve(stagedRoot, "LICENSE"));
  for (const pluginPath of lane.source.publicationFiles) {
    copyRegularFile(
      resolve(paths.pluginRoot, pluginPath),
      resolve(stagedRoot, "plugins", lane.plugin.name, pluginPath),
    );
  }
}

function expectedOutputFiles(lane) {
  return [
    ...templateOutputFiles.values(),
    "LICENSE",
    ...lane.source.publicationFiles.map(
      (path) => `plugins/${lane.plugin.name}/${path}`,
    ),
  ].sort(compareCodeUnits);
}

function listRegularFiles(root, { ignoreDotGit = false } = {}) {
  const files = [];
  const visit = (directory, prefix = "") => {
    const entries = readdirSync(directory, { withFileTypes: true })
      .sort((left, right) => compareCodeUnits(left.name, right.name));
    for (const entry of entries) {
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (ignoreDotGit && relativePath === ".git" && entry.isDirectory()) continue;
      const absolutePath = resolve(directory, entry.name);
      const stat = lstatSync(absolutePath);
      if (stat.isSymbolicLink()) {
        throw new Error(`Marketplace output must not contain symlinks: ${relativePath}`);
      }
      if (stat.isDirectory()) {
        visit(absolutePath, relativePath);
      } else if (stat.isFile()) {
        files.push(relativePath);
      } else {
        throw new Error(`Marketplace output contains a non-regular entry: ${relativePath}`);
      }
    }
  };
  visit(root);
  return files.sort(compareCodeUnits);
}

function digestTree(root, files) {
  const hash = createHash("sha256");
  for (const path of files) {
    const bytes = readFileSync(resolve(root, path));
    hash.update(path, "utf8");
    hash.update("\0", "utf8");
    hash.update(createHash("sha256").update(bytes).digest("hex"), "utf8");
    hash.update("\0", "utf8");
  }
  return hash.digest("hex");
}

function copyRegularFile(source, target) {
  assertRegularFile(source, `Source file ${source}`);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, readFileSync(source), { mode: 0o644, flag: "wx" });
}

function assertFileBytesEqual(expectedPath, actualPath, label) {
  assertRegularFile(expectedPath, `${label} source`);
  assertRegularFile(actualPath, label);
  if (!readFileSync(expectedPath).equals(readFileSync(actualPath))) {
    throw new Error(`${label} is not byte-identical to its canonical source.`);
  }
}

function assertSafeOutputRoot(paths) {
  if (basename(paths.outputRoot) !== expectedRepositoryName) {
    throw new Error(
      `Marketplace output directory must be named ${expectedRepositoryName}.`,
    );
  }
  if (
    paths.outputRoot === paths.repositoryRoot
    || paths.outputRoot === resolve("/")
  ) {
    throw new Error("Marketplace output root is too broad.");
  }
}

function runCommandChecked(command, args, { env = process.env } = {}) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    env,
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const detail = [result.stdout, result.stderr].filter(Boolean).join("\n").trim();
    throw new Error(
      `${command} ${args.join(" ")} failed with exit ${result.status}${detail ? `:\n${detail}` : "."}`,
    );
  }
  return { stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function resolveWithin(root, repositoryPath, label) {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, repositoryPath);
  if (
    resolvedPath !== resolvedRoot
    && !resolvedPath.startsWith(`${resolvedRoot}${sep}`)
  ) {
    throw new Error(`${label} escapes the repository root: ${repositoryPath}`);
  }
  return resolvedPath;
}

function assertRegularFile(path, label) {
  if (!existsSync(path)) throw new Error(`${label} is missing at ${path}.`);
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`${label} must be a regular file: ${path}.`);
  }
}

function assertDirectory(path, label) {
  if (!existsSync(path)) throw new Error(`${label} is missing at ${path}.`);
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be a real directory: ${path}.`);
  }
}

function assertRecord(value, label) {
  if (
    value === null
    || typeof value !== "object"
    || Array.isArray(value)
    || Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

function assertExactKeys(record, keys, label) {
  const actual = Object.keys(record).sort(compareCodeUnits);
  const expected = [...keys].sort(compareCodeUnits);
  assertJsonEqual(actual, expected, `${label} keys`);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error(`${label} must be a non-empty trimmed string.`);
  }
}

function assertIncludes(value, expected, label) {
  if (typeof value !== "string" || !value.includes(expected)) {
    throw new Error(`${label} is missing required text.`);
  }
}

function assertKebabCase(value, label) {
  assertNonEmptyString(value, label);
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(value)) {
    throw new Error(`${label} must be lowercase kebab-case.`);
  }
}

function assertSemanticVersion(value, label) {
  if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z]+(?:\.[0-9A-Za-z]+)*)?$/u.test(value ?? "")) {
    throw new Error(`${label} must be a semantic version.`);
  }
}

function assertCanonicalTimestamp(value, label) {
  assertNonEmptyString(value, label);
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString() !== value) {
    throw new Error(`${label} must be a canonical UTC date-time.`);
  }
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") throw new Error(`${label} must be a Boolean.`);
}

function assertOneOf(value, expected, label) {
  if (!expected.includes(value)) {
    throw new Error(`${label} must be one of: ${expected.join(", ")}.`);
  }
}

function assertEqual(actual, expected, label) {
  if (actual !== expected) {
    throw new Error(
      `${label} mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`,
    );
  }
}

function assertJsonEqual(actual, expected, label) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(
      `${label} mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`,
    );
  }
}

async function main() {
  const command = process.argv[2];
  const pathArgument = process.argv[3];
  let result;
  if (command === "prepare") {
    result = prepareClaudeMarketplace({
      outputRoot: pathArgument ? resolve(pathArgument) : undefined,
    });
  } else if (command === "verify") {
    result = verifyClaudeMarketplace({
      marketplaceRoot: pathArgument ? resolve(pathArgument) : undefined,
    });
  } else if (command === "validate-cli") {
    result = validateClaudeMarketplaceWithCli({
      marketplaceRoot: pathArgument ? resolve(pathArgument) : undefined,
    });
  } else if (command === "smoke-local") {
    result = smokeTestLocalClaudeMarketplace({
      marketplaceRoot: pathArgument ? resolve(pathArgument) : undefined,
    });
  } else if (command === "check") {
    result = checkClaudeMarketplace();
  } else if (command === "verify-repository") {
    result = verifyPublishedClaudeMarketplace({ repositorySource: pathArgument });
  } else {
    throw new Error(
      "Usage: node scripts/claude_marketplace_release.mjs <prepare|verify|validate-cli|smoke-local|check|verify-repository> [path-or-repository]",
    );
  }
  console.log(
    `CHECK claude_marketplace ${command.toUpperCase()} plugin=${result.pluginName} version=${result.version} files=${result.files.length} tree_sha256=${result.treeSha256}`,
  );
  if (result.outputRoot) {
    console.log(`Marketplace=${relative(defaultRepositoryRoot, result.outputRoot)}`);
  }
  if (result.revision) console.log(`Revision=${result.revision}`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
