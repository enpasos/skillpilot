"""Produce the independent A source review from the named neutral entry only.

This script validates bindings; the per-child judgements below were authored
after independent reading. It does not execute curriculum checks or grant QA.
"""
import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/chemie-b008-by12-ga-twelve-boundary-source-author-v1'
ENTRY = AUTHOR / 'neutral-twelve-source-roles.review.entry.json'
CACHE = {}

def digest(data):
    return hashlib.sha256(data).hexdigest()

def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(data), 'bytes': len(data)}

def load(path):
    path = Path(path)
    if path not in CACHE:
        CACHE[path] = json.loads(path.read_text())
    return CACHE[path]

def resolve(record):
    path = ROOT / record['file']['path']
    assert binding(path) == record['file']
    value = load(path)
    for component in record['jsonPointer'].strip('/').split('/'):
        value = value[int(component)] if isinstance(value, list) else value[component]
    data = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()
    assert digest(data) == record['valueSha256'], record['jsonPointer']
    return value

def save(name, value):
    path = OUT / name
    assert not path.exists(), 'Do not overwrite a first verdict or freeze'
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

entry = load(ENTRY)
packet = load(ROOT / entry['candidate']['path'])
reading = load(ROOT / entry['wholeInputsAndActualPrimaryReading']['path'])
new_cases = load(ROOT / entry['supplementaryCompleteCases']['path'])
timestamp = datetime.now(timezone.utc).isoformat()
checked_files = [binding(ENTRY)]
for expected in [entry['candidate'], entry['supplementaryCompleteCases'], entry['wholeInputsAndActualPrimaryReading']] + reading['bindings']:
    actual = binding(ROOT / expected['path'])
    assert actual == expected, expected['path']
    checked_files.append(actual)

primary_path = ROOT / reading['primaryReading']['binding']['path']
primary_lines = primary_path.read_text().splitlines()
def normal(text):
    return ' '.join(text.split())

source_rows = []
source_lookup = {}
pointer_receipts = []
mapping = load(ROOT / 'curricula/DE/Gymnasium/mapping/DE-BY/gymnasium/bavaria_chemistry_source_extraction_to_canonical_chemistry.review.json')
for row in packet['wholeSourceRows']:
    values = {key: resolve(row[key]) for key in ['wholeOriginalSourceGoal', 'wholeOriginalPassage', 'wholeOriginalDecision']}
    pointer_receipts += [row[key] for key in values]
    source = values['wholeOriginalSourceGoal']
    decision = values['wholeOriginalDecision']
    edges = [edge for edge in mapping['mappings'] if edge['legacyGoalId'] == source['id']]
    assert edges == row['allOriginalCompatibleEdges']
    assert decision['canonicalGoalIds'] == row['allOriginalPartnerGoalIds']
    assert source['sourceOccurrences'] == row['allOriginalSourceOccurrencesPreserved']
    line = next((i + 1 for i, text in enumerate(primary_lines) if normal(text) == normal(source['description'])), None)
    # The primary K2 bullet wraps across two retained lines.
    if line is None:
        line = next((i + 1 for i in range(len(primary_lines) - 1) if normal(' '.join(primary_lines[i:i + 2])) == normal(source['description'])), None)
    assert line is not None, source['sourceSpan']
    receipt = {
        'sourceGoalId': source['id'], 'sourceSpan': source['sourceSpan'],
        'primaryPagePath': str(primary_path.relative_to(ROOT)), 'primaryLine': line,
        'wholeOriginalSourceGoal': row['wholeOriginalSourceGoal'],
        'wholeOriginalPassage': row['wholeOriginalPassage'],
        'wholeOriginalDecision': row['wholeOriginalDecision'],
        'allOriginalPartnerGoalIds': row['allOriginalPartnerGoalIds'],
        'allOriginalCompatibleEdges': edges,
        'allOriginalSourceOccurrencesPreserved': source['sourceOccurrences'],
        'originalMappingDecisionUnchanged': decision['decision'],
        'wholeSourceDutyStatus': 'UNCHANGED_NOT_CLEARED_BY_THIS_REVIEW',
    }
    source_rows.append(receipt)
    source_lookup[source['id']] = receipt

judgements = {
    'upper-theory-based-question-hypothesis': (
        'E1/E2/E3: identify a chemically investigable question and formulate a theory-led testable hypothesis; derive a prediction and condition a counter-result.',
        'The equilibrium case is a suitable GA12 LB7 context. The weak-acid case is an authored contextualisation, not an added compulsory GA12 acid-content claim.',
        'Only C12-GA.1.8 question/hypothesis work is supported. No performed investigation, C11 duty, EA/J13 or national-context clearance.'),
    'upper-hypothesis-investigation': (
        'E4/E5 experimental branch: hypothesis-guided qualitative AND quantitative planning, actual safe execution and own transparent protocol.',
        'Both cases require own plan, substance/instrument authorisation and actual observations. A supplied hypothesis permits this experimental contribution; generating one is a separately assessed operator.',
        'C12-GA.1.9 retains experiment OR model-based hypothesis testing. This child cannot turn that OR into a compulsory pair. The GA12-specific LB3/LB8 experimental duties and all original partners remain.'),
    'upper-quantitative-hypothesis-data-evaluation': (
        'S17 mathematical evaluation, bounded E6 digital calculation/evaluation, E8/E11 interpretation and interdisciplinary hypothesis relation.',
        'The calibration and kinetics cases require an actual spreadsheet, justified mathematical method and scope-limited interpretation. Supplied synthetic values are explicitly not learner measurements.',
        'C12-GA.1.10 also contains acquisition, representation, modelling and simulation operators; these are not all cleared by a calculation file. Calibration/first-order examples add no compulsory GA12 content clause.'),
    'data-validity': (
        'B3: assess suitability, limitations and reach of information/data using stated controls and conditions.',
        'Both complete cases constrain unsupported concentration/identity inferences and distinguish repeat scatter from full uncertainty.',
        'This is C12-GA.1.27 data/information validity only. It grants no LB3.3 analytic-test clearance, no completed ion proof and no removal of the source/inquiry-reflection partners.'),
    'own-inquiry-process-reflection': (
        'E10: reflect on own results and own inquiry process.',
        'The cases require original own execution/raw/action records before reflection. A guided investigation may be one\'s own without falsely attributing supplied planning decisions to the learner.',
        'No actual prior receipt is supplied. E12 five-criterion scientific-validity reflection is distinct; it cannot substitute for E10 ownership. No lower-stage or full original-family clearance.'),
    'upper-scientific-validity': (
        'E12: apply reproducibility, falsifiability, intersubjectivity, logical consistency and provisionality to findings and inquiry limits.',
        'Both complete cases actually apply all five criteria; reliable matching counterevidence is distinguished from failed measurement and a non-equilibrium reading.',
        'The normative five-item requirement is GA12 upper-secondary evidence only here. No universal lower-stage requirement and no whole source/family approval.'),
    'upper-source-information': (
        'K1/K2/K8/K12: own analogue/digital research and purposeful selection, complex-information interpretation and conclusions, authorship/citations/quotations.',
        'The tasks require checkable own retrieval and actual additional accessible scientific reading. The six-document archive distinguishes model data from measurements and policy from material balance.',
        'No learner retrieval or additional external reading is supplied. Pharmaceutical Q is hypothetical; it is not a compulsory claim from GA12 LB1. Presentation remains a separate performance.'),
    'upper-source-criticism': (
        'K3/K4: compare source/representation claims and trustworthiness; B2/B4 additionally requires independently procured sources, relevance and author intent.',
        'The existing supplied-source cases support K3/K4. The new complete b2-own-retrieval-source-criticism task supplies the missing B2 procurement condition with own search/selection/reading records, not preselected relevant sources.',
        'B2 own procurement is route-specific. Do not count the two supplied-source cases alone as B2 and do not invent a universal research prerequisite for all source criticism. Same-model A/B agreement is not independent experiment evidence.'),
    'upper-chemical-effects-sustainability': (
        'B10/B12/B13: social/ecological significance and historical/current impacts of products, methods, processes and knowledge, three sustainability perspectives and own action.',
        'Both cases keep the product/method/process/knowledge union, historical/current context, ecological/economic/social conflicts and realistic own-action reflection.',
        'Authored indicators are not a full real lifecycle assessment. Historical citations are retained references, not newly verified external historical-source evidence in this restricted review. Original action-option/context partners stay.'),
    'upper-model-use-criticism': (
        'S8/S15 dynamic equilibrium distinction, E4/E5 model alternative, bounded E6 actual digital modelling/calculation, E7 selection/use of models and E9 model limitations.',
        'The new ga-dynamic-equilibrium-model-use task correctly gives 50/50 with 10/10 continuing transitions and 60/40 to 56/44 to 53.6/46.4, conserved total 100. Fractional counts are expectations; products must be the learner\'s own.',
        'This adds only named GA12 components. It is not a performed experiment, full catalyst/influence-factor duty, complete C12-GA.1.4/.10, or the whole atom/PSE/bonding/complex-molecule/receptor/enzyme context union. Existing whole cases stay distinct.'),
    'chemical-representation-transformation': (
        'K5/K6/K7/K9: purposeful preparation/transformation, correct scientific/everyday language, audience/situation and representation reflection.',
        'Both complete cases require an actual new representation, correct reference quantities and a justified preserved/limited statement. A grade-8 audience does not classify the presenting learner\'s curriculum stage.',
        'This is the C12-GA.1.19 transformation component; copying a text is insufficient. Original symbol/language partners and other source occurrences remain. A specific molecule-formula goal cannot replace the full obligation.'),
    'chemical-presentation': (
        'K11: actually present chemical subject matter AND own learning/work results using appropriate analogue AND digital media.',
        'Both cases require own prior work, real delivery, both media and audience/moderator records; structure and medium choices are justified.',
        'No presentation or listener response has occurred in this packet. An own laboratory experiment is not universally required for this presentation operator. Prepared slides or a reference talk do not establish performance.'),
}

active = load(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
active_ids = {goal['id'] for goal in active['goals']}
rows = []
for row in packet['rows']:
    goal = resolve(row['wholeGoalInput'])
    profile = resolve(row['wholeProfileInput'])
    cases = resolve(row['wholeTwoCasesInput'])
    pointer_receipts += [row[key] for key in ['wholeGoalInput', 'wholeProfileInput', 'wholeTwoCasesInput']]
    assert goal['id'] not in active_ids and row['operativeFamilyGoalId'] in active_ids
    assert profile['descriptionBindingCandidate'] == {'de': goal['description'], 'en': goal['descriptionEn']}
    assert len(cases) == 2 and [case['caseKey'] for case in cases] == row['existingWholeCaseKeys']
    assert not profile['humanApproval'] and not profile['humanTrial']
    assert all(not case['learnerPerformanceRecorded'] and not case['humanApproval'] and not case['humanTrial'] and not case['nativeEvidenceApproved'] for case in cases)
    operator, observed, limitation = judgements[row['candidateKey']]
    contributions = []
    for component in row['sourceComponents']:
        receipt = source_lookup[component['originalSourceGoalId']]
        assert component['sourceSpan'] == receipt['sourceSpan']
        assert component['exactReadOccurrence'] in receipt['allOriginalSourceOccurrencesPreserved']
        assert component['scope']['actualCourse'] == 'grundlegendes Anforderungsniveau'
        assert component['scope']['grade'] == '12' and component['scope']['compatibilityProfile'] == 'GK'
        assert component['matchType'] == 'partial' and component['componentOnly'] and component['scopedNoWholeSourceClearance']
        assert component['standardEdgeProposal']['canonicalGoalId'] == goal['id']
        contributions.append({
            'sourceGoalId': component['originalSourceGoalId'], 'sourceSpan': component['sourceSpan'],
            'primaryPagePath': receipt['primaryPagePath'], 'primaryLine': receipt['primaryLine'],
            'exactReadOccurrence': component['exactReadOccurrence'], 'scope': component['scope'],
            'standardEdgeProposal': component['standardEdgeProposal'],
            'firstVerdict': 'ADMISSIBLE_BOUNDED_GA12_COMPONENT_ONLY', 'matchType': 'partial',
            'originalWholeDutyAndAllPartnersRetained': True, 'wholeSourceClearance': False,
            'ordinaryMappingOrAtlasIntegrationApproved': False,
        })
    rows.append({
        'candidateKey': row['candidateKey'], 'prospectiveGoalId': goal['id'],
        'operativeFamilyGoalId': row['operativeFamilyGoalId'],
        'wholeGoalInput': row['wholeGoalInput'], 'wholeProfileInput': row['wholeProfileInput'],
        'wholeTwoCasesInput': row['wholeTwoCasesInput'],
        'wholeDEENGoalProfileAndBothCompleteCasesRead': True,
        'firstVerdict': 'ADMISSIBLE_BOUNDED_GA12_COMPONENT_ONLY',
        'operatorJudgement': operator, 'materialJudgement': observed, 'remainingBoundary': limitation,
        'contributions': contributions, 'existingCompleteCaseKeys': row['existingWholeCaseKeys'],
        'supplementaryCompleteCaseKeys': row['supplementaryAuthoredCaseKeys'],
        'inactiveChildVerifiedAgainstCurrentCanonical': True,
        'wholeCandidateCompulsoryGA12UnionApproved': False,
        'nationalApplicabilityUnionApproved': False,
        'nativeD_P_A_M_VApproved': False, 'currentStrictCompletionsAdded': 0,
        'humanApproval': False, 'humanTrial': False,
    })

inputs_receipt = {
    'schemaVersion': 1, 'role': 'Independent A exact input and structural reading receipt',
    'createdAtUTC': timestamp, 'reviewer': '/root/chem_source12_independent_a',
    'neutralEntry': binding(ENTRY), 'allNamedFileHashesMatched': True,
    'checkedFileBindings': checked_files, 'exactJSONPointerBindingsChecked': pointer_receipts,
    'pointerBindingsCount': len(pointer_receipts),
    'primaryRetainedWholeGA12PageRead': True, 'allLB1AndLB2To8Read': True,
    'freshOfficialFetch': False, 'primarySourceAuthority': reading['primaryReading']['officialURL'],
    'readOnlyPointerValuesUsedNotUnrelatedSnapshotVerdicts': True,
    'historicalPeerVerdictContentRead': False, 'reviewerBVerdictRead': False,
    'historicalImageReviewFreezeWasHashCheckedOnly': True,
    'wholeDEENGoalsRead': 12, 'wholeDEENProfilesRead': 12, 'wholeDEENExistingCasesRead': 24,
    'wholeDEENSupplementaryCasesRead': 2, 'wholeDossierDocumentsRead': 6,
    'identicalRepeatedStringValuesReadOnce': True,
    'wholeOriginalSourceRowsChecked': 21, 'wholeOriginalPartnerEdgesChecked': 36,
    'allOriginalDecisionsPartnerSetsAndOccurrencesExactlyPreserved': True,
    'currentCanonicalTechnicalGoalCount': len(active['goals']),
    'currentCanonicalTechnicalCountIsNotStrictM7Denominator': True,
    'all12ProspectiveIdsAbsentAll12OperativeFamiliesPresent': True,
    'standardMappingSchemaRead': {'path': 'scripts/validate_curriculum_release_model.py', 'function': 'effective_mapping_match_type', 'allowedMatchTypes': ['exact', 'partial']},
    'sourceRows': source_rows, 'activeWrites': 0, 'humanApproval': False, 'humanTrial': False,
}
receipt_binding = save('independent-a.actual-reading-and-input-checks.json', inputs_receipt)
verdict = {
    'schemaVersion': 1, 'role': 'Sealed independent A first source/operator/scope verdicts',
    'createdAtUTC': timestamp, 'reviewer': '/root/chem_source12_independent_a',
    'reviewBasis': 'Neutral entry and its exact retained inputs only; no peer comparison',
    'neutralEntry': binding(ENTRY), 'inputReadingReceipt': receipt_binding,
    'status': 'BOUNDED_COMPONENTS_ADMISSIBLE_WHOLE_SCOPE_HOLD',
    'boundedChildrenAdmissible': 12, 'boundedComponentRelationsAdmissible': 23,
    'newComponentDefectsRequiringRevision': [], 'rows': rows,
    'supplementaryWitnessVerdicts': [
        {'caseKey': 'b2-own-retrieval-source-criticism', 'sourceSpan': 'C12-GA.1.26', 'verdict': 'ADMISSIBLE_AUTHORED_B2_ROUTE_WITNESS_ONLY', 'ownRetrievalSuppliedNow': False, 'newUniversalPrerequisite': False, 'wholeSourceOrP2Approval': False},
        {'caseKey': 'ga-dynamic-equilibrium-model-use', 'sourceSpans': ['C12-GA.1.4', 'C12-GA.1.9', 'C12-GA.1.10', 'C12-GA.1.13'], 'verdict': 'ADMISSIBLE_AUTHORED_DYNAMIC_MODEL_COMPONENT_WITNESS_ONLY', 'ownModelProductsSuppliedNow': False, 'realExperimentPerformed': False, 'wholeSourceOrP2Approval': False},
    ],
    'wholeScopeHoldFindings': [
        {'id': 'A-WHOLE-1', 'sourceSpans': ['C12-GA.1.4'], 'operator': 'dynamic equilibrium AND influence factors on substance/particle levels including catalysts', 'finding': 'The dynamic two-state witness covers the static/dynamic distinction only; it does not clear all original partners or the full influence-factor/catalyst clause.', 'remedy': 'Retain the full original row and six partner edges; independently review every remaining component in its actual source/content context before any whole-row change.'},
        {'id': 'A-WHOLE-2', 'sourceSpans': ['C12-GA.1.9', 'C12-GA.1.10'], 'operator': 'experimental OR model-based checking; digital acquisition/representation/evaluation/calculation/modelling/simulation', 'finding': 'No ordinary projection, alternative-route or atlas integration is authorised by a list of partial edge proposals. One model or calculation product cannot clear all operators or convert the explicit OR into AND.', 'remedy': 'Integrate only through a separately reviewed occurrence-specific ordinary route/target model that preserves alternatives, original partners and unfinished whole duties.'},
        {'id': 'A-WHOLE-3', 'sourceSpans': ['C12-GA.1.26'], 'operator': 'analyse independently procured sources', 'finding': 'The supplementary task validly requires own retrieval but supplies no performed retrieval. Supplied-source cases alone remain insufficient for a B2 performance claim.', 'remedy': 'Keep the source-specific retrieval condition bound to the B2 route; require the actual retrieval/reading product before claiming a learner performed it. This is not an extra human gate for machine material review.'},
        {'id': 'A-WHOLE-4', 'sourceSpans': ['C12-GA.1.14', 'C12-GA.1.22'], 'operator': 'own inquiry/results; actual presentation of subject matter and own work using both media', 'finding': 'Authored tasks and protocols are available but no own investigation or presentation was performed. Inactive children and pending native bindings yield no current strict completion.', 'remedy': 'Preserve truthful material-only status and inactive child state. Complete separate native D/P/A/M/V and authorised ordinary integration before claiming current strict coverage; require actual receipts before learner-performance claims.'},
    ],
    'wholeSource19Status': 'HOLD', 'remainingSource19Children': packet['remainingSource19Children'],
    'all21OriginalSourceRowsAll36PartnerEdgesAndOccurrencesRetained': True,
    'all1646NationalObligationsStatusUnchanged': True,
    'wholeSourceOrParentClearance': False, 'nationalAtlasApproval': False,
    'nativeD_P_A_M_VApproved': False, 'strictM7NetGain': 0,
    'activeWrites': 0, 'newScientificCompletions': 0,
    'humanApproval': False, 'humanTrial': False, 'peerComparisonPerformed': False,
    'firstVerdictsSealedBeforeComparison': True,
}
verdict_binding = save('independent-a.first-source-operator-scope-verdicts.json', verdict)
report_path = OUT / 'independent-a.review.md'
assert not report_path.exists()
report_path.write_text('''# Independent A: BY12-GA source/operator/scope review

The twelve inactive candidates are admissible only as the 23 named partial
GA12 source components. This review grants no whole source, parent, national
atlas, native D/P/A/M/V, learner-performance or current strict-M7 clearance.
There are no new component defects requiring author revision in the exact
sealed packet. Whole source19 remains HOLD with seven unfinished children.

The full retained primary page, all twelve whole DE/EN goals and profiles,
24 unchanged complete DE/EN cases, both new complete DE/EN witnesses and the
six archived documents were read. All 99 JSON pointer values, 21 original
source rows, 36 original partner edges and all source occurrences match.
All twelve child IDs remain absent from the current active canonical file;
their operative families remain present. No peer verdict was read.

C12-GA.1.9 uses experiment OR model-based checking. The practical child
requires actual qualitative and quantitative execution, with own records;
the model child retains the alternative. They must not become a compulsory
pair merely because both have partial source edges. C12-GA.1.10 contains
additional digital operators beyond one calculation or model product.

The B2 witness for C12-GA.1.26 requires own procurement, source selection and
reading records from an unselected six-document catalogue. The existing
supplied-source cases support K3/K4 but alone do not prove B2 procurement.
The witness also correctly rejects treating model-derived A/B agreement as
independent experimental proof. Own procurement is bound to this B2 route;
it is not a universal new prerequisite for source criticism.

The dynamic witness supplies a defensible model application for the static
substance state versus continuing opposing particle processes. Its arithmetic
and conservation are correct; fractional particle counts are expectations.
It covers neither the complete influence-factor/catalyst clause of
C12-GA.1.4 nor the entire atom/PSE/complex-molecule context union.

The GA12 process expectations are compulsory at the actual grundlegendes
Anforderungsniveau, represented by the bounded GK compatibility scope. The
candidate's complete multi-jurisdiction, C11/EA/J13 or contextual conjunction
is not thereby made a compulsory GA12 target. No synthetic value, prepared
protocol, source catalogue or slide template is a recorded learner performance.

The JSON verdict records the exact source spans, primary line positions,
original partner boundaries and needed remedies for every remaining whole
scope HOLD. Separate native bindings, scientific reviews and ordinary route
integration remain necessary. humanApproval=false; humanTrial=false;
strictM7NetGain=0; activeWrites=0.
''')
report_binding = binding(report_path)
script_binding = binding(Path(__file__))
freeze = {
    'schemaVersion': 1, 'role': 'Independent A immutable first-verdict freeze',
    'createdAtUTC': timestamp, 'status': verdict['status'], 'reviewer': verdict['reviewer'],
    'neutralEntry': binding(ENTRY), 'exactInputFileBindings': checked_files,
    'outputs': [receipt_binding, verdict_binding, report_binding, script_binding],
    'noPeerVerdictReadBeforeSeal': True, 'peerComparisonPerformed': False,
    'historicalPositivePeerVerdictsPromoted': False,
    'activeCanonicalMappingAtlasQAConfigLedgerWrites': 0,
    'wholeSourceOrParentClearance': False, 'strictM7NetGain': 0,
    'humanApproval': False, 'humanTrial': False,
}
freeze_binding = save('independent-a.first-verdict.freeze.json', freeze)
print(json.dumps({'status': verdict['status'], 'review': verdict_binding, 'freeze': freeze_binding, 'inputPointers': len(pointer_receipts), 'sourceRows': len(source_rows), 'originalEdges': 36, 'boundedRelations': 23}, ensure_ascii=False))
