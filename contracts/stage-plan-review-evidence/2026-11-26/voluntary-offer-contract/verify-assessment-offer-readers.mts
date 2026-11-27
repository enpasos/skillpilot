// SPDX-License-Identifier: Apache-2.0
// The two source-format readers have successors. Preserve the complete W1 integrity checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {gunzipSync} from 'node:zlib';
import {pathToFileURL} from 'node:url';

const here = 'curricula/DE/Gymnasium/quality/learning-units/physics-e2-forces-20261126-w1/routes/applicability';
const raw = (p: string) => fs.readFileSync(path.resolve(process.cwd(), p));
const json = (p: string) => JSON.parse(raw(p).toString('utf8'));
const hash = (v: Buffer) => createHash('sha256').update(v).digest('hex');
assert(process.argv.filter(x => x.startsWith('--mode=')).every(x => x === '--mode=verify'));
const manifest = json(`${here}/verification-inputs.kb5-kg4-arrow.actual.json`);
type Binding = {path: string; sha256: string};
const successor = json('contracts/stage-plan-review-evidence/2026-11-26/voluntary-offer-contract/assessment-offer-readers.successor.json');
for (const b of [successor.predecessor, successor.verifiedPredecessor, successor.previousVerifier]) {
  assert.equal(hash(raw(b.path)), b.sha256);
}
const changes = new Map<string, {before: Binding; current: Binding}>(
  successor.changedInputs.map((change: {before: Binding; current: Binding}) => [change.before.path, change])
);
assert.deepEqual([...changes.keys()].sort(), ['app/src/utils/authoring/compositionViewAuthoring.ts', 'app/src/utils/compositionViewRuntime.ts']);
function verifyBinding(binding: Binding) {
  const change = changes.get(binding.path);
  if (change) {
    assert.deepEqual(change.before, binding);
    assert.equal(change.current.path, binding.path);
  }
  assert.equal(hash(raw(binding.path)), change?.current.sha256 ?? binding.sha256, binding.path);
}
for (const path of changes.keys()) assert(manifest.bindings.some((binding: Binding) => binding.path === path));
for (const binding of manifest.bindings) {
  verifyBinding(binding);
}
const review = json(`${here}/warning-review.kb5-kg4.actual.json`);
assert.equal(review.humanApproval, false);
assert.equal(review.newSubjectOrTaskApprovalClaimed, false);
const finalSource = json(manifest.finalSourceDecisions.path);
assert.equal(hash(raw(manifest.finalSourceDecisions.path)), manifest.finalSourceDecisions.sha256);
for (const decision of review.decisions) {
  const finalOffers = finalSource.views.filter((view: any) => view.placements.some((placement: any) => placement.assessmentGoalId === decision.goalId && placement.assessmentOffered)).map((view: any) => view.viewId).sort();
  assert.deepEqual(finalOffers, decision.offeredViewIds, 'Final v5 source/offer scope differs from the individual warning decision');
}
for (const field of ['actualBeforeMeasurement', 'actualBeforeMeasurementSource', 'boundedCurrentVerifier', 'sourceDecisions', 'sourceRouteChanges', 'independentTaskContentAcceptance','predecessor','successfulPredecessorVerification']) {
  const binding = review[field];
  assert.equal(hash(raw(binding.path)), binding.sha256, `Review binding changed: ${field}`);
}
const container = review.exactPriorCanonicalSource.container;
assert.equal(hash(raw(container.path)), container.sha256);
assert.equal(hash(gunzipSync(raw(container.path))), review.exactPriorCanonicalSource.decodedRawSha256);
const oldBytes = raw(`${here}/accepted-warnings.predecessor.json`);
const currentBytes = raw('docs/qa-ci/applicability-accepted-warnings.json');
const marker = Buffer.from('\n  ]');
const cut = oldBytes.lastIndexOf(marker);
assert(cut > 0, 'Expected retained registry formatting');
assert(currentBytes.subarray(0, cut).equals(oldBytes.subarray(0, cut)), 'Prior registry byte prefix changed');
const oldRegistry = JSON.parse(oldBytes.toString('utf8'));
const currentRegistry = JSON.parse(currentBytes.toString('utf8'));
assert.deepEqual(currentRegistry.acceptedWarnings.slice(0, oldRegistry.acceptedWarnings.length), oldRegistry.acceptedWarnings);
assert.equal(currentRegistry.acceptedWarnings.length, oldRegistry.acceptedWarnings.length + 2);
const withoutRows = (r: any) => Object.fromEntries(Object.entries(r).filter(([k]) => k !== 'acceptedWarnings'));
assert.deepEqual(withoutRows(currentRegistry), withoutRows(oldRegistry));
const compiledInputs = json(`${here}/current-offer.kb5-kg4.actual.json`).inputs;
for (const path of changes.keys()) assert(compiledInputs.some((binding: Binding) => binding.path === path));
for (const binding of compiledInputs) verifyBinding(binding);
console.log(JSON.stringify({nativeCompilationInputBindings: compiledInputs.length, sealedInputBindings: manifest.bindings.length, priorRegistryBytesRetained: true, reviewAuthority: review.reviewAuthority}));
await import(pathToFileURL(path.resolve(process.cwd(), `${here}/check-current.kb5-kg4.mts`)).href);
for (const binding of manifest.bindings) {
  verifyBinding(binding);
}
