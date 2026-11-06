#!/usr/bin/env python3
"""Closed original-context census, not a new visual review or native approval."""
from pathlib import Path
import collections
import datetime
import hashlib
import json
import re
import runpy

HERE = Path(__file__).resolve().parent
K = runpy.run_path(str(HERE / 'qualify-first-two-families.py'))
ROOT = K['ROOT']
OUT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-four-more-economics-families'
COMMIT = K['ECON_COMMIT']
SOURCE = K['ECON_SOURCE']
QA = K['ECON_QA']
FAMILIES = {
    'wirtschaft-q2-nineteen-image-author-20261008-v1': 19,
    'wirtschaft-e-company-twenty-independent-image-review-20261008-v1': 19,
    'wirtschaft-q-business-macro-twenty-independent-image-review-20261008-v1': 20,
    'wirtschaft-final-concrete-nineteen-independent-image-review-20261008-v1': 19,
}


def digest(path):
    return hashlib.sha256((ROOT / path).read_bytes()).hexdigest()


def unprefix(value):
    result = value.removeprefix('sha256:')
    assert re.fullmatch('[0-9a-f]{64}', result)
    return result


def original(path, expected=None):
    ref, raw = K['original'](path, COMMIT)
    if expected is not None:
        assert ref['sha256'] == unprefix(expected), (path, expected)
    return ref, json.loads(raw) if path.endswith('.json') else raw


def metadata_from_before(path, expected, goal_id, refs):
    bref, before = original(path, expected)
    assert before['goalId'] == goal_id
    outputs = [item for item in before['actualNativeOutputs'] if item['path'].endswith('/metadata.json')]
    assert len(outputs) == 1
    mref, meta = original(outputs[0]['path'], outputs[0]['sha256'])
    assert meta['skillpilotId'] == goal_id and meta['subjectPath'] == 'wirtschaftswissenschaften'
    refs.extend([bref, mref])
    return meta


def main():
    OUT.mkdir(exist_ok=False)
    active = {p: digest(p) for p in [SOURCE, QA]}
    assert active[SOURCE] == '3a60e7ba51cac98666f3943cee3ebb77c129c653f9fdde9f4c09bb20446da9b3'
    source_ref, owner = K['owner_source'](SOURCE, COMMIT)
    owner_ids = {g['id'] for g in owner['goals']}
    goals = {g['id']: g for g in json.loads((ROOT / SOURCE).read_bytes())['goals']}
    qa = json.loads((ROOT / QA).read_bytes())['records']
    rows = []
    for family, expected_count in FAMILIES.items():
        selected = [r for r in qa if family in r['aiNotes']]
        assert len(selected) == expected_count
        for current in selected:
            gid = current['goalId']
            locators = [p for p in re.findall(r'curricula/[^\s`)]+\.json', current['aiNotes']) if family in p]
            assert len(locators) == 1
            rref, review = original(locators[0])
            assert review['goalId'] == gid and gid in owner_ids
            assert current['landscapeId'] == owner['landscapeId']
            refs = [rref]
            title = desc = en_title = en_desc = None
            open_reason = None
            derivatives = []
            if family.startswith('wirtschaft-q2-'):
                assert review['decision'] == 'KEEP' and review['machineApproval'] == 'Reviewed AI'
                assert review['imageAuthorIsReviewer'] is False
                assert all(review['actualInspection'][k] is True for k in ['nativeViewed', 'width360Viewed', 'width680Viewed'])
                assert review['blockingFindings'] == []
                title, desc = review['goalTitle'], review['goalDescription']
                asset_path, asset_hash = review['assetPath'], review['assetSha256']
                derivatives = review['derivatives']
                original_actor, original_date = review['independentReviewer'], review['reviewedAt']
                original_reason = review['actualInspection']['fachlichePruefung']
                profile = 'economics-q2-embedded-de-context-adapter-pending'
            elif family.startswith('wirtschaft-e-company-'):
                assert review['decision'] == 'KEEP' and review['machineReviewCandidateOnly'] is True
                assert review['actualSizesInspected'] == ['native', '360', '680']
                asset_path, asset_hash = review['assetPath'], review['assetSha256']
                derivatives = review.get('actualInspectionDerivatives', [])
                original_actor, original_date = review['reviewer']['agentIdentity'], review['actualCompletedAt']
                original_reason = review['actualFindings']
                profile = 'economics-company-bilingual-snapshot-adapter-pending'
                if 'currentDescriptionDeActuallyRead' in review:
                    assert review['actualWholeBilingualGoalAndPersistedNativeBeforeArgsAndGenerationInputsRead'] is True
                    title, desc = review['currentTitleDeActuallyRead'], review['currentDescriptionDeActuallyRead']
                    en_title, en_desc = review['currentTitleEnActuallyRead'], review['currentDescriptionEnActuallyRead']
                    cref, candidate = original(review['wholeGoalCandidatePath'], review['wholeGoalCandidateSHA'])
                    refs.append(cref)
                    matched = [g for g in candidate if g['id'] == gid]
                    assert len(matched) == 1
                    assert [matched[0][k] for k in ['title', 'description', 'titleEn', 'descriptionEn']] == [title, desc, en_title, en_desc]
                else:
                    open_reason = 'Corrected-image review has no original full goal snapshot or hash-bound original goal input. Basenames in provenanceActuallyRead and an unchanged current source are not substituted for that missing edge.'
            elif family.startswith('wirtschaft-q-business-'):
                assert review['actualDecision'] == 'KEEP' and review['reviewAuthority'] == 'ai_candidate'
                original_actor, original_date = review['reviewerAgentIdentity'], review['actualReviewedAt']
                original_reason = review['goalSpecificActualFindings']
                assert len(review['actualViewings']) == 3
                native = [v for v in review['actualViewings'] if v['kind'] == 'native']
                assert len(native) == 1
                asset_path, asset_hash = native[0]['path'], native[0]['sha256']
                derivatives = [v for v in review['actualViewings'] if v['kind'] != 'native']
                meta = metadata_from_before(review['actualNativeBeforeReceiptPath'], review['actualNativeBeforeReceiptSHA'], gid, refs)
                title, desc = meta['title'], meta['description']
                if 'actualNativeBeforeMetadataSHA' in review:
                    assert review['actualNativeBeforeMetadataRead'] is True
                    assert refs[-1]['sha256'] == unprefix(review['actualNativeBeforeMetadataSHA'])
                    assert title == review['goalTitleDe']
                else:
                    assert review['actualNativeBeforeAndExactArgumentsAndProvenanceRead'] is True
                    # A corrected image's positive result is distinct from the
                    # preserved rejection; the new review binds its own inputs.
                    oldref, rejected = original(review['originalFindingReceiptPath'], review['originalFindingReceiptSHA'])
                    assert rejected['goalId'] == gid
                    refs.append(oldref)
                profile = 'economics-business-native-input-chain-adapter-pending'
            else:
                assert review['decision'] == 'KEEP' and review['reviewer']['authority'] == 'ai_candidate'
                assert review['wholeGoalDEENRead'] is True
                assert review['actualWholeNativeAnd360And680Seen'] is True and review['actualViewCount'] == 3
                assert len(review['actualViews']) == 3 and all(v['actuallySeen'] is True for v in review['actualViews'])
                asset_path, asset_hash = review['assetPath'], review['assetSha256']
                original_actor, original_date = review['reviewer']['agent'], review['actualInspectedAt']
                original_reason = review['goalSpecificActualFindings']
                desc, en_desc = review['currentDescriptionDe'], review['currentDescriptionEn']
                profile = 'economics-final-bilingual-description-adapter-pending'
                if 'provenanceActuallyChecked' in review:
                    checked = review['provenanceActuallyChecked']
                    assert checked['nativeMetadataPromptDigestsActuallyVerified'] is True
                    meta = metadata_from_before(checked['freshNativeBeforeReceipt'], checked['freshNativeBeforeSha256'], gid, refs)
                    title = meta['title']
                    assert desc == meta['description']
                else:
                    open_reason = 'Original DE/EN descriptions are present, but the reviewed title and a hash-bound original input supplying it are absent from this review. Current row title is not retroactively supplied.'
                for view in review['actualViews']:
                    ref, _ = original(view['path'])
                    refs.append(ref)
            assert original_actor and original_date and original_reason
            aref, _ = original(asset_path, asset_hash)
            K['require_asset'](aref, current, unprefix(asset_hash))
            for derivative in derivatives:
                ref, _ = original(derivative['path'], derivative['sha256'])
                refs.append(ref)
            actual = goals[gid]
            mismatches = [key for key, value in [('title', title), ('description', desc), ('titleEn', en_title), ('descriptionEn', en_desc)] if value is not None and value != actual.get(key)]
            status = ('open-original-context-differs' if mismatches else
                      'open-incomplete-original-context' if open_reason else
                      'matching-original-context-closed-adapter-pending')
            rows.append({'family': family, 'goalId': gid, 'status': status,
                'profile': profile, 'originalReview': rref, 'originalContextChain': refs,
                'ownerSource': source_ref, 'reviewedAsset': aref,
                'originalContext': {'title': title, 'description': desc, 'titleEn': en_title, 'descriptionEn': en_desc},
                'currentContext': {k: actual.get(k) for k in ['title', 'description', 'titleEn', 'descriptionEn']},
                'mismatchingFields': mismatches, 'openReason': open_reason,
                'originalReviewer': original_actor, 'originalReviewedAt': original_date,
                'originalReason': original_reason, 'originalDecision': 'KEEP',
                'originalAndCurrentAssetBytesVerified': True,
                'nativeQualificationAdapterAvailable': False})
    assert len(rows) == 77 and len({r['goalId'] for r in rows}) == 77
    assert all(digest(p) == h for p, h in active.items())
    value = {'schemaVersion': 1, 'kind': 'four-closed-economics-original-context-family-census',
        'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'),
        'acceptedRepositoryCommit': K['ACCEPTED'], 'historicalCommit': COMMIT,
        'activeInputs': [{'path': p, 'sha256': h} for p, h in active.items()],
        'counts': dict(collections.Counter(r['status'] for r in rows)),
        'familyCounts': {f: dict(collections.Counter(r['status'] for r in rows if r['family'] == f)) for f in FAMILIES},
        'rows': rows,
        'scope': {'newVisualReview': False, 'newAiOrHumanApproval': False, 'nativeQualifiedReceipt': False,
                  'activeWrites': False, 'globalInventoryCompleteness': False},
        'boundary': 'Exact historical contexts and images are checked, with separate holds. Matching chains need explicit closed native adapters; no free field-pointer authority, current-title interpolation or new approval.'}
    path = OUT / 'family-census.json'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'counts': value['counts'], 'familyCounts': value['familyCounts'], 'sha256': digest(str(path.relative_to(ROOT)))}))


if __name__ == '__main__':
    main()
