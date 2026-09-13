import assert from "node:assert/strict";
import { mkdtemp, mkdir, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import {
  DEFAULT_GEMINI_TTS_MODEL, GeminiSpeechClient, geminiPcmToWave, loadQuickstartGeminiApiKey,
} from "../src/gemini-tts.js";

const request = { model: DEFAULT_GEMINI_TTS_MODEL, voice: "Sulafat", input: "Lerne in deinem Tempo.", response_format: "wav", speed: 1 };
const pcm = Buffer.from([0, 1, 2, 3]);
const payload = (options: { finishReason?: string; data?: string; mimeType?: string } = {}) => ({
  candidates: [{ finishReason: options.finishReason ?? "STOP", content: { parts: [{ inlineData: {
    data: options.data ?? pcm.toString("base64"), mimeType: options.mimeType ?? "audio/L16;codec=pcm;rate=24000",
  } }] } }],
});

test("Gemini adapter preserves public narration and natural PCM in WAV without exposing credentials", async () => {
  let requests = 0;
  const client = new GeminiSpeechClient("private-key", (async (url, init) => {
    requests += 1;
    assert.equal(String(url), `https://generativelanguage.googleapis.com/v1beta/models/${DEFAULT_GEMINI_TTS_MODEL}:generateContent`);
    assert.doesNotMatch(String(url), /private-key/u);
    assert.equal(new Headers(init?.headers).get("x-goog-api-key"), "private-key");
    assert.equal(init?.redirect, "error");
    const body = JSON.parse(String(init?.body));
    assert.deepEqual(body.generationConfig, {
      responseModalities: ["AUDIO"], speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Sulafat" } } },
    });
    assert.match(body.contents[0].parts[0].text, /Ruhig und natürlich/u);
    assert.ok(body.contents[0].parts[0].text.endsWith(request.input));
    return Response.json(payload());
  }) as typeof fetch);
  const response = await client.audio.speech.create({ ...request, instructions: "Ruhig und natürlich." });
  const wav = Buffer.from(await response.arrayBuffer());
  assert.equal(requests, 1);
  assert.equal(wav.toString("ascii", 0, 4), "RIFF");
  assert.equal(wav.readUInt32LE(24), 24000);
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt16LE(34), 16);
  assert.deepEqual(wav.subarray(44), pcm);
});

test("Gemini fails closed for incomplete, malformed or incompatible audio", async () => {
  for (const value of [payload({ finishReason: "MAX_TOKENS" }), payload({ mimeType: "audio/mp3" }),
    payload({ mimeType: "audio/l16; rate=48000; channels=1" }), payload({ mimeType: "audio/l16; rate=24000; channels=2" }),
    payload({ data: "!!!!!" }), { candidates: [] }]) {
    const client = new GeminiSpeechClient("private-key", (async () => Response.json(value)) as typeof fetch);
    await assert.rejects(client.audio.speech.create(request), /Gemini/u);
  }
  assert.throws(() => geminiPcmToWave(Buffer.alloc(0)), /invalid/u);
  assert.throws(() => geminiPcmToWave(Buffer.alloc(3)), /invalid/u);
});

test("Gemini supports the current 3.1 mono PCM MIME shape without a codec parameter", async () => {
  const client = new GeminiSpeechClient("private-key", (async () => Response.json(payload({ mimeType: "audio/l16; rate=24000; channels=1" }))) as typeof fetch);
  const result = Buffer.from(await (await client.audio.speech.create(request)).arrayBuffer());
  assert.deepEqual(result.subarray(44), pcm);
});

test("Gemini refuses acceleration and unknown models before any API call", async () => {
  const client = new GeminiSpeechClient("private-key", (async () => { assert.fail("Unexpected API call"); }) as typeof fetch);
  await assert.rejects(client.audio.speech.create({ ...request, speed: 1.2 }), /natural speed 1/u);
  await assert.rejects(client.audio.speech.create({ ...request, model: "gpt-4o-mini-tts" }), /supported speech model/u);
});

test("Gemini errors do not echo request data, key or provider error bodies", async () => {
  for (const fetchImpl of [
    (async () => { throw new Error("private-key and sensitive request"); }) as typeof fetch,
    (async () => new Response("private-key and sensitive request", { status: 403 })) as typeof fetch,
  ]) {
    const client = new GeminiSpeechClient("private-key", fetchImpl);
    await assert.rejects(client.audio.speech.create(request), (error: Error) => {
      assert.doesNotMatch(error.message, /private-key|sensitive request/u);
      return true;
    });
  }
});

test("Gemini key lookup is scoped to known local config and explicit private JSON", async (t) => {
  const root = await mkdtemp(join(tmpdir(), "quickstart-gemini-key-"));
  t.after(() => rm(root, { recursive: true, force: true }));
  await mkdir(join(root, "app"));
  await writeFile(join(root, "app", ".env.local"), 'UNRELATED=ignore\nGEMINI_API_KEY="local-key"\n');
  assert.equal(await loadQuickstartGeminiApiKey(root, undefined, {}), "local-key");
  assert.equal(await loadQuickstartGeminiApiKey(root, undefined, { GEMINI_API_KEY: " env-key " }), "env-key");
  const secrets = join(root, "secrets.json");
  await writeFile(secrets, JSON.stringify({ schemaVersion: 1, geminiApiKey: "json-key", openAiApiKey: "ignored" }), { mode: 0o600 });
  assert.equal(await loadQuickstartGeminiApiKey(root, secrets, { GEMINI_API_KEY: "env-key" }), "json-key");
  await writeFile(secrets, JSON.stringify({ schemaVersion: 1, openAiApiKey: "not-a-gemini-key" }));
  await assert.rejects(loadQuickstartGeminiApiKey(root, secrets, {}), /geminiApiKey/u);
});
