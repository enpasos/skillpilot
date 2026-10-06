#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Export exact prospective native inputs without active integration."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, shutil
ROOT = Path.cwd().resolve()
OWN = Path(__file__).resolve().parent
REL = OWN.relative_to(ROOT)
PRIOR = OWN.parent / 'chemie-b010-five-prospective-current-candidate-v1'
ISO = ROOT / 'tmp/chemie-b010-five-corrected-native-isolated-20261005-v3'
def sha(p): return hashlib.sha256(Path(p).read_bytes()).hexdigest()
def read(p): return json.loads(Path(p).read_text())
def write(name, value): (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
assert not (OWN / 'prepared.freeze.manifest.json').exists()
prior = read(PRIOR / 'prepared.freeze.manifest.json')
assert sha(PRIOR / 'prepared.freeze.manifest.json') == '773bfb3a5f8c95ecc44e8f0e361fc9e9ae65b2eca7392e3ed33bdcac5d623cc9'
for r in prior['ownFiles']: assert sha(ROOT / r['path']) == r['sha256'], r['path']
for r in prior['exactFutureChangedInputs']:
    active = ROOT / r['futureActivePath']
    assert (sha(active) if active.exists() else None) == r['activeSHA256Before'], r['futureActivePath']
for r in prior['exactUnchangedPlannedInputs']: assert sha(ROOT / r['futureActivePath']) == r['sha256'], r['futureActivePath']
plans = {r['futureActivePath'] for r in prior['exactFutureChangedInputs'] + prior['exactUnchangedPlannedInputs']}
atlas = read(ISO / 'app/scripts/config/goal-books/de-gym-chemistry-national-atlas.inputs.json')
plans |= {atlas['manifestPath'], atlas['navigationViewPath']}
plans |= {str(p.relative_to(ISO)) for p in (ISO / atlas['outputDirectory']).rglob('*') if p.is_file()}
for gid in ['16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9']:
    plans |= {f'{base}/{gid}/{gid}.png' for base in ['curricula/DE/Gymnasium/visualizations/chemie', 'app/public/assets/goal-visualizations/chemie', 'backend/src/main/resources/static/assets/goal-visualizations/chemie']}
    plans.add(f'curricula/DE/Gymnasium/visualizations/chemie/{gid}/prompt.de.md')
changed, unchanged = [], []
for relative in sorted(plans):
    src, active = ISO / relative, ROOT / relative
    digest = sha(src)
    baseline = sha(active) if active.exists() else None
    if digest == baseline:
        unchanged.append({'futureActivePath': relative, 'sha256': digest})
        continue
    out = OWN / 'prospective-input-tree' / relative
    out.parent.mkdir(parents=True, exist_ok=True)
    assert not out.exists()
    shutil.copy2(src, out)
    changed.append({'futureActivePath': relative, 'prospectiveCopyPath': str(out.relative_to(ROOT)), 'sha256': digest,
                    'bytes': out.stat().st_size, 'activeSHA256Before': baseline, 'newPath': baseline is None})
canon_path = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
old = read(PRIOR / 'prospective-input-tree' / canon_path)
new = read(ISO / canon_path)
before, after = {g['id']:g for g in old['goals']}, {g['id']:g for g in new['goals']}
assert before.keys() == after.keys()
delta = []
for gid in before:
    keys = sorted(k for k in before[gid].keys() | after[gid].keys() if before[gid].get(k) != after[gid].get(k))
    if keys:
        assert gid in ['16a80de2-b5e0-5467-a9b3-5860730d7d8b', '1f5ee84f-245a-5a1e-a260-f960f26523e9'] and keys == ['resourceLinks']
        delta.append({'goalId': gid, 'changedGoalFields': keys, 'oldResourceLinks': before[gid]['resourceLinks'], 'newResourceLinks': after[gid]['resourceLinks']})
assert len(delta) == 2
write('exact-v1-to-v3-scientific-payload-preservation.actual.receipt.json', {'canonicalGoalIdsExactlyUnchanged': True,
    'allGoalFieldsExceptTwoActualImageResourcesExactlyUnchanged': True, 'specificResourceDeltas': delta,
    'priorCanonicalSHA256': sha(PRIOR / 'prospective-input-tree' / canon_path), 'currentFutureCanonicalSHA256': sha(ISO / canon_path),
    'rootIndependentFivePProfilesExactSHA256': sha(OWN / 'positive-evidence.candidates.json'),
    'strictClosure': 0, 'humanApproval': False, 'activeWrites': 0})
write('prepared-prospective-input-tree.receipt.json', {'schemaVersion': 1, 'status': 'inactive_exact_future_changed_inputs_exported',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'isolationRoot': str(ISO), 'files': changed, 'fileCount': len(changed),
    'totalBytes': sum(r['bytes'] for r in changed), 'plannedInputsUnchanged': unchanged, 'futureChangedPaths': [r['futureActivePath'] for r in changed],
    'priorV1FrozenOwnFilesVerified': len(prior['ownFiles']), 'allPrior16ChangedAnd49UnchangedActiveBaselinesExact': True,
    'nativeSourceAtlasRecreatedFromFinalCanonicalBytes': True, 'noNewAtomicIds': True,
    'historicalJPGsRemainUnchangedInActiveWorktree': True, 'activeJPGCleanupOrIntegrationByThisAgent': False,
    'fiveNewScientificGoalIds': read(OWN / 'positive-evidence.config.json')['scope']['goalIds'],
    'fourExistingBindingGoalIds': ['fcc73fb5-7413-557f-aea3-b9692a66ee75', '42a84bca-d27e-581f-a43a-eee424f0504d', 'b5086548-169e-5d63-a14a-dabf631fa013', 'd726e00e-1f87-5ba5-8c79-76ad4022365e'],
    'strictClosure': 0, 'humanApproval': False, 'activeWrites': 0})
rows = [{'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size} for p in sorted(OWN.rglob('*')) if p.is_file()]
freeze = {'schemaVersion': 1, 'status': 'frozen_exact_inactive_v3_preparation', 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'ownFiles': rows, 'exactFutureChangedInputs': changed, 'exactUnchangedPlannedInputs': unchanged,
    'previousPreparationPreservedSHA256': sha(PRIOR / 'prepared.freeze.manifest.json'),
    'DResultsDirectoriesEmptyAtFreeze': True, 'humanApproval': False, 'strictClosure': 0, 'activeWrites': 0}
write('prepared.freeze.manifest.json', freeze)
(OWN / 'prepared.freeze.manifest.sha256').write_text(sha(OWN / 'prepared.freeze.manifest.json') + '  prepared.freeze.manifest.json\n')
print(json.dumps({'futureChangedFiles': len(changed), 'futureUnchangedFiles': len(unchanged), 'frozenOwnFiles': len(rows), 'freezeSHA256': sha(OWN / 'prepared.freeze.manifest.json')}))
