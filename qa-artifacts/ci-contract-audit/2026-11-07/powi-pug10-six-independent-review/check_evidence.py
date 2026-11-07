#!/usr/bin/env python3
"""Bounded read-only independent checks for the six explicitly named PoWi edits.

Reuses the repository closure kernel; never invokes native producers or edits data.
"""
import copy
import gzip
import hashlib
import json
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path('/home/enpasos/projects/skillpilot')
PACKET = Path(__file__).resolve().parent / 'author-packet'
H = lambda raw: hashlib.sha256(raw).hexdigest()
S = lambda obj: json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':'))
read = lambda name: json.loads((PACKET / name).read_bytes())
unpack = lambda name: json.loads(gzip.decompress((PACKET / name).read_bytes()))

assert H((PACKET / 'receipt.json').read_bytes()) == 'b9621211b967531e4ea8854e410f5d366dd13430b25fee8d65a998c3dcb60b05'
assert H((PACKET / 'candidate.patch').read_bytes()) == 'de440df9c46eeec7920695440b98c288f96c2e5ec2b1c9365ef81f339e3057a3'
receipt, proposal, matrix = read('receipt.json'), read('proposal.json'), read('edge-evidence-matrix.json')
inventory = read('inventory.json')
for name, pin in inventory.items():
    raw = (PACKET / name).read_bytes()
    assert len(raw) == pin['bytes'] and H(raw) == pin['sha256'], name
for name, pin in receipt['rawPins'].items():
    packed = (PACKET / pin['packedPath']).read_bytes()
    raw = gzip.decompress(packed)
    assert H(packed) == pin['packedSha256'] and H(raw) == pin['sha256'] and len(raw) == pin['bytes'], name

docs = []
for pin in proposal['catalogSources']:
    raw = (ROOT / pin['path']).read_bytes()
    assert H(raw) == pin['sha256'], pin['path']
    docs.append(json.loads(raw))
owner = proposal['source']['landscapeId']
before = next(d for d in docs if d['landscapeId'] == owner)
after = unpack('candidate.json.gz')
assert H((ROOT / proposal['source']['path']).read_bytes()) == receipt['beforeSha256']
assert H(gzip.decompress((PACKET / 'candidate.json.gz').read_bytes())) == receipt['afterSha256']
expected = {op['guardGoalId'] for op in proposal['operations']}
assert len(expected) == 6
deltas = []
assert len(before['goals']) == len(after['goals']) == 512
for index, (old, new) in enumerate(zip(before['goals'], after['goals'])):
    if old == new:
        continue
    assert old['id'] == new['id'] and old['id'] in expected
    changed = [k for k in old.keys() | new.keys() if old.get(k) != new.get(k)]
    assert changed == ['requires']
    assert new['requires'] == [v for v in old['requires'] if v != matrix[0]['removedRequirementId']]
    deltas.append({'index': index, 'goalId': old['id'], 'fields': changed})
assert {d['goalId'] for d in deltas} == expected
top = copy.deepcopy(before)
top['goals'] = after['goals']
assert top == after
assert before['goals'][289] == after['goals'][289]
held = proposal['heldCase']['goalId']
assert next(g for g in before['goals'] if g['id'] == held) == next(g for g in after['goals'] if g['id'] == held)
prior_raw = (ROOT / proposal['priorFourReceipt']['path']).read_bytes()
assert H(prior_raw) == proposal['priorFourReceipt']['sha256']
for op in json.loads(prior_raw)['exactOperations']:
    assert next(g for g in after['goals'] if g['id'] == op['guardGoalId'])['requires'] == op['value']

context = unpack('context.json.gz')
for kind in ['source', 'mapping', 'extraction', 'officialCapture']:
    pin = context[kind]
    assert H((ROOT / pin['path']).read_bytes()) == pin['sha256'], kind
mapping_path = ROOT / context['mapping']['path']
mapping = json.loads(mapping_path.read_bytes())
mapping_lines = mapping_path.read_text().splitlines()
extraction = json.loads((ROOT / context['extraction']['path']).read_bytes())
extracted = {row['id']: row for row in extraction['sourceGoals']}
capture = json.loads((ROOT / context['officialCapture']['path']).read_bytes())
def strings(value):
    if isinstance(value, str):
        yield value
    elif isinstance(value, list):
        for child in value:
            yield from strings(child)
    elif isinstance(value, dict):
        for child in value.values():
            yield from strings(child)
capture_strings = list(strings(capture))
source_rows = {}
for case in matrix:
    for kind in ['goalSourceRows', 'carrierSourceRows']:
        for row in case[kind]:
            m, source = row['mapping'], row['source']
            assert m in mapping['mappings']
            actual = extracted[source['id']]
            for field in ['sourceText', 'sourceSpan', 'parentBulletText', 'topicCode', 'bulletIndex', 'aspectIndex']:
                assert source[field] == actual[field]
            assert source['sourceText'] == source['rawSourceText'] == source['rawParentBulletText']
            assert any(source['sourceText'] in text for text in capture_strings)
            decision = next(d for d in mapping['decisions'] if d['sourceGoalId'] == source['id'])
            assert decision['decision'] == 'mapped' and m['canonicalGoalId'] in decision['canonicalGoalIds']
            source_rows[source['id']] = {'sourceGoalId': source['id'], 'canonicalGoalId': m['canonicalGoalId'],
                'sourceSpan': source['sourceSpan'], 'mappingLine': next(i + 1 for i, line in enumerate(mapping_lines) if '"legacyGoalId": "' + source['id'] + '"' in line),
                'decisionLine': next(i + 1 for i, line in enumerate(mapping_lines) if '"sourceGoalId": "' + source['id'] + '"' in line),
                'textSha256': H(source['sourceText'].encode()), 'mappingStatus': decision['decision']}
assert len(source_rows) == 9

sys.path.insert(0, str(ROOT / 'docs/dev/ci-graph-repairs'))
import verify_german_minimality_review as kernel
pre = kernel.Catalog(copy.deepcopy(docs))
post_docs = copy.deepcopy(docs)
post_docs[next(i for i, d in enumerate(post_docs) if d['landscapeId'] == owner)] = copy.deepcopy(after)
post = kernel.Catalog(post_docs)
assert pre.keys == post.keys and pre.atom_keys == post.atom_keys
e0, _ = pre.effective()
e1, _ = post.effective()
g0, gc0 = kernel.closure(pre.keys, e0)
g1, gc1 = kernel.closure(post.keys, e1)
a0, ac0 = kernel.closure(pre.atom_keys, pre.atomic(e0))
a1, ac1 = kernel.closure(post.atom_keys, post.atomic(e1))
assert g0 == g1 and a0 == a1 and gc0 == gc1 == ac0 == ac1 == 0
bad = copy.deepcopy(post)
negative_source = owner + ':20336e7f-a4f3-505e-9ff1-facd160f5acf'
negative_required = owner + ':793fa00f-1dce-5ead-b92e-e03176d4bc02'
bad.remove_origin(negative_source, negative_required)
ebad, _ = bad.effective()
gbad, _ = kernel.closure(bad.keys, ebad)
abad, _ = kernel.closure(bad.atom_keys, bad.atomic(ebad))
assert gbad != g1 and abad != a1
gi, ai = post.keys.index(negative_source), post.atom_keys.index(negative_source)
lost_goal_count = (g1[gi] & ~gbad[gi]).bit_count()
lost_atomic_count = (a1[ai] & ~abad[ai]).bit_count()
assert lost_goal_count == 5 and lost_atomic_count == 56
assert g1[gi] & (1 << post.keys.index(negative_required))
assert not gbad[gi] & (1 << post.keys.index(negative_required))

native0, native1 = unpack('baseline-native-scope.json.gz'), unpack('candidate-native-scope.json.gz')
equal_fields = ['views', 'foreignApplicability', 'routes', 'atomicity', 'memory', 'fingerprints', 'codePins']
for field in equal_fields:
    assert native0[field] == native1[field], field
identity = lambda row: S({k: v for k, v in row.items() if k != 'witness'})
findings0 = {identity(r): r for r in native0['strict']['findings']}
findings1 = {identity(r): r for r in native1['strict']['findings']}
removed = [findings0[k] for k in findings0.keys() - findings1.keys()]
assert not findings1.keys() - findings0.keys()
assert len(removed) == 6 and {r['goalId'] for r in removed} == expected and all(r['ruleId'] == 'G17' for r in removed)
checks0 = {r['id']: r for r in native0['strict']['checks']}
checks1 = {r['id']: r for r in native1['strict']['checks']}
assert checks0['G17']['findingCount'] == 122 and checks1['G17']['findingCount'] == 116
assert checks0['G01a'] == checks1['G01a'] and checks1['G01a']['findingCount'] == 477
foreign0 = {r['landscapeId']: r for r in native0['foreignStrict']}
foreign1 = {r['landscapeId']: r for r in native1['foreignStrict']}
assert sum(foreign0[k] == foreign1[k] for k in foreign0) == 19
app0, app1 = native0['applicability'], native1['applicability']
assert app0['findings'] == app1['findings']
ap0, ap1 = {r['goalId']: r for r in app0['goals']}, {r['goalId']: r for r in app1['goals']}
assert ap0.keys() == ap1.keys() and len(ap0) == 512
evidence_delta = []
for gid in ap0:
    assert {k: v for k, v in ap0[gid].items() if k != 'evidence'} == {k: v for k, v in ap1[gid].items() if k != 'evidence'}
    if ap0[gid]['evidence'] != ap1[gid]['evidence']:
        assert gid == matrix[0]['removedRequirementId']
        removed_rows = set(map(S, ap0[gid]['evidence'])) - set(map(S, ap1[gid]['evidence']))
        assert not set(map(S, ap1[gid]['evidence'])) - set(map(S, ap0[gid]['evidence']))
        expected_rows = {S({'dimension': 'jurisdiction', 'value': v, 'kind': 'requires-closure', 'source': 'required by ' + g}) for g in expected for v in ap0[g]['compiledApplicability']['jurisdiction']}
        assert removed_rows == expected_rows and len(removed_rows) == 91
        evidence_delta.append({'goalId': gid, 'requiresClosureOriginsRemoved': 91})
assert len(evidence_delta) == 1
for mode in ['baseline', 'candidate']:
    execution = read(mode + '-execution.json')
    assert execution['exitCode'] == 0
    assert execution['stdoutSha256'] == H(gzip.decompress((PACKET / (mode + '.stdout.gz')).read_bytes()))
    assert execution['stderrSha256'] == H(gzip.decompress((PACKET / (mode + '.stderr.gz')).read_bytes()))
for pin in proposal['catalogSources']:
    assert H((ROOT / pin['path']).read_bytes()) == pin['sha256']

print(json.dumps({'status': 'pass', 'scope': 'six-named-edge-independent-readonly-review',
    'authorPacketInventoryEntriesVerified': len(inventory), 'rawPinsVerified': len(receipt['rawPins']),
    'beforeSha256': receipt['beforeSha256'], 'afterSha256': receipt['afterSha256'], 'fieldDeltas': deltas,
    'mappingPath': context['mapping']['path'], 'nineUniquePuG10SourcesVerified': list(source_rows.values()),
    'contextIncludesSeparateTenthPuG8HeldCase': len(context['extraction']['sourceGoals']) == 10,
    'goalKeys': len(post.keys), 'atomicKeys': len(post.atom_keys), 'goalClosureEqual': True, 'atomicClosureEqual': True,
    'goalClosureSha256': kernel.digest_relation(post.keys, g1, 'goal'), 'atomicClosureSha256': kernel.digest_relation(post.atom_keys, a1, 'atomic'),
    'cycleComponents': 0, 'negativeControl': {'source': negative_source, 'required': negative_required, 'bothRelationsChanged': True, 'lostGoals': lost_goal_count, 'lostAtomicRequirements': lost_atomic_count},
    'nativeEvidence': {'rerun': False, 'producerRecordedExits': [0, 0], 'findings': [len(findings0), len(findings1)], 'G17': [122, 116], 'G01a': [477, 477], 'removed': 6, 'added': 0, 'equalFields': equal_fields, 'foreignReportsEqual': 19, 'views': len(native0['views']), 'filterCases': sum(len(v['variants']) for v in native0['views']), 'applicabilityValuesEqual': 512, 'evidenceDelta': evidence_delta},
    'priorFourPreserved': True, 'heldFifthPreserved': True, 'protectionCore289Preserved': True, 'all21SourcesUnchanged': True,
    'activeDataApplied': False, 'serviceAcceptance': False, 'maturityApproval': False}, ensure_ascii=False, indent=2))
