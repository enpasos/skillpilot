import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { test } from "node:test";

import {
  DEFAULT_AI_VOICE_DISCLOSURE,
} from "../src/narrator.js";
import { AI_VOICE_DISCLOSURE_DE, AI_VOICE_VISUAL_DISCLOSURE_DE } from "../src/policy.js";
import {
  MAX_TTS_INPUT_CHARACTERS,
  synthesizeSpeechSegments,
  type TtsOpenAIClient,
} from "../src/tts.js";

function fakeClient(audio = Buffer.from("RIFF-fake-wav")): {
  client: TtsOpenAIClient;
  requests: Array<Record<string, unknown>>;
} {
  const requests: Array<Record<string, unknown>> = [];
  const client = {
    audio: {
      speech: {
        create: async (request: Record<string, unknown>) => {
          requests.push(request);
          return {
            arrayBuffer: async () =>
              audio.buffer.slice(
                audio.byteOffset,
                audio.byteOffset + audio.byteLength,
              ),
          };
        },
      },
    },
  } as unknown as TtsOpenAIClient;
  return { client, requests };
}

test("synthesizeSpeechSegments creates WAV audio and reuses the content cache", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();
  const options = {
    client,
    cacheDir,
    instructions: "Calm, precise, professional delivery.",
  };

  const first = await synthesizeSpeechSegments(
    [{ id: "opening", text: "Welcome to the product review." }],
    options,
  );
  const second = await synthesizeSpeechSegments(
    [{ id: "opening", text: "Welcome to the product review." }],
    options,
  );

  assert.equal(requests.length, 1);
  assert.deepEqual(requests[0], {
    model: "gpt-4o-mini-tts",
    voice: "cedar",
    input: `${DEFAULT_AI_VOICE_DISCLOSURE} Welcome to the product review.`,
    response_format: "wav",
    speed: 1,
    instructions: "Calm, precise, professional delivery.",
  });
  const firstOpening = first[0];
  const secondOpening = second[0];
  assert.ok(firstOpening);
  assert.ok(secondOpening);
  assert.equal(firstOpening.cached, false);
  assert.equal(secondOpening.cached, true);
  assert.equal(firstOpening.audioPath, secondOpening.audioPath);
  assert.equal(
    (await readFile(firstOpening.audioPath)).toString(),
    "RIFF-fake-wav",
  );
});

test("a complete TTS cache can be reused without constructing an authenticated client", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client } = fakeClient();
  const segments = [{ id: "cached", text: "This segment is already synthesized." }];
  await synthesizeSpeechSegments(segments, { client, cacheDir });

  const previousKey = process.env.OPENAI_API_KEY;
  delete process.env.OPENAI_API_KEY;
  try {
    const result = await synthesizeSpeechSegments(segments, { cacheDir });
    assert.equal(result[0]?.cached, true);
  } finally {
    if (previousKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = previousKey;
  }
});

test("the required AI-voice disclosure is spoken exactly once", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();
  await synthesizeSpeechSegments(
    [{ id: "opening", text: `${DEFAULT_AI_VOICE_DISCLOSURE} Welcome.` }],
    { client, cacheDir },
  );

  assert.equal(requests[0]?.input, `${DEFAULT_AI_VOICE_DISCLOSURE} Welcome.`);
});

test("explicit visual-only sends natural narration unchanged and never reuses spoken-disclosure audio", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-visual-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();
  const segments = [{ id: "intro", text: "Willkommen bei SkillPilot." }];
  const spoken = await synthesizeSpeechSegments(segments, { client, cacheDir, disclosure: AI_VOICE_DISCLOSURE_DE });
  const options = {
    client, cacheDir, disclosure: AI_VOICE_DISCLOSURE_DE,
    disclosureMode: "visual-only" as const, visualDisclosure: AI_VOICE_VISUAL_DISCLOSURE_DE,
  };
  const visual = await synthesizeSpeechSegments(segments, options);
  assert.equal(requests[1]?.input, segments[0]!.text);
  assert.equal(requests[1]?.speed, 1);
  assert.notEqual(spoken[0]?.cacheKey, visual[0]?.cacheKey);
  await assert.rejects(synthesizeSpeechSegments(segments, { client, cacheDir, disclosureMode: "visual-only" }), /exact visualDisclosure/u);
  await assert.rejects(synthesizeSpeechSegments([{ id: "bad", text: `${AI_VOICE_DISCLOSURE_DE} Hallo.` }], options), /must not speak/u);
  assert.equal(requests.length, 2, "invalid disclosure configurations must fail before any provider request");
});

test("TTS cache key changes with voice and instructions", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();
  const segment = [{ id: "one", text: "This video uses an AI-generated voice." }];

  const cedar = await synthesizeSpeechSegments(segment, {
    client,
    cacheDir,
    voice: "cedar",
    instructions: "Neutral.",
  });
  const marin = await synthesizeSpeechSegments(segment, {
    client,
    cacheDir,
    voice: "marin",
    instructions: "Warm.",
  });

  assert.equal(requests.length, 2);
  const cedarSegment = cedar[0];
  const marinSegment = marin[0];
  assert.ok(cedarSegment);
  assert.ok(marinSegment);
  assert.notEqual(cedarSegment.cacheKey, marinSegment.cacheKey);
});

test("German TTS speaks the localized disclosure exactly once without an English prefix", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-de-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();
  await synthesizeSpeechSegments([
    { id: "intro", text: `${AI_VOICE_DISCLOSURE_DE} Willkommen bei SkillPilot.` },
    { id: "continue", text: "Wähle dein Curriculum." },
  ], {
    client, cacheDir, disclosure: AI_VOICE_DISCLOSURE_DE,
    instructions: "Sprich natürliches Deutsch.",
  });
  assert.equal(requests[0]?.input, `${AI_VOICE_DISCLOSURE_DE} Willkommen bei SkillPilot.`);
  assert.equal(requests[1]?.input, "Wähle dein Curriculum.");
  assert.equal(requests[0]?.instructions, "Sprich natürliches Deutsch.");
  assert.doesNotMatch(JSON.stringify(requests), /not a human voice/u);
});

test("TTS validates the documented input length before calling OpenAI", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();

  await assert.rejects(
    synthesizeSpeechSegments(
      [
        {
          id: "too-long",
          text: `${DEFAULT_AI_VOICE_DISCLOSURE} ${"x".repeat(MAX_TTS_INPUT_CHARACTERS + 1)}`,
        },
      ],
      { client, cacheDir },
    ),
    /4096-character TTS input limit/,
  );
  assert.equal(requests.length, 0);
});

test("TTS rejects duplicate IDs without making a network request", async (t) => {
  const cacheDir = await mkdtemp(path.join(tmpdir(), "demo-video-tts-"));
  t.after(() => rm(cacheDir, { recursive: true, force: true }));
  const { client, requests } = fakeClient();

  await assert.rejects(
    synthesizeSpeechSegments(
      [
        { id: "duplicate", text: "First." },
        { id: "duplicate", text: "Second." },
      ],
      { client, cacheDir },
    ),
    /Duplicate speech segment ID/,
  );
  assert.equal(requests.length, 0);
});
