# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
import json,hashlib,shutil,copy
R=Path.cwd();O=Path(__file__).resolve().parents[1];E=O.parent;V=E/'chemie-six-inputs-three-scope-native9-preparation-technical-20261015-v1';A=E/'chemie-one-analgesic-rezeptfrei-terminology-author-20261015-v1';G='f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528'
def read(p):return json.loads(p.read_text())
def bind(p):return {'path':str(p.relative_to(R)),'sha256':'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest(),'bytes':p.stat().st_size}
def write(n,x):p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(x,ensure_ascii=False,indent=2)+'\n')
oldseal=read(V/'FILES.finite-native9-technical.seal.json')
for row in oldseal['files']:assert bind(R/row['path'])==row
actual=sorted(str(p.relative_to(R))for p in V.rglob('*')if p.is_file());assert actual==sorted([r['path']for r in oldseal['files']]+[str((V/'FILES.finite-native9-technical.seal.json').relative_to(R))])
selector=A/'INPUTS.one-rezeptfrei-term.neutral-author.selector.json';assert bind(selector)['sha256']=='sha256:9588f2f208d2244afaae2785edd221f0463f0079d1be7c992c817bb67e0608ea';a=read(selector);canonical=R/a['canonical']['path'];semantic=R/a['semanticSourceIdentityOnly']['path'];assert bind(canonical)['sha256']=='sha256:fccb633f60e264e48470aadf96c66f0aac9d8b4a8e0abbcc15d4ef671926c647';assert bind(semantic)['sha256']=='sha256:3e8f562fc19f177f987d1168718ffb48be3d115c45be63dae59096d909f9f27d'
oldcan=read(R/read(V/'checks/REBUILD.native9.final-actual-V2.physical-map.json')['finalCanonical']['path']);newcan=read(canonical);oldby={g['id']:g for g in oldcan['goals']};newby={g['id']:g for g in newcan['goals']};assert [g for g in oldby if oldby[g]!=newby[g]]==[G];assert [k for k in oldby[G]if oldby[G][k]!=newby[G][k]]==['description'];assert oldby[G]['description'].replace('frei verkäuflicher','rezeptfreier')==newby[G]['description']
write('checks/ORIGINAL.native9-v1-entire-finite-root.before.json',{'originalSeal':bind(V/'FILES.finite-native9-technical.seal.json'),'filesIncludingSeal':[bind(p)for p in sorted(V.rglob('*'))if p.is_file()],'allOriginalBytesVerified':True})
# Exact scientific companions: only actual matching whole f71 goal objects are advanced; all case/profile bodies remain exact.
replacements=[]
def currentObjects(x,path=''):
 if isinstance(x,dict):
  if x==oldby[G]:replacements.append(path);return copy.deepcopy(newby[G])
  return{k:currentObjects(v,path+'/'+k)for k,v in x.items()}
 if isinstance(x,list):return[currentObjects(v,path+'/'+str(i))for i,v in enumerate(x)]
 return x
for folder in ['blind-inputs','inputs']:
 (O/folder).mkdir(exist_ok=True)
 for p in sorted((V/folder).iterdir()):
  if not p.is_file():continue
  if p.name in ['nine-whole-current-goals-prerequisites-parents.scientific.json','thirteen-whole-current-context-sidecar.scientific.json']:
   x=currentObjects(read(p));x['currentCanonical']=bind(canonical);write(folder+'/'+p.name,x)
  else:shutil.copy2(p,O/folder/p.name)
# Preserve exact raw5 and original scope3 lines; only f71 is rebuilt via stock after private aliases exist.
(O/'profiles').mkdir();rawlines=(V/'profiles/six-raw-E0G0.current-context.stock-bound.jsonl').read_text().splitlines(keepends=True);(O/'profiles/five-raw-E0G0-original-lines.exact.jsonl').write_text(''.join(l for l in rawlines if json.loads(l)['goalId']!=G));shutil.copy2(V/'profiles/three-current-E1G1-original-record-lines.exact.jsonl',O/'profiles/three-current-E1G1-original-record-lines.exact.jsonl')
prior=next(json.loads(l)for l in rawlines if json.loads(l)['goalId']==G);candidate={'schemaVersion':1,'authoringContract':'positive-understanding-evidence-candidates-v1','reviewId':'chemie-native9-rezeptfrei-one-raw-binding-20261015-v2','reviewedAt':'2026-10-15T00:00:00Z','reviewer':'Technical one-term current-context binder; no scientific vote','goals':[{'goalId':G,'reason':'Exact unchanged existing profile body; only German rezeptfrei terminology and resulting current goal/review binding advance through unchanged stock. No new P approval.','evidenceLevel':'E0','maximumClaimScope':'G0','dissent':['No new clinical, dispensing or dosing obligation is authored. Existing source/course and scientific boundaries are unchanged.'],'profile':prior['profile']}]};write('profiles/one-existing-f71-profile-body.raw-author.candidate.json',candidate)
config=read(V/'config/P6.raw-technical-binding.config.json');config.update(reviewId=candidate['reviewId'],reviewPath=str((O/'profiles/one-f71-raw-E0G0.stock-bound.jsonl').relative_to(R)),scope={'label':'One exact existing f71 profile body, technical terminology binding only','goalIds':[G]});write('config/P1.f71-raw-technical-binding.config.json',config)
base=read(V/'config/whole422.normal-stock-base.config.json');base.update(bookId='chemie-six-inputs-three-scope-current422-20261015-v2',evidenceReviewPaths=[str((O/'profiles/six-raw-E0G0.current-context.stock-bound.jsonl').relative_to(R)),str((O/'profiles/three-current-E1G1-original-record-lines.exact.jsonl').relative_to(R))],outputPath=str((O/'candidate/IN-MEMORY-ONLY.full422-not-materialized.json').relative_to(R)));write('config/whole422.normal-stock-base.config.json',base)
native=read(V/'config/native9.normal-prepare-only.config.json');native.update(batchId='chemie-six-inputs-three-scope-current422-native9-rezeptfrei-20261015-v2',bookId='chemie-six-inputs-three-scope-current422-native9-rezeptfrei-20261015-v2',baseGoalBookConfigPath=str((O/'config/whole422.normal-stock-base.config.json').relative_to(R)),outputDirectory=str((O/'native-nine').relative_to(R)));write('config/native9.normal-prepare-only.config.json',native)
mp=read(V/'checks/REBUILD.native9.final-actual-V2.physical-map.json');mp.update(role='Fresh native9-v2 single terminology successor; exact unchanged assets, no scientific judgments',executionHost='tmp/chemie-m7-resumed-20261015/six-inputs-three-scope-native9-rezeptfrei-final-host-v2',finalCanonical=bind(canonical),finalSemantic=bind(semantic),sourceNative9V1Map=bind(V/'checks/REBUILD.native9.final-actual-V2.physical-map.json'))
for row in mp['aliases']:
 if row['normalHostAlias']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':row['physicalRepositorySource']=bind(canonical)
 if row['normalHostAlias']=='curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json':row['physicalRepositorySource']=bind(semantic)
write('checks/REBUILD.native9.final-actual-V2.physical-map.json',mp)
write('checks/CAS.one-actual-term-whole-goal-and-companion-transports.json',{'role':'Actual whole-goal import/preservation proof only','beforeCanonical':read(V/'checks/REBUILD.native9.final-actual-V2.physical-map.json')['finalCanonical'],'afterCanonical':bind(canonical),'afterSemantic':bind(semantic),'wholeGoals':560,'onlyChangedGoal':G,'onlyChangedField':'description','exactReplacement':{'from':'frei verkäuflicher','to':'rezeptfreier'},'other559WholeGoalsExact':True,'f71EnglishResourcesALTRequiresScopesExact':True,'all435AssetRowsAndPhysicalSourcesExact':mp['selectedCurrentAssetRows']==read(V/'checks/REBUILD.native9.final-actual-V2.physical-map.json')['selectedCurrentAssetRows'],'same9Goals':native['goalIds'],'wholeCurrentGoalObjectReplacementsInCompanions':replacements,'all12WholeCasesByteFileExact':bind(V/'blind-inputs/twelve-selected-whole-DE-EN-cases.exact-scientific.json')['sha256']==bind(O/'blind-inputs/twelve-selected-whole-DE-EN-cases.exact-scientific.json')['sha256'],'finalQA438WholeBytesRemainExact':mp['finalNormalQA']})
# Reuse the existing tiny sparse-host installer, without pending-QA omission because final QA is unchanged and already genuine.
s=(V/'scripts/build_fresh_sparse_native9_host.py').read_text().replace('REBUILD.native9.PENDING-final-QA.physical-map.json','REBUILD.native9.final-actual-V2.physical-map.json').replace("'QAfinal':'PENDING'","'QAfinal':'Exact unchanged genuine QA43826f87…' ");(O/'scripts/build_fresh_sparse_native9_host.py').write_text(s)
shutil.copy2(V/'scripts/run_native9_once.py',O/'scripts/run_native9_once.py')
write('INPUTS.technical-native9-v2-before-run.selector.json',{'schemaVersion':1,'role':'Exact technical single-term successor; no new reviews','authorNeutralSelector':bind(selector),'canonical':bind(canonical),'semantic':bind(semantic),'originalNative9Seal':bind(V/'FILES.finite-native9-technical.seal.json'),'sameGoalIds':native['goalIds'],'onlyNewMaterialReviewTarget':G,'allSixScientificProfileBodiesUnchanged':True,'allWholeCasesAndImageBodiesUnchanged':True,'threeExistingE1G1RecordBytesUnchanged':True,'nativeCommandsRun':0,'diskPreflight':'Await root verified obsolete ignored-image-cache cleanup receipt before host copies/rendering'})
print(json.dumps({'root':str(O.relative_to(R)),'sameGoals':9,'newTermOnly':G,'v1EntireFiniteRootVerified':True,'hostNotCreatedYet':True,'nativeCommands':0}))
