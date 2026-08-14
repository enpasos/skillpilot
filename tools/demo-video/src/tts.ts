import { createHash } from "node:crypto";
import { open, rename, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";

import { DEFAULT_AI_VOICE_DISCLOSURE } from "./narrator.js";
import { ensurePrivateDirectory, ensurePrivateFile } from "./private-fs.js";

export const DEFAULT_TTS_MODEL = "gpt-4o-mini-tts";
export const DEFAULT_TTS_VOICE = "cedar";
export const MAX_TTS_INPUT_CHARACTERS = 4096;

export interface SpeechSegment {
  id: string;
  text: string;
  chapterId?: string;
  anchorMs?: number;
}

export interface SynthesizedSpeechSegment extends SpeechSegment {
  audioPath: string;
  cacheKey: string;
  cached: boolean;
  model: string;
  voice: string;
  format: "wav";
}

export type TtsOpenAIClient = Pick<OpenAI, "audio">;

export interface SynthesizeSpeechOptions {
  client?: TtsOpenAIClient;
  cacheDir: string;
  model?: string;
  voice?: string;
  instructions?: string;
  speed?: number;
  disclosure?: string;
  refreshCache?: boolean;
}

export interface TtsCacheDescriptor {
  version: 1;
  input: string;
  model: string;
  voice: string;
  instructions: string;
  speed: number;
  responseFormat: "wav";
}

export async function synthesizeSpeechSegments(
  segments: SpeechSegment[],
  options: SynthesizeSpeechOptions,
): Promise<SynthesizedSpeechSegment[]> {
  if (segments.length === 0) {
    throw new Error("TTS requires at least one speech segment");
  }

  const model = normalizeNonEmpty(options.model ?? DEFAULT_TTS_MODEL, "TTS model");
  const voice = normalizeNonEmpty(options.voice ?? DEFAULT_TTS_VOICE, "TTS voice");
  const instructions = (options.instructions ?? "").trim();
  const speed = options.speed ?? 1;
  if (!Number.isFinite(speed) || speed < 0.25 || speed > 4) {
    throw new Error("TTS speed must be between 0.25 and 4");
  }

  const prepared = prepareSpeechSegments(
    segments,
    options.disclosure ?? DEFAULT_AI_VOICE_DISCLOSURE,
  );
  validateSpeechSegments(prepared);
  await ensurePrivateDirectory(options.cacheDir);

  let client = options.client;
  const output: SynthesizedSpeechSegment[] = [];
  for (const segment of prepared) {
    const descriptor: TtsCacheDescriptor = {
      version: 1,
      input: segment.text,
      model,
      voice,
      instructions,
      speed,
      responseFormat: "wav",
    };
    const cacheKey = ttsCacheKey(descriptor);
    const audioPath = path.join(options.cacheDir, `${cacheKey}.wav`);
    const cached =
      !options.refreshCache && (await isUsableCacheFile(audioPath));

    if (!cached) {
      client ??= new OpenAI();
      const response = await client.audio.speech.create({
        model,
        voice,
        input: segment.text,
        response_format: "wav",
        speed,
        ...(instructions ? { instructions } : {}),
      });
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.length === 0) {
        throw new Error(`OpenAI returned empty audio for segment ${segment.id}`);
      }
      await atomicWrite(audioPath, bytes);
    }
    await ensurePrivateFile(audioPath);

    output.push({
      ...segment,
      audioPath,
      cacheKey,
      cached,
      model,
      voice,
      format: "wav",
    });
  }
  return output;
}

export function prepareSpeechSegments(
  segments: SpeechSegment[],
  disclosure = DEFAULT_AI_VOICE_DISCLOSURE,
): SpeechSegment[] {
  const copies = segments.map((segment) => ({ ...segment }));
  const normalizedDisclosure = normalizeNonEmpty(disclosure, "AI voice disclosure");
  const first = copies[0];
  if (!first) {
    throw new Error("Cannot add an AI voice disclosure to an empty speech plan");
  }
  if (first.text.toLocaleLowerCase("en-US").includes(normalizedDisclosure.toLocaleLowerCase("en-US"))) {
    return copies;
  }
  first.text = `${normalizedDisclosure} ${first.text}`.trim();
  return copies;
}

export function ttsCacheKey(descriptor: TtsCacheDescriptor): string {
  return createHash("sha256")
    .update(stableTtsDescriptor(descriptor), "utf8")
    .digest("hex");
}

function validateSpeechSegments(segments: SpeechSegment[]): void {
  const ids = new Set<string>();
  for (const segment of segments) {
    normalizeNonEmpty(segment.id, "Speech segment ID");
    const text = normalizeNonEmpty(segment.text, `Text for speech segment ${segment.id}`);
    if (ids.has(segment.id)) {
      throw new Error(`Duplicate speech segment ID: ${segment.id}`);
    }
    ids.add(segment.id);
    if (text.length > MAX_TTS_INPUT_CHARACTERS) {
      throw new Error(
        `Speech segment ${segment.id} exceeds the ${MAX_TTS_INPUT_CHARACTERS}-character TTS input limit`,
      );
    }
  }
}

function stableTtsDescriptor(descriptor: TtsCacheDescriptor): string {
  return JSON.stringify({
    version: descriptor.version,
    input: descriptor.input,
    model: descriptor.model,
    voice: descriptor.voice,
    instructions: descriptor.instructions,
    speed: descriptor.speed,
    responseFormat: descriptor.responseFormat,
  });
}

async function isUsableCacheFile(filePath: string): Promise<boolean> {
  try {
    const metadata = await stat(filePath);
    if (!metadata.isFile() || metadata.size === 0) return false;
    // Read one byte so an unreadable cache entry is regenerated here rather
    // than failing later inside FFmpeg.
    const handle = await open(filePath, "r");
    try {
      await handle.read(Buffer.allocUnsafe(1), 0, 1, 0);
    } finally {
      await handle.close();
    }
    return true;
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return false;
    throw error;
  }
}

async function atomicWrite(filePath: string, bytes: Buffer): Promise<void> {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
  try {
    await writeFile(temporaryPath, bytes, { flag: "wx", mode: 0o600 });
    try {
      await rename(temporaryPath, filePath);
    } catch (error) {
      const code = (error as NodeJS.ErrnoException).code;
      if (process.platform !== "win32" || (code !== "EEXIST" && code !== "EPERM")) throw error;
      // Windows does not replace an existing destination atomically. The
      // cache filename is content-addressed, so replacing this exact path is
      // safe when a forced refresh or corrupt-cache repair is requested.
      await unlink(filePath).catch((unlinkError: NodeJS.ErrnoException) => {
        if (unlinkError.code !== "ENOENT") throw unlinkError;
      });
      await rename(temporaryPath, filePath);
    }
  } catch (error) {
    await unlink(temporaryPath).catch(() => undefined);
    throw error;
  }
}

function normalizeNonEmpty(value: string, label: string): string {
  const normalized = value.trim();
  if (!normalized) {
    throw new Error(`${label} must not be empty`);
  }
  return normalized;
}
