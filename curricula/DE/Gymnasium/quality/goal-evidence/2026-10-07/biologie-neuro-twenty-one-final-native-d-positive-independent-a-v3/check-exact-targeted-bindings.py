"""Read-only factual binding/equality checks; not independent science inference."""
from pathlib import Path
import hashlib
import json

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-neuro-twenty-one-current-continuation-author-v3/stage-02-current-twenty-one-native')
OWN = Path(__file__).resolve().parent.relative_to(Path.cwd())
RAW = json.loads((BASE / 'final-current21-whole-native-source-context-material-review-inputs.author.raw.json').read_text())

def pin(path):
    data = Path(path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def save(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

binding_rows = json.loads((BASE / 'all21-selected-actual-frozen-source-witness-effective-file-bindings.author.json').read_text())['records']
witnesses = []
for row in binding_rows:
    effective = {item['field']: item for item in row['exactEffectiveBindings']}
    source_path = effective['sourceExtractionPath']['actualFrozenEffectivePath']
    mapping_path = effective['mappingPath']['actualFrozenEffectivePath']
    source = json.loads(Path(source_path).read_text())
    mapping = json.loads(Path(mapping_path).read_text())
    sg = next(goal for goal in source['sourceGoals'] if goal['id'] == row['actualWitness']['sourceGoalId'])
    links = [m for m in mapping['mappings'] if m.get('legacyGoalId') == sg['id'] and m.get('canonicalGoalId') == row['goalId']]
    assert sg == row['wholeActualBoundSourceGoal'] and links
    for item in row['exactEffectiveBindings']:
        assert pin(item['actualFrozenEffectivePath'])['sha256'] == item['binding']['sha256']
        assert pin(item['actualFrozenEffectivePath'])['bytes'] == item['binding']['bytes']
    witnesses.append({'goalId': row['goalId'], 'scopeKey': row['scopeKey'], 'sourceGoalId': sg['id'], 'wholeBoundSourceGoalExact': True, 'actualEffectiveSourceBinding': pin(source_path), 'actualEffectiveMappingBinding': pin(mapping_path), 'exactMatchingMappingRows': links, 'actualOperatorDe': sg['description'], 'courseLevel': sg.get('courseLevel'), 'sourceKind': sg.get('sourceKind'), 'granularity': sg.get('granularity'), 'wholeOriginalOrCountryScopeApproval': False})

current = json.loads(Path(RAW['currentCanonicalBasis']['path']).read_text())
candidate = json.loads(Path(RAW['candidateCanonical']['path']).read_text())
cg = {g['id']: g for g in current['goals']}
ng = {g['id']: g for g in candidate['goals']}
selected = set(RAW['exactSelected21GoalIds'])
assert list(cg) == list(ng) and len(cg) == 472
unchanged = [gid for gid in cg if gid not in selected and cg[gid] == ng[gid]]
assert len(unchanged) == 451
before_model = json.loads(Path(RAW['full390Models']['current']['path']).read_text())
after_model = json.loads(Path(RAW['full390Models']['candidate']['path']).read_text())
before_pages = {p['goalId']: p for p in before_model['pages']}
after_pages = {p['goalId']: p for p in after_model['pages']}
assert list(before_pages) == list(after_pages) and len(before_pages) == 390
delta = json.loads(Path(RAW['actual390Deltas']['path']).read_text())
protected = []
for row in delta['protected74Rows']:
    gid = row['goalId']
    assert cg[gid] == ng[gid] and before_pages[gid] == after_pages[gid]
    protected.append({'goalId': gid, 'wholeCanonicalGoalExact': True, 'wholeNativePageExact': True, 'canonicalPayloadIncludesRequiresSourceAndOtherContext': True})
assert len(protected) == 74
changed = [gid for gid in before_pages if before_pages[gid] != after_pages[gid]]
assert changed == delta['actualChangedWholePages'] and len(changed) == 18
unselected_changed = [gid for gid in changed if gid not in selected]
assert unselected_changed == ['9499943f-89b7-54e3-9fe2-e90404beaa4a']
neighbour_before = before_pages[unselected_changed[0]]
neighbour_after = after_pages[unselected_changed[0]]
neighbour_delta = {key: {'before': neighbour_before.get(key), 'after': neighbour_after.get(key)} for key in set(neighbour_before) | set(neighbour_after) if neighbour_before.get(key) != neighbour_after.get(key)}
assert set(neighbour_delta) == {'requires', 'pageFingerprint'}
before_link = neighbour_before['requires'][0]
after_link = neighbour_after['requires'][0]
assert len(neighbour_before['requires']) == len(neighbour_after['requires']) == 1
assert {k: v for k, v in before_link.items() if k != 'title'} == {k: v for k, v in after_link.items() if k != 'title'}
assert before_link['goalId'] == 'ff1bf88f-2413-5668-a071-ce9fc499cba3'
contexts = []
for part in ['twenty', 'one']:
    inp = json.loads((BASE / f'native-d-{part}/round-a/description-review-input.json').read_text())
    for goal in inp['goals']:
        gid = goal['goalId']
        assert goal['canonicalContext']['sourceRef'] == ng[gid].get('sourceRef')
        assert goal['currentDescriptionDe'] == ng[gid]['description']
        assert goal['currentDescriptionEn'] == ng[gid]['descriptionEn']
        assert goal['reviewContext']['page']['visualization'] is None
        contexts.append({'goalId': gid, 'actualCurrentNativeGoalFingerprint': goal['goalFingerprint'], 'actualCurrentNativePageFingerprint': goal['pageFingerprint'], 'actualCanonicalContext': goal['canonicalContext'], 'actualNativeReviewContext': goal['reviewContext'], 'sourceRefBoundExactly': True, 'sourceRefRenderedOnPage': False, 'fullCountrySourceViewApproval': False})

materials = json.loads((BASE / 'forty-two-complete-DEEN-reference-materials.current21.author-candidates.json').read_text())['cases']
assert len(materials) == 42
profile_equality = []
for row in RAW['wholeCurrent21CandidateNativeRows']:
    gid = row['goalId']
    own_p = next(json.loads(line) for line in (OWN / 'positive-evidence.current21.independent-a.review.jsonl').read_text().splitlines() if json.loads(line)['goalId'] == gid)
    assert own_p['profile'] == row['positiveCandidateRecord']['profile']
    for case, brief in zip(row['completeDEENCases'], own_p['profile']['applicationCaseBriefs']):
        assert case in materials and case['caseId'] == brief['id']
        for language in ['De', 'En']:
            assert case['task' + language] == brief['taskDemand' + language]
            assert case['referenceResponse' + language] == brief['expectedPerformance' + language]
    profile_equality.append({'goalId': gid, 'scientificallyReviewedWholeProfileExactToActualAuthorInput': True, 'twoCompleteDEENTextualBodiesExactToProfileBriefs': True, 'ownNewReviewerProvenanceNotAuthorApproval': True, 'status': own_p['status'], 'reviewAuthority': own_p['reviewAuthority'], 'evidenceLevel': own_p['evidenceLevel'], 'maximumClaimScope': own_p['maximumClaimScope']})

save('exact51-witnesses-390pages-74guards-and21-material-profile-bindings.independent-a.json', {'role': 'Technical actual input/binding comparison supplementing the separately written scientific21/42 review', 'witnessCount': 51, 'witnesses': witnesses, 'canonicalCurrent': pin(RAW['currentCanonicalBasis']['path']), 'canonicalCandidate': pin(RAW['candidateCanonical']['path']), 'all472IdsAndOrderExact': True, 'unselected451WholeCanonicalGoalsExact': True, 'all390PageIdsAndOrderExact': True, 'protected74WholeGoalPageExact': protected, 'actualChangedWholePages': changed, 'unselectedChangedPagePrerequisiteLabelOnly': unselected_changed, 'contexts': contexts, 'profiles': profile_equality, 'sourceAtlasRebuiltOrWholeOriginalApproved': False, 'learnerViewsAccepted': False, 'humanApproval': False, 'newStrictCompletions': 0})
print('PASS51 source-goal objects/direct mappings;390 IDs;74 whole protected goals/pages;21 profiles/42 bilingual textual cases. No whole-source closure.')
