from pathlib import Path
import datetime
import hashlib
import json
from PIL import Image

ROOT = Path.cwd()
BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-10')
OUT = BASE / 'biologie-sek1-insect-eight-reviewed-integration-technical-v1'
PREFLIGHT = BASE / 'biologie-sek1-insect-eight-reviewed-integration-preflight-technical-root-v1'
ORIGINAL = BASE / 'biologie-sek1-insect-eight-raster-native-technical-author-20261010-v1'
CURRENT = BASE / 'biologie-sek1-insect-eight-frog-adult-targeted-raster-native-author-successor-v2'
A = BASE / 'biologie-sek1-insect-eight-current-native-and-raster-independent-a-20261010-v1'
B = BASE / 'biologie-sek1-insect-eight-current-native-and-raster-independent-b-20261010-v1'
DUAL = BASE / 'biologie-sek1-insect-eight-original-seven-plus-current-fcc-one-dual-resolution-technical-20261010-v1'
CANON = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
KINDS = Path('curricula/DE/Gymnasium/quality/goal-book-publication/biologie.semantic-kinds.json')
REGISTRY = Path('curricula/DE/Gymnasium/quality/deep-understanding-rollout/de-gymnasium-math-physics.config.json')
ATLAS = Path('app/scripts/config/goal-books/de-gym-biology-national-atlas.inputs.json')
QA = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
FCC = 'fcc20f50-8eb3-5d6c-b37f-5be13c7d314e'
declared = {}


def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()


def binding(path):
    path = Path(path)
    assert not path.is_absolute() and '..' not in path.parts, str(path)
    data = path.read_bytes()
    value = {'path': str(path), 'sha256': sha(data), 'bytes': len(data)}
    old = declared.get(str(path))
    assert old is None or old == value, str(path)
    declared[str(path)] = value
    return value


def read(path):
    binding(path)
    return json.loads(Path(path).read_text())


def verify(value):
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str):
            actual = binding(value['path'])
            assert actual['sha256'].removeprefix('sha256:') == value['sha256'].removeprefix('sha256:'), value['path']
            if isinstance(value.get('bytes'), int):
                assert actual['bytes'] == value['bytes'], value['path']
        for child in value.values():
            verify(child)
    elif isinstance(value, list):
        for child in value:
            verify(child)


def put(name, value):
    path = OUT / name
    path.parent.mkdir(parents=True, exist_ok=True)
    data = value if isinstance(value, bytes) else (json.dumps(value, ensure_ascii=False, indent=2) + '\n').encode()
    assert not path.exists(), str(path)
    path.write_bytes(data)
    return binding(path)


seals = [
    (PREFLIGHT / 'preflight-current-eight.technical.freeze.json', '96b116afaded54dba9edc269e4bb7fa6789a8874fc999d1cd064b2bd4c6716d2'),
    (A / 'FINAL.original8-plus-current-fcc1-independent-a.freeze.json', 'ecd24de17faa3b83702084b9f62b899053d3ead5dc2d83a30374c4ca00dda4d6'),
    (B / 'independent-b.final.freeze.json', 'e3cefacb0aebcd49affb02aff10cf38933b4f71182525b34e579a84832ee230a'),
    (DUAL / 'FINAL.technical.freeze.json', 'ae4da3eb9091f90cb6161f6fa11e40989079e29c59e025c8935d47dc48d95fd8'),
]
for path, digest in seals:
    assert binding(path)['sha256'] == 'sha256:' + digest, str(path)
    verify(read(path))
preflight = read(PREFLIGHT / 'inactive-current-eight-preflight.actual.json')
verify(preflight)
ids = preflight['goalIds']
assert len(ids) == len(set(ids)) == 8 and FCC in ids
before = read(CANON)
candidate = read(preflight['candidate']['path'])
assert CANON.read_bytes() == (PREFLIGHT / 'inputs/whole479-before-active.exact.json').read_bytes()
assert KINDS.read_bytes() == (PREFLIGHT / 'inputs/current394-kinds.exact.json').read_bytes()
assert ATLAS.read_bytes() == (PREFLIGHT / 'inputs/atlas-before-eight-active.exact.json').read_bytes()
assert REGISTRY.read_bytes() == (PREFLIGHT / 'inputs/registry-before-eight-active.exact.json').read_bytes()
old = {goal['id']: goal for goal in before['goals']}
new = {goal['id']: goal for goal in candidate['goals']}
assert len(old) == len(new) == 479 and old.keys() == new.keys()
assert {key: value for key, value in before.items() if key != 'goals'} == {key: value for key, value in candidate.items() if key != 'goals'}
changed = {}
for goal_id in old:
    fields = sorted(key for key in set(old[goal_id]) | set(new[goal_id]) if old[goal_id].get(key) != new[goal_id].get(key))
    if fields:
        changed[goal_id] = fields
assert set(changed) == set(ids) and all(fields == ['resourceLinks'] for fields in changed.values())
authority = read(ORIGINAL / 'inputs/current327-exact-strict-ID-authority.exact.json')
protected = next(subject for subject in authority['subjects'] if subject['subject'] == 'biologie')['strictCompleteGoalIds']
assert len(protected) == 327 and not set(protected).intersection(ids)
assert all(old[goal_id] == new[goal_id] for goal_id in protected)

# Exact original seven V findings plus genuinely inspected current FCC1.
original_a = read(A / 'FIRST.actual-eight-raster-independent-a.verdict.json')
current_a = read(A / 'FIRST.current-fcc1-native-raster-DP-independent-a.verdict.json')
current_b = read(B / 'current-eight.actual-V-findings.json')
av = {row['goalId']: row for row in original_a['actual24RasterViews']}
bv = {row['goalId']: row for row in current_b['records']}
assert set(av) == set(bv) == set(ids) and current_b['allCurrentKEEP']
assert current_a['goalId'] == FCC and current_a['decision'] == 'keep' and current_a['actualVisualDecision'] == 'KEEP_MACHINE_CANDIDATE'
assert av[FCC]['ownDecision'] != 'KEEP_MACHINE_CANDIDATE'
assets = []
copies = []
paired = []
for goal_id in ids:
    a = current_a if goal_id == FCC else av[goal_id]
    b = bv[goal_id]
    assert b['decision'] == 'KEEP' and b['actualOriginalWholeViewed'] and b['actualProportional360Viewed'] and b['actualProportional680Viewed']
    if goal_id == FCC:
        assert b['findings']['decisions'] == {'V': 'KEEP', 'D': 'KEEP', 'P': 'KEEP', 'nativeRender': 'KEEP'}
        assert len(b['findings']['actualTargetedViews']) == 3
        assert all(view['actualView'] and not view['cropped'] for view in b['findings']['actualTargetedViews'])
        b_science = [b['findings']['findingsDe']]
        b_format = ' '.join(view['observationDe'] for view in b['findings']['actualTargetedViews'][1:])
    else:
        assert not b['findings']['blockingFindings']
        b_science = b['findings']['scienceAndStructureFindingsDe']
        b_format = b['findings']['phone360AndPc680FindingsDe']
    if goal_id == FCC:
        original = a['currentAsset']
        a_origin = A / 'FIRST.current-fcc1-native-raster-DP-independent-a.verdict.json'
        a_rationale = a['actualVisualFindingDe']
    else:
        assert a['ownDecision'] == 'KEEP_MACHINE_CANDIDATE' and a['actualRequiredCorrection'] is None
        original = a['actualViewedOriginal']
        a_origin = A / 'FIRST.actual-eight-raster-independent-a.verdict.json'
        a_rationale = a['rationaleDe']
    assert original == b['raster']
    verify(original)
    directory = Path(original['path']).parent
    phone = directory / 'inspection-360.png'
    desktop = directory / 'inspection-680.png'
    assert Image.open(original['path']).size == (1672, 941)
    assert Image.open(phone).size == (360, 203) and Image.open(desktop).size == (680, 383)
    url = next(link['url'] for link in new[goal_id]['resourceLinks'] if link['type'] == 'goal-visualization')
    assert url == f'/assets/goal-visualizations/biologie/{goal_id}/{goal_id}.png'
    canonical_dir = Path('curricula/DE/Gymnasium/visualizations/biologie') / goal_id
    for path in sorted(directory.iterdir()):
        if not path.is_file() or path.name in ['inspection-360.png', 'inspection-680.png']:
            continue
        if path.suffix not in ['.png', '.md', '.txt', '.json']:
            continue
        targets = [canonical_dir / path.name]
        if path.name == goal_id + '.png':
            targets.extend([Path('app/public' + url), Path('backend/src/main/resources/static' + url)])
        for target in targets:
            assert not target.exists(), str(target)
            copies.append({'goalId': goal_id, 'from': binding(path), 'to': str(target),
                           'role': 'Exact accepted current PNG' if path.suffix == '.png' else 'Complete current direct provider/prompt/preparation metadata; historical audit judgments retained as provenance, not approval'})
    assets.append({'goalId': goal_id, 'exactAssetDirectory': str(directory), 'reviewedOriginal': binding(Path(original['path'])),
                   'phone360': binding(phone), 'pc680': binding(desktop), 'learnerUrl': url,
                   'canonicalDirectory': str(canonical_dir),
                   'frontendDirectory': str(Path('app/public' + url).parent),
                   'backendDirectory': str(Path('backend/src/main/resources/static' + url).parent)})
    paired.append({'goalId': goal_id, 'actualCurrentAsset': original,
                   'aOrigin': binding(a_origin), 'aDecision': 'KEEP_MACHINE_CANDIDATE', 'aActualRationaleDe': a_rationale,
                   'bOrigin': binding(Path(b['reviewOrigin']['path'])), 'bDecision': b['decision'],
                   'bActualScienceFindingsDe': b_science,
                   'bActual360680FindingsDe': b_format,
                   'humanApproval': False, 'technicalSynthesisNotThirdReview': True})

# Keep the operative author P7/P1 config and raw records exactly.
positive_configs = [CURRENT / 'positive/7-future-active.P.inactive.config.json', CURRENT / 'positive/1-future-active.P.inactive.config.json']
positive = []
positive_ids = []
for config_path in positive_configs:
    config = read(config_path)
    assert config['landscapePath'] == str(CANON) and config['semanticKindLedgerPath'] == str(KINDS)
    rows = [json.loads(line) for line in Path(config['reviewPath']).read_text().splitlines()]
    assert {row['goalId'] for row in rows} == set(config['scope']['goalIds'])
    assert all(row['reviewId'] == config['reviewId'] and row['status'] == 'needs_human_review'
               and row['reviewAuthority'] == 'ai_candidate' and row['evidenceLevel'] == 'E1'
               and row['maximumClaimScope'] == 'G1' for row in rows)
    positive_ids.extend(row['goalId'] for row in rows)
    positive.append({'config': binding(config_path), 'exactAuthorRecords': binding(Path(config['reviewPath'])),
                     'operativeReviewId': config['reviewId'], 'count': len(rows), 'independentSupplementaryReviewsNotSubstituted': True})
assert len(positive_ids) == len(set(positive_ids)) == 8 and set(positive_ids) == set(ids)
old_rows = [json.loads(line) for line in (ORIGINAL / 'positive/eight-current-raster.P.author.review.jsonl').read_text().splitlines()]
seven_rows = [json.loads(line) for line in (CURRENT / 'positive/seven-original-current-raster.P.exact.jsonl').read_text().splitlines()]
assert seven_rows == [row for row in old_rows if row['goalId'] != FCC]
assert positive[0]['operativeReviewId'] != positive[1]['operativeReviewId']

registry = read(REGISTRY)
future = json.loads(json.dumps(registry))
bio = next(subject for subject in future['subjects'] if subject['subject'] == 'biologie')
old_bio = next(subject for subject in registry['subjects'] if subject['subject'] == 'biologie')
indexes = [DUAL / 'original-eight-seven-resolved-one-historical-deferred/resolution-index.json', DUAL / 'current-fcc-one/resolution-index.json']
current_d = []
prior_d = []
for path in old_bio['resolutionIndexPaths']:
    index = read(path)
    prior_d.extend({'goalId': row['goalId'], 'indexPath': path} for row in index['resolutions'] if row['goalId'] in ids)
assert not prior_d, prior_d
for path in indexes:
    index = read(path)
    current_d.extend(row['goalId'] for row in index['resolutions'])
    assert str(path) not in bio['resolutionIndexPaths']
    bio['resolutionIndexPaths'].append(str(path))
assert len(current_d) == len(set(current_d)) == 8 and set(current_d) == set(ids)
assert read(indexes[0])['deferredGoalIds'] == [FCC] and not read(indexes[1]).get('deferredGoalIds')
for path in positive_configs:
    assert str(path) not in bio['positiveEvidenceConfigPaths']
    bio['positiveEvidenceConfigPaths'].append(str(path))
assert {key: value for key, value in bio.items() if key not in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths']} == {key: value for key, value in old_bio.items() if key not in ['resolutionIndexPaths', 'positiveEvidenceConfigPaths']}
assert all(subject == next(other for other in future['subjects'] if other['subject'] == subject['subject']) for subject in registry['subjects'] if subject['subject'] != 'biologie')
assert {key: value for key, value in future.items() if key != 'subjects'} == {key: value for key, value in registry.items() if key != 'subjects'}
am = []
for key in ['semanticAtomicityConfigPath', 'memoryReviewConfigPath']:
    config_path = Path(bio[key])
    config = read(config_path)
    records = Path(config['reviewPath'])
    rows = [json.loads(line) for line in records.read_text().splitlines()]
    assert len(rows) == 394 and set(ids).issubset(row['goalId'] for row in rows)
    am.append({'config': binding(config_path), 'whole394ExactScientificRecords': binding(records),
               'rootNormalCurrentRetentionPreflight': binding(PREFLIGHT / 'checks' / ('normal-A394-current-inactive.terminal.actual.json' if key == 'semanticAtomicityConfigPath' else 'normal-M394-current-inactive.terminal.actual.json'))})
    assert bio[key] == old_bio[key]

put('candidate/whole479-eight-reviewed.inactive.json', Path(preflight['candidate']['path']).read_bytes())
put('candidate/registry.eight-reviewed.future-active.json', future)
put('candidate/atlas.future-active.inputs.exact.json', ATLAS.read_bytes())
put('candidate/eight-current-reviewed-raster-copy-plan.json', {'schemaVersion': 1, 'assets': assets,
                                                              'exactCopies': copies, 'pairedCurrentMachineKEEP': paired,
                                                              'historicalOriginalFCCDissentPreserved': True,
                                                              'actualSourceImagesRegenerated': False, 'activeWrites': False,
                                                              'humanApproval': False})
put('candidate/eight-current-paired-machine-V-bindings.json', {'schemaVersion': 1, 'pairedCurrentFindings': paired,
                                                              'allCurrentActualPairedKeep': True,
                                                              'technicalSynthesizerIsExistingA': True,
                                                              'humanApproval': False, 'activeWrites': False})
put('reviewed-eight-integration.technical.entry.json', {
    'schemaVersion': 1, 'preparedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'role': 'Inactive exact reviewed BioInsect8 integration prepared by existing independent A as technical integrator; no third scientific review',
    'goalIds': ids, 'wholeGoalObjects': 479, 'curricularAtomicDenominator': 394,
    'protectedStrictGoalIds': protected, 'protected327WholeGoalsExact': True,
    'changedOldGoalFields': changed, 'kindLedgerWhole479': binding(KINDS),
    'normalA394M394CurrentPreflight': binding(PREFLIGHT / 'preflight-current-eight.technical.freeze.json'),
    'unchangedWhole394ScientificAM': am,
    'wholeSource31AndScope24Bindings': binding(ORIGINAL / 'sources/whole31-operative-source-pairs.exact.references.json'),
    'currentSourceCountsAndWhole327PageProof': binding(ORIGINAL / 'checks/actual-current-source-scope-and-protected327.normal.json'),
    'historical3312OnlyBoundedAuthoredPartialRetained': True, 'wholeSourceOrCourseReapproval': False,
    'wholeScientificP8AndSixteenCases': binding(ORIGINAL / 'science/eight-whole-profiles-and-sixteen-cases.exact.json'),
    'operativeOriginalAuthorP7AndSeparateCurrentP1': positive,
    'independentPJudgmentsRemainSupplementary': True,
    'actualReviewSeals': [binding(path) for path, _ in seals],
    'normalOriginal7PlusDeferredFCCIndex': binding(indexes[0]), 'normalCurrentFCC1Index': binding(indexes[1]),
    'originalFCCSupersessionToDeferredAdded': False, 'priorCurrentDClaimsForTheseEight': prior_d,
    'futureCanonicalCopy': binding(OUT / 'candidate/whole479-eight-reviewed.inactive.json'),
    'futureRegistry': binding(OUT / 'candidate/registry.eight-reviewed.future-active.json'),
    'futureAtlasInputsExact': binding(OUT / 'candidate/atlas.future-active.inputs.exact.json'),
    'actualRasterCopyPlan': binding(OUT / 'candidate/eight-current-reviewed-raster-copy-plan.json'),
    'pairedCurrentMachineV': binding(OUT / 'candidate/eight-current-paired-machine-V-bindings.json'),
    'beforeActiveBindings': [binding(path) for path in [CANON, KINDS, REGISTRY, ATLAS, QA]],
    'declaredExactBindings': list(declared.values()),
    'sourceKindsAMAndOtherSubjectFloorsChanged': False,
    'normalModelPageSourceP7P1ChecksPending': True, 'rootActiveAdoptionPending': True,
    'activeWrites': False, 'historicalWrites': False, 'newScientificClosuresCounted': 0,
    'restoredBindingsCounted': 0, 'strictNetGain': 0, 'humanApproval': False,
    'humanTrial': False, 'actualLearnerPerformance': False,
})
print(json.dumps({'inactiveReviewedEightPrepared': True, 'whole479': True, 'denominator': 394,
                  'protected327Exact': True, 'currentStrictD7plus1': True, 'pairedCurrentV8': True,
                  'operativeAuthorP7P1ReviewIdsExact': True, 'copyPlanFiles': len(copies),
                  'declaredVerifiedBindings': len(declared), 'activeWrites': 0, 'strictNetGain': 0}))
