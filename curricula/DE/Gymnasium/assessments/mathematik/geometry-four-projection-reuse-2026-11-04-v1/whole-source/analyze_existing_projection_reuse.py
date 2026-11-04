"""Read-only static analysis of the exact existing N2 artifact; never runs Native."""
from pathlib import Path
import json,gzip,hashlib,collections
H=Path(__file__).resolve().parent;R=H.parents[2]
def load(n):return json.loads((H/n).read_text())
f=load('frozen-input.json');np=R/f['nativeN2']['path'];assert hashlib.sha256(np.read_bytes()).hexdigest()==f['nativeN2']['sha256'];native=json.loads(gzip.decompress(np.read_bytes()));canonical=load('original/canonical.current.json');by={g['id']:g for g in canonical['goals']}
exam='e3c70a12-7886-51f7-8bcd-ed54865415d6';goal='5748633c-113f-5ea8-9041-24da55919de7';Eraw={g['id']:g.get('requires',[]) for g in canonical['goals']}
def reach(roots,E,mastered=frozenset()):
 seen=set(roots);todo=list(seen)
 while todo:
  x=todo.pop()
  if x in mastered:continue
  for r in E.get(x,[]):
   if r not in seen:seen.add(r);todo.append(r)
 return seen
rawPrep=reach(by[exam]['requires'],Eraw);newPrep=reach([goal],Eraw);assert exam not in newPrep
rows=[];candidateRows=[];needCounts=collections.Counter()
for scope in native['scopes']:
 name=scope['scope'];T=set(scope['targetGoalIds']);C=set(scope['contextGoalIds']);P=set(scope['selectedProtectedTargetGoalIds']);E={k:list(v) for k,v in scope['effectiveDirectPrerequisitesByContextGoalId'].items()};before=reach(P,E);assert before==set(scope['neededContextGoalIdsAtM0'])
 row={'scope':name,'personalCurriculumConfig':scope['personalCurriculumConfig'],'compositionViewIds':scope['compositionViewIds'],'existingExamIsTarget':exam in T,'existingExamIsProtectedTarget':exam in P,'existingExamIsContext':exam in C,'competencyIsTarget':goal in T,'competencyIsContext':goal in C,'competencyIsPrerequisiteOnly':goal in set(scope['prerequisiteOnlyGoalIds']),'competencyCurrentlyNeededAtM0':goal in before,'competencyCurrentlyUncoveredEndpoint':goal in set(scope['uncoveredEndpointGoalIds']),'effectiveExistingExamRequires':E.get(exam,[]),'effectiveCompetencyRequires':E.get(goal,[]),'nativeScopePassedFlag':scope['passed'],'nativeFlagIsNotThisStaticAnalysisApproval':True}
 rows.append(row)
 if exam not in P:continue
 missing=sorted(newPrep-C)
 if missing:
  row['candidateReadOnlyEffect']={'status':'HOLD_REQUIRES_NEW_COMPILE_BECAUSE_PREPARATION_OUTSIDE_EXISTING_CONTEXT','missingCanonicalPreparationContextGoalIds':missing};continue
 candidate={k:list(v) for k,v in E.items()};candidate[exam]=list(dict.fromkeys(candidate.get(exam,[])+[goal]));assert exam not in reach([goal],candidate)
 after=reach(P,candidate);assert before<=after
 # No target, protected selection or mastery is mutated; this evaluates a hypothetical true R edge.
 effect={'scope':name,'status':'CONDITIONAL_STATIC_EDGE_EFFECT_ONLY_NO_ACTIVATION','additionalRawRequiresIfLaterApproved':{'consumerGoalId':exam,'prerequisiteGoalId':goal},'allCanonicalPreparationAlreadyInExistingContext':True,'cycleAbsentInExistingEffectiveGraph':True,'oldProtectedSetExactlyRetained':True,'newProtectedAssessmentCount':0,'newTargetCount':0,'competencyWasTarget':goal in T,'competencyNewlyNeeded':goal not in before and goal in after,'newlyNeededContextGoalIds':sorted(after-before),'newlyNeededTargetGoalIds':sorted((after-before)&T),'otherOriginallyUncoveredEndpointsNewlyNeeded':sorted((after-before)&set(scope['uncoveredEndpointGoalIds'])-{goal}),'masteringExistingExamEndsAddedPreparationDemand':goal not in reach(P,candidate,{exam}),'masteringCompetencyDoesNotMasterExam':exam in reach(P,candidate,{goal}),'noMasteryValueWritten':True,'noRouteOrM7PassClaim':True}
 candidateRows.append(effect);row['candidateReadOnlyEffect']=effect
 for g in after-before:needCounts[g]+=1
selected=[r for r in rows if r['existingExamIsTarget'] or r['competencyIsTarget']]
out={'status':'READ_ONLY_EXACT_N2_MEMBERSHIP_AND_CONDITIONAL_R_EDGE_EFFECT_PENDING_JOINT_REVIEW','nativeArtifact':f['nativeN2'],'canonical':f['canonical'],'wholeUnchangedExistingExam':by[exam],'wholeExistingRawTransitivePreparationContracts':[by[x] for x in sorted(rawPrep)],'wholeCandidateAdditionalCanonicalPreparationContracts':[by[x] for x in sorted(newPrep)],'all161ActualScopeRows':rows,'selectedMembershipRows':selected,'counts':{'actualScopesRead':len(rows),'examTargetScopes':sum(r['existingExamIsTarget'] for r in rows),'examProtectedScopes':sum(r['existingExamIsProtectedTarget'] for r in rows),'competencyTargetScopes':sum(r['competencyIsTarget'] for r in rows),'competencyTargetWithExamProtectedScopes':sum(r['competencyIsTarget'] and r['existingExamIsProtectedTarget'] for r in rows),'conditionalCandidateEffectScopes':len(candidateRows),'goalNewlyNeededInConditionalCandidateScopes':sum(r['competencyNewlyNeeded'] for r in candidateRows),'contextsNeedingRecompile':sum(r.get('candidateReadOnlyEffect',{}).get('status','').startswith('HOLD') for r in rows)},'hypotheticalEffects':candidateRows,'newlyNeededGoalScopeCounts':dict(needCounts),'cycleCheck':{'globalCanonicalPathFromCompetencyToExam':exam in newPrep,'proposedEdgeWouldCreateGlobalRawCycle':False},'didacticQuestionForIndependentReview':'The whole e3 task already computes an orthogonal projection of a concrete spatial vector onto x3=0 and interprets the plane and perpendicular rest, before proving linearity/image/kernel. The coordinate-plane competency describes points/lines/surfaces/objects with OR. Is this entire preexisting form sufficient genuine assessment for that point-and-interpretation case? If yes, preparation in coordinate-plane projection before this linearity/structure assessment is coherent; adding a real R reference is stronger than only a coverage label and creates a new preparation demand that requires explicit joint scope review. The optional new multi-view task should serve only genuinely remaining compatible gaps, not become a duplicate obligation in these scopes.','proposalStatus':'CONDITIONAL_CONTENT_AND_DIDACTIC_REVIEW_INPUT_ONLY_NO_APPROVED_EDGE_OR_ROLE','notImplemented':['No canonical edge/coverage/type/role/applicability changes','No target or protected-set change','No Stage/composition mutation','No Native matrix run','No global route counts or M7 pass','No automatic mastery of the original goal or its prerequisites']}
(H/'existing-e3-reuse-whole-scope-candidate-effect.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n');print(json.dumps(out['counts'],indent=2));print('additional raw preparation',len(newPrep),'existing prep',len(rawPrep))
