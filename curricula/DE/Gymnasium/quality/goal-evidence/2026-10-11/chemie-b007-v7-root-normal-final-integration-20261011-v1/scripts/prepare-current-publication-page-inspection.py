#!/usr/bin/env python3
"""Prepare additive captures of the actual normal publication, without approval.

Reuse the reviewed whole-page capture routines as additive technical derivatives.
Historical candidate inputs, routines and captures remain byte-identical.
"""
import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
BASE = Path(__file__).resolve().parent.parent
HISTORY = BASE.parent / 'chemie-b007-v7-final-native31-root-page-inspection-20261011-v1'
STAGE = BASE.parent / 'chemie-b007-v7-final-native31-root-integration-candidate-20261011-v1'
CURRENT_MODEL = Path('app/public/lernzielbuch/de-gym-chemie-bundesweit.book-model.json')
CURRENT_PDF = Path('app/public/lernzielbuch/de-gym-chemie-bundesweit.pdf')
BASE_REL = BASE.relative_to(ROOT).as_posix()

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix() if path.is_absolute() else path.as_posix(),
            'bytes': len(data), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest()}

def read(path):
    return json.loads(Path(path).read_text())

old_path = STAGE / 'native/source382.normal.book-model.json'
old = {page['goalId']: page for page in read(old_path)['pages']}
current = {page['goalId']: page for page in read(CURRENT_MODEL)['pages']}
assert old.keys() == current.keys() and len(current) == 382
deltas = [{'goalId': gid, 'changedFields': [key for key in page if page[key] != old[gid].get(key)]}
          for gid, page in current.items() if page != old[gid]]
assert len(deltas) == 6
for row in deltas:
    allowed = {'evidenceReview', 'pageFingerprint'}
    if row['goalId'] == '413040cd-ba74-5227-948c-a778b0bd0f56':
        allowed.add('applicability')
    assert set(row['changedFields']) == allowed, row
    assert current[row['goalId']]['evidenceReview'] is None
assert [item['jurisdiction'] for item in current['413040cd-ba74-5227-948c-a778b0bd0f56']['applicability']] == ['DE-TH']

generated = []
source = HISTORY / 'scripts/check-complete-pages.py'
body = source.read_text().replace("OUT=BASE/'chemie-b007-v7-final-native31-root-page-inspection-20261011-v1'",
                                "OUT=BASE/'" + BASE.name + "'")
body = body.replace("modelpath=STAGE/'native/source382.normal.book-model.json'", "modelpath=Path('" + CURRENT_MODEL.as_posix() + "')")
body = body.replace("hp=OUT/'native/full-source382.html';pdf=OUT/'native/full-source382.pdf'",
                    "hp=OUT/'native/current-source382.html';pdf=Path('" + CURRENT_PDF.as_posix() + "')")
destination = BASE / 'scripts/check-current-complete-pages.py'
destination.write_text(body)
generated.append({'source': binding(source), 'derivative': binding(destination)})

source = HISTORY / 'scripts/capture-complete-pages.mjs'
body = source.read_text().replace(HISTORY.relative_to(ROOT).as_posix(), BASE_REL)
body = body.replace('full-source382.html', 'current-source382.html').replace('complete40', 'complete6-current')
body = body.replace('40', '6')
destination = BASE / 'scripts/capture-current-six-html-pages.mjs'
destination.write_text(body)
generated.append({'source': binding(source), 'derivative': binding(destination)})

source = HISTORY / 'scripts/capture-pdf-pages.py'
body = source.read_text().replace("PDF = BASE / 'native/full-source382.pdf'", "PDF = pathlib.Path('" + CURRENT_PDF.as_posix() + "').resolve()")
body = body.replace('complete40', 'complete6-current').replace('40', '6')
destination = BASE / 'scripts/capture-current-six-pdf-pages.py'
destination.write_text(body)
generated.append({'source': binding(source), 'derivative': binding(destination)})

result = {'scope': 'Exact stage-to-normal whole382 page comparison and additive capture preparation',
          'inputs': [binding(old_path), binding(CURRENT_MODEL)], 'pageCount': 382,
          'wholePageBodiesUnchanged': 376, 'changedPages': deltas,
          'reason': 'Normal book has no candidate P-summary; solubility goal retains only the actual mandatory TH/LK binding. Optional HE material is not promoted to compulsory applicability.',
          'captureRoutines': generated, 'scientificApproval': False, 'humanApproval': False}
(BASE / 'checks/current-publication-page-deltas-and-capture-preparation.actual.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print('Prepared additive current-publication check/captures; 376 whole pages unchanged, six require actual viewing.')
