# SPDX-License-Identifier: Apache-2.0
"""Prepare exact Native inputs only; FIRSTs, votes, records and pairing are absent."""
from pathlib import Path
import datetime
import hashlib
import json
import os
import shutil

REPO = Path.cwd()
OWN = Path(__file__).resolve().parents[1]
NATIVE = OWN.parent.parent / 'chemie-bcp-current426-native24-preparation-technical-20261015-v1'


def load(path):
    return json.loads(path.read_text())


def ref(path):
    body = path.read_bytes()
    return {'path': path.relative_to(REPO).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(body).hexdigest(), 'bytes': len(body)}


def verify(row):
    path = REPO / row['path']
    actual = ref(path)
    assert actual['sha256'] == row['sha256'] and actual['bytes'] == row['bytes'], path
    return path


def put(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


assert not (OWN / 'config').exists()
selector_path = NATIVE / 'NEUTRAL.finite-final-full426-native24-technical-handoff.selector.json'
seal_path = NATIVE / 'FILES.finite-final-full426-native24-technical-handoff.seal.json'
assert ref(selector_path)['sha256'] == 'sha256:2aa745b17892fec563df53cab9e026cb94770b18e75a35e608dca6df94b0ae4d'
assert ref(seal_path)['sha256'] == 'sha256:dffba286542be5ef08ff6931b7310fa1d2c7becec57936d63214d6fb26cd0b46'
for row in load(seal_path)['files']:
    verify(row)
source = load(selector_path)
rows = []
all_goal_ids = []
for batch in source['batches']:
    label = batch['batch']
    original_manifest = load(verify(batch['batchManifest']))
    original_config_path = REPO / original_manifest['configPath']
    original_config = load(original_config_path)
    assert ref(original_config_path)['sha256'] == original_manifest['configDigest']
    destination = OWN / ('native-' + label)
    config = dict(original_config)
    config['outputDirectory'] = destination.relative_to(REPO).as_posix()
    count = batch['goalCount']
    assert count in [15, 9] and len(config['goalIds']) == count
    config_path = OWN / ('config/native-' + label + '.original-A-B.transport-only.config.json')
    put(config_path, config)
    relocated = dict(original_manifest)
    relocated['configPath'] = config_path.relative_to(REPO).as_posix()
    relocated['configDigest'] = ref(config_path)['sha256']
    changed = [key for key in original_manifest if original_manifest[key] != relocated[key]]
    assert changed == ['configPath', 'configDigest']
    manifest_path = destination / 'batch-manifest.json'
    put(manifest_path, relocated)
    bundle_source = verify(batch['bundleManifest']).parent
    bundle_link = destination / 'bundle'
    relative_target = os.path.relpath(bundle_source, bundle_link.parent)
    assert not Path(relative_target).is_absolute()
    bundle_link.symlink_to(relative_target, target_is_directory=True)
    assert bundle_link.resolve() == bundle_source.resolve()
    assert bundle_link.resolve().is_relative_to(REPO / 'curricula')
    copies = []
    original_root = (REPO / batch['batchManifest']['path']).parent
    for side in ['a', 'b']:
        src = original_root / ('round-' + side)
        dst = destination / ('round-' + side)
        assert list((src / 'results').iterdir()) == []
        shutil.copytree(src, dst)
        assert list((dst / 'results').iterdir()) == []
        for path in sorted(src.rglob('*')):
            if path.is_file():
                copy = dst / path.relative_to(src)
                assert path.read_bytes() == copy.read_bytes()
                copies.append({'original': ref(path), 'exactCopy': ref(copy)})
    (destination / 'resolutions').mkdir()
    all_goal_ids.extend(config['goalIds'])
    rows.append({'role': '15 new actual D pairs' if count == 15 else '9 changed relation-context successors',
                 'batch': label, 'goalCount': count, 'goalIds': config['goalIds'],
                 'originalConfig': ref(original_config_path), 'transportConfig': ref(config_path),
                 'originalBatchManifest': batch['batchManifest'], 'relocatedBatchManifest': ref(manifest_path),
                 'onlyManifestChanges': changed, 'bundleRelativeLink': relative_target,
                 'bundleOriginalManifest': batch['bundleManifest'], 'exactRoundCopies': copies,
                 'records': [], 'runs': [], 'synthesisAuthoring': None,
                 'resultsEmpty': True, 'resolutionsEmpty': True})
assert len(all_goal_ids) == len(set(all_goal_ids)) == 24
status_path = OWN / 'PREPARED.two-native-input-transports.awaiting-root-FIRST-release.selector.json'
put(status_path, {'schemaVersion': 1,
                  'role': 'Exact immutable Native15+9 input transport only; FIRST release and genuine normal serialization remain pending',
                  'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                  'originalNativeSelector': ref(selector_path), 'originalNativeSeal': ref(seal_path),
                  'canonical': source['canonical'], 'semantic': source['semantic'], 'visualizationQA': source['qa'],
                  'batches': rows, 'distinctGoalIds': 24,
                  'FIRSTsRead': False, 'rootDoubleFIRSTReleaseReceived': False,
                  'normalRecordsWritten': 0, 'normalRunsWritten': 0, 'DpairingRuns': 0,
                  'newScientificVotes': 0, 'nativeRenders': 0, 'relocationStockCliChecks': 0,
                  'CentralRuns': 0, 'activeChanges': False,
                  'nextAllowedStep': 'Wait for explicit Root release after Root personally reads both genuine independent FIRSTs; preserve all independent UI0f findings without inferred synthesis.'})
files = [path for path in OWN.rglob('*') if path.is_file() and not path.is_symlink()]
for path in files:
    if path.suffix == '.json':
        load(path)
    if path.suffix == '.jsonl':
        for line in path.read_text().splitlines():
            if line.strip():
                json.loads(line)
put(OWN / 'FILES.finite-input-transport-only.before-FIRST-release.seal.json', {
    'schemaVersion': 1, 'role': 'Finite exact input-transport preparation only; later outputs may be added after explicit root release',
    'files': [ref(path) for path in sorted(files)],
    'relativeBundleLinks': [{'path': (OWN / ('native-' + row['batch']) / 'bundle').relative_to(REPO).as_posix(),
                             'target': row['bundleRelativeLink'], 'targetManifest': row['bundleOriginalManifest']} for row in rows],
    'normalRecords': 0, 'normalRuns': 0, 'newScientificVotes': 0, 'CentralRuns': 0})
print(json.dumps({'preparedBatches': [15, 9], 'distinctGoals': 24, 'exactRoundFilesCopied': sum(len(row['exactRoundCopies']) for row in rows),
                  'relativeBundleLinks': 2, 'FIRSTsRead': False, 'normalRecords': 0, 'normalRuns': 0, 'pairing': 0, 'CLIchecks': 0}), flush=True)
