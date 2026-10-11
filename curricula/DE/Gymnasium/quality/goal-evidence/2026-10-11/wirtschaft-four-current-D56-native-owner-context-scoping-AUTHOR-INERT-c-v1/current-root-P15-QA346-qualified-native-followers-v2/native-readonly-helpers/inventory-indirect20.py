from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,subprocess
R=Path('/home/enpasos/projects/skillpilot');O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-four-current-D56-native-owner-context-scoping-AUTHOR-INERT-c-v1';F=O/'current-root-P15-QA346-qualified-native-followers-v2';B=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-current346-D130-preserved-pairs-owner-page-context-readonly-c-v1'
def load(p):return json.loads(p.read_text())
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def binding(p):return {'path':str(p.relative_to(R)),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def write(p,v):p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n');return binding(p)
measurement=load(F/'actual-targeted-native-four-owner-225-nonloss-and-indirect-ID-release.READONLY.json');ids=measurement['indirectGainedGoalIds'];assert len(ids)==20
rows={r['goalId']:r for r in load(B/'current130-IDs-original-two-round-pairs-and-current-binding-inventory.READONLY.json')['goals']};canpath=R/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json';can=load(canpath);by={g['id']:g for g in can['goals']};old_can=json.loads(subprocess.check_output(['git','show','43461b906438572f4f3b64d056112f4189dca4f4:'+str(canpath.relative_to(R))],cwd=R,text=True));oldby={g['id']:g for g in old_can['goals']}
native_pages=load(F/'actual-current20-only-original-native-full-page-contexts.READONLY.json');pages={p['goalId']:p for p in native_pages['wholeSelectedActualCurrentPages']}
qual=load(R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1/08-actual-P15-QA346-book-pointer-activation.receipt.json');positive=R/qual['activeWholePositive']['path'];ps={p['goalId']:p for p in map(json.loads,positive.read_text().splitlines())}
source_maps=[]
for mp in (R/'curricula/DE/Gymnasium/mapping').rglob('*.review.json'):
 try:m=load(mp)
 except:continue
 sp=R/m.get('sourceExtractionPath','');
 if not sp.is_file():continue
 s=load(sp)
 if s.get('sourceLandscapeId')in {by[id].get('extendedData',{}).get('provenance',{}).get('sourceLandscapeId')for id in ids}:source_maps.append((mp,m,sp,s))
out=[];artifactbindings=[];guards=[binding(p)for p in [canpath,positive,R/'app/scripts/config/goal-books/de-gym-economics-current-canonical.json']]
for id in ids:
 r=rows[id];g=by[id];page=pages[id];p=ps[id];pair=r['registeredOwnerOriginalPair'];assert not r['registeredCurrentCanonicalContextDeltas'] and not r['registeredTextDeltas']
 history=[];oldpages=[];oldrecords=[]
 for role in pair['existingIndependentRounds']:
  inp=load(R/role['reviewInput']['path']);oldg=next(g for g in inp['goals']if g['goalId']==id);oldpages.append({'round':role['round'],'wholeOriginalInputGoal':oldg})
  record=next(json.loads(l)for l in (R/role['actualResults']['path']).read_text().splitlines()if json.loads(l)['goalId']==id);oldrecords.append({'round':role['round'],'wholeOriginalScientificRecord':record,'wholeOriginalActualRun':load(R/role['runManifest']['path'])})
  for k in ['reviewInput','actualResults','runManifest','campaign']:b=role[k];assert sha((R/b['path']).read_bytes())==b['sha256'];guards.append(binding(R/b['path']))
 origin=g.get('extendedData',{}).get('provenance',{});sourced=[]
 for mp,m,sp,s in source_maps:
  if s.get('sourceLandscapeId')!=origin.get('sourceLandscapeId'):continue
  atom=next((a for a in s['sourceGoals']if a['id']==origin.get('sourceGoalId')),None)
  if atom is None:continue
  mappings=[e for e in m['mappings']if e['legacyGoalId']==atom['id']];decisions=[d for d in m['decisions']if d.get('sourceGoalId')==atom['id']];passage=next((x for x in s['passages']if x['id']==atom.get('passageId')),None)
  sourced.append({'wholeExistingSourceAtom':atom,'wholeExistingSourcePassage':passage,'wholeCurrentMappings':mappings,'wholeCurrentDecisions':decisions,'sourceFile':binding(sp),'mappingFile':binding(mp),'newWholeSourceReview':False,'notAClaimThatEveryCanonicalFacetIsMandatoryInAllMappedCourses':True});guards.extend([binding(sp),binding(mp)])
 currentSciencePair=r['inFlightOriginalPair']if r.get('inFlightOriginalPair')and r.get('inflightCandidate',{}).get('nativeEntryReady')else None
 currentNeighborIds={x['goalId']for f in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']for x in page[f]};oldNeighborIds={x['goalId']for q in oldpages for f in ['requires','reverseRequires','externalPrerequisites','externalReverseRequires']for x in q['wholeOriginalInputGoal']['reviewContext']['page'][f]};deltaIds=currentNeighborIds.symmetric_difference(oldNeighborIds);neighborBodies=[by[n]for n in sorted(currentNeighborIds)if n in by]
 whole={'goalId':id,'title':g['title'],'status':'AUTHOR-INERT-current-context-qualification-pending','wholeCurrentGoal':g,'wholeCurrentPositiveRecord':p,'wholeCurrentNativePage':page,'wholeOriginalRegisteredTwoRoundRecordsAndRuns':oldrecords,'wholeOriginalRegisteredBothInputs':oldpages,'wholeOriginalResolution':load(R/pair['resolution']['path']),'existingCurrentD56PairIfAny':currentSciencePair,'existingSourceOriginFacetsAndPartialBoundaries':sourced,'wholeCurrentNeighborGoalBodies':neighborBodies,'actualOldAndCurrentNeighborMembershipDelta':sorted(deltaIds),'wholeCurrentGoalObjectExactlyCIHEAD':g==oldby[id],'currentGoalObjectDeltaFieldsAgainstCIHEAD':[k for k in set(g)|set(oldby[id])if g.get(k)!=oldby[id].get(k)],'currentSourceOrPAuthorshipByThisAgentNotNewApproval':'This is a bounded continuation/context-authoring candidate; Root performs independent whole-context qualification. Existing review candidates and separate human gates remain unchanged.','oldRegisteredCanonicalContextAndWholeDEENTextValid':True,'oldPositiveProfileWasAbsent':r['currentPageAndPPayload']['registered']['embeddedProfileAbsentNotAnInventedNewPFailure'],'oldPositiveProfileBodyExactIfPresent':r['currentPageAndPPayload']['registered']['actualPProfilePayloadExact'],'newScientificReviewPerformed':False,'wholeCurrentContextQualificationStillOpen':True}
 artifact=write(F/'indirect20-whole-current-and-original-contexts'/(id+'.AUTHOR-INERT.json'),whole);artifactbindings.append(artifact)
 out.append({'goalId':id,'title':g['title'],'wholeContextArtifact':artifact,'oldRegisteredOwner':r['currentActiveOwnerIndex'],'wholeGoalExactlyCIHEAD':whole['wholeCurrentGoalObjectExactlyCIHEAD'],'noScientificTextOrCanonicalContextChange':True,'currentD56AdditionalPairExists':currentSciencePair is not None,'currentPWasAbsentFromOldDescriptionInput':whole['oldPositiveProfileWasAbsent'],'currentPBodyExactIfHistoricallyPresent':whole['oldPositiveProfileBodyExactIfPresent'],'changedActualNeighborMembershipIds':sorted(deltaIds),'existingDirectOriginSourceFacetCount':len(sourced),'qualificationStatus':'OPEN-before-own-bounded-context-assessment-and-independent-Root-qualification'})
manifest=write(F/'actual20-indirect-current-ID-original-two-review-P-page-source-context-manifest.AUTHOR-INERT.json',{'status':'AUTHOR-INERT-every-indirect-context-explicit-pending','actualUTC':datetime.now(timezone.utc).isoformat(),'HEAD':'43461b906438572f4f3b64d056112f4189dca4f4','currentSourceModelDigest':native_pages['currentActualModelDigest'],'selectedIndirect20Ids':ids,'goals':out,'all20OrdinaryGoalNativeDescriptionPayloadUntouched':True,'all20WholeObjectsUnchangedFromCIHEAD':all(x['wholeGoalExactlyCIHEAD']for x in out),'RootSevenWordingsOrFiveNarrowedContractsOrNewTenGoalWorkIncluded':False,'basisForThatExclusion':'All20 whole CIHEAD goal objects and current canonical bilingual descriptions/context are byte/object exact; no changed/new contract is assigned to this indirect bundle. A different existing profile newly present in a historical D page is kept explicit.','autoReleasedCurrentGoalCountNotApproval':20,'newScienceReviewRuns':0,'activeWrites':0,'candidateActivationReady':False,'integratedStrictOrDescriptionClosures':0})
write(F/'actual-indirect20-original-source-profile-physical-before-bindings.READONLY.json',{'status':'READONLY-original20-history-and-current-input-bindings','guards':list({x['path']:x for x in guards}.values()),'all20AuthorArtifacts':artifactbindings,'newSourceReview':False})
print(json.dumps(manifest))
