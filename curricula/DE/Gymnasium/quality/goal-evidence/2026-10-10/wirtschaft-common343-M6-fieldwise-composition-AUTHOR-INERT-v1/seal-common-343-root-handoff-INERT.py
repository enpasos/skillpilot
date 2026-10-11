import hashlib
import json
import pathlib
import subprocess

ROOT = pathlib.Path('/home/enpasos/projects/skillpilot')
OUT = pathlib.Path(__file__).parent
Q = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10'

def read(p):
    return json.loads(p.read_text())

def rel(p):
    return str(p.relative_to(ROOT))

def bind(p):
    b = p.read_bytes()
    return {'path': rel(p), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(p, x):
    p.write_text(json.dumps(x, ensure_ascii=False, indent=2) + '\n')

cp = Q / 'wirtschaft-common343-bounded-source-course-and23-role-independent-c-INERT-v1'
closures = [cp / n for n in [
    'SEALED-independent105-bounded-source-course-closure.json',
    'actual105-bounded-Source-Course-delta-independent-KEEP-after-seven-author-seals.receipt.json',
    'SEALED-independent-final32-current-source-pointer-qualification.json',
    'actual-final32-whole-source-and-consumed-BW-v2-pointer-only.independent-READONLY.receipt.json',
]]
source = read(OUT / 'actual-final-source-fieldwise-pairs-and-consumed-BW-v2.INERT.json')
am = read(OUT / 'actual-native-SEM-A-M-materialization-handoff.INERT.json')
am['sourceClosurePending'] = False
am['boundedSourceClosureOnly'] = [bind(p) for p in closures]
am['wholeNativeSourceM2AndM6StillRootIntegrationChecks'] = True
write(OUT / 'actual-native-SEM-A-M-materialization-handoff.INERT.json', am)
core = OUT / 'candidate-core/DE_DEU_S_GYM_CANONICAL_WIRTSCHAFT.de.json'
assert bind(core)['sha256'] == 'sha256:698a7b95e35e0fb6988a74d344a563557ea232ab17728306f4a91744b8b0fc5e'
assert bind(OUT / 'semantic689.candidate-bound.INERT.json')['sha256'] == 'sha256:d2509e73d7a2aa94fbccdcb470cae1880575ebd5b30d9a64ee8d3a2975cd6f88'
assert read(OUT / 'actual-native-A343-M343-67cards-35visibility-candidate-check.READONLY.json')['allPassed']
assert read(OUT / 'actual-common689-DAG35-native-summary.READONLY.json')['actualLostOldTargetRows'] == []
assert read(OUT / 'actual-final-source-pointers-IDs-and-retained-registry-native-contract.READONLY.json')['allMappedIDsExist']
old = read(OUT / 'actual-active-versus-common-candidate-apply-list.INERT.json')
pairs = [{'activePath': old['canonical']['activePath'], 'candidatePath': rel(core),
          'activeBefore': bind(ROOT / old['canonical']['activePath']), 'candidate': bind(core)}]
pairs.extend(source['pairs'])
for row in old['views']:
    candidate = OUT / row['candidatePath']
    pairs.append({'activePath': row['activePath'], 'candidatePath': rel(candidate),
                  'activeBefore': bind(ROOT / row['activePath']), 'candidate': bind(candidate)})
for kind, destination in [('canonical', 'curricula/DE/Gymnasium/memory-decks'), ('runtime', 'app/public/data')]:
    for candidate in sorted((OUT / 'candidate-memory' / kind).glob('*.json')):
        active = ROOT / destination / candidate.name
        pairs.append({'activePath': rel(active), 'candidatePath': rel(candidate),
                      'activeBefore': bind(active), 'candidate': bind(candidate)})
assert len(pairs) == 72
guard_paths = [
    old['canonical']['activePath'],
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_MATHEMATIK.de.json',
    'curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_PHYSIK.de.json',
    'curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json',
    'app/scripts/testDeepUnderstandingRollout.ts', 'app/scripts/reportDeepUnderstandingRollout.ts',
    'app/scripts/semanticAtomicityReview.ts', 'app/scripts/memoryCardReview.ts',
    'app/scripts/generateCurriculumQualityStatus.ts', 'app/scripts/checkSourceLandscapeRegistry.ts',
    'app/src/utils/goalBookModel.ts',
]
guards = [bind(ROOT / p) for p in guard_paths if (ROOT / p).exists()]
fp = read(OUT / 'actual-native-SEM-A-M-689-and-two-decks-fingerprints.READONLY.json')
for contract in fp['contracts']:
    assert bind(ROOT / contract['sourcePath'])['sha256'] == contract['wholeOriginalSourceSha256']
reg = read(ROOT / guard_paths[3])
heads = subprocess.run(['git', 'rev-parse', 'HEAD'], cwd=ROOT, check=True, capture_output=True, text=True).stdout.strip()
write(OUT / 'actual-post-origin-main-current-core-four-and-native-code-endguards.READONLY.json', {
    'gitHEAD': heads, 'guards': guards,
    'protectedMathPhysicsSubjectsCurrent': [s for s in reg['subjects'] if s['subject'] in ['mathematik', 'physik']],
    'economicsSubjectBeforeRootActivation': next(s for s in reg['subjects'] if s['landscapePath'] == old['canonical']['activePath']),
    'nativeAandMFunctionsWholeSourceUnchangedSinceActualMaterialization': True,
    'upstreamRegistryBiologyAndRootM6TestUpdateFreshlyBoundNotClaimedOldWholeDigest': True,
    'activeDestinationsWrittenByAuthor': False,
})
write(OUT / 'ROOT-ready-common689-343-final72-fieldwise-pairs-and-native-ledgers.INERT.json', {
    'role': 'GUARDED_ROOT_ONLY_ACTIVE_INTEGRATION_HANDOFF', 'pairs': pairs,
    'nativeBindings': am, 'candidateSemanticLedger': bind(OUT / 'semantic689.candidate-bound.INERT.json'),
    'candidateAConfig': bind(OUT / 'atomicity/atomicity343.candidate-bound.INERT.config.json'),
    'candidateMConfig': bind(OUT / 'memory/memory343.candidate-bound.INERT.config.json'),
    'rootActivationConfigRoutingIsSeparate': 'Root preserves actual defaultScope and exact34 old visibility objects/order, append SekI35; candidate config is native35-check history.',
    'boundedIndependentSourceReceipts': [bind(p) for p in closures],
    'preservedRegistryBindings': read(OUT / 'actual-final-source-pointers-IDs-and-retained-registry-native-contract.READONLY.json')['registryBindingsUnmodified'],
    'unchangedRegistryDecision': 'No native source/SUR fingerprint field exists; historical provenance and accepted requires-closure evidence reused unchanged. Any actual new coverage requirement must be qualified from Root final native inputs.',
    'machineReleaseDescriptorPracticeOnly': read(OUT / 'actual-three-whole-qualified-practice-status-bindings.INERT.json'),
    'wholeSourcePipelineStatusesRequireRootBoundedQualificationAndNativeCheck': True,
    'sourceCountsOrUnionEdgesNeverSubstituteForNormativePerformanceCoverage': True,
    'current679ResourcesExact': True, 'unaffected324ARawAnd324MRawExact': True,
    'other63CardRowsExact': True, 'ordinary343': True, 'whole689': True,
    'newDOrVReviews': False, 'newImages': False, 'humanReleaseApproval': False,
    'selfScientificApproval': False, 'M6M7OrCIPassedClaim': False,
})
seal_name = 'SEALED-common689-343-final72-source-scope-native-A-M-root-handoff.INERT.json'
artifacts = [bind(p) for p in sorted(OUT.rglob('*')) if p.is_file() and p.name != seal_name]
assert not any(p.is_symlink() for p in OUT.rglob('*'))
write(OUT / seal_name, {'role': 'SEALED_INERT_AUTHOR_COMPOSITION_AND_NATIVE_BINDING_HANDOFF',
                       'artifacts': artifacts, 'artifactCount': len(artifacts),
                       'rootReadyIndex': bind(OUT / 'ROOT-ready-common689-343-final72-fieldwise-pairs-and-native-ledgers.INERT.json'),
                       'independent105SourceAndFinal32PointerSeals': [bind(p) for p in closures],
                       'rootOnlyIntegration': True, 'scientificSelfApproval': False,
                       'activeWrites': False, 'M6M7OrCIPassedClaim': False})
print(json.dumps(bind(OUT / seal_name), ensure_ascii=False))
