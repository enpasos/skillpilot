#!/usr/bin/env python3
"""Check bound historical CQR104 evidence; never run a producer or write data."""
import argparse
import gzip
import hashlib
import json
from pathlib import Path


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check-current-inputs', action='store_true', help='Require the exact tested live source, view and code context too.')
    args = parser.parse_args()
    repo = Path(__file__).resolve().parents[3]
    receipt = json.loads(Path(__file__).with_name('cqr104-informatics-route-scope-repair-2026-11-06.json').read_text())
    rows = list(receipt['boundEvidence'])
    if args.check_current_inputs:
        rows += receipt['codeBindings'] + receipt['testedCanonicalCatalogPins'] + receipt['testedInfoViewPins']
    for row in rows:
        path = Path(row['path'])
        assert not path.is_absolute() and '..' not in path.parts, 'Unsafe evidence locator'
        raw = (repo / path).read_bytes()
        assert hashlib.sha256(raw).hexdigest() == row['sha256'], 'Evidence bytes differ: ' + str(path)
    folder = repo / 'qa-artifacts/ci-contract-audit/2026-11-06/cqr104-route-endpoint-scope-repair'
    read = lambda name: json.loads(gzip.decompress((folder / name).read_bytes()))
    before, after, census = (read(name) for name in ('before-native.json.gz', 'after-native.json.gz', 'actual48-projections.json.gz'))
    assert before['sources'] == after['sources']
    owner_profile = 'canonical-informatics-crossstage'
    old = {row['profileId']: row['scope'] for row in before['scopes']}
    new = {row['profileId']: row['scope'] for row in after['scopes']}
    assert set(old) == set(new) and len(old) == 12
    assert all(old[key] == new[key] for key in old if key != owner_profile)
    assert [rule for rule in old[owner_profile]['rules'] if rule['id'] != 'CQR-104'] == [rule for rule in new[owner_profile]['rules'] if rule['id'] != 'CQR-104']
    previous = next(rule for rule in old[owner_profile]['rules'] if rule['id'] == 'CQR-104')
    current = next(rule for rule in new[owner_profile]['rules'] if rule['id'] == 'CQR-104')
    assert previous['status'] == 'pass' and previous['metrics']['evaluatedProjectionScopes'] == 18
    assert current['status'] == 'fail' and current['metrics']['evaluatedProjectionScopes'] == 48
    assert current['metrics']['projectionScopesWithoutExpectedTerminalAutonomyGoals'] == 42
    assert (census['projectionCount'], census['emptyProjectionCount'], census['passCount']) == (48, 42, 6)
    assert len({(row['viewId'], row['jurisdiction']) for row in census['rows']}) == 48
    assert all(row['metrics']['projectionScopesMissingTerminalAutonomyGoals'] == 0
               and row['metrics']['projectionScopesWithUnexpectedTerminalAutonomyGoals'] == 0 for row in census['rows'])
    assert sum(row['status'] == 'fail' for row in census['rows']) == 42
    types = json.loads((folder / 'typecheck-comparison.json').read_text())
    assert types['baselineErrorCount'] == types['currentErrorCount'] == 48 and types['newErrors'] == types['removedErrors'] == []
    replay = json.loads((folder / 'actual-frozen-focused-replay/summary.json').read_text())
    assert replay['status'] == 'PASS' and [row['exitCode'] for row in replay['results']] == [1, 1, 0]
    log = (folder / 'deep-regression.txt').read_text()
    assert 'CQR104 native country/course controls pass:' in log
    assert 'Math=807/Physics=478/Biology=397/Chemistry=455/Economics=346' in log
    print(json.dumps({'status': 'PASS-bound-historical-evidence', 'currentInputsChecked': args.check_current_inputs,
                      'sourceWritesPerformed': False, 'fullProducerExecuted': False, 'maturityApprovalClaimed': False}))


if __name__ == '__main__':
    main()
