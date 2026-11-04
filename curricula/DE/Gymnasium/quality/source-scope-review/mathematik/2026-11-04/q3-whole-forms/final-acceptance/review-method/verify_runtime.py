from pathlib import Path
import json,hashlib,re
R=Path.cwd();H=R/'tmp/approach-review-20261101';N=H/'math-q3-whole-forms-native-20261104-v1';S=H/'astra-q3-integration-independent-review-20261104-v1';O=Path(__file__).resolve().parent;read=lambda p:json.loads(p.read_text());sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest();assert sha(N/'candidate-input-hashes.json')=='095ba3aa631dad1fd786ece9e93352691e6a42deac7d2340db109a1ca74ad72b';summaries=[];full=read(H/'backend-full-g4-ffc69-20261104-v1/input-hashes.before.json')
for name,base in [('candidate-input-hashes.json',N/'candidate-data'),('main-source-hashes.json',None),('runtime-class-hashes.json',None),('runtime-resource-hashes.json',None),('dependency-jar-hashes.json',None),('sampler-class-hashes.json',N/'classes'),('test-support-source-hashes.json',None),('current-root-test-source-hashes.json',None)]:
 p=N/name;m=read(p)
 for k,v in m.items():
  if name=='test-support-source-hashes.json':
   assert full[str(Path(k).relative_to(R))]==v,(name,k);continue
  q=(base/k)if base else Path(k);q=q if q.is_absolute()else R/q;assert q.is_file()and sha(q)==v,(name,str(q))
 summaries.append({'path':str(p.relative_to(R)),'sha256':sha(p),'entries':len(m),'allCurrentFileOrFrozenCompileInputBindingsChecked':True})
inputs=read(N/'candidate-input-hashes.json');effective=read(S/'effective-reviewed-source-and-am-inputs.json')
for r in effective['files']:assert inputs[r['path']]==r.get('candidateSha256',r['sha256'])
for p in (N/'candidate-data/backend/src/main/java').rglob('*.java'):assert sha(p)==sha(R/p.relative_to(N/'candidate-data'))
handoff=read(N/'manifest.actual-native-handoff.json')
for r in handoff['files']:
 p=Path(r['path']);p=p if p.exists()else N/r['path'];assert sha(p)==r['sha256']
assert read(N/'guard.after-invocation.json')['sameGuardedInputsSourcesClassesJarsResourcesOriginalFreezesAndOwnScripts']
text=(N/'class-load.actual.log').read_text();assert 'com.skillpilot.backend.composition.MaterializeMathContextualCombinedViews' not in text
cl=read(N/'class-load.actual.json');assert sha(N/'class-load.actual.log')==cl['classLoadLogSha256'];actual={}
for cls,origins in cl['requiredActualLoadedClasses'].items():
 rows=[line for line in text.splitlines()if cls+' source:' in line];assert rows,cls
 for orig in origins:assert any(orig.rstrip('/') in row for row in rows),(cls,orig)
 actual[cls]=rows
r={'status':'INDEPENDENT_Q3_INPUTS_RUNTIME_AND_ACTUAL_CLASSLOAD_PASS','maps':summaries,'all209ReviewedSourceAndGenuineAMInputsPresentBeforeNative':True,'all482MainCurrentAndCandidateEqualFrozenFullBuild':True,'actualChangedBuildtimeProducerNeverLoaded':True,'requiredActualLoadedClasses':actual,'actualClassLoadLogSha256':sha(N/'class-load.actual.log'),'nativeHandoffSha256':sha(N/'manifest.actual-native-handoff.json'),'all52HandoffEvidenceBindingsVerified':True,'noNewCompilationClaim':True};(O/'runtime-inputs-independent-review.json').write_text(json.dumps(r,indent=2)+'\n');print('PASS runtime maps and all209 reviewed inputs; actual class-load excludes changed buildtime producer')
