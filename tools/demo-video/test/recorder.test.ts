import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page, Video } from "playwright";

import { assertPreparedPromptContent, finalizeRecordingSession } from "../src/recorder.js";

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

test("accepts only the exact first-party URL prompt with one 43-character session ID", () => {
  const sessionId = `sps_${"A".repeat(43)}`;
  const expected = `Verwende SkillPilot Coach v1 und fahre fort.\nlearningSessionId:\n${sessionId}`;

  assert.doesNotThrow(() => assertPreparedPromptContent(expected, expected));
  assert.doesNotThrow(() => assertPreparedPromptContent(expected, expected.replaceAll("\n", "  ")));
  assert.doesNotThrow(() => assertPreparedPromptContent(expected, `\u200B${expected}\uFFFC`));
  assert.throws(
    () => assertPreparedPromptContent(expected, `${expected}c`),
    /exact first-party 43-character learning session ID/u,
  );
  assert.throws(
    () => assertPreparedPromptContent(expected, expected.replace("A".repeat(43), `${"A".repeat(20)}\u200B${"A".repeat(23)}`)),
    /exact first-party 43-character learning session ID/u,
  );
  assert.throws(
    () => assertPreparedPromptContent(expected, `${expected} SkillPilot Coach v1`),
    /prepared ChatGPT message changed/u,
  );
});
