# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import copy,json,hashlib,shutil,subprocess,datetime
ROOT=Path.cwd(); B=Path(__file__).resolve().parent.relative_to(ROOT); E=B.parent;CAP=ROOT/'tmp/biologie-molecular-genetics-native15-current394-successor-capsule'
plan=json.loads((B/'current-P23-genuine-P22-routing.one15-actual-pair-pending.json').read_text()); entry=json.loads(Path(plan['currentNativeOne15Entry']['path']).read_text());seen=set();inputs=[]
def bind(p):z=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':'sha256:'+hashlib.sha256(z).hexdigest(),'bytes':len(z)}
def cp(p):
 p=Path(p);assert not p.is_absolute();src=ROOT/p;dst=CAP/p;assert src.is_file() and not src.is_symlink();dst.parent.mkdir(parents=True,exist_ok=True)
 if dst.exists():assert dst.read_bytes()==src.read_bytes(),p
 else:shutil.copyfile(src,dst)
 inputs.append(bind(src));return dst
# Only explicit normal AI-run artifact/source bindings are copied, never a history directory.
def bindings(z):
 if isinstance(z,dict):
  p=z.get('path')
  if isinstance(p,str) and not p.startswith('/') and (ROOT/p).is_file():
   target=cp(p)
   if z.get('sha256'):assert 'sha256:'+hashlib.sha256(target.read_bytes()).hexdigest()=='sha256:'+z['sha256'].removeprefix('sha256:')
  for v in z.values():bindings(v)
 elif isinstance(z,list):
  for v in z:bindings(v)
def run_source(p):
 if p in seen:return
 seen.add(p);cp(p);bindings(json.loads((ROOT/p).read_text()))
terminals=[]
for part in plan['futureActiveNormalConfigPartitions']:
 cfg=json.loads(Path(part['futureActiveNormalConfig']['path']).read_text()); cp(cfg['reviewPath']);cp(part['originalConfig']['path']);cp(part['originalRecords']['path'])
 for path in cfg['reviewRunManifestPaths']:run_source(path)
 cfg.update(landscapePath=entry['candidateCanonicalPath'],semanticKindLedgerPath=entry['candidateKindsPath'])
 tmpConfig=Path('tmp/current-genuine-P22-check-configs')/(part['role'].replace('_','-')+'.json');dst=CAP/tmpConfig;dst.parent.mkdir(parents=True,exist_ok=True);assert not dst.exists();dst.write_text(json.dumps(cfg,ensure_ascii=False,indent=2)+'\n')
 argv=[str(ROOT/'app/node_modules/.bin/tsx'),'app/scripts/positiveGoalEvidenceReview.ts','--config='+str(tmpConfig),'--mode=check'];r=subprocess.run(argv,cwd=CAP,capture_output=True,text=True)
 prefix=B/'checks'/('ordinary-P-'+part['role'].replace('_','-')+'-current-one15-capsule')
 for suffix,text in [('stdout.actual.txt',r.stdout),('stderr.actual.txt',r.stderr)]:
  p=Path(str(prefix)+'.'+suffix);assert not p.exists();p.write_text(text)
 p=Path(str(prefix)+'.terminal.actual.json');assert not p.exists();p.write_text(json.dumps({'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'argv':argv,'cwd':str(CAP.relative_to(ROOT)),'actualExitCode':r.returncode,'scopeGoalIds':part['goalIds'],'actualSelectedIndependentBRecordLinesLiteral':True,'actualSourceInputBindings':inputs,'normalRunManifestPaths':cfg['reviewRunManifestPaths'],'actualSourceRunManifestsUnchanged':True,'symlinksCreated':0,'activeWrites':0,'newScientificReviews':0,'humanApproval':False},ensure_ascii=False,indent=2)+'\n');terminals.append(str(p));print(part['role'],r.returncode,r.stdout,r.stderr);assert r.returncode==0
p=B/'checks/current-genuine-P22-normal-one15-capsule.all.actual.json';assert not p.exists();p.write_text(json.dumps({'terminalPaths':terminals,'normalSelectedGoals':22,'currentOne15NewIndependentPairPending':True,'ordinaryActualFailures':0,'onlyActualNormalRunBoundFilesCopied':True,'ownScienceReviewsInvented':0,'activeWrites':0,'humanApproval':False},indent=2)+'\n')
