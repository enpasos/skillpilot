import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { assertPrivateInputFile } from "./private-fs.js";

export const DEFAULT_GEMINI_TTS_MODEL = "gemini-3.1-flash-tts-preview";
export const DEFAULT_GEMINI_TTS_VOICE = "Sulafat";
const GEMINI_TTS_MODELS = new Set([
  DEFAULT_GEMINI_TTS_MODEL,
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
]);

type JsonRecord = Record<string, unknown>;
const record = (value: unknown): JsonRecord | undefined => (
  value !== null && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : undefined
);

/** Key values never leave this module through logs, errors or process arguments. */
export async function loadQuickstartGeminiApiKey(
  repoRoot: string,
  secretsPath?: string,
  environment: NodeJS.ProcessEnv = process.env,
): Promise<string> {
  if (secretsPath) {
    await assertPrivateInputFile(secretsPath, "Quickstart Gemini secrets file");
    let content: unknown;
    try { content = JSON.parse(await readFile(secretsPath, "utf8")); }
    catch { throw new Error("Quickstart Gemini secrets file is not valid JSON"); }
    const data = record(content);
    if (data?.schemaVersion !== 1 || typeof data.geminiApiKey !== "string" || !data.geminiApiKey.trim()) {
      throw new Error("Quickstart Gemini secrets require schemaVersion 1 and a nonempty geminiApiKey");
    }
    return data.geminiApiKey.trim();
  }
  for (const name of ["GEMINI_API_KEY", "GOOGLE_API_KEY"] as const) {
    if (environment[name]?.trim()) return environment[name]!.trim();
    for (const path of [join(repoRoot, ".env.local"), join(repoRoot, "app", ".env.local")]) {
      const content = await readFile(path, "utf8").catch((error: NodeJS.ErrnoException) => {
        if (error.code === "ENOENT") return "";
        throw new Error("Quickstart Gemini local configuration cannot be read");
      });
      for (const line of content.split(/\r?\n/u)) {
        const match = line.trim().match(/^(GEMINI_API_KEY|GOOGLE_API_KEY)\s*=\s*(.*)$/u);
        if (match?.[1] !== name) continue;
        const value = match[2]!.trim().replace(/^(['"])(.*)\1$/u, "$2");
        if (value) return value;
      }
    }
  }
  throw new Error("Quickstart Gemini TTS needs GEMINI_API_KEY, GOOGLE_API_KEY, or a private geminiApiKey secrets file");
}

export interface GeminiSpeechRequest {
  model: string;
  input: string;
  voice: string | { id: string };
  response_format?: string;
  instructions?: string;
  speed?: number;
}

/** Gemini returns little-endian mono PCM; only a WAV header is added, never a tempo filter. */
export function geminiPcmToWave(pcm: Uint8Array): Buffer {
  if (pcm.byteLength === 0 || pcm.byteLength % 2 !== 0 || pcm.byteLength > 0xffffffff - 36) {
    throw new Error("Gemini returned invalid 16-bit PCM audio");
  }
  const header = Buffer.alloc(44);
  header.write("RIFF", 0);
  header.writeUInt32LE(36 + pcm.byteLength, 4);
  header.write("WAVEfmt ", 8);
  header.writeUInt32LE(16, 16);
  header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22);
  header.writeUInt32LE(24000, 24);
  header.writeUInt32LE(48000, 28);
  header.writeUInt16LE(2, 32);
  header.writeUInt16LE(16, 34);
  header.write("data", 36);
  header.writeUInt32LE(pcm.byteLength, 40);
  return Buffer.concat([header, pcm]);
}

function isSupportedPcmMime(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const [type, ...parameters] = value.toLowerCase().split(";").map((part) => part.trim());
  if (type !== "audio/l16") return false;
  const values = new Map<string, string>();
  for (const parameter of parameters) {
    const match = parameter.match(/^(rate|channels|codec)=([a-z0-9]+)$/u);
    if (!match || values.has(match[1]!)) return false;
    values.set(match[1]!, match[2]!);
  }
  return values.get("rate") === "24000" && (!values.has("channels") || values.get("channels") === "1")
    && (!values.has("codec") || values.get("codec") === "pcm");
}

/**
 * Explicit Gemini adapter for the pipeline's small audio.speech.create boundary.
 * No OpenAI endpoint is used. The actual Gemini model and voice remain in the
 * shared cache descriptor and provenance. Only public scripted narration is sent.
 * API/voices: https://ai.google.dev/gemini-api/docs/speech-generation
 * REST schema: https://ai.google.dev/api/generate-content
 */
export class GeminiSpeechClient {
  readonly audio = { speech: { create: (request: GeminiSpeechRequest) => this.#create(request) } };

  constructor(private readonly apiKey: string, private readonly fetchImpl: typeof fetch = fetch) {
    if (!apiKey.trim()) throw new Error("Gemini TTS API key must not be empty");
  }

  async #create(request: GeminiSpeechRequest): Promise<Response> {
    if (!GEMINI_TTS_MODELS.has(request.model) || request.response_format !== "wav"
      || (request.speed ?? 1) !== 1 || typeof request.voice !== "string" || !request.voice.trim()
      || !request.input.trim()) {
      throw new Error("Gemini TTS needs a supported speech model, voice, nonempty text, WAV output and natural speed 1");
    }
    const prompt = [
      "Read only the exact transcript below. Do not speak the direction headings or add any words.",
      request.instructions?.trim() ? `# DIRECTOR'S NOTES\n${request.instructions.trim()}` : "",
      `# TRANSCRIPT\n${request.input}`,
    ].filter(Boolean).join("\n\n");
    let response: Response;
    try {
      response = await this.fetchImpl(`https://generativelanguage.googleapis.com/v1beta/models/${request.model}:generateContent`, {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(180_000),
        headers: { "content-type": "application/json", "x-goog-api-key": this.apiKey },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["AUDIO"],
            speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: request.voice } } },
          },
        }),
      });
    } catch { throw new Error("Gemini TTS network request failed or timed out"); }
    if (!response.ok) throw new Error(`Gemini TTS request failed with HTTP ${response.status}`);
    let body: JsonRecord | undefined;
    try { body = record(await response.json()); }
    catch { throw new Error("Gemini TTS returned invalid JSON"); }
    const candidates = body?.candidates;
    const candidate = Array.isArray(candidates) && candidates.length === 1 ? record(candidates[0]) : undefined;
    if (candidate?.finishReason !== "STOP") throw new Error("Gemini TTS did not return a complete audio response");
    const parts = record(candidate.content)?.parts;
    const chunks: Buffer[] = [];
    for (const part of Array.isArray(parts) ? parts : []) {
      const data = record(record(part)?.inlineData);
      if (!data) continue;
      const mime = data.mimeType;
      if (!isSupportedPcmMime(mime)
        || typeof data.data !== "string" || !data.data || data.data.length % 4 !== 0
        || !/^[A-Za-z0-9+/]*={0,2}$/u.test(data.data)) {
        throw new Error("Gemini TTS returned an unsupported or malformed audio payload");
      }
      chunks.push(Buffer.from(data.data, "base64"));
    }
    const wav = geminiPcmToWave(Buffer.concat(chunks));
    return new Response(new Uint8Array(wav), { headers: { "content-type": "audio/wav" } });
  }
}
