#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind completed native candidate evidence; never applies a source/QA edit."""
import copy
import datetime
import hashlib
import json
import sys
from collections import Counter
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
AUDIT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06'
HERE = Path(__file__).resolve().parent
DOCS = ROOT / 'docs/dev/ci-graph-repairs'
GOALS = {'0c2ddfcd-1399-41ad-aaed-4f061812602a', 'ce198bc9-b014-52ba-814f-25cc3e020668',
         'd07ef7b1-8bd2-56e0-9e74-d90c3c3e02fe'}


def load(path):
    return json.loads(path.read_bytes())


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def binding(path):
    return {'path': str(path.relative_to(ROOT)), 'sha256': sha(path), 'bytes': path.stat().st_size}


def write(path, data):
    if path.exists():
        raise ValueError(f'Refuse to overwrite completed evidence: {path}')
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')


def main():
    predecessor_path = DOCS / 'math-three-description-synthesis-and-positive-candidates-2026-11-06.json'
    assert sha(predecessor_path) == 'bd9c6165bcbdf2307a75336aa9f8eeef396956cb15ac37fc7032d3f38936e925'
    predecessor = load(predecessor_path)
    for sealed in predecessor['sealedOriginalRounds']:
        assert sha(ROOT / sealed['runPath']) == sealed['runRawSha256']
        assert sha(ROOT / sealed['recordsPath']) == sealed['recordsRawSha256']
    native = load(HERE / 'native-index-consumer-check.json')
    assert set(native['unionCurrentGoalIds']) == GOALS
    assert all(not row['issues'] for row in native['checks'])
    assert load(HERE / 'native-index-consumer-execution.json')['exitCode'] == 0
    assert all(row['exitCode'] == 0 for row in load(HERE / 'execution.json'))
    assert sha(AUDIT / 'math-three-description-input-2026-11-06/packet/resolution-index.json') == '3d04b4d38e5ab33d653a921caedb930136d0d28e9c1f5ba565c5888d28f64611'
    current_source = ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
    candidate_source = ROOT / 'tmp/math-diagram-recheck-preparer-20261106/candidate.json'
    assert sha(current_source) == 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
    assert sha(candidate_source) == '967a9cf8f27c5ee678777401697ba8b69874dbc889f7cfe753267f7c5a05c318'
    original, candidate = load(current_source), load(candidate_source)
    replay = copy.deepcopy(original)
    operations = []
    for i, (old_goal, new_goal) in enumerate(zip(original['goals'], candidate['goals'], strict=True)):
        assert old_goal['id'] == new_goal['id']
        for field in set(old_goal) | set(new_goal):
            if old_goal.get(field) != new_goal.get(field):
                assert old_goal['id'] in GOALS
                assert field in {'requires', 'description', 'descriptionEn'}
                operations.append({'pointer': f'/goals/{i}/{field}', 'goalId': old_goal['id'],
                                   'oldValue': old_goal[field], 'newValue': new_goal[field]})
                replay['goals'][i][field] = new_goal[field]
    assert replay == candidate and len(operations) == 5
    assert Counter(row['pointer'].rsplit('/', 1)[1] for row in operations) == Counter({'requires': 3, 'description': 1, 'descriptionEn': 1})
    source_plan = {'status': 'guarded-five-field-candidate-plan-unapplied', 'source': binding(current_source),
                   'candidateSha256': sha(candidate_source), 'operations': sorted(operations, key=lambda row: row['pointer']),
                   'exactStructuralReplay': True, 'applyFunctionProvided': False}
    write(HERE / 'source-field-plan.json', source_plan)

    positive_dir = AUDIT / 'math-three-current-positive-candidates-2026-11-06'
    positive_receipt = positive_dir / 'candidate-receipt.json'
    assert sha(positive_receipt) == 'a01cb41baf1d55a4a9c5323592bd2e6b18d9c68e0267d10499b13337b1d33295'
    positive = load(positive_receipt)
    for file in positive['files']:
        assert sha(ROOT / file['path']) == file['sha256']
    assert len(load(positive_dir / 'native-execution.json')) == 7
    assert all(row['exitCode'] == 0 for row in load(positive_dir / 'native-execution.json'))
    replacement = load(AUDIT / 'math-orientation-three-normalization-plan/positive-replacement-plan.json')
    for i, carrier in enumerate(replacement['carriers']):
        assert sha(ROOT / carrier['oldReviewPath']) == carrier['oldReviewRawSha256']
        raw_lines = (ROOT / carrier['oldReviewPath']).read_bytes().splitlines(keepends=True)
        retained = b''.join(line for line in raw_lines if json.loads(line)['goalId'] not in GOALS)
        assert retained == (positive_dir / f'retained-{i}.review.jsonl').read_bytes()
    registry_path = ROOT / 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
    math = next(subject for subject in load(registry_path)['subjects'] if subject['subject'] == 'mathematik')
    old_positive_configs = [row['oldConfigPath'] for row in replacement['carriers']]
    proposed_positive_configs = [str((positive_dir / f'{name}.config.json').relative_to(ROOT)) for name in
                                 ['retained-0', 'retained-1', 'retained-2', 'image-two', 'image-free-one']]
    after_positive_configs = [path for path in math['positiveEvidenceConfigPaths'] if path not in old_positive_configs] + proposed_positive_configs
    old_scope = Counter(goal for path in math['positiveEvidenceConfigPaths'] for goal in load(ROOT / path)['scope']['goalIds'])
    new_scope = Counter(goal for path in after_positive_configs for goal in load(ROOT / path)['scope']['goalIds'])
    assert old_scope == new_scope and len(new_scope) == 807 and set(new_scope.values()) == {1}
    d_replacements = []
    for index_path in math['resolutionIndexPaths']:
        for entry in load(ROOT / index_path).get('resolutions', []):
            if entry['goalId'] in GOALS:
                replacement_index = native['checks'][1 if entry['goalId'].startswith('0c2') else 0]['path']
                d_replacements.append({'goalId': entry['goalId'], 'supersededIndexPath': index_path,
                                       'historicalResolutionDigest': entry['resolutionDigest'],
                                       'replacementIndexPath': replacement_index})
    assert len(d_replacements) == 3
    registry_plan = {'status': 'unapplied-registry-plan-requires-whole-subject-native-replay',
                     'originalRegistry': binding(registry_path), 'dSupersessionsToAdd': d_replacements,
                     'registerBothNewNativeDIndices': [row['path'] for row in native['checks']],
                     'oldDIndicesAndHistoricalRecordsRemainRegisteredAndUnchanged': True,
                     'positiveRemoveConfigPaths': old_positive_configs, 'positiveAddConfigPaths': proposed_positive_configs,
                     'oldAndProposedPositiveScopeCountersExactlyEqual': True, 'wholePositiveDenominator': 807,
                     'unrelatedPositiveConfigsUnchanged': True, 'activeRegistryWritten': False}
    write(HERE / 'registry-change-plan.json', registry_plan)

    new_rounds = []
    packet = AUDIT / 'math-single-description-input-2026-11-06/packet'
    for round_name in ['a', 'b']:
        run_path = next((packet / f'round-{round_name}/results').glob('*.run.json'))
        record_path = next((packet / f'round-{round_name}/results').glob('*.records.jsonl'))
        run, record = load(run_path), load(record_path)
        assert run['status'] == 'completed' and record['decision'] == 'keep'
        assert run['outputDigest'] == 'sha256:' + sha(record_path)
        new_rounds.append({'round': round_name, 'run': binding(run_path), 'records': binding(record_path),
                           'runId': run['runId'], 'decision': record['decision'], 'modelDeclaration': run['model'],
                           'modelVersionDeclaration': run['modelVersion'], 'startedAtDeclared': run['startedAt'],
                           'completedAtDeclared': run['completedAt']})
    draft_path = AUDIT / 'math-three-description-post-review/fresh-kind-atomicity-memory-drafts.json'
    assert sha(draft_path) == '152bb5403140fe18adb8de1af8520cd1001b40c7f6d37aaa7657d6846fb95e9d'
    drafts = load(draft_path)
    assert {row['goalId'] for row in drafts['semanticKindDrafts']} == GOALS
    final = {
        'schemaVersion': 1, 'status': 'actual-current-D3-and-P3-plus28-retained-candidate-evidence-complete-unapplied',
        'completedAtActualCoordinator': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'historicalPreparationClosure': binding(predecessor_path),
        'actualActiveSource': binding(current_source), 'currentCandidateSha256': sha(candidate_source),
        'sourceFieldPlan': binding(HERE / 'source-field-plan.json'),
        'originalThreeGoalReviewRecordsAndTwoNativeResolutionsUnchanged': True,
        'originalDiagramTwoReviseRemainHistoricalAndDeferredInOriginalIndex': True,
        'newActualDiagramRounds': new_rounds,
        'runTimingBoundary': 'Declared intervals cover the observed concluding assessment/record section; preparatory reading occurred earlier. Exact deployment and undisclosed sampling parameters are unknown. No intervals were relabelled or extended.',
        'newDiagramSynthesisAndResolution': [binding(packet / name) for name in ['synthesis-authoring.json', 'synthesis-decisions.json', 'resolution-index.json',
                                                  'resolutions/0c2ddfcd-1399-41ad-aaed-4f061812602a.resolution.json']],
        'nativeSynthesisExecution': binding(HERE / 'execution.json'),
        'nativeConsumerExecution': binding(HERE / 'native-index-consumer-execution.json'),
        'nativeCurrentDUnion': native, 'nativeCurrentDUnionEvidence': binding(HERE / 'native-index-consumer-check.json'),
        'currentPositiveCandidates': binding(positive_receipt),
        'positiveActualContentReview': {'newCurrentRows': 3, 'retainedRawRows': 28, 'retainedRawBytesReverified': True,
                                        'allSevenNativeStepsExit0': True, 'completeRegistryScopeStill807': True,
                                        'status': 'needs_human_review', 'authority': 'ai_candidate', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1'},
        'freshKindAM': {'actualIndependentContentReview': binding(draft_path), 'semanticKindRows': 3, 'atomicityRows': 1, 'memoryGoalRows': 1,
                       'primaryCardRowsChanged': 0, 'activeRowsWritten': False},
        'freshVisualizationReview': predecessor['freshVisualizationReview'],
        'registryChangePlan': binding(HERE / 'registry-change-plan.json'),
        'preservationReceipt': predecessor['preservationReceipt'],
        'remainingIntegrationHolds': [
            'General V original-review-receipt/context binding must be implemented and independently qualified; merely relabelling the old V description never grants current approval.',
            'The final967a source needs its own guarded split-policy review and actual18-output comparison; the earlier da47 and b215 proofs are not a policy pass for967a.',
            'No active registry supersession, kind/atomicity/memory/positive/V row, canonical field, view, learner state, or mastery has been written.',
            'After authorized integration, actual whole-subject native D/P/A/M/V and unchanged graph/floor checks are still required. This package does not establish MathM6/M7 or restore any protected floor.',
            'The three reviewed orientation normalizations do not approve unreviewed carrier breadth or other MathG17 cases; existing914G17+2G01a remain separate graph obligations.',
        ],
        'noFullCqrOrDeepProducerInvoked': True, 'noM6M7RestorationClaimed': True,
    }
    write(DOCS / 'math-three-current-evidence-completion-2026-11-06.json', final)
    print(json.dumps({'status': final['status'], 'file': str((DOCS / 'math-three-current-evidence-completion-2026-11-06.json').relative_to(ROOT)),
                      'sha256': sha(DOCS / 'math-three-current-evidence-completion-2026-11-06.json')}))


if __name__ == '__main__':
    main()
