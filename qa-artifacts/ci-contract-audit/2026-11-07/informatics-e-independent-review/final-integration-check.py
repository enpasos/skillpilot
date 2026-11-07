import copy, gzip, hashlib, json, pathlib, tarfile
R=pathlib.Path('/home/enpasos/projects/skillpilot')
P=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-current-e-authoring-candidate'
O=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-independent-review'
B=pathlib.Path('/dev/shm/informatics-current-cleanup-20261107/candidate')
D=R/'qa-artifacts/ci-contract-audit/2026-11-07/informatics-e-minimal-material-design'
sha=lambda b:hashlib.sha256(b).hexdigest()
load=lambda n:json.loads(gzip.decompress((P/n).read_bytes()))
assert sha((P/'inventory.json').read_bytes())=='33cab19b56781cd9372d90ca709425a621a4e6c979896bc8b9b57e028c7a921f'
assert sha((P/'seal.json').read_bytes())=='5919a0b092e120d111594fabbb989e28dcb16cf4a08c9a38ee4c63536c59cad9'
inv=json.loads((P/'inventory.json').read_text())
for r in inv['payloads']:
 b=(P/r['path']).read_bytes();assert sha(b)==r['sha256'];assert len(b)==r['bytes']
with tarfile.open(P/'candidate-overlay.tar.gz') as t:
 assert all(m.isfile() and not m.name.startswith('/') and '..' not in pathlib.PurePosixPath(m.name).parts for m in t.getmembers())
 overlay={m.name:t.extractfile(m).read() for m in t.getmembers()}
pins=load('before-after-source-and-reference-pins.json.gz')
assert set(overlay)=={r['path'] for r in pins['changedFiles']}
for r in pins['changedFiles']:
 assert sha(overlay[r['path']])==r['afterSha256']
 before=(B/r['path']).read_bytes();assert sha(before)==r['source37BeforeSha256'];assert (before!=overlay[r['path']])==r['changedFromSource37']
sourcePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_INFORMATIK.de.json'
assert sha(overlay[sourcePath])=='85ed339482b57f9ea19661df76acce4403ca5b7b9b9727261c1fffb1796dd48b'
src=json.loads(overlay[sourcePath]);before=json.loads((B/sourcePath).read_text());goals={g['id']:g for g in src['goals']};old={g['id']:g for g in before['goals']}
new=['ea2ce31f-a0c7-5102-9213-ee1db5b2d475','c24236b2-d783-53be-84d5-96b4f4ef8159','6aa77baf-a199-5c66-b07c-8dc23439acca'];retired=['bb651ed7-2674-580c-8916-ac5aa88d93f8','fa47a714-07c3-589b-a4e2-385a33e84c79'];parent='91c5be09-cc6b-5f57-bfe1-9f0038faf26a'
assert set(goals)-set(old)==set(new);assert set(old)-set(goals)==set(retired)
assert len(goals)==284;assert len([g for g in goals.values() if g.get('examData')])==23
covered=json.loads((D/'coverage-matrix.json').read_text());residual=json.loads((D/'residual-ten.json').read_text())
for r in covered+residual:
 g=r['fullCurrentGoal'];assert goals[g['id']]==g==old[g['id']]
placeholders=['309d4587-8080-5dd4-b329-785d9996a195','7aec2086-2cfa-50d3-8503-b40e96ca3430','3277867f-ede2-5dc4-bd76-1b03d992e9d5','357fde7c-d334-50aa-be11-068ae8d832b3']
changedExisting=[i for i in set(old)&set(goals) if old[i]!=goals[i]]
assert set(changedExisting)==set(placeholders+[parent])
for i in placeholders:
 expected=copy.deepcopy(old[i]);expected['examData']['reviewStatus']='draft';assert goals[i]==expected
assert goals['6ebc2a67-ea20-5c4e-8a63-635f40438d6a']==old['6ebc2a67-ea20-5c4e-8a63-635f40438d6a']
p=goals[parent];assert p['contains']==new and p['requires']==[] and p['weight']==3;assert p['extendedData']['applicabilityMappingInheritance']=='boundary';assert p['applicability']=={'jurisdiction':['DE-HE']}
delta=load('material-wording-delta.json.gz');assert sha(gzip.decompress((P/'material-wording-delta.json.gz').read_bytes()))=='b98d056effadbe78cc6737d1b867b10b18532779fdbd17488343e4a7710e0583'
for r in delta['changedGoalObjects']:assert goals[r['goalId']]==r['after']
native=load('native-final.json.gz');ready=load('native-final-material-readiness.json.gz')
assert ready['sourceSha256']==sha(overlay[sourcePath]);assert native['sourceSha256']==ready['nativeGraphAndScopeReuse']['actualPriorSourceSha256'];assert ready['nativeGraphAndScopeReuse']['goalRequiresContainsCoverageApplicabilityAndOtherFieldsExactlyEqual']
assert native['examCounts']=={'current':23,'declared':13,'unknown':10}
positive={'de-he-gym-informatics-crossstage','de-de-gym-informatics-gk','de-de-gym-informatics-lk'}
withdrawals=[]
def strip(v):
 if isinstance(v,list):return [strip(z) for z in v if not(isinstance(z,dict) and z.get('kind')=='canonicalSubtree' and z.get('goalId')==parent)]
 if isinstance(v,dict):return {k:strip(z) for k,z in v.items()}
 return v
for v in native['views']:
 path=v['path'];after=overlay.get(path,(R/path).read_bytes());assert sha(after)==v['sha256'];vbefore=json.loads((B/path if (B/path).exists() else R/path).read_bytes());vafter=json.loads(after)
 assert not v['compileFindings'] and v['ordinaryTargetsExactlyPreserved'] and v['otherAssessmentTargetsExactlyPreserved']
 target=set(v['targetGoalIds']);assert set(new)&target==(set(new) if v['viewId'] in positive else set())
 if vbefore!=vafter:assert strip(vbefore)==vafter;withdrawals.append(v['viewId'])
assert len(native['views'])==19 and len(withdrawals)==15
for i,n in zip(new,[4,4,7]):
 g=goals[i];assert len(g['examData']['coveredGoalIds'])==n and g['examData']['reviewStatus']=='draft';a=next(a for a in native['assessments'] if a['id']==i);assert len(a['coverage']['definitions'])==n and len(a['wholeMaterialPreparation']['atomicGoalIds'])==n+1 and not a['wholeMaterialPreparation']['unresolvedReferences']
for a in native['compiledE']:assert a['compiledApplicability']=={'jurisdiction':['DE-HE']}
assert set(native['boundaryProof']['changedCompiledGoalIds'])==set(new+[parent]);assert native['boundaryProof']['allOtherInfoCompiledApplicabilityUnchanged'] and native['boundaryProof']['noFromRequiresAdded']
for a in ready['readiness']:
 assert all(a['metrics'][k]==23 for k in ['examDefinitions','requiredExams','checkedExams']) and a['status']=='fail'
 assert a['metrics']['weakExamData']==(8 if a['id']=='CQR-202' else 17)
assert not pins['referenceClosure']['activeOldIdentityReferences'] and len(pins['referenceClosure']['historicalAuditReferences'])==6
mappath='curricula/DE/Gymnasium/mapping/DE-HE/upper-secondary/hessen_informatics_upper_secondary_to_canonical_informatics.json';mb=json.loads((B/mappath).read_text());ma=json.loads(overlay[mappath]);expected=copy.deepcopy(mb);row=next(r for r in expected['mappings'] if r['canonicalGoalId']==retired[0]);expected['mappings'].remove(row);expected['historicalWithdrawnMappings'].append(row);assert expected==ma
meta=json.loads((P/'metadata-intermediate.json').read_text());assert len(meta['sourceDocumentCorrections'])==2
for r in meta['sourceDocumentCorrections']:assert r['after']['key']=='SL-INF-GYM9-10-2026' and r['after']['path'].endswith('.web-extract.md') and 'sl-inf-seki-10-llm' in r['sourceGoalId']
slpath=R/'curricula/DE/Gymnasium/input/SL/lower-secondary/source-extraction/DE_SL_INFORMATIK_SEKI_GYM9_2023_2026.source-extraction.json'
sl=json.loads(slpath.read_text());docs={d['key']:d for d in sl['sourceDocuments']};slgoals={g['id']:g for g in sl['sourceGoals']}
for r in meta['sourceDocumentCorrections']:
 assert r['after']==docs['SL-INF-GYM9-10-2026'];assert r['goalId'] in slgoals[r['sourceGoalId']]['canonicalTargetIds'];assert slgoals[r['sourceGoalId']]['sourceSpan']=='SL-INF-SEKI-10-LLM.1'
profile=native['profile'];assert profile['own20Selected'] and not profile['officialStateDuty'] and '66630624-08b1-5d02-8544-877d0ffb12c9' in profile['terminalAutonomyClusterIds']
post=load('execution-inputs-and-postguards.json.gz');assert not post['finalCodePostguardDrift'] and not post['activeCurriculumPostguardDrift'] and not post['oldPackagePostguardDrift']
result={'status':'PASS_NARROW_ARTIFACT_BINDING_AND_SCOPED_AUTHORING_REVIEW_NOT_CURRENT_QUALITY_OR_INTEGRATION_APPROVAL','inventorySha256':sha((P/'inventory.json').read_bytes()),'sealSha256':sha((P/'seal.json').read_bytes()),'sourceSha256':sha(overlay[sourcePath]),'freshIndependentChecks':{'payloadsRehashed':len(inv['payloads']),'overlayPathsRehashed':len(overlay),'source37ChangedPaths':sum(r['changedFromSource37'] for r in pins['changedFiles']),'ordinaryEFullObjectsPreserved':25,'allExistingChangedGoalsExactlyParentAndFourDraftStatuses':True,'otherExistingGoalObjectsPreserved':len(set(old)&set(goals))-len(changedExisting),'retiredDefinitions':retired,'newExactMaterialGoalObjects':new,'foreignViewOnlyParentRefWithdrawals':withdrawals,'heMappingOnlyCurrentRowMovedToHistorical':True,'own20EntireGoalUnchanged':True,'metadataAssociationsCorrectlyBound':2},'reusedNativeEvidence':{'graphScopeSourceSha256':native['sourceSha256'],'currentReadinessSourceSha256':ready['sourceSha256'],'textOnlyReuseVerified':True,'viewCount':19,'compileFindings':0,'allOther280ApplicabilitySetsUnchanged':True,'wholePreparationCounts':[5,5,8],'examCounts':native['examCounts'],'cqr202':8,'cqr204':17,'all23RequiredAndChecked':True,'activeReferenceClosureFiles':1206,'activeOldRefs':0,'historicalRefs':6,'fullCqrOr51ScopesRerun':False},'limits':['Material and bounded HE/Own scope admissible; no overall current-source integration approval.','Four placeholders, ten residual E routes, Own20 compiled applicability and first binding, old identity-authority reconciliation and existing source/cohort holds remain open.','No M6/M7, human approval, host/learner acceptance, deployment, publication, alias or results migration.']}
(O/'final-integration-check-results.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'status':result['status'],'payloads':22,'overlayFiles':37,'viewWithdrawals':15,'source':result['sourceSha256']},ensure_ascii=False))
