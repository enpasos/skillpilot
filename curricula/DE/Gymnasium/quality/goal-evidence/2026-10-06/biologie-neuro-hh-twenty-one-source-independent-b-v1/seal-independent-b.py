#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal completed independent B evidence without changing historical inputs."""
import hashlib
import json
import shutil
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = OWN.parent / 'biologie-neuro-hh-thirty-two-source-restoration-author-v1'
FREEZE = OWN / 'hh-twenty-one-source-independent-b-v1.final.freeze.json'
SHA = lambda path: 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()
LOAD = lambda path: json.loads(path.read_text())
assert not FREEZE.exists(), 'Preserve the final independent B freeze'
review = LOAD(OWN / 'HH.twenty-one-bounded-components-and-eleven-holds.independent-b.review.json')
primary = LOAD(OWN / 'HH.author-freeze-and-actual-primary-reading.independent-b.json')
native = LOAD(OWN / 'native-hh-current390-additive-atlas.independent-b.current.actual.receipt.json')
author_freeze_path = AUTHOR / 'hh-thirty-two-partial-source-author-v1.final.freeze.json'
author_freeze = LOAD(author_freeze_path)
for binding in author_freeze['files']:
    path = ROOT / binding['path']
    assert SHA(path) == binding['sha256'] and path.stat().st_size == binding['bytes']
assert SHA(author_freeze_path) == primary['authorFreeze']['sha256']
for binding in primary['TH19AuthorFreezePreservation']['files']:
    path = ROOT / binding['path']
    assert SHA(path) == binding['sha256'] and path.stat().st_size == binding['bytes']
assert SHA(ROOT / primary['TH19AuthorFreezePreservation']['path']) == primary['TH19AuthorFreezePreservation']['sha256']
assert len(review['componentDecisions']) == 21 and len(review['wholeCurrentGoalScopeHolds']) == 11
assert all(row['independentBDecision'] == 'ACCEPT_BOUNDED_DIRECT_PARTIAL_COMPONENT_ONLY'
           and row['wholeCurrentCanonicalGoalApproved'] is False
           and row['wholeOriginalSourceApproved'] is False for row in review['componentDecisions'])
assert len(primary['actualPdfRastersVisuallyReadByB']) == 10
assert len(primary['selectedSpanChecks']) == 26
assert all(row['allExactOriginalLinesAndBBoxesReproduced'] and row['actualPageAndTableCellVisuallyReadByB']
           for row in primary['selectedSpanChecks'])
assert native['candidateCounts']['canonicalCurricularAtomicGoals'] == 390
assert len(native['countryScopes']) == 22
assert native['all22CompleteOrderedCountryTargetListsExactlyEqualByActualDeepComparison']
assert native['same22OrderedTargetListsAsFrozenAuthorNativeReceipt']
assert len(native['actualNewDirectHHComponentWitnesses']) == 21
assert all(row['scopeKey'] == 'DE-HH/SekI/' and row['coverage'] == 'direct'
           for row in native['actualNewDirectHHComponentWitnesses'])
current_bindings = []
after_run_drifts = []
for binding in native['actualCurrentInputBindings']:
    path = ROOT / binding['path']
    actual = SHA(path)
    current_bindings.append({'path': binding['path'], 'sha256': actual, 'bytes': path.stat().st_size,
                             'sameAsActualNativeRun': actual == binding['sha256']})
    if actual != binding['sha256']:
        after_run_drifts.append({'path': binding['path'], 'nativeRunSha256': binding['sha256'],
                                 'sealSha256': actual})
for path in [ROOT / 'docs/qa-ci/curriculum-mapping-workbench.md',
             ROOT / 'docs/qa-ci/curriculum-quality-maturity-and-routes.md',
             ROOT / 'docs/qa-ci/curriculum-package-human-review-gates.md',
             ROOT / 'docs/qa-ci/goal-source-rationales-runbook.md',
             ROOT / 'docs/concept/skill-graph/human-readable-source-rationales.md']:
    current_bindings.append({'path': str(path.relative_to(ROOT)), 'sha256': SHA(path),
                             'bytes': path.stat().st_size, 'role': 'relevant read-only QA guidance'})
inputs = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
          'role': 'actual independent B final input binding; historical receipts preserved',
          'currentInputBindings': current_bindings,
          'inputDriftsAfterActualNativeRun': after_run_drifts,
          'historicalAuthorInputDrifts': primary['currentHistoricalInputDrifts'],
          'noPeerAReportOrAssessmentRead': True, 'activeWrites': False, 'gitMutation': False}
input_path = OWN / 'independent-b.final-actual-input-bindings.json'
assert not input_path.exists()
input_path.write_text(json.dumps(inputs, ensure_ascii=False, indent=2) + '\n')
# Original page/PDF/text files were a reading cache, not committed evidence.
cache = OWN / '.reading-cache'
assert cache.is_dir()
shutil.rmtree(cache)
files = [{'path': str(path.relative_to(ROOT)), 'sha256': SHA(path), 'bytes': path.stat().st_size}
         for path in sorted(OWN.iterdir()) if path.is_file() and path != FREEZE]
assert len(files) == 8
result = {'schemaVersion': 1, 'createdAtUTC': datetime.now(timezone.utc).isoformat(),
          'role': 'finished independent B scientific partial-source review and separately bounded actual current technical rerun',
          'files': files,
          'sourceReviewStatus': 'ACCEPT_21_BOUNDED_DIRECT_PARTIAL_COMPONENTS_WITH_RESIDUAL_HOLDS',
          'counts': review['counts'],
          'authorFreezeAndAllTenFilesStillExactAtSeal': True,
          'actualOriginalPdfReadingConfirmed': True, 'actualPdfPagesVisuallyRead': [18, 19, 20, 22, 23, 24, 25, 26, 27, 28],
          'all26ActualOriginalLineAndBBoxSpansReproduced': True,
          'nativeCurrent390AdditiveAtlas': 'PASS_ACTUAL_CURRENT_TECHNICAL_RERUN',
          'all22FullOrderedCountryTargetListsEqual': True,
          'same22FullOrderedListsAsFrozenAuthorReceipt': True,
          'TH19AuthorFreezeAnd24FilesStillExactAtSeal': True,
          'chemistryProtected112WholeObjectsExactAtReading': True,
          'historicalAuthorInputDriftsPreserved': [row['path'] for row in primary['currentHistoricalInputDrifts']],
          'inputDriftsAfterActualNativeRun': after_run_drifts,
          'currentInputHashesMatchActualNativeRunAtSeal': not after_run_drifts,
          'noPeerAReportOrAssessmentRead': True,
          'wholeCurrentCanonicalGoalsApproved': False, 'wholeOriginalSummaryClearance': False,
          'completeOriginalExtractionApproved': False,
          'fullNeuro21HoldOverlayAndGoalBookPlacement': 'NOT_RUN; pending separate joint integration evidence',
          'activeWrites': False, 'gitMutation': False, 'restoredActiveBindings': 0,
          'newStrictCompletions': 0, 'strictNetGain': 0, 'M7Claim': False,
          'humanApproval': False, 'humanTrial': False,
          'freezeMeaning': 'Exact independent B evidence for partial components only; no promotion of author files, whole-source debt, native D/P/A/M/V or M7.'}
FREEZE.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
for binding in files:
    assert SHA(ROOT / binding['path']) == binding['sha256']
print(json.dumps({'freeze': str(FREEZE.relative_to(ROOT)), 'sha256': SHA(FREEZE), 'files': len(files),
                  'acceptedPartialComponents': 21, 'wholeHolds': 11,
                  'inputDriftsAfterNativeRun': after_run_drifts, 'strictNetGain': 0}))
