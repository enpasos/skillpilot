from pathlib import Path
import json,hashlib,datetime
repo=Path.cwd();base=repo/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-molecular-genetics-twenty-three-whole-author-v1/images-author-v1';old=base/'neutral-first-seven-actual-PNGs-whole-science23-bound.author-entry.json';d=base/'portable-first-seven-successor-v2'
def b(p):
 p=Path(p).resolve();x=p.read_bytes();return {'path':str(p.relative_to(repo)),'sha256':'sha256:'+hashlib.sha256(x).hexdigest(),'bytes':len(x)}
def portable(x):
 if isinstance(x,list):return [portable(v) for v in x]
 if isinstance(x,dict):return {k:portable(v) for k,v in x.items()}
 if isinstance(x,str) and x.startswith(str(repo)+'/'):return x[len(str(repo))+1:]
 return x
v=portable(json.loads(old.read_text()));v['technicalPredecessor']=b(old);v['pathCorrectionScope']='Repository-local operational/binding paths are now relative. Actual generated-file local provenance remains historical metadata. PNG bytes/prompts/descriptions/goal bodies unchanged.'
out=d/'neutral-first-seven-portable-actual-images.author-entry.json';out.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
checks=[]
for e in v['images']:
 for key in ('path','assetPath','originalPromptPath','reconstructionPromptPath'):
  p=Path(e[key]);assert not p.is_absolute() and p.is_file()
 for k in ('assetBinding','originalPromptBinding','reconstructionPromptBinding'):
  p=Path(e[k]['path']);assert b(p)['sha256'].removeprefix('sha256:')==e[k]['sha256'].removeprefix('sha256:')
 checks.append({'goalId':e['goalId'],'assetExact':True,'actualOriginalPromptAndReconstructionExact':True,'allOperationalPathsRepositoryRelative':True})
cp=d/'seven-actual-operational-relative-path-check.actual.json';cp.write_text(json.dumps({'schemaVersion':1,'checks':checks,'errors':[],'previousFirstFreezeUnchanged':True,'scientificContentDelta':0,'selectedPNGsUnchanged':7},indent=2)+'\n')
fr=d/'first-seven-portable-successor.author.first.freeze.json';assert not fr.exists()
fr.write_text(json.dumps({'schemaVersion':1,'createdAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'role':'first frozen technical portable-path successor, preserves initial first freeze','inputs':[b(old),b(base/'first-seven-actual-images-author.first.freeze.json')],'outputs':[b(out),b(cp),b(__file__),b(d/'first-relative-path-check.failure.actual.json')],'entry':b(out),'scientificContentDelta':0,'actualIndependentReviews':[],'humanApproval':False,'activeWrites':False},indent=2)+'\n')
print(json.dumps({'entry':b(out),'freeze':b(fr),'errors':[]}))
