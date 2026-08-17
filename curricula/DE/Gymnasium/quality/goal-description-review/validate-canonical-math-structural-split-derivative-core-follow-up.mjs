#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateStructuralSplitReceiptChain } from "./canonical-math-structural-split-receipt-chain.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptChain = validateStructuralSplitReceiptChain({ here, repoRoot });
const receipt = JSON.parse(fs.readFileSync(path.join(here, "canonical-math-structural-split-derivative-core-follow-up-2026-08-16.receipt.json"), "utf8"));
const schema = JSON.parse(fs.readFileSync(path.join(here, "canonical-math-structural-split-derivative-core-follow-up.receipt.schema.json"), "utf8"));
const parent = JSON.parse(fs.readFileSync(path.join(repoRoot, receipt.parentReceipt.path), "utf8"));
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const digestReceipt = (value) => { const clone = structuredClone(value); delete clone.receiptDigest; return sha(Buffer.from(JSON.stringify(clone), "utf8")); };
const serializeJson = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n", "utf8");
const readJsonl = (bytes) => bytes.toString("utf8").trimEnd().split("\n").filter(Boolean).map((line) => JSON.parse(line));
const serializeJsonl = (records) => Buffer.from(records.map((record) => JSON.stringify(record)).join("\n") + "\n", "utf8");
const fileMeta = (collection, suffix) => collection.find((entry) => entry.path.endsWith(suffix));

assert.equal(digestReceipt(receipt), receipt.receiptDigest);
assert.equal(receipt.receiptDigest, "2a1772ddd1f67a4388b8978b6204c832b7c0c9065007b354cdee3cfb946c59dd");
assert.deepEqual(schema.properties.scope.const, receipt.scope);
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest);
assert.equal(parent.afterCanonical.sha256, receipt.parentReceipt.afterCanonicalSha256);
for (const expected of receipt.afterFiles) {
  const bytes = receiptChain.historicalFileBytes(expected.path);
  assert.equal(bytes.length, expected.bytes, expected.path + " byte count");
  assert.equal(sha(bytes), expected.sha256, expected.path + " SHA-256");
}

const canonicalMeta = fileMeta(receipt.afterFiles, "/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
const canonicalBeforeMeta = fileMeta(receipt.beforeFiles, "/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json");
const canonical = structuredClone(receiptChain.snapshots.current.value);
assert.equal(canonicalMeta.sha256, receiptChain.snapshots.current.binding.sha256, "derivative leaf does not match complete receipt chain");
const reconstructedCanonical = structuredClone(canonical);
for (const change of receipt.applicabilityChanges) {
  const goal = reconstructedCanonical.goals.find((candidate) => candidate.id === change.goalId);
  assert(goal, "missing applicability goal " + change.goalId);
  assert.deepEqual(goal.applicability, change.afterApplicability);
  goal.applicability = change.beforeApplicability;
}
const reconstructedCanonicalBytes = serializeJson(reconstructedCanonical);
assert.equal(reconstructedCanonicalBytes.length, canonicalBeforeMeta.bytes);
assert.equal(sha(reconstructedCanonicalBytes), canonicalBeforeMeta.sha256);

const semanticMeta = fileMeta(receipt.afterFiles, "mathematik.semantic-kinds.json");
const semanticBeforeMeta = fileMeta(receipt.beforeFiles, "mathematik.semantic-kinds.json");
const semantic = JSON.parse(receiptChain.historicalFileBytes(semanticMeta.path));
const semanticById = new Map(semantic.decisions.map((decision) => [decision.goalId, decision]));
for (const change of receipt.semanticKindChanges) assert.deepEqual(semanticById.get(change.goalId), change.afterDecision);
const reconstructedSemantic = structuredClone(semantic);
const reconstructedSemanticById = new Map(reconstructedSemantic.decisions.map((decision) => [decision.goalId, decision]));
for (const change of receipt.semanticKindChanges) {
  if (change.beforeDecision) reconstructedSemanticById.set(change.goalId, change.beforeDecision);
  else reconstructedSemanticById.delete(change.goalId);
}
reconstructedSemantic.decisions = [...reconstructedSemanticById.values()].sort((a, b) => a.goalId.localeCompare(b.goalId));
reconstructedSemantic.counts = reconstructedSemantic.decisions.reduce((counts, decision) => {
  counts[decision.semanticKind] = (counts[decision.semanticKind] ?? 0) + 1;
  counts.total += 1;
  return counts;
}, { curricularAtomic: 0, curricularArea: 0, practiceAssessment: 0, programStructure: 0, memory: 0, runtimeSupport: 0, orientation: 0, total: 0 });
const reconstructedSemanticBytes = serializeJson(reconstructedSemantic);
assert.equal(reconstructedSemanticBytes.length, semanticBeforeMeta.bytes);
assert.equal(sha(reconstructedSemanticBytes), semanticBeforeMeta.sha256);

const reconstructJsonl = (afterMeta, beforeMeta, changes, updatedKey = null) => {
  let rows = readJsonl(receiptChain.historicalFileBytes(afterMeta.path));
  const addedIds = new Set((changes.added ?? []).map((entry) => entry.record.goalId));
  rows = rows.filter((row) => !addedIds.has(row.goalId));
  if (updatedKey) {
    const beforeById = new Map((changes.updated ?? []).map((entry) => [entry.beforeRecord.goalId, entry.beforeRecord]));
    rows = rows.map((row) => beforeById.get(row.goalId) ?? row);
  }
  for (const entry of [...(changes.removed ?? [])].sort((a, b) => a.beforeIndex - b.beforeIndex)) rows.splice(entry.beforeIndex, 0, entry.record);
  const bytes = serializeJsonl(rows);
  assert.equal(bytes.length, beforeMeta.bytes, beforeMeta.path + " reconstructed bytes");
  assert.equal(sha(bytes), beforeMeta.sha256, beforeMeta.path + " reconstructed SHA");
};

const atomicAfterMeta = fileMeta(receipt.afterFiles, "semantic-atomicity/canonical-math-full.review.jsonl");
const atomicBeforeMeta = fileMeta(receipt.beforeFiles, "semantic-atomicity/canonical-math-full.review.jsonl");
reconstructJsonl(atomicAfterMeta, atomicBeforeMeta, receipt.atomicityChanges);
const memoryAfterMeta = fileMeta(receipt.afterFiles, "memory-card-review/canonical-math-full.review.jsonl");
const memoryBeforeMeta = fileMeta(receipt.beforeFiles, "memory-card-review/canonical-math-full.review.jsonl");
reconstructJsonl(memoryAfterMeta, memoryBeforeMeta, receipt.memoryGoalChanges, "updated");

const cardsAfterMeta = fileMeta(receipt.afterFiles, "canonical-math-full.cards.review.jsonl");
const cardsBeforeMeta = fileMeta(receipt.beforeFiles, "canonical-math-full.cards.review.jsonl");
const cardRows = readJsonl(receiptChain.historicalFileBytes(cardsAfterMeta.path));
for (const change of receipt.memoryCardChanges) {
  assert.deepEqual(cardRows[change.index], change.afterRecord);
  cardRows[change.index] = change.beforeRecord;
}
const reconstructedCardBytes = serializeJsonl(cardRows);
assert.equal(reconstructedCardBytes.length, cardsBeforeMeta.bytes);
assert.equal(sha(reconstructedCardBytes), cardsBeforeMeta.sha256);

assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
console.log(JSON.stringify({ result: "PASS", receiptDigest: receipt.receiptDigest, parentReceiptDigest: parent.receiptDigest, afterCanonicalSha256: canonicalMeta.sha256, applicabilityGoalCount: receipt.applicabilityChanges.length, semanticDecisionChangeCount: receipt.semanticKindChanges.length, atomicityAdded: receipt.atomicityChanges.added.length, memoryAdded: receipt.memoryGoalChanges.added.length, memoryCardChanges: receipt.memoryCardChanges.length }, null, 2));
