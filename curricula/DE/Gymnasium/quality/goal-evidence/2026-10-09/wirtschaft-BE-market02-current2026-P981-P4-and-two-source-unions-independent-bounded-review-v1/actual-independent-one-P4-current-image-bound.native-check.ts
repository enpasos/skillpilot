import fs from 'node:fs';
import crypto from 'node:crypto';
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';

const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-market02-current2026-GWB32f-P981-fourth-case-and-two-source-unions-author-v1';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-market02-current2026-P981-P4-and-two-source-unions-independent-bounded-review-v1';
const record = JSON.parse(fs.readFileSync(`${author}/whole-one-P981-four-cases-current2026-real-primary-own-aid.native-bound.author-v1.jsonl`, 'utf8'));
const goal = JSON.parse(fs.readFileSync(`${author}/whole-one-current-unchanged-981-goal-contract.for-native-binder.json`, 'utf8'))[0];
const historical = JSON.parse(fs.readFileSync(`${author}/inputs/whole-actual-independent-content-KEEP-current-image-bound-P981-P3.exact.jsonl`, 'utf8'));
const measured = JSON.parse(fs.readFileSync(`${author}/actual-native-one-P981-four-cases-current-real-QA-image-binding.author-check.receipt.json`, 'utf8'));
let actualAssets = 0;
let canonicalAssets = 0;
for (const asset of measured.assets) {
  for (const key of ['canonical', 'public', 'generatedBackend']) {
    if (key !== 'canonical' && !fs.existsSync(asset[key])) continue;
    const sha = `sha256:${crypto.createHash('sha256').update(fs.readFileSync(asset[key])).digest('hex')}`;
    if (sha !== asset.sha256) throw new Error(`Actual asset mismatch: ${asset[key]}`);
    actualAssets++;
    if (key === 'canonical') canonicalAssets++;
  }
}
for (const key of ['expectations', 'coverageExpectations']) {
  if (JSON.stringify(record.profile[key]) !== JSON.stringify(historical.profile[key])) throw new Error(`Historical ${key} changed`);
}
if (JSON.stringify(record.profile.applicationCaseBriefs.slice(0, 3)) !== JSON.stringify(historical.profile.applicationCaseBriefs)) throw new Error('Old three cases changed');
const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, measured.actualResourceDigests, 'curricularAtomic');
const result = { independentActualNativeErrors: errors, recordCount: 1, caseCount: 4, actualAssetsExact: actualAssets, requiredCommittableCanonicalAssetsExact: canonicalAssets, generatedMirrorsAreOptionalObservations: true, oldWholeCasesExact: 3, status: record.status, reviewAuthority: record.reviewAuthority, evidenceLevel: record.evidenceLevel, maximumClaimScope: record.maximumClaimScope, noNewVisualApproval: true, noWholeCourseOrSource125Approval: true };
fs.writeFileSync(`${own}/actual-independent-one-P4-current-image-bound.native-result.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (errors.length) process.exit(1);
