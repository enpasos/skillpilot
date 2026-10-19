# SPDX-License-Identifier: Apache-2.0
"""Bounded, read-only independent checks. Writes only this review package/tmp input."""
import copy
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[8]
OUT = Path(__file__).resolve().parents[1]
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-18'
AUTHOR = BASE / 'chemie-current450-SN-aluminium-existing-carriers-author-20261018-v1'
V2 = BASE / 'chemie-current450-recycling-atomicity-source-author-20261018-v2'
TMP = ROOT / 'tmp/chemie-SN-aluminium-independent-c-20261018'
TMP.mkdir(parents=True, exist_ok=True)
CHECKS = []
PINS = {}

def pin(path):
    p = Path(path)
    if not p.is_absolute():
        p = ROOT / p
    data = p.read_bytes()
    row = dict(path=str(p.relative_to(ROOT)), sha256=hashlib.sha256(data).hexdigest(), bytes=len(data))
    PINS[row['path']] = row
    return row

def read(path):
    pin(path)
    return json.loads(Path(path if Path(path).is_absolute() else ROOT / path).read_text())

def sha(obj):
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()

def check(name, condition, detail=None):
    CHECKS.append(dict(check=name, passed=bool(condition), **({'detail': detail} if detail is not None else {})))

def ptr(obj, pointer):
    for key in pointer.strip('/').split('/'):
        key = key.replace('~1', '/').replace('~0', '~')
        obj = obj[int(key)] if isinstance(obj, list) else obj[key]
    return obj

def replace(obj, pointer, value):
    parent, key = pointer.rsplit('/', 1)
    target = ptr(obj, parent)
    target[int(key) if isinstance(target, list) else key] = copy.deepcopy(value)

def scientific(obj, prefix=''):
    result = []
    if isinstance(obj, dict):
        for key, value in obj.items():
            p = prefix + '/' + key
            if 'scientific' in key.lower():
                result.append((p, value))
            else:
                result.extend(scientific(value, p))
    elif isinstance(obj, list):
        for i, value in enumerate(obj):
            result.extend(scientific(value, prefix + '/' + str(i)))
    return result

# Frozen author bytes are evidence inputs, not acceptance authority.
inputs = read(AUTHOR / 'INPUTS.actual-pins.json')
for row in inputs['pins']:
    actual = pin(row['path'])
    check('input exact: ' + row['path'], all(actual[k] == row[k] for k in ['sha256', 'bytes']))
seal = read(AUTHOR / 'SEAL.author-SN108-existing-carriers.pending-independent-review.json')
for row in seal['outputs']:
    actual = pin(row['path'])
    check('sealed author output exact: ' + row['path'].split('/')[-1], all(actual[k] == row[k] for k in ['sha256', 'bytes']))

canonical = read(ROOT / 'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
goals = read(AUTHOR / 'candidates/two-whole-goals.before-after.pending.json')
profiles = read(AUTHOR / 'candidates/two-whole-profiles.before-after.pending.json')
bindings = read(AUTHOR / 'operations/profile-material-and-evidence-bindings.pending.json')
for g in goals['records']:
    check('actual whole current goal: ' + g['goalId'], ptr(canonical, g['canonicalPointer']) == g['before'])
for r in profiles['records']:
    loc = r['beforeWholeCurrentRecordPin']
    pin(loc['path'])
    actual = json.loads((ROOT / loc['path']).read_text().splitlines()[loc['lineOneBased'] - 1])
    old = r['beforeWholeCurrentRecord']['profile']
    new = r['afterProfile']
    check('actual selected whole current P: ' + r['goalId'], actual == r['beforeWholeCurrentRecord'])
    check('all old P fields except case append exact: ' + r['goalId'], {k:v for k,v in old.items() if k != 'applicationCaseBriefs'} == {k:v for k,v in new.items() if k != 'applicationCaseBriefs'})
    check('every complete old bilingual case retained: ' + r['goalId'], new['applicationCaseBriefs'][:len(old['applicationCaseBriefs'])] == old['applicationCaseBriefs'])
    check('exactly two appended complete contexts: ' + r['goalId'], len(new['applicationCaseBriefs']) == len(old['applicationCaseBriefs']) + 2)
    cov = new['coverageExpectations']
    check('min2 fresh independent transfer: ' + r['goalId'], cov['minimumIndependentDemonstrations'] == 2 and cov['freshVariationRequired'] is True and cov['independentTransferRequired'] is True)
    check('P semantic before and after pins: ' + r['goalId'], sha(old) == r['beforeWholeProfileSemanticSHA256'] and sha(new) == r['afterWholeProfileSemanticSHA256'])
    for c in new['applicationCaseBriefs'][-2:]:
        check('complete bilingual new case: ' + c['id'], all(c.get(k) for k in ['taskDemandDe','taskDemandEn','expectedPerformanceDe','expectedPerformanceEn','understandingFocusDe','understandingFocusEn']))
for row in bindings['materialBindings']:
    for field in ['learner','teacher']:
        actual = pin(row[field]['path'])
        check('exact bound material: ' + field + ' ' + row['goalId'], all(actual[k] == row[field][k] for k in ['sha256','bytes']))
fcc, b7 = goals['records']
check('FCC whole goal unchanged', fcc['before'] == fcc['after'])
old, new = b7['before'], b7['after']
check('b7 all semantic fields and prerequisites unchanged', {k:v for k,v in old.items() if k not in ['applicability','extendedData']} == {k:v for k,v in new.items() if k not in ['applicability','extendedData']})
check('b7 jurisdiction adds only SN', new['applicability'] == {**old['applicability'], 'jurisdiction': old['applicability']['jurisdiction'] + ['DE-SN']})
extkey = 'skillPilotAcquisitionExtensions'
check('b7 whole old extendedData retained', {k:v for k,v in old['extendedData'].items() if k != extkey} == {k:v for k,v in new['extendedData'].items() if k != extkey})
check('b7 exactly one qualified additive scope extension', new['extendedData'][extkey][:-1] == old['extendedData'][extkey] and len(new['extendedData'][extkey]) == len(old['extendedData'][extkey]) + 1)
ext = new['extendedData'][extkey][-1]
check('new own scope is only SN GK and denies universal/selection/whole-source claims', ext['jurisdiction'] == 'DE-SN' and ext['viewIds'] == ['de-sn-gym-chemistry-gk'] and ext['courseProfiles'] == ['GK'] and all(ext[k] is False for k in ['officialWholeSourceCredit','officialUniversalRequirementClaim','actualLearnerTopicSelectionClaim','newRuntimeSelector']))
goalcas = read(AUTHOR / 'operations/one-qualified-existing-goal.exact-CAS.pending.json')
check('one whole goal CAS exact', ptr(canonical, goalcas['jsonPointer']) == goalcas['before'] == old and goalcas['after'] == new and sha(old) == goalcas['beforeSemanticSHA256'] and sha(new) == goalcas['afterSemanticSHA256'])

# Execute source CAS against the declared prepared V2 arrays, with strict before checks.
delta = read(AUTHOR / 'operations/SN108-only-whole-source-delta-against-V2.pending.json')
v2cas = read(V2 / 'operations/source-whole-array-and-clause.exact-CAS.pending.json')
normalmapping = read(ROOT / delta['normalMappingPath'])
prepared = copy.deepcopy(normalmapping)
for field, decl in [('mappings', delta['preparedMappingArray']), ('decisions', delta['preparedDecisionArray'])]:
    arr = ptr(v2cas, decl['V2Pointer'])
    check('prepared V2 array pin: ' + field, sha(arr) == decl['semanticSHA256'] and len(arr) == decl['length'])
    prepared[field] = copy.deepcopy(arr)
after = copy.deepcopy(prepared)
sid = delta['wholeDecisionAfter']['sourceGoalId']
check('only two declared source operations', len(delta['operations']) == 2)
for op in delta['operations']:
    if op['operation'] == 'append_if_exact_prepared_array_pin_and_pairs_absent':
        arr = ptr(after, op['jsonPointer'])
        pairs = {(r['legacyGoalId'],r['canonicalGoalId']) for r in arr}
        check('source append CAS exact and pairs absent', sha(arr) == op['beforeArraySemanticSHA256'] and len(arr) == op['beforeLength'] and all((r['legacyGoalId'],r['canonicalGoalId']) not in pairs for r in op['afterAppend']))
        arr.extend(copy.deepcopy(op['afterAppend']))
    elif op['operation'] == 'replace_exact_value_in_prepared_V2':
        check('source decision CAS exact', ptr(after, op['jsonPointer']) == op['before'])
        replace(after, op['jsonPointer'], op['after'])
    else:
        check('known operation', False, op['operation'])
beforeunion = [r for r in prepared['mappings'] if r['legacyGoalId'] == sid]
afterunion = [r for r in after['mappings'] if r['legacyGoalId'] == sid]
check('whole source union aliases exact', beforeunion == delta['wholeV2DirectUnionBefore'] and afterunion == delta['wholeDirectUnionAfter'])
check('whole source decision aliases exact', prepared['decisions'][103] == delta['wholeV2DecisionBefore'] and after['decisions'][103] == delta['wholeDecisionAfter'])
check('only two new partial SN108 pairs', len(after['mappings']) == len(prepared['mappings']) + 2 and after['mappings'][:len(prepared['mappings'])] == prepared['mappings'] and {(r['legacyGoalId'],r['canonicalGoalId'],r['matchType']) for r in after['mappings'][-2:]} == {(sid,g,'partial') for g in [fcc['goalId'],b7['goalId']]})
check('all other whole V2 decisions and unions exact', after['decisions'][:103] == prepared['decisions'][:103] and after['decisions'][104:] == prepared['decisions'][104:] and [r for r in after['mappings'] if r['legacyGoalId'] != sid] == [r for r in prepared['mappings'] if r['legacyGoalId'] != sid])
check('old electrolysis partial exact retained', beforeunion == afterunion[:1] and beforeunion[0]['canonicalGoalId'] == 'fd7977bf-1d8e-5c5e-9c37-bd76bb2ffeef' and beforeunion[0]['matchType'] == 'partial')
check('existing ScientificRef fields exact', scientific(prepared) == scientific(after))
check('whole source CAS final semantic hashes calculated', True, dict(beforeMappings=sha(prepared['mappings']),afterMappings=sha(after['mappings']),beforeDecisions=sha(prepared['decisions']),afterDecisions=sha(after['decisions']),scientificFieldCount=len(scientific(after))))
for loc in delta['wholeOriginalCurrentSourceObjects']:
    source = read(ROOT / loc['file']['path'])
    check('whole original source object exact', sha(ptr(source,loc['jsonPointer'])) == loc['wholeObjectSHA256'])

# Independently prepare the author V2 canonical baseline only in memory, then apply b7 CAS.
beforeland = copy.deepcopy(canonical)
for op in read(V2 / 'operations/canonical.exact-CAS.pending.json')['operations']:
    if op['operation'] == 'replace_exact_value':
        check('V2 canonical baseline CAS: ' + op['jsonPointer'], ptr(beforeland,op['jsonPointer']) == op['before'])
        replace(beforeland,op['jsonPointer'],op['after'])
    elif op['operation'] == 'append_if_exact_length_and_id_absent':
        arr = ptr(beforeland,op['jsonPointer'])
        check('V2 canonical baseline append CAS', len(arr) == op['beforeLength'] and all(g['id'] != op['absentGoalId'] for g in arr))
        arr.append(copy.deepcopy(op['afterAppend']))
    else:
        check('known canonical operation',False)
afterland = copy.deepcopy(beforeland)
check('aluminium CAS disjoint from V2 goal edits', ptr(afterland,goalcas['jsonPointer']) == goalcas['before'])
replace(afterland,goalcas['jsonPointer'],goalcas['after'])
changed = [(a['id'],b['id']) for a,b in zip(beforeland['goals'],afterland['goals']) if a != b]
check('no new atom and only b7 goal changed', len(beforeland['goals']) == len(afterland['goals']) and changed == [(b7['goalId'],b7['goalId'])])
v2views = read(V2 / 'candidates/whole41-view-after.pending.json')
view = read(AUTHOR / 'candidates/SN-GK-whole-view.before-after.pending.json')
beforeview, afterview = view['beforePreparedV2WholeView'], view['afterWholeView']
match = [r for r in v2views['records'] if r['path'] == view['path']]
check('actual prepared V2 whole view exact', len(match) == 1 and match[0]['after'] == beforeview)
check('view only appends explicit existing b7 target', afterview == {**beforeview,'rootNodes':beforeview['rootNodes'] + [dict(kind='goalEntry',goalId=b7['goalId'],projectionRole='target')]})
check('whole view semantic pins', sha(beforeview) == view['beforeSemanticSHA256'] and sha(afterview) == view['afterSemanticSHA256'])
check('41 actual V2 whole view inputs available', len(v2views['records']) == 41)
for p in AUTHOR.rglob('*'):
    if p.is_file():
        pin(p)
for p in [ROOT/'app/src/utils/authoring/compositionViewAuthoring.ts',ROOT/'app/src/utils/authoring/canonicalAuthoring.ts']:
    pin(p)
payload = dict(beforeLandscape=beforeland,afterLandscape=afterland,views=[dict(path=r['path'],before=r['after'],after=afterview if r['path'] == view['path'] else r['after']) for r in v2views['records']],newGoalId=b7['goalId'])
(TMP/'compiler-input.json').write_text(json.dumps(payload,ensure_ascii=False))
report = dict(role='INDEPENDENT_C_BOUNDED_IN_MEMORY_CHECKS',active=False,reviewAuthority='ai_candidate',passed=all(c['passed'] for c in CHECKS),checks=CHECKS,noNormalFilesWritten=True,noNativeD_M7_HumanOrAssessmentReleaseClaim=True)
(OUT/'checks').mkdir(exist_ok=True)
(OUT/'checks/bounded-in-memory-checks.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
(OUT/'INPUTS.actual-pins.json').write_text(json.dumps(dict(role='INDEPENDENT_C_ACTUAL_INPUT_PINS',pins=sorted(PINS.values(),key=lambda r:r['path'])),ensure_ascii=False,indent=2)+'\n')
print(json.dumps(dict(passed=report['passed'],checks=len(CHECKS),failures=[c for c in CHECKS if not c['passed']],inputPins=len(PINS)),ensure_ascii=False,indent=2))
raise SystemExit(0 if report['passed'] else 1)
