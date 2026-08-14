import assert from "node:assert/strict";
import { chmod, lstat, mkdtemp, readFile, symlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  assertPrivateInputFile,
  ensurePrivateDirectory,
  writePrivateFile,
} from "../src/private-fs.js";

test("creates private directories and files without exposing content", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "demo-private-fs-"));
  await chmod(root, 0o700);
  const directory = path.join(root, "output");
  const file = path.join(directory, "artifact.json");
  await ensurePrivateDirectory(directory);
  await writePrivateFile(file, "private");
  if (process.platform !== "win32") {
    assert.equal((await lstat(directory)).mode & 0o777, 0o700);
    assert.equal((await lstat(file)).mode & 0o777, 0o600);
  }
  assert.equal(await readFile(file, "utf8"), "private");
});

test("does not chmod or accept a pre-existing shared directory", async (t) => {
  if (process.platform === "win32") return t.skip("POSIX permission contract");
  const root = await mkdtemp(path.join(os.tmpdir(), "demo-private-fs-"));
  const shared = path.join(root, "shared");
  await ensurePrivateDirectory(shared);
  await chmod(shared, 0o755);
  await assert.rejects(ensurePrivateDirectory(shared), /accessible by group or others/u);
  assert.equal((await lstat(shared)).mode & 0o777, 0o755);
});

test("rejects symlink path components and non-private storage state", async (t) => {
  if (process.platform === "win32") return t.skip("POSIX symlink and permission contract");
  const root = await mkdtemp(path.join(os.tmpdir(), "demo-private-fs-"));
  await chmod(root, 0o700);
  const target = path.join(root, "target");
  const linked = path.join(root, "linked");
  await ensurePrivateDirectory(target);
  await symlink(target, linked, "dir");
  await assert.rejects(ensurePrivateDirectory(path.join(linked, "output")), /symbolic link/u);

  const state = path.join(root, "storage-state.json");
  await writeFile(state, "{}");
  await chmod(state, 0o644);
  await assert.rejects(assertPrivateInputFile(state, "browser.storageState"), /group or others/u);
  await chmod(state, 0o600);
  await assertPrivateInputFile(state, "browser.storageState");
});
