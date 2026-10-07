# SPDX-License-Identifier: Apache-2.0
"""Prepare five bounded duration decisions; no active writes or checker changes."""
import copy
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
SOURCES = OWN / 'sources'
SOURCES.mkdir(exist_ok=True)
POLICY = ROOT / 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json'

def read(path):
    return json.loads(path.read_text())

def bind(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def dump(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

policy = read(POLICY)
assert len(policy['decisions']) == 148
before = bind(POLICY)
candidate = copy.deepcopy(policy)
inputs = {before['path']: before}
rows = []
selected_pages = {'BB': [1, 16, 36], 'BE': [1, 11, 36], 'MV': [1, 17, 28, 30], 'SN': [1, 42, 43], 'TH': [1, 26, 28, 29]}
scope_descriptions = {'BB': 'SekI, Gymnasium, Jahrgangsstufen7-10 with E/F/G/H niveau sequence; genetics chapter3.7 is not an invented fixed-grade placement', 'BE': 'SekI, Gymnasium, Jahrgangsstufen7-10 with E/F/G/H niveau sequence; genetics chapter3.7 is not an invented fixed-grade placement', 'MV': 'SekI, Gymnasium/Gesamtschule source, actual Klasse10 under3.2 Unterrichtsinhalte, unnumbered Klassische Genetik', 'SN': 'SekI Gymnasium, actual Klassenstufe10, Lernbereich1 Genetik', 'TH': 'SekI Gymnasium/AHR source, actual Klassenstufen9/10 under2.2, genetics2.2.1.3; selected competencies due by end of Klasse10'}
for st in ['BB', 'BE', 'MV', 'SN', 'TH']:
    parent_decisions = [d for d in policy['decisions'] if d['subject'] == 'Biologie' and d['jurisdiction'] == f'DE-{st}' and d['stage'] == 'SekI']
    assert len(parent_decisions) == 1
    parent_decision = parent_decisions[0]
    assert parent_decision['status'] == 'reviewed'
    parent_path = ROOT / parent_decision['sourceExtractionPath']
    component_path = ROOT / f'curricula/DE/Gymnasium/input/{st}/source-components/DE_{st}_BIOLOGIE_GENETICS_COMPONENTS.author-v6.source-extraction.json'
    parent, component = read(parent_path), read(component_path)
    assert parent['subject'] == component['subject'] == 'Biologie'
    assert parent['jurisdiction'] == component['jurisdiction'] == f'DE-{st}'
    assert parent['stage'] == 'Sekundarstufe I' and component['stage'] == 'SekI'
    assert parent['sourceDocument'] == component['sourceDocument']
    assert component['originalWholeSourceDecisionsUnchanged'] is True
    assert component['wholeNationalClearance'] is False
    parent_goals = {g['id']: g for g in parent['sourceGoals']}
    for retained in component['retainedOriginalSourceSummaries']:
        assert parent_goals[retained['id']] == retained
    for g in component['sourceGoals']:
        assert g['stage'] == 'SekI' and g['courseLevel'] == 'unspecified'
        assert g['originalSourceSummaryGoalId'] in parent_goals
        assert g['sourceDocumentKey'] == component['sourceDocument']['key']
        assert g['wholeOriginalBulletCoverage'] is False
        if st in ['MV','SN','TH']:
            expected_year = {'MV': 'Klasse 10', 'SN': 'Klassenstufe 10', 'TH': 'Klassenstufen 9/10'}[st]
            assert g['sourceSectionContext']['yearHeading'] == expected_year
    pdf = ROOT / component['sourceDocument']['path']
    page_receipts = []
    for page in selected_pages[st]:
        raw = subprocess.check_output(['pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), '-']).decode()
        dest = SOURCES / f'{st}-physical-page-{page:03d}.actual.txt'
        dest.write_text(raw)
        page_receipts.append({'physicalPage': page, 'actualIndependentRawExcerpt': bind(dest)})
    all_pages = {r['physicalPage']: (ROOT / r['actualIndependentRawExcerpt']['path']).read_text() for r in page_receipts}
    if st in ['BB','BE']:
        assert 'Jahrgangsstufe 7' in all_pages[16 if st == 'BB' else 11]
        assert 'Jahrgangsstufe 10' in all_pages[16 if st == 'BB' else 11]
        assert '3.7' in all_pages[36] and 'Genetik' in all_pages[36]
    elif st == 'MV':
        assert 'Klasse 10' in all_pages[28] and 'Mutationen' in all_pages[30]
    elif st == 'SN':
        assert 'Klassenstufe 10' in all_pages[42] and 'Lernbereich 1:' in all_pages[42]
    else:
        assert 'Klassenstufen 9/10' in all_pages[26]
        assert '2.2.1.3 Genetik' in all_pages[28]
    decision = copy.deepcopy(parent_decision)
    decision['sourceExtractionPath'] = str(component_path.relative_to(ROOT))
    decision['rationale'] = (f"This bounded genetics component uses exactly the same official sourceDocument as the reviewed parent extraction {parent_decision['sourceExtractionPath']}. "
                             f"Actual primary-page scope: {scope_descriptions[st]}. "
                             f"Retain the parent's reviewed {parent_decision['decision']} ({', '.join(parent_decision['durationModels'])}) source/projection semantics; the component introduces no separate G8/G9 grade placement. "
                             "This duration decision neither expands whole-original-source coverage nor changes target/prerequisiteOnly roles, course profile, school form, grade placement or canonical goals.")
    assert not any(d['sourceExtractionPath'] == decision['sourceExtractionPath'] for d in policy['decisions'])
    for field in ['subject','jurisdiction','stage','status','decision','durationModels','learnerFacingProjection']:
        assert decision[field] == parent_decision[field]
    if st in ['BB','BE']:
        assert decision['durationModels'] == ['G8','G9'] and decision['decision'] == 'duration-neutral-projection'
    else:
        assert decision['durationModels'] == ['G8'] and decision['decision'] == 'single-duration-source'
    candidate['decisions'].append(decision)
    rows.append({'jurisdiction': f'DE-{st}', 'role': 'Bounded author candidate carrying reviewed parent semantics; fresh independent integration review pending', 'parentPolicyDecision': parent_decision, 'candidateAdditionalPolicyDecision': decision, 'parentSourceExtractionBinding': bind(parent_path), 'componentSourceExtractionBinding': bind(component_path), 'actualSourceDocumentBinding': bind(pdf), 'wholeSourceDocumentMetadataExactParent': True, 'parentSourceRawStage':parent['stage'],'componentSourceRawStage':component['stage'],'sameSekISemanticsDifferentExistingSpelling':True,'retainedOriginalSourceSummaryWholeObjectsExactParent': True, 'componentGoalIds': [g['id'] for g in component['sourceGoals']], 'componentGradeAndParentContexts': [{'id':g['id'],'topicCode':g['topicCode'],'physicalPage':g['physicalPage'],'printedPage':g['printedPage'],'sourceSectionContext':g.get('sourceSectionContext'),'courseLevel':g['courseLevel'],'originalSummaryId':g['originalSourceSummaryGoalId']} for g in component['sourceGoals']], 'actualScope': scope_descriptions[st], 'pageReceipts': page_receipts, 'newIndependentDurationDecisionClaim': False, 'wholeOriginalSourceApproval': False, 'humanApproval': False})
    for path in [parent_path, component_path, pdf]:
        b = bind(path)
        inputs[b['path']] = b
assert candidate['decisions'][:148] == policy['decisions']
assert len(candidate['decisions']) == 153
assert {k:v for k,v in candidate.items() if k!='decisions'} == {k:v for k,v in policy.items() if k!='decisions'}
dump('gymnasium-duration-model-policy.five-components.candidate.json', candidate)
dump('five-component-duration-policy.delta.candidate.json', {'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'role':'Isolated author candidate, requires independent root/B review before active integration','baselinePolicyBinding':before,'appendDecisions':candidate['decisions'][148:],'all148ExistingDecisionObjectsExact':True,'allOtherPolicyFieldsExact':True,'activeWrites':False,'independentApproval':False,'humanApproval':False,'strictCompletionsAdded':0,'restoredActiveBindings':0})
for path in [ROOT/'app/scripts/reportGymnasiumDurationModelReadiness.ts',ROOT/'docs/qa-ci/status/curriculum-quality-status.json',ROOT/'docs/qa-ci/status/gymnasium-duration-model-readiness.md',ROOT/'AGENTS.md']:
    b=bind(path);inputs[b['path']]=b
dump('five-exact-parent-and-primary-grade-scope-bindings.author-receipt.json', {'schemaVersion':1,'createdAtUTC':datetime.now(timezone.utc).isoformat(),'checkerDiagnosis':'Exact sourceExtractionPath lookup only; no sourceDocument/original-summary parent inheritance. Five current component paths have no explicit policy entries; they are grade-structured and unreviewed.', 'currentActualPolicyBinding':before,'currentAGENTSBinding':bind(ROOT/'AGENTS.md'),'historicalB007AuthorAGENTSPin':'b70ecef69785f31e6944f949fdbf5d1a139fdc78d85a2e0c5fc8c34b128e43ec','currentPolicyNotAssumedEqualToHistoricalPin':True,'exactOldToNewAGENTSDiffAvailableHere':False,'rows':rows,'inputBindings':list(inputs.values()),'sameReviewedDurationSemanticsCandidateNotGlobalSourceReview':True,'checkerChanges':False,'activeWrites':False,'nativeDPAOrVApproval':False,'humanApproval':False,'strictNetGain':0})
print(json.dumps({'preparedFiveRows':5,'existing148PolicyRowsExact':True,'currentPolicySha256':before['sha256'],'sourceComponentScopes':5,'componentSourceGoals':sum(len(r['componentGoalIds']) for r in rows),'independentIntegrationReview':'PENDING','activeWrites':False}))
