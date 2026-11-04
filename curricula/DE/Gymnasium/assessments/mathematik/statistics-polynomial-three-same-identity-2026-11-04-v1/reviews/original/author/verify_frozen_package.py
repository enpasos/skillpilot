"""Verify the finite freeze without changing any file."""
from pathlib import Path
from hashlib import sha256
import json

H=Path(__file__).resolve().parent
handoff=json.loads((H/'content-review-handoff.json').read_text())
mp=H/handoff['manifest']['path']
assert sha256(mp.read_bytes()).hexdigest()==handoff['manifest']['sha256']
manifest=json.loads(mp.read_text())
for item in manifest['files']:
 p=H/item['path']
 assert p.is_file() and p.stat().st_size==item['bytes'] and sha256(p.read_bytes()).hexdigest()==item['sha256'],item['path']
print(json.dumps({'status':'PASS_FROZEN_BYTES','files':len(manifest['files']),'manifestSha256':handoff['manifest']['sha256'],'independentApproval':False}))
