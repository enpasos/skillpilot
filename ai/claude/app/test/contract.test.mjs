import assert from "node:assert/strict";
import test from "node:test";

import {
  goalVisualizationFromStructuredContent,
  retainGoalVisualization
} from "../src/goal-visualization.js";
import {
  MemoryCardSubmissionGate,
  createMemoryCardReviewArguments,
  createMemoryCardStartArguments,
  memoryCardPracticeFromToolResult,
  memoryCardReviewReceiptFromToolResult
} from "../src/memory-card-practice.js";

const CAPABILITY = "A".repeat(640);
const LEARNING_SESSION = `spc_${"S".repeat(43)}`;

test("goal visualization accepts only bounded SkillPilot HTTPS URLs", () => {
  const valid = goalVisualizationFromStructuredContent({
    goalVisualization: {
      goalId: "GOAL_1",
      title: "Lineare Funktionen darstellen",
      description: "Eine hilfreiche Übersicht.",
      imageUrl: "https://skillpilot.com/api/goal-image/GOAL_1",
      altText: "Koordinatensystem mit einer linearen Funktion",
      cockpitUrl: "https://skillpilot.com/cockpit"
    }
  });
  assert.equal(valid?.goalId, "GOAL_1");
  assert.equal(valid?.imageUrl, "https://skillpilot.com/api/goal-image/GOAL_1");

  for (const imageUrl of [
    "http://skillpilot.com/image.png",
    "https://skillpilot.com.attacker.invalid/image.png",
    "https://user:secret@skillpilot.com/image.png",
    "data:image/png;base64,AAAA"
  ]) {
    assert.equal(goalVisualizationFromStructuredContent({
      goalVisualization: { ...valid, imageUrl }
    }), undefined);
  }
  assert.equal(retainGoalVisualization(valid, { goalVisualization: { title: "partial" } }), valid);
});

test("private cards are parsed only from result _meta", () => {
  const privateProjection = projection();
  assert.deepEqual(Object.keys(privateProjection.cardBatch).sort(), ["cards", "totalDueCards"]);
  const fromMetadata = memoryCardPracticeFromToolResult({
    structuredContent: {
      status: "ready",
      stateVersion: 8,
      progress: { dueCards: 2, scheduledCards: 4, totalCards: 8 }
    },
    _meta: { skillpilotMemoryCard: privateProjection }
  });
  assert.equal(fromMetadata?.expectedStateVersion, 8);
  assert.equal(fromMetadata?.cardBatch.cards[0].front, "Was ist 2 + 2?");
  assert.equal(fromMetadata?.cardBatch.hasMore, false);
  assert.equal(fromMetadata?.learningSessionId, LEARNING_SESSION);

  assert.equal(memoryCardPracticeFromToolResult({
    structuredContent: {
      stateVersion: 8,
      skillpilotMemoryCard: privateProjection
    }
  }), undefined);
  assert.equal(memoryCardPracticeFromToolResult({
    result: {
      structuredContent: {
        stateVersion: 8,
        skillpilotMemoryCard: privateProjection
      }
    }
  }), undefined);
});

test("additional batches are derived from the two-field private batch shape", () => {
  const next = projection();
  next.progress.due = 3;
  next.cardBatch.totalDueCards = 3;
  const practice = memoryCardPracticeFromToolResult(toolResult(next));
  assert.equal(practice?.cardBatch.cards.length, 2);
  assert.equal(practice?.cardBatch.hasMore, true);
});

test("Claude review capabilities are bounded opaque base64url tokens", () => {
  assert.ok(memoryCardPracticeFromToolResult(toolResult(projection())));
  assert.ok(memoryCardPracticeFromToolResult(toolResult(projection({
    reviewCapability: "A"
  }))));
  assert.equal(memoryCardPracticeFromToolResult(toolResult(projection({
    reviewCapability: "A+B"
  }))), undefined);
  assert.equal(memoryCardPracticeFromToolResult(toolResult(projection({
    reviewCapability: "A".repeat(16_385)
  }))), undefined);
});

test("review and continuation arguments carry only the private temporary learner session", () => {
  const practice = memoryCardPracticeFromToolResult(toolResult(projection()));
  assert.ok(practice);
  const card = practice.cardBatch.cards[0];
  const review = createMemoryCardReviewArguments(
    practice,
    card,
    "known",
    "request-123"
  );
  assert.deepEqual(review, {
    learningSessionId: LEARNING_SESSION,
    goalId: "MATH_MEMORY_1",
    cardId: "card-1",
    reviewCapability: CAPABILITY,
    rating: "known",
    expectedStateVersion: 8,
    clientRequestId: "request-123",
    language: "de"
  });
  assert.deepEqual(createMemoryCardStartArguments(practice), {
    learningSessionId: LEARNING_SESSION,
    goalId: "MATH_MEMORY_1",
    expectedStateVersion: 8,
    language: "de"
  });
  assert.equal(createMemoryCardReviewArguments(practice, card, "easy", "request"), undefined);
  assert.equal(createMemoryCardReviewArguments(
    practice,
    { ...card, id: "foreign-card" },
    "known",
    "request"
  ), undefined);
});

test("temporary learner sessions are accepted only from unambiguous private metadata", () => {
  const privateProjection = projection();
  assert.equal(memoryCardPracticeFromToolResult({
    structuredContent: {
      stateVersion: 8,
      learningSessionId: LEARNING_SESSION,
      skillpilotMemoryCard: privateProjection
    }
  }), undefined);

  assert.equal(memoryCardPracticeFromToolResult(toolResult({
    ...privateProjection,
    learningSessionId: "spc_too-short"
  })), undefined);
  assert.equal(memoryCardPracticeFromToolResult(toolResult({
    ...privateProjection,
    learningSessionId: undefined
  })), undefined);
  assert.equal(memoryCardPracticeFromToolResult({
    result: toolResult(privateProjection),
    _meta: {
      skillpilotMemoryCard: {
        ...privateProjection,
        learningSessionId: `spc_${"F".repeat(43)}`
      }
    }
  }), undefined);
});

test("card batches reject duplicates and inconsistent due-card bounds", () => {
  const duplicate = projection();
  duplicate.cardBatch.cards[1].id = duplicate.cardBatch.cards[0].id;
  assert.equal(memoryCardPracticeFromToolResult(toolResult(duplicate)), undefined);

  const inconsistent = projection();
  inconsistent.cardBatch.totalDueCards = 1;
  assert.equal(memoryCardPracticeFromToolResult(toolResult(inconsistent)), undefined);

  const tooMany = projection();
  tooMany.progress.due = 21;
  tooMany.cardBatch.totalDueCards = 21;
  tooMany.cardBatch.cards = Array.from({ length: 21 }, (_, index) => ({
    id: `card-${index}`,
    front: "Frage",
    back: "Antwort",
    reviewCapability: CAPABILITY
  }));
  assert.equal(memoryCardPracticeFromToolResult(toolResult(tooMany)), undefined);
});

test("review receipt remains bounded and contains no private card projection", () => {
  const receipt = memoryCardReviewReceiptFromToolResult({
    structuredContent: {
      status: "reviewed",
      goalId: "MATH_MEMORY_1",
      goalTitle: "Grundwissen wiederholen",
      stateVersion: 9,
      progress: { dueCards: 1, scheduledCards: 5, totalCards: 8 },
      completed: false
    },
    _meta: { skillpilotMemoryCard: projection() }
  });
  assert.deepEqual(receipt, {
    status: "reviewed",
    goalId: "MATH_MEMORY_1",
    goalTitle: "Grundwissen wiederholen",
    expectedStateVersion: 9,
    progress: { due: 1, scheduled: 5, total: 8 },
    completed: false
  });
  assert.equal("cardBatch" in receipt, false);
});

test("submission gate permits only one in-flight write", () => {
  const gate = new MemoryCardSubmissionGate();
  const first = gate.begin();
  assert.equal(first, 1);
  assert.equal(gate.begin(), undefined);
  assert.equal(gate.isCurrent(first), true);
  gate.finish(first);
  assert.equal(gate.begin(), 2);
});

function toolResult(privateProjection) {
  return {
    structuredContent: { status: "ready", stateVersion: 8 },
    _meta: { skillpilotMemoryCard: privateProjection }
  };
}

function projection({ reviewCapability = CAPABILITY } = {}) {
  return {
    learningSessionId: LEARNING_SESSION,
    communicationLocale: "de-DE",
    goalId: "MATH_MEMORY_1",
    goalTitle: "Grundwissen wiederholen",
    expectedStateVersion: 7,
    progress: { due: 2, scheduled: 4, total: 8 },
    completed: false,
    cardBatch: {
      cards: [
        {
          id: "card-1",
          front: "Was ist 2 + 2?",
          back: "4",
          reviewCapability
        },
        {
          id: "card-2",
          front: "Was ist 3 + 3?",
          back: "6",
          reviewCapability
        }
      ],
      totalDueCards: 2
    }
  };
}
