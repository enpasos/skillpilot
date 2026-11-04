"""Read-only check of the one finite author freeze."""
from pathlib import Path
from hashlib import sha256
import json
H=Path(__file__).resolve().parent
handoff=json.loads((H/'content-review-handoff.json').read_text());p=H/handoff['manifest']['path']
assert sha256(p.read_bytes()).hexdigest()==handoff['manifest']['sha256']
rows=json.loads(p.read_text())['files']
for row in rows:
 p=H/row['path'];assert p.stat().st_size==row['bytes'] and sha256(p.read_bytes()).hexdigest()==row['sha256'],row['path']
print(json.dumps({'status':'PASS_FROZEN_BYTES','files':len(rows),'independentApproval':False,'activation':False}))
