import copy
import datetime
import hashlib
import json
from pathlib import Path

base = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06')
author = base / 'chemie-current-fifteen-final-native-review-inputs-author-v3'
own = base / 'chemie-current-five-targeted-native-d-independent-b-v3'
round_b = author / 'native-d-five/round-b'
read = lambda p: json.loads(p.read_text())
sha = lambda b: 'sha256:' + hashlib.sha256(b).hexdigest()
campaign = read(round_b / 'description-review-campaign.json')
inputs = read(round_b / 'description-review-input.json')
bundle = read(round_b / 'review-bundle-manifest.json')
old_file = base / 'chemie-current-fifteen-native-d-independent-a-v1/results/chemie-current-amv-dp-gap-fifteen-20261006-author-v1-first-pass-a.batch-001.records.jsonl'
old_by_id = {r['goalId']: r for r in map(json.loads, old_file.read_text().splitlines())}
run_id = 'chemie-current-five-targeted-native-d-independent-b-v3-run-001'
now = datetime.datetime.now(datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
review_started = datetime.datetime.fromtimestamp((own / 'actual-pdf-page-render.receipt.json').stat().st_mtime, datetime.timezone.utc).isoformat().replace('+00:00', 'Z')
rationales = {
    '3d3231f9-039d-5ce5-9e8e-af219c7fee08': 'KEEP after independently reading the actual final DE/EN descriptions, changed alt text, full native page/context and physical PDF page 3 plus its actual HTML page. The added DE noun Kräften resolves the incomplete force name without changing the assessable competence: explaining melting, boiling and solubility differences for selected substances from their relevant interactions. The existing CH4/CH3Cl/CH3OH example correctly illustrates bounded boiling-point comparisons; it does not claim a universal melting-point order. Original HE physical/printed 36 and 38 support the narrow structure/property and intermolecular-interaction clauses, with 39 supporting the alkanol comparison. Canonical course/phase breadcrumbs and inherited SourceAtlas witnesses are retained metadata, not independent evidence of every national GK/LK obligation. Practical melting coverage in concrete P material remains a separate pending gate; no learner evidence is asserted.',
    'b8d3b453-d638-5518-aab0-d84ec2e8567c': 'KEEP after a fresh direct inspection of physical PDF page 4 and the actual HTML page using the exact new native PNG and its current alt text. The complete unchanged DE/EN competence is explainable and atomic for the bounded simple-arene school model. The displayed six-carbon rings remain closed; the middle nonaromatic contributor has two double bonds, one positive formal charge, and E/H on the same attacked carbon. Release of H+ restores aromaticity while retaining the substituted E and preserves total charge. This actually resolves the old image-bound charge/aromaticity defect, rather than only changing a digest. The independently sealed V-B result is supplementary; the new page was itself seen. Original HE physical/printed 38 places benzene reactivity/electrophilic first substitution in Q1.1 LK, so this KEEP does not widen GK scope or approve all inherited source witnesses. No P or human approval follows.',
    '9decc36b-a69a-5599-a9f0-fcebdf0203d8': 'KEEP after reading both complete corrected descriptions, changed alt text and the actual final PDF physical page 5 and HTML page. The goal now explicitly compares supplied pairs with the same constitution and uses spatial arrangement to decide whether stereoisomerism occurs and, if so, assign its appropriate type. An identical pair can correctly yield no stereoisomerism; the wording does not force every pair to be an isomer or classify a lone molecule as an enantiomer. The unchanged existing paired visual remains consistent with the assessed relation. HE physical/printed 38 puts E/Z at Q1.1 LK, and 42 places chirality/enantiomers in Q2.1 GK/LK and carbohydrate diastereomerism at LK; these physical scopes stay distinct from the shared canonical Q1 breadcrumb. No historical image or national source review was restarted, and no P outcome is claimed.',
    '973c12d9-d863-5292-8c68-9c80cdacf9e2': 'KEEP for the actual corrected image-bound description page after physical PDF page 6 and the exact HTML page were inspected. The unchanged complete DE/EN goal appropriately combines carrying out and interpreting suitable school tests for selected aldehyde/ketone samples. The new PNG and alt text explicitly limit four displayed outcomes to Ethanal and Propanon: silver mirror/Cu2O for Ethanal, no mirror/blue Fehling solution for Propanon. They avoid the old universal assertion that all ketones give negative results. Original HE physical/printed 39 supports the alkanal/alkanone and Fehling clauses; Tollens is supplementary rather than falsely quoted as the sole curricular source. The observable-performance definition still requires future supervised execution with controls and protection/disposal rules. Interpreting supplied data or inspecting this picture alone cannot demonstrate performance. P-v1 execution coverage remains separately open; no human experiment or P closure is asserted.',
    '363c5740-8a3c-50b8-8c3a-5548c80c36ea': 'BLOCK for the actual final image-bound page, while KEEP of the corrected EN scope is explicitly acknowledged. Both full descriptions now state ligand lone-pair donation and suitable unoccupied acceptor orbitals on a central atom or ion and use Fehling as the example. However, the actual unchanged JPEG on physical PDF page 7 and the HTML page labels its product Fehlings-Komplex and depicts four separate tartrate ligand icons, each with two connections to one Cu(II): eight drawn coordinating connections. No visible caption, current alt text or learner-page explanation limits this to an intentionally non-stoichiometric donor-pair abstraction. The original HE physical/printed 39 LK clause supplies the Cu(II)-tartrate example but does not establish this eight-donor arrangement. Independently read primary Wiley research abstract, DOI 10.1002/zaac.201200458, describes its closest recipe-derived bis(diolato) species as square-planar tetracoordinate and other investigated species as 4+1; neither supports the unqualified eight-donor drawing. The full paper/supplement were not available and no unique solution-species claim is made. Distinguishing ligand count from donor count and providing an accurate bounded visual/page context is required before a fresh image-bound D KEEP. The EN correction itself remains valid; this concrete new page finding is not a blanket rejection of its scientific text or an automatic mandate to redesign every illustration.',
}
results = []
for ordinal, g in enumerate(inputs['goals'], start=1):
    evidence = copy.deepcopy(old_by_id[g['goalId']]['understandingEvidence'])
    if g['goalId'].startswith('9decc'):
        evidence['observablePerformanceDe'] = 'Die lernende Person prüft die gemeinsame Konstitution eines vorgegebenen Molekülpaares, begründet anhand seiner räumlichen Anordnung, ob Stereoisomerie vorliegt, und ordnet gegebenenfalls den curricular passenden Typ zu; identische Darstellungen werden nicht als unterschiedliche Stereoisomere ausgegeben.'
        evidence['observablePerformanceEn'] = 'The learner checks the common constitution of a supplied molecular pair, explains from its spatial arrangement whether stereoisomerism is present and, where applicable, assigns the curriculum-appropriate type; identical representations are not presented as distinct stereoisomers.'
    results.append({
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1, 'recordId': f'chemie-current-five-targeted-native-d-independent-b-v3-{ordinal:03d}', 'runId': run_id,
        'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'bundleFingerprint': campaign['bundleFingerprint'], 'bookDigest': campaign['bookDigest'],
        **{k: g[k] for k in ['goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']},
        'decision': 'block' if g['goalId'].startswith('363c') else 'keep', 'understandingEvidence': evidence, 'rationale': rationales[g['goalId']],
        'evidenceProfileContract': 'positive-understanding-evidence-v2', 'evidenceProfileRecommendation': 'create', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    })
out = own / 'results'
out.mkdir(exist_ok=True)
batch = campaign['batches'][0]
record_bytes = ''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in results).encode()
(out / (batch['batchId'] + '.records.jsonl')).write_bytes(record_bytes)
procedure = {'type': 'independent-targeted-native-description-review', 'blindToCurrentPeerReviews': True, 'scope': 'five actual native DE/EN pages, source/grade contexts and changed image bindings', 'actualPdfHtmlViewed': True, 'currentPositiveAuthorStageRead': False, 'oldValidScienceReuseIsSeparateFromFreshPageJudgment': True, 'samplingTemperatureAndModelVariant': 'not exposed'}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': run_id,
    **{k: campaign[k] for k in ['campaignId', 'roundId', 'bundleFingerprint', 'bookDigest', 'promptFingerprint', 'criteriaFingerprint', 'independenceGroupId']},
    'batchId': batch['batchId'], 'batchInputFingerprint': batch['batchInputFingerprint'], 'provider': 'OpenAI', 'model': 'Codex GPT-6; exact runtime variant not exposed', 'role': 'subject_reviewer',
    'promptFamilyId': 'skillpilot-goal-description-understanding-evidence-v2', 'generationParametersFingerprint': sha(json.dumps(procedure, sort_keys=True, separators=(',', ':')).encode()),
    'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts']] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': review_started, 'completedAt': now, 'toolchainVersion': 'skillpilot-goal-description-review-v2', 'outputDigest': sha(record_bytes), 'status': 'completed',
}
(out / (batch['batchId'] + '.run.json')).write_text(json.dumps(run, ensure_ascii=False, indent=2) + '\n')
(own / 'targeted-five-scientific-decisions.independent-b.json').write_text(json.dumps({
    'schemaVersion': 1, 'createdAtUTC': now, 'role': 'Independent B fresh native image-bound D decisions; machine candidates only', 'authorFreezeSha256': '0e7e185266736692edf13628a9e633ccddc1bfb64a1ca17466f9a4ebedb22503',
    'blindToCurrentPeerResults': True, 'newPositiveAuthorStageRead': False, 'actualPdfPhysicalPagesViewed': [3, 4, 5, 6, 7], 'actualHtmlGoalPagesViewed': batch['goalIds'],
    'decisions': [{'goalId': r['goalId'], 'decision': r['decision'], 'rationale': r['rationale']} for r in results], 'counts': {'KEEP': 4, 'REVISE': 0, 'BLOCK': 1},
    'finding': {'id': 'CHEM-CURRENT-D-B-V3-001', 'goalId': '363c5740-8a3c-50b8-8c3a-5548c80c36ea', 'status': 'open', 'affectedBindings': ['actual JPEG product depiction', 'unqualified current learner-page/alt-text context', 'image-bound native page fingerprint'], 'resolvedSeparately': 'EN central-atom/ion and unoccupied-acceptor-orbital scope is now correct and bilingual-equivalent.', 'requiredBeforeNewKeep': 'A scientifically appropriate bounded Cu(II)-tartrate model and an actual new page/source/image binding must be inspected. No content-address adjustment alone closes this finding.'},
    'sourceLimits': ['Original HE PDF physical/printed 36/38/39/42 clauses were read; LK/Q2 distinctions are preserved.', 'SourceAtlas inherited witnesses are exact metadata, not direct physical coverage or a blanket national source approval.', 'Wiley original abstract was directly read; full article and supplement were not read. Several investigated coordination environments are distinct, not a unique-species claim.', 'Unchanged 622f organic detection source/page HOLD remains separate; its generic current image KEEP is not reversed.', 'P-v1 coverage gaps and future supervised performance remain separate; new P-v2 author materials were not read.'],
    'technicalValidationIsNotScientificKeep': True, 'activeWrites': False, 'strictNetGain': 0, 'newScientificClosures': 0, 'restoredActiveBindings': 0, 'humanApproval': False, 'humanTrial': False,
}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'records': len(results), 'KEEP': 4, 'BLOCK': 1, 'outputDigest': sha(record_bytes)}))
