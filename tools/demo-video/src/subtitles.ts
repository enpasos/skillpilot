import path from "node:path";
import { ensurePrivateDirectory, writePrivateFile } from "./private-fs.js";

export interface TimedTranscript {
  id?: string;
  text: string;
  startMs: number;
  endMs: number;
}

export interface SubtitleCue {
  index: number;
  sourceId?: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface SubtitleLayoutOptions {
  maxCharactersPerLine?: number;
  maxLinesPerCue?: number;
  minimumCueDurationMs?: number;
}

const DEFAULT_MAX_CHARACTERS_PER_LINE = 42;
const DEFAULT_MAX_LINES_PER_CUE = 2;
const DEFAULT_MINIMUM_CUE_DURATION_MS = 850;

function requireTimestamp(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new TypeError(`${label} must be a non-negative integer number of milliseconds`);
  }
}

function requirePositiveInteger(value: number, label: string): void {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TypeError(`${label} must be a positive safe integer`);
  }
}

/** Formats milliseconds using the SubRip `HH:MM:SS,mmm` convention. */
export function formatSrtTimestamp(milliseconds: number): string {
  requireTimestamp(milliseconds, "milliseconds");
  const hours = Math.floor(milliseconds / 3_600_000);
  const minutes = Math.floor((milliseconds % 3_600_000) / 60_000);
  const seconds = Math.floor((milliseconds % 60_000) / 1_000);
  const millis = milliseconds % 1_000;
  return [hours, minutes, seconds]
    .map((part) => String(part).padStart(2, "0"))
    .join(":") + `,${String(millis).padStart(3, "0")}`;
}

function splitLongToken(token: string, maxLength: number): string[] {
  const characters = Array.from(token);
  if (characters.length <= maxLength) return [token];
  const pieces: string[] = [];
  for (let offset = 0; offset < characters.length; offset += maxLength) {
    pieces.push(characters.slice(offset, offset + maxLength).join(""));
  }
  return pieces;
}

function sanitizeText(text: string): string {
  // SRT is later parsed by libass. Neutralize HTML/ASS-style formatting from
  // generated or page-derived text so it is rendered literally.
  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[{}]/g, (character) => (character === "{" ? "（" : "）"))
    .replace(/</g, "‹")
    .replace(/>/g, "›")
    .trim();
}

export function wrapSubtitleText(
  text: string,
  maxCharactersPerLine = DEFAULT_MAX_CHARACTERS_PER_LINE,
): string[] {
  requirePositiveInteger(maxCharactersPerLine, "maxCharactersPerLine");
  const normalized = sanitizeText(text);
  if (!normalized) return [];

  const words = normalized
    .split(/\s+/u)
    .flatMap((word) => splitLongToken(word, maxCharactersPerLine));
  const lines: string[] = [];
  let line = "";

  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (Array.from(candidate).length <= maxCharactersPerLine) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    line = word;
  }
  if (line) lines.push(line);
  return lines;
}

function pageWeights(pages: readonly string[][]): number[] {
  return pages.map((lines) =>
    Math.max(1, Array.from(lines.join(" ").replace(/\s/gu, "")).length),
  );
}

function allocateDurations(
  totalDurationMs: number,
  weights: readonly number[],
  minimumCueDurationMs: number,
): number[] {
  if (weights.length === 1) return [totalDurationMs];

  const baseDuration =
    totalDurationMs >= weights.length * minimumCueDurationMs
      ? minimumCueDurationMs
      : 1;
  const distributable = totalDurationMs - baseDuration * weights.length;
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const durations = weights.map(() => baseDuration);
  let cumulativeWeight = 0;
  let allocatedExtra = 0;
  for (let index = 0; index < weights.length; index += 1) {
    cumulativeWeight += weights[index]!;
    const targetExtra =
      index === weights.length - 1
        ? distributable
        : Math.floor((distributable * cumulativeWeight) / totalWeight);
    durations[index] = durations[index]! + targetExtra - allocatedExtra;
    allocatedExtra = targetExtra;
  }
  return durations;
}

/**
 * Turns narration timings into readable, bounded subtitle cues. Input segments
 * must already follow the actual audio schedule; overlap is rejected instead
 * of silently producing stacked captions.
 */
export function createSubtitleCues(
  transcripts: readonly TimedTranscript[],
  options: SubtitleLayoutOptions = {},
): SubtitleCue[] {
  const maxCharactersPerLine =
    options.maxCharactersPerLine ?? DEFAULT_MAX_CHARACTERS_PER_LINE;
  const maxLinesPerCue = options.maxLinesPerCue ?? DEFAULT_MAX_LINES_PER_CUE;
  const minimumCueDurationMs =
    options.minimumCueDurationMs ?? DEFAULT_MINIMUM_CUE_DURATION_MS;
  requirePositiveInteger(maxCharactersPerLine, "maxCharactersPerLine");
  requirePositiveInteger(maxLinesPerCue, "maxLinesPerCue");
  requirePositiveInteger(minimumCueDurationMs, "minimumCueDurationMs");

  const sorted = transcripts
    .map((transcript, sourceOrder) => ({ transcript, sourceOrder }))
    .sort(
      (left, right) =>
        left.transcript.startMs - right.transcript.startMs ||
        left.sourceOrder - right.sourceOrder,
    );
  const cues: SubtitleCue[] = [];
  let previousEndMs = 0;
  let hasPreviousTranscript = false;

  for (const { transcript } of sorted) {
    requireTimestamp(transcript.startMs, "startMs");
    requireTimestamp(transcript.endMs, "endMs");
    if (transcript.endMs <= transcript.startMs) {
      throw new RangeError("Each transcript must end after it starts");
    }
    if (hasPreviousTranscript && transcript.startMs < previousEndMs) {
      throw new RangeError("Transcript timings must not overlap");
    }

    const lines = wrapSubtitleText(transcript.text, maxCharactersPerLine);
    if (lines.length === 0) {
      previousEndMs = transcript.endMs;
      hasPreviousTranscript = true;
      continue;
    }
    const pages: string[][] = [];
    for (let index = 0; index < lines.length; index += maxLinesPerCue) {
      pages.push(lines.slice(index, index + maxLinesPerCue));
    }
    if (transcript.endMs - transcript.startMs < pages.length) {
      throw new RangeError(
        "Transcript duration is too short to allocate at least one millisecond per cue",
      );
    }
    const durations = allocateDurations(
      transcript.endMs - transcript.startMs,
      pageWeights(pages),
      minimumCueDurationMs,
    );

    let pageStartMs = transcript.startMs;
    pages.forEach((page, pageIndex) => {
      const pageEndMs =
        pageIndex === pages.length - 1
          ? transcript.endMs
          : pageStartMs + durations[pageIndex]!;
      cues.push({
        index: cues.length + 1,
        ...(transcript.id === undefined ? {} : { sourceId: transcript.id }),
        startMs: pageStartMs,
        endMs: pageEndMs,
        text: page.join("\n"),
      });
      pageStartMs = pageEndMs;
    });
    previousEndMs = transcript.endMs;
    hasPreviousTranscript = true;
  }

  return cues;
}

export function renderSrt(cues: readonly SubtitleCue[]): string {
  return cues
    .map((cue, index) => {
      requireTimestamp(cue.startMs, "cue.startMs");
      requireTimestamp(cue.endMs, "cue.endMs");
      if (cue.endMs <= cue.startMs) {
        throw new RangeError("Each subtitle cue must end after it starts");
      }
      return [
        String(index + 1),
        `${formatSrtTimestamp(cue.startMs)} --> ${formatSrtTimestamp(cue.endMs)}`,
        sanitizeText(cue.text),
      ].join("\n");
    })
    .join("\n\n") + (cues.length > 0 ? "\n" : "");
}

export async function writeSrtFile(
  outputPath: string,
  cues: readonly SubtitleCue[],
): Promise<void> {
  await ensurePrivateDirectory(path.dirname(outputPath));
  await writePrivateFile(outputPath, renderSrt(cues), { encoding: "utf8" });
}
