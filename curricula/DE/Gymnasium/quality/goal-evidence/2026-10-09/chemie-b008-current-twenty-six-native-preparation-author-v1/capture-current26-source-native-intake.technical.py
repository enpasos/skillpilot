# SPDX-License-Identifier: Apache-2.0
"""Capture whole unchanged Chemistry26 inputs and concrete ordinary-pipeline holds."""
import copy
import hashlib
import importlib.util
import json
from pathlib import Path

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
DAY = OWN.parent
PREVIOUS = DAY.parent / '2026-10-08'


def read(path):
    return json.loads(path.read_text())


def bind(path):
    data = path.read_bytes()
    return {'path': path.relative_to(ROOT).as_posix(),
            'sha256': 'sha256:' + hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def exact(binding):
    actual = bind(ROOT / binding['path'])
    assert actual['sha256'] == 'sha256:' + binding['sha256'].removeprefix('sha256:'), binding['path']
    if 'bytes' in binding:
        assert actual['bytes'] == binding['bytes'], binding['path']


def value_digest(value):
    return hashlib.sha256(json.dumps(value, ensure_ascii=False, sort_keys=True,
                                    separators=(',', ':')).encode()).hexdigest()


def write(path, value):
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


visual_path = DAY / 'chemie-b008-twenty-six-current-visual-pairing-technical-v1/all26-actual-role-pairing.current-inactive.v2.json'
visual = read(visual_path)
science_path = ROOT / visual['wholeScientificInputs']['path']
exact(visual['wholeScientificInputs'])
science = read(science_path)
canonical_path = ROOT / visual['wholeCanonicalInput']['path']
exact(visual['wholeCanonicalInput'])
candidate = read(canonical_path)
active_path = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
active = read(active_path)
active_by = {goal['id']: goal for goal in active['goals']}
candidate_by = {goal['id']: goal for goal in candidate['goals']}
assert len(active_by) == 480 and len(candidate_by) == 504
assert len(science['routineBodies']) == len(visual['rows']) == 26
assert sum(len(row['wholeTwoCases']) for row in science['routineBodies']) == 52
assert all(row['pairedCurrentRoleStatus'] == 'PAIRED_KEEP' for row in visual['rows'])
visual_by = {row['goalId']: row for row in visual['rows']}
resource_candidate = copy.deepcopy(candidate)
image_bindings = []
for row in science['routineBodies']:
    goal = row['wholeGoal']
    gid = goal['id']
    assert goal == candidate_by[gid], gid
    image = visual_by[gid]
    for binding in [image['actualSelectedRaster'], *image['actualPromptBindings'],
                    image['independentA']['verdictFile'], image['independentB']['verdictFile']]:
        exact(binding)
    assert image['wholeScientificGoalCanonicalSha256'] == value_digest(goal), gid
    assert image['wholeProfileCanonicalSha256'] == value_digest(row['wholeProfile']), gid
    assert image['wholeTwoCasesCanonicalSha256'] == value_digest(row['wholeTwoCases']), gid
    link = image['selectedResourceLink']
    assert link['skillpilotId'] == gid and link['type'] == 'goal-visualization'
    next_goal = next(value for value in resource_candidate['goals'] if value['id'] == gid)
    next_goal['resourceLinks'] = [copy.deepcopy(link)]
    image_bindings.append({'goalId': gid, 'actualRaster': bind(ROOT / image['actualSelectedRaster']['path']),
                           'selectedResourceLink': link, 'pairedImageRoleAlreadyRead': True,
                           'nativePageAndContextReviewPending': True})
source12_path = DAY / 'chemie-b008-by12-ga-twelve-boundary-source-author-v1/twelve-bounded-BY12-GA-source-roles.author-candidate.json'
source12 = read(source12_path)
pair_path = DAY / 'chemie-b008-by12-ga-twelve-boundary-source-pairing-root-v1/twelve-boundary-source.technical-pairing.json'
pair = read(pair_path)
file_bindings = pair['technicalBindingChecks']['fileBindings']
for binding in file_bindings:
    exact(binding)
assert len(source12['rows']) == 12 and len(source12['wholeSourceRows']) == 21
assert pair['scopedPartialComponents'] == 23 and pair['originalPartnerEdgesUnchanged'] == 36
source_whole = []
for row in source12['wholeSourceRows']:
    resolved = {}
    for key in ['wholeOriginalSourceGoal', 'wholeOriginalPassage', 'wholeOriginalDecision']:
        pointer = row[key]
        exact(pointer['file'])
        value = read(ROOT / pointer['file']['path'])
        for part in pointer['jsonPointer'].strip('/').split('/'):
            value = value[int(part)] if isinstance(value, list) else value[part.replace('~1', '/').replace('~0', '~')]
        assert value_digest(value) == pointer['valueSha256']
        resolved[key] = value
    source_whole.append({**row, 'wholeResolvedValues': resolved})
v21_path = PREVIOUS / 'chemie-b008-sl-specific-source-continuation-author-root-20261008-v21/actual-native43-source-view-findings-three-SL-models-and-current177-contexts.json'
v21 = read(v21_path)
view_holds = [{'viewId': row['viewId'], 'scope': row['scope'],
               'view': row['afterViewBinding'], 'findings': row['actualAfterFindings']}
              for row in v21['actual43SourceViews'] if row['actualAfterCPV009']]
context_holds = [row for row in v21['all177ProtectedActualPageContextComparisons']
                 if not row['currentPageExcludingPaginationExact']]
assert len(view_holds) == 16 and sum(len(row['findings']) for row in view_holds) == 35
assert len(context_holds) == 8
old_deltas = [{'goalId': gid, 'changedFields': sorted(field for field in set(active_by[gid]) | set(candidate_by[gid])
               if active_by[gid].get(field) != candidate_by[gid].get(field))}
              for gid in active_by if active_by[gid] != candidate_by[gid]]
assert len(old_deltas) == 29
bindings = [bind(path) for path in [visual_path, science_path, canonical_path, active_path,
                                   source12_path, pair_path, v21_path]]
write(OWN / 'input/whole26-raw-profiles-and52-whole-cases.exact-neutral-input.json', science)
write(OWN / 'input/whole21-BY-source-duties36-edges79-occurrences.exact-neutral-input.json', {
    'schemaVersion': 1, 'role': 'Whole original source/partner dictionaries; no whole-source closure',
    'rows': source_whole, 'originalWholeSourceRows': 21, 'originalPartnerEdges': 36,
    'originalPartnerSemanticDuties': 16, 'originalSourceOccurrences': 79,
    'boundedAcceptedComponents': 23, 'wholeSource19Status': 'HOLD', 'activeWrites': [], 'strictGain': 0,
})
write(OWN / 'candidate/canonical504-current26-resource-links.inactive.json', resource_candidate)
write(OWN / 'actual26-raster-and-source-body-bindings.technical.json', {
    'schemaVersion': 1, 'role': 'actual byte/value binding verification only; no science review',
    'inputBindings': bindings, 'imageRows': image_bindings, 'rawWholeProfileCount': 26,
    'rawWholeBilingualCases': 52, 'actualClosedPositiveUnderstandingV2RecordCount': 0,
    'pairedImageRoles': 26, 'rastersRetained': 25, 'justifiedCorrectedRasters': 1,
    'currentActiveCanonicalNodes': 480, 'currentActiveCurricularAtomicGoals': 378,
    'inactiveCandidateCanonicalNodes': 504, 'inactiveCandidateCurricularAtomicExpected': 395,
    'newCandidateGoalIds': sorted(candidate_by.keys() - active_by.keys()),
    'actualOldWholeGoalDeltas': old_deltas, 'currentStrictCompletedChemistry': 177,
    'source12WholeSourceClosure': False, 'nativeD_P_A_M_VFinalClosure': False,
    'activeWrites': [], 'humanApproval': False, 'humanTrial': False, 'netStrictGain': 0,
})
write(OWN / 'whole-current378-and-inactive395.concrete-gaps-and-compiler-plan.json', {
    'schemaVersion': 1, 'role': 'normal thin capsule/compiler plan with concrete unresolved gates',
    'existingSourceViewFindingsBinding': bind(v21_path), 'knownCurrentSourceAtlasReady': False,
    'sourceMetadataHold': {'sourceGoalId': 'sl-chem-seki-sl-ch-seki-8-2024-p013-004-e3b97259',
                           'normalError': 'Missing reviewed mapping decision metadata',
                           'action': 'Obtain a genuine corresponding whole source decision; never invent reviewer fields.'},
    'ordinaryProjectionHolds16Views35Findings': view_holds,
    'protected177CurrentContextHolds8': context_holds,
    'mandatoryScopeBoundary': 'Ordinary compiler derives stage/course from sourceGoal/passages/documents/extraction and expands canonicalGoalIds. Scoped component author metadata does not restrict deduplicated GA/EA12/13 rows. No append or subtree expansion without genuine occurrence-specific source/placement review.',
    'whole52OriginalCasesAnd26RawProfilesPreserved': True,
    'normalPRequired': {'rawHistoricalProfiles': 26, 'actualClosedV2Records': 0,
                        'source7NewWholeMaterialAuthorDirectory': (DAY / 'chemie-b008-source19-remaining-seven-whole-author-v1').relative_to(ROOT).as_posix(),
                        'other19WholeProfileAuthoringStatus': 'HOLD; raw bodies are not closed current v2 records',
                        'neverClaimSchemaOrHashConversionAsScienceReview': True},
    'thinCapsulePlannedPath': 'tmp/chemie-b008-current26-native-preparation-20261009-v1-capsule',
    'normalApis': ['loadGoalBookBuildInputs', 'buildGoalBookModel', 'compileCompositionView',
                   'buildGoalDescriptionRolloutSubsetModel', 'writeGoalBookHtml', 'writeGoalBookPdf',
                   'buildGoalBookReviewBundle', 'createGoalDescriptionReviewCampaignArtifacts',
                   'materializePositiveGoalEvidenceCandidates', 'reviewPositiveGoalEvidenceConfig'],
    'requiredActualComparisons': ['whole current378 before versus candidate395 with all177 strictIDs',
                                 'each of the8 known prerequisite/reverse-prerequisite context changes',
                                 'all16 currently invalid source views with exact original scope/course target sets',
                                 'all21 whole BY original duties,36 partner edges,79 occurrences before/after',
                                 'unchanged26 whole goaltexts/profiles/raw52 cases; additional supplements separately bound'],
    'copyPolicy': 'Needed current code/contracts/canonical/kinds/QA/mapping/extraction/media inputs only; no whole repository/history copies or curriculum symlinks. Ordinary generator outputs are independent regular files.',
    'allowedNativeClaim': 'Review-only candidate rendering may expose all26 current whole products; no national/source/ordinary course approval until genuine current source/placement and whole material bindings exist.',
    'remainingNativeD_P_A_MAndSourceStatus': 'HOLD/PENDING actual required independent reviews',
    'imagePolicy': 'Reuse25 good actual rasters and exactly1 already justified current PNG correction; no new generation or repeat of valid image-only review.',
    'activeWrites': [], 'runtimeCompilerOrGateChanges': False, 'humanApproval': False, 'strictGain': 0,
})
module_spec = importlib.util.spec_from_file_location('regular_schema_validator', ROOT / 'scripts/validate_schemas.py')
module = importlib.util.module_from_spec(module_spec)
module_spec.loader.exec_module(module)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
paths = sorted(OWN.rglob('*.json'))
assert all(module.validate_file(path.relative_to(ROOT).as_posix(), schema) for path in paths)
assert bind(active_path) == next(binding for binding in bindings if binding['path'] == active_path.relative_to(ROOT).as_posix())
print(json.dumps({'regularOwnJsonChecks': len(paths), 'currentChemistry': '177/378',
                  'inactiveWholeGoals': 504, 'rawWhole26Profiles52Cases': True,
                  'actualImageRolePairs': 26, 'sourceAtlas': 'HOLD', 'strictGain': 0}))
