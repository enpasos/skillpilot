#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Capture actual completed builtin image output as an inert author candidate."""
from pathlib import Path
import hashlib, json, shutil, struct, sys

own = Path(__file__).resolve().parent
sequence = int(sys.argv[1])
source = Path(sys.argv[2]).resolve(strict=True)
assert source.is_relative_to(Path('/home/enpasos/.codex/generated_images'))
plan = json.loads((own / 'twenty-exact-production-prompts.author.json').read_text())
entry = next(row for row in plan['prompts'] if row['sequence'] == sequence)
target = own / 'candidates' / entry['goalId'] / 'candidate-v1.png'
target.parent.mkdir(parents=True, exist_ok=True)
assert not target.exists(), 'Preserve existing candidates; use a new revision for another image.'
data = source.read_bytes()
assert data[:8] == b'\x89PNG\r\n\x1a\n'
width, height = struct.unpack('>II', data[16:24])
shutil.copyfile(source, target)
assert target.read_bytes() == data
receipt = {
    'sequence': sequence, 'goalId': entry['goalId'],
    'originalGeneratedPath': str(source), 'candidatePath': str(target.relative_to(own)),
    'sha256': hashlib.sha256(data).hexdigest(), 'width': width, 'height': height,
    'promptPath': entry['goalId'] + '.prompt.md',
    'promptSha256': hashlib.sha256((own / (entry['goalId'] + '.prompt.md')).read_bytes()).hexdigest(),
    'provider': 'OpenAI ChatGPT/Codex built-in image_gen',
    'exactServingImageModel': 'not exposed by tool',
    'sourceOriginalRetained': True, 'authorCandidateOnly': True,
    'independentApproval': 'pending', 'humanApproval': False, 'strictGain': 0,
}
with (target.parent / 'generation.actual.provenance.json').open('x') as handle:
    handle.write(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print(json.dumps(receipt, ensure_ascii=False))
