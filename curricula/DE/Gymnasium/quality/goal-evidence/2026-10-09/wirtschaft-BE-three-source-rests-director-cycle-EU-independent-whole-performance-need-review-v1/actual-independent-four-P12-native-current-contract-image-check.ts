import fs from 'node:fs';
import crypto from 'node:crypto';
import { validatePositiveGoalEvidenceRecordSemantics } from '../../../../../../../app/scripts/positiveGoalEvidenceProfileModel';

const author = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-three-source-rests-Montan-director-cycle-and-EU-current-2026-bounded-author-v1';
const own = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-three-source-rests-director-cycle-EU-independent-whole-performance-need-review-v1';
const records = fs.readFileSync(`${author}/whole-four-current-real-resource-P12.native-bound.author.jsonl`, 'utf8').trim().split('\n').map(line => JSON.parse(line));
const goals = JSON.parse(fs.readFileSync(`${author}/whole-four-goal-contracts.three-exact-one-new.author.json`, 'utf8'));
const live = JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json', 'utf8'));
const qa = JSON.parse(fs.readFileSync('curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json', 'utf8'));
const hash = (path: string) => `sha256:${crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}`;
const checks: any[] = [];
for (const record of records) {
  const goal = goals.find((g: any) => g.id === record.goalId);
  const resourceDigests: Record<string, string> = {};
  const assets: any[] = [];
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue;
    const row = qa.records.find((r: any) => r.goalId === goal.id && r.imageUrl === link.url);
    if (!row) throw new Error(`Missing current QA image authority for ${goal.id}`);
    const canonicalSha = hash(row.canonicalAssetPath);
    if (row.aiApproved !== 'yes' || row.aiApprovedAssetSha256 !== canonicalSha || row.assetSha256 !== canonicalSha) throw new Error(`Non-current image authority for ${goal.id}`);
    if (row.title !== goal.title || row.description !== goal.description) throw new Error(`Current QA contract mismatch for ${goal.id}`);
    resourceDigests[link.url] = canonicalSha;
    const mirrors = [`app/public${link.url}`, `backend/src/main/resources/static${link.url}`].map(path => ({ path, present: fs.existsSync(path), sha256: fs.existsSync(path) ? hash(path) : null }));
    for (const mirror of mirrors) if (mirror.present && mirror.sha256 !== canonicalSha) throw new Error(`Image mirror mismatch: ${mirror.path}`);
    assets.push({ canonicalPath: row.canonicalAssetPath, sha256: canonicalSha, mirrors, machineApprovalReused: true, newVisualReview: false });
  }
  const currentLiveGoal = live.goals.find((g: any) => g.id === goal.id);
  if (currentLiveGoal && JSON.stringify(currentLiveGoal) !== JSON.stringify(goal)) throw new Error(`Current live whole contract changed for ${goal.id}`);
  const oldPath = `${author}/inputs/whole-old-${goal.id}.exact.jsonl`;
  let oldCases = 0;
  if (fs.existsSync(oldPath)) {
    const old = JSON.parse(fs.readFileSync(oldPath, 'utf8'));
    oldCases = old.profile.applicationCaseBriefs.length;
    if (JSON.stringify(old.profile.applicationCaseBriefs) !== JSON.stringify(record.profile.applicationCaseBriefs.slice(0, oldCases))) throw new Error(`Valid historical whole cases changed for ${goal.id}`);
    for (let index = 0; index < old.profile.expectations.length; index++) if (JSON.stringify(old.profile.expectations[index]) !== JSON.stringify(record.profile.expectations[index])) throw new Error(`Old expectation changed for ${goal.id}`);
  }
  const errors = validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic');
  checks.push({ goalId: goal.id, errors, cases: record.profile.applicationCaseBriefs.length, wholeOldCasesExact: oldCases, oldAnchorsExact: true, currentLiveWholeGoalExact: Boolean(currentLiveGoal), newInertGoal: !currentLiveGoal, assets, status: record.status, reviewAuthority: record.reviewAuthority, evidenceLevel: record.evidenceLevel, maximumClaimScope: record.maximumClaimScope, visualizationPending: assets.length === 0 });
}
const result = { reviewer: '/root/economics_source3_independent_final_performance_need', records: checks, nativeErrors: checks.flatMap(c => c.errors), wholePRecords: checks.length, wholeCases: checks.reduce((s, c) => s + c.cases, 0), wholeOldCasesExact: checks.reduce((s, c) => s + c.wholeOldCasesExact, 0), newVApproval: false, wholeSourceOrCourseApproval: false, humanApproval: false, strictGain: 0 };
fs.writeFileSync(`${own}/actual-independent-four-P12-current-contract-image-native-result.json`, `${JSON.stringify(result, null, 2)}\n`);
console.log(JSON.stringify(result, null, 2));
if (result.nativeErrors.length) process.exit(1);
