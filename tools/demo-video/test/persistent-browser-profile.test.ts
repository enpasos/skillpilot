import assert from "node:assert/strict";
import {
  access,
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { loadScenario } from "../src/config.js";
import {
  acquirePersistentProfileLock,
  assertRunOwnedPersistentProfileSnapshot,
  createPersistentProfileSnapshot,
  persistentProfilePath,
  validatePersistentChromiumProfile,
} from "../src/persistent-browser-profile.js";

async function createPrivateProfile(root: string): Promise<string> {
  const profile = join(root, "operator-profile");
  await mkdir(join(profile, "Default"), { recursive: true, mode: 0o700 });
  await writeFile(join(profile, "Local State"), "{}\n", { mode: 0o600 });
  await writeFile(join(profile, "Default", "Preferences"), "source\n", { mode: 0o600 });
  return profile;
}

test("resolves a persistent profile only from its runtime environment binding", async () => {
  const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
  const path = resolve("secrets", "operator-profile");
  assert.equal(
    persistentProfilePath(scenario, { SKILLPILOT_REVIEW_CHATGPT_PROFILE: path }),
    path,
  );
  assert.throws(() => persistentProfilePath(scenario, {}), /Missing environment variable/u);
  assert.throws(
    () => persistentProfilePath(scenario, { SKILLPILOT_REVIEW_CHATGPT_PROFILE: "relative" }),
    /must be absolute/u,
  );
});

test("takes an exclusive generator lease and rejects a Chromium-owned profile", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-profile-lock-"));
  try {
    const profile = await createPrivateProfile(directory);
    const release = await acquirePersistentProfileLock(profile);
    await assert.rejects(
      acquirePersistentProfileLock(profile),
      /already reserved by another demo-video process/u,
    );
    await release();
    const releaseAgain = await acquirePersistentProfileLock(profile);
    await releaseAgain();

    await writeFile(join(profile, "SingletonLock"), "browser-owned\n", { mode: 0o600 });
    await assert.rejects(
      validatePersistentChromiumProfile(profile),
      /already open in Chromium/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("uses a private disposable snapshot without modifying or syncing back to the source", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-profile-snapshot-"));
  try {
    const profile = await createPrivateProfile(directory);
    const cache = join(directory, "cache");
    await mkdir(cache, { mode: 0o700 });
    const snapshot = await createPersistentProfileSnapshot(profile, cache);
    assert.notEqual(snapshot.path, profile);
    assert.ok(snapshot.path.startsWith(`${cache}/`));
    assert.equal(await readFile(join(snapshot.path, "Default", "Preferences"), "utf8"), "source\n");
    await assertRunOwnedPersistentProfileSnapshot(snapshot.path);
    await assert.rejects(
      assertRunOwnedPersistentProfileSnapshot(profile),
      /run-owned disposable Chromium profile snapshot/u,
    );

    const copiedProfile = join(directory, "copied-profile");
    await cp(snapshot.path, copiedProfile, { recursive: true });
    await assert.rejects(
      assertRunOwnedPersistentProfileSnapshot(copiedProfile),
      /run-owned disposable Chromium profile snapshot/u,
    );

    await writeFile(join(snapshot.path, "Default", "Preferences"), "runtime-only\n", { mode: 0o600 });
    assert.equal(await readFile(join(profile, "Default", "Preferences"), "utf8"), "source\n");

    const snapshotRoot = join(snapshot.path, "..");
    await snapshot.cleanup();
    await snapshot.cleanup();
    await assert.rejects(
      assertRunOwnedPersistentProfileSnapshot(snapshot.path),
      /run-owned disposable Chromium profile snapshot/u,
    );
    await assert.rejects(
      access(snapshotRoot),
      (error: NodeJS.ErrnoException) => error.code === "ENOENT",
    );
    assert.equal(await readFile(join(profile, "Default", "Preferences"), "utf8"), "source\n");
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("snapshot cleanup remains retryable and owned until deletion succeeds", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-profile-cleanup-retry-"));
  try {
    const profile = await createPrivateProfile(directory);
    const cache = join(directory, "cache");
    await mkdir(cache, { mode: 0o700 });
    let removeCalls = 0;
    const snapshot = await createPersistentProfileSnapshot(profile, cache, {
      copy: cp,
      remove: async (path, options) => {
        removeCalls += 1;
        if (removeCalls === 1) throw new Error("planned snapshot remove failure");
        await rm(path, options);
      },
    });

    await assert.rejects(snapshot.cleanup(), /planned snapshot remove failure/u);
    await assertRunOwnedPersistentProfileSnapshot(snapshot.path);
    await snapshot.cleanup();
    assert.equal(removeCalls, 2);
    await assert.rejects(
      assertRunOwnedPersistentProfileSnapshot(snapshot.path),
      /run-owned disposable Chromium profile snapshot/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("reports both copy and partial-snapshot cleanup failures", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-profile-partial-cleanup-"));
  try {
    const profile = await createPrivateProfile(directory);
    const cache = join(directory, "cache");
    await mkdir(cache, { mode: 0o700 });
    await assert.rejects(
      createPersistentProfileSnapshot(profile, cache, {
        copy: async () => { throw new Error("planned copy failure"); },
        remove: async () => { throw new Error("planned partial cleanup failure"); },
      }),
      (error: unknown) => {
        assert.ok(error instanceof AggregateError);
        assert.match(error.message, /partial snapshot cleanup was incomplete/u);
        assert.match(String(error.errors[0]), /planned copy failure/u);
        assert.match(String(error.errors[1]), /planned partial cleanup failure/u);
        return true;
      },
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
