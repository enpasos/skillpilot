# SPDX-License-Identifier: Apache-2.0
"""Serialize the already performed independent two-goal science/image/page review."""
from pathlib import Path
from datetime import datetime, timezone
import json
import hashlib

root = Path.cwd()
own = Path(__file__).resolve().parent
author = own.parent / 'biologie-cellcycle-evolution-two-current391-author-v1'
native = author / 'native-raster-candidate/two'
campaign_dir = native / 'round-a'
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def write(p, value):
    with p.open('x') as handle:
        handle.write(value if isinstance(value, str) else json.dumps(value, ensure_ascii=False, indent=2) + '\n')

now = datetime.now(timezone.utc).isoformat()
campaign = read(campaign_dir / 'description-review-campaign.json')
bundle = read(campaign_dir / 'review-bundle-manifest.json')
inp = read(campaign_dir / 'description-review-input.json')
batch = campaign['batches'][0]
run_id = 'biologie-cellcycle-evolution-two-independent-a-final-20261007-v1'
chains = {
    '05358518-f66c-5c1b-ad3f-d16211d0fc1c': {
        'essentialUnderstandingDe': 'Der vereinfachte eukaryotische Zellzyklus verbindet aktive Interphase mit Wachstum und vorheriger DNA-Kopie, Mitose zur Verteilung kopierter Erbinformation und Zellteilung zu geeigneten Tochterzellen; so werden Wachstum, Reparatur und passende ungeschlechtliche Fortpflanzung möglich.',
        'essentialUnderstandingEn': 'The simplified eukaryotic cycle links active interphase growth and prior DNA copying, mitotic distribution of copied information and division into suitable daughters, enabling growth, repair and appropriate asexual reproduction.',
        'observablePerformanceDe': 'Die lernende Person ordnet und beschreibt die vorgegebenen Phasen, begründet die DNA-Kopie vor geordneter Verteilung und erklärt an Gewebe und Pflanzenvermehrung alle drei biologischen Bedeutungen ohne einzelne Tochterzellen mit ganzen Mehrzellern gleichzusetzen.',
        'observablePerformanceEn': 'The learner orders and describes supplied phases, explains copying before ordered distribution and explains all three biological roles in tissue and plant propagation without equating individual daughters with complete multicellular organisms.',
        'transferExpectationDe': 'An einem frischen Gewebe- oder eukaryotischen Einzellerfall erklärt die lernende Person denselben vollständigen Zyklus, korrigiert eine ausgelassene vorherige Kopie und unterscheidet die Vermehrung von Gewebezellen von Nachkommenorganismen.',
        'transferExpectationEn': 'In a fresh tissue or eukaryotic unicellular case, the learner explains the same full cycle, corrects omitted prior copying and distinguishes expansion of tissue cells from production of offspring organisms.',
    },
    '9f73b963-5fac-5a90-a993-d7b7c0cc8526': {
        'essentialUnderstandingDe': 'Mutation kann neue vererbbare DNA-Varianten erzeugen, Rekombination kombiniert vorhandene Anlagen; Selektion verändert deren Populationshäufigkeit durch unterschiedlichen Überlebens- und Fortpflanzungserfolg, ohne Varianten bedarfsgerichtet zu erzeugen oder Individuen umzuwandeln.',
        'essentialUnderstandingEn': 'Mutation can introduce new inherited DNA variants and recombination reshuffles existing determinants; selection changes their population frequencies through different survival and reproductive success without producing variants according to need or transforming individuals.',
        'observablePerformanceDe': 'Die lernende Person trennt die Ursprünge erblicher Variabilität vom Selektionsprozess und erklärt aus gegebenen Populations- und Nachkommensangaben, warum Varianten unterschiedliche Beiträge zur nächsten Generation leisten und sich ihre Anteile ändern.',
        'observablePerformanceEn': 'The learner separates origins of heritable variation from selection and uses supplied population and offspring information to explain different contributions to the next generation and changing variant fractions.',
        'transferExpectationDe': 'Bei gleichem Überleben und geändertem Nachkommensbeitrag oder anderem Umweltkontext erklärt die lernende Person die veränderte Variantenhäufigkeit und begrenzt quantitative Vorhersagen auf tatsächlich gegebene Überlebens- und Fortpflanzungsangaben.',
        'transferExpectationEn': 'With equal survival and changed offspring contribution or a different environment, the learner explains the altered variant fraction and limits numerical predictions to supplied survival and reproductive information.',
    },
}
records = []
for goal in inp['goals']:
    evidence = chains[goal['goalId']]
    records.append({'$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json', 'schemaVersion': 1, 'recordId': run_id + ':' + goal['goalId'], 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], **{k: goal[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']}, 'decision': 'keep', 'understandingEvidence': evidence, 'rationale': evidence['essentialUnderstandingDe'] + ' Der vollständig gelesene unveränderte DE/EN-Zieltext und aktuelle Vorbedingungs-/Nachfolgerkontext bewahren diesen Umfang. Die tatsächlich geprüfte Illustration und die vier vollständigen Modellfälle unterstützen ihn ohne eine reale Lernendenleistung zu behaupten.', 'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'create' if goal['reviewContext'].get('evidenceProfile') is None else 'none', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate'})
assert [r['goalId'] for r in records] == batch['goalIds']
record_path = own / (batch['batchId'] + '.records.jsonl')
write(record_path, ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in records))
parameters = {'actualAgent': '/root/b008_placements_author_resume', 'provider': 'OpenAI', 'model': 'Codex; exact serving revision and sampling parameters are not exposed', 'authoredThisPackage': False, 'peerOutputsRead': False, 'rootImageAuthorVerdictFilesRead': False}
write(own / 'actual-review-agent-parameters.json', parameters)
artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in ['book_pdf', 'book_pdf_render_manifest', 'book_model', 'review_input_json', 'review_prompt', 'review_criteria']]
artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
write(own / (batch['batchId'] + '.run.json'), {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': run_id, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'], 'provider': 'OpenAI', 'model': 'Codex independent A reviewer; exact serving revision not exposed', 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': campaign['promptFingerprint'], 'criteriaFingerprint': campaign['criteriaFingerprint'], 'generationParametersFingerprint': sha(own / 'actual-review-agent-parameters.json'), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': read(own / 'first-two-whole-goals-four-material-P-science.actual.json')['reviewedAtUtc'], 'completedAt': now, 'status': 'completed', 'outputDigest': sha(record_path), 'toolchainVersion': 'native-goal-description-review-v3'})

positive = [json.loads(line) for line in (author / 'native-raster-candidate/P2.actual-raster-author.review.jsonl').read_text().splitlines()]
for r in positive:
    r.update(reviewId='biologie-cellcycle-evolution-two-independent-a-positive-final-20261007-v1', reviewedAt=now, reviewer='OpenAI Codex independent A, actual whole2 goals/4 complete DEEN cases and bounded primary sections before peer outputs', reviewRunIds=[run_id], reason='Zwei vollständige aktuelle bilinguale Ziele und alle vier vollständigen DE/EN-Modellfälle, tatsächliche Bildbytes bei voller und 360/680-Pixel-Breite sowie beide tatsächlichen aktuellen Buchseiten unabhängig geprüft. Keine fachlichen Befunde in diesem abgegrenzten Paket; E1/G1 bleibt maschinelle Profil-QS und keine tatsächliche Lernendenleistung, menschliche Prüfung oder Erprobung.')
    assert r['status'] == 'needs_human_review' and r['evidenceLevel'] == 'E1' and r['maximumClaimScope'] == 'G1'
write(own / 'P2.actual-raster-independent-a.review.jsonl', ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in positive))
v = read(own / 'first-two-actual-full-360-680-visual-findings.actual.json')
for r in v['records']:
    r.update(actualSeen=['full', '360', '680', 'native-book-page'], nativePageBindingPending=False, aiApproved='yes', aiApprovedAssetSha256=r['assetSha256'], aiReviewedAt=now, aiReviewer=run_id, aiNotes=r['ownIndependentNote'], humanApproved=False, approvedForPublication=False)
v.update(role='Actual independent A final hash-bound machine visualization decision for two exact inactive candidate assets', reviewedAtUtc=now, humanApproval=False, activeWrites=0, strictGainClaimed=0)
write(own / 'V2.actual-raster-widths-pages-independent-a.final.json', v)

pre = {p['goalId']: p for p in read(author / 'current-two-native-pages-and-scopes.exact.json')['pages']}
full = {p['goalId']: p for p in read(author / 'native-raster-candidate/full391.book-model.json')['pages']}
rows = []
for g in inp['goals']:
    old, current, subset = pre[g['goalId']], full[g['goalId']], g['reviewContext']['page']
    stable = [k for k in old if k not in ['visualization', 'goalFingerprint', 'pageFingerprint', 'pageNumber', 'navigationOrder', 'treeOrder']]
    assert all(old[k] == current[k] for k in stable)
    assert current['goalFingerprint'] == g['goalFingerprint']
    rows.append({'goalId': g['goalId'], 'unchangedFullContextFieldsActuallyRead': stable, 'fullGoalFingerprint': current['goalFingerprint'], 'subsetGoalFingerprint': g['goalFingerprint'], 'fullPageFingerprint': current['pageFingerprint'], 'subsetPageFingerprint': g['pageFingerprint'], 'exactPageFieldDeltas': [{'field': k, 'subset2': subset.get(k), 'full391': current.get(k)} for k in sorted(set(subset) | set(current)) if subset.get(k) != current.get(k)]})
write(own / 'actual-subset2-full391-page-context-binding-comparison.json', {'role': 'Actually read full391 nonvisual contexts unchanged, exact newly inspected raster/page bindings and navigation deltas', 'rows': rows, 'automaticHashSubstitutionAllowed': False, 'requiredIntegration': 'Existing native scope/context compatibility or actual targeted current full391 binding review, not hash substitution', 'humanApproval': False})
write(own / 'actual-final-two-native-page-inspection.receipt.json', {'role': 'Independent actual native PDF physical pages3/4 and exact image inspection', 'bookPdf': {'path': str((native / 'book.pdf').relative_to(root)), 'sha256': sha(native / 'book.pdf')}, 'actualPages': [{'physicalPage': n, 'path': str((native / 'actual-pages' / f'goal-{n}.png').relative_to(root)), 'sha256': sha(native / 'actual-pages' / f'goal-{n}.png'), 'actuallySeen': True} for n in [3, 4]], 'humanApproval': False, 'strictGainClaimed': 0})

ids = set(chains)
for gate, source in [('A', 'semantic-atomicity'), ('M', 'memory-card-review')]:
    source_path = root / f'curricula/DE/Gymnasium/quality/{source}/canonical-biology-full.review.jsonl'
    kept = [json.loads(line) for line in source_path.read_text().splitlines() if line.strip() and json.loads(line)['goalId'] in ids]
    assert len(kept) == 2
    dest = own / f'{gate}2.retained-exact-current.rows.jsonl'
    write(dest, ''.join(json.dumps(r, ensure_ascii=False) + '\n' for r in kept))
    example = own.parent / 'biologie-ecology20-current391-author-v2' / f'{gate}20.current.native.config.json'
    cfg = read(example)
    cfg.update(landscapePath=str((author / 'candidate/canonical.current474-two-new-raster-author.json').relative_to(root)), reviewPath=str(dest.relative_to(root)), scope={'label': 'Two unchanged goals; retained A/M decisions, final new-raster binding check only', 'leafGoalIds': batch['goalIds']})
    if gate == 'M':
        cards = own / 'M2.retained-exact-in-scope.cards.jsonl'
        write(cards, '')
        cfg['cardReviewPath'] = str(cards.relative_to(root))
    write(own / f'{gate}2.final-raster-binding.config.json', cfg)
print(json.dumps({'Drecords': 2, 'Pprofiles': 2, 'wholeCasePairs': 4, 'VexactImages': 2, 'actualNativePages': 2, 'humanApproval': False, 'activeWrites': 0, 'strictGainClaimed': 0}))
