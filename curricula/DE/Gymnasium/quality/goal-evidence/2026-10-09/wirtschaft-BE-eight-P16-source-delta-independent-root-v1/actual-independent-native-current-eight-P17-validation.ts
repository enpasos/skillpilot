import fs from 'node:fs';
import crypto from 'node:crypto';
import { validatePositiveGoalEvidenceRecordSemantics } from '/home/enpasos/projects/skillpilot/app/scripts/positiveGoalEvidenceProfileModel.ts';
const root = '/home/enpasos/projects/skillpilot';
const source = `${root}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-source125-eight-existing-profile-sixteen-case-remedy-author-v1`;
const output = `${root}/curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-BE-eight-P16-source-delta-independent-root-v1/actual-independent-native-current-eight-P17-model-validation.receipt.json`;
if (fs.existsSync(output)) throw new Error('Do not overwrite historical review evidence');
const pPath = `${source}/whole-eight-seventeen-final-positive-v4.current-native-bound.author-candidates.jsonl`;
const gPath = `${source}/whole-eight-unchanged-current-goal-contracts.for-native-binder.json`;
const goals = JSON.parse(fs.readFileSync(gPath, 'utf8'));
const records = fs.readFileSync(pPath, 'utf8').trim().split('\n').map(line => JSON.parse(line));
const results = records.map(record => ({ goalId:record.goalId, wholeBilingualCases:record.profile.applicationCaseBriefs.length,
  errors:validatePositiveGoalEvidenceRecordSemantics(record, goals.find((g:any) => g.id === record.goalId), {}, 'curricularAtomic') }));
const bind = (path:string) => ({path:path.slice(root.length+1),sha256:`sha256:${crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex')}`});
const allErrorsZero = results.every(r => r.errors.length === 0);
fs.writeFileSync(output, JSON.stringify({at:new Date().toISOString(),kind:'independent native model check, content acceptance in separate whole-review receipt',
  inputs:bind(pPath),goals:bind(gPath),nativeModel:bind(`${root}/app/scripts/positiveGoalEvidenceProfileModel.ts`),results,allErrorsZero,
  wholeSourceOrCourseOrDescriptionApproval:false,humanApproval:false,liveStrictNet:0},null,2)+'\n');
console.log(JSON.stringify({allErrorsZero,goals:results.length,cases:results.reduce((n,r)=>n+r.wholeBilingualCases,0),errors:results.flatMap(r=>r.errors)}));
if (!allErrorsZero) process.exitCode = 1;
