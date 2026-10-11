from pathlib import Path
import json,hashlib,subprocess,time,copy,shutil
R=Path('/home/enpasos/projects/skillpilot');Q=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10';O=Q/'wirtschaft-current678-M6-floor-and-current-D-diagnostic-root-v1';O.mkdir(exist_ok=False)
def rd(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def save(n,x):
 p=O/n;assert not p.exists();p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return bind(p)
central=R/'docs/qa-ci/status/curriculum-quality-status.json';status=rd(central);econ=next(x for x in status['curricula'] if x['landscapeId']=='605bdaf6-32d5-56fd-8d92-5a80c2fd2901');assert econ['maturity']=='M6'
assert all(x['status']=='pass' for x in econ['rules'] if x['id']!='CQR-303') and all(x['maturity']=='M4' for x in econ['scopes'])
for lid,count in [('68a8ac50-f5f5-4e24-8aa9-5e408ca01ced',807),('7f6fc60c-9fcc-4cc2-b07e-f897a1d0338a',478)]:
 c=next(x for x in status['curricula'] if x['landscapeId']==lid);r=next(x for x in c['rules'] if x['id']=='CQR-303');assert c['maturity']=='M7' and r['status']=='pass' and r['metrics']['strictComplete']==r['metrics']['expectedGoals']==count and r['metrics']['blockingIssues']==0
policy=R/'app/scripts/config/curriculum-maturity-floor-policy.json';old=rd(policy);assert len(old['floors'])==9 and not any(x['landscapeId']==econ['landscapeId'] for x in old['floors']);archive=O/'whole-original-nine-floor-policy-history.before-economics-M6.json';archive.write_bytes(policy.read_bytes());new=copy.deepcopy(old)
new['floors'].append({'landscapeId':econ['landscapeId'],'frameworkId':econ['frameworkId'],'subject':econ['subject'],'minimumMaturity':'M6','reason':'Economics M6 restored after the current whole-material route issues were repaired and independently reviewed. The actual central report and source, route, assessment, semantic-atomicity, memory, composition and applicability gates passed on 10 October 2026. M7 and human release/trial gates remain separate.'})
assert new['floors'][:9]==old['floors'] and {k:v for k,v in new.items() if k!='floors'}=={k:v for k,v in old.items() if k!='floors'}
policy.write_text(json.dumps(new,ensure_ascii=False,indent=2)+'\n')
node=Path('/tmp/skillpilot-checkpoint-native-node-path.txt').read_text().strip();cli=R/'app/node_modules/tsx/dist/cli.mjs'
def run(label,script,args):
 out=O/(label+'.stdout.txt');err=O/(label+'.stderr.txt');start=time.monotonic();argv=[node,str(cli),'scripts/'+script,*args]
 with out.open('w') as of,err.open('w') as ef:r=subprocess.run(argv,cwd=R/'app',stdout=of,stderr=ef)
 receipt=save(label+'.actual-command-exit.json',{'argv':argv,'cwd':str(R/'app'),'actualExit':r.returncode,'seconds':time.monotonic()-start,'stdout':bind(out),'stderr':bind(err)})
 assert r.returncode==0,(label,err.read_text());print(label,'actualExit',r.returncode,flush=True);return receipt
floor=run('actual-ten-protected-floors','checkCurriculumMaturityFloors.ts',[])
save('actual-current678-Economics-M6-floor-protected-all-nine-prior-floors-and-two-M7.json',{'actualCentralReport':bind(central),'actualOldWholeFloorPolicy':bind(archive),'actualNewWholeFloorPolicy':bind(policy),'actualExistingNineFloorsExceptionsAndHistoricalDebtExact':True,'actualEconomicsNewMinimumM6Only':True,'actualFloorCommand':floor,'actualMath807AndPhysics478M7Verified':True,'currentEconomicsM6':True,'humanReleaseTrialApproval':False,'imagesGenerated':0})
reg=R/'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';whole=rd(reg);slice=copy.deepcopy(whole);slice['subjects']=[x for x in slice['subjects'] if x['subject']=='wirtschaftswissenschaften'];assert len(slice['subjects'])==1
cfg=save('actual-current678-economics-only-readonly-registry-slice.json',slice)
guards={str(p.relative_to(R)):hashlib.sha256(p.read_bytes()).hexdigest() for p in [reg,R/econ['path']]}
diagnostic=run('actual-current678-economics-only-complete-DPAMV-diagnostic','reportDeepUnderstandingRollout.ts',['--config='+cfg['path'],'--mode=report','--format=json'])
report=rd(O/'actual-current678-economics-only-complete-DPAMV-diagnostic.stdout.txt');s=report['subjects'][0];m=next(x['metrics'] for x in econ['rules'] if x['id']=='CQR-303')
assert s['denominator']==m['expectedGoals']==336 and s['strictComplete']==m['strictComplete']==187 and s['remaining']==m['remaining']==149 and len(s['issues'])==m['blockingIssues']==123
assert len(s['currentGoalIds'])==336 and len(s['strictCompleteGoalIds'])==187 and sum(x['status']=='pass' for x in s['requiredChecks'])==5
assert all(hashlib.sha256((R/p).read_bytes()).hexdigest()==sha for p,sha in guards.items())
full=save('actual-current678-full-Economics-DPAMV-report-with-all336-IDs187-complete149-open.json',report)
openIds=save('actual-current678-current149-open-description-goal-IDs.json',sorted(set(s['currentGoalIds'])-set(s['strictCompleteGoalIds'])))
save('actual-current678-scoped-diagnostic-current-central-metrics-exact.receipt.json',{'role':'fresh Economics-only diagnostic needed to expose all current IDs and full description/owner/supersession findings omitted by the central summary; no second full central run and no new science decision','actualCentral':bind(central),'actualActiveWholeRegistry':bind(reg),'actualReadonlyEconomicsSlice':cfg,'actualReportModeCommand':diagnostic,'actualFullEconomicReport':full,'actual149OpenGoalIDs':openIds,'actualCurrentCentralMetricsExact':True,'reportModeExitZeroDoesNotClaimM7ChecksPassed':True,'currentStrictComplete':187,'remaining':149,'requiredChecksPassed':5,'requiredChecksTotal':6,'actualOpenIssues':123,'strictNet':0,'newScientificApprovals':0,'humanApproval':False})
shutil.copyfile(__file__,O/'actual-executed-floor-and-scoped-diagnostic-helper.py');print(json.dumps({'output':str(O.relative_to(R)),'M6':True,'strict187of336':True,'floorCount':10,'fullDiagnostic':full}),flush=True)
