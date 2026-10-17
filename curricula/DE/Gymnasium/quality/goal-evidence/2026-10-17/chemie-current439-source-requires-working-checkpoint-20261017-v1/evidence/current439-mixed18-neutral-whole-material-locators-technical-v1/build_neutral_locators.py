from pathlib import Path
from hashlib import sha256
import json

OUT = Path(__file__).resolve().parent
REPO = Path('/home/enpasos/projects/skillpilot')
N = Path('/mnt/e/skillpilot-chemie-L7-20261017/current439-AV-and-native-registry-integration-root-v1/capsule')
SAFE = Path('/mnt/e/skillpilot-chemie-L7-20261017/review-scientific-views-root-v1/REVIEW.mixed18.whole-scientific-content.no-historical-review-metadata.json')

def read(p):
    return json.loads(p.read_bytes())

def filepin(p):
    b = p.read_bytes()
    return {'path': str(p.resolve()), 'sha256': sha256(b).hexdigest(), 'bytes': len(b)}

def valuepin(v):
    b = json.dumps(v, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    return {'sha256': sha256(b).hexdigest(), 'bytes': len(b), 'encoding': 'UTF-8 JSON, sorted keys, compact separators, unescaped Unicode'}

def write(name, v):
    p = OUT / name
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
    return filepin(p)

safe = read(SAFE)
assert filepin(SAFE)['sha256'] == '5a0790b37353856fb83cc9e8ccaaa5eaa7865970a03bbef8dd5f85e0ad977275'
current = {g['goalId']: g for g in safe['goals']}
rows = []

def add(p, pointer, x, fields, case_id=None, kind='whole authored material'):
    selected = {k: x[k] for k in fields if k in x}
    gid = x['goalId']
    cid = case_id or x.get('id', x.get('caseId'))
    matching = [c for c in current[gid]['reviewContext']['evidenceProfile']['profile']['applicationCaseBriefs'] if c['id'] == cid]
    assert len(matching) == 1
    r = {'goalId': gid, 'caseId': cid, 'materialKind': kind,
         'sourceFile': filepin(p), 'sourceJsonPointer': pointer,
         'selectedFieldPins': [{'sourceJsonPointer': pointer + '/' + k, **valuepin(v)} for k, v in selected.items()],
         'scientificMaterial': selected}
    rows.append(r)

p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/chemie-current-atomic-description-positive-gap-author-v2/thirty-complete-materials.de-en.author-corrections.candidate.json'
d = read(p)
for i in [14, 15, 18, 19]:
    add(p, f'/materials/{i}', d['materials'][i],
        ['caseId', 'goalId', 'materialKind', 'material', 'taskDemand', 'expectedPerformance', 'specificBoundaryOrCounterexample', 'sourceRequirementReference'],
        kind='complete authored textual material; no separate drawing is embedded in these fields')

p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-q3-four-v3-reviewed-current407-integration-preparation-20261014-v1/positive/exact-four-nine-full-bilingual-case-bodies.original-v3.json'
d = read(p)
for i, x in enumerate(d['rows']):
    if not x['goalId'].startswith('94a62b39'):
        continue
    for j, c in enumerate(x['wholeMaterialCases']):
        add(p, f'/rows/{i}/wholeMaterialCases/{j}', c,
            ['caseId', 'goalId', 'title', 'material', 'task', 'modelResponse', 'scoring', 'freshTransfer'])

p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-aromatics20-bounded-source-and-operator-remediation-author-20261013-v4/author/whole40.expanded-cases.author.json'
d = read(p)
for i in [14, 15, 18, 19]:
    add(p, f'/cases/{i}', d['cases'][i],
        ['caseId', 'goalId', 'titleDe', 'titleEn', 'dataOrigin', 'languageParity', 'dataDe', 'dataEn', 'taskDe', 'taskEn', 'modelAnswerDe', 'modelAnswerEn', 'expectationIds', 'visualizationRequired', 'practicalExecutionRequired', 'rubric', 'maximumPoints', 'optionalModelRemarksDe', 'optionalModelRemarksEn', 'gradingBoundary'])

energy_fields = ['id', 'goalId', 'title', 'provenance', 'imageRequired', 'materialsDe', 'materialsEn', 'taskDe', 'taskEn', 'workedReasoningDe', 'workedReasoningEn', 'freshIndependentTransferDe', 'freshIndependentTransferEn', 'criterionToObservableRubric']
for relative, indices in [
    ('2026-10-15/chemie-energy20-four-defects-targeted-material-author-successor-20261015-v1/materials/forty-two-whole-DE-EN-cases.four-defects-successor.author.json', [10, 11, 18, 19, 20, 21]),
    ('2026-10-15/chemie-energy-eleven-kept-current422-positive-and-atomic-informed-20261015-v1/materials/eleven-whole-cases22.targeted-informed-successor.json', [2, 3, 10, 11, 12, 13]),
]:
    p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence' / relative
    d = read(p)
    for i in indices:
        add(p, f'/cases/{i}', d['cases'][i], energy_fields)

# The supplied current P owns later task/answer changes. Only the original
# additional material payload is selected for the two split cases here.
p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/chemie-seven-source-atomicity-whole-author-successor-20261016-v1/split-three/materials/TWELVE.whole-bilingual-split-cases.author.json'
d = read(p)
for i in [2, 3]:
    add(p, f'/cases/{i}', d['cases'][i], ['id', 'goalId', 'title', 'provenance', 'materialsDe', 'materialsEn'], kind='additional authored split-case materials; current task and answer are in the pinned current P')

# Original execution instructions: select the protocol text itself, excluding
# historical case wrappers and all earlier task/answer variants.
p = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/cases/targeted24-to29.DEEN.tasks-material-rubrics.json'
d = read(p)
for i in [8, 22, 33]:
    x = d['cases'][i]
    add(p, f'/cases/{i}', x, ['goalId', 'materialAndData'], case_id=x['case']['id'], kind='authored execution instruction text')
    c = next(c for c in current[x['goalId']]['reviewContext']['evidenceProfile']['profile']['applicationCaseBriefs'] if c['id'] == x['case']['id'])
    rows[-1]['currentTaskDemandDeVerbatimEqual'] = x['materialAndData'] == c['taskDemandDe']
    assert rows[-1]['currentTaskDemandDeVerbatimEqual']

archive_pin = write('MATERIAL.additional-original-scientific-fields.json', {
    'schemaVersion': 1,
    'selection': 'Each listed operative scientific field is copied unchanged. Source archive wrappers and prior review metadata are excluded. Current task/answer wording is held by the separately pinned current P projection.',
    'materials': rows,
})

assets = []
for i, g in enumerate(safe['goals']):
    for j, resource in enumerate(g['currentCanonicalScientificFields'].get('resourceLinks', [])):
        if resource.get('type') != 'goal-visualization':
            continue
        p = N / 'app/public' / resource['url'].lstrip('/')
        metadata = {k: resource[k] for k in ['type', 'resourceType', 'role', 'title', 'url', 'description', 'altText', 'lang', 'license'] if k in resource}
        resource_pointer = f'/goals/{i}/currentCanonicalScientificFields/resourceLinks/{j}'
        assets.append({'goalId': g['goalId'], 'sourceFile': filepin(SAFE),
                       'sourceJsonPointer': resource_pointer,
                       'selectedScientificMetadata': metadata,
                       'selectedFieldPins': [{'sourceJsonPointer': resource_pointer + '/' + k, **valuepin(v)} for k, v in metadata.items()],
                       'imageFile': filepin(p)})
assets_pin = write('LOCATORS.current-linked-goal-images.json', {'schemaVersion': 1, 'resources': assets})

missing = []
def miss(gid, requested, search_files, search_dirs):
    missing.append({'goalId': gid, 'requestedMaterial': requested,
                    'finding': 'kein separates Original in durchsuchten Pfaden gefunden',
                    'searchedFiles': [filepin(p) for p in search_files],
                    'searchedDirectories': [str(p.resolve()) for p in search_dirs]})

base = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence'
mo_files = [N / 'curricula/DE/Gymnasium/quality/goal-evidence' / name for name in [
    'canonical-chemistry-positive-understanding-evidence-b003-q1-bonding-current-11-v1.candidates.json',
    'canonical-chemistry-positive-understanding-evidence-b003-q1-bonding-current-11-v2.candidates.json']]
mo_files = [p for p in mo_files if p.is_file()]
miss('f85b4651-50ea-5b42-b193-3465c05257a7', 'separate N2 diagram for nitrogen-mo-count', [SAFE] + mo_files,
     [N / 'curricula/DE/Gymnasium/visualizations/chemie/f85b4651-50ea-5b42-b193-3465c05257a7'])
stereo = base / '2026-10-06/chemie-current-atomic-description-positive-gap-author-v2/thirty-complete-materials.de-en.author-corrections.candidate.json'
miss('9decc36b-a69a-5599-a9f0-fcebdf0203d8', 'separate case-specific But-2-ene/propene drawings or alanine A/B/C spatial objects', [SAFE, stereo],
     [stereo.parent, N / 'curricula/DE/Gymnasium/visualizations/chemie/9decc36b-a69a-5599-a9f0-fcebdf0203d8'])
q4 = base / '2026-10-12/chemie-q4-thermodynamics-eleven-current402-P-A-source-author-20261012-v2/cases/whole11.DEEN.cases-material-data-modelanswers-rubrics.json'
miss('4a08f31f-204c-5339-9d9f-5d2af28d5d5c', 'separate synthetic T(t) list for neutralisation-calorimetry', [SAFE, q4], [q4.parent])
tmp = REPO / 'tmp/chemie-m7-resumed-20261016'
natural50 = base / '2026-10-12/chemie-q2-naturstoffe-current402-author-20261012-v2/cases/targeted24-to29.DEEN.tasks-material-rubrics.json'
for gid, request, extra_files, author_dirs in [
    ('9fef5c29-62bc-5ada-b96b-6885bcb049cb', 'additional closed-phosphate-buffer particle cards or raw data beyond current inline case', [], [tmp / 'HE-admission-next-author-preparation-v1']),
    ('801790f9-be3a-51fe-9b0f-3452c1bba887', 'additional three-system-boundary cards or piston figures for current qualitative cases', [q4], [q4.parent]),
    ('1d2e7b80-653d-57b8-a284-8ede5a353b73', 'separate whole original for the current benedict-execution-fresh-transfer and course-route follow-up beyond current inline case', [natural50], [tmp / 'HE-admission-next-author-preparation-v1', tmp / 'actual-transitive-ordinary-route-bottlenecks-author-v1']),
    ('5c8f0bbb-103a-579f-87fc-c997afe4fd18', 'separate updated whole original for current test-specific case-b-transfer blank description beyond current inline case', [natural50], [tmp / '5c8-Biuret-negative-control-color-author-successor-v1']),
    ('cc5a626a-dc85-57e2-b422-259f92901545', 'separate updated whole original for the current surface-activity follow-up beyond current inline case', [base / '2026-10-16/chemie-seven-source-atomicity-whole-author-successor-20261016-v1/split-three/materials/TWELVE.whole-bilingual-split-cases.author.json'], [base / '2026-10-16/chemie-seven-source-atomicity-whole-author-successor-20261016-v1/split-three/materials']),
]:
    miss(gid, request, [SAFE] + extra_files, [base / '2026-10-16/chemie-current439-reviewed-inactive-checkpoint-20261016-v1/evidence'] + author_dirs)

missing_pin = write('LOCATORS.bounded-search-without-separate-original.json', {
    'schemaVersion': 1,
    'boundary': 'These entries report only the requested object within the searched corresponding author/material archives and current checkpoint inputs. Linked goal images and full current inline cases are separately pinned. They do not decide scientific adequacy.',
    'entries': missing,
})

forbidden = {'reason', 'reviewer', 'run', 'resolution', 'approval', 'status', 'previousFinding'}
checked = []
def scan(v, pointer=''):
    if isinstance(v, dict):
        for k, x in v.items():
            assert k not in forbidden, (pointer, k)
            scan(x, pointer + '/' + k)
    elif isinstance(v, list):
        for i, x in enumerate(v):
            scan(x, pointer + '/' + str(i))

for p in sorted(OUT.glob('*.json')):
    if p.name.startswith(('MATERIAL.', 'LOCATORS.')):
        scan(read(p))
        checked.append(filepin(p))

index_pin = write('SELECTOR.neutral-whole-material-locators.json', {
    'schemaVersion': 1,
    'purpose': 'Neutral read-only material locators and field projections for the frozen current Mixed18 scope.',
    'sourceCurrentScientificView': filepin(SAFE),
    'outputs': checked,
    'originalArchiveSelectionCount': len(rows),
    'selectedCurrentGoalImageCount': len(assets),
    'selectionEncoding': 'Selected values are pinned as UTF-8 JSON with sorted keys, compact separators, unescaped Unicode; whole-file pins hash exact source bytes.',
    'boundary': 'No scientific verdict is supplied. No native input, configuration, canonical goal or P profile was edited. No new material was authored. External original-source retrieval is held independently by the receiving readers.',
})
print(json.dumps({'selector': index_pin, 'additionalOriginalMaterial': archive_pin, 'imageLocators': assets_pin, 'boundedObjectSearch': missing_pin, 'projectionFilesChecked': len(checked), 'selectedOriginalRows': len(rows)}, indent=2))
