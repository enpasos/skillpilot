# SPDX-License-Identifier: Apache-2.0
"""Independent comparison of actual immutable targeted review inputs."""
import hashlib
import json
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-source-supplement-technical-author-resumed-v1'
ENTRY = AUTHOR / 'neutral-source-supplement-two-context-review.entry.json'
NEW_IDS = ['0f50cad3-8c4e-5bc4-8833-3a1ecdd71d38', '32483d30-2162-50a5-a6cc-05b7f2467ab1']
WORD = '576d59e2-397a-5654-b853-7c0c4870fbd3'
SUPPLEMENT = '76be4d99-5cf9-54a7-bb27-c296f4ecb939'
OLD_CLUSTER = '860c80f9-e463-598b-8ef8-79f65c12f235'
ROOT_ID = 'e8d54127-d42e-51f5-bfa5-51d826069f95'

def read(path):
    return json.loads(Path(path).read_text())

def digest(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def bind(path):
    path = Path(path)
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}

def write(path, value):
    with Path(path).open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

entry = read(ENTRY)
assert digest(ENTRY) == '1a56decb9f8340a2d3152c64f9aceb92f5f0cdaa1faa31a2b6d6e0e65ba9bb18'
declared = {}
def verify(item):
    if isinstance(item, dict):
        if 'path' in item and 'sha256' in item:
            path = ROOT / item['path']
            actual = bind(path)
            assert actual['sha256'] == item['sha256'].removeprefix('sha256:'), path
            if 'bytes' in item:
                assert actual['bytes'] == item['bytes'], path
            declared[item['path']] = actual
        for child in item.values():
            verify(child)
    elif isinstance(item, list):
        for child in item:
            verify(child)
verify(entry)

canon = read(ROOT / entry['canonicalCandidate']['path'])
baseline = read(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
before_goals = {g['id']: g for g in baseline['goals']}
goals = {g['id']: g for g in canon['goals']}
assert len(goals) == 479 and len(before_goals) == 476
assert set(goals) - set(before_goals) == set(NEW_IDS + [SUPPLEMENT])
assert all(goals[gid] == goal for gid, goal in before_goals.items() if gid != ROOT_ID)
assert all(goals[gid]['requires'] == goal['requires'] for gid, goal in before_goals.items())
assert goals[OLD_CLUSTER]['weight'] == 5 and len(goals[OLD_CLUSTER]['contains']) == 5
assert goals[ROOT_ID]['weight'] == before_goals[ROOT_ID]['weight'] == 1
root_except_contains = lambda g: {k: v for k, v in g.items() if k != 'contains'}
assert root_except_contains(goals[ROOT_ID]) == root_except_contains(before_goals[ROOT_ID])
assert goals[ROOT_ID]['contains'] == before_goals[ROOT_ID]['contains'] + [SUPPLEMENT]
assert goals[SUPPLEMENT]['contains'] == NEW_IDS
assert goals[SUPPLEMENT]['requires'] == goals[OLD_CLUSTER]['requires'] == ['b530a382-2786-5794-8821-3e01a62d88fd']
assert goals[SUPPLEMENT]['extendedData']['applicabilityMappingInheritance'] == 'boundary'
parents = {gid: [] for gid in goals}
for parent in goals.values():
    for child in parent['contains']:
        parents[child].append(parent['id'])
assert all(parents[gid] == [SUPPLEMENT] for gid in NEW_IDS)

current = read(ROOT / entry['wholeCurrent394Model']['path'])
base_model = read(AUTHOR / 'before/current392.ordinary-loader.whole-model.json')
prior_path = ROOT / read(AUTHOR / 'checks/actual-all392-whole-pages.baseline-and-original394.diff.json')['priorActuallyReviewed394Model']['path']
prior = read(prior_path)
page_map = {p['goalId']: p for p in current['pages']}
prior_pages = {p['goalId']: p for p in prior['pages']}
assert len(current['pages']) == 394 and len(base_model['pages']) == 392
changes = [{'goalId': p['goalId'], 'changedKeys': [k for k in set(p) | set(page_map[p['goalId']]) if p.get(k) != page_map[p['goalId']].get(k)]} for p in base_model['pages'] if p != page_map[p['goalId']]]
assert len(changes) == 1 and changes[0]['goalId'] == WORD
assert set(changes[0]['changedKeys']) == {'reverseRequires', 'pageFingerprint'}
two_context_changes = []
for gid in NEW_IDS:
    old, new = prior_pages[gid], page_map[gid]
    keys = [k for k in set(old) | set(new) if old.get(k) != new.get(k)]
    assert set(keys) == {'breadcrumbs', 'chapterIds', 'pageFingerprint', 'pageNumber', 'navigationOrder', 'treeOrder'}
    assert new['breadcrumbs'] == ['Biologie', goals[SUPPLEMENT]['title']]
    assert new['chapterIds'][-1].endswith(SUPPLEMENT)
    assert new['goalFingerprint'] == old['goalFingerprint']
    two_context_changes.append({'goalId': gid, 'changedWholeModelKeys': sorted(keys), 'beforeWholeModelPage': old['pageNumber'], 'currentWholeModelPage': new['pageNumber']})

# Every current internal relation must point to the actual named current page.
for page in current['pages']:
    for kind in ['requires', 'reverseRequires']:
        for link in page[kind]:
            target = page_map[link['goalId']]
            assert link['title'] == target['title'] and link['pageNumber'] == target['pageNumber'] and link['anchor'] == target['anchor']
word_old, word_current = prior_pages[WORD], page_map[WORD]
semantic_link = lambda link: {k: v for k, v in link.items() if k != 'pageNumber'}
old_links = {link['goalId']: link for link in word_old['reverseRequires']}
current_links = {link['goalId']: link for link in word_current['reverseRequires']}
assert {k: semantic_link(v) for k, v in old_links.items()} == {k: semantic_link(v) for k, v in current_links.items()}
word_page_moves = [{'goalId': gid, 'beforePage': old_links[gid]['pageNumber'], 'currentPage': link['pageNumber']} for gid, link in current_links.items() if old_links[gid]['pageNumber'] != link['pageNumber']]

whole_sources = read(ROOT / entry['wholeSourceReadingInputs']['path'])
assert len(whole_sources['entries']) == 20
assert sum(len(e['originalPartnerRows']) for e in whole_sources['entries']) == 268
atlas = read(ROOT / entry['ordinaryAtlasInputs']['path'])
mapping_rows = []
for path in atlas['mappingPaths']:
    obj = read(ROOT / path)
    mapping_rows.extend(obj['mappings'])
identity = lambda row: json.dumps(row, sort_keys=True, ensure_ascii=False)
row_counts = Counter(identity(row) for row in mapping_rows)
historical_not_current = []
historical_current_count = 0
for source in whole_sources['entries']:
    for row in source['originalPartnerRows']:
        if row_counts[identity(row)] >= 1:
            historical_current_count += 1
        else:
            historical_not_current.append(row)
    extracted = read(ROOT / source['sourceExtraction']['path'])
    source_goal = next(g for g in extracted['sourceGoals'] if g['id'] == source['wholeSourceDuty']['id'])
    assert all(source_goal.get(k) == v for k, v in source['wholeSourceDuty'].items())
source_preservation = read(AUTHOR / 'checks/source-whole-duty-and-mapping-preservation.actual.json')
assert historical_current_count == 248 and len(historical_not_current) == 20
assert historical_not_current == [r['originalPartner'] for r in source_preservation['atlasScopePreviouslyRefinedByEarlierSourceAuthorNotThisTask']]
for binding in source_preservation['allCurrentAtlasMappingFilesExactlyTaskBefore']:
    assert digest(ROOT / binding['path']) == binding['sha256']
partials = read(ROOT / entry['tenDirectPartialMappingRows']['path'])['rows']
assert len(partials) == 10
for item in partials:
    row = item['wholePartialPartnerRow']
    assert row['matchType'] == 'partial' and row_counts[identity(row)] >= 1
source_states = {gid: sorted({r['jurisdiction'] for r in partials if r['wholePartialPartnerRow']['canonicalGoalId'] == gid}) for gid in NEW_IDS}
expected = {NEW_IDS[0]: ['DE-BB', 'DE-BE', 'DE-MV', 'DE-NW', 'DE-SH', 'DE-SN', 'DE-ST', 'DE-TH'], NEW_IDS[1]: ['DE-SN']}
assert source_states == expected
for gid in NEW_IDS:
    assert sorted(x['jurisdiction'] for x in page_map[gid]['applicability']) == expected[gid]
for view in entry['allSourceViews']:
    # Verify actual view contents, not the author's selected-goal assertion.
    view_obj = read(ROOT / view['snapshot']['path'])
    text = json.dumps(view_obj)
    actual = sorted(gid for gid in NEW_IDS if gid in text)
    expected_ids = sorted(gid for gid in NEW_IDS if view['scope']['jurisdiction'] in expected[gid] and view['scope']['stage'] == 'SekI')
    assert actual == expected_ids, view['viewId']

source_docs = {s['path']: s for s in atlas['sourceDocumentSnapshots']}
primary_paths = {e['wholeSourceDuty']['sourcePath'] for e in whole_sources['entries'] if e['wholeSourceDuty'].get('sourcePath')}
for path in primary_paths:
    assert digest(ROOT / path) == source_docs[path]['sha256'].removeprefix('sha256:')

write(OWN / 'independent-actual-input-and-model-comparison.json', {
    'schemaVersion': 1,
    'role': 'Own independent actual object and path verification; technical evidence for targeted scientific judgments, not scientific approval by hashes',
    'neutralEntry': bind(ENTRY), 'verifiedUniqueDeclaredFiles': len(declared), 'bindings': list(declared.values()),
    'actualCanonicalNodes': 479, 'actualCurricularAtomicPages': 394,
    'oldNonRootWholeObjectsExact': 475, 'allOldRequiresExact': 476,
    'oldClusterWholeObjectExactAndFiveChildrenWeightFive': True,
    'rootWeightOneAndOnlyNewContains': True,
    'newTwoOnlyParentSourceSupplement': True,
    'inheritedDidacticAnchorExactlyPreserved': True,
    '391BaselineWholePagesExact': True, 'singleBaselineOldPageDelta': changes,
    'twoChangedWholeModelPageContexts': two_context_changes,
    'wordFullModelReverseRelationIdentitiesTitlesAnchorsExact': True,
    'wordFullModelReverseObjectsNotMerelyPermuted': True,
    'wordCorrectActualFullModelPageMoves': word_page_moves,
    'allActualCurrentInternalPageLinksVerifiedAgainstActualCurrentPages': True,
    'wholeSourceDutyObjectsExact': 20, 'allHistoricalOriginalPartnerRowsRetainedAsReadingInputs': 268,
    'historicalOriginalPartnerRowsActuallyPresentInCurrentOrdinaryAtlasMappingInputs': historical_current_count,
    'historicalOriginalPartnerRowsPreviouslyScopeRefinedOutsideCurrentAtlasMappingInputs': historical_not_current,
    'allActualCurrentAtlasMappingFilesByteExactToDeclaredTaskInputs': True,
    'authorClaimAll268OriginalPartnerWholeRowsRetainedInOrdinaryMappingInputsTrueIsOverstated': True,
    'tenNewBoundedPartialRowsActual': True, 'currentSupportedSourceStates': source_states,
    'all23ActualSourceViewsChecked': True,
    'verifiedPrimaryDocuments': [bind(ROOT / p) for p in sorted(primary_paths)],
    'wholeSourceCoverageClosureClaim': False, 'activeWrites': 0,
})
print('PASS: 479 nodes, 394 pages, 475 whole old non-root objects, 391 old exact pages, ten partial rows, 23 views; all actual internal page links verified.')
