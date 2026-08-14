import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";
import type { BrowserContext, Page } from "playwright";

import {
  launchScenarioBrowserSession,
  prepareFreshRecordingPage,
} from "../src/browser-session.js";
import { loadScenario } from "../src/config.js";
import {
  acquirePersistentProfileLock,
  createPersistentProfileSnapshot,
} from "../src/persistent-browser-profile.js";

async function createPrivateProfile(root: string): Promise<string> {
  const profile = join(root, "operator-profile");
  await mkdir(join(profile, "Default"), { recursive: true, mode: 0o700 });
  await writeFile(join(profile, "Local State"), "{}\n", { mode: 0o600 });
  await writeFile(join(profile, "Default", "Preferences"), "{}\n", { mode: 0o600 });
  return profile;
}

test("fresh recording page never reuses restored profile pages", async () => {
  const closed: string[] = [];
  const restored = ["restored-1", "restored-2"].map((name) => ({
    close: async () => { closed.push(name); },
  })) as unknown as Page[];
  const fresh = {
    url: () => "about:blank",
    close: async () => { closed.push("fresh"); },
  } as unknown as Page;
  const context = {
    pages: () => restored,
    newPage: async () => fresh,
  } as unknown as BrowserContext;

  assert.equal(await prepareFreshRecordingPage(context), fresh);
  assert.deepEqual(closed, ["restored-1", "restored-2"]);
});

test("review browser rejects the source profile and releases a snapshot lock after launch failure", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-browser-session-profile-"));
  try {
    const scenario = await loadScenario(resolve("scenarios/skillpilot-openai-review.template.yaml"));
    const profileName = scenario.browser.persistentProfilePathFromEnv!;
    const source = await createPrivateProfile(directory);

    await assert.rejects(
      launchScenarioBrowserSession(scenario, { [profileName]: source }, {
        chromiumLauncher: {
          launch: async () => { throw new Error("must not launch"); },
          launchPersistentContext: async () => { throw new Error("must not launch"); },
        } as never,
      }),
      /run-owned disposable Chromium profile snapshot/u,
    );

    const cache = join(directory, "cache");
    await mkdir(cache, { mode: 0o700 });
    const snapshot = await createPersistentProfileSnapshot(source, cache);
    await assert.rejects(
      launchScenarioBrowserSession(scenario, { [profileName]: snapshot.path }, {
        chromiumLauncher: {
          launch: async () => { throw new Error("must not launch generic browser"); },
          launchPersistentContext: async (
            _path: string,
            options: { headless?: boolean; args?: unknown },
          ) => {
            assert.equal(options.headless, false);
            assert.equal("args" in options, false);
            throw new Error("planned launch failure");
          },
        } as never,
      }),
      /planned launch failure/u,
    );

    const release = await acquirePersistentProfileLock(snapshot.path);
    await release();
    await snapshot.cleanup();
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
