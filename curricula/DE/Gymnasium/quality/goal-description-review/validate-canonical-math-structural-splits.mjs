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
const receiptPath = path.join(here, "canonical-math-structural-splits-2026-08-16.receipt.json");
const schemaPath = path.join(here, "canonical-math-structural-splits.receipt.schema.json");
const phaseFollowUpPath = path.join(
  here,
  "canonical-math-structural-split-phase-follow-up-2026-08-16.receipt.json",
);
const weightFollowUpPath = path.join(
  here,
  "canonical-math-structural-split-weight-closure-follow-up-2026-08-16.receipt.json",
);
const canonicalPath = "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json";
const provenancePath = "curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json";

const expectedIncludedSplitCodes = [
  "S01", "S02", "S03", "S04", "S06", "S07", "S08", "S09", "S10",
  "S11", "S12", "S13", "S14", "S15", "S16", "S17", "S18", "S19",
  "S20", "S21", "S22", "S23", "S25", "S26", "S27",
];
const expectedDesignDigests = {
  manifestSha256: "b0629a0fb93d8b1e862443700a41f8a698cfc7485d862fc8e677cad749bc1070",
  inventorySha256: "515a1090a260022cc5cc0b357c552e3d5ae6b998d62ad8570fa323c1c29fcc37",
  sourceEdgeAdjudicationsSha256: "cb15ade2dadad4f6a6c7a583d50497a1eb1673e7b0d5cafd3b490add24abf4d0",
  applyPlanSha256: "430e8f668841a2fb65be1962ea860abcddccf60a63f91e87eea3d84b52e1b47b",
  applyPlanDigest: "70048d02ded23eeabae0429b1ed583a6557663ecdc5fd253456dfe6ec4b4e282",
};
const expectedCounts = {
  splitClusters: 25,
  newAtomicGoals: 49,
  reusedChildReferences: 11,
  logicalSourceEdges: 451,
  physicalSourceOccurrences: 836,
  multiSplitPhysicalMerges: 8,
  provenanceActions: 85,
};

const readBytes = (relativePath) => fs.readFileSync(path.resolve(repoRoot, relativePath));
const readJson = (relativePath) => JSON.parse(readBytes(relativePath));
const sha256Bytes = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const sourceId = (entry) => entry.legacyGoalId ?? entry.sourceGoalId;
const clone = (value) => structuredClone(value);
const unique = (values) => [...new Set(values)];

assert.equal(fs.existsSync(receiptPath), true, `missing structural split receipt: ${receiptPath}`);
assert.equal(fs.existsSync(schemaPath), true, `missing structural split receipt schema: ${schemaPath}`);
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const phaseFollowUp = fs.existsSync(phaseFollowUpPath)
  ? JSON.parse(fs.readFileSync(phaseFollowUpPath, "utf8"))
  : null;
const weightFollowUp = fs.existsSync(weightFollowUpPath)
  ? JSON.parse(fs.readFileSync(weightFollowUpPath, "utf8"))
  : null;

const digestPayload = clone(receipt);
delete digestPayload.receiptDigest;
assert.equal(
  receipt.receiptDigest,
  sha256Bytes(Buffer.from(JSON.stringify(digestPayload), "utf8")),
  "receiptDigest does not bind the exact receipt payload",
);
assert.equal(receipt.schemaVersion, 1);
assert.equal(receipt.receiptId, "canonical-math-structural-splits-2026-08-16-v1");
assert.equal(receipt.status, "applied-locally-not-committed");
assert.deepEqual(receipt.authorization.includedSplitCodes, expectedIncludedSplitCodes);
assert.deepEqual(receipt.authorization.explicitlyExcludedSplitCodes, ["S05", "S24"]);
assert.equal(receipt.authorization.automaticWithoutFurtherProductOwnerDecision, true);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(
  receipt.authorization.originalReconciliationDigest,
  "sha256:a82a7ba8d16e651ab7b070f6128e5d486ad4bf40b115804ae1d3a974b3018d32",
);
assert.equal(receipt.frozenContractBoundary.affectsOpenAiCoachV1Contract, false);
assert.deepEqual(receipt.designDigests, expectedDesignDigests);
assert.deepEqual(receipt.counts, expectedCounts);
assert.equal(schema.properties.designDigests.properties.applyPlanSha256.const, expectedDesignDigests.applyPlanSha256);
assert.equal(schema.properties.receiptId.const, receipt.receiptId);
assert.deepEqual(schema.properties.authorization.properties.includedSplitCodes.const, expectedIncludedSplitCodes);

const postApplyBindingOverrides = new Map();
const followedUpRequires = new Map();
const followedUpWeights = new Map();
if (phaseFollowUp) {
  const followUpDigestPayload = clone(phaseFollowUp);
  delete followUpDigestPayload.receiptDigest;
  assert.equal(
    phaseFollowUp.receiptDigest,
    sha256Bytes(Buffer.from(JSON.stringify(followUpDigestPayload), "utf8")),
    "phase follow-up receipt digest drift",
  );
  assert.equal(phaseFollowUp.parentReceipt.receiptDigest, receipt.receiptDigest);
  assert.equal(phaseFollowUp.parentReceipt.applyPlanSha256, receipt.designDigests.applyPlanSha256);
  assert.equal(phaseFollowUp.parentReceipt.applyPlanDigest, receipt.designDigests.applyPlanDigest);
  const parentBinding = receipt.postApplyDigests.find(
    (binding) => binding.path === phaseFollowUp.beforeCanonical.path,
  );
  assert.deepEqual(parentBinding, phaseFollowUp.beforeCanonical, "phase follow-up does not start at parent canonical digest");
  postApplyBindingOverrides.set(phaseFollowUp.afterCanonical.path, phaseFollowUp.afterCanonical);
  for (const change of phaseFollowUp.changes) followedUpRequires.set(change.goalId, change.afterRequires);
}
if (weightFollowUp) {
  assert(phaseFollowUp, "weight follow-up requires the phase follow-up receipt");
  const weightFollowUpDigestPayload = clone(weightFollowUp);
  delete weightFollowUpDigestPayload.receiptDigest;
  assert.equal(
    weightFollowUp.receiptDigest,
    sha256Bytes(Buffer.from(JSON.stringify(weightFollowUpDigestPayload), "utf8")),
    "weight follow-up receipt digest drift",
  );
  assert.equal(weightFollowUp.parentReceipt.receiptDigest, phaseFollowUp.receiptDigest);
  assert.equal(weightFollowUp.parentReceipt.afterCanonicalSha256, phaseFollowUp.afterCanonical.sha256);
  assert.deepEqual(weightFollowUp.beforeCanonical, phaseFollowUp.afterCanonical);
  assert.equal(weightFollowUp.structuralReceipt.receiptDigest, receipt.receiptDigest);
  assert.equal(weightFollowUp.structuralReceipt.applyPlanSha256, receipt.designDigests.applyPlanSha256);
  assert.equal(weightFollowUp.structuralReceipt.applyPlanDigest, receipt.designDigests.applyPlanDigest);
  postApplyBindingOverrides.set(weightFollowUp.afterCanonical.path, weightFollowUp.afterCanonical);
  for (const change of weightFollowUp.corrected) followedUpWeights.set(change.goalId, change.afterWeight);
}

assert.equal(receipt.splits.length, 25);
assert.deepEqual(receipt.splits.map((split) => split.code), expectedIncludedSplitCodes);
assert.equal(new Set(receipt.splits.map((split) => split.oldGoalId)).size, 25);
assert.equal(receipt.splits.some((split) => ["S05", "S24"].includes(split.code)), false);
assert.equal(receipt.splits.flatMap((split) => split.children).filter((child) => child.kind === "new").length, 49);
assert.equal(receipt.splits.flatMap((split) => split.children).filter((child) => child.kind === "reused").length, 11);

assert.equal(receipt.postApplyDigests.length, 46);
assert.equal(new Set(receipt.postApplyDigests.map((entry) => entry.path)).size, receipt.postApplyDigests.length);
for (const binding of receipt.postApplyDigests) {
  assert.equal(binding.path.startsWith("curricula/DE/Gymnasium/"), true, `out-of-scope path in receipt: ${binding.path}`);
  const isCanonicalBinding = binding.path === canonicalPath;
  const effectiveBinding = isCanonicalBinding ? binding : postApplyBindingOverrides.get(binding.path) ?? binding;
  const bytes = isCanonicalBinding
    ? receiptChain.snapshots.structuralAfter.bytes
    : receiptChain.historicalFileBytes(binding.path);
  assert.equal(bytes.length, effectiveBinding.bytes, `${binding.path}: byte length drift`);
  assert.equal(sha256Bytes(bytes), effectiveBinding.sha256, `${binding.path}: post-apply digest drift`);
}
const boundPaths = new Set(receipt.postApplyDigests.map((entry) => entry.path));
assert.equal(boundPaths.has(canonicalPath), true);
assert.equal(boundPaths.has(provenancePath), true);

const canonical = structuredClone(receiptChain.snapshots.structuralAfter.value);
const goalsById = new Map(canonical.goals.map((goal) => [goal.id, goal]));
assert.equal(goalsById.size, canonical.goals.length, "duplicate canonical goal IDs");
assert.equal(canonical.goals.length, 1130, "unexpected canonical goal count after 49 new atoms");
const oldGoalIds = new Set(receipt.splits.map((split) => split.oldGoalId));

for (const split of receipt.splits) {
  const cluster = goalsById.get(split.oldGoalId);
  assert(cluster, `${split.code}: retained cluster is missing`);
  for (const field of ["title", "titleEn", "description", "descriptionEn", "type", "weight", "requires", "contains"]) {
    const expectedValue = split.clusterConversion[field];
    assert.deepEqual(cluster[field], expectedValue, `${split.code}: cluster ${field} drift`);
  }
  assert.equal(cluster.type, "cluster", `${split.code}: retained node is not a cluster`);
  assert.equal(Object.hasOwn(cluster, "semanticAtomic"), false, `${split.code}: cluster remains semanticAtomic`);
  assert.equal(
    (cluster.resourceLinks ?? []).some((link) => link?.type === "goal-visualization" && link?.role === "primary"),
    false,
    `${split.code}: broad legacy primary visual remains attached to split cluster`,
  );
  assert.deepEqual(cluster.contains, split.children.map((child) => child.goalId), `${split.code}: child order drift`);

  for (const childReceipt of split.children) {
    const child = goalsById.get(childReceipt.goalId);
    assert(child, `${split.code}: child ${childReceipt.goalId} is missing`);
    assert.equal(child.title, childReceipt.title, `${split.code}/${child.id}: title drift`);
    assert.equal(child.titleEn, childReceipt.titleEn, `${split.code}/${child.id}: English title drift`);
    assert.equal(child.description, childReceipt.description, `${split.code}/${child.id}: description drift`);
    assert.equal(child.descriptionEn, childReceipt.descriptionEn, `${split.code}/${child.id}: English description drift`);
    const expectedRequires = childReceipt.requires;
    assert.deepEqual(child.requires ?? [], expectedRequires, `${split.code}/${child.id}: requires drift`);
    if (childReceipt.kind === "new") {
      assert.equal(child.type, "atomic", `${split.code}/${child.id}: new child is not atomic`);
      assert.equal(child.semanticAtomic, true, `${split.code}/${child.id}: new child is not marked semanticAtomic`);
      assert.deepEqual(child.contains, [], `${split.code}/${child.id}: new child contains subgoals`);
    }
  }

  if (split.parentRestructure) {
    const parent = goalsById.get(split.parentRestructure.parentGoalId);
    assert(parent, `${split.code}: restructure parent is missing`);
    for (const removedId of split.parentRestructure.removeDirectChildIds) {
      assert.equal(parent.contains.includes(removedId), false, `${split.code}: reused child remains duplicated under parent`);
    }
  }
  for (const downstream of split.downstreamReferencePlan) {
    const dependent = goalsById.get(downstream.dependentGoalId);
    assert(dependent, `${split.code}: downstream goal is missing`);
    assert.equal(dependent.requires.includes(split.oldGoalId), false, `${split.code}: old downstream prerequisite remains`);
    for (const replacementId of downstream.replaceOldGoalIdInRequiresWith) {
      assert.equal(dependent.requires.includes(replacementId), true, `${split.code}: downstream replacement is missing`);
    }
  }
  for (const assessmentPlan of split.assessmentReferencePlan) {
    const assessment = goalsById.get(assessmentPlan.assessmentGoalId);
    assert(assessment?.examData, `${split.code}: assessment is missing`);
    assert.equal(assessment.requires.includes(split.oldGoalId), false, `${split.code}: old assessment prerequisite remains`);
    assert.equal(assessment.examData.coveredGoalIds.includes(split.oldGoalId), false, `${split.code}: old coverage remains`);
    for (const replacementId of assessmentPlan.replaceOldGoalIdInRequiresWith) {
      assert.equal(assessment.requires.includes(replacementId), true, `${split.code}: assessment prerequisite replacement missing`);
    }
    for (const replacementId of assessmentPlan.replaceOldGoalIdInCoveredGoalIdsWith) {
      assert.equal(assessment.examData.coveredGoalIds.includes(replacementId), true, `${split.code}: assessment coverage replacement missing`);
    }
    for (const removedId of assessmentPlan.removeGoalIdsFromRequires) {
      assert.equal(assessment.requires.includes(removedId), false, `${split.code}: explicitly removed prerequisite remains`);
    }
    for (const removedId of assessmentPlan.removeGoalIdsFromCoveredGoalIds) {
      assert.equal(assessment.examData.coveredGoalIds.includes(removedId), false, `${split.code}: explicitly removed coverage remains`);
    }
    assert.deepEqual(assessment.requires, assessment.examData.coveredGoalIds, `${split.code}: assessment graph mismatch`);
  }
}

for (const goal of canonical.goals) {
  for (const prerequisite of goal.requires ?? []) {
    assert.equal(goalsById.has(prerequisite), true, `${goal.id}: unknown requires target ${prerequisite}`);
    assert.equal(oldGoalIds.has(prerequisite), false, `${goal.id}: retained split cluster remains in requires`);
  }
  for (const child of goal.contains ?? []) {
    assert.equal(goalsById.has(child), true, `${goal.id}: unknown contains target ${child}`);
  }
  for (const coveredGoalId of goal.examData?.coveredGoalIds ?? []) {
    assert.equal(goalsById.has(coveredGoalId), true, `${goal.id}: unknown assessment target ${coveredGoalId}`);
    assert.equal(oldGoalIds.has(coveredGoalId), false, `${goal.id}: retained split cluster remains in assessment coverage`);
  }
  assert.equal(new Set(goal.requires ?? []).size, (goal.requires ?? []).length, `${goal.id}: duplicate requires entries`);
  assert.equal(new Set(goal.contains ?? []).size, (goal.contains ?? []).length, `${goal.id}: duplicate contains entries`);
}

function assertAcyclic(field) {
  const visiting = new Set();
  const visited = new Set();
  const visit = (goalId) => {
    if (visited.has(goalId)) return;
    assert.equal(visiting.has(goalId), false, `${field} cycle at ${goalId}`);
    visiting.add(goalId);
    for (const target of goalsById.get(goalId)?.[field] ?? []) visit(target);
    visiting.delete(goalId);
    visited.add(goalId);
  };
  for (const goalId of goalsById.keys()) visit(goalId);
}
assertAcyclic("requires");
assertAcyclic("contains");

assert.equal(receipt.sourceEdgeDecisions.length, 451);
assert.equal(new Set(receipt.sourceEdgeDecisions.map((edge) => edge.edgeId)).size, 451, "duplicate logical edge IDs");
assert.equal(receipt.sourceEdgeDecisions.flatMap((edge) => edge.occurrences).length, 844);
assert.equal(
  new Set(receipt.sourceEdgeDecisions.flatMap((edge) => edge.occurrences.map((occurrence) =>
    [edge.mappingFile, occurrence.collection, occurrence.index, occurrence.field].join("|"),
  ))).size,
  836,
  "physical occurrence count does not match reviewed atomic merge plan",
);
const retainedAggregateEdges = receipt.sourceEdgeDecisions.filter((edge) => edge.retainOldClusterMapping);
assert.equal(retainedAggregateEdges.length, 1, "unexpected retained aggregate logical-edge count");
assert.equal(
  retainedAggregateEdges.flatMap((edge) => edge.occurrences).length,
  2,
  "unexpected retained aggregate physical-occurrence count",
);
const mappingFiles = unique(receipt.sourceEdgeDecisions.map((edge) => edge.mappingFile)).sort();
assert.equal(mappingFiles.length, 38);
for (const mappingFile of mappingFiles) assert.equal(boundPaths.has(mappingFile), true, `${mappingFile}: missing post-apply binding`);

const mappingDocuments = new Map(mappingFiles.map((mappingFile) => [
  mappingFile,
  JSON.parse(receiptChain.historicalFileBytes(mappingFile)),
]));
for (const [mappingFile, document] of mappingDocuments) {
  const rawPairs = new Set();
  const decisionPairs = new Set();
  for (const decision of document.decisions ?? []) {
    assert.equal(decision.decision, "mapped", `${mappingFile}: non-mapped authoritative decision remains`);
    assert.equal(Array.isArray(decision.canonicalGoalIds) && decision.canonicalGoalIds.length > 0, true, `${mappingFile}: empty decision`);
    assert.equal(new Set(decision.canonicalGoalIds).size, decision.canonicalGoalIds.length, `${mappingFile}: duplicate decision target`);
    for (const goalId of decision.canonicalGoalIds) {
      assert.equal(goalsById.has(goalId), true, `${mappingFile}: unknown authoritative target ${goalId}`);
      const key = `${sourceId(decision)}|${goalId}`;
      assert.equal(decisionPairs.has(key), false, `${mappingFile}: duplicate authoritative mapping ${key}`);
      decisionPairs.add(key);
    }
  }
  for (const mapping of document.mappings ?? []) {
    const key = `${sourceId(mapping)}|${mapping.canonicalGoalId}`;
    if ((document.decisions ?? []).length > 0) {
      assert.equal(goalsById.has(mapping.canonicalGoalId), true, `${mappingFile}: unknown reviewed raw target ${mapping.canonicalGoalId}`);
    }
    assert.equal(rawPairs.has(key), false, `${mappingFile}: duplicate raw mapping ${key}`);
    rawPairs.add(key);
    if ((document.decisions ?? []).length > 0) {
      assert.equal(decisionPairs.has(key), true, `${mappingFile}: raw mapping lacks authoritative decision ${key}`);
    }
  }
}

const sourceRouteGroups = new Map();
for (const edge of receipt.sourceEdgeDecisions) {
  assert.equal(expectedIncludedSplitCodes.includes(edge.splitCode), true, `${edge.edgeId}: out-of-scope split code`);
  assert.equal(oldGoalIds.has(edge.oldGoalId), true, `${edge.edgeId}: unknown split parent`);
  for (const targetId of edge.replacementTargetGoalIds) {
    assert.equal(goalsById.has(targetId), true, `${edge.edgeId}: unknown routed target ${targetId}`);
  }
  const key = `${edge.mappingFile}|${edge.sourceGoalId}|${edge.oldGoalId}`;
  const group = sourceRouteGroups.get(key) ?? {
    mappingFile: edge.mappingFile,
    sourceGoalId: edge.sourceGoalId,
    oldGoalId: edge.oldGoalId,
    targetIds: [],
    retainOldClusterMapping: false,
  };
  group.targetIds.push(...edge.replacementTargetGoalIds);
  group.retainOldClusterMapping ||= edge.retainOldClusterMapping;
  sourceRouteGroups.set(key, group);
}
for (const group of sourceRouteGroups.values()) {
  const document = mappingDocuments.get(group.mappingFile);
  const actualTargets = new Set([
    ...(document.mappings ?? [])
      .filter((entry) => sourceId(entry) === group.sourceGoalId)
      .map((entry) => entry.canonicalGoalId),
    ...(document.decisions ?? [])
      .filter((entry) => sourceId(entry) === group.sourceGoalId)
      .flatMap((entry) => entry.canonicalGoalIds),
  ]);
  for (const targetId of unique(group.targetIds)) {
    assert.equal(actualTargets.has(targetId), true, `${group.mappingFile}/${group.sourceGoalId}: routed target ${targetId} missing`);
  }
  assert.equal(
    actualTargets.has(group.oldGoalId),
    group.retainOldClusterMapping,
    `${group.mappingFile}/${group.sourceGoalId}: retained-cluster disposition drift`,
  );
}

const provenance = JSON.parse(receiptChain.historicalFileBytes(provenancePath));
const provenanceLandscape = provenance.landscapes.find((entry) => entry.landscapeId === canonical.landscapeId);
assert(provenanceLandscape, "canonical provenance landscape is missing");
assert.equal(receipt.provenanceActions.length, 85);
for (const action of receipt.provenanceActions) {
  const actual = provenanceLandscape.goalProvenance[action.goalId];
  if (["retain_existing", "preserve_existing_reused_goal_provenance"].includes(action.action)) {
    assert.deepEqual(actual, action.existingProvenance, `${action.goalId}: retained provenance drift`);
  } else if (action.action === "remove_from_registry") {
    assert.equal(actual, undefined, `${action.goalId}: removed broad provenance remains`);
  } else if (["add_new_goal_provenance", "add_missing_provenance_to_reused_goal"].includes(action.action)) {
    assert.deepEqual(actual, action.newProvenance, `${action.goalId}: new provenance drift`);
  } else {
    assert.fail(`unknown provenance action ${action.action}`);
  }
}
for (const split of receipt.splits) {
  for (const child of split.children.filter((entry) => entry.kind === "new")) {
    assert(provenanceLandscape.goalProvenance[child.goalId], `${split.code}/${child.goalId}: new goal lacks provenance`);
  }
}

assert.equal(receipt.assessmentArtifactMigrations.length, 2);
for (const migration of receipt.assessmentArtifactMigrations) {
  for (const targetField of ["targetDraftPath", "targetSolutionPath", "targetReviewPath"]) {
    assert.equal(boundPaths.has(migration[targetField]), true, `${migration.migrationId}: ${targetField} is not digest-bound`);
  }
  for (const update of migration.canonicalTaskUpdates) {
    const assessment = goalsById.get(update.assessmentGoalId);
    assert(assessment?.examData, `${migration.migrationId}: canonical assessment is missing`);
    assert.equal(assessment.sourceRef, update.sourceRef, `${migration.migrationId}: sourceRef drift`);
    assert.equal(assessment.examData.sourceArtifactPath, update.sourceArtifactPath, `${migration.migrationId}: source artifact drift`);
    assert.equal(assessment.examData.reviewNote, update.reviewNote, `${migration.migrationId}: review note drift`);
  }
}
const j8Draft = fs.readFileSync(path.resolve(repoRoot, "curricula/DE/Gymnasium/assessments/mathematik/seki/j8/draft_v3.md"), "utf8");
assert.equal(j8Draft.includes("$3$ Hefte und $2$ Stifte und kostet $17"), true, "J8 v3 first package is missing");
assert.equal(j8Draft.includes("$1$ Heft und $4$ Stifte und kostet $13"), true, "J8 v3 second package is missing");
assert.equal(j8Draft.includes("A(x)=40+6x") && j8Draft.includes("B(x)=10+9x"), true, "J8 v3 inequality context is missing");
assert.equal(j8Draft.includes("Konstruktion der beiden Tangenten"), true, "J8 v3 tangent plural correction is missing");
const q4Solution = fs.readFileSync(path.resolve(repoRoot, "curricula/DE/Gymnasium/assessments/mathematik/sekii/q4/complex-numbers/solution_v2.md"), "utf8");
assert.equal(q4Solution.includes("Lösungen in ℂ korrekt berechnet"), true, "Q4 complex scoring correction is missing");
assert.equal(q4Solution.includes("Lösungen in ℝ korrekt berechnet"), false, "Q4 obsolete real-number scoring remains");

console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  designDigests: receipt.designDigests,
  counts: receipt.counts,
  canonicalGoalCount: canonical.goals.length,
  affectedMappingFiles: mappingFiles.length,
  sourceOccurrenceCount: receipt.sourceEdgeDecisions.flatMap((edge) => edge.occurrences).length,
  phaseFollowUpReceiptDigest: phaseFollowUp?.receiptDigest ?? null,
  weightFollowUpReceiptDigest: weightFollowUp?.receiptDigest ?? null,
}, null, 2));
