#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { validateStructuralSplitReceiptChain } from "./canonical-math-structural-split-receipt-chain.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptChain = validateStructuralSplitReceiptChain({ here, repoRoot });
const receiptPath = path.join(here, "canonical-math-structural-split-composition-view-follow-up-2026-08-16.receipt.json");
const schemaPath = path.join(here, "canonical-math-structural-split-composition-view-follow-up.receipt.schema.json");
const structuralReceiptPath = path.join(here, "canonical-math-structural-splits-2026-08-16.receipt.json");
const receipt = JSON.parse(fs.readFileSync(receiptPath, "utf8"));
const schema = JSON.parse(fs.readFileSync(schemaPath, "utf8"));
const structuralReceipt = JSON.parse(fs.readFileSync(structuralReceiptPath, "utf8"));
const parent = JSON.parse(fs.readFileSync(path.join(repoRoot, receipt.parentReceipt.path), "utf8"));
const sha = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const historicalBytes = (relativePath) => receiptChain.historicalFileBytes(relativePath);
const fileSha = (relativePath) => sha(historicalBytes(relativePath));
const digestReceipt = (value) => {
  const clone = structuredClone(value);
  delete clone.receiptDigest;
  return sha(Buffer.from(JSON.stringify(clone), "utf8"));
};
const walkNodes = (nodes, visit) => {
  for (const node of nodes ?? []) {
    visit(node);
    walkNodes(node.children, visit);
  }
};
const nodeAtPointer = (document, pointer) => pointer
  .split("/")
  .slice(1)
  .reduce((value, token) => value[token.replaceAll("~1", "/").replaceAll("~0", "~")], document);

assert.deepEqual(schema.properties.scope.const, receipt.scope);
assert.equal(digestReceipt(receipt), receipt.receiptDigest, "receipt digest drift");
assert.equal(receipt.receiptDigest, "8552324ee86ad4237df45041c2fe3b112a3775fee053bd882e55de7cb2c49f7c");
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest, "parent receipt digest drift");
assert.equal(parent.receiptDigest, "2a1772ddd1f67a4388b8978b6204c832b7c0c9065007b354cdee3cfb946c59dd");
assert.equal(parent.afterFiles.find((entry) => entry.path === receipt.canonicalBinding.path)?.sha256, receipt.parentReceipt.afterCanonicalSha256);
assert.equal(fileSha(receipt.canonicalBinding.path), receipt.canonicalBinding.sha256, "historical canonical changed during view follow-up");
assert.equal(receipt.canonicalBinding.sha256, receiptChain.snapshots.current.binding.sha256, "composition leaf does not match complete receipt chain");
assert.equal(receipt.canonicalBinding.unchangedByThisFollowUp, true);

assert.deepEqual(receipt.counts, {
  viewFileCount: 88,
  changedViewCount: 87,
  directReferenceViewCount: 57,
  indirectAncestorViewCount: 30,
  unaffectedViewCount: 1,
  generatedDurationViewCount: 18,
  errorViewCount: 0,
  candidateDuplicateGoalCount: 0,
  candidateMultipleParentGoalCount: 0,
  candidateSubtreeOverlapCount: 0,
  missingAtomicGoalCount: 0,
  unexpectedAtomicGoalCount: 0,
  memoryVisibilityViewCount: 2,
  memoryVisibilityAddedViewCount: 2,
  oldClusterReferenceCount: 227,
  oldClusterReferenceFileCount: 57,
  reusedChildParentPolicyCount: 11,
  splitPlacementCount: 39,
});
assert.equal(receipt.viewFiles.length, 88);
assert.equal(new Set(receipt.viewFiles.map((entry) => entry.path)).size, 88, "duplicate view receipt paths");
assert.equal(receipt.viewFiles.filter((entry) => entry.changed).length, 87);
assert.equal(receipt.viewFiles.filter((entry) => entry.migrationClass === "direct_old_cluster_reference").length, 57);
assert.equal(receipt.viewFiles.filter((entry) => entry.migrationClass === "indirect_ancestor_expansion").length, 30);
assert.equal(receipt.viewFiles.filter((entry) => entry.migrationClass === "unaffected").length, 1);
assert.equal(receipt.viewFiles.reduce((count, entry) => count + entry.directOldClusterReferenceCount, 0), 227);

const oldClusterIds = new Set(structuralReceipt.splits.map((split) => split.oldGoalId));
assert.equal(oldClusterIds.size, 25);
for (const expected of receipt.viewFiles) {
  const bytes = historicalBytes(expected.path);
  assert.equal(bytes.length, expected.afterBytes, expected.path + " byte count");
  assert.equal(sha(bytes), expected.afterSha256, expected.path + " SHA-256");
  const view = JSON.parse(bytes);
  walkNodes(view.rootNodes, (node) => {
    if (node.kind === "goalEntry") assert(!oldClusterIds.has(node.goalId), `${expected.path}: retained split cluster used as goalEntry ${node.goalId}`);
  });
}

assert.equal(receipt.memoryVisibilityChanges.length, 2);
for (const change of receipt.memoryVisibilityChanges) {
  const view = JSON.parse(historicalBytes(change.file));
  const node = nodeAtPointer(view, change.candidatePointer);
  assert.deepEqual(node, { kind: "canonicalSubtree", goalId: change.memoryGoalId }, change.file + " memory insertion");
  assert.equal(fileSha(change.file), change.candidateSha256);
}

assert.equal(receipt.reusedChildParentPolicies.length, 11);
assert.equal(new Set(receipt.reusedChildParentPolicies.map((entry) => entry.childGoalId)).size, 11);
assert(receipt.reusedChildParentPolicies.every((entry) => oldClusterIds.has(entry.oldClusterGoalId)));

const generator = receipt.generatorChange;
assert.equal(fileSha(generator.path), generator.afterSha256, "duration generator SHA-256");
assert.equal(generator.afterSha256, "1c2effc5ba162421dada2ae2c1d7cf14f858ff8d297250fc6b9d705958eedfb0");
assert.equal(fileSha(generator.trackedLayoutConfig.path), generator.trackedLayoutConfig.sha256, "duration policy SHA-256");
assert.equal(generator.trackedLayoutConfig.sha256, "6d653bc928389ae1013e2ae6ed7c0be2893aaed75c89834f5e26725219200b63");
const policy = JSON.parse(historicalBytes(generator.trackedLayoutConfig.path));
assert.equal(policy.status, "APPROVED_REVIEWED_LAYOUT");
assert.equal(policy.inputs.canonical.sha256, receipt.canonicalBinding.sha256);
assert.equal(policy.inputs.parentDerivativeReceipt.receiptDigest, receipt.parentReceipt.receiptDigest);
assert.equal(policy.inputs.extractionProvenance.runtimeDependency, false);
assert.equal(policy.counts.sek1TemplateCount, 6);
assert.equal(policy.counts.splitPlacementCount, 39);
assert.equal(policy.counts.crossStageOutputCount, 12);
assert.equal(policy.counts.totalOutputCount, 18);
assert.equal(policy.sek1Templates.length, 6);
assert.equal(policy.crossStageTemplates.length, 12);
assert.equal(policy.sek1Templates.reduce((count, template) => count + template.placements.length, 0), 39);
assert(policy.policy.transform[4].includes("actualAfter equals (flatBefore minus the union of removeAtomicGoalIds) union the atomic closure"));
assert(policy.policy.transform[4].includes("preservedReusedGoalId"));
for (const template of policy.sek1Templates) {
  const relativePath = `curricula/DE/Gymnasium/composition-views/mathematik/${template.fileName}`;
  assert.equal(fileSha(relativePath), template.fileSha256, relativePath);
}
for (const template of policy.crossStageTemplates) {
  const relativePath = `curricula/DE/Gymnasium/composition-views/mathematik/${template.outputFileName}`;
  assert.equal(fileSha(relativePath), template.outputSha256, relativePath);
}

assert.equal(receipt.validation.compositionViewCompiler.viewCount, 297);
assert.equal(receipt.validation.compositionViewCompiler.errors, 0);
assert.equal(receipt.validation.compositionViewCompiler.warnings, 0);
assert.equal(receipt.validation.durationGenerator.outputCount, 18);
assert.equal(receipt.validation.durationGenerator.byteStable, true);
assert.equal(receipt.validation.memoryCardVisibility.reviewedCases, 17);
assert.equal(receipt.validation.memoryCardVisibility.missingMemoryNodes, 0);
assert.equal(receipt.validation.applicability.errors, 0);
assert.equal(receipt.validation.applicability.warnings, 0);
assert.equal(receipt.validation.freeze, "PASS");
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);

const run = (command, args, cwd = repoRoot) => {
  const result = spawnSync(command, args, { cwd, encoding: "utf8", stdio: "pipe" });
  assert.equal(result.status, 0, `${command} ${args.join(" ")} failed\n${result.stdout}\n${result.stderr}`);
  return `${result.stdout}\n${result.stderr}`;
};
const durationOutput = run("npm", ["run", "--silent", "check:math-duration-composition-views"], path.join(repoRoot, "app"));
assert.equal(durationOutput.split("\n").filter((line) => line.startsWith("ok ")).length, 18);
const compositionOutput = run("npm", ["run", "--silent", "validate:composition-views"], path.join(repoRoot, "app"));
assert.match(compositionOutput, /297/);
const memoryOutput = run("npm", ["run", "--silent", "quality:memory-card-review:check"], path.join(repoRoot, "app"));
assert.match(memoryOutput, /Memory-required goals without visible memory node:\s*0/i);
const applicabilityOutput = run("npm", ["run", "--silent", "validate:view-filters"], path.join(repoRoot, "app"));
assert.match(applicabilityOutput, /0 error/i);
run("node", ["scripts/check_openai_plugin_review_freeze.mjs"]);

console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  receiptFileSha256: fileSha(path.relative(repoRoot, receiptPath)),
  parentReceiptDigest: parent.receiptDigest,
  canonicalSha256: receipt.canonicalBinding.sha256,
  viewFiles: receipt.viewFiles.length,
  changedViews: receipt.counts.changedViewCount,
  generatorOutputs: policy.counts.totalOutputCount,
  compositionViewsCompiled: receipt.validation.compositionViewCompiler.viewCount,
}, null, 2));
