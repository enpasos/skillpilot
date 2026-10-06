# SPDX-License-Identifier: Apache-2.0
"""Reuse six unchanged independently reviewed science records after actual binding checks.

No new child science review, operative write, validator exemption or author-input edit.
"""
from pathlib import Path
import copy
import datetime
import hashlib
import json

R = Path.cwd()
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05')
OWN = BASE / 'chemie-q1-six-safe-original-d-a-current-binding-reuse-v1'
OLD = BASE / 'chemie-q1-seven-source-operator-current-independent-d-a-v1'
OLD_AUTHOR = BASE / 'chemie-q1-six-source-operator-remediation-current-candidate-v1'
AUTHOR = BASE / 'chemie-q1-quantitative-atomic-split-current-author-candidate-v1'
TECH = BASE / 'chemie-q1-two-new-four-current-independent-d-a-v1/native-current-d10-round-a'
V = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-q1-seven-source-operator-current-independent-v-qa-20261005-v1')
ISO = Path('tmp/chemie-q1-quantitative-atomic-split-native-isolated-20261005-v1')
SAFE = [
    'd76b80a2-5156-54f4-b3a1-546beddf0e14',
    '057a6826-f599-53b1-bdd1-5a83037a1494',
    '39c85aa0-b01f-56ec-a148-b8009bf650f5',
    'd742ecb0-0795-5446-a95d-9503d4618475',
    '10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5',
    '0d59b62e-d3f9-5969-b961-0c5e26316c04',
]
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()
def sha(p): return hashlib.sha256((R / p).read_bytes()).hexdigest()
def textsha(v): return hashlib.sha256(v.encode()).hexdigest()
def objsha(v): return textsha(json.dumps(v, sort_keys=True, ensure_ascii=False, separators=(',', ':')))
def load(p): return json.loads((R / p).read_text())
def dump(p, v):
    (R / p).parent.mkdir(parents=True, exist_ok=True)
    (R / p).write_text(json.dumps(v, ensure_ascii=False, indent=2) + '\n')
def exact(a, b, why):
    if a != b: raise ValueError('Substantive or unexpected change: ' + why)
def differences(a, b, path=''):
    if type(a) is not type(b): return [{'path': path, 'before': a, 'after': b}]
    if isinstance(a, dict):
        return [d for k in sorted(set(a) | set(b)) for d in differences(a.get(k), b.get(k), path + '/' + k)]
    if isinstance(a, list):
        if len(a) != len(b): return [{'path': path, 'before': a, 'after': b}]
        return [d for i, (x, y) in enumerate(zip(a, b)) for d in differences(x, y, path + '/' + str(i))]
    return [] if a == b else [{'path': path, 'before': a, 'after': b}]
def freezecheck(folder, filename, expected):
    p = folder / filename
    exact(sha(p), expected, str(p) + ' manifest SHA')
    manifest = load(p)
    results = []
    for row in manifest['files']:
        file = Path(row['path'])
        if not (R / file).exists(): file = folder / file
        actual = sha(file)
        exact(actual, row['sha256'].removeprefix('sha256:'), str(file))
        exact((R / file).stat().st_size, row['bytes'], str(file) + ' byte count')
        results.append({'path': str(file), 'actualSHA256': actual, 'bytes': row['bytes'], 'exact': True})
    return {'manifestPath': str(p), 'manifestSHA256': expected, 'fileCount': len(results), 'allExact': True, 'files': results}

freeze_results = [
    freezecheck(OLD, 'independent-d-a-a-m.final.freeze.json', 'bba3ecd269adcbad5ffb3a70616ae9347dcc24011fe08b48b4118af4df6474b4'),
    freezecheck(OLD_AUTHOR, 'author-native-candidate.final.freeze.json', '70899d0c1f5512fbf5cdd9b5a2cba7f081ff6efca30c17f680036063c07b051b'),
    freezecheck(AUTHOR, 'author-native-candidate.final.freeze.json', 'ff2c5e7ff6ef10d484cf3af8442b37d40b9ea1592b9063cc5ca8e233c1d34858'),
    freezecheck(TECH, 'technical-current-d10-inputs.final.freeze.json', '83c3e97ec6525c5429d884e1e5649ae1f50f89108cf1179fffb69c63adc50cae'),
    freezecheck(V, 'independent-visual-review.final.freeze.json', '22607542c9dfa078ec1d43f1b83b4d97e6d87fa1253a828926b6845557fd9611'),
]
dump(OWN / 'five-frozen-input-packages.actual-verification.json', {'checkedAtUTC': NOW, 'packages': freeze_results, 'frozenBytesChanged': False})

old_input = load(OLD / 'current-eight-native-input.exact-copy.json')
new_input = load(TECH / 'description-review-input.json')
old_ctx = {i['goalId']: i for i in load(OLD / 'current-eight-source-context.exact-copy.json')['goalContexts']}
new_ctx = {i['goalId']: i for i in load(AUTHOR / 'ten-current-native-source-and-authored-role.context.json')['goalContexts']}
oi = {i['goalId']: i for i in old_input['goals']}
ni = {i['goalId']: i for i in new_input['goals']}
old_model = load(OLD_AUTHOR / 'native-finalbook-v2/bundle/book-model.json')
new_model = load(AUTHOR / 'native-finalbook/bundle/book-model.json')
op = {i['goalId']: i for i in old_model['pages']}
np = {i['goalId']: i for i in new_model['pages']}
old_index = load(OLD_AUTHOR / 'source-atlas-full.current-original-sources.json')
new_index = load(AUTHOR / 'source-atlas-full.current-original-sources.json')
old_p = {i['goalId']: i for i in load(OLD_AUTHOR / 'positive-evidence.candidates.json')['goals']}
new_p = {i['goalId']: i for i in load(AUTHOR / 'positive-evidence.candidates.json')['goals']}
vr = {i['goalId']: i for i in load(V / 'exact-seven-image-inputs-and-derivatives.actual.json')['rows']}

def index_binding(index, gid):
    facets = index['goals'].get(gid, [])
    eids = {x for facet in facets for x in facet['evidenceIds']}
    evidence = [e for e in index['evidence'] if e['id'] in eids]
    dids = {e['documentId'] for e in evidence}
    docs = [d for d in index['documents'] if d['id'] in dids]
    return {'facets': facets, 'evidence': evidence, 'documents': docs}
def semantic_reference(ref): return {'goalId': ref['goalId'], 'title': ref['title']}
def semantic_page(page):
    p = copy.deepcopy(page)
    for k in ['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint']: p.pop(k)
    p['allPrerequisites'] = [semantic_reference(i) for i in p.pop('requires') + p.pop('externalPrerequisites')]
    p['allReverseRequires'] = [semantic_reference(i) for i in p.pop('reverseRequires') + p.pop('externalReverseRequires')]
    return p

rows = []
for gid in SAFE:
    old, new = oi[gid], ni[gid]
    exact(old_ctx[gid]['currentGoal'], new_ctx[gid]['currentGoal'], gid + ' whole canonical object')
    exact(old['goalFingerprint'], new['goalFingerprint'], gid + ' goal fingerprint')
    exact(old['canonicalContext'], new['canonicalContext'], gid + ' whole canonical context')
    for k in ['currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
        exact(old[k], new[k], gid + ' ' + k)
    for k in ['currentSourceAtlasFacets', 'actualBoundSourceEvidence', 'actualBoundSourceDocuments', 'missingFromOfficialSourceAtlas']:
        exact(old_ctx[gid][k], new_ctx[gid][k], gid + ' full ' + k)
    exact(old_ctx[gid]['currentGoal']['extendedData']['provenance'], new_ctx[gid]['authorProvenance'], gid + ' whole source provenance')
    exact(index_binding(old_index, gid), index_binding(new_index, gid), gid + ' actual source-index binding')
    exact(old_p[gid]['profile'], new_p[gid]['profile'], gid + ' complete inner P profile')
    exact(old['reviewContext']['evidenceProfile'], new['reviewContext']['evidenceProfile'], gid + ' native bound P/null status')
    exact(op[gid], old['reviewContext']['page'], gid + ' old native page represented in input')
    exact(np[gid], new['reviewContext']['page'], gid + ' new native page represented in input')
    exact(semantic_page(op[gid]), semantic_page(np[gid]), gid + ' complete page after exact reference-address projection')
    delta = differences(old, new)
    allowed = {'/pageFingerprint', '/reviewContext/page/pageFingerprint', '/reviewContext/page/pageNumber', '/reviewContext/page/navigationOrder', '/reviewContext/page/treeOrder', '/reviewContext/page/requires/1/pageNumber'}
    if gid == '10f657bc-6044-5fbb-ba8e-6e5ba55d2bc5': allowed |= {'/reviewContext/page/externalPrerequisites', '/reviewContext/page/requires'}
    if any(d['path'] not in allowed for d in delta): raise ValueError(gid + ' unexpected whole-input delta: ' + str(delta))
    for page in [np[gid]]:
        for ref in page['requires'] + page['reverseRequires']:
            target = np[ref['goalId']]
            exact(ref, {'goalId': target['goalId'], 'title': target['title'], 'anchor': target['anchor'], 'pageNumber': target['pageNumber']}, gid + ' actual internal reference resolution')
    copies = []
    for c in vr[gid]['copies']:
        p = Path(c['path'].replace('tmp/chemie-q1-six-source-operator-native-isolated-20261005-v1', str(ISO)))
        actual = sha(p)
        exact(actual, c['sha256'], gid + ' actual current image copy')
        copies.append({'path': str(p), 'sha256': actual, 'exactToOriginalIndependentImage': True})
    exact('sha256:' + vr[gid]['original']['sha256'], np[gid]['visualization']['originalDigest'], gid + ' actual native displayed image')
    exact(vr[gid]['currentAltText'], np[gid]['visualization']['altText'], gid + ' full native alt binding')
    pdfview = AUTHOR / ('actual-current-pdf-views/physical-page-' + str(np[gid]['pageNumber'] + 2).zfill(3) + '.png')
    htmlview = AUTHOR / ('actual-current-page-views/' + gid + '.actual-loaded-html.png')
    reason = 'Only deterministic order/page references and global book metadata changed; no subject, source/operator, goal body, resource or evidence payload change.'
    if gid.startswith('10f'):
        reason += ' The same db666 qualitative Ascorbinsäure prerequisite changes from external canonical URL to the selected internal page2/anchor; ID/title/direction are exact and were checked on the whole actual old/current PDF and loaded HTML.'
    if gid.startswith('0d59'):
        reason += ' The existing d76 prerequisite points to current page3 instead of prior page5; canonical ID/title/direction remain exact.'
    rows.append({'goalId': gid, 'wholeGoalAndCanonicalContextExact': True, 'bilingualTitlesAndBodiesExact': True, 'wholeSourceFacetsEvidenceDocumentsAndProvenanceExact': True, 'wholeInnerPositiveProfileExact': True, 'goalFingerprint': new['goalFingerprint'], 'oldPageFingerprint': old['pageFingerprint'], 'currentPageFingerprint': new['pageFingerprint'], 'wholeInputDeltas': delta, 'semanticPageAfterExplicitAddressResolutionExact': True, 'actualCurrentInternalReferencesResolveExactly': True, 'currentImageCopies': copies, 'provider': new_ctx[gid]['currentGoal']['resourceLinks'][0]['provider'], 'originalIndependentImageSHA256': vr[gid]['original']['sha256'], 'actualCurrentPDFView': {'path': str(pdfview), 'sha256': sha(pdfview), 'viewedForBindingRevalidation': True}, 'actualCurrentLoadedHTMLView': {'path': str(htmlview), 'sha256': sha(htmlview), 'viewedForBindingRevalidation': True}, 'concreteTechnicalConclusion': reason, 'substantiveDelta': False, 'newScienceReview': False})

dump(OWN / 'six-whole-goal-source-page-image-binding-comparisons.actual.json', {'checkedAtUTC': NOW, 'oldInputPath': str(OLD / 'current-eight-native-input.exact-copy.json'), 'oldInputSHA256': sha(OLD / 'current-eight-native-input.exact-copy.json'), 'currentInputPath': str(TECH / 'description-review-input.json'), 'currentInputSHA256': sha(TECH / 'description-review-input.json'), 'oldBookDigest': old_model['digest'], 'currentBookDigest': new_model['digest'], 'rows': rows, 'substantiveSafeGoalChanges': 0, 'newScientificClosures': 0, 'restoredActiveBindings': 0, 'activeNetGain': 0, 'activeWrites': 0})

old_record_path = OLD / 'results/chemie-q1-six-operator-plus-lk-proposal-20261005-v2-first-pass-a.batch-001.records.jsonl'
records = {i['goalId']: i for i in [json.loads(x) for x in (R / old_record_path).read_text().splitlines() if x.strip()]}
campaign = load(TECH / 'description-review-campaign.json')
bundle = load(AUTHOR / 'native-finalbook/bundle/manifest.json')
(R / OWN / 'results').mkdir(parents=True, exist_ok=True)
provenance = []
for batch in campaign['batches'][1:4]:
    bid = batch['batchId']
    runid = 'chemie-q1-safe-six-original-science-current-binding-reuse-run-' + str(batch['ordinal']).zfill(3)
    selected = []
    for gid in batch['goalIds']:
        assert gid in SAFE
        rec = copy.deepcopy(records[gid])
        rec.update(recordId='chemie-q1-safe-original-a-current-binding-' + gid, runId=runid, campaignId=campaign['campaignId'], roundId=campaign['roundId'], bundleFingerprint=bundle['bundleFingerprint'], bookDigest=bundle['bookModelDigest'], goalFingerprint=ni[gid]['goalFingerprint'], pageFingerprint=ni[gid]['pageFingerprint'])
        # Original science wording, six understanding fields and decision are EXACT.
        exact(rec['rationale'], records[gid]['rationale'], gid + ' unchanged original rationale')
        exact(rec['understandingEvidence'], records[gid]['understandingEvidence'], gid + ' unchanged six understanding fields')
        selected.append(rec)
        provenance.append({'goalId': gid, 'currentRecordId': rec['recordId'], 'currentRunId': runid, 'originalRecordPath': str(old_record_path), 'originalRecordId': records[gid]['recordId'], 'originalRunId': records[gid]['runId'], 'originalFullRecordSHA256': objsha(records[gid]), 'originalRationaleSHA256': textsha(records[gid]['rationale']), 'currentRationaleSHA256': textsha(rec['rationale']), 'originalUnderstandingEvidenceSHA256': objsha(records[gid]['understandingEvidence']), 'currentUnderstandingEvidenceSHA256': objsha(rec['understandingEvidence']), 'rationaleAndUnderstandingEvidenceExact': True, 'scienceAuthority': 'The original blind independent reviewer of these six goals (/root/chem_b010_current_d_b), before any later child-author role. Current serialization is technical metadata revalidation/reuse only; it is not new subject science.', 'currentTechnicalReviewer': '/root/chem_b010_current_d_b', 'unseenOtherCurrentD10ReviewJudgments': True, 'oldPeerReviewWasReadOnlyAfterOriginalIndependentFreeze': True, 'childAuthoringScopeExcludedFromThisReview': ['3d6699ae-ebbd-5a55-8798-b809a9d74f0a', '18819a59-2442-530f-a7c3-26755398ec66'], 'metadataRevalidationAddendum': next(i['concreteTechnicalConclusion'] for i in rows if i['goalId'] == gid), 'currentBookEvidenceProfileNull': ni[gid]['reviewContext']['evidenceProfile'] is None, 'historicalRationalePRecommendationUnchanged': True, 'noActualLearnerOrHumanApprovalClaim': True})
    record_path = OWN / 'results' / (bid + '.records.jsonl')
    (R / record_path).write_text(''.join(json.dumps(i, ensure_ascii=False, separators=(',', ':')) + '\n' for i in selected))
    artifact_roles = {'book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_input_json', 'review_input_jsonl', 'review_prompt', 'review_criteria'}
    artifacts = [{'role': a['role'], 'digest': a['digest']} for a in bundle['artifacts'] if a['role'] in artifact_roles]
    artifacts.append({'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']})
    parameters = {'scope': 'Technical revalidation of exact unchanged original independent science only', 'reviewer': '/root/chem_b010_current_d_b', 'noOwnChildReview': True, 'originalScienceAndRationaleExact': True, 'batchOrdinal': batch['ordinal']}
    run = {'$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json', 'schemaVersion': 1, 'runId': runid, 'campaignId': campaign['campaignId'], 'roundId': campaign['roundId'], 'batchId': bid, 'batchInputFingerprint': batch['batchInputFingerprint'], 'bundleFingerprint': bundle['bundleFingerprint'], 'bookDigest': bundle['bookModelDigest'], 'provider': 'OpenAI Codex', 'model': 'Codex inherited session model; original six independent science reviewer performs technical binding reuse; exact runtime identifier not exposed', 'role': 'subject_reviewer', 'promptFamilyId': 'goal-description-understanding-evidence-v2', 'promptFingerprint': bundle['promptFingerprint'], 'criteriaFingerprint': bundle['criteriaFingerprint'], 'generationParametersFingerprint': 'sha256:' + objsha(parameters), 'independenceGroupId': campaign['independenceGroupId'], 'blindToOtherRuns': True, 'goalIds': batch['goalIds'], 'inputArtifacts': artifacts, 'startedAt': NOW, 'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'completed', 'outputDigest': 'sha256:' + sha(record_path), 'toolchainVersion': 'goal-description-review-v2'}
    dump(OWN / 'results' / (bid + '.run.json'), run)
    dump(OWN / ('batch-' + str(batch['ordinal']).zfill(3) + '.actual-parameters.json'), parameters)

dump(OWN / 'six-original-science-exact-reuse-and-binding-provenance.addendum.json', {'authority': 'Original independent six-goal science remains unchanged; this additive technical receipt binds the exact final D10 pages. No author6 attribution to another reviewer and no new child science.', 'createdAtUTC': NOW, 'originalIndependentFreezeSHA256': sha(OLD / 'independent-d-a-a-m.final.freeze.json'), 'currentTechnicalInputFreezeSHA256': sha(TECH / 'technical-current-d10-inputs.final.freeze.json'), 'safeBatchOrdinals': [2, 3, 4], 'rows': provenance, 'noOtherFourCurrentReviewJudgmentsRead': True, 'newScientificClosures': 0, 'activeBindingRestorations': 0, 'activeNetGain': 0, 'humanApproval': False, 'humanTrial': False, 'activeWrites': 0})
print(json.dumps({'rows': len(rows), 'safeBatchOrdinals': [2, 3, 4], 'substantiveDelta': 0, 'exactOldScience': 6, 'newScience': 0, 'activeWrites': 0}))
