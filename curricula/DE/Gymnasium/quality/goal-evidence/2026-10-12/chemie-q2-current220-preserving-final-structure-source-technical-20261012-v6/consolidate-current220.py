#!/usr/bin/env python3
"""Inactive transfer of declared inputs only; no model build or review binding.

SPDX-License-Identifier: Apache-2.0
"""
import collections
import copy
import datetime
import hashlib
import json
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12')
OUT = BASE / 'chemie-q2-current220-preserving-final-structure-source-technical-20261012-v6'
V4 = BASE / 'chemie-q2-e81-793-current407-two-real-remedies-root-preparation-20261012-v4'
MM = BASE / 'chemie-q2-MM-own-enrichment-source-boundary-author-20261012-v5'
BB = BASE / 'chemie-q2-current407-source-readiness147-diagnostic-root-delegated-20261012-v4/bbbe-split-placement-inactive-author-v5'
Q3 = BASE / 'chemie-q3-three-current402-active-adoption-root-20261012-v10'
OLD_M = BASE / 'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/memory/M407.current-normal.inactive.config.json'
LIVE = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_CHEMIE.de.json')
LIVE_SEM = Path('curricula/DE/Gymnasium/quality/goal-book-publication/chemie.semantic-kinds.json')
REGISTRY = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
CANONICAL = OUT / 'candidate/canonical533.current407.current220-preserving.inactive.json'
SEMANTIC = OUT / 'candidate/semantic533.current407.current220-preserving.inactive.json'
PROTECTED = {'81373fb7-2a4a-5b2c-acd0-b4e775acaa65', '8be14f15-2258-58e6-ae4e-38953f5d0570', 'c8844ac6-c414-5a0e-9fcd-7d0a82177d09'}


def read(path):
    return json.loads(Path(path).read_text())


def binding(path):
    p = Path(path)
    return {'path': str(p), 'sha256': 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest(), 'bytes': p.stat().st_size}


def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)


def exact_copy(source, target):
    target.parent.mkdir(parents=True, exist_ok=True)
    with target.open('xb') as stream:
        stream.write(Path(source).read_bytes())
    assert target.read_bytes() == Path(source).read_bytes()
    return {'original': binding(source), 'copy': binding(target), 'wholeBytesExact': True}


def lines(path, key):
    result = {}
    for raw in Path(path).read_bytes().splitlines(keepends=True):
        if raw.strip():
            row = json.loads(raw)
            identity = key(row)
            assert identity not in result
            result[identity] = (row, raw)
    return result


def write_lines(path, rows):
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('xb') as stream:
        for _, raw in rows.values():
            stream.write(raw)
    assert len(path.read_bytes().splitlines()) == len(rows)
    return binding(path)


def fields(before, after):
    return {key: {'before': before.get(key), 'after': after.get(key)}
            for key in sorted(set(before) | set(after)) if before.get(key) != after.get(key)}


active = read(LIVE)
old = read(V4 / 'candidate/canonical532.whole-goals-exact.current407.inactive.json')
mm_candidate = read(MM / 'candidate/canonical533.current407.MM-own-boundary.inactive.json')
delta = read(MM / 'author/whole-new-cluster-and-single-parent-contains-delta.json')
active_goals = {g['id']: g for g in active['goals']}
old_goals = {g['id']: g for g in old['goals']}
mm_goals = {g['id']: g for g in mm_candidate['goals']}
assert len(active_goals) == 523 and len(old_goals) == 532
assert not (set(active_goals) - set(old_goals))
changed = {gid for gid in active_goals if active_goals[gid] != old_goals[gid]}
assert len(changed) == 31 and PROTECTED <= changed
intended = changed - PROTECTED
assert len(intended) == 28
new_ids = set(old_goals) - set(active_goals)
assert len(new_ids) == 9
candidate = copy.deepcopy(active)
candidate['goals'] = [copy.deepcopy(old_goals[g['id']] if g['id'] in intended else g) for g in active['goals']]
candidate['goals'].extend(copy.deepcopy(g) for g in old['goals'] if g['id'] in new_ids)
candidate_goals = {g['id']: g for g in candidate['goals']}
parent_id = delta['changedExistingGoalId']
assert candidate_goals[parent_id] == delta['beforeWholeParent']
assert set(fields(delta['beforeWholeParent'], delta['afterWholeParent'])) == {'contains'}
candidate_goals[parent_id]['contains'] = copy.deepcopy(delta['afterWholeParent']['contains'])
wrapper = copy.deepcopy(delta['newWholeCluster'])
assert wrapper['id'] not in candidate_goals
candidate['goals'].append(wrapper)
candidate_goals[wrapper['id']] = wrapper
new_ids.add(wrapper['id'])
final_changed = {gid for gid in active_goals if active_goals[gid] != candidate_goals[gid]}
assert len(candidate_goals) == 533 and len(final_changed) == 29 and len(new_ids) == 10
assert not (PROTECTED & final_changed)
assert all(candidate_goals[gid] == active_goals[gid] for gid in PROTECTED)
assert all(candidate_goals[gid] == mm_goals[gid] for gid in candidate_goals if gid not in PROTECTED)
assert {k: v for k, v in candidate.items() if k != 'goals'} == {k: v for k, v in active.items() if k != 'goals'}
for field in ['contains', 'requires']:
    assert all(target in candidate_goals for g in candidate['goals'] for target in g.get(field, []))
    done, visiting = set(), set()
    def visit(gid):
        assert gid not in visiting, f'{field} cycle at {gid}'
        if gid in done:
            return
        visiting.add(gid)
        for target in candidate_goals[gid].get(field, []):
            visit(target)
        visiting.remove(gid)
        done.add(gid)
    for gid in candidate_goals:
        visit(gid)

active_sem = read(LIVE_SEM)
old_sem = read(MM / 'candidate/semantic533.current407.same-atomic-decisions-plus-own-area.json')
active_rows = {r['goalId']: r for r in active_sem['decisions']}
old_rows = {r['goalId']: r for r in old_sem['decisions']}
semantic = copy.deepcopy(active_sem)
semantic['ledgerId'] = 'chemie-current407-current220-preserving-structure-source-technical-v6'
semantic['sourceLandscapePath'] = str(CANONICAL)
semantic['decisions'] = [copy.deepcopy(old_rows[g['id']] if g['id'] in final_changed | new_ids else active_rows[g['id']]) for g in candidate['goals']]
counts = collections.Counter(r['semanticKind'] for r in semantic['decisions'])
semantic['counts'] = {key: counts[key] for key in active_sem['counts'] if key != 'total'} | {'total': len(candidate_goals)}
assert semantic['counts']['curricularAtomic'] == 407 and semantic['counts']['curricularArea'] == 76
canonical_binding = write(CANONICAL, candidate)
semantic_binding = write(SEMANTIC, semantic)

views = []
for name in ['de-bb-gk.view.json', 'de-bb-lk.view.json', 'de-be-gk.view.json', 'de-be-lk.view.json']:
    views.append(exact_copy(BB / 'prepared-views' / name, OUT / 'views' / name))

registry = read(REGISTRY)
chem = next(s for s in registry['subjects'] if s['subject'] == 'chemie')
current_m = read(chem['memoryReviewConfigPath'])
old_m = read(OLD_M)
current_lines = lines(current_m['reviewPath'], lambda r: r['goalId'])
old_lines = lines(old_m['reviewPath'], lambda r: r['goalId'])
removed_m = set(current_lines) - set(old_lines)
added_m = set(old_lines) - set(current_lines)
changed_m = {gid for gid in set(current_lines) & set(old_lines) if current_lines[gid][0] != old_lines[gid][0]} - PROTECTED
assert len(removed_m) == 4 and added_m == new_ids - {wrapper['id']}
assert changed_m == {'64a5bb87-358d-5a22-958a-f66ba5521cd5', '978a6f25-0601-5457-9211-aab206c95603', 'c245d5fd-ce46-5b45-ab2e-e610547b5f7c', 'd1244f5d-9a12-5b74-97fe-ae974f40af26'}
merged_lines = {gid: (old_lines[gid] if gid in changed_m else row) for gid, row in current_lines.items() if gid not in removed_m}
merged_lines.update({gid: old_lines[gid] for gid in old_lines if gid in added_m})
assert len(merged_lines) == 407 and all(merged_lines[gid][1] == current_lines[gid][1] for gid in PROTECTED)
memory_binding = write_lines(OUT / 'memory/current407.current220-exact-plus-reviewed-N2-lines.jsonl', merged_lines)
current_cards = lines(current_m['cardReviewPath'], lambda r: (r['deckId'], r['cardId']))
old_cards = lines(old_m['cardReviewPath'], lambda r: (r['deckId'], r['cardId']))
assert set(current_cards) == set(old_cards)
q2_cards = {('de_gymnasium_chemistry_natural_q2', 'chem_nat_q2_001'), ('de_gymnasium_chemistry_natural_q2', 'chem_nat_q2_002')}
changed_cards = {key for key in current_cards if current_cards[key][0] != old_cards[key][0]}
assert changed_cards == q2_cards | {('de_gymnasium_chemistry_equilibria_q3', 'chem_eq_q3_009')}
merged_cards = {key: (old_cards[key] if key in q2_cards else row) for key, row in current_cards.items()}
assert merged_cards[('de_gymnasium_chemistry_equilibria_q3', 'chem_eq_q3_009')][1] == current_cards[('de_gymnasium_chemistry_equilibria_q3', 'chem_eq_q3_009')][1]
cards_binding = write_lines(OUT / 'memory/current75.currentQ3-card009-exact-plus-reviewed-N2-origin-retargets.jsonl', merged_cards)

author_inputs = []
neutral = read(V4 / 'FINAL.current-two-real-remedies.neutral-review-input.json')
author_paths = [V4 / 'positive/P35.other-whole-record-lines.exact.jsonl'] + [Path(x['path']) for x in neutral['positiveInputs']] + [BASE / 'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/positive/P2.current-M1-and-3fb7-retained.exact.jsonl', BASE / 'chemie-q2-naturstoffe-current407-targeted-remediation-root-preparation-20261012-v3/later-stage-source6/positive/P1.current-fcc-collateral.exact.jsonl']
for p in author_paths:
    author_inputs.append(exact_copy(p, OUT / 'positive' / p.name))
author_inputs.append(exact_copy(Path(neutral['wholeSevenOperativeCases']['path']), OUT / 'cases' / 'two-goals-seven-whole-operative-cases.DEEN.exact.json'))
q3_inputs = []
for number in [1, 2, 3]:
    p = Q3 / f'active-configs/P{number}.config.json'
    q3_inputs.append({'activeConfig': binding(p), 'authorRecord': exact_copy(Path(read(p)['reviewPath']), OUT / 'positive' / f'currentQ3-P{number}.original-author.exact.jsonl')})
write(OUT / 'positive/author-inputs.exact-retention.manifest.json', {'role': 'Original author inputs retained exactly; not new native/current-peer bindings', 'N2AuthorInputs': author_inputs, 'currentQ3AuthorInputs': q3_inputs, 'technicalPathRewritesInsideOriginalRecords': 0, 'futureQ4OverlayRequiredBeforeNativeMaterialization': True})

asset_source = read(V4 / 'assets/all412-actual-image-source-bindings.json')
old_assets = {x['goalId']: x for x in asset_source['assets']}
assets = []
for gid in sorted(final_changed | new_ids | PROTECTED):
    images = [r for r in candidate_goals[gid].get('resourceLinks', []) if r.get('resourceType') == 'image' and r.get('type') == 'goal-visualization']
    if not images:
        continue
    assert len(images) == 1
    resource = images[0]
    if gid in PROTECTED:
        p = Path('app/public') / resource['url'].lstrip('/')
        row = {'goalId': gid, 'resourceUrl': resource['url'], 'resourceBody': resource, 'actualAsset': binding(p), 'protection': 'whole current Q3 resource and PNG retained'}
    else:
        selected = old_assets[gid]
        assert binding(selected['path'])['sha256'] == selected['sha256']
        row = {'goalId': gid, 'resourceUrl': resource['url'], 'resourceBody': resource, 'actualAsset': binding(selected['path']), 'protection': 'declared N2 kept author asset, not regenerated'}
    assets.append(row)
assert len(assets) > 3 and PROTECTED <= {r['goalId'] for r in assets}
write(OUT / 'assets/changed-N2-and-protected-Q3.actual-source-bindings.json', {'assets': assets, 'newImagesGenerated': 0, 'nativeRendersProduced': 0})

baseline_refs = [LIVE, LIVE_SEM, REGISTRY, Path(chem['visualizationQaPath']), Path(chem['memoryReviewConfigPath']), Path(current_m['reviewPath']), Path(current_m['cardReviewPath'])]
baseline_refs += [Path(x) for x in chem['positiveEvidenceConfigPaths'] if str(Q3) in x]
baseline_refs += [Path(x) for x in chem['semanticAtomicityConfigPaths'] if str(Q3) in x]
baseline_refs += [Path(x) for x in chem['resolutionIndexPaths'] if str(Q3) in x]
baseline = {str(p): binding(p) for p in baseline_refs}
receipt = {'artifactRole': 'Inactive technical transfer of already declared Q2/MM/BBBE inputs; no independent scientific approval', 'createdAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'baselineMain': '5cd49400726af19d1be72c3add687ea53293934c', 'baselineStrictComplete': 220, 'baselineDenominator': 402, 'canonical': canonical_binding, 'semanticLedger': semantic_binding, 'nodeCount': 533, 'candidateAtomicDenominator': 407, 'currentMetadataExact': True, 'intendedChangedCommonGoalCount': len(final_changed), 'intendedChangedGoalFields': {gid: fields(active_goals[gid], candidate_goals[gid]) for gid in sorted(final_changed)}, 'nineSplitNodesAndOneOwnAreaNode': sorted(new_ids), 'unchangedExistingWholeGoalCount': len(active_goals) - len(final_changed), 'protectedQ3WholeGoals': {gid: {'wholeBodyExact': candidate_goals[gid] == active_goals[gid], 'wholeCurrentBody': active_goals[gid]} for gid in sorted(PROTECTED)}, 'candidateEqualsHistoricalMMWholeBodiesExceptProtectedCurrentQ3': True, 'semanticDecisionRowsKeptOrCopiedExact': True, 'newClassificationDecisions': 0, 'containsAndRequiresEndpointAndCycleChecks': 'pass on new candidate only', 'BBBEViewsCopiedExact': views, 'memory': {'candidateNecessityLines': memory_binding, 'removedAreaGoalIds': sorted(removed_m), 'newReviewedAtomicGoalIds': sorted(added_m), 'fourDeclaredN2NecessityRowReplacements': sorted(changed_m), 'currentOther394NecessityLinesWholeBytesExact': sum(gid in current_lines and merged_lines[gid][1] == current_lines[gid][1] for gid in merged_lines), 'allThreeQ3NecessityLinesExact': True, 'candidateCardLines': cards_binding, 'currentOther73CardLinesExact': True, 'currentQ3Card009Exact': True, 'twoExistingReviewedQ2OriginRetargets': sorted(q2_cards), 'newMemoryVotes': 0}, 'activeInputBindingsUntouched': baseline, 'current220PreservationBoundary': 'Active canonical/registry/QA/P/A/M/D inputs remain untouched. Authorized Q2 field changes include current197/7b requires retargets; future strict220 preservation is not claimed until normal final binding checks after Q4 overlay.', 'noNativeBuildOrPeerBindings': True, 'futureQ4AdoptionBaselineOverlayPending': True, 'activeWrites': False, 'gitMutations': False, 'newScientificVotes': 0, 'strictGain': 0}
write(OUT / 'checks/canonical-semantic-P-M-assets.conservation.actual.json', receipt)
print(json.dumps({'canonical': str(CANONICAL), 'semantic': str(SEMANTIC), 'newNodes': len(new_ids), 'changedExisting': len(final_changed), 'unchangedExisting': len(active_goals) - len(final_changed), 'memoryLines': len(merged_lines), 'cardLines': len(merged_cards), 'assetBindings': len(assets), 'noNativeBuildOrPeerBindings': True}))
