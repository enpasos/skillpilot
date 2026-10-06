#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Relocate exact reviewed batches and serialize manually supplied synthesis.

Only the prepared-batch configuration route changes. Every reviewed bundle,
input, campaign, full page and completed reviewer result remains byte exact.
This is not an additional independent scientific review or active integration.
"""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import shutil

ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
BASE = OWN.parent
AUTHOR = BASE / 'biologie-ni-ten-current-native-author-candidate-v2'
A = BASE / 'biologie-ni-twenty-three-current-independent-d-a-v1'
B = BASE / 'biologie-ni-twenty-three-current-independent-d-b-v1'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def write(path, data):
    with path.open('x') as stream:
        stream.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def verify(namespace, filename, expected):
    path = namespace / filename
    assert sha(path) == expected
    for row in read(path)['files']:
        p = Path(row['path'])
        p = ROOT / p if p.parts[0] == 'curricula' else namespace / p
        assert p.stat().st_size == row['bytes'] and sha(p) == row['sha256']
    return {'path': str(path.relative_to(ROOT)), 'sha256': expected,
            'verifiedFiles': len(read(path)['files'])}

guards = [
    verify(AUTHOR, 'author-checkpoint.freeze.manifest.json',
           '174b280a3d02591d1e5125ed32624c525bef699fff188be1cb4d9f51c016646f'),
    verify(A, 'independent-description-review.final.freeze.json',
           'ead5f360e6bf337a379fa7818168dc4fcc097c0209ff16a987f44baae0a60fb7'),
    verify(B, 'independent-current-description-d-b.final.freeze.json',
           '46f7c53cc533452bea64fa475e3f53aedeebd089cbc839a9b1e60b4ccb507923'),
]
manual = read(OWN / 'manual-description-synthesis.input.json')['decisionsByGoalPrefix']
relocations = []
for scope, cfgname, oldbook in [
    ('d18', 'batch.config.json', 'native-eighteen-current49-all-images-finalbook'),
    ('d5', 'existing-five-bindings.batch.config.json',
     'native-existing-five-current49-bindings-finalbook'),
]:
    config = read(AUTHOR / cfgname)
    source = AUTHOR / oldbook
    dest = OWN / f'native-{scope}'
    assert not dest.exists()
    shutil.copytree(source, dest)
    config['outputDirectory'] = str(dest.relative_to(ROOT))
    configpath = OWN / f'{scope}.batch.config.json'
    write(configpath, config)
    # Persist the original manifest before the explicit routing-only relocation.
    shutil.copyfile(dest / 'batch-manifest.json', OWN / f'{scope}.original-batch-manifest.snapshot.json')
    manifest = read(dest / 'batch-manifest.json')
    before = json.loads(json.dumps(manifest))
    manifest['configPath'] = str(configpath.relative_to(ROOT))
    manifest['configDigest'] = 'sha256:' + sha(configpath)
    (dest / 'batch-manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + '\n')
    assert {k: v for k, v in manifest.items() if k not in ['configPath', 'configDigest']} == {
        k: v for k, v in before.items() if k not in ['configPath', 'configDigest']}
    exact = []
    for p in sorted(source.rglob('*')):
        if not p.is_file() or p.name == 'batch-manifest.json':
            continue
        target = dest / p.relative_to(source)
        assert sha(p) == sha(target)
        exact.append({'sourcePath': str(p.relative_to(ROOT)),
                      'copyPath': str(target.relative_to(ROOT)), 'sha256': sha(p)})
    rows = {}
    for label, reviewer, sub in [('first', A, scope), ('second', B, f'{scope}-results')]:
        records = list((reviewer / sub).glob('*.records.jsonl'))
        runs = list((reviewer / sub).glob('*.run.json'))
        assert len(records) == len(runs) == 1
        rounddir = dest / ('round-a' if label == 'first' else 'round-b') / 'results'
        assert not list(rounddir.rglob('*.jsonl'))
        batchid = read(rounddir.parent / 'description-review-campaign.json')['batches'][0]['batchId']
        for p in [records[0], runs[0]]:
            suffix = '.records.jsonl' if p == records[0] else '.run.json'
            target = rounddir / (batchid + suffix)
            shutil.copyfile(p, target)
            assert sha(p) == sha(target)
        rows[label] = [json.loads(line) for line in records[0].read_text().splitlines() if line.strip()]
        assert [r['goalId'] for r in rows[label]] == config['goalIds']
    decisions = []
    for first, second in zip(rows['first'], rows['second']):
        assert first['decision'] == second['decision'] == 'keep'
        for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'bundleFingerprint',
                    'bookDigest', 'currentTitleDe', 'currentTitleEn',
                    'currentDescriptionDe', 'currentDescriptionEn']:
            assert first[key] == second[key]
        de, en = manual[first['goalId'][:8]]
        decisions.append({'goalId': first['goalId'], 'resolutionDecision': 'keep_current',
                          'evidenceRound': 'second', 'rationaleDe': de, 'rationaleEn': en})
    write(dest / 'synthesis-authoring.json', {
        'schemaVersion': 1, 'manifestId': f'biologie-ni-{scope}-root-reviewed-synthesis-20261005-v1',
        'synthesizedBy': 'Codex Root synthesis after independent D-B freeze and complete D-A reading; no new scientific or human approval claim',
        'decisions': decisions,
    })
    relocations.append({'scope': scope, 'configPath': str(configpath.relative_to(ROOT)),
                        'configRouteBefore': before['configPath'],
                        'configRouteAfter': manifest['configPath'],
                        'onlyPreparedManifestFieldsChanged': ['configPath', 'configDigest'],
                        'wholeReviewedArtifactsVerifiedExact': exact,
                        'reviewerRecordCount': len(decisions),
                        'nativeValidationPending': True})
write(OWN / 'description-batch-routing-and-reviewed-inputs.actual.json', {
    'atUTC': datetime.now(timezone.utc).isoformat(), 'inputFreezeGuards': guards,
    'batches': relocations, 'manualSynthesisPath': str((OWN / 'manual-description-synthesis.input.json').relative_to(ROOT)),
    'sourceAndWholePageChanges': 0, 'newIndependentScientificReviews': 0,
    'nativeValidationPending': True, 'operativeStrictNetIncrease': 0,
    'humanApproval': False, 'humanTrial': False, 'activeWrites': 0,
})
print(json.dumps({'relocatedExactReviewedScopes': ['d18', 'd5'],
                  'manuallySynthesizedDecisions': 23, 'activeWrites': 0,
                  'nativeValidationPending': True}))
