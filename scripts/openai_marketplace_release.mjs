import assert from "node:assert/strict";
import { existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { readTrackedInventory } from "./lib/reproducible_plugin_archive.mjs";
import { OPENAI_PLUGIN_INSTALL_FILES } from "./lib/openai_plugin_install_files.mjs";
import {
  acceptance, catalogFile, identity, json, marketplaceName, packageDigest,
  payloadFiles, pluginFiles, sha256, templateFiles, validateCatalog,
  validateMarketplace, validatePlugin,
} from "../ai/openai-marketplace/skillpilot-chatgpt-marketplace/validate.mjs";

export const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const sourceRelative = "ai/openai plugin/skillpilot-coach-v1";
const templateRelative = "ai/openai-marketplace/skillpilot-chatgpt-marketplace";

function regularFile(root, path) {
  const absolute = resolve(root, path);
  assert.ok(absolute.startsWith(`${resolve(root)}${sep}`), "Source escaped root");
  for (let current = absolute; ; current = dirname(current)) {
    assert.ok(!lstatSync(current).isSymbolicLink(), `Symlink forbidden in source: ${path}`);
    if (current === dirname(current)) break;
  }
  assert.ok(lstatSync(absolute).isFile(), `Regular source file required: ${path}`);
  return readFileSync(absolute);
}

export function buildMarketplaceFiles(root = repositoryRoot) {
  assert.deepEqual(pluginFiles, [...OPENAI_PLUGIN_INSTALL_FILES], "Marketplace and portal install allowlists drifted");
  const sourceRoot = resolve(root, sourceRelative);
  const templates = resolve(root, templateRelative);
  const tracked = new Set(readTrackedInventory(root, sourceRoot).map(entry => entry.archivePath));
  const files = new Map();
  for (const path of OPENAI_PLUGIN_INSTALL_FILES) {
    assert.ok(tracked.has(path), `Install file must be Git-tracked: ${path}`);
    files.set(`plugins/${identity}/${path}`, regularFile(sourceRoot, path));
  }
  for (const path of templateFiles) files.set(path, regularFile(templates, path));
  files.set("LICENSE", regularFile(root, "LICENSE"));
  validateCatalog(JSON.parse(files.get(catalogFile)));
  const manifest = JSON.parse(files.get(`plugins/${identity}/.codex-plugin/plugin.json`));
  validatePlugin(manifest, JSON.parse(files.get(`plugins/${identity}/.mcp.json`)));
  assert.deepEqual([...files.keys()].sort(), payloadFiles);
  const inventory = Object.fromEntries([...files.entries()].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0)
    .map(([path, bytes]) => [path, { bytes: bytes.length, sha256: sha256(bytes) }]));
  files.set("release-manifest.json", Buffer.from(json({
    schemaVersion: 1, marketplace: marketplaceName, plugin: identity, version: manifest.version,
    status: "experimental", hostAcceptance: acceptance,
    source: { repository: "https://github.com/enpasos/skillpilot", path: sourceRelative },
    packageDigestSha256: packageDigest(inventory), files: inventory,
  })));
  return files;
}

export function prepareMarketplace(output, root = repositoryRoot) {
  const destination = resolve(output);
  // Never write through symlinks or into the canonical source/template trees.
  for (let current = destination; ; current = dirname(current)) {
    if (existsSync(current)) assert.ok(!lstatSync(current).isSymbolicLink(), "Output path contains symlink");
    if (current === dirname(current)) break;
  }
  for (const protectedRoot of [resolve(root), resolve(root, sourceRelative), resolve(root, templateRelative)]) {
    const delta = relative(destination, protectedRoot);
    assert.ok(delta.startsWith(`..${sep}`) || delta === "..", "Output must not contain repository or source roots");
  }
  for (const source of [resolve(root, sourceRelative), resolve(root, templateRelative)]) {
    assert.ok(!destination.startsWith(`${source}${sep}`), "Output must not be inside a source tree");
  }
  if (existsSync(destination)) {
    assert.ok(lstatSync(destination).isDirectory() && readdirSync(destination).length === 0, "Output must be an empty directory; nothing was removed or overwritten");
  }
  const files = buildMarketplaceFiles(root);
  mkdirSync(destination, { recursive: true });
  for (const [path, content] of files) {
    const target = resolve(destination, path);
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, content, { flag: "wx", mode: 0o644 });
  }
  return validateMarketplace(destination);
}

export function verifyMarketplace(output, root = repositoryRoot) {
  const receipt = validateMarketplace(resolve(output));
  for (const [path, expected] of buildMarketplaceFiles(root)) {
    assert.ok(readFileSync(resolve(output, path)).equals(expected), `Export differs from current canonical source: ${path}`);
  }
  return receipt;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [command, flag, output, ...rest] = process.argv.slice(2);
    assert.ok(rest.length === 0, "Unexpected arguments");
    if (command === "check") {
      assert.equal(flag, undefined, "check accepts no output argument");
      const files = buildMarketplaceFiles();
      console.log(`PASS experimental marketplace source: ${files.size} files; no host acceptance claimed`);
    } else {
      assert.ok(["prepare", "verify"].includes(command) && flag === "--output" && output,
        "Usage: node scripts/openai_marketplace_release.mjs check | prepare --output EMPTY_DIR | verify --output DIR");
      const receipt = command === "prepare" ? prepareMarketplace(output) : verifyMarketplace(output);
      console.log(`PASS ${command} ${marketplaceName} ${receipt.version} ${receipt.packageDigestSha256}`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
