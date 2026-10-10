"""Confirm whole original PDF page text and the actual 96 dpi review pixels."""
import fitz
import hashlib
import json
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'
OLD = OWN.parent / 'biologie-health-twelve-source-findings-targeted-author-successor-20261010-v1'

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

rows = []
for r in json.loads((AUTHOR / 'primary/eight-whole-primary-pages-current-author.actual.json').read_text())['records']:
    pdf = ROOT / r['wholeOriginalPdf']['path']
    text = ROOT / r['wholeText']['path']
    png = ROOT / r['wholeRaster']['path']
    assert binding(pdf) == r['wholeOriginalPdf']
    page = fitz.open(pdf)[r['physicalPageOneBased'] - 1]
    assert page.get_text() == text.read_text()
    pix = page.get_pixmap(dpi=96, alpha=False)
    fresh = Image.frombytes('RGB', [pix.width, pix.height], pix.samples)
    viewed = Image.open(png).convert('RGB')
    assert viewed.size == fresh.size
    assert ImageChops.difference(viewed, fresh).getbbox() is None
    rows.append({'sourceDocumentKey': r['sourceDocumentKey'], 'physicalPageOneBased': r['physicalPageOneBased'], 'pdf': binding(pdf), 'text': binding(text), 'viewedRaster': binding(png), 'wholeOriginalPageTextExact': True, 'wholeRerendered96dpiPixelsExact': True, 'firstWholeTextAndPixelInspectionRetained': True})

bio12 = set(json.loads((AUTHOR / 'sources/whole-current-direct-witnesses-and-actual-primaries.neutral.json').read_text())['goalIds'])
counts = []
for cfgpath in [OLD / 'sources/after394-atlas.targeted-source.normal.config.json', AUTHOR / 'sources/current394-six-resolution.normal.config.json']:
    cfg = json.loads(cfgpath.read_text())
    counts.append(sum(m['canonicalGoalId'] in bio12 for p in cfg['mappingPaths'] for m in json.loads((ROOT / p).read_text())['mappings']))
assert counts == [182, 180]
result = {'schemaVersion': 1, 'role': 'Independent actual whole-primary text/raster confirmation after FIRST', 'primaryPageCount': 8, 'primaryPages': rows, 'renderDpi': 96, 'allPrimaryPdfTextsAndRasterPixelsExact': True, 'bio12DirectMappingRecordsBefore': 182, 'bio12DirectMappingRecordsAfter': 180, 'initialScaleInferenceProbeRetained': binding(OWN / 'checks/actual-primary-pdf-text-and-direct-source-counts.json'), 'probeExplanation': 'Inferring a renderer scale from rounded pixel width changes the matrix. Explicit actual 96 dpi rendering reproduces every viewed raster pixel exactly.', 'humanApproved': 0, 'strictGain': 0, 'activeWrites': []}
path = OWN / 'checks/actual-primary-pages96dpi-and-direct-source-counts.json'
path.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
json.loads(path.read_text())
print(json.dumps({'wholePrimaryPagesTextAnd96dpiPixelsExact': 8, 'bio12DirectRecordsBefore': 182, 'bio12DirectRecordsAfter': 180, 'strictGain': 0, 'humanApproved': 0}))
