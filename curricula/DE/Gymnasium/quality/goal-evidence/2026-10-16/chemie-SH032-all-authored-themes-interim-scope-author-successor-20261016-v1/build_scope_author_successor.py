from pathlib import Path
import json,hashlib,copy,datetime
R=Path('/home/enpasos/projects/skillpilot');H=R/'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
O=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-all-authored-themes-interim-scope-author-successor-20261016-v1'
OLD=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-coherent-selected-theme-process-chain-author-successor-20261016-v1'
HIST=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-process-chain-independent-AMPV-a-20261016-v1'
G='3eb2a06c-d283-57aa-9eb4-088940c4801a';A='69928892-ac71-553d-a35c-4f96f16b6d6e';B='6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338';T='5964272f-e835-5a24-b2b1-c162be6b75cb';S='de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-032-74ed63ca'
O.mkdir(exist_ok=False)
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def pin(p):b=p.read_bytes();return {'path':str(p.relative_to(R)),'sha256':sha(b),'bytes':len(b)}
def read(p):return json.loads(p.read_text())
def write(rel,obj):
 p=O/rel;p.parent.mkdir(parents=True,exist_ok=True);assert not p.exists();p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n');return p
def exact(rel,p):
 d=O/rel;d.parent.mkdir(parents=True,exist_ok=True);assert not d.exists();d.write_bytes(p.read_bytes());return d
cp=H/'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json';canon=read(cp)
assert pin(cp)['sha256']=='sha256:e50c2c1e442542cbb55ad98566ed90138a59520abe1c641d3f0e7f3b7e4adca7'
assert len(canon['goals'])==635
base=exact('inputs/CANONICAL.actual-H635.whole.exact.json',cp);by={g['id']:g for g in canon['goals']}
assert G not in by and A not in by
ordinaryPath=OLD/'candidate/WHOLEGOAL.source032-one-coherent-process-chain.AUTHOR.inactive.json'
assessmentPath=OLD/'ADDENDUM.one-assessment-route-20261016-v1/WHOLEGOAL.one-assessment-endpoint.AUTHOR.inactive.json'
ordinaryBefore=read(ordinaryPath);assessmentBefore=read(assessmentPath)
ordinary=copy.deepcopy(ordinaryBefore);assessment=copy.deepcopy(assessmentBefore)
policy={'policyId':'owner-sh-all-authored-themes-interim-20261016','decisionAuthority':'Explicit Product Owner instruction relayed by supervising root in this task','ownerInstructionDe':'ähnlich der Situation Mathematik in Bayern ... erst alle Themen aufnehmen und eine vorgelagerte Themenauswahl zurückzustellen.','targetPolicy':'SkillPilot interim target includes all authored SH themes in both GK and LK; selection UX deferred','jurisdiction':'DE-SH','stage':'SekII','courseProfiles':['GK','LK'],'allAuthoredThemesInCurrentTarget':True,'persistedThemeSelectionImplemented':False,'requiresPersistedThemeSelectionForTheseTargets':False,'officialUniversalThemeDutyClaimed':False,'runtimeOrUIImplementationRequested':False,'normativeProductPolicyNotOfficialCurriculumDuty':True}
official={'sourceGoalId':S,'sourceTheme':'Chemie und Medikamente','officialSourceThemeOptional':True,'officialContentsBindingWithinThemeWhenSelected':True,'courseLevel':'GK_LK','stage':'SekII','sourcePages':[69,71],'noOfficialUniversalGKOrLKMedicationDutyClaim':True}
for goal in [ordinary,assessment]:
 ap=goal['extendedData']['authorProposal']
 for key in ['themeSelectionRequired','learnerPlacementProposalOnly','selectedThemeOnly','noUniversalGKRequirement','notUniversalGKRequirement']:
  ap.pop(key,None)
 ap['package']=str(O.relative_to(R));ap['status']='DRAFT_INACTIVE_SCOPE_AUTHOR_SUCCESSOR_ONLY'
 ap['officialSourceScope']=copy.deepcopy(official)
 ap['interimSkillPilotTargetPolicy']=copy.deepcopy(policy)
 ap['noStoredThemeSelectionStateClaim']=True
 ap['newIndependentReviewOrSourceApproval']=False
if 'authorCoverageIntent' in assessment['extendedData']['routeCoverage']:
 assessment['extendedData']['routeCoverage']['authorCoverageIntent']='Exactly the one new source032 process-chain competence in the interim full authored SH target; official medication-theme optionality is preserved separately.'
assert {k:v for k,v in ordinary.items() if k!='extendedData'}=={k:v for k,v in ordinaryBefore.items() if k!='extendedData'}
assert {k:v for k,v in assessment.items() if k!='extendedData'}=={k:v for k,v in assessmentBefore.items() if k!='extendedData'}
assert assessment['requires']==assessment['examData']['coveredGoalIds']==[G]
assert assessment['extendedData']['applicabilityFromRequires'] is True
newOrd=write('candidate/WHOLEGOAL.3eb-ordinary.all-authored-interim.AUTHOR.json',ordinary)
newAss=write('candidate/WHOLEGOAL.699-assessment.all-authored-interim.AUTHOR.json',assessment)
boundaryBefore=by[B];boundary=copy.deepcopy(boundaryBefore);boundary['contains'].append(G)
assert len(boundaryBefore['contains'])==9;boundary['weight']=10
terminalBefore=by[T];terminal=copy.deepcopy(terminalBefore)
assert '32705a3a-9b7f-5cc0-ba41-881d13d0c45b' in terminal['contains'];terminal['contains'].append(A)
newB=write('candidate/WHOLEGOAL.6b6-boundary-after-append.AUTHOR.json',boundary)
newT=write('candidate/WHOLEGOAL.596-terminal-after-append.AUTHOR.json',terminal)
goalsCAS=[]
for before,after,p in [(None,ordinary,newOrd),(None,assessment,newAss),(boundaryBefore,boundary,newB),(terminalBefore,terminal,newT)]:
 goalsCAS.append({'goalId':after['id'],'operation':'insert-if-absent' if before is None else 'whole-compare-and-swap','before':before,'after':after,'afterFile':pin(p),'changedFields':(['extendedData.authorProposal'] if after['id']==G else ['extendedData.authorProposal','extendedData.routeCoverage.authorCoverageIntent']) if before is None else (['contains','weight'] if after['id']==B else ['contains']),'newGoalHistoryInput':pin(ordinaryPath if after['id']==G else assessmentPath) if before is None else None})
write('CAS.four-whole-goals.current-H635.AUTHOR.inactive.json',{'role':'AUTHOR ONLY inactive four-whole-goal CAS; no scientific vote','actualCanonicalBase':pin(cp),'frozenCanonicalBase':pin(base),'items':goalsCAS,'onlySourceScopeProposalMetadataChangedInTwoNewLeaves':True,'allScienceDEENTextExamplesMaterialsResourceLinksExact':True,'preserveCurrent327HELK':True,'normalWrites':0})
write('OWNER.interim-all-authored-themes-policy-and-official-source-separation.AUTHOR.json',{'role':'Author implementation proposal for explicit owner data policy, not source-review authority','productPolicy':policy,'officialSource':official,'earlierSelectedThemeActivationHold':'Preserved verbatim as history. Owner now decides an interim all-authored-target policy while selection UX is deferred. This successor still requires the original independent source follow-up; it does not self-convert a prior scoped KEEP to a new source or route approval.','neitherCustomStoredThemeKeyNorRuntimeImplementationAdded':True})

viewCAS=[]
for course in ['gk','lk']:
 rel=f'curricula/DE/Gymnasium/composition-views/chemie/de-sh-{course}.view.json';p=H/rel;before=read(p);after=copy.deepcopy(before)
 assert before['scope']['courseProfile']==course.upper()
 def allids(nodes):return [n.get('goalId') for n in nodes if n.get('goalId')]+sum([allids(n.get('children',[])) for n in nodes],[])
 assert G not in allids(before['rootNodes']) and A not in allids(before['rootNodes'])
 node={'kind':'structure','id':f'chemistry-de-sh-{course}-medication-process-chain-interim','label':'Chemie und Medikamente – Forschung, Produktion und Vermarktung','children':[{'kind':'goalEntry','goalId':G,'projectionRole':'target'},{'kind':'goalEntry','goalId':A,'projectionRole':'target'}]}
 root=next(n for n in after['rootNodes'] if n.get('id')=='chemistry-root');root['children'].append(node)
 afterp=write(f'candidate/VIEW.de-sh-{course}.all-authored-interim.AUTHOR.json',after)
 viewCAS.append({'normalPath':rel,'beforeWholeFile':pin(p),'before':before,'after':after,'afterFile':pin(afterp),'soleAppendParentId':'chemistry-root','soleAppendedSection':node,'scopeObjectUnchanged':True,'allOtherGoalsAndProjectionRolesUnchanged':True})
write('CAS.two-whole-SH-GK-LK-views.AUTHOR.inactive.json',{'role':'AUTHOR ONLY data placement proposal under owner interim policy','ownerPolicyId':policy['policyId'],'items':viewCAS,'noPersistedThemeSelectorAdded':True,'noNormalViewWrite':True})

mappingCAS=[]
md=H/'curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary'
sourceP=H/'curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_CHEMIE_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json';source=read(sourceP);sourceGoal=next(g for g in source['sourceGoals'] if g['id']==S)
assert sourceGoal['courseLevel']=='GK_LK'
for idx,p in enumerate(sorted(md.glob('sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry*.review.json')),1):
 before=read(p);after=copy.deepcopy(before);old=next(d for d in before['decisions'] if d['sourceGoalId']==S);currentEdges=[m for m in before['mappings'] if m['legacyGoalId']==S]
 assert old['decision']=='unreviewed' and len(old['canonicalGoalIds'])==3 and len(currentEdges)==3
 assert 'cf2631d9-da24-50e8-9e50-db625e6efaad' not in old['canonicalGoalIds']
 d=next(d for d in after['decisions'] if d['sourceGoalId']==S)
 d['source032BeforeAllAuthoredThemesAuthorSuccessor']={'wholeDecision':copy.deepcopy(old),'wholeCurrentEdges':copy.deepcopy(currentEdges),'historicalNotAnApprovalForNewScope':True}
 d['canonicalGoalIds'].append(G)
 d['decision']='unreviewed';d['matchType']='partial'
 d['rationale']='Inactive AUTHOR scope successor. Official SH032 is unchanged: SekII common GK/LK contents within the optional medication theme. The explicit Product Owner interim policy now targets all authored SH themes in both product GK/LK views while theme-selection UX is deferred; this is not an official universal duty or stored learner selection. The complete new3eb whole-goal candidate is added for the process-chain allocation. All three existing partial partners and all prior history remain exact. Whole source approval is not inferred from prior A/M/P/V decisions. Original independent source-A follow-up is required.'
 d['reviewedAt']=datetime.datetime.now(datetime.timezone.utc).isoformat();d['reviewer']='/root/chemie_global145_fresh_exam_review_b_20261016, SOURCE032 SCOPE AUTHOR ONLY; not independent source reviewer'
 d['source032OfficialSourceScope']=copy.deepcopy(official);d['source032InterimSkillPilotTargetPolicy']=copy.deepcopy(policy)
 d['source032RemainingCoverageHold']={'status':'AUTHOR_PROPOSAL_PENDING_ORIGINAL_INDEPENDENT_SOURCE_A_FOLLOWUP','wholeOfficialSourceUnchanged':True,'currentAndPriorHistoryPreserved':True,'newWholeCandidatePartner':G,'keptPartialPartners':old['canonicalGoalIds'],'noSourceScienceReviewerOrApprovalInvented':True,'noAutomaticGateClosures':True}
 after['mappings'].append({'legacyGoalId':S,'canonicalGoalId':G,'matchType':'partial','reviewDecisionId':S})
 beforep=exact(f'mapping/{idx:02d}.before.whole.exact.json',p);afterp=write(f'mapping/{idx:02d}.after.whole.AUTHOR.inactive.json',after)
 mappingCAS.append({'normalPath':str(p.relative_to(H)),'before':pin(beforep),'after':pin(afterp),'source032BeforeWholeDecision':old,'source032AfterWholeDecision':d,'onlyOneWholeDecisionChanged':True,'onlyOneNewPartialCandidateEdge':G,'threeExistingPartialPartnersAndEdgesPreserved':True,'allNestedPriorHistoryExact':True,'decisionStillUnreviewed':True})
write('CAS.two-whole-Source032-mapping-aliases.AUTHOR.inactive.json',{'role':'AUTHOR ONLY; no new source approval or independent reviewer identity','actualSourceExtraction':pin(sourceP),'wholeOfficialSource032':sourceGoal,'ownerPolicyId':policy['policyId'],'items':mappingCAS,'noNormalMappingWrite':True})

historyNames=['FIRST.science.source032.AMPV.frozen.json','HANDOFF.exact-one-goal-independent-AMPV-and-source-scope.json','A.one-current-goal.native.inactive.review.jsonl','M.one-current-goal.native.inactive.review.jsonl','P-v2.one-current-goal.native.inactive.json','P-v2.one-current-goal.native.inactive.review.jsonl','V.one-current-PNG.native.inactive.qa.json','ADDENDUM.actual-SH-selected-theme-scope-activation-LIMIT.no-new-vote.json']
hist=[]
for name in historyNames:
 p=HIST/name;d=exact('history/prior-AMPV/'+name,p);hist.append({'original':pin(p),'exactHistoricalCopy':pin(d)})
material=OLD/'materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.AUTHOR.inactive.json';mp=exact('materials/TWO.complete-nonisomorphic-DE-EN-cases-and-fresh-transfers.exact-history.json',material)
for rel in ['candidate/WHOLEGOAL.source032-one-coherent-process-chain.AUTHOR.inactive.json','P-v2.whole-fingerprint-bound.AUTHOR.inactive.json','SOURCE.scope-and-operator-binding.AUTHOR.inactive.json','OUTPUTS.finite-one-whole-goal-two-cases-P-and-boundary-CAS.AUTHOR.selector.json','SEAL.AUTHOR-inactive-package.actual.json','ADDENDUM.one-assessment-route-20261016-v1/WHOLEGOAL.one-assessment-endpoint.AUTHOR.inactive.json','ADDENDUM.one-assessment-route-20261016-v1/OUTPUTS.additive-one-assessment-CAS.AUTHOR.selector.json','ADDENDUM.one-assessment-route-20261016-v1/SEAL.additive-assessment-AUTHOR.actual.json']:
 hist.append({'original':pin(OLD/rel),'retainedAsHistoryOnly':True})
imageRoot=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-SH032-one-process-chain-PNG-image-author-20261016-v1'
image=imageRoot/f'candidate/source/visualizations/chemie/{G}/{G}.png';assert pin(image)['sha256']=='sha256:cd665cb625e4768188b89295859a3104851112731c237c2b18884a8933dce79d'
write('HISTORY.actual-prior-AMPV-material-PNG-and-selected-scope-limits.NOT-NEW-VOTES.json',{'role':'Exact historical evidence routing, not new independent decisions or current acceptance','goalId':G,'actualEarlierOrdinaryDecisions':{'A':'KEEP atomic','M':'KEEP no_memory_needed','P':'KEEP ai_candidate needs_human_review E0/G0','V':'Approved AI exact cd665cb... PNG','source':'KEEP_SCOPED only to selected theme, followed by historical activation-scope HOLD'},'assessmentId':A,'noPriorIndependentAMPVForAssessmentClaimed':True,'files':hist,'wholeMaterialsOriginal':pin(material),'wholeMaterialsExactCopy':pin(mp),'actualPNG':pin(image),'rootImageProvenance':pin(imageRoot/'PROVENANCE.original-built-in-PNG-and-inspection-only-sizes.author.json'),'noNewIndependentVote':True})
ledger=read(H/'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
write('INPUTS.finite-actual-H635-and-owner-scope-author.json',{'role':'Finite author inputs, no normal mutation','globalInput':pin(cp),'frozenGlobalInput':pin(base),'currentActualCounts':ledger['counts'],'newOrdinaryGoalPrior':pin(ordinaryPath),'newAssessmentPrior':pin(assessmentPath),'actual6b6Before':boundaryBefore,'actual596Before':terminalBefore,'current596Contains327HELK':True,'actualSourceExtraction':pin(sourceP),'wholeSource032':sourceGoal,'ownerPolicy':policy,'normalWrites':0,'newIndependentVotes':0})
print(json.dumps({'authorRoot':str(O.relative_to(R)),'actualBase':pin(cp)['sha256'],'wholeGoalCAS':4,'wholeViewCAS':2,'wholeMappingCAS':len(mappingCAS),'historyReviews':len(historyNames),'newIndependentVotes':0},indent=2))
