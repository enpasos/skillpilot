from pathlib import Path
import json,copy,hashlib,datetime
ROOT=Path(__file__).resolve().parents[7];O=Path(__file__).resolve().parent
D=O.parent/'wirtschaft-dd38-543b-source-course-f08-036ea-followers-AUTHOR-INERT-round-b-v1'
DD='dd38e0c5-d77b-5893-815c-548ea2a84429'; V='776457c2-8bb3-53b9-838b-a028319175fb'; PAY='a5009946-62bb-5e6a-8c92-732d02e8fd70'; PO='543bf91f-f6c6-5b1b-ba9e-43de321d8c7f'; POL='da73483a-2c18-5d42-b4f3-6ac6bcd6b5b0'; S='f1f73ebe-286a-52e8-a2e1-4383ece6e9ec'; F='f08e0a97-bcdd-504d-a9d9-7b1d8e6d4f96'; Q='036ea7f9-2a33-502f-8729-983fa8054694'
for name in ['history','candidates','source-notes','checks']:(O/name).mkdir(exist_ok=True)
def read(p):return json.loads(p.read_text())
def h(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def save(n,d):(O/n).write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
copies={'history/original-canonical.exact.json':'history/canonical.actual-base.exact.json','history/sealed-predecessor-landscape.exact.json':'candidates/landscape.author-only.INERT.json','history/sealed-six-content-goals.exact.json':'candidates/six-whole-content-successor-goals.INERT.json','history/sealed-two-practices.exact.json':'candidates/two-whole-practices.INERT.json','history/sealed-three-own-native-profiles.exact.json':'candidates/positive-profiles.native-bound.INERT.json','history/sealed-original-role-proposals.exact.json':'source-notes/whole-country-and-course-role-proposals.INERT.json','history/sealed-bounded-primary-components.exact.json':'source-notes/bounded-actual-primary-components.INERT.json','history/sealed-actual-primary-reading-and-course-rules.exact.json':'source-notes/actual-primary-reading-and-course-rules.json','history/sealed-six-original-image-inspections.exact.json':'source-notes/six-bound-original-images.actual-inspection.json','history/predecessor-seal.exact.json':'SEALED-unreviewed-INERT-handoff.json','history/selected-current-semantic-inputs.actual.json':'history/selected-current-semantic-inputs.actual.json'}
for gid in [V,PAY,S]:copies[f'history/{gid}.whole-current-positive.exact.jsonl']=f'history/{gid}.whole-current-positive.exact.jsonl'
for dst,src in copies.items():(O/dst).write_bytes((D/src).read_bytes())
save('generation-metadata.actual.json',{'provider':'OpenAI','model':'GPT-6','runtime':'Codex','exactModelRevision':'not_exposed','samplingParameters':'not_exposed','task':'Own additive INERT scope-role retention following immutable whole material handoff; no independent review or new content performance'})
(O/'author-criteria.txt').write_text('Own bounded additive role-retention author criteria: preserve each original whole Practice target country and technical course-profile set; retain every substantive bilingual goal, Practice, task, material, solution, scoring and P-profile payload exactly. Author explicit existing didactic-extension target entries for actually assessed content and prerequisiteOnly entries only for remaining actual prerequisite closure. Separate genuine primary compulsory/choice/course bounds from authored extensions and unqualified whole source coverage. Native profile rebinding is technical author carry, not a new independent content review. E1/G1 ai_candidate needs_human_review; no task/case quota, image generation, active mutation, source release or M6 claim.\n')
original=read(O/'history/original-canonical.exact.json');old={g['id']:g for g in original['goals']}
landscape=read(O/'history/sealed-predecessor-landscape.exact.json');goals={g['id']:g for g in landscape['goals']}
for gid in [F,Q]:goals[gid]['applicability']=copy.deepcopy(old[gid]['applicability'])
compat=[]
for gid,required in [(V,old[F]['applicability']['jurisdiction']),(PAY,old[F]['applicability']['jurisdiction']),(POL,old[Q]['applicability']['jurisdiction'])]:
 before=copy.deepcopy(goals[gid]['applicability']['jurisdiction']);added=[x for x in required if x not in before]
 goals[gid]['applicability']['jurisdiction']=before+added
 compat.append({'goalId':gid,'wholeOriginalCountryUnion':before,'addedJurisdictions':added,'proposedCountryUnion':before+added,'reason':'Explicit authored whole existing Practice extension; native compatibility addition only, not newly qualified compulsory primarysource scope. Substantive goal/taxonomy/requires/image unchanged.','newWholePrimaryMandateClaimed':False})
save('candidates/six-whole-content-successor-goals.INERT.json',[goals[x] for x in [DD,V,PAY,PO,POL,S]])
save('candidates/two-whole-practices.INERT.json',[goals[F],goals[Q]])
for gid,name in [(F,'f08'),(Q,'036ea')]:save(f'candidates/{name}.whole-practice.retained-role.INERT.json',goals[gid])
save('candidates/landscape.author-only.INERT.json',landscape)
save('source-notes/three-explicit-content-compatibility-country-amendments.INERT.json',{'status':'ai_candidate_needs_human_review','activationState':'INERT','amendments':compat,'canonicalGlobalCourseTagsUnchanged':True,'noNewGoalIds':True,'noPrimaryMandateFromCountryAutomaticity':True})
previousRoles=read(O/'history/sealed-original-role-proposals.exact.json');roles=[];scopeEntries=[]
for previous in previousRoles['countries']:
 country=previous['jurisdiction'];practices=[p for p in [F,Q] if country in old[p]['applicability']['jurisdiction']]
 role={'jurisdiction':country,'oldDirectMappingSourceSets':previous['oldDirectMappingSourceSets'],'wholePrimarySourceCourseQualification':'open','boundedPrimaryFinding':previous.get('specificCourseFinding'),'primaryCompulsoryOrChoiceConditions':{k:v for k,v in previous.items() if k in ['f08Condition','036eaCondition']},'notPrimaryMandate':'The following targets preserve authored existing whole Practice contracts; missing whole primaryqualification does not delete them.','f08Role':'target_as_explicit_authored_existing_didactic_extension_LK' if F in practices else 'not_added_outside_original_f08_target_set','036eaRole':'target_as_explicit_authored_existing_didactic_extension_GK_and_LK' if Q in practices else 'not_added_outside_original_036ea_target_set','actualPrimaryConditionsOverrideOnlySourceClaimNotExistingExtensionRetention':True,'noActualProjectionWrite':True}
 roles.append(role)
 for profile in ['GK','LK']:
  selected=[p for p in practices if profile in old[p]['tags']]
  if not selected:continue
  targets=[]
  for p in selected:
   for i in goals[p]['examData']['coveredGoalIds']:
    if i not in targets:targets.append(i)
  closure=set()
  def collect(i):
   for j in goals[i].get('requires',[]):
    if j not in closure:closure.add(j);collect(j)
  for i in targets:collect(i)
  scopeEntries.append({'scope':{'schoolForm':'Gymnasium','jurisdiction':country,'stage':'SekII','courseProfile':profile},'officialCountryCourseNameAndFullQualification':'open; original GK/LK technical compatibility preserved, not an assertion of official names or compulsory breadth','authorship':'explicit_authored_existing_didactic_extension','primaryConditions':role['primaryCompulsoryOrChoiceConditions'],'practiceGoalEntries':[{'kind':'goalEntry','goalId':i,'projectionRole':'target'} for i in selected],'contentGoalEntries':[{'kind':'goalEntry','goalId':i,'projectionRole':'target','reason':'Actually assessed whole Practice content, including historically preserved independent facets'} for i in targets],'prerequisiteOnlyGoalEntries':[{'kind':'goalEntry','goalId':i,'projectionRole':'prerequisiteOnly','reason':'Actual didactic closure beyond assessed content; no mastery reverse inference or primarysource coverage claim'} for i in sorted(closure-set(targets))],'POLGKScopePlacement':{'goalId':POL,'projectionRole':'target','courseProfile':'GK','jurisdiction':country,'reason':'Own explicit material-backed assessed policy-response extension in the original whole 036ea GK scope; not inferred from an LK source or tag. Global LK tag remains historical compatibility, other countries receive no automatic GK claim.'} if profile=='GK' and Q in selected else None,'canonicalFallbackMustNotDiscardTheseAuthoredTargetEntriesByPhaseTagOrRequiresIntersection':True,'compiledNativeProjection':'Root stable common core to bind/check; not approved or written here','noExtraTaskOrCaseQuota':True})
save('source-notes/twelve-whole-country-primary-vs-existing-extension-roles.INERT.json',{'status':'ai_candidate_needs_human_review','activationState':'INERT','evidenceLevel':'E1','maximumClaimScope':'G1','countries':roles,'originalF11Countries':old[F]['applicability']['jurisdiction'],'originalQ5Countries':old[Q]['applicability']['jurisdiction'],'wholePrimaryQualification':'open; source conditions remain literal and partial where unqualified','previousWithheldOrHEOnlyRoleProposalSupersededForTargetRetention':True,'primaryCompulsoryClaimNotBroadened':True})
save('source-notes/seventeen-explicit-existing-learner-scope-role-proposals.INERT.json',{'status':'ai_candidate_needs_human_review','activationState':'INERT','evidenceLevel':'E1','maximumClaimScope':'G1','scopeCount':len(scopeEntries),'scopes':scopeEntries,'noSilentOldLearningSetLoss':True,'noCountryOrCourseAutomaticity':True})
profiles={r['goalId']:r for r in read(O/'history/sealed-three-own-native-profiles.exact.json')}
for gid in [V,PAY,S]:profiles[gid]=json.loads((O/f'history/{gid}.whole-current-positive.exact.jsonl').read_text())
now=datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00','Z');records=[]
for gid in [DD,V,PAY,PO,POL,S]:
 r=copy.deepcopy(profiles[gid]);r.update({'reviewId':'dd543-role-retention-own-technical-carry-v1-'+gid,'reviewedAt':now,'reviewer':'OpenAI GPT-6 / Codex; own INERT additive scope author and technical carry, no new independent content judgement','reason':'Whole substantive profile payload exactly carried from the own predecessor handoff/current original input; native rebinding to explicit owned compatibility scope amendments. No new content, source, independent, human, learner or visual approval.','status':'needs_human_review','reviewAuthority':'ai_candidate','evidenceLevel':'E1','maximumClaimScope':'G1','reviewRunIds':[],'dissent':[]});records.append(r)
save('history/six-whole-substantive-profile-inputs.exact-objects.json',[profiles[g] for g in [DD,V,PAY,PO,POL,S]])
save('candidates/positive-profiles.unbound-author-drafts.json',records)
metadata={'preparedAt':now,'sourcePredecessorDirectory':str(D.relative_to(ROOT)),'sourcePredecessorSealDigest':h((D/'SEALED-unreviewed-INERT-handoff.json').read_bytes()),'expectedImmutablePredecessorSealDigest':'sha256:249d319d706855bf1887399c020da71fae00357bb76d9c3a942d317d3627a7f4','copiedOwnInputs':[{'from':str((D/src).relative_to(ROOT)),'to':dst,'digest':h((O/dst).read_bytes())} for dst,src in copies.items()],'newPrimaryReads':False,'wholePredecessorMaterialsAndPProfilesRerated':False,'otherDRoundResultsRead':False,'activeWrites':False,'imagesGenerated':False}
assert metadata['sourcePredecessorSealDigest']==metadata['expectedImmutablePredecessorSealDigest']
save('source-notes/actual-own-additive-input-binding-and-independence.json',metadata)
print(json.dumps({'status':'prepared_own_additive_INERT','countryRoles':len(roles),'learnerScopes':len(scopeEntries),'wholePracticeCountrySetsPreserved':True,'primaryWholeQualification':'open','nativeProfileTechnicalCarries':len(records)},ensure_ascii=False))
