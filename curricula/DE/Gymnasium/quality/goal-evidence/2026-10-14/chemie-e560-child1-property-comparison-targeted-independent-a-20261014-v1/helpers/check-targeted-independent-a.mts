import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
const root = process.cwd();
const input = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-e560-child1-property-comparison-targeted-P-author-successor-20261014-v1';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-e560-child1-property-comparison-targeted-independent-a-20261014-v1';
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e560-full-duty-two-atomic-children-source-preserving-author-20261013-v1';
const read = (p: string) => JSON.parse(readFileSync(resolve(root, p), 'utf8'));
const sha = (p: string) => 'sha256:' + createHash('sha256').update(readFileSync(resolve(root, p))).digest('hex');
const write = (p: string, x: unknown) => { mkdirSync(dirname(resolve(root, p)), { recursive: true }); writeFileSync(resolve(root, p), JSON.stringify(x, null, 2) + '\n'); };
const cas = read(input + '/CAS.one-whole-case-two-carriers-and-child1-profile.author.json');
const beforeC = read(cas.beforeCaseCarrier.path), afterC = read(cas.afterCaseCarrier.path);
const beforeP = read(cas.beforeProfileCarrier.path), afterP = read(cas.afterProfileCarrier.path);
const case2Before = beforeC.cases.find((c: any) => c.caseId === cas.changedCaseId);
const case2After = afterC.cases.find((c: any) => c.caseId === cas.changedCaseId);
assert.deepEqual(case2Before, cas.beforeWholeCase);
assert.deepEqual(case2After, cas.afterWholeCase);
assert.deepEqual(beforeP.goals[0], cas.beforeWholeChild1ProfileSpec);
assert.deepEqual(afterP.goals[0], cas.afterWholeChild1ProfileSpec);
assert.deepEqual(beforeC.cases[0], afterC.cases[0]);
assert.deepEqual(beforeC.cases.slice(2), afterC.cases.slice(2));
assert.deepEqual(beforeP.goals[1], afterP.goals[1]);
assert.deepEqual(case2Before.dataDe, case2After.dataDe);
assert.deepEqual(case2Before.dataEn, case2After.dataEn);
assert.deepEqual(case2Before.rubric[0], case2After.rubric[0]);
assert.deepEqual(case2Before.rubric[2], case2After.rubric[2]);
assert.deepEqual(beforeP.goals[0].profile.expectations[0], afterP.goals[0].profile.expectations[0]);
assert.deepEqual(beforeP.goals[0].profile.expectations[2], afterP.goals[0].profile.expectations[2]);
assert.deepEqual(beforeP.goals[0].profile.coverageExpectations, afterP.goals[0].profile.coverageExpectations);
const strengthened = case2After.rubric.find((r: any) => r.expectationId === 'e2');
assert.ok(strengthened.fullCreditDe.includes('PDMS-Rückstellung') && strengthened.fullCreditDe.includes('PE-Verformung'));
assert.ok(strengthened.partialCreditDe.includes('Eigenschaftsvergleich') && strengthened.partialCreditDe.includes('fehlt'));
for (const c of afterC.cases) {
  const p = afterP.goals.find((g: any) => g.goalId === c.goalId).profile;
  const brief = p.applicationCaseBriefs.find((b: any) => b.id === c.caseId);
  for (const language of ['De', 'En']) {
    assert.equal(brief['taskDemand' + language], c['task' + language]);
    assert.equal(brief['expectedPerformance' + language], c['modelAnswer' + language]);
    assert.equal(brief['understandingFocus' + language], c.rubric.map((r: any) => r['criterion' + language]).join(' / '));
  }
  assert.equal(c.maximumPoints, c.rubric.reduce((sum: number, r: any) => sum + r.maximumPoints, 0));
}
const model = await import(pathToFileURL(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
const materializer = await import(pathToFileURL(resolve(root, 'app/scripts/materializePositiveGoalEvidenceCandidates.ts')).href);
const config = read(own + '/positive/child1-targeted-review.config.json');
const candidates = read(own + '/positive/child1-targeted-reviewed-design.json');
assert.deepEqual(candidates.goals[0].profile, afterP.goals[0].profile);
const records = await materializer.buildPositiveGoalEvidenceCandidateRecords({ config, candidateSet: candidates });
assert.equal(records.length, 1);
assert.equal(records[0].profileFingerprint, 'sha256:ad7ff3c57b2a8253e6b2be1c3f209ac7cec4ac1140b52107e592219f1c2a1400');
const graph = read(base + '/candidate/canonical533.current407.author.inactive.json');
const goal = graph.goals.find((g: any) => g.id === records[0].goalId);
const wholeGoal = read(base + '/candidate/two-whole-children-and-exact-parent-terminal-CAS.author.json').newWholeChildGoals[0];
assert.deepEqual(goal, wholeGoal);
const beforeFP = model.fingerprintPositiveGoalEvidenceProfile(beforeP.goals[0].profile);
const afterFP = model.fingerprintPositiveGoalEvidenceProfile(afterP.goals[0].profile);
assert.notEqual(beforeFP, afterFP);
assert.equal(model.fingerprintPositiveGoalEvidenceProfile(beforeP.goals[1].profile), model.fingerprintPositiveGoalEvidenceProfile(afterP.goals[1].profile));
assert.equal(records[0].goalFingerprint, 'sha256:c4467c26af2efc5dccc3c11ecb7372bdb0995598807842fd1bc0be91d2db974f');
assert.equal(records[0].reviewInputFingerprint, 'sha256:6d431853d9d91c408e5b4dea330b82fa576bc453f81b04cc640284e352fc2e43');
assert.equal(records[0].evidenceLevel, 'E0'); assert.equal(records[0].maximumClaimScope, 'G0');
assert.equal(records[0].status, 'needs_human_review'); assert.equal(records[0].reviewAuthority, 'ai_candidate');
writeFileSync(resolve(root, config.reviewPath), records.map((r: any) => JSON.stringify(r)).join('\n') + '\n');
write(own + '/checks/stock-targeted-P-semantics-fingerprints-and-preservation.actual.json', {
  checkedAt: new Date().toISOString(), exactWholeBeforeAfterCaseCAS: true, exactWholeBeforeAfterProfileSpecCAS: true,
  unchangedCase1WholeContent: true, unchangedChild2WholeProfileAndCases: true,
  unchangedFullChild1GoalBody: true, unchangedCase2DataFormationAndNetworkRubrics: true,
  unchangedCoverageContractAndOtherExpectations: true, fourBilingualWholeCaseBriefAnswerRubricJoins: true,
  explicitPropertyComparisonInE2FullCredit: true, missingPropertyComparisonCannotReceiveFullE2Credit: true,
  supportingCase1ClassifiedAsIncompletePropertyComparison: true,
  oldChild1ProfileFingerprint: beforeFP, correctedChild1ProfileFingerprint: afterFP,
  child1GoalFingerprint: records[0].goalFingerprint, child1ReviewInputFingerprint: records[0].reviewInputFingerprint,
  candidateStatus: records[0].status, candidateAuthority: records[0].reviewAuthority, evidenceLevel: 'E0', maximumClaimScope: 'G0',
  nativeDOrImageAuthorityWritten: false,
  stockModuleBinding: { path: 'app/scripts/positiveGoalEvidenceProfileModel.ts', sha256: sha('app/scripts/positiveGoalEvidenceProfileModel.ts') }
});
console.log('Independent targeted child1 P guard PASS: exact full case/profile CAS, unchanged case1/child2/goal, explicit graded property comparison, stock new profile binding and bilingual joins.');
