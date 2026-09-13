import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { constants } from 'node:fs';
import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { isDeepStrictEqual } from 'node:util';
import { z } from 'zod';
import { resolveVoiceDisclosureMode } from './policy.js';
import { ensurePrivateFile } from './private-fs.js';
import { hasRequiredQuickstartHostChapters, QUICKSTART_ALLOWED_HOST_CHAPTER_IDS } from './quickstart-host-clips.js';

// Editorial export only. Does not deploy, use credentials, or contact a learner API.
const toolRoot = fileURLToPath(new URL('../', import.meta.url));
const repoRoot = resolve(toolRoot, '../..');
const digest = (data: Buffer | string) => createHash('sha256').update(data).digest('hex');
const sha256Schema = z.string().regex(/^[0-9a-f]{64}$/u);
const hostClipEvidenceSchema = z.object({
  schemaVersion: z.literal(1),
  language: z.enum(['de', 'en']).optional(),
  manifestSha256: sha256Schema,
  captureMethod: z.literal('claude-browser-recording'),
  presentation: z.literal('local-video-replay'),
  playbackRate: z.literal(1),
  nativeAppRecording: z.literal(false),
  hostAcceptanceEvidence: z.literal(false),
  clips: z.array(z.object({
    chapterId: z.enum(QUICKSTART_ALLOWED_HOST_CHAPTER_IDS),
    sha256: sha256Schema,
    durationMs: z.number().int().positive().safe(),
    capturedAt: z.iso.datetime({ offset: true }),
    privacyReviewed: z.literal(true),
  }).strict()).min(4).max(5).refine((clips) => hasRequiredQuickstartHostChapters(clips.map((clip) => clip.chapterId)),
    'Each installation chapter is required exactly once; chat-start is optional'),
}).strict();

const captureMetadata = {
  instructionCardsSha256: sha256Schema.optional(),
  instructionScreenshotSha256: sha256Schema.nullable().optional(),
  recordingCleanupEvidenceSha256: sha256Schema.optional(),
  disposableLearnersDeleted: z.number().int().positive().safe(),
  cleanupPerformedThisRun: z.number().int().nonnegative().safe().optional(),
  speechProvider: z.enum(['google-gemini', 'openai']).optional(),
};
const quickstartCaptureSchema = z.discriminatedUnion('kind', [
  z.object({
    ...captureMetadata,
    kind: z.literal('first-party-browser-with-labelled-instruction-cards'),
    actualClaudeHostRecording: z.literal(false),
  }).strict(),
  z.object({
    ...captureMetadata,
    kind: z.literal('first-party-browser-with-verified-claude-web-clips'),
    actualClaudeHostRecording: z.literal(true),
    hostClips: hostClipEvidenceSchema,
  }).strict(),
]);
const hostClipArtifactSchema = z.object({
  // Portable work-directory-relative paths only. Never follow an arbitrary
  // absolute path supplied by a purported evidence manifest.
  path: z.string().regex(/^[a-zA-Z0-9_.-]+(?:\/[a-zA-Z0-9_.-]+)*$/u)
    .refine((path) => path.split('/').every((part) => part !== '.' && part !== '..')),
  sha256: sha256Schema,
}).strict();

const focusStepIdSchema = z.string().regex(/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/u).max(80);
const focusDeclarationSchema = z.object({
  fromStepId: focusStepIdSchema,
  toStepId: focusStepIdSchema,
  x: z.number().int().nonnegative().max(8192),
  y: z.number().int().nonnegative().max(8192),
  width: z.number().int().positive().max(8192),
  height: z.number().int().positive().max(8192),
  leadMs: z.number().int().min(0).max(1000).default(0),
}).strict();
const recordedFocusRegionSchema = focusDeclarationSchema.extend({
  chapterId: z.enum(['intro', 'marketplace', 'repository', 'plugin-install', 'plugin-connect',
    'website', 'identity', 'save', 'curriculum', 'personal-curriculum', 'launch', 'cockpit',
    'feedback', 'chat-start', 'session', 'mobile', 'finish']),
  sourceStartMs: z.number().int().nonnegative().safe(),
  sourceEndMs: z.number().int().positive().safe(),
  startMs: z.number().int().nonnegative().safe(),
  endMs: z.number().int().positive().safe(),
  sourceWidth: z.number().int().positive().max(8192),
  sourceHeight: z.number().int().positive().max(8192),
  fit: z.literal('contain'),
  paddingColor: z.literal('white'),
  speed: z.literal(1),
}).strict();

/** Publish only bounded, declared camera framing, never arbitrary render metadata. */
export function validateQuickstartRecordedFocus(scenarioValue: unknown, regionsValue: unknown, durationMs: number) {
  if (!Number.isSafeInteger(durationMs) || durationMs <= 0) throw new Error('Invalid framed export duration');
  const scenario = z.object({
    browser: z.object({ video: z.object({ width: z.number().int().positive(), height: z.number().int().positive() }) }),
    chapters: z.array(z.object({
      id: focusStepIdSchema,
      recordedFocus: focusDeclarationSchema.optional(),
      steps: z.array(z.object({ id: focusStepIdSchema })),
    })),
  }).parse(scenarioValue);
  const declarations = scenario.chapters.filter((chapter) => chapter.recordedFocus !== undefined);
  if (regionsValue === undefined) {
    if (declarations.length > 0) throw new Error('Declared Quickstart camera framing lacks completed render evidence');
    return undefined;
  }
  const regions = z.array(recordedFocusRegionSchema).max(16).parse(regionsValue);
  if (regions.length !== declarations.length
    || new Set(regions.map((region) => region.chapterId)).size !== regions.length
    || new Set(scenario.chapters.map((chapter) => chapter.id)).size !== scenario.chapters.length) {
    throw new Error('Quickstart camera framing must match each declared chapter exactly once');
  }
  let previousSourceEnd = 0;
  let previousEnd = 0;
  let previousChapterIndex = -1;
  for (const region of regions) {
    const chapterIndex = scenario.chapters.findIndex((chapter) => chapter.id === region.chapterId);
    const chapter = scenario.chapters[chapterIndex];
    if (!chapter?.recordedFocus || chapterIndex <= previousChapterIndex) throw new Error('Unexpected framed Quickstart chapter');
    const declared = chapter.recordedFocus;
    const fromIndex = chapter.steps.findIndex((step) => step.id === region.fromStepId);
    const toIndex = chapter.steps.findIndex((step) => step.id === region.toStepId);
    if (fromIndex < 0 || toIndex < fromIndex
      || new Set(chapter.steps.map((step) => step.id)).size !== chapter.steps.length
      || !isDeepStrictEqual(declared, {
        fromStepId: region.fromStepId, toStepId: region.toStepId,
        x: region.x, y: region.y, width: region.width, height: region.height, leadMs: region.leadMs,
      })) throw new Error('Rendered Quickstart camera framing differs from its declared step range');
    if (region.sourceWidth !== scenario.browser.video.width || region.sourceHeight !== scenario.browser.video.height
      || region.x + region.width > region.sourceWidth || region.y + region.height > region.sourceHeight) {
      throw new Error('Quickstart camera framing must fit the recorded video dimensions');
    }
    if (region.sourceStartMs < previousSourceEnd || region.sourceEndMs <= region.sourceStartMs
      || region.startMs < previousEnd || region.endMs <= region.startMs || region.endMs > durationMs) {
      throw new Error('Quickstart camera framing has invalid or overlapping source/output timing');
    }
    previousSourceEnd = region.sourceEndMs;
    previousEnd = region.endMs;
    previousChapterIndex = chapterIndex;
  }
  return regions.length > 0 ? regions : undefined;
}

/** Parse the complete capture variant; reject mixed claims and private paths. */
export function validateQuickstartCapture(value: unknown) {
  return quickstartCaptureSchema.parse(value);
}

/** Historic language-less host clips are German, never a fallback for English. */
export function validateQuickstartCaptureLanguage(captureValue: unknown, language: 'de' | 'en') {
  const expectedLanguage = z.enum(['de', 'en']).parse(language);
  const capture = validateQuickstartCapture(captureValue);
  if (capture.actualClaudeHostRecording
    && (capture.hostClips.language ?? 'de') !== expectedLanguage) {
    throw new Error('Claude browser clip language must match the Quickstart export language');
  }
}

/** Validate already-read evidence bytes, independently of filesystem or export. */
export function validateQuickstartHostClipArtifact(captureValue: unknown, artifactValue?: unknown, evidenceBytes?: Buffer | string) {
  const capture = validateQuickstartCapture(captureValue);
  if (!capture.actualClaudeHostRecording) {
    if (artifactValue !== undefined || evidenceBytes !== undefined) {
      throw new Error('Instruction-card capture must not contain Claude host-clip evidence');
    }
    return;
  }
  const artifact = hostClipArtifactSchema.parse(artifactValue);
  if (evidenceBytes === undefined || digest(evidenceBytes) !== artifact.sha256) {
    throw new Error('Claude host-clip evidence artifact hash mismatch');
  }
  const evidence = hostClipEvidenceSchema.parse(JSON.parse(evidenceBytes.toString()));
  if (!isDeepStrictEqual(evidence, capture.hostClips)) {
    throw new Error('Claude host-clip evidence does not match the completed capture');
  }
}

/** Public evidence never promotes browser clips into native or full acceptance. */
export function quickstartCaptureProvenance(captureValue: unknown) {
  const capture = validateQuickstartCapture(captureValue);
  return {
    capture: capture.actualClaudeHostRecording
      ? 'Production SkillPilot browser recording and verified Claude browser recordings replayed locally at original speed'
      : 'Production SkillPilot browser recording and explicitly labelled Claude instruction cards',
    actualClaudeHostRecording: capture.actualClaudeHostRecording,
    nativeAppRecording: false as const,
    hostAcceptanceEvidence: false as const,
    ...(capture.actualClaudeHostRecording ? { hostClips: capture.hostClips } : {}),
  };
}

const timestamp = (milliseconds: number) => {
  const value = Math.max(0, Math.round(milliseconds));
  return `${String(Math.floor(value / 3600000)).padStart(2, '0')}:${String(Math.floor(value / 60000) % 60).padStart(2, '0')}:${String(Math.floor(value / 1000) % 60).padStart(2, '0')}.${String(value % 1000).padStart(3, '0')}`;
};

/** Convert only SRT syntax. Preserve every cue time; never speed up or cut the source. */
export function convertQuickstartCaptions(srt: string, durationMs: number): string {
  if (!Number.isSafeInteger(durationMs) || durationMs <= 0) {
    throw new Error('Caption export requires a positive integer duration');
  }
  const cueTime = (value: string): number => {
    const match = /^(\d{2,}):(\d{2}):(\d{2}),(\d{3})$/u.exec(value);
    if (!match || Number(match[2]) > 59 || Number(match[3]) > 59) throw new Error('Invalid source caption timestamp');
    return Number(match[1]) * 3600000 + Number(match[2]) * 60000 + Number(match[3]) * 1000 + Number(match[4]);
  };
  const cues: string[] = [];
  let previousEnd = 0;
  for (const block of srt.replace(/^\uFEFF/u, '').replace(/\r\n?/gu, '\n').trim().split(/\n\s*\n/u)) {
    if (!block) continue;
    const lines = block.split('\n');
    const timingIndex = /^\d+$/u.test(lines[0] ?? '') ? 1 : 0;
    const timing = /^(\S+) --> (\S+)$/u.exec(lines[timingIndex] ?? '');
    if (!timing) throw new Error('Invalid source caption cue');
    const sourceStart = cueTime(timing[1]!);
    const sourceEnd = cueTime(timing[2]!);
    if (sourceEnd <= sourceStart) throw new Error('Source caption must have positive duration');
    const start = sourceStart;
    const end = sourceEnd;
    if (end > durationMs) throw new Error('Source caption extends beyond the original video duration');
    if (start < previousEnd) throw new Error('Source caption cues must not overlap');
    const text = lines.slice(timingIndex + 1).join('\n');
    if (!text.trim()) throw new Error('Source caption text is empty');
    cues.push(`${cues.length + 1}\n${timestamp(start)} --> ${timestamp(end)}\n${text}`);
    previousEnd = end;
  }
  return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}

export function prepareOriginalTempoExport(sourceSeconds: number, srt: string) {
  if (!Number.isFinite(sourceSeconds) || sourceSeconds <= 0) throw new Error('Invalid original video duration');
  return {
    durationSeconds: sourceSeconds,
    editorialPlaybackRate: 1 as const,
    captions: convertQuickstartCaptions(srt, Math.ceil(sourceSeconds * 1000)),
  };
}

/** Locale, scenario identity and voice notice must agree before any public write. */
export function resolveQuickstartExportTarget(scenarioValue: unknown) {
  const scenario = z.object({
    id: z.string(),
    browser: z.object({ locale: z.enum(['de', 'de-DE', 'en', 'en-US', 'en-GB']) }),
    narration: z.object({ visualDisclosure: z.string() }),
  }).parse(scenarioValue);
  const language = scenario.browser.locale.startsWith('de') ? 'de' : 'en';
  if (scenario.id !== `skillpilot-claude-quickstart-2026-09-13-${language}`) {
    throw new Error('Quickstart scenario identity must match its supported recording language');
  }
  const voiceNotice = language === 'de' ? 'KI-generierte Sprecherstimme' : 'AI-generated voice';
  if (scenario.narration.visualDisclosure !== voiceNotice) {
    throw new Error('Quickstart voice notice must match its recording language');
  }
  return { language, publicRoot: `/media/quickstart/claude/2026-09-13/${language}` } as const;
}

async function main() {
  const workDir = resolve(process.argv[2] ?? '');
  if (!process.argv[2] || !basename(workDir).startsWith('skillpilot-claude-quickstart-')) {
    throw new Error('Pass a completed SkillPilot Claude Quickstart work directory');
  }
  const manifest = JSON.parse(await readFile(join(workDir, 'manifest.json'), 'utf8'));
  const capture = validateQuickstartCapture(manifest.quickstartCapture);
  const { language, publicRoot } = resolveQuickstartExportTarget(manifest.scenario);
  validateQuickstartCaptureLanguage(capture, language);
  const hostClipArtifact = manifest.artifacts?.hostClipEvidence === undefined
    ? undefined : hostClipArtifactSchema.parse(manifest.artifacts.hostClipEvidence);
  validateQuickstartHostClipArtifact(capture, hostClipArtifact,
    hostClipArtifact ? await readFile(join(workDir, hostClipArtifact.path)) : undefined);
  const source = join(workDir, manifest.artifacts.video.path);
  const srtPath = join(workDir, manifest.artifacts.subtitles.path);
  const disclosureMode = resolveVoiceDisclosureMode(manifest.scenario.narration.disclosureMode, manifest.scenario.narration.visualDisclosure);
  if (disclosureMode !== 'visual-only') throw new Error('The current public Quickstart requires an explicit visual-only voice notice');
  if (disclosureMode === 'visual-only') {
    const label = manifest.artifacts.visualDisclosure;
    if (!label?.path || !label.sha256) throw new Error('Missing burned-in voice disclosure evidence');
    const text = await readFile(join(workDir, label.path), 'utf8');
    if (digest(text) !== label.sha256 || text !== manifest.scenario.narration.visualDisclosure) {
      throw new Error('Burned-in voice disclosure evidence mismatch');
    }
  }
  for (const [path, hash] of [[source, manifest.artifacts.video.sha256], [srtPath, manifest.artifacts.subtitles.sha256]]) {
    if (digest(await readFile(path)) !== hash) throw new Error('Completed artifact hash mismatch');
  }
  const sourceSeconds = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=noprint_wrappers=1:nokey=1', source], { encoding: 'utf8' }));
  // Export the completed MP4 byte-for-byte: no rate change, re-encoding, or duration cap.
  const { durationSeconds: seconds, editorialPlaybackRate: rate, captions } = prepareOriginalTempoExport(sourceSeconds, await readFile(srtPath, 'utf8'));
  const recordedFocusRegions = validateQuickstartRecordedFocus(manifest.scenario,
    manifest.render?.recordedFocusRegions, Math.ceil(sourceSeconds * 1000));
  const posterPath = join(workDir, 'quickstart-poster.webp');
  execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(Math.min(5, sourceSeconds / 2)), '-i', source,
    '-frames:v', '1', '-vf', 'scale=1280:-1', '-c:v', 'libwebp', '-quality', '88', posterPath]);
  await ensurePrivateFile(posterPath);
  const destination = join(repoRoot, 'app/public', publicRoot);
  await mkdir(destination, { recursive: true });
  const videoHash = digest(await readFile(source));
  const posterHash = digest(await readFile(posterPath));
  const captionsHash = digest(captions);
  const videoName = `sha256-${videoHash}.mp4`;
  const posterName = `sha256-${posterHash}.webp`;
  const captionsName = `sha256-${captionsHash}.vtt`;
  // Content-addressed files are create-only; a second identical export is harmless.
  const immutableCopy = async (from: string, name: string, hash: string) => {
    const to = join(destination, name);
    try { await copyFile(from, to, constants.COPYFILE_EXCL); }
    catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || digest(await readFile(to)) !== hash) throw error;
    }
  };
  await immutableCopy(source, videoName, videoHash);
  await immutableCopy(posterPath, posterName, posterHash);
  try { await writeFile(join(destination, captionsName), captions, { flag: 'wx' }); }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST' || digest(await readFile(join(destination, captionsName))) !== captionsHash) throw error;
  }
  const provenance = {
    schemaVersion: 1, language, durationSeconds: seconds,
    ...quickstartCaptureProvenance(capture),
    ...(hostClipArtifact ? { hostClipEvidenceSha256: hostClipArtifact.sha256 } : {}),
    ...(recordedFocusRegions ? { recordedFocusRegions } : {}),
    aiVoiceDisclosureMode: disclosureMode,
    aiVoiceDisclosure: disclosureMode === 'visual-only'
      ? manifest.scenario.narration.visualDisclosure : manifest.scenario.narration.disclosure,
    ...(disclosureMode === 'visual-only' ? { visualDisclosure: { placement: 'top-right', fromMs: 0, toMs: 8000, textSha256: manifest.artifacts.visualDisclosure.sha256 } } : {}),
    models: manifest.models, editorialPlaybackRate: rate,
    speechProvider: manifest.quickstartCapture.speechProvider,
    repositoryBaseRevision: manifest.sourceRevision,
    productionBuildAttested: false,
    scenarioSourceSha256: manifest.scenarioSourceSha256,
    instructionCardsSha256: manifest.quickstartCapture.instructionCardsSha256,
    instructionScreenshotSha256: manifest.quickstartCapture.instructionScreenshotSha256,
    recordingCleanupEvidenceSha256: manifest.quickstartCapture.recordingCleanupEvidenceSha256,
    sourceVideoSha256: manifest.artifacts.video.sha256,
    captureLearnerCleanupVerified: true,
    artifacts: { video: { file: videoName, sha256: videoHash }, poster: { file: posterName, sha256: posterHash }, captions: { file: captionsName, sha256: captionsHash } },
  };
  await writeFile(join(destination, 'provenance.json'), JSON.stringify(provenance, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ language, video: `${publicRoot}/${videoName}`, poster: `${publicRoot}/${posterName}`, captions: `${publicRoot}/${captionsName}`, durationSeconds: seconds, editorialPlaybackRate: rate }, null, 2) + '\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(() => { process.stderr.write('Quickstart export failed; inspect the completed local artifacts. No deployment performed.\n'); process.exitCode = 1; });
}
