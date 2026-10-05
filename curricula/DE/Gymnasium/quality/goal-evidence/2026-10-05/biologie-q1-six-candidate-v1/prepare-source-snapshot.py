#!/usr/bin/env python3
"""Read-only inventory; writes only into this candidate directory."""
import hashlib
import json
import pathlib
import subprocess
import urllib.request
from datetime import datetime, timezone

ROOT = pathlib.Path(__file__).resolve().parents[7]
OUT = pathlib.Path(__file__).resolve().parent
CONFIG = ROOT / 'curricula/DE/Gymnasium/quality/goal-description-review/biologie/rollout-v1/2026-10-04/m7-q1-genetics-open-remainder-six-current-20261004-v1.config.json'
IDS = json.loads(CONFIG.read_text())['goalIds']
CANONICAL = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json'
NOW = datetime.now(timezone.utc).isoformat()

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def read(p):
    return json.loads(p.read_text())

def save(name, obj):
    (OUT / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')

def entries(nodes):
    for node in nodes:
        if node.get('kind') == 'goalEntry':
            yield node
        yield from entries(node.get('children', []))

landscape = read(CANONICAL)
goals = {g['id']: g for g in landscape['goals']}
qa = read(ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
central = read(ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
biology = next(s for s in central['subjects'] if s['subject'] == 'biologie')
current_p = []
for path in biology['positiveEvidenceConfigPaths']:
    config = read(ROOT / path)
    for line in (ROOT / config['reviewPath']).read_text().splitlines():
        record = json.loads(line)
        if record['goalId'] in IDS:
            current_p.append({'configPath': path, 'record': record})
current_d = []
for path in biology['resolutionIndexPaths']:
    for r in read(ROOT / path).get('resolutions', []):
        if r['goalId'] in IDS:
            current_d.append({'indexPath': path, 'resolution': r})
save('current-six.snapshot.json', {
    'status': 'read_only_snapshot_not_gate_decision', 'capturedAt': NOW,
    'canonicalPath': str(CANONICAL.relative_to(ROOT)), 'canonicalSha256': digest(CANONICAL),
    'goalIds': IDS, 'goals': [goals[i] for i in IDS],
    'contextOnlyGoals': [goals[i] for i in ['e70d8a85-2dea-5165-919b-200fee9f4db4', '7975e43b-1187-5ae3-a1ab-282fc3c0548c', '99544494-1825-5fc1-8e23-56f0df808e56']],
    'visualizationQa': [r for r in qa['records'] if r['goalId'] in IDS],
    'registeredPositiveEvidenceMatches': current_p,
    'registeredDescriptionResolutionMatches': current_d,
    'protectedScope': 'Exactly six open original IDs; context goals are read for routing only.'
})

bindings = []
for p in sorted((ROOT / 'curricula/DE/Gymnasium/mapping').rglob('*biology*.review.json')):
    if 'source_extraction_to_canonical_biology' not in p.name:
        continue
    b = read(p)
    matching = [m for m in b.get('mappings', []) if m.get('canonicalGoalId') in IDS]
    if not matching:
        continue
    extraction_path = b.get('sourceExtractionPath')
    if not extraction_path:
        continue
    extraction = read(ROOT / extraction_path)
    source_goals = {g['id']: g for g in extraction.get('sourceGoals', [])}
    matched_ids = {m['legacyGoalId'] for m in matching}
    bindings.append({
        'mappingPath': str(p.relative_to(ROOT)), 'mappingSha256': digest(p),
        'sourceExtractionPath': extraction_path, 'sourceExtractionSha256': digest(ROOT / extraction_path),
        'sourceDocument': extraction.get('sourceDocument'),
        'mappings': matching,
        'sourceGoals': [source_goals[i] for i in sorted(matched_ids) if i in source_goals],
        'decisions': [d for d in b.get('decisions', []) if d.get('sourceGoalId') in matched_ids],
        'claimLimit': 'Current local binding snapshot only; exact/mapped labels do not certify this candidate or all source clauses.'
    })
views = []
for p in sorted((ROOT / 'app/scripts/config/goal-books/source-views/de-gym-biology-national-atlas').glob('*.view.json')):
    b = read(p)
    matching = [e for e in entries(b.get('rootNodes', [])) if e['goalId'] in IDS]
    if matching:
        views.append({'path': str(p.relative_to(ROOT)), 'sha256': digest(p), 'scope': b.get('scope'), 'entries': matching})
save('source-bindings.snapshot.json', {'capturedAt': NOW, 'status': 'inventory_not_source_approval', 'bindings': bindings, 'sourceViewPlacements': views})

sources = OUT / 'sources'
sources.mkdir(exist_ok=True)
url = 'https://kultus.hessen.de/sites/kultus.hessen.de/files/2025-10/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'
pdf = sources / 'he-biologie-official-current-20261005.pdf'
with urllib.request.urlopen(url) as response:
    pdf.write_bytes(response.read())
he_text = subprocess.run(['pdftotext', '-f', '38', '-l', '39', '-layout', str(pdf), '-'], check=True, capture_output=True, text=True).stdout
(sources / 'he-q1-printed-pages-38-39.txt').write_text(he_text)
save('sources/official-he.receipt.json', {
    'retrievedAt': NOW, 'url': url, 'sha256': digest(pdf),
    'localRetainedPdfPath': str(pdf.relative_to(ROOT)),
    'existingRepositoryPdfSha256': digest(ROOT / 'curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-biologie.pdf'),
    'edition': 'Ausgabe 2024, Stand 01.08.2025',
    'printedPages': [38, 39], 'pdfZeroBasedIndices': [37, 38],
    'distinction': 'HE source extraction contains authored paraphrases; the downloaded PDF supplies the actual official wording.'
})

page_selections = {'MV': [30], 'NI': [87, 89, 90], 'RP': [44, 45], 'SH': [29], 'SN': [42, 43], 'ST': [42, 43], 'TH': [28, 29]}
receipts = []
for state, pages in page_selections.items():
    mp = ROOT / f'curricula/DE/Gymnasium/mapping/DE-{state}/lower-secondary/{state.lower()}_biology_lower_secondary_source_extraction_to_canonical_biology.review.json'
    extraction = read(ROOT / read(mp)['sourceExtractionPath'])
    doc = extraction['sourceDocument']
    path = ROOT / doc.get('path', doc.get('localPath'))
    texts = []
    for page in pages:
        text = subprocess.run(['pdftotext', '-f', str(page), '-l', str(page), '-layout', str(path), '-'], check=True, capture_output=True, text=True).stdout
        texts.append(f'PDF page {page}\n{text}')
    (sources / f'{state.lower()}-mutation-stage-context-retained.txt').write_text('\n'.join(texts))
    receipts.append({'state': state, 'document': doc, 'localDocumentSha256': digest(path), 'selectedPdfPagesOneBased': pages, 'verification': 'Actual retained official PDF text inspected; no live re-download or blanket source approval.'})
save('sources/seki-retained-source.receipts.json', {'capturedAt': NOW, 'receipts': receipts})
print(json.dumps({'goals': len(IDS), 'currentPMatches': len(current_p), 'currentDMatches': len(current_d), 'mappingFiles': len(bindings), 'sourceViews': len(views), 'hePdfSha256': digest(pdf)}, ensure_ascii=False))
