"""Post-FIRST ordinary JSON, portability, exact binding and six-delta checks."""
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'
OLD = OWN.parent / 'biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'

def read(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(path, obj):
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    read(path)

committable = set(subprocess.run(['git','ls-files','--cached','--others','--exclude-standard','-z','--'], cwd=ROOT, capture_output=True, check=True).stdout.decode().split('\0'))
freeze = read(AUTHOR / 'FINAL.six-source-bindings-neutral-author.freeze.json')
all_bindings = freeze['ownBindings'] + freeze['externalBindings']
for b in all_bindings:
    p = ROOT / b['path']
    assert p.is_file() and not p.is_symlink(), b['path']
    assert p.relative_to(ROOT).as_posix() in committable, b['path']
    assert binding(p) == b, b['path']
history = read(AUTHOR / 'inputs/historical-source-author-and-A-B-FIRST.exact-byte-baseline.json')
for b in history['files']:
    assert binding(ROOT / b['path']) == b, b['path']
assert binding(OWN / 'FIRST.six-source-resolution-independent-a.inspection.json')['sha256'] == 'sha256:76a243cfeba1097db5ca2eaf5887a62a3ebe820557754d2248666fcf35f5404b'
assert binding(OWN / 'FIRST.six-source-resolution-independent-a.freeze.json')['sha256'] == 'sha256:aaeec38842c9c8b35dc42217446ba3f0c73e160e1552b64b34e8d1e1e56ea6e0'

before_config = read(OLD / 'sources/after394-atlas.targeted-source.normal.config.json')
after_config = read(AUTHOR / 'sources/current394-six-resolution.normal.config.json')
assert len(before_config['mappingPaths']) == len(after_config['mappingPaths']) == 31
expected_removed = read(AUTHOR / 'sources/six-unsupported-mapping-records.actual-author-deltas.json')['removedUnsupportedMappingRecords']
expected_keys = {(x['sourceGoalId'], x['canonicalGoalId']) for x in expected_removed}
actual_removed = []
pair_checks = []
source_changes = []
changed_pair_indexes = []
for i, (before_path, after_path) in enumerate(zip(before_config['mappingPaths'], after_config['mappingPaths'])):
    bm, am = read(ROOT / before_path), read(ROOT / after_path)
    def mapping_key(m):
        return json.dumps(m, ensure_ascii=False, sort_keys=True)
    bs = {mapping_key(m): m for m in bm['mappings']}
    ass = {mapping_key(m): m for m in am['mappings']}
    removed, added = [bs[k] for k in bs.keys() - ass.keys()], [ass[k] for k in ass.keys() - bs.keys()]
    assert not added, (i, added)
    assert all((m['legacyGoalId'], m['canonicalGoalId']) in expected_keys for m in removed)
    actual_removed.extend(removed)
    if removed:
        changed_pair_indexes.append(i)
    be, ae = read(ROOT / bm['sourceExtractionPath']), read(ROOT / am['sourceExtractionPath'])
    bg, ag = {g['id']:g for g in be['sourceGoals']}, {g['id']:g for g in ae['sourceGoals']}
    assert set(bg) == set(ag)
    for sid, source in bg.items():
        fields = [k for k in sorted(set(source) | set(ag[sid])) if source.get(k) != ag[sid].get(k)]
        if fields:
            assert (i, fields) in [(7, ['sourceContributionScopes']), (13, ['metadata'])], (i, sid, fields)
            source_changes.append({'pairIndex': i, 'sourceGoalId': sid, 'changedFields': fields, 'before': {k:source.get(k) for k in fields}, 'after': {k:ag[sid].get(k) for k in fields}})
    def decision_key(d):
        return d.get('id') or d.get('reviewDecisionId') or d['sourceGoalId']
    bd = {decision_key(d):d for d in bm['decisions']}
    ad = {decision_key(d):d for d in am['decisions']}
    assert set(bd) == set(ad)
    changed_decisions = [sid for sid in bd if bd[sid] != ad[sid]]
    allowed_decision_ids = {identifier for m in removed for identifier in [m['reviewDecisionId'], m['legacyGoalId']]}
    assert all(sid in allowed_decision_ids for sid in changed_decisions), (i, changed_decisions)
    pair_checks.append({'pairIndex': i, 'beforeMapping': binding(ROOT / before_path), 'afterMapping': binding(ROOT / after_path), 'beforeExtraction': binding(ROOT / bm['sourceExtractionPath']), 'afterExtraction': binding(ROOT / am['sourceExtractionPath']), 'removedMappings': removed, 'addedMappings': added, 'unselectedMappingRecordsExact': True, 'changedDecisionIds': changed_decisions, 'wholeSourceGoalIdSetExact': True})
assert len(actual_removed) == 6
assert changed_pair_indexes == [4, 7, 13]
assert {(m['legacyGoalId'],m['canonicalGoalId']) for m in actual_removed} == expected_keys
records = read(AUTHOR / 'sources/six-whole-source-goals-all-current-partners-and-decisions.neutral.json')['records']
canonical = {g['id']:g for g in read(ROOT / after_config['landscapePath'])['goals']}
for r in records:
    before_source = read(ROOT / r['beforeExtraction']['path'])
    after_source = read(ROOT / r['afterExtraction']['path'])
    assert next(g for g in before_source['sourceGoals'] if g['id'] == r['sourceGoalId']) == r['wholeBeforeSourceGoal']
    assert next(g for g in after_source['sourceGoals'] if g['id'] == r['sourceGoalId']) == r['wholeAfterSourceGoal']
    for goal in r['wholeCurrentBeforeCanonicalPartners']:
        assert canonical[goal['id']] == goal, goal['id']
hb037 = records[0]
assert hb037['wholeAfterSourceDecisions'][0]['status'] == 'needs_canonical_goal'
assert hb037['wholeAfterSourceDecisions'][0]['decision'] == 'needs_canonical_goal'
assert hb037['wholeAfterSourceDecisions'][0]['canonicalGoalIds'] == []
assert hb037['wholeBeforeSourceGoal'] == hb037['wholeAfterSourceGoal']
assert len(hb037['wholeAfterMappingRecords']) == 0

spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
mod = importlib.util.module_from_spec(spec)
spec.loader.exec_module(mod)
portability_errors = mod.curriculum_symlink_errors(ROOT)
assert portability_errors == [], portability_errors
parsed = []
for package in [OWN, AUTHOR]:
    for p in sorted(package.rglob('*')):
        assert not p.is_symlink(), p
        if p.suffix == '.json':
            read(p); parsed.append(binding(p))
        elif p.suffix == '.jsonl':
            for line in p.read_text().splitlines():
                if line.strip(): json.loads(line)
            parsed.append(binding(p))
write(OWN / 'checks/bindings-json-portability-history-and-all31-deltas.actual.json', {
    'schemaVersion': 1,
    'authorPinnedOwnBindingCount': len(freeze['ownBindings']),
    'authorPinnedExternalBindingCount': len(freeze['externalBindings']),
    'allAuthorPinnedBindingsExactRegularCommittable': True,
    'historicalExactByteBindingCount': len(history['files']),
    'historicalJudgmentAndFIRSTBytesExact': True,
    'genuineOwnFirstJudgmentAndFreezeUnchanged': True,
    'whole31PairChecks': pair_checks,
    'changedPairIndexes': changed_pair_indexes,
    'mappingRecordsRemoved': 6,
    'allOtherMappingRecordsAndUnselectedDecisionsExact': True,
    'boundedSourceMetadataChanges': source_changes,
    'wholeNeutralSourceGoalAndCanonicalPartnerSnapshotsEqualActualInputObjects': True,
    'HB037RequiredSourceGoalExactAndNeedsCanonicalGoalOpen': True,
    'ordinaryCurriculumSymlinkErrors': portability_errors,
    'ordinaryParsedJsonAndJsonl': parsed,
    'sourceMappingCompletionClaimed': False,
    'humanApproved': 0, 'strictGain': 0, 'activeWrites': []
})
print(json.dumps({'authorBindingsExactRegularCommittable': len(all_bindings), 'historicalExactBindings': len(history['files']), 'all31PairsOnlySixRemovals': True, 'sourceMetadataOnlyHHScopesAndSLTargets': True, 'ordinaryJsonAndJsonlFilesParsed': len(parsed), 'curriculumSymlinkErrors': portability_errors, 'HB037Open': True, 'strictGain': 0, 'humanApproved': 0}))
