# Apache-2.0. Formats the already manually written review; it does not assign content verdicts.
import pathlib,json,hashlib,collections,datetime
ROOT=pathlib.Path('/home/enpasos/projects/skillpilot')
OUT=ROOT/'tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1'
AUTHOR=ROOT/'tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1'
def sha(b):return 'sha256:'+hashlib.sha256(b).hexdigest()
def fp(o):return sha(json.dumps(o,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode())
def load(p):return json.loads(p.read_bytes())
def binding(p):
    b=p.read_bytes();return {'path':str(p.relative_to(ROOT)),'sha256':sha(b),'bytes':len(b)}
def write(n,o):
    with (OUT/n).open('x',encoding='utf-8') as f:json.dump(o,f,ensure_ascii=False,indent=2);f.write('\n')
assert sha((AUTHOR/'manifest.json').read_bytes())=='sha256:0e8c9b53b86cb3b1a184f14276e187f7d36e3ec850814e2df68dbf15273efec4'
manifest=load(AUTHOR/'manifest.json');ledger=load(AUTHOR/'semantic-role-ownership-scope.author-ledger.final.json')
assert sha((AUTHOR/'semantic-role-ownership-scope.author-ledger.final.json').read_bytes())=='sha256:4ff56b552fd888d88e184cae669f7fab734e461f8fd105b0e8e56753063dc9e4'
pre=load(OUT/'source-full-read.independent-receipt.preseal-v1.json');pre_by_id={r['goalId']:r for r in pre['records']}
tech=load(OUT/'binding-context.independent-reconstruction-v1.json');tech_by_id={r['goalId']:r for r in tech['records']};assert tech['status']=='PASS'
ctx=load(AUTHOR/'full-read-ownership-scope.context.exact.json');ctx_by_id={r['goalId']:r for r in ctx['records']}
segment_packet=load(AUTHOR/'compatibility-segments.author-candidate.json')
notes={}
for subject,file in [('Math','math-content-judgments.independent.tsv'),('Physics','physics-content-judgments.independent.tsv')]:
    for line in (OUT/file).read_text().splitlines():
        if not line or line.startswith('#'):continue
        ordinals,status,reason=line.split('|',2)
        for ordinal in map(int,ordinals.split(',')):
            assert (subject,ordinal) not in notes;notes[subject,ordinal]=(status,reason)
# Explicit independently read structure classifications. Empty topic headings
# remain navigational group candidates; all program IDs were individually read.
program_ordinals={'Math':{48,100,208,332,333},'Physics':{36,79,132,205,206}}
source_docs={p:load(ROOT/p) for p in {e['sourcePath'] for e in ledger['entries']}}
goal_by_id={g['id']:g for d in source_docs.values() for g in d['goals']}
membership=collections.defaultdict(list);segments=[];all_heads=[]
for s in segment_packet['segments']:
    for gid,title in zip(s['literalHeadingIds'],s['literalHeadingTexts']):
        assert goal_by_id[gid]['title']==title;all_heads.append(gid)
    member_set=set()
    def walk(gid):
        if gid in member_set:return
        member_set.add(gid)
        for child in goal_by_id[gid].get('contains',[]):walk(child)
    for gid in s['literalHeadingIds']:walk(gid)
    assert member_set==set(s['memberGoalIds'])
    for gid in member_set:membership[gid].append(s['authorSegmentKey'])
    segments.append({'authorSegmentKey':s['authorSegmentKey'],'exactAuthorSegmentSha256':fp(s),'literalHeadingGoalIds':s['literalHeadingIds'],'literalHeadingTitles':s['literalHeadingTexts'],'literalYears':s['yearTokens'],'literalProfileTokens':s['profileAbbreviationsLiteral'],'literalRoute':s['routeLabelLiteral'],'literalSelectionMarker':s['selectionMarkerLiteral'],'actualContainsClosureIds':sorted(member_set),'literalFactsGate':'PASS','normativeCompatibilityGate':'pending','rationale':'The named tokens and actual local subtree place these exact descriptions. They do not prove legal branch entitlements, stage, scope expansion, paired-subject universal prerequisites, or a same-year dependency rule.'})
assert len(all_heads)==len(set(all_heads))==101 and len(segments)==21
assert set(segment_packet['unplacedGoalIds'])==set(goal_by_id)-set(membership)
for comparison in segment_packet['sameYearLiteralContextComparisons']:
    assert comparison['normativeCompatibilityApproved'] is False and comparison['requiresConclusion'] is None
entries=[]
for e in ledger['entries']:
    subject='Math' if e['sourcePath'].endswith('/Mathematik.json') else 'Physics';ordinal=e['sourceIndex']+1
    g=source_docs[e['sourcePath']]['goals'][e['sourceIndex']];read=pre_by_id[e['goalId']];actual=tech_by_id[e['goalId']]
    assert fp(g)==e['fullGoalSha256']==read['fullGoalSha256']
    assert read['actualFullDescriptionRead'] is True and read['wholeTitleRead'] is True
    if g.get('description'):
        status,reason=notes[subject,ordinal]
        proposed=e['semanticRoleAuthorCandidate']
        role={'orientation':'orientation_intent_candidate','admin_content_fragment':'content_fragment_due_to_missing_source_payload','broad_outcome_requires_split':'assessable_broad_outcome_candidate','assessable_narrow_atomic_candidate':'assessable_narrow_goal_candidate'}[proposed]
        if status!='PASS':role='assessable_outcome_with_open_granularity_or_content_limit'
    else:
        assert g.get('contains')
        status='PASS';role='program_hull' if ordinal in program_ordinals[subject] else 'navigational_fach_cluster'
        child_titles=[goal_by_id[gid]['title'] for gid in g.get('contains',[])]
        if role=='program_hull':
            reason=f"The empty-description node '{g['title']}' actually groups {len(child_titles)} titled children: "+'; '.join(child_titles)+'. These are program/year or landscape placements, not a separately assessed subject-mastery claim.'
        else:
            reason=f"The full empty-description heading '{g['title']}' contains {len(child_titles)} actual content descendants/subgoals. It supplies subject navigation and topic scope; its children, rather than an unstated aggregate performance, carry the assessable claims."
    subject_pending=(subject=='Math' and ordinal in {188,189,190,191,192,327,328,329,330,331}) or (subject=='Physics' and ordinal in {20,55,85})
    unique_owner=len(actual['exactOwnerOccurrences'])==1
    blockers=['exact_official_source_binding_and_provenance','legal_stage_and_branch_placement','any_alias_claim','requires_universal_necessity_not_decided','native_D_P_A_M_V_M7_and_host_acceptance_not_decided']
    if g.get('description') and role not in {'orientation_intent_candidate','content_fragment_due_to_missing_source_payload'}:blockers.append('native_atomicity_and_complete_assessment_boundary')
    if status=='needs_revision':blockers.append('exact_author_classification_or_rationale_needs_revision')
    if not unique_owner:blockers.extend(['shared_stable_id_authoritative_owner','global_cross_school_orientation_inheritance_semantics'])
    if subject_pending:blockers.append('actual_subject_and_nonexclusive_owner_scope')
    if ordinal==2:blockers.append('orientation_wording_and_non_graded_followup_closure')
    if subject=='Math' and ordinal==250:blockers.append('local_missing_three_integrand_payloads_not_repaired')
    if subject=='Math' and ordinal==306:blockers.append('Cramer_singular_case_cardinality_and_source_precision')
    if subject=='Physics' and ordinal in {13,144}:blockers.append('energy_only_does_not_fix_general_time_location_law')
    if subject=='Physics' and ordinal==169:blockers.append('coherence_statement_for_actual_emission_sources_requires_precision')
    if subject=='Math' and ordinal in {36,109,110,114,115,118,141,142,146,147,150}:blockers.append('original_exponent_typography_and_exact_function_form')
    entries.append({'goalId':e['goalId'],'sourcePath':e['sourcePath'],'sourceIndexZeroBased':e['sourceIndex'],'sourceOrdinalOneBased':ordinal,'sourceFileSha256':e['sourceFileSha256'],'fullGoalSha256':e['fullGoalSha256'],'fullDescriptionPairSha256':e['fullDescriptionSha256'],'exactAuthorEntrySha256':fp(e),'exactAuthorRole':e['semanticRoleAuthorCandidate'],'independentCandidateRole':role,'candidateClassificationGate':status,'individualScientificRationale':reason,'actualFullGermanTextAndAnyPresentEnglishRead':True,'readWitnessRecordSha256':fp(read),'localDirectRequires':g.get('requires',[]),'localContains':g.get('contains',[]),'localEffectiveRequires':read['localEffectiveRequiresWithPerStepStableIdSelfExclusion'],'globalEffectiveRequires':actual['globalEffectivePrerequisites'],'globalOriginContextRecordSha256':fp(actual),'authorLiteralScopeContextsSha256':fp(e['literalScopeContext']),'actualLiteralAncestorHeadings':read['literalTopicAncestors'],'actualLocalSegmentKeys':membership[e['goalId']],'literalScopeGate':'PASS','normativeSourceScopeGate':'pending','subjectInterpretationGate':'pending' if subject_pending else 'PASS_as_nonexclusive_content_interpretation','exclusiveSubjectOwnerApproved':False,'exactOwnerOccurrenceFactsGate':'PASS','authoritativeOwnerSelectionGate':'single_actual_occurrence_observed_only' if unique_owner else 'pending','observedOwnerOccurrenceBindings':actual['exactOwnerOccurrences'],'exactSourceGoalBindingGate':'pending','sourceRecoveryAddendumRef':'integral-source-recovery.independent-addendum-v1.json' if subject=='Math' and ordinal==250 else None,'granularityGate':'pending' if g.get('description') else 'navigation_or_program_only','mandatorySplitApproved':False,'wholeNamedGoalUniversallyNecessaryRequiresApproved':False,'requiresGate':'pending','nativeQualityGate':'pending','adoptionGate':'pending','blockers':blockers,'activeGraphOrQaChanged':False})
assert len(entries)==539 and len({x['goalId'] for x in entries})==539
count=collections.Counter(x['candidateClassificationGate'] for x in entries)
counts={'reviewedIndividualGoalIds':539,'candidateClassificationAccepted':count['PASS'],'candidateClassificationNeedsRevision':count['needs_revision'],'allLiveAdoptionPending':539,'structuralNavigationClusters':101,'programHulls':10,'orientationIntentCandidates':2,'unrepairedLocalContentFragment':1,'assessmentContentCandidates':425,'narrowAtomicityApproved':0,'nativeQualityApprovals':0,'requiresApprovals':0,'authoritativeOwnerChoicesMade':0,'actualLiteralTopicHeadings':101,'actualLiteralAggregateSegments':21,'sharedStableIdsWithUnresolvedOwner':2}
freshness=[]
for row in manifest['sealedArtifacts']+manifest['frozenInputFiles']:
    b=(ROOT/row['path']).read_bytes();current=sha(b);assert current==row['sha256'];assert 'bytes' not in row or len(b)==row['bytes']
    freshness.append({'path':row['path'],'expectedSha256':row['sha256'],'currentSha256':current,'bytes':len(b),'matches':True})
assert sha((AUTHOR/'manifest.json').read_bytes())=='sha256:0e8c9b53b86cb3b1a184f14276e187f7d36e3ec850814e2df68dbf15273efec4'
common={'schemaVersion':1,'reviewerAgent':'/root/requires_canonical_review','reviewerRole':'INDEPENDENT_REVIEWER','model':'gpt-6.1-sol','reasoningEffort':'ultra','recordedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'authorAgent':'/root/physics_pending5_revision','authorChildRole':'AUTHOR; /root/physics_pending5_revision/by_fos_physics_content_author is not an independent reviewer','exactAuthorManifest':binding(AUTHOR/'manifest.json'),'exactAuthorPrimaryLedger':binding(AUTHOR/'semantic-role-ownership-scope.author-ledger.final.json')}
review={**common,'artifactId':'by-fos-539-independent-semantic-owner-scope-review-v1','status':'complete_independent_inert_candidate_audit_live_adoption_pending','counts':counts,'meaningOfAcceptance':'PASS accepts only the specified inert classification/content interpretation or literal/occurrence fact. It does not accept the broad role suffix as an actual mandatory split, a stable-ID alias, a universal prerequisite, a current semantic registry, native goal quality, or learner-scope/host publication. Each candidate needs a separately source-bound granularity and native assessment decision.','overallGates':{'exactPackageAndCurrentSourceBindings':'PASS','all539ActualDescriptionReadsAndIndividualJudgments':'PASS','actualDirectAndContainsInheritedContext':'PASS','literal101HeadingAnd21SegmentFacts':'PASS','normativeLegalScope':'pending','individualCandidateRoleTriage':f"{count['PASS']} accepted; {count['needs_revision']} revision-needed",'completeAtomicGranularity':'pending','exactUniversalMathPhysicsRequires':'pending','sharedOrientationOwner':'pending','nativeQualityAndLiveAdoption':'pending'},'crossCuttingScientificFindings':[{'finding':'A program hull, empty topic navigation cluster and motivational orientation are different from assessable content. No leaf-to-atomic or filename-to-owner rule was used.'},{'finding':'A calculation plus its meaning or result check may be one target. Several displays and alternative methods do not themselves prove a mandatory split. Revision entries identify constructive coherent routes rather than weakening evidence.'},{'finding':'Math project processes have assessable intent but no specified mathematical object. Interdisciplinary context does not automatically prove a separate subject owner or universal outside-subject prerequisite.'},{'finding':'The two shared motivators have exactly equal current full definitions across 6 Math and 3 Physics documents. Their global contains inheritance draws in unrelated school overview orientations; this is an owner/scope modeling debt. Reused landscapeId alone is not proof of a runtime collision.'},{'finding':'Ordinary FOS content inherits only the FOS overview marker plus its own subject orientation. It does not inherit the shared motivator\'s other-school prerequisites transitively through requires, and mastery of Physics never grants Math mastery.'},{'finding':'M306 determinant-zero counterexample is a content/source-precision gap; Cramer\'s nonzero case cannot decide inconsistent versus infinite singular systems.'},{'finding':'Math zero-based249/one-based250 remains a malformed local integrand fragment. Separate visual/DOM-bound source recovery confirms the three families and printed 2019/20 validity, without rewriting the sealed ledger or granting atomicity/edges.'},{'finding':'Literal Vorklasse/Vorkurs/Additum/optional/verpflichtend/erweiterndes Wahlplichtfach and ABU/G/S/W/GH/IW/T are preserved. No legal expansion, stage assignment, same-year sequence or all-profile pairing is inferred.'}],'segments':segments,'entries':entries,'boundary':{'activeFilesChanged':False,'requiresOrContainsChanged':False,'newNativeApprovals':False,'hostAcceptanceClaimed':False,'runtimeCollisionProved':False,'sourceOrThirdPartyRightsAccepted':False,'authorHistoryRebound':False},'licensing':{'technicalBindingsAndSchema':'Apache-2.0','ownDidacticJudgments':'CC-BY-4.0','sourceTexts':'Existing third-party rights retained. Source/authenticity/redistribution approval is not fabricated.'}}
write('semantic-owner-scope.independent-review-v1.json',review)
receipt={**common,'artifactId':'by-fos-539-independent-full-read-final-receipt-v1','status':'complete_actual_read_and_manual_judgment_receipt','presealActualReadReceipt':binding(OUT/'source-full-read.independent-receipt.preseal-v1.json'),'actualOriginalSourceReadRanges':pre['actualReadRanges'],'originalFullGermanDescriptionFieldsRead':539,'existingEnglishDescriptionsActuallyRead':2,'missingEnglishDescriptionsNotInvented':537,'sealedAuthorIndividualReasonAndPotentialAssessmentUnitsReadRanges':{'MathOneBased':['1–80','81–165','166–250','251–333'],'PhysicsOneBased':['1–70','71–140','141–206']},'borderlineActualOriginalTextRereads':{'MathOneBased':[64,99,103,104,106,110,131,158,172,185,192,195,215,242,243,244,247,257,286,290,293,306,314,325],'PhysicsOneBased':[5,13,16,19,20,28,41,47,55,72,74,75,76,78,93,94,95,98,104,109,113,120,124,127,130,136,144,163,164,169,170,174,181,185,186,190,195,201,202,203]},'all101LiteralHeadingsAnd21AggregateScopesActuallyRead':True,'manualMathJudgmentNotes':binding(OUT/'math-content-judgments.independent.tsv'),'manualPhysicsJudgmentNotes':binding(OUT/'physics-content-judgments.independent.tsv'),'independentGraphReconstruction':binding(OUT/'binding-context.independent-reconstruction-v1.json'),'separateOfficialFormulaVisualRead':binding(OUT/'integral-source-recovery.independent-addendum-v1.json'),'ownScientificReview':binding(OUT/'semantic-owner-scope.independent-review-v1.json'),'hashingIsNotScientificReview':True,'authorContributorsNotCountedAsReviewers':True,'authority':'AI independent candidate review only','license':'Apache-2.0'}
write('full-read-and-review.independent-receipt-v1.json',receipt)
write('final-binding-freshness.independent-receipt-v1.json',{**common,'artifactId':'by-fos-final-independent-binding-freshness-v1','status':'PASS','sealedAuthorArtifactsRechecked':23,'frozenInputsRechecked':558,'currentDriftCount':0,'checks':freshness,'checksAreTechnicalOnly':True,'activeFilesChanged':False,'license':'Apache-2.0'})
artifacts=[binding(p) for p in sorted(OUT.iterdir()) if p.is_file()]
index={**common,'artifactId':'by-fos-independent-review-manifest-v1','status':'sealed_additive_independent_candidate_review_no_active_adoption','counts':counts,'artifacts':artifacts,'artifactCount':len(artifacts),'reviewManifestEntryPoint':'semantic-owner-scope.independent-review-v1.json','formulaRecoveryEntryPoint':'integral-source-recovery.independent-addendum-v1.json','authorInputBytesPreserved':True,'allOriginal558FrozenInputsExactAtFinalSeal':True,'originalSourceAndAuthorFilesChanged':False,'licensing':{'technicalMetadata':'Apache-2.0','ownDidacticJudgments':'CC-BY-4.0','thirdPartyOriginals':'Unchanged original rights; full official HTML/SVG/PNG remains only in tmp, no redistribution acceptance.'}}
write('manifest.independent-review-v1.json',index)
print(json.dumps({'counts':counts,'outputs':[binding(OUT/n) for n in ['semantic-owner-scope.independent-review-v1.json','full-read-and-review.independent-receipt-v1.json','final-binding-freshness.independent-receipt-v1.json','integral-source-recovery.independent-addendum-v1.json','manifest.independent-review-v1.json']]},ensure_ascii=False,indent=2))
