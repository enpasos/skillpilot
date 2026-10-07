#!/usr/bin/env python3
"""Read the bounded candidate, native outputs and PDF text; do not approve content."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

OUT = Path(__file__).resolve().parents[1]
ROOT = OUT.parents[6]

def read(name):
    return json.loads((OUT / name).read_text())

def normalized(text):
    return ''.join(c for c in text if c.isalnum()).lower()

def pin(path):
    raw = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}

before = read('inputs/current-canonical.snapshot.json')
after = read('candidate/canonical.whole-current-plus-targeted-corrections.json')
before_goals = {g['id']: g for g in before['goals']}
after_goals = {g['id']: g for g in after['goals']}
ids = read('configs/native-d-seventeen.batch.config.json')['goalIds']
dinput = read('native-d-seventeen/round-a/description-review-input.json')
model = read('native-d-seventeen/bundle/book-model.json')
render = read('native-d-seventeen/bundle/book.pdf.render-manifest.json')
cases = read('candidate/complete34-bilingual-material-cases.author.json')['cases']
profiles = read('candidate/positive-evidence17.author-candidate-set.json')['goals']
records = [json.loads(line) for line in (OUT / 'candidate/positive-evidence17.author-candidates.review.jsonl').read_text().splitlines()]
pdf_pages = (OUT / 'qa-artifacts/native-book.pdf-layout.txt').read_text().split('\f')
if not pdf_pages[-1].strip():
    pdf_pages.pop()
assert len(pdf_pages) == 19
assert len(model['pages']) == len(dinput['goals']) == len(records) == 17
assert len(cases) == 34
assert render['physicalPageCount'] == 19 and render['goalPageCount'] == 17
assert [g['goalId'] for g in model['pages']] == ids
assert [g['goalId'] for g in dinput['goals']] == ids
assert [g['goalId'] for g in records] == ids

pagechecks = []
for page, input_goal in zip(model['pages'], dinput['goals']):
    gid = page['goalId']
    expected = after_goals[gid]
    physical = page['pageNumber'] + 2
    pdftext = pdf_pages[physical - 1]
    checks = {
        'goalId': gid,
        'goalPageNumber': page['pageNumber'],
        'physicalPageNumber': physical,
        'pdfContainsExactGoalId': gid in pdftext,
        'pdfContainsWholeDeSentenceAfterLayoutNormalization': normalized(expected['description']) in normalized(pdftext),
        'nativeDeSentenceExact': input_goal['currentDescriptionDe'] == expected['description'],
        'nativeEnSentenceExact': input_goal['currentDescriptionEn'] == expected['descriptionEn'],
        'nativeDeTitleExact': input_goal['currentTitleDe'] == expected['title'],
        'nativeEnTitleExact': input_goal['currentTitleEn'] == expected['titleEn'],
        'nativeRequiresExact': input_goal['canonicalContext']['requires'] == expected['requires'],
        'nativeApplicabilityExact': input_goal['canonicalContext']['applicability'] == expected['applicability'],
        'visualizationBound': page['visualization'] is not None,
        'breadcrumbs': page['breadcrumbs'],
    }
    assert all(value for key, value in checks.items() if key.startswith(('pdfContains', 'native'))), checks
    if gid in ['c0f1bf09-5a70-5006-b1e9-e91f786a63bf', '02dc29ae-4046-556a-b048-d64a0feb8f16', '7a05a1ce-45d3-571e-be51-afcd8dfd33ca']:
        assert all('(Sek I)' not in label for label in page['breadcrumbs'])
        assert 'SekII' in expected['tags']
    pagechecks.append(checks)

casechecks = []
for profile in profiles:
    group = [case for case in cases if case['goalId'] == profile['goalId']]
    briefs = profile['profile']['applicationCaseBriefs']
    assert len(group) == len(briefs) == 2
    for case, brief in zip(group, briefs):
        for language, suffix in [('de', 'De'), ('en', 'En')]:
            material_and_task = case['material'][language] + ' ' + case['taskDemand'][language]
            assert brief['taskDemand' + suffix] == material_and_task
            assert brief['expectedPerformance' + suffix] == case['expectedPerformance'][language]
            assert brief['understandingFocus' + suffix] == case['specificBoundaryOrCounterexample'][language]
            casechecks.append({'goalId': case['goalId'], 'caseId': case['caseId'], 'language': language, 'completeMaterialAndTaskExact': True, 'fullReferenceResponseExact': True, 'negativeCaseExact': True})

holds = read('candidate/preserved-holds.author.json')
for hold in holds['inScopeVisualizationHolds']:
    assert after_goals[hold['goalId']]['resourceLinks'] == []
    assert next(p for p in model['pages'] if p['goalId'] == hold['goalId'])['visualization'] is None
for hold in holds['excludedSourceHolds']:
    assert hold['goalId'] not in ids

for record in records:
    assert record['status'] == 'needs_human_review'
    assert record['reviewAuthority'] == 'ai_candidate'
    assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
    assert record['reviewRunIds'] == []
routes = read('candidate/two-bounded-direct-source-routes.author.json')['routes']
assert len(routes) == 2
for route in routes:
    assert route['beforeDirectMappingCount'] == 0
    assert route['literalWitness'] in (ROOT / route['primaryText']['path']).read_text()
    assert route['proposedMappingRowToAppend']['canonicalGoalId'] == route['goalId']
    assert route['wholeBroadOriginalSourceClosure'] is False

input_freeze = read('inputs/input-freeze.manifest.json')
current_input_checks = []
for bound in input_freeze['inputs'] + input_freeze['retainedCurrentVisualizationAssets']:
    for key in ['source', 'frozenCopy']:
        expected = bound[key]
        actual = pin(ROOT / expected['path'])
        assert actual == expected, actual
    current_input_checks.append({'source': bound['source']['path'], 'sha256': bound['source']['sha256'], 'matchesFrozenCopyAndLiveAtCheck': True})
for tool in input_freeze['productionToolSourcePins']:
    assert pin(ROOT / tool['path']) == tool
changed_ids = [gid for gid in before_goals if before_goals[gid] != after_goals[gid]]
assert set(changed_ids) == {'fd309753-4d48-5570-a4ec-09dfeb20ff9c', '22133f29-ef02-4408-8f8d-2bbea3275d91', '9751b6d8-cde3-527b-b37c-babb6cee79d2'}
report = {
    'documentType': 'Bounded AUTHOR candidate scope, whole-input equality and native output integrity check; not substantive or independent approval',
    'checkedAtUTC': datetime.now(timezone.utc).isoformat(),
    'status': 'PASS for exact frozen inputs',
    'strictNetGain': 0, 'humanApproval': False, 'independentApproval': False,
    'goalCount': 17, 'caseCount': 34, 'languageBodies': 68,
    'physicalPdfPages': 19, 'nativeDGoalPages': 17,
    'nativeBookPdfLocale': model['book']['locale'],
    'languageDisclosure': 'The native de-DE PDF displays DE sentences. Full EN sentences and titles are exact in native description-review-input v3 and in whole17/material files; no English PDF claim.',
    'threeChangedWholeGoals': changed_ids,
    'retainedBoundVisualizations': sum(p['visualization'] is not None for p in model['pages']),
    'preservedVHoldCount': 3, 'excludedSourceHoldCount': 3,
    'currentInputChecks': current_input_checks,
    'nativePageChecks': pagechecks,
    'fullBilingualCaseChecks': casechecks,
    'pAuthority': '17 ai_candidate / needs_human_review / E1 / G1; no independent or learner runs',
    'sourceScope': 'Two literal bounded direct routes only; existing full extraction/old mapping are copied inputs, not broad scientific source closure.',
}
if not (OUT / 'final-own-files.freeze.json').exists():
    (OUT / 'qa-artifacts/candidate-scope-and-native-integrity.check.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: report[k] for k in ['status', 'goalCount', 'caseCount', 'languageBodies', 'physicalPdfPages', 'retainedBoundVisualizations', 'strictNetGain']}))
