"""Serialize this reviewer's completed blind actual image review; own dossier only."""
import copy
import datetime
import hashlib
import json
import os
from pathlib import Path

from PIL import Image

BASE = Path(__file__).resolve().parent
AUTHOR = Path('curricula/DE/Gymnasium/quality/goal-visualization-review/biologie-neuro21-next-eleven-friendly-comic-primary-raster-author-20261007-v1')
RAW_PATH = AUTHOR / 'eleven-whole-goal-current-material-source-original-raster-native-routing.author.raw.json'
QA_PATH = Path('curricula/DE/Gymnasium/quality/goal-visualization-qa/biologie.qa.json')
RAW = json.loads(RAW_PATH.read_text())
NOW = datetime.datetime.now(datetime.timezone.utc).isoformat()

# These are this reviewer's own observations after opening the actual original
# and both actual width screenshots, not copied author or peer verdicts.
NOTES = {
    '78748ef2': (
        'Primäre Zelle besitzt ein eigenes Axon; sekundäre Zelle überträgt an ein getrenntes afferentes Neuron. RP liegt an der Reizaufnahme, AP am jeweiligen Axon. Breites rotes RP und schmale blaue AP-Pulse sind unterschieden; getrennte Membranen und Signalrichtungen passen.',
        'Ein gegebenes depolarisierendes Beispiel; Hyperpolarisation des zweiten ganzen Falls bleibt möglich. Kein universell positives RP, keine Zelltyp-Vollanatomie oder quantitativ kalibrierte Pulsfolge.',
        'Primär/sekundär und die große RP/AP-Legende sind bei 360 Pixeln lesbar; eigenes Axon versus separates Neuron ist erkennbar.'),
    '19758e09': (
        'Das Nervenaxon endet an der Drüse. Gleiche Hormonpunkte gelangen über beide Blutäste zu zwei Zielzellen. Oben passt das gezeichnete Hormon in den Rezeptor; unten markiert ein Kreuz die unpassende Bindestelle. Nervenleitung und Bluttransport werden nicht vermischt.',
        'Begrenzte Vorwärtsroute und Rezeptorspezifität des gegebenen Modells, kein vollständiger Rückkopplungskreis und keine Aussage, dass alle Hormone nur Membranrezeptoren haben. Rezeptorblockade und Gesundheitsgrenzen bleiben Textmaterial, keine Diagnose.',
        'Nervensignal/Hormon/Blut/Rezeptor/passt nicht, beide Äste und Kreuz sind bei 360 Pixeln erkennbar. Organellendetails sind nicht lesepflichtig.'),
    '347110a1': (
        'Vorher zwei, nachher drei Axon-Dendriten-Kontakte; die alten zwei bleiben erhalten. Alle blauen Endigungen sind mit dem Axon, alle grünen Spines mit dem Dendriten verbunden. Zellmembranen bleiben durch Spalte getrennt. Pfeil, Vorher/Nachher und Ring markieren eine zusätzliche Kontaktstelle.',
        'Strukturelle Plastizität des gegebenen Modells; kein Beweis einer molekularen Ursache, Erinnerung, Trainingsmessung oder größerer Einzelübertragung. Funktionelle Verstärkung ohne neue Verbindung ist getrennt zu beurteilen.',
        'Zwei versus drei Kontakte, Ring, Axon/Dendrit und Vorher/Nachher bleiben bei 360 Pixeln unterscheidbar. Neuer Kontakt ist klein, aber lesbar; Ring macht den Bezug auch ohne Kleinschrift klar.'),
    '485ef1c3': (
        'Vier gleiche Neuronen pro Modellseite. Intakt zeigt drei gerichtete getrennte Kontakte. Gestört endet die aktive Route nach Zelle zwei am Kreuz; dahinter fehlen Aktivitätspfeile/Transmitter, der hintere Kontakt bleibt strukturell vorhanden. Keine Signaldurchleitung durch die Unterbrechung.',
        'Ausdrücklich benanntes Funktions-/Strukturstörungsmodell, keine Alzheimer-Histologie oder Diagnose und keine austauschbaren Krankheitsursachen. Keine erfundene molekulare Erklärung.',
        'Modell/intakt/gestört, Kreuz und fehlende Signalroute hinter der Unterbrechung sind bei 360 Pixeln klar. Kleine Transmitterpunktzahlen sind keine Messdaten.'),
    'afde0001': (
        'Scanner/Person, mittleres Blutgefäßsymbol und qualitative farbige Gehirnkarte bilden eine schematische Informationsfolge fMRT→Blutsignal→Vergleich. Es sind keine Messwerte oder behaupteten Einzelneuronen eingezeichnet.',
        'Qualitative Illustration eines indirekten blutabhängigen Signals, keine gemessene BOLD-Karte oder Gedankenaufnahme. Die zwei Gehirnhälften sind kein unabhängig definierter quantitativer Kontroll-/Aufgabenvergleich. Bedingungen und strukturelle versus funktionelle Karten werden im ganzen Material erklärt; das Bild ersetzt deren Performance nicht.',
        'fMRT/Blutsignal/Vergleich sowie Scanner, Gefäß und Karte sind bei 360 Pixeln klar lesbar. Es gibt keine notwendige kleine Mess- oder Farblegende.'),
    '2381d2bb': (
        'Blaue äußere Bezugselektrode endet außerhalb und führt zum Minus-Eingang; rote innere Elektrode führt zum Plus-Eingang: innen minus außen. Qualitative Kurve zeigt Ausgangslage unter gestricheltem Bezug, schnellen Ausschlag darüber und Rückkehr.',
        'Messanordnung und qualitative AP-Zeitform, keine durchgeführte Messung oder vollständige Stimulations-/Kalibrationsplanung. Gestrichelter Bezug ist keine numerisch kalibrierte Null-/Schwellenmessung; Zahlen und Polungsumkehr stehen im Material. Ionenpunkte sind keine Konzentrationsmessung.',
        'Innen/außen, Messgerät, Potenzial/Zeit und Plus/Minus bleiben bei 360 Pixeln erkennbar. Beide Kabel lassen sich getrennt nachverfolgen; Kurve und Bezug bleiben unterschieden.'),
    '97b24279': (
        'E1/E2 grün erregend und H violett hemmend enden an drei getrennten Kontakten zu Z. Pfeile laufen zum Ziel; Plus/Minus und Legende markieren Wirkungen statt nur Farben. Z besitzt getrenntes Ausgangsaxon.',
        'Gegebenes konvergentes Schaltbild ohne Gewichtsmessung aus Punktzahlen. Ganze Fälle liefern Potenziale, Schwellen und Summationsannahmen; divergenter Transfer ist zusätzliches Material. Keine plastische Gewichtsänderung.',
        'E1/E2/H/Z, Plus/Minus, Richtung und erregend/hemmend sind bei 360 Pixeln lesbar. Hemmung ist durch Zeichen und Text erkennbar.'),
    '9b966664': (
        'Gleiche Sender geben violettes Serotonin aus Vesikeln frei. Links führt der Rückpfeil über präsynaptischen Transporter hinein; rechts blockieren roter Hemmer und Kreuz diese Route. Drei postsynaptische Rezeptoren bleiben zugänglich. Rechts qualitativ mehr Spaltpunkte, keine neue Serotoninerzeugung.',
        'Lokale Wiederaufnahmehemmung, keine ganze Depressionsursache, Therapieempfehlung oder sofortige Besserung. Punkte bilden nicht die konkrete 1/6-Einheiten-Bilanz oder Langzeitakkumulation ab. Transporterwirkung ist von Rezeptorblockade getrennt.',
        'Ohne/mit Hemmer, Sender/zurück/Serotonin/Empfänger sowie präsynaptischer Block und freie Empfängerrezeptoren sind bei 360 Pixeln erkennbar. Original ist tatsächlich 1672×940, die übrigen zehn 1672×941; nahe native 16:9-Größe zulässig.'),
    '8b23f8fb': (
        'Druck→Kanalöffnung→Netto-Einstrom markierter Kationen→RP→axonale AP-Folge. Schwach/stärker zeigt höheres abgestuftes RP und tatsächlich drei gegenüber sechs AP-Pulsen im gleich breiten Zeitfenster; Einzel-AP-Höhe wird schematisch erhalten.',
        'Begrenztes primäres mechanosensorisches Modell, keine Augen-/Rhodopsinphysiologie oder universelle lineare Kennlinie. Ohne Sekundenmaß bilden 3/6-Pulse nicht die P-Fallzahlen 5/s und 15/s für zwei Sekunden ab; qualitative Illustration statt numerischer Fall-Lösung. Dauer- und Blockade-Transfer bleiben Materialpflichten.',
        'Druck/Kanal/Kationen/RP/AP und schwach/stärker sind bei 360 Pixeln lesbar; Stromrichtung, höheres RP und drei/sechs Pulse bleiben erkennbar. Ionenpunktzahl ist keine quantitative Pflichtinformation.'),
    'c05e217f': (
        'Stress→Hypothalamus→Hypophyse→Nebennierenrinde→Cortisol im Blut. Zwei violette Rückwege enden mit Hemmungsbalken an den vorgelagerten Stationen. Cortisol-Abgabepfeil stammt aus der gezeichneten gelben Rinde, nicht aus der Niere.',
        'Vereinfachte Cortisol-Achse, keine negativen Konzentrationen, Langzeitmessung, Resistenz oder Diagnose. Der Insulin-/Glucose-Transfer im zweiten ganzen Fall ist ein zusätzlicher Regelkreis, den diese einzelne Illustration nicht vollständig zeigt.',
        'Hypothalamus und zweizeilige Nebennierenrinde sind bei 360 Pixeln lesbar. Zwei T-Enden unterscheiden Hemmung von stimulierenden Pfeilen; Stress/Cortisol und Vorwärtsroute sind klar.'),
    '080b10c7': (
        'Modelle A/B sind konkret Wirbellosem/Wirbeltier zugeordnet. Ohne Myelin wird AP an mehreren aufeinanderfolgenden Membranstellen regeneriert; mit Myelin nur an Knoten. Lokale Strompfeile bleiben im Axon unter isolierenden Segmenten; kein durch Luft springendes unverändertes AP.',
        'Synthetische konkret zugeordnete Modelle, keine universelle Tiergruppen-Rangfolge, Intelligenz oder Myelinisierung sämtlicher Fasern. AP-Symbole zeigen Regenerationsorte einer räumlichen schematischen Folge, keine Messung gleichzeitig aktiver Stellen. Ganze aktuelle v4-Fälle bestimmen 130/40 ms und 5/2,5 ms samt Bedingungen; Bild ersetzt diese Daten/grenzen nicht.',
        'Modell A/B, Wirbelloser/Wirbeltier und ohne/mit Myelin sind bei 360 Pixeln lesbar. Knoten, Isolierung und innere Stromroute bleiben klar; keine Messzahl-Kleinschrift nötig.'),
}


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def pin(path):
    return {'path': str(path), 'sha256': sha(path), 'bytes': Path(path).stat().st_size}


def save(path, value):
    temporary = path.with_name(path.name + '.tmp')
    temporary.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, path)


old = {row['goalId']: row for row in json.loads(QA_PATH.read_text())['records']}
verdicts, native_rows, bindings = [], [], []
for item in RAW['records']:
    goal_id = item['goalId']
    goal = item['wholeStage02CandidateGoal']
    asset = item['selectedUnchangedOriginalAsset']
    assert goal['id'] == goal_id and goal_id in asset['path']
    assert sha(asset['path']) == asset['sha256']
    dimensions = list(Image.open(asset['path']).size)
    assert dimensions == item['actualPixelDimensions']
    assert len(item['completeCurrentDEENReferenceCases']) == 2
    displays = []
    for display in item['actualDisplays']:
        assert goal_id in display['path'] and sha(display['path']) == display['sha256']
        width, height = Image.open(display['path']).size
        displays.append({**display, 'actualWidth': width, 'actualHeight': height, 'viewedWithViewImageOriginal': True})
    assert sorted(row['actualWidth'] for row in displays) == [360, 680]
    observation, limit, mobile = NOTES[goal_id[:8]]
    verdicts.append({
        'goalId': goal_id, 'decision': 'KEEP', 'asset': asset,
        'actualDimensions': dimensions, 'wholeOperativeCandidateGoal': goal,
        'wholeCurrentTwoBilingualReferenceCases': item['completeCurrentDEENReferenceCases'],
        'current080bV4MaterialRouting': item['updated080bWholeMaterials'],
        'actualOriginalViewedWithViewImageOriginal': True, 'actualDisplays': displays,
        'scientificAndVisualObservationsDe': observation, 'modelAndPerformanceLimitsDe': limit,
        'actualMobile360ReadabilityDe': mobile,
        'actualDesktop680ReadabilityDe': 'Gleiche Inhalte größer lesbar; keine Beschneidung. Beide tatsächlichen Breiten selbst angesehen.',
        'suppliedAltTextDe': item['boundedImageAltTextDe'], 'altTextDecision': 'KEEP',
        'newBlockingFindings': [], 'sourceWholeClosure': False, 'nativeDPGrant': False, 'humanApproval': False,
    })
    row = copy.deepcopy(old[goal_id])
    row.update({
        'title': goal['title'], 'description': goal['description'],
        'visualizationState': 'available', 'missingReason': '',
        'imageUrl': f'/assets/goal-visualizations/biologie/{goal_id}/{goal_id}.png',
        'publicAssetPath': f'app/public/assets/goal-visualizations/biologie/{goal_id}/{goal_id}.png',
        'canonicalAssetPath': f'curricula/DE/Gymnasium/visualizations/biologie/{goal_id}/{goal_id}.png',
        'assetSha256': 'sha256:' + asset['sha256'], 'aiApproved': 'yes',
        'aiApprovedAssetSha256': 'sha256:' + asset['sha256'], 'aiReviewedAt': NOW,
        'aiReviewer': 'biologie-neuro21-next-eleven-independent-v-b-20261007-v1',
        'umlautsCorrectChatGpt': 'yes', 'contentApprovedChatGpt': 'yes',
        'chatGptReviewedAt': NOW,
        'chatGptReviewer': 'independent-v-b GPT-6/Codex /root/biology_q1_v7_sources_independent_a_followup; exact serving variant not exposed',
    })
    note = ('Unabhängige blinde V-B, Original und actual 360/680 selbst gesehen. KEEP: '
            + observation + ' Grenze: ' + limit
            + ' Keine Humanfreigabe; aktuelle native D/P-Bild-/Seitenbindungen nach Import erforderlich. Beleg: '
            + str(BASE.relative_to(Path.cwd()) / 'independent-b.first-pass.eleven-raster-verdicts.actual.json'))
    row.update({'aiNotes': note, 'chatGptNotes': note})
    native_rows.append(row)
    bindings.append({'goalId': goal_id, 'asset': asset, 'actualDisplays': displays,
                     'oldWholeQaRecord': old[goal_id],
                     'wholeGoalJsonSHA256': hashlib.sha256(json.dumps(goal, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode()).hexdigest(),
                     'sourceBoundedWitnessCount': len(item['actualFrozenSourceWitnessEffectiveBindings'])})

save(BASE / 'independent-b.first-pass.eleven-raster-verdicts.actual.json', {
    'documentType': 'Independent blind actual eleven-raster visual-scientific first pass B',
    'reviewedAtUTC': NOW, 'reviewerAgent': '/root/biology_q1_v7_sources_independent_a_followup',
    'independenceGroup': 'bio-neuro21-eleven-independent-v-b-20261007-v1',
    'model': 'GPT-6/Codex', 'exactServingVariant': 'not exposed', 'wasImageAuthor': False,
    'blindToOtherRuns': True, 'newPeerVisualVerdictsRead': False,
    'authorAssertionsAreNotScientificApproval': True,
    'authorFreeze': pin(AUTHOR / 'eleven-original-raster-native-routed.author-v1.final.freeze.json'),
    'rawInput': pin(RAW_PATH), 'distinctActualOriginalsSeen': 11,
    'distinctActualWidthScreenshotsSeen': 22, 'wholeBilingualReferenceCasesRead': 22,
    'rows': verdicts, 'activeWrites': False, 'sourceWholeClosure': False,
    'fullAppOrNativeBookAcceptance': False, 'humanApproval': False, 'strictCompletionNet': 0,
})
save(BASE / 'native-eleven-qa-rows.independent-b.prospective.json', {
    'documentType': 'Prospective bounded native eleven V rows from independent B, not active installation',
    'records': native_rows, 'activeWrites': False, 'humanApproval': False,
    'nativeDPStillRequiresCurrentPageContextBindingsAfterImport': True,
})
save(BASE / 'independent-b.exact-input-and-width-bindings.actual.json', {
    'documentType': 'Actual exact raw input and width bindings for independent eleven-raster review B',
    'createdAtUTC': NOW, 'rawInput': pin(RAW_PATH), 'activeQaInput': pin(QA_PATH),
    'authorWholeStage02CandidateIsNotActiveCanon': True,
    'hashObjectMethod': 'whole goal JSON UTF-8 ensure_ascii false sorted keys compact separators',
    'records': bindings, 'nativeImageImportsExecutedByReviewer': 0,
    'nativeAuthorDryRunsBoundOnly': 11, 'actualOriginalAttemptsPreserved': True,
})
print(json.dumps({'writtenOwnFiles': 3, 'distinctOriginalsSeen': 11, 'distinctWidthsSeen': 22,
                  'wholeBilingualCasesRead': 22, 'newStrictCompletions': 0, 'peerVerdictsRead': False}))
