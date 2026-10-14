"""Apache-2.0: exact additive preservation and bounded local replay only."""
import collections
import datetime
import hashlib
import json
import pathlib
import shutil
import subprocess

REPO = pathlib.Path('/home/enpasos/projects/skillpilot')
BASE = REPO / 'curricula/quality/cross-subject-requires/2026-10-13'
FOS = BASE / 'by-fos-semantic-audit-20261013-v1'
TMP = REPO / 'tmp/cross-subject-requires'
REVIEW = TMP / 'by-fos-semantic-independent-review-20261013-v1'
PROBE = TMP / 'by-identity-runtime-probe-20261013'
DEST = BASE / PROBE.name
REPLAY = TMP / 'by-identity-runtime-preservation-replay-20261013-v1'
ACTOR = '/root/requires_parallel_review'
TIME = datetime.datetime.now(datetime.timezone.utc).isoformat()
LICENSES = {
    'technicalPreservationAndVerification': 'Apache-2.0',
    'ownEducationalContentAndSubstantiveJudgments': 'CC-BY-4.0',
    'attribution': 'SkillPilot contributors; original author/reviewer provenance preserved',
    'thirdPartySourcesAndDependencies': 'Original rights and notices retained. No blanket package license, source authenticity approval or redistribution clearance is inferred.',
}

def path(p):
    return str(p.relative_to(REPO)) if p.is_relative_to(REPO) else str(p)

def digest(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def record(p):
    return {'path': path(p), 'sha256': digest(p), 'bytes': p.stat().st_size}

def assert_binding(p, expected, size=None):
    assert p.is_file(), p
    assert digest(p) == 'sha256:' + expected.removeprefix('sha256:'), p
    if size is not None:
        assert p.stat().st_size == size, p

def fresh(rows, key='path'):
    for row in rows:
        assert_binding(REPO / row[key], row['sha256'], row.get('bytes'))
    return {'checkedCount': len(rows), 'driftCount': 0}

def save(p, value):
    data = (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    p.parent.mkdir(parents=True, exist_ok=True)
    if p.exists():
        assert p.read_bytes() == data, 'Refusing overwrite: ' + str(p)
    else:
        p.write_bytes(data)
    return record(p)

def preserve(p, dest, role, license_notice):
    original = record(p)
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        assert dest.read_bytes() == p.read_bytes(), dest
    else:
        shutil.copy2(p, dest)
    assert_binding(dest, original['sha256'], original['bytes'])
    return {'originalPath': original['path'], 'storedPath': path(dest),
            'sha256': original['sha256'], 'bytes': original['bytes'],
            'preservationRole': role, 'licenseBoundary': license_notice}

author_manifest_path = TMP / 'by-fos-semantic-audit-20261013-v1/manifest.json'
review_manifest_path = REVIEW / 'manifest.independent-review-v1.json'
old_index_path = FOS / 'artifact-index.author-preservation.json'
root_source_path = TMP / 'by-fos-math-integral-source-20261013/source-recovery.root-author.json'
assert_binding(author_manifest_path, '0e8c9b53b86cb3b1a184f14276e187f7d36e3ec850814e2df68dbf15273efec4')
assert_binding(review_manifest_path, 'de7f25457d57654cc8480eba70e3afe5367d4548835c36e477a249696d8bca1a')
assert_binding(old_index_path, '40c8ee1c2cfb1472cf66887bea718a5071e81609553d0a38be2bbea027583f00')
assert_binding(root_source_path, 'f13659c40fda39dcc475a97327107c04020bb05ecbe1d13d7b5d0ea1d29fbdb2')
old_index_before = old_index_path.read_bytes()
author = json.loads(author_manifest_path.read_bytes())
review = json.loads(review_manifest_path.read_bytes())
old_index = json.loads(old_index_before)
assert len(old_index['artifacts']) == 24
fresh(author['sealedArtifacts'])
fos_fresh_before = fresh(author['frozenInputFiles'])
assert fos_fresh_before['checkedCount'] == 558
fresh([dict(row, path=row['storedPath']) for row in old_index['artifacts']])
fresh(review['artifacts'])
assert len(review['artifacts']) == 10
addendum = json.loads((REVIEW / 'integral-source-recovery.independent-addendum-v1.json').read_bytes())
assert addendum['separateRootAuthorReceiptSha256'] == digest(root_source_path)
main_review = json.loads((REVIEW / 'semantic-owner-scope.independent-review-v1.json').read_bytes())
assert len(main_review['entries']) == 539
assert len({row['goalId'] for row in main_review['entries']}) == 539
verdicts = collections.Counter(row['candidateClassificationGate'] for row in main_review['entries'])
assert verdicts == {'PASS': 499, 'needs_revision': 40}
revision_subjects = collections.Counter(row['sourcePath'] for row in main_review['entries'] if row['candidateClassificationGate'] != 'PASS')
assert revision_subjects['curricula/DE/BY/Fachoberschule/Mathematik.json'] == 21
assert revision_subjects['curricula/DE/BY/Fachoberschule/Physik.json'] == 19

review_rows = []
for row in review['artifacts'] + [record(review_manifest_path)]:
    p = REPO / row['path']
    assert p.is_relative_to(REVIEW)
    review_rows.append(preserve(p, FOS / 'independent-review-v1' / p.relative_to(REVIEW),
        'sealed-original-independent-review',
        'Technical bindings/code Apache-2.0; own substantive judgments CC-BY-4.0; embedded or referenced existing source portions retain original rights.'))
review_index = save(FOS / 'artifact-index.independent-review-preservation-v1.json', {
    'schemaVersion': 1, 'recordedAt': TIME, 'preserverAgent': ACTOR,
    'status': 'exact_additive_preservation_of_separately_authored_independent_review',
    'originalManifest': record(review_manifest_path),
    'reviewerAgent': review['reviewerAgent'], 'reviewerRole': review['reviewerRole'],
    'authorContributorsRemainAuthors': author['authorContributors'],
    'preservedOriginalFileCount': len(review_rows),
    'preservedOriginalBytes': sum(row['bytes'] for row in review_rows),
    'artifacts': review_rows, 'originalAuthorPreservationIndexRetained': record(old_index_path),
    'technicalChecks': {'allArtifactShaAndByteBindings': 'PASS', 'currentFrozen558Inputs': fos_fresh_before},
    'acceptanceMeaning': main_review['meaningOfAcceptance'],
    'reviewCountsRetained': review['counts'], 'nativeOrActiveApprovalsCreatedByPreservation': 0,
    'licensing': LICENSES,
})
source_row = preserve(root_source_path, FOS / 'source-recovery-metadata' / root_source_path.name,
    'sealed-original-root-author-source-recovery-metadata',
    'Own technical metadata Apache-2.0; own didactic observations CC-BY-4.0; cited official formula/source material retains original rights.')
source_index = save(FOS / 'artifact-index.source-recovery-preservation-v1.json', {
    'schemaVersion': 1, 'recordedAt': TIME, 'preserverAgent': ACTOR,
    'status': 'exact_preservation_of_root_metadata_after_separate_independent_formula_identity_check',
    'preservedOriginalFileCount': 1, 'preservedOriginalBytes': source_row['bytes'], 'artifacts': [source_row],
    'separateIndependentAddendum': record(REVIEW / 'integral-source-recovery.independent-addendum-v1.json'),
    'originalPendingAuthorReceiptNotRewritten': True,
    'officialHtmlSvgPngCopied': False,
    'sourceIdentityFindingOnly': 'Three formula identities, observed page scope and printed validity independently checked; local goal remains malformed and unrepaired.',
    'remainingGates': addendum['gates'], 'licensing': LICENSES,
})

meta_path = PROBE / 'probe-inputs.json'
meta = json.loads(meta_path.read_bytes())
probe_fresh_before = {'sourceRecords': fresh(meta['files'], 'source'),
                      'fixtureRecords': fresh(meta['files'], 'destination')}
assert len(meta['files']) == 507
assert_binding(pathlib.Path(meta['classFile']), meta['classSha256'])
assert_binding(REPO / 'backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java', meta['classSourceSha256'])
for dependency in meta['dependencies']:
    assert_binding(pathlib.Path(dependency['path']), dependency['sha256'])
original_names = ['findings-and-plan.json', 'probe.stdout.json', 'probe-inputs.json',
                  'ByIdentityProbe.java', 'ByIdentityProbe.class', 'run_probe.py',
                  'javac.log', 'probe.stderr.log']
original_probe_bindings = [record(PROBE / name) for name in original_names]
probe_rows = [preserve(PROBE / name, DEST / name, 'original-local-plan-or-execution-evidence',
                      'Own technical code/plan/probe evidence Apache-2.0; any referenced external dependency/source rights retained.')
              for name in original_names]
smoke_rows = []
for name in ['package-smoke-with-real-tools.log', 'package-smoke-with-real-namespace-tools.log', 'package-smoke-with-real-namespace-tools-final.log']:
    p = TMP / name
    if p.exists():
        smoke_rows.append(preserve(p, DEST / 'related-package-consumer-selftests' / name,
            'original-related-local-runner-selftest-log-not-by-package-review', 'Apache-2.0 technical execution metadata'))

# Replay the already-bound service class and original fixtures; no fixture rebuild,
# original script execution, active compile or original-output overwrite.
REPLAY.mkdir(parents=True, exist_ok=True)
base_classes = pathlib.Path(meta['classFile']).parents[4]
assert base_classes.name == 'main', base_classes
classpath = ':'.join(str(p) for p in [PROBE, base_classes, *[pathlib.Path(d['path']) for d in meta['dependencies']]])
jdk = REPO / 'tmp/ci-tools/amazon-corretto-25.0.2.10.1/bin'
compile_command = [str(jdk / 'javac'), '-cp', classpath, '-d', str(REPLAY), str(PROBE / 'ByIdentityProbe.java')]
compiled = subprocess.run(compile_command, cwd=REPO, capture_output=True, timeout=45)
(REPLAY / 'javac.stdout.log').write_bytes(compiled.stdout)
(REPLAY / 'javac.stderr.log').write_bytes(compiled.stderr)
assert compiled.returncode == 0, compiled.stderr
original_result = json.loads((PROBE / 'probe.stdout.json').read_bytes())
run_classpath = ':'.join([str(REPLAY), str(base_classes), *[d['path'] for d in meta['dependencies']]])
run_command = [str(jdk / 'java'), '-cp', run_classpath, 'ByIdentityProbe', *[r['fixture'] for r in original_result]]
ran = subprocess.run(run_command, cwd=REPO, capture_output=True, timeout=45)
(REPLAY / 'probe.stdout.json').write_bytes(ran.stdout)
(REPLAY / 'probe.stderr.log').write_bytes(ran.stderr)
assert ran.returncode == 0, ran.stderr
replayed_result = json.loads(ran.stdout)
assert replayed_result == original_result, 'Actual service replay differs from original JSON'
assert (REPLAY / 'ByIdentityProbe.class').read_bytes() == (PROBE / 'ByIdentityProbe.class').read_bytes(), 'Fresh javac output differs from executed original class'
for row in original_probe_bindings:
    assert_binding(REPO / row['path'], row['sha256'], row['bytes'])
assert_binding(pathlib.Path(meta['classFile']), meta['classSha256'])
probe_fresh_after = {'sourceRecords': fresh(meta['files'], 'source'),
                     'fixtureRecords': fresh(meta['files'], 'destination')}
fos_fresh_after = fresh(author['frozenInputFiles'])
assert old_index_path.read_bytes() == old_index_before
fresh([dict(row, path=row['storedPath']) for row in old_index['artifacts']])
fresh(review['artifacts'])

execution_receipt = save(REPLAY / 'execution-and-freshness.independent-preservation-replay-v1.json', {
    'schemaVersion': 1, 'recordedAt': TIME, 'preserverAndTechnicalReplayer': ACTOR,
    'scope': 'Bounded local service-class reproduction; no full/backend rerun, package assembly, native quality or host acceptance.',
    'originalInputMetadata': record(meta_path), 'originalResult': record(PROBE / 'probe.stdout.json'),
    'commands': {'compile': compile_command, 'execute': run_command, 'workingDirectory': str(REPO)},
    'exitCodes': {'freshJavac': compiled.returncode, 'actualJavaReplay': ran.returncode},
    'probeClass': {'original': record(PROBE / 'ByIdentityProbe.class'), 'fresh': record(REPLAY / 'ByIdentityProbe.class'), 'byteExact': True},
    'runtimeServiceClass': record(pathlib.Path(meta['classFile'])),
    'runtimeServiceSource': record(REPO / 'backend/src/main/java/com/skillpilot/backend/landscape/LandscapeService.java'),
    'dependencies': [record(pathlib.Path(d['path'])) for d in meta['dependencies']],
    'frozenInputFreshnessBefore': probe_fresh_before, 'frozenInputFreshnessAfter': probe_fresh_after,
    'distinctCurrentSourcePathsChecked': len({r['source'] for r in meta['files']}),
    'distinctFixturePathsChecked': len({r['destination'] for r in meta['files']}),
    'parsedFiveFixtureResultsIdentical': True,
    'rawStdoutByteExact': ran.stdout == (PROBE / 'probe.stdout.json').read_bytes(),
    'observations': [
        {'fixture': pathlib.Path(r['fixture']).name, 'landscapeCount': r['landscapeCount'],
         'math': r['byId']['c1600692-e543-5cf2-a399-6bd96e6b817f'],
         'fosSpecificMathGoalPresent': r['getGoalDefinition']['43e2025f-f393-5a41-aa42-ecb3b6ca35b8']['present']}
        for r in replayed_result],
    'acceptanceBoundary': {'originalsChanged': False, 'fixturesCopiedToArchive': False,
        'officialSourceImagesOrHtmlCopied': False, 'activeFilesOrRunningCIIndexChanged': False,
        'packageReviewOrHostAcceptanceProved': False, 'nativeQualityApprovals': 0},
    'licensing': LICENSES,
})
replay_rows = []
for name in ['javac.stdout.log', 'javac.stderr.log', 'probe.stdout.json', 'probe.stderr.log',
             'execution-and-freshness.independent-preservation-replay-v1.json']:
    replay_rows.append(preserve(REPLAY / name, DEST / 'independent-preservation-replay-v1' / name,
        'new-additive-technical-replay-evidence-not-historic-original', 'Apache-2.0 technical verification metadata'))
helper_row = preserve(pathlib.Path(__file__), DEST / 'technical-preservation' / pathlib.Path(__file__).name,
                      'new-technical-preservation-helper', 'Apache-2.0 technical script')
probe_index = save(DEST / 'artifact-index.preservation-v1.json', {
    'schemaVersion': 1, 'recordedAt': TIME, 'preserverAgent': ACTOR,
    'status': 'inert_exact_original_local_probe_and_plan_preservation_with_bounded_fresh_replay',
    'originalFileCount': len(probe_rows) + len(smoke_rows), 'originalProbeAndPlanCount': len(probe_rows),
    'relatedLocalRunnerSelftestLogCount': len(smoke_rows),
    'totalOriginalBytes': sum(row['bytes'] for row in probe_rows + smoke_rows),
    'originalArtifacts': probe_rows + smoke_rows,
    'additiveTechnicalArtifactCount': len(replay_rows) + 1,
    'additiveTechnicalArtifacts': replay_rows + [helper_row],
    'sourceOfPlan': 'Exact root-provided planning evidence; preserver does not claim to author or substantively approve the plan.',
    'probeInputFreshnessBefore': probe_fresh_before, 'probeInputFreshnessAfter': probe_fresh_after,
    'actualJavaReplay': execution_receipt,
    'concreteByPackageReviewEvidenceFound': False,
    'relatedLogsScope': 'The three preserved logs document local package-consumer runner selftests: two historic capability failures and one final selftest pass. None builds, validates or accepts a BY package or host flow.',
    'excluded': ['all fixtures/ landscape copies', 'new active landscape payloads', 'full official HTML/SVG/PNG', 'dependency JAR copies', 'live backend source/class payload'],
    'remainingGates': {'runtimeIdentityRepair': 'pending', 'sharedGoalOwner': 'pending',
        'qualityDiscoveryGuard': 'pending', 'goalAndLearnerMigration': 'pending',
        'standaloneByPackageAssemblyValidationEquivalenceAndRuntimeLoading': 'pending',
        'crossSubjectRequiresAndNativeQuality': 'pending', 'hostAcceptance': 'pending', 'publicationOrDeployment': 'pending'},
    'authorityBoundary': 'Actual local ID conflict and synthetic Quality controls are observations only. Plan choices, authoring, native approvals, package/host acceptance and activation are not inferred.',
    'licensing': LICENSES,
})
overall = save(FOS / 'preservation-summary.independent-review-and-source-recovery-v1.json', {
    'schemaVersion': 1, 'recordedAt': TIME, 'preserverAgent': ACTOR,
    'status': 'additive_inert_evidence_preservation_all_live_gates_pending',
    'authorOriginalCount': 24, 'authorOriginalBytes': old_index['totalPreservedOriginalBytes'],
    'independentReviewOriginalCount': 11, 'independentReviewOriginalBytes': sum(r['bytes'] for r in review_rows),
    'separateRootRecoveryOriginalCount': 1, 'separateRootRecoveryOriginalBytes': source_row['bytes'],
    'totalOriginalCount': 36,
    'indices': {'unchangedAuthor': record(old_index_path), 'independentReview': review_index, 'rootRecovery': source_index},
    'originalAuthorManifestAndIndexBytesUnchanged': True,
    'reviewSummary': {'individualJudgments': 539, 'supportedCandidateClassifications': 499,
        'revisionNeeded': 40, 'mathRevisionNeeded': 21, 'physicsRevisionNeeded': 19,
        'liveAdoptionPending': 539, 'nativeApprovals': 0, 'requiresApprovals': 0},
    'reviewAuthority': {'reviewer': review['reviewerAgent'], 'differentFromBothAuthors': True,
        'preservationDoesNotAddScientificAcceptance': True},
    'frozen558InputsBefore': fos_fresh_before, 'frozen558InputsAfter': fos_fresh_after,
    'sourceRecoveryAddendum': record(REVIEW / 'integral-source-recovery.independent-addendum-v1.json'),
    'remainingGates': main_review['overallGates'],
    'formulaRecoveryLimits': addendum['gates'],
    'separateLocalIdentityProbeArchive': probe_index,
    'preservationBoundary': {'activeSourceViewNativeGateRuntimeOrLearnerEdits': False,
        'runningIsolatedCIIndexChanged': False, 'officialFullHtmlSvgPngCopied': False,
        'sourceRightsOrLegalScopeAccepted': False, 'nativeM7Claimed': False,
        'familyCompletionClaimed': False, 'publishedOrDeployed': False},
    'licensing': LICENSES,
})
print(json.dumps({'fosOverall': overall, 'reviewIndex': review_index, 'sourceIndex': source_index,
                  'probeIndex': probe_index, 'authorIndexUnchanged': record(old_index_path),
                  'counts': {'fosAuthorOriginals': 24, 'fosReviewOriginals': 11, 'rootRecoveryOriginals': 1,
                             'probeOriginals': len(probe_rows), 'relatedSmokeLogOriginals': len(smoke_rows),
                             'newReplayAndHelper': len(replay_rows) + 1},
                  'freshness': {'fos': fos_fresh_after, 'probe': probe_fresh_after},
                  'rawProbeStdoutByteExact': ran.stdout == (PROBE / 'probe.stdout.json').read_bytes()}, indent=2))
