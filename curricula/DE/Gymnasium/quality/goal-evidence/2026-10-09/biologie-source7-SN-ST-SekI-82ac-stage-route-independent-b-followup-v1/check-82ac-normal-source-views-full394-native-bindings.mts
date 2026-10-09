// SPDX-License-Identifier: Apache-2.0
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';
import { buildGoalBookModel, parseAndValidateGoalBookModel, stableGoalBookJson } from '../../../../../../../app/scripts/goalBookModel.ts';
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts';
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import { fingerprintGoalDescriptionReviewContext, fingerprintGoalDescriptionReviewPage } from '../../../../../../../app/scripts/validateGoalDescriptionDualRoundResolution.ts';
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/';
const author = base + 'biologie-source7-SN-ST-SekI-82ac-stage-route-author-successor-v1/';
const own = base + 'biologie-source7-SN-ST-SekI-82ac-stage-route-independent-b-followup-v1/';
const native = base + 'biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1/';
const read = (p: string): any => JSON.parse(readFileSync(p, 'utf8'));
const sha = (x: Buffer|string) => 'sha256:' + createHash('sha256').update(x).digest('hex');
const ref = (p: string) => { const b = readFileSync(p); return { path: p, sha256: sha(b), bytes: b.length }; };
const id = '82acfbde-9ce8-5658-892e-4dcfb1c3a1f1', lower = '26aa47b7-e5cc-5131-8980-0ec3271758b6';
const beforeConfig = read(author + 'inputs/full394-only16.normal-source-atlas.config.exact.json');
const afterConfig = read(author + 'candidate/full394-source-atlas.without82ac-SN-ST-SekI-target.inputs.json');
const beforeAtlas = buildGoalBookSourceAtlasInputs(beforeConfig, '.');
const afterAtlas = buildGoalBookSourceAtlasInputs(afterConfig, '.');
assert.equal(afterAtlas.receipt.counts.publishedCurricularAtomicGoals, 394);
assert.equal(afterAtlas.receipt.counts.unresolvedSourceScopeDecisions, 0);
const raw = read(author + 'inputs/full479-only16.canonical.exact.json');
const canon = normalizeCanonicalLandscape(raw), map = new Map(canon.goals.map(g => [g.id, g]));
const viewChecks: any[] = [];
for (const code of ['SN', 'ST']) for (const variant of ['active', 'source7', 'book-source']) {
  const p = variant === 'book-source' ? Object.keys(afterAtlas.outputs).find(p => p.endsWith(`source-de-${code.toLowerCase()}-seki.view.json`))! : author + `candidate/views/${code}-${variant}.whole.without82ac-SekI-target.json`;
  const view = normalizeCompositionView(variant === 'book-source' ? JSON.parse(afterAtlas.outputs[p]) : read(p));
  const compiled = compileCompositionView(view, canon), roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, map);
  assert.deepEqual(compiled.findings.filter(f => f.severity === 'error'), []);
  assert.equal(roles.targetGoalIds.has(id), false); assert.equal(roles.prerequisiteOnlyGoalIds.has(id), false);
  assert.equal(roles.targetGoalIds.has(lower), true);
  const direct82acPrerequisiteOwners = [...roles.targetGoalIds].filter(g => map.get(g)?.requires.some(r => r.replace(/^.*:/u, '') === id));
  // Target328fd remains. It is an upper digital-tool skill with82ac prerequisite,
  // not the lower26aa simple method owner. Report this actual unchanged boundary.
  viewChecks.push({ jurisdiction: code, variant: variant === 'active' ? 'proposed-current-not-active' : variant === 'source7' ? 'proposed-source7-successor' : 'normal-generated-source-book', binding: variant === 'book-source' ? { path: p, sha256: sha(afterAtlas.outputs[p]), generatedInMemory: true } : ref(p), scope: view.scope, errors: [], target82ac: false, prerequisiteOnly82ac: false, target26aa: true, direct82acPrerequisiteOwners });
}
const scopeDeltas = afterAtlas.receipt.scopes.map(scope => {
  const old = beforeAtlas.receipt.scopes.find(s => s.key === scope.key)!;
  const removed = old.goalIds.filter(g => !scope.goalIds.includes(g)), added = scope.goalIds.filter(g => !old.goalIds.includes(g));
  if (scope.key === 'DE-SN/SekI/' || scope.key === 'DE-ST/SekI/') { assert.deepEqual(removed, [id]); assert.deepEqual(added, []); }
  else { assert.deepEqual(scope.goalIds, old.goalIds); }
  return { key: scope.key, removed, added, unchangedUpperScope: scope.stage === 'SekII' && stableGoalBookJson(scope.goalIds) === stableGoalBookJson(old.goalIds) };
});
const book = read(author + 'candidate/full394-book.without82ac-SN-ST-SekI-target.config.json');
const kinds = read(book.semanticKindLedgerPath), qa = read(book.goalVisualizationQaPath);
const rasterBindings = read(native + 'neutral-current17-and-protected-contexts.native-independent-review.final.entry.json').rasterBindings;
const selected = new Set(read(base + 'biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1/sixteen-current-native-source-registry.readiness-plan.json').selected16GoalIds);
const digests: Record<string,string> = {};
for (const row of qa.records) if (row.visualizationState === 'available') {
  const actual = selected.has(row.goalId) ? rasterBindings.find((r:any) => r.goalId === row.goalId).portableAlias.path : row.publicAssetPath;
  const digest = sha(readFileSync(actual)); assert.equal(digest, row.assetSha256); digests[row.imageUrl] = digest;
}
const manifest = JSON.parse(afterAtlas.outputs[afterConfig.manifestPath]);
const model = buildGoalBookModel({ landscape: raw, semanticKindLedger: kinds, goalVisualizationQa: qa, goalVisualizationAssetDigests: digests, compositionViewManifest: manifest, compositionViewSources: manifest.sourcePaths.map((p:string) => ({path:p, view:JSON.parse(afterAtlas.outputs[p])})), navigationView: JSON.parse(afterAtlas.outputs[manifest.navigationViewPath]), durationModelPolicy: read(manifest.durationModelPolicyPath), evidenceReviewSources: [], config: book });
parseAndValidateGoalBookModel(model);
const actualAfter = read(author + 'native/full394-after82ac-route.normal-model.actual.json');
assert.deepEqual(model, actualAfter);
const before = read(author + 'native/full394-before.normal-model.actual.json');
assert.equal(before.pages.length, 394); assert.equal(model.pages.length, 394);
const wholePageDeltaIds = before.pages.filter((p:any) => stableGoalBookJson(p) !== stableGoalBookJson(model.pages.find(q => q.goalId === p.goalId))).map((p:any) => p.goalId);
assert.deepEqual(wholePageDeltaIds, [id]);
const inputPath = author + 'native/actual82ac/round-b/description-review-input.json';
const goal = read(inputPath).goals[0];
assert.equal(fingerprintGoalDescriptionReviewPage(goal.reviewContext.page), goal.pageFingerprint);
const normalContextFingerprint = fingerprintGoalDescriptionReviewContext(goal);
const oldFullPage = before.pages.find((p:any) => p.goalId === id), newFullPage = model.pages.find(p => p.goalId === id)!;
const whole82acChangedFields = Object.keys(oldFullPage).filter(k => stableGoalBookJson(oldFullPage[k]) !== stableGoalBookJson((newFullPage as any)[k]));
const currentP = read(author + 'inputs/whole82ac-preserved-original-profile-plus-method-appendices.exact.json');
const report = { schemaVersion: 1, license: 'CC-BY-4.0', role: 'Own actual ordinary scoped source/compiler/full394/native bindings after own source and native science-FIRSTs', normalFunctions: ['buildGoalBookSourceAtlasInputs', 'compileCompositionView', 'buildGoalBookModel', 'parseAndValidateGoalBookModel', 'fingerprintGoalDescriptionReviewPage', 'fingerprintGoalDescriptionReviewContext'], counts: afterAtlas.receipt.counts, sixActualViewChecks: viewChecks, scopeDeltas, full394NormalModelExact: true, actualFull394ChangedPageIds: wholePageDeltaIds, other393WholePagesExact: true, actual82acFullPageChangedFields: whole82acChangedFields, native82acActuallyViewedSubsetInput: ref(inputPath), native82acGoalFingerprint: goal.goalFingerprint, native82acPageFingerprint: goal.pageFingerprint, native82acContextFingerprint: normalContextFingerprint, actualViewedWholeContext: goal, preservedWholePInput: ref(author + 'inputs/whole82ac-preserved-original-profile-plus-method-appendices.exact.json'), sourceDecision: 'Precise82ac SN/ST target removal verified. Unchanged upper328fd lower-target prerequisite path remains a separate boundary; no assertion of wholly valid remaining learner route.', historicalPRecordsNotReauthored: true, strictGain: 0, activeWrites: 0, wholeSourceApproval: false, humanApproval: false };
writeFileSync(own + 'actual-normal-six-views-full394-and82ac-native-bindings.json', JSON.stringify(report, null, 2)+'\n');
console.log(JSON.stringify({counts:report.counts, viewChecks:viewChecks.map(v => ({jurisdiction:v.jurisdiction,variant:v.variant,target82ac:v.target82ac,prerequisiteOnly82ac:v.prerequisiteOnly82ac,target26aa:v.target26aa,direct82acPrerequisiteOwners:v.direct82acPrerequisiteOwners})), full394PageDeltas:wholePageDeltaIds, native82acPageFingerprint:goal.pageFingerprint,native82acContextFingerprint:normalContextFingerprint}));
