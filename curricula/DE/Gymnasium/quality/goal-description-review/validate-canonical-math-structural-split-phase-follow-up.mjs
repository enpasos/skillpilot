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
const parentReceiptPath = path.join(here, "canonical-math-structural-splits-2026-08-16.receipt.json");
const followUpReceiptPath = path.join(here, "canonical-math-structural-split-phase-follow-up-2026-08-16.receipt.json");
const schemaPath = path.join(here, "canonical-math-structural-split-phase-follow-up.receipt.schema.json");
const weightFollowUpReceiptPath = path.join(here, "canonical-math-structural-split-weight-closure-follow-up-2026-08-16.receipt.json");

const readJsonAbsolute = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const readBytes = (relativePath) => fs.readFileSync(path.resolve(repoRoot, relativePath));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const digestReceipt = (receipt) => {
  const payload = structuredClone(receipt);
  delete payload.receiptDigest;
  return sha256(Buffer.from(JSON.stringify(payload), "utf8"));
};

const parentReceipt = readJsonAbsolute(parentReceiptPath);
const followUp = readJsonAbsolute(followUpReceiptPath);
const schema = readJsonAbsolute(schemaPath);
const weightFollowUp = fs.existsSync(weightFollowUpReceiptPath)
  ? readJsonAbsolute(weightFollowUpReceiptPath)
  : null;

assert.equal(parentReceipt.receiptDigest, "bbc31bfe7767ff74328919d87324c59cacc60c31cc8f2091d17700fd41c9ca59");
assert.equal(digestReceipt(parentReceipt), parentReceipt.receiptDigest, "parent receipt digest drift");
assert.equal(followUp.parentReceipt.receiptDigest, parentReceipt.receiptDigest);
assert.equal(followUp.parentReceipt.applyPlanSha256, parentReceipt.designDigests.applyPlanSha256);
assert.equal(followUp.parentReceipt.applyPlanDigest, parentReceipt.designDigests.applyPlanDigest);
assert.equal(digestReceipt(followUp), followUp.receiptDigest, "follow-up receipt digest drift");
assert.equal(schema.properties.receiptId.const, followUp.receiptId);
assert.deepEqual(schema.properties.beforeCanonical.const, followUp.beforeCanonical);
assert.deepEqual(schema.properties.afterCanonical.const, followUp.afterCanonical);
assert.equal(followUp.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(followUp.authorization.commitPushDeployAuthorized, false);
assert.equal(followUp.authorization.affectsOpenAiCoachV1Contract, false);
assert.deepEqual(followUp.scope.excludedSplitCodes, ["S05", "S24"]);
assert.deepEqual(followUp.scope.excludedBlockCodes, ["B19"]);
assert.equal(followUp.scope.changedGoalCount, 4);
assert.equal(followUp.scope.changedField, "requires");

const parentCanonicalBinding = parentReceipt.postApplyDigests.find(
  (binding) => binding.path === followUp.beforeCanonical.path,
);
assert.deepEqual(parentCanonicalBinding, followUp.beforeCanonical, "follow-up does not start at the parent-receipt canonical binding");
let effectiveCanonicalBinding = followUp.afterCanonical;
if (weightFollowUp) {
  assert.equal(digestReceipt(weightFollowUp), weightFollowUp.receiptDigest, "weight follow-up receipt digest drift");
  assert.equal(weightFollowUp.parentReceipt.receiptDigest, followUp.receiptDigest);
  assert.equal(weightFollowUp.parentReceipt.afterCanonicalSha256, followUp.afterCanonical.sha256);
  assert.deepEqual(weightFollowUp.beforeCanonical, followUp.afterCanonical);
  assert.equal(weightFollowUp.structuralReceipt.receiptDigest, parentReceipt.receiptDigest);
  assert.equal(weightFollowUp.structuralReceipt.applyPlanSha256, parentReceipt.designDigests.applyPlanSha256);
  assert.equal(weightFollowUp.structuralReceipt.applyPlanDigest, parentReceipt.designDigests.applyPlanDigest);
  effectiveCanonicalBinding = weightFollowUp.afterCanonical;
}
const currentCanonicalBytes = receiptChain.snapshots.phaseAfter.bytes;
effectiveCanonicalBinding = receiptChain.snapshots.phaseAfter.binding;
assert.equal(currentCanonicalBytes.length, effectiveCanonicalBinding.bytes, "phase intermediate canonical byte length drift");
assert.equal(sha256(currentCanonicalBytes), effectiveCanonicalBinding.sha256, "phase intermediate canonical digest drift");

const canonical = JSON.parse(currentCanonicalBytes);
const goalsById = new Map(canonical.goals.map((goal) => [goal.id, goal]));
assert.equal(goalsById.size, canonical.goals.length, "duplicate canonical goal IDs");
const expectedChangeIds = [
  "c19d1f8f-b297-5a58-b1d4-26d811e4aff4",
  "308f19e2-e202-5300-a2fa-1eaa717f4e73",
  "a506fc1d-b784-548f-90c3-5aae1b819b68",
  "5619ca5b-dc2a-504e-ad89-2e0ca0a83822",
];
assert.deepEqual(followUp.changes.map((change) => change.goalId), expectedChangeIds);
assert.equal(new Set(expectedChangeIds).size, 4);

const phaseRanks = new Map([
  ["GLOBAL", 0],
  ["J5", 5],
  ["J6", 6],
  ["J7", 7],
  ["J8", 8],
  ["J9", 9],
  ["J10", 10],
  ["E", 11],
  ["Q1", 12],
  ["Q2", 13],
  ["Q3", 14],
  ["Q4", 15],
  ["Abitur", 16],
]);
for (const change of followUp.changes) {
  const goal = goalsById.get(change.goalId);
  assert(goal, `${change.goalId}: changed goal is missing`);
  assert.equal(goal.title, change.title, `${change.goalId}: title drift`);
  assert.equal(goal.dimensionTags?.phase, change.phase, `${change.goalId}: phase drift`);
  assert.deepEqual(goal.requires, change.afterRequires, `${change.goalId}: follow-up requires drift`);
  assert.notDeepEqual(change.beforeRequires, change.afterRequires, `${change.goalId}: follow-up is a no-op`);
  for (const removed of change.replacedLaterPhase) {
    assert.equal(change.beforeRequires.includes(removed.goalId), true, `${change.goalId}: removed prerequisite was not in beforeRequires`);
    assert.equal(change.afterRequires.includes(removed.goalId), false, `${change.goalId}: later-phase prerequisite remains`);
    assert.equal(goalsById.get(removed.goalId)?.dimensionTags?.phase, removed.phase, `${change.goalId}: removed phase evidence drift`);
  }
  const goalRank = phaseRanks.get(change.phase);
  assert.notEqual(goalRank, undefined, `${change.goalId}: unsupported goal phase`);
  for (const prerequisiteId of goal.requires) {
    const prerequisite = goalsById.get(prerequisiteId);
    assert(prerequisite, `${change.goalId}: missing prerequisite ${prerequisiteId}`);
    const prerequisiteRank = phaseRanks.get(prerequisite.dimensionTags?.phase);
    if (prerequisiteRank !== undefined) {
      assert.equal(prerequisiteRank <= goalRank, true, `${change.goalId}: prerequisite ${prerequisiteId} is still in a later phase`);
    }
  }
}

const visiting = new Set();
const visited = new Set();
const visit = (goalId) => {
  if (visited.has(goalId)) return;
  assert.equal(visiting.has(goalId), false, `requires cycle at ${goalId}`);
  visiting.add(goalId);
  for (const prerequisite of goalsById.get(goalId)?.requires ?? []) {
    assert.equal(goalsById.has(prerequisite), true, `${goalId}: unknown prerequisite ${prerequisite}`);
    visit(prerequisite);
  }
  visiting.delete(goalId);
  visited.add(goalId);
};
for (const goalId of goalsById.keys()) visit(goalId);

console.log(JSON.stringify({
  result: "PASS",
  parentReceiptDigest: parentReceipt.receiptDigest,
  followUpReceiptDigest: followUp.receiptDigest,
  beforeCanonicalSha256: followUp.beforeCanonical.sha256,
  afterCanonicalSha256: followUp.afterCanonical.sha256,
  effectiveCanonicalSha256: effectiveCanonicalBinding.sha256,
  currentLeafCanonicalSha256: receiptChain.snapshots.current.binding.sha256,
  weightFollowUpReceiptDigest: weightFollowUp?.receiptDigest ?? null,
  correctedGoalIds: expectedChangeIds,
}, null, 2));
