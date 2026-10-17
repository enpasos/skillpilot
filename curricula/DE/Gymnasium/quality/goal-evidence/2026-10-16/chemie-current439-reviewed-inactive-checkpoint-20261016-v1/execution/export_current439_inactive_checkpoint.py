"""Preserve a finite work checkpoint; never activate chemistry candidates."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import os
import subprocess

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
PREVIOUS = R / E / 'chemie-current438-reviewed-inactive-checkpoint-20261016-v1'
OUT = R / E / 'chemie-current439-reviewed-inactive-checkpoint-20261016-v1'
PACKAGES = '''
HE-LK413-optional-source-and-retained-crossstage-author-successor-v2
HE-LK413-optional-source-and-retained-target-independent-a-v2
HE-413-source-admission-current-independent-b-v1
root-fuel-comparison-prior-author-v1
fuel-comparison-narrow-acquisition-independent-a-v1
root-fuel-comparison-prior-independent-b-v1
HE-G9-F03-one-coherent-solubility-crystallisation-investigation-author-candidate-v1
HE-G9-F03-current-independent-a-v1
HE-G9-F03-current-independent-b-v1
F03-image-author-v1
F03-image-current-independent-a-v1
equilibrium-polarity-two-prior-bounded-author-candidate-v1
equilibrium-polarity-two-prior-independent-a-v1
BB-BE-eleven-crossstage-LK-acquisition-view-only-author-successor-v1
BB-BE-eleven-crossstage-LK-independent-a-v1
BB-BE-LK-eleven-prior-boundary-independent-b-v1
BB-BE-four-crossstage-prerequisite-source-author-successor-v1
BB-BE-four-existing-acquisition-source-independent-a-v1
BB-BE-four-existing-acquisition-source-independent-b-v1
BB-BE-remaining-seven-prior-interface-author-successor-v1
eight-prior-successors-and-pressure-extension-independent-a-v1
BW-lab-aggregate-existing-child-acquisition-author-v1
BW-lab-aggregate-two-views-independent-a-v1
BW-lab-aggregate-two-views-independent-b-v1
generic-SekI-fourteen-interface-author-candidate-v1
generic-SekI-two-priors-three-views-independent-a-v1
generic-SekI-two-priors-three-views-independent-b-v1
new459-F03-native2-fresh-description-a-v1
new459-F03-native2-fresh-description-b-v1
new459-F03-native2-fresh-description-b2-v1
native20-jurisdiction-content-only-own-first-inputs-v2-complete
native20-jurisdiction-context-independent-a-v1
native20-jurisdiction-context-independent-b-v1
native20-jurisdiction-actual-PDF-pages
post-generic641-D439-context-measurement-only-v1
actual-applied-L6-generic-two-priors-P2-stock-check-v1
actual641-jurisdiction-only-private-L6-root-apply-v1
applicability641-jurisdiction-sync-technical-a-v1
actual-finalize-native-new-two-current439-root-v1
native20-current-jurisdiction-only-preparation-actual-v1
current39-direct-prerequisite-role-inventory-independent-b-v1
current39-runtime-significance-and-26-view-patterns-independent-b-v1
BB-BE-GK-two-foundations-source-acquisition-author-basis-v1
BB-BE-eleven-existing9fef-prior-acquisition-boundary-readonly-v1
'''.split()
L6_PACKAGES = '''
chemie-current438-paired413-and-fuel-private-L6-technical-20261016-v1
chemie-current439-paired-F03-private-L6-technical-20261016-v1
chemie-current439-paired-two-priors-and-BB-BE-LK-private-L6-technical-20261016-v1
chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1
chemie-current439-new459-and-F03-native-two-private-L6-technical-20261016-v1
chemie-current439-stable-jurisdiction-only-first20-private-L6-technical-20261016-v1
'''.split()
ROOT_FILES = '''
EXECUTION.actual-paired413-and-fuel-private-L6.integration.receipt.json
EXECUTION.actual-paired-F03-private-L6.integration.receipt.json
EXECUTION.actual-paired-two-priors-and-LK-views-private-L6.receipt.json
EXECUTION.actual-paired-generic-SekI-NI-private-L6.receipt.json
EXECUTION.actual-paired-two-BW-aggregate-roles-private-L6.receipt.json
ROOT.actual-two-new-D-complete.current439-progress-20261016.json
INPUTS.actual-new459-F03-native-two-scoped-no-whole-freeze.json
INPUTS.prepared-stable-jurisdiction-only-first20-scoped.json
RECEIPT.native20-frozen-reviewer-capsule.actual.json
apply_paired_413_and_fuel_private_L6.py
apply_paired_F03_private_L6.py
apply_paired_two_priors_and_LK_views_private_L6.py
apply_paired_generic_seki_and_ni_private_L6.py
finalize_actual_native_new_two_439.py
prepare_content_only_native20_jurisdiction_packet.py
CHECK.actual-L6-assessment-jurisdiction-regression.after-complete-paired-apply.actual.txt
export_current439_inactive_checkpoint.py
'''.split()

def sha(data):
    return hashlib.sha256(data).hexdigest()

records, omitted, reused = [], [], []
old = json.loads((PREVIOUS / 'MANIFEST.inactive-current438.json').read_text())
old_by_path = {x['originalPath']: x for x in old['files']}

def put(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    if path.exists():
        assert path.read_bytes() == data, f'Checkpoint collision: {path}'
    else:
        path.write_bytes(data)

def capture(source, destination, **extra):
    assert source.is_file() and not source.is_symlink(), source
    data = source.read_bytes()
    original = source.relative_to(R).as_posix()
    before = old_by_path.get(original)
    if before and before['sha256'] == sha(data):
        inherited = PREVIOUS / before['storedPath']
        assert inherited.read_bytes() == data
        reused.append({'originalPath': original, 'repositoryPath': inherited.relative_to(R).as_posix(),
                       'sha256': sha(data), 'bytes': len(data), **extra})
        return
    put(destination, data)
    records.append({'originalPath': original, 'storedPath': destination.relative_to(OUT).as_posix(),
                    'sha256': sha(data), 'bytes': len(data), **extra})

def capture_tree(base, destination):
    assert base.is_dir() and not base.is_symlink(), base
    for directory, dirs, files in os.walk(base, followlinks=False):
        dirs[:] = sorted(d for d in dirs if d not in ('__pycache__', 'runtime-tmp')
                         and not (Path(directory) / d).is_symlink())
        for name in sorted(files):
            source = Path(directory) / name
            assert not source.is_symlink(), source
            if source.suffix == '.pyc':
                continue
            full_official_text = (name in ('seki.official.layout.txt', 'sekii.official.layout.txt',
                                         'NI-KC2022.actual.txt', 'BB-upper-secondary.txt',
                                         'BE-upper-secondary.txt', 'BB-lower-secondary.txt',
                                         'BE-lower-secondary.txt') or name.endswith('actual-official.txt'))
            if source.suffix.lower() in ('.html', '.pdf') or full_official_text:
                data = source.read_bytes()
                omitted.append({'originalPath': source.relative_to(R).as_posix(),
                                'sha256': sha(data), 'bytes': len(data),
                                'reason': 'Local full official cache/text or generated PDF; bounded inspected pages and structured references retained.'})
                continue
            capture(source, destination / source.relative_to(base))

for package in PACKAGES:
    capture_tree(T / package, OUT / 'evidence' / package)
for name in ROOT_FILES:
    capture(T / name, OUT / 'execution' / name)
for package in L6_PACKAGES:
    capture_tree(L / E / package, OUT / 'candidate-delta' / E / package)

candidate_paths = {x['candidatePath'] for x in old['files'] if 'candidatePath' in x}
for name in ('de-de-gym-seki-chemistry', 'de-ni-gk', 'de-ni-lk', 'de-bw-gk', 'de-bw-lk'):
    candidate_paths.add(f'curricula/DE/Gymnasium/composition-views/chemie/{name}.view.json')
candidate_paths.update({
    'curricula/DE/Gymnasium/input/HE/lower-secondary/source-extraction/DE_HE_CHEMIE_SEKI_G9.source-extraction.json',
    'curricula/DE/Gymnasium/mapping/DE-HE/lower-secondary/hessen_chemistry_lower_secondary_source_extraction_to_canonical_chemistry.review.json',
})
image_dir = 'curricula/DE/Gymnasium/visualizations/chemie/8b2d351e-e44f-5385-9b89-13ef54b5918f'
candidate_paths.update((L / image_dir / n).relative_to(L).as_posix() for n in ('prompt.de.md', '8b2d351e-e44f-5385-9b89-13ef54b5918f.png'))
for relative in sorted(candidate_paths):
    source = L / relative
    before = next((x for x in old['files'] if x.get('candidatePath') == relative), None)
    if before:
        prior = PREVIOUS / before['storedPath']
        if source.read_bytes() == prior.read_bytes():
            continue
    elif (R / relative).is_file() and (R / relative).read_bytes() == source.read_bytes():
        continue
    capture(source, OUT / 'candidate-delta' / relative, candidatePath=relative,
            previousSha256=before['sha256'] if before else sha((R / relative).read_bytes()) if (R / relative).is_file() else None)

canonical = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
assert sha((L / canonical).read_bytes()) == 'ae53884b26285d9483b315f030216566b74fb7067e9fc962610e493aadeb3fb2'
manifest = {
    'role': 'Exact-byte inactive 439-goal chemistry checkpoint; continuation inputs, not a release or full M7 result',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'baseGitCommit': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=R, text=True).strip(),
    'previousCheckpoint': PREVIOUS.relative_to(R).as_posix(),
    'normalChemistrySha256': sha((R / canonical).read_bytes()),
    'candidateCanonicalSha256': sha((L / canonical).read_bytes()),
    'candidateWholeGoals': 641, 'candidateCurricularAtomicGoals': 439, 'candidatePRecords': 439,
    'currentL6CentralResult': None, 'activeNetNewStrictClosures': 0,
    'newStrictDescriptionCompletions': 2, 'native20CentralFinalization': 'pending; two sealed independent reviews validated',
    'eightRequiresSuccessorStatus': 'inactive; independent A only; 19 newly opened acquisition contexts remain HOLD',
    'open': ['Final current439 central report, CQR-303, Layer-A and M7 not completed.',
             'Other changed description contexts require current paired bindings.',
             'Existing kind-aware composition errors, course/source/memory acquisition gaps remain open.',
             'BB/BE four-view candidate not integrated: precise whole-pV source or paired bounded-extension decision pending.',
             'Eight requires successors not integrated: independent B and 19 legitimate acquisition repairs pending.',
             'Latest complete APV predates the final view/prior edits; one bundled final compilation remains required.'],
    'pathResolution': 'Original paths and historical receipts retain exact bytes. Resolve originalPath through this manifest, reused files and previous checkpoint. Relative scratch references are provenance, not executable active-tree instructions.',
    'files': records, 'reusedPreviousFiles': reused, 'omittedLocalCaches': omitted,
    'activation': False, 'HumanApproval': False, 'HumanTrial': False, 'M7Claim': False,
}
put(OUT / 'MANIFEST.inactive-current439.json', (json.dumps(manifest, ensure_ascii=False, indent=2) + '\n').encode())
print(json.dumps({'files': len(records), 'reused': len(reused), 'bytes': sum(x['bytes'] for x in records),
                  'omitted': len(omitted), 'candidateDelta': sum('candidatePath' in x for x in records)}))
