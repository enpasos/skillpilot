#!/usr/bin/env python3
"""Bounded stock schema/guard and exact-data checks; no scientific oracle."""
import hashlib
import importlib.util
import json
import subprocess
from pathlib import Path
from datetime import datetime, timezone
import jsonschema

ROOT = Path('/home/enpasos/projects/skillpilot')
OWN = Path(__file__).parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-corrected-P8-targeted-native4-technical-20261014-v1'
ROUND = AUTHOR / 'native-four/round-a'

def load(p):
    return json.loads(p.read_text(), parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s)))

def sha(p):
    return 'sha256:' + hashlib.sha256(p.read_bytes()).hexdigest()

def bind(p):
    return {'path': str(p.relative_to(ROOT)), 'sha256': sha(p), 'bytes': p.stat().st_size}

def write(name, v):
    p = OWN / name
    p.parent.mkdir(exist_ok=True, parents=True)
    p.write_text(json.dumps(v, ensure_ascii=False, indent=2, allow_nan=False) + '\n')

campaign = load(ROUND / 'description-review-campaign.json')
bundle_manifest_path = ROUND / 'review-bundle-manifest.json'
bundle_manifest = load(bundle_manifest_path)
bundle_artifact_checks = []
for artifact in bundle_manifest['artifacts']:
    p = AUTHOR / 'native-four/bundle' / artifact['path']
    assert sha(p) == artifact['digest'] and p.stat().st_size == artifact['bytes']
    bundle_artifact_checks.append({'role': artifact['role'], **bind(p)})
write('checks/original-bundle-artifacts-actual-byte-hashes.actual.json', {'schemaVersion': 1, 'originalRoundAManifest': bind(bundle_manifest_path), 'allRunOriginalBundleArtifactDigestsVerified': True, 'artifacts': bundle_artifact_checks, 'pass': True})
base = campaign['batches'][0]['batchId']
records_path = OWN / 'results' / (base + '.records.jsonl')
run_path = OWN / 'results' / (base + '.run.json')
records = [json.loads(s) for s in records_path.read_text().splitlines()]
run = load(run_path)
schema = load(ROUND / 'contracts/goal-description-review-record.schema.json')
for record in records:
    jsonschema.Draft202012Validator(schema, format_checker=jsonschema.FormatChecker()).validate(record)
run_schema_path = ROOT / 'contracts/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json'
jsonschema.Draft202012Validator(load(run_schema_path), format_checker=jsonschema.FormatChecker()).validate(run)
assert run['outputDigest'] == sha(records_path)
assert len(records) == 4
write('checks/native-records-and-full-run-manifest.original-schema.actual.json', {'schemaVersion': 1, 'recordsSchema': bind(ROUND / 'contracts/goal-description-review-record.schema.json'), 'runManifestSchema': bind(run_schema_path), 'records': bind(records_path), 'run': bind(run_path), 'recordCount': 4, 'recordsAllSchemaValid': True, 'runManifestFullySchemaValid': True, 'outputBytesDigestMatches': True, 'dateTimeFormatsValid': True, 'pass': True})

command = [str(ROOT / 'app/node_modules/.bin/tsx'), 'scripts/validateGoalDescriptionReviewCampaignResults.ts', '--bundle', str(ROUND / 'review-bundle-manifest.json'), '--input', str(ROUND / 'description-review-input.json'), '--campaign', str(ROUND / 'description-review-campaign.json'), '--batches-dir', str(ROUND / 'batches'), '--results-dir', str(OWN / 'results')]
result = subprocess.run(command, cwd=ROOT / 'app', text=True, capture_output=True)
write('checks/native4-campaign-results.unmodified-stock.actual.json', {'schemaVersion': 1, 'stockValidator': bind(ROOT / 'app/scripts/validateGoalDescriptionReviewCampaignResults.ts'), 'command': command, 'exitCode': result.returncode, 'stdout': result.stdout, 'stderr': result.stderr, 'pass': result.returncode == 0, 'scientificVerdictNotInferredFromStructuralPass': True})
assert result.returncode == 0, result.stderr

selector = load(AUTHOR / 'NEUTRAL.current407-corrected-P8-targeted-native4.exact-input-selector.json')
goals = {g['id']: g for g in load(ROOT / selector['candidateLandscape']['path'])['goals']}
data = load(ROUND / 'description-review-input.json')
pdf_manifest_path = AUTHOR / 'native-four/bundle/book.pdf.render-manifest.json'
pdf_manifest = load(pdf_manifest_path)
asset_checks = []
context_checks = []
for selected in data['goals']:
    i = selected['goalId']
    page = selected['reviewContext']['page']
    goal = goals[i]
    assert selected['currentDescriptionDe'] == goal['description'] == page['description']
    assert selected['currentDescriptionEn'] == goal['descriptionEn']
    assert selected['currentTitleDe'] == goal['title'] == page['title']
    assert selected['currentTitleEn'] == goal['titleEn']
    assert set(goal['requires']) == {r['goalId'] for key in ['requires', 'externalPrerequisites'] for r in page[key]}
    actual_reverse = {g['id'] for g in goals.values() if i in g.get('requires', [])}
    assert actual_reverse == {r['goalId'] for key in ['reverseRequires', 'externalReverseRequires'] for r in page[key]}
    image = page['visualization']
    source = AUTHOR / 'public-root' / image['url'].lstrip('/')
    asset = next(a for a in pdf_manifest['assets'] if a['publicPath'] == image['url'])
    assert sha(source) == image['originalDigest'] == asset['sourceSha256']
    assert source.stat().st_size == asset['sourceBytes']
    for r in page['requires'] + page['reverseRequires']:
        target = next(g['reviewContext']['page'] for g in data['goals'] if g['goalId'] == r['goalId'])
        assert r['pageNumber'] == target['pageNumber'] and r['title'] == target['title']
    asset_checks.append({'goalId': i, 'sourceAsset': bind(source), 'nativeManifestAsset': asset, 'tupleExact': True})
    context_checks.append({'goalId': i, 'fullDEENTextExact': True, 'wholeCanonicalDirectPrerequisiteIds': goal['requires'], 'wholeCanonicalReverseRequiresIds': sorted(actual_reverse), 'nativeRelationshipsAndLocalPageTargetsExact': True, 'actualPProfileFingerprint': selected['reviewContext']['evidenceProfile']['profileFingerprint']})
assert pdf_manifest['physicalPageCount'] == 6 and pdf_manifest['goalPageCount'] == 4
assert sha(AUTHOR / 'native-four/bundle/book.pdf') == pdf_manifest['artifactSha256']
write('checks/native-four-current-whole-tuples-and-real-asset-bindings.actual.json', {'schemaVersion': 1, 'pdf': bind(AUTHOR / 'native-four/bundle/book.pdf'), 'renderManifest': bind(pdf_manifest_path), 'physicalPages': 6, 'nativeGoalPages': 4, 'actualViewedPhysicalPages': [1, 2, 3, 4, 5, 6], 'assets': asset_checks, 'contexts': context_checks, 'pass': True})

delta_path = AUTHOR / 'checks/six-original-native8-goals-exact-content-and-location-only-delta.actual.json'
delta = load(delta_path)
def without_locations(v):
    if isinstance(v, dict):
        return {k: without_locations(x) for k, x in v.items() if k not in ['pageNumber', 'navigationOrder', 'treeOrder', 'pageFingerprint']}
    if isinstance(v, list):
        return [without_locations(x) for x in v]
    return v
unchanged = []
for row in delta['checks']:
    assert row['wholeGoalExact'] and row['fullPagesOnlyLocationFieldsChanged']
    assert row['allGoalReferencesTitlesPrerequisitesDescriptionsImagesAndPBoundContentExact']
    assert without_locations(row['oldPage']) == without_locations(row['newPage'])
    unchanged.append({'goalId': row['goalId'], 'fullNativePageComparisonMinusNumericalLocationsAndDerivedPageFingerprint': True, 'newScientificReviewPerformed': False})
assert len(unchanged) == 6
write('checks/six-unaffected-native-goals-full-page-location-only-proof.actual.json', {'schemaVersion': 1, 'sourceProof': bind(delta_path), 'checks': unchanged, 'reviewPerformedAfterFourScientificJudgments': True, 'oldPeerVerdictsRead': False, 'pass': True})

companion = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-14/chemie-current407-native4-full-case-coverage-companion-20261014-v1'
companion_selector = companion / 'NEUTRAL.native4-complete-full-case-coverage.input-companion.json'
companion_seal = companion / 'SEAL.finite-native4-full-case-coverage-companion.actual.json'
assert sha(companion_seal) == 'sha256:c473879aa08fcd0630055257305d56b737af70a2ac1a6e10e576a1b88ad04f01'
companion_data = load(companion_selector)
checked_bindings = []
for v in companion_data.values():
    if isinstance(v, dict) and all(k in v for k in ['path', 'sha256', 'bytes']):
        p = ROOT / v['path']
        assert bind(p) == {k: v[k] for k in ['path', 'bytes', 'sha256']}
        checked_bindings.append(bind(p))
write('INPUTS.additional-four-whole-case-coverage-companion.exact-binding.actual.json', {'schemaVersion': 1, 'companionSelector': bind(companion_selector), 'companionSeal': bind(companion_seal), 'checkedExactBindings': checked_bindings, 'scientificQuestionsAreNotVotes': True, 'rootProofNotUsedInsteadOfWholeCaseReading': True, 'originalSelectorAndRunBindingsUnchanged': True})

spec = importlib.util.spec_from_file_location('stock_validate_schemas', ROOT / 'scripts/validate_schemas.py')
stock = importlib.util.module_from_spec(spec)
spec.loader.exec_module(stock)
errors = stock.curriculum_symlink_errors(str(ROOT))
write('checks/curriculum-symlink-errors.unmodified-stock.actual.json', {'schemaVersion': 1, 'checkedAt': datetime.now(timezone.utc).isoformat(timespec='seconds').replace('+00:00', 'Z'), 'stockFunction': 'scripts/validate_schemas.py:curriculum_symlink_errors', 'stockModule': bind(ROOT / 'scripts/validate_schemas.py'), 'errors': errors, 'errorCount': len(errors), 'pass': not errors})
assert not errors, errors

parsed = []
for p in sorted(OWN.rglob('*')):
    if p.suffix == '.json':
        load(p)
        parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'json'})
    elif p.suffix == '.jsonl':
        values = [json.loads(s, parse_constant=lambda s: (_ for _ in ()).throw(ValueError(s))) for s in p.read_text().splitlines()]
        parsed.append({'path': str(p.relative_to(OWN)), 'kind': 'jsonl', 'recordCount': len(values)})
assert not any(p.is_symlink() for p in OWN.rglob('*'))
write('checks/finite-own-root-full-json-jsonl-parse.actual.json', {'schemaVersion': 1, 'allOwnJSONAndJSONLCompletelyParsed': True, 'parsedFiles': parsed, 'ownSymlinks': 0, 'ignoredTemporaryLinks': 0, 'pass': True})
print(json.dumps({'schemaNativeRecords': 4, 'stockCampaignPass': True, 'P8Pass': load(OWN / 'checks/current-P8.unmodified-stock-fingerprint-and-join.actual.json')['pass'], 'nativeTuplesPass': True, 'unaffectedSixLocationOnlyPass': True, 'globalSymlinkErrors': len(errors), 'fullOwnJSONJSONLParsePass': True}))
