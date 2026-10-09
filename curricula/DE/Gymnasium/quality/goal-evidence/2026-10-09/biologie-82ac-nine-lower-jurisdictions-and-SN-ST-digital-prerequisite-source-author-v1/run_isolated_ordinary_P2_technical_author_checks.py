# SPDX-License-Identifier: Apache-2.0
"""Normal P2 CLI in a minimal external capsule; exact old materials, no new science approval."""
from pathlib import Path
import datetime, hashlib, json, shutil, subprocess, tempfile
R=Path.cwd();D=Path(__file__).resolve().parent;P=D.relative_to(R).as_posix()
def bind(p):return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def put(n,x):
 f=D/n;f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists(),f;f.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n');return f
cfg=json.loads((D/'positive/P2-whole-current-technical-author.config.json').read_text());cfg['semanticKindLedgerPath']=P+'/candidate/whole394-kinds.one-requires-technical-binding.inactive.json'
put('positive/P2-final-normal-current-author.config.json',cfg)
cap=Path(tempfile.mkdtemp(prefix='skillpilot-bio-two-requires-P2-'))
def copy(p):
 dst=cap/p;dst.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(R/p,dst)
for p in [P+'/positive/P2-final-normal-current-author.config.json',P+'/positive/P2-whole-original-material.candidate.json',cfg['landscapePath'],cfg['semanticKindLedgerPath'],cfg['reviewCriteriaPath']]:copy(p)
for n in ['materializePositiveGoalEvidenceCandidates.ts','positiveGoalEvidenceReview.ts','positiveGoalEvidenceProfileModel.ts','goalEvidenceProfileModel.ts']:copy('app/scripts/'+n)
for n in ['goal-evidence-profile.schema.json','goal-evidence-review-config.schema.json']:copy('contracts/goal-evidence/v2/'+n)
copy('contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json')
for id in cfg['scope']['goalIds']:copy(f'app/public/assets/goal-visualizations/biologie/{id}/{id}.png')
(cap/'app/node_modules').symlink_to((R/'app/node_modules').resolve(),target_is_directory=True)
tsx=str((R/'app/node_modules/.bin/tsx').resolve());terms=[]
for label,args in [('P2-normal-materializer',[tsx,'app/scripts/materializePositiveGoalEvidenceCandidates.ts','--config',P+'/positive/P2-final-normal-current-author.config.json','--candidates',P+'/positive/P2-whole-original-material.candidate.json','--write']),('P2-normal-review',[tsx,'app/scripts/positiveGoalEvidenceReview.ts','--config='+P+'/positive/P2-final-normal-current-author.config.json','--mode=check'])]:
 start=datetime.datetime.now(datetime.timezone.utc).isoformat();a=subprocess.run(args,cwd=cap,capture_output=True,text=True)
 for suffix,b in [('stdout',a.stdout),('stderr',a.stderr)]:
  f=D/f'terminal/{label}.{suffix}.actual.txt';f.parent.mkdir(parents=True,exist_ok=True);assert not f.exists();f.write_text(b)
 term={'argv':args,'executionCwdDiagnosticOnly':str(cap),'startedAt':start,'actualExitCode':a.returncode,'stdout':bind(D/f'terminal/{label}.stdout.actual.txt'),'stderr':bind(D/f'terminal/{label}.stderr.actual.txt')};terms.append(term)
 assert a.returncode==0,term
dest=D/'positive/P2-whole-current-technical-author.review.jsonl';assert not dest.exists();shutil.copy2(cap/cfg['reviewPath'],dest)
old=json.loads((D/'inputs/whole-two-current-valid-P-profiles.exact.json').read_text());rows=[json.loads(x) for x in dest.read_text().splitlines() if x.strip()]
assert len(rows)==2
for x,y in zip(old,rows):
 assert x['goalId']==y['goalId'] and x['profile']==y['profile']
 assert y['status']=='needs_human_review' and y['reviewAuthority']=='ai_candidate' and y['evidenceLevel']=='E1' and y['maximumClaimScope']=='G1'
put('checks/completed-isolated-ordinary-P2-whole-material-technical-binding.actual.json',{'schemaVersion':1,'normalTerminals':terms,'wholeOriginalBilingualProfilesExact':True,'actualTwoCurrentRecords':bind(dest),'oldAndNewBindings':[{'goalId':y['goalId'],'wholeOldRecord':x,'wholeNewTechnicalCandidate':y} for x,y in zip(old,rows)],'newMaterialBodies':0,'authorTechnicalBindingsNotScientificReview':True,'independentApproval':False,'humanApproval':False,'strictGain':0,'rootNodeModulesNeverDeleted':True,'capsulePathDiagnosticOnly':True,'allOperativeOutputsCopiedToPortableCandidate':True})
print(json.dumps({'normalTerminals':len(terms),'P2ExactOldWholeMaterial':True,'needsHumanReview':2,'activeWrites':0,'strictGain':0}))
