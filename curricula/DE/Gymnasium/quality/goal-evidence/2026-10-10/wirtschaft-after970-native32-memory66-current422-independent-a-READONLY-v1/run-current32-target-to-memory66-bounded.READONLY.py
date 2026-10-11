from pathlib import Path
import argparse
import datetime
import hashlib
import json
import subprocess


parser = argparse.ArgumentParser()
parser.add_argument('--native', required=True)
parser.add_argument('--native-guard', required=True)
parser.add_argument('--native-seal', required=True)
parser.add_argument('--prior-proof-dir', required=True)
parser.add_argument('--output-dir', required=True)
args = parser.parse_args()
out = Path(args.output_dir)
prior = Path(args.prior_proof_dir)
assert not list(out.glob('SEALED-*')), 'Never rewrite an existing seal'
read = lambda p: json.loads(Path(p).read_text())
sha = lambda p: hashlib.sha256(Path(p).read_bytes()).hexdigest()
rows = lambda p: [json.loads(x) for x in Path(p).read_text().splitlines() if x.strip()]
now = lambda: datetime.datetime.now(datetime.timezone.utc).isoformat()
head = lambda: subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip()


def write(name, value):
    with (out / name).open('x') as handle:
        handle.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')


registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(registry_path)
subject = next(x for x in registry['subjects'] if x['label'] == 'Wirtschaftswissenschaften')
config_path = subject['memoryReviewConfigPath']
config = read(config_path)
assert len(config['visibilityScopes']) == 48
primary_paths = [config_path, config['landscapePath'], config['semanticKindLedgerPath'],
                 config['reviewPath'], config['cardReviewPath']]
primary_paths += [x['viewPath'] for x in config['visibilityScopes']]
assert len(primary_paths) == len(set(primary_paths)) == 53
can = read(config['landscapePath'])
memory_goals = [g for g in can['goals'] if any(t.startswith('srs-deck:') for t in g.get('tags', []))]
assert len(memory_goals) == 10
deck_paths = []
for goal in memory_goals:
    for key in ['vocabularySource', 'vocabularySourceEn']:
        source = goal.get('extendedData', {}).get(key)
        if not source:
            continue
        runtime = Path('app/public' + source) if source.startswith('/data/') else Path(source.lstrip('/'))
        canonical = Path('curricula/DE/Gymnasium/memory-decks') / runtime.name
        assert runtime.is_file() and canonical.is_file()
        deck_paths.extend([str(runtime), str(canonical)])

positive_config_paths = subject['positiveEvidenceConfigPaths']
assert len(positive_config_paths) == 45
positive_configs = [read(p) for p in positive_config_paths]
positive_review_paths = sorted({p['reviewPath'] for p in positive_configs})
native_guard = read(args.native_guard)
assert native_guard['nativeExitCode'] == 0
assert native_guard['completedExactOneNative32Run']
assert native_guard['allInputGuardsExact']
assert native_guard['inputsBefore'] == native_guard['inputsAfter']
assert native_guard['activeWrites'] == native_guard['runtimeCodeMutations'] == 0
native_source = native_guard['sourcePath']
assert sha(native_source) == native_guard['sourceSHA256']
prior_preparation_path = prior / 'actual-66-required-whole-decisions-and10-canonical-deck-owner-bindings.READONLY.json'
prior_result_path = prior / 'actual32-required422-pairs-and-current-visible-deck-owners.independent-KEEP.READONLY.json'
prior_program = prior / 'run-bounded32-target-to66-memory-visibility.READONLY.py'
prior_input = prior / 'input-before.actual-active48-views-and-whole-memory-payloads.READONLY.json'
prior_seal = prior / 'SEALED-native32-memory66-required422pairs-missing0.independent-a-KEEP.READONLY.json'
native_seal = read(args.native_seal)
assert native_seal['nativeRuns'] == 1
native_binding = next(x for x in native_seal['artifacts'] if x['path'] == args.native)
assert sha(args.native) == native_binding['sha256'] == '728e9b2fd7bd6f4df838ccdcdb906f090c839fed41d03146e64d2dc57a627672'
for artifact in native_seal['artifacts']:
    assert sha(artifact['path']) == artifact['sha256']

paths = list(dict.fromkeys(primary_paths + [registry_path, 'app/scripts/memoryCardReview.ts', config['reportPath']]
                          + positive_config_paths + positive_review_paths + deck_paths
                          + list(native_guard['inputsAfter']) + [args.native, args.native_guard, args.native_seal,
                                                                 native_source, str(prior_preparation_path),
                                                                 str(prior_result_path), str(prior_program),
                                                                 str(prior_input), str(prior_seal)]))
before = {'HEAD': head(), 'capturedAt': now(), 'primaryMemoryScopeBindings': 53,
          'positiveConfigs': 45, 'positiveReviewFiles': len(positive_review_paths),
          'canonicalAndRuntimeDeckFiles': len(set(deck_paths)),
          'bindings': [{'path': p, 'sha256': sha(p)} for p in paths]}
write('input-before.current53-memory-scope-plus-P-cards-native.READONLY.json', before)

prep = read(prior_preparation_path)
old_hashes = {x['path']: x['sha256'] for x in read(prior_input)['bindings']}
for path in [config['landscapePath'], config['reviewPath'], config['cardReviewPath'], config['semanticKindLedgerPath']]:
    assert sha(path) == old_hashes[path], 'Qualified whole payload must be retained'
decisions = rows(config['reviewPath'])
assert len(decisions) == 346 and len({x['goalId'] for x in decisions}) == 346
required_decisions = [r for r in decisions if r['status'] == 'memory_required']
assert len(required_decisions) == 66
assert {r['goalId']: r for r in required_decisions} == {r['goalId']: r['wholeDecision'] for r in prep['requiredRows']}
goals = {g['id']: g for g in can['goals']}
kinds = {r['goalId']: r['semanticKind'] for r in read(config['semanticKindLedgerPath'])['decisions']
         if r['decisionStatus'] == 'authoritative'}
ordinary_ids = {g for g, kind in kinds.items() if kind == 'curricularAtomic'}
assert len(ordinary_ids) == 346
memory_ids = {g['id'] for g in memory_goals}
owner_by_deck = {}
for goal in memory_goals:
    for tag in goal.get('tags', []):
        if tag.startswith('srs-deck:'):
            owner_by_deck.setdefault(tag[len('srs-deck:'):], []).append(goal['id'])
assert owner_by_deck == prep['deckToCanonicalMemoryGoalIds']
card_records = rows(config['cardReviewPath'])
assert len(card_records) == 67
for runtime in {p for p in deck_paths if p.startswith('app/public/')}:
    canonical = str(Path('curricula/DE/Gymnasium/memory-decks') / Path(runtime).name)
    assert Path(runtime).read_bytes() == Path(canonical).read_bytes()

positive_rows = [record for p in positive_review_paths for record in rows(p)]
assert len(positive_rows) == 346 and len({r['goalId'] for r in positive_rows}) == 346
assert {r['goalId'] for r in positive_rows} == ordinary_ids
assert {r['goalId'] for r in required_decisions} <= ordinary_ids
report = Path(config['reportPath']).read_text()
for row in ['| ordinary atomic goals reviewed | 346 |', '| goals with intentional memory support | 66 |',
            '| primary cards in scope | 67 |', '| composition visibility scopes | 48 |',
            '| memory-required goals without visible memory node | 0 |', '| blocking issues | 0 |']:
    assert row in report

native = read(args.native)
scopes = []
all_pairs = []
for jurisdiction, durations in native.items():
    assert set(durations) == {'G8', 'G9'}
    for duration, projection in durations.items():
        target = set(projection['wholeTargetGoalIds'])
        ordinary = set(projection['ordinaryTargetGoalIds'])
        visible_memory = set(projection['visibleMemoryGoalIds'])
        target_memory = set(projection['targetMemoryGoalIds'])
        assert len(target) == len(projection['wholeTargetGoalIds'])
        assert ordinary == target & ordinary_ids
        assert target_memory == target & memory_ids
        assert target_memory <= visible_memory <= memory_ids
        pairs = []
        for decision in required_decisions:
            if decision['goalId'] not in ordinary:
                continue
            owners = {owner for deck in decision['deckIds'] for owner in owner_by_deck[deck]}
            assert owners == set(decision['memoryGoalIds'])
            pair = {'jurisdiction': jurisdiction, 'durationModel': duration, 'stage': 'SekI',
                    'inputCourseFilter': 'GK', 'goalId': decision['goalId'],
                    'currentTitle': goals[decision['goalId']]['title'], 'retainedStatus': 'memory_required',
                    'requiredDeckIds': decision['deckIds'], 'requiredCanonicalMemoryGoalIds': sorted(owners),
                    'actualRequiredMemoryIdsVisible': sorted(owners & visible_memory),
                    'actualRequiredMemoryIdsTargeted': sorted(owners & target_memory),
                    'missingVisibleMemoryGoalIds': sorted(owners - visible_memory),
                    'missingTargetMemoryGoalIds': sorted(owners - target_memory)}
            pairs.append(pair)
            all_pairs.append(pair)
        scopes.append({'jurisdiction': jurisdiction, 'durationModel': duration, 'stage': 'SekI',
                       'inputCourseFilter': 'GK', 'compositionViewIds': projection['compositionViewIds'],
                       'ordinaryTargetCount': len(ordinary), 'requiredNormalTargetCount': len(pairs),
                       'actualVisibleMemoryGoalIds': sorted(visible_memory),
                       'actualTargetMemoryGoalIds': sorted(target_memory), 'requiredPairs': pairs})
assert len(scopes) == 32
missing = [r for r in all_pairs if r['missingVisibleMemoryGoalIds'] or r['missingTargetMemoryGoalIds']]
assert not missing
old_result = read(prior_result_path)
key = lambda s, r: (s['jurisdiction'], s['durationModel'], r['goalId'])
old_pairs = {key(s, r) for s in old_result['records'] for r in s['requiredPairs']}
new_pairs = {key(s, r) for s in scopes for r in s['requiredPairs']}
assert old_pairs == new_pairs
old_scopes = {(s['jurisdiction'], s['durationModel']): s for s in old_result['records']}
for scope in scopes:
    old_scope = old_scopes[(scope['jurisdiction'], scope['durationModel'])]
    assert scope['actualVisibleMemoryGoalIds'] == old_scope['actualVisibleMemoryGoalIds']
    assert scope['actualTargetMemoryGoalIds'] == old_scope['actualTargetMemoryGoalIds']
payment_id = 'e2ac2cc2-894a-5e61-8acb-f5d88811739d'
assert payment_id not in {r['goalId'] for r in required_decisions}
assert all(payment_id not in native['DE-BE'][duration]['wholeTargetGoalIds'] for duration in ['G8', 'G9'])

write('actual-current32-required-pairs-and10-deck-owner-visibility.independent-KEEP.READONLY.json',
      {'status': 'INDEPENDENT_CURRENT_ACTUAL32_MEMORY66_TARGET_VISIBILITY_KEEP', 'verdict': 'KEEP',
       'nativeSourcePath': args.native, 'nativeSourceSha256': sha(args.native),
       'wholeUnchangedRequiredDecisions': 66, 'checkedDecisionScopeCombinations': 66 * 32,
       'requiredTargetGoalScopePairs': len(all_pairs),
       'notCurrentTargetDecisionScopeCombinations': 66 * 32 - len(all_pairs),
       'uniqueRequiredTargetGoals': len({r['goalId'] for r in all_pairs}),
       'uniqueRequiredDecks': len({d for r in all_pairs for d in r['requiredDeckIds']}),
       'missingRequiredVisibleMemoryIds': [], 'missingRequiredTargetMemoryIds': [], 'scopeCount': 32,
       'lostRequiredPairsVsPrior': [], 'addedRequiredPairsVsPrior': [],
       'BEPaymentWasNotMemoryRequired': True, 'records': scopes})
write('actual-retained66-whole-decisions-and-canonical-deck-owners.READONLY.json',
      {'wholeMemoryLedger': {'path': config['reviewPath'], 'sha256': sha(config['reviewPath']), 'records': 346},
       'wholeCardLedger': {'path': config['cardReviewPath'], 'sha256': sha(config['cardReviewPath']), 'records': 67},
       'required66WholeDecisionsExactToOwnQualifiedPrior': True,
       'requiredRows': prep['requiredRows'], 'deckToCanonicalMemoryGoalIds': owner_by_deck,
       'canonicalMemoryOwnerWholeGoals': memory_goals,
       'canonicalRuntimeDeckFilesWholeExact': True, 'positiveWholePayloadRecordsGuarded': 346})
write('actual-current-native-provenance-and-scope-boundary.READONLY.json',
      {'reviewer': 'OpenAI GPT-6 / Codex / economics_final56_current_round_a', 'reviewedAt': now(),
       'verdict': 'KEEP', 'nativeDataset': {'path': args.native, 'sha256': sha(args.native)},
       'originalNativeRun': {'guardPath': args.native_guard, 'guardSha256': sha(args.native_guard),
                             'sealPath': args.native_seal, 'sealSha256': sha(args.native_seal),
                             'nativeExitCode': 0, 'nativeRunsByPlan': 1,
                             'readOriginalSourcePath': native_source, 'readOriginalSourceSha256': sha(native_source)},
       'reusedOwnPriorAlgorithm': {'path': str(prior_program), 'sha256': sha(prior_program),
                                 'changedOnlyInputOutputPathsAndCurrentGuards': True},
       'boundedConclusion': 'Every actual ordinary Target among the unchanged 66 memory_required decisions has every required deck owner visible and targeted. Current pairs are counted dynamically; none are missing.',
       'supportBoundary': '1940 additional prerequisiteOnly ID/scope pairs are not prerequisite-need or normative Target claims and do not enlarge this required-Target check.',
       'nativeM48Report': {'path': config['reportPath'], 'sha256': sha(config['reportPath']),
                          'existingNativeReportBlockingIssues': 0, 'checkerWasNotRerunOrModified': True},
       'scienceBoundary': 'Existing 66 decisions, 346 P payloads, 67 card records and card files are retained. No fresh memory/source/goal/card/visual science approval. Earlier own 7c/P/scope and bounded BE P12 source authorship disclosed.',
       'scopeBoundary': 'Actual SekI/GK/G8/G9 API projections for 16 jurisdictions; not a new G9 curriculum-fidelity claim, not a replacement or waiver of the conservative original M48 checker.',
       'newBackendRunsByReviewer': 0, 'activeWrites': 0, 'runtimeCheckerWrites': 0,
       'humanApproval': False, 'M7Claim': False})

for path, digest in native_guard['inputsAfter'].items():
    assert sha(path) == digest, 'Current inputs must still bind the actual native output'
end = {'HEAD': head(), 'capturedAt': now(), 'bindings':
       [{'path': b['path'], 'beforeSha256': b['sha256'], 'endSha256': sha(b['path']),
         'wholeExact': sha(b['path']) == b['sha256']} for b in before['bindings']]}
assert end['HEAD'] == before['HEAD'] and all(b['wholeExact'] for b in end['bindings'])
end['allWholeInputsExact'] = True
write('input-end.current53-memory-scope-plus-P-cards-native.READONLY.json', end)
artifacts = [{'path': str(p), 'sha256': sha(p), 'bytes': p.stat().st_size}
             for p in sorted(out.iterdir()) if p.is_file() and not p.name.startswith('SEALED-')]
seal_name = 'SEALED-current32-memory66-required-pairs-missing0.independent-a-KEEP.READONLY.json'
write(seal_name, {'status': 'SEALED_INDEPENDENT_CURRENT_NATIVE32_MEMORY66_VISIBILITY_KEEP', 'verdict': 'KEEP',
                 'sealedAt': now(), 'HEAD': end['HEAD'], 'artifacts': artifacts,
                 'protectedWholeInputs': len(end['bindings']), 'primaryMemoryScopeBindings': 53,
                 'positiveConfigFiles': 45, 'wholePositiveProfiles': 346, 'cardRecords': 67,
                 'canonicalRuntimeDeckFiles': len(set(deck_paths)), 'scopeCount': 32,
                 'unchangedMemoryRequiredDecisions': 66, 'requiredTargetGoalScopePairs': len(all_pairs),
                 'requiredPairsExactToOwnPrior': True, 'missingVisibleRequiredMemoryIds': [],
                 'missingTargetedRequiredMemoryIds': [], 'inputEndguardsPass': True,
                 'newBackendRunsByReviewer': 0, 'activeWrites': 0, 'runtimeCheckerUnchanged': True,
                 'nativeFullM48CheckRerunByReviewer': False, 'humanApproval': False, 'M7Claim': False})
print(json.dumps({'sealPath': str(out / seal_name), 'sha256': sha(out / seal_name),
                  'pairs': len(all_pairs), 'protectedBindings': len(end['bindings']),
                  'missingVisible': 0, 'missingTarget': 0}, ensure_ascii=False))
