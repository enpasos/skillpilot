# SPDX-License-Identifier: Apache-2.0
"""Seal the bounded private synthesis; grant no curriculum or registry status."""
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path
import gzip
import hashlib
import json

P = Path(__file__).resolve().parent
R = P.parents[3]
I = P.with_name('math-g17-fifteen-description-blind-input-candidate')
sha = lambda b: hashlib.sha256(b).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

def pin(path):
    b = path.read_bytes()
    return {'path': path.relative_to(R).as_posix(), 'sha256': sha(b), 'bytes': len(b)}

def main():
    source = json.loads((I/'inputs/current-source.json').read_bytes())
    goals = {g['id']: g for g in source['goals']}
    records, record_pins, native_rounds = {}, {}, {}
    for rnd in ['a', 'b']:
        input_path = P/f'packet/round-{rnd}/description-review-input.json'
        inp = json.loads(input_path.read_bytes())
        f = next((P/f'packet/round-{rnd}/results').glob('*.records.jsonl'))
        run = next((P/f'packet/round-{rnd}/results').glob('*.run.json'))
        rows = [json.loads(x) for x in f.read_text().splitlines()]
        assert len(rows) == len(inp['goals']) == 15
        records[rnd] = {x['goalId']: x for x in rows}
        native_rounds[rnd] = {'records': pin(f), 'run': pin(run),
                              'decisionCounts': dict(Counter(x['decision'] for x in rows))}
        for g, record, line in zip(inp['goals'], rows, f.read_bytes().splitlines(keepends=True)):
            assert g['goalId'] == record['goalId']
            assert g['canonicalContext']['requires'] == goals[g['goalId']]['requires']
            for field in ['goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn']:
                assert g[field] == record[field]
            record_pins.setdefault(g['goalId'], {})[rnd] = {
              'recordId': record['recordId'], 'exactLineWithTerminatorSha256': sha(line)}
    assert (P/'packet/round-a/prompt.md').read_bytes() == (P/'packet/round-b/prompt.md').read_bytes()
    assert (P/'packet/round-a/criteria.md').read_bytes() == (P/'packet/round-b/criteria.md').read_bytes()
    assert (P/'packet/round-a/description-review-input.json').read_bytes() == (P/'packet/round-b/description-review-input.json').read_bytes()
    # The relocated working copy preserves every existing packet file byte.
    for f in (I/'packet').rglob('*'):
        if f.is_file():
            assert f.read_bytes() == (P/'packet'/f.relative_to(I/'packet')).read_bytes(), str(f)
    comparison = json.loads((P/'review-comparison.json').read_bytes())
    manifest = json.loads((P/'packet/synthesis-decisions.json').read_bytes())
    resolution_ids = sorted(x.stem.removesuffix('.resolution') for x in (P/'packet/resolutions').glob('*.resolution.json'))
    assert resolution_ids == sorted(x['goalId'] for x in manifest['decisions'])
    assert len(resolution_ids) == 11 and len(manifest['deferredGoals']) == 4
    assert not (P/'packet/resolution-index.json').exists()
    open_rows = []
    for x in comparison['rows']:
        if x['evidenceRound'] is not None:
            continue
        goal = x['goalId']
        questions = {'goalId': goal, 'titleDe': x['titleDe'], 'disposition': x['disposition'],
          'recordBytes': record_pins[goal], 'rationaleDe': x['rationaleDe'], 'rationaleEn': x['rationaleEn'],
          'sourceChangeApplied': False, 'resolved': False}
        if records['b'][goal]['decision'] == 'revise':
            questions['roundBVerbatimWordingCandidateNotAdopted'] = {
              k: records['b'][goal][k] for k in ['proposedDescriptionDe', 'proposedDescriptionEn']}
        if goal.startswith('3e974'):
            questions['minimalNextDecision'] = 'Existing fachliche adjudication must determine the evaluable full competence and its source boundaries without deleting any claimed facet. Preserve the split hold until a justified structural disposition and fresh blind reviews; no automatic unit/split/mastery operation.'
        elif goal.startswith('5927'):
            questions['minimalNextDecision'] = 'Determine whether the broad goal applies the independently owned random-variable concept to distribution representation or duplicates its acquisition; examine d711 without automatically changing it. Clarify the numeric codomain together with that boundary; wording alone cannot close SPLIT.'
        elif goal.startswith('6f09'):
            questions['minimalNextDecision'] = 'Decide the proposed given-state-model condition through existing description authoring, then review the final neutral current context in two real independent rounds. Calculation and interpretation remain one goal.'
        else:
            questions['minimalNextDecision'] = 'Decide the proposed unit-circle/rotation-angle wording, independently settle the visualization direction, then prepare two fresh independent D rounds on the final context; do not reuse the pre-change REVISE records as final evidence.'
        open_rows.append(questions)
    write(P/'open-questions.json', {'schemaVersion': 1, 'status': 'HOLD', 'goals': open_rows,
      'fullOriginalD15ScopeRetained': True, 'unitOrMasteryChangesAuthorizedByThisSynthesis': False,
      'pr83AndLearningUnitWorkFrozen': True,
      'materialQuestions': [
        {'goalId': 'bbef7cf2-90fa-59fa-a115-8b651aab9231', 'classification': 'open_orientation_clarity',
         'independentlyViewed': True, 'detail': 'Clockwise arrows are ambiguous beside increasing-positive-angle graphs unless decreasing-angle traversal is explained; the basic graphs themselves are not shown false. Existing V path must resolve intended orientation.'},
        {'goalId': '91e2f564-3bc8-4924-af85-2a3fa84c1471', 'classification': 'bounded_example_not_additional_D_hold',
         'independentlyViewed': True, 'detail': 'Positive bridge-scaling example; maximum-position statements cannot be generalized to nonpositive factors or arbitrary parameter positions.'},
        {'goalId': '6f09c97e-779b-500b-8092-3fb9696aa5bb', 'classification': 'model_context_required_for_interpretation',
         'independentlyViewed': True, 'detail': 'Correct arithmetic (65,35); actual state-component meanings must come from the task. Total conservation is not a general matrix-product property.'}],
      'noProfileMutation': 'All create recommendations describe absent supplied cold-input profiles; existing separate P records are neither withdrawn nor re-reviewed.',
      'futureGateRule': 'Recompute only actually affected context/page/source/asset contracts after adjudicated changes; use the existing D/P/A/M/V validators and exact per-goal supersession path. No historical hash relabeling, no narrowed denominator, no active D807 claim.'})
    before = json.loads(gzip.decompress((P/'protected-before.json.gz').read_bytes()))
    changed = [p for p,h in before.items() if sha((R/p).read_bytes()) != h]
    assert not changed
    assert all(x['exitCode'] == 0 for x in json.loads((P/'native-execution.json').read_bytes()))
    write(P/'independent-checks.json', {'allOriginalPacketFilesByteEqual': True,
      'bothInputsAndPromptsAndCriteriaByteEqual': True, 'thirtyInputAndRecordContextsMatchPrivateSource15': True,
      'allSixEvidenceFieldsReadInEachRecord': True, 'fullBilingualReplacementsRead': True,
      'recordsUnchanged': native_rounds, 'explicitGoalDispositions': 15, 'nativeResolutionIds': resolution_ids,
      'deferredGoalIds': [x['goalId'] for x in open_rows], 'protectedFilesRecheckedAtSeal': len(before),
      'protectedChanges': changed, 'nativeSynthesizedAtIsNotRealReviewTime': True})
    inventory = []
    for f in sorted(P.rglob('*')):
        if f.is_file() and f.name not in ['inventory.json', 'review-receipt.json']:
            b = f.read_bytes();inventory.append({'path': f.relative_to(P).as_posix(), 'sha256': sha(b), 'bytes': len(b)})
    write(P/'inventory.json', {'schemaVersion': 1, 'files': inventory})
    observation = json.loads((P/'review-observation.json').read_bytes())
    write(P/'review-receipt.json', {'schemaVersion': 1, 'status': 'SEALED_PRIVATE_PARTIAL_SYNTHESIS_D15_HOLD',
      'actor': '/root/math15_description_synthesis', 'authority': 'ai_synthesis', 'blindFirstPass': False,
      'firstMeasuredAtActualUTC': observation['firstMeasuredAtActualUTC'],
      'sealedAtActualUTC': datetime.now(timezone.utc).isoformat(),
      'timeQualification': observation['timeScope'], 'nativeDeterministicSynthesizedAt': manifest['synthesizedAt'],
      'preparationReceipt': pin(I/'receipt.json'), 'preparationInventory': pin(I/'inventory.json'),
      'privateSource15': pin(I/'inputs/current-source.json'), 'privateKindLedger': pin(I/'inputs/current-semantic-kind-ledger.json'),
      'originalRounds': {r: {k: pin(next((I/f'packet/round-{r}/results').glob(pattern))) for k,pattern in [('records','*.records.jsonl'),('run','*.run.json')]} for r in ['a','b']},
      'inventory': pin(P/'inventory.json'), 'inventoryFiles': len(inventory), 'inventoryBytes': sum(x['bytes'] for x in inventory),
      'nativeManifestFingerprint': manifest['manifestFingerprint'], 'nativeManifest': pin(P/'packet/synthesis-decisions.json'),
      'assignedGoals': 15, 'nativeResolutions': 11, 'explicitDeferredGoals': 4,
      'twoKeepPairs': 8, 'exactRejectedReviseDissents': 3, 'nativeWriteAndCheckCommands': 6,
      'nativeAllExitCodesZero': True, 'completeD15': False, 'resolutionIndexCreated': False,
      'registryAttached': False, 'activeD807Claim': False, 'protectedFilesUnchanged': len(before),
      'activeWrites': False, 'originalRoundOrRunChanges': False, 'sourceAProbes': 0,
      'gitActions': 0, 'dbActions': 0, 'deployActions': 0, 'subagents': 0, 'producerRuns': 0,
      'unitChanges': False, 'masteryWritesOrWithdrawals': False, 'humanApprovalClaimed': False})
    for row in inventory:
        assert sha((P/row['path']).read_bytes()) == row['sha256']
    print('receipt', sha((P/'review-receipt.json').read_bytes()))
    print('inventory', sha((P/'inventory.json').read_bytes()), 'files', len(inventory))
    print('manifest', manifest['manifestFingerprint'])

if __name__ == '__main__':
    main()
