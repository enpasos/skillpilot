import {readFileSync, writeFileSync, mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';

const repo = process.cwd();
const base = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-b014-foundation-three-current231-scientific-author-20261013-v1';
const capsule = resolve(repo, 'tmp/chemie-q4-current220-prep/execution/app');
const modules = ['materializePositiveGoalEvidenceCandidates.ts', 'positiveGoalEvidenceProfileModel.ts', 'positiveGoalEvidenceReview.ts', 'goalEvidenceProfileModel.ts', 'semanticAtomicityReview.ts', 'memoryCardReview.ts'];
const hash = (b: Buffer) => 'sha256:' + createHash('sha256').update(b).digest('hex');
const moduleBindings = modules.map(name => {
  const actual = readFileSync(resolve(capsule, 'scripts', name));
  const current = readFileSync(resolve(repo, 'app/scripts', name));
  if (!actual.equals(current)) throw new Error('Private checker differs from current repository module: ' + name);
  return {modulePath: 'app/scripts/' + name, privateExecutionPath: 'tmp/chemie-q4-current220-prep/execution/app/scripts/' + name, byteExact: true, sha256: hash(actual)};
});
const read = (p: string) => JSON.parse(readFileSync(resolve(repo, p), 'utf8'));
const {buildPositiveGoalEvidenceCandidateRecords} = await import(resolve(capsule, 'scripts/materializePositiveGoalEvidenceCandidates.ts'));
const {reviewPositiveGoalEvidenceConfig} = await import(resolve(capsule, 'scripts/positiveGoalEvidenceReview.ts'));
const config = read(base + '/configs/P3.inactive.config.json');
const candidates = read(base + '/positive/P3.original-author.candidate-set.json');
const records = await buildPositiveGoalEvidenceCandidateRecords({config, candidateSet: candidates});
writeFileSync(resolve(repo, config.reviewPath), records.map((r: unknown) => JSON.stringify(r)).join('\n') + '\n');
const result = reviewPositiveGoalEvidenceConfig(base + '/configs/P3.inactive.config.json');
mkdirSync(resolve(repo, base, 'checks'), {recursive: true});
writeFileSync(resolve(repo, base, 'checks/P3.normal-materialization-and-check.actual.json'), JSON.stringify({schemaVersion: 1, role: 'Actual unmodified normal P APIs; authored ai_candidate records and current fingerprints only; no independent scientific approval', moduleBindings, records: records.length, result: {errors: result.errors, counts: result.counts}, goalBindings: records.map(r => ({goalId:r.goalId, goalFingerprint:r.goalFingerprint, reviewInputFingerprint:r.reviewInputFingerprint, profileFingerprint:r.profileFingerprint, status:r.status, reviewAuthority:r.reviewAuthority})), strictGain: 0, activeWrites: false, humanApproval: false}, null, 2) + '\n');
console.log(JSON.stringify({P3: records.length, errors: result.errors, counts: result.counts, strictGain: 0}));
if (result.errors.length) process.exitCode = 1;
