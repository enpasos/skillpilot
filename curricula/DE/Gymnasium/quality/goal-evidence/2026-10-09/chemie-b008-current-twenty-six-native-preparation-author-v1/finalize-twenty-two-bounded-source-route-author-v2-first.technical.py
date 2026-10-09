# SPDX-License-Identifier: Apache-2.0
"""Freeze finite ordinary source-route candidates and whole source/partner inputs."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'twenty-two-bounded-source-routes-author-v2'
DAY = OWN.parent

def read(p): return json.loads(p.read_text())
def bind(p):
    assert not p.is_symlink(), p
    raw = p.read_bytes()
    return {'path': str(p.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(name, value):
    p = OUT / name
    assert not p.exists(), p
    p.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(p)

assert not (OUT / 'twenty-two-bounded-source-routes-author.first.freeze.json').exists()
input_path = OUT / 'whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json'
whole = read(input_path)
frame_path = OWN / 'input/current-whole-source-partner-atomicity-memory-frame.neutral.json'
frame = read(frame_path)
current_path = ROOT / frame['currentChemistryCanonicalBinding']['path']
future_path = ROOT / frame['futureWhole504CanonicalBinding']['path']
assert bind(current_path)['sha256'] == frame['currentChemistryCanonicalBinding']['sha256'].removeprefix('sha256:')
assert bind(future_path)['sha256'] == frame['futureWhole504CanonicalBinding']['sha256'].removeprefix('sha256:')
current, future = read(current_path), read(future_path)
current_goals = {g['id']: g for g in current['goals']}
future_goals = {g['id']: g for g in future['goals']}
partner_ids = sorted({g for row in whole['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges']
                      for g in row['wholeOriginalDecision']['canonicalGoalIds']})
current_selected_partner_ids = list(partner_ids)
assert len(current_selected_partner_ids) == 17
previous_whole = read(OWN / 'twenty-two-bounded-source-routes-author-v1/whole-twenty-two-source-route-operator-scope-and-partner.neutral-input.json')
partner_ids = sorted(set(partner_ids) | {g for row in previous_whole['wholeOriginalClausesPassagesDecisionsAndAllPartnerEdges'] for g in row['wholeOriginalDecision']['canonicalGoalIds']})
assert len(partner_ids) == 18
partners = write('all-eighteen-whole-original-current-and-prospective-partners.neutral-input.json', {
 'schemaVersion': 1, 'currentCanonicalBinding': bind(current_path), 'prospectiveCanonicalBinding': bind(future_path),
 'currentSelectedSourceClausePartnerGoalIds': current_selected_partner_ids,
 'historicalSymbolLanguagePartnersRetainedAsAdditionalContext': sorted(set(partner_ids) - set(current_selected_partner_ids)),
 'partners': [{'goalId': goal_id, 'wholeActualCurrentGoal': current_goals[goal_id],
               'wholeInactiveProspectiveGoal': future_goals[goal_id],
               'valueExactCurrentAgainstProspective': current_goals[goal_id] == future_goals[goal_id],
               'semanticOrContextDeltaIsNotAutomaticallyApproved': current_goals[goal_id] != future_goals[goal_id]}
              for goal_id in partner_ids],
 'originalWholePartnerSourceObligationsAndEdges': bind(input_path), 'wholeSourceUnionStillHOLD': True,
 'activeWrites': [], 'humanApproval': False})
original_input_bindings = []
for row in frame['wholeCurrent32SourceMappingExtractionBindings']:
    for key in ['mapping', 'extraction']:
        actual = bind(ROOT / row[key]['path'])
        assert actual['sha256'] == row[key]['sha256'].removeprefix('sha256:') and actual['bytes'] == row[key]['bytes']
        original_input_bindings.append(actual)
report_path = OUT / 'actual-twenty-two-pending-routes.ordinary-facets-and-real-atlas-HOLD.json'
report = read(report_path)
assert report['wholeSelectedRoutineGoalCount'] == 22 and report['prospectiveScopeResolvedCandidateGoalCount'] == 21
assert report['actualOrdinaryCompilerTerminal']['exitCode'] == 1
assert report['actualOrdinaryCompilerTerminal']['failure'].startswith('Missing reviewed mapping decision metadata: ')
assert report['unresolvedCandidateGoalIds'] == ['e5a5dcd8-053c-55fd-b5c7-bba93779da53']
assert len(whole['elevenMissingAdditionalOutside26GoalIds']) == 11 and len(whole['eightCurrentMappedBcPCourseHoldGoalIds']) == 8
extraction_path = OUT / 'BY-twenty-two-whole-clause-bounded-routes.source-extraction.author-candidate.json'
mapping_path = OUT / 'BY-twenty-two-partial-source-routes.ordinary-mapping.author-candidate.json'
config_path = OUT / 'whole395-with-reviewedSL-and-twenty-two-pending-routes.ordinary-inputs.author-candidate.json'
spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec); spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
paths = sorted(OUT.glob('*.json'))
assert all(validator.validate_file(str(p.relative_to(ROOT)), schema) for p in paths)
schema_proof = write('ordinary-selected-twenty-two-JSON-and-current-binding-check.actual.json', {
 'schemaVersion': 1, 'normalAPI': 'scripts/validate_schemas.py:validate_file', 'actualFileCount': len(paths),
 'paths': [str(p.relative_to(ROOT)) for p in paths], 'errors': [],
 'qualityEvidenceFilesJSONCheckedUnderExistingDiscoveryContract': True, 'notAClaimOfDedicatedSourceExtractionSchemaValidation': True,
 'original32CompleteMappingExtractionInputsExact': original_input_bindings,
 'allWholeCanonicalInputsExact': [bind(current_path), bind(future_path)],
 'normalSourceAtlasActuallyRejectsUnreviewedMetadata': True, 'newUnapprovedSourceDataNeverMadeAuthoritative': True,
 'activeWrites': [], 'noNewValidatorOrGate': True})
delta = read(OUT / 'actual-one-C9-nonNTG-whole-clause-remediation-and-original-preservation.json')
assert delta['shared48SourceGoalsAndDecisionsExact'] and delta['correctedOccurrenceSourceGoalId'] == 'd79d7aa5-4c6d-5734-98ae-b932fa93dca8'
entry = write('neutral-twenty-two-whole-bounded-source-routes.author-independent-review.entry.json', {
 'schemaVersion': 1, 'role': 'Whole exact original clauses and scope-specific ordinary partial source routes for fresh independent operative source/partner review',
 'whole22SourceRoleAndPartnerInput': bind(input_path), 'whole18CurrentAndProspectivePartnerBodies': partners,
 'actualSelectedSource49ClausesPartnerGoalCount': 17,
 'allOriginal18PartnerBodiesRetainedIncludingHistoricalSymbolLanguageContext': True,
 'exactOneClauseRemediationFromImmutableV1': bind(OUT / 'actual-one-C9-nonNTG-whole-clause-remediation-and-original-preservation.json'),
 'newOrdinarySourceExtraction': bind(extraction_path), 'newOrdinaryMapping': bind(mapping_path), 'ordinaryProspectiveAtlasConfig': bind(config_path),
 'ordinarySourceFacetsAndActualCompilerHOLD': bind(report_path), 'ordinaryJSONAndUnchangedCurrentBindings': schema_proof,
 'exactCurrentGoalScope': {'currentCanonicalNodes': 480, 'currentCurricularAtoms': 378, 'inactiveProspectiveNodes': 504, 'inactiveProspectiveAtoms': 395},
 'exactSelected22GoalIds': whole['exact22GoalIds'], 'A008ExplicitlyInsideSelected26And19P': True,
 'existingPairedBoundedRoleGoalCount': 17, 'newLowerFiveAuthorRoleGoalCount': 5,
 'scopeResolvedButUnapprovedOrdinaryCandidateGoalCount': 21, 'C11CourseOnlyActualUnspecifiedHoldGoalId': 'e5a5dcd8-053c-55fd-b5c7-bba93779da53',
 'all49WholeClauseRecordsAnd59PartialEdgesNeedActualCurrentOperativeReviewMetadata': True,
 'newReviewerFieldsNull': True, 'newReviewedAtFieldsNull': True,
 'boundedBY12GARolesNeverPromotedToEA13Union': True, 'actualGuidanceAutonomyTrackYearAndPhysicalOperatorsRemainWhole': True,
 'allOriginal332BYRowsAnd418EdgesAndWhole65SLAndAllOtherMappingInputsUnchanged': True,
 'elevenMissingOutside26ContentGoalIds': whole['elevenMissingAdditionalOutside26GoalIds'],
 'eightUnresolvedCurrentBcPCourseGoalIds': whole['eightCurrentMappedBcPCourseHoldGoalIds'],
 'SL2026CurrentAdditionalPDF403SeparateHOLD': True, 'normalExpected395AndUnresolved496Unchanged': True,
 'hypotheticalUnapprovedScopeUnionIsNotAnAtlasApproval': True,
 'nativeD_P_A_M_VAndEightProtectedContextReviewsStillSeparate': True,
 'activeWrites': [], 'netStrictGain': 0, 'newScientificClosures': 0, 'restoredBindings': 0,
 'actualLearnerPerformance': False, 'realExperimentApproval': False, 'humanApproval': False, 'humanTrial': False})
files = list(OUT.glob('*.json')) + [Path(__file__), OWN / 'materialize-twenty-two-bounded-source-routes.author-v2.py',
                                     OWN / 'check-twenty-two-pending-routes.ordinary-source-API-v2.technical.mts',
                                     OWN / 'prove-one-C9-source-clause-successor.author-v2.py']
seal = write('twenty-two-bounded-source-routes-author.first.freeze.json', {
 'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(), 'role': 'First immutable complete author candidate and actual ordinary metadata HOLD; no scientific or native approvals',
 'files': [bind(p) for p in sorted(set(files))], 'neutralEntry': entry, 'currentBindingsRemainExact': True,
 'activeWrites': [], 'netStrictGain': 0, 'humanApproval': False})
print(json.dumps({'neutralEntry': entry, 'firstSeal': seal, 'wholeClauses': 49, 'partialEdges': 59,
 'allWholePartners': len(partner_ids), 'sourceRoleGoalCount': 22, 'actualOrdinaryCompilerExitCode': 1,
 'metadataHold': True, 'C11CourseHold': True, 'genericJSONFileCount': len(paths), 'netStrictGain': 0}))
