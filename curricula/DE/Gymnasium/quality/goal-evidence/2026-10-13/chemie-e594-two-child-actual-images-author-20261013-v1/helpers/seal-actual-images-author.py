#!/usr/bin/env python3
# Apache-2.0. Exact finite image candidate seal; no scientific approval output.
import copy, hashlib, json, re, struct
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path.cwd()
OWN = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-child-actual-images-author-20261013-v1')
V1 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-synthesis-routes-scope-preserving-author-20261013-v1')
V2 = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-13/chemie-e594-two-route-source-and-view-remediation-author-20261013-v2')
EX = Path('tmp/chemie-e594-two-child-actual-images-exec-20261013-v1')
PARENT_PNG = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-12/chemie-e594-vertex-corrected-actual-V-fresh-independent-20261013-v5/inputs/e594.actual-selected-native-byte-exact.png')

def read(path):
    return json.loads((ROOT / path).read_text())

def bind(path):
    b = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': 'sha256:' + hashlib.sha256(b).hexdigest(), 'bytes': len(b)}

def write(path, data):
    p = ROOT / OWN / path
    p.parent.mkdir(parents=True, exist_ok=True)
    with p.open('x') as out:
        out.write(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
    return bind(OWN / path)

v1_seal = read(V1 / 'FINAL.finite-inactive-author.freeze.json')
v2_seal = read(V2 / 'FINAL.finite-inactive-source-view-author.freeze.json')
for binding in v1_seal['outputFiles'] + v1_seal['originalInputBindings'] + v2_seal['outputFiles']:
    assert bind(Path(binding['path'])) == binding
assert bind(PARENT_PNG)['sha256'] == 'sha256:a728cc442316a8028844ac7d48f15dc490e4f85882f002eab99c81f683b832f3'
isolation = read(OWN / 'inputs/exact-source-goals-and-private-stock-helper-isolation.actual.json')
for binding in isolation['inputBindings']:
    assert bind(Path(binding['path'])) == binding
for binding in isolation['threeUnchangedStockHelpers']:
    relative = Path(binding['path'])
    assert bind(relative) == binding
    assert (ROOT / EX / relative).read_bytes() == (ROOT / relative).read_bytes()
generations = read(OWN / 'checks/two-actual-builtin-tool-generation-receipts.author.json')['generations']
imports = read(OWN / 'checks/two-stock-import-private-copies-and-selected-asset-receipts.actual.json')['imports']
projection = read(OWN / 'candidate/two-whole-goal-with-stock-imported-links.inactive.json')
before_by = {g['id']: g for g in isolation['exactCurrentWholeChildren']}
after_by = {g['id']: g for g in projection['goals']}
cas = []
assets = []
for generation, imported in zip(generations, imports):
    gid = generation['goalId']
    before = before_by[gid]
    after = after_by[gid]
    stripped = copy.deepcopy(after)
    links = stripped.pop('resourceLinks')
    assert stripped == before
    assert len(links) == 1 and links[0]['skillpilotId'] == gid and links[0]['reviewStatus'] == 'pilot'
    assert links[0]['license'] == 'CC-BY-4.0'
    asset_path = Path(imported['canonicalCandidateImagePath'])
    asset = bind(asset_path)
    assert asset['sha256'] == generation['generatedSha256']
    b = (ROOT / asset_path).read_bytes()
    assert b[:8] == b'\x89PNG\r\n\x1a\n'
    assert struct.unpack('>II', b[16:24]) == (1672, 941)
    for prefix in ['curricula/DE/Gymnasium/visualizations', 'app/public/assets/goal-visualizations', 'backend/src/main/resources/static/assets/goal-visualizations']:
        assert (ROOT / EX / prefix / 'chemie' / gid / f'{gid}.png').read_bytes() == b
    # Original standard tool output stays intact; it is provenance, not a
    # portable review dependency. The committed candidate is the reviewed input.
    assert Path(generation['defaultGeneratedFileInformationalProvenanceOnly']).read_bytes() == b
    prompt_path = OWN / 'prompts' / f'{gid}.actual-provider-prompt.de.md'
    provider_prompt = (ROOT / prompt_path).read_text()
    assert not re.search(r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', provider_prompt)
    assert 'SkillPilot' not in provider_prompt
    cas.append({'expectedBeforeWholeChild': before, 'proposedAfterWholeChild': after, 'onlyResourceLinksAdded': True, 'canonicalCandidateAsset': asset, 'noActiveImport': True})
    assets.append({'goalId': gid, 'asset': asset, 'nativeWidth': 1672, 'nativeHeight': 941, 'actualProviderPrompt': bind(prompt_path), 'stockImportedPromptMetadata': bind(asset_path.parent / 'prompt.de.md'), 'stockImportedReconstructionPrompt': bind(asset_path.parent / 'image-reconstruction-prompt.de.md'), 'actualBuiltinTool': 'image_gen.imagegen', 'modelUnreported': True, 'noVApprovalClaim': True})
write(Path('candidate/two-child-resource-link-whole-goal-CAS.inactive-author.json'), {'sourceWholeGoalCASBinding': bind(V1 / 'candidate/three-existing-whole-goal-CAS-and-two-new-whole-children.inactive-author.json'), 'wholeChildCompareAndSwap': cas, 'parentOverviewRetained': bind(PARENT_PNG), 'newDPAOrMVVotes': 0, 'activeWrites': False})
screenshots = read(OWN / 'checks/actual-360-680-browser-width-receipts.json')
assert len(screenshots['records']) == 4
for record in screenshots['records']:
    assert bind(Path(record['untouchedAssetPath']))['sha256'] == record['assetSha256']
    assert bind(Path(record['screenshotPath']))['sha256'] == record['screenshotSha256']
    assert round(record['imageBounds']['width']) == record['browserWidth']
    assert record['imageBounds']['height'] < 448
write(Path('checks/actual-source-helper-byte-equality-and-preservation.actual.json'), {'checkedAtUTC': datetime.now(timezone.utc).isoformat(), 'twoActualPNGAssets': assets, 'stockThreeHelperCopiesExact': True, 'stockThreePrivateAssetCopiesExactPerChild': True, 'nativePNGSizeEach': [1672, 941], 'originalGeneratorOutputsLeftIntact': True, 'providerPromptTechnicalIDsAbsent': True, 'sourceGoalBodyChanges': 0, 'v1OutputBindingsPreserved': len(v1_seal['outputFiles']), 'v2OutputBindingsPreserved': len(v2_seal['outputFiles']), 'parentOverviewSha256': bind(PARENT_PNG)['sha256'], 'browserScreenshotsForActualWidths': 4, 'noActiveCanonicalOrRuntimeWrites': True, 'noBookModelsOrPublicationsBuilt': True, 'newIndependentVVotes': 0, 'humanApproval': False})
selector = {'schemaVersion': 1, 'role': 'Neutral exact inactive two-child actual-PNG AUTHOR inputs; genuine independent V pending', 'exactWholeChildGoalsWithStockImportedLinks': bind(OWN / 'candidate/two-whole-goal-with-stock-imported-links.inactive.json'), 'wholeResourceLinkCAS': bind(OWN / 'candidate/two-child-resource-link-whole-goal-CAS.inactive-author.json'), 'twoActualAssetsAndPrompts': assets, 'actual360And680BrowserScreenshots': [bind(Path(record['screenshotPath'])) for record in screenshots['records']], 'actualBrowserScreenshotReceipt': bind(OWN / 'checks/actual-360-680-browser-width-receipts.json'), 'ownActualWholeImageFindings': bind(OWN / 'AUTHOR.actual-image-inspection.md'), 'actualBuiltinToolReceipts': bind(OWN / 'checks/two-actual-builtin-tool-generation-receipts.author.json'), 'actualStockImportReceipts': bind(OWN / 'checks/two-stock-import-private-copies-and-selected-asset-receipts.actual.json'), 'smallStockHelperIsolation': bind(OWN / 'inputs/exact-source-goals-and-private-stock-helper-isolation.actual.json'), 'preservationChecks': bind(OWN / 'checks/actual-source-helper-byte-equality-and-preservation.actual.json'), 'immutableV1SourceGoalsCasesProfiles': bind(V1 / 'FINAL.finite-inactive-author.freeze.json'), 'exactUnchangedTwoRouteProfiles': bind(V1 / 'positive/two-child.exact-route-profiles.author.json'), 'exactUnchangedFourDEENCases': bind(V1 / 'positive/four-child.complete-DEEN-cases.author.json'), 'immutableV2SourceAndViewLimits': bind(V2 / 'FINAL.finite-inactive-source-view-author.freeze.json'), 'parentOverviewRetained': bind(PARENT_PNG), 'sourceAndScopeHoldsNotClearedByImageGeneration': True, 'independentActualVStillPending': True, 'rootNativePageAndDPEvidenceBindingPending': True, 'newIndependentVotes': 0, 'authorScientificPasses': 0, 'activeWrites': False, 'gitOperations': False, 'humanApproval': False, 'humanTrial': False}
write(Path('NEUTRAL.two-child-actual-images.inactive-author.input-selector.json'), selector)
files = sorted(p for p in (ROOT / OWN).rglob('*') if p.is_file())
assert all(not p.is_symlink() for p in (ROOT / OWN).rglob('*'))
for p in files:
    if p.suffix == '.json':
        json.loads(p.read_text())
bindings = [bind(p.relative_to(ROOT)) for p in files]
write(Path('FINAL.finite-two-actual-child-images-author.freeze.json'), {'sealedAtUTC': datetime.now(timezone.utc).isoformat(), 'role': 'Finite actual image author checkpoint; no independent V or human approval', 'outputFiles': bindings, 'outputFileCount': len(bindings), 'outputBytes': sum(b['bytes'] for b in bindings), 'finalSelector': bind(OWN / 'NEUTRAL.two-child-actual-images.inactive-author.input-selector.json'), 'twoActualCandidatePNGHashes': [a['asset']['sha256'] for a in assets], 'originalInputBindings': isolation['inputBindings'], 'immutableV1Seal': bind(V1 / 'FINAL.finite-inactive-author.freeze.json'), 'immutableV2Seal': bind(V2 / 'FINAL.finite-inactive-source-view-author.freeze.json'), 'parentOverviewRetained': bind(PARENT_PNG), 'allStructuredOutputsParsed': True, 'symlinks': 0, 'portableReviewDependsOnCommittedAssetsNotIgnoredExecutionOrDefaultOutput': True, 'newIndependentVVotes': 0, 'scientificAuthorPasses': 0, 'activeWrites': False, 'gitOperations': False, 'humanApproval': False})
print(json.dumps({'boundOutputFiles': len(bindings), 'bytes': sum(b['bytes'] for b in bindings), 'actualChildPNGCount': 2, 'independentVStillPending': True, 'activeWrites': False}))
