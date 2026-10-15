"""Record the actual checks and seal this additive individual handoff."""
import datetime
import hashlib
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent
REPO = next(p for p in ROOT.parents if (p / 'AGENTS.md').is_file())


def digest(path):
    return 'sha256:' + hashlib.sha256(path.read_bytes()).hexdigest()


def ref(path):
    return {'path': str(path.relative_to(REPO)), 'sha256': digest(path), 'bytes': path.stat().st_size}


def load(path):
    return json.loads(path.read_text())


def write_new(path, value):
    with path.open('x') as out:
        json.dump(value, out, ensure_ascii=False, indent=2)
        out.write('\n')


config = load(ROOT / 'run-config.actual-local-serialization.json')
science = load(REPO / config['science']['path'])
selector = load(REPO / config['selector']['path'])
closed = load(ROOT / 'CHECK.closed-stock-campaign.actual.receipt.json')
initial = load(ROOT / 'CHECK.current-target-binding.actual.receipt.json')
target = load(ROOT / 'CHECK.current-target-binding.v2.actual.receipt.json')
assert closed['exitCode'] == target['exitCode'] == 0
assert initial['exitCode'] == 1
assert 'Goal-description review campaign results valid: 8' in (ROOT / 'CHECK.closed-stock-campaign.actual.log').read_text()
target_result = load(ROOT / 'CHECK.current-target-binding.v2.actual.log')
assert target_result['status'] == 'valid' and target_result['actualBoundRecords'] == 8
for r in science['originalOwnSciencePreserved']:
    assert digest(REPO / r['path']) == r['sha256']
for name in ['science', 'records', 'run', 'parameters', 'input', 'campaign', 'batchInput', 'bundle']:
    assert digest(REPO / config[name]['path']) == config[name]['sha256']
own_relative = ROOT.relative_to(REPO)
recipe = {
    'format': 'actual executed local individual D serialization and verification recipe v1',
    'cwd': str(REPO),
    'executed': [
        {'argv': ['python', str(own_relative / 'seal_own_final_page_amendment.py')], 'exitCode': 0,
         'effect': 'Verified neutral byte pins and raw profile equality; sealed own actual page amendment before records.'},
        {'argv': ['python', str(own_relative / 'serialize_own_current_stock_records.py')], 'exitCode': 0,
         'effect': 'Created exactly eight own current candidate records and one local run; no previously existing file overwritten.'},
        closed, initial, target,
    ],
    'replayBoundary': 'Creation scripts use exclusive writes and deliberately fail if replayed into this sealed root. The two successful validation commands can be rerun read-only against these existing references; no native prepare or render command is part of this recipe.',
    'initialCheckerFailure': 'The first own target checker incorrectly compared the logical stock model source digest with a file-byte digest. Preserved v1 log/receipt/script show the failure. Own v2 uses stock stableGoalBookJson logical digests and separately checks the original file-byte pins. Stock helpers, schemas, campaign, input and own records were not changed to obtain the pass.',
    'metadataBoundary': 'The exact provider model identifier, version and sampling parameters are not exposed in this agent session. They are explicitly unexposed in the parameter artifact; the local run identity and actual local timestamps are not provider request or laboratory metadata.',
}
recipe_path = ROOT / 'RECIPE.actual-commands-and-checks.json'
write_new(recipe_path, recipe)
handoff = {
    'format': 'own independent chemistry D8 final written native binding handoff v1',
    'recordedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'reviewRole': 'independent chemistry description reviewer A',
    'actualReviewMode': 'informed continuation of own preserved first science and own finite profile amendments',
    'currentNeutralInputSelector': config['selector'],
    'currentActualPageSeal': science['pageSeal'],
    'scientificAmendmentSealedBeforeStock': config['science'],
    'scientificAmendmentSeal': ref(ROOT / 'FOLLOWUP.actual-final-written-eight-page-bindings.before-stock.seal.json'),
    'preservedOwnOriginalScience': science['originalOwnSciencePreserved'],
    'currentDescriptionReviewInput': config['input'],
    'currentDescriptionReviewCampaign': config['campaign'],
    'currentExactBatchInput': config['batchInput'],
    'currentBundle': config['bundle'],
    'currentBookModel': selector['actualBookModel'],
    'currentActualPdf': selector['actualBookPdf'],
    'records': config['records'], 'run': config['run'],
    'runConfig': ref(ROOT / 'run-config.actual-local-serialization.json'),
    'generationParametersAndExposureBoundary': config['parameters'],
    'existingNativeBaseConfig': config['existingNativeBaseConfig'],
    'existingNativePrepareConfig': config['existingNativePrepareConfig'],
    'recipe': ref(recipe_path),
    'successfulChecks': {
        'closedUnmodifiedStockCampaignResults': {'receipt': ref(ROOT / 'CHECK.closed-stock-campaign.actual.receipt.json'), 'log': ref(ROOT / 'CHECK.closed-stock-campaign.actual.log'), 'exitCode': 0, 'records': 8},
        'currentWholeCanonicalBilingualContextAndModelPageBindings': {'receipt': ref(ROOT / 'CHECK.current-target-binding.v2.actual.receipt.json'), 'log': ref(ROOT / 'CHECK.current-target-binding.v2.actual.log'), 'exitCode': 0, 'records': 8},
    },
    'retainedInitialOwnCheckerFailure': {'receipt': ref(ROOT / 'CHECK.current-target-binding.actual.receipt.json'), 'log': ref(ROOT / 'CHECK.current-target-binding.actual.log'), 'exitCode': 1, 'resolvedBy': 'own target checker v2 uses correct stock logical digest contract; no record or stock source edit'},
    'scientificResult': {'keep': 8, 'revise': 0, 'split_review': 0, 'block': 0, 'profileRecommendationNone': 8},
    'actualScope': {'currentNativePagesActuallyViewed': 8, 'writtenRawProfilesExactlyComparedWithOwnReviewedSuccessor': 2, 'otherSixProfilesUnchanged': True, 'wholeCaseAndRubricPairsPreviouslyReadAndUnchanged': 19, 'allEightBilingualGoalsAndImmediateContextsUnchanged': True},
    'chemicalPrecisionDe': 'Bei b47 bleibt das Grundgerüst der Restgruppe erhalten; Protonenübertragung kann O–H-/N–H-Bindungen verändern. Die sechs Understanding-Felder der eigenen Normalrecords enthalten diese begrenzte chemische Aussage.',
    'status': 'needs_human_review', 'recordStatus': 'candidate', 'reviewAuthority': 'ai_candidate',
    'HumanApproval': False, 'HumanTrial': False,
    'actualLearnerPerformanceOrMeasurementsObserved': False,
    'otherReviewerDOrPositivePAVJudgmentsRead': False,
    'newNativePrepareRenderingOrRasterCopyPerformed': False,
    'canonicalRegistryRuntimeGitCentralMutation': False,
    'commonPairResolutionSynthesisOrFinalizationPerformed': False,
}
handoff_path = ROOT / 'FINAL.own-current-D8-normalrecords-and-exact-inputs.selector.json'
write_new(handoff_path, handoff)
files = sorted(p for p in ROOT.rglob('*') if p.is_file())
seal_path = ROOT / 'FILES.own-final-written-D8.seal.json'
write_new(seal_path, {'schemaVersion': 1, 'sealedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
                      'role': 'additive independent reviewer A final individual outputs', 'files': [ref(p) for p in files],
                      'authority': 'ai_candidate', 'status': 'needs_human_review', 'HumanApproval': False, 'HumanTrial': False})
print(json.dumps({'selector': ref(handoff_path), 'seal': ref(seal_path), 'recordCount': 8, 'decisionCounts': {'keep': 8}, 'closedStockExit': 0, 'targetBindingExit': 0}, ensure_ascii=False, indent=2))
