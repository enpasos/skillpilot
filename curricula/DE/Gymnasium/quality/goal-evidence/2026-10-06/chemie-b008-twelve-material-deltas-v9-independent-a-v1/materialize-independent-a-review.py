#!/usr/bin/env python3
"""Freeze this reviewer's narrowly scoped actual material review; no native approval."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json
import math

ROOT = Path(__file__).resolve().parents[7]
HERE = Path(__file__).resolve().parent
BASE = HERE.parent
AUTHOR = BASE / 'chemie-b008-targeted-material-corrections-author-v9'
EXPECTED_AUTHOR_FREEZE = '1f345647b538dec5d88ac575643dce1754aee4375a1f0641c48a433a604e941a'
AUTHOR_FREEZE = AUTHOR / 'author-targeted-materials-v9.final.freeze.json'
STAMP = datetime.now(timezone.utc).isoformat()
TARGETS = [4, 6, 7, 8, 9, 10, 13, 16, 17, 43, 44, 45]
NEW_FINDING = 'A-V9-01'

def read(path):
    return json.loads(path.read_text())

def binding(path):
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def compact_hash(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True).encode()).hexdigest()

def verify(record):
    return binding(ROOT / record['path']) == record

def dump(name, value):
    (HERE / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def diff(before, after, pointer=''):
    if isinstance(before, dict) and isinstance(after, dict):
        assert before.keys() == after.keys(), ('changed dictionary keys', pointer)
        for key in before:
            yield from diff(before[key], after[key], pointer + '/' + str(key).replace('~', '~0').replace('/', '~1'))
    elif isinstance(before, list) and isinstance(after, list):
        assert len(before) == len(after), ('changed list length', pointer)
        for index, (left, right) in enumerate(zip(before, after)):
            yield from diff(left, right, pointer + '/' + str(index))
    elif before != after:
        yield {'JSONPointer': pointer, 'before': before, 'after': after}

assert binding(AUTHOR_FREEZE)['sha256'] == EXPECTED_AUTHOR_FREEZE
freeze = read(AUTHOR_FREEZE)
assert all(verify(record) for record in freeze['ownFiles'])
delta = read(AUTHOR / 'literal-field-delta-and-finding-response.author.json')
routing = read(AUTHOR / 'actual-profile-to-v9-material-review-routing.json')
assert verify(delta['sourceFile']) and verify(delta['correctedFile'])
old = read(ROOT / delta['sourceFile']['path'])
new = read(ROOT / delta['correctedFile']['path'])
actual_diffs = list(diff(old, new))
case_diffs = [row for row in actual_diffs if row['JSONPointer'].startswith('/cases/')]
root_diffs = [row for row in actual_diffs if not row['JSONPointer'].startswith('/cases/')]
declared = {row['JSONPointer']: row for row in delta['corrections']}
assert len(case_diffs) == len(declared) == 60
assert {row['JSONPointer'] for row in case_diffs} == declared.keys()
assert all(row['before'] == declared[row['JSONPointer']]['before'] and row['after'] == declared[row['JSONPointer']]['after'] for row in case_diffs)
assert sorted({int(row['JSONPointer'].split('/')[2]) for row in case_diffs}) == TARGETS
assert sorted(row['JSONPointer'] for row in root_diffs) == ['/artifactKind', '/authoredAtUTC']
unchanged = []
for index, (left, right) in enumerate(zip(old['cases'], new['cases'])):
    if index not in TARGETS:
        assert left == right
        unchanged.append({'caseIndexZeroBased': index, 'caseKey': left['caseKey'], 'valueSha256': compact_hash(left), 'equalOldAndNew': True, 'decisionReusedWithoutNewScienceReview': True})
assert len(unchanged) == 40

# Only hash/identifier reuse of the 26 profiles and descriptions; no new content review.
profile_binding = routing['unchangedV8ProfilesFile']
assert verify(profile_binding)
profiles = read(ROOT / profile_binding['path'])['profiles']
assert len(profiles) == len(routing['profiles']) == 26
profile_reuse = []
for prior, route in zip(profiles, routing['profiles']):
    description_hash = compact_hash(prior['descriptionBindingCandidate'])
    assert prior['candidateKey'] == route['candidateKey']
    assert prior['goalId'] == route['goalId'] is None
    assert prior['caseKeys'] == route['caseKeys']
    assert description_hash == route['literalDescriptionBindingSha256']
    profile_reuse.append({'candidateKey': prior['candidateKey'], 'goalId': None, 'profileValueSha256': compact_hash(prior), 'descriptionBindingValueSha256': description_hash, 'reviewTreatment': 'exact historical hash/identifier reuse only; no repeated profile or description verdict'})

description_path = BASE / 'chemie-b008-twenty-six-literal-operator-prerequisite-author-v7/twenty-six-atomic-boundaries.de-en.author-proposal.json'
description_binding = next(record for record in freeze['externalInputBindings'] if record['path'] == str(description_path.relative_to(ROOT)))
assert verify(description_binding)

history_paths = [
    BASE / 'chemie-b008-twenty-six-positive-materials-author-v8/author-materials-v8.final.freeze.json',
    BASE / 'chemie-b008-fifty-two-materials-v8-independent-a-v1/independent-a.v8-materials.complete.final.freeze.json',
    BASE / 'chemie-b008-fifty-two-materials-v8-independent-b-v1/independent-b-v8-materials.final.freeze.json',
]
history = []
for path in history_paths:
    contents = read(path)
    own_records = contents.get('ownFiles', contents.get('files', []))
    assert own_records and all(verify(record) for record in own_records)
    history.append({'freeze': binding(path), 'ownFileCount': len(own_records), 'allFrozenOwnFilesExact': True, 'historyRewritten': False})

active_path = BASE / 'chemie-q1-current378-active-integration-verification-v1/final-current-machine-checks-and-inputs.actual.json'
active_contents = read(active_path)['currentInputs']
active = list(active_contents.values()) if isinstance(active_contents, dict) else active_contents
active_checks = [{'expected': record, 'actual': binding(ROOT / record['path']), 'exact': verify(record)} for record in active]
assert len(active_checks) == 19 and all(row['exact'] for row in active_checks)
external_drift = [{'expected': record, 'actual': binding(ROOT / record['path'])} for record in freeze['externalInputBindings'] if not verify(record)]
assert all(row['expected']['path'] == 'AGENTS.md' for row in external_drift), ('unexpected input drift', external_drift)

common = {
    'schemaVersion': 1, 'reviewer': '/root/biology_q1_seven_visuals_independent_v',
    'reviewerRole': 'independent machine material reviewer A for Chemistry v9',
    'authorOfChemistryV9': False, 'reviewedAtUTC': STAMP,
    'nativeAApproval': False, 'nativePositiveUnderstandingEvidenceV2Approval': False,
    'humanApproval': False, 'humanTrial': False, 'learnerPerformanceRecorded': False,
    'strictCompletionsAdded': 0, 'restoredActiveBindings': 0, 'activeWrites': 0,
}
sources = [
    {'sourceKey': 'HACH-1990', 'url': 'https://www.hach.com/p-conductivity-standard-solution-1990-scm-nacl-100-ml/210542', 'primaryPublisher': 'Hach', 'actualAccess': 'Successful fresh official product-page read on 2026-10-06', 'locator': 'Technical attributes, NaCl concentration / conductivity / reference temperature / tolerance', 'supportedFact': 'A 1000 mg/L NaCl solution standard is specified as 1990 microS/cm, tolerance plus or minus 20 microS/cm, at 25 C.', 'limit': 'This verifies the labelled standard and scale anchor. It does not certify the synthetic sample series, actual device accuracy, batch validity or a performed check.'},
    {'sourceKey': 'NIST-NACL-ENTHALPY', 'url': 'https://srd.nist.gov/jpcrdreprint/1.555709.pdf', 'primaryPublisher': 'NIST SRD / Pitzer, Peiper and Busey, Journal of Physical and Chemical Reference Data 13 (1984)', 'actualAccess': 'Successful fresh official 103-page primary-paper read on 2026-10-06', 'locator': 'Table A-11, PDF physical page 66 (zero-based page 65), row 25.0 C, first pressure column 1 bar; definition of standard enthalpy of solution earlier in paper', 'supportedFact': 'The dimensionless standard enthalpy of solution divided by RT is positive 1.566 at 25 C and 1 bar; the standard-state quantity concerns the dilute/infinite-dilution limit.', 'ownInference': '1.566 times R times 298.15 K gives approximately positive 3.88 kJ/mol. Heat uptake and possible slight cooling near these dilute ambient conditions are consistent with this sign.', 'limit': 'No exact temperature drop, all-concentration statement or all-temperature statement follows.'},
    {'sourceKey': 'BRAND-USP-VOLUMETRY', 'url': 'https://shop.brand.de/media/import/1/27/32406/42485/42649/49101/USP_Volumetric_instruments_EN.pdf', 'primaryPublisher': 'BRAND', 'actualAccess': 'Successful fresh official four-page brochure read on 2026-10-06', 'locator': 'PDF physical page 4, Class AS USP bulb-pipette and Class A USP volumetric-flask tables', 'supportedFact': 'The tables specify error limits of plus or minus 0.02 mL for a 10 mL bulb pipette and a 20 mL USP volumetric flask.', 'limit': 'The selected USP specifications do not establish the same limit for every generic Class A 20 mL flask, nor the presence or calibration of actual kit instruments. The candidate correctly requires certified or documented equivalent apparatus.'},
    {'sourceKey': 'THERMO-PH-PROCEDURE', 'url': 'https://documents.thermofisher.com/TFS-Assets/CMD/Product-Bulletins/TN-ph-calibration-procedure-for-optimal-measurement-precision-T-PHCAL-EN.pdf', 'primaryPublisher': 'Thermo Fisher Scientific', 'actualAccess': 'Successful fresh official four-page technical-note read on 2026-10-06', 'locator': 'Pages 1-2 calibration preparation, separate beakers, reference thermometer/ATC, calibration and verification; page 3 buffer temperature table; page 4 matched sample temperature', 'supportedFact': 'The procedure provides pH 4.01, 7.00 and 10.01 buffers at the reference temperature, temperature measurement or ATC, clean separate rinse/calibration vessels, calibration followed by verification and recorded actual temperature.', 'limit': 'Buffer labels are not already observed sample pH. Equal sample temperatures and the actual manual-dependent calibration remain execution prerequisites.'},
    {'sourceKey': 'SIGMA-PHENOLPHTHALEIN-SOLUTION', 'url': 'https://www.sigmaaldrich.com/US/en/product/mm/107227', 'primaryPublisher': 'Merck / Sigma-Aldrich', 'actualAccess': 'Successful fresh official product-page read on 2026-10-06', 'locator': 'Product identity and specified transition range', 'supportedFact': 'The named prepared solution is 1 percent phenolphthalein in ethanol, with indicated transition interval pH 8.2 to 9.8.', 'limit': 'This identity/range check is not local authorization to use the chemical, and does not alone validate endpoint error for every weak-acid sample.'},
    {'sourceKey': 'SIGMA-PHENOLPHTHALEIN-COLOUR', 'url': 'https://www.sigmaaldrich.com/KI/en/product/sial/105945', 'primaryPublisher': 'Merck / Sigma-Aldrich', 'actualAccess': 'Successful fresh official product-page read on 2026-10-06', 'locator': 'Visual transition interval and description of acid/base colour', 'supportedFact': 'The ordinary transition proceeds from colourless to red/pink in the stated mildly alkaline region.', 'limit': 'The independent colour reference does not mean powder is supplied in the candidate. The candidate explicitly supplies prepared solution and requires the local protocol.'},
    {'sourceKey': 'SIGMA-METHYL-ORANGE', 'url': 'https://www.sigmaaldrich.com/US/en/product/mm/101323', 'primaryPublisher': 'Merck / Sigma-Aldrich', 'actualAccess': 'Successful fresh official product-page read on 2026-10-06', 'locator': 'Product identity / transition interval and colour direction', 'supportedFact': 'The named 0.1 percent methyl-orange solution is specified for pH 3.1 to 4.4 with the red to yellow-orange transition.', 'limit': 'Its acidic interval does not locate an alkaline weak-acid equivalence point; the measured curve and actual endpoint bias remain necessary.'},
]

science = {
    4: ('KEEP', ['B-v8-02'], ['HACH-1990'], 'The formerly unidentified standard now has NaCl identity, concentration, 25-C reference and tolerance; temperatures, compensation and quantitative low/high ranges are supplied and logged. Salt at 1 g/50 mL is not forced into the low conductivity range. Display resolution is explicitly distinguished from accuracy and an overrange reading is invalid.', 'The standard upper tolerance is 2010 microS/cm, above the 2000-microS/cm low-range ceiling. The supplied higher range is available: actual execution must select an appropriate range under the supplied instrument instructions, including its accuracy specifications; the low range alone cannot check the entire standard interval. No completed or universally valid calibration is asserted.'),
    6: ('KEEP', ['B-v8-02'], ['HACH-1990'], 'A thermometer or sensor, supervised 20.0 plus or minus 0.5 C bath, actual temperature before/after, quantitative ranges and a labelled 25-C standard now close the supplied-apparatus gaps. A qualitative indicator is not accepted as quantitative evidence. The cylinder divisions and balance resolution explicitly limit concentration preparation.', 'The teacher must verify the actual quantitative device/range and standard instructions; resolution does not supply total measurement uncertainty. Planning data and the model example are not an observed investigation. A higher range must be used whenever the 2000-microS/cm ceiling is exceeded.'),
    7: ('KEEP', ['B-v8-02'], [], 'The actual temperature-control and readable-balance requirements now accompany the saturation protocol. Before/after checks, equilibration after deviations and a fixed temperature make the saturation comparison defensible; display resolutions are not promoted to total uncertainty.', 'Persistent solid after adequate stirring/equilibration bounds saturation under the selected conditions. Slow dissolution alone is not proof of saturation, and a future apparatus specification is not an already performed experiment.'),
    8: ('KEEP', ['B-v8-02'], ['THERMO-PH-PROCEDURE', 'SIGMA-PHENOLPHTHALEIN-SOLUTION', 'SIGMA-PHENOLPHTHALEIN-COLOUR', 'SIGMA-METHYL-ORANGE'], 'The supplied indicator menu has identities, prepared concentrations, transition intervals and colour direction. Named buffer values, actual temperature handling, separate vessels, burette support and receiving vessels now make the alternative pH/indicator routes concrete. Monoprotic acid and 1:1 hydroxide stoichiometry make the reference 8/16-mL endpoints yield the stated 0.00800/0.0160-M concentration ratio.', 'Methyl orange changes before the alkaline weak-acid equivalence point. Phenolphthalein may be suitable, but the candidate appropriately still requires the actual curve and endpoint-bias reasoning. Buffers are reference values, not measured sample pH; dilution for electrode immersion retains acid amount but can affect the curve. Local chemical use and actual execution remain separate.'),
    9: ('REVISE', ['A-V8-04', 'B-v8-02'], ['BRAND-USP-VOLUMETRY'], 'The duplicate dye paragraph is removed. A real 10.00-mL pipette with filler and a 20.00-mL USP flask with documented error limits now replace the missing volumetric apparatus. Nominal dilution factor 2 and its bounded volume-ratio error limits are coherent. A new two-language transfer assertion nevertheless sets A approximately 0.410 and diluted concentration 5.0 mg/L from the outside-range A 0.810, while the same supplied calibration is valid only at 0-6 mg/L.', 'A 0.810 exceeds the highest calibration absorbance 0.490. The value 0.410 is the blank-corrected half-signal arithmetic, but its predictive validity requires the very unvalidated linear extension that the text rejects. A twofold dilution is a reasonable trial; it must be followed by a newly supplied/observed valid in-range reading before assigning concentration and back-calculation. Marking the data synthetic prevents a performance claim but does not supply the missing valid model premise.'),
    10: ('KEEP', ['B-v8-03'], [], 'The added R2/W3 is explicitly fictional, with its own source, new sample, event time, observer and thermometer display. It is appended as a separate source/event and does not change or retrospectively validate the missing dates and old temperatures in R1.', 'A fictional future-dated note is a documentation stimulus, not a real observation. Only a separately performed, logged new sample measurement can support actual execution; R2 is neither learner performance nor an actual remeasurement of old fictional samples.'),
    13: ('KEEP', ['A-V8-01', 'B-v8-01'], ['HACH-1990'], 'The 0.5/1.0/1.5-g/L NaCl series now uses 1020/1990/2950 microS/cm at 25 C, consistent with the verified standard scale and an explicitly approximate synthetic low-concentration series. The blank 3 and sucrose control 4 microS/cm remain unchanged; they were not indiscriminately multiplied.', 'The Hach row anchors plausibility at 1.0 g/L. It does not certify the other synthetic points as measured values or prove unique unknown-ion identity. A generally increasing limited-range response is adequate for this material.'),
    16: ('KEEP', ['A-V8-03'], [], 'The revised response and criterion require validation of an additional method on known X, Y and blank samples. They explicitly prevent a named instrument from acquiring unprovided X specificity, and prevent repetition of the same unspecific test from proving X.', 'A controlled repeat can improve documented dilution/temperature conditions. It alone cannot remove the stated cross-reaction; unknown X/Y identities remain unavailable and a proposal is not already validated specificity.'),
    17: ('KEEP', ['A-V8-01', 'B-v8-01'], ['HACH-1990'], 'The 1-g/L temperature-confounded NaCl data now use 1800 at 20 C, 2300 at 35 C and 2298 for A brought to 35 C. The initial gap is 500; the matched gap is 2, inside the separately declared approximate repeat scatter of plus or minus 3 microS/cm. This supports temperature confounding rather than an established concentration difference.', 'The 2298 control is not blind multiplication of the old value and the repeat scatter is not complete measurement uncertainty. The data are expressly synthetic and not temperature-compensated; further matched-temperature calibration would be required for concentration inference or unknown-ion claims.'),
    43: ('KEEP', ['A-V8-01', 'B-v8-01'], ['HACH-1990'], 'The dialogue stimulus uses the same corrected 1800/2300/2298-microS/cm synthetic archive as case 17. Scale, reference temperatures and approximate repeat scatter are coherent across the two cases.', 'An opener/reference response is not an actual partner exchange. Actual learner dialogue is still required by the unmodified operator contract; changing the numeric stimulus creates no performed communication evidence.'),
    44: ('KEEP', ['A-V8-02'], ['NIST-NACL-ENTHALPY'], 'The transfer now names near-25-C NaCl dissolution in the considered dilute range as slight cooling / heat uptake. The positive standard-state enthalpy sign independently supports this bounded example and closes the former unqualified heat-release error.', 'The simple charge/mobility model does not itself calculate an energy balance. No exact cooling, all-concentration or all-temperature result follows from the standard-state anchor; the text appropriately retains those limits and no measured cooling is claimed.'),
    45: ('KEEP', ['A-V8-05'], [], 'The hypothesis is narrowed to the supplied polar-water and charged-particle model. It explicitly removes the unsupported claim that these cards independently compare same-element substances with different bonding. The retained sign/orientation rule can be checked against the supplied model.', 'This is a model rule within the supplied card/table context, not proof of exact solubility, lattice energy, molecular geometry or real digital-app execution.'),
}

case_reviews = []
field_reviews = []
for index in TARGETS:
    case = new['cases'][index]
    decision, old_ids, primary_ids, findings, limits = science[index]
    pointers = sorted(row['JSONPointer'] for row in case_diffs if int(row['JSONPointer'].split('/')[2]) == index)
    case_reviews.append({
        'caseIndexZeroBased': index, 'caseKey': case['caseKey'], 'candidateKey': case['candidateKey'],
        'candidateGoalId': case['candidateGoalId'], 'decision': decision, 'reviewStatus': 'actual_independent_machine_material_review',
        'oldFindingIds': old_ids, 'changedDEENFieldCount': len(pointers), 'actuallyReviewedJSONPointers': pointers,
        'currentCaseValueSha256': compact_hash(case), 'languageReview': 'Both actual DE and EN changed texts reviewed; no divergent scientific claim found.',
        'concreteScientificFinding': findings, 'boundaryAndExecutionLimit': limits,
        'officialPrimarySourceKeys': primary_ids, 'newUnresolvedFindingIds': [NEW_FINDING] if index == 9 else [],
        'nativeApproval': False, 'humanApproval': False, 'learnerPerformanceRecorded': False,
    })
    for pointer in pointers:
        reject = pointer in ['/cases/9/transfer/de', '/cases/9/transfer/en']
        row = declared[pointer]
        field_reviews.append({'JSONPointer': pointer, 'caseIndexZeroBased': index, 'caseKey': case['caseKey'], 'oldFindingIds': row['findingIds'], 'beforeValueSha256': compact_hash(row['before']), 'afterValueSha256': compact_hash(row['after']), 'decision': 'REVISE' if reject else 'KEEP', 'caseReviewReference': index, 'newUnresolvedFindingIds': [NEW_FINDING] if reject else []})

new_finding = {
    'findingId': NEW_FINDING, 'severity': 'scientific_revision_required', 'status': 'open',
    'affectedCaseIndexZeroBased': 9, 'affectedCaseKey': new['cases'][9]['caseKey'],
    'affectedJSONPointers': ['/cases/9/transfer/de', '/cases/9/transfer/en'],
    'suppliedPremises': {'calibration': 'A = 0.010 + 0.080*c, c in mg/L', 'validatedConcentrationRange_mg_L': [0, 6], 'outOfRangeAbsorbance': 0.810, 'nominalTrialDilutionFactor': 2},
    'actualProblem': 'The asserted diluted A approximately 0.410 / c 5.0 does not follow from a calibration explicitly limited to 0-6 mg/L and the out-of-range undiluted signal. Calling the arithmetic a teaching model or non-performance does not independently validate the extension.',
    'independentCalculation': {'maximumInRangeAbsorbance': 0.490, 'outsideRange': True, 'unvalidatedInvertedConcentration_mg_L': 10.0, 'unvalidatedHalfConcentration_mg_L': 5.0, 'conditionalHalfSignalWithBlankPreserved': 0.410},
    'minimalCorrectionOptions': [
        'Keep the factor-2 dilution as a justified trial. Remove the predetermined A/c answer and require a newly supplied or actually measured in-range reading; repeat dilution if the reading remains outside the range.',
        'Supply A = 0.410 explicitly as an additional new synthetic reading after the dilution, not as a prediction derived from A = 0.810. Then (0.410-0.010)/0.080 = 5.0 mg/L and factor-2 back-calculation use only valid new inputs.',
    ],
    'localizedReviewNeededAfterCorrection': 'Only changed DE/EN transfer premises/response and any directly changed derived material fields. Preserve the valid volumetric apparatus, unchanged profiles/descriptions and the other 11 case decisions.',
    'blocks': 'Approval of this v9 transfer field and a complete material clearance for its affected profile; does not invalidate the 40 unchanged historical cases or confer any native gate result.',
}

resolutions = [
    ('A-V8-01', [13, 17, 43], 'resolved_for_current_targeted_materials', 'The scale and temperature-confounding controls are corrected; blank/control/scatter are not blindly scaled.'),
    ('B-v8-01', [13, 17, 43], 'resolved_for_current_targeted_materials', 'Official NaCl standard scale, explicit synthetic origin and matched-temperature control are coherent.'),
    ('A-V8-02', [44], 'resolved_for_current_targeted_materials', 'The ambient dilute NaCl example now correctly uses heat uptake/cooling, with an appropriately bounded primary anchor.'),
    ('A-V8-03', [16], 'resolved_for_current_targeted_materials', 'Follow-up specificity is a validation proposal; no missing X/Y identity is invented.'),
    ('A-V8-04', [9], 'resolved_for_current_targeted_materials', 'The duplicate supplied dye paragraph is removed.'),
    ('A-V8-05', [45], 'resolved_for_current_targeted_materials', 'The supplied hypothesis no longer requires unsupported comparison of differently bonded same-element substances.'),
    ('B-v8-02', [4, 6, 7, 8, 9], 'old_apparatus_finding_resolved_new_case9_transfer_finding_separate', 'Known standards, actual temperature measurement/control, receiving vessels, named indicators/buffers and real volumetric equipment are provided. This closes the old apparatus omissions; the new out-of-range prediction is separately A-V9-01.'),
    ('B-v8-03', [10], 'resolved_for_current_targeted_materials', 'R2/W3 is a separate fictional new event/source, never a retrospective measurement or overwritten R1 record.'),
]
dump('twelve-changed-cases-and-sixty-fields.independent-a.review.json', {
    **common, 'artifactKind': 'independent-targeted-material-delta-review',
    'authorFreeze': binding(AUTHOR_FREEZE), 'reviewedMaterialFile': delta['correctedFile'],
    'reviewedChangedCases': 12, 'reviewedChangedLeafFields': 60,
    'caseDecisionCounts': {'KEEP': 11, 'REVISE': 1, 'BLOCK': 0},
    'fieldDecisionCounts': {'KEEP': 58, 'REVISE': 2, 'BLOCK': 0},
    'ownDecisionDoesNotAssertPeerAgreement': True, 'newPeerReviewBodiesRead': False,
    'historicV8AFindingAndBFindingBodiesReadAsAuthorizedBaseline': True,
    'caseReviews': case_reviews, 'changedFieldReviews': field_reviews,
})
dump('old-findings-resolution-and-new-transfer-finding.independent-a.review.json', {
    **common, 'artifactKind': 'targeted-old-finding-resolution-and-new-scientific-finding',
    'oldFindingResolutions': [{'findingId': ident, 'caseIndicesZeroBased': indices, 'decision': state, 'actualResolution': reason} for ident, indices, state, reason in resolutions],
    'newUnresolvedFindings': [new_finding], 'allCurrentTwelveMaterialsClear': False,
})
dump('literal-sixty-field-and-forty-case-hash-reuse.actual.json', {
    **common, 'artifactKind': 'actual-readonly-literal-delta-and-historical-hash-reuse',
    'actualOldMaterialBinding': delta['sourceFile'], 'actualNewMaterialBinding': delta['correctedFile'],
    'declaredDeltaBinding': binding(AUTHOR / 'literal-field-delta-and-finding-response.author.json'),
    'sixtyDeclaredLeafChangesExactlyMatchActual': True, 'changedCaseIndicesZeroBased': TARGETS,
    'rootMetadataOnlyChangedPointers': [row['JSONPointer'] for row in root_diffs],
    'unchangedFortyCaseReuse': unchanged, 'unchangedProfileFile': profile_binding,
    'unchangedDescriptionFile': description_binding, 'twentySixProfileDescriptionHashReuse': profile_reuse,
    'historicalFreezesAndFrozenOwnFilesPreserved': history,
    'activeInputPreservation': {'count': 19, 'allExact': True, 'checks': active_checks, 'manifestBinding': binding(active_path)},
    'authorExternalInputDrift': external_drift,
    'driftTreatment': 'Any recorded AGENTS delta is an unrelated current policy input change, not a rewrite of historical evidence. No blanket all-external-input equality is claimed.',
})
calculations = {
    'NaClStandardEnthalpy_kJ_mol_at25C1barDiluteStandardState': 1.566 * 8.314462618 * 298.15 / 1000,
    'conductivityInitialGap_uS_cm': 2300 - 1800, 'conductivityMatchedGap_uS_cm': 2300 - 2298,
    'statedRepeatScatter_uS_cm': 3, 'matchedGapWithinApproximateRepeatScatter': abs(2300 - 2298) <= 3,
    'effectiveRelativeTemperatureSlopePerC_fromSyntheticPair': (2298/1800 - 1) / 15,
    'titrationReferenceConcentrations_mol_L': [0.0100 * 8 / 10, 0.0100 * 16 / 10],
    'nominalDilutionFactor': 20/10, 'volumeRatioErrorLimitBound_notStatisticalUncertainty': [(20-.02)/(10+.02), (20+.02)/(10-.02)],
    'standardToleranceInterval_uS_cm': [1990-20, 1990+20], 'lowRangeCeiling_uS_cm': 2000,
    'standardUpperBoundRequiresAvailableHigherRange': 1990+20 > 2000,
    'case9HighestValidatedAbsorbance': .010 + .080 * 6,
    'case9ConditionalHalfSignalArithmetic_notValidatedPrediction': (.810-.010)/2 + .010,
}
assert math.isclose(calculations['NaClStandardEnthalpy_kJ_mol_at25C1barDiluteStandardState'], 3.882046708285792)
dump('targeted-primary-facts-and-independent-calculations.actual.json', {
    **common, 'artifactKind': 'actual-targeted-primary-reading-and-independent-calculation-receipt',
    'primarySourcesActuallyRead': sources, 'independentCalculations': calculations,
    'case9DomainFindingIsLogicalInferenceFromSuppliedPremises': True,
    'manufacturerReferencesDoNotCertifyCandidateApparatusOrExecution': True,
    'unchangedOtherMaterialScienceNotReopened': True,
})
dump('native-gate-limits-and-exact-review-inputs.actual.json', {
    **common, 'artifactKind': 'inert-independent-material-review-native-limits-and-input-bindings',
    'allFiftyTwoCaseCandidateGoalIdsNull': all(case['candidateGoalId'] is None for case in new['cases']),
    'allTwentySixProfileGoalIdsNull': all(profile['goalId'] is None for profile in profiles),
    'notCurrentNativeGoalRecords': True, 'notRuntimeLandscape': True,
    'caseAndProfileStatusRemainAiCandidateNeedsHumanReview': all(case['status'] == 'ai_candidate' and case['reviewStatus'] == 'needs_human_review' for case in new['cases']) and all(profile['status'] == 'ai_candidate' and profile['reviewStatus'] == 'needs_human_review' for profile in profiles),
    'all1646OriginalNationalSourceObligations': 'Unchanged historical author/source inputs retained as references; this targeted material review neither re-evaluates them nor supplies global source clearance.',
    'noNativeGatePassClaim': ['D', 'P', 'A', 'M', 'V'],
    'stillRequired': ['Resolve A-V9-01 in the changed transfer DE/EN fields.', 'Obtain the separate independent targeted review; this receipt asserts only reviewer A decisions.', 'Bind final semantic atoms to real current UUIDs and real native page/goal/context/source fingerprints.', 'Materialize and independently check truthful positive-understanding-evidence-v2 profiles and all remaining applicable native gates.', 'Keep human approval, actual trial and local experiment safety authorization separate.'],
    'actualInputBindings': [binding(AUTHOR_FREEZE)] + freeze['ownFiles'] + [profile_binding, description_binding] + [binding(path) for path in history_paths] + [
        binding(BASE / 'chemie-b008-fifty-two-materials-v8-independent-a-v1/precise-unresolved-findings-and-downstream-gates.json'),
        binding(BASE / 'chemie-b008-fifty-two-materials-v8-independent-b-v1/literal-material-scientific-findings.actual.json'),
        binding(ROOT / 'AGENTS.md'),
    ],
})

review_freeze_name = 'independent-a-v9-material-deltas.final.freeze.json'
owned = [binding(path) for path in sorted(HERE.iterdir()) if path.is_file() and path.name != review_freeze_name]
dump(review_freeze_name, {
    **common, 'artifactKind': 'independent-machine-material-review-freeze',
    'status': 'targeted_review_complete_one_localized_scientific_revision_open',
    'authorInputFreeze': binding(AUTHOR_FREEZE), 'ownFiles': owned,
    'reviewedChangedCases': 12, 'reviewedChangedLeafFields': 60,
    'unchangedCasesHashReuseOnly': 40, 'unchangedProfilesDescriptionsHashReuseOnly': 26,
    'caseKEEP': 11, 'caseREVISE': 1, 'fieldKEEP': 58, 'fieldREVISE': 2,
    'unresolvedScientificFindingIds': [NEW_FINDING], 'allAuthorOwnFilesExact': True,
    'currentActive19InputsExact': True, 'newNativeGateCompletions': 0,
})
assert all(verify(record) for record in read(HERE / review_freeze_name)['ownFiles'])
print(json.dumps({'reviewFreeze': binding(HERE / review_freeze_name), 'ownFileCount': len(owned), 'caseKEEP': 11, 'caseREVISE': 1, 'fieldKEEP': 58, 'fieldREVISE': 2, 'active19Exact': True, 'strictAdded': 0}, ensure_ascii=False))
