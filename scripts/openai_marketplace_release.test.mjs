import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { buildMarketplaceFiles, prepareMarketplace, repositoryRoot, verifyMarketplace } from "./openai_marketplace_release.mjs";
import { OPENAI_PLUGIN_INSTALL_FILES, openAiPluginInstallFiles } from "./lib/openai_plugin_install_files.mjs";
import { acceptance, identity, json, listFiles, templateFiles, validateMarketplace } from "../ai/openai-marketplace/skillpilot-chatgpt-marketplace/validate.mjs";

const canonical = "ai/openai plugin/skillpilot-coach-v1";
const templates = "ai/openai-marketplace/skillpilot-chatgpt-marketplace";
function put(root, path, value) {
  mkdirSync(dirname(resolve(root, path)), { recursive: true });
  writeFileSync(resolve(root, path), value);
}
function fixture(t) {
  const base = mkdtempSync(resolve(tmpdir(), "skillpilot-openai-marketplace-test-"));
  t.after(() => rmSync(base, { recursive: true, force: true }));
  const root = resolve(base, "source");
  mkdirSync(root);
  for (const path of ["LICENSE", ...OPENAI_PLUGIN_INSTALL_FILES.map(path => `${canonical}/${path}`), ...templateFiles.map(path => `${templates}/${path}`)]) {
    put(root, path, readFileSync(resolve(repositoryRoot, path)));
  }
  for (const args of [["init", "--quiet"], ["add", "--", canonical]]) {
    const result = spawnSync("git", args, { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
  }
  return { root, base, output: resolve(base, "export") };
}

test("marketplace uses the portal allowlist while preserving historical archive behavior", () => {
  assert.equal(OPENAI_PLUGIN_INSTALL_FILES.length, 7);
  assert.deepEqual(openAiPluginInstallFiles({}), [...OPENAI_PLUGIN_INSTALL_FILES]);
  assert.equal(openAiPluginInstallFiles({ apps: "./.app.json" })[2], ".app.json");
  const files = buildMarketplaceFiles();
  for (const path of OPENAI_PLUGIN_INSTALL_FILES) {
    assert.ok(files.get(`plugins/${identity}/${path}`).equals(readFileSync(resolve(repositoryRoot, canonical, path))));
  }
});

test("two exports are byte-identical, independently executable, and claim no host acceptance", t => {
  const { root, base, output } = fixture(t);
  prepareMarketplace(output, root);
  const second = resolve(base, "second");
  prepareMarketplace(second, root);
  for (const path of listFiles(output)) assert.deepEqual(readFileSync(resolve(output, path)), readFileSync(resolve(second, path)));
  assert.deepEqual(verifyMarketplace(output, root).hostAcceptance, acceptance);
  const run = spawnSync(process.execPath, [resolve(output, "validate.mjs")], { cwd: base, encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.match(run.stdout, /host acceptance remains pending/);
  mkdirSync(resolve(output, ".git"));
  put(output, ".git/config", "test checkout metadata");
  validateMarketplace(output);
});

test("private, ignored and review source files never enter the export", t => {
  const { root, output } = fixture(t);
  put(root, `${canonical}/submission/private-review.json`, '{"fixture":"not for distribution"}');
  put(root, `${canonical}/.env`, "PRIVATE_FIXTURE=not-a-real-secret");
  put(root, `${templates}/unexpected-private-file`, "not for distribution");
  prepareMarketplace(output, root);
  assert.ok(!listFiles(output).some(path => /submission|\.env|unexpected-private/.test(path)));
});

test("missing or symlinked canonical files fail closed", t => {
  const { root, base, output } = fixture(t);
  const file = resolve(root, canonical, ".mcp.json");
  rmSync(file);
  assert.throws(() => prepareMarketplace(output, root), /ENOENT/);
  put(base, "outside.json", "{}");
  symlinkSync(resolve(base, "outside.json"), file);
  assert.throws(() => prepareMarketplace(output, root), /Symlink/);
});

test("symlinks above the source root or export root are rejected", t => {
  const { root, base, output } = fixture(t);
  prepareMarketplace(output, root);
  const sourceParent = resolve(root, "ai/openai plugin");
  renameSync(sourceParent, resolve(base, "outside-source"));
  symlinkSync(resolve(base, "outside-source"), sourceParent);
  assert.throws(() => buildMarketplaceFiles(root), /Symlink/);
  mkdirSync(resolve(base, "wrapper"));
  renameSync(output, resolve(base, "wrapper/export"));
  symlinkSync(resolve(base, "wrapper"), resolve(base, "parent-alias"));
  assert.throws(() => validateMarketplace(resolve(base, "parent-alias/export")), /Symlink/);
});

test("MCP headers, alternate endpoints, shell commands and app references are forbidden", t => {
  const { root } = fixture(t);
  const path = `${canonical}/.mcp.json`;
  const original = JSON.parse(readFileSync(resolve(root, path)));
  for (const change of [{ headers: { Authorization: "fixture" } }, { url: "https://example.com/mcp" }, { command: "sh" }]) {
    put(root, path, json({ mcpServers: { [identity]: { ...original.mcpServers[identity], ...change } } }));
    assert.throws(() => buildMarketplaceFiles(root), /protected production MCP endpoint/);
  }
  put(root, path, json(original));
  const manifestPath = `${canonical}/.codex-plugin/plugin.json`;
  const manifest = JSON.parse(readFileSync(resolve(root, manifestPath)));
  put(root, manifestPath, json({ ...manifest, apps: "./.app.json" }));
  assert.throws(() => buildMarketplaceFiles(root), /app\/hook reference/);
});

test("catalog cannot redirect plugin source or skip authentication policy", t => {
  const { root } = fixture(t);
  const path = `${templates}/.agents/plugins/marketplace.json`;
  const catalog = JSON.parse(readFileSync(resolve(root, path)));
  catalog.plugins[0].source.path = "../../private";
  put(root, path, json(catalog));
  assert.throws(() => buildMarketplaceFiles(root), /Catalog source/);
});

test("preparation never overwrites output, repository or symlink targets", t => {
  const { root, base, output } = fixture(t);
  put(output, "keep.txt", "user data");
  assert.throws(() => prepareMarketplace(output, root), /empty directory/);
  assert.equal(readFileSync(resolve(output, "keep.txt"), "utf8"), "user data");
  for (const path of [root, base, resolve(root, canonical), resolve(root, canonical, "generated")]) {
    assert.throws(() => prepareMarketplace(path, root), /Output must not/);
  }
  symlinkSync(output, resolve(base, "alias"));
  assert.throws(() => prepareMarketplace(resolve(base, "alias/new"), root), /symlink/);
});

test("extra files, byte tampering, symlinks and invented acceptance are rejected", t => {
  const { root, output } = fixture(t);
  prepareMarketplace(output, root);
  put(output, ".env", "private fixture");
  assert.throws(() => validateMarketplace(output), /Unexpected or missing/);
  rmSync(resolve(output, ".env"));
  const readme = readFileSync(resolve(output, "README.md"));
  put(output, "README.md", "tampered");
  assert.throws(() => validateMarketplace(output), /Content mismatch/);
  put(output, "README.md", readme);
  symlinkSync(resolve(output, "README.md"), resolve(output, "extra-link"));
  assert.throws(() => validateMarketplace(output), /Symlink/);
  rmSync(resolve(output, "extra-link"));
  const receipt = JSON.parse(readFileSync(resolve(output, "release-manifest.json")));
  receipt.hostAcceptance.webWithDesktopExited = "pass";
  put(output, "release-manifest.json", json(receipt));
  assert.throws(() => validateMarketplace(output), /cannot certify host acceptance/);
});

test("verification detects canonical skill drift without refreshing a receipt", t => {
  const { root, output } = fixture(t);
  prepareMarketplace(output, root);
  const path = `${canonical}/skills/${identity}/SKILL.md`;
  put(root, path, `${readFileSync(resolve(root, path), "utf8")}\nChanged candidate\n`);
  assert.throws(() => verifyMarketplace(output, root), /differs from current canonical source/);
});

test("CI preserves hidden manifests and checks rather than publishing or connecting", () => {
  const workflow = readFileSync(resolve(repositoryRoot, ".github/workflows/openai-marketplace.yml"), "utf8");
  assert.match(workflow, /include-hidden-files: true/);
  assert.match(workflow, /contents: read/);
  assert.match(workflow, /schedule:/);
  assert.match(workflow, /node --test scripts\/openai_marketplace_release\.test\.mjs/);
  assert.match(workflow, /node scripts\/openai_marketplace_release\.mjs verify/);
  assert.doesNotMatch(workflow, /secrets\.|git push|codex mcp login/);
});
