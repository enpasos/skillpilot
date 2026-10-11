import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { pathToFileURL } from 'node:url';

async function main() {
  const root = process.cwd();
  const outputBase = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-P981-historical-debate-independent-root-v1';
  const authorBase = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-market02-real-German-GWB-discussion-P981-third-case-author-v1';
  const currentP = authorBase + '/whole-one-P981-three-cases-current-native-bound.real-debate-slug-corrected.author-v2.jsonl';
  const priorP = authorBase + '/inputs/whole-eight-seventeen-final-positive-v4.current-native-bound.author-candidates.jsonl';
  const currentGoals = authorBase + '/whole-one-unchanged-981-goal-contract.for-native-binder.json';
  const liveGoals = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';
  const qaPath = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/wirtschaftswissenschaften.qa.json';
  const modelPath = 'app/scripts/positiveGoalEvidenceProfileModel.ts';
  const outP = outputBase + '/whole-one-independently-content-reviewed-P981-three-cases.with-actual-current-QA-image-binding-only.jsonl';
  const outReceipt = outputBase + '/actual-independent-P981-three-cases-current-QA-binding-only-and-exact-valid-history-reuse.receipt.json';
  if (fs.existsSync(path.join(root, outP)) || fs.existsSync(path.join(root, outReceipt))) throw Error('Immutable output exists');
  const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
  const parse = (p: string) => JSON.parse(read(p));
  const rows = (p: string) => read(p).trim().split('\n').map(x => JSON.parse(x));
  const digest = (p: string) => 'sha256:' + crypto.createHash('sha256').update(fs.readFileSync(path.join(root, p))).digest('hex');
  const bind = (p: string) => ({ path: p, sha256: digest(p) });
  const record = rows(currentP)[0];
  const prior = rows(priorP).find(r => r.goalId === record.goalId);
  const goal = parse(currentGoals)[0];
  const liveGoal = parse(liveGoals).goals.find((g: any) => g.id === record.goalId);
  if (JSON.stringify(goal) !== JSON.stringify(liveGoal)) throw Error('Whole current goal changed');
  const priorCases = prior.profile.applicationCaseBriefs;
  const currentCases = record.profile.applicationCaseBriefs;
  if (priorCases.length !== 2 || currentCases.length !== 3 || JSON.stringify(priorCases) !== JSON.stringify(currentCases.slice(0, 2))) throw Error('Previously independently reviewed whole two cases changed');
  if (JSON.stringify(prior.profile.expectations) !== JSON.stringify(record.profile.expectations) || JSON.stringify(prior.profile.coverageExpectations) !== JSON.stringify(record.profile.coverageExpectations)) throw Error('Existing whole core changed');
  if (record.status !== 'needs_human_review' || record.reviewAuthority !== 'ai_candidate' || record.evidenceLevel !== 'E1' || record.maximumClaimScope !== 'G1') throw Error('Truthful evidence boundary changed');
  const qa = parse(qaPath).records.find((q: any) => q.goalId === record.goalId);
  const resourceDigests: Record<string, string> = {};
  const assets = [];
  const guards = [currentP, priorP, currentGoals, liveGoals, qaPath, modelPath,
    authorBase + '/actual-portable-whole-primary-dossier-and-unchanged-own-bilingual-reading-aids.successor-v3.json',
    authorBase + '/actual-whole-old-P2-current-P3-Source2-with-portable-primary-inputs.successor-v3.json',
    authorBase + '/actual-portable-two-whole-primary-text-PDF-archives-P3-body-retention.v3.receipt.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-eight-P16-source-delta-independent-root-v1/actual-final-independent-eight-KEEP-P17-bounded252-resolution-and-valid-history-retention.receipt.json'
  ].map(bind);
  for (const link of goal.resourceLinks ?? []) {
    if (link.type !== 'goal-visualization') continue;
    const publicPath = 'app/public/' + link.url.slice(1);
    const canonicalPath = publicPath.replace('app/public/assets/goal-visualizations/', 'curricula/DE/Gymnasium/visualizations/');
    const backendPath = 'backend/src/main/resources/static/' + link.url.slice(1);
    const hash = digest(publicPath);
    if (hash !== digest(canonicalPath) || hash !== digest(backendPath) || qa.imageUrl !== link.url || qa.assetSha256 !== hash || qa.aiApproved !== 'yes' || qa.aiApprovedAssetSha256 !== hash) throw Error('Current explicit visualization approval or actual bytes differ');
    resourceDigests[link.url] = hash;
    assets.push({ canonical: bind(canonicalPath), public: bind(publicPath), generatedBackend: bind(backendPath) });
    guards.push(bind(canonicalPath), bind(publicPath), bind(backendPath));
  }
  if (assets.length !== 1) throw Error('Expected exactly one approved current image');
  const native = await import(pathToFileURL(path.join(root, modelPath)).href);
  const beforeErrors = native.validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, 'curricularAtomic');
  const bound = structuredClone(record);
  bound.reviewInputFingerprint = native.fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, resourceDigests, 'curricularAtomic');
  const changed = Object.keys(record).filter(k => JSON.stringify(record[k]) !== JSON.stringify(bound[k]));
  if (changed.length && JSON.stringify(changed) !== JSON.stringify(['reviewInputFingerprint'])) throw Error('Not a bounded binding-only correction');
  const afterErrors = native.validatePositiveGoalEvidenceRecordSemantics(bound, goal, resourceDigests, 'curricularAtomic');
  if (afterErrors.length) throw Error(afterErrors.join('\n'));
  const after = guards.map(x => bind(x.path));
  if (JSON.stringify(guards) !== JSON.stringify(after)) throw Error('Input changed during verification');
  fs.writeFileSync(path.join(root, outP), JSON.stringify(bound) + '\n');
  const written = rows(outP);
  if (written.length !== 1 || JSON.stringify(written[0]) !== JSON.stringify(bound)) throw Error('Whole JSONL parse mismatch');
  fs.writeFileSync(path.join(root, outReceipt), JSON.stringify({
    at: new Date().toISOString(), reviewer: '/root', author: '/root/economics_merge_audit',
    scope: 'Actual current-image binding and exact reuse of two independently reviewed prior cases; substantive new-case and Source2 decisions are in a separate human-readable independent receipt.',
    currentGoal: bind(currentGoals), originalWholeP3: bind(currentP), actualCurrentBoundP3: bind(outP),
    nativeModel: bind(modelPath), beforeErrors, afterErrors, changedFields: changed,
    actualResourceDigests: resourceDigests, assets, explicitCurrentMachineVisualApproval: { reviewer: qa.aiReviewer, reviewedAt: qa.aiReviewedAt, notes: qa.aiNotes },
    wholeGoalExact: true, oldTwoWholeCasesExact: true, priorExpectationsAndCoverageExact: true, wholeProfileAndThreeCasesUnchangedByTechnicalCorrection: true,
    originalAuthorReviewerStatusAndAuthorityPreserved: true, newVisualReviewClaimed: false, before: guards, after,
    wholeSourceOrCourseOrDOrHumanApproval: false, liveWrites: false, newStrictAcademicClosures: 0, restoredStrictBindings: 0, strictNetGain: 0
  }, null, 2) + '\n');
  console.log(JSON.stringify({ receipt: bind(outReceipt), currentBoundP3: bind(outP), beforeErrors, afterErrors, changedFields: changed, strictNetGain: 0 }));
}
main().catch(error => { console.error(String(error)); process.exitCode = 1; });
