#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-provider-metadata-follow-up-2026-08-17.receipt.json");
const schemaPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-provider-metadata-follow-up.receipt.schema.json");
const validatorPath = fileURLToPath(import.meta.url);
const sha256 = (bytes) => crypto.createHash("sha256").update(bytes).digest("hex");
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const digestDocument = (value, field) => {
  const copy = structuredClone(value);
  delete copy[field];
  return sha256(Buffer.from(JSON.stringify(copy), "utf8"));
};
const fileBinding = (file) => {
  const bytes = fs.readFileSync(file);
  return { bytes: bytes.length, sha256: sha256(bytes) };
};
const repoFileBinding = (relativePath) => ({
  path: relativePath,
  ...fileBinding(path.join(repoRoot, relativePath)),
});
const bindingSubset = (value) => ({
  path: value.path,
  bytes: value.bytes,
  sha256: value.sha256,
});
const occurrenceCount = (text, needle) => text.split(needle).length - 1;

const receipt = readJson(receiptPath);
const schema = readJson(schemaPath);
execFileSync("python3", [
  "-B",
  "-c",
  "import json,sys; from jsonschema import Draft202012Validator; s=json.load(open(sys.argv[1],encoding='utf-8')); d=json.load(open(sys.argv[2],encoding='utf-8')); Draft202012Validator.check_schema(s); errors=sorted(Draft202012Validator(s).iter_errors(d),key=lambda e:list(e.absolute_path)); assert not errors, errors[0].message if errors else ''",
  schemaPath,
  receiptPath,
], { cwd: repoRoot, stdio: "pipe" });
assert.equal(schema.additionalProperties, false, "provider follow-up schema is not closed");
assert.equal(digestDocument(receipt, "receiptDigest"), receipt.receiptDigest, "provider follow-up receipt self-digest drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.schema.path), receipt.artifactBindings.schema, "provider follow-up schema binding drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.validator.path), receipt.artifactBindings.validator, "provider follow-up validator binding drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.validator.path), path.resolve(validatorPath), "provider follow-up validator path drift");

const parent = readJson(path.join(repoRoot, receipt.parentReceipt.receipt.path));
assert.deepEqual(repoFileBinding(receipt.parentReceipt.receipt.path), receipt.parentReceipt.receipt, "semantic-fingerprint parent file binding drift");
assert.equal(digestDocument(parent, "receiptDigest"), parent.receiptDigest, "semantic-fingerprint parent self-digest drift");
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest, "semantic-fingerprint parent digest binding drift");
assert.equal(parent.receiptId, "canonical-layer-a-route-assessment-source-hardening-semantic-kind-fingerprint-follow-up-2026-08-17-v1", "unexpected semantic-fingerprint parent");

const authority = readJson(path.join(repoRoot, receipt.transitiveAuthority.receipt.path));
assert.deepEqual(parent.parentAuthority.receipt, receipt.transitiveAuthority.receipt, "parent does not bind the declared transitive authority file");
assert.deepEqual(repoFileBinding(receipt.transitiveAuthority.receipt.path), receipt.transitiveAuthority.receipt, "transitive r10 authority file binding drift");
assert.equal(digestDocument(authority, "receiptDigest"), authority.receiptDigest, "transitive r10 authority self-digest drift");
assert.equal(authority.receiptDigest, receipt.transitiveAuthority.receiptDigest, "transitive r10 authority digest binding drift");
assert.equal(parent.parentAuthority.receiptDigest, receipt.transitiveAuthority.receiptDigest, "semantic-fingerprint parent does not bind the declared r10 authority digest");
assert.deepEqual(bindingSubset(parent.parentAuthority.candidateCanonicalMathematics), receipt.transitiveAuthority.canonicalMathematics, "semantic-fingerprint canonical binding drift");
assert.deepEqual(bindingSubset(authority.candidateBindings.canonicalMathematics), receipt.transitiveAuthority.canonicalMathematics, "r10 canonical binding drift");
assert.equal(authority.candidateBindings.canonicalMathematics.goalCount, 1146, "r10 canonical goal-count binding drift");

const promptPath = path.join(repoRoot, receipt.scope.promptPath);
const promptBytes = fs.readFileSync(promptPath);
assert.deepEqual({ path: receipt.scope.promptPath, bytes: promptBytes.length, sha256: sha256(promptBytes) }, receipt.promptTransition.after, "current prompt binding drift");
const promptText = promptBytes.toString("utf8");
const lines = promptText.split("\n");
const lineIndex = receipt.scope.lineNumber - 1;
assert.equal(receipt.scope.linePointer, `/lines/${lineIndex}`, "prompt line pointer drift");
assert.equal(lines[lineIndex], receipt.promptTransition.afterLine, "current provider line drift");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.afterLine), 1, "current provider line is not unique");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.beforeLine), 0, "stale provider line remains in current prompt");
const reconstructedLines = [...lines];
reconstructedLines[lineIndex] = receipt.promptTransition.beforeLine;
const reconstructedText = reconstructedLines.join("\n");
const reconstructedBytes = Buffer.from(reconstructedText, "utf8");
assert.deepEqual({ path: receipt.scope.promptPath, bytes: reconstructedBytes.length, sha256: sha256(reconstructedBytes) }, receipt.promptTransition.before, "one-line reverse does not reproduce the previous prompt");
const changedLineIndexes = lines
  .map((line, index) => line === reconstructedLines[index] ? null : index)
  .filter((index) => index !== null);
assert.deepEqual(changedLineIndexes, [lineIndex], "prompt reverse changes more than the provider line");
assert.equal(receipt.scope.changedLineCount, 1);

assert.deepEqual(repoFileBinding(receipt.canonicalParity.canonicalMathematics.path), receipt.canonicalParity.canonicalMathematics, "current canonical mathematics binding drift");
assert.deepEqual(receipt.canonicalParity.canonicalMathematics, receipt.transitiveAuthority.canonicalMathematics, "provider follow-up changed canonical mathematics");
const canonical = readJson(path.join(repoRoot, receipt.canonicalParity.canonicalMathematics.path));
const goal = canonical.goals[receipt.canonicalParity.goalIndex];
assert.equal(goal.id, receipt.scope.goalId, "canonical goal index drift");
const resource = goal.resourceLinks[receipt.canonicalParity.resourceLinkIndex];
assert.equal(resource.provider, receipt.canonicalParity.provider, "canonical resource provider drift");
assert.equal(resource.url, receipt.canonicalParity.publicUrl, "canonical resource public URL drift");
assert.equal(receipt.canonicalParity.providerPointer, `/goals/${receipt.canonicalParity.goalIndex}/resourceLinks/${receipt.canonicalParity.resourceLinkIndex}/provider`, "canonical provider pointer drift");
assert.equal(receipt.promptTransition.afterLine, `- Provider: ${resource.provider}`, "prompt provider does not equal canonical resource provider");
assert(promptText.includes(`- Public Asset: \`${resource.url}\``), "prompt public-asset line does not equal canonical resource URL");

assert.deepEqual(repoFileBinding(receipt.canonicalParity.visualizationQa.path), receipt.canonicalParity.visualizationQa, "visualization QA binding drift");
const visualizationQa = readJson(path.join(repoRoot, receipt.canonicalParity.visualizationQa.path));
const qaRecord = visualizationQa.records[receipt.canonicalParity.qaRecordIndex];
assert.equal(qaRecord.goalId, receipt.scope.goalId, "visualization QA record index drift");
assert.equal(qaRecord.imageUrl, receipt.canonicalParity.publicUrl, "visualization QA public URL drift");
assert.equal(qaRecord.canonicalAssetPath, receipt.canonicalParity.canonicalAsset.path, "visualization QA canonical asset path drift");
assert.equal(qaRecord.publicAssetPath, receipt.canonicalParity.publicAsset.path, "visualization QA public asset path drift");
assert.equal(qaRecord.assetSha256, receipt.canonicalParity.assetSha256, "visualization QA asset SHA drift");
assert.equal(qaRecord.aiApprovedAssetSha256, receipt.canonicalParity.assetSha256, "visualization QA approved asset SHA drift");
assert.deepEqual(repoFileBinding(receipt.canonicalParity.canonicalAsset.path), receipt.canonicalParity.canonicalAsset, "canonical asset binding drift");
assert.deepEqual(repoFileBinding(receipt.canonicalParity.publicAsset.path), receipt.canonicalParity.publicAsset, "public asset binding drift");
assert.deepEqual(receipt.canonicalParity.canonicalAsset, {
  path: receipt.canonicalParity.canonicalAsset.path,
  bytes: receipt.canonicalParity.publicAsset.bytes,
  sha256: receipt.canonicalParity.publicAsset.sha256,
}, "canonical/public asset byte parity drift");
assert.equal(`sha256:${receipt.canonicalParity.canonicalAsset.sha256}`, receipt.canonicalParity.assetSha256, "asset SHA prefix binding drift");
assert.equal(occurrenceCount(promptText, `- SHA-256: \`${receipt.canonicalParity.canonicalAsset.sha256}\``), 1, "prompt final asset SHA is missing or ambiguous");

assert.deepEqual(receipt.validation, {
  parentFileAndSelfDigest: "PASS",
  transitiveAuthorityFileAndSelfDigest: "PASS",
  exactOneLineReverse: "PASS",
  unchangedPromptRemainder: "PASS",
  canonicalProviderParity: "PASS",
  assetShaParity: "PASS",
  childSchema: "PASS",
  childSelfDigest: "PASS",
  redistributionGeneratorRequired: true,
});
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.scope.canonicalMutationCount, 0);
assert.equal(receipt.scope.assetMutationCount, 0);
assert.equal(receipt.scope.generatorMutationCount, 0);
console.log(JSON.stringify({
  result: "PASS",
  receiptDigest: receipt.receiptDigest,
  parentReceiptDigest: parent.receiptDigest,
  transitiveAuthorityReceiptDigest: authority.receiptDigest,
  goalId: receipt.scope.goalId,
  linePointer: receipt.scope.linePointer,
  beforePromptSha256: receipt.promptTransition.before.sha256,
  afterPromptSha256: receipt.promptTransition.after.sha256,
  provider: resource.provider,
  assetSha256: receipt.canonicalParity.assetSha256,
}, null, 2));
