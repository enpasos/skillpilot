from pathlib import Path
import hashlib, json, re, shutil, subprocess, datetime

ROOT = Path('/home/enpasos/projects/skillpilot')
ISO = Path('/tmp/skillpilot-wirtschaft-all-open-routes-author-enhnmop5')
B_ISO = Path('/tmp/skillpilot-wirtschaft-generic10-current311-476152vl')
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-08/wirtschaft-all-open-route-extension-author-20261009-v1/final-thirteen-released-current311-P311-native-preparation-v10')
OUT = ROOT / BASE
CAN = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json')

def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def read(path):
    return json.loads(path.read_text())

def write(name, value):
    path = OUT / name
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return {'path': str(BASE / name), 'sha256': sha(path)}

def binding(path):
    return {'path': str(path), 'sha256': sha(ROOT / path)}

assert sha(ROOT / CAN) == 'ced16a782bd880239011f33731c57cf59d54d02b923c55c31c918492610ebfaa'
assert sha(B_ISO / CAN) == '4c1a942a99e5035621bfb11274d3803d362d8dc8f6ef9fbe61881bd1ecebe48f'
candidate = OUT / 'whole-current300-plus-Generic11-and-thirteen-root-material-released-terminals.inert.candidate.json'
assert sha(candidate) == sha(ISO / CAN)
goals = {g['id']: g for g in read(candidate)['goals']}
assert len(goals) == 403

released_paths = [
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-four-terminal-materials-independent-root-20261009-v1/whole-four-material-reviewed-machine-released.inert.candidate.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-five-additional-terminal-materials-independent-root-20261009-v1/whole-five-material-reviewed-machine-released.inert.candidate.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-three-additional-terminal-materials-independent-root-v1/whole-three-material-reviewed-machine-released.inert.candidate.json'),
    Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-media-material-and-EN-orientation-independent-root-v1/whole-media-material-reviewed-machine-released.inert.candidate.json'),
]
material_rows = []
bounded_scope_receipt = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/wirtschaft-bounded-course-orientation-and-three-V-root-acceptance-v1/actual-independent-bounded-course-two-orientation-edges-and-three-foreign-V-acceptance.receipt.json')
assert sha(ROOT / bounded_scope_receipt) == 'fe76e49bd400f4b67e1d50bde26c8630c94b63e50321674b4e6bdc32a12d8956'
for source in released_paths:
    values = read(ROOT / source)
    if isinstance(values, dict):
        values = [values]
    for goal in values:
        final_goal = goals[goal['id']]
        different_fields = sorted(k for k in set(goal) | set(final_goal) if goal.get(k) != final_goal.get(k))
        assert final_goal['examData'] == goal['examData']
        if different_fields:
            assert goal['id'] == '6a5efa74-66c8-5682-8371-b0a93d17f986' and different_fields == ['tags']
            assert goal['tags'] == ['GK', 'LK', 'Practice', 'Assessment'] and final_goal['tags'] == ['LK', 'Practice', 'Assessment']
        assert goal['examData']['reviewStatus'] == 'released'
        material_rows.append({'goalId': goal['id'], 'wholeExamDataExactToIndependentRootRelease': True, 'wholeGoalExactToOriginalIndependentRootMaterialRelease': not different_fields, 'onlySeparatelyAcceptedGoalFieldDelta': different_fields, 'source': binding(source), 'boundedScopeReceiptForOnly6aLkTagDelta': binding(bounded_scope_receipt) if different_fields else None})
assert len(material_rows) == 13
all_exams = [g for g in goals.values() if 'examData' in g]
assert len(all_exams) == 43
assert sum(g['examData'].get('reviewStatus') == 'released' for g in all_exams) == 37
root_goals = {g['id']: g for g in read(ROOT / CAN)['goals']}
for goal in all_exams:
    if goal['id'] in root_goals:
        assert goal['examData'] == root_goals[goal['id']]['examData']
native_route = read(OUT / 'actual-native-all-thirteen-before-after-global-local-graph-and-type.report.json')['results'][-1]
assert native_route['graph']['status'] == native_route['type']['status'] == 'pass'
assert all(rule['status'] == 'pass' for rule in native_route['route']['rules'])
rule203 = next(r for r in native_route['route']['rules'] if r['id'] == 'CQR-203')
assert rule203['metrics']['terminalAutonomyGoals'] == rule203['metrics']['releasedCoverageCompleteExamData'] == 37

config = read(OUT / 'book-config.current311-all-P311.inert.json')
profiles = {}
positive_sources = []
for source in config['evidenceReviewPaths']:
    positive_sources.append(binding(Path(source)))
    for line in (ROOT / source).read_text().splitlines():
        if not line.strip():
            continue
        record = json.loads(line)
        assert record['goalId'] not in profiles
        assert record['schemaVersion'] == 2 and record['profileRuleVersion'] == 'positive-understanding-evidence-v2'
        assert record['reviewAuthority'] == 'ai_candidate' and record['status'] == 'needs_human_review'
        assert record['evidenceLevel'] == 'E1' and record['maximumClaimScope'] == 'G1'
        profiles[record['goalId']] = record
assert len(profiles) == 311

impact = read(OUT / 'actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json')
scope_ids = [p['goalId'] for p in impact['affectedOwnerpages']]
assert len(scope_ids) == 46 and len(set(scope_ids)) == 46
old_count = sum(p['wasCurrentStrict300'] for p in impact['affectedOwnerpages'])
assert old_count == 35
assert impact['beforePages'] == impact['afterPages'] == 311
assert impact['beforeEvidenceProfiles'] == 300 and impact['afterEvidenceProfiles'] == 311
assert impact['beforeModelDigest'] == 'sha256:583dbf8066b9ec372e94741315fa69708b7167fbea8b75a793d3371edd6f29ce'

logs_dir = OUT / 'actual-native-command-logs'
logs_dir.mkdir(exist_ok=True)
log_bindings = []
for path in sorted(Path('/tmp').glob('economics-route-v10-*.log')):
    target = logs_dir / path.name
    shutil.copyfile(path, target)
    log_bindings.append(binding(BASE / 'actual-native-command-logs' / path.name))

packets = []
all_native_files = []
all_ids = []
for number, count in [(1, 20), (2, 20), (3, 6)]:
    output = BASE / f'native-d-final46-ordered-pack{number}-scope46-v2'
    packet = ROOT / output
    packet_config = BASE / f'native-d-final46-ordered-pack{number}.scope46-v2.batch.config.json'
    config_item = read(ROOT / packet_config)
    manifest = read(packet / 'batch-manifest.json')
    assert len(config_item['goalIds']) == count and manifest['goalIds'] == config_item['goalIds']
    assert manifest['curriculumAtomicDenominatorAtPreparation'] == 311
    assert manifest['source']['baseBookDigest'] == impact['afterModelDigest']
    ids = manifest['goalIds']
    all_ids.extend(ids)
    pdf_manifest = read(packet / 'bundle/book.pdf.render-manifest.json')
    pdfinfo_log = logs_dir / f'economics-route-v10-Dpack{number}-final-pdfinfo.actual.log'
    match = re.search(r'^Pages:\s+(\d+)$', pdfinfo_log.read_text(), re.MULTILINE)
    assert match and int(match.group(1)) == count + 2
    assert pdf_manifest['physicalPageCount'] == count + 2
    assert pdf_manifest['goalPageCount'] == count
    rounds = {}
    application_case_count = None
    for round_letter in ['a', 'b']:
        directory = packet / f'round-{round_letter}'
        input_data = read(directory / 'description-review-input.json')
        campaign = read(directory / 'description-review-campaign.json')
        assert input_data['schemaVersion'] == 3
        assert [g['goalId'] for g in input_data['goals']] == ids
        assert campaign['goalCount'] == count and campaign['batchSize'] == 20
        assert campaign['blindToOtherReviews'] is True
        assert campaign['reviewPolicy']['aiRecordsAreCandidatesOnly'] is True
        case_count = 0
        for item in input_data['goals']:
            goal = goals[item['goalId']]
            for field, native_field in [('title', 'currentTitleDe'), ('titleEn', 'currentTitleEn'), ('description', 'currentDescriptionDe'), ('descriptionEn', 'currentDescriptionEn')]:
                assert item[native_field] == goal[field]
            profile = item['reviewContext']['evidenceProfile']
            assert profile == profiles[item['goalId']]
            case_count += len(profile['profile']['applicationCaseBriefs'])
        if application_case_count is None:
            application_case_count = case_count
        assert case_count == application_case_count
        results = list((directory / 'results').glob('*')) if (directory / 'results').exists() else []
        assert not results
        rounds[round_letter.upper()] = {
            'campaignPath': str(output / f'round-{round_letter}/description-review-campaign.json'),
            'campaignSha256': sha(directory / 'description-review-campaign.json'),
            'inputPath': str(output / f'round-{round_letter}/description-review-input.json'),
            'inputSchemaVersion': 3,
            'actualWholeP2ProfilesExact': count,
            'actualApplicationCaseBriefs': case_count,
            'noAuthorReviewRecords': True,
        }
    files = [p for p in sorted(packet.rglob('*')) if p.is_file()]
    assert len(files) == 28
    bindings = []
    for path in files:
        relative = path.relative_to(ROOT)
        value = sha(path)
        assert sha(ISO / relative) == value
        bindings.append({'path': str(relative), 'sha256': value, 'bytes': path.stat().st_size, 'actualIsolateWholeBytesEqual': True})
    all_native_files.extend(bindings)
    packets.append({'ordinal': number, 'goalCount': count, 'goalIds': ids, 'config': binding(packet_config), 'outputDirectory': str(output), 'nativePrepareExitCode': 0, 'nativeCheckExitCode': 0, 'actualPdfInfoExitCode': 0, 'actualPhysicalPdfPages': count + 2, 'wholeNativeFrozenFileCount': 28, 'rounds': rounds, 'frozenFiles': bindings})
assert len(all_native_files) == 84
assert len(all_ids) == 46 and len(set(all_ids)) == 46 and set(all_ids) == set(scope_ids)

source_guard = read(OUT / 'actual-exact-B320a-Source35-six-mapping-shadowstage-and-P300-input-guard.receipt.json')
for row in source_guard['source35Rows']:
    assert sha(ROOT / row['liveRootPath']) == row['liveRootSHA']
    assert sha(ISO / row['liveRootPath']) == row['candidateWholeSHA'] == row['actualIsolateSHA']
    assert sha(B_ISO / row['liveRootPath']) == row['candidateWholeSHA']

root_native_path = Path('app/scripts/generateCurriculumQualityStatus.ts')
root_native = (ROOT / root_native_path).read_text()
probe = ISO / 'app/scripts/actual-all-route-quality-original-body-export-probe.ts'
addition = "  '5317d078-413b-58bb-9262-d57387d51655',\n"
exports = '\nexport { evaluateRouteProfile, evaluateGraphIntegrity, evaluateTypeConsistency, routeProfiles, buildEffectiveRequiresEdges, buildAtomicDirectRequiresEdges, collectRenderedAtomicGoalIdsFromCompositionView };\n'
assert probe.read_text().replace(addition, '', 1).removesuffix(exports) == root_native
probe_copy = OUT / 'actual-original-CQR-body-with-additive-Economics-registration-and-inert-exports.native.ts'
shutil.copyfile(probe, probe_copy)
minimal_registration = write('actual-one-Economics-cluster-registration-only.native-proposal.json', {
    'schemaVersion': 1, 'targetFile': str(root_native_path), 'expectedWholeRootSha256': sha(ROOT / root_native_path),
    'constant': 'CANONICAL_GYM_ECONOMICS_PRACTICE_CLUSTER_IDS', 'appendOnlyClusterId': '5317d078-413b-58bb-9262-d57387d51655',
    'actualProbe': binding(probe_copy.relative_to(ROOT)), 'probeOnlyExtraExportsAreNotAnIntegrationProposal': True,
    'allOtherNativeEvaluatorBytesExactlyEqualAfterRemovingOnlyAdditionAndProbeExports': True,
    'noRuleOrThresholdOrScopeFlagChanges': True, 'liveWrites': [],
})

protected = []
for name in ['MATHEMATIK', 'PHYSIK']:
    path = Path(f'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_{name}.de.json')
    committed = subprocess.run(['git', 'show', f'HEAD:{path}'], cwd=ROOT, capture_output=True, check=True).stdout
    committed_sha = hashlib.sha256(committed).hexdigest()
    assert committed_sha == sha(ROOT / path) == sha(ISO / path)
    protected.append({'path': str(path), 'wholeSHA256': committed_sha, 'actualHeadRootAndIsolateWholeBytesEqual': True})

input_names = [
    candidate.name, 'candidate-semantic-kinds.current403.inert.json', 'candidate-qa311.current403.inert.json',
    'book-config.current311-all-P311.inert.json', 'positive.config.json', 'positive.current-final-eleven.review.jsonl',
    'whole-current311-before-actual-Root300-with-P300.book-model.json', 'whole-current311-after-final403-with-all-P311.book-model.json',
    'actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json',
    'actual-affected-ownerpages-full-canonical-DEEN-P2-Source-context-inputs.for-native-D-export.json',
    'actual-current46-whole11-and-targeted35-context-review.criteria.md',
    'selective-current-Generic11-thirteen-root-released-route-EN-and-material-overlay.inert.candidate.json',
    'national-GK.bounded-route-author.candidate.view.json', 'national-LK.bounded-route-author.candidate.view.json',
    'actual-final-root-released-GK-LK-targetsets-support-and-terminal-role-proof.json',
    'actual-native-all-thirteen-before-after-global-local-graph-and-type.report.json',
    'actual-native-P11-whole-case-content-and-only-two-genuine-sequence-bindings.retention.json',
    'actual-exact-B320a-Source35-six-mapping-shadowstage-and-P300-input-guard.receipt.json',
    'actual-final403-preserved-kinds-and-current-source-binding.native.receipt.json',
]
global_inputs = [binding(BASE / name) for name in input_names] + positive_sources + [binding(path) for path in released_paths] + [binding(bounded_scope_receipt)]
freeze = write('native-d-final46-three-max20-prepared-freeze.actual.json', {
    'schemaVersion': 1, 'kind': 'actual-native-three-max20-D-preparation-freeze', 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authorNotIndependentDescriptionReviewer': True, 'qualityApproval': False, 'newStrictClosures': 0, 'liveWrites': [],
    'physicalIsolate': str(ISO), 'ownPackageIsolatePathResolvesToSameOwnedRootArtifactDirectory': True,
    'bookDigest': impact['afterModelDigest'], 'currentCurricularAtomicDenominator': 311,
    'fullPositiveV2Profiles': 311, 'affectedOwnerpages': 46, 'fullDescriptionReviews': 11, 'targetedPriorStrictContextReviews': 35, 'wholeUnchangedOwnerpages': 265,
    'nativeFrozenFiles': 84, 'packets': packets, 'globalInputBindings': global_inputs,
    'nativePreparationIsNotDescriptionOrHumanOrSourceCoverageApproval': True,
    'reviewersMustGuardFrozenInputsBeforeAndAfterAndUseOnlyTheirOwnBlindRound': True,
})

handoff = write('actual-final403-P311-exact-material-scope-and-native-three-package-handoff.receipt.json', {
    'schemaVersion': 1, 'kind': 'actual-final-inert-author-and-native-technical-handoff', 'createdAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'authorNotDescriptionReviewer': True, 'newStrictClosures': 0, 'newTechnicalBindingRestorationsCountedAsClosures': 0, 'liveWrites': [],
    'expectedLiveRootCanonical': {'path': str(CAN), 'sha256': sha(ROOT / CAN)},
    'preservedPreparedBGeneric11Canonical': {'physicalPath': str(B_ISO / CAN), 'sha256': sha(B_ISO / CAN)},
    'finalCanonical403': binding(candidate.relative_to(ROOT)), 'freeze': freeze,
    'materialBindings': material_rows, 'all13WholeRootReleasedExamDataExact': True, 'wholeGoalsExactToOriginalMaterialRelease': 12, 'onlyOtherGoalDelta': '6a tags GK/LK to LK, separately independently bounded-scope accepted by Root fe76e49b', 'all37ConfiguredTerminalAutonomyExamDataReleased': True, 'allCanonicalExamDataGoalCount': 43, 'sixOtherPreExistingExamDataGoalsRetainedWholeWithoutNewReleaseClaim': True,
    'fullP311': {'profileCount': 311, 'nativeSourceCount': 18, 'aiCandidateNeedsHumanE1G1Retained': True, 'wholeP300SourceBytesRetained': True, 'elevenWholeProfilesAnd22OriginalCasesRetained': True, 'onlyTwoGenuineRequiresInputBindingsChanged': True},
    'pageImpact': {'beforeBookDigest': impact['beforeModelDigest'], 'afterBookDigest': impact['afterModelDigest'], 'newWholeDescriptionPages': 11, 'oldStrictChangedContextPages': 35, 'allAffectedPages': 46, 'wholeUnchangedPages': 265, 'actualPerGoalEvidence': binding(BASE / 'actual-full-P300-to-P311-all311-whole-ownerpage-impact.native.json'), 'subsetPdfPagesHaveNativeRenumberingAndInternalExternalReferenceReprojection': True},
    'source35': source_guard['source35Rows'], 'source35IsPartialBoundedCorrectionNotFullCoverageApproval': True,
    'minimalCqrRegistrationProposal': minimal_registration,
    'routeProof': binding(BASE / 'actual-native-all-thirteen-before-after-global-local-graph-and-type.report.json'),
    'courseProof': binding(BASE / 'actual-final-root-released-GK-LK-targetsets-support-and-terminal-role-proof.json'),
    'allActualTargetedRulesPass': ['CQR-001', 'CQR-002', 'CQR-101', 'CQR-102', 'CQR-103', 'CQR-104', 'CQR-201', 'CQR-202', 'CQR-203'],
    'nationalCurricularTargetSetsUnchanged': {'GK': 201, 'LK': 280}, 'separateActualCourseFilteredLocalRouteMissing': {'GK': 0, 'LK': 0},
    'noThresholdOrScopeFlagChanges': True, 'protectedCanonicalWholeByteGuards': protected,
    'nativeCommandLogBindings': log_bindings,
    'diagnosticBoundary': 'Earlier failed CJS, wrong inherited criteria, missing native PDF utility and unquoted PATH attempts are retained. Only the three scope46-v2 quoted native prepare/check pairs passed; no diagnostic is a review judgment.',
    'remainingRequiredWork': ['Two blind independent current D rounds and resolution for the frozen 11 full plus35 changed-context ownerpages.', 'Independent central integration and ledger decisions; current300 baseline remains unchanged until Root integration.', 'Current Berlin primary source coverage and new concrete source-goal packages remain separate open M7 work.', 'Final current central CQR-303/M7 and required dependent Layer-A closure with protected Mathematics/Physics floors.', 'Separate human review/release/field testing remains pending and is not claimed by this machine preparation.'],
})
print(json.dumps({'freeze': freeze, 'handoff': handoff, 'nativePacketCount': len(packets), 'nativeFrozenFiles': len(all_native_files), 'actualFullP2InputGoals': len(all_ids), 'newStrictClosures': 0}, ensure_ascii=False))
