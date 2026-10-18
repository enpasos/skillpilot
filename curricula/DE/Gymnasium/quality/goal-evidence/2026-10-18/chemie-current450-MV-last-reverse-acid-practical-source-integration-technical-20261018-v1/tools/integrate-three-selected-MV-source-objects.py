# SPDX-License-Identifier: Apache-2.0
"""Root-authorized MV source002 integration; no independent science by this tool."""
import argparse
import copy
import datetime
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

N = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18')
A = N / 'chemie-current450-MV-last-reverse-acid-practical-author-successor-20261018-v1'
T = N / 'chemie-current450-MV-last-reverse-acid-practical-source-integration-technical-20261018-v1'
C7 = N / 'chemie-current450-seven-data-source-reviewed-integration-technical-20261018-v1'
SCI_C = N / 'chemie-current450-MV-acid-practical-informed-independent-b-20261018-v1'
SCI_B = N / 'chemie-current450-MV-last-reverse-acid-practical-informed-independent-b-20261018-v1'
GOAL = 'e81a4aed-9695-533e-8eb7-7a0c714346ea'
META = 'mvAcidPracticalSelectedSourceIntegration'
def read(p):
    return json.loads(Path(p).read_text())
def digest(o):
    return hashlib.sha256(json.dumps(o,ensure_ascii=False,sort_keys=True,separators=(',',':')).encode()).hexdigest()
def pin(p):
    b=Path(p).read_bytes()
    return dict(path=str(p),sha256=hashlib.sha256(b).hexdigest(),bytes=len(b))
def write(name,obj):
    p=T/name
    assert not p.exists(), 'Preserve existing technical history: '+str(p)
    p.write_text(json.dumps(obj,ensure_ascii=False,indent=2)+'\n')
def seal(p,expected):
    result=pin(p); assert result['sha256']==expected
    for f in read(p)['files']:
        assert pin(f['path'])==f
    return result

arg=argparse.ArgumentParser(description=__doc__);arg.add_argument('--apply',action='store_true');args=arg.parse_args()
author_seal=seal(A/'SEAL.inactive-one-whole-MV-practical-author.json','aa9a0122c8207cd4561dd58fccd583c17254267c1274936ecc970e9a7bbbb2d2')
seal_c=seal(SCI_C/'SEAL.independent-MV-acid-practical-B.json','360bb9759880a09d1c9ee79b58a537b94ce1c4d5ce0d9b462bdbd81de33cd173')
seal_b=seal(SCI_B/'SEAL.final-portable-FIRST-and-inactive-MV-placement.json','487b485bdc08c208c1bb2fbe176cfa2a2845a5a4108b1decdb62a4ef45808dd2')
first_c=pin(SCI_C/'FIRST.actual-whole-MV-acid-practical-successor.informed-independent-b.json')
first_b=pin(SCI_B/'FIRST.independent-informed-MV-whole-material-P-and-source.json')
assert first_c['sha256']=='83d90581cbfe597fd721a98ea485051775b01b670af8ef1ef7fdc85c894f0eb9'
assert first_b['sha256']=='8a172da1f6ac42a0fd19aee3512d54ef765edbbffd4859e26e6b8722b088b86e'
assert read(first_c['path'])['overallVerdict']=='ACCEPT'
assert read(first_b['path'])['sourcePartialCandidateScience']=='APPROVE'
view_receipt=pin(N/'chemie-current450-six-reviewed-HE-MV-view-placements-technical-20261018-v1/RECEIPT.actual-six-view-normal-integration.json')
assert view_receipt['sha256']=='c63cdccf0e068b72ae59206db4f12dec5926286dbc41292254d848aa87dceb13'
p_receipt=pin(N/'chemie-current450-four-whole-P-successors-normal-integration-technical-20261018-v1/RECEIPT.actual-four-whole-P-normal-activation.json')
assert p_receipt['sha256']=='166f3228d4464deb93a46f79daca7d929e17f40c4081d7b6cfc9bb4bb35293af'
pure=read(T/'CHECK.actual-current-MV-e81-two-targets.pure.json')
assert pure['status']=='PASS' and pure['counts']['views']==2
assert all(c['explicitTarget'] and c['actuallyRendered'] and c['countryCourseFilter'] for c in pure['checks'])
mv_views=[r['normalAfter'] for r in read(view_receipt['path'])['rows'] if '/de-mv-' in r['normalAfter']['path']]
assert len(mv_views)==2
for p in mv_views: assert pin(p['path'])==p

candidate=read(A/'CANDIDATE.one-existing-source-cell-primary-context-repair.inactive.json')
cas=read(A/'CAS.current-MV-selected-source-row-replacements.inactive.json')
inp=read(A/'INPUT.current-one-whole-goal-profile-and-original-source.json')
canonical='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
central='curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert next(g for g in read(canonical)['goals'] if g['id']==GOAL)==inp['wholeGoal']
subject=next(s for s in read(central)['subjects'] if s['subject']=='chemie')
configs=[(p,read(p)) for p in subject['positiveEvidenceConfigPaths'] if GOAL in read(p).get('scope',{}).get('goalIds',[])]
assert len(configs)==1
p_config_path,p_config=configs[0]
records=[(n+1,json.loads(line)) for n,line in enumerate(Path(p_config['reviewPath']).read_text().splitlines()) if json.loads(line)['goalId']==GOAL]
assert len(records)==1
native_line,native=records[0]
assert native['profile']==read(A/'ONE.whole-e81-profile-with-MV-conditional-addition.author.json')
native_binding=dict(config=pin(p_config_path),recordFile=pin(p_config['reviewPath']),lineOneBased=native_line,wholeNativeRecordObjectSHA256=digest(native),wholeProfileObjectSHA256=digest(native['profile']),actualProfileFingerprint=native['profileFingerprint'],exactlyAcceptedWholeAuthorProfile=True,selectedInCurrentCentralChemistry=True,normalPActivationReceipt=p_receipt)
assert pin(inp['primaryPDF']['path'])==inp['primaryPDF']

source_path=candidate['extraction']['path'];source_before=read(source_path)
assert source_before['sourceGoals'][59]==candidate['wholeBefore']
passage_idx=next(n for n,p in enumerate(source_before['passages']) if p['id']=='mv-chemistry-seki:j9-saeuren')
old_passage=source_before['passages'][passage_idx]
old_line='- Sicheren Umgang mit Säuren in Haushalt und Labor begründen'
assert old_passage['text'].splitlines().count(old_line)==1
new_block='- '+candidate['wholeAfter']['sourceText']
source_after=copy.deepcopy(source_before)
history_path=T/'HISTORY.whole-original-source-cell-passage-review-and-author-metadata.json'
review_before=cas['files'][0]['changes'][1]['wholeBefore']
history=dict(artifactRole='EXACT_HISTORICAL_SELECTED_PREIMAGES_NOT_CURRENT_SCIENCE',wholeOldSourceCell=candidate['wholeBefore'],wholeOldSharedPassage=old_passage,wholeOldReviewDecision=review_before,wholeOriginalAuthorCandidateSourceCell=candidate['wholeAfter'],authorCandidateMetadata=candidate['wholeAfter']['metadata'],oldHistoricalReviewerAndDate=dict(reviewedAt=review_before['reviewedAt'],reviewer=review_before['reviewer']),plainAliasHadNoSource002Decision=True,sourceCandidateArtifact=pin(A/'CANDIDATE.one-existing-source-cell-primary-context-repair.inactive.json'))
if args.apply: write(history_path.name,history)
history_ref=dict(path=str(history_path),wholeHistoryObjectSHA256=digest(history))
if args.apply: history_ref=pin(history_path)
science=[dict(reviewerId=read(first_c['path'])['reviewer'],first=first_c,seal=seal_c,role='independent informed source/P/material acceptance; foreign to Root author and this technical integrator'),dict(reviewerId=read(first_b['path'])['reviewerId'],first=first_b,seal=seal_b,role='independent informed source/P/material acceptance; historical placement HOLD separately resolved by actual current view proof')]
now=datetime.datetime.now(datetime.timezone.utc).isoformat()
provenance=dict(technicalPackagePath=str(T),technicalIntegrator='/root/chemie450_caption1_native_fresh_a',technicalIntegrationAtUTC=now,reviewAuthority='machine_technical_integration_of_two_existing_independent_source_reviews',underlyingIndependentScience= science,foreignAuthorSeal=author_seal,activeWholeNativeProfile=native_binding,actualMVViewIntegrationReceipt=view_receipt,actualCurrentTwoMVTargetsProof=pin(T/'CHECK.actual-current-MV-e81-two-targets.pure.json'),historicalSelectedPreimages=history_ref,primaryPDF=inp['primaryPDF'],physicalPrimaryPageOneBased=28,printedPrimaryPage=24,sourceStage='SekI',sourceYear='Klasse9',officialSourceCourseLevel='unspecified',sourceRelation='partial',wholeOfficialSourceCredit=False,newScientificVotesByTechnicalIntegrator=0,newNativeDPAMVVotes=0,actualLearnerExecution=False,humanApproval=False,classroomSafetyRelease=False)
new_source=copy.deepcopy(candidate['wholeAfter'])
new_source['metadata']={k:v for k,v in new_source['metadata'].items() if k not in ('authorCandidate','independentReviewStatus')}
new_source['metadata'].update(dict(sourceRelationReviewStatus='two_separate_existing_independent_reviews_accepted_partial',technicalIntegrationStatus='normal_integrated',machineProvenance=provenance))
source_after['sourceGoals'][59]=new_source
new_passage=copy.deepcopy(old_passage);new_passage['text']=old_passage['text'].replace(old_line,new_block)
source_after['passages'][passage_idx]=new_passage
assert {k:v for k,v in new_source.items() if k!='metadata'}=={k:v for k,v in candidate['wholeAfter'].items() if k!='metadata'}
assert {k:v for k,v in new_passage.items() if k!='text'}=={k:v for k,v in old_passage.items() if k!='text'}
assert new_passage['text'].replace(new_block,old_line)==old_passage['text']
assert META not in source_before
source_after[META]=dict(provenance,sourceGoalId=candidate['sourceGoalId'],sourceGoalCountBefore=len(source_before['sourceGoals']),sourceGoalCountAfter=len(source_after['sourceGoals']),newSourceIds=0,onlyOneSharedPassageLineReplaced=True)
changes=[dict(path=source_path,before=source_before,after=source_after,selectedRestore=dict(sourceGoalIndex=59,wholeSourceBefore=candidate['wholeBefore'],passageIndex=passage_idx,wholePassageBefore=old_passage,removeAddedMetadataKey=META))]

for f in cas['files']:
    path=f['normalFile']['path'];before=read(path);after=copy.deepcopy(before);restores=[]
    for c in f['changes']:
        key,idx=c['pointer'].strip('/').split('/');idx=int(idx)
        assert before[key][idx]==c['wholeBefore'], 'Actual selected CAS mismatch: '+path+c['pointer']
        if key=='mappings':
            after[key][idx]=copy.deepcopy(c['wholeAfter'])
        else:
            assert key=='decisions' and idx==59
            decision=copy.deepcopy(c['wholeAfter'])
            decision.update(dict(sourceSpan=new_source['sourceSpan'],rationale='Aktueller maschinell angenommener und technisch integrierter Partialbeitrag der ganzen MV-Klasse9-Quelle: Die exakt aktivierte bedingte P-/Materialvorgabe verlangt eigene sichere angeleitete Kalk-/Metall-SE mit Rohprotokoll und frischem freigegebenem Vergleich; die konzentrierte Lehrkraft-DE wird nur als Beobachtung behandelt. Zwei getrennte fremde unabhängige Quellen-/P-/Materialannahmen liegen unten gepinnt vor. Der frühere View-HOLD ist durch separat integrierte und aktuell tatsächlich geprüfte MV-GK/LK-Targets aufgelöst. Keine behauptete Lernendenausführung, keine ganze amtliche Quellenerledigung und keine örtliche Sicherheits- oder menschliche Freigabe. Alte Reviewfelder sind im gepinnten ganzen historischen Original archiviert.',reviewedAt=now,reviewer='/root/chemie450_caption1_native_fresh_a; technical integration only, no new scientific vote',reviewAuthority='machine_technical_integration_of_existing_independent_source_acceptance',machineProvenance=provenance,historicalWholeDecision=history_ref|dict(jsonPointer='/wholeOldReviewDecision'),historicalReviewedAt=review_before['reviewedAt'],historicalReviewer=review_before['reviewer']))
            assert 'INACTIVE' not in decision['rationale'] and 'pending' not in decision['rationale']
            after[key][idx]=decision
        restores.append(dict(array=key,index=idx,wholeBefore=c['wholeBefore']))
    assert META not in before
    after[META]=dict(provenance,sourceGoalId=candidate['sourceGoalId'],mappingChange=dict(index=161,oldTarget='cf2631d9-da24-50e8-9e50-db625e6efaad',newTarget=GOAL,matchType='partial'),allOtherMappingRowsDecisionObjectsMetadataAndAppendTailsPreserved=True)
    changes.append(dict(path=path,before=before,after=after,selectedRestore=dict(arrays=restores,removeAddedMetadataKey=META)))

c7=read(C7/'RECEIPT.applied-selected-normal-integration.json')
for c in changes:
    expected=next(p for p in c7['actualAfterPins'] if p['path']==c['path'])
    assert pin(c['path'])==expected,'C7 postimage drift before exclusive MV repair'
    b=c['before'];a=c['after']
    assert a['c7QuantitativeDataPartialIntegration']==b['c7QuantitativeDataPartialIntegration']
    if 'sourceGoals' in b:
        assert all(x==a['sourceGoals'][n] for n,x in enumerate(b['sourceGoals']) if n!=59)
        assert all(x==a['passages'][n] for n,x in enumerate(b['passages']) if n!=passage_idx)
        assert {k:v for k,v in a.items() if k not in ('sourceGoals','passages',META)}=={k:v for k,v in b.items() if k not in ('sourceGoals','passages',META)}
    else:
        assert all(x==a['mappings'][n] for n,x in enumerate(b['mappings']) if n!=161)
        for n,x in enumerate(b.get('decisions',[])):
            if any(z['array']=='decisions' and z['index']==n for z in c['selectedRestore']['arrays']):continue
            assert x==a['decisions'][n]
        assert {k:v for k,v in a.items() if k not in ('mappings','decisions',META)}=={k:v for k,v in b.items() if k not in ('mappings','decisions',META)}
    c['beforePin']=pin(c['path'])
assert len(changes)==3
protected=[pin(p) for p in [canonical,central,p_config_path,p_config['reviewPath'],*list(p['path'] for p in mv_views)]]
spec=importlib.util.spec_from_file_location('stock','scripts/validate_schemas.py');mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
assert not mod.curriculum_symlink_errors('.')
for c in changes:assert pin(c['path'])==c['beforePin']
for p in protected:assert pin(p['path'])==p
plan=dict(artifactRole='ACTUAL_FINITE_THREE_MV_SELECTED_SOURCE_OBJECTS_TECHNICAL_INTEGRATION',mode='APPLIED' if args.apply else 'PREPARATION_NO_NORMAL_MUTATION',atUTC=now,authorSeal=author_seal,independentScientificInputs=science,sourceCandidate=pin(A/'CANDIDATE.one-existing-source-cell-primary-context-repair.inactive.json'),authorSelectedCAS=pin(A/'CAS.current-MV-selected-source-row-replacements.inactive.json'),exactNormalWriteList=[c['path'] for c in changes],activeCurrentWholeNativeProfile=native_binding,viewHOLDResolvedByActualTwoCurrentTargets=True,changes=[{k:v for k,v in c.items() if k not in ('before','after')}|dict(beforeWholeObjectSHA256=digest(c['before']),afterWholeObjectSHA256=digest(c['after'])) for c in changes],protectedBeforePins=protected,wholeSourceGoalAndMappingCountsUnchanged=True,c7AllAppendedWholeCellsTuplesDecisionsAndMetadataExact=True,historicalOldSourceAndDecisionArchived=True,sourceSemanticAfterMatchesAcceptedCandidateExceptTruthfulCurrentMetadata=True,onlyOneSharedPassageLineReplaced=True,newScientificVotes=0,wholeSourceCredit=False,actualLearnerExecution=False,humanApproval=False,classroomSafetyRelease=False,normalWrites=0,stockCurriculumSymlinkErrors=0)
if args.apply:
    for c in changes:Path(c['path']).write_text(json.dumps(c['after'],ensure_ascii=False,indent=2)+'\n')
    for c in changes:assert read(c['path'])==c['after']
    for p in protected:assert pin(p['path'])==p
    assert not mod.curriculum_symlink_errors('.')
    plan['actualNormalAfterPins']=[pin(c['path']) for c in changes];plan['normalWrites']=3
    write('RECEIPT.actual-three-MV-selected-source-normal-integration.json',plan)
else:
    write('PLAN.current-three-MV-selected-source-CAS.before-normal-mutation.json',plan)
print(json.dumps(plan,ensure_ascii=False,indent=2))
