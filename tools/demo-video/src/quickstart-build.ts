import { access, open, readFile, rename, rm } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { join, relative, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import OpenAI from "openai";
import type { Page, Response as BrowserResponse } from "playwright";
import { loadScenario } from "./config.js";
import { GeminiSpeechClient, loadQuickstartGeminiApiKey } from "./gemini-tts.js";
import { sha256File, sha256Text, stableJson } from "./hash.js";
import { buildPipeline, recordStage, scenarioWorkDir } from "./pipeline.js";
import { assertPrivateInputFile, ensurePrivateDirectory, writePrivateFile } from "./private-fs.js";
import { redactSensitiveText } from "./privacy.js";
import { PlaywrightRecordingAdapter } from "./recorder.js";
import { applyQuickstartHostClips, prepareQuickstartHostClips, quickstartHostClipBinding, type PreparedQuickstartHostClips } from "./quickstart-host-clips.js";
import { verifyPublishedRecording } from "./recording-verifier.js";
import type { BuildArtifacts, DemoScenario, RecordingAdapter } from "./types.js";
import type { TtsOpenAIClient } from "./tts.js";

const TOOL_ROOT = fileURLToPath(new URL("../", import.meta.url));
const LEARNER_ID = /^[A-Za-z0-9_-]{16,128}$/u;
const CARD_IDS = new Set(["intro", "marketplace", "repository", "install", "connect", "mobile", "finish", "start", "feedback", "chat-start"]);
const CAPTURE_CLEANUP_FILE = "capture-cleanup.json";
type CreationResponse = Pick<BrowserResponse, "url" | "ok" | "request" | "json">;

const exists = (path: string) => access(path).then(() => true, (error: NodeJS.ErrnoException) => {
  if (error.code === "ENOENT") return false;
  throw error;
});

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown> : undefined;
}

/** Reads only the TTS key; unrelated review profile/clip fields are not used. */
export async function loadQuickstartApiKey(path: string): Promise<string> {
  await assertPrivateInputFile(path, "Quickstart TTS secrets file");
  let value: unknown;
  try { value = JSON.parse(await readFile(path, "utf8")); }
  catch { throw new Error("Quickstart TTS secrets file is not valid JSON"); }
  const record = asRecord(value);
  if (record?.schemaVersion !== 1 || typeof record.openAiApiKey !== "string" || !record.openAiApiKey.trim()) {
    throw new Error("Quickstart TTS secrets require schemaVersion 1 and a nonempty openAiApiKey");
  }
  return record.openAiApiKey.trim();
}

/** Explicitly labelled guide cards, never a substitute for actual Claude footage. */
export function resolveQuickstartCards(scenario: DemoScenario): string {
  const language = scenario.browser.locale.split("-")[0];
  if (language !== "de" && language !== "en") throw new Error("Quickstart instruction cards support only German or English");
  const cardsPath = join(TOOL_ROOT, "assets", "quickstart", language === "en" ? "cards.en.html" : "cards.html");
  for (const chapter of scenario.chapters) {
    for (const step of chapter.steps) {
      if (step.action !== "goto" || !step.url?.startsWith("quickstart-card:")) continue;
      const id = step.url.slice("quickstart-card:".length);
      if (!CARD_IDS.has(id)) throw new Error("Unknown Quickstart instruction card");
      step.url = `${pathToFileURL(cardsPath).href}#${id}`;
    }
  }
  return cardsPath;
}

/** Owns only IDs returned by fresh first-party CREATE responses or its private recovery ledger. */
export class QuickstartLearnerCleanup {
  readonly #origin: string;
  readonly #ids = new Set<string>();
  readonly #sensitiveIds = new Set<string>();
  #pending = Promise.resolve();
  #captureFailed = false;

  constructor(
    baseUrl: string,
    private readonly ledgerPath: string,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {
    const url = new URL(baseUrl);
    if (url.username || url.password || url.search || url.hash || url.pathname !== "/"
      || (url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname)))) {
      throw new Error("Quickstart cleanup needs a plain HTTPS origin or a loopback test origin");
    }
    this.#origin = url.origin;
  }

  get sensitiveValues(): string[] { return [...this.#sensitiveIds]; }

  async recover(): Promise<void> {
    // A crash while appending can leave a newer temporary superset. Read both;
    // never discard a newly captured ID in favour of an older committed ledger.
    for (const path of [this.ledgerPath, `${this.ledgerPath}.tmp`]) {
      if (!await exists(path)) continue;
      await assertPrivateInputFile(path, "Quickstart cleanup ledger");
      let value: unknown;
      try { value = JSON.parse(await readFile(path, "utf8")); }
      catch { throw new Error("Quickstart cleanup ledger is not valid JSON"); }
      const record = asRecord(value);
      if (record?.schemaVersion !== 1 || record.origin !== this.#origin || !Array.isArray(record.skillpilotIds)
        || Object.keys(record).some((key) => !["schemaVersion", "origin", "skillpilotIds"].includes(key))
        || record.skillpilotIds.some((id) => typeof id !== "string" || !LEARNER_ID.test(id))) {
        throw new Error("Quickstart cleanup ledger has invalid scope or identifiers");
      }
      for (const id of record.skillpilotIds as string[]) {
        this.#ids.add(id);
        this.#sensitiveIds.add(id);
      }
    }
  }

  attach(page: Page): void {
    page.on("response", (response) => { this.observe(response); });
  }

  observe(response: CreationResponse): void {
    const url = new URL(response.url());
    if (url.origin !== this.#origin || url.pathname !== "/api/ui/learners" || url.search
      || response.request().method() !== "POST" || !response.ok()) return;
    // Start consuming the body immediately, before navigation/page shutdown.
    // Persistence itself stays serialized across overlapping CREATE responses.
    const bodyPromise = response.json().catch(() => {
      this.#captureFailed = true;
      return undefined;
    });
    this.#pending = this.#pending.then(async () => {
      const body = asRecord(await bodyPromise);
      const id = asRecord(body?.state)?.skillpilotId;
      if (typeof id !== "string" || !LEARNER_ID.test(id)) throw new Error("Invalid CREATE response");
      this.#ids.add(id);
      this.#sensitiveIds.add(id);
      await this.#persist();
    }).catch(() => { this.#captureFailed = true; });
  }

  async flush(): Promise<void> {
    await this.#pending;
    if (this.#captureFailed) throw new Error("A fresh learner response could not be safely recorded for cleanup");
  }

  async #persist(): Promise<void> {
    const temporaryPath = `${this.ledgerPath}.tmp`;
    if (this.#ids.size === 0) {
      await rm(this.ledgerPath, { force: true });
      await rm(temporaryPath, { force: true });
      return;
    }
    await writePrivateFile(temporaryPath, `${JSON.stringify({
      schemaVersion: 1, origin: this.#origin, skillpilotIds: [...this.#ids],
    })}\n`);
    await rename(temporaryPath, this.ledgerPath);
  }

  async cleanup(): Promise<number> {
    await this.#pending;
    let deleted = 0;
    for (const id of [...this.#ids]) {
      let success = false;
      for (let attempt = 0; attempt < 3 && !success; attempt += 1) {
        try {
          const response = await this.fetchImpl(`${this.#origin}/api/ui/learners/${encodeURIComponent(id)}`, {
            method: "DELETE", redirect: "error", signal: AbortSignal.timeout(10_000),
            headers: { "content-type": "application/json" },
            body: JSON.stringify({ confirmationSkillpilotId: id }),
          });
          success = response.status === 204 || response.status === 404;
        } catch { /* Retry without logging URLs, response bodies or bearer identifiers. */ }
      }
      if (success) {
        this.#ids.delete(id);
        await this.#persist();
        deleted += 1;
      }
    }
    if (this.#ids.size) throw new Error(`Quickstart cleanup remains pending for ${this.#ids.size} disposable learner(s)`);
    await this.#persist();
    return deleted;
  }
}

export interface QuickstartOptions {
  scenarioPath: string;
  secretsPath?: string;
  hostClipsPath?: string;
  recordOnly?: boolean;
  cleanupOnly?: boolean;
  reuseRecording?: boolean;
}

interface QuickstartCaptureCleanup {
  schemaVersion: 1;
  kind: "verified-recording-cleanup";
  origin: string;
  sourceRevision: string;
  scenarioSha256: string;
  recordingSha256: string;
  recordingMetadataSha256: string;
  timelineSha256: string;
  instructionCardsSha256: string;
  instructionScreenshotSha256: string | null;
  hostClipAssets?: Awaited<ReturnType<typeof quickstartHostClipBinding>>;
  disposableLearnersDeleted: number;
}

export async function instructionAssetHashes(cardsPath: string, scenario: DemoScenario) {
  const screenshotCards = new Set(scenario.browser.locale.startsWith("en") ? [] : ["marketplace", "repository"]);
  const cardUrl = `${pathToFileURL(cardsPath).href}#`;
  const needsScreenshot = scenario.chapters.some((chapter) => chapter.steps.some((step) => {
    if (step.action !== "goto" || !step.url) return false;
    const id = step.url.startsWith("quickstart-card:") ? step.url.slice("quickstart-card:".length)
      : step.url.startsWith(cardUrl) ? step.url.slice(cardUrl.length) : "";
    return screenshotCards.has(id);
  }));
  const screenshotPath = join(resolve(cardsPath, ".."), "claude-marketplace.png");
  if (needsScreenshot && !await exists(screenshotPath)) {
    throw new Error("Quickstart marketplace/repository cards require the approved private claude-marketplace.png screenshot beside cards.html");
  }
  return {
    instructionCardsSha256: await sha256File(cardsPath),
    instructionScreenshotSha256: needsScreenshot ? await sha256File(screenshotPath) : null,
  };
}

async function captureAssetHashes(cardsPath: string, scenario: DemoScenario, hostClips?: PreparedQuickstartHostClips) {
  return {
    ...await instructionAssetHashes(cardsPath, scenario),
    ...(hostClips ? { hostClipAssets: await quickstartHostClipBinding(hostClips) } : {}),
  };
}

async function captureBinding(scenario: DemoScenario, workDir: string, cardsPath: string, hostClips?: PreparedQuickstartHostClips) {
  return {
    schemaVersion: 1 as const, kind: "verified-recording-cleanup" as const,
    origin: new URL(scenario.browser.baseUrl!).origin, sourceRevision: scenario.sourceRevision,
    scenarioSha256: sha256Text(stableJson(scenario)),
    recordingSha256: await sha256File(join(workDir, "recording.webm")),
    recordingMetadataSha256: await sha256File(join(workDir, "recording.json")),
    timelineSha256: await sha256File(join(workDir, "timeline.json")),
    ...await captureAssetHashes(cardsPath, scenario, hostClips),
  };
}

/** Private evidence is issued by this wrapper only after an observed capture's cleanup succeeds. */
export async function verifyQuickstartCaptureCleanup(
  scenario: DemoScenario, workDir: string, cardsPath: string, hostClips?: PreparedQuickstartHostClips,
): Promise<QuickstartCaptureCleanup> {
  const path = join(workDir, CAPTURE_CLEANUP_FILE);
  if (!await exists(path)) throw new Error("Quickstart recording has no capture-bound cleanup evidence; make a fresh recording");
  await assertPrivateInputFile(path, "Quickstart capture cleanup evidence");
  let data: Record<string, unknown> | undefined;
  try { data = asRecord(JSON.parse(await readFile(path, "utf8"))); }
  catch { throw new Error("Quickstart capture cleanup evidence is not valid JSON"); }
  const count = data?.disposableLearnersDeleted;
  if (typeof count !== "number" || !Number.isSafeInteger(count) || count < 0) {
    throw new Error("Quickstart capture cleanup evidence has no valid deletion count");
  }
  const expected: QuickstartCaptureCleanup = { ...await captureBinding(scenario, workDir, cardsPath, hostClips), disposableLearnersDeleted: count };
  if (stableJson(data) !== stableJson(expected)) {
    throw new Error("Quickstart capture cleanup evidence does not match recording, scenario or instruction assets; record again");
  }
  return expected;
}

export async function runQuickstart(options: QuickstartOptions): Promise<{ workDir: string; videoPath?: string; deletedLearners: number; captureLearnersDeleted?: number }> {
  const scenario = await loadScenario(options.scenarioPath);
  if (scenario.narration.mode !== "scripted" || !scenario.browser.baseUrl
    || scenario.browser.storageState || scenario.browser.persistentProfilePathFromEnv || scenario.platformClips.length) {
    throw new Error("Quickstart needs scripted narration, a first-party origin, and a fresh browser without provider credentials or native clips");
  }
  const cardsPath = resolveQuickstartCards(scenario);
  let hostClips: PreparedQuickstartHostClips | undefined;
  // Recovery must remain available even when the external private clip files
  // were moved or are invalid. Never access provider accounts from this path.
  if (options.hostClipsPath && !options.cleanupOnly) {
    try {
      hostClips = await prepareQuickstartHostClips(options.hostClipsPath, scenario.cacheDir, scenario.binaries,
        scenario.browser.locale.startsWith("en") ? "en" : "de");
      applyQuickstartHostClips(scenario, hostClips);
    } catch {
      // Validation can include filesystem/ffprobe errors with private paths.
      throw new Error("Private Claude clip import failed: verify the reviewed local files, hashes, permissions, four installation chapters and optional chat-start chapter");
    }
  }
  const workDir = scenarioWorkDir(scenario);
  await ensurePrivateDirectory(scenario.outputDir);
  await ensurePrivateDirectory(workDir);
  const cleanup = new QuickstartLearnerCleanup(scenario.browser.baseUrl, join(scenario.outputDir, ".quickstart-learner-cleanup.json"));
  const lockPath = join(scenario.outputDir, ".quickstart-build.lock");
  const lock = await open(lockPath, "wx", 0o600).catch(() => {
    throw new Error("Quickstart output is locked; verify no prior recording is running before recovering its lock");
  });
  let key = "";
  let artifacts: BuildArtifacts | undefined;
  let deletedLearners = 0;
  let failure: unknown;
  let recovered = false;
  let verifiedCapture = false;
  let captureCleanup: QuickstartCaptureCleanup | undefined;
  let startingAssets: Awaited<ReturnType<typeof captureAssetHashes>> | undefined;
  try {
    await cleanup.recover();
    recovered = true;
    deletedLearners += await cleanup.cleanup();
    if (!options.cleanupOnly) {
      if (options.reuseRecording) {
        captureCleanup = await verifyQuickstartCaptureCleanup(scenario, workDir, cardsPath, hostClips);
        // Prevent the recorder's generic corrupt-cache fallback from silently
        // creating a fresh capture under an old cleanup claim.
        await verifyPublishedRecording(scenario);
      } else {
        // A fresh generation must never inherit the previous recording's claim.
        await rm(join(workDir, CAPTURE_CLEANUP_FILE), { force: true });
        startingAssets = await captureAssetHashes(cardsPath, scenario, hostClips);
      }
      const browserAdapter = new PlaywrightRecordingAdapter({ onPageReady: async (page) => {
        cleanup.attach(page);
        if (scenario.browser.locale.startsWith("en")) {
          await page.addInitScript(({ origin }) => {
            if (location.origin === origin) localStorage.setItem("skillpilot_lang", "en");
          }, { origin: new URL(scenario.browser.baseUrl!).origin });
        }
      } });
      const recordingAdapter: RecordingAdapter = {
        kind: browserAdapter.kind,
        record: async (context) => {
          const recording = await browserAdapter.record(context);
          await cleanup.flush();
          return recording;
        },
      };
      const pipelineOptions = {
        scenario, scenarioPath: resolve(options.scenarioPath), recordingAdapter,
        environment: { QUICKSTART_DEMO_ID_PASSWORD: randomBytes(24).toString("base64url") },
        reuseRecording: options.reuseRecording ?? false, deferCompletionMarker: true,
      };
      let ttsClient: TtsOpenAIClient | undefined;
      if (!options.recordOnly) {
        if (scenario.narration.ttsModel.startsWith("gemini-")) {
          key = await loadQuickstartGeminiApiKey(resolve(TOOL_ROOT, "../.."), options.secretsPath);
          ttsClient = new GeminiSpeechClient(key);
        } else {
          key = await loadQuickstartApiKey(options.secretsPath ?? join(TOOL_ROOT, "secrets", "skillpilot-review.json"));
          ttsClient = new OpenAI({ apiKey: key });
        }
      }
      await recordStage(pipelineOptions);
      // Supplying an adapter disables buildPipeline's default verifier. Run
      // its exact hash/privacy/mask checks after analysis exists, before TTS.
      await verifyPublishedRecording(scenario, pipelineOptions.environment);
      if (startingAssets && stableJson(startingAssets) !== stableJson(await captureAssetHashes(cardsPath, scenario, hostClips))) {
        throw new Error("Quickstart instruction assets changed during capture; record again");
      }
      verifiedCapture = true;
      if (ttsClient) {
        artifacts = await buildPipeline({ ...pipelineOptions, reuseRecording: true, ttsClient });
      }
    }
  } catch (error) { failure = error; }
  finally {
    let finalDeleted = 0;
    let cleanupSucceeded = false;
    if (recovered) {
      try { finalDeleted = await cleanup.cleanup(); deletedLearners += finalDeleted; cleanupSucceeded = true; }
      catch (error) { failure = failure ? new Error("Quickstart failed and learner cleanup is still pending; recover the private ledger before retrying") : error; }
    }
    try { await cleanup.flush(); }
    catch (error) { failure ??= error; cleanupSucceeded = false; }
    if (verifiedCapture && cleanupSucceeded && !options.reuseRecording) {
      try {
        // May survive a later TTS/render failure: these are completed recording
        // and cleanup facts, not a claim that the full video build succeeded.
        const binding = await captureBinding(scenario, workDir, cardsPath, hostClips);
        if (!startingAssets || startingAssets.instructionCardsSha256 !== binding.instructionCardsSha256
          || startingAssets.instructionScreenshotSha256 !== binding.instructionScreenshotSha256
          || stableJson(startingAssets.hostClipAssets ?? null) !== stableJson(binding.hostClipAssets ?? null)) {
          throw new Error("Quickstart instruction assets changed before capture evidence was sealed; record again");
        }
        captureCleanup = { ...binding, disposableLearnersDeleted: finalDeleted };
        await writePrivateFile(join(workDir, CAPTURE_CLEANUP_FILE), `${JSON.stringify(captureCleanup, null, 2)}\n`);
      } catch (error) { failure ??= error; }
    }
    if (!failure && artifacts) {
      try {
        captureCleanup = await verifyQuickstartCaptureCleanup(scenario, workDir, cardsPath, hostClips);
        const manifest = JSON.parse(await readFile(artifacts.manifestPath, "utf8")) as Record<string, unknown>;
        if (hostClips) {
          const evidencePath = join(workDir, "claude-host-clips.json");
          await writePrivateFile(evidencePath, `${JSON.stringify(hostClips.evidence, null, 2)}\n`);
          const manifestArtifacts = asRecord(manifest.artifacts);
          if (!manifestArtifacts) throw new Error("Quickstart build manifest has no artifacts");
          manifestArtifacts.hostClipEvidence = {
            path: relative(workDir, evidencePath), sha256: await sha256File(evidencePath),
          };
        }
        manifest.quickstartCapture = {
          ...(hostClips ? {
            kind: "first-party-browser-with-verified-claude-web-clips", actualClaudeHostRecording: true,
            hostClips: hostClips.evidence,
          } : { kind: "first-party-browser-with-labelled-instruction-cards", actualClaudeHostRecording: false }),
          instructionCardsSha256: captureCleanup.instructionCardsSha256,
          instructionScreenshotSha256: captureCleanup.instructionScreenshotSha256,
          disposableLearnersDeleted: captureCleanup.disposableLearnersDeleted,
          cleanupPerformedThisRun: deletedLearners,
          recordingCleanupEvidenceSha256: await sha256File(join(workDir, CAPTURE_CLEANUP_FILE)),
          speechProvider: scenario.narration.ttsModel.startsWith("gemini-") ? "google-gemini" : "openai",
        };
        await writePrivateFile(artifacts.manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
        await rename(artifacts.manifestPath, join(workDir, "manifest.json"));
      } catch (error) { failure = error; }
    }
    if (failure) {
      await rm(join(workDir, "manifest.json"), { force: true });
      await rm(join(workDir, "manifest.pending.json"), { force: true });
    }
    await lock.close();
    await rm(lockPath, { force: true });
  }
  if (failure) {
    const privateClipPaths = hostClips ? [hostClips.manifestPath, ...hostClips.clips.flatMap((clip) => [clip.inputPath, clip.videoPath, clip.pagePath])] : [];
    throw new Error(redactSensitiveText(String(failure), scenario.privacy, [key, ...cleanup.sensitiveValues, ...privateClipPaths].filter(Boolean)));
  }
  return { workDir, ...(artifacts ? { videoPath: artifacts.outputVideoPath } : {}), deletedLearners,
    ...(captureCleanup ? { captureLearnersDeleted: captureCleanup.disposableLearnersDeleted } : {}) };
}

export function parseQuickstartArguments(args: string[]): QuickstartOptions {
  const options: QuickstartOptions = { scenarioPath: "" };
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--record-only") options.recordOnly = true;
    else if (arg === "--cleanup-only") options.cleanupOnly = true;
    else if (arg === "--reuse-recording") options.reuseRecording = true;
    else if (arg === "--scenario" || arg === "--secrets" || arg === "--host-clips") {
      const value = args[++index];
      if (!value || value.startsWith("--")) throw new Error("Quickstart option needs a file path");
      if (arg === "--scenario") options.scenarioPath = resolve(value);
      else if (arg === "--host-clips") options.hostClipsPath = resolve(value);
      else options.secretsPath = resolve(value);
    } else throw new Error("Unknown Quickstart option");
  }
  if (!options.scenarioPath || (options.recordOnly && options.cleanupOnly)
    || (options.cleanupOnly && options.reuseRecording)) {
    throw new Error("Use --scenario <file> with optional --host-clips <private-manifest>, --record-only, --cleanup-only, or --reuse-recording");
  }
  return options;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  Promise.resolve().then(() => runQuickstart(parseQuickstartArguments(process.argv.slice(2)))).then((result) => {
    process.stdout.write(`CHECK quickstart PASS deletedLearners=${result.deletedLearners}${result.captureLearnersDeleted === undefined ? "" : ` captureLearnersDeleted=${result.captureLearnersDeleted}`}\nOUTPUT ${result.videoPath ?? result.workDir}\n`);
  }).catch((error: unknown) => {
    // The workflow already redacts runtime keys and captured learner IDs. Drop
    // common bearer formats as a final guard for errors before that boundary.
    const message = String(error)
      .replace(/\b(?:sps|spc)_[A-Za-z0-9_-]+\b/gu, "[REDACTED]")
      .replace(/\b[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}\b/giu, "[REDACTED]");
    process.stderr.write(`CHECK quickstart FAIL ${message}\n`);
    process.exitCode = 1;
  });
}
