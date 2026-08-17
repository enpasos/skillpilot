#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-deterministic-render-provenance-follow-up-2026-08-17.receipt.json");
const schemaPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-deterministic-render-provenance-follow-up.receipt.schema.json");
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
const repoFileBinding = (relativePath) => ({ path: relativePath, ...fileBinding(path.join(repoRoot, relativePath)) });
const bindingSubset = (value) => ({ path: value.path, bytes: value.bytes, sha256: value.sha256 });
const occurrenceCount = (text, needle) => text.split(needle).length - 1;
const deltaAfterBinding = (authority, relativePath) => {
  const entry = authority.contentChangeSet.files.find((item) => item.path === relativePath);
  assert(entry, `r10 authority lacks ${relativePath}`);
  assert.equal(entry.action, "add", `${relativePath}: r10 action drift`);
  assert.equal(entry.before, null, `${relativePath}: r10 before-state drift`);
  assert.equal(entry.after.mode, "100644", `${relativePath}: r10 mode drift`);
  return { path: entry.path, bytes: entry.after.bytes, sha256: entry.after.sha256 };
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
assert.equal(schema.additionalProperties, false, "deterministic-render follow-up schema is not closed");
assert.equal(digestDocument(receipt, "receiptDigest"), receipt.receiptDigest, "deterministic-render receipt self-digest drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.schema.path), receipt.artifactBindings.schema, "deterministic-render schema binding drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.validator.path), receipt.artifactBindings.validator, "deterministic-render validator binding drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.validator.path), path.resolve(validatorPath), "deterministic-render validator path drift");

const parent = readJson(path.join(repoRoot, receipt.parentReceipt.receipt.path));
assert.deepEqual(repoFileBinding(receipt.parentReceipt.receipt.path), receipt.parentReceipt.receipt, "provider-metadata parent file binding drift");
assert.equal(digestDocument(parent, "receiptDigest"), parent.receiptDigest, "provider-metadata parent self-digest drift");
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest, "provider-metadata parent digest binding drift");
assert.equal(parent.receiptId, "canonical-layer-a-route-assessment-source-hardening-provider-metadata-follow-up-2026-08-17-v1", "unexpected provider-metadata parent");

const authority = readJson(path.join(repoRoot, receipt.transitiveAuthority.receipt.path));
assert.deepEqual(parent.transitiveAuthority.receipt, receipt.transitiveAuthority.receipt, "parent does not bind the declared r10 authority file");
assert.equal(parent.transitiveAuthority.receiptDigest, receipt.transitiveAuthority.receiptDigest, "parent does not bind the declared r10 authority digest");
assert.deepEqual(repoFileBinding(receipt.transitiveAuthority.receipt.path), receipt.transitiveAuthority.receipt, "r10 authority file binding drift");
assert.equal(digestDocument(authority, "receiptDigest"), authority.receiptDigest, "r10 authority self-digest drift");
assert.equal(authority.receiptDigest, receipt.transitiveAuthority.receiptDigest, "r10 authority digest binding drift");
assert.deepEqual(bindingSubset(authority.candidateBindings.canonicalMathematics), receipt.transitiveAuthority.canonicalMathematics, "r10 canonical binding drift");
assert.deepEqual(deltaAfterBinding(authority, receipt.scope.promptPath), receipt.transitiveAuthority.authorityPromptAfter, "r10 prompt leaf drift");
assert.deepEqual(receipt.transitiveAuthority.authorityPromptAfter, receipt.promptTransition.before, "prompt reverse does not terminate at the r10 authority leaf");

const promptBytes = fs.readFileSync(path.join(repoRoot, receipt.scope.promptPath));
assert.deepEqual({ path: receipt.scope.promptPath, bytes: promptBytes.length, sha256: sha256(promptBytes) }, receipt.promptTransition.after, "current deterministic-render prompt binding drift");
const promptText = promptBytes.toString("utf8");
const lines = promptText.split("\n");
const lineIndex = receipt.scope.lineNumber - 1;
assert.equal(receipt.scope.linePointer, `/lines/${lineIndex}`, "prompt line pointer drift");
assert.equal(lines[lineIndex], receipt.promptTransition.afterLine, "current provider line drift");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.afterLine), 1, "current provider line is not unique");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.beforeLine), 0, "stale provider line remains");
const reconstructedLines = [...lines];
reconstructedLines[lineIndex] = receipt.promptTransition.beforeLine;
const reconstructedBytes = Buffer.from(reconstructedLines.join("\n"), "utf8");
assert.deepEqual({ path: receipt.scope.promptPath, bytes: reconstructedBytes.length, sha256: sha256(reconstructedBytes) }, receipt.promptTransition.before, "one-line reverse does not reproduce the r10 prompt");
assert.deepEqual(lines.map((line, index) => line === reconstructedLines[index] ? null : index).filter((index) => index !== null), [lineIndex], "prompt reverse changes more than the provider line");

assert.deepEqual(repoFileBinding(receipt.renderEvidence.canonicalMathematics.path), receipt.renderEvidence.canonicalMathematics, "current canonical binding drift");
assert.deepEqual(receipt.renderEvidence.canonicalMathematics, receipt.transitiveAuthority.canonicalMathematics, "follow-up changed canonical mathematics");
const canonical = readJson(path.join(repoRoot, receipt.renderEvidence.canonicalMathematics.path));
const goal = canonical.goals[receipt.renderEvidence.goalIndex];
assert.equal(goal.id, receipt.scope.goalId, "canonical goal index drift");
const resource = goal.resourceLinks[receipt.renderEvidence.resourceLinkIndex];
assert.equal(resource.provider, receipt.renderEvidence.provider, "canonical provider drift");
assert.equal(resource.license, receipt.renderEvidence.licenseNote, "canonical license note drift");
assert.equal(resource.url, receipt.renderEvidence.publicUrl, "canonical public URL drift");
assert.equal(receipt.renderEvidence.providerPointer, `/goals/${receipt.renderEvidence.goalIndex}/resourceLinks/${receipt.renderEvidence.resourceLinkIndex}/provider`, "canonical provider pointer drift");
assert.equal(receipt.promptTransition.afterLine, `- Provider: ${resource.provider}`, "prompt provider does not equal canonical provider");

assert.deepEqual(repoFileBinding(receipt.renderEvidence.sourceSvg.path), receipt.renderEvidence.sourceSvg, "source SVG binding drift");
assert.deepEqual(deltaAfterBinding(authority, receipt.renderEvidence.sourceSvg.path), receipt.renderEvidence.sourceSvg, "source SVG no longer equals the r10 authority leaf");
assert(promptText.includes(`- Immutable SVG: \`${receipt.renderEvidence.sourceSvg.path}\``), "prompt source SVG path binding missing");
assert(promptText.includes(`- SVG SHA-256: \`${receipt.renderEvidence.sourceSvg.sha256}\``), "prompt source SVG SHA binding missing");
assert(promptText.includes(`- Renderer: ${receipt.renderEvidence.renderer} ${receipt.renderEvidence.rendererVersion}`), "prompt renderer/version binding missing");
assert(promptText.includes(`- Befehl: \`${receipt.renderEvidence.renderCommand}\``), "prompt render-command binding missing");
assert.equal(receipt.renderEvidence.renderContractId, "rsvg-convert-fixed-png-v1");

for (const key of ["canonicalAsset", "publicAsset", "backendAsset"]) {
  assert.deepEqual(repoFileBinding(receipt.renderEvidence[key].path), receipt.renderEvidence[key], `${key} binding drift`);
  assert.equal(receipt.renderEvidence[key].bytes, 11328, `${key} byte-count drift`);
  assert.equal(`sha256:${receipt.renderEvidence[key].sha256}`, receipt.renderEvidence.assetSha256, `${key} SHA parity drift`);
}
assert.deepEqual(deltaAfterBinding(authority, receipt.renderEvidence.canonicalAsset.path), receipt.renderEvidence.canonicalAsset, "canonical asset no longer equals the r10 authority leaf");
assert.deepEqual(deltaAfterBinding(authority, receipt.renderEvidence.publicAsset.path), receipt.renderEvidence.publicAsset, "public asset no longer equals the r10 authority leaf");
assert(promptText.includes(`- PNG SHA-256: \`${receipt.renderEvidence.canonicalAsset.sha256}\``), "prompt PNG SHA binding missing");
assert(promptText.includes(`- Public Asset: \`${receipt.renderEvidence.publicUrl}\``), "prompt public URL binding missing");

assert.deepEqual(receipt.validation, {
  parentFileAndSelfDigest: "PASS",
  transitiveAuthorityFileAndSelfDigest: "PASS",
  authorityPromptLeafReverse: "PASS",
  exactOneLineReverse: "PASS",
  unchangedPromptRemainder: "PASS",
  canonicalProviderParity: "PASS",
  sourceSvgBinding: "PASS",
  renderContractBinding: "PASS",
  threeWayAssetParity: "PASS",
  childSchema: "PASS",
  childSelfDigest: "PASS",
});
assert.equal(receipt.authorization.furtherProductOwnerDecisionRequired, false);
assert.equal(receipt.authorization.affectsOpenAiCoachV1Contract, false);
assert.equal(receipt.authorization.commitPushDeployAuthorized, false);
assert.equal(receipt.scope.canonicalMutationCount, 0);
assert.equal(receipt.scope.sourceMutationCount, 0);
assert.equal(receipt.scope.assetMutationCount, 0);
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
  sourceSvgSha256: receipt.renderEvidence.sourceSvg.sha256,
  assetSha256: receipt.renderEvidence.assetSha256,
}, null, 2));
