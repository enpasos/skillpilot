import { createHash, randomBytes } from "node:crypto";
import {
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { crc32 } from "node:zlib";
import {
  publicationFiles,
  validateClaudePluginPackage,
} from "./check-package.mjs";

const packageRoot = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(packageRoot, "../../../..");
const defaultOutput = resolve(
  repoRoot,
  "tmp/claude-plugin/skillpilot-coach-v1.plugin",
);
const fixedDosTime = 0;
const fixedDosDate = (1 << 5) | 1;
const maximumArchiveBytes = 50 * 1024 * 1024;
const compareCodeUnits = (left, right) => (left < right ? -1 : left > right ? 1 : 0);

export function buildClaudePluginPackage({
  root = packageRoot,
  outputPath = defaultOutput,
} = {}) {
  const sourceRoot = resolve(root);
  const resolvedOutput = resolve(outputPath);
  const validation = validateClaudePluginPackage(sourceRoot);
  if (validation.errors.length > 0) {
    throw new Error(
      `Claude plugin package validation failed:\n- ${validation.errors.join("\n- ")}`,
    );
  }

  const entries = publicationFiles
    .map((packagePath) => {
      const content = readFileSync(resolve(sourceRoot, packagePath));
      return {
        packagePath,
        content,
        crc32: crc32(content) >>> 0,
      };
    })
    .sort((left, right) => compareCodeUnits(left.packagePath, right.packagePath));

  const localParts = [];
  const centralParts = [];
  let offset = 0;

  for (const entry of entries) {
    const name = Buffer.from(entry.packagePath, "utf8");
    const localHeader = Buffer.alloc(30);
    localHeader.writeUInt32LE(0x04034b50, 0);
    localHeader.writeUInt16LE(20, 4);
    localHeader.writeUInt16LE(0x0800, 6);
    localHeader.writeUInt16LE(0, 8);
    localHeader.writeUInt16LE(fixedDosTime, 10);
    localHeader.writeUInt16LE(fixedDosDate, 12);
    localHeader.writeUInt32LE(entry.crc32, 14);
    localHeader.writeUInt32LE(entry.content.length, 18);
    localHeader.writeUInt32LE(entry.content.length, 22);
    localHeader.writeUInt16LE(name.length, 26);
    localHeader.writeUInt16LE(0, 28);
    localParts.push(localHeader, name, entry.content);

    const centralHeader = Buffer.alloc(46);
    centralHeader.writeUInt32LE(0x02014b50, 0);
    centralHeader.writeUInt16LE(20, 4);
    centralHeader.writeUInt16LE(20, 6);
    centralHeader.writeUInt16LE(0x0800, 8);
    centralHeader.writeUInt16LE(0, 10);
    centralHeader.writeUInt16LE(fixedDosTime, 12);
    centralHeader.writeUInt16LE(fixedDosDate, 14);
    centralHeader.writeUInt32LE(entry.crc32, 16);
    centralHeader.writeUInt32LE(entry.content.length, 20);
    centralHeader.writeUInt32LE(entry.content.length, 24);
    centralHeader.writeUInt16LE(name.length, 28);
    centralHeader.writeUInt16LE(0, 30);
    centralHeader.writeUInt16LE(0, 32);
    centralHeader.writeUInt16LE(0, 34);
    centralHeader.writeUInt16LE(0, 36);
    centralHeader.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    centralHeader.writeUInt32LE(offset, 42);
    centralParts.push(centralHeader, name);

    offset += localHeader.length + name.length + entry.content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const endOfCentralDirectory = Buffer.alloc(22);
  endOfCentralDirectory.writeUInt32LE(0x06054b50, 0);
  endOfCentralDirectory.writeUInt16LE(0, 4);
  endOfCentralDirectory.writeUInt16LE(0, 6);
  endOfCentralDirectory.writeUInt16LE(entries.length, 8);
  endOfCentralDirectory.writeUInt16LE(entries.length, 10);
  endOfCentralDirectory.writeUInt32LE(centralDirectory.length, 12);
  endOfCentralDirectory.writeUInt32LE(offset, 16);
  endOfCentralDirectory.writeUInt16LE(0, 20);

  const archive = Buffer.concat([
    ...localParts,
    centralDirectory,
    endOfCentralDirectory,
  ]);
  if (archive.length > maximumArchiveBytes) {
    throw new Error(
      `Claude plugin archive exceeds the 50 MiB upload limit: ${archive.length} bytes.`,
    );
  }

  mkdirSync(dirname(resolvedOutput), { recursive: true });
  const temporaryPath = `${resolvedOutput}.tmp-${process.pid}-${randomBytes(12).toString("hex")}`;
  try {
    writeFileSync(temporaryPath, archive, { flag: "wx", mode: 0o600 });
    renameSync(temporaryPath, resolvedOutput);
  } catch (error) {
    rmSync(temporaryPath, { force: true });
    throw error;
  }

  return {
    outputPath: resolvedOutput,
    bytes: archive.length,
    sha256: createHash("sha256").update(archive).digest("hex"),
    entries: entries.map(({ packagePath, content }) => ({
      packagePath,
      bytes: content.length,
      sha256: createHash("sha256").update(content).digest("hex"),
    })),
  };
}

function optionValue(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

function main() {
  const result = buildClaudePluginPackage({
    root: optionValue("--package-root") ?? packageRoot,
    outputPath: optionValue("--output") ?? defaultOutput,
  });
  console.log(
    `CHECK claude_plugin_v1 PACKAGE_BUILT entries=${result.entries.length} bytes=${result.bytes}`,
  );
  console.log(`Artifact=${result.outputPath}`);
  console.log(`SHA256=${result.sha256}`);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
