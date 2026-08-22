import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const expectedPackages = Object.freeze({
  "goal-visualization.html": Object.freeze([
    "@modelcontextprotocol/ext-apps@1.7.4",
    "@modelcontextprotocol/sdk@1.30.0",
    "zod-to-json-schema@3.25.2",
    "zod@4.4.3"
  ]),
  "memory-card-practice.html": Object.freeze([
    "@modelcontextprotocol/ext-apps@1.7.4",
    "@modelcontextprotocol/sdk@1.30.0",
    "katex@0.16.27",
    "zod-to-json-schema@3.25.2",
    "zod@4.4.3"
  ])
});

test("every self-contained Claude MCP App embeds exact notices for its bundled dependencies", async () => {
  const catalog = JSON.parse(await readFile(join(root, "third-party-notices.json"), "utf8"));
  const catalogByKey = new Map(catalog.packages.map((entry) => [
    `${entry.name}@${entry.version}`,
    entry
  ]));
  const manifest = JSON.parse(await readFile(join(root, "dist/manifest.json"), "utf8"));

  for (const resource of manifest.resources) {
    const fileName = resource.path.split("/").at(-1);
    const expected = expectedPackages[fileName];
    assert.ok(expected, `Unexpected Claude MCP App resource ${fileName}`);

    const html = await readFile(join(root, "dist", resource.path), "utf8");
    assert.doesNotMatch(
      html,
      /Parsed message|Sending message|Failed to parse message|console\.(?:debug|error|info|log|warn)\s*\(/,
      `${fileName} retains diagnostic payload logging`
    );
    const match = html.match(
      /<script type="text\/plain" id="skillpilot-third-party-notices">([\s\S]*?)<\/script>/
    );
    assert.ok(match, `${fileName} lacks embedded third-party notices`);
    const noticeText = match[1];
    assert.match(noticeText, /^SkillPilot Claude MCP App - Third-party software notices\n/);

    const actualHeaders = [...noticeText.matchAll(/^===== (.+) =====$/gm)]
      .map((header) => header[1]);
    assert.deepEqual(actualHeaders, [...expected].sort());

    for (const key of expected) {
      const entry = catalogByKey.get(key);
      assert.ok(entry, `Missing catalog entry ${key}`);
      const licenseText = (await readFile(
        join(root, "node_modules", entry.name, entry.licenseFile),
        "utf8"
      )).trimEnd();
      assert.match(noticeText, new RegExp(`^===== ${escapeRegExp(key)} =====$`, "m"));
      assert.ok(
        noticeText.includes(licenseText),
        `${fileName} does not contain the complete ${key} license text`
      );
    }
  }
});

test("notice catalog covers exactly the dependency union recorded by the two resources", async () => {
  const catalog = JSON.parse(await readFile(join(root, "third-party-notices.json"), "utf8"));
  const catalogKeys = catalog.packages
    .map((entry) => `${entry.name}@${entry.version}`)
    .sort();
  const expectedUnion = [...new Set(Object.values(expectedPackages).flat())].sort();
  assert.deepEqual(catalogKeys, expectedUnion);
  assert.deepEqual(Object.keys(catalog), ["schemaVersion", "packages"]);
});

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
