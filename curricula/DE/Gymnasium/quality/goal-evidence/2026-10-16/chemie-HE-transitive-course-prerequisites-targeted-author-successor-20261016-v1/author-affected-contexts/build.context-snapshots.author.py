#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bounded exact-input extraction. This is author work, never a review vote."""
import hashlib
import json
from pathlib import Path

REPO = Path.cwd()
H = REPO / 'tmp/chemie-m7-resumed-20261016/current578-one-sparse-own-host-v1'
OUT = Path(__file__).resolve().parent
IDS = ['98ae3f8e-4800-5ff3-bd2c-89434c006143', 'b8c8f70f-64cb-50b1-970c-e0c4295da3fb']
SELECTOR = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-current435-five-supported-description-normal-H-and-native5-technical-20261016-v1/central.current435.all435-paired-final-inputs.inactive.config.json'
CENTRAL = str(Path(SELECTOR).parent / 'CENTRAL.actual-current435.all-five-gates-paired-final.json')
CANONICAL = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
pins = {}

def source(rel):
    p = H / rel
    if not p.exists():
        p = REPO / rel
    b = p.read_bytes()
    pins[str(rel)] = {'actualPath': str(p.relative_to(REPO)), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
    return b

def load(rel):
    return json.loads(source(rel))

def write(name, value):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    b = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    tmp = p.with_name(p.name + '.tmp')
    tmp.write_bytes(b)
    tmp.replace(p)

def copy(name, b):
    p = OUT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    tmp = p.with_name(p.name + '.tmp')
    tmp.write_bytes(b)
    tmp.replace(p)

def rows(rel):
    return [(i, json.loads(line), line) for i, line in enumerate(source(rel).decode().splitlines(), 1) if line.strip()]

def exact_row(kind, rel, goal_id):
    matches = [(line_no, row, line) for line_no, row, line in rows(rel) if row.get('goalId') == goal_id]
    assert len(matches) == 1, (kind, rel, goal_id, len(matches))
    line_no, row, line = matches[0]
    copy(f'snapshots/{goal_id}.{kind}.exact-row.jsonl', (line + '\n').encode())
    return {'sourcePath': rel, 'sourceLine': line_no, 'record': row}

canonical = load(CANONICAL)
assert len(canonical['goals']) == 634
assert pins[CANONICAL]['sha256'] == 'd17b3219212d5157a3731cc54b8424cc07816835781984bcbeb3a98f4064268f'
goals = {g['id']: g for g in canonical['goals']}
selector = load(SELECTOR)
subject = selector['subjects'][0]
central = load(CENTRAL)
assert pins[SELECTOR]['sha256'] == '4973226abc78ae09d83e34317fa0c31481767b3a855f225dd55a6cdb66ee51bf'
assert pins[CENTRAL]['sha256'] == '2ff3e4a852f27c5ec5f28d63f5607d95ec96711ebb0951cb4908f5c985097377'
result = {'role': 'AUTHOR affected-context inventory; no new approval or KEEP vote', 'status': 'draft', 'evidenceLevel': 'E0', 'maximumClaimScope': 'G0', 'requiredIndependentReviews': 2, 'completedIndependentReviews': 0, 'currentWholeGoalCount': 634, 'currentOrdinaryCount': 435, 'selectorPath': SELECTOR, 'centralReportPath': CENTRAL, 'goals': {i: {} for i in IDS}}

for goal_id in IDS:
    write(f'snapshots/{goal_id}.whole-current-H-goal.json', goals[goal_id])
    result['goals'][goal_id]['wholeGoalSnapshot'] = f'snapshots/{goal_id}.whole-current-H-goal.json'

for key, kind in [('semanticAtomicityConfigPaths', 'A'), ('positiveEvidenceConfigPaths', 'P')]:
    found = {i: [] for i in IDS}
    for config_rel in subject[key]:
        config = json.loads((H / config_rel).read_bytes())
        scoped = config.get('scope', {}).get('leafGoalIds', config.get('scope', {}).get('goalIds', []))
        for goal_id in set(scoped) & set(IDS):
            load(config_rel)
            found[goal_id].append(exact_row(kind, config['reviewPath'], goal_id))
            copy(f'snapshots/{goal_id}.{kind}.whole-current-config.json', source(config_rel))
    for goal_id in IDS:
        assert len(found[goal_id]) == 1, (key, goal_id, len(found[goal_id]))
        result['goals'][goal_id][kind] = found[goal_id][0]

memory_config = load(subject['memoryReviewConfigPath'])
for goal_id in IDS:
    result['goals'][goal_id]['M'] = exact_row('M', memory_config['reviewPath'], goal_id)
    memory_ids = result['goals'][goal_id]['M']['record'].get('memoryGoalIds', [])
    for memory_id in memory_ids:
        write(f'snapshots/{memory_id}.whole-current-H-memory-goal.json', goals[memory_id])
cards = [dict(sourceLine=n, record=row) for n, row, _ in rows(memory_config['cardReviewPath']) if set(row.get('originGoalIds', [])) & set(IDS)]
write('snapshots/M.complete-relevant-card-review-rows.json', cards)
deck_rel = 'app/public/data/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
deck = load(deck_rel)
copy('snapshots/M.complete-actual-runtime-deck.json', source(deck_rel))
canonical_deck_rel = 'curricula/DE/Gymnasium/memory-decks/de_gymnasium_chemistry_flashcards_equilibria_q3.de.json'
assert load(canonical_deck_rel) == deck
result['memoryConfigPath'] = subject['memoryReviewConfigPath']
result['memoryCardReviewPath'] = memory_config['cardReviewPath']
result['runtimeDeckPath'] = deck_rel
result['cardObjectsRuntimeCanonicalEqual'] = True
result['memoryVisibilityScopes'] = memory_config['visibilityScopes']

qa = load(subject['visualizationQaPath'])
for goal_id in IDS:
    matching = [r for r in qa['records'] if r['goalId'] == goal_id]
    assert len(matching) == 1
    record = matching[0]
    write(f'snapshots/{goal_id}.V.whole-current-QA-record.json', record)
    public = record['publicAssetPath']
    image = source(public)
    assert 'sha256:' + hashlib.sha256(image).hexdigest() == record['assetSha256']
    assert source(record['canonicalAssetPath']) == image
    name = f'images/{goal_id}{Path(public).suffix}'
    copy(name, image)
    result['goals'][goal_id]['V'] = {'qaPath': subject['visualizationQaPath'], 'recordSnapshot': f'snapshots/{goal_id}.V.whole-current-QA-record.json', 'imageSnapshot': name, 'publicCanonicalBytesEqual': True, 'actualViewImagePerformed': True}

for index_rel in subject['resolutionIndexPaths']:
    index = json.loads((H / index_rel).read_bytes())
    for entry in index.get('entries', index.get('resolutions', [])):
        goal_id = entry.get('goalId')
        if goal_id not in IDS:
            continue
        load(index_rel)
        resolution_rel = str(Path(index_rel).parent / entry['resolutionPath'])
        resolution = load(resolution_rel)
        copy(f'snapshots/{goal_id}.D.whole-current-selected-resolution.json', source(resolution_rel))
        result['goals'][goal_id]['D'] = {'indexPath': index_rel, 'indexEntry': entry, 'resolutionPath': resolution_rel, 'roundContexts': []}
        for round_name in ['round-a', 'round-b']:
            round_dir = Path(index_rel).parent / round_name
            input_rel = str(round_dir / 'description-review-input.json')
            review_input = load(input_rel)
            selected = [g for g in review_input['goals'] if g['goalId'] == goal_id]
            assert len(selected) == 1
            write(f'snapshots/{goal_id}.D.{round_name}.complete-input-goal.json', selected[0])
            original_results = []
            for rp in (H / round_dir / 'results').glob('*.records.jsonl'):
                rel = str(rp.relative_to(H))
                for n, row, line in rows(rel):
                    if row.get('goalId') == goal_id:
                        copy(f'snapshots/{goal_id}.D.{round_name}.exact-original-record.jsonl', (line + '\n').encode())
                        original_results.append({'sourcePath': rel, 'sourceLine': n, 'record': row})
            assert len(original_results) == 1
            result['goals'][goal_id]['D']['roundContexts'].append({'inputPath': input_rel, 'originalResult': original_results[0]})

needed = set()
for goal_id in IDS:
    needed.update(goals[goal_id]['requires'])
needed.update(['fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef', '8a2ad724-df5e-5986-8de9-560ba43caac2', '1dc15fa2-fca4-56b0-b5c1-4d215613dde0'])
write('snapshots/whole-current-direct-and-new-foundation-goals.json', [goals[i] for i in sorted(needed)])
write('CONTEXT.actual-two-goals.author-inventory.json', result)
write('PIN.actual-current-H-selected-inputs.author.json', {'role': result['role'], 'pins': pins})
print(json.dumps({'output': str(OUT.relative_to(REPO)), 'goalIds': IDS, 'sourcePinCount': len(pins), 'contextFileCount': len(list(OUT.rglob('*.*')))}, ensure_ascii=False))
