"""Seal complete native inputs and disclosed authorship, without a D verdict."""
from pathlib import Path
import collections, datetime, hashlib, json, subprocess

ROOT = Path.cwd()
OUT = Path(__file__).resolve().parent
SEAL = 'SEALED-ten-current-native-description-inputs-and-author-source-boundaries.AUTHOR-INERT.json'
assert not (OUT / SEAL).exists(), 'Never rewrite a sealed input bundle'
def read(path):
    return json.loads(Path(path).read_text())
def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()
def binding(path):
    path = Path(path)
    data = path.read_bytes()
    return {'path': str(path.relative_to(ROOT) if path.is_absolute() else path),
            'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
def write(name, content):
    with (OUT / name).open('x') as target:
        target.write(json.dumps(content, ensure_ascii=False, indent=2) + '\n')
    return binding(OUT / name)

config = read(OUT / 'ten-current-new-goals.native-batch.config.json')
ids = config['goalIds']
base = read(OUT / 'actual-native-full346-base-selected10-pages-and-context.INPUT.json')
batch = read(OUT / 'native/batch-manifest.json')
round_a = read(OUT / 'native/round-a/description-review-input.json')
round_b = read(OUT / 'native/round-b/description-review-input.json')
model = read(OUT / 'native/bundle/book-model.json')
assert round_a == round_b and round_a['goalCount'] == 10
assert base['book']['pageCount'] == 346 and len(base['pages']) == 10
assert batch['source']['baseBookDigest'] == base['baseModelDigest']
assert [g['goalId'] for g in round_a['goals']] == ids
assert model['source'] == base['source']
scope = read(OUT / 'actual-ten-current-whole-goals-P20-and-concrete-content-authorship.SCOPING.READONLY.json')
sources = read(OUT / 'actual-ten-current-source-edges-whole-atoms-parents-and-partial-bounds.INPUT.json')
scope_by = {g['goalId']: g for g in scope['goals']}
native_by = {g['goalId']: g for g in round_a['goals']}
base_by = {g['goalId']: g for g in base['pages']}
canonical_path = base['source']['landscapePath']
canonical = read(ROOT / canonical_path)
goal_by = {g['id']: g for g in canonical['goals']}
registry_path = 'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json'
registry = read(ROOT / registry_path)
economics = next(x for x in registry['subjects'] if x['subject'] == 'wirtschaftswissenschaften')
current_profiles = {}
for path in economics['positiveEvidenceConfigPaths']:
    profile_config = read(ROOT / path)
    selected = set(ids).intersection(profile_config.get('scope', {}).get('goalIds', []))
    if not selected:
        continue
    for line_number, line in enumerate((ROOT / profile_config['reviewPath']).read_text().splitlines(), 1):
        if not line.strip():
            continue
        record = json.loads(line)
        if record['goalId'] in selected:
            assert record['goalId'] not in current_profiles
            current_profiles[record['goalId']] = {
                'configPath': path, 'configBinding': binding(ROOT / path), 'wholeConfig': profile_config,
                'recordPath': profile_config['reviewPath'], 'recordBinding': binding(ROOT / profile_config['reviewPath']),
                'recordLine': line_number, 'wholeRecord': record}
assert set(current_profiles) == set(ids)

source_checks = []
source_cache = {}
mapping_cache = {}
for goal_id, contexts in sources['goalSourceContexts'].items():
    for row in contexts:
        source_path = row['sourceExtractionPath']
        mapping_path = row['mappingPath']
        source = source_cache.setdefault(source_path, read(ROOT / source_path))
        mapping = mapping_cache.setdefault(mapping_path, read(ROOT / mapping_path))
        atom = next(g for g in source['sourceGoals'] if g['id'] == row['wholeCurrentSourceAtom']['id'])
        parent = next((p for p in source['passages'] if p.get('id', p.get('passageId')) == atom.get('passageId')), None)
        assert atom == row['wholeCurrentSourceAtom'] and parent == row['wholeCurrentParent']
        assert row['edge'] in mapping['mappings'] and row['wholeMappingDecision'] in mapping['decisions']
        source_checks.append({'goalId': goal_id, 'sourceGoalId': atom['id'], 'mappingPath': mapping_path,
                              'matchType': row['edge']['matchType'], 'wholeScopedSourceObjectsExact': True})
assert len(source_checks) == 20
match_types = dict(collections.Counter(row['matchType'] for row in source_checks))
assert match_types == {'partial': 19, 'exact': 1}
rows = []
case_count = 0
for goal_id in ids:
    goal = goal_by[goal_id]
    historical_scope = scope_by[goal_id]
    native = native_by[goal_id]
    profile = current_profiles[goal_id]
    record = profile['wholeRecord']
    cases = record['profile']['applicationCaseBriefs']
    assert native['reviewContext']['evidenceProfile'] == record
    assert record['profile'] == historical_scope['currentPRecordAndConfig']['wholeRecord']['profile']
    assert cases == historical_scope['wholeTwoCurrentCaseBriefs'] and len(cases) == 2
    for field, native_field in [('title', 'currentTitleDe'), ('titleEn', 'currentTitleEn'),
                                ('description', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn')]:
        assert goal[field] == native[native_field]
    assert native['reviewContext']['page'] == next(p for p in model['pages'] if p['goalId'] == goal_id)
    assert goal == historical_scope['currentWholeGoal']
    rows.append({'goalId': goal_id, 'wholeCurrentGoal': goal,
                 'currentNativeDescriptionBindings': {k: native[k] for k in ['goalFingerprint', 'pageFingerprint', 'canonicalContext']},
                 'wholeCurrentNativeBasePage': base_by[goal_id],
                 'wholeCurrentNativeSubsetPage': native['reviewContext']['page'],
                 'currentNativePRecordAndConfig': profile, 'wholeActualApplicationCases': cases,
                 'currentRequiresWholeGoals': [goal_by[p] for p in goal.get('requires', [])],
                 'originalGoalAndPAuthorship': historical_scope,
                 'independentGoalReviewAllocation': {
                     'roundAReviewer': '/root/economics_final56_current_round_a',
                     'roundBReviewer': '/root/economics_common_source_course_independent_c',
                     'currentGoalAndPAuthorExcludedFromOwnDReview': True,
                     'historicalSourceScopeCaseAndTechnicalExposureDisclosed': True,
                     'futureOtherCurrentRoundResultsMayBeRead': False},
                 'currentSourceContextArtifact': binding(OUT / 'actual-ten-current-source-edges-whole-atoms-parents-and-partial-bounds.INPUT.json'),
                 'directCurrentSourceEdgeCount': len(sources['goalSourceContexts'][goal_id]),
                 'inventedOriginalDDeferral': None, 'DDecision': None, 'humanApproval': False})
    case_count += len(cases)
sidecar = write('actual-ten-native-bound-whole-goals-P20-pages-authors-and-source-context.INPUT.json', {
    'artifactKind': 'AUTHOR_INERT_NATIVE_BOUND_CURRENT_DESCRIPTION_INPUT_NO_D_VERDICT',
    'observedAtUtc': now(), 'goalIds': ids, 'currentCanonicalBinding': binding(ROOT / canonical_path),
    'currentRegistryBindingAtFinalization': binding(ROOT / registry_path),
    'originalAuthorScopingRegistryEpoch': scope['currentRegistryBinding'],
    'nativeBatchManifest': binding(OUT / 'native/batch-manifest.json'),
    'sourceBoundaryPolicy': sources['scientificLimits'], 'goals': rows, 'actualPCaseCount': case_count,
    'newDDecisions': 0, 'sourceCurricularFullCoverageClaim': False})
source_receipt = write('actual20-current-source-context-whole-object-parity.READONLY.json', {
    'artifactKind': 'TECHNICAL_PARITY_OF_ALREADY_SCOPED_SOURCE_CONTEXTS_NOT_NEW_SCIENCE',
    'sourceContextArtifact': binding(OUT / 'actual-ten-current-source-edges-whole-atoms-parents-and-partial-bounds.INPUT.json'),
    'actualDirectSourceAssignments': len(source_checks), 'actualMatchTypes': match_types,
    'allWholeScopedObjectsExact': True,
    'actualSourceAndMappingFileBindings': [binding(ROOT / p) for p in sorted(set(source_cache) | set(mapping_cache))],
    'checks': source_checks, 'scientificLimits': sources['scientificLimits']})
before = read(OUT / 'inputs-before-native-preparation.bindings.json')
after = [binding(ROOT / item['path']) for item in before['bindings']]
changes = [{'before': b, 'after': a} for b, a in zip(before['bindings'], after) if b != a]
assert not changes, f'Native input changed during prepare/check: {changes}'
endguard = write('actual-native-ten-input-before-after-and-final-registry-epoch.READONLY.json', {
    'observedAtUtc': now(), 'beforeSnapshot': binding(OUT / 'inputs-before-native-preparation.bindings.json'),
    'afterBindings': after, 'actualObservedChanges': changes,
    'originalScopingRegistryEpoch': scope['currentRegistryBinding'],
    'finalNativeRegistryEpoch': binding(ROOT / registry_path),
    'actualSelectedTenPConfigs': before['selectedCurrentPositiveConfigPaths'],
    'nativeBaseModelDigest': base['baseModelDigest'], 'nativeSubsetDigest': model['digest'],
    'nativeReviewInputFingerprint': round_a['reviewInputFingerprint'], 'activeWrites': 0, 'DDecisions': 0})
labels = ['00-current-native-input-guards', '01-native-current-full346-base-selected10-context',
          '02-native-ten-new-goals-prepare', '03-native-ten-new-goals-check']
commands = [read(OUT / (label + '.command-receipt.json')) for label in labels]
assert all(command['exitCode'] == 0 for command in commands)
assert not any(any((OUT / 'native' / r / 'results').iterdir()) for r in ['round-a', 'round-b'])
assert not list((OUT / 'native/resolutions').iterdir())
receipt = write('actual-ten-native-bound-description-inputbundle.AUTHOR-INERT.receipt.json', {
    'artifactKind': 'AUTHOR_INERT_INPUT_PREPARATION_ONLY_NO_D_VERDICT', 'observedAtUtc': now(),
    'headAtFinalization': subprocess.check_output(['git', 'rev-parse', 'HEAD'], text=True).strip(),
    'nativeFunctionsUnmodified': ['loadGoalBookBuildInputs', 'prepareGoalDescriptionRolloutBatch',
                                 'validatePreparedGoalDescriptionRolloutBatch', 'buildGoalBookReviewBundle',
                                 'buildGoalDescriptionReviewInput'],
    'actualGoalIds': ids, 'goalCount': 10, 'currentEligibleOrdinaryBasePages': 346,
    'actualWholePProfiles': 10, 'actualWholeBilingualPCaseBriefs': 20,
    'descriptionPilotInputSchemaVersion': round_a['schemaVersion'],
    'descriptionPilotInputSchema': round_a['$schema'], 'nativeBatchManifest': batch,
    'nativeChecks': [{'label': c['label'], 'exitCode': c['exitCode'], 'rawLog': c['rawLog']} for c in commands],
    'wholeCurrentGoalPAuthorshipAndContextSidecar': sidecar, 'sourceContextParityReceipt': source_receipt,
    'sourceFullScienceApprovalClaim': False, 'nativeInputEndguardReceipt': endguard,
    'plannedRoundA': 'A: all ten; no identified Goal/P core authorship',
    'plannedRoundB': 'C: all ten; no identified Goal/P core authorship',
    'authorExcludedFromOwnDReview': '/root/economics_final679_required_gate_plan: nine; /root/economics_final56_current_round_b: one',
    'blindnessLimits': 'Original author contracts and prior Source/Scope/Case/technical exposure are disclosed; other current round decisions were not read.',
    'futureReviewResultsPresent': False, 'descriptionVerdictsWritten': 0,
    'strictCompletionsClaimed': 0, 'activeWrites': 0, 'humanApprovalClaimed': False})
symlinks = [str(p.relative_to(ROOT)) for p in OUT.rglob('*') if p.is_symlink()]
assert not symlinks
artifacts = [binding(p) for p in sorted(OUT.rglob('*')) if p.is_file()]
seal = write(SEAL, {'artifactKind': 'AUTHOR_INERT_INPUT_BUNDLE_SEAL_NO_D_VERDICT', 'sealedAtUtc': now(),
                    'receipt': receipt, 'artifactCount': len(artifacts), 'artifacts': artifacts,
                    'symlinks': [], 'newRoundResultsRead': False, 'newDDecisions': 0,
                    'newStrictCompletionClaims': 0, 'activeWrites': 0, 'humanApprovalClaimed': False})
print(json.dumps({'seal': seal, 'receipt': receipt, 'nativeInputFingerprint': round_a['reviewInputFingerprint'],
                  'baseDigest': base['baseModelDigest'], 'subsetDigest': model['digest'],
                  'goalCount': len(ids), 'PCaseCount': case_count, 'sourceAssignments': len(source_checks),
                  'sourceMatchTypes': match_types, 'unchangedGuardPaths': len(after), 'artifacts': len(artifacts)}))
