"""Post-pixel-FIRST own inactive metadata/provenance evidence only."""
import datetime
import hashlib
import json
from pathlib import Path
from PIL import Image

ROOT = Path('/home/enpasos/projects/skillpilot')
BASE = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-09'
AUTHOR = BASE / 'chemie-b008-MV-kp-kc-readable-raster-author-v1'
OWN = BASE / 'chemie-b008-MV-kp-kc-readable-raster-independent-v-b-v1'
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()


def bind(path):
    raw = path.read_bytes()
    return {'path': str(path.relative_to(ROOT)), 'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}


def write(name, value):
    path = OWN / name
    with path.open('x') as f:
        f.write(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    return bind(path)


def read(path):
    return json.loads(path.read_text())


def bindings(value):
    found = []
    if isinstance(value, dict):
        if isinstance(value.get('path'), str) and isinstance(value.get('sha256'), str) and 'bytes' in value:
            found.append(value)
        for child in value.values():
            found.extend(bindings(child))
    elif isinstance(value, list):
        for child in value:
            found.extend(bindings(child))
    return found


entry_path = AUTHOR / 'neutral-one-KpKc-readable-actual-PNG.independent-visual-review.entry.json'
entry = read(entry_path)
row = entry['images'][0]
author_first_path = ROOT / entry['currentAuthorFirstSealPath']
author_first = read(author_first_path)
pixel_first_path = OWN / 'one-current-KpKc-raster.independent-b.pixel-first.freeze.json'
pixel_verdict_path = OWN / 'one-current-KpKc-raster.independent-b.pixel-first.verdict.json'
pixel_verdict_before = bind(pixel_verdict_path)
pixel_first_before = bind(pixel_first_path)
unique = {b['path']: b for b in bindings(entry) + bindings(author_first)}
verified, errors = [], []
for path, expected in unique.items():
    actual = bind(ROOT / path)
    same = actual['sha256'] == expected['sha256'].removeprefix('sha256:') and actual['bytes'] == expected['bytes']
    verified.append({'actualBinding': actual, 'matchesDeclaredInput': same})
    if not same:
        errors.append({'path': path, 'expected': expected, 'actual': actual})

raw_results = []
for provenance_name, raw_key, copy_name in [
    ('generation-v1.actual-provenance-and-author-finding.json', 'originalOutputPath', 'candidate-v1.png'),
    ('selected-v2.actual-generation-provenance.json', 'originalRawGeneratedOutputPath', 'candidate-v2.png'),
]:
    p = read(AUTHOR / provenance_name)
    raw = Path(p[raw_key])
    copied = AUTHOR / copy_name
    same = raw.read_bytes() == copied.read_bytes()
    raw_bytes = raw.read_bytes()
    raw_results.append({'provenance': bind(AUTHOR / provenance_name),
        'actualGeneratedRawPath': str(raw), 'rawSha256': hashlib.sha256(raw_bytes).hexdigest(),
        'rawBytes': len(raw_bytes), 'portableCopy': bind(copied), 'byteExact': same})
    if not same:
        errors.append({'rawCopyMismatch': copy_name})

image = Image.open(ROOT / row['path'])
assert image.format == 'PNG' and image.size == (1672, 941)
assert entry['images'] == entry['entries']
assert row['descriptionDe'] == row['resourceLinkCandidate']['description']
assert row['altTextDe'] == row['resourceLinkCandidate']['altText']
assert row['resourceLinkCandidate']['url'].endswith('/' + row['goalId'] + '.png')
assert row['reconstructionPrompt']['generationExecuted'] is False
assert row['reconstructionPrompt']['historicalOriginalPrompt'] is False
assert row['provider'] == entry['actualGenerator'] == 'Built-in ChatGPT/Codex image_gen'
assert row['model'] is None and entry['actualModel'] is None

format_dimensions = []
for name in ['candidate-v2.png', 'actual-selected-v2-360.png', 'actual-selected-v2-680.png']:
    p = AUTHOR / name
    im = Image.open(p)
    format_dimensions.append({'actualBinding': bind(p), 'format': im.format, 'width': im.width, 'height': im.height})
future_public = ROOT / 'app/public' / row['resourceLinkCandidate']['url'].lstrip('/')
technical = write('actual-one-PNG-prompt-provider-format-and-historical-JPEG-bindings.independent-b.receipt.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'role': 'actual_post_pixel_first_binding_and_format_probe',
    'pixelFirst': pixel_first_before, 'authorNeutralEntry': bind(entry_path), 'authorFirst': bind(author_first_path),
    'actualDeclaredFilesVerified': verified, 'errors': errors, 'actualRawGenerationCopies': raw_results,
    'actualPNGFormatsAndDimensions': format_dimensions,
    'actualHistoricalJPEGUnchangedAgainstDeclaredDigest': bind(ROOT / row['historicalOriginalJPEG']['path']),
    'actualCurrentWholeGoalProfileCasesSourceAndMappingBindingOnly': {
        k: bind(ROOT / entry[k]['path']) for k in ['actualCurrentWholeGoalProfileAndTwoDEENCases',
            'actualCurrentCanonical504', 'actualCurrentSourceExtraction', 'actualCurrentMapping']},
    'sourceAndPContentApprovalInferredFromHashes': False,
    'captionAndAltEqualExactCandidateResourceFields': True,
    'actualFuturePublicPNGPath': str(future_public.relative_to(ROOT)),
    'futurePublicPNGActuallyExistsNow': future_public.exists(),
    'futurePublicPNGCurrentImportOrReviewClaimed': False,
    'authorBrowserRenderCodeReadAfterPixelFirst': bind(AUTHOR / 'inspect-selected-v2-original360680.technical.mts'),
    'actualBrowserDerivativesAlreadySeenBeforePixelFirst': True,
    'independentBrowserRerunOrCapsuleBuildClaimed': False,
    'humanApproval': False, 'strictGain': 0,
})

license_finding = {
    'id': 'KPKC-B-META-001', 'severity': 'HOLD_new_resource_link_license_metadata',
    'actualField': '/images/0/resourceLinkCandidate/license', 'actualValue': row['resourceLinkCandidate']['license'],
    'reasonDe': 'Der neue Kandidatenlink enthält AI-generated, SkillPilot-curated im license-Feld. LICENSING.md ordnet eigene didaktische Bilder CC-BY-4.0 zu und erklärt diese Bezeichnungen ausdrücklich zu Herkunftsangaben, nicht Lizenzen. Die gespeicherten Original-/Editprompts und rohe Toolausgaben tragen den vorliegenden eigenen neuen generischen Rasterkandidaten; ein neuer gültiger Lizenzbezeichner fehlt im Ressourcenlink.',
    'preciseRemedyDe': 'Neuen inaktiven Metadaten-Nachfolger mit license=CC-BY-4.0 für die tatsächlich eigenen Rechte an diesem neuen didaktischen PNG erstellen; provider/Herkunft separat erhalten. Original-JPEG, alte Prompts, Fehlversuch und alle bisherigen FIRSTs unverändert halten. PNG/Caption/Alt können wertgleich bleiben; keine erneute Pixelsicht allein wegen dieses Lizenzfeldes erforderlich.',
    'actualProjectInstructionBindings': [bind(ROOT / 'LICENSING.md'), bind(ROOT / 'AGENTS.md')],
    'thirdPartyRightsClearanceOrHumanApprovalClaimed': False,
    'pixelVerdictChangedByMetadataFinding': False,
}
post = write('one-current-KpKc-raster.independent-b.post-provenance.verdict.json', {
    'schemaVersion': 1, 'reviewedAt': NOW, 'reviewer': '/root/bio_science14_independent_b',
    'role': 'independent_B_post_pixel_FIRST_complete_actual_metadata_and_provenance_review',
    'actualPixelFirst': pixel_first_before, 'actualPixelFirstVerdict': pixel_verdict_before,
    'pixelDecisionReusedExactly': 'KEEP_selected_actual_candidate_for_independent_B_visual_scope_only',
    'actualTechnicalReceipt': technical,
    'captionAltDecision': 'KEEP_exact_current_candidate_caption_and_alt',
    'captionAltReasonDe': 'Die vollständigen aktuellen Texte nennen ideales Gas, gleiche Temperatur, unnormierte Druck-/Konzentrationsprodukte und dimensionslose Gas-Koeffizientendifferenz. Stoffknoten und generische Behälterpunkte sind ausdrücklich schematisch; sie werden weder als reale Molekülstrukturen noch gemessene Gleichgewichtsprobe ausgegeben. Das passt zu den tatsächlichen Pixeln und ihren4blauen/3gelben Behälterpunkten und1A2/2A-Stoffknoten.',
    'actualOriginalAndEditPromptDecision': 'KEEP_complete_actual_generation_and_targeted_edit_provenance',
    'actualOriginalAndEditPromptReasonDe': 'Originalauftrag v1 verlangt groß lesbare Gasgleichung und unnormierte Schulkonvention. Der tatsächliche ungewählte v1-Raster wurde erst nach meinem Pixel-FIRST angesehen: vor seinen zwei A-Knoten stand tatsächlich ein zusätzlicher2-Faktor. Der vollständige ausgeführte Editauftrag v2 entfernt diesen einen Faktor und erhält das2A in der getrennten Reaktionsgleichung. Das ausgewählte tatsächlich erzeugte v2 enthält genau die zwei getrennten A-Knoten ohne Zusatzfaktor. Keine neue hypothetische Durchführung oder nachträgliche Originalpromptbehauptung.',
    'actualPromptBindings': row['originalPrompts'],
    'reconstructionPromptDecision': 'KEEP_truthfully_derived_not_executed_reconstruction',
    'reconstructionReasonDe': 'Der ganze deutsche Rekonstruktionsprompt beschreibt die wirklich gesehenen7Behälterpunkte, den Messgeräte-Icon, den mintfarbenen p_i-Bezug, den gelben Kp/Kc-Bereich, die genau1A2/2A-Knoten und alle sichtbaren Konventions-/Temperaturtexte. Er nennt tatsächliche1672×941, ist ausdrücklich nachträglich abgeleitet und nicht als ausgeführter oder historischer Generatorauftrag ausgegeben.',
    'actualReconstructionBinding': row['reconstructionPrompt'],
    'providerAndFormatDecision': 'KEEP_png_and_saved_actual_image_gen_provenance_model_unexposed',
    'providerAndFormatReasonDe': 'Beide tatsächlichen rohen Erzeugungsdateien sind bytegenau zu den portablen v1-/v2-PNGs. Gespeicherter Provider ist Built-in ChatGPT/Codex image_gen und das konkrete Modell bleibt truthful null. Tatsächliches PNG1672×941 und360×203/680×383 passen zum neuen .png-URL-Kandidaten. Der alte historische JPEG-Digest ist unverändert. Browserderivate sind im gelesenen Code direkte Rasterdarstellungen ohne zusätzliche Beschriftung; ich behaupte keinen eigenen erneuten Browserlauf.',
    'actualResourceLinkCandidate': row['resourceLinkCandidate'],
    'resourceLinkMetadataDecision': 'HOLD_license_field_successor_required',
    'actualMetadataFindings': [license_finding],
    'openScientificImageBoundaryCases': 'The selected unnormalized-product formula is correct only for ideal gas partial pressures/concentrations at the same T with consistent units. It does not supply standard-state thermodynamic K°, nonideal fugacities, conversion tasks or full validity-limit responses. Δν gas coefficients are shown by the separate symbolic example, not by the arbitrary vessel inventory.',
    'secondIndependentVisualReviewPending': True,
    'actualCurrentNativeAndRasterBoundPReviewPending': True,
    'sourceAndWholeCourseApproval': False, 'wholeVOrM7Approval': False,
    'authority': 'ai_candidate', 'status': 'needs_human_review', 'E1': True, 'G1': True,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0, 'newScientificClosures': 0,
    'restoredBindings': 0, 'activeWrites': False, 'historicalArtifactsRewritten': False,
    'freshPeerVisualResultsRead': False,
})

assert bind(pixel_verdict_path) == pixel_verdict_before
assert bind(pixel_first_path) == pixel_first_before
handoff = write('completed-one-current-KpKc-raster-independent-b.post-provenance.entry.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'role': 'neutral_completed_independent_one_actual_KpKc_V_B_entry',
    'actualPixelInputFirst': bind(OWN / 'one-current-KpKc-raster.independent-b.pixel-input.first.freeze.json'),
    'actualPixelFirst': pixel_first_before, 'actualPixelFirstVerdict': pixel_verdict_before,
    'actualPostProvenanceVerdict': post, 'actualBindingAndFormatReceipt': technical,
    'actualAuthorNeutralInput': bind(entry_path), 'actualAuthorFirst': bind(author_first_path),
    'actualSelectedRaster': bind(ROOT / row['path']), 'actualResourceLinkCandidateMetadataSuccessorPending': True,
    'secondIndependentVisualReviewPending': True, 'actualCurrentNativeAndRasterBoundPReviewPending': True,
    'humanApproval': False, 'humanTrial': False, 'strictGain': 0,
    'wholeSourceNativePCurrentVOrM7ApprovalClaimed': False,
})
own_outputs = [bind(p) for p in sorted(OWN.iterdir()) if p.is_file()]
final = write('completed-one-current-KpKc-raster-independent-b.final.freeze.json', {
    'schemaVersion': 1, 'createdAt': NOW, 'role': 'immutable_actual_independent_B_pixel_then_provenance_final_seal',
    'actualOwnOutputs': own_outputs, 'actualAuthorInputAndDeclaredFiles': [bind(entry_path), bind(author_first_path)] + [b['actualBinding'] for b in verified],
    'actualPixelFirstPreservedByteExact': True, 'secondIndependentVisualReviewPending': True,
    'actualCurrentNativeAndRasterBoundPReviewPending': True, 'humanApproval': False, 'strictGain': 0,
})
print(json.dumps({'entry': handoff, 'final': final, 'bindingErrors': len(errors)}, ensure_ascii=False))
