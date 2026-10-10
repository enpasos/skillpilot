// SPDX-License-Identifier: Apache-2.0
import fs from 'node:fs';
import assert from 'node:assert/strict';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const pkg = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-five-terminal-assessments-independent-a-20261010-v1';
const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-phase-local-inquiry-model-society-terminal-author-20261010-v1';
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(root, p), 'utf8'));
const normal = await import(pathToFileURL(path.join(root, 'app/scripts/goalBookModel.ts')).href);
const candidate = read(author + '/candidate/whole517.inactive.terminal-assessment-author.json');
const first = read(pkg + '/FIRST.independent-full-assessment-science-and-route-findings.actual.json');
const ledger = read('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current-P25-protected12-source24-inactive-integration-technical-20261010-v1/candidate/current511-semantic-kinds.future-active.json');
const by = new Map(candidate.goals.map((g: any) => [g.id, g]));
const stale = ledger.decisions.filter((d: any) => normal.fingerprintSemanticKindSourceGoal(by.get(d.goalId)) !== d.sourceFingerprint).map((d: any) => d.goalId).sort();
const missing = candidate.goals.filter((g: any) => !ledger.decisions.some((d: any) => d.goalId === g.id)).map((g: any) => g.id).sort();
assert.equal(stale.length, 8);
assert.equal(missing.length, 6);
const recs = first.fourteenSemanticClassificationRecommendations;
assert.equal(recs.length, 14);
assert.deepEqual(recs.map((r: any) => r.goalId).sort(), [...stale, ...missing].sort());
const validKinds = new Set(['orientation', 'curricularAtomic', 'curricularArea', 'practiceAssessment', 'memory', 'programStructure', 'runtimeSupport']);
const rows = recs.map((r: any) => {
  assert.ok(validKinds.has(r.recommendedSemanticKind));
  assert.ok(r.rationaleDe.length > 80);
  assert.equal(r.authoritativeLedgerMutated, false);
  return {
    goalId: r.goalId,
    normalCurrentSourceFingerprint: normal.fingerprintSemanticKindSourceGoal(by.get(r.goalId)),
    recommendedSemanticKind: r.recommendedSemanticKind,
    scientificRationaleSource: pkg + '/FIRST.independent-full-assessment-science-and-route-findings.actual.json',
    decisionStatus: 'independent-A-recommendation-only-no-operative-change',
  };
});
console.log(JSON.stringify({
  schemaVersion: 1, role: 'Normal fingerprint contract verifies actual 14 reviewed recommendations, not authoritative decisions',
  createdAt: new Date().toISOString(), actualExitCode: 0,
  staleExistingDecisionGoalIds: stale, newGoalIdsWithoutDecision: missing,
  recommendedRows: rows, operativeLedgerWritten: false,
  currentStrictDenominator: null, netStrictGain: 0, humanApproval: false, activeWrites: [],
}, null, 2));
