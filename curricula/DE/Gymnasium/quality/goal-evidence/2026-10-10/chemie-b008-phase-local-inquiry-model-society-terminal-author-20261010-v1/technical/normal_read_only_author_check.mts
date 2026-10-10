// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';

const R = process.argv[process.argv.indexOf('--root') + 1];
const C = process.argv[process.argv.indexOf('--read-only-capsule') + 1];
const P = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1';
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(R, p), 'utf8'));
const put = (p: string, v: unknown) => fs.writeFileSync(path.join(R, P, p), JSON.stringify(v, null, 2) + '\n');
const digest = (s: string) => createHash('sha256').update(s).digest('hex');
const modulePath = path.join(C, 'app/scripts/generateCurriculumQualityStatus.current-chemistry-technical-exports.ts');
const exported = fs.readFileSync(modulePath, 'utf8');
const exportOnlySuffix = '\n// Technical execution exports only; complete original rules unchanged.\nexport { routeProfiles, evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency };\n';
assert.ok(exported.endsWith(exportOnlySuffix));
const currentSource = fs.readFileSync(path.join(R, 'app/scripts/generateCurriculumQualityStatus.ts'), 'utf8');
assert.equal(exported.slice(0, -exportOnlySuffix.length), currentSource);

// Read the existing capsule only. Its applicability/composition state predates
// this terminal author candidate. It is NOT current candidate native-context QA.
const m = await import(pathToFileURL(modulePath).href);
const ac = await import(pathToFileURL(path.join(C, 'app/scripts/applicabilityCompiler.ts')).href);
const kind = await import(pathToFileURL(path.join(C, 'app/scripts/goalBookModel.ts')).href);
const compilation = ac.buildApplicabilityCompilation();
const baseline = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-whole22-targeted-current-route-author-checkpoint-20261010-v1/candidate/whole511.inactive.route-author-four-edges.json');
const candidate = read(P + '/candidate/whole517.inactive.terminal-assessment-author.json');
const profiles = m.routeProfiles.filter((p: any) => p.landscapeId === candidate.landscapeId);
assert.equal(profiles.length, 1);
const beforeReports = profiles.map((p: any) => m.evaluateRouteProfile(baseline, p, compilation));
const afterReports = profiles.map((p: any) => m.evaluateRouteProfile(candidate, p, compilation));
const before = beforeReports[0].rules.find((r: any) => r.id === 'CQR-101');
const after = afterReports[0].rules.find((r: any) => r.id === 'CQR-101');
assert.equal(before.status, 'fail');
assert.equal(before.metrics.missingMotivationPath, 0);
assert.equal(before.metrics.missingTerminalPath, 9);
assert.equal(after.status, 'pass');
assert.equal(after.metrics.missingMotivationPath, 0);
assert.equal(after.metrics.missingTerminalPath, 0);
const graph = m.evaluateGraphIntegrity(candidate, new Set(candidate.goals.map((g: any) => g.id)));
const types = m.evaluateTypeConsistency(candidate);
assert.equal(graph.status, 'pass');
assert.equal(types.status, 'pass');
const readiness = afterReports[0].rules.find((r: any) => r.id === 'CQR-202');
// The ordinary rule includes reviewStatus. Drafts must truthfully fail it.
assert.equal(readiness.status, 'fail');
assert.ok(readiness.details.every((d: string) => d.endsWith('(reviewStatus=needs_review)')));
const release = afterReports[0].rules.find((r: any) => r.id === 'CQR-203');
assert.notEqual(release.status, 'pass');
const ledger = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1/candidate/current511-semantic-kinds.future-active.json');
const by = new Map(candidate.goals.map((g: any) => [g.id, g]));
const stale = ledger.decisions.filter((d: any) => kind.fingerprintSemanticKindSourceGoal(by.get(d.goalId)) !== d.sourceFingerprint).map((d: any) => d.goalId);
const missing = candidate.goals.filter((g: any) => !ledger.decisions.some((d: any) => d.goalId === g.id)).map((g: any) => g.id);
const priorStale = ['5b1bb5d9-07b1-5ba9-b320-cc97be917c60', '6c7ce93c-7675-51da-bc0c-7d0257f7ff7d', '75e2eff1-f871-5461-9e3f-26d0b333ce2f', '9fc800d1-92d1-5ef6-81c1-33960ae034dd'];
assert.ok(priorStale.every(id => stale.includes(id)));
assert.equal(missing.length, 6);
const newBodies = read(P + '/author/new-six-goal-bodies.whole.json').newGoals;
const newExams = newBodies.filter((g: any) => g.examData);
assert.equal(newExams.length, 5);
newExams.forEach((g: any) => {
  assert.equal(g.examData.reviewStatus, 'needs_review');
  assert.deepEqual(g.requires, g.examData.coveredGoalIds);
  assert.equal(g.examData.scoring.steps.reduce((s: number, x: any) => s + x.points, 0), g.examData.scoring.maxPoints);
});
const c11 = newExams.find((g: any) => g.requires.includes('e5a5dcd8-053c-55fd-b5c7-bba93779da53'));
assert.equal(c11.extendedData.courseScopeHold.status, 'HOLD_UNSPECIFIED_C11');
assert.equal(c11.extendedData.courseScopeHold.PSelected, false);
assert.deepEqual(c11.extendedData.courseScopeHold.explicitScopeKeys, []);
assert.ok(!c11.tags.includes('GK') && !c11.tags.includes('LK'));
const result = {
  schemaVersion: 1,
  role: 'Normal whole-route/graph/type AUTHOR technical check; not independent or native context QA',
  normalEvaluatorExactCurrentSourceSha256: digest(currentSource),
  originalCompleteSourcePreserved: true, changedRulesSelectorsThresholds: 0,
  existingCapsuleReadOnly: true, capsulePath: C,
  applicabilityAndCompositionContext: 'unchanged pre-terminal capsule, NOT regenerated for whole517; native current-context check pending',
  wholeBeforeGoalCount: 511, wholeAfterGoalCount: 517,
  CQR101Before: before, CQR101After: after,
  graph, types,
  completeNormalReportsBefore: beforeReports,
  completeNormalReportsAfter: afterReports,
  unreleasedFiveNewExams: newExams.map((g: any) => g.id),
  actualStaleSemanticKindGoalIds: stale, newGoalsWithoutCurrentKindDecision: missing,
  currentStrictDenominator: null, fullCurrentM6OrM7Claim: false,
  normalCQR202ReadinessGate: readiness.status,
  actualCQR202Findings: readiness.details,
  actualCQR202OnlyBlockingReviewStatus: true,
  CQR203ReleaseGate: release.status,
  C11CourseHoldPreserved: true, C11PSelected: false,
  actualLearnerExecutionClaimed: false, independentReview: 'pending',
  strictGain: 0, newScientificCompletions: 0, restoredActiveBindings: 0, humanApproval: false,
  activeWrites: [],
};
put('checks/normal-whole-graph-route-kind-and-release.actual.json', result);
console.log(JSON.stringify({graph: graph.status, types: types.status, CQR101: after.status, missingMotivation: 0, missingTerminal: 0, CQR202: readiness.status, CQR203: release.status, staleKindDecisions: stale.length, missingNewKindDecisions: missing.length, currentStrictDenominator: null, nativeContextQA: 'pending', C11: 'HOLD'}));
