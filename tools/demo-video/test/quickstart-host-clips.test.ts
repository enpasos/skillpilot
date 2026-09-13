import assert from "node:assert/strict";
import { once } from "node:events";
import { createServer } from "node:http";
import { chmod, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { test, type TestContext } from "node:test";
import { chromium } from "playwright";
import YAML from "yaml";
import { loadScenario } from "../src/config.js";
import { sha256File } from "../src/hash.js";
import { runProcess } from "../src/process.js";
import { parseQuickstartArguments, resolveQuickstartCards, runQuickstart, verifyQuickstartCaptureCleanup } from "../src/quickstart-build.js";
import { validateQuickstartCapture, validateQuickstartHostClipArtifact } from "../src/quickstart-export.js";
import {
  applyQuickstartHostClips, prepareQuickstartHostClips, QUICKSTART_HOST_CHAPTER_IDS,
  quickstartHostClipBinding, quickstartHostVideoPage,
} from "../src/quickstart-host-clips.js";

const BINARIES = { ffmpeg: "ffmpeg", ffprobe: "ffprobe" };

/** Deliberately synthetic local media: tests never access Claude or any real learner. */
async function fixture(t: TestContext) {
  const directory = await mkdtemp(join(tmpdir(), "quickstart-host-fixture-"));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const colors = ["red", "green", "blue", "yellow"];
  const clips = [];
  for (const [index, chapterId] of QUICKSTART_HOST_CHAPTER_IDS.entries()) {
    const path = join(directory, `${chapterId}.webm`);
    await runProcess("ffmpeg", ["-nostdin", "-loglevel", "error", "-f", "lavfi", "-i", `color=c=${colors[index]}:s=160x90:r=10`,
      "-t", "1.2", "-an", "-c:v", "libvpx", "-threads", "1", path]);
    await chmod(path, 0o600);
    clips.push({ chapterId, path: `${chapterId}.webm`, sha256: await sha256File(path),
      capturedAt: "2026-09-13T12:00:00Z", captureMethod: "claude-browser-recording", privacyReviewed: true });
  }
  const manifest = { schemaVersion: 1, clips };
  const manifestPath = join(directory, "clips.json");
  await writeFile(manifestPath, JSON.stringify(manifest), { mode: 0o600 });
  return { directory, manifestPath, manifest, cacheDir: join(directory, "cache") };
}

test("host import is explicit, private, hash-bound and rewrites only the four chapter steps", async (t) => {
  const files = await fixture(t);
  const prepared = await prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES);
  assert.equal(prepared.evidence.playbackRate, 1);
  assert.equal(prepared.evidence.nativeAppRecording, false);
  assert.equal(prepared.evidence.hostAcceptanceEvidence, false);
  assert.deepEqual(prepared.evidence.clips.map((clip) => clip.chapterId), [...QUICKSTART_HOST_CHAPTER_IDS]);
  assert.ok(prepared.evidence.clips.every((clip) => clip.durationMs === 1200));
  assert.ok(!JSON.stringify(prepared.evidence).includes(files.directory));
  for (const clip of prepared.clips) {
    assert.equal(await sha256File(clip.videoPath), clip.sha256);
    assert.equal((await stat(clip.pagePath)).mode & 0o777, 0o600);
  }
  const initialBinding = await quickstartHostClipBinding(prepared);
  const again = await prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES);
  assert.deepEqual(await quickstartHostClipBinding(again), initialBinding);
  assert.deepEqual(again.clips.map((clip) => clip.pagePath), prepared.clips.map((clip) => clip.pagePath));

  const scenario = await loadScenario(resolve("scenarios/example.yaml"));
  const firstPartyChapter = structuredClone(scenario.chapters[0]!);
  scenario.chapters = [...QUICKSTART_HOST_CHAPTER_IDS.map((id) => ({
    id, title: id, scriptedNarration: `Unchanged narration for ${id}.`,
    steps: [{ id: `${id}-card`, label: "Original card", action: "goto" as const, url: "quickstart-card:install" }],
  })), firstPartyChapter];
  applyQuickstartHostClips(scenario, prepared);
  assert.deepEqual(scenario.chapters[4], firstPartyChapter);
  for (const chapter of scenario.chapters.slice(0, 4)) {
    assert.equal(chapter.scriptedNarration, `Unchanged narration for ${chapter.id}.`);
    assert.deepEqual(chapter.steps.map((step) => step.action), ["goto", "waitFor", "assert"]);
    assert.ok(chapter.steps[0]?.action === "goto" && chapter.steps[0].url?.startsWith("file:"));
    assert.ok(chapter.steps[1]?.action === "waitFor" && chapter.steps[1].timeoutMs === 16_200);
    assert.ok(chapter.steps[2]?.action === "assert" && "css" in chapter.steps[2].target && chapter.steps[2].target.css.includes('="ended"'));
  }
  assert.ok(scenario.privacy.evidenceSelectors.includes("[data-quickstart-host-status]"));
  scenario.chapters.reverse();
  assert.throws(() => applyQuickstartHostClips(scenario, prepared), /ordered installation chapters/u);
  await writeFile(prepared.clips[0]!.pagePath, "Changed player");
  await assert.rejects(quickstartHostClipBinding(prepared), /clip or player changed/u);
});

test("host manifests fail closed on missing review, wrong hashes, duplicate chapters or file paths, remote paths and shared permissions", async (t) => {
  const files = await fixture(t);
  const mutations: Array<(manifest: typeof files.manifest) => void> = [
    (value) => { value.clips[0]!.privacyReviewed = false; },
    (value) => { value.clips[0]!.sha256 = "0".repeat(64); },
    (value) => { value.clips[1]!.chapterId = "marketplace"; },
    (value) => { value.clips[1]!.path = value.clips[0]!.path; value.clips[1]!.sha256 = value.clips[0]!.sha256; },
    (value) => { value.clips[0]!.path = "https://claude.example/private.webm"; },
    (value) => { value.clips.pop(); },
  ];
  for (const mutate of mutations) {
    const invalid = structuredClone(files.manifest);
    mutate(invalid);
    await writeFile(files.manifestPath, JSON.stringify(invalid));
    await assert.rejects(prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES));
  }
  await writeFile(files.manifestPath, JSON.stringify(files.manifest));
  if (process.platform !== "win32") {
    await chmod(files.manifestPath, 0o644);
    await assert.rejects(prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES), /accessible/u);
    await chmod(files.manifestPath, 0o600);
    await chmod(join(files.directory, files.manifest.clips[0]!.path), 0o644);
    await assert.rejects(prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES), /accessible/u);
  }
  assert.throws(() => quickstartHostVideoPage("../../private-secret", 1200), /filename/u);
  assert.throws(() => quickstartHostVideoPage(`sha256-${"a".repeat(64)}.webm`, -1), /duration/u);
});

test("English clips need explicit matching language and a localized replay page", async (t) => {
  const files = await fixture(t);
  await assert.rejects(prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES, "en"), /language must match/u);
  await writeFile(files.manifestPath, JSON.stringify({ ...files.manifest, language: "en" }));
  await assert.rejects(prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES, "de"), /language must match/u);
  const prepared = await prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES, "en");
  assert.equal(prepared.evidence.language, "en");
  const html = await readFile(prepared.clips[0]!.pagePath, "utf8");
  assert.match(html, /lang="en"/u);
  assert.match(html, /Playing reviewed Claude web recording/u);
  assert.doesNotMatch(html, /Geprüfte|Aufnahme|vollständig/u);
});

test("local VideoPage actually plays the full clip at speed one and rejects seeking or acceleration", async (t) => {
  const files = await fixture(t);
  const prepared = await prepareQuickstartHostClips(files.manifestPath, files.cacheDir, BINARIES);
  const browser = await chromium.launch({ headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  const url = pathToFileURL(prepared.clips[0]!.pagePath).href;
  const started = performance.now();
  await page.goto(url);
  await page.locator('html[data-quickstart-host-state="ended"]').waitFor({ timeout: 5000 });
  assert.ok(performance.now() - started >= 1000);
  assert.deepEqual(await page.locator("video").evaluate((video: HTMLVideoElement) => ({
    rate: video.playbackRate, muted: video.muted, ended: video.ended, covered: video.played.end(0),
  })), { rate: 1, muted: true, ended: true, covered: 1.2 });
  assert.ok(requests.every((request) => request.startsWith("file:")));
  for (const operation of ["seek", "speed"]) {
    await page.goto(url);
    await page.locator('html[data-quickstart-host-state="playing"]').waitFor();
    await page.locator("video").evaluate((video: HTMLVideoElement, action) => {
      if (action === "seek") video.currentTime = 0.8;
      else video.playbackRate = 2;
    }, operation);
    await page.locator('html[data-quickstart-host-state="error"]').waitFor();
    assert.equal(await page.locator('html[data-quickstart-host-state="ended"]').count(), 0);
  }
});

test("optional host clips preserve cleanup, verified reuse and complete-build evidence without provider access", async (t) => {
  const files = await fixture(t);
  const learnerId = "33333333-3333-4333-8333-333333333333";
  const operations: string[] = [];
  const server = createServer(async (request, response) => {
    if (request.method === "POST" && request.url === "/api/ui/learners") {
      operations.push("CREATE");
      response.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify({ state: { skillpilotId: learnerId } }));
    } else if (request.method === "DELETE") {
      const chunks: Buffer[] = [];
      for await (const chunk of request) chunks.push(Buffer.from(chunk));
      assert.equal(request.url, `/api/ui/learners/${learnerId}`);
      assert.deepEqual(JSON.parse(Buffer.concat(chunks).toString()), { confirmationSkillpilotId: learnerId });
      operations.push("DELETE");
      response.writeHead(204).end();
    } else {
      response.writeHead(200, { "content-type": "text/html" }).end(`<h1>Local fixture only</h1><div id="private">PRIVATE TEST</div>
        <button id="create">Create</button><p id="done"></p><script>document.querySelector('#create').onclick=async()=>{
        await fetch('/api/ui/learners',{method:'POST'});document.querySelector('#done').textContent='Created';};</script>`);
    }
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(() => new Promise<void>((resolveClose) => server.close(() => resolveClose())));
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  const scenarioPath = join(files.directory, "scenario.yaml");
  await writeFile(scenarioPath, YAML.stringify({
    schemaVersion: 1, id: "quickstart-host-test", title: "Synthetic local host-clip fixture", sourceRevision: "local-test",
    outputDir: "./output", cacheDir: "./cache",
    browser: { baseUrl: `http://127.0.0.1:${address.port}`, locale: "de-DE", viewport: { width: 640, height: 360 }, video: { width: 640, height: 360 }, defaultTimeoutMs: 1000, postActionDelayMs: 50 },
    render: { width: 640, height: 360, fps: 25, preset: "ultrafast" },
    privacy: { maskSelectors: ["#private"], evidenceSelectors: ["h1"] },
    narration: { mode: "scripted", ttsModel: "gemini-3.1-flash-tts-preview", voice: "Sulafat" },
    chapters: [
      ...QUICKSTART_HOST_CHAPTER_IDS.map((id) => ({ id, title: id, scriptedNarration: "Local synthetic video fixture.",
        steps: [{ id: `${id}-card`, action: "goto", label: "Card", url: "quickstart-card:install" }] })),
      { id: "first-party", title: "First-party fixture", scriptedNarration: "Local first-party fixture.", steps: [
        { id: "open", action: "goto", label: "Open", url: "/", capture: true },
        { id: "create", action: "click", label: "Create", target: { css: "#create" } },
        { id: "done", action: "assert", label: "Verify", target: { css: "#done" }, text: "Created", capture: true },
      ] },
    ],
  }));
  const options = { scenarioPath, hostClipsPath: files.manifestPath };
  assert.equal(parseQuickstartArguments(["--scenario", scenarioPath, "--host-clips", files.manifestPath]).hostClipsPath, files.manifestPath);
  const recorded = await runQuickstart({ ...options, recordOnly: true });
  assert.equal(recorded.captureLearnersDeleted, 1);
  assert.deepEqual(operations, ["CREATE", "DELETE"]);
  const scenario = await loadScenario(scenarioPath);
  const cardsPath = resolveQuickstartCards(scenario);
  const prepared = await prepareQuickstartHostClips(files.manifestPath, scenario.cacheDir, scenario.binaries);
  applyQuickstartHostClips(scenario, prepared);
  const proof = await verifyQuickstartCaptureCleanup(scenario, recorded.workDir, cardsPath, prepared);
  assert.deepEqual(proof.hostClipAssets, await quickstartHostClipBinding(prepared));
  assert.equal(proof.instructionScreenshotSha256, null);
  const timeline = JSON.parse(await readFile(join(recorded.workDir, "timeline.json"), "utf8"));
  for (const chapterId of QUICKSTART_HOST_CHAPTER_IDS) {
    const clipEvents = timeline.filter((event: { chapterId: string }) => event.chapterId === chapterId);
    assert.equal(clipEvents.length, 3);
    assert.ok(clipEvents[2].endedAtMs - clipEvents[0].startedAtMs >= 1000);
  }
  const reused = await runQuickstart({ ...options, recordOnly: true, reuseRecording: true });
  assert.equal(reused.deletedLearners, 0);
  assert.equal(reused.captureLearnersDeleted, 1);

  const secretsPath = join(files.directory, "synthetic-tts.json");
  await writeFile(secretsPath, JSON.stringify({ schemaVersion: 1, geminiApiKey: "local-fixture-only" }), { mode: 0o600 });
  const originalFetch = globalThis.fetch;
  try {
    globalThis.fetch = (async (url, init) => {
      if (String(url).startsWith("https://generativelanguage.googleapis.com/")) {
        return Response.json({ candidates: [{ finishReason: "STOP", content: { parts: [{ inlineData: {
          mimeType: "audio/l16; rate=24000; channels=1", data: Buffer.alloc(48_000).toString("base64"),
        } }] } }] });
      }
      return originalFetch(url, init);
    }) as typeof fetch;
    const completed = await runQuickstart({ ...options, reuseRecording: true, secretsPath });
    const manifest = JSON.parse(await readFile(join(completed.workDir, "manifest.json"), "utf8"));
    const capture = validateQuickstartCapture(manifest.quickstartCapture);
    assert.equal(capture.actualClaudeHostRecording, true);
    assert.equal(capture.cleanupPerformedThisRun, 0);
    assert.equal(capture.disposableLearnersDeleted, 1);
    assert.ok(capture.actualClaudeHostRecording && !capture.hostClips.hostAcceptanceEvidence);
    const artifact = manifest.artifacts.hostClipEvidence;
    const bytes = await readFile(join(completed.workDir, artifact.path));
    validateQuickstartHostClipArtifact(capture, artifact, bytes);
    assert.ok(!JSON.stringify(capture).includes(files.directory));
  } finally { globalThis.fetch = originalFetch; }
  assert.deepEqual(operations, ["CREATE", "DELETE"]);

  // Mutating either a clip or its reviewed manifest invalidates reuse before
  // any new first-party action. Recovery deliberately does not need the clips.
  await writeFile(join(files.directory, files.manifest.clips[0]!.path), "Changed fixture bytes");
  await assert.rejects(runQuickstart({ ...options, recordOnly: true, reuseRecording: true }), /Private Claude clip import failed/u);
  assert.deepEqual(operations, ["CREATE", "DELETE"]);
  assert.equal((await runQuickstart({ ...options, cleanupOnly: true })).deletedLearners, 0);
});
