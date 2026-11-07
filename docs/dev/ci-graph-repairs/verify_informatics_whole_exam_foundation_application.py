#!/usr/bin/env python3
"""Read-only replay of the reviewed 39 prerequisites and 166 derived jurisdictions."""
import argparse
import copy
import hashlib
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
BASE = Path(__file__).resolve().parent
ROOT = BASE.parents[2]
sys.path.insert(0, str(BASE))
import verify_informatics_whole_exam_foundation_hypothesis as proof

BASE_COMMIT = 'd9f42e6f0729d7e76a0d740482c1a8444da08e76'
EXPECTED_OUTPUT = '93a653b110949ff410a73bd750b2a605a9ab0329fe1cd157f016869d848e1f7e'


def original(binding):
    raw = subprocess.check_output(['git', 'show', BASE_COMMIT + ':' + binding['path']], cwd=ROOT)
    assert proof.sha(raw) == binding['sha256'], 'Original input pin differs: ' + binding['path']
    return raw


def reconstruct():
    manifest = json.loads(proof.PROPOSAL.read_bytes())
    demand = json.loads(proof.DEMAND.read_bytes())
    assert proof.sha(proof.PROPOSAL.read_bytes()) == demand['proposal']['sha256']
    proof.pinned(manifest['previousHypothesis'])
    proof.pinned(demand['helper'])
    assert proof.sha(proof.canonical_json.stable(manifest['operations'])) == manifest['operationCanonicalSha256']
    source = json.loads(original(manifest['source']))
    candidate = copy.deepcopy(source)
    assert len(manifest['operations']) == 39
    for operation in manifest['operations']:
        pieces = operation['path'].split('/')
        assert operation['file'] == manifest['source']['path'] and operation['op'] == 'replace'
        assert len(pieces) == 4 and pieces[:2] == ['', 'goals'] and pieces[3] == 'requires'
        goal = candidate['goals'][int(pieces[2])]
        assert goal['id'] == operation['guardGoalId']
        assert proof.sha(proof.canonical_json.stable(goal)) == operation['guardGoalCanonicalSha256']
        assert goal['requires'] == operation['guardRequiresBefore']
        goal['requires'] = copy.deepcopy(operation['value'])
    raw39 = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
    assert proof.sha(raw39) == manifest['hypotheticalOutput']['sha256']
    applicability = json.loads((BASE / 'informatics-whole-exam-foundation-successor-applicability-impact-2026-11-06.json').read_bytes())
    proof.pinned(applicability['compiler'])
    by_id = {goal['id']: goal for goal in candidate['goals']}
    rows = applicability['deltasWithOriginalCompilerEvidence']
    assert len(rows) == 166 and len({row['goalId'] for row in rows}) == 166
    assert applicability['changedDimensions'] == ['jurisdiction']
    for row in rows:
        goal = by_id[row['goalId']]
        assert goal.get('applicability', {}) == row['before']
        assert set(row['before']) | set(row['after']) == {'jurisdiction'}
        goal['applicability'] = copy.deepcopy(row['after'])
    rendered = (json.dumps(candidate, ensure_ascii=False, indent=2) + '\n').encode()
    assert proof.sha(rendered) == EXPECTED_OUTPUT, '39+166 candidate differs from the independent scope review'
    assert len(source['goals']) == len(candidate['goals'])
    for before, after in zip(source['goals'], candidate['goals']):
        assert {k: v for k, v in before.items() if k not in ('requires', 'applicability')} == {
            k: v for k, v in after.items() if k not in ('requires', 'applicability')}
    documents = [json.loads(original(binding)) for binding in demand['catalogSources']]
    assert len(documents) == 21
    owner = manifest['source']['landscapeId']
    before, bg, ba, bc = proof.relations(documents)
    after, ag, aa, ac = proof.relations([
        candidate if document['landscapeId'] == owner else document for document in documents])
    assert before.keys == after.keys and before.atom_keys == after.atom_keys
    for keys, old, new, field in [(before.keys, bg, ag, 'globalGoalDeltas'),
                                  (before.atom_keys, ba, aa, 'globalAtomicDeltas')]:
        actual = proof.changes(keys, old, new)
        recorded = [{key: row[key] for key in ('sourceKey', 'removed', 'added')} for row in demand[field]]
        assert actual == recorded, 'Global demand differs: ' + field
        assert all(row['sourceKey'].startswith(owner + ':') for row in actual)
    assert bc == ac == demand['cycleComponentCountsBefore'] == demand['cycleComponentCountsAfter']
    return manifest, demand, rendered


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--verify-active', action='store_true')
    args = parser.parse_args()
    manifest, demand, rendered = reconstruct()
    if args.verify_active:
        assert (ROOT / manifest['source']['path']).read_bytes() == rendered, 'Active source differs from reviewed 39+166 candidate'
        for binding in demand['catalogSources']:
            if binding['path'] != manifest['source']['path']:
                proof.pinned(binding)
    print(json.dumps({'status': 'PASS-read-only-39-plus-166-replay', 'activeVerified': args.verify_active,
                      'baseCommit': BASE_COMMIT, 'sourceFiles': 21, 'requiresArrays': 39,
                      'derivedJurisdictions': 166, 'outputSha256': hashlib.sha256(rendered).hexdigest(),
                      'changedGoalSources': 142, 'changedAtomicSources': 154, 'foreignChanges': 0,
                      'newReviewApprovalClaimed': False}))


if __name__ == '__main__':
    main()
