#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const args = Object.fromEntries(process.argv.slice(2).map((arg) => {
  const [key, ...rest] = arg.replace(/^--/, "").split("=");
  return [key, rest.join("=")];
}));
const repoRoot = path.resolve(args["repo-root"] ?? path.join(here, "../../../../../"));
const candidateRoot = path.resolve(args["candidate-root"] ?? process.env.SKILLPILOT_LAYER_A_CANDIDATE_ROOT ?? "");
assert(candidateRoot && fs.existsSync(candidateRoot), "--candidate-root=<path> is required");
const bundleDir = path.resolve(args["bundle-dir"] ?? here);
const expectedHead = "971fc19f963010a638771a8b06a39fa4123d6928";
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const digest = (doc, field) => { const copy = structuredClone(doc); delete copy[field]; return sha256(Buffer.from(JSON.stringify(copy), "utf8")); };
const git = (cwd, argv, encoding = "utf8") => execFileSync("git", argv, { cwd, encoding, maxBuffer: 1024 * 1024 * 256 });
const baselineBytes = (rel) => {
  try {
    execFileSync("git", ["cat-file", "-e", expectedHead + ":" + rel], { cwd: repoRoot, stdio: "ignore" });
    return git(repoRoot, ["show", expectedHead + ":" + rel], null);
  } catch { return null; }
};
const fileBinding = (root, rel) => { const bytes = fs.readFileSync(path.join(root, rel)); return { bytes: bytes.length, sha256: sha256(bytes) }; };
const splitNul = (value) => value.split("\0").filter(Boolean);
const withoutGoals = (canonical) => { const copy = structuredClone(canonical); delete copy.goals; return copy; };
const reconstructCanonicalBefore = (current, reversal) => {
  assert.deepEqual(withoutGoals(current), reversal.afterTopLevel, "canonical reversal top-level after-state drift");
  const currentById = new Map(current.goals.map((goal) => [goal.id, goal]));
  const beforeById = new Map(currentById);
  for (const change of reversal.changedGoals) {
    assert.deepEqual(currentById.get(change.goalId), change.afterGoal, change.goalId + ": canonical reversal after-state drift");
    beforeById.set(change.goalId, change.beforeGoal);
  }
  for (const addition of reversal.addedGoals) {
    assert.deepEqual(currentById.get(addition.goalId), addition.afterGoal, addition.goalId + ": canonical reversal addition drift");
    beforeById.delete(addition.goalId);
  }
  for (const removal of reversal.removedGoals) beforeById.set(removal.goalId, removal.beforeGoal);
  const before = {};
  for (const key of reversal.beforeTopLevelKeyOrder) {
    before[key] = key === "goals"
      ? reversal.beforeGoalIds.map((goalId) => { const goal = beforeById.get(goalId); assert(goal, goalId + ": reversal goal missing"); return goal; })
      : reversal.beforeTopLevel[key];
  }
  return before;
};
const multisetEntries = (entries) => {
  const counts = new Map();
  for (const entry of entries) {
    const serialized = JSON.stringify(entry);
    counts.set(serialized, (counts.get(serialized) ?? 0) + 1);
  }
  return [...counts.entries()].sort(([left], [right]) => left.localeCompare(right));
};
const assertDeclaredMultisetReplay = (label, collection, before, after, changes) => {
  const counts = new Map(multisetEntries(before));
  const pointerIndex = (pointer, side) => {
    const prefix = "/" + collection + "/";
    assert.equal(typeof pointer, "string", label + ": missing " + side + " pointer");
    assert(pointer.startsWith(prefix), label + ": invalid " + side + " pointer " + pointer);
    const rawIndex = pointer.slice(prefix.length);
    const index = Number(rawIndex);
    assert(Number.isSafeInteger(index) && index >= 0 && String(index) === rawIndex, label + ": invalid " + side + " index " + rawIndex);
    return index;
  };
  const decrement = (value) => {
    const serialized = JSON.stringify(value);
    const count = counts.get(serialized) ?? 0;
    assert(count > 0, label + ": declared removal is absent from baseline multiset");
    if (count === 1) counts.delete(serialized);
    else counts.set(serialized, count - 1);
  };
  const increment = (value) => {
    const serialized = JSON.stringify(value);
    counts.set(serialized, (counts.get(serialized) ?? 0) + 1);
  };
  for (const change of changes) {
    assert(["add", "remove", "modify"].includes(change.action), label + ": invalid action " + change.action);
    if (change.action !== "add") {
      const index = pointerIndex(change.beforePointer, "before");
      assert.deepEqual(before[index], change.before, label + ": before pointer/object mismatch");
      decrement(change.before);
    }
    if (change.action !== "remove") {
      const index = pointerIndex(change.afterPointer, "after");
      assert.deepEqual(after[index], change.after, label + ": after pointer/object mismatch");
      increment(change.after);
    }
  }
  assert.deepEqual([...counts.entries()].sort(([left], [right]) => left.localeCompare(right)), multisetEntries(after),
    label + ": declared changes do not replay to the complete candidate multiset");
};

assert.equal(git(repoRoot, ["rev-parse", "HEAD"]).trim(), expectedHead, "repo HEAD drift");
assert.equal(git(candidateRoot, ["rev-parse", "HEAD"]).trim(), expectedHead, "candidate HEAD drift");
const plan = readJson(path.join(bundleDir, "plan.v3.json"));
const delta = readJson(path.join(bundleDir, "apply-delta.v2.json"));
const sourceStage = readJson(path.join(bundleDir, "source-stage.v2.json"));
const crossStage = readJson(path.join(bundleDir, "cross-subject-stage.v2.json"));
const receipt = readJson(path.join(bundleDir, "authority.receipt.json"));
const manifest = readJson(path.join(bundleDir, "bundle-manifest.json"));
assert.equal(digest(plan, "planDigest"), plan.planDigest, "plan digest drift");
assert.equal(digest(delta, "deltaDigest"), delta.deltaDigest, "delta digest drift");
assert.equal(digest(sourceStage, "stageDigest"), sourceStage.stageDigest, "source-stage digest drift");
assert.equal(digest(crossStage, "stageDigest"), crossStage.stageDigest, "cross-stage digest drift");
assert.equal(digest(receipt, "receiptDigest"), receipt.receiptDigest, "receipt digest drift");
assert.equal(digest(manifest, "bundleDigest"), manifest.bundleDigest, "bundle-manifest digest drift");
for (const entry of manifest.files) {
  const actual = fileBinding(bundleDir, entry.path);
  assert.deepEqual(actual, { bytes: entry.bytes, sha256: entry.sha256 }, entry.path + ": bundle file drift");
}
assert.equal(delta.bindings.plan.sha256, sha256(fs.readFileSync(path.join(bundleDir, "plan.v3.json"))), "delta plan binding drift");
assert.equal(receipt.immutableBindings.delta.sha256, sha256(fs.readFileSync(path.join(bundleDir, "apply-delta.v2.json"))), "receipt delta binding drift");
assert.equal(receipt.immutableBindings.schema.sha256, sha256(fs.readFileSync(path.join(bundleDir, "authority.receipt.schema.json"))), "receipt schema binding drift");
assert.equal(receipt.immutableBindings.validator.sha256, sha256(fs.readFileSync(path.join(bundleDir, "validate-authority.mjs"))), "receipt validator binding drift");
const reversal = receipt.canonicalReversal;
const candidateCanonicalBytes = fs.readFileSync(path.join(candidateRoot, reversal.path));
assert.deepEqual({ path: reversal.path, bytes: candidateCanonicalBytes.length, sha256: sha256(candidateCanonicalBytes) }, reversal.after, "canonical reversal after binding drift");
const reconstructedBeforeBytes = Buffer.from(JSON.stringify(reconstructCanonicalBefore(JSON.parse(candidateCanonicalBytes), reversal), null, 2) + "\n", "utf8");
assert.deepEqual({ path: reversal.path, bytes: reconstructedBeforeBytes.length, sha256: sha256(reconstructedBeforeBytes) }, reversal.before, "canonical reversal before binding drift");
assert.deepEqual(reconstructedBeforeBytes, baselineBytes(reversal.path), "canonical reversal does not reproduce baseline bytes");

for (const entry of delta.contentChangeSet.files) {
  const before = baselineBytes(entry.path);
  const afterPath = path.join(candidateRoot, entry.path);
  const after = fs.existsSync(afterPath) ? fs.readFileSync(afterPath) : null;
  assert.equal(before === null, entry.before === null, entry.path + ": before existence drift");
  assert.equal(after === null, entry.after === null, entry.path + ": after existence drift");
  if (before) assert.deepEqual({ bytes: before.length, sha256: sha256(before) }, { bytes: entry.before.bytes, sha256: entry.before.sha256 }, entry.path + ": before drift");
  if (after) assert.deepEqual({ bytes: after.length, sha256: sha256(after) }, { bytes: entry.after.bytes, sha256: entry.after.sha256 }, entry.path + ": after drift");
}
assert.equal(sha256(Buffer.from(JSON.stringify(delta.contentChangeSet.files), "utf8")), delta.contentChangeSet.inventoryDigest, "inventory digest drift");

for (const metadata of delta.authorityMetadataAdditions) {
  const candidate = fs.readFileSync(path.join(candidateRoot, metadata.path));
  const bundle = fs.readFileSync(path.join(bundleDir, metadata.sourceBundleFile));
  assert.deepEqual(candidate, bundle, metadata.path + ": candidate authority metadata differs from bundle");
}
const candidatePaths = [...new Set([
  ...splitNul(git(candidateRoot, ["diff", "--name-only", "-z", "HEAD"])),
  ...splitNul(git(candidateRoot, ["ls-files", "--others", "--exclude-standard", "-z"])),
])].sort();
const expectedPaths = [...delta.contentChangeSet.files.map((entry) => entry.path), ...delta.authorityMetadataAdditions.map((entry) => entry.path)].sort();
assert.deepEqual(candidatePaths, expectedPaths, "candidate diff set is not exactly the immutable delta plus authority metadata");

assert.equal(sourceStage.mappingFileCount, sourceStage.mappingFiles.length, "source-stage mapping-file count drift");
for (const fileStage of sourceStage.mappingFiles) {
  const beforeBytes = baselineBytes(fileStage.path);
  const afterBytes = fs.readFileSync(path.join(candidateRoot, fileStage.path));
  assert(beforeBytes, fileStage.path + ": baseline review mapping missing");
  assert.deepEqual({ bytes: beforeBytes.length, sha256: sha256(beforeBytes) }, fileStage.before, fileStage.path + ": baseline binding drift");
  assert.deepEqual({ bytes: afterBytes.length, sha256: sha256(afterBytes) }, fileStage.after, fileStage.path + ": candidate binding drift");
  const before = JSON.parse(beforeBytes);
  const after = JSON.parse(afterBytes);
  assertDeclaredMultisetReplay(fileStage.path + " decisions", "decisions", before.decisions ?? [], after.decisions ?? [], fileStage.decisionChanges);
  assertDeclaredMultisetReplay(fileStage.path + " mappings", "mappings", before.mappings ?? [], after.mappings ?? [], fileStage.mappingChanges);
  assert.deepEqual(fileStage.declaredChangeReplay, {
    decisions: { beforeCount: before.decisions?.length ?? 0, afterCount: after.decisions?.length ?? 0, status: "PASS" },
    mappings: { beforeCount: before.mappings?.length ?? 0, afterCount: after.mappings?.length ?? 0, status: "PASS" },
  }, fileStage.path + ": declared replay summary drift");
  if (fileStage.rawPeer) {
    const rawBefore = baselineBytes(fileStage.rawPeer.path);
    const rawAfter = fs.readFileSync(path.join(candidateRoot, fileStage.rawPeer.path));
    assert(rawBefore, fileStage.rawPeer.path + ": baseline raw peer missing");
    assert.deepEqual(rawBefore, rawAfter, fileStage.rawPeer.path + ": raw peer mutated");
    assert.deepEqual({ path: fileStage.rawPeer.path, bytes: rawBefore.length, sha256: sha256(rawBefore), unchanged: true }, fileStage.rawPeer,
      fileStage.rawPeer.path + ": raw peer binding drift");
  }
}

const mathPath = receipt.candidateBindings.canonicalMathematics.path;
const beforeMath = JSON.parse(baselineBytes(mathPath));
const afterMath = readJson(path.join(candidateRoot, mathPath));
assert.equal(afterMath.goals.length, 1146, "candidate math goal count drift");
const afterById = new Map(afterMath.goals.map((goal) => [goal.id, goal]));
const released = beforeMath.goals.filter((goal) => goal.examData?.reviewStatus === "released");
assert.equal(released.length, 71, "released assessment baseline count drift");
for (const goal of released) {
  const after = afterById.get(goal.id);
  assert(after, goal.id + ": released assessment removed");
  for (const field of ["sourceArtifactPath", "taskContent", "solutionContent", "scoring"]) {
    assert.deepEqual(after.examData?.[field], goal.examData[field], goal.id + ": released " + field + " mutated");
  }
}
for (const endpoint of plan.assessmentEndpoints) {
  const goal = afterById.get(endpoint.id);
  assert(goal?.examData, endpoint.id + ": endpoint absent");
  assert.deepEqual(goal.requires, goal.examData.coveredGoalIds, endpoint.id + ": requires/covered mismatch");
}
let allOfCarrierCount = 0;
let newEndpointCarrierCount = 0;
const endpointIds = new Set(plan.assessmentEndpoints.map((entry) => entry.id));
for (const canonicalPath of [
  "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json",
  "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json",
  "curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json",
]) {
  const landscape = readJson(path.join(candidateRoot, canonicalPath));
  const byId = new Map(landscape.goals.map((goal) => [goal.id, goal]));
  for (const goal of landscape.goals.filter((entry) => entry.extendedData?.applicabilityFromRequires === true)) {
    allOfCarrierCount += 1;
    if (endpointIds.has(goal.id)) newEndpointCarrierCount += 1;
    assert.equal(goal.extendedData.applicabilityMappingInheritance, "boundary", goal.id + ": all-of carrier lacks boundary");
    assert((goal.requires?.length ?? 0) > 0, goal.id + ": all-of carrier has no requires");
    let intersection = null;
    for (const requiredId of goal.requires) {
      const required = byId.get(requiredId);
      assert(required, goal.id + ": unresolved all-of prerequisite " + requiredId);
      const jurisdictions = new Set(required.applicability?.jurisdiction ?? []);
      intersection = intersection === null ? jurisdictions : new Set([...intersection].filter((entry) => jurisdictions.has(entry)));
    }
    const compiled = [...(intersection ?? new Set())].sort();
    const committed = [...(goal.applicability?.jurisdiction ?? [])].sort();
    assert.deepEqual(committed, compiled, goal.id + ": applicability is not exact all-of intersection");
  }
}
assert.equal(allOfCarrierCount, 34, "all-of carrier count drift");
assert.equal(newEndpointCarrierCount, 15, "new endpoint all-of carrier count drift");
assert.equal(plan.weightClosure.changedAtomicBasisMismatchCount, 0, "touched weight closure is not clean");
assert.equal(plan.weightClosure.preExistingUnrelatedGlobalDebtCount, 41, "reported unrelated weight debt drift");
assert.equal(sourceStage.sourceCoverageResult.unsupportedVisibleAtomicGoals, 0, "source-stage unsupported visible atoms");
assert.deepEqual(delta.protectedContractAssertion.forbiddenPathMatches, [], "protected V1 contract path included");
assert.deepEqual(delta.protectedContractAssertion.allowedLayerADerivedPaths, ["app/src/generated/gymnasiumDurationOfferings.ts"],
  "generated Layer-A offering-data exception drift");
assert.equal(plan.completionBoundary.claim, "CORE_APPLY_AUTHORITY_PASS_ONLY", "Core completion boundary drift");
assert.equal(plan.completionBoundary.fullCiPassClaimed, false, "Core receipt must not claim full CI PASS");
assert.equal(delta.completionBoundary.postApplyDerivativeLaneRequired, true, "post-apply derivative lane must remain explicit");
const expectedPostApplyDerivativeDebt = ["app/public/data/goal-source-rationales-math-public.json","docs/qa-ci/status/goal-source-rationale-coverage.json","docs/qa-ci/status/goal-source-rationale-coverage.md","docs/qa-ci/status/goal-source-rationale-gap-issues.json","docs/qa-ci/status/goal-source-rationale-gap-issues.md","docs/qa-ci/status/goal-source-rationale-mapping-batch-01.json","docs/qa-ci/status/goal-source-rationale-mapping-batch-01.md","docs/qa-ci/status/goal-source-rationales-math-all-relevant.json"];
assert.deepEqual(plan.completionBoundary.postApplyDerivativeDebt.map((entry) => entry.path), expectedPostApplyDerivativeDebt,
  "post-apply derivative debt path set drift");
assert.deepEqual(delta.completionBoundary.unchangedDeferredFiles.map((entry) => entry.path), expectedPostApplyDerivativeDebt,
  "delta post-apply derivative debt path set drift");
for (const entry of delta.completionBoundary.unchangedDeferredFiles) {
  const before = baselineBytes(entry.path);
  const after = fs.readFileSync(path.join(candidateRoot, entry.path));
  assert(before, entry.path + ": deferred baseline file missing");
  assert.deepEqual(before, after, entry.path + ": deferred post-apply derivative changed inside Core delta");
  assert.deepEqual({ path: entry.path, bytes: before.length, sha256: sha256(before), unchangedInCoreDelta: true }, entry,
    entry.path + ": deferred derivative binding drift");
}
for (const rel of [
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-splits.mjs",
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-split-phase-follow-up.mjs",
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-split-weight-closure-follow-up.mjs",
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-split-orientation-milestone-follow-up.mjs",
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-split-derivative-core-follow-up.mjs",
  "curricula/DE/Gymnasium/quality/goal-description-review/validate-canonical-math-structural-split-composition-view-follow-up.mjs",
]) {
  execFileSync(process.execPath, [path.join(candidateRoot, rel)], { cwd: candidateRoot, stdio: "pipe", maxBuffer: 1024 * 1024 * 256 });
}
for (const script of [
  "test:composition-projection-roles",
  "check:gymnasium-duration-readiness",
  "check:gymnasium-duration-offerings",
  "check:math-duration-policy-readiness",
  "check:m6-duration-policy-readiness",
]) {
  execFileSync("npm", ["--prefix", "app", "run", script], {
    cwd: candidateRoot,
    stdio: "pipe",
    maxBuffer: 1024 * 1024 * 256,
  });
}
execFileSync("npm", ["--prefix", "app", "run", "quality:curriculum-status:check"], {
  cwd: candidateRoot,
  stdio: "pipe",
  maxBuffer: 1024 * 1024 * 256,
});
console.log(JSON.stringify({
  status: "PASS",
  planDigest: plan.planDigest,
  deltaDigest: delta.deltaDigest,
  receiptDigest: receipt.receiptDigest,
  bundleDigest: manifest.bundleDigest,
  contentPaths: delta.contentChangeSet.pathCount,
  authorityMetadataPaths: delta.authorityMetadataAdditions.length,
  canonicalMathSha256: receipt.candidateBindings.canonicalMathematics.sha256,
  goalCount: afterMath.goals.length,
  endpoints: plan.assessmentEndpoints.length,
}, null, 2));
