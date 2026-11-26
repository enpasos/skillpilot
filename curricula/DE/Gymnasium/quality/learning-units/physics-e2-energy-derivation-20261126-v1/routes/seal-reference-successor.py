#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Bind N's exact reference-place delta while keeping H's immutable pin."""
import hashlib
import json
from collections import Counter
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OUTPUT = Path(__file__).with_name('h-reference-place-successor.actual.json')
BASELINE = ROOT / 'curricula/DE/Gymnasium/quality/learning-units/e2-impuls-newton2-bindings-20261125-v1/views/lower-closures-v4/baseline-reference-places.actual.json'
BASE_COMMIT = '284063239db536f4b765d700db3a39a357fd7f12'
# H's final current task was an explicit addition over this reference baseline.
H_ADDITIONS = {'d8fc6295-d0db-59e5-bd90-080bbc508c3a'}


def references(view):
    found = []
    def visit(nodes, trail=()):
        for node in nodes:
            if node['kind'] == 'structure':
                visit(node['children'], (*trail, node['id']))
            elif node.get('goalId') not in H_ADDITIONS:
                found.append({'path': list(trail), 'reference': node})
    visit(view['rootNodes'])
    return found


def canonical(value):
    return json.dumps(value, ensure_ascii=True, sort_keys=True, separators=(',', ':'))


def digest(value):
    return hashlib.sha256(canonical(value).encode()).hexdigest()


baseline = json.loads(BASELINE.read_text())
changed = []
for row in baseline['views']:
    path = row['path']
    before = references(json.loads(subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + path], cwd=ROOT)))
    if len(before) != row['referenceCount'] or digest(before) != row['orderedReferencePlacesSha256']:
        raise ValueError('N predecessor does not reproduce the immutable H reference pin: ' + path)
    after = references(json.loads((ROOT / path).read_text()))
    if before == after:
        continue
    previous, current = Counter(map(canonical, before)), Counter(map(canonical, after))
    changed.append({'path': path, 'beforeReferenceCount': len(before),
        'beforeOrderedReferencePlacesSha256': digest(before), 'afterReferenceCount': len(after),
        'afterOrderedReferencePlacesSha256': digest(after),
        'removedExactReferences': [json.loads(item) for item, n in sorted((previous - current).items()) for _ in range(n)],
        'addedExactReferences': [json.loads(item) for item, n in sorted((current - previous).items()) for _ in range(n)],
        'changedOrderPositions': [{'index': index, 'before': old, 'after': new}
            for index, (old, new) in enumerate(zip(before, after)) if old != new]
            if previous == current else []})
result = {'schema': 'physics-e2-energy-exact-reference-successor-v1', 'baseCommit': BASE_COMMIT,
    'predecessorPath': str(BASELINE.relative_to(ROOT)),
    'predecessorSha256': hashlib.sha256(BASELINE.read_bytes()).hexdigest(),
    'method': 'Every predecessor view first reproduces H exact reference-count and ordered-location digest. Only the explicit N successor views change their exact count/digest; each added/removed reference and path is listed. Other views retain H without exceptions. H and all source authority records remain byte-identical.',
    'viewCount': len(baseline['views']), 'changedViewCount': len(changed), 'views': changed}
OUTPUT.write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n')
print(str(OUTPUT.relative_to(ROOT)) + ': ' + str(len(changed)) + ' exact successors over 90 H pins')
