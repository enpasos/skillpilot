# SPDX-License-Identifier: Apache-2.0
"""Serialize this reviewer's individually authored decisions; do not derive verdicts."""
from pathlib import Path
import datetime
import hashlib
import json
import subprocess

ROOT = Path(__file__).resolve().parents[7]
OWN = Path(__file__).resolve().parent
AUTHOR = ROOT / 'curricula/DE/Gymnasium/quality/goal-evidence/2026-10-05/chemie-b010-five-prospective-current-candidate-v1'
ROUND = AUTHOR / 'native-finalbook/round-b'
BUNDLE = AUTHOR / 'native-finalbook/bundle'

def sha(data):
    return 'sha256:' + hashlib.sha256(data).hexdigest()

def write(path, value):
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')

started = datetime.datetime.now(datetime.timezone.utc).isoformat()
inp = json.loads((ROUND / 'description-review-input.json').read_text())
campaign = json.loads((ROUND / 'description-review-campaign.json').read_text())
bundle = json.loads((BUNDLE / 'manifest.json').read_text())
batch = campaign['batches'][0]
run_id = 'chemie-b010-nine-current-independent-d-b-v2-run-001'

# All judgments and evidence chains below were written independently after actual
# page/source inspection. Four existing goals receive a targeted binding review.
judgments = {
    'fcc73fb5-7413-557f-aea3-b9692a66ee75': (
        'Stoffeigenschaften unterscheiden Stoffarten; Wasserlöslichkeit ist eine Eigenschaft unter definierten Bedingungen und kein Maß für die Menge einer Portion.',
        'Substance properties distinguish kinds of matter; water solubility is a property under defined conditions and is not the size of a sample.',
        'Die lernende Person ordnet Angaben zu mehreren Stoffen nach demselben Eigenschaftsmerkmal und erklärt die Gruppierung mit den gegebenen Beobachtungen.',
        'The learner groups several substances by the same property and explains the grouping using the supplied observations.',
        'Sie ordnet neue Stoffdaten nach einer anderen geeigneten Kenneigenschaft und begründet, warum eine andere Stoffportion allein die Stoffklasse nicht ändert.',
        'The learner groups new substance data by another suitable characteristic property and explains why changing sample size alone does not change the substance class.',
        'Gezielte neue Seitenbindung, kein Neustart des unveränderten Gesamtzielreviews: Die tatsächliche PDF-Seite 3 und HTML-Ansicht zeigen denselben vollständigen DE-Text und das aktuelle Zucker/Sand-PNG 08dfb667…. Der neue direkte Rückverweis zu 584 ist inhaltlich passend, weil Halogenverwendungen passende Stoffeigenschaften benötigen. Die Eigenschaftenkompetenz wird durch diesen Nachfolger weder zur Reaktionskompetenz erweitert noch aus einer Bildbeobachtung als gelernt behauptet. DE/EN sind weiterhin äquivalent; die allgemeine Grundlagenposition bleibt passend.',
        'none'),
    '42a84bca-d27e-581f-a43a-eee424f0504d': (
        'Reinstoffe haben eine Stoffart, Gemische mehrere; Elemente bestehen aus einer Elementsorte, Verbindungen aus chemisch verbundenen Elementsorten. Ein zweiatomiges Elementmolekül ist keine Verbindung.',
        'Pure substances contain one kind of substance and mixtures several; elements contain one element, whereas compounds contain chemically combined elements. A diatomic elemental molecule is not a compound.',
        'Die lernende Person ordnet gegebene Teilchendarstellungen begründet als Element-Reinstoff, Verbindungs-Reinstoff oder Gemisch ein und benennt das entscheidende Unterscheidungsmerkmal.',
        'The learner justifies classification of particle representations as a pure element, pure compound or mixture and identifies the distinguishing feature.',
        'Sie erklärt an einer neuen Darstellung aus Elementmolekülen und Verbindungsteilchen, warum gleiche Farbe, Teilchenzahl oder Aggregatzustand allein keine tragfähige Klassifikation liefern.',
        'The learner explains, using a new representation of elemental molecules and compound particles, why colour, particle count or physical state alone cannot determine the classification.',
        'Gezielte neue Seitenbindung: PDF-Seite 4 und tatsächliche HTML-Ansicht sind vollständig und binden weiterhin JPG 395a6ff0…. Der neue Rückverweis zu 584 fordert gerade die Trennung elementarer Halogene von Halogenverbindungen; er passt zum unveränderten Teilchen-/Stoff-Unterscheidungsziel. Die Zeichnung zeigt O₂ als Element und H₂O als Verbindung sowie zwei Gemischarten konsistent. Keine neue Vollprüfung aller historischen Quellengruppen und keine Änderung des bestehenden fachlichen Abschlusses beansprucht.',
        'none'),
    '950c73c6-4ed1-488a-9267-1142e95e0055': (
        'Ein Ionengitter ist eine räumlich wiederholte Anordnung entgegengesetzt geladener Ionen; die Koordinationszahl zählt nächste Nachbarn. Elektrostatische Kräfte und Beweglichkeit erklären Eigenschaften verschiedener Zustände.',
        'An ionic lattice is a repeating spatial arrangement of oppositely charged ions; coordination number counts nearest neighbours. Electrostatic forces and ion mobility explain properties in different states.',
        'Die lernende Person konstruiert oder erläutert einen NaCl-Modellausschnitt mit sechs nächsten Gegenionen und erklärt hohe Schmelztemperatur, Sprödigkeit und Leitfähigkeit in Feststoff gegenüber Schmelze oder Lösung mit dem Modell.',
        'The learner constructs or explains a NaCl lattice fragment with six nearest opposite ions and uses the model to explain high melting temperature, brittleness and conductivity of solid compared with molten or dissolved material.',
        'Sie analysiert eine neue Gitter-/Zustandsdarstellung, erkennt ein unzutreffendes NaCl-Einzelmolekülmodell und sagt die Leitfähigkeit bei veränderter Ionenbeweglichkeit begründet voraus.',
        'The learner analyses a new lattice or state representation, identifies an incorrect discrete NaCl molecule model and justifies a conductivity prediction when ion mobility changes.',
        'KEEP nach eigener fachlicher Prüfung: Modellierung, räumliche Nachbarschaft und Eigenschaften bilden einen Struktur-Eigenschafts-Zusammenhang statt unabhängiger Routinen. HE10.1 nennt ausdrücklich Gitter, Koordinationszahl und Eigenschaften; die tatsächliche amtliche physische Seite 22 ist angesehen. BY C8/4 unterstützt einfaches Gittermodell und Eigenschaftserklärung, ohne einen spezialisierten Gittertypvergleich zu fordern. Der kurze DE/EN-Text wahrt diese Breite und AB2; er verlangt weder Bindungsenergieberechnung noch eine Kristallstrukturbestimmung. PDF-Seite 5/HTML enthalten das schematisch aufgeweitete PNG 6232e3bd… mit sechs markierten Gegenionen. Das Bild ersetzt kein selbstständiges Modellargument.',
        'create'),
    '16a80de2-b5e0-5467-a9b3-5860730d7d8b': (
        'Bei geeigneten Alkalimetall/Wasser- und einfachem Alkalimetalloxid/Wasser-System entstehen Hydroxidionen; nur das Metall/Wasser-System liefert zusätzlich Wasserstoff. Die gesamte Lösung bleibt elektrisch neutral.',
        'Suitable alkali metal/water and simple alkali metal oxide/water systems produce hydroxide ions; only the metal/water system additionally produces hydrogen. The bulk solution remains electrically neutral.',
        'Die lernende Person deutet bereitgestellte Produktdaten für Natrium und Natriumoxid mit Wasser, unterscheidet Wasserstoffbildung von Hydroxidbildung und erklärt beide alkalischen Lösungen durch OH⁻.',
        'The learner interprets supplied product data for sodium and sodium oxide with water, distinguishes hydrogen formation from hydroxide formation and explains both alkaline solutions through OH⁻.',
        'Sie vergleicht ein frisches Lithium-/Lithiumoxid-System anhand geeigneter Daten und begründet die gemeinsame Alkalität bei unterschiedlicher Gasbildung, ohne Versuche mit reaktiven Metallen selbstständig durchzuführen.',
        'The learner compares a fresh lithium/lithium oxide system using suitable data and explains the common alkalinity despite different gas formation, without independently performing hazardous reactive-metal experiments.',
        'KEEP: Der Vergleich der beiden in HE9.2 verbindlich genannten Wasser-Systeme ist ein einziges kausales Lernziel. Produktvergleich plus Ursache der Alkalität sind passend verknüpft; das Oxid wird nicht fälschlich zum Wasserstofflieferanten. Physische amtliche Seite 19 bestätigt genau diesen Systemvergleich. Beide Sprachfassungen fordern Deutung und keine unsupervisierte Durchführung. JPG 8fe44fbc… ist auf PDF-Seite 6/HTML tatsächlich gebunden und seine Gleichungen erhalten Atome und Ladung. Die unter Wasser gezeichnete Na-Flamme ist eine konkrete Darstellungsgrenze für die separate V-Prüfung; D-KEEP genehmigt diese Darstellung nicht. Kein neuer BY-Spezialquellenbeleg oder Abschluss des e0-Vorläufers wird behauptet.',
        'create'),
    '58486300-3f84-5aa1-9ed4-66186af62669': (
        'Halogene als elementare Stoffe und ihre Verbindungen sind verschiedene Stoffe mit verschiedenen Eigenschaften; eine Verwendung muss mit den Eigenschaften des tatsächlich verwendeten Stoffs begründet werden.',
        'Elemental halogens and their compounds are distinct substances with distinct properties; a use must be justified from the properties of the substance actually used.',
        'Die lernende Person beschreibt ausgewählte Halogenstoffe mit vorgegebenen Kenndaten und begründet konkrete Verwendungen, wobei sie beispielsweise Fluorid in Zahnpasta von elementarem Fluor unterscheidet.',
        'The learner describes selected elemental halogens using supplied properties and justifies specific uses, distinguishing, for example, fluoride in toothpaste from elemental fluorine.',
        'Sie beurteilt eine neue Alltagsbehauptung zu einem Halogen oder Halogenid anhand stoffgenauer Daten und erklärt, warum die Eigenschaft des Elements nicht automatisch auf jede Verbindung übertragbar ist.',
        'The learner evaluates a fresh everyday claim about a halogen or halide using substance-specific data and explains why elemental properties cannot automatically be assigned to every compound.',
        'KEEP: Eigenschaften und Verwendung bilden einen zusammenhängenden Struktur-/Stoffeigenschafts-Anwendungsbezug. Der explizite Unterschied elementarer Stoffe/Verbindungen beseitigt die gefährliche Gleichsetzung Fluor = Zahnpastabestandteil. HE9.2 physische Seite 19 enthält beide Alltagsanteile; die Bindung an 584 beansprucht nicht zusätzlich die separate Metallreaktion oder Wasserstoff-Halogen-/Salzsäuresynthese. AB2 und DE/EN stimmen. PDF-Seite 7/HTML zeigen JPG b8139a29… mit getrennten Element- und Verwendungsfeldern. Färbungen sind schematisch; die Tafel dient zur Orientierung, nicht als Beobachtungs- oder Lernleistungsnachweis.',
        'create'),
    'b5086548-169e-5d63-a14a-dabf631fa013': (
        'Die genannten Salzklassen werden über ihre charakteristischen Anionen unterschieden; das Kation und das für Ladungsneutralität nötige Zahlenverhältnis bleiben von der Klassenbezeichnung unterscheidbar.',
        'The specified salt classes are distinguished by their characteristic anions; the cation and the ratio needed for charge neutrality are distinct from the class name.',
        'Die lernende Person ordnet gegebene Salzformeln den vier Klassen zu, benennt das entscheidende Anion und begründet die Zuordnung ohne die gesamte Tabelle abzuschreiben.',
        'The learner assigns supplied salt formulas to the four classes, identifies the decisive anion and justifies the classification without merely copying the displayed table.',
        'Sie klassifiziert neue Salze mit veränderten Kationen oder Anzahlen der Ionen und erklärt, weshalb das unveränderte Anion weiterhin dieselbe Salzklasse bestimmt.',
        'The learner classifies new salts with changed cations or ion ratios and explains why the unchanged anion still determines the same salt class.',
        'Gezielte aktuelle Breadcrumb-/Verweisprüfung: PDF-Seite 8 und HTML zeigen das unveränderte JPG 9e9987ac… samt richtiger Cl⁻/Br⁻/I⁻-, SO₄²⁻-, NO₃⁻- und CO₃²⁻-Zuordnung. Die neue Salz-/Anwendungsposition und Rückverweise auf d726, 414 und 1f verbinden genau die Salzklassen mit Beispielen, ohne die ionenbasierte Klassifikationskompetenz zu erweitern. HE10.3 physische Seite 25 bestätigt diesen konkreten Klassenblock. Alte Text-/Quellenurteile bleiben erhalten; die ASCII-Schreibweise ist kein Anlass zu einer unbestellten stilistischen Änderung.',
        'none'),
    'd726e00e-1f87-5ba5-8c79-76ad4022365e': (
        'Brennen, Löschen und Carbonatisieren verknüpfen Calciumcarbonat, Calciumoxid und Calciumhydroxid unter Aufnahme oder Abgabe von Wasser beziehungsweise Kohlenstoffdioxid.',
        'Calcination, slaking and carbonation connect calcium carbonate, calcium oxide and calcium hydroxide while consuming or releasing water or carbon dioxide.',
        'Die lernende Person erklärt die drei wesentlichen Umwandlungen anhand der Stoffe und ihrer ausgeglichenen Gleichungen und beschreibt die Rolle des Carbonats im Kreislauf.',
        'The learner explains the three essential transformations using the substances and balanced equations and describes the role of carbonate in the cycle.',
        'Sie deutet einen frischen Fall des Abbindens bei veränderter CO₂-Zufuhr oder erklärt, warum bloßes Trocknen von Kalkmörtel keine vollständige chemische Erklärung des Abbindens ist.',
        'The learner interprets a fresh setting case with changed CO₂ supply or explains why drying lime mortar alone is not a complete chemical explanation of setting.',
        'Gezielte echte Bild-/Seitenbindung geprüft: Die tatsächliche neue PDF-Seite 9 und HTML zeigen PNG 51341eaf… und nicht das historisch gebundene JPG 2525c341…. Drei sichtbare Gleichungen sind stofflich ausgeglichen; der neue Salzklassen-Breadcrumb und der Voraussetzungsverweis zu b508 passen. Die eigene unveränderte Zielsemantik und der externe 11bea-Vorläufer werden nicht neu abgeschlossen. HE10.3 physische Seite 25 enthält den Kalkkreislauf ausdrücklich. Dieses neue kandidatenseitige D-Urteil kann eine gezielte neue Bindung begründen, behauptet aber weder die alte gespeicherte D-Seite als aktuell noch bereits eine operative Bindungswiederherstellung.',
        'none'),
    '414489cb-453e-5de4-ab0f-0fc01175e522': (
        'Kalkhaltige Rauchgaswäsche bindet Schwefel aus SO₂; Oxidation ist nötig, damit aus Schwefel(IV) Sulfat mit Schwefel(VI) entsteht. Gips ist Calcium­sulfat-Dihydrat, nicht unverändertes SO₂.',
        'Lime-based flue-gas scrubbing captures sulfur from SO₂; oxidation is needed to produce sulfate with sulfur(VI) from sulfur(IV). Gypsum is calcium sulfate dihydrate, not unchanged SO₂.',
        'Die lernende Person erläutert ein vorgegebenes vereinfachtes Schema und verfolgt den Schwefel vom Rauchgas über die O₂-beteiligte Oxidation bis zu CaSO₄·2H₂O.',
        'The learner explains a supplied simplified diagram and traces sulfur from flue gas through oxidation involving O₂ to CaSO₄·2H₂O.',
        'Sie erklärt an einem neuen Schema mit fehlender Sauerstoffzufuhr, warum eine bloße SO₂-Bindung den behaupteten Sulfat-/Gipsweg nicht vollständig belegt und welche Prozessinformation ergänzt werden muss.',
        'The learner explains in a fresh diagram lacking oxygen supply why SO₂ capture alone does not establish the stated sulfate/gypsum route and identifies the missing process information.',
        'KEEP: Der Text begrenzt den industriellen Vorgang ausdrücklich auf ein vereinfachtes Schema und schließt die fachlich notwendige Oxidation ein. Gipsbildung ist ein einheitlicher Salzbildungs-Anwendungsfall aus HE10.3, physische Seite 25. Es werden keine vollständige Anlagenplanung, atmosphärische Modellierung oder fremden BY-Spezialklauseln verlangt. DE/EN sind gleichwertig und AB2 angemessen. Auf PDF-Seite 10/HTML ist JPG 82054f2a… tatsächlich eingebunden. Seine Gesamtgleichung 2 SO₂ + 2 Ca(OH)₂ + O₂ + 2 H₂O → 2(CaSO₄·2H₂O) erhält S, Ca, H und O; Wasser und O₂ sind benannt. Eine globale Schwefeldioxid-Schadlosigkeitsbehauptung wird nicht gemacht.',
        'create'),
    '1f5ee84f-245a-5a1e-a260-f960f26523e9': (
        'Mineralische Düngesalze liefern Nährstoffionen. Nutzen und Verlust-/Belastungsrisiko hängen gemeinsam vom Pflanzenbedarf, der zugeführten Menge und ionenspezifischen Transportwegen ab.',
        'Mineral fertilizer salts supply nutrient ions. Benefits and loss or pollution risks jointly depend on plant demand, applied amount and ion-specific transport pathways.',
        'Die lernende Person ordnet konkrete Düngesalze als Ionenquellen ein und begründet mit bereitgestellten Bedarfs-, Mengen- und Transportdaten einen einfachen chemischen Nutzen-Risiko-Zusammenhang.',
        'The learner classifies specific fertilizer salts as ion sources and uses supplied demand, amount and transport information to justify a simple chemical benefit-risk relationship.',
        'Sie vergleicht einen neuen Fall mit geändertem Nährstoffion oder Transportweg und erklärt, weshalb passende Düngermenge allein bei unterschiedlichen Boden-/Wasserbedingungen nicht dieselbe Verlustwirkung erwarten lässt.',
        'The learner compares a fresh case with a changed nutrient ion or transport pathway and explains why equal fertilizer amounts do not imply equal losses under different soil or water conditions.',
        'KEEP: Salzklassifikation dient hier demselben begrenzten Anwendungsurteil und ist kein zweites unabhängiges Mammutziel. Vorgegebene Bedarf-/Mengen-/Transportangaben machen die Bewertung prüfbar und vermeiden pauschale Gut/Schlecht-Urteile. HE10.3 physische Seite 25 nennt Düngemittel; das einfache chemische Fallurteil konkretisiert diesen Kontext, ohne die fakultative vollständige Bodenkunde zu beanspruchen. DE/EN und Sek-I-AB2 passen. JPG dc68f2d2… ist auf PDF-Seite 11/HTML sichtbar. Die Stofftransportpfade werden getrennt; das schematische PO₄³⁻-Symbol ist keine Behauptung über die dominierende freie Phosphatspezies im Boden. Wissenschaftliche Leistung oder Feldversuch wird nicht aus dem Bild behauptet.',
        'create'),
}

records = []
for g in inp['goals']:
    vals = judgments[g['goalId']]
    record = {
        '$schema': 'https://skillpilot.com/schemas/goal-description-review/v1/goal-description-review-record.schema.json',
        'schemaVersion': 1,
        'recordId': 'chemie-b010-independent-b-v2-' + g['goalId'],
        'runId': run_id,
        'campaignId': campaign['campaignId'],
        'roundId': campaign['roundId'],
        'bundleFingerprint': bundle['bundleFingerprint'],
        'bookDigest': bundle['bookModelDigest'],
        **{k: g[k] for k in ('goalId', 'goalFingerprint', 'pageFingerprint', 'currentTitleDe', 'currentTitleEn', 'currentDescriptionDe', 'currentDescriptionEn')},
        'decision': 'keep',
        'understandingEvidence': dict(zip(('essentialUnderstandingDe', 'essentialUnderstandingEn', 'observablePerformanceDe', 'observablePerformanceEn', 'transferExpectationDe', 'transferExpectationEn'), vals[:6])),
        'rationale': vals[6],
        'evidenceProfileContract': 'positive-understanding-evidence-v2',
        'evidenceProfileRecommendation': vals[7],
        'recordStatus': 'candidate',
        'reviewAuthority': 'ai_candidate',
    }
    records.append(record)
results = OWN / 'results'
results.mkdir(exist_ok=True)
records_path = results / (batch['batchId'] + '.records.jsonl')
records_path.write_text(''.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) + '\n' for r in records))
parameters = {
    'tool': 'Codex delegated independent reviewer',
    'modelOverride': None,
    'exactRuntimeModelIdentity': 'not exposed',
    'samplingParameters': 'not exposed',
    'blindToRoundA': True,
    'pageInspectionBeforeRecordAssembly': True,
    'timingBoundary': 'run startedAt records actual serialization phase; semantic reading and actual view_image inspections preceded this boundary',
}
parameters_bytes = (json.dumps(parameters, ensure_ascii=False, indent=2) + '\n').encode()
(OWN / 'actual-generation-parameters.json').write_bytes(parameters_bytes)
roles = {'book_model', 'book_pdf', 'book_pdf_render_manifest', 'book_html', 'book_html_render_manifest', 'review_input_json', 'review_input_jsonl', 'review_prompt', 'review_criteria'}
run = {
    '$schema': 'https://skillpilot.com/schemas/goal-evidence/v1/goal-evidence-ai-run-manifest.schema.json',
    'schemaVersion': 1,
    'runId': run_id,
    'campaignId': campaign['campaignId'],
    'roundId': campaign['roundId'],
    'batchId': batch['batchId'],
    'batchInputFingerprint': batch['batchInputFingerprint'],
    'bundleFingerprint': bundle['bundleFingerprint'],
    'bookDigest': bundle['bookModelDigest'],
    'provider': 'OpenAI Codex',
    'model': 'Codex inherited session model; exact runtime identifier not exposed',
    'role': 'subject_reviewer',
    'promptFamilyId': 'goal-description-understanding-evidence-v2',
    'promptFingerprint': campaign['promptFingerprint'],
    'criteriaFingerprint': campaign['criteriaFingerprint'],
    'generationParametersFingerprint': sha(parameters_bytes),
    'independenceGroupId': campaign['independenceGroupId'],
    'blindToOtherRuns': True,
    'goalIds': batch['goalIds'],
    'inputArtifacts': [{ 'role': a['role'], 'digest': a['digest'] } for a in bundle['artifacts'] if a['role'] in roles] + [{'role': 'description_review_batch_input_jsonl', 'digest': batch['batchInputFingerprint']}],
    'startedAt': started,
    'completedAt': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'status': 'completed',
    'outputDigest': sha(records_path.read_bytes()),
    'toolchainVersion': 'goal-description-review-v2',
}
write(results / (batch['batchId'] + '.run.json'), run)

checks = []
for a in bundle['artifacts']:
    p = BUNDLE / a['path']
    actual = sha(p.read_bytes())
    checks.append({'path': str(p.relative_to(ROOT)), 'expected': a['digest'], 'actual': actual, 'match': actual == a['digest']})
freeze = json.loads((AUTHOR / 'prepared.freeze.manifest.json').read_text())
frozen_rows = []
for a in freeze['ownFiles']:
    p = ROOT / a['path']
    actual = hashlib.sha256(p.read_bytes()).hexdigest()
    frozen_rows.append({'path': a['path'], 'actualSHA256': actual, 'match': actual == a['sha256']})
images = []
for g in inp['goals']:
    vis = g['reviewContext']['page']['visualization']
    p = ROOT / 'app/public' / vis['url'].lstrip('/')
    if g['goalId'].startswith('950c73c6'):
        p = AUTHOR / 'prospective-input-tree/app/public' / vis['url'].lstrip('/')
    images.append({'goalId': g['goalId'], 'actualAssetPath': str(p.relative_to(ROOT)), 'expectedDigest': vis['originalDigest'], 'actualDigest': sha(p.read_bytes()), 'match': sha(p.read_bytes()) == vis['originalDigest']})
write(OWN / 'actual-input-byte-verification.receipt.json', {
    'checkedAtUTC': datetime.datetime.now(datetime.timezone.utc).isoformat(),
    'head': subprocess.check_output(['git', 'rev-parse', 'HEAD'], cwd=ROOT, text=True).strip(),
    'authorFrozenFileCount': len(frozen_rows),
    'authorFrozenMismatches': [r for r in frozen_rows if not r['match']],
    'bundleArtifacts': checks,
    'actualImageInputs': images,
    'fourExistingReviewsAreTargetedBindings': True,
    'newScientificClosures': 0,
    'restoredOperativeBindings': 0,
    'humanApproval': False,
    'roundARead': False,
})
assert all(r['match'] for r in checks + images + frozen_rows)
print(f'Wrote {len(records)} independent B description records; all 215 author inputs and 12 bundle artifacts unchanged.')
