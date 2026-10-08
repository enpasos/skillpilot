# SPDX-License-Identifier: Apache-2.0
"""Detach local review hardlinks from mutable frontend image outputs.

The ordinary build correctly refuses aliases. Preserve every byte and leave
the linked immutable review inputs intact; change only the mutable output inode.
"""
import hashlib
import json
import os
import shutil
import stat
import tempfile
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
receipt = OWN / 'ordinary-mutable-image-outputs-restored.actual.json'
assert not receipt.exists()
changed = []
for output in sorted((ROOT / 'app/public/assets/goal-visualizations').rglob('*')):
    metadata = output.lstat()
    assert not stat.S_ISLNK(metadata.st_mode), str(output)
    if not stat.S_ISREG(metadata.st_mode) or metadata.st_nlink == 1:
        continue
    before = hashlib.sha256(output.read_bytes()).hexdigest()
    descriptor, temporary = tempfile.mkstemp(prefix='.ordinary-output-', dir=output.parent)
    os.close(descriptor)
    try:
        shutil.copyfile(output, temporary)
        os.chmod(temporary, stat.S_IMODE(metadata.st_mode) | stat.S_IWUSR)
        assert hashlib.sha256(Path(temporary).read_bytes()).hexdigest() == before
        os.replace(temporary, output)
    finally:
        if os.path.exists(temporary):
            os.unlink(temporary)
    assert output.stat().st_nlink == 1
    assert hashlib.sha256(output.read_bytes()).hexdigest() == before
    changed.append({'path': str(output.relative_to(ROOT)), 'sha256': before,
                    'bytes': metadata.st_size, 'previousLinkCount': metadata.st_nlink,
                    'currentLinkCount': 1, 'bytesChanged': False})
receipt.write_text(json.dumps({'schemaVersion': 1,
    'reason': 'Normal image build rejects aliases left by local isolated review copies',
    'outputs': changed, 'outputCount': len(changed),
    'immutableReviewInputBytesChanged': False, 'validatorChanges': False,
    'scientificApprovalClaim': False}, indent=2) + '\n')
print(json.dumps({'outputsRestored': len(changed), 'allBytesRetained': True}))
