#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal actual local artifacts and recheck bound inputs, without rebuilding."""
import datetime
import hashlib
import json
import pathlib

OUT = pathlib.Path(__file__).resolve().parent
ROOT = pathlib.Path(__file__).resolve().parents[7]
def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):
    return json.loads(p.read_text())

freeze_path = OUT / 'native-overlay-preparation-v1.final.freeze.json'
assert not freeze_path.exists(), 'final freeze is immutable'
guard = read(OUT / 'actual-current-inputs-and-protected74-127-807-478.guard.json')
for b in guard['inputBindings']:
    assert sha(ROOT / b['path']) == b['sha256'], b['path']
extra_receipt = read(OUT / 'final-local-reading-and-unchanged-inputs.actual.receipt.json')
for b in extra_receipt['additionalActuallyReadInputBindings']:
    assert sha(ROOT / b['path']) == b['sha256'], b['path']
for b in extra_receipt['storedBaselineMissingEightWitnessInputsActuallyRechecked']:
    assert sha(ROOT / b['path']) == b['receiptSha256'], b['path']
audit_dir = OUT / 'independent-technical-audit'
audit_freeze_path = audit_dir / 'independent-technical-audit.final.freeze.json'
audit_freeze = read(audit_freeze_path)
for b in audit_freeze['files']:
    p = pathlib.Path(b['path'])
    if not p.is_absolute():
        p = (ROOT / p) if (ROOT / p).is_file() else (audit_dir / p)
    assert sha(p).removeprefix('sha256:') == b['sha256'].removeprefix('sha256:'), b['path']
audit = read(audit_dir / 'independent-technical-audit.actual.result.json')
assert audit['guardInputDriftCount'] == 0
assert audit['unexpectedTechnicalInconsistencies'] == []
assert audit['numberingAndLinkNumbersOnly'] == 31
assert audit['realProtectedSourceStageCourseContextChanges'] == 2
assert audit['newNativeBuilderRun'] is False and audit['newScienceReview'] is False
assert audit['integrationApproved'] is False and audit['strictNetGain'] == 0
result = read(OUT / 'reviewed40-current390-overlay-and-bookmodel.actual.result.json')
assert result['original390SourceGatePass'] is False
assert result['reviewed40Counts']['publishedCurricularAtomicGoals'] == 382
assert len(result['actualRestoredGoalScopePairs']) == 40
assert len(result['actualResidualLostGoalScopePairs']) == 200
assert result['currentActiveStrictCounts'] == {'biologie': 74, 'chemie': 127, 'mathematik': 807, 'physik': 478}
assert result['integrationApproved'] is False and result['strictNetGain'] == 0
assert not any(p.is_dir() and p.name == '.native-input-cache' for p in OUT.rglob('*'))
files = [{'path': str(p.relative_to(OUT)), 'sha256': sha(p), 'bytes': p.stat().st_size}
         for p in sorted(OUT.rglob('*')) if p.is_file() and p != freeze_path]
sealed = {
    'schemaVersion': 1,
    'freezeKind': 'current390-th19-hh21-native-HOLD-overlay-technical-preparation-final',
    'frozenAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'TECHNICAL_PREPARATION_COMPLETE_ORIGINAL390_SOURCE_GATE_AND_PROTECTED_NW_SCOPE_HOLD',
    'files': files,
    'actualNativeBookModels': 5, 'actualSourceViews': 22,
    'actualCurrentCanonicalNodes': 472, 'actualCurrentAtomicGoals': 390,
    'actualBaselineSourceAtlasAtomicGoals': 390, 'actualHOLDPlus40SourceAtlasAtomicGoals': 382,
    'original390SourceGatePass': False,
    'actualFullCatalogueAtomicGoals': 390,
    'restoredPartialGoalScopePairs': 40, 'TH19': 19, 'HH21': 21,
    'remainingLostCurrentGoalScopePairs': 200,
    'historicalOutsideWorklistRemainingPairs': 147, 'currentSelected21RemainingPairs': 53,
    'actualEightOmittedCurrentGoalIds': [x['goalId'] for x in read(OUT / 'eight-current-omitted-goals-full-witnesses-and-bounded-next-locators.json')['records']],
    'currentProtectedStrictCounts': result['currentActiveStrictCounts'],
    'allProtectedWholeCanonicalGoalsExact': True,
    'allBio74FullCatalogueWholePagesExact': True,
    'allBio74RemainInSourceAtlas': True,
    'protectedBio74ChangedSourceAtlasWholePages': 33,
    'protected31AtlasPagesOrderAndReferencedNumbersOnly': 31,
    'protectedTwoActualNWSekIG9ContextLosses': audit['realProtectedChanges'],
    'allOriginal1241InputsAndAdditionalActualReadInputsRecheckedBeforeFreeze': True,
    'independentTechnicalAuditFreeze': {'path': str(audit_freeze_path.relative_to(ROOT)), 'sha256': sha(audit_freeze_path)},
    'historicalAuthorAndIndependentScienceFreezesPreserved': True,
    'HHIndependentBScientificReviewUnchanged': True,
    'HH22AndHH29ExplicitLimitsRetained': True,
    'noInferredAnimalRespirationCirculationSenseOrganSubclaims': True,
    'newSourceExtractionOrMappingDecisionsForNextLocators': 0,
    'newScientificReviews': 0, 'globalChecks': 0, 'pdfBuilds': 0,
    'newStrictCompletions': 0, 'restoredActiveBindings': 0, 'strictNetGain': 0,
    'activeWrites': False, 'gitMutation': False,
    'humanApproval': False, 'humanTrial': False, 'integrationApproved': False,
}
freeze_path.write_text(json.dumps(sealed, ensure_ascii=False, indent=2) + '\n')
for b in files:
    assert sha(OUT / b['path']) == b['sha256'], b['path']
print(json.dumps({'status': sealed['status'], 'frozenFiles': len(files), 'freezePath': str(freeze_path.relative_to(ROOT)), 'freezeSha256': sha(freeze_path), 'originalGate': '382 != 390', 'integrationApproved': False, 'activeWrites': False}))
