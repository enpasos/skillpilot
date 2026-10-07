#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Verify frozen author bytes and actual PDF geometry; visual reading is separate."""
import hashlib
import json
import re
import subprocess
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / 'biologie-neuro-hh-thirty-two-source-restoration-author-v1'
SHA = lambda data: 'sha256:' + hashlib.sha256(data).hexdigest()
LOAD = lambda path: json.loads(path.read_text())
NS = {'h': 'http://www.w3.org/1999/xhtml'}
freeze_path = AUTHOR / 'hh-thirty-two-partial-source-author-v1.final.freeze.json'
freeze = LOAD(freeze_path)
frozen = []
for binding in freeze['files']:
    path = ROOT / binding['path']
    assert SHA(path.read_bytes()) == binding['sha256']
    assert path.stat().st_size == binding['bytes']
    frozen.append({**binding, 'actualExact': True})
assert len(frozen) == 10

historical = []
for name, key in [('actual-author-input-and-protected-subject-preservation.json', 'inputBindings'),
                  ('native-hh-current390-additive-atlas.author-v1.actual.receipt.json', 'actualNativeInputBindings')]:
    for binding in LOAD(AUTHOR / name)[key]:
        actual = SHA((ROOT / binding['path']).read_bytes())
        historical.append({'receipt': name, 'path': binding['path'],
                           'historicalSha256': binding['sha256'], 'actualSha256': actual,
                           'currentlyExact': actual == binding['sha256']})

spans = LOAD(AUTHOR / 'HH.actual-primary-selected-spans.author-v1.json')
pdf = ROOT / spans['primaryDocument']['path']
assert SHA(pdf.read_bytes()) == spans['primaryDocument']['sha256']
download = OWN / '.reading-cache/official-biologie-gym-seki.pdf'
assert download.exists() and download.read_bytes() == pdf.read_bytes()
page_receipts = []
line_by_page = {}
for page in [18, 19, 20, 22, 23, 24, 25, 26, 27, 28]:
    raw = subprocess.check_output(['pdftotext', '-f', str(page), '-l', str(page), '-bbox-layout', str(pdf), '-'])
    xml = ET.fromstring(re.sub('[\x00-\x08\x0b\x0c\x0e-\x1f]', '', raw.decode()))
    lines = []
    for line in xml.findall('.//h:line', NS):
        lines.append({'text': ' '.join(word.text or '' for word in line.findall('h:word', NS)),
                      'pdfLineBBox': {key: float(value) for key, value in line.attrib.items()}})
    line_by_page[page] = lines
    author_page = next(row for row in spans['actualBBoxPrimaryPageBindings'] if row['physicalPage'] == page)
    assert SHA(raw) == author_page['freshBBoxExtractionSha256']
    raster = OWN / f'.reading-cache/page-{page}.png'
    page_receipts.append({'physicalPage': page, 'printedPage': page, 'bboxLayoutSha256': SHA(raw),
                          'sameAuthorBBoxExtraction': True, 'actualRasterSha256': SHA(raster.read_bytes()),
                          'rasterScaleToPixels': 1600,
                          'visuallyReadByIndependentBInThisTurn': True,
                          'visualReadEvidence': 'view_image returned this actual page raster to the independent B reviewer before this receipt was written'})
span_receipts = []
for span in spans['selectedActualOriginalSpans']:
    actual = line_by_page[span['physicalPage']]
    for line in span['originalPdfLineTranscriptsAndBBoxes']:
        assert line in actual, span['key']
        bbox = line['pdfLineBBox']
        if span['originalCheckpointEndGrade'] == 8:
            assert bbox['yMin'] > 402, span['key']
        elif span['originalCheckpointEndGrade'] == 10:
            assert bbox['yMax'] < 402, span['key']
    assert span['originalFixedTeachingGradeBand'] is None
    assert span['originalCourseLevel'] is None
    span_receipts.append({'key': span['key'], 'physicalPage': span['physicalPage'],
                          'printedPage': span['printedPage'],
                          'rawSourceTextSha256': SHA(span['rawSourceText'].encode()),
                          'originalCheckpointEndGrade': span['originalCheckpointEndGrade'],
                          'fixedTeachingYear': None, 'sourceCourseProfile': None,
                          'allExactOriginalLinesAndBBoxesReproduced': True,
                          'actualPageAndTableCellVisuallyReadByB': True,
                          'sameGradeColumnWithoutBleed': True})
assert len(span_receipts) == 26

th_path = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-author-v2/th-largest-partial-author-v2.final.freeze.json'
th = LOAD(th_path)
th_files = []
for binding in th['files']:
    path = ROOT / binding['path']
    assert SHA(path.read_bytes()) == binding['sha256'] and path.stat().st_size == binding['bytes']
    th_files.append({**binding, 'actualExact': True})
guard = LOAD(AUTHOR / 'actual-author-input-and-protected-subject-preservation.json')
chem = LOAD(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
chem_goals = {goal['id']: goal for goal in chem['goals']}
for binding in guard['chemistryProtected112WholeObjectSha256s']:
    encoded = json.dumps(chem_goals[binding['goalId']], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    assert SHA(encoded) == binding['wholeObjectSha256'], binding['goalId']

result = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
          'role': 'independent B actual hash, primary-reading and geometry receipt',
          'authorFreeze': {'path': str(freeze_path.relative_to(ROOT)), 'sha256': SHA(freeze_path.read_bytes()),
                           'allTenFrozenAuthorFilesExact': True, 'files': frozen},
          'historicalInputComparisons': historical,
          'currentHistoricalInputDrifts': [row for row in historical if not row['currentlyExact']],
          'officialUrl': spans['officialUrl'], 'officialFreshDownloadByteIdentical': True,
          'officialPdfSha256': SHA(pdf.read_bytes()), 'officialPdfBytes': pdf.stat().st_size,
          'actualPdfRastersVisuallyReadByB': page_receipts, 'selectedSpanChecks': span_receipts,
          'contextReading': {'page18': 'Minimum competencies and suitable content examples are distinct.',
                             'page19': 'General judgment routine is a process demand, not a new contraception bullet.',
                             'page20': 'End grade 8 and end grade 10 requirements form a cumulative learning process.',
                             'pages22to25': 'Rotated table grade columns visually distinguished; no end10 text assigned to end8.',
                             'pages26to27': 'Binding content terms support declared basic operationalisations; they do not supply a detailed new task or mechanism list.',
                             'page28': 'No fixed time, order or first teaching year is stipulated for the binding content topics.'},
          'TH19AuthorFreezePreservation': {'path': str(th_path.relative_to(ROOT)), 'sha256': SHA(th_path.read_bytes()),
                                         'allFrozenFilesExact': True, 'files': th_files},
          'chemistryProtected112WholeObjectsExact': True,
          'noPeerAReportOrAssessmentRead': True, 'activeWrites': False, 'gitMutation': False,
          'humanApproval': False, 'humanTrial': False, 'newStrictCompletions': 0,
          'scopeLimit': 'Primary geometry and source reading do not approve whole canonical goals, complete source extraction, overlay placement or M7.'}
output = OWN / 'HH.author-freeze-and-actual-primary-reading.independent-b.json'
assert not output.exists()
output.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'authorFilesExact': len(frozen), 'actualVisualPages': len(page_receipts), 'exactSpans': len(span_receipts),
                  'historicalInputDrifts': [row['path'] for row in historical if not row['currentlyExact']],
                  'THFrozenFilesExact': len(th_files), 'chemistryProtected112Exact': True}))
