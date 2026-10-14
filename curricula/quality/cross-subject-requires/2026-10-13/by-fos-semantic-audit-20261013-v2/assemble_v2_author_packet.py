# SPDX-License-Identifier: Apache-2.0
"""Apply precisely 40 bounded author responses; preserve all other entry objects."""
import copy,datetime,hashlib,json
from collections import Counter
from pathlib import Path
R=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v2')
V1=Path('tmp/cross-subject-requires/by-fos-semantic-audit-20261013-v1')
P=Path('tmp/cross-subject-requires/by-fos-semantic-independent-review-20261013-v1')
read=lambda p:json.loads(Path(p).read_text())
sha=lambda p:'sha256:'+hashlib.sha256(Path(p).read_bytes()).hexdigest()
fp=lambda x:'sha256:'+hashlib.sha256(json.dumps(x,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def write(name,o):
    with (R/name).open('x')as f:f.write(json.dumps(o,ensure_ascii=False,indent=2)+'\n')
oldpath=V1/'semantic-role-ownership-scope.author-ledger.final.json';old=read(oldpath)
peerpath=P/'semantic-owner-scope.independent-review-v1.json';peer=read(peerpath);peers={e['goalId']:e for e in peer['entries']}
mathpath=R/'math-21-response.author.json';math=read(mathpath)
physpath=R/'physics-40-response.author.json';phys=read(physpath)
assert sha(physpath)=='sha256:025371df3016bbefbb678345451adf4f349e08c2fd0104459059e14276b2a6fb'
responses={};register=[]
for path,d in [(mathpath,math),(physpath,phys)]:
    for case in d['entries']:
        gid=case['goalId'];assert gid not in responses
        responses[gid]=(path,case)
assert len(responses)==40 and set(responses)=={e['goalId']for e in peer['entries']if e['candidateClassificationGate']=='needs_revision'}
new=copy.deepcopy(old);new['schemaVersion']=2;new['artifactId']='by-fos-semantic-audit-20261013-v2-author-role-ledger';new['status']='fresh_inert_author_v2_unreviewed'
new['createdAt']=datetime.datetime.now(datetime.timezone.utc).isoformat()
new['authorContributors'].append({'agent':phys['authorAgent'],'role':'AUTHOR','independenceClaim':False})
unchanged=[];revisions=[]
protected_fields=['goalId','sourcePath','sourceIndex','sourceFileSha256','fullGoalSha256','fullDescriptionSha256','originalTitle','originalDescription','originalDescriptionEn','technicalLeafObserved','contextPath','contextFileSha256','contextRecordSha256','selectedOccurrenceKey','selectedOccurrenceSha256','inventoryAuthoritativeOwner','definitionStatus','actualOwnerOccurrences','currentDirectRequiresObserved','currentDirectContainsObserved','currentEffectivePrerequisitesObserved','currentEffectivePrerequisiteSetSha256','currentEffectiveOriginsSha256','fullOriginPathWitnessPath','fullOriginPathWitnessSha256','fullOriginPathRecordSha256','literalScopeContext','authorCompatibilitySegmentKey','authoredSourceState','stageApplicability','englishDescriptionFieldPresent','activeRegistryWritten','requiresApprovalMade','authoritativeOwnerChosen','nativeM7Status']
for i,e in enumerate(new['entries']):
    original=old['entries'][i];p=peers[e['goalId']]
    if e['goalId']not in responses:
        assert p['candidateClassificationGate']=='PASS'and e==original
        unchanged.append({'goalId':e['goalId'],'sourcePath':e['sourcePath'],'sourceIndex':e['sourceIndex'],'exactOriginalEntrySha256PythonCodePoint':fp(original),'exactV2EntrySha256PythonCodePoint':fp(e),'exactV1PeerFindingSha256PythonCodePoint':fp(p),'v1PeerTriageGate':'PASS','meaning':'499 unchanged inert candidate interpretations only; no native atomicity, source/scope, owner or requires approval carried over.'})
        continue
    path,c=responses[e['goalId']];is_math=e['sourcePath'].endswith('Mathematik.json')
    assert fp(c['fullCurrentGoal'])==e['fullGoalSha256']
    if is_math:
        role=c['newSemanticRole'];subject=c['newActualSubject'];reason=c['individualContentReason'];units=c['retainedLearnerEvidence'];bounds=c['remainingOpenBoundaries'];witness=c['fullRereadWitness'];author=c['authorAgent'];outcome=c['candidateCoherentOutcomeReadingNotActiveGoalText'];critique=c['exactV1PeerFinding'];original_case=c['exactV1AuthorEntry'];response=c['responseToExactPeerFinding'];specific='Cramer singular-system cardinality is not determined by determinant alone.'if e['sourceIndex']==305 else'Original mathematical notation/domain/regularity needs precision.'if e['sourceIndex']in [109,141,214,324]else None
    else:
        role=c['semanticRoleAuthorCandidate'];subject=c['actualSubject'];reason=c['individualContentReason'];units=c['potentialAssessmentUnitsAuthorNotes'];bounds=c['remainingGranularityOrContentBoundsAuthorNotes'];witness=c['fullReadWitness'];author=c['authorAgent'];outcome=c['cohesivePhysicsOutcomeAuthorCandidate'];critique=c['exactIndependentV1PeerEntry'];original_case=c['exactV1AuthorLedgerEntry'];response=c['individualPeerResponse'];specific=c['specificContentBlocker']
    assert original_case==original and critique==p
    e['actualSubject']=subject;e['semanticRoleAuthorCandidate']=role;e['individualContentReason']=reason
    e['potentialAssessmentUnitsAuthorNotes']=units;e['granularityGapsAuthorNotes']=bounds
    e['authorAgent']=author;e['authorInputPath']=str(path);e['authorInputSha256']=sha(path);e['authorInputEntrySha256']=fp(c);e['fullReadWitness']=witness
    e['blockers']=[b for b in e['blockers']if b['kind']!='granularity_gap']
    e['blockers'].append({'kind':'native_content_boundary_pending','detail':' '.join(bounds)})
    if specific:e['blockers'].append({'kind':'concrete_content_precision_or_model_gap','detail':specific})
    e['v2ResponseOnExactPeerFinding']={'responseInputPath':str(path),'responseInputSha256':sha(path),'responseCaseSha256PythonCodePoint':fp(c),'v1AuthorEntrySha256PythonCodePoint':fp(original),'v1PeerEntrySha256PythonCodePoint':fp(p),'exactPeerRationale':p['individualScientificRationale'],'individualAuthorResponse':response,'candidateCoherentOutcomeReadingNotActiveGoalText':outcome,'retainedLearnerEvidenceAuthorNotes':c['retainedLearnerEvidence']if is_math else c['learnerPhysicsEvidenceRequiredAuthorNotes'],'remainingOpenBoundariesAuthorNotes':bounds,'mandatorySplitApproved':False,'nativeAtomicityApproved':False,'requiresApproved':False,'sourceApproved':False,'scopeApproved':False,'ownerChosen':False,'independentV2ReviewCompleted':False,'specificContentBlocker':specific}
    if not is_math:e['subjectInterpretationQualifier']=c['subjectInterpretationQualifier']
    for field in protected_fields:assert e[field]==original[field],(e['goalId'],field)
    changed=[k for k in sorted(set(e)|set(original))if e.get(k)!=original.get(k)]
    register.append({'goalId':e['goalId'],'sourcePath':e['sourcePath'],'sourceIndexZeroBased':e['sourceIndex'],'sourceOrdinalOneBased':e['sourceIndex']+1,'exactPeerFinding':p,'exactPeerFindingSha256PythonCodePoint':fp(p),'exactOriginalV1EntrySha256PythonCodePoint':fp(original),'exactFinalV2EntrySha256PythonCodePoint':fp(e),'oldRole':original['semanticRoleAuthorCandidate'],'newRole':role,'oldActualSubject':original['actualSubject'],'newActualSubject':subject,'responseDisposition':c['responseDisposition'],'individualAuthorResponse':response,'responseInputPath':str(path),'responseInputSha256':sha(path),'responseCaseSha256PythonCodePoint':fp(c),'fieldsChanged':changed,'protectedOriginalContentScopeRequiresOwnerFieldsUnchanged':True,'nativeRequiresSourceOwnerScopeApproval':False,'reviewStatus':'fresh_v2_author_response_pending_different_reviewer'})
    revisions.append(e['goalId'])
assert len(unchanged)==499 and len(register)==40
new['counts']={'stableGoalIds':539,'technicalLeaves':428,'actualSubjects':dict(Counter(e['actualSubject']for e in new['entries'])),'authorSemanticRoles':dict(Counter(e['semanticRoleAuthorCandidate']for e in new['entries'])),'blockers':dict(Counter(b['kind']for e in new['entries']for b in e['blockers'])),'revisedEntries':40,'unchangedEntries':499,'independentV2Reviewed':0,'nativeAtomicityApproved':0,'nativeM7Approved':0,'requiresApproved':0,'ownersChosen':0}
new['exactV1AuthorManifest']={'path':str(V1/'manifest.json'),'sha256':sha(V1/'manifest.json')}
new['exactV1IndependentReviewManifest']={'path':str(P/'manifest.independent-review-v1.json'),'sha256':sha(P/'manifest.independent-review-v1.json')}
new['revisionBoundary']='Only the exact 40 revision-needed entries receive bounded individual AUTHOR corrections. All other 499 entry objects remain exact. No split follows merely from compute/interpret, alternative methods, multiple representations or independently scoreable work steps. Open content limits remain open; six Math entries are narrow candidates only, with native atomarity/source/scope/requires pending.'
new['legacyBroadRoleSuffixBoundary']='The 186 unchanged broad_outcome_requires_split labels preserve accepted v1 content-bundle triage literally. Neither this suffix nor the v1 reviewer PASS establishes an actual mandatory split; no mandatory split is approved for any of 539 entries.'
identity_dir=Path('tmp/cross-subject-requires/by-identity-runtime-probe-20261013')
new['liveAdoptionBoundary']={'status':'blocked_pending_explicit_runtime_identity_and_shared_orientation_owner_migration','actualSeparateLocalRuntimeCollisionEvidencePath':str(identity_dir/'findings-and-plan.json'),'actualSeparateLocalRuntimeCollisionEvidenceSha256':sha(identity_dir/'findings-and-plan.json'),'actualProbeOutputPath':str(identity_dir/'probe.stdout.json'),'actualProbeOutputSha256':sha(identity_dir/'probe.stdout.json'),'originalV1NoRuntimeClaimRetainedUnchanged':True,'thisAuthorDidNotRunRuntimeProbe':True,'all539RemainInert':True,'publishedOrActivated':False,'scope':'Separate actual LandscapeService local fixture reproduces whole-landscape ID dedup loss; no host acceptance. No current owner or runtime ID migration is chosen by this author package.'}
new['separateFormulaSourceRecoveryBoundary']={'sourceRecoveryAddendumPath':str(P/'integral-source-recovery.independent-addendum-v1.json'),'sourceRecoveryAddendumSha256':sha(P/'integral-source-recovery.independent-addendum-v1.json'),'sourceAuthorAgent':'/root','sourceIndependentReviewer':'/root/requires_canonical_review','newAuthorClaimsOwnVisualRead':False,'printedOfficialValidityFromSeparateReview':'gültig ab Schuljahr 2019/20','future2028_29SourceSubstitution':False,'affectedUnchangedLocalGoalId':'43e2025f-f393-5a41-aa42-ecb3b6ca35b8','activeLocalGoalRepaired':False,'threeSourceFamiliesRecoveredSeparately':True,'nativeAtomicityOrRequiresApproved':False,'fullOfficialSourcePagesRetainedOnlyInTmp':True}
write('semantic-role-ownership-scope.author-ledger.v2.json',new)
write('forty-cases.author-response.register.json',{'schemaVersion':2,'status':'fresh_40_individual_author_responses_pending_separate_review','caseCount':40,'mathCaseCount':21,'physicsCaseCount':19,'entries':register,'hashConvention':'Python code-point sorted compact UTF-8 JSON','all539InertUntilIdentityMigration':True,'license':'CC-BY-4.0','attribution':'SkillPilot contributors'})
write('unchanged499.preservation-witness.json',{'schemaVersion':2,'status':'exact_499_unchanged_author_entry_witness_no_native_carry_forward','count':499,'originalLedgerPath':str(oldpath),'originalLedgerSha256':sha(oldpath),'finalLedgerPath':str(R/'semantic-role-ownership-scope.author-ledger.v2.json'),'finalLedgerSha256':sha(R/'semantic-role-ownership-scope.author-ledger.v2.json'),'entries':unchanged,'hashConvention':'Python code-point sorted compact UTF-8 JSON','v1PASSIsInertTriageOnly':True,'nativeRequiresOwnerSourceScopeGatesRemainPending':True,'license':'Apache-2.0'})
for oldname,newname in [('compatibility-segments.author-candidate.json','preserved.compatibility-segments.v1.json'),('literal-program-segments.author-context.json','preserved.literal-program-segments.v1.json')]:
    payload=(V1/oldname).read_bytes()
    with (R/newname).open('xb')as f:f.write(payload)
    assert sha(R/newname)==sha(V1/oldname)
print(json.dumps({'ledgerPath':str(R/'semantic-role-ownership-scope.author-ledger.v2.json'),'ledgerSha256':sha(R/'semantic-role-ownership-scope.author-ledger.v2.json'),'counts':new['counts'],'exact40Responses':len(register),'unchanged499':len(unchanged)},indent=2))
