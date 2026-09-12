import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { lstatSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const identity = "skillpilot-coach-v1";
export const marketplaceName = "skillpilot-chatgpt-marketplace";
export const endpoint = "https://mcp-coach-v1.skillpilot.com/mcp";
export const pluginFiles = [
  ".codex-plugin/plugin.json", ".mcp.json",
  "skills/skillpilot-coach-v1/SKILL.md",
  "skills/skillpilot-coach-v1/agents/openai.yaml",
  "skills/skillpilot-coach-v1/references/coaching-policy.md",
  "assets/favicon-96x96.png", "assets/web-app-manifest-512x512.png",
];
export const catalogFile = ".agents/plugins/marketplace.json";
export const templateFiles = [catalogFile, "README.md", "CHANGELOG.md", "validate.mjs", ".github/workflows/validate.yml"];
export const payloadFiles = [...templateFiles, "LICENSE", ...pluginFiles.map(path => `plugins/${identity}/${path}`)].sort();
export const acceptance = Object.freeze({
  desktopInstall: "pending", oauth: "pending", desktopToolCall: "pending",
  webWithDesktopExited: "pending", nativeMobile: "pending", automaticUpdate: "pending",
});
export const sha256 = bytes => createHash("sha256").update(bytes).digest("hex");
export const json = value => `${JSON.stringify(value, null, 2)}\n`;

export function listFiles(root, prefix = "") {
  if (!prefix) {
    for (let current = resolve(root); ; current = dirname(current)) {
      assert.ok(!lstatSync(current).isSymbolicLink(), "Symlink forbidden in export root path");
      if (current === dirname(current)) break;
    }
  }
  assert.ok(lstatSync(root).isDirectory() && !lstatSync(root).isSymbolicLink(), "Root must be a regular directory");
  return readdirSync(root).sort().flatMap(name => {
    if (!prefix && name === ".git") return [];
    const path = prefix ? `${prefix}/${name}` : name;
    const absolute = resolve(root, name);
    const stat = lstatSync(absolute);
    assert.ok(!stat.isSymbolicLink(), `Symlink forbidden: ${path}`);
    if (stat.isDirectory()) return listFiles(absolute, path);
    assert.ok(stat.isFile(), `Regular file required: ${path}`);
    return [path];
  }).sort();
}

export function validateCatalog(catalog) {
  assert.deepEqual(catalog, {
    name: marketplaceName,
    interface: { displayName: "Skillpilot Chatgpt Marketplace" },
    plugins: [{ name: identity, source: { source: "local", path: `./plugins/${identity}` },
      policy: { installation: "AVAILABLE", authentication: "ON_INSTALL" }, category: "Education & Research" }],
  }, "Catalog source, identity or policy changed");
}

export function validatePlugin(manifest, mcp) {
  assert.equal(manifest.name, identity);
  assert.match(manifest.version, /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/);
  assert.equal(manifest.skills, "./skills/");
  assert.equal(manifest.mcpServers, "./.mcp.json");
  const keys = ["name", "version", "description", "author", "homepage", "repository", "license", "keywords", "skills", "mcpServers", "interface"];
  assert.ok(Object.keys(manifest).every(key => keys.includes(key)), "Unknown manifest field or app/hook reference");
  assert.deepEqual(mcp, { mcpServers: { [identity]: { type: "http", url: endpoint } } }, "Only the protected production MCP endpoint is allowed; no headers, secrets, commands or alternate providers");
  assert.equal(manifest.interface.composerIcon, "./assets/favicon-96x96.png");
  assert.equal(manifest.interface.logo, "./assets/web-app-manifest-512x512.png");
}

export function packageDigest(files) {
  return sha256(json(Object.fromEntries(Object.entries(files).filter(([path]) => path.startsWith(`plugins/${identity}/`)).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0))));
}

export function validateMarketplace(root) {
  assert.deepEqual(listFiles(root), [...payloadFiles, "release-manifest.json"].sort(), "Unexpected or missing distributed file");
  const readJson = path => JSON.parse(readFileSync(resolve(root, path), "utf8"));
  const receipt = readJson("release-manifest.json");
  assert.deepEqual(Object.keys(receipt).sort(), ["schemaVersion", "marketplace", "plugin", "version", "status", "hostAcceptance", "source", "packageDigestSha256", "files"].sort());
  assert.equal(receipt.schemaVersion, 1);
  assert.equal(receipt.marketplace, marketplaceName);
  assert.equal(receipt.plugin, identity);
  assert.equal(receipt.status, "experimental");
  assert.deepEqual(receipt.hostAcceptance, acceptance, "Generated package cannot certify host acceptance");
  assert.deepEqual(receipt.source, { repository: "https://github.com/enpasos/skillpilot", path: "ai/openai plugin/skillpilot-coach-v1" });
  assert.deepEqual(Object.keys(receipt.files).sort(), payloadFiles);
  for (const path of payloadFiles) {
    const content = readFileSync(resolve(root, path));
    assert.deepEqual(receipt.files[path], { bytes: content.length, sha256: sha256(content) }, `Content mismatch: ${path}`);
  }
  assert.equal(receipt.packageDigestSha256, packageDigest(receipt.files));
  validateCatalog(readJson(catalogFile));
  const manifest = readJson(`plugins/${identity}/.codex-plugin/plugin.json`);
  assert.equal(receipt.version, manifest.version);
  validatePlugin(manifest, readJson(`plugins/${identity}/.mcp.json`));
  for (const path of pluginFiles.filter(path => path.endsWith(".png"))) {
    assert.ok(readFileSync(resolve(root, `plugins/${identity}/${path}`)).subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])), "PNG signature required");
  }
  return receipt;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const receipt = validateMarketplace(dirname(fileURLToPath(import.meta.url)));
    console.log(`PASS marketplace ${receipt.marketplace} package=${receipt.version} sha256=${receipt.packageDigestSha256}; host acceptance remains pending`);
  } catch (error) {
    console.error(`Marketplace validation failed: ${error.message}`);
    process.exitCode = 1;
  }
}
