from pathlib import Path
import concurrent.futures
import datetime
import hashlib
import json
import urllib.request
from bs4 import BeautifulSoup

own = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-next-molecular-genetics-twenty-three-preparation-a-v1')
primary = own / 'primary-routing-context'
primary.mkdir(exist_ok=False)
sources = [
    ('BY12-EA', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/erhoeht'),
    ('BY12-GA', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/12/biologie/grundlegend'),
    ('BY9', 'https://www.lehrplanplus.bayern.de/fachlehrplan/gymnasium/9/biologie'),
]

def fetch(source):
    key, url = source
    at = datetime.datetime.now(datetime.timezone.utc).isoformat()
    req = urllib.request.Request(url, headers={'User-Agent': 'SkillPilot-neutral-curriculum-read/1.0'})
    with urllib.request.urlopen(req, timeout=40) as response:
        data = response.read()
        status = response.status
        final_url = response.url
    html_path = primary / (key + '.actual-official.html')
    with html_path.open('xb') as out:
        out.write(data)
    soup = BeautifulSoup(data, 'html.parser')
    for e in soup(['script', 'style']):
        e.decompose()
    text = soup.get_text('\n', strip=True)
    path = primary / (key + '.actual-official.full-text.txt')
    with path.open('x', encoding='utf-8') as out:
        out.write(text + '\n')
    return {'key': key, 'url': url, 'resolvedUrl': final_url, 'retrievedAt': at, 'httpStatus': status, 'htmlPath': str(html_path), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'fullTextPath': str(path)}

with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
    records = list(pool.map(fetch, sources))
with (own / 'three-actual-primary-routing-contexts.receipt.json').open('x', encoding='utf-8') as out:
    json.dump({'schemaVersion': 1, 'role': 'Read-only actual official primary context acquisition for next package preparation; no source coverage approval', 'records': records, 'sourceApproval': False, 'humanApproval': False, 'activeWrites': []}, out, ensure_ascii=False, indent=2)
    out.write('\n')
print(json.dumps(records, indent=2))
