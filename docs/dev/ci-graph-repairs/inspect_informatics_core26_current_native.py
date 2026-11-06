#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Replay the declared Git91 Informatics variants with native read-only validators.

Requires a checkout with the exact bound source, QA inputs and producer code.
Writes analysis artifacts exclusively below repository tmp/. Does not apply data.
"""
from pathlib import Path
import argparse, concurrent.futures, copy, hashlib, json, subprocess, tempfile
import sys
sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[3]
CONTEXT = ROOT / 'docs/dev/ci-graph-repairs/informatics-core26-current-math-analysis-context-2026-11-06.json'
REPORT = ROOT / 'docs/dev/ci-graph-repairs/informatics-core26-current-math-native-impact-2026-11-06.json'
CQR = ROOT / 'app/scripts/generateCurriculumQualityStatus.ts'
SUFFIX = b'\nexport { evaluateRouteProfile, routeProfiles }\n'


def sha(raw):
    return hashlib.sha256(raw).hexdigest()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--out', default='tmp/informatics-core26-current-math-replay')
    args = parser.parse_args()
    out = (ROOT / args.out).resolve()
    if not out.is_relative_to(ROOT / 'tmp'):
        parser.error('--out must be a private path below repository tmp/')
    context = json.loads(CONTEXT.read_text())
    report = json.loads(REPORT.read_text())
    original = (ROOT / context['source']['path']).read_bytes()
    source = ROOT / context['source']['path']
    bindings = context['catalogSources'] + [context['mathLedger']]
    bindings += report['execution']['originalQaAndMathLedgerBindings']['bindings']
    bindings += report['method']['capturedProductionCodeBindings']
    expected = {}
    for binding in bindings:
        path = binding['path']
        digest = report['method']['nativeRouteAdapter']['productionSha256'] if path == str(CQR.relative_to(ROOT)) else binding['sha256']
        if path in expected and expected[path] != digest:
            raise ValueError('Conflicting producer/input bindings: ' + path)
        expected[path] = digest
    for path, digest in expected.items():
        if sha((ROOT / path).read_bytes()) != digest:
            raise ValueError('Pinned checkout/input differs: ' + path)
    out.mkdir(parents=True, exist_ok=True)
    adapter = out / 'cqr-private-export-adapter.ts'
    adapter.write_bytes(CQR.read_bytes() + SUFFIX)
    if sha(adapter.read_bytes()) != report['method']['nativeRouteAdapter']['readOnlyAdapterSha256']:
        raise ValueError('Read-only route adapter differs')
    original_document = json.loads(original)
    for name, variant in context['variants'].items():
        candidate = copy.deepcopy(original_document)
        seen = set()
        for operation in variant['operations']:
            parts = operation['path'].split('/')
            if len(parts) != 4 or parts[:2] != ['', 'goals'] or parts[3] != 'requires' or operation['op'] != 'replace' or operation['file'] != context['source']['path']:
                raise ValueError('Only exact source requires pointers are accepted')
            goal = candidate['goals'][int(parts[2])]
            if goal['id'] != operation['guardGoalId'] or goal['id'] in seen or goal['requires'] != operation['guardRequiresBefore']:
                raise ValueError('Source goal/array guard differs')
            seen.add(goal['id'])
            goal['requires'] = operation['value']
        raw = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
        if sha(raw) != variant['hypotheticalSourceSha256']:
            raise ValueError('Candidate serialization differs: ' + name)
        (out / (name + '.source.json')).write_bytes(raw)
    commands = [
        ('scope', ['app/node_modules/.bin/tsx', 'docs/dev/ci-graph-repairs/inspect_informatics_core26_current_scope.ts']),
        ('atomicity', ['app/node_modules/.bin/tsx', 'app/scripts/semanticAtomicityReview.ts', '--config=curricula/DE/Gymnasium/quality/semantic-atomicity/canonical-informatics-full.config.json', '--mode=check']),
        ('memory', ['app/node_modules/.bin/tsx', 'app/scripts/memoryCardReview.ts', '--config=curricula/DE/Gymnasium/quality/memory-card-review/canonical-informatics-full.config.json', '--mode=check']),
    ]

    def run(name):
        rows = []
        with tempfile.TemporaryDirectory(prefix='private-validator-cache-', dir=out) as cache:
            prefix = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--bind', cache, '/tmp', '--setenv', 'TMPDIR', '/tmp', '--setenv', 'PYTHONDONTWRITEBYTECODE', '1', '--ro-bind', str(adapter), str(CQR), '--ro-bind', str(out / (name + '.source.json')), str(source), '--chdir', str(ROOT), '--']
            for check, command in commands:
                stdout_path = out / (name + '-' + check + ('.stdout.json' if check == 'scope' else '.stdout.log'))
                with stdout_path.open('wb') as stdout, (out / (name + '-' + check + '.stderr.log')).open('wb') as stderr:
                    code = subprocess.run(prefix + command + ([name] if check == 'scope' else []), stdout=stdout, stderr=stderr).returncode
                row = {'variant': name, 'check': check, 'exitCode': code}
                rows.append(row)
                print(json.dumps(row), flush=True)
                if code:
                    break
        for path, digest in expected.items():
            if sha((ROOT / path).read_bytes()) != digest:
                raise ValueError('Pinned input changed during analysis: ' + path)
        return rows

    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        rows = [row for result in pool.map(run, context['variants']) for row in result]
    (out / 'native-results-current.json').write_text(json.dumps({'dataApplied': False, 'commands': rows, 'productionInputHashesBeforeAndAfter': expected}, indent=2) + '\n')
    return 0 if len(rows) == 15 and all(row['exitCode'] == 0 for row in rows) else 1


if __name__ == '__main__':
    raise SystemExit(main())
