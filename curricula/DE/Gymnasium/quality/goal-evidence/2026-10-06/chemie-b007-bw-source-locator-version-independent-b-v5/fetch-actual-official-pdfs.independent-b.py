"""Read-only HTTPS retrieval into this independent source review dossier."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import json
import requests

OWN = Path(__file__).resolve().parent
SOURCES = OWN / 'sources'
SOURCES.mkdir(exist_ok=True)
PREFIX = 'https://www.bildungsplaene-bw.de/site/bildungsplan-rebrush2024/get/documents/lsbw/export-pdf/depot-pdf/ALLG/'
URLS = [('actual-official-V2.pdf', PREFIX + 'BP2016BW_ALLG_GYM_CH.V2%20(2022-03-25).pdf'), ('actual-old-active-url-2016.pdf', PREFIX + 'BP2016BW_ALLG_GYM_CH.pdf')]

def fetch(pair):
    name, url = pair
    response = requests.get(url, timeout=45)
    response.raise_for_status()
    assert response.content.startswith(b'%PDF-'), (url, response.headers.get('Content-Type'))
    path = SOURCES / name
    path.write_bytes(response.content)
    return {'requestedURL': url, 'actualResponseURL': response.url, 'retrievedAtUTC': datetime.now(timezone.utc).isoformat(), 'httpStatus': response.status_code, 'contentType': response.headers.get('Content-Type'), 'path': str(path.relative_to(Path.cwd())), 'sha256': hashlib.sha256(response.content).hexdigest(), 'bytes': len(response.content), 'redirects': [{'status': r.status_code, 'url': r.url} for r in response.history]}

with ThreadPoolExecutor(max_workers=2) as pool:
    receipts = list(pool.map(fetch, URLS))
(OWN / 'actual-official-https-pdf-retrieval.independent-b.json').write_text(json.dumps({'schemaVersion': 1, 'role': 'Independent B actual official HTTPS retrieval, no author/peer verdict used', 'receipts': receipts, 'newPeerAuditRead': False, 'activeWrites': False}, ensure_ascii=False, indent=2) + '\n')
for record in receipts:
    print(json.dumps(record, ensure_ascii=False))
