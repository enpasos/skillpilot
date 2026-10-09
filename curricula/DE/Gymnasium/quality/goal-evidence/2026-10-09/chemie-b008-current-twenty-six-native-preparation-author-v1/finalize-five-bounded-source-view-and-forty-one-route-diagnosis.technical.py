# SPDX-License-Identifier: Apache-2.0
"""First-seal five actual author remedies and exact route diagnostics; no approvals."""
from datetime import datetime, timezone
from pathlib import Path
import hashlib
import importlib.util
import json

ROOT = Path.cwd()
OWN = Path(__file__).resolve().parent
OUT = OWN / 'source-view-remediation-author-v2'
DIAG = OWN / 'source-union-diagnosis-after-reviewedSL'

def read(path): return json.loads(path.read_text())
def bind(path):
    assert not path.is_symlink(), path
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
def write(path, value):
    assert path.is_relative_to(OWN)
    assert not path.exists(), path
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)

assert not (OUT / 'five-bounded-source-view-remediation.first.freeze.json').exists()
pair_path = OWN.parent / 'chemie-b008-partner-preserving-views-pairing-root-v1/thirty-five-whole-source-view-occurrences.independent-first-pairing.actual.json'
pair = read(pair_path)
assert bind(pair_path)['sha256'] == '9f5a7d8544a3eb4711decb0662b9b34a5637466f5b3f30b7c78622fb3c42ddb0'
for declaration in pair['independentWholeFirstVerdicts'] + pair['independentFirstSeals']:
    actual = bind(ROOT / declaration['path'])
    assert actual['sha256'] == declaration['sha256'].removeprefix('sha256:')
    assert actual['bytes'] == declaration['bytes']
proof_path = OUT / 'five-bounded-view-source-remediation.actual-normal-proof.json'
proof = read(proof_path)
assert proof['genuineFirstBoundedRemovalCandidatesReused'] == 9
assert proof['newPrecisePendingAuthorRemedies'] == 5
assert proof['actualRemainingSourceOperatorOrCourseHolds'] == 21
original_path = OWN / 'source-view-author/original35-opaque-entries-whole-source-operator-partner-v2-normal-facets.neutral-input.json'
original = read(original_path)
fixes_path = OUT / 'five-current-original-source-role-corrections-and-partners.author-candidate.json'
fixes = read(fixes_path)
selected = {6, 10, 24, 29, 30}
held = pair['pairedHeldProposedRemovals'] + pair['retainedOriginalHolds']
assert len(held) == 26
plan = []
for index in sorted(held):
    whole = original['entries'][index]
    record = next(row for row in pair['records'] if row['entryIndex'] == index)
    plan.append({'entryIndex': index, 'viewId': whole['viewId'], 'wholeScope': whole['wholeScope'],
                 'wholeOriginalFamily': whole['wholeCanonicalFamily'],
                 'wholeOriginalDutiesAndAllPartners': whole['wholeOriginalSourceDutiesAndPartnerContexts'],
                 'genuinePairedFirstFinding': record,
                 'newAuthorCandidateExists': index in selected,
                 'currentSourceOperatorCourseAndNativeReviewStatus': 'pending_targeted_independent_current_review' if index in selected else 'HOLD_concrete_source_operator_course_or_companion_work_still_required',
                 'scientificApproval': False})
plan_path = OUT / 'actual-paired-twenty-six-held-node-whole-operator-remediation-plan.json'
write(plan_path, {'schemaVersion': 1, 'actualPairedFirstResults': bind(pair_path), 'originalWholeInput': bind(original_path),
                 'wholeHeldNodes': plan, 'currentPairedHeldNodeCount': 26, 'newPreciselyAuthoredRemedyCount': 5,
                 'remainingNotRemediedNodeCount': 21, 'sixActualFirstDissentsStillUnresolved': pair['sixUnresolvedFirstDissentOccurrences'],
                 'previousBOnly22PlanIsNotCurrentOperativeAuthority': True,
                 'oldPrimaryDutiesAndAllPartnersPreserved': True, 'wholeSourceApproval': False, 'strictGain': 0})
primary_path = OUT / 'actual-eight-whole-primary-pages-and-two-column-author-reading.input.json'
primary = read(primary_path)
portable_primary = {'schemaVersion': 1, 'wholeOriginalPDFAndWholePrimaryPageInputs': primary['wholePrimaryInputs'],
                    'sourceDownloadBytesRemainOriginalSnapshotOrRetainedCacheInputs': True,
                    'actualColumnRasterInspectionsAsOptionalLocalDerivatives': [
                        {'sha256': item['sha256'], 'bytes': item['bytes'], 'requiredPortableInput': False,
                         'notAnIndependentReview': True} for item in primary['actualTHColumnRasterAuthorViews']],
                    'fullAuthorColumnInterpretationIsSeparateFromRawPrimaryPageText': True,
                    'allSourceOperatorAndNativeReviewsStillPending': True}
portable_primary_path = OUT / 'whole-eight-original-primary-pages.portable-neutral-input.json'
write(portable_primary_path, portable_primary)
old_views = sorted((OUT / 'whole-view-candidates').glob('*.json'))
write(OUT / 'first-local-document-resolution-attempts.actual-technical-history.json', {
    'schemaVersion': 1, 'firstAttempt': {'status': 'INTERRUPTED_LOCAL_TECHNICAL_HELPER', 'execSessionId': 52845,
                                       'generatedWholeViewDrafts': [bind(p) for p in old_views],
                                       'draftSelectionUsedOnlyBFirstBeforeFullPairArrived': True,
                                       'draftsAreNotCurrentReviewInputs': True},
    'secondAttempt': {'status': 'INTERRUPTED_LOCAL_TECHNICAL_HELPER', 'execSessionId': 67181,
                     'sixteenWholeViewsReachedActualNormalCheck': True},
    'concreteLocalHelperCorrection': 'Source-document resolver had checked only sourceDocumentKey; selected TH goals carry their document key in sourceDocument tags. Final helper uses unchanged ordinary resolution from keys/tags/passage, then unchanged sourceAtlasFacet.',
    'firstAttemptScriptBytesWereNotSeparatelyCaptured': True,
    'finalActualExecExitCode': 0, 'ordinaryCompilerOrValidatorChanged': False,
    'failedPartialArtifactsPreserved': True, 'sourceApproval': False})

entry_path = OUT / 'neutral-five-bounded-current-source-course-view-remedies.author.entry.json'
write(entry_path, {'schemaVersion': 1,
                  'role': 'Neutral bounded current source/partner/course/view author remedies for fresh targeted independent review; all current whole-union and native boundaries remain open',
                  'actualCurrentCanonicalCount': 480, 'actualCurrentCurricularAtomicCount': 378,
                  'inactiveCanonicalCount': 504, 'inactiveCurricularAtomicCount': 395,
                  'wholeOriginal35Occurrence106DutyAndPartnerInput': bind(original_path),
                  'actualPairedIndependentFirstResults': bind(pair_path),
                  'newWholePrimaryPageInputs': bind(portable_primary_path),
                  'newFiveSourcePartnerAndCourseCandidates': bind(fixes_path),
                  'candidateCanonical': fixes['candidateCanonical'],
                  'onlyTwoCanonicalApplicabilityFieldDeltas': fixes['onlyTwoCanonicalFieldDeltas'],
                  'allGoalDEENRequiresContainsAndImageBytesUnchanged': True,
                  'threeSourcePartnerCorrections': [{'sourceGoalId': row['newBoundedSourceRole']['sourceGoalId'],
                                                    'newPartnerGoalId': row['newBoundedSourceRole']['newPartnerGoalId'],
                                                    'wholeCurrentOriginalDutyAndAllPartners': row['wholeCurrentOriginalDutyAndAllPartners']} for row in fixes['partnerCorrections']],
                  'threeNewMappingCandidates': fixes['mappingCandidateBindings'],
                  'twoTHSourceCourseCorrections': fixes['THCourseDeltas'],
                  'THWholeSourceExtraction': bind(OUT / 'TH-upper-primary-column-faithful-two-course-roles.source-extraction.author-candidate.json'),
                  'THUnchangedWholeMappingWithNewSourcePointer': bind(OUT / 'TH-upper-unchanged-all-decisions-new-source-course-pointer.mapping.author-candidate.json'),
                  'sixteenWholeViewCandidates': [row['candidateView'] for row in proof['views']],
                  'normalCompilerAndSourceFacetProof': bind(proof_path),
                  'actualPaired26HeldNodePlan': bind(plan_path),
                  'genuinePairedFirstBoundedRemovalsPreserved': pair['pairedBoundedRemovalCandidates'],
                  'newFiveRemediesStillRequireIndependentCurrentSourceOperatorCourseAndNativeReviews': True,
                  'actualRemainingCandidateOpaqueReferences': 21,
                  'all26PairedSourceHoldsRemainUnapprovedUntilGenuineFollowups': True,
                  'existingMVMetalModelWasAlreadyTargetOnlyNewExplicitSourceEdgeProposed': True,
                  'exactNewTargetGoalIds': ['f4d5a02d-711b-5a6b-a41d-971359c1f64d', '2fdd759f-8349-5f7e-b29a-6ac7fb0299f9'],
                  'specificSNExistingENFidelityRequiresTargetedCurrentReview': True,
                  'noOriginalDutyPartnerOrSourceTextDropped': True,
                  'noOrdinaryCompilerOrGateChanges': True,
                  'newMappingReviewersAndDatesRemainNull': True,
                  'actualPhysicalExperimentPerformanceCertified': False,
                  'wholeSourceUnionOrNationalCourseApproval': False,
                  'nativeDPReviewPending': True, 'newScientificClosures': 0, 'restoredBindings': 0,
                  'netStrictGain': 0, 'activeWrites': [], 'humanApproval': False, 'humanTrial': False})

spec = importlib.util.spec_from_file_location('ordinary_schema_validator', ROOT / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec); spec.loader.exec_module(validator)
schema = read(ROOT / 'docs/landscape-runtime.schema.json')
selected_paths = list((OUT / 'whole-view-candidates-paired-first').glob('*.json'))
selected_paths += list((OUT / 'partner-mappings').glob('*.json'))
selected_paths += [p for p in OUT.glob('*.json') if p.name != 'first-local-document-resolution-attempts.actual-technical-history.json']
selected_paths += list(DIAG.glob('*.json'))
errors = [str(p.relative_to(ROOT)) for p in selected_paths if not validator.validate_file(str(p.relative_to(ROOT)), schema)]
assert not errors, errors
check_path = OUT / 'current-selected-ordinary-targeted-schema-and-portable-bindings.actual.json'
write(check_path, {'schemaVersion': 1, 'normalValidatorAPI': 'scripts/validate_schemas.py:validate_file',
                   'actualSelectedFileCount': len(selected_paths), 'actualSelectedPaths': [str(p.relative_to(ROOT)) for p in selected_paths],
                   'errors': [], 'noValidatorOrIgnoreChanges': True,
                   'allSelectedWholeViewCandidateBytesExist': all((ROOT / row['candidateView']['path']).is_file() for row in proof['views']),
                   'noSymlinkInputs': all(not p.is_symlink() for p in selected_paths),
                   'localRasterDerivativesExplicitlyNotRequiredPortableInputs': True,
                   'fullOriginalPDFDownloadsBoundToOriginalHashes': True,
                   'schemaPassIsNotSourceOperatorApproval': True, 'activeWrites': []})
freeze_paths = selected_paths + [check_path, Path(__file__), OWN / 'check-five-bounded-view-source-remediation-v2.technical.mts',
                                 OWN / 'prepare-bounded-view-source-remediation-v2.technical.py']
freeze_path = OUT / 'five-bounded-source-view-remediation.first.freeze.json'
write(freeze_path, {'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
                    'role': 'First immutable actual new author remedy outputs and ordinary technical checks, no independent approval',
                    'files': [bind(p) for p in sorted(set(freeze_paths))],
                    'neutralEntry': bind(entry_path), 'newScientificClosures': 0, 'restoredBindings': 0, 'strictGain': 0,
                    'activeWrites': [], 'humanApproval': False})
diag_entry_path = DIAG / 'neutral-current354-of395-exact-source-routes-diagnosis.entry.json'
diag_report_path = DIAG / 'actual-forty-one-missing-current-source-routes.neutral-diagnosis.json'
diag = read(diag_report_path)
write(diag_entry_path, {'schemaVersion': 1, 'role': 'Exact route diagnosis of genuine ordinary atlas failure; no expected-count relaxation or source approval',
                      'report': bind(diag_report_path), 'actualSourceSupportedCount': 354, 'unchangedExpectedCount': 395,
                      'noMappedRouteCount': diag['missingUnmappedCount'], 'mappedUnresolvedCourseCount': diag['missingMappedCount'],
                      'missingProspectiveRoutineCount': diag['missingRoutine26Count'],
                      'currentProspectiveRoutineBoundariesMustNotBeInferredFromGenericParentMappings': True,
                      'wholeSourceClosure': False, 'strictGain': 0, 'activeWrites': []})
diag_freeze_path = DIAG / 'current-source-union-diagnosis.first.freeze.json'
write(diag_freeze_path, {'schemaVersion': 1, 'sealedAt': datetime.now(timezone.utc).isoformat(),
                        'files': [bind(diag_report_path), bind(diag_entry_path), bind(OWN / 'diagnose-current395-source-union-after-reviewedSL.technical.mts')],
                        'noNewSourceReview': True, 'gateExpectedCountUnchanged': 395, 'activeWrites': []})
print(json.dumps({'fiveRemedyEntry': bind(entry_path), 'fiveRemedyFirstSeal': bind(freeze_path),
                  'routeDiagnosisEntry': bind(diag_entry_path), 'routeDiagnosisFirstSeal': bind(diag_freeze_path),
                  'normalSchemaFileCount': len(selected_paths), 'genuineCommonFirstRemovals': 9,
                  'newAuthorRemedies': 5, 'actualRemainingCandidateOpaqueHolds': 21, 'all26PairedSourceHoldsStillUnapproved': True,
                  'strictGain': 0, 'activeWrites': 0}, ensure_ascii=False))
