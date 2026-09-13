import { copyFile, open, readFile, realpath, stat } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { z } from "zod";
import { sha256File, sha256Text, stableJson } from "./hash.js";
import { probeMediaDurationMs, probeMediaStreamTypes } from "./media.js";
import { assertPrivateInputFile, ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";
import type { DemoScenario } from "./types.js";

export const QUICKSTART_HOST_CHAPTER_IDS = ["marketplace", "repository", "plugin-install", "plugin-connect"] as const;
export const QUICKSTART_ALLOWED_HOST_CHAPTER_IDS = [...QUICKSTART_HOST_CHAPTER_IDS, "chat-start"] as const;
export type QuickstartHostChapterId = typeof QUICKSTART_ALLOWED_HOST_CHAPTER_IDS[number];

/** Preserve the four installation clips; a reviewed chat start is the only optional addition. */
export function hasRequiredQuickstartHostChapters(ids: readonly string[]): boolean {
  return ids.length >= QUICKSTART_HOST_CHAPTER_IDS.length
    && ids.length <= QUICKSTART_ALLOWED_HOST_CHAPTER_IDS.length
    && new Set(ids).size === ids.length
    && QUICKSTART_HOST_CHAPTER_IDS.every((id) => ids.includes(id))
    && ids.every((id) => QUICKSTART_ALLOWED_HOST_CHAPTER_IDS.includes(id as QuickstartHostChapterId));
}
const sha256 = z.string().regex(/^[0-9a-f]{64}$/u);
const clipSchema = z.object({
  chapterId: z.enum(QUICKSTART_ALLOWED_HOST_CHAPTER_IDS),
  path: z.string().min(1),
  sha256,
  capturedAt: z.iso.datetime(),
  captureMethod: z.literal("claude-browser-recording"),
  privacyReviewed: z.literal(true),
}).strict();
const manifestSchema = z.object({
  schemaVersion: z.literal(1), language: z.enum(["de", "en"]).optional(),
  clips: z.array(clipSchema).min(4).max(5).refine((clips) => hasRequiredQuickstartHostChapters(clips.map((clip) => clip.chapterId)),
    "Each installation chapter is required exactly once; chat-start is optional"),
}).strict();

export interface QuickstartHostClipEvidence {
  schemaVersion: 1;
  language?: "de" | "en";
  manifestSha256: string;
  captureMethod: "claude-browser-recording";
  presentation: "local-video-replay";
  playbackRate: 1;
  nativeAppRecording: false;
  hostAcceptanceEvidence: false;
  clips: Array<{
    chapterId: QuickstartHostChapterId;
    sha256: string;
    durationMs: number;
    capturedAt: string;
    privacyReviewed: true;
  }>;
}

interface PreparedHostClip {
  chapterId: QuickstartHostChapterId;
  inputPath: string;
  videoPath: string;
  pagePath: string;
  sha256: string;
  pageSha256: string;
  durationMs: number;
}

export interface PreparedQuickstartHostClips {
  manifestPath: string;
  evidence: QuickstartHostClipEvidence;
  clips: PreparedHostClip[];
}

/** No remote resources, credentials, controls, looping or playback-speed adjustment. */
export function quickstartHostVideoPage(videoName: string, expectedDurationMs: number, language: "de" | "en" = "de"): string {
  if (!/^sha256-[0-9a-f]{64}\.(?:mp4|webm|mov)$/u.test(videoName)) throw new Error("Invalid private host-clip filename");
  if (!Number.isSafeInteger(expectedDurationMs) || expectedDurationMs <= 0) throw new Error("Invalid private host-clip duration");
  const copy = language === "en" ? {
    title: "Claude web – actual recording", loading: "Playing reviewed Claude web recording.",
    error: "Claude recording could not be played in full.", ended: "Reviewed Claude web recording played in full at normal speed.",
  } : {
    title: "Claude im Web – echte Aufnahme", loading: "Geprüfte Claude-Webaufnahme wird abgespielt.",
    error: "Claude-Aufnahme konnte nicht vollständig abgespielt werden.", ended: "Geprüfte Claude-Webaufnahme vollständig mit normaler Geschwindigkeit abgespielt.",
  };
  return `<!doctype html><html lang="${language}" data-quickstart-host-state="loading"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; media-src 'self' file:; script-src 'unsafe-inline'; style-src 'unsafe-inline'">
<title>${copy.title}</title><style>
html,body{margin:0;width:100%;height:100%;overflow:hidden;background:#000}video{width:100%;height:100%;object-fit:contain}
[data-quickstart-host-status]{position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)}
</style></head><body><video muted playsinline preload="auto" disablepictureinpicture></video>
<span data-quickstart-host-status>${copy.loading}</span><script>
const video=document.querySelector('video');const root=document.documentElement;const status=document.querySelector('[data-quickstart-host-status]');
let failed=false,startedAt=null;const expected=${expectedDurationMs / 1000};
const fail=()=>{failed=true;root.dataset.quickstartHostState='error';status.textContent='${copy.error}';video.pause();};
video.muted=true;video.volume=0;video.defaultPlaybackRate=1;video.playbackRate=1;
video.addEventListener('error',fail);video.addEventListener('seeking',fail);
video.addEventListener('ratechange',()=>{if(video.playbackRate!==1)fail();});
video.addEventListener('loadedmetadata',()=>{if(!Number.isFinite(video.duration)||Math.abs(video.duration-expected)>0.5)fail();});
video.addEventListener('playing',()=>{if(startedAt===null)startedAt=performance.now();if(!failed)root.dataset.quickstartHostState='playing';});
video.addEventListener('ended',()=>{
  let covered=0;for(let i=0;i<video.played.length;i++){if(video.played.start(i)>covered+0.1){fail();return;}covered=video.played.end(i);}
  if(failed||startedAt===null||video.playbackRate!==1||!video.ended||covered<video.duration-0.1||performance.now()-startedAt<(video.duration-0.15)*1000){fail();return;}
  root.dataset.quickstartHostState='ended';status.textContent='${copy.ended}';
});
video.src=${JSON.stringify(videoName)};video.play().catch(fail);
</script></body></html>`;
}

async function immutablePrivateCopy(inputPath: string, outputPath: string, expectedHash: string): Promise<void> {
  try { await copyFile(inputPath, outputPath, constants.COPYFILE_EXCL); await ensurePrivateFile(outputPath); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  await assertPrivateInputFile(outputPath, "Private Claude clip snapshot");
  if (await sha256File(outputPath) !== expectedHash) throw new Error("Private Claude clip snapshot hash mismatch");
}

async function immutablePrivateText(outputPath: string, text: string): Promise<void> {
  try {
    const handle = await open(outputPath, "wx", 0o600);
    try { await handle.writeFile(text, "utf8"); } finally { await handle.close(); }
  }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error; }
  await assertPrivateInputFile(outputPath, "Private Claude clip player");
  if (await sha256File(outputPath) !== sha256Text(text)) throw new Error("Private Claude clip player hash mismatch");
}

/** Validate all four privately reviewed clips before any browser or learner action. */
export async function prepareQuickstartHostClips(
  manifestPath: string,
  cacheDir: string,
  binaries: DemoScenario["binaries"],
  expectedLanguage: "de" | "en" = "de",
): Promise<PreparedQuickstartHostClips> {
  const path = resolve(manifestPath);
  await assertPrivateInputFile(path, "Private Claude clip manifest");
  const bytes = await readFile(path);
  let parsed: z.infer<typeof manifestSchema>;
  try { parsed = manifestSchema.parse(JSON.parse(bytes.toString("utf8"))); }
  catch { throw new Error("Claude clip manifest must contain four reviewed installation clips and optionally one reviewed chat-start clip"); }
  if ((parsed.language ?? "de") !== expectedLanguage) throw new Error("Claude clip recording language must match the Quickstart language");
  const manifestSha256 = sha256Text(bytes.toString("utf8"));
  const resolvedInputs = new Set<string>();
  const fileIdentities = new Set<string>();
  const clips: PreparedHostClip[] = [];
  const evidence: QuickstartHostClipEvidence = {
    schemaVersion: 1, manifestSha256, captureMethod: "claude-browser-recording",
    ...(parsed.language ? { language: parsed.language } : {}),
    presentation: "local-video-replay", playbackRate: 1, nativeAppRecording: false, hostAcceptanceEvidence: false, clips: [],
  };
  for (const chapterId of QUICKSTART_ALLOWED_HOST_CHAPTER_IDS) {
    const clip = parsed.clips.find((entry) => entry.chapterId === chapterId);
    if (!clip) continue;
    if (/^[a-z][a-z0-9+.-]*:/iu.test(clip.path) && !/^[a-z]:[\\/]/iu.test(clip.path)) throw new Error("Claude clips must use local file paths, not URLs");
    const inputPath = resolve(dirname(path), clip.path);
    await assertPrivateInputFile(inputPath, "Private Claude browser clip");
    const canonicalPath = await realpath(inputPath);
    const metadata = await stat(inputPath);
    const identity = `${metadata.dev}:${metadata.ino}`;
    if (resolvedInputs.has(canonicalPath) || fileIdentities.has(identity)) throw new Error("Each Claude chapter needs its own unambiguous local clip file");
    resolvedInputs.add(canonicalPath); fileIdentities.add(identity);
    if (await sha256File(inputPath) !== clip.sha256) throw new Error(`Claude clip hash mismatch for ${chapterId}`);
    const extension = extname(inputPath).toLowerCase();
    if (![".mp4", ".webm", ".mov"].includes(extension)) throw new Error("Claude browser clips must be MP4, WebM or MOV files");
    const durationMs = await probeMediaDurationMs(inputPath, binaries);
    if (durationMs > 600_000 || (await probeMediaStreamTypes(inputPath, binaries)).video !== 1) {
      throw new Error("Claude chapter clips need one video stream and at most ten minutes duration");
    }
    const videoName = `sha256-${clip.sha256}${extension}`;
    const html = quickstartHostVideoPage(videoName, durationMs, expectedLanguage);
    const pageSha256 = sha256Text(html);
    // Content addresses include the player implementation: reuse cannot silently
    // adopt a changed playback policy under an old recording/cleanup claim.
    const directory = join(cacheDir, "quickstart-host-clips", manifestSha256, pageSha256);
    await ensurePrivateDirectory(directory);
    const videoPath = join(directory, videoName);
    const pagePath = join(directory, "player.html");
    await immutablePrivateCopy(inputPath, videoPath, clip.sha256);
    await immutablePrivateText(pagePath, html);
    clips.push({ chapterId, inputPath, videoPath, pagePath, sha256: clip.sha256, pageSha256, durationMs });
    evidence.clips.push({ chapterId, sha256: clip.sha256, durationMs, capturedAt: clip.capturedAt, privacyReviewed: true });
  }
  const prepared = { manifestPath: path, evidence, clips };
  await quickstartHostClipBinding(prepared);
  return prepared;
}

/** Rehash both source and replay snapshots; no raw paths enter the issued evidence. */
export async function quickstartHostClipBinding(prepared: PreparedQuickstartHostClips) {
  await assertPrivateInputFile(prepared.manifestPath, "Private Claude clip manifest");
  if (await sha256File(prepared.manifestPath) !== prepared.evidence.manifestSha256) throw new Error("Claude clip manifest changed; make a fresh capture");
  for (const clip of prepared.clips) {
    for (const path of [clip.inputPath, clip.videoPath, clip.pagePath]) await assertPrivateInputFile(path, "Private Claude replay input");
    if (await sha256File(clip.inputPath) !== clip.sha256 || await sha256File(clip.videoPath) !== clip.sha256
      || await sha256File(clip.pagePath) !== clip.pageSha256) throw new Error("Claude clip or player changed; make a fresh capture");
  }
  return {
    evidenceSha256: sha256Text(stableJson(prepared.evidence)),
    playerPages: prepared.clips.map(({ chapterId, pageSha256 }) => ({ chapterId, sha256: pageSha256 })),
  };
}

/** Rewrite only supplied host chapters; narration and first-party steps stay intact. */
export function applyQuickstartHostClips(scenario: DemoScenario, prepared: PreparedQuickstartHostClips): void {
  const suppliedIds = prepared.clips.map((clip) => clip.chapterId);
  if (!hasRequiredQuickstartHostChapters(suppliedIds)) throw new Error("Invalid prepared Quickstart host chapter set");
  const expectedIds = QUICKSTART_ALLOWED_HOST_CHAPTER_IDS.filter((id) => suppliedIds.includes(id));
  const selected = scenario.chapters.filter((chapter) => suppliedIds.includes(chapter.id as QuickstartHostChapterId));
  if (selected.length !== expectedIds.length || selected.some((chapter, index) => chapter.id !== expectedIds[index])) {
    throw new Error("Quickstart host clips require the four ordered installation chapters and any supplied chat-start chapter");
  }
  const reservedStepIds = new Set(expectedIds.flatMap((id) => [`${id}-host-open`, `${id}-host-ended`, `${id}-host-verified`]));
  if (scenario.chapters.filter((chapter) => !selected.includes(chapter)).some((chapter) => chapter.steps.some((step) => reservedStepIds.has(step.id)))) {
    throw new Error("Quickstart host playback step identifiers collide with another chapter");
  }
  for (const chapter of selected) {
    const clip = prepared.clips.find((entry) => entry.chapterId === chapter.id)!;
    chapter.steps = [
      { id: `${chapter.id}-host-open`, label: "Play verified Claude browser recording", action: "goto", url: pathToFileURL(clip.pagePath).href, capture: true },
      { id: `${chapter.id}-host-ended`, label: "Wait for complete normal-speed playback", action: "waitFor", target: { css: 'html[data-quickstart-host-state="ended"],html[data-quickstart-host-state="error"]' }, state: "visible", timeoutMs: clip.durationMs + 15_000 },
      { id: `${chapter.id}-host-verified`, label: "Verify the complete Claude clip was shown", action: "assert", target: { css: 'html[data-quickstart-host-state="ended"]' }, state: "visible", timeoutMs: 1_000, capture: true },
    ];
  }
  if (!scenario.privacy.evidenceSelectors.includes("[data-quickstart-host-status]")) {
    scenario.privacy.evidenceSelectors.push("[data-quickstart-host-status]");
  }
}
