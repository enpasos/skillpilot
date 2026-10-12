# SPDX-License-Identifier: Apache-2.0
"""Capture technical bindings and path lists; writes only this report directory."""
from pathlib import Path
import json, hashlib, subprocess
from datetime import datetime, timezone

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[6]
E12 = OUT.parent

def read(path):
    return json.loads(path.read_text())

def sha(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

def write(name, value):
    path = OUT / name
    assert not path.exists(), name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

seals = [
    ('chemie-q3-three-current402-active-adoption-root-20261012-v10', 'FINAL.technical-adoption.freeze.json', 95),
    ('chemie-q3-three-current402-current217-preserving-root-preparation-20261012-v9', 'FINAL.technical-preparation.freeze.json', 108),
    ('chemie-q3-current217-three-fresh-independent-a-20261012-v9', 'FINAL.original-a.immutable-seal.json', 51),
    ('chemie-q3-current217-three-fresh-independent-b-20261012-v9', 'FINAL.independent-b.output.freeze.json', 55),
    ('chemie-q3-three-current402-real-method-source-author-20261012-v8', 'FINAL.immutable-author-candidate-CAS-seal.json', 180),
    ('chemie-q3-three-current402-live-context-author-20261012-v7', 'FINAL.immutable-author-candidate-CAS-seal.json', 199),
    ('biologie-basiskonzepte-0beb-stomata-underside-one-image-technical-preparation-20261012-v1', 'FINAL.technical-preparation.freeze.json', 96),
    ('biologie-basiskonzepte-0beb-stomata-underside-image-author-root-20261012-v1', 'FINAL.author-image.freeze.json', 9),
    ('biologie-0beb-stomata-underside-fresh-independent-a-20261012-v1', 'FINAL.independent-current-DPV.freeze.json', 61),
    ('biologie-0beb-stomata-underside-fresh-independent-b-20261012-v1', 'FINAL.own-independent-B.freeze.json', 28),
]
groups, owned_paths, all_paths = [], [], []
for directory, filename, count in seals:
    path = E12 / directory / filename
    seal = read(path)
    rows = next(seal[k] for k in ['ownFiles', 'ownedFiles', 'files'] if k in seal)
    assert len(rows) == count
    actual_bytes = 0
    for row in rows:
        rel = row['path']
        file = ROOT / rel
        assert file.is_file() and not file.is_symlink(), rel
        assert sha(file) == row['sha256'], rel
        actual_bytes += file.stat().st_size
        owned_paths.append(rel)
        all_paths.append(rel)
    rel_seal = str(path.relative_to(ROOT))
    all_paths.append(rel_seal)
    groups.append({'directory': str(path.parent.relative_to(ROOT)), 'sealPath': rel_seal,
                   'sealSha256': sha(path), 'ownedFileCount': count,
                   'ownedBytes': actual_bytes, 'allOwnedHashesExact': True})
assert len(owned_paths) == 882
all_paths = sorted(set(all_paths))
(OUT / 'required-frozen-artifact-paths.actual.txt').write_text('\n'.join(all_paths) + '\n')
ignored = subprocess.run(['git', 'check-ignore', '-z', '--stdin'], cwd=ROOT,
                         input='\0'.join(all_paths)+'\0', capture_output=True, text=True)
assert ignored.returncode in [0, 1]
ignored_paths = sorted(filter(None, ignored.stdout.split('\0')))
third_party = [p for p in ignored_paths if p.endswith('.pdf') and '/sources/' in p]
native = [p for p in ignored_paths if ('/native/' in p or '/inputs/native.book.' in p)]
assert len(native) == 12 and len(third_party) == 4, (native, third_party)
(OUT / 'required-ignored-native-paths.actual.txt').write_text('\n'.join(native) + '\n')
(OUT / 'third-party-source-copies.explicit-route-needed.actual.txt').write_text('\n'.join(third_party) + '\n')

registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(registry_path)
subjects = []
for s in registry['subjects']:
    if s['subject'] not in ['chemie', 'biologie']:
        continue
    subjects.append({'subject': s['subject'], 'memoryReviewConfigPath': s['memoryReviewConfigPath'],
                     'current20261012D': [p for p in s['resolutionIndexPaths'] if '/2026-10-12/' in p],
                     'current20261012P': [p for p in s.get('positiveEvidenceConfigPaths', []) if '/2026-10-12/' in p]})
cqr_path = ROOT / 'docs/qa-ci/status/curriculum-quality-status.json'
cqr = read(cqr_path)
cqr_rows = [{'subject': s['subject'], 'maturity': s['maturity'],
             'CQR303': next(r for r in s['rules'] if r['id'] == 'CQR-303')}
            for s in cqr['curricula'] if s['subject'] in ['Chemie', 'Biologie']]
ledger_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/in-flight-work-ledger.json'
ledger = read(ledger_path)
claim_paths = ledger['activeBatchConfigPaths']
tracked_claims = set(subprocess.check_output(['git', 'ls-files', '--cached', '-z', '--', *claim_paths], cwd=ROOT, text=True).split('\0'))
missing_claim_files = [p for p in claim_paths if not (ROOT / p).is_file()]
untracked_claim_files = [p for p in claim_paths if p not in tracked_claims]
plan = read(E12 / 'chemie-q3-three-current402-active-adoption-root-20261012-v10/ROOT.future-active-adoption.plan.json')
receipt = read(ROOT / plan['boundedSourceOutputs'][-1]['preparedPath'])
write('ACTUAL.checkpoint-and-dependency-snapshot.json', {
    'capturedAtUTC': datetime.now(timezone.utc).isoformat(),
    'role': 'Technical snapshot during root-owned adoption; not a scientific vote or terminal CI claim',
    'activeOrGitWrites': False,
    'verifiedFrozenGroups': groups, 'ownedEntries': len(owned_paths),
    'uniqueOwnedAndSealPaths': len(all_paths), 'ignoredNativeFiles': native,
    'ignoredThirdPartySourceCopies': third_party,
    'redistributionGrantEstablishedByReviewedReceipts': False,
    'activeRegistrySha256': sha(registry_path), 'activeBindings': subjects,
    'currentGeneratedCQR': cqr_rows,
    'inFlightLedgerSha256': sha(ledger_path), 'activeClaimConfigCount': len(claim_paths),
    'missingActiveClaimFiles': missing_claim_files, 'untrackedActiveClaimFiles': untracked_claim_files,
    'normalInFlightLoaderObserved': {'schemaValidatedActiveBatchCount': 9, 'claimedGoalCount': 59, 'exitCode': 0},
    'T3PreparedSourceCounts': receipt['counts'],
    'T3PreparedActiveOutputTargets': [r['rootAdoptionTargetPath'] for r in plan['boundedSourceOutputs']],
    'sourceScopeDelta': {'DE-SH/SekII/GK': [163, 164], 'DE-SH/SekII/LK': [169, 170],
                         'addedGoalId': '6966df95-f125-5ecc-af8e-0442545d9f17'},
    'newGoalCountsOrEdgesRequired': False,
    'requiredFullBuildsOrReviewsExecutedByThisTechnicalAudit': False,
})
print(json.dumps({'frozenGroups': len(groups), 'ownedEntries': len(owned_paths),
                  'ignoredNativeFiles': len(native), 'thirdPartySourceCopies': len(third_party),
                  'missingActiveClaimFiles': missing_claim_files, 'untrackedActiveClaimFiles': untracked_claim_files}))
