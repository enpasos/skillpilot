# SPDX-License-Identifier: Apache-2.0
"""Apply the exact paired candidate privately, preserving genuine review bodies."""
from pathlib import Path
from datetime import datetime, timezone
import copy
import hashlib
import json
import os
import sys

R = Path('/home/enpasos/projects/skillpilot')
T = R / 'tmp/chemie-m7-resumed-20261016'
L = T / 'chemie-shared640-recycling-native-author-capsule-L6-v1'
AUTHOR = T / 'generic-SekI-fourteen-interface-author-candidate-v1'
A = T / 'generic-SekI-two-priors-three-views-independent-a-v1'
B = T / 'generic-SekI-two-priors-three-views-independent-b-v1'
C = 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json'
S = 'curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json'
E = 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-16/'
OLD = E + 'chemie-current439-paired-two-priors-and-BB-BE-LK-private-L6-technical-20261016-v1/'
NEW = E + 'chemie-current439-paired-generic-SekI-and-NI-private-L6-technical-20261016-v1/'
CENTRAL = E + 'chemie-current439-new459-and-F03-native-two-private-L6-technical-20261016-v1/central.current439.new-two-D-complete.other-contexts-pending.private.config.json'
IDS = {'1c1420c2-a8e2-520f-8015-6df637a973bd', '1f30d81c-8a26-5675-8c0a-1cb82e96d3ba'}
read = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
encode = lambda j: (json.dumps(j, ensure_ascii=False, indent=2) + '\n').encode()
pin = lambda p: {'path': str(p.relative_to(R)), 'sha256': sha(p)}

assert len(sys.argv) in (3, 4), 'Usage: script B-selector-relative-path B-selector-sha256 [--apply]'
b_selector = R / sys.argv[1]
b_selector.relative_to(B)
assert sha(b_selector) == 'sha256:' + sys.argv[2].removeprefix('sha256:')
required = [
    (AUTHOR / 'OUTPUTS.FINAL.generic-SekI-fourteen-interfaces-and-two-NI-acquisition.AUTHOR.selector.json', 'fe2e63e1cf7ad5e0274214bc665b0f9ccb1b388dcb4c8ef928f5b5103f1a6156'),
    (A / 'OUTPUTS.two-priors-three-views.independent-a.sealed-selector.json', 'b5d036cccac80aa628021f76618aa6964dcee970eb6af68348b2b13ed13c4ccd'),
    (b_selector, sys.argv[2].removeprefix('sha256:')),
]
for p, digest in required:
    assert sha(p) == 'sha256:' + digest, p
assert sha(A / 'FIRST.two-priors-three-views.independent-a.science.frozen.json') == 'sha256:56b08b822082d8ab41677000a880a7f17567a897f57c00954d007155f3af5021'
assert sha(B / 'FIRST.independent-b.science.frozen.json') == 'sha256:92c1fd8b28739036cbc7b1e215abb13772dc4d3a4d08b0b2e92a65d0cbca84f9'
cas_path = AUTHOR / 'CAS.FINAL.two-whole-goals-three-whole-views-two-SEM-bindings.AUTHOR.inactive.json'
assert sha(cas_path) == 'sha256:14327a3ad640f5acaab16626aa645b8393c56978640be74dd10ffafc806396ca'
cas = read(cas_path)
normal = sha(R / C)
assert normal == 'sha256:9a68501347031f266572dea551e71c3507b66fb5ed94142a1a99f6a282708960'
assert sha(L / C) == cas['baselineCanonical']['sha256'] == 'sha256:37e092408007e0c8c675beda79b667e8dced936c7ec33742082340fcc77fdc80'
assert sha(L / S) == cas['baselineSEM']['sha256']
before = read(L / C)
can = copy.deepcopy(before)
by = {g['id']: g for g in can['goals']}
assert {op['goalId'] for op in cas['goalOperations']} == IDS
for op in cas['goalOperations']:
    assert by[op['goalId']] == op['before']
    assert op['changedFields'] == ['requires']
    assert {k: v for k, v in op['before'].items() if k != 'requires'} == {k: v for k, v in op['after'].items() if k != 'requires'}
    by[op['goalId']] = op['after']
can['goals'] = [by[g['id']] for g in before['goals']]
assert len(can['goals']) == 641
assert all(by[g['id']] == g for g in before['goals'] if g['id'] not in IDS)
sem = read(L / S)
sb = {r['goalId']: r for r in sem['decisions']}
for op in cas['semanticBindingOperations']:
    assert sb[op['goalId']] == op['before']
    sb[op['goalId']] = op['after']
sem['decisions'] = [sb[r['goalId']] for r in sem['decisions']]
assert sem['counts']['total'] == 641 and sem['counts']['curricularAtomic'] == 439
writes = {C: encode(can), S: encode(sem)}
assert len(cas['viewOperations']) == 3 and cas['sourceOperations'] == []
for op in cas['viewOperations']:
    assert sha(L / op['targetPath']) == op['expectedCurrentFileSha256']
    assert read(L / op['targetPath']) == op['before']
    source = R / op['afterFile']['path']
    assert sha(source) == op['afterFile']['sha256'] and read(source) == op['after']
    writes[op['targetPath']] = source.read_bytes()

# Select B's genuine current-context rows with external FIRST lineage and no
# unsupported claims to a formal native AI-run manifest. A remains corroboration.
p2 = B / 'P2.own-independent-current-input-candidates.jsonl'
new_lines = p2.read_bytes().splitlines(keepends=True)
rows = {json.loads(line)['goalId']: line for line in new_lines}
assert len(new_lines) == 2 and set(rows) == IDS
for line in new_lines:
    row = json.loads(line)
    assert row['reviewRunIds'] == []
    assert (row['status'], row['reviewAuthority'], row['evidenceLevel'], row['maximumClaimScope']) == ('needs_human_review', 'ai_candidate', 'E1', 'G1')

central = read(L / CENTRAL)
subject = next(s for s in central['subjects'] if s['subject'] == 'chemie')
assert len(subject['resolutionIndexPaths']) == 103
configs = []
owners = set()
residuals = []
new_configs = []
for index, path in enumerate(subject['positiveEvidenceConfigPaths']):
    cfg = read(L / path)
    scope = cfg['scope']['goalIds']
    overlap = set(scope) & IDS
    if not overlap:
        configs.append(path)
        continue
    assert not owners & overlap
    owners |= overlap
    old_rows = (L / cfg['reviewPath']).read_bytes().splitlines(keepends=True)
    old_by = {json.loads(line)['goalId']: json.loads(line) for line in old_rows}
    for goal_id in overlap:
        row = json.loads(rows[goal_id])
        assert row['profile'] == old_by[goal_id]['profile']
        assert row['profileFingerprint'] == old_by[goal_id]['profileFingerprint']
        assert sha(L / cfg['reviewCriteriaPath']) == row['reviewCriteriaFingerprint']
        target_rows = NEW + f'P1.{goal_id}.own-independent-b.current-context.exact.jsonl'
        writes[target_rows] = rows[goal_id]
        current = copy.deepcopy(cfg)
        current['reviewId'] = row['reviewId']
        current['reviewPath'] = target_rows
        current['reviewRunManifestPaths'] = []
        current['scope'] = {'label': 'Only genuine independently reviewed current requires context; complete existing bilingual profile retained, E1/G1 AI design evidence, no human approval', 'goalIds': [goal_id]}
        current['requireApproved'] = False
        cfg_path = NEW + f'P1.{goal_id}.same-own-b-identity.config.json'
        writes[cfg_path] = encode(current)
        new_configs.append(cfg_path)
    remaining = [goal_id for goal_id in scope if goal_id not in IDS]
    if not remaining:
        continue
    keep = [line for line in old_rows if json.loads(line)['goalId'] in remaining]
    assert len(keep) == len(remaining)
    row_path = NEW + f'P-retained-{index:03d}.whole-original-lines.jsonl'
    writes[row_path] = b''.join(keep)
    cfg['reviewPath'] = row_path
    cfg['scope']['goalIds'] = remaining
    cfg_path = NEW + f'P-retained-{index:03d}.original-identity.scope-only.config.json'
    writes[cfg_path] = encode(cfg)
    configs.append(cfg_path)
    residuals.append({'originalConfig': path, 'successorConfig': cfg_path, 'unchangedWholeRows': len(keep)})
assert owners == IDS and len(new_configs) == 2
subject['positiveEvidenceConfigPaths'] = configs + new_configs
central['reportId'] = 'chemie-current439-paired-generic-SekI-NI-and-new2-D-other-contexts-pending-private-20261016-v1'
central_path = NEW + 'central.current439.paired-generic-SekI-NI.new2-D.other-contexts-pending.private.config.json'
writes[central_path] = encode(central)
old_lines = (L / (OLD + 'P439.exact437-retained-whole-lines-two-own-current-contexts.for-native-model.jsonl')).read_bytes().splitlines(keepends=True)
assert len(old_lines) == 439
whole_lines = [rows.get(json.loads(line)['goalId'], line) for line in old_lines]
assert sum(a == b for a, b in zip(old_lines, whole_lines)) == 437
whole_path = NEW + 'P439.exact437-retained-whole-lines-two-own-b-contexts.for-native-model.jsonl'
writes[whole_path] = b''.join(whole_lines)
base = read(L / (OLD + 'base.full439.current-native-inputs.config.json'))
base['evidenceReviewPaths'] = [whole_path]
base['outputPath'] = NEW + 'book-model.full439.current-native-base.json'
writes[NEW + 'base.full439.current-native-inputs.config.json'] = encode(base)
for p, data in writes.items():
    if p.endswith('.json'):
        json.loads(data)
    elif p.endswith('.jsonl'):
        for line in data.splitlines():
            json.loads(line)
receipt = {
    'role': 'Actual paired two-prior / three-view private integration with genuine current B profile evidence; no third scientific vote',
    'createdAtUTC': datetime.now(timezone.utc).isoformat(), 'inputCanonical': sha(L / C),
    'selectors': [pin(p) for p, _ in required], 'selectedOriginalP2': pin(p2),
    'canonicalWholeGoals': 641, 'ordinary': 439, 'oldWholeBodiesRetained': 639,
    'changedRequiresOnly': sorted(IDS), 'wholeViews': 3, 'sourceOperations': 0,
    'newOrdinaryGoals': 0, 'newStrictFiveGateClosuresClaimed': 0,
    'existingP437WholeLinesRetained': True, 'oldOwnerResiduals': residuals,
    'nativeNew2DescriptionIndexPreserved': True, 'otherCurrentDescriptionContextsRemainPending': True,
    'unrelatedNIRouteHolesRemainUnchanged': True, 'normalWrites': 0,
    'HumanApproval': False, 'HumanTrial': False, 'M7': False,
}
if '--apply' not in sys.argv:
    print(json.dumps({'mode': 'DRY RUN', 'files': len(writes), 'wholeBeforeAndSciencePins': 'PASS', 'positiveConfigs': len(configs + new_configs)}))
    raise SystemExit()


def own_dir(p):
    if p == L:
        assert p.is_dir() and not p.is_symlink()
        return
    assert p.is_relative_to(L)
    own_dir(p.parent)
    if p.is_symlink():
        children = list(p.resolve(strict=True).iterdir())
        p.unlink()
        p.mkdir()
        for child in children:
            (p / child.name).symlink_to(child.resolve(), target_is_directory=child.is_dir())
    else:
        p.mkdir(exist_ok=True)
    assert p.resolve().is_relative_to(L.resolve())


dest_receipt = T / 'EXECUTION.actual-paired-generic-SekI-NI-private-L6.receipt.json'
assert not dest_receipt.exists()
for p in writes:
    own_dir((L / p).parent)
assert sha(L / C) == receipt['inputCanonical']
for p, data in writes.items():
    dest = L / p
    temp = dest.with_name(dest.name + '.generic-paired-new')
    with temp.open('xb') as stream:
        stream.write(data)
    os.replace(temp, dest)
assert sha(R / C) == normal
receipt['afterCanonical'] = sha(L / C)
receipt['afterSEM'] = sha(L / S)
receipt['writtenFiles'] = [{'path': p, 'sha256': sha(L / p)} for p in writes]
receipt['newOwnPConfigPaths'] = new_configs
receipt['centralConfigPath'] = central_path
with dest_receipt.open('x') as stream:
    json.dump(receipt, stream, ensure_ascii=False, indent=2)
    stream.write('\n')
print(json.dumps({'mode': 'APPLIED PRIVATE ONLY', 'files': len(writes), 'canonical': receipt['afterCanonical'], 'SEM': receipt['afterSEM'], 'positiveConfigs': len(configs + new_configs), 'receipt': str(dest_receipt.relative_to(R))}))
