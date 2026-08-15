import { chmod, mkdir, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { type Page, type Video } from "playwright";
import { launchScenarioBrowserSession, type ScenarioBrowserSession } from "./browser-session.js";
import { resolveLocator } from "./locator.js";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";
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
import { runtimeEnvironmentValue, type RuntimeEnvironment } from "./runtime-environment.js";
import type { DemoScenario, DemoStep, RecordingAdapter, RecordingContext, RecordingResult, TimelineEvent } from "./types.js";

interface RecordingRuntimeState {
  preparedChatGptPrompt?: string;
}

const LEARNING_SESSION_ID_PATTERN = /(?<![A-Za-z0-9_-])sps_[A-Za-z0-9_-]{43}(?![A-Za-z0-9_-])/gu;

function normalizedVisibleText(value: string): string {
  return value
    .replace(/[\u200B-\u200D\u2060\uFEFF\uFFFC]/gu, "")
    .replace(/\u00a0/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

export function assertPreparedPromptContent(expectedPrompt: string, actualPrompt: string): void {
  const expectedSessionIds = expectedPrompt.match(LEARNING_SESSION_ID_PATTERN) ?? [];
  const actualSessionIds = actualPrompt.match(LEARNING_SESSION_ID_PATTERN) ?? [];
  if (
    expectedSessionIds.length !== 1
    || actualSessionIds.length !== 1
    || actualSessionIds[0] !== expectedSessionIds[0]
  ) {
    throw new Error("The URL-prefilled composer does not contain the exact first-party 43-character learning session ID");
  }
  const normalizedExpected = normalizedVisibleText(expectedPrompt);
  const normalizedActual = normalizedVisibleText(actualPrompt);
  if (normalizedActual !== normalizedExpected) {
    let firstDifference = 0;
    while (
      firstDifference < normalizedExpected.length
      && firstDifference < normalizedActual.length
      && normalizedExpected[firstDifference] === normalizedActual[firstDifference]
    ) firstDifference += 1;
    const expectedCode = normalizedExpected.codePointAt(firstDifference) ?? -1;
    const actualCode = normalizedActual.codePointAt(firstDifference) ?? -1;
    throw new Error(
      "The prepared ChatGPT message changed after the first-party WebGUI handoff "
      + `(sessionExact=yes, expectedLength=${normalizedExpected.length}, `
      + `actualLength=${normalizedActual.length}, firstDifference=${firstDifference}, `
      + `expectedCodePoint=${expectedCode}, actualCodePoint=${actualCode})`,
    );
  }
}

function capturePreparedChatGptPrompt(state: RecordingRuntimeState, rawUrl: string): void {
  try {
    const url = new URL(rawUrl);
    if (url.origin === "https://chatgpt.com" && url.pathname === "/" && url.searchParams.has("prompt")) {
      const prompt = url.searchParams.get("prompt");
      if (prompt !== null) state.preparedChatGptPrompt = prompt;
      return;
    }
    if (url.origin !== "https://chatgpt.com") delete state.preparedChatGptPrompt;
  } catch {
    // Browser navigation will report malformed URLs itself. Never echo the URL.
  }
}

function safeName(value: string): string {
  return value.replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100) || "capture";
}

function resolveUrl(url: string, baseUrl?: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(url)) return url;
  if (!baseUrl) throw new Error(`Relative URL ${JSON.stringify(url)} needs browser.baseUrl`);
  return new URL(url, baseUrl).toString();
}

/**
 * Finalize the page-owned video while the Playwright connection is still
 * alive. Video.saveAs() is valid after the page closes, but not after the
 * surrounding browser session has disconnected.
 */
export async function finalizeRecordingSession(
  page: Pick<Page, "close"> | undefined,
  video: Pick<Video, "saveAs" | "delete"> | null | undefined,
  outputPath: string,
  session: Pick<ScenarioBrowserSession, "close"> | undefined,
): Promise<void> {
  const errors: unknown[] = [];
  let pageClosed = page === undefined;
  try {
    await page?.close();
    pageClosed = true;
  } catch (error) {
    errors.push(error);
  }

  if (video && pageClosed) {
    try {
      await video.saveAs(outputPath);
    } catch (error) {
      errors.push(error);
    }
    await video.delete().catch(() => undefined);
  }

  try {
    await session?.close();
  } catch (error) {
    errors.push(error);
  }

  if (errors.length === 1) throw errors[0];
  if (errors.length > 1) {
    throw new AggregateError(errors, "Recording finalization was incomplete");
  }
}

export class PlaywrightRecordingAdapter implements RecordingAdapter {
  readonly kind = "playwright-chromium";

  async record({ scenario, workDir, force, environment }: RecordingContext): Promise<RecordingResult> {
    await ensurePrivateDirectory(workDir);
    const environmentSecrets = configuredEnvironmentSecrets(scenario, environment);
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

    let session: ScenarioBrowserSession | undefined;
    let page: Page | undefined;
    const timeline: TimelineEvent[] = [];
    let video: ReturnType<Page["video"]> | undefined;
    let browserVersion = "unknown";
    let failure: unknown;
    const runtimeState: RecordingRuntimeState = {};

    try {
      session = await launchScenarioBrowserSession(scenario, environment, {
        recordVideo: { dir: temporaryDirectory, size: scenario.browser.video },
        freshBlankPage: true,
      });
      browserVersion = session.browserVersion;
      page = session.page;
      page.on("request", (request) => {
        if (request.isNavigationRequest() && request.frame() === page?.mainFrame()) {
          capturePreparedChatGptPrompt(runtimeState, request.url());
        }
      });
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
            const result = await executeStep(page, step, scenario, environment, runtimeState);
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
      await finalizeRecordingSession(page, video, temporaryVideoPath, session).catch((error) => {
        if (!failure) failure = error;
      });
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
  environment?: RuntimeEnvironment,
  runtimeState: RecordingRuntimeState = {},
): Promise<{ click?: { x: number; y: number }; secretInput: boolean }> {
  switch (step.action) {
    case "goto":
      {
        const url = step.urlFromEnv
          ? runtimeEnvironmentValue(environment, step.urlFromEnv)
          : step.url;
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
            Object.defineProperty(locationProxy, "href", {
              get: () => window.location.href,
              set: (target) => navigate(target),
            });
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
      const value = environmentName !== undefined
        ? runtimeEnvironmentValue(environment, environmentName)
        : step.value;
      if (value === undefined) throw new Error(`Missing environment variable ${step.valueFromEnv}`);
      const secretInput = step.secret ?? usesEnvironment;
      if (secretInput) await maskLocator(locator, `secret-${step.id}`);
      await locator.fill(value);
      return { secretInput };
    }
    case "type":
      await resolveLocator(page, step.target, step.frame).pressSequentially(
        step.value,
        step.delayMs === undefined ? {} : { delay: step.delayMs },
      );
      return { secretInput: false };
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
      let locator = resolveLocator(page, step.target, step.frame);
      if (step.text !== undefined) {
        locator = locator.filter({ hasText: step.text });
      }
      if (step.textPattern !== undefined) {
        locator = locator.filter({ hasText: new RegExp(step.textPattern, "iu") });
      }
      await locator.waitFor({
        state: step.state ?? "visible",
        ...(step.timeoutMs !== undefined ? { timeout: step.timeoutMs } : {}),
      });
      return { secretInput: false };
    }
    case "assertPreparedPrompt": {
      const expectedPrompt = runtimeState.preparedChatGptPrompt;
      if (!expectedPrompt) {
        throw new Error("No first-party ChatGPT prompt navigation was observed for this chapter");
      }
      const locator = resolveLocator(page, step.target, step.frame);
      await locator.waitFor({
        state: "visible",
        ...(step.timeoutMs !== undefined ? { timeout: step.timeoutMs } : {}),
      });
      const actualPrompt = await locator.evaluate((element) => {
        const clone = element.cloneNode(true) as HTMLElement;
        for (const chip of Array.from(clone.querySelectorAll("span[contenteditable='false']"))) {
          if ((chip.textContent ?? "").trim() === "SkillPilot Coach v1") chip.remove();
        }
        for (const block of Array.from(clone.querySelectorAll("br, div, li, p"))) {
          if (block.tagName === "BR") {
            block.replaceWith(document.createTextNode(" "));
          } else {
            block.before(document.createTextNode(" "));
            block.after(document.createTextNode(" "));
          }
        }
        return clone.textContent ?? "";
      });
      assertPreparedPromptContent(expectedPrompt, actualPrompt);
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
