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
const receipt = JSON.parse(fs.readFileSync(path.join(repoRoot, "curricula/DE/Gymnasium/quality/goal-description-review/canonical-math-structural-split-orientation-milestone-follow-up-2026-08-16.receipt.json"), "utf8"));
const schema = JSON.parse(fs.readFileSync(path.join(repoRoot, "curricula/DE/Gymnasium/quality/goal-description-review/canonical-math-structural-split-orientation-milestone-follow-up.receipt.schema.json"), "utf8"));
const parent = JSON.parse(fs.readFileSync(path.join(repoRoot, "curricula/DE/Gymnasium/quality/goal-description-review/canonical-math-structural-split-weight-closure-follow-up-2026-08-16.receipt.json"), "utf8"));
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const digestReceipt = (value) => { const clone = structuredClone(value); delete clone.receiptDigest; return sha(Buffer.from(JSON.stringify(clone), "utf8")); };
assert.equal(receipt.receiptDigest, "c27e8a9e393bfaa09e4f7ea4852439b0ebb2f32a46873a3427d69f6f9da3a9d3");
assert.equal(digestReceipt(receipt), receipt.receiptDigest);
assert.deepEqual(schema.properties.receiptId.const, receipt.receiptId);
assert.deepEqual(schema.properties.parentReceipt.const, receipt.parentReceipt);
assert.deepEqual(schema.properties.scope.const, receipt.scope);
assert.deepEqual(schema.properties.beforeCanonical.const, receipt.beforeCanonical);
assert.deepEqual(schema.properties.afterCanonical.const, receipt.afterCanonical);
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest);
assert.equal(parent.afterCanonical.sha256, receipt.parentReceipt.afterCanonicalSha256);
const canonicalBytes = receiptChain.snapshots.orientationAfter.bytes;
assert.equal(canonicalBytes.length, receipt.afterCanonical.bytes);
assert.equal(sha(canonicalBytes), receipt.afterCanonical.sha256);
const canonical = JSON.parse(canonicalBytes);
const goal = canonical.goals.find((goal) => goal.id === receipt.scope.orientationGoalId);
assert(goal, "orientation goal missing");
const outlookPath = goal.extendedData.orientationOutlook.paths.find((entry) => entry.id === receipt.scope.orientationPathId);
assert(outlookPath, "orientation path missing");
assert.deepEqual(outlookPath.milestoneGoalIds, [
  "83a5546e-0ea6-576e-83e2-3387b30872bb",
  "e495fa38-b198-5280-a405-9e41cafd6d17",
  "d1910e24-bd21-4b51-9f9a-d8c5c5e63e5b",
  "5c9ac68c-3928-518c-bbe0-e044667035a6",
]);
const reconstructed = structuredClone(canonical);
const reconstructedGoal = reconstructed.goals.find((goal) => goal.id === receipt.scope.orientationGoalId);
const reconstructedPath = reconstructedGoal.extendedData.orientationOutlook.paths.find((entry) => entry.id === receipt.scope.orientationPathId);
for (const change of receipt.changes) {
  const index = reconstructedPath.milestoneGoalIds.indexOf(change.newGoalId);
  assert.notEqual(index, -1, `${change.newGoalId} missing from current milestones`);
  reconstructedPath.milestoneGoalIds[index] = change.oldGoalId;
}
const reconstructedBytes = Buffer.from(`${JSON.stringify(reconstructed, null, 2)}
`, "utf8");
assert.equal(reconstructedBytes.length, receipt.beforeCanonical.bytes);
assert.equal(sha(reconstructedBytes), receipt.beforeCanonical.sha256);
for (const field of receipt.scope.excludedCanonicalFields) {
  assert.deepEqual(reconstructedGoal[field], goal[field], `${field} changed across narrow milestone follow-up`);
}
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
console.log(JSON.stringify({ result: "PASS", receiptDigest: receipt.receiptDigest, beforeCanonicalSha256: receipt.beforeCanonical.sha256, afterCanonicalSha256: receipt.afterCanonical.sha256, currentLeafCanonicalSha256: receiptChain.snapshots.current.binding.sha256, changedScalarCount: receipt.scope.changedScalarCount }, null, 2));
