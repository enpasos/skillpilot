import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { OPENAI_PLUGIN } from "./lib/openai_plugin_config.mjs";
import { OPENAI_PLUGIN_INSTALL_FILES } from "./lib/openai_plugin_install_files.mjs";
import { buildPrivatePluginZip } from "./openai_private_plugin.mjs";

const script = fileURLToPath(new URL("./openai_private_plugin.mjs", import.meta.url));
const root = resolve(dirname(script), "..");
const sourcePath = OPENAI_PLUGIN.sourcePath;
const metadata = `${OPENAI_PLUGIN.skillPath}/agents/openai.yaml`;
const appId = "asdk_app_workspace-test";

function temporaryDirectory(t) {
  const path = mkdtempSync(resolve(tmpdir(), "skillpilot-private-plugin-test-"));
  t.after(() => rmSync(path, { recursive: true, force: true }));
  return path;
}

function readMembers(zip) {
  const members = new Map();
  let cursor = 0;
  while (zip.readUInt32LE(cursor) === 0x04034b50) {
    const size = zip.readUInt32LE(cursor + 18);
    const nameStart = cursor + 30;
    const nameEnd = nameStart + zip.readUInt16LE(cursor + 26);
    const start = nameEnd + zip.readUInt16LE(cursor + 28);
    members.set(zip.subarray(nameStart, nameEnd).toString(), zip.subarray(start, start + size));
    cursor = start + size;
  }
  assert.equal(zip.readUInt32LE(cursor), 0x02014b50);
  return members;
}

test("private ZIP contains only portable metadata, licensed assets, and unchanged coach files", () => {
  const first = buildPrivatePluginZip();
  const second = buildPrivatePluginZip();
  assert.deepEqual(first.archive, second.archive);
  assert.equal(first.sha256, second.sha256);
  const members = readMembers(first.archive);
  const canonical = JSON.parse(readFileSync(resolve(root, sourcePath, ".codex-plugin/plugin.json")));
  assert.equal(first.archiveName, `${canonical.name}-${canonical.version}-private-remote-mcp.zip`);
  const assetsAndSkills = OPENAI_PLUGIN_INSTALL_FILES.filter(path => /^(assets|skills)\//u.test(path));
  assert.deepEqual([...members.keys()], ["LICENSE", "mcp.json", "plugin.json", ...assetsAndSkills].sort());
  assert.deepEqual(members.get("LICENSE"), readFileSync(resolve(root, "LICENSE")));
  for (const path of assetsAndSkills) assert.deepEqual(members.get(path), readFileSync(resolve(root, sourcePath, path)));
  const manifest = JSON.parse(members.get("plugin.json"));
  assert.equal(manifest.$schema, "https://agent-plugins.org/schemas/1.0.0/plugin.schema.json");
  assert.equal(manifest.version, canonical.version);
  assert.equal(manifest.name, canonical.name);
  assert.deepEqual(manifest.extensions, { "com.openai": { interface: canonical.interface } });
  for (const key of ["interface", "skills", "mcpServers", "apps"]) assert.equal(manifest[key], undefined);
  assert.deepEqual(JSON.parse(members.get("mcp.json")), {
    $schema: "https://agent-plugins.org/schemas/1.0.0/mcp.schema.json",
    mcpServers: { [canonical.name]: {
      type: "streamable-http", url: OPENAI_PLUGIN.publicEndpoint,
      extensions: { "com.openai": { auth: { type: "oauth", client: { mode: "cimd" } } } },
    } },
  });
});

test("workspace ZIP uses only the required registered app and preserves skill invocation policy", () => {
  const first = buildPrivatePluginZip({ appId });
  assert.deepEqual(first.archive, buildPrivatePluginZip({ appId }).archive);
  assert.match(first.archiveName, /-private-workspace-app\.zip$/u);
  const members = readMembers(first.archive);
  assert.equal(members.has("mcp.json"), false);
  assert.equal(members.has(".mcp.json"), false);
  assert.equal(JSON.parse(members.get("plugin.json")).extensions["com.openai"].apps, "./.app.json");
  assert.deepEqual(JSON.parse(members.get(".app.json")), { apps: { [OPENAI_PLUGIN.identity]: { id: appId, required: true } } });
  const { dependencies, ...agent } = JSON.parse(readFileSync(resolve(root, sourcePath, metadata)));
  assert.ok(dependencies.tools.length > 0);
  assert.deepEqual(JSON.parse(members.get(metadata)), agent);
  assert.deepEqual(members.get(`${OPENAI_PLUGIN.skillPath}/SKILL.md`), readFileSync(resolve(root, sourcePath, `${OPENAI_PLUGIN.skillPath}/SKILL.md`)));
  for (const id of ["", "plugin_asdk_app_x", "asdk_app_", "asdk_app_x/path", "https://chatgpt.com/plugins/x"]) {
    assert.throws(() => buildPrivatePluginZip({ appId: id }), /registered workspace MCP app ID/u);
  }
});

test("export excludes neighboring files and rejects a substituted endpoint or symlink", t => {
  const repositoryRoot = temporaryDirectory(t);
  const source = resolve(repositoryRoot, sourcePath);
  for (const file of ["LICENSE", ...OPENAI_PLUGIN_INSTALL_FILES.map(path => `${sourcePath}/${path}`)]) {
    mkdirSync(dirname(resolve(repositoryRoot, file)), { recursive: true });
    writeFileSync(resolve(repositoryRoot, file), readFileSync(resolve(root, file)));
  }
  writeFileSync(resolve(source, ".env"), "TEST_DATA=fixture-only\n");
  for (const args of [["init", "--quiet"], ["add", "--", "."]]) {
    const result = spawnSync("git", args, { cwd: repositoryRoot, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  assert.deepEqual(buildPrivatePluginZip({ repositoryRoot }).archive, buildPrivatePluginZip().archive);
  const mcp = resolve(source, ".mcp.json");
  writeFileSync(mcp, readFileSync(mcp, "utf8").replace(OPENAI_PLUGIN.publicEndpoint, "https://example.com/mcp"));
  assert.throws(() => buildPrivatePluginZip({ repositoryRoot }), /protected SkillPilot MCP endpoint/u);
  rmSync(mcp);
  symlinkSync(resolve(root, sourcePath, ".mcp.json"), mcp);
  assert.throws(() => buildPrivatePluginZip({ repositoryRoot }), /Symlink forbidden/u);
});

test("CLI writes once and audit binds the bytes, including the app ID", t => {
  const destination = temporaryDirectory(t);
  const run = (...args) => spawnSync(process.execPath, [script, ...args], { cwd: root, encoding: "utf8" });
  const packageArgs = ["package", "--out-dir", destination, "--app-id", appId];
  const first = run(...packageArgs);
  assert.equal(first.status, 0, first.stderr);
  const { archive, archiveName, sha256 } = buildPrivatePluginZip({ appId });
  assert.ok(first.stdout.includes(sha256));
  const zip = resolve(destination, archiveName);
  assert.deepEqual(readdirSync(destination), [archiveName]);
  const auditArgs = ["audit-zip", "--zip", zip];
  assert.equal(run(...auditArgs, "--app-id", appId).status, 0);
  assert.match(run(...auditArgs, "--app-id", "asdk_app_other").stderr, /ZIP differs/u);
  assert.match(run(...packageArgs).stderr, /EEXIST/u);
  assert.deepEqual(readFileSync(zip), archive);
  assert.deepEqual(readdirSync(destination), [archiveName]);
});
