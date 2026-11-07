#!/usr/bin/env python3
"""Finite capsule counterexamples, confined to tiny private transport copies."""
import argparse
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import zlib


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--capsule', type=Path, required=True)
    parser.add_argument('--accepted-capsule-sha256', required=True)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[4]
    capsule = args.capsule.resolve(strict=True)
    original = (capsule / 'capsule.json').read_bytes()
    assert hashlib.sha256(original).hexdigest() == args.accepted_capsule_sha256
    body = json.loads(original)
    cases = []
    with tempfile.TemporaryDirectory(prefix='v-capsule-negative-', dir='/dev/shm') as directory:
        scratch = Path(directory)
        for case in ('external-hash', 'external-anchor', 'unknown-field', 'runtime-claim', 'missing-original-ref',
                     'duplicate-object', 'changed-object-bytes', 'extra-valid-object', 'false-shallow-boundary'):
            folder = scratch / (case + '-capsule')
            shutil.copytree(capsule, folder)
            modified = json.loads(original)
            expected = {
                'external-hash': 'External capsule digest differs', 'external-anchor': 'External capsule authority differs',
                'unknown-field': 'Unknown or missing capsule field', 'runtime-claim': 'cannot claim a review',
                'missing-original-ref': 'Independent input/receipt inventory differs', 'duplicate-object': 'Duplicate capsule objects',
                'changed-object-bytes': 'Capsule object SHA/type/length differs',
                'extra-valid-object': 'outside exact commit/path closure', 'false-shallow-boundary': 'Original reference commit is not in authenticated parent graph',
            }[case]
            if case == 'unknown-field': modified['selfApproved'] = True
            if case == 'runtime-claim': modified['runtimeActivationAllowed'] = True
            if case == 'missing-original-ref': modified['originalReferences'].pop()
            if case == 'duplicate-object': modified['objects'].append(dict(modified['objects'][0]))
            if case == 'changed-object-bytes':
                entry = next(row for row in modified['objects'] if row['storage'] == 'embedded')
                path = folder / entry['path']
                raw = zlib.decompress(path.read_bytes())
                path.write_bytes(zlib.compress(raw[:-1] + bytes([raw[-1] ^ 1])))
            if case == 'extra-valid-object':
                payload = b'an unrelated, valid blob is outside the declared transport scope'
                framed = b'blob ' + str(len(payload)).encode() + b'\0' + payload
                object_id = hashlib.sha1(framed).hexdigest()
                path = 'objects/' + object_id[:2] + '/' + object_id[2:]
                (folder / path).parent.mkdir(exist_ok=True)
                (folder / path).write_bytes(zlib.compress(framed))
                modified['objects'].append({'oid': object_id, 'type': 'blob', 'bytes': len(payload),
                    'sha256': hashlib.sha256(payload).hexdigest(), 'storage': 'embedded', 'path': path})
            if case == 'false-shallow-boundary': modified['shallowBoundaries'] = [body['acceptedRepositoryCommit']]
            raw = (json.dumps(modified, indent=2) + '\n').encode()
            (folder / 'capsule.json').write_bytes(raw)
            accepted = '0' * 64 if case == 'external-hash' else hashlib.sha256(raw).hexdigest()
            anchor = '0' * 40 if case == 'external-anchor' else body['acceptedRepositoryCommit']
            command = ['python3', '-B', str(root / 'scripts/visualization_review_git_capsule.py'), 'materialize',
                '--repository-root', str(root), '--accepted-commit', anchor, '--accepted-census-sha256', body['censusSha256'],
                '--capsule', str(folder), '--accepted-capsule-sha256', accepted, '--output', str(scratch / (case + '-mini'))]
            run = subprocess.run(command, capture_output=True, text=True)
            assert run.returncode != 0 and expected in run.stderr, (case, run.returncode, run.stderr)
            cases.append({'case': case, 'exitCode': run.returncode, 'expectedFailure': expected,
                          'actualLastError': run.stderr.strip().splitlines()[-1]})
    result = {'status': 'PASS', 'negativeCases': cases, 'sourceWritesPerformed': False, 'fullProducerExecuted': False,
              'boundary': 'Mutated private capsule manifests may receive a new synthetic test pin to exercise internal validation; none is proposed as an accepted real transport or review.'}
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({'status': 'PASS', 'negativeCases': len(cases)}))


if __name__ == '__main__':
    main()
