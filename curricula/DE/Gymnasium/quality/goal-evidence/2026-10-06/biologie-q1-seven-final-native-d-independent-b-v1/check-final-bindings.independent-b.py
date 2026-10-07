#!/usr/bin/env python3
"""Read only exact B inputs; check actual final pages and retained source/material payloads."""
import base64
import hashlib
import json
import re
import subprocess
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06'
AUTHOR = BASE / 'biologie-q1-seven-final-native-review-inputs-author-v1'
OWN = Path(__file__).resolve().parent
V7 = BASE / 'biologie-q1-seven-component-source-topic-corrections-author-v7'
V6 = BASE / 'biologie-q1-seven-component-native-source-preparation-author-v6'
PRIOR = BASE / 'biologie-q1-seven-native-v7-independent-b-v1'
INPUTS = {}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def read_bytes(path):
    path = Path(path)
    assert '/round-a/' not in str(path), 'A inputs forbidden'
    data = path.read_bytes()
    INPUTS[str(path.relative_to(ROOT))] = {'path': str(path.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}
    return data

def read(path):
    return json.loads(read_bytes(path))

def write(name, data):
    (OWN / name).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')

def differences(x, y, prefix=''):
    if isinstance(x, dict) and isinstance(y, dict):
        return [p for k in sorted(x.keys() | y.keys()) for p in differences(x.get(k), y.get(k), prefix + '/' + k)]
    if isinstance(x, list) and isinstance(y, list) and len(x) == len(y):
        return [p for i, (a, b) in enumerate(zip(x, y)) for p in differences(a, b, prefix + '/' + str(i))]
    return [] if x == y else [prefix]

freeze_path = AUTHOR / 'final-native-review-inputs.author-v1.freeze.json'
assert digest(read_bytes(freeze_path)) == '7594c80e665828238463b965f12b18df845a3c17fbfe19dc17e1ed35a5247d70'
freeze = read(freeze_path)
verified, excluded_a = [], []
for binding in freeze['files']:
    if binding['path'].startswith('round-a/'):
        excluded_a.append(binding['path'])
        continue
    data = read_bytes(AUTHOR / binding['path'])
    assert digest(data) == binding['sha256'] and len(data) == binding['bytes'], binding['path']
    verified.append(binding['path'])
bundle = read(AUTHOR / 'bundle/manifest.json')
campaign = read(AUTHOR / 'round-b/description-review-campaign.json')
review = read(AUTHOR / 'round-b/description-review-input.json')
book = read(AUTHOR / 'bundle/book-model.json')
pdf_manifest = read(AUTHOR / 'bundle/book.pdf.render-manifest.json')
html_manifest = read(AUTHOR / 'bundle/book.html.render-manifest.json')
assert book['digest'] == review['bookDigest'] == bundle['bookModelDigest'] == pdf_manifest['modelDigest'] == html_manifest['modelDigest']
assert [g['goalId'] for g in review['goals']] == [p['goalId'] for p in book['pages']]
assert pdf_manifest['physicalPageCount'] == 9 and pdf_manifest['frontMatterPageCount'] == 2
for artifact in bundle['artifacts']:
    data = read_bytes(AUTHOR / 'bundle' / artifact['path'])
    assert 'sha256:' + digest(data) == artifact['digest'] and len(data) == artifact['bytes']

original = read(V7 / 'seven-goals-sixteen-complete-cases.fresh-review-input.snapshot.json')
positive_input = read(AUTHOR / 'inputs/positive-review-inputs.native-fingerprints.pending.json')
canonical = read(AUTHOR / 'inputs/canonical-390.de.candidate.json')
goals = {g['id']: g for g in canonical['goals']}
original_rows = {r['goalId']: r for r in original['rows']}
positive_rows = {r['goalId']: r for r in positive_input['rows']}
qa = read(AUTHOR / 'inputs/visualization-qa.full-390.candidate.json')
qa_by_id = {r['goalId']: r for r in qa['records']}
sources, case_rows, page_rows = [], [], []

for jurisdiction in ['BE', 'BB', 'SN', 'TH', 'MV', 'ST']:
    old_path = (BASE / 'biologie-q1-mv-heading-location-targeted-author-v8/MV.source-components.author-v8.inert-envelope.json') if jurisdiction == 'MV' else (V7 / f'{jurisdiction}.source-components.author-v7.inert-envelope.json') if jurisdiction in ['SN', 'TH', 'ST'] else V6 / f'{jurisdiction}.source-components.author-candidate.inert-envelope.json'
    old = read(old_path)['candidatePayload']
    current = read(AUTHOR / f'inputs/source-components/{jurisdiction}.source-extraction.candidate.json')
    assert current == old, jurisdiction
    mapping = read(AUTHOR / f'inputs/source-components/{jurisdiction}.mapping.candidate.json')
    mapping_by_id = {r['legacyGoalId']: r for r in mapping['mappings']}
    for source_goal in current['sourceGoals']:
        matching = [r for r in original['rows'] if r['candidateKey'] == source_goal['componentKey']]
        assert len(matching) == 1
        target_id = matching[0]['goalId']
        assert mapping_by_id[source_goal['id']]['canonicalGoalId'] == target_id
        assert source_goal['description'] == goals[target_id]['description']
        sources.append({'jurisdiction': jurisdiction, 'sourceGoalId': source_goal['id'], 'goalId': target_id, 'componentKey': source_goal['componentKey'], 'wholePayloadExactVsReviewedV7OrMVV8': True, 'topicCode': source_goal['topicCode'], 'sourceRef': source_goal['sourceRef'], 'physicalPage': source_goal['physicalPage'], 'printedPage': source_goal['printedPage'], 'sourceSectionContext': source_goal.get('sourceSectionContext'), 'stage': source_goal['stage'], 'rawCourseLevel': source_goal.get('rawCourseLevel', source_goal.get('courseLevel')), 'courseProfile': source_goal.get('courseProfile'), 'wholeOriginalBulletCoverage': False})

class HtmlReader(HTMLParser):
    def __init__(self):
        super().__init__()
        self.texts = []
        self.images = []
        self.image_urls = []
    def handle_data(self, value):
        self.texts.append(value)
    def handle_starttag(self, tag, attrs):
        if tag == 'img':
            src = dict(attrs).get('src', '')
            self.image_urls.append(src)
            if src.startswith('data:'):
                self.images.append('sha256:' + digest(base64.b64decode(src.split(',', 1)[1])))

html = HtmlReader()
html.feed(read_bytes(AUTHOR / 'bundle/book.html').decode())
html_text = ''.join(html.texts)
subprocess.run(['pdfimages', '-j', str(AUTHOR / 'bundle/book.pdf'), str(OWN / 'pdf-pages/embedded')], check=True)
embedded = sorted((OWN / 'pdf-pages').glob('embedded-*.jpg'))
assert len(embedded) == 7
pdf_assets = {r['publicPath']: r for r in pdf_manifest['assets']}
html_assets = {r['publicPath']: r for r in html_manifest['assets']}
normal = lambda value: ''.join(c for c in value if c.isalnum()).casefold()
for index, row in enumerate(review['goals']):
    gid = row['goalId']
    old = original_rows[gid]['wholeGoal']
    current = goals[gid]
    diff = differences(old, current)
    assert diff == ['/resourceLinks'], (gid, diff)
    assert len(current['resourceLinks']) == 1 and current['resourceLinks'][0]['skillpilotId'] == gid
    for native_name, canonical_name in [('currentTitleDe', 'title'), ('currentTitleEn', 'titleEn'), ('currentDescriptionDe', 'description'), ('currentDescriptionEn', 'descriptionEn')]:
        assert row[native_name] == current[canonical_name] == old[canonical_name]
    assert positive_rows[gid]['wholeCurrentCandidateGoal'] == current
    assert positive_rows[gid]['currentSourceCaseBodies'] == original_rows[gid]['cases']
    for case in original_rows[gid]['cases']:
        case_rows.append({'goalId': gid, 'caseId': case['caseBody'].get('caseId', case['caseBody'].get('caseKey')), 'JSONPointer': case['JSONPointer'], 'caseBodyCanonicalJSONSHA256': digest(json.dumps(case['caseBody'], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()), 'completePayloadAndFinalUUIDExactVsPreviouslyReadV7': True})
    page = book['pages'][index]
    assert row['reviewContext']['page'] == page
    assert row['reviewContext']['evidenceProfile'] is None
    assert row['goalFingerprint'] == page['goalFingerprint'] and row['pageFingerprint'] == page['pageFingerprint']
    assert [r['goalId'] for r in page['requires']] == current['requires']
    assert page['externalPrerequisites'] == []
    asset = page['visualization']
    assert asset['url'] == current['resourceLinks'][0]['url'] == qa_by_id[gid]['imageUrl']
    assert asset['originalDigest'] == qa_by_id[gid]['assetSha256'] == pdf_assets[asset['url']]['sourceSha256'] == html_assets[asset['url']]['sourceSha256']
    original_asset = BASE / f'biologie-q1-seven-new-visuals-author-v1/native-helper-output/curricula/DE/Gymnasium/visualizations/biologie/{gid}/{gid}.png'
    assert 'sha256:' + digest(read_bytes(original_asset)) == asset['originalDigest']
    assert 'sha256:' + digest(embedded[index].read_bytes()) == pdf_assets[asset['url']]['renderedSha256']
    assert asset['url'] in html.image_urls
    physical = index + 3
    text = subprocess.run(['pdftotext', '-layout', '-f', str(physical), '-l', str(physical), str(AUTHOR / 'bundle/book.pdf'), '-'], check=True, capture_output=True).stdout.decode()
    (OWN / f'pdf-pages/final-native-{physical}.actual.txt').write_text(text)
    for value in [gid, page['title'], page['description']]:
        assert normal(value) in normal(text), (gid, 'PDF missing complete bound field')
        assert normal(value) in normal(html_text), (gid, 'HTML missing complete bound field')
    page_rows.append({'goalId': gid, 'physicalPDFPage': physical, 'goalPageNumber': index + 1, 'goalFingerprint': row['goalFingerprint'], 'pageFingerprint': row['pageFingerprint'], 'wholePriorGoalDelta': diff, 'completeDEENTextExact': True, 'completeDETitleDescriptionAndUUIDInActualPDFAndHTML': True, 'requiresExact': True, 'applicability': page['applicability'], 'breadcrumbs': page['breadcrumbs'], 'imageOriginalSHA256': asset['originalDigest'], 'pdfEmbeddedImageExactlyBoundPrintDerivative': True, 'htmlRootRelativeImageURLExactlyBound': True, 'htmlStandaloneEmbeddedImages': False, 'htmlIndependentBrowserRenderingClaimed': False, 'qaStatus': asset['qaStatus'], 'approvedForPublication': asset['approvedForPublication'], 'virtualPublicURLAlreadyInstalled': (ROOT / 'app/public' / asset['url'].lstrip('/')).exists()})

assert len(sources) == 13 and len(case_rows) == 16 and len(page_rows) == 7
prior_science = read(PRIOR / 'seven-science-operator-atomicity-prerequisite.review.json')
prior_memory = read(PRIOR / 'seven-individual-memory-decisions.review.json')
prior_native = read(PRIOR / 'native-source390-book383-to390-gui-superset-and-delta.actual.json')
v6_canonical = json.loads(read(V6 / 'canonical-390.component-first.author-candidate.inert-envelope.json')['candidateCanonicalUTF8'])
v6_by_id = {g['id']: g for g in v6_canonical['goals']}
old_ids = [r['goalId'] for r in prior_native['old383PageAndWholeGoalRows']]
protected_ids = [r['goalId'] for r in prior_native['protected67Rows']]
assert len(old_ids) == 383 and len(protected_ids) == 67
assert all(goals[gid] == v6_by_id[gid] for gid in old_ids)
assert all(goals[gid] == v6_by_id[gid] for gid in protected_ids)
full_book = read(AUTHOR / 'qa-artifacts/full-390.book-model.json')
assert len(full_book['pages']) == 390
full_page_by_id = {p['goalId']: p for p in full_book['pages']}
assert all(gid in full_page_by_id for gid in old_ids + protected_ids)
write('final-seven-pages-context-source-material-bindings.actual.json', {'schemaVersion': 1, 'authorFreezeSHA256': digest(read_bytes(freeze_path)), 'verifiedAuthorOwnFilesExcludingA': verified, 'roundAFilesNotRead': excluded_a, 'peerAResultsRead': False, 'pageRows': page_rows, 'thirteenSourceComponents': sources, 'sixteenCases': case_rows, 'priorFullScienceKEEP': prior_science['keep'], 'priorIndividualMemoryDecisionsRetained': True, 'priorMemoryReviewPath': str((PRIOR / 'seven-individual-memory-decisions.review.json').relative_to(ROOT)), 'old383WholeCanonicalGoalsExactVsPreviouslyReviewedV6': True, 'protected67WholeCanonicalGoalsExact': True, 'old383AndProtected67PresentInFinalFull390Book': True, 'priorFull383PageFingerprintAndScopeReproductionRetained': True, 'freshNativeDOnly': True, 'newGUIViewRegistration': False, 'wholeSourceApproval': False, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictNetGain': 0})
write('actual-input-bindings.independent-b.json', {'schemaVersion': 1, 'inputs': sorted(INPUTS.values(), key=lambda r: r['path']), 'peerAInputsRead': False, 'authorAndOwnOutputHistoryModified': False})
print('Final seven bindings valid: 7 pages, 13 bounded components, 16 cases, 383 old whole goals and 67 protected whole goals retained; A inputs excluded.')
