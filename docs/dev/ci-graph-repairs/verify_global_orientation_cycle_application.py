#!/usr/bin/env python3
"""Verify the exact reviewed five-array repair in the current canonical context."""
import copy
import json
from pathlib import Path
import subprocess
import sys

sys.dont_write_bytecode = True
HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
sys.path.insert(0, str(HERE))
import verify_math_pilot_repairs as graph

BASE = '91a30521d6ba198cc214e15ab2bfb5dfdad2a0a4'
PROPOSAL = HERE / 'global-orientation-cycles-review-2026-11-06.json'
PROPOSAL_SHA = '8316f7cc2cbee4836aa54adce36571c9cee6074a212dce61cc33b27623c5c124'
OUTPUTS = {
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_GRIECHISCH.de.json': '0b0fa8e4573b27113502ed1e1dc3561a8012da31169860c9570f5a3d13261162',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHINESISCH.de.json': 'da6392e33d698952cc287ba7c5d4cf7464c5832f301225de1f002aa3802b3237',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_FRANZOESISCH.de.json': 'effc98ba4f4bf67b4edd8cff48a5b9962a10493521db24fa2a98eac73c0c1498',
}


def verify():
    assert graph.graph.sha256(PROPOSAL.read_bytes()) == PROPOSAL_SHA
    proposal = json.loads(PROPOSAL.read_bytes())
    documents, active_bindings = [], []
    for path in sorted((ROOT / 'curricula/DE/Gymnasium/canonical').glob('*.de.json')):
        relative = path.relative_to(ROOT).as_posix()
        active = path.read_bytes()
        active_bindings.append({'path': relative, 'sha256': graph.graph.sha256(active)})
        raw = subprocess.check_output(['git', 'show', BASE + ':' + relative], cwd=ROOT) if relative in OUTPUTS else active
        documents.append(json.loads(raw))
    assert len(documents) == 21
    before_documents = copy.deepcopy(documents)
    by_id = {document['landscapeId']: document for document in documents}
    assert len(proposal['operations']) == 5
    for operation in proposal['operations']:
        document = by_id[operation['source']['landscapeId']]
        raw = subprocess.check_output(['git', 'show', BASE + ':' + operation['source']['path']], cwd=ROOT)
        assert graph.graph.sha256(raw) == operation['source']['sha256']
        goal = document['goals'][int(operation['path'].split('/')[2])]
        assert operation['operation'] == 'replace' and operation['path'].endswith('/requires')
        assert goal['id'] == operation['guardGoalId']
        assert goal['requires'] == operation['guardRequiresBefore']
        assert graph.graph.sha256(graph.graph.stable(goal)) == operation['guardGoalCanonicalJsonSha256']
        goal['requires'] = operation['value']
    for document in documents:
        path = next((path for path in OUTPUTS if json.loads((ROOT / path).read_bytes())['landscapeId'] == document['landscapeId']), None)
        if path is None:
            continue
        raw = (json.dumps(document, ensure_ascii=False, indent=2) + '\n').encode()
        assert graph.graph.sha256(raw) == OUTPUTS[path]
        assert (ROOT / path).read_bytes() == raw
    before, _, bg, ba, bc = graph.relations(before_documents)
    after, _, ag, aa, ac = graph.relations(documents)
    assert before.keys == after.keys and before.atom_keys == after.atom_keys
    assert bc == (3, 3) and ac == (0, 0)
    goal = graph.deltas(before.keys, bg, ag)
    atomic = graph.deltas(before.atom_keys, ba, aa)
    assert goal == proposal['fullGlobalDeltas']['goalClosure']
    assert atomic == proposal['fullGlobalDeltas']['atomicClosure']
    assert all(not row['added'] for row in goal + atomic)
    assert sum(len(row['removed']) for row in goal) == 6
    assert sum(len(row['removed']) for row in atomic) == 3
    for old, new in zip(before_documents, documents):
        assert len(old['goals']) == len(new['goals'])
        for first, second in zip(old['goals'], new['goals']):
            assert {k: v for k, v in first.items() if k != 'requires'} == {
                k: v for k, v in second.items() if k != 'requires'}
    assert all(graph.graph.sha256((ROOT / row['path']).read_bytes()) == row['sha256'] for row in active_bindings)
    return {'status': 'PASS-active-five-array-orientation-cycle-repair', 'activeVerified': True,
            'originalLanguageSnapshot': BASE, 'activeContextSources': active_bindings,
            'operations': 5, 'changedSources': 3, 'goalPairsRemoved': 6, 'atomicSelfPairsRemoved': 3,
            'beforeCycleComponents': bc, 'afterCycleComponents': ac,
            'allOtherAtomicClosuresEqual': True, 'goalDeltas': goal, 'atomicDeltas': atomic,
            'qaOrMaturityApprovalClaimed': False}


if __name__ == '__main__':
    print(json.dumps(verify(), ensure_ascii=False, indent=2))
