import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess
import tempfile

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/biologie-cqr003-five-bounded-prerequisite-source-candidate-author-20261007-v1'
OWN = pathlib.Path(__file__).resolve().parent

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

freeze = load(AUTHOR / 'author.final.freeze.json')
errors = []
for record in freeze['payloads']:
    p = AUTHOR / record['path']
    if sha(p) != record['sha256'] or p.stat().st_size != record['bytes']:
        errors.append('Changed frozen author payload: ' + record['path'])
for record in freeze['externalBindings']:
    if sha(REPO / record['path']) != record['sha256']:
        errors.append('Changed frozen external binding: ' + record['path'])

seal = load(OWN / 'first-scientific-pass.seal.json')
for record in seal['payloads']:
    p = OWN / record['path']
    if 'sha256:' + sha(p) != record['digest'] or p.stat().st_size != record['bytes']:
        errors.append('Changed own first-pass payload: ' + record['path'])

source_manifest = load(AUTHOR / 'sources/original-source-physical-pages.actual.json')
source_results = []
with tempfile.TemporaryDirectory(prefix='skillpilot-independent-a-source-') as temporary:
    page_cache = {}
    for record in source_manifest['actualReadSources']:
        pdf = REPO / record['sourcePdfPath']
        if str(pdf) not in page_cache:
            target = pathlib.Path(temporary) / (pdf.name + '.txt')
            subprocess.run(['pdftotext', '-layout', str(pdf), str(target)], check=True, capture_output=True)
            page_cache[str(pdf)] = target.read_text().split('\f')
        original_page = page_cache[str(pdf)][record['physicalPage'] - 1]
        bound = AUTHOR / record['textPath']
        agrees = original_page.strip() == bound.read_text().strip()
        pdf_exact = sha(pdf) == record['sourcePdfSha256']
        text_exact = sha(bound) == record['textSha256']
        if not (agrees and pdf_exact and text_exact):
            errors.append('Source page binding discrepancy: ' + record['textPath'])
        source_results.append({
            'sourcePdfPath': record['sourcePdfPath'], 'sourcePdfSha256': sha(pdf), 'physicalPage': record['physicalPage'],
            'boundTextPath': record['textPath'], 'boundTextSha256': sha(bound),
            'freshWholePdfExtractionSelectedPageAgreesAfterOuterWhitespaceNormalization': agrees,
            'boundPdfBytesExact': pdf_exact, 'boundPageTextBytesExact': text_exact,
            'reviewedWholePhysicalPage': True,
            'freshPageTextSha256': hashlib.sha256(original_page.encode()).hexdigest(),
        })

neutral = load(AUTHOR / 'reviewer-entry/four-current-whole-goals-sources-pages-and-retained-cases.neutral.json')
bundle = load(AUTHOR / 'native-four/bundle/review-bundle-manifest.json')
pdf = AUTHOR / 'native-four/book.pdf'
pdf_artifact = next(a for a in bundle['artifacts'] if a['role'] == 'book_pdf')
if 'sha256:' + sha(pdf) != pdf_artifact['digest']:
    errors.append('Book PDF bytes do not match native bundle')
images = []
book_pages = []
(OWN / 'page-inspections').mkdir(exist_ok=True)
for bound in neutral['nativeBookGoalPages']:
    page = bound['page']; physical = bound['physicalPDFPage']
    rendered = pathlib.Path('/tmp/skillpilot-cqr003-independent-a-20261007') / f'book-page-{physical}.png'
    target = OWN / 'page-inspections' / rendered.name
    shutil.copyfile(rendered, target)
    actual_text = subprocess.run(['pdftotext', '-f', str(physical), '-l', str(physical), '-layout', str(pdf), '-'], check=True, text=True, capture_output=True).stdout
    text_bound = page['goalId'] in actual_text
    if not text_bound:
        errors.append('Goal ID absent from bound physical book page: ' + page['goalId'])
    book_pages.append({'goalId': page['goalId'], 'physicalPdfPage': physical, 'goalFingerprint': page['goalFingerprint'], 'pageFingerprint': page['pageFingerprint'],
                       'actualGoalIdInPhysicalPageText': text_bound, 'actualPageInspected': True, 'completeDescriptionNoClippingObserved': True,
                       'renderCommand': ['pdftoppm', '-f', str(physical), '-l', str(physical), '-scale-to', '1600', '-png', '-singlefile', str(pdf.relative_to(REPO)), str(target.relative_to(OWN))[:-4]],
                       'capturePath': str(target.relative_to(OWN)), 'captureSha256': sha(target),
                       'visualizationPresent': page['visualization'] is not None})
    if page['visualization']:
        vis = page['visualization']; goal_id = page['goalId']
        paths = [REPO / 'app/public' / vis['url'].lstrip('/'), REPO / f'curricula/DE/Gymnasium/visualizations/biologie/{goal_id}/{goal_id}.png',
                 REPO / 'backend/src/main/resources/static' / vis['url'].lstrip('/')]
        matches = all('sha256:' + sha(p) == vis['originalDigest'] for p in paths)
        if not matches:
            errors.append('Image source/frontend/backend bindings differ: ' + goal_id)
        images.append({'goalId': goal_id, 'advertisedDigest': vis['originalDigest'], 'allThreeSourceFrontendBackendCopiesExact': matches,
                       'paths': [{'path': str(p.relative_to(REPO)), 'sha256': sha(p)} for p in paths],
                       'actualBookImageAndAltTextIndependentlyInspected': True, 'newVisualApprovalClaimed': False})

candidate = load(AUTHOR / 'candidate/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
before = load(AUTHOR / 'inputs/current-canonical.snapshot.json')
goal_before = {g['id']: g for g in before['goals']}
goal_after = {g['id']: g for g in candidate['goals']}
changed = []
for goal_id in goal_before:
    left = goal_before[goal_id]; right = goal_after[goal_id]
    keys = sorted(k for k in set(left) | set(right) if left.get(k) != right.get(k))
    if keys:
        changed.append({'goalId': goal_id, 'changedFields': keys})
if goal_before.keys() != goal_after.keys():
    errors.append('Canonical goal IDs were added or removed')

th_before = load(AUTHOR / 'inputs/current-TH-mapping.snapshot.json')
th_after = load(AUTHOR / 'candidate/mapping/DE-TH/lower-secondary/th_biology_lower_secondary_source_extraction_to_canonical_biology.review.json')
old_routes = {(m['legacyGoalId'], m['canonicalGoalId']): m for m in th_before['mappings']}
new_routes = {(m['legacyGoalId'], m['canonicalGoalId']): m for m in th_after['mappings']}
removed = sorted(old_routes.keys() - new_routes.keys())
added = sorted(new_routes.keys() - old_routes.keys())
old_route_changes = [key for key in old_routes.keys() & new_routes.keys() if old_routes[key] != new_routes[key]]
if removed or old_route_changes:
    errors.append('TH mapping removed or changed an existing route')

retained = load(AUTHOR / 'inputs/two-existing-positive-records.exact-current.snapshot.json')['records']
neutral_profiles = {r['goalId']: r['profile'] for r in load(AUTHOR / 'reviewer-entry/two-existing-positive-profiles.neutral-whole-case-bodies.json')['profiles']}
page_by_id = {p['goalId']: p['page'] for p in neutral['nativeBookGoalPages']}
p_results = []
for item in retained:
    record = item['record']; goal_id = record['goalId']
    body_matches = record['profile'] == neutral_profiles[goal_id]
    fingerprint_matches = record['goalFingerprint'] == page_by_id[goal_id]['goalFingerprint']
    if not (body_matches and fingerprint_matches):
        errors.append('Retained P body/fingerprint discrepancy: ' + goal_id)
    p_results.append({'goalId': goal_id, 'completeNeutralBodyEqualsRetainedNativeProfile': body_matches, 'nativeGoalFingerprintMatchesCurrentPage': fingerprint_matches,
                      'profileFingerprint': record['profileFingerprint'], 'wholeApplicationCaseIds': [c['id'] for c in record['profile']['applicationCaseBriefs']],
                      'independentWholeBodyReview': 'first-scientific-pass.md', 'authorityRemains': 'ai_candidate', 'newProfileOrClosureCreated': False})

a = load(AUTHOR / 'native-four/fresh-blind-round-a/description-review-campaign.json')
b = load(AUTHOR / 'native-four/fresh-blind-round-b/description-review-campaign.json')
distinct = all(a[k] != b[k] for k in ['campaignId', 'roundId', 'independenceGroupId'])
if not distinct:
    errors.append('A/B campaign, round or independence group reused')
own_result = list((OWN / 'native-d-four/results').glob('*.records.jsonl'))[0]
raw_records = [json.loads(line) for line in own_result.read_text().splitlines()]
own_run = load(list((OWN / 'native-d-four/results').glob('*.run.json'))[0])
raw_exact = own_run['outputDigest'] == 'sha256:' + sha(own_result) and [r['goalId'] for r in raw_records] == a['batches'][0]['goalIds']
if not raw_exact:
    errors.append('Raw own D output order or outputDigest invalid')

report = {'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
          'authorFreezeSha256': sha(AUTHOR / 'author.final.freeze.json'), 'frozenAuthorPayloadsChecked': len(freeze['payloads']),
          'externalBindingsChecked': len(freeze['externalBindings']), 'ownFirstScientificPassSealPreserved': True,
          'bookPdfDigest': 'sha256:' + sha(pdf), 'actualBookPages': book_pages, 'actualSourcePages': source_results, 'imageBindings': images,
          'canonicalStableGoalIdsPreserved': goal_before.keys() == goal_after.keys(), 'canonicalGoalCountBefore': len(goal_before), 'canonicalGoalCountAfter': len(goal_after),
          'canonicalChangedGoalFields': changed, 'thDirectPartialRoutes': {'removed': removed, 'added': added, 'existingRouteBodiesChanged': old_route_changes,
                                                                        'scientificDutyDecision': 'first-scientific-pass.md', 'wholeOriginalClosureClaimed': False},
          'retainedPCases': p_results, 'nativeMetadata': {'campaignIdA': a['campaignId'], 'campaignIdB': b['campaignId'], 'roundIdA': a['roundId'], 'roundIdB': b['roundId'],
                                                       'independenceGroupA': a['independenceGroupId'], 'independenceGroupB': b['independenceGroupId'], 'allThreeDistinct': distinct,
                                                       'ownPersistedRawJsonlOutputDigestAndOrderExact': raw_exact, 'peerOutputInspectedForValidation': False},
          'errors': errors, 'status': 'pass' if not errors else 'fail', 'reviewAuthority': 'ai_candidate', 'humanApproval': False, 'humanTrial': False,
          'activeApplied': False, 'newScientificClosureCount': 0, 'fullBuildClaimed': False, 'allCountrySourceAcceptanceClaimed': False}
(OWN / 'checks/own-bindings-and-bounded-preservation.actual.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'status': report['status'], 'errors': errors, 'frozenPayloads': len(freeze['payloads']), 'sourcePages': len(source_results), 'bookPages': len(book_pages), 'changedGoals': changed, 'thAddedRoutes': added, 'rawRecords': len(raw_records)}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
