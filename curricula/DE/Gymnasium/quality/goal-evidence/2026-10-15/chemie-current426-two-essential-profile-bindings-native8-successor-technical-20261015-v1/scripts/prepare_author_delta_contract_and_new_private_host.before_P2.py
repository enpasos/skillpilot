# SPDX-License-Identifier: Apache-2.0
"""Nur neutrale Vorbereitung vor echter P2-Freigabe; keine Normalisierung/Render."""
from pathlib import Path
import copy,hashlib,json,jsonschema,os,shutil
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent;H=R/'tmp/chemie-m7-resumed-20261015/current426-two-essential-P2-native8-successor-own-host-v1'
def load(p):return json.loads(p.read_text())
def ref(p):
 b=p.read_bytes();return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def verify(a):
 p=R/a['path'];assert ref(p)==a,p;return p
def put(p,d):
 assert not p.exists(),p;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
bp=E/'chemie-current426-five-genuine-informed-PA-bindings-technical-20261015-v1/OUTPUTS.finite-current426-final-P5-P2-M2-V2-Native8.technical-selector.json';assert ref(bp)['sha256']=='sha256:5f296b402e4f20daadd0a226b1c8ecbec2e28a10cde581782b83c90dd10ed2d7';base=load(bp)
for a in load(R/base['finalSealPath'])['files']:verify(a)
sp=E/'chemie-two-existing-profiles-essential-chemistry-only-author-successor-20261015-v1/NEUTRAL.finite-two-essential-understanding-profiles.author-selector.json';assert ref(sp)['sha256']=='sha256:f2962d8db498f3a4053ce49d30ab6dfa05f8726d59433abd8286f058ad41064c';s=load(sp)
for a in load(R/s['sealPath'])['files']:verify(a)
raw=load(verify(s['wholeRawProfiles']));before=load(verify(s['originalWholeInputs']));byp={a['goalId']:a for a in raw['records']};beforeby={a['goalId']:a for a in before['records']};assert set(byp)==set(beforeby)=={'1d2e7b80-653d-57b8-a284-8ede5a353b73','b47d542d-c2d7-5554-95dc-10b47ab622ab'}
old=load(verify(base['neutralFinalNative8']));book=load(verify(old['roundAInput']));oldprofiles={g['goalId']:g['reviewContext']['evidenceProfile'] for g in book['goals']};assert all(beforeby[g]['profile']==oldprofiles[g]['profile'] for g in beforeby)
def diff(a,b,p=''):
 if type(a)!=type(b):return[p]
 if isinstance(a,dict):return[q for k in sorted(set(a)|set(b)) for q in ([p+'/'+k] if k not in a or k not in b else diff(a[k],b[k],p+'/'+k))]
 if isinstance(a,list):
  if len(a)!=len(b):return[p]
  return[q for i,(x,y) in enumerate(zip(a,b)) for q in diff(x,y,p+'/'+str(i))]
 return [] if a==b else[p]
deltas=[]
for g in byp:
 paths=diff(beforeby[g]['profile'],byp[g]['profile'],'/profile');assert set(paths)=={'/profile/expectations/'+str(i)+'/'+k for i in [0,1] for k in ['essentialUnderstandingDe','essentialUnderstandingEn']}
 deltas.append({'goalId':g,'changedPointers':paths,'changedFields':4,'allOtherWholeProfileFieldsExact':True})
profile_schema=load(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json');validator=jsonschema.Draft202012Validator({'$schema':profile_schema['$schema'],'$defs':profile_schema['$defs'],'$ref':'#/$defs/profile'})
for row in raw['records']:validator.validate(row['profile'])
config_schemas=[R/'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json',R/'contracts/goal-description-review/v1/goal-description-rollout-batch-config.schema.json'];schema_refs=[ref(p) for p in config_schemas]+[ref(R/'contracts/goal-evidence/v2/goal-evidence-profile.schema.json')]
mp=verify(base['exactRebuildRecipe']);m=load(mp);assert not H.exists();H.mkdir(parents=True)
for q in R.iterdir():
 if q.name not in ['app','tmp','.git']:(H/q.name).symlink_to(q,target_is_directory=q.is_dir())
(H/'app').mkdir();(H/'app/scripts').mkdir();(H/'app/public').mkdir()
for q in (R/'app').iterdir():
 if q.name not in ['scripts','public']:(H/'app'/q.name).symlink_to(q,target_is_directory=q.is_dir())
def branch(q):
 if q.is_symlink():
  children=list(q.resolve().iterdir());q.unlink();q.mkdir()
  for c in children:(q/c.name).symlink_to(c,target_is_directory=c.is_dir())
 elif not q.exists():q.mkdir()
def install(src,rel,physical=False,hardlink=False):
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink() or q.is_file():q.unlink()
 if hardlink:os.link(src.resolve(),q)
 elif physical:shutil.copyfile(src,q)
 else:q.symlink_to(src)
for rel in ['curricula/DE/Gymnasium/canonical','curricula/DE/Gymnasium/quality/goal-visualization-qa','curricula/DE/Gymnasium/quality/goal-visualization-review']:
 q=H/rel;par=H
 for part in q.relative_to(H).parts[:-1]:par/=part;branch(par)
 if q.is_symlink():q.unlink()
 assert not q.exists();q.mkdir()
for a in m['stockPhysicalModules']:install(verify(a),a['path'],True)
for a in m['aliases']:install(verify(a['physicalRepositorySource']),a['normalHostAlias'],a.get('physicalWithinHost',False))
selected={a['normalPublicAlias']:a for a in m['selectedReadOnlyPublicImageHardlinks']}
for a in m['selectedCurrentAssetRows']:
 src=verify(a['physicalRepositorySource']);install(src,a['normalCanonicalDestination']);install(src,a['normalPublicDestination'],hardlink=a['normalPublicDestination'] in selected)
for a in selected.values():
 src=verify(a['originalRepositorySource']);dst=H/a['normalPublicAlias'];assert src.stat().st_ino==dst.stat().st_ino and src.stat().st_dev==dst.stat().st_dev
normal_c='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';normal_s='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json';normal_q='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json'
assert ref(H/normal_c)['sha256']==base['canonical']['sha256'];assert ref(H/normal_s)['sha256']==base['semantic']['sha256'];assert ref(H/normal_q)['sha256']==base['visualizationQA']['sha256']
plan=O/'PREPARED.exact-eight-essential-field-delta-and-new-host.awaiting-genuine-P2.json';put(plan,{'schemaVersion':1,'role':'Vorbereiteter neutraler achtfeldiger Profilfolger; echte P2-Freigabe noch ausstehend','baseTechnicalSelector':ref(bp),'baseTechnicalSeal':ref(R/base['finalSealPath']),'baseNeutralNative8':base['neutralFinalNative8'],'baseNineteenCases':base['wholeCurrentNineteenCaseBindings'],'authorSelector':ref(sp),'authorSeal':ref(R/s['sealPath']),'wholeRawSuccessorProfiles':s['wholeRawProfiles'],'wholeOriginalRawProfiles':s['originalWholeInputs'],'actualProfileDeltas':deltas,'actualChangedLanguageFields':8,'wholeGoalCount':570,'curricularAtomic':426,'canonical':base['canonical'],'semantic':base['semantic'],'visualizationQA':base['visualizationQA'],'memoryConfig':base['memoryFullIntegrationConfig'],'atomicityConfig':base['semanticAtomicityConfig'],'allNineteenWholeCasesUnchanged':True,'closedProfileSchemaPreflight':'PASS','actualSchemas':schema_refs,'exactBaseMap':ref(mp),'executionHost':H.relative_to(R).as_posix(),'oneNewPrivateHost':True,'readOnlyImageHardlinks':8,'rasterByteCopies':0,'normalRecordsCreated':0,'newScienceVotes':0,'newModelCalls':0,'nativeRenders':0,'newChecksForAOrMOrV':0,'oldRootWrites':0,'oldHostWrites':0,'waitingForAcceptedGenuineP2Selector':True})
print(json.dumps({'prepared':ref(plan),'actualChangedEssentialLanguageFields':8,'allOtherProfileFieldsExact':True,'closedActualProfileSchema':'PASS','newPrivateHost':1,'mediaByteCopies':0,'normalRecords':0,'renders':0},ensure_ascii=False))
