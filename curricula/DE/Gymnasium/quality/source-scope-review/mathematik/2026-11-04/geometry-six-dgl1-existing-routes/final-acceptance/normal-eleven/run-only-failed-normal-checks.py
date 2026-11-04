from pathlib import Path
import concurrent.futures,datetime,hashlib,json,os,subprocess,threading,time
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';D=H/'final-bound-checks';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text());m=read(H/'manifest.failed-check-successor.json');base=read(H/'execution.first-sequence.frozen.json');native=read(R/m['actualNative5InputMap']['path']);payload={x['path']:x['candidateSha256']for x in m['files']};assert len(native)==11118 and len(payload)==662
for rel,digest in {**native,**payload}.items():assert sha(C/rel)==digest,rel
D.mkdir();result={'status':'RUNNING_ONLY_TWO_PREVIOUSLY_FAILED_NORMAL_CHECKS','startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dataRoot':str(C),'commands':[],'inputManifestSha256':sha(H/'manifest.failed-check-successor.json'),'firstSequenceSha256':sha(H/'execution.first-sequence.frozen.json'),'priorNinePassesReusedWithoutRerun':True,'noRootGitWrites':True};lock=threading.Lock();target=D/'execution.json'
def publish():
 t=target.with_suffix('.json.new');t.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');t.replace(target)
commands=[]
for row in base['commands']:
 if row['name']in m['normalChecksToRetry']:
  assert row['exitCode']!=0
  old=base['dataRoot'];commands.append({'name':row['name'],'argv':[arg.replace(old,str(C))for arg in row['argv']],'cwd':row['cwd'].replace(old,str(C)),'attempt':2})
assert len(commands)==2

def run(row):
 start=time.monotonic();out=D/(row['name']+'.attempt2.stdout.txt');err=D/(row['name']+'.attempt2.stderr.txt')
 with out.open('xb')as stdout,err.open('xb')as stderr:p=subprocess.run(row['argv'],cwd=row['cwd'],env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'),stdout=stdout,stderr=stderr)
 record={**row,'exitCode':p.returncode,'seconds':round(time.monotonic()-start,2),'inputManifestSha256':sha(H/'manifest.failed-check-successor.json'),'stdout':{'path':str(out.relative_to(R)),'sha256':sha(out),'bytes':out.stat().st_size},'stderr':{'path':str(err.relative_to(R)),'sha256':sha(err),'bytes':err.stat().st_size}}
 with lock:result['commands'].append(record);publish();print(json.dumps({k:record[k]for k in['name','attempt','exitCode','seconds']}),flush=True)
publish()
with concurrent.futures.ThreadPoolExecutor(max_workers=2)as pool:list(pool.map(run,commands))
result['payloadDrift']=[rel for rel,digest in payload.items()if sha(C/rel)!=digest];result['nativeInputDrift']=[rel for rel,digest in native.items()if sha(C/rel)!=digest];result['ownedCheckSourceDrift']=[x['path']for x in m['effectiveRootOwnedCheckSources']if sha(C/x['path'])!=x['sha256']];result['allRetryExitCodesZero']=all(x['exitCode']==0 for x in result['commands']);result['status']='PASS_TWO_GENUINE_FINDINGS_REPAIRED'if result['allRetryExitCodesZero']and not any(result[k]for k in['payloadDrift','nativeInputDrift','ownedCheckSourceDrift'])else'RETRY_CONCRETE_FINDING';result['finishedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();publish()
combined={**base,'commands':base['commands']+result['commands'],'sourceFollowupManifestSha256':sha(H/'manifest.failed-check-successor.json'),'sourceFollowupExecutionSha256':sha(target),'allFirstAttemptsThisSequence':False,'totalCommandAttempts':13,'onlyPreviouslyFailedCommandsRepeated':True,'sourceAndQAFollowupExplicit':True,'payloadDrift':result['payloadDrift'],'nativeInputDrift':result['nativeInputDrift'],'ownedCheckSourceDrift':result['ownedCheckSourceDrift']};last={x['name']:x for x in combined['commands']};combined['allFinalExitCodesZero']=len(last)==11 and all(x['exitCode']==0 for x in last.values());combined['status']='PASS_FINAL_AGREED_ELEVEN_NORMAL_CHECKS'if combined['allFinalExitCodesZero']and not any(combined[k]for k in['payloadDrift','nativeInputDrift','ownedCheckSourceDrift'])else'CONCRETE_NORMAL_CHECK_FINDING';(H/'combined-execution.json').write_text(json.dumps(combined,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'status':combined['status'],'commands':11,'attempts':13,'all11118NativeInputsIdentical':not result['nativeInputDrift']}),flush=True)
