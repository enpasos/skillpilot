#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Targeted read-only primary-page and frozen-input verification, no review inference."""
import hashlib
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path

OWN = Path(__file__).resolve().parent
ROOT = OWN.parents[6]
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-06/biologie-neuro-outside-fifty-two-source-restoration-author-v2'
FREEZE = AUTHOR / 'th-largest-partial-author-v2.final.freeze.json'
EXPECTED_FREEZE = '2572275ce5bc759e0e8b7691533f4b3caf2d63f55591a444cb065508b975c848'


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_text())


def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': digest(path), 'bytes': path.stat().st_size}


assert digest(FREEZE) == 'sha256:' + EXPECTED_FREEZE
freeze = load(FREEZE)
for entry in freeze['files']:
    path = ROOT / entry['path']
    assert digest(path) == entry['sha256'] and path.stat().st_size == entry['bytes']

preservation = load(AUTHOR / 'current-canon-and-source-author-input-preservation.json')
pdf = ROOT / preservation['primaryDocument']['path']
assert digest(pdf) == preservation['primaryDocument']['sha256']
live_pdf = Path('/tmp/skillpilot-th-b-primary-review/live-th.pdf')
assert live_pdf.is_file() and digest(live_pdf) == digest(pdf)
pages = {
    page: subprocess.check_output([
        'pdftotext', '-layout', '-f', str(page), '-l', str(page), str(pdf), '-',
    ]).decode() for page in range(12, 25)
}
normalize = lambda text: ' '.join(text.split())
source = load(AUTHOR / 'TH.nineteen-source-components.author-v2.candidate.json')
mapping = load(AUTHOR / 'TH.nineteen-component-mappings.author-v2.candidate.json')
decisions = load(AUTHOR / 'TH.forty-three-current-goal-primary-scope.decisions.author-v2.json')
canonical = load(ROOT / preservation['currentCanonical']['path'])
assert canonical == preservation['currentCanonicalWholeGoalSnapshot']
goals = {g['id']: g for g in canonical['goals']}
parent_checks = []
goal_bindings = []
for component in source['sourceGoals']:
    rows = [r for r in mapping['mappings'] if r['legacyGoalId'] == component['id']]
    assert len(rows) == 1
    row = rows[0]
    target = row['canonicalGoalId']
    assert target == component['passageId'].split(':')[1]
    assert row['matchType'] == 'partial'
    decision_rows = [r for r in mapping['decisions'] if r['sourceGoalId'] == component['id']]
    assert len(decision_rows) == 1 and decision_rows[0]['canonicalGoalIds'] == [target]
    assert decision_rows[0]['wholeOriginalSourceCoverage'] is False
    assert component['stage'] == 'SekI' and component['courseLevel'] == 'unspecified'
    assert component['originalPrintedClassRange'] == '7/8'
    assert component['isOfficialBullet'] is False and component['officialNumberingClaim'] is False
    assert component['authorOperationalisation'] is True
    assert component['wholeOriginalBulletCoverage'] is False
    assert component['wholeOriginalSummaryCoverage'] is False
    assert component['sourceContextBoundary']['explicitClassRange'] == ['7', '8']
    assert component['sourceContextBoundary']['noOriginalGKOrLKClaim'] is True
    assert component['sourceContextBoundary']['noHigherStageBackfill'] is True
    for parent in [*component['officialParentBindings'], component['originalGradeBandQualifier']]:
        physical = parent['physicalPage']
        assert normalize(parent['rawSourceText']) in normalize(pages[physical])
        assert parent['printedPage'] == physical - 6
        parent_checks.append({
            'sourceGoalId': component['id'], 'targetGoalId': target,
            'physicalPage': physical, 'printedPage': parent['printedPage'],
            'boundRawSourceTextSha256': 'sha256:' + hashlib.sha256(parent['rawSourceText'].encode()).hexdigest(),
            'normalizedLiteralSubstringInOwnFreshPrimaryExtraction': True,
            'parentRawTextPreservedInAuthorInputOnly': True,
        })
    goal_bindings.append({
        'goalId': target, 'sourceGoalId': component['id'],
        'currentWholeGoal': goals[target],
        'currentWholeGoalJsonSha256': 'sha256:' + hashlib.sha256(json.dumps(goals[target], ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
        'mappingMode': 'direct explicit partial component',
    })

assert len(goal_bindings) == 19 and len({r['goalId'] for r in goal_bindings}) == 19
held = sorted(r['goalId'] for r in decisions['openCurrentGoalScopeHolds'])
assert len(held) == 24
assert held == sorted(source['retainedOriginalSourceObligations']['residualHoldGoalIds'])
assert not set(held) & {r['goalId'] for r in goal_bindings}
assert all(r['authorDecision'].startswith('HOLD_') and r['nativeVisibilityRestored'] is False
           and r['scientificIndependentApproval'] is False for r in decisions['openCurrentGoalScopeHolds'])
worklist = load(ROOT / preservation['worklist']['path'])
th_pairs = [r for r in worklist['goalViewPairs'] if r['viewJurisdiction'] == 'DE-TH']
other_pairs = [r for r in worklist['goalViewPairs'] if r['viewJurisdiction'] != 'DE-TH']
assert len(th_pairs) == 43 and len(other_pairs) == 144
assert {r['goalId'] for r in th_pairs} == set(held) | {r['goalId'] for r in goal_bindings}
assert len(worklist['goalViewPairs']) == 187
assert source['retainedOriginalSourceObligations']['wholeOriginalSummaryCoverage'] is False
assert source['retainedOriginalSourceObligations']['originalWholeHoldDecision']['decision'] == 'needs_canonical_goal'
assert source['retainedOriginalSourceObligations']['originalWholeDecisionsNotReopened'] is True

extra_paths = [FREEZE, ROOT / 'AGENTS.md', *(ROOT / preservation[k]['path']
    for k in ['currentCanonical', 'currentKindLedger', 'worklist', 'originalSource', 'primaryDocument'])]
result = {
    'schemaVersion': 1, 'reviewLane': 'independent-source-review-b',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(),
    'authorFreezeBinding': binding(FREEZE),
    'all24FrozenAuthorFilesExactlyVerified': True,
    'actualCurrentAdditionalInputBindings': [binding(p) for p in extra_paths],
    'officialLiveDownload': {
        'url': source['sourceDocument']['url'], 'sha256': digest(live_pdf),
        'bytes': live_pdf.stat().st_size, 'byteIdenticalToCurrentLocalPrimaryPdf': True,
        'downloadIsTemporaryCacheOnly': True,
        'webToolFetch': 'Unicode decoding error; actual HTTPS curl download succeeded',
    },
    'primaryPdfPhysicalPagesPersonallyViewed': [15, 16, 19, 20, 22, 23, 24],
    'ownPdfRendering': 'pdftoppm -scale-to 1600 -png; temporary cache, no new committed third-party page copies',
    'ownPdfRendererVersion': subprocess.run(['pdftoppm', '-v'], capture_output=True, text=True).stderr.splitlines()[0],
    'actualTemporaryPrimaryPageImagesViewed': [
        {'physicalPage': p, 'printedPage': p - 6,
         'sha256': digest(Path(f'/tmp/skillpilot-th-b-primary-review/TH-physical-{p}.png')),
         'temporaryReadOnlyRenderNotRequiredActiveArtifact': True}
        for p in [15, 16, 19, 20, 22, 23, 24]],
    'targetedPages12Through24ReadAsActualFreshPdfText': True,
    'all13FrozenAuthorTargetedPageTextsEqualOwnFreshPdfExtraction': all(
        (AUTHOR / f'sources/TH-physical-page-{p:03}.actual.txt').read_text() == pages[p]
        for p in range(12, 25)),
    'literalPrimaryParentChecks': parent_checks,
    'distinctOfficialParentRawSpans': len({(b['physicalPage'], b['rawSourceText'])
        for c in source['sourceGoals'] for b in c['officialParentBindings']}),
    'currentNineteenGoalBindings': goal_bindings,
    'unchangedCurrentWholeCanonicalPayload': True,
    'remainingTHHeldGoalIds': held,
    'historicalWorklistPairPartitionVerified': {'TH': 43, 'THComponentCandidates': 19,
        'THHoldsRetained': 24, 'otherPairsUnprocessedAndStillOpen': 144, 'total': 187},
    'wholeOriginalSummaryDecisionRetainedAsHold': True,
    'old383WorklistNotPromotedToCurrent390GoalCount': True,
    'peerNewAReviewRead': False,
    'reviewIsHumanApproval': False, 'activeWrites': False,
    'newStrictCompletions': 0, 'restoredActiveBindings': 0,
}
assert result['all13FrozenAuthorTargetedPageTextsEqualOwnFreshPdfExtraction']
(OWN / 'primary-and-current-inputs.independent-b.actual.receipt.json').write_text(
    json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'frozenAuthorFiles': len(freeze['files']), 'verifiedDistinctParentSpans': result['distinctOfficialParentRawSpans'],
                  'components': len(goal_bindings), 'THHoldsRetained': 24, 'otherPairsStillOpen': 144, 'strictGain': 0}))
