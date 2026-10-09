# SPDX-License-Identifier: Apache-2.0
"""Freeze this reviewer's targeted scientific judgments before author checks."""
from pathlib import Path
from datetime import datetime, timezone
from copy import deepcopy
import json
import hashlib
import math

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
OUT = BASE / 'biologie-evolution-two-material-findings-independent-b-followup-v1'
AUTHOR = BASE / 'biologie-evolution-two-material-findings-author-successor-v1'
OLD = BASE / 'biologie-evolution-systematics-behavior-eighteen-whole-author-v1'
ENTRY = AUTHOR / 'neutral-whole18-two-material-findings-author-successor.targeted-independent-review.entry.json'
NOW = datetime.now(timezone.utc).isoformat()
TARGETS = ['0db20819-ee94-54c6-8ecb-aff8c9b7419e', 'e3167331-f855-5030-9673-29f55a7b4230']

def read(p):
    return json.loads(Path(p).read_text())

def binding(p):
    p = Path(p)
    assert not p.is_absolute() and p.is_file()
    assert not any(x.is_symlink() for x in [p, *p.parents])
    data = p.read_bytes()
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    path = OUT / name
    assert not path.exists(), path
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)

def differences(a, b, pointer=''):
    if type(a) != type(b):
        return [{'pointer': pointer, 'before': a, 'after': b}]
    if isinstance(a, dict):
        assert set(a) == set(b), (pointer, set(a) ^ set(b))
        return [r for k in a for r in differences(a[k], b[k], pointer + '/' + k)]
    if isinstance(a, list):
        assert len(a) == len(b), pointer
        return [r for i in range(len(a)) for r in differences(a[i], b[i], pointer + '/' + str(i))]
    return [] if a == b else [{'pointer': pointer, 'before': a, 'after': b}]

def replace_pointer(obj, pointer, value):
    parts = pointer.lstrip('/').split('/')
    current = obj
    for part in parts[:-1]:
        current = current[int(part)] if isinstance(current, list) else current[part]
    last = parts[-1]
    current[int(last) if isinstance(current, list) else last] = value

OUT.mkdir(parents=True, exist_ok=True)
entry = read(ENTRY)
old_entry = read(entry['originalWholeAuthorEntry']['path'])
old_path = old_entry['wholeMaterialsP18Cases36']['path']
new_path = entry['wholeMaterials18Cases36Successor']['path']
old = read(old_path)
new = read(new_path)
old_candidate = read(old_entry['normalCandidateSet']['path'])
new_candidate = read(entry['wholePositiveCandidateSet18']['path'])
for record in [entry[k] for k in ['originalWholeAuthorEntry', 'wholeSource35Partners30ExactOriginalFrame',
        'currentWhole479ExactInactiveSnapshot', 'wholeKinds394UnchangedCandidate', 'wholeMaterials18Cases36Successor',
        'wholePositiveCandidateSet18', 'exactChangedValuesAndMaskedPreservation']] + [old_entry['wholeMaterialsP18Cases36'], old_entry['normalCandidateSet']]:
    assert binding(record['path']) == record, record['path']
assert len(old['entries']) == len(new['entries']) == 18
assert sum(len(r['newAuthoredWholeCases']) for r in old['entries']) == 36
assert sum(len(r['newAuthoredWholeCases']) for r in new['entries']) == 36
actual_diff = differences(old['entries'], new['entries'], '/entries')
expected = []
for index, container, fields in [
    (0, 'wholeProfile/applicationCaseBriefs/0', ['taskDemandDe', 'taskDemandEn', 'expectedPerformanceDe', 'expectedPerformanceEn']),
    (0, 'newAuthoredWholeCases/0', ['taskDe', 'taskEn', 'workedResponseDe', 'workedResponseEn']),
    (14, 'wholeProfile/applicationCaseBriefs/0', ['expectedPerformanceDe', 'expectedPerformanceEn']),
    (14, 'newAuthoredWholeCases/0', ['workedResponseDe', 'workedResponseEn'])
]:
    expected.extend(f'/entries/{index}/{container}/{field}' for field in fields)
assert len(actual_diff) == 12 and {r['pointer'] for r in actual_diff} == set(expected)
author_diff = read(entry['exactChangedValuesAndMaskedPreservation']['path'])
assert actual_diff == author_diff['actualFieldChanges']
masked_old, masked_new = deepcopy(old['entries']), deepcopy(new['entries'])
for pointer in expected:
    relative = pointer.removeprefix('/entries')
    replace_pointer(masked_old, relative, '<masked-two-material-successor-field>')
    replace_pointer(masked_new, relative, '<masked-two-material-successor-field>')
assert masked_old == masked_new
canonical_snapshot = read(entry['currentWhole479ExactInactiveSnapshot']['path'])
canon = {r['id']: r for r in canonical_snapshot['goals']}
assert len(canonical_snapshot['goals']) == 479
frame = read(entry['wholeSource35Partners30ExactOriginalFrame']['path'])
assert len(frame['wholeCurrentGoalRows']) == 18
assert len(frame['wholeOriginalSourceDutyRows']) == 35
assert len(frame['wholeOriginalAndCurrentPartnerGoals']) == 30
old_profiles = {r['goalId']: r for r in old_candidate['goals']}
new_profiles = {r['goalId']: r for r in new_candidate['goals']}
assert set(old_profiles) == set(new_profiles) == set(entry['selectedWholeGoalIds'])
profile_differences = []
for ordinal, row in enumerate(new['entries'], 1):
    goal_id = row['goalId']
    assert row['wholeCurrentGoal'] == canon[goal_id]
    assert row['wholeProfile'] == new_profiles[goal_id]['profile']
    assert row['sourceDutyRowIds'] == old['entries'][ordinal-1]['sourceDutyRowIds']
    assert row['wholeCurrentGoal'] == old['entries'][ordinal-1]['wholeCurrentGoal']
    assert [r['caseId'] for r in row['newAuthoredWholeCases']] == [r['caseId'] for r in old['entries'][ordinal-1]['newAuthoredWholeCases']]
    if goal_id not in TARGETS:
        assert old['entries'][ordinal-1] == row
        assert old_profiles[goal_id] == new_profiles[goal_id]
    else:
        profile_differences += differences(old_profiles[goal_id], new_profiles[goal_id], '/goals/' + goal_id)
    for case, brief in zip(row['newAuthoredWholeCases'], row['wholeProfile']['applicationCaseBriefs']):
        assert case['caseId'] == brief['id']
        for lang in ['De', 'En']:
            assert brief['taskDemand'+lang] == case['material'+lang] + '\n\n' + ('Auftrag: ' if lang == 'De' else 'Task: ') + case['task'+lang] + '\n\n' + ('Frische Variation: ' if lang == 'De' else 'Fresh variation: ') + case['freshTransferTask'+lang]
            assert brief['expectedPerformance'+lang] == case['workedResponse'+lang] + '\n\nTransfer: ' + case['workedFreshTransfer'+lang]
        assert case['materialStatus'] == 'constructed_synthetic_didactic_material'
        assert case['actualExperimentPerformed'] is False and case['actualLearnerPerformance'] is False
assert len(profile_differences) == 6

preservation = write('two-materials.independent-b.actual-12-field-diff-and-whole-frame-preservation.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'actual structural comparison by independent reviewer B, not source approval',
    'createdAt': NOW, 'originalWholeMaterials': binding(old_path), 'successorWholeMaterials': binding(new_path),
    'oldWholeCandidateSet': binding(old_entry['normalCandidateSet']['path']),
    'successorWholeCandidateSet': binding(entry['wholePositiveCandidateSet18']['path']),
    'wholeFrame': binding(entry['wholeSource35Partners30ExactOriginalFrame']['path']),
    'wholeCanonical479Snapshot': binding(entry['currentWhole479ExactInactiveSnapshot']['path']),
    'actualMaterialFieldDifferences': actual_diff, 'actualPositiveProfileFieldDifferences': profile_differences,
    'operativeMaterialChangedFieldCount': 12, 'operativeProfileChangedFieldCount': 6,
    'all18WholeCurrentGoalObjectsUnchanged': True, 'all18CasePairsSameIdsAndOrder': True,
    'other16CompleteEntriesAndProfilesExactlyUnchanged': True, 'all36CasesEqualAfterOnly12SpecifiedFieldsMasked': True,
    'wholeSource35Partners30FrameRetainedExactly': True, 'sourceDutiesRemoved': 0,
    'wholeSourceApproval': False, 'wholeCourseApproval': False, 'activeWrites': [], 'strictGain': 0
})
inputs = write('two-materials.independent-b.exact-whole-two-goals-profiles-four-bilingual-cases.input.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'exact whole two inputs actually substantively read, independent targeted followup',
    'createdAt': NOW, 'wholeMaterialBinding': binding(new_path),
    'entries': [r for r in new['entries'] if r['goalId'] in TARGETS],
    'fourCases': True, 'remaining16NotScientificallyReReviewed': True, 'activeWrites': []
})
references = write('two-materials.independent-b.bounded-primary-reference-reading.receipt.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'own bounded primary-source reading, paraphrases only; provider material is not relicensed',
    'createdAt': NOW, 'retrievalMethod': 'independent web tool open/search; full author primary-reading and remedies file not read before this FIRST',
    'records': [
        {'title': 'Radiocarbon dating of terrestrial carbonates', 'author': 'Jeffrey S. Pigati', 'publicationYear': 2014,
         'url': 'https://www.usgs.gov/publications/radiocarbon-dating-terrestrial-carbonates',
         'readScope': 'USGS primary-author publication record and complete abstract returned by official-domain search; initial direct open returned Internal Error, then successful official record retrieval via search',
         'ownParaphrase': 'USGS describes primary deposits such as tufa/speleothems and secondary carbonates as potentially datable when conditions permit. Its abstract explicitly discusses isotopic disequilibrium and open-system behavior. Carbonate suitability is conditional, not an organic-only material rule.'},
        {'title': 'Calculations and Reporting of Results', 'institution': 'WHOI NOSAMS',
         'url': 'https://www2.whoi.edu/site/nosams/calculations-and-reporting-of-results/',
         'readScope': 'Official page sections radiocarbon age, process blanks, limiting ages',
         'ownParaphrase': 'NOSAMS distinguishes radiocarbon ages from calendar ages and reservoir corrections. Sample size, process blanks and uncertainty limit reported ages to tens of thousands of years, not millions; separate inorganic-carbon backgrounds are described.'},
        {'title': 'Radiocarbon Services', 'institution': 'WHOI NOSAMS',
         'url': 'https://www2.whoi.edu/site/nosams/radiocarbon-services/',
         'readScope': 'Official facility sample and service description',
         'ownParaphrase': 'Carbon-bearing materials include dissolved inorganic carbon; current processing accommodates carbon dioxide from both carbonate and organic samples. Organic matter is therefore not universally required.'},
        {'title': 'Isotopic Approach to Soil Carbonate Dynamics and Implications for Paleoclimatic Interpretations', 'publicationYear': 1994,
         'url': 'https://www.usgs.gov/publications/isotopic-approach-soil-carbonate-dynamics-and-implications-paleoclimatic',
         'readScope': 'Official primary research publication record abstract',
         'ownParaphrase': 'Repeated dissolution and precipitation can re-equilibrate carbonate isotopes. This supports separately checking later carbon exchange rather than assuming every carbonate is a closed clock.'}
    ],
    'verbatimQuotes': [], 'wholeCurriculumSourceCoverageReview': False,
    'sourceDutyOrCourseQualificationChanged': False, 'actualExperimentPerformed': False
})

plant_check = {
    'unlobedOnlyCompatibleCandidates': ['B', 'D'], 'unlobedAndHeartShapedWithinGivenKey': ['B'],
    'P1': 'opposite => A/B; unlobed + heart-shaped => B, Syringa vulgaris',
    'P2': 'alternate => C/D; rounded lobes => C, Quercus robur',
    'P3': 'unlobed alone => B/D; observe arrangement and full shape without inventing them',
    'realWorldLimit': 'Only the declared four-species synthetic selection is identified; no unrestricted world-wide species proof.',
    'animalUnchangedCheck': 'T1 six legs + hard covers + seven spots => Coccinella septempunctata; T2 soft body/coiled shell/no jointed legs => Helix pomatia; T3 six legs alone supports insect group, not the species.',
    'bilingualAndRubricAssessment': 'DE/EN premises, keyed assignments, unknown-data handling and revised unlobed-only task agree. Both full cases carry the two expectation references without claiming each case demonstrates every aspect or requiring extra task labels.'
}
dating_check = {
    'L_Ma': {'nominal': 2.4, 'uncertainty': 0.1, 'interval': [2.3, 2.5]},
    'U_Ma': {'nominal': 1.8, 'uncertainty': 0.1, 'interval': [1.7, 1.9]},
    'ownConservativeFossilEnclosingIntervalMa': [1.7, 2.5],
    'intervalInterpretation': 'Conservative outer envelope under the supplied undisturbed-stratigraphy premises; not an exact date or a newly asserted statistical confidence interval.',
    'radiocarbon': 'Appropriate carbon-bearing material within a usable age window is necessary. Selected inorganic carbonates are possible only with initial-carbon/isotopic conditions, reservoir correction, preservation/exchange assessment and appropriate calendar calibration. No arbitrary carbonate becomes automatically datable; million-year ash remains unsuitable for C14.',
    'reworking': 'An older fossil redeposited here may predate the lower ash. The two dates no longer provide both biological age bounds, though dates still concern ash crystallisation.',
    'ownInitialParentFraction': 1 / (1 + 3), 'ownHalfLives': -math.log2(1 / (1 + 3)), 'ownAgeMa': 2.0,
    'daughterLossCheck': 'With original P=1,D=3, losing one daughter gives P/(P+D)=1/3 instead of 1/4, hence fewer apparent half-lives and an underestimated simple-method age. This toy countercheck is not a measured specimen or a correction formula without a known loss model.',
    'ownToyDaughterLossApparentAgeMa': -math.log2(1/3),
    'treeLimit': 'The supplied homologous derived trait supports a dated lineage/relatedness hypothesis, not direct ancestry or an exact divergence; both proposed ancestor/sister arrangements remain compatible with the reduced characters.',
    'bilingualAndRubricAssessment': 'Both DE/EN case pairs, profile briefs and criteria preserve the interval, parent/daughter assumptions, reworking, daughter-loss error direction and phylogenetic limits. The changed organic-only phrase is consistently replaced in both languages and both profile representations.',
    'performedExperimentOrLearnerAssessment': False
}
verdict = write('two-materials.independent-b.science-FIRST.verdict.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'role': 'genuine targeted independent scientific/P material followup B; not a second whole18 review',
    'reviewer': 'Codex /root/evo12_visual_independent_b; actual model variant not exposed', 'createdAt': NOW,
    'disclosedPriorKnowledge': {
        'notBlind': True, 'originalMaterialCounterfindingIdsReadBeforeJudgment': ['EVO18B-MATERIAL-001', 'EVO18B-MATERIAL-002'],
        'originalFindingBinding': entry['originalIndependentBFIRST'],
        'readScopeOfOriginalReview': 'Only these two original finding objects substantively read for this material followup; no whole18 scientific review restart.',
        'authorGenericCandidateReasonReadWithWholeProfileEntries': True,
        'authorScientificReferenceReadingRemediesOrChecksReadBeforeOwnFIRST': False,
        'peerFollowupOrVerdictRead': False,
        'independence': 'Own finite-key reasoning, four complete bilingual case/profile/criterion reading, own arithmetic and independent official USGS/NOSAMS reading; no copied author or peer conclusion.'
    },
    'neutralAuthorEntry': binding(ENTRY), 'exactTwoWholeInputs': inputs, 'ownActualPreservation': preservation,
    'ownPrimaryReading': references,
    'targetedFindings': [
        {'findingId': 'EVO18B-MATERIAL-001', 'goalId': TARGETS[0], 'ordinal': 1, 'status': 'resolved_on_exact_successor_material_only',
         'verdict': 'KEEP revised finite-key task and matching full profile candidate',
         'reason': 'The revised question concerns only the unlobed trait, which leaves B and D; the additionally observed heart shape identifies B in this finite choice. This removes the original unsupported claim that the full shape cannot identify P1. Full key path and world-wide/out-of-key uncertainty remain explicit.',
         'ownScientificChecks': plant_check},
        {'findingId': 'EVO18B-MATERIAL-002', 'goalId': TARGETS[1], 'ordinal': 15, 'status': 'resolved_on_exact_successor_material_only',
         'verdict': 'KEEP revised C14 suitability explanation and matching full profile candidate',
         'reason': 'Organic-only necessity is removed. The new conditional inorganic-carbonate statement agrees with USGS and NOSAMS primary material; initial carbon, reservoir/exchange effects, usable age and calendar calibration are retained as separate necessary assessments. Million-year ash rejection and the unchanged numerical/tree-limit cases remain sound.',
         'ownScientificChecks': dating_check}
    ],
    'newMaterialHoldFindings': [], 'twoMaterialCorrectionsIndependentlyScientificallyAccepted': True,
    'remainingAtomarityFindingExact': entry['remainingAtomarityFindingExact'],
    'remainingSourceAndCourseHoldsExact': entry['remainingSourceAndCourseHoldsExact'],
    'remainingHoldsUnchanged': True, 'wholeSource35Partners30ReadAsPreservedFrameNotReapproved': True,
    'reviewAuthority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'whole18IndependentApproval': False, 'wholeSourceApproval': False, 'wholeCourseApproval': False,
    'currentNativeDPApproval': False, 'currentVApproval': False, 'humanApproval': False, 'humanTrial': False,
    'actualLearnerPerformance': False, 'actualExperimentPerformed': False,
    'newScientificClosures': 0, 'materialFindingResolutions': 2, 'restoredBindings': 0, 'strictGain': 0,
    'activeWrites': [], 'nextCheckScope': 'ordinary scoped positive-understanding candidate tooling for these two exact whole profiles, after this FIRST'
})
seal = write('two-materials.independent-b.science-FIRST.freeze.json', {
    'schemaVersion': 1, 'license': 'CC-BY-4.0', 'createdAt': datetime.now(timezone.utc).isoformat(),
    'role': 'immutable own targeted scientific FIRST before author checks and before ordinary own P2 tooling',
    'sealedArtifacts': [verdict, inputs, preservation, references], 'neutralAuthorEntry': binding(ENTRY),
    'authorScientificReferenceReadingRemediesOrChecksReadBeforeSeal': False,
    'peerFollowupOrVerdictRead': False, 'strictGain': 0, 'activeWrites': []
})
print(json.dumps({'ownScienceFIRST': verdict, 'ownFIRSTFreeze': seal, 'actual12FieldChanges': len(actual_diff), 'other16ExactlyUnchanged': True}, ensure_ascii=False))
