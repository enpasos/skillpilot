from pathlib import Path
import os,json,hashlib
ROOT=Path('/home/enpasos/projects/skillpilot')
S=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-reviewed-inactive-j-private-completion-technical-successor-20261010-v2')
J=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-source7-normal37-D27-P2-reviewed-inactive-integration-j-technical-20261010-v1')
I=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-dual38-P38-reviewed-inactive-integration-technical-20261010-v1')
A=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-current517-normal32-annotation-materialized-native-context-author-20261010-v1')
def sha(p):return 'sha256:'+hashlib.sha256(p.read_bytes()).hexdigest()
def bind(rel):
 p=ROOT/rel
 return {'path':str(rel),'exists':p.is_file(),'sha256':sha(p) if p.is_file() else None,'bytes':p.stat().st_size if p.is_file() else None}
def w(rel,q):
 p=ROOT/rel;p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(q,indent=2)+'\n');return bind(rel)
old=json.loads((ROOT/J/'ROOT-ONLY.operation-plan.current398.reviewed-inactive.json').read_text());oldi=json.loads((ROOT/I/'BLOCKED.operation-plan.current398.inactive.json').read_text());activeRegistry='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json';active=json.loads((ROOT/activeRegistry).read_text());futureSubject=json.loads((ROOT/J/'registry/chemie-reviewed-current398.future-active.subject.json').read_text());future=json.loads((ROOT/activeRegistry).read_text());future['subjects']=[futureSubject if x['subject']=='chemie' else x for x in future['subjects']];assert all(x==y for x,y in zip(active['subjects'],future['subjects']) if x['subject']!='chemie');registry=w(S/'future-active/registry-chem-only-exact-current-other4.subjects.json',future)
operations=[]
def op(source,target,kind,**extra):
 sb=bind(source);assert sb['exists'];operations.append({'operation':kind,'source':sb,'target':target,'before':bind(target),'verifiedAfterSha256':sb['sha256'],'verifiedAfterBytes':sb['bytes'],'executableBySubagent':False,**extra})
for item in old['inheritedSourceViewAndOtherOperations']:op(item['source']['path'],item['target'],'copy_exact_current_reviewed_candidate_after_root_gates',scientificMeaning=item['operation'])
st='curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/chemie-b008-source24-dual-bounded-scope-technical-20261010-v1/candidate/ST-whole-retained-with-current-paired-partial-source-review.inactive.review.json'
op(st,'curricula/DE/Gymnasium/mapping/DE-ST/lower-secondary/st_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json','copy_exact_separately_paired_bounded_source24_decisions',wholeOriginalPartnersRetained=True)
op(registry['path'],activeRegistry,'merge_chem_only_into_then_current_registry',allOtherFourSubjectsExact=True,rereadTargetBeforeExecution=True)
op(str(S/'future-active/chemistry-national-atlas.inputs.json'),'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json','copy_actual_future_active_source_atlas_config',sourceHolds20Retained=True)
gen=json.loads((ROOT/S/'checks/future-active-source-atlas-normal-generated-outputs-and-scope-equivalence.actual.json').read_text())
for item in gen['generatedOutputOperations']:op(item['source']['path'],item['target'],'copy_exact_unchanged_normal_source_atlas_generator_output',all48ScopedGoalIdsEqualSealedAuthor=True)
assetById={x['goalId']:x for x in json.loads((ROOT/J/'checks/V38-own-portable-exact-aliases.actual.json').read_text())['resourceAliases']}
for item in oldi['assetOperationsAfterFutureGatesOnly']:
 alias=assetById[item['goalId']];assert alias['ownPortableExactResource']['sha256']==item['source']['sha256']
 for target in item['targets']:op(alias['ownPortableExactResource']['path'],target,'copy_existing_separately_reviewed_exact_image_alias',goalId=item['goalId'],newScientificImageReviews=0)
 op(item['promptSource']['path'],item['promptTarget'],'copy_exact_bound_provider_prompt_or_honest_unknown_prompt_keep_addendum',goalId=item['goalId'],originalPromptUnknown=item.get('originalPromptUnknown',False))
historical='scripts/config/historical-goal-visualization-assets.json';base=json.loads((ROOT/historical).read_text());oldHist=json.loads((ROOT/I/'candidate/historical-goal-visualization-assets.plus-retained-1f-original.future-active.json').read_text());add=[x for x in oldHist['assets'] if x not in base['assets']];assert len(add)==1 and '1f354a60' in json.dumps(add[0]);futureHist=json.loads((ROOT/historical).read_text());futureHist['assets']+=add;hist=w(S/'future-active/historical-assets-preserve-current-plus-one-reviewed-1f-original.json',futureHist);op(hist['path'],historical,'append_one_byte_exact_retained_original_image_history_record',all25CurrentHistoryRowsUnchanged=True,noQualityExceptionAddedForActiveImage=True)
refs={}
for key in ['semanticAtomicityConfigPaths','positiveEvidenceConfigPaths','resolutionIndexPaths']:
 refs[key]=[bind(p) for p in futureSubject.get(key,[])];assert all(r['exists'] for r in refs[key])
refs['memoryReviewConfigPath']=bind(futureSubject['memoryReviewConfigPath']);assert refs['memoryReviewConfigPath']['exists']
for cfgRef in [*refs['semanticAtomicityConfigPaths'],*refs['positiveEvidenceConfigPaths'],refs['memoryReviewConfigPath']]:
 q=json.loads((ROOT/cfgRef['path']).read_text());assert q['landscapePath']==futureSubject['landscapePath']
 if 'semanticKindLedgerPath' in q:assert q['semanticKindLedgerPath']==futureSubject['semanticKindLedgerPath']
metadataRefresh=[{'target':'docs/legal/ai-transparency-inventory.json','before':bind('docs/legal/ai-transparency-inventory.json'),'operation':'remeasure_then_current_all_subject_inventory_with_normal_generator_after_root_adoption','doNotOverwriteWithOldIInventory':True,'preserveTwoHonestUnknownOriginalPromptKeepAddenda':True},{'target':'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json','before':bind('curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'),'operation':'root_updates_existing_Chem_packages_from_actual_new_strict_IDs_without_claiming_open_deferrals_complete'},{'target':'docs/qa-ci/status/curriculum-quality-status.json','before':bind('docs/qa-ci/status/curriculum-quality-status.json'),'operation':'normal_generator_after_root_active_adoption_and_all9_floor_check','notHandEdited':True}]
plan={'schemaVersion':1,'status':'REVIEWED_INACTIVE__NORMAL_CENTRAL_ATTEMPT4_RUNNING__ROOT_ONLY_ADOPTION_AFTER_ALL_GATES','activeAdoptionAuthorizedByThisFile':False,'subagentActiveWrites':[],'gitOrGithubWrites':[],'rootBeforeRegistry':bind(activeRegistry),'futureActiveRegistry':registry,'copyOperations':operations,'referencedReviewedD_A_M_PConfigsAndIndexes':refs,'requiredNormalMetadataRefreshes':metadataRefresh,'sourceAtlasExactNormalScopeProof':bind(S/'checks/source-atlas-actual-current-scope-ID-witness-deltas.json'),'sourceAtlasFutureActiveExactGeneratorProof':bind(S/'checks/future-active-source-atlas-normal-generated-outputs-and-scope-equivalence.actual.json'),'expectedCurrent398Denominator':398,'expectedStrictCompleteNotYetCounted':206,'mustRetainAll180CurrentChemStrictIDs':True,'mustRetainBio353Math807Phys478AndAll9Floors':True,'C11SourceCourseHoldReleased':False,'sourceHolds20Remain':True,'unresolved496Remain':True,'protectedAllHistoricalArtefactsRemainUnmodified':True,'newScientificReviews':0,'humanApproval':False,'releaseHumanTrialCompleted':False,'runtimeSecurityPluginPublicationChanges':[]}
w(S/'ROOT-ONLY.complete-adoption-copy-list-and-before-after-bindings.inactive.json',plan)
print(json.dumps({'copyOperations':len(operations),'referencedAConfigs':len(refs['semanticAtomicityConfigPaths']),'referencedPConfigs':len(refs['positiveEvidenceConfigPaths']),'DIndexes':len(refs['resolutionIndexPaths']),'futureRegistrySha256':registry['sha256'],'activeWrites':[]}))
