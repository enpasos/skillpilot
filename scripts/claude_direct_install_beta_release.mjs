import { createHash, randomBytes } from "node:crypto";
import {
  existsSync,
  linkSync,
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
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { buildClaudePluginPackage } from "../ai/claude/plugin/skillpilot-coach-v1/build-package.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = resolve(dirname(scriptPath), "..");
const laneRelativePath =
  "ai/claude/plugin/skillpilot-coach-v1/release/direct-install-beta.json";
const packageRelativeRoot = "ai/claude/plugin/skillpilot-coach-v1";
const manifestRelativePath = `${packageRelativeRoot}/.claude-plugin/plugin.json`;
const expectedPublicationRoot =
  "backend/src/main/resources/claude-plugin-publication";
const expectedDownloadBasePath = "/api/public/claude/plugins";
const expectedControlledEvidence = new Map([
  ["local-package-structural-and-unit-validation", "local_validation"],
  ["local-reproducible-plugin-archive", "local_validation"],
  ["real-client-claude-pro-web-direct-install", "real_client"],
  ["real-client-claude-pro-android-account-use", "real_client"],
  ["real-client-claude-pro-android-voice-mode", "real_client"],
]);
const expectedOpenPublicBlockers = new Set([
  "privacy-approval",
  "legal-approval",
  "support-readiness",
  "exact-client-acceptance",
]);
const compareCodeUnits = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;

export function loadDirectInstallBetaLane(repositoryRoot = defaultRepositoryRoot) {
  const lanePath = resolveWithin(
    repositoryRoot,
    laneRelativePath,
    "Direct-install beta lane",
  );
  assertRegularFile(lanePath, "Direct-install beta lane");
  const lane = readJson(lanePath, "Direct-install beta lane");
  validateDirectInstallBetaLane(lane);
  return lane;
}

export function validateDirectInstallBetaLane(lane) {
  assertRecord(lane, "Direct-install beta lane");
  assertExactKeys(
    lane,
    [
      "schemaVersion",
      "lane",
      "channel",
      "officialDistribution",
      "publication",
      "candidate",
      "plugin",
      "planSemantics",
      "requirements",
      "readiness",
    ],
    "Direct-install beta lane",
  );
  assertEqual(lane.schemaVersion, 1, "lane.schemaVersion");
  assertEqual(lane.lane, "controlled_direct_install_beta", "lane.lane");
  assertEqual(lane.channel, "beta", "lane.channel");

  assertRecord(lane.officialDistribution, "lane.officialDistribution");
  assertExactKeys(
    lane.officialDistribution,
    ["anthropicConsole", "connectorsDirectory"],
    "lane.officialDistribution",
  );
  assertEqual(
    lane.officialDistribution.anthropicConsole,
    "deferred",
    "lane.officialDistribution.anthropicConsole",
  );
  assertEqual(
    lane.officialDistribution.connectorsDirectory,
    "deferred",
    "lane.officialDistribution.connectorsDirectory",
  );

  assertRecord(lane.publication, "lane.publication");
  assertExactKeys(
    lane.publication,
    ["resourceRoot", "downloadBasePath", "accessModel"],
    "lane.publication",
  );
  assertEqual(
    lane.publication.resourceRoot,
    expectedPublicationRoot,
    "lane.publication.resourceRoot",
  );
  assertEqual(
    lane.publication.downloadBasePath,
    expectedDownloadBasePath,
    "lane.publication.downloadBasePath",
  );
  assertEqual(
    lane.publication.accessModel,
    "unlisted_direct_link",
    "lane.publication.accessModel",
  );

  assertRecord(lane.candidate, "lane.candidate");
  assertExactKeys(lane.candidate, ["version", "sha256"], "lane.candidate");
  assertSemanticVersion(lane.candidate.version, "lane.candidate.version");
  if (!/^[0-9a-f]{64}$/u.test(lane.candidate.sha256)) {
    throw new Error("lane.candidate.sha256 must be a lowercase SHA-256 digest.");
  }

  assertRecord(lane.plugin, "lane.plugin");
  assertExactKeys(
    lane.plugin,
    [
      "id",
      "name",
      "status",
      "sourceUrl",
      "privacyUrl",
      "termsUrl",
      "supportEmail",
    ],
    "lane.plugin",
  );
  assertEqual(lane.plugin.id, "skillpilot-coach-v1", "lane.plugin.id");
  assertNonEmptyString(lane.plugin.name, "lane.plugin.name");
  assertEqual(lane.plugin.status, "beta", "lane.plugin.status");
  assertHttpsUrl(lane.plugin.sourceUrl, "lane.plugin.sourceUrl");
  assertHttpsUrl(lane.plugin.privacyUrl, "lane.plugin.privacyUrl");
  assertHttpsUrl(lane.plugin.termsUrl, "lane.plugin.termsUrl");
  assertSupportEmail(lane.plugin.supportEmail, "lane.plugin.supportEmail");

  assertRecord(lane.planSemantics, "lane.planSemantics");
  assertExactKeys(
    lane.planSemantics,
    ["supportBaseline", "technicalRequirement"],
    "lane.planSemantics",
  );
  assertEqual(
    lane.planSemantics.supportBaseline,
    "claude_pro",
    "lane.planSemantics.supportBaseline",
  );
  assertEqual(
    lane.planSemantics.technicalRequirement,
    "paid_claude_plan",
    "lane.planSemantics.technicalRequirement",
  );

  validateRequirements(lane.requirements, "lane.requirements");
  assertEqual(lane.requirements.plan, "claude-pro", "lane.requirements.plan");
  assertEqual(
    lane.requirements.installSurface,
    "claude-web",
    "lane.requirements.installSurface",
  );
  for (const testedSurface of ["claude-web", "claude-android"]) {
    if (!lane.requirements.testedSurfaces.includes(testedSurface)) {
      throw new Error(
        `lane.requirements.testedSurfaces must include ${testedSurface}.`,
      );
    }
  }
  assertEqual(lane.requirements.voiceMode, true, "lane.requirements.voiceMode");

  assertRecord(lane.readiness, "lane.readiness");
  assertExactKeys(
    lane.readiness,
    [
      "controlledBetaReady",
      "openPublicBetaReady",
      "controlledBetaEvidence",
      "openPublicBetaBlockers",
    ],
    "lane.readiness",
  );
  assertBoolean(
    lane.readiness.controlledBetaReady,
    "lane.readiness.controlledBetaReady",
  );
  assertBoolean(
    lane.readiness.openPublicBetaReady,
    "lane.readiness.openPublicBetaReady",
  );

  const controlledEvidence = lane.readiness.controlledBetaEvidence;
  if (!Array.isArray(controlledEvidence)) {
    throw new Error("lane.readiness.controlledBetaEvidence must be an array.");
  }
  assertExactIdentifierSet(
    controlledEvidence,
    expectedControlledEvidence.keys(),
    "lane.readiness.controlledBetaEvidence",
  );
  for (const evidence of controlledEvidence) {
    assertRecord(evidence, `controlled evidence ${String(evidence?.id)}`);
    assertExactKeys(
      evidence,
      ["id", "kind", "status", "evidenceRef"],
      `controlled evidence ${String(evidence.id)}`,
    );
    const expectedKind = expectedControlledEvidence.get(evidence.id);
    assertEqual(
      evidence.kind,
      expectedKind,
      `controlled evidence ${evidence.id}.kind`,
    );
    assertOneOf(
      evidence.status,
      ["pass", "pending"],
      `controlled evidence ${evidence.id}.status`,
    );
    assertNonEmptyString(
      evidence.evidenceRef,
      `controlled evidence ${evidence.id}.evidenceRef`,
    );
  }
  const derivedControlledBetaReady = controlledEvidence.every(
    ({ status }) => status === "pass",
  );
  assertEqual(
    lane.readiness.controlledBetaReady,
    derivedControlledBetaReady,
    "lane.readiness.controlledBetaReady must be derived from every named local and real-client evidence",
  );

  const openPublicBlockers = lane.readiness.openPublicBetaBlockers;
  if (!Array.isArray(openPublicBlockers)) {
    throw new Error("lane.readiness.openPublicBetaBlockers must be an array.");
  }
  assertExactIdentifierSet(
    openPublicBlockers,
    expectedOpenPublicBlockers.values(),
    "lane.readiness.openPublicBetaBlockers",
  );
  for (const blocker of openPublicBlockers) {
    assertRecord(blocker, `open-public blocker ${String(blocker?.id)}`);
    assertExactKeys(
      blocker,
      ["id", "status"],
      `open-public blocker ${String(blocker.id)}`,
    );
    assertOneOf(
      blocker.status,
      ["pass", "pending"],
      `open-public blocker ${blocker.id}.status`,
    );
  }
  const derivedOpenPublicBetaReady = openPublicBlockers.every(
    ({ status }) => status === "pass",
  );
  assertEqual(
    lane.readiness.openPublicBetaReady,
    derivedOpenPublicBetaReady,
    "lane.readiness.openPublicBetaReady must be derived from every named public-beta blocker",
  );
}

export function validateClaudePluginPublicationIndex(index, lane, manifest = null) {
  validateDirectInstallBetaLane(lane);
  assertRecord(index, "Claude plugin publication index");
  assertExactKeys(
    index,
    ["schemaVersion", "channel", "preparedAt", "plugins"],
    "Claude plugin publication index",
  );
  assertEqual(index.schemaVersion, 1, "index.schemaVersion");
  assertEqual(index.channel, lane.channel, "index.channel");
  assertCanonicalTimestamp(index.preparedAt, "index.preparedAt");
  if (!Array.isArray(index.plugins) || index.plugins.length !== 1) {
    throw new Error("Claude plugin publication index must contain exactly one plugin.");
  }

  const plugin = index.plugins[0];
  assertRecord(plugin, "index.plugins[0]");
  assertExactKeys(
    plugin,
    [
      "id",
      "name",
      "version",
      "status",
      "filename",
      "bytes",
      "sha256",
      "downloadUrl",
      "sourceUrl",
      "privacyUrl",
      "termsUrl",
      "supportEmail",
      "requirements",
    ],
    "index.plugins[0]",
  );
  assertEqual(plugin.id, lane.plugin.id, "index.plugins[0].id");
  assertEqual(plugin.name, lane.plugin.name, "index.plugins[0].name");
  assertEqual(plugin.status, lane.plugin.status, "index.plugins[0].status");
  assertSemanticVersion(plugin.version, "index.plugins[0].version");
  if (manifest !== null) {
    validatePluginManifest(manifest, lane);
    assertEqual(plugin.version, manifest.version, "index.plugins[0].version");
    assertEqual(plugin.version, lane.candidate.version, "index.plugins[0] candidate version");
    assertEqual(plugin.sha256, lane.candidate.sha256, "index.plugins[0] candidate SHA-256");
  }
  const expectedFilename = `${plugin.id}-${plugin.version}.plugin`;
  assertEqual(plugin.filename, expectedFilename, "index.plugins[0].filename");
  if (!Number.isSafeInteger(plugin.bytes) || plugin.bytes <= 0) {
    throw new Error("index.plugins[0].bytes must be a positive safe integer.");
  }
  if (!/^[0-9a-f]{64}$/u.test(plugin.sha256)) {
    throw new Error("index.plugins[0].sha256 must be a lowercase SHA-256 digest.");
  }
  const expectedDownloadUrl = buildDownloadUrl(
    lane,
    plugin.version,
    plugin.sha256,
    plugin.filename,
  );
  assertSafeOriginRelativeUrl(plugin.downloadUrl, "index.plugins[0].downloadUrl");
  assertEqual(
    plugin.downloadUrl,
    expectedDownloadUrl,
    "index.plugins[0].downloadUrl",
  );
  for (const field of ["sourceUrl", "privacyUrl", "termsUrl"]) {
    assertEqual(plugin[field], lane.plugin[field], `index.plugins[0].${field}`);
    assertHttpsUrl(plugin[field], `index.plugins[0].${field}`);
  }
  assertEqual(
    plugin.supportEmail,
    lane.plugin.supportEmail,
    "index.plugins[0].supportEmail",
  );
  assertSupportEmail(plugin.supportEmail, "index.plugins[0].supportEmail");
  validateRequirements(plugin.requirements, "index.plugins[0].requirements");
  assertJsonEqual(
    plugin.requirements,
    lane.requirements,
    "index.plugins[0].requirements",
  );
  return plugin;
}

export function prepareClaudeDirectInstallBetaPublication({
  repositoryRoot = defaultRepositoryRoot,
  preparedAt = new Date().toISOString(),
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const paths = releasePaths(repositoryRoot);
  const lane = loadDirectInstallBetaLane(repositoryRoot);
  assertControlledBetaReady(lane);
  const manifest = loadPluginManifest(paths.manifestPath, lane);
  assertCanonicalTimestamp(preparedAt, "preparedAt");

  validateExistingRegistryBeforePrepare(paths.publicationRoot, lane);
  const built = buildCurrentPackage({ paths, buildPackage });
  try {
    assertEqual(built.sha256, lane.candidate.sha256, "rebuilt candidate SHA-256");
    const filename = `${lane.plugin.id}-${manifest.version}.plugin`;
    const index = createPublicationIndex({
      lane,
      manifest,
      preparedAt,
      filename,
      bytes: built.bytes.length,
      sha256: built.sha256,
    });
    validateClaudePluginPublicationIndex(index, lane, manifest);

    const versionRoot = resolve(paths.publicationRoot, lane.plugin.id, manifest.version);
    assertVersionNotRebound(versionRoot, built.sha256);
    const artifactPath = resolve(
      versionRoot,
      `sha256-${built.sha256}`,
      filename,
    );
    writeImmutableFile(artifactPath, built.bytes);
    writeJsonAtomically(paths.indexPath, index);
    validateClosedPublicationRegistry(paths.publicationRoot, lane, index, manifest);

    return {
      indexPath: paths.indexPath,
      artifactPath,
      filename,
      bytes: built.bytes.length,
      sha256: built.sha256,
      version: manifest.version,
    };
  } finally {
    built.cleanup();
  }
}

export function verifyClaudeDirectInstallBetaPublication({
  repositoryRoot = defaultRepositoryRoot,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const paths = releasePaths(repositoryRoot);
  const lane = loadDirectInstallBetaLane(repositoryRoot);
  assertControlledBetaReady(lane);
  const manifest = loadPluginManifest(paths.manifestPath, lane);
  assertRegularFile(paths.indexPath, "Claude plugin publication index");
  const index = readJson(paths.indexPath, "Claude plugin publication index");
  const plugin = validateClaudePluginPublicationIndex(index, lane, manifest);
  const artifactPath = resolve(
    paths.publicationRoot,
    plugin.id,
    plugin.version,
    `sha256-${plugin.sha256}`,
    plugin.filename,
  );
  validateClosedPublicationRegistry(paths.publicationRoot, lane, index, manifest);

  const storedBytes = readFileSync(artifactPath);
  assertEqual(storedBytes.length, plugin.bytes, "stored plugin byte length");
  assertEqual(sha256(storedBytes), plugin.sha256, "stored plugin SHA-256");

  const built = buildCurrentPackage({ paths, buildPackage });
  try {
    assertEqual(built.bytes.length, plugin.bytes, "rebuilt plugin byte length");
    assertEqual(built.sha256, plugin.sha256, "rebuilt plugin SHA-256");
    if (!storedBytes.equals(built.bytes)) {
      throw new Error(
        "Rebuilt Claude plugin bytes do not match the published immutable artifact.",
      );
    }
    assertEqual(built.sha256, lane.candidate.sha256, "rebuilt candidate SHA-256");
  } finally {
    built.cleanup();
  }

  return {
    indexPath: paths.indexPath,
    artifactPath,
    filename: plugin.filename,
    bytes: plugin.bytes,
    sha256: plugin.sha256,
    version: plugin.version,
  };
}

export async function verifyPublicClaudeDirectInstallBetaPublication({
  repositoryRoot = defaultRepositoryRoot,
  baseUrl,
  fetchImpl = globalThis.fetch,
  buildPackage = buildClaudePluginPackage,
} = {}) {
  const publicBaseUrl = parsePublicBaseUrl(baseUrl);
  if (typeof fetchImpl !== "function") {
    throw new Error("fetchImpl must be a function.");
  }

  const local = verifyClaudeDirectInstallBetaPublication({
    repositoryRoot,
    buildPackage,
  });
  const expectedIndexBytes = readFileSync(local.indexPath);
  const index = JSON.parse(expectedIndexBytes.toString("utf8"));
  const plugin = index.plugins[0];

  const pageResponse = await fetchChecked(
    fetchImpl,
    new URL("/plugins", publicBaseUrl),
    "public plugin page",
  );
  assertMediaType(pageResponse, "text/html", "public plugin page");
  const pageBytes = Buffer.from(await pageResponse.arrayBuffer());
  if (!pageBytes.toString("utf8").includes('id="root"')) {
    throw new Error("Public plugin page does not contain the application root.");
  }

  const indexResponse = await fetchChecked(
    fetchImpl,
    new URL(`${expectedDownloadBasePath}/index.json`, publicBaseUrl),
    "public Claude plugin publication index",
  );
  assertMediaType(
    indexResponse,
    "application/json",
    "public Claude plugin publication index",
  );
  assertHeaderEquals(
    indexResponse,
    "cache-control",
    "no-store",
    "public Claude plugin publication index",
  );
  assertHeaderEquals(
    indexResponse,
    "x-content-type-options",
    "nosniff",
    "public Claude plugin publication index",
  );
  assertContentLength(
    indexResponse,
    expectedIndexBytes.length,
    "public Claude plugin publication index",
  );
  const publicIndexBytes = Buffer.from(await indexResponse.arrayBuffer());
  if (!publicIndexBytes.equals(expectedIndexBytes)) {
    throw new Error(
      "Public Claude plugin publication index does not match the prepared index.",
    );
  }

  const artifactUrl = new URL(plugin.downloadUrl, publicBaseUrl);
  if (artifactUrl.origin !== publicBaseUrl.origin) {
    throw new Error("Public Claude plugin artifact URL escaped the configured origin.");
  }
  const artifactResponse = await fetchChecked(
    fetchImpl,
    artifactUrl,
    "public Claude plugin artifact",
  );
  assertMediaType(
    artifactResponse,
    "application/octet-stream",
    "public Claude plugin artifact",
  );
  assertHeaderEquals(
    artifactResponse,
    "content-disposition",
    `attachment; filename="${plugin.filename}"`,
    "public Claude plugin artifact",
  );
  assertHeaderEquals(
    artifactResponse,
    "x-content-type-options",
    "nosniff",
    "public Claude plugin artifact",
  );
  assertHeaderEquals(
    artifactResponse,
    "etag",
    `"sha256-${plugin.sha256}"`,
    "public Claude plugin artifact",
  );
  assertCacheControlTokens(
    artifactResponse,
    ["public", "max-age=31536000", "immutable"],
    "public Claude plugin artifact",
  );
  assertContentLength(
    artifactResponse,
    plugin.bytes,
    "public Claude plugin artifact",
  );
  const publicArtifactBytes = Buffer.from(await artifactResponse.arrayBuffer());
  assertEqual(
    publicArtifactBytes.length,
    plugin.bytes,
    "public Claude plugin artifact byte length",
  );
  assertEqual(
    sha256(publicArtifactBytes),
    plugin.sha256,
    "public Claude plugin artifact SHA-256",
  );

  return {
    ...local,
    pageUrl: new URL("/plugins", publicBaseUrl).href,
    indexUrl: new URL(`${expectedDownloadBasePath}/index.json`, publicBaseUrl).href,
    artifactUrl: artifactUrl.href,
  };
}

function releasePaths(repositoryRoot) {
  const root = resolve(repositoryRoot);
  const packageRoot = resolveWithin(root, packageRelativeRoot, "Claude plugin root");
  const manifestPath = resolveWithin(root, manifestRelativePath, "Claude plugin manifest");
  const publicationRoot = resolveWithin(
    root,
    expectedPublicationRoot,
    "Claude plugin publication root",
  );
  return {
    repositoryRoot: root,
    packageRoot,
    manifestPath,
    publicationRoot,
    indexPath: resolve(publicationRoot, "index.json"),
  };
}

function loadPluginManifest(manifestPath, lane) {
  assertRegularFile(manifestPath, "Claude plugin manifest");
  const manifest = readJson(manifestPath, "Claude plugin manifest");
  validatePluginManifest(manifest, lane);
  return manifest;
}

function validatePluginManifest(manifest, lane) {
  assertRecord(manifest, "Claude plugin manifest");
  assertEqual(manifest.name, lane.plugin.id, "Claude plugin manifest.name");
  assertSemanticVersion(manifest.version, "Claude plugin manifest.version");
  assertEqual(manifest.version, lane.candidate.version, "Claude plugin candidate version");
}

function assertControlledBetaReady(lane) {
  if (lane.readiness.controlledBetaReady !== true) {
    throw new Error(
      "Controlled direct-install beta publication requires every named local and real-client evidence to pass.",
    );
  }
}

function buildCurrentPackage({ paths, buildPackage }) {
  if (typeof buildPackage !== "function") {
    throw new Error("buildPackage must be a function.");
  }
  const temporaryRoot = mkdtempSync(
    resolve(tmpdir(), "skillpilot-claude-direct-install-beta-"),
  );
  const outputPath = resolve(temporaryRoot, "candidate.plugin");
  try {
    const result = buildPackage({
      root: paths.packageRoot,
      outputPath,
    });
    assertRegularFile(outputPath, "rebuilt Claude plugin package");
    const bytes = readFileSync(outputPath);
    const digest = sha256(bytes);
    assertRecord(result, "buildClaudePluginPackage result");
    assertEqual(result.bytes, bytes.length, "buildClaudePluginPackage result.bytes");
    assertEqual(result.sha256, digest, "buildClaudePluginPackage result.sha256");
    return {
      bytes,
      sha256: digest,
      cleanup: () => rmSync(temporaryRoot, { recursive: true, force: true }),
    };
  } catch (error) {
    rmSync(temporaryRoot, { recursive: true, force: true });
    throw error;
  }
}

function createPublicationIndex({
  lane,
  manifest,
  preparedAt,
  filename,
  bytes,
  sha256: digest,
}) {
  return {
    schemaVersion: 1,
    channel: lane.channel,
    preparedAt,
    plugins: [
      {
        id: lane.plugin.id,
        name: lane.plugin.name,
        version: manifest.version,
        status: lane.plugin.status,
        filename,
        bytes,
        sha256: digest,
        downloadUrl: buildDownloadUrl(lane, manifest.version, digest, filename),
        sourceUrl: lane.plugin.sourceUrl,
        privacyUrl: lane.plugin.privacyUrl,
        termsUrl: lane.plugin.termsUrl,
        supportEmail: lane.plugin.supportEmail,
        requirements: structuredClone(lane.requirements),
      },
    ],
  };
}

function buildDownloadUrl(lane, version, digest, filename) {
  return (
    `${lane.publication.downloadBasePath}/${lane.plugin.id}/${version}/` +
    `sha256-${digest}/${filename}`
  );
}

function validateRequirements(requirements, label) {
  assertRecord(requirements, label);
  assertExactKeys(
    requirements,
    ["minimumAge", "plan", "installSurface", "testedSurfaces", "voiceMode"],
    label,
  );
  if (!Number.isSafeInteger(requirements.minimumAge) || requirements.minimumAge < 18) {
    throw new Error(`${label}.minimumAge must be an integer of at least 18.`);
  }
  assertNonEmptyString(requirements.plan, `${label}.plan`);
  assertNonEmptyString(requirements.installSurface, `${label}.installSurface`);
  if (
    !Array.isArray(requirements.testedSurfaces) ||
    requirements.testedSurfaces.length === 0
  ) {
    throw new Error(`${label}.testedSurfaces must be a non-empty string list.`);
  }
  const seen = new Set();
  for (const [index, surface] of requirements.testedSurfaces.entries()) {
    assertNonEmptyString(surface, `${label}.testedSurfaces[${index}]`);
    if (seen.has(surface)) {
      throw new Error(`${label}.testedSurfaces contains duplicate ${surface}.`);
    }
    seen.add(surface);
  }
  assertBoolean(requirements.voiceMode, `${label}.voiceMode`);
}

function validateExistingRegistryBeforePrepare(publicationRoot, lane) {
  if (!existsSync(publicationRoot)) {
    return;
  }
  assertDirectory(publicationRoot, "Claude plugin publication root");
  const entries = readSafeDirectory(publicationRoot, "Claude plugin publication root");
  for (const entry of entries) {
    if (entry.name !== "index.json" && entry.name !== lane.plugin.id) {
      throw new Error(
        `Closed Claude plugin registry contains unexpected top-level entry: ${entry.name}`,
      );
    }
  }
  if (existsSync(resolve(publicationRoot, lane.plugin.id))) {
    validateStoredPluginHistory(resolve(publicationRoot, lane.plugin.id), lane.plugin.id);
  }
  const indexPath = resolve(publicationRoot, "index.json");
  if (existsSync(indexPath)) {
    assertRegularFile(indexPath, "existing Claude plugin publication index");
    const existingIndex = readJson(indexPath, "existing Claude plugin publication index");
    const existingPlugin = validateClaudePluginPublicationIndex(existingIndex, lane);
    validateIndexedArtifact(publicationRoot, existingPlugin);
  }
}

function validateClosedPublicationRegistry(publicationRoot, lane, index, manifest) {
  assertDirectory(publicationRoot, "Claude plugin publication root");
  const entries = readSafeDirectory(publicationRoot, "Claude plugin publication root");
  const names = entries.map(({ name }) => name).sort(compareCodeUnits);
  assertJsonEqual(
    names,
    ["index.json", lane.plugin.id].sort(compareCodeUnits),
    "closed Claude plugin registry top-level entries",
  );
  assertRegularFile(resolve(publicationRoot, "index.json"), "publication index");
  validateClaudePluginPublicationIndex(index, lane, manifest);
  validateStoredPluginHistory(resolve(publicationRoot, lane.plugin.id), lane.plugin.id);
  validateIndexedArtifact(publicationRoot, index.plugins[0]);
}

function validateStoredPluginHistory(pluginRoot, pluginId) {
  assertDirectory(pluginRoot, `publication root for ${pluginId}`);
  const versions = readSafeDirectory(pluginRoot, `publication root for ${pluginId}`);
  if (versions.length === 0) {
    throw new Error(`Publication root for ${pluginId} must contain a version.`);
  }
  for (const versionEntry of versions) {
    if (!versionEntry.isDirectory()) {
      throw new Error(
        `Publication root for ${pluginId} contains non-directory ${versionEntry.name}.`,
      );
    }
    assertSemanticVersion(versionEntry.name, `publication version ${versionEntry.name}`);
    const versionRoot = resolve(pluginRoot, versionEntry.name);
    const digests = readSafeDirectory(versionRoot, `publication version ${versionEntry.name}`);
    if (digests.length !== 1 || !digests[0].isDirectory()) {
      throw new Error(
        `Publication version ${versionEntry.name} must contain exactly one SHA-256 directory.`,
      );
    }
    const digestMatch = /^sha256-([0-9a-f]{64})$/u.exec(digests[0].name);
    if (digestMatch === null) {
      throw new Error(
        `Publication version ${versionEntry.name} has invalid digest directory ${digests[0].name}.`,
      );
    }
    const digestRoot = resolve(versionRoot, digests[0].name);
    const artifacts = readSafeDirectory(digestRoot, `publication digest ${digests[0].name}`);
    const expectedFilename = `${pluginId}-${versionEntry.name}.plugin`;
    if (
      artifacts.length !== 1 ||
      !artifacts[0].isFile() ||
      artifacts[0].name !== expectedFilename
    ) {
      throw new Error(
        `Publication digest ${digests[0].name} must contain only ${expectedFilename}.`,
      );
    }
    const artifactPath = resolve(digestRoot, expectedFilename);
    assertRegularFile(artifactPath, `published artifact ${expectedFilename}`);
    assertEqual(
      sha256(readFileSync(artifactPath)),
      digestMatch[1],
      `published artifact ${expectedFilename} SHA-256`,
    );
  }
}

function validateIndexedArtifact(publicationRoot, plugin) {
  const artifactPath = resolve(
    publicationRoot,
    plugin.id,
    plugin.version,
    `sha256-${plugin.sha256}`,
    plugin.filename,
  );
  assertRegularFile(artifactPath, "indexed Claude plugin artifact");
  const bytes = readFileSync(artifactPath);
  assertEqual(bytes.length, plugin.bytes, "indexed Claude plugin artifact bytes");
  assertEqual(sha256(bytes), plugin.sha256, "indexed Claude plugin artifact SHA-256");
}

function assertVersionNotRebound(versionRoot, digest) {
  if (!existsSync(versionRoot)) {
    return;
  }
  assertDirectory(versionRoot, "existing publication version root");
  const entries = readSafeDirectory(versionRoot, "existing publication version root");
  if (entries.length !== 1 || entries[0].name !== `sha256-${digest}`) {
    throw new Error(
      "Refusing to rebind an existing Claude plugin version to different bytes.",
    );
  }
}

function writeImmutableFile(path, bytes) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    assertRegularFile(path, "existing immutable Claude plugin artifact");
    if (!readFileSync(path).equals(bytes)) {
      throw new Error(`Refusing to overwrite immutable Claude plugin artifact ${path}.`);
    }
    return;
  }
  const temporaryPath = `${path}.tmp-${process.pid}-${randomBytes(12).toString("hex")}`;
  try {
    writeFileSync(temporaryPath, bytes, { flag: "wx", mode: 0o644 });
    try {
      linkSync(temporaryPath, path);
    } catch (error) {
      if (error?.code !== "EEXIST") {
        throw error;
      }
      assertRegularFile(path, "concurrently created immutable Claude plugin artifact");
      if (!readFileSync(path).equals(bytes)) {
        throw new Error(`Immutable Claude plugin artifact collision at ${path}.`);
      }
    }
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function writeJsonAtomically(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  if (existsSync(path)) {
    assertRegularFile(path, "existing Claude plugin publication index");
  }
  const temporaryPath = `${path}.tmp-${process.pid}-${randomBytes(12).toString("hex")}`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(value, null, 2)}\n`, {
      flag: "wx",
      mode: 0o644,
    });
    renameSync(temporaryPath, path);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function readJson(path, label) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
}

function readSafeDirectory(path, label) {
  assertDirectory(path, label);
  const entries = readdirSync(path, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink()) {
      throw new Error(`${label} contains symbolic link ${entry.name}.`);
    }
  }
  return entries.sort((left, right) => compareCodeUnits(left.name, right.name));
}

function assertSafeOriginRelativeUrl(value, label) {
  assertNonEmptyString(value, label);
  if (
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    value.includes("?") ||
    value.includes("#") ||
    value.includes("%") ||
    /[\u0000-\u001f\u007f]/u.test(value)
  ) {
    throw new Error(`${label} must be a safe origin-relative URL without query or fragment.`);
  }
  const components = value.split("/");
  if (components.some((component) => component === "." || component === "..")) {
    throw new Error(`${label} must not contain path traversal components.`);
  }
  const parsed = new URL(value, "https://skillpilot.com");
  if (
    parsed.origin !== "https://skillpilot.com" ||
    parsed.pathname !== value ||
    parsed.search !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(`${label} must stay on the SkillPilot origin.`);
  }
}

function assertCanonicalTimestamp(value, label) {
  assertNonEmptyString(value, label);
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || date.toISOString() !== value) {
    throw new Error(`${label} must be a canonical UTC ISO-8601 timestamp.`);
  }
}

function parsePublicBaseUrl(value) {
  assertNonEmptyString(value, "public base URL");
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error("public base URL must be an absolute URL.");
  }
  const loopbackHttp =
    parsed.protocol === "http:" &&
    (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost");
  if (
    (parsed.protocol !== "https:" && !loopbackHttp) ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.search !== "" ||
    parsed.hash !== "" ||
    (parsed.pathname !== "/" && parsed.pathname !== "")
  ) {
    throw new Error(
      "public base URL must be an HTTPS origin without credentials, path, query, or fragment.",
    );
  }
  return new URL(`${parsed.origin}/`);
}

async function fetchChecked(fetchImpl, url, label) {
  let response;
  try {
    response = await fetchImpl(url, {
      method: "GET",
      redirect: "error",
      headers: {
        accept: "*/*",
        "accept-encoding": "identity",
      },
    });
  } catch (error) {
    throw new Error(`${label} request failed: ${error.message}`);
  }
  if (
    response === null ||
    typeof response !== "object" ||
    typeof response.arrayBuffer !== "function" ||
    typeof response.status !== "number" ||
    response.headers === undefined
  ) {
    throw new Error(`${label} returned an invalid fetch response.`);
  }
  if (response.status !== 200) {
    throw new Error(`${label} returned HTTP ${response.status}; expected HTTP 200.`);
  }
  return response;
}

function assertMediaType(response, expected, label) {
  const actual = response.headers.get("content-type");
  if (actual === null || actual.split(";", 1)[0].trim().toLowerCase() !== expected) {
    throw new Error(
      `${label} content-type mismatch: expected ${expected}, received ${String(actual)}.`,
    );
  }
}

function assertHeaderEquals(response, name, expected, label) {
  const actual = response.headers.get(name);
  if (actual !== expected) {
    throw new Error(
      `${label} ${name} mismatch: expected ${JSON.stringify(expected)}, received ${JSON.stringify(actual)}.`,
    );
  }
}

function assertCacheControlTokens(response, expectedTokens, label) {
  const actual = response.headers.get("cache-control");
  const actualTokens = new Set(
    (actual ?? "")
      .split(",")
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean),
  );
  for (const expectedToken of expectedTokens) {
    if (!actualTokens.has(expectedToken)) {
      throw new Error(
        `${label} cache-control is missing ${expectedToken}: ${String(actual)}.`,
      );
    }
  }
}

function assertContentLength(response, expected, label) {
  const actual = response.headers.get("content-length");
  if (actual !== String(expected)) {
    throw new Error(
      `${label} content-length mismatch: expected ${expected}, received ${String(actual)}.`,
    );
  }
}

function assertHttpsUrl(value, label) {
  assertNonEmptyString(value, label);
  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute HTTPS URL.`);
  }
  if (
    parsed.protocol !== "https:" ||
    parsed.username !== "" ||
    parsed.password !== "" ||
    parsed.hash !== ""
  ) {
    throw new Error(`${label} must be an absolute HTTPS URL without credentials or fragment.`);
  }
}

function assertSupportEmail(value, label) {
  assertNonEmptyString(value, label);
  if (!/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/iu.test(value)) {
    throw new Error(`${label} must be an email address.`);
  }
}

function assertSemanticVersion(value, label) {
  if (typeof value !== "string" || !/^\d+\.\d+\.\d+$/u.test(value)) {
    throw new Error(`${label} must be an exact three-part semantic version.`);
  }
}

function assertExactIdentifierSet(entries, expectedIdentifiers, label) {
  const identifiers = [];
  for (const [index, entry] of entries.entries()) {
    assertRecord(entry, `${label}[${index}]`);
    assertNonEmptyString(entry.id, `${label}[${index}].id`);
    identifiers.push(entry.id);
  }
  const actual = [...identifiers].sort(compareCodeUnits);
  const expected = [...expectedIdentifiers].sort(compareCodeUnits);
  assertJsonEqual(actual, expected, `${label} IDs`);
}

function assertExactKeys(value, expectedKeys, label) {
  const actual = Object.keys(value).sort(compareCodeUnits);
  const expected = [...expectedKeys].sort(compareCodeUnits);
  assertJsonEqual(actual, expected, `${label} keys`);
}

function assertRecord(value, label) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.getPrototypeOf(value) !== Object.prototype
  ) {
    throw new Error(`${label} must be a JSON object.`);
  }
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() !== value || value.length === 0) {
    throw new Error(`${label} must be a non-empty trimmed string.`);
  }
}

function assertBoolean(value, label) {
  if (typeof value !== "boolean") {
    throw new Error(`${label} must be a Boolean.`);
  }
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

function assertRegularFile(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} is missing at ${path}.`);
  }
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isFile()) {
    throw new Error(`${label} must be a regular file: ${path}.`);
  }
}

function assertDirectory(path, label) {
  if (!existsSync(path)) {
    throw new Error(`${label} is missing at ${path}.`);
  }
  const stat = lstatSync(path);
  if (stat.isSymbolicLink() || !stat.isDirectory()) {
    throw new Error(`${label} must be a real directory: ${path}.`);
  }
}

function resolveWithin(root, repositoryPath, label) {
  const resolvedRoot = resolve(root);
  const resolvedPath = resolve(resolvedRoot, repositoryPath);
  const prefix = `${resolvedRoot}${sep}`;
  if (resolvedPath !== resolvedRoot && !resolvedPath.startsWith(prefix)) {
    throw new Error(`${label} escapes the repository root: ${repositoryPath}.`);
  }
  return resolvedPath;
}

function sha256(bytes) {
  return createHash("sha256").update(bytes).digest("hex");
}

async function main() {
  const command = process.argv[2];
  if (
    command !== "prepare" &&
    command !== "verify" &&
    command !== "verify-public"
  ) {
    throw new Error(
      "Usage: node scripts/claude_direct_install_beta_release.mjs <prepare|verify|verify-public> [base-url]",
    );
  }
  if (command === "verify-public") {
    const result = await verifyPublicClaudeDirectInstallBetaPublication({
      baseUrl: process.argv[3],
    });
    console.log(
      `CHECK claude_direct_install_beta VERIFY-PUBLIC version=${result.version} bytes=${result.bytes} sha256=${result.sha256}`,
    );
    console.log(`Page=${result.pageUrl}`);
    console.log(`Index=${result.indexUrl}`);
    console.log(`Artifact=${result.artifactUrl}`);
    return;
  }
  const result =
    command === "prepare"
      ? prepareClaudeDirectInstallBetaPublication()
      : verifyClaudeDirectInstallBetaPublication();
  console.log(
    `CHECK claude_direct_install_beta ${command.toUpperCase()} version=${result.version} bytes=${result.bytes} sha256=${result.sha256}`,
  );
  console.log(`Index=${relative(defaultRepositoryRoot, result.indexPath)}`);
  console.log(`Artifact=${relative(defaultRepositoryRoot, result.artifactPath)}`);
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  main().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
