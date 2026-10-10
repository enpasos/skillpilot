#!/usr/bin/env python3
import hashlib
import json
import shutil
import subprocess
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
B = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10/wirtschaft-M4-nine-existing-practice-requires-derived-country-metadata-author-v1/postmerge-current496-exact-material-status-baseline-successor-v2'
S = B / 'six-foreign-whole-qualified-metadata-and-twelve-accesses-author-successor-v3'
CAP = Path(json.loads((OUT / 'actual-private-capsule-copy.command.json').read_text())['separatePrivateCapsule'])
NODE = '/tmp/skillpilot-checkpoint-native-node-8zpgjgml/npm-cache/_npx/185e25162edaacfb/node_modules/node/bin/node'

def sha(p):
    return hashlib.sha256(Path(p).read_bytes()).hexdigest()

def dump(name, d):
    p = OUT / name
    assert not p.exists()
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')

handoff = json.loads((S / 'actual-final-six-foreign-whole-qualified-practice-flags-and-twelve-country-accesses.author-handoff.json').read_text())
assert sha(ROOT / handoff['manifest']['path']) == handoff['manifest']['sha256']
manifest = json.loads((ROOT / handoff['manifest']['path']).read_text())
guards = []
for row in manifest['files'] + manifest['dependencyInputs']:
    actual = sha(ROOT / row['path'])
    assert actual == row['sha256'], row['path']
    guards.append({**row, 'actualSHA256': actual, 'wholeExact': True})
access = json.loads((ROOT / handoff['accessIndex']['path']).read_text())
for v in access['views']:
    shutil.copyfile(ROOT / v['candidate']['path'], CAP / v['activePath'])
canpath = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')
shutil.copyfile(ROOT / handoff['candidateCAN']['path'], CAP / canpath)
sem = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/wirtschaft-current496-qualified-M3-materials-20261010-v5/wirtschaftswissenschaften.semantic-kinds.json')
shutil.copyfile(ROOT / handoff['candidateSEM']['path'], CAP / sem)

# Verify the entire checker copy: exactly one diagnostic push and two exports,
# with no predicate, filter, threshold or evaluator edit.
checker = (ROOT / 'app/scripts/generateCurriculumQualityStatus.ts').read_text()
capsule_checker = (CAP / 'app/scripts/generateCurriculumQualityStatus.ts').read_text()
diagnostic = "      ownProjectedScopeRows.push({viewPath:toRepoPath(file),jurisdiction,scopeFilters,scopeLabel,ordinaryTargetIds:visibleSelectedGoals.map(g=>g.id),visibleAllAtomicIds:[...visibleAtomicGoalIds],visibleTargetAtomicIds:[...visibleTargetAtomicGoalIds],expectedTerminalIds:expectedTerminalGoalIds,actualTerminalIds:actualTerminalGoalIds,missingEffectiveTerminalTargetIds:goalsMissingEffectiveTerminalRoute.map(g=>g.id),wholeMaterialCoverageBindingIssues:terminalMaterialCoverageBindingIssues,wholeMaterialPrerequisiteClosureIssues});\n"
exports = '\nexport const ownProjectedScopeRows:any[]=[];\nexport {routeProfiles,evaluateRouteProfile,collectWholeMaterialPrerequisiteClosure,readJurisdictionCoverageByLandscapeId,evaluateJurisdictionCoverage};\n'
assert capsule_checker.count(diagnostic) == 1
assert capsule_checker.endswith(exports)
assert capsule_checker.replace(diagnostic, '', 1)[:-len(exports)] == checker
assert sha(ROOT / 'app/scripts/applicabilityCompiler.ts') == sha(CAP / 'app/scripts/applicabilityCompiler.ts')
assert sha(ROOT / 'app/scripts/generateCurriculumQualityStatus.ts') == handoff['actualNativeCheckerHash']['sha256']
assert sha(NODE) == '6295488653f0d93b0a157841746fef7e72cc4328cfb60c4bbe0ca2668a836ffd'

dump('actual-private-native-positive-inputs-and-unmodified-code.guard.json', {
    'wholeAuthorManifestFilesAndDependencies': guards,
    'checkerWholeOriginalSHA256': sha(ROOT / 'app/scripts/generateCurriculumQualityStatus.ts'),
    'wholeNativeCompilerSHA256': sha(ROOT / 'app/scripts/applicabilityCompiler.ts'),
    'checkerDiagnosticOnlyExactReconstruction': True,
    'nativeHelperSourceSHA256': sha(CAP / 'native-nine-practice-country-probe.ts'),
    'pinnedNode20': {'path': NODE, 'sha256': sha(NODE)},
    'positiveCAN': {'path': str(canpath), 'sha256': sha(CAP / canpath)},
    'positiveSEM': {'path': str(sem), 'sha256': sha(CAP / sem)},
    'positiveEightWholeViews': [{'path': v['activePath'], 'sha256': sha(CAP / v['activePath'])} for v in access['views']],
    'priorAuthorNegativeViewRestoredFromFrozenPositiveCandidate': True,
    'sourceAndMemoryCollectorCopiesRetainedPhysically': True,
    'activeWrites': 0, 'sharedAuthorCapsuleWrites': 0
})

def run(label):
    result = OUT / (label + '.native-result.json')
    argv = [NODE, str(CAP / 'app/node_modules/tsx/dist/cli.mjs'), str(CAP / 'native-nine-practice-country-probe.ts'), str(result)]
    r = subprocess.run(argv, cwd=CAP, text=True, capture_output=True)
    (OUT / (label + '.native-stdout.txt')).write_text(r.stdout)
    (OUT / (label + '.native-stderr.txt')).write_text(r.stderr)
    dump(label + '.command-exit.json', {'argv': argv, 'cwd': str(CAP), 'exitCode': r.returncode,
          'resultSHA256': sha(result) if result.exists() else None, 'productionCheckerUnchanged': True})
    assert r.returncode == 0, r.stderr
    d = json.loads(result.read_text())
    print(json.dumps({'label': label, 'goalCount': d['goalCount'], 'compiler': d['compilerSummary'],
                      'sourceRule': d['sourceRule']['status'], 'routeRules': [{'id': x['id'], 'status': x['status']} for x in d['nativeRules']]}), flush=True)
    return d

positive = run('actual-own-final-six-flags-twelve-accesses-positive')
author_positive = json.loads((ROOT / handoff['nativePositive']['path']).read_text())
assert positive == author_positive

# A genuinely required, course/country-compatible BB-GK terminal reference is
# removed while all ordinary targets and support references remain untouched.
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
assert isinstance(after.get('root'), dict), list(after)
after['root']['children'] = remove(after['root']['children'])
assert len(removed) == 1
vp.write_text(json.dumps(after, ensure_ascii=False, indent=2) + '\n')
dump('actual-real-BB-GK-whole-compatible-15aa-reference-deletion-negative.input.json', {
    'viewPath': str(vp.relative_to(CAP)), 'wholeBefore': before, 'wholeAfter': after,
    'exactRemovedWholeNode': removed[0], 'ordinaryOrSupportGoalReferencesChanged': False,
    'capsuleOnly': True
})
negative = run('actual-own-real-BB-GK-whole-compatible-reference-deletion-negative')
def scopekey(row):
    return (row['viewPath'], row['jurisdiction'], tuple(row['scopeFilters']))
pr = {scopekey(x): x for x in positive['allScopeRows']}
nr = {scopekey(x): x for x in negative['allScopeRows']}
assert pr.keys() == nr.keys()
newmissing = []
for key in pr:
    assert pr[key]['ordinaryTargetIds'] == nr[key]['ordinaryTargetIds']
    # All non-assessment atomic target/support entries remain precisely equal.
    terminal_ids = set(pr[key]['actualTerminalIds']) | set(nr[key]['actualTerminalIds'])
    for field in ['visibleAllAtomicIds', 'visibleTargetAtomicIds']:
        assert set(pr[key][field]) - terminal_ids == set(nr[key][field]) - terminal_ids
    delta = sorted(set(nr[key]['missingEffectiveTerminalTargetIds']) - set(pr[key]['missingEffectiveTerminalTargetIds']))
    if delta:
        newmissing.append({'scope': list(key), 'newMissingGoalIds': delta})
assert newmissing == [{'scope': ['curricula/DE/Gymnasium/composition-views/wirtschaft/de-bb-gym-economics-gk.view.json', 'DE-BB', ('GK',)], 'newMissingGoalIds': ['13b20cee-8977-5b3f-938b-2064e96f2a5b']}]
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
    'activeWrites': 0, 'sharedAuthorCapsuleWrites': 0
})
