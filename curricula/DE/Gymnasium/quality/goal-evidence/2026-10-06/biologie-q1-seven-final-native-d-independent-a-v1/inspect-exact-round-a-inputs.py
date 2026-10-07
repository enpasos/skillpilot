"""Inspect only round A and shared bound inputs for the final native D review."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import re
import subprocess

REPO = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-q1-seven-final-native-review-inputs-author-v1'
BASE = AUTHOR.parent

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def bind(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': sha(path), 'bytes': path.stat().st_size}

def write(name, value):
    (OWN / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

assert not (OWN / 'independent-d-a.final.freeze.json').exists(), 'Frozen review'
author_freeze = AUTHOR / 'final-native-review-inputs.author-v1.freeze.json'
assert sha(author_freeze) == '7594c80e665828238463b965f12b18df845a3c17fbfe19dc17e1ed35a5247d70'
freeze = read(author_freeze)
closure = []
for item in freeze['files']:
    local = item['path']
    # Exact own artifacts are checked only for round A and shared inputs. Round B
    # input and output bodies are neither opened nor used in this review.
    if local.startswith('round-b/'):
        continue
    if local.startswith(('round-a/', 'bundle/', 'inputs/', 'qa-artifacts/')):
        path = AUTHOR / local
        assert sha(path) == item['sha256'] and path.stat().st_size == item['bytes'], str(path)
        closure.append(bind(path))
bundle = read(AUTHOR / 'bundle/manifest.json')
for artifact in bundle['artifacts']:
    path = AUTHOR / 'bundle' / artifact['path']
    assert 'sha256:' + sha(path) == artifact['digest'] and path.stat().st_size == artifact['bytes']
    closure.append(bind(path))
round_input = read(AUTHOR / 'round-a/description-review-input.json')
campaign = read(AUTHOR / 'round-a/description-review-campaign.json')
assert campaign['goalCount'] == round_input['goalCount'] == len(round_input['goals']) == 7
assert round_input['bundleFingerprint'] == bundle['bundleFingerprint'] == campaign['bundleFingerprint']
assert round_input['bookDigest'] == bundle['bookModelDigest'] == campaign['bookDigest']
assert [goal['goalId'] for goal in round_input['goals']] == campaign['batches'][0]['goalIds']
model = read(AUTHOR / 'bundle/book-model.json')
assert len(model['pages']) == 7
page_by_id = {page['goalId']: page for page in model['pages']}
prior_science = BASE / 'biologie-q1-seven-native-v6-independent-a-v1/seven-science-atomicity-prerequisite-memory.review.json'
prior = {row['goalId']: row for row in read(prior_science)['goals']}
rows = []
native_canonical = read(AUTHOR / 'inputs/canonical-390.de.candidate.json')
new_goals = {goal['id']: goal for goal in native_canonical['goals']}
old_envelope = read(BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6/canonical-390.component-first.author-candidate.inert-envelope.json')
old_goals = {goal['id']: goal for goal in json.loads(old_envelope['candidateCanonicalUTF8'])['goals']}
images = []
for goal in round_input['goals']:
    old = prior[goal['goalId']]
    assert goal['currentTitleDe'] == old['title']
    assert goal['currentDescriptionDe'] == old['descriptionDE'] and goal['currentDescriptionEn'] == old['descriptionEN']
    assert goal['canonicalContext']['requires'] == old['requires']
    page = goal['reviewContext']['page']
    assert page == page_by_id[goal['goalId']]
    assert page['title'] == goal['currentTitleDe'] and page['description'] == goal['currentDescriptionDe']
    assert page['goalFingerprint'] == goal['goalFingerprint'] and page['pageFingerprint'] == goal['pageFingerprint']
    image = BASE / 'biologie-q1-seven-new-visuals-author-v1/native-helper-output/app/public' / page['visualization']['url'].lstrip('/')
    assert 'sha256:' + sha(image) == page['visualization']['originalDigest']
    images.append(bind(image))
    changed_fields = sorted(key for key in set(old_goals[goal['goalId']]) | set(new_goals[goal['goalId']])
                            if old_goals[goal['goalId']].get(key) != new_goals[goal['goalId']].get(key))
    assert changed_fields == ['resourceLinks'], (goal['goalId'], changed_fields)
    rows.append({'goalId': goal['goalId'], 'goalFingerprint': goal['goalFingerprint'], 'pageFingerprint': goal['pageFingerprint'],
                 'descriptionTitleRequiresExactPriorOwnA': True, 'actualCanonicalChangedFields': changed_fields,
                 'newPrimaryImage': bind(image), 'currentPage': page,
                 'evidenceProfilePresent': goal['reviewContext']['evidenceProfile'] is not None,
                 'priorOwnAReuse': 'exact scientific/atomicity/material/memory findings; new final page, image, source and context bindings separately inspected'})

# Read the actual finished PDF, not a substitute reconstruction of its pages.
pdf = AUTHOR / 'bundle/book.pdf'
pdf_info = subprocess.run(['pdfinfo', str(pdf)], capture_output=True, text=True)
assert pdf_info.returncode == 0 and 'Pages:           9' in pdf_info.stdout
(OWN / 'actual-bound-pdf-info.txt').write_text(pdf_info.stdout)
pdf_text = OWN / 'actual-bound-pdf-full.text.txt'
proc = subprocess.run(['pdftotext', '-layout', str(pdf), str(pdf_text)], capture_output=True, text=True)
assert proc.returncode == 0
pages = pdf_text.read_text().split('\f')
assert len([text for text in pages if text.strip()]) == 9
views = OWN / 'actual-pdf-page-views'
views.mkdir(exist_ok=True)
proc = subprocess.run(['pdftoppm', '-png', '-r', '90', '-f', '3', '-l', '9', str(pdf), str(views / 'physical')], capture_output=True, text=True)
assert proc.returncode == 0
for index, goal in enumerate(round_input['goals']):
    physical = index + 3
    text = pages[physical - 1]
    dehyphenated_text = re.sub(r'[\u00ad\u2010]\s*\n\s*', '', text)
    dehyphenated_text = re.sub(r'-\s*\n\s*', '-', dehyphenated_text)
    assert goal['currentTitleDe'] in ' '.join(dehyphenated_text.split()), goal['goalId']
    assert ' '.join(goal['currentDescriptionDe'].split()) in ' '.join(dehyphenated_text.split()), goal['goalId']
    (OWN / f"goal-{index + 1:02d}.actual-pdf-page.txt").write_text(text)
    rows[index]['actualPDFPhysicalPage'] = physical
    rows[index]['actualPDFTextExtract'] = bind(OWN / f"goal-{index + 1:02d}.actual-pdf-page.txt")

active_manifest = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
active = read(active_manifest)['currentInputs']
for item in active:
    assert sha(REPO / item['path']) == item['sha256'], item['path']
write('exact-round-a-bundle-image-source-context-and-pdf-inputs.actual.json', {
    'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'authorFreeze': bind(author_freeze), 'roundAOnlyAndSharedExactOwnBindings': closure,
    'priorOwnScientificReview': bind(prior_science), 'selectedSevenRows': rows,
    'actualImageBindings': images, 'actualPDF': bind(pdf), 'PDFPhysicalPageCount': 9,
    'PDFTextComparisonNormalization': 'Remove automatic line-break hyphenation U+00AD/U+2010; join ASCII compound-hyphen line breaks while retaining the hyphen. Preserve canonical text and compare actual rendered page content.',
    'current19Inputs': active, 'current19InputsExact': True,
    'roundBInputOrPeerResultsRead': False, 'newPProfilesCreated': 0, 'activeWrites': False,
})
print(json.dumps({'sharedAndRoundAArtifactsExact': len(closure), 'actualPDFFinalGoalPages': 7,
                  'actualSelectedImageBytes': 7, 'priorOwnDescriptionsExact': 7,
                  'active19Exact': len(active), 'roundBRead': False}))
