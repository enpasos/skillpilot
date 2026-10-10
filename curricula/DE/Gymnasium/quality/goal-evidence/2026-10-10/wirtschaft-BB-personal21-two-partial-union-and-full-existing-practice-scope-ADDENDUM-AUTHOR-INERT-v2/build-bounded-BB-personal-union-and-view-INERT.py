import copy
import hashlib
import json
import pathlib
import shutil

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).parent
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'
BASE = Q / 'wirtschaft-common343-M6-fieldwise-composition-AUTHOR-INERT-v1'
PREP = Q / 'wirtschaft-common343-qualified-M6-integration-preparation-root-v1'
SID = 'bb-wirtschaft-sekii-q-lk-personal-g02-e3dcd4a1'
FAB = 'fab48742-756b-564d-87ef-cd6f3c75f348'
DIRECTOR = '912ab267-ee00-581b-a31c-dfc0b3587184'
WORKS = '776457c2-8bb3-53b9-838b-a028319175fb'
PRACTICE = '81dfe82c-508b-51ba-829e-3f9e4d4a27a1'

def read(p): return json.loads(p.read_text())
def rel(p): return str(p.relative_to(ROOT))
def binding(p):
    b = p.read_bytes()
    return {'path': rel(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def write(p, x):
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')
def history(p):
    dest = OUT / 'history' / rel(p)
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copyfile(p, dest)
    assert dest.read_bytes() == p.read_bytes()
    return binding(dest)

source_input = PREP / 'BB101.pipeline-only-qualified-successor.ready.source-extraction.json'
mapping_input = PREP / 'BB101.pipeline-only-qualified-successor.ready.review.json'
source = read(source_input)
mapping = read(mapping_input)
source_before = copy.deepcopy(source)
mapping_before = copy.deepcopy(mapping)
old_open = source['qualityReview'].pop('boundedAuthorOpenOriginalCoverage')
source['qualityReview']['historicalAuthorOpenOriginalCoverage'] = old_open
assert source['qualityReview']['historicalAuthorOpenOriginalCoverage'] == source_before['qualityReview']['boundedAuthorOpenOriginalCoverage']
new_edge = {'legacyGoalId': SID, 'canonicalGoalId': FAB, 'matchType': 'partial', 'reviewDecisionId': SID}
assert new_edge not in mapping['mappings']
mapping['mappings'].append(new_edge)
decision = next(r for r in mapping['decisions'] if r['sourceGoalId'] == SID)
old_decision = copy.deepcopy(decision)
assert decision['canonicalGoalIds'] == [WORKS] and decision['matchType'] == 'partial'
decision['canonicalGoalIds'].append(FAB)
decision['rationale'] = (
    'Actual BB original PDF/printed20–21: LK Personal is a wahlobligatorische selected alternative. '
    'The S21 performance checks democratic workplace participation and explains basic BetrVG AND MitbestG provisions. '
    '776 partial supplies works-council/workplace participation; fab partial supplies ordinary supervisory-board corporate participation under supplied MitbestG rules and its distinction from the works council. '
    'The whole fab contract additionally compares Montan co-determination; that additional performance is a consciously retained whole-goal didactic extension, never a BB original-source mandate. '
    'The existing full81d practice already offered in BBLK assesses fab plus912;912 is a consciously continued whole practice performance and has NO Source21 edge. '
    'No compulsory GK target or universally compulsory LK Personal/Montan/Arbeitsdirektor follows. '
    'Existing776 edge and all unrelated mappings/decisions are exact. This new bounded Source/Course union awaits independent C qualification; no author scientific self-approval.'
)
decision['reviewer'] = 'bounded-BB-personal-followup-author; independent C closure pending'
decision['reviewedAt'] = '2026-10-10'
mapping['summary']['exactMappings'] = 30
mapping['summary']['partialMappings'] = 71
assert len(mapping['mappings']) == 179
assert sum(r.get('matchType') == 'exact' for r in mapping['mappings']) == 30
assert sum(r.get('matchType') == 'partial' for r in mapping['mappings']) == 149
source['pipelineStatus']['currentStep'] = ''
step = next(s for s in source['pipelineStatus']['steps'] if s['id'] == 'MAPPING-3')
step['status'] = 'complete'
for check in step['checks']:
    if check['id'] == 'm3-all-source-goals-covered-by-canonical':
        check['passed'] = True
        check['details'] = ('INERT proposed completed descriptor, activation conditional on actual independent C/A KEEP of the bounded additive Source21 union776partial+fabpartial and whole-existing-practice placements. '
                            'Current179 edges have30exact/149partial, current101 source-row classifications30exact/71partial. Other100 source rows retain the actual prior qualification. '
                            'Montan and Arbeitsdirektor are conscious whole practice extensions, not BB original mandates; no whole101 re-review, human approval or M7 claim.')
source['boundedQualificationClosure']['newBBPersonal21PartialUnionPendingIndependentQualification'] = True
source['boundedQualificationClosure']['inertProposedMAPPING3CompleteConditionalOnActualIndependentCAClosure'] = True

source_active = 'curricula/DE/Gymnasium/input/BB/upper-secondary/source-extraction/DE_BB_WIRTSCHAFT_SEKII_GOST_2022.source-extraction.json'
mapping_active = 'curricula/DE/Gymnasium/mapping/DE-BB/upper-secondary/bb_wirtschaft_upper_secondary_source_extraction_to_canonical_wirtschaft.review.json'
source_out = OUT / 'candidates' / source_active
mapping_out = OUT / 'candidates' / mapping_active
write(source_out, source)
write(mapping_out, mapping)

view_input = BASE / 'candidate-views/de-bb-gym-economics-lk.view.json'
view = read(view_input)
view_before = copy.deepcopy(view)
view['rootNodes'].append({
    'kind': 'structure', 'id': 'bb-lk-selected-personal-and-retained-whole-montan-practice-contract',
    'label': 'Gewählter Personalbereich und weitergeführte vollständige Mitbestimmungspraxis',
    'children': [
        {'kind': 'goalEntry', 'goalId': FAB, 'projectionRole': 'target',
         'displayLabel': 'Unternehmensmitbestimmung: gewöhnliche Regeln und bewusst ergänzter Montanvergleich'},
        {'kind': 'goalEntry', 'goalId': DIRECTOR, 'projectionRole': 'target',
         'displayLabel': 'Bewusst weitergeführte Montanpraxis: Arbeitsdirektor fallbezogen einordnen'},
    ],
})
view_active = 'curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-lk.view.json'
view_out = OUT / 'candidates' / view_active
write(view_out, view)
core = read(BASE / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
by = {g['id']: g for g in core['goals']}
write(OUT / 'bound-inputs/four-whole-unchanged-existing-contracts.EXACT.json', [by[g] for g in [WORKS, FAB, DIRECTOR, PRACTICE]])
write(OUT / 'actual-three-bounded-whole-before-after-deltas.AUTHOR-INERT.json', {
    'sourceAtomSource21Unchanged': next(r for r in source['sourceGoals'] if r['id'] == SID),
    'sourceParentUnchanged': next(r for r in source['passages'] if r['id'] == 'bb-wirtschaft-sekii:q-lk-personal'),
    'mappingEdgeAdded': new_edge, 'decisionBefore': old_decision, 'decisionAfter': decision,
    'summaryBefore': mapping_before['summary'], 'summaryAfter': mapping['summary'],
    'actualEdgeCountsBefore': {'all': 178, 'exact': 30, 'partial': 148},
    'actualEdgeCountsAfter': {'all': 179, 'exact': 30, 'partial': 149},
    'sourceQualityReviewMovedWholeObjectExact': {'beforeField': 'boundedAuthorOpenOriginalCoverage',
        'afterField': 'historicalAuthorOpenOriginalCoverage', 'wholeHistoricalObject': old_open},
    'sourceOtherGoalsAndPassagesExact': source['sourceGoals'] == source_before['sourceGoals'] and source['passages'] == source_before['passages'],
    'other100MappingDecisionsExact': [r for r in mapping['decisions'] if r['sourceGoalId'] != SID] == [r for r in mapping_before['decisions'] if r['sourceGoalId'] != SID],
    'all178PreexistingEdgesExactInOrder': mapping['mappings'][:-1] == mapping_before['mappings'],
    'sourceBeforeWhole': source_before, 'sourceAfterWhole': source,
    'viewBeforeWhole': view_before, 'viewAfterWhole': view,
    'placementRationales': [
        {'goalId': FAB, 'course': 'LK', 'role': 'target', 'originalSourceRole': 'Selected wahlobligatorische Personal21 has an ordinary MitbestG aspect, mapped partial.',
         'wholeGoalExtensionRole': 'Montan comparison is an explicit whole-contract didactic extension, already assessed in unchanged target81d; no source mandate.', 'GKNewRole': None},
        {'goalId': DIRECTOR, 'course': 'LK', 'role': 'target', 'originalSourceRole': None,
         'wholeGoalExtensionRole': 'Unchanged full target81d actually assesses appointment/revocation and equal executive role; maintain its complete performance as an authored practice target.', 'Source21Mapping': None, 'GKNewRole': None},
    ],
    'humanApproval': False, 'scientificSelfApproval': False, 'M6M7Claim': False,
})
source_pairs = read(BASE / 'actual-final-source-fieldwise-pairs-and-consumed-BW-v2.INERT.json')['pairs']
source_overlays = {source_active: source_out, mapping_active: mapping_out}
final_pairs = []
for row in source_pairs:
    final_pairs.append({'activePath': row['activePath'], 'candidatePath': rel(source_overlays.get(row['activePath'], ROOT / row['candidatePath']))})
assert len(final_pairs) == 32
views = sorted((BASE / 'candidate-views').glob('*.view.json'))
write(OUT / 'actual-final32-reuse-and35-view-rest-guards.AUTHOR-INERT.json', {
    'pairs': final_pairs, 'boundedOverwritePairs': [
        {'activePath': source_active, 'candidatePath': rel(source_out), 'authorInput': binding(source_input), 'inputHistory': history(source_input)},
        {'activePath': mapping_active, 'candidatePath': rel(mapping_out), 'authorInput': binding(mapping_input), 'inputHistory': history(mapping_input)},
        {'activePath': view_active, 'candidatePath': rel(view_out), 'authorInput': binding(view_input), 'inputHistory': history(view_input)},
    ],
    'final32InputGuards': [binding(ROOT / r['candidatePath']) for r in source_pairs],
    'unchangedOther30SourceMappingCandidates': [binding(ROOT / r['candidatePath']) for r in source_pairs if r['activePath'] not in source_overlays],
    'whole35ViewInputGuards': [binding(p) for p in views],
    'unchangedOther34Views': [binding(p) for p in views if p.name != view_input.name],
    'BBGKEntireViewExact': binding(BASE / 'candidate-views/de-bb-gym-economics-gk.view.json'),
    'rootReadyFilesNeverOverwritten': [binding(source_input), binding(mapping_input)],
    'immutableMainSeal': binding(BASE / 'SEALED-common689-343-final72-source-scope-native-A-M-root-handoff.INERT.json'),
    'unchangedCore689': binding(BASE / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'),
    'unchangedSEM689': binding(BASE / 'semantic689.candidate-bound.INERT.json'),
    'SourceRowSummaryIsNotWholeNormativeGoalCoverage': True,
})
print(json.dumps({'sourcePairOverlays': 2, 'viewOverlays': 1, 'currentSourceRows': 101, 'mappedEdges': 179,
                  'exactSourceRows': 30, 'partialSourceRows': 71, 'scientificSelfApproval': False}))
