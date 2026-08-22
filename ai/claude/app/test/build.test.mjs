import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "node:child_process";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const repositoryRoot = join(root, "../../..");
const expectedDomain = "ee8f5203b9b3d186c660c802e340f19c.claudemcpcontent.com";

test("manifest pins Claude MCP Apps security and tool metadata", async () => {
  const manifest = await readManifest();
  assert.equal(manifest.provider, "claude");
  assert.equal(manifest.identityBoundary, "oauth-connection");
  assert.equal(manifest.widgetDomain, expectedDomain);
  assert.equal(manifest.widgetDomain.includes("://"), false);
  assert.ok(Array.isArray(manifest.retainedResources));
  assert.deepEqual(Object.keys(manifest.tools), [
    "render_skillpilot_goal_visualization",
    "start_skillpilot_memory_practice",
    "review_skillpilot_memory_practice_card"
  ]);
  assert.deepEqual(manifest.tools.review_skillpilot_memory_practice_card, {
    readOnly: false,
    visibility: ["app"]
  });
  assert.equal(hasOpenAiCompatibilityKey(manifest), false);

  const activeResourceUris = new Set(manifest.resources.map((resource) => resource.uri));
  const toolResourceUris = new Set(Object.values(manifest.tools)
    .map((tool) => tool.resourceUri)
    .filter(Boolean));
  for (const retained of manifest.retainedResources) {
    assert.match(retained.sha256, /^[0-9a-f]{64}$/);
    assert.match(retained.path, new RegExp(`^sha256-${retained.sha256}/`));
    assert.match(retained.uri, new RegExp(`/sha256-${retained.sha256}/`));
    assert.equal(activeResourceUris.has(retained.uri), false);
    assert.equal(toolResourceUris.has(retained.uri), false);
  }

  for (const resource of manifest.resources) {
    assert.equal(resource.ui.domain, expectedDomain);
    assert.deepEqual(Object.keys(resource.ui.csp).sort(), [
      "baseUriDomains",
      "connectDomains",
      "frameDomains",
      "resourceDomains"
    ]);
    assert.equal("redirectDomains" in resource.ui.csp, false);
    assert.deepEqual(resource.ui.csp.connectDomains, []);
    assert.deepEqual(resource.ui.csp.frameDomains, []);
    assert.deepEqual(resource.ui.csp.baseUriDomains, []);
  }
  assert.deepEqual(manifest.resources[0].ui.csp.resourceDomains, [
    "https://skillpilot.com"
  ]);
  assert.deepEqual(manifest.resources[1].ui.csp.resourceDomains, []);
});

test("dist resources are content-addressed and byte-identical to stable classpath copies", async () => {
  const manifest = await readManifest();
  for (const resource of manifest.resources) {
    const distBytes = await readFile(join(root, "dist", resource.path));
    const classpathBytes = await readFile(join(repositoryRoot, resource.classpathPath));
    const sha256 = createHash("sha256").update(distBytes).digest("hex");
    assert.equal(sha256, resource.sha256);
    assert.equal(distBytes.length, resource.bytes);
    assert.ok(resource.bytes > 0 && resource.bytes <= 1_048_576);
    assert.deepEqual(classpathBytes, distBytes);
    assert.match(resource.path, new RegExp(`^sha256-${sha256}/`));
    assert.match(resource.uri, new RegExp(`/sha256-${sha256}/`));
    assert.match(
      resource.classpathPath,
      /^backend\/src\/main\/resources\/claude-connector-v1\/mcp-apps\/(goal-visualization|memory-card-practice)\.html$/
    );

    const html = distBytes.toString("utf8");
    assert.match(html, /^<!doctype html>/);
    assert.doesNotMatch(html, /learningSessionId|window\.openai|openai\/|openai:set_globals|toolResponseMetadata/);
    assert.doesNotMatch(html, /<script[^>]+src=|<link[^>]+rel=["']stylesheet/i);
  }
});

test("build is deterministic for dist and stable classpath bytes", async () => {
  const beforeManifest = await readFile(join(root, "dist/manifest.json"));
  const before = await resourceByteMap(JSON.parse(beforeManifest));
  const result = spawnSync(process.execPath, ["scripts/build-apps.mjs"], {
    cwd: root,
    encoding: "utf8"
  });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  const afterManifest = await readFile(join(root, "dist/manifest.json"));
  assert.deepEqual(afterManifest, beforeManifest);
  assert.deepEqual(await resourceByteMap(JSON.parse(afterManifest)), before);
});

test("a changed active UI is retained byte-identically and never rebound to a tool", async (t) => {
  const temporaryRoot = await mkdtemp(join(tmpdir(), "skillpilot-claude-ui-retention-"));
  t.after(() => rm(temporaryRoot, { recursive: true, force: true }));
  const outputRoot = join(temporaryRoot, "dist");
  const classpathRoot = join(temporaryRoot, "classpath");
  await mkdir(classpathRoot, { recursive: true });

  const previous = {
    "goal-visualization.html": Buffer.from("<!doctype html><title>retained goal</title>", "utf8"),
    "memory-card-practice.html": Buffer.from("<!doctype html><title>retained memory</title>", "utf8")
  };
  for (const [fileName, bytes] of Object.entries(previous)) {
    await writeFile(join(classpathRoot, fileName), bytes);
  }
  await writeFile(
    join(classpathRoot, "retained-resources.json"),
    `${JSON.stringify({ schemaVersion: 1, resources: [] }, null, 2)}\n`
  );

  const environment = {
    ...process.env,
    SKILLPILOT_CLAUDE_APP_TEST_OUTPUT_ROOT: outputRoot,
    SKILLPILOT_CLAUDE_APP_TEST_CLASSPATH_ROOT: classpathRoot
  };
  const first = spawnSync(process.execPath, ["scripts/build-apps.mjs"], {
    cwd: root,
    env: environment,
    encoding: "utf8"
  });
  assert.equal(first.status, 0, first.stderr || first.stdout);

  const manifestBytes = await readFile(join(outputRoot, "manifest.json"));
  const manifest = JSON.parse(manifestBytes);
  assert.equal(manifest.resources.length, 2);
  assert.equal(manifest.retainedResources.length, 2);
  const activeUris = new Set(Object.values(manifest.tools)
    .map((tool) => tool.resourceUri)
    .filter(Boolean));
  assert.deepEqual(activeUris, new Set(manifest.resources.map((resource) => resource.uri)));
  assert.ok(manifest.retainedResources.every((resource) => !activeUris.has(resource.uri)));

  const retainedIndex = JSON.parse(
    await readFile(join(classpathRoot, "retained-resources.json"), "utf8")
  );
  assert.equal(retainedIndex.resources.length, 2);
  for (const entry of retainedIndex.resources) {
    const expectedBytes = previous[entry.filename];
    const expectedSha256 = createHash("sha256").update(expectedBytes).digest("hex");
    assert.equal(entry.sha256, expectedSha256);
    const classpathBytes = await readFile(join(
      classpathRoot,
      "retained",
      `sha256-${entry.sha256}`,
      entry.filename
    ));
    const distBytes = await readFile(join(
      outputRoot,
      `sha256-${entry.sha256}`,
      entry.filename
    ));
    assert.deepEqual(classpathBytes, expectedBytes);
    assert.deepEqual(distBytes, expectedBytes);
  }

  const second = spawnSync(process.execPath, ["scripts/build-apps.mjs"], {
    cwd: root,
    env: environment,
    encoding: "utf8"
  });
  assert.equal(second.status, 0, second.stderr || second.stdout);
  assert.deepEqual(await readFile(join(outputRoot, "manifest.json")), manifestBytes);
});

async function resourceByteMap(manifest) {
  const result = {};
  for (const resource of [...manifest.resources, ...(manifest.retainedResources ?? [])]) {
    result[`dist:${resource.name}`] = await readFile(join(root, "dist", resource.path));
    result[`classpath:${resource.name}`] = await readFile(
      join(repositoryRoot, resource.classpathPath)
    );
  }
  return result;
}

async function readManifest() {
  return JSON.parse(await readFile(join(root, "dist/manifest.json"), "utf8"));
}

function hasOpenAiCompatibilityKey(value) {
  if (Array.isArray(value)) return value.some(hasOpenAiCompatibilityKey);
  if (!value || typeof value !== "object") return false;
  return Object.entries(value).some(([key, child]) =>
    key.toLowerCase().startsWith("openai/") || hasOpenAiCompatibilityKey(child));
}
