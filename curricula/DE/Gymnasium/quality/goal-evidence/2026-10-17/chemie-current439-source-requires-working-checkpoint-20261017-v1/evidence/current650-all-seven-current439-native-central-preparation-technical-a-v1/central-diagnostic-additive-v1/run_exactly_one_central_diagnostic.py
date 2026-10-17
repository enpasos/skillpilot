from pathlib import Path
import json,hashlib,os,subprocess,tempfile,shutil,datetime,time,collections

D=Path(__file__).parent;O=D.parent
commandPath=D/'COMMAND.exactly-one-current439-central-diagnostic.json'
command=json.loads(commandPath.read_text());C=Path(command['cwd'])
H=lambda b:hashlib.sha256(b).hexdigest()
def pin(p):
    p=Path(p);b=p.read_bytes();return {'path':str(p),'sha256':H(b),'bytes':len(b)}
def check(p):
    got=pin(p['path']);assert got['sha256']==p['sha256'] and got['bytes']==p['bytes'],p['path']
def write(name,x):
    p=D/name
    with p.open('x') as f:json.dump(x,f,ensure_ascii=False,indent=2);f.write('\n')
    return pin(p)
assert H(commandPath.read_bytes())=='2ca2d8088cb0f7ddd2afacc42a2bd2b39910bf4f0662edd5dae2346ee34e0b79'
assert not (D/'EXECUTION.central-diagnostic.started.json').exists(),'Already started: inspect the existing handle; never restart for observation timeout.'
check(command['preparedConfig']);check(command['stockEntry']);check(command['originalPreparationSeal'])
conf=json.loads(Path(command['preparedConfig']['path']).read_text());sub=conf['subjects'][0]
assert len(sub['resolutionIndexPaths'])==105 and len(sub['semanticAtomicityConfigPaths'])==75 and len(sub['positiveEvidenceConfigPaths'])==112
assert len(sub['resolutionSupersessions'])==214 and len(sub['resolutionWithdrawals'])==7
guards={}
def guard(rel):
    p=C/rel;guards[str(p)]=pin(p)
for key in ['landscapePath','semanticKindLedgerPath','memoryReviewConfigPath','visualizationQaPath']:
    guard(sub[key])
for key in ['resolutionIndexPaths','semanticAtomicityConfigPaths','positiveEvidenceConfigPaths']:
    for rel in sub[key]:
        guard(rel)
        if key!='resolutionIndexPaths':
            x=json.loads((C/rel).read_text())
            if x.get('reviewPath'):guard(x['reviewPath'])
for k in ['reviewPath','cardReviewPath']:
    m=json.loads((C/sub['memoryReviewConfigPath']).read_text());guard(m[k])
ready=json.loads((O/'PREPARATION.ready-for-exactly-one-model-run.json').read_text())
guard(ready['modelRelative']);guard(ready['goalBookConfigRelative']);guard(ready['centralConfigRelative'])
for p in (C/'curricula/DE/Gymnasium/composition-views/chemie').glob('*.json'):guard(p.relative_to(C))
for p in (C/'app/public/data').glob('*chemistry*.json'):guard(p.relative_to(C))
pre=write('GUARD.diagnostic-unchanged-config-D105-A75-P112-M-V-and-decks.before.json',{'role':'Read-only bytes guard, no input refresh','inputs':list(guards.values()),'controlCounts':command['expectedCountsRetained']})
runtime=Path(tempfile.mkdtemp(prefix='skillpilot-chemie-central-a-',dir='/dev/shm'))
env=os.environ.copy();env.update({'TMPDIR':str(runtime),'TSX_DISABLE_CACHE':'1','NO_COLOR':'1'})
stamp=datetime.datetime.now(datetime.timezone.utc).isoformat()
start=write('EXECUTION.central-diagnostic.started.json',{'role':'One actual report-mode Central diagnostic, no check-success claim','startedAtUTC':stamp,'command':pin(commandPath),'argv':command['argv'],'cwd':str(C),'inputGuard':pre,'preparedConfig':command['preparedConfig'],'preparationSeal':command['originalPreparationSeal'],'smallLinuxIPCTemporaryDirectory':str(runtime),'durableOutputsOnlyE':True,'observationTimeoutIsNotCancellation':True,'compilerOrPDFInvokedByThisCommand':False})
before=time.monotonic()
with (D/'central.stock.stdout.json').open('xb') as so,(D/'central.stock.stderr.txt').open('xb') as se:
    proc=subprocess.Popen(command['argv'],cwd=C,env=env,stdout=so,stderr=se)
    print(json.dumps({'centralPID':proc.pid,'startedReceipt':start,'singleInvocation':True,'restartOnObservationTimeout':False}),flush=True)
    code=proc.wait()
elapsed=time.monotonic()-before
postchanged=[]
for pp in guards.values():
    got=pin(pp['path'])
    if got['sha256']!=pp['sha256'] or got['bytes']!=pp['bytes']:postchanged.append({'before':pp,'after':got})
check(command['preparedConfig']);check(command['originalPreparationSeal'])
post=write('GUARD.diagnostic-unchanged-config-D105-A75-P112-M-V-and-decks.after.json',{'inputsChecked':len(guards),'changedInputs':postchanged,'D105Supersessions214Withdrawals7Unchanged':not postchanged,'noInputUpdateBootstrapOrFingerprintRefresh':True})
report=None;parseError=None
try:report=json.loads((D/'central.stock.stdout.json').read_text())
except Exception as exc:parseError=str(exc)
summary={'role':'Actual whole439 diagnostic only; preserves all open findings and adds no scientific/native decisions','status':'ai_candidate','humanReviewStatus':'needs_human_review','decision':'DIAGNOSTIC_ONLY; OPEN_FINDINGS_PRESERVED','exitCode':code,'elapsedSeconds':elapsed,'startedAtUTC':stamp,'finishedAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'actualCentralInvocationCount':1,'config':command['preparedConfig'],'command':pin(commandPath),'stockStdout':pin(D/'central.stock.stdout.json'),'stockStderr':pin(D/'central.stock.stderr.txt'),'guardBefore':pre,'guardAfter':post,'anyInputChanged':bool(postchanged),'fullStdoutJSONParsed':report is not None,'parseError':parseError,'reportModeIsNotCheckPass':True,'newScienceVotes':0,'newNativeVotes':0,'newMvotes':0,'compilerInvocations':0,'PDFInvocations':0,'M7':False,'HumanApproval':False,'HumanTrial':False,'hostAcceptance':False}
if report is not None:
    summary['reportId']=report.get('reportId');summary['blockingIssueCount']=report.get('blockingIssueCount')
    summary['subjects']=[{k:s.get(k) for k in ['subject','landscapeId','denominator','strictComplete','percentage','remaining','gates','requiredChecks','strictCompletionReady','issues','deferredVisualizationGoalIds']} for s in report.get('subjects',[])]
    summary['currentScopeExact439']=len(report.get('subjects',[]))==1 and report['subjects'][0].get('denominator')==439
result=write('RESULT.actual-current439-central-diagnostic.no-new-votes.json',summary)
write('EXECUTION.central-diagnostic.completed.json',{'exitCode':code,'elapsedSeconds':elapsed,'actualCentralInvocationCount':1,'result':result,'stdout':pin(D/'central.stock.stdout.json'),'stderr':pin(D/'central.stock.stderr.txt'),'allGuardedInputsUnchanged':not postchanged,'originalPreparationSealUnchanged':True})
shutil.rmtree(runtime)
own=[pin(p) for p in sorted(D.iterdir()) if p.is_file()]
seal=write('SEAL.additive-central-diagnostic.json',{'role':'Additive actual diagnostic seal; original preparation seal preserved','createdAtUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'originalPreparationSeal':command['originalPreparationSeal'],'result':result,'allOwnFilesBeforeSeal':own,'oldInputsChanged':postchanged,'newVotes':0,'M7':False,'HumanApproval':False})
with (D/'SEAL.sha256').open('x') as f:f.write(seal['sha256']+'  SEAL.additive-central-diagnostic.json\n')
for p in D.iterdir():
    if p.is_file():p.chmod(0o444)
print(json.dumps({'exitCode':code,'elapsedSeconds':elapsed,'reportParsed':report is not None,'blockingIssueCount':report.get('blockingIssueCount') if report else None,'subjectCounts':[{k:s.get(k) for k in ['subject','denominator','strictComplete','gates','strictCompletionReady']} for s in report.get('subjects',[])] if report else None,'guardedInputsChanged':len(postchanged),'result':result,'seal':seal},ensure_ascii=False),flush=True)
raise SystemExit(code)
