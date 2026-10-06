"""Apache-2.0. Fetch bounded official SH author-preparation inputs only."""
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import urllib.request

DEST = Path(__file__).resolve().parent
REQUESTS = [
    ("official-sh-biology-portal.actual.html", "https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html"),
    ("official-sh-biology-2026.actual.pdf", "https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html?cid=17928&file=files%2FFachanforderungen+und+Leitf%C3%A4den%2FSekundarstufe%2FFachanforderungen%2FFachanforderungen+Biologie+Sekundarstufe+%282026%29.pdf"),
    ("official-sh-biology-2023.actual.pdf", "https://fachportal.lernnetz.de/sh/faecher/biologie/fachanforderungen.html?cid=29947&file=files%2FFachanforderungen+und+Leitf%C3%A4den%2FSekundarstufe%2FFachanforderungen%2FFachanforderungen+Biologie+Sekundarstufe+%282023%2C+barrierearm%29.pdf"),
]


def fetch(entry):
    filename, url = entry
    request = urllib.request.Request(url, headers={"User-Agent": "SkillPilot author-preparation primary-source fetch"})
    with urllib.request.urlopen(request, timeout=40) as response:
        data = response.read(12_000_001)
        if len(data) > 12_000_000:
            raise ValueError("bounded primary-source response exceeded 12MB")
        if filename.endswith(".pdf") and not data.startswith(b"%PDF-"):
            raise ValueError(f"Not a PDF response for {filename}")
        if filename.endswith(".html") and b"2026/27" not in data:
            raise ValueError("Portal response omitted expected transition")
        record = {
            "urlRequested": url,
            "urlResolved": response.geturl(),
            "httpStatus": response.status,
            "contentType": response.headers.get("Content-Type"),
            "readAtUtc": datetime.now(timezone.utc).isoformat(),
            "localFile": filename,
            "byteLength": len(data),
            "sha256": hashlib.sha256(data).hexdigest(),
            "method": "Python urllib HTTPS fetch; retained exact response body",
        }
    (DEST / filename).write_bytes(data)
    return record


if __name__ == "__main__":
    with ThreadPoolExecutor(max_workers=3) as pool:
        records = list(pool.map(fetch, REQUESTS))
    (DEST / "official-primary-fetch.actual.receipt.json").write_text(
        json.dumps({"schemaVersion": 1, "role": "author-preparation; not independent review", "files": records}, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(json.dumps(records, ensure_ascii=False, indent=2))
