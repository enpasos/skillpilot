# SPDX-License-Identifier: Apache-2.0
"""Check exact preserved frames and active material bindings without reviewing peers."""
import collections
import datetime
import hashlib
import json
import os
import pathlib
import subprocess

ROOT = pathlib.Path.cwd()
OWN = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-q3-two-corrosion-whole-source-independent-a-v1'
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-q3-four-bounded-source-current-author-20261008-v1'
IDS = ['0908b3a2-9937-57de-8bfb-35a6de54aa1f', '94a62b39-d4a2-5882-99d1-6886ead07726']
BINDINGS = {}

def binding(path):
    path = pathlib.Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def read(path):
    path = pathlib.Path(path)
    BINDINGS[str(path.relative_to(ROOT))] = binding(path)
    return json.loads(path.read_bytes())

def publish(name, value):
    destination = OWN / name
    text = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    json.loads(text)
    temporary = pathlib.Path(str(destination) + '.writing')
    temporary.write_text(text, encoding='utf-8')
    os.replace(temporary, destination)

def key(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))

frame = read(AUTHOR / 'source/whole929-duties-1602-edges-5459-partners.exact-retained.json')
edges = read(AUTHOR / 'source/whole1602-original-edges.exact-retained.json')
four = read(AUTHOR / 'source/selected106-whole-duty-current528-partner-body-contexts.json')
four_edges = read(AUTHOR / 'source/selected155-original-source-edges.exact-retained.json')
two = read(OWN / 'actual-selected57-whole-source-and269-whole-partner-rows.neutral.json')
partners = read(OWN / 'actual38-whole-current-partner-goals.neutral.json')
assert len(frame['sourceGoals']) == 929
assert len(frame['matchedEdgesData']) == len(edges) == 1602
assert frame['matchedEdgesData'] == edges
assert sum(len(x['allPartnerRows']) for x in frame['sourceGoals']) == 5459
assert len(four) == 106 and len(four_edges) == 155
assert sum(len(x['wholeCurrentCanonicalPartners']) for x in four) == 528
assert len(two) == 57 and len(partners) == 38
assert sum(len(x['wholeCurrentCanonicalPartners']) for x in two) == 269
assert sum(sum(r['canonicalGoalId'] in IDS for r in x['wholeOriginalDuty']['allPartnerRows']) for x in two) == 106
whole_by_key = {x['sourceKey']: x for x in frame['sourceGoals']}
four_by_key = {x['sourceKey']: x for x in four}
assert len(whole_by_key) == 929 and len(four_by_key) == 106
for x in four:
    assert x['wholeOriginalDuty'] == whole_by_key[x['sourceKey']]
for x in two:
    assert x == four_by_key[x['sourceKey']]
    assert x['wholeOriginalDuty'] == whole_by_key[x['sourceKey']]

canonical_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
canonical = read(canonical_path)
goal_by_id = {g['id']: g for g in canonical['goals']}
for x in four:
    assert len(x['wholeCurrentCanonicalPartners']) == len(x['wholeOriginalDuty']['allPartnerRows'])
    for partner, row in zip(x['wholeCurrentCanonicalPartners'], x['wholeOriginalDuty']['allPartnerRows']):
        assert partner['originalPartnerRow'] == row
        assert partner['wholeCurrentCanonicalPartner'] == goal_by_id[row['canonicalGoalId']]
for g in partners:
    assert g == goal_by_id[g['id']]

cache = {}
def current(path):
    if path not in cache:
        cache[path] = read(ROOT / path)
    return cache[path]

for x in frame['sourceGoals']:
    extraction = current(x['sourceExtractionPath'])
    mapping = current(x['mappingPath'])
    original = x['wholeRetainedExtractionGoal']
    actual_source_goals = extraction.get('sourceGoals', extraction.get('goals', []))
    matches = [g for g in actual_source_goals if g['id'] == original['id']]
    assert len(matches) == 1 and matches[0] == original, x['sourceKey']
    actual_rows = [r for r in mapping['mappings'] if r['legacyGoalId'] == original['id']]
    assert collections.Counter(map(key, actual_rows)) == collections.Counter(map(key, x['allPartnerRows'])), x['sourceKey']
for edge in edges:
    mapping = current(edge['mappingPath'])
    assert edge['mappingRow'] in mapping['mappings']
    assert edge['allPartnerRows'] == whole_by_key[edge['mappingPath'] + '#' + edge['sourceGoal']['id']]['allPartnerRows']
for edge in four_edges:
    assert edge in edges

registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(registry_path)
chemistry = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
searched = IDS + ['642d5ea5-b62f-50c8-b0bd-cf132619725f', '91238ba1-5c63-50c7-a4fd-9bbe492c6b61', 'c95f6059-d7c2-5bcd-b61e-95e3577efdb2']
active_materials = []
review_record_counts = []
for config_path in chemistry['positiveEvidenceConfigPaths']:
    config = read(ROOT / config_path)
    record_path = ROOT / config['reviewPath']
    BINDINGS[str(record_path.relative_to(ROOT))] = binding(record_path)
    records = [json.loads(line) for line in record_path.read_text().splitlines() if line.strip()]
    review_record_counts.append({'configPath': config_path, 'reviewPath': config['reviewPath'], 'wholeRecordCount': len(records)})
    for record in records:
        if record.get('goalId') in searched:
            active_materials.append({'configPath': config_path, 'reviewPath': config['reviewPath'], 'wholeExistingRecordUnchanged': record})
publish('actual-five-partner-current-registry-materials.binding-audit.json', {
    'schemaVersion': 1, 'contentLicense': 'CC-BY-4.0', 'searchedGoalIds': searched,
    'registryBinding': binding(registry_path), 'configsRead': review_record_counts,
    'actualMatchingWholeExistingRecords': active_materials,
    'notFoundInTheseActivePConfigsOnly': [g for g in searched if not any(r['wholeExistingRecordUnchanged'].get('goalId') == g for r in active_materials)],
    'wholeRepositoryAbsenceClaim': False, 'wholeHistoricalReviewRestart': False,
    'ownTargetedMaterialConclusion': {
        'c95AlFilmAndChromiumAlloyMaterial': 'Preserved valid Al-film/Fe-rust and chromium-alloy material. These whole tasks do not demonstrate named tin-plated versus zinc-plated steel, anodizing, galvanotechnology or physical conduction/detection operators.',
        'targetCorrosionTheoryP2AndFourCases': 'Whole original theory cases remain sound and unchanged; their explicit no-laboratory boundary is retained.',
        'findingIdsStillOpen': ['COR-A-SOURCE-003', 'COR-A-SOURCE-004'],
        'missingHumanPerformanceIsNotThisMachineHold': True,
    }, 'newIndependentPApprovalClaim': False, 'newStrictClosures': 0,
    'humanApproval': False, 'humanTrial': False,
})

receipt = {
    'schemaVersion': 1, 'codeLicense': 'Apache-2.0', 'evidenceLicense': 'CC-BY-4.0',
    'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'PASS_actual_whole_retention_and_current_bindings_only',
    'retainedWholeOriginalFrame': {'duties': 929, 'directEdges': 1602, 'allPartnerRows': 5459},
    'retainedWholeFourGoalFrame': {'duties': 106, 'directEdges': 155, 'wholePartnerRows': 528},
    'ownWholeTwoGoalScope': {'duties': 57, 'directEdges': 106, 'wholePartnerRows': 269, 'distinctWholePartners': 38},
    'all929WholeExtractionGoalsAnd5459MappingsExactCurrent': True,
    'all528WholeSelectedFourScopePartnerBodiesExactCurrent': True,
    'all38WholeTwoScopePartnerBodiesExactCurrent': True,
    'originalTheoryRecordsOrMaterialsEdited': False,
    'checkedWholeInputs': sorted(BINDINGS.values(), key=lambda b: b['path']),
    'reviewedFullNationwide929Science': False,
    'newSourceScienceApprovalCount': 0, 'newStrictClosures': 0, 'restoredBindings': 0,
    'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
}
publish('actual-whole-retained-frame-and-current-bindings.technical-result.json', receipt)
print(json.dumps({k: receipt[k] for k in ['status', 'retainedWholeOriginalFrame', 'retainedWholeFourGoalFrame', 'ownWholeTwoGoalScope', 'newStrictClosures']}))
