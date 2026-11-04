from pathlib import Path
import json,hashlib,subprocess,os,time,concurrent.futures,datetime,threading
R=Path.cwd();H=R/'tmp/approach-review-20261101';O=Path(__file__).resolve().parent;C=O/'normal-default-host';D=O/'normal-eleven';D.mkdir(exist_ok=True);read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();S=H/'astra-q3-integration-independent-review-20261104-v1';F=H/'math-q3-final-source-candidate-20261104-v1';sourcePlan=H/'geometry-six-dgl1-final-handoff-20261104-v1/agreed-normal-checks.plan.json';plan=read(sourcePlan);assert len(plan['commands'])==11
payload={r['path']:r.get('candidateSha256',r['sha256'])for m in[F/'inventory.for-source-review.json',S/'manifest.genuine-am-four-leaves.json']for r in read(m)['files']};payload.update({str(p.relative_to(O/'overlay')):sha(p)for p in(O/'overlay').rglob('*')if p.is_file()});owned={}
for row in plan['commands']:
 for s in row['argv']:
  if (s.startswith('app/scripts/')or s.startswith('scripts/'))and (R/s).is_file():owned[s]=sha(R/s);assert sha(C/s)==owned[s]
for p in['app/scripts/testGoalBookModel.ts','app/scripts/testMathDistanceReflectionStructure.ts','app/scripts/testMathPythagorasStructure.ts']:
 if (R/p).exists():owned[p]=sha(R/p);assert sha(C/p)==owned[p]
assert not (C/'.git').exists()
head=subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip()
def git(*args):return subprocess.check_output(['git',*args],cwd=C,text=True)
git('init','--quiet');a=C/'.git/objects/info/alternates';a.parent.mkdir(parents=True,exist_ok=True);a.write_text(str(R/'.git/objects')+'\n');git('read-tree',head);git('update-ref','HEAD',head);git('add','--force','--',*sorted(payload));assert git('rev-parse','--show-toplevel').strip()==str(C)
commands=[{'name':r['name'],'argv':[s.replace('<final-private-check-host>',str(C))for s in r['argv']],'cwd':r['cwd'].replace('<final-private-check-host>',str(C))}for r in plan['commands']if r['name']not in['country83','duration18']]
assert len(commands)==9
result={'status':'RUNNING_NINE_REMAINING_OF_AGREED_ELEVEN','sourcePlan':{'path':str(sourcePlan.relative_to(R)),'sha256':sha(sourcePlan)},'originalPlanCommandsUnchanged':True,'countryAndDurationReusedFromCurrentDefaultCLISequenceNotRepeated':True,'rootHeadAtPrivateIndexPreparation':head,'privateGitOnly':True,'currentRootOwnedCheckSources':owned,'commands':[]};lock=threading.Lock()
def publish():p=D/'execution.json.new';p.write_text(json.dumps(result,indent=2)+'\n');p.replace(D/'execution.json')
def run(command):
 t=time.monotonic();name=command['name'];out=D/(name+'.attempt1.stdout.txt');err=D/(name+'.attempt1.stderr.txt');assert not out.exists()
 with out.open('w')as so,err.open('w')as se:p=subprocess.run(command['argv'],cwd=command['cwd'],env=dict(os.environ,PYTHONDONTWRITEBYTECODE='1'),stdout=so,stderr=se)
 row={**command,'attempt':1,'exitCode':p.returncode,'seconds':round(time.monotonic()-t,2),'stdout':{'path':str(out.relative_to(R)),'sha256':sha(out)},'stderr':{'path':str(err.relative_to(R)),'sha256':sha(err)}}
 with lock:result['commands'].append(row);publish();print(name,p.returncode,row['seconds'],flush=True)
publish()
with concurrent.futures.ThreadPoolExecutor(max_workers=3)as pool:list(pool.map(run,commands))
result['payloadDrift']=[p for p,h in payload.items()if sha(C/p)!=h];result['ownedCheckDrift']=[p for p,h in owned.items()if sha(C/p)!=h];result['status']='TERMINAL_NINE_REMAINING_NORMAL_CHECKS';publish();print(result['status'],flush=True)
