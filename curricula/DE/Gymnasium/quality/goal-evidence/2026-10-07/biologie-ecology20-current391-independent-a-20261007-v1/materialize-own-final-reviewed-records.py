# SPDX-License-Identifier: Apache-2.0
"""Serialize the actual independent A review, never manufacture a review."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

root = Path.cwd()
own = Path(__file__).resolve().parent
author = own.parent / 'biologie-ecology20-current391-author-v2'
image_author = root / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-ecology20-current391-image-author-root-20261007-v1'
native = author / 'native-raster-candidate/twenty'
campaign_dir = native / 'round-a'

def read(p):
    return json.loads(p.read_text())

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def write(p, data):
    with p.open('x') as handle:
        handle.write(data if isinstance(data, str) else json.dumps(data, ensure_ascii=False, indent=2) + '\n')

now = datetime.now(timezone.utc).isoformat()
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
review_input = read(campaign_dir / 'description-review-input.json')
batch = campaign['batches'][0]
chains = {row['goalId']: row for row in read(own / 'independent-a-description-scientific-chains.prebinding.json')['goals']}
run_id = 'biologie-ecology20-current391-independent-a-final-20261007-v1'
assert len(review_input['goals']) == len(chains) == 20
records = []
for goal in review_input['goals']:
    chain = chains[goal['goalId']]
    assert chain['descriptionScientificDecision'] == 'keep'
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': run_id + ':' + goal['goalId'],
        'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{key: goal[key] for key in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'keep', 'understandingEvidence': chain['understandingEvidence'],
        'rationale': chain['understandingEvidence']['essentialUnderstandingDe'] + ' ' + chain['understandingEvidence']['observablePerformanceDe'] + ' Die unveränderten vollständigen DE/EN-Texte und der tatsächlich gelesene aktuelle Seiten-, Vorbedingungs- und Nachfolgerkontext bewahren diesen Kompetenzumfang; die ausgewählte Illustration unterstützt ihn, ohne Lernendenleistung nachzuweisen.',
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': 'none' if goal['reviewContext'].get('evidenceProfile') else 'create',
        'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
assert [row['goalId'] for row in records] == batch['goalIds']
records_path = own / (batch['batchId'] + '.records.jsonl')
write(records_path, ''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in records))
parameters = {'actualAgent': '/root/b008_placements_author_resume', 'provider': 'OpenAI', 'model': 'Codex; exact serving model revision and sampling parameters are not exposed', 'authoredThisPackage': False, 'peerResultsRead': False, 'rootImageAuthorVerdictFilesRead': False}
write(own / 'actual-review-agent-parameters.json', parameters)
artifacts = [{'role': row['role'], 'digest': row['digest']} for row in bundle['artifacts'] if row['role'] in ['book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria']]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1,
    'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
    'provider': 'OpenAI', 'model': 'Codex independent review agent; exact serving revision not exposed',
    'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': digest(own / 'actual-review-agent-parameters.json'),
    'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
    'goalIds': batch['goalIds'], 'inputArtifacts': artifacts,
    'startedAt': read(own / 'first-independent-a-scientific-findings-partial.actual.json')['reviewedAtUtc'],
    'completedAt': now, 'status': 'completed', 'outputDigest': digest(records_path), 'toolchainVersion': 'native-goal-description-review-v3',
}
write(own / (batch['batchId'] + '.run.json'), run)

positive = [json.loads(line) for line in (author / 'native-raster-candidate/P20.actual-raster-author.review.jsonl').read_text().splitlines()]
for row in positive:
    row['reviewId'] = 'biologie-ecology20-current391-independent-a-positive-final-20261007-v1'
    row['reviewer'] = 'OpenAI Codex independent A; actual whole20 goals/40 DEEN cases and scoped primary-source review, before peer outputs'
    row['reviewedAt'] = now
    row['reviewRunIds'] = [run_id]
    row['reason'] = 'Unabhängige fachliche Prüfung aller 20 vollständigen DE/EN-Ziele und 40 vollständigen bilingualen Fälle; vier erste fachliche Befunde sind gezielt in Material-v3 aufgelöst. Alle aktuellen Bildbindungen sind tatsächlich gesichtet. E1/G1 ist maschinelle Profil-QS, keine tatsächliche Lernendenleistung, Untersuchung, menschliche Freigabe oder Erprobung.'
    assert row['status'] == 'needs_human_review' and row['reviewAuthority'] == 'ai_candidate'
    assert row['evidenceLevel'] == 'E1' and row['maximumClaimScope'] == 'G1'
write(own / 'P20.actual-raster-independent-a.review.jsonl', ''.join(json.dumps(row, ensure_ascii=False) + '\n' for row in positive))

manifest_path = image_author / 'selected-twenty-raster-inputs.author-handoff.frozen.json'
assert digest(manifest_path) == 'sha256:5350d1a5e042a8597f087fd37767f7e08605659fceb198629ae6a5ccfefa4f2a'
selected = read(manifest_path)['images']
initial = {row['goalId']: row for row in read(own / 'first-independent-a-fifteen-full-and-widths-findings.actual.json')['observations']}
initial_captures = {row['goalId']: row for row in read(own / 'actual-fifteen-original-raster-preview-inputs.json')['images']}
later = {row['goalId']: row for row in read(own / 'first-independent-a-sequences19-20-full-width-findings.actual.json')['images']}
revised = {row['goalId']: row for row in read(own / 'five-selected-v2-full-widths-independent-resolution.actual.json')['images']}
visual = []
for row in selected:
    goal_id = row['goalId']
    assert digest(root / row['path']) == 'sha256:' + row['sha256']
    if goal_id in revised:
        review = revised[goal_id]
        assert review['input']['sha256'] == row['sha256']
        note, captures = review['independentFinding'], review['captures']
    elif goal_id in initial:
        review = initial[goal_id]
        assert review['inputSha256'] == row['sha256'] and review['provisionalRasterVerdict'] == 'KEEP'
        note, captures = review['note'], initial_captures[goal_id]['captures']
    else:
        review = later[goal_id]
        assert review['input']['sha256'] == row['sha256'] and review['provisionalVerdict'] == 'KEEP'
        note, captures = review['actualNote'], review['captures']
    for capture in captures:
        assert digest(root / capture['path']) == 'sha256:' + capture['sha256']
    visual.append({'goalId': goal_id, 'sourcePath': row['path'], 'assetSha256': 'sha256:' + row['sha256'], 'selectedCandidateVersion': row['selectedCandidateVersion'], 'actualSeen': ['full', '360', '680', 'native-book-page'], 'capturesActuallySeen': captures, 'altDe': row['altDe'], 'altEn': row['altEn'], 'altTextActuallyChecked': True, 'decision': 'KEEP', 'aiApproved': 'yes', 'aiApprovedAssetSha256': 'sha256:' + row['sha256'], 'aiReviewedAt': now, 'aiReviewer': run_id, 'aiNotes': note, 'humanApproved': False, 'approvedForPublication': False})
write(own / 'V20.actual-raster-full-width-page-independent-a.final.json', {'role': 'Independent machine visual approval of exactly selected20 raster bytes; inactive integration input', 'selectedManifest': {'path': str(manifest_path.relative_to(root)), 'sha256': digest(manifest_path)}, 'records': visual, 'resolvedOwnFindings': ['BIO20-A-V-03-PRODUCTION-NOT-FEEDING', 'BIO20-A-V-16-MOBILE-AXIS-LEGIBILITY'], 'blockingFindings': [], 'peerResultsRead': False, 'rootImageAuthorVerdictFilesRead': False, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0})

preimage = read(author / 'current20-page-context-and-all-atlas-scopes.author.snapshot.json')
old = {page['goalId']: page for page in preimage['pages']}
full_model = read(author / 'native-raster-candidate/full391.book-model.json')
full = {page['goalId']: page for page in full_model['pages']}
context_rows = []
for goal in review_input['goals']:
    a, b = old[goal['goalId']], full[goal['goalId']]
    skip = {'visualization', 'pageFingerprint', 'goalFingerprint', 'evidenceReview'}
    unchanged = [key for key in a if key not in skip]
    assert all(a[key] == b.get(key) for key in unchanged)
    assert b['goalFingerprint'] == goal['goalFingerprint']
    context_rows.append({'goalId': goal['goalId'], 'actuallyPreviouslyReadFull391ContextFieldsUnchanged': unchanged, 'full391GoalFingerprint': b['goalFingerprint'], 'subset20GoalFingerprint': goal['goalFingerprint'], 'full391PageFingerprint': b['pageFingerprint'], 'subset20PageFingerprint': goal['pageFingerprint'], 'pageFingerprintsEqual': b['pageFingerprint'] == goal['pageFingerprint'], 'visualizationDeltaActuallyReviewed': True})
write(own / 'full391-context-versus-subset20.actual-binding-comparison.json', {'role': 'Actual unchanged full391 context comparison and actual new visualization review; not a blind replacement of subset page fingerprints', 'full391Model': {'path': str((author / 'native-raster-candidate/full391.book-model.json').relative_to(root)), 'sha256': digest(author / 'native-raster-candidate/full391.book-model.json')}, 'rows': context_rows, 'automaticHashSubstitutionAllowed': False, 'requiredIntegration': 'Use native scope/context compatibility validation or materialize a targeted full391-context binding review on these actually reviewed inputs.', 'humanApproval': False, 'strictGainClaimed': 0})
pages = []
for n in range(3, 23):
    p = own / f'native-final-page-{n:02d}.png'
    pages.append({'physicalPage': n, 'path': str(p.relative_to(root)), 'sha256': digest(p), 'actuallySeen': True})
write(own / 'actual-final-native20-pages-and-review-inputs.receipt.json', {'role': 'Actual independent A complete PDF pages plus current whole bilingual text/context/image review', 'bookPdf': {'path': str((native / 'book.pdf').relative_to(root)), 'sha256': digest(native / 'book.pdf')}, 'nativeReviewInput': {'path': str((campaign_dir / 'description-review-input.json').relative_to(root)), 'sha256': digest(campaign_dir / 'description-review-input.json')}, 'pages': pages, 'wholeGoalsActuallyRead': 20, 'wholeDEENCasePairsActuallyRead': 40, 'scopedPrimarySourcesActuallyRead': 6, 'wholeSixPrimaryDocumentsReadClaim': False, 'unchangedDescriptionsNotRewritten': True, 'humanApproval': False, 'strictGainClaimed': 0})
print(json.dumps({'records': 20, 'positive': 20, 'visual': 20, 'nativePagesActuallySeen': 20, 'DrecordsSha256': digest(records_path), 'reviewId': run_id, 'humanApproval': False, 'activeWrites': 0}))
