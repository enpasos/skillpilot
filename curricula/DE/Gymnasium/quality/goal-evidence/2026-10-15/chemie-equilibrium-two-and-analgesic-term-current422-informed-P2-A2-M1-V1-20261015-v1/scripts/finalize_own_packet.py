# SPDX-License-Identifier: Apache-2.0
"""Finite byte/parse inventory only; no repeated stock or scientific checks."""
from pathlib import Path
from datetime import datetime, timezone
import ast
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
SELECTOR = OWN / 'SELECTION.final-informed-P2-A2-and-rezeptfrei-M1-V1.json'
SEAL = OWN / 'FILES.finite-informed-P2-A2-M1-V1.seal.json'
assert not SELECTOR.exists() and not SEAL.exists()


def read(p):
    return json.loads(p.read_text())


def ref(p):
    b = p.read_bytes()
    return {'path': p.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}


def verify(r):
    assert ref(REPO / r['path']) == r, r['path']


def write(p, d):
    temporary = p.with_name(p.name + '.partial')
    temporary.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, p)
    assert read(p) == d


ctx = read(OWN / 'inputs/whole-three-contexts-two-profiles-six-cases.actual.json')
binding = read(OWN / 'BINDING.informed-P2-A2-M1-V1.actual.json')
firsts = {}
for role in ['P2', 'A2', 'M1', 'V1']:
    seal_path = OWN / f'science/FIRST.actual-informed-{role}.seal.json'
    s = read(seal_path)
    assert s['normalNewRecordsAtSeal'] == s['normalNewFingerprintsAtSeal'] == 0
    for r in s['files']:
        verify(r)
    assert datetime.fromisoformat(s['sealedAtUTC']) < datetime.fromisoformat(binding['boundAtUTC'])
    firsts[role] = ref(seal_path)
for key in ['neutralTermSelector', 'neutralNative9Selector', 'finalCanonical', 'finalSemantic', 'wholeCaseSource', 'wholeProfileSource',
            'wholeAnalgesicCaseSource', 'oldCanonical', 'M422Baseline', 'V438Baseline']:
    verify(ctx[key])
for key in ['P2Records', 'A2Records', 'M422Records', 'V1NormalQA', 'V1PhysicalTransportQA',
            'QA438Candidate', 'unchanged75Cards']:
    verify(binding[key])
profiles = {r['goalId']: r['profile'] for r in ctx['wholeProfiles2']}
P = [json.loads(l) for l in (REPO / binding['P2Records']['path']).read_text().splitlines()]
assert len(P) == 2
for r in P:
    assert r['profile'] == profiles[r['goalId']]
    assert r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
    assert r['reviewAuthority'] == 'ai_candidate' and r['status'] == 'needs_human_review'
A = [json.loads(l) for l in (REPO / binding['A2Records']['path']).read_text().splitlines()]
assert len(A) == 2 and all(r['status'] == 'atomic' and r['semanticAtomic'] is True for r in A)
old_M = (REPO / ctx['M422Baseline']['path']).read_text().splitlines(keepends=True)
new_M = (REPO / binding['M422Records']['path']).read_text().splitlines(keepends=True)
assert len(old_M) == len(new_M) == 422
assert sum(a == b for a, b in zip(old_M, new_M)) == 421
old_Q = read(REPO / ctx['V438Baseline']['path'])['records']
new_Q = read(REPO / binding['QA438Candidate']['path'])['records']
assert len(old_Q) == len(new_Q) == 438
assert sum(a == b for a, b in zip(old_Q, new_Q)) == 437
for row in ctx['wholeContexts']:
    verify(row['actualImage'])
verify(ctx['actualCurrentF71Page']['wholePageRaster'])
verify(ctx['actualCurrentF71Page']['actualPdfText'])
Vfirst = read(OWN / 'science/FIRST.actual-informed-V1.original.json')['decisions'][0]
for r in Vfirst['prior316And636ImagesActuallyReopened']:
    verify(r)

expected_commands = {
    'P2.stock-check': 1, 'P2.stock-check.after-id-correction': 0,
    'A2.stock-check': 0, 'V1.targeted-stock-helper': 0, 'M422.whole422-ten-views-check': 0,
    'P2.fingerprint-binding': 0, 'A2.stock-fingerprint-binding': 0, 'M1.stock-fingerprint-binding': 0,
}
commands = []
for name, code in expected_commands.items():
    p = OWN / f'checks/{name}.command.actual.json'
    r = read(p)
    assert r['exitCode'] == code
    commands.append({'name': name, 'receipt': ref(p), 'exitCode': code})
correction = read(OWN / 'checks/CAS.P2.technical-ID-only-correction.actual.json')
for r in correction['failedInputHistory']:
    verify(r['exactPreservedFailedInput'])
    assert r['originalDigest'] == r['exactPreservedFailedInput']['sha256']

map_path = OWN / 'checks/REBUILD.final.reference-host.physical-map.json'
mapping = read(map_path)
host = REPO / mapping['executionHost']
for row in mapping['sourceMap'] + mapping['imageAliases']:
    verify(row['physicalRepositorySource'])
    alias = host / row['normalHostAlias']
    assert alias.read_bytes() == (REPO / row['physicalRepositorySource']['path']).read_bytes()
for row in mapping['imageAliases']:
    alias = host / row['normalHostAlias']
    assert alias.is_symlink() and alias.resolve() == (REPO / row['physicalRepositorySource']['path']).resolve()
regular_host = [p for p in host.rglob('*') if p.is_file() and not p.is_symlink()]
assert len(regular_host) == mapping['regularFileCount']
assert sum(p.stat().st_size for p in regular_host) == mapping['regularBytes'] == 3661635
assert mapping['sourceImageCopies'] == 0
json_files, jsonl_files, python_files = [], [], []
for p in sorted(OWN.rglob('*')):
    assert not p.is_symlink(), p
    if not p.is_file():
        continue
    if p.suffix == '.json':
        read(p)
        json_files.append(str(p.relative_to(OWN)))
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            if line.strip():
                json.loads(line)
        jsonl_files.append(str(p.relative_to(OWN)))
    elif p.suffix == '.py':
        ast.parse(p.read_text(), filename=str(p))
        python_files.append(str(p.relative_to(OWN)))
audit_path = OWN / 'checks/FINITE.byte-json-jsonl-python-and-map.actual.json'
write(audit_path, {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'Local finite mechanical audit; no new normal or scientific check',
    'allFourFIRSTsExactAndBeforeBinding': True,
    'parsedJSONBeforeFinalMetadata': json_files, 'parsedJSONL': jsonl_files, 'parsedPythonAST': python_files,
    'finalMetadataAtomicallySerializedAndParsed': True,
    'profileBodies2Exact': True, 'other421MRawLinesExact': True,
    'cards75Exact': True, 'other437WholeQAObjectsExact': True,
    'actualStockCommands': commands,
    'P2CheckAttempts': 2, 'P2TechnicalFailuresPreserved': 1, 'P2SuccessfulChecks': 1,
    'A2CheckAttempts': 1, 'V1TargetedCheckAttempts': 1, 'M422CheckAttempts': 1,
    'hostRegularFiles': mapping['regularFileCount'], 'hostRegularBytes': mapping['regularBytes'],
    'imageAliases': len(mapping['imageAliases']), 'sourceImageCopies': 0, 'newRenders': 0,
    'fullSchemaOrCentralRuns': 0, 'activeWrites': 0,
})
write(SELECTOR, {
    'schemaVersion': 1, 'role': 'Finite informed P2/A2 and one-term f71 genuine M1/V1; inactive',
    'completedAtUTC': datetime.now(timezone.utc).isoformat(),
    'finalCanonical': ctx['finalCanonical'], 'finalSemanticSourceIdentities': ctx['finalSemantic'],
    'neutralTermSelector': ctx['neutralTermSelector'], 'neutralNative9Selector': ctx['neutralNative9Selector'],
    'actualWholeScientificInput': ref(OWN / 'inputs/whole-three-contexts-two-profiles-six-cases.actual.json'),
    'roleDisclosure': 'Original equilibrium16 material author; informed renewed review, not author of later four descriptions/B correction/rezeptfrei term. No blind independence claim.',
    'blindToOtherRuns': False, 'FIRSTSeals': firsts,
    'P2': {'goalIds': [r['goalId'] for r in P], 'records': binding['P2Records'],
           'config': ref(OWN / 'config/P2.current-image-bound.config.json'),
           'runManifest': ref(OWN / 'normal/P2.actual-informed.run.json'),
           'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'reviewAuthority': 'ai_candidate',
           'status': 'needs_human_review', 'wholeProfileBodiesExact': True,
           'reviewedResourceTypes': ['goal-visualization'], 'stockCheckAttempts': 2,
           'preservedTechnicalFailures': 1, 'finalStockExitCode': 0},
    'A2': {'goalIds': [r['goalId'] for r in A], 'records': binding['A2Records'],
           'config': ref(OWN / 'config/A2.current-text.config.json'),
           'atomic': 2, 'stockCheckAttempts': 1, 'stockExitCode': 0},
    'M1': {'goalId': 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528',
           'status': 'no_memory_needed', 'memoryUseful': False,
           'whole422Records': binding['M422Records'],
           'whole422TenViewsConfig': ref(OWN / 'config/M422.whole-ten-scopes.rezeptfrei-M1.config.json'),
           'originalBaseline': ctx['M422Baseline'], 'other421OriginalRawLinesExact': True,
           'all75CardsExact': binding['unchanged75Cards'], 'newCards': 0,
           'stockWhole422TenViewsCheckAttempts': 1, 'stockExitCode': 0},
    'V1': {'goalId': 'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528', 'accepted': 1,
           'scope': 'Actual one-term current-context addendum to identical PNG, not new changed pixels',
           'normalQA1': binding['V1NormalQA'], 'physicalTransportQA1': binding['V1PhysicalTransportQA'],
           'physicalTransportAddsVotes': 0, 'wholeQA438Candidate': binding['QA438Candidate'],
           'originalBaseline': ctx['V438Baseline'], 'other437WholeObjectsExact': True,
           'old316636EvidenceWordingDeclaredHistorical': True,
           'stockTargetedCheckAttempts': 1, 'stockExitCode': 0, 'newRenders': 0},
    'normalBinding': ref(OWN / 'BINDING.informed-P2-A2-M1-V1.actual.json'),
    'roleCheckSummary': ref(OWN / 'checks/FINAL.actual-role-checks-and-preservation.json'),
    'technicalIdentifierCorrection': ref(OWN / 'checks/CAS.P2.technical-ID-only-correction.actual.json'),
    'physicalExactRebuildMap': ref(map_path),
    'portableBuildOnlyHelper': ref(OWN / 'scripts/rebuild_reference_host.py'),
    'finiteAudit': ref(audit_path), 'readme': ref(OWN / 'README.md'),
    'e0And1aDSourceCourseHoldsRemainOpen': True, 'newDOrSourceCourseGrants': 0,
    'HumanApproval': False, 'HumanTrial': False, 'M7Grant': False,
    'CentralRuns': 0, 'fullSchemaRuns': 0, 'sourceImageCopies': 0, 'activeWrites': 0,
    'finalSealPath': str(SEAL.relative_to(REPO)), 'STOPAfterSeal': True,
})
files = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != SEAL]
write(SEAL, {
    'schemaVersion': 1, 'role': 'Finite informed P2/A2/M1/V1 package, actual histories and role boundaries retained',
    'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'selector': ref(SELECTOR), 'files': files,
    'regularPayloadFileCount': len(files), 'regularPayloadBytes': sum(r['bytes'] for r in files),
    'sealExcludedFromOwnInventory': True, 'finite': True, 'activeWrites': 0, 'humanApproval': False,
})
for r in files:
    verify(r)
assert len([p for p in OWN.rglob('*') if p.is_file()]) == len(files) + 1
print(json.dumps({'selector': ref(SELECTOR), 'seal': ref(SEAL),
                  'payloadFiles': len(files), 'payloadBytes': sum(r['bytes'] for r in files),
                  'allRegularFilesIncludingSeal': len(files) + 1,
                  'P2CheckAttempts': 2, 'A2V1M422CheckAttemptsEach': 1,
                  'hostRegularBytes': mapping['regularBytes'], 'STOP': True}, indent=2))
