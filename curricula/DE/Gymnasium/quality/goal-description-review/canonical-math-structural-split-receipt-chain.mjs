import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const receiptNames = {
  structural: "canonical-math-structural-splits-2026-08-16.receipt.json",
  phase: "canonical-math-structural-split-phase-follow-up-2026-08-16.receipt.json",
  weight: "canonical-math-structural-split-weight-closure-follow-up-2026-08-16.receipt.json",
  orientation: "canonical-math-structural-split-orientation-milestone-follow-up-2026-08-16.receipt.json",
  derivative: "canonical-math-structural-split-derivative-core-follow-up-2026-08-16.receipt.json",
  composition: "canonical-math-structural-split-composition-view-follow-up-2026-08-16.receipt.json",
};

const authorityReceiptName = "canonical-layer-a-route-assessment-source-hardening-authority-2026-08-17.receipt.json";

const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const serializeJson = (value) => Buffer.from(`${JSON.stringify(value, null, 2)}\n`, "utf8");
const receiptDigest = (receipt) => {
  const payload = structuredClone(receipt);
  delete payload.receiptDigest;
  return sha256(Buffer.from(JSON.stringify(payload), "utf8"));
};

const assertBinding = (bytes, binding, label) => {
  assert.equal(bytes.length, binding.bytes, `${label}: byte length drift`);
  assert.equal(sha256(bytes), binding.sha256, `${label}: SHA-256 drift`);
};

const goalMap = (canonical) => {
  const result = new Map(canonical.goals.map((goal) => [goal.id, goal]));
  assert.equal(result.size, canonical.goals.length, "duplicate canonical goal IDs");
  return result;
};

const withoutGoals = (canonical) => {
  const result = structuredClone(canonical);
  delete result.goals;
  return result;
};

const reconstructAuthorityBeforeCanonical = (current, reversal) => {
  assert.deepEqual(withoutGoals(current), reversal.afterTopLevel, "authority canonical top-level after-state drift");
  const currentById = goalMap(current);
  const beforeById = new Map(currentById);

  for (const change of reversal.changedGoals) {
    assert.deepEqual(currentById.get(change.goalId), change.afterGoal, `${change.goalId}: authority canonical changed after-state drift`);
    beforeById.set(change.goalId, change.beforeGoal);
  }
  for (const addition of reversal.addedGoals) {
    assert.deepEqual(currentById.get(addition.goalId), addition.afterGoal, `${addition.goalId}: authority canonical addition drift`);
    beforeById.delete(addition.goalId);
  }
  for (const removal of reversal.removedGoals) {
    assert.equal(currentById.has(removal.goalId), false, `${removal.goalId}: authority canonical removed goal unexpectedly present`);
    beforeById.set(removal.goalId, removal.beforeGoal);
  }

  assert.equal(beforeById.size, reversal.beforeGoalIds.length, "authority canonical reversal goal-count drift");
  const reconstructed = structuredClone(reversal.beforeTopLevel);
  reconstructed.goals = reversal.beforeGoalIds.map((goalId) => {
    const goal = beforeById.get(goalId);
    assert(goal, `${goalId}: authority canonical reversal goal missing`);
    return goal;
  });
  return reconstructed;
};

/**
 * Validate the immutable receipt chain and reconstruct every historical
 * canonical intermediate from the current leaf. Historical receipts remain
 * bound to their original bytes; later append-only follow-ups are reversed in
 * order instead of silently rebasing an older hash to the current file.
 */
export function validateStructuralSplitReceiptChain({ here, repoRoot }) {
  const receipts = Object.fromEntries(Object.entries(receiptNames).map(([key, name]) => [
    key,
    JSON.parse(fs.readFileSync(path.join(here, name), "utf8")),
  ]));

  for (const [key, receipt] of Object.entries(receipts)) {
    assert.equal(receiptDigest(receipt), receipt.receiptDigest, `${key} receipt digest drift`);
  }

  const { structural, phase, weight, orientation, derivative, composition } = receipts;
  const structuralCanonical = structural.postApplyDigests.find(
    (entry) => entry.path === phase.beforeCanonical.path,
  );
  assert.deepEqual(structuralCanonical, phase.beforeCanonical, "phase does not start at structural canonical binding");
  assert.equal(phase.parentReceipt.receiptDigest, structural.receiptDigest, "phase parent receipt drift");
  assert.equal(phase.parentReceipt.applyPlanSha256, structural.designDigests.applyPlanSha256, "phase apply-plan SHA drift");
  assert.equal(phase.parentReceipt.applyPlanDigest, structural.designDigests.applyPlanDigest, "phase apply-plan digest drift");
  assert.deepEqual(weight.beforeCanonical, phase.afterCanonical, "weight does not start at phase canonical binding");
  assert.equal(weight.parentReceipt.receiptDigest, phase.receiptDigest, "weight parent receipt drift");
  assert.equal(weight.parentReceipt.afterCanonicalSha256, phase.afterCanonical.sha256, "weight parent canonical drift");
  assert.deepEqual(orientation.beforeCanonical, weight.afterCanonical, "orientation does not start at weight canonical binding");
  assert.equal(orientation.parentReceipt.receiptDigest, weight.receiptDigest, "orientation parent receipt drift");
  assert.equal(orientation.parentReceipt.afterCanonicalSha256, weight.afterCanonical.sha256, "orientation parent canonical drift");

  const derivativeBefore = derivative.beforeFiles.find((entry) => entry.path === orientation.afterCanonical.path);
  const derivativeAfter = derivative.afterFiles.find((entry) => entry.path === orientation.afterCanonical.path);
  assert.deepEqual(derivativeBefore, orientation.afterCanonical, "derivative does not start at orientation canonical binding");
  assert.equal(derivative.parentReceipt.receiptDigest, orientation.receiptDigest, "derivative parent receipt drift");
  assert.equal(derivative.parentReceipt.afterCanonicalSha256, orientation.afterCanonical.sha256, "derivative parent canonical drift");
  assert(derivativeAfter, "derivative canonical after-binding is missing");
  assert.equal(composition.parentReceipt.receiptDigest, derivative.receiptDigest, "composition parent receipt drift");
  assert.equal(composition.parentReceipt.afterCanonicalSha256, derivativeAfter.sha256, "composition parent canonical drift");
  assert.equal(composition.canonicalBinding.path, derivativeAfter.path, "composition canonical path drift");
  assert.equal(composition.canonicalBinding.sha256, derivativeAfter.sha256, "composition canonical SHA drift");
  assert.equal(composition.canonicalBinding.unchangedByThisFollowUp, true, "composition unexpectedly mutates canonical bytes");

  const authorityPath = path.join(here, authorityReceiptName);
  const authority = fs.existsSync(authorityPath)
    ? JSON.parse(fs.readFileSync(authorityPath, "utf8"))
    : null;
  const authorityFilesByPath = new Map(authority?.contentChangeSet?.files?.map((entry) => [entry.path, entry]) ?? []);
  const historicalFileBytes = (relativePath) => {
    const livePath = path.join(repoRoot, relativePath);
    const entry = authorityFilesByPath.get(relativePath);
    if (!entry) return fs.readFileSync(livePath);

    const liveBytes = fs.existsSync(livePath) ? fs.readFileSync(livePath) : null;
    assert.equal(liveBytes === null, entry.after === null, `${relativePath}: authority after existence drift`);
    if (liveBytes) assertBinding(liveBytes, entry.after, `${relativePath}: authority after binding`);
    if (entry.before === null) return null;
    const beforeBytes = execFileSync(
      "git",
      ["show", `${authority.candidateBindings.baselineGitCommit}:${relativePath}`],
      { cwd: repoRoot, encoding: null, maxBuffer: 1024 * 1024 * 256 },
    );
    assertBinding(beforeBytes, entry.before, `${relativePath}: authority before binding`);
    return beforeBytes;
  };

  let authorityCurrent = null;
  let currentBytes;
  if (authority) {
    assert.equal(receiptDigest(authority), authority.receiptDigest, "authority receipt digest drift");
    const compositionParent = authority.parentReceiptChain.at(-1);
    assert(compositionParent, "authority receipt parent chain is empty");
    assert.equal(compositionParent.receiptDigest, composition.receiptDigest, "authority receipt does not append to composition receipt");
    const reversal = authority.canonicalReversal;
    assert(reversal, "authority receipt lacks canonical reversal");
    assert.equal(reversal.path, derivativeAfter.path, "authority canonical reversal path drift");
    assert.deepEqual(reversal.before, derivativeAfter, "authority canonical reversal does not start at derivative leaf");
    const liveBytes = fs.readFileSync(path.join(repoRoot, reversal.path));
    assertBinding(liveBytes, reversal.after, "authority current canonical");
    const live = JSON.parse(liveBytes);
    const reconstructed = reconstructAuthorityBeforeCanonical(live, reversal);
    currentBytes = serializeJson(reconstructed);
    assertBinding(currentBytes, reversal.before, "reconstructed authority parent canonical");
    const baseline = historicalFileBytes(reversal.path);
    assert.deepEqual(currentBytes, baseline, "authority canonical reversal differs from bound before bytes");
    authorityCurrent = { value: live, bytes: liveBytes, binding: reversal.after, receipt: authority };
  } else {
    currentBytes = fs.readFileSync(path.join(repoRoot, derivativeAfter.path));
  }
  assertBinding(currentBytes, derivativeAfter, "current derivative leaf canonical");
  const current = JSON.parse(currentBytes);

  const orientationAfter = structuredClone(current);
  const orientationAfterById = goalMap(orientationAfter);
  for (const change of derivative.applicabilityChanges) {
    const goal = orientationAfterById.get(change.goalId);
    assert(goal, `${change.goalId}: derivative applicability goal missing`);
    assert.deepEqual(goal.applicability, change.afterApplicability, `${change.goalId}: derivative applicability after-state drift`);
    goal.applicability = change.beforeApplicability;
  }
  const orientationAfterBytes = serializeJson(orientationAfter);
  assertBinding(orientationAfterBytes, orientation.afterCanonical, "reconstructed orientation after canonical");

  const weightAfter = structuredClone(orientationAfter);
  const orientationGoal = weightAfter.goals.find((goal) => goal.id === orientation.scope.orientationGoalId);
  assert(orientationGoal, "orientation goal missing while reconstructing weight leaf");
  const outlook = orientationGoal.extendedData?.orientationOutlook?.paths?.find(
    (entry) => entry.id === orientation.scope.orientationPathId,
  );
  assert(outlook, "orientation path missing while reconstructing weight leaf");
  for (const change of orientation.changes) {
    const index = outlook.milestoneGoalIds.indexOf(change.newGoalId);
    assert.notEqual(index, -1, `${change.newGoalId}: current orientation milestone missing`);
    outlook.milestoneGoalIds[index] = change.oldGoalId;
  }
  const weightAfterBytes = serializeJson(weightAfter);
  assertBinding(weightAfterBytes, weight.afterCanonical, "reconstructed weight after canonical");

  const phaseAfter = structuredClone(weightAfter);
  const phaseAfterById = goalMap(phaseAfter);
  for (const change of weight.corrected) {
    const goal = phaseAfterById.get(change.goalId);
    assert(goal, `${change.goalId}: weight-correction goal missing`);
    assert.equal(goal.weight, change.afterWeight, `${change.goalId}: weight after-state drift`);
    goal.weight = change.beforeWeight;
  }
  const phaseAfterBytes = serializeJson(phaseAfter);
  assertBinding(phaseAfterBytes, phase.afterCanonical, "reconstructed phase after canonical");

  const structuralAfter = structuredClone(phaseAfter);
  const structuralAfterById = goalMap(structuralAfter);
  for (const change of phase.changes) {
    const goal = structuralAfterById.get(change.goalId);
    assert(goal, `${change.goalId}: phase-correction goal missing`);
    assert.deepEqual(goal.requires, change.afterRequires, `${change.goalId}: phase after-state drift`);
    goal.requires = change.beforeRequires;
  }
  const structuralAfterBytes = serializeJson(structuralAfter);
  assertBinding(structuralAfterBytes, phase.beforeCanonical, "reconstructed structural after canonical");

  return {
    receipts,
    authority,
    historicalFileBytes,
    snapshots: {
      current: { value: current, bytes: currentBytes, binding: derivativeAfter },
      authorityCurrent,
      orientationAfter: { value: orientationAfter, bytes: orientationAfterBytes, binding: orientation.afterCanonical },
      weightAfter: { value: weightAfter, bytes: weightAfterBytes, binding: weight.afterCanonical },
      phaseAfter: { value: phaseAfter, bytes: phaseAfterBytes, binding: phase.afterCanonical },
      structuralAfter: { value: structuralAfter, bytes: structuralAfterBytes, binding: phase.beforeCanonical },
    },
  };
}
