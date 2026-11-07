#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Create private receipt candidates and run the unchanged native receipt kernel."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import subprocess
import time
from datetime import datetime, timezone

R = Path(__file__).resolve().parents[4]
P = Path(__file__).resolve().parent
REL = P.relative_to(R).as_posix()
A = R / 'qa-artifacts/ci-contract-audit/2026-11-07/biology-sealed56-reuse-analysis-private/analysis.json'
W = Path('/mnt/e/skillpilot-qa-artifacts/2026-11-07/biology56-reader-capsule-20261107')


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        stream.write(data)
        stream.flush()
        os.fsync(stream.fileno())


def js(path, value):
    write(path, (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode())


def frame_command(script):
    return ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev-bind', '/dev', '/dev',
        '--bind', str(P), str(P), '--bind', str(W), str(W), '--setenv', 'TMPDIR', str(W / 'tmp'),
        '--ro-bind', str(W / 'lib'), str(R / 'app/scripts/lib'),
        '--ro-bind', str(P / 'candidate/app/scripts/goalVisualizationReviewedContext.ts'), str(R / 'app/scripts/goalVisualizationReviewedContext.ts'),
        '--ro-bind', str(P / 'candidate/contracts/goal-visualization-context/v1/qualification.schema.json'), str(R / 'contracts/goal-visualization-context/v1/qualification.schema.json'),
        '--chdir', str(R), '--', str(R / 'app/node_modules/.bin/tsx'), str(P / script)]


def main():
    assert sha(A.read_bytes()) == '5f82b853115721cfd8beeae6f289c5be257b9a8718a5766a1308b148c4a43545'
    analysis = json.loads(A.read_bytes())
    W.mkdir(parents=True, exist_ok=False)
    (W / 'tmp').mkdir()
    shutil.copytree(R / 'app/scripts/lib', W / 'lib')
    shutil.copy2(P / 'candidate/app/scripts/lib/goalVisualizationBiology56Contexts.ts', W / 'lib/goalVisualizationBiology56Contexts.ts')
    source = json.loads((R / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json').read_bytes())
    goals = {g['id']: g for g in source['goals']}
    candidates = []
    qualified_at = datetime.now(timezone.utc).isoformat()
    for family in analysis['families']:
        review = json.loads((R / family['review']['path']).read_bytes())
        for key in family['goalIds']:
            matches = [row for row in review['records'] if row['goalId'] == key]
            assert len(matches) == 1
            original, goal = matches[0], goals[key]
            asset = original['actualObservedFullRaster']
            ref = lambda value: {'path': value['path'], 'sha256': value['sha256'], 'gitCommit': family['review']['gitCommit']}
            retained = original.get('fullRasterReviewBasis', '').startswith('retained')
            qualification = {
                'schemaVersion': 1, 'kind': 'visualization-reviewed-context-qualification',
                'normalization': 'skillpilot-visualization-display-whitespace-v1', 'reviewProfile': 'biology-sealed-native-three-families-v1',
                'context': {'landscapeId': source['landscapeId'], 'goalId': key, 'subject': 'biologie',
                    'title': goal['title'], 'description': goal['description'], 'titleEn': goal['titleEn'], 'descriptionEn': goal['descriptionEn'],
                    'demandLevel': goal['dimensionTags']['demandLevel'], 'assetSha256': 'sha256:' + asset['sha256']},
                'originalReview': ref(family['review']), 'originalInput': ref(family['reviewSeal']),
                'ownerSource': {'path': 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json',
                    'sha256': '9b3ef170c367b0cd9936804c9b0bb696d0b4f2465d8688f9f707abf962de7b79', 'gitCommit': family['review']['gitCommit']},
                'reviewedAsset': ref(asset), 'originalDecision': original['machineCandidateDecision'],
                'reviewedAt': review['recordedAt'], 'reviewer': review['actualAgent'], 'originalReason': original['substantiveActualObservationsDe'],
                'qualification': {'qualifiedAt': qualified_at, 'qualifier': 'Codex /root/math58_active_integration; private technical qualification candidate',
                    'reason': 'Technical current-context continuity of the exact independently reviewed original; no new image sighting, human/device acceptance, or current whole-page approval.'
                        + (' Original full raster KEEP retained from 2026-10-07T21:47:05.935778+00:00; actual later Chromium360/680 and native-page decision at 2026-10-07T22:22:46.889600+00:00, with the earlier mobile/native pending boundary preserved.' if retained else '')}}
            path = P / 'qualifications' / (key + '.qualification.json')
            js(path, qualification)
            candidates.append({'landscapeId': source['landscapeId'], 'goalId': key,
                'receipt': {'path': path.relative_to(R).as_posix(), 'sha256': sha(path.read_bytes())}})
    assert len(candidates) == len({row['goalId'] for row in candidates}) == 56
    js(P / 'candidate-rows.json', candidates)
    js(P / 'workspace.json', {'path': str(W), 'source15Included': False,
        'nativeCodeFrame': frame_command('qualify_biology56_and_regress132.mts')})
    cmd = frame_command('qualify_biology56_and_regress132.mts')
    started = datetime.now(timezone.utc).isoformat()
    begin = time.monotonic()
    result = subprocess.run(cmd, capture_output=True)
    write(P / 'qualification.stdout', result.stdout)
    write(P / 'qualification.stderr', result.stderr)
    js(P / 'qualification.execution.json', {'argv': cmd, 'exitCode': result.returncode, 'startedAtActualUTC': started,
        'finishedAtActualUTC': datetime.now(timezone.utc).isoformat(), 'elapsedSeconds': time.monotonic() - begin,
        'combinedProducerRuns': 0, 'fullCqrRuns': 0, 'originalSealsOrBytesMutated': False})
    print(result.returncode, result.stdout.decode()[-4000:], result.stderr.decode()[-7000:], flush=True)
    assert result.returncode == 0


if __name__ == '__main__':
    main()
