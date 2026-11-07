#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Seal the finite private generator/consumer replay; never applies changes."""
import copy
import datetime
import gzip
import hashlib
import json
import re
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[4]
HERE = Path(__file__).resolve().parent
RAM = Path('/dev/shm/skillpilot-math-final967a-duration-20261106')
DOCS = ROOT / 'docs/dev/ci-graph-repairs'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
POLICY = 'app/scripts/config/math-duration-split-spanning-tree-policy.json'
VIEWS = 'curricula/DE/Gymnasium/composition-views/mathematik'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def load(path):
    return json.loads(path.read_bytes())


def pin(path):
    return {'path': str(path.relative_to(ROOT)) if path.is_relative_to(ROOT) else str(path),
            'sha256': sha(path), 'bytes': path.stat().st_size}


def write(path, obj):
    assert not path.exists(), f'Refuse to overwrite sealed evidence: {path}'
    path.write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


def one_field_guard(before, after):
    inverse = copy.deepcopy(after)
    inverse['inputs']['canonical']['sha256'] = before['inputs']['canonical']['sha256']
    return before == inverse


def main():
    executions = load(HERE / 'execution.json')
    assert len(executions) == 9
    assert [row['exitCode'] for row in executions] == [1, 0, 0, 0, 0, 1, 1, 1, 1]
    comparisons = load(HERE / 'output-comparison.json')
    native = load(HERE / 'native-layout-comparison.json')
    assert len(native['outputs']) == len(comparisons['outputs']) == 18
    assert load(HERE / 'native-layout-execution.json')['exitCode'] == 0
    assert native['all18NativeTreeFindingsRoleScopeAndFilteredTargetSetsEqual']
    review = load(HERE / 'input-binding-review.json')
    assert sha(ROOT / SOURCE) == 'da4724ae0db70d85cae68eb273df663f59b17b2ca761a86181fa462299a123b6'
    assert sha(ROOT / POLICY) == '4415411350eabee64077f9c4769603814a428b9d3f3421cfaa7ceda1339f3227'
    assert sha(HERE / 'candidate-policy.json') == 'dbb468a72a419cb1b46398f5d1dbb04aff02a87a5669c19a892f310e555ae149'
    original, candidate = load(ROOT / POLICY), load(HERE / 'candidate-policy.json')
    assert one_field_guard(original, candidate)
    mutation = copy.deepcopy(candidate)
    mutation['sek1Templates'][0]['placements'][0]['removeAtomicGoalIds'] = []
    assert not one_field_guard(original, mutation)
    write(HERE / 'single-field-guard-control.json', {
        'actualCandidateAccepted': True, 'additionalPlacementMutationRejected': True,
        'negativeChangedField': '/sek1Templates/0/placements/0/removeAtomicGoalIds',
        'guardImplementation': 'one_field_guard in seal-review.py',
        'nativeGeneratorGuardClaimForThisSeparatePlanGuard': False,
    })
    trace_sets = {}
    trace_inventories = []
    for row in executions:
        trace = Path(row['trace']['path'])
        assert sha(trace) == row['trace']['sha256']
        paths = {name for name in re.findall(r'openat\([^,]+, "([^"]+)"', trace.read_text())
                 if name.startswith(str(ROOT / 'curricula') + '/') or name.startswith(str(ROOT / 'app/scripts/config') + '/')}
        trace_sets[row['case']] = paths
        raw = trace.read_bytes()
        zipped = gzip.compress(raw, mtime=0)
        assert gzip.decompress(zipped) == raw
        output = HERE / (row['case'] + '.openat.trace.gz')
        assert not output.exists()
        output.write_bytes(zipped)
        trace_inventories.append({'case': row['case'], 'originalRaw': row['trace'], 'gzip': pin(output), 'gzipRoundtripRawByteEqual': True})
    assert trace_sets['baseline-generate'] == trace_sets['candidate-generate']
    assert len(trace_sets['baseline-generate']) == 44
    input_rows = []
    overlays = {str(ROOT / SOURCE): 'source', str(ROOT / KINDS): 'kinds', str(ROOT / POLICY): 'policy'}
    for name in sorted(trace_sets['baseline-generate']):
        if name in overlays:
            key = overlays[name]
            old = RAM / f'baseline-{key}.json'
            new = RAM / f'candidate-{key}.json'
        else:
            old = new = Path(name)
        input_rows.append({'logicalPath': str(Path(name).relative_to(ROOT)),
                           'baselineSha256': sha(old), 'candidateSha256': sha(new),
                           'explicitCandidateOverlay': overlays.get(name), 'rawBytesEqual': old.read_bytes() == new.read_bytes()})
    assert sum(not row['rawBytesEqual'] for row in input_rows) == 3
    write(HERE / 'observed-generator-data-inputs.json', {'baselineAndCandidatePathSetsExactlyEqual': True, 'observedDataPaths': input_rows,
                                                        'onlyActualDifferentInputs': [SOURCE, KINDS, POLICY],
                                                        'traces': trace_inventories})
    for row in comparisons['outputs']:
        assert row['baselineGeneratedSha256'] == row['candidateGeneratedSha256'] == sha(ROOT / VIEWS / row['fileName'])
    binding_plan = {
        'schemaVersion': 1, 'status': 'guarded-final967a-technical-binding-proposal-NOT-applied',
        'target': POLICY, 'beforeFileSha256': sha(ROOT / POLICY), 'afterFileSha256': sha(HERE / 'candidate-policy.json'),
        'allowedJsonOperations': [
            {'op': 'test', 'path': '/inputs/canonical/sha256', 'value': original['inputs']['canonical']['sha256']},
            {'op': 'replace', 'path': '/inputs/canonical/sha256', 'value': candidate['inputs']['canonical']['sha256']},
        ],
        'requiredGuardsBeforeAnyFutureLivePolicyWrite': {
            'canonicalMustAlreadyEqualFinalReviewedCandidate': {'path': SOURCE, 'sha256': sha(RAM / 'candidate-source.json')},
            'kindLedgerMustEqualActuallyReviewedCandidate': {'path': KINDS, 'sha256': sha(RAM / 'candidate-kinds.json')},
            'unchangedGenerator': review['unchangedGenerator'],
            'allOtherPolicyFieldsExactlyEqualOriginal': True,
            'all13BoundOriginalReviewFilesUnchanged': review['all13CurrentBoundOriginalReviewFilesValidated'],
            'all18LiveOutputHashesUnchanged': comparisons['outputs'],
            'rootSafepointAndExplicitWriteAuthorizationRequired': True,
        },
        'requiredGeneratedFileWrites': [],
        'noCanonicalKindQaViewOrHistoricalReviewWritesAuthorizedByThisPlan': True,
        'applicationMethodIfSeparatelyAuthorized': 'Verify every guard; change exactly the one policy field; require exact afterFileSha256; private inode/fsync/0644/os.replace; run unchanged native --check and compare all18 live hashes again.',
    }
    write(DOCS / 'math-final-three-duration-binding-guarded-plan-2026-11-06.json', binding_plan)
    result = {
        'schemaVersion': 1, 'status': 'final967a-technical-input-binding-native-equality-PASS-unapplied',
        'completedAtActual': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'classification': 'Technical AI review of unchanged layout semantics; existing didactic/scientific reviews are preserved and not reissued.',
        'baselineSource': pin(ROOT / SOURCE), 'candidateSourceSha256': sha(RAM / 'candidate-source.json'),
        'exactFiveFieldReconstruction': review['sourceFieldPlan'], 'baselinePolicy': pin(ROOT / POLICY),
        'candidatePolicy': pin(HERE / 'candidate-policy.json'), 'onlyPolicyChange': '/inputs/canonical/sha256',
        'originalKind': review['originalKind'], 'candidateKind': review['candidateKind'],
        'kindLabelsStatusesAndCountsUnchanged': True,
        'unchangedTemplates': {'sek1': 6, 'crossStage': 12, 'placements': 83},
        'all13BoundOriginalReviewFilesValidated': review['all13CurrentBoundOriginalReviewFilesValidated'],
        'all18BaselineCandidateLiveRawBytesEqual': True,
        'all18NativeTreeOrderFindingsTargetSupportAndFilteredAtomicSetsEqual': True,
        'appPayloadBoundary': native['payloadBoundary'],
        'allOtherAppPayloadFieldsEqual': True,
        'observed44DataPathSetsEqual': True,
        'onlyChangedObservedInputs': [SOURCE, KINDS, POLICY],
        'fourPositiveGenerateCheckExit0': True, 'originalPolicyCandidateSourceActuallyRed': True,
        'fourUnchangedNativeNegativeGuardsActuallyReject': [row['case'] for row in executions if row['case'] not in ['candidate-original-policy-red'] and row['exitCode'] == 1],
        'additionalPolicyPlacementEditRejectedBySeparateSingleFieldGuard': True,
        'guardedPlan': pin(DOCS / 'math-final-three-duration-binding-guarded-plan-2026-11-06.json'),
        'evidence': [pin(HERE / name) for name in ['execution.json', 'input-binding-review.json', 'output-comparison.json',
                     'native-layout-comparison.json', 'native-layout-execution.json', 'observed-generator-data-inputs.json', 'single-field-guard-control.json']],
        'historicalTemplateDigestBoundary': 'All old template digest metadata and descriptors remain unchanged. This technical review does not reinterpret or refresh historical template hashes or historical scientific reviews.',
        'noLiveSourceQaKindPolicyViewOrHistoricalReviewWrites': True,
        'noFullCqrDeepProducerOrMaturityPassClaimed': True,
        'integrationStillRequires': ['Separately authorized source/QA/registry changes with all fresh evidence and guards.',
                                     'General V original-receipt context binding and actual original-chain qualification.',
                                     'Actual whole-subject native QA and all unchanged hard graph/floor checks after authorized integration.'],
    }
    target = DOCS / 'math-final-three-duration-binding-technical-review-2026-11-06.json'
    write(target, result)
    print(json.dumps({'result': pin(target), 'guardedPlan': result['guardedPlan']}))


if __name__ == '__main__':
    main()
