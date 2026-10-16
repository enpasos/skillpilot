#!/usr/bin/env python3
"""Mechanical selected-whole integration. Default read-only; science is external."""
from pathlib import Path
import argparse, datetime, hashlib, json

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
V = T / 'HE-admission-A-B-informed-author-successor-v2'
S = V / 'OUTPUTS.nine-wholes-five-views-A-B-informed-author-v2.selector.json'
C = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
M = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
load = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
ref = lambda p: {'path': str(p.relative_to(R)), 'sha256': sha(p)}

def own_write(relative, value):
    assert not relative.is_absolute() and '..' not in relative.parts
    parent = L
    for part in relative.parts[:-1]:
        parent = parent / part
        if parent.is_symlink():
            children = list(parent.resolve(strict=True).iterdir())
            parent.unlink()
            parent.mkdir()
            for child in children:
                (parent / child.name).symlink_to(child)
        elif not parent.exists():
            parent.mkdir()
    assert parent.resolve().is_relative_to(L.resolve())
    dest = L / relative
    if dest.exists() or dest.is_symlink():
        dest.unlink()
    dest.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert dest.stat().st_nlink == 1

def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument('--apply', action='store_true')
    ap.add_argument('--final-addenda', action='store_true')
    ap.add_argument('--review-a', type=Path, nargs='+')
    ap.add_argument('--review-b', type=Path, nargs='+')
    args = ap.parse_args()
    assert sha(S) == 'sha256:d7c8cd68b2500bb803574bd3509e842d3654577a32261297eb3352d121afb957'
    sel = load(S)
    for value in sel.values():
        if isinstance(value, dict) and 'path' in value and 'sha256' in value:
            assert sha(R / value['path']) == value['sha256']
    can = load(L / C)
    assert len(can['goals']) == 640
    by = {x['id']: x for x in can['goals']}
    new459 = by['459724db-9f9a-5967-8d9a-2b6277415275']
    goals = load(R / sel['wholeGoalCAS']['path'])['operations']
    changes = []
    for op in goals:
        assert by[op['goalId']] == op['before']
        changes.append({'goalId': op['goalId'], 'changedFields': sorted(k for k in set(op['before']) | set(op['after']) if op['before'].get(k) != op['after'].get(k))})
        by[op['goalId']] = op['after']
    can['goals'] = [by[g['id']] for g in can['goals']]
    assert by[new459['id']] == new459
    writes = {C: can}
    views = load(R / sel['fourHEViewCAS']['path'])['operations'] + [load(R / sel['separateOneBYLKViewCAS']['path'])]
    for op in views:
        path = Path(op['path'])
        assert load(L / path) == op['before']
        writes[path] = op['after']
    sem = load(L / M)
    for op in load(R / sel['semanticBindingCAS']['path'])['operations']:
        assert sem['decisions'][op['decisionIndex']] == op['before']
        sem['decisions'][op['decisionIndex']] = op['after']
    writes[M] = sem
    source7 = load(T / 'common-recycling-image-author-v1/EXECUTION.actual-reviewed-common-source7-private-L6.receipt.json')
    known7 = {row['logicalPath']: row['after'] for row in source7['files']}
    cells = load(R / sel['retainedAromaticSourceCells']['path'])['operations'] + [load(R / sel['separateOneBYSourceCellCAS']['path'])]
    for op in cells:
        raw = Path(op['mapping']['path'])
        path = Path(*raw.parts[raw.parts.index('curricula'):])
        assert sha(L / path) in (op['mapping']['sha256'], known7.get(str(path)))
        doc = load(L / path)
        sid = op['before']['decision']['sourceGoalId']
        indices = [i for i, row in enumerate(doc['mappings']) if row['legacyGoalId'] == sid]
        assert indices == op['mappingRowIndices']
        assert [doc['mappings'][i] for i in indices] == op['before']['mappings']
        assert doc['decisions'][op['decisionIndex']] == op['before']['decision']
        out = []
        for i, row in enumerate(doc['mappings']):
            if i == indices[0]:
                out.extend(op['after']['mappings'])
            if i not in indices:
                out.append(row)
        doc['mappings'] = out
        doc['decisions'][op['decisionIndex']] = op['after']['decision']
        writes[path] = doc
    addenda_refs = []
    if args.final_addenda:
        ar = T / 'HE-recycling-routes-and-BY-two-prior-bounded-author-addenda-v1'
        sources = [
            (ar / 'OUTPUTS.FINAL.recycling-five-wholes-eight-views.AUTHOR.selector.json', 'sha256:539b5daf600ca14e7519db21ae15d2b0184c77f764d39645018b405b81953444'),
            (ar / 'OUTPUTS.FINAL.BY-0cf2-4928-one-view-two-source-cells.AUTHOR.selector.json', 'sha256:cee6d7bfaf8b36785f39f3aa571888f6e598395d240e322a37dfe7c7c821fde4'),
        ]
        loaded = []
        for path, expected in sources:
            assert sha(path) == expected
            data = load(path)
            for value in data.values():
                if isinstance(value, dict) and 'path' in value and 'sha256' in value:
                    assert sha(R / value['path']) == value['sha256']
            loaded.append(data)
            addenda_refs.append(ref(path))
        rec, bav = loaded
        extra_goals = load(R / rec['fiveWholeGoalCAS']['path'])['operations'] + [load(R / bav['oneWhole0cf2GoalCAS']['path'])]
        for op in extra_goals:
            assert by[op['goalId']] == op['before']
            changes.append({'goalId': op['goalId'], 'stage': 'paired-addendum', 'changedFields': sorted(k for k in set(op['before']) | set(op['after']) if op['before'].get(k) != op['after'].get(k))})
            by[op['goalId']] = op['after']
        can['goals'] = [by[g['id']] for g in can['goals']]
        extra_views = load(R / rec['fourHEViewCAS']['path'])['operations'] + load(R / rec['fourGenericDEViewCAS']['path'])['operations'] + [load(R / bav['oneBYLKViewCAS']['path'])]
        for op in extra_views:
            path = Path(op['path'])
            assert writes.get(path, load(L / path)) == op['before']
            writes[path] = op['after']
        for op in load(R / rec['fiveSemanticSourceBindingCAS']['path'])['operations'] + load(R / bav['oneSemanticSourceBindingCAS']['path'])['operations']:
            index = next(i for i, row in enumerate(sem['decisions']) if row['goalId'] == op['goalId'])
            assert sem['decisions'][index] == op['before']
            sem['decisions'][index] = op['after']
        cs = load(R / bav['twoWholeBYSourceCellCAS']['path'])
        raw = Path(cs['mapping']['path'])
        path = Path(*raw.parts[raw.parts.index('curricula'):])
        doc = writes.get(path, load(L / path))
        for op in cs['operations']:
            sid = op['sourceGoalId']
            indices = [i for i, row in enumerate(doc['mappings']) if row['legacyGoalId'] == sid]
            assert [doc['mappings'][i] for i in indices] == op['before']['mappings']
            assert doc['decisions'][op['decisionIndex']] == op['before']['decision']
            out = []
            for i, row in enumerate(doc['mappings']):
                if i == indices[0]:
                    out.extend(op['after']['mappings'])
                if i not in indices:
                    out.append(row)
            doc['mappings'] = out
            doc['decisions'][op['decisionIndex']] = op['after']['decision']
        writes[path] = doc
    receipt = {'role': 'Mechanical exact selected-whole integration; no new scientific vote', 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'selector': ref(S), 'goalChanges': changes, 'wholeViews': len(views), 'sourceCells': len(cells), 'canonicalGoals': 640, 'new459WholeUnchanged': True, 'reviewedSource7OtherCellDeltaRetained': True, 'normalWrites': 0, 'HumanApproval': False, 'M7Claim': False}
    receipt['finalAddenda'] = addenda_refs
    receipt['uniqueExistingChangedGoalIds'] = sorted({row['goalId'] for row in changes})
    receipt['uniqueFinalViews'] = [str(path) for path in writes if '/composition-views/' in str(path)]
    receipt['wholeViews'] = len(receipt['uniqueFinalViews'])
    receipt['sourceCells'] += 2 if args.final_addenda else 0
    baseline = load(T / 'chemie-combined639-source8-reviewed-integration-capsule-L5-v1' / C)
    baseline_by = {row['id']: row for row in baseline['goals']}
    allowed = set(receipt['uniqueExistingChangedGoalIds']) | {'6b6bceca-e1d9-56f7-ae6c-d7f7c2fa9338'}
    assert all(row == by[key] for key, row in baseline_by.items() if key not in allowed)
    receipt['unmodifiedExistingWholeGoalsExact'] = len(baseline_by) - len(allowed)
    normal_before = sha(R / C)
    if not args.apply:
        print(json.dumps({**receipt, 'mode': 'CHECK_ONLY', 'plannedOwnedFiles': len(writes)}))
        return
    assert args.review_a and args.review_b
    receipt['independentFollowups'] = {'a': [ref(path.resolve()) for path in args.review_a], 'b': [ref(path.resolve()) for path in args.review_b]}
    receipt['files'] = [{'path': str(p), 'before': sha(L / p)} for p in writes]
    for path, value in writes.items():
        own_write(path, value)
    for row in receipt['files']:
        row['after'] = sha(L / row['path'])
    assert sha(R / C) == normal_before
    receipt['normalCanonicalUnchangedSHA256'] = normal_before
    out = T / 'HE-v2-reviewed-L6-private-integration.actual.json'
    assert not out.exists()
    out.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
    print(json.dumps({'mode': 'APPLIED_PRIVATE_L6', 'ownedFiles': len(writes), 'receipt': ref(out), 'canonicalAfter': sha(L / C)}))

if __name__ == '__main__':
    main()
