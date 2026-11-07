#!/usr/bin/env python3
"""Transport the externally fixed, finite V-context index through the existing raw Git kernel.

This selector supplies the actual reader's closed auxiliary input list. It does
not qualify reviews, select ready goals, or change the historical 18-case capsule.
"""
import json
import re

import visualization_review_git_capsule as kernel


# Closed external transports: historical54 and its separately qualified Math3 successor.
_ACCEPTED_INDEXES = {
    '3421fa1a64b0c9ccac607bd283fabc3aeeb2391aec6cad0118f317d81c87742e':
        ('6fe35a6b0fa807e5a97475b34f3715dc16a89c00', 54),
    '46416dd5939db442dd82c9905008cb89c79dbe9db08e9b19b03f10cde7fd3fd0':
        ('25a6f2164a81a7e6ae50db3557d20521fecf5124', 57),
}


def index_originals(root, index_path, accepted_index):
    kernel.require(accepted_index in _ACCEPTED_INDEXES, 'Unknown fixed reviewed-context transport')
    expected_anchor, expected_count = _ACCEPTED_INDEXES[accepted_index]
    def unique_object(pairs):
        value = {}
        for key, item in pairs:
            kernel.require(key not in value, 'Duplicate index JSON property')
            value[key] = item
        return value
    index = json.loads(kernel.read_bound(root, index_path, accepted_index), object_pairs_hook=unique_object)
    kernel.require(set(index) == {'schemaVersion', 'kind', 'acceptedRepositoryCommit', 'rows',
                                  'originalReferences', 'newReviewClaimed', 'runtimeActivationAllowed'},
                   'Unknown or missing reviewed-context index field')
    kernel.require(index['schemaVersion'] == 1 and index['kind'] == 'externally-pinned-reviewed-visualization-context-index'
                   and index['newReviewClaimed'] is False and index['runtimeActivationAllowed'] is False,
                   'Wrong reviewed-context index contract')
    kernel.require(re.fullmatch('[0-9a-f]{40}', index['acceptedRepositoryCommit']) is not None,
                   'Invalid original-history anchor')
    kernel.require(index['acceptedRepositoryCommit'] == expected_anchor, 'Crossed fixed original-history anchor')
    refs, receipts, working, goals = {}, [], {}, set()
    def digest(value):
        kernel.require(isinstance(value, str) and re.fullmatch('[0-9a-f]{64}', value) is not None, 'Invalid input SHA256')
    def add_working(path, value):
        digest(value)
        raw = kernel.read_bound(root, path, value)
        row = {'path': path, 'sha256': value, 'bytes': len(raw)}
        kernel.require(path not in working or working[path] == row, 'Conflicting original working input')
        working[path] = row
    add_working(index_path, accepted_index)
    kernel.require(isinstance(index['rows'], list) and len(index['rows']) == expected_count, 'The fixed reviewed-context transport count differs')
    for row in index['rows']:
        kernel.require(set(row) == {'landscapeId', 'goalId', 'receipt'}
                       and isinstance(row['landscapeId'], str) and isinstance(row['goalId'], str), 'Invalid owner/goal row')
        key = (row['landscapeId'], row['goalId'])
        kernel.require(key not in goals, 'Duplicate owner/goal qualification')
        goals.add(key)
        receipt = row['receipt']
        kernel.require(set(receipt) == {'path', 'sha256'}, 'Invalid qualification reference')
        add_working(receipt['path'], receipt['sha256'])
        receipts.append(receipt)
    kernel.require(len({row['path'] for row in receipts}) == len(receipts), 'Duplicate qualification locator')
    kernel.require(isinstance(index['originalReferences'], list) and index['originalReferences'], 'Empty original closure')
    for row in index['originalReferences']:
        kernel.require(set(row) == {'path', 'gitCommit', 'sha256', 'currentCopyRequired'}
                       and type(row['currentCopyRequired']) is bool, 'Invalid original auxiliary binding')
        kernel.relative(row['path']); digest(row['sha256'])
        kernel.require(isinstance(row['gitCommit'], str) and re.fullmatch('[0-9a-f]{40}', row['gitCommit']) is not None,
                       'Invalid original artifact commit')
        ref = {field: row[field] for field in ('path', 'gitCommit', 'sha256')}
        key = (ref['gitCommit'], ref['path'])
        kernel.require(key not in refs, 'Duplicate original auxiliary binding')
        refs[key] = ref
        if row['currentCopyRequired']:
            add_working(ref['path'], ref['sha256'])
    return index, [refs[key] for key in sorted(refs)], receipts, [working[path] for path in sorted(working)]


if __name__ == '__main__':
    # Only the closed input selector changes. Raw OID, ancestry, path inclusion,
    # exact object inventory, own-inode and resource checks remain the same code.
    kernel.originals = index_originals
    kernel.main()
