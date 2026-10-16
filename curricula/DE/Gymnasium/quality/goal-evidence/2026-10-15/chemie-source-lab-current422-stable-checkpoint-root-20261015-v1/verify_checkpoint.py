# SPDX-License-Identifier: Apache-2.0
"""Verify the finite checkpoint and production schema boundary; no science votes."""
from pathlib import Path
import ast
import hashlib
import importlib.util
import json
import os
import sys

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    checkpoint = json.loads((OWN/'FINAL.finite-current422-checkpoint.json').read_text())
    spec = importlib.util.spec_from_file_location('production_schema', ROOT/'scripts/validate_schemas.py')
    production = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(production)
    schema = json.loads((ROOT/'docs/landscape-runtime.schema.json').read_text())
    counts = {'packages':0, 'payloadFiles':0, 'JSON':0, 'JSONLrows':0, 'PythonAST':0, 'symlinks':0}
    for package in checkpoint['packages']:
        seal_path = ROOT/package['sealPath']
        assert digest(seal_path) == package['sealSHA256'], seal_path
        assert seal_path.stat().st_size == package['sealBytes'], seal_path
        seal = json.loads(seal_path.read_text())
        rows = seal['files']
        assert len(rows) == package['listedPayloadFiles'], seal_path
        def payload_path(row):
            path = Path(row['path'])
            assert not path.is_absolute(), path
            return ROOT/path if path.is_relative_to(Path(package['path'])) else ROOT/package['path']/path
        expected = {payload_path(row) for row in rows} | {seal_path}
        actual = {p for p in (ROOT/package['path']).rglob('*') if p.is_file() or p.is_symlink()}
        assert expected == actual, (package['path'], sorted(map(str, expected ^ actual)))
        counts['packages'] += 1
        for row in rows:
            path = payload_path(row)
            assert path.is_file() and path.resolve().is_relative_to(ROOT), path
            assert digest(path) == row.get('sha256', row.get('resolvedSha256')), path
            assert path.stat().st_size == row.get('bytes', row.get('resolvedBytes')), path
            if path.is_symlink():
                counts['symlinks'] += 1
                target = os.readlink(path)
                assert not os.path.isabs(target), path
                if 'symlinkTarget' in row:
                    assert target == row['symlinkTarget'], path
                if 'target' in row:
                    assert target == row['target'], path
                if 'linkTextSha256' in row:
                    assert 'sha256:' + hashlib.sha256(os.fsencode(target)).hexdigest() == row['linkTextSha256'], path
                if 'resolvedRepositoryPath' in row:
                    assert str(path.resolve().relative_to(ROOT)) == row['resolvedRepositoryPath'], path
            counts['payloadFiles'] += 1
            if path.suffix == '.json':
                assert production.validate_file(str(path), schema), path
                counts['JSON'] += 1
            elif path.suffix == '.jsonl':
                text = path.read_text()
                assert not text or text.endswith('\n'), path
                for line in text.splitlines():
                    if line.strip():
                        json.loads(line)
                        counts['JSONLrows'] += 1
            elif path.suffix == '.py':
                ast.parse(path.read_text(), filename=str(path))
                counts['PythonAST'] += 1
    for path in OWN.rglob('*'):
        if path.is_file() and path.suffix == '.json':
            assert production.validate_file(str(path), schema), path
    errors = production.curriculum_symlink_errors(ROOT)
    assert not errors, errors
    print(json.dumps({**counts, 'allFiniteBytesExact':True,
                      'actualRepositorySymlinkErrors':errors,
                      'productionSchemaBoundaryPassed':True,
                      'strict':checkpoint['currentStrict'],
                      'denominator':checkpoint['currentDenominator'],
                      'newScientificClosures':4,
                      'restoredExistingContextBindings':8,
                      'additionalStrictClosuresFromRestoredBindings':0,
                      'activeIntegration':False, 'humanApproval':False,
                      'humanTrial':False}, indent=2))


if __name__ == '__main__':
    main()
