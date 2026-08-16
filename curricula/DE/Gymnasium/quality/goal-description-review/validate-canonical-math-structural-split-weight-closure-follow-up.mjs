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
const structuralReceiptPath = path.join(here, "canonical-math-structural-splits-2026-08-16.receipt.json");
const phaseReceiptPath = path.join(here, "canonical-math-structural-split-phase-follow-up-2026-08-16.receipt.json");
const receiptPath = path.join(here, "canonical-math-structural-split-weight-closure-follow-up-2026-08-16.receipt.json");
const schemaPath = path.join(here, "canonical-math-structural-split-weight-closure-follow-up.receipt.schema.json");
const expectedReceiptDigest = "1711b59b9655ef229c7892a861a2b231659804ff60d6d7f201e19283f90348fc";
const expectedWeights = new Map(Object.entries({
  "0416f809-3f23-4774-8622-cf9b7a6d26d6": 5,
  "0756b198-0074-49d5-becd-9bb9f161a291": 13,
  "0a86e9a3-041e-5f15-874d-8eb17b69784d": 6,
  "187c1bef-57bc-4a93-a26b-04191879626c": 5,
  "213c3e11-3e8d-4db7-a04e-3a05c13304a5": 77,
  "248d7dc3-6d85-55b3-8859-584c79869d75": 11,
  "29d48dc6-1746-57b3-bc14-00a7198aac02": 13,
  "320bc921-06df-4500-96fd-93f9f6fee9b4": 5,
  "392440db-6a43-59c0-a48d-958128fa16a8": 4,
  "3e937f39-1187-58b3-96c3-ec39278c0e3c": 83,
  "46a5ce30-a281-457c-b71e-9cfea2bffbc7": 147,
  "4720daf4-cefe-43a9-a0e8-9db55286f558": 120,
  "4af3fe2f-851c-520a-9a1d-b8036ac1dbb1": 8,
  "5ebfc509-0b4c-5c60-befb-2477eb24d4b5": 25,
  "64ec32d7-6d82-40ec-b827-148b90e564f4": 5,
  "67ef9787-d540-5f30-9995-f1f9c39a1a45": 22,
  "6c8a677b-ede8-5c2c-86d8-0ef0be8ace28": 157,
  "6e28d5ad-5f18-4a26-8a9e-9ea7e50b0fbb": 84,
  "6fd35cc4-c375-4e58-b6f1-5382d8422906": 45,
  "76842ec4-c76b-5c03-9694-8a18acb1da0f": 13,
  "77be59e3-08a3-5466-9df9-843937ce5ab7": 6,
  "845f2a2c-e6aa-4991-8a12-645b8a9f70fe": 56,
  "879389a7-73de-45bb-a632-0d918c23a082": 9,
  "88f8e185-a89b-4a34-869d-766042977f38": 41,
  "8e68f24a-8b0e-4ce6-9567-a49e706f83be": 12,
  "98dcf9bd-d119-5eb1-835c-7d719f67b485": 151,
  "9b4e8f0b-d447-4dad-b2a6-2a50ef99d9f6": 21,
  "a5f07620-a895-52db-a0cc-1d05bf64c3d6": 123,
  "bb25e25c-173f-463f-b602-2687d3ebf66f": 10,
  "c01b1ce9-a667-4a46-b251-ec33ae602b15": 886,
  "c8951a07-a3e7-59d2-8a23-dce545dd811a": 59,
  "ce774aad-edd7-4f86-a431-6ca921b8e570": 7,
  "d64516eb-9dd2-4808-91d0-0040ccdc281f": 37,
  "dd550132-2a3f-5b4e-a3c6-f940621186ac": 23,
  "ecce03e4-0082-41e1-95bd-0244e76ed292": 24,
  "ed631938-ad77-405e-ac25-b06d750b9c05": 51,
  "faa5b388-7b24-4f8c-9cc0-1de9372e836c": 13,
}));
const expectedExcludedClosureNeighbors = [
  "1a84cea4-d2a2-4527-b914-1a03e56e0814",
  "8034d078-facf-450c-bed6-b00b9a94f07d",
  "902de188-6f27-47c2-ace1-9b2c5771fde8",
  "9710e996-f6d0-4b8b-b893-592213c91767",
];

const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, "utf8"));
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const digestReceipt = (receipt) => {
  const payload = structuredClone(receipt);
  delete payload.receiptDigest;
  return sha256(Buffer.from(JSON.stringify(payload), "utf8"));
};
const sorted = (values) => [...values].sort();

function atomicDescendantSets(goals) {
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]));
  assert.equal(goalsById.size, goals.length, "duplicate canonical goal IDs");
  const memo = new Map();
  const visiting = new Set();
  const visit = (goalId) => {
    if (memo.has(goalId)) return memo.get(goalId);
    assert.equal(visiting.has(goalId), false, `contains cycle at ${goalId}`);
    const goal = goalsById.get(goalId);
    assert(goal, `unknown contains target ${goalId}`);
    visiting.add(goalId);
    const atoms = new Set();
    if ((goal.contains ?? []).length === 0) atoms.add(goalId);
    else for (const childId of goal.contains) for (const atomId of visit(childId)) atoms.add(atomId);
    visiting.delete(goalId);
    memo.set(goalId, atoms);
    return atoms;
  };
  for (const goalId of goalsById.keys()) visit(goalId);
  return { goalsById, atomsByGoalId: memo };
}

function reconstructPreSplitGoals(currentGoals, structuralReceipt) {
  const newGoalIds = new Set(structuralReceipt.splits.flatMap((split) =>
    split.children.filter((child) => child.kind === "new").map((child) => child.goalId),
  ));
  const goals = structuredClone(currentGoals).filter((goal) => !newGoalIds.has(goal.id));
  const goalsById = new Map(goals.map((goal) => [goal.id, goal]));
  for (const split of structuralReceipt.splits) {
    const retainedGoal = goalsById.get(split.oldGoalId);
    assert(retainedGoal, `${split.code}: retained split goal missing`);
    retainedGoal.contains = [];
  }
  for (const split of structuralReceipt.splits) {
    if (!split.parentRestructure) continue;
    const parent = goalsById.get(split.parentRestructure.parentGoalId);
    assert(parent, `${split.code}: parent restructure target missing`);
    for (const childId of split.parentRestructure.removeDirectChildIds) {
      if (!parent.contains.includes(childId)) parent.contains.push(childId);
    }
  }
  return goals;
}

const structuralReceipt = readJson(structuralReceiptPath);
const phaseReceipt = readJson(phaseReceiptPath);
const receipt = readJson(receiptPath);
const schema = readJson(schemaPath);
assert.equal(digestReceipt(structuralReceipt), structuralReceipt.receiptDigest, "structural parent receipt digest drift");
assert.equal(digestReceipt(phaseReceipt), phaseReceipt.receiptDigest, "phase parent receipt digest drift");
assert.equal(receipt.receiptDigest, expectedReceiptDigest, "unexpected weight-closure receipt digest");
assert.equal(digestReceipt(receipt), receipt.receiptDigest, "weight-closure receipt digest drift");
assert.equal(receipt.parentReceipt.receiptDigest, phaseReceipt.receiptDigest);
assert.equal(receipt.parentReceipt.afterCanonicalSha256, phaseReceipt.afterCanonical.sha256);
assert.equal(receipt.structuralReceipt.receiptDigest, structuralReceipt.receiptDigest);
assert.equal(receipt.structuralReceipt.applyPlanSha256, structuralReceipt.designDigests.applyPlanSha256);
assert.equal(receipt.structuralReceipt.applyPlanDigest, structuralReceipt.designDigests.applyPlanDigest);
assert.equal(schema.properties.receiptId.const, receipt.receiptId);
assert.deepEqual(schema.properties.parentReceipt.const, receipt.parentReceipt);
assert.deepEqual(schema.properties.structuralReceipt.const, receipt.structuralReceipt);
assert.deepEqual(schema.properties.scope.const, receipt.scope);
assert.deepEqual(schema.properties.beforeCanonical.const, receipt.beforeCanonical);
assert.deepEqual(schema.properties.afterCanonical.const, receipt.afterCanonical);
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
assert.equal(receipt.scope.changedGoalCount, 37);
assert.equal(receipt.scope.changedField, "weight");
assert.equal(receipt.scope.auditedSplitDeltaClusterCount, 65);
assert.equal(receipt.scope.alreadyCorrectClusterCount, 28);
assert.equal(receipt.scope.globalPreExistingUnrelatedDebtCount, 45);
assert.deepEqual(receipt.scope.excludedSplitCodes, ["S05", "S24"]);
assert.deepEqual(receipt.scope.excludedBlockCodes, ["B19"]);
assert.deepEqual(receipt.beforeCanonical, phaseReceipt.afterCanonical, "weight follow-up does not start at phase follow-up canonical binding");

const canonicalBytes = receiptChain.snapshots.weightAfter.bytes;
assert.equal(canonicalBytes.length, receipt.afterCanonical.bytes, "canonical after byte length drift");
assert.equal(sha256(canonicalBytes), receipt.afterCanonical.sha256, "canonical after digest drift");
const canonical = JSON.parse(canonicalBytes);
const current = atomicDescendantSets(canonical.goals);
for (const goal of canonical.goals) {
  if ((goal.contains ?? []).length === 0) assert.equal(goal.weight, 1, `${goal.id}: atomic/leaf weight is not 1`);
}

assert.equal(receipt.corrected.length, 37);
assert.equal(receipt.alreadyCorrect.length, 28);
assert.deepEqual(sorted(receipt.corrected.map((entry) => entry.goalId)), sorted(expectedWeights.keys()));
for (const change of receipt.corrected) {
  const goal = current.goalsById.get(change.goalId);
  assert(goal, `${change.goalId}: corrected goal missing`);
  assert.equal(goal.title, change.title, `${change.goalId}: title drift`);
  assert.notEqual(change.beforeWeight, change.afterWeight, `${change.goalId}: correction is a no-op`);
  assert.equal(change.afterWeight, expectedWeights.get(change.goalId), `${change.goalId}: expected audited weight drift`);
  assert.equal(change.uniqueAtomicDescendantCount, current.atomsByGoalId.get(change.goalId).size, `${change.goalId}: receipt atom count drift`);
  assert.equal(goal.weight, change.afterWeight, `${change.goalId}: corrected weight drift`);
}
for (const unchanged of receipt.alreadyCorrect) {
  const goal = current.goalsById.get(unchanged.goalId);
  assert(goal, `${unchanged.goalId}: already-correct goal missing`);
  assert.equal(goal.title, unchanged.title, `${unchanged.goalId}: title drift`);
  assert.equal(unchanged.weight, unchanged.uniqueAtomicDescendantCount, `${unchanged.goalId}: receipt marks a mismatch as already-correct`);
  assert.equal(goal.weight, unchanged.weight, `${unchanged.goalId}: already-correct weight changed`);
  assert.equal(current.atomsByGoalId.get(unchanged.goalId).size, unchanged.weight, `${unchanged.goalId}: unique-atom count drift`);
}
const reconstructedBeforeCanonical = structuredClone(canonical);
const reconstructedBeforeGoalsById = new Map(reconstructedBeforeCanonical.goals.map((goal) => [goal.id, goal]));
for (const change of receipt.corrected) reconstructedBeforeGoalsById.get(change.goalId).weight = change.beforeWeight;
const reconstructedBeforeBytes = Buffer.from(`${JSON.stringify(reconstructedBeforeCanonical, null, 2)}\n`, "utf8");
assert.equal(reconstructedBeforeBytes.length, receipt.beforeCanonical.bytes, "recorded weight reversals do not recover before byte length");
assert.equal(sha256(reconstructedBeforeBytes), receipt.beforeCanonical.sha256, "recorded weight reversals do not recover the exact before canonical bytes");
const auditedUnion = sorted([
  ...receipt.corrected.map((entry) => entry.goalId),
  ...receipt.alreadyCorrect.map((entry) => entry.goalId),
]);
assert.equal(new Set(auditedUnion).size, 65, "audited split-delta IDs are not unique");
assert.deepEqual(receipt.auditedSplitDeltaGoalIds, auditedUnion, "audited 65-goal inventory drift");

const reconstructed = atomicDescendantSets(reconstructPreSplitGoals(canonical.goals, structuralReceipt));
const rawClosure = [];
for (const [goalId, goal] of current.goalsById) {
  if ((goal.contains ?? []).length === 0 || !reconstructed.atomsByGoalId.has(goalId)) continue;
  const before = reconstructed.atomsByGoalId.get(goalId);
  const after = current.atomsByGoalId.get(goalId);
  if (before.size !== after.size || [...before].some((atomId) => !after.has(atomId))) rawClosure.push(goalId);
}
assert.equal(rawClosure.length, 69, "approved-plan reconstructed closure drift");
assert.deepEqual(sorted(receipt.excludedClosureNeighbors.map((entry) => entry.goalId)), expectedExcludedClosureNeighbors);
assert.deepEqual(
  sorted(rawClosure.filter((goalId) => !auditedUnion.includes(goalId))),
  expectedExcludedClosureNeighbors,
  "65-goal receipt boundary no longer matches reconstructed 69-goal closure",
);
for (const excluded of receipt.excludedClosureNeighbors) {
  const goal = current.goalsById.get(excluded.goalId);
  assert.equal(goal.title, excluded.title, `${excluded.goalId}: excluded-neighbor title drift`);
  assert.equal(goal.weight, excluded.actualWeight, `${excluded.goalId}: excluded-neighbor weight drift`);
  assert.equal(current.atomsByGoalId.get(excluded.goalId).size, excluded.uniqueAtomicDescendantCount, `${excluded.goalId}: excluded-neighbor atom count drift`);
}

const globalDebt = canonical.goals
  .filter((goal) => (goal.contains ?? []).length > 0)
  .map((goal) => ({
    goalId: goal.id,
    title: goal.title,
    actualWeight: goal.weight,
    expectedWeight: current.atomsByGoalId.get(goal.id).size,
  }))
  .filter((entry) => entry.actualWeight !== entry.expectedWeight)
  .sort((a, b) => a.goalId.localeCompare(b.goalId));
assert.equal(globalDebt.length, 45, "global pre-existing/unrelated weight-debt count drift");
assert.deepEqual(globalDebt, receipt.globalPreExistingUnrelatedDebt, "global pre-existing/unrelated weight-debt inventory drift");
assert.equal(globalDebt.some((entry) => expectedWeights.has(entry.goalId)), false, "corrected split-delta goal remains in global debt");

console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  beforeCanonicalSha256: receipt.beforeCanonical.sha256,
  afterCanonicalSha256: receipt.afterCanonical.sha256,
  currentLeafCanonicalSha256: receiptChain.snapshots.current.binding.sha256,
  auditedSplitDeltaClusterCount: auditedUnion.length,
  correctedClusterCount: receipt.corrected.length,
  alreadyCorrectClusterCount: receipt.alreadyCorrect.length,
  atomWeightViolations: 0,
  globalPreExistingUnrelatedDebtCount: globalDebt.length,
  globalClosureStatus: "REPORTED_PRE_EXISTING_DEBT_NOT_MUTATED",
}, null, 2));
