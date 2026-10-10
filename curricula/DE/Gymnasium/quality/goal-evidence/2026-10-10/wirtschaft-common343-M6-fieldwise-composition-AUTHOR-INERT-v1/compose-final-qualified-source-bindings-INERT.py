import hashlib
import json
import pathlib
import shutil

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
OUT = pathlib.Path(__file__).parent

def read(p):
    return json.loads(p.read_text())

def rel(p):
    return str(p.relative_to(ROOT))

def binding(p):
    b = p.read_bytes()
    return {'path': rel(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

selected = {}
lineage = {}
for row in read(OUT / 'actual-four-source-ten-mapping-copies-not-global-approval.INERT.json'):
    selected[row['activePath']] = OUT / row['candidatePath']
    lineage[row['activePath']] = [binding(selected[row['activePath']])]

packages = [
    'wirtschaft-common343-eight-source-operator-locator-form-ADDENDUM-AUTHOR-INERT-v1',
    'wirtschaft-common343-NW-GK-parent-locator-only-ADDENDUM-AUTHOR-INERT-v2',
    'wirtschaft-common343-84DD-concrete-source-mapping-DELTA-AUTHOR-INERT-v1',
    'wirtschaft-common343-84DD-parent-raw-and-five-locators-ADDENDUM-AUTHOR-INERT-v2',
    'wirtschaft-common343-MV-generic-market-DD-edge-removal-ADDENDUM-AUTHOR-INERT-v3',
    'wirtschaft-common343-21EU-actual-partial-source-mapping-DELTA-AUTHOR-INERT-v1',
    'wirtschaft-common343-BE-EU-course-and-NW-IF7-rationale-only-ADDENDUM-AUTHOR-INERT-v2',
]
for name in packages:
    base = Q / name / 'candidates'
    for p in sorted(base.rglob('*.json')):
        key = str(p.relative_to(base))
        selected[key] = p
        lineage.setdefault(key, []).append(binding(p))

# BW's old Q/2026-10-08 source is immutable history. Its current mapping
# consumes the genuinely qualified additive v2 source, never old history.
bw_history_key = next(k for k in selected if k.startswith('curricula/DE/Gymnasium/quality/'))
bw_source = selected[bw_history_key]
assert '84DD-parent-raw-and-five-locators-ADDENDUM' in str(bw_source)
bw_mapping_key = 'curricula/DE/Gymnasium/mapping/DE-BW/upper-secondary/bw_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'
source_active_by_landscape = {read(p)['sourceLandscapeId']: active for active, p in selected.items()
                              if active.startswith('curricula/DE/Gymnasium/input/') and 'sourceGoals' in read(p)}

pairs = []
pointer_changes = []
for active, source in sorted(selected.items()):
    if active.startswith('curricula/DE/Gymnasium/quality/'):
        continue
    candidate = OUT / 'final-source-data' / active
    candidate.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(source, candidate)
    obj = read(candidate)
    before = obj.get('sourceExtractionPath')
    after = before
    if active == bw_mapping_key:
        after = rel(bw_source)
    elif before and (ROOT / before).exists():
        old_source = read(ROOT / before)
        after = source_active_by_landscape.get(old_source.get('sourceLandscapeId'), before)
    if after != before:
        obj['sourceExtractionPath'] = after
        candidate.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')
        pointer_changes.append({'mappingActivePath': active, 'field': 'sourceExtractionPath',
                                'before': before, 'after': after,
                                'sourceWholeBinding': binding(bw_source if active == bw_mapping_key else selected[after]),
                                'scienceContractChanged': False})
    pairs.append({'activePath': active, 'candidatePath': rel(candidate),
                  'activeBefore': binding(ROOT / active), 'candidate': binding(candidate),
                  'selectedQualifiedPredecessor': binding(source), 'lineage': lineage[active]})

by_active = {r['activePath']: ROOT / r['candidatePath'] for r in pairs}
canonical = read(OUT / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
known_goal_ids = {g['id'] for g in canonical['goals']}
source_checks = []
mapping_checks = []
for row in pairs:
    p = ROOT / row['candidatePath']
    obj = read(p)
    if 'sourceGoals' in obj:
        ids = [g['id'] for g in obj['sourceGoals']]
        source_checks.append({'activePath': row['activePath'], 'sourceLandscapeId': obj['sourceLandscapeId'],
                              'sourceGoalCount': len(ids), 'uniqueIDs': len(ids) == len(set(ids)),
                              'retainedPipelineStatusNotSelfPromoted': obj.get('pipelineStatus')})
    elif isinstance(obj.get('mappings'), list):
        source_path = obj.get('sourceExtractionPath')
        resolved = by_active.get(source_path, ROOT / source_path) if source_path else None
        extraction = read(resolved) if resolved and resolved.exists() else None
        source_ids = {g['id'] for g in extraction.get('sourceGoals', [])} if extraction else None
        edges = obj['mappings']
        missing_sources = sorted({e['legacyGoalId'] for e in edges if source_ids is not None and e.get('legacyGoalId') not in source_ids})
        missing_targets = sorted({e['canonicalGoalId'] for e in edges if e.get('canonicalGoalId') not in known_goal_ids})
        mapping_checks.append({'activePath': row['activePath'], 'sourceExtractionPath': source_path,
                               'actuallyConsumedSourceCandidate': binding(resolved) if resolved and resolved.exists() else None,
                               'edges': len(edges), 'missingMappedSourceIDs': missing_sources,
                               'missingCanonicalTargetIDs': missing_targets,
                               'partialEdges': sum(e.get('matchType') == 'partial' for e in edges),
                               'exactEdges': sum(e.get('matchType') == 'exact' for e in edges)})

registry_paths = ['source-landscape-registry.json', 'canonical-goal-surrogate-evidence-registry.json',
                  'source-goal-membership-registry.json', 'source-goal-atomic-closure-registry.json']
registry_bindings = []
for name in registry_paths:
    p = ROOT / 'curricula/DE/Gymnasium/provenance' / name
    if p.exists():
        registry_bindings.append(binding(p))
write('actual-final-source-fieldwise-pairs-and-consumed-BW-v2.INERT.json', {
    'role': 'CONCRETE_ROOT_ONLY_ACTIVE_APPLY_INPUT', 'pairs': pairs,
    'whole14MarketFilesRetained': all(r['activePath'] in by_active for r in read(OUT / 'actual-four-source-ten-mapping-copies-not-global-approval.INERT.json')),
    'historicalSourceNeverOverwrite': {'path': bw_history_key, 'qualifiedCurrentSource': binding(bw_source)},
    'technicalPointerChanges': pointer_changes,
    'sourceAndMappingScienceSelfApproval': False, 'M6M7SelfApproval': False,
})
write('actual-final-source-pointers-IDs-and-retained-registry-native-contract.READONLY.json', {
    'sourceChecks': source_checks, 'mappingChecks': mapping_checks,
    'allSourceIDsUnique': all(r['uniqueIDs'] for r in source_checks),
    'allMappedIDsExist': all(not r['missingMappedSourceIDs'] and not r['missingCanonicalTargetIDs'] for r in mapping_checks),
    'registryBindingsUnmodified': registry_bindings,
    'registryNativeContract': {
        'sourceRegistry': 'Native checker validates immutable source/archived IDs; neither source nor surrogate registry has a content-fingerprint field. Existing official PDF/snapshot provenance stays unchanged.',
        'SUR': 'Accepted requires-closure is a scientific dependency claim, not a hash binding. No speculative surrogate authorizations added. Root final native coverage may identify concrete required changes.',
        'code': ['app/scripts/checkSourceLandscapeRegistry.ts', 'app/scripts/generateCurriculumQualityStatus.ts'],
    }, 'scientificSourceCoverageApproval': False,
})
assert all(r['uniqueIDs'] for r in source_checks)
assert all(not r['missingMappedSourceIDs'] and not r['missingCanonicalTargetIDs'] for r in mapping_checks), mapping_checks
print(json.dumps({'pairs': len(pairs), 'sources': len(source_checks), 'mappings': len(mapping_checks),
                  'consumedPointerChanges': len(pointer_changes), 'BWConsumedV2': rel(bw_source), 'allMappedIDsExist': True}))
