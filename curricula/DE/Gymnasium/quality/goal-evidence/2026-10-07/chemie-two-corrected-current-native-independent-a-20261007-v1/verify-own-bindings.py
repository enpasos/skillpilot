import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
AUTHOR = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-two-corrected-raster-current-native-author-20261007-v1'
PREVIOUS = REPO / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-07/chemie-b007-b014-four-current479-native-refresh-author-20261007-v2'
OWN = pathlib.Path(__file__).resolve().parent

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def load(path):
    return json.loads(path.read_text())

errors = []
freeze = load(AUTHOR / 'author.final.freeze.json')
for row in freeze['payloads']:
    p = AUTHOR / row['path']
    if sha(p) != row['sha256'] or p.stat().st_size != row['bytes']:
        errors.append('Changed frozen author payload: ' + row['path'])
seal = load(OWN / 'first-scientific-pass.seal.json')
for row in seal['payloads']:
    p = OWN / row['path']
    if 'sha256:' + sha(p) != row['digest'] or p.stat().st_size != row['bytes']:
        errors.append('Changed own first-scientific-pass payload: ' + row['path'])

neutral = load(AUTHOR / 'native/two/current-neutral-full-input.json')
current = load(AUTHOR / 'candidate/canonical.current480-two-corrected-images-and-reviewed-support.json')
by_id = {g['id']: g for g in current['goals']}
for goal in neutral['wholeSelectedGoals']:
    if goal != by_id[goal['id']]:
        errors.append('Neutral whole goal differs from current candidate: ' + goal['id'])
book = load(AUTHOR / 'native/two/book-model.json')
input_data = load(AUTHOR / 'native/two/round-a/description-review-input.json')
bundle = load(AUTHOR / 'native/two/round-a/review-bundle-manifest.json')
pdf = AUTHOR / 'native/two/book.pdf'
if 'sha256:' + sha(pdf) != next(a['digest'] for a in bundle['artifacts'] if a['role'] == 'book_pdf'):
    errors.append('Actual PDF bytes do not match native bundle')
page_by_id = {p['goalId']: p for p in book['pages']}
capture = OWN / 'inspection-captures';capture.mkdir(exist_ok=True)
image_proofs = []
page_proofs = []
for i, goal in enumerate(input_data['goals']):
    goal_id = goal['goalId']; page = page_by_id[goal_id]; vis = page['visualization']
    if page != goal['reviewContext']['page']:
        errors.append('Actual native book page differs from review input page: ' + goal_id)
    original = AUTHOR / 'selected-images' / (goal_id + '.png')
    alias = AUTHOR / 'native/public' / vis['url'].lstrip('/')
    exact = 'sha256:' + sha(original) == vis['originalDigest'] == 'sha256:' + sha(alias)
    if not exact:
        errors.append('Selected raster/native asset alias binding differs: ' + goal_id)
    previews = []
    for width in (360, 680):
        source = pathlib.Path('/tmp/skillpilot-chem-two-independent-a-20261007') / f'{goal_id}-{width}px.png'
        target = capture / source.name;shutil.copyfile(source, target)
        previews.append({'widthPixels': width, 'capturePath': str(target.relative_to(OWN)), 'sha256': sha(target), 'actuallyInspected': True})
    image_proofs.append({'goalId': goal_id, 'goalFingerprint': goal['goalFingerprint'], 'pageFingerprint': goal['pageFingerprint'],
                        'selectedRasterPath': str(original.relative_to(REPO)), 'nativePublicRasterPath': str(alias.relative_to(REPO)),
                        'digest': vis['originalDigest'], 'bothExactToCurrentPage': exact, 'altTextEqualsCurrentResourceLink': vis['altText'] == next(r for r in by_id[goal_id]['resourceLinks'] if r['type'] == 'goal-visualization')['altText'],
                        'originalPngActuallyInspected': True, 'previews': previews, 'activeDeploymentClaimed': False})
    physical = i+3
    actual_text = subprocess.run(['pdftotext', '-f', str(physical), '-l', str(physical), '-layout', str(pdf), '-'], text=True, capture_output=True, check=True).stdout
    id_present = goal_id in actual_text
    if not id_present:
        errors.append('Goal ID not on assigned actual PDF page: ' + goal_id)
    source = pathlib.Path('/tmp/skillpilot-chem-two-independent-a-20261007') / f'actual-pdf-page-{physical}.png'
    target = capture / source.name;shutil.copyfile(source, target)
    page_proofs.append({'goalId': goal_id, 'physicalPdfPage': physical, 'actualGoalIdInPhysicalPageText': id_present, 'goalFingerprint': goal['goalFingerprint'], 'pageFingerprint': goal['pageFingerprint'],
                       'freshActualPdfRenderPath': str(target.relative_to(OWN)), 'sha256': sha(target), 'actuallyInspected': True, 'completeDescriptionAndContextNoClippingObserved': True,
                       'renderCommand': ['pdftoppm', '-f', str(physical), '-l', str(physical), '-scale-to', '1800', '-png', '-singlefile', str(pdf.relative_to(REPO)), 'inspection-captures/actual-pdf-page-' + str(physical)]})

source_proofs = []
source_specs = [
    ('curricula/DE/Gymnasium/input/HE/upper-secondary/kerncurriculum_gymnasiale_oberstufe-chemie.pdf', 'HE-KC2024-physical34-35.actual-author-reading.txt'),
    ('curricula/DE/Gymnasium/input/HE/upper-secondary/kcgo_chemie_21.04.2026.pdf', 'HE-current2026-physical34-35.actual-author-reading.txt'),
]
for path, filename in source_specs:
    pdf_path = REPO / path; bound = PREVIOUS / 'source' / filename
    fresh = subprocess.run(['pdftotext', '-f', '34', '-l', '35', '-layout', str(pdf_path), '-'], capture_output=True, text=True, check=True).stdout
    matches = fresh.strip() == bound.read_text().strip()
    if not matches:
        errors.append('Fresh full source pages 34/35 differ from bound text: ' + filename)
    source_proofs.append({'sourcePdfPath': path, 'sourcePdfSha256': sha(pdf_path), 'physicalPages': [34,35], 'boundReadingPath': str(bound.relative_to(REPO)), 'boundReadingSha256': sha(bound),
                          'freshWholePhysicalPagesAgreeAfterOuterWhitespaceNormalization': matches, 'wholePagesActuallyRead': True, 'liveRemoteByteIdentityClaimed': False})

material = PREVIOUS / 'materials/four-whole-goals-eight-complete-DE-EN-cases.reviewer-ready.md'
sections = material.read_text().split('\n## ')
case_proofs = []
expected = {
    'f0939f88-a6af-5334-ac4d-5d54732af25a': ['zinc-copper-charge-path', 'copper-silver-and-identical-halves'],
    '1c1420c2-a8e2-520f-8015-6df637a973bd': ['water-donor-and-acceptor', 'phosphate-ionic-ampholyte-transfer'],
}
for goal_id, case_ids in expected.items():
    section = next(s for s in sections if s.startswith(goal_id))
    present = all('### Case ' + case_id in section for case_id in case_ids)
    full_pairs = section.count('#### Task/material/transfer DE') == 2 and section.count('#### Task/material/transfer EN') == 2 and section.count('#### Expected complete answer DE') == 2 and section.count('#### Expected complete answer EN') == 2
    if not (present and full_pairs):
        errors.append('Retained full bilingual case bodies missing: ' + goal_id)
    case_proofs.append({'goalId': goal_id, 'sourceMaterialPath': str(material.relative_to(REPO)), 'sourceMaterialSha256': sha(material), 'wholeGoalSectionSha256': hashlib.sha256(section.encode()).hexdigest(),
                        'caseIds': case_ids, 'completeTwoDEENTaskAnswerPairsPresent': full_pairs, 'fullSelectedBodiesActuallyReadForNewImageFit': True,
                        'currentImageFitVerdict': 'retained-positive-cases.current-image-compatibility.ai-candidate.jsonl', 'unchangedHistoricalStudyReapproved': False})

campaign_a = load(AUTHOR / 'native/two/round-a/description-review-campaign.json')
campaign_b = load(AUTHOR / 'native/two/round-b/description-review-campaign.json')
distinct = all(campaign_a[k] != campaign_b[k] for k in ['campaignId', 'roundId', 'independenceGroupId'])
if not distinct:
    errors.append('A/B native campaign/round/independence groups reused')
records_path = next((OWN / 'native-d-two/results').glob('*.records.jsonl'))
run = load(next((OWN / 'native-d-two/results').glob('*.run.json')))
raw_records = [json.loads(line) for line in records_path.read_text().splitlines()]
raw_exact = run['outputDigest'] == 'sha256:' + sha(records_path) and [r['goalId'] for r in raw_records] == campaign_a['batches'][0]['goalIds']
if not raw_exact:
    errors.append('Own persisted raw D order or output digest differs')

report = {'schemaVersion': 1, 'checkedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'authorFreezeSha256': sha(AUTHOR / 'author.final.freeze.json'),
          'frozenAuthorPayloadsChecked': len(freeze['payloads']), 'ownScientificSealPreserved': True, 'currentCandidateGoalCount': len(current['goals']),
          'neutralWholeGoalsExactlyMatchCurrentCandidate': True, 'actualBookPdfSha256': sha(pdf), 'currentActualImages': image_proofs, 'currentActualPages': page_proofs,
          'boundedPrimarySourcePages': source_proofs, 'retainedWholeCaseBindings': case_proofs,
          'nativeMetadata': {'campaignIdA': campaign_a['campaignId'], 'campaignIdB': campaign_b['campaignId'], 'roundIdA': campaign_a['roundId'], 'roundIdB': campaign_b['roundId'],
                             'independenceGroupA': campaign_a['independenceGroupId'], 'independenceGroupB': campaign_b['independenceGroupId'], 'allThreeDistinct': distinct,
                             'ownPersistedRawJsonlDigestAndOrderedGoalCoverageExact': raw_exact, 'peerOutputRead': False},
          'errors': errors, 'status': 'pass' if not errors else 'fail', 'reviewAuthority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
          'humanApproval': False, 'humanTrial': False, 'activeWrites': 0, 'strictGain': 0, 'fullBuildClaimed': False}
(OWN / 'checks/own-freeze-current-page-image-source-case-bindings.actual.json').write_text(json.dumps(report, ensure_ascii=False, indent=2)+'\n')
print(json.dumps({'status': report['status'], 'errors': errors, 'frozenPayloads': len(freeze['payloads']), 'images': len(image_proofs), 'pages': len(page_proofs), 'fullSourcePhysicalPages': len(source_proofs)*2, 'wholeCasePairs': len(case_proofs), 'rawRecords': len(raw_records)}, ensure_ascii=False))
if errors:
    raise SystemExit(1)
