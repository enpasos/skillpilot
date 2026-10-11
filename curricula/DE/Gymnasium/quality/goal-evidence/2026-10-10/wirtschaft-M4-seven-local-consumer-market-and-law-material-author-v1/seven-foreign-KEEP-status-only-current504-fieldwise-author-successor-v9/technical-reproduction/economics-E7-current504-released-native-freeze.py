from pathlib import Path
import json,subprocess,shutil,hashlib
R=Path('/home/enpasos/projects/skillpilot');V=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-seven-local-consumer-market-and-law-material-author-v1/seven-foreign-KEEP-status-only-current504-fieldwise-author-successor-v9';cap=Path('/tmp/skillpilot-economics-macro12-current504-wxkcpkyv')
def read(p):return json.loads(p.read_text())
ix=read(V/'actual-current504-fieldwise-rebase-of-foreign-one-root140.only-practice-accesses.index.json');sem=V/'whole-current504-plus-seven-foreign-practice-kind-proposals-and-one-nav-FP.inert-SEM511.json'
def detached(p,t):
 t.parent.mkdir(parents=True,exist_ok=True)
 if t.exists()or t.is_symlink():t.unlink()
 shutil.copyfile(p,t)
detached(R/ix['whole511Candidate']['path'],cap/ix['current504']['path'])
for r in ix['viewRows']:detached(R/r['candidate']['path'],cap/r['activePath'])
# Current active v8 ledger path remains the landscape binding in this inert capsule only.
detached(sem,cap/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current504-four-qualified-route-packages-20261010-v8/wirtschaftswissenschaften.semantic-kinds.json')
raw=V/'actual-current504-plus-seven-released-E140.current-native-whole64scope.json';cmd=[str(cap/'app/node_modules/.bin/tsx'),str(cap/'native-macro12-current504-intake.ts'),str(raw)];run=subprocess.run(cmd,cwd=cap,capture_output=True,text=True);(V/'actual-current511-E140-native.stdout.raw.txt').write_text(run.stdout);(V/'actual-current511-E140-native.stderr.raw.txt').write_text(run.stderr);assert run.returncode==0,run.stderr
b=read(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-twelve-macro-contracts-coherent-local-material-author-v1/actual-current504-twelve-macro-native-whole64-scope-intake.valid-local-tsx-successor-v2.json');a=read(raw);assert a['goalCount']==511 and a['compilerSummary']['errors']==0 and a['compilerSummary']['warnings']==0
keys=['ordinaryTargetIds','visibleAllAtomicIds','visibleTargetAtomicIds']
# Exact semantic ordinary-target/support/memory retention is compared using canonical ID types, excluding only the7 newly qualified practice IDs.
ng={g['id']for g in read(R/ix['newForeignReleased7']['path'])};assert len(b['allScopeRows'])==len(a['allScopeRows'])==64
for x,y in zip(b['allScopeRows'],a['allScopeRows']):
 assert x['viewPath']==y['viewPath'] and x['jurisdiction']==y['jurisdiction'] and x['scopeFilters']==y['scopeFilters'];assert x['ordinaryTargetIds']==y['ordinaryTargetIds']
 for k in keys[1:]:assert set(x[k])==set(y[k])-ng
 assert not y['wholeMaterialCoverageBindingIssues'] and not y['wholeMaterialPrerequisiteClosureIssues']
rb=next(r for r in b['nativeRules']if r['id']=='CQR-104');ra=next(r for r in a['nativeRules']if r['id']=='CQR-104');assert ra['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']<=rb['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute']
print(json.dumps({'goalCount':a['goalCount'],'compiler':a['compilerSummary'],'beforeGaps':rb['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],'afterGaps':ra['metrics']['visibleSelectedGoalOccurrencesMissingEffectiveTerminalRoute'],'beforeUnique':rb['metrics']['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'],'afterUnique':ra['metrics']['uniqueVisibleSelectedGoalsMissingEffectiveTerminalRoute'],'all64OriginalOrdinaryAndSupportMemorySetsExact':True,'actualWholeClosureMissing':ra['metrics']['wholeMaterialPrerequisiteOccurrencesMissingFromProjection']}))
