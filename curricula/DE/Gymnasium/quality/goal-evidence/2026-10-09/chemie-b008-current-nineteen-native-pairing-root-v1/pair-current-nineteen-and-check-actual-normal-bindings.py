# SPDX-License-Identifier: Apache-2.0
"""Pair completed genuine D reviews and verify already reviewed P bodies."""
import hashlib
import json
import shutil
import subprocess
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path

import jsonschema

OWN = Path(__file__).resolve().parent
ROOT = next(p for p in OWN.parents if (p / '.git').exists() and (p / 'AGENTS.md').is_file())
BASE = OWN.parent
A = BASE / 'chemie-b008-current-nineteen-native-independent-a-root-v1'
B = BASE / 'chemie-b008-current-nineteen-native-v2-independent-a-v1'
AUTHOR = BASE / 'chemie-b008-current-twenty-six-native-preparation-author-v1/nineteen-operative-native-preparation-v2'
CHECKED = {}


def read(p):
    return json.loads(p.read_text())


def rows(p):
    return [json.loads(line) for line in p.read_text().splitlines() if line]


def bind(p):
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': 'sha256:' + hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def verify(v):
    p = ROOT / v['path']
    actual = bind(p)
    assert actual['sha256'] == 'sha256:' + v['sha256'].removeprefix('sha256:'), p
    assert 'bytes' not in v or actual['bytes'] == v['bytes'], p
    CHECKED[v['path']] = actual
    return p


def verify_tree(v):
    if isinstance(v, dict):
        if isinstance(v.get('path'), str) and isinstance(v.get('sha256'), str):
            verify(v)
        for child in v.values():
            verify_tree(child)
    elif isinstance(v, list):
        for child in v:
            verify_tree(child)


def put(p, value):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


entry_paths = [A / 'completed-current-nineteen-native-description-root-A.normal-entry.json',
               B / 'completed-current-nineteen-native-v2-independent-a.integration-entry.json']
ae, be = [read(p) for p in entry_paths]
for e in (ae, be):
    verify_tree(e)
for reference in (ae['firstFreeze'], be['normalDescriptionReview']['firstFreeze'], be['normalPositiveReview']['firstFreeze']):
    verify_tree(read(verify(reference)))
assert ae['blindToCurrentNativeD19PeerRuns'] is True
assert be['normalPositiveReview']['peerCurrentNativePResultsReadBeforeFirst'] is False
ap = verify(ae['normalDRecords'])
bp = verify(be['normalDescriptionReview']['batchRecords'])
ar, br = rows(ap), rows(bp)
assert read(verify(ae['actualBilingualContextInput'])) == read(verify(be['normalDescriptionReview']['reviewInput']))
ids = [r['goalId'] for r in ar]
assert ids == [r['goalId'] for r in br]
assert len(ids) == len(set(ids)) == 19
schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'))
fields = ('goalId', 'goalFingerprint', 'pageFingerprint', 'bundleFingerprint', 'bookDigest',
          'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn')
pairs = []
for a, b in zip(ar, br):
    for r in (a, b):
        schema.validate(r)
        assert r['decision'] == 'keep' and r['recordStatus'] == 'candidate' and r['reviewAuthority'] == 'ai_candidate'
    assert all(a[f] == b[f] for f in fields), a['goalId']
    assert a['runId'] != b['runId'] and a['campaignId'] != b['campaignId']
    pairs.append({'goalId': a['goalId'], 'goalFingerprint': a['goalFingerprint'], 'pageFingerprint': a['pageFingerprint'],
        'independentRootRoundA': bind(ap), 'independentAgentRoundB': bind(bp),
        'decision': 'keep', 'wholeRootUnderstanding': a['understandingEvidence'], 'wholeAgentUnderstanding': b['understandingEvidence'],
        'rootRationale': a['rationale'], 'agentRationale': b['rationale'], 'humanApproval': False})
runs = [read(verify(ae['normalDRun'])), read(verify(be['normalDescriptionReview']['normalRun']))]
assert all(r['status'] == 'completed' and r['blindToOtherRuns'] is True for r in runs)
assert len({r['independenceGroupId'] for r in runs}) == 2

# Restore only byte-identical reviewed image candidates to local generated public
# paths; this is neither a new image review nor canonical publication.
asset_rows = read(verify(be['normalPositiveReview']['actualInactiveRasterResourceModelBindings']))['records']
visual_pair_path = BASE / 'chemie-b008-twenty-six-current-visual-pairing-technical-v1/all26-actual-role-pairing.current-inactive.v2.json'
visual_rows = {r['goalId']: r for r in read(visual_pair_path)['rows']}
copies = []
for r in asset_rows:
    gid = r['goalId']
    visual = visual_rows[gid]
    original = verify(visual['actualSelectedRaster'])
    capsule = verify(r['actualAsset'])
    assert original.read_bytes() == capsule.read_bytes(), gid
    assert visual['selectedResourceLink'] == r['currentPrimaryResourceLink']
    assert visual['pairedCurrentRoleStatus'] == 'PAIRED_KEEP'
    assert r['currentModelResourceDigestEqualsActualAssetBytes'] is True
    url = r['currentPrimaryResourceLink']['url']
    assert url.startswith('/assets/goal-visualizations/chemie/')
    destination = ROOT / 'app/public' / url.lstrip('/')
    assert destination.name.startswith(gid + '.') and gid in ids
    existed = destination.exists()
    if existed:
        assert destination.read_bytes() == original.read_bytes()
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(original, destination)
    assert destination.read_bytes() == original.read_bytes()
    copies.append({'goalId': gid, 'reviewedOriginal': bind(original), 'capsuleOriginal': bind(capsule),
        'generatedPublicCopy': bind(destination), 'alreadyExisted': existed, 'bytesExact': True, 'newScientificApproval': False})
assert {r['goalId'] for r in copies} == set(ids)
copy_path = OWN / 'nineteen-existing-reviewed-raster-bytes.actual-local-public-copy.json'
put(copy_path, {'schemaVersion': 1, 'role': 'Technical byte restoration of already reviewed actual raster originals',
    'visualRolePair': bind(visual_pair_path), 'copies': copies, 'newRasterGeneration': False,
    'humanApproval': False, 'newScientificClosures': 0, 'restoredM7Bindings': 0, 'netStrictGain': 0})

whole_path = AUTHOR / 'current-nineteen-thirty-eight-operative-cases-and-whole-profiles.neutral-input.json'
operative = {r['goalId']: r for r in read(whole_path)['entries']}
author_p_path = AUTHOR / 'P19.actual-current-raster.ordinary-author-candidate.review.jsonl'
author_p = {r['goalId']: r for r in rows(author_p_path)}
actual_p_path = verify(be['normalPositiveReview']['records'])
actual_p = {r['goalId']: r for r in rows(actual_p_path)}
assert set(operative) == set(author_p) == set(actual_p) == set(ids)
p_schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
for gid in ids:
    p_schema.validate(actual_p[gid])
    assert actual_p[gid]['reviewAuthority'] == 'ai_candidate' and actual_p[gid]['status'] == 'needs_human_review'
    for f in ('profile', 'profileFingerprint', 'goalFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint'):
        assert actual_p[gid][f] == author_p[gid][f], (gid, f)
    assert actual_p[gid]['profile'] == operative[gid]['wholePairedNormalV2Profile']

commands = []
for side, results in [('a', A / 'normal-D19-results'), ('b', B / 'results')]:
    directory = AUTHOR / 'native-nineteen' / f'round-{side}'
    commands.append((f'D19-{side}', [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
        '--bundle', str(directory / 'review-bundle-manifest.json'), '--input', str(directory / 'description-review-input.json'),
        '--campaign', str(directory / 'description-review-campaign.json'), '--batches-dir', str(directory / 'batches'), '--results-dir', str(results)]))
commands.append(('P19-current-frame', [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/positiveGoalEvidenceReview.ts',
    '--config=' + str(verify(be['normalPositiveReview']['config'])), '--mode=check']))


def execute(task):
    name, command = task
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    path = OWN / 'checks' / f'{name}.normal-actual.receipt.json'
    put(path, {'schemaVersion': 1, 'startedAt': started, 'completedAt': datetime.now(timezone.utc).isoformat(),
        'command': command, 'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
        'sameExistingValidatorNoSuppressionOrAlias': True, 'humanApproval': False, 'strictGain': 0})
    return name, result.returncode, bind(path)


with ThreadPoolExecutor(max_workers=3) as pool:
    receipts = list(pool.map(execute, commands))
assert all(code == 0 for _, code, _ in receipts), receipts
pair_path = OWN / 'nineteen-actual-native-D-and-reviewed-P.technical-pair.actual.json'
put(pair_path, {'schemaVersion': 1, 'pairedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical pair of genuine separately completed blind D19 science; exact prior P science and current P19 frame bindings',
    'independentDEntries': [bind(p) for p in entry_paths], 'actualCheckedBindings': list(CHECKED.values()),
    'descriptionPairs': pairs, 'ordinaryAffectedChecks': [r for _, _, r in receipts], 'actualLocalAssetCopies': bind(copy_path),
    'wholeOperativeScience': bind(whole_path), 'actualNormalAuthorProfiles': bind(author_p_path),
    'actualIndependentCurrentFrameProfiles': bind(actual_p_path),
    'rootNotClaimedAsAdditionalBlindP19Reviewer': True,
    'currentP19BodiesExactAgainstActuallyReviewedMaterials': True,
    'ordinaryPStatus': 'needs_human_review_candidate; not active integration approval',
    'all19ActualPDFTextsPreviouslyReadByRoot': True, 'all19RasterPagesSeenByRoot': False,
    'separateSourceCourseAtlasAndProtected8AndAdditionalENBindingsRemainHeld': True,
    'activeCanonicalOrRegistryWrites': 0, 'newScientificClosures': 0, 'restoredM7Bindings': 0,
    'netStrictGain': 0, 'humanApproval': False, 'humanTrial': False})
put(OWN / 'nineteen-actual-native-D-and-reviewed-P.technical-pair.first.freeze.json',
    {'schemaVersion': 1, 'role': 'First immutable completed technical pair', 'pair': bind(pair_path), 'script': bind(Path(__file__).resolve())})
print(json.dumps({'ordinaryPairedD': len(pairs), 'normalChecks': {n: code for n, code, _ in receipts},
    'localExistingByteCopies': len(copies), 'strictGain': 0, 'pair': bind(pair_path)}))
