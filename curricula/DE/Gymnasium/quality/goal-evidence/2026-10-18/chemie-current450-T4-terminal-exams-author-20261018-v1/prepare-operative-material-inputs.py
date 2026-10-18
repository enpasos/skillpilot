import hashlib
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence'
frozen = json.loads((OWN / 'INPUT.whole-current-eighteen-goals-and-P.json').read_text())
selected_ids = {r['goal']['id'] for r in frozen['records']}
entries = []


def pin(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def add(path, pointer, value, note):
    serial = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    entries.append({'sourceFile': pin(path), 'jsonPointer': pointer, 'wholeObjectSHA256': hashlib.sha256(serial).hexdigest(), 'wholeMaterial': value, 'transportOnly': True, 'use': note})


original = BASE / '2026-10-12/chemie-aromatics-dyes20-current231-scientific-author-20261013-v1/author/whole40.expanded-cases.author.json'
corrected = BASE / '2026-10-12/chemie-aromatics20-all-source-alias-case-and-atomicity-remediation-author-20261013-v7/author/six-complete-bilingual-case-corrections.author.json'
for path in [original, corrected]:
    for index, case in enumerate(json.loads(path.read_text())['cases']):
        if case['goalId'] in selected_ids:
            add(path, f'/cases/{index}', case, 'Complete original operative case; current native P body remains authoritative when a later explicit route differs.')

path = BASE / '2026-10-14/chemie-source6-current412-final-resources-P5-shared-native5-technical-20261014-v1/cases/whole-five-goals-ten-complete-bilingual-cases.exact-original.json'
for index, goal in enumerate(json.loads(path.read_text())['goals']):
    if goal['goalId'] in selected_ids:
        add(path, f'/goals/{index}', goal, 'Whole classification goal material, including both complete cards and rubrics.')

for suffix, indices in [('chemie-current447-final-four-scope-corrections-author-20261018-v2/MATERIALS.complete-owned-and-energy-only-and-supplied-four-cards.pending.json', [4, 5]), ('chemie-current442-five-P-scope-operator-remediation-author-20261018-v1/AUTHOR.complete-DE-EN-material-routes.pending.json', [3, 4])]:
    path = BASE / '2026-10-17' / suffix
    document = json.loads(path.read_text())
    for index in indices:
        add(path, f'/materials/{index}', document['materials'][index], 'Complete selected appended material, including independent fresh transfer and blank record; original status preserved.')

path = BASE / '2026-10-15/chemie-three-source-duty-carriers-prospective422-bounded-author-remediation-20261015-v1/materials/eleven-complete-cases.remediated.author.json'
for index, case in enumerate(json.loads(path.read_text())['cases']):
    if case['id'] in ['BW-B1', 'BW-B2']:
        add(path, f'/cases/{index}', case, 'Whole two temporal research cases.')

path = BASE / '2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json'
for index, case in enumerate(json.loads(path.read_text())['cases']):
    if case['id'] in ['energy20-20-a', 'energy20-20-b']:
        add(path, f'/cases/{index}', case, 'Whole actual mass data, tasks, solution and fresh-transfer questions; no synthetic learner measurements.')

for name in ['hb199-greenhouse-energy-climate', 'hb200-plant-oil-routes', 'hb201-btl-fischer-tropsch']:
    path = BASE / f'2026-10-17/chemie-current439-HB-materials-resources-material-author-20261017-v1/materials/{name}.DE-EN.json'
    add(path, '', json.loads(path.read_text()), 'Entire bound main case and fresh transfer, not an ID-only native brief.')

path = BASE / '2026-10-17/chemie-current439-source-requires-working-checkpoint-20261017-v1/evidence/chemie-mixed18-four-targeted-P-gaps-author-successor-v1/materials/basf-indigo-1897-actual-sources.whole-DE-EN.author.json.snapshot'
add(path, '', json.loads(path.read_text()), 'Whole portable archived historical H1/H2/H3 card, retained exactly. The new exam separately corrects H3 washfastness to the primary colorfastness wording; no old P/material mutation.')

result = {'artifactRole': 'EXACT_SELECTED_WHOLE_OPERATIVE_MATERIAL_INPUTS_NOT_NEW_APPROVAL', 'entries': entries, 'newScientificVotes': 0, 'normalWrites': 0, 'humanApproval': False}
(OWN / 'INPUT.whole-selected-operative-materials.exact.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'wholeSelectedMaterialObjects': len(entries), 'normalWrites': 0}))
