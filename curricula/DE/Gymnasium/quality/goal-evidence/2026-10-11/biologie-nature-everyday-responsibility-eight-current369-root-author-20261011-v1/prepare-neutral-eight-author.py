"""Freeze current inputs for eight bounded author candidates; no review vote."""
import datetime
import hashlib
import json
import pathlib
import shutil

ROOT = next(p for p in pathlib.Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file() and (p / '.git').exists())
PACKAGE = pathlib.Path(__file__).resolve().parent
IDS = ['640306a2-7d58-5192-9676-58f492978790', '7247dc5e-9d58-5aa0-8082-5097847539a4', '7b09d025-8465-505e-b196-61e1811309db', 'b6b1a9ab-3930-5165-8b4e-92b3d87ea014', 'c1aea082-30c0-558f-8d0a-fb810c1dc51b', 'ccb1fe9a-d8e0-54bf-a447-c0b427b654da', 'cd1fa548-9b27-54df-89be-6a6ee3629eb9', 'eb48ba5b-eaa9-52bc-a579-841fc2566182']

def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def bind(path):
    b = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

landscape = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
kind = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
atlas = ROOT / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
whole = json.loads(landscape.read_text())
assert len(whole['goals']) == 480
targets = [next(g for g in whole['goals'] if g['id'] == gid) for gid in IDS]
assert all(not g.get('resourceLinks') for g in targets)
paths = {landscape, kind, atlas}
source_rows = []
atlas_input = json.loads(atlas.read_text())
for mapping_path in atlas_input['mappingPaths']:
    mapping = ROOT / mapping_path
    m = json.loads(mapping.read_text())
    paths.add(mapping)
    extraction = ROOT / m['sourceExtractionPath']
    paths.add(extraction)
    source = json.loads(extraction.read_text())
    for row in m.get('mappings', []):
        if row.get('canonicalGoalId') in IDS:
            goal = next(g for g in source.get('goals', source.get('sourceGoals', [])) if g.get('id', g.get('sourceGoalId')) == row['legacyGoalId'])
            decision = next((d for d in m.get('decisions', []) if d.get('legacyGoalId') == row['legacyGoalId'] or d.get('decisionId') == row.get('reviewDecisionId')), None)
            source_rows.append({'mappingPath': mapping_path, 'sourceExtractionPath': str(extraction.relative_to(ROOT)), 'jurisdiction': m.get('jurisdiction', source.get('jurisdiction')), 'mapping': row, 'sourceGoal': goal, 'decision': decision})
for snapshot in atlas_input['sourceDocumentSnapshots']:
    paths.add(ROOT / snapshot['path'])
for source, target in [(landscape, PACKAGE / 'candidate/whole480-current395.baseline.exact.json'), (kind, PACKAGE / 'candidate/semantic-kinds.current395.baseline.exact.json')]:
    target.parent.mkdir(parents=True, exist_ok=True)
    assert not target.exists()
    shutil.copyfile(source, target)
write(PACKAGE / 'sources/eight-current-whole-source-row-and-decision-inputs.json', {'schemaVersion': 1, 'authorPreparationOnly': True, 'currentGoalIds': IDS, 'rows': source_rows, 'sourceOperatorApproval': False, 'humanApproval': False})
write(PACKAGE / 'FIRST.neutral-current-eight-author-inputs.json', {
    'schemaVersion': 1, 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Root author preparation only; independent A and B review required before integration',
    'currentGoalIds': IDS, 'currentWholeGoalCount': 480, 'currentCurricularAtomicGoalCount': 395,
    'baselineBindings': [bind(path) for path in sorted(paths)], 'currentWholeTargets': targets,
    'sourceRowInput': bind(PACKAGE / 'sources/eight-current-whole-source-row-and-decision-inputs.json'),
    'plannedChanges': 'Eight full E1/G1 candidate profiles, sixteen bilingual whole cases and eight missing PNG candidates; preserve IDs, current descriptions and all protected existing goals.',
    'activeWrites': False, 'humanApproval': False, 'actualLearnerPerformance': False,
})
print(f'PASS neutral current480/395 author input freeze; eight targets; {len(source_rows)} full source rows; {len(paths)} input bindings')
