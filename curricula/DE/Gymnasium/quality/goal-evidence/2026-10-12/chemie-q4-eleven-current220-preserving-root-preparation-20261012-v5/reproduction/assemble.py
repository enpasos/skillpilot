import copy
import hashlib
import json
import os
import shutil
from pathlib import Path

R = Path('/home/enpasos/projects/skillpilot')
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12'
A = E / 'chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2'
B = E / 'chemie-q4-eleven-current220-preserving-root-preparation-20261012-v5'
X = R / 'tmp/chemie-q4-current220-prep/execution'
rp = lambda p: str(p.relative_to(R))
rd = lambda p: json.loads(p.read_text())
sha = lambda p: hashlib.sha256(p.read_bytes()).hexdigest()

def wr(p, obj):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def exact(src, dst):
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        assert dst.read_bytes() == src.read_bytes(), str(dst)
    else:
        shutil.copyfile(src, dst)

assert not (B / 'FIRST.current220-preserving-transfer.actual.json').exists()
entry = rd(A / 'FINAL.Q4-eleven.neutral-review-input.json')
ids = entry['goalIds']
live_path = R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
live = rd(live_path)
candidate = copy.deepcopy(live)
by = {g['id']: g for g in candidate['goals']}
original = {g['id']: g for g in live['goals']}
text_deltas = rd(A / 'author/two-only-canonical-text-deltas.json')['deltas']
for d in text_deltas:
    assert by[d['goalId']][d['field']] == d['before']
    by[d['goalId']][d['field']] = d['after']

images = {
    '0a5a49f2-8e8a-5edb-b6ca-3f8636957a17': (E / 'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/0a5a49f2-8e8a-5edb-b6ca-3f8636957a17/0a5a49f2-8e8a-5edb-b6ca-3f8636957a17.png', 'Zwei NO₂-Gasteilchen verbinden sich zu einem N₂O₄-Gasteilchen; für dieses Beispiel bei 25 °C wird die Standardentropieänderung qualitativ negativ eingeschätzt.'),
    'dc5173e8-6e63-58d3-a79b-bd74ef3cb98b': (E / 'chemie-q4-three-proven-image-corrections-author-root-20261012-v3/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b/dc5173e8-6e63-58d3-a79b-bd74ef3cb98b.png', 'Eine zyklische Wärmekraftmaschine nimmt Wärme aus einem wärmeren Reservoir auf, gibt Arbeit und Abwärme an ein kälteres Reservoir ab; die Energie bleibt erhalten.'),
    '56115f9d-1d32-5454-94b1-00dbc4a7bc6f': (E / 'chemie-q4-rgt-five-A-five-B-author-root-20261012-v5/56115f9d-1d32-5454-94b1-00dbc4a7bc6f.png', 'Bei gleicher Anzahl von jeweils fünf A- und fünf B-Teilchen veranschaulichen 20 °C und 30 °C mehr wirksame Zusammenstöße bei höherer Temperatur; die Aktivierungsenergie bleibt gleich und die RGT-Regel ist eine begrenzte Faustregel.'),
}
for gid, (source, alt) in images.items():
    target = B / 'assets' / f'{gid}.png'
    exact(source, target)
    links = [x for x in by[gid]['resourceLinks'] if x['type'] == 'goal-visualization']
    assert len(links) == 1
    links[0]['url'] = f'/assets/goal-visualizations/chemie/{gid}/{gid}.png'
    links[0]['alt'] = alt
canonical = B / 'candidate/canonical523.current220-plus-Q4.inactive.json'
wr(canonical, candidate)
changed = [gid for gid in by if by[gid] != original[gid]]
assert set(changed) == set(images) | {'4a08f31f-204c-5339-9d9f-5d2af28d5d5c'}
assert all(by[g['id']].get('requires', []) == g.get('requires', []) and by[g['id']].get('contains', []) == g.get('contains', []) for g in live['goals'])
protected_q3 = ['81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09']
assert all(by[gid] == original[gid] for gid in protected_q3)

registry = rd(R / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
subject = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
central = rd(E / 'chemie-q3-three-current402-active-adoption-root-20261012-v10/active-checks/central-after-three.actual.json')
strict = set(next(s for s in central['subjects'] if s['subject'] == 'chemie')['strictCompleteGoalIds'])
lines = {}
for path in subject['positiveEvidenceConfigPaths']:
    cfg = rd(R / path)
    scope = set(cfg['scope']['goalIds'])
    for line in (R / cfg['reviewPath']).read_text().splitlines():
        if not line: continue
        row = json.loads(line)
        gid = row['goalId']
        if gid not in scope or gid not in strict: continue
        assert gid not in lines or lines[gid] == line
        lines[gid] = line
assert set(lines) == strict and len(lines) == 220
current_p = B / 'positive/current220.records.raw-lines-exact.jsonl'
current_p.parent.mkdir(parents=True, exist_ok=True)
current_p.write_text('\n'.join(lines.values()) + '\n')
exact(R / subject['memoryReviewConfigPath'], B / 'inputs/current-M402.config.exact.json')
mcfg = rd(R / subject['memoryReviewConfigPath'])
exact(R / mcfg['reviewPath'], B / 'memory/current-M402.raw-lines-exact.jsonl')
exact(R / mcfg['cardReviewPath'], B / 'memory/current-cards75.raw-lines-exact.jsonl')
exact(A / 'positive/P11.author.candidate-set.json', B / 'positive/P11.author.candidate-set.exact.json')
exact(A / 'atomic/A11.author-judgments.inactive.jsonl', B / 'atomic/A11.original-author-exact.jsonl')
exact(A / 'memory/M11.author-necessity.inactive.jsonl', B / 'memory/M11.original-author-exact.jsonl')
exact(A / 'author/two-only-canonical-text-deltas.json', B / 'inputs/two-text-deltas.original-exact.json')
exact(A / 'sources/five-bounded-mapping-deltas.author-proposal.json', B / 'sources/five-source-deltas.original-exact.json')

mapping_deltas = rd(A / 'sources/five-bounded-mapping-deltas.author-proposal.json')['deltas']
mapping_copies = {}
for d in mapping_deltas:
    path = d['mappingPath']
    if path not in mapping_copies:
        mapping_copies[path] = rd(R / path)
    mapping = mapping_copies[path]
    rows = mapping['decisions']
    found = next(i for i, row in enumerate(rows) if row['sourceGoalId'] == d['sourceGoalId'])
    assert rows[found] == d['before']
    rows[found] = copy.deepcopy(d['after'])
new_mapping_paths = {}
for path, content in mapping_copies.items():
    target = B / 'sources/mappings' / Path(path).name
    wr(target, content)
    new_mapping_paths[path] = rp(target)
source_cfg = rd(R / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
source_cfg['landscapePath'] = rp(canonical)
source_cfg['semanticKindLedgerPath'] = rp(B / 'candidate/semantic523.current-plus-two-text.inactive.json')
source_cfg['mappingPaths'] = [new_mapping_paths.get(path, path) for path in source_cfg['mappingPaths']]
source_cfg['outputDirectory'] = rp(B / 'sources/generated-views')
source_cfg['manifestPath'] = rp(B / 'sources/current-source.sources.json')
source_cfg['navigationViewPath'] = rp(B / 'sources/current-source.navigation.view.json')
wr(B / 'configs/source32.inactive.inputs.json', source_cfg)

qa = rd(R / subject['visualizationQaPath'])
for row in qa['records']:
    if row['goalId'] not in images: continue
    gid = row['goalId']
    row.update(imageUrl=f'/assets/goal-visualizations/chemie/{gid}/{gid}.png', publicAssetPath=f'app/public/assets/goal-visualizations/chemie/{gid}/{gid}.png', canonicalAssetPath=rp(B / 'assets' / f'{gid}.png'), assetSha256='sha256:' + sha(B / 'assets' / f'{gid}.png'), description=by[gid]['description'], aiApproved='no', aiApprovedAssetSha256='', aiReviewedAt=None, aiReviewer='', aiNotes='New correction candidate; independent current asset approval pending. Historical original QA remains unchanged.')
wr(B / 'candidate/QA.current-plus-three-pending-images.inactive.json', qa)
exact(R / subject['semanticKindLedgerPath'], B / 'inputs/semantic523.current.exact.json')

X.mkdir(parents=True, exist_ok=True)
for name in ['curricula', 'docs']:
    (X / name).symlink_to(R / name, target_is_directory=True)
(X / 'app').mkdir()
shutil.copytree(R / 'app/scripts', X / 'app/scripts')
for name in ['src', 'node_modules']:
    (X / 'app' / name).symlink_to(R / 'app' / name, target_is_directory=True)
exact(R / 'app/package.json', X / 'app/package.json')
for row in qa['records']:
    if row.get('visualizationState') != 'available': continue
    gid = row['goalId']
    asset = B / 'assets' / f'{gid}.png' if gid in images else R / row['publicAssetPath']
    dst = X / row['publicAssetPath']
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.symlink_to(asset)
wr(B / 'FIRST.current220-preserving-transfer.actual.json', {'schemaVersion': 1, 'role': 'inactive technical preparation, no independent science votes or active adoption', 'canonicalBeforeSha256': sha(live_path), 'canonicalCandidatePath': rp(canonical), 'canonicalCandidateSha256': sha(canonical), 'goals': 523, 'curricularAtomic': 402, 'scope11': ids, 'changedWholeGoalIds': changed, 'unchangedWholeGoals': len(by)-len(changed), 'allIdsRequiresContainsPreserved': True, 'protectedQ3WholeBodiesExact': True, 'current220PositiveRawLinesExact': True, 'allCurrentM402AndCards75ExactSnapshots': True, 'sourceDeltaRows': len(mapping_deltas), 'unchangedCurrentSHMappingRetained': [p for p in source_cfg['mappingPaths'] if 'm7-micelle-correction' in p], 'oldAuthorProfilesAndCasesRemainImmutable': True, 'selectedAssetsAreCandidatesOnly': True, 'privateExecutionRootHasOnlyOwnedCandidateOutputConfigs': True, 'activeWrites': False, 'strictGain': 0})
print(json.dumps({'candidate': rp(canonical), 'changedGoals': len(changed), 'preservedGoals': len(by)-len(changed), 'currentP': len(lines), 'sourceRows': len(mapping_deltas), 'executionRoot': str(X)}))
