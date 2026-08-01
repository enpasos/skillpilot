import { spawnSync } from "node:child_process";
import {
  lstatSync,
  readFileSync,
  writeFileSync,
} from "node:fs";
import { basename, relative, resolve, sep } from "node:path";

const TAR_BLOCK_BYTES = 512;
const TAR_RECORD_BYTES = 20 * TAR_BLOCK_BYTES;
const SUPPORTED_GIT_MODES = new Map([
  ["100644", 0o644],
  ["100755", 0o755],
]);

export function pluginInstallBundleArchiveName(pluginIdentity, version) {
  if (
    !/^skillpilot-[a-z0-9]+(?:-[a-z0-9]+)*$/.test(pluginIdentity) ||
    pluginIdentity === "skillpilot-server"
  ) {
    throw new Error(`Invalid SkillPilot plugin identity: ${pluginIdentity}`);
  }
  if (!/^\d+\.\d+\.\d+$/.test(version)) {
    throw new Error(`Invalid SkillPilot plugin version: ${version}`);
  }
  return `skillpilot-openai-plugin-${pluginIdentity.slice("skillpilot-".length)}-${version}.tar`;
}

export function createReproducibleTrackedArchive({
  repositoryRoot,
  sourceRoot,
  archivePath,
}) {
  const archiveRoot = toArchivePath(basename(sourceRoot));
  const inventory = readTrackedInventory(repositoryRoot, sourceRoot);
  assertNoUntrackedOrIgnoredPaths(repositoryRoot, sourceRoot);

  const entries = new Map();
  addDirectoryEntry(entries, archiveRoot);
  for (const entry of inventory) {
    const sourcePath = resolve(repositoryRoot, entry.path);
    const sourceStat = lstatSync(sourcePath);
    if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
      throw new Error(
        `Tracked plugin path must be a regular file: ${entry.path}`,
      );
    }

    const archiveEntryPath = `${archiveRoot}/${toArchivePath(entry.archivePath)}`;
    addParentDirectories(entries, archiveEntryPath);
    if (entries.has(archiveEntryPath)) {
      throw new Error(
        `Duplicate plugin archive path after normalization: ${archiveEntryPath}`,
      );
    }
    entries.set(archiveEntryPath, {
      path: archiveEntryPath,
      type: "file",
      mode: entry.fileMode,
      content: readFileSync(sourcePath),
    });
  }

  const blocks = [];
  const sortedEntries = [...entries.values()].sort((left, right) =>
    Buffer.compare(Buffer.from(left.path), Buffer.from(right.path)),
  );
  for (const entry of sortedEntries) {
    blocks.push(createUstarHeader(entry));
    if (entry.type === "file") {
      blocks.push(entry.content);
      const paddingBytes =
        (TAR_BLOCK_BYTES - (entry.content.length % TAR_BLOCK_BYTES)) %
        TAR_BLOCK_BYTES;
      if (paddingBytes > 0) {
        blocks.push(Buffer.alloc(paddingBytes));
      }
    }
  }
  blocks.push(Buffer.alloc(TAR_BLOCK_BYTES * 2));

  const unpaddedArchive = Buffer.concat(blocks);
  const recordPadding =
    (TAR_RECORD_BYTES - (unpaddedArchive.length % TAR_RECORD_BYTES)) %
    TAR_RECORD_BYTES;
  const archive =
    recordPadding === 0
      ? unpaddedArchive
      : Buffer.concat([unpaddedArchive, Buffer.alloc(recordPadding)]);
  writeFileSync(archivePath, archive);
}

export function readTrackedInventory(repositoryRoot, sourceRoot) {
  const sourcePathspec = toRepositoryPath(repositoryRoot, sourceRoot);
  const result = run(
    "git",
    ["ls-files", "--stage", "-z", "--", sourcePathspec],
    repositoryRoot,
  );
  const entries = result.stdout
    .split("\0")
    .filter(Boolean)
    .map((record) => {
      const match = /^(\d{6}) ([0-9a-f]+) (\d)\t(.+)$/s.exec(record);
      if (match === null) {
        throw new Error(`Unexpected git inventory record: ${record}`);
      }
      const [, gitMode, , stage, path] = match;
      if (stage !== "0") {
        throw new Error(`Plugin inventory contains an unmerged path: ${path}`);
      }
      const fileMode = SUPPORTED_GIT_MODES.get(gitMode);
      if (fileMode === undefined) {
        throw new Error(
          `Unsupported tracked plugin mode ${gitMode} for ${path}; only regular 0644/0755 files are allowed.`,
        );
      }
      const archivePath = relative(sourceRoot, resolve(repositoryRoot, path));
      if (
        archivePath === "" ||
        archivePath === ".." ||
        archivePath.startsWith("../") ||
        archivePath.startsWith("..\\")
      ) {
        throw new Error(`Tracked plugin path escapes its root: ${path}`);
      }
      return { path, archivePath, fileMode };
    });

  if (entries.length === 0) {
    throw new Error(`No Git-tracked plugin files found below ${sourcePathspec}.`);
  }
  return entries;
}

function createUstarHeader(entry) {
  const header = Buffer.alloc(TAR_BLOCK_BYTES);
  const { name, prefix } = splitUstarPath(entry.path);
  writeString(header, 0, 100, name);
  writeOctal(header, 100, 8, entry.mode);
  writeOctal(header, 108, 8, 0);
  writeOctal(header, 116, 8, 0);
  writeOctal(header, 124, 12, entry.type === "file" ? entry.content.length : 0);
  writeOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  writeString(header, 156, 1, entry.type === "file" ? "0" : "5");
  writeString(header, 257, 6, "ustar\0");
  writeString(header, 263, 2, "00");
  writeOctal(header, 329, 8, 0);
  writeOctal(header, 337, 8, 0);
  writeString(header, 345, 155, prefix);

  const checksum = header.reduce((sum, byte) => sum + byte, 0);
  const checksumText = `${toOctal(checksum, 6)}\0 `;
  writeString(header, 148, 8, checksumText);
  return header;
}

function splitUstarPath(path) {
  assertSafeArchivePath(path);
  if (Buffer.byteLength(path) <= 100) {
    return { name: path, prefix: "" };
  }
  for (let separator = path.lastIndexOf("/"); separator > 0; ) {
    const prefix = path.slice(0, separator);
    const name = path.slice(separator + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) {
      return { name, prefix };
    }
    separator = path.lastIndexOf("/", separator - 1);
  }
  throw new Error(`Plugin archive path exceeds the USTAR limit: ${path}`);
}

function writeString(buffer, offset, length, value) {
  const encoded = Buffer.from(value);
  if (encoded.length > length) {
    throw new Error(`USTAR field exceeds ${length} bytes: ${value}`);
  }
  encoded.copy(buffer, offset);
}

function writeOctal(buffer, offset, length, value) {
  writeString(buffer, offset, length, `${toOctal(value, length - 1)}\0`);
}

function toOctal(value, digits) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`USTAR numeric value is invalid: ${value}`);
  }
  const encoded = value.toString(8);
  if (encoded.length > digits) {
    throw new Error(`USTAR numeric value exceeds ${digits} octal digits: ${value}`);
  }
  return encoded.padStart(digits, "0");
}

function addParentDirectories(entries, path) {
  let separator = path.lastIndexOf("/");
  while (separator > 0) {
    addDirectoryEntry(entries, path.slice(0, separator));
    separator = path.lastIndexOf("/", separator - 1);
  }
}

function addDirectoryEntry(entries, path) {
  if (!entries.has(path)) {
    entries.set(path, {
      path,
      type: "directory",
      mode: 0o755,
      content: Buffer.alloc(0),
    });
  }
}

function toArchivePath(path) {
  if (sep !== "\\" && path.includes("\\")) {
    throw new Error(`Backslashes are not allowed in plugin archive paths: ${path}`);
  }
  const normalized = sep === "\\" ? path.replaceAll("\\", "/") : path;
  assertSafeArchivePath(normalized);
  return normalized;
}

function assertSafeArchivePath(path) {
  if (
    path === "" ||
    path.startsWith("/") ||
    path.includes("\0") ||
    path.split("/").some((component) => component === "" || component === "..")
  ) {
    throw new Error(`Unsafe plugin archive path: ${path}`);
  }
}

function assertNoUntrackedOrIgnoredPaths(repositoryRoot, sourceRoot) {
  const sourcePathspec = toRepositoryPath(repositoryRoot, sourceRoot);
  const result = run(
    "git",
    [
      "status",
      "--porcelain=v1",
      "-z",
      "--ignored=matching",
      "--untracked-files=all",
      "--",
      sourcePathspec,
    ],
    repositoryRoot,
  );
  for (const record of result.stdout.split("\0").filter(Boolean)) {
    const status = record.slice(0, 2);
    const path = record.slice(3);
    if (status === "??") {
      throw new Error(
        `Untracked path below the plugin root is not release input: ${path}`,
      );
    }
    if (status === "!!") {
      throw new Error(
        `Ignored path below the plugin root is not release input: ${path}`,
      );
    }
  }
}

function toRepositoryPath(repositoryRoot, path) {
  const repositoryPath = relative(repositoryRoot, path);
  if (
    repositoryPath === "" ||
    repositoryPath === ".." ||
    repositoryPath.startsWith("../") ||
    repositoryPath.startsWith("..\\")
  ) {
    throw new Error(`Plugin root must be inside the repository: ${path}`);
  }
  return sep === "\\" ? repositoryPath.replaceAll("\\", "/") : repositoryPath;
}

function run(executable, args, cwd) {
  const result = spawnSync(executable, args, {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });
  if (result.status !== 0) {
    throw new Error(
      `${executable} failed (${result.status}):\n${result.stdout}\n${result.stderr}`,
    );
  }
  return result;
}
