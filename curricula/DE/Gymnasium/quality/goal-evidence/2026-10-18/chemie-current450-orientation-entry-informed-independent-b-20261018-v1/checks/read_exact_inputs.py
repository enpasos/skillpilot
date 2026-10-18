# SPDX-License-Identifier: Apache-2.0
"""Lossless repeated-value reading aid. No review decisions."""
import hashlib
import json
import sys
from pathlib import Path

P = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18/chemie-current450-twenty-seven-orientation-entry-author-20261018-v1')
goals = json.loads((P / 'AUTHOR.27-orientation-entry-requires-only.pending.json').read_text())['records']
profiles = {r['goalId']: r for r in json.loads((P / 'INPUT.actual-current27-whole-positive-evidence.json').read_text())}
seen = {}

def compact(value, path):
    if isinstance(value, (dict, list)) or isinstance(value, str) and len(value) > 100:
        serial = json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
        if len(serial) > 100:
            key = hashlib.sha256(serial.encode()).hexdigest()
            if key in seen:
                return {'EXACT_VALUE_ALREADY_PRINTED_AT': seen[key]}
            seen[key] = path
    if isinstance(value, dict):
        return {k: compact(v, f'{path}/{k}') for k, v in value.items()}
    if isinstance(value, list):
        return [compact(v, f'{path}/{i}') for i, v in enumerate(value)]
    return value

mode, start, end = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
for index in range(start, end):
    row = goals[index]
    print('INDEX', index, 'GOAL', row['goalId'])
    if mode == 'goals':
        before, after = row['beforeWholeGoal'], row['proposedWholeGoal']
        print('WHOLE BEFORE:', json.dumps(compact(before, f'goal-{index}'), ensure_ascii=False))
        same = {k: v for k, v in before.items() if k != 'requires'} == {k: v for k, v in after.items() if k != 'requires'}
        print('PROPOSED REST EXACT:', same, 'REQUIRES:', after['requires'])
    else:
        print('WHOLE P:', json.dumps(compact(profiles[row['goalId']], f'P-{index}'), ensure_ascii=False))
