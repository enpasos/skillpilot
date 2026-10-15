# SPDX-License-Identifier: Apache-2.0
"""Finite post-CAS handoff for one Root-owned Central run; never runs Central."""
from pathlib import Path
import datetime
import hashlib
import json
import os

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]


def load(path):
    return json.loads(path.read_text())


def sha(body):
    return 'sha256:' + hashlib.sha256(body).hexdigest()


def ref(path):
    b = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': sha(b), 'bytes': len(b)}


def object_sha(value):
    return sha(json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode())


def verify(row):
    p = REPO / row['path']
    assert ref(p) == row, p
    return p


def put(path, value):
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


transport_path = OWN / 'TRANSPORT.genuine-D15-D1-own-original-science.exact.json'
transport = load(transport_path)
release = load(verify(transport['rootRelease']))
for row in release['actualScientificInputs'].values():
    verify(row)
for seal_path in [OWN / 'FILES.finite-input-transport-only.before-FIRST-release.seal.json',
                  OWN / 'e7-one/FILES.finite-actual-proper-e7-D1-source-only.seal.json']:
    for row in load(seal_path)['files']:
        verify(row)
source_native = load(verify(release['native15Selector']))
source_one = load(verify(release['nativeE7OneSelector']))
native_seal = REPO / source_native['finalSealPath']
for row in load(native_seal)['files']:
    verify(row)
for row in [source_native['canonical'], source_native['semantic'], source_native['qa']]:
    verify(row)
checks_path = OWN / 'checks/STOCK.D15-D1.actual-bundled-pair-current-bindings-and-indices.PASS.json'
checks = load(checks_path)
assert checks['allExitCodes'] == [0] * 8
for row in checks['commandReceipts']:
    receipt = load(verify(row))
    assert receipt['exitCode'] == 0
    verify(receipt['stdout'])
    verify(receipt['stderr'])
    verify(receipt['stockModule'])
mapping = {(row['batch'], row['side'], row['goalId']): row for row in transport['recordProvenance']}
record_audit = []
indices = []
all_resolved = []
for batch in transport['batches']:
    label = batch['batch']
    root = REPO / batch['batchDirectory']
    index_path = root / 'resolution-index.json'
    index = load(index_path)
    assert len(index['resolutions']) == batch['goalCount']
    assert all(row['strictDescriptionComplete'] for row in index['resolutions'])
    assert all(row['decision'] == 'keep_current' for row in index['resolutions'])
    all_resolved.extend(row['goalId'] for row in index['resolutions'])
    indices.append(ref(index_path))
    for side in ['a', 'b']:
        files = list((root / ('round-' + side) / 'results').glob('*.records.jsonl'))
        assert len(files) == 1
        records = [json.loads(line) for line in files[0].read_text().splitlines() if line.strip()]
        for record in records:
            original = mapping[(label, side, record['goalId'])]
            assert object_sha(record['understandingEvidence']) == original['ownSixFieldsObjectSha256']
            assert record['rationale'] == '\n\n'.join(original['ownRationaleParts'])
            assert record['decision'] == original['decision'] == 'keep'
            assert record['pageFingerprint'] == original['pageFingerprint']
            record_audit.append({'batch': label, 'side': side, 'goalId': record['goalId'],
                                 'recordId': record['recordId'], 'ownSixFieldsWordExact': True,
                                 'ownRationalePartsWordExact': True, 'peerFieldsCopied': False})
assert len(record_audit) == 32 and len(all_resolved) == len(set(all_resolved)) == 16
assert all((OWN / ('native-relations-nine/round-' + side) / 'results').is_dir() and
           list((OWN / ('native-relations-nine/round-' + side) / 'results').iterdir()) == [] for side in ['a', 'b'])
assert not (OWN / 'native-relations-nine/resolution-index.json').exists()
audit_path = OWN / 'AUDIT.post-stock-own192-fields-source-seals-and-inactive-nine.exact.json'
put(audit_path, {'schemaVersion': 1, 'role': 'Finite exact post-stock own-original source audit; no new scientific vote',
                 'normalRecordsAudited': 32, 'ownUnderstandingFieldsWordExact': 192,
                 'recordAudit': record_audit, 'allOriginalScienceArtifactsAndSealsExact': True,
                 'allNativeOriginalPayloadsExact': True, 'allPreparedInputPayloadsExact': True,
                 'originalNineTransportStillUnactivated': True, 'newD9NormalRecords': 0,
                 'historicalEightDFileWrites': 0, 'newPFromNull': False, 'newScienceVotes': 0})
selector_path = OWN / 'OUTPUTS.finite-genuine-D15-D1-stock-pairing.ready-for-one-scoped-Central.selector.json'
selector = {
    'schemaVersion': 1, 'role': 'Finite actual stock pairing of16 genuine independent original D15+D1 descriptions; ready only for one Root-owned scoped inactive Central check',
    'rootRelease': transport['rootRelease'], 'originalScientificInputReferences': release['actualScientificInputs'],
    'canonical': source_native['canonical'], 'semantic': source_native['semantic'], 'visualizationQA': source_native['qa'],
    'descriptionResolutionIndexPaths': [row['path'] for row in indices],
    'descriptionResolutionIndices': indices,
    'actualStockPairChecks': checks['commandReceipts'], 'actualStockPairAndCurrentBindingSummary': ref(checks_path),
    'exactOriginalTransport': ref(transport_path), 'postStockExactOwnScienceAndPreservationAudit': ref(audit_path),
    'batches': [{'batch': batch['batch'], 'goalCount': batch['goalCount'],
                 'dualSummary': ref(REPO / batch['batchDirectory'] / 'dual-summary.json'),
                 'synthesisManifest': ref(REPO / batch['batchDirectory'] / 'synthesis-decisions.json'),
                 'resolutionIndex': next(row for row in indices if row['path'].startswith(batch['batchDirectory'] + '/'))}
                for batch in transport['batches']],
    'normalRecords': 32, 'genuineOriginalIndependentReviewerRoles': 2, 'normalRuns': 4,
    'ownUnderstandingFieldsWordExact': 192, 'genuineCurrentKeepKeepPairs': 16,
    'actualStockCurrentStrictDescriptionResolutions': 16,
    'nineContextSupplements': transport['contextOnlySupplements'],
    'oldNineTransportActivated': False, 'D9DescriptionIndexAdded': False,
    'onlyE7RequiresOldOwnDescriptionSupersession': True, 'historicalEightDFileWrites': 0,
    'unknownModelIdentityDeclaredHonestly': True, 'providerOrModelDiversityClaimed': False,
    'diversityPolicy': 'report_only',
    'openRuntime360AndGlobalImages': ref(OWN / 'OPEN.original-runtime360-observations-and-global-image-holds.preserved.json'),
    'globalQaApprovalCoverage': source_native['globalQaApprovalCoverage'],
    'readyForOneScopedCentral': True,
    'readyScope': 'Only description source pairing/current binding for the exact Root-released16 goals. Root owns inactive central integration and all remaining holds; no M7 or public/runtime release is granted here.',
    'authorizedCentralRunsForThisRole': 0, 'actualCentralRuns': 0,
    'newScientificVotesByTechnicalRole': 0, 'newPFromNull': False, 'newRenderRunsDuringNormalPairing': 0,
    'HumanApproval': False, 'HumanTrial': False, 'M7Granted': False, 'activeChanges': False,
    'finalSealPath': (OWN / 'FILES.finite-genuine-D15-D1-stock-pairing-and-source-preservation.seal.json').relative_to(REPO).as_posix(),
}
put(selector_path, selector)
files = []
links = []
for path in sorted(OWN.rglob('*')):
    if path.is_symlink():
        target = os.readlink(path)
        assert not Path(target).is_absolute()
        assert path.resolve().is_relative_to(REPO / 'curricula')
        links.append({'path': path.relative_to(REPO).as_posix(), 'target': target})
    elif path.is_file():
        if path.suffix == '.json':
            load(path)
        if path.suffix == '.jsonl':
            for line in path.read_text().splitlines():
                if line.strip():
                    json.loads(line)
        files.append(ref(path))
put(OWN / 'FILES.finite-genuine-D15-D1-stock-pairing-and-source-preservation.seal.json', {
    'schemaVersion': 1, 'role': 'Finite technical D15+D1 handoff, exact sources and stock results; Central is external',
    'sealedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'files': files, 'relativeBundleLinks': links,
    'normalRecords': 32, 'strictCurrentDescriptions': 16, 'actualStockChecksPASS': 8,
    'newScienceVotes': 0, 'actualCentralRuns': 0,
})
print(json.dumps({'selector': ref(selector_path), 'descriptionResolutionIndexPaths': selector['descriptionResolutionIndexPaths'],
                  'actualStockPairChecksPASS': 8, 'strictCurrentDescriptions': 16,
                  'readyForOneScopedCentral': True, 'payloadFiles': len(files), 'payloadBytes': sum(row['bytes'] for row in files),
                  'newScienceVotes': 0}), flush=True)
