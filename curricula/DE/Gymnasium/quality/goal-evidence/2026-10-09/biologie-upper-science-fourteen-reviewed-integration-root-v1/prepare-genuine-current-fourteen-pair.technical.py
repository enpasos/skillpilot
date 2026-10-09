# SPDX-License-Identifier: Apache-2.0
"""Pair actual separately sealed decisions; never create scientific judgments."""
import copy
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
A = BASE / 'biologie-upper-science-fourteen-independent-a-v1'
B = BASE / 'biologie-upper-science-fourteen-independent-b-v1'
AUTHOR = BASE / 'biologie-upper-science-fourteen-whole-author-v1'
checked = {}


def read(path):
    return json.loads(path.read_text())


def rows(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)),
            'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(value):
    path = ROOT / value['path']
    actual = checked.setdefault(str(path), bind(path))
    assert actual['sha256'] == 'sha256:' + value['sha256'].removeprefix('sha256:'), path
    if 'bytes' in value:
        assert actual['bytes'] == value['bytes'], path
    return path


def verify_tree(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            verify(value)
        for child in value.values():
            verify_tree(child)
    elif isinstance(value, list):
        for child in value:
            verify_tree(child)


def put(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    raw = json.dumps(value, ensure_ascii=False, indent=2) + '\n'
    if path.exists():
        assert path.read_text() == raw, path
        return
    path.write_text(raw)


entry_paths = [A / 'completed-current-fourteen-independent-a.integration-entry.json',
               B / 'completed-current-fourteen-independent-b.integration-entry.json']
entries = [read(path) for path in entry_paths]
for entry in entries:
    verify_tree(entry)
    for key, value in entry.items():
        if 'seal' in key.lower():
            if isinstance(value, str) and value.endswith('.json'):
                verify_tree(read(ROOT / value))
            elif isinstance(value, dict) and isinstance(value.get('path'), str):
                verify_tree(read(verify(value)))
            elif isinstance(value, list):
                for item in value:
                    if isinstance(item, dict) and isinstance(item.get('path'), str):
                        verify_tree(read(verify(item)))

plan_path = OWN / 'current-fourteen-ordinary-import-plan.pending-independent-final-pair.json'
plan = read(plan_path)
ids = [op['goalId'] for op in plan['imageOperations']]
targeted = {'b66372fc-f72d-5686-9570-1939ed3fbd2a', '8375310d-1f7e-542d-9969-55ad4bd37f7c'}
original_ids = set(ids) - targeted
assert len(original_ids) == 12
final_author = {row['goalId']: row for row in rows(AUTHOR / 'integration-preparation-v1/positive/final-fourteen-whole-profile-basis.author-candidate.review.jsonl')}
schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
positive_pairs = []
active_configs = []
for scope, a_config_path, b_config_path, expected_ids in [
    ('P12', A / 'P12-first-native.positive.inactive.config.json', B / 'positive-normal/P12-original-native14/profiles.independent-b.config.json', original_ids),
    ('P2', A / 'P2-targeted-native.positive.inactive.config.json', B / 'positive-normal/P2-actual-native2/profiles.independent-b.config.json', targeted),
]:
    a_config, b_config = read(a_config_path), read(b_config_path)
    a_path, b_path = ROOT / a_config['reviewPath'], ROOT / b_config['reviewPath']
    ar, br = {row['goalId']: row for row in rows(a_path)}, {row['goalId']: row for row in rows(b_path)}
    assert set(ar) == set(br) == expected_ids
    for gid in b_config['scope']['goalIds']:
        for record in (ar[gid], br[gid]):
            schema.validate(record)
            assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
            assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
            assert record['dissent'] == []
        for field in ('goalFingerprint', 'reviewInputFingerprint', 'profileFingerprint', 'reviewCriteriaFingerprint', 'profile'):
            assert ar[gid][field] == br[gid][field] == final_author[gid][field], (gid, field)
        assert set(ar[gid]['reviewRunIds']).isdisjoint(br[gid]['reviewRunIds']), gid
        positive_pairs.append({'goalId': gid, 'scope': scope,
                               'independentA': bind(a_path), 'independentB': bind(b_path),
                               'profileFingerprint': br[gid]['profileFingerprint'],
                               'reviewInputFingerprint': br[gid]['reviewInputFingerprint'],
                               'wholeBilingualCases': len(br[gid]['profile']['applicationCaseBriefs']),
                               'actualFirstOrTargetedIndependentDecisionRetained': True,
                               'humanApproval': False})
    destination = OWN / 'positive' / f'{scope}.exact-independent-b.review.jsonl'
    destination.parent.mkdir(parents=True, exist_ok=True)
    if destination.exists():
        assert destination.read_bytes() == b_path.read_bytes(), destination
    else:
        shutil.copyfile(b_path, destination)
    active_config = copy.deepcopy(b_config)
    active_config.update(landscapePath='curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
                         semanticKindLedgerPath='curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json',
                         reviewPath=str(destination.relative_to(ROOT)))
    active_path = OWN / 'positive' / f'{scope}.paired-current.future-active.config.json'
    jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-review-config.schema.json')).validate(active_config)
    put(active_path, active_config)
    active_configs.append(bind(active_path))

av_path = verify(entries[0]['current14CombinedDPV'])
av = {row['goalId']: row for row in read(av_path)['entries']}
bv_path = B / 'native-fourteen-v1/native14-v1-independent-actual-V.verdict.json'
bv = {row['goalId']: row for row in read(bv_path)['rows']}
bt_path = B / 'targeted-native2.first-verdict.immutable.json'
bt = {row['goalId']: row for row in read(bt_path)['rows']}
assert set(av) == set(bv) == set(ids) and set(bt) == targeted
qa = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
qa_by_id = {row['goalId']: row for row in qa['records']}
patch, visual_pairs = [], []
paired_at = datetime.now(timezone.utc).isoformat()
for op in plan['imageOperations']:
    gid = op['goalId']
    image = verify(op['actualImage'])
    a, b = av[gid], (bt[gid] if gid in targeted else bv[gid])
    assert a['independentDescriptionApproval'] and a['independentPositiveApproval'] and a['independentVisualApproval'], gid
    assert a['criteriaPass']['V_actualOriginal360680Inspected'] is True, gid
    for view in a['actualOriginal360680ViewEvidence']:
        # First12 and targeted2 retain their actual independent receipt structures.
        if 'binding' in view:
            verify(view['binding'])
        elif 'path' in view:
            verify(view)
    assert a['actualImageBinding']['sha256'] == op['actualImage']['sha256'], gid
    if gid in targeted:
        assert b['machineCandidateDApproval'] and b['machineCandidatePApproval'] and b['machineCandidateVApproval'], gid
        assert read(bt_path)['actualOriginal360680InspectionAlreadyCompleted'] is True
    else:
        assert b['visualizationApproval'] is True, gid
        assert b['originalActuallyViewed'] and b['width360ActuallyViewed'] and b['width680ActuallyViewed'], gid
        assert b['selectedRaster']['sha256'] == op['actualImage']['sha256'], gid
    row = copy.deepcopy(qa_by_id[gid])
    assert row['visualizationState'] == 'missing', gid
    row.update(visualizationState='available', missingReason='',
               imageUrl=op['reviewedResourceLink']['url'],
               publicAssetPath=f'app/public/assets/goal-visualizations/biologie/{gid}/{gid}.png',
               canonicalAssetPath=f'curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png',
               assetSha256=op['actualImage']['sha256'], aiApproved='yes',
               aiApprovedAssetSha256=op['actualImage']['sha256'], aiReviewedAt=paired_at,
               aiReviewer='Technical pairing of actual sealed independent A/B native and original/360/680 image reviews',
               aiNotes='Independent A: ' + a['visualReason'] + ' Independent B: ' + b['scientificReason']
                       + ' Exact paired original and targeted evidence: ' + str((OWN / 'checks/current-fourteen-genuine-PV-AM-pair.actual.json').relative_to(ROOT))
                       + '. This date records technical pairing. Actual independent review dates remain sealed. No physical handset, learner-performance, human approval or trial is claimed.')
    patch.append(row)
    visual_pairs.append({'goalId': gid, 'actualImage': bind(image), 'independentA': bind(av_path),
                         'independentB': bind(bt_path if gid in targeted else bv_path),
                         'ordinaryNativeFrameActuallyInspected': True,
                         'original360680ActuallyInspected': True,
                         'targetedOrUnchangedFirstEvidence': 'targeted2' if gid in targeted else 'unchangedFirst12',
                         'decision': 'KEEP', 'humanApproval': False})

en_id = '8375310d-1f7e-542d-9969-55ad4bd37f7c'
am_pairs = []
for label, config_path, a_path, b_path in [
    ('A394', ROOT / 'curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-biology-full.config.json', A / 'one-en-atomicity.review.independent-a.jsonl', B / 'EN1-normal/atomicity.independent-b.review.jsonl'),
    ('M394', ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review/canonical-biology-full.config.json', A / 'one-en-memory.review.independent-a.jsonl', B / 'EN1-normal/memory.independent-b.review.jsonl'),
]:
    a, b = rows(a_path)[0], rows(b_path)[0]
    assert a['goalId'] == b['goalId'] == en_id
    for field in ('ruleVersion', 'landscapeId', 'fingerprint', 'status'):
        assert a[field] == b[field], field
    original_path = ROOT / read(config_path)['reviewPath']
    original = original_path.read_text().splitlines(keepends=True)
    matches = [n for n, line in enumerate(original) if json.loads(line)['goalId'] == en_id]
    assert len(original) == 394 and len(matches) == 1
    amended = list(original)
    amended[matches[0]] = a_path.read_text()
    destination = OWN / 'atomicity-memory' / f'{label}.original393-plus-genuine-EN1.jsonl'
    destination.parent.mkdir(parents=True, exist_ok=True)
    assert not destination.exists()
    destination.write_text(''.join(amended))
    assert all(old == new for n, (old, new) in enumerate(zip(original, amended)) if n not in matches)
    am_pairs.append({'label': label, 'original': bind(original_path), 'adopted': bind(destination),
                     'independentA': bind(a_path), 'independentB': bind(b_path),
                     'sameGenuineSemanticDecision': True, 'other393RowsByteExact': True})

put(OWN / 'candidate/visualization-qa.fourteen-actual-paired.future-active.patch.json', {'schemaVersion': 1, 'records': patch})
put(OWN / 'checks/current-fourteen-genuine-PV-AM-pair.actual.json', {
    'schemaVersion': 1, 'role': 'Technical synthesis of actual independent decisions, no new scientific review',
    'independentIntegrationEntries': [bind(path) for path in entry_paths],
    'independentSealedBindingsVerified': list(checked.values()),
    'positivePairs': positive_pairs, 'currentPositiveConfigs': active_configs,
    'visualPairs': visual_pairs, 'genuineEN1AtomicityMemoryPairs': am_pairs,
    'unchangedTwelveWholeFirstReviewsRetained': True,
    'ownResultsP11AndVisibleRateV10ActuallyResolved': True,
    'ordinaryCurrentPAssetChecksPendingApplication': True,
    'activeWrites': 0, 'strictGain': 0, 'humanApproval': False, 'humanTrial': False})
print(json.dumps({'pairedActualP': 14, 'pairedActualV': 14, 'genuineEN1AM': 1,
                  'other393AMRowsExact': True, 'activeWrites': 0, 'strictGain': 0}))
