from pathlib import Path
import hashlib,json,subprocess,shutil
R=Path('/home/enpasos/projects/skillpilot');H=R/'tmp/approach-review-20261101';P=H/'geometry-six-dgl1-final-handoff-20261104-v1';N=P/'failed-check-retry-v1';A=H/'astra-g5-sh-ratio-source-followup-20261104-v1';sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();read=lambda p:json.loads(p.read_text())
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def put(root,rel,p):
 t=root/rel;t.parent.mkdir(parents=True,exist_ok=True);tmp=t.with_name(t.name+'.new');shutil.copyfile(p,tmp);tmp.replace(t)
assert not N.exists();manifest=read(P/'manifest.quality-stage-adopted.json');f=A/'manifest.bounded-source-followup.json';assert sha(f)=='b71976573e91441713dbfc8e15474b42868f41693d50c1acb8792cee1fde8eef';a=read(f);assert len(a['files'])==6
qa=P/'root-owned-qa-followup-v1/stage-country-patch.binding.json';q=read(qa);rel=q['rootSourcePath'];assert sha(R/rel)==q['rootSourceSha256'];assert sha(R/q['candidatePath'])==q['candidateSha256']
N.mkdir();C=N/'check-host';O=N/'final-reviewed-overlay';subprocess.run(['cp','--reflink=auto','-a',str(P/'check-host'),str(C)],check=True);subprocess.run(['cp','--reflink=auto','-a',str(P/'final-reviewed-overlay'),str(O)],check=True)
for e in a['files']:
 assert sha(R/e['candidatePath'])==e['candidateSha256'];assert not(C/e['path']).exists();put(C,e['path'],R/e['candidatePath']);put(O,e['path'],R/e['candidatePath'])
put(C,rel,R/q['candidatePath']);put(O,rel,R/q['candidatePath']);owned={e['path']:e['sha256']for e in manifest['rootOwnedCheckSources']};owned[rel]=q['candidateSha256']
native=read(R/manifest['actualNative5InputMap']['path'])
for path,digest in native.items():assert sha(C/path)==digest,path
for e in manifest['files']:assert sha(C/e['path'])==sha(R/e['candidatePath'])==e['candidateSha256']
rows=[]
for p in O.rglob('*'):
 if p.is_file():
  path=str(p.relative_to(O));rows.append({'path':path,'candidatePath':str(p.relative_to(R)),'candidateSha256':sha(p),'beforeSha256':sha(R/path)if(R/path).is_file()else None,'bytes':p.stat().st_size})
assert len(rows)==662
subprocess.run(['git','add','--force','--',*[e['path']for e in a['files']],rel],cwd=C,check=True,capture_output=True);assert subprocess.check_output(['git','rev-parse','--show-toplevel'],cwd=C,text=True).strip()==str(C)
d={'schemaVersion':1,'status':'BOUNDED_SOURCE_REVIEW_AND_QA_SUCCESSOR_READY_TO_RETRY_ONLY_TWO_FAILED_NORMAL_CHECKS','candidateRoot':str(O.relative_to(R)),'candidateHost':str(C.relative_to(R)),'files':sorted(rows,key=lambda e:e['path']),'base655Manifest':{'path':str((P/'manifest.quality-stage-adopted.json').relative_to(R)),'sha256':sha(P/'manifest.quality-stage-adopted.json')},'independentSourceFollowupManifest':{'path':str(f.relative_to(R)),'sha256':sha(f)},'rootOwnedQAChange':q,'effectiveRootOwnedCheckSources':[{'path':path,'sha256':digest}for path,digest in owned.items()],'actualNative5InputMap':manifest['actualNative5InputMap'],'all11118OriginalNative5InputHashesIdentical':True,'priorNineNormalPassesPreservedUnrepeated':True,'original655AndOldFailedHostUnchanged':True,'sourceReviewAddsNoRuntimeMappingOrApplicabilityChange':True,'normalChecksToRetry':['source-coverage','stage-country'],'noRootGitWrites':True};write(N/'manifest.failed-check-successor.json',d);shutil.copyfile(P/'final-bound-checks/execution.first-sequence.frozen.json',N/'execution.first-sequence.frozen.json');print(json.dumps({'sourceLeaves':len(rows),'manifestSha256':sha(N/'manifest.failed-check-successor.json'),'nativeInputsUnchanged':len(native)}))
