import hashlib,json,re
from pathlib import Path
from datetime import datetime, timezone
OWN=Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b014-arrhenius-memory-remediation-independent-a-v1');AUTHOR=OWN.parent/'chemie-b014-arrhenius-memory-remediation-candidate-v1'
ORIGIN='28bb9d15-f865-5843-a035-6066580fea64';MEMORY='417e65ec-68be-5f2e-9452-c3ba9b1d362f';DECK='de_gymnasium_chemistry_arrhenius_names_formulas'
def read(p):return json.loads(Path(p).read_text())
def sha(p):return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def write(name,value):(OWN/name).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
manifest=read(AUTHOR/'author-checkpoint.freeze.manifest.json')
print('manifest keys:',list(manifest))
checks=[]
for row in manifest['ownFiles']:
 p=Path(row['path']); assert sha(p)==row['sha256'],str(p)
 checks.append({'path':str(p),'sha256':row['sha256'],'unchanged':True})
frozen_receipt=read(OWN/'actual-frozen-inputs.receipt.json')
external=[]
for row in frozen_receipt['externalInputs']:
 p=Path(row['path']);actual=sha(p);external.append({'path':str(p),'expectedSHA256':row['sha256'],'actualSHA256':actual,'unchanged':actual==row['sha256']})
assert all(row['unchanged'] for row in external),external
native=[]
for label,config,report in [('full','memory-reviewed.config.json','native-m-full-reviewed-report.md'),('affected','memory-one-goal-reviewed.config.json','native-m-one-goal-reviewed-report.md')]:
 text=(OWN/report).read_text();tool_result=next(r for r in read(OWN/'native-terminal.tool-results.json') if r['label']==label);assert tool_result['actualExitCode']==0;numbers=tool_result['metrics']
 for key in ['Missing review records','Stale review records','Obsolete review records','Missing card review records','Stale card review records','Obsolete card review records','Cards needing developer review','Memory-required goals without visible memory node']:
  assert numbers[key]==0,(label,key,numbers[key])
 native.append({'label':label,'command':f'./app/node_modules/.bin/tsx app/scripts/memoryCardReview.ts --config={OWN/config} --mode=check --write-report','actualExitCode':0,'reportPath':str(OWN/report),'reportSHA256':sha(OWN/report),'metrics':numbers,'writeFingerprintsUsed':False,'limits':'Unchanged native technical M binding gate; substantive independent findings and actual jurisdiction filtering are separate.'})
visibility=read(OWN/'actual-composition-filtered-visibility-and-prerequisites.receipt.json');assert visibility['status']=='PASS_independent_corrected_candidate'
# Audit the actual corrected contents after generation, including bilingual differences.
de=read(OWN/f'{DECK}.de.reviewed.inactive.candidate.json');en=read(OWN/f'{DECK}.en.reviewed.inactive.candidate.json'); cards=[]
for a,b in zip(de['cards'],en['cards']):
 assert a['id']==b['id'] and a['tags']==b['tags']
 assert f'goal:{ORIGIN}' in a['tags']
 if a['id'].endswith('_name_to_formula'):
  assert 'ungelösten' not in a['back'] and 'sämtliche Teilchen' in a['back']
  assert 'not every particle' in b['back']
  assert '$' not in a['front'] and '$' not in b['front']
 cards.append({'cardId':a['id'],'DEActualFront':a['front'],'DEActualBack':a['back'],'ENActualFront':b['front'],'ENActualBack':b['back'],'DECurrentScientificContent':'PASS_reviewer_corrected_candidate','ENCurrentScientificContent':'PASS_reviewer_corrected_candidate','sourceRequirement':'PASS_HE_printed35_named_acid_or_hydroxide_association','reverseOrForwardCoverage':'PASS_one_of_two_compact_directions','atomicRecall':'PASS_association_not_understanding_competence','substanceAndMixtureDistinction':'PASS_no_whole_solution_formula_or_universal_complete_dissociation_claim','answerLeak':'PASS_requested_name_or_formula_not_in_front; English solution name is input and only formula is requested','necessary':'PASS_support_for_origin28_names_formulas_fluency','originGoalId':ORIGIN,'operative':'HOLD_not_yet_integrated'})
assert len(cards)==18
write('corrected-independent-per-card-and-goal.judgments.json',{'authority':'ai_candidate_independent_S_A_M_review','informedNotBlind':True,'independence':'Independent reader did not author frozen root input; initially judged actual cards/page/context, then proposed and checked specific corrections within this directory. The correction pass is the same reviewer resolving its findings, not a second independent D reviewer. No other reviewers substantive outputs read.','all18DEAnd18ENActualCardsRead':True,'cards':cards,'ordinaryGoal':{'goalId':ORIGIN,'currentActiveDescription':'Recall-heavy wording alone does not explicitly require an explanation; this review endorses only the changed inactive candidate, not a new current active D/P approval.','reviewedCandidateSemanticAtomicity':'PASS: one Arrhenius aqueous-behaviour competence with bounded named/formula examples as necessary tools','assessmentBoundary':'Require learner to explain acid-associated increase of hydrogen ions or hydroxide availability in water and distinguish formula composition from dissolved species; memorized associations cannot pass ordinary understanding. No fresh introduction or spoon-fed answer is needed to assess.','sourceHE35NamesFormulas':'PASS_nine_named_associations','sourceFullBreadth':'HOLD_salts_and_actual_all_region_source_bindings_not_closed','memoryDecision':'PASS_memory_required_candidate','placement':'PASS_corrected_origin_and_memory_same_f97b_Protolysereaktionen_single_path_GK_LK_no_SekI','currentStrictClosure':'HOLD_D2_P_V_and_source_integrations_pending'},'memoryNode':{'goalId':MEMORY,'semanticKind':'memory_support_not_curricularAtomic','originTrace':'PASS_current_origin28_all18_primary_tags_and_current_M_memoryGoalIds','compactNecessity':'PASS_nine_associations_two_directions_not_a_substitute_for_explanation','prerequisite':'PASS_actual_d2_indicator_foundation_and_its_effective_prerequisite_route_in_all32_filtered_scopes','jurisdictionScope':'PASS_corrected_16_jurisdictions_of_current_origin; does_not_certify_all16_normative_sources_list_the_HE_examples','actualVisibility':'PASS_32_of32_pairs_after_real_compiler_and_real_filters; original_HOLD30','nativeCurrentBinding':'PASS_full_and_affected_inactive_candidate_actual_exit0','operative':'HOLD_final_deployment_paths_new_current_A_M_bindings_and_ordinary_D_P_V_source_resolutions_pending'},'strictNetDelta':0,'newScientificClosures':0,'restoredActiveBindings':0,'humanApproval':False,'D2':False,'P':False,'V':False,'saltBreadth':'HOLD','mathPhysicsReReviews':0,'activeWrites':0})
write('native-terminal-and-input-integrity.receipt.json',{'createdAtUTC':datetime.now(timezone.utc).isoformat(),'actualNativeExecutions':native,'actualCompositionExecution':{'command':f'./app/node_modules/.bin/tsx {OWN}/check-independent-composition-visibility.ts','actualExitCode':0,'receiptSHA256':sha(OWN/'actual-composition-filtered-visibility-and-prerequisites.receipt.json'),'originalNegativeWitnessMissingPairs':30,'correctedPositivePairs':32,'correctedPrerequisitePairs':32,'DAGMissingEdges':0,'DAGCycles':0,'compilerErrors':0},'authorManifestSHA256':sha(AUTHOR/'author-checkpoint.freeze.manifest.json'),'authorOwn20FilesUnchanged':checks,'externalInputs10Unchanged':external,'originalIndependentJudgmentsFrozenSHA256':sha(OWN/'original-independent-per-card-and-goal.judgments.json'),'originalIndependentJudgmentsSHA256File':(OWN/'original-independent-per-card-and-goal.judgments.sha256').read_text().strip(),'formerAuthorConfigurationFAIL':'Retained unchanged, only informational; not treated as independent acceptance. Own current native runs use unchanged rule/reviewId and no checker exception.','strictNetDelta':0,'newScientificClosures':0,'restoredActiveBindings':0,'activeWrites':0,'humanApproval':False})
assert sha(OWN/'original-independent-per-card-and-goal.judgments.json')==(OWN/'original-independent-per-card-and-goal.judgments.sha256').read_text().strip()
print(json.dumps({'status':'PASS_reviewer_corrected_inactive_candidate','authorArtifactsUnchanged':len(checks),'externalInputsUnchanged':len(external),'correctedActualDECards':18,'correctedActualENCards':18,'nativeExitCodes':[r['actualExitCode'] for r in native],'strictNetDelta':0}))
