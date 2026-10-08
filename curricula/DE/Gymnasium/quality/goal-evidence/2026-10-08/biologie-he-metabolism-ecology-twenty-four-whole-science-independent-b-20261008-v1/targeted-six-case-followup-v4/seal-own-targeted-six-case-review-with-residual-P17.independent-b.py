from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,importlib.util,subprocess

root=Path.cwd(); own=Path(__file__).resolve().parent; original=own.parent
author=original.parent/'biologie-he-metabolism-ecology-twenty-four-whole-science-author-20261008-v1'
remedy=original.parent/'biologie-he-metabolism-ecology-six-case-targeted-remediation-author-root-20261008-v4'
read=lambda p:json.loads(p.read_text())
def bind(p):
    b=p.read_bytes();return {'path':p.relative_to(root).as_posix(),'sha256':hashlib.sha256(b).hexdigest(),'bytes':len(b)}
def write(name,x):
    with (own/name).open('x') as out:json.dump(x,out,ensure_ascii=False,indent=2);out.write('\n')
first=original/'whole24-whole48-source-science-independent-b.first.freeze.json'
previous_final=original/'whole24-whole48-source-science-independent-b.completed.final.freeze.json'
assert bind(first)['sha256']=='9ab66e1e3d35e7965ac8ccca5351f1e6fbb841ae68dbe1ddb842199ae93d50df'
assert bind(previous_final)['sha256']=='8ed27d2da8f2f48a47a68f234b03462cd97c3b912f806ba8a3967a05f531a056'
for b in read(previous_final)['files']:assert bind(root/b['path'])==b
entry_path=remedy/'neutral-six-case-only-remediation.author.entry.json'
seal_path=remedy/'six-case-only-remediation.author.first-input.freeze.json'
assert bind(entry_path)['sha256']=='004d47478ac4183aa57b1be741d3b3741c5aeed6f681c91030257a6f4a5bf296'
assert bind(seal_path)['sha256']=='34ee51b09c7dc6e5959b3921a1a2c045a5a91005de7adb233095bd07ef6370fd'
entry=read(entry_path); seal=read(seal_path)
for b in seal['files']:assert bind(root/b['path'])==b
oldcases=read(author/'whole48.material-task-model-scoring-independent-fresh-transfer.DEEN.author.json')['cases']
newcases=read(root/entry['whole48Candidate']['path'])['cases']
oldprofiles=read(author/'P24.whole48-complete-DEEN-author.candidates.json')['goals']
newprofiles=read(root/entry['whole24ProfilesCandidate']['path'])['goals']
changed=[b['caseId'] for a,b in zip(oldcases,newcases) if a!=b]
assert changed==entry['changedCaseIds']
changed_profile_ordinals=[i for i,(a,b) in enumerate(zip(oldprofiles,newprofiles),1) if a!=b]
assert changed_profile_ordinals==[5,9,12,17,19]
assert len(oldcases)==len(newcases)==48 and len(oldprofiles)==len(newprofiles)==24
assert all(a['wholeCurrentGoal']==b['wholeCurrentGoal'] for a,b in zip(oldcases,newcases))
assert all(b['evidence']==a['evidence'] for a,b in zip(oldcases,newcases))
for ordinal in [8,16]:
    assert oldprofiles[ordinal-1]==newprofiles[ordinal-1]
    assert oldcases[(ordinal-1)*2:ordinal*2]==newcases[(ordinal-1)*2:ordinal*2]
for c in newcases:
    assert sum(x['points'] for x in c['scoring']['criteria'])==c['scoring']['maximumPoints']==10
    assert c['evidence']['level']=='E1' and c['evidence']['maximumClaimScope']=='G1'
    assert c['evidence']['humanReviewStatus']=='needs_human_review' and c['evidence']['performedExperiment'] is False
    assert c['freshTransfer']['performed'] is False
for ordinal in changed_profile_ordinals:
    profile=newprofiles[ordinal-1]['profile']; pair=newcases[(ordinal-1)*2:ordinal*2]
    assert profile['coverageExpectations']==oldprofiles[ordinal-1]['profile']['coverageExpectations']
    for brief,c in zip(profile['applicationCaseBriefs'],pair):
        assert brief['id']==c['caseId']
        for lang,suffix in [('de','De'),('en','En')]:
            introduction=' Frischer, getrennt zu beantwortender Konzepttransfer: ' if lang=='de' else ' Fresh concept transfer, answered separately: '
            assert brief['taskDemand'+suffix]==c['material'][lang]+' '+c['task'][lang]+introduction+c['freshTransfer']['task'][lang]
            assert brief['expectedPerformance'+suffix]==c['modelResponse'][lang]+' Transfer: '+c['freshTransfer']['modelResponse'][lang]
    core,transfer=profile['expectations']
    for lang,suffix in [('de','De'),('en','En')]:
        assert core['observablePerformance'+suffix]==pair[0]['task'][lang]
        assert transfer['observablePerformance'+suffix]==pair[1]['task'][lang]+' '+pair[1]['freshTransfer']['task'][lang]
        for brief in profile['applicationCaseBriefs']:
            expected=core['essentialUnderstanding'+suffix]+' '+transfer['essentialUnderstanding'+suffix]
            if ordinal==17 and brief['id']=='he-metabolism-ecology24-17-case-1':
                meta='; Metapopulation ist hier explizit eine Autorenvertiefung.' if lang=='de' else '; metapopulation is explicitly an author elaboration here.'
                assert brief['understandingFocus'+suffix]==expected[:-1]+meta
            else:
                assert brief['understandingFocus'+suffix]==expected
write('actual-six-whole-cases-five-profile-delta-and-retained42-19-24.independent-b.json',{
    'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'authorNeutralEntry':bind(entry_path),'authorFirstSeal':bind(seal_path),
    'originalOwnFirstSeal':bind(first),'originalOwnFinalSeal':bind(previous_final),'changedWholeCaseIds':changed,'changedProfileOrdinals':changed_profile_ordinals,
    'unchangedWholeCases':42,'unchangedWholeProfiles':19,'unchangedWholeCurrentDEENGoalBodies':24,
    'wholeChangedCasesAndProfilesActuallyRead':True,'E1G1AiCandidateHumanPendingTruthUnchanged':True,
    'held8and16ScienceSourceAnd16MetadataNotApproved':True,'allOldFirstAndFinalSealBytesExact':True,'currentPeerRead':False,'activeWrites':0})
scientific=[
 ('he-metabolism-ecology24-05-case-1','KEEP',
  'The new fresh-transfer task supplies CAM nighttime C4-acid fixation and daytime release in the same cell type before answering. Learners can now infer temporal versus the supplied C4 spatial organization without an extra unsupplied CAM knowledge quota. The original C4 mechanism, ATP-cost, drought/low-light trade-off and other case stay valid.',
  ['BIO24-B-P05-CAM-MATERIAL']),
 ('he-metabolism-ecology24-09-case-1','KEEP',
  'The whole DE/EN response now states a directional testable20-to30-degree rate hypothesis under matched oxygen-free starts. O2 verification plus a parallel ethanol assay distinguish the fermentation interpretation from merely observing CO2. Blanks, replicate variation, highest-tested-versus-universal optimum and the sugar/temperature confounding transfer remain appropriate for planning/evaluation. No executed experiment is reported.',[]),
 ('he-metabolism-ecology24-09-case-2','KEEP',
  'Both whole language cases now specify controlled O2-free conditions and a parallel ethanol-rate decline. The proposed plan retains sugar-free/inactivated controls, comparable cell counts and strain-versus-concentration separation; a fall at high sugar requires separate mechanistic hypotheses. The fresh density comparison must be normalized and does not establish per-cell improvement. No practical execution is inferred.',[]),
 ('he-metabolism-ecology24-12-case-1','KEEP',
  'The curricular-meta sentence is actually removed from the complete answer, c4 and operative case brief. Expected loss0.4, colonization1.2, next occupancy4.8 and integer realizations are still correct under the stated external-pool model. Independent repetition and stochastic uncertainty remain the scored biological/model performance.',
  ['BIO24-B-P12-QA-META']),
 ('he-metabolism-ecology24-17-case-2','KEEP',
  'The complete answer, c4 and transfer expectation now stop at habitat quality, distance and species-specific transfer limits. Reviewer elaboration status is no longer graded. Occupancy, local demography, productive-source connectivity and inability of all-sink exchange alone to create unlimited growth are retained and valid.',
  []),
 ('he-metabolism-ecology24-19-case-1','KEEP',
  'The official-point metadata is actually removed from full answer, c4 and P case brief. Predictions95/75/55 and residuals−1/+2/−1, separate fitting/test sets, absence of causal proof and range15–25 limits remain valid and scored. The negative40-degree prediction correctly exposes extrapolation failure rather than a negative population.',
  ['BIO24-B-P19-QA-META'])]
verdicts=[]
for caseid,verdict,reason,resolved in scientific:
    c=next(c for c in newcases if c['caseId']==caseid)
    verdicts.append({'caseId':caseid,'goalId':c['goalId'],'decision':verdict,'substantiveWholeMaterialTaskAnswerRubricTransferReason':reason,
        'completeDEENCaseActuallyRead':True,'allFiveScoringCriteriaActuallyRead':True,'sourceFindingIdsResolved':resolved,
        'twoPointPartialCreditRuleUnchanged':True,'newWholeCase':c})
write('six-whole-DEEN-cases-five-profiles.independent-b.followup-first.verdicts.json',{
    'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'reviewer':'codex-independent-b-flora_fauna','role':'Actual targeted science follow-up of corrected whole6 cases/5 profiles, retaining original whole24/48 first science',
    'entries':verdicts,'resolvedOwnFindingIds':['BIO24-B-P05-CAM-MATERIAL','BIO24-B-P12-QA-META','BIO24-B-P19-QA-META'],
    'P17ProfileResidualFinding':{'findingId':'BIO24-B-P17-RESIDUAL-FOCUS-V4','status':'HOLD','caseId':'he-metabolism-ecology24-17-case-1','fields':['understandingFocusDe','understandingFocusEn'],
        'actualDefect':'Both operative case1 understandingFocus fields retain the author-elaboration meta statement even though transfer expectation and case2 were corrected. Whole case2 biology/scoring is clear; the full P17 profile is not yet clear.',
        'minimalCorrection':'Remove exactly the remaining author-elaboration clause in these two fields; preserve all scientific focus, the19 other unchanged profiles and42 other cases.'},
    'profileVerdicts':{'5':'KEEP','9':'KEEP','12':'KEEP','17':'HOLD_residual_meta_in_case1_focus','19':'KEEP'},
    'newSourceScienceClearCandidateCount':18,'newSourceScienceClearCandidateOrdinals':[4,5,6,7,9,10,11,12,13,14,15,18,19,20,21,22,23,24],
    'remainingHeldCandidateOrdinals':[1,2,3,8,16,17],'original8and16CompoundAnd16QAFindingsRetained':True,
    'allOriginalScienceForUnchangedCasesRetained':True,'sourceOnlyOriginalP10NativeCheckWasForOriginalProfiles':'Updated P9 and new P5/12/17/19 need genuine current closed materialization/binding; no new native approval is inferred here.',
    'nativeD_VApproved':0,'actualLearnerEvidence':False,'performedExperiments':0,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})

original_verdicts=read(original/'whole24-whole48-science-source-P-A-M.independent-b.first.verdicts.json')['entries']
optional_reason={
 11:'Original environmental management and hormone-like-substance contexts do not explicitly name bioaccumulation/biomagnification. This is a bounded authored pollutant-transfer operationalization, not a separate named mandatory bullet.',
 12:'Original idealized exponential/logistic population models do not name stochastic patch dynamics. The stated external-pool stochastic exercise is an authored operationalization of model reasoning, not a compulsory metapopulation-model quota.',
 13:'Original42 names the populations-genetic species concept. Comparing morphological and phylogenetic criteria is an authored criterion-comparison operationalization; original Q2.1 placement is distinguished from normalized historical Q3.3 numbering.',
 14:'Original42 names selection/fitness and reproductive cost-benefit analysis, not a quantitative fitness-curve routine. The normalized offspring/survival exercise is an authored operationalization, not an additional official named method.',
 17:'Original population modeling and ecological decision-help prose allow a bounded authored source/sink/colonization application. They do not name a mandatory metapopulation source/sink model.',
 18:'Original ecological decision models and cause/management/reflection allow the bounded hysteresis/feedback example. A named tipping-point quota is not asserted.',
 19:'Original interdisciplinary ecology and model-informed decisions permit the bounded stated population/climate-data model. This is an authored data-model operationalization, not a named official bioinformatics obligation.',
 24:'Original ecological management and model decisions permit a bounded resistance/recovery management case. A separate named resilience-concept requirement is not asserted.'}
boundaries=[]
for ordinal,reason in optional_reason.items():
    v=original_verdicts[ordinal-1]
    boundaries.append({'ordinal':ordinal,'goalId':v['goalId'],'retainedSourceCategoryAuthorProposal':v['boundedSourceKind'],
        'ownFunctionalSourceClassification':'authoredOperationalization','ownReasonFromActualOriginalIndividualSpans':reason,
        'actualOriginalTopic':v['actualOriginalTopic'],'actualOriginalWholeComponents':v['primaryComponentsActuallyRead'],
        'mandatoryNamedWholeGoalClaim':False,'officialNumberedQuotationClaim':False,'universalNormativeMethodQuota':False,
        'wholeCurrentGoalBodyAndExistingSemanticKindUnchanged':True,'noAutomaticDenominatorRemovalOrCurricularAtomicDemotion':True,
        'retainedAMScienceBinding':'Whole goal texts unchanged; valid existing M and noncompound A retained; no new card/visibility quota from a source relabeling.',
        'currentNativeD_P_VStillPending':True})
write('eight-authored-operationalization-original-span-boundaries.independent-b.followup.json',{
    'schemaVersion':1,'reviewedAt':datetime.now(timezone.utc).isoformat(),'entries':boundaries,
    'notLiteralNamedMandatoryOfficialCompetencies':True,'whole144NeuroGK2HoldAndReviewedEvolution18SourceV3Retained':True,'operatorRemovalAuthorized':False,
    'notFreshReviewOfOtherUnchangedOfficialPartners':True,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})

spec=importlib.util.spec_from_file_location('ordinary_schema_validator',root/'scripts/validate_schemas.py')
module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
schema=read(root/'docs/landscape-runtime.schema.json')
json_paths=[p for p in own.rglob('*.json')]
for p in json_paths:assert module.validate_file(p.relative_to(root).as_posix(),schema)
paths=[p for p in own.rglob('*') if p.is_file()]
assert not any(p.is_symlink() for p in own.rglob('*'))
argv=['git','check-ignore','--stdin']
result=subprocess.run(argv,cwd=root,input=('\n'.join(p.relative_to(root).as_posix() for p in paths)+'\n').encode(),capture_output=True)
assert result.returncode==1 and result.stdout==b''
for channel,data in [('stdout',result.stdout),('stderr',result.stderr)]:
    with (own/f'followup-portability.{channel}.actual.txt').open('xb') as out:out.write(data)
write('actual-followup-first-input-old-seals-schema-portability.independent-b.receipt.json',{
    'schemaVersion':1,'checkedAt':datetime.now(timezone.utc).isoformat(),'allOriginalOwnFirstFinalSealsVerifiedExact':True,'newAuthorFirstInputsVerifiedExact':4,
    'ordinaryValidatorOwnJSONFilesParsed':len(json_paths),'actualCheckIgnoreArgv':argv,'actualCheckIgnoreExit':result.returncode,'ignoredOwnFiles':0,'ownSymlinks':0,
    'stdout':bind(own/'followup-portability.stdout.actual.txt'),'stderr':bind(own/'followup-portability.stderr.actual.txt'),
    'nativeD_P_VPerformedOrApprovedInThisFollowup':False,'currentPeerRead':False,'activeWrites':0})
write('neutral-six-case-five-profile-independent-b.followup.entry.json',{
    'schemaVersion':1,'role':'Genuine own targeted blind six-case5-profile science follow-up and exact eight authored-operationalization boundaries',
    'authorEntry':bind(entry_path),'authorFirstSeal':bind(seal_path),'originalOwnFirstSeal':bind(first),'originalOwnFinalSeal':bind(previous_final),
    'wholeCaseVerdicts':bind(own/'six-whole-DEEN-cases-five-profiles.independent-b.followup-first.verdicts.json'),
    'eightOriginalSpanBoundaries':bind(own/'eight-authored-operationalization-original-span-boundaries.independent-b.followup.json'),
    'exactDelta':bind(own/'actual-six-whole-cases-five-profile-delta-and-retained42-19-24.independent-b.json'),
    'newScienceSourceClearCandidateOrdinals':[4,5,6,7,9,10,11,12,13,14,15,18,19,20,21,22,23,24],'remainingHeldCandidateOrdinals':[1,2,3,8,16,17],
    'D_VPending':True,'nativeUpdatedPProfileBindingsPending':True,'currentPeerRead':False,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
bindings={b['path']:b for b in seal['files']}
for p in [entry_path,seal_path,first,previous_final]:bindings[bind(p)['path']]=bind(p)
for p in sorted(own.rglob('*')):
    if p.is_file():bindings[bind(p)['path']]=bind(p)
write('six-case-five-profile-independent-b.followup-first.freeze.json',{
    'schemaVersion':1,'sealedAt':datetime.now(timezone.utc).isoformat(),'kind':'Genuine own targeted scientific first follow-up; original first/final immutable; current peer unread',
    'files':sorted(bindings.values(),key=lambda x:x['path']),'resolvedOwnFindingCount':3,'wholeSixCaseKEEP':6,'newOverallScienceSourceClearCandidates':18,
    'remainingWholeCandidateHolds':6,'currentPeerRead':False,'nativeD_VApproved':0,'activeWrites':0,'strictGainClaimed':0,'humanApproval':False,'humanTrial':False})
print(json.dumps({'followupFirstSeal':bind(own/'six-case-five-profile-independent-b.followup-first.freeze.json'),'neutralEntry':bind(own/'neutral-six-case-five-profile-independent-b.followup.entry.json'),
    'wholeSixCaseKEEP':6,'ownResolvedFindings':3,'scienceSourceClear':18,'remainingHeldOrdinals':[1,2,3,8,16,17]},indent=2))
