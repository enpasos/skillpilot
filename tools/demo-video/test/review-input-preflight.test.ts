import assert from "node:assert/strict";
import { chmod, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  validateNativeClipMedia,
  validatePlaywrightStorageState,
} from "../src/review-input-preflight.js";
import { runProcess } from "../src/process.js";

const validCookie = {
  name: "__Secure-next-auth.session-token",
  value: "opaque-private-session-material",
  domain: ".chatgpt.com",
  path: "/",
  expires: 2_000_000_000,
  httpOnly: true,
  secure: true,
  sameSite: "Lax",
} as const;

const validOrigin = {
  origin: "https://chatgpt.com",
  localStorage: [{ name: "oai/apps/review", value: "configured" }],
};

test("validates a private Playwright state with current ChatGPT authentication material", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-storage-preflight-"));
  try {
    const statePath = join(directory, "storage.json");
    await writeFile(
      statePath,
      JSON.stringify({ cookies: [validCookie], origins: [validOrigin] }),
      { mode: 0o600 },
    );
    const result = await validatePlaywrightStorageState(statePath, { nowMs: 1_900_000_000_000 });
    assert.deepEqual(result, {
      cookieCount: 1,
      originCount: 1,
      expectedOrigin: "https://chatgpt.com",
      authenticationMaterial: "secure-http-only-cookie",
    });
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects empty, malformed, wrong-origin, and implausibly unauthenticated storage states", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-storage-preflight-"));
  try {
    const statePath = join(directory, "storage.json");
    await writeFile(statePath, "", { mode: 0o600 });
    await assert.rejects(validatePlaywrightStorageState(statePath), /must be non-empty/u);

    await writeFile(statePath, "not-json", { mode: 0o600 });
    await assert.rejects(validatePlaywrightStorageState(statePath), /not valid JSON/u);

    await writeFile(
      statePath,
      JSON.stringify({ cookies: [validCookie], origins: [] }),
      { mode: 0o600 },
    );
    await assert.rejects(validatePlaywrightStorageState(statePath), /expected origin https:\/\/chatgpt\.com/u);

    await writeFile(
      statePath,
      JSON.stringify({
        cookies: [{ ...validCookie, name: "analytics", httpOnly: false }],
        origins: [validOrigin],
      }),
      { mode: 0o600 },
    );
    await assert.rejects(validatePlaywrightStorageState(statePath), /no current secure private authentication cookie/u);

    await writeFile(
      statePath,
      JSON.stringify({
        cookies: [{ ...validCookie, expires: 1_800_000_000 }],
        origins: [validOrigin],
      }),
      { mode: 0o600 },
    );
    await assert.rejects(
      validatePlaywrightStorageState(statePath, { nowMs: 1_900_000_000_000 }),
      /no current secure private authentication cookie/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("rejects SkillPilot and other non-provider browser state fail closed", async () => {
  const directory = await mkdtemp(join(tmpdir(), "demo-video-storage-preflight-"));
  try {
    const statePath = join(directory, "storage.json");
    await writeFile(
      statePath,
      JSON.stringify({
        cookies: [
          validCookie,
          { ...validCookie, name: "skillpilot-session", domain: ".skillpilot.com" },
        ],
        origins: [validOrigin],
      }),
      { mode: 0o600 },
    );
    await assert.rejects(
      validatePlaywrightStorageState(statePath),
      /must not contain SkillPilot cookies or browser storage/u,
    );

    await writeFile(
      statePath,
      JSON.stringify({
        cookies: [validCookie],
        origins: [
          validOrigin,
          { origin: "https://skillpilot.com", localStorage: [{ name: "skillpilotId", value: "private" }] },
        ],
      }),
      { mode: 0o600 },
    );
    await assert.rejects(
      validatePlaywrightStorageState(statePath),
      /must not contain SkillPilot cookies or browser storage/u,
    );

    await writeFile(
      statePath,
      JSON.stringify({
        cookies: [validCookie],
        origins: [validOrigin, { origin: "https://example.com", localStorage: [] }],
      }),
      { mode: 0o600 },
    );
    await assert.rejects(
      validatePlaywrightStorageState(statePath),
      /browser storage outside the ChatGPT\/OpenAI allowlist/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

async function hasFfmpegAndFfprobe(): Promise<boolean> {
  try {
    await Promise.all([
      runProcess("ffmpeg", ["-version"]),
      runProcess("ffprobe", ["-version"]),
    ]);
    return true;
  } catch {
    return false;
  }
}

test("probes native video, duration, and preserved-audio requirements before review fixtures", async (t) => {
  if (!(await hasFfmpegAndFfprobe())) {
    t.skip("ffmpeg and ffprobe are not installed");
    return;
  }
  const directory = await mkdtemp(join(tmpdir(), "demo-video-native-preflight-"));
  try {
    const videoOnly = join(directory, "video-only.mkv");
    const withAudio = join(directory, "with-audio.mkv");
    const audioOnly = join(directory, "audio-only.wav");
    const empty = join(directory, "empty.mp4");
    await runProcess("ffmpeg", [
      "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "color=c=0x203050:s=320x180:r=25:d=0.4",
      "-an", "-c:v", "ffv1", videoOnly,
    ]);
    await runProcess("ffmpeg", [
      "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "color=c=0x405020:s=320x180:r=25:d=0.4",
      "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=0.4",
      "-shortest", "-c:v", "ffv1", "-c:a", "pcm_s16le", withAudio,
    ]);
    await runProcess("ffmpeg", [
      "-y", "-nostdin", "-hide_banner", "-loglevel", "error",
      "-f", "lavfi", "-i", "sine=frequency=440:sample_rate=48000:duration=0.4",
      "-c:a", "pcm_s16le", audioOnly,
    ]);
    await writeFile(empty, "", { mode: 0o600 });
    await Promise.all([
      chmod(videoOnly, 0o600),
      chmod(withAudio, 0o600),
      chmod(audioOnly, 0o600),
    ]);

    const [muted, preserved] = await validateNativeClipMedia([
      { id: "ios", filePath: videoOnly, audioPolicy: "mute" },
      { id: "android", filePath: withAudio, audioPolicy: "preserve" },
    ]);
    assert.ok((muted?.durationMs ?? 0) >= 400);
    assert.equal(muted?.hasAudio, false);
    assert.ok((preserved?.durationMs ?? 0) >= 400);
    assert.equal(preserved?.hasAudio, true);

    await assert.rejects(
      validateNativeClipMedia([{ id: "ios", filePath: videoOnly, audioPolicy: "preserve" }]),
      /requests preserved audio but has no audio stream/u,
    );
    await assert.rejects(
      validateNativeClipMedia([{ id: "ios", filePath: audioOnly, audioPolicy: "preserve" }]),
      /has no video stream/u,
    );
    await assert.rejects(
      validateNativeClipMedia([{ id: "ios", filePath: videoOnly, audioPolicy: "mute" }], {
        maxDurationMs: 250,
      }),
      /exceeds the maximum reviewed duration/u,
    );
    await assert.rejects(
      validateNativeClipMedia([{ id: "ios", filePath: empty, audioPolicy: "mute" }]),
      /is not a readable media file/u,
    );
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
