import copy
import datetime
import hashlib
import json
from pathlib import Path

Q = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
A = Q / 'wirtschaft-final702-nine-local-whole-practices-and-qualified-scope-route-COMPOSITION-INERT-v1'
O = Q / 'wirtschaft-117-pure-support-practice-scope-retirements-independent-a-READONLY-v1'

def read(p): return json.loads(Path(p).read_text())
def artifact(p):
    p = Path(p); b = p.read_bytes()
    return {'path': str(p), 'sha256': hashlib.sha256(b).hexdigest(), 'bytes': len(b)}
def binding(x):
    a = artifact(x['path'])
    return a['sha256'] == x['sha256'].removeprefix('sha256:') and a['bytes'] == x['bytes']

checks = []
def check(name, ok):
    checks.append({'check': name, 'passed': bool(ok)})
    assert ok, name

sealpath = A / 'SEALED-final702-346-source2135-and-whole-route-author-handoff.INERT.json'
seal = read(sealpath)
check('actual immutable Authorseal SHA supplied by author', artifact(sealpath)['sha256'] == 'd6c8b2855769b6425298a8e8777377efc06d60f6b2385fbca52743f73f0e4d50')
check('author manifest binding', binding(seal['artifactManifest']))
check('actual Root-ready handoff binding', binding(seal['handoff']))
manifest = read(seal['artifactManifest']['path'])
check('all69 immutable author artifact byte bindings', len(manifest['artifacts']) == 69 and all(binding(x) for x in manifest['artifacts']))
indexpath = A / 'actual-42-scope-20-old-whole-practice-only-support-target-retirement.AUTHOR-INERT.json'
index = read(indexpath)
nativepath = O / 'actual-native117-support-only-pairs-35roles-32national-projections.READONLY.json'
native = read(nativepath)
check('actual own787 native role/authority checks passed', len(native['checks']) == 787 and all(x['passed'] for x in native['checks']))
check('production code exact independently qualified SOME filter', artifact('app/scripts/generateCurriculumQualityStatus.ts')['sha256'] == native['currentCodeSha256'] == '514bab03b7c041655e0063a4bf6ecb7ac4cd51edda9581e76182e980aa384957')
check('whole materialCore and original native input bindings', binding(index['wholeCAN']) and binding(index['sourceNativeReport']))
ready = read(seal['handoff']['path'])
check('final Root-ready same unchanged whole core', ready['currentCore']['sha256'].removeprefix('sha256:') == index['wholeCAN']['sha256'].removeprefix('sha256:'))
check('final actual bounded native report binding', binding(ready['nativeBoundedReceipt']))
final = read(ready['nativeBoundedReceipt']['path'])
check('actual native current final code and uncapped result bindings', binding(final['nativeCodeOriginal']) and binding(final['nativeFullJSON']))
check('actual final11 bounded native rules pass with uncapped details empty', len(final['rules']) == 11 and all(x['status'] == 'pass' for x in final['rules']) and final['uncappedDetails0'] is True)
guardpaths = [sealpath, Path(seal['artifactManifest']['path']), Path(seal['handoff']['path']), indexpath, Path(index['wholeCAN']['path']), Path(index['sourceNativeReport']['path']), Path(ready['nativeBoundedReceipt']['path']), Path(final['nativeFullJSON']['path'])] + [Path(x['path']) for x in manifest['artifacts']]
before = [artifact(p) for p in dict.fromkeys(guardpaths)]
rows = index['rows']
check('actual21 Stateviews117 Practice/scope pairs20 whole old PracticeIDs', len(index['viewPairs']) == 21 and len(rows) == 117 and len({r['wholePracticeGoalId'] for r in rows}) == 20)
check('actual42 unexpected scopes21States21country-resolved Nationalviews', len(index['rawNativeUnexpectedScopes']) == 42 and len(index['nationalResolvedScopesPreservedByMatchingStateTargetAuthority']) == 21)
viewproofs = []; total = 0

def path_parts(path):
    import re
    return [int(n) if n else k for k, n in re.findall(r'\.([A-Za-z]+)|\[(\d+)\]', path)]

for pair in index['viewPairs']:
    check('actual bound before/after whole View ' + pair['activePath'], binding(pair['before']) and binding(pair['candidate']))
    original = read(pair['before']['path']); candidate = read(pair['candidate']['path'])
    scoped = [r for r in rows if r['scope'] == pair['activePath']]
    ids = {r['wholePracticeGoalId'] for r in scoped}; stable_refs = []
    def prune(nodes, path):
        result = []
        for i, node in enumerate(nodes):
            loc = path + '[' + str(i) + ']'
            if node.get('kind') == 'goalEntry' and node.get('goalId') in ids:
                stable_refs.append({'stableWholeBeforePath': loc, 'wholeNode': node})
                continue
            node = copy.deepcopy(node)
            if 'children' in node: node['children'] = prune(node['children'], loc + '.children')
            result.append(node)
        return result
    expected = copy.deepcopy(original); expected['rootNodes'] = prune(expected['rootNodes'], '$.rootNodes')
    check('whole View differs only by claimed Practice references; all other nodes/fields exact ' + pair['activePath'], expected == candidate)
    # Author path coordinates describe successive removals, not stable indices
    # into the whole-before snapshot. Replay their exact order, then independently
    # retain stable whole-before paths above as a complete immutable delta proof.
    replay = copy.deepcopy(original); operationproof = []
    for row in scoped:
        check('no hidden inherited-role changes ' + row['wholePracticeGoalId'], row['explicitInheritedRoleMask'] is None)
        for reference in row['removedWholeReferences']:
            parts = path_parts(reference['path']); parent = replay
            for part in parts[:-1]: parent = parent[part]
            node = parent[parts[-1]]
            check('actual whole node matches logged successive removal coordinate ' + reference['path'], node == reference['wholeNode'] and node['kind'] == 'goalEntry' and node['goalId'] == row['wholePracticeGoalId'] and node.get('projectionRole', 'target') == 'target')
            del parent[parts[-1]]
            operationproof.append(reference)
    check('replay of all exact logged author removals gives entire proposed View ' + pair['activePath'], replay == candidate)
    total += len(stable_refs)
    viewproofs.append({'activePath': pair['activePath'], 'stableWholeBeforeReferences': stable_refs, 'actualSequentialRemovalCoordinatesVerified': operationproof, 'allOtherWholeFieldsAndNodesExact': True})
check('actual direct117 removed whole State references', total == 117)

previous_matrix = read(Q / 'wirtschaft-final701-eight-whole-local-practices-and-qualified-scope-route-COMPOSITION-INERT-v1/actual-35-missing-expected-endpoint-whole-goal-target-vs-support-only-scope-evidence.READONLY.json')['rows']
genuine = [r for r in previous_matrix if r['allActuallyAssessedPrerequisitesTarget']]
check('genuine24 actual targeted offer rows identified', len(genuine) == 24)
roles = {r['active']: r for r in native['ordinaryRoleComparisons']}
for row in genuine:
    check('actual genuinely targeted Practice offer retained ' + row['scope'] + ':' + row['endpointId'], row['endpointId'] not in roles[row['scope']]['removedPracticeTargets'])
check('author scope delta contains zero Source/PAM/whole material/ordinary role changes', index['ordinaryRoleDeltas'] == index['SourcePAMDeltas'] == index['wholeMaterialBodyDeltas'] == 0)
core = read(index['wholeCAN']['path']); cmap = {g['id']: g for g in core['goals']}
current = read('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'); amap = {g['id']: g for g in current['goals']}
registry = read('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
economics = next(s for s in registry['subjects'] if s['subject'] == 'wirtschaftswissenschaften')
sem = read(economics['semanticKindLedgerPath']); ordinary = {x['goalId'] for x in sem['decisions'] if x['semanticKind'] == 'curricularAtomic'}
check('all346 current ordinary whole objects exact to prospective702', len(ordinary) == 346 and all(amap[x] == cmap[x] for x in ordinary))
end = [artifact(p) for p in dict.fromkeys(guardpaths)]
check('all author wholeCore/materials/native reports/Views/seal before/endguards exact', before == end)

receipt = {'schemaVersion': 1, 'reviewedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'decision': 'KEEP', 'status': 'independent_KEEP117_state_refs42_projection_scope_effects20_whole_old_support_Practices', 'reviewer': {'provider': 'OpenAI', 'model': 'GPT-6', 'runtime': 'Codex', 'agent': 'economics_final56_current_round_a', 'exactModelRevision': 'not_exposed', 'samplingParameters': 'not_exposed'}, 'scopeBoundary': 'Retire only whole learner-target Practice references whose entire assessed contract contains no actual target in that precise State/course projection. Ordinary target/support roles, whole canonical IDs/materials and Source/PAM bodies remain. National offers remain available where matching State authority retains a genuine assessedTarget.', 'counts': {'affectedProjectionScopes': 42, 'stateViews': 21, 'resolvedNationalScopes': 21, 'actualRemovedDirectPracticeReferences': 117, 'uniqueOldPracticeIDs': 20, 'allWholeViewsCompared': 35, 'nationalCountryResolvedProjectionsCompared': 32, 'genuineTargetOffersPreserved': 24, 'ordinaryWholeGoalsProtected': 346}, 'authorSeal': artifact(sealpath), 'actualOwn787NativeRoleAuthorityProof': artifact(nativepath), 'actualBeforeGuards': before, 'actualEndGuards': end, 'wholeViewDeltaProofs': viewproofs, 'authorPathCoordinateMeaning': 'All logged JSONPath coordinates verified by replay in the author rows order. They are successive removal coordinates; independently reconstructed stable whole-before paths are also supplied. No unverified path is claimed to be a stable before-snapshot coordinate.', 'actualGenuineTargetOfferRowsRetained': genuine, 'checks': checks, 'finalActualNative11RulePassBindingReused': ready['nativeBoundedReceipt'], 'independenceBoundary': 'Independent from Plan scope author. Prior own NAIRU/P,7c scope, six partial-source proposals and three new Practice authorship disclosed. This qualifies only the117 bounded old Practice role removals, not fresh historical20 material science, unrelated702Core author changes,4eSH course-content authorship, future SEM/configfollowers or D/V.', 'actualWholeHistorical20PracticeScienceReviewClaim': False, 'SourcePAMBodyChanges': 0, 'activeWrites': 0, 'humanApproval': False, 'M6M7OrFullCIClaim': False, 'DOrVApprovalClaim': False}
output = O / 'actual-independent117-whole-support-practice-ref-retirements-42scopes-35views-32national-KEEP.SEALED.receipt.json'
assert not output.exists()
output.write_text(json.dumps(receipt, ensure_ascii=False, indent=2) + '\n')
ownseal = O / 'SEALED-independent117-support-only-practice-target-retirement.READONLY.json'
assert not ownseal.exists()
ownseal.write_text(json.dumps({'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'status': 'SEALED_independent_KEEP117_support_onlyPracticeTargetRemovals', 'artifacts': [artifact(x) for x in sorted(O.iterdir()) if x.is_file()], 'activeWrites': 0, 'humanApproval': False, 'M6M7OrCIClaim': False}, ensure_ascii=False, indent=2) + '\n')
print(json.dumps({'receipt': artifact(output), 'seal': artifact(ownseal), 'wholeViewChecks': len(checks), 'nativeRoleChecks': len(native['checks']), 'activeWrites': 0}))
