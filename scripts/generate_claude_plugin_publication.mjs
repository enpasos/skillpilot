import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import {
  loadDirectInstallBetaLane,
  prepareClaudeDirectInstallBetaPublication,
  verifyClaudeDirectInstallBetaPublication,
} from "./claude_direct_install_beta_release.mjs";

const scriptPath = fileURLToPath(import.meta.url);
const defaultRepositoryRoot = resolve(dirname(scriptPath), "..");
const sourcePublicationPath = "backend/src/main/resources/claude-plugin-publication";
const pluginPath = "ai/claude/plugin/skillpilot-coach-v1";

/** Build-only resources: no tracked-file writes, publication receipts or network requests. */
export function generateClaudePluginPublication({
  repositoryRoot = defaultRepositoryRoot,
  publicationRoot,
  buildPackage,
} = {}) {
  const root = resolve(repositoryRoot);
  const output = buildPublicationRoot(root, publicationRoot);
  const lane = loadDirectInstallBetaLane(root);
  const baseline = JSON.parse(readFileSync(resolve(root, pluginPath, "release/contract-baseline.json"), "utf8"));
  if (baseline.pluginIdentity !== lane.plugin.id || baseline.pluginVersion !== lane.candidate.version
      || baseline.archive?.sha256 !== lane.candidate.sha256
      || !Number.isSafeInteger(baseline.archive?.bytes) || baseline.archive.bytes <= 0) {
    throw new Error("Claude build publication must match the current version and immutable archive baseline.");
  }
  assertPublishedVersionNotRebound(root, lane);
  // A stable release-dossier date, not the wall clock, makes repeated backend builds byte-identical.
  const preparedAt = `${baseline.capturedAt}T00:00:00.000Z`;
  if (!/^\d{4}-\d{2}-\d{2}$/u.test(baseline.capturedAt)
      || new Date(preparedAt).toISOString() !== preparedAt) {
    throw new Error("Claude build publication requires a valid baseline capturedAt date.");
  }

  const source = resolve(root, sourcePublicationPath);
  if (existsSync(resolve(source, "index.json"))) {
    // Retain the checked-in release history, verifying it against its own dossier when historical.
    verifyClaudeDirectInstallBetaPublication({ repositoryRoot: root, buildPackage });
    copyImmutableHistory(resolve(source, lane.plugin.id), resolve(output, lane.plugin.id));
  }
  const result = prepareClaudeDirectInstallBetaPublication({
    repositoryRoot: root, publicationRoot: output, preparedAt, buildPackage,
  });
  if (result.bytes !== baseline.archive.bytes) {
    throw new Error("Claude build publication byte length does not match the archive baseline.");
  }
  verifyClaudeDirectInstallBetaPublication({ repositoryRoot: root, publicationRoot: output, buildPackage });
  return result;
}

function assertPublishedVersionNotRebound(root, lane) {
  const marketplacePath = resolve(root, pluginPath, "release/marketplace-publication.json");
  if (existsSync(marketplacePath)) {
    const marketplace = JSON.parse(readFileSync(marketplacePath, "utf8"));
    const bindings = (marketplace.activation?.evidence ?? [])
      .filter((evidence) => evidence.status === "pass")
      .map((evidence) => ({ version: evidence.candidateVersion, sha256: evidence.candidateSha256 }));
    if (["published_pending_acceptance", "published_verified"].includes(marketplace.activation?.state)) {
      bindings.push({ version: marketplace.plugin?.version, sha256: marketplace.plugin?.directInstallSha256 });
    }
    for (const binding of bindings) {
      if (binding.version === lane.candidate.version && binding.sha256 !== lane.candidate.sha256) {
        throw new Error("Refusing to rebind an already published Claude Marketplace version to different bytes.");
      }
    }
  }
  const archivedBaselinePath = resolve(root, pluginPath, "release/history", lane.candidate.version, "contract-baseline.json");
  if (existsSync(archivedBaselinePath)) {
    const archived = JSON.parse(readFileSync(archivedBaselinePath, "utf8"));
    if (archived.pluginIdentity !== lane.plugin.id || archived.pluginVersion !== lane.candidate.version
        || archived.archive?.sha256 !== lane.candidate.sha256) {
      throw new Error("Refusing to rebind an archived Claude plugin version to different bytes.");
    }
  }
}

function buildPublicationRoot(repositoryRoot, value) {
  if (typeof value !== "string" || value.length === 0) {
    throw new Error("A generated claude-plugin-publication directory is required.");
  }
  const output = resolve(value);
  if (basename(output) !== "claude-plugin-publication") {
    throw new Error("Build output must be a dedicated claude-plugin-publication directory.");
  }
  for (const protectedPath of ["backend/src", "ai", "scripts", ".git"]) {
    const protectedRoot = resolve(repositoryRoot, protectedPath);
    if (output === protectedRoot || output.startsWith(`${protectedRoot}${sep}`)
        || protectedRoot.startsWith(`${output}${sep}`)) {
      throw new Error("Build publication must not overwrite repository sources.");
    }
  }
  for (let ancestor = output; ; ancestor = dirname(ancestor)) {
    if (existsSync(ancestor) && lstatSync(ancestor).isSymbolicLink()) {
      throw new Error("Build publication path must not traverse symbolic links.");
    }
    if (ancestor === dirname(ancestor)) break;
  }
  return output;
}

function copyImmutableHistory(source, target) {
  if (existsSync(target) && (lstatSync(target).isSymbolicLink() || !lstatSync(target).isDirectory())) {
    throw new Error("Build publication history contains an invalid directory.");
  }
  for (const entry of readdirSync(source, { withFileTypes: true })) {
    const sourcePath = resolve(source, entry.name);
    const targetPath = resolve(target, entry.name);
    if (entry.isDirectory()) {
      if (existsSync(targetPath)
          && (lstatSync(targetPath).isSymbolicLink() || !lstatSync(targetPath).isDirectory())) {
        throw new Error("Build publication history contains an invalid directory.");
      }
      copyImmutableHistory(sourcePath, targetPath);
    } else if (entry.isFile()) {
      const bytes = readFileSync(sourcePath);
      mkdirSync(dirname(targetPath), { recursive: true });
      if (existsSync(targetPath)) {
        if (!lstatSync(targetPath).isFile() || lstatSync(targetPath).isSymbolicLink()
            || !readFileSync(targetPath).equals(bytes)) {
          throw new Error("Refusing to overwrite immutable Claude plugin history in the build.");
        }
      } else {
        writeFileSync(targetPath, bytes, { flag: "wx", mode: 0o644 });
      }
    } else {
      throw new Error("Claude plugin history must contain only real directories and regular files.");
    }
  }
}

if (process.argv[1] && resolve(process.argv[1]) === scriptPath) {
  try {
    const result = generateClaudePluginPublication({ publicationRoot: process.argv[2] });
    console.log(`CHECK claude_build_publication PASS version=${result.version} bytes=${result.bytes} sha256=${result.sha256}`);
    console.log(`Index=${result.indexPath}`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
