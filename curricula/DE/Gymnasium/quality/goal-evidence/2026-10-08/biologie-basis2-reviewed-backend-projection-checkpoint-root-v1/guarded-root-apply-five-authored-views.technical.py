# SPDX-License-Identifier: Apache-2.0
"""Actual reviewed source-scope view completion; default prints a read-only plan."""
import argparse, hashlib, json, os, tempfile
from pathlib import Path
from datetime import datetime, timezone
ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent

def bind(p):
    p = Path(p); raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

parser = argparse.ArgumentParser(); parser.add_argument('--apply', action='store_true'); args = parser.parse_args()
guard = json.loads((OWN / 'five-authored-view-candidates.before-after.guard.json').read_text())
proof = json.loads((OWN / 'actual-normal-loader-before-after-96-scopes.proof.json').read_text())
assert proof['rowCount'] == 96 and proof['allOldAtomicTargetsRetained'] and proof['allSekIIGKAndLKTargetsUnchanged']
for op in guard['operations']:
    assert bind(ROOT / op['destination'])['sha256'] == op['beforeActiveSha256']
    assert (ROOT / op['destination']).read_bytes() == (ROOT / op['before']['path']).read_bytes()
    assert bind(ROOT / op['candidate']['path']) == op['candidate']
print(json.dumps({'schemaVersion': 1, 'operations': guard['operations'], 'actualBackendProjectionProof': bind(OWN / 'actual-normal-loader-before-after-96-scopes.proof.json'), 'activeWrites': 0, 'applyRequested': args.apply, 'runtimeCompilerOrFallbackChanged': False, 'newScientificReview': False, 'humanApproval': False}, ensure_ascii=False, indent=2))
if not args.apply: raise SystemExit(0)
receipt = OWN / 'root-five-authored-views-guarded-apply.actual.json'; assert not receipt.exists()
for op in guard['operations']:
    destination = ROOT / op['destination']
    with tempfile.NamedTemporaryFile(dir=destination.parent, prefix='.reviewed-biology-view-', delete=False) as out:
        temp = Path(out.name); out.write((ROOT / op['candidate']['path']).read_bytes())
    try: os.chmod(temp, 0o644); os.replace(temp, destination)
    finally: temp.unlink(missing_ok=True)
    assert bind(destination)['sha256'] == op['candidate']['sha256']
receipt.write_text(json.dumps({'schemaVersion': 1, 'appliedAtUtc': datetime.now(timezone.utc).isoformat(), 'actualFiveViewBindings': [bind(ROOT / op['destination']) for op in guard['operations']], 'normalJUnit42ScopeChecks': 'PENDING', 'machineStrictGainClaimed': 0, 'runtimeCompilerChanges': False, 'humanApproval': False}, ensure_ascii=False, indent=2) + '\n')
