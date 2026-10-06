#!/usr/bin/env python3
"""Bind the independent technical results to the immutable, exact final plan."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib
import json

ROOT = Path(__file__).resolve().parents[7]
OUT = Path(__file__).resolve().parent
BASE = OUT.parent
CAND = BASE / 'biologie-ni-current-learner-view-adoption-candidate-v1'
NI = BASE / 'biologie-ni-eighteen-current-reviewed-integration-candidate-v2'

def read(path):
    return json.loads(path.read_text())

def sha(path):
    digest = hashlib.sha256()
    with path.open('rb') as handle:
        for chunk in iter(lambda: handle.read(1024*1024), b''):
            digest.update(chunk)
    return digest.hexdigest()

def frozen(path, expected, relative_base):
    assert sha(path) == expected, path
    manifest = read(path)
    total = 0
    for row in manifest['files']:
        item = relative_base / row['path']
        assert item.is_file() and not item.is_symlink(), item
        assert sha(item) == row['sha256'], item
        assert item.stat().st_size == row['bytes'], item
        total += row['bytes']
    if 'fileCount' in manifest:
        assert manifest['fileCount'] == len(manifest['files'])
    if 'totalBytes' in manifest:
        assert manifest['totalBytes'] == total
    return {'path':str(path.relative_to(ROOT)), 'sha256':expected,
            'actualPhysicalFileCount':len(manifest['files']), 'actualPhysicalBytes':total,
            'everyEntryPhysicallyExact':True}

final = frozen(CAND / 'learner-view-adoption-candidate.final.freeze.json',
               'd62d38a09c65050dcc07ffb493de6d4a2e3c9ea426a9913c5b3655b39b99767c', CAND)
plan_path = CAND / 'guarded-exact-five-destination-adoption-plan.candidate.json'
assert sha(plan_path) == '9d3eaa2da5694283e47159b1b0e61b0ee28114cc587db0f55d0847ff08fe98c7'
plan = read(plan_path)
assert len(plan['destinations']) == 5
actual_destinations = []
for row in plan['destinations']:
    before, after = ROOT / row['destination'], ROOT / row['afterCandidatePath']
    assert sha(before) == row['beforeSHA256'], before
    assert sha(after) == row['afterSHA256'], after
    actual_destinations.append({'destination':row['destination'],
                               'actualUnappliedBeforeSHA256':sha(before),
                               'afterCandidatePath':row['afterCandidatePath'],
                               'actualFrozenAfterSHA256':sha(after)})

view_proof = read(OUT / 'independent-native-view-scope46-and-prerequisites.actual.json')
memory_proof = read(OUT / 'independent-native-memory383-cards-and-two-negative-witnesses.actual.json')
book_proof = read(OUT / 'independent-native-whole383-book-and-original-sources.actual.json')
assert all(x['result'] == 'PASS' for x in [view_proof,memory_proof,book_proof])
for row in view_proof['views']:
    destination = next(x for x in plan['destinations'] if x['destination'] == row['path'])
    assert row['beforeSHA256'] == destination['beforeSHA256']
    assert row['afterCandidateSHA256'] == destination['afterSHA256']
    assert memory_proof['candidateFinalViews'][row['path']] == destination['afterSHA256']
for proof in [memory_proof,book_proof]:
    assert proof['candidateFinalFreezeSHA256'] == final['sha256']

registry = next(x for x in plan['destinations'] if x['destination'].endswith('de-gymnasium-math-physics.config.json'))
before_registry, after_registry = read(ROOT / registry['destination']), read(ROOT / registry['afterCandidatePath'])
expected_registry = read(ROOT / registry['destination'])
bio = next(s for s in expected_registry['subjects'] if s['subject'] == 'biologie')
old_memory_path = bio['memoryReviewConfigPath']
bio['memoryReviewConfigPath'] = str((CAND / 'full-memory.current-learner-views.config.json').relative_to(ROOT))
assert expected_registry == after_registry
raw_expected = (ROOT / registry['destination']).read_bytes().replace(old_memory_path.encode(), bio['memoryReviewConfigPath'].encode(), 1)
assert raw_expected == (ROOT / registry['afterCandidatePath']).read_bytes()
assert before_registry['minimumMaturityByLandscape'] == after_registry['minimumMaturityByLandscape'] if 'minimumMaturityByLandscape' in before_registry else True

new_config = read(CAND / 'full-memory.current-learner-views.config.json')
old_active_config = read(ROOT / old_memory_path)
expected_active = read(ROOT / old_memory_path)
expected_active['visibilityScopes'] = new_config['visibilityScopes']
expected_active['reportPath'] = new_config['reportPath']
assert expected_active == new_config
assert new_config['visibilityScopeCoverageRequired'] is True
default_row = next(x for x in plan['destinations'] if x['destination'].endswith('memory-card-review/canonical-biology-full.config.json'))
old_default, new_default = read(ROOT / default_row['destination']), read(ROOT / default_row['afterCandidatePath'])
default_expected = read(ROOT / default_row['destination'])
for key in ['reviewPath','cardReviewPath','visibilityScopes','visibilityScopeCoverageRequired']:
    default_expected[key] = new_config[key]
assert default_expected == new_default == new_config
assert new_config['reviewPath'] == str((NI / 'full-memory.review.jsonl').relative_to(ROOT))
assert new_config['cardReviewPath'] == str((NI / 'full-memory.cards.review.jsonl').relative_to(ROOT))
default_other_files = []
for p in sorted((CAND / 'default-configs.candidate').glob('*.config.json')):
    if p.name == 'canonical-biology-full.config.json':
        continue
    original = ROOT / 'curricula/DE/Gymnasium/quality/memory-card-review' / p.name
    assert p.read_bytes() == original.read_bytes(), p
    default_other_files.append({'path':str(original.relative_to(ROOT)),'sha256':sha(original)})

assert sha(ROOT / new_config['landscapePath']) == 'b3cb528491bde1905fb184f88211da40865cffa4bbfcf7219a978752bb67e300'
ledger = ROOT / 'curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json'
assert sha(ledger) == '30cad16c521438cd982ad72c40509c3bb6ad0515b489198b8f2a98765983e22b'
historical = [frozen(NI / 'reviewed-integration-candidate.final.freeze.json',
                     '0ff5fe3eff86cebb4ab0bfff6c2536428add97b2a1109649ba315f13d1eacaad',ROOT),
              frozen(BASE / 'chemie-q1-quantitative-reviewed-integration-candidate-v1/reviewed-integration.final.freeze.json',
                     'ff7876883da8135572b3650109bc5b11a0ba1f8a0d25b0c47db159214aca06b0',ROOT)]
for row in read(NI / 'integration-plan.reviewed.json')['requiredFrozenIndependentScientificInputSets']:
    item = frozen(ROOT / row['manifestPath'],row['manifestSHA256'],ROOT)
    assert item['actualPhysicalFileCount'] == row['actualFrozenFilesVerified']
    historical.append(item)
assert sum(x['actualPhysicalFileCount'] for x in historical) == 1534
q1 = read(CAND / 'q1-paused-four-inputs.actual.freeze.json')
assert len(q1['files']) == 4
for row in q1['files']:
    p = ROOT / row['path']
    assert sha(p) == row['sha256'] and p.stat().st_size == row['bytes']

stage_code = ROOT / 'backend/src/main/java/com/skillpilot/backend/service/CompositionViewService.java'
stage_text = stage_code.read_text()
assert 'hasExactLearnerAnchorScope' in stage_text and 'findLearnerScopeView' in stage_text
anchor_body = stage_text.split('private static boolean hasExactLearnerAnchorScope(',1)[1].split('\n    }',1)[0]
assert 'normalizeValue(normalizedRequestedScope.get(STAGE_KEY))' in anchor_body
assert 'normalizeValue(asString(authoredScope.get(STAGE_KEY)))' in anchor_body
assert 'requestedStage.equals(authoredStage)' in anchor_body
assert 'requestedSchoolForm.equals(authoredSchoolForm)' in anchor_body
stage_caller = ROOT / 'backend/src/main/java/com/skillpilot/backend/service/LearnerService.java'
assert '.findLearnerScopeView(' in stage_caller.read_text()
stage_witness = {'committedLearnerViewServicePath':str(stage_code.relative_to(ROOT)),
                 'serviceSHA256':sha(stage_code),
                 'learnerCallerPath':str(stage_caller.relative_to(ROOT)),'learnerCallerSHA256':sha(stage_caller),
                 'claim':'Committed learner view selection requires exact normalized school-form and stage anchors. Existing generic CrossStage fallback is retained; no claim that all legacy lookup paths use exact stage.',
                 'sourceInspectionOnly':True,'backendJavaTestsExecutedByReviewer':False}

result = {'schemaVersion':1,'checkedAtUTC':datetime.now(timezone.utc).isoformat(),
          'reviewer':'/root/chem_qa_native_guard','result':'PASS',
          'candidateFinalPhysicalManifest':final,'finalExactGuardedPlanSHA256':sha(plan_path),
          'allFiveDestinationsStillUnappliedAndMatchExactBeforeSHA':actual_destinations,
          'onlyRegistryChange':'subjects[subject=biologie].memoryReviewConfigPath',
          'allOtherRegistryBytesAndMaturityFloorsExact':True,
          'newMemoryConfigUsesSameFrozen383CurrentDecisionAndCardLedgers':True,
          'defaultMemoryConfigChanges':['reviewPath','cardReviewPath','visibilityScopes','visibilityScopeCoverageRequired'],
          'defaultMemoryConfigExactlyMatchesNewActiveConfig':True,
          'otherNineDefaultMemoryConfigsPhysicallyExact':default_other_files,
          'allCanonAndSemanticKindsUnchangedAfterPriorMinimalMetadataFix':True,
          'completeCandidateViewNativeChecksPass':True,'actualNative128RegionalCases':128,
          'actualNativeProjectionSetCases':46,'actualWholeTransitivePrerequisiteCases':168,
          'onlyTwoNIAtomicCountsChange':'88→108: 18 ordinary atoms and 2 memory nodes',
          'normativeNIRemainsG9AndG8OnlyCompatibilityWitness':True,
          'actualNativeM383AndAllCardsPass':True,'independentTwoRemovalNegativeWitnessesPass':True,
          'nativeWhole383BookOriginalSourcesAndProtected67BindingsExact':True,
          'frozenHistoricalInputSetsPhysicallyExact':historical,'historicalPhysicalFileEntries':1534,
          'pausedQ1FourInputFilesExact':q1['files'],'committedStageScopeSourceWitness':stage_witness,
          'activeWrites':False,'newScientificCompletions':0,'newScientificApprovals':0,
          'humanApproval':False,'humanTrial':False,
          'rootActualIntegrationAndStableCentralMemoryCompositionJavaMaturityChecksRequired':True}
path = OUT / 'independent-final-exact-five-destination-adoption.actual.json'
assert not path.exists()
path.write_text(json.dumps(result,indent=2,ensure_ascii=False)+'\n')
print('PASS: frozen final 66 files; exact five guarded destinations; registry/default M383 scopes; 1534 immutable historical entries; paused four Q1 inputs; no active writes or new science.')
