from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess,importlib.util
root=Path.cwd(); own=Path(__file__).resolve().parent; base=own.parent
read=lambda p:json.loads(p.read_text())
def bind(p):
 b=p.read_bytes();return {'path':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,x):
 with (own/n).open('x') as o:json.dump(x,o,ensure_ascii=False,indent=2);o.write('\n')
author=base.parent/'biologie-he-metabolism-ecology-one-profile-two-field-followup-author-root-20261008-v5'
entry_path=author/'neutral-one-profile-two-field-only.author.entry.json'; seal_path=author/'one-profile-two-field-only.author.first-input.freeze.json'
entry=read(entry_path);seal=read(seal_path)
assert bind(seal_path)['sha256']=='333a85343faeed5782d07c3caf5875161a9df29be7a4c6818557f3d0734111e0'
for b in seal['files']:assert bind(root/b['path'])==b
v4seal=base/'targeted-six-case-followup-v4/six-case-five-profile-independent-b.followup-first.freeze.json'
assert bind(v4seal)['sha256']=='a5f2ab0ff0f04d8c1ed23415cfe12054c83eea6017ce88282e5d482cd4526004'
for b in read(v4seal)['files']:assert bind(root/b['path'])==b
whole48=root/entry['whole48CasesRetainedExactly']['path'];assert bind(whole48)==entry['whole48CasesRetainedExactly']
delta=read(root/entry['actualTwoFieldDelta']['path'])
old_path=root/delta['originalV4Profile']['path'];new_path=root/delta['newProfile']['path']
assert bind(old_path)==delta['originalV4Profile'] and bind(new_path)==delta['newProfile']
old=read(old_path);new=read(new_path)
diffs=[]
def diff(a,b,path=()):
 if type(a)!=type(b):diffs.append({'path':list(path),'before':a,'after':b});return
 if isinstance(a,dict):
  assert a.keys()==b.keys()
  for k in a:diff(a[k],b[k],path+(k,))
 elif isinstance(a,list):
  assert len(a)==len(b)
  for i,(x,y) in enumerate(zip(a,b)):diff(x,y,path+(i,))
 elif a!=b:diffs.append({'path':list(path),'before':a,'after':b})
diff(old,new)
assert len(diffs)==2
for d,f in zip(diffs,['understandingFocusDe','understandingFocusEn']):assert d['path']==['goals',16,'profile','applicationCaseBriefs',0,f]
profile=new['goals'][16]['profile'];core,transfer=profile['expectations']
for suffix in ['De','En']:
 assert profile['applicationCaseBriefs'][0]['understandingFocus'+suffix]==core['essentialUnderstanding'+suffix]+' '+transfer['essentialUnderstanding'+suffix]
assert new['goals'][16]['goalId']=='4ef85d98-5e20-540b-9adf-89592febc438'
write('actual-two-fields-only-and-retained48-23.independent-b.json',{'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'authorFirstSeal':bind(seal_path),'ownV4FirstSeal':bind(v4seal),'newP24':bind(new_path),'retainedWhole48Cases':bind(whole48),'actualDiff':diffs,'other23WholeProfilesExact':True,'allOtherP17FieldsExact':True,'all48WholeCasesExact':True,'oldOwnSealsUnchanged':True,'currentPeerRead':False,'activeWrites':0})
write('two-focus-fields-targeted-scientific-first.verdict.independent-b.json',{'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'codex-independent-b-flora_fauna','role':'Independent targeted follow-up of own P17 residual focus finding; no unchanged science restart','goalId':'4ef85d98-5e20-540b-9adf-89592febc438','caseId':'he-metabolism-ecology24-17-case-1','decision':'KEEP','actuallyReadWholeBeforeAndAfterDEENFocus':True,'scientificReason':'The two remaining author/curriculum-elaboration clauses are actually removed. The focus still distinguishes local productive source A from immigration-dependent sink B even at a constant observed population. Sink connectivity alone cannot create sufficient productive emigrants. Habitat quality, distance and species-specific traits correctly limit model transfer. Both cleaned focus fields now match the retained core and transfer biological expectations. No scientific task, answer, scoring or fresh-transfer demand has been removed. The model remains an authored operationalization, not a newly named official compulsory model.','resolvedOwnFindingIds':['BIO24-B-P17-RESIDUAL-FOCUS-V4','BIO24-B-P17-QA-META'],'overallSourceScienceClearCandidateOrdinals':[4,5,6,7,9,10,11,12,13,14,15,17,18,19,20,21,22,23,24],'remainingHeldCandidateOrdinals':[1,2,3,8,16],'otherSourceAndCompoundHoldsRetained':True,'nativeUpdatedPBindingsPending':True,'D_VPending':True,'actualLearnerEvidence':False,'performedExperiments':0,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
spec=importlib.util.spec_from_file_location('ordinary_schema_validator',root/'scripts/validate_schemas.py');m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);schema=read(root/'docs/landscape-runtime.schema.json')
jsonpaths=list(own.glob('*.json'))
for p in jsonpaths:assert m.validate_file(p.relative_to(root).as_posix(),schema)
paths=[p for p in own.rglob('*') if p.is_file()];assert not any(p.is_symlink() for p in own.rglob('*'))
a=['git','check-ignore','--stdin'];r=subprocess.run(a,input=('\n'.join(p.relative_to(root).as_posix() for p in paths)+'\n').encode(),capture_output=True)
for ch,data in [('stdout',r.stdout),('stderr',r.stderr)]:
 with (own/f'portability.{ch}.actual.txt').open('xb') as o:o.write(data)
assert r.returncode==1 and r.stdout==b''
write('actual-input-old-seals-schema-portability.independent-b.receipt.json',{'schemaVersion':1,'authorInputFilesVerified':len(seal['files']),'ownV4InputsVerified':len(read(v4seal)['files']),'actualTwoFieldDiffCount':len(diffs),'ordinaryValidatorOwnJSONFiles':len(jsonpaths),'actualCheckIgnoreArgv':a,'actualCheckIgnoreExit':r.returncode,'ignoredOwnFiles':0,'ownSymlinks':0,'currentPeerRead':False,'activeWrites':0})
write('neutral-two-field-P17-independent-b.followup.entry.json',{'schemaVersion':1,'role':'Independent genuine two-field-only P17 follow-up','authorEntry':bind(entry_path),'authorFirstSeal':bind(seal_path),'ownV4FirstSeal':bind(v4seal),'verdict':bind(own/'two-focus-fields-targeted-scientific-first.verdict.independent-b.json'),'actualDelta':bind(own/'actual-two-fields-only-and-retained48-23.independent-b.json'),'overallSourceScienceClearCandidates':19,'remainingHeldCandidateOrdinals':[1,2,3,8,16],'nativeUpdatedPBindingsPending':True,'D_VPending':True,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
bindings={b['path']:b for b in seal['files']}
for p in [entry_path,seal_path,v4seal,whole48,old_path]:bindings[bind(p)['path']]=bind(p)
for p in sorted(own.rglob('*')):
 if p.is_file():bindings[bind(p)['path']]=bind(p)
write('two-field-P17-independent-b.followup-first.freeze.json',{'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'Genuine own targeted P17 first follow-up; old first/final seals unchanged; peer unread','files':sorted(bindings.values(),key=lambda b:b['path']),'targetedP17Decision':'KEEP','overallScienceSourceClearCandidates':19,'remainingHeldCandidateOrdinals':[1,2,3,8,16],'currentPeerRead':False,'nativeD_VApproved':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'firstSeal':bind(own/'two-field-P17-independent-b.followup-first.freeze.json'),'neutralEntry':bind(own/'neutral-two-field-P17-independent-b.followup.entry.json'),'targetedP17':'KEEP','scienceSourceClear':19,'remainingHolds':[1,2,3,8,16]},indent=2))
