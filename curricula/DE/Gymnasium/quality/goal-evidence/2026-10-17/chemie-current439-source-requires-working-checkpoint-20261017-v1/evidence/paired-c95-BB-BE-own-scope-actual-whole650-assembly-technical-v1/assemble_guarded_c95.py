"""Apply exactly one already paired whole-c95 CAS to a new inactive E snapshot."""
from pathlib import Path
import collections
import copy
import datetime
import hashlib
import json

ROOT = Path('/home/enpasos/projects/skillpilot')
T = ROOT / 'tmp/chemie-m7-resumed-20261016'
OWN = Path(__file__).parent.resolve()
BEFORE_DIR = Path('/mnt/e/skillpilot-chemie-L7-20261017/paired-concentration-two-and-four-foundations-actual-whole650-assembly-root-v1')
BASE_RECEIPT = BEFORE_DIR / 'RECEIPT.actual-paired-concentration-two-and-four-foundations.json'
CAS = T / 'c95-BB-BE-retained-existing-target-scope-author-v1/CAS.one-whole-c95-BB-BE-own-scope.inactive.json'
A = T / 'c95-BB-BE-retained-target-scope-independent-a-v1/OUTPUTS.FIRST.c95-BB-BE-own-scope.independent-a.selector.json'
B = T / 'c95-BB-BE-retained-target-scope-independent-b-v1/FIRST.review.json'
SEMANTIC_CONTEXT = T / 'current-650-nine-NI-targeted-P-context-inputs-technical-b-v1/INPUT.clean-content-only-24-current-P-contexts-whole-goals-profiles-reviewinputs-images.json'
def digest(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()
def pin(p):
    return {'path': str(p), 'sha256': digest(p), 'bytes': p.stat().st_size}
def objhash(value):
    return 'sha256:' + hashlib.sha256(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode()).hexdigest()
def diff(a, b, path=''):
    if isinstance(a, dict) and isinstance(b, dict):
        return sum([diff(a.get(k), b.get(k), path + '/' + k) for k in sorted(set(a) | set(b))], [])
    if isinstance(a, list) and isinstance(b, list) and len(a) == len(b):
        return sum([diff(x, y, path + '/' + str(i)) for i, (x, y) in enumerate(zip(a, b))], [])
    return [] if a == b else [path]
checks = []
def check(ok, label):
    assert ok, label
    checks.append(label)

for path, expected in [(BASE_RECEIPT, 'dddb5ffe0d21f8a33f24a50fb2ac22f7363f46794de3ea5f2a27a1a379b108e7'), (CAS, '0648dab1929c20f6908c513c754acc23df7e0efe00e068a0b9e054a8a176b6fb'), (A, '98ebefb4743b7f1e2e9aa45b4ad6943851144fc9775d4e3e3ab8e26fb7d8fd0f'), (B, '3759b8e426eb349a1ecbb3035c3d40228b88678bae7c0fc9e010723816c7aeff'), (SEMANTIC_CONTEXT, 'd4af6ff31ed3401bcefbb42aa7ff9c0ded1f36ca03a38988609ee62fc6682753')]:
    check(digest(path) == expected, 'exact authorized input pin: ' + path.name)
base_receipt = json.loads(BASE_RECEIPT.read_text())
base = Path(base_receipt['outputs']['canonical']['path'])
views = Path(base_receipt['outputs']['views']['path'])
check(digest(base) == base_receipt['outputs']['canonical']['sha256'], 'latest assembled whole650 canonical exact')
check(digest(views) == base_receipt['outputs']['views']['sha256'], 'latest assembled whole39 views exact')
canon = json.loads(base.read_text())
whole_views = json.loads(views.read_text())
cas = json.loads(CAS.read_text())
check(len(cas['wholeGoalChanges']) == 1 and cas['wholeViewChanges'] == [], 'one whole-goal CAS and no view changes')
change = cas['wholeGoalChanges'][0]
check(change['goalId'] == 'c95f6059-d7c2-5bcd-b61e-95e3577efdb2', 'only authorized c95 goal selected')
check(objhash(change['before']) == change['beforeDigest'] and objhash(change['after']) == change['afterDigest'], 'whole before/after CAS object hashes exact')
idx = next(i for i, g in enumerate(canon['goals']) if g['id'] == change['goalId'])
check(canon['goals'][idx] == change['before'], 'whole c95 BEFORE object guard succeeds against latest assembly')
after = copy.deepcopy(canon)
after['goals'][idx] = copy.deepcopy(change['after'])
changed_fields = diff(change['before'], change['after'])
check(changed_fields == ['/extendedData/applicabilityOverrides', '/extendedData/skillPilotAcquisitionExtensions'], 'exactly two authorized metadata fieldpaths')
check(after['goals'][idx]['extendedData']['applicabilityOverrides'] == {'jurisdiction': ['DE-BB', 'DE-BE']}, 'supported scope input is exactly BB/BE')
annotations = after['goals'][idx]['extendedData']['skillPilotAcquisitionExtensions']
check(len(annotations) == 2 and {x['jurisdiction'] for x in annotations} == {'DE-BB', 'DE-BE'}, 'exactly two BB/BE own-acquisition annotations')
check(all(x['officialWholeSourceCredit'] is False for x in annotations), 'no official whole-source credit introduced')
check({k:v for k,v in canon.items() if k != 'goals'} == {k:v for k,v in after.items() if k != 'goals'}, 'all landscape-level fields unchanged')
changed_goals = [a['id'] for a,b in zip(canon['goals'], after['goals']) if a != b]
check(changed_goals == [change['goalId']], 'all other649 whole goals unchanged')
check([g['id'] for g in canon['goals']] == [g['id'] for g in after['goals']], 'all650 goal IDs and order unchanged')
for field in ('requires', 'contains', 'tags', 'title', 'titleEn', 'description', 'descriptionEn', 'resourceLinks', 'applicability'):
    check([g.get(field) for g in canon['goals']] == [g.get(field) for g in after['goals']], 'all goals retain exact ' + field)

semantic_rows = json.loads(SEMANTIC_CONTEXT.read_text())['currentSemanticKindsOnly']
kind_by_id = {x['goalId']: x['semanticKind'] for x in semantic_rows}
check(set(kind_by_id) == {x['id'] for x in canon['goals']}, 'explicit650-kind context covers exactly the current650 IDs')
counts = collections.Counter(kind_by_id[g['id']] for g in canon['goals'])
check(len(canon['goals']) == 650 and counts['curricularAtomic'] == 439 and counts['memory'] == 67, 'whole650 / ordinary439 / Memory67 unchanged from exact kind context')
check(len(whole_views) == 39, '39 authored views unchanged')

dag_results = []
for field in ('requires', 'contains'):
    edges = {g['id']: g.get(field, []) for g in canon['goals']}
    after_edges = {g['id']: g.get(field, []) for g in after['goals']}
    check(edges == after_edges, 'entire ' + field + ' graph unchanged')
    seen, active, cycles = set(), set(), []
    def dfs(node, chain):
        if node in active:
            cycles.append(chain + [node])
            return
        if node in seen or node not in edges:
            return
        active.add(node)
        for child in edges[node]:
            dfs(child, chain + [node])
        active.remove(node)
        seen.add(node)
    for node in edges:
        dfs(node, [])
    check(not cycles, 'bounded whole-canonical ' + field + ' DAG retained')
    dag_results.append({'edgeType': field, 'nodes': len(edges), 'edges': sum(map(len, edges.values())), 'cycles': len(cycles), 'sameBeforeAndAfter': True})

# No publication, record or binding is emitted; these are the only new content files.
out_c = OWN / 'candidate.canonical650.paired-concentration-foundations-and-c95-BB-BE.private.json'
out_v = OWN / 'candidate.whole39views.unchanged-paired48-foundations.private.json'
check(not out_c.exists() and not out_v.exists(), 'new isolated output files do not overwrite previous snapshots')
out_c.write_text(json.dumps(after, ensure_ascii=False, indent=2) + '\n')
out_v.write_bytes(views.read_bytes())
check(out_v.read_bytes() == views.read_bytes(), 'output39views byte-exact copy')
check(json.loads(out_c.read_text()) == after, 'written whole650 output equals guarded candidate')
for path, expected in ((base, base_receipt['outputs']['canonical']['sha256']), (views, base_receipt['outputs']['views']['sha256']), (BASE_RECEIPT, 'dddb5ffe0d21f8a33f24a50fb2ac22f7363f46794de3ea5f2a27a1a379b108e7')):
    check(digest(path) == expected, 'source remains unchanged after output: ' + path.name)

receipt = {'atUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'role': 'inactive technical guarded one-c95 assembly after separately sealed paired content KEEP; no new scientific vote', 'physicalOutputRoot': str(OWN), 'TLink': str(T / OWN.name), 'inputs': [pin(p) for p in [BASE_RECEIPT, base, views, CAS, A, B, SEMANTIC_CONTEXT]], 'pairedScienceBoundary': 'A reviewed only foreign c95 scope; own older94a→642 basis not revoted. B verdict KEEP. This assembly is technical and adds no new vote. Separate Biuret author work is not applied.', 'wholeObjectCAS': {'goalId': change['goalId'], 'beforeDigest': change['beforeDigest'], 'afterDigest': change['afterDigest'], 'beforeWholeGuardPassed': True}, 'outputs': {'canonical': pin(out_c), 'views': pin(out_v)}, 'actualChanges': {'goalCount': 650, 'ordinaryCount': 439, 'MemoryCount': 67, 'semanticKindCounts': dict(counts), 'viewCount': 39, 'changedWholeGoalIds': changed_goals, 'changedWholeGoalFieldpaths': changed_fields, 'supportedOverrideJurisdictions': ['DE-BB', 'DE-BE'], 'ownAcquisitionAnnotationCount': len(annotations), 'PChanges': 0, 'requiresChanges': 0, 'containsChanges': 0, 'sourceMappingChanges': 0, 'cardChanges': 0, 'MemoryChanges': 0, 'runtimeChanges': 0, 'viewByteChanges': 0, 'targetLossesFromAssembly': 0, 'wholeGuardFailures': 0}, 'DAG': dag_results, 'checksPassed': checks, 'actualAfterAPVObserved': False, 'afterAPV': 'pending root bundled stable integration run; no final APV rerun', 'PAndOtherExternalFiles': 'No P, mappings, cards, runtime or source tree copied/modified; only isolated whole canonical and byte-exact39view output emitted.', 'newStrictFiveGateClosuresProven': 0, 'restoredFullFiveGateBindingsProven': 0, 'normalWrites': 0, 'L6Writes': 0, 'L7Writes': 0, 'fullAPV': False, 'fullGates': False, 'native': False, 'build': False, 'M7': False, 'HumanApproval': False, 'HumanTrial': False}
receipt_file = OWN / 'RECEIPT.guarded-one-c95-BB-BE-scope-assembly.json'
receipt_file.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
selector = OWN / 'SELECTOR.guarded-one-c95-BB-BE-scope-assembly.json'
selector.write_text(json.dumps({'role': 'inactive technical assembly output selector; actual after APV pending', 'receipt': pin(receipt_file), 'canonical': pin(out_c), 'unchanged39views': pin(out_v), 'assembler': pin(Path(__file__).resolve()), 'TLink': str(T / OWN.name), 'fullAPV': False, 'native': False, 'M7': False}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'selector': pin(selector), 'receipt': pin(receipt_file), 'canonical': pin(out_c), 'views': pin(out_v), 'counts': dict(counts), 'checksPassed': len(checks)}, ensure_ascii=False))
