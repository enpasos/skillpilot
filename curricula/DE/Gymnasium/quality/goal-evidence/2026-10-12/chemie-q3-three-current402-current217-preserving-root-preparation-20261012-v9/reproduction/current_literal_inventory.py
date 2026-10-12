"""Bind the complete literal Q3 inventory to selected current mapping files."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
E = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OUT = E / 'chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9'
V8 = E / 'chemie-q3-three-current402-real-method-source-author-20261012-v8'

def read(p):
    return json.loads((ROOT / p).read_text())

def put(p, d):
    f = ROOT / OUT / p
    assert not f.exists(), f
    f.parent.mkdir(parents=True, exist_ok=True)
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

def sha(p):
    return 'sha256:' + hashlib.sha256((ROOT / p).read_bytes()).hexdigest()

old = read(V8 / 'sources/after.all-raw-sourceGoal-operators-and-fresh-normal-citations.inventory.json')
cfg = read(OUT / 'sources/current32-one-SH-review.inputs.json')
actual = {p: read(p) for p in cfg['mappingPaths']}
aliases = {}
alias_audit = []
for historical_path in sorted({r['mappingPath'] for r in old['rawRows']}):
    if historical_path in actual:
        aliases[historical_path] = historical_path
        continue
    historical = read(historical_path)
    matches = [p for p, m in actual.items() if m['sourceExtractionPath'] == historical['sourceExtractionPath']]
    assert len(matches) == 1, (historical_path, matches)
    current_path = matches[0]
    aliases[historical_path] = current_path
    alias_audit.append({'historicalMappingPath': historical_path, 'currentSelectedMappingPath': current_path, 'sourceExtractionPath': historical['sourceExtractionPath'], 'historicalMappingSha256': sha(historical_path), 'currentMappingSha256': sha(current_path), 'wholeMappingDataExact': historical == actual[current_path]})

inventory = copy.deepcopy(old)
changed = []
for i, previous in enumerate(old['rawRows']):
    current_path = aliases[previous['mappingPath']]
    mapping = actual[current_path]
    compatible = [r for r in mapping['mappings'] if r['legacyGoalId'] == previous['rawSourceGoalId']]
    assert any(r['canonicalGoalId'] == previous['mappedTargetGoalId'] for r in compatible), previous
    decisions = [d for d in mapping['decisions'] if d['sourceGoalId'] == previous['rawSourceGoalId']]
    assert len(decisions) == 1, (current_path, previous['rawSourceGoalId'])
    current = copy.deepcopy(previous)
    current['mappingPath'] = current_path
    current['wholeCompatibilityMappings'] = compatible
    current['wholeMappingDecision'] = decisions[0]
    if current != previous:
        changed.append({'ordinal': i, 'goalId': current['goalId'], 'sourceGoalId': current['rawSourceGoalId'], 'fields': [k for k in current if current[k] != previous[k]]})
    inventory['rawRows'][i] = current

# Ensure selected mapping aliases did not silently omit extra literal operators.
targets_by_goal = {}
for row in inventory['rawRows']:
    targets_by_goal.setdefault(row['goalId'], set()).add(row['mappedTargetGoalId'])
expected = {
    (gid, p, r['legacyGoalId'], r['canonicalGoalId'])
    for gid, target_ids in targets_by_goal.items()
    for p, mapping in actual.items()
    for r in mapping['mappings']
    if r['canonicalGoalId'] in target_ids
}
seen = {(r['goalId'], r['mappingPath'], r['rawSourceGoalId'], r['mappedTargetGoalId']) for r in inventory['rawRows']}
assert seen == expected, {'missing': sorted(expected - seen), 'extra': sorted(seen - expected)}
assert len(inventory['rawRows']) == len(seen) == 488

extractions = {p: read(p) for p in {r['sourceExtractionPath'] for r in inventory['rawRows']}}
for key, body in inventory['sourceGoals'].items():
    source_path, gid = key.split('#', 1)
    assert next(g for g in extractions[source_path]['sourceGoals'] if g['id'] == gid) == body['wholeSourceGoal'], key
for key, body in inventory['wholePassages'].items():
    source_path, pid = key.split('#', 1)
    assert next(p for p in extractions[source_path]['passages'] if p['id'] == pid) == body['wholePassage'], key

canonical = read(OUT / 'candidate/canonical523.current217-plus-exact-q3-three.inactive.json')
goals = {g['id']: g for g in canonical['goals']}
partner_changes = []
for gid, previous in inventory['wholeCanonicalPartnerGoals'].items():
    assert gid in goals
    if previous != goals[gid]:
        partner_changes.append(gid)
    inventory['wholeCanonicalPartnerGoals'][gid] = copy.deepcopy(goals[gid])
index_path = OUT / 'sources/current382.one-SH-change.normal-original-sources.json'
inventory.update(role='Actual current217-preserving raw source snapshot; no new scientific attribution', mappingPaths=cfg['mappingPaths'], freshNormalSourceIndex={'path': str(index_path), 'sha256': sha(index_path), 'bytes': (ROOT / index_path).stat().st_size})
inventory['currentMappingPathReplacementsByExactSourceExtractionIdentity'] = alias_audit
inventory['currentRawRouteChangesComparedWithAuthorV8'] = changed
inventory['currentWholePartnerGoalBodiesChangedComparedWithAuthorV8'] = partner_changes
inventory['normalizedEvidenceIDsRemainHistoricalLookupOnly'] = True
inventory['literalRouteCompletenessComparedWithActualSelectedMappings'] = True
inventory['newIndependentVotes'] = 0
inventory['strictGain'] = 0
put(Path('sources/current-selected32-all488-literal-raw-routes-and-whole-partners.actual.json'), inventory)
print(json.dumps({'literalRows': len(seen), 'wholeSourceGoals': len(inventory['sourceGoals']), 'wholePassages': len(inventory['wholePassages']), 'currentMappingPathReplacements': len(alias_audit), 'rawRowsChanged': len(changed), 'partnerBodiesChanged': partner_changes, 'strictGain': 0}))
