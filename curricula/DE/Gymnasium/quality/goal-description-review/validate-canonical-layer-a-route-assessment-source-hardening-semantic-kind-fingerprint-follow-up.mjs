#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-semantic-kind-fingerprint-follow-up-2026-08-17.receipt.json");
const schemaPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-semantic-kind-fingerprint-follow-up.receipt.schema.json");
const validatorPath = fileURLToPath(import.meta.url);
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const fileBinding = (file) => {
  const bytes = fs.readFileSync(file);
  return { bytes: bytes.length, sha256: sha256(bytes) };
};
const repoFileBinding = (relativePath) => ({ path: relativePath, ...fileBinding(path.join(repoRoot, relativePath)) });
const serializeJson = (value) => Buffer.from(JSON.stringify(value, null, 2) + "\n", "utf8");
const digestDocument = (value, field) => {
  const copy = structuredClone(value);
  delete copy[field];
  return sha256(Buffer.from(JSON.stringify(copy), "utf8"));
};
const compareCodePoints = (left, right) => {
  const leftPoints = [...left].map((value) => value.codePointAt(0));
  const rightPoints = [...right].map((value) => value.codePointAt(0));
  const length = Math.min(leftPoints.length, rightPoints.length);
  for (let index = 0; index < length; index += 1) {
    if (leftPoints[index] !== rightPoints[index]) return leftPoints[index] - rightPoints[index];
  }
  return leftPoints.length - rightPoints.length;
};
const canonicalJson = (value) => {
  if (value === null) return "null";
  if (typeof value === "boolean" || typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") {
    assert(Number.isFinite(value), "non-finite number in canonical JSON");
    return JSON.stringify(Object.is(value, -0) ? 0 : value);
  }
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  assert.equal(typeof value, "object", "unsupported canonical JSON value");
  const members = Object.keys(value).sort(compareCodePoints).map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`);
  return `{${members.join(",")}}`;
};
const sourceFingerprint = (goal, contract) => {
  const fields = contract.pointers.map((pointer) => {
    assert(/^\/[A-Za-z]+$/.test(pointer), `unsupported source-fingerprint pointer ${pointer}`);
    const key = pointer.slice(1);
    if (!Object.prototype.hasOwnProperty.call(goal, key)) return { path: pointer, state: "missing" };
    let value = structuredClone(goal[key]);
    if (pointer === "/tags") {
      assert(Array.isArray(value) && value.every((entry) => typeof entry === "string"), "invalid tags");
      assert.equal(new Set(value).size, value.length, "duplicate tags");
      value = [...value].sort(compareCodePoints);
    }
    return { path: pointer, state: "value", value };
  });
  return `sha256:${sha256(Buffer.from(canonicalJson({ domain: contract.domain, fields }), "utf8"))}`;
};

const receipt = readJson(receiptPath);
const schema = readJson(schemaPath);
execFileSync("python3", [
  "-B",
  "-c",
  "import json,sys; from jsonschema import Draft202012Validator; s=json.load(open(sys.argv[1],encoding='utf-8')); d=json.load(open(sys.argv[2],encoding='utf-8')); Draft202012Validator.check_schema(s); errors=sorted(Draft202012Validator(s).iter_errors(d),key=lambda e:list(e.absolute_path)); assert not errors, errors[0].message if errors else ''",
  schemaPath,
  receiptPath,
], { cwd: repoRoot, stdio: "pipe" });
assert.equal(schema.additionalProperties, false, "child receipt schema is not closed");
assert.equal(digestDocument(receipt, "receiptDigest"), receipt.receiptDigest, "child receipt self-digest drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.schema.path), receipt.artifactBindings.schema, "child schema binding drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.validator.path), receipt.artifactBindings.validator, "child validator binding drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.validator.path), path.resolve(validatorPath), "child validator path drift");

const parent = readJson(path.join(repoRoot, receipt.parentAuthority.receipt.path));
assert.deepEqual(repoFileBinding(receipt.parentAuthority.receipt.path), receipt.parentAuthority.receipt, "parent receipt file binding drift");
assert.equal(digestDocument(parent, "receiptDigest"), parent.receiptDigest, "parent receipt self-digest drift");
assert.equal(parent.receiptDigest, receipt.parentAuthority.receiptDigest, "parent receipt digest binding drift");
assert.deepEqual({
  path: parent.candidateBindings.canonicalMathematics.path,
  bytes: parent.candidateBindings.canonicalMathematics.bytes,
  sha256: parent.candidateBindings.canonicalMathematics.sha256,
}, receipt.parentAuthority.candidateCanonicalMathematics, "parent canonical binding drift");
assert.equal(parent.candidateBindings.canonicalMathematics.goalCount, 1146, "parent canonical goal-count binding drift");
assert.deepEqual(parent.candidateBindings.semanticKinds, receipt.parentAuthority.candidateSemanticKindsBefore, "parent semantic-kind candidate binding drift");
const parentSemanticDelta = parent.contentChangeSet.files.find((entry) => entry.path === receipt.scope.ledgerPath);
assert(parentSemanticDelta, "parent content-change set lacks semantic-kind ledger");
assert.deepEqual({
  path: parentSemanticDelta.path,
  bytes: parentSemanticDelta.after.bytes,
  sha256: parentSemanticDelta.after.sha256,
}, receipt.parentAuthority.contentChangeSetSemanticKindsAfter, "parent semantic-kind delta leaf drift");
assert.equal(parentSemanticDelta.after.mode, "100644", "parent semantic-kind delta mode drift");
assert.deepEqual(receipt.parentAuthority.candidateSemanticKindsBefore, receipt.parentAuthority.contentChangeSetSemanticKindsAfter, "parent authority has divergent semantic-kind leaves");

for (const bindingName of ["ontologyProfile", "normalizationProfile", "releaseCompiler", "independentReleaseValidator"]) {
  const expected = receipt.algorithmBindings[bindingName];
  assert.deepEqual(repoFileBinding(expected.path), expected, `${bindingName} binding drift`);
}
const ontologyProfile = readJson(path.join(repoRoot, receipt.algorithmBindings.ontologyProfile.path));
const normalizationProfile = readJson(path.join(repoRoot, receipt.algorithmBindings.normalizationProfile.path));
const contract = ontologyProfile.semanticKindDecisions.sourceFingerprint;
assert.deepEqual({
  contractId: contract.contractId,
  algorithm: contract.algorithm,
  domain: contract.domain,
  canonicalJsonProfile: contract.canonicalJsonProfile,
  canonicalJsonProfileVersion: contract.canonicalJsonProfileVersion,
  canonicalJsonProfilePath: contract.canonicalJsonProfilePath,
  canonicalJsonProfileSha256: contract.canonicalJsonProfileSha256,
  pointers: contract.pointers,
}, receipt.algorithmBindings.fingerprintContract, "fingerprint contract binding drift");
assert.equal(normalizationProfile.profileId, contract.canonicalJsonProfile, "normalization profile identity drift");
assert.equal(normalizationProfile.version, contract.canonicalJsonProfileVersion, "normalization profile version drift");
assert.equal(receipt.algorithmBindings.normalizationProfile.sha256, contract.canonicalJsonProfileSha256, "normalization profile SHA binding drift");
assert(fs.readFileSync(path.join(repoRoot, receipt.algorithmBindings.releaseCompiler.path), "utf8").includes("def source_fingerprint(goal: Mapping[str, Any], source_contract: Mapping[str, Any])"), "release compiler fingerprint implementation missing");
assert(fs.readFileSync(path.join(repoRoot, receipt.algorithmBindings.independentReleaseValidator.path), "utf8").includes("def source_fingerprint(goal: Mapping[str, Any], contract: Mapping[str, Any])"), "independent release validator fingerprint implementation missing");

const canonicalPath = path.join(repoRoot, receipt.causeProof.canonicalMathematics.path);
assert.deepEqual(repoFileBinding(receipt.causeProof.canonicalMathematics.path), receipt.causeProof.canonicalMathematics, "current canonical binding drift");
assert.deepEqual(receipt.causeProof.canonicalMathematics, receipt.parentAuthority.candidateCanonicalMathematics, "follow-up changed canonical mathematics");
const canonical = readJson(canonicalPath);
assert.equal(canonical.goals.length, 1146, "canonical goal count drift");
const goal = canonical.goals[receipt.scope.canonicalGoalIndex];
assert.equal(goal.id, receipt.scope.goalId, "canonical goal index drift");
assert.equal(goal.extendedData?.applicabilityMappingInheritance, receipt.causeProof.afterValue, "J8 boundary cause missing");
const currentFingerprint = sourceFingerprint(goal, contract);
assert.equal(currentFingerprint, receipt.causeProof.fingerprintWithBoundary, "current independent fingerprint drift");

const reverseGoal = structuredClone(goal);
assert.equal(reverseGoal.extendedData.applicabilityMappingInheritance, "boundary");
delete reverseGoal.extendedData.applicabilityMappingInheritance;
assert.deepEqual(reverseGoal.extendedData, { applicabilityFromRequires: true }, "reverse proof changed more than the boundary field");
const reverseFingerprint = sourceFingerprint(reverseGoal, contract);
assert.equal(reverseFingerprint, receipt.causeProof.fingerprintWithoutBoundary, "reverse independent fingerprint drift");
reverseGoal.extendedData.applicabilityMappingInheritance = "boundary";
assert.deepEqual(reverseGoal, goal, "boundary restoration did not reproduce the canonical goal");

const ledgerPath = path.join(repoRoot, receipt.scope.ledgerPath);
const ledgerBytes = fs.readFileSync(ledgerPath);
assert.deepEqual({ path: receipt.scope.ledgerPath, bytes: ledgerBytes.length, sha256: sha256(ledgerBytes) }, receipt.ledgerTransition.after, "current ledger binding drift");
const ledger = JSON.parse(ledgerBytes);
assert.equal(ledger.decisions.length, 1146, "semantic-kind decision count drift");
const currentDecision = ledger.decisions[receipt.scope.ledgerDecisionIndex];
assert.deepEqual(currentDecision, receipt.ledgerTransition.afterDecision, "current semantic-kind decision drift");
assert.equal(currentDecision.sourceFingerprint, currentFingerprint, "ledger does not contain the current compiler-contract fingerprint");
const beforeDecision = receipt.ledgerTransition.beforeDecision;
const afterDecision = receipt.ledgerTransition.afterDecision;
const changedKeys = Object.keys(afterDecision).filter((key) => !Object.is(afterDecision[key], beforeDecision[key]));
assert.deepEqual(changedKeys, ["sourceFingerprint"], "semantic-kind decision changed more than sourceFingerprint");
for (const key of ["goalId", "semanticKind", "decisionStatus", "decisionBasis"]) {
  assert.deepEqual(afterDecision[key], beforeDecision[key], `${key} changed`);
}
assert.equal(beforeDecision.sourceFingerprint, reverseFingerprint, "before decision does not match the exact cause reverse");
assert.equal(afterDecision.sourceFingerprint, currentFingerprint, "after decision does not match the current canonical goal");
const reconstructedLedger = structuredClone(ledger);
reconstructedLedger.decisions[receipt.scope.ledgerDecisionIndex] = beforeDecision;
const reconstructedLedgerBytes = serializeJson(reconstructedLedger);
assert.deepEqual({ path: receipt.scope.ledgerPath, bytes: reconstructedLedgerBytes.length, sha256: sha256(reconstructedLedgerBytes) }, receipt.ledgerTransition.before, "one-field reverse does not reproduce the parent ledger");
assert.deepEqual(receipt.ledgerTransition.before, receipt.parentAuthority.candidateSemanticKindsBefore, "ledger reverse does not terminate at the parent authority leaf");

assert.deepEqual(receipt.validation, {
  parentFileAndSelfDigest: "PASS",
  parentAuthorityLeafExtension: "PASS",
  exactOneFieldLedgerReverse: "PASS",
  decisionSemanticsUnchanged: "PASS",
  independentFingerprintRecomputation: "PASS",
  causeReverseProof: "PASS",
  childSchema: "PASS",
  childSelfDigest: "PASS",
  officialCompilerAndIndependentValidatorRequired: true,
});
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  parentReceiptDigest: parent.receiptDigest,
  goalId: receipt.scope.goalId,
  decisionPointer: receipt.scope.decisionPointer,
  beforeLedgerSha256: receipt.ledgerTransition.before.sha256,
  afterLedgerSha256: receipt.ledgerTransition.after.sha256,
  fingerprintWithoutBoundary: reverseFingerprint,
  fingerprintWithBoundary: currentFingerprint,
}, null, 2));
