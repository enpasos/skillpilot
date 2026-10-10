// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/';
const current = base + 'chemie-b008-five-terminal-a01-sc01-targeted-independent-a-20261010-v1/';
const original = base + 'chemie-b008-five-terminal-assessments-independent-a-20261010-v1/';
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const normal = await import(pathToFileURL(path.join(root, 'app/scripts/goalBookModel.ts')).href);
const candidate = read(base + 'chemie-b008-five-assessments-sc01-sum-gate-author-successor-20261010-v1/candidate/whole517.inactive.SC01-five-assessment-author-successor.json');
const recommendations = read(original + 'FIRST.independent-full-assessment-science-and-route-findings.actual.json').fourteenSemanticClassificationRecommendations;
const oldBindings = read(original + 'checks/normal-fourteen-semantic-fingerprint-bindings.actual.json').recommendedRows;
const by = new Map(candidate.goals.map((g: any) => [g.id, g]));
const scoringReview = read(current + 'FIRST.SC01-current-five-assessment-scoring-and-effect.actual-independent-a.json');
const affected = scoringReview.fiveAssessmentCurrentScoringDecisions.map((r: any) => r.goalId).sort();
const rows = recommendations.map((r: any) => ({
  goalId: r.goalId,
  recommendedSemanticKind: r.recommendedSemanticKind,
  currentNormalSourceFingerprint: normal.fingerprintSemanticKindSourceGoal(by.get(r.goalId)),
  originalSubstantiveRationaleSource: original + 'FIRST.independent-full-assessment-science-and-route-findings.actual.json',
  currentAffectedSubstantiveScoringReviewSource: affected.includes(r.goalId)
    ? current + 'FIRST.SC01-current-five-assessment-scoring-and-effect.actual-independent-a.json' : null,
  roleDecisionRetained: true, authoritativeLedgerMutated: false,
}));
assert.equal(rows.length, 14);
const changed = rows.filter((r: any) => r.currentNormalSourceFingerprint !== oldBindings.find((p: any) => p.goalId === r.goalId).normalCurrentSourceFingerprint).map((r: any) => r.goalId).sort();
assert.deepEqual(changed, affected);
assert.ok(rows.filter((r: any) => affected.includes(r.goalId)).every((r: any) => r.recommendedSemanticKind === 'practiceAssessment'));
console.log(JSON.stringify({
  schemaVersion: 1, role: 'Current normal semantic fingerprints for existing substantive A role recommendations; no operative decision writes',
  createdAt: new Date().toISOString(), actualExitCode: 0,
  changedFingerprintGoalIds: changed, unchangedRecommendationFingerprints: 9,
  currentFourteenRecommendationBindings: rows,
  fiveExamRoleRecommendationsRetainedFromActualCurrentReview: true,
  currentStrictDenominator: null, netStrictGain: 0, humanApproval: false, operativeWrites: [],
}, null, 2));
