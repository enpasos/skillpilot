#!/usr/bin/env python3
# SPDX-License-Identifier: Apache-2.0
"""Check authored Mathematics course pairs before the actual Java merge."""
import argparse
import json
import re
from pathlib import Path

from legacy_composition_view import read_composition_view

ID_PROFILE = re.compile(r'(^|[-_.:])(gk|lk|grundkurs|leistungskurs)(?=$|[-_.:])', re.I)
LABEL_PROFILE = re.compile(r'\b(?:Grundkurs|Leistungskurs|GK|LK)\b', re.I)


def identity(value):
    return ID_PROFILE.sub(lambda match: match[1] + '{profile}', value).lower()


def inspect_pair(left, right):
    """Mirror strict structure identity, metadata and after-union obligations."""
    issues, records = [], {}
    for view in (left, right):
        own_ids = set()
        def visit(nodes, path=()):
            for node in nodes:
                if node['kind'] != 'structure':
                    continue
                key = identity(node['id'])
                if key in own_ids:
                    issues.append(dict(kind='duplicateIdentity', viewId=view['viewId'], id=key))
                own_ids.add(key)
                metadata = {k: v for k, v in node.items() if k not in ('id', 'children', 'childOrder', 'label')}
                label = LABEL_PROFILE.sub('{profile}', node['label']).lower()
                record = records.setdefault(key, dict(path=path, metadata=metadata, label=label, children=set(), edges=set()))
                for field, value in [('path', path), ('metadata', metadata), ('label', label)]:
                    if record[field] != value:
                        issues.append(dict(kind=field, id=key, left=record[field], right=value))
                children = {identity(child['id']) for child in node['children'] if child['kind'] == 'structure'}
                record['children'].update(children)
                for edge in node.get('childOrder', {}).get('after', []):
                    source, target = identity(edge['after']), identity(edge['unit'])
                    if source not in children or target not in children:
                        issues.append(dict(kind='nonsiblingOrder', id=key, edge=edge))
                    record['edges'].add((source, target))
                visit(node['children'], path + (key,))
        visit(view['rootNodes'])
    for key, record in records.items():
        pending = set(record['children'])
        while pending:
            ready = {node for node in pending if not any(target == node and source in pending for source, target in record['edges'])}
            if not ready:
                issues.append(dict(kind='combinedOrderCycle', id=key, children=sorted(pending)))
                break
            pending.difference_update(ready)
    return issues


def check(directory):
    paths = sorted(Path(directory).glob('*.view.json'))
    pairs = []
    for path in paths:
        if '-gk' not in path.name:
            continue
        other = path.with_name(path.name.replace('-gk', '-lk'))
        if not other.exists():
            raise ValueError('Missing Mathematics course pair: ' + str(other))
        left, right = (read_composition_view(p) for p in (path, other))
        pairs.append(dict(gk=path.name, lk=other.name, issues=inspect_pair(left, right)))
    if len(paths) != 100 or len(pairs) != 40:
        raise ValueError(f'Incomplete Mathematics inventory: {len(paths)} views, {len(pairs)} pairs')
    return pairs


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--input-dir', type=Path, default=Path(__file__).resolve().parents[1] / 'curricula/DE/Gymnasium/composition-views/mathematik')
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    pairs = check(args.input_dir)
    count = sum(len(pair['issues']) for pair in pairs)
    if args.report:
        args.report.parent.mkdir(parents=True, exist_ok=True)
        args.report.write_text(json.dumps(dict(views=100, pairs=40, issueCount=count, results=pairs), ensure_ascii=False, indent=2) + '\n')
    print(f'Mathematics course-pair structure contract: {count} issues / 40 pairs / 100 views')
    raise SystemExit(bool(count))


if __name__ == '__main__':
    main()
