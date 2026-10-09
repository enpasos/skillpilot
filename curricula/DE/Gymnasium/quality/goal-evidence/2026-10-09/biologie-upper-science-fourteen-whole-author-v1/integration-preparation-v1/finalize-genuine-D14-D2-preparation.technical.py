# SPDX-License-Identifier: Apache-2.0
"""Seal bounded ordinary D preparation only after both genuine targeted rounds exist."""
import hashlib
import importlib.util
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {
        'path': path.relative_to(ROOT).as_posix(),
        'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(),
        'bytes': len(data),
    }


def verify(binding):
    assert bind(ROOT / binding['path']) == binding, binding['path']


def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


seal_path = OWN / 'genuine-D14-D2-integration-preparation.first.freeze.json'
assert not seal_path.exists()
plan = read(OWN / 'planned-current-fourteen-D-and-P-bindings.technical.json')
for binding in plan['activeInputBindings']:
    verify(binding)
for subdir, seal_name in [
    ('', 'whole-fourteen-science-author.first.freeze.json'),
    ('remediation-v2', 'targeted-whole-remediation.first.freeze.json'),
    ('native-preparation-v1', 'fourteen-native-technical-author.first.freeze.json'),
    ('remediation-v3-p11', 'targeted-p11-own-results.first.freeze.json'),
    ('native-targeted-two-v2', 'targeted-two-native-technical-author.first.freeze.json'),
]:
    for binding in read(OWN.parent / subdir / seal_name)['files']:
        verify(binding)

indices = [OWN / 'native-d-fourteen-original/resolution-index.json',
           OWN / 'native-d-two-targeted/resolution-index.json']
for index_path, expected in zip(indices, [14, 2]):
    index = read(index_path)
    assert len(index['resolutions']) == expected
    assert all(row['strictDescriptionComplete'] for row in index['resolutions'])
    for row in index['resolutions']:
        resolution = read(index_path.parent / row['resolutionPath'])
        assert resolution['decision'] == 'keep_current'
        assert resolution['rounds']['first']['runId'] != resolution['rounds']['second']['runId']
        assert bind(index_path.parent / row['resolutionPath'])['sha256'] == row['resolutionDigest']
    check = read(OWN / ('checks/' + ('fourteen-original' if expected == 14 else 'two-targeted')
                        + '.genuine-native-D-direct-existing-contracts.actual.json'))
    assert len(check['D'][0]['resolutions']) == expected
    assert check['D'][0]['nativeCampaignResultsPASS'] and check['D'][0]['nativeDualSummaryPASS']
    assert check['D'][0]['nativeSynthesisPASS']

records = [json.loads(line) for line in
           (OWN / 'positive/final-fourteen-whole-profile-basis.author-candidate.review.jsonl').read_text().splitlines()
           if line.strip()]
assert len(records) == 14
assert all(record['status'] == 'needs_human_review' and record['reviewAuthority'] == 'ai_candidate'
           and record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
           and record['reviewRunIds'] == [] for record in records)
assert read(OWN / 'checks/final-whole-P14-source-basis.normal-commands.actual.json')['exitCode'] == 0

spec = importlib.util.spec_from_file_location('normal_schema_validator', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)
runtime_schema = read(ROOT / 'docs/landscape-runtime.schema.json')
json_paths = sorted(OWN.rglob('*.json'))
assert all(module.validate_file(path.relative_to(ROOT).as_posix(), runtime_schema) for path in json_paths)
assert not any(path.is_symlink() for path in OWN.rglob('*'))
required_paths = sorted({path.relative_to(ROOT).as_posix() for path in OWN.rglob('*') if path.is_file()})
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], cwd=ROOT,
                         input='\n'.join(required_paths) + '\n', text=True, capture_output=True)
assert ignored.returncode == 1 and not ignored.stdout, ignored.stdout
write(OWN / 'checks/final-genuine-D14-D2-source-schema-portability.actual.json', {
    'schemaVersion': 1, 'exitCode': 0, 'validatedOwnJsonCount': len(json_paths),
    'ordinaryCheckIgnoreExitCode': ignored.returncode, 'ignoredRequiredPaths': [],
    'activeInputsExact': plan['activeInputBindings'], 'allFiveEarlierAuthorSealsExact': True,
    'actualOriginalD14Pairs': 14, 'actualTargetedD2Pairs': 2,
    'currentP14AuthorOnly': True, 'activeWrites': [], 'humanApproval': False, 'strictGain': 0,
})
entry_path = OWN / 'neutral-genuine-D14-D2-and-final-P14.integration-ready.entry.json'
write(entry_path, {
    'schemaVersion': 1,
    'role': 'ordinary technical adoption-ready D14/D2 indices and final author P14 source; no new science or human review',
    'originalD14Index': bind(indices[0]), 'currentTargetedD2Index': bind(indices[1]),
    'resolutionSupersessions': plan['plannedResolutionSupersessions'],
    'futureExactCanonical': plan['futureExactCanonical'],
    'wholeCurrent394CandidateModel': plan['currentFullReviewedCandidateModel'],
    'futureP14AuthorBasis': plan['futureP14AuthorBasis'], 'futureP14Config': plan['futureP14Config'],
    'finalP14Bindings': plan['finalP14Bindings'], 'finalWhole29Cases': plan['finalWhole29Cases'],
    'activeInputBindings': plan['activeInputBindings'],
    'technicalChecks': [bind(path) for path in sorted((OWN / 'checks').glob('*.json'))],
    'requiredRemainingRootSteps': plan['requiredTrueGatesBeforeApply'],
    'rootOwns': plan['rootOwns'], 'historicalD14AndNativeFirstSealsUnchanged': True,
    'retainedTwelveNativeReviews': True, 'actualPApprovalMadeByThisTechnicalAgent': False,
    'actualNewScientificReviews': 0, 'actualHumanReviews': 0, 'activeWrites': [],
    'newScientificClosures': 0, 'restoredBindings': 0, 'netStrictGain': 0,
    'maximumConditionalNewStrictClosures': 14, 'predictionIsActualClosure': False,
    'firstFreezePath': seal_path.relative_to(ROOT).as_posix(),
})
files = [bind(path) for path in sorted(OWN.rglob('*')) if path.is_file() and path != seal_path]
write(seal_path, {
    'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'first immutable bounded ordinary technical integration preparation; no new scientific verdict',
    'entry': bind(entry_path), 'fileCount': len(files), 'files': files,
    'activeWrites': [], 'humanApproval': False, 'newScientificClosures': 0, 'strictGain': 0,
})
for binding in read(seal_path)['files']:
    verify(binding)
print(json.dumps({'entry': bind(entry_path), 'firstFreeze': bind(seal_path),
                  'originalD14': 14, 'currentD2': 2, 'strictGain': 0}))
