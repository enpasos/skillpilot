from pathlib import Path
import datetime, hashlib, importlib.util, json

R = Path.cwd()
O = Path(__file__).resolve().parent
load = lambda p: json.loads(p.read_text())
sha = lambda p: 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()
def binding(p):
    return {'path': str(p.relative_to(R)), 'sha256': sha(p), 'bytes': p.stat().st_size}
def write(name, value):
    with (O / name).open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
def without(value, keys):
    return {k: v for k, v in value.items() if k not in keys}
def synthesis_science(value):
    value = json.loads(json.dumps(value))
    value.pop('synthesisId')
    for dissent in value['dissent']:
        dissent.pop('dissentId')
    return value

plan = load(O / 'actual-current-qualified14-native-groups-and-C-source-context-plan.INERT.json')
before = load(O / 'inputs-before-current14-native-preparation.READONLY.json')
routes = load(O / 'actual14-current-registry-prefix-and-per-goal-terminal-owner-candidate.INERT.json')
probe = load(O / 'actual-original-native-D-only-current14-candidate-ID-set-measurement.READONLY.json')
checks = load(O / 'actual-fourteen-native-current-owner-standalone-V2-container-checks.AUTHOR-INERT.json')
parity = load(O / 'actual14-whole-two-round-science-and-current-contract-profile-parity.AUTHOR-INERT.json')
qualifier = load(R / plan['CContextQualificationSeal']['path'])
assert qualifier['contextKEEP'] == 14 and qualifier['contextOPEN'] == 0
assert qualifier['wholeCurrentPCasesRead'] == 30
assert (qualifier['oldPNullGoals'], qualifier['oldWholeProfilePayloadExactGoals'], qualifier['oldProfileChangedGoals']) == (6, 6, 2)
assert len(plan['groups']) == 9 and checks['readyNativeStandaloneCount'] == 14
assert all(g['nativeSchemaAndPreparedInputAndRoundResultsAndDualResolutionChecksPassed'] for g in checks['groups'])
assert probe['before']['descriptionReadyCount'] == 291 and probe['candidate']['descriptionReadyCount'] == 334
assert probe['before']['currentGoalIds'] == probe['candidate']['currentGoalIds']
assert len(probe['gainedDescriptionReadyGoalIds']) == 43 and probe['lostDescriptionReadyGoalIds'] == []
assert set(probe['selected14ReadyGoalIds']) == set(plan['requestedGoalIds'])
assert len(probe['indirectGainedGoalIds']) == 29
assert probe['candidate']['scopeIssues'] == probe['candidate']['chainIssues'] == []
assert len(probe['candidate']['descriptionIssues']) == 13
assert (routes['baselineIndexCount'], routes['candidateIndexCount'], routes['baselineSupersessionCount'], routes['candidateSupersessionCount']) == (67, 76, 161, 174)
assert routes['foreignSubjectsWholeExact'] and routes['oldEconomicsPrefixesWholeExact'] and routes['allOtherEconomicsFieldsWholeExact']
record_bindings = {'campaignId', 'roundId', 'bundleFingerprint', 'bookDigest', 'pageFingerprint'}
scientific_records = []
scientific_runs = []
synthesis_bindings = []
for group in plan['groups']:
    for directory, round_role in [('round-a', 'first'), ('round-b', 'second')]:
        rd = R / group['outputDirectory'] / directory
        record_path = next((rd / 'results').glob('*.records.jsonl'))
        current_records = [json.loads(line) for line in record_path.read_text().splitlines()]
        assert {v['goalId'] for v in current_records} == set(group['goalIds'])
        current_run_path = next((rd / 'results').glob('*.run.json'))
        current_run = load(current_run_path)
        round_runs = []
        for record in current_records:
            gid = record['goalId']
            original_round = next(v for v in group['originalPairs'][gid]['existingIndependentRounds'] if v['round'] == round_role)
            original_records = [json.loads(line) for line in (R / original_round['actualResults']['path']).read_text().splitlines()]
            original_record = next(v for v in original_records if v['goalId'] == gid)
            assert without(record, record_bindings) == without(original_record, record_bindings)
            original_run = load(R / original_round['runManifest']['path'])
            for key in ['runId', 'provider', 'model', 'startedAt', 'completedAt', 'blindToOtherRuns', 'generationParameters', 'generationParametersFingerprint']:
                assert current_run.get(key) == original_run.get(key), (gid, key)
            round_runs.append(original_run)
            scientific_records.append({'goalId': gid, 'round': round_role, 'wholeOriginalScientificRecordAndVerdictExact': True, 'changedTechnicalRecordFieldsOnly': sorted(k for k in record_bindings if record.get(k) != original_record.get(k)), 'currentRecordFile': binding(record_path), 'originalRecordFile': original_round['actualResults'], 'originalRunManifest': original_round['runManifest'], 'newReviewOrInference': False})
        assert all(v == round_runs[0] for v in round_runs)
        scientific_runs.append({'groupNumber': group['groupNumber'], 'round': round_role, 'newTechnicalRunContainer': binding(current_run_path), 'originalRunId': current_run['runId'], 'originalProvider': current_run['provider'], 'originalModel': current_run['model'], 'originalScientificStartedAt': current_run['startedAt'], 'originalScientificCompletedAt': current_run['completedAt'], 'providerModelTimesGenerationParametersAndHistoricalBlindnessFlagsExact': True, 'technicalComposerHasReadBothHistoricalRounds': True, 'freshBlindReviewRun': False})
    for gid in group['goalIds']:
        old_path = R / group['originalPairs'][gid]['resolution']['path']
        new_path = R / group['outputDirectory'] / 'resolutions' / f'{gid}.resolution.json'
        old, new = load(old_path), load(new_path)
        assert synthesis_science(old['synthesis']) == synthesis_science(new['synthesis'])
        assert old['goal']['finalText'] == new['goal']['finalText']
        assert old['goal']['goalFingerprint'] == new['goal']['goalFingerprint']
        synthesis_bindings.append({'goalId': gid, 'originalResolution': binding(old_path), 'currentTechnicalResolution': binding(new_path), 'wholeSynthesisScienceRationaleEvidenceDissentHumanStatusAndTimesExact': True, 'onlySynthesisAndDissentTechnicalIdentifiersChanged': True, 'wholeFinalDEENTextAndGoalFingerprintExact': True})
assert len(scientific_records) == 28 and len(scientific_runs) == 18 and len(synthesis_bindings) == 14
endguards = []
for old in before['bindings']:
    current = binding(R / old['path'])
    assert old == current, ('input drift', old['path'])
    endguards.append({'before': old, 'after': current, 'exact': True})
assert len(endguards) == 715
C = (R / plan['CContextQualificationSeal']['path']).parent
C_before = load(C / 'actual14-original-pairs-current-whole-goal-profile-page-source-inputs-and-before-guards.READONLY.json')
supplemental_guards = []
for old in C_before['physicalInputGuards']:
    current = binding(R / old['path'])
    if current != old:
        assert old['path'] == routes['activeRegistryBinding']['path']
        assert old['sha256'] == 'sha256:06e9abe8e9da04e26a0a01187891ea84e06c4836cf6b32ae76106580c39c32cc'
        assert current == routes['activeRegistryBinding']
        supplemental_guards.append({'before': old, 'after': current, 'exact': False, 'explicitExpectedQualifiedRootDOnlyRegistryPrefixAdvance': '52/116 to 67/161; C14 qualified handoff separately binds current 66dc registry epoch; all science inputs exact'})
    else:
        supplemental_guards.append({'before': old, 'after': current, 'exact': True})
assert sum(not x['exact'] for x in supplemental_guards) == 1
whole_candidate = load(R / routes['candidateRegistryPath'])
fab = next(v for v in routes['wholePerGoalOwnerRoutes'] if v['goalId'] == 'fab48742-756b-564d-87ef-cd6f3c75f348')
assert fab['allHistoricalRegisteredClaims'] == [] and fab['oldTerminalOwner'] is None
assert not any(v['goalId'] == fab['goalId'] for v in routes['addedSupersessions'])
ready = set(probe['candidate']['descriptionReadyGoalIds'])
remaining = sorted(set(probe['candidate']['currentGoalIds']) - ready)
assert len(remaining) == 12
receipt_name = 'actual-fourteen-qualified-context-original-science-native-owner-and-measured-candidate.AUTHOR-INERT.receipt.json'
write(receipt_name, {
    'status': 'AUTHOR-INERT-fourteen-native-standalone-PASS-current-D-only334-context-QA-and-root-integration-pending',
    'actualUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'qualifiedContextSeal': plan['CContextQualificationSeal'],
    'qualifiedContextJudgments': plan['CIndividualContextQualification'],
    'wholeOriginalScientificRecords': scientific_records,
    'wholeOriginalScientificRunFacts': scientific_runs,
    'wholeOriginalSyntheses': synthesis_bindings,
    'nativeStandaloneReadyCount': 14,
    'nativeDOnlyMeasurement': binding(O / 'actual-original-native-D-only-current14-candidate-ID-set-measurement.READONLY.json'),
    'nativeDescriptionReadyBefore': 291, 'nativeDescriptionReadyCandidate': 334,
    'directCandidateReadyGoalIds': probe['selected14ReadyGoalIds'],
    'actualCandidateGainedGoalIds': probe['gainedDescriptionReadyGoalIds'],
    'indirectCandidateGainedGoalIdsRequiringSeparateCurrentMeaningQualification': probe['indirectGainedGoalIds'],
    'candidateGainClassification': 'Measured ID gains only; no automatic classification as restores or new scientific completions. Independent qualification and final combined native check belong to Root/A.',
    'lostGoalIds': [], 'netCandidateDescriptionReadyCount': 43,
    'remainingCandidateOpenGoalIds': remaining,
    'remainingHistoricalDescriptionIssues': probe['candidate']['descriptionIssues'],
    'scopeIssues': [], 'chainIssues': [],
    'wholeRegistryPassClaim': False,
    'honestNativeBoundaries': 'All fourteen standalone owners and selected current chains passed. The whole candidate still has thirteen historical description issues affecting twelve other goals. No full five-gate, central report, P/A/M/V check or integrated strict/M7 closure is claimed.',
    'candidateRegistry': binding(R / routes['candidateRegistryPath']),
    'candidatePrefixCounts': {'beforeIndices': 67, 'afterIndices': 76, 'beforeSupersessions': 161, 'afterSupersessions': 174},
    'exactAddedIndexPaths': routes['addedIndexPaths'], 'exactAddedSupersessions': routes['addedSupersessions'],
    'wholePerGoalOwnerRoutes': routes['wholePerGoalOwnerRoutes'],
    'fabFirstActualRegisteredOwnerWithoutInventedSupersession': True,
    'existingRouteBooleanClarification': 'noInventedOldClaimOrSupersession is the special zero-old-claims marker (true for fab); false on the thirteen actual existing registered-owner routes does not assert invented claims. Every route lists and preserves its actual old claims.',
    'current67IndexAnd161SupersessionPrefixesAndAllForeignSubjectsExact': True,
    'oldPContextCategories': {'actuallyAbsent': 6, 'wholeProfilePayloadExact': 6, 'profileChangedQualified': 2},
    'wholeHistoricalPAndCanonicalParityClaim': False,
    'currentWholeCanonicalPAndSourceCoursePrerequisiteDifferencesBoundToExternalMeaningQualification': True,
    'wholeCurrentPCasesActuallyQualified': 30,
    'all715PreparationInputBeforeAfter': endguards,
    'COriginalPhysicalInputBeforeAfter': supplemental_guards,
    'activeWrites': 0, 'newD2Reviews': 0, 'newModelInferenceRuns': 0,
    'sourceCoverageOrCountryCourseUpgrade': False, 'humanApproval': False,
    'integratedClosures': 0, 'strictClosures': 0
})
spec = importlib.util.spec_from_file_location('original_schema_validator', R / 'scripts/validate_schemas.py')
validator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(validator)
symlink_errors = validator.curriculum_symlink_errors(str(R))
assert not symlink_errors, symlink_errors
parsed = []
for p in sorted(O.rglob('*')):
    if not p.is_file():
        continue
    assert not p.is_symlink()
    if p.suffix == '.json':
        load(p)
        parsed.append(str(p.relative_to(R)))
    elif p.suffix == '.jsonl':
        for line in p.read_text().splitlines():
            assert line.strip()
            json.loads(line)
        parsed.append(str(p.relative_to(R)))
write('actual-original-symlink-check-whole-own-JSON-JSONL-and-final-input-guards.READONLY.json', {'originalCall': 'scripts/validate_schemas.py:curriculum_symlink_errors(repo_root)', 'errors': symlink_errors, 'ownSymlinks': 0, 'parsedWholeFiles': parsed, 'inputGuardCount': len(endguards), 'CPhysicalInputGuardCount': len(supplemental_guards), 'CPhysicalExplicitRegistryAdvances': 1, 'activeWrites': 0})
artifacts = [binding(p) for p in sorted(O.rglob('*')) if p.is_file()]
seal_name = 'SEALED-fourteen-qualified-current-native-owner-followers-original-science-291-to334-candidate.INERT.json'
write(seal_name, {
    'status': 'SEALED-AUTHOR-INERT-fourteen-native-PASS-current-D-only-candidate334-independent-QA-and-integration-pending',
    'actualUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(), 'artifacts': artifacts,
    'qualifiedContextSeal': plan['CContextQualificationSeal'], 'receipt': binding(O / receipt_name),
    'candidateRegistry': binding(R / routes['candidateRegistryPath']),
    'nativeProbe': binding(O / 'actual-original-native-D-only-current14-candidate-ID-set-measurement.READONLY.json'),
    'groups': 9, 'goals': 14, 'wholeOriginalScientificRecords': 28, 'wholeOriginalScientificRunFacts': 18, 'wholeOriginalSyntheses': 14,
    'inputGuardCount': len(endguards), 'candidateIndexCount': 76, 'candidateSupersessionCount': 174,
    'nativeBeforeD': 291, 'nativeCandidateD': 334, 'directCandidateGains': 14, 'indirectCandidateGainsPendingSeparateQualification': 29, 'losses': 0,
    'remainingHistoricalDescriptionIssueCount': 13, 'remainingOpenGoalCount': 12,
    'scopeIssues': 0, 'chainIssues': 0, 'wholeRegistryPassClaim': False,
    'nativePreparationDualSummaryFinalizationAndReadonlyCheckAlreadyComplete': True,
    'activeWrites': 0, 'newScientificReviews': 0, 'newModelInferenceRuns': 0,
    'sourceCoverageOrCountryCourseUpgrade': False, 'humanApproval': False, 'integratedClosures': 0, 'strictClosures': 0,
    'authorFilesFrozenAfterSeal': True
})
print(json.dumps({'seal': binding(O / seal_name), 'candidate': binding(R / routes['candidateRegistryPath']), 'receipt': binding(O / receipt_name), 'artifacts': len(artifacts), 'endguards': len(endguards), 'nativeStandaloneReady': 14, 'nativeBeforeD': 291, 'nativeCandidateD': 334, 'gains': 43, 'losses': 0, 'activeWrites': 0}))
