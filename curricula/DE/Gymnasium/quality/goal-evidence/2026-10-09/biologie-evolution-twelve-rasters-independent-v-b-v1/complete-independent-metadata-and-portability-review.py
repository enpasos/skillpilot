# SPDX-License-Identifier: Apache-2.0
"""Record completed own metadata judgments and scoped, exact portable inputs."""
import datetime
import hashlib
import importlib.util
import json
import struct
import subprocess
from pathlib import Path

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-twelve-rasters-independent-v-b-v1')
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09/biologie-evolution-systematics-behavior-twelve-raster-author-a-v1')
REPO = Path.cwd()
CANON = Path('curricula/DE/Gymnasium/canonical/DE_DEU_S_GYM_CANONICAL_BIOLOGIE.de.json')
ENTRY = AUTHOR / 'neutral-twelve-current-whole-goals-and-actual-PNGs.author-independent-visual-review.entry.json'


def stamp():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()


def binding(path):
    path = Path(path)
    if path.is_absolute():
        path = path.relative_to(REPO)
    data = path.read_bytes()
    return {'path': path.as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}


def write(name, value):
    path = BASE / name
    if path.exists():
        raise RuntimeError(f'Sealed output cannot be overwritten: {path}')
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    json.loads(path.read_text())
    return binding(path)


POST_NOTES = {
    3: 'Caption and reconstruction distinguish variation already present from changed selection proportions. The alt/reconstruction count is exact: initial three light/three dark, later five dark/two light. The cross rejects need-directed mutation only. Neither reference turns the drawn numbers into measured frequencies.',
    4: 'The actual v2 edit prompt requests only a larger, two-line conditional isolation/speciation label. The selected image and reconstruction preserve conditional Artbildung möglich and interrupted lower gene flow. Alt accurately describes the three factors, two upper populations and separated lower populations, without real allelic or instant-speciation claims.',
    5: 'Alt and reconstruction correctly identify four initial generic monkeys and equally ranked separated populations. Both dotted lower links go to the common possible-outcome label, not to a reunited ancestral node. No exact primate species, ladder or empirical proportions are claimed.',
    6: 'The caption and reconstruction explicitly distinguish learned transmission from DNA inheritance and the globe from historical migration routes. They match the shelter demonstration, shared speech pictograms, rain protection and two broad habitat arrows. No cultural hierarchy or guaranteed selection advantage is asserted.',
    7: 'Caption/alt/reconstruction match immediate water-channel work versus the two labelled generations and the separate qualified biodiversity-risk strip. They retain the conditional können and do not declare a performed selection trial, named real plant variants or inevitable loss from all interventions.',
    8: 'Metadata expressly treats birds as generic schematic examples without an art-specific behavioural claim. It correctly describes direct own-offspring and indirect relative-help contributions, a symbolic cost/benefit comparison and the rejected strength-only meaning; it does not promise every helping act improves total fitness.',
    9: 'The actual v2 edit, selected notebook, comparison chart, alt and reconstruction agree on green largest, yellow intermediate, blue smallest, with vertical order green/blue/yellow. Metadata honestly disclaims measured field data and treating food proximity alone as proof of cooperation. The flat notebook is deliberately unheld and viewer-facing.',
    10: 'Alt and reconstruction accurately place the sender left, reaction bird centre, predator right and directed signal toward the receiver. The actor moves away from the predator. Behaviour panels and observation strip match the picture, while metadata disclaims measured causality, species-specific alarm-code proof or actual research results.',
    11: 'Caption/alt/reconstruction preserve dual inner/environment factors, grooming, a dotted questioned comparison and human culture/rules. They explicitly reject biologistic determinism and identify physiological/molecular icons as qualitative rather than exact structures. No moral norm is inferred from natural observation.',
    13: 'Caption/alt/reconstruction reproduce the actual Gorilla outside the Pan/Homo branch and common ancestors at internal nodes. They correctly state that this is a partial tree, not descent from living apes. Anatomy/DNA symbols are not an exact bone atlas, genetic similarity percentage or implication that other apes lack these traits.',
    14: 'Caption and reconstruction accurately frame uncertain fossil inferences and cultural knowledge transfer as a combined orienting overview; no actual fossil species, absolute chronology or prehistoric bound-book use is claimed. The people discuss a held stone, not a drawn handwritten entry. The overview does not resolve atomarity or approve a proposed child; later child images require separate review.',
    17: 'Alt/reconstruction accurately preserve Hox-regulation, place/time controls, different highlighted schematic patterns and conditional body-form variation. They disclaim real species, precise Hox/segment maps, literal gene locations, fixed allele-colour markers and actual expression/evolution experiments. Conditional variation is not automatic speciation or arbitrary new organs.',
}

author = json.loads(ENTRY.read_text())
pixel_verdict_path = BASE / 'twelve-actual-rasters.independent-b.pixel-FIRST.portable-v2.verdict.json'
pixel_first_path = BASE / 'twelve-actual-rasters.independent-b.pixel-FIRST.portable-v2.freeze.json'
pixel = json.loads(pixel_verdict_path.read_text())
pixel_first = json.loads(pixel_first_path.read_text())
assert binding(CANON)['sha256'] == pixel_first['canonicalCurrentAtFIRST']['sha256']
current = {g['id']: g for g in json.loads(CANON.read_text())['goals']}
verified = {}
raw_copy_checks = []
metadata_checks = []
final_images = []


def verify(record):
    path = Path(record['path'])
    assert not path.is_absolute(), record
    assert path.is_file(), record
    assert not any(p.is_symlink() for p in [path, *path.parents]), record
    actual = binding(path)
    assert actual['sha256'] == record['sha256'].removeprefix('sha256:'), record
    assert actual['bytes'] == record['bytes'], record
    verified[actual['path']] = actual
    return actual


verify(binding(ENTRY))
verify(binding(CANON))
verify(binding(BASE / 'twelve-whole-goals-and-original-display-bindings.pixel-only.input.json'))
verify(binding(pixel_verdict_path))
verify(binding(pixel_first_path))
for r in author['images']:
    assert r['wholeGoal'] == current[r['goalId']]
    assert next(x for x in pixel['judgments'] if x['goalId'] == r['goalId'])['pixelDecision'] == 'KEEP'
    asset = verify(r['asset'])
    raw = Path(asset['path']).read_bytes()
    assert raw[:8] == b'\x89PNG\r\n\x1a\n'
    size = struct.unpack('>II', raw[16:24])
    assert size[0] == 1672 and size[1] in (940, 941), size
    displays = []
    for display in r['actualNativeAndPhoneDesktopRasterViews']['screenshots']:
        db = verify(display['binding'])
        dw, dh = struct.unpack('>II', Path(db['path']).read_bytes()[16:24])
        assert dw == display['width'] and dw in (360, 680)
        assert display['renderedWidth'] == dw and display['documentWidth'] == dw
        assert display['naturalWidth'] == size[0] and display['naturalHeight'] == size[1]
        displays.append({'width': dw, 'actualDisplay': db, 'actualPixelSize': [dw, dh]})
    for prompt in r['originalPrompts']:
        verify(prompt)
        text = Path(prompt['path']).read_text()
        assert r['goalId'] not in text and 'SkillPilot' not in text
    recon = verify(r['reconstructionPrompt'])
    assert r['reconstructionPromptPath'] == recon['path']
    assert r['reconstructionPrompt']['derivedFromActualSeenImage'] is True
    assert r['reconstructionPrompt']['generationExecuted'] is False
    prov_binding = verify(r['provenance'])
    prov = json.loads(Path(prov_binding['path']).read_text())
    assert prov['selectedPortableBytes'] == r['asset']
    assert prov['goalId'] == r['goalId']
    assert prov['provider'] == r['provider'] == 'Built-in ChatGPT/Codex image_gen'
    assert prov['model'] is None and r['model'] is None
    assert prov['actualTool'] == 'image_gen__imagegen'
    assert prov['programmaticSelectedRasterEdits'] == 0
    if prov['actualSelectedEditReference']:
        verify(prov['actualSelectedEditReference'])
    for receipt_binding in prov['actualGenerationReceipts']:
        receipt_binding = verify(receipt_binding)
        receipt = json.loads(Path(receipt_binding['path']).read_text())
        portable = verify(receipt['portableOutput'])
        verify(receipt['actualOriginalPrompt'])
        historical_raw = Path(receipt['historicalRawOutputPath'])
        assert historical_raw.is_file()
        assert historical_raw.read_bytes() == Path(portable['path']).read_bytes()
        assert receipt['provider'] == prov['provider'] and receipt['model'] is None
        assert receipt['actualTool'] == prov['actualTool']
        raw_copy_checks.append({'ordinal': r['ordinal'], 'actualReceipt': receipt_binding,
                                'portableOutput': portable, 'historicalRawPathIsDiagnosticOnly': True,
                                'actualRawAndPortableBytesEqual': True,
                                'historicalRawRetainedAndNotRequiredAfterCheckout': True})
    link = r['resourceLinkCandidate']
    assert link['skillpilotId'] == r['goalId']
    assert link['url'] == f"/assets/goal-visualizations/biologie/{r['goalId']}/{r['goalId']}.png"
    assert link['type'] == 'goal-visualization' and link['resourceType'] == 'image'
    assert link['role'] == 'primary' and link['lang'] == 'de' and link['reviewStatus'] == 'pilot'
    assert link['license'] == 'CC-BY-4.0' and link['provider'] == r['provider']
    assert link['description'] == r['descriptionDe'] and link['altText'] == r['altTextDe']
    meta = {'ordinal': r['ordinal'], 'goalId': r['goalId'], 'wholeGoal': r['wholeGoal'],
            'selectedActualPNG': asset, 'actualSeparateDisplays': displays,
            'pixelDecision': 'KEEP', 'metadataDecision': 'KEEP', 'combinedVDecision': 'KEEP',
            'aiApprovedForThisInactiveCandidateAsset': True,
            'aiApprovedAssetSha256': asset['sha256'],
            'ownMetadataObservations': POST_NOTES[r['ordinal']],
            'findingIds': [], 'actualOriginalPrompts': r['originalPrompts'],
            'actualReconstruction': recon, 'actualProvenance': prov_binding,
            'captionDe': r['descriptionDe'], 'altTextDe': r['altTextDe'],
            'resourceLinkCandidate': link,
            'formatDecision': 'KEEP actual native PNG 1672x940/941 near 16:9; essential objects and short labels remain recognisable at actual 360/680. Small supplementary descriptions do not supply mandatory technical information.',
            'scope': 'Overview of combined current scope only; no child approval or atomarity resolution.' if r['ordinal'] == 14 else 'Orientation for this whole current goal, not curriculum/learning evidence.',
            'currentNativePSourceAndProgramApproval': False,
            'humanApproval': False, 'humanTrial': False}
    metadata_checks.append(meta)
    final_images.append({k: meta[k] for k in ['ordinal', 'goalId', 'wholeGoal', 'selectedActualPNG', 'actualSeparateDisplays', 'combinedVDecision', 'aiApprovedAssetSha256', 'resourceLinkCandidate', 'scope']})

assert len(verified) == len(set(verified))
ignored = subprocess.run(['git', 'check-ignore', '--stdin'], input='\n'.join(verified) + '\n',
                         text=True, capture_output=True, check=False)
assert ignored.returncode in (0, 1)
ignored_paths = ignored.stdout.splitlines()
assert not ignored_paths, ignored_paths
technical = write('twelve-selected-rasters.actual-metadata-binding-and-portability-check.json', {
    'schemaVersion': 'scoped-visual-input-binding-check-v1', 'createdAt': stamp(),
    'readScope': 'Only own review, neutral author input, selected assets/displays, actual prompts, reconstruction and generation provenance; no peer review or author QC file.',
    'uniqueExactPortableFileBindings': list(verified.values()),
    'uniqueBindingCount': len(verified), 'symlinkCount': 0, 'missingCount': 0,
    'operativeAbsolutePathCount': 0, 'ignoredOperativePathCount': 0,
    'actualRawCopyChecks': raw_copy_checks,
    'rawCopyExactCount': len(raw_copy_checks),
    'originalPixelFIRSTJudgmentsUnchanged': json.loads((BASE/'twelve-actual-rasters.independent-b.pixel-FIRST.verdict.json').read_text())['judgments'] == pixel['judgments'],
    'technicalPortabilitySuccessorNotAnotherScientificReview': True,
    'historicalFIRSTAbsoluteBindingsRetainedOnlyAsImmutablePastRecord': True,
    'currentWholeGoalsExactAtEnd': binding(CANON), 'errors': [],
})
verdict = write('twelve-actual-rasters.independent-b.metadata-and-V.verdict.json', {
    'schemaVersion': 'independent-goal-visualization-metadata-review-v1',
    'createdAt': stamp(), 'reviewer': '/root/evo12_visual_independent_b', 'license': 'CC-BY-4.0',
    'pixelFIRSTFreeze': binding(pixel_first_path), 'pixelFIRSTVerdict': binding(pixel_verdict_path),
    'metadataReadOnlyAfterActualPixelFIRST': True,
    'peerReviewsRead': False, 'authorQCRead': False, 'authorOfTheseImages': False,
    'judgments': metadata_checks,
    'technicalActualCheck': technical,
    'summary': {'pixelKEEP': 12, 'metadataKEEP': 12, 'combinedVKEEP': 12,
                'pixelHOLD': 0, 'metadataHOLD': 0, 'findings': [], 'actualViewImageCount': 36},
    'preservedOtherOpenGates': ['whole-source/course duties', 'current native pages and context',
                               'operative raster-bound P', 'whole-goal D/atomarity where open',
                               'proposed fossil/culture semantic split and both child images'],
    'strictGain': 0, 'currentRegistryWrites': [], 'humanApproval': False, 'humanTrial': False,
})
meta_first = write('twelve-actual-rasters.independent-b.metadata-FIRST.freeze.json', {
    'schemaVersion': 'independent-visual-metadata-FIRST-freeze-v1', 'createdAt': stamp(),
    'reviewer': '/root/evo12_visual_independent_b', 'ownMetadataAndVVerdict': verdict,
    'priorPixelFIRST': binding(pixel_first_path), 'actualTechnicalChecks': technical,
    'beforeAnyPeerVerdict': True, 'scientificJudgmentsActualAndIndependent': True,
})
neutral = write('neutral-completed-twelve-current-rasters-independent-b.review.entry.json', {
    'schemaVersion': 'independent-visual-review-neutral-entry-v1', 'createdAt': stamp(),
    'role': 'completed own independent machine V candidate review, not current integration',
    'reviewer': '/root/evo12_visual_independent_b',
    'actualPixelFIRST': binding(pixel_first_path), 'actualPixelVerdict': binding(pixel_verdict_path),
    'actualMetadataFIRST': meta_first, 'actualMetadataAndVVerdict': verdict,
    'actualScopedTechnicalChecks': technical,
    'sourceNeutralAuthorEntry': binding(ENTRY), 'currentWholeGoalBaseline': binding(CANON),
    'goalIds': [r['goalId'] for r in author['images']], 'ordinals': [r['ordinal'] for r in author['images']],
    'images': final_images,
    'sameActualAssetAndWholeGoalAsPixelFIRST': True,
    'machineVReviewDecision': 'KEEP', 'candidateAssetKEEPCount': 12, 'openVisualFindingIds': [],
    'sourcePProgramNativeAndSemanticSplitApproved': False,
    'candidateOnly': True, 'strictGain': 0, 'activeWrites': [],
    'humanApproval': False, 'humanTrial': False,
})

# Apply the existing schema parser/discovery to this review's new JSON only.
spec = importlib.util.spec_from_file_location('normal_schema_validation', REPO/'scripts/validate_schemas.py')
schema_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(schema_module)
schema = json.loads((REPO/'docs/landscape-runtime.schema.json').read_text())
scoped_jsons = sorted(BASE.glob('*.json'))
assert all(schema_module.validate_file(str(p), schema) for p in scoped_jsons)
parse_receipt = write('own-new-JSON.normal-schema-parser-scoped.actual.json', {
    'schemaVersion': 'scoped-normal-schema-validation-receipt-v1', 'createdAt': stamp(),
    'ordinaryFunction': 'scripts/validate_schemas.py:validate_file',
    'ordinaryRuntimeSchema': binding(Path('docs/landscape-runtime.schema.json')),
    'jsonFilesChecked': [binding(p) for p in scoped_jsons],
    'allJSONCompletelyParsed': True, 'valid': True, 'errors': [],
    'notAFullRepositorySchemaRun': True,
})
seal = write('twelve-current-raster-independent-b.final.freeze.json', {
    'schemaVersion': 'completed-independent-visual-review-final-freeze-v1', 'createdAt': stamp(),
    'reviewer': '/root/evo12_visual_independent_b',
    'payloads': [neutral, verdict, meta_first, technical, parse_receipt,
                 binding(pixel_first_path), binding(pixel_verdict_path)],
    'candidateOnly': True, 'pixelKEEP': 12, 'metadataKEEP': 12,
    'openVisualFindingIds': [], 'noHistoricalAuthorOrPeerBytesChanged': True,
    'sourceNativePRuntimeAndSemanticSplitApproval': False,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0,
})
print(json.dumps({'entry': neutral, 'finalSeal': seal, 'summary': {'KEEP': 12, 'HOLD': 0,
                         'uniqueExactPortableBindings': len(verified), 'actualRawCopies': len(raw_copy_checks),
                         'actualViewImageCount': 36, 'strictGain': 0}}, ensure_ascii=False))
