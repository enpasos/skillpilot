# SPDX-License-Identifier: Apache-2.0
"""Serialize seven already reviewed partial alcohol components, preserving history."""
import copy
import hashlib
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path

R = Path.cwd()
E = R / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16'
O = E / 'chemie-alcohol-seven-normal-source-adapter-author-20261016-v1'
AUTHOR = E / 'chemie-grignard-alcohol-fourteen-findings-whole-author-successor-20261016-v1'
SOURCE = AUTHOR / 'sources/SEVEN.whole-source-rows-final-partners-and-specific-components.json'
SCIENCE = E / 'chemie-grignard-alcohol-final-fourteen-findings-informed-independent-followup-20261016-v2/FOLLOWUP.seven-whole-source-component-decisions.json'
CONFIG = R / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json'
CANONICAL = E / 'chemie-four-package-joint576-portable-technical-context-20261016-v1/candidate/CANONICAL.joint576.closed-schema-and-six-assets.technical-preview.json'
NOW = datetime.now(timezone.utc).isoformat()

def read(p):
    return json.loads(p.read_text())

def pin(p):
    p = Path(p)
    p = p if p.is_absolute() else R / p
    b = p.read_bytes()
    return {'path': p.relative_to(R).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def verify(v):
    p = R / v['path']
    assert pin(p) == v, v
    return p

def objhash(v):
    return 'sha256:' + hashlib.sha256(json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def put(p, v):
    p.parent.mkdir(parents=True, exist_ok=True)
    assert not p.exists(), p
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')

assert not O.exists(), 'Never overwrite sealed output'
assert pin(SOURCE)['sha256'] == 'sha256:cd66e3f68013b9d3a20ad7e2a5a0a0967e1b5393f08feaa29def984af0210546'
assert pin(SCIENCE)['sha256'] == 'sha256:c18eaa6e752e6be9808f52d1f19a8ba0ba1faf36d0c3d1e6824402ccb6f840c5'
assert pin(CONFIG)['sha256'] == 'sha256:da3e18b54ff65e72c15f7f87a160f38d952362d468ece0b9893f32e3e7958782'
assert pin(CANONICAL)['sha256'] == 'sha256:2b74fcb6526033a6e1ae3abcdd9966d75e653e0657c407a55009dbf125e09c10'
rows = read(SOURCE)['sourceRows']
science = {d['sourceGoalId']: d for d in read(SCIENCE)['decisions']}
config = read(CONFIG)
canon = read(CANONICAL)
targets = {g['id'] for g in canon['goals']}
mappings = [(R / p, read(R / p)) for p in config['mappingPaths']]
before = []
for row in rows:
    ep = verify(row['sourceExtraction'])
    e = read(ep)
    g = row['wholeSourceGoal']
    assert [s for s in e['sourceGoals'] if s['id'] == g['id']] == [g]
    passages = [p for p in e['passages'] if p['id'] in {p['id'] for p in row['wholeSourcePassages']}]
    assert passages == row['wholeSourcePassages'], g['id']
    matches = [(p, m) for p, m in mappings if m['sourceExtractionPath'] == row['sourceExtraction']['path'] and any(d['sourceGoalId'] == g['id'] for d in m['decisions'])]
    assert len(matches) == 1, (g['id'], [str(p) for p, _ in matches])
    mp, m = matches[0]
    ds = [d for d in m['decisions'] if d['sourceGoalId'] == g['id']]
    es = [x for x in m['mappings'] if x['legacyGoalId'] == g['id']]
    assert len(ds) == 1 and set(ds[0]['canonicalGoalIds']) == set(row['previousPartnerGoalIds'])
    assert set(x['canonicalGoalId'] for x in es) == set(row['previousPartnerGoalIds'])
    assert m['sourceLandscapeId'] == e['sourceLandscapeId'] and m['targetLandscapeId'] == canon['landscapeId']
    assert science[g['id']]['sourceTextAndWholePassageExactlyPreserved']
    assert not science[g['id']]['wholeSourceUnionApproved']
    before.append((row, ep, e, mp, m, ds[0], es))

O.mkdir(parents=True)
outputs, operations, actual, preserved = [], [], [], []
for row, ep, e, mp, old_m, old_d, old_edges in before:
    g = row['wholeSourceGoal']
    gid = g['id']
    m = copy.deepcopy(old_m)
    components = row['proposedSpecificComponents']
    additions = []
    for component in components:
        target = component['canonicalGoalId']
        assert target in targets and target not in old_d['canonicalGoalIds']
        # Historical BW references have an intentional review-id suffix.
        decision_refs = {x['reviewDecisionId'] for x in old_edges}
        assert len(decision_refs) == 1
        edge = {'legacyGoalId': gid, 'canonicalGoalId': target, 'matchType': 'partial', 'reviewDecisionId': next(iter(decision_refs))}
        m['mappings'].append(edge)
        additions.append(edge)
    d = copy.deepcopy(old_d)
    d['canonicalGoalIds'] = old_d['canonicalGoalIds'] + [x['canonicalGoalId'] for x in additions]
    d.update(
        reviewedAt=NOW,
        reviewer='/root, technical serialization author of already independently reviewed bounded alcohol components',
        rationale='Informed author candidate: retain every historical source partner and add only the explicitly independently supported partial component(s). The entire official source wording, all source occurrences, the complete passages, original partner edges and their order remain unchanged. The former historical complete-coverage rationale is preserved in the before operation, not reasserted as current acceptance. No complete source-partner union, entire course or laboratory/learner performance is approved by this serialization.',
        reviewAuthority='ai_candidate',
        reviewStatus='informed-author-candidate',
        boundedSourceEvidence={'originalWholeAuthorSource': pin(SOURCE), 'originalInformedIndependentDisposition': pin(SCIENCE), 'specificComponents': components, 'sourceDutyWholeUnionApproved': False, 'otherRetainedPartnersNewlyApproved': False, 'practicalExecutionObserved': False, 'HumanApproval': False, 'HumanTrial': False},
    )
    m['decisions'] = [d if x['sourceGoalId'] == gid else x for x in m['decisions']]
    for k in old_m:
        if k not in ['mappings', 'decisions']:
            assert old_m[k] == m[k]
    assert m['mappings'][:-len(additions)] == old_m['mappings']
    assert [x for x in old_m['decisions'] if x['sourceGoalId'] != gid] == [x for x in m['decisions'] if x['sourceGoalId'] != gid]
    assert set(m) == set(old_m)
    ids = {x['id'] for x in e['sourceGoals']}
    counts = Counter(x['sourceGoalId'] for x in m['decisions'])
    assert set(counts) == ids and all(n == 1 for n in counts.values())
    edge_sets = defaultdict(set)
    assert len(m['mappings']) == len({(x['legacyGoalId'], x['canonicalGoalId']) for x in m['mappings']})
    for x in m['mappings']:
        assert x['legacyGoalId'] in ids and x['canonicalGoalId'] in targets
        assert x['reviewDecisionId'] and x['matchType'] in ['exact', 'partial']
        edge_sets[x['legacyGoalId']].add(x['canonicalGoalId'])
    for x in m['decisions']:
        assert set(x.get('canonicalGoalIds', [])) == edge_sets[x['sourceGoalId']]
        assert x['reviewer'] and x['reviewedAt'] and x['rationale']
    jurisdiction = e['jurisdiction']
    op = O / 'mappings' / (jurisdiction + '.whole-normal-mapping.alcohol-bounded.author.review.json')
    put(op, m)
    outputs.append({'jurisdiction': jurisdiction, 'sourceGoalId': gid, 'normalExtractionAlias': row['sourceExtraction']['path'], 'completeExtraction': pin(ep), 'extractionByteExactUnchanged': True, 'normalMappingAlias': mp.relative_to(R).as_posix(), 'completeMapping': pin(op), 'mappingBefore': pin(mp), 'addedPartialTargets': [x['canonicalGoalId'] for x in additions]})
    operations.append({'jurisdiction': jurisdiction, 'sourceGoalId': gid, 'wholeSourceGoalUnchanged': g, 'wholePassagesUnchanged': row['wholeSourcePassages'], 'extractionBeforeAndAfter': pin(ep), 'mappingBefore': pin(mp), 'wholeDecisionBefore': old_d, 'wholeDecisionAfter': d, 'wholeLegacyEdgeSetBefore': old_edges, 'wholeLegacyEdgeSetAfter': old_edges + additions, 'onlyAddedPartialEdges': additions, 'explicitIndependentComponentDisposition': science[gid], 'wholeSourceUnionApproved': False})
    preserved.append({'jurisdiction': jurisdiction, 'wholeExtractionFileBeforeAndAfter': pin(ep), 'wholeMappingHeadBeforeAndAfter': objhash({k:v for k,v in old_m.items() if k not in ['mappings', 'decisions']}), 'wholeOriginalLegacyArrayRetainedPrefixSHA256': objhash(old_m['mappings']), 'wholeUnaffectedDecisionArrayBeforeAndAfterSHA256': objhash([x for x in old_m['decisions'] if x['sourceGoalId'] != gid]), 'unmodifiedDecisionCount': len(old_m['decisions']) - 1})
    actual.append({'jurisdiction': jurisdiction, 'sourceGoalIdsUnique': len(ids) == len(e['sourceGoals']), 'oneDecisionPerCurrentSourceGoal': True, 'everyDecisionMatchesAllLegacyEdges': True, 'otherWholeObjectsAndHeadersUnchanged': True, 'addedEdgesPartialOnly': True, 'changedDecisions': 1, 'addedEdges': len(additions)})

assert len(outputs) == 7 and sum(len(x['addedPartialTargets']) for x in outputs) == 8
put(O / 'OPERATIONS.seven-whole-source-components.before-after.author.json', {'schemaVersion': 1, 'operations': operations})
put(O / 'PRESERVED.exact-seven-whole-source-files-and-unaffected-mapping-objects.json', {'schemaVersion': 1, 'rows': preserved})
put(O / 'CHECKS.actual-seven-pairs.structural-identity-only.json', {'schemaVersion': 1, 'rows': actual, 'allPassed': True, 'actualAtlasBuilds': 0, 'Native': 0, 'Central': 0})
put(O / 'NEUTRAL.seven-complete-normal-source-and-mapping-pairs.author.json', {'schemaVersion': 1, 'role': 'Seven actual complete historical-format mapping candidates and seven byte-exact whole extraction inputs, original informed serialized review pending', 'originalAuthorInput': pin(SOURCE), 'originalInformedScience': pin(SCIENCE), 'actualBaselineAtlasInputSelection': pin(CONFIG), 'canonicalContext': pin(CANONICAL), 'rows': outputs, 'normalAliasContract': 'Mappings retain their original logical sourceExtractionPath. Complete extraction bytes are unmodified existing repo files, not duplicated wrappers. Overlay changed mapping bytes at explicit normalMappingAlias only in a new isolated host.', 'wholeSourceUnionApproved': False, 'wholeCourseApproved': False, 'newSourceGoalIds': 0, 'actualSourceTextsOrPassagesChanged': 0, 'historicalSummaryFieldsRetainedUnchanged': True, 'HumanApproval': False, 'HumanTrial': False})
put(O / 'OUTPUTS.finite-seven-alcohol-normal-source-adapter.author-selector.json', {'schemaVersion': 1, 'role': 'Bounded actual serialized author result; original informed review and exact-key shared-source integration pending', 'neutralInputs': pin(O / 'NEUTRAL.seven-complete-normal-source-and-mapping-pairs.author.json'), 'beforeAfterOperations': pin(O / 'OPERATIONS.seven-whole-source-components.before-after.author.json'), 'preservedWholeObjects': pin(O / 'PRESERVED.exact-seven-whole-source-files-and-unaffected-mapping-objects.json'), 'actualStructuralChecks': pin(O / 'CHECKS.actual-seven-pairs.structural-identity-only.json'), 'completeExtractionInputsByteExact': 7, 'completeMappingOutputs': 7, 'newPartialComponentEdges': 8, 'independentScienceVotes': 0, 'NormalPAMV': 0, 'Native': 0, 'Central': 0, 'activeWrites': 0, 'GitWrites': 0})
print(json.dumps({'selector': pin(O / 'OUTPUTS.finite-seven-alcohol-normal-source-adapter.author-selector.json'), 'changedMappingCount': len(outputs), 'addedEdges': 8, 'newScienceVotes': 0}, indent=2))
