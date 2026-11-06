#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Prepare a fresh neutral one-goal input on the exact submitted text variant.

Reads sealed earlier results only in the coordinator. Those results, judgments
and diffs are never copied into the new reviewer packet.
"""
import copy
import hashlib
import json
import subprocess
import time
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
CONTROL = ROOT / 'tmp/math-diagram-recheck-preparer-20261106'
RAM = Path('/dev/shm/skillpilot-math-diagram-revision-20261106')
OUTPUT = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-single-description-input-2026-11-06'
CONFIG = 'docs/dev/ci-graph-repairs/math-single-description-input-batch-2026-11-06.config.json'
SOURCE = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json'
KINDS = 'curricula/DE/Gymnasium/quality/release-model/mathematik.semantic-kinds.json'
GOAL = '0c2ddfcd-1399-41ad-aaed-4f061812602a'


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main():
    CONTROL.mkdir(exist_ok=False)
    RAM.mkdir(exist_ok=False)
    OUTPUT.mkdir(exist_ok=False)
    old_source = ROOT / 'tmp/math-three-description-preparer-20261106/candidate.json'
    if sha(old_source) != 'b2155f4167f104e5b8eef183f7bb9a7a792a873a9e5d009d5083e0bc84c68cfd':
        raise ValueError('Previously frozen source differs')
    source = json.loads(old_source.read_bytes())
    record_path = next((ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-input-2026-11-06/packet/round-b/results').glob('*.records.jsonl'))
    record = next(json.loads(line) for line in record_path.read_text().splitlines() if json.loads(line)['goalId'] == GOAL)
    if record['decision'] != 'revise':
        raise ValueError('The actual source record is not a revision')
    draft_path = ROOT / 'qa-artifacts/ci-contract-audit/2026-11-06/math-three-description-post-review/fresh-kind-atomicity-memory-drafts.json'
    if sha(draft_path) != '152bb5403140fe18adb8de1af8520cd1001b40c7f6d37aaa7657d6846fb95e9d':
        raise ValueError('Independent current-kind judgments changed')
    draft = json.loads(draft_path.read_bytes())
    goal = next(goal for goal in source['goals'] if goal['id'] == GOAL)
    if goal['description'] != record['currentDescriptionDe'] or goal['descriptionEn'] != record['currentDescriptionEn']:
        raise ValueError('Old text guards differ')
    if record['proposedDescriptionDe'] != draft['descriptionDe'] or record['proposedDescriptionEn'] != draft['descriptionEn']:
        raise ValueError('Selected actual text and independent judgment disagree')
    before = copy.deepcopy(goal)
    goal['description'] = record['proposedDescriptionDe']
    goal['descriptionEn'] = record['proposedDescriptionEn']
    candidate = RAM / 'candidate.json'
    candidate.write_text(json.dumps(source, ensure_ascii=False, indent=2) + '\n')
    (CONTROL / 'candidate.json').symlink_to(candidate)
    ledger = json.loads((ROOT / KINDS).read_bytes())
    decisions = {row['goalId']: row for row in draft['semanticKindDrafts']}
    if len(decisions) != 3:
        raise ValueError('Expected three actual independently reviewed kind drafts')
    for i, row in enumerate(ledger['decisions']):
        if row['goalId'] in decisions:
            ledger['decisions'][i] = decisions[row['goalId']]
    seed = RAM / 'kind-ledger.json'
    seed.write_text(json.dumps(ledger, ensure_ascii=False, indent=2) + '\n')
    (CONTROL / 'kind-ledger.json').symlink_to(seed)
    receipt = {'beforeSourceSha256': sha(old_source), 'candidateSha256': sha(candidate), 'sourceRecordPath': str(record_path.relative_to(ROOT)),
               'sourceRecordFileSha256': sha(record_path), 'goalId': GOAL, 'descriptionBeforeDe': before['description'],
               'descriptionBeforeEn': before['descriptionEn'], 'descriptionAfterDe': goal['description'], 'descriptionAfterEn': goal['descriptionEn'],
               'onlyChangedFieldsFromPriorCandidate': ['description', 'descriptionEn'], 'privateKindDraftPath': str(draft_path.relative_to(ROOT)),
               'privateKindDraftSha256': sha(draft_path), 'activeWrites': False}
    (CONTROL / 'source-revision-binding.json').write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    original_source_sha, original_kind_sha = sha(ROOT / SOURCE), sha(ROOT / KINDS)
    commands = []
    for mode in ['prepare', 'check']:
        cmd = ['bwrap', '--die-with-parent', '--unshare-net', '--ro-bind', '/', '/', '--proc', '/proc', '--dev', '/dev', '--tmpfs', '/tmp',
               '--ro-bind', str(RAM), str(RAM), '--bind', str(OUTPUT), str(OUTPUT), '--bind', str(CONTROL), str(CONTROL),
               '--ro-bind', str(candidate), str(ROOT / SOURCE), '--ro-bind', str(seed), str(ROOT / KINDS), '--chdir', str(ROOT), '--',
               str(ROOT / 'app/node_modules/.bin/tsx'), 'app/scripts/materializeGoalDescriptionRolloutBatch.ts', mode, '--config', CONFIG]
        started = time.monotonic()
        with (CONTROL / (mode + '.stdout.log')).open('wb') as out, (CONTROL / (mode + '.stderr.log')).open('wb') as err:
            code = subprocess.run(cmd, stdout=out, stderr=err).returncode
        commands.append({'mode': mode, 'exitCode': code, 'seconds': time.monotonic() - started, 'command': cmd})
        (CONTROL / 'execution.json').write_text(json.dumps(commands, indent=2) + '\n')
        print(json.dumps({k: v for k, v in commands[-1].items() if k != 'command'}), flush=True)
        if code:
            raise SystemExit(code)
        if sha(ROOT / SOURCE) != original_source_sha or sha(ROOT / KINDS) != original_kind_sha:
            raise ValueError('An active original source or ledger changed')
    command = ['python3', '-B', 'docs/dev/ci-graph-repairs/complete_math_three_description_packet.py',
               '--base', str(OUTPUT), '--control', str(CONTROL), '--expected-source-sha256', sha(candidate)]
    with (CONTROL / 'context.stdout.log').open('wb') as out, (CONTROL / 'context.stderr.log').open('wb') as err:
        subprocess.run(command, check=True, stdout=out, stderr=err)
    print(json.dumps({'status': 'neutral-single-goal-input-prepared-no-review-records', 'sourceSha256': sha(candidate),
                      'activeSourceSha256': original_source_sha, 'activeKindSha256': original_kind_sha,
                      'inputInventorySha256': sha(OUTPUT / 'input-inventory.json')}))


if __name__ == '__main__':
    import sys
    sys.dont_write_bytecode = True
    main()
