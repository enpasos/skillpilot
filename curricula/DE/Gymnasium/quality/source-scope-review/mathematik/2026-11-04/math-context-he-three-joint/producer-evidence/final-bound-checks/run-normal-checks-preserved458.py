"""Run only the eleven agreed normal commands against the exact private host."""
from pathlib import Path
import concurrent.futures,datetime,hashlib,json,os,subprocess,sys,threading,time
R=Path('/home/enpasos/projects/skillpilot');H=Path(__file__).resolve().parent;C=H/'check-host';D=H/'final-bound-checks';D.mkdir(exist_ok=True)
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p):return json.loads(Path(p).read_text())
manifest=read(H/'manifest.quality-stage-adopted-458.json')
assert 'genuineStageReceipt'in manifest,'Actual genuine Stage receipt is required before all eleven normal checks.'
assert sha(C/manifest['genuineStageReceipt']['path'])==manifest['genuineStageReceipt']['sha256']
guard={r['path']:r['candidateSha256'] for r in manifest['files']}
for rel,digest in guard.items():assert sha(C/rel)==digest,rel
plan=read(R/'tmp/approach-review-20261101/space-geometry-four-integration-preparation-20261103-v1/normal-checks.plan.json')
commands=[]
for c in plan['commands']:
    commands.append({'name':('country88'if c['name']=='country83'else c['name']),'argv':[s.replace('<final-private-check-host>',str(C))for s in c['argv']],
                     'cwd':c['cwd'].replace('<final-private-check-host>',str(C))})
selected=set(sys.argv[1].split(',')) if len(sys.argv)>1 else {c['name']for c in commands}
assert selected <= {c['name']for c in commands}
target=D/'execution.json'
result=read(target) if target.exists() else {'status':'RUNNING_AGREED_ELEVEN_NORMAL_CHECKS','dataRoot':str(C),
    'startedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'commands':[],
    'stablePayloadManifestSha256':sha(H/'manifest.quality-stage-adopted-458.json'),'canonicalSha256':manifest['canonicalSha256'],
    'policySha256':manifest['policySha256'],'exactAgreedCommands':11,
    'noUnchangedMathematicsOrSSRRepeated':True,'noNewJvmOrGeneralM7Review':True,'rootGitWrites':False}
result['currentPayloadManifestSha256']=sha(H/'manifest.quality-stage-adopted-458.json')
if 'genuineStageReceipt' in manifest:result['genuineStageReceipt']=manifest['genuineStageReceipt']
lock=threading.Lock()
def publish():
    temp=target.with_suffix('.json.new');temp.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');temp.replace(target)
todo=[]
for c in commands:
    if c['name']not in selected:continue
    attempts=[r for r in result['commands']if r['name']==c['name']]
    assert not attempts or attempts[-1]['exitCode']!=0,'Do not repeat a passed check without a new concrete reason: '+c['name']
    c['attempt']=len(attempts)+1;todo.append(c)
def run(c):
    started=time.monotonic();out=D/f'{c["name"]}.attempt{c["attempt"]}.stdout.txt';err=D/f'{c["name"]}.attempt{c["attempt"]}.stderr.txt'
    env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1')
    with out.open('wb')as stdout,err.open('wb')as stderr:
        p=subprocess.run(c['argv'],cwd=c['cwd'],env=env,stdout=stdout,stderr=stderr)
    row={**c,'exitCode':p.returncode,'seconds':round(time.monotonic()-started,2),'inputManifestSha256':sha(H/'manifest.quality-stage-adopted-458.json'),
         'stdout':{'path':str(out.relative_to(R)),'sha256':sha(out),'bytes':out.stat().st_size},
         'stderr':{'path':str(err.relative_to(R)),'sha256':sha(err),'bytes':err.stat().st_size}}
    with lock:result['commands'].append(row);publish();print(json.dumps({k:row[k]for k in ['name','attempt','exitCode','seconds']}),flush=True)
publish()
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(run,todo))
last={r['name']:r for r in result['commands']}
result['payloadDrift']=[rel for rel,digest in guard.items()if sha(C/rel)!=digest]
result['completedDistinctCommands']=len(last)
result['allRequestedChecksCompleted']=len(last)==11
result['allFinalExitCodesZero']=all(r['exitCode']==0 for r in last.values())
result['status']=('PASS_FINAL_AGREED_ELEVEN_NORMAL_CHECKS'if len(last)==11 else'PARTIAL_NORMAL_CHECKS_COMPLETE') if result['allFinalExitCodesZero']and not result['payloadDrift']else'CONCRETE_NORMAL_CHECK_FINDING'
result['updatedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();publish()
print(json.dumps({k:result[k]for k in ['status','completedDistinctCommands','allFinalExitCodesZero','payloadDrift']}),flush=True)
