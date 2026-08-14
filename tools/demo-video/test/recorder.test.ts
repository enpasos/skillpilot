import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page, Video } from "playwright";

import { finalizeRecordingSession } from "../src/recorder.js";

test("saves a completed page video before disconnecting the browser session", async () => {
  const calls: string[] = [];
  const page = {
    close: async () => { calls.push("page.close"); },
  } as Pick<Page, "close">;
  const video = {
    saveAs: async (path: string) => { calls.push(`video.saveAs:${path}`); },
    delete: async () => { calls.push("video.delete"); },
  } as Pick<Video, "saveAs" | "delete">;
  const session = {
    close: async () => { calls.push("session.close"); },
  };

  await finalizeRecordingSession(page, video, "/private/recording.webm", session);

  assert.deepEqual(calls, [
    "page.close",
    "video.saveAs:/private/recording.webm",
    "video.delete",
    "session.close",
  ]);
});
