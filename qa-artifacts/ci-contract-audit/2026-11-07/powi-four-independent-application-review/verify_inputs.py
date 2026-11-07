#!/usr/bin/env python3
"""Read-only countercheck of the four pinned PoWi edits and source context.

Writes only review evidence in this directory. This is not a scope/runtime engine.
"""
import copy
import datetime
import gzip
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[4]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
FIRST = BASE / 'powi-first-bounded-minimality-review'
CURRENT = BASE / 'powi-four-current-context-application-candidate'
NATIVE = BASE / 'powi-native-focus-verification'
pins = {}


def utc():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def read(path):
    raw = path.read_bytes()
    pins[str(path.relative_to(ROOT))] = {
        'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
    return raw


def obj(path):
    return json.loads(read(path))


def canonical(x):
    return json.dumps(x, sort_keys=True, ensure_ascii=False,
                      separators=(',', ':')).encode()


started = utc()
old = obj(FIRST / 'proposal.json')
new = obj(CURRENT / 'technical-proposal.json')
context = obj(FIRST / 'context.json')
source_raw = read(ROOT / old['source']['path'])
source = json.loads(source_raw)
assert hashlib.sha256(source_raw).hexdigest() == old['source']['sha256']
assert old['operations'] == new['operations'] and len(new['operations']) == 4
assert canonical(old['operations']) == canonical(new['operations'])
candidate_raw = gzip.decompress(read(CURRENT / 'candidate.json.gz'))
candidate = json.loads(candidate_raw)
assert hashlib.sha256(candidate_raw).hexdigest() == old['candidateSourceSha256']
expected = copy.deepcopy(source)
intro = 'b76a024a-55a6-5c77-85cd-b37ef10e5197'
operations = []
for op in new['operations']:
    index = int(op['path'].split('/')[2])
    goal = source['goals'][index]
    assert goal['id'] == op['guardGoalId']
    assert hashlib.sha256(canonical(goal)).hexdigest() == op['guardGoalCanonicalSha256']
    assert goal['requires'] == op['guardRequiresBefore']
    assert op['value'] == [r for r in goal['requires'] if r != intro]
    assert len(op['value']) == 1
    assert not goal.get('contains') and not goal.get('examData')
    assert goal['type'] == 'atomic' and not goal.get('semanticKind')
    expected['goals'][index]['requires'] = op['value']
    operations.append({'caseId': op['caseId'], 'goalId': goal['id'],
                       'path': op['path'], 'before': goal['requires'],
                       'after': op['value'], 'wholeGoalGuard': True})
assert candidate == expected
goals = {g['id']: g for g in source['goals']}
after = {g['id']: g for g in candidate['goals']}
assert goals[intro] == after[intro] and goals[intro]['semanticKind'] == 'orientation'
held = old['heldCase']['goalId']
assert goals[held] == after[held]
unchanged = [g['id'] for g in source['goals'] if g == after[g['id']]]
assert len(unchanged) == len(goals) - 4
paths = []
for op in new['operations']:
    path = [op['guardGoalId']]
    while path[-1] != intro:
        edge = after[path[-1]]['requires']
        assert len(edge) == 1 and edge[0] not in path
        path.append(edge[0])
    paths.append({'caseId': op['caseId'], 'authoredSurvivingPath': path})

catalogs = {}
for pin in new['catalogSources']:
    data = read(ROOT / pin['path'])
    assert hashlib.sha256(data).hexdigest() == pin['sha256']
    landscape = json.loads(data)
    assert landscape['landscapeId'] == pin['landscapeId']
    catalogs[pin['landscapeId']] = {g['id']: g for g in landscape['goals']}
for row in context['goalsAndAllAncestors']:
    owner, goal_id = row['key'].split(':')
    assert catalogs[owner][goal_id] == row['goal']
for lane in ['mapping', 'extraction', 'officialCapture']:
    pin = context[lane]
    assert hashlib.sha256(read(ROOT / pin['path'])).hexdigest() == pin['sha256']
raw = obj(ROOT / context['officialCapture']['path'])
raw_goals = {g['id']: g for g in raw['goals']}
extraction = obj(ROOT / context['extraction']['path'])
extracted = {g['id']: g for g in extraction['sourceGoals']}
sources = []
for item in context['extraction']['goals']:
    assert extracted[item['id']]['description'] == item['description']
    assert raw_goals[item['id']]['description'] == item['description']
    assert item['sourceText'] == item['description']
    sources.append({'sourceGoalId': item['id'], 'sourceSpan': item['sourceSpan'],
                    'sourceText': item['sourceText'], 'rawAndExtractionTextEqual': True})
assert len(sources) == 8
assert len(context['mapping']['rows']) == 8
assert all(row['matchType'] == 'partial' for row in context['mapping']['rows'])

qa = obj(FIRST / 'qa-binding-impact.json')
qa_drift = []
for pin in qa['currentInputPins']:
    actual = hashlib.sha256(read(ROOT / pin['path'])).hexdigest()
    if actual != pin['sha256']:
        qa_drift.append({'path': pin['path'], 'old': pin['sha256'], 'current': actual})
deep_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
assert len(qa_drift) == 1 and qa_drift[0]['path'] == deep_path
assert qa_drift[0]['current'] == 'd411e15d22cdb2ef8078fe63ff018bb469c4462642996a74f79dea7df94994b2'
frozen_deep_path = Path('/dev/shm/powi-native-validated-20261107/frozen-root') / deep_path
frozen_deep_raw = frozen_deep_path.read_bytes()
assert hashlib.sha256(frozen_deep_raw).hexdigest() == qa_drift[0]['old']
frozen_deep = json.loads(frozen_deep_raw)
active_deep = obj(ROOT / deep_path)
assert {k: v for k, v in frozen_deep.items() if k != 'subjects'} == {k: v for k, v in active_deep.items() if k != 'subjects'}
assert [s['subject'] for s in frozen_deep['subjects']] == [s['subject'] for s in active_deep['subjects']]
deep_changes = []
for before, after_subject in zip(frozen_deep['subjects'], active_deep['subjects']):
    if before != after_subject:
        assert before['subject'] == 'mathematik'
        deep_changes.append({'subject': before['subject'], 'changedFields': sorted(k for k in set(before) | set(after_subject) if before.get(k) != after_subject.get(k))})
assert len(deep_changes) == 1
assert all(s['landscapePath'] != old['source']['path'] for s in active_deep['subjects'])
inventories = []
for folder in [FIRST, NATIVE, CURRENT]:
    manifest = obj(folder / 'inventory.json')
    for entry in manifest['files']:
        data = read(folder / entry['path'])
        assert len(data) == entry['bytes']
        assert hashlib.sha256(data).hexdigest() == entry['sha256']
    inventories.append({'directory': str(folder.relative_to(ROOT)),
                        'verifiedFiles': len(manifest['files'])})

# These are stored native function results, not newly executed backend cases.
baseline_native = json.loads(gzip.decompress(read(FIRST / 'baseline-native-scope.json.gz')))
candidate_native = json.loads(gzip.decompress(read(FIRST / 'candidate-native-scope.json.gz')))
same_native = ['views', 'routes', 'atomicity', 'memory', 'fingerprints',
               'foreignApplicability', 'codePins']
for field in same_native:
    assert baseline_native[field] == candidate_native[field], field
view_count = len(baseline_native['views'])
assert view_count == 28

comparison = obj(CURRENT / 'native-comparison.json')
assert hashlib.sha256(read(CURRENT / 'inventory.json')).hexdigest() == '9ac45cb5c4d5a3299d3c0f1b2919131129b25b36fe834470bf96635a24b3a01a'
assert hashlib.sha256(read(CURRENT / 'native-comparison.json')).hexdigest() == '3602cb80044ef12d72da3e85abbe7e90b777913a9ef384d3b5283ef1720981b8'
for carrier in comparison['carriers']:
    uncompressed = gzip.decompress(read(CURRENT / carrier['path']))
    assert len(uncompressed) == carrier['rawBytes']
    assert hashlib.sha256(uncompressed).hexdigest() == carrier['rawSha256']
current_before = json.loads(gzip.decompress(read(CURRENT / 'baseline-native-scope.json.gz')))
current_after = json.loads(gzip.decompress(read(CURRENT / 'candidate-native-scope.json.gz')))
for field in same_native:
    assert current_before[field] == current_after[field], field
assert len(current_before['views']) == 28
assert sum(len(v['variants']) for v in current_before['views']) == 252
app_before = copy.deepcopy(current_before['applicability'])
app_after = copy.deepcopy(current_after['applicability'])
evidence_deltas = []
for a, b in zip(app_before['goals'], app_after['goals']):
    ea, eb = a.pop('evidence'), b.pop('evidence')
    assert a == b
    if ea != eb:
        assert a['goalId'] == intro
        removed = [e for e in ea if e not in eb]
        added = [e for e in eb if e not in ea]
        assert len(removed) == 64 and not added
        assert all(e['kind'] == 'requires-closure' for e in removed)
        evidence_deltas.append({'goalId': intro, 'removedOrigins': len(removed), 'addedOrigins': len(added)})
assert app_before == app_after
assert len(app_before['goals']) == 512
assert len(current_before['strict']['findings']) == 603
assert len(current_after['strict']['findings']) == 599
assert [(c['id'], c['findingCount']) for c in current_before['strict']['checks'] if c['id'] in ['G01a', 'G17']] == [('G01a', 477), ('G17', 126)]
assert [(c['id'], c['findingCount']) for c in current_after['strict']['checks'] if c['id'] in ['G01a', 'G17']] == [('G01a', 477), ('G17', 122)]
foreign_equal = 0
foreign_changed = []
for a, b in zip(current_before['foreignStrict'], current_after['foreignStrict']):
    assert a['landscapeId'] == b['landscapeId']
    if a == b:
        foreign_equal += 1
    else:
        foreign_changed.append(a['landscapeId'])
assert foreign_equal == 19 and foreign_changed == ['a0e13c56-c25f-4742-9272-3a1a603ee52e']

for path, pin in pins.items():
    assert hashlib.sha256((ROOT / path).read_bytes()).hexdigest() == pin['sha256']
report = {
    'startedAtActual': started, 'finishedAtActual': utc(),
    'status': 'independent-input-and-carrier-checks-pass',
    'reviewStartObservedUtc': '2026-11-07 04:49:18 UTC',
    'dataApplied': False, 'runtimeExecutedByThisScript': False,
    'sourceSha256': hashlib.sha256(source_raw).hexdigest(),
    'candidateSha256': hashlib.sha256(candidate_raw).hexdigest(),
    'operationsCanonicalBytesIdenticalToOriginal': True,
    'onlyChangedFields': operations, 'survivingPaths': paths,
    'unchangedWholeGoals': len(unchanged), 'allCanonicalGoals': len(goals),
    'heldWholeGoalUnchanged': True, 'orientationWholeGoalUnchanged': True,
    'contextWholeGoalsMatchCurrentSources': len(context['goalsAndAllAncestors']),
    'sourceTextsMatchStructuredCaptureAndExtraction': len(sources),
    'mappingRowsRemainPartial': len(context['mapping']['rows']),
    'qaBindingPinsUnchangedSinceOriginal': len(qa['currentInputPins']) - len(qa_drift),
    'qaBindingPinDrift': {'changes': qa_drift, 'scope': deep_changes,
                        'frozenComparisonLocator': str(frozen_deep_path),
                        'powiNotEnrolledBeforeOrAfter': True},
    'nativeStoredOutputEqualFields': same_native, 'storedAuthoredViews': view_count,
    'currentStoredNative': {'equalFields': same_native, 'views': 28, 'filterVariants': 252,
                           'compiledApplicabilityEqualGoals': 512,
                           'originEvidenceDeltas': evidence_deltas,
                           'strictFindingsBefore': 603, 'strictFindingsAfter': 599,
                           'foreignGraphReportsEqual': foreign_equal,
                           'foreignGraphReportsChanged': foreign_changed},
    'reviewHarnessCorrections': [
        'Initial own input checker expected extraction.goals; actual schema has sourceGoals. Initial run exited with KeyError before evidence output; corrected schema access used in this successful run. This was a review harness error, not a product failure.',
        'Second run correctly stopped on the changed Deep registry pin. Compared its frozen original bytes to the active file: only mathematics registry fields changed. The drift is recorded explicitly and is not called an unchanged input.'
    ],
    'originalInventoriesVerified': inventories,
    'inputPinsVerifiedAgainAtEnd': pins,
    'limits': [
        'Structured official capture was supplied locally; no live source freshness assertion.',
        'Matching curriculum texts establish provenance, not an official prerequisite order.',
        'This script does not execute a learner service or infer learner mastery.',
        'A/M source binding does not constitute a fresh A/M, D/P/V, M6/M7 or human acceptance review.',
        'Exact model revision, seed, temperature and other inference parameters are not observable here.'
    ]
}
(OUT / 'technical-counterchecks.json').write_text(json.dumps(report, ensure_ascii=False, indent=2) + '\n')
selected = {op['guardGoalId'] for op in new['operations']} | {intro, held, 'a2bd27fa-8e31-59ff-ab34-66fac86c0bb5'}
(OUT / 'semantic-inputs.json').write_text(json.dumps({
    'sourceSha256': report['sourceSha256'],
    'wholeGoals': [g for g in source['goals'] if g['id'] in selected],
    'sourceTexts': sources, 'mappingRows': context['mapping']['rows']
}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({k: v for k, v in report.items() if k != 'inputPinsVerifiedAgainAtEnd'}, ensure_ascii=False, indent=2))
