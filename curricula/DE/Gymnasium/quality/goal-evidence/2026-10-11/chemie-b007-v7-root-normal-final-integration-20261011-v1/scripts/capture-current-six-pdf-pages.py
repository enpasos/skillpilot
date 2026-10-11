#!/usr/bin/env python3
"""Rasterize complete selected pages of the unchanged normal renderer's PDF.

Capture is an inspection input, never a visual or scientific approval.
"""
import datetime
import hashlib
import json
import pathlib
import subprocess

BASE = pathlib.Path(__file__).resolve().parent.parent
CHECK = BASE / 'complete6-current-final-page-bindings.actual.json'
PDF = pathlib.Path('app/public/lernzielbuch/de-gym-chemie-bundesweit.pdf').resolve()
OUT = BASE / 'captures/pdf'
OUT.mkdir(parents=True, exist_ok=True)
inputs = json.loads(CHECK.read_text())

def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()

rows = []
for item in inputs['rows']:
    prefix = OUT / item['goalId']
    subprocess.run([
        'pdftoppm', '-f', str(item['physicalPDFPage']),
        '-l', str(item['physicalPDFPage']), '-r', '110', '-singlefile',
        '-png', str(PDF), str(prefix),
    ], check=True, capture_output=True)
    capture = prefix.with_suffix('.png')
    rows.append({**item, 'pdfCapture': {
        'path': str(capture.relative_to(pathlib.Path.cwd())),
        'sha256': digest(capture),
    }})
    print(f"Captured physical PDF page {item['physicalPDFPage']}: {item['goalId']}", flush=True)

receipt = {
    'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Complete actual PDF-page raster inputs for subsequent pixel inspection',
    'sourcePDF': {'path': str(PDF.relative_to(pathlib.Path.cwd())), 'sha256': digest(PDF)},
    'selection': {'path': str(CHECK.relative_to(pathlib.Path.cwd())), 'sha256': digest(CHECK)},
    'pdfRasterDpi': 110,
    'rows': rows,
    'actualPixelInspectionStillRequired': True,
    'scientificApproval': False,
    'humanApproval': False,
}
(BASE / 'complete6-current-pdf-capture-bindings.actual.json').write_text(
    json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
print('All 6 complete PDF pages captured. Actual viewing remains required.', flush=True)
