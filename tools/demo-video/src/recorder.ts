import { chmod, mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { chromium, type Browser, type BrowserContext, type Page } from "playwright";
import { resolveLocator } from "./locator.js";
import { assertPrivateInputFile, ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";
import {
  addMaskSelector,
  assertTextIsPrivate,
  collectEvidence,
  collectVisibleMaskRegions,
  configuredEnvironmentSecrets,
  installRedactor,
  maskLocator,
  pulseClick,
  redactSensitiveText,
  removeMaskSelector,
} from "./privacy.js";
import { invalidateRecordingCache, publishRecordingGeneration, readReusableRecording } from "./recording-cache.js";
import type { DemoScenario, DemoStep, RecordingAdapter, RecordingContext, RecordingResult, TimelineEvent } from "./types.js";

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "capture";
}

function resolveUrl(url: string, baseUrl?: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (!baseUrl) throw new Error(`Relative URL ${JSON.stringify(url)} needs browser.baseUrl`);
  return new URL(url, baseUrl).toString();
}

export class PlaywrightRecordingAdapter implements RecordingAdapter {
  readonly kind = "playwright-chromium";

  async record({ scenario, workDir, force }: RecordingContext): Promise<RecordingResult> {
    await ensurePrivateDirectory(workDir);
    if (scenario.browser.storageState) {
      await assertPrivateInputFile(scenario.browser.storageState, "browser.storageState");
    }
    const environmentSecrets = configuredEnvironmentSecrets(scenario);
    if (!force) {
      const reusable = await readReusableRecording(workDir);
      if (reusable) {
        assertTextIsPrivate(
          JSON.stringify(reusable.timeline),
          scenario.privacy,
          environmentSecrets,
          "cached recording timeline",
        );
        return reusable;
      }
    }
    // Invalidate the commit marker before attempting a new generation. Even a
    // failed forced run therefore cannot expose old/new mixed artifacts as a
    // reusable cache entry.
    await invalidateRecordingCache(workDir);
    const temporaryDirectory = await mkdtemp(join(workDir, ".recording-"));
    await chmod(temporaryDirectory, 0o700);
    const temporaryScreenshotsPath = join(temporaryDirectory, "screenshots");
    const temporaryVideoPath = join(temporaryDirectory, "recording.webm");
    await mkdir(temporaryScreenshotsPath, { recursive: true, mode: 0o700 });

    let browser: Browser | undefined;
    let context: BrowserContext | undefined;
    let page: Page | undefined;
    const timeline: TimelineEvent[] = [];
    let video: ReturnType<Page["video"]> | undefined;
    let browserVersion = "unknown";
    let failure: unknown;

    try {
      browser = await chromium.launch({ headless: scenario.browser.headless });
      browserVersion = browser.version();
      context = await browser.newContext({
        viewport: scenario.browser.viewport,
        recordVideo: { dir: temporaryDirectory, size: scenario.browser.video },
        locale: scenario.browser.locale,
        timezoneId: scenario.browser.timezoneId,
        colorScheme: scenario.browser.colorScheme,
        reducedMotion: scenario.browser.reducedMotion,
        deviceScaleFactor: scenario.browser.deviceScaleFactor,
        ...(scenario.browser.storageState ? { storageState: scenario.browser.storageState } : {}),
        ...(scenario.browser.userAgent ? { userAgent: scenario.browser.userAgent } : {}),
      });
      page = await context.newPage();
      page.setDefaultTimeout(scenario.browser.defaultTimeoutMs);
      page.on("dialog", async (dialog) => {
        if (scenario.browser.dialogPolicy === "accept") await dialog.accept();
        else await dialog.dismiss();
      });
      video = page.video();
      await installRedactor(page, scenario.privacy);
      const recordingStartedAt = Date.now();

      for (const chapter of scenario.chapters) {
        for (const step of chapter.steps) {
          const startedAtMs = Date.now() - recordingStartedAt;
          let click: { x: number; y: number } | undefined;
          let secretInput = false;
          try {
            const result = await executeStep(page, step, scenario);
            click = result.click;
            secretInput = result.secretInput;
            if (step.action !== "wait") {
              await page.waitForTimeout(scenario.browser.postActionDelayMs);
            }
            const screenshotName = step.capture || step.action === "screenshot"
              ? `${safeName(chapter.id)}-${safeName(step.id)}.png`
              : undefined;
            const masks = screenshotName ? await collectVisibleMaskRegions(page) : [];
            if (screenshotName) {
              await page.screenshot({ path: join(temporaryScreenshotsPath, screenshotName), fullPage: false, animations: "disabled" });
            }
            const evidence = await collectEvidence(page, scenario.privacy, environmentSecrets);
            timeline.push({
              chapterId: chapter.id,
              chapterTitle: chapter.title,
              stepId: step.id,
              action: step.action,
              label: step.label,
              startedAtMs,
              endedAtMs: Date.now() - recordingStartedAt,
              ...(step.narrationHint ? { narrationHint: step.narrationHint } : {}),
              ...(screenshotName ? { screenshot: join(workDir, "screenshots", screenshotName) } : {}),
              ...(masks.length > 0 ? { masks } : {}),
              evidence,
              ...(click ? { click } : {}),
              secretInput,
            });
          } catch (error) {
            const failurePath = join(temporaryScreenshotsPath, `failure-${safeName(chapter.id)}-${safeName(step.id)}.png`);
            await page.screenshot({ path: failurePath, fullPage: false, animations: "disabled" }).catch(() => undefined);
            throw new Error(redactSensitiveText(
              `Scenario failed at ${chapter.id}/${step.id} (${step.label}): ${String(error)}`,
              scenario.privacy,
              environmentSecrets,
            ));
          }
        }
      }
    } catch (error) {
      failure = error;
    } finally {
      await page?.close().catch((error) => {
        if (!failure) failure = error;
      });
      await context?.close().catch((error) => {
        if (!failure) failure = error;
      });
      if (video) {
        await video.saveAs(temporaryVideoPath).catch((error) => {
          if (!failure) failure = error;
        });
        await video.delete().catch(() => undefined);
      }
      await browser?.close().catch(() => undefined);
    }

    try {
      if (failure) {
        throw new Error(redactSensitiveText(String(failure), scenario.privacy, environmentSecrets));
      }
      const published = await publishRecordingGeneration(workDir, {
        temporaryDirectory,
        temporaryVideoPath,
        temporaryScreenshotsPath,
        timeline,
        durationMs: Math.max(0, ...timeline.map((event) => event.endedAtMs)),
        browserVersion,
      });
      await ensurePrivateDirectory(workDir);
      await ensurePrivateDirectory(join(workDir, "screenshots"));
      await Promise.all([
        ensurePrivateFile(join(workDir, "recording.webm")),
        ensurePrivateFile(join(workDir, "timeline.json")),
        ensurePrivateFile(join(workDir, "recording.json")),
        ...timeline.flatMap((event) => event.screenshot ? [ensurePrivateFile(event.screenshot)] : []),
      ]);
      return published;
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  }
}

async function executeStep(
  page: Page,
  step: DemoStep,
  scenario: DemoScenario,
): Promise<{ click?: { x: number; y: number }; secretInput: boolean }> {
  switch (step.action) {
    case "goto":
      {
        const url = step.urlFromEnv ? process.env[step.urlFromEnv] : step.url;
        if (!url) throw new Error(step.urlFromEnv ? `Missing environment variable ${step.urlFromEnv}` : "Goto URL is missing");
        await page.goto(resolveUrl(url, scenario.browser.baseUrl), { waitUntil: step.waitUntil ?? "domcontentloaded" });
      }
      return { secretInput: false };
    case "follow": {
      const href = await resolveLocator(page, step.target, step.frame).getAttribute("href");
      if (!href) throw new Error("Follow target has no href");
      await page.goto(resolveUrl(href, page.url()), { waitUntil: step.waitUntil ?? "domcontentloaded" });
      return { secretInput: false };
    }
    case "click": {
      const locator = resolveLocator(page, step.target, step.frame);
      if (step.samePage) {
        await locator.evaluate((element) => {
          if (element instanceof HTMLAnchorElement) element.removeAttribute("target");
        });
        // A source string keeps this page-world shim independent of TypeScript
        // helper injection. It returns a small WindowProxy-compatible object so
        // asynchronous launch flows can call popup.location.replace later.
        await page.evaluate(`(() => {
          window.open = function demoVideoSamePageOpen(url) {
            let closed = false;
            const navigate = (target) => window.location.assign(String(target));
            const locationProxy = {
              assign: navigate,
              replace: navigate,
              reload: () => window.location.reload(),
              toString: () => window.location.href,
            };
            const popup = {
              close: () => { closed = true; },
              focus: () => undefined,
              document: { title: "", body: { textContent: "" } },
              opener: null,
            };
            Object.defineProperties(popup, {
              closed: { get: () => closed },
              location: {
                get: () => locationProxy,
                set: (target) => navigate(target),
              },
            });
            if (url !== undefined && String(url) !== "" && String(url) !== "about:blank") {
              window.setTimeout(() => navigate(url), 0);
            }
            return popup;
          };
        })()`);
      }
      await locator.scrollIntoViewIfNeeded();
      const box = await locator.boundingBox();
      const click = box ? { x: box.x + box.width / 2, y: box.y + box.height / 2 } : undefined;
      if (click && (step.highlight ?? true)) {
        await pulseClick(page, click.x, click.y);
        await page.waitForTimeout(180);
      }
      await locator.click({ button: step.button ?? "left" });
      return { ...(click ? { click } : {}), secretInput: false };
    }
    case "fill": {
      const locator = resolveLocator(page, step.target, step.frame);
      const environmentName = step.valueFromEnv;
      const usesEnvironment = environmentName !== undefined;
      const value = environmentName !== undefined ? process.env[environmentName] : step.value;
      if (value === undefined) throw new Error(`Missing environment variable ${step.valueFromEnv}`);
      const secretInput = step.secret ?? usesEnvironment;
      if (secretInput) await maskLocator(locator, `secret-${step.id}`);
      await locator.fill(value);
      return { secretInput };
    }
    case "press":
      if (step.target) await resolveLocator(page, step.target, step.frame).press(step.key);
      else await page.keyboard.press(step.key);
      return { secretInput: false };
    case "select":
      await resolveLocator(page, step.target, step.frame).selectOption(step.value);
      return { secretInput: false };
    case "check":
      if (step.checked ?? true) await resolveLocator(page, step.target, step.frame).check();
      else await resolveLocator(page, step.target, step.frame).uncheck();
      return { secretInput: false };
    case "hover":
      await resolveLocator(page, step.target, step.frame).hover();
      return { secretInput: false };
    case "waitFor":
      await resolveLocator(page, step.target, step.frame).waitFor({
        state: step.state ?? "visible",
        ...(step.timeoutMs !== undefined ? { timeout: step.timeoutMs } : {}),
      });
      return { secretInput: false };
    case "wait":
      await page.waitForTimeout(step.durationMs);
      return { secretInput: false };
    case "assert": {
      const locator = resolveLocator(page, step.target, step.frame);
      await locator.waitFor({
        state: step.state ?? "visible",
        ...(step.timeoutMs !== undefined ? { timeout: step.timeoutMs } : {}),
      });
      if (step.text !== undefined) {
        const text = await locator.textContent();
        if (!text?.includes(step.text)) {
          throw new Error(`Expected ${JSON.stringify(step.text)} in ${JSON.stringify(text)}`);
        }
      }
      if (step.textPattern !== undefined) {
        const text = await locator.textContent();
        if (!text || !new RegExp(step.textPattern, "iu").test(text)) {
          throw new Error(`Expected text matching ${JSON.stringify(step.textPattern)} in ${JSON.stringify(text)}`);
        }
      }
      return { secretInput: false };
    }
    case "screenshot":
      return { secretInput: false };
    case "maskTarget":
      await maskLocator(resolveLocator(page, step.target, step.frame), `target-${step.id}`);
      return { secretInput: true };
    case "mask":
      await addMaskSelector(page, step.selector);
      return { secretInput: false };
    case "unmask":
      await removeMaskSelector(page, step.selector);
      return { secretInput: false };
  }
}
