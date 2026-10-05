import hashlib
import json
import struct
from pathlib import Path


CANDIDATE = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-two-and-b010-ion-lattice-candidate-20261005-v1')
OWN = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/chemie-b014-titration-b010-ion-lattice-independent-v-qa-20261005-v1')
IDS = ['02634fdd-c8ba-591a-b240-77129b1bebb8', '950c73c6-4ed1-488a-9267-1142e95e0055']
FREEZE_SHA = '84db6171b208285b67a4afc00cfe9d6e94c0bad8a040c24849f3c4f8a8316e35'


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def content_sha(obj):
    return hashlib.sha256(json.dumps(obj, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest()


def write(name, obj):
    (OWN / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2) + '\n')


freeze_path = CANDIDATE / 'image-candidate.freeze.json'
assert sha(freeze_path) == FREEZE_SHA
freeze = json.loads(freeze_path.read_text())
assert len(freeze['files']) == 31
for item in freeze['files']:
    assert sha(item['path']) == item['sha256'], item['path']

context_path = CANDIDATE / 'input-three-goal-contexts.candidate.json'
contexts = json.loads(context_path.read_text())
assert contexts['operativeAdoption'] is False
goals = [g for g in contexts['goals'] if g['id'] in IDS]
assert {g['id'] for g in goals} == set(IDS)
captures = json.loads((OWN / 'independent-width-capture.actual.receipt.json').read_text())
assert len(captures['views']) == 4
assert captures['sourceFreezeSha256'] == FREEZE_SHA
assert captures['sourceFilesUnchanged'] is True
for item in captures['views']:
    assert sha(item['sourcePath']) == item['sourceSha256']
    assert sha(item['path']) == item['sha256']

generation_path = CANDIDATE / 'three-generated-and-isolated-import.receipt.json'
generation = json.loads(generation_path.read_text())
assets = [a for a in generation['assets'] if a['goalId'] in IDS]
bindings = [freeze_path, context_path, generation_path, CANDIDATE / 'native-widths.actual.receipt.json',
            CANDIDATE / 'capture-candidate-widths.cjs', Path('AGENTS.md'),
            Path('docs/concept/skill-graph/atomic-goal-visualizations.md'),
            Path('docs/qa-ci/chemie-biologie-m7-goaltext-2026-09-30.md')]
for asset in assets:
    short = asset['goalId'][:8]
    bindings.extend([Path(asset['path']), CANDIDATE / short / 'actual-prompt-v2.md',
                     CANDIDATE / short / 'generation-request-v2.actual.json',
                     CANDIDATE / short / 'native-360.png', CANDIDATE / short / 'native-680.png'])
    assert sha(asset['path']) == asset['sha256']
    assert sha(asset['generatedPath']) == asset['sha256']
    for copied in asset['sourceFrontendBackendCopies']:
        assert sha(copied['path']) == asset['sha256']

write('input-bindings.checked.json', {
    'authority': 'ai_candidate', 'originalFreezeSha256': FREEZE_SHA,
    'originalFrozenFilesChecked': 31, 'originalFrozenFilesUnchanged': True,
    'bindings': [{'path': str(p), 'sha256': sha(p)} for p in bindings],
    'generatedAndIsolatedCopyEqualityVerified': True,
    'providerStatementScope': 'Known generation requests, retained root tool receipt, actual generated-output bytes and isolated copies; no independent provider-side transport audit or model-version claim.',
    'activeWrites': False, 'humanApproval': False,
})

write('reviewed-two-goal-inputs.snapshot.json', {
    'recordStatus': 'inactive_candidate_snapshot', 'authority': 'ai_candidate',
    'sourcePath': str(context_path), 'sourceSha256': sha(context_path),
    'landscapeId': contexts['landscapeId'], 'goals': goals,
    'goalContentHashMethod': 'SHA256 of UTF-8 JSON, ensure_ascii=False, sorted keys and compact separators',
    'goalContentHashes': {g['id']: content_sha(g) for g in goals},
    'operativeAdoption': False, 'humanApproval': False,
})

scientific = {
    IDS[0]: [
        'Die Bürette enthält die korrekt als NaOH bezeichnete Maßlösung; die HCl-Probe befindet sich im Erlenmeyerkolben. Die dargestellten Flüssigkeiten sind farblos, abgesehen vom zarten rosa Schimmer der Probe am Endpunkt. Blaue Glasränder und Reflexe sind keine blaue NaOH-Füllung.',
        'Das geschlossene Indikatorgefäß zeigt eine transparente, farblose Stocklösung. Die Probe zeigt einen sehr blassen rosa Endpunkt, keinen dunkelrosa Überschuss. Der konkrete Indikator ist im Bild allgemein beschriftet; der gebundene Prompt und diese Szenenprüfung konkretisieren Phenolphthalein für HCl/NaOH.',
        'Eine senkrechte Bürette ist plausibel am Stativ geklemmt; Hahn und Auslauf bilden einen durchgehenden Flüssigkeitsweg zum offenen Kolben. Die Graduierung nimmt von 0 oben zu 25 unten zu. Der Meniskus ist im Original erkennbar. Die Skizze enthält keine präzise auswertbare Start-/Endvolumenmessung.',
        'Der Schwenkpfeil bleibt auf den Kolben bezogen. Das seitliche Protokollheft ist vor der angenommenen Arbeitsperson am unteren Tischrand offen; es enthält keine verkehrt herum lesepflichtige Messzeile. Eine Person ist nicht gezeichnet, deshalb wird keine unbeobachtete konkrete Körper- oder Augenposition behauptet.',
        'Die Orientierung zeigt einen kohärenten Aufbau und eine Endpunktsituation. Planen, Indikatorwahl begründen, Pipettieren, wiederholte Messwerte dokumentieren, reale Durchführung und stöchiometrische Konzentrationsrechnung müssen separat beurteilt werden. Das Bild ist keine praktische Leistung und kein P-Nachweis.',
    ],
    IDS[1]: [
        'Das zentrale orangefarbene Ion ist als Na⁺ gekennzeichnet. Genau sechs hervorgehobene grüne Cl⁻ umgeben es: oben/unten, links/rechts und hinten rechts/vorn links. Diese drei gegenüberliegenden Richtungen bilden die schematische Projektion einer räumlichen oktaedrischen nächsten Nachbarschaft; es sind nicht sechs Nachbarn in einer flachen Ebene.',
        'Weitere orangefarbene und grüne Ionen sowie graue Gitterhilfslinien führen das kristalline Modell über diese hervorgehobene Nachbarschaft hinaus fort. Die Darstellung ist ein aufgeweiteter, schematischer Gitterausschnitt mit hervorgehobener Koordinationsumgebung, keine maßstäbliche Elementarzelle.',
        'Die dunklen gestrichelten Hilfslinien markieren die sechs räumlichen Nachbarn. Sie sind kein Elektronenpaar-/Molekülbindungsmodell. Die Beschriftung lautet 6 nächste Nachbarn; sie weist die Koordinationszahl aus, keine Summenformel NaCl₆. Das ausgedehnte Hintergrundgitter verhindert eine isolierte Sieben-Ionen-Molekülinterpretation.',
        'Es erscheinen weder freie Elektronen, Metall-Elektronengas noch ein elektronischer Leitungsweg. Ionenbeweglichkeit und elektrische Leitung werden im Bild nicht vorgeführt; diese Teile des gebundenen Lernziels brauchen eigene Erklärung und Aufgaben.',
        'Salzkristall, Salzkrümel, Tisch und Ionen sind freundlich gezeichnet und stilisiert. Die Szene ist weder fotografisch noch steril-technisch. Die räumliche Nachbarschaft, Ladungen und sechs getrennten hervorgehobenen Cl⁻ bleiben bei 360 und 680 Pixeln erkennbar.',
    ],
}

alts = {
    IDS[0]: {
        'de': 'Comicartige Titrationsanordnung: Eine senkrechte, am Stativ geklemmte Bürette mit farbloser NaOH-Maßlösung und nach unten zunehmender Skala tropft in einen Erlenmeyerkolben mit HCl-Probe. Ein Pfeil deutet Schwenken an; die Flüssigkeit zeigt am dargestellten Endpunkt einen sehr zarten rosa Schimmer. Daneben stehen eine farblose Indikatorlösung und ein zur Arbeitsseite hin offenes Protokollheft.',
        'en': 'Friendly cartoon titration setup: a vertical burette clamped to a stand contains colourless NaOH standard solution and has a scale increasing downwards. It drips into an Erlenmeyer flask containing the HCl sample. An arrow indicates swirling, and the sample has a very faint pink tint at the depicted endpoint. A colourless indicator stock bottle and an open laboratory notebook sit beside it.',
    },
    IDS[1]: {
        'de': 'Comicartiger, schematisch aufgeweiteter Natriumchlorid-Gitterausschnitt: Ein orangefarbenes Na⁺ ist hervorgehoben. Sechs grüne Cl⁻ liegen in drei gegenüberliegenden Raumrichtungen oben und unten, links und rechts sowie hinten rechts und vorn links. Gestrichelte Hilfslinien markieren diese nächste Nachbarschaft und die Beschriftung 6 nächste Nachbarn bezeichnet die Koordinationszahl. Weitere Ionen zeigen die Fortsetzung des Kristallgitters; links liegt ein gezeichneter Salzkristall.',
        'en': 'Friendly cartoon of an expanded schematic sodium chloride lattice fragment. One orange Na⁺ is highlighted. Six green Cl⁻ surround it along three opposite spatial directions: above and below, left and right, and rear-right and front-left. Dashed guides highlight these nearest neighbours; the label 6 nearest neighbours identifies the coordination number. Further ions continue the crystal lattice, with a drawn salt crystal at the left.',
    },
}

records = []
for asset in assets:
    goal_id = asset['goalId']
    goal = next(g for g in goals if g['id'] == goal_id)
    source_path = Path(asset['path'])
    bytes_ = source_path.read_bytes()
    assert bytes_[:8] == b'\x89PNG\r\n\x1a\n'
    width, height = struct.unpack('>II', bytes_[16:24])
    assert (width, height) == (1672, 941)
    link = next(link for link in goal['resourceLinks'] if link['type'] == 'goal-visualization')
    records.append({
        'goalId': goal_id, 'decision': 'PASS', 'reviewAuthority': 'independent_ai_visual_review',
        'assetPath': str(source_path), 'assetSha256': asset['sha256'],
        'boundGoalContentSha256': content_sha(goal), 'boundGoalTitle': goal['title'],
        'boundGoalDescription': goal['description'], 'boundGoalDescriptionEn': goal['descriptionEn'],
        'nativeOriginalActuallyViewed': True,
        'originalViewMethod': 'view_image detail original in independent agent turn',
        'providedFrozen360And680ActuallyViewed': True,
        'independentFresh360And680ActuallyViewed': True,
        'format': {'fileFormat': 'PNG', 'width': width, 'height': height,
                   'aspectRatio': width / height, 'ratioDecision': 'PASS: near-native 16:9 landscape',
                   'nativeFormatDecision': 'PASS', 'mobile360Decision': 'PASS', 'desktop680Decision': 'PASS',
                   'views': [v for v in captures['views'] if v['goalId'] == goal_id]},
        'scientificObservations': scientific[goal_id],
        'readabilityObservations': (
            ['Bei 360 Pixeln bleiben Volumen ablesen, Maßlösung NaOH, Probe HCl und Indikator lesbar; Aufbau, Hahn, Kolben und Endpunktschimmer sind unterscheidbar.',
             'Bei 680 Pixeln sind die genannten Hauptmerkmale deutlicher erkennbar. Die kleine Hintergrundtafel und einzelne Skalenstriche bei 360 Pixeln werden nicht als lesepflichtiger Kerninhalt oder Messaufgabe verwendet.']
            if goal_id == IDS[0] else
            ['Bei 360 Pixeln bleiben Ionengitter, Na⁺, alle sechs Cl⁻ und 6 nächste Nachbarn lesbar; Vorder-/Hintergrundnachbarn sind getrennt sichtbar.',
             'Bei 680 Pixeln sind Ladungen, Nachbarhilfslinien und Gitterfortsetzung deutlich. Die Hintergrundkugeln tragen keine zusätzlichen lesepflichtigen Texte.']
        ),
        'blockingImageFindings': [], 'scientificImageErrors': [], 'regenerationRequired': False,
        'metadataIntegrationRequirement': {
            'field': 'altText', 'finding': 'Der eingefrorene Link wiederholt generisch Lernziel und Kompetenzbeschreibung. Er beschreibt die sichtbare Darstellung noch nicht konkret genug.',
            'requiredAction': 'Für die aktive Integration den unabhängig geprüften spezifischen deutschen Alttext übernehmen.',
            'currentGenericAltText': link['altText'], 'reviewedAltText': alts[goal_id],
            'requiresPixelChange': False,
        },
        'provenance': {'provider': asset['provider'], 'tool': asset['tool'],
                       'modelVersion': asset['modelVersion'],
                       'promptPath': str(CANDIDATE / goal_id[:8] / 'actual-prompt-v2.md'),
                       'promptSha256': sha(CANDIDATE / goal_id[:8] / 'actual-prompt-v2.md'),
                       'requestPath': str(CANDIDATE / goal_id[:8] / 'generation-request-v2.actual.json'),
                       'requestSha256': sha(CANDIDATE / goal_id[:8] / 'generation-request-v2.actual.json'),
                       'generatedSourcePath': asset['generatedPath'],
                       'generatedSourceBytesMatchAsset': True, 'allThreeIsolatedCopiesVerifiedEqual': True,
                       'providerTransportAudit': False},
        'supportsOrientationOnly': True, 'practicalPerformanceEvidence': False,
        'descriptionReviewClaim': False, 'positiveEvidenceApprovalClaim': False,
        'activeGateVRegistered': False, 'humanApproval': False,
    })

write('independent-two-image-v-qa.receipt.json', {
    'reviewStatus': 'completed_independent_machine_candidate_review',
    'authority': 'independent_ai_visual_review', 'reviewer': '/root/bio_q1_six_source_remediation',
    'reviewedAtUtc': '2026-10-05T11:13:20Z',
    'independence': {
        'imageAuthor': '/root', 'reviewerWasNotImageAuthor': True,
        'priorKnowledgeDisclosure': 'Task handoff disclosed the two scientific risk lists, targeted colour/style revisions and excluded 16 mobile HOLD. The reviewer read frozen goal texts and actual images before the targeted generation prompts. Root scientific verdict/findings files were not used for the independent verdict.',
        'descriptionAndPAuthorship': False, 'humanReview': False,
    },
    'sourceFreezePath': str(freeze_path), 'sourceFreezeSha256': FREEZE_SHA,
    'sourceInputContextPath': str(context_path), 'sourceInputContextSha256': sha(context_path),
    'scope': IDS, 'records': records,
    'excluded': [{'goalId': '16da6a4d-8e9c-5f5d-b69d-338d67a2d362',
                  'decision': 'NOT_REVIEWED', 'carryForwardStatus': 'HOLD',
                  'reason': 'Previously evidenced mobile defect remains with separate owner; this two-image review neither examines nor closes that image.'}],
    'primaryScientificReferences': [
        {'title': 'University of British Columbia: Technique: Titrations',
         'url': 'https://groups.chem.ubc.ca/chem121/111_121_files/Techniques_Titration.pdf',
         'inspected': 'page 1, endpoint distinction and HCl in flask / NaOH in burette; very pale persistent pink',
         'use': 'Scientific check only; no diagram or text copied into the asset.'},
        {'title': 'Open University: Discovering chemistry, 2.2 Non-molecular substances',
         'url': 'https://www.open.edu/openlearn/mod/oucontent/view.php?id=72184&section=2.2',
         'inspected': 'Figure 5 discussion: octahedral six-neighbour coordination and extended non-molecular NaCl structure',
         'use': 'Scientific check only; no source illustration copied.'},
        {'title': 'Beloit College: Polyhedral Model Kit, NaCl Example',
         'url': 'https://chemistry.beloit.edu/edetc/pmks/pages/NaClExample.html',
         'inspected': 'Octahedral sodium environment and continuing layered crystal construction',
         'use': 'Independent representation check only; no source illustration copied.'},
    ],
    'scopeLimits': ['Keine genaue Längen-/Ionenradiusmessung aus der Comicperspektive.',
                    'Keine echte Handy-/PC-Geräte-, Cockpit-, ChatGPT- oder Claude-Host-Abnahme; tatsächliche CSS-Bildbreiten wurden geprüft.',
                    'Bild-PASS ist maschinelle Kandidatenprüfung. Aktive Ziel-/Seiten-/Kontext-/Quellen-/Bildbindungen und spezifische Alttexte sind beim integrierten Stand zu prüfen.'],
    'activeWrites': False, 'imageGenerationOrEditing': False, 'globalChecksRun': False,
    'strictNewCompletions': 0, 'restoredBindings': 0, 'netStrictIncrease': 0,
    'humanApproval': False, 'humanTrial': False,
})

write('specific-alt-texts.reviewed.candidate.json', {
    'authority': 'independent_ai_visual_review', 'operativeAdoption': False,
    'items': [{'goalId': g['id'], 'assetSha256': next(a['sha256'] for a in assets if a['goalId'] == g['id']),
               'altText': alts[g['id']]['de'], 'altTextEnCandidate': alts[g['id']]['en'],
               'lang': 'de', 'decision': 'PASS'} for g in goals],
    'humanApproval': False,
})
print('PASS: exact two inactive goal, asset, prompt and provenance bindings; four independently rendered views; original frozen 31 files unchanged')
