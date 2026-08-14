import {
  chromium,
  type Browser,
  type BrowserContext,
  type BrowserContextOptions,
  type Page,
} from "playwright";

import {
  acquirePersistentProfileLock,
  assertRunOwnedPersistentProfileSnapshot,
  persistentProfilePath,
} from "./persistent-browser-profile.js";
import { assertPrivateInputFile } from "./private-fs.js";
import { safeChildEnvironment } from "./process.js";
import type { RuntimeEnvironment } from "./runtime-environment.js";
import type { DemoScenario } from "./types.js";

const PERSISTENT_VIEWPORT = Object.freeze({ width: 1440, height: 900 });

export interface ScenarioBrowserSession {
  context: BrowserContext;
  page: Page;
  browserVersion: string;
  persistentProfile: boolean;
  close(): Promise<void>;
}

export interface ScenarioBrowserSessionOptions {
  recordVideo?: { dir: string; size: { width: number; height: number } };
  /** Record only a new blank page, never a restored profile page. */
  freshBlankPage?: boolean;
  /** Test seam; production always uses Playwright's ordinary Chromium launcher. */
  chromiumLauncher?: Pick<typeof chromium, "launch" | "launchPersistentContext">;
}

export async function prepareFreshRecordingPage(context: BrowserContext): Promise<Page> {
  const restoredPages = context.pages();
  const page = await context.newPage();
  if (page.url() !== "about:blank") {
    await page.close().catch(() => undefined);
    throw new Error("Fresh recording page did not start at about:blank");
  }
  const errors: unknown[] = [];
  for (const restored of restoredPages) {
    try {
      await restored.close();
    } catch (error) {
      errors.push(error);
    }
  }
  if (errors.length > 0) {
    try {
      await page.close();
    } catch (error) {
      errors.push(error);
    }
    throw new AggregateError(errors, "Restored browser pages could not be closed before recording");
  }
  return page;
}

function assertPersistentBrowserShape(scenario: DemoScenario): void {
  if (scenario.browser.storageState) {
    throw new Error("A persistent Chromium profile cannot be combined with browser.storageState");
  }
  if (scenario.browser.headless) {
    throw new Error("A persistent Chromium profile requires a headful browser");
  }
  for (const [name, size] of [
    ["viewport", scenario.browser.viewport],
    ["video", scenario.browser.video],
  ] as const) {
    if (size.width !== PERSISTENT_VIEWPORT.width || size.height !== PERSISTENT_VIEWPORT.height) {
      throw new Error(`A persistent Chromium profile requires browser.${name} to be exactly 1440x900`);
    }
  }
}

function browserContextOptions(
  scenario: DemoScenario,
  options: ScenarioBrowserSessionOptions,
): BrowserContextOptions {
  return {
    viewport: scenario.browser.viewport,
    locale: scenario.browser.locale,
    timezoneId: scenario.browser.timezoneId,
    colorScheme: scenario.browser.colorScheme,
    reducedMotion: scenario.browser.reducedMotion,
    deviceScaleFactor: scenario.browser.deviceScaleFactor,
    ...(options.recordVideo ? { recordVideo: options.recordVideo } : {}),
    ...(scenario.browser.userAgent ? { userAgent: scenario.browser.userAgent } : {}),
  };
}

export async function launchScenarioBrowserSession(
  scenario: DemoScenario,
  environment?: RuntimeEnvironment,
  options: ScenarioBrowserSessionOptions = {},
): Promise<ScenarioBrowserSession> {
  const profilePath = persistentProfilePath(scenario, environment);
  const launcher = options.chromiumLauncher ?? chromium;
  let browser: Browser | undefined;
  let context: BrowserContext | undefined;
  let releaseProfile: (() => Promise<void>) | undefined;
  let persistentProfile = false;
  try {
    if (profilePath) {
      assertPersistentBrowserShape(scenario);
      if (scenario.browser.persistentProfileRequiresSnapshot) {
        await assertRunOwnedPersistentProfileSnapshot(profilePath);
      }
      releaseProfile = await acquirePersistentProfileLock(profilePath);
      persistentProfile = true;
      // Deliberately use the ordinary Playwright persistent-context launch.
      // No anti-detection, challenge-bypass, certificate, proxy, or Chromium
      // command-line flags are supplied here.
      context = await launcher.launchPersistentContext(profilePath, {
        headless: false,
        env: safeChildEnvironment(),
        ...browserContextOptions(scenario, options),
        screen: PERSISTENT_VIEWPORT,
      });
      browser = context.browser() ?? undefined;
    } else {
      if (scenario.browser.storageState) {
        await assertPrivateInputFile(scenario.browser.storageState, "browser.storageState");
      }
      browser = await launcher.launch({
        headless: scenario.browser.headless,
        env: safeChildEnvironment(),
      });
      context = await browser.newContext({
        ...browserContextOptions(scenario, options),
        ...(scenario.browser.storageState ? { storageState: scenario.browser.storageState } : {}),
      });
    }
    const page = options.freshBlankPage
      ? await prepareFreshRecordingPage(context)
      : context.pages()[0] ?? await context.newPage();
    const browserVersion = browser?.version() ?? "unknown";
    let closed = false;
    return {
      context,
      page,
      browserVersion,
      persistentProfile,
      close: async () => {
        if (closed) return;
        closed = true;
        const errors: unknown[] = [];
        try {
          await context?.close();
        } catch (error) {
          errors.push(error);
        }
        if (!persistentProfile) {
          try {
            await browser?.close();
          } catch (error) {
            errors.push(error);
          }
        }
        try {
          await releaseProfile?.();
        } catch (error) {
          errors.push(error);
        }
        if (errors.length === 1) throw errors[0];
        if (errors.length > 1) throw new AggregateError(errors, "Browser session cleanup failed");
      },
    };
  } catch (error) {
    const cleanupErrors: unknown[] = [];
    try {
      await context?.close();
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (!persistentProfile) {
      try {
        await browser?.close();
      } catch (cleanupError) {
        cleanupErrors.push(cleanupError);
      }
    }
    try {
      await releaseProfile?.();
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        [error, ...cleanupErrors],
        "Browser launch failed and session cleanup was incomplete",
      );
    }
    throw error;
  }
}
