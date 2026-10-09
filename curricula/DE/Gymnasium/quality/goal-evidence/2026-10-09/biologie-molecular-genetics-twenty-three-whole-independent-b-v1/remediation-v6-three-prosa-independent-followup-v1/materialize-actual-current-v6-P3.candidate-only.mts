import { readFileSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  fingerprintGoalForPositiveEvidence,
  fingerprintPositiveGoalEvidenceProfile,
  fingerprintPositiveGoalEvidenceReviewInput,
  validatePositiveGoalEvidenceRecordSemantics,
} from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';

const root = '/home/enpasos/projects/skillpilot';
const own = dirname(fileURLToPath(import.meta.url));
const author = resolve(root, 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/remediation-v6');
const parse = (p: string) => JSON.parse(readFileSync(p, 'utf8'));
const bind = (p: string) => { const bytes = readFileSync(p); return { path: p.slice(root.length + 1), sha256: 'sha256:' + createHash('sha256').update(bytes).digest('hex'), bytes: bytes.length }; };
const verdictPath = resolve(own, 'three-current-v6-profiles-six-cases.independent-b.prosa-first.verdict.json');
const verdict = parse(verdictPath);
const wholePath = resolve(author, 'twenty-three-whole46-bilingual-cases-and-P.v6.author-candidate.json');
const whole = parse(wholePath);
const authorConfig = parse(resolve(author, 'twenty-three-whole-positive.v6.author-candidate.config.json'));
const landscapePath = resolve(root, authorConfig.landscapePath);
const kindPath = resolve(root, authorConfig.semanticKindLedgerPath);
const criteriaPath = resolve(root, authorConfig.reviewCriteriaPath);
const landscape = parse(landscapePath);
const kinds = parse(kindPath);
const reviewId = 'biologie-molecular-genetics-three-prosa-independent-b-v6';
const criteriaFp = bind(criteriaPath).sha256;
const rows = verdict.results.map((result: any) => {
  const entry = whole.entries.find((e: any) => e.goalId === result.goalId);
  const goal = landscape.goals.find((g: any) => g.id === result.goalId);
  const kind = kinds.decisions.find((d: any) => d.goalId === result.goalId);
  if (!entry || !goal || kind?.decisionStatus !== 'authoritative') throw new Error('Missing actual goal/profile/authoritative kind for ' + result.goalId);
  const profile = entry.wholeProfile;
  const dissent = result.remainingIssues.map((issue: any) => issue.id + ': ' + issue.reason + ' Remedy: ' + issue.exactRemedy);
  return {
    $schema: 'https://skillpilot.com/schemas/goal-evidence/v2/goal-evidence-profile.schema.json',
    schemaVersion: 2,
    reviewId,
    goalFingerprintRuleVersion: 'goal-evidence-v1',
    profileRuleVersion: 'positive-understanding-evidence-v2',
    reviewCriteriaFingerprint: criteriaFp,
    landscapeId: landscape.landscapeId ?? authorConfig.landscapeId,
    goalId: result.goalId,
    goalFingerprint: fingerprintGoalForPositiveEvidence(goal, kind.semanticKind),
    reviewInputFingerprint: fingerprintPositiveGoalEvidenceReviewInput(goal, criteriaFp, {}, kind.semanticKind),
    profileFingerprint: fingerprintPositiveGoalEvidenceProfile(profile),
    status: 'needs_human_review',
    reviewAuthority: 'ai_candidate',
    reviewedAt: verdict.reviewedAt,
    reviewer: '/root/bio_science14_independent_b; actual targeted current-v6 prose read, own unchanged v4 science',
    reason: result.reason + ' Current v6 positive-profile material candidate only. Ordinary native/current-raster/source-course/human gates remain pending; case-local text dissent is separately retained where present.',
    evidenceLevel: 'E1',
    maximumClaimScope: 'G1',
    reviewRunIds: [],
    dissent,
    profile,
  };
});
const configPath = resolve(own, 'three-current-v6-positive.independent-b.candidate-only.config.json');
const recordsPath = resolve(own, 'three-current-v6-positive.independent-b.candidate-only.review.jsonl');
const config = {
  ...authorConfig,
  reviewId,
  reviewPath: recordsPath.slice(root.length + 1),
  reviewRunManifestPaths: [],
  reviewedResourceTypes: [],
  requireApproved: false,
  scope: {
    label: 'Actual current-v6 targeted three-profile/six-case prose followup and retained own v4 finite-model science; candidate only, no native/raster/source approval; case-rubric dissent retained',
    goalIds: rows.map((r: any) => r.goalId),
  },
};
writeFileSync(recordsPath, rows.map((r: any) => JSON.stringify(r)).join('\n') + '\n', { flag: 'wx' });
writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', { flag: 'wx' });
const errors = rows.flatMap((r: any) => validatePositiveGoalEvidenceRecordSemantics(
  r,
  landscape.goals.find((g: any) => g.id === r.goalId),
  {},
  kinds.decisions.find((d: any) => d.goalId === r.goalId)?.semanticKind,
));
const receipt = {
  schemaVersion: 1,
  role: 'Actual unchanged ordinary P semantic helper: candidate-only current-v6 profile material bindings, not current native/raster approval',
  helper: bind(resolve(root, 'app/scripts/positiveGoalEvidenceProfileModel.ts')),
  semanticFirst: bind(verdictPath),
  config: bind(configPath),
  records: bind(recordsPath),
  currentWholeInput: bind(wholePath),
  candidateLandscape: bind(landscapePath),
  candidateKinds: bind(kindPath),
  criteria: bind(criteriaPath),
  checkedGoalIds: rows.map((r: any) => r.goalId),
  currentProfilesValueExact: rows.every((r: any) => JSON.stringify(r.profile) === JSON.stringify(whole.entries.find((e: any) => e.goalId === r.goalId).wholeProfile)),
  errors,
  caseProseDissentRetained: rows.map((r: any) => ({ goalId: r.goalId, dissent: r.dissent })),
  resourceDigests: {},
  reviewedResourceTypes: [],
  reviewRunIds: [],
  actualNativeApproval: false,
  currentRasterApproval: false,
  sourceCourseApproval: false,
  humanApproval: false,
  strictGain: 0,
};
writeFileSync(resolve(own, 'actual-current-v6-P3-existing-semantic-helper.candidate-only.receipt.json'), JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
console.log(JSON.stringify({ records: rows.length, errors, candidateOnly: true, caseProseDissentRetained: rows.some((r: any) => r.dissent.length > 0) }, null, 2));
if (errors.length) process.exitCode = 1;
