"""Read-only consistency replay of the E25 draft; no content/release approval."""
from pathlib import Path
import hashlib,json,subprocess
root=Path.cwd();base=root/'docs/dev/ci-graph-repairs';prefix='informatics-e25-terminal-candidate-2026-11-06'
review=json.loads((base/(prefix+'.review-input.json')).read_bytes())
def sha(b):return hashlib.sha256(b).hexdigest()
def canonical(o):return json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()
for item in review['artifacts']:
 assert sha((root/item['path']).read_bytes())==item['sha256'],item['path']
source=review['sourceBinding'];original=subprocess.check_output(['git','show',source['baseCommit']+':'+source['path']]);assert sha(original)==source['baseRawSha256'];current=(root/source['path']).read_bytes();assert sha(current)==source['currentContextRawSha256'],'Active source changed since bounded draft review input; do not silently rebind.'
before=json.loads(original);after=json.loads(current);old={g['id']:g for g in before['goals']};active={g['id']:g for g in after['goals']};terminal=old[review['goalId']];assert terminal==active[review['goalId']]
exam=json.loads((base/(prefix+'.exam-data.json')).read_bytes());assert exam['reviewStatus']=='draft';assert exam['coveredGoalIds']==terminal['examData']['coveredGoalIds'];assert len(exam['coveredGoalIds'])==25==len(set(exam['coveredGoalIds']));assert exam['coveredStrands']==terminal['examData']['coveredStrands'];assert exam['demandLevels']==terminal['examData']['demandLevels']
steps=exam['scoring']['steps'];assert len(steps)==25;assert exam['scoring']['maxPoints']==exam['scoring']['passingPoints']==sum(s['points'] for s in steps)==25
artifactDir=base/'informatics-e25-terminal-reference-2026-11-06';assert exam['taskContent']==(artifactDir/'task.md').read_text();assert exam['solutionContent']==(artifactDir/'solution.md').read_text()
for n,(step,binding,goalId) in enumerate(zip(steps,review['competencyBindings'],exam['coveredGoalIds']),1):
 assert step['id']==binding['criterionId']==f'K{n:02}';assert step['points']==binding['points']==1;assert step['description']==binding['rubricCriterion'];assert binding['coveredGoalIndex']==n-1;assert binding['goalId']==goalId;assert binding['sourceGoal']==old[goalId];assert sha(canonical(old[goalId]))==binding['sourceGoalCanonicalSha256']
 changed=[k for k in sorted(set(old[goalId])|set(active[goalId])) if old[goalId].get(k)!=active[goalId].get(k)];assert set(changed)<={'requires'};assert changed==binding['currentContextComparison']['changedFields'];assert binding['currentContextComparison']['currentGoalCanonicalSha256']==sha(canonical(active[goalId]));assert f'**A{n:02} ' in exam['taskContent'];assert f'## S{n:02} ' in exam['solutionContent'];assert sum(s['points'] for s in steps)-step['points']==24<exam['scoring']['passingPoints']
assert sum(s['points'] for s in steps)==25
for run in review['execution']['runs']:assert run['exitCode']==run.get('expectedExitCode',0),run
native=review['execution']['nativeDraftReadiness'];assert native['nativeResult']['status']=='fail';assert native['expectedBlockingReason']=='reviewStatus=draft';assert len(native['nativeResult']['details'])==1 and native['nativeResult']['details'][0].endswith('(reviewStatus=draft)')
assert review['status']=='candidate-review-pending';assert review['sourceApplied'] is False;assert review['contentReviewApproval'] is False;assert review['releaseApproval'] is False
print(json.dumps({'artifactConsistency':'PASS','fixedCoverageGoals':25,'criteria':25,'singleMissingCriterionTotals':[24]*25,'nativeDraftCqr202Status':'fail','sourceUnchangedDuringReplay':sha((root/source['path']).read_bytes())==source['currentContextRawSha256'],'boundary':'Read-only bindings, arithmetic and existing native readiness only; no human content/release/maturity/learner acceptance.'},ensure_ascii=False))
