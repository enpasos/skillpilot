from pathlib import Path
import json,hashlib,shutil,os,datetime
E=Path('/mnt/e/skillpilot-chemie-L7-20261017');R=Path('/home/enpasos/projects/skillpilot');O=E/'paired-package03-actual-current650-technical-v1';F=O/'capsule';S=E/'current650-post20-P439-SEM-paired-context-final-technical-b-v1/capsule'
BASE=E/'paired-twenty-foundations-and-coordinate-priors-actual-whole650-assembly-root-v1';A=E/'surfactants-softeners-retained-target-scope-author-v1';B=E/'surfactants-softeners-independent-b-v1';IR=E/'surfactants-softeners-informed-root-review-v1';OLD=E/'actual650-paired-twenty-foundations-and-coordinate-stock-applicability-root-v1'
C=Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json');VD=Path('curricula/DE/Gymnasium/composition-views/chemie')
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def pin(p):p=Path(p);return {'path':str(p),'sha256':sha(p),'bytes':p.stat().st_size}
def canon(z):return hashlib.sha256(json.dumps(z,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def dump(p,z):
 p=Path(p);p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(z,ensure_ascii=False,indent=2)+'\n')
def replace_owned(p,data):
 p=Path(p);assert p.is_relative_to(F);assert all(not d.is_symlink() for d in p.parents if d.is_relative_to(F));q=p.with_name(p.name+'.package03-owned-new');assert not q.exists();q.write_bytes(data);q.replace(p)
cp=BASE/'candidate.canonical650.paired-c95-twenty-foundations-and-coordinate-priors.private.json';vp=BASE/'candidate.whole39views.paired48-plus20-foundations.private.json';sel=read(S.parent/'SELECTOR.final-technical-current439-one-paired363-successor.json');pp=Path(sel['mergedP439']['physicalPath']);sem=Path(sel['SEM650']['physicalPath']);ns=Path(sel['namespaceIndex']['physicalPath'])
expected={cp:'48482f9f092028b1f33c41e9223c250dbeb0f00750614f42cb613b6f72cd51dd',vp:'f3989d39a8096f160de40c35b81281054cbe06012626a227439a7f5895bfd9ac',pp:'469ab00b73a9b1454d853fc9ce7db6cbfce1e2c5968a5b19e9ad807875b70b3e',A/'SELECTOR.clean-content-for-two-other-reviewers.json':'f6fd0b94461d8e773389e5361d856568283e5d44644c70f5ffe18e3b14adbdc4',A/'REVIEW-INPUT.clean-package03-whole-content.json':'069a01271849b934bc6caf2478a7758e4c34ee547174ff26a7bcf0530177062b',A/'CAS.whole-two-ordinary-goals-and-one-P-body.unapplied.json':'663df4b0f691637798062654f910a7a5b5f2bb62a51a00e4a7f409e5ae732524',B/'FIRST.independent-b.package03.json':'a41ecb75713a69e9c6837651d8007807dfaaa81a74f00e880ce12986aeaa9bb5',B/'FIRST.SEAL.sha256':'00d9fa22b6d7352602e36c9e80adf516d28dec568111cbfa325e871b0ab7061b',IR/'REVIEW.informed-root.package03.json':'7b4d22faed312e709895b85c8a0fa8e48c81d90a660c4f7fe26804106e063cbc',IR/'SEAL.informed-root.package03.json':'952dfc6261ab09cc5e8082e80ef2cfda722d343eef736993533d3a3924b33f7a'}
for p,h in expected.items():assert sha(p)==h,(str(p),sha(p),h)
assert sha(S/C)==sha(cp)
d=read(A/'REVIEW-INPUT.clean-package03-whole-content.json');cas=read(A/'CAS.whole-two-ordinary-goals-and-one-P-body.unapplied.json');land=read(cp);views=read(vp);assert len(land['goals'])==650 and len(views)==39
assert cas==d['guardedWholeObjectProposal']
gm={g['id']:g for g in land['goals']};changes=cas['canonicalWholeGoalChanges'];assert len(changes)==2
for ch in changes:assert gm[ch['goalId']]==ch['before'] and canon(ch['before'])==ch['beforeDigest'] and canon(ch['after'])==ch['afterDigest']
pRows=[json.loads(l) for l in pp.read_text().splitlines() if l.strip()];assert len(pRows)==439;pcas=cas['positiveProfileWholeBodyChange'];pBefore=next(p for p in pRows if p['goalId']==pcas['goalId']);assert pBefore['profile']==pcas['before'];assert canon(pcas['after'])==pcas['afterDigest']
source_views={read(p)['viewId']:p for p in (S/VD).glob('*.json')};assert len(source_views)==39
assert all(read(source_views[v['viewId']])==v for v in views)
protected=[S/C,pp,sem,ns,R/C,*source_views.values()]
for rel in ['curricula/DE/Gymnasium/provenance/source-landscape-registry.json','curricula/DE/Gymnasium/provenance/canonical-goal-provenance-registry.json','curricula/DE/Gymnasium/provenance/canonical-goal-applicability-override-registry.json','app/scripts/applicabilityCompiler.ts','app/scripts/memoryCardReviewConfigDiscovery.ts','app/src/utils/jurisdictionMetadata.ts','app/src/landscapeTypes.ts']:
 if (S/rel).exists():
  assert sha(S/rel)==sha(OLD/'capsule'/rel),rel
  protected.append(S/rel)
 else: protected.append(OLD/'capsule'/rel)
mCfg=read(S/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json')
protected.extend([S/mCfg['reviewPath'],S/mCfg['cardReviewPath'],S/'curricula/DE/Gymnasium/quality/memory-card-review/canonical-chemistry-full.config.json'])
for p in d['allSevenUnchangedActualDeckPins']:protected.append(Path(p['path']))
protections=[pin(p) for p in protected];dump(O/'GUARD.protected-before.json',{'atUTC':datetime.datetime.now(datetime.timezone.utc).isoformat(),'inputs':[pin(p) for p in expected],'protected':protections})
print('Guards passed. Copying physical private capsule; source files will not be hardlinked.',flush=True)
shutil.copytree(S,F,symlinks=True,copy_function=shutil.copyfile,ignore=lambda path,names:['node_modules'] if Path(path)==S/'app' else [])
os.symlink(S/'app/node_modules',F/'app/node_modules',target_is_directory=True)
# The P-binding capsule intentionally omits original source/mapping registries.
# Add only missing compiler inputs from the exact previously measured APV capsule.
addedCompilerInputs=[]
for source in sorted((OLD/'capsule/curricula').rglob('*')):
 if not source.is_file():continue
 relative=source.relative_to(OLD/'capsule');target=F/relative
 if target.exists():continue
 target.parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(source,target)
 addedCompilerInputs.append({'source':str(source),'relative':str(relative),'sha256':sha(source),'bytes':source.stat().st_size})
dump(O/'GUARD.exact-missing-source-and-compiler-inputs-added.json',{'sourceCapsule':str(OLD/'capsule'),'method':'Only previously absent original source/mapping/compiler inputs copied; no current private file overwritten','files':addedCompilerInputs})
print('Physical capsule and missing original compiler inputs copied.',flush=True)
# Rebase only the two exact matching before objects; preserve all current C20 context.
for ch in changes:
 i=next(i for i,g in enumerate(land['goals']) if g['id']==ch['goalId']);land['goals'][i]=ch['after']
candidate=O/'candidate.canonical650.C20-plus-paired-package03.private.json';dump(candidate,land);replace_owned(F/C,candidate.read_bytes())
viewOut=O/'candidate.whole39views.exact-current-C20.private.json';shutil.copyfile(vp,viewOut);assert sha(vp)==sha(viewOut)
inputDir=F/'candidate-inputs/PACKAGE03';inputDir.mkdir()
inputs={}
for key,p in [('clean',A/'REVIEW-INPUT.clean-package03-whole-content.json'),('CAS',A/'CAS.whole-two-ordinary-goals-and-one-P-body.unapplied.json'),('B',B/'FIRST.independent-b.package03.json'),('Bseal',B/'FIRST.SEAL.sha256'),('rootInformed',IR/'REVIEW.informed-root.package03.json'),('rootSeal',IR/'SEAL.informed-root.package03.json'),('oldP439',pp),('oldSEM',sem),('oldNamespaceIndex',ns)]:
 q=inputDir/(key+Path(p).suffix);shutil.copyfile(p,q);inputs[key]={**pin(p),'copyRelative':str(q.relative_to(F))}
meta={'physicalRoot':str(F),'outputRoot':str(O),'canonicalRelative':str(C),'baseCanonical':pin(cp),'baseViews':pin(vp),'newCanonical':pin(candidate),'wholeViewCollection':pin(viewOut),'currentViewFiles':[{'viewId':v,'relative':str(p.relative_to(S)),'before':pin(p),'copied':pin(F/p.relative_to(S))} for v,p in source_views.items()],'inputs':inputs,'SEMOriginalRelative':str(sem.relative_to(S)),'outputsRelative':'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-17/chemie-paired-package03-current650-technical-v1','oldCapsuleRoot':str(S),'sourceGuard':protections,'technicalSerializerNewIndependentVotes':0,'newNativeRunIds':[],'M7':False,'HumanApproval':False}
dump(O/'ASSEMBLY.exact-guards-and-inputs.json',meta)
for p in protections:assert sha(p['path'])==p['sha256'],p['path']
(O/'cache').mkdir()
print(json.dumps({'physicalRoot':str(F),'canonical':pin(candidate),'whole39Views':pin(viewOut),'changedGoalIds':[z['goalId'] for z in changes],'unchangedP439Before':pin(F/pp.relative_to(S)),'guardedWholePMatchesCurrent':True,'independentVotesAdded':0}),flush=True)
