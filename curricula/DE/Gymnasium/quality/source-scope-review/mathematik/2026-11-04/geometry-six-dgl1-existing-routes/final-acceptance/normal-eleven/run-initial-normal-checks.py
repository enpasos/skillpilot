"""One detached, guarded sequence of the agreed eleven final G5 checks."""
from pathlib import Path
import concurrent.futures,datetime,hashlib,json,os,subprocess,threading,time
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';D=H/'final-bound-checks';sha=lambda p:hashlib.sha256(Path(p).read_bytes()).hexdigest();read=lambda p:json.loads(Path(p).read_text())
manifest_path=H/'manifest.quality-stage-adopted.json';manifest=read(manifest_path);native_path=R/manifest['actualNative5InputMap']['path'];native=read(native_path);payload={e['path']:e['candidateSha256']for e in manifest['files']};owned={e['path']:e['sha256']for e in manifest['rootOwnedCheckSources']};stage=manifest['genuineStageReceipt'];plan=read(H/'agreed-normal-checks.plan.json');assert len(plan['commands'])==11
assert sha(C/stage['path'])==stage['sha256'];assert(C/'.git').is_dir();assert subprocess.check_output(['git','rev-parse','--show-toplevel'],cwd=C,text=True).strip()==str(C)
guard_map={**native,**payload,**owned};assert len(payload)==655 and len(native)==11118
for rel,digest in guard_map.items():assert sha(C/rel)==digest,rel
commands=[{'name':'country88'if row['name']=='country83'else row['name'],'argv':[s.replace('<final-private-check-host>',str(C))for s in row['argv']],'cwd':row['cwd'].replace('<final-private-check-host>',str(C)),'attempt':1}for row in plan['commands']]
D.mkdir();target=D/'execution.json';assert not target.exists();result={'status':'RUNNING_AGREED_ELEVEN_NORMAL_CHECKS','startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'dataRoot':str(C),'commands':[],'sourceManifestSha256':manifest['sourceManifest']['sha256'],'qualityManifestSha256':sha(manifest_path),'canonicalSha256':manifest['canonicalSha256'],'policySha256':manifest['policySha256'],'exactAgreedCommands':11,'genuineStageReceipt':stage,'nativeInputMap':manifest['actualNative5InputMap'],'all11118NativeInputsMustRemainIdentical':True,'privateIndexPreparedBeforeSequence':True,'all655PayloadAndCurrentRootOwnedSourcesGuarded':True,'rootOrRootGitWrites':False};lock=threading.Lock()
def publish():
 p=target.with_suffix('.json.new');p.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');p.replace(target)
def run(command):
 start=time.monotonic();out=D/(command['name']+'.attempt1.stdout.txt');err=D/(command['name']+'.attempt1.stderr.txt')
 with out.open('xb')as stdout,err.open('xb')as stderr:process=subprocess.run(command['argv'],cwd=command['cwd'],env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'),stdout=stdout,stderr=stderr)
 row={**command,'exitCode':process.returncode,'seconds':round(time.monotonic()-start,2),'inputManifestSha256':sha(manifest_path),'stdout':{'path':str(out.relative_to(R)),'sha256':sha(out),'bytes':out.stat().st_size},'stderr':{'path':str(err.relative_to(R)),'sha256':sha(err),'bytes':err.stat().st_size}}
 with lock:
  result['commands'].append(row);publish();print(json.dumps({k:row[k]for k in['name','attempt','exitCode','seconds']}),flush=True)
publish()
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(run,commands))
last={row['name']:row for row in result['commands']};result['payloadDrift']=[rel for rel,digest in payload.items()if sha(C/rel)!=digest];result['nativeInputDrift']=[rel for rel,digest in native.items()if sha(C/rel)!=digest];result['ownedCheckSourceDrift']=[rel for rel,digest in owned.items()if sha(C/rel)!=digest or sha(R/rel)!=digest];result['completedDistinctCommands']=len(last);result['allFinalExitCodesZero']=all(row['exitCode']==0 for row in last.values());result['allFirstAttemptsThisSequence']=True;result['status']='PASS_FINAL_AGREED_ELEVEN_NORMAL_CHECKS'if len(last)==11 and result['allFinalExitCodesZero']and not any(result[k]for k in ['payloadDrift','nativeInputDrift','ownedCheckSourceDrift'])else'CONCRETE_NORMAL_CHECK_FINDING';result['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();publish();print(json.dumps({k:result[k]for k in ['status','completedDistinctCommands','allFinalExitCodesZero','payloadDrift','nativeInputDrift','ownedCheckSourceDrift']}),flush=True)
