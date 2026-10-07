#!/usr/bin/env python3
"""Read-only targeted source checks; output only in this independent dossier."""
from pathlib import Path
import hashlib
import json
from datetime import datetime, timezone
from bs4 import BeautifulSoup

REPO = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR = BASE / 'biologie-neuro-eight-missing-primary-scope-remediation-author-v2'
AUTHOR1 = BASE / 'biologie-neuro-eight-missing-primary-scope-remediation-author-v1'
OWN1 = BASE / 'biologie-neuro-eight-primary-scope-independent-b-v1'
seen = {}

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def pin(p):
    p = Path(p)
    seen[str(p.relative_to(REPO))] = {'path': str(p.relative_to(REPO)), 'sha256': sha(p), 'bytes': p.stat().st_size}
    return p

def read(p):
    return json.loads(pin(p).read_text())

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def verify_freeze(p, expected):
    assert sha(p) == expected, (p, 'freeze SHA mismatch')
    d = read(p)
    checks = []
    for row in d['files']:
        q = p.parent / row['path']
        assert q.resolve().is_relative_to(p.parent.resolve()), row['path']
        actual = sha(q)
        assert actual == row['sha256'].removeprefix('sha256:'), row['path']
        assert q.stat().st_size == row['bytes'], row['path']
        checks.append({'dossierRelativePath': row['path'], 'sha256': actual, 'bytes': row['bytes'], 'exact': True})
    return checks

author_checks = verify_freeze(AUTHOR / 'eight-missing-primary-scope-remediation-author-v2.final.freeze.json', 'f6524feee0001b213f4575ee45d8627f5bac0b7e6b0db10d993f7a885082045a')
old_checks = verify_freeze(OWN1 / 'independent-b-neuro-eight-primary-scope.final.freeze.json', '24eca976049e2a3d449b86090e2961552aa43cd2c62b38f7abf5b712f44e781f')
assert len(author_checks) == 51 and len(old_checks) == 27
raw = read(AUTHOR / 'eight-current-whole-goals-two-text-corrections-and-NW-G9-native-routing.raw-author-v2-review-input.json')
old_verdict = read(OWN1 / 'eight-primary-components-and-minimal-proposals.independent-b.verdict.json')
old_ids = {r['goalId'] for r in old_verdict['records']}
rows = raw['wholeCurrentAndCandidateDEENRecords']
ids = {r['goalId'] for r in rows}
assert len(ids) == 8 and ids == old_ids
current_path = REPO / raw['currentCanonical']['path']
assert sha(current_path) == raw['currentCanonical']['sha256'].removeprefix('sha256:')
current = read(current_path)
snapshot = read(AUTHOR / 'current472-whole-canonical.actual.snapshot.json')
assert current == snapshot
current_goals = {g['id']: g for g in current['goals']}
active_kinds = read(REPO / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
current_atomic_ids = {r['goalId'] for r in active_kinds['decisions'] if r['semanticKind'] == 'curricularAtomic'}
assert len(current_atomic_ids) == 390 and ids <= current_atomic_ids
candidate = read(AUTHOR / 'current472-eight-only.author-v2.canonical.candidate.json')
candidate_goals = {g['id']: g for g in candidate['goals']}
old_candidate = read(AUTHOR1 / 'current472-eight-only.canonical.author-v1.candidate.json')
old_candidate_goals = {g['id']: g for g in old_candidate['goals']}
assert len(current_goals) == len(candidate_goals) == 472
assert set(current_goals) == set(candidate_goals) == set(old_candidate_goals)
assert {g for g in current_goals if current_goals[g] != candidate_goals[g]} == ids
assert all(current_goals[g] == candidate_goals[g] for g in set(current_goals) - ids)
assert all(current_goals[g]['requires'] == candidate_goals[g]['requires'] and current_goals[g]['contains'] == candidate_goals[g]['contains'] for g in current_goals)
text_delta_ids = {g for g in current_goals if any(old_candidate_goals[g].get(k) != candidate_goals[g].get(k) for k in ['title', 'titleEn', 'description', 'descriptionEn'])}
assert text_delta_ids == {'8b23f8fb-555d-5720-b5f2-dd6f28a0e786', 'f6280154-d57c-599c-94bf-73313005a6df'}
for row in rows:
    assert row['wholeCurrentGoalDEEN'] == current_goals[row['goalId']]
    assert row['wholeCanonicalCandidateDEEN'] == candidate_goals[row['goalId']]

original45 = read(AUTHOR1 / 'BY13-EA-GA.actual-original-neural-section.records.json')['records']
original21 = read(AUTHOR1 / 'BY13-EA-GA.exact-current-merged-source-IDs-and-original-occurrences.addendum.json')['records']
valid45 = read(AUTHOR / 'BY13-EA-GA.all45.valid-selector.records.author-v2.json')['records']
valid21 = read(AUTHOR / 'BY13-EA-GA.all21.valid-selector-identity-addendum.author-v2.json')['records']
assert len(valid45) == 45 and len(valid21) == 21
assert [r['recordId'] for r in valid45] == [r['recordId'] for r in original45]
assert [r['recordId'] for r in valid21] == [r['recordId'] for r in original21]
soups = {}
actual_selectors = []
def text_of(element):
    clone = BeautifulSoup(str(element), 'html.parser')
    for dialog in clone.find_all('dialog'):
        dialog.decompose()
    return ' '.join(clone.get_text(' ', strip=True).split())

for set_name, fresh, prior in [('all45', valid45, original45), ('addendum21', valid21, original21)]:
    for rec, before in zip(fresh, prior):
        assert rec['originalText'] == before['originalText']
        assert rec['sourceHtmlPath'] == before['sourceHtmlPath'] and rec['sourceHtmlSha256'] == before['sourceHtmlSha256']
        assert rec['primaryUrl'] == before['primaryUrl']
        path = REPO / rec['sourceHtmlPath']
        pin(path)
        assert sha(path) == rec['sourceHtmlSha256'].removeprefix('sha256:')
        if str(path) not in soups:
            soups[str(path)] = BeautifulSoup(path.read_text(), 'html.parser')
        matched = soups[str(path)].select(rec['selector'])
        assert len(matched) == 1, rec['recordId']
        actual = text_of(matched[0])
        assert actual == rec['originalText'], rec['recordId']
        assert rec['physicalPage'] is None and rec['printedPage'] is None
        if set_name == 'addendum21':
            assert rec['existingExtractionOriginalOccurrences'] == before['existingExtractionOriginalOccurrences']
            assert rec['originalLevelMatchingOccurrence'] == before['originalLevelMatchingOccurrence']
        actual_selectors.append({'set': set_name, 'recordId': rec['recordId'], 'actualSelector': rec['selector'], 'actualHits': 1, 'actualDOMText': actual, 'originalTextExact': True, 'primaryUrl': rec['primaryUrl'], 'sourceHtmlSha256': sha(path), 'originalLevelLabel': rec['originalLevelLabel'], 'projectionCourseProfile': rec['projectionCourseProfile'], 'physicalPage': None, 'printedPage': None, 'originalRecordsReReviewedGlobally': False})

active_by = read(REPO / 'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_BIOLOGIE_GYMNASIUM_LEHRPLANPLUS.source-extraction.json')
active_by_goals = {g['id']: g for g in active_by['sourceGoals']}
for r in valid21:
    actual_source_goal = active_by_goals[r['existingExtractionSourceGoalId']]
    assert actual_source_goal['rawSourceText'] == r['originalText']
    assert actual_source_goal['sourceOccurrences'] == r['existingExtractionOriginalOccurrences']
    assert r['originalLevelMatchingOccurrence']

records_by_id = {r['recordId']: r for r in valid45}
embedded_count = 0
for row in rows:
    for component in row['actualPrimaryComponents'] + row['contextOnlyNotSupportingComponents']:
        rid = component['recordId']
        if rid in records_by_id:
            assert component['selector'] == records_by_id[rid]['selector']
            assert component['originalText'] == records_by_id[rid]['originalText']
            embedded_count += 1
        elif rid.startswith('HE'):
            p = REPO / component['sourceDocumentPath']
            pin(p)
            assert sha(p) == component['sha256'].removeprefix('sha256:')

companion_ids = ['347110a1-1d2e-5195-8acc-64e7e3893ce5', 'e1117126-4e78-5a37-a645-2debc167219b', '78748ef2-93fb-5ec3-8c1e-90e42b9ea863', '04d770b3-ba5e-5438-88ca-110cbaeba62c']
native = read(AUTHOR / 'native.current472.neuro21-plus-eight-text.canonical.candidate.json')
native_goals = {g['id']: g for g in native['goals']}
assert set(native_goals) == set(current_goals)
assert all(native_goals[g]['requires'] == current_goals[g]['requires'] and native_goals[g]['contains'] == current_goals[g]['contains'] for g in current_goals)
for g in ids:
    assert all(native_goals[g].get(k) == candidate_goals[g].get(k) for k in ['title', 'titleEn', 'description', 'descriptionEn', 'requires', 'contains'])

baseline_atlas = read(AUTHOR / 'baseline-current390-source-atlas.actual.book-model.json')
conditional_atlas = read(AUTHOR / 'conditional-current390-source-atlas.actual.book-model.json')
baseline_catalogue = read(AUTHOR / 'baseline-current390-full-catalogue.actual.book-model.json')
conditional_catalogue = read(AUTHOR / 'conditional-current390-full-catalogue.actual.book-model.json')
page_maps = [{p['goalId']: p for p in m['pages']} for m in [baseline_atlas, conditional_atlas, baseline_catalogue, conditional_catalogue]]
assert all(len(m) == 390 for m in page_maps)
assert all(set(m) == set(page_maps[0]) for m in page_maps)
assert set(page_maps[0]) == current_atomic_ids
central = read(BASE / 'chemie-current-fifteen-reviewed-active-integration-v1/current-central-five-gate.actual.report.json')
bio = next(s for s in central['subjects'] if s['subject'] == 'biologie')
protected = set(bio['strictCompleteGoalIds'])
assert len(protected) == 74 and not protected & ids
protected_checks = []
for g in sorted(protected):
    assert current_goals[g] == native_goals[g]
    assert page_maps[0][g] == page_maps[1][g]
    assert page_maps[2][g] == page_maps[3][g]
    protected_checks.append({'goalId': g, 'wholeCanonicalExact': True, 'fullRawSourceAtlasPageAndContextsExact': True, 'fullRawCataloguePageAndContextsExact': True})
claimed_protected = read(AUTHOR / 'protected-current74.actual-full-page-and-source-context-checks.json')
assert {r['goalId'] for r in claimed_protected} == protected
actual_changed = {g for g in page_maps[0] if page_maps[0][g] != page_maps[1][g]}
claimed_deltas = read(AUTHOR / 'all-current390.actual-source-atlas-page-deltas.json')
assert len(actual_changed) == 61 and actual_changed == {r['goalId'] for r in claimed_deltas}
page_deltas = []
for g in sorted(actual_changed):
    before, after = page_maps[0][g], page_maps[1][g]
    claim = next(r for r in claimed_deltas if r['goalId'] == g)
    assert claim['before'] == before and claim['after'] == after
    fields = [k for k in before if before[k] != after[k]]
    assert fields == claim['changedFields']
    page_deltas.append({'goalId': g, 'actualChangedFields': fields, 'currentRawPageFingerprint': before['pageFingerprint'], 'conditionalRawPageFingerprint': after['pageFingerprint'], 'strictProtected': g in protected, 'newWholeSourceOrNativeDApproval': False})

baseline_receipt = read(AUTHOR / 'baseline-current390.source-atlas.actual.receipt.json')
conditional_receipt = read(AUTHOR / 'conditional-current390-restoration.source-atlas.actual.receipt.json')
scope_delta = read(AUTHOR / 'all22-actual-ordered-targets-and-residual-whole-HOLDs.json')
assert len(baseline_receipt['scopes']) == len(conditional_receipt['scopes']) == len(scope_delta['scopes']) == 22
before_scopes = {s['key']: s for s in baseline_receipt['scopes']}
after_scopes = {s['key']: s for s in conditional_receipt['scopes']}
assert set(before_scopes) == set(after_scopes)
scope_checks = []
for r in scope_delta['scopes']:
    a, z = before_scopes[r['key']], after_scopes[r['key']]
    assert a['goalIds'] == r['beforeOrderedGoalIds'] and z['goalIds'] == r['conditionalRestorationOrderedGoalIds']
    lost = sorted(set(a['goalIds']) - set(z['goalIds']))
    added = sorted(set(z['goalIds']) - set(a['goalIds']))
    assert set(lost) == set(r['lostVsCurrent']) and set(added) == set(r['addedVsCurrent'])
    assert r['wholeSourceApproval'] is False
    scope_checks.append({'scopeKey': r['key'], 'baselineOrderedGoalIds': a['goalIds'], 'conditionalOrderedGoalIds': z['goalIds'], 'actualLostGoalIds': lost, 'actualAddedGoalIds': added, 'wholeSourceCoverageApproved': False})
assert sum(len(s['actualLostGoalIds']) for s in scope_checks) == len(scope_delta['residualLostGoalScopePairs']) == 189
actual_lost_pairs = {(s['scopeKey'], g) for s in scope_checks for g in s['actualLostGoalIds']}
assert actual_lost_pairs == {(r['scopeKey'], r['goalId']) for r in scope_delta['residualLostGoalScopePairs']}
assert all(r['wholeSourceAndTargetRoutineHOLD'] for r in scope_delta['residualLostGoalScopePairs'])
assert set().union(*(set(s['conditionalOrderedGoalIds']) for s in scope_checks)) == set(page_maps[0])

routes = read(AUTHOR / 'native-input-candidate-routing.author-v2.json')
assert len(routes['entries']) == 5 and len(routes['neuroRoutes']) == 17
entry_map = {e['plannedExtractionPath']: e for e in routes['entries']}
special_ids = {'4f631f78-e13a-58e5-9092-f4db0b8d377a', 'a46cafde-7359-5249-8754-19aaa3174ba4', 'c9a06264-cce2-54dd-9604-46dd5949f02e'}
model_source_scopes = [{'jurisdiction': 'DE-BY', 'scopes': [{'stage': 'SekII', 'durationModel': 'G9', 'courseProfile': 'LK'}]}, {'jurisdiction': 'DE-HE', 'scopes': [{'stage': 'SekII', 'durationModel': None, 'courseProfile': 'LK'}]}]
assert all(page_maps[1][g]['applicability'] == model_source_scopes for g in special_ids)
assert page_maps[1]['8b23f8fb-555d-5720-b5f2-dd6f28a0e786']['applicability'] == [model_source_scopes[0]]
route_checks = []
for route in routes['neuroRoutes']:
    entry = entry_map[route['sourceExtractionPath']]
    extraction = read(REPO / entry['candidateExtractionPath'])
    mapping = read(REPO / entry['candidateMappingPath'])
    goal = next(g for g in extraction['sourceGoals'] if g['id'] == route['sourceGoalId'])
    link = next(m for m in mapping['mappings'] if m['legacyGoalId'] == goal['id'])
    assert link['canonicalGoalId'] == route['goalId']
    assert goal['stage'] == route['stage'] == 'SekII'
    assert goal['courseLevel'] == route['courseLevel']
    assert entry['jurisdiction'] == route['jurisdiction']
    assert goal['sourceKind'] == route['sourceKind']
    assert not goal['isOfficialBullet'] and not goal['officialNumberingClaim']
    if route['goalId'] in special_ids:
        assert route['sourceKind'] == 'authoredModelSpecialisation' and route['courseLevel'] == 'LK'
        assert goal['authoredComponent'] is True
    pin(REPO / entry['documentPath'])
    assert sha(REPO / entry['documentPath']) == entry['documentSha256'].removeprefix('sha256:')
    witnesses = [dict(scopeKey=s['key'], **w) for s in conditional_receipt['scopes'] for w in s['witnesses'] if w['sourceGoalId'] == goal['id'] and w['mappingPath'] == entry['candidateMappingPath']]
    assert witnesses and all(w['coverage'] == 'direct' and w['mappedTargetGoalId'] == route['goalId'] and w['goalId'] == route['goalId'] for w in witnesses)
    route_checks.append({'goalId': route['goalId'], 'sourceGoalId': goal['id'], 'jurisdiction': route['jurisdiction'], 'stage': route['stage'], 'courseLevel': route['courseLevel'], 'actualOriginalRecordIds': route['actualOriginalRecordIds'], 'sourceKind': route['sourceKind'], 'actualDirectWitnesses': witnesses, 'sourceKindIsIndependentProof': False})

nw_extract = read(AUTHOR / 'native-input-candidates/NW.two-bacterial-components.source-extraction.candidate.json')
nw_map = read(AUTHOR / 'native-input-candidates/NW.two-bacterial-components.mapping.candidate.json')
old_nw = read(OWN1 / 'NW-two-protected-direct-witness-loss-and-bounded-v3.actual.independent-b.json')
old_nw_by_id = {r['goalId']: r for r in old_nw['records']}
old_policy = read(REPO / 'curricula/DE/Gymnasium/provenance/gymnasium-duration-model-policy.json')
new_policy = read(AUTHOR / 'native-input-candidates/duration-model-policy.with-explicit-NW-bacterial-path.candidate.json')
assert len(new_policy['decisions']) == len(old_policy['decisions']) + 1
assert new_policy['decisions'][:-1] == old_policy['decisions']
assert all(new_policy[k] == old_policy[k] for k in old_policy if k not in ['decisions', 'updatedAt'])
old_row = next(r for r in old_policy['decisions'] if r.get('subject') == 'Biologie' and r.get('jurisdiction') == 'DE-NW')
new_row = new_policy['decisions'][-1]
effective = ['subject', 'jurisdiction', 'stage', 'status', 'decision', 'durationModels', 'learnerFacingProjection']
assert all(old_row[k] == new_row[k] for k in effective)
assert new_row['durationModels'] == ['G9'] and new_row['stage'] == 'SekI' and new_row['authorCandidateOnly'] is True
nw_entry = entry_map[new_row['sourceExtractionPath']]
assert nw_entry['candidateExtractionPath'] == str((AUTHOR / 'native-input-candidates/NW.two-bacterial-components.source-extraction.candidate.json').relative_to(REPO))
assert nw_extract['sourceDocument']['url'] == nw_entry['documentURL']
pin(REPO / nw_entry['documentPath'])
assert sha(REPO / nw_entry['documentPath']) == nw_entry['documentSha256'].removeprefix('sha256:')
nw_checks = []
for sg in nw_extract['sourceGoals']:
    m = next(m for m in nw_map['mappings'] if m['legacyGoalId'] == sg['id'])
    g = m['canonicalGoalId']
    assert g in protected and g in old_nw_by_id
    assert sg['sourceText'] == sg['rawParentBulletText'] == 'den Bau und die Vermehrung von Bakterien und Viren beschreiben (UF1),'
    assert sg['printedPage'] == sg['physicalPage'] == 35 and sg['courseLevel'] == 'unspecified' and sg['stage'] == 'SekI'
    assert not sg['isOfficialBullet'] and not sg['wholeOriginalBulletCoverage'] and m['matchType'] == 'partial'
    witnesses = [w for w in after_scopes['DE-NW/SekI/']['witnesses'] if w['sourceGoalId'] == sg['id'] and w['sourceExtractionPath'] == new_row['sourceExtractionPath']]
    assert len(witnesses) == 1 and witnesses[0]['coverage'] == 'direct' and witnesses[0]['goalId'] == witnesses[0]['mappedTargetGoalId'] == g
    nw_app = [a for a in page_maps[1][g]['applicability'] if a['jurisdiction'] == 'DE-NW']
    assert nw_app == [{'jurisdiction': 'DE-NW', 'scopes': [{'stage': 'SekI', 'durationModel': 'G9', 'courseProfile': None}]}]
    nw_checks.append({'goalId': g, 'sourceGoalId': sg['id'], 'boundedComponentVerdictReused': 'KEEP', 'actualOriginalUF1Bullet': sg['sourceText'], 'physicalPage': 35, 'printedPage': 35, 'mappingMatchType': 'partial', 'actualDirectWitness': witnesses[0], 'actualRawSourceAtlasPageNWApplicability': nw_app, 'sourceAtlasReceiptAggregatesDurationAsNull': after_scopes['DE-NW/SekI/']['durationModel'] is None, 'wholeCurrentCanonicalExact': current_goals[g] == native_goals[g], 'wholeOriginalIF7BacterialViralDutyApproved': False})
assert len(nw_checks) == 2

# Pin exact prior raster/line witnesses; this follow-up reuses the completed v1 visual reading.
for name in ['HE-physical-033.actual.txt', 'HE-physical-043.actual.txt', 'HE-physical-033.actual.png', 'HE-physical-043.actual.png', 'NW-physical-035.actual.txt', 'NW-physical-035.actual.png']:
    pin(OWN1 / 'primary' / name)
pin(REPO / 'AGENTS.md')
pin(REPO / 'docs/concept/skill-graph/atomic-goal-visualizations.md')
pin(REPO / 'LICENSING.md')

write('all66-BY-selectors.actual-independent-b.json', {'schemaVersion': 1, 'checks': actual_selectors, 'embeddedCurrentEightSelectorCopiesVerified': embedded_count, 'allOriginalTextsAndPrimaryBytesExactToV1': True, 'newWholeOriginalSourceApproval': False})
write('eight-whole-goals-and-four-actual-companion-contexts.independent-b.json', {'schemaVersion': 1, 'currentCanonicalPath': str(current_path.relative_to(REPO)), 'currentCanonicalSha256': sha(current_path), 'currentWholeCanonicalExactToAuthorSnapshot': True, 'canonicalNodes': 472, 'currentCurricularAtomicTargetIds': sorted(page_maps[0]), 'wholeCurrentCandidateRows': [{'goalId': r['goalId'], 'currentWholeGoal': current_goals[r['goalId']], 'candidateWholeGoal': candidate_goals[r['goalId']], 'v1CandidateWholeGoal': old_candidate_goals[r['goalId']]} for r in rows], 'actualFourCompanionContexts': [{'goalId': g, 'currentWholeGoal': current_goals[g], 'conditionalNativeWholeGoal': native_goals[g]} for g in companion_ids], 'actualV1ToV2ScientificTextDeltaIds': sorted(text_delta_ids), 'all464OutsideWholeGoalsExactInEightOnlyCandidate': True, 'all472RequiresAndContainsExact': True})
write('conditional390-22-scopes-74-protected.actual-independent-b.json', {'schemaVersion': 1, 'modelComparisonsUseActualWholePagesNotOnlyHashes': True, 'allFourNativeModelsPageCount': [len(m) for m in page_maps], 'all390TargetIdSetsExact': True, 'actualScopeChecks': scope_checks, 'actualLostCountryGoalPairs': 189, 'actualChangedSourceAtlasPages': page_deltas, 'all74ProtectedChecks': protected_checks, 'actualNeuroRoutes17': route_checks, 'newScientificWholeSourceApproval': False, 'sourceKindIgnoredByCompilerAndNotUsedAsScienceProof': True, 'nativeCompilerReRunByIndependentB': False, 'freshBookOrPDFRenderByIndependentB': False})
write('NW-two-G9-path-policy-and-direct-witnesses.actual-independent-b.json', {'schemaVersion': 1, 'existingReviewedPolicyRow': old_row, 'newCandidatePolicyRow': new_row, 'allExistingPolicyDecisionRowsExact': True, 'sameEffectiveG9PolicyFields': effective, 'actualComponents': nw_checks, 'newPathSpecificPolicyVerdict': 'KEEP', 'falseClusterSourceInheritanceClaimed': False, 'wholeSourceCoverageApproval': False, 'activeIntegration': False})
write('source-followup-exact-inputs-and-author-freeze.independent-b.json', {'schemaVersion': 1, 'reviewedAtUTC': datetime.now(timezone.utc).isoformat(), 'authorFreezeSha256': 'f6524feee0001b213f4575ee45d8627f5bac0b7e6b0db10d993f7a885082045a', 'authorPayloadChecks': author_checks, 'previousOwnV1FreezeSha256': '24eca976049e2a3d449b86090e2961552aa43cd2c62b38f7abf5b712f44e781f', 'previousOwnV1PayloadChecks': old_checks, 'exactInputsActuallyRead': list(seen.values()), 'newPeerSourceAVerdictsRead': False, 'previousValidPrimaryPDFRasterReadReused': True, 'newOfficialDownloadsOrFullPrimaryRasterReview': False, 'activeWrites': False, 'globalBuilds': 0, 'centralRuns': 0})
summary = {'status': 'PASS_TARGETED_ACTUAL_BINDINGS_NOT_WHOLE_SOURCE_APPROVAL', 'authorPayloadsVerified': len(author_checks), 'oldOwnPayloadsVerified': len(old_checks), 'selectorsActuallyResolved': len(actual_selectors), 'embeddedSelectorCopiesVerified': embedded_count, 'currentCanonicalNodes': 472, 'all390TargetIdSetsPreserved': True, 'actualScopes': 22, 'actualProtectedWholePagesAndContexts': 74, 'actualAtlasChangedPages': 61, 'residualLostCountryGoalPairs': 189, 'NWDirectPartialG9Witnesses': 2, 'newStrictCompletions': 0, 'activeWrites': False}
write('targeted-reproduction.actual-independent-b.result.json', summary)
print(json.dumps(summary))
