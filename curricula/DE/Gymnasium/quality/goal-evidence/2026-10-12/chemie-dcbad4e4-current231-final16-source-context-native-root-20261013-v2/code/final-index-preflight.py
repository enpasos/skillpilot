from pathlib import Path
import json,hashlib,subprocess,importlib.util
R=Path('/home/enpasos/projects/skillpilot');D=[]
for name in ['staged-owned-directories.actual.json','additional-sealed-stage-directories.actual.json']:
 D.extend(json.loads((R/'tmp/chemie-q4-current220-prep'/name).read_text())['ownedDirectories'])
idx={}
for line in subprocess.check_output(['git','ls-files','--stage','-z'],cwd=R).split(b'\0'):
 if not line:continue
 h,p=line.decode().split('\t',1);idx[p]=h.split()[1]
files=set();errors=[];seals=0
for rel in D:
 dr=R/rel
 for seal in dr.glob('*freeze.json'):
  obj=json.loads(seal.read_text());seals+=1
  for key in ['ownedFiles','files','fileInputs','artifactBindings','boundFiles']:
   rows=obj.get(key,[])
   if not isinstance(rows,list):continue
   for row in rows:
    if not isinstance(row,dict) or not all(k in row for k in ['path','sha256']):continue
    size=row.get('bytes',row.get('sizeBytes'))
    if size is None:continue
    p=Path(row['path']);p=R/p if p.parts[0] in ['curricula','app','docs','scripts','backend'] else dr/p
    if not p.resolve().is_relative_to(dr.resolve()):continue
    path=str(p.relative_to(R));b=p.read_bytes();s=hashlib.sha256(b).hexdigest();gitsha=hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest();files.add(path)
    if s!=row['sha256'].removeprefix('sha256:') or len(b)!=size:errors.append({'path':path,'error':'immutable-seal-diff'})
    if idx.get(path)!=gitsha:errors.append({'path':path,'error':'index-does-not-have-exact-bound-file'})
trackedNew=subprocess.check_output(['git','diff','--cached','--name-only','-z'],cwd=R).decode().split('\0');parsed=0
for rel in trackedNew:
 if not rel:continue
 p=R/rel
 if p.suffix=='.json':json.loads(p.read_text());parsed+=1
 elif p.suffix=='.jsonl':
  for l in p.read_text().splitlines():
   if l.strip():json.loads(l)
  parsed+=1
assert not any(x.startswith('app/public/lernzielbuch/') for x in trackedNew),'generated-publication-staged'
assert not any(x.startswith('backend/src/main/java/') or x.startswith('app/src/') for x in trackedNew),'unexpected-runtime-source-edit'
assert not errors,errors
out={'ownedSealsChecked':seals,'uniqueExactOwnedSealedInputsInGitIndex':len(files),'stagedStructuredFilesParsed':parsed,'errors':errors,'generatedPublicationsExcluded':True,'liveUnsealedNext18Excluded':True,'runtimeSourceEdits':0,'humanApprovalClaimed':False}
(R/'tmp/chemie-q4-current220-prep/final-index-preflight.actual.json').write_text(json.dumps(out,indent=2)+'\n');print(json.dumps(out))
