import { randomUUID } from "node:crypto";
import {
  cp,
  chmod,
  lstat,
  mkdtemp,
  open,
  readFile,
  readdir,
  rm,
} from "node:fs/promises";
import { hostname } from "node:os";
import { basename, dirname, isAbsolute, join, resolve } from "node:path";

import {
  assertPrivateInputDirectory,
  assertPrivateInputFile,
  ensurePrivateDirectory,
  writePrivateFile,
} from "./private-fs.js";
import { runtimeEnvironmentValue, type RuntimeEnvironment } from "./runtime-environment.js";
import type { DemoScenario } from "./types.js";

const PROFILE_LOCK_NAME = "SingletonLock";
const SNAPSHOT_DIRECTORY_PREFIX = ".browser-profile-snapshot-";
const SNAPSHOT_OWNER_MARKER = ".skillpilot-demo-snapshot-owner.json";
const SNAPSHOT_PROFILE_MARKER = ".skillpilot-demo-profile-snapshot.json";

interface SnapshotOwnership {
  token: string;
  pid: number;
  hostname: string;
}

interface OwnedSnapshot extends SnapshotOwnership {
  root: string;
}

const ownedSnapshots = new Map<string, OwnedSnapshot>();

export interface PersistentProfileSnapshot {
  path: string;
  cleanup(): Promise<void>;
}

export interface PersistentProfileSnapshotFileSystem {
  copy: typeof cp;
  remove: typeof rm;
}

const defaultSnapshotFileSystem: PersistentProfileSnapshotFileSystem = {
  copy: cp,
  remove: rm,
};

export function persistentProfilePath(
  scenario: DemoScenario,
  environment?: RuntimeEnvironment,
): string | undefined {
  const environmentName = scenario.browser.persistentProfilePathFromEnv;
  if (!environmentName) return undefined;
  const value = runtimeEnvironmentValue(environment, environmentName)?.trim();
  if (!value) {
    throw new Error(`Missing environment variable ${environmentName} for the persistent Chromium profile`);
  }
  if (!isAbsolute(value)) {
    throw new Error("The persistent Chromium profile path must be absolute");
  }
  return resolve(value);
}

async function assertNoSymbolicLinks(path: string, label: string): Promise<void> {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    const entryPath = join(path, entry.name);
    if (entry.isSymbolicLink()) {
      throw new Error(`${label} must not contain symbolic links`);
    }
    if (entry.isDirectory()) await assertNoSymbolicLinks(entryPath, label);
  }
}

async function assertNoChromiumLock(path: string, label: string): Promise<void> {
  const lock = await lstat(join(path, PROFILE_LOCK_NAME)).catch((error: NodeJS.ErrnoException) => {
    if (error.code === "ENOENT") return undefined;
    throw error;
  });
  if (lock) {
    throw new Error(`${label} is already open in Chromium; close every window using it first`);
  }
}

export async function validatePersistentChromiumProfile(
  path: string,
  label = "Persistent Chromium profile",
): Promise<void> {
  await assertPrivateInputDirectory(path, label);
  await Promise.all([
    assertPrivateInputFile(join(path, "Local State"), `${label} Local State`),
    assertPrivateInputDirectory(join(path, "Default"), `${label} Default profile`),
  ]);
  await assertNoChromiumLock(path, label);
  await assertNoSymbolicLinks(path, label);
}

function generatorLockPath(profilePath: string): string {
  return join(dirname(profilePath), `.${basename(profilePath)}.demo-video.lock`);
}

function combineErrors(primary: unknown, cleanup: unknown, message: string): unknown {
  if (primary === undefined) return cleanup;
  if (cleanup === undefined) return primary;
  return new AggregateError([primary, cleanup], message);
}

export async function acquirePersistentProfileLock(
  path: string,
  label = "Persistent Chromium profile",
): Promise<() => Promise<void>> {
  await validatePersistentChromiumProfile(path, label);
  const lockPath = generatorLockPath(path);
  let handle;
  try {
    handle = await open(lockPath, "wx", 0o600);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "EEXIST") {
      throw new Error(`${label} is already reserved by another demo-video process`);
    }
    throw error;
  }
  try {
    await handle.chmod(0o600);
    await handle.writeFile(`${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`, "utf8");
    await handle.close();
  } catch (error) {
    let cleanupError: unknown;
    try {
      await handle.close();
    } catch (failure) {
      cleanupError = failure;
    }
    try {
      await rm(lockPath, { force: true });
    } catch (failure) {
      cleanupError = combineErrors(cleanupError, failure, "Persistent-profile lock cleanup failed");
    }
    throw combineErrors(error, cleanupError, "Persistent-profile lock initialization and cleanup failed");
  }
  let released = false;
  return async () => {
    if (released) return;
    await rm(lockPath, { force: true });
    released = true;
  };
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    return code !== "ESRCH";
  }
}

function parseSnapshotOwnership(source: string): SnapshotOwnership | undefined {
  try {
    const value = JSON.parse(source) as Partial<SnapshotOwnership>;
    if (typeof value.token !== "string" || value.token.length < 16) return undefined;
    if (!Number.isSafeInteger(value.pid) || (value.pid ?? 0) <= 0) return undefined;
    if (typeof value.hostname !== "string" || value.hostname.length === 0) return undefined;
    return value as SnapshotOwnership;
  } catch {
    return undefined;
  }
}

/**
 * Removes only well-formed snapshots from a dead process on this host. Unknown,
 * malformed, remote-host, and live-process directories are left untouched.
 */
export async function recoverAbandonedPersistentProfileSnapshots(
  snapshotParent: string,
  fileSystem: Pick<PersistentProfileSnapshotFileSystem, "remove"> = defaultSnapshotFileSystem,
): Promise<number> {
  await ensurePrivateDirectory(snapshotParent);
  let recovered = 0;
  for (const entry of await readdir(snapshotParent, { withFileTypes: true })) {
    if (!entry.isDirectory() || !entry.name.startsWith(SNAPSHOT_DIRECTORY_PREFIX)) continue;
    const root = join(snapshotParent, entry.name);
    const markerPath = join(root, SNAPSHOT_OWNER_MARKER);
    const metadata = await lstat(markerPath).catch((error: NodeJS.ErrnoException) => {
      if (error.code === "ENOENT") return undefined;
      throw error;
    });
    if (!metadata?.isFile() || metadata.isSymbolicLink()) continue;
    const owner = parseSnapshotOwnership(await readFile(markerPath, "utf8"));
    if (!owner || owner.hostname !== hostname() || processIsAlive(owner.pid)) continue;
    await fileSystem.remove(root, { recursive: true, force: true });
    recovered += 1;
  }
  return recovered;
}

async function writeSnapshotMarker(path: string, owner: SnapshotOwnership): Promise<void> {
  await writePrivateFile(path, `${JSON.stringify(owner)}\n`, { encoding: "utf8" });
}

/**
 * Fails unless the profile is the exact live, run-owned snapshot registered by
 * this process. Copying the marker or pointing the environment at the operator
 * source profile cannot satisfy this assertion.
 */
export async function assertRunOwnedPersistentProfileSnapshot(path: string): Promise<void> {
  const normalizedPath = resolve(path);
  const expected = ownedSnapshots.get(normalizedPath);
  if (!expected) {
    throw new Error("Review browser requires a run-owned disposable Chromium profile snapshot");
  }
  const markerPath = join(normalizedPath, SNAPSHOT_PROFILE_MARKER);
  await assertPrivateInputFile(markerPath, "Run-owned Chromium snapshot marker");
  const actual = parseSnapshotOwnership(await readFile(markerPath, "utf8"));
  if (!actual
      || actual.token !== expected.token
      || actual.pid !== expected.pid
      || actual.hostname !== expected.hostname
      || expected.root !== dirname(normalizedPath)) {
    throw new Error("Run-owned Chromium profile snapshot provenance is invalid");
  }
}

/**
 * Copies a closed, verified operator profile into a private run-scoped user
 * data directory. Playwright may update only this disposable copy; the source
 * profile that the operator logged into stays unchanged.
 */
export async function createPersistentProfileSnapshot(
  sourcePath: string,
  snapshotParent: string,
  fileSystem: PersistentProfileSnapshotFileSystem = defaultSnapshotFileSystem,
): Promise<PersistentProfileSnapshot> {
  const releaseSource = await acquirePersistentProfileLock(
    sourcePath,
    "Operator Chromium profile",
  );
  let snapshotRoot: string | undefined;
  let snapshotPath: string | undefined;
  let result: PersistentProfileSnapshot | undefined;
  let operationError: unknown;
  try {
    await ensurePrivateDirectory(snapshotParent);
    await recoverAbandonedPersistentProfileSnapshots(snapshotParent, fileSystem);
    const owner: SnapshotOwnership = {
      token: randomUUID(),
      pid: process.pid,
      hostname: hostname(),
    };
    const createdSnapshotRoot = await mkdtemp(join(snapshotParent, SNAPSHOT_DIRECTORY_PREFIX));
    snapshotRoot = createdSnapshotRoot;
    await chmod(createdSnapshotRoot, 0o700);
    await writeSnapshotMarker(join(createdSnapshotRoot, SNAPSHOT_OWNER_MARKER), owner);
    const createdSnapshotPath = join(createdSnapshotRoot, "profile");
    snapshotPath = createdSnapshotPath;
    await fileSystem.copy(sourcePath, createdSnapshotPath, {
      recursive: true,
      errorOnExist: true,
      force: false,
      preserveTimestamps: true,
      verbatimSymlinks: true,
    });
    await chmod(createdSnapshotPath, 0o700);
    // Fail if a normal browser raced with the copy. A partial live profile is
    // never an acceptable review input.
    await assertNoChromiumLock(sourcePath, "Operator Chromium profile");
    await validatePersistentChromiumProfile(createdSnapshotPath, "Chromium profile snapshot");
    await writeSnapshotMarker(join(createdSnapshotPath, SNAPSHOT_PROFILE_MARKER), owner);
    const normalizedPath = resolve(createdSnapshotPath);
    ownedSnapshots.set(normalizedPath, { ...owner, root: resolve(createdSnapshotRoot) });
    let cleaned = false;
    result = {
      path: createdSnapshotPath,
      cleanup: async () => {
        if (cleaned) return;
        // Remove first. Ownership and retryability remain intact if deletion
        // fails, and no caller may publish a completion marker in that state.
        await fileSystem.remove(createdSnapshotRoot, { recursive: true, force: true });
        ownedSnapshots.delete(normalizedPath);
        cleaned = true;
      },
    };
  } catch (error) {
    operationError = error;
  }

  if (operationError !== undefined && snapshotRoot) {
    try {
      await fileSystem.remove(snapshotRoot, { recursive: true, force: true });
      if (snapshotPath) ownedSnapshots.delete(resolve(snapshotPath));
    } catch (cleanupError) {
      operationError = combineErrors(
        operationError,
        cleanupError,
        "Persistent-profile snapshot creation failed and partial snapshot cleanup was incomplete",
      );
    }
  }

  try {
    await releaseSource();
  } catch (releaseError) {
    if (result) {
      try {
        await result.cleanup();
      } catch (cleanupError) {
        operationError = combineErrors(
          operationError,
          cleanupError,
          "Persistent-profile source lock release and snapshot cleanup failed",
        );
      }
      result = undefined;
    }
    operationError = combineErrors(
      operationError,
      releaseError,
      "Persistent-profile preparation and source lock release failed",
    );
  }

  if (operationError !== undefined) throw operationError;
  if (!result) throw new Error("Persistent-profile snapshot creation produced no result");
  return result;
}
