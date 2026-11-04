from pathlib import Path
import collections
import hashlib
import json
import shutil
import subprocess
import sys

R=Path('/home/enpasos/projects/skillpilot')
H=R/'tmp/approach-review-20261101'
N=H/'geometry-six-dgl1-existing-routes-native-20261104-v2'
PREVIOUS=H/'geometry-six-dgl1-existing-routes-native-20261104-v1'
B=H/'geometry-four-projection-reuse-native-20261104-v1'
F=H/'geometry-six-dgl1-snapshot-packaging-followup-20261104-v1/manifest.snapshot-packaging-successor.json'
Q=H/'astra-g5-final-stage-review-20261104-v1/manifest.am-four-leaves.json'
QR=Q.parent/'independent-am-final-binding.json'
FULL=H/'backend-full-g4-ffc69-20261104-v1'
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def write(path,value):
    with path.open('x') as f:json.dump(value,f,indent=2);f.write('\n')
assert not N.exists()
assert sha(F)=='4c99a20c8ae30d91b74d6610cf0002bc35f15747296fcd2121ac203faf94ffcf'
assert sha(Q)=='5364dbab8e5b5f5f0c59c8c1acda6f0219acf9797921308e530eca479671ff6e'
assert sha(QR)=='dd5f3ea638d582d92fae7a5ef987615573edaf57f1885fd43c3fb46e5f0bca8c'
assert sha(B/'candidate.json.gz')=='2017f30338bdc5efea5124241c937d9cb2b60d4fbded84b35ad83aed6491d4d2'
assert sha(B/'candidate-input-hashes.json')=='57a94ebcc308cfc05ce01a0452f91e9cafa6febafcc66c40e028b503cf475cca'
m=json.loads(F.read_text());q=json.loads(Q.read_text());print('qa manifest keys',list(q),flush=True)
assert len(m['files'])==640
qfiles=q['files'];assert len(qfiles)==4
for e in m['files']:
    assert sha(R/e['candidatePath'])==e['candidateSha256'],e['path']
    old=R/e['path'];assert (sha(old) if old.exists() else None)==e['beforeSha256'],e['path']
for e in qfiles:
    assert sha(R/e['candidatePath'])==e['candidateSha256'],e['path']
fullinputs=json.loads((FULL/'input-hashes.before.json').read_text())
main={str(R/rel):digest for rel,digest in fullinputs.items() if rel.startswith('backend/src/main/java/') and rel.endswith('.java')}
assert len(main)==482
assert {str(p) for p in (R/'backend/src/main/java').rglob('*.java')}==set(main)
for p,digest in main.items():assert sha(Path(p))==digest,p
sys.path.insert(0,str(R/'scripts'))
from curriculum_completion_inputs import current_input_paths
ci=current_input_paths(R)
assert len(ci)==10290,len(ci)
old=json.loads((B/'candidate-input-hashes.json').read_text())
assert len(old)==3582
owned=['scripts/curriculum_completion_inputs.py','scripts/test_curriculum_completion_integrity_report.py']
assert [sha(R/p) for p in owned]==['90dfbfacbf0527445d9b6b019653a2e59e6b7c421c456c1369719d67a7b9ff51','b06b7ae447570e96204569f476eda3c3be1513ddbcee966f82666613b8df3f6f']
basepaths=set(old)|ci|set(owned)
qa_configs=[f'curricula/DE/Gymnasium/quality/{lane}/canonical-math-full.config.json' for lane in ['semantic-atomicity','memory-card-review']]
qa_refs=set(qa_configs)
def add_jsonl(value):
    if isinstance(value,str) and value.endswith('.jsonl'):
        assert not Path(value).is_absolute() and '..' not in Path(value).parts
        qa_refs.add(value)
    elif isinstance(value,dict):
        for item in value.values():add_jsonl(item)
    elif isinstance(value,list):
        for item in value:add_jsonl(item)
for rel in qa_configs:add_jsonl(json.loads((R/rel).read_text()))
basepaths|=qa_refs
N.mkdir();DATA=N/'candidate-data';DATA.mkdir()
rootmap={}
for rel in sorted(basepaths):
    source=R/rel;assert source.is_file(),rel
    target=DATA/rel;target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
    rootmap[rel]=sha(source);assert sha(target)==rootmap[rel],rel
for manifest in [m,q]:
    for e in manifest['files']:
        target=DATA/e['path'];target.parent.mkdir(parents=True,exist_ok=True)
        shutil.copyfile(R/e['candidatePath'],target);assert sha(target)==e['candidateSha256'],e['path']
# Confirm successor configs only reference JSONL actually present in this host.
successor_refs=set()
for rel in qa_configs:
    value=json.loads((DATA/rel).read_text())
    for key,item in value.items():
        if isinstance(item,str) and item.endswith('.jsonl'):
            assert (DATA/item).is_file(),item;successor_refs.add(item)
for name,source in [('input-manifest.json',F),('independent-am-four-leaves.json',Q),('independent-am-final-binding.json',QR),('MatrixFiniteNativeProbe.java',B/'MatrixFiniteNativeProbe.java'),('decisions.json',B/'decisions.json')]:
    shutil.copyfile(source,N/name)
cp=(H/'statistics-pyramid-existing-route-native-20261104-v1/classpath-current.txt').read_text().strip().split(':')
assert len([p for p in cp if not p.endswith('.jar')])==4
fresh=FULL/'backend-build'
cp[1:5]=[str(fresh/p) for p in ['classes/java/test','resources/test','classes/java/main','resources/main']]
assert all(Path(p).exists() for p in cp)
(N/'classpath-current.txt').write_text(':'.join(cp)+'\n')
classes={str(p):sha(p) for directory in cp if not directory.endswith('.jar') for p in Path(directory).rglob('*.class')}
resources={str(p):sha(p) for directory in cp if not directory.endswith('.jar') for p in Path(directory).rglob('*') if p.is_file() and p.suffix!='.class'}
jars={str(Path(p)):sha(Path(p)) for p in cp if p.endswith('.jar')}
write(N/'runtime-class-hashes.json',classes);write(N/'runtime-resource-hashes.json',resources);write(N/'dependency-jar-hashes.json',jars);write(N/'main-source-hashes.json',main)
write(N/'test-support-source-hashes.json',{str(R/rel):sha(R/rel) for rel in fullinputs if rel.startswith('backend/src/test/java/') and rel.endswith('.java')})
write(N/'root-copy-input-hashes.json',rootmap)
write(N/'current-root-ci-input-hashes.json',{rel:rootmap[rel] for rel in sorted(ci)})
write(N/'runtime-origin.json',{'mainClasses':str(fresh/'classes/java/main'),'testClasses':str(fresh/'classes/java/test'),'mainSourceCount':len(main),'runtimeClassCount':len(classes),'resourceCount':len(resources),'dependencyJarCount':len(jars),'sourceMainByteEqualToOriginalFullBackendInputs':True,'reusedActualFullOrdinaryBackendBuild':str(FULL.relative_to(R)),'fullBackendResultSha256':sha(FULL/'result.json'),'fullBackendInputMapSha256':sha(FULL/'input-hashes.before.json'),'newProductionMainCompilationClaim':False,'samplerRecompiledAgainstFreshFullBackend':False,'samplerCompilationReusedFrom':str((PREVIOUS/'compile.execution.json').relative_to(R)),'candidateOverlayGuardSourceIsDataNotExecutedBySampler':True,'allFourNonJarClasspathEntriesReplaced':True})
write(N/'preparation.json',{'status':'PREPARED_REAL_NATIVE5_RETRY_WITH_INERT_640_SOURCE_LEAVES_AND_GENUINE_QA4','rootHeadAtPreparation':subprocess.check_output(['git','rev-parse','HEAD'],cwd=R,text=True).strip(),'sourceManifest':{'path':str(F.relative_to(R)),'sha256':sha(F),'leaves':640},'independentAMManifest':{'path':str(Q.relative_to(R)),'sha256':sha(Q),'leaves':4},'independentAMReceiptSha256':sha(QR),'originalNative4':{'archivePath':str((B/'candidate.json.gz').relative_to(R)),'archiveSha256':sha(B/'candidate.json.gz'),'inputMapSha256':sha(B/'candidate-input-hashes.json'),'inputCount':3582,'untouched':True},'currentRootCIInputCount':len(ci),'currentRootCISourceMapSha256':sha(N/'current-root-ci-input-hashes.json'),'rootCopiedFileCount':len(rootmap),'rootCopiedBytes':sum((DATA/rel).stat().st_size for rel in rootmap),'oldAndCurrentAMJsonlPaths':sorted(qa_refs|successor_refs),'additionalRootOwnedInputs':{rel:sha(R/rel) for rel in owned},'prototypeSamplerSourceUnchangedFromNative4':sha(N/'MatrixFiniteNativeProbe.java')==sha(B/'MatrixFiniteNativeProbe.java'),'runtimeWorkingDirectory':str(DATA/'backend'),'noProductionRootOrGitWrites':True,'noNativeResultClaimBeforeRun':True,'noStageOrNormalCheckAcceptanceClaim':True})
print(json.dumps({'prepared':str(N),'copiedInputs':len(rootmap),'runtimeClasses':len(classes),'jars':len(jars),'resources':len(resources),'qa4Adopted':True}),flush=True)

# Reuse the byte-identical sampler genuinely compiled in the preserved failed
# attempt. This is a new actual invocation, not a new compilation claim.
assert sha(N/'MatrixFiniteNativeProbe.java')==sha(PREVIOUS/'MatrixFiniteNativeProbe.java')
assert sha(N/'classpath-current.txt')==sha(PREVIOUS/'classpath-current.txt')
assert json.loads((PREVIOUS/'compile.execution.json').read_text())['exitCode']==0
shutil.copytree(PREVIOUS/'classes',N/'classes')
shutil.copyfile(PREVIOUS/'sampler-class-hashes.json',N/'sampler-class-hashes.json')
expected=json.loads((N/'sampler-class-hashes.json').read_text())
assert expected=={str(p.relative_to(N/'classes')):sha(p) for p in (N/'classes').rglob('*.class')}
write(N/'sampler-reuse.actual.json',{'status':'PASS_RECENT_GENUINE_JAVAC_SAMPLER_CLASS_REUSE_WITH_IDENTICAL_SOURCE_AND_CP','compileExecutionPath':str((PREVIOUS/'compile.execution.json').relative_to(R)),'compileExecutionSha256':sha(PREVIOUS/'compile.execution.json'),'samplerSourceSha256':sha(N/'MatrixFiniteNativeProbe.java'),'classpathSha256':sha(N/'classpath-current.txt'),'samplerClassMapSha256':sha(N/'sampler-class-hashes.json'),'newCompilationClaim':False,'sourceAndClasspathByteIdentical':True})
