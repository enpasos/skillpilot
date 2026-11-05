"""Local candidate reproducibility, contents and immutable imported-release guard."""
from hashlib import sha256
from pathlib import Path
import subprocess
import sys
from zipfile import ZipFile

root = Path(__file__).resolve().parents[1]
repo = root.parents[2]
original = root / 'artifacts/skillpilot-coach-v1-0.1.0.zip'
expected = '2a5f5de47cd04345196cd21f0ab4dc4e0b3247b509a9deaaa0e2f8cd74d30a40'
assert sha256(original.read_bytes()).hexdigest() == expected
subprocess.run([sys.executable, '-B', str(root / 'scripts/prepare_candidate.py')], check=True, capture_output=True)
output = repo / 'tmp/gemini-learning-units-candidate/skillpilot-coach-v1-0.2.0.zip'
first = output.read_bytes()
subprocess.run([sys.executable, '-B', str(root / 'scripts/prepare_candidate.py')], check=True, capture_output=True)
assert output.read_bytes() == first
with ZipFile(output) as archive:
    assert archive.namelist() == ['SKILL.md', 'LICENSE.txt']
    assert archive.read('SKILL.md') == (root / 'candidates/0.2.0/SKILL.md').read_bytes()
    assert archive.read('LICENSE.txt') == (repo / 'LICENSE').read_bytes()
with ZipFile(original) as archive:
    assert archive.read('SKILL.md') == (root / 'SKILL.md').read_bytes()
assert sha256(original.read_bytes()).hexdigest() == expected
print('Gemini 0.2.0 candidate: deterministic ZIP, exact source/license contents, preserved tested 0.1.0 release.')
