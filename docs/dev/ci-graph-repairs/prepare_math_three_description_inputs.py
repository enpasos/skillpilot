#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Stage the exact Math candidate and invoke unchanged native blind-input tools.

This prepares inputs only. It neither authors review records nor applies source
or active QA changes. The packet's output directory must not already exist.
"""
import copy
import hashlib
import json
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CONTROL = ROOT / 'tmp/math-three-description-preparer-20261106'
OUTPUT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06'
CONFIG = 'docs/dev/ci-graph-repairs/math-three-description-input-batch-2026-11-06.config.json'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
PEER = 'docs/dev/ci-graph-repairs/math-orientation-three-independent-review-2026-11-06.json'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    CONTROL.mkdir(exist_ok=False)
    OUTPUT.mkdir(exist_ok=False)
    peer = json.loads((ROOT / PEER).read_bytes())
    if sha(ROOT / PEER) != '34b9a418e4afa57e40434797c753b7804c1e728df6f1288c322d5f8b29bd4c72':
        raise ValueError('Independent judgments changed')
    plan = json.loads((ROOT / 'docs/dev/ci-graph-repairs/math-orientation-three-normalization-plan-2026-11-06.json').read_bytes())
    candidate = CONTROL / 'candidate.json'
    command = ['python3', '-B', str(ROOT / 'docs/dev/ci-graph-repairs/prepare_math_orientation_three_normalization.py'), '--candidate-out', str(candidate)]
    with (CONTROL / 'source-reconstruction.json').open('wb') as stream:
        subprocess.run(command, check=True, stdout=stream)
    if sha(candidate) != 'b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd':
        raise ValueError('Candidate differs')
    original_ledger = json.loads((ROOT / KINDS).read_bytes())
    ledger = copy.deepcopy(original_ledger)
    judgments = {case['goalId']: case['freshIndependentKindJudgment']['proposedSchemaValidDecision'] for case in peer['cases']}
    if set(judgments) != {operation['guardGoalId'] for operation in plan['operations']}:
        raise ValueError('Exactly the three independently judged kinds are required')
    for index, row in enumerate(ledger['decisions']):
        if row['goalId'] in judgments:
            ledger['decisions'][index] = judgments[row['goalId']]
    seed = CONTROL / 'kind-ledger.json'
    seed.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n')
    original_pins = plan['catalogSources'] + [{'path': KINDS, 'sha256': sha(ROOT / KINDS)}]
    commands = []
    for mode in ['prepare', 'check']:
        for binding in original_pins:
            if sha(ROOT / binding['path']) != binding['sha256']:
                raise ValueError('Original source/QA changed: ' + binding['path'])
        cmd = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
               '--bind', str(OUTPUT), str(OUTPUT), '--bind', str(CONTROL), str(CONTROL),
               '--ro-bind', str(candidate), str(ROOT / SOURCE), '--ro-bind', str(seed), str(ROOT / KINDS),
               '--chdir', str(ROOT), '--', str(ROOT / 'app/node_modules/.bin/tsx'),
               'app/scripts/materializeGoalDescriptionRolloutBatch.ts', mode, '--config', CONFIG]
        started = time.monotonic()
        with (CONTROL / (mode + '.stdout.log')).open('wb') as out, (CONTROL / (mode + '.stderr.log')).open('wb') as err:
            result = subprocess.run(cmd, stdout=out, stderr=err)
        row = {'mode': mode, 'exitCode': result.returncode, 'seconds': time.monotonic() - started, 'command': cmd}
        commands.append(row)
        print(json.dumps({k: v for k, v in row.items() if k != 'command'}), flush=True)
        (CONTROL / 'execution.json').write_text(json.dumps(commands, indent=2) + '\n')
        if result.returncode:
            raise SystemExit(result.returncode)
        for binding in original_pins:
            if sha(ROOT / binding['path']) != binding['sha256']:
                raise ValueError('Original source/QA changed during preparation')
    (CONTROL / 'binding-receipt.json').write_text(json.dumps({'candidateSha256': sha(candidate), 'originalKindLedgerSha256': sha(ROOT / KINDS),
        'privateKindSeedSha256': sha(seed), 'independentPeerSha256': sha(ROOT / PEER), 'originalPinsBeforeAndAfter': original_pins,
        'activeSourceOrQaWrites': False, 'reviewRecordsAuthored': 0, 'nativeCliProducerBodiesUnmodified': True}, indent=2) + '\n')


if __name__ == '__main__':
    import sys
    sys.dont_write_bytecode = True
    main()
