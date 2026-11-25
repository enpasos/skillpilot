import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { linkSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, parse, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { isDeepStrictEqual, parseArgs } from "node:util";
import { OPENAI_PLUGIN } from "./lib/openai_plugin_config.mjs";
import { OPENAI_PLUGIN_INSTALL_FILES } from "./lib/openai_plugin_install_files.mjs";
import { readTrackedInventory } from "./lib/reproducible_plugin_archive.mjs";
import { createReproduciblePluginZip } from "./lib/reproducible_plugin_zip.mjs";
import { assertNoSecrets } from "./openai_plugin_submission.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const schema = "https://agent-plugins.org/schemas/1.0.0";
const canonicalManifest = ".codex-plugin/plugin.json";
const canonicalMcp = ".mcp.json";
const agentMetadata = `${OPENAI_PLUGIN.skillPath}/agents/openai.yaml`;
const json = value => Buffer.from(`${JSON.stringify(value, null, 2)}\n`);

function assertNoSymlink(path) {
  let current = parse(path).root;
  for (const part of relative(current, path).split(sep)) {
    current = resolve(current, part);
    assert.ok(!lstatSync(current, { throwIfNoEntry: false })?.isSymbolicLink(), `Symlink forbidden: ${current}`);
  }
}

function readFile(path) {
  assertNoSymlink(path);
  const stat = lstatSync(path);
  assert.ok(stat.isFile() && stat.size <= 100_000_000, `Expected a regular file of at most 100 MB: ${path}`);
  return readFileSync(path);
}

export function buildPrivatePluginZip({ repositoryRoot = root, appId } = {}) {
  if (appId !== undefined) {
    // The value comes from the registered SkillPilot app in the target workspace.
    assert.match(appId, /^asdk_app_[a-zA-Z0-9][a-zA-Z0-9_-]*$/u, "Expected the registered workspace MCP app ID (asdk_app_…)");
  }
  const sourceRoot = resolve(repositoryRoot, OPENAI_PLUGIN.sourcePath);
  assertNoSymlink(sourceRoot);
  const tracked = new Set(readTrackedInventory(repositoryRoot, sourceRoot).map(entry => entry.archivePath));
  const sources = new Map(OPENAI_PLUGIN_INSTALL_FILES.map(path => {
    assert.ok(tracked.has(path), `Private package requires a Git-tracked source: ${path}`);
    const content = readFile(resolve(sourceRoot, path));
    if (!path.endsWith(".png")) assertNoSecrets(content.toString("utf8"));
    return [path, content];
  }));

  const canonical = JSON.parse(sources.get(canonicalManifest));
  assertNoSecrets(canonical);
  const { name, version, description, author, homepage, repository, license, keywords, interface: listing } = canonical;
  assert.equal(name, OPENAI_PLUGIN.identity);
  assert.match(version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u);
  assert.equal(canonical.skills, "./skills/");
  assert.equal(canonical.mcpServers, `./${canonicalMcp}`);
  assert.equal(listing.displayName, OPENAI_PLUGIN.displayName);
  assert.ok([...listing.shortDescription].length <= 30, "Plugin subtitle must have at most 30 characters");
  for (const field of ["logo", "logoDark", "composerIcon", "composerIconDark"]) {
    if (listing[field] !== undefined) {
      assert.ok(listing[field].startsWith("./assets/") && sources.has(listing[field].slice(2)), `Unpackaged plugin asset: ${field}`);
    }
  }

  const mcp = JSON.parse(sources.get(canonicalMcp));
  const transport = mcp.mcpServers?.[name]?.type;
  assert.ok(transport === "http" || transport === "streamable-http", "Expected a remote HTTP MCP server");
  const server = {
    type: transport,
    url: OPENAI_PLUGIN.publicEndpoint,
    extensions: { "com.openai": { auth: { type: "oauth", client: { mode: "cimd" } } } },
  };
  assert.ok(isDeepStrictEqual(mcp, { mcpServers: { [name]: server } }),
    "Expected only the protected SkillPilot MCP endpoint and OAuth/CIMD metadata");
  sources.delete(canonicalManifest);
  sources.delete(canonicalMcp);

  const openai = { interface: listing };
  if (appId === undefined) {
    sources.set("mcp.json", json({
      $schema: `${schema}/mcp.schema.json`,
      mcpServers: { [name]: { ...server, type: "streamable-http" } },
    }));
  } else {
    openai.apps = "./.app.json";
    sources.set(".app.json", json({ apps: { [name]: { id: appId, required: true } } }));
    // The source uses JSON-compatible YAML. Keep its invocation policy and
    // presentation, and let the registered app supply the tools in this package.
    const agent = JSON.parse(sources.get(agentMetadata));
    delete agent.dependencies;
    sources.set(agentMetadata, json(agent));
  }
  sources.set("plugin.json", json({
    $schema: `${schema}/plugin.schema.json`,
    name, version, description, author, homepage, repository, license, keywords,
    extensions: { "com.openai": openai },
  }));
  const trackedLicense = spawnSync("git", ["ls-files", "--error-unmatch", "--", "LICENSE"], { cwd: repositoryRoot });
  assert.equal(trackedLicense.status, 0, "Repository LICENSE must be Git-tracked");
  sources.set("LICENSE", readFile(resolve(repositoryRoot, "LICENSE")));

  const archive = createReproduciblePluginZip([...sources].map(([path, content]) => ({ path, content })));
  const variant = appId === undefined ? "remote-mcp" : "workspace-app";
  return { archive, archiveName: `${name}-${version}-private-${variant}.zip`, sha256: createHash("sha256").update(archive).digest("hex") };
}

function main() {
  const [command, ...args] = process.argv.slice(2);
  const { values } = parseArgs({ args, options: {
    "app-id": { type: "string" },
    "out-dir": { type: "string" },
    zip: { type: "string" },
  } });
  const { "app-id": appId, "out-dir": output, zip } = values;
  assert.ok((command === "package" && output && zip === undefined) || (command === "audit-zip" && zip && output === undefined),
    "Usage: node scripts/openai_private_plugin.mjs package --out-dir DIR | audit-zip --zip PATH (either accepts optional --app-id APP_ID)");
  const { archive, archiveName, sha256 } = buildPrivatePluginZip({ appId });
  if (command === "package") {
    const destination = resolve(output);
    const delta = relative(resolve(root, OPENAI_PLUGIN.sourcePath), destination);
    assert.ok(delta === ".." || delta.startsWith(`..${sep}`), "Output must be outside the plugin source");
    assertNoSymlink(destination);
    mkdirSync(destination, { recursive: true });
    const path = resolve(destination, archiveName);
    const temporary = mkdtempSync(resolve(destination, ".skillpilot-plugin-"));
    try {
      const prepared = resolve(temporary, archiveName);
      writeFileSync(prepared, archive, { flag: "wx", mode: 0o644 });
      linkSync(prepared, path);
    } finally {
      rmSync(temporary, { recursive: true });
    }
    console.log(`ZIP ${path} sha256=${sha256}`);
  } else {
    assert.ok(readFile(resolve(zip)).equals(archive), "ZIP differs from the selected private package and current source");
    console.log(`PASS private ZIP sha256=${sha256}`);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(); } catch (error) { console.error(error.message); process.exitCode = 1; }
}
