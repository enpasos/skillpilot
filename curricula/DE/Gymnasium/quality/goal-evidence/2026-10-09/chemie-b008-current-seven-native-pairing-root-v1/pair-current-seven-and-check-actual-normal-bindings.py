# SPDX-License-Identifier: Apache-2.0
"""Bind separately completed current reviews; do not generate scientific decisions."""
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
A = BASE / 'chemie-b008-current-seven-native-description-independent-a-v1'
B = BASE / 'chemie-b008-source19-remaining-seven-whole-independent-b-v1/native-seven-current-v2-independent-v1'
AUTHOR = BASE / 'chemie-b008-current-twenty-six-native-preparation-author-v1/seven-operative-native-preparation-v2'
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


def put(p, v):
    assert not p.exists(), p
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')


entry_paths = [A / 'completed-native-seven-description-independent-a.integration-entry.json',
               B / 'completed-current-seven-native-independent-b.integration-entry.json']
ae, be = [read(p) for p in entry_paths]
for e in (ae, be):
    verify_tree(e)
for ref in (ae['independentFirstFreeze'], be['ownSemanticFirstSeal'], be['actualFinalNormalBindingsSeal']):
    verify_tree(read(verify(ref)))
assert ae['scopeAndLimits']['blindToOtherRuns'] is True
assert ae['scopeAndLimits']['P7ApprovalByThisReviewer'] is False
assert be['noFreshPeerJudgmentsRead'] is True

ap = verify(ae['ordinaryD']['records'])
bp = verify(next(v for v in be['normalDRecordsAndRun'] if v['path'].endswith('.jsonl')))
ar, br = rows(ap), rows(bp)
inputs = [read(verify(ae['ordinaryD']['fullBilingualContextInput'])), read(verify(be['normalDInput']))]
assert inputs[0] == inputs[1]
ids = [r['goalId'] for r in ar]
assert ids == [r['goalId'] for r in br] == ae['scopeAndLimits']['goalIds']
assert len(ids) == len(set(ids)) == 7
d_schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-description-review/v1/goal-description-review-record.schema.json'))
same_fields = ('goalId', 'goalFingerprint', 'pageFingerprint', 'bundleFingerprint', 'bookDigest',
               'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn')
pairs = []
for a, b in zip(ar, br):
    for r in (a, b):
        d_schema.validate(r)
        assert r['decision'] == 'keep' and r['recordStatus'] == 'candidate' and r['reviewAuthority'] == 'ai_candidate'
    assert all(a[f] == b[f] for f in same_fields), a['goalId']
    assert a['runId'] != b['runId'] and a['campaignId'] != b['campaignId']
    pairs.append({'goalId': a['goalId'], 'goalFingerprint': a['goalFingerprint'], 'pageFingerprint': a['pageFingerprint'],
                  'independentA': bind(ap), 'independentB': bind(bp), 'decision': 'keep',
                  'independentARationale': a['rationale'], 'independentBRationale': b['rationale'],
                  'noHumanApproval': True})
runs = [read(verify(ae['ordinaryD']['runManifest'])), read(verify(next(v for v in be['normalDRecordsAndRun'] if v['path'].endswith('.run.json'))))]
assert all(r['blindToOtherRuns'] is True and r['status'] == 'completed' for r in runs)
assert len({r['independenceGroupId'] for r in runs}) == 2

# Missing local generated files are restored from already reviewed real originals.
# No raster generation, resampling, original overwrite or canonical goal change.
assets_path = verify(be['normalPActualOriginalImageBindings'])
copies = []
for r in read(assets_path)['resources']:
    source = verify(r['actualOriginal'])
    assert r['expectedActualNativeDigest'] == bind(source)['sha256']
    assert r['url'].startswith('/assets/goal-visualizations/chemie/')
    destination = ROOT / 'app/public' / r['url'].lstrip('/')
    assert destination.name.startswith(r['goalId'] + '.') and r['goalId'] in ids
    existed = destination.exists()
    if existed:
        assert destination.read_bytes() == source.read_bytes(), destination
    else:
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(source, destination)
    assert destination.read_bytes() == source.read_bytes()
    copies.append({'goalId': r['goalId'], 'original': bind(source), 'generatedPublicCopy': bind(destination),
                   'copyAlreadyExisted': existed, 'bytesExact': True, 'newScientificApproval': False})
assert len(copies) == 7
put(OWN / 'seven-existing-reviewed-raster-bytes.actual-local-public-copy.json', {
    'schemaVersion': 1, 'role': 'Technical restoration of local generated asset bytes only', 'copies': copies,
    'historicalOriginalsUnchanged': True, 'newRasterGeneration': False, 'humanApproval': False,
    'newScientificClosures': 0, 'restoredM7Bindings': 0, 'strictGain': 0})

whole = read(AUTHOR / 'current-seven-fourteen-operative-cases-and-whole-profiles.neutral-input.json')
operative = {r['goalId']: r for r in whole['entries']}
author_p = {r['goalId']: r for r in rows(AUTHOR / 'P7.actual-current-raster.ordinary-author-candidate.review.jsonl')}
actual_p = {r['goalId']: r for r in rows(verify(be['normalPRecords']))}
assert set(operative) == set(author_p) == set(actual_p) == set(ids)
p_schema = jsonschema.Draft202012Validator(read(ROOT / 'contracts/goal-evidence/v2/goal-evidence-profile.schema.json'))
for gid in ids:
    p_schema.validate(actual_p[gid])
    assert actual_p[gid]['reviewAuthority'] == 'ai_candidate' and actual_p[gid]['status'] == 'needs_human_review'
    for f in ('profile', 'profileFingerprint', 'goalFingerprint', 'reviewInputFingerprint', 'reviewCriteriaFingerprint'):
        assert actual_p[gid][f] == author_p[gid][f], (gid, f)
    assert actual_p[gid]['profile'] == operative[gid]['wholePairedNormalV2Profile']

commands = []
for side, results in [('a', A / 'results'), ('b', B / 'normal-D7-results')]:
    directory = AUTHOR / 'native-seven' / f'round-{side}'
    commands.append((f'D7-{side}', [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts',
        '--bundle', str(directory / 'review-bundle-manifest.json'), '--input', str(directory / 'description-review-input.json'),
        '--campaign', str(directory / 'description-review-campaign.json'), '--batches-dir', str(directory / 'batches'),
        '--results-dir', str(results)]))
commands.append(('P7-b', [str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/positiveGoalEvidenceReview.ts',
    '--config=' + str(verify(be['normalPConfig'])), '--mode=check']))


def execute(task):
    name, command = task
    started = datetime.now(timezone.utc).isoformat()
    result = subprocess.run(command, cwd=ROOT, capture_output=True, text=True)
    receipt = {'schemaVersion': 1, 'startedAt': started, 'completedAt': datetime.now(timezone.utc).isoformat(),
               'command': command, 'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr,
               'sameExistingValidatorNoSuppressionOrAlias': True, 'humanApproval': False, 'strictGain': 0}
    path = OWN / 'checks' / f'{name}.normal-actual.receipt.json'
    put(path, receipt)
    return name, result.returncode, bind(path)


with ThreadPoolExecutor(max_workers=3) as pool:
    receipts = list(pool.map(execute, commands))
assert all(code == 0 for _, code, _ in receipts), receipts
pair_path = OWN / 'seven-actual-native-descriptions.independent-A-B.normal-pair.actual.json'
put(pair_path, {'schemaVersion': 1, 'pairedAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical pairing of genuine separately completed blind ordinary native description campaigns',
    'independentEntries': [bind(p) for p in entry_paths], 'actualCheckedBindings': list(CHECKED.values()),
    'descriptionPairs': pairs, 'ordinaryAffectedChecks': [r for _, _, r in receipts],
    'actualLocalAssetCopies': bind(OWN / 'seven-existing-reviewed-raster-bytes.actual-local-public-copy.json'),
    'rootOwnDescriptionReviewSupplementalOnly': bind(BASE / 'chemie-b008-current-seven-native-independent-a-root-v1/root-current-native-review.exposure-and-normal-gate-disposition.actual.json'),
    'authorP7NotSelfApprovedByDescriptionReviewerA': True,
    'currentNativeP7BodiesExactAgainstActuallyReviewedMaterials': True,
    'ordinaryP7Status': 'needs_human_review_candidate; not active integration approval',
    'wholeSourceAtlas354Of395AndCourseAndProtected8ContextsRemainSeparate': True,
    'activeCanonicalOrRegistryWrites': 0, 'newScientificClosures': 0, 'restoredM7Bindings': 0,
    'netStrictGain': 0, 'humanApproval': False, 'humanTrial': False})
put(OWN / 'seven-actual-native-descriptions.independent-A-B.normal-pair.first.freeze.json',
    {'schemaVersion': 1, 'role': 'First unchanged technical pair seal', 'pair': bind(pair_path)})
print(json.dumps({'ordinaryPairedD': len(pairs), 'normalChecks': {n: code for n, code, _ in receipts},
                  'localExistingByteCopies': len(copies), 'strictGain': 0, 'pair': bind(pair_path)}))
