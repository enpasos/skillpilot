#!/usr/bin/env python3
"""Qualify only two finite historical profiles from exact original Git inputs.

Writes audit candidates only. Does not review images again or change active QA.
"""
from pathlib import Path
import collections
import datetime
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[4]
OUT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/visualization-context-first-two-families'
MATH_COMMIT = '9d8aabe64487c6d96e7d2a7afe6aeff4a07534c1'
ECON_COMMIT = '42095f427223545968e452d494e4f982c196c7e2'
ACCEPTED = '6fe35a6b0fa807e5a97475b34f3715dc16a89c00'
MATH_SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
ECON_SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
MATH_FAMILY = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-matrix-notation-20260921-v1'
ECON_FAMILY = 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-project-markets-international-methods-twenty-independent-image-review-20261008-v1'
ECON_AUTHOR = 'curricula/DE/Gymnasium/quality/goal-visualization-review/wirtschaft-project-markets-international-methods-twenty-image-author-20261008-v1'
MATH_QA = 'curricula/DE/Gymnasium/quality/goal-visualization-qa/mathematik.qa.json'
ECON_QA = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-first-M7-D9-and14-qualified-integration-root-v1/qa346.current-reviewed14-preserved332.ROOT-QUALIFIED.json'
cache = {}


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def local(path):
    return json.loads((ROOT / path).read_bytes())


def repo_path(path):
    prefix = str(ROOT) + '/'
    if path.startswith(prefix):
        path = path[len(prefix):]
    assert not Path(path).is_absolute() and '..' not in Path(path).parts
    return path


def original(path, commit):
    path = repo_path(path)
    key = (commit, path)
    if key not in cache:
        subprocess.run(['git', 'merge-base', '--is-ancestor', commit, ACCEPTED], cwd=ROOT, check=True)
        cache[key] = subprocess.check_output(['git', 'show', commit + ':' + path], cwd=ROOT)
    raw = cache[key]
    assert raw == (ROOT / path).read_bytes(), 'Historical artifact changed: ' + path
    return {'path': path, 'gitCommit': commit, 'sha256': sha(raw)}, raw


def owner_source(path, commit):
    # Current source may legitimately differ. This exact old blob is association
    # evidence only, never an invented substitute for a review's missing text.
    raw = subprocess.check_output(['git', 'show', commit + ':' + path], cwd=ROOT)
    return {'path': path, 'gitCommit': commit, 'sha256': sha(raw)}, json.loads(raw)


def require_asset(ref, current, claimed):
    assert current['assetSha256'] == 'sha256:' + claimed
    assert current['aiApproved'] == 'yes' and current['aiApprovedAssetSha256'] == current['assetSha256']
    for field in ['publicAssetPath', 'canonicalAssetPath']:
        assert sha((ROOT / current[field]).read_bytes()) == claimed
    assert ref['sha256'] == claimed


def make_receipt(profile, ctx, review_ref, input_ref, source_ref, asset_ref, decision, date, reviewer, reason, now):
    assert all(isinstance(s, str) and s.strip() for s in [decision, date, reviewer, reason])
    return {'schemaVersion': 1, 'kind': 'visualization-reviewed-context-qualification',
            'normalization': 'skillpilot-visualization-display-whitespace-v1',
            'reviewProfile': profile, 'context': ctx,
            'originalReview': review_ref, 'originalInput': input_ref,
            'ownerSource': source_ref, 'reviewedAsset': asset_ref,
            'originalDecision': decision, 'reviewedAt': date, 'reviewer': reviewer,
            'originalReason': reason,
            'qualification': {'qualifiedAt': now, 'qualifier': 'codex-astra-original-evidence-chain-verification',
              'reason': 'Technical qualification of the unchanged original reviewed goal context and exact image bytes. Original verdict, actor and review time preserved. No new image inspection, AI approval, human approval, active QA write or full-lane pass.'}}


def main():
    OUT.mkdir(exist_ok=False)
    (OUT / 'qualification-candidates').mkdir()
    now = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z')
    active_paths = [MATH_SOURCE, ECON_SOURCE, MATH_QA, ECON_QA]
    active_pins = {path: sha((ROOT / path).read_bytes()) for path in active_paths}
    assert active_pins[MATH_SOURCE] == 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
    assert active_pins[ECON_SOURCE] == '3a60e7ba51cac98666f3943cee3ebb77c129c653f9fdde9f4c09bb20446da9b3'
    audit = []
    candidates = []
    m_source_ref, m_owner = owner_source(MATH_SOURCE, MATH_COMMIT)
    e_source_ref, e_owner = owner_source(ECON_SOURCE, ECON_COMMIT)
    math = {g['id']: g for g in local(MATH_SOURCE)['goals']}
    econ = {g['id']: g for g in local(ECON_SOURCE)['goals']}
    mq = {g['goalId']: g for g in local(MATH_QA)['records']}
    eq = {g['goalId']: g for g in local(ECON_QA)['records']}
    integration_path = 'curricula/DE/Gymnasium/quality/goal-visualization-review/math-m7-v-gate-merge-20260923-v1/integration.receipt.json'
    integration_ref, integration_raw = original(integration_path, MATH_COMMIT)
    selections = [v for v in json.loads(integration_raw)['records'] if v['reviewPath'].startswith(MATH_FAMILY + '/')]
    assert len(selections) == 8
    for selected in selections:
        goal_id = selected['goalId']
        review_ref, raw = original(selected['reviewPath'], MATH_COMMIT)
        assert selected['reviewSha256'] == 'sha256:' + review_ref['sha256']
        review = json.loads(raw)
        assert review['goalId'] == goal_id and review['reviewAuthority'] == 'ai_candidate'
        assert any(g['id'] == goal_id for g in m_owner['goals'])
        assert m_owner['landscapeId'] == mq[goal_id]['landscapeId']
        if 'goalSnapshot' in review:
            old = review['goalSnapshot']; title = old['title']; desc = old['description']
            asset = review['candidate']; profile = 'matrix-candidate-v1'
            assert review['decision'] == 'keep' and asset['actuallyViewed'] is True
            reason = review['scopeFit']['evidenceDe']; asset_path = asset['path']; claimed = asset['sha256'][7:]
        elif 'goalDescriptionDe' in review:
            old = None; title = review['goalTitleDe']; desc = review['goalDescriptionDe']
            profile = 'matrix-independent-v3-adapter-not-yet-supported'
            assert review['verdict'] == 'keep' and review['actualVisualInspection']['performed'] is True
            reason = review['summaryDe']; asset_path = review['assetPath']; claimed = review['assetSha256'][7:]
        else:
            old = None; title = review['currentGoalTitle']; desc = None
            profile = 'missing-original-description'
            assert review['decision'] == 'keep' and review['actualVisualInspection'] is True
            reason = None; asset_path = review['imagePath']; claimed = review['imageSha256'][7:]
        asset_ref, _ = original(asset_path, MATH_COMMIT)
        require_asset(asset_ref, mq[goal_id], claimed)
        current = math[goal_id]
        status = 'supported-profile-qualified-candidate'
        if desc is None:
            status = 'open-original-description-not-bound'
        elif title != current['title'] or desc != current['description']:
            status = 'open-original-context-differs'
        elif profile != 'matrix-candidate-v1':
            status = 'matching-original-context-closed-adapter-pending'
        row = {'family': 'math-matrix-notation-eight', 'goalId': goal_id, 'status': status,
               'profile': profile, 'originalReview': review_ref, 'integration': integration_ref,
               'ownerSource': m_source_ref, 'reviewedAsset': asset_ref,
               'originalTitle': title, 'originalDescription': desc,
               'currentTitle': current['title'], 'currentDescription': current['description'],
               'assetAndCurrentCopiesExact': True}
        if status == 'supported-profile-qualified-candidate':
            assert all(old[k] == current[k] for k in ['title', 'titleEn', 'description', 'descriptionEn'])
            assert old['demandLevel'] == current['dimensionTags']['demandLevel']
            ctx = {'landscapeId': m_owner['landscapeId'], 'goalId': goal_id, 'subject': 'mathematik',
                   'title': title, 'description': desc, 'assetSha256': 'sha256:' + claimed,
                   'titleEn': old['titleEn'], 'descriptionEn': old['descriptionEn'], 'demandLevel': old['demandLevel']}
            receipt = make_receipt(profile, ctx, review_ref, review_ref, m_source_ref, asset_ref,
                                   review['decision'], review['reviewedAt'], review['reviewer'], reason, now)
            candidates.append((goal_id, receipt))
        audit.append(row)

    selection_path = ECON_FAMILY + '/actual-final-twenty-selection-16originalKEEP-4correctedKEEP.receipt.json'
    selection_ref, selection_raw = original(selection_path, ECON_COMMIT)
    selections = json.loads(selection_raw)['records']
    assert len(selections) == 20
    for selected in selections:
        goal_id = selected['goalId']
        review_ref, raw = original(selected['independentReceipt']['path'], ECON_COMMIT)
        assert review_ref['sha256'] == selected['independentReceipt']['sha256']
        review = json.loads(raw)
        assert review['goalId'] == goal_id and review['decision'] == 'KEEP'
        assert review['reviewer']['status'] == 'ai_candidate'
        assert review['actualWholeNative360680Views'] == 3
        assert any(g['id'] == goal_id for g in e_owner['goals'])
        assert e_owner['landscapeId'] == eq[goal_id]['landscapeId']
        corrected = selected['selection'] == 'corrected-v2'
        if corrected:
            meta = review['actualGenerationAndBeforeBindings']['metadata']
            input_path = meta['path']; input_sha = meta['sha256']
            assert review['actualFreshNativeBeforeMetadataAndDidacticPromptRead'] is True
        else:
            input_path = ECON_AUTHOR + '/' + goal_id + '/native-before-generation/metadata.json'
            input_sha = review['nativeBeforeAndGenerationTechnicalBinding']['nativeBeforeMetadataSha256']
            assert review['actualNativeBeforeMetadataAndDidacticPromptRead'] is True
        input_ref, input_raw = original(input_path, ECON_COMMIT)
        assert input_ref['sha256'] == input_sha
        old = json.loads(input_raw)
        assert old['skillpilotId'] == goal_id
        assert old['subjectPath'] == 'wirtschaftswissenschaften'
        current = econ[goal_id]
        asset_ref, _ = original(review['actualViewedAsset']['path'], ECON_COMMIT)
        claimed = review['actualViewedAsset']['sha256']
        assert selected['asset']['sha256'] == claimed
        require_asset(asset_ref, eq[goal_id], claimed)
        for derivative in review['actualViewedDerivatives']:
            dref, _ = original(derivative['path'], ECON_COMMIT)
            assert dref['sha256'] == derivative['sha256']
        status = ('matching-original-context-closed-adapter-pending' if corrected
                  else 'supported-profile-qualified-candidate')
        if old['title'] != current['title'] or old['description'] != current['description']:
            status = 'open-original-context-differs'
        row = {'family': 'economics-twenty-original-and-corrected', 'goalId': goal_id,
               'selection': selected['selection'], 'status': status, 'originalReview': review_ref,
               'selectionReceipt': selection_ref, 'originalInput': input_ref,
               'ownerSource': e_source_ref, 'reviewedAsset': asset_ref,
               'originalTitle': old['title'], 'originalDescription': old['description'],
               'currentTitle': current['title'], 'currentDescription': current['description'],
               'assetAndCurrentCopiesExact': True, 'allOriginalInspectedDerivativesExact': True,
               'ENInputBytesNotClaimedFromDEMetadata': True}
        if status == 'supported-profile-qualified-candidate':
            ctx = {'landscapeId': e_owner['landscapeId'], 'goalId': goal_id,
                   'subject': 'wirtschaftswissenschaften', 'title': old['title'],
                   'description': old['description'], 'assetSha256': 'sha256:' + claimed}
            receipt = make_receipt('economics-native-v1', ctx, review_ref, input_ref,
                e_source_ref, asset_ref, review['decision'], review['actualCompletedAt'],
                review['reviewer']['agentIdentity'],
                review['actualGoalSpecificSubjectFormatAccessibilityAndPerspectiveReason'], now)
            candidates.append((goal_id, receipt))
        audit.append(row)

    assert len(candidates) == 18 and len(audit) == 28
    refs = []
    for goal_id, value in candidates:
        file = OUT / 'qualification-candidates' / (goal_id + '.json')
        raw = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
        file.write_bytes(raw)
        refs.append({'goalId': goal_id, 'path': str(file.relative_to(ROOT)), 'sha256': sha(raw)})
    for path, digest in active_pins.items():
        assert sha((ROOT / path).read_bytes()) == digest
    summary = {'schemaVersion': 1, 'kind': 'two-closed-original-visual-review-family-qualification-census',
               'acceptedRepositoryCommit': ACCEPTED, 'qualifiedAt': now,
               'counts': dict(collections.Counter(row['status'] for row in audit)),
               'activeInputPins': [{'path': p, 'sha256': h} for p, h in active_pins.items()],
               'candidateReceipts': refs, 'rows': audit,
               'nativeReceiptValidation': 'pending-new-native-validator',
               'scope': {'newImageInspectionClaimed': False, 'newAiOrHumanApprovalClaimed': False,
                         'activeQaOrSourceWrites': False, 'fullLegacyCensusClaimed': False},
               'qualificationBoundary': 'Four missing/drifted Math contexts remain open. Six other matching original contexts need their own supported closed adapters; they are not forced into the initial two profiles. No fresh-review total is inferred for the remaining global inventory.'}
    (OUT / 'family-census.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'counts': summary['counts'], 'candidateReceipts': len(refs),
                      'censusSha256': sha((OUT / 'family-census.json').read_bytes())}))


if __name__ == '__main__':
    main()
