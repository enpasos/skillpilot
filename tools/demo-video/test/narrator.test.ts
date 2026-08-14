import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DEFAULT_AI_VOICE_DISCLOSURE,
  generateNarration,
  selectImageEvidence,
  type NarrationOpenAIClient,
} from "../src/narrator.js";

function clientReturning(output: unknown): {
  client: NarrationOpenAIClient;
  requests: unknown[];
} {
  const requests: unknown[] = [];
  const client = {
    responses: {
      parse: async (request: unknown) => {
        requests.push(request);
        return { output_parsed: output };
      },
    },
  } as unknown as NarrationOpenAIClient;
  return { client, requests };
}

test("generateNarration uses Responses Structured Outputs and materializes anchors", async () => {
  const { client, requests } = clientReturning({
    summary: "A focused product walkthrough.",
    editorialNotes: ["Keep the settings panel visible."],
    segments: [
      {
        id: "intro",
        chapterId: "setup",
        anchorEventId: "open-app",
        title: "Open the application",
        narration: "SkillPilot opens on the learner dashboard.",
        subtitle: "SkillPilot opens on the learner dashboard.",
      },
    ],
  });

  const result = await generateNarration(
    {
      title: "SkillPilot review demo",
      objective: "Demonstrate the reviewed workflow.",
      chapters: [{ id: "setup", title: "Setup" }],
      timeline: [
        {
          id: "open-app",
          chapterId: "setup",
          atMs: 1250,
          action: "goto",
          outcome: "Dashboard visible",
        },
      ],
      evidence: [
        {
          id: "dashboard",
          imageDataUrl: "data:image/png;base64,AA==",
        },
      ],
    },
    { client },
  );

  assert.equal(requests.length, 1);
  const request = requests[0] as {
    model: string;
    text: { format: unknown };
    input: Array<{ role: string; content: unknown }>;
  };
  assert.equal(request.model, "gpt-5.6");
  assert.ok(request.text.format);
  const userMessage = request.input[1];
  assert.ok(userMessage);
  assert.equal(userMessage.role, "user");
  const opening = result.segments[0];
  assert.ok(opening);
  assert.equal(opening.anchorMs, 1250);
  assert.match(opening.narration, /AI-generated and is not a human voice/i);
  assert.equal(result.disclosure, DEFAULT_AI_VOICE_DISCLOSURE);
});

test("generateNarration removes configured sensitive values before the API request", async () => {
  const secret = "sps_permanent-secret";
  const { client, requests } = clientReturning({
    summary: "Safe summary.",
    editorialNotes: [],
    segments: [
      {
        id: "safe",
        chapterId: "one",
        anchorEventId: "event-one",
        title: "Safe",
        narration: "A redacted identifier is accepted.",
        subtitle: "A redacted identifier is accepted.",
      },
    ],
  });

  await generateNarration(
    {
      title: "Privacy demo",
      objective: "Keep identifiers private.",
      timeline: [
        {
          id: "event-one",
          chapterId: "one",
          atMs: 0,
          action: "fill",
          visibleText: secret,
        },
      ],
    },
    { client, sensitiveValues: [secret] },
  );

  assert.doesNotMatch(JSON.stringify(requests[0]), new RegExp(secret));
  assert.match(JSON.stringify(requests[0]), /\[REDACTED\]/);
});

test("generateNarration rejects an unknown timeline anchor", async () => {
  const { client } = clientReturning({
    summary: "Summary.",
    editorialNotes: [],
    segments: [
      {
        id: "invalid",
        chapterId: "one",
        anchorEventId: "missing",
        title: "Invalid",
        narration: "This anchor does not exist.",
        subtitle: "This anchor does not exist.",
      },
    ],
  });

  await assert.rejects(
    generateNarration(
      {
        title: "Demo",
        objective: "Test validation.",
        timeline: [
          { id: "known", chapterId: "one", atMs: 0, action: "goto" },
        ],
      },
      { client },
    ),
    /unknown event missing/,
  );
});

test("generateNarration reports a refused or incomplete response", async () => {
  const { client } = clientReturning(null);
  await assert.rejects(
    generateNarration(
      {
        title: "Demo",
        objective: "Test response handling.",
        timeline: [
          { id: "known", chapterId: "one", atMs: 0, action: "goto" },
        ],
      },
      { client },
    ),
    /no parsed narration/i,
  );
});

test("generateNarration fails closed when a required chapter has no voice-over", async () => {
  const { client } = clientReturning({
    summary: "Incomplete.",
    editorialNotes: [],
    segments: [{
      id: "only-one",
      chapterId: "one",
      anchorEventId: "event-one",
      title: "One",
      narration: "Only the first case is described.",
      subtitle: "Only the first case is described.",
    }],
  });
  await assert.rejects(generateNarration({
    title: "Review",
    objective: "Cover every case.",
    chapters: [{ id: "one", title: "One" }, { id: "two", title: "Two" }],
    timeline: [
      { id: "event-one", chapterId: "one", atMs: 0, action: "goto" },
      { id: "event-two", chapterId: "two", atMs: 1_000, action: "assert" },
    ],
  }, { client }), /omits required chapters: two/u);
});

test("image evidence selection represents every chapter before adding extras", () => {
  const selected = selectImageEvidence([
    { id: "p1-a", chapterId: "p1", imagePath: "p1-a.png" },
    { id: "p1-b", chapterId: "p1", imagePath: "p1-b.png" },
    { id: "p2-a", chapterId: "p2", imagePath: "p2-a.png" },
    { id: "p3-a", chapterId: "p3", imagePath: "p3-a.png" },
  ], 3);

  assert.deepEqual(selected.map((item) => item.id), ["p1-b", "p2-a", "p3-a"]);
});
