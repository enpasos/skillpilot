import collections
import datetime
import hashlib
import json
from pathlib import Path

import jsonschema

ROOT = Path(__file__).resolve().parent
REPO = Path.cwd()
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/chemie-b008-source-view-placements-author-resumed-v1')
FIRST = ROOT / 'own-bw-source-placement.first-independent-verdict.json'
FROZEN = '9ffcaa2e0c159113c6dbb0d2eda65ffebe28f28ff9b6114e5372e4230cd47a1e'

def read(p):
    return json.loads(Path(p).read_text())

def bind(p):
    p = Path(p)
    data = p.read_bytes()
    return {'path': str(p.relative_to(REPO) if p.is_absolute() else p), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, data):
    p = ROOT / name
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as handle:
        handle.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

def value_hash(data):
    return hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

assert bind(FIRST)['sha256'] == FROZEN
first = read(FIRST)
mapping = read(AUTHOR / 'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json')
original_path = Path('curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json')
original = read(original_path)
extraction_path = Path(mapping['sourceExtractionPath'])
extraction = read(extraction_path)
by_source = collections.defaultdict(list)
for component in first['componentDecisions']:
    assert component['decision'] == 'approve_bounded_partial_component'
    by_source[component['sourceGoalId']].append(component)
assert len(by_source) == 9
sources = {row['id']: row for row in extraction['sourceGoals']}
now = datetime.datetime.now(datetime.timezone.utc).isoformat()
remaining = {row['sourceSpan'].replace(' ', ''): row['holdDe'] for row in first['wholeSourceAndContextHolds']}
proposals = []
boundaries = []
for row in mapping['decisions']:
    sid = row['sourceGoalId']
    if sid not in by_source:
        continue
    prior = next(r for r in original['decisions'] if r['sourceGoalId'] == sid)
    assert row['historicalDecisionBeforeCandidate'] == prior
    original_partners = prior['canonicalGoalIds']
    new_children = [r['canonicalGoalId'] for r in by_source[sid]]
    assert set(row['canonicalGoalIds']) == set(original_partners + new_children)
    reason = 'Unabhängige Prüfung B der begrenzten partiellen Bindungen am 8. Oktober 2026. ' + ' '.join(c['ownRationaleDe'] for c in by_source[sid])
    hold = remaining[sources[sid]['sourceSpan'].replace(' ', '')]
    reason += ' Alle ursprünglichen Partner bleiben erhalten; frühere Familienbindungen sind keine automatische Ganzabdeckung ihrer neuen Kinder. Offene ganze Pflicht: ' + hold
    row['decision'] = 'mapped'
    row['rationale'] = reason
    row['reviewedAt'] = '2026-10-08'
    row['reviewer'] = 'codex-independent-b-bw-source-placement-2026-10-08'
    # No overall matchType: original edge-specific types, including older
    # partners, remain unchanged through the normal raw-row fallback.
    proposals.append({k: row[k] for k in ['sourceGoalId', 'topicCode', 'sourceSpan', 'decision', 'canonicalGoalIds', 'rationale', 'reviewedAt', 'reviewer']})
    boundaries.append({'sourceGoalId': sid, 'sourceSpan': sources[sid]['sourceSpan'], 'originalPartnerGoalIds': original_partners,
                       'boundedAddedPartialChildGoalIds': new_children, 'newComponentsScientificallyReviewed': True,
                       'wholeSourceDutyIndependentlyApproved': False, 'wholeRoutineExactApproved': False, 'remainingWholeDutyDe': hold})
mapping['reviewId'] = mapping['reviewId'] + '-independent-b-bounded-proposal-20261008'
mapping['status'] = 'inactive_independent_b_bounded_proposal_whole_source_HOLD'
mapping['updatedAt'] = now
mapping['note'] = 'B independently reviewed twelve added partial components and the authored BW SekI role selection after freezing its first verdict. Original 124 mapping rows and 56 unaffected decisions are exact retained. Whole source duties remain HOLD; this inactive proposal is not source/M7/human approval.'
mapping['summary'] = {'originalMappingRows': 124, 'candidateMappingRows': 136, 'newPartialComponentRows': 12, 'independentlyDecidedSourceIDs': 9, 'wholeSourceDutyApprovalsAdded': 0, 'activeWrites': 0, 'humanApproval': False}
proposal_binding = write('own-bw-nine-normal-mapping-decision-fields.independent-proposal.json', {
    'schemaVersion': 1, 'role': 'Normal review fields proposed by independent B after own first frozen verdict', 'createdAtUTC': now,
    'firstIndependentVerdict': bind(FIRST), 'parentReviewInput': bind(AUTHOR / 'candidate-source-mappings/BW-SekI.source-mapping.author-candidate.json'),
    'decisions': proposals, 'scopeBoundaries': boundaries, 'mappedIsOnlyTheBoundedMappingDecision': True,
    'wholeSourceDutyApproval': False, 'combinedABApproval': False, 'sourceGreen': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
complete_binding = write('candidate-source-mappings/BW-SekI.source-mapping.independent-b.bounded-proposal.json', mapping)
obligations = read(AUTHOR / 'original-whole-duty-and-program-placement.obligations.json')
witness = read(obligations['national1646OriginalDutyInventory']['path'])
for whole in obligations['wholeFiveOriginalBWFamilyDuties']:
    assert whole == witness['originalWholeDuties'][whole['originArrayIndex']]
    assert any(r['legacyGoalId'] == whole['sourceGoalId'] and r['canonicalGoalId'] == whole['familyGoalId'] for r in mapping['mappings'])
open_binding = write('own-bw-precise-open-whole-source-and-context-obligations.json', {
    'schemaVersion': 1, 'role': 'B independently identified preserved whole-source/context limits', 'firstIndependentVerdict': bind(FIRST),
    'wholeOriginal65SourceIDs': [s['id'] for s in extraction['sourceGoals']],
    'wholeFiveOriginalBWFamilyDutiesExactRetained': obligations['wholeFiveOriginalBWFamilyDuties'],
    'sourceIDBoundaries': boundaries, 'otherContextHolds': first['wholeSourceAndContextHolds'][-1:],
    'genuinePOrDRebindingNeededBeforeBWWholeSourceCompletion': True,
    'generalProcessTextCreatesNoNewSourceIDs': True,
    'strictGain': 0, 'sourceGreen': False, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
})

counter = lambda rows: collections.Counter(json.dumps(r, sort_keys=True, ensure_ascii=False) for r in rows)
assert not counter(original['mappings']) - counter(mapping['mappings'])
assert len(mapping['mappings']) == 136
assert all(r['matchType'] == 'partial' for r in mapping['mappings'][124:])
assert len({s['id'] for s in extraction['sourceGoals']}) == 65
assert set(obligations['allSourceGoalIdsExactlyRetained']) == set(sources)
for old, new in zip(original['decisions'], mapping['decisions'], strict=True):
    if old['sourceGoalId'] not in by_source:
        assert old == new
    else:
        assert set(old['canonicalGoalIds']).issubset(new['canonicalGoalIds'])
        assert new['historicalDecisionBeforeCandidate'] == old
        assert new['reviewer'] and new['reviewedAt'] and new['rationale']
raw_pairs = {(r['legacyGoalId'], r['canonicalGoalId']) for r in mapping['mappings']}
decision_pairs = {(d['sourceGoalId'], g) for d in mapping['decisions'] for g in d['canonicalGoalIds']}
assert len(raw_pairs) == len(mapping['mappings'])
assert raw_pairs == decision_pairs
canonical_path = AUTHOR / 'candidate/canonical.current504-bw-source-view.author-candidate.json'
canonical = read(canonical_path)
schema_path = Path('docs/landscape-runtime.schema.json')
jsonschema.Draft202012Validator.check_schema(read(schema_path))
jsonschema.validate(canonical, read(schema_path))
nodes = {g['id']: g for g in canonical['goals']}
for relation in ['requires', 'contains']:
    seen = set()
    active = set()
    def visit(gid):
        assert gid not in active, (relation, gid)
        if gid in seen:
            return
        active.add(gid)
        for target in nodes[gid][relation]:
            target = target.removeprefix(canonical['landscapeId'] + ':')
            assert target in nodes, (gid, target)
            visit(target)
        active.remove(gid)
        seen.add(gid)
    for gid in nodes:
        visit(gid)
snapshot = read(first['inputBindings'][-1]['path'])
for routine in snapshot['routineBodies']:
    assert all(routine['wholeGoal'].get(k) == nodes[routine['wholeGoal']['id']].get(k) for k in ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains'])
for original_binding in first['inputBindings']:
    assert bind(original_binding['path']) == original_binding, original_binding['path']
own_symlinks = [str(p) for p in ROOT.rglob('*') if p.is_symlink()]
assert not own_symlinks
check_binding = write('checks/ordinary-affected-preservation-runtime-schema.actual.json', {
    'schemaVersion': 1, 'role': 'Actual narrow B ordinary schema/preservation/DAG checks; not scientific acceptance', 'createdAtUTC': now,
    'firstVerdictSHA256StillExact': FROZEN, 'schema': bind(schema_path), 'runtimeLandscape': bind(canonical_path),
    'normalRuntimeSchemaPassed': True, 'ordinarySchemaActuallyAppliedDespiteQualityPath': True,
    'requiresAndContainsAcyclic': True, 'nodeCount': len(nodes), 'noDanglingReferences': True,
    'original65SourceIDsExactRetained': True, 'original124MappingRowsExactRetained': True, 'candidateMappings': len(mapping['mappings']),
    'addedPartialMappings': 12, 'normalDecisionsCoverExactlyOriginal65SourceIDs': True,
    'rawMappingsEqualAuthoritativeDecisionEdgeSet': True, 'unaffected56DecisionsExactRetained': True,
    'originalFiveFamilyDutiesExactRetained': True, 'all26ScientificGoalBodiesExactRetained': True,
    'allFrozenInputHashesStillExact': True, 'ownedTreeSymlinks': own_symlinks,
    'noHelperOrProtectedRuntimeEdits': True, 'candidateMapping': complete_binding,
    'wholeSourceApproval': False, 'sourceGreen': False, 'strictGain': 0, 'activeWrites': 0, 'humanApproval': False,
})
print(json.dumps({'normalProposal': proposal_binding, 'candidateMapping': complete_binding, 'openObligations': open_binding, 'ordinaryChecks': check_binding}, ensure_ascii=False))
