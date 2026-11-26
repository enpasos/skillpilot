#!/usr/bin/env python3
"""Reconstruct exact historical v1 input bytes in an otherwise empty scratch root."""
from pathlib import Path
import argparse
import hashlib
import json
import subprocess

ap = argparse.ArgumentParser(description=__doc__)
ap.add_argument('--repo', required=True, type=Path)
ap.add_argument('--seed-script', required=True, type=Path)
ap.add_argument('--output-root', required=True, type=Path)
a = ap.parse_args()
repo, source, output = a.repo.resolve(), a.seed_script.resolve(), a.output_root.resolve()
base = '284063239db536f4b765d700db3a39a357fd7f12'
assert not output.is_relative_to(repo), 'Recovery must be outside the working checkout'
assert not output.exists() or not any(output.iterdir()), 'Use a new empty recovery directory'
assert hashlib.sha256(source.read_bytes()).hexdigest() == 'bc1ceb18cdea4c7fb1c9a68df160d30a7459af93c4d10146e3a004a9201a2709', 'Seed source bytes differ'
expected = {
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json': 'c86a650ae8859ede14c3c0c6342b6a35e633f1b850bd9a3c4a9dd1c6e51c564b',
    'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.de.json': '5d5870f7905051e050f0f0111d1eee0967a63d4e1a599a2f60b8998a93af6156',
    'curricula/DE/Gymnasium/memory-decks/de_gymnasium_physics_flashcards_mechanics_ephase.en.json': '7621f339271f6c5b5f108cac4726f7794bedb5f873a29d31c7a6b20544f2b682',
}
for path in [*expected, 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json']:
    target = output / path
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_bytes(subprocess.check_output(['git', 'show', base + ':' + path], cwd=repo))
subprocess.run(['python3', str(source)], cwd=output, check=True)
for path, digest in expected.items():
    assert hashlib.sha256((output / path).read_bytes()).hexdigest() == digest, 'Recovered bytes do not match original record: ' + path
print(json.dumps({'contract': 'physics-e2-energy-historical-seed-recovery-v1', 'baselineCommit': base, 'exactRecoveredOrigins': len(expected), 'originalWorkspaceLocationClaimed': False}))
