"""Additive current-input preparation; no scientific approvals or active writes."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OUT = E / 'chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9'
V8 = E / 'chemie-q3-three-current402-real-method-source-author-20261012-v8'
IDS = ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
LAND = OUT / 'candidate/canonical523.current217-plus-exact-q3-three.inactive.json'
SEM = OUT / 'candidate/semantic523.current-classifications-and-three-author-inputs.inactive.json'
QA = OUT / 'candidate/QA.current-active-plus-three-author-image-records.inactive.json'

def read(p):
    return json.loads((ROOT / p).read_text())

def put(p, d):
    f = ROOT / p
    assert not f.exists(), f
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def sha(p):
    return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

def rows(p):
    return [(line, json.loads(line)) for line in (ROOT / p).read_text().splitlines() if line.strip()]

active_sem = read('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
author_sem = read(V8 / 'candidate/semantic402.current-two-normal-fingerprints.inactive.json')
author_by_id = {d['goalId']: d for d in author_sem['decisions']}
semantic = copy.deepcopy(active_sem)
semantic['sourceLandscapePath'] = str(LAND)
semantic['decisions'] = [copy.deepcopy(author_by_id[d['goalId']]) if d['goalId'] in IDS else d for d in semantic['decisions']]
assert len(semantic['decisions']) == 523
assert all(x == y for x, y in zip(active_sem['decisions'], semantic['decisions']) if x['goalId'] not in IDS)
put(SEM, semantic)

active_qa = read('curricula/DE/Gymnasium/quality/goal-visualization-qa/chemie.qa.json')
author_qa = read(V8 / 'candidate/visualization-QA.current-three-exact-good-PNG.inactive.json')
author_qa_by_id = {d['goalId']: d for d in author_qa['records']}
qa = copy.deepcopy(active_qa)
qa['records'] = [copy.deepcopy(author_qa_by_id[d['goalId']]) if d['goalId'] in IDS else d for d in qa['records']]
assert all(x == y for x, y in zip(active_qa['records'], qa['records']) if x['goalId'] not in IDS)
put(QA, qa)

registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
subject = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
active_rows = {}
record_sources = []
for config_path in subject['positiveEvidenceConfigPaths']:
    config = read(config_path)
    scope = set(config['scope']['goalIds'])
    for line, record in rows(config['reviewPath']):
        gid = record['goalId']
        if gid not in scope:
            continue
        assert gid not in active_rows, ('duplicate scoped active P record', gid)
        assert gid not in IDS, ('target already owns active P record; audit supersession before preparing', gid)
        active_rows[gid] = line
        record_sources.append({'goalId': gid, 'configPath': config_path, 'reviewPath': config['reviewPath'], 'reviewFileSha256': sha(config['reviewPath'])})

P_RETAINED = OUT / 'positive/current-active-scoped-records.raw-lines-exact.jsonl'
f = ROOT / P_RETAINED
assert not f.exists()
f.parent.mkdir(parents=True, exist_ok=True)
f.write_text('\n'.join(active_rows.values()) + '\n')

original_cfg = read(V8 / 'native/whole402.inactive.config.json')
full_cfg = {**original_cfg, 'bookId': 'chemie-q3-three-current217-preserving-review-v9', 'title': 'Chemie Q3 – aktuelle gezielte Prüfung bei 217 abgeschlossenen Zielen', 'landscapePath': str(LAND), 'semanticKindLedgerPath': str(SEM), 'goalVisualizationQaPath': str(QA), 'evidenceReviewPaths': [str(P_RETAINED), str(V8 / 'positive/P3.current402.author.records.jsonl')], 'outputPath': str(OUT / 'native/whole402.current-inputs.normal-model.json')}
put(OUT / 'configs/whole402.inactive.config.json', full_cfg)

first_v8 = read(V8 / 'FIRST.actual-author-v8-inputs-CAS.json')
asset_refs = {}
for gid in IDS:
    suffix = f'/assets/{gid}/{gid}.png'
    found = [r for r in first_v8['files'] if r['path'].endswith(suffix)]
    assert len(found) == 1, (gid, found)
    row = found[0]
    assert sha(row['path']) == row['sha256'] == author_qa_by_id[gid]['assetSha256']
    asset_refs[gid] = row
put(OUT / 'assets/three-exact-author-image-source-bindings.json', {'schemaVersion': 1, 'role': 'Byte binding only; no new image approval', 'assetsByGoalId': asset_refs})

put(OUT / 'checks/current-active-input-retention.actual.json', {
    'schemaVersion': 1,
    'role': 'Technical preparation, not independent scientific review',
    'retainedScopedActivePRecordCount': len(active_rows),
    'retainedScopedActivePRecordSources': record_sources,
    'retainedActivePRawLinesExact': True,
    'retainedNonTargetSemanticDecisionsExact': 520,
    'retainedNonTargetQARecordsExact': len(qa['records']) - 3,
    'threeAuthorPRecordsUnmodified': True,
    'threeAuthorSemanticDecisionsUnmodified': True,
    'threeAuthorQARecordsUnmodified': True,
    'newIndependentVotes': 0,
    'strictGain': 0,
    'activeWrites': False,
    'HumanApproval': False,
    'HumanTrial': False,
})
print(json.dumps({'currentPRecordsPreserved': len(active_rows), 'authorP3Exact': True, 'normalModelPending': True, 'strictGain': 0}))
