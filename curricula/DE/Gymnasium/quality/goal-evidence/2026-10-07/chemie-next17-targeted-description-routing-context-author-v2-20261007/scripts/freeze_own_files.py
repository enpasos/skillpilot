#!/usr/bin/env python3
"""Create a one-time dossier freeze, or verify it read-only with --check."""
import hashlib
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
MANIFEST = OUT / 'final-own-files.freeze.json'

def entries():
    result = []
    for path in sorted(OUT.rglob('*')):
        if not path.is_file() or path == MANIFEST:
            continue
        b = path.read_bytes()
        result.append({'path': path.relative_to(OUT).as_posix(), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)})
    return result

if sys.argv[1:] == ['--check']:
    expected = json.loads(MANIFEST.read_text())
    actual = entries()
    assert actual == expected['files'], 'Frozen dossier differs or has added/removed files'
    print(json.dumps({'status': 'PASS', 'files': len(actual), 'bytes': sum(e['bytes'] for e in actual), 'manifestSha256': hashlib.sha256(MANIFEST.read_bytes()).hexdigest()}))
else:
    assert not MANIFEST.exists(), 'Refusing to overwrite sealed manifest'
    files = entries()
    value = {
        'documentType': 'Final own-file freeze of new inert AUTHOR v2 candidate; excludes only this self-referential manifest',
        'sealedAtUTC': datetime.now(timezone.utc).isoformat(),
        'role': 'AUTHOR', 'authority': 'ai_candidate', 'status': 'needs_human_review',
        'strictNetGain': 0, 'independentApproval': False, 'humanApproval': False,
        'fileCount': len(files), 'totalBytes': sum(e['bytes'] for e in files), 'files': files,
        'nextGate': 'Separate independent review by Root/independentB of exactly these candidate inputs; no active integration implied.',
    }
    MANIFEST.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'fileCount': len(files), 'totalBytes': value['totalBytes'], 'manifestSha256': hashlib.sha256(MANIFEST.read_bytes()).hexdigest()}))
