# SPDX-License-Identifier: Apache-2.0
"""Seal current portable input evidence; no active adoption or scientific verdict."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import shutil

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
CAP = ROOT / 'tmp/biologie-basis2-reviewed394-resumed-20261008-v1-capsule'
PREP = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-basis2-current-reviewed-integration-preparation-resumed-v1'
SOURCE3 = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/biologie-stoffwechsel-first-three-operative-scope-author-20261008-v1'
assert not (OWN / 'technical-author.first.freeze.json').exists()


def read(path):
    return json.loads(Path(path).read_text())


def bind(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def put(path, value):
    path = Path(path)
    assert path.is_relative_to(OWN), path
    if path.exists():
        assert read(path) == value, ('Preserve earlier actual input', path)
        return
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


def archive(path, relative):
    target = OWN / relative
    if target.exists():
        assert target.read_bytes() == Path(path).read_bytes(), target
        return bind(target)
    target.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(path, target)
    return bind(target)


guard = read(OWN / 'before/current-active.guard.json')
for item in guard['bindings']:
    assert bind(ROOT / item['path']) == item, item['path']
preparation = read(OWN / 'candidate-preparation.actual.json')
canon_file = OWN / 'candidate/canonical479.source-supplement394.inactive.json'
kinds_file = OWN / 'candidate/semantic-kinds479.source-supplement394.schema-valid-v2.inactive.json'
assert (CAP / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_bytes() == canon_file.read_bytes()
assert (CAP / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json').read_bytes() == kinds_file.read_bytes()
canonical = read(canon_file)
goals = {g['id']: g for g in canonical['goals']}
ids = preparation['newGoalIds']
supplement = goals[preparation['newSupplementId']]
old = read(OWN / 'before/canonical476.current-active.exact.json')
old_goals = {g['id']: g for g in old['goals']}
assert len(goals) == 479 and read(kinds_file)['counts']['curricularAtomic'] == 394
for gid, original in old_goals.items():
    expected = copy.deepcopy(original)
    if gid == preparation['rootGoalId']:
        expected['contains'].append(supplement['id'])
    assert goals[gid] == expected
    assert goals[gid].get('requires', []) == original.get('requires', [])

original = read(ROOT / preparation['originalReviewedCanonical']['path'])
original_goals = {g['id']: g for g in original['goals']}
for gid in ids:
    assert goals[gid] == original_goals[gid]

def inherited_requires(by_id, gid):
    parents = {key: [] for key in by_id}
    for owner in by_id.values():
        for child in owner.get('contains', []):
            parents[child].append(owner['id'])
    todo = list(parents[gid])
    ancestors = set()
    while todo:
        current = todo.pop()
        if current in ancestors:
            continue
        ancestors.add(current)
        todo.extend(parents[current])
    return sorted({req for ancestor in ancestors for req in by_id[ancestor].get('requires', [])})

inheritance = []
for gid in ids:
    before = inherited_requires(original_goals, gid)
    after = inherited_requires(goals, gid)
    assert before == after == supplement['requires']
    inheritance.append({'goalId': gid, 'inheritedRequiresBefore': before, 'inheritedRequiresAfter': after, 'exact': True})
put(OWN / 'checks/new-two.inherited-didactic-anchor.exact-proof.json', {
    'role': 'Exact ancestor-prerequisite comparison; no change to any old or new leaf requires',
    'entries': inheritance, 'all476OldRequiresExact': True, 'activeWrites': 0,
})

atlas_config_path = CAP / 'app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json'
atlas = read(atlas_config_path)
atlas_snapshot = archive(atlas_config_path, 'source-atlas/ordinary.inputs.exact.json')
manifest_path = CAP / atlas['manifestPath']
manifest = read(manifest_path)
manifest_snapshot = archive(manifest_path, 'source-atlas/ordinary.sources-manifest.exact.json')
navigation_snapshot = archive(CAP / atlas['navigationViewPath'], 'source-atlas/ordinary.canonical-navigation.exact.json')
receipt_snapshot = archive(CAP / atlas['outputDirectory'] / 'source-projection.receipt.json', 'source-atlas/ordinary.source-projection-receipt.exact.json')
views = []
target_scopes = {gid: [] for gid in ids}


def target_entries(node, inherited='target'):
    role = node.get('projectionRole', inherited)
    if node.get('kind') == 'goalEntry' and role == 'target':
        yield node['goalId']
    for child in node.get('children', []):
        yield from target_entries(child, role)


for configured_path in manifest['sourcePaths']:
    source = CAP / configured_path
    view = read(source)
    snapshot = archive(source, 'source-atlas/source-views/' + source.name)
    targets = {gid for node in view['rootNodes'] for gid in target_entries(node)}
    selected = sorted(set(ids) & targets)
    for gid in selected:
        target_scopes[gid].append(view['scope'])
    views.append({'viewId': view['viewId'], 'scope': view['scope'], 'snapshot': snapshot, 'selectedNewTargetGoalIds': selected})
assert len(views) == 22
assert sorted({s['jurisdiction'] for s in target_scopes[ids[0]]}) == ['DE-BB','DE-BE','DE-MV','DE-NW','DE-SH','DE-SN','DE-ST','DE-TH']
assert sorted({s['jurisdiction'] for s in target_scopes[ids[1]]}) == ['DE-SN']
assert all(s['stage'] == 'SekI' for scopes in target_scopes.values() for s in scopes)
put(OWN / 'checks/ordinary-22-source-view-target-scopes.actual.json', {
    'role': 'Actual target placements in ordinary generated source views, no scientific judgement',
    'sourceViews': views, 'newTwoTargetScopes': target_scopes,
    'newTwoHaveNoSekIITargetPlacement': True, 'all22ViewsPreserved': True, 'activeWrites': 0,
})

duties = read(OWN / 'before/twenty-whole-source-duties-and-original268-partners.exact.json')['rows']
current_mapping_files = []
current_rows = []
for path in atlas['mappingPaths']:
    cap_file = CAP / path
    root_file = ROOT / path
    assert cap_file.read_bytes() == root_file.read_bytes(), path
    mapping = read(cap_file)
    current_mapping_files.append({'path': path, 'sha256': bind(root_file)['sha256'], 'exactToTaskInput': True})
    current_rows.extend(mapping.get('mappings', []))
historical_row_differences = []
ordinary_original_rows = []
for path in (CAP / 'curricula/DE/Gymnasium/mapping').rglob('*.json'):
    mapping = read(path)
    ordinary_original_rows.extend(mapping.get('mappings', []))
for duty in duties:
    for old_partner in duty['wholePartnerRowsBefore']:
        matching = [row for row in current_rows if row.get('legacyGoalId') == old_partner['legacyGoalId'] and row.get('canonicalGoalId') == old_partner['canonicalGoalId']]
        assert old_partner in ordinary_original_rows, ('Original whole partner must remain in ordinary input', old_partner)
        if old_partner not in matching:
            historical_row_differences.append({'originalPartner': old_partner, 'currentTaskInputPartners': matching})
assert sum(len(duty['wholePartnerRowsBefore']) for duty in duties) == 268
hold_input = SOURCE3 / 'candidate/four-original-operator-HOLDs.exact-KEEP.json'
holds_snapshot = archive(hold_input, 'before/four-original-operator-HOLDs.exact-KEEP.json')
assert read(hold_input)['count'] == 4
source_reading = []
for duty in duties:
    extraction_path = ROOT / duty['sourceExtractionPath']
    assert extraction_path.exists()
    source_reading.append({'sourceOrdinal': duty['sourceOrdinal'], 'wholeSourceDuty': duty['wholeSourceDuty'],
                           'sourceExtraction': bind(extraction_path), 'originalPartnerRows': duty['wholePartnerRowsBefore']})
put(OWN / 'sources/twenty-whole-source-reading.inputs-only.json', {
    'schemaVersion': 1, 'role': 'Whole original source duties, locators/provenance and partner identities as reading inputs; no new verdict',
    'entries': source_reading, 'sourceDutyCount': 20, 'originalPartnerCount': 268,
})
direct_rows = []
for install in preparation['ordinaryMappingInstallsUnchanged']:
    candidate_file = ROOT / install['candidate']['path']
    cap_file = CAP / install['destination']
    assert cap_file.read_bytes() == candidate_file.read_bytes()
    mapping = read(candidate_file)
    for row in mapping['mappings']:
        assert row['canonicalGoalId'] in ids and row['matchType'] == 'partial'
        direct_rows.append({'jurisdiction': mapping['jurisdiction'], 'sourceExtractionPath': mapping['sourceExtractionPath'], 'wholePartialPartnerRow': row})
assert len(direct_rows) == 10 and len({r['wholePartialPartnerRow']['legacyGoalId'] for r in direct_rows}) == 9
put(OWN / 'sources/ten-direct-partial-rows.inputs-only.json', {'schemaVersion':1, 'role':'Exact current source/mapping input rows; prior reviewer verdicts omitted', 'rows': direct_rows, 'wholeOriginalDutiesRemainWhole':True})
put(OWN / 'checks/source-whole-duty-and-mapping-preservation.actual.json', {
    'role':'Actual source/partner preservation proof, no new full-source approval',
    'twentyWholeOriginalSourceDutiesExact':True, 'all268OriginalPartnerIdentitiesRetained':True,
    'all268OriginalPartnerWholeRowsRetainedInOrdinaryMappingInputs':True,
    'allCurrentAtlasMappingFilesExactlyTaskBefore':current_mapping_files,
    'eightDirectSourceBindingFilesByteExact':True, 'tenDirectPartialRowsByteExact':True,
    'fourOriginalOperatorHoldsExact':holds_snapshot,
    'atlasScopePreviouslyRefinedByEarlierSourceAuthorNotThisTask':historical_row_differences,
    'historicalBeforeRowsAreNotCurrentMappingByteBaseline':True,
    'noSourceIdDeletionOrPartialPromotedToWhole':True, 'activeWrites':0,
})

status = read(OWN / 'checks/capsule.v2.curriculum-quality-status.json')
bio = next(c for c in status['curricula'] if c['subject']=='Biologie')
assert bio['maturity']=='M6'
for rule_id in ['CQR-000','CQR-003']:
    assert next(r for r in bio['rules'] if r['id']==rule_id)['status']=='pass'
floor = read(OWN / 'checks/ordinary-protected-maturity-floors-v2.terminal.actual.json')
assert floor['exitCode']==0
for name in ['ordinary-A394-existing-full-config','ordinary-M394-existing-eight-scopes','ordinary-P2-original-whole-profiles','ordinary-source-atlas-final-current-v2','ordinary-whole394-native-two-v2']:
    assert read(OWN / f'checks/{name}.terminal.actual.json')['exitCode']==0
preservation = {'schemaVersion':1,'activeBaseline':'244/392','activeBoundFiles':guard['bindings'],
                'allActiveBoundFilesExactlyUnchanged':True,'oldNonRootWholeGoalCountExact':475,'allOldRequiresExact':476,
                'rootWeightExactlyOne':True,'rootOnlyAddedSupplementContains':True,
                'oldRootUniqueAtomicLeaves':422,'newRootUniqueAtomicLeaves':424,'curricularAtomicCount':394,
                'currentWholeOldPageExactCount':391,'remainingOldPageDeltaGoalId':'576d59e2-397a-5654-b853-7c0c4870fbd3',
                'remainingOldPageDeltaKeys':['reverseRequires','pageFingerprint'],
                'originalDPAAndVSealsAndRecordsUnchanged':True,'activeWrites':0,'activeStrictGain':0,'humanApproval':False}
put(OWN / 'checks/final-current-active-and-reviewed-inputs.preservation-proof.json', preservation)
native = read(OWN / 'native-two-context/ordinary-native-context.preparation.actual.json')
diff = read(OWN / 'checks/new-two.native-D-P-context.actual-diff.json')
entries = []
for row in diff['entries']:
    gid=row['goalId']
    entries.append({'goalId':gid,'wholeCurrentGoal':goals[gid],
                    'wholeCurrentNativePage':row['currentWholeNativePage'],
                    'canonicalContextExactlyUnchanged':row['canonicalContextExactlyUnchanged'],
                    'actualChangedNativePageKeys':row['actualChangedNativePageKeys'],
                    'targetSourceScopes':target_scopes[gid],
                    'contextReviewQuestion':'Does the whole unchanged goal retain a correct, bounded Sek-I didactic context under the new supplement, with its complete description/P cases and exactly the shown source scope? Inspect the actual native page, breadcrumb, chapter and whole official duties; make an independent first judgement.',
                    'reviewStatus':'pending_two_independent_context_reviews'})
put(OWN / 'neutral-source-supplement-two-context-review.entry.json', {
    'schemaVersion':1,'reviewId':'biologie-basis2-source-supplement-technical-author-resumed-v1',
    'role':'Neutral actual context inputs only; no author/peer scientific verdict on the new context',
    'createdAtUtc':datetime.now(timezone.utc).isoformat(),'activeBaseline':'244/392',
    'inactiveCounts':{'canonicalNodes':479,'curricularAtomicGoals':394,'uniqueAtomicLeaves':424},
    'canonicalCandidate':bind(canon_file),'semanticKindsCandidate':bind(kinds_file),'newSupplementWholeGoal':supplement,
    'entries':entries,'nativeTwoContext':native,
    'wholeCurrent394Model':bind(OWN / 'native/full394.ordinary-source-supplement.actual-model.json'),
    'originalWholeP2Profiles':bind(OWN / 'candidate/P2.original-reviewed-whole-profiles.exact.jsonl'),
    'originalFourWholeDEENCases':bind(OWN / 'candidate/four-original-whole-DEEN-cases.exact.json'),
    'wholeSourceReadingInputs':bind(OWN / 'sources/twenty-whole-source-reading.inputs-only.json'),
    'tenDirectPartialMappingRows':bind(OWN / 'sources/ten-direct-partial-rows.inputs-only.json'),
    'ordinaryAtlasInputs':atlas_snapshot,'ordinaryAtlasManifest':manifest_snapshot,
    'ordinaryCanonicalNavigation':navigation_snapshot,'ordinaryAtlasReceipt':receipt_snapshot,'allSourceViews':views,
    'actualNewTwoContextDiff':bind(OWN / 'checks/new-two.native-D-P-context.actual-diff.json'),
    'actualOld392WholePageComparison':bind(OWN / 'checks/actual-all392-whole-pages.baseline-and-original394.diff.json'),
    'existing576ExactRelationPermutationProof':bind(OWN / 'checks/current-word576.exact-relations-permutation.proof.json'),
    'didacticAnchorProof':bind(OWN / 'checks/new-two.inherited-didactic-anchor.exact-proof.json'),
    'preservationProof':bind(OWN / 'checks/final-current-active-and-reviewed-inputs.preservation-proof.json'),
    'sourcePreservationProof':bind(OWN / 'checks/source-whole-duty-and-mapping-preservation.actual.json'),
    'ordinaryCompilation':bind(OWN / 'checks/ordinary-two-and-supplement-applicability.actual.json'),
    'ordinaryStatusM6CQR000And003Pass':bind(OWN / 'checks/capsule.v2.curriculum-quality-status.json'),
    'ordinaryProtectedFloorsNinePass':bind(OWN / 'checks/ordinary-protected-maturity-floors-v2.terminal.actual.json'),
    'reviewInstructions':[
        'Personally inspect the new two actual native pages, whole current DE/EN goals, P2/four complete cases and actual source duties before consulting prior scientific verdicts.',
        'Make independent accept/reject context decisions on breadcrumb/chapter, didactic prerequisite anchor and exactly supported regional applicability. The original whole competencies and source operators must not be truncated.',
        'The 391 exact old pages and the single 576 relation/permutation delta are explicit technical preservation evidence. No existing scientific record or first seal is rewritten.',
        'Ordinary status/floor/A/M/P/source checks are technical results; they do not constitute independent acceptance of the new page/context.',
        'Four original operator holds remain open. Ten partial rows never constitute full coverage of all 20 whole duties or of their compound partner obligations.',
    ],
    'priorScientificVerdictsOnNewContextIncluded':False,'actualIndependentContextResults':0,
    'independentDContextApproval':False,'independentPContextApproval':False,'independentSourcePlacementApproval':False,
    'activeWrites':0,'activeStrictGain':0,'humanApproval':False,'actualLearnerResults':False,
})
(OWN / 'README.md').write_text('''# Inactive Biology Basis2 source supplement

The ordinary candidate has 479 nodes and 394 curricular atoms. The original shared cluster 860 is restored exactly (five children, weight 5). The root retains weight 1 and only gains one supplement reference. All 475 old non-root whole goals and all 476 old prerequisite lists remain exact; the two new whole goals retain their original reviewed objects and inherited foundation anchor. The supplement has weight 2 and a mapping inheritance boundary, with no broad provenance.

Ordinary applicability and generated source views assign respiration to exactly BB, BE, MV, NW, SH, SN, ST, TH and photosynthesis coupling to SN, all Sek I. All ten direct partial rows, nine source identities and eight binding files remain exact. The 20 whole source duties, 268 partner identities and four original operator holds are retained. Earlier historical partner-row refinements are distinguished explicitly from the current byte baseline.

The whole loader produces 394 pages. Of the old 392 whole pages, 391 are exact to the current baseline. The existing 576 page only gains the reverse reference to the new coupling goal. Its native subset has the exact same relation entries as the genuine prior context supersession, with a different order and derived page fingerprint; no false whole-page equality or new scientific approval is claimed.

Two new native context pages, a four-physical-page PDF, HTML, exact JSON, and empty independent A/B campaigns are prepared. The original P2 profiles and four complete bilingual cases remain byte-exact. New context scientific acceptance is pending; the author has supplied no D/P/V results or active adoption.

Ordinary A394, M394, P2, source freshness, CQR-000, CQR-003 and all nine protected maturity floors pass in TMP. Failed first schema, discovery, word-page equality and stale receipt terminals remain intact. The final technical seal preserves all portable payloads, with no symlinks or nested repositories under this author folder. Active Biology remains 244/392; protected active bindings are unchanged.
''')
payloads=[]
for path in sorted(OWN.rglob('*')):
    assert not path.is_symlink(), path
    assert path.name!='.git', path
    if path.is_file() and path.name!='technical-author.first.freeze.json':payloads.append(bind(path))
entry=bind(OWN / 'neutral-source-supplement-two-context-review.entry.json')
put(OWN / 'technical-author.first.freeze.json', {
    'schemaVersion':1,'role':'First immutable technical author payload seal, not scientific approval',
    'sealedAtUtc':datetime.now(timezone.utc).isoformat(),'payloads':payloads,'neutralEntry':entry,
    'allOriginalReviewsAndSealsPreserved':True,'activeWrites':0,'activeStrictGain':0,
    'actualIndependentContextResults':0,'humanApproval':False,
})
for item in payloads:assert bind(ROOT / item['path'])==item
for item in guard['bindings']:assert bind(ROOT / item['path'])==item
print(json.dumps({'neutralEntry':entry,'firstSeal':bind(OWN / 'technical-author.first.freeze.json'),'verifiedPayloads':len(payloads),'activeWrites':0,'actualIndependentContextResults':0}))
