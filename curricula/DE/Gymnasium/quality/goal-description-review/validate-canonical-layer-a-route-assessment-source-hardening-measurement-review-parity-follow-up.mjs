#!/usr/bin/env node
import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../../../..");
const receiptPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-measurement-review-parity-follow-up-2026-08-17.receipt.json");
const schemaPath = path.join(here, "canonical-layer-a-route-assessment-source-hardening-measurement-review-parity-follow-up.receipt.schema.json");
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
const occurrenceCount = (text, needle) => text.split(needle).length - 1;
const attrNumber = (element, name) => {
  const match = element.match(new RegExp(`(?:^|\\s)${name}="([0-9]+(?:\\.[0-9]+)?)"`));
  assert(match, `SVG element lacks numeric ${name}`);
  return Number(match[1]);
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
assert.equal(schema.additionalProperties, false, "measurement-review follow-up schema is not closed");
assert.equal(digestDocument(receipt, "receiptDigest"), receipt.receiptDigest, "measurement-review receipt self-digest drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.schema.path), receipt.artifactBindings.schema, "measurement-review schema binding drift");
assert.deepEqual(repoFileBinding(receipt.artifactBindings.validator.path), receipt.artifactBindings.validator, "measurement-review validator binding drift");
assert.equal(path.resolve(repoRoot, receipt.artifactBindings.validator.path), path.resolve(validatorPath), "measurement-review validator path drift");

const parent = readJson(path.join(repoRoot, receipt.parentReceipt.receipt.path));
assert.deepEqual(repoFileBinding(receipt.parentReceipt.receipt.path), receipt.parentReceipt.receipt, "deterministic-render parent file binding drift");
assert.equal(digestDocument(parent, "receiptDigest"), parent.receiptDigest, "deterministic-render parent self-digest drift");
assert.equal(parent.receiptDigest, receipt.parentReceipt.receiptDigest, "deterministic-render parent digest binding drift");
assert.equal(parent.receiptId, "canonical-layer-a-route-assessment-source-hardening-deterministic-render-provenance-follow-up-2026-08-17-v1", "unexpected deterministic-render parent");

const promptBytes = fs.readFileSync(path.join(repoRoot, receipt.scope.promptPath));
assert.deepEqual({ path: receipt.scope.promptPath, bytes: promptBytes.length, sha256: sha256(promptBytes) }, receipt.promptTransition.after, "current measurement-review prompt binding drift");
assert.deepEqual(parent.promptTransition.after, receipt.promptTransition.before, "measurement-review reverse does not terminate at the deterministic-render parent leaf");
const promptText = promptBytes.toString("utf8");
const lines = promptText.split("\n");
const lineIndex = receipt.scope.lineNumber - 1;
assert.equal(receipt.scope.linePointer, `/lines/${lineIndex}`, "prompt line pointer drift");
assert.equal(lines[lineIndex], receipt.promptTransition.afterLine, "current measurement review line drift");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.afterLine), 1, "current measurement review line is not unique");
assert.equal(occurrenceCount(promptText, receipt.promptTransition.beforeLine), 0, "stale measurement review line remains");
const reconstructedLines = [...lines];
reconstructedLines[lineIndex] = receipt.promptTransition.beforeLine;
const reconstructedBytes = Buffer.from(reconstructedLines.join("\n"), "utf8");
assert.deepEqual({ path: receipt.scope.promptPath, bytes: reconstructedBytes.length, sha256: sha256(reconstructedBytes) }, receipt.promptTransition.before, "one-line reverse does not reproduce the deterministic-render parent prompt");
assert.deepEqual(lines.map((line, index) => line === reconstructedLines[index] ? null : index).filter((index) => index !== null), [lineIndex], "prompt reverse changes more than the review line");

const evidence = receipt.measurementEvidence;
assert.deepEqual(repoFileBinding(evidence.canonicalMathematics.path), evidence.canonicalMathematics, "canonical mathematics binding drift");
assert.deepEqual(evidence.canonicalMathematics, parent.renderEvidence.canonicalMathematics, "measurement follow-up changed canonical mathematics");
const canonical = readJson(path.join(repoRoot, evidence.canonicalMathematics.path));
const goal = canonical.goals[evidence.goalIndex];
assert.equal(goal.id, receipt.scope.goalId, "canonical goal index drift");
const resource = goal.resourceLinks[evidence.resourceLinkIndex];
assert.equal(evidence.altTextPointer, `/goals/${evidence.goalIndex}/resourceLinks/${evidence.resourceLinkIndex}/altText`, "canonical altText pointer drift");
assert.equal(resource.altText, evidence.altText, "canonical altText drift");
assert.equal(resource.provider, evidence.provider, "canonical provider drift");
assert.equal(resource.provider, parent.renderEvidence.provider, "provider changed after deterministic-render receipt");

assert.deepEqual(repoFileBinding(evidence.sourceSvg.path), evidence.sourceSvg, "source SVG binding drift");
assert.deepEqual(evidence.sourceSvg, parent.renderEvidence.sourceSvg, "source SVG changed after deterministic-render receipt");
const svgText = fs.readFileSync(path.join(repoRoot, evidence.sourceSvg.path), "utf8");
const descriptionMatch = svgText.match(/<desc id="desc">([^<]+)<\/desc>/);
assert(descriptionMatch, "SVG description is missing");
assert.equal(descriptionMatch[1], evidence.svgDescription, "SVG description drift");
const stripMatch = svgText.match(/<rect\b[^>]*fill="#84d6f4"[^>]*>/);
assert(stripMatch, "SVG measurement strip is missing");
const patternMatch = svgText.match(/<pattern\b[^>]*id="minorTicks"[^>]*>/);
assert(patternMatch, "SVG millimeter tick pattern is missing");
const stripStartX = attrNumber(stripMatch[0], "x");
const stripWidthPixels = attrNumber(stripMatch[0], "width");
const stripEndX = stripStartX + stripWidthPixels;
const millimeterTickWidthPixels = attrNumber(patternMatch[0], "width");
const derivedMeasurementMm = stripWidthPixels / millimeterTickWidthPixels;
assert.deepEqual({ stripStartX, stripWidthPixels, stripEndX, millimeterTickWidthPixels, derivedMeasurementMm }, evidence.svgGeometry, "SVG geometry no longer derives the bound measurement");
assert(Number.isInteger(derivedMeasurementMm), "SVG measurement is not an integral millimeter count");
assert(svgText.includes(`<line x1="${stripStartX}" y1="58" x2="${stripStartX}" y2="252"`), "SVG start marker drift");
assert(svgText.includes(`<line x1="${stripEndX}" y1="58" x2="${stripEndX}" y2="252"`), "SVG end marker drift");

assert.deepEqual(repoFileBinding(evidence.solution.path), evidence.solution, "solution binding drift");
const solutionText = fs.readFileSync(path.join(repoRoot, evidence.solution.path), "utf8");
assert.equal(occurrenceCount(solutionText, evidence.solutionStatement), 1, "solution does not contain exactly one bound 74-mm statement");
assert.equal(evidence.measurementMm, derivedMeasurementMm, "solution/review measurement does not equal SVG geometry");
assert.equal(resource.altText, "Ein Messstreifen mit Millimeterskala, dessen blaue Messstrecke bei null Millimetern beginnt und bei vierundsiebzig Millimetern endet.", "canonical altText no longer expresses 74 mm");
const reviewMeasurementMatch = receipt.promptTransition.afterLine.match(/markierte Strecke bis ([0-9]+) mm/);
assert(reviewMeasurementMatch, "prompt review line lacks a numeric millimeter measurement");
assert.equal(Number(reviewMeasurementMatch[1]), evidence.measurementMm, "prompt review measurement does not equal SVG/solution/altText measurement");
assert.equal(occurrenceCount(promptText, "47 mm"), 0, "stale 47-mm claim remains in prompt");

for (const field of ["renderer", "rendererVersion", "renderContractId", "renderCommand", "assetSha256"]) {
  assert.equal(evidence[field], parent.renderEvidence[field], `${field} changed after deterministic-render receipt`);
}
assert(promptText.includes(`- Provider: ${evidence.provider}`), "prompt provider parity drift");
assert(promptText.includes(`- Renderer: ${evidence.renderer} ${evidence.rendererVersion}`), "prompt renderer/version parity drift");
assert(promptText.includes(`- Befehl: \`${evidence.renderCommand}\``), "prompt render-command parity drift");
for (const key of ["canonicalAsset", "publicAsset", "backendAsset"]) {
  assert.deepEqual(evidence[key], parent.renderEvidence[key], `${key} parent binding drift`);
  assert.deepEqual(repoFileBinding(evidence[key].path), evidence[key], `${key} current binding drift`);
  assert.equal(`sha256:${evidence[key].sha256}`, evidence.assetSha256, `${key} SHA parity drift`);
}

assert.deepEqual(receipt.validation, {
  parentFileAndSelfDigest: "PASS",
  exactOneLineReverse: "PASS",
  unchangedPromptRemainder: "PASS",
  svgGeometryParity: "PASS",
  canonicalAltTextParity: "PASS",
  solutionParity: "PASS",
  providerRendererAssetParity: "PASS",
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
  goalId: receipt.scope.goalId,
  linePointer: receipt.scope.linePointer,
  beforePromptSha256: receipt.promptTransition.before.sha256,
  afterPromptSha256: receipt.promptTransition.after.sha256,
  measurementMm: evidence.measurementMm,
  svgGeometry: evidence.svgGeometry,
  solutionSha256: evidence.solution.sha256,
  canonicalAltText: evidence.altText,
  assetSha256: evidence.assetSha256,
}, null, 2));
