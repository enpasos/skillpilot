from pathlib import Path
import json,hashlib,subprocess,importlib.util
root=Path.cwd()
base=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/')
f=base/'wirtschaft-current125-native-mapping-and-explicit-BE-course-author-20261009-v1/eight-current-national-GK-terminal-rests-material-author-v1/seven-foreign-KEEP-and-eight-qualified-kind-final493-fieldwise-assembly-v1'
hp=f/'actual-final-seven-foreign-KEEP-CAN493-closedSEM493-two-views-source125-meta-reviewable-freeze.receipt.json';h=json.loads(hp.read_text());ip=Path(h['materialAssemblyIndex']['path']);idx=json.loads(ip.read_text());cp=Path(h['canonical493']['path']);can=json.loads(cp.read_text());goals={g['id']:g for g in can['goals']};beforep=Path(idx['beforeAuthorV6']['path']);before=json.loads(beforep.read_text());bg={g['id']:g for g in before['goals']}
def bind(p):return {'path':str(p),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
def memberDigest(obj):return 'sha256:'+hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()
assert len(goals)==493
for b in [h['canonical493'],h['semanticKinds493CurrentClosedV2'],h['materialAssemblyIndex'],*h['wholeForeignMaterial7ActualKEEP'],*h['wholeNewForeignKind8'].values()]:assert bind(Path(b['path']))['sha256']==b['sha256']
materials=[]
for row in idx['actualWholeMaterialBindings']:
 rp=Path(row['foreignReleasedInput']['path']);released=json.loads(rp.read_text());assert bind(rp)['sha256']==row['foreignReleasedInput']['sha256'];g=next(x for x in released if x['id']==row['goalId']);assert goals[g['id']]==g
 old=bg[g['id']];assert {k:v for k,v in old.items() if k!='examData'}=={k:v for k,v in g.items() if k!='examData'}
 fields=[k for k in set(old['examData'])|set(g['examData']) if old['examData'].get(k)!=g['examData'].get(k)];assert set(fields)<= {'reviewStatus','reviewNote'};assert 'reviewStatus' in fields;assert old['examData']['reviewStatus']=='draft' and g['examData']['reviewStatus']=='released'
 materials.append({'goalId':g['id'],'exactWholeForeignReleasedFile':bind(rp),'actualMetadataFieldsChanged':fields,'allRemainingTaskSolutionRubricFactRequiresAndOuterFieldsExact':True})
assert len(materials)==7
ids={r['goalId'] for r in materials};assert all(g==bg[i] for i,g in goals.items() if i not in ids)
account=json.loads(Path(h['existingAccountForeignGKTagExact']['path']).read_text());assert goals[account['id']]==account
sp=Path(h['semanticKinds493CurrentClosedV2']['path']);sem=json.loads(sp.read_text());oldsp=Path(idx['currentQualifiedSEM485']['path']);oldsem=json.loads(oldsp.read_text());oldrows={d['goalId']:d for d in oldsem['decisions']};rows={d['goalId']:d for d in sem['decisions']};assert len(oldrows)==485 and len(rows)==493;assert set(rows)==set(goals)
basisp=Path(h['actual43InheritedInvalidBasisEnumsAndOneHeaderMethodConstantCorrected']['path']);basis=json.loads(basisp.read_text());changes=basis['whole43OriginalReasonsAndCurrentDelta'];assert len(changes)==43;bid={r['goalId'] for r in changes};assert len(bid)==43
for r in changes:
 gid=r['goalId'];pointer=r['originalMemberPointer'];ix=int(pointer.split('/')[-1]);original=oldsem['decisions'][ix];assert original==r['beforeWholeQualifiedKindRowExact']==oldrows[gid];assert memberDigest(original)==r['originalMemberDigest'];assert rows[gid]==r['afterWholeKindRow'];assert {k:v for k,v in original.items() if k!='decisionBasis'}=={k:v for k,v in rows[gid].items() if k!='decisionBasis'};assert r['historicalForeignRationaleExact']==original['decisionBasis']
fpids={'96183c48-b499-54d7-8530-578f6ff40207','6a5efa74-66c8-5682-8371-b0a93d17f986'};actualfp=set();actualbasis=set();exact=[]
for gid,old in oldrows.items():
 now=rows[gid];fields={k for k in set(old)|set(now) if old.get(k)!=now.get(k)}
 assert fields<={'decisionBasis','sourceFingerprint'}
 if 'decisionBasis' in fields:actualbasis.add(gid)
 if 'sourceFingerprint' in fields:actualfp.add(gid)
 if not fields:exact.append(gid)
assert actualbasis==bid and actualfp==fpids and len(exact)==440
newids=set(rows)-set(oldrows);assert len(newids)==8 and newids==ids|{'86b0ed9d-3809-5402-92ad-89c2f9cbbe76'}
foreignkindids=set()
for k,b in h['wholeNewForeignKind8'].items():
 o=json.loads(Path(b['path']).read_text())
 if k=='pureNavigation':foreignkindids.add(o['wholeReviewedNavigation']['id']);assert o['nativeSemanticKind']=='practiceAssessment'
 else:
  for r in o.get('rows',o.get('decisions',[])):
   foreignkindids.add(r['goalId']);assert r.get('semanticKind',r.get('qualifiedSemanticKind'))=='practiceAssessment'
assert foreignkindids==newids
assert all(rows[i]['semanticKind']=='practiceAssessment' and rows[i]['decisionStatus']=='authoritative' for i in newids)
headerfields={k for k in set(oldsem)|set(sem) if k!='decisions' and oldsem.get(k)!=sem.get(k)};assert headerfields=={'ledgerId','counts','reviewMethod'};assert sem['reviewMethod']=='one-time-reviewed-pilot-migration-v1';assert sem['counts']['curricularAtomic']==336 and sem['counts']['practiceAssessment']==112 and sem['counts']['total']==493
sourcep=Path(h['source125CurrentV13SingleMemberAndThreeDecisionReferenceOnlyHandoff']['path']);src=json.loads(sourcep.read_text());ma=json.loads(Path(src['before']['path']).read_text());mb=json.loads(Path(src['after']['path']).read_text());assert len(ma['decisions'])==len(mb['decisions'])==125
mappingchanges=[]
for i,(a,b) in enumerate(zip(ma['decisions'],mb['decisions'])):
 if a==b:continue
 assert {k:v for k,v in a.items() if k!='currentPerformanceUnionBinding'}=={k:v for k,v in b.items() if k!='currentPerformanceUnionBinding'}
 assert {k:v for k,v in a['currentPerformanceUnionBinding'].items() if k!='path'}=={k:v for k,v in b['currentPerformanceUnionBinding'].items() if k!='path'}
 assert b['currentPerformanceUnionBinding']['path']==src['actualCurrentUnion']['path'];mappingchanges.append({'decisionIndex':i,'sourceGoalId':b['sourceGoalId'],'oldWholeDecision':a,'currentWholeDecision':b})
assert len(mappingchanges)==3
assert mb['onlyThreeActualAffectedDecisionCurrentUnionReferencesRefreshed'] is True
assert 'onlyThreeActualAffectedDecisionCurrentUnionReferencesRefreshed' not in ma
assert {k:v for k,v in ma.items() if k!='decisions'}=={k:v for k,v in mb.items() if k not in {'decisions','onlyThreeActualAffectedDecisionCurrentUnionReferencesRefreshed'}}
result={'scope':'Independent technical current493 assembly and native existing vocabulary/source-pointer adapter proof. Seven whole material judgments and eight native kinds are exact qualified foreign inputs; no new substantive science or human approval.','authorHandoff':bind(hp),'canonical493':bind(cp),'semantic493':bind(sp),'actualSevenWholeForeignMaterialBindings':materials,'other486WholeFrozenAuthorGoalObjectsExact':True,'foreignExistingAccountWholeObjectExact':True,'oldSEM485':bind(oldsp),'actual43BasisOriginMemberDigestAndLiteralOriginalLabelsChecked':changes,'actualTwoCurrentSourceFPGoalIds':sorted(actualfp),'actual440OtherOldWholeSEMRowsExactIds':exact,'actual8NewForeignKindIDs':sorted(newids),'actualHeaderMetadataFieldsChanged':sorted(headerfields),'sourceMappingBefore':src['before'],'sourceMappingAfter':src['after'],'actualThreeWholeSourceMappingPointerDeltas':mappingchanges,'other122WholeSourceDecisionsAndAll208MappingEdgesExact':True,'oneAddedTrueSourceMetadataField':'onlyThreeActualAffectedDecisionCurrentUnionReferencesRefreshed','humanApprovalCreated':False,'newScientificOrStrictClosures':0,'strictNetGain':0}
output=base/'wirtschaft-final493-and-native43basis-source3-adapter-independent-root-v1/actual-independent-493-seven-whole-foreign-materials-43-enums-two-FP-eight-kinds-three-source-pointers.result.json';assert not output.exists();output.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n');json.loads(output.read_text())
spec=importlib.util.spec_from_file_location('schema_checks',root/'scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod);assert not mod.curriculum_symlink_errors(root)
print(json.dumps({'actual493ForeignAssembly':7,'newForeignKinds':8,'oldSEMEnumFields':43,'oldSEMFPFields':2,'oldSEMWideExactRows':440,'sourceMapPointers':3,'otherSourceDecisionsExact':122,'schemaAndNativeFPProofSeparate':True,'result':bind(output),'strictNetGain':0}))
