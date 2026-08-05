import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { build } from "esbuild";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const learningSessionId = `sps_${"A".repeat(43)}`;
const reviewCapabilityOne = "B".repeat(43);
const reviewCapabilityTwo = "C".repeat(43);

async function loadParser() {
  const result = await build({
    entryPoints: [join(root, "widget/src/memory-card-practice.ts")],
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node20",
    write: false
  });
  const source = result.outputFiles[0]?.text;
  assert.ok(source);
  return import(`data:text/javascript;base64,${Buffer.from(source).toString("base64")}`);
}

const validMetadata = {
  skillpilotMemoryCard: {
    communicationLocale: "de-DE",
    learningSessionId,
    goalId: " memory-functions ",
    goalTitle: " Lernkarten – Funktionen und Gleichungen ",
    expectedStateVersion: 7,
    progress: { total: 12, due: 4, scheduled: 8 },
    cockpitUrl: "https://skillpilot.com/?goal=memory-functions",
    completed: false,
    cardBatch: {
      cards: [
        {
          id: " card-1 ",
          front: " Was ist eine lineare Funktion? ",
          back: " Eine Funktion der Form f(x) = mx + b. ",
          category: " Funktionen ",
          reviewCapability: reviewCapabilityOne
        },
        {
          id: "card-2",
          front: "Was bezeichnet m?",
          back: "Die Steigung.",
          reviewCapability: reviewCapabilityTwo
        }
      ],
      initialIndex: 1,
      totalDueCards: 4,
      hasMore: true
    }
  }
};

test("private START batch is parsed while structured stateVersion wins", async () => {
  const { memoryCardPracticeFromToolResult } = await loadParser();
  const practice = memoryCardPracticeFromToolResult({
    structuredContent: { stateVersion: 8 },
    _meta: validMetadata
  });

  assert.deepEqual(practice, {
    communicationLocale: "de",
    learningSessionId,
    goalId: "memory-functions",
    goalTitle: "Lernkarten – Funktionen und Gleichungen",
    expectedStateVersion: 8,
    progress: { total: 12, due: 4, scheduled: 8 },
    cockpitUrl: "https://skillpilot.com/?goal=memory-functions",
    completed: false,
    cardBatch: {
      cards: [
        {
          id: "card-1",
          front: "Was ist eine lineare Funktion?",
          back: "Eine Funktion der Form f(x) = mx + b.",
          category: "Funktionen",
          reviewCapability: reviewCapabilityOne
        },
        {
          id: "card-2",
          front: "Was bezeichnet m?",
          back: "Die Steigung.",
          reviewCapability: reviewCapabilityTwo
        }
      ],
      initialIndex: 1,
      totalDueCards: 4,
      hasMore: true
    }
  });
});

test("ChatGPT toolResponseMetadata can be paired with model-visible stateVersion only", async () => {
  const { memoryCardPracticeFromToolResult } = await loadParser();
  const practice = memoryCardPracticeFromToolResult(
    { toolResponseMetadata: { _meta: validMetadata } },
    { stateVersionSource: { stateVersion: 9 } }
  );
  assert.equal(practice.expectedStateVersion, 9);
  assert.equal(practice.cardBatch.cards[0].back, "Eine Funktion der Form f(x) = mx + b.");
});

test("private card contents are never recovered from structuredContent", async () => {
  const { memoryCardPracticeFromToolResult } = await loadParser();
  assert.equal(
    memoryCardPracticeFromToolResult({
      structuredContent: {
        stateVersion: 8,
        skillpilotMemoryCard: validMetadata.skillpilotMemoryCard
      }
    }),
    undefined
  );
});

test("START rejects malformed, duplicate, and inconsistent batches", async () => {
  const { memoryCardPracticeFromToolResult } = await loadParser();
  const parse = (cardBatch) => memoryCardPracticeFromToolResult({
    structuredContent: { stateVersion: 8 },
    _meta: {
      skillpilotMemoryCard: {
        ...validMetadata.skillpilotMemoryCard,
        cardBatch
      }
    }
  });

  assert.equal(parse({
    ...validMetadata.skillpilotMemoryCard.cardBatch,
    cards: [
      validMetadata.skillpilotMemoryCard.cardBatch.cards[0],
      validMetadata.skillpilotMemoryCard.cardBatch.cards[0]
    ]
  }), undefined);
  assert.equal(parse({
    ...validMetadata.skillpilotMemoryCard.cardBatch,
    hasMore: false
  }), undefined);
  assert.equal(parse({
    ...validMetadata.skillpilotMemoryCard.cardBatch,
    totalDueCards: 3
  }), undefined, "hidden progress and batch due count must agree");
});

test("complete START works with an empty batch and unsafe cockpit URLs are omitted", async () => {
  const { memoryCardPracticeFromToolResult } = await loadParser();
  const complete = {
    ...validMetadata.skillpilotMemoryCard,
    progress: { total: 12, due: 0, scheduled: 12 },
    completed: true,
    cardBatch: {
      cards: [],
      initialIndex: 0,
      totalDueCards: 0,
      hasMore: false
    }
  };
  assert.equal(
    memoryCardPracticeFromToolResult({
      structuredContent: { stateVersion: 10 },
      _meta: { skillpilotMemoryCard: complete }
    }).completed,
    true
  );
  const unsafeFallback = memoryCardPracticeFromToolResult({
    structuredContent: { stateVersion: 10 },
    _meta: {
      skillpilotMemoryCard: {
        ...complete,
        cockpitUrl: "https://user:secret@skillpilot.com/"
      }
    }
  });
  assert.equal(unsafeFallback.completed, true);
  assert.equal(unsafeFallback.cockpitUrl, undefined);
});

test("REVIEW receipt succeeds without private metadata and maps public progress names", async () => {
  const { memoryCardReviewReceiptFromToolResult } = await loadParser();
  assert.deepEqual(
    memoryCardReviewReceiptFromToolResult({
      structuredContent: {
        contractMajor: 1,
        stateVersion: 9,
        status: "ready",
        goalId: "memory-functions",
        goalTitle: "Lernkarten – Funktionen und Gleichungen",
        progress: { totalCards: 12, dueCards: 3, scheduledCards: 9 },
        completed: false
      }
    }),
    {
      status: "ready",
      goalId: "memory-functions",
      goalTitle: "Lernkarten – Funktionen und Gleichungen",
      expectedStateVersion: 9,
      progress: { total: 12, due: 3, scheduled: 9 },
      completed: false
    }
  );
});

test("REVIEW receipt requires a fresh structured stateVersion", async () => {
  const { memoryCardReviewReceiptFromToolResult } = await loadParser();
  assert.equal(memoryCardReviewReceiptFromToolResult({
    _meta: validMetadata,
    structuredContent: {
      status: "ready",
      goalId: "memory-functions",
      goalTitle: "Memory",
      progress: { totalCards: 12, dueCards: 3, scheduledCards: 9 },
      completed: false
    }
  }), undefined);
});

test("review and reload arguments retain explicit card, state version, and idempotency", async () => {
  const {
    createMemoryCardReviewArguments,
    createMemoryCardStartArguments,
    memoryCardPracticeFromToolResult
  } = await loadParser();
  const practice = memoryCardPracticeFromToolResult({
    structuredContent: { stateVersion: 8 },
    _meta: validMetadata
  });
  assert.deepEqual(
    createMemoryCardReviewArguments(
      practice,
      practice.cardBatch.cards[1],
      "known",
      " request-1 "
    ),
    {
      learningSessionId,
      goalId: "memory-functions",
      cardId: "card-2",
      reviewCapability: reviewCapabilityTwo,
      rating: "known",
      expectedStateVersion: 8,
      clientRequestId: "request-1"
    }
  );
  assert.deepEqual(createMemoryCardStartArguments(practice), {
    learningSessionId,
    goalId: "memory-functions",
    expectedStateVersion: 8
  });
  assert.equal(
    createMemoryCardReviewArguments(
      practice,
      { id: "foreign", front: "x", back: "y", reviewCapability: "D".repeat(43) },
      "known",
      "request-2"
    ),
    undefined
  );
});

test("submission gate rejects double submit and ignores stale completion", async () => {
  const { MemoryCardSubmissionGate } = await loadParser();
  const gate = new MemoryCardSubmissionGate();
  const first = gate.begin();
  assert.equal(first, 1);
  assert.equal(gate.begin(), undefined);
  assert.equal(gate.isCurrent(first), true);
  gate.finish(99);
  assert.equal(gate.begin(), undefined);
  gate.finish(first);
  const second = gate.begin();
  assert.equal(second, 2);
  assert.equal(gate.isCurrent(first), false);
});
