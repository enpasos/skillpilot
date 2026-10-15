# SPDX-License-Identifier: Apache-2.0
"""Prepare only exact technical inputs. No scientific evaluation or central build."""
import copy, hashlib, json, shutil
from pathlib import Path
from datetime import datetime, timezone
R = Path.cwd()
O = Path(__file__).resolve().parents[1]
E = R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-15'
V = E/'chemie-equilibrium16-current422-native-preparation-technical-20261015-v1'
A = E/'chemie-pourbaix-one-missing-image-author-root-20261015-v1'
Q = E/'chemie-pourbaix-one-current-context-independent-V-20261015-v1'
GID = 'f0f2c5f8-06f1-5774-a176-d96505727acf'
assert not (O/'FILES.finite-native16-technical.seal.json').exists()
def read(p): return json.loads(p.read_text())
def bind(p):
 b=p.read_bytes(); return {'path':p.relative_to(R).as_posix(),'sha256':'sha256:'+hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(n,d):
 p=O/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
def verify(d): assert bind(R/d['path'])==d,d['path']
baseline=read(V/'FILES.finite-native16-technical.seal.json')
for row in baseline['files']:verify(row)
write('checks/ORIGINAL.v1.before.whole-finite-inventory.json',{'seal':bind(V/'FILES.finite-native16-technical.seal.json'),'filesIncludingSeal':[bind(p)for p in sorted(V.rglob('*'))if p.is_file()],'allOriginalSealMembersVerified':True})
old=read(V/'INPUTS.technical-native16-preparation.original-physical-selector.json')
canonical=A/'candidate/canonical560.current422.one-pourbaix-image.author.json'
image=A/f'candidate/visualizations/chemie/{GID}/{GID}.png'
normalV=Q/'qa/V1.final-context.normal-alias.qa.json'
assert bind(canonical)['sha256']=='sha256:52e199c13f1f0e13ffc148d9babd975e04dbee9b2ac3706fbe3e4b0ab06087d3'
assert bind(image)['sha256']=='sha256:6778295209ab596f763c1f71ee08d372743b656f6a851a2129f183830d5fd2ad'
verify(old['semantic'])
ids=old['goalIds']; before={g['id']:g for g in read(R/old['canonical']['path'])['goals']}; after={g['id']:g for g in read(canonical)['goals']}
assert len(before)==len(after)==560 and set(before)==set(after)
assert [i for i in before if before[i]!=after[i]]==[GID]
assert {k:v for k,v in before[GID].items() if k!='resourceLinks'}=={k:v for k,v in after[GID].items() if k!='resourceLinks'}
oldqa=V/'candidate/QA438.original437-plus-exact-independent-138-V1.json'
qa=read(oldqa); rows=read(normalV)['records'];assert len(qa['records'])==438 and len(rows)==1 and rows[0]['goalId']==GID
missing=[x for x in qa['records']if x['goalId']==GID]
assert len(missing)==1 and missing[0]['visualizationState']=='missing' and missing[0]['imageUrl']==''
qa['records']+=rows
write('candidate/QA439.original438-plus-verbatim-existing-Pourbaix-V1.json',qa)
normal=copy.deepcopy(qa);normal['records']=[x for x in normal['records']if not (x['goalId']==GID and x['imageUrl']=='')]
write('candidate/QA438.normal-unique-goals.existing-Pourbaix-V1-replaces-missing-placeholder.json',normal)
write('checks/CAS.QA439-one-existing-Pourbaix-V1-appended.json',{'originalQA':bind(oldqa),'existingAcceptedNormalV1':bind(normalV),'archive439':bind(O/'candidate/QA439.original438-plus-verbatim-existing-Pourbaix-V1.json'),'normal438':bind(O/'candidate/QA438.normal-unique-goals.existing-Pourbaix-V1-replaces-missing-placeholder.json'),'archiveOriginal438WholeRowsExact':True,'normalOther437WholeRowsExact':True,'mechanism138WholeRowUnchanged':True,'normalObsoleteMissingPlaceholdersRemoved':missing,'stockConstraint':'goalBookModel.ts parseGoalVisualizationQa rejects duplicate goalId before checking visualizationState. Existing missing placeholder has no vote. Archive preserves it; normal input replaces it with existing actual V1.','addedExistingRows':1,'newVotes':0})
m=read(V/'checks/REBUILD.native16.current338-exact-physical-map.json')
m['role']='Native16 final-PNG v2 technical preparation, no scientific judgments'
m['sourceNative16V1Map']=bind(V/'checks/REBUILD.native16.current338-exact-physical-map.json')
m['executionHost']='tmp/chemie-m7-resumed-20261015/equilibrium16-final-PNG-native560-host-v2'
for a in m['aliases']:
 if a['normalHostAlias']=='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json':a['physicalRepositorySource']=bind(canonical)
 if a['normalHostAlias']=='curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json':a['physicalRepositorySource']=bind(O/'candidate/QA438.normal-unique-goals.existing-Pourbaix-V1-replaces-missing-placeholder.json')
assert not any(a['goalId']==GID for a in m['selectedCurrentAssetRows'])
m['selectedCurrentAssetRows'].append({'goalId':GID,'physicalRepositorySource':bind(image),'normalCanonicalDestination':f'curricula/DE/Gymnasium/visualizations/chemie/{GID}/{GID}.png','normalPublicDestination':f'app/public/assets/goal-visualizations/chemie/{GID}/{GID}.png','canonicalMustBePhysicalWithinHost':True,'publicMustBePhysicalWithinHostPublicRoot':True,'publicMaterialization':'exact physical copy of retained author PNG; already accepted V1, no new vote'})
m['physicalPublicSelectedCount']=16;m['physicalPublicSelectedBytes']=sum(a['physicalRepositorySource']['bytes']for a in m['selectedCurrentAssetRows']if a['publicMustBePhysicalWithinHostPublicRoot'])
# The materializer module is an additional exact stock module needed for one raw-profile binding update.
m['stockPhysicalModules'].append(bind(R/'app/scripts/materializePositiveGoalEvidenceCandidates.ts'))
write('checks/REBUILD.native16.current338-exact-physical-map.json',m)
for folder in ['blind-inputs','config','scripts']:(O/folder).mkdir(exist_ok=True)
copies=[]
for p in sorted((V/'blind-inputs').iterdir()):
 shutil.copy2(p,O/'blind-inputs'/p.name);copies.append({'source':bind(p),'blindCopy':bind(O/'blind-inputs'/p.name)})
changes=[]
def transport(x,path=''):
 if isinstance(x,dict):
  if x==before[GID]:changes.append(path);return copy.deepcopy(after[GID])
  return {k:transport(v,path+'/'+k)for k,v in x.items()}
 if isinstance(x,list):return [transport(v,path+'/'+str(i))for i,v in enumerate(x)]
 return x
for name in ['sixteen-whole-current-goals-prerequisites-parents.exact.json','whole-source-cells-and-current-partner-unions.exact.json']:
 src=V/'blind-inputs'/name;new=transport(read(src));write('blind-inputs/'+name,new)
write('checks/BLIND.exact-whole-copies-and-final-PNG-object-transport.json',{'exactCopiesBeforeTargetTransport':copies,'wholeGoalObjectReplacements':changes,'onlyChangedWholeGoalId':GID,'scientificProfileBodiesChanged':0,'wholeCaseBodiesChanged':0,'authorFIRSTAssessmentDossiersCopied':0,'VJudgmentsCopiedToBlindInputs':0,'oldIndependentReviewsCopied':0})
for name in ['whole422.normal-stock-base.config.json','native16.normal-prepare-only.config.json']:
 d=read(V/'config'/name)
 for k in ['bookId','batchId']:
  if k in d:d[k]=d[k].removesuffix('-v1')+'-v2'
 for k in ['baseGoalBookConfigPath','outputDirectory','outputPath']:
  if k in d:d[k]=d[k].replace(V.relative_to(R).as_posix(),O.relative_to(R).as_posix())
 if 'evidenceReviewPaths' in d:d['evidenceReviewPaths']=[(O/'blind-inputs/sixteen-raw-E0G0-author-profiles.jsonl').relative_to(R).as_posix()]
 write('config/'+name,d)
for name in ['rebuild_native16_sparse_host.py','run_normal_sixteen.py']:
 s=(V/'scripts'/name).read_text()
 s=s.replace("r['normalCanonicalDestination'],False","r['normalCanonicalDestination'],r.get('canonicalMustBePhysicalWithinHost',False)")
 s=s.replace('assert len(rows)==31',"assert len(rows)==len(mapping['stockPhysicalModules'])")
 s=s.replace("'stockPhysicalModules':31","'stockPhysicalModules':len(mapping['stockPhysicalModules'])")
 # Retain failed attempts and skip a completed prepare on a repair run.
 s=s.replace("    assert not any(r['name']=='native16-stock-'+mode and r['exitCode']==0 for r in receipts),'Successful '+mode+' must never be repeated in this assignment'","    if any(r['name']=='native16-stock-'+mode and r['exitCode']==0 for r in receipts):continue")
 (O/'scripts'/name).write_text(s)
technical={'schemaVersion':1,'role':'Technical provenance only; not blind scientific reading list','originalV1Seal':bind(V/'FILES.finite-native16-technical.seal.json'),'originalBlindSelector':bind(V/'INPUTS.blind-native16-whole-scientific-materials.selector.json'),'canonical':bind(canonical),'semantic':old['semantic'],'existingPourbaixNormalV1':bind(normalV),'originalRawAuthorProfiles':old['rawAuthorProfiles'],'goalIds':ids,'sourcePrimaryDocuments':old['sourcePrimaryDocuments'],'newScientificVotes':0}
write('INPUTS.technical-native16-final-PNG.physical-provenance.json',technical)
write('checks/CAS.canonical559-and-selected15-whole-goals-unchanged.json',{'before':old['canonical'],'after':bind(canonical),'totalGoals':560,'onlyWholeGoalChanged':GID,'changedFields':['resourceLinks'],'all559OtherWholeGoalsExact':True,'selected15OtherWholeGoalsExact':True,'PourbaixFullTextAndOtherFieldsExact':True,'semanticBytesUnchanged':old['semantic'],'oldSelected15AssetRowsExact':m['selectedCurrentAssetRows'][:-1]==read(V/'checks/REBUILD.native16.current338-exact-physical-map.json')['selectedCurrentAssetRows']})
print(json.dumps({'ownRoot':str(O.relative_to(R)),'canonical':bind(canonical),'QArows':439,'physicalPublicImages':16,'originalV1Verified':True,'newScientificVotes':0},indent=2))
