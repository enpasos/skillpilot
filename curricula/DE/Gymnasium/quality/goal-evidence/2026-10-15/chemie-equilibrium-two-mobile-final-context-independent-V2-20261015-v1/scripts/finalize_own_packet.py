# SPDX-License-Identifier: Apache-2.0
"""Finite local metadata audit only; does not rerun stock checks or review."""
from pathlib import Path
from datetime import datetime, timezone
import ast
import hashlib
import json
import os

repo = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
own = Path(__file__).resolve().parents[1]
selector_path = own / 'SELECTION.final-two-mobile-PNG-independent-normal-V2.json'
seal_path = own / 'FILES.finite-two-mobile-PNG-independent-V2.seal.json'
assert not selector_path.exists() and not seal_path.exists()


def read(path):
    return json.loads(path.read_text())


def ref(path):
    payload = path.read_bytes()
    return {'path': str(path.relative_to(repo)),
            'sha256': 'sha256:' + hashlib.sha256(payload).hexdigest(),
            'bytes': len(payload)}


def verify(item):
    assert ref(repo / item['path']) == item, item['path']


def write(path, value):
    temporary = path.with_suffix('.partial')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)
    assert read(path) == value


first_seal_path = own / 'FIRST.actual-two-mobile-PNG-V-decisions.seal.json'
first_seal = read(first_seal_path)
assert ref(first_seal_path)['sha256'] == 'sha256:66067e42672c4480193558a291316a26b6718f9b9ac621f89e55ec8e1e91dd6b'
for item in first_seal['files']:
    verify(item)
assert first_seal['normalVBindingsAtSeal'] == 0
assert first_seal['accepted'] == 2 and first_seal['revise'] == 0
binding_path = own / 'BINDING.exact-two-final-DEEN-ALT-PNG.normal-V2.actual.json'
binding = read(binding_path)
for key in ['FIRSTSeal', 'neutralScientificInput', 'authorSeal', 'finalCanonical',
            'finalSemanticSourceOnly', 'namedPrior438Baseline', 'normalQA2',
            'physicalTransportQA2', 'whole438Candidate']:
    verify(binding[key])
assert binding['FIRSTSeal'] == ref(first_seal_path)
assert datetime.fromisoformat(first_seal['sealedAtUTC']) < datetime.fromisoformat(binding['boundAtUTC'])
assert binding['uniqueScientificVotes'] == 2 and binding['other436WholeRowsExact']

receipt_path = own / 'browser/RECEIPT.actual-own-Chromium-responsive-rendering.json'
receipt = read(receipt_path)
assert len(receipt['records']) == 8
for row in receipt['records']:
    verify(row['screenshot'])
    verify(row['fixture'])
    assert row['pageErrors'] == [] and row['metrics']['complete']
    assert row['metrics']['naturalWidth'] == 1672 and row['metrics']['naturalHeight'] == 941
assert sorted({row['metrics']['elementWidth'] for row in receipt['records']}) == [316, 360, 636, 680]
command_path = own / 'checks/V2.stock-targeted-helper.command.actual.json'
command = read(command_path)
assert command['exitCode'] == 0 and command['targetedHelperSuccessfulRuns'] == 1
assert not command['fullCentralExecuted'] and not command['wholeQAGeneratorExecuted']

map_path = own / 'checks/REBUILD.two-PNG-V2.final-minimal-host.json'
mapping = read(map_path)
host = repo / mapping['executionHost']
for row in mapping['sourceMap'] + mapping['imageAliases']:
    verify(row['physicalRepositorySource'])
    host_path = host / row['normalHostAlias']
    assert host_path.read_bytes() == (repo / row['physicalRepositorySource']['path']).read_bytes()
for row in mapping['imageAliases']:
    host_path = host / row['normalHostAlias']
    assert host_path.is_symlink()
    assert host_path.resolve() == (repo / row['physicalRepositorySource']['path']).resolve()
assert (host / 'app/node_modules').resolve() == (repo / 'app/node_modules').resolve()
regular_host = [p for p in host.rglob('*') if p.is_file() and not p.is_symlink()]
assert len(regular_host) == len(mapping['sourceMap']) == 35
assert sum(p.stat().st_size for p in regular_host) == mapping['physicalRegularBytes'] == 2893238
assert mapping['sourcePNGPhysicalCopies'] == 0

json_files, jsonl_files, python_files = [], [], []
for path in sorted(own.rglob('*')):
    assert not path.is_symlink(), path
    if not path.is_file():
        continue
    if path.suffix == '.json':
        read(path)
        json_files.append(str(path.relative_to(own)))
    elif path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
        jsonl_files.append(str(path.relative_to(own)))
    elif path.suffix == '.py':
        ast.parse(path.read_text(), filename=str(path))
        python_files.append(str(path.relative_to(own)))

audit_path = own / 'checks/FINITE.role-local-byte-json-python-and-host-map.actual.json'
write(audit_path, {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'Finite role-local metadata and physical-map audit; no new review or normal execution',
    'FIRSTBeforeNormalBinding': True,
    'originalFIRSTSeal': ref(first_seal_path),
    'actualTargetedHelperCommand': ref(command_path),
    'successfulTargetedHelperRuns': 1,
    'nativePNGReviews': 2, 'actualResponsiveScreenshotsVerified': 8,
    'imageWidths': [316, 360, 636, 680],
    'JSONParsedBeforeFinalMetadata': json_files,
    'JSONLParsed': jsonl_files, 'PythonASTParsed': python_files,
    'ownDirectorySymlinks': 0, 'hostRegularFiles': 35,
    'hostRegularBytes': 2893238, 'hostImageAliases': 4,
    'physicalSourcePNGcopies': 0, 'newNormalRunsInThisAudit': 0,
    'fullSchemaOrCentralRuns': 0, 'activeWrites': 0,
    'finalMetadataAtomicallySerializedAndParsed': True,
})
write(selector_path, {
    'schemaVersion': 1,
    'role': 'Finite independent informed actual two-mobile-PNG successor V2; inactive',
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'goalIds': ['e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd', '16f0dc69-6da8-5751-a00e-abbc1c882dbc'],
    'accepted': 2, 'revise': 0, 'uniqueNewScientificVotes': 2,
    'actualWholeCompetenciesRead': 2, 'actualWholeBilingualCasesRead': 4,
    'nativePNGsActuallySeen': 2, 'responsiveScreenshotsActuallySeen': 8,
    'scientificFIRST': first_seal['files'][0], 'FIRSTSeal': ref(first_seal_path),
    'neutralScientificInput': binding['neutralScientificInput'],
    'authorSeal': binding['authorSeal'],
    'finalCanonical': binding['finalCanonical'],
    'finalSemanticSourceOnly': binding['finalSemanticSourceOnly'],
    'normalQA2': binding['normalQA2'],
    'physicalTransportQA2': binding['physicalTransportQA2'],
    'physicalTransportAddsScientificVotes': 0,
    'whole438Candidate': binding['whole438Candidate'],
    'namedPrior438Baseline': binding['namedPrior438Baseline'],
    'baselineComposition': ref(own / 'inputs/BASELINE.exact-source-composition-and-preserved-originals.json'),
    'other436WholeRowsExact': True,
    'Carbonyl2And1a0cWholeRowsExact': True,
    'oldM4V4OriginalFIRSTAndNegativeVotesPreserved': True,
    'binding': ref(binding_path),
    'browserReceipt': ref(receipt_path),
    'targetedStockHelper': ref(command_path),
    'targetedStockHelperExitCode': 0, 'successfulTargetedHelperRuns': 1,
    'physicalExactRebuildMap': ref(map_path),
    'portableBuildOnlyHelper': ref(own / 'scripts/rebuild_minimal_host.py'),
    'roleLocalFiniteAudit': ref(audit_path),
    'readme': ref(own / 'README.md'),
    'sourceCourseDissentResolved': False, 'newDPAMVotes': 0,
    'humanApprovalOrTrialClaim': False, 'M7Grant': False,
    'fullSchemaOrCentralExecuted': False, 'activeWrites': 0,
    'finalSealPath': str(seal_path.relative_to(repo)), 'stopAfterSeal': True,
})
files = [ref(p) for p in sorted(own.rglob('*')) if p.is_file() and p != seal_path]
write(seal_path, {
    'schemaVersion': 1,
    'role': 'Finite independent informed two-PNG V2 package; original negative reviews preserved',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
    'selector': ref(selector_path), 'files': files,
    'regularPayloadFileCount': len(files), 'regularPayloadBytes': sum(p['bytes'] for p in files),
    'sealExcludedFromOwnInventory': True, 'finite': True,
    'uniqueScientificVotes': 2, 'newHumanApproval': False, 'activeWrites': 0,
})
for item in files:
    verify(item)
actual_files = [p for p in own.rglob('*') if p.is_file()]
assert len(actual_files) == len(files) + 1
print(json.dumps({'selector': ref(selector_path), 'seal': ref(seal_path),
                  'payloadFiles': len(files), 'payloadBytes': sum(p['bytes'] for p in files),
                  'allRegularFilesIncludingSeal': len(actual_files),
                  'normalQA2': binding['normalQA2'], 'wholeQA438': binding['whole438Candidate'],
                  'accepted': 2, 'other436Exact': True, 'STOP': True}, indent=2))
