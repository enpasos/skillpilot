"""Exact read-only targeted review of two separate source/canonical alternatives."""
import copy
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
AUTHOR = BASE / 'chemie-b007-bw-three-source-locator-targeted-author-v5'
OWN = BASE / 'chemie-b007-bw-source-locator-version-independent-b-v5'
PARA3 = 'bw-chem-seki-3-2-1-2-b03-a01-1f9ce38a'

def read(p): return json.loads(Path(p).read_text())
def bind(p):
    p = Path(p)
    return {'path': str(p), 'sha256': hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}
def write(name, data): (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
def digest(data): return hashlib.sha256(json.dumps(data, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()
def diff(a, b, pointer=''):
    if type(a) != type(b): return [{'pointer': pointer, 'before': a, 'after': b}]
    if isinstance(a, dict):
        assert a.keys() == b.keys(), pointer
        return [d for k in a for d in diff(a[k], b[k], pointer + '/' + k)]
    if isinstance(a, list):
        assert len(a) == len(b), pointer
        return [d for i in range(len(a)) for d in diff(a[i], b[i], pointer + '/' + str(i))]
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

def cross_baseline_diff(a, b, pointer=''):
    """Diagnostic only: distinguish old B007 candidates from the current canon."""
    if type(a) != type(b): return [{'pointer': pointer, 'before': a, 'after': b}]
    if isinstance(a, dict):
        changes = []
        for k in sorted(a.keys() | b.keys()):
            p = pointer + '/' + k
            if k not in a:
                changes.append({'pointer': p, 'beforeFieldAbsent': True, 'after': b[k]})
            elif k not in b:
                changes.append({'pointer': p, 'before': a[k], 'afterFieldAbsent': True})
            else:
                changes.extend(cross_baseline_diff(a[k], b[k], p))
        return changes
    if isinstance(a, list):
        if len(a) != len(b): return [{'pointer': pointer, 'before': a, 'after': b}]
        return [d for i in range(len(a)) for d in cross_baseline_diff(a[i], b[i], pointer + '/' + str(i))]
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

fpath = AUTHOR / 'bw-b007-locator-and-version-targeted-author-v5.final.freeze.json'
freeze = read(fpath)
assert bind(fpath)['sha256'] == '55eda10424162ec765a96eef919fd2d055355cc9c53617a7bfa6ee0ba1c2d87e'
checks = []
for entry in freeze['files']:
    actual = bind(AUTHOR / entry['path'])
    assert actual['sha256'] == entry['sha256'] and actual['bytes'] == entry['bytes']
    checks.append({'group': 'author-relative-payload', 'relativeAuthorPath': entry['path'], **actual, 'exact': True})
for entry in freeze['boundInputs']:
    actual = bind(entry['path'])
    assert actual['sha256'] == entry['sha256'] and actual['bytes'] == entry['bytes']
    checks.append({'group': 'external-repo-bound-input', **actual, 'exact': True})
assert len(freeze['files']) == 43 and len(freeze['boundInputs']) == 28

sek1 = read(AUTHOR / 'inputs-original/BW-SekI.source-extraction.original.json')
sub = read(AUTHOR / 'raw-candidates/BW-SekI.source-extraction.author-candidate.json')
eight = read(AUTHOR / 'raw-candidates/BW-SekI-eight-paragraph-locators-and-V2-URL.separate-author-candidate.json')
sek2 = read(AUTHOR / 'inputs-original/BW-SekII-URL-only.source-extraction.original.json')
sek2new = read(AUTHOR / 'raw-candidates/BW-SekII-URL-only.source-extraction.author-candidate.json')
assert sek1['sourceDocument'] == sek2['sourceDocument']
assert sub['sourceDocument'] == eight['sourceDocument'] == sek2new['sourceDocument']
url_delta = diff(sek2, sek2new)
assert [d['pointer'] for d in url_delta] == ['/sourceDocument/url']
retrieval = read(OWN / 'actual-official-https-pdf-retrieval.independent-b.json')['receipts']
new_download = next(d for d in retrieval if 'V2%' in d['requestedURL'])
old_download = next(d for d in retrieval if 'V2%' not in d['requestedURL'])
assert sub['sourceDocument']['url'] == new_download['requestedURL']
assert sek1['sourceDocument']['url'] == old_download['requestedURL']
assert new_download['sha256'] == bind('curricula/DE/Gymnasium/input/BW/BP2016BW_ALLG_GYM_CH_V2.pdf')['sha256']
assert old_download['sha256'] != new_download['sha256']
original_deltas, eight_deltas = diff(sek1, sub), diff(sek1, eight)
assert len(original_deltas) == 2 and len(eight_deltas) == 9
assert original_deltas[0]['pointer'] == eight_deltas[0]['pointer'] == '/sourceDocument/url'
para3index = next(i for i, g in enumerate(sek1['sourceGoals']) if g['id'] == PARA3)
assert original_deltas[1]['pointer'] == f'/sourceGoals/{para3index}/sourceRef'
source_ids = []
paragraphs = []
for n, d in zip(range(3, 11), eight_deltas[1:]):
    i = int(d['pointer'].split('/')[2])
    goal = eight['sourceGoals'][i]
    assert d['pointer'] == f'/sourceGoals/{i}/sourceRef'
    assert goal['sourceSpan'] == f'3.2.1.2 ({n})'
    assert 'S. 15.' in d['before'] and 'S. 16.' in d['after']
    source_ids.append(goal['id'])
    paragraphs.append({'paragraph': n, 'sourceGoalId': goal['id'], 'actualPhysicalPage1Based': 18, 'actualPrintedPage': 16, 'onlyChangedSourceField': 'sourceRef', 'sourceTextOperatorAndGradeTagsExactlyPreserved': {k: v for k, v in goal.items() if k != 'sourceRef'} == {k: v for k, v in sek1['sourceGoals'][i].items() if k != 'sourceRef'}})
assert sek1['passages'] == sub['passages'] == eight['passages']
for g in sek1['sourceGoals']:
    if g.get('sourceSpan') in ['3.2.1.2 (1)', '3.2.1.2 (2)']:
        assert g == next(x for x in eight['sourceGoals'] if x['id'] == g['id'])
        assert 'S. 15.' in g['sourceRef']

can_deltas, can_data = [], {}
for lane in ['chemie-B007-v4-base', 'chemie-current-active-base-alternative']:
    before = read(AUTHOR / f'inputs-original/{lane}.canonical.original.json')
    after = read(AUTHOR / f'raw-candidates/{lane}.canonical.author-candidate.json')
    changes = diff(before, after)
    assert len(changes) == 5
    rows = []
    for d in changes:
        i = int(d['pointer'].split('/')[2]); g = after['goals'][i]
        assert d['pointer'] == f'/goals/{i}/extendedData/provenance/sourceRef'
        assert g['extendedData']['provenance']['sourceGoalId'] == PARA3
        assert 'S. 15.' in d['before'] and 'S. 16.' in d['after']
        rows.append({'goalId': g['id'], 'title': g['title'], **d})
    can_deltas.append({'lane': lane, 'before': bind(AUTHOR / f'inputs-original/{lane}.canonical.original.json'), 'after': bind(AUTHOR / f'raw-candidates/{lane}.canonical.author-candidate.json'), 'exactFiveOnlySourceRefDeltas': rows, 'noTextGraphResourceAssetOrOtherFieldChangesAgainstThisOwnBaseline': True})
    can_data[lane] = {'before': {g['id']: g for g in before['goals']}, 'after': {g['id']: g for g in after['goals']}}
assert {r['goalId'] for r in can_deltas[0]['exactFiveOnlySourceRefDeltas']} == {r['goalId'] for r in can_deltas[1]['exactFiveOnlySourceRefDeltas']}
active = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
assert active == read(AUTHOR / 'inputs-original/chemie-current-active-base-alternative.canonical.original.json')
active_by = {g['id']: g for g in active['goals']}
protected_snapshot = read(AUTHOR / 'current127-protected-membership-and-actual-whole-source-goal-binding.snapshot.json')
report = read(protected_snapshot['reportBinding']['path'])
subject = next(s for s in report['subjects'] if s['subject'] == 'chemie')
protected_ids = subject['strictCompleteGoalIds']
assert len(protected_ids) == len(set(protected_ids)) == subject['strictComplete'] == 127
assert subject['denominator'] == 378
assert set(protected_ids) == {r['goalId'] for r in protected_snapshot['all127WholeCurrentGoals']}
protected_rows = []
v4_current_differences = []
for record in protected_snapshot['all127WholeCurrentGoals']:
    gid = record['goalId']; current = active_by[gid]
    assert current == record['wholeCurrentGoal']
    alt = can_data['chemie-current-active-base-alternative']['after'][gid]
    changes = diff(current, alt)
    assert not changes or [x['pointer'] for x in changes] == ['/extendedData/provenance/sourceRef']
    protected_rows.append({'goalId': gid, 'actualCurrentWholeGoalStableSha256': digest(current), 'prospectiveCurrentBaseWholeGoalStableSha256': digest(alt), 'wholeExact': not changes, 'onlySourceRefDelta': changes})
    old_v4 = can_data['chemie-B007-v4-base']['after'][gid]
    d = cross_baseline_diff(current, old_v4)
    if d: v4_current_differences.append({'goalId': gid, 'wholeCurrentVsB007v4CandidateDeltas': d})
assert sum(r['wholeExact'] for r in protected_rows) == 123
assert sum(bool(r['onlySourceRefDelta']) for r in protected_rows) == 4

review = read(AUTHOR / 'inputs-original/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json')
runtime = read(AUTHOR / 'inputs-original/bw_chemistry_lower_secondary_to_canonical_chemistry.json')
live_review_path = 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json'
live_runtime_path = 'curricula/DE/Gymnasium/mapping/DE-BW/lower-secondary/bw_chemistry_lower_secondary_to_canonical_chemistry.json'
assert review == read(live_review_path) and runtime == read(live_runtime_path)
mapped = [r for r in review['mappings'] if r['legacyGoalId'] in source_ids]
runtime_mapped = [r for r in runtime['mappings'] if r['legacyGoalId'] in source_ids]
assert {(r['legacyGoalId'], r['canonicalGoalId']) for r in runtime_mapped} == {(r['legacyGoalId'], r['canonicalGoalId']) for r in mapped}
targets = sorted({r['canonicalGoalId'] for r in mapped})
assert len(mapped) == 15 and len(targets) == 12
decisions = [r for r in review['decisions'] if r['sourceGoalId'] in source_ids]
assert len(decisions) == 8
para3_mapped = [r for r in mapped if r['legacyGoalId'] == PARA3]
assert len(para3_mapped) == 3
assert len({r['canonicalGoalId'] for r in para3_mapped}) == 3
mapped_protected = sorted(set(targets) & set(protected_ids))
assert mapped_protected == protected_snapshot['existingMappedTargetIntersection127']
def descendants(gid):
    pending, result = [gid], set()
    while pending:
        current = pending.pop()
        if current in result: continue
        result.add(current); pending.extend(active_by[current].get('contains', []))
    return result
potential = set().union(*(descendants(i) for i in targets))
holds = read(AUTHOR / 'actual-target-source-binding-reach-and-preserved-holds.author-candidate.json')['remainingHolds']
assert holds['nationalSourceObligations'] == 403 and holds['originalMatchedRows'] == 413 and holds['affectedExistingSourceViews'] == 40
assert holds['existingBWViewTwoCPV009AndFacetSelectionHold']['currentViewChangedByReviewer'] is False
view_binding = holds['existingBWViewTwoCPV009AndFacetSelectionHold']['sourceViewBinding']
assert bind(view_binding['path']) == view_binding
view = read(view_binding['path'])
assert view['scope'] == {'schoolForm': 'Gymnasium', 'jurisdiction': 'DE-BW', 'stage': 'SekI'}
affected_view_ids = {'53fd1bfd-facb-54ae-b2dc-f667ed1414fc', '7be6f951-a614-52dc-94d3-2ce0d33765ff'}
view_rows = []
def read_view_nodes(nodes, parent=''):
    for i, node in enumerate(nodes):
        node_path = f'{parent}.{i}' if parent else str(i)
        if node.get('goalId') in affected_view_ids:
            view_rows.append({'nodePath': node_path, 'actualNode': node, 'effectiveProjectionRole': node.get('projectionRole', 'target'), 'actualCurrentCanonicalType': active_by[node['goalId']].get('type'), 'B007v4CandidateCanonicalType': can_data['chemie-B007-v4-base']['after'][node['goalId']].get('type')})
        read_view_nodes(node.get('children', []), node_path)
read_view_nodes(view['rootNodes'])
assert {r['actualNode']['goalId'] for r in view_rows} == affected_view_ids
assert {r['nodePath'] for r in view_rows} == {'0.28', '0.51'}
assert all(r['actualNode']['kind'] == 'goalEntry' and r['effectiveProjectionRole'] == 'target' for r in view_rows)

write('source-url-locator-canonical-and-current127.actual-independent-b.json', {
    'schemaVersion': 1, 'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'authorFreeze': bind(fpath), 'actualAuthor43AndExternal28Checks': checks,
    'actualPrimaryDownloads': retrieval, 'bothSourceDocumentURLsIdenticalAndCorrectV2': True,
    'sourceDocumentFieldsOtherThanURLUnchanged': True, 'originalParagraph3SubsetExactTwoFieldChanges': original_deltas,
    'separateEightParagraphAlternativeExactNineFieldChanges': eight_deltas, 'eightParagraphLocationDecisions': paragraphs,
    'headingAndParagraph1and2Page15ExactlyPreserved': True, 'allSourceTextsOperatorsGradeAndStatusFieldsUnchanged': True,
    'separateCanonicalBaselines': can_deltas, 'activeWholeCanonicalInputExactAuthorCurrentBase': True,
    'currentStrictMembership': {'report': protected_snapshot['reportBinding'], 'denominator': 378, 'strictCount': 127, 'wholeCurrentGoalsIndependentlyChecked': 127, 'afterCurrentMetadataCandidateWholeExact': 123, 'afterCurrentMetadataCandidateOnlySourceRefDelta': 4, 'rows': protected_rows},
    'B007v4IsNotCurrent127Replacement': {'mustNotOverwriteCurrentActiveCanonical': True, 'currentProtectedDifferences': v4_current_differences},
    'originalParagraph3ThreeMappingRowsExactAndNotNewlyApproved': para3_mapped,
    'eightParagraph15MappingRows12DirectTargetsExactAndNotNewlyApproved': {'rows': mapped, 'decisions': decisions, 'runtimeRows': runtime_mapped, 'directTargetIds': targets, 'directProtectedIntersection127': mapped_protected},
    'potentialContainsReachOnlyNotSourceCoverageOrAuthoredProjection': {'goalIds': sorted(potential), 'protectedIntersection127': sorted(potential & set(protected_ids)), 'method': 'Read-only traversal of actual current contains edges; no SourceAtlas/View compile or facet selection and no source coverage approval'},
    'actualExistingWholeMappingRowsStatusAndDatesUnchanged': True, 'preservedStatusHolds': holds,
    'actualExistingBWSourceViewReferences': {'binding': view_binding, 'scope': view['scope'], 'rows': view_rows, 'existingViewByteExact': True, 'prospectiveB007ClusterConversionCPV009HoldsNotClaimedAsCurrentActiveMetadataOnlyErrors': True, 'sourceFacetSelectionOrChildExpansionApproved': False},
    'laterRequiredDeltaQS': 'Changed four protected sourceRef fields plus cluster, selected source documents/URL/version, country/source scopes, source/page/context/image-dependent bindings. No new science restart for unchanged text with valid evidence.',
    'nativePageContextBindingApprovalIssued': False, 'sourceSupersetApprovalIssued': False, 'sourceHoldsCleared': 0,
    'newScientificClosures': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0, 'newPeerReviewRead': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': False,
})
print(json.dumps({'author43AndInputs28Exact': True, 'originalSourceFields': len(original_deltas), 'separateEightSourceFields': len(eight_deltas), 'canonicalFieldsPerSeparateBase': [len(x['exactFiveOnlySourceRefDeltas']) for x in can_deltas], 'protectedCurrent127': {'wholeExactAfter': 123, 'onlySourceRefChanged': 4}, 'mappingRows': 15, 'directTargets': 12, 'directProtectedIntersection': mapped_protected, 'potentialContainsProtectedCount': len(potential & set(protected_ids)), 'B007v4VsCurrentProtectedDifferentCount': len(v4_current_differences), 'holdsPreserved': True, 'activeWrites': False}, ensure_ascii=False))
