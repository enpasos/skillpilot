# SPDX-License-Identifier: Apache-2.0
from pathlib import Path
from copy import deepcopy
import json,hashlib
ROOT=Path.cwd();OWN=Path(__file__).resolve().parent;assert not(OWN/'author.final.freeze.json').exists()
def read(p):return json.loads(p.read_text())
def bind(p):b=p.read_bytes();return{'path':str(p.relative_to(ROOT)),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(p,d):p.parent.mkdir(parents=True,exist_ok=True);p.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n')
proposals=read(OWN/'exact-bb-be-current-original-duties-and-specific-child-source-proposals.json');mappingOutputs=[];fieldGuards=[]
for land in['BB','BE']:
 for stage in['lower-secondary','upper-secondary']:
  lower=stage=='lower-secondary';sourceFile=OWN/'inputs'/(land+'-'+stage+'.source-extraction.current.json.bin');originalSource=read(sourceFile);candidateSource=deepcopy(originalSource);rows=[r for r in proposals['original28UniqueFamilySourceDuties']if r['wholeOriginalSourceGoal']['id'].startswith(land.lower()+'-chemistry-'+('seki-'if lower else'sekii-'))];assert len(rows)==(12 if lower else 2);bySource={g['id']:g for g in candidateSource['sourceGoals']}
  if not lower:
   for change in proposals['currentGKUnsupportedLKOnlyWitnesses']:
    if change['jurisdiction']=='DE-'+land:assert bySource[change['actualSourceGoalId']]==change['wholeOriginalSourceGoal'];bySource[change['actualSourceGoalId']].clear();bySource[change['actualSourceGoalId']].update(deepcopy(change['candidateCourseCorrectedSourceGoal']));fieldGuards.append({'path':originalSource['sourceDocument']['path'],'sourceGoalId':change['actualSourceGoalId'],'field':'courseLevel and course tags','before':change['wholeOriginalSourceGoal'],'candidate':change['candidateCourseCorrectedSourceGoal'],'sourceWholeTextUnchanged':True,'approved':False})
  candidateSource['authorCandidateScopeReview']={'status':'pending_independent_source_review','historicalPipelineStatusIsNotAReviewOfTheseCandidateChanges':True,'newWholeSourceApprovalClaims':0,'sourceGoalIDsDeletedOrInvented':0}
  candidateSourcePath=OWN/'candidate-source-inputs'/(land+'-'+stage+'.source-extraction.author-candidate.json');write(candidateSourcePath,candidateSource)
  prefix=land.lower()+'_chemistry_'+('lower_secondary'if lower else'upper_secondary');mapPath=ROOT/f'curricula/DE/Gymnasium/mapping/DE-{land}/{stage}'/(prefix+'_source_extraction_to_canonical_chemistry.review.json');originalMapping=read(mapPath);mapSnapshot=OWN/'inputs'/(land+'-'+stage+'.source-mapping.current.json.bin');mapSnapshot.write_bytes(mapPath.read_bytes());candidateMapping=deepcopy(originalMapping);newMappings=[];changes=[]
  oldRows={(r['currentOriginalSourceGoalId'],r['oldFamilyId']):r for r in rows}
  for old in originalMapping['mappings']:
   key=(old['legacyGoalId'],old['canonicalGoalId'])
   if key in oldRows:
    p=oldRows[key];replacement=[{k:v for k,v in m.items()if k not in['candidateKey','authoritativeIndependentApproval']}for m in p['proposedSpecificChildMappings']];newMappings.extend(replacement);changes.append({'wholeOldMapping':old,'specificCandidateMappings':replacement,'oldOriginalDutyIndex':p['originArrayIndex'],'wholeOtherSourceMappingsUntouched':True,'independentApproval':False})
   else:newMappings.append(old)
  assert len(changes)==len(rows)
  extras=[]
  if not lower:
   extra=read(OWN/'gk-authentic-source-supplements'/(land+'.actual-current-topic-source-proposals.json'))
   for p in extra['supplementalPartialComponentProposals']:
    for gid in p['specificProposedChildIds']:extras.append({'legacyGoalId':p['currentExistingSourceGoalId'],'canonicalGoalId':gid,'matchType':'partial','reviewDecisionId':p['currentExistingSourceGoalId']})
   newMappings.extend(extras)
  assert len({(r['legacyGoalId'],r['canonicalGoalId'])for r in newMappings})==len(newMappings);candidateMapping['mappings']=newMappings;affectedSourceIds={r['currentOriginalSourceGoalId']for r in rows}|{r['legacyGoalId']for r in extras};decisionChanges=[]
  for decision in candidateMapping['decisions']:
   sid=decision['sourceGoalId']
   if sid not in affectedSourceIds:continue
   historical=deepcopy(decision);decision['canonicalGoalIds']=list(dict.fromkeys(r['canonicalGoalId']for r in newMappings if r['legacyGoalId']==sid));decision['decision']='needs_view_placement_review';decision['reviewer']=None;decision['reviewedAt']=None;decision['rationale']='AUTHOR candidate: exact current source/primary course and operator components have changed; independent source/placement review pending. Other existing content targets retained.';decision['historicalDecisionBeforeCandidate']=historical;decision['newAuthorCandidateIsNotHistoricallyReviewed']=True;decisionChanges.append({'sourceGoalId':sid,'wholeHistoricalDecision':historical,'newCurrentIndependentReviewerOrDecisionInvented':False})
  candidateMapping['sourceExtractionPath']=str(candidateSourcePath.relative_to(ROOT));candidateMapping['reviewId']=originalMapping['reviewId']+'.bb-be-b008-author-v14';candidateMapping['status']='author_candidate_pending_independent_source_and_placement_review';candidateMapping['summary']={'totalSourceGoals':len(originalSource['sourceGoals']),'unchangedHistoricalWholeDecisions':len(originalMapping['decisions'])-len(decisionChanges),'pendingCurrentSourceDecisionIds':sorted(affectedSourceIds),'newIndependentSourceApproval':0,'wholeOriginalSourceDutyIdsDeleted':0};out=OWN/'candidate-source-mappings'/(land+'-'+stage+'.source-mapping.author-candidate.json');write(out,candidateMapping)
  # Every unrelated mapping and complete historical decision survives unchanged.
  assert all(m in newMappings for m in originalMapping['mappings']if(m['legacyGoalId'],m['canonicalGoalId'])not in oldRows)
  assert all(d in candidateMapping['decisions']for d in originalMapping['decisions']if d['sourceGoalId']not in affectedSourceIds)
  mappingOutputs.append({'currentOriginalSourceMapping':bind(mapPath),'exactSourceMappingSnapshot':bind(mapSnapshot),'candidateMapping':bind(out),'candidateSourceExtraction':bind(candidateSourcePath),'sourceOriginalIdsChangedInCourseScopeOnly':2 if not lower else 0,'originalFamilyMappingChanges':changes,'extraAuthenticGKSourcePartialMappings':extras,'affectedHistoricalReviewDecisionInputs':decisionChanges,'allWholeOriginalSourceGoalIdsPreserved':True,'allUnaffectedMappingAndReviewBodiesExact':True,'reviewedNewMappingCount':0})
write(OWN/'guarded-extraction-and-source-mapping-candidate-field-intents.json',{'role':'Actual field guarded current source-input proposals; review statuses honestly pending','sourceScopeFieldIntents':fieldGuards,'candidateMappingInputs':mappingOutputs,'wholeCurrentOriginalSourceIDsDeleted':0,'newSourceIDsInvented':0,'newIndependentSourceDecisionsInvented':0,'fullNationalSourceAtlasRunPerformed':False,'fullNationalSourceAtlasMustRemainBlockedByThesePendingDecisions':True,'strictGain':0,'activeWrites':0})
print(json.dumps({'wholeOriginalFamilyRowsReplacedAsPendingCandidates':sum(len(r['originalFamilyMappingChanges'])for r in mappingOutputs),'authenticGKAdditionalPartialMappings':sum(len(r['extraAuthenticGKSourcePartialMappings'])for r in mappingOutputs),'honestPendingSourceDecisionInputs':sum(len(r['affectedHistoricalReviewDecisionInputs'])for r in mappingOutputs),'wholeOriginalSourceIDsPreserved':True,'strictGain':0}))
