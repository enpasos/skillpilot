import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';

async function main() {
  const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/biologie-0beb-stomata-underside-fresh-independent-a-20261012-v1';
  const record = JSON.parse(readFileSync(`${base}/inputs/P1.current.jsonl`, 'utf8'));
  const land = JSON.parse(readFileSync(`${base}/inputs/canonical.inactive.json`, 'utf8'));
  const goal = land.goals.find((g: any) => g.id === record.goalId);
  const ledger = JSON.parse(readFileSync(`${base}/inputs/P.semantic-kinds.current.json`, 'utf8'));
  const kind = ledger.decisions.find((d: any) => d.goalId === goal.id);
  const bytes = readFileSync(`${base}/inputs/0beb4ca2-2437-557a-9db2-ccda1cbcfa0a.png`);
  const imageSHA = 'sha256:' + createHash('sha256').update(bytes).digest('hex');
  const resourceURL = goal.resourceLinks.find((l: any) => l.type === 'goal-visualization').url;
  const resourceDigests = { [resourceURL]: imageSHA };
  const normal = await import(pathToFileURL(resolve('app/scripts/positiveGoalEvidenceProfileModel.ts')).href);
  const errors = normal.validatePositiveGoalEvidenceRecordSemantics(record, goal, resourceDigests, kind.semanticKind);
  const acceptedCandidate = (record.status === 'needs_human_review' && record.reviewAuthority === 'ai_candidate') || (record.status === 'approved' && record.reviewAuthority === 'human');
  if (!acceptedCandidate) errors.push('Normal central candidate-status predicate does not accept this record.');
  const receipt = {
    goalId: goal.id,
    goalFingerprint: normal.fingerprintGoalForPositiveEvidence(goal, kind.semanticKind),
    reviewInputFingerprint: normal.fingerprintPositiveGoalEvidenceReviewInput(goal, record.reviewCriteriaFingerprint, resourceDigests, kind.semanticKind),
    profileFingerprint: normal.fingerprintPositiveGoalEvidenceProfile(record.profile),
    actualResourceDigests: resourceDigests,
    semanticKind: kind.semanticKind,
    semanticKindDecisionStatus: kind.decisionStatus,
    normalSemanticValidatorPath: 'app/scripts/positiveGoalEvidenceProfileModel.ts',
    normalCentralStatusPredicateSource: 'app/scripts/reportDeepUnderstandingRollout.ts:loadEvidenceReadyGoals',
    acceptedCandidate,
    errors,
    currentPStatus: record.status,
    currentPAuthority: record.reviewAuthority,
    evidenceLevel: record.evidenceLevel,
    maximumClaimScope: record.maximumClaimScope,
    activeM7Claim: false,
    humanApproval: false,
    learnerPerformanceObserved: false,
  };
  writeFileSync(`${base}/P-current/P.normal-semantics-and-predicate.receipt.json`, JSON.stringify(receipt, null, 2) + '\n', { flag: 'wx' });
  process.stdout.write(JSON.stringify(receipt) + '\n');
  if (errors.length) process.exitCode = 1;
}
main().catch(e => { process.stderr.write(String(e) + '\n'); process.exitCode = 1; });
