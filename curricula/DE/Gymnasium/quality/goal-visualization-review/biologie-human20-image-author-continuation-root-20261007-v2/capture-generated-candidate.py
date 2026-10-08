# SPDX-License-Identifier: Apache-2.0
"""Preserve an actual tool PNG and its exact request; this grants no approval."""
import hashlib
import json
import shutil
import struct
import sys
from pathlib import Path

own = Path(__file__).resolve().parent
root = own.parents[5]
request_path = Path(sys.argv[1]).resolve()
request = json.loads(request_path.read_text())
source = Path(request['actualToolSourcePath'])
assert source.is_file(), source
assert '/.codex/generated_images/' in str(source)
target = own / 'candidates' / request['goalId'] / ('candidate-v' + str(request['version']) + '.png')
assert not target.exists(), 'Historical candidates must remain unchanged'
target.parent.mkdir(parents=True, exist_ok=True)
data = source.read_bytes()
assert data[:8] == b'\x89PNG\r\n\x1a\n'
width, height = struct.unpack('>II', data[16:24])
assert width >= 1500 and 1.70 <= width / height <= 1.85
shutil.copyfile(source, target)
assert target.read_bytes() == data
def binding(path):
    return {'path': str(path.relative_to(root)) if path.is_relative_to(root) else str(path),
            'sha256': hashlib.sha256(path.read_bytes()).hexdigest(), 'bytes': path.stat().st_size}
provenance = {
    'schemaVersion': 1, 'artifactKind': 'actual-imagegen-generation-provenance',
    'role': 'image-author', 'goalId': request['goalId'], 'version': request['version'],
    'provider': 'ChatGPT/Codex builtin image_gen', 'servingModel': 'not exposed by tool',
    'source': binding(source), 'candidate': binding(target), 'actualRequest': binding(request_path),
    'png': {'width': width, 'height': height, 'aspectRatio': width / height},
    'toolOutputHint': request['actualToolOutputHint'],
    'generationIsNotApproval': True, 'independentReview': 'pending',
    'humanApproved': False, 'newStrictCompletions': 0, 'localSourceRetained': True,
}
output = target.parent / ('generation-v' + str(request['version']) + '.actual.provenance.json')
with output.open('x') as stream:
    stream.write(json.dumps(provenance, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'candidate': provenance['candidate'], 'provenance': binding(output), 'png': provenance['png']}))
