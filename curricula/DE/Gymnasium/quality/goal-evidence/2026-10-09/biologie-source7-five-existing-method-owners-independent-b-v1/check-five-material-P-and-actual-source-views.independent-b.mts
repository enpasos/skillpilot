// SPDX-License-Identifier: Apache-2.0
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { reviewPositiveGoalEvidenceConfig } from '../../../../../../../app/scripts/positiveGoalEvidenceReview.ts';
import { normalizeCanonicalLandscape } from '../../../../../../../app/src/utils/authoring/canonicalAuthoring.ts';
import { normalizeCompositionView, compileCompositionView, collectCompositionProjectionRoleGoalIds } from '../../../../../../../app/src/utils/authoring/compositionViewAuthoring.ts';
import { buildGoalBookSourceAtlasInputs } from '../../../../../../../app/scripts/goalBookSourceAtlasInputs.ts';

const own = dirname(fileURLToPath(import.meta.url));
const root = resolve(own, '../../../../../../..');
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09';
const author = `${base}/biologie-source7-four-protected-method-owner-material-author-v1`;
const technical = `${base}/biologie-evolution-sixteen-current-inactive-native-comparison-technical-b-v1`;
const read = (path: string) => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const bind = (path: string) => { const b = readFileSync(resolve(root, path)); return { path, sha256: 'sha256:' + createHash('sha256').update(b).digest('hex'), bytes: b.length }; };
const configPath = `${author}/P5-method-material.author-candidate.v2.config.json`;
const positive = reviewPositiveGoalEvidenceConfig(configPath);
assert.deepEqual(positive.errors, []);
const canonicalPath = `${technical}/candidate/canonical.current479.only16-reviewed-raster.inactive.json`;
const canon = normalizeCanonicalLandscape(read(canonicalPath));
const map = new Map(canon.goals.map(g => [g.id, g]));
const ids = ['91df35c7-e384-50d6-bb3a-37e74a6086f1', '0f1549f6-8341-53b0-8161-5eaeb2b37809', '713e062d-2bb9-5fbc-8040-129387c7d3ca', '82acfbde-9ce8-5658-892e-4dcfb1c3a1f1', '26aa47b7-e5cc-5131-8980-0ec3271758b6'];
const atlasConfigPath = `${technical}/candidate/source-atlas.current479-394.only16.inputs.json`;
const atlas = buildGoalBookSourceAtlasInputs(read(atlasConfigPath), root);
const pointers = (raw: any, goalId: string) => {
  const out: { pointer: string, rawNode: any }[] = [];
  const walk = (v: any, p: string) => {
    if (v && typeof v === 'object') {
      if (v.kind === 'goalEntry' && v.goalId === goalId) out.push({ pointer: p, rawNode: v });
      for (const [k, value] of Object.entries(v)) walk(value, `${p}/${k.replaceAll('~', '~0').replaceAll('/', '~1')}`);
    }
  };
  walk(raw, ''); return out;
};
const checks: any[] = [];
for (const state of ['active-learner', 'candidate-learner', 'candidate-book-source']) for (const code of ['SN', 'ST']) {
  const path = state === 'active-learner' ? `curricula/DE/Gymnasium/composition-views/biologie/de-${code.toLowerCase()}-gym-seki-biology.view.json`
    : state === 'candidate-learner' ? `${base}/biologie-evolution-eighteen-seven-source-course-remediation-author-v1/candidate/composition-views/de-${code.toLowerCase()}-gym-seki-biology.view.json`
    : Object.keys(atlas.outputs).find(p => p.endsWith(`source-de-${code.toLowerCase()}-seki.view.json`))!;
  const raw = state === 'candidate-book-source' ? JSON.parse(atlas.outputs[path]) : read(path);
  const view = normalizeCompositionView(raw);
  const compiled = compileCompositionView(view, canon);
  const roles = collectCompositionProjectionRoleGoalIds(view.rootNodes, map);
  assert.deepEqual(compiled.findings.filter(f => f.severity === 'error'), []);
  const scope = atlas.receipt.scopes.find(s => s.key === `DE-${code}/SekI/`);
  checks.push({ state, jurisdiction: code, view: state === 'candidate-book-source' ? { path, sha256: 'sha256:' + createHash('sha256').update(atlas.outputs[path]).digest('hex'), bytes: Buffer.byteLength(atlas.outputs[path]), generatedInMemoryByNormalFunction: true, actualFileNotWritten: true } : bind(path), scope: view.scope, findings: compiled.findings,
    ownerRoles: ids.map(goalId => ({ goalId, target: roles.targetGoalIds.has(goalId), prerequisiteOnly: roles.prerequisiteOnlyGoalIds.has(goalId), rawPointers: pointers(raw, goalId), wholeCanonicalTags: map.get(goalId)?.tags ?? [] })),
    source82acWitnesses: state === 'candidate-book-source' ? scope?.witnesses.filter(w => w.goalId === ids[3]) : [] });
}
const protectedInputPath = `${base}/biologie-evolution-current17-and-protected-contexts-native-preparation-author-v1/native-subsets/protected-source-contexts/round-b/description-review-input.json`;
const input = read(protectedInputPath);
const wholeCurrent82ac = input.goals.find((g: any) => g.goalId === ids[3]);
assert.ok(wholeCurrent82ac);
const report = {
  schemaVersion: 1, license: 'CC-BY-4.0', role: 'Independent B actual normal scoped checks after frozen own science-FIRST; no active edits',
  normalFunctions: ['reviewPositiveGoalEvidenceConfig', 'buildGoalBookSourceAtlasInputs', 'compileCompositionView', 'collectCompositionProjectionRoleGoalIds'],
  positive: { config: bind(configPath), counts: positive.counts, errors: positive.errors, records: positive.records.map(r => ({ goalId: r.goalId, status: r.status, reviewAuthority: r.reviewAuthority, evidenceLevel: r.evidenceLevel, maximumClaimScope: r.maximumClaimScope, profileFingerprint: r.profileFingerprint, goalFingerprint: r.goalFingerprint, reviewInputFingerprint: r.reviewInputFingerprint, caseCount: r.profile.applicationCaseBriefs.length })) },
  canonical: bind(canonicalPath), sourceAtlasConfig: bind(atlasConfigPath), atlasCounts: atlas.receipt.counts, sixActualNormalViewChecks: checks,
  native82acCurrentReviewedInput: { binding: bind(protectedInputPath), wholeGoalInput: wholeCurrent82ac },
  stageFindingId: 'SRC7METHODB-VIEW-001', stageFinding: 'CONFIRMED_TARGETED_SN_ST_SEKI_TARGET_ASSIGNMENT',
  stageExplanation: 'The normal compiler places 82ac as target in both actual authored learner views and independently generated source book views. Biology source atlas target assignments are derived from reviewed source mapping metadata, not the authored learner view projectionRole. A material boundary alone does not alter either target route.',
  newScientificMaterialJudgments: 'KEEP five whole protocols and five whole P-profile additions; source stage assignment remains separate',
  claims: { wholeSourceApproval: false, humanApproval: false, humanTrial: false, actualNewNatureMeasurements: false, strictGain: 0, activeWrites: 0 }
};
writeFileSync(resolve(own, 'five-material-P-and-six-normal-source-view-bindings.actual.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ positiveCounts: positive.counts, positiveErrors: positive.errors, atlasCounts: atlas.receipt.counts, sixViewErrors: checks.map(c => ({ state: c.state, jurisdiction: c.jurisdiction, errors: c.findings.filter((f: any) => f.severity === 'error').length, role82ac: c.ownerRoles[3] })), stageFinding: report.stageFinding }));
