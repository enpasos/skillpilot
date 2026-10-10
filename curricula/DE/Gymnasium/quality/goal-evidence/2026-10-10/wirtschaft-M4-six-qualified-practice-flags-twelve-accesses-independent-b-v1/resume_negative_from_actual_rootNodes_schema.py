#!/usr/bin/env python3
"""Continue after the positive run; the actual view schema uses rootNodes."""
import hashlib
import json
import subprocess
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
CAP = Path(json.loads((OUT / 'actual-private-capsule-copy.command.json').read_text())['separatePrivateCapsule'])
NODE = '/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'

def dump(n, d):
    p = OUT / n
    assert not p.exists()
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

dump('actual-first-negative-preparation-schema-assumption-failure.no-negative-verdict.json', {
    'previousOuterPythonExitCode': 1,
    'actualCompletedPositiveNativeExitCode': 0,
    'actualPositiveWholeResultExactAuthorPositive': True,
    'failure': "AssertionError: ['viewId', 'landscapeId', 'scope', 'rootNodes', '$schema', 'viewFormatVersion', 'language', 'title']",
    'cause': 'Reviewer helper assumed root instead of the actual rootNodes field; stopped before any negative input write.',
    'negativeRunClaimed': False, 'curricularFailureClaimed': False,
    'correctedInAdditiveSuccessor': 'resume_negative_from_actual_rootNodes_schema.py',
    'wholePositiveNotRepeated': True, 'activeOrSharedWrites': 0
})
positive = json.loads((OUT / 'actual-own-final-six-flags-twelve-accesses-positive.native-result.json').read_text())
vp = CAP / 'curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json'
before = json.loads(vp.read_text())
after = json.loads(vp.read_text())
removed = []
def remove(nodes):
    kept = []
    for node in nodes:
        if node.get('kind') == 'goalEntry' and node.get('goalId') == '15aa72ad-9236-5a68-8482-9408db439af2':
            removed.append(node)
        else:
            if isinstance(node.get('children'), list):
                node['children'] = remove(node['children'])
            kept.append(node)
    return kept
assert isinstance(after['rootNodes'], list)
after['rootNodes'] = remove(after['rootNodes'])
assert len(removed) == 1
vp.write_text(json.dumps(after, ensure_ascii=False, indent=2) + '\n')
dump('actual-real-BB-GK-whole-compatible-15aa-reference-deletion-negative.input.json', {
    'viewPath': str(vp.relative_to(CAP)), 'wholeBefore': before, 'wholeAfter': after,
    'exactRemovedWholeNode': removed[0], 'ordinaryOrSupportGoalReferencesChanged': False,
    'capsuleOnly': True
})
label = 'actual-own-real-BB-GK-whole-compatible-reference-deletion-negative'
result = OUT / (label + '.native-result.json')
argv = [NODE, str(CAP / 'app/node_modules/tsx/dist/cli.mjs'), str(CAP / 'native-nine-practice-country-probe.ts'), str(result)]
r = subprocess.run(argv, cwd=CAP, text=True, capture_output=True)
(OUT / (label + '.native-stdout.txt')).write_text(r.stdout)
(OUT / (label + '.native-stderr.txt')).write_text(r.stderr)
dump(label + '.command-exit.json', {'argv': argv, 'cwd': str(CAP), 'exitCode': r.returncode,
      'resultSHA256': hashlib.sha256(result.read_bytes()).hexdigest() if result.exists() else None})
assert r.returncode == 0, r.stderr
negative = json.loads(result.read_text())
def scopekey(row):
    return (row['viewPath'], row['jurisdiction'], tuple(row['scopeFilters']))
pr = {scopekey(x): x for x in positive['allScopeRows']}
nr = {scopekey(x): x for x in negative['allScopeRows']}
assert pr.keys() == nr.keys()
newmissing = []
for key in pr:
    assert pr[key]['ordinaryTargetIds'] == nr[key]['ordinaryTargetIds']
    terminal_ids = set(pr[key]['actualTerminalIds']) | set(nr[key]['actualTerminalIds'])
    for field in ['visibleAllAtomicIds', 'visibleTargetAtomicIds']:
        assert set(pr[key][field]) - terminal_ids == set(nr[key][field]) - terminal_ids
    delta = sorted(set(nr[key]['missingEffectiveTerminalTargetIds']) - set(pr[key]['missingEffectiveTerminalTargetIds']))
    if delta:
        newmissing.append({'scope': [key[0], key[1], list(key[2])], 'newMissingGoalIds': delta})
assert newmissing == [{'scope': ['curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json', 'DE-BB', ['GK']], 'newMissingGoalIds': ['13b20cee-8977-5b3f-938b-2064e96f2a5b']}]
assert negative['sourceRule'] == positive['sourceRule']
vp.write_text(json.dumps(before, ensure_ascii=False, indent=2) + '\n')
assert json.loads(vp.read_text()) == before
dump('actual-own-real-negative-and-all64-protected-set-checks.summary.json', {
    'positiveWholeNativeResultExactForeignPositive': True,
    'actualPositiveMissingOccurrences': sum(len(x['missingEffectiveTerminalTargetIds']) for x in pr.values()),
    'actualNegativeMissingOccurrences': sum(len(x['missingEffectiveTerminalTargetIds']) for x in nr.values()),
    'actualNewMissingScopeGoalPairs': newmissing,
    'all64OrdinaryAndNonassessmentSupportSetsExact': True, 'sourceRuleWholeExact': True,
    'oneDeletedActuallyApplicableGKWholeMaterialStillRequired': True,
    'restoredPositivePrivateViewWholeSemanticExact': True,
    'productionCheckerCompilerPredicatesFiltersAndThresholdsUnchanged': True,
    'overallM4StillFAILAndNotClaimedPASS': True,
    'scopeApprovalIsBoundedNotWholeCountryCourseM6': True,
    'firstFailedPreparationNotCountedAsNegative': True,
    'activeWrites': 0, 'sharedAuthorCapsuleWrites': 0
})
print(json.dumps({'actualPositiveMissingOccurrences': sum(len(x['missingEffectiveTerminalTargetIds']) for x in pr.values()),
                  'actualNegativeMissingOccurrences': sum(len(x['missingEffectiveTerminalTargetIds']) for x in nr.values()),
                  'newMissingScopeGoalPairs': newmissing, 'sourceUnchanged': True}))
