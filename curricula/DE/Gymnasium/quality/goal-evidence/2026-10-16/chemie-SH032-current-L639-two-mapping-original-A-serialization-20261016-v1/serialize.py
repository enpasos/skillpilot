from pathlib import Path
import json, hashlib, copy, datetime
R=Path.cwd(); E=R/'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O=Path(__file__).resolve().parent
L=R/'tmp/chemie-m7-resumed-20261016/chemie-combined639-current-native-review-capsule-v1'
A=E/'chemie-SH032-all-authored-interim-original-a-informed-followup-20261016-v1'
U=E/'chemie-SH032-all-authored-themes-interim-scope-author-successor-20261016-v1'
S='de-sh-chemie-sekii-fachanforderungen-2022-3-2-chemie-der-funktionalen-stoffe-und-materialien-032-74ed63ca'
G='3eb2a06c-d283-57aa-9eb4-088940c4801a'
C='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
X='curricula/DE/Gymnasium/input/SH/upper-secondary/source-extraction/DE_SH_CHEMIE_SEKII_FACHANFORDERUNGEN_2022.source-extraction.json'
paths=['curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.m7-micelle-correction-20261012-v1.review.json','curricula/DE/Gymnasium/mapping/DE-SH/upper-secondary/sh_chemistry_upper_secondary_source_extraction_to_canonical_chemistry.review.json']
def sha(b): return 'sha256:'+hashlib.sha256(b).hexdigest()
def read(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(R))
def pin(p): return {'path':rel(p),'sha256':sha(p.read_bytes()),'bytes':p.stat().st_size}
def objfp(v): return sha(json.dumps(v,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode())
def write(n,v):
 p=O/n
 if p.exists(): assert read(p)==v,str(p)+' existing content differs'
 else: p.write_text(json.dumps(v,ensure_ascii=False,indent=2)+'\n')
 return p
now=read(O/'FIRST.read-science-before-serialization.actual.json')['createdAtUtc'] if (O/'FIRST.read-science-before-serialization.actual.json').exists() else datetime.datetime.now(datetime.timezone.utc).isoformat()
f=A/'FIRST.original-a-informed-all-authored-interim-source032.scope.frozen.json';p=A/'POST-FIRST.exact-successor-bindings-history-and-finite-CAS.json';z=A/'SEAL.original-a-informed-scope-successor.actual.json'
assert sha(f.read_bytes())=='sha256:1cf09828c52014467d2ec849984b93e5345015142fc5de5c4f526655c23fcef0'
assert sha(p.read_bytes())=='sha256:e5651a4cc200db7cddbf7b979f46e37a202777f38a319413862ecec4cf345354'
assert sha(z.read_bytes())=='sha256:5f512e023fb17a128dff6ae527ac0ec6dc183d31ddc7c5b532c5ee05ef77bc32'
science=read(f); post=read(p); seal=read(z)
assert science['wholeSource032Allocation']['wholeCarrierGoalId']==G
assert science['wholeSource032Allocation']['decision']=='KEEP_WHOLE_COVERAGE_UNDER_INTERIM_OWNER_SCOPE'
assert not science['wholeSource032Allocation']['blockingSourceScienceFindings']
assert sha((L/C).read_bytes())=='sha256:0c4277b9bc9ec90740dbe5b885e35cbbde777c488518252d623ce09b044b3cf9'
canonical=read(L/C); goal=next(g for g in canonical['goals'] if g['id']==G)
assert goal==read(U/'candidate/WHOLEGOAL.3eb-ordinary.all-authored-interim.AUTHOR.json')
source=read(L/X); sg=next(g for g in source['sourceGoals'] if g['id']==S)
assert sg['courseLevel']=='GK_LK' and 'stage:SekII' in sg['tags']
assert sg['sourceText']=='exemplarische Betrachtung mindestens einer Wirkstoffgruppe: Forschung und Entwicklung, Herstellung im Labor und großtechnische Produktion, Vermarktung'
write('FIRST.read-science-before-serialization.actual.json',{'recordKind':'Technical serialization only, following actual whole original-A science read; no author or independent science vote','createdAtUtc':now,'scienceReadFirst':[pin(f),pin(p),pin(z)],'scientificDecisionVerbatim':science['wholeSource032Allocation'],'officialSourceAndOwnerPolicyVerbatim':science['ownerPolicy'],'remainingSeparateGatesVerbatim':science['remainingSeparateGates'],'scientificVoteAuthor':science['reviewer'],'serializationActor':'/root/chemie_global145_fresh_exam_review_b_20261016; technical serialization only','newScienceVotes':0,'normalWrites':0,'HumanApproval':False,'HumanTrial':False})
bind={'sourceExtraction':pin(L/X),'sourceGoalId':S,'sourceGoalWholeObjectFingerprint':objfp(sg),'fingerprintContract':'sha256 of whole JSON object serialized recursively with sorted keys, UTF-8, ensure_ascii=false, separators comma/colon, no trailing newline; exact sourceText/course/tags included; technical binding only, not a source-science vote','sourceTitleExact':sg['title'],'sourceTextExact':sg['sourceText'],'sourceRefExact':sg['sourceRef'],'sourceCourseLevelExact':sg['courseLevel'],'sourceStageExact':'SekII','sourceTagsExact':sg['tags'],'sourcePagesReviewed':[69,71],'canonicalLandscape':pin(L/C),'canonicalGoalId':G,'canonicalGoalWholeObjectFingerprint':objfp(goal),'exactReviewedAuthorWholeGoal':pin(U/'candidate/WHOLEGOAL.3eb-ordinary.all-authored-interim.AUTHOR.json'),'canonicalBodyEqualsIndependentlyReviewedAuthorWholeGoal':True,'scientificAuthority':{'reviewer':science['reviewer'],'reviewedAt':science['createdAtUtc'],'science':pin(f),'postBinding':pin(p),'seal':pin(z),'decision':science['wholeSource032Allocation']['decision'],'fullOperatorReasoningVerbatim':science['wholeSource032Allocation']['fullOperatorReasoning'],'edgeSemanticsVerbatim':science['wholeSource032Allocation']['edgeSemantics']},'sourceAndProductScopeDistinct':True,'officialThemeOptional':True,'officialContentsBindingWhenThemeSelected':True,'interimOwnerAllAuthoredThemesTargetGKAndLK':True,'persistedLearnerThemeSelectionClaimed':False,'officialUniversalMedicationThemeDutyClaimed':False,'assessment699NotASourceCarrier':True,'normalIntegrationNotPerformed':True,'newScienceVotes':0}
write('BINDING.actual-source032-whole-source-goal-canonical-and-original-A.json',dict(bind,wholeSourceGoalExact=sg,wholeCanonicalGoalExact=goal))
ops=[]; checks=[]
for i,normal in enumerate(paths,1):
 before=read(L/normal); authorbefore=read(U/f'mapping/{i:02}.before.whole.exact.json'); authored=read(U/f'mapping/{i:02}.after.whole.AUTHOR.inactive.json')
 assert before==authorbefore and (L/normal).read_bytes()==(U/f'mapping/{i:02}.before.whole.exact.json').read_bytes()
 beforep=O/f'{i:02}.before.whole.actual-L639.exact.json'
 if beforep.exists(): assert beforep.read_bytes()==(L/normal).read_bytes()
 else: beforep.write_bytes((L/normal).read_bytes())
 after=copy.deepcopy(authored); old=next(d for d in before['decisions'] if d['sourceGoalId']==S);d=next(d for d in after['decisions'] if d['sourceGoalId']==S);authordecision=copy.deepcopy(d)
 oldedges=[e for e in before['mappings'] if e.get('legacyGoalId')==S];authoredges=[e for e in authored['mappings'] if e.get('legacyGoalId')==S]
 assert after['mappings'][:-1]==before['mappings']
 assert after['mappings'][-1]=={'legacyGoalId':S,'canonicalGoalId':G,'matchType':'partial','reviewDecisionId':S}
 d['source032HistoricalAuthorProposalBeforeIndependentMappedSerialization']={'wholeDecision':authordecision,'wholeSourceEdges':authoredges,'role':'Immutable inactive-author predecessor; preserved complete including its reviewer identity and pending hold, not current approval'}
 d['decision']='mapped';d['reviewer']=science['reviewer'];d['reviewedAt']=science['createdAtUtc']
 d['rationale']='Original independent A explicitly KEEP-reviewed the complete unchanged SH032 operator under the owner-authorized interim all-authored SH GK/LK target. New3eb itself carries the connected exemplary salicylate research/development, laboratory-versus-industrial manufacture and marketing chain in two supplied nonisomorphic cases with changed-finding feedback. The three retained partners remain limited partial contributions, and all four mapping edges remain partial: no exact-text equivalence or retroactive upgrade is claimed. Official medication-theme optionality and binding contents when selected remain separate from the broader interim SkillPilot target; no persisted learner choice or universal official medication duty is asserted. Actual source/canonical whole-object bindings, full operator reasons and the existing independent A science are explicit below. Wrong BYcf2631 remains history-only. This is faithful technical serialization of that existing source-content decision; it creates no new A/M/P/V/D vote or assessment699 approval.'
 d['source032RemainingCoverageHold']={'status':'RESOLVED_FOR_EXACT_WHOLE_SOURCE032_UNDER_INDEPENDENT_A_INTERIM_TARGET_REVIEW','wholeOfficialSourceUnchanged':True,'wholeCarrierGoalId':G,'retainedPartialPartners':old['canonicalGoalIds'],'oldHoldAndAllReviewsPreservedInWholeHistory':True,'scientificAuthorityFirst':pin(f),'historicalStoredSelectionActivationHoldSupersededOnlyForExplicitOwnerInterimTarget':True,'noUniversalOfficialDuty':True,'noPersistedLearnerSelection':True,'remainingSeparateGatesVerbatim':science['remainingSeparateGates'],'noOtherSourceDecisionReapproved':True,'newScienceVotes':0}
 d['source032CurrentIndependentSourceBinding']=copy.deepcopy(bind)
 after['status']['source032StatusBeforeMappedSerialization']=copy.deepcopy(before['status'])
 for k,val in [('reviewedSourceGoals',165),('mappedSourceGoals',165),('unreviewedSourceGoals',0)]: after['status'][k]=val
 after['status']['notes']='Source032 is mapped by the existing original independent A whole-source KEEP under the owner-authorized interim all-authored SH GK/LK target. Its unchanged optional official theme remains optional. Three prior partial partners, the new3eb partial edge and all whole predecessor reviews/edges are retained. Prior whole status including older provisional notes is preserved under source032StatusBeforeMappedSerialization. Other current decisions are exact and are not reapproved by this serialization. No assessment699 or whole M7/human release is claimed.'
 ap=write(f'{i:02}.after.whole.original-A-bound.inactive.json',after)
 assert [x for x in after['decisions'] if x['sourceGoalId']!=S]==[x for x in before['decisions'] if x['sourceGoalId']!=S]
 assert d['canonicalGoalIds']==old['canonicalGoalIds']+[G]
 assert d['source032HistoricalAllocationBeforeBYPracticumCorrection']==old['source032HistoricalAllocationBeforeBYPracticumCorrection']
 assert d['source032BeforeAllAuthoredThemesAuthorSuccessor']['wholeDecision']==old
 assert d['source032BeforeAllAuthoredThemesAuthorSuccessor']['wholeCurrentEdges']==oldedges
 assert d['source032OfficialSourceScope']==authordecision['source032OfficialSourceScope']
 assert d['source032InterimSkillPilotTargetPolicy']==authordecision['source032InterimSkillPilotTargetPolicy']
 checks.append({'normalPath':normal,'actualBeforeEqualsApprovedAuthorBeforeBytes':True,'wholeOtherDecisionsExact':True,'allOldMappingEdgesExactPrefix':True,'newEdgesExactlyOne':after['mappings'][-1:],'threeOldPartialPartnersExact':True,'allFourCurrentEdgesPartial':all(e['matchType']=='partial' for e in authoredges),'allOldHistoricalBYBodiesExact':True,'wholeCurrentBeforeDecisionAndThreeEdgesExactInHistory':True,'wholeInactiveAuthorDecisionAndFourEdgesExactInHistory':True,'officialAndOwnerScopeObjectsExactToReviewedAuthor':True,'sourceSpanAndTopicExact':d['sourceSpan']==old['sourceSpan'] and d['topicCode']==old['topicCode'],'onlySource032DecisionChanged':True,'wholeAfterDecision':'mapped','newIndependentVotes':0})
 ops.append({'operation':'compare-and-swap-whole-mapping-file','normalPath':normal,'before':pin(beforep),'after':pin(ap),'beforeWholeFileSha256':sha((L/normal).read_bytes()),'condition':'Exact actual L639 input only; refuse any before-file drift. Inactive proposal; no normal write performed.','changedSourceGoalIds':[S]})
write('CAS.two-whole-Source032-mappings.actual-L639.original-A-bound.inactive.json',{'recordKind':'Finite technical serialization CAS proposal; original independent source-A science exists separately','createdAtUtc':now,'baseCanonical':pin(L/C),'baseCapsulePath':rel(L),'scientificAuthority':bind['scientificAuthority'],'operations':ops,'newScienceVotes':0,'normalWrites':0,'GitActions':0,'HumanApproval':False,'HumanTrial':False})
write('CHECKS.structural-history-source-bindings.actual.json',{'baseCanonical':pin(L/C),'canonicalGoals':len(canonical['goals']),'exactSourceBinding':bind,'aliases':checks,'unsupportedSourceFindings':[],'sourceGoalAndCanonicalGoalUnchanged':True,'newScienceVotes':0,'normalWrites':0})
print(json.dumps({'root':rel(O),'maps':len(ops),'wholeBeforeAfterWritten':True,'scienceFirst':sha(f.read_bytes()),'canonical':sha((L/C).read_bytes())}))
