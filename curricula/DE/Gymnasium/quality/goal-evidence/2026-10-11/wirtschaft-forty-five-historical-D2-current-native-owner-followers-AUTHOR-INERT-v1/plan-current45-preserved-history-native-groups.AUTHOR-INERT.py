"""Create current technical containers for exact historical science; no new reviews."""
from pathlib import Path
import collections, datetime, hashlib, json, subprocess

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
SCOPE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-11/wirtschaft-forty-nine-valid-D2-current-owner-page-scoping-AUTHOR-INERT-c-v1'
def read(path):
    return json.loads(Path(path).read_text())
def digest(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()
def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT) if path.is_absolute() else path), 'sha256': digest(data), 'bytes': len(data)}
def write(path, value):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open('x') as stream:
        stream.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return binding(path)
def paths_in(value):
    if isinstance(value, dict):
        path = value.get('path')
        if isinstance(path, str) and not Path(path).is_absolute() and (ROOT / path).is_file():
            yield path
        for child in value.values():
            yield from paths_in(child)
    elif isinstance(value, list):
        for child in value:
            yield from paths_in(child)

scope_path = SCOPE / 'actual49-whole-original-D2-and-current-contract-P-page-source-parity-and-one6de-OPEN.READONLY.json'
scope = read(scope_path)
scope_seal = SCOPE / 'SEALED-forty-nine-actual-current-whole-input-scope-45-technical-3-root-reuse-one6de-OPEN.READONLY.json'
seal = read(scope_seal)
for item in seal['artifacts']:
    actual = binding(ROOT / item['path'])
    assert actual['sha256'] == item['sha256'], f'Changed C49 evidence {item["path"]}'
ids = scope['authorTarget45Ids']
assert len(ids) == len(set(ids)) == 45
assert not set(ids).intersection(scope['Root2Current3ReusedIDs'] + scope['open6de'])
registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
book_path = 'app/scripts/config/goal-books/de-gym-economics-current-canonical.json'
registry = read(ROOT / registry_path)
book = read(ROOT / book_path)
canonical = read(ROOT / book['landscapePath'])
goal_by = {g['id']: g for g in canonical['goals']}
combined_profiles = {}
for path in book['evidenceReviewPaths']:
    for line in (ROOT / path).read_text().splitlines():
        if line.strip():
            row = json.loads(line)
            assert row['goalId'] not in combined_profiles
            combined_profiles[row['goalId']] = row
contexts = {}
by_index = collections.defaultdict(list)
guard_paths = {registry_path, book_path, book['landscapePath'], book['compositionViewPath'],
               book['semanticKindLedgerPath'], book['goalVisualizationQaPath'], *book['evidenceReviewPaths'],
               str(scope_path.relative_to(ROOT)), str(scope_seal.relative_to(ROOT)), scope['A3ChangedNeighborQualifiedSeal']['path']}
source_parity = []
for goal_id in ids:
    path = SCOPE / 'whole49-current-and-original-contexts' / (goal_id + '.READONLY.json')
    context = read(path)
    contexts[goal_id] = context
    assert context['actualWholeCurrentGoal'] == goal_by[goal_id]
    assert context['actualWholeCurrentPositiveRecord'] == combined_profiles[goal_id]
    assert all(p['wholeCurrentCanonicalContextExact'] and p['wholeDEENTextExact']
               and not p['historicalPositiveProfileWasActuallyAbsent']
               and p['wholePositiveProfilePayloadExactWhenPresent'] and p['wholeVisualizationObjectExact']
               for p in context['actualTwoRoundCurrentParity'])
    by_index[context['selectedExistingSciencePair']['index']['path']].append(goal_id)
    guard_paths.add(str(path.relative_to(ROOT)))
    guard_paths.update(paths_in(context))
    for origin in context['wholeActualExistingSourceOrigins']:
        source_path = origin['sourceFile']['path']
        mapping_path = origin['mappingFile']['path']
        source = read(ROOT / source_path)
        mapping = read(ROOT / mapping_path)
        atom = next(x for x in source['sourceGoals'] if x['id'] == origin['wholeCurrentOriginSourceAtom']['id'])
        parent = next((x for x in source['passages'] if x.get('id', x.get('passageId')) == atom.get('passageId')), None)
        assert atom == origin['wholeCurrentOriginSourceAtom'] and parent == origin['wholeCurrentParentPassage']
        assert all(edge in mapping['mappings'] for edge in origin['wholeCurrentMappings'])
        assert all(row in mapping['decisions'] for row in origin['wholeCurrentDecisions'])
        source_parity.append({'goalId': goal_id, 'sourceGoalId': atom['id'], 'sourcePath': source_path,
                              'mappingPath': mapping_path, 'wholeScopedAtomParentEdgesDecisionsExact': True,
                              'newSourceScience': False,
                              'partialAndTrackConditions': origin['partialAndTrackConditionsMustRemainExplicit']})
groups = []
for number, (index_path, selected_ids) in enumerate(by_index.items(), 1):
    history = (ROOT / index_path).parent
    index = read(ROOT / index_path)
    ordered_ids = [goal_id for goal_id in index['batchGoalIds'] if goal_id in selected_ids]
    assert set(ordered_ids) == set(selected_ids)
    original_batch = read(history / 'batch-manifest.json')
    original_config = read(ROOT / original_batch['configPath'])
    original_bundle = read(history / 'round-a/review-bundle-manifest.json')
    prompt = next(x for x in original_bundle['artifacts'] if x['role'] == 'review_prompt')
    criteria = next(x for x in original_bundle['artifacts'] if x['role'] == 'review_criteria')
    prompt_path = history / 'bundle' / prompt['path']
    criteria_path = history / 'bundle' / criteria['path']
    assert binding(prompt_path)['sha256'] == prompt['digest']
    assert binding(criteria_path)['sha256'] == criteria['digest']
    config = dict(original_config)
    suffix = f'{number:02d}'
    config.update({'batchId': f'wirtschaft-current346-D45-historical-owner-20261011-b{suffix}',
                   'bookId': f'de-gym-economics-current346-D45-owner-b{suffix}',
                   'title': f'Wirtschaftswissenschaften: historischer fachlicher Nachweis, aktueller Owner-Kontext {number}',
                   'baseGoalBookConfigPath': book_path, 'goalIds': ordered_ids,
                   'outputDirectory': str((OUT / 'native' / ('batch-' + suffix)).relative_to(ROOT)),
                   'promptPath': str(prompt_path.relative_to(ROOT)),
                   'criteriaPath': str(criteria_path.relative_to(ROOT)), 'printDerivativeProfile': 'bounded-atlas'})
    config_path = OUT / 'configs' / ('batch-' + suffix + '.INERT.config.json')
    write(config_path, config)
    pairs = {goal_id: contexts[goal_id]['selectedExistingSciencePair'] for goal_id in ordered_ids}
    for role in ['first', 'second']:
        runs = [next(x for x in pairs[g]['existingIndependentRounds'] if x['round'] == role)['runManifest']['path'] for g in ordered_ids]
        assert len(set(runs)) == 1, 'A current container may preserve only one actual historical run per round'
    groups.append({'groupNumber': number, 'goalIds': ordered_ids,
                   'configPath': str(config_path.relative_to(ROOT)), 'outputDirectory': config['outputDirectory'],
                   'exactWholeScienceHistoryDirectory': str(history.relative_to(ROOT)),
                   'historicalIndex': binding(ROOT / index_path), 'originalPairs': pairs,
                   'originalPromptBinding': binding(prompt_path), 'originalCriteriaBinding': binding(criteria_path)})
    guard_paths.update([str(prompt_path.relative_to(ROOT)), str(criteria_path.relative_to(ROOT)), original_batch['configPath']])
    guard_paths.update(str(p.relative_to(ROOT)) for p in history.rglob('*') if p.is_file() and not p.is_symlink())
plan_path = OUT / 'actual-current45-native-groups-and-exact-original-science-plan.INERT.json'
plan = {'status': 'AUTHOR_INERT_TECHNICAL_HISTORICAL_SCIENCE_CONTINUATION_NO_NEW_REVIEW',
        'actualUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
        'HEADAtPreparation': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
        'sourceC49Seal': binding(scope_seal), 'sourceC49Scoping': binding(scope_path),
        'A3ChangedNeighborQualifiedSeal': scope['A3ChangedNeighborQualifiedSeal'],
        'requestedGoalIds': ids, 'requested45': 45, 'groups': groups,
        'Root2Current3ReusedIDs': scope['Root2Current3ReusedIDs'], 'explicitOpen6de': scope['open6de'],
        'rootRegistryEpoch': binding(ROOT / registry_path), 'currentBookConfig': binding(ROOT / book_path),
        'currentCanonical': binding(ROOT / book['landscapePath']),
        'currentCombinedP': [binding(ROOT / p) for p in book['evidenceReviewPaths']],
        'sourceParity': source_parity, 'sourceWholeCoverageClaim': False,
        'newScientificReviews': 0, 'newModelCalls': 0, 'activeWrites': 0, 'strictClosures': 0}
write(plan_path, plan)
for p in (ROOT / 'app/scripts').rglob('*.ts'):
    if p.is_file():
        guard_paths.add(str(p.relative_to(ROOT)))
for directory in ['contracts/goal-description-review', 'contracts/goal-book', 'contracts/goal-evidence']:
    guard_paths.update(str(p.relative_to(ROOT)) for p in (ROOT / directory).rglob('*.json') if p.is_file())
for p in OUT.rglob('*'):
    if p.is_file():
        guard_paths.add(str(p.relative_to(ROOT)))
for goal_id in ids:
    for resource in goal_by[goal_id].get('resourceLinks', []):
        url = resource.get('url', '')
        if url.startswith('/') and not url.startswith('//') and (ROOT / ('app/public' + url)).is_file():
            guard_paths.add('app/public' + url)
write(OUT / 'inputs-before-current45-native-preparation.READONLY.json', {
    'observedAtUtc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'bindings': [binding(ROOT / p) for p in sorted(guard_paths)],
    'registryBefore': registry, 'expectedAllowedRegistryAdvance': 'Economics D-resolution indices and supersession prefix followers only; canonical/P/QA/Book/A/M and every foreign subject must remain exact',
    'activeWrites': 0, 'newScientificReviews': 0})
print(json.dumps({'groups': len(groups), 'goals': len(ids), 'guardPaths': len(guard_paths),
                  'sourceContextChecks': len(source_parity), 'Root2ExistingOwnerReuse': 3, 'openPNull': 1}))
