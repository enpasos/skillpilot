import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  cpSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { buildClaudePluginPackage } from "./build-package.mjs";
import { publicationFiles } from "./check-package.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));

test("builds a deterministic root-level Claude .plugin archive", () => {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-plugin-build-"));
  try {
    const firstPath = resolve(temporaryRoot, "first.plugin");
    const secondPath = resolve(temporaryRoot, "second.plugin");
    const first = buildClaudePluginPackage({ outputPath: firstPath });
    const second = buildClaudePluginPackage({ outputPath: secondPath });
    const firstBytes = readFileSync(firstPath);
    const secondBytes = readFileSync(secondPath);

    assert.deepEqual(firstBytes, secondBytes);
    assert.equal(first.sha256, second.sha256);
    assert.equal(first.bytes, firstBytes.length);
    assert.ok(first.bytes < 50 * 1024 * 1024);
    assert.equal(
      first.sha256,
      createHash("sha256").update(firstBytes).digest("hex"),
    );

    const entries = readStoredZip(firstBytes);
    const expectedPaths = [...publicationFiles].sort((left, right) =>
      left < right ? -1 : left > right ? 1 : 0);
    assert.deepEqual(entries.map(({ name }) => name), expectedPaths);
    assert.equal(entries[0].name.startsWith("skillpilot-coach-v1/"), false);

    for (const entry of entries) {
      assert.equal(entry.flags, 0x0800);
      assert.equal(entry.method, 0);
      assert.equal(entry.dosTime, 0);
      assert.equal(entry.dosDate, (1 << 5) | 1);
      assert.equal(entry.extraBytes, 0);
      assert.deepEqual(entry.content, readFileSync(resolve(packageRoot, entry.name)));
    }
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

test("refuses to package a structurally invalid Claude plugin", () => {
  const temporaryRoot = mkdtempSync(resolve(tmpdir(), "skillpilot-claude-plugin-invalid-"));
  try {
    const sourceRoot = resolve(temporaryRoot, "source");
    cpSync(packageRoot, sourceRoot, { recursive: true });
    const mcpPath = resolve(sourceRoot, ".mcp.json");
    writeFileSync(
      mcpPath,
      readFileSync(mcpPath, "utf8").replace(
        "https://mcp-claude-v1.skillpilot.com/mcp",
        "https://skillpilot.com/mcp",
      ),
    );
    assert.throws(
      () => buildClaudePluginPackage({
        root: sourceRoot,
        outputPath: resolve(temporaryRoot, "invalid.plugin"),
      }),
      /Unexpected SkillPilot MCP endpoint/u,
    );
  } finally {
    rmSync(temporaryRoot, { recursive: true, force: true });
  }
});

function readStoredZip(archive) {
  const eocdOffset = archive.length - 22;
  assert.ok(eocdOffset >= 0);
  assert.equal(archive.readUInt32LE(eocdOffset), 0x06054b50);
  assert.equal(archive.readUInt16LE(eocdOffset + 20), 0);
  const expectedCount = archive.readUInt16LE(eocdOffset + 8);
  assert.equal(archive.readUInt16LE(eocdOffset + 10), expectedCount);
  const centralOffset = archive.readUInt32LE(eocdOffset + 16);
  const entries = [];
  let offset = 0;

  while (offset < centralOffset) {
    assert.equal(archive.readUInt32LE(offset), 0x04034b50);
    const flags = archive.readUInt16LE(offset + 6);
    const method = archive.readUInt16LE(offset + 8);
    const dosTime = archive.readUInt16LE(offset + 10);
    const dosDate = archive.readUInt16LE(offset + 12);
    const compressedBytes = archive.readUInt32LE(offset + 18);
    const uncompressedBytes = archive.readUInt32LE(offset + 22);
    const nameBytes = archive.readUInt16LE(offset + 26);
    const extraBytes = archive.readUInt16LE(offset + 28);
    assert.equal(compressedBytes, uncompressedBytes);
    const nameStart = offset + 30;
    const contentStart = nameStart + nameBytes + extraBytes;
    entries.push({
      name: archive.subarray(nameStart, nameStart + nameBytes).toString("utf8"),
      content: archive.subarray(contentStart, contentStart + uncompressedBytes),
      flags,
      method,
      dosTime,
      dosDate,
      extraBytes,
    });
    offset = contentStart + uncompressedBytes;
  }

  assert.equal(offset, centralOffset);
  assert.equal(entries.length, expectedCount);
  return entries;
}
