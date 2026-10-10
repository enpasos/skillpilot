"""Seal the independently read, bounded SOURCE decision before peer contact."""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = OWN.parent / 'biologie-health-twelve-six-source-bindings-resolution-author-successor-20261010-v2'

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    json.loads(path.read_text(encoding='utf-8'))

entry = AUTHOR / 'neutral-six-source-bindings-resolution-author.entry.json'
author_freeze = AUTHOR / 'FINAL.six-source-bindings-neutral-author.freeze.json'
assert binding(entry)['sha256'] == 'sha256:9c73c22459e7e133cf0d9ba6062031e99b62951bfbf159d7069edf6977879503'
assert binding(author_freeze)['sha256'] == 'sha256:9bfdec655e740a0318ab65a892095e3f1e459582e3bea35c065421a2fbce9958'
whole = json.loads((AUTHOR / 'sources/six-whole-source-goals-all-current-partners-and-decisions.neutral.json').read_text())
deltas = json.loads((AUTHOR / 'sources/six-unsupported-mapping-records.actual-author-deltas.json').read_text())
primaries = json.loads((AUTHOR / 'primary/eight-whole-primary-pages-current-author.actual.json').read_text())
primary_reads = []
for r in primaries['records']:
    primary_reads.append({'sourceDocumentKey': r['sourceDocumentKey'], 'physicalPageOneBased': r['physicalPageOneBased'], 'pdf': binding(ROOT / r['wholeOriginalPdf']['path']), 'wholeText': binding(ROOT / r['wholeText']['path']), 'wholeRaster': binding(ROOT / r['wholeRaster']['path']), 'wholeTextReadIndependently': True, 'wholeRasterViewedIndependently': True})
native_reads = []
for filename, key in [('two-HH-whole-html-capture.actual.json', 'wholeHtmlPageCapture'), ('two-HH-whole-pdf-capture.actual.json', 'wholePdfPageCapture')]:
    for r in json.loads((AUTHOR / 'checks' / filename).read_text())['records']:
        native_reads.append({'goalId': r['goalId'], 'channel': 'html' if 'html' in filename else 'pdf', 'wholeRaster': binding(ROOT / r[key]['path']), 'wholeRasterViewedIndependently': True, 'observation': 'Whole single page includes full goal ID, title, description, visualization, prerequisite context and applicability. HH is absent; remaining jurisdictions are BY, HB, MV, SN, ST, TH. No new P/V or publication acceptance is asserted.'})

reason_by_target = {
    '26aa47b7-e5cc-5131-8980-0ec3271758b6': 'Bremen physical/printed p.30 places disgust reflection among process skills. Reflection on aversion to natural objects neither conducts an investigation nor writes its protocol. Removing this mapping is substantively correct; it does not remove the official disgust requirement.',
    '6ae33a8e-874c-53ee-858f-c64f1848cfbc': 'The same disgust-reflection requirement does not assess the meaning or methodological answerability limits of scientific inquiry. A natural-object context does not supply that operator overlap. Removal is correct.',
    '26a16d5d-f178-5018-b792-039737c66ce7': 'Bremen p.31 and 2022 restriction p.1 require naming drug effects and strategies against misuse. The whole behavior cluster instead covers behavioral observation/releasers, evidence for genetic versus learned behavior and planning conditioning experiments. Shared behavior vocabulary cannot justify this cluster or its three inherited atomic witnesses. Removal is correct.',
    'a6f57e17-9f0c-5327-91bc-c6f31ff375a2': 'Hamburg p.24 is a communication table: describe drug effects on the nervous system at grade 8 and explain them for transition to Studienstufe. This does not require distinguishing enjoyment from addiction or recognizing personal addiction risks. The whole p.27/p.28 content context adds no such competence. Removal is correct.',
    '0e1065b9-9d1d-5299-b900-32c74d352e56': 'Hamburg biological drug-effect communication does not assess life skills for everyday coping/well-being or derive personal-development strategies. Whole p.27/p.28 context does not supply those operators. Removing this mapping and consequent HH page applicability is correct.',
    '4e12ba43-a58c-5611-8c43-3cc0c8465e33': 'Saarland p.25/26 explicitly addresses flowering/seed plants in year 5, flower organs and function, pollen/ovules, pollination/fertilization and seeds/fruits. The whole canonical partner compares bird or fish reproductive strategies. This is an organism-domain mismatch, so removal is correct.'
}
decisions = []
for r in deltas['removedUnsupportedMappingRecords']:
    decisions.append({'sourceGoalId': r['sourceGoalId'], 'canonicalGoalId': r['canonicalGoalId'], 'decision': 'accept_bounded_mapping_removal', 'removedMappingRecord': r['beforeMappingRecord'], 'scientificReason': reason_by_target[r['canonicalGoalId']], 'newSourceRequirementSatisfied': False, 'fullCanonicalCompetenceApproved': False, 'humanApproved': False})

kept = []
for r in deltas['preservedSelectedOtherBindings']:
    sid, gid = r['sourceGoalId'], r['canonicalGoalId']
    if 'hh-biology' in sid:
        reason = 'Keep only the explicit partial biological drug-effect contribution to addiction consequences. The p.24 communication operators do not certify a complete biopsychosocial addiction-development model or all prevention skills.'
    elif '-057-' in sid:
        reason = 'The official p.31/2022 p.2 genetic-information transmission description overlaps simplified mitosis/meiosis and gamete formation. Historical strengthened extraction is visibly authored operationalization; it gives no puberty/media evidence and no year-10 clearance.'
    elif gid == '26aa47b7-e5cc-5131-8980-0ec3271758b6':
        reason = 'Pig-eye dissection is a practical investigation contribution, unlike HB037 disgust reflection alone. The retained partial binding does not certify a full protocol competence or satisfy all disgust reflection.'
    elif gid == '0f1549f6-8341-53b0-8161-5eaeb2b37809':
        reason = 'Dissection contributes a bounded practical observation context. Structured documentation/evaluation and natural-environment observation are broader canonical aspects and receive no new whole-competence approval.'
    elif gid == '1d8d64b6-b2d8-526a-8e24-23e8b6e9eb30':
        reason = 'Pig-eye dissection overlaps the eye-structure branch. It neither certifies the ear branch nor replaces the separate requirement to address disgust feelings.'
    else:
        reason = 'Saarland p.26 explicitly names flower parts and their functions and develops sexual plant reproduction; this supports the retained flower-function partial partner. Other fruit/seed and plant propagation aspects are not approved as fully covered by this one partner.'
    kept.append({'sourceGoalId': sid, 'canonicalGoalId': gid, 'decision': 'preserve_bounded_partial_contribution', 'scientificReason': reason, 'newWholeCompetenceApproval': False, 'humanApproved': False})

first = {
    'schemaVersion': 1,
    'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'Genuine independent A FIRST bounded SOURCE judgment before peer interaction',
    'subject': 'biologie', 'packageState': 'inactive', 'scope': 'Six mapping-record removals across HB/HH/SL; complete six source goals and all actual canonical partners; two HH applicability-only page contexts; protected353 preservation technical confirmation follows FIRST.',
    'reviewer': 'codex-genuine-independent-a',
    'authorEntry': binding(entry), 'authorFreeze': binding(author_freeze),
    'independence': {'peerInteractionBeforeFirst': False, 'independentJudgmentFilesReadBeforeFirst': [], 'authorEvaluativeInspectionReadBeforeFirst': False, 'candidateMappingDecisionFieldsReadAsNeutralCandidateInputs': True, 'priorDPAMVScientificReviewsRestarted': False},
    'wholeSourceGoalIdsRead': [r['sourceGoalId'] for r in whole['records']],
    'allWholeActualCanonicalPartnersRead': sorted({g['id'] for r in whole['records'] for g in r['wholeCurrentBeforeCanonicalPartners']}),
    'wholeAffectedNativeContextsRead': 16,
    'wholeMappedClusterRead': '26a16d5d-f178-5018-b792-039737c66ce7',
    'primaryReadsAndPixels': primary_reads,
    'additionalNormativeRestriction': {'wholePdf': binding(ROOT / 'curricula/DE/Gymnasium/input/HB/Naturwissenschaften_Gymnasium_5_9_Einschraenkungen_2022.pdf'), 'wholeSixPageTextRead': True, 'relevantWholePagesViewed': [1,2], 'observedLimit': 'Bremen 2022 keeps the relevant 3.2 sense/sexuality requirements at the end of year 9 and limits the old 5–10 plan to 5–9. No selected source is promoted to year-10 authority.'},
    'affectedNativePixels': native_reads,
    'sourceResolutionDecisions': decisions,
    'preservedPartialContributions': kept,
    'retainedOtherPartnerLimits': ['The broad Hamburg authored aggregate is not a verbatim single official competence. Its other 32 surviving partners receive no new complete-source, stage, GK/LK or operator clearance here.', 'Source-goal GK_LK labels in SekI are compatibility labels and do not establish SekII course profiles. Existing upper-secondary canonical neuro/hormone partners are not certified by the Hamburg SekI table.', 'Bremen HB051 has official operator nennen. Stronger explaining/deriving fields remain explicitly authored operationalization, and its other four addiction/health partners are not newly certified as whole competencies.'],
    'unresolvedSourceGaps': [{'id': 'A-SOURCE-OPEN-HB037', 'sourceGoalId': whole['records'][0]['sourceGoalId'], 'status': 'OPEN', 'decision': 'needs_canonical_goal', 'canonicalGoalIds': [], 'machineSourceMappingBlocker': True, 'requiredRequirementRetained': True, 'reason': 'The official disgust-reflection requirement persists with no evidenced canonical partner. Correctly deleting false bindings exposes the source gap; it cannot clear MAPPING3 or support whole-course source completeness.'}],
    'verdict': 'accept_all_six_bounded_removals_with_required_HB037_gap_open',
    'acceptedMappingRemovalCount': 6,
    'additionalSourceBlockersInTheSixRemovalDelta': [],
    'technicalBindingAndPortabilityChecksPendingAfterFirst': True,
    'sourceMappingCompletionClaimed': False, 'wholeCourseSourceApproval': False, 'MAPPING3Clearance': False,
    'D_P_A_M_VReapproval': False, 'strictGain': 0, 'humanApproved': 0, 'humanTrial': False,
    'humanReviewRemainsSeparate': True, 'activeWrites': [], 'gitWrites': [], 'githubWrites': []
}
path = OWN / 'FIRST.six-source-resolution-independent-a.inspection.json'
assert not path.exists()
write(path, first)
freeze = {'schemaVersion': 1, 'createdAt': datetime.now(timezone.utc).isoformat(), 'role': 'Immutable genuine FIRST independent A before peer contact', 'first': binding(path), 'authorEntry': binding(entry), 'authorFreeze': binding(author_freeze), 'actualReadBindings': [binding(AUTHOR / 'sources/six-whole-source-goals-all-current-partners-and-decisions.neutral.json'), binding(AUTHOR / 'sources/six-unsupported-mapping-records.actual-author-deltas.json'), binding(AUTHOR / 'native/whole-affected-current-page-and-cluster-contexts.neutral.json')], 'primaryReadsAndPixels': primary_reads, 'nativeReadsAndPixels': native_reads, 'peerInteractionBeforeFirst': False, 'humanApproved': 0, 'strictGain': 0, 'activeWrites': []}
freeze_path = OWN / 'FIRST.six-source-resolution-independent-a.freeze.json'
assert not freeze_path.exists()
write(freeze_path, freeze)
print(json.dumps({'first': binding(path), 'freeze': binding(freeze_path)}, ensure_ascii=False, indent=2))
