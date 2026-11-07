#!/usr/bin/env python3
"""Repeat the bounded transport probe with its explicitly frozen f83 reader.

This historical component replay does not imply approval of a later reader or
activate the normal V/Deep/M7 consumer. It creates only a small temporary repo.
"""
import argparse
import hashlib
import json
from pathlib import Path
import subprocess
import tempfile


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--accepted-commit', required=True)
    parser.add_argument('--accepted-census-sha256', required=True)
    parser.add_argument('--accepted-capsule-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    here = Path(__file__).resolve().parent
    root = here.parents[3]
    archive = here.with_name('visualization-context-diagram-b-qualification') / 'reviewed-code'
    pins = {'goalVisualizationReviewedContext.ts': 'f83be87fc6ef30723c5e53efbbc71cae9362048086844f55543aa016f85e469b',
            'qualification.schema.json': 'd6480e58bdb77833d14bcf7f0ecdf0b8035de4db01bfeb6be0c1f4cd01008be2'}
    for name, expected in pins.items():
        assert hashlib.sha256((archive / name).read_bytes()).hexdigest() == expected, name
    args.output.mkdir(parents=True, exist_ok=False)
    with tempfile.TemporaryDirectory(prefix='v-transport-replay-', dir='/dev/shm') as directory:
        scratch = Path(directory)
        mini = scratch / 'mini'
        command = ['python3', '-B', str(root / 'scripts/visualization_review_git_capsule.py'), 'materialize',
            '--repository-root', str(root), '--accepted-commit', args.accepted_commit,
            '--accepted-census-sha256', args.accepted_census_sha256, '--capsule', str(here / 'capsule'),
            '--accepted-capsule-sha256', args.accepted_capsule_sha256, '--output', str(mini)]
        materialized = subprocess.run(command, capture_output=True, text=True)
        (args.output / 'materialize.stdout.txt').write_text(materialized.stdout)
        (args.output / 'materialize.stderr.txt').write_text(materialized.stderr)
        assert materialized.returncode == 0, materialized.stderr
        command = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--tmpfs', '/tmp', '--proc', '/proc', '--dev', '/dev',
            '--ro-bind', str(scratch), str(scratch),
            '--ro-bind', str(archive / 'goalVisualizationReviewedContext.ts'), str(root / 'app/scripts/goalVisualizationReviewedContext.ts'),
            '--ro-bind', str(archive / 'qualification.schema.json'), str(root / 'contracts/goal-visualization-context/v1/qualification.schema.json'),
            '--chdir', str(root), '--', 'app/node_modules/.bin/tsx', str(here / 'native-probe.mts'), str(mini),
            args.accepted_commit, args.accepted_census_sha256]
        run = subprocess.run(command, capture_output=True, text=True)
        (args.output / 'native.stdout.json').write_text(run.stdout)
        (args.output / 'native.stderr.txt').write_text(run.stderr)
        assert run.returncode == 0, run.stderr
        result = json.loads(run.stdout)
        assert result['actualNativePositiveCases'] == 18 and result['shallow'] is True and result['nativeReaderSha256'] == pins['goalVisualizationReviewedContext.ts']
    command = ['python3', '-B', str(here / 'negative-probes.py'), '--capsule', str(here / 'capsule'),
        '--accepted-capsule-sha256', args.accepted_capsule_sha256, '--output', str(args.output / 'negative-probes.json')]
    run = subprocess.run(command, capture_output=True, text=True)
    (args.output / 'negative-probes.stdout.txt').write_text(run.stdout)
    (args.output / 'negative-probes.stderr.txt').write_text(run.stderr)
    assert run.returncode == 0, run.stderr
    summary = {'status': 'PASS-historical-f83-transport-component', 'nativeOriginalChains': 18, 'capsuleNegatives': 9,
        'frozenReader': pins['goalVisualizationReviewedContext.ts'], 'currentReaderApprovalClaimed': False,
        'sourceWritesPerformed': False, 'normalConsumerWired': False}
    (args.output / 'summary.json').write_text(json.dumps(summary, indent=2) + '\n')
    print(json.dumps(summary))


if __name__ == '__main__':
    main()
