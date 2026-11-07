#!/usr/bin/env python3
"""Small read-only replay of both real CQR104 regressions and their correction."""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    repo = here.parents[3]
    pins = json.loads((here / 'replay-bindings.json').read_text())
    for row in pins['inputs']:
        raw = (repo / row['path']).read_bytes()
        if hashlib.sha256(raw).hexdigest() != row['sha256']:
            raise ValueError('Replay input differs: ' + row['path'])
    args.output.mkdir(parents=True, exist_ok=False)
    results = []
    for stage, snapshot in [('before', 'focused-before-generator.ts'), ('country-only', 'focused-country-only-generator.ts'), ('final', 'final-generator.ts')]:
        with tempfile.TemporaryDirectory(prefix='cqr104-focused-replay-', dir='/dev/shm') as directory:
            command = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev',
                       '--bind', directory, '/tmp', '--chdir', str(repo / 'app'),
                       '--ro-bind', str(here / snapshot), str(repo / 'app/scripts/generateCurriculumQualityStatus.ts'),
                       '--ro-bind', str(here / 'testCurriculumRouteEndpointScope.ts'), str(repo / 'app/scripts/testCurriculumRouteEndpointScope.ts'),
                       '--', './node_modules/.bin/tsx', 'scripts/testCurriculumRouteEndpointScope.ts']
            run = subprocess.run(command, capture_output=True, text=True)
        (args.output / (stage + '.stdout.txt')).write_text(run.stdout)
        (args.output / (stage + '.stderr.txt')).write_text(run.stderr)
        if stage == 'before':
            assert run.returncode == 1 and '2 !== 4' in run.stderr, run.stderr
        elif stage == 'country-only':
            assert run.returncode == 1 and 'Missing terminal autonomy goal(s)' in run.stderr, run.stderr
            assert 'da96fcb4-f601-5f66-9fec-12b5adc7f7f0' in run.stderr and '63509366-f5b2-58e5-9976-47df6f8c37e1' in run.stderr
        else:
            assert run.returncode == 0 and 'CQR104 native country/course controls pass' in run.stdout, run.stderr
        results.append({'stage': stage, 'exitCode': run.returncode})
    summary = {'status': 'PASS', 'results': results, 'sourceWritesPerformed': False,
               'newSourceOrExamApprovalClaimed': False, 'fullProducerExecuted': False}
    (args.output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps(summary, indent=2))


if __name__ == '__main__':
    main()
