from pathlib import Path
import os,json,hashlib,datetime,subprocess,tempfile,time,shutil
D=Path(__file__).resolve().parent; J=D.parent; K=J/'capsule'
rel='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-current439-remediation14-guarded-root-integration-technical-v1/current4-v3-root-successor/central.current439.D113-P439V3.PROSPECTIVE.config.json'
cp=K/rel;config=json.loads(cp.read_text());s=config['subjects'][0]
assert len(config['subjects'])==1 and s['subject']=='chemie'
assert len(s['resolutionIndexPaths'])==113 and len(s['resolutionSupersessions'])==360
assert len(s['semanticAtomicityConfigPaths'])==76 and len(s['positiveEvidenceConfigPaths'])==123
assert len(s['resolutionWithdrawals'])==2
assert not (D/'STARTED.json').exists(),'Single invocation already started; inspect original handle'
def pin(p):
 p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,obj):
 p=D/name;p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return pin(p)
guards={}
def guard(p):
 p=Path(p);guards[str(p)]=pin(p)
guard(cp);guard(K/'app/scripts/reportDeepUnderstandingRollout.ts')
for key in ['landscapePath','semanticKindLedgerPath','memoryReviewConfigPath','visualizationQaPath']:
 guard(K/s[key])
for key in ['resolutionIndexPaths','semanticAtomicityConfigPaths','positiveEvidenceConfigPaths']:
 for relp in s[key]:
  p=K/relp;guard(p)
  if key!='resolutionIndexPaths':
   c=json.loads(p.read_text())
   for k in ['reviewPath','cardReviewPath']:
    if c.get(k):guard(K/c[k])
   for v in c.get('reviewRunManifestPaths',[]):guard(K/v)
m=json.loads((K/s['memoryReviewConfigPath']).read_text())
for k in ['reviewPath','cardReviewPath']:guard(K/m[k])
for p in (K/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json'):guard(p)
for p in (K/'app/public/data').glob('*chemistry*.json'):guard(p)
material=K/Path(rel).parent/'RECEIPT.current4-v3-corrective-material-paired-review.json';guard(material)
def checkpins(v):
 if isinstance(v,dict):
  if 'path' in v and 'sha256' in v:
   p=Path(v['path'])
   if p.is_absolute() and p.is_file():
    current=pin(p);assert current['sha256']==v['sha256'].removeprefix('sha256:'),p
    if 'bytes' in v:assert current['bytes']==v['bytes'],p
    guards[str(p)]=current
  for y in v.values():checkpins(y)
 elif isinstance(v,list):
  for y in v:checkpins(y)
checkpins(json.loads(material.read_text()))
write('GUARDS.before.json',list(guards.values()))
argv=['node','--preserve-symlinks','--preserve-symlinks-main','--import','/home/enpasos/projects/skillpilot/app/node_modules/tsx/dist/loader.mjs','app/scripts/reportDeepUnderstandingRollout.ts','--config='+rel,'--mode=report','--format=json']
runtime=Path(tempfile.mkdtemp(prefix='chemie-central-D113-',dir='/dev/shm'))
env=os.environ.copy();env.update({'TMPDIR':str(runtime),'TSX_DISABLE_CACHE':'1','NO_COLOR':'1'})
started=datetime.datetime.now(datetime.timezone.utc).isoformat();write('STARTED.json',{'atUTC':started,'argv':argv,'cwd':str(K),'configuration':pin(cp),'mode':'report; process exit zero alone is not check pass','singleInvocation':True,'noPDFOrCompilerInvoked':True,'guards':len(guards)})
t=time.monotonic()
with (D/'central.stock.stdout.json').open('xb') as so,(D/'central.stock.stderr.txt').open('xb') as se:
 proc=subprocess.Popen(argv,cwd=K,env=env,stdout=so,stderr=se);print(json.dumps({'centralPID':proc.pid,'guardedInputs':len(guards),'singleInvocation':True}),flush=True);code=proc.wait()
elapsed=time.monotonic()-t
changed=[]
for p,before in guards.items():
 after=pin(p)
 if after!=before:changed.append({'before':before,'after':after})
write('GUARDS.after.json',{'checked':len(guards),'changed':changed})
report=json.loads((D/'central.stock.stdout.json').read_text());summary={'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'startedAtUTC':started,'exitCode':code,'elapsedSeconds':elapsed,'stockReportModeIsNotCheckPass':True,'configuration':pin(cp),'stdout':pin(D/'central.stock.stdout.json'),'stderr':pin(D/'central.stock.stderr.txt'),'guardedInputs':len(guards),'changedInputs':changed,'blockingIssueCount':report.get('blockingIssueCount'),'subjects':[{k:x.get(k) for k in ['subject','denominator','strictComplete','percentage','gates','remaining','requiredChecks','strictCompletionReady','deferredVisualizationGoalIds','issues']} for x in report['subjects']],'newScientificVotes':0,'mainChanged':False,'humanApproval':False}
write('RESULT.actual-current439-D113-P439V3.json',summary);shutil.rmtree(runtime)
print(json.dumps({k:v for k,v in summary.items() if k!='subjects'}|{'subjects':[{k:v for k,v in x.items() if k not in ['issues','requiredChecks','deferredVisualizationGoalIds']} for x in summary['subjects']]},ensure_ascii=False),flush=True)
assert not changed,'Input mutation during read-only report'
raise SystemExit(code)
