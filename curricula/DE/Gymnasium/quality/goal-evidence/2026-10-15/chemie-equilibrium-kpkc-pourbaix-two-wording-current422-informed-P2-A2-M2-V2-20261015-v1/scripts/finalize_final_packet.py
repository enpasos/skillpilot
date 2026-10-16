# SPDX-License-Identifier: Apache-2.0
"""Finite local inventory and metadata audit only; no repeated normal checks."""
from pathlib import Path
from datetime import datetime, timezone
import ast
import hashlib
import json
import os

REPO = next(p for p in Path(__file__).resolve().parents if (p / 'AGENTS.md').is_file())
OWN = Path(__file__).resolve().parents[1]
SELECTOR = OWN / 'SELECTION.final-current-Kp-Pourbaix-informed-P2-A2-M2-V2.json'
SEAL = OWN / 'FILES.finite-final-current-Kp-Pourbaix-P2-A2-M2-V2.seal.json'
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


ctx_path = OWN / 'inputs/final-two-image-bound-whole-contexts.actual.json'
ctx = read(ctx_path)
binding_path = OWN / 'BINDING.final-P2-A2-M2-V2.actual.json'
binding = read(binding_path)
original_seals = [OWN / p for p in ['FILES.finite-prebinding-science-and-views.seal.json',
                                   'FILES.finite-Kp-PNG-v1-actual-successor-V-FIRST-and-views.seal.json']]
for seal in original_seals:
    for r in read(seal)['files']:
        verify(r)
for r in ctx['originalPAMSeals'] + [v['FIRSTSeal'] for v in ctx['selectedVScience']]:
    verify(r)
    s = read(REPO / r['path'])
    assert s['normalNewRecordsAtSeal'] == s['normalNewFingerprintsAtSeal'] == 0
    assert datetime.fromisoformat(s['sealedAtUTC']) < datetime.fromisoformat(binding['boundAtUTC'])
    for f in s['files']:
        verify(f)
for key in ['finalAuthorSelector', 'finalAuthorSeal', 'finalCanonical', 'finalSemantic', 'M422Baseline', 'QA438Baseline']:
    verify(ctx[key])
for key in ['P2Records', 'A2Records', 'M422Records', 'all75CardsExact', 'V2NormalQA', 'V2PhysicalTransportQA', 'QA438Candidate']:
    verify(binding[key])
P = [json.loads(l) for l in (REPO / binding['P2Records']['path']).read_text().splitlines()]
profiles = {c['goal']['id']: c['profile'] for c in ctx['wholeContexts']}
assert len(P) == 2
for p in P:
    assert p['profile'] == profiles[p['goalId']]
    assert p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
    assert p['reviewAuthority'] == 'ai_candidate' and p['status'] == 'needs_human_review'
A = [json.loads(l) for l in (REPO / binding['A2Records']['path']).read_text().splitlines()]
assert len(A) == 2 and all(a['status'] == 'atomic' and a['semanticAtomic'] is True for a in A)
M_old = (REPO / ctx['M422Baseline']['path']).read_text().splitlines(keepends=True)
M_new = (REPO / binding['M422Records']['path']).read_text().splitlines(keepends=True)
assert len(M_old) == len(M_new) == 422 and sum(a == b for a, b in zip(M_old, M_new)) == 420
Q_old = read(REPO / ctx['QA438Baseline']['path'])['records']
Q_new = read(REPO / binding['QA438Candidate']['path'])['records']
assert len(Q_old) == len(Q_new) == 438 and sum(a == b for a, b in zip(Q_old, Q_new)) == 436
preserved = ['e0d4f08a-3e67-5e2b-9c4a-06468ec5c3dd', '1a51362e-fd84-5964-89b5-b435772c2149',
             'f71a2c0a-3a6a-5b23-9fb4-1b57cfb68528', '6d3a2bad-8c67-5964-a720-375f138adaba',
             '13838147-c26d-54ca-b9be-5f2f0b8e9de5']
for gid in preserved:
    assert next(l for l in M_old if json.loads(l)['goalId'] == gid) == next(l for l in M_new if json.loads(l)['goalId'] == gid)
    assert next(q for q in Q_old if q['goalId'] == gid) == next(q for q in Q_new if q['goalId'] == gid)
commands = []
for name in ['P2.final-stock-fingerprint-materialization', 'A2.final-stock-fingerprint-binding', 'M2.final-stock-fingerprint-binding',
             'P2.final-stock-check', 'A2.final-stock-check', 'V2.final-targeted-stock-helper', 'M422.final-whole422-ten-views-check']:
    p = OWN / f'checks/{name}.command.actual.json'
    assert read(p)['exitCode'] == 0
    commands.append({'name': name, 'receipt': ref(p), 'exitCode': 0})
views = []
for receipt_path in [OWN / 'browser/RECEIPT.actual-own-current-316-636-Chromium.json', OWN / 'browser/RECEIPT.actual-Kp-PNG-v1-316-636.json']:
    for row in read(receipt_path)['records']:
        for k in ['fixture', 'screenshot']:
            verify(row[k])
        assert row['metrics']['complete'] and row['pageErrors'] == []
        views.append(row['screenshot'])
assert len(views) == 6
mapping_path = OWN / 'checks/REBUILD.final-P2-A2-M2-V2.reference-host.physical-map.json'
mapping = read(mapping_path)
host = REPO / mapping['executionHost']
for row in mapping['sourceMap'] + mapping['imageAliases']:
    verify(row['physicalRepositorySource'])
    assert (host / row['normalHostAlias']).read_bytes() == (REPO / row['physicalRepositorySource']['path']).read_bytes()
for row in mapping['imageAliases']:
    p = host / row['normalHostAlias']
    assert p.is_symlink() and p.resolve() == (REPO / row['physicalRepositorySource']['path']).resolve()
regular_host = [p for p in host.rglob('*') if p.is_file() and not p.is_symlink()]
assert len(regular_host) == mapping['regularFileCount']
assert sum(p.stat().st_size for p in regular_host) == mapping['regularBytes'] == 3664161
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
audit_path = OWN / 'checks/FINITE.final-byte-json-jsonl-python-and-host-map.actual.json'
write(audit_path, {
    'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'Finite mechanical audit only, no repeated normal check',
    'allOriginalScienceAndViewsExact': True, 'FIRSTBeforeNormalBinding': True,
    'actualNormalReceipts': commands, 'finalStockCheckAttemptsEach': 1, 'failedStockAttempts': 0,
    'parsedJSONBeforeFinalMetadata': json_files, 'parsedJSONL': jsonl_files, 'parsedPythonAST': python_files,
    'finalMetadataAtomicallySerializedAndParsed': True,
    'wholeProfiles2Exact': True, 'other420MRawLinesExact': True, 'cards75Exact': True,
    'other436WholeQAObjectsExact': True, 'e0_1a_f71_138_otherCarbonylRowsExact': True,
    'actualGoalCardViews': 6, 'hostRegularFiles': mapping['regularFileCount'], 'hostRegularBytes': mapping['regularBytes'],
    'sourceImageCopies': 0, 'newNormalRunsInThisAudit': 0, 'fullSchemaOrCentralRuns': 0, 'activeWrites': 0,
})
write(SELECTOR, {
    'schemaVersion': 1, 'role': 'Finite final current Kp/Pourbaix informed P2/A2/M2/V2 inactive candidate',
    'completedAtUTC': datetime.now(timezone.utc).isoformat(), 'goalIds': [p['goalId'] for p in P],
    'finalAuthorSelector': ctx['finalAuthorSelector'], 'finalAuthorSeal': ctx['finalAuthorSeal'],
    'finalCanonical': ctx['finalCanonical'], 'finalSemanticSourceIdentities': ctx['finalSemantic'],
    'wholeActualFinalInput': ref(ctx_path),
    'roleDisclosure': 'Original16 material author, not author of current two descriptions or images. Informed role, no blind material-origin claim.',
    'blindToOtherRuns': False, 'originalPAMScienceSeals': ctx['originalPAMSeals'],
    'selectedCurrentVScience': ctx['selectedVScience'],
    'earlierFiniteOriginalScienceAndViews': [ref(p) for p in original_seals],
    'P2': {'records': binding['P2Records'], 'config': ref(OWN / 'config/P2.final-current-image-bound.config.json'),
           'runManifest': ref(OWN / 'normal/P2.final-informed.run.json'),
           'evidenceLevel': 'E1', 'maximumClaimScope': 'G1', 'reviewAuthority': 'ai_candidate',
           'status': 'needs_human_review', 'wholeProfileBodiesExact': True,
           'reviewedResourceTypes': ['goal-visualization'], 'actualCurrentImageBinding': True,
           'lowercaseStockPreflight': ref(OWN / 'checks/P2.lowercase-stock-regex.before-CLI.actual.json'),
           'stockCheckAttempts': 1, 'stockExitCode': 0},
    'A2': {'records': binding['A2Records'], 'config': ref(OWN / 'config/A2.final-current-text.config.json'),
           'atomic': 2, 'stockCheckAttempts': 1, 'stockExitCode': 0},
    'M2': {'whole422Records': binding['M422Records'],
           'whole422TenViewsConfig': ref(OWN / 'config/M422.whole-ten-views.final-Kp-Pourbaix.config.json'),
           'baseline': ctx['M422Baseline'], 'genuineNoMemoryNeeded': 2, 'newCards': 0,
           'other420OriginalRawLinesExact': True, 'all75CardsExact': binding['all75CardsExact'],
           'stockWholeCheckAttempts': 1, 'stockExitCode': 0},
    'V2': {'normalQA2': binding['V2NormalQA'], 'physicalTransportQA2': binding['V2PhysicalTransportQA'],
           'wholeQA438Candidate': binding['QA438Candidate'], 'baseline': ctx['QA438Baseline'],
           'acceptedCurrentImages': 2, 'uniqueCurrentVotes': 2, 'physicalTransportAddsVotes': 0,
           'other436WholeObjectsExact': True, 'originalJPGReviseAndViewsPreserved': True,
           'actualGoalCardViewsInHistory': 6, 'stockTargetedCheckAttempts': 1, 'stockExitCode': 0},
    'normalBinding': ref(binding_path),
    'actualRoleChecksAndPreservation': ref(OWN / 'checks/FINAL.actual-current-two-role-checks-and-preservation.json'),
    'physicalExactRebuildMap': ref(mapping_path),
    'portableBuildOnlyHelper': ref(OWN / 'scripts/rebuild_final_reference_host.py'),
    'finiteAudit': ref(audit_path), 'readme': ref(OWN / 'README.md'),
    'fourDSourceCourseHoldsRemainOpen': True, 'newDOrSourceCourseApprovals': 0,
    'HumanApproval': False, 'HumanTrial': False, 'M7Grant': False,
    'fullSchemaRuns': 0, 'CentralRuns': 0, 'wholeBookOrNativeRenderer': False,
    'sourceImageCopies': 0, 'activeWrites': 0,
    'finalSealPath': str(SEAL.relative_to(REPO)), 'STOPAfterSeal': True,
})
files = [ref(p) for p in sorted(OWN.rglob('*')) if p.is_file() and p != SEAL]
write(SEAL, {'schemaVersion': 1, 'role': 'Finite final informed P2/A2/M2/V2, exact original and negative history retained',
             'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'selector': ref(SELECTOR), 'files': files,
             'regularPayloadFiles': len(files), 'regularPayloadBytes': sum(r['bytes'] for r in files),
             'sealExcludedFromOwnInventory': True, 'finite': True, 'activeWrites': 0, 'humanApproval': False})
for r in files:
    verify(r)
assert len([p for p in OWN.rglob('*') if p.is_file()]) == len(files) + 1
print(json.dumps({'selector': ref(SELECTOR), 'seal': ref(SEAL),
                  'payloadFiles': len(files), 'payloadBytes': sum(r['bytes'] for r in files),
                  'allRegularFilesIncludingSeal': len(files) + 1,
                  'P2Records': binding['P2Records'], 'A2Records': binding['A2Records'],
                  'M422Records': binding['M422Records'], 'normalQA2': binding['V2NormalQA'],
                  'wholeQA438': binding['QA438Candidate'], 'STOP': True}, indent=2))
