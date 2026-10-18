# SPDX-License-Identifier: Apache-2.0
"""Keep unchanged, currently validated native owners through metadata transport."""
import json
import hashlib
from pathlib import Path
from urllib.parse import urlparse, parse_qs

B = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/'
PREP = B + 'chemie-current450-final-native-input-prerequisites-technical-20261018-v1/'
F = PREP + 'final-cut/'
O = Path(B + 'chemie-current450-native-transport-selection-technical-20261018-v2')
CHEM = 'c436b994-8f44-5134-b9f8-0c9f5d6a5ba0'

def read(p):
    return json.loads(Path(p).read_text())

def pin(p):
    b = Path(p).read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(name, value):
    with (O / name).open('x') as f:
        json.dump(value, f, ensure_ascii=False, indent=2)
        f.write('\n')

assert not O.exists(), 'Never overwrite a measured transport decision'
plan = read(F + 'FINAL-INPUTS.actual.staged.json')
for p in [plan[k] for k in ['canonical', 'semanticKinds', 'normalRegistry', 'finalScopeReceipt']] + plan['additionalInputGuards']:
    assert pin(p['path'])['sha256'] == p['sha256'], 'Frozen measurement input drift: ' + p['path']
measurement = read(F + 'MEASUREMENT.actual-final-450-page-and-context-deltas.json')
book = read(F + 'full450.current.review.book-model.json')
pages = {p['goalId']: p for p in book['pages']}
graph = read(plan['canonical']['path'])
goals = {g['id']: g for g in graph['goals']}
P = {r['goalId']: r for r in map(json.loads, Path(plan['positiveAggregate']['path']).read_text().splitlines())}
assert len(P) == len(pages) == 450, 'Exact450 actual inputs required'
cache = {}
metadata = {'reviewedAt', 'reviewer', 'reviewRunIds'}

def meaningful_p(p):
    return {k: v for k, v in (p or {}).items() if k not in metadata}

def reference_identities(page):
    return {name: sorted((r['goalId'], r['title']) for key in keys for r in page[key])
            for name, keys in [('forward', ['requires', 'externalPrerequisites']),
                               ('reverse', ['reverseRequires', 'externalReverseRequires'])]}

def known_reference_transport(page, local_pages):
    checked = []
    for key in ['requires', 'reverseRequires', 'externalPrerequisites', 'externalReverseRequires']:
        for r in page[key]:
            ident = r['goalId']
            if ident not in goals or r['title'] != goals[ident]['title']:
                return None
            if key in ['requires', 'reverseRequires']:
                if ident not in local_pages or r.get('anchor') != 'goal-' + ident or r.get('pageNumber') != local_pages[ident]['pageNumber']:
                    return None
                kind = 'exact-local-anchor-and-page'
            else:
                url = r.get('canonicalUrl')
                if url is not None:
                    u = urlparse(url)
                    if not (u.scheme == 'https' and u.netloc == 'skillpilot.com' and u.path == '/lernzielbuch'
                            and u.fragment == 'goal-' + ident and parse_qs(u.query).get('landscape') == [CHEM]
                            and parse_qs(u.query).get('edition') == ['curricular-atomic-v1']):
                        return None
                    kind = 'exact-own-landscape-goal-book-url'
                else:
                    if ident in pages:
                        return None
                    kind = 'existing-outside-book-goal-without-false-book-url'
            checked.append({'direction': key, 'goalId': ident, 'title': r['title'], 'transportKind': kind})
    return checked

retained = []
core = ['goalId', 'shortKey', 'title', 'description', 'applicability', 'visualization', 'evidenceReview', 'goalFingerprint']
for row in measurement['perGoal']:
    if not row['requiresActualFinalInputReview'] or not row['unchangedProductionNativeContractValid']:
        continue
    if row['canonicalContextChangedFields'] or row['bilingualTextChangedFields']:
        continue
    p = row['originalFirstInput']
    if p not in cache:
        cache[p] = read(p)
    source = cache[p]
    old = next(g for g in source['goals'] if g['goalId'] == row['goalId'])
    peer_path = row['originalSecondInput']
    if peer_path not in cache:
        cache[peer_path] = read(peer_path)
    peer = next(g for g in cache[peer_path]['goals'] if g['goalId'] == row['goalId'])
    assert old == peer, 'Original independent native inputs differ'
    a = old['reviewContext']['page']
    current = pages[row['goalId']]
    oldP = old['reviewContext'].get('evidenceProfile')
    if not oldP or meaningful_p(oldP) != meaningful_p(P[row['goalId']]):
        continue
    if any(a.get(k) != current.get(k) for k in core) or reference_identities(a) != reference_identities(current):
        continue
    old_local = {g['goalId']: g['reviewContext']['page'] for g in source['goals']}
    old_links = known_reference_transport(a, old_local)
    new_links = known_reference_transport(current, pages)
    if old_links is None or new_links is None:
        continue
    retained.append({
        'goalId': row['goalId'], 'title': row['title'], 'originalIndex': row['activeIndex'],
        'originalResolution': pin(row['resolutionPath']), 'originalFirstInput': pin(p), 'originalSecondInput': pin(peer_path),
        'actualUnchangedProductionNativeContractPass': True, 'originalTwoRoundInputsExactlyEqual': True,
        'canonicalContextAndBilingualTextsExactlyUnchanged': True,
        'allCurrentPageCoreAndPEvidenceSummaryFieldsExactlyUnchanged': core,
        'wholePRecordExceptOnlyThreeProvenanceFieldsExactlyUnchanged': True,
        'differentPFields': row['completeSelectedPRecordChangedFields'],
        'excludedPFields': sorted(metadata), 'profileReasonStatusDissentAuthorityScopeAndAllFingerprintsExactlyUnchanged': True,
        'forwardAndReverseGoalIdentitiesAndTitlesExactlyEqual': reference_identities(a),
        'oldReferenceTransportChecks': old_links, 'currentReferenceTransportChecks': new_links,
        'strictRawPageChangedFieldsStillReported': row['strictRawPageChangedFields'],
        'currentFlatPageNativeAcceptanceClaimed': False,
        'action': 'Retain only the original native owner and its original exact bindings; original current-contract proof remains valid. No new page fingerprint, reviewer vote or scientific completion is created.',
    })

assert retained, 'No actual metadata-only transport cases; do not weaken selection'
retained_ids = {r['goalId'] for r in retained}
ordered = [g for g in measurement['requiredReviewGoalIds'] if g not in retained_ids]
assert len(ordered) + len(retained_ids) == measurement['summary']['requiredFinalInputReviewGoals'], 'Roster partition mismatch'
assert all(row['goalId'] in ordered for row in measurement['perGoal'] if not row['unchangedProductionNativeContractValid']), 'Never retain an invalid native owner'
O.mkdir()
proof_path = O / 'MEASUREMENT.actual-bounded-metadata-and-reference-transport-retention.json'
write(proof_path.name, {
    'role': 'EXACT_CURRENT_NATIVE_OWNER_RETENTION_NOT_NEW_DESCRIPTION_ACCEPTANCE',
    'originalFullModelMeasurement': pin(F + 'MEASUREMENT.actual-final-450-page-and-context-deltas.json'),
    'originalActualFullModel': pin(F + 'full450.current.review.book-model.json'),
    'originalRequiredCount': measurement['summary']['requiredFinalInputReviewGoals'],
    'additionalValidatedUnchangedOwnersRetained': len(retained), 'retainedOriginalOwnersTotal': 120 + len(retained),
    'actualRequiredFinalInputReviewGoals': len(ordered), 'requiredGoalIds': ordered, 'perGoalExactTransportProof': retained,
    'closedNativeValidationOrScienceRequirementsChanged': False, 'canonicalOrRegistryOrOtherNormalWrites': 0,
    'newScienceOrPageFingerprintsOrVotesClaimed': 0,
})
ids_path = O / 'GOAL_IDS.actual-content-and-context-reviews.json'
write(ids_path.name, {'goalIds': ordered, 'measurement': pin(proof_path), 'derivedFromSameActualFullModel': True})
output_root = F + 'current-binding-v2'
batches = []
for i in range(0, len(ordered), 20):
    n = f'{i // 20 + 1:03}'
    cfg = read(plan['batches'][0]['config']['path'])
    cfg.update({'batchId': f'chemie-current450-bound-context-d-{n}-20261018-v2',
                'bookId': f'chemie-current450-bound-context-d-{n}',
                'goalIds': ordered[i:i + 20], 'outputDirectory': output_root + '/batch-' + n})
    path = O / ('batch-' + n + '.config.json')
    write(path.name, cfg)
    batches.append({'config': pin(path), 'baseGoalBookConfig': plan['baseGoalBookConfig'], 'finalReviewerReceipts': [], 'synthesisAuthoring': None})
plan.update({'outputRoot': output_root, 'goalIds': ordered, 'goalIdsFile': pin(ids_path),
             'finalApplicabilityMeasurement': pin(proof_path), 'batches': batches,
             'unchangedProductionValidatedOldOwnersRetainedWithoutNewPageBinding': 120 + len(retained),
             'earlierConservativeWholePAndRawURLSelection': pin(F + 'FINAL-INPUTS.actual.staged.json')})
plan['additionalInputGuards'] += [pin(proof_path), pin(ids_path)]
write('FINAL-INPUTS.actual-current-bindings.staged.json', plan)
(O / 'transport-selection-writer.py').write_bytes(Path(__file__).read_bytes())
write('SEAL.actual-transport-selection.json', {'role': 'TECHNICAL_RETENTION_AND_CURRENT_ROSTER_ONLY', 'files': [pin(p) for p in sorted(O.iterdir())]})
print(json.dumps({'unchangedOwnersAdditionallyRetained': len(retained), 'oldOwnersTotal': 120 + len(retained), 'requiredCurrentReviews': len(ordered), 'batches': len(batches), 'modelBuilds': 0, 'normalWrites': 0, 'newVotes': 0, 'plan': str(O / 'FINAL-INPUTS.actual-current-bindings.staged.json')}))
