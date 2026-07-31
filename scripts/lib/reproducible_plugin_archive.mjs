import { spawnSync } from "node:child_process";
import {
  chmodSync,
  copyFileSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
} from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";

const SUPPORTED_GIT_MODES = new Map([
  ["100644", 0o644],
  ["100755", 0o755],
]);

export function createReproducibleTrackedArchive({
  repositoryRoot,
  sourceRoot,
  archivePath,
  environment = process.env,
}) {
  const inventory = readTrackedInventory(repositoryRoot, sourceRoot);
  assertNoUntrackedOrIgnoredPaths(repositoryRoot, sourceRoot);

  const stagingParent = mkdtempSync(
    resolve(dirname(archivePath), ".openai-plugin-archive-"),
  );
  const stagedRoot = resolve(stagingParent, basename(sourceRoot));

  try {
    mkdirSync(stagedRoot, { recursive: true, mode: 0o755 });
    chmodSync(stagedRoot, 0o755);
    for (const entry of inventory) {
      const sourcePath = resolve(repositoryRoot, entry.path);
      const sourceStat = lstatSync(sourcePath);
      if (!sourceStat.isFile() || sourceStat.isSymbolicLink()) {
        throw new Error(
          `Tracked plugin path must be a regular file: ${entry.path}`,
        );
      }

      const destinationPath = resolve(stagedRoot, entry.archivePath);
      ensureDirectory(dirname(destinationPath), stagedRoot);
      copyFileSync(sourcePath, destinationPath);
      chmodSync(destinationPath, entry.fileMode);
    }

    run(
      "tar",
      [
        "--format=ustar",
        "--sort=name",
        "--mtime=@0",
        "--owner=0",
        "--group=0",
        "--numeric-owner",
        "--blocking-factor=20",
        "--mode=a=rX,u+w",
        "-cf",
        archivePath,
        "-C",
        stagingParent,
        basename(stagedRoot),
      ],
      repositoryRoot,
      {
        ...environment,
        LC_ALL: "C",
        TZ: "UTC",
        TAR_OPTIONS: "",
      },
    );
  } finally {
    rmSync(stagingParent, { recursive: true, force: true });
  }
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

function ensureDirectory(path, boundary) {
  if (path === boundary) {
    return;
  }
  ensureDirectory(dirname(path), boundary);
  mkdirSync(path, { recursive: true, mode: 0o755 });
  chmodSync(path, 0o755);
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
  return repositoryPath.replaceAll("\\", "/");
}

function run(executable, args, cwd, env = process.env) {
  const result = spawnSync(executable, args, {
    cwd,
    env,
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
