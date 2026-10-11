import datetime
import hashlib
import json
import pathlib

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-twenty-current311-resumed-native-preparation-20261008-v1'
OWN = pathlib.Path(__file__).parent


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def load(path):
    return json.loads(path.read_text())


def jsonl(path):
    return [json.loads(line) for line in path.read_text().splitlines() if line]


def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


parameters = {
    'reviewAgent': '/root/economics_independent_continuation_a',
    'provider': 'OpenAI',
    'modelIdentity': 'Codex session; exact serving model identifier not exposed',
    'samplingParameters': 'Not exposed by this session; no invented parameter values',
    'independentCandidateTextAuthor': False,
    'blindToOtherDescriptionReviewRuns': True,
    'descriptionReviewScope': '20 whole current bilingual contracts and 16 targeted changed owner-page contexts',
}
write(OWN / 'actual-review-session-parameter-disclosure.json', parameters)
parameter_digest = sha((OWN / 'actual-review-session-parameter-disclosure.json').read_bytes())
started = datetime.datetime.fromtimestamp(
    (OWN / 'actual-all56-frozen-whole-bytes-before-review.guard.json').stat().st_mtime,
    datetime.timezone.utc,
).isoformat()
profiles20 = {x['goalId']: x for x in jsonl(BASE / 'positive-current-final-images.review.jsonl')}
context_supplement = load(OWN / 'actual-current16-positive-supplement.snapshot.json')
profiles16 = {x['profile']['goalId']: x['profile'] for x in context_supplement}
supplement_paths = {
    str((BASE / n).relative_to(ROOT)) for n in [
        'positive-current-final-images.review.jsonl', 'positive.config.json',
        'atomicity.review.jsonl', 'atomicity.config.json', 'memory.review.jsonl',
        'memory.config.json', 'memory.cards.review.jsonl',
        'candidate-qa311.current311.inert.json',
        'actual-current261-owner-context-review-scope.json',
        'actual-whole311-page-impact.json',
    ]
}
for x in context_supplement:
    supplement_paths.update([x['configPath'], x['reviewPath']])
supplement_paths.update([
    'curricula/DE/Gymnasium/input/BY/gymnasium/source-extraction/DE_BY_WIRTSCHAFT_UND_RECHT_GYMNASIUM_LEHRPLANPLUS.source-extraction.json',
    'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_wirtschaft_und_recht_source_extraction_to_canonical_wirtschaft.review.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-bw-four-additional-career-source-locators-author-v2/lower-secondary/DE_BW_WBS_SEKI_BP2016.source-extraction.json',
    'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-methods-bw-four-additional-career-source-locators-author-v2/bw_wbs_lower_secondary_source_extraction_to_canonical_wirtschaft.current-source-pointer.candidate.json',
])

outputs = []
page_binding_rows = []
positive_binding_rows = []
for label, native, notes_name, profiles, role in [
    ('methods20', 'native-d-methods20-ordered-final', 'independent-methods20-understanding-and-reasons.author.json', profiles20, 'subject_reviewer'),
    ('context16', 'native-d-context16-ordered-final', 'independent-context16-understanding-and-reasons.author.json', profiles16, 'sequencing_representation_reviewer'),
]:
    round_path = BASE / native / 'round-a'
    campaign = load(round_path / 'description-review-campaign.json')
    bundle = load(round_path / 'review-bundle-manifest.json')
    notes = load(OWN / notes_name)
    batch = campaign['batches'][0]
    batch_input = round_path / 'batches' / (batch['batchId'] + '.input.jsonl')
    bound_rows = jsonl(batch_input)
    pages = load(BASE / native / 'bundle/book-model.json')['pages']
    by_id = {p['goalId']: p for p in pages}
    assert [x['goalId'] for x in notes] == batch['goalIds']
    assert [x['goal']['goalId'] for x in bound_rows] == batch['goalIds']
    assert len(notes) == (20 if label == 'methods20' else 16)
    run_id = f'wirtschaft-{label}-current311-final-blind-independent-a-20261008-v1'
    records = []
    for ordinal, (bound, note) in enumerate(zip(bound_rows, notes), start=1):
        g = bound['goal']
        p = profiles[g['goalId']]
        assert p['goalFingerprint'] == g['goalFingerprint']
        assert p['profileRuleVersion'] == 'positive-understanding-evidence-v2'
        assert p['reviewAuthority'] == 'ai_candidate'
        assert p['status'] == 'needs_human_review'
        assert p['evidenceLevel'] == 'E1' and p['maximumClaimScope'] == 'G1'
        assert len(p['profile']['applicationCaseBriefs']) >= 2
        page = by_id[g['goalId']]
        assert page['goalFingerprint'] == g['goalFingerprint']
        assert page['pageFingerprint'] == g['pageFingerprint']
        assert page['title'] == g['currentTitleDe']
        assert page['description'] == g['currentDescriptionDe']
        v = page['visualization']
        page_binding_rows.append({
            'scope': label, 'goalId': g['goalId'],
            'goalFingerprint': g['goalFingerprint'], 'pageFingerprint': g['pageFingerprint'],
            'pageNumber': page['pageNumber'], 'pdfPhysicalPage': page['pageNumber'] + 2,
            'nativePageMatchesBatchExactly': True,
            'visualizationBinding': v,
        })
        positive_binding_rows.append({
            'goalId': g['goalId'], 'profileFingerprint': p['profileFingerprint'],
            'goalFingerprint': p['goalFingerprint'], 'status': p['status'],
            'reviewAuthority': p['reviewAuthority'], 'evidenceLevel': p['evidenceLevel'],
            'maximumClaimScope': p['maximumClaimScope'],
            'loadedAs': 'Separate supplied final P20' if label == 'methods20' else 'Current registry P16 supplemental input',
            'nativeBatchEvidenceProfile': g['reviewContext'].get('evidenceProfile'),
            'newPositiveContentReviewClaim': False,
        })
        record = {
            '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
            'schemaVersion': 1,
            'recordId': f'{run_id}.goal-{ordinal:02d}',
            'runId': run_id,
            'campaignId': campaign['campaignId'],
            'roundId': campaign['roundId'],
            'bundleFingerprint': campaign['bundleFingerprint'],
            'bookDigest': campaign['bookDigest'],
            **{k: g[k] for k in [
                'goalId', 'goalFingerprint', 'pageFingerprint',
                'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn',
            ]},
            'decision': 'keep',
            'understandingEvidence': {
                k: note[k] for k in [
                    'essentialUnderstandingDe', 'essentialUnderstandingEn',
                    'observablePerformanceDe', 'observablePerformanceEn',
                    'transferExpectationDe', 'transferExpectationEn',
                ]
            },
            'rationale': note['rationale'],
            'evidenceProfileContract': 'positive-understanding-evidence-v2',
            'evidenceProfileRecommendation': 'none',
            'recordStatus': 'candidate',
            'reviewAuthority': 'ai_candidate',
        }
        records.append(record)
    results = round_path / 'results'
    results.mkdir(exist_ok=True)
    records_path = results / (batch['batchId'] + '.records.jsonl')
    run_path = results / (batch['batchId'] + '.run.json')
    assert not records_path.exists() and not run_path.exists(), 'Never overwrite previous submitted review results'
    record_bytes = ''.join(json.dumps(x, ensure_ascii=False, separators=(',', ':')) + '\n' for x in records).encode()
    records_path.write_bytes(record_bytes)
    considered_roles = {
        'book_model', 'book_pdf', 'book_pdf_render_manifest',
        'review_input_json', 'review_input_jsonl', 'review_prompt', 'review_criteria',
        'run_manifest_schema',
    }
    run = {
        '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
        'schemaVersion': 1, 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'],
        'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'],
        'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'],
        'provider': 'OpenAI', 'model': parameters['modelIdentity'], 'role': role,
        'promptFamilyId': 'skillpilot-bilingual-understanding-description-review-v2',
        'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'],
        'generationParametersFingerprint': parameter_digest,
        'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True,
        'goalIds': batch['goalIds'],
        'inputArtifacts': [
            {'role': x['role'], 'digest': x['digest']}
            for x in bundle['artifacts'] if x['role'] in considered_roles
        ] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
        'startedAt': started, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'status': 'completed', 'outputDigest': sha(record_bytes),
        'toolchainVersion': 'skillpilot-native-description-review-v2',
    }
    write(run_path, run)
    outputs.append({
        'scope': label, 'resultsDirectory': str(results.relative_to(ROOT)),
        'recordsPath': str(records_path.relative_to(ROOT)), 'recordsSha256': sha(record_bytes),
        'runPath': str(run_path.relative_to(ROOT)), 'runSha256': sha(run_path.read_bytes()),
        'records': len(records), 'keep': len(records), 'revise': 0, 'splitReview': 0, 'block': 0,
    })
write(OWN / 'actual-current36-page-and-visualization-bindings.snapshot.json', page_binding_rows)
write(OWN / 'actual-current36-positive-supplement-binding-disclosure.json', positive_binding_rows)
write(OWN / 'actual-two-round-a-output-handoff.json', outputs)
supplements = []
for p in sorted(supplement_paths):
    path = ROOT / p
    assert path.is_file(), p
    supplements.append({'path': p, 'wholeBytes': path.stat().st_size, 'sha256': sha(path.read_bytes())})
write(OWN / 'actual-supplemental-input-whole-bytes.guard.json', supplements)
print(json.dumps(outputs, ensure_ascii=False, indent=2))
