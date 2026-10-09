#!/usr/bin/env python3
"""Bind completed independent observations; perform ordinary file checks only."""
import datetime
import hashlib
import json
import subprocess
import sys
from pathlib import Path

sys.dont_write_bytecode = True
ROOT = Path(__file__).resolve().parents[7]
sys.path.insert(0, str(ROOT))
from scripts.validate_schemas import curriculum_symlink_errors
from PIL import Image

BASE = Path('curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09')
AUTHOR = BASE / 'biologie-evolution-systematics-behavior-six-raster-author-root-v1'
OWN = BASE / 'biologie-evolution-six-root-rasters-independent-v-b-v1'

def now():
    return datetime.datetime.now(datetime.timezone.utc).isoformat()

def read(path):
    return json.loads((ROOT / path).read_bytes())

def bind(path):
    path = Path(path)
    data = (ROOT / path).read_bytes()
    return {'path': str(path), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def verify(binding):
    actual = bind(binding['path'])
    assert actual['sha256'] == binding['sha256'].removeprefix('sha256:'), binding['path']
    assert actual['bytes'] == binding['bytes'], binding['path']
    return actual

def write(name, value):
    path = OWN / name
    assert not (ROOT / path).exists(), path
    (ROOT / path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    assert read(path) == value
    return path

neutral_path = AUTHOR / 'six-selected-actual-PNGs.pixel-FIRST-neutral-input.json'
metadata_path = AUTHOR / 'six-selected-PNGs.actual-metadata-and-reconstruction.candidates.json'
entry_path = AUTHOR / 'neutral-completed-six-selected-actual-PNGs.independent-V-review.entry.json'
neutral, meta = read(neutral_path), read(metadata_path)
pixel_path = OWN / 'six-actual-root-rasters.independent-b.pixel-FIRST.verdict.json'
pixel_seal_path = OWN / 'six-actual-root-rasters.independent-b.pixel-FIRST.freeze.json'
input_seal_path = OWN / 'six-actual-root-rasters.independent-b.pixel-input.first.freeze.json'
first = read(pixel_path)
for b in read(pixel_seal_path)['outputs']:
    verify(b)
for b in read(input_seal_path)['inputs']:
    verify(b)
assert first['postMetadataReadBeforeFirst'] is False
assert first['actualIndividualImageViewCount'] == 18
assert [r['ordinal'] for r in neutral['images']] == [1, 2, 12, 15, 16, 18]
canonical_binding = verify(neutral['currentCanonical'])
canonical = read(canonical_binding['path'])
goals = {g['id']: g for g in canonical['goals']}
paths = {entry_path, neutral_path, metadata_path, Path(canonical_binding['path']),
         Path('AGENTS.md'), Path('LICENSING.md'),
         Path('docs/concept/skill-graph/atomic-goal-visualizations.md'),
         Path('scripts/validate_schemas.py'), pixel_path, pixel_seal_path, input_seal_path,
         OWN / Path(__file__).name}
rows = []
origin_receipts = []
historical_references = []
for n, m, p in zip(neutral['images'], meta['images'], first['entries'], strict=True):
    assert n['goalId'] == m['goalId'] == p['goalId']
    assert n['wholeGoal'] == m['wholeGoal'] == p['wholeGoal'] == goals[n['goalId']]
    assert n['asset'] == m['asset'] == p['asset']
    assert n['actualNativeAndPhoneDesktopRasterViews'] == m['actualNativeAndPhoneDesktopRasterViews'] == p['actualViews']
    asset = verify(m['asset'])
    paths.add(Path(asset['path']))
    with Image.open(ROOT / asset['path']) as im:
        assert im.format == 'PNG'
        assert list(im.size) == [m['dimensions']['width'], m['dimensions']['height']]
        im.verify()
    screenshots = []
    for b in m['actualNativeAndPhoneDesktopRasterViews']['screenshots']:
        verified = verify(b)
        paths.add(Path(b['path']))
        with Image.open(ROOT / b['path']) as im:
            assert im.format == 'PNG' and im.width == b['width']
            im.verify()
        screenshots.append(verified)
    prompt_bindings = []
    for b in m['actualProviderPrompts']:
        prompt_bindings.append(verify(b))
        paths.add(Path(b['path']))
        text = (ROOT / b['path']).read_text()
        assert n['goalId'] not in text
    recon = verify(m['reconstructionPrompt'])
    paths.add(Path(recon['path']))
    assert m['reconstructionPrompt']['generationExecuted'] is False
    assert n['goalId'] not in (ROOT / recon['path']).read_text()
    provenance_binding = verify(m['actualToolProvenance'])
    paths.add(Path(provenance_binding['path']))
    provenance = read(provenance_binding['path'])
    assert m['model'] is None and provenance['model'] is None
    assert m['provider'] == provenance['provider'] == 'built-in ChatGPT/Codex image_gen'
    raw_path = provenance.get('actualGeneratedOutputPath', provenance.get('actualRawOutputPath'))
    raw = Path(raw_path).read_bytes()
    assert hashlib.sha256(raw).hexdigest() == asset['sha256']
    origin_receipts.append({'ordinal': n['ordinal'], 'diagnosticRawProviderOutputPath': raw_path,
                            'selectedRepositoryCopy': asset, 'actualRawBytesEqualSelected': True,
                            'rawPathIsHistoricalOriginOnlyNotAnOperativeInput': True})
    if n['ordinal'] in [2, 18]:
        initial_provenance_path = Path(asset['path']).parent / 'generation-v1.actual-tool-provenance.json'
        paths.add(initial_provenance_path)
        initial_provenance = read(initial_provenance_path)
        reference = provenance['reference']
        if isinstance(reference, str):
            reference = {**bind(reference), 'sha256': provenance['referenceSHA']}
        historical = verify(reference)
        paths.add(Path(historical['path']))
        original_raw = Path(initial_provenance['actualGeneratedOutputPath']).read_bytes()
        assert hashlib.sha256(original_raw).hexdigest() == historical['sha256']
        historical_references.append({'ordinal': n['ordinal'], 'originalV1Reference': historical,
                                      'originalRawProviderCopyStillExact': True,
                                      'selectedV2IsDistinct': historical['sha256'] != asset['sha256'],
                                      'historicalV1HOLDNotOverwrittenOrReReviewed': True})
    link = m['resourceLinkCandidate']
    assert link['skillpilotId'] == m['goalId']
    assert link['url'] == f"/assets/goal-visualizations/biologie/{m['goalId']}/{m['goalId']}.png"
    assert link['type'] == 'goal-visualization' and link['resourceType'] == 'image'
    assert link['role'] == 'primary' and link['lang'] == 'de' and link['reviewStatus'] == 'pilot'
    assert link['description'] == m['descriptionDe'] and link['altText'] == m['altTextDe']
    assert link['provider'] == m['provider'] and link['license'] == 'CC-BY-4.0'
    rows.append({'ordinal': n['ordinal'], 'goalId': n['goalId'], 'asset': asset,
                 'actual360680Bindings': screenshots, 'wholeGoalEqualsCurrentCanonicalValue': True,
                 'wholeGoalDeEnReadBeforePixelFirst': True, 'resourceLinkCandidate': link,
                 'actualProviderPrompts': prompt_bindings, 'actualToolProvenance': provenance_binding,
                 'reconstructionPrompt': recon, 'model': None,
                 'modelLimit': 'The actual tool receipts expose no model version; none is inferred.',
                 'captionAltDecision': 'KEEP', 'promptReconstructionDecision': 'KEEP',
                 'provenanceAndLicenseDecision': 'KEEP',
                 'pixelFirstDecisionUnchanged': p['pixelDecision'], 'findings': [],
                 'status': 'needs_human_review', 'authority': 'ai_candidate',
                 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
                 'sourceApproval': False, 'nativeApproval': False, 'positiveEvidenceApproval': False,
                 'humanApproval': False, 'humanTrial': False})

render_paths = [AUTHOR / 'five-original-v1-browser360680.actual-render.receipt.json']
for ordinal in [2, 18]:
    r = next(r for r in meta['images'] if r['ordinal'] == ordinal)
    render_paths.append(Path(r['asset']['path']).parent / 'actual-v2-browser360680.render.receipt.json')
for path in render_paths:
    read(path)
    paths.add(path)

symlink_errors = curriculum_symlink_errors(str(ROOT))
assert not symlink_errors
portable = []
all_parse_results = []
for path in sorted(paths, key=str):
    absolute = ROOT / path
    assert absolute.is_file() and not absolute.is_symlink()
    assert absolute.resolve().is_relative_to(ROOT)
    result = subprocess.run(['git', 'check-ignore', '-v', '--', str(path)], cwd=ROOT,
                            capture_output=True, text=True, check=False)
    assert result.returncode in [0, 1]
    portable.append({**bind(path), 'fileIsSymlink': False, 'resolvedInsideRepository': True,
                     'gitIgnored': result.returncode == 0, 'actualGitIgnoreRule': result.stdout.strip()})
    if path.suffix == '.json':
        read(path)
        all_parse_results.append(str(path))

caption_observations = {
    1: 'Caption/alt explicitly call the guide schematic and avoid a claimed certain species name. This matches the observed trait-comparison motif.',
    2: 'Caption/alt reproduce the actual wing group and frog/bird/cat-bat topology, with no time metric or anatomy-versus-DNA overstatement.',
    12: 'Caption/alt identify the late Homo sapiens endpoint, explicitly schematic spacing and no measured dates; dinosaurs are historical context.',
    15: 'Caption/alt connect a distinct ash layer, fossil context and rock inspection. They do not identify a method, give an age, or equate ash and fossil ages.',
    16: 'Caption/alt state that migration can transmit inherited variants through reproduction. Same-species model colours are explicit; no exact allele or Mendel ratio is claimed.',
    18: 'Caption/alt describe a historical question, an inherited-variation check and a later population retaining variation. They explicitly reject interpreting the image as experiment evidence.'
}
for row in rows:
    row['actualCaptionAltObservation'] = caption_observations[row['ordinal']]
    row['actualPromptReconstructionObservation'] = 'All full original provider prompt(s), any selected edit prompt, complete reconstruction and actual provenance read only after own pixel-FIRST. The reconstruction is an unexecuted standalone description of the selected picture, not a second generation receipt. Prompt demands are not used as evidence that the drawing achieved them.'

receipt = write('six-actual-root-rasters.normal-bindings-and-portability.actual.receipt.json', {
    'schemaVersion': 1, 'checkedAt': now(), 'role': 'ordinary read-only technical checks after independent pixel-FIRST',
    'normalApi': 'scripts.validate_schemas.curriculum_symlink_errors', 'normalSymlinkErrors': symlink_errors,
    'normalApiActualExitCode': 0, 'noValidatorExceptionsOrAliases': True,
    'portableActualInputBindings': portable, 'ignoredBoundInputCount': sum(p['gitIgnored'] for p in portable),
    'allBoundJsonFullyParsed': all_parse_results, 'actualPngHeadersAnd18ViewDimensionsVerified': True,
    'currentWholeCanonicalBinding': canonical_binding, 'selectedSixWholeGoalValuesExact': True,
    'actualSelectedRawProviderCopies': origin_receipts, 'twoHistoricalV1ReferenceCopies': historical_references,
    'rawAbsoluteOriginPathsAreNotOperativeDependencies': True,
    'authorQcAndFreshPeerOutcomesRead': False, 'sourceNativePChecksNotRunOrClaimed': True,
    'humanApproval': False, 'strictGain': 0, 'activeWrites': []})
post = write('six-actual-root-rasters.independent-b.post-FIRST-metadata.verdict.json', {
    'schemaVersion': 1, 'reviewer': '/root/bio_science14_independent_b', 'reviewedAt': now(),
    'ownImmutablePixelFirst': bind(pixel_seal_path), 'actualMetadataInput': bind(metadata_path),
    'actualScope': 'Six selected rows and all their complete prompt/edit/reconstruction/caption/alt/provider/license inputs; no fresh peer outcome read.',
    'entries': rows, 'findings': [], 'humanApproval': False, 'humanTrial': False,
    'strictGain': 0, 'sourceApproval': False, 'nativeApproval': False, 'positiveEvidenceApproval': False,
    'pending': ['genuinely independent second V and conservative pairing', 'ordinary import/current native D/P bindings',
                'whole-source/course approvals and independent existing science remedies'], 'activeWrites': []})
entry = write('completed-six-actual-root-rasters.independent-b.review.entry.json', {
    'schemaVersion': 1, 'createdAt': now(), 'reviewer': '/root/bio_science14_independent_b',
    'role': 'completed bounded independent actual V candidate review; first pixel observations immutable',
    'authorNeutralEntry': bind(entry_path), 'ownInputFirst': bind(input_seal_path),
    'ownPixelFirst': bind(pixel_seal_path), 'ownWholePixelVerdict': bind(pixel_path),
    'postFirstMetadataVerdict': bind(post), 'actualTechnicalReceipt': bind(receipt),
    'currentSelectedGoalIds': [r['goalId'] for r in rows], 'currentSelectedOrdinals': [r['ordinal'] for r in rows],
    'actualOriginalViews': 6, 'actualPhone360Views': 6, 'actualDesktop680Views': 6,
    'selectedTwoV2HistoricalV1sRemainUnchanged': True, 'actualBoundedDecision': 'KEEP six selected actual raster candidates and metadata',
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'evidenceLevel': 'E1', 'maximumClaimScope': 'G1',
    'normalSymlinkErrors': [], 'ignoredBoundInputCount': sum(p['gitIgnored'] for p in portable),
    'allActualBoundJsonFullyParsed': True, 'unresolvedOwnBoundedVFindings': [],
    'freshPeerOutcomeRead': False, 'authorQcOutcomeUsedAsAuthority': False,
    'sourceApproval': False, 'nativeApproval': False, 'positiveEvidenceApproval': False,
    'wholeV18Approval': False, 'activeResourceImport': False, 'humanApproval': False, 'humanTrial': False,
    'newScientificM7Closures': 0, 'restoredM7Bindings': 0, 'strictGain': 0, 'activeWrites': [],
    'pending': ['second genuinely independent current V review and pairing', 'current native D/P and ordinary imported runtime bytes',
                'separate whole-source/course and earlier own Evo18 science/P/A findings'],
    'completedFinalSealPath': str(OWN / 'completed-six-actual-root-rasters.independent-b.final.freeze.json')})

outputs = sorted([p.relative_to(ROOT) for p in (ROOT / OWN).iterdir() if p.is_file()], key=str)
for path in outputs:
    if path.suffix == '.json':
        read(path)
seal = write('completed-six-actual-root-rasters.independent-b.final.freeze.json', {
    'schemaVersion': 1, 'sealedAt': now(), 'reviewer': '/root/bio_science14_independent_b',
    'role': 'immutable completed independent actual six V review final seal; earlier input/pixel FIRST unchanged',
    'outputs': [bind(p) for p in outputs], 'humanApproval': False, 'humanTrial': False, 'strictGain': 0})
for b in read(seal)['outputs']:
    verify(b)
for path in (ROOT / OWN).glob('*.json'):
    json.loads(path.read_bytes())
print(json.dumps({'entry': bind(entry), 'finalSeal': bind(seal), 'ownJsonFullyParsed': True,
                  'ordinarySymlinkErrors': [], 'ignoredBoundInputCount': sum(p['gitIgnored'] for p in portable),
                  'boundRepositoryFiles': len(portable)}, ensure_ascii=False))
