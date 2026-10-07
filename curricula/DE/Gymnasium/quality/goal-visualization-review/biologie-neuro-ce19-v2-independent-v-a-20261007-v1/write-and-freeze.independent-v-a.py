import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path('/home/enpasos/projects/skillpilot')
OUT = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro-ce19-axon-leader-targeted-correction-author-20261007-v2'

def load(p):
    return json.loads(p.read_text())

def binding(p):
    data = p.read_bytes()
    return {'path': p.relative_to(ROOT).as_posix(), 'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}

def write(name, value):
    (OUT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

a_path = AUTHOR / 'one-whole-goal-original-targeted-finding-native-prepared.author.raw.json'
b_path = AUTHOR / 'one-whole-goal-source-material-current-raster-native-routing.author.raw.json'
a, b = load(a_path), load(b_path)
r = b['records'][0]
image_path = ROOT / r['selectedUnchangedOriginalAsset']['path']
assert binding(image_path) == r['selectedUnchangedOriginalAsset']
assert binding(a_path) == b['nativePreparedWholeRaw']
for key in ['wholeUnchangedStage02Goal', 'completeUnchangedDEENReferenceCases', 'actualFrozenSourceWitnessEffectiveBindings']:
    assert a[key] == r[key]

declared_paths = [
    ROOT / 'AGENTS.md',
    ROOT / 'docs/concept/skill-graph/atomic-goal-visualizations.md',
    a_path,
    b_path,
    image_path,
    AUTHOR / 'author-displays/actual-360-680-display.receipt.json',
]
inputs = [binding(p) for p in declared_paths]
browser_receipt = load(OUT / 'actual-360-680-browser-displays.independent-v-a.receipt.json')
assert [x['imageBox']['width'] for x in browser_receipt['records']] == [360, 680]
assert all(x['loaded'] and x['css']['objectFit'] == 'contain' for x in browser_receipt['records'])

review = {
    'role': 'independent V-A visual review',
    'recordedAt': datetime.now(timezone.utc).isoformat(),
    'goalId': r['goalId'],
    'verdict': 'KEEP',
    'decisionScope': 'This selected candidate has no observed visual/fachlich blocker in this independent machine review. This does not install it or complete a combined gate.',
    'selectedCandidate': binding(image_path),
    'declaredInputs': inputs,
    'wholeGoalReviewedExactly': a['wholeUnchangedStage02Goal'],
    'bothFullDEENReferenceCasesReviewedExactly': a['completeUnchangedDEENReferenceCases'],
    'sourceWitnessContextReadInNeutralAuthorPacketExactly': a['actualFrozenSourceWitnessEffectiveBindings'],
    'inputRestriction': 'Only the two named neutral author raw packets, their selected original raster and author browser receipt, plus AGENTS.md and the visualization policy were read as review inputs. No peer review dossier/verdict was consulted.',
    'actualViewEvidence': {
        'originalRasterViewedWith': 'view_image detail original',
        'originalNaturalPixelDimensions': [1672, 941],
        'screenshotsViewedWith': 'view_image detail original after own successful Playwright Chromium browser rendering',
        'browserReceipt': binding(OUT / 'actual-360-680-browser-displays.independent-v-a.receipt.json'),
        'screenshots': [binding(OUT / 'displays/ce19.360.png'), binding(OUT / 'displays/ce19.680.png')],
        'measuredImageBoxes': [x['imageBox'] for x in browser_receipt['records']],
        'objectFit': 'contain',
        'maxHeightPx': 448,
        'devicePixelRatio': 1,
        'notFullAppOrActualProviderHostAcceptance': True,
    },
    'ownConcreteFindings': [
        {
            'topic': 'Targeted Axon label anchor',
            'decision': 'KEEP',
            'observationDe': 'Der schwarze Axon-Endpunkt liegt ungefähr bei Originalpixel x660/y482 auf dem violetten freiliegenden Axonhals links vor dem Beginn der ersten hellen Myelinhülle bei ungefähr x689. Er bezeichnet jetzt den Fortsatz selbst; er sitzt nicht auf einer äußeren Hüllfläche. Das ist im Original und in beiden eigenen Browserdarstellungen erkennbar.',
            'coordinatePrecision': 'Approximate visual observation, not automated pixel segmentation',
        },
        {
            'topic': 'Other labels and boundaries',
            'decision': 'KEEP',
            'observationDe': 'Dendriten weist auf verzweigte Fortsätze, Zellkörper auf die somatische Region und ihren proximalen unteren Ansatz; der Zellkern wird nicht als Zellkörper beschriftet. Endknöpfchen zeigt auf eine endständige Verdickung. Keine Leader-Leitung kreuzt eine fremde beschriftete Struktur so, dass eine andere Zuordnung nahegelegt wird. Der modellhafte Übergang zwischen Soma und proximalen Fortsätzen bleibt vereinfacht.',
        },
        {
            'topic': 'Axon continuity and neuron separation',
            'decision': 'KEEP',
            'observationDe': 'Ein einzelner durchgehender Weg verläuft vom Zellkörper durch den langen umhüllten Fortsatz zur terminalen Verzweigung. Die orange Richtungskette bleibt entlang dieses Wegs. Die Endverdickungen bleiben sichtbar vom grünen Rand der Folgezelle getrennt; orange Punkte liegen im Zwischenraum. Keine direkte Verschmelzung beider Zellen ist gezeichnet.',
        },
        {
            'topic': 'Bilingual whole-goal fit and biology',
            'decision': 'KEEP',
            'observationDe': 'Das Bild orientiert zu Aufbau, Aufnahmebereich, Weiterleitungsweg und Weitergabebereich einer vereinfachten Nervenzelle und passt damit zu beiden vollständigen DE/EN-Zielbeschreibungen. Die Pfeile sind eine mögliche Route im Grundmodell. Es gibt keine Behauptung einer universellen Signalrichtung für sämtliche Neuronentypen, keine Spannungskurve und keine Zahlen/Formeln, die Ruhepotenzial oder Aktionspotenzial ersetzen sollen.',
        },
        {
            'topic': '360 px legibility',
            'decision': 'KEEP',
            'observationDe': 'In der tatsächlich 360 Pixel breiten Browseraufnahme lassen sich Dendriten, Zellkörper, Axon und Endknöpfchen ohne Ausschnittvergrößerung lesen. Soma, langer Fortsatz und terminale Verzweigung bleiben als große Formen erkennbar. Die feinen Hüllgrenzen und Einzelpunkte sind kleine Zusatzdetails; zum Verständnis der Strukturroute muss dort keine zusätzliche Kleinschrift gelesen werden.',
        },
        {
            'topic': '680 px legibility',
            'decision': 'KEEP',
            'observationDe': 'In der tatsächlich 680 Pixel breiten Browseraufnahme bleiben alle Bezeichnungen klar; der Axon-Endpunkt vor der ersten Hülle sowie Hüllgrenzen, terminale Äste und getrennte Folgezelle sind sichtbar. Das ganze 16:9-nahe Bild wird bei ungefähr 382,70 Pixel Höhe angezeigt und unterschreitet die 448-Pixel-Kappe ohne Beschneidung.',
        },
        {
            'topic': 'Friendly visual language, density and visible artifacts',
            'decision': 'KEEP',
            'observationDe': 'Die weichen violetten Zellformen, orange Richtung und hellgrüne Folgezelle geben ein freundliches illustriertes Modell auf ruhigem Hintergrund. Vier große kurze Bezeichnungen passen zur Bildmenge. Im tatsächlich betrachteten Raster sind keine technischen IDs, Wasserzeichen oder fremden Marken sichtbar. Die Zeichnung bleibt ein Modell für die Oberstufe, ohne die Inhalte durch verniedlichte Zusatzfiguren zu überlagern.',
        },
    ],
    'referenceCaseAssessment': [
        {
            'caseId': 'initial-bounded-model',
            'wholeDeAndEnTaskResponseUnderstandingFocusReviewed': True,
            'findingDe': 'Das Bild zeigt die zur Orientierung benötigten Strukturen und eine mögliche Route im vereinfachten Grundmodell. Die DE/EN-Referenz begrenzt die Richtung ausdrücklich auf dieses Modell. Das Bild ist keine eigenständige Leistungsevidenz oder zusätzliche Aufgabenquote.',
        },
        {
            'caseId': 'fresh-contextual-transfer',
            'wholeDeAndEnTaskResponseUnderstandingFocusReviewed': True,
            'findingDe': 'Die vollständige DE/EN-Referenz trennt lokale Weiterleitung im Axon von wirksamer Übertragung zur Folgezelle. Das Raster zeigt einen Strukturüberblick mit normalem Zwischenraum; es zeigt weder Messgerät noch den im Transfermaterial ausdrücklich vorgegebenen Trennungs-/Ausfallbefund. Daher darf es diesen Befund und dessen Schlussfolgerung nicht ersetzen. Dieser begrenzte Bildzweck ist mit dem Lernziel vereinbar.',
        },
    ],
    'boundedContextAndLimitations': [
        'The four BY/HE SekII GK/LK source witnesses and their whole bounded source passages were read in the author packet. Every wholeSourceApproval remains false; this review does not independently reopen or approve the external source documents/extractions/mappings.',
        'The BY passage relates neuron structure to function. The HE official bullet also includes resting potential, action potential and conduction; the current structural atom and its image cover only their bounded structural orientation, not the whole broader source bullet.',
        'No signal recording, transmission success, learner performance, mastery, human trial, live host behavior or full source coverage is inferred from this picture or from the authored reference cases.',
        'The single image is German labelled; both whole learning-goal texts and both complete reference cases were reviewed in DE and EN. This is not a claim of a separately English labelled raster.',
        'The model simplifies neuron subtype differences, myelin geometry and synaptic detail. Arrows denote a model route, not measured propagation timing or a full account of saltatory conduction.',
        'The author-provided CC-BY-4.0 and generator provenance were retained as declarations. This review does not relicense third-party material or claim a separate rights clearance.',
    ],
    'generationProvenanceReadFromAuthorPacket': {
        'provider': r['actualProvider'],
        'tool': r['actualTool'],
        'modelVersion': r['actualModelVersion'],
        'modelVersionDisclosure': r['modelVersionDisclosure'],
        'selectedActualPromptBinding': r['actualFinalGenerationPrompt'],
        'selectedActualGeneratorMetadataBinding': r['actualFinalGeneratorMetadata'],
        'targetedFinding': r['receivedTargetedFinding'],
        'generationIsNotApproval': True,
    },
    'accessibilityAltTextReviewed': {
        'textDe': r['boundedImageAltTextDe'],
        'findingDe': 'Der Alttext benennt die sichtbare Strukturroute, kennzeichnet sie als möglich und hält die nächste Zelle getrennt. Er behauptet kein Experiment und keine tatsächliche Signalübertragung.',
    },
    'independentMachineVisualApproval': True,
    'combinedGateVApproval': False,
    'peerReviewConsulted': False,
    'humanApproval': False,
    'humanApproved': False,
    'humanTrialConfirmed': False,
    'humanIssueIdentified': False,
    'newStrictCompletion': 0,
    'strictM7Gain': 0,
    'activeCanonicalWrites': False,
    'activeQaWrites': False,
    'activeRegistryWrites': False,
    'operativeInstallCopiesWritten': 0,
    'historicDossierModification': False,
    'generatorInvoked': False,
    'importInvoked': False,
    'fullBuildOrChecksInvoked': False,
}
write('one-whole-goal.independent-v-a.review.json', review)

(OUT / 'README.md').write_text('''# Independent V-A review: ce19 targeted axon leader correction v2

Verdict: **KEEP** for the exact selected raster `38b16a4f07ab5490e42700fe31ee33f67a8d63aae09187965e27617c3f15c89c`.

The Axon leader now reaches the exposed purple neck before the first myelin sheath. I viewed the original and my own Playwright Chromium displays at measured image widths of 360 and 680 pixels, then inspected both screenshots with `view_image`. All four structure names remained readable. The continuous axon route and separated next-cell boundary remained visible.

The JSON report retains the complete unchanged bilingual goal, both complete DE/EN reference cases and the four bounded source witnesses from the neutral author packets. The disconnected-terminal transfer case is a separate supplied model; this picture does not show its measurement or prove transmission. Whole-source approval remains false.

This is one independent machine visual decision. It changes no historic dossier, active canonical/QA/registry files or runtime image. Generation and native dry-run routing are author provenance, not approval. Human fields remain false and strict M7 gain is zero. No peer verdict was read; no import, generator, full build or project-wide check was run.

`independent-v-a.final.freeze.json` binds every own payload and every declared input by exact SHA-256 and byte length. The seal is verified once after writing.
''')

payload_paths = sorted(p for p in OUT.rglob('*') if p.is_file() and p.name != 'independent-v-a.final.freeze.json')
freeze = {
    'role': 'independent V-A final freeze',
    'sealedAt': datetime.now(timezone.utc).isoformat(),
    'goalId': r['goalId'],
    'verdict': 'KEEP',
    'selectedCandidateSha256': binding(image_path)['sha256'],
    'declaredInputs': inputs,
    'ownPayloads': [binding(p) for p in payload_paths],
    'ownPayloadCount': len(payload_paths),
    'peerReviewConsulted': False,
    'humanApproval': False,
    'humanApproved': False,
    'humanTrialConfirmed': False,
    'humanIssueIdentified': False,
    'newStrictCompletion': 0,
    'strictM7Gain': 0,
    'activeWrites': False,
    'freezeFileSelfExcluded': True,
}
write('independent-v-a.final.freeze.json', freeze)
frozen = load(OUT / 'independent-v-a.final.freeze.json')
for item in frozen['declaredInputs'] + frozen['ownPayloads']:
    assert binding(ROOT / item['path']) == item
assert len([p for p in OUT.rglob('*') if p.is_file()]) == frozen['ownPayloadCount'] + 1
print(json.dumps({'verdict': review['verdict'], 'freeze': binding(OUT / 'independent-v-a.final.freeze.json'), 'verifiedDeclaredInputCount': len(inputs), 'verifiedOwnPayloadCount': len(payload_paths), 'humanApproval': False, 'strictM7Gain': 0}, ensure_ascii=False, indent=2))
